// ============================================================================
// GRA SIECIOWA (do 3 osób) – połączenie przeglądarek bezpośrednio przez WebRTC (PeerJS).
// Serwer PeerJS tylko pomaga się znaleźć po kodzie pokoju; potem dane płyną między graczami.
// Gospodarz liczy cały świat (zombie, fale, łup), goście wysyłają mu swoją pozycję i trafienia.
// ============================================================================
import * as THREE from 'three';
import { players, PLAYER_EYE_HEIGHT } from './stan.js';
import { snapshotZombies, syncReplicas } from './zombie.js';
import { lootItems } from './swiat.js';
import { houseAt } from './kolizje.js';
import { createAvatar, removeAvatar, removeAllAvatars } from './gracze.js';

const PREFIX = 'martwa-osada-v1-';
export const MAX_PLAYERS = 3;
const CODE_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const SNAPSHOT_RATE = 1 / 15;
const STATE_RATE = 1 / 20;
const SILENCE_LIMIT = 10000;  // ms bez wiadomości = gracz wyszedł (zamknięta karta, zerwany internet)

export const net = {
    active: false,
    isHost: false,
    myId: 'solo',
    mySlot: 0,
    code: '',
    peer: null,
    conns: new Map(),      // gospodarz: id gościa → połączenie
    hostConn: null,        // gość: połączenie z gospodarzem
    hostStarted: false,
    ready: new Set(),
    timer: 0,
    lastSnapshot: null
};

// Funkcje gry (gra.js) wywoływane na wiadomości z sieci
let H = {};
export function setNetHandlers(handlers) { H = handlers; }

const remotePlayers = new Map();

function addRemotePlayer(id, name, slot) {
    const p = {
        id, name: name || 'Gracz', slot, remote: true,
        position: new THREE.Vector3(slot * 1.6, PLAYER_EYE_HEIGHT, 14),
        yaw: 0, pitch: 0, weapon: 0, flash: false, alive: false, inGame: false, inMenu: false, hp: 100, house: null
    };
    players.push(p);
    remotePlayers.set(id, p);
    createAvatar(p, slot);
    return p;
}

function removeRemotePlayer(id) {
    const p = remotePlayers.get(id);
    if (!p) return;
    remotePlayers.delete(id);
    const i = players.indexOf(p);
    if (i !== -1) players.splice(i, 1);
    removeAvatar(id);
}

export function remotePlayerList() {
    return [...remotePlayers.values()];
}

export function lootMask() {
    let m = 0;
    lootItems.forEach((it, i) => { if (it.active) m |= 1 << i; });
    return m;
}

function randomCode() {
    let s = '';
    for (let i = 0; i < 5; i++) s += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
    return s;
}

async function loadPeer() {
    const mod = await import('peerjs');
    return mod.Peer || mod.default;
}

// Połączenie z serwerem pośredniczącym PeerJS (z własnym identyfikatorem albo losowym)
function openPeer(Peer, id) {
    return new Promise((resolve, reject) => {
        let opened = false;
        const peer = id ? new Peer(id, { debug: 0 }) : new Peer({ debug: 0 });
        const timeout = setTimeout(() => { if (!opened) { peer.destroy(); reject(new Error('timeout')); } }, 15000);
        peer.on('open', () => { opened = true; clearTimeout(timeout); resolve(peer); });
        peer.on('error', (e) => {
            if (opened) return;
            clearTimeout(timeout);
            peer.destroy();
            reject(e);
        });
    });
}

const r2 = (v) => Math.round(v * 100) / 100;
function packPlayer(p) {
    return [p.id, p.name, r2(p.position.x), r2(p.position.y), r2(p.position.z), r2(p.yaw), r2(p.pitch), p.weapon, p.flash ? 1 : 0,
        p.alive ? 1 : 0, p.inGame ? 1 : 0, Math.ceil(p.hp), p.slot, p.inMenu ? 1 : 0];
}

// ----------------------------------------------------------------------------
// Gospodarz
// ----------------------------------------------------------------------------
let guestSeq = 0;

export async function hostGame() {
    const Peer = await loadPeer();
    let lastError = null;
    for (let attempt = 0; attempt < 4 && !net.peer; attempt++) {
        const code = randomCode();
        try {
            net.peer = await openPeer(Peer, PREFIX + code);
            net.code = code;
        } catch (e) {
            lastError = e;
            if (e.type !== 'unavailable-id') break;
        }
    }
    if (!net.peer) throw lastError || new Error('brak-serwera');
    net.active = true;
    net.isHost = true;
    net.myId = 'h';
    net.mySlot = 0;
    net.peer.on('connection', onGuestConnection);
    net.peer.on('disconnected', () => { try { net.peer.reconnect(); } catch (e) {} });
    return net.code;
}

function freeSlot() {
    const used = new Set([...remotePlayers.values()].map(p => p.slot));
    for (let s = 1; s < MAX_PLAYERS; s++) if (!used.has(s)) return s;
    return 1;
}

