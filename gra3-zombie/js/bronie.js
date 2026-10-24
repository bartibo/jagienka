// ============================================================================
// MODELE 3D WSZYSTKICH 7 BRONI W RĘKACH GRACZA (z dłońmi w rękawiczkach),
// BŁYSK Z LUFY, DYM I WYRZUCANE ŁUSKI
// ============================================================================
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { scene, camera, VIEWMODEL_LAYER } from './grafika.js';
import { gunWoodTexture, muzzleFlashTexture } from './tekstury.js';

export const HIP_POS = new THREE.Vector3(0.3, -0.29, -0.56);
export const weaponHolder = new THREE.Group();
weaponHolder.position.copy(HIP_POS);
camera.add(weaponHolder);

export const weaponMeshes = [];
// Dla każdej broni: wysokość przyrządów celowniczych (do celowania PPM) i wylot lufy
export const weaponView = [];

const MAT = {};
function mats() {
    if (MAT.gun) return MAT;
    const wood = gunWoodTexture();
    MAT.gun = new THREE.MeshStandardMaterial({ color: 0x2b2f34, metalness: 0.85, roughness: 0.34 });
    MAT.dark = new THREE.MeshStandardMaterial({ color: 0x141619, metalness: 0.6, roughness: 0.42 });
    MAT.polymer = new THREE.MeshStandardMaterial({ color: 0x1a1c1f, metalness: 0.05, roughness: 0.62 });
    MAT.chrome = new THREE.MeshStandardMaterial({ color: 0xc8cdd3, metalness: 1.0, roughness: 0.17 });
    MAT.wood = new THREE.MeshStandardMaterial({ map: wood, roughness: 0.5, metalness: 0.0 });
    MAT.olive = new THREE.MeshStandardMaterial({ color: 0x4a5236, metalness: 0.2, roughness: 0.65 });
    MAT.tan = new THREE.MeshStandardMaterial({ color: 0x8a7a5c, metalness: 0.15, roughness: 0.6 });
    MAT.bakelite = new THREE.MeshStandardMaterial({ color: 0x7e3415, metalness: 0.1, roughness: 0.4 });
    MAT.glove = new THREE.MeshStandardMaterial({ color: 0x2c2723, roughness: 0.78, metalness: 0.0 });
    MAT.sleeve = new THREE.MeshStandardMaterial({ color: 0x3e4531, roughness: 0.95 });
    MAT.tritium = new THREE.MeshStandardMaterial({ color: 0x4ade80, emissive: 0x4ade80, emissiveIntensity: 5 });
    MAT.lens = new THREE.MeshStandardMaterial({ color: 0x223344, metalness: 0.9, roughness: 0.05, emissive: 0x0a1a2a });
    MAT.redDot = new THREE.MeshStandardMaterial({ color: 0xff3030, emissive: 0xff2020, emissiveIntensity: 8 });
    MAT.brass = new THREE.MeshStandardMaterial({ color: 0xc9a227, metalness: 0.95, roughness: 0.25 });
    return MAT;
}

const rbox = (w, h, d, r = 0.006) => new RoundedBoxGeometry(w, h, d, 2, Math.min(r, w / 2.2, h / 2.2, d / 2.2));
const cylZ = (r1, r2, len, seg = 14) => new THREE.CylinderGeometry(r1, r2, len, seg).rotateX(Math.PI / 2);

function part(group, geo, mat, x, y, z, rx = 0, ry = 0, rz = 0) {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.rotation.set(rx, ry, rz);
    group.add(m);
    return m;
}

const Y_AXIS = new THREE.Vector3(0, 1, 0);
// Ręka: rękaw od łokcia do nadgarstka i dłoń w rękawiczce
function arm(group, elbow, wrist, handSize = [0.085, 0.1, 0.11], handRot = [0, 0, 0]) {
    const a = new THREE.Vector3(...elbow);
    const b = new THREE.Vector3(...wrist);
    const dir = b.clone().sub(a);
    const len = dir.length();
    dir.normalize();
    const fore = new THREE.Mesh(new THREE.CapsuleGeometry(0.048, len, 4, 12), MAT.sleeve);
    fore.position.copy(a).add(b).multiplyScalar(0.5);
    fore.quaternion.setFromUnitVectors(Y_AXIS, dir);
    group.add(fore);
    const cuff = new THREE.Mesh(new THREE.CylinderGeometry(0.047, 0.05, 0.05, 12), MAT.glove);
    cuff.position.copy(b).addScaledVector(dir, -0.02);
    cuff.quaternion.copy(fore.quaternion);
    group.add(cuff);
    const hand = new THREE.Mesh(rbox(handSize[0], handSize[1], handSize[2], 0.025), MAT.glove);
    hand.position.copy(b).addScaledVector(dir, 0.045);
    hand.rotation.set(...handRot);
    group.add(hand);
    return hand;
}

