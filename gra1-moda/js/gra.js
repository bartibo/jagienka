// Studio Mody – interfejs gry: garderoba, kolory, cofanie, galeria w localStorage, eksport PNG/JPG, wyzwania z jury i odznaki.
import { rysujPostac, DOMYSLNA, klon, napraw, kolory } from './postac.js';
import { KATEGORIE, KAT, GRUPY, PALETA, element, kadrElementu, S, W, T } from './katalog.js';
import { WZORY, Plotno } from './narzedzia.js';
import { STYLIZACJE, SZAFA, TEMATY, SEDZIOWIE, KOMENTARZE, ODZNAKI, ZESTAWY_KOLOROW } from './dane.js';

const $ = s => document.querySelector(s);
const losowy = t => t[Math.floor(Math.random() * t.length)];
const szansa = p => Math.random() < p;

/* ---------- pamięć przeglądarki (może jej nie być: tryb prywatny, blokada) ---------- */
const PRZEDROSTEK = 'gra1-moda:';
const pamiec = {
  czytaj(k, d) { try { const v = localStorage.getItem(PRZEDROSTEK + k); return v ? JSON.parse(v) : d; } catch { return d; } },
  zapisz(k, v) { try { localStorage.setItem(PRZEDROSTEK + k, JSON.stringify(v)); return true; } catch { return false; } },
};

/* ---------- stan ---------- */
let stan = napraw(pamiec.czytaj('biezaca', null));
let grupa = pamiec.czytaj('grupa', 'ubrania');
let kat = pamiec.czytaj('kat', 'suknia');
let slot = 0;
let aktualnyZapis = pamiec.czytaj('aktualny', null);
let wyzwanie = pamiec.czytaj('wyzwanie', null);
let dzwiek = pamiec.czytaj('dzwiek', true);
const historia = [], przyszlosc = [];
const postep = Object.assign({ zmiany: 0, przymierzone: [], losowania: 0, wyzwania: 0, gwiazdki: 0, odznaki: [], powitanie: false }, pamiec.czytaj('postep', {}));

// Tu kolor należy do osoby, nie do elementu: zmiana fryzury nie przefarbowuje włosów, zmiana oczu nie zmienia tęczówek.
const ZACHOWAJ = new Set(['oczy', 'brwi', 'rzesy', 'kreska', 'usta', 'fryzura', 'policzki']);

/* ---------- dźwięki (syntezator, bez plików) ---------- */
let ac;
function ton(f, dl = 0.08, typ = 'sine', g = 0.05, opozn = 0) {
  if (!dzwiek) return;
  try {
    ac ||= new (window.AudioContext || window.webkitAudioContext)();
    const o = ac.createOscillator(), v = ac.createGain(), t0 = ac.currentTime + opozn;
    o.type = typ; o.frequency.value = f;
    v.gain.setValueAtTime(g, t0); v.gain.exponentialRampToValueAtTime(0.0001, t0 + dl);
    o.connect(v).connect(ac.destination); o.start(t0); o.stop(t0 + dl + 0.03);
  } catch { /* bez dźwięku też się gra */ }
}
const graj = {
  klik: () => ton(900, 0.05, 'triangle', 0.035),
  wybor: () => { ton(660, 0.07, 'sine', 0.05); ton(990, 0.1, 'sine', 0.04, 0.05); },
  magia: () => [784, 988, 1175, 1568].forEach((f, i) => ton(f, 0.12, 'sine', 0.035, i * 0.05)),
  zapis: () => [523, 659, 784, 1046].forEach((f, i) => ton(f, 0.16, 'triangle', 0.05, i * 0.08)),
  straszny: () => { ton(220, 0.4, 'sawtooth', 0.025); ton(233, 0.4, 'sawtooth', 0.02, 0.05); ton(330, 0.5, 'triangle', 0.03, 0.2); },
  fanfara: () => [523, 659, 784, 659, 784, 1046].forEach((f, i) => ton(f, i === 5 ? 0.5 : 0.14, 'square', 0.03, i * 0.12)),
  gwiazdka: i => ton(880 + i * 120, 0.12, 'triangle', 0.04),
};

/* ---------- zmiany stanu z historią ---------- */
function zmien(f, { dzw = 'wybor', bezHistorii = false } = {}) {
  if (!bezHistorii) { historia.push(klon(stan)); if (historia.length > 80) historia.shift(); przyszlosc.length = 0; }
  f(stan);
  postep.zmiany++;
  odswiez();
  if (dzw) graj[dzw]?.();
}
function cofnij() { if (!historia.length) return; przyszlosc.push(klon(stan)); stan = historia.pop(); odswiez(); graj.klik(); }
function ponow() { if (!przyszlosc.length) return; historia.push(klon(stan)); stan = przyszlosc.pop(); odswiez(); graj.klik(); }

function wybierz(katId, id) {
  zmien(s => {
    const stary = s.w[katId];
    const el = element(katId, id);
    if (id === 'brak') s.w[katId] = { id: 'brak' };
    else if (ZACHOWAJ.has(katId) && stary?.k) s.w[katId] = { id, k: stary.k.slice(), wz: stary.wz };
    else s.w[katId] = { id, k: el?.k ? el.k.slice() : undefined, wz: el?.wz || 'gladki' };
    // Wybór góry albo dołu zdejmuje sukienkę – inaczej kliknięcie „nic by nie zmieniło”.
    if ((katId === 'gora' || katId === 'dol') && id !== 'brak' && s.w.suknia?.id !== 'brak') {
      s.w.suknia = { id: 'brak' };
      if (!s.w.gora || s.w.gora.id === 'brak') s.w.gora = { id: 'koszulka', k: ['#ffffff', '#ff8fc7'], wz: 'gladki' };
      if (!s.w.dol || s.w.dol.id === 'brak') s.w.dol = { id: 'mini', k: ['#8b5cf6', '#ffffff'], wz: 'gladki' };
    }
  });
  const klucz = `${katId}:${id}`;
  if (id !== 'brak' && !postep.przymierzone.includes(klucz)) postep.przymierzone.push(klucz);
  slot = 0;
  rysujPanel();
}

