// Dodatki: nakrycia głowy, okulary, biżuteria, rękawiczki, przedmioty w dłoni, skrzydła i ogony.
import { obie, obrys, ciemniej, jasniej, mieszaj, gwiazda, serce, blysk, nietoperz, dynia, kwiatek } from './narzedzia.js';
import { CHWYT } from './cialo.js';

const zl = '#ffd23f', zlO = '#b8860b';
const opaska = (c) => `<path d="M226 136Q228 78 300 74Q372 78 374 136" fill="none" stroke="${obrys(c)}" stroke-width="10" stroke-linecap="round"/><path d="M226 136Q228 78 300 74Q372 78 374 136" fill="none" stroke="${c}" stroke-width="6" stroke-linecap="round"/>`;

/* ---------- NAKRYCIA GŁOWY ---------- */
export const NAKRYCIA = [
  {
    id: 'czarownicy', nazwa: 'Kapelusz czarownicy', k: ['#2b1d3a', '#7b2cbf'], tagi: ['halloween', 'czarownica'],
    rysuj: (p, w) => ({
      czapka: `<ellipse cx="300" cy="108" rx="122" ry="24" fill="${w.wyp}" stroke="${w.o}" stroke-width="2.6"/>` +
        p.ksztalt('M240 106C252 70 268 40 290 22C310 6 346 0 386 14C354 20 334 30 326 52C320 72 342 96 360 106Z', w.wyp, w.o) +
        `<path d="M246 90Q300 102 354 90L360 106Q300 118 240 106Z" fill="${w.k[1]}" stroke="${obrys(w.k[1])}" stroke-width="2"/>` +
        `<rect x="289" y="94" width="22" height="16" rx="2" fill="none" stroke="${zl}" stroke-width="3"/>` +
        `<path d="M178 108Q300 152 422 108Q300 126 178 108Z" fill="${w.wyp}" stroke="${w.o}" stroke-width="2.4" stroke-linejoin="round"/>` +
        `<path d="${gwiazda(312, 52, 7)}" fill="${zl}"/><path d="${gwiazda(286, 74, 4.5)}" fill="${zl}"/>`,
    }),
  },
  {
    id: 'kocieUszy', nazwa: 'Kocie uszy', k: ['#1b1020', '#ff8fb1'], tagi: ['halloween', 'kot'],
    rysuj: (p, w) => ({ czapka: opaska(w.k[0]) + obie(`<path d="M236 106L238 38L286 80Z" fill="${w.k[0]}" stroke="${w.o}" stroke-width="2.6" stroke-linejoin="round"/><path d="M245 96L246 56L274 80Z" fill="${w.k[1]}"/>`) }),
  },
  {
    id: 'krolicze', nazwa: 'Uszy króliczka', k: ['#ffffff', '#ffb3d9'], tagi: ['slodka'],
    rysuj: (p, w) => ({ czapka: opaska(w.k[0]) + obie(`<ellipse cx="266" cy="30" rx="18" ry="54" transform="rotate(-14 266 80)" fill="${w.k[0]}" stroke="${w.o}" stroke-width="2.6"/><ellipse cx="266" cy="34" rx="8" ry="40" transform="rotate(-14 266 80)" fill="${w.k[1]}"/>`) }),
  },
  {
    id: 'rogi', nazwa: 'Różki diabełka', k: ['#e5383b', '#ffd23f'], tagi: ['halloween', 'diabel'],
    rysuj: (p, w) => ({ czapka: opaska(w.k[0]) + obie(`<path d="M256 96C244 72 246 50 260 36C260 56 272 74 282 86Z" fill="${p.gradient(jasniej(w.k[0], 0.3), w.k[0])}" stroke="${w.o}" stroke-width="2.6" stroke-linejoin="round"/><path d="M256 70Q254 56 259 46" stroke="#fff" stroke-width="2.4" fill="none" opacity=".5" stroke-linecap="round"/>`) }),
  },
  {
    id: 'korona', nazwa: 'Korona', k: [zl, '#e5383b'], tagi: ['ksiezniczka', 'gala'],
    rysuj: (p, w) => ({
      czapka: p.ksztalt('M250 98L246 44L270 70L285 34L300 62L315 34L330 70L354 44L350 98Q300 88 250 98Z', p.gradient(jasniej(w.k[0], 0.4), w.k[0]), w.o) +
        `<circle cx="300" cy="84" r="7" fill="${w.k[1]}" stroke="${obrys(w.k[1])}" stroke-width="1.6"/><circle cx="270" cy="88" r="4.5" fill="#4cc9f0"/><circle cx="330" cy="88" r="4.5" fill="#4cc9f0"/>` +
        [[246, 44], [285, 34], [315, 34], [354, 44]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4" fill="#fff" stroke="${w.o}" stroke-width="1.2"/>`).join(''),
    }),
  },
  {
    id: 'tiara', nazwa: 'Tiara', k: ['#e0e6f0', '#ff8fc7'], tagi: ['ksiezniczka', 'gala', 'slodka'],
    rysuj: (p, w) => ({
      czapka: `<path d="M246 106Q300 80 354 106L348 112Q300 90 252 112Z" fill="${w.k[0]}" stroke="${w.o}" stroke-width="2"/>` +
        p.ksztalt('M282 94L300 56L318 94Q300 88 282 94Z', w.k[0], w.o) + obie(p.ksztalt('M262 102L270 76L282 96Z', w.k[0], w.o)) +
        `<path d="${serce(300, 80, 7)}" fill="${w.k[1]}"/><circle cx="270" cy="92" r="3.4" fill="${w.k[1]}"/><circle cx="330" cy="92" r="3.4" fill="${w.k[1]}"/>` +
        `<path d="${blysk(318, 62, 6)}" fill="#fff"/>`,
    }),
  },
  {
    id: 'wianek', nazwa: 'Wianek', k: ['#ff8fc7', '#fff3b0'], tagi: ['wrozka', 'slodka', 'plaza'],
    rysuj: (p, w) => {
      let s = '';
      for (let i = 0; i < 9; i++) {
        const k = (195 + i * 18.75) * Math.PI / 180, x = 300 + Math.cos(k) * 80, y = 118 + Math.sin(k) * 50;
        s += `<ellipse cx="${(x + 8).toFixed(1)}" cy="${(y + 4).toFixed(1)}" rx="9" ry="4.5" transform="rotate(${i * 20 - 70} ${x} ${y})" fill="#5fd068" stroke="#2d7a3a" stroke-width="1.4"/>`;
      }
      for (let i = 0; i < 9; i++) {
        const k = (195 + i * 18.75) * Math.PI / 180;
        s += kwiatek(300 + Math.cos(k) * 80, 118 + Math.sin(k) * 50, i % 2 ? 11 : 13, i % 2 ? w.k[1] : w.k[0]);
      }
      return { czapka: s };
    },
  },
  {
    id: 'kokarda', nazwa: 'Wielka kokarda', k: ['#ff5d8f', '#ffffff'], tagi: ['slodka', 'szkola'],
    rysuj: (p, w) => ({
      czapka: p.ksztalt('M346 86C318 54 296 84 314 106Z', w.wyp, w.o) + p.ksztalt('M346 86C374 54 396 84 378 106Z', w.wyp, w.o) +
        p.ksztalt('M340 90L326 128L338 122L346 132L348 92Z', w.wyp, w.o, { cien: false }) +
        `<circle cx="346" cy="88" r="9" fill="${w.wyp}" stroke="${w.o}" stroke-width="2.4"/>` +
        (w.wz === 'gladki' || !w.wz ? `<circle cx="318" cy="84" r="3" fill="${w.k[1]}"/><circle cx="374" cy="84" r="3" fill="${w.k[1]}"/><circle cx="326" cy="96" r="2.4" fill="${w.k[1]}"/>` : ''),
    }),
  },
  {
    id: 'aureola', nazwa: 'Aureola', k: [zl, '#fff3b0'], tagi: ['aniol', 'wrozka'],
    rysuj: (p, w) => ({ czapka: `<ellipse cx="300" cy="46" rx="70" ry="22" fill="${p.promienisty(w.k[1], w.k[1], 0.7, 0)}"/><ellipse cx="300" cy="46" rx="56" ry="13" fill="none" stroke="${w.o}" stroke-width="10"/><ellipse cx="300" cy="46" rx="56" ry="13" fill="none" stroke="${w.k[0]}" stroke-width="6"/>` }),
  },
  {
    id: 'czapka', nazwa: 'Czapka z pomponem', k: ['#4cc9f0', '#ffffff'], tagi: ['zima'],
    rysuj: (p, w) => ({
      czapka: p.ksztalt('M224 124C220 46 380 46 376 124Z', w.wyp, w.o) +
        p.ksztalt('M220 112Q300 98 380 112L382 140Q300 126 218 140Z', w.k[1], obrys(w.k[1]), { cien: false }) +
        [236, 252, 268, 284, 300, 316, 332, 348, 364].map(x => `<path d="M${x} ${108 - (x === 300 ? 2 : 0)}L${x} ${134}" stroke="${obrys(w.k[1])}" stroke-width="1.2" opacity=".5"/>`).join('') +
        `<circle cx="300" cy="44" r="22" fill="${w.k[1]}" stroke="${obrys(w.k[1])}" stroke-width="2.4"/><circle cx="293" cy="37" r="7" fill="#fff" opacity=".5"/>`,
    }),
  },
  {
    id: 'beret', nazwa: 'Beret', k: ['#c1121f', '#1b1020'], tagi: ['paryz'],
    rysuj: (p, w) => ({ czapka: `<g transform="rotate(-12 290 84)">${p.ksztalt('M206 92C206 50 380 46 382 88C384 104 350 108 300 108C250 108 206 106 206 92Z', w.wyp, w.o)}<path d="M296 52q2 -12 10 -10" stroke="${w.o}" stroke-width="4" stroke-linecap="round" fill="none"/></g>` }),
  },
  {
    id: 'slomkowy', nazwa: 'Kapelusz słomkowy', k: ['#f2d38a', '#ff8fc7'], tagi: ['plaza', 'paryz'],
    rysuj: (p, w) => ({
      czapka: `<ellipse cx="300" cy="104" rx="142" ry="28" fill="${w.wyp}" stroke="${w.o}" stroke-width="2.6"/>` +
        p.ksztalt('M234 104C234 46 366 46 366 104Z', w.wyp, w.o) + `<path d="M236 90Q300 98 364 90L366 104Q300 112 234 104Z" fill="${w.k[1]}"/>` +
        `<path d="M160 104Q300 150 440 104Q300 124 160 104Z" fill="${w.wyp}" stroke="${w.o}" stroke-width="2.4"/>` + kwiatek(352, 96, 13, w.k[1]),
    }),
  },
  {
    id: 'cylinder', nazwa: 'Mini cylinder', k: ['#1b1020', '#c1121f'], tagi: ['halloween', 'wampir', 'gala'],
    rysuj: (p, w) => ({
      czapka: `<g transform="rotate(14 336 92)"><ellipse cx="336" cy="94" rx="40" ry="9" fill="${w.wyp}" stroke="${w.o}" stroke-width="2.4"/>` +
        p.ksztalt('M310 94L314 36L358 36L362 94Z', w.wyp, w.o) + `<ellipse cx="336" cy="36" rx="22" ry="5" fill="${jasniej(w.k[0], 0.15)}" stroke="${w.o}" stroke-width="2"/>` +
        `<path d="M312 78L360 78L361 90L311 90Z" fill="${w.k[1]}"/><path d="M314 84q-16 -20 -26 -6q10 2 26 6zM312 86q-20 6 -14 20q6 -10 14 -20z" fill="${w.k[1]}" stroke="${obrys(w.k[1])}" stroke-width="1.2"/></g>`,
    }),
  },
  {
    id: 'jednorozec', nazwa: 'Róg jednorożca', k: [zl, '#ff8fc7'], tagi: ['wrozka', 'slodka'],
    rysuj: (p, w) => ({
      czapka: opaska(w.k[1]) + p.ksztalt('M286 100L300 14L314 100Z', p.gradient(jasniej(w.k[0], 0.5), w.k[0]), w.o) +
        `<path d="M288 88L310 76M290 70L307 60M293 52L304 44M296 34L302 30" stroke="${w.o}" stroke-width="2" opacity=".6"/>` +
        kwiatek(262, 94, 11, w.k[1]) + kwiatek(338, 94, 11, '#c77dff') + kwiatek(246, 108, 8, '#fff3b0'),
    }),
  },
  {
    id: 'nietoperz', nazwa: 'Opaska nietoperz', k: ['#1b1020', '#7b2cbf'], tagi: ['halloween', 'wampir'],
    rysuj: (p, w) => ({ czapka: opaska(w.k[1]) + `<path d="${nietoperz(300, 68, 3.4)}" fill="${w.k[0]}" stroke="${jasniej(w.k[0], 0.3)}" stroke-width="1"/><circle cx="296" cy="64" r="1.6" fill="#ffd23f"/><circle cx="304" cy="64" r="1.6" fill="#ffd23f"/>` }),
  },
  {
    id: 'pajak', nazwa: 'Opaska z pajączkiem', k: ['#7b2cbf', '#1b1020'], tagi: ['halloween', 'pajak', 'czarownica'],
    rysuj: (p, w) => ({
      czapka: opaska(w.k[0]) + `<path d="M356 92L376 190" stroke="#e8e0f0" stroke-width="1.2"/>` +
        `<g stroke="${w.k[1]}" stroke-width="2" fill="none" stroke-linecap="round"><path d="M368 196q-12 -8 -16 -2M368 202q-14 -2 -16 6M370 206q-10 4 -10 12M384 196q12 -8 16 -2M384 202q14 -2 16 6M382 206q10 4 10 12"/></g>` +
        `<ellipse cx="376" cy="202" rx="10" ry="12" fill="${w.k[1]}"/><circle cx="376" cy="190" r="7" fill="${w.k[1]}"/><circle cx="373" cy="189" r="2" fill="#fff"/><circle cx="379" cy="189" r="2" fill="#fff"/>`,
    }),
  },
  {
    id: 'dynia', nazwa: 'Czapka dynia', k: ['#ff8a1f', '#5b7a2a'], tagi: ['halloween', 'dynia'],
    rysuj: (p, w) => ({
      czapka: p.ksztalt('M222 128C218 48 382 48 378 128Q300 114 222 128Z', w.wyp, w.o) +
        `<path d="M262 120Q256 80 280 58M300 116L300 52M338 120Q344 80 320 58" fill="none" stroke="${w.o}" stroke-width="2" opacity=".6"/>` +
        `<path d="M298 54Q294 30 310 22" stroke="${w.k[1]}" stroke-width="8" stroke-linecap="round" fill="none"/><path d="M306 36Q330 24 340 40Q322 50 306 36Z" fill="${w.k[1]}" stroke="${obrys(w.k[1])}" stroke-width="1.6"/>`,
    }),
  },
];

/* ---------- OKULARY ---------- */
const OKO_L = 272, OKO_P = 328, OKO_Y = 181;
const zauszniki = c => `<path d="M${OKO_L - 24} 176L236 170M${OKO_P + 24} 176L364 170" stroke="${c}" stroke-width="3"/>`;
export const OKULARY = [
  { id: 'okragle', nazwa: 'Okrągłe', k: ['#c58556', '#bfe9ff'], tagi: ['szkola', 'paryz'], rysuj: (p, w) => ({ okulary: zauszniki(w.k[0]) + [OKO_L, OKO_P].map(x => `<circle cx="${x}" cy="${OKO_Y}" r="23" fill="${w.k[1]}" fill-opacity=".25" stroke="${w.k[0]}" stroke-width="3.6"/>`).join('') + `<path d="M295 178Q300 172 305 178" stroke="${w.k[0]}" stroke-width="3" fill="none"/>` }) },
  { id: 'serca', nazwa: 'Serduszka', k: ['#ff4d8d', '#ff8fc7'], tagi: ['slodka', 'gwiazda', 'plaza'], rysuj: (p, w) => ({ okulary: zauszniki(w.k[0]) + [OKO_L, OKO_P].map(x => `<path d="${serce(x, OKO_Y - 2, 21)}" fill="${w.k[1]}" fill-opacity=".55" stroke="${w.k[0]}" stroke-width="3.6"/>`).join('') + `<path d="M294 176Q300 170 306 176" stroke="${w.k[0]}" stroke-width="3" fill="none"/>` }) },
  { id: 'gwiazdy', nazwa: 'Gwiazdy', k: ['#ffd23f', '#c77dff'], tagi: ['gwiazda', 'kosmos'], rysuj: (p, w) => ({ okulary: zauszniki(w.k[0]) + [OKO_L, OKO_P].map(x => `<path d="${gwiazda(x, OKO_Y, 30, 5, 0.55)}" fill="${w.k[1]}" fill-opacity=".45" stroke="${w.k[0]}" stroke-width="3.4" stroke-linejoin="round"/>`).join('') }) },
  { id: 'kocie', nazwa: 'Kocie oko', k: ['#1b1020', '#ff8fc7'], tagi: ['gwiazda', 'kot', 'paryz'], rysuj: (p, w) => ({ okulary: zauszniki(w.k[0]) + obie(`<path d="M249 170C262 164 286 166 296 176C296 192 286 202 272 202C258 202 248 192 246 176L240 160Z" fill="${w.k[1]}" fill-opacity=".3" stroke="${w.k[0]}" stroke-width="3.6" stroke-linejoin="round"/>`) }) },
  { id: 'sloneczne', nazwa: 'Przeciwsłoneczne', k: ['#1b1020', '#3a2d4a'], tagi: ['plaza', 'gwiazda'], rysuj: (p, w) => ({ okulary: zauszniki(w.k[0]) + obie(`<path d="M246 172L296 172C296 196 288 204 272 204C254 204 246 194 246 172Z" fill="${w.k[1]}" stroke="${w.k[0]}" stroke-width="3.4" stroke-linejoin="round"/><path d="M254 178L264 178L258 192Z" fill="#fff" opacity=".4"/>`) + `<path d="M296 174L304 174" stroke="${w.k[0]}" stroke-width="3.4"/>` }) },
];

/* ---------- SZYJA ---------- */
export const NASZYJNIKI = [
  { id: 'perly', nazwa: 'Perły', k: ['#fff8f0', '#e8d8ff'], tagi: ['gala', 'paryz', 'ksiezniczka'], rysuj: (p, w) => { let s = ''; for (let i = 0; i <= 12; i++) { const t = i / 12, x = 280 + 40 * t, y = 282 + Math.sin(t * Math.PI) * 26; s += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4.2" fill="${w.k[0]}" stroke="${mieszaj(w.k[0], '#8a7a9a', 0.5)}" stroke-width="1"/>`; } return { szyja: s }; } },
  { id: 'choker', nazwa: 'Choker', k: ['#1b1020', '#c1121f'], tagi: ['halloween', 'wampir', 'gwiazda'], rysuj: (p, w) => ({ szyja: `<path d="M285 264Q300 270 315 264L315 274Q300 280 285 274Z" fill="${w.k[0]}"/><path d="M300 278l-6 8l6 8l6 -8Z" fill="${w.k[1]}" stroke="${obrys(w.k[1])}" stroke-width="1.2"/>` }) },
  { id: 'serce', nazwa: 'Serduszko', k: [zl, '#ff4d8d'], tagi: ['slodka', 'codzienna'], rysuj: (p, w) => ({ szyja: `<path d="M282 282Q300 318 318 282" fill="none" stroke="${w.k[0]}" stroke-width="1.8"/><path d="${serce(300, 314, 8)}" fill="${w.k[1]}" stroke="${w.k[0]}" stroke-width="2"/>` }) },
  { id: 'dynia', nazwa: 'Dyniowy wisiorek', k: ['#1b1020', '#ff8a1f'], tagi: ['halloween', 'dynia'], rysuj: (p, w) => ({ szyja: `<path d="M282 282Q300 316 318 282" fill="none" stroke="${w.k[0]}" stroke-width="1.8"/>` + dynia(300, 316, 9, w.k[1], true) }) },
  { id: 'ksiezyc', nazwa: 'Księżyc', k: [zl, '#c77dff'], tagi: ['czarownica', 'kosmos', 'halloween'], rysuj: (p, w) => ({ szyja: `<path d="M282 282Q300 314 318 282" fill="none" stroke="${w.k[0]}" stroke-width="1.8"/><path d="M296 304a11 11 0 1 0 12 14a8 8 0 1 1 -12 -14Z" fill="${w.k[0]}" stroke="${zlO}" stroke-width="1.4"/><path d="${gwiazda(306, 311, 3)}" fill="${w.k[1]}"/>` }) },
  { id: 'dzwonek', nazwa: 'Obroża z dzwonkiem', k: ['#e5383b', zl], tagi: ['kot', 'halloween'], rysuj: (p, w) => ({ szyja: `<path d="M285 264Q300 270 315 264L315 274Q300 280 285 274Z" fill="${w.k[0]}" stroke="${obrys(w.k[0])}" stroke-width="1"/><circle cx="300" cy="284" r="7" fill="${w.k[1]}" stroke="${zlO}" stroke-width="1.6"/><path d="M294 286L306 286M300 288L300 291" stroke="${zlO}" stroke-width="1.4"/>` }) },
  { id: 'muszka', nazwa: 'Muszka', k: ['#1b1020', '#ffffff'], tagi: ['gala', 'szkola'], rysuj: (p, w) => ({ szyja: `<path d="M300 288L280 278L280 298ZM300 288L320 278L320 298Z" fill="${w.wyp}" stroke="${w.o}" stroke-width="2" stroke-linejoin="round"/><circle cx="300" cy="288" r="4.5" fill="${w.wyp}" stroke="${w.o}" stroke-width="1.6"/>` }) },
  {
    id: 'szalik', nazwa: 'Szalik', k: ['#e5383b', '#ffffff'], wz: 'paski', tagi: ['zima'],
    rysuj: (p, w) => ({ szyja: p.ksztalt('M276 266Q300 284 324 266L330 296Q300 316 270 296Z', w.wyp, w.o) + p.ksztalt('M272 292L262 380L290 384L292 304Z', w.wyp, w.o) + `<path d="M262 380L260 392M268 381L267 393M275 382L274 394M282 383L282 395M289 384L289 395" stroke="${w.k[0]}" stroke-width="2.4" stroke-linecap="round"/>` }),
  },
];

/* ---------- KOLCZYKI ---------- */
const UCHO = [232, 197];
const para = s => obie(s);
export const KOLCZYKI = [
  { id: 'kolka', nazwa: 'Kółka', k: [zl], tagi: ['gwiazda', 'codzienna'], rysuj: (p, w) => ({ kolczyki: para(`<circle cx="${UCHO[0]}" cy="${UCHO[1] + 10}" r="10" fill="none" stroke="${w.k[0]}" stroke-width="2.8"/>`) }) },
  { id: 'perelki', nazwa: 'Perełki', k: ['#fff8f0'], tagi: ['gala', 'paryz'], rysuj: (p, w) => ({ kolczyki: para(`<circle cx="${UCHO[0]}" cy="${UCHO[1]}" r="4.5" fill="${w.k[0]}" stroke="#a89ab8" stroke-width="1"/>`) }) },
  { id: 'gwiazdki', nazwa: 'Gwiazdki', k: [zl], tagi: ['gwiazda', 'kosmos'], rysuj: (p, w) => ({ kolczyki: para(`<path d="M${UCHO[0]} ${UCHO[1]}L${UCHO[0]} ${UCHO[1] + 8}" stroke="${w.k[0]}" stroke-width="1.6"/><path d="${gwiazda(UCHO[0], UCHO[1] + 14, 7)}" fill="${w.k[0]}" stroke="${ciemniej(w.k[0], 0.3)}" stroke-width="1"/>`) }) },
  { id: 'serca', nazwa: 'Serduszka', k: ['#ff4d8d'], tagi: ['slodka'], rysuj: (p, w) => ({ kolczyki: para(`<path d="${serce(UCHO[0], UCHO[1] + 8, 6)}" fill="${w.k[0]}" stroke="${ciemniej(w.k[0], 0.3)}" stroke-width="1"/>`) }) },
  { id: 'dynie', nazwa: 'Dynie', k: ['#ff8a1f'], tagi: ['halloween', 'dynia'], rysuj: (p, w) => ({ kolczyki: para(`<path d="M${UCHO[0]} ${UCHO[1]}L${UCHO[0]} ${UCHO[1] + 6}" stroke="#5b7a2a" stroke-width="1.6"/>` + dynia(UCHO[0], UCHO[1] + 14, 7, w.k[0], true)) }) },
  { id: 'nietoperze', nazwa: 'Nietoperze', k: ['#1b1020'], tagi: ['halloween', 'wampir'], rysuj: (p, w) => ({ kolczyki: para(`<path d="M${UCHO[0]} ${UCHO[1]}L${UCHO[0]} ${UCHO[1] + 8}" stroke="${zl}" stroke-width="1.4"/><path d="${nietoperz(UCHO[0], UCHO[1] + 14, 0.9)}" fill="${w.k[0]}"/>`) }) },
  { id: 'krople', nazwa: 'Kropelki', k: ['#4cc9f0'], tagi: ['gala', 'syrena'], rysuj: (p, w) => ({ kolczyki: para(`<path d="M${UCHO[0]} ${UCHO[1]}L${UCHO[0]} ${UCHO[1] + 10}" stroke="${zl}" stroke-width="1.4"/><path d="M${UCHO[0]} ${UCHO[1] + 8}q-7 10 0 16q7 -6 0 -16Z" fill="${w.k[0]}" stroke="${ciemniej(w.k[0], 0.3)}" stroke-width="1"/>`) }) },
];

/* ---------- RĘKAWICZKI (dłoń w kolorze rękawiczki rysuje rdzeń) ---------- */
export const REKAWICZKI = [
  { id: 'dlugie', nazwa: 'Długie', k: ['#ffffff', '#ffffff'], tagi: ['gala', 'ksiezniczka'], rysuj: (p, w) => ({ rekawiczki: obie(p.ksztalt('M207 406C204 450 201 476 200 494L224 494C226 470 230 444 235 406Z', w.wyp, w.o)) }) },
  { id: 'koronkowe', nazwa: 'Koronkowe', k: ['#1b1020', '#4a3a5a'], tagi: ['halloween', 'wampir', 'gala'], rysuj: (p, w) => ({ rekawiczki: obie(p.ksztalt('M207 406C204 450 201 476 200 494L224 494C226 470 230 444 235 406Z', p.wzor('pajeczyna', w.k[0], w.k[1]), w.o)) }) },
  { id: 'krotkie', nazwa: 'Krótkie', k: ['#ff8fc7', '#ffffff'], tagi: ['slodka', 'zima'], rysuj: (p, w) => ({ rekawiczki: obie(`<path d="M200 486L225 486L225 494L200 494Z" fill="${w.k[1]}" stroke="${w.o}" stroke-width="1.6"/>`) }) },
  { id: 'lapki', nazwa: 'Kocie łapki', k: ['#1b1020', '#ff8fb1'], tagi: ['kot', 'halloween'], rysuj: () => ({}) },
];

/* ---------- W DŁONI ---------- */
const [hx, hy] = CHWYT;
export const WRECE = [
  {
    id: 'rozdzka', nazwa: 'Różdżka', k: ['#ffd23f', '#7b2cbf'], tagi: ['wrozka', 'czarownica', 'ksiezniczka'],
    rysuj: (p, w) => ({ wreka: `<path d="M${hx + 4} ${hy + 14}L176 420" stroke="${w.k[1]}" stroke-width="6" stroke-linecap="round"/><path d="${gwiazda(172, 410, 18)}" fill="${w.k[0]}" stroke="${obrys(w.k[0])}" stroke-width="2" stroke-linejoin="round"/>` + `<path d="${blysk(148, 392, 6)}" fill="${w.k[0]}"/><path d="${blysk(196, 386, 4)}" fill="#fff"/><path d="${blysk(152, 430, 3.5)}" fill="#fff"/>` }),
  },
  {
    id: 'miotla', nazwa: 'Miotła', k: ['#8b5a2b', '#e0b040'], tagi: ['halloween', 'czarownica'],
    rysuj: (p, w) => ({ wreka: `<path d="M232 300L194 700" stroke="${obrys(w.k[0])}" stroke-width="10" stroke-linecap="round"/><path d="M232 300L194 700" stroke="${w.k[0]}" stroke-width="6" stroke-linecap="round"/>` + p.ksztalt('M184 690L206 692L232 772L156 768Z', w.k[1], obrys(w.k[1])) + `<path d="M182 704L208 706" stroke="#7b2cbf" stroke-width="6"/><path d="M190 716L174 768M196 716L190 770M202 716L208 770M206 716L222 770" stroke="${obrys(w.k[1])}" stroke-width="1.4" opacity=".6"/>` }),
  },
  {
    id: 'koszyk', nazwa: 'Koszyk dynia', k: ['#ff8a1f', '#1b1020'], tagi: ['halloween', 'dynia'],
    rysuj: (p, w) => ({ wreka: `<path d="M182 576Q212 494 242 576" fill="none" stroke="${w.k[1]}" stroke-width="3.4"/>` + dynia(212, 596, 34, w.k[0], true) + `<path d="${gwiazda(198, 560, 5)}" fill="#ff5d8f"/><circle cx="222" cy="560" r="6" fill="#5fd068"/>` }),
  },
  {
    id: 'lizak', nazwa: 'Lizak', k: ['#ff5d8f', '#ffffff'], tagi: ['slodka', 'cukierki'],
    rysuj: (p, w) => ({ wreka: `<path d="M${hx} ${hy + 10}L194 436" stroke="#fff" stroke-width="5" stroke-linecap="round"/><path d="M${hx} ${hy + 10}L194 436" stroke="#d8d0e0" stroke-width="1" />` + `<circle cx="190" cy="412" r="30" fill="${w.k[0]}" stroke="${obrys(w.k[0])}" stroke-width="2.4"/><path d="M190 412m-3 0a3 3 0 0 1 6 0a7 7 0 0 1 -14 0a11 11 0 0 1 22 0a15 15 0 0 1 -30 0a19 19 0 0 1 38 0" fill="none" stroke="${w.k[1]}" stroke-width="4.5"/><ellipse cx="180" cy="400" rx="8" ry="5" fill="#fff" opacity=".45"/>` }),
  },
  {
    id: 'bukiet', nazwa: 'Bukiet', k: ['#ff5d8f', '#ffd23f'], tagi: ['gala', 'ksiezniczka', 'wrozka'],
    rysuj: (p, w) => ({ wreka: `<path d="M${hx} ${hy + 8}L190 470M${hx} ${hy + 8}L206 462M${hx} ${hy + 8}L222 470" stroke="#3a8a3a" stroke-width="3"/>` + kwiatek(186, 462, 14, w.k[0], w.k[1]) + kwiatek(212, 452, 15, w.k[1], '#fff') + kwiatek(232, 468, 12, '#c77dff') + kwiatek(198, 482, 11, '#fff') + `<path d="M196 494L228 494L216 530L206 530Z" fill="#fff4fa" stroke="#d8a8c8" stroke-width="2"/>` }),
  },
  {
    id: 'torebka', nazwa: 'Torebka', k: ['#ff8fc7', zl], tagi: ['codzienna', 'paryz', 'gwiazda'],
    rysuj: (p, w) => ({ wreka: `<path d="M192 552Q212 500 232 552" fill="none" stroke="${w.k[1]}" stroke-width="3.6"/>` + p.ksztalt('M182 552L242 552L248 600Q212 612 176 600Z', w.wyp, w.o) + `<path d="M182 566Q212 576 242 566" fill="none" stroke="${w.o}" stroke-width="2"/><circle cx="212" cy="572" r="4.5" fill="${w.k[1]}" stroke="${zlO}" stroke-width="1.4"/>` }),
  },
  {
    id: 'latarenka', nazwa: 'Latarenka', k: ['#2b1d3a', '#ffb84d'], tagi: ['halloween', 'czarownica', 'zima'],
    rysuj: (p, w) => ({ wreka: `<circle cx="212" cy="590" r="46" fill="${p.promienisty(w.k[1], w.k[1], 0.55, 0)}"/><path d="M212 ${hy + 10}L212 556" stroke="${w.k[0]}" stroke-width="2.4"/>` + `<path d="M196 556L228 556L224 566L200 566Z" fill="${w.k[0]}"/><rect x="198" y="566" width="28" height="40" rx="4" fill="${w.k[1]}" fill-opacity=".85" stroke="${w.k[0]}" stroke-width="3"/><path d="M212 566L212 606M198 586L226 586" stroke="${w.k[0]}" stroke-width="2"/><path d="M194 606L230 606L226 614L198 614Z" fill="${w.k[0]}"/><path d="M212 590q-5 -6 0 -12q5 6 0 12Z" fill="#fff"/>` }),
  },
  {
    id: 'balon', nazwa: 'Balonik', k: ['#ff4d8d', '#ffffff'], tagi: ['slodka', 'codzienna'],
    rysuj: (p, w) => ({ wreka: `<path d="M${hx} ${hy}Q190 400 158 252" fill="none" stroke="#8a7a9a" stroke-width="1.6"/><path d="${serce(156, 210, 40)}" fill="${w.k[0]}" stroke="${obrys(w.k[0])}" stroke-width="2.4"/><path d="M152 254l6 0l-3 -6Z" fill="${w.k[0]}"/><ellipse cx="138" cy="200" rx="9" ry="13" transform="rotate(-25 138 200)" fill="${w.k[1]}" opacity=".5"/>` }),
  },
  {
    id: 'mis', nazwa: 'Miś', k: ['#c58556', '#ffd6b0'], tagi: ['slodka'],
    rysuj: (p, w) => {
      const c = w.k[0], o = obrys(c);
      return { wreka: `<g stroke="${o}" stroke-width="2.2"><ellipse cx="190" cy="600" rx="30" ry="34" fill="${c}"/><ellipse cx="190" cy="610" rx="17" ry="20" fill="${w.k[1]}"/><circle cx="170" cy="636" r="11" fill="${c}"/><circle cx="210" cy="636" r="11" fill="${c}"/>` + `<path d="M212 584Q222 556 214 530" stroke-width="14" stroke="${o}" fill="none" stroke-linecap="round"/><path d="M212 584Q222 556 214 530" stroke-width="10" stroke="${c}" fill="none" stroke-linecap="round"/>` + `<circle cx="168" cy="540" r="10" fill="${c}"/><circle cx="208" cy="540" r="10" fill="${c}"/><circle cx="188" cy="560" r="25" fill="${c}"/><ellipse cx="188" cy="568" rx="10" ry="8" fill="${w.k[1]}"/></g>` + `<circle cx="180" cy="555" r="3" fill="#1b1020"/><circle cx="196" cy="555" r="3" fill="#1b1020"/><ellipse cx="188" cy="565" rx="3.5" ry="2.6" fill="#1b1020"/><path d="M184 572q4 3 8 0" stroke="#1b1020" fill="none" stroke-width="1.4"/><path d="M178 590l6 4l-6 4M202 590l-6 4l6 4" fill="#ff5d8f"/>` };
    },
  },
  {
    id: 'eliksir', nazwa: 'Eliksir', k: ['#5fd068', '#c77dff'], tagi: ['halloween', 'czarownica'],
    rysuj: (p, w) => ({ wreka: `<circle cx="212" cy="548" r="40" fill="${p.promienisty(w.k[0], w.k[0], 0.45, 0)}"/>` + `<rect x="204" y="492" width="16" height="26" rx="3" fill="#e8f4ff" fill-opacity=".7" stroke="#6a7a9a" stroke-width="2"/><rect x="203" y="484" width="18" height="10" rx="2" fill="#a0703a" stroke="#6a4a2a" stroke-width="1.6"/>` + `<circle cx="212" cy="544" r="28" fill="#e8f4ff" fill-opacity=".6" stroke="#6a7a9a" stroke-width="2.4"/><path d="M186 548A26 26 0 0 0 238 548Q224 538 212 546Q198 554 186 548Z" fill="${w.k[0]}"/><circle cx="204" cy="556" r="3" fill="#fff" opacity=".7"/><circle cx="218" cy="562" r="2" fill="#fff" opacity=".7"/><path d="${serce(212, 530, 6)}" fill="${w.k[1]}" opacity=".9"/><path d="M198 528q-4 8 0 16" stroke="#fff" stroke-width="3" fill="none" opacity=".6" stroke-linecap="round"/>` }),
  },
  {
    id: 'ksiega', nazwa: 'Księga czarów', k: ['#7b2cbf', zl], tagi: ['czarownica', 'halloween', 'szkola'],
    rysuj: (p, w) => ({ wreka: `<g transform="rotate(-12 212 560)">` + p.ksztalt('M180 520L244 520L244 600L180 600Z', w.wyp, w.o) + `<path d="M244 524L250 528L250 604L184 604L180 600L244 600Z" fill="#fff4e0" stroke="${w.o}" stroke-width="2"/><path d="${gwiazda(212, 556, 14)}" fill="none" stroke="${w.k[1]}" stroke-width="2.6"/><circle cx="212" cy="558" r="22" fill="none" stroke="${w.k[1]}" stroke-width="1.6"/></g>` }),
  },
];

/* ---------- SKRZYDŁA ---------- */
export const SKRZYDLA = [
  {
    id: 'nietoperz', nazwa: 'Nietoperza', k: ['#2b1d3a', '#7b2cbf'], tagi: ['halloween', 'wampir'],
    rysuj: (p, w) => ({ skrzydla: obie(p.ksztalt('M292 330C250 280 190 248 124 236C138 266 128 300 138 322C158 312 176 320 180 342C196 330 214 336 222 354C240 342 266 346 292 362Z', p.gradient(w.k[1], w.k[0]), w.o) + `<path d="M290 336L138 252M290 340L162 318M290 346L204 340" stroke="${w.o}" stroke-width="1.6" opacity=".6"/>`) }),
  },
  {
    id: 'wrozki', nazwa: 'Wróżki', k: ['#a0e7ff', '#ffb3f0'], tagi: ['wrozka'],
    rysuj: (p, w) => {
      const g = p.gradient(w.k[0], w.k[1]);
      return { skrzydla: obie(`<g opacity=".78"><path d="M296 332C240 232 128 214 140 290C146 334 236 352 296 342Z" fill="${g}" stroke="#fff" stroke-width="3"/><path d="M296 348C236 362 168 424 204 456C236 480 282 404 296 354Z" fill="${g}" stroke="#fff" stroke-width="3"/></g>` + `<path d="M292 336Q220 280 160 270M292 350Q240 400 210 440" stroke="#fff" stroke-width="1.6" fill="none" opacity=".8"/>` + `<path d="${blysk(180, 280, 6)}" fill="#fff"/><path d="${blysk(222, 420, 4)}" fill="#fff"/>`) };
    },
  },
  {
    id: 'aniol', nazwa: 'Anielskie', k: ['#ffffff', '#e0e8ff'], tagi: ['aniol', 'gala'],
    rysuj: (p, w) => {
      let s = '';
      for (let rz = 0; rz < 3; rz++) for (let i = 0; i < 6 - rz; i++) {
        const x = 268 - i * 24 - rz * 6, y = 300 + rz * 34 + i * 8;
        s += `<path d="M${x + 20} ${y}C${x} ${y - 10} ${x - 20} ${y + 6} ${x - 14} ${y + 46 - rz * 6}C${x - 2} ${y + 40} ${x + 14} ${y + 30} ${x + 20} ${y + 18}Z" fill="${rz % 2 ? w.k[1] : w.k[0]}" stroke="${mieszaj(w.k[0], '#8a8ab8', 0.5)}" stroke-width="1.8"/>`;
      }
      return { skrzydla: obie(s) };
    },
  },
  {
    id: 'motyl', nazwa: 'Motyla', k: ['#ff8a1f', '#1b1020'], tagi: ['wrozka', 'plaza'],
    rysuj: (p, w) => ({ skrzydla: obie(p.ksztalt('M296 334C250 236 140 220 146 296C150 336 236 354 296 342Z', w.k[0], w.k[1], { gr: 5 }) + p.ksztalt('M296 348C238 362 178 420 210 452C242 476 284 406 296 354Z', w.k[0], w.k[1], { gr: 5 }) + `<circle cx="186" cy="282" r="12" fill="#fff" stroke="${w.k[1]}" stroke-width="3"/><circle cx="226" cy="420" r="8" fill="#fff" stroke="${w.k[1]}" stroke-width="3"/><path d="M294 336L176 270M294 350L220 430" stroke="${w.k[1]}" stroke-width="3" opacity=".8"/>`) }),
  },
  {
    id: 'diabelskie', nazwa: 'Diabełka', k: ['#e5383b', '#8a0f1a'], tagi: ['halloween', 'diabel'],
    rysuj: (p, w) => ({ skrzydla: obie(p.ksztalt('M292 330C266 300 232 286 196 286C206 304 200 320 206 332C220 330 230 338 230 350C244 344 262 348 292 358Z', p.gradient(w.k[0], w.k[1]), obrys(w.k[1]))) }),
  },
];

/* ---------- OGONY ---------- */
export const OGONY = [
  { id: 'koci', nazwa: 'Koci', k: ['#1b1020', '#ff8fb1'], tagi: ['kot', 'halloween'], rysuj: (p, w) => ({ ogon: `<path d="M320 470C380 500 430 480 420 420C414 386 432 366 452 378" fill="none" stroke="${w.o}" stroke-width="18" stroke-linecap="round"/><path d="M320 470C380 500 430 480 420 420C414 386 432 366 452 378" fill="none" stroke="${w.k[0]}" stroke-width="13" stroke-linecap="round"/>` }) },
  { id: 'diabelski', nazwa: 'Diabełka', k: ['#e5383b', '#8a0f1a'], tagi: ['diabel', 'halloween'], rysuj: (p, w) => ({ ogon: `<path d="M320 470C390 520 440 470 410 420C396 396 420 380 438 392" fill="none" stroke="${w.k[1]}" stroke-width="7" stroke-linecap="round"/><path d="M432 376L460 386L442 410Z" fill="${w.k[0]}" stroke="${w.k[1]}" stroke-width="2.4" stroke-linejoin="round"/>` }) },
  { id: 'lisi', nazwa: 'Lisi', k: ['#ff7a3d', '#ffffff'], tagi: ['las', 'slodka'], rysuj: (p, w) => ({ ogon: p.ksztalt('M318 460C370 440 430 470 450 420C462 386 448 352 432 344C428 380 404 400 370 410C350 416 330 430 318 446Z', w.k[0], w.o) + `<path d="M450 420C462 386 448 352 432 344C430 362 424 376 414 388C430 396 442 408 450 420Z" fill="${w.k[1]}"/>` }) },
];
