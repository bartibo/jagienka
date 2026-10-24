// ============================================================================
// BUDOWA OPUSZCZONEJ OSADY: TEREN, TRAWA, DROGA, 5 WCHODZALNYCH DOMKÓW,
// ŚWIERKI, WRAKI AUT, PŁOTY, LATARNIE, SŁUPY, STUDNIA I ŁUP NA STOŁACH
// ============================================================================
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { scene, addFixture } from './grafika.js';
import { WORLD_RADIUS } from './stan.js';
import {
    pbrMaterial, boxUV, planeUV, grassBladesTexture, spruceBranchTexture, treelineTexture,
    radialTexture, rugTexture, lootTexture, carGrimeTexture, villageSignTexture
} from './tekstury.js';

export const boxColliders = [];
export const circleColliders = [];
export const houseZones = [];
export const lootItems = [];
export const occluders = [];     // siatki zatrzymujące kule (ściany, dachy, auta, pnie...)

const rand = (a, b) => a + Math.random() * (b - a);

// Łączy geometrie w jedną (jedno wywołanie rysowania); ujednolica atrybuty i indeksy
function merge(geos) {
    const prepared = geos.map(g => {
        let geo = g.index ? g.toNonIndexed() : g;
        for (const name of Object.keys(geo.attributes)) {
            if (!['position', 'normal', 'uv'].includes(name)) geo.deleteAttribute(name);
        }
        if (!geo.attributes.uv) {
            geo.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array(geo.attributes.position.count * 2), 2));
        }
        return geo;
    });
    return mergeGeometries(prepared, false);
}

function placed(geo, x, y, z, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1) {
    const m = new THREE.Matrix4().compose(
        new THREE.Vector3(x, y, z),
        new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz)),
        new THREE.Vector3(sx, sy, sz)
    );
    return geo.applyMatrix4(m);
}

// Normalne bez odwracania na tylnej stronie (trawa, gałęzie) – jednolite światło z obu stron
function keepNormalsOnBackfaces(material) {
    const prev = material.onBeforeCompile;
    material.onBeforeCompile = (shader, r) => {
        if (prev) prev(shader, r);
        shader.fragmentShader = shader.fragmentShader.replace(
            '#include <normal_fragment_begin>',
            THREE.ShaderChunk.normal_fragment_begin.replace('normal *= faceDirection;', '')
        );
    };
    return material;
}

function addMesh(parent, geo, mat, { cast = true, receive = true, occlude = false } = {}) {
    const mesh = new THREE.Mesh(geo, mat);
    mesh.castShadow = cast;
    mesh.receiveShadow = receive;
    parent.add(mesh);
    if (occlude) occluders.push(mesh);
    return mesh;
}

function staticify(obj) {
    obj.updateMatrixWorld(true);
    obj.traverse(o => { o.matrixAutoUpdate = false; });
}

// Scala nieruchome siatki grupy w jedną siatkę na materiał (dom z ~120 rysowań → kilkanaście).
// Geometria trafia do współrzędnych świata; ściany zatrzymujące kule dalej je zatrzymują.
function batchStatic(root) {
    root.updateMatrixWorld(true);
    const buckets = new Map();
    const remove = [];
    root.traverse(o => {
        if (!o.isMesh || o.isInstancedMesh || o.isSkinnedMesh || o.userData.keep) return;
        const mats = Array.isArray(o.material) ? o.material : [o.material];
        let geo = o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone();
        geo.applyMatrix4(o.matrixWorld);
        const groups = geo.groups.length ? geo.groups : [{ start: 0, count: geo.attributes.position.count, materialIndex: 0 }];
        const occ = occluders.indexOf(o);
        if (occ !== -1) occluders.splice(occ, 1);
        for (const g of groups) {
            const mat = mats[g.materialIndex] || mats[0];
            const key = mat.uuid + (o.castShadow ? 'c' : '') + (o.receiveShadow ? 'r' : '');
            if (!buckets.has(key)) buckets.set(key, { mat, cast: o.castShadow, receive: o.receiveShadow, occlude: false, geos: [] });
            const b = buckets.get(key);
            b.occlude = b.occlude || occ !== -1;
            const part = new THREE.BufferGeometry();
            for (const name of ['position', 'normal', 'uv']) {
                const src = geo.attributes[name];
                const size = name === 'uv' ? 2 : 3;
                const arr = new Float32Array(g.count * size);
                if (src) arr.set(src.array.subarray(g.start * size, (g.start + g.count) * size));
                part.setAttribute(name, new THREE.BufferAttribute(arr, size));
            }
            b.geos.push(part);
        }
        remove.push(o);
    });
    remove.forEach(o => o.parent.remove(o));
    for (const b of buckets.values()) {
        const mesh = new THREE.Mesh(mergeGeometries(b.geos, false), b.mat);
        mesh.castShadow = b.cast;
        mesh.receiveShadow = b.receive;
        mesh.matrixAutoUpdate = false;
        mesh.updateMatrix();
        scene.add(mesh);
        if (b.occlude) occluders.push(mesh);
    }
    let left = 0;
    root.traverse(o => { if (o.isMesh) left++; });
    if (!left && root.parent) root.parent.remove(root);
}

// Wspólny kontener na drobne nieruchome obiekty (auta, latarnie, płoty, studnia...) – scalany na końcu budowy
const staticGroup = new THREE.Group();

// ----------------------------------------------------------------------------
// Wspólne materiały
// ----------------------------------------------------------------------------
let M = null;
function materials() {
    if (M) return M;
    M = {
        ground: pbrMaterial('leafy_grass', { vertexColors: true, normalScale: 1.2 }),
        mud: pbrMaterial('brown_mud_leaves_01'),
        asphalt: pbrMaterial('asphalt_02', { normalScale: 1.4 }),
        brickRed: pbrMaterial('brick_4'),
        brickDark: pbrMaterial('brick_wall_10'),
        plaster: pbrMaterial('damaged_plaster', { color: 0xe6dcc8 }),
        plasterBlue: pbrMaterial('blue_plaster_weathered', { color: 0xcfd8d6 }),
        siding: pbrMaterial('weathered_plank_siding'),
        roofTiles: pbrMaterial('roof_tiles_14'),
        roofClay: pbrMaterial('clay_roof_tiles_02', { color: 0xc9b0a0 }),
        roofIron: pbrMaterial('rusty_corrugated_iron', { metal: true }),
        floor: pbrMaterial('wood_floor_worn', { color: 0xa89a8a }),
        interior: pbrMaterial('beige_wall_001', { color: 0xf0e6d4 }),
        bark: pbrMaterial('pine_bark'),
        planks: pbrMaterial('weathered_brown_planks'),
        concrete: pbrMaterial('concrete_moss', { color: 0xc8c8c0 }),
        trim: new THREE.MeshStandardMaterial({ color: 0x2f2620, roughness: 0.8 }),
        glass: new THREE.MeshStandardMaterial({ color: 0x1d2a30, roughness: 0.08, metalness: 0.1, transparent: true, opacity: 0.42, envMapIntensity: 2.0 }),
        metalDark: new THREE.MeshStandardMaterial({ color: 0x2a2d31, metalness: 0.75, roughness: 0.45 }),
        fabricRed: new THREE.MeshStandardMaterial({ color: 0x6b2424, roughness: 0.95 }),
        fabricCream: new THREE.MeshStandardMaterial({ color: 0xb9ad94, roughness: 0.95 })
    };
    M.planksDark = M.planks.clone();
    M.planksDark.color.set(0x9a8472);
    M.carGlass = new THREE.MeshStandardMaterial({ color: 0x10171c, roughness: 0.06, metalness: 0.4, envMapIntensity: 1.6 });
    return M;
}

