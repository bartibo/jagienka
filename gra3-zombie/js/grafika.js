// ============================================================================
// GRAFIKA: RENDERER, NIEBO (ATMOSFERA + CHMURY + GWIAZDY), ŚWIATŁA, CIENIE,
// POSTPROCESSING (BLOOM, WINIETA, ZIARNO) I PRESETY JAKOŚCI
// ============================================================================
import * as THREE from 'three';
import { Sky } from 'three/addons/objects/Sky.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { Pass } from 'three/addons/postprocessing/Pass.js';

export const VIEWMODEL_LAYER = 1;   // broń i dłonie gracza rysowane osobno (nie wchodzą w ściany)

export const canvas = document.getElementById('game-canvas');
export const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance', stencil: false });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.6;
renderer.shadowMap.enabled = true;
renderer.shadowMap.autoUpdate = false;   // mapa cieni liczona raz na klatkę (nie przy drugim przebiegu broni)

export const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x9fb2c4, 0.0072);

export const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.05, 900);
camera.rotation.order = 'YXZ';
scene.add(camera);

function bothLayers(obj) {
    obj.layers.enable(VIEWMODEL_LAYER);
    return obj;
}

// ----------------------------------------------------------------------------
// Światła
// ----------------------------------------------------------------------------
export const hemiLight = bothLayers(new THREE.HemisphereLight(0xc9dcf2, 0x4b4232, 0.9));
scene.add(hemiLight);

export const sunLight = bothLayers(new THREE.DirectionalLight(0xfff1dc, 3.2));
sunLight.castShadow = true;
sunLight.shadow.camera.near = 1;
sunLight.shadow.camera.far = 260;
sunLight.shadow.bias = -0.0004;
sunLight.shadow.normalBias = 0.03;
scene.add(sunLight);
scene.add(sunLight.target);

// Latarka taktyczna gracza
// (tylko warstwa świata – z bliska prześwietlałaby broń w dłoniach)
export const flashlight = new THREE.SpotLight(0xfff3dc, 0, 55, 0.42, 0.55, 1.4);
flashlight.position.set(0.22, -0.15, 0);
flashlight.target.position.set(0, -0.6, -12);
camera.add(flashlight);
camera.add(flashlight.target);

// Błysk wystrzału z lufy
export const muzzleLight = bothLayers(new THREE.PointLight(0xffa64a, 0, 14, 1.6));
muzzleLight.position.set(0.25, -0.18, -1.1);
camera.add(muzzleLight);

// Źródła światła w osadzie (latarnie, żarówki w domkach). Świateł WebGL jest mniej niż źródeł,
// więc co klatkę przypinamy je do najbliższych graczowi – reszta świeci tylko „na oko” (żarówka, poświata).
export const fixtures = [];
let lightPool = [];

export function addFixture(f) {
    // f: { pos, color, intensity, distance, alwaysOn, bulbMat, glowMeshes:[{mesh, day, night}] }
    fixtures.push(f);
    return f;
}

function rebuildLightPool(count) {
    lightPool.forEach(l => scene.remove(l));
    lightPool = [];
    for (let i = 0; i < count; i++) {
        const l = bothLayers(new THREE.PointLight(0xffb15c, 0, 16, 1.7));
        scene.add(l);
        lightPool.push(l);
    }
}

// ----------------------------------------------------------------------------
// Niebo: atmosfera Preethama + kopuła z chmurami, gwiazdami i księżycem
// ----------------------------------------------------------------------------
const sky = new Sky();
sky.scale.setScalar(800);
const skyU = sky.material.uniforms;
skyU.turbidity.value = 3.5;
skyU.rayleigh.value = 1.8;
skyU.mieCoefficient.value = 0.003;
skyU.mieDirectionalG.value = 0.85;
scene.add(sky);

const DAY_SUN_DIR = new THREE.Vector3(0.52, 0.62, 0.42).normalize();
const MOON_DIR = new THREE.Vector3(-0.45, 0.55, -0.62).normalize();