function ustawKolor(c) {
  const w = stan.w[kat];
  if (!w || w.id === 'brak') return;
  zmien(s => { const ww = s.w[kat]; ww.k = kolory(kat, ww).slice(); ww.k[slot] = c; }, { dzw: 'klik' });
  rysujPanel();
}
function ustawWzor(wz) {
  zmien(s => { s.w[kat].wz = wz; if (!s.w[kat].k) s.w[kat].k = kolory(kat, s.w[kat]).slice(); }, { dzw: 'klik' });
  rysujPanel();
}

/* ---------- scena ---------- */
function ustawTlo(el, id) {
  const t = S.TLA.find(x => x.id === id) || S.TLA[0];
  el.classList.toggle('szachownica', !t.obraz && !t.css);
  el.style.background = '';
  if (t.obraz) el.style.backgroundImage = `url(tla/${t.obraz}.jpg)`;
  else if (t.css) el.style.background = t.css;
  else el.style.backgroundImage = '';
}
function rysujScene() {
  $('#postac').innerHTML = rysujPostac(stan, { pref: 's', animacja: true });
  ustawTlo($('#tlo'), stan.w.tlo?.id);
  if (document.activeElement !== $('#imie')) $('#imie').value = stan.imie || '';
}

function odswiez() {
  rysujScene();
  pamiec.zapisz('biezaca', stan);
  pamiec.zapisz('postep', postep);
  document.querySelector('[data-akcja="cofnij"]').disabled = !historia.length;
  document.querySelector('[data-akcja="ponow"]').disabled = !przyszlosc.length;
  sprawdzOdznaki();
}

/* ---------- panel garderoby ---------- */
function rysujGrupy() {
  $('#grupy').innerHTML = GRUPY.map(g => `<button data-grupa="${g.id}" class="${g.id === grupa ? 'akt' : ''}"><b>${g.ikona}</b>${g.nazwa}</button>`).join('');
  const g = GRUPY.find(x => x.id === grupa);
  if (!g.kat.includes(kat)) kat = g.kat[0];
  $('#kategorie').innerHTML = g.kat.map(id => {
    const k = KAT[id], w = stan.w[id];
    const ma = k.brak && w && w.id !== 'brak';
    return `<button data-kat="${id}" class="${id === kat ? 'akt' : ''}">${k.ikona} ${k.nazwa}${ma ? '<span class="kropka"></span>' : ''}</button>`;
  }).join('');
}

let licznikMini = 0;
function miniatura(k, el) {
  const pref = 'm' + (licznikMini++) + '_';
  if (k.tlo) {
    if (el.obraz) return `<div class="mini obraz" style="background-image:url(tla/${el.obraz}.jpg)"></div>`;
    if (el.css) return `<div class="mini" style="background:${el.css}"></div>`;
    return `<div class="mini szach" style="background:repeating-conic-gradient(#f0e4f5 0 25%,#fff 0 50%) 0 0/16px 16px"></div>`;
  }
  if (el.id === 'brak') return `<div class="mini brak">✕</div>`;
  const t = klon(stan);
  const stary = stan.w[k.id];
  t.w[k.id] = ZACHOWAJ.has(k.id) && stary?.k ? { id: el.id, k: stary.k, wz: stary.wz } : (stary?.id === el.id ? stary : { id: el.id, k: el.k, wz: el.wz || 'gladki' });
  if (k.id === 'gora' || k.id === 'dol') t.w.suknia = { id: 'brak' };
  if (k.id === 'efekty') return `<div class="mini ciemne">${rysujPostac(t, { pref, tylkoKat: 'efekty', pelny: false, kadr: '60 60 480 480' })}</div>`;
  if (k.id === 'zwierzak') return `<div class="mini">${rysujPostac(t, { pref, tylkoKat: 'zwierzak', pelny: false, kadr: kadrElementu(k, el) })}</div>`;
  // Zakrywające rzeczy zdejmujemy z miniatur, żeby było widać to, co się wybiera.
  if (['naszyjnik', 'gora'].includes(k.id)) t.w.okrycie = { id: 'brak' };
  if (['oczy', 'rzesy', 'kreska', 'cienie', 'brwi'].includes(k.id)) { t.w.okulary = { id: 'brak' }; t.w.nakrycie = { id: 'brak' }; }
  if (k.id === 'kolczyki' || k.id === 'uszy') { t.w.nakrycie = { id: 'brak' }; t.w.fryzura = { ...t.w.fryzura, id: 'kok' }; }
  if (k.id === 'skrzydla' || k.id === 'ogon') { t.w.okrycie = { id: 'brak' }; }
  return `<div class="mini">${rysujPostac(t, { pref, pelny: false, kadr: kadrElementu(k, el) })}</div>`;
}

function rysujElementy() {
  const k = KAT[kat];
  const w = stan.w[kat] || { id: 'brak' };
  const lista = (k.brak ? [{ id: 'brak', nazwa: 'Bez' }] : []).concat(k.elementy);
  licznikMini = 0;
  $('#elementy').innerHTML = lista.map(el => {
    const halloween = el.tagi?.includes('halloween') ? '<span class="znaczek" title="Halloween">🎃</span>' : '';
    return `<button class="element${el.id === w.id ? ' akt' : ''}" data-el="${el.id}" title="${el.nazwa}">${miniatura(k, el)}${halloween}<span class="nazwa">${el.nazwa}</span></button>`;
  }).join('');
  const uwaga = k.uwaga && !(kat === 'dol' || kat === 'gora') ? k.uwaga : ((kat === 'gora' || kat === 'dol') && stan.w.suknia?.id !== 'brak' ? '👗 Teraz masz sukienkę – wybierz górę albo dół, a sukienka się zdejmie.' : k.uwaga && kat === 'grzywka' ? k.uwaga : '');
  $('#uwaga').hidden = !uwaga;
  $('#uwaga').textContent = uwaga;
}

