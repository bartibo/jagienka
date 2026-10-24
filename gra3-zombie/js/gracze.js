// ============================================================================
// INNI GRACZE W GRZE SIECIOWEJ: POSTAĆ OCALAŁEGO Z BRONIĄ, IMIĘ NAD GŁOWĄ,
// SNOP LATARKI W NOCY, BŁYSK PRZY STRZALE I UPADEK, GDY POLEGNIE
// ============================================================================
import * as THREE from 'three';
import { scene } from './grafika.js';
import { makeRig } from './zombie.js';
import { zombieAtlasTextures, muzzleFlashTexture } from './tekstury.js';
import { PLAYER_EYE_HEIGHT } from './stan.js';

// Wygląd kolejnych graczy (kurtka, włosy) – łatwo odróżnić, kto jest kim
const LOOKS = [
    { skin: '#d9a77f', skinDark: '#b98a66', shirt: '#4a5a34', pants: '#2b3a55', shoes: '#2a2018', hair: '#3a2618', eyeColor: '#3a2a1a' },
    { skin: '#e8c0a0', skinDark: '#c79c7c', shirt: '#2f4f78', pants: '#3a3a3a', shoes: '#1c1a18', hair: '#c9a35a', eyeColor: '#2a4a6a' },
    { skin: '#c48e6a', skinDark: '#a0704f', shirt: '#7a2f3f', pants: '#2a2f3a', shoes: '#231d18', hair: '#1a1210', eyeColor: '#2a1a10' }
];
export const PLAYER_COLORS = ['#a3e635', '#60a5fa', '#f472b6'];

export const avatars = new Map();

function nameSprite(name, color) {
    const c = document.createElement('canvas');
    c.width = 256;
    c.height = 64;
    const ctx = c.getContext('2d');
    ctx.font = 'bold 30px Rajdhani, Arial, sans-serif';
    const w = Math.min(240, ctx.measureText(name.slice(0, 14)).width + 28);
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.beginPath();
    ctx.roundRect(128 - w / 2, 12, w, 42, 14);
    ctx.fill();
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(name.slice(0, 14), 128, 33);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthTest: false, transparent: true, toneMapped: false }));
    sprite.scale.set(1.35, 0.34, 1);
    sprite.renderOrder = 20;
    return sprite;
}

let gunGeo = null;
function gunMesh() {
    if (!gunGeo) {
        gunGeo = {
            mat: new THREE.MeshStandardMaterial({ color: 0x1c1f23, metalness: 0.7, roughness: 0.4 }),
            body: new THREE.BoxGeometry(0.075, 0.11, 0.62),
            barrel: new THREE.CylinderGeometry(0.018, 0.018, 0.4, 8).rotateX(Math.PI / 2),
            mag: new THREE.BoxGeometry(0.045, 0.18, 0.07)
        };
    }
    const g = new THREE.Group();
    const body = new THREE.Mesh(gunGeo.body, gunGeo.mat);
    const barrel = new THREE.Mesh(gunGeo.barrel, gunGeo.mat);
    barrel.position.z = 0.5;
    const mag = new THREE.Mesh(gunGeo.mag, gunGeo.mat);
    mag.position.set(0, -0.13, 0.08);
    g.add(body, barrel, mag);
    g.traverse(o => { if (o.isMesh) o.castShadow = true; });
    return g;
}

const flashMaterial = new THREE.SpriteMaterial({ map: muzzleFlashTexture(), color: 0xffd9a0, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, toneMapped: false });
flashMaterial.color.multiplyScalar(5);
const coneGeometry = new THREE.ConeGeometry(1.5, 9, 16, 1, true).translate(0, -4.5, 0).rotateX(-Math.PI / 2);

export function createAvatar(p, slot) {
    const look = LOOKS[slot % LOOKS.length];
    const { map } = zombieAtlasTextures({ ...look, torn: 0, clean: true });
    const material = new THREE.MeshStandardMaterial({ map, roughness: 0.8, bumpMap: map, bumpScale: 0.5 });
    const { mesh, bones } = makeRig(material, true);
    const gun = gunMesh();
    gun.position.set(0.07, 0.1, 0.34);
    bones.chest.add(gun);
    const flash = new THREE.Sprite(flashMaterial);
    flash.scale.setScalar(0.45);
    flash.position.set(0, 0, 0.75);
    flash.visible = false;
    gun.add(flash);
    const cone = new THREE.Mesh(coneGeometry, new THREE.MeshBasicMaterial({
        color: 0xfff1d0, transparent: true, opacity: 0.045, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide
    }));
    cone.position.set(0, 0.02, 0.6);
    cone.visible = false;
    gun.add(cone);
    const label = nameSprite(p.name || 'Gracz', PLAYER_COLORS[slot % PLAYER_COLORS.length]);
    label.position.set(0, 2.15, 0);
    mesh.add(label);
    mesh.position.set(p.position.x, 0, p.position.z);
    mesh.visible = false;
    scene.add(mesh);
    avatars.set(p.id, { p, mesh, bones, gun, flash, cone, label, labelName: p.name, slot, walk: 0, flashTimer: 0, fall: 0 });
}