const domeMaterial = new THREE.ShaderMaterial({
    uniforms: {
        uNight: { value: 0 },
        uTime: { value: 0 },
        uSunDir: { value: DAY_SUN_DIR.clone() },
        uMoonDir: { value: MOON_DIR.clone() },
        uCloudDay: { value: new THREE.Color(1.0, 0.98, 0.95) },
        uCloudLight: { value: 6.0 }
    },
    vertexShader: /* glsl */`
        varying vec3 vDir;
        void main() {
            vDir = normalize((modelMatrix * vec4(position, 1.0)).xyz - cameraPosition);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            gl_Position.z = gl_Position.w;
        }`,
    fragmentShader: /* glsl */`
        uniform float uNight;
        uniform float uTime;
        uniform vec3 uSunDir;
        uniform vec3 uMoonDir;
        uniform vec3 uCloudDay;
        uniform float uCloudLight;
        varying vec3 vDir;

        float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
        float hash3(vec3 p) { return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453); }
        float noise(vec2 p) {
            vec2 i = floor(p); vec2 f = fract(p);
            vec2 u = f * f * (3.0 - 2.0 * f);
            return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
        }
        float fbm(vec2 p) {
            float v = 0.0; float a = 0.5;
            for (int i = 0; i < 5; i++) { v += a * noise(p); p = p * 2.03 + vec2(1.7, 9.2); a *= 0.5; }
            return v;
        }
        void main() {
            vec3 dir = normalize(vDir);
            float up = max(dir.y, 0.0);

            // Nocne niebo z gradientem, gwiazdami i księżycem
            vec3 night = mix(vec3(0.010, 0.016, 0.034), vec3(0.002, 0.003, 0.009), pow(up, 0.6));
            vec3 q = dir * 260.0;
            vec3 cell = floor(q);
            float h = hash3(cell);
            float star = step(0.9965, h) * smoothstep(0.42, 0.0, length(fract(q) - 0.5));
            star *= 0.6 + 0.4 * sin(uTime * (2.0 + h * 5.0) + h * 40.0);
            night += vec3(0.9, 0.95, 1.0) * star * 2.5 * smoothstep(0.0, 0.25, dir.y);
            float md = dot(dir, uMoonDir);
            night += vec3(0.95, 0.96, 1.0) * smoothstep(0.99955, 0.9997, md) * 6.0;
            night += vec3(0.25, 0.32, 0.5) * pow(max(md, 0.0), 220.0) * 1.2;

            // Chmury rzutowane na płaszczyznę nad osadą
            vec2 cuv = dir.xz / max(dir.y, 0.06) * 0.55 + vec2(uTime * 0.006, uTime * 0.002);
            float c = fbm(cuv * 1.2);
            float cover = smoothstep(0.50, 0.78, c) * smoothstep(0.02, 0.22, dir.y);
            float shade = fbm(cuv * 2.4 + 3.1);
            float sunSide = pow(max(dot(dir, uSunDir), 0.0), 6.0);
            vec3 dayCloud = uCloudDay * uCloudLight * (0.55 + 0.45 * shade + sunSide * 0.8);
            vec3 nightCloud = vec3(0.020, 0.024, 0.036) * (0.6 + 0.4 * shade) + vec3(0.08, 0.09, 0.12) * pow(max(md, 0.0), 12.0);
            vec3 cloud = mix(dayCloud, nightCloud, uNight);
            cover *= mix(0.9, 0.75, uNight);

            // Składanie „over”: chmury na noc na atmosferę (alfa przemnożona)
            vec3 rgb = cloud * cover + (1.0 - cover) * uNight * night;
            float a = 1.0 - (1.0 - cover) * (1.0 - uNight);
            gl_FragColor = vec4(rgb, a);
        }`,
    side: THREE.BackSide,
    depthWrite: false,
    transparent: true,
    fog: false,
    blending: THREE.CustomBlending,
    blendSrc: THREE.OneFactor,
    blendDst: THREE.OneMinusSrcAlphaFactor
});
const dome = new THREE.Mesh(new THREE.SphereGeometry(700, 32, 16), domeMaterial);
dome.renderOrder = -1;
scene.add(dome);

