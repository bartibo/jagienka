// Kolekcja zimowa: ubrania. Rysowane w tym samym układzie co katalog-ubrania.js (środek x = 300, głowa w katalogu 8 px wyżej),
// więc pasują do wszystkiego, co już było. Kolory: k[0] – główny (tło wzoru), k[1] – drugi (wykończenia, futerko, wzór).
import { sym, obie, obrys, ciemniej, jasniej, mieszaj, gwiazda, blysk, serce, losowe, sniezynkaD } from './narzedzia.js';
import { NOGA } from './cialo.js';
import { REKAWY, rekaw, zdobienie, otwarta, nogi, falbany, TUTU, SWETER, KOSZULKA, STANIK, STANIK_RAM, KOMBINEZON } from './katalog-ubrania.js';

/* ---------- wspólne drobiazgi ---------- */
// Futerko: rząd puszystych kulek wzdłuż punktów (brzegi płaszczy, mankiety, czapki).
export function futro(punkty, kolor, r = 8) {
  const o = mieszaj(kolor, '#9a8aa8', 0.45);
  return punkty.map(([x, y], i) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(r + (i % 3) * 0.9).toFixed(1)}" fill="${kolor}" stroke="${o}" stroke-width="1.4"/>`).join('') +
    punkty.filter((_, i) => i % 2).map(([x, y]) => `<path d="M${(x - 3).toFixed(1)} ${(y - 2).toFixed(1)}q3 -3 6 0" fill="none" stroke="${o}" stroke-width="1" opacity=".6"/>`).join('');
}
// Punkty na odcinku i na łuku – do futerka, guzików, dzwoneczków.
export const odcinek = (x1, y1, x2, y2, n) => Array.from({ length: n }, (_, i) => [x1 + (x2 - x1) * i / (n - 1), y1 + (y2 - y1) * i / (n - 1)]);
export const luk = (x1, y1, cx, cy, x2, y2, n) => Array.from({ length: n }, (_, i) => {
  const t = i / (n - 1);
  return [(1 - t) ** 2 * x1 + 2 * t * (1 - t) * cx + t * t * x2, (1 - t) ** 2 * y1 + 2 * t * (1 - t) * cy + t * t * y2];
});
const sciagacz = (x1, x2, y1, y2, o, krok = 6) => zdobienie(`M${x1} ${y1}L${x2} ${y1}`, o, 1.6, 0.55) +
  zdobienie(Array.from({ length: Math.floor((x2 - x1) / krok) }, (_, i) => `M${x1 + krok / 2 + i * krok} ${y1 + 2}L${x1 + krok / 2 + i * krok} ${y2}`).join(''), o, 1.1, 0.4);
const mankiet = (o, y = 478) => obie(zdobienie(`M199 ${y}L227 ${y + 4}`, o, 1.8, 0.6) + zdobienie(`M203 ${y + 3}L202 ${y + 15}M209 ${y + 4}L208 ${y + 16}M215 ${y + 5}L214 ${y + 17}M221 ${y + 5}L221 ${y + 17}`, o, 1, 0.4));
const klip = (p, d) => { const id = p.id('kz'); p.defs.push(`<clipPath id="${id}"><path d="${d}"/></clipPath>`); return id; };
// Splot warkoczowy swetra: dwa przeplatające się sznury w pionowym pasie.
const warkocze = (xs, y1, y2, o) => xs.map(x => {
  let d = '';
  for (let y = y1; y < y2; y += 16) d += `M${x - 6} ${y}Q${x + 7} ${y + 8} ${x - 6} ${y + 16}M${x + 6} ${y}Q${x - 7} ${y + 8} ${x + 6} ${y + 16}`;
  return zdobienie(d, o, 2, 0.45) + zdobienie(`M${x - 11} ${y1}L${x - 11} ${y2}M${x + 11} ${y1}L${x + 11} ${y2}`, o, 1.2, 0.3);
}).join('');
const golf = (p, w) => p.ksztalt('M280 258Q300 266 320 258L323 294Q300 302 277 294Z', w.wyp, w.o, { cien: false }) +
  p.ksztalt('M279 256Q300 264 321 256L322 272Q300 281 278 272Z', ciemniej(w.k[0], 0.08), w.o, { cien: false }) +
  zdobienie([284, 289, 294, 300, 306, 311, 316].map(x => `M${x} ${x === 300 ? 279 : 276}L${x} 294`).join(''), w.o, 1, 0.4);
const plateczki = (p, d, n, ziarno, kolor, rozmiar = 7, ramka = [220, 420, 380, 780]) => {
  // śnieżynki rozsypane wewnątrz kształtu (przycięte do niego)
  const r = losowe(ziarno), id = klip(p, d);
  let s = '';
  for (let i = 0; i < n; i++) {
    const x = ramka[0] + r() * (ramka[2] - ramka[0]), y = ramka[1] + r() * (ramka[3] - ramka[1]), rr = rozmiar * (0.6 + r() * 0.7);
    s += i % 3 ? `<path d="${sniezynkaD(+x.toFixed(1), +y.toFixed(1), +rr.toFixed(1))}" stroke="${kolor}" stroke-width="1.4" stroke-linecap="round" fill="none" opacity=".85"/>` : `<path d="${blysk(x.toFixed(1), y.toFixed(1), (rr * 0.6).toFixed(1))}" fill="#fff"/>`;
  }
  return `<g clip-path="url(#${id})">${s}</g>`;
};

/* ---------- GÓRY ---------- */
const OVERSIZE = sym([300, 294], [[290, 294, 285, 288, 283, 280], [260, 284, 244, 290, 234, 298], [238, 342], [244, 384, 248, 430, 246, 474], [300, 478]]);
const REKAW_OVER = 'M236 291C212 294 202 320 200 350C196 392 193 440 191 490L230 496C232 450 238 400 246 350C250 320 252 302 254 294Z';

