// Ubrania. Każde rysuje się wzdłuż punktów ciała z cialo.js; rękawy idą do osobnej warstwy „rekawy”,
// bo muszą leżeć NAD rękami, a reszta ubrania POD nimi.
// Kolory: k[0] – główny (tło wzoru), k[1] – drugi (wzór, wykończenia).
import { sym, obie, obrys, ciemniej, jasniej, mieszaj, gwiazda, blysk, dynia, nietoperz, losowe } from './narzedzia.js';
import { NOGA, STOPA } from './cialo.js';

/* ---------- rękawy (lewa ręka, prawa przez odbicie) ---------- */
const REKAWY = {
  krotki: 'M240 289C220 291 209 316 207 350L246 357C247 332 249 310 254 294Z',
  dlugi: 'M240 289C220 291 210 316 209 345C207 380 203 440 198 493L227 497C230 450 237 390 248 337C250 316 252 300 254 294Z',
  bufka: 'M246 286C210 278 192 318 205 352C219 362 238 360 249 352C253 330 255 306 254 292Z',
  dzwon: 'M240 289C220 291 210 316 209 345C206 390 194 445 172 514C194 528 222 526 240 508C237 450 240 390 248 337C250 316 252 300 254 294Z',
  motylek: 'M244 287C214 284 196 310 196 336C212 348 236 348 250 338C252 318 254 302 254 293Z',
};
function rekaw(p, typ, wyp, o) {
  const d = REKAWY[typ];
  let s = p.ksztalt(d, wyp, o);
  if (typ === 'dlugi') s += `<path d="M199 482L226 486" stroke="${o}" stroke-width="2" opacity=".7"/>`;
  if (typ === 'bufka') s += `<path d="M214 320Q222 340 220 352M232 300Q236 330 236 356" fill="none" stroke="${o}" stroke-width="1.5" opacity=".5"/>`;
  if (typ === 'dzwon') s += `<path d="M206 450Q200 490 190 516M224 450Q222 490 220 522" fill="none" stroke="${o}" stroke-width="1.5" opacity=".45"/>`;
  return obie(s);
}

const zdobienie = (d, o, gr = 1.6, op = 0.55) => `<path d="${d}" fill="none" stroke="${o}" stroke-width="${gr}" stroke-linecap="round" stroke-linejoin="round" opacity="${op}"/>`;

/* ---------- GÓRY ---------- */
const KOSZULKA = sym([300, 298], [[291, 298, 285, 292, 283, 282], [264, 285, 248, 289, 240, 294], [246, 340], [254, 368, 263, 392, 263, 410], [263, 428, 255, 442, 252, 454], [300, 456]]);
const SWETER = sym([300, 296], [[290, 296, 285, 290, 283, 280], [262, 284, 246, 290, 238, 296], [244, 340], [252, 370, 260, 396, 260, 420], [260, 440, 254, 452, 252, 464], [300, 466]]);
const CROP = sym([300, 316], [[290, 316, 282, 306, 280, 291], [270, 291], [264, 314, 252, 332, 246, 340], [252, 356, 256, 372, 258, 384], [300, 386]]);
const GORSET = sym([300, 318], [[292, 304, 282, 299, 272, 303], [262, 308, 252, 322, 246, 340], [256, 368, 262, 392, 262, 410], [262, 430, 258, 446, 256, 456], [300, 472]]);
const BLUZKA = sym([300, 306], [[278, 306], [278, 288], [258, 288, 246, 292, 240, 296], [246, 340], [254, 368, 262, 392, 262, 404], [254, 430, 246, 452, 240, 468], [270, 476, 300, 474]]);