function podgladWzoru(wz, k1, k2) {
  const p = new Plotno('wz' + wz + '_');
  const wyp = p.wzor(wz, k1, k2);
  return `<svg viewBox="0 0 80 40" preserveAspectRatio="xMidYMid slice"><defs>${p.defs.join('')}</defs><rect width="80" height="40" fill="${wyp}"/></svg>`;
}

function rysujKolory() {
  const k = KAT[kat], w = stan.w[kat];
  const box = $('#kolory');
  if (!w || w.id === 'brak' || !k.kolory.length) { box.innerHTML = ''; return; }
  const kol = kolory(kat, w);
  const ile = Math.min(k.kolory.length, kol.length);
  if (slot >= ile) slot = 0;
  let h = `<h3>🎨 Kolory</h3><div class="sloty">` +
    k.kolory.slice(0, ile).map((n, i) => `<button class="slot${i === slot ? ' akt' : ''}" data-slot="${i}"><i style="background:${kol[i]}"></i>${n}</button>`).join('') + '</div>';
  const paleta = kat === 'skora' ? T.SKORA.map(s => s.k[0]).concat(PALETA.slice(0, 10)) : (k.paleta || PALETA);
  h += `<div class="paleta">` + paleta.map(c => `<button data-kolor="${c}" style="background:${c}" class="${c === kol[slot] ? 'akt' : ''}" title="${c}"></button>`).join('') +
    `<label title="Własny kolor">🖌️<input type="color" id="wlasny" value="${kol[slot]}"></label></div>`;
  if (k.wzory) {
    const wz = w.wz || element(kat, w.id)?.wz || 'gladki';
    h += `<h3>🧵 Wzór <small style="font-weight:500;color:var(--szary)">(rysuje się drugim kolorem)</small></h3><div class="wzory">` +
      WZORY.map(x => `<button data-wzor="${x.id}" class="${x.id === wz ? 'akt' : ''}">${podgladWzoru(x.id, kol[0], kol[1] ?? kol[0])}<span>${x.nazwa}</span></button>`).join('') + '</div>';
  }
  box.innerHTML = h;
}

function rysujPanel() {
  rysujGrupy();
  rysujElementy();
  rysujKolory();
  pamiec.zapisz('grupa', grupa);
  pamiec.zapisz('kat', kat);
}

/* ---------- losowanie ---------- */
const HALLOWEEN_KOLORY = [['#1b1020', '#ff8a1f', '#7b2cbf'], ['#3b2a5a', '#5fd068', '#ff8a1f'], ['#5c0a1e', '#1b1020', '#ffd23f'], ['#2b1d3a', '#c77dff', '#ff8fc7'], ['#ff8a1f', '#1b1020', '#5fd068']];
const NATURALNE_WLOSY = W.KOLORY_WLOSOW.slice(0, 9);
const TECZOWKI = ['#5b8def', '#2ec4b6', '#5fd068', '#8b5a2b', '#3b2418', '#8b5cf6', '#c77dff', '#ff5d8f', '#4cc9f0', '#7a7a8a'];
const SZMINKI = ['#e8848f', '#ff5d8f', '#c1121f', '#ff8fb1', '#c13ad6', '#5c0a1e', '#ff7a3d'];