// ----------------------------------------------------------------------------
// Teren: łąka z kolorami wierzchołków (jaśniejsze/ciemniejsze płaty), wzgórza za lasem
// ----------------------------------------------------------------------------
function valueNoise(x, z) {
    const s = (a, b) => {
        const v = Math.sin(a * 127.1 + b * 311.7) * 43758.5453;
        return v - Math.floor(v);
    };
    const xi = Math.floor(x), zi = Math.floor(z);
    const xf = x - xi, zf = z - zi;
    const u = xf * xf * (3 - 2 * xf), v = zf * zf * (3 - 2 * zf);
    const a = s(xi, zi), b = s(xi + 1, zi), c = s(xi, zi + 1), d = s(xi + 1, zi + 1);
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
function fbm2(x, z) {
    return valueNoise(x, z) * 0.5 + valueNoise(x * 2.1, z * 2.1) * 0.3 + valueNoise(x * 4.3, z * 4.3) * 0.2;
}

function buildGround() {
    const size = 420;
    const seg = 140;
    const geo = new THREE.PlaneGeometry(size, size, seg, seg);
    geo.rotateX(-Math.PI / 2);
    planeUV(geo, size, size, M.ground.userData.tile);
    const pos = geo.attributes.position;
    const colors = new Float32Array(pos.count * 3);
    for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i), z = pos.getZ(i);
        const r = Math.hypot(x, z);
        // wzgórza dopiero daleko za granicą osady (gracz zawsze stoi na płaskim)
        if (r > WORLD_RADIUS + 18) {
            const hill = (r - WORLD_RADIUS - 18) * 0.12 + fbm2(x * 0.02, z * 0.02) * 14;
            pos.setY(i, Math.min(hill, 26));
        }
        const n = fbm2(x * 0.06, z * 0.06);
        const dry = fbm2(x * 0.025 + 40, z * 0.025);
        let rC = 0.78 + n * 0.32, gC = 0.8 + n * 0.3, bC = 0.72 + n * 0.25;
        rC += dry * 0.18;
        gC += dry * 0.06;
        // pobocza drogi przydeptane i ciemniejsze
        if (Math.abs(x) < 8) {
            const k = 1 - Math.abs(x) / 8;
            rC *= 1 - k * 0.2; gC *= 1 - k * 0.3; bC *= 1 - k * 0.25;
        }
        colors[i * 3] = rC; colors[i * 3 + 1] = gC; colors[i * 3 + 2] = bC;
    }
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geo.computeVertexNormals();
    const ground = addMesh(scene, geo, M.ground, { cast: false });
    ground.name = 'ground';
    staticify(ground);
}

// Pas drogi z poboczem, pękniętym asfaltem i wytartymi liniami
function buildRoad() {
    const len = WORLD_RADIUS * 2 + 80;
    const shoulderGeo = planeUV(new THREE.PlaneGeometry(12.5, len), 12.5, len, M.mud.userData.tile);
    shoulderGeo.rotateX(-Math.PI / 2);
    const shoulder = addMesh(scene, shoulderGeo, M.mud, { cast: false });
    shoulder.position.y = 0.012;

    const roadGeo = planeUV(new THREE.PlaneGeometry(9.5, len), 9.5, len, M.asphalt.userData.tile);
    roadGeo.rotateX(-Math.PI / 2);
    const road = addMesh(scene, roadGeo, M.asphalt, { cast: false });
    road.position.y = 0.025;

    const lineMat = new THREE.MeshStandardMaterial({ color: 0xd8d6cc, roughness: 0.7, transparent: true, opacity: 0.75, polygonOffset: true, polygonOffsetFactor: -2 });
    const lines = [];
    for (let z = -len / 2 + 4; z < len / 2; z += 9) {
        if (Math.random() < 0.15) continue; // starte fragmenty
        lines.push(placed(new THREE.PlaneGeometry(0.16, 3.6).rotateX(-Math.PI / 2), rand(-0.03, 0.03), 0, z));
    }
    lines.push(placed(new THREE.PlaneGeometry(0.14, len).rotateX(-Math.PI / 2), -4.35, 0, 0));
    lines.push(placed(new THREE.PlaneGeometry(0.14, len).rotateX(-Math.PI / 2), 4.35, 0, 0));
    const lineMesh = addMesh(scene, merge(lines), lineMat, { cast: false });
    lineMesh.position.y = 0.03;

    // ścieżki z ubitej ziemi od drogi do domków
    const paths = [];
    [[-11, -18, 14], [11, -18, 14], [-11, 14, 14], [11, 14, 14], [0, -30, 9]].forEach(([px, pz, l], i) => {
        const vertical = i === 4;
        const w = vertical ? 3.2 : l, d = vertical ? l : 3.2;
        const g = planeUV(new THREE.PlaneGeometry(w, d), w, d, M.mud.userData.tile);
        g.rotateX(-Math.PI / 2);
        paths.push(placed(g, px, 0, pz));
    });
    const pathMesh = addMesh(scene, merge(paths), M.mud, { cast: false });
    pathMesh.position.y = 0.018;
    [shoulder, road, lineMesh, pathMesh].forEach(staticify);
}

// Gdzie nie rośnie trawa (droga, ścieżki, domy)
function isGrassBlocked(x, z) {
    if (Math.abs(x) < 6.4) return true;
    for (const h of houseZones) {
        if (x > h.minX - 0.9 && x < h.maxX + 0.9 && z > h.minZ - 0.9 && z < h.maxZ + 0.9) return true;
    }
    if ((Math.abs(z + 18) < 1.8 || Math.abs(z - 14) < 1.8) && Math.abs(x) < 18.5) return true;
    if (Math.abs(x) < 1.8 && z < -25 && z > -35) return true;
    for (const c of circleColliders) {
        const dx = x - c.x, dz = z - c.z;
        if (dx * dx + dz * dz < (c.radius + 0.2) ** 2) return true;
    }
    return false;
}

// ----------------------------------------------------------------------------
// Trawa: kępki z instancji, w kawałkach (niewidoczne kawałki są pomijane), kołysane wiatrem w shaderze
// ----------------------------------------------------------------------------
export const windUniform = { value: 0 };
let grassChunks = [];
let grassMaterial = null;
let grassGeometry = null;

function grassGeo() {
    const quads = [];
    for (let i = 0; i < 3; i++) {
        const g = new THREE.PlaneGeometry(0.75, 0.48);
        g.translate(0, 0.24, 0);
        g.rotateY((i / 3) * Math.PI);
        quads.push(g);
    }
    const geo = merge(quads);
    const n = geo.attributes.normal;
    for (let i = 0; i < n.count; i++) n.setXYZ(i, 0, 1, 0);
    return geo;
}

