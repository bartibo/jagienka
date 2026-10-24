// ============================================================================
// ZOMBIE 3D: SZKIELET Z KOŚĆMI + ATLAS TEKSTUR (jedno rysowanie na zombie),
// ANIMACJA CHODU / BIEGU / ATAKU / UPADKU, AI Z OMIJANIEM ŚCIAN I WEJŚCIEM PRZEZ DRZWI
// ============================================================================
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { scene } from './grafika.js';
import { zombieTypes, gameState, PLAYER_RADIUS, players } from './stan.js';
import { ATLAS, zombieAtlasTextures } from './tekstury.js';
import { resolveWorldCollisions, segmentBlocked, houseAt } from './kolizje.js';
import { houseZones } from './swiat.js';

// Kości: [nazwa, rodzic, przesunięcie względem rodzica] – poza spoczynkowa: ręce w dół
const BONES = [
    ['root', -1, [0, 0, 0]],
    ['hips', 0, [0, 0.95, 0]],
    ['spine', 1, [0, 0.14, 0]],
    ['chest', 2, [0, 0.24, 0]],
    ['neck', 3, [0, 0.24, 0]],
    ['head', 4, [0, 0.09, 0]],
    ['upperArmL', 3, [-0.21, 0.19, 0]],
    ['forearmL', 6, [0, -0.29, 0]],
    ['handL', 7, [0, -0.26, 0]],
    ['upperArmR', 3, [0.21, 0.19, 0]],
    ['forearmR', 9, [0, -0.29, 0]],
    ['handR', 10, [0, -0.26, 0]],
    ['thighL', 1, [-0.1, -0.04, 0]],
    ['shinL', 12, [0, -0.43, 0]],
    ['footL', 13, [0, -0.42, 0]],
    ['thighR', 1, [0.1, -0.04, 0]],
    ['shinR', 15, [0, -0.43, 0]],
    ['footR', 16, [0, -0.42, 0]]
];
const B = Object.fromEntries(BONES.map((b, i) => [b[0], i]));

let sharedGeometry = null;

