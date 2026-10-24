// Twarz i makijaż. Oczy rysujemy w układzie lokalnym lewego oka (kącik zewnętrzny po stronie ujemnego x),
// prawe to odbicie – dzięki temu kreska, rzęsy i cienie zawsze idą „na zewnątrz”, jak w prawdziwym makijażu.
import { mieszaj, jasniej, ciemniej, gwiazda, serce, blysk, nietoperz, dynia, losowe, obie, sniezynkaD } from './narzedzia.js';
import { TWARZE, obrysSkory } from './cialo.js';

export const OCZY_X = 28, OCZY_Y = 181;
const skoraZ = stan => stan.w.skora?.k?.[0] || '#ffdcc4';
const ksztaltZ = stan => stan.w.ksztalt?.id || 'okragla';

// Para oczu: f(lokalne, strona) → rysunek; strona 1 = lewe oko na ekranie, -1 = prawe.
const para = (f, cy = OCZY_Y) =>
  `<g transform="translate(${300 - OCZY_X} ${cy})">${f(1)}</g><g transform="translate(${300 + OCZY_X} ${cy}) scale(-1 1)">${f(-1)}</g>`;

/* ---------- skóra, kształt głowy, uszy ---------- */
const ton = (id, nazwa, kolor, tagi = []) => ({ id, nazwa, k: [kolor], tagi });
export const SKORA = [
  ton('porcelana', 'Porcelanowa', '#ffe9dc'),
  ton('jasna', 'Jasna', '#ffdcc4'),
  ton('brzoskwinia', 'Brzoskwiniowa', '#f6c39c'),
  ton('miod', 'Miodowa', '#e2a578'),
  ton('karmel', 'Karmelowa', '#c58556'),
  ton('kakao', 'Kakaowa', '#9a5f3c'),
  ton('czekolada', 'Czekoladowa', '#6e3f26'),
  ton('wampir', 'Wampirza', '#eee4f4', ['halloween', 'wampir']),
  ton('zombie', 'Zombie', '#a9d39a', ['halloween', 'zombie']),
  ton('kosmitka', 'Kosmiczna', '#9fd3f0', ['kosmos']),
  ton('wrozka', 'Wróżkowa', '#e6cbff', ['wrozka']),
  ton('diablica', 'Diabełkowa', '#f59a96', ['halloween', 'diabel']),
  ton('duch', 'Duszkowa', '#f4f7ff', ['halloween', 'duch']),
  ton('syrena', 'Syrenia', '#bdf0e0', ['syrena']),
  ton('lodowa', 'Lodowa', '#e2f3ff', ['zima', 'lod', 'krolowa']),
];

export const KSZTALT = [
  { id: 'okragla', nazwa: 'Okrągła' },
  { id: 'owalna', nazwa: 'Owalna' },
  { id: 'serduszko', nazwa: 'Serduszko' },
  { id: 'pyzata', nazwa: 'Pyzata' },
];
export const USZY = [
  { id: 'ludzkie', nazwa: 'Zwykłe' },
  { id: 'male', nazwa: 'Małe' },
  { id: 'elfie', nazwa: 'Elfie', tagi: ['wrozka', 'wampir'] },
];