function losuj(halloween = false) {
  const zestaw = losowy(halloween ? HALLOWEEN_KOLORY : ZESTAWY_KOLOROW);
  const zElem = (katId, warunek = () => true) => {
    const wszystkie = KAT[katId].elementy.filter(warunek);
    const hal = wszystkie.filter(e => e.tagi?.includes('halloween'));
    return losowy(halloween && hal.length && szansa(0.85) ? hal : wszystkie);
  };
  const ubierz = (s, katId, el, kolor = true) => {
    const nowe = { id: el.id, k: el.k ? el.k.slice() : undefined, wz: el.wz || 'gladki' };
    if (kolor && nowe.k && !(halloween && szansa(0.6))) {
      const przes = Math.floor(Math.random() * 3);
      nowe.k = nowe.k.map((c, i) => zestaw[(i + przes) % 3]);
      if (szansa(0.22)) nowe.wz = losowy(WZORY.slice(1, 15)).id;
    }
    s.w[katId] = nowe;
  };
  const moze = (s, katId, p, warunek) => { if (szansa(p)) ubierz(s, katId, zElem(katId, warunek)); else s.w[katId] = { id: 'brak' }; };
  zmien(s => {
    // Fantastyczna skóra tylko czasem w Halloween; poza tym wraca ludzki odcień (inaczej „duszek” zostawał na zawsze).
    const ludzkie = T.SKORA.filter(x => !x.tagi.length);
    if (halloween && szansa(0.3)) { const sk = losowy(T.SKORA.filter(x => x.tagi.includes('halloween'))); s.w.skora = { id: sk.id, k: sk.k.slice() }; }
    else if (!ludzkie.some(x => x.id === s.w.skora?.id)) { const sk = losowy(ludzkie); s.w.skora = { id: sk.id, k: sk.k.slice() }; }
    s.w.oczy = { id: losowy(halloween ? ['duze', 'kocie', 'anime', 'swiecace', 'spirale', 'migdalowe'] : ['duze', 'anime', 'migdalowe', 'kocie', 'gwiazdki', 'serduszka', 'mrugniecie', 'senne']), k: [losowy(TECZOWKI)] };
    s.w.brwi = { id: losowy(['naturalne', 'luk', 'proste', 'cienkie', 'grube']), k: s.w.brwi?.k || ['#5a3726'] };
    s.w.usta = { id: losowy(halloween ? ['kly', 'usmieszek', 'koci', 'usmiech', 'szeroki', 'jezyk'] : ['usmiech', 'szeroki', 'buziak', 'jezyk', 'usmieszek', 'spokojna']), k: [halloween ? losowy(['#5c0a1e', '#1b1020', '#7b2cbf', '#c1121f']) : losowy(SZMINKI)] };
    s.w.policzki = { id: losowy(['rumience', 'rumience', 'piegi', 'oba', 'serduszka', 'brak']), k: ['#ff8fa8', '#b0705a'] };
    moze(s, 'cienie', 0.55, e => e.id !== 'brak');
    s.w.kreska = szansa(0.5) ? { id: losowy(['cienka', 'skrzydelko', 'kocia', 'graficzna']), k: ['#1b1020'] } : { id: 'brak' };
    s.w.rzesy = { id: losowy(['naturalne', 'dlugie', 'dramatyczne']), k: ['#2a1a2e'] };
    if (halloween) moze(s, 'malunki', 0.9, e => e.tagi?.includes('halloween'));
    else moze(s, 'malunki', 0.2, e => ['gwiazdki', 'serca', 'brokat'].includes(e.id));
    const f = losowy(W.FRYZURY), wlosy = szansa(0.6) ? losowy(NATURALNE_WLOSY) : losowy(W.KOLORY_WLOSOW);
    s.w.fryzura = { id: f.id, k: [wlosy, szansa(0.3) ? losowy(W.KOLORY_WLOSOW) : wlosy, zestaw[2]] };
    s.w.grzywka = { id: losowy(W.GRZYWKA).id };
    moze(s, 'nakrycie', halloween ? 0.9 : 0.5);
    if (szansa(halloween ? 0.6 : 0.4)) { ubierz(s, 'suknia', zElem('suknia')); s.w.gora = { id: 'brak' }; s.w.dol = { id: 'brak' }; }
    else { s.w.suknia = { id: 'brak' }; ubierz(s, 'gora', zElem('gora')); ubierz(s, 'dol', zElem('dol')); }
    moze(s, 'okrycie', halloween ? 0.4 : 0.25);
    moze(s, 'rajstopy', halloween ? 0.6 : 0.35);
    moze(s, 'buty', 0.95);
    moze(s, 'naszyjnik', 0.4); moze(s, 'kolczyki', 0.4); moze(s, 'okulary', 0.12);
    moze(s, 'rekawiczki', 0.15); moze(s, 'wreka', halloween ? 0.7 : 0.4);
    moze(s, 'skrzydla', halloween ? 0.35 : 0.15); moze(s, 'ogon', halloween ? 0.3 : 0.05);
    moze(s, 'zwierzak', halloween ? 0.6 : 0.35); moze(s, 'efekty', halloween ? 0.6 : 0.4);
    const tla = S.TLA.filter(t => t.obraz && (!halloween || t.tagi?.includes('halloween')));
    s.w.tlo = { id: losowy(tla).id };
  }, { dzw: halloween ? 'straszny' : 'magia' });
  postep.losowania++;
  rysujPanel();
}

function zastosujStylizacje(st) {
  zmien(s => {
    for (const k of SZAFA) s.w[k] = { id: 'brak' };
    s.w.cienie = { id: 'brak' }; s.w.kreska = { id: 'brak', k: ['#1b1020'] };
    for (const [k, v] of Object.entries(st.w)) {
      const el = element(k, v.id);
      s.w[k] = { id: v.id, k: v.k ? v.k.slice() : (el?.k ? el.k.slice() : s.w[k]?.k), wz: v.wz || el?.wz || 'gladki' };
    }
  }, { dzw: 'magia' });
  rysujPanel();
}

/* ---------- okna ---------- */
const okno = $('#okno');
function otworz(html, klasa = '') {
  $('#okno-tresc').innerHTML = `<button class="zamknij" data-zamknij aria-label="Zamknij">✕</button>` + html;
  okno.className = klasa;
  if (!okno.open) okno.showModal();
}
function zamknij() { if (okno.open) okno.close(); }
okno.addEventListener('click', e => { if (e.target === okno || e.target.closest('[data-zamknij]')) zamknij(); });

function dymek(t) {
  const d = $('#dymek');
  d.textContent = t; d.classList.add('widac');
  clearTimeout(dymek.t); dymek.t = setTimeout(() => d.classList.remove('widac'), 2600);
}

function pokazPomysly() {
  const karty = STYLIZACJE.map((st, i) => {
    const t = klon(stan);
    for (const k of SZAFA) t.w[k] = { id: 'brak' };
    for (const [k, v] of Object.entries(st.w)) { const el = element(k, v.id); t.w[k] = { id: v.id, k: v.k || el?.k, wz: v.wz || el?.wz }; }
    const tl = S.TLA.find(x => x.id === t.w.tlo?.id);
    const tloCss = tl?.obraz ? `background-image:url(tla/${tl.obraz}.jpg)` : (tl?.css ? `background:${tl.css}` : '');
    return `<button class="karta" data-styl="${i}"><div class="obr" style="${tloCss}">${rysujPostac(t, { pref: 'st' + i + '_' })}</div><div class="opis">${st.emoji} ${st.nazwa}</div></button>`;
  }).join('');
  otworz(`<h2>💡 Pomysły na postać</h2><p class="pod">Kliknij stylizację – twoja postać się przebierze, a potem możesz wszystko zmieniać po swojemu.</p><div class="karty">${karty}</div>`);
}