export function setGrassCount(total) {
    grassChunks.forEach(c => { scene.remove(c); c.dispose(); });
    grassChunks = [];
    if (!grassMaterial) {
        grassMaterial = new THREE.MeshStandardMaterial({
            map: grassBladesTexture(), alphaTest: 0.42, side: THREE.DoubleSide, roughness: 0.95, metalness: 0
        });
        keepNormalsOnBackfaces(grassMaterial);
        const prev = grassMaterial.onBeforeCompile;
        grassMaterial.onBeforeCompile = (shader, r) => {
            prev(shader, r);
            shader.uniforms.uTime = windUniform;
            shader.vertexShader = 'uniform float uTime;\n' + shader.vertexShader.replace('#include <begin_vertex>', `
                vec3 transformed = vec3(position);
                #ifdef USE_INSTANCING
                    vec2 ip = vec2(instanceMatrix[3][0], instanceMatrix[3][2]);
                #else
                    vec2 ip = vec2(0.0);
                #endif
                float sway = uv.y * uv.y;
                float gust = sin(uTime * 1.6 + ip.x * 0.31 + ip.y * 0.21) * 0.6 + sin(uTime * 3.3 + ip.x * 0.9 - ip.y * 0.4) * 0.25;
                transformed.x += gust * 0.13 * sway;
                transformed.z += gust * 0.07 * sway;
            `);
        };
        grassGeometry = grassGeo();
    }
    if (total <= 0) return;

    const GRID = 8;
    const extent = 64;
    const cell = (extent * 2) / GRID;
    const perChunk = Math.ceil(total / (GRID * GRID));
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const s = new THREE.Vector3();
    const p = new THREE.Vector3();
    const col = new THREE.Color();
    const green = new THREE.Color(0.85, 0.95, 0.75);
    const dry = new THREE.Color(1.15, 1.0, 0.7);
    const up = new THREE.Vector3(0, 1, 0);

    for (let gx = 0; gx < GRID; gx++) {
        for (let gz = 0; gz < GRID; gz++) {
            const x0 = -extent + gx * cell, z0 = -extent + gz * cell;
            const mesh = new THREE.InstancedMesh(grassGeometry, grassMaterial, perChunk);
            let n = 0;
            for (let i = 0; i < perChunk * 2 && n < perChunk; i++) {
                const x = x0 + Math.random() * cell, z = z0 + Math.random() * cell;
                if (Math.hypot(x, z) > extent) continue;
                if (isGrassBlocked(x, z)) continue;
                // gęściej w płatach, rzadziej pomiędzy
                if (fbm2(x * 0.09, z * 0.09) < 0.32 && Math.random() < 0.6) continue;
                p.set(x, 0, z);
                q.setFromAxisAngle(up, Math.random() * Math.PI);
                const sc = 0.65 + Math.random() * 0.7;
                s.set(sc, sc * (0.75 + Math.random() * 0.6), sc);
                m.compose(p, q, s);
                mesh.setMatrixAt(n, m);
                col.copy(green).lerp(dry, fbm2(x * 0.03 + 40, z * 0.03) * 0.9 + Math.random() * 0.15);
                mesh.setColorAt(n, col);
                n++;
            }
            mesh.count = n;
            mesh.instanceMatrix.needsUpdate = true;
            if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
            mesh.computeBoundingSphere();
            mesh.castShadow = false;
            mesh.receiveShadow = true;
            mesh.matrixAutoUpdate = false;
            scene.add(mesh);
            grassChunks.push(mesh);
        }
    }
}

// ----------------------------------------------------------------------------
// Świerki: pień z korą + piętra gałęzi (karty z teksturą), wszystkie drzewa jako instancje
// ----------------------------------------------------------------------------
const treeInstances = [];   // { x, z, s, rot, variant }

function spruceFoliageGeo(seed) {
    const cards = [];
    const tiers = 11;
    const height = 9.2;
    for (let t = 0; t < tiers; t++) {
        const k = t / (tiers - 1);
        const y = 1.6 + k * (height - 2.0);
        const radius = 2.5 * Math.pow(1 - k, 0.95) + 0.35;
        const count = Math.max(4, Math.round(8 - k * 3));
        for (let i = 0; i < count; i++) {
            const ang = (i / count) * Math.PI * 2 + seed * 1.7 + t * 0.6 + rand(-0.2, 0.2);
            const g = new THREE.PlaneGeometry(radius, radius * 0.55);
            g.translate(radius / 2, 0, 0);          // nasada gałęzi przy pniu
            g.rotateX(rand(-0.4, 0.4));
            g.rotateZ(-rand(0.22, 0.45));           // gałęzie opadają
            g.rotateY(ang);
            g.translate(0, y + rand(-0.15, 0.15), 0);
            cards.push(g);
        }
    }
    const top = new THREE.PlaneGeometry(0.7, 1.4);
    top.translate(0, height - 0.2, 0);
    cards.push(top);
    cards.push(top.clone().rotateY(Math.PI / 2));
    const geo = merge(cards);
    // normalne „kuliste” wokół osi korony – miękkie, objętościowe cieniowanie
    const pos = geo.attributes.position, nor = geo.attributes.normal;
    const v = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
        v.set(pos.getX(i), (pos.getY(i) - 5.2) * 0.45 + 0.6, pos.getZ(i)).normalize();
        nor.setXYZ(i, v.x, v.y, v.z);
    }
    return geo;
}

function buildTrees() {
    const trunkGeo = new THREE.CylinderGeometry(0.13, 0.34, 9.6, 9, 1, true);
    trunkGeo.translate(0, 4.8, 0);
    const uv = trunkGeo.attributes.uv;
    for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * 1.6, uv.getY(i) * 6.0);
    const foliageMat = keepNormalsOnBackfaces(new THREE.MeshStandardMaterial({
        map: spruceBranchTexture(), alphaTest: 0.38, side: THREE.DoubleSide, roughness: 0.92, color: 0xbfcfb8
    }));
    const variants = [0, 1, 2].map(i => spruceFoliageGeo(i));

    const counts = [0, 0, 0];
    treeInstances.forEach(t => counts[t.variant]++);
    const trunkMesh = new THREE.InstancedMesh(trunkGeo, M.bark, treeInstances.length);
    const foliage = variants.map((g, i) => new THREE.InstancedMesh(g, foliageMat, counts[i]));
    const filled = [0, 0, 0];
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const up = new THREE.Vector3(0, 1, 0);
    const col = new THREE.Color();
    treeInstances.forEach((t, idx) => {
        q.setFromAxisAngle(up, t.rot);
        m.compose(new THREE.Vector3(t.x, 0, t.z), q, new THREE.Vector3(t.s, t.s * rand(0.9, 1.15), t.s));
        trunkMesh.setMatrixAt(idx, m);
        const f = foliage[t.variant];
        f.setMatrixAt(filled[t.variant], m);
        col.setHSL(0.27 + rand(-0.03, 0.03), 0.25 + rand(-0.08, 0.08), 0.42 + rand(-0.08, 0.06));
        f.setColorAt(filled[t.variant], col);
        filled[t.variant]++;
    });
    [trunkMesh, ...foliage].forEach(mesh => {
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.instanceMatrix.needsUpdate = true;
        if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
        mesh.computeBoundingSphere();
        mesh.matrixAutoUpdate = false;
        mesh.updateMatrix();
        scene.add(mesh);
    });
    occluders.push(trunkMesh);
}

function addTree(x, z, s, collide = true) {
    treeInstances.push({ x, z, s, rot: Math.random() * Math.PI * 2, variant: Math.floor(Math.random() * 3) });
    if (collide) circleColliders.push({ x, z, radius: 0.45 * s });
}

// Daleki las na horyzoncie (dwie warstwy sylwetek w mgle)
function buildTreeline() {
    const tex = treelineTexture();
    [[150, 34, 0x1c2620, 7], [205, 52, 0x222c28, 9]].forEach(([r, h, color, rep]) => {
        const t = tex.clone();
        t.repeat.set(rep, 1);
        t.needsUpdate = true;
        const mat = new THREE.MeshBasicMaterial({ color, alphaMap: t, alphaTest: 0.5, side: THREE.BackSide, fog: true });
        const geo = new THREE.CylinderGeometry(r, r, h, 64, 1, true);
        geo.translate(0, h / 2 - 2, 0);
        const ring = new THREE.Mesh(geo, mat);
        scene.add(ring);
        staticify(ring);
    });
}