// Mapy otoczenia (odbicia i rozproszone światło nieba) – liczone raz: dzień i zmierzch
const pmrem = new THREE.PMREMGenerator(renderer);
function makeEnvironment(sunDir, turbidity) {
    const envScene = new THREE.Scene();
    const envSky = new Sky();
    envSky.scale.setScalar(50);
    const u = envSky.material.uniforms;
    u.turbidity.value = turbidity;
    u.rayleigh.value = skyU.rayleigh.value;
    u.mieCoefficient.value = skyU.mieCoefficient.value;
    u.mieDirectionalG.value = skyU.mieDirectionalG.value;
    u.sunPosition.value.copy(sunDir);
    envScene.add(envSky);
    // ciemna „ziemia” pod horyzontem, żeby odbicia od dołu nie były niebieskie
    const ground = new THREE.Mesh(new THREE.CircleGeometry(40, 16), new THREE.MeshBasicMaterial({ color: 0x1c1a14 }));
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -2;
    envScene.add(ground);
    const rt = pmrem.fromScene(envScene, 0.02, 0.1, 200);
    envSky.material.dispose();
    return rt.texture;
}
const envDay = makeEnvironment(DAY_SUN_DIR, 3.5);
const envDusk = makeEnvironment(new THREE.Vector3(DAY_SUN_DIR.x, 0.06, DAY_SUN_DIR.z).normalize(), 9);
scene.environment = envDay;

// ----------------------------------------------------------------------------
// Pora dnia (0 = dzień, 1 = noc) – kolory, światła, mgła, ekspozycja
// ----------------------------------------------------------------------------
const C = (hex) => new THREE.Color(hex);
const PALETTE = {
    fog:  [C(0x9fb2c4), C(0xb88a70), C(0x0b1018)],
    sun:  [C(0xfff1dc), C(0xffa060), C(0x90a8d8)],
    hemiSky: [C(0xc9dcf2), C(0xe0a888), C(0x223048)],
    hemiGround: [C(0x4b4232), C(0x3a2c22), C(0x0c0c10)]
};
const tmpColor = new THREE.Color();
function palette(name, b) {
    const p = PALETTE[name];
    if (b < 0.5) return tmpColor.copy(p[0]).lerp(p[1], b * 2);
    return tmpColor.copy(p[1]).lerp(p[2], (b - 0.5) * 2);
}

const sunDir = new THREE.Vector3();
const shadowCenter = new THREE.Vector3();
const lightSpace = new THREE.Matrix4();
const lightSpaceInv = new THREE.Matrix4();
const fixtureOrder = [];
const ORIGIN = new THREE.Vector3(0, 0, 0);
const UP = new THREE.Vector3(0, 1, 0);
const CLOUD_NOON = C(0xfff8f0);
const CLOUD_DUSK = C(0xffb080);
let shadowExtent = 32;
let elapsed = 0;

const INDOOR_BOUNCE = C(0x9a8a74);
let indoorBlend = 0;