function onGuestConnection(conn) {
    conn.on('open', () => {
        if (net.conns.size >= MAX_PLAYERS - 1) {
            conn.send({ t: 'pelno' });
            setTimeout(() => conn.close(), 400);
            return;
        }
        const id = 'g' + (++guestSeq);
        conn.pid = id;
        conn.lastSeen = performance.now();
        net.conns.set(id, conn);
        const slot = freeSlot();
        addRemotePlayer(id, conn.metadata?.name, slot);
        conn.send({ t: 'witaj', id, slot, started: net.hostStarted, ...H.worldState() });
        H.peopleChanged?.();
    });
    conn.on('data', (m) => onGuestMessage(conn, m));
    conn.on('close', () => dropGuest(conn));
    conn.on('error', () => dropGuest(conn));
}

function dropGuest(conn) {
    if (!conn.pid || !net.conns.has(conn.pid)) return;
    const p = remotePlayers.get(conn.pid);
    net.conns.delete(conn.pid);
    net.ready.delete(conn.pid);
    removeRemotePlayer(conn.pid);
    H.playerLeft?.(p ? p.name : 'Gracz');
    H.peopleChanged?.();
    checkReady();
    H.checkAllDead?.();
}

function onGuestMessage(conn, m) {
    const id = conn.pid;
    conn.lastSeen = performance.now();
    if (m && m.t === 'pa') return dropGuest(conn);
    const p = remotePlayers.get(id);
    if (!p || !m || !m.t) return;
    switch (m.t) {
        case 'stan':
            p.position.set(m.x, m.y, m.z);
            p.yaw = m.yaw;
            p.pitch = m.pitch;
            p.weapon = m.w;
            p.flash = !!m.f;
            p.inMenu = !!m.m;
            p.hp = m.hp;
            if (m.n && m.n !== p.name) { p.name = String(m.n).slice(0, 14); H.peopleChanged?.(); }
            if (!!m.g !== p.inGame) { p.inGame = !!m.g; H.peopleChanged?.(); checkReady(); }
            if (!!m.a !== p.alive) { p.alive = !!m.a; if (!p.alive) H.checkAllDead?.(); }
            p.house = houseAt(m.x, m.z);
            break;
        case 'traf':
            H.remoteHits?.(id, m.h);
            break;
        case 'strzal':
            broadcast({ ...m, id }, id);
            H.remoteShot?.(id, m);
            break;
        case 'lup': {
            const type = H.remoteLoot?.(m.i);
            if (type) conn.send({ t: 'lupDla', type });
            break;
        }
        case 'gotowy':
            net.ready.add(id);
            checkReady();
            break;
    }
}

export function broadcast(msg, exceptId = null) {
    if (!net.isHost) return;
    for (const [id, conn] of net.conns) {
        if (id !== exceptId && conn.open) conn.send(msg);
    }
}

export function sendTo(id, msg) {
    if (net.isHost) {
        const c = net.conns.get(id);
        if (c && c.open) c.send(msg);
    }
}

export function sendToHost(msg) {
    if (!net.isHost && net.hostConn && net.hostConn.open) net.hostConn.send(msg);
}

// Kolejny poziom rusza, gdy wszyscy obecni w grze kliknęli „gotowy”
function checkReady() {
    if (!net.isHost || !H.isBetweenLevels?.()) return;
    const need = ['h', ...[...remotePlayers.values()].filter(p => p.inGame).map(p => p.id)];
    H.readyChanged?.(need.filter(id => net.ready.has(id)).length, need.length);
    if (need.every(id => net.ready.has(id))) {
        net.ready.clear();
        H.startNextLevelAll?.();
    }
}

export function markReady() {
    if (net.isHost) {
        net.ready.add('h');
        checkReady();
    } else {
        sendToHost({ t: 'gotowy' });
    }
}

export function readyCounts() {
    const need = ['h', ...[...remotePlayers.values()].filter(p => p.inGame).map(p => p.id)];
    return [need.filter(id => net.ready.has(id)).length, need.length];
}

// ----------------------------------------------------------------------------
// Gość
// ----------------------------------------------------------------------------
export async function joinGame(code, name) {
    const Peer = await loadPeer();
    const peer = await openPeer(Peer, null);
    net.peer = peer;
    return new Promise((resolve, reject) => {
        let done = false;
        const fail = (reason) => {
            if (done) return;
            done = true;
            clearTimeout(timeout);
            peer.destroy();
            net.peer = null;
            reject(new Error(reason));
        };
        const timeout = setTimeout(() => fail('nie-ma-gry'), 12000);
        peer.on('error', (e) => { if (e.type === 'peer-unavailable') fail('nie-ma-gry'); });
        const conn = peer.connect(PREFIX + code.toUpperCase(), { reliable: true, serialization: 'json', metadata: { name } });
        conn.on('data', (m) => {
            if (!done) {
                if (m.t === 'pelno') return fail('pelno');
                if (m.t === 'witaj') {
                    done = true;
                    clearTimeout(timeout);
                    net.active = true;
                    net.isHost = false;
                    net.myId = m.id;
                    net.mySlot = m.slot;
                    net.hostConn = conn;
                    net.code = code.toUpperCase();
                    net.hostStarted = m.started;
                    conn.lastSeen = performance.now();
                    resolve(m);
                }
                return;
            }
            conn.lastSeen = performance.now();
            onHostMessage(m);
        });
        conn.on('close', () => { if (done && net.active) { leaveGame(); H.hostLeft?.(); } });
    });
}