export const GORY = [
  {
    id: 'koszulka', nazwa: 'Koszulka', k: ['#ff8fc7', '#ffffff'], tagi: ['codzienna', 'plaza'],
    rysuj: (p, w) => ({ gora: p.ksztalt(KOSZULKA, w.wyp, w.o) + zdobienie('M283 282Q300 304 317 282', w.o, 2, 0.7), rekawy: rekaw(p, 'krotki', w.wyp, w.o) }),
  },
  {
    id: 'koszulkaDynia', nazwa: 'Koszulka z dynią', k: ['#2b1d3a', '#ff8a1f'], tagi: ['halloween', 'dynia', 'codzienna'],
    rysuj: (p, w) => ({ gora: p.ksztalt(KOSZULKA, w.wyp, w.o) + zdobienie('M283 282Q300 304 317 282', w.o, 2, 0.7) + dynia(300, 370, 30, w.k[1], true), rekawy: rekaw(p, 'krotki', w.wyp, w.o) }),
  },
  {
    id: 'koszulkaDuch', nazwa: 'Koszulka z duszkiem', k: ['#7b4cc2', '#ffffff'], tagi: ['halloween', 'duch', 'codzienna'],
    rysuj: (p, w) => ({
      gora: p.ksztalt(KOSZULKA, w.wyp, w.o) + zdobienie('M283 282Q300 304 317 282', w.o, 2, 0.7) +
        `<path d="M276 400C276 360 286 340 300 340C314 340 324 360 324 400L318 394L312 402L306 394L300 402L294 394L288 402L282 394Z" fill="${w.k[1]}" stroke="${obrys(w.k[1])}" stroke-width="2"/>` +
        `<ellipse cx="293" cy="364" rx="3" ry="4.5" fill="#1b1020"/><ellipse cx="307" cy="364" rx="3" ry="4.5" fill="#1b1020"/><ellipse cx="300" cy="378" rx="3.5" ry="4.5" fill="#1b1020"/>`,
      rekawy: rekaw(p, 'krotki', w.wyp, w.o),
    }),
  },
  {
    id: 'crop', nazwa: 'Krótki top', k: ['#4cc9f0', '#ffffff'], tagi: ['plaza', 'gwiazda', 'codzienna'],
    rysuj: (p, w) => ({ gora: p.ksztalt(CROP, w.wyp, w.o) + zdobienie('M286 312Q300 322 314 312', w.o, 1.6, 0.5) }),
  },
  {
    id: 'bluzka', nazwa: 'Bluzka z bufkami', k: ['#fff4fa', '#ff8fc7'], tagi: ['slodka', 'codzienna', 'paryz'],
    rysuj: (p, w) => ({
      gora: p.ksztalt(BLUZKA, w.wyp, w.o) + zdobienie('M262 404Q300 410 338 404', w.o, 2, 0.6) +
        `<path d="M300 306l-12 -7v14zM300 306l12 -7v14z" fill="${w.k[1]}" stroke="${obrys(w.k[1])}" stroke-width="1.6" stroke-linejoin="round"/><circle cx="300" cy="306" r="3.4" fill="${w.k[1]}" stroke="${obrys(w.k[1])}" stroke-width="1.4"/>`,
      rekawy: rekaw(p, 'bufka', w.wyp, w.o),
    }),
  },
  {
    id: 'sweter', nazwa: 'Sweterek', k: ['#ffd23f', '#ff8a1f'], tagi: ['codzienna', 'zima', 'dynia'],
    rysuj: (p, w) => ({
      gora: p.ksztalt(SWETER, w.wyp, w.o) + zdobienie('M283 280Q300 302 317 280M283 286Q300 308 317 286', w.o, 1.8, 0.6) +
        zdobienie('M254 452L346 452', w.o, 1.6, 0.6) + [262, 274, 286, 298, 310, 322, 334].map(x => zdobienie(`M${x} 454L${x} 464`, w.o, 1.4, 0.5)).join(''),
      rekawy: rekaw(p, 'dlugi', w.wyp, w.o),
    }),
  },
  {
    id: 'swetrNietoperz', nazwa: 'Sweter z nietoperzem', k: ['#ff8a1f', '#1b1020'], tagi: ['halloween', 'codzienna', 'wampir'],
    rysuj: (p, w) => ({
      gora: p.ksztalt(SWETER, w.wyp, w.o) + zdobienie('M283 280Q300 302 317 280', w.o, 1.8, 0.6) + `<path d="${nietoperz(300, 372, 3.2)}" fill="${w.k[1]}"/>` +
        zdobienie('M254 452L346 452', w.o, 1.6, 0.6),
      rekawy: rekaw(p, 'dlugi', w.wyp, w.o),
    }),
  },
  {
    id: 'bluza', nazwa: 'Bluza z kapturem', k: ['#c77dff', '#ffffff'], tagi: ['codzienna', 'zima'],
    rysuj: (p, w) => ({
      gora: p.ksztalt('M250 292C244 262 270 248 300 250C330 248 356 262 350 292Z', ciemniej(w.k[0], 0.15), w.o) +
        p.ksztalt(SWETER, w.wyp, w.o) +
        p.ksztalt('M266 402L334 402L340 446L260 446Z', w.wyp, w.o, { cien: false }) +
        `<path d="M290 296L288 346M310 296L312 346" stroke="${w.k[1]}" stroke-width="2.6" stroke-linecap="round"/><circle cx="288" cy="348" r="3" fill="${w.k[1]}"/><circle cx="312" cy="348" r="3" fill="${w.k[1]}"/>`,
      rekawy: rekaw(p, 'dlugi', w.wyp, w.o),
    }),
  },
  {
    id: 'gorset', nazwa: 'Gorset', k: ['#1b1020', '#c1121f'], tagi: ['halloween', 'wampir', 'czarownica', 'gala'],
    rysuj: (p, w) => {
      let s = p.ksztalt(GORSET, w.wyp, w.o);
      for (let y = 330; y < 450; y += 18) s += `<path d="M292 ${y}L308 ${y + 12}M308 ${y}L292 ${y + 12}" stroke="${w.k[1]}" stroke-width="2.2" stroke-linecap="round"/>`;
      s += zdobienie('M272 312Q268 380 276 456M328 312Q332 380 324 456', jasniej(w.k[0], 0.35), 1.6, 0.6);
      return { gora: s };
    },
  },
  {
    id: 'koszula', nazwa: 'Koszula', k: ['#ffffff', '#5b8def'], tagi: ['codzienna', 'szkola'],
    rysuj: (p, w) => ({
      gora: p.ksztalt(KOSZULKA, w.wyp, w.o) +
        obie(p.ksztalt('M285 280L266 298L297 310Z', w.wyp, w.o, { cien: false })) +
        [324, 354, 384, 414].map(y => `<circle cx="300" cy="${y}" r="3" fill="${w.k[1]}" stroke="${obrys(w.k[1])}" stroke-width="1"/>`).join('') +
        zdobienie('M300 312L300 454', w.o, 1.4, 0.4),
      rekawy: rekaw(p, 'krotki', w.wyp, w.o),
    }),
  },
  {
    id: 'podarta', nazwa: 'Podarta koszula', k: ['#b8c4a0', '#7a5a3a'], tagi: ['halloween', 'zombie'],
    rysuj: (p, w) => {
      const d = sym([300, 298], [[291, 298, 285, 292, 283, 282], [264, 285, 248, 289, 240, 294], [246, 340], [254, 368, 263, 392, 263, 410], [262, 440], [270, 430], [278, 452], [288, 436], [300, 458]]);
      return {
        gora: p.ksztalt(d, w.wyp, w.o) + `<path d="M270 360l10 -6l4 12l-8 6z" fill="${mieszaj(w.k[0], '#000', 0.35)}"/>` +
          p.ksztalt('M314 380L338 376L340 400L316 404Z', w.k[1], obrys(w.k[1]), { cien: false }) +
          zdobienie('M316 386l22 -3M317 394l22 -3', obrys(w.k[1]), 1.2, 0.8) + zdobienie('M300 330l4 6l-4 6l4 6', w.o, 1.6, 0.8),
        rekawy: obie(p.ksztalt('M240 289C220 291 209 316 207 350L216 344L222 356L232 346L246 357C247 332 249 310 254 294Z', w.wyp, w.o)),
      };
    },
  },
  {
    id: 'muszelki', nazwa: 'Muszelki', k: ['#c77dff', '#4cc9f0'], tagi: ['syrena', 'plaza'],
    rysuj: (p, w) => {
      const muszla = `<path d="M300 344C296 326 286 318 274 320C262 322 256 334 260 350C270 358 290 356 300 344Z" fill="${w.wyp}" stroke="${w.o}" stroke-width="2.2"/>` +
        zdobienie('M298 344L268 324M298 344L262 336M298 344L264 350', w.o, 1.4, 0.7);
      return { gora: `<path d="M300 344L300 330M276 320L284 290M324 320L316 290" stroke="${w.k[1]}" stroke-width="2.4"/>` + muszla + `<g transform="matrix(-1 0 0 1 600 0)">${muszla}</g>` + `<circle cx="300" cy="346" r="4" fill="#fff" stroke="${w.o}" stroke-width="1.2"/>` };
    },
  },
];

/* ---------- DOŁY ---------- */
const MINI = sym([300, 398], [[262, 400], [236, 494], [256, 500, 278, 502, 300, 502]]);
const MAXI = sym([300, 398], [[262, 400], [244, 500, 226, 640, 214, 744], [258, 752, 280, 754, 300, 754]]);
const SPODNIE = sym([300, 398], [[262, 400], [250, 430, 244, 450, 244, 468], [246, 560, 258, 660, 263, 744], [298, 746], [300, 600, 300, 540, 300, 510]]);
const DZWONY = sym([300, 398], [[262, 400], [250, 430, 244, 450, 244, 468], [246, 560, 256, 640, 248, 746], [298, 748], [300, 600, 300, 540, 300, 510]]);
const SZORTY = sym([300, 398], [[262, 400], [250, 430, 244, 450, 244, 470], [245, 532], [296, 536], [300, 512]]);
const LEGGINSY = sym([300, 398], [[262, 400], [250, 430, 244, 450, 244, 468], [240, 520, 250, 580, 261, 615], [257, 650, 265, 700, 274, 739], [294, 739], [296, 700, 298, 665, 295, 615], [297, 570, 300, 530, 300, 505]]);
const POSZARPANA = sym([300, 398], [[262, 400], [238, 470, 222, 560, 210, 646], [226, 624], [234, 656], [248, 628], [258, 662], [272, 630], [284, 666], [300, 634]]);