// Buduje ciało z prostych brył; każda bryła należy w całości do jednej kości i do jednego pola atlasu
function buildBodyGeometry() {
    const parts = [];
    const add = (geo, bone, region, x, y, z, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1) => {
        geo.applyMatrix4(new THREE.Matrix4().compose(
            new THREE.Vector3(x, y, z),
            new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz)),
            new THREE.Vector3(sx, sy, sz)
        ));
        parts.push({ geo, bone, region });
    };
    const caps = (r, l) => new THREE.CapsuleGeometry(r, l, 4, 10);
    const sph = (r, ws = 14, hs = 10) => new THREE.SphereGeometry(r, ws, hs);

    add(sph(0.17), B.hips, 'pants', 0, 0.93, 0, 0, 0, 0, 1, 0.75, 0.72);
    add(caps(0.14, 0.12), B.spine, 'shirt', 0, 1.12, 0.01, 0, 0, 0, 1.15, 1, 0.85);
    add(caps(0.16, 0.16), B.chest, 'shirt', 0, 1.38, 0, 0, 0, 0, 1.25, 1, 0.78);
    add(sph(0.075), B.chest, 'shirt', -0.2, 1.5, 0);
    add(sph(0.075), B.chest, 'shirt', 0.2, 1.5, 0);
    for (const [px, rz] of [[-0.09, 0.15], [0.03, -0.1], [0.12, 0.2]]) {
        add(new THREE.BoxGeometry(0.1, 0.17, 0.012), B.spine, 'shirt', px, 0.97, 0.125, 0.15, 0, rz);   // strzępy koszuli
    }
    add(new THREE.CylinderGeometry(0.05, 0.06, 0.14, 10), B.neck, 'skin', 0, 1.6, 0);
    add(sph(0.118, 18, 14), B.head, 'skin', 0, 1.755, 0.01, 0, 0, 0, 1, 1.16, 1.08);
    add(new THREE.BoxGeometry(0.12, 0.045, 0.1), B.head, 'skin', 0, 1.645, 0.045, 0.3);                // opadnięta szczęka
    add(new THREE.BoxGeometry(0.095, 0.03, 0.02), B.head, 'mouth', 0, 1.672, 0.103);
    add(new THREE.BoxGeometry(0.17, 0.03, 0.05), B.head, 'skin', 0, 1.79, 0.092, -0.2);                // łuk brwiowy
    add(new THREE.BoxGeometry(0.03, 0.05, 0.04), B.head, 'skin', 0, 1.74, 0.115, 0.3);                 // nos
    add(sph(0.021, 8, 6), B.head, 'eyes', -0.042, 1.762, 0.098);
    add(sph(0.021, 8, 6), B.head, 'eyes', 0.042, 1.762, 0.098);
    add(new THREE.BoxGeometry(0.02, 0.05, 0.04), B.head, 'skin', -0.112, 1.75, 0);
    add(new THREE.BoxGeometry(0.02, 0.05, 0.04), B.head, 'skin', 0.112, 1.75, 0);
    add(new THREE.SphereGeometry(0.116, 14, 8, 0, Math.PI * 2, 0, Math.PI * 0.42), B.head, 'hair', 0, 1.775, -0.008, -0.2, 0, 0, 1.03, 1.15, 1.1);
    for (const s of [-1, 1]) {
        const side = s < 0 ? 'L' : 'R';
        add(caps(0.055, 0.2), B['upperArm' + side], 'shirt', s * 0.23, 1.38, 0);
        add(caps(0.045, 0.2), B['forearm' + side], 'skin', s * 0.23, 1.1, 0);
        add(new THREE.BoxGeometry(0.075, 0.1, 0.035), B['hand' + side], 'skin', s * 0.23, 0.91, 0.005);
        add(new THREE.BoxGeometry(0.06, 0.07, 0.025), B['hand' + side], 'skin', s * 0.23, 0.84, 0.02, 0.35);   // palce
        add(caps(0.078, 0.3), B['thigh' + side], 'pants', s * 0.1, 0.7, 0);
        add(caps(0.062, 0.32), B['shin' + side], 'pants', s * 0.1, 0.27, 0);
        add(new THREE.BoxGeometry(0.1, 0.07, 0.25), B['foot' + side], 'shoes', s * 0.1, 0.035, 0.05);
    }

    const geos = [];
    const ranges = [];
    for (const p of parts) {
        let g = p.geo.index ? p.geo.toNonIndexed() : p.geo;
        for (const name of Object.keys(g.attributes)) {
            if (!['position', 'normal', 'uv'].includes(name)) g.deleteAttribute(name);
        }
        // UV → pole atlasu (z marginesem, żeby kolory nie przeciekały)
        const [u0, v0, uw, vh] = ATLAS[p.region];
        const m = 0.012;
        const uv = g.attributes.uv;
        for (let i = 0; i < uv.count; i++) {
            uv.setXY(i, u0 + m + uv.getX(i) * (uw - 2 * m), v0 + m + uv.getY(i) * (vh - 2 * m));
        }
        geos.push(g);
        ranges.push([g.attributes.position.count, p.bone]);
    }
    const geo = mergeGeometries(geos, false);
    const total = geo.attributes.position.count;
    const skinIndex = new Uint16Array(total * 4);
    const skinWeight = new Float32Array(total * 4);
    let v = 0;
    for (const [count, bone] of ranges) {
        for (let i = 0; i < count; i++, v++) {
            skinIndex[v * 4] = bone;
            skinWeight[v * 4] = 1;
        }
    }
    geo.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(skinIndex, 4));
    geo.setAttribute('skinWeight', new THREE.Float32BufferAttribute(skinWeight, 4));
    return geo;
}

