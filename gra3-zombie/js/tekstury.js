// ============================================================================
// TEKSTURY: SKANY PBR Z POLY HAVEN (CC0) ORAZ TEKSTURY RYSOWANE KODEM (CANVAS 2D)
// ============================================================================
import * as THREE from 'three';

export const loadingManager = new THREE.LoadingManager();
const loader = new THREE.TextureLoader(loadingManager);
let maxAnisotropy = 4;

export function setMaxAnisotropy(value) {
    maxAnisotropy = Math.min(8, value);
}

// Rozmiar jednego kafla tekstury w metrach (wymiary skanów z Poly Haven)
const TILE = {
    leafy_grass: 2.0, brown_mud_leaves_01: 1.3, asphalt_02: 3.0, brick_4: 0.9, brick_wall_10: 1.9,
    damaged_plaster: 1.85, weathered_plank_siding: 1.57, blue_plaster_weathered: 2.0, roof_tiles_14: 1.5,
    clay_roof_tiles_02: 2.5, rusty_corrugated_iron: 2.0, wood_floor_worn: 2.0, beige_wall_001: 3.0,
    pine_bark: 1.0, weathered_brown_planks: 1.8, concrete_moss: 3.0
};

const pbrCache = {};

// Materiał PBR: kolor (sRGB), normalne (OpenGL) i ARM = AO / chropowatość / metaliczność w kanałach R/G/B
export function pbrMaterial(id, opts = {}) {
    const key = id + JSON.stringify(opts);
    if (pbrCache[key]) return pbrCache[key];
    const tex = (kind) => {
        const t = loader.load(`tekstury/${id}_${kind}.jpg`);
        t.wrapS = t.wrapT = THREE.RepeatWrapping;
        t.anisotropy = maxAnisotropy;
        if (kind === 'diff') t.colorSpace = THREE.SRGBColorSpace;
        if (opts.repeat) t.repeat.set(opts.repeat[0], opts.repeat[1]);
        return t;
    };
    const arm = tex('arm');
    const mat = new THREE.MeshStandardMaterial({
        map: tex('diff'),
        normalMap: tex('nor'),
        roughnessMap: arm,
        aoMap: arm,
        aoMapIntensity: opts.ao ?? 1.0,
        roughness: opts.roughness ?? 1.0,
        metalness: opts.metal ? 1.0 : 0.0,
        color: opts.color ?? 0xffffff
    });
    if (opts.metal) mat.metalnessMap = arm;
    if (opts.normalScale) mat.normalScale.set(opts.normalScale, opts.normalScale);
    if (opts.vertexColors) mat.vertexColors = true;
    mat.userData.tile = opts.tile ?? TILE[id] ?? 1;
    pbrCache[key] = mat;
    return mat;
}

// Skaluje UV prostopadłościanu tak, aby tekstura miała prawdziwą wielkość w metrach
// (BoxGeometry: ściany +x, -x, +y, -y, +z, -z – po 4 wierzchołki)
export function boxUV(geo, w, h, d, tile, offU = 0, offV = 0) {
    const uv = geo.attributes.uv;
    const dims = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]];
    for (let f = 0; f < 6; f++) {
        for (let i = 0; i < 4; i++) {
            const idx = f * 4 + i;
            uv.setXY(idx, uv.getX(idx) * dims[f][0] / tile + offU, uv.getY(idx) * dims[f][1] / tile + offV);
        }
    }
    uv.needsUpdate = true;
    return geo;
}

export function planeUV(geo, w, h, tile, offU = 0, offV = 0) {
    const uv = geo.attributes.uv;
    for (let i = 0; i < uv.count; i++) {
        uv.setXY(i, uv.getX(i) * w / tile + offU, uv.getY(i) * h / tile + offV);
    }
    uv.needsUpdate = true;
    return geo;
}

// ----------------------------------------------------------------------------
// Tekstury rysowane kodem
// ----------------------------------------------------------------------------
function canvas(w, h = w) {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    return { c, ctx: c.getContext('2d') };
}

function toTexture(c, srgb = true, repeat = false) {
    const t = new THREE.CanvasTexture(c);
    if (srgb) t.colorSpace = THREE.SRGBColorSpace;
    if (repeat) t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.anisotropy = maxAnisotropy;
    return t;
}

