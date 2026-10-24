// ============================================================================
// EFEKTY: KROPLE KRWI, PYŁ I ISKRY (instancje – jedno rysowanie na rodzaj),
// PLAMY KRWI, DZIURY PO KULACH, SMUGI POCISKÓW I DYM Z LUFY
// ============================================================================
import * as THREE from 'three';
import { scene } from './grafika.js';
import { bloodSplatTexture, bulletHoleTexture, smokeTexture } from './tekstury.js';

class ParticleSystem {
    constructor(capacity, geometry, material, gravity, drag) {
        this.mesh = new THREE.InstancedMesh(geometry, material, capacity);
        this.mesh.count = 0;
        this.mesh.frustumCulled = false;
        this.mesh.castShadow = false;
        this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
        this.mesh.setColorAt(0, new THREE.Color());
        scene.add(this.mesh);
        this.capacity = capacity;
        this.gravity = gravity;
        this.drag = drag;
        this.n = 0;
        this.pos = new Float32Array(capacity * 3);
        this.vel = new Float32Array(capacity * 3);
        this.life = new Float32Array(capacity);
        this.maxLife = new Float32Array(capacity);
        this.size = new Float32Array(capacity);
        this.colors = new Float32Array(capacity * 3);
        this._m = new THREE.Matrix4();
        this._c = new THREE.Color();
    }

    emit(x, y, z, vx, vy, vz, life, size, color) {
        let i = this.n;
        if (i >= this.capacity) i = Math.floor(Math.random() * this.capacity);
        else this.n++;
        this.pos[i * 3] = x; this.pos[i * 3 + 1] = y; this.pos[i * 3 + 2] = z;
        this.vel[i * 3] = vx; this.vel[i * 3 + 1] = vy; this.vel[i * 3 + 2] = vz;
        this.life[i] = life;
        this.maxLife[i] = life;
        this.size[i] = size;
        this.colors[i * 3] = color.r; this.colors[i * 3 + 1] = color.g; this.colors[i * 3 + 2] = color.b;
    }

    update(dt) {
        const p = this.pos, v = this.vel;
        let i = 0;
        while (i < this.n) {
            this.life[i] -= dt;
            if (this.life[i] <= 0) {
                // usuwanie przez zamianę z ostatnią cząstką
                const last = --this.n;
                p[i * 3] = p[last * 3]; p[i * 3 + 1] = p[last * 3 + 1]; p[i * 3 + 2] = p[last * 3 + 2];
                v[i * 3] = v[last * 3]; v[i * 3 + 1] = v[last * 3 + 1]; v[i * 3 + 2] = v[last * 3 + 2];
                this.life[i] = this.life[last];
                this.maxLife[i] = this.maxLife[last];
                this.size[i] = this.size[last];
                this.colors[i * 3] = this.colors[last * 3];
                this.colors[i * 3 + 1] = this.colors[last * 3 + 1];
                this.colors[i * 3 + 2] = this.colors[last * 3 + 2];
                continue;
            }
            v[i * 3 + 1] -= this.gravity * dt;
            const k = Math.max(0, 1 - this.drag * dt);
            v[i * 3] *= k; v[i * 3 + 2] *= k;
            p[i * 3] += v[i * 3] * dt;
            p[i * 3 + 1] += v[i * 3 + 1] * dt;
            p[i * 3 + 2] += v[i * 3 + 2] * dt;
            if (p[i * 3 + 1] < 0.03) {
                p[i * 3 + 1] = 0.03;
                v[i * 3] *= 0.3; v[i * 3 + 1] = 0; v[i * 3 + 2] *= 0.3;
            }
            const t = this.life[i] / this.maxLife[i];
            const s = this.size[i] * (0.4 + 0.6 * t);
            this._m.makeScale(s, s, s);
            this._m.setPosition(p[i * 3], p[i * 3 + 1], p[i * 3 + 2]);
            this.mesh.setMatrixAt(i, this._m);
            this._c.setRGB(this.colors[i * 3], this.colors[i * 3 + 1], this.colors[i * 3 + 2]);
            this.mesh.setColorAt(i, this._c);
            i++;
        }
        this.mesh.count = this.n;
        if (this.n > 0) {
            this.mesh.instanceMatrix.needsUpdate = true;
            this.mesh.instanceColor.needsUpdate = true;
        }
    }
}

