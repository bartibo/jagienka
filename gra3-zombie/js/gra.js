// ============================================================================
// OSTATNI OCALAŁY: MARTWA OSADA 3D – GŁÓWNA PĘTLA, POZIOMY, STRZELANIE, SKLEP, STEROWANIE
// ============================================================================
import * as THREE from 'three';
import {
    gameState, weaponsConfig, keys, players, settings, saveSettings, zombieTypes,
    PLAYER_EYE_HEIGHT, PLAYER_RADIUS, MAX_ZOMBIES_AT_ONCE
} from './stan.js';
import { audio } from './dzwiek.js';
import {
    renderer, scene, camera, canvas, flashlight, muzzleLight, updateEnvironment, renderFrame,
    applyQuality, pickAutoQuality, resize, trackFrameTime, lastFps, qualityName
} from './grafika.js';
import { loadingManager, setMaxAnisotropy } from './tekstury.js';
import { buildAbandonedVillage, setGrassCount, updateWorld, houseZones, lootItems, occluders } from './swiat.js';
import { resolveWorldCollisions, houseAt } from './kolizje.js';
import {
    weaponHolder, weaponMeshes, weaponView, HIP_POS, showMuzzleFlash, updateMuzzleFlash,
    getMuzzleWorldPosition, ejectShellCasing, updateShells
} from './bronie.js';
import {
    zombies, zombieHitboxes, spawnZombie, updateZombies, startDeath, hitReaction, removeAllZombies
} from './zombie.js';
import {
    spawnBlood, spawnImpact, spawnBloodDecal, spawnBulletHole, spawnTracer, spawnMuzzleSmoke, updateEffects, clearEffects
} from './efekty.js';
import * as hud from './hud.js';

const $ = (id) => document.getElementById(id);

if (!renderer.capabilities.isWebGL2) $('webgl-error').classList.remove('hidden');
setMaxAnisotropy(renderer.capabilities.getMaxAnisotropy());

// Gracz lokalny (zombie wybierają najbliższego z listy `players`)
const localPlayer = { id: 'ja', position: camera.position, house: null, alive: true };
players.push(localPlayer);

const START_POS = new THREE.Vector3(0, PLAYER_EYE_HEIGHT, 14);
camera.position.copy(START_POS);

// ============================================================================
// WCZYTYWANIE ŚWIATA
// ============================================================================
const startBtn = $('start-btn');
const loadBar = $('load-bar');
loadingManager.onProgress = (url, loaded, total) => {
    loadBar.style.width = `${Math.round((loaded / total) * 100)}%`;
    startBtn.textContent = `WCZYTYWANIE ŚWIATA... ${Math.round((loaded / total) * 100)}%`;
};
loadingManager.onLoad = () => {
    gameState.isLoaded = true;
    loadBar.style.width = '100%';
    startBtn.disabled = false;
    startBtn.textContent = 'ROZPOCZNIJ POZIOM 1 (DZIEŃ ☀️)';
};
loadingManager.onError = (url) => console.warn('Nie udało się wczytać:', url);

buildAbandonedVillage();

function chooseQuality(name) {
    settings.quality = name;
    saveSettings();
    const real = name === 'auto' ? pickAutoQuality() : name;
    applyQuality(real, setGrassCount);
    document.querySelectorAll('[data-akcja="jakosc"]').forEach(b => {
        const on = b.dataset.jakosc === name;
        b.classList.toggle('bg-amber-500', on);
        b.classList.toggle('text-black', on);
        b.classList.toggle('bg-stone-800', !on);
        b.classList.toggle('text-stone-200', !on);
        if (b.dataset.jakosc === 'auto') b.textContent = name === 'auto' ? `Auto (${real === 'niska' ? 'niska' : real === 'wysoka' ? 'wysoka' : 'średnia'})` : 'Auto';
    });
}
chooseQuality(settings.quality);

const sensInput = $('sensitivity');
sensInput.value = settings.sensitivity;
sensInput.addEventListener('input', () => {
    settings.sensitivity = Number(sensInput.value);
    saveSettings();
});

if (window.matchMedia && window.matchMedia('(pointer: coarse)').matches && !window.matchMedia('(pointer: fine)').matches) {
    $('touch-warning').classList.remove('hidden');
}
const params = new URLSearchParams(location.search);
if (params.has('fps')) $('fps-counter').classList.remove('hidden');

// ============================================================================
// POZIOMY (POZIOM 1 = DZIEŃ, POZIOM 2 = NOC, POZIOM 3 = DZIEŃ...)
// ============================================================================
function setFlashlight(on) {
    gameState.flashlightOn = on;
    flashlight.intensity = on ? 95 : 0;
}

function toggleFlashlight() {
    setFlashlight(!gameState.flashlightOn);
    audio.playEmptyClick();
}