function falbany(x0, x1, y, n, h) {
  let d = '';
  const krok = (x1 - x0) / n;
  for (let i = 0; i < n; i++) d += `Q${(x1 - krok * i - krok / 2).toFixed(1)} ${y + h} ${(x1 - krok * (i + 1)).toFixed(1)} ${y}`;
  return d;
}
const TUTU = (szer, y) => `M262 400L338 400C${338 + szer * 0.2} 430 ${300 + szer - 10} ${y - 20} ${300 + szer} ${y}${falbany(300 - szer, 300 + szer, y, 9, 14)}C${300 - szer + 10} ${y - 20} ${262 - szer * 0.2} 430 262 400Z`;

export const DOLY = [
  {
    id: 'mini', nazwa: 'Plisowana mini', k: ['#ff5d8f', '#ffffff'], tagi: ['codzienna', 'szkola', 'slodka'],
    rysuj: (p, w) => ({ dol: p.ksztalt(MINI, w.wyp, w.o) + zdobienie('M262 412L338 412', w.o, 1.8, 0.6) + obie(zdobienie('M282 414L274 500M290 414L289 502', w.o, 1.4, 0.45)) + zdobienie('M300 414L300 502', w.o, 1.4, 0.45) }),
  },
  {
    id: 'tutu', nazwa: 'Tiulowa tutu', k: ['#ffb3d9', '#ffe0f0'], tagi: ['slodka', 'wrozka', 'gala'],
    rysuj: (p, w) => {
      let s = `<path d="${TUTU(112, 486)}" fill="${w.k[1]}" stroke="${obrys(w.k[1])}" stroke-width="2.2" stroke-linejoin="round" opacity=".92"/>` +
        p.ksztalt(TUTU(96, 470), w.wyp, w.o, { gr: 2.2 });
      const r = losowe(3);
      for (let i = 0; i < 14; i++) s += `<path d="${blysk(240 + r() * 120, 420 + r() * 50, 2 + r() * 2.5)}" fill="#fff" opacity=".85"/>`;
      return { dol: s + `<path d="M262 404L338 404" stroke="${w.o}" stroke-width="5" stroke-linecap="round"/>` };
    },
  },
  {
    id: 'maxi', nazwa: 'Długa spódnica', k: ['#7b6cf6', '#ffd23f'], tagi: ['codzienna', 'gala', 'czarownica'],
    rysuj: (p, w) => ({ dol: p.ksztalt(MAXI, w.wyp, w.o) + obie(zdobienie('M280 420Q276 580 262 748M266 430Q256 590 238 748', w.o, 1.5, 0.4)) + zdobienie('M262 410L338 410', w.o, 1.8, 0.5) }),
  },
  {
    id: 'poszarpana', nazwa: 'Poszarpana', k: ['#3b2a5a', '#7fb069'], tagi: ['halloween', 'czarownica', 'zombie'],
    rysuj: (p, w) => ({ dol: p.ksztalt(POSZARPANA, w.wyp, w.o) + obie(zdobienie('M280 420Q274 520 262 640M266 430Q256 530 240 626', w.o, 1.5, 0.45)) }),
  },
  {
    id: 'bombka', nazwa: 'Dyniowa bombka', k: ['#ff8a1f', '#5b7a2a'], tagi: ['halloween', 'dynia', 'slodka'],
    rysuj: (p, w) => ({
      dol: p.ksztalt('M262 400L338 400C384 420 398 474 362 504C330 520 270 520 238 504C202 474 216 420 262 400Z', w.wyp, w.o) +
        zdobienie('M300 402L300 516M280 402Q262 460 272 514M320 402Q338 460 328 514M268 404Q232 450 248 508M332 404Q368 450 352 508', w.o, 1.8, 0.55) +
        `<path d="M262 402L338 402" stroke="${w.k[1]}" stroke-width="6" stroke-linecap="round"/>`,
    }),
  },
  {
    id: 'spodnie', nazwa: 'Spodnie', k: ['#2b2d42', '#ffffff'], tagi: ['codzienna', 'szkola'],
    rysuj: (p, w) => ({ dol: p.ksztalt(SPODNIE, w.wyp, w.o) + zdobienie('M300 512L300 744M262 412L338 412', w.o, 1.6, 0.5) + obie(zdobienie('M272 414Q278 430 290 432', w.o, 1.4, 0.5)) }),
  },
  {
    id: 'dzwony', nazwa: 'Dżinsy dzwony', k: ['#5b8def', '#ffd23f'], tagi: ['codzienna', 'gwiazda'],
    rysuj: (p, w) => ({ dol: p.ksztalt(DZWONY, w.wyp, w.o) + zdobienie('M300 512L300 746M262 412L338 412', w.o, 1.6, 0.5) + obie(zdobienie('M250 470Q254 600 258 740', w.k[1], 1.4, 0.8) + zdobienie('M270 414Q278 432 292 434', w.k[1], 1.4, 0.8)) }),
  },
  {
    id: 'szorty', nazwa: 'Szorty', k: ['#5b8def', '#ffffff'], tagi: ['plaza', 'codzienna'],
    rysuj: (p, w) => ({ dol: p.ksztalt(SZORTY, w.wyp, w.o) + zdobienie('M300 512L300 534M262 412L338 412', w.o, 1.6, 0.5) + obie(zdobienie('M245 522L296 526', w.o, 1.6, 0.6)) }),
  },
  {
    id: 'legginsy', nazwa: 'Legginsy', k: ['#1b1020', '#c77dff'], tagi: ['codzienna', 'kot', 'halloween'],
    rysuj: (p, w) => ({ dol: p.ksztalt(LEGGINSY, w.wyp, w.o) + zdobienie('M262 408L338 408', w.o, 1.6, 0.5) }),
  },
];

/* ---------- SUKIENKI (zastępują górę i dół) ---------- */
const STANIK = sym([300, 312], [[290, 302, 280, 296, 270, 298], [258, 302, 250, 320, 246, 340], [256, 368, 262, 392, 262, 404], [300, 408]]);
const STANIK_V = sym([300, 340], [[292, 320, 286, 300, 283, 282], [264, 285, 248, 289, 240, 294], [246, 340], [256, 368, 262, 392, 262, 404], [300, 408]]);
const STANIK_RAM = sym([300, 312], [[290, 312, 282, 302, 280, 290], [272, 290], [266, 314, 254, 332, 246, 340], [256, 368, 262, 392, 262, 404], [300, 408]]);
const KOMBINEZON = sym([300, 296], [[290, 296, 285, 290, 283, 280], [262, 284, 246, 290, 238, 296], [244, 340], [254, 368, 262, 392, 262, 405], [262, 428, 244, 440, 243, 466], [239, 520, 249, 580, 260, 615], [256, 650, 264, 700, 273, 740], [295, 740], [297, 700, 299, 665, 296, 615], [298, 570, 300, 530, 300, 505]]);