const rand = (a, b) => a + Math.random() * (b - a);

// Kępka trawy: źdźbła od dołu do góry, przejrzyste tło
export function grassBladesTexture() {
    const { c, ctx } = canvas(256);
    const colors = ['#4f6a2c', '#5e7a34', '#6b7d36', '#7f8240', '#8c7f45', '#47612a', '#3d5424', '#97894d'];
    for (let i = 0; i < 70; i++) {
        const x = rand(10, 246);
        const h = rand(110, 250);
        const bend = rand(-40, 40);
        const w = rand(3, 7);
        ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
        ctx.beginPath();
        ctx.moveTo(x - w, 256);
        ctx.quadraticCurveTo(x - w * 0.3 + bend * 0.4, 256 - h * 0.55, x + bend, 256 - h);
        ctx.quadraticCurveTo(x + w * 0.3 + bend * 0.4, 256 - h * 0.55, x + w, 256);
        ctx.closePath();
        ctx.fill();
    }
    // ciemniejszy dół kępki (cień między źdźbłami)
    const g = ctx.createLinearGradient(0, 256, 0, 140);
    g.addColorStop(0, 'rgba(20,28,10,0.55)');
    g.addColorStop(1, 'rgba(20,28,10,0)');
    ctx.globalCompositeOperation = 'source-atop';
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 256, 256);
    return toTexture(c);
}

// Gałąź świerka do koron drzew: oś z igłami
export function spruceBranchTexture() {
    const { c, ctx } = canvas(256, 128);
    const greens = ['#1d3020', '#24392a', '#2c4430', '#1a2a1c', '#33503a', '#3a5a3a'];
    ctx.lineCap = 'round';
    const branch = (x0, y0, x1, y1, width, depth) => {
        ctx.strokeStyle = '#2e2418';
        ctx.lineWidth = width;
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y1);
        ctx.stroke();
        const len = Math.hypot(x1 - x0, y1 - y0);
        const steps = Math.floor(len / 2.2);
        for (let i = 0; i < steps; i++) {
            const t = i / steps;
            const px = x0 + (x1 - x0) * t;
            const py = y0 + (y1 - y0) * t;
            const size = (1 - t * 0.55) * (depth === 0 ? 30 : 16);
            for (const side of [-1, 1]) {
                ctx.strokeStyle = greens[Math.floor(Math.random() * greens.length)];
                ctx.lineWidth = rand(1.4, 2.6);
                const ang = Math.atan2(y1 - y0, x1 - x0) + side * rand(0.9, 1.35);
                ctx.beginPath();
                ctx.moveTo(px, py);
                ctx.lineTo(px + Math.cos(ang) * size * rand(0.6, 1), py + Math.sin(ang) * size * rand(0.6, 1));
                ctx.stroke();
            }
        }
        if (depth === 0) {
            for (let i = 1; i < 6; i++) {
                const t = i / 6;
                const px = x0 + (x1 - x0) * t;
                const py = y0 + (y1 - y0) * t;
                const side = i % 2 ? -1 : 1;
                branch(px, py, px + (1 - t) * 70 * rand(0.7, 1), py + side * (1 - t) * 38, 1.5, 1);
            }
        }
    };
    branch(4, 64, 250, 64 + rand(-8, 8), 4, 0);
    return toTexture(c);
}

// Daleka ściana lasu na horyzoncie (sylwetki świerków)
export function treelineTexture() {
    const { c, ctx } = canvas(1024, 256);
    ctx.fillStyle = '#ffffff';
    for (let layer = 0; layer < 2; layer++) {
        let x = -20;
        while (x < 1044) {
            const h = rand(110, 230) * (layer ? 0.8 : 1);
            const w = h * rand(0.28, 0.38);
            ctx.beginPath();
            ctx.moveTo(x - w / 2, 256);
            for (let i = 0; i <= 10; i++) {
                const t = i / 10;
                const yy = 256 - h * t;
                const ww = (w / 2) * (1 - t) * (i % 2 ? 1.0 : 0.65);
                ctx.lineTo(x - ww, yy);
            }
            ctx.lineTo(x, 256 - h - 6);
            for (let i = 10; i >= 0; i--) {
                const t = i / 10;
                const yy = 256 - h * t;
                const ww = (w / 2) * (1 - t) * (i % 2 ? 1.0 : 0.65);
                ctx.lineTo(x + ww, yy);
            }
            ctx.closePath();
            ctx.fill();
            x += w * rand(0.35, 0.7);
        }
    }
    const t = toTexture(c, true, true);
    return t;
}

