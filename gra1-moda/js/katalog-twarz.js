// Twarz i makijaż. Oczy rysujemy w układzie lokalnym lewego oka (kącik zewnętrzny po stronie ujemnego x),
// prawe to odbicie – dzięki temu kreska, rzęsy i cienie zawsze idą „na zewnątrz”, jak w prawdziwym makijażu.
import { mieszaj, jasniej, ciemniej, gwiazda, serce, blysk, nietoperz, dynia, losowe, obie } from './narzedzia.js';
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
function rzesyRysuj(rodzaj, kolor) {
  const k = `stroke="${kolor}" stroke-linecap="round" fill="none"`;
  switch (rodzaj) {
    case 'brak': return '';
    case 'naturalne': return `<path d="M-15 -7l-6 -4M-11 -11l-4 -6" ${k} stroke-width="2.4"/>`;
    case 'dlugie': return `<path d="M-15 -6q-6 -2 -10 -8M-12 -11q-4 -4 -6 -11M-6 -14q-1 -5 -1 -10" ${k} stroke-width="2.6"/>`;
    case 'dramatyczne': return `<path d="M-15 -5q-8 -1 -13 -7M-13 -10q-6 -4 -9 -12M-8 -14q-2 -6 -3 -13M-2 -15q1 -5 2 -10" ${k} stroke-width="3"/>` +
      `<path d="M-12 11l-4 5M-6 14l-2 5M0 15l0 5" ${k} stroke-width="1.8"/>`;
    case 'kolorowe': return `<path d="M-15 -6q-6 -2 -10 -8M-12 -11q-4 -4 -6 -11M-6 -14q-1 -5 -1 -10" ${k} stroke-width="3"/>`;
    default: return '';
  }
}
function kreskaRysuj(rodzaj, kolor) {
  switch (rodzaj) {
    case 'cienka': return `<path d="M-17 -2C-14 -16 8 -21 17 -8" fill="none" stroke="${kolor}" stroke-width="5" stroke-linecap="round"/>`;
    case 'skrzydelko': return `<path d="M-17 -2C-14 -16 8 -21 17 -8C6 -16 -10 -14 -16 -4L-27 -12Z" fill="${kolor}" stroke="${kolor}" stroke-width="3" stroke-linejoin="round"/>`;
    case 'kocia': return `<path d="M-17 -1C-14 -17 8 -23 18 -9C6 -17 -10 -14 -15 -3L-31 -15Z" fill="${kolor}" stroke="${kolor}" stroke-width="3.5" stroke-linejoin="round"/>` +
      `<path d="M-17 2Q-4 14 12 10" fill="none" stroke="${kolor}" stroke-width="2.4" stroke-linecap="round"/>`;
    case 'graficzna': return `<path d="M-17 -2C-14 -16 8 -21 17 -8C6 -16 -10 -14 -16 -4L-27 -12Z" fill="${kolor}" stroke="${kolor}" stroke-width="3"/>` +
      `<path d="M-14 -20Q0 -30 16 -18" fill="none" stroke="${kolor}" stroke-width="2.6" stroke-linecap="round"/><circle cx="-24" cy="-20" r="2.4" fill="${kolor}"/>`;
    default: return '';
  }
}

export const OCZY = [
  { id: 'duze', nazwa: 'Duże' },
  { id: 'anime', nazwa: 'Anime' },
  { id: 'migdalowe', nazwa: 'Migdałowe' },
  { id: 'kocie', nazwa: 'Kocie', tagi: ['kot', 'halloween'] },
  { id: 'senne', nazwa: 'Senne' },
  { id: 'gwiazdki', nazwa: 'Gwiazdki', tagi: ['gwiazda', 'kosmos'] },
  { id: 'serduszka', nazwa: 'Zakochane', tagi: ['slodka'] },
  { id: 'mrugniecie', nazwa: 'Oczko' },
  { id: 'zamkniete', nazwa: 'Uśmiechnięte' },
  { id: 'swiecace', nazwa: 'Świecące', tagi: ['halloween', 'duch'] },
  { id: 'spirale', nazwa: 'Hipnoza', tagi: ['halloween', 'zombie'] },
].map(o => ({ ...o, k: ['#5b8def'] }));

