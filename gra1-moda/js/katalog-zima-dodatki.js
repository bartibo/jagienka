// Kolekcja zimowa: czapki, szaliki, kolczyki, gogle, rękawiczki, rzeczy w dłoni i skrzydła.
// Głowa w katalogu stoi 8 px wyżej niż na scenie (postac.js przesuwa całą głowę), tak jak w katalog-dodatki.js.
import { obie, obrys, ciemniej, jasniej, mieszaj, gwiazda, serce, blysk, sniezynkaD } from './narzedzia.js';
import { CHWYT, dlonie } from './cialo.js';
import { opaska } from './katalog-dodatki.js';
import { futro, odcinek, luk } from './katalog-zima-ubrania.js';

const zl = '#ffd23f', zlO = '#b8860b';
const sniezynka = (x, y, r, kolor, gr = 2) => `<path d="${sniezynkaD(x, y, r)}" stroke="${kolor}" stroke-width="${gr}" stroke-linecap="round" fill="none"/>`;
const dzwonek = (x, y, r = 6) => `<path d="M${x - r} ${y + r * 0.6}Q${x - r} ${y - r} ${x} ${y - r}Q${x + r} ${y - r} ${x + r} ${y + r * 0.6}Z" fill="${zl}" stroke="${zlO}" stroke-width="1.2"/><circle cx="${x}" cy="${y + r * 0.8}" r="${r * 0.3}" fill="${zlO}"/>`;
// Ściągacz czapki: pasek z pionowymi prążkami.
const prazkowana = (p, w, d, x1, x2, y1, y2) => p.ksztalt(d, w.k[1], obrys(w.k[1]), { cien: false }) +
  Array.from({ length: Math.floor((x2 - x1) / 12) + 1 }, (_, i) => `<path d="M${x1 + i * 12} ${y1}L${x1 + i * 12} ${y2}" stroke="${obrys(w.k[1])}" stroke-width="1.2" opacity=".45"/>`).join('');
const pompon = (x, y, r, c) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}" stroke="${obrys(c)}" stroke-width="2"/><circle cx="${x - r * 0.3}" cy="${y - r * 0.3}" r="${r * 0.32}" fill="#fff" opacity=".45"/>` +
  `<path d="M${x - r * 0.5} ${y + r * 0.2}q${r * 0.2} ${-r * 0.3} ${r * 0.4} 0M${x + r * 0.1} ${y + r * 0.45}q${r * 0.2} ${-r * 0.3} ${r * 0.4} 0" fill="none" stroke="${obrys(c)}" stroke-width="1" opacity=".5"/>`;
const czapkaKopula = 'M222 126C218 52 382 52 378 126Z';
const sciagaczCzapki = 'M218 114Q300 100 382 114L384 142Q300 128 216 142Z';