const blood = new ParticleSystem(500, new THREE.IcosahedronGeometry(0.5, 0),
    new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.25, metalness: 0.1 }), 13, 0.6);
const dust = new ParticleSystem(300, new THREE.IcosahedronGeometry(0.5, 0),
    new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1.0 }), 6, 2.5);
const sparks = new ParticleSystem(200, new THREE.BoxGeometry(0.25, 0.25, 1.0),
    new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false }), 9, 0.5);

const BLOOD_COLORS = [new THREE.Color(0x5a0606), new THREE.Color(0x7a0a0a), new THREE.Color(0x3d0404)];
const SPARK_COLOR = new THREE.Color(4.0, 2.2, 0.8);
const _c = new THREE.Color();

export function spawnBlood(pos, count, power = 1) {
    for (let i = 0; i < count; i++) {
        const c = BLOOD_COLORS[i % BLOOD_COLORS.length];
        blood.emit(pos.x, pos.y, pos.z,
            (Math.random() - 0.5) * 4.5 * power, (Math.random() * 3 + 0.8) * power, (Math.random() - 0.5) * 4.5 * power,
            0.5 + Math.random() * 0.45, 0.03 + Math.random() * 0.05, c);
    }
}

// Trafienie w ścianę/drzewo/ziemię: obłok pyłu w kolorze powierzchni i kilka iskier
export function spawnImpact(pos, normal, surfaceColor, metal = false) {
    for (let i = 0; i < 9; i++) {
        _c.copy(surfaceColor).multiplyScalar(0.7 + Math.random() * 0.4);
        dust.emit(pos.x, pos.y, pos.z,
            normal.x * 2 + (Math.random() - 0.5) * 2.2, normal.y * 2 + Math.random() * 1.5, normal.z * 2 + (Math.random() - 0.5) * 2.2,
            0.35 + Math.random() * 0.4, 0.04 + Math.random() * 0.07, _c);
    }
    const n = metal ? 8 : 3;
    for (let i = 0; i < n; i++) {
        sparks.emit(pos.x, pos.y, pos.z,
            normal.x * 4 + (Math.random() - 0.5) * 5, normal.y * 4 + Math.random() * 3, normal.z * 4 + (Math.random() - 0.5) * 5,
            0.12 + Math.random() * 0.15, 0.025, SPARK_COLOR);
    }
}

// ----------------------------------------------------------------------------
// Naklejki: plamy krwi na ziemi i dziury po kulach (pule wielokrotnego użytku)
// ----------------------------------------------------------------------------
class DecalPool {
    constructor(count, geometry, material) {
        this.items = [];
        this.cursor = 0;
        for (let i = 0; i < count; i++) {
            const m = new THREE.Mesh(geometry, material);
            m.visible = false;
            m.renderOrder = 1;
            m.receiveShadow = true;
            scene.add(m);
            this.items.push(m);
        }
    }
    next() {
        const m = this.items[this.cursor];
        this.cursor = (this.cursor + 1) % this.items.length;
        m.visible = true;
        return m;
    }
}

const bloodDecals = new DecalPool(40, new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2),
    new THREE.MeshStandardMaterial({ color: 0x4a0505, alphaMap: bloodSplatTexture(), transparent: true, opacity: 0.88, roughness: 0.18, metalness: 0.1, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4 }));
const holeDecals = new DecalPool(90, new THREE.PlaneGeometry(0.16, 0.16),
    new THREE.MeshStandardMaterial({ map: bulletHoleTexture(), transparent: true, roughness: 0.9, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4 }));

export function spawnBloodDecal(x, z, size = 1) {
    const d = bloodDecals.next();
    const s = (1.0 + Math.random() * 0.9) * size;
    d.position.set(x, 0.035 + Math.random() * 0.004, z);
    d.rotation.set(0, Math.random() * Math.PI * 2, 0);
    d.scale.set(s, 1, s);
}