function kosci(o, c) {
  // nadruk szkieletu: żebra, kręgosłup, miednica i kości kończyn
  let s = `<g fill="none" stroke="${c}" stroke-linecap="round" stroke-width="5">`;
  s += `<path d="M300 300L300 440"/>`;
  for (let i = 0; i < 4; i++) s += obie(`<path d="M298 ${318 + i * 20}Q${272 - i * 2} ${314 + i * 20} ${262 + i * 3} ${332 + i * 20}"/>`);
  s += `<path d="M276 452Q300 440 324 452Q330 470 316 476Q300 466 284 476Q270 470 276 452Z" fill="${c}"/>`;
  s += obie(`<path d="M272 500L280 600M281 630L284 726"/><circle cx="280" cy="614" r="5" fill="${c}"/>`);
  return s + '</g>';
}
const kosciRece = c => obie(`<g fill="none" stroke="${c}" stroke-linecap="round" stroke-width="4.5"><path d="M226 330L216 410M214 428L208 482"/><circle cx="215" cy="419" r="4" fill="${c}"/></g>`);

const BALOWA_SP = sym([300, 398], [[262, 400], [220, 470, 168, 600, 146, 764], [196, 782, 250, 786, 300, 786]]);
const PLATKI = (n, dl, kat0, kat1) => {
  let s = '';
  for (let i = 0; i < n; i++) {
    const k = (kat0 + (kat1 - kat0) * i / (n - 1)) * Math.PI / 180;
    const x = 300 + Math.cos(k) * dl, y = 404 + Math.sin(k) * dl;
    const bx = 300 + Math.cos(k - 0.22) * dl * 0.55, by = 404 + Math.sin(k - 0.22) * dl * 0.55;
    const cx = 300 + Math.cos(k + 0.22) * dl * 0.55, cy = 404 + Math.sin(k + 0.22) * dl * 0.55;
    s += `M${(300 + Math.cos(k - 0.5) * 30).toFixed(1)} ${(404 + Math.sin(k - 0.5) * 12).toFixed(1)}Q${bx.toFixed(1)} ${by.toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)}Q${cx.toFixed(1)} ${cy.toFixed(1)} ${(300 + Math.cos(k + 0.5) * 30).toFixed(1)} ${(404 + Math.sin(k + 0.5) * 12).toFixed(1)}Z`;
  }
  return s;
};