// Miękka plama (poświata lamp, cienie, dym)
export function radialTexture(inner = 'rgba(255,255,255,1)', outer = 'rgba(255,255,255,0)', size = 128) {
    const { c, ctx } = canvas(size);
    const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    g.addColorStop(0, inner);
    g.addColorStop(1, outer);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    return toTexture(c);
}

export function smokeTexture() {
    const { c, ctx } = canvas(128);
    for (let i = 0; i < 26; i++) {
        const x = 64 + rand(-26, 26);
        const y = 64 + rand(-26, 26);
        const r = rand(14, 34);
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, 'rgba(255,255,255,0.22)');
        g.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, 128, 128);
    }
    return toTexture(c);
}

// Błysk z lufy: gwiazda z jasnym środkiem
export function muzzleFlashTexture() {
    const { c, ctx } = canvas(128);
    ctx.translate(64, 64);
    for (let i = 0; i < 7; i++) {
        ctx.rotate((Math.PI * 2) / 7 + rand(-0.2, 0.2));
        const len = rand(36, 62);
        const g = ctx.createLinearGradient(0, 0, len, 0);
        g.addColorStop(0, 'rgba(255,240,200,1)');
        g.addColorStop(0.4, 'rgba(255,170,60,0.8)');
        g.addColorStop(1, 'rgba(255,90,20,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.moveTo(0, -7);
        ctx.lineTo(len, 0);
        ctx.lineTo(0, 7);
        ctx.fill();
    }
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 30);
    g.addColorStop(0, 'rgba(255,255,240,1)');
    g.addColorStop(1, 'rgba(255,200,90,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, 0, 30, 0, Math.PI * 2);
    ctx.fill();
    return toTexture(c);
}

// Plama krwi na ziemi (biała – kolor nadaje materiał)
export function bloodSplatTexture() {
    const { c, ctx } = canvas(256);
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(128, 128, 62, 0, Math.PI * 2);
    ctx.fill();
    for (let i = 0; i < 26; i++) {
        const a = rand(0, Math.PI * 2);
        const d = rand(40, 112);
        ctx.beginPath();
        ctx.arc(128 + Math.cos(a) * d, 128 + Math.sin(a) * d, rand(4, 22) * (1 - d / 140), 0, Math.PI * 2);
        ctx.fill();
    }
    for (let i = 0; i < 8; i++) {
        const a = rand(0, Math.PI * 2);
        ctx.lineWidth = rand(5, 12);
        ctx.strokeStyle = '#fff';
        ctx.beginPath();
        ctx.moveTo(128, 128);
        ctx.lineTo(128 + Math.cos(a) * rand(70, 115), 128 + Math.sin(a) * rand(70, 115));
        ctx.stroke();
    }
    return toTexture(c, false);
}

// Dziura po kuli w ścianie
export function bulletHoleTexture() {
    const { c, ctx } = canvas(64);
    const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 30);
    g.addColorStop(0, 'rgba(10,8,6,1)');
    g.addColorStop(0.22, 'rgba(18,14,10,1)');
    g.addColorStop(0.32, 'rgba(60,52,44,0.85)');
    g.addColorStop(1, 'rgba(60,52,44,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 64, 64);
    ctx.strokeStyle = 'rgba(15,12,10,0.7)';
    ctx.lineWidth = 1.2;
    for (let i = 0; i < 6; i++) {
        const a = rand(0, Math.PI * 2);
        ctx.beginPath();
        ctx.moveTo(32 + Math.cos(a) * 6, 32 + Math.sin(a) * 6);
        ctx.lineTo(32 + Math.cos(a) * rand(14, 24), 32 + Math.sin(a) * rand(14, 24));
        ctx.stroke();
    }
    return toTexture(c);
}

// Dywan w domku
export function rugTexture(main = '#6e2a26', accent = '#c8a36a') {
    const { c, ctx } = canvas(256, 384);
    ctx.fillStyle = main;
    ctx.fillRect(0, 0, 256, 384);
    ctx.strokeStyle = accent;
    ctx.lineWidth = 8;
    ctx.strokeRect(16, 16, 224, 352);
    ctx.lineWidth = 3;
    ctx.strokeRect(34, 34, 188, 316);
    ctx.fillStyle = accent;
    for (let y = 70; y < 330; y += 52) {
        ctx.beginPath();
        ctx.moveTo(128, y - 18);
        ctx.lineTo(150, y);
        ctx.lineTo(128, y + 18);
        ctx.lineTo(106, y);
        ctx.closePath();
        ctx.fill();
    }
    for (let i = 0; i < 9000; i++) {
        ctx.fillStyle = `rgba(0,0,0,${rand(0, 0.12)})`;
        ctx.fillRect(rand(0, 256), rand(0, 384), 2, 2);
    }
    return toTexture(c);
}

// Etykiety skrzynek z łupem (apteczka, amunicja, gotówka)
export function lootTexture(type) {
    const { c, ctx } = canvas(128);
    if (type === 'medkit') {
        ctx.fillStyle = '#e8e6df';
        ctx.fillRect(0, 0, 128, 128);
        ctx.fillStyle = '#c81e1e';
        ctx.fillRect(48, 22, 32, 84);
        ctx.fillRect(22, 48, 84, 32);
    } else if (type === 'ammo') {
        ctx.fillStyle = '#4b5320';
        ctx.fillRect(0, 0, 128, 128);
        ctx.fillStyle = '#e6d36a';
        ctx.font = 'bold 30px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('AMMO', 64, 58);
        ctx.font = 'bold 20px sans-serif';
        ctx.fillText('7.62 • 9MM', 64, 88);
    } else {
        ctx.fillStyle = '#6f8f62';
        ctx.fillRect(0, 0, 128, 128);
        ctx.strokeStyle = '#2f4a2a';
        ctx.lineWidth = 4;
        ctx.strokeRect(8, 26, 112, 76);
        ctx.fillStyle = '#2f4a2a';
        ctx.font = 'bold 44px serif';
        ctx.textAlign = 'center';
        ctx.fillText('$', 64, 80);
    }
    for (let i = 0; i < 1600; i++) {
        ctx.fillStyle = `rgba(0,0,0,${rand(0, 0.1)})`;
        ctx.fillRect(rand(0, 128), rand(0, 128), 2, 2);
    }
    return toTexture(c);
}

// Brud i rdza na karoserii porzuconych aut (mnożone przez kolor lakieru)
export function carGrimeTexture() {
    const { c, ctx } = canvas(256);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 60; i++) {
        const x = rand(0, 256), y = rand(0, 256), r = rand(3, 18);
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        const rust = Math.random() < 0.3;
        g.addColorStop(0, rust ? 'rgba(150,85,40,0.55)' : 'rgba(205,195,175,0.25)');
        g.addColorStop(1, 'rgba(205,195,175,0)');
        ctx.fillStyle = g;
        ctx.fillRect(x - r, y - r, r * 2, r * 2);
    }
    const g = ctx.createLinearGradient(0, 256, 0, 150);
    g.addColorStop(0, 'rgba(70,58,40,0.7)');
    g.addColorStop(1, 'rgba(70,58,40,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 256, 256);
    return toTexture(c, true, true);
}

// Słoje drewna (orzech) na kolby i okładziny broni
export function gunWoodTexture() {
    const { c, ctx } = canvas(256);
    ctx.fillStyle = '#5a3418';
    ctx.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 90; i++) {
        ctx.strokeStyle = `rgba(${rand(20, 60)},${rand(10, 30)},5,${rand(0.15, 0.4)})`;
        ctx.lineWidth = rand(1, 3);
        ctx.beginPath();
        const y = rand(0, 256);
        ctx.moveTo(0, y);
        for (let x = 0; x <= 256; x += 16) ctx.lineTo(x, y + Math.sin(x * 0.03 + i) * rand(2, 6));
        ctx.stroke();
    }
    return toTexture(c, true, true);
}