/* ---------- NAKRYCIA GŁOWY ---------- */
export const NAKRYCIA_ZIMA = [
  {
    id: 'uszatka', nazwa: 'Uszatka', k: ['#c58556', '#f6ead8'], tagi: ['zima', 'snieg', 'narty'],
    rysuj: (p, w) => {
      const f = w.k[1], fo = mieszaj(f, '#8a6a4a', 0.45);
      const nausznik = `<path d="M222 132C208 152 206 200 214 226C222 238 240 234 244 222L246 140Z" fill="${f}" stroke="${fo}" stroke-width="2.2"/>` +
        `<path d="M222 160q4 -3 8 0M218 186q4 -3 8 0M224 210q4 -3 8 0" fill="none" stroke="${fo}" stroke-width="1.2"/><path d="M228 232Q226 248 232 262" stroke="${fo}" stroke-width="1.6" fill="none"/>` + pompon(232, 266, 6, f);
      return {
        czapka: obie(nausznik) + p.ksztalt('M226 120C222 46 378 46 374 120Z', w.wyp, w.o) +
          p.ksztalt('M214 120Q300 90 386 120L384 150Q300 124 216 150Z', f, fo, { cien: false }) + `<path d="M232 128q5 -4 10 0M262 118q5 -4 10 0M296 114q5 -4 10 0M328 118q5 -4 10 0M358 128q5 -4 10 0" fill="none" stroke="${fo}" stroke-width="1.3"/>`,
      };
    },
  },
  {
    id: 'nauszniki', nazwa: 'Nauszniki', k: ['#ffb3d9', '#ffffff'], tagi: ['zima', 'lyzwy', 'slodka'],
    rysuj: (p, w) => {
      const muf = `<circle cx="226" cy="184" r="23" fill="${w.k[0]}" stroke="${obrys(w.k[0])}" stroke-width="2.2"/><circle cx="220" cy="176" r="8" fill="#fff" opacity=".35"/>` +
        `<path d="M212 172q4 -4 8 0M222 196q4 -4 8 0M232 168q4 -4 8 0" fill="none" stroke="${obrys(w.k[0])}" stroke-width="1.2" opacity=".6"/>`;
      return { czapka: `<path d="M228 176Q222 68 300 64Q378 68 372 176" fill="none" stroke="${obrys(w.k[1])}" stroke-width="10" stroke-linecap="round"/><path d="M228 176Q222 68 300 64Q378 68 372 176" fill="none" stroke="${w.k[1]}" stroke-width="6" stroke-linecap="round"/>` + obie(muf) };
    },
  },
  {
    id: 'mikolaj', nazwa: 'Czapka Mikołaja', k: ['#e5383b', '#ffffff'], tagi: ['zima', 'swieta'],
    rysuj: (p, w) => ({
      czapka: p.ksztalt('M226 118C228 62 262 36 304 36C346 36 374 60 392 96C400 112 408 130 416 146L402 154C392 136 380 122 370 114Z', w.wyp, w.o) +
        `<path d="M318 44Q350 52 372 84" fill="none" stroke="#fff" stroke-width="4" opacity=".3" stroke-linecap="round"/>` +
        p.ksztalt('M216 110Q300 92 384 110L386 138Q300 120 214 138Z', w.k[1], mieszaj(w.k[1], '#9a8aa8', 0.45), { cien: false }) +
        futro(luk(218, 124, 300, 106, 382, 124, 11), w.k[1], 9) + pompon(412, 158, 16, w.k[1]),
    }),
  },
  {
    id: 'rogiRenifera', nazwa: 'Rogi renifera', k: ['#8b5a2b', '#e5383b'], tagi: ['zima', 'swieta', 'renifer'],
    rysuj: (p, w) => {
      const rog = 'M266 86Q256 56 242 34M256 62L236 58M250 48L254 26M246 40L232 30';
      return {
        czapka: opaska(w.k[0]) + obie(`<path d="${rog}" fill="none" stroke="${obrys(w.k[0])}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/><path d="${rog}" fill="none" stroke="${jasniej(w.k[0], 0.25)}" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round"/>` +
          `<path d="M246 100Q226 92 220 76Q240 74 254 90Z" fill="${w.k[0]}" stroke="${obrys(w.k[0])}" stroke-width="2"/><path d="M244 96Q230 88 226 80Q240 82 250 92Z" fill="#ffb3c8"/>`) +
          `<path d="M300 74l-10 -6l2 10ZM300 74l10 -6l-2 10Z" fill="#2e8a3a"/><circle cx="296" cy="76" r="3.4" fill="${w.k[1]}"/><circle cx="303" cy="77" r="3.4" fill="${w.k[1]}"/>` + dzwonek(268, 86, 5) + dzwonek(332, 86, 5),
      };
    },
  },
  {
    id: 'koronaLodowa', nazwa: 'Lodowa korona', k: ['#8fd3f7', '#ffffff'], tagi: ['zima', 'krolowa', 'lod', 'ksiezniczka', 'gala'],
    rysuj: (p, w) => {
      const g = p.gradient('#ffffff', w.k[0]);
      const kolce = [[300, 8, 12], [274, 32, 9], [326, 32, 9], [252, 56, 8], [348, 56, 8], [236, 78, 6], [364, 78, 6]];
      return {
        czapka: kolce.map(([x, y, s]) => `<path d="M${x - s} 100L${x} ${y}L${x + s} 100Z" fill="${g}" fill-opacity=".9" stroke="#fff" stroke-width="2" stroke-linejoin="round"/><path d="M${x} ${y + 8}L${x} 96" stroke="#fff" stroke-width="1.2" opacity=".8"/>`).join('') +
          `<path d="M232 106Q300 86 368 106L364 116Q300 98 236 116Z" fill="${w.k[0]}" stroke="#fff" stroke-width="2"/>` + sniezynka(300, 84, 11, w.k[1], 3) +
          `<path d="${blysk(274, 46, 5)}" fill="#fff"/><path d="${blysk(338, 70, 4)}" fill="#fff"/><path d="${blysk(300, 30, 3.5)}" fill="#fff"/>`,
      };
    },
  },
  {
    id: 'czapkaKot', nazwa: 'Czapka z uszkami', k: ['#c77dff', '#ffffff'], tagi: ['zima', 'kot', 'slodka'],
    rysuj: (p, w) => ({
      czapka: obie(`<path d="M236 92L242 40L280 68Z" fill="${w.k[0]}" stroke="${w.o}" stroke-width="2.4" stroke-linejoin="round"/><path d="M244 82L247 52L270 68Z" fill="${w.k[1]}"/>`) +
        p.ksztalt(czapkaKopula, w.wyp, w.o) + prazkowana(p, w, sciagaczCzapki, 226, 376, 112, 138),
    }),
  },
  {
    id: 'opaskaZimowa', nazwa: 'Wełniana opaska', k: ['#ff8fc7', '#ffffff'], tagi: ['zima', 'codzienna', 'lyzwy'],
    rysuj: (p, w) => ({
      czapka: p.ksztalt('M220 152C222 96 258 74 300 74C342 74 378 96 380 152L364 154C362 110 336 92 300 92C264 92 238 110 236 154Z', w.wyp, w.o) +
        `<path d="M232 130C238 100 266 84 300 84C334 84 362 100 368 130" fill="none" stroke="${w.o}" stroke-width="1.4" stroke-dasharray="4 4" opacity=".5"/>` +
        p.ksztalt('M286 70Q300 82 314 70L316 96Q300 88 284 96Z', ciemniej(w.k[0], 0.12), w.o, { cien: false }) + zdobienie2('M292 76L292 92M300 80L300 92M308 76L308 92', w.o),
    }),
  },
  {
    id: 'elf', nazwa: 'Czapka elfa', k: ['#2e9a4a', '#e5383b'], tagi: ['zima', 'swieta', 'elf'],
    rysuj: (p, w) => ({
      czapka: p.ksztalt('M228 118C240 70 272 40 320 26C352 18 384 22 404 40C380 42 360 52 352 70C344 90 360 108 372 118Z', w.wyp, w.o) +
        p.ksztalt('M216 108L230 132L244 114L258 134L272 116L286 136L300 118L314 136L328 116L342 134L356 114L370 132L384 108Q300 92 216 108Z', w.k[1], obrys(w.k[1]), { cien: false }) +
        dzwonek(404, 46, 8),
    }),
  },
  {
    id: 'wianekZimowy', nazwa: 'Wianek z ostrokrzewu', k: ['#2e7a3a', '#e5383b'], tagi: ['zima', 'swieta', 'las'],
    rysuj: (p, w) => {
      let s = '';
      for (let i = 0; i < 11; i++) {
        const k = (192 + i * 15.6) * Math.PI / 180, x = 300 + Math.cos(k) * 82, y = 120 + Math.sin(k) * 52, r = (i * 37) % 360;
        s += `<path d="M${x - 13} ${y}q4 -6 7 -3q3 -6 6 -2q3 -5 7 0q-3 5 0 7q-6 2 -6 6q-4 -3 -7 0q-3 -4 -7 -8Z" transform="rotate(${r} ${x.toFixed(1)} ${y.toFixed(1)})" fill="${i % 2 ? w.k[0] : jasniej(w.k[0], 0.15)}" stroke="${ciemniej(w.k[0], 0.4)}" stroke-width="1.2"/>`;
      }
      for (let i = 0; i < 6; i++) {
        const k = (200 + i * 28) * Math.PI / 180, x = 300 + Math.cos(k) * 82, y = 116 + Math.sin(k) * 52;
        s += [[0, 0], [5, 3], [-2, 5]].map(([dx, dy]) => `<circle cx="${(x + dx).toFixed(1)}" cy="${(y + dy).toFixed(1)}" r="4" fill="${w.k[1]}" stroke="${obrys(w.k[1])}" stroke-width="1"/>`).join('');
      }
      return { czapka: s };
    },
  },
  {
    id: 'papacha', nazwa: 'Futrzana czapka', k: ['#f4f1ea', '#d9cfe0'], tagi: ['zima', 'krolowa', 'gala'],
    rysuj: (p, w) => {
      const o = mieszaj(w.k[0], '#8a7a9a', 0.45);
      let kl = '';
      for (let r = 0; r < 4; r++) for (let i = 0; i < 9; i++) kl += `M${236 + i * 16 + (r % 2) * 8} ${66 + r * 14}q4 -5 8 0`;
      return {
        czapka: p.ksztalt('M228 122L232 54Q300 40 368 54L372 122Q300 110 228 122Z', w.wyp, o) + `<ellipse cx="300" cy="54" rx="68" ry="12" fill="${w.k[1]}" stroke="${o}" stroke-width="2"/>` +
          `<path d="${kl}" fill="none" stroke="${o}" stroke-width="1.4" opacity=".7"/>`,
      };
    },
  },
  {
    id: 'spinkiSniezynki', nazwa: 'Spinki śnieżynki', k: ['#bfe9ff', '#ffffff'], tagi: ['zima', 'snieg', 'krolowa', 'slodka'],
    rysuj: (p, w) => ({
      czapka: [[252, 96, 11], [236, 120, 9], [262, 78, 7], [346, 92, 6]].map(([x, y, r]) => sniezynka(x, y, r, obrys(w.k[0]), 4) + sniezynka(x, y, r, w.k[0], 2.2) + `<circle cx="${x}" cy="${y}" r="2.6" fill="${w.k[1]}"/>`).join('') +
        `<path d="${blysk(270, 104, 4)}" fill="#fff"/><path d="${blysk(226, 98, 3)}" fill="#fff"/>`,
    }),
  },
  {
    id: 'czapkaPompony', nazwa: 'Czapka z pomponami', k: ['#4cc9f0', '#ffffff'], tagi: ['zima', 'narty', 'slodka'],
    rysuj: (p, w) => ({
      czapka: p.ksztalt(czapkaKopula, w.wyp, w.o) + `<path d="M250 70Q300 80 350 70" fill="none" stroke="${w.o}" stroke-width="1.4" opacity=".4"/>` +
        prazkowana(p, w, sciagaczCzapki, 226, 376, 112, 138) + pompon(238, 64, 15, w.k[1]) + pompon(362, 64, 15, w.k[1]),
    }),
  },
];
function zdobienie2(d, o) { return `<path d="${d}" fill="none" stroke="${o}" stroke-width="1.2" opacity=".5"/>`; }