/* ---------- obrazki: SVG → płótno ---------- */
function zaladuj(src) {
  return new Promise((ok, zle) => { const i = new Image(); i.onload = () => ok(i); i.onerror = zle; i.src = src; });
}
async function rysujTloNaPlotnie(g, szer, wys, id) {
  const t = S.TLA.find(x => x.id === id) || S.TLA[0];
  if (t.obraz) {
    const img = await zaladuj(`tla/${t.obraz}.jpg`);
    const sk = Math.max(szer / img.width, wys / img.height);
    g.drawImage(img, (szer - img.width * sk) / 2, (wys - img.height * sk) / 2, img.width * sk, img.height * sk);
  } else {
    const [a, b] = t.kolory || ['#fdf6ff', '#efe4f6'];
    const gr = g.createLinearGradient(0, 0, 0, wys);
    gr.addColorStop(0, a); gr.addColorStop(1, b);
    g.fillStyle = gr; g.fillRect(0, 0, szer, wys);
  }
}
async function obrazPostaci(s, szer, wys, { zTlem = false, podpis = false } = {}) {
  const svg = rysujPostac(s, { pref: 'e', szer, wys });
  const img = await zaladuj('data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg));
  const c = document.createElement('canvas');
  c.width = szer; c.height = wys;
  const g = c.getContext('2d');
  if (zTlem) await rysujTloNaPlotnie(g, szer, wys, s.w.tlo?.id);
  g.drawImage(img, 0, 0, szer, wys);
  if (podpis && s.imie) {
    try { await document.fonts.load(`800 ${Math.round(wys / 22)}px "Baloo 2"`); } catch { /* zwykła czcionka też wystarczy */ }
    const r = Math.round(wys / 22);
    g.font = `800 ${r}px "Baloo 2", system-ui, sans-serif`;
    const tekst = '✨ ' + s.imie + ' ✨', sz = g.measureText(tekst).width + r * 1.4, h = r * 1.6, x = (szer - sz) / 2, y = wys - h - r * 0.6;
    g.fillStyle = '#ffffffe6'; g.beginPath(); g.roundRect(x, y, sz, h, h / 2); g.fill();
    g.fillStyle = '#c13ad6'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(tekst, szer / 2, y + h / 2 + r * 0.08);
  }
  return c;
}
function pobierz(c, typ, nazwa) {
  c.toBlob(b => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(b); a.download = nazwa;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  }, typ, 0.92);
}
const nazwaPliku = (s, roz) => ((s.imie || 'moja-postac').trim().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '') || 'postac') + '.' + roz;

async function eksport(typ) {
  try {
    if (typ === 'png') pobierz(await obrazPostaci(stan, 1200, 1600), 'image/png', nazwaPliku(stan, 'png'));
    else pobierz(await obrazPostaci(stan, 1200, 1600, { zTlem: true, podpis: true }), 'image/jpeg', nazwaPliku(stan, 'jpg'));
    postep.fotograf = true; graj.zapis();
    dymek(typ === 'png' ? '📸 Pobrano PNG z przezroczystym tłem!' : '📸 Pobrano JPG z tłem!');
    sprawdzOdznaki();
  } catch (e) {
    console.error(e);
    dymek('Ups, nie udało się zrobić obrazka 😿');
  }
}

/* ---------- galeria ---------- */
const galeria = () => pamiec.czytaj('galeria', []);
async function miniaturaZapisu(s) {
  const c = await obrazPostaci(s, 240, 320, { zTlem: true });
  return c.toDataURL('image/jpeg', 0.8);
}
async function zapiszPostac(jakoNowa) {
  const lista = galeria();
  const mini = await miniaturaZapisu(stan);
  const wpis = { id: jakoNowa || !aktualnyZapis ? 'p' + Date.now().toString(36) : aktualnyZapis, imie: stan.imie || 'Bez imienia', data: Date.now(), stan: klon(stan), mini };
  const i = lista.findIndex(x => x.id === wpis.id);
  if (i >= 0) lista[i] = wpis; else lista.unshift(wpis);
  if (!pamiec.zapisz('galeria', lista)) { dymek('Brak miejsca w pamięci przeglądarki – usuń coś z galerii 🙈'); return; }
  aktualnyZapis = wpis.id; pamiec.zapisz('aktualny', aktualnyZapis);
  postep.zapisane = lista.length;
  zamknij(); graj.zapis(); dymek(`💾 Zapisano „${wpis.imie}”!`); konfetti(60);
  sprawdzOdznaki();
}
function oknoZapisu() {
  const istnieje = aktualnyZapis && galeria().some(x => x.id === aktualnyZapis);
  otworz(`<h2>💾 Zapisz postać</h2><p class="pod">Postać trafi do Galerii w tej przeglądarce – możesz do niej wrócić kiedy chcesz.</p>
    <input class="pole" id="zapis-imie" maxlength="24" placeholder="Jak ma na imię?" value="${(stan.imie || '').replace(/"/g, '&quot;')}">
    <div class="rzad">${istnieje ? '<button class="przycisk" data-zapisz="nowa"><b>➕</b>Zapisz jako nową</button><button class="przycisk mocny" data-zapisz="tak"><b>💾</b>Zapisz zmiany</button>' : '<button class="przycisk mocny" data-zapisz="nowa"><b>💾</b>Zapisz</button>'}</div>`);
  const pole = $('#zapis-imie');
  pole.focus(); pole.select();
  pole.addEventListener('keydown', e => { if (e.key === 'Enter') document.querySelector('[data-zapisz="tak"],[data-zapisz="nowa"]:last-child')?.click(); });
}
function pokazGalerie() {
  const lista = galeria();
  const karty = lista.map(p => `<div class="karta"><button class="obr" data-wczytaj="${p.id}" style="border:0;padding:0;width:100%;display:block;cursor:pointer"><img src="${p.mini}" alt=""></button>
      <div class="opis">${p.imie.replace(/</g, '&lt;')}<small>${new Date(p.data).toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' })}</small></div>
      <div class="male"><button data-wczytaj="${p.id}">Otwórz</button><button data-kopia="${p.id}">Kopia</button><button class="usun" data-usun="${p.id}">Usuń</button></div></div>`).join('');
  otworz(`<h2>🖼️ Moje postacie <span class="licznik">${lista.length || ''}</span></h2><p class="pod">Zapisane w tej przeglądarce. Kliknij, żeby dalej ubierać.</p>` +
    (lista.length ? `<div class="karty">${karty}</div>` : `<div class="pusto">Jeszcze nic tu nie ma.<br>Ubierz postać i kliknij <b>💾 Zapisz</b>!</div>`) +
    `<div class="rzad"><button class="przycisk" data-akcja="nowa"><b>✨</b>Nowa postać od zera</button></div>`);
}
function wczytaj(id, kopia = false) {
  const p = galeria().find(x => x.id === id);
  if (!p) return;
  zmien(s => { const n = napraw(p.stan); s.imie = kopia ? n.imie + ' 2' : n.imie; s.w = n.w; }, { dzw: 'magia' });
  aktualnyZapis = kopia ? null : id; pamiec.zapisz('aktualny', aktualnyZapis);
  zamknij(); rysujPanel(); dymek(kopia ? '📋 Kopia gotowa – zapisz ją, gdy skończysz' : `👋 Witaj z powrotem, ${p.imie}!`);
}
function usun(id) {
  const p = galeria().find(x => x.id === id);
  if (!p || !confirm(`Usunąć „${p.imie}” z galerii?`)) return;
  pamiec.zapisz('galeria', galeria().filter(x => x.id !== id));
  if (aktualnyZapis === id) { aktualnyZapis = null; pamiec.zapisz('aktualny', null); }
  pokazGalerie();
}