// Każdy typ w kilku wersjach ubrania, żeby tłum nie wyglądał jak klony
const VARIANTS = {
    walker: [{}, { shirt: '#6e6a50', pants: '#3a3326' }, { shirt: '#8a8f96', pants: '#2a3038', hair: '#5a5048' }, { shirt: '#5e3a3a', pants: '#3b3b3b' }],
    runner: [{}, { shirt: '#3d4a3a', pants: '#24282e' }, { shirt: '#8a7a5a', pants: '#2b2622', hair: '#6a4a2a' }],
    tank: [{}, { shirt: '#2e4a5a', pants: '#2a2a22' }]
};
const typeMaterials = {};
function materialFor(typeKey, variant) {
    const key = typeKey + variant;
    if (typeMaterials[key]) return typeMaterials[key];
    const cfg = { ...zombieTypes[typeKey], ...VARIANTS[typeKey][variant] };
    const { map, emissive } = zombieAtlasTextures(cfg);
    const mat = new THREE.MeshStandardMaterial({
        map, emissiveMap: emissive, emissive: 0xffffff, emissiveIntensity: 1.2,
        roughness: 0.82, metalness: 0.0, bumpMap: map, bumpScale: 1.2
    });
    typeMaterials[key] = mat;
    return mat;
}

// Strefy trafień przypięte do kości (niewidoczne, tylko do promienia strzału)
const HITBOXES = [
    ['head', [0.26, 0.28, 0.27], [0, 0.1, 0.02], true],
    ['chest', [0.44, 0.42, 0.3], [0, 0.08, 0], false],
    ['spine', [0.38, 0.3, 0.27], [0, 0.05, 0], false],
    ['hips', [0.36, 0.22, 0.25], [0, -0.03, 0], false],
    ['thighL', [0.17, 0.44, 0.17], [0, -0.21, 0], false],
    ['thighR', [0.17, 0.44, 0.17], [0, -0.21, 0], false],
    ['shinL', [0.14, 0.44, 0.14], [0, -0.21, 0], false],
    ['shinR', [0.14, 0.44, 0.14], [0, -0.21, 0], false],
    ['upperArmL', [0.13, 0.3, 0.13], [0, -0.14, 0], false],
    ['upperArmR', [0.13, 0.3, 0.13], [0, -0.14, 0], false],
    ['forearmL', [0.12, 0.32, 0.12], [0, -0.14, 0], false],
    ['forearmR', [0.12, 0.32, 0.12], [0, -0.14, 0], false]
];
const hitboxMaterial = new THREE.MeshBasicMaterial({ visible: false });
const hitboxGeos = HITBOXES.map(([, size]) => new THREE.BoxGeometry(...size));

export const zombies = [];
export const dyingZombies = [];
export const zombieHitboxes = [];   // płaska lista do raycastu (odświeżana przy zmianie składu)
const pools = { walker: [], runner: [], tank: [] };

function createZombie(typeKey) {
    if (!sharedGeometry) sharedGeometry = buildBodyGeometry();
    const bones = BONES.map(([name, , off]) => {
        const b = new THREE.Bone();
        b.name = name;
        b.position.set(...off);
        return b;
    });
    BONES.forEach(([, parent], i) => { if (parent >= 0) bones[parent].add(bones[i]); });
    const mesh = new THREE.SkinnedMesh(sharedGeometry, materialFor(typeKey, 0));
    mesh.add(bones[0]);
    mesh.updateMatrixWorld(true);
    mesh.bind(new THREE.Skeleton(bones));
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.rotation.order = 'YXZ';
    mesh.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 1.0, 0), 1.5);

    const z = { mesh, type: typeKey, bones: {}, hitboxes: [] };
    bones.forEach(b => { z.bones[b.name] = b; });
    HITBOXES.forEach(([bone, , offset, isHead], i) => {
        const hb = new THREE.Mesh(hitboxGeos[i], hitboxMaterial);
        hb.position.set(...offset);
        hb.userData = { zombieRef: z, isHead };
        z.bones[bone].add(hb);
        z.hitboxes.push(hb);
    });
    return z;
}

const GAIT = {
    walker: { stride: 0.5, knee: 0.75, armReach: -1.45, armSwing: 0.14, lean: 0.36, bob: 0.03, cadence: 2.4 },
    runner: { stride: 0.85, knee: 1.25, armReach: -0.35, armSwing: 0.85, lean: 0.42, bob: 0.06, cadence: 2.05 },
    tank:   { stride: 0.4, knee: 0.55, armReach: -0.3, armSwing: 0.3, lean: 0.22, bob: 0.05, cadence: 2.7 }
};