// ----------------------------------------------------------------------------
// Domki (układ ścian, drzwi, okien i kolizji jak w pierwszej wersji gry)
// ----------------------------------------------------------------------------
function createEnterableHouse(config) {
    const { x, z, w, d, h, doorSide, wallMat, roofMat, name } = config;
    const house = new THREE.Group();
    house.position.set(x, 0, z);
    scene.add(house);
    const tile = wallMat.userData.tile;

    const wt = 0.36;
    const doorW = 2.4;
    const doorH = 2.65;
    const winW = 2.4;
    const winSill = 1.15;
    const winTop = 2.55;

    // środek drzwi na ścianie i kierunek na zewnątrz – zombie trafiają przez nie do środka
    const doorN = { E: [1, 0], W: [-1, 0], S: [0, 1], N: [0, -1] }[doorSide];
    houseZones.push({
        minX: x - w / 2 + 0.25, maxX: x + w / 2 - 0.25,
        minZ: z - d / 2 + 0.25, maxZ: z + d / 2 - 0.25,
        door: { x: x + doorN[0] * w / 2, z: z + doorN[1] * d / 2, nx: doorN[0], nz: doorN[1] },
        name
    });

    // Fragment ściany: tekstura zewnętrzna, od środka tynk; indeks ściany wewnętrznej wg strony domu
    const wallPiece = (side, cx, cy, cz, sw, sh, sd, collide) => {
        const along = (side === 'N' || side === 'S') ? cx - sw / 2 : cz - sd / 2;
        const geo = boxUV(new THREE.BoxGeometry(sw, sh, sd), sw, sh, sd, tile, along / tile, (cy - sh / 2) / tile);
        const inner = { N: 4, S: 5, E: 1, W: 0 }[side];
        const mats = [wallMat, wallMat, wallMat, wallMat, wallMat, wallMat];
        mats[inner] = M.interior;
        const mesh = addMesh(house, geo, mats, { occlude: true });
        mesh.position.set(cx, cy, cz);
        if (collide) {
            boxColliders.push({ minX: x + cx - sw / 2, maxX: x + cx + sw / 2, minZ: z + cz - sd / 2, maxZ: z + cz + sd / 2 });
        }
        return mesh;
    };

    // podłoga i podmurówka
    const floorGeo = planeUV(new THREE.PlaneGeometry(w - 0.1, d - 0.1), w, d, M.floor.userData.tile);
    floorGeo.rotateX(-Math.PI / 2);
    const floor = addMesh(house, floorGeo, M.floor, { cast: false });
    floor.position.y = 0.14;
    const baseGeo = boxUV(new THREE.BoxGeometry(w + 0.12, 0.14, d + 0.12), w, 0.14, d, 1.5);
    addMesh(house, baseGeo, M.concrete, { cast: false }).position.y = 0.07;

    const buildSideWall = (side) => {
        const isNS = side === 'N' || side === 'S';
        const length = isNS ? w : d;
        const posCoord = side === 'S' ? d / 2 : side === 'N' ? -d / 2 : side === 'E' ? w / 2 : -w / 2;
        const out = (side === 'S' || side === 'E') ? 1 : -1;   // kierunek na zewnątrz
        const P = (along, y, across = 0) => isNS ? [along, y, posCoord + across * out] : [posCoord + across * out, y, along];
        const S = (alongLen, hgt, thick) => isNS ? [alongLen, hgt, thick] : [thick, hgt, alongLen];

        if (side === doorSide) {
            const seg = (length - doorW) / 2;
            const off = doorW / 2 + seg / 2;
            wallPiece(side, ...P(-off, h / 2), ...S(seg, h, wt), true);
            wallPiece(side, ...P(off, h / 2), ...S(seg, h, wt), true);
            wallPiece(side, ...P(0, doorH + (h - doorH) / 2), ...S(doorW, h - doorH, wt), false);

            // ościeżnica
            [[-doorW / 2 + 0.06, doorH / 2, 0.12, doorH], [doorW / 2 - 0.06, doorH / 2, 0.12, doorH], [0, doorH - 0.06, doorW, 0.12]].forEach(([a, y, l, hh]) => {
                const m = addMesh(house, new THREE.BoxGeometry(...S(l, hh, wt + 0.08)), M.trim);
                m.position.set(...P(a, y));
            });
            // uchylone drzwi z desek
            const leafGeo = boxUV(new THREE.BoxGeometry(1.15, doorH - 0.1, 0.07), 1.15, doorH - 0.1, 0.07, 1.8);
            const leaf = addMesh(house, leafGeo, M.planksDark);
            const hinge = new THREE.Group();
            hinge.position.set(...P(-doorW / 2 + 0.12, 0.05, -wt / 2));
            hinge.rotation.y = isNS ? out * 1.2 : -Math.PI / 2 - out * 1.2;
            leaf.position.set(0.575, (doorH - 0.1) / 2, 0);
            const knob = addMesh(hinge, new THREE.SphereGeometry(0.04, 8, 6), M.metalDark);
            knob.position.set(1.0, 1.05, 0.06);
            hinge.add(leaf);
            house.add(hinge);
            // schodek przed drzwiami
            const step = addMesh(house, boxUV(new THREE.BoxGeometry(...S(doorW + 0.6, 0.18, 0.9)), doorW + 0.6, 0.18, 0.9, 1.5), M.concrete);
            step.position.set(...P(0, 0.09, wt / 2 + 0.45));
        } else {
            const seg = (length - winW) / 2;
            const off = winW / 2 + seg / 2;
            wallPiece(side, ...P(-off, h / 2), ...S(seg, h, wt), false);
            wallPiece(side, ...P(off, h / 2), ...S(seg, h, wt), false);
            wallPiece(side, ...P(0, winSill / 2), ...S(winW, winSill, wt), false);
            wallPiece(side, ...P(0, winTop + (h - winTop) / 2), ...S(winW, h - winTop, wt), false);

            const winH = winTop - winSill;
            const midY = (winSill + winTop) / 2;
            // rama, krzyż i szyba
            const frame = [];
            [[0, winSill + 0.04, winW, 0.08], [0, winTop - 0.04, winW, 0.08], [-winW / 2 + 0.04, midY, 0.08, winH], [winW / 2 - 0.04, midY, 0.08, winH],
             [0, midY, 0.06, winH], [0, midY + 0.15, winW, 0.06]].forEach(([a, y, l, hh]) => {
                frame.push(placed(new THREE.BoxGeometry(...S(l, hh, 0.12)), ...P(a, y, 0.04)));
            });
            addMesh(house, merge(frame), M.trim);
            const pane = addMesh(house, new THREE.BoxGeometry(...S(winW - 0.12, winH - 0.12, 0.02)), M.glass, { cast: false });
            pane.position.set(...P(0, midY, 0.02));
            // parapet zewnętrzny
            const sill = addMesh(house, new THREE.BoxGeometry(...S(winW + 0.3, 0.07, 0.28)), M.concrete);
            sill.position.set(...P(0, winSill - 0.02, wt / 2 + 0.1));

            if (config.boarded && config.boarded.includes(side)) {
                // okno zabite deskami – ślad po obronie przed zombie
                const boards = [];
                [[-0.25, 0.5], [0.35, -0.35], [0.0, 0.08]].forEach(([dy, rot]) => {
                    const g = boxUV(new THREE.BoxGeometry(winW + 0.5, 0.22, 0.04), winW + 0.5, 0.22, 0.04, 1.8, Math.random(), Math.random());
                    g.rotateZ(rot);
                    if (!isNS) g.rotateY(Math.PI / 2);
                    boards.push(placed(g, ...P(0, midY + dy, wt / 2 + 0.03)));
                });
                addMesh(house, merge(boards), M.planks);
            } else {
                // okiennice otwarte na boki
                [-1, 1].forEach(sgn => {
                    const g = boxUV(new THREE.BoxGeometry(...S(winW / 2, winH + 0.1, 0.05)), winW / 2, winH + 0.1, 0.05, 1.8);
                    const sh = addMesh(house, g, config.shutterMat || M.planksDark);
                    sh.position.set(...P(sgn * (winW * 0.75 + 0.04), midY, wt / 2 + 0.06));
                    sh.rotation.y = sgn * out * 0.25;
                });
            }

            boxColliders.push(isNS
                ? { minX: x - length / 2, maxX: x + length / 2, minZ: z + posCoord - wt / 2, maxZ: z + posCoord + wt / 2 }
                : { minX: x + posCoord - wt / 2, maxX: x + posCoord + wt / 2, minZ: z - length / 2, maxZ: z + length / 2 });
        }
    };
    ['N', 'S', 'E', 'W'].forEach(buildSideWall);

    // sufit (od dołu tynk)
    const ceilGeo = boxUV(new THREE.BoxGeometry(w, 0.2, d), w, 0.2, d, 3.0);
    const ceiling = addMesh(house, ceilGeo, [M.trim, M.trim, M.trim, M.interior, M.trim, M.trim], { occlude: true });
    ceiling.position.y = h + 0.1;

    // dach dwuspadowy: kalenica wzdłuż dłuższego boku
    const roof = new THREE.Group();
    const along = Math.max(w, d), span = Math.min(w, d);
    const pitch = config.pitch ?? 0.62;
    const overhang = 0.55;
    const half = span / 2 + overhang;
    const rise = (span / 2) * Math.tan(pitch);
    const slabLen = half / Math.cos(pitch);
    const rTile = roofMat.userData.tile;
    [-1, 1].forEach(sgn => {
        const g = boxUV(new THREE.BoxGeometry(along + 0.8, 0.16, slabLen), along + 0.8, 0.16, slabLen, rTile);
        const slab = addMesh(roof, g, [M.trim, M.trim, roofMat, M.trim, M.trim, M.trim], { occlude: true });
        const zc = sgn * half / 2;
        slab.position.set(0, h + 0.2 + rise - (half / 2) * Math.tan(pitch) + 0.08, zc);
        slab.rotation.x = sgn * pitch;
    });
    // szczyty (trójkąty z tą samą fakturą co ściany)
    const shape = new THREE.Shape();
    shape.moveTo(-span / 2, 0);
    shape.lineTo(span / 2, 0);
    shape.lineTo(0, rise);
    shape.closePath();
    [-1, 1].forEach(sgn => {
        const g = new THREE.ExtrudeGeometry(shape, { depth: wt, bevelEnabled: false });
        const uvA = g.attributes.uv;
        for (let i = 0; i < uvA.count; i++) uvA.setXY(i, uvA.getX(i) / tile, uvA.getY(i) / tile);
        g.translate(0, 0, -wt / 2);
        g.rotateY(Math.PI / 2);
        const gable = addMesh(roof, g, wallMat, { occlude: true });
        gable.position.set(sgn * (along / 2 - wt / 2), h + 0.2, 0);
    });
    // kalenica
    const ridge = addMesh(roof, new THREE.BoxGeometry(along + 0.85, 0.12, 0.22), M.trim);
    ridge.position.set(0, h + 0.2 + rise + 0.12, 0);
    if (d > w) roof.rotation.y = Math.PI / 2;
    house.add(roof);

    // komin z cegły
    const chimH = rise + 1.6;
    const chimGeo = boxUV(new THREE.BoxGeometry(0.8, chimH, 0.8), 0.8, chimH, 0.8, M.brickRed.userData.tile);
    const chimney = addMesh(house, chimGeo, M.brickRed, { occlude: true });
    chimney.position.set(w * 0.22, h + 0.2 + chimH / 2, -d * 0.18);
    const cap = addMesh(house, new THREE.BoxGeometry(1.0, 0.1, 1.0), M.concrete);
    cap.position.set(w * 0.22, h + 0.25 + chimH, -d * 0.18);

    // ------------------------------------------------------------------ wnętrze
    const tableX = -w * 0.22;
    const tableZ = -d * 0.22;
    const top = addMesh(house, boxUV(new THREE.BoxGeometry(1.9, 0.08, 1.2), 1.9, 0.08, 1.2, 1.8), M.planks, { occlude: true });
    top.position.set(tableX, 0.84, tableZ);
    boxColliders.push({ minX: x + tableX - 0.95, maxX: x + tableX + 0.95, minZ: z + tableZ - 0.6, maxZ: z + tableZ + 0.6 });
    const legs = [];
    [[-0.85, -0.5], [0.85, -0.5], [-0.85, 0.5], [0.85, 0.5]].forEach(([lx, lz]) => legs.push(placed(new THREE.BoxGeometry(0.08, 0.66, 0.08), tableX + lx, 0.47, tableZ + lz)));
    addMesh(house, merge(legs), M.planksDark);

    const chairGeo = () => merge([
        placed(new THREE.BoxGeometry(0.46, 0.05, 0.46), 0, 0.46, 0),
        placed(new THREE.BoxGeometry(0.46, 0.5, 0.05), 0, 0.72, -0.21),
        ...[[-0.2, -0.2], [0.2, -0.2], [-0.2, 0.2], [0.2, 0.2]].map(([a, b]) => placed(new THREE.BoxGeometry(0.05, 0.46, 0.05), a, 0.23, b))
    ]);
    const chair1 = addMesh(house, chairGeo(), M.planksDark);
    chair1.position.set(tableX - 0.3, 0.14, tableZ + 0.95);
    chair1.rotation.y = Math.PI + 0.3;
    const chair2 = addMesh(house, chairGeo(), M.planksDark);   // przewrócone krzesło
    chair2.position.set(tableX + 1.45, 0.38, tableZ + 0.3);
    chair2.rotation.set(0, 0.5, Math.PI / 2);

    // łóżko z materacem, kocem i poduszką
    const bedX = w * 0.24;
    const bedZ = d * 0.22;
    const bed = addMesh(house, merge([
        placed(new THREE.BoxGeometry(1.6, 0.3, 2.2), 0, 0.2, 0),
        placed(new THREE.BoxGeometry(1.6, 0.9, 0.08), 0, 0.6, -1.1),
        placed(new THREE.BoxGeometry(1.6, 0.55, 0.08), 0, 0.42, 1.1)
    ]), M.planksDark, { occlude: true });
    bed.position.set(bedX, 0.14, bedZ);
    boxColliders.push({ minX: x + bedX - 0.8, maxX: x + bedX + 0.8, minZ: z + bedZ - 1.1, maxZ: z + bedZ + 1.1 });
    const mattress = addMesh(house, new THREE.BoxGeometry(1.48, 0.18, 2.05), M.fabricCream);
    mattress.position.set(bedX, 0.58, bedZ);
    const blanket = addMesh(house, new THREE.BoxGeometry(1.54, 0.06, 1.3), M.fabricRed);
    blanket.position.set(bedX, 0.69, bedZ + 0.35);
    blanket.rotation.y = 0.08;
    const pillow = addMesh(house, new THREE.BoxGeometry(0.7, 0.12, 0.4), M.fabricCream);
    pillow.position.set(bedX, 0.72, bedZ - 0.75);

    // szafa w wolnym rogu
    const wardrobe = addMesh(house, merge([
        boxUV(new THREE.BoxGeometry(0.6, 2.0, 1.4), 0.6, 2.0, 1.4, 1.8)
    ]), M.planksDark, { occlude: true });
    wardrobe.position.set(-w / 2 + 0.48, 1.14, d / 2 - 1.0);
    boxColliders.push({ minX: x - w / 2 + 0.18, maxX: x - w / 2 + 0.78, minZ: z + d / 2 - 1.7, maxZ: z + d / 2 - 0.3 });
    const seam = addMesh(house, new THREE.BoxGeometry(0.02, 1.9, 0.02), M.trim, { cast: false });
    seam.position.set(-w / 2 + 0.79, 1.14, d / 2 - 1.0);

    // dywan
    const rug = addMesh(house, new THREE.PlaneGeometry(2.0, 2.8).rotateX(-Math.PI / 2),
        new THREE.MeshStandardMaterial({ map: rugTexture(config.rug || '#6e2a26'), roughness: 1, polygonOffset: true, polygonOffsetFactor: -1 }), { cast: false });
    rug.position.set(tableX + 0.4, 0.152, tableZ + 1.5);
    rug.rotation.y = 0.12;

    // żarówka na kablu z kloszem
    const bulbMat = new THREE.MeshStandardMaterial({ color: 0xfff2c8, emissive: 0xffcf80, emissiveIntensity: 3 });
    const bulb = addMesh(house, new THREE.SphereGeometry(0.07, 10, 8), bulbMat, { cast: false });
    bulb.position.set(0, h - 0.62, 0);
    const cord = addMesh(house, new THREE.CylinderGeometry(0.008, 0.008, 0.5), M.trim, { cast: false });
    cord.position.set(0, h - 0.3, 0);
    const shade = addMesh(house, new THREE.ConeGeometry(0.28, 0.2, 14, 1, true), M.metalDark, { cast: false });
    shade.position.set(0, h - 0.55, 0);
    const floorGlow = addMesh(house, new THREE.PlaneGeometry(6, 6).rotateX(-Math.PI / 2),
        new THREE.MeshBasicMaterial({ map: radialTexture('rgba(255,190,110,1)', 'rgba(255,190,110,0)'), transparent: true, opacity: 0.1, depthWrite: false, blending: THREE.AdditiveBlending }), { cast: false, receive: false });
    floorGlow.position.set(0, 0.16, 0);

    addFixture({
        pos: new THREE.Vector3(x, h - 0.7, z),
        color: 0xffb867, intensity: 14, distance: 12, dayIntensity: 0.8,
        alwaysOn: true, bulbMat, bulbOn: 3,
        glowMeshes: [{ mesh: floorGlow, day: 0.06, night: 0.16 }]
    });

    // Zaopatrzenie na stole w domku: Apteczka, Amunicja oraz Paczka Dolarów ($)
    spawnHouseLoot(x + tableX - 0.55, 1.0, z + tableZ, 'medkit');
    spawnHouseLoot(x + tableX + 0.05, 1.0, z + tableZ, 'ammo');
    spawnHouseLoot(x + tableX + 0.6, 1.0, z + tableZ, 'cash');

    batchStatic(house);
}