function startLevel(levelNum) {
    gameState.level = levelNum;
    gameState.isBetweenLevels = false;
    $('between-levels-box').classList.add('hidden');
    $('shop-next-level-btn').classList.add('hidden');

    // Nieparzyste poziomy (1, 3, 5...) = DZIEŃ ☀️, Parzyste poziomy (2, 4, 6...) = NOC 🌙
    const isEvenNightLevel = levelNum % 2 === 0;
    gameState.isNight = isEvenNightLevel;
    gameState.targetSkyBlend = isEvenNightLevel ? 1.0 : 0.0;
    gameState.nightAggroFactor = isEvenNightLevel ? 1.18 : 1.0;

    // W nocy automatycznie włączamy latarkę gracza, w dzień ją wyłączamy (można zmienić [F])
    setFlashlight(isEvenNightLevel);

    // Odradzamy wszystkie przedmioty na stołach w 5 domkach na nowy poziom
    lootItems.forEach(item => {
        item.active = true;
        item.mesh.visible = true;
        item.glow.visible = true;
    });

    const totalZombies = 5 + levelNum * 4;
    gameState.zombiesToSpawn = totalZombies;
    gameState.zombiesAlive = totalZombies;
    gameState.spawnTimer = 0.5;

    audio.playWaveHorn();
    hud.updateHUD();

    const banner = hud.els['level-banner'];
    const subbanner = hud.els['level-subbanner'];
    if (isEvenNightLevel) {
        banner.textContent = `POZIOM ${levelNum} • ZAPADŁA NOC 🌙`;
        banner.className = 'font-teko text-5xl md:text-7xl tracking-widest text-indigo-400 uppercase opacity-100 transition-all duration-700 transform scale-100 drop-shadow-[0_5px_25px_rgba(0,0,0,0.98)] text-center px-4';
        subbanner.textContent = 'Latarnie i domki świecą w mroku • Automatycznie włączono latarkę [F]!';
    } else {
        banner.textContent = `POZIOM ${levelNum} • WSTAŁ NOWY DZIEŃ ☀️`;
        banner.className = 'font-teko text-5xl md:text-7xl tracking-widest text-amber-400 uppercase opacity-100 transition-all duration-700 transform scale-100 drop-shadow-[0_5px_25px_rgba(0,0,0,0.98)] text-center px-4';
        subbanner.textContent = `Słońce oświetla osadę • Przeszukaj domki i pokonaj ${totalZombies} zombie!`;
    }
    subbanner.classList.remove('opacity-0');
    subbanner.classList.add('opacity-100');
    clearTimeout(startLevel.bannerTimeout);
    startLevel.bannerTimeout = setTimeout(() => {
        banner.classList.remove('opacity-100', 'scale-100');
        banner.classList.add('opacity-0', 'scale-75');
        subbanner.classList.remove('opacity-100');
        subbanner.classList.add('opacity-0');
    }, 3400);
}

function onLevelCompleted() {
    if (gameState.isBetweenLevels || gameState.isGameOver) return;
    gameState.isBetweenLevels = true;
    gameState.isMouseDown = false;
    gameState.isAiming = false;

    // Odblokuj kursor myszy, aby gracz mógł wygodnie kliknąć "Otwórz Sklepik" lub "Rozpocznij kolejny poziom"
    unlockPointer();

    const bonusCash = 120 + gameState.level * 35;
    addCash(bonusCash);
    audio.playCashSound();

    const nextLvl = gameState.level + 1;
    const nextIsNight = nextLvl % 2 === 0;
    // Już teraz zaczynamy płynną zmianę pory dnia na zapowiedź kolejnego poziomu!
    gameState.targetSkyBlend = nextIsNight ? 0.6 : 0.4;

    $('bl-badge').textContent = `POZIOM ${gameState.level} UKOŃCZONY! NAGRODA +$${bonusCash}`;
    $('bl-title').textContent = nextIsNight
        ? `ZAPADA ZMROK... PRZYGOTUJ SIĘ NA POZIOM ${nextLvl} (NOC 🌙)`
        : `WSTAJE ŚWIT... PRZYGOTUJ SIĘ NA POZIOM ${nextLvl} (DZIEŃ ☀️)`;
    $('bl-desc').textContent = nextIsNight
        ? 'Słońce chowa się za lasem. Przed nocnym atakiem odwiedź Sklepik, kup lepszą broń i uzupełnij pancerz!'
        : `Przetrwałaś noc! Nadchodzi słoneczny dzień (Poziom ${nextLvl}). Kup nową broń w Sklepiku i ruszaj do walki.`;
    $('between-levels-box').classList.remove('hidden');
    $('shop-next-level-btn').classList.remove('hidden');
    hud.updateHUD();
}

function startNextLevelNow() {
    $('shop-modal').classList.add('hidden');
    $('between-levels-box').classList.add('hidden');
    gameState.isShopOpen = false;
    gameState.isPaused = false;
    startLevel(gameState.level + 1);
    lockPointerSafely();
}

function pickSpawnPoint() {
    const p = new THREE.Vector3();
    for (let attempt = 0; attempt < 16; attempt++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = 35 + Math.random() * 24;
        p.set(Math.cos(angle) * dist, 0, Math.sin(angle) * dist);
        const inHouse = houseZones.some(h => p.x >= h.minX - 2 && p.x <= h.maxX + 2 && p.z >= h.minZ - 2 && p.z <= h.maxZ + 2);
        const nearPlayer = p.distanceTo(camera.position) < 22;
        if (!inHouse && !nearPlayer) break;
    }
    resolveWorldCollisions(p, 0.5);
    return p;
}

function spawnNextZombie() {
    let typeKey = 'walker';
    const r = Math.random();
    if (gameState.level >= 3 && r < 0.16) typeKey = 'tank';
    else if (gameState.level >= 2 && r < 0.45) typeKey = 'runner';
    const levelBonusHp = 1 + (gameState.level - 1) * 0.14;
    const p = pickSpawnPoint();
    spawnZombie(typeKey, p.x, p.z, levelBonusHp);
}

// ============================================================================
// STRZELANIE, PRZEŁADOWANIE I DETEKCJA TRAFIEŃ (kule zatrzymują się na ścianach)
// ============================================================================
const raycaster = new THREE.Raycaster();
const worldRaycaster = new THREE.Raycaster();
const _ndc = new THREE.Vector2();
const _hitPoint = new THREE.Vector3();
const _normal = new THREE.Vector3();
const _pushDir = new THREE.Vector3();
const _muzzle = new THREE.Vector3();
const _tracerEnd = new THREE.Vector3();
const _instMatrix = new THREE.Matrix4();
const _normalMatrix = new THREE.Matrix3();
const SURFACE_DEFAULT = new THREE.Color(0x8a7f70);
const SURFACE_GROUND = new THREE.Color(0x5a5040);
const _surface = new THREE.Color();

function switchWeapon(index) {
    if (index < 0 || index >= weaponsConfig.length) return;
    const w = weaponsConfig[index];
    if (!w.owned) {
        hud.showLootPopup(`🔒 Broń "${w.shortName}" nie jest jeszcze kupiona! Otwórz Sklepik [B].`);
        audio.playEmptyClick();
        return;
    }
    if (index === gameState.currentWeaponIndex) return;
    gameState.isReloading = false;
    gameState.isAiming = false;
    hud.els['reload-prompt'].classList.add('hidden');
    weaponMeshes.forEach((m, idx) => { m.visible = idx === index; });
    gameState.currentWeaponIndex = index;
    weaponHolder.position.y = -0.6;
    gameState.switchTimer = 0.25;
    audio.playReload();
    hud.updateHUD();
}