function finish(group, view) {
    group.traverse(o => {
        o.layers.set(VIEWMODEL_LAYER);
        if (o.isMesh) {
            o.castShadow = false;
            o.receiveShadow = true;   // broń ciemnieje w cieniu domu
        }
    });
    group.visible = weaponMeshes.length === 0;
    weaponHolder.add(group);
    weaponMeshes.push(group);
    weaponView.push(view);
}

function createAll7WeaponModels() {
    const m = mats();

    // 1. PISTOLET GLOCK 19
    {
        const g = new THREE.Group();
        part(g, rbox(0.066, 0.075, 0.36, 0.01), m.gun, 0, 0.045, -0.05);
        for (let i = 0; i < 6; i++) part(g, new THREE.BoxGeometry(0.068, 0.05, 0.006), m.dark, 0, 0.045, 0.08 + i * 0.014);
        part(g, new THREE.BoxGeometry(0.03, 0.03, 0.07), m.dark, 0.022, 0.06, -0.03);            // okno wyrzutu
        part(g, cylZ(0.012, 0.012, 0.02, 10), m.dark, 0, 0.05, -0.235);                          // wylot lufy
        part(g, rbox(0.06, 0.05, 0.3, 0.01), m.polymer, 0, -0.005, -0.04);                       // szkielet
        part(g, rbox(0.058, 0.2, 0.1, 0.02), m.polymer, 0, -0.1, 0.075, 0.24);                   // chwyt
        part(g, new THREE.TorusGeometry(0.035, 0.008, 6, 12, Math.PI), m.polymer, 0, -0.035, -0.035, 0, Math.PI / 2, Math.PI);
        part(g, new THREE.BoxGeometry(0.012, 0.035, 0.01), m.dark, 0, -0.04, -0.03, 0.3);        // spust
        part(g, new THREE.BoxGeometry(0.012, 0.018, 0.012), m.tritium, 0, 0.092, -0.215);
        part(g, new THREE.BoxGeometry(0.044, 0.018, 0.014), m.dark, 0, 0.092, 0.115);
        arm(g, [0.1, -0.5, 0.5], [0.0, -0.13, 0.12], [0.085, 0.11, 0.12], [0.24, 0, 0]);
        arm(g, [-0.32, -0.5, 0.42], [-0.05, -0.14, 0.07], [0.07, 0.1, 0.13], [0.3, 0, 0.4]);
        finish(g, { sightY: 0.1, adsZ: -0.44, muzzle: new THREE.Vector3(0, 0.05, -0.26), flash: 0.75 });
    }

    // 2. REWOLWER MAGNUM .44 (chromowana długa lufa + bębenek)
    {
        const g = new THREE.Group();
        part(g, cylZ(0.024, 0.024, 0.44, 14), m.chrome, 0, 0.06, -0.17);
        part(g, rbox(0.03, 0.03, 0.44, 0.008), m.chrome, 0, 0.087, -0.17);                       // listwa nad lufą
        part(g, rbox(0.04, 0.035, 0.36, 0.01), m.chrome, 0, 0.035, -0.12);                       // osłona wyciora
        const drum = part(g, cylZ(0.055, 0.055, 0.12, 18), m.chrome, 0, 0.045, 0.06);
        for (let i = 0; i < 6; i++) {
            const a = (i / 6) * Math.PI * 2;
            part(g, cylZ(0.012, 0.012, 0.125, 8), m.dark, Math.cos(a) * 0.04, 0.045 + Math.sin(a) * 0.04, 0.06);
        }
        drum.name = 'drum';
        part(g, rbox(0.05, 0.09, 0.16, 0.012), m.chrome, 0, 0.02, 0.07);                         // szkielet
        part(g, rbox(0.016, 0.04, 0.03, 0.005), m.dark, 0, 0.09, 0.15, -0.5);                     // kurek
        part(g, rbox(0.058, 0.21, 0.1, 0.025), m.wood, 0, -0.08, 0.17, 0.35);                     // drewniana rękojeść
        part(g, new THREE.TorusGeometry(0.03, 0.007, 6, 12, Math.PI), m.chrome, 0, -0.025, 0.08, 0, Math.PI / 2, Math.PI);
        part(g, new THREE.BoxGeometry(0.01, 0.022, 0.016), m.tritium, 0, 0.11, -0.37);
        arm(g, [0.1, -0.5, 0.56], [0.0, -0.14, 0.2], [0.085, 0.11, 0.12], [0.35, 0, 0]);
        arm(g, [-0.32, -0.5, 0.48], [-0.05, -0.15, 0.15], [0.07, 0.1, 0.13], [0.35, 0, 0.4]);
        finish(g, { sightY: 0.115, adsZ: -0.46, muzzle: new THREE.Vector3(0, 0.06, -0.4), flash: 1.0 });
    }

    // 3. STRZELBA POMPKA 12GA
    {
        const g = new THREE.Group();
        part(g, cylZ(0.025, 0.025, 0.86, 16), m.gun, 0, 0.06, -0.26);
        part(g, cylZ(0.021, 0.021, 0.66, 12), m.dark, 0, 0.012, -0.17);
        const pump = part(g, rbox(0.075, 0.07, 0.26, 0.02), m.wood, 0, 0.012, -0.24);
        pump.name = 'pump';
        for (let i = 0; i < 7; i++) part(g, new THREE.BoxGeometry(0.078, 0.073, 0.008), m.dark, 0, 0.012, -0.34 + i * 0.03);
        part(g, rbox(0.08, 0.12, 0.32, 0.012), m.gun, 0, 0.03, 0.12);
        part(g, rbox(0.068, 0.13, 0.36, 0.03), m.wood, 0, -0.02, 0.43, 0.12);
        part(g, rbox(0.07, 0.15, 0.03, 0.01), m.polymer, 0, -0.04, 0.615, 0.12);                  // stopka
        part(g, new THREE.SphereGeometry(0.008, 8, 6), m.chrome, 0, 0.09, -0.68);
        part(g, new THREE.TorusGeometry(0.035, 0.008, 6, 12, Math.PI), m.gun, 0, -0.03, 0.14, 0, Math.PI / 2, Math.PI);
        arm(g, [0.12, -0.48, 0.62], [0.0, -0.08, 0.26], [0.085, 0.1, 0.12], [0.5, 0, 0]);
        arm(g, [-0.5, -0.42, 0.0], [-0.03, -0.035, -0.24], [0.08, 0.09, 0.13], [0, 0, 0.6]);
        finish(g, { sightY: 0.095, adsZ: -0.42, muzzle: new THREE.Vector3(0, 0.06, -0.7), flash: 1.3 });
    }

    // 4. PISTOLET MASZYNOWY MP5 (z tłumikiem i kolimatorem)
    {
        const g = new THREE.Group();
        part(g, rbox(0.068, 0.1, 0.42, 0.012), m.dark, 0, 0.035, 0.0);
        part(g, rbox(0.072, 0.07, 0.2, 0.02), m.polymer, 0, 0.02, -0.26);
        for (let i = 0; i < 5; i++) part(g, new THREE.BoxGeometry(0.074, 0.01, 0.16), m.dark, 0, -0.005 + i * 0.012, -0.26);
        part(g, cylZ(0.03, 0.03, 0.3, 16), m.gun, 0, 0.045, -0.5);
        const mag = new THREE.Group();
        for (let i = 0; i < 4; i++) part(mag, rbox(0.03, 0.07, 0.06, 0.006), m.gun, 0, -0.035 - i * 0.062, i * -0.012, -0.12 - i * 0.05);
        mag.position.set(0, -0.02, -0.07);
        g.add(mag);
        part(g, rbox(0.055, 0.16, 0.075, 0.02), m.polymer, 0, -0.08, 0.12, 0.25);
        part(g, cylZ(0.024, 0.024, 0.09, 16), m.dark, 0, 0.115, -0.02);                           // kolimator
        part(g, new THREE.CircleGeometry(0.019, 16), m.lens, 0, 0.115, 0.026);
        part(g, new THREE.SphereGeometry(0.003, 6, 4), m.redDot, 0, 0.115, -0.03);
        part(g, rbox(0.034, 0.03, 0.06, 0.005), m.dark, 0, 0.09, -0.02);
        [-0.022, 0.022].forEach(x => part(g, cylZ(0.006, 0.006, 0.26, 6), m.gun, x, 0.04, 0.32));  // kolba składana
        part(g, rbox(0.06, 0.08, 0.02, 0.008), m.polymer, 0, 0.04, 0.45);
        arm(g, [0.12, -0.48, 0.55], [0.0, -0.13, 0.17], [0.085, 0.11, 0.12], [0.25, 0, 0]);
        arm(g, [-0.5, -0.42, 0.0], [-0.03, -0.02, -0.26], [0.08, 0.09, 0.13], [0, 0, 0.6]);
        finish(g, { sightY: 0.115, adsZ: -0.4, muzzle: new THREE.Vector3(0, 0.045, -0.66), flash: 0.5 });
    }

    // 5. KARABIN SZTURMOWY AK-47 (drewniane łoże i łukowy magazynek)
    {
        const g = new THREE.Group();
        part(g, rbox(0.074, 0.11, 0.44, 0.01), m.gun, 0, 0.025, 0.02);
        part(g, rbox(0.07, 0.04, 0.3, 0.015), m.gun, 0, 0.09, 0.04);                              // pokrywa
        part(g, rbox(0.072, 0.075, 0.28, 0.022), m.wood, 0, 0.02, -0.33);
        part(g, rbox(0.05, 0.035, 0.22, 0.015), m.wood, 0, 0.083, -0.3);                         // nakładka
        part(g, cylZ(0.015, 0.015, 0.3, 10), m.gun, 0, 0.08, -0.52);                              // rura gazowa
        part(g, cylZ(0.018, 0.018, 0.62, 12), m.dark, 0, 0.045, -0.5);
        part(g, cylZ(0.024, 0.02, 0.08, 10), m.dark, 0, 0.045, -0.83);                            // hamulec wylotowy
        part(g, rbox(0.03, 0.06, 0.03, 0.005), m.dark, 0, 0.085, -0.73);                          // muszka
        part(g, new THREE.BoxGeometry(0.008, 0.02, 0.008), m.tritium, 0, 0.115, -0.73);
        part(g, rbox(0.05, 0.03, 0.05, 0.005), m.dark, 0, 0.1, -0.14);                            // szczerbinka
        const mag = new THREE.Group();
        for (let i = 0; i < 5; i++) part(mag, rbox(0.05, 0.06, 0.1, 0.008), m.bakelite, 0, -0.03 - i * 0.052, i * -0.02, -0.2 - i * 0.09);
        mag.position.set(0, -0.02, -0.08);
        g.add(mag);
        part(g, rbox(0.05, 0.15, 0.07, 0.02), m.wood, 0, -0.08, 0.17, 0.3);
        part(g, rbox(0.064, 0.12, 0.34, 0.025), m.wood, 0, -0.02, 0.4, 0.08);
        part(g, new THREE.TorusGeometry(0.035, 0.007, 6, 12, Math.PI), m.gun, 0, -0.03, 0.08, 0, Math.PI / 2, Math.PI);
        arm(g, [0.12, -0.48, 0.6], [0.0, -0.13, 0.22], [0.085, 0.11, 0.12], [0.3, 0, 0]);
        arm(g, [-0.52, -0.42, -0.04], [-0.035, -0.02, -0.32], [0.08, 0.09, 0.13], [0, 0, 0.6]);
        finish(g, { sightY: 0.118, adsZ: -0.44, muzzle: new THREE.Vector3(0, 0.045, -0.88), flash: 1.0 });
    }

    // 6. KARABIN SNAJPERSKI BARRETT .50 BMG Z DUŻĄ LUNETĄ
    {
        const g = new THREE.Group();
        part(g, rbox(0.088, 0.12, 0.6, 0.012), m.tan, 0, 0.02, 0.04);
        part(g, cylZ(0.024, 0.029, 0.98, 14), m.gun, 0, 0.04, -0.6);
        const brake = part(g, rbox(0.08, 0.065, 0.13, 0.01), m.dark, 0, 0.04, -1.1);
        [-0.03, 0.0, 0.03].forEach(z => part(g, new THREE.BoxGeometry(0.084, 0.04, 0.012), m.gun, 0, 0.04, -1.1 + z));
        brake.name = 'brake';
        part(g, cylZ(0.034, 0.034, 0.3, 18), m.dark, 0, 0.14, -0.02);                             // tubus lunety
        part(g, cylZ(0.046, 0.034, 0.08, 18), m.dark, 0, 0.14, -0.2);
        part(g, cylZ(0.034, 0.042, 0.07, 18), m.dark, 0, 0.14, 0.16);
        part(g, new THREE.CircleGeometry(0.04, 18), m.lens, 0, 0.14, 0.196);
        part(g, cylZ(0.014, 0.014, 0.03, 10).rotateX(Math.PI / 2), m.dark, 0, 0.185, -0.02);       // pokrętła
        part(g, cylZ(0.014, 0.014, 0.03, 10).rotateZ(Math.PI / 2), m.dark, 0.045, 0.14, -0.02);
        [-0.12, 0.08].forEach(z => part(g, rbox(0.03, 0.05, 0.03, 0.005), m.dark, 0, 0.1, z));
        part(g, rbox(0.06, 0.14, 0.1, 0.012), m.gun, 0, -0.1, -0.08, -0.15);                      // magazynek
        part(g, rbox(0.05, 0.15, 0.07, 0.02), m.polymer, 0, -0.08, 0.22, 0.3);
        part(g, rbox(0.07, 0.13, 0.3, 0.02), m.tan, 0, -0.01, 0.48);
        part(g, rbox(0.06, 0.05, 0.18, 0.015), m.polymer, 0, 0.075, 0.44);                         // policzek
        [-0.03, 0.03].forEach(x => part(g, cylZ(0.008, 0.008, 0.3, 6), m.gun, x, -0.02, -0.55));    // dwójnóg złożony
        arm(g, [0.12, -0.48, 0.66], [0.0, -0.13, 0.27], [0.085, 0.11, 0.12], [0.3, 0, 0]);
        arm(g, [-0.52, -0.44, 0.0], [-0.04, -0.04, -0.28], [0.08, 0.09, 0.13], [0, 0, 0.6]);
        finish(g, { sightY: 0.14, adsZ: -0.28, muzzle: new THREE.Vector3(0, 0.04, -1.17), flash: 1.6 });
    }

    // 7. CIĘŻKI KARABIN MASZYNOWY M249 SAW / MINIGUN (obracający się zestaw luf)
    {
        const g = new THREE.Group();
        part(g, rbox(0.12, 0.15, 0.56, 0.015), m.olive, 0, 0.01, 0.0);
        part(g, rbox(0.16, 0.19, 0.22, 0.012), new THREE.MeshStandardMaterial({ color: 0x55602e, roughness: 0.7 }), -0.04, -0.15, -0.06);
        const belt = new THREE.Group();
        for (let i = 0; i < 6; i++) part(belt, cylZ(0.008, 0.006, 0.05, 6).rotateY(Math.PI / 2), m.brass, -0.065, -0.04 - i * 0.012, -0.06 + i * 0.008);
        g.add(belt);
        const barrels = new THREE.Group();
        barrels.position.set(0, 0.035, -0.48);
        for (let i = 0; i < 6; i++) {
            const a = (i / 6) * Math.PI * 2;
            part(barrels, cylZ(0.012, 0.012, 0.72, 8), i % 2 ? m.gun : m.dark, Math.cos(a) * 0.032, Math.sin(a) * 0.032, 0);
        }
        part(barrels, cylZ(0.05, 0.05, 0.03, 16), m.dark, 0, 0, -0.3);
        part(barrels, cylZ(0.05, 0.05, 0.03, 16), m.dark, 0, 0, 0.2);
        part(barrels, cylZ(0.018, 0.018, 0.74, 10), m.chrome, 0, 0, 0);
        g.add(barrels);
        part(g, cylZ(0.052, 0.052, 0.16, 16), m.olive, 0, 0.035, -0.06);
        const handle = new THREE.TorusGeometry(0.05, 0.012, 6, 14, Math.PI);
        part(g, handle, m.dark, 0, 0.1, -0.02, 0, Math.PI / 2, 0);
        part(g, rbox(0.05, 0.16, 0.07, 0.02), m.polymer, 0, -0.1, 0.16, 0.25);
        part(g, rbox(0.09, 0.12, 0.24, 0.02), m.olive, 0, -0.01, 0.38);
        arm(g, [0.12, -0.48, 0.58], [0.0, -0.14, 0.2], [0.085, 0.11, 0.12], [0.25, 0, 0]);
        arm(g, [-0.5, -0.38, 0.2], [-0.03, 0.08, -0.03], [0.08, 0.1, 0.11], [0, 0, 1.2]);
        g.userData.barrels = barrels;
        finish(g, { sightY: 0.125, adsZ: -0.42, muzzle: new THREE.Vector3(0, 0.035, -0.86), flash: 0.9 });
    }
}

