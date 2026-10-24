// ============================================================================
// INTERFEJS: HUD, PASEK BRONI, SKLEPIK, POWIADOMIENIA, CELOWNIK
// Elementy pobierane raz, a zapis do DOM tylko wtedy, gdy wartość się zmieniła.
// ============================================================================
import { gameState, weaponsConfig } from './stan.js';

const $ = (id) => document.getElementById(id);
export const els = {};
[
    'hud-level', 'hud-zombies', 'hud-kills', 'hud-cash', 'shop-cash', 'time-icon', 'hud-phase-title', 'hud-next-phase',
    'hud-time-desc', 'hud-hp-bar', 'hud-hp-text', 'hud-armor-bar', 'hud-armor-text', 'hud-stamina-bar', 'hud-stamina-text',
    'hud-weapon-name', 'hud-ammo-mag', 'hud-ammo-res', 'hud-reload-state', 'upg-dmg-lvl', 'upg-dmg-cost', 'hud-location',
    'weapon-slots-bar', 'shop-weapons-grid', 'shop-feedback', 'headshot-popup', 'loot-popup', 'interact-prompt',
    'reload-prompt', 'blood-overlay', 'sniper-scope', 'crosshair', 'hm-1', 'hm-2', 'ch-top', 'ch-bottom', 'ch-left', 'ch-right', 'ch-dot',
    'level-banner', 'level-subbanner', 'fps-counter'
].forEach(id => { els[id] = $(id); });

const cache = new Map();
function setText(el, value) {
    if (!el) return;
    const v = String(value);
    if (cache.get(el) !== v) {
        cache.set(el, v);
        el.textContent = v;
    }
}
const classCache = new Map();
function setClass(el, value) {
    if (!el || classCache.get(el) === value) return;
    classCache.set(el, value);
    el.className = value;
}
const styleCache = new Map();
function setStyle(el, prop, value) {
    const key = el.id + prop;
    if (styleCache.get(key) === value) return;
    styleCache.set(key, value);
    el.style[prop] = value;
}

export function updateCash() {
    setText(els['hud-cash'], gameState.cash);
    setText(els['shop-cash'], gameState.cash);
}

export function updateHUD() {
    setText(els['hud-level'], gameState.level);
    setText(els['hud-zombies'], gameState.zombiesAlive);
    setText(els['hud-kills'], gameState.kills);
    updateCash();

    const isNightLvl = gameState.level % 2 === 0;
    const nextLvl = gameState.level + 1;
    const nextIsNight = nextLvl % 2 === 0;
    setText(els['time-icon'], isNightLvl ? '🌙' : '☀️');
    setText(els['hud-phase-title'], `POZIOM ${gameState.level}: ${isNightLvl ? 'NOC' : 'DZIEŃ'}`);
    setClass(els['hud-phase-title'], isNightLvl
        ? 'font-teko text-2xl md:text-3xl text-indigo-300 leading-none tracking-wider'
        : 'font-teko text-2xl md:text-3xl text-amber-400 leading-none tracking-wider');
    setText(els['hud-next-phase'], `Następny: ${nextIsNight ? '🌙 NOC' : '☀️ DZIEŃ'} (Poz. ${nextLvl})`);
    setClass(els['hud-next-phase'], nextIsNight
        ? 'text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-700/60'
        : 'text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-600/60');
    setText(els['hud-time-desc'], isNightLvl
        ? 'Nocna furia zombie! Latarnie i domki oświetlają mrok • Latarka [F]'
        : 'Słoneczny dzień • Przeszukuj 5 domków i zbieraj pieniądze na nowe bronie [B]');

    const hpPct = Math.max(0, Math.min(100, (gameState.hp / gameState.maxHp) * 100));
    setStyle(els['hud-hp-bar'], 'width', `${hpPct}%`);
    setText(els['hud-hp-text'], `${Math.ceil(gameState.hp)} / ${gameState.maxHp}`);
    const armorPct = Math.max(0, Math.min(100, (gameState.armor / gameState.maxArmor) * 100));
    setStyle(els['hud-armor-bar'], 'width', `${armorPct}%`);
    setText(els['hud-armor-text'], `${Math.ceil(gameState.armor)} / ${gameState.maxArmor}`);

    updateAmmo();
    setText(els['upg-dmg-lvl'], `Poz. ${gameState.dmgLevel}`);
    setText(els['upg-dmg-cost'], `$${gameState.dmgCost}`);
    renderWeaponSlotsBar();
}