export const GORY_ZIMA = [
  {
    id: 'golf', nazwa: 'Golf', k: ['#f4f1ea', '#c77dff'], tagi: ['zima', 'codzienna', 'narty'],
    rysuj: (p, w) => ({ gora: p.ksztalt(SWETER, w.wyp, w.o) + sciagacz(254, 346, 452, 464, w.o) + golf(p, w), rekawy: rekaw(p, 'dlugi', w.wyp, w.o) + mankiet(w.o) }),
  },
  {
    id: 'swetrRenifer', nazwa: 'Świąteczny sweter', k: ['#e5383b', '#ffffff'], tagi: ['zima', 'swieta', 'renifer', 'codzienna'],
    rysuj: (p, w) => {
      const id = klip(p, SWETER), c2 = w.k[1];
      const pas = y => `<rect x="226" y="${y}" width="148" height="13" fill="${c2}"/>` + Array.from({ length: 15 }, (_, i) => `<path d="M${230 + i * 10} ${y + 11}l5 -8l5 8Z" fill="${w.k[0]}"/>`).join('');
      const renifer = `<g stroke="#5a3418" stroke-width="3" stroke-linecap="round" fill="none"><path d="M292 364Q284 350 276 344M284 352L276 356M308 364Q316 350 324 344M316 352L324 356"/></g>` +
        `<ellipse cx="300" cy="382" rx="13" ry="16" fill="#9a6232" stroke="#5a3418" stroke-width="2"/><ellipse cx="288" cy="368" rx="6" ry="3.5" transform="rotate(-30 288 368)" fill="#9a6232"/><ellipse cx="312" cy="368" rx="6" ry="3.5" transform="rotate(30 312 368)" fill="#9a6232"/>` +
        `<ellipse cx="300" cy="390" rx="8" ry="6" fill="#d9a066"/><circle cx="300" cy="392" r="4.2" fill="${w.k[0] === '#e5383b' ? '#ff4d6d' : '#e5383b'}" stroke="#7a1020" stroke-width="1"/><circle cx="294" cy="378" r="1.8" fill="#1b1020"/><circle cx="306" cy="378" r="1.8" fill="#1b1020"/>`;
      return {
        gora: p.ksztalt(SWETER, w.wyp, w.o) + `<g clip-path="url(#${id})">${pas(314)}${pas(428)}</g>` + renifer +
          `<path d="${sniezynkaD(262, 384, 8)}${sniezynkaD(338, 384, 8)}" stroke="${c2}" stroke-width="1.8" stroke-linecap="round" fill="none"/>` + zdobienie('M283 280Q300 302 317 280M283 286Q300 308 317 286', w.o, 1.8, 0.6) + sciagacz(254, 346, 454, 464, w.o),
        rekawy: rekaw(p, 'dlugi', w.wyp, w.o) + obie(`<path d="M203 452L229 456" stroke="${c2}" stroke-width="7"/><path d="M204 450L228 454M203 456L228 460" stroke="${w.o}" stroke-width="1" opacity=".35"/>`) + mankiet(w.o),
      };
    },
  },
  {
    id: 'sweterWarkocz', nazwa: 'Sweter w warkocze', k: ['#ffd6e8', '#ffffff'], tagi: ['zima', 'codzienna', 'slodka'],
    rysuj: (p, w) => ({
      gora: p.ksztalt(OVERSIZE, w.wyp, w.o) + warkocze([272, 300, 328], 306, 456, w.o) + sciagacz(248, 352, 462, 476, w.o) + zdobienie('M283 280Q300 302 317 280M282 286Q300 310 318 286', w.o, 1.8, 0.6),
      rekawy: obie(p.ksztalt(REKAW_OVER, w.wyp, w.o) + zdobienie('M210 330Q206 400 204 470', w.o, 1.6, 0.4) + zdobienie('M193 476L230 482', w.o, 1.8, 0.55) + zdobienie('M197 480L196 494M204 481L203 495M211 482L210 496M218 483L218 497M225 484L225 497', w.o, 1, 0.4)),
    }),
  },
  {
    id: 'norweski', nazwa: 'Sweter norweski', k: ['#2b4c9a', '#ffffff'], tagi: ['zima', 'narty', 'codzienna'],
    rysuj: (p, w) => {
      const id = klip(p, SWETER), c2 = w.k[1];
      const karczek = 'M220 290Q300 262 380 290L376 314Q300 356 224 314Z';
      const wzor = [262, 300, 338].map((x, i) => `<path d="${sniezynkaD(x, i === 1 ? 328 : 316, 8)}" stroke="${w.k[0]}" stroke-width="1.8" stroke-linecap="round" fill="none"/>`).join('') +
        luk(232, 316, 300, 360, 368, 316, 15).map(([x, y]) => `<circle cx="${x.toFixed(1)}" cy="${(y - 6).toFixed(1)}" r="1.8" fill="${w.k[0]}"/>`).join('');
      return {
        gora: p.ksztalt(SWETER, w.wyp, w.o) + `<g clip-path="url(#${id})"><path d="${karczek}" fill="${c2}"/>${wzor}<rect x="226" y="434" width="148" height="10" fill="${c2}"/>` +
          Array.from({ length: 12 }, (_, i) => `<path d="M${234 + i * 12} 439l3 -3l3 3l-3 3Z" fill="${w.k[0]}"/>`).join('') + `</g>` + zdobienie('M283 280Q300 302 317 280', w.o, 1.8, 0.6) + sciagacz(254, 346, 454, 464, w.o),
        rekawy: rekaw(p, 'dlugi', w.wyp, w.o) + obie(`<path d="M204 436L230 440" stroke="${c2}" stroke-width="8"/>` + `<circle cx="212" cy="438" r="1.6" fill="${w.k[0]}"/><circle cx="221" cy="439" r="1.6" fill="${w.k[0]}"/>`) + mankiet(w.o),
      };
    },
  },
  {
    id: 'pizamaGora', nazwa: 'Bluzka od piżamki', k: ['#bfe9ff', '#ffffff'], wz: 'gwiazdki', tagi: ['zima', 'pizama', 'slodka'],
    rysuj: (p, w) => {
      const lam = mieszaj(w.k[1], w.k[0], 0.2), lo = obrys(w.k[0]);
      return {
        gora: p.ksztalt(KOSZULKA, w.wyp, w.o) + `<path d="M300 300L300 454" stroke="${lam}" stroke-width="4"/>` +
          obie(p.ksztalt('M285 279L264 298L294 312Z', w.wyp, w.o, { cien: false }) + zdobienie('M284 283L268 298L292 309', lam, 2.4, 1)) +
          [326, 358, 390, 422].map(y => `<circle cx="300" cy="${y}" r="3.4" fill="${w.k[1]}" stroke="${lo}" stroke-width="1.2"/>`).join('') +
          p.ksztalt('M316 330L340 330L339 352Q328 356 317 352Z', w.wyp, w.o, { cien: false }) + zdobienie('M316 334L340 334', lam, 2.4, 1) + zdobienie('M252 454L348 454', lam, 3, 1),
        rekawy: rekaw(p, 'dlugi', w.wyp, w.o) + obie(zdobienie('M199 482L227 486', lam, 3.4, 1)),
      };
    },
  },
];

/* ---------- DOŁY ---------- */
const NARC = sym([300, 396], [[260, 398], [246, 430, 238, 452, 238, 472], [240, 560, 248, 660, 252, 746], [298, 748], [300, 610, 300, 540, 300, 512]]);
const SPODNICA_A = sym([300, 398], [[262, 400], [244, 450, 232, 500, 224, 528], [262, 536, 300, 536]]);
const MIDI = sym([300, 398], [[262, 400], [246, 480, 236, 560, 230, 620], [266, 628, 300, 628]]);
const PIZAMA_D = sym([300, 398], [[262, 400], [248, 430, 240, 452, 238, 470], [238, 580, 240, 680, 244, 748], [298, 750], [300, 620, 300, 540, 300, 512]]);