/* ---------- SZYJA ---------- */
const dzianina = (x1, y1, x2, y2, o) => {
  let d = '';
  for (let y = y1; y < y2; y += 9) for (let x = x1; x < x2; x += 8) d += `M${x} ${y}l4 5l4 -5`;
  return `<path d="${d}" fill="none" stroke="${o}" stroke-width="1" opacity=".35"/>`;
};
export const NASZYJNIKI_ZIMA = [
  {
    id: 'szalikDlugi', nazwa: 'Długi szalik', k: ['#ff8fc7', '#ffffff'], tagi: ['zima', 'codzienna', 'snieg'],
    rysuj: (p, w) => {
      const fr = (x1, x2, y) => Array.from({ length: 5 }, (_, i) => `M${(x1 + (x2 - x1) * i / 4).toFixed(1)} ${y}l0 12`).join('');
      return {
        szyja: p.ksztalt('M280 300L300 302L296 384L276 380Z', ciemniej(w.k[0], 0.1), w.o) + `<path d="${fr(277, 296, 382)}" stroke="${ciemniej(w.k[0], 0.1)}" stroke-width="2.6" stroke-linecap="round"/>` +
          p.ksztalt('M270 262Q300 284 330 262L336 300Q300 322 264 300Z', w.wyp, w.o) + dzianina(272, 276, 330, 304, w.o) +
          p.ksztalt('M304 298L330 294L336 432L310 436Z', w.wyp, w.o) + dzianina(308, 304, 332, 428, w.o) +
          `<path d="M308 412L334 408M309 420L335 416" stroke="${w.k[1]}" stroke-width="4"/><path d="${fr(311, 335, 434)}" stroke="${w.k[0]}" stroke-width="2.6" stroke-linecap="round"/>`,
      };
    },
  },
  {
    id: 'komin', nazwa: 'Komin', k: ['#f4f1ea', '#c1121f'], tagi: ['zima', 'codzienna', 'narty'],
    rysuj: (p, w) => ({
      szyja: p.ksztalt('M260 256Q300 278 340 256L354 302Q300 336 246 302Z', w.wyp, w.o) + `<path d="M262 276Q300 300 338 276M254 290Q300 318 346 290" fill="none" stroke="${w.o}" stroke-width="1.8" opacity=".5"/>` +
        dzianina(256, 262, 344, 314, w.o) + `<path d="M252 298Q300 330 348 298" fill="none" stroke="${w.k[1]}" stroke-width="3" opacity=".8"/>`,
    }),
  },
  {
    id: 'boa', nazwa: 'Futrzane boa', k: ['#ffffff', '#ffd6e8'], tagi: ['zima', 'gala', 'krolowa', 'gwiazda'],
    rysuj: (p, w) => ({ szyja: futro(luk(230, 300, 300, 344, 370, 300, 15), w.k[0], 12) + futro(luk(244, 290, 300, 322, 356, 290, 12), w.k[1], 10) }),
  },
  {
    id: 'dzwoneczki', nazwa: 'Dzwoneczki', k: ['#e5383b', zl], tagi: ['zima', 'swieta', 'renifer'],
    rysuj: (p, w) => ({
      szyja: `<path d="M285 264Q300 270 315 264L315 274Q300 280 285 274Z" fill="${w.k[0]}" stroke="${obrys(w.k[0])}" stroke-width="1"/>` +
        `<path d="M296 276l-12 -4l2 9ZM304 276l12 -4l-2 9Z" fill="#2e8a3a"/>` + dzwonek(289, 286, 5) + dzwonek(300, 290, 6) + dzwonek(311, 286, 5),
    }),
  },
  {
    id: 'wisiorSniezynka', nazwa: 'Wisiorek śnieżynka', k: ['#e0e8f8', '#8fd3f7'], tagi: ['zima', 'krolowa', 'lod', 'gala'],
    rysuj: (p, w) => ({ szyja: `<path d="M282 282L300 316L318 282" fill="none" stroke="${w.k[0]}" stroke-width="1.6"/>` + sniezynka(300, 326, 11, obrys(w.k[1]), 4.4) + sniezynka(300, 326, 11, w.k[0], 2.4) + `<circle cx="300" cy="326" r="3.4" fill="${w.k[1]}"/><path d="${blysk(310, 316, 4)}" fill="#fff"/>` }),
  },
  {
    id: 'lampki', nazwa: 'Lampki choinkowe', k: ['#ffd23f', '#e5383b'], tagi: ['zima', 'swieta'],
    rysuj: (p, w) => {
      const pkt = luk(268, 282, 300, 352, 332, 282, 7), kol = [w.k[0], w.k[1], '#5fd068', '#4cc9f0', '#c77dff'];
      return {
        szyja: `<path d="M268 282Q300 352 332 282" fill="none" stroke="#2e6a3a" stroke-width="2"/>` +
          pkt.slice(1, -1).map(([x, y], i) => `<circle cx="${x.toFixed(1)}" cy="${(y + 6).toFixed(1)}" r="9" fill="${p.promienisty(kol[i % 5], kol[i % 5], 0.5, 0)}" class="migot" style="animation-delay:${i * 0.3}s"/>` +
            `<rect x="${(x - 2).toFixed(1)}" y="${(y - 1).toFixed(1)}" width="4" height="4" fill="#4a5a4a"/><ellipse cx="${x.toFixed(1)}" cy="${(y + 7).toFixed(1)}" rx="3.6" ry="5.4" fill="${kol[i % 5]}" stroke="${obrys(kol[i % 5])}" stroke-width="1"/>`).join(''),
      };
    },
  },
];