function reloadWeapon() {
    const w = weaponsConfig[gameState.currentWeaponIndex];
    if (gameState.isReloading || w.mag === w.magSize || w.reserve <= 0) return;
    gameState.isReloading = true;
    gameState.isAiming = false;
    gameState.reloadTimer = w.reloadTime;
    hud.els['reload-prompt'].classList.add('hidden');
    audio.playReload();
    hud.updateAmmo();
}

// Pierwsza przeszkoda na drodze kuli (ściana, dach, auto, pień...) bliżej niż `maxDist`
function firstWorldHit(maxDist) {
    worldRaycaster.ray.copy(raycaster.ray);
    worldRaycaster.far = maxDist;
    const hits = worldRaycaster.intersectObjects(occluders, false);
    return hits.length ? hits[0] : null;
}

function worldHitNormal(hit, out) {
    if (!hit.face) return out.set(0, 1, 0);
    out.copy(hit.face.normal);
    if (hit.object.isInstancedMesh && hit.instanceId !== undefined) {
        hit.object.getMatrixAt(hit.instanceId, _instMatrix);
        _instMatrix.premultiply(hit.object.matrixWorld);
        _normalMatrix.getNormalMatrix(_instMatrix);
        out.applyMatrix3(_normalMatrix).normalize();
    } else {
        out.transformDirection(hit.object.matrixWorld);
    }
    return out;
}

function surfaceColorOf(hit) {
    const m = Array.isArray(hit.object.material) ? hit.object.material[hit.face?.materialIndex ?? 0] : hit.object.material;
    if (m && m.color) {
        _surface.copy(m.color).multiplyScalar(0.55);
        if (m.map) _surface.multiplyScalar(0.9);
        return _surface;
    }
    return SURFACE_DEFAULT;
}

function fireWeapon() {
    if (gameState.isPaused || gameState.isShopOpen || gameState.isGameOver || gameState.isReloading || gameState.switchTimer > 0.1) return;

    const w = weaponsConfig[gameState.currentWeaponIndex];
    const now = performance.now() / 1000;
    if (now - gameState.lastShotTime < w.fireRate) return;

    if (w.mag <= 0) {
        audio.playEmptyClick();
        gameState.lastShotTime = now;
        if (w.reserve > 0) {
            reloadWeapon();
        } else {
            const prompt = hud.els['reload-prompt'];
            prompt.textContent = 'BRAK AMUNICJI! KUP W SKLEPIKU [B] LUB ZNAJDŹ W DOMKACH';
            prompt.classList.remove('hidden');
        }
        return;
    }

    w.mag--;
    gameState.lastShotTime = now;

    audio.playGunshot(w.id);
    ejectShellCasing();
    showMuzzleFlash(gameState.currentWeaponIndex);
    muzzleLight.intensity = 40;
    gameState.muzzleLightTimer = 0.05;
    camera.updateMatrixWorld();
    getMuzzleWorldPosition(gameState.currentWeaponIndex, _muzzle);
    if (Math.random() < (w.auto ? 0.35 : 1)) spawnMuzzleSmoke(_muzzle, w.id === 'shotgun' || w.id === 'sniper' ? 1.6 : 1);

    const recoilMult = gameState.isAiming ? 0.5 : 1.0;
    gameState.recoilOffset = Math.min(0.24, gameState.recoilOffset + w.recoilKick * recoilMult);
    gameState.pitch += w.recoilKick * 0.12 * recoilMult;
    gameState.recoilRoll = (Math.random() - 0.5) * w.recoilKick * 0.6;
    gameState.crosshairSpread = Math.min(26, gameState.crosshairSpread + 11 * recoilMult);

    let hitRegistered = false;
    let headshotRegistered = false;
    const activeSpread = gameState.isAiming ? w.adsSpread : w.spread;
    const tracerShot = w.auto && Math.random() < 0.45;

    for (let p = 0; p < w.pellets; p++) {
        _ndc.set((Math.random() - 0.5) * activeSpread, (Math.random() - 0.5) * activeSpread);
        raycaster.setFromCamera(_ndc, camera);
        raycaster.far = 110;

        const intersects = raycaster.intersectObjects(zombieHitboxes, false);
        // Snajperka .50 BMG przebija do 3 zombie naraz!
        const maxTargets = w.pierce ? 3 : 1;
        const hitZombiesSet = new Set();
        let lastDist = 110;
        const wall = firstWorldHit(110);
        const wallDist = wall ? wall.distance : Infinity;

        for (let tIdx = 0; tIdx < intersects.length && hitZombiesSet.size < maxTargets; tIdx++) {
            const hit = intersects[tIdx];
            if (hit.distance > wallDist) break;   // kula zatrzymała się na ścianie
            const zObj = hit.object.userData.zombieRef;
            if (!zObj || zObj.hp <= 0 || hitZombiesSet.has(zObj)) continue;
            hitZombiesSet.add(zObj);
            lastDist = hit.distance;

            const isHead = hit.object.userData.isHead === true;
            hitRegistered = true;
            if (isHead) headshotRegistered = true;

            const dmgMult = isHead ? 2.4 : 1.0;
            zObj.hp -= w.damage * gameState.dmgMultiplier * dmgMult;

            spawnBlood(hit.point, isHead ? 16 : 8, isHead ? 1.3 : 0.9);
            _pushDir.subVectors(zObj.mesh.position, camera.position).setY(0).normalize();
            hitReaction(zObj, _pushDir, w.id === 'sniper' ? 0.6 : w.id === 'shotgun' ? 0.12 : 0.22);
            addCash(3);
            if (zObj.hp <= 0) killZombie(zObj, isHead);
        }

        if (hitZombiesSet.size === 0 || (w.pierce && hitZombiesSet.size < maxTargets)) {
            if (wall) {
                worldHitNormal(wall, _normal);
                spawnImpact(wall.point, _normal, surfaceColorOf(wall), wall.object.material?.metalness > 0.5);
                spawnBulletHole(wall.point, _normal);
                lastDist = wall.distance;
            } else if (raycaster.ray.direction.y < -0.01) {
                // trafienie w ziemię
                const t = -raycaster.ray.origin.y / raycaster.ray.direction.y;
                if (t < 110) {
                    raycaster.ray.at(t, _hitPoint);
                    spawnImpact(_hitPoint, _normal.set(0, 1, 0), SURFACE_GROUND);
                    lastDist = t;
                }
            }
        }
        if (tracerShot && p === 0) {
            raycaster.ray.at(lastDist, _tracerEnd);
            spawnTracer(_muzzle, _tracerEnd);
        }
    }

    if (hitRegistered) {
        audio.playHit(headshotRegistered);
        hud.triggerHitMarker(headshotRegistered);
    }

    if (w.mag === 0 && w.reserve > 0) {
        const prompt = hud.els['reload-prompt'];
        prompt.textContent = 'Naciśnij [R] aby przeładować broń!';
        prompt.classList.remove('hidden');
    }
    hud.updateAmmo();
}