const lootGeo = {};
const lootMats = {};
function spawnHouseLoot(wx, wy, wz, type) {
    const group = new THREE.Group();
    group.position.set(wx, wy, wz);
    if (!lootMats[type]) {
        lootMats[type] = new THREE.MeshStandardMaterial({ map: lootTexture(type), roughness: type === 'ammo' ? 0.5 : 0.7, metalness: type === 'ammo' ? 0.4 : 0 });
    }
    if (type === 'medkit') {
        group.add(new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.22, 0.3), lootMats[type]));
        const handle = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.015, 6, 12, Math.PI), materials().trim);
        handle.position.y = 0.11;
        group.add(handle);
    } else if (type === 'ammo') {
        group.add(new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.2, 0.22), lootMats[type]));
        const lid = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.03, 0.24), materials().metalDark);
        lid.position.y = 0.11;
        group.add(lid);
    } else {
        for (let i = 0; i < 3; i++) {
            const stack = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.05, 0.13), lootMats[type]);
            stack.position.set(rand(-0.05, 0.05), -0.07 + i * 0.05, rand(-0.04, 0.04));
            stack.rotation.y = rand(-0.4, 0.4);
            group.add(stack);
        }
    }
    group.traverse(o => { if (o.isMesh) o.castShadow = true; });
    // delikatna poświata pod łupem, żeby łatwiej go znaleźć
    if (!lootGeo.glow) {
        lootGeo.glow = new THREE.PlaneGeometry(0.8, 0.8).rotateX(-Math.PI / 2);
        lootGeo.glowMat = new THREE.MeshBasicMaterial({ map: radialTexture('rgba(255,220,120,1)', 'rgba(255,220,120,0)'), transparent: true, opacity: 0.35, depthWrite: false, blending: THREE.AdditiveBlending });
    }
    const glow = new THREE.Mesh(lootGeo.glow, lootGeo.glowMat);
    glow.position.set(wx, wy - 0.1, wz);
    scene.add(glow);
    scene.add(group);
    lootItems.push({ mesh: group, glow, type, active: true, baseY: wy });
}

