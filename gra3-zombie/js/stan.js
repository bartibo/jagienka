// ============================================================================
// WSPÓLNY STAN GRY: STAŁE, STAN GRACZA, 7 BRONI, TYPY ZOMBIE, USTAWIENIA
// ============================================================================
import * as THREE from 'three';

export const WORLD_RADIUS = 70;          // okrągła granica osady (dalej gęsty las)
export const PLAYER_EYE_HEIGHT = 1.72;
export const PLAYER_RADIUS = 0.45;
export const MAX_ZOMBIES_AT_ONCE = 28;

export const gameState = {
    isRunning: false,
    isPaused: true,
    isShopOpen: false,
    isGameOver: false,
    isBetweenLevels: false,
    isLoaded: false,

    // Poziom 1 = Dzień (☀️), Poziom 2 = Noc (🌙), Poziom 3 = Dzień (☀️)...
    level: 1,
    isNight: false,
    skyBlend: 0.0,       // 0.0 = pełny słoneczny dzień, 1.0 = głęboka noc
    targetSkyBlend: 0.0, // płynne przejście nieba i świateł między poziomami
    nightAggroFactor: 1.0,
    playerIndoors: false,
    currentHouse: null,

    zombiesToSpawn: 0,
    zombiesAlive: 0,
    spawnTimer: 0,

    kills: 0,
    headshots: 0,
    cash: 200,
    totalEarned: 200,

    hp: 100,
    maxHp: 100,
    armor: 40,
    maxArmor: 100,
    stamina: 100,

    dmgMultiplier: 1.0,
    dmgLevel: 1,
    dmgCost: 160,

    velocity: new THREE.Vector3(),
    canJump: true,
    yaw: 0,
    pitch: 0,
    bobTimer: 0,
    stepTimer: 0,

    currentWeaponIndex: 0,
    isReloading: false,
    reloadTimer: 0,
    lastShotTime: 0,
    isMouseDown: false,
    isAiming: false,
    aimProgress: 0,
    recoilOffset: 0,
    crosshairSpread: 0,
    switchTimer: 0,
    flashlightOn: false
};

// Gracze, za którymi idą zombie. Na razie jest tylko jeden (lokalny), ale AI zombie
// zawsze wybiera najbliższego gracza z tej listy – pod przyszłą grę we dwoje lub we troje.
export const players = [];