createAll7WeaponModels();

// ----------------------------------------------------------------------------
// Błysk z lufy (dwie skrzyżowane płaszczyzny addytywne) i dym
// ----------------------------------------------------------------------------
const flashMat = new THREE.MeshBasicMaterial({
    map: muzzleFlashTexture(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, color: 0xffd9a0, toneMapped: false
});
flashMat.color.multiplyScalar(6);   // jaśniej niż biel – łapie poświatę (bloom)
const muzzleFlash = new THREE.Group();
const flashFront = new THREE.Mesh(new THREE.PlaneGeometry(0.34, 0.34), flashMat);
const flashSide = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.2).translate(0, 0, 0).rotateY(Math.PI / 2), flashMat);
flashSide.position.z = -0.12;
const flashTop = flashSide.clone();
flashTop.rotation.z = Math.PI / 2;
muzzleFlash.add(flashFront, flashSide, flashTop);
muzzleFlash.visible = false;
muzzleFlash.traverse(o => o.layers.set(VIEWMODEL_LAYER));
weaponHolder.add(muzzleFlash);
let flashTimer = 0;

export function showMuzzleFlash(weaponIndex) {
    const v = weaponView[weaponIndex];
    muzzleFlash.position.copy(v.muzzle);
    muzzleFlash.scale.setScalar(v.flash * (0.8 + Math.random() * 0.4));
    flashFront.rotation.z = Math.random() * Math.PI * 2;
    muzzleFlash.visible = true;
    flashTimer = 0.045;
}