// ----------------------------------------------------------------------------
// Wraki aut: karoseria z profilu bocznego, szyby, koła z felgami, rdza
// ----------------------------------------------------------------------------
let carGrime = null;
function createAbandonedCar(cx, cz, rotY, colorHex) {
    if (!carGrime) carGrime = carGrimeTexture();
    const car = new THREE.Group();
    car.position.set(cx, 0, cz);
    car.rotation.y = rotY;
    const paint = new THREE.MeshStandardMaterial({ color: colorHex, map: carGrime, roughness: 0.55, metalness: 0.55 });
    if (!M.rubber) {
        M.rubber = new THREE.MeshStandardMaterial({ color: 0x151515, roughness: 0.9 });
        M.chrome = new THREE.MeshStandardMaterial({ color: 0x9aa0a6, roughness: 0.3, metalness: 1 });
        M.carLamp = new THREE.MeshStandardMaterial({ color: 0xd8d0b0, roughness: 0.2, metalness: 0.3 });
        M.carTail = new THREE.MeshStandardMaterial({ color: 0x6a1010, roughness: 0.3 });
    }
    const { rubber, chrome, carLamp: lampMat, carTail: tailMat } = M;

    // profil boczny (oś X = długość auta, przód w +X)
    const body = new THREE.Shape();
    body.moveTo(-2.2, 0.32);
    body.lineTo(2.15, 0.32);
    body.quadraticCurveTo(2.25, 0.36, 2.22, 0.62);
    body.lineTo(2.1, 0.86);
    body.lineTo(0.85, 0.95);
    body.lineTo(-1.85, 0.98);
    body.quadraticCurveTo(-2.2, 0.95, -2.22, 0.7);
    body.closePath();
    const bodyGeo = new THREE.ExtrudeGeometry(body, { depth: 1.76, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.05, bevelSegments: 2 });
    bodyGeo.translate(0, 0, -0.88);
    addMesh(car, bodyGeo, paint, { occlude: true });

    const cabin = new THREE.Shape();
    cabin.moveTo(0.85, 0.95);
    cabin.lineTo(0.1, 1.42);
    cabin.lineTo(-1.15, 1.44);
    cabin.lineTo(-1.75, 0.98);
    cabin.closePath();
    const glassGeo = new THREE.ExtrudeGeometry(cabin, { depth: 1.56, bevelEnabled: false });
    glassGeo.translate(0, 0, -0.78);
    addMesh(car, glassGeo, M.carGlass, { occlude: true });
    const roofPanel = addMesh(car, new THREE.BoxGeometry(1.3, 0.05, 1.6), paint);
    roofPanel.position.set(-0.52, 1.45, 0);
    // słupki
    [[0.47, 1.18, -0.6], [-1.45, 1.2, -0.62]].forEach(([px, py, rz]) => {
        [-0.79, 0.79].forEach(pz => {
            const p = addMesh(car, new THREE.BoxGeometry(0.07, 0.56, 0.05), paint);
            p.position.set(px, py, pz);
            p.rotation.z = rz;
        });
    });
    // zderzaki, światła
    [[2.27, 0.42], [-2.27, 0.42]].forEach(([bx, by]) => {
        const b = addMesh(car, new THREE.BoxGeometry(0.12, 0.14, 1.85), chrome);
        b.position.set(bx, by, 0);
    });
    [-0.62, 0.62].forEach(pz => {
        const l = addMesh(car, new THREE.BoxGeometry(0.06, 0.12, 0.32), lampMat, { cast: false });
        l.position.set(2.24, 0.66, pz);
        const t = addMesh(car, new THREE.BoxGeometry(0.06, 0.12, 0.3), tailMat, { cast: false });
        t.position.set(-2.24, 0.74, pz);
    });
    // koła (jedno przebite – auto lekko przechylone)
    const tireGeo = new THREE.CylinderGeometry(0.36, 0.36, 0.26, 18);
    tireGeo.rotateX(Math.PI / 2);
    const rimGeo = new THREE.CylinderGeometry(0.21, 0.21, 0.27, 12);
    rimGeo.rotateX(Math.PI / 2);
    [[1.38, -0.8], [1.38, 0.8], [-1.35, -0.8], [-1.35, 0.8]].forEach(([wx, wz], i) => {
        const flat = i === 1;
        const tire = addMesh(car, tireGeo, rubber);
        tire.position.set(wx, flat ? 0.27 : 0.36, wz);
        if (flat) tire.scale.set(1, 0.78, 1);
        const rim = addMesh(car, rimGeo, chrome);
        rim.position.copy(tire.position);
    });
    car.rotateX(0.03);   // przechył na przebitej oponie
    staticGroup.add(car);
    circleColliders.push({ x: cx, z: cz, radius: 2.1 });
}