/* ---------- oczy ---------- */
// Rzęsa jako zwężający się łuk: szeroka u powieki, cienka na czubku – wygląda jak prawdziwa, a nie jak kreska.
const rzesa = (x, y, kx, ky, tx, ty, g = 1.7) => `M${x - g} ${y}Q${kx} ${ky} ${tx} ${ty}Q${kx + g * 0.9} ${ky + g * 0.9} ${x + g} ${y + 0.6}Z`;
const RZESY_D = {
  naturalne: [[-20, -4, -25, -4, -28, -10, 1.8], [-18, -12, -23, -14, -26, -22, 1.7], [-13, -19, -17, -24, -18, -30, 1.6]],
  dlugie: [[-20, -3, -27, -3, -32, -10, 1.9], [-19, -11, -26, -13, -30, -23, 1.8], [-14, -18, -20, -24, -22, -34, 1.7], [-7, -23, -10, -30, -9, -36, 1.5]],
  dramatyczne: [[-20, -2, -29, -1, -35, -8, 2.2], [-20, -9, -29, -10, -34, -20, 2.1], [-17, -15, -25, -20, -28, -32, 2], [-12, -20, -17, -28, -18, -39, 1.9], [-6, -24, -8, -32, -6, -40, 1.7], [0, -26, 0, -32, 3, -37, 1.4]],
};
RZESY_D.kolorowe = RZESY_D.dlugie;
RZESY_D.szronione = RZESY_D.dlugie;
function rzesyRysuj(rodzaj, kolor) {
  const lista = RZESY_D[rodzaj];
  if (!lista) return '';
  let s = `<path d="${lista.map(r => rzesa(...r)).join('')}" fill="${kolor}"/>`;
  if (rodzaj === 'dramatyczne') s += `<path d="${rzesa(-12, 12, -15, 15, -17, 20, 1.1)}${rzesa(-6, 15, -7, 18, -8, 23, 1.1)}${rzesa(0, 16, 0, 19, -0.5, 23, 1)}" fill="${kolor}"/>`;
  if (rodzaj === 'szronione') s += lista.map(r => `<path d="${blysk(r[4], r[5], 2.8)}" fill="#fff"/>`).join('') + `<circle cx="-20" cy="-27" r="1.2" fill="#dff3ff"/>`;
  return s;
}
// Kreska rysowana pod kształt powieki z oka „Duże”; inne oczy dopasowują ją przekształceniem (dop).
function kreskaRysuj(rodzaj, kolor) {
  const gruba = `<path d="M-22 1C-21 -20 -7 -29 2 -28C13 -27 20 -18 18 -3C15 -14 9 -20 1 -20C-9 -20 -16 -12 -17 2Z" fill="${kolor}"/>`;
  switch (rodzaj) {
    case 'cienka': return gruba;
    case 'skrzydelko': return gruba + `<path d="M-21 3L-33 -12L-19 -12Z" fill="${kolor}" stroke="${kolor}" stroke-width="1.5" stroke-linejoin="round"/>`;
    case 'kocia': return gruba + `<path d="M-21 4L-38 -15L-18 -14Z" fill="${kolor}" stroke="${kolor}" stroke-width="2" stroke-linejoin="round"/>` +
      `<path d="M-19 5Q-4 19 12 13" fill="none" stroke="${kolor}" stroke-width="2.4" stroke-linecap="round"/>`;
    case 'graficzna': return gruba + `<path d="M-21 3L-33 -12L-19 -12Z" fill="${kolor}"/>` +
      `<path d="M-17 -34Q0 -44 17 -31" fill="none" stroke="${kolor}" stroke-width="2.6" stroke-linecap="round"/><circle cx="-27" cy="-25" r="2.4" fill="${kolor}"/>`;
    case 'kropeczki': return gruba + [[-26, -12, 2.6], [-29, -19, 2.1], [-29, -26, 1.7], [-26, -32, 1.3]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${kolor}"/>`).join('');
    case 'brokatowa': return gruba.replace(`fill="${kolor}"`, `fill="${kolor}" opacity=".9"`) + `<path d="${blysk(-23, -10, 4.5)}${blysk(-14, -30, 3)}${blysk(8, -31, 2.4)}" fill="#fff"/><circle cx="-4" cy="-29" r="1.2" fill="#fff"/>`;
    default: return '';
  }
}

export const OCZY = [
  { id: 'duze', nazwa: 'Duże' },
  { id: 'blyszczace', nazwa: 'Błyszczące', tagi: ['gala', 'gwiazda', 'slodka'] },
  { id: 'anime', nazwa: 'Anime' },
  { id: 'lalka', nazwa: 'Laleczka', tagi: ['slodka', 'ksiezniczka'] },
  { id: 'migdalowe', nazwa: 'Migdałowe' },
  { id: 'kocie', nazwa: 'Kocie', tagi: ['kot', 'halloween'] },
  { id: 'senne', nazwa: 'Senne', tagi: ['pizama'] },
  { id: 'lodowe', nazwa: 'Lodowe', tagi: ['zima', 'lod', 'krolowa'] },
  { id: 'gwiazdki', nazwa: 'Gwiazdki', tagi: ['gwiazda', 'kosmos', 'swieta'] },
  { id: 'serduszka', nazwa: 'Zakochane', tagi: ['slodka'] },
  { id: 'mrugniecie', nazwa: 'Oczko' },
  { id: 'zamkniete', nazwa: 'Uśmiechnięte' },
  { id: 'swiecace', nazwa: 'Świecące', tagi: ['halloween', 'duch'] },
  { id: 'spirale', nazwa: 'Hipnoza', tagi: ['halloween', 'zombie'] },
].map(o => ({ ...o, k: ['#5b8def'] }));

// Kształty oka: białko, wypełniona powieka (gruba na zewnątrz, cienka przy nosie) i dopasowanie rzęs i kreski.
const OKO = {
  duze: {
    bialko: 'M-17 2C-18 -15 -8 -23 1 -23C11 -23 18 -15 17 -2C16 10 9 17 0 17C-10 17 -17 11 -17 2Z',
    powieka: 'M-19 2L-25 -4L-19.5 -6C-17 -19 -6 -26 2 -25.5C12 -25 19 -17 18 -3C15 -15 9 -21.5 1 -21.5C-9 -21.5 -16 -13 -17 2Z',
    zalamanie: 'M-15 -29C-7 -36 9 -35 16 -25', dol: 'M-13 12Q0 21 13 11', tecz: [1, 0, 14.5, 14.5],
  },
  anime: {
    bialko: 'M-17 -1C-17 -19 -6 -24 2 -24C12 -24 17 -16 17 -3C17 12 8 22 0 22C-9 22 -17 13 -17 -1Z',
    powieka: 'M-21 -1C-20 -20 -6 -28 3 -27C13 -26 19 -18 18 -4C15 -15 10 -21 2 -21C-8 -21 -16 -14 -17 0Z',
    zalamanie: 'M-14 -29C-6 -36 10 -35 16 -25', dol: 'M-12 17Q0 25 12 16', tecz: [1, 3, 12, 16], dop: 'translate(0 -1)',
  },
  migdalowe: {
    bialko: 'M-18 1C-13 -13 -2 -17 4 -16C11 -15 16 -10 17 -3C11 8 -6 12 -18 1Z',
    powieka: 'M-23 1C-16 -17 -2 -23 5 -22C13 -21 19 -12 18 -3C14 -10 9 -14 3 -14C-5 -14 -13 -9 -18 1Z',
    zalamanie: 'M-14 -23C-6 -29 8 -28 15 -19', dol: 'M-14 6Q-2 14 12 4', tecz: [1, -1, 11, 11], dop: 'translate(0 4) scale(1 .8)',
  },
  kocie: {
    bialko: 'M-19 -5C-10 -17 10 -14 17 2C8 10 -10 10 -19 -5Z',
    powieka: 'M-27 -11C-15 -21 6 -20 18 1C8 -11 -8 -13 -19 -5Z',
    zalamanie: 'M-15 -24C-5 -29 9 -26 16 -14', dol: 'M-14 4Q0 12 13 6', tecz: [0, -1, 11, 11], dop: 'translate(-2 3) rotate(-10) scale(1 .78)',
  },
};
OKO.lalka = { ...OKO.duze, tecz: [1, 0, 16, 16] };

// Tęczówka w trzech tonach: ciemna góra (cień powieki), właściwy kolor, jasny blask na dole.
function teczGrad(p, c) {
  const klucz = 'tecz' + c;
  if (!p.pamiec.has(klucz)) {
    const id = p.id('tz');
    p.defs.push(`<linearGradient id="${id}" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="${ciemniej(c, 0.62)}"/><stop offset=".45" stop-color="${c}"/><stop offset="1" stop-color="${jasniej(c, 0.6)}"/></linearGradient>`);
    p.pamiec.set(klucz, `url(#${id})`);
  }
  return p.pamiec.get(klucz);
}

function jednoOko(p, styl, teczowka, stan, strona) {
  const skora = skoraZ(stan);
  // rzęsy i kreska to osobne kategorie, ale rysuje je oko – kolor może nie być zapisany, gdy wybrano „bez”
  const rz = { id: stan.w.rzesy?.id || 'naturalne', k: [stan.w.rzesy?.k?.[0] || '#2a1a2e'] };
  const kr = { id: stan.w.kreska?.id || 'brak', k: [stan.w.kreska?.k?.[0] || '#1b1020'] };
  const linia = '#2a1a2e', cienSkory = obrysSkory(skora);
  const zamkniete = styl === 'zamkniete' || (styl === 'mrugniecie' && strona === -1);
  if (zamkniete) {
    return `<path d="M-17 1Q0 -13 17 -1Q0 -8 -17 1Z" fill="${linia}" stroke="${linia}" stroke-width="2.4" stroke-linejoin="round"/>` +
      `<path d="M-14 -16Q0 -26 14 -14" fill="none" stroke="${cienSkory}" stroke-width="1.4" opacity=".45" stroke-linecap="round"/>` +
      `<g transform="translate(2 7) scale(.85 .6)">${rzesyRysuj(rz.id === 'brak' ? 'brak' : 'naturalne', rz.k[0])}</g>`;
  }
  const ksz = OKO[styl] || OKO.duze;
  const [tx, ty, trx, try_] = ksz.tecz;
  const ciemna = ciemniej(teczowka, 0.7), jasna = jasniej(teczowka, 0.7);
  let tecz = `<ellipse cx="${tx}" cy="${ty}" rx="${trx}" ry="${try_}" fill="${teczGrad(p, teczowka)}"/>` +
    // ciemny pierścień na brzegu tęczówki i jasny półksiężyc na dole – oko nabiera głębi
    `<ellipse cx="${tx}" cy="${ty}" rx="${trx - 0.8}" ry="${try_ - 0.8}" fill="none" stroke="${ciemna}" stroke-width="1.8" opacity=".85"/>` +
    `<path d="M${tx - trx * 0.62} ${ty + try_ * 0.42}Q${tx} ${ty + try_ * 0.95} ${tx + trx * 0.62} ${ty + try_ * 0.42}" fill="none" stroke="${jasna}" stroke-width="${(trx * 0.24).toFixed(1)}" stroke-linecap="round" opacity=".55"/>`;
  let zrenica = `<ellipse cx="${tx}" cy="${ty + 1}" rx="${(trx * 0.44).toFixed(1)}" ry="${(try_ * 0.46).toFixed(1)}" fill="#1b0f22"/>`;
  const bx = tx - trx * 0.38, by = ty - try_ * 0.38;
  let blyski = `<ellipse cx="${bx}" cy="${by}" rx="${(trx * 0.34).toFixed(1)}" ry="${(try_ * 0.4).toFixed(1)}" fill="#fff" transform="rotate(-20 ${bx} ${by})"/>` +
    `<circle cx="${tx + trx * 0.42}" cy="${ty + try_ * 0.5}" r="${(trx * 0.15).toFixed(1)}" fill="#fff"/><circle cx="${tx + trx * 0.5}" cy="${ty - try_ * 0.3}" r="${(trx * 0.08).toFixed(1)}" fill="#fff" opacity=".9"/>`;
  if (styl === 'kocie') zrenica = `<ellipse cx="0" cy="-1" rx="2.4" ry="9.5" fill="#1b0f22"/>`;
  if (styl === 'blyszczace') {
    blyski += `<path d="${blysk(tx + 5, ty - 6, 4)}" fill="#fff"/><circle cx="${tx - 7}" cy="${ty + 6}" r="1.4" fill="#fff" opacity=".8"/><circle cx="${tx + 1}" cy="${ty + 9}" r="1" fill="#fff" opacity=".8"/>`;
    tecz += `<ellipse cx="${tx}" cy="${ty + 4}" rx="${trx * 0.7}" ry="${try_ * 0.5}" fill="${jasniej(teczowka, 0.5)}" opacity=".35"/>`;
  }
  if (styl === 'lalka') {
    tecz += `<ellipse cx="${tx}" cy="${ty}" rx="${trx * 0.68}" ry="${try_ * 0.68}" fill="none" stroke="${jasniej(teczowka, 0.4)}" stroke-width="1.2" opacity=".7"/>`;
    blyski += `<ellipse cx="${tx + 6}" cy="${ty - 7}" rx="2.4" ry="3" fill="#fff" opacity=".9"/>`;
  }
  if (styl === 'lodowe') {
    tecz = `<ellipse cx="${tx}" cy="${ty}" rx="${trx}" ry="${try_}" fill="${teczGrad(p, mieszaj(teczowka, '#bfe9ff', 0.45))}"/>` +
      `<ellipse cx="${tx}" cy="${ty}" rx="${trx - 0.8}" ry="${try_ - 0.8}" fill="none" stroke="${mieszaj(teczowka, '#ffffff', 0.5)}" stroke-width="1.6"/>`;
    zrenica = `<path d="${sniezynkaD(tx, ty + 1, 6.5)}" stroke="#1b2a4a" stroke-width="1.8" stroke-linecap="round" fill="none"/><circle cx="${tx}" cy="${ty + 1}" r="2.6" fill="#1b2a4a"/>`;
    blyski += `<path d="${blysk(tx + 6, ty - 7, 3.6)}" fill="#fff"/>`;
  }
  if (styl === 'gwiazdki') { zrenica = `<path d="${gwiazda(tx, ty + 1, 7.5)}" fill="#1b0f22"/>`; blyski = `<path d="${blysk(tx - 5, ty - 5, 5)}" fill="#fff"/><circle cx="${tx + 5}" cy="${ty + 8}" r="1.6" fill="#fff"/>`; }
  if (styl === 'serduszka') { zrenica = `<path d="${serce(tx, ty + 2, 7)}" fill="#1b0f22"/>`; tecz = `<ellipse cx="${tx}" cy="${ty}" rx="${trx}" ry="${try_}" fill="${p.gradient('#c2185b', '#ff8fb8')}"/>`; }
  if (styl === 'swiecace') {
    tecz = `<ellipse cx="${tx}" cy="${ty}" rx="${trx + 1}" ry="${try_ + 1}" fill="${p.promienisty(jasniej(teczowka, 0.75), teczowka, 1, 1)}"/>`;
    zrenica = ''; blyski = `<circle cx="${tx - 4}" cy="${ty - 4}" r="3" fill="#fff" opacity=".9"/>`;
  }
  if (styl === 'spirale') {
    tecz = `<circle cx="0" cy="1" r="12" fill="#fff"/>`;
    zrenica = `<path d="M0 1m0 -1a1 1 0 0 1 2 1a3 3 0 0 1 -5 1a5 5 0 0 1 8 -3a7 7 0 0 1 -10 7a9 9 0 0 1 2 -14" fill="none" stroke="${teczowka}" stroke-width="2.2" stroke-linecap="round"/>`;
    blyski = '';
  }
  const klip = p.id('oko');
  p.defs.push(`<clipPath id="${klip}"><path d="${ksz.bialko}"/></clipPath>`);
  let s = `<path d="${ksz.bialko}" fill="${p.gradient('#ebe3f2', '#ffffff', 0, 0.7)}"/>` +
    `<g clip-path="url(#${klip})">${tecz}${zrenica}${blyski}` +
    // cień rzucany przez powiekę na górę oka
    `<ellipse cx="0" cy="-23" rx="22" ry="7" fill="#3a2140" opacity=".13"/></g>` +
    `<path d="${ksz.zalamanie}" fill="none" stroke="${cienSkory}" stroke-width="1.5" stroke-linecap="round" opacity=".45"/>` +
    `<path d="${ksz.dol}" fill="none" stroke="${linia}" stroke-width="1.3" stroke-linecap="round" opacity=".32"/>`;
  let powieka = `<path d="${ksz.powieka}" fill="${linia}" stroke="${linia}" stroke-width=".8" stroke-linejoin="round"/>`;
  if (styl === 'senne') {
    // powieka w kolorze skóry zasłania górę oka
    s += `<path d="M-20 -30L20 -30L20 -4C9 -9 -9 -9 -20 -2Z" fill="${skora}"/>`;
    powieka = `<path d="M-21 0C-9 -11 9 -11 19 -4C9 -6 -9 -6 -18 2Z" fill="${linia}"/>`;
  }
  const dop = styl === 'senne' ? 'translate(0 10) scale(1 .55)' : (ksz.dop || '');
  s += powieka;
  s += `<g${dop ? ` transform="${dop}"` : ''}>${kreskaRysuj(kr.id, kr.k[0])}${rzesyRysuj(rz.id, rz.k[0])}</g>`;
  return s;
}

export function rysujOczy(p, w, stan) {
  // Mruganie: w grze oczy mrugają (klasa „mrug”), w eksporcie stoją otwarte.
  const otwarte = !['zamkniete'].includes(w.id);
  const tresc = para(strona => `<g class="${otwarte && w.id !== 'mrugniecie' ? 'mrug' : ''}">${jednoOko(p, w.id, w.k[0], stan, strona)}</g>`);
  return { oczy: tresc };
}

export const RZESY = [
  { id: 'brak', nazwa: 'Bez rzęs' },
  { id: 'naturalne', nazwa: 'Naturalne' },
  { id: 'dlugie', nazwa: 'Długie' },
  { id: 'dramatyczne', nazwa: 'Wachlarz', tagi: ['gwiazda', 'gala'] },
  { id: 'kolorowe', nazwa: 'Kolorowe', k: ['#c13ad6'] },
  { id: 'szronione', nazwa: 'Oszronione', k: ['#5b8def'], tagi: ['zima', 'lod', 'krolowa'] },
].map(r => ({ k: ['#2a1a2e'], ...r }));

export const KRESKA = [
  { id: 'brak', nazwa: 'Bez kreski' },
  { id: 'cienka', nazwa: 'Cienka' },
  { id: 'skrzydelko', nazwa: 'Skrzydełko', tagi: ['gala', 'gwiazda'] },
  { id: 'kocia', nazwa: 'Kocia', tagi: ['kot', 'halloween', 'wampir'] },
  { id: 'graficzna', nazwa: 'Graficzna', tagi: ['gwiazda'] },
  { id: 'kropeczki', nazwa: 'Kropeczki', k: ['#4cc9f0'], tagi: ['zima', 'slodka'] },
  { id: 'brokatowa', nazwa: 'Brokatowa', k: ['#c0c8e8'], tagi: ['zima', 'gala', 'swieta'] },
].map(r => ({ k: ['#1b1020'], ...r }));

/* ---------- cienie do powiek ---------- */
export const CIENIE = [
  { id: 'brak', nazwa: 'Bez cieni' },
  { id: 'delikatne', nazwa: 'Delikatne', k: ['#ff9ec7', '#ffd6e8'] },
  { id: 'mocne', nazwa: 'Mocne', k: ['#8a4dff', '#d3b6ff'], tagi: ['gala'] },
  { id: 'dwukolorowe', nazwa: 'Dwa kolory', k: ['#ff7ac4', '#7b6cf6'] },
  { id: 'smokey', nazwa: 'Smokey', k: ['#3a2d4a', '#8f7aa8'], tagi: ['halloween', 'wampir', 'gwiazda'] },
  { id: 'brokatowe', nazwa: 'Brokatowe', k: ['#ffb84d', '#fff3b0'], tagi: ['gala', 'gwiazda'] },
  { id: 'teczowe', nazwa: 'Tęczowe', k: ['#ff5d8f', '#4cc9f0'], tagi: ['slodka'] },
  { id: 'lodowe', nazwa: 'Lodowe', k: ['#6fc0f5', '#ffffff'], tagi: ['zima', 'lod', 'krolowa'] },
  { id: 'swiateczne', nazwa: 'Świąteczne', k: ['#c1121f', '#ffd23f'], tagi: ['zima', 'swieta'] },
  { id: 'szron', nazwa: 'Szron', k: ['#d8e4ff', '#ffffff'], tagi: ['zima', 'snieg', 'krolowa'] },
].map(c => ({ k: ['#ff9ec7', '#ffd6e8'], ...c }));

export function rysujCienie(p, w) {
  if (w.id === 'brak') return {};
  const [c1, c2] = w.k;
  const op = { delikatne: 0.6, mocne: 0.95, dwukolorowe: 0.9, smokey: 0.9, brokatowe: 0.85, teczowe: 0.95, lodowe: 0.9, swiateczne: 0.9, szron: 0.85 }[w.id] || 0.7;
  let wyp;
  if (['dwukolorowe', 'teczowe', 'swiateczne', 'lodowe'].includes(w.id)) {
    const id = p.id('cp');
    p.defs.push(`<linearGradient id="${id}" x1="1" x2="0"><stop offset="0" stop-color="${c1}"/>${w.id === 'teczowe' ? '<stop offset=".5" stop-color="#ffd23f"/>' : ''}<stop offset="1" stop-color="${c2}"/></linearGradient>`);
    wyp = `url(#${id})`;
  } else wyp = p.gradient(mieszaj(c1, c2, 0.5), c1, 0, 1);
  // od rzęs prawie do brwi – wąski pasek ginął pod kreską powieki
  const powieka = 'M-23 2C-23 -35 14 -43 27 -14C14 -28 -8 -27 -18 2Z';
  let s = `<path d="${powieka}" fill="${wyp}" opacity="${op}"/>`;
  if (w.id === 'smokey') s += `<path d="M-17 4Q0 24 16 8Q2 16 -17 4Z" fill="${c1}" opacity=".55"/>`;
  if (['lodowe', 'szron', 'swiateczne'].includes(w.id)) s += `<path d="${blysk(-10, -22, 4)}" fill="#fff"/><path d="${blysk(8, -27, 3)}" fill="#fff"/><circle cx="-2" cy="-30" r="1.3" fill="#fff"/><circle cx="-16" cy="-12" r="1.1" fill="#fff"/>`;
  if (w.id === 'szron') s += `<path d="${sniezynkaD(-24, -26, 5)}" stroke="#fff" stroke-width="1.4" fill="none"/>`;
  if (w.id === 'brokatowe') s += `<path d="${blysk(-8, -16, 3.5)}" fill="#fff"/><path d="${blysk(6, -19, 2.5)}" fill="#fff"/><circle cx="-1" cy="-12" r="1.2" fill="#fff"/>`;
  return { twarzPod: para(() => s, OCZY_Y) };
}

/* ---------- brwi ---------- */
const BRWI_D = {
  naturalne: 'M-17 5Q-5 -8 15 -3L15 1Q-4 -3 -17 5Z',
  proste: 'M-17 3Q0 -2 15 -1L15 3Q0 3 -17 6Z',
  luk: 'M-17 7Q-8 -12 15 -2L14 2Q-7 -7 -17 7Z',
  grube: 'M-18 6Q-6 -11 16 -5L16 3Q-4 -2 -18 6Z',
  cienkie: 'M-16 4Q-5 -6 14 -2L14 0Q-4 -4 -16 4Z',
  zdziwione: 'M-16 -1Q-4 -15 14 -8L14 -4Q-3 -10 -16 -1Z',
  grozne: 'M-17 -4Q-2 -3 15 6L14 10Q-2 3 -17 0Z',
  smutne: 'M-17 7Q-2 2 15 -7L15 -3Q-2 6 -17 10Z',
};
export const BRWI = Object.keys(BRWI_D).map(id => ({
  id, k: ['#5a3726'],
  nazwa: { naturalne: 'Naturalne', proste: 'Proste', luk: 'Łuki', grube: 'Grube', cienkie: 'Cienkie', zdziwione: 'Zdziwione', grozne: 'Groźne', smutne: 'Smutne' }[id],
  tagi: id === 'grozne' ? ['halloween'] : [],
}));
export function rysujBrwi(p, w) {
  const d = BRWI_D[w.id] || BRWI_D.naturalne;
  // brew jaśnieje przy nosie, jak prawdziwa – pełny kolor tylko na łuku i ogonku
  const c = w.k[0], id = p.id('br');
  p.defs.push(`<linearGradient id="${id}"><stop offset="0" stop-color="${c}"/><stop offset=".65" stop-color="${c}"/><stop offset="1" stop-color="${jasniej(c, 0.38)}"/></linearGradient>`);
  return { twarzNad: para(() => `<path d="${d}" fill="url(#${id})" stroke="url(#${id})" stroke-width="1.6" stroke-linejoin="round"/>`, 150) };
}

/* ---------- nos ---------- */
export const NOS = [
  { id: 'zgrabny', nazwa: 'Zgrabny' },
  { id: 'kropka', nazwa: 'Kropeczka' },
  { id: 'haczyk', nazwa: 'Kreseczka' },
  { id: 'guziczek', nazwa: 'Guziczek' },
  { id: 'kotek', nazwa: 'Koci', k: ['#ff8fb1'], tagi: ['kot', 'halloween'] },
  { id: 'czaszka', nazwa: 'Czaszki', k: ['#1b1020'], tagi: ['halloween', 'szkielet'] },
  { id: 'renifer', nazwa: 'Renifera', k: ['#e5383b'], tagi: ['zima', 'swieta', 'renifer'] },
];
export function rysujNos(p, w, stan) {
  const o = obrysSkory(skoraZ(stan));
  switch (w.id) {
    case 'haczyk': return { twarzNad: `<path d="M299 195Q306 205 298 209" fill="none" stroke="${o}" stroke-width="2.2" stroke-linecap="round"/>` };
    case 'guziczek': return { twarzNad: `<ellipse cx="300" cy="204" rx="6" ry="4.4" fill="${o}" opacity=".18"/><circle cx="297" cy="206" r="1.4" fill="${o}"/><circle cx="303" cy="206" r="1.4" fill="${o}"/><circle cx="299" cy="201" r="1.4" fill="#fff" opacity=".7"/>` };
    case 'kotek': return { twarzNad: `<path d="M293 201L307 201L300 210Z" fill="${w.k?.[0] || '#ff8fb1'}" stroke="${ciemniej(w.k?.[0] || '#ff8fb1', 0.4)}" stroke-width="1.6" stroke-linejoin="round"/><path d="M300 210L300 214" stroke="${o}" stroke-width="1.6"/>` };
    case 'zgrabny': return { twarzNad: `<path d="M303 184Q308 197 305 204" fill="none" stroke="${o}" stroke-width="1.6" stroke-linecap="round" opacity=".28"/>` +
      `<path d="M294 206Q300 211 306 206" fill="none" stroke="${o}" stroke-width="1.9" stroke-linecap="round" opacity=".6"/>` +
      `<ellipse cx="299" cy="202" rx="2.8" ry="1.8" fill="#fff" opacity=".55"/>` };
    case 'renifer': {
      const c = w.k?.[0] || '#e5383b';
      return { twarzNad: `<circle cx="300" cy="204" r="8" fill="${p.promienisty(jasniej(c, 0.35), c, 1, 1)}" stroke="${ciemniej(c, 0.35)}" stroke-width="1.6"/><ellipse cx="297" cy="200" rx="3" ry="2" fill="#fff" opacity=".8"/>` };
    }
    case 'czaszka': return { twarzNad: `<path d="M300 200C295 196 291 202 296 207L300 211L304 207C309 202 305 196 300 200Z" fill="${w.k?.[0] || '#1b1020'}"/>` };
    default: return { twarzNad: `<ellipse cx="300" cy="205" rx="3.2" ry="2.2" fill="${o}" opacity=".55"/>` };
  }
}

/* ---------- usta ---------- */
export const USTA = [
  { id: 'usmiech', nazwa: 'Uśmiech' },
  { id: 'szeroki', nazwa: 'Radość' },
  { id: 'buziak', nazwa: 'Buziak', tagi: ['slodka', 'gwiazda'] },
  { id: 'kly', nazwa: 'Kiełki', tagi: ['halloween', 'wampir'] },
  { id: 'koci', nazwa: 'Kocia :3', tagi: ['kot', 'halloween'] },
  { id: 'jezyk', nazwa: 'Języczek', tagi: ['slodka'] },
  { id: 'zdziwiona', nazwa: 'Ojej!' },
  { id: 'usmieszek', nazwa: 'Uśmieszek' },
  { id: 'spokojna', nazwa: 'Spokojna' },
  { id: 'brr', nazwa: 'Brrr!', tagi: ['zima', 'snieg'] },
  { id: 'kakao', nazwa: 'Wąsik z kakao', tagi: ['zima', 'pizama', 'slodka'] },
].map(u => ({ k: ['#e8848f'], ...u }));

export function rysujUsta(p, w, stan) {
  const c = w.k[0], o = ciemniej(c, 0.45), wn = '#7a1f3d', y = 226;
  const skora = skoraZ(stan);
  // górna warga z łukiem Kupidyna, dolna pełniejsza i jaśniejsza, z połyskiem błyszczyka
  const usta = (dol) => `<path d="M284 ${y - 3}Q291 ${y - 8} 297 ${y - 6}Q300 ${y - 5} 303 ${y - 6}Q309 ${y - 8} 316 ${y - 3}Q300 ${y} 284 ${y - 3}Z" fill="${ciemniej(c, 0.12)}" stroke="${o}" stroke-width="1.3" stroke-linejoin="round"/>` +
    `<path d="M284 ${y - 3}Q300 ${y + 2} 316 ${y - 3}Q309 ${y + dol} 300 ${y + dol}Q291 ${y + dol} 284 ${y - 3}Z" fill="${p.gradient(c, jasniej(c, 0.22))}" stroke="${o}" stroke-width="1.3" stroke-linejoin="round"/>` +
    `<path d="M287 ${y - 2.5}Q300 ${y + 1} 313 ${y - 2.5}" fill="none" stroke="${ciemniej(c, 0.5)}" stroke-width="1.2" stroke-linecap="round" opacity=".7"/>` +
    `<ellipse cx="303" cy="${y + dol - 4}" rx="4.6" ry="1.8" fill="#fff" opacity=".6"/><circle cx="296" cy="${y + dol - 3}" r="1" fill="#fff" opacity=".5"/>`;
  const otwarte = (h, extra = '') => `<path d="M283 ${y - 5}Q300 ${y} 317 ${y - 5}Q313 ${y + h} 300 ${y + h + 1}Q287 ${y + h} 283 ${y - 5}Z" fill="${wn}" stroke="${c}" stroke-width="3.2" stroke-linejoin="round"/>` +
    `<path d="M287 ${y - 3}Q300 ${y + 1} 313 ${y - 3}L312 ${y + 2}Q300 ${y + 5} 288 ${y + 2}Z" fill="#fff"/>` + extra +
    `<ellipse cx="300" cy="${y + h - 3}" rx="7" ry="4" fill="#ff7b9c"/>`;
  let s;
  switch (w.id) {
    case 'szeroki': s = otwarte(13); break;
    // zmarznięte usta: szczękające ząbki w falistej buzi
    case 'brr': s = `<path d="M284 ${y - 4}Q300 ${y - 8} 316 ${y - 4}L316 ${y + 6}Q300 ${y + 10} 284 ${y + 6}Z" fill="#fff" stroke="${c}" stroke-width="3" stroke-linejoin="round"/>` +
      `<path d="M286 ${y + 1}l4 -3l4 3l4 -3l4 3l4 -3l4 3l4 -3l2 2" fill="none" stroke="${o}" stroke-width="1.4"/>`; break;
    case 'kakao': s = usta(8) + `<path d="M282 ${y - 6}Q291 ${y - 12} 300 ${y - 8}Q309 ${y - 12} 318 ${y - 6}Q312 ${y - 3} 306 ${y - 5}Q300 ${y - 2} 294 ${y - 5}Q288 ${y - 3} 282 ${y - 6}Z" fill="#7a4a2a" opacity=".85"/>`; break;
    case 'kly': s = otwarte(11, `<path d="M290 ${y + 1}L293 ${y + 9}L296 ${y + 2}ZM304 ${y + 2}L307 ${y + 9}L310 ${y + 1}Z" fill="#fff" stroke="#d9cfe0" stroke-width=".8"/>`); break;
    case 'buziak': s = `<path d="${serce(300, y, 7.5)}" fill="${c}" stroke="${o}" stroke-width="1.6"/><path d="M294 ${y}Q300 ${y + 2} 306 ${y}" fill="none" stroke="${o}" stroke-width="1.4"/><ellipse cx="303" cy="${y + 3}" rx="2.5" ry="1.2" fill="#fff" opacity=".5"/>`; break;
    case 'koci': s = `<path d="M286 ${y - 4}Q293 ${y + 5} 300 ${y - 2}Q307 ${y + 5} 314 ${y - 4}" fill="none" stroke="${o}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M291 ${y}Q300 ${y + 6} 309 ${y}" fill="none" stroke="${c}" stroke-width="2" opacity=".7"/>`; break;
    case 'jezyk': s = usta(8) + `<path d="M302 ${y + 1}Q302 ${y + 13} 309 ${y + 13}Q315 ${y + 12} 313 ${y - 1}Z" fill="#ff7b9c" stroke="#d14a72" stroke-width="1.4"/><path d="M308 ${y + 2}L308.5 ${y + 9}" stroke="#d14a72" stroke-width="1.2"/>`; break;
    case 'zdziwiona': s = `<ellipse cx="300" cy="${y + 2}" rx="6.5" ry="8" fill="${wn}" stroke="${c}" stroke-width="3"/><ellipse cx="300" cy="${y + 6}" rx="3.5" ry="2.4" fill="#ff7b9c"/>`; break;
    case 'usmieszek': s = `<path d="M288 ${y - 1}Q300 ${y + 5} 314 ${y - 7}" fill="none" stroke="${o}" stroke-width="2.6" stroke-linecap="round"/><path d="M290 ${y}Q300 ${y + 4} 311 ${y - 4}" fill="none" stroke="${c}" stroke-width="3.2" stroke-linecap="round" opacity=".8"/>`; break;
    case 'spokojna': s = `<path d="M291 ${y - 2}Q300 ${y + 3} 309 ${y - 2}" fill="none" stroke="${o}" stroke-width="2.4" stroke-linecap="round"/><path d="M293 ${y + 1}Q300 ${y + 6} 307 ${y + 1}" fill="none" stroke="${c}" stroke-width="2.6" stroke-linecap="round" opacity=".7"/>`; break;
    default: s = usta(8) + `<path d="M283 ${y - 4}Q285 ${y - 3} 286 ${y - 1}M317 ${y - 4}Q315 ${y - 3} 314 ${y - 1}" stroke="${obrysSkory(skora)}" stroke-width="1.4" fill="none" stroke-linecap="round"/>`;
  }
  return { twarzNad: s };
}

/* ---------- policzki ---------- */
export const POLICZKI = [
  { id: 'brak', nazwa: 'Bez' },
  { id: 'rumience', nazwa: 'Rumieńce' },
  { id: 'piegi', nazwa: 'Piegi' },
  { id: 'oba', nazwa: 'Rumieńce + piegi' },
  { id: 'serduszka', nazwa: 'Serduszka', tagi: ['slodka'] },
  { id: 'pieprzyk', nazwa: 'Pieprzyk', tagi: ['gala', 'wampir'] },
  { id: 'mroz', nazwa: 'Od mrozu', k: ['#ff5d7a', '#ffffff'], tagi: ['zima', 'snieg', 'narty'] },
].map(c => ({ k: ['#ff8fa8', '#b0705a'], ...c }));

export function rysujPoliczki(p, w) {
  const [c1, c2] = w.k;
  let s = '';
  const rum = () => `<ellipse cx="256" cy="207" rx="15" ry="9" fill="${p.promienisty(c1, c1, 0.6, 0)}"/><ellipse cx="344" cy="207" rx="15" ry="9" fill="${p.promienisty(c1, c1, 0.6, 0)}"/>`;
  const piegi = () => {
    const r = losowe(11); let t = '';
    for (let i = 0; i < 7; i++) { const x = 250 + r() * 22, y = 196 + r() * 14; t += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(1 + r() * 0.8).toFixed(1)}" fill="${c2}" opacity=".75"/><circle cx="${(600 - x).toFixed(1)}" cy="${(y + r() * 3).toFixed(1)}" r="${(1 + r() * 0.8).toFixed(1)}" fill="${c2}" opacity=".75"/>`; }
    return t + `<circle cx="296" cy="199" r="1" fill="${c2}" opacity=".6"/><circle cx="304" cy="198" r="1" fill="${c2}" opacity=".6"/>`;
  };
  if (w.id === 'rumience' || w.id === 'oba') s += rum();
  if (w.id === 'piegi' || w.id === 'oba') s += piegi();
  if (w.id === 'serduszka') s += `<path d="${serce(256, 208, 7)}" fill="${c1}" opacity=".75"/><path d="${serce(344, 208, 7)}" fill="${c1}" opacity=".75"/>`;
  if (w.id === 'mroz') s += `<ellipse cx="254" cy="208" rx="20" ry="13" fill="${p.promienisty(c1, c1, 0.75, 0)}"/><ellipse cx="346" cy="208" rx="20" ry="13" fill="${p.promienisty(c1, c1, 0.75, 0)}"/>` +
    [[244, 200, 4], [262, 216, 3], [354, 198, 3.5]].map(([x, y, r]) => `<path d="${sniezynkaD(x, y, r)}" stroke="${c2}" stroke-width="1.2" fill="none"/>`).join('') + `<ellipse cx="300" cy="205" rx="7" ry="5" fill="${p.promienisty(c1, c1, 0.5, 0)}"/>`;
  if (w.id === 'pieprzyk') s += rum().replace(/0\.6/g, '0.35') + `<circle cx="326" cy="218" r="2.2" fill="#3a2020"/>`;
  return { twarzPod: s };
}

/* ---------- malunki (Halloween i nie tylko) ---------- */
export const MALUNKI = [
  { id: 'brak', nazwa: 'Bez' },
  { id: 'szkielet', nazwa: 'Czaszka', k: ['#ffffff', '#1b1020'], tagi: ['halloween', 'szkielet'] },
  { id: 'kotek', nazwa: 'Kotek', k: ['#1b1020', '#ff8fb1'], tagi: ['halloween', 'kot'] },
  { id: 'szwy', nazwa: 'Szwy', k: ['#3b2440', '#b04a5a'], tagi: ['halloween', 'zombie'] },
  { id: 'pajeczyna', nazwa: 'Pajęczyna', k: ['#1b1020', '#6b2fa0'], tagi: ['halloween', 'czarownica', 'pajak'] },
  { id: 'dynia', nazwa: 'Dyńka', k: ['#ff8a1f', '#5b7a2a'], tagi: ['halloween', 'dynia'] },
  { id: 'nietoperz', nazwa: 'Nietoperz', k: ['#2a1a3a', '#8b5cf6'], tagi: ['halloween', 'wampir'] },
  { id: 'ksiezyc', nazwa: 'Księżyc', k: ['#ffd23f', '#8b5cf6'], tagi: ['czarownica', 'kosmos', 'halloween'] },
  { id: 'maska', nazwa: 'Maska', k: ['#7b2cbf', '#ffd23f'], tagi: ['halloween', 'gala', 'czarownica'] },
  { id: 'wampir', nazwa: 'Wampirzyca', k: ['#5b2a6e', '#c1121f'], tagi: ['halloween', 'wampir'] },
  { id: 'gwiazdki', nazwa: 'Gwiazdki', k: ['#ffd23f', '#ff5d8f'], tagi: ['gwiazda', 'kosmos'] },
  { id: 'serca', nazwa: 'Serduszka', k: ['#ff4d8d', '#ffb3cf'], tagi: ['slodka'] },
  { id: 'brokat', nazwa: 'Brokat', k: ['#ffffff', '#ffd23f'], tagi: ['gwiazda', 'wrozka', 'gala'] },
  { id: 'syrena', nazwa: 'Łuski', k: ['#4cc9f0', '#c77dff'], tagi: ['syrena'] },
  { id: 'sniezynka', nazwa: 'Śnieżynka', k: ['#ffffff', '#8fd3f7'], tagi: ['zima', 'snieg', 'krolowa'] },
  { id: 'krysztaly', nazwa: 'Lodowe kryształki', k: ['#8fd3f7', '#ffffff'], tagi: ['zima', 'lod', 'krolowa'] },
  { id: 'choinka', nazwa: 'Choinka', k: ['#2e9a4a', '#ffd23f'], tagi: ['zima', 'swieta', 'elf'] },
  { id: 'laska', nazwa: 'Cukrowa laska', k: ['#e5383b', '#ffffff'], tagi: ['zima', 'swieta', 'cukierki', 'elf'] },
  { id: 'szron', nazwa: 'Szron', k: ['#ffffff', '#bfe9ff'], tagi: ['zima', 'snieg', 'lod', 'krolowa'] },
  { id: 'renifer', nazwa: 'Reniferek', k: ['#8b5a2b', '#e5383b'], tagi: ['zima', 'renifer', 'swieta'] },
].map(m => ({ k: ['#ffffff', '#1b1020'], ...m }));

export function rysujMalunki(p, w, stan) {
  const [c1, c2] = w.k;
  const twarz = TWARZE[ksztaltZ(stan)];
  let pod = '', nad = '';
  switch (w.id) {
    case 'szkielet':
      pod += `<path d="${twarz}" fill="${c1}" opacity=".88"/>` +
        para(() => `<path d="M-22 -4C-24 -24 18 -28 22 -6C24 12 12 24 0 24C-14 24 -21 12 -22 -4Z" fill="${c2}"/>`);
      nad += `<path d="M275 224Q300 236 325 224" fill="none" stroke="${c2}" stroke-width="2.4" stroke-linecap="round"/>` +
        [282, 290, 298, 306, 314, 320].map(x => `<path d="M${x} ${x < 300 ? 222 : 223}l${x < 300 ? 0 : 0} 8" stroke="${c2}" stroke-width="1.8" stroke-linecap="round"/>`).join('') +
        `<path d="M266 142q-6 10 2 16M334 142q6 10 -2 16" fill="none" stroke="${c2}" stroke-width="2" stroke-linecap="round" opacity=".7"/>`;
      break;
    case 'kotek':
      nad += obie(`<path d="M270 210L244 204M270 215L242 216M270 220L246 228" stroke="${c1}" stroke-width="2.2" stroke-linecap="round"/>`) +
        `<path d="M293 199L307 199L300 209Z" fill="${c1}"/><path d="M300 209Q300 214 296 216M300 209Q300 214 304 216" fill="none" stroke="${c1}" stroke-width="1.8"/>`;
      pod += `<ellipse cx="256" cy="210" rx="11" ry="7" fill="${c2}" opacity=".35"/><ellipse cx="344" cy="210" rx="11" ry="7" fill="${c2}" opacity=".35"/>`;
      break;
    case 'szwy': {
      const szew = (x1, y1, x2, y2, n) => {
        let t = `<path d="M${x1} ${y1}L${x2} ${y2}" stroke="${c1}" stroke-width="2" stroke-linecap="round"/>`;
        const dx = x2 - x1, dy = y2 - y1, dl = Math.hypot(dx, dy), nx = -dy / dl * 5, ny = dx / dl * 5;
        for (let i = 1; i < n; i++) { const x = x1 + dx * i / n, y = y1 + dy * i / n; t += `<path d="M${(x - nx).toFixed(1)} ${(y - ny).toFixed(1)}L${(x + nx).toFixed(1)} ${(y + ny).toFixed(1)}" stroke="${c1}" stroke-width="1.8" stroke-linecap="round"/>`; }
        return t;
      };
      pod += `<path d="M330 120Q348 132 352 150L340 158Q330 140 320 132Z" fill="${c2}" opacity=".18"/>` +
        szew(322, 118, 352, 146, 5) + szew(244, 200, 268, 222, 4) + `<circle cx="252" cy="190" r="5" fill="#7fb069" opacity=".45"/>`;
      break;
    }
    case 'pajeczyna': {
      let t = `<g fill="none" stroke="${c1}" stroke-width="1.4" stroke-linecap="round">`;
      const cx = 244, cy = 150;
      for (let i = 0; i < 5; i++) { const k = (10 + i * 20) * Math.PI / 180; t += `<line x1="${cx}" y1="${cy}" x2="${(cx + Math.cos(k) * 42).toFixed(1)}" y2="${(cy + Math.sin(k) * 42).toFixed(1)}"/>`; }
      for (const r of [12, 24, 36]) {
        let d = '';
        for (let i = 0; i < 5; i++) { const k = (10 + i * 20) * Math.PI / 180, km = (i * 20) * Math.PI / 180; d += i ? `Q${(cx + Math.cos(km) * r * 0.85).toFixed(1)} ${(cy + Math.sin(km) * r * 0.85).toFixed(1)} ` : 'M'; d += `${(cx + Math.cos(k) * r).toFixed(1)} ${(cy + Math.sin(k) * r).toFixed(1)}`; }
        t += `<path d="${d}"/>`;
      }
      t += '</g>';
      // pajęczyna od skroni: przycięta do twarzy, żeby nie wychodziła na włosy
      const klip = p.id('tw');
      p.defs.push(`<clipPath id="${klip}"><path d="${twarz}"/></clipPath>`);
      pod += `<g clip-path="url(#${klip})">${t}</g>`;
      nad += `<path d="M262 218v10" stroke="${c1}" stroke-width="1"/><ellipse cx="262" cy="232" rx="4" ry="4.6" fill="${c1}"/><circle cx="262" cy="227" r="2.6" fill="${c1}"/>` +
        `<path d="M258 230l-5 -3M258 233l-6 0M266 230l5 -3M266 233l6 0" stroke="${c1}" stroke-width="1.2"/><circle cx="261" cy="226" r=".8" fill="${c2}"/><circle cx="263.5" cy="226" r=".8" fill="${c2}"/>`;
      break;
    }
    case 'dynia': pod += dynia(254, 212, 10, c1, true).replace('#5b7a2a', c2); break;
    case 'nietoperz': pod += `<path d="${nietoperz(300, 132, 2.1)}" fill="${c1}"/>` + `<path d="${nietoperz(346, 214, 0.9)}" fill="${c2}"/>`; break;
    case 'ksiezyc':
      pod += `<path d="M252 214a12 12 0 1 0 14 -12a9 9 0 1 1 -14 12Z" fill="${c1}" stroke="${ciemniej(c1, 0.3)}" stroke-width="1"/>` +
        `<path d="${gwiazda(344, 206, 5)}" fill="${c2}"/><path d="${gwiazda(352, 222, 3.5)}" fill="${c1}"/><path d="${gwiazda(272, 140, 3.5)}" fill="${c2}"/>`;
      break;
    case 'maska':
      pod += `<path d="M300 186C292 162 262 150 238 160C226 166 230 190 246 200C262 210 284 204 300 196C316 204 338 210 354 200C370 190 374 166 362 160C338 150 308 162 300 186Z" fill="${p.gradient(c1, ciemniej(c1, 0.3))}" stroke="${c2}" stroke-width="2.4"/>` +
        `<path d="${blysk(240, 160, 6)}" fill="${c2}"/><path d="${blysk(360, 160, 6)}" fill="${c2}"/><circle cx="300" cy="178" r="3" fill="${c2}"/>`;
      break;
    case 'wampir':
      pod += para(() => `<path d="M-19 6Q0 26 18 8Q0 18 -19 6Z" fill="${c1}" opacity=".55"/><path d="M-19 -1C-15 -26 12 -32 22 -12C12 -20 -8 -18 -17 -1Z" fill="${c1}" opacity=".7"/>`);
      nad += `<path d="M309 232q2 7 0 10q-3 -3 0 -10Z" fill="${c2}"/>`;
      break;
    case 'gwiazdki':
      pod += `<path d="${gwiazda(254, 210, 9)}" fill="${c1}" stroke="${ciemniej(c1, 0.3)}" stroke-width="1"/><path d="${gwiazda(266, 226, 4.5)}" fill="${c2}"/><path d="${gwiazda(246, 196, 3.5)}" fill="${c2}"/>`;
      break;
    case 'serca': pod += `<path d="${serce(254, 212, 7)}" fill="${c1}"/><path d="${serce(266, 226, 4)}" fill="${c2}"/><path d="${serce(346, 212, 7)}" fill="${c1}"/>`; break;
    case 'brokat': {
      const r = losowe(5);
      for (let i = 0; i < 16; i++) { const x = 244 + r() * 30, y = 190 + r() * 26; pod += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(0.8 + r() * 1.4).toFixed(1)}" fill="${i % 2 ? c1 : c2}"/><circle cx="${(600 - x).toFixed(1)}" cy="${y.toFixed(1)}" r="${(0.8 + r() * 1.4).toFixed(1)}" fill="${i % 2 ? c2 : c1}"/>`; }
      pod += `<path d="${blysk(256, 200, 5)}" fill="${c1}"/><path d="${blysk(346, 204, 4)}" fill="${c1}"/>`;
      break;
    }
    case 'syrena': {
      let t = '';
      for (let r = 0; r < 3; r++) for (let i = 0; i < 4 - r; i++) {
        const x = 240 + i * 8 + r * 4, y = 196 + r * 7;
        t += `<path d="M${x - 4} ${y}a4 4 0 0 0 8 0" fill="none" stroke="${r % 2 ? c2 : c1}" stroke-width="1.8"/>`;
      }
      pod += t + `<g transform="matrix(-1 0 0 1 600 0)">${t}</g>`;
      break;
    }
    case 'sniezynka':
      pod += `<path d="${sniezynkaD(254, 212, 14)}" stroke="${c2}" stroke-width="4" stroke-linecap="round" fill="none"/><path d="${sniezynkaD(254, 212, 14)}" stroke="${c1}" stroke-width="2" stroke-linecap="round" fill="none"/>` +
        `<path d="${sniezynkaD(346, 150, 7)}" stroke="${c1}" stroke-width="1.8" stroke-linecap="round" fill="none"/><circle cx="268" cy="226" r="1.8" fill="${c1}"/><circle cx="240" cy="198" r="1.4" fill="${c1}"/>`;
      break;
    case 'krysztaly': {
      const k = (x, y, r) => `<path d="M${x} ${y - r}L${x + r * 0.45} ${y}L${x} ${y + r}L${x - r * 0.45} ${y}Z" fill="${c1}" stroke="${c2}" stroke-width="1"/>`;
      const t = [[240, 150, 7], [234, 166, 5], [236, 182, 6], [242, 198, 4.5], [250, 140, 4], [252, 210, 3.4]].map(a => k(...a)).join('') + `<path d="${blysk(246, 160, 3)}" fill="#fff"/>`;
      pod += t + `<g transform="matrix(-1 0 0 1 600 0)" opacity=".7">${t}</g>`;
      break;
    }
    case 'choinka':
      pod += `<path d="M256 196L246 212L251 212L243 224L269 224L261 212L266 212Z" fill="${c1}" stroke="${ciemniej(c1, 0.35)}" stroke-width="1" stroke-linejoin="round"/><rect x="254" y="224" width="4" height="4" fill="#8b5a2b"/>` +
        `<path d="${gwiazda(256, 195, 4)}" fill="${c2}"/><circle cx="252" cy="214" r="1.4" fill="#e5383b"/><circle cx="261" cy="219" r="1.4" fill="#4cc9f0"/><circle cx="255" cy="221" r="1.2" fill="${c2}"/>`;
      break;
    case 'laska':
      pod += `<path d="M258 230L258 206Q258 198 251 198Q244 198 244 205" fill="none" stroke="${c2}" stroke-width="4.4" stroke-linecap="round"/><path d="M258 230L258 206Q258 198 251 198Q244 198 244 205" fill="none" stroke="${c1}" stroke-width="4.4" stroke-dasharray="3 3"/>` +
        `<path d="${serce(344, 212, 4)}" fill="${c1}"/>`;
      break;
    case 'szron': {
      // szronowe paprotki od skroni po policzek
      let d = '';
      for (const [x, y, k, dl] of [[236, 150, 1.2, 34], [234, 176, 0.5, 30], [240, 196, -0.2, 24]]) {
        d += `M${x} ${y}l${(Math.cos(k) * dl).toFixed(1)} ${(Math.sin(k) * dl).toFixed(1)}`;
        for (let i = 1; i < 5; i++) { const px = x + Math.cos(k) * dl * i / 5, py = y + Math.sin(k) * dl * i / 5, l = 7 - i; for (const z of [-1, 1]) d += `M${px.toFixed(1)} ${py.toFixed(1)}l${(Math.cos(k + z * 0.8) * l).toFixed(1)} ${(Math.sin(k + z * 0.8) * l).toFixed(1)}`; }
      }
      const t = `<path d="${d}" stroke="${c2}" stroke-width="2.6" fill="none" stroke-linecap="round" opacity=".7"/><path d="${d}" stroke="${c1}" stroke-width="1.2" fill="none" stroke-linecap="round"/>`;
      pod += t + `<g transform="matrix(-1 0 0 1 600 0)">${t}</g>`;
      break;
    }
    case 'renifer':
      nad += `<circle cx="300" cy="204" r="7" fill="${c2}"/><circle cx="298" cy="202" r="2" fill="#fff" opacity=".7"/>`;
      pod += obie(`<circle cx="250" cy="206" r="2" fill="${c1}"/><circle cx="258" cy="212" r="1.6" fill="${c1}"/><circle cx="248" cy="216" r="1.8" fill="${c1}"/><circle cx="262" cy="202" r="1.3" fill="${c1}"/>`);
      break;
  }
  return { twarzPod: pod, twarzNad: nad };
}