function onHostMessage(m) {
    if (!m || !m.t) return;
    switch (m.t) {
        case 'snap': {
            net.lastSnapshot = m;
            syncReplicas(m.z);
            const seen = new Set();
            for (const pp of m.p) {
                const [id, name, x, y, z, yaw, pitch, w, f, a, g, hp, slot, menu] = pp;
                if (id === net.myId) continue;
                seen.add(id);
                let p = remotePlayers.get(id);
                if (!p) { p = addRemotePlayer(id, name, slot); H.peopleChanged?.(); }
                if (p.name !== name) { p.name = name; H.peopleChanged?.(); }
                p.position.set(x, y, z);
                p.yaw = yaw;
                p.pitch = pitch;
                p.weapon = w;
                p.flash = !!f;
                p.alive = !!a;
                p.inGame = !!g;
                p.hp = hp;
                p.inMenu = !!menu;
                p.house = houseAt(x, z);
            }
            for (const id of [...remotePlayers.keys()]) {
                if (!seen.has(id)) { removeRemotePlayer(id); H.peopleChanged?.(); }
            }
            H.applySnapshot?.(m);
            break;
        }
        case 'start': net.hostStarted = true; H.hostStarted?.(); break;
        case 'poziom': net.hostStarted = true; H.levelStart?.(m.level); break;
        case 'koniecPoziomu': H.levelCompleted?.(m.level, m.bonus); break;
        case 'gotowi': H.readyChanged?.(m.r, m.n); break;
        case 'zabity': H.zombieKilled?.(m.id, m.head, m.by); break;
        case 'nagroda': H.reward?.(m.cash, m.head); break;
        case 'cios': H.damage?.(m.dmg); break;
        case 'lupDla': H.lootGranted?.(m.type); break;
        case 'strzal': H.remoteShot?.(m.id, m); break;
        case 'koniec': H.allDead?.(); break;
        case 'restart': H.restart?.(m.mode); break;
        case 'wiadomosc': H.notice?.(m.text); break;
    }
}

// ----------------------------------------------------------------------------
// Co klatkę: gospodarz rozsyła stan świata, gość wysyła swój stan
// ----------------------------------------------------------------------------
export function netUpdate(dt, local) {
    if (!net.active) return;
    const now = performance.now();
    if (net.isHost) {
        for (const conn of [...net.conns.values()]) {
            if (now - conn.lastSeen > SILENCE_LIMIT) { dropGuest(conn); try { conn.close(); } catch (e) {} }
        }
    } else if (net.hostConn && now - net.hostConn.lastSeen > SILENCE_LIMIT) {
        leaveGame();
        H.hostLeft?.();
        return;
    }
    net.timer -= dt;
    if (net.timer > 0) return;
    if (net.isHost) {
        net.timer = SNAPSHOT_RATE;
        if (!net.conns.size) return;
        // w menu gospodarza gra dalej się toczy, więc stan świata idzie zawsze
        const me = { id: 'h', slot: 0, ...local };
        broadcast({
            t: 'snap',
            z: snapshotZombies(),
            p: [packPlayer(me), ...[...remotePlayers.values()].map(packPlayer)],
            ...H.worldState()
        });
    } else {
        net.timer = STATE_RATE;
        sendToHost({
            t: 'stan', x: r2(local.position.x), y: r2(local.position.y), z: r2(local.position.z),
            yaw: r2(local.yaw), pitch: r2(local.pitch), w: local.weapon, f: local.flash ? 1 : 0,
            a: local.alive ? 1 : 0, g: local.inGame ? 1 : 0, hp: Math.ceil(local.hp), m: local.inMenu ? 1 : 0, n: local.name
        });
    }
}

export function leaveGame() {
    try { if (net.peer) net.peer.destroy(); } catch (e) {}
    for (const id of [...remotePlayers.keys()]) removeRemotePlayer(id);
    removeAllAvatars();
    Object.assign(net, { active: false, isHost: false, myId: 'solo', mySlot: 0, code: '', peer: null, hostConn: null, hostStarted: false, lastSnapshot: null });
    net.conns.clear();
    net.ready.clear();
}

// Zamknięcie karty: pożegnanie, żeby inni od razu wiedzieli
window.addEventListener('pagehide', () => {
    if (!net.active) return;
    try {
        if (net.isHost) broadcast({ t: 'wiadomosc', text: 'Gospodarz zamyka grę...' });
        else sendToHost({ t: 'pa' });
        net.peer?.destroy();
    } catch (e) {}
});

// Puls co sekundę niezależnie od klatek – karta w tle (np. wysyłanie linku znajomym) nie zrywa gry
setInterval(() => {
    if (!net.active) return;
    if (net.isHost) broadcast({ t: 'ping' });
    else sendToHost({ t: 'ping' });
}, 1000);