function jednoOko(p, styl, teczowka, stan, strona) {
  const skora = skoraZ(stan);
  // rzęsy i kreska to osobne kategorie, ale rysuje je oko – kolor może nie być zapisany, gdy wybrano „bez”
  const rz = { id: stan.w.rzesy?.id || 'naturalne', k: [stan.w.rzesy?.k?.[0] || '#2a1a2e'] };
  const kr = { id: stan.w.kreska?.id || 'brak', k: [stan.w.kreska?.k?.[0] || '#1b1020'] };
  const linia = '#2a1a2e';
  const zamkniete = styl === 'zamkniete' || (styl === 'mrugniecie' && strona === -1);
  if (zamkniete) {
    return `<path d="M-15 2Q0 -12 15 0" fill="none" stroke="${linia}" stroke-width="3.6" stroke-linecap="round"/>` +
      rzesyRysuj(rz.id === 'brak' ? 'brak' : 'naturalne', rz.k[0]);
  }
  const ciemna = ciemniej(teczowka, 0.55), jasna = jasniej(teczowka, 0.45);
  const grad = p.gradient(ciemna, jasna);
  let bialko, tecz, zrenica = '', blyski = '', powieka;
  switch (styl === 'mrugniecie' ? 'duze' : styl) {
    case 'anime':
      bialko = 'M-16 -2C-16 -18 16 -20 16 -2C16 14 6 22 0 22C-8 22 -16 14 -16 -2Z';
      tecz = `<ellipse cx="1" cy="3" rx="12" ry="16" fill="${grad}"/>`;
      zrenica = `<ellipse cx="1" cy="5" rx="5.5" ry="8" fill="#1b0f22"/>`;
      blyski = `<ellipse cx="-4" cy="-4" rx="4.5" ry="5.5" fill="#fff"/><circle cx="6" cy="11" r="2.2" fill="#fff"/><path d="M-8 12q6 6 14 2" stroke="${jasniej(teczowka, 0.7)}" stroke-width="2" fill="none" opacity=".8"/>`;
      powieka = 'M-18 -1C-16 -20 12 -24 18 -6';
      break;
    case 'migdalowe':
      bialko = 'M-17 0C-12 -14 10 -16 17 -3C10 10 -8 12 -17 0Z';
      tecz = `<circle cx="1" cy="-1" r="10.5" fill="${grad}"/>`;
      zrenica = `<circle cx="1" cy="-1" r="5" fill="#1b0f22"/>`;
      blyski = `<circle cx="-3" cy="-5" r="3" fill="#fff"/><circle cx="5" cy="3" r="1.4" fill="#fff"/>`;
      powieka = 'M-18 1C-13 -15 10 -18 18 -3';
      break;
    case 'kocie':
      bialko = 'M-19 -5C-10 -17 10 -14 17 2C8 10 -10 10 -19 -5Z';
      tecz = `<circle cx="0" cy="-1" r="11" fill="${grad}"/>`;
      zrenica = `<ellipse cx="0" cy="-1" rx="2.4" ry="9.5" fill="#1b0f22"/>`;
      blyski = `<circle cx="-4" cy="-5" r="2.6" fill="#fff"/>`;
      powieka = 'M-20 -4C-10 -18 10 -15 18 2';
      break;
    default:
      bialko = 'M-15 0C-15 -22 15 -22 15 0C15 12 8 17 0 17C-8 17 -15 12 -15 0Z';
      tecz = `<circle cx="1" cy="2" r="12" fill="${grad}"/>`;
      zrenica = `<circle cx="1" cy="3" r="5.6" fill="#1b0f22"/>`;
      blyski = `<circle cx="-4" cy="-3" r="3.8" fill="#fff"/><circle cx="5" cy="8" r="1.7" fill="#fff"/>`;
      powieka = 'M-17 -2C-14 -16 8 -21 17 -8';
  }
  if (styl === 'gwiazdki') { zrenica = `<path d="${gwiazda(1, 2, 7.5)}" fill="#1b0f22"/>`; blyski = `<path d="${blysk(-4, -4, 5)}" fill="#fff"/><circle cx="6" cy="9" r="1.6" fill="#fff"/>`; }
  if (styl === 'serduszka') { zrenica = `<path d="${serce(1, 3, 7)}" fill="#1b0f22"/>`; tecz = `<circle cx="1" cy="2" r="12" fill="${p.gradient('#c2185b', '#ff8fb8')}"/>`; }
  if (styl === 'swiecace') {
    tecz = `<circle cx="1" cy="2" r="13" fill="${p.promienisty(jasniej(teczowka, 0.75), teczowka, 1, 1)}"/>`;
    zrenica = ''; blyski = `<circle cx="-4" cy="-3" r="3" fill="#fff" opacity=".9"/>`;
  }
  if (styl === 'spirale') {
    tecz = `<circle cx="0" cy="1" r="12" fill="#fff"/>`;
    zrenica = `<path d="M0 1m0 -1a1 1 0 0 1 2 1a3 3 0 0 1 -5 1a5 5 0 0 1 8 -3a7 7 0 0 1 -10 7a9 9 0 0 1 2 -14" fill="none" stroke="${teczowka}" stroke-width="2.2" stroke-linecap="round"/>`;
    blyski = '';
  }
  const klip = p.id('oko');
  p.defs.push(`<clipPath id="${klip}"><path d="${bialko}"/></clipPath>`);
  let s = `<path d="${bialko}" fill="#fffdfd"/>` +
    `<g clip-path="url(#${klip})">${tecz}${zrenica}${blyski}<path d="${bialko}" fill="none" stroke="#3a2140" stroke-opacity=".18" stroke-width="7"/></g>` +
    `<path d="M-11 13Q0 19 10 13" fill="none" stroke="${linia}" stroke-width="1.4" opacity=".35"/>`;
  if (styl === 'senne') {
    // powieka w kolorze skóry zasłania górę oka
    s += `<path d="M-19 -22L19 -22L19 -3C8 -7 -8 -7 -19 -2Z" fill="${skora}"/>`;
    powieka = 'M-18 -2C-8 -8 8 -8 18 -3';
  }
  s += `<path d="${powieka}" fill="none" stroke="${linia}" stroke-width="3.6" stroke-linecap="round"/>`;
  s += kreskaRysuj(kr.id, kr.k[0]);
  s += rzesyRysuj(rz.id, rz.k[0]);
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
].map(r => ({ k: ['#2a1a2e'], ...r }));