function resetPose(z) {
    for (const name in z.bones) {
        z.bones[name].rotation.set(0, 0, 0);
        z.bones[name].scale.set(1, 1, 1);
    }
    z.bones.hips.position.y = 0.95;
}

export function spawnZombie(typeKey, x, zPos, levelBonusHp) {
    const cfg = zombieTypes[typeKey];
    const z = pools[typeKey].pop() || createZombie(typeKey);
    resetPose(z);
    z.mesh.material = materialFor(typeKey, Math.floor(Math.random() * VARIANTS[typeKey].length));
    const maxHp = Math.round(cfg.hp * levelBonusHp);
    Object.assign(z, {
        hp: maxHp,
        maxHp,
        baseSpeed: cfg.speed * (0.92 + Math.random() * 0.16),
        damage: cfg.damage,
        reward: cfg.reward,
        radius: 0.42 * cfg.scale,
        walkPhase: Math.random() * Math.PI * 2,
        attackCooldown: 0,
        attackAnim: 0,
        flinch: 0,
        headTilt: (Math.random() - 0.5) * (typeKey === 'walker' ? 0.7 : 0.3),
        limp: typeKey === 'walker' ? 0.55 + Math.random() * 0.35 : 1,
        sidestep: 0,
        sidestepDir: Math.random() < 0.5 ? -1 : 1,
        rise: 1.3,
        groanTimer: 2 + Math.random() * 6,
        dead: false
    });
    z.mesh.scale.setScalar(cfg.scale);
    z.mesh.position.set(x, -1.9 * cfg.scale, zPos);
    z.mesh.rotation.set(0, Math.random() * Math.PI * 2, 0);
    z.mesh.visible = true;
    scene.add(z.mesh);
    zombies.push(z);
    rebuildHitboxList();
    return z;
}

export function rebuildHitboxList() {
    zombieHitboxes.length = 0;
    for (const z of zombies) for (const hb of z.hitboxes) zombieHitboxes.push(hb);
}

export function removeAllZombies() {
    for (const z of zombies) { scene.remove(z.mesh); pools[z.type].push(z); }
    for (const d of dyingZombies) { scene.remove(d.z.mesh); pools[d.z.type].push(d.z); }
    zombies.length = 0;
    dyingZombies.length = 0;
    rebuildHitboxList();
}

// Odepchnięcie i drgnięcie po trafieniu
export function hitReaction(z, pushDir, push) {
    z.flinch = Math.min(1, z.flinch + 0.6);
    z.mesh.position.addScaledVector(pushDir, push);
}

export function startDeath(z, wasHeadshot) {
    const idx = zombies.indexOf(z);
    if (idx === -1) return;
    zombies.splice(idx, 1);
    rebuildHitboxList();
    if (wasHeadshot) z.bones.head.scale.setScalar(0.001);
    z.dead = true;
    dyingZombies.push({
        z,
        t: 0,
        dir: wasHeadshot || Math.random() < 0.5 ? -1 : 1,
        twist: (Math.random() - 0.5) * 0.8,
        armL: Math.random() * 1.5,
        armR: Math.random() * 1.5
    });
}

// ----------------------------------------------------------------------------
// AI: najbliższy gracz, przejście przez drzwi, omijanie przeszkód, rozpychanie się
// ----------------------------------------------------------------------------
const _toTarget = new THREE.Vector3();
const _prev = new THREE.Vector3();

function nearestPlayer(pos) {
    let best = null, bestD = Infinity;
    for (const p of players) {
        if (!p.alive) continue;
        const d = (p.position.x - pos.x) ** 2 + (p.position.z - pos.z) ** 2;
        if (d < bestD) { bestD = d; best = p; }
    }
    return best;
}