export function removeAvatar(id) {
    const a = avatars.get(id);
    if (!a) return;
    scene.remove(a.mesh);
    a.label.material.map.dispose();
    a.label.material.dispose();
    a.mesh.material.map.dispose();
    a.mesh.material.dispose();
    avatars.delete(id);
}

export function removeAllAvatars() {
    for (const id of [...avatars.keys()]) removeAvatar(id);
}

// Pozycja wylotu lufy innego gracza (dla smugi pocisku) + błysk
const _tip = new THREE.Vector3();
export function avatarShot(id) {
    const a = avatars.get(id);
    if (!a) return null;
    a.flash.visible = true;
    a.flash.material.rotation = Math.random() * Math.PI;
    a.flashTimer = 0.05;
    a.flash.getWorldPosition(_tip);
    return _tip;
}

export function updateAvatars(dt, time, night) {
    const k = Math.min(1, dt * 12);
    for (const a of avatars.values()) {
        const p = a.p;
        if (a.labelName !== p.name) {
            a.mesh.remove(a.label);
            a.label.material.map.dispose();
            a.label = nameSprite(p.name || 'Gracz', PLAYER_COLORS[a.slot % PLAYER_COLORS.length]);
            a.label.position.set(0, 2.15, 0);
            a.mesh.add(a.label);
            a.labelName = p.name;
        }
        a.mesh.visible = !!p.inGame;
        if (!p.inGame) continue;

        const pos = a.mesh.position;
        const tx = p.position.x, ty = Math.max(0, p.position.y - PLAYER_EYE_HEIGHT), tz = p.position.z;
        const moved = Math.hypot(tx - pos.x, tz - pos.z) * k;
        pos.x += (tx - pos.x) * k;
        pos.y += (ty - pos.y) * k;
        pos.z += (tz - pos.z) * k;
        const speed = moved / Math.max(dt, 0.001);
        let dr = (p.yaw + Math.PI) - a.mesh.rotation.y;
        dr = Math.atan2(Math.sin(dr), Math.cos(dr));
        a.mesh.rotation.y += dr * k;

        // polegnięcie: przewraca się na plecy, po odrodzeniu wstaje
        a.fall = THREE.MathUtils.lerp(a.fall, p.alive ? 0 : 1, Math.min(1, dt * 4));
        a.mesh.rotation.x = -a.fall * (Math.PI / 2 - 0.1);
        pos.y += a.fall * 0.12;

        const b = a.bones;
        const moving = speed > 0.4 && p.alive;
        if (moving) a.walk += dt * Math.min(speed, 11) * 1.25;
        const s = Math.sin(a.walk), c = Math.cos(a.walk);
        const amp = moving ? Math.min(1, speed / 6) : 0;
        b.thighL.rotation.x = -s * 0.65 * amp - 0.05;
        b.thighR.rotation.x = s * 0.65 * amp - 0.05;
        b.shinL.rotation.x = Math.max(0, -c) * 0.9 * amp + 0.08;
        b.shinR.rotation.x = Math.max(0, c) * 0.9 * amp + 0.08;
        b.hips.position.y = 0.95 + Math.abs(s) * 0.035 * amp - 0.02;
        b.hips.rotation.y = s * 0.08 * amp;
        // trzyma broń przed sobą i patrzy tam, gdzie celuje
        const pitch = p.pitch || 0;
        b.spine.rotation.x = 0.06 + amp * 0.08;
        b.chest.rotation.x = -pitch * 0.55;
        b.head.rotation.x = -pitch * 0.35 + Math.sin(time * 1.7) * 0.02;
        // ręce zbiegają się do broni przed piersią (z > 0 dla lewej, z < 0 dla prawej = do środka)
        b.upperArmR.rotation.set(-0.75, 0, -0.2);
        b.forearmR.rotation.set(-0.8, 0, 0);
        b.upperArmL.rotation.set(-1.1, 0, 0.55);
        b.forearmL.rotation.set(-0.35, 0, 0);
        a.gun.rotation.x = 0;

        a.cone.visible = night && p.flash && p.alive;
        if (a.flashTimer > 0) {
            a.flashTimer -= dt;
            if (a.flashTimer <= 0) a.flash.visible = false;
        }
    }
}