export function updateAmmo() {
    const w = weaponsConfig[gameState.currentWeaponIndex];
    setText(els['hud-weapon-name'], `${w.slot}. ${w.name}`);
    setText(els['hud-ammo-mag'], w.mag);
    setText(els['hud-ammo-res'], w.reserve === Infinity ? '∞' : w.reserve);
    if (gameState.isReloading) {
        setText(els['hud-reload-state'], 'PRZEŁADOWYWANIE...');
        setClass(els['hud-reload-state'], 'text-[11px] text-amber-400 uppercase font-bold animate-pulse');
    } else {
        setText(els['hud-reload-state'], w.id === 'sniper' ? 'Luneta 8x pod [PPM]' : (w.auto ? 'Ogień ciągły • [PPM] Celownik' : 'Pojedynczy • [PPM] Celownik'));
        setClass(els['hud-reload-state'], 'text-[11px] text-stone-400 uppercase');
    }
    const slot = slotEls[gameState.currentWeaponIndex];
    if (slot) setText(slot.ammo, w.reserve === Infinity ? '∞' : `${w.mag}/${w.reserve}`);
}

export function updateStamina() {
    setStyle(els['hud-stamina-bar'], 'width', `${Math.round(gameState.stamina)}%`);
    setText(els['hud-stamina-text'], `${Math.round(gameState.stamina)}%`);
}

// Pasek 7 slotów: przebudowa tylko po zakupie / zmianie broni, amunicja aktualizowana w miejscu
let slotEls = [];
let slotKey = '';
export function renderWeaponSlotsBar() {
    const key = weaponsConfig.map(w => (w.owned ? 1 : 0)).join('') + gameState.currentWeaponIndex;
    if (key === slotKey) {
        weaponsConfig.forEach((w, idx) => {
            if (w.owned && slotEls[idx]) setText(slotEls[idx].ammo, w.reserve === Infinity ? '∞' : `${w.mag}/${w.reserve}`);
        });
        return;
    }
    slotKey = key;
    const bar = els['weapon-slots-bar'];
    bar.innerHTML = '';
    slotEls = [];
    weaponsConfig.forEach((w, idx) => {
        const isSelected = idx === gameState.currentWeaponIndex;
        const btn = document.createElement('div');
        if (!w.owned) {
            btn.dataset.akcja = 'sklep';
            btn.className = 'cursor-pointer bg-stone-950/75 border border-stone-800 px-2.5 py-1 rounded-lg text-[11px] flex items-center gap-1.5 opacity-55 hover:opacity-90 transition';
            btn.innerHTML = `
                <span class="bg-stone-800 text-stone-400 font-bold px-1.5 py-0.5 rounded">${w.slot}</span>
                <div>
                    <div class="font-bold text-stone-400">${w.shortName}</div>
                    <div class="text-[9px] text-amber-400 font-bold">🔒 Kup: $${w.price}</div>
                </div>`;
            slotEls.push(null);
        } else {
            btn.dataset.akcja = 'bron';
            btn.dataset.indeks = idx;
            btn.className = isSelected
                ? 'cursor-pointer bg-stone-900/95 border-2 border-amber-400 px-2.5 py-1 rounded-lg text-[11px] flex items-center gap-1.5 scale-105 shadow-lg transition'
                : 'cursor-pointer bg-stone-900/85 border border-stone-700 px-2.5 py-1 rounded-lg text-[11px] flex items-center gap-1.5 hover:border-stone-500 transition';
            btn.innerHTML = `
                <span class="${isSelected ? 'bg-amber-400 text-black' : 'bg-stone-700 text-stone-200'} font-extrabold px-1.5 py-0.5 rounded">${w.slot}</span>
                <div>
                    <div class="font-bold text-white">${w.shortName}</div>
                    <div class="text-[9px] text-emerald-400 font-semibold" data-ammo></div>
                </div>`;
            const ammo = btn.querySelector('[data-ammo]');
            ammo.textContent = w.reserve === Infinity ? '∞' : `${w.mag}/${w.reserve}`;
            slotEls.push({ ammo });
        }
        bar.appendChild(btn);
    });
}