// ----------------------------------------------------------------------------
// Latarnie, słupy z drutami, płoty, studnia, beczki, skrzynie, znak
// ----------------------------------------------------------------------------
function buildLampPosts() {
    const lampPositions = [
        { x: -5.5, z: -26 }, { x: 5.5, z: -10 },
        { x: -5.5, z: 4 },   { x: 5.5, z: 22, flicker: true }
    ];
    const coneTex = (() => {
        const c = document.createElement('canvas');
        c.width = 4; c.height = 128;
        const ctx = c.getContext('2d');
        const g = ctx.createLinearGradient(0, 0, 0, 128);
        g.addColorStop(0, 'rgba(255,255,255,0.9)');
        g.addColorStop(0.45, 'rgba(255,255,255,0.35)');
        g.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, 4, 128);
        const t = new THREE.CanvasTexture(c);
        t.colorSpace = THREE.SRGBColorSpace;
        return t;
    })();
    const glowTex = radialTexture('rgba(255,190,110,1)', 'rgba(255,190,110,0)');

    lampPositions.forEach(lp => {
        const dir = lp.x < 0 ? 1 : -1;
        const g = new THREE.Group();
        g.position.set(lp.x, 0, lp.z);
        const poleGeo = new THREE.CylinderGeometry(0.1, 0.17, 6.9, 10);
        const uv = poleGeo.attributes.uv;
        for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * 0.4, uv.getY(i) * 2.3);
        const pole = addMesh(g, poleGeo, M.concrete, { occlude: true });
        pole.position.y = 3.45;
        const curve = new THREE.QuadraticBezierCurve3(new THREE.Vector3(0, 6.6, 0), new THREE.Vector3(0, 7.2, 0), new THREE.Vector3(dir * 1.2, 7.0, 0));
        addMesh(g, new THREE.TubeGeometry(curve, 10, 0.05, 6), M.metalDark);
        const head = addMesh(g, new THREE.BoxGeometry(0.62, 0.14, 0.3), M.metalDark);
        head.position.set(dir * 1.25, 6.96, 0);
        const bulbMat = new THREE.MeshStandardMaterial({ color: 0x777777, emissive: 0xffc27a, emissiveIntensity: 0 });
        const lens = addMesh(g, new THREE.BoxGeometry(0.5, 0.04, 0.22), bulbMat, { cast: false });
        lens.position.set(dir * 1.25, 6.87, 0);
        const cone = new THREE.Mesh(
            new THREE.ConeGeometry(2.0, 6.8, 24, 1, true).translate(0, -3.4, 0),
            new THREE.MeshBasicMaterial({ color: 0xffc58a, map: coneTex, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: true })
        );
        cone.position.set(dir * 1.25, 6.85, 0);
        g.add(cone);
        const pool = new THREE.Mesh(new THREE.PlaneGeometry(11, 11).rotateX(-Math.PI / 2),
            new THREE.MeshBasicMaterial({ map: glowTex, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }));
        pool.position.set(dir * 1.25, 0.04, 0);
        g.add(pool);
        staticGroup.add(g);

        addFixture({
            pos: new THREE.Vector3(lp.x + dir * 1.25, 6.6, lp.z),
            color: 0xffc27a, intensity: 55, distance: 24, alwaysOn: false, flicker: !!lp.flicker,
            bulbMat, bulbOn: 6,
            glowMeshes: [{ mesh: cone, day: 0, night: 0.03 }, { mesh: pool, day: 0, night: 0.2 }]
        });
        circleColliders.push({ x: lp.x, z: lp.z, radius: 0.35 });
    });
}

function buildPowerLine() {
    const poleMat = M.planksDark;
    const parts = [];
    const tops = [];
    for (let z = -62; z <= 62; z += 25) {
        const x = 7.6;
        parts.push(placed(new THREE.CylinderGeometry(0.11, 0.15, 8.4, 8), x, 4.2, z));
        parts.push(placed(new THREE.BoxGeometry(1.6, 0.12, 0.12), x, 7.8, z));
        tops.push([new THREE.Vector3(x - 0.7, 7.9, z), new THREE.Vector3(x + 0.7, 7.9, z)]);
        circleColliders.push({ x, z, radius: 0.3 });
    }
    addMesh(staticGroup, merge(parts), poleMat, { occlude: true });
    const pts = [];
    for (let i = 0; i < tops.length - 1; i++) {
        for (let k = 0; k < 2; k++) {
            const a = tops[i][k], b = tops[i + 1][k];
            for (let s = 0; s < 12; s++) {
                const t0 = s / 12, t1 = (s + 1) / 12;
                const sag = (t) => -Math.sin(t * Math.PI) * 0.7;
                pts.push(new THREE.Vector3().lerpVectors(a, b, t0).setY(a.y + sag(t0)));
                pts.push(new THREE.Vector3().lerpVectors(a, b, t1).setY(a.y + sag(t1)));
            }
        }
    }
    const wires = new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: 0x151515 }));
    scene.add(wires);
}

function buildFences() {
    [
        { x: -18, z: -2, w: 9, d: 0.3 },
        { x: 18, z: -2, w: 9, d: 0.3 },
        { x: -28, z: -4, w: 0.3, d: 24 },
        { x: 28, z: -4, w: 0.3, d: 24 }
    ].forEach(fs => {
        const alongX = fs.w > fs.d;
        const len = alongX ? fs.w : fs.d;
        const parts = [];
        const posts = Math.round(len / 2) + 1;
        for (let i = 0; i < posts; i++) {
            const t = -len / 2 + (i / (posts - 1)) * len;
            const g = boxUV(new THREE.BoxGeometry(0.13, 1.4, 0.13), 0.13, 1.4, 0.13, 1.8, Math.random());
            parts.push(placed(g, alongX ? t : 0, 0.7, alongX ? 0 : t, 0, 0, rand(-0.06, 0.06)));
        }
        [0.45, 0.95].forEach(y => {
            let t = -len / 2;
            while (t < len / 2) {
                const seg = Math.min(2.0, len / 2 - t);
                if (Math.random() > 0.12) {   // brakujące sztachety
                    const g = boxUV(new THREE.BoxGeometry(seg, 0.12, 0.04), seg, 0.12, 0.04, 1.8, Math.random(), Math.random());
                    if (!alongX) g.rotateY(Math.PI / 2);
                    const c = t + seg / 2;
                    parts.push(placed(g, alongX ? c : 0.07, y + rand(-0.05, 0.05), alongX ? 0.07 : c, 0, 0, alongX ? rand(-0.05, 0.05) : 0));
                }
                t += seg;
            }
        });
        const fence = addMesh(staticGroup, merge(parts), M.planks, { occlude: true });
        fence.position.set(fs.x, 0, fs.z);
        boxColliders.push({ minX: fs.x - fs.w / 2, maxX: fs.x + fs.w / 2, minZ: fs.z - fs.d / 2, maxZ: fs.z + fs.d / 2 });
    });
}