export const SUKIENKI = [
  {
    id: 'balowa', nazwa: 'Suknia balowa', k: ['#ff8fc7', '#ffe0f0'], tagi: ['gala', 'ksiezniczka', 'slodka'],
    rysuj: (p, w) => {
      let s = p.ksztalt(BALOWA_SP, w.wyp, w.o) + obie(zdobienie('M280 410Q262 600 236 780M266 420Q236 600 196 776', w.o, 1.5, 0.4));
      s += `<path d="M166 700Q230 680 300 720Q370 680 434 700L446 764Q370 790 300 786Q230 790 154 764Z" fill="${w.k[1]}" stroke="${obrys(w.k[1])}" stroke-width="2" opacity=".9"/>`;
      const r = losowe(9);
      for (let i = 0; i < 18; i++) s += `<path d="${blysk(180 + r() * 240, 470 + r() * 290, 2 + r() * 3)}" fill="#fff" opacity=".9"/>`;
      s += p.ksztalt(STANIK, w.wyp, w.o) + `<path d="M262 404Q300 414 338 404" stroke="${w.k[1]}" stroke-width="6" stroke-linecap="round" fill="none"/>`;
      return { suknia: s, rekawy: obie(p.ksztalt('M250 300C220 294 202 318 208 346C222 356 240 352 250 344C252 326 254 312 254 302Z', w.k[1], obrys(w.k[1]))) };
    },
  },
  {
    id: 'czarownica', nazwa: 'Suknia czarownicy', k: ['#2b1d3a', '#7fb069'], tagi: ['halloween', 'czarownica'],
    rysuj: (p, w) => {
      const sp = sym([300, 400], [[262, 402], [236, 500, 214, 640, 198, 746], [218, 732], [232, 760], [250, 738], [264, 766], [282, 742], [300, 768]]);
      return {
        suknia: p.ksztalt(sp, w.wyp, w.o) + obie(zdobienie('M282 420Q272 580 262 760M268 420Q252 580 232 750', w.o, 1.5, 0.45)) +
          p.ksztalt(STANIK_V, w.wyp, w.o) + `<path d="M262 404Q300 412 338 404" stroke="${w.k[1]}" stroke-width="8" stroke-linecap="round" fill="none"/>` +
          `<rect x="292" y="400" width="16" height="13" rx="2" fill="none" stroke="#ffd23f" stroke-width="2.6"/>` +
          zdobienie('M283 282L300 340L317 282', w.k[1], 2.4, 0.9),
        rekawy: rekaw(p, 'dzwon', w.wyp, w.o),
      };
    },
  },
  {
    id: 'wampirzyca', nazwa: 'Suknia wampirzycy', k: ['#5c0a1e', '#1b1020'], tagi: ['halloween', 'wampir', 'gala'],
    rysuj: (p, w) => {
      const sp = sym([300, 400], [[262, 402], [242, 520, 222, 660, 206, 760], [214, 774], [226, 762], [238, 776], [250, 764], [262, 778], [274, 766], [286, 778], [300, 768]]);
      let s = p.ksztalt(sp, w.wyp, w.o) + obie(zdobienie('M284 420Q276 600 268 770', w.o, 1.5, 0.45));
      s += p.ksztalt(GORSET, w.k[1], obrys(w.k[1]));
      for (let y = 330; y < 450; y += 18) s += `<path d="M292 ${y}L308 ${y + 12}M308 ${y}L292 ${y + 12}" stroke="${w.k[0]}" stroke-width="2.2" stroke-linecap="round"/>`;
      return { suknia: s, rekawy: rekaw(p, 'dlugi', w.wyp, w.o) };
    },
  },
  {
    id: 'mini', nazwa: 'Mini sukienka', k: ['#ff5d8f', '#ffffff'], tagi: ['codzienna', 'gwiazda', 'slodka'],
    rysuj: (p, w) => {
      const d = sym([300, 312], [[290, 312, 282, 302, 280, 290], [272, 290], [266, 314, 254, 332, 246, 340], [256, 368, 262, 392, 262, 404], [246, 440, 232, 480, 226, 512], [260, 520, 280, 522, 300, 522]]);
      return { suknia: p.ksztalt(d, w.wyp, w.o) + `<path d="M262 404Q300 412 338 404" stroke="${w.k[1]}" stroke-width="5" fill="none" stroke-linecap="round"/>` + `<path d="M300 408l-14 -8v16zM300 408l14 -8v16z" fill="${w.k[1]}" stroke="${obrys(w.k[1])}" stroke-width="1.6" stroke-linejoin="round"/>` };
    },
  },
  {
    id: 'cekinowa', nazwa: 'Cekinowa', k: ['#ffd23f', '#ffffff'], wz: 'brokat', tagi: ['gala', 'gwiazda'],
    rysuj: (p, w) => {
      const d = sym([300, 312], [[290, 312, 282, 302, 280, 290], [272, 290], [266, 314, 254, 332, 246, 340], [256, 368, 262, 392, 262, 405], [262, 430, 246, 446, 244, 466], [240, 490], [262, 498, 282, 500, 300, 500]]);
      return { suknia: p.ksztalt(d, w.wyp, w.o) + zdobienie('M242 478L358 478', w.o, 1.4, 0.5) };
    },
  },
  {
    id: 'letnia', nazwa: 'Letnia sukienka', k: ['#fff3b0', '#ff8fc7'], wz: 'kwiatki', tagi: ['codzienna', 'plaza', 'paryz', 'wrozka'],
    rysuj: (p, w) => {
      const d = sym([300, 300], [[289, 300, 282, 292, 280, 284], [262, 288, 248, 292, 240, 296], [246, 340], [256, 368, 262, 392, 262, 404], [240, 480, 214, 570, 206, 640], [230, 652, 262, 656, 300, 656]]);
      return { suknia: p.ksztalt(d, w.wyp, w.o) + obie(zdobienie('M280 420Q268 540 256 652M268 420Q246 540 230 648', w.o, 1.4, 0.4)) + `<path d="M262 404Q300 412 338 404" stroke="${w.k[1]}" stroke-width="4" fill="none"/>`, rekawy: rekaw(p, 'motylek', w.wyp, w.o) };
    },
  },
  {
    id: 'syrena', nazwa: 'Syrenia', k: ['#2ec4b6', '#c77dff'], wz: 'brokat', tagi: ['syrena', 'gala', 'plaza'],
    rysuj: (p, w) => {
      const d = sym([300, 312], [[290, 302, 280, 296, 270, 298], [258, 302, 250, 320, 246, 340], [256, 368, 262, 392, 262, 404], [262, 428, 244, 440, 244, 462], [246, 540, 256, 600, 266, 640], [236, 700, 206, 740, 192, 772], [250, 780, 276, 782, 300, 778]]);
      const pletwa = `M266 640C236 700 206 740 192 772C230 778 262 780 300 778L300 660Z`;
      return {
        suknia: p.ksztalt(d, w.wyp, w.o) + `<path d="${pletwa}" fill="${w.k[1]}" opacity=".55"/><path d="${pletwa}" fill="${w.k[1]}" opacity=".55" transform="matrix(-1 0 0 1 600 0)"/>` +
          obie(zdobienie('M268 650Q240 710 214 768M280 656Q266 716 252 776M292 660Q288 720 284 778', obrys(w.k[1]), 1.6, 0.6)) +
          zdobienie('M246 630Q300 650 354 630', w.o, 2, 0.6),
      };
    },
  },
  {
    id: 'wrozka', nazwa: 'Płatki wróżki', k: ['#a0e7c0', '#ffb3d9'], tagi: ['wrozka', 'slodka'],
    rysuj: (p, w) => {
      const tylne = PLATKI(7, 140, 40, 140), przednie = PLATKI(6, 112, 52, 128);
      return {
        suknia: `<path d="${tylne}" fill="${w.k[1]}" stroke="${obrys(w.k[1])}" stroke-width="2" stroke-linejoin="round" opacity=".9"/>` +
          `<path d="${przednie}" fill="${w.wyp}" stroke="${w.o}" stroke-width="2.2" stroke-linejoin="round"/>` +
          p.ksztalt(STANIK, w.wyp, w.o) + `<path d="M262 404Q300 412 338 404" stroke="${w.k[1]}" stroke-width="5" fill="none" stroke-linecap="round"/>` +
          [[272, 330], [312, 360], [290, 388]].map(([x, y]) => `<path d="${blysk(x, y, 4)}" fill="#fff"/>`).join(''),
      };
    },
  },
  {
    id: 'duszek', nazwa: 'Sukienka duszek', k: ['#ffffff', '#1b1020'], tagi: ['halloween', 'duch', 'slodka'],
    rysuj: (p, w) => {
      const d = sym([300, 300], [[289, 300, 282, 292, 280, 284], [262, 288, 248, 292, 240, 296], [246, 340], [252, 370, 258, 392, 258, 404], [232, 480, 206, 560, 194, 626], [214, 612], [226, 640], [244, 618], [258, 644], [278, 622], [300, 646]]);
      return {
        suknia: `<path d="${d}" fill="${mieszaj(w.k[0], '#c9d6ff', 0.35)}" opacity=".6" transform="translate(0 16)"/>` + p.ksztalt(d, w.wyp, mieszaj(w.k[0], '#7a86b8', 0.6)) +
          `<ellipse cx="290" cy="352" rx="5" ry="8" fill="${w.k[1]}"/><ellipse cx="310" cy="352" rx="5" ry="8" fill="${w.k[1]}"/><ellipse cx="300" cy="376" rx="6" ry="8" fill="${w.k[1]}"/>` +
          `<ellipse cx="281" cy="368" rx="6" ry="3.5" fill="#ff8fb1" opacity=".6"/><ellipse cx="319" cy="368" rx="6" ry="3.5" fill="#ff8fb1" opacity=".6"/>`,
        rekawy: rekaw(p, 'dzwon', w.wyp, mieszaj(w.k[0], '#7a86b8', 0.6)),
      };
    },
  },
  {
    id: 'dynia', nazwa: 'Kostium dyni', k: ['#ff8a1f', '#5b7a2a'], tagi: ['halloween', 'dynia'],
    rysuj: (p, w) => {
      const o = w.o, c = w.wyp;
      let s = p.ksztalt(STANIK_RAM, '#1b1020', '#000');
      s += `<ellipse cx="248" cy="414" rx="62" ry="100" fill="${c}" stroke="${o}" stroke-width="2.6"/><ellipse cx="352" cy="414" rx="62" ry="100" fill="${c}" stroke="${o}" stroke-width="2.6"/>` +
        `<ellipse cx="300" cy="414" rx="58" ry="106" fill="${c}" stroke="${o}" stroke-width="2.6"/><ellipse cx="300" cy="414" rx="100" ry="106" fill="${p.cien}"/>`;
      s += `<g fill="#3a1a08"><path d="${gwiazda(278, 390, 13, 3, 0.5)}"/><path d="${gwiazda(322, 390, 13, 3, 0.5)}"/>` +
        `<path d="M266 428Q300 476 334 428L320 436L310 428L300 438L290 428L280 436Z"/></g>`;
      s += obie(`<path d="M300 300L268 292L278 312L254 306L268 326Z" fill="${w.k[1]}" stroke="${obrys(w.k[1])}" stroke-width="2" stroke-linejoin="round"/>`);
      return { suknia: s };
    },
  },
  {
    id: 'szkielet', nazwa: 'Kombinezon szkielet', k: ['#1b1020', '#f4f1ea'], tagi: ['halloween', 'szkielet'],
    rysuj: (p, w) => ({ suknia: p.ksztalt(KOMBINEZON, w.wyp, w.o) + kosci(w.o, w.k[1]), rekawy: rekaw(p, 'dlugi', w.wyp, w.o) + kosciRece(w.k[1]) }),
  },
  {
    id: 'kotka', nazwa: 'Kombinezon kotki', k: ['#1b1020', '#4a3a5a'], tagi: ['halloween', 'kot'],
    rysuj: (p, w) => ({
      suknia: p.ksztalt(KOMBINEZON, w.wyp, w.o) + `<ellipse cx="300" cy="390" rx="30" ry="48" fill="${w.k[1]}"/>` + zdobienie('M262 404Q300 410 338 404', jasniej(w.k[0], 0.25), 1.4, 0.6),
      rekawy: rekaw(p, 'dlugi', w.wyp, w.o),
    }),
  },
  {
    id: 'kosmiczny', nazwa: 'Kosmiczny kombinezon', k: ['#d9e2f2', '#7b6cf6'], tagi: ['kosmos'],
    rysuj: (p, w) => ({
      suknia: p.ksztalt(KOMBINEZON, p.gradient(jasniej(w.k[0], 0.4), w.k[0]), w.o) +
        `<path d="M262 404Q300 412 338 404" stroke="${w.k[1]}" stroke-width="10" fill="none"/><path d="${gwiazda(300, 408, 9)}" fill="#ffd23f" stroke="#c99a00" stroke-width="1.4"/>` +
        obie(`<path d="M248 590Q276 600 296 592" stroke="${w.k[1]}" stroke-width="6" fill="none"/>`) + `<path d="M274 330L326 330L322 360L278 360Z" fill="${w.k[1]}" opacity=".85"/>` +
        `<circle cx="288" cy="345" r="4" fill="#ff5d8f"/><circle cx="300" cy="345" r="4" fill="#5fd068"/><circle cx="312" cy="345" r="4" fill="#ffd23f"/>`,
      rekawy: rekaw(p, 'dlugi', w.wyp, w.o),
    }),
  },
];