export const DOLY_ZIMA = [
  {
    id: 'narciarskie', nazwa: 'Spodnie narciarskie', k: ['#7b6cf6', '#ffd23f'], tagi: ['zima', 'narty'],
    rysuj: (p, w) => ({
      dol: p.ksztalt(NARC, w.wyp, w.o) + obie(`<path d="M241 476Q244 600 251 742" stroke="${w.k[1]}" stroke-width="5" fill="none"/>` + zdobienie('M246 594Q270 606 296 598M244 540Q270 552 298 544M250 652Q274 662 297 656', w.o, 1.6, 0.45) +
        `<path d="M252 724L298 726L298 748L252 746Z" fill="${ciemniej(w.k[0], 0.15)}" stroke="${w.o}" stroke-width="2"/>`) + `<path d="M262 400L338 400L340 412L260 412Z" fill="${w.k[1]}" stroke="${obrys(w.k[1])}" stroke-width="1.6"/>` + zdobienie('M300 414L300 510', w.o, 1.4, 0.5),
    }),
  },
  {
    id: 'spodnicaFutro', nazwa: 'Spódniczka z futerkiem', k: ['#e5383b', '#ffffff'], tagi: ['zima', 'swieta', 'gala'],
    rysuj: (p, w) => ({
      dol: p.ksztalt(SPODNICA_A, w.wyp, w.o) + obie(zdobienie('M282 414Q272 470 266 528M268 414Q252 470 246 526', w.o, 1.4, 0.4)) +
        `<path d="M262 402L338 402" stroke="${ciemniej(w.k[0], 0.3)}" stroke-width="6" stroke-linecap="round"/>` + futro(luk(224, 528, 300, 546, 376, 528, 15), w.k[1], 8),
    }),
  },
  {
    id: 'welniana', nazwa: 'Wełniana spódnica', k: ['#c1121f', '#1b1020'], wz: 'kratka', tagi: ['zima', 'codzienna', 'szkola'],
    rysuj: (p, w) => ({
      dol: p.ksztalt(MIDI, w.wyp, w.o) + obie(zdobienie('M284 414Q280 520 276 626M268 414Q258 520 252 624M254 420Q240 520 236 618', w.o, 1.4, 0.45)) +
        `<path d="M262 400L338 400L339 414L261 414Z" fill="${ciemniej(w.k[0], 0.2)}" stroke="${w.o}" stroke-width="1.6"/><circle cx="320" cy="407" r="3" fill="${jasniej(w.k[0], 0.5)}"/>`,
    }),
  },
  {
    id: 'pizamaDol', nazwa: 'Spodnie od piżamki', k: ['#bfe9ff', '#ffffff'], wz: 'gwiazdki', tagi: ['zima', 'pizama', 'slodka'],
    rysuj: (p, w) => ({
      dol: p.ksztalt(PIZAMA_D, w.wyp, w.o) + zdobienie('M300 512L300 748', w.o, 1.4, 0.45) + obie(zdobienie('M245 738L297 740', mieszaj(w.k[1], w.k[0], 0.2), 3.4, 1)) +
        `<path d="M262 402L338 402" stroke="${mieszaj(w.k[1], w.k[0], 0.2)}" stroke-width="5" stroke-linecap="round"/><path d="M296 404q-4 10 -8 14M304 404q4 10 8 14" stroke="${w.k[1]}" stroke-width="2" fill="none" stroke-linecap="round"/>`,
    }),
  },
];

/* ---------- SUKIENKI ---------- */
const GORA_SUKNI = [[289, 300, 282, 292, 280, 284], [262, 288, 248, 292, 240, 296], [246, 340], [256, 368, 262, 392, 262, 404]];
const SUKNIA_A = (dl, szer) => sym([300, 300], [...GORA_SUKNI, [244, 450, 300 - szer + 8, dl - 50, 300 - szer, dl], [262, dl + 8, 300, dl + 8]]);
const DLUGA = sym([300, 398], [[262, 400], [246, 500, 226, 640, 204, 772], [246, 786, 300, 786]]);
const futroDekoltu = k => futro(luk(278, 284, 300, 304, 322, 284, 7), k, 7);
const futroMankietu = k => obie(futro(odcinek(198, 486, 228, 490, 4), k, 6.5));