function killZombie(zObj, wasHeadshot) {
    if (zombies.indexOf(zObj) === -1) return;
    gameState.zombiesAlive = Math.max(0, gameState.zombiesAlive - 1);
    gameState.kills++;

    let reward = zObj.reward;
    if (wasHeadshot) {
        gameState.headshots++;
        reward += 20;
        hud.showHeadshotPopup(reward);
        _hitPoint.copy(zObj.mesh.position).setY(1.75 * zombieTypes[zObj.type].scale);
        spawnBlood(_hitPoint, 26, 1.5);
    }
    addCash(reward);
    spawnBloodDecal(zObj.mesh.position.x, zObj.mesh.position.z, zombieTypes[zObj.type].scale);
    startDeath(zObj, wasHeadshot);
    hud.updateHUD();

    // Sprawdź czy to był ostatni zombiak na tym poziomie
    if (gameState.zombiesToSpawn <= 0 && zombies.length === 0) onLevelCompleted();
}

function addCash(amount) {
    gameState.cash += amount;
    gameState.totalEarned += amount;
    hud.updateCash();
}

// ============================================================================
// SKLEPIK BRONI
// ============================================================================
function buyOrEquipWeapon(index) {
    const w = weaponsConfig[index];
    if (!w.owned) {
        if (gameState.cash < w.price) {
            audio.playEmptyClick();
            return hud.showShopError(`Brakuje Ci $${w.price - gameState.cash}, aby kupić ${w.name}!`);
        }
        gameState.cash -= w.price;
        w.owned = true;
        w.mag = w.magSize;
        w.reserve = w.defaultReserve;
        audio.playCashSound();
        switchWeapon(index);
        hud.showShopSuccess(`🎉 Kupiono i wyposażono nową broń: ${w.name}! (Klawisz [${w.slot}])`);
    } else {
        switchWeapon(index);
        hud.showShopSuccess(`Wybrano broń: ${w.name}.`);
    }
    hud.updateHUD();
    hud.renderShopWeaponsGrid();
}

function buyWeaponAmmo(index) {
    const w = weaponsConfig[index];
    if (gameState.cash < w.ammoPrice) {
        audio.playEmptyClick();
        return hud.showShopError('Nie masz wystarczająco pieniędzy na amunicję!');
    }
    gameState.cash -= w.ammoPrice;
    w.reserve += w.ammoPack;
    audio.playCashSound();
    hud.showShopSuccess(`Dokupiono +${w.ammoPack} nabojów do broni ${w.shortName}!`);
    hud.updateHUD();
    hud.renderShopWeaponsGrid();
}

function buySupply(itemType) {
    const fail = (msg) => { audio.playEmptyClick(); hud.showShopError(msg); };
    if (itemType === 'medkit') {
        if (gameState.hp >= gameState.maxHp) return fail('Masz już maksymalne zdrowie (100 HP)!');
        if (gameState.cash < 70) return fail('Za mało pieniędzy na Apteczkę ($70)!');
        gameState.cash -= 70;
        gameState.hp = Math.min(gameState.maxHp, gameState.hp + 65);
        hud.els['blood-overlay'].style.opacity = '0';
        hud.showShopSuccess('✚ Opatrzono rany (+65 HP)!');
    } else if (itemType === 'armor') {
        if (gameState.armor >= gameState.maxArmor) return fail('Kamizelka kuloodporna jest już w 100% sprawna!');
        if (gameState.cash < 95) return fail('Za mało pieniędzy na Kamizelkę ($95)!');
        gameState.cash -= 95;
        gameState.armor = gameState.maxArmor;
        hud.showShopSuccess('🛡 Założono nową Kamizelkę Kevlarową (100 pancerza)!');
    } else if (itemType === 'all_ammo') {
        if (gameState.cash < 110) return fail('Za mało pieniędzy na Dużą Skrzynię Amunicji ($110)!');
        gameState.cash -= 110;
        weaponsConfig.forEach(w => { if (w.owned && w.reserve !== Infinity) w.reserve += w.ammoPack; });
        hud.showShopSuccess('📦 Uzupełniono zapas amunicji do wszystkich posiadanych broni!');
    } else if (itemType === 'dmg_upgrade') {
        if (gameState.cash < gameState.dmgCost) return fail(`Potrzebujesz $${gameState.dmgCost} na ulepszenie kalibru!`);
        gameState.cash -= gameState.dmgCost;
        gameState.dmgLevel++;
        gameState.dmgMultiplier += 0.20;
        gameState.dmgCost = Math.round(gameState.dmgCost * 1.45);
        hud.showShopSuccess(`☠ Zwiększono siłę ognia wszystkich broni do ${Math.round(gameState.dmgMultiplier * 100)}%!`);
    }
    audio.playCashSound();
    hud.updateHUD();
    hud.renderShopWeaponsGrid();
}

function openShopModal() {
    if (gameState.isGameOver || !gameState.isRunning) return;
    gameState.isShopOpen = true;
    gameState.isPaused = true;
    gameState.isMouseDown = false;
    gameState.isAiming = false;
    hud.setScopeVisible(false);
    unlockPointer();
    hud.renderShopWeaponsGrid();
    hud.updateHUD();
    $('shop-modal').classList.remove('hidden');
}