// 7 coraz lepszych broni dostępnych w Sklepiku (klawisze 1-7)
export const weaponsConfig = [
    {
        id: 'pistol', slot: 1,
        name: 'Glock 19 (9mm)', shortName: 'Glock 19',
        desc: 'Niezawodny pistolet startowy z nielimitowaną amunicją rezerwową.',
        owned: true, price: 0, ammoPrice: 0, ammoPack: 0,
        magSize: 15, mag: 15, reserve: Infinity, defaultReserve: Infinity,
        damage: 38, fireRate: 0.18, reloadTime: 1.1, pellets: 1,
        spread: 0.012, adsSpread: 0.002, auto: false, pierce: false,
        recoilKick: 0.07, adsFov: 60
    },
    {
        id: 'magnum', slot: 2,
        name: 'Rewolwer Magnum .44', shortName: 'Magnum .44',
        desc: 'Ciężki rewolwer o potężnej sile obalającej. Zabija zwykłe zombie jednym strzałem w głowę.',
        owned: false, price: 250, ammoPrice: 55, ammoPack: 24,
        magSize: 6, mag: 6, reserve: 36, defaultReserve: 36,
        damage: 92, fireRate: 0.36, reloadTime: 1.45, pellets: 1,
        spread: 0.008, adsSpread: 0.001, auto: false, pierce: false,
        recoilKick: 0.16, adsFov: 55
    },
    {
        id: 'shotgun', slot: 3,
        name: 'Strzelba Pompka 12GA', shortName: 'Strzelba 12GA',
        desc: 'Wystrzeliwuje chmurę 8 śrucin jednocześnie. Niszczycielska na bliskim dystansie i w domkach.',
        owned: false, price: 450, ammoPrice: 70, ammoPack: 24,
        magSize: 7, mag: 7, reserve: 35, defaultReserve: 35,
        damage: 27, // 27 x 8 = 216 dmg!
        fireRate: 0.68, reloadTime: 1.65, pellets: 8,
        spread: 0.068, adsSpread: 0.038, auto: false, pierce: false,
        recoilKick: 0.20, adsFov: 64
    },
    {
        id: 'smg', slot: 4,
        name: 'Pistolet Maszynowy MP5', shortName: 'MP5 SMG',
        desc: 'Bardzo szybkostrzelny pistolet maszynowy z małym odrzutem. Świetny na nocnych biegaczy.',
        owned: false, price: 700, ammoPrice: 80, ammoPack: 90,
        magSize: 35, mag: 35, reserve: 140, defaultReserve: 140,
        damage: 30, fireRate: 0.072, reloadTime: 1.25, pellets: 1,
        spread: 0.024, adsSpread: 0.005, auto: true, pierce: false,
        recoilKick: 0.045, adsFov: 56
    },
    {
        id: 'ak47', slot: 5,
        name: 'Karabin Szturmowy AK-47', shortName: 'AK-47 Kałasz',
        desc: 'Legendarny automat kalibru 7.62mm. Wysokie obrażenia i ogień ciągły na średni i daleki dystans.',
        owned: false, price: 1100, ammoPrice: 95, ammoPack: 90,
        magSize: 30, mag: 30, reserve: 150, defaultReserve: 150,
        damage: 52, fireRate: 0.105, reloadTime: 1.40, pellets: 1,
        spread: 0.020, adsSpread: 0.003, auto: true, pierce: false,
        recoilKick: 0.068, adsFov: 50
    },
    {
        id: 'sniper', slot: 6,
        name: 'Karabin Snajperski .50 BMG', shortName: 'Snajperka .50',
        desc: 'Potężny karabin wyborowy z lunetą 8x (PPM). Pociski przebijają kilku wrogów naraz!',
        owned: false, price: 1600, ammoPrice: 110, ammoPack: 20,
        magSize: 5, mag: 5, reserve: 25, defaultReserve: 25,
        damage: 260, fireRate: 0.85, reloadTime: 1.85, pellets: 1,
        spread: 0.008, adsSpread: 0.0002, auto: false, pierce: true,
        recoilKick: 0.25, adsFov: 22 // duży zoom optyczny
    },
    {
        id: 'minigun', slot: 7,
        name: 'Ciężki KM M249 SAW / Minigun', shortName: 'M249 SAW',
        desc: 'Najpotężniejsza broń w grze! Magazynek taśmowy na 100 nabojów i huraganowy ogień ciągły.',
        owned: false, price: 2400, ammoPrice: 140, ammoPack: 200,
        magSize: 100, mag: 100, reserve: 300, defaultReserve: 300,
        damage: 46, fireRate: 0.062, reloadTime: 2.30, pellets: 1,
        spread: 0.032, adsSpread: 0.009, auto: true, pierce: false,
        recoilKick: 0.052, adsFov: 54
    }
];

export const zombieTypes = {
    walker: {
        name: 'Zarażony Osadnik',
        skin: '#7d8a72', skinDark: '#4d5a45',
        shirt: '#4a5466', pants: '#2c3340', shoes: '#231d18', hair: '#2a241e',
        eyeColor: '#ff4d3d', torn: 0.35,
        scale: 1.0, speed: 3.3, hp: 90, damage: 14, reward: 30
    },
    runner: {
        name: 'Wygłodniały Biegacz',
        skin: '#9a7468', skinDark: '#5e3c36',
        shirt: '#6b2a24', pants: '#2b2622', shoes: '#1b1714', hair: '#120e0c',
        eyeColor: '#ffc23d', torn: 0.65,
        scale: 0.92, speed: 5.9, hp: 65, damage: 12, reward: 42
    },
    tank: {
        name: 'Zmutowany Drwal (Kolos)',
        skin: '#6d6478', skinDark: '#3e354a',
        shirt: '#5a2e2e', pants: '#1f2a3a', shoes: '#1a1612', hair: '#3b2a1c',
        eyeColor: '#d08bff', torn: 0.2, flannel: true,
        scale: 1.48, speed: 2.3, hp: 320, damage: 26, reward: 100
    }
};

export const keys = {
    KeyW: false, KeyA: false, KeyS: false, KeyD: false,
    ArrowUp: false, ArrowLeft: false, ArrowDown: false, ArrowRight: false,
    Space: false, ShiftLeft: false, ShiftRight: false
};

// Ustawienia zapamiętywane w przeglądarce (jakość grafiki, czułość myszy)
export const settings = { quality: 'auto', sensitivity: 1.0 };
try {
    const saved = JSON.parse(localStorage.getItem('martwa-osada-ustawienia') || '{}');
    if (saved.quality) settings.quality = saved.quality;
    if (saved.sensitivity) settings.sensitivity = saved.sensitivity;
} catch (e) {}

export function saveSettings() {
    try { localStorage.setItem('martwa-osada-ustawienia', JSON.stringify(settings)); } catch (e) {}
}