/* ---------- KOLCZYKI ---------- */
const [ux, uy] = [232, 197];
const haczyk = `<path d="M${ux} ${uy}L${ux} ${uy + 8}" stroke="${zl}" stroke-width="1.4"/>`;
export const KOLCZYKI_ZIMA = [
  { id: 'sniezynki', nazwa: 'Śnieżynki', k: ['#e0e8f8'], tagi: ['zima', 'krolowa', 'lod'], rysuj: (p, w) => ({ kolczyki: obie(haczyk + sniezynka(ux, uy + 15, 7.5, obrys(w.k[0]), 3.4) + sniezynka(ux, uy + 15, 7.5, w.k[0], 1.8)) }) },
  { id: 'bombki', nazwa: 'Bombki', k: ['#e5383b'], tagi: ['zima', 'swieta'], rysuj: (p, w) => ({ kolczyki: obie(haczyk + `<rect x="${ux - 2.5}" y="${uy + 7}" width="5" height="4" fill="${zl}"/><circle cx="${ux}" cy="${uy + 17}" r="7" fill="${w.k[0]}" stroke="${obrys(w.k[0])}" stroke-width="1.2"/><circle cx="${ux - 2.4}" cy="${uy + 14.5}" r="2.2" fill="#fff" opacity=".7"/><path d="M${ux - 6} ${uy + 18}Q${ux} ${uy + 21} ${ux + 6} ${uy + 18}" stroke="${zl}" stroke-width="1.4" fill="none"/>`) }) },
  { id: 'laski', nazwa: 'Cukrowe laski', k: ['#e5383b'], tagi: ['zima', 'swieta', 'cukierki', 'elf'], rysuj: (p, w) => ({ kolczyki: obie(`<path d="M${ux} ${uy + 30}L${ux} ${uy + 6}Q${ux} ${uy} ${ux - 5} ${uy}Q${ux - 9} ${uy} ${ux - 9} ${uy + 5}" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round"/><path d="M${ux} ${uy + 30}L${ux} ${uy + 6}Q${ux} ${uy} ${ux - 5} ${uy}Q${ux - 9} ${uy} ${ux - 9} ${uy + 5}" fill="none" stroke="${w.k[0]}" stroke-width="4" stroke-dasharray="3 3"/>`) }) },
  { id: 'sople', nazwa: 'Sopelki', k: ['#bfe9ff'], tagi: ['zima', 'lod', 'krolowa'], rysuj: (p, w) => ({ kolczyki: obie(haczyk + `<path d="M${ux - 4} ${uy + 7}L${ux + 4} ${uy + 7}L${ux} ${uy + 34}Z" fill="${p.gradient('#ffffff', w.k[0])}" stroke="${ciemniej(w.k[0], 0.25)}" stroke-width="1"/><path d="M${ux - 1} ${uy + 10}L${ux - 0.5} ${uy + 22}" stroke="#fff" stroke-width="1.2"/>`) }) },
  { id: 'dzwoneczki', nazwa: 'Dzwoneczki', k: [zl], tagi: ['zima', 'swieta', 'renifer'], rysuj: (p, w) => ({ kolczyki: obie(haczyk + dzwonek(ux, uy + 15, 6).replace(new RegExp(zl, 'g'), w.k[0])) }) },
];