function closeShopAndResume() {
    $('shop-modal').classList.add('hidden');
    gameState.isShopOpen = false;
    startOrResumeGameplay();
}

function pauseGameToMenu() {
    if (gameState.isGameOver) return;
    gameState.isPaused = true;
    gameState.isShopOpen = false;
    gameState.isMouseDown = false;
    gameState.isAiming = false;
    hud.setScopeVisible(false);
    unlockPointer();
    $('shop-modal').classList.add('hidden');
    $('start-screen').classList.remove('hidden');
    startBtn.textContent = 'KLIKNIJ, ABY WZNOWIĆ GRĘ';
}

// ============================================================================
// ZDROWIE GRACZA, PRZEGRANA, RESTART
// ============================================================================
function damagePlayer(rawDmg) {
    if (gameState.isGameOver) return;
    audio.playPlayerHurt();
    let hpDamage = rawDmg;
    if (gameState.armor > 0) {
        const absorbed = Math.min(gameState.armor, Math.ceil(rawDmg * 0.65));
        gameState.armor -= absorbed;
        hpDamage = rawDmg - absorbed;
    }
    gameState.hp = Math.max(0, gameState.hp - hpDamage);
    gameState.hurtShake = 0.25;

    const blood = hud.els['blood-overlay'];
    blood.style.opacity = '0.92';
    setTimeout(() => {
        if (!gameState.isGameOver) blood.style.opacity = gameState.hp < 30 ? '0.45' : '0';
    }, 260);
    hud.updateHUD();
    if (gameState.hp <= 0) triggerGameOver();
}

function triggerGameOver() {
    gameState.isGameOver = true;
    gameState.isPaused = true;
    gameState.isMouseDown = false;
    gameState.isAiming = false;
    localPlayer.alive = false;
    hud.setScopeVisible(false);
    $('between-levels-box').classList.add('hidden');
    $('shop-modal').classList.add('hidden');
    // Obowiązkowo zwalniamy PointerLock, aby przycisk "Powtórz poziom" / "Zagraj od nowa" dało się od razu kliknąć
    unlockPointer();
    const isNightLvl = gameState.level % 2 === 0;
    $('go-level').textContent = gameState.level;
    $('go-phase').textContent = isNightLvl ? 'NOC 🌙' : 'DZIEŃ ☀️';
    $('go-kills').textContent = gameState.kills;
    $('go-headshots').textContent = gameState.headshots;
    $('gameover-screen').classList.remove('hidden');
}

function resetPlayerPosition() {
    camera.position.copy(START_POS);
    gameState.velocity.set(0, 0, 0);
    gameState.yaw = 0;
    gameState.pitch = 0;
    camera.rotation.set(0, 0, 0);
    localPlayer.alive = true;
    hud.els['blood-overlay'].style.opacity = '0';
    $('gameover-screen').classList.add('hidden');
    hud.els['reload-prompt'].classList.add('hidden');
}

// Przycisk 1 na ekranie przegranej: Powtórz ten sam poziom (zachowaj kupione bronie!)
function retryCurrentLevel() {
    removeAllZombies();
    gameState.isGameOver = false;
    gameState.isShopOpen = false;
    gameState.hp = gameState.maxHp;
    gameState.armor = Math.max(gameState.armor, 40);
    gameState.stamina = 100;
    weaponsConfig.forEach(w => {
        if (w.owned) {
            w.mag = w.magSize;
            if (w.reserve !== Infinity && w.reserve < w.magSize * 2) w.reserve = w.magSize * 2;
        }
    });
    resetPlayerPosition();
    startLevel(gameState.level);
    startOrResumeGameplay();
}

// Przycisk 2 na ekranie przegranej: Zagraj od nowa od Poziomu 1 (Dzień)
function resetFullGame() {
    removeAllZombies();
    clearEffects();
    Object.assign(gameState, {
        isGameOver: false, isShopOpen: false, kills: 0, headshots: 0, cash: 200, totalEarned: 200,
        hp: 100, maxHp: 100, armor: 40, stamina: 100, dmgMultiplier: 1.0, dmgLevel: 1, dmgCost: 160,
        skyBlend: 0.0, targetSkyBlend: 0.0, currentWeaponIndex: 0, isReloading: false
    });
    weaponsConfig.forEach((w, idx) => {
        w.owned = idx === 0;
        w.mag = w.magSize;
        w.reserve = w.defaultReserve;
    });
    weaponMeshes.forEach((m, idx) => { m.visible = idx === 0; });
    resetPlayerPosition();
    startLevel(1);
    startOrResumeGameplay();
}

// ============================================================================
// STEROWANIE MYSZĄ I KLAWIATURĄ
// ============================================================================
function lockPointerSafely() {
    try {
        if (canvas.requestPointerLock) {
            const p = canvas.requestPointerLock({ unadjustedMovement: true });
            if (p && typeof p.catch === 'function') {
                p.catch(() => {
                    // niektóre przeglądarki nie znają unadjustedMovement – próbujemy zwyczajnie
                    try {
                        const p2 = canvas.requestPointerLock();
                        if (p2 && p2.catch) p2.catch(() => {});
                    } catch (e) {}
                });
            }
        }
    } catch (e) {}
}

function unlockPointer() {
    try { if (document.pointerLockElement) document.exitPointerLock(); } catch (e) {}
}

function startOrResumeGameplay() {
    if (!gameState.isLoaded) return;
    audio.init();
    gameState.isPaused = false;
    gameState.isShopOpen = false;
    $('start-screen').classList.add('hidden');
    $('shop-modal').classList.add('hidden');
    if (!gameState.isRunning) {
        gameState.isRunning = true;
        startLevel(1);
    }
    if (!gameState.isBetweenLevels) lockPointerSafely();
}

document.addEventListener('pointerlockchange', () => {
    if (document.pointerLockElement !== canvas) {
        gameState.isMouseDown = false;
        gameState.isAiming = false;
        hud.setScopeVisible(false);
        if (!gameState.isShopOpen && !gameState.isGameOver && !gameState.isBetweenLevels && gameState.isRunning) pauseGameToMenu();
    }
});