export const KRESKA = [
  { id: 'brak', nazwa: 'Bez kreski' },
  { id: 'cienka', nazwa: 'Cienka' },
  { id: 'skrzydelko', nazwa: 'Skrzydełko', tagi: ['gala', 'gwiazda'] },
  { id: 'kocia', nazwa: 'Kocia', tagi: ['kot', 'halloween', 'wampir'] },
  { id: 'graficzna', nazwa: 'Graficzna', tagi: ['gwiazda'] },
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
].map(c => ({ k: ['#ff9ec7', '#ffd6e8'], ...c }));

export function rysujCienie(p, w) {
  if (w.id === 'brak') return {};
  const [c1, c2] = w.k;
  const op = { delikatne: 0.6, mocne: 0.95, dwukolorowe: 0.9, smokey: 0.9, brokatowe: 0.85, teczowe: 0.95 }[w.id] || 0.7;
  let wyp;
  if (w.id === 'dwukolorowe' || w.id === 'teczowe') {
    const id = p.id('cp');
    p.defs.push(`<linearGradient id="${id}" x1="1" x2="0"><stop offset="0" stop-color="${c1}"/>${w.id === 'teczowe' ? '<stop offset=".5" stop-color="#ffd23f"/>' : ''}<stop offset="1" stop-color="${c2}"/></linearGradient>`);
    wyp = `url(#${id})`;
  } else wyp = p.gradient(mieszaj(c1, c2, 0.5), c1, 0, 1);
  // od rzęs prawie do brwi – wąski pasek ginął pod kreską powieki
  const powieka = 'M-20 0C-19 -30 14 -38 25 -12C14 -24 -8 -22 -17 0Z';
  let s = `<path d="${powieka}" fill="${wyp}" opacity="${op}"/>`;
  if (w.id === 'smokey') s += `<path d="M-17 4Q0 24 16 8Q2 16 -17 4Z" fill="${c1}" opacity=".55"/>`;
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
  return { twarzNad: para(() => `<path d="${d}" fill="${w.k[0]}" stroke="${w.k[0]}" stroke-width="1.6" stroke-linejoin="round"/>`, 150) };
}