export const SUKIENKI_ZIMA = [
  {
    id: 'krolowaSniegu', nazwa: 'Suknia Królowej Śniegu', k: ['#8fd3f7', '#e8f7ff'], tagi: ['zima', 'krolowa', 'lod', 'gala', 'ksiezniczka'],
    rysuj: (p, w) => {
      const wyp = !w.wz || w.wz === 'gladki' ? p.gradient(w.k[0], jasniej(w.k[0], 0.7)) : w.wyp;
      const peleryna = sym([300, 284], [[262, 284], [236, 290, 222, 304, 218, 320], [196, 500, 168, 660, 140, 792], [220, 802, 300, 802]]);
      return {
        tyl: `<path d="${peleryna}" fill="${w.k[1]}" opacity=".55" stroke="#fff" stroke-width="2"/>` + plateczki(p, peleryna, 26, 21, '#fff', 8, [140, 330, 460, 790]),
        suknia: p.ksztalt(DLUGA, wyp, w.o) + obie(zdobienie('M282 420Q272 600 258 780M266 426Q248 600 226 776', w.o, 1.4, 0.35)) + plateczki(p, DLUGA, 30, 22, '#fff', 7, [200, 420, 400, 786]) +
          p.ksztalt(STANIK, wyp, w.o) + `<path d="M262 404Q300 414 338 404" stroke="#fff" stroke-width="4" stroke-linecap="round" fill="none" opacity=".9"/>` +
          [[284, 330], [300, 352], [316, 330], [292, 378], [310, 384]].map(([x, y], i) => `<path d="${blysk(x, y, i % 2 ? 4 : 5.5)}" fill="#fff"/>`).join(''),
        rekawy: obie(`<path d="${REKAWY.dlugi}" fill="${w.k[1]}" opacity=".45" stroke="#fff" stroke-width="1.6"/><path d="${sniezynkaD(214, 470, 6)}" stroke="#fff" stroke-width="1.4" fill="none"/>`),
      };
    },
  },
  {
    id: 'lyzwiarka', nazwa: 'Strój łyżwiarki', k: ['#7b6cf6', '#e0f2ff'], tagi: ['zima', 'lyzwy', 'gala', 'gwiazda'],
    rysuj: (p, w) => {
      const gorset = sym([300, 300], [[290, 300, 284, 292, 282, 282], [264, 285, 248, 289, 240, 294], [246, 340], [256, 368, 262, 392, 262, 404], [300, 408]]);
      const spodnica = `M262 402L338 402C366 424 388 462 398 498${falbany(202, 398, 498, 9, 11)}C212 462 234 424 262 402Z`;
      const r = losowe(31);
      let blyski = '';
      for (let i = 0; i < 16; i++) blyski += `<path d="${blysk((232 + r() * 136).toFixed(1), (420 + r() * 76).toFixed(1), (2 + r() * 3).toFixed(1))}" fill="#fff" opacity=".9"/>`;
      return {
        suknia: `<path d="${spodnica}" fill="${w.k[1]}" stroke="${obrys(w.k[1])}" stroke-width="2" stroke-linejoin="round" transform="translate(0 8) scale(1.04 1) translate(-12 0)" opacity=".8"/>` +
          p.ksztalt(spodnica, w.wyp, w.o) + blyski + p.ksztalt(gorset, w.wyp, w.o) +
          `<path d="M283 282L300 336L317 282Z" fill="${w.k[1]}" opacity=".55"/>` + luk(283, 284, 300, 340, 317, 284, 9).map(([x, y]) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="2" fill="#fff"/>`).join('') +
          `<path d="M262 404Q300 412 338 404" stroke="#fff" stroke-width="3" fill="none" opacity=".8"/>`,
        rekawy: rekaw(p, 'dlugi', w.wyp, w.o) + obie(`<path d="${blysk(214, 470, 4)}" fill="#fff"/><circle cx="219" cy="458" r="1.6" fill="#fff"/>`),
      };
    },
  },
  {
    id: 'mikolajka', nazwa: 'Sukienka Mikołajki', k: ['#e5383b', '#ffffff'], tagi: ['zima', 'swieta'],
    rysuj: (p, w) => ({
      suknia: p.ksztalt(SUKNIA_A(540, 78), w.wyp, w.o) + obie(zdobienie('M280 416Q272 480 266 540M266 420Q252 480 244 536', w.o, 1.4, 0.4)) +
        `<path d="M261 398L339 398L340 414L260 414Z" fill="#1b1020"/><rect x="290" y="396" width="20" height="20" rx="3" fill="none" stroke="#ffd23f" stroke-width="3"/>` +
        futro(luk(222, 540, 300, 558, 378, 540, 16), w.k[1], 8.5) + futroDekoltu(w.k[1]),
      rekawy: rekaw(p, 'dlugi', w.wyp, w.o) + futroMankietu(w.k[1]),
    }),
  },
  {
    id: 'elfka', nazwa: 'Strój elfa', k: ['#2e9a4a', '#e5383b'], tagi: ['zima', 'swieta', 'elf'],
    rysuj: (p, w) => {
      const d = sym([300, 300], [...GORA_SUKNI, [244, 456, 234, 500, 228, 514], [238, 542], [252, 518], [264, 548], [278, 522], [290, 550], [300, 526]]);
      const kol = sym([300, 300], [[288, 296, 282, 290, 280, 284], [270, 300], [282, 300], [276, 316], [292, 308]]);
      return {
        suknia: p.ksztalt(d, w.wyp, w.o) + [[238, 542], [264, 548], [290, 550], [310, 550], [336, 548], [362, 542]].map(([x, y]) => `<circle cx="${x}" cy="${y + 4}" r="4.5" fill="#ffd23f" stroke="#b8860b" stroke-width="1.2"/>`).join('') +
          p.ksztalt(kol, w.k[1], obrys(w.k[1]), { cien: false }) +
          `<path d="M261 398L339 398L340 414L260 414Z" fill="#1b1020"/><rect x="291" y="397" width="18" height="18" rx="2" fill="none" stroke="#ffd23f" stroke-width="3"/>` +
          [330, 356, 380].map(y => `<circle cx="300" cy="${y}" r="3.4" fill="${w.k[1]}"/>`).join(''),
        rekawy: rekaw(p, 'dlugi', w.wyp, w.o) + obie(`<path d="M199 482L205 494L211 484L217 496L223 486L227 497" fill="none" stroke="${w.k[1]}" stroke-width="3" stroke-linejoin="round"/>`),
      };
    },
  },
  {
    id: 'sniezynka', nazwa: 'Sukienka Śnieżynki', k: ['#ffffff', '#9fd8f5'], tagi: ['zima', 'snieg', 'slodka', 'gala'],
    rysuj: (p, w) => {
      const r = losowe(41);
      let gw = '';
      for (let i = 0; i < 9; i++) gw += `<path d="${sniezynkaD(+(220 + r() * 160).toFixed(1), +(420 + r() * 70).toFixed(1), 5 + r() * 4)}" stroke="${w.k[1]}" stroke-width="1.6" stroke-linecap="round" fill="none"/>`;
      return {
        suknia: `<path d="${TUTU(122, 502)}" fill="${w.k[1]}" stroke="${obrys(w.k[1])}" stroke-width="2" stroke-linejoin="round" opacity=".9"/>` + p.ksztalt(TUTU(104, 486), w.wyp, mieszaj(w.k[1], '#5a7ab8', 0.4)) + gw +
          [[236, 452], [358, 448], [300, 470]].map(([x, y]) => `<path d="${blysk(x, y, 4)}" fill="${w.k[1]}"/>`).join('') +
          p.ksztalt(STANIK_RAM, w.wyp, mieszaj(w.k[1], '#5a7ab8', 0.4)) + `<path d="${sniezynkaD(300, 352, 13)}" stroke="${w.k[1]}" stroke-width="2.4" stroke-linecap="round" fill="none"/>` +
          `<path d="M262 404Q300 412 338 404" stroke="${w.k[1]}" stroke-width="5" stroke-linecap="round" fill="none"/>`,
      };
    },
  },
  {
    id: 'swetrowa', nazwa: 'Swetrowa sukienka', k: ['#c9b6e8', '#ffffff'], tagi: ['zima', 'codzienna', 'slodka'],
    rysuj: (p, w) => {
      const d = sym([300, 296], [[290, 296, 285, 290, 283, 280], [262, 284, 246, 290, 238, 296], [244, 340], [252, 370, 260, 396, 260, 420], [254, 470, 248, 520, 246, 560], [300, 564]]);
      return { suknia: p.ksztalt(d, w.wyp, w.o) + warkocze([274, 300, 326], 308, 540, w.o) + sciagacz(248, 352, 546, 562, w.o) + golf(p, w), rekawy: rekaw(p, 'dlugi', w.wyp, w.o) + mankiet(w.o) };
    },
  },
  {
    id: 'narciarski', nazwa: 'Kombinezon narciarski', k: ['#ff5d8f', '#ffffff'], tagi: ['zima', 'narty'],
    rysuj: (p, w) => {
      const id = klip(p, KOMBINEZON);
      return {
        suknia: p.ksztalt(KOMBINEZON, w.wyp, w.o) + `<g clip-path="url(#${id})"><path d="M220 318L380 318L380 352L220 352Z" fill="${w.k[1]}"/><path d="M220 356L380 356L380 362L220 362Z" fill="${ciemniej(w.k[0], 0.25)}"/></g>` +
          zdobienie('M300 284L300 500', w.o, 2, 0.7) + `<rect x="296" y="290" width="8" height="12" rx="2" fill="#c0c8d8" stroke="${w.o}" stroke-width="1"/>` +
          `<path d="M260 402L340 402L341 416L259 416Z" fill="#1b1020"/>` + obie(zdobienie('M246 590Q272 602 296 594M248 640Q272 650 296 644', w.o, 1.6, 0.45) + `<path d="M254 716L296 716L296 738L258 738Z" fill="${ciemniej(w.k[0], 0.2)}"/>`),
        rekawy: rekaw(p, 'dlugi', w.wyp, w.o) + obie(`<path d="M210 336L247 344L245 360L208 352Z" fill="${w.k[1]}" opacity=".95"/>` + zdobienie('M200 470L227 474', w.o, 2, 0.6)),
      };
    },
  },
  {
    id: 'balwanek', nazwa: 'Kostium bałwanka', k: ['#ffffff', '#e5383b'], tagi: ['zima', 'balwan', 'snieg', 'slodka'],
    rysuj: (p, w) => {
      const o = mieszaj(w.k[0], '#7a86b8', 0.55), wyp = !w.wz || w.wz === 'gladki' ? p.promienisty(w.k[0], mieszaj(w.k[0], '#bcd0f0', 0.6), 1, 1) : w.wyp;
      return {
        suknia: `<ellipse cx="300" cy="470" rx="86" ry="78" fill="${wyp}" stroke="${o}" stroke-width="2.6"/><ellipse cx="300" cy="340" rx="60" ry="62" fill="${wyp}" stroke="${o}" stroke-width="2.6"/>` +
          [316, 344, 372].map(y => `<circle cx="300" cy="${y}" r="5.5" fill="#1b1020"/><circle cx="298" cy="${y - 2}" r="1.6" fill="#fff" opacity=".5"/>`).join('') + [452, 488].map(y => `<circle cx="300" cy="${y}" r="6" fill="#1b1020"/>`).join('') +
          `<path d="M246 298Q300 322 354 298L356 314Q300 340 244 314Z" fill="${w.k[1]}" stroke="${obrys(w.k[1])}" stroke-width="2"/><path d="M334 310L344 360L362 356L350 306Z" fill="${w.k[1]}" stroke="${obrys(w.k[1])}" stroke-width="2"/>` +
          zdobienie('M344 360L346 368M350 359L352 367M356 358L358 366', obrys(w.k[1]), 1.6, 0.8) + obie(`<path d="${sniezynkaD(250, 500, 7)}" stroke="#bfe9ff" stroke-width="1.6" fill="none"/>`),
      };
    },
  },
  {
    id: 'pierniczek', nazwa: 'Kostium pierniczka', k: ['#b8733a', '#ffffff'], tagi: ['zima', 'swieta', 'cukierki', 'slodka'],
    rysuj: (p, w) => {
      const lukier = (x1, x2, y, n, h) => { let d = `M${x1} ${y}`; const kr = (x2 - x1) / n; for (let i = 0; i < n; i++) d += `q${kr / 2} ${i % 2 ? -h : h} ${kr} 0`; return d; };
      return {
        suknia: p.ksztalt(SUKNIA_A(540, 78), w.wyp, w.o) + zdobienie(lukier(226, 374, 524, 12, 7), w.k[1], 4, 1) + zdobienie(lukier(282, 318, 292, 4, 5), w.k[1], 3.4, 1) +
          [['#e5383b', 330], ['#5fd068', 360], ['#ff8fc7', 390]].map(([c, y]) => `<circle cx="300" cy="${y}" r="6.5" fill="${c}" stroke="#fff" stroke-width="2"/>`).join('') +
          `<path d="${serce(300, 460, 12)}" fill="none" stroke="${w.k[1]}" stroke-width="3"/>`,
        rekawy: rekaw(p, 'dlugi', w.wyp, w.o) + obie(zdobienie('M200 476q3.5 5 7 0q3.5 -5 7 0q3.5 5 7 0q3.5 -5 7 0', w.k[1], 3, 1)),
      };
    },
  },
  {
    id: 'pingwinek', nazwa: 'Kostium pingwinka', k: ['#1b2a4a', '#ffffff'], tagi: ['zima', 'pingwin', 'slodka'],
    rysuj: (p, w) => {
      const d = SUKNIA_A(560, 84), id = klip(p, d);
      return {
        suknia: p.ksztalt(d, w.wyp, w.o) + `<g clip-path="url(#${id})"><ellipse cx="300" cy="440" rx="48" ry="132" fill="${w.k[1]}"/></g>` + zdobienie('M268 400Q300 410 332 400', w.o, 1.6, 0.4) +
          `<path d="M300 300l-16 -9v18zM300 300l16 -9v18z" fill="#ff8a1f" stroke="#b85a0a" stroke-width="1.6" stroke-linejoin="round"/><circle cx="300" cy="300" r="4.5" fill="#ff8a1f" stroke="#b85a0a" stroke-width="1.4"/>`,
        rekawy: rekaw(p, 'motylek', w.wyp, w.o),
      };
    },
  },
  {
    id: 'zorza', nazwa: 'Suknia zorza polarna', k: ['#5fd0a0', '#c77dff'], tagi: ['zima', 'zorza', 'gala', 'kosmos'],
    rysuj: (p, w) => {
      let wyp = w.wyp;
      if (!w.wz || w.wz === 'gladki') {
        const id = p.id('zo');
        p.defs.push(`<linearGradient id="${id}" x1="0" x2=".3" y1="0" y2="1"><stop offset="0" stop-color="${ciemniej(w.k[0], 0.2)}"/><stop offset=".35" stop-color="${w.k[0]}"/><stop offset=".6" stop-color="#4cc9f0"/><stop offset=".85" stop-color="${w.k[1]}"/><stop offset="1" stop-color="#ff8fc7"/></linearGradient>`);
        wyp = `url(#${id})`;
      }
      const r = losowe(55);
      let gw = '';
      for (let i = 0; i < 22; i++) gw += `<circle cx="${(228 + r() * 144).toFixed(1)}" cy="${(410 + r() * 360).toFixed(1)}" r="${(0.8 + r() * 1.6).toFixed(1)}" fill="#fff" opacity="${(0.5 + r() * 0.5).toFixed(2)}"/>`;
      return {
        suknia: p.ksztalt(DLUGA, wyp, w.o) + `<g clip-path="url(#${klip(p, DLUGA)})">${gw}<path d="M200 520Q260 480 300 540T400 520" fill="none" stroke="#fff" stroke-width="6" opacity=".25"/><path d="M200 640Q250 600 300 660T400 640" fill="none" stroke="#fff" stroke-width="8" opacity=".2"/></g>` +
          p.ksztalt(STANIK, '#1b2a4a', '#0b1020') + [[284, 334], [312, 352], [296, 380], [320, 322]].map(([x, y], i) => `<path d="${blysk(x, y, i % 2 ? 3 : 4.5)}" fill="${i % 2 ? w.k[0] : '#fff'}"/>`).join('') +
          `<path d="M262 404Q300 414 338 404" stroke="${w.k[0]}" stroke-width="4" stroke-linecap="round" fill="none"/>`,
      };
    },
  },
  {
    id: 'pizamaRenifer', nazwa: 'Piżamka reniferka', k: ['#a0703a', '#f4e4c8'], tagi: ['zima', 'pizama', 'renifer', 'slodka'],
    rysuj: (p, w) => {
      const rog = `<path d="M262 74Q250 44 236 30M252 54L234 50M244 40L246 22" fill="none" stroke="#6b3e1a" stroke-width="7" stroke-linecap="round"/><path d="M262 74Q250 44 236 30M252 54L234 50M244 40L246 22" fill="none" stroke="#c8925a" stroke-width="3.5" stroke-linecap="round"/>`;
      return {
        // kaptur leży za głową, więc rysujemy go w warstwie „tyl” (o 8 px niżej, jak cała głowa)
        tyl: `<g transform="translate(0 8)">${obie(rog)}${p.ksztalt('M300 46C224 46 198 108 202 178C204 226 222 266 248 290L352 290C378 266 396 226 398 178C402 108 376 46 300 46Z', ciemniej(w.k[0], 0.12), w.o)}` +
          obie(`<ellipse cx="206" cy="112" rx="10" ry="20" transform="rotate(-40 206 112)" fill="${w.k[0]}" stroke="${w.o}" stroke-width="2.2"/><ellipse cx="207" cy="113" rx="4" ry="12" transform="rotate(-40 206 112)" fill="${w.k[1]}"/>`) + `</g>`,
        suknia: p.ksztalt(KOMBINEZON, w.wyp, w.o) + `<ellipse cx="300" cy="392" rx="30" ry="56" fill="${w.k[1]}"/>` + obie(`<path d="M246 718L296 718L296 740L250 740Z" fill="${ciemniej(w.k[0], 0.15)}"/>` + zdobienie('M250 722L294 722M250 728L294 728M251 734L295 734', w.o, 1, 0.35)) +
          [318, 346].map(y => `<circle cx="300" cy="${y}" r="3.6" fill="${w.k[1]}" stroke="${w.o}" stroke-width="1.2"/>`).join(''),
        rekawy: rekaw(p, 'dlugi', w.wyp, w.o) + mankiet(w.o),
      };
    },
  },
];

/* ---------- OKRYCIA ---------- */
const PUCH = sym([300, 282], [[288, 282, 282, 276, 280, 268], [256, 276, 236, 288, 226, 302], [230, 340], [234, 380, 238, 430, 236, 488], [300, 494]]);
const REKAW_PUCH = 'M236 292C212 292 200 318 198 350C196 392 194 440 192 488L232 496C234 450 238 400 246 350C250 318 252 300 254 294Z';
const kolnierzStojka = (p, w) => p.ksztalt('M279 262Q300 270 321 262L324 292Q300 300 276 292Z', w.wyp, w.o, { cien: false });

export const OKRYCIA_ZIMA = [
  {
    id: 'puchowka', nazwa: 'Kurtka puchowa', k: ['#ff8fc7', '#ffffff'], tagi: ['zima', 'narty', 'codzienna'],
    rysuj: (p, w) => {
      const id = klip(p, PUCH);
      return {
        okrycie: p.ksztalt(PUCH, w.wyp, w.o) + `<g clip-path="url(#${id})">${zdobienie([330, 362, 394, 426, 458].map(y => `M222 ${y}Q300 ${y + 10} 378 ${y}`).join(''), w.o, 1.8, 0.5)}</g>` +
          zdobienie('M300 270L300 494', w.o, 2.2, 0.75) + `<rect x="296" y="296" width="8" height="13" rx="2" fill="${w.k[1]}" stroke="${w.o}" stroke-width="1.2"/>` + kolnierzStojka(p, w) +
          futro(luk(270, 264, 300, 248, 330, 264, 8), w.k[1], 7),
        rekawy: obie(p.ksztalt(REKAW_PUCH, w.wyp, w.o) + zdobienie('M202 340Q222 348 246 344M199 384Q220 392 242 388M196 428Q216 436 238 432', w.o, 1.6, 0.5) +
          `<path d="M192 480L232 488L231 497L191 490Z" fill="${w.k[1]}" stroke="${obrys(w.k[1])}" stroke-width="1.6"/>`),
      };
    },
  },
  {
    id: 'kozuszek', nazwa: 'Kożuszek', k: ['#b07a4a', '#f6ead8'], tagi: ['zima', 'codzienna'],
    rysuj: (p, w) => {
      const t = w.k[1], to = mieszaj(t, '#8a6a4a', 0.45);
      return {
        okrycie: otwarta(p, w, 504, { kolnierz: false, guziki: false }) +
          obie(`<path d="M287 286L282 330L288 464L286 504" fill="none" stroke="${to}" stroke-width="11" stroke-linecap="round"/><path d="M287 286L282 330L288 464L286 504" fill="none" stroke="${t}" stroke-width="8" stroke-linecap="round"/>` +
            p.ksztalt('M286 278L254 296L274 344L292 300Z', t, to, { cien: false }) + zdobienie('M268 306q4 6 0 12M276 320q3 5 0 10', to, 1.2, 0.6) +
            `<path d="M252 500L288 506" stroke="${t}" stroke-width="8" stroke-linecap="round"/>` + `<rect x="258" y="420" width="20" height="4" rx="2" fill="${ciemniej(w.k[0], 0.3)}"/>`),
        rekawy: rekaw(p, 'dlugi', w.wyp, w.o) + obie(`<path d="M198 480L227 485L226 498L196 494Z" fill="${t}" stroke="${to}" stroke-width="1.6"/>`),
      };
    },
  },
  {
    id: 'plaszczFutro', nazwa: 'Płaszcz z futerkiem', k: ['#5b2a6e', '#f4f1ea'], tagi: ['zima', 'gala', 'krolowa', 'paryz'],
    rysuj: (p, w) => {
      const d = sym([300, 300], [[290, 296, 285, 290, 283, 280], [262, 284, 246, 290, 238, 296], [244, 340], [254, 368, 262, 392, 262, 405], [252, 460, 238, 560, 228, 620], [268, 628, 300, 628]]);
      return {
        okrycie: p.ksztalt(d, w.wyp, w.o) + zdobienie('M300 312L300 626', w.o, 1.6, 0.5) + obie(zdobienie('M270 420Q262 520 252 620', w.o, 1.3, 0.35)) +
          [340, 376, 412].map(y => `<circle cx="288" cy="${y}" r="4" fill="#ffd23f" stroke="#b8860b" stroke-width="1.2"/><circle cx="312" cy="${y}" r="4" fill="#ffd23f" stroke="#b8860b" stroke-width="1.2"/>`).join('') +
          futro(luk(240, 296, 300, 336, 360, 296, 13), w.k[1], 9) + futro(luk(268, 274, 300, 292, 332, 274, 6), w.k[1], 8),
        rekawy: rekaw(p, 'dlugi', w.wyp, w.o) + futroMankietu(w.k[1]),
      };
    },
  },
  {
    id: 'pelerynaSniegu', nazwa: 'Peleryna Królowej Śniegu', k: ['#bfe9ff', '#ffffff'], tagi: ['zima', 'krolowa', 'lod', 'gala'],
    rysuj: (p, w) => {
      const pel = sym([300, 278], [[268, 278, 236, 288, 224, 312], [196, 500, 170, 650, 156, 768], [228, 780, 270, 782, 300, 782]]);
      const szpic = (x1, y1, x2, y2, x3, y3) => `<path d="M${x1} ${y1}L${x2} ${y2}L${x3} ${y3}Z" fill="${w.k[0]}" fill-opacity=".75" stroke="#fff" stroke-width="2" stroke-linejoin="round"/>`;
      return {
        tyl: `<path d="${pel}" fill="${w.wyp}" opacity=".6" stroke="#fff" stroke-width="2.4"/>` + plateczki(p, pel, 28, 61, '#fff', 9, [156, 320, 444, 780]),
        // lodowy kołnierz wachlarzem za głową – szpice wystają poza włosy
        wlosyTyl: obie(szpic(276, 290, 160, 196, 246, 282) + szpic(270, 292, 150, 250, 238, 298) + szpic(282, 286, 186, 138, 258, 272) + szpic(288, 282, 226, 92, 272, 268) +
          `<path d="M246 282L170 204M238 298L162 252M258 272L194 150M272 268L230 106" stroke="#fff" stroke-width="1.6" opacity=".8"/>`),
        szyja: `<path d="${sniezynkaD(300, 292, 10)}" stroke="#fff" stroke-width="3" stroke-linecap="round" fill="none"/><path d="${sniezynkaD(300, 292, 10)}" stroke="${ciemniej(w.k[0], 0.3)}" stroke-width="1.4" stroke-linecap="round" fill="none"/><circle cx="300" cy="292" r="3" fill="#fff"/>`,
      };
    },
  },
  {
    id: 'parka', nazwa: 'Parka z kapturem', k: ['#7fb069', '#f4ead8'], tagi: ['zima', 'codzienna'],
    rysuj: (p, w) => {
      const pkt = [];
      for (let i = 0; i <= 22; i++) { const k = (155 + i * (230 / 22)) * Math.PI / 180; pkt.push([300 + Math.cos(k) * 88, 168 + Math.sin(k) * 108]); }
      return {
        wlosyTyl: p.ksztalt('M300 38C206 38 182 122 188 196C192 244 216 278 250 294L350 294C384 278 408 244 412 196C418 122 394 38 300 38Z', ciemniej(w.k[0], 0.15), w.o) + futro(pkt, w.k[1], 12),
        okrycie: otwarta(p, w, 560) + obie(p.ksztalt('M250 470L280 470L281 506L252 508Z', w.wyp, w.o, { cien: false }) + zdobienie('M250 478L280 478', w.o, 1.6, 0.6)) +
          `<path d="M266 404Q300 412 334 404" fill="none" stroke="${ciemniej(w.k[0], 0.3)}" stroke-width="2.4" stroke-dasharray="1 0"/>`,
        rekawy: rekaw(p, 'dlugi', w.wyp, w.o) + obie(zdobienie('M199 470L227 474', w.o, 3, 0.5)),
      };
    },
  },
  {
    id: 'kamizelkaFutro', nazwa: 'Futrzana kamizelka', k: ['#f4ead8', '#d9c4a8'], tagi: ['zima', 'codzienna', 'gala'],
    rysuj: (p, w) => {
      const pol = 'M282 282C266 286 252 292 246 300L250 340C256 372 262 400 260 432L258 474L270 476L274 330L284 290Z';
      const o = mieszaj(w.k[0], '#8a6a4a', 0.4), r = losowe(77);
      let kepki = '';
      for (let i = 0; i < 18; i++) { const x = 254 + r() * 30, y = 304 + r() * 166; kepki += `M${x.toFixed(1)} ${y.toFixed(1)}q3 -4 6 0`; }
      return { okrycie: obie(p.ksztalt(pol, w.wyp, o) + zdobienie(kepki, o, 1.2, 0.55) + futro([...odcinek(283, 290, 274, 334, 4), ...odcinek(273, 342, 270, 474, 9)], w.k[1], 6.5)) };
    },
  },
  {
    id: 'poncho', nazwa: 'Ponczo z frędzlami', k: ['#c77dff', '#ffffff'], tagi: ['zima', 'codzienna'],
    rysuj: (p, w) => {
      const d = sym([300, 272], [[282, 272], [250, 282, 214, 318, 196, 378], [186, 414, 182, 446, 184, 470], [240, 478, 300, 500]]);
      const id = klip(p, d);
      let fr = '';
      for (let x = 188; x <= 412; x += 7) { const y = x < 300 ? 470 + (x - 184) * 30 / 116 : 500 - (x - 300) * 30 / 116; fr += `M${x} ${y.toFixed(1)}l${x < 300 ? -1 : 1} 16`; }
      return {
        rekawy: p.ksztalt(d, w.wyp, w.o) + `<g clip-path="url(#${id})"><path d="M180 384Q300 440 420 384L420 400Q300 456 180 400Z" fill="${w.k[1]}"/>` +
          Array.from({ length: 16 }, (_, i) => `<path d="M${196 + i * 14} ${398 + Math.sin(i / 15 * Math.PI) * 26}l7 -9l7 9Z" fill="${w.k[0]}"/>`).join('') + `</g>` +
          zdobienie(fr, w.k[1], 2.4, 1) + p.ksztalt('M280 260Q300 268 320 260L322 284Q300 292 278 284Z', w.wyp, w.o, { cien: false }),
      };
    },
  },
  {
    id: 'kurtkaNarciarska', nazwa: 'Kurtka narciarska', k: ['#4cc9f0', '#1b2a4a'], tagi: ['zima', 'narty'],
    rysuj: (p, w) => {
      const id = klip(p, PUCH);
      return {
        okrycie: p.ksztalt(PUCH, w.wyp, w.o) + `<g clip-path="url(#${id})"><path d="M218 296L300 362L382 296L382 326L300 392L218 326Z" fill="${w.k[1]}"/></g>` +
          zdobienie('M300 270L300 494', w.o, 2.2, 0.75) + kolnierzStojka(p, w) + `<rect x="252" y="430" width="22" height="30" rx="3" fill="#fff" stroke="${w.o}" stroke-width="1.4"/><path d="M256 438L270 438M256 444L266 444" stroke="${w.o}" stroke-width="1.6"/>` +
          `<path d="M263 430L263 414" stroke="${w.o}" stroke-width="1.4"/>`,
        rekawy: obie(p.ksztalt(REKAW_PUCH, w.wyp, w.o) + `<path d="M206 330L246 340L244 354L203 346Z" fill="${w.k[1]}"/>` + `<path d="M192 480L232 488L231 497L191 490Z" fill="${w.k[1]}"/>`),
      };
    },
  },
];

/* ---------- RAJSTOPY I SKARPETY ---------- */
const prazki = (p, kolor, odY = 460) => {
  const id = p.id('pr');
  p.defs.push(`<clipPath id="${id}"><path d="${NOGA}"/><path d="${NOGA}" transform="matrix(-1 0 0 1 600 0)"/></clipPath>`);
  return `<g clip-path="url(#${id})">${obie(zdobienie([254, 262, 270, 278, 286, 294].map(x => `M${x} ${odY}L${x + (x - 276) * 0.25 + 6} 740`).join(''), kolor, 1.4, 0.35))}</g>`;
};
export const RAJSTOPY_ZIMA = [
  { id: 'grube', nazwa: 'Wełniane rajstopy', k: ['#c1121f', '#a00e19'], tagi: ['zima', 'codzienna', 'szkola'], rysuj: (p, w) => ({ rajstopy: nogi(p, w.wyp, w.o) + prazki(p, w.o) }) },
  {
    id: 'welniane', nazwa: 'Wełniane zakolanówki', k: ['#f4f1ea', '#e5383b'], tagi: ['zima', 'slodka'],
    rysuj: (p, w) => ({
      rajstopy: nogi(p, w.wyp, w.o, 560) + prazki(p, w.o, 590) + obie(`<path d="M248 558Q272 566 297 560L298 584Q272 590 250 582Z" fill="${w.k[1]}" stroke="${obrys(w.k[1])}" stroke-width="1.6"/>` +
        `<path d="M252 584Q246 600 244 612" stroke="${w.k[1]}" stroke-width="1.6" fill="none"/><circle cx="244" cy="616" r="5.5" fill="${w.k[1]}" stroke="${obrys(w.k[1])}" stroke-width="1.2"/>`),
    }),
  },
  { id: 'cukrowe', nazwa: 'Rajstopy cukrowa laska', k: ['#ffffff', '#e5383b'], wz: 'skosne', tagi: ['zima', 'swieta', 'elf', 'cukierki'], rysuj: (p, w) => ({ rajstopy: nogi(p, w.wyp, obrys(w.k[1])) }) },
  {
    id: 'getryFutro', nazwa: 'Getry z futerkiem', k: ['#ffb3d9', '#ffffff'], tagi: ['zima', 'lyzwy', 'slodka'],
    rysuj: (p, w) => ({ rajstopy: obie(p.ksztalt('M254 646Q278 638 302 646L304 700Q305 722 299 742L268 742Q258 722 258 700Z', w.wyp, w.o) + zdobienie('M262 664L300 664M261 684L302 684M262 704L302 704M265 724L300 724', w.o, 1.2, 0.4) + futro(odcinek(254, 646, 302, 646, 6), w.k[1], 6.5)) }),
  },
];

/* ---------- BUTY ---------- */
const buty = s => ({ buty: obie(s) });
export const BUTY_ZIMA = [
  {
    id: 'sniegowce', nazwa: 'Śniegowce', k: ['#e5383b', '#ffffff'], tagi: ['zima', 'snieg', 'narty'],
    rysuj: (p, w) => buty(p.ksztalt('M252 664Q278 654 304 664L306 744C312 760 312 772 306 780L254 780C246 774 246 760 252 744Z', w.wyp, w.o) +
      zdobienie('M253 690Q278 698 305 690M252 716Q278 724 306 716M251 742Q278 750 307 742', w.o, 1.8, 0.5) +
      `<path d="M248 770L310 770L310 786L248 786Z" fill="${w.k[1]}" stroke="${obrys(w.k[1])}" stroke-width="2" rx="4"/><path d="M256 664L300 664" stroke="${w.k[1]}" stroke-width="5" stroke-linecap="round"/>`),
  },
  {
    id: 'lyzwy', nazwa: 'Łyżwy', k: ['#ffffff', '#c0c8d8'], tagi: ['zima', 'lyzwy'],
    rysuj: (p, w) => buty(p.ksztalt('M265 678L299 678L299 744C303 758 303 766 297 772L267 772C260 766 260 756 264 744Z', w.wyp, mieszaj(w.k[0], '#6a6a8a', 0.5)) +
      zdobienie('M273 688L291 696M291 688L273 696M273 702L291 710M291 702L273 710M273 716L291 724M291 716L273 724M273 730L291 738M291 730L273 738', '#e5a0c0', 2, 1) +
      `<path d="M265 678L299 678L299 686L265 686Z" fill="${mieszaj(w.k[0], '#ff8fc7', 0.3)}"/>` +
      `<path d="M270 772L294 772L290 782L274 782Z" fill="${w.k[1]}" stroke="#6a7088" stroke-width="1.4"/><path d="M278 782L286 782L286 794L278 794Z" fill="#e8eef8" stroke="#6a7088" stroke-width="1.4"/><path d="M280 784L280 792" stroke="#fff" stroke-width="1.2"/>`),
  },
  {
    id: 'kapcieRenifer', nazwa: 'Kapcie reniferki', k: ['#a0703a', '#e5383b'], tagi: ['zima', 'pizama', 'renifer', 'slodka'],
    rysuj: (p, w) => buty(`<path d="M266 744Q258 728 250 724M260 734L250 736M286 744Q290 726 298 720M290 732L299 732" fill="none" stroke="#6b3e1a" stroke-width="3.4" stroke-linecap="round"/>` +
      p.ksztalt('M258 764C256 744 270 738 282 738C296 738 304 748 302 764C302 778 290 784 280 784C266 784 258 778 258 764Z', w.wyp, obrys(w.k[0])) +
      `<circle cx="274" cy="756" r="2.2" fill="#1b1020"/><circle cx="289" cy="756" r="2.2" fill="#1b1020"/><circle cx="281" cy="766" r="4.6" fill="${w.k[1]}"/><circle cx="279.5" cy="764.5" r="1.4" fill="#fff" opacity=".7"/>`),
  },
  {
    id: 'emu', nazwa: 'Ciepłe botki', k: ['#c8a070', '#f6ead8'], tagi: ['zima', 'codzienna'],
    rysuj: (p, w) => buty(p.ksztalt('M260 644L298 644C298 690 300 720 299 744C302 760 300 772 294 778L268 778C259 774 260 760 264 744C262 710 260 680 260 644Z', w.wyp, w.o) +
      p.ksztalt('M255 638Q279 630 303 638L305 664Q279 656 253 664Z', w.k[1], mieszaj(w.k[1], '#8a6a4a', 0.45), { cien: false }) + zdobienie('M262 650q3 -3 6 0M276 646q3 -3 6 0M290 650q3 -3 6 0', mieszaj(w.k[1], '#8a6a4a', 0.45), 1.2, 0.7) +
      zdobienie('M296 668L297 742', w.o, 1.4, 0.4)),
  },
  {
    id: 'narciarskie', nazwa: 'Buty narciarskie', k: ['#4cc9f0', '#1b1020'], tagi: ['zima', 'narty'],
    rysuj: (p, w) => buty(p.ksztalt('M256 668L302 668L304 744C308 758 308 770 304 780L256 780C250 770 250 756 254 744Z', w.wyp, w.o) +
      [690, 712, 734].map(y => `<path d="M256 ${y}L304 ${y + 2}L304 ${y + 9}L255 ${y + 7}Z" fill="${w.k[1]}"/><rect x="290" y="${y - 2}" width="10" height="11" rx="2" fill="#c0c8d8" stroke="#4a4a5a" stroke-width="1"/>`).join('') +
      `<path d="M250 778L310 778L310 790L250 790Z" fill="#2a2030"/>`),
  },
  {
    id: 'kozakiFutro', nazwa: 'Kozaki z pomponami', k: ['#f4f1ea', '#ffffff'], tagi: ['zima', 'gala', 'slodka'],
    rysuj: (p, w) => buty(p.ksztalt('M256 600L298 600C298 660 300 700 299 740C301 760 300 772 294 778L268 778C259 774 260 760 266 740C264 700 256 650 256 600Z', w.wyp, mieszaj(w.k[0], '#8a7a6a', 0.5)) +
      futro(odcinek(252, 600, 302, 600, 6), w.k[1], 7) + `<path d="M258 608Q252 624 250 634M262 608Q262 626 262 638" stroke="${mieszaj(w.k[1], '#8a7a6a', 0.5)}" stroke-width="1.4" fill="none"/>` +
      `<circle cx="250" cy="638" r="6.5" fill="${w.k[1]}" stroke="${mieszaj(w.k[1], '#8a7a6a', 0.5)}" stroke-width="1.2"/><circle cx="262" cy="642" r="6.5" fill="${w.k[1]}" stroke="${mieszaj(w.k[1], '#8a7a6a', 0.5)}" stroke-width="1.2"/>`),
  },
  {
    id: 'walonki', nazwa: 'Walonki', k: ['#7b2cbf', '#ff8fc7'], tagi: ['zima', 'codzienna'],
    rysuj: (p, w) => buty(p.ksztalt('M258 650L300 650C300 700 301 730 300 750C302 764 300 774 294 780L266 780C258 776 258 762 262 750C260 720 258 690 258 650Z', w.wyp, w.o) +
      zdobienie('M259 660L299 660', w.k[1], 2.4, 0.9) + `<path d="${serce(279, 700, 7)}" fill="${w.k[1]}"/>` + [[270, 716], [288, 716], [279, 730]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3" fill="${w.k[1]}"/>`).join('') +
      zdobienie('M266 676l4 4M292 676l-4 4', w.k[1], 2, 0.8)),
  },
];