// Tablica z nazwą miejscowości (biała, czarne litery – jak polski znak „obszar zabudowany”)
export function villageSignTexture() {
    const { c, ctx } = canvas(512, 192);
    ctx.fillStyle = '#e9e7df';
    ctx.fillRect(0, 0, 512, 192);
    ctx.strokeStyle = '#141414';
    ctx.lineWidth = 10;
    ctx.strokeRect(14, 14, 484, 164);
    ctx.fillStyle = '#141414';
    ctx.font = 'bold 74px "Arial Narrow", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('MARTWA OSADA', 256, 98);
    for (let i = 0; i < 2400; i++) {
        ctx.fillStyle = `rgba(90,60,30,${rand(0, 0.12)})`;
        ctx.fillRect(rand(0, 512), rand(0, 192), rand(1, 4), rand(1, 4));
    }
    for (let i = 0; i < 6; i++) {
        const x = rand(30, 480), y = rand(30, 160);
        const g = ctx.createRadialGradient(x, y, 0, x, y, rand(8, 30));
        g.addColorStop(0, 'rgba(110,55,20,0.7)');
        g.addColorStop(1, 'rgba(110,55,20,0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, 512, 192);
    }
    return toTexture(c);
}

// Atlas zombie 512x512: skóra | koszula / spodnie | buty, włosy, oczy, usta
export const ATLAS = {
    skin:  [0, 0, 0.5, 0.5],
    shirt: [0.5, 0, 0.5, 0.5],
    pants: [0, 0.5, 0.5, 0.5],
    shoes: [0.5, 0.5, 0.25, 0.25],
    hair:  [0.75, 0.5, 0.25, 0.25],
    eyes:  [0.5, 0.75, 0.25, 0.25],
    mouth: [0.75, 0.75, 0.25, 0.25]
};

export function zombieAtlasTextures(cfg) {
    const S = 512;
    const { c, ctx } = canvas(S);
    const em = canvas(S);
    em.ctx.fillStyle = '#000';
    em.ctx.fillRect(0, 0, S, S);
    // Uwaga: v=0 jest na dole tekstury, więc y w canvasie liczymy od góry: (1 - v - h)
    const rect = (r) => [r[0] * S, (1 - r[1] - r[3]) * S, r[2] * S, r[3] * S];
    const blotches = (r, colors, count, min, max, alpha = 0.5) => {
        const [x, y, w, h] = rect(r);
        ctx.save();
        ctx.beginPath();
        ctx.rect(x, y, w, h);
        ctx.clip();
        for (let i = 0; i < count; i++) {
            const px = x + Math.random() * w, py = y + Math.random() * h, rr = rand(min, max);
            const g = ctx.createRadialGradient(px, py, 0, px, py, rr);
            const col = colors[Math.floor(Math.random() * colors.length)];
            g.addColorStop(0, col.replace('A', alpha));
            g.addColorStop(1, col.replace('A', 0));
            ctx.fillStyle = g;
            ctx.fillRect(px - rr, py - rr, rr * 2, rr * 2);
        }
        ctx.restore();
    };
    const fill = (r, col) => {
        const [x, y, w, h] = rect(r);
        ctx.fillStyle = col;
        ctx.fillRect(x, y, w, h);
    };
    const speckle = (r, count, alpha) => {
        const [x, y, w, h] = rect(r);
        for (let i = 0; i < count; i++) {
            ctx.fillStyle = Math.random() < 0.5 ? `rgba(0,0,0,${rand(0, alpha)})` : `rgba(255,255,255,${rand(0, alpha * 0.5)})`;
            ctx.fillRect(x + Math.random() * w, y + Math.random() * h, 2, 2);
        }
    };

    // Skóra: blada, plamy, żyłki, zaschnięta krew
    fill(ATLAS.skin, cfg.skin);
    blotches(ATLAS.skin, ['rgba(60,70,50,A)', 'rgba(110,80,90,A)', 'rgba(150,150,120,A)'], 60, 8, 40, 0.45);
    blotches(ATLAS.skin, ['rgba(90,10,10,A)', 'rgba(60,5,5,A)'], 14, 5, 22, 0.7);
    {
        const [x, y, w, h] = rect(ATLAS.skin);
        ctx.strokeStyle = 'rgba(50,40,70,0.35)';
        ctx.lineWidth = 1;
        for (let i = 0; i < 40; i++) {
            ctx.beginPath();
            let px = x + Math.random() * w, py = y + Math.random() * h;
            ctx.moveTo(px, py);
            for (let k = 0; k < 5; k++) {
                px += rand(-10, 10);
                py += rand(-10, 10);
                ctx.lineTo(Math.min(x + w, Math.max(x, px)), Math.min(y + h, Math.max(y, py)));
            }
            ctx.stroke();
        }
    }
    speckle(ATLAS.skin, 3000, 0.12);

    // Koszula: tkanina, brud, krew, dziury
    fill(ATLAS.shirt, cfg.shirt);
    if (cfg.flannel) {
        const [x, y, w, h] = rect(ATLAS.shirt);
        ctx.fillStyle = 'rgba(20,10,10,0.35)';
        for (let i = 0; i < w; i += 22) ctx.fillRect(x + i, y, 8, h);
        for (let i = 0; i < h; i += 22) ctx.fillRect(x, y + i, w, 8);
        ctx.fillStyle = 'rgba(200,170,150,0.12)';
        for (let i = 11; i < w; i += 22) ctx.fillRect(x + i, y, 3, h);
    }
    {
        const [x, y, w, h] = rect(ATLAS.shirt);
        for (let i = 0; i < h; i += 3) {
            ctx.fillStyle = `rgba(0,0,0,${rand(0.02, 0.08)})`;
            ctx.fillRect(x, y + i, w, 1);
        }
    }
    blotches(ATLAS.shirt, ['rgba(70,55,35,A)', 'rgba(40,35,30,A)'], 30, 10, 45, 0.5);
    blotches(ATLAS.shirt, ['rgba(95,8,8,A)', 'rgba(60,4,4,A)'], 10 + Math.round(cfg.torn * 16), 10, 40, 0.8);
    {
        const [x, y, w, h] = rect(ATLAS.shirt);
        const holes = Math.round(cfg.torn * 18);
        for (let i = 0; i < holes; i++) {
            ctx.fillStyle = cfg.skinDark;
            ctx.beginPath();
            const px = x + Math.random() * w, py = y + Math.random() * h;
            ctx.moveTo(px, py);
            for (let k = 0; k < 7; k++) ctx.lineTo(px + rand(-18, 18), py + rand(-18, 18));
            ctx.fill();
        }
    }
    speckle(ATLAS.shirt, 2500, 0.1);

    // Spodnie: dżins/sukno, błoto na dole
    fill(ATLAS.pants, cfg.pants);
    {
        const [x, y, w, h] = rect(ATLAS.pants);
        for (let i = 0; i < w; i += 2) {
            ctx.fillStyle = `rgba(255,255,255,${rand(0, 0.05)})`;
            ctx.fillRect(x + i, y, 1, h);
        }
        const g = ctx.createLinearGradient(0, y + h, 0, y + h * 0.4);
        g.addColorStop(0, 'rgba(60,45,25,0.8)');
        g.addColorStop(1, 'rgba(60,45,25,0)');
        ctx.fillStyle = g;
        ctx.fillRect(x, y, w, h);
    }
    blotches(ATLAS.pants, ['rgba(90,8,8,A)'], 6, 8, 26, 0.7);
    speckle(ATLAS.pants, 2000, 0.1);

    fill(ATLAS.shoes, cfg.shoes);
    speckle(ATLAS.shoes, 800, 0.2);
    fill(ATLAS.hair, cfg.hair);
    {
        const [x, y, w, h] = rect(ATLAS.hair);
        ctx.strokeStyle = 'rgba(255,255,255,0.08)';
        for (let i = 0; i < 300; i++) {
            ctx.beginPath();
            const px = x + Math.random() * w, py = y + Math.random() * h;
            ctx.moveTo(px, py);
            ctx.lineTo(px + rand(-3, 3), py + rand(6, 14));
            ctx.stroke();
        }
    }
    fill(ATLAS.eyes, '#d8d2b8');
    {
        const [x, y, w, h] = rect(ATLAS.eyes);
        ctx.fillStyle = cfg.eyeColor;
        ctx.fillRect(x + w * 0.3, y + h * 0.3, w * 0.4, h * 0.4);
        em.ctx.fillStyle = cfg.eyeColor;
        em.ctx.fillRect(x, y, w, h);
    }
    fill(ATLAS.mouth, '#2a0a08');
    blotches(ATLAS.mouth, ['rgba(140,20,15,A)'], 10, 6, 20, 0.8);

    const map = toTexture(c);
    const emissive = toTexture(em.c);
    return { map, emissive };
}