startBtn.addEventListener('click', () => startOrResumeGameplay());

// Wszystkie przyciski interfejsu (data-akcja) w jednym miejscu
document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-akcja]');
    if (!el) return;
    const idx = Number(el.dataset.indeks);
    switch (el.dataset.akcja) {
        case 'sklep': openShopModal(); break;
        case 'latarka': toggleFlashlight(); break;
        case 'pauza': pauseGameToMenu(); break;
        case 'nastepny-poziom': startNextLevelNow(); break;
        case 'wroc-ze-sklepu': closeShopAndResume(); break;
        case 'bron': switchWeapon(idx); break;
        case 'kup-bron': buyOrEquipWeapon(idx); break;
        case 'kup-amunicje': buyWeaponAmmo(idx); break;
        case 'kup': buySupply(el.dataset.co); break;
        case 'powtorz': retryCurrentLevel(); break;
        case 'od-nowa': resetFullGame(); break;
        case 'jakosc': chooseQuality(el.dataset.jakosc); break;
    }
});

window.addEventListener('contextmenu', (e) => e.preventDefault());

window.addEventListener('mousemove', (e) => {
    if (gameState.isPaused || gameState.isShopOpen || gameState.isGameOver) return;
    if (document.pointerLockElement !== canvas) return;   // bez blokady kursora (np. między poziomami) nie obracamy kamery
    const w = weaponsConfig[gameState.currentWeaponIndex];
    const adsMult = gameState.isAiming ? (w.id === 'sniper' ? 0.25 : 0.55) : 1.0;
    const sens = 0.0023 * adsMult * settings.sensitivity;
    gameState.yaw -= (e.movementX || 0) * sens;
    gameState.pitch -= (e.movementY || 0) * sens;
    const maxPitch = Math.PI / 2 - 0.08;
    gameState.pitch = Math.max(-maxPitch, Math.min(maxPitch, gameState.pitch));
});

canvas.addEventListener('mousedown', (e) => {
    if (gameState.isPaused || gameState.isShopOpen || gameState.isGameOver) return;
    if (document.pointerLockElement !== canvas && !gameState.isBetweenLevels) lockPointerSafely();
    if (e.button === 0) {
        gameState.isMouseDown = true;
        fireWeapon();
    } else if (e.button === 2) {
        gameState.isAiming = true;
    }
});

window.addEventListener('mouseup', (e) => {
    if (e.button === 0) gameState.isMouseDown = false;
    else if (e.button === 2) gameState.isAiming = false;
});

window.addEventListener('wheel', (e) => {
    if (gameState.isPaused || gameState.isShopOpen || gameState.isGameOver) return;
    const owned = weaponsConfig.map((w, i) => (w.owned ? i : -1)).filter(i => i !== -1);
    if (owned.length <= 1) return;
    const cur = owned.indexOf(gameState.currentWeaponIndex);
    const next = (cur + (e.deltaY > 0 ? 1 : owned.length - 1)) % owned.length;
    switchWeapon(owned[next]);
}, { passive: true });

window.addEventListener('keydown', (e) => {
    if (e.code in keys) keys[e.code] = true;
    if (e.code === 'Space' || e.code === 'Tab') e.preventDefault();

    if (e.code === 'KeyB' || e.code === 'Tab') {
        if (gameState.isRunning && !gameState.isGameOver) {
            if (gameState.isShopOpen) closeShopAndResume();
            else openShopModal();
        }
        return;
    }
    if (e.code === 'KeyN' && gameState.isBetweenLevels && !gameState.isGameOver) {
        startNextLevelNow();
        return;
    }
    if (e.code === 'KeyP' || e.code === 'Escape') {
        if (gameState.isShopOpen) {
            closeShopAndResume();
            return;
        }
        if (gameState.isRunning && !gameState.isGameOver && !gameState.isPaused) {
            pauseGameToMenu();
            return;
        }
    }
    if (gameState.isPaused || gameState.isShopOpen || gameState.isGameOver) return;

    if (e.code.startsWith('Digit')) {
        const n = Number(e.code.slice(5));
        if (n >= 1 && n <= 7) switchWeapon(n - 1);
    }
    if (e.code === 'KeyR') reloadWeapon();
    if (e.code === 'KeyF') toggleFlashlight();
    if (e.code === 'KeyE') tryPickupNearbyLoot(true);
});

window.addEventListener('keyup', (e) => {
    if (e.code in keys) keys[e.code] = false;
});

window.addEventListener('blur', () => {
    for (const k in keys) keys[k] = false;
    gameState.isMouseDown = false;
});

window.addEventListener('resize', resize);

// ============================================================================
// ŁUP W DOMKACH
// ============================================================================
function collectLootItem(item) {
    item.active = false;
    item.mesh.visible = false;
    item.glow.visible = false;
    audio.playCashSound();
    if (item.type === 'medkit') {
        gameState.hp = Math.min(gameState.maxHp, gameState.hp + 40);
        hud.els['blood-overlay'].style.opacity = '0';
        hud.showLootPopup('✚ ZNALEZIONO APTECZKĘ W DOMU (+40 HP)!');
    } else if (item.type === 'cash') {
        addCash(65);
        hud.showLootPopup('💵 ZNALEZIONO GOTÓWKĘ NA STOLE (+$65)!');
    } else {
        weaponsConfig.forEach(w => { if (w.owned && w.reserve !== Infinity) w.reserve += Math.ceil(w.ammoPack * 0.45); });
        hud.showLootPopup('🔥 ZNALEZIONO ZAPAS AMUNICJI W DOMU!');
    }
    hud.updateHUD();
}

function tryPickupNearbyLoot(manualKey = false) {
    const maxDistSq = manualKey ? 12.0 : 3.6;
    for (const item of lootItems) {
        if (!item.active) continue;
        const dx = camera.position.x - item.mesh.position.x;
        const dz = camera.position.z - item.mesh.position.z;
        if (dx * dx + dz * dz <= maxDistSq) {
            collectLootItem(item);
            break;
        }
    }
}