/* ---------- OKULARY ---------- */
export const OKULARY_ZIMA = [
  {
    id: 'gogle', nazwa: 'Gogle narciarskie', k: ['#1b2a4a', '#ff8a1f'], tagi: ['zima', 'narty'],
    rysuj: (p, w) => {
      const id = p.id('gg');
      p.defs.push(`<linearGradient id="${id}" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="${jasniej(w.k[1], 0.3)}"/><stop offset=".5" stop-color="${w.k[1]}"/><stop offset="1" stop-color="#c77dff"/></linearGradient>`);
      return {
        okulary: `<path d="M236 166L212 162L212 186L236 192ZM364 166L388 162L388 186L364 192Z" fill="${w.k[0]}"/>` +
          `<path d="M236 162Q236 150 250 150L350 150Q364 150 364 162L364 198Q364 210 350 210L320 210Q300 196 280 210L250 210Q236 210 236 198Z" fill="url(#${id})" fill-opacity=".88" stroke="${w.k[0]}" stroke-width="6" stroke-linejoin="round"/>` +
          `<path d="M250 160L274 160L256 196L246 196ZM282 160L292 160L276 192L270 192Z" fill="#fff" opacity=".4"/>`,
      };
    },
  },
  {
    id: 'sniezne', nazwa: 'Śnieżynkowe', k: ['#8fd3f7', '#e0f4ff'], tagi: ['zima', 'slodka', 'gwiazda'],
    rysuj: (p, w) => ({ okulary: `<path d="M248 176L236 170M352 176L364 170" stroke="${w.k[0]}" stroke-width="3"/>` + [272, 328].map(x => `<path d="${gwiazda(x, 181, 27, 6, 0.72)}" fill="${w.k[1]}" fill-opacity=".35" stroke="${w.k[0]}" stroke-width="3.4" stroke-linejoin="round"/>`).join('') + `<path d="M295 178Q300 172 305 178" stroke="${w.k[0]}" stroke-width="3" fill="none"/>` }),
  },
];

/* ---------- RĘKAWICZKI (zmieniają kształt dłoni, więc rysują ją same) ---------- */
const MITENKA = 'M198 486C192 502 192 522 196 536C200 550 216 554 224 544C229 536 229 526 227 518C232 517 234 508 230 501C228 495 226 490 224 486Z';
const MANKIET = 'M196 478L228 482L227 496L195 492Z';
export const REKAWICZKI_ZIMA = [
  {
    id: 'mitenki', nazwa: 'Jednopalczaste', k: ['#e5383b', '#ffffff'], tagi: ['zima', 'snieg', 'codzienna'],
    rysuj: () => ({}),
    dlon: (p, w) => obie(p.ksztalt(MITENKA, w.k[0], obrys(w.k[0])) + `<path d="M224 516Q220 522 222 530" fill="none" stroke="${obrys(w.k[0])}" stroke-width="1.4" opacity=".6"/>` +
      sniezynka(209, 524, 6, w.k[1], 1.6) + p.ksztalt(MANKIET, w.k[1], obrys(w.k[1]), { cien: false }) + `<path d="M201 480L200 492M207 481L206 493M213 481L212 494M219 482L219 494" stroke="${obrys(w.k[1])}" stroke-width="1" opacity=".5"/>`),
  },
  {
    id: 'futrzane', nazwa: 'Z futerkiem', k: ['#ff8fc7', '#ffffff'], tagi: ['zima', 'slodka', 'lyzwy'],
    rysuj: () => ({}),
    dlon: (p, w) => obie(p.ksztalt(MITENKA, w.k[0], obrys(w.k[0])) + `<path d="${serce(209, 524, 5)}" fill="${w.k[1]}"/>` + futro(odcinek(196, 486, 228, 490, 5), w.k[1], 6)),
  },
  {
    id: 'bezpalcowe', nazwa: 'Bez palców', k: ['#7b6cf6', '#ffffff'], tagi: ['zima', 'codzienna', 'gwiazda'],
    rysuj: () => ({}),
    dlon: (p, w, skora) => dlonie(skora) + obie(p.ksztalt('M200 482C197 494 196 508 196 523L220 527C222 520 225 512 223 498L223 482Z', w.k[0], obrys(w.k[0])) +
      `<path d="M197 518L220 522" stroke="${w.k[1]}" stroke-width="3"/><path d="M202 486L201 516M208 486L208 518M214 486L214 520" stroke="${obrys(w.k[0])}" stroke-width="1" opacity=".4"/>`),
  },
];