function buildProps() {
    // studnia z daszkiem
    const well = new THREE.Group();
    well.position.set(-10.5, 0, 3);
    const ring = new THREE.CylinderGeometry(0.95, 1.0, 0.9, 16, 1, true);
    const ruv = ring.attributes.uv;
    for (let i = 0; i < ruv.count; i++) ruv.setXY(i, ruv.getX(i) * 3, ruv.getY(i) * 0.6);
    const wellMat = M.concrete.clone();
    wellMat.side = THREE.DoubleSide;
    addMesh(well, ring, wellMat, { occlude: true }).position.y = 0.45;
    const water = addMesh(well, new THREE.CircleGeometry(0.92, 16).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0x05080a, roughness: 0.05 }), { cast: false });
    water.position.y = 0.3;
    [-0.85, 0.85].forEach(px => addMesh(well, new THREE.BoxGeometry(0.12, 2.0, 0.12), M.planksDark).position.set(px, 1.0, 0));
    const roofParts = [-1, 1].map(s => placed(new THREE.BoxGeometry(2.1, 0.06, 0.9), 0, 2.15, s * 0.34, s * 0.75));
    addMesh(well, merge(roofParts), M.roofTiles);
    const crank = addMesh(well, new THREE.CylinderGeometry(0.08, 0.08, 1.7, 8).rotateZ(Math.PI / 2), M.planksDark);
    crank.position.y = 1.55;
    staticGroup.add(well);
    circleColliders.push({ x: -10.5, z: 3, radius: 1.05 });

    // beczki i skrzynie przy magazynie
    const barrelMat = new THREE.MeshStandardMaterial({ color: 0x5d3a22, map: carGrimeTexture(), roughness: 0.6, metalness: 0.7 });
    [[5.6, -33.2, 0], [6.5, -32.6, 0], [6.0, -34.1, 0], [-6.2, -42, 1.4]].forEach(([bx, bz, tip]) => {
        const b = addMesh(staticGroup, new THREE.CylinderGeometry(0.3, 0.3, 0.9, 14), barrelMat, { occlude: true });
        if (tip) {
            b.rotation.z = Math.PI / 2;
            b.position.set(bx, 0.3, bz);
        } else {
            b.position.set(bx, 0.45, bz);
        }
        circleColliders.push({ x: bx, z: bz, radius: 0.38 });
    });
    [[-5.9, -32.5, 0.9, 0.2], [-6.1, -33.6, 0.7, -0.3], [-5.95, -33.0, 0.6, 0.6, 0.85]].forEach(([cx, cz, s, r, y]) => {
        const g = boxUV(new THREE.BoxGeometry(s, s, s), s, s, s, 1.8, Math.random());
        const crate = addMesh(staticGroup, g, M.planks, { occlude: true });
        crate.position.set(cx, y ?? s / 2, cz);
        crate.rotation.y = r;
    });
    circleColliders.push({ x: -6.0, z: -33.0, radius: 0.85 });

    // znak z nazwą osady
    const sign = new THREE.Group();
    sign.position.set(6.3, 0, 34);
    const board = addMesh(sign, new THREE.BoxGeometry(1.7, 0.64, 0.04), [
        M.metalDark, M.metalDark, M.metalDark, M.metalDark,
        new THREE.MeshStandardMaterial({ map: villageSignTexture(), roughness: 0.6, metalness: 0.2 }), M.metalDark
    ]);
    board.position.y = 2.1;
    board.rotation.z = 0.05;
    [-0.6, 0.6].forEach(px => addMesh(sign, new THREE.CylinderGeometry(0.035, 0.035, 2.2, 8), M.metalDark).position.set(px, 1.1, -0.04));
    staticGroup.add(sign);
    circleColliders.push({ x: 6.3, z: 34, radius: 0.5 });
}

// ----------------------------------------------------------------------------
export function buildAbandonedVillage() {
    materials();
    scene.add(staticGroup);
    buildGround();
    buildRoad();

    createEnterableHouse({
        x: -18, z: -18, w: 11, d: 10, h: 3.8, doorSide: 'E',
        wallMat: M.brickRed, roofMat: M.roofTiles, boarded: ['N'], rug: '#5d2422',
        name: '🏠 Dom Ceglany (Północny-Zachód)'
    });
    createEnterableHouse({
        x: 18, z: -18, w: 11, d: 10, h: 3.8, doorSide: 'W',
        wallMat: M.plaster, roofMat: M.roofClay, boarded: ['S'], rug: '#2f4a5e',
        name: '🏠 Dom z Tynkiem (Północny-Wschód)'
    });
    createEnterableHouse({
        x: -18, z: 14, w: 10, d: 11, h: 3.8, doorSide: 'E',
        wallMat: M.siding, roofMat: M.roofTiles, boarded: ['W', 'S'], rug: '#5a4a2a', shutterMat: M.trim,
        name: '🏠 Drewniana Chata Leśnika (Południowy-Zachód)'
    });
    createEnterableHouse({
        x: 18, z: 14, w: 10, d: 11, h: 3.8, doorSide: 'W',
        wallMat: M.plasterBlue, roofMat: M.roofClay, boarded: ['N'], rug: '#4a2a4a',
        name: '🏠 Opuszczona Plebania (Południowy-Wschód)'
    });
    createEnterableHouse({
        x: 0, z: -38, w: 13, d: 10, h: 4.1, doorSide: 'S',
        wallMat: M.brickDark, roofMat: M.roofIron, boarded: ['E', 'W'], rug: '#3a3a3a', pitch: 0.42,
        name: '🏠 Dawny Magazyn Wiejski (Północ)'
    });

    buildLampPosts();
    createAbandonedCar(-2.2, -4, 0.18 + Math.PI / 2, 0x6a2a26);
    createAbandonedCar(2.4, 24, -0.32 + Math.PI / 2, 0x2c4256);
    createAbandonedCar(-8.5, -29, 1.15 + Math.PI / 2, 0x4a5032);
    buildFences();
    buildPowerLine();
    buildProps();

    // las: pierścień wokół osady (jak wcześniej) + gęsty skraj lasu przy granicy
    for (let i = 0; i < 64; i++) {
        const angle = (i / 64) * Math.PI * 2 + Math.random() * 0.08;
        const radius = 36 + Math.random() * 30;
        const tx = Math.cos(angle) * radius;
        const tz = Math.sin(angle) * radius;
        if (Math.abs(tx) < 8.5) continue;
        if (houseZones.some(hz => tx > hz.minX - 3 && tx < hz.maxX + 3 && tz > hz.minZ - 3 && tz < hz.maxZ + 3)) continue;
        addTree(tx, tz, 0.85 + Math.random() * 0.5);
    }
    [[-9, -11], [10, -26], [-11, 23], [11, 4], [-26, 2], [26, -10]].forEach(([tx, tz]) => addTree(tx, tz, 1.05));
    for (let i = 0; i < 260; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = WORLD_RADIUS - 2 + Math.random() * 46;
        const tx = Math.cos(angle) * radius;
        const tz = Math.sin(angle) * radius;
        if (Math.abs(tx) < 6.5) continue;
        addTree(tx, tz, 0.9 + Math.random() * 0.6, radius < WORLD_RADIUS + 2);
    }
    buildTrees();
    buildTreeline();
    batchStatic(staticGroup);
}

// Co klatkę: wiatr w trawie, obracający się łup
export function updateWorld(dt, time) {
    windUniform.value = time;
    for (const item of lootItems) {
        if (!item.active) continue;
        item.mesh.rotation.y += dt * 1.4;
        item.mesh.position.y = item.baseY + Math.sin(time * 2.2 + item.mesh.position.x) * 0.025;
    }
}