// Czy odcinek przecina prostokąt domu (powiększony o margines)?
function segmentHitsHouse(ax, az, bx, bz, h, m) {
    const minX = h.minX - m, maxX = h.maxX + m, minZ = h.minZ - m, maxZ = h.maxZ + m;
    const dx = bx - ax, dz = bz - az;
    let t0 = 0, t1 = 1;
    for (const [p, d, lo, hi] of [[ax, dx, minX, maxX], [az, dz, minZ, maxZ]]) {
        if (Math.abs(d) < 1e-6) {
            if (p < lo || p > hi) return false;
        } else {
            let ta = (lo - p) / d, tb = (hi - p) / d;
            if (ta > tb) [ta, tb] = [tb, ta];
            t0 = Math.max(t0, ta);
            t1 = Math.min(t1, tb);
            if (t0 > t1) return false;
        }
    }
    return true;
}

// Dom na drodze do celu → idź do tego narożnika, z którego droga do celu jest najkrótsza
const _corner = { x: 0, z: 0 };
function detour(zp, tgt, skipHouse) {
    for (const h of houseZones) {
        if (h === skipHouse) continue;
        if (!segmentHitsHouse(zp.x, zp.z, tgt.x, tgt.z, h, 0.7)) continue;
        let best = null, bestLen = Infinity;
        for (const cx of [h.minX - 1.9, h.maxX + 1.9]) {
            for (const cz of [h.minZ - 1.9, h.maxZ + 1.9]) {
                const near = Math.hypot(cx - zp.x, cz - zp.z);
                if (near < 1.0 || segmentHitsHouse(zp.x, zp.z, cx, cz, h, 0.5)) continue;   // już tu stoi albo narożnik zasłonięty
                const blockedAfter = segmentHitsHouse(cx, cz, tgt.x, tgt.z, h, 0.5) ? 40 : 0;
                const len = near + Math.hypot(tgt.x - cx, tgt.z - cz) + blockedAfter;
                if (len < bestLen) { bestLen = len; best = [cx, cz]; }
            }
        }
        if (best) {
            _corner.x = best[0];
            _corner.z = best[1];
            return _corner;
        }
    }
    return tgt;
}

function waypoint(z, player) {
    const zp = z.mesh.position;
    const zh = houseAt(zp.x, zp.z);
    const ph = player.house;
    if (zh === ph) return zh ? player.position : detour(zp, player.position, null);
    const h = zh || ph;
    const d = h.door;
    const rx = zp.x - d.x, rz = zp.z - d.z;
    const along = rx * d.nx + rz * d.nz;            // > 0 na zewnątrz
    const lateral = Math.abs(rx * d.nz - rz * d.nx);
    const inCorridor = lateral < 0.95 && along > -1.6 && along < 2.2;
    if (zh) {
        // zombie w innym domku niż gracz: najpierw stań na wprost drzwi, potem wyjdź
        return lateral < 0.9 ? { x: d.x + d.nx * 2.2, z: d.z + d.nz * 2.2 } : { x: d.x - d.nx * 1.3, z: d.z - d.nz * 1.3 };
    }
    if (inCorridor) return { x: d.x - d.nx * 1.8, z: d.z - d.nz * 1.8 };
    return detour(zp, { x: d.x + d.nx * 1.9, z: d.z + d.nz * 1.9 }, null);
}