export function updateEnvironment(dt, blend, playerPos, indoors = false) {
    elapsed += dt;
    indoorBlend = THREE.MathUtils.lerp(indoorBlend, indoors ? 1 : 0, Math.min(1, dt * 3));
    const b = blend;
    domeMaterial.uniforms.uTime.value = elapsed;
    domeMaterial.uniforms.uNight.value = THREE.MathUtils.smoothstep(b, 0.45, 0.85);

    // Słońce zachodzi wraz z przejściem do nocy, potem światło kierunkowe staje się księżycem
    const elev = THREE.MathUtils.lerp(Math.asin(DAY_SUN_DIR.y), -0.18, Math.min(1, b * 1.25));
    const horiz = Math.cos(elev);
    const az = Math.atan2(DAY_SUN_DIR.z, DAY_SUN_DIR.x);
    sunDir.set(Math.cos(az) * horiz, Math.sin(elev), Math.sin(az) * horiz);
    skyU.sunPosition.value.copy(sunDir);
    domeMaterial.uniforms.uSunDir.value.copy(sunDir);
    domeMaterial.uniforms.uCloudLight.value = THREE.MathUtils.lerp(6.0, 2.2, Math.min(1, b * 2));
    domeMaterial.uniforms.uCloudDay.value.lerpColors(CLOUD_NOON, CLOUD_DUSK, Math.min(1, b * 2));

    const lightDir = b < 0.62 ? sunDir : MOON_DIR;
    const dayPart = 1 - THREE.MathUtils.smoothstep(b, 0.15, 0.75);
    const nightPart = THREE.MathUtils.smoothstep(b, 0.62, 1.0);
    sunLight.intensity = dayPart * 3.2 + nightPart * 0.45;
    sunLight.color.copy(palette('sun', b));
    hemiLight.color.copy(palette('hemiSky', b));
    // w domku: światło odbite od podłogi i ścian rozjaśnia sufit i zakamarki
    hemiLight.groundColor.copy(palette('hemiGround', b)).lerp(INDOOR_BOUNCE, indoorBlend * (1 - b * 0.7));
    hemiLight.intensity = THREE.MathUtils.lerp(0.9, 0.35, b) + indoorBlend * 0.25;
    scene.fog.color.copy(palette('fog', b));
    scene.fog.density = THREE.MathUtils.lerp(0.0072, 0.022, b);
    scene.environment = quality.env ? (b < 0.3 ? envDay : envDusk) : null;
    scene.environmentIntensity = THREE.MathUtils.lerp(0.55, 0.06, Math.min(1, b * 1.2));
    if (!quality.env) hemiLight.intensity += THREE.MathUtils.lerp(0.55, 0.05, b);   // zastępuje światło nieba z mapy otoczenia
    renderer.toneMappingExposure = THREE.MathUtils.lerp(0.62, 1.05, b);

    // Cień słońca podąża za graczem; środek przyciągany do siatki tekseli (bez migotania krawędzi)
    lightSpace.lookAt(lightDir, ORIGIN, UP);
    lightSpaceInv.copy(lightSpace).invert();
    shadowCenter.copy(playerPos).setY(0).applyMatrix4(lightSpaceInv);
    const texel = (shadowExtent * 2) / sunLight.shadow.mapSize.width;
    shadowCenter.x = Math.round(shadowCenter.x / texel) * texel;
    shadowCenter.y = Math.round(shadowCenter.y / texel) * texel;
    shadowCenter.applyMatrix4(lightSpace);
    sunLight.target.position.copy(shadowCenter);
    sunLight.position.copy(shadowCenter).addScaledVector(lightDir, 120);
    sunLight.target.updateMatrixWorld();

    // Latarnie i żarówki: świecą w nocy, domki także w dzień (słabiej)
    const night = b > 0.55;
    fixtureOrder.length = 0;
    for (const f of fixtures) {
        const on = night || f.alwaysOn;
        f.on = on;
        // zepsuta latarnia mruga
        f.level = f.flicker && on && (Math.sin(elapsed * 23.0) + Math.sin(elapsed * 7.3 + 1.3) + Math.sin(elapsed * 2.1)) > 1.2 ? 0.06 : 1;
        if (f.bulbMat) f.bulbMat.emissiveIntensity = on ? f.bulbOn * f.level : 0.0;
        if (f.glowMeshes) {
            for (const g of f.glowMeshes) g.mesh.material.opacity = (night ? g.night : (f.alwaysOn ? g.day : 0)) * f.level;
        }
        if (on) {
            f.dist = f.pos.distanceToSquared(playerPos);
            fixtureOrder.push(f);
        }
    }
    fixtureOrder.sort((a, c) => a.dist - c.dist);
    for (let i = 0; i < lightPool.length; i++) {
        const l = lightPool[i];
        const f = fixtureOrder[i];
        if (f) {
            l.position.copy(f.pos);
            l.color.setHex(f.color);
            l.distance = f.distance;
            l.intensity = f.intensity * f.level * (night ? 1 : (f.dayIntensity ?? 0.35));
        } else {
            l.intensity = 0;
        }
    }
}