/* ---------- wyzwania i jury ---------- */
const WAGI = { suknia: 4, gora: 2, dol: 2, okrycie: 2, nakrycie: 3, buty: 1, rajstopy: 1, wreka: 2, skrzydla: 2, ogon: 2, malunki: 2, zwierzak: 2, naszyjnik: 1, kolczyki: 1, okulary: 1, rekawiczki: 1, efekty: 1, cienie: 1, kreska: 1, usta: 1, oczy: 1, skora: 1, fryzura: 1, tlo: 3, uszy: 1 };
function punktyTematu(s, temat) {
  let pkt = 0;
  const jestSuknia = s.w.suknia?.id !== 'brak';
  for (const [k, waga] of Object.entries(WAGI)) {
    const w = s.w[k];
    if (!w || w.id === 'brak' || (jestSuknia && (k === 'gora' || k === 'dol'))) continue;
    const tagi = element(k, w.id)?.tagi || [];
    if (tagi.some(t => temat.tagi.includes(t))) pkt += waga;
  }
  return pkt;
}
function ocena(s, temat) {
  const pkt = punktyTematu(s, temat);
  const ubrane = KATEGORIE.filter(k => k.brak && s.w[k.id] && s.w[k.id].id !== 'brak');
  const barwy = new Set(), wzory = new Set();
  for (const k of ubrane) { if (['efekty', 'tlo'].includes(k.id)) continue; kolory(k.id, s.w[k.id]).slice(0, 2).forEach(c => barwy.add(c)); if (s.w[k.id].wz && s.w[k.id].wz !== 'gladki') wzory.add(s.w[k.id].wz); }
  const dodatki = ['naszyjnik', 'kolczyki', 'okulary', 'rekawiczki', 'wreka', 'nakrycie', 'skrzydla', 'ogon', 'zwierzak'].filter(k => s.w[k] && s.w[k].id !== 'brak').length;
  const makijaz = ['cienie', 'kreska', 'malunki'].filter(k => s.w[k] && s.w[k].id !== 'brak').length;
  const ogr = v => Math.max(1, Math.min(5, Math.round(v)));
  return {
    mruczka: ogr(1 + pkt / 3.2),
    bubu: ogr(1.6 + (barwy.size >= 4) + (barwy.size >= 7) + Math.min(1.4, wzory.size * 0.8) + (s.w.efekty?.id !== 'brak' ? 0.6 : 0) + (S.TLA.find(t => t.id === s.w.tlo?.id)?.obraz ? 0.4 : 0)),
    dynia: ogr(1.2 + dodatki * 0.6 + makijaz * 0.6),
  };
}
function najlepszyTemat(s) {
  return TEMATY.map(t => [t, punktyTematu(s, t)]).sort((a, b) => b[1] - a[1])[0][0];
}

function pokazWyzwanie(temat) {
  temat ||= losowy(szansa(0.55) ? TEMATY.filter(t => t.halloween) : TEMATY);
  otworz(`<h2>🏆 Wyzwanie</h2><p class="pod">Ubierz postać w temacie, a potem pokaż ją jury: Kotce Mruczce, Duszkowi Bubu i Pani Dyni!</p>
    <div class="temat"><div class="e">${temat.emoji}</div><h3>${temat.nazwa}</h3><p>${temat.opis}</p></div>
    <div class="rzad"><button class="przycisk" data-temat-inny="1"><b>🔄</b>Inny temat</button><button class="przycisk zloty" data-temat-start="${temat.id}"><b>✨</b>Zaczynam!</button></div>`);
}
function rysujPasekWyzwania() {
  const p = $('#wyzwanie-pasek');
  const t = TEMATY.find(x => x.id === wyzwanie);
  p.hidden = !t;
  if (t) p.innerHTML = `<span class="e">${t.emoji}</span><span class="t">Wyzwanie: ${t.nazwa}<small>${t.opis}</small></span><button data-akcja="jury">⭐ Jury!</button><button class="x" data-akcja="koniec-wyzwania" title="Zakończ wyzwanie">✕</button>`;
}