/* ---------- OKRYCIA ---------- */
function otwarta(p, w, dl, { kolnierz = true, guziki = true } = {}) {
  // połowa rozpiętej kurtki: od barku do dołu, przód kończy się przy x = 284
  const pol = `M283 280C262 284 246 290 238 296L244 340C252 370 258 400 256 ${dl - 30}L252 ${dl}L286 ${dl + 4}L288 ${dl - 40}L282 330L288 290Z`;
  let s = p.ksztalt(pol, w.wyp, w.o);
  if (kolnierz) s += p.ksztalt('M285 279L264 296L279 326L291 300Z', w.wyp, w.o, { cien: false });
  if (guziki) for (let y = 350; y < dl - 10; y += 40) s += `<circle cx="279" cy="${y}" r="3" fill="${w.k[1]}" stroke="${obrys(w.k[1])}" stroke-width="1"/>`;
  return obie(s);
}

export const OKRYCIA = [
  {
    id: 'peleryna', nazwa: 'Peleryna', k: ['#1b1020', '#c1121f'], tagi: ['halloween', 'czarownica', 'wampir', 'ksiezniczka'],
    rysuj: (p, w) => ({
      tyl: p.ksztalt(sym([300, 278], [[268, 278, 236, 288, 224, 312], [198, 500, 176, 650, 166, 762], [228, 774, 270, 776, 300, 776]]), w.wyp, w.o) +
        `<path d="M222 330C198 500 180 650 172 756L196 760C204 640 216 500 236 330Z" fill="${w.k[1]}" opacity=".9"/><g transform="matrix(-1 0 0 1 600 0)"><path d="M222 330C198 500 180 650 172 756L196 760C204 640 216 500 236 330Z" fill="${w.k[1]}" opacity=".9"/></g>`,
      szyja: `<path d="M276 284Q300 296 324 284" stroke="${w.k[1]}" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M300 292l-14 -8v18zM300 292l14 -8v18z" fill="${w.k[1]}" stroke="${obrys(w.k[1])}" stroke-width="1.6" stroke-linejoin="round"/><circle cx="300" cy="292" r="4" fill="#ffd23f"/>`,
    }),
  },
  {
    id: 'wampirza', nazwa: 'Peleryna z kołnierzem', k: ['#1b1020', '#c1121f'], tagi: ['halloween', 'wampir'],
    rysuj: (p, w) => {
      const kol = sym([300, 284], [[272, 284], [240, 250, 214, 196, 204, 146], [228, 168, 252, 198, 262, 214], [256, 186, 262, 168, 270, 150], [276, 200, 284, 236, 300, 250]]);
      return {
        tyl: p.ksztalt(sym([300, 278], [[268, 278, 236, 288, 224, 312], [196, 500, 172, 650, 160, 764], [228, 776, 270, 778, 300, 778]]), w.wyp, w.o),
        wlosyTyl: p.ksztalt(kol, w.k[1], obrys(w.k[1])) + `<path d="${kol}" fill="none" stroke="${w.k[0]}" stroke-width="5" opacity=".9"/>`,
        szyja: `<circle cx="300" cy="290" r="7" fill="#ffd23f" stroke="#a87b00" stroke-width="2"/><circle cx="300" cy="290" r="3" fill="${w.k[1]}"/>`,
      };
    },
  },
  {
    id: 'kaptur', nazwa: 'Peleryna z kapturem', k: ['#c1121f', '#ffd6d6'], tagi: ['halloween', 'bajka'],
    rysuj: (p, w) => ({
      tyl: p.ksztalt('M300 30C210 30 184 120 196 200C204 250 220 280 240 300L360 300C380 280 396 250 404 200C416 120 390 30 300 30Z', ciemniej(w.k[0], 0.2), w.o) +
        p.ksztalt(sym([300, 278], [[268, 278, 236, 288, 224, 312], [198, 500, 176, 650, 168, 760], [228, 772, 270, 774, 300, 774]]), w.wyp, w.o),
      szyja: `<path d="M276 286Q300 298 324 286" stroke="${w.k[1]}" stroke-width="4" fill="none"/><path d="M300 294l-12 -8v16zM300 294l12 -8v16z" fill="${w.k[1]}" stroke="${obrys(w.k[1])}" stroke-width="1.4"/>`,
    }),
  },
  {
    id: 'jeansowa', nazwa: 'Kurtka jeansowa', k: ['#5b8def', '#ffd23f'], tagi: ['codzienna'],
    rysuj: (p, w) => ({ okrycie: otwarta(p, w, 452) + obie(p.ksztalt('M252 352L276 350L276 372L254 374Z', w.wyp, w.o, { cien: false })), rekawy: rekaw(p, 'dlugi', w.wyp, w.o) }),
  },
  {
    id: 'kardigan', nazwa: 'Kardigan', k: ['#ffb3d9', '#ffffff'], tagi: ['codzienna', 'szkola', 'slodka'],
    rysuj: (p, w) => ({ okrycie: otwarta(p, w, 500, { kolnierz: false }) + obie(zdobienie('M256 486L286 490', w.o, 1.4, 0.5)), rekawy: rekaw(p, 'dlugi', w.wyp, w.o) }),
  },
  {
    id: 'ramoneska', nazwa: 'Ramoneska', k: ['#1b1020', '#c0c0d0'], tagi: ['gwiazda', 'codzienna', 'halloween'],
    rysuj: (p, w) => ({ okrycie: otwarta(p, w, 424, { guziki: false }) + obie(`<path d="M262 372L276 370" stroke="${w.k[1]}" stroke-width="2.4"/><circle cx="268" cy="330" r="2.6" fill="${w.k[1]}"/>`), rekawy: rekaw(p, 'dlugi', w.wyp, w.o) }),
  },
  {
    id: 'plaszcz', nazwa: 'Płaszcz', k: ['#c58556', '#3b2418'], tagi: ['paryz', 'zima', 'codzienna'],
    rysuj: (p, w) => {
      const d = sym([300, 300], [[290, 296, 285, 290, 283, 280], [262, 284, 246, 290, 238, 296], [244, 340], [254, 368, 262, 392, 262, 405], [254, 450, 240, 540, 234, 608], [270, 614, 300, 614]]);
      return {
        okrycie: p.ksztalt(d, w.wyp, w.o) + obie(p.ksztalt('M285 279L262 298L282 340L298 310Z', w.wyp, w.o, { cien: false })) +
          `<path d="M262 410L338 410" stroke="${w.k[1]}" stroke-width="9"/><rect x="292" y="403" width="16" height="14" rx="2" fill="none" stroke="#ffd23f" stroke-width="2.4"/>` +
          [350, 380, 450, 500].map(y => `<circle cx="286" cy="${y}" r="3.4" fill="${w.k[1]}"/><circle cx="314" cy="${y}" r="3.4" fill="${w.k[1]}"/>`).join('') + zdobienie('M300 420L300 612', w.o, 1.4, 0.5),
        rekawy: rekaw(p, 'dlugi', w.wyp, w.o),
      };
    },
  },
  {
    id: 'futerko', nazwa: 'Futrzane bolerko', k: ['#fff4fa', '#ffffff'], tagi: ['zima', 'gala', 'ksiezniczka'],
    rysuj: (p, w) => {
      const r = losowe(4);
      let futro = '';
      for (let i = 0; i < 16; i++) futro += `<circle cx="${(222 + r() * 50).toFixed(1)}" cy="${(290 + r() * 70).toFixed(1)}" r="${(9 + r() * 6).toFixed(1)}" fill="${w.k[0]}" stroke="${mieszaj(w.k[0], '#9a8aa8', 0.5)}" stroke-width="1.6"/>`;
      return { rekawy: obie(futro + `<path d="M228 300Q246 330 262 352" fill="none" stroke="${mieszaj(w.k[0], '#9a8aa8', 0.5)}" stroke-width="1.4" opacity=".5"/>`) };
    },
  },
];