function checkPlayerLocationAndLoot() {
    const house = houseAt(camera.position.x, camera.position.z);
    localPlayer.house = house;
    gameState.playerIndoors = !!house;
    hud.setLocation(house ? house.name : null);

    let nearAnyLoot = false;
    for (const item of lootItems) {
        if (!item.active) continue;
        const dx = camera.position.x - item.mesh.position.x;
        const dz = camera.position.z - item.mesh.position.z;
        const dSq = dx * dx + dz * dz;
        if (dSq < 2.9) collectLootItem(item);
        else if (dSq < 11.5) nearAnyLoot = true;
    }
    hud.setInteractPrompt(nearAnyLoot);
}

// ============================================================================
// GŁÓWNA PĘTLA GRY
// ============================================================================
const _forward = new THREE.Vector3();
const _right = new THREE.Vector3();
const _moveDir = new THREE.Vector3();
const _camRight = new THREE.Vector3();
const UP = new THREE.Vector3(0, 1, 0);
let lastFrameTime = performance.now();
let idleFrames = 0;
let hudTimer = 0;

const zombieCallbacks = {
    attack: (z) => damagePlayer(z.damage),
    groan: (z, dist) => {
        _camRight.set(1, 0, 0).applyQuaternion(camera.quaternion);
        const dx = z.mesh.position.x - camera.position.x, dz = z.mesh.position.z - camera.position.z;
        const pan = (dx * _camRight.x + dz * _camRight.z) / Math.max(1, dist);
        audio.playZombieGroan(z.type === 'tank', pan, Math.max(0.15, 1 - dist / 30));
    }
};

function updatePlayer(dt, currentWeapon) {
    _forward.set(0, 0, -1).applyAxisAngle(UP, gameState.yaw);
    _right.set(1, 0, 0).applyAxisAngle(UP, gameState.yaw);
    _moveDir.set(0, 0, 0);
    if (keys.KeyW || keys.ArrowUp) _moveDir.add(_forward);
    if (keys.KeyS || keys.ArrowDown) _moveDir.sub(_forward);
    if (keys.KeyD || keys.ArrowRight) _moveDir.add(_right);
    if (keys.KeyA || keys.ArrowLeft) _moveDir.sub(_right);
    const isMoving = _moveDir.lengthSq() > 0;
    if (isMoving) _moveDir.normalize();

    const wantsSprint = (keys.ShiftLeft || keys.ShiftRight) && isMoving && !gameState.isAiming;
    let moveSpeed = 7.5 * (gameState.isAiming ? 0.65 : 1.0);
    if (wantsSprint && gameState.stamina > 5) {
        moveSpeed *= 1.48;
        gameState.stamina = Math.max(0, gameState.stamina - 22 * dt);
    } else {
        gameState.stamina = Math.min(100, gameState.stamina + 18 * dt);
    }

    camera.position.x += _moveDir.x * moveSpeed * dt;
    resolveWorldCollisions(camera.position, PLAYER_RADIUS);
    camera.position.z += _moveDir.z * moveSpeed * dt;
    resolveWorldCollisions(camera.position, PLAYER_RADIUS);

    if (keys.Space && gameState.canJump) {
        gameState.velocity.y = 7.6;
        gameState.canJump = false;
    }
    gameState.velocity.y -= 20.0 * dt;
    camera.position.y += gameState.velocity.y * dt;
    if (camera.position.y <= PLAYER_EYE_HEIGHT) {
        camera.position.y = PLAYER_EYE_HEIGHT;
        gameState.velocity.y = 0;
        gameState.canJump = true;
    }

    if (isMoving && gameState.canJump) {
        gameState.stepTimer -= dt * (wantsSprint ? 1.45 : 1.0);
        if (gameState.stepTimer <= 0) {
            audio.playFootstep(gameState.playerIndoors, wantsSprint);
            gameState.stepTimer = 0.42;
        }
    }

    // Kamera: kołysanie głowy przy chodzie i drżenie po otrzymaniu ciosu
    gameState.hurtShake = Math.max(0, (gameState.hurtShake || 0) - dt);
    const shake = gameState.hurtShake * 0.08;
    const headBob = isMoving && gameState.canJump ? Math.sin(gameState.bobTimer) * 0.035 * (wantsSprint ? 1.4 : 1) : 0;
    camera.rotation.y = gameState.yaw + (Math.random() - 0.5) * shake;
    camera.rotation.x = gameState.pitch + (Math.random() - 0.5) * shake + headBob * 0.12 * (1 - gameState.aimProgress * 0.8);
    gameState.recoilRoll = THREE.MathUtils.lerp(gameState.recoilRoll || 0, 0, dt * 10);
    camera.rotation.z = gameState.recoilRoll + (isMoving ? Math.cos(gameState.bobTimer * 0.5) * 0.004 : 0);

    gameState.recoilOffset = THREE.MathUtils.lerp(gameState.recoilOffset, 0, dt * 14);
    gameState.crosshairSpread = THREE.MathUtils.lerp(gameState.crosshairSpread, isMoving ? (wantsSprint ? 14 : 6) : 0, dt * 10);

    // Broń: biodro ↔ przyrządy celownicze (wysokość muszki każdej broni), kołysanie
    const v = weaponView[gameState.currentWeaponIndex];
    const a = gameState.aimProgress;
    const tx = THREE.MathUtils.lerp(HIP_POS.x, 0, a);
    const ty = THREE.MathUtils.lerp(HIP_POS.y, -v.sightY, a);
    const tz = THREE.MathUtils.lerp(HIP_POS.z, v.adsZ, a);
    const swayAmp = gameState.isAiming ? 0.003 : 0.02;
    if (isMoving && gameState.canJump) {
        gameState.bobTimer += dt * (wantsSprint ? 13 : 9);
        weaponHolder.position.x = tx + Math.cos(gameState.bobTimer * 0.5) * swayAmp;
        weaponHolder.position.y = ty + Math.abs(Math.sin(gameState.bobTimer)) * swayAmp - (wantsSprint ? 0.04 : 0);
    } else {
        gameState.bobTimer += dt * 2.2;
        weaponHolder.position.x = THREE.MathUtils.lerp(weaponHolder.position.x, tx, dt * 12);
        weaponHolder.position.y = THREE.MathUtils.lerp(weaponHolder.position.y, ty + Math.sin(gameState.bobTimer) * 0.003 * (1 - a), dt * 12);
    }
    weaponHolder.position.z = tz + gameState.recoilOffset * (1 - a * 0.5);
    weaponHolder.rotation.z = THREE.MathUtils.lerp(weaponHolder.rotation.z, wantsSprint ? 0.35 : 0, dt * 8);
    return isMoving;
}