function pokazJury() {
  const temat = TEMATY.find(x => x.id === wyzwanie) || najlepszyTemat(stan);
  const o = ocena(stan, temat);
  const suma = o.mruczka + o.bubu + o.dynia;
  $('#scena').classList.remove('pokaz'); void $('#scena').offsetWidth; $('#scena').classList.add('pokaz');
  graj.fanfara();
  const gw = n => '<b>★</b>'.repeat(n) + '★'.repeat(5 - n);
  const sedziowie = SEDZIOWIE.map((sd, i) => `<div class="sedzia" style="animation-delay:${0.3 + i * 0.5}s"><div class="e">${sd.emoji}</div><h4>${sd.imie}</h4><small>ocenia: ${sd.co}</small><div class="gw">${gw(o[sd.id])}</div><p>„${KOMENTARZE[sd.id][o[sd.id] - 1]}”</p></div>`).join('');
  const werdykt = suma >= 14 ? 'Mistrzostwo świata! 👑' : suma >= 12 ? 'Rewelacja! 🌟' : suma >= 9 ? 'Super stylizacja! 💖' : suma >= 6 ? 'Dobry początek! 🙂' : 'Spróbuj dodać więcej z tematu! 💪';
  const opisTematu = wyzwanie ? `Temat: <b>${temat.emoji} ${temat.nazwa}</b>` : `Jury uznało, że to stylizacja w stylu: <b>${temat.emoji} ${temat.nazwa}</b>`;
  otworz(`<h2>⭐ Pokaz przed jury</h2><p class="pod">${opisTematu}</p><div class="jury">${sedziowie}</div>
    <div class="suma">${werdykt}<br><span class="duza">${suma}</span> / 15 gwiazdek</div>
    <div class="rzad"><button class="przycisk" data-akcja="zapisz"><b>💾</b>Zapisz postać</button><button class="przycisk zloty" data-akcja="wyzwanie"><b>🏆</b>Nowe wyzwanie</button></div>`);
  [0, 1, 2].forEach(i => setTimeout(() => { for (let j = 0; j < o[SEDZIOWIE[i].id]; j++) setTimeout(() => graj.gwiazdka(j), j * 70); }, 600 + i * 500));
  setTimeout(() => { if (suma >= 11) konfetti(suma >= 14 ? 220 : 120); }, 2000);
  postep.jury = true;
  postep.gwiazdki = Math.max(postep.gwiazdki, suma);
  if (wyzwanie) {
    postep.wyzwania++;
    if (temat.halloween && suma >= 13) postep.halloween = true;
  }
  pamiec.zapisz('postep', postep);
  setTimeout(sprawdzOdznaki, 2300);
}

/* ---------- odznaki ---------- */
function zdobyte(s) {
  const w = s.w, jest = k => w[k] && w[k].id !== 'brak';
  const barwy = new Set(), wzory = new Set();
  for (const k of KATEGORIE) if (k.brak && jest(k.id) && !['efekty'].includes(k.id)) { kolory(k.id, w[k.id]).forEach(c => barwy.add(c)); if (w[k.id].wz && w[k.id].wz !== 'gladki') wzory.add(w[k.id].wz); }
  return {
    start: postep.zmiany >= 10,
    szafa: postep.przymierzone.length >= 60,
    kolekcja: galeria().length >= 3,
    fotograf: !!postep.fotograf,
    tecza: barwy.size >= 10,
    wzory: wzory.size >= 4,
    wizazystka: jest('cienie') && jest('kreska') && jest('malunki'),
    czarownica: w.nakrycie?.id === 'czarownicy' && w.wreka?.id === 'miotla',
    wampir: w.usta?.id === 'kly' && w.okrycie?.id === 'wampirza',
    kocia: w.nakrycie?.id === 'kocieUszy' && w.zwierzak?.id === 'kot',
    losowanie: postep.losowania >= 10,
    jury: !!postep.jury,
    gwiazda: postep.gwiazdki >= 15,
    halloween: !!postep.halloween,
    mistrzyni: postep.wyzwania >= 5,
  };
}
function sprawdzOdznaki() {
  const z = zdobyte(stan);
  const nowe = ODZNAKI.filter(o => z[o.id] && !postep.odznaki.includes(o.id));
  if (!nowe.length) return;
  postep.odznaki.push(...nowe.map(o => o.id));
  pamiec.zapisz('postep', postep);
  nowe.forEach((o, i) => setTimeout(() => { dymek(`🎖️ Nowa odznaka: ${o.emoji} ${o.nazwa}!`); konfetti(90); graj.zapis(); }, i * 2800));
}
function pokazOdznaki() {
  const karty = ODZNAKI.map(o => {
    const ma = postep.odznaki.includes(o.id);
    return `<div class="odznaka ${ma ? 'jest' : 'brak'}"><div class="e">${o.emoji}</div><h4>${o.nazwa}</h4><small>${o.opis}</small></div>`;
  }).join('');
  otworz(`<h2>🎖️ Odznaki <span class="licznik">${postep.odznaki.length} / ${ODZNAKI.length}</span></h2><p class="pod">Przymierzyłaś już <b>${postep.przymierzone.length}</b> rzeczy. Zbieraj odznaki, tworząc postacie i wygrywając wyzwania!</p><div class="odznaki">${karty}</div>`);
}

/* ---------- konfetti ---------- */
function konfetti(ile = 120) {
  const c = $('#konfetti'), g = c.getContext('2d');
  c.width = innerWidth; c.height = innerHeight;
  const kol = ['#ff4fa3', '#ffc93c', '#8b5cf6', '#4cc9f0', '#5fd068', '#ff8a1f'];
  const cz = Array.from({ length: ile }, () => ({ x: Math.random() * c.width, y: -20 - Math.random() * c.height * 0.4, vx: (Math.random() - 0.5) * 4, vy: 2 + Math.random() * 4, r: Math.random() * 6.28, vr: (Math.random() - 0.5) * 0.3, k: losowy(kol), s: 6 + Math.random() * 6 }));
  const start = performance.now();
  cancelAnimationFrame(konfetti.raf);
  const krok = t => {
    g.clearRect(0, 0, c.width, c.height);
    for (const p of cz) { p.x += p.vx; p.y += p.vy; p.vy += 0.05; p.r += p.vr; g.save(); g.translate(p.x, p.y); g.rotate(p.r); g.fillStyle = p.k; g.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); g.restore(); }
    if (t - start < 3200) konfetti.raf = requestAnimationFrame(krok); else g.clearRect(0, 0, c.width, c.height);
  };
  konfetti.raf = requestAnimationFrame(krok);
}