export function updateMuzzleFlash(dt) {
    if (flashTimer > 0) {
        flashTimer -= dt;
        if (flashTimer <= 0) muzzleFlash.visible = false;
    }
}

const _muzzleWorld = new THREE.Vector3();
export function getMuzzleWorldPosition(weaponIndex, out = _muzzleWorld) {
    out.copy(weaponView[weaponIndex].muzzle);
    weaponHolder.localToWorld(out);
    return out;
}

// ----------------------------------------------------------------------------
// Łuski (stała pula, bez tworzenia nowych obiektów przy każdym strzale)
// ----------------------------------------------------------------------------
const casingGeo = new THREE.CylinderGeometry(0.011, 0.011, 0.042, 8);
const shellPool = [];
let shellCursor = 0;
for (let i = 0; i < 24; i++) {
    const mesh = new THREE.Mesh(casingGeo, mats().brass);
    mesh.visible = false;
    mesh.castShadow = false;
    scene.add(mesh);
    shellPool.push({ mesh, vel: new THREE.Vector3(), life: 0 });
}
const _ejectDir = new THREE.Vector3();

export function ejectShellCasing() {
    const s = shellPool[shellCursor];
    shellCursor = (shellCursor + 1) % shellPool.length;
    weaponHolder.getWorldPosition(s.mesh.position);
    s.mesh.position.y += 0.05;
    _ejectDir.set(1, 0.7, 0.15).applyQuaternion(camera.quaternion).normalize();
    s.vel.copy(_ejectDir).multiplyScalar(2.2 + Math.random() * 1.2);
    s.life = 1.6;
    s.mesh.visible = true;
}

export function updateShells(dt) {
    for (const s of shellPool) {
        if (s.life <= 0) continue;
        s.life -= dt;
        s.vel.y -= 15 * dt;
        s.mesh.position.addScaledVector(s.vel, dt);
        if (s.mesh.position.y < 0.03) {
            s.mesh.position.y = 0.03;
            s.vel.y = Math.abs(s.vel.y) * 0.3;
            s.vel.x *= 0.5;
            s.vel.z *= 0.5;
            s.mesh.rotation.z = Math.PI / 2;
        } else {
            s.mesh.rotation.x += dt * 14;
            s.mesh.rotation.z += dt * 10;
        }
        if (s.life <= 0) s.mesh.visible = false;
    }
}