const _look = new THREE.Vector3();
export function spawnBulletHole(point, normal) {
    const d = holeDecals.next();
    d.position.copy(point).addScaledVector(normal, 0.004);
    _look.copy(d.position).add(normal);
    d.lookAt(_look);
    d.rotateZ(Math.random() * Math.PI * 2);
    const s = 0.7 + Math.random() * 0.6;
    d.scale.set(s, s, s);
}

// ----------------------------------------------------------------------------
// Smugi pocisków (rozciągnięte, świecące prostopadłościany)
// ----------------------------------------------------------------------------
const tracerMat = new THREE.MeshBasicMaterial({ color: 0xffd28a, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false });
const tracerGeo = new THREE.BoxGeometry(0.012, 0.012, 1).translate(0, 0, -0.5);
const tracers = [];
for (let i = 0; i < 12; i++) {
    const m = new THREE.Mesh(tracerGeo, tracerMat);
    m.visible = false;
    scene.add(m);
    tracers.push({ mesh: m, life: 0, from: new THREE.Vector3(), dir: new THREE.Vector3(), len: 0, speed: 0 });
}
let tracerCursor = 0;

export function spawnTracer(from, to) {
    const t = tracers[tracerCursor];
    tracerCursor = (tracerCursor + 1) % tracers.length;
    t.from.copy(from);
    t.dir.subVectors(to, from);
    t.len = t.dir.length();
    t.dir.normalize();
    t.travel = 0;
    t.speed = 260;
    t.life = Math.min(0.25, t.len / t.speed + 0.02);
    t.mesh.visible = true;
}

// ----------------------------------------------------------------------------
// Dym z lufy
// ----------------------------------------------------------------------------
const smokeMat = new THREE.SpriteMaterial({ map: smokeTexture(), color: 0xb8b4ac, transparent: true, depthWrite: false, opacity: 0.0 });
const smokes = [];
for (let i = 0; i < 10; i++) {
    const s = new THREE.Sprite(smokeMat.clone());
    s.visible = false;
    scene.add(s);
    smokes.push({ sprite: s, life: 0, vel: new THREE.Vector3() });
}
let smokeCursor = 0;

export function spawnMuzzleSmoke(pos, amount = 1) {
    const s = smokes[smokeCursor];
    smokeCursor = (smokeCursor + 1) % smokes.length;
    s.sprite.position.copy(pos);
    s.sprite.scale.setScalar(0.15);
    s.sprite.material.opacity = 0.22 * amount;
    s.sprite.material.rotation = Math.random() * Math.PI * 2;
    s.vel.set((Math.random() - 0.5) * 0.3, 0.35 + Math.random() * 0.3, (Math.random() - 0.5) * 0.3);
    s.life = 1.0;
    s.amount = amount;
    s.sprite.visible = true;
}

export function updateEffects(dt) {
    blood.update(dt);
    dust.update(dt);
    sparks.update(dt);

    for (const t of tracers) {
        if (t.life <= 0) continue;
        t.life -= dt;
        t.travel += t.speed * dt;
        const segLen = Math.min(6, t.len);
        const head = Math.min(t.len, t.travel + segLen);
        t.mesh.position.copy(t.from).addScaledVector(t.dir, head);
        t.mesh.lookAt(_look.copy(t.mesh.position).add(t.dir));
        t.mesh.scale.set(1, 1, Math.max(0.01, Math.min(segLen, head)));
        if (t.life <= 0 || t.travel > t.len) {
            t.life = 0;
            t.mesh.visible = false;
        }
    }

    for (const s of smokes) {
        if (s.life <= 0) continue;
        s.life -= dt;
        s.sprite.position.addScaledVector(s.vel, dt);
        const k = 1 - s.life;
        s.sprite.scale.setScalar(0.15 + k * 0.9);
        s.sprite.material.opacity = 0.22 * s.amount * s.life;
        if (s.life <= 0) s.sprite.visible = false;
    }
}

export function clearEffects() {
    bloodDecals.items.forEach(m => { m.visible = false; });
    holeDecals.items.forEach(m => { m.visible = false; });
}