/* ---------- RAJSTOPY I SKARPETKI ---------- */
function nogi(p, wyp, o, odY = 0) {
  const ksz = `<path d="${NOGA}" fill="${wyp}" stroke="${o}" stroke-width="2.4"/><path d="${STOPA}" fill="${wyp}" stroke="${o}" stroke-width="2.4"/>`;
  if (!odY) return obie(ksz) + `<path d="M262 404L338 404L338 470L262 470Z" fill="${wyp}"/>`;
  const klip = p.id('nk');
  p.defs.push(`<clipPath id="${klip}"><rect x="0" y="${odY}" width="600" height="${800 - odY}"/></clipPath>`);
  return `<g clip-path="url(#${klip})">${obie(ksz)}</g>`;
}
export const RAJSTOPY = [
  { id: 'rajstopy', nazwa: 'Rajstopy', k: ['#1b1020', '#c77dff'], tagi: ['codzienna', 'halloween', 'szkola'], rysuj: (p, w) => ({ rajstopy: nogi(p, w.wyp, w.o) }) },
  { id: 'pasiaste', nazwa: 'Pasiaste', k: ['#7b2cbf', '#1b1020'], wz: 'paski', tagi: ['halloween', 'czarownica'], rysuj: (p, w) => ({ rajstopy: nogi(p, w.wyp, w.o) }) },
  {
    id: 'kabaretki', nazwa: 'Kabaretki', k: ['#1b1020', '#1b1020'], tagi: ['halloween', 'gwiazda', 'wampir'],
    rysuj: (p, w) => {
      const id = p.id('kab');
      p.defs.push(`<pattern id="${id}" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path d="M0 0L10 0M0 0L0 10" stroke="${w.k[0]}" stroke-width="1.3" fill="none"/></pattern>`);
      return { rajstopy: obie(`<path d="${NOGA}" fill="url(#${id})"/><path d="${STOPA}" fill="url(#${id})"/>`) };
    },
  },
  {
    id: 'ponczochy', nazwa: 'Pończochy', k: ['#ffffff', '#ff8fc7'], tagi: ['slodka', 'ksiezniczka'],
    rysuj: (p, w) => ({ rajstopy: nogi(p, w.wyp, w.o, 540) + obie(`<path d="M248 542Q272 550 296 544" stroke="${w.k[1]}" stroke-width="6" fill="none"/>`) }),
  },
  {
    id: 'podkolanowki', nazwa: 'Podkolanówki', k: ['#ffffff', '#5b8def'], tagi: ['szkola', 'slodka', 'codzienna'],
    rysuj: (p, w) => ({ rajstopy: nogi(p, w.wyp, w.o, 590) + obie(`<path d="M260 598L296 598" stroke="${w.k[1]}" stroke-width="4"/><path d="M260 606L296 606" stroke="${w.k[1]}" stroke-width="2.4"/>`) }),
  },
  { id: 'skarpetki', nazwa: 'Skarpetki', k: ['#ffffff', '#ff8fc7'], tagi: ['codzienna'], rysuj: (p, w) => ({ rajstopy: nogi(p, w.wyp, w.o, 706) + obie(`<path d="M270 712L294 712" stroke="${w.k[1]}" stroke-width="3"/>`) }) },
  {
    id: 'getry', nazwa: 'Getry', k: ['#ff8fc7', '#ffffff'], wz: 'paski', tagi: ['zima', 'gwiazda'],
    rysuj: (p, w) => ({ rajstopy: obie(p.ksztalt('M260 640Q280 632 300 640L302 690Q304 712 298 740L270 740Q262 714 264 690Z', w.wyp, w.o) + zdobienie('M268 660L296 660M266 680L298 680M266 700L299 700', w.o, 1.2, 0.4)) }),
  },
];