// ----------------------------------------------------------------------------
// Postprocessing: scena → broń (osobny bufor głębokości) → bloom → tonemapping → winieta i ziarno
// ----------------------------------------------------------------------------
class LayerPass extends Pass {
    constructor(sceneRef, cameraRef, mask, clear) {
        super();
        this.scene = sceneRef;
        this.camera = cameraRef;
        this.mask = mask;
        this.clear = clear;
        this.needsSwap = false;
    }
    render(r, writeBuffer, readBuffer) {
        const oldAuto = r.autoClear;
        const oldMask = this.camera.layers.mask;
        r.autoClear = false;
        r.setRenderTarget(this.renderToScreen ? null : readBuffer);
        if (this.clear) r.clear(); else r.clearDepth();
        this.camera.layers.mask = this.mask;
        r.render(this.scene, this.camera);
        this.camera.layers.mask = oldMask;
        r.autoClear = oldAuto;
    }
}

const GradeShader = {
    uniforms: {
        tDiffuse: { value: null },
        uTime: { value: 0 },
        uVignette: { value: 0.32 },
        uGrain: { value: 0.035 },
        uSaturation: { value: 0.88 }
    },
    vertexShader: /* glsl */`
        varying vec2 vUv;
        void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */`
        uniform sampler2D tDiffuse;
        uniform float uTime;
        uniform float uVignette;
        uniform float uGrain;
        uniform float uSaturation;
        varying vec2 vUv;
        float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
        void main() {
            vec2 d = vUv - 0.5;
            float r2 = dot(d, d);
            // delikatna aberracja chromatyczna na brzegach kadru
            vec2 off = d * r2 * 0.012;
            vec3 col;
            col.r = texture2D(tDiffuse, vUv + off).r;
            col.g = texture2D(tDiffuse, vUv).g;
            col.b = texture2D(tDiffuse, vUv - off).b;
            float l = dot(col, vec3(0.2126, 0.7152, 0.0722));
            col = mix(vec3(l), col, uSaturation);
            col = (col - 0.5) * 1.06 + 0.5;
            col *= 1.0 - uVignette * smoothstep(0.08, 0.55, r2);
            col += (hash(vUv * 1000.0 + fract(uTime) * 61.0) - 0.5) * uGrain;
            gl_FragColor = vec4(col, 1.0);
        }`
};

let composer = null;
let bloomPass = null;
let gradePass = null;

// ----------------------------------------------------------------------------
// Presety jakości + automatyczna rozdzielczość, gdy klatki zwalniają
// ----------------------------------------------------------------------------
export const QUALITY = {
    // niska = dla zintegrowanej grafiki: bez trawy 3D, odbić otoczenia i map normalnych, jedno światło lampy
    niska:   { label: 'Niska',   pixelRatio: 0.75, shadowSize: 1024, shadowExtent: 24, softShadows: false, post: false, bloom: false, msaa: 0, lights: 1, grass: 0,     env: false, normalMaps: false },
    srednia: { label: 'Średnia', pixelRatio: 1.25, shadowSize: 2048, shadowExtent: 32, softShadows: true,  post: true,  bloom: true,  msaa: 2, lights: 4, grass: 26000, env: true,  normalMaps: true },
    wysoka:  { label: 'Wysoka',  pixelRatio: 2.0,  shadowSize: 4096, shadowExtent: 38, softShadows: true,  post: true,  bloom: true,  msaa: 4, lights: 6, grass: 52000, env: true,  normalMaps: true }
};
export let quality = QUALITY.srednia;
export let qualityName = 'srednia';
let dynamicScale = 1.0;

export function pickAutoQuality() {
    const coarse = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
    const gl = renderer.getContext();
    let gpu = '';
    try {
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        if (ext) gpu = String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)).toLowerCase();
    } catch (e) {}
    if (coarse) return 'niska';
    if (/rtx|radeon rx|geforce gtx 1[0-9]{3}|apple m[1-9] (pro|max|ultra)|arc a/.test(gpu)) return 'wysoka';
    if (/intel|mali|adreno|powervr|swiftshader|llvmpipe/.test(gpu)) return 'niska';
    return 'srednia';
}

export function applyQuality(name, onGrassChange) {
    qualityName = QUALITY[name] ? name : 'srednia';
    quality = QUALITY[qualityName];
    dynamicScale = 1.0;

    sunLight.shadow.mapSize.set(quality.shadowSize, quality.shadowSize);
    if (sunLight.shadow.map) {
        sunLight.shadow.map.dispose();
        sunLight.shadow.map = null;
    }
    shadowExtent = quality.shadowExtent;
    const cam = sunLight.shadow.camera;
    cam.left = -shadowExtent;
    cam.right = shadowExtent;
    cam.top = shadowExtent;
    cam.bottom = -shadowExtent;
    cam.updateProjectionMatrix();
    renderer.shadowMap.type = quality.softShadows ? THREE.PCFSoftShadowMap : THREE.PCFShadowMap;
    rebuildLightPool(quality.lights);
    setNormalMaps(quality.normalMaps);

    if (composer) {
        composer.renderTarget1.dispose();
        composer.renderTarget2.dispose();
        composer = null;
    }
    if (quality.post) {
        const rt = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: quality.msaa });
        composer = new EffectComposer(renderer, rt);
        composer.addPass(new LayerPass(scene, camera, 1 << 0, true));
        composer.addPass(new LayerPass(scene, camera, 1 << VIEWMODEL_LAYER, false));
        if (quality.bloom) {
            // próg wysoko: świecą żarówki, błyski i słońce, ale nie całe jasne niebo
            bloomPass = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.35, 0.5, 4.0);
            composer.addPass(bloomPass);
        }
        composer.addPass(new OutputPass());
        gradePass = new ShaderPass(GradeShader);
        composer.addPass(gradePass);
    }
    if (onGrassChange) onGrassChange(quality.grass);
    resize();
}

// Mapy normalnych wyłączane na niskiej jakości (zapamiętane, by wróciły po zmianie ustawień)
const savedNormalMaps = new WeakMap();
function setNormalMaps(on) {
    scene.traverse(o => {
        if (!o.material) return;
        for (const m of [].concat(o.material)) {
            if (!on && m.normalMap) {
                savedNormalMaps.set(m, m.normalMap);
                m.normalMap = null;
                m.needsUpdate = true;
            } else if (on && savedNormalMaps.has(m)) {
                m.normalMap = savedNormalMaps.get(m);
                savedNormalMaps.delete(m);
                m.needsUpdate = true;
            }
        }
    });
}

export function resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    const pr = Math.min(window.devicePixelRatio || 1, quality.pixelRatio) * dynamicScale;
    renderer.setPixelRatio(pr);
    renderer.setSize(w, h);
    if (composer) {
        composer.setPixelRatio(pr);
        composer.setSize(w, h);
        if (bloomPass) bloomPass.setSize(Math.round(w * pr / 2), Math.round(h * pr / 2));
    }
}

// Średni czas klatki z ostatnich ~2 s; zbyt wolno → niższa rozdzielczość, szybko → wraca wyżej
let frameAccum = 0;
let frameCount = 0;
export let lastFps = 60;
export function trackFrameTime(dt) {
    frameAccum += dt;
    frameCount++;
    if (frameAccum < 2.0) return;
    const avg = frameAccum / frameCount;
    lastFps = 1 / avg;
    frameAccum = 0;
    frameCount = 0;
    if (avg > 1 / 42 && dynamicScale > 0.6) {
        dynamicScale = Math.max(0.6, dynamicScale - 0.1);
        resize();
    } else if (avg < 1 / 70 && dynamicScale < 1.0) {
        dynamicScale = Math.min(1.0, dynamicScale + 0.05);
        resize();
    }
}

export function renderFrame(time) {
    renderer.shadowMap.needsUpdate = true;
    if (composer) {
        if (gradePass) gradePass.uniforms.uTime.value = time;
        composer.render();
    } else {
        renderer.autoClear = false;
        renderer.setRenderTarget(null);
        renderer.clear();
        camera.layers.set(0);
        renderer.render(scene, camera);
        renderer.clearDepth();
        camera.layers.set(VIEWMODEL_LAYER);
        renderer.render(scene, camera);
        camera.layers.set(0);
    }
}