/* ---------- W DŁONI ---------- */
const [hx, hy] = CHWYT;
export const WRECE_ZIMA = [
  {
    id: 'kakao', nazwa: 'Kubek kakao', k: ['#ff8fc7', '#7a4a2a'], tagi: ['zima', 'pizama', 'swieta'],
    rysuj: (p, w) => ({
      wreka: `<path d="M226 528Q244 528 244 542Q244 556 226 554" fill="none" stroke="${obrys(w.k[0])}" stroke-width="7"/><path d="M226 528Q244 528 244 542Q244 556 226 554" fill="none" stroke="${w.k[0]}" stroke-width="4"/>` +
        p.ksztalt('M194 518L230 518L228 562Q212 570 196 562Z', w.k[0], obrys(w.k[0])) + `<path d="${serce(212, 546, 6)}" fill="#fff"/>` +
        `<ellipse cx="212" cy="518" rx="18" ry="5" fill="${w.k[1]}" stroke="${obrys(w.k[0])}" stroke-width="2"/><rect x="200" y="512" width="8" height="7" rx="2" fill="#fff" stroke="#d8d0e0"/><rect x="211" y="510" width="8" height="7" rx="2" fill="#fff8f0" stroke="#d8d0e0"/>` +
        `<path class="dryf" d="M204 500q-6 -10 0 -18q6 -8 0 -16M218 498q-6 -10 0 -18q6 -8 0 -16" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".7"/>`,
    }),
  },
  {
    id: 'sniezka', nazwa: 'Śnieżka', k: ['#ffffff', '#bfe9ff'], tagi: ['zima', 'snieg', 'balwan'],
    rysuj: (p, w) => ({ wreka: `<circle cx="212" cy="548" r="18" fill="${p.promienisty(w.k[0], w.k[1], 1, 1)}" stroke="${mieszaj(w.k[1], '#5a6a9a', 0.4)}" stroke-width="2"/><circle cx="205" cy="542" r="2" fill="${w.k[1]}"/><circle cx="218" cy="556" r="2.6" fill="${w.k[1]}"/><path d="${blysk(222, 538, 4)}" fill="#fff"/>` }),
  },
  {
    id: 'lyzwy', nazwa: 'Łyżwy na sznurówkach', k: ['#ffffff', '#c0c8d8'], tagi: ['zima', 'lyzwy'],
    rysuj: (p, w) => {
      const lyzwa = (x, y, odbij) => `<g transform="translate(${x} ${y})${odbij ? ' scale(-1 1)' : ''}">` +
        `<path d="M-10 0L8 0L8 30C14 32 18 36 18 42L-10 42Z" fill="${w.k[0]}" stroke="${mieszaj(w.k[0], '#6a6a8a', 0.5)}" stroke-width="2" stroke-linejoin="round"/>` +
        `<path d="M-6 8L4 12M4 8L-6 12M-6 18L4 22M4 18L-6 22" stroke="#e5a0c0" stroke-width="1.6"/><path d="M-12 46L20 46" stroke="${w.k[1]}" stroke-width="4" stroke-linecap="round"/><path d="M-6 42L-6 46M14 42L14 46" stroke="${w.k[1]}" stroke-width="2"/></g>`;
      return { wreka: `<path d="M212 530L196 590M212 530L230 596" stroke="#e5a0c0" stroke-width="1.6" fill="none"/>` + lyzwa(196, 588, false) + lyzwa(232, 594, true) };
    },
  },
  {
    id: 'prezent', nazwa: 'Prezent', k: ['#e5383b', '#ffd23f'], tagi: ['zima', 'swieta'],
    rysuj: (p, w) => ({
      wreka: p.ksztalt('M184 532L240 532L240 590L184 590Z', w.wyp, w.o) + `<path d="M206 532L218 532L218 590L206 590Z" fill="${w.k[1]}"/><path d="M184 554L240 554L240 564L184 564Z" fill="${w.k[1]}"/>` +
        `<path d="M212 532C196 512 184 528 210 532ZM212 532C228 512 240 528 214 532Z" fill="${w.k[1]}" stroke="${obrys(w.k[1])}" stroke-width="1.6"/>`,
    }),
  },
  {
    id: 'laska', nazwa: 'Cukrowa laska', k: ['#ffffff', '#e5383b'], tagi: ['zima', 'swieta', 'cukierki', 'elf'],
    rysuj: (p, w) => {
      const d = `M${hx} 640L${hx} 430Q${hx} 392 188 392Q166 392 166 414`;
      return { wreka: `<path d="${d}" fill="none" stroke="${obrys(w.k[1])}" stroke-width="15" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${w.k[0]}" stroke-width="11" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${w.k[1]}" stroke-width="11" stroke-dasharray="9 9"/><path d="M${hx - 3} 630L${hx - 3} 436" stroke="#fff" stroke-width="2" opacity=".5"/>` };
    },
  },
  {
    id: 'piernik', nazwa: 'Pierniczek', k: ['#b8733a', '#ffffff'], tagi: ['zima', 'swieta', 'cukierki', 'slodka'],
    rysuj: (p, w) => ({
      wreka: `<g transform="rotate(-8 212 566)">` + p.ksztalt('M212 532C222 532 226 540 224 548L242 552C248 554 246 562 240 562L226 562L232 586C234 594 226 596 222 590L212 574L202 590C198 596 190 594 192 586L198 562L184 562C178 562 176 554 182 552L200 548C198 540 202 532 212 532Z', w.k[0], obrys(w.k[0])) +
        `<path d="M186 557q3 -3 6 0M232 557q3 -3 6 0M196 586q3 -3 6 0M222 586q3 -3 6 0" fill="none" stroke="${w.k[1]}" stroke-width="2" stroke-linecap="round"/>` +
        `<circle cx="208" cy="541" r="1.6" fill="#1b1020"/><circle cx="216" cy="541" r="1.6" fill="#1b1020"/><path d="M207 546q5 4 10 0" fill="none" stroke="${w.k[1]}" stroke-width="1.6"/>` +
        `<circle cx="212" cy="558" r="2.4" fill="#e5383b"/><circle cx="212" cy="568" r="2.4" fill="#5fd068"/></g>`,
    }),
  },
  {
    id: 'mufka', nazwa: 'Mufka', k: ['#f4f1ea', '#ff8fc7'], tagi: ['zima', 'gala', 'krolowa', 'lyzwy'],
    rysuj: (p, w) => {
      const o = mieszaj(w.k[0], '#8a7a9a', 0.45);
      // mufka zasłania dłoń, więc idzie do warstwy NAD dłonią
      return { wrekaNad: `<ellipse cx="212" cy="526" rx="30" ry="24" fill="${w.k[0]}" stroke="${o}" stroke-width="2.4"/><ellipse cx="190" cy="526" rx="8" ry="20" fill="${mieszaj(w.k[0], '#8a7a9a', 0.15)}" stroke="${o}" stroke-width="2"/>` +
        `<path d="M200 512q4 -4 8 0M214 530q4 -4 8 0M222 512q4 -4 8 0M206 540q4 -4 8 0" fill="none" stroke="${o}" stroke-width="1.3"/>` +
        `<path d="M222 502l-10 -6v12zM222 502l10 -6v12z" fill="${w.k[1]}" stroke="${obrys(w.k[1])}" stroke-width="1.4"/><circle cx="222" cy="502" r="3" fill="${w.k[1]}"/>` };
    },
  },
  {
    id: 'rozdzkaLodowa', nazwa: 'Lodowa różdżka', k: ['#8fd3f7', '#ffffff'], tagi: ['zima', 'krolowa', 'lod'],
    rysuj: (p, w) => ({
      wreka: `<path d="M${hx + 4} ${hy + 14}L178 424" stroke="${w.k[1]}" stroke-width="6" stroke-linecap="round"/><path d="M${hx + 4} ${hy + 14}L178 424" stroke="${w.k[0]}" stroke-width="2" stroke-linecap="round"/>` +
        `<circle cx="172" cy="410" r="26" fill="${p.promienisty(w.k[1], w.k[0], 0.7, 0)}"/>` + sniezynka(172, 410, 18, ciemniej(w.k[0], 0.3), 5.5) + sniezynka(172, 410, 18, w.k[1], 3) +
        `<path d="${blysk(146, 386, 6)}" fill="#fff"/><path d="${blysk(200, 392, 4)}" fill="#fff"/><path d="${blysk(152, 438, 3.5)}" fill="#fff"/>`,
    }),
  },
  {
    id: 'jemiola', nazwa: 'Jemioła', k: ['#4a9a4a', '#e5383b'], tagi: ['zima', 'swieta'],
    rysuj: (p, w) => ({
      wreka: `<path d="M${hx} ${hy}L196 452M${hx} ${hy}L214 446M${hx} ${hy}L228 456" stroke="#6b5a2a" stroke-width="2.4" fill="none"/>` +
        [[196, 452, -30], [214, 446, 10], [228, 456, 40], [204, 476, -50], [222, 476, 50]].map(([x, y, r]) => `<ellipse cx="${x}" cy="${y}" rx="6" ry="14" transform="rotate(${r} ${x} ${y})" fill="${w.k[0]}" stroke="${ciemniej(w.k[0], 0.4)}" stroke-width="1.4"/>`).join('') +
        [[206, 462], [212, 458], [218, 464], [210, 468]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.6" fill="#fff" stroke="#c8d0d8" stroke-width="1"/>`).join('') +
        `<path d="M212 500l-12 -7v14zM212 500l12 -7v14z" fill="${w.k[1]}" stroke="${obrys(w.k[1])}" stroke-width="1.4"/>`,
    }),
  },
  {
    id: 'narty', nazwa: 'Narty', k: ['#e5383b', '#ffffff'], tagi: ['zima', 'narty'],
    rysuj: (p, w) => {
      const narta = x => `<path d="M${x} 300Q${x - 2} 280 ${x + 8} 278Q${x + 18} 280 ${x + 16} 300L${x + 16} 786L${x} 786Z" fill="${w.k[0]}" stroke="${obrys(w.k[0])}" stroke-width="2.2"/><path d="M${x + 8} 296L${x + 8} 782" stroke="${w.k[1]}" stroke-width="3"/>`;
      return { wreka: narta(176) + narta(196) + `<rect x="174" y="560" width="40" height="10" rx="2" fill="#2a2030"/>` };
    },
  },
  {
    id: 'balwanekMaly', nazwa: 'Mały bałwanek', k: ['#ffffff', '#e5383b'], tagi: ['zima', 'balwan', 'snieg', 'slodka'],
    rysuj: (p, w) => {
      const o = mieszaj(w.k[0], '#7a86b8', 0.55);
      return {
        wreka: `<circle cx="212" cy="598" r="16" fill="${w.k[0]}" stroke="${o}" stroke-width="2"/><circle cx="212" cy="572" r="12" fill="${w.k[0]}" stroke="${o}" stroke-width="2"/><circle cx="212" cy="552" r="9" fill="${w.k[0]}" stroke="${o}" stroke-width="2"/>` +
          `<path d="M201 562Q212 568 223 562L223 566Q212 572 201 566Z" fill="${w.k[1]}"/><circle cx="209" cy="550" r="1.4" fill="#1b1020"/><circle cx="215" cy="550" r="1.4" fill="#1b1020"/><path d="M212 553L220 555L212 556Z" fill="#ff8a1f"/>` +
          [574, 582, 596].map(y => `<circle cx="212" cy="${y}" r="1.8" fill="#1b1020"/>`).join(''),
      };
    },
  },
  {
    id: 'kulaSniezna', nazwa: 'Śnieżna kula', k: ['#bfe9ff', '#8b5a2b'], tagi: ['zima', 'swieta', 'snieg'],
    rysuj: (p, w) => ({
      wreka: `<path d="M192 578L232 578L228 596L196 596Z" fill="${w.k[1]}" stroke="${obrys(w.k[1])}" stroke-width="2"/>` +
        `<circle cx="212" cy="556" r="25" fill="${p.promienisty('#ffffff', w.k[0], 0.5, 0.95)}" stroke="#8aa8c8" stroke-width="2"/>` +
        `<path d="M202 572L202 560L212 552L222 560L222 572Z" fill="#e5383b" stroke="#7a1020" stroke-width="1.2"/><rect x="209" y="564" width="6" height="8" fill="#ffd23f"/><path d="M200 562L212 550L224 562" fill="none" stroke="#fff" stroke-width="2.4"/>` +
        `<path d="M226 572L232 556L238 572Z" fill="#2e8a3a"/>` + [[196, 544], [206, 538], [222, 542], [228, 552], [200, 556], [216, 534]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.4" fill="#fff"/>`).join('') +
        `<path d="M196 540Q200 534 206 532" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".7"/>`,
    }),
  },
];

/* ---------- SKRZYDŁA ---------- */
export const SKRZYDLA_ZIMA = [
  {
    id: 'lodowe', nazwa: 'Lodowe', k: ['#8fd3f7', '#ffffff'], tagi: ['zima', 'krolowa', 'lod'],
    rysuj: (p, w) => {
      const g = p.gradient(w.k[1], w.k[0]);
      const szpic = d => `<path d="${d}" fill="${g}" fill-opacity=".8" stroke="#fff" stroke-width="2.4" stroke-linejoin="round"/>`;
      return {
        skrzydla: obie(szpic('M292 330L150 214L196 300L120 296L206 346Z') + szpic('M292 350L170 370L224 394L150 444L262 410Z') +
          `<path d="M290 334L164 228M290 350L176 374" stroke="#fff" stroke-width="1.4" opacity=".8"/><path d="${blysk(186, 270, 6)}" fill="#fff"/><path d="${blysk(196, 420, 4)}" fill="#fff"/>`),
      };
    },
  },
  {
    id: 'zorzowe', nazwa: 'Zorzowe', k: ['#5fd0a0', '#c77dff'], tagi: ['zima', 'zorza', 'wrozka'],
    rysuj: (p, w) => {
      const id = p.id('zs');
      p.defs.push(`<linearGradient id="${id}" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="${w.k[0]}"/><stop offset=".5" stop-color="#4cc9f0"/><stop offset="1" stop-color="${w.k[1]}"/></linearGradient>`);
      return {
        skrzydla: obie(`<g opacity=".78"><path d="M296 332C252 250 160 190 120 240C100 270 150 300 130 330C170 330 240 350 296 342Z" fill="url(#${id})" stroke="#fff" stroke-width="2.4"/>` +
          `<path d="M296 350C240 360 170 410 196 450C220 480 270 410 296 356Z" fill="url(#${id})" stroke="#fff" stroke-width="2.4"/></g>` +
          `<path d="M290 336Q210 270 140 250M292 352Q240 400 206 440" fill="none" stroke="#fff" stroke-width="1.4" opacity=".7"/><circle cx="170" cy="266" r="2" fill="#fff"/><circle cx="150" cy="300" r="1.4" fill="#fff"/><circle cx="216" cy="430" r="1.6" fill="#fff"/>`),
      };
    },
  },
];