/* ---------- powitanie ---------- */
function powitanie() {
  otworz(`<div class="temat"><div class="e">👗</div><h3>Witaj w Studiu Mody!</h3><p>Stwórz własną postać: wybierz buzię, fryzurę, makijaż i stroje.<br>Zapisuj ją w Galerii, pobieraj jako obrazek i zdobywaj odznaki w wyzwaniach!</p></div>
    <div class="rzad" style="justify-content:center"><button class="przycisk dyniowy" data-akcja="halloween"><b>🎃</b>Przebranie na Halloween</button><button class="przycisk mocny" data-akcja="pomysly"><b>💡</b>Gotowe pomysły</button><button class="przycisk" data-zamknij><b>✨</b>Zaczynam od zera</button></div>`);
  postep.powitanie = true; pamiec.zapisz('postep', postep);
}

/* ---------- zdarzenia ---------- */
const AKCJE = {
  pomysly: pokazPomysly,
  losuj: () => { zamknij(); losuj(false); },
  halloween: () => { zamknij(); losuj(true); },
  cofnij, ponow,
  dzwiek: () => { dzwiek = !dzwiek; pamiec.zapisz('dzwiek', dzwiek); $('#ikona-dzwieku').textContent = dzwiek ? '🔊' : '🔇'; graj.klik(); },
  zapisz: oknoZapisu,
  galeria: pokazGalerie,
  png: () => eksport('png'),
  jpg: () => eksport('jpg'),
  wyzwanie: () => pokazWyzwanie(),
  jury: pokazJury,
  odznaki: pokazOdznaki,
  'koniec-wyzwania': () => { wyzwanie = null; pamiec.zapisz('wyzwanie', null); rysujPasekWyzwania(); },
  nowa: () => {
    zamknij();
    zmien(s => { const n = klon(DOMYSLNA); s.imie = ''; s.w = n.w; }, { dzw: 'magia' });
    aktualnyZapis = null; pamiec.zapisz('aktualny', null); rysujPanel();
  },
};
document.addEventListener('click', e => {
  const a = e.target.closest('[data-akcja]');
  if (a) { AKCJE[a.dataset.akcja]?.(); return; }
  const g = e.target.closest('[data-grupa]');
  if (g) { grupa = g.dataset.grupa; kat = GRUPY.find(x => x.id === grupa).kat[0]; slot = 0; rysujPanel(); $('#przewijane').scrollTop = 0; graj.klik(); return; }
  const k = e.target.closest('[data-kat]');
  if (k) { kat = k.dataset.kat; slot = 0; rysujPanel(); $('#przewijane').scrollTop = 0; graj.klik(); return; }
  const el = e.target.closest('[data-el]');
  if (el) { wybierz(kat, el.dataset.el); return; }
  const sl = e.target.closest('[data-slot]');
  if (sl) { slot = +sl.dataset.slot; rysujKolory(); graj.klik(); return; }
  const kol = e.target.closest('[data-kolor]');
  if (kol) { ustawKolor(kol.dataset.kolor); return; }
  const wz = e.target.closest('[data-wzor]');
  if (wz) { ustawWzor(wz.dataset.wzor); return; }
  const st = e.target.closest('[data-styl]');
  if (st) { zastosujStylizacje(STYLIZACJE[+st.dataset.styl]); zamknij(); return; }
  const zp = e.target.closest('[data-zapisz]');
  if (zp) { stan.imie = ($('#zapis-imie')?.value || '').trim(); zapiszPostac(zp.dataset.zapisz === 'nowa'); return; }
  const wc = e.target.closest('[data-wczytaj]');
  if (wc) { wczytaj(wc.dataset.wczytaj); return; }
  const kp = e.target.closest('[data-kopia]');
  if (kp) { wczytaj(kp.dataset.kopia, true); return; }
  const us = e.target.closest('[data-usun]');
  if (us) { usun(us.dataset.usun); return; }
  if (e.target.closest('[data-temat-inny]')) { pokazWyzwanie(); graj.klik(); return; }
  const ts = e.target.closest('[data-temat-start]');
  if (ts) { wyzwanie = ts.dataset.tematStart; pamiec.zapisz('wyzwanie', wyzwanie); rysujPasekWyzwania(); zamknij(); graj.magia(); dymek('Do dzieła! Kiedy skończysz – kliknij ⭐ Jury!'); }
});
// Własny kolor: podgląd na żywo bez zaśmiecania historii, jeden wpis po puszczeniu suwaka.
document.addEventListener('input', e => {
  if (e.target.id === 'wlasny') {
    const w = stan.w[kat];
    if (!e.target.dataset.zaczete) { historia.push(klon(stan)); przyszlosc.length = 0; e.target.dataset.zaczete = '1'; }
    w.k = kolory(kat, w).slice(); w.k[slot] = e.target.value;
    rysujScene();
  }
  if (e.target.id === 'imie') { stan.imie = e.target.value; pamiec.zapisz('biezaca', stan); }
});
document.addEventListener('change', e => { if (e.target.id === 'wlasny') { delete e.target.dataset.zaczete; odswiez(); rysujPanel(); } });
document.addEventListener('keydown', e => {
  if (e.target.matches('input')) return;
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') { e.preventDefault(); e.shiftKey ? ponow() : cofnij(); }
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') { e.preventDefault(); ponow(); }
});

/* ---------- start ---------- */
$('#ikona-dzwieku').textContent = dzwiek ? '🔊' : '🔇';
rysujPasekWyzwania();
rysujPanel();
odswiez();
if (!postep.powitanie) powitanie();
// do testów i zrzutów ekranu
window.studio = { get stan() { return stan; }, losuj, zastosujStylizacje, STYLIZACJE, wybierz, pokazJury, pokazGalerie, pokazPomysly, obrazPostaci, ustawKat: (g, k) => { grupa = g; kat = k; rysujPanel(); } };