export function updateZombies(dt, time, callbacks) {
    for (let i = 0; i < zombies.length; i++) {
        const z = zombies[i];
        const pos = z.mesh.position;
        const cfg = zombieTypes[z.type];
        const gait = GAIT[z.type];

        // wyłanianie się spod ziemi
        if (z.rise > 0) {
            z.rise -= dt;
            const k = 1 - Math.max(0, z.rise) / 1.3;
            pos.y = (-1.9 + 1.9 * (1 - (1 - k) * (1 - k))) * cfg.scale;
            z.bones.upperArmL.rotation.x = -2.6 + k * 1.2;
            z.bones.upperArmR.rotation.x = -2.4 + k * 1.1;
            z.bones.spine.rotation.x = 0.4 * (1 - k);
            if (z.rise <= 0) pos.y = 0;
            continue;
        }

        const player = nearestPlayer(pos);
        if (!player) continue;
        const tgt = waypoint(z, player);
        _toTarget.set(tgt.x - pos.x, 0, tgt.z - pos.z);
        const distT = _toTarget.length();
        const dxP = player.position.x - pos.x, dzP = player.position.z - pos.z;
        const dist = Math.hypot(dxP, dzP);
        if (distT > 0.01) _toTarget.divideScalar(distT);

        const speed = z.baseSpeed * gameState.nightAggroFactor * (z.flinch > 0.3 ? 0.55 : 1);
        let moving = false;
        if (dist > z.radius + PLAYER_RADIUS + 0.25 || tgt !== player.position) {
            _prev.copy(pos);
            let mx = _toTarget.x, mz = _toTarget.z;
            if (z.sidestep > 0) {
                z.sidestep -= dt;
                mx = mx * 0.35 - _toTarget.z * z.sidestepDir;
                mz = mz * 0.35 + _toTarget.x * z.sidestepDir;
                const l = Math.hypot(mx, mz) || 1;
                mx /= l; mz /= l;
            }
            pos.x += mx * speed * dt;
            resolveWorldCollisions(pos, z.radius);
            pos.z += mz * speed * dt;
            resolveWorldCollisions(pos, z.radius);
            const moved = Math.hypot(pos.x - _prev.x, pos.z - _prev.z);
            if (moved < speed * dt * 0.3 && z.sidestep <= 0) {
                z.sidestep = 0.7 + Math.random() * 0.6;
                if (Math.random() < 0.3) z.sidestepDir *= -1;
            }
            moving = true;
        }

        // obrót w stronę celu (płynnie)
        const face = dist < 4 && tgt === player.position ? Math.atan2(dxP, dzP) : Math.atan2(_toTarget.x, _toTarget.z);
        let dr = face - z.mesh.rotation.y;
        dr = Math.atan2(Math.sin(dr), Math.cos(dr));
        z.mesh.rotation.y += dr * Math.min(1, dt * 8);

        // rozpychanie się zombie
        for (let j = i + 1; j < zombies.length; j++) {
            const z2 = zombies[j];
            const dx = pos.x - z2.mesh.position.x;
            const dz = pos.z - z2.mesh.position.z;
            const minD = z.radius + z2.radius;
            if (Math.abs(dx) > minD || Math.abs(dz) > minD) continue;
            const dSq = dx * dx + dz * dz;
            if (dSq < minD * minD && dSq > 0.0001) {
                const dVal = Math.sqrt(dSq);
                const push = (minD - dVal) * 0.5 / dVal;
                pos.x += dx * push;
                pos.z += dz * push;
                z2.mesh.position.x -= dx * push;
                z2.mesh.position.z -= dz * push;
            }
        }

        animateZombie(z, gait, dt, moving ? speed : 0, time);

        z.groanTimer -= dt;
        if (z.groanTimer <= 0) {
            z.groanTimer = 3 + Math.random() * 7;
            if (dist < 30 && callbacks.groan) callbacks.groan(z, dist);
        }

        if (z.attackCooldown > 0) z.attackCooldown -= dt;
        if (dist <= z.radius + PLAYER_RADIUS + 0.55 && z.attackCooldown <= 0 && !segmentBlocked(pos.x, pos.z, player.position.x, player.position.z)) {
            z.attackCooldown = 1.05;
            z.attackAnim = 0.4;
            if (callbacks.attack) callbacks.attack(z, player);
        }
    }

    // upadek pokonanych zombie
    for (let i = dyingZombies.length - 1; i >= 0; i--) {
        const d = dyingZombies[i];
        const z = d.z;
        d.t += dt;
        const p = Math.min(1, d.t / 0.75);
        const fall = p * p;
        z.mesh.rotation.x = d.dir * fall * (Math.PI / 2 - 0.08);
        z.mesh.rotation.z = d.twist * fall;
        // leży na ziemi, po chwili zapada się w nią
        z.mesh.position.y = fall * 0.1 * zombieTypes[z.type].scale - Math.max(0, d.t - 4.5) * 0.25;
        const b = z.bones;
        b.shinL.rotation.x = THREE.MathUtils.lerp(b.shinL.rotation.x, 0.9 * (1 - fall) + 0.2, dt * 6);
        b.shinR.rotation.x = THREE.MathUtils.lerp(b.shinR.rotation.x, 0.6 * (1 - fall) + 0.1, dt * 6);
        b.thighL.rotation.x = THREE.MathUtils.lerp(b.thighL.rotation.x, -0.3, dt * 4);
        b.upperArmL.rotation.x = THREE.MathUtils.lerp(b.upperArmL.rotation.x, -d.armL * d.dir - 0.5, dt * 5);
        b.upperArmR.rotation.x = THREE.MathUtils.lerp(b.upperArmR.rotation.x, -d.armR * d.dir - 0.3, dt * 5);
        b.upperArmL.rotation.z = THREE.MathUtils.lerp(b.upperArmL.rotation.z, -0.9, dt * 4);
        b.upperArmR.rotation.z = THREE.MathUtils.lerp(b.upperArmR.rotation.z, 0.9, dt * 4);
        b.spine.rotation.x = THREE.MathUtils.lerp(b.spine.rotation.x, 0, dt * 5);
        b.head.rotation.y = THREE.MathUtils.lerp(b.head.rotation.y, 0.6, dt * 3);
        if (d.t > 6.5) {
            scene.remove(z.mesh);
            pools[z.type].push(z);
            dyingZombies.splice(i, 1);
        }
    }
}