function gameLoop(now) {
    requestAnimationFrame(gameLoop);
    const dt = Math.min(0.1, (now - lastFrameTime) / 1000);
    lastFrameTime = now;
    const time = now / 1000;

    // Zawsze płynnie aktualizuj przejście Dzień <-> Noc
    gameState.skyBlend = THREE.MathUtils.lerp(gameState.skyBlend, gameState.targetSkyBlend, Math.min(1, dt * 1.8));
    const settled = Math.abs(gameState.skyBlend - gameState.targetSkyBlend) < 0.001;

    const frozen = gameState.isPaused || gameState.isShopOpen || gameState.isGameOver;
    if (frozen) {
        // W menu / sklepie rysujemy rzadziej – oszczędzamy baterię i wentylator
        idleFrames++;
        if (!settled || idleFrames % 6 === 0) {
            updateEnvironment(dt, gameState.skyBlend, camera.position, gameState.playerIndoors);
            updateWorld(dt, time);
            renderFrame(time);
        }
        return;
    }
    idleFrames = 0;

    const currentWeapon = weaponsConfig[gameState.currentWeaponIndex];
    if (gameState.switchTimer > 0) gameState.switchTimer -= dt;

    // 1. Ogień ciągły dla broni automatycznych (MP5, AK-47, Minigun M249)
    const barrels = weaponMeshes[6].userData.barrels;
    if (gameState.isMouseDown && currentWeapon.auto) {
        fireWeapon();
        if (currentWeapon.id === 'minigun') gameState.barrelSpin = Math.min(30, (gameState.barrelSpin || 0) + dt * 90);
    }
    gameState.barrelSpin = Math.max(0, (gameState.barrelSpin || 0) - dt * 20);
    barrels.rotation.z += dt * gameState.barrelSpin;

    if (gameState.muzzleLightTimer > 0) {
        gameState.muzzleLightTimer -= dt;
        if (gameState.muzzleLightTimer <= 0) muzzleLight.intensity = 0;
    }
    updateMuzzleFlash(dt);

    // 2. Celowanie przez muszkę / lunetę snajperską (PPM)
    const targetAim = gameState.isAiming && !gameState.isReloading ? 1.0 : 0.0;
    gameState.aimProgress = THREE.MathUtils.lerp(gameState.aimProgress, targetAim, Math.min(1, dt * 14));
    const targetFov = THREE.MathUtils.lerp(75, currentWeapon.adsFov, gameState.aimProgress);
    if (Math.abs(camera.fov - targetFov) > 0.05) {
        camera.fov = targetFov;
        camera.updateProjectionMatrix();
    }
    const scoped = currentWeapon.id === 'sniper' && gameState.aimProgress > 0.75;
    hud.setScopeVisible(scoped);
    weaponMeshes[5].visible = gameState.currentWeaponIndex === 5 && !scoped;

    // 3. Przeładowanie broni
    if (gameState.isReloading) {
        gameState.reloadTimer -= dt;
        const k = 1 - Math.max(0, gameState.reloadTimer) / currentWeapon.reloadTime;
        weaponHolder.rotation.x = -0.55 * Math.sin(Math.min(1, k) * Math.PI);
        weaponHolder.rotation.y = 0.35 * Math.sin(Math.min(1, k) * Math.PI);
        if (gameState.reloadTimer <= 0) {
            gameState.isReloading = false;
            const needed = currentWeapon.magSize - currentWeapon.mag;
            const taken = Math.min(needed, currentWeapon.reserve);
            currentWeapon.mag += taken;
            if (currentWeapon.reserve !== Infinity) currentWeapon.reserve -= taken;
            audio.playReload();
            hud.updateAmmo();
            hud.renderWeaponSlotsBar();
        }
    } else {
        weaponHolder.rotation.x = THREE.MathUtils.lerp(weaponHolder.rotation.x, 0, dt * 12);
        weaponHolder.rotation.y = THREE.MathUtils.lerp(weaponHolder.rotation.y, 0, dt * 12);
    }

    // 4. Poruszanie się gracza i kolizje
    updatePlayer(dt, currentWeapon);
    checkPlayerLocationAndLoot();

    // 5. Spawnowanie zombie dla bieżącego poziomu
    if (!gameState.isBetweenLevels && gameState.zombiesToSpawn > 0) {
        gameState.spawnTimer -= dt;
        if (gameState.spawnTimer <= 0 && zombies.length < MAX_ZOMBIES_AT_ONCE) {
            spawnNextZombie();
            gameState.zombiesToSpawn--;
            gameState.spawnTimer = Math.max(0.35, 1.30 - gameState.level * 0.07);
        }
    }

    // 6. AI zombie, efekty, łuski
    updateZombies(dt, time, zombieCallbacks);
    updateEffects(dt);
    updateShells(dt);
    updateWorld(dt, time);

    // 7. Interfejs (pasek kondycji i celownik co klatkę, reszta tylko przy zmianach)
    hud.updateStamina();
    hud.updateCrosshairUI();
    hudTimer += dt;
    if (hudTimer > 0.5) {
        hudTimer = 0;
        if (params.has('fps')) hud.setFps(lastFps);
    }

    audio.updateAmbience(dt, gameState.skyBlend, gameState.playerIndoors);
    updateEnvironment(dt, gameState.skyBlend, camera.position, gameState.playerIndoors);
    renderFrame(time);
    trackFrameTime(dt);
}

hud.updateHUD();
updateEnvironment(1, 0, camera.position);
requestAnimationFrame(gameLoop);

// Dostęp do stanu z konsoli (diagnostyka)
window.__gra = { gameState, weaponsConfig, zombies, renderer, scene, camera, quality: () => qualityName, startOrResumeGameplay, startNextLevelNow, fireWeapon, keys, killZombie, damagePlayer };