/* ---------- nos ---------- */
export const NOS = [
  { id: 'kropka', nazwa: 'Kropeczka' },
  { id: 'haczyk', nazwa: 'Kreseczka' },
  { id: 'guziczek', nazwa: 'Guziczek' },
  { id: 'kotek', nazwa: 'Koci', k: ['#ff8fb1'], tagi: ['kot', 'halloween'] },
  { id: 'czaszka', nazwa: 'Czaszki', k: ['#1b1020'], tagi: ['halloween', 'szkielet'] },
];
export function rysujNos(p, w, stan) {
  const o = obrysSkory(skoraZ(stan));
  switch (w.id) {
    case 'haczyk': return { twarzNad: `<path d="M299 195Q306 205 298 209" fill="none" stroke="${o}" stroke-width="2.2" stroke-linecap="round"/>` };
    case 'guziczek': return { twarzNad: `<ellipse cx="300" cy="204" rx="6" ry="4.4" fill="${o}" opacity=".18"/><circle cx="297" cy="206" r="1.4" fill="${o}"/><circle cx="303" cy="206" r="1.4" fill="${o}"/><circle cx="299" cy="201" r="1.4" fill="#fff" opacity=".7"/>` };
    case 'kotek': return { twarzNad: `<path d="M293 201L307 201L300 210Z" fill="${w.k?.[0] || '#ff8fb1'}" stroke="${ciemniej(w.k?.[0] || '#ff8fb1', 0.4)}" stroke-width="1.6" stroke-linejoin="round"/><path d="M300 210L300 214" stroke="${o}" stroke-width="1.6"/>` };
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
].map(u => ({ k: ['#e8848f'], ...u }));

export function rysujUsta(p, w, stan) {
  const c = w.k[0], o = ciemniej(c, 0.45), wn = '#7a1f3d', y = 226;
  const skora = skoraZ(stan);
  const usta = (dol) => `<path d="M285 ${y - 3}Q292 ${y - 7} 300 ${y - 4}Q308 ${y - 7} 315 ${y - 3}Q300 ${y} 285 ${y - 3}Z" fill="${c}" stroke="${o}" stroke-width="1.4" stroke-linejoin="round"/>` +
    `<path d="M285 ${y - 3}Q300 ${y + 2} 315 ${y - 3}Q308 ${y + dol} 300 ${y + dol}Q292 ${y + dol} 285 ${y - 3}Z" fill="${c}" stroke="${o}" stroke-width="1.4" stroke-linejoin="round"/>` +
    `<ellipse cx="303" cy="${y + dol - 4}" rx="4" ry="1.6" fill="#fff" opacity=".45"/>`;
  const otwarte = (h, extra = '') => `<path d="M283 ${y - 5}Q300 ${y} 317 ${y - 5}Q313 ${y + h} 300 ${y + h + 1}Q287 ${y + h} 283 ${y - 5}Z" fill="${wn}" stroke="${c}" stroke-width="3.2" stroke-linejoin="round"/>` +
    `<path d="M287 ${y - 3}Q300 ${y + 1} 313 ${y - 3}L312 ${y + 2}Q300 ${y + 5} 288 ${y + 2}Z" fill="#fff"/>` + extra +
    `<ellipse cx="300" cy="${y + h - 3}" rx="7" ry="4" fill="#ff7b9c"/>`;
  let s;
  switch (w.id) {
    case 'szeroki': s = otwarte(13); break;
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
  }
  return { twarzPod: pod, twarzNad: nad };
}