function animateZombie(z, gait, dt, speed, time) {
    const b = z.bones;
    if (speed > 0) z.walkPhase += dt * speed * gait.cadence;
    const ph = z.walkPhase;
    const s = Math.sin(ph), c = Math.cos(ph);
    const amp = speed > 0 ? 1 : 0.15;
    z.flinch = Math.max(0, z.flinch - dt * 3);
    if (z.attackAnim > 0) z.attackAnim = Math.max(0, z.attackAnim - dt);
    const atk = z.attackAnim > 0 ? Math.sin((1 - z.attackAnim / 0.4) * Math.PI) : 0;

    b.thighL.rotation.x = -s * gait.stride * amp * z.limp;
    b.thighR.rotation.x = s * gait.stride * amp;
    b.shinL.rotation.x = Math.max(0, -c) * gait.knee * z.limp * amp + 0.15;
    b.shinR.rotation.x = Math.max(0, c) * gait.knee * amp + 0.15;
    b.thighL.rotation.x -= 0.1;
    b.thighR.rotation.x -= 0.1;
    b.footL.rotation.x = -b.shinL.rotation.x * 0.25;
    b.footR.rotation.x = -b.shinR.rotation.x * 0.25;
    b.hips.position.y = 0.95 + Math.abs(s) * gait.bob * amp - 0.02;
    b.hips.rotation.y = s * 0.12 * amp;
    b.hips.rotation.z = s * 0.05 * amp * (2 - z.limp);

    b.spine.rotation.x = gait.lean + atk * 0.3 - z.flinch * 0.5;
    b.chest.rotation.x = gait.lean * 0.4 - z.flinch * 0.3;
    b.chest.rotation.y = -s * 0.12 * amp;
    b.head.rotation.z = z.headTilt + Math.sin(time * 1.3 + ph) * 0.05;
    b.head.rotation.x = -gait.lean * 0.9 + Math.sin(ph * 2) * 0.05 - z.flinch * 0.4;
    b.neck.rotation.x = -gait.lean * 0.3;

    const jitter = Math.sin(time * 7 + ph * 3) * 0.04;
    if (z.type === 'runner') {
        b.upperArmL.rotation.x = gait.armReach + s * gait.armSwing - atk * 1.8;
        b.upperArmR.rotation.x = gait.armReach - s * gait.armSwing - atk * 1.8;
        b.forearmL.rotation.x = -1.2;
        b.forearmR.rotation.x = -1.2;
    } else {
        b.upperArmL.rotation.x = gait.armReach + c * gait.armSwing * amp + jitter - atk * 1.0;
        b.upperArmR.rotation.x = gait.armReach - c * gait.armSwing * amp - jitter - atk * 1.0;
        b.forearmL.rotation.x = -0.35 + atk * 0.3;
        b.forearmR.rotation.x = -0.25 + atk * 0.3;
    }
    b.upperArmL.rotation.z = -0.12;
    b.upperArmR.rotation.z = 0.12;
    b.handL.rotation.x = 0.35;
    b.handR.rotation.x = 0.35;
}