export function renderShopWeaponsGrid() {
    const grid = els['shop-weapons-grid'];
    grid.innerHTML = '';
    weaponsConfig.forEach((w, idx) => {
        const isEquipped = idx === gameState.currentWeaponIndex;
        const card = document.createElement('div');
        card.className = `bg-stone-900/95 border ${isEquipped ? 'border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.2)]' : (w.owned ? 'border-emerald-700/70' : 'border-stone-800')} rounded-xl p-3.5 flex flex-col justify-between transition-all`;
        const dmgInfo = w.pellets > 1
            ? `${Math.round(w.damage * gameState.dmgMultiplier)}x${w.pellets} DMG`
            : `${Math.round(w.damage * gameState.dmgMultiplier)} DMG`;
        let actionButtonsHtml;
        if (!w.owned) {
            actionButtonsHtml = `
                <button data-akcja="kup-bron" data-indeks="${idx}" class="w-full py-2 bg-amber-500 hover:bg-amber-400 text-black font-extrabold rounded-lg text-xs transition flex justify-between px-3 items-center cursor-pointer shadow">
                    <span>🔓 KUP BROŃ</span>
                    <span class="font-teko text-2xl leading-none">$${w.price}</span>
                </button>`;
        } else {
            const equipBtn = isEquipped
                ? `<button class="flex-1 py-2 bg-emerald-950 border border-emerald-500 text-emerald-300 font-bold rounded-lg text-xs cursor-default">✓ W RĘKACH</button>`
                : `<button data-akcja="kup-bron" data-indeks="${idx}" class="flex-1 py-2 bg-stone-700 hover:bg-stone-600 text-white font-bold rounded-lg text-xs cursor-pointer">WEŹ DO RĘKI</button>`;
            const ammoBtn = w.reserve !== Infinity
                ? `<button data-akcja="kup-amunicje" data-indeks="${idx}" class="px-2.5 py-2 bg-amber-600 hover:bg-amber-500 text-black font-extrabold rounded-lg text-xs cursor-pointer" title="Dokup amunicję">+${w.ammoPack} Naboi ($${w.ammoPrice})</button>`
                : '';
            actionButtonsHtml = `<div class="flex gap-1.5">${equipBtn}${ammoBtn}</div>`;
        }
        card.innerHTML = `
            <div>
                <div class="flex justify-between items-start gap-1 mb-1">
                    <span class="text-white font-extrabold text-sm">[${w.slot}] ${w.name}</span>
                    <span class="bg-red-950 text-red-300 text-[10px] px-1.5 py-0.5 rounded font-bold shrink-0">${dmgInfo}</span>
                </div>
                <p class="text-stone-400 text-[11px] mb-2 leading-snug">${w.desc}</p>
                <div class="text-[10px] text-stone-300 mb-3 flex justify-between bg-stone-950/80 px-2 py-1 rounded">
                    <span>Magazynek: <b>${w.magSize}</b></span>
                    <span>Zapas: <b class="text-emerald-400">${w.reserve === Infinity ? '∞' : w.reserve}</b></span>
                </div>
            </div>
            ${actionButtonsHtml}`;
        grid.appendChild(card);
    });
}

export function showShopError(msg) {
    const el = els['shop-feedback'];
    el.textContent = msg;
    el.className = 'text-center h-6 text-sm font-bold text-red-400 my-1';
}

export function showShopSuccess(msg) {
    const el = els['shop-feedback'];
    el.textContent = msg;
    el.className = 'text-center h-6 text-sm font-bold text-emerald-400 my-1';
}

function flash(el, text, ms) {
    el.textContent = text;
    el.classList.remove('opacity-0');
    el.classList.add('opacity-100');
    clearTimeout(el.hideTimeout);
    el.hideTimeout = setTimeout(() => {
        el.classList.remove('opacity-100');
        el.classList.add('opacity-0');
    }, ms);
}

export function showHeadshotPopup(amount) {
    flash(els['headshot-popup'], `STRZAŁ W GŁOWĘ! +$${amount}`, 900);
}

export function showLootPopup(text) {
    flash(els['loot-popup'], text, 2400);
}

export function triggerHitMarker(isHead) {
    const color = isHead ? '#facc15' : '#ef4444';
    for (const el of [els['hm-1'], els['hm-2']]) {
        el.style.backgroundColor = color;
        el.style.opacity = '1';
    }
    clearTimeout(triggerHitMarker.t);
    triggerHitMarker.t = setTimeout(() => {
        els['hm-1'].style.opacity = '0';
        els['hm-2'].style.opacity = '0';
    }, 110);
}

export function updateCrosshairUI() {
    const offset = 8 + Math.round(gameState.crosshairSpread);
    setStyle(els.crosshair, 'opacity', gameState.aimProgress > 0.5 ? '0' : '1');
    setStyle(els['ch-top'], 'transform', `translateY(-${offset}px)`);
    setStyle(els['ch-bottom'], 'transform', `translateY(${offset}px)`);
    setStyle(els['ch-left'], 'transform', `translateX(-${offset}px)`);
    setStyle(els['ch-right'], 'transform', `translateX(${offset}px)`);
}

export function setLocation(houseName) {
    if (houseName) {
        setText(els['hud-location'], houseName);
        setClass(els['hud-location'], 'text-xs font-bold text-amber-300 uppercase tracking-wide');
    } else {
        setText(els['hud-location'], '🌲 Na zewnątrz (Osada)');
        setClass(els['hud-location'], 'text-xs font-bold text-emerald-400 uppercase tracking-wide');
    }
}

export function setInteractPrompt(visible) {
    els['interact-prompt'].classList.toggle('hidden', !visible);
}

export function setScopeVisible(visible) {
    els['sniper-scope'].classList.toggle('hidden', !visible);
}

export function setFps(fps) {
    if (els['fps-counter']) setText(els['fps-counter'], `${Math.round(fps)} kl/s`);
}