/* ---------- BUTY ---------- */
const buty = (s) => ({ buty: obie(s) });
export const BUTY = [
  {
    id: 'trampki', nazwa: 'Trampki', k: ['#ff5d8f', '#ffffff'], tagi: ['codzienna', 'szkola', 'plaza'],
    rysuj: (p, w) => buty(p.ksztalt('M264 742C260 758 260 770 268 776L298 776C302 768 301 752 297 738L276 734Z', w.wyp, w.o) +
      `<path d="M262 768L300 768L300 778L266 778Z" fill="${w.k[1]}" stroke="${obrys(w.k[1])}" stroke-width="2"/>` +
      `<path d="M276 744L292 742M275 752L294 750" stroke="${w.k[1]}" stroke-width="2.2" stroke-linecap="round"/><path d="M266 762Q272 758 278 762" fill="none" stroke="${w.o}" stroke-width="1.4"/>`),
  },
  {
    id: 'baleriny', nazwa: 'Baleriny', k: ['#ffb3d9', '#ff5d8f'], tagi: ['slodka', 'gala', 'paryz', 'ksiezniczka'],
    rysuj: (p, w) => buty(p.ksztalt('M264 754C261 768 268 777 280 777L292 777C299 773 299 762 296 750Q280 760 264 754Z', w.wyp, w.o) +
      `<path d="M281 758l-8 -5v10zM281 758l8 -5v10z" fill="${w.k[1]}" stroke="${obrys(w.k[1])}" stroke-width="1.2"/>`),
  },
  {
    id: 'kozaki', nazwa: 'Kozaki', k: ['#1b1020', '#ffd23f'], tagi: ['gwiazda', 'zima', 'wampir', 'halloween'],
    rysuj: (p, w) => buty(p.ksztalt('M256 600L298 600C298 660 300 700 299 740C301 760 300 772 294 778L268 778C259 774 260 760 266 740C264 700 256 650 256 600Z', w.wyp, w.o) +
      `<path d="M256 600L298 600L298 614L257 614Z" fill="${mieszaj(w.k[0], '#ffffff', 0.15)}" stroke="${w.o}" stroke-width="2"/><path d="M292 622L292 730" stroke="${w.k[1]}" stroke-width="1.8" opacity=".8"/>`),
  },
  {
    id: 'glany', nazwa: 'Glany', k: ['#2b1d3a', '#ffd23f'], tagi: ['halloween', 'gwiazda', 'zombie'],
    rysuj: (p, w) => buty(p.ksztalt('M264 680L298 680L299 740C302 756 302 768 298 772L264 772C258 766 258 750 264 738Z', w.wyp, w.o) +
      `<path d="M258 766L304 766L304 782L258 782Z" fill="#2a2030" stroke="#000" stroke-width="2"/>` +
      [690, 702, 714, 726].map(y => `<path d="M272 ${y}L292 ${y + 5}M292 ${y}L272 ${y + 5}" stroke="${w.k[1]}" stroke-width="1.6"/>`).join('')),
  },
  {
    id: 'szpilki', nazwa: 'Szpilki', k: ['#c1121f', '#ffd23f'], tagi: ['gala', 'gwiazda', 'wampir'],
    rysuj: (p, w) => buty(p.ksztalt('M266 752C264 766 274 780 282 784C292 780 298 768 296 752Q281 758 266 752Z', w.wyp, w.o) +
      `<path d="M274 734Q283 742 293 734" stroke="${w.wyp}" stroke-width="3.4" fill="none"/><path d="${gwiazda(282, 766, 3.4, 4, 0.4)}" fill="${w.k[1]}"/>`),
  },
  {
    id: 'czarownicy', nazwa: 'Buty czarownicy', k: ['#1b1020', '#ffd23f'], tagi: ['halloween', 'czarownica'],
    rysuj: (p, w) => buty(p.ksztalt('M270 688L298 688L298 760C292 772 270 776 250 774C240 772 238 762 245 758C254 762 262 756 266 746Z', w.wyp, w.o) +
      `<rect x="272" y="726" width="20" height="14" rx="2" fill="none" stroke="${w.k[1]}" stroke-width="2.6"/>` +
      `<path d="M270 688L298 688" stroke="${w.o}" stroke-width="4"/>`),
  },
  {
    id: 'sandaly', nazwa: 'Sandałki', k: ['#ffd23f', '#ff8fc7'], tagi: ['plaza', 'codzienna', 'syrena'],
    rysuj: (p, w) => buty(`<path d="M262 774L300 774L299 780L263 780Z" fill="${w.k[0]}" stroke="${w.o}" stroke-width="2"/>` +
      `<path d="M268 760L296 758M272 742L294 740M282 740L282 760" stroke="${w.k[0]}" stroke-width="4" stroke-linecap="round"/>` + `<circle cx="282" cy="759" r="3.5" fill="${w.k[1]}"/>`),
  },
  {
    id: 'kapcie', nazwa: 'Kapcie króliczki', k: ['#ffffff', '#ff8fc7'], tagi: ['slodka'],
    rysuj: (p, w) => buty(`<ellipse cx="268" cy="736" rx="6" ry="16" transform="rotate(-18 268 736)" fill="${w.k[0]}" stroke="${obrys(w.k[0])}" stroke-width="2"/><ellipse cx="268" cy="738" rx="2.6" ry="10" transform="rotate(-18 268 736)" fill="${w.k[1]}"/>` +
      p.ksztalt('M258 762C256 742 270 736 282 736C296 736 304 746 302 762C302 776 290 782 280 782C266 782 258 776 258 762Z', w.wyp, obrys(w.k[0])) +
      `<circle cx="275" cy="756" r="2" fill="#1b1020"/><circle cx="288" cy="756" r="2" fill="#1b1020"/><ellipse cx="281" cy="763" rx="2.4" ry="1.6" fill="${w.k[1]}"/>`),
  },
  {
    id: 'botki', nazwa: 'Botki z futerkiem', k: ['#c58556', '#fff4fa'], tagi: ['zima'],
    rysuj: (p, w) => buty(p.ksztalt('M264 704L298 704L299 744C302 760 302 770 296 776L266 776C258 770 258 754 264 742Z', w.wyp, w.o) +
      [266, 276, 286, 296].map(x => `<circle cx="${x}" cy="704" r="7.5" fill="${w.k[1]}" stroke="${mieszaj(w.k[1], '#9a8aa8', 0.5)}" stroke-width="1.4"/>`).join('')),
  },
];


// Klocki dla kolekcji zimowej (katalog-zima-*.js) – te same rękawy i kroje, żeby nowe ubrania pasowały do starych.
export { REKAWY, rekaw, zdobienie, otwarta, nogi, falbany, TUTU, SWETER, KOSZULKA, STANIK, STANIK_V, STANIK_RAM, KOMBINEZON };
