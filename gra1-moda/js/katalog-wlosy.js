// Fryzury: część tylna (za ciałem) i przednia „czapa” wokół twarzy. Grzywka to osobny wybór, kolor bierze z fryzury.
// Kolory fryzury: [nasada, końcówki (ombre), gumki i spinki].
import { sym, obie, obrys } from './narzedzia.js';

const wlosyWyp = (p, k) => k[0] === k[1] ? k[0] : p.gradient(k[0], k[1], 90, 560, 'userSpaceOnUse');

// Czapa włosów nad czołem z kosmykami po bokach twarzy; dl = gdzie kończą się kosmyki.
function czapa(dl = 232, szer = 0) {
  return sym([300, 69], [
    [254, 67, 219 - szer, 98, 218 - szer, 148],
    [217 - szer, 186, 220 - szer, dl - 34, 227 - szer, dl],
    [236, dl + 5, 244, dl - 2],
    [241, dl - 40, 240, 164, 252, 132],
    [266, 114, 286, 110, 300, 114],
  ]);
}
const tylGlowy = sym([300, 70], [[254, 68, 220, 100, 220, 150], [220, 190, 226, 218, 238, 234], [300, 240]]);

function kosmyki(o) {
  // kilka pasm i połysk – bez nich włosy wyglądają jak plastikowy hełm
  return `<path d="M250 104Q300 80 350 104" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" opacity=".28"/>` +
    `<path d="M262 100Q276 92 290 92" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".45"/>` +
    obie(`<path d="M232 130Q228 170 234 210" fill="none" stroke="${o}" stroke-width="1.6" opacity=".45"/><path d="M246 98Q238 106 234 120" fill="none" stroke="${o}" stroke-width="1.6" opacity=".45"/>`);
}

function warkocz(p, wyp, o, gumka) {
  let s = '';
  for (let i = 0; i < 10; i++) {
    const y = 218 + i * 24, x = 233 + Math.sin(i * 0.5) * 2 + i * 0.6, r = 14 - i * 0.45;
    s += `<ellipse cx="${(x + (i % 2 ? 3 : -3)).toFixed(1)}" cy="${y}" rx="${r.toFixed(1)}" ry="${(r + 3).toFixed(1)}" transform="rotate(${i % 2 ? 25 : -25} ${x} ${y})" fill="${wyp}" stroke="${o}" stroke-width="2.2"/>`;
  }
  s += `<path d="M232 456Q222 480 228 496Q236 486 238 500Q244 484 244 458Z" fill="${wyp}" stroke="${o}" stroke-width="2.2" stroke-linejoin="round"/>` +
    `<ellipse cx="238" cy="452" rx="9" ry="5" fill="${gumka}" stroke="${obrys(gumka)}" stroke-width="2"/>`;
  return obie(s);
}

function chmura(p, wyp, o) {
  let s = '';
  for (let i = 0; i < 22; i++) {
    const k = (i / 22) * Math.PI * 2, x = 300 + Math.cos(k) * 108, y = 160 + Math.sin(k) * 112;
    if (y > 260) continue;
    s += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="34" fill="${wyp}" stroke="${o}" stroke-width="2.6"/>`;
  }
  return s + `<ellipse cx="300" cy="165" rx="112" ry="112" fill="${wyp}"/>`;
}

const STYLE = {
  dlugie: {
    nazwa: 'Długie proste', dl: 292,
    tyl: () => sym([300, 72], [[252, 70, 216, 100, 214, 160], [212, 240, 208, 360, 206, 468], [214, 480, 222, 484, 230, 474], [236, 486, 246, 488, 254, 478], [262, 486, 272, 486, 280, 476], [300, 470]]),
  },
  fale: {
    nazwa: 'Fale', dl: 300, tagi: ['syrena', 'gala'],
    tyl: () => sym([300, 72], [[250, 70, 212, 102, 210, 160], [204, 210, 222, 250, 206, 300], [192, 350, 218, 392, 202, 440], [190, 480, 212, 512, 226, 500], [238, 512, 252, 508, 258, 496], [300, 480]]),
  },
  syrenka: {
    nazwa: 'Bardzo długie', dl: 310, tagi: ['syrena', 'wrozka'],
    tyl: () => sym([300, 72], [[248, 70, 208, 104, 206, 160], [198, 230, 220, 280, 200, 350], [184, 420, 214, 470, 196, 540], [182, 600, 206, 640, 214, 662], [226, 676, 242, 670, 246, 654], [256, 668, 270, 664, 274, 648], [300, 630]]),
  },
  bob: {
    nazwa: 'Bob', dl: 262, szer: 4,
    tyl: () => sym([300, 72], [[252, 70, 212, 100, 210, 160], [208, 205, 210, 245, 220, 268], [236, 276, 252, 270, 262, 258], [300, 250]]),
  },
  krotkie: { nazwa: 'Krótkie', dl: 206, tyl: () => tylGlowy },
  kucyk: {
    nazwa: 'Kucyk', dl: 226,
    tyl: (p, wyp, o, k) => `<path d="${tylGlowy}" fill="${wyp}" stroke="${o}" stroke-width="2.6"/>` +
      `<path d="M330 84C392 54 440 110 430 190C424 250 448 300 426 352C410 330 392 280 394 220C396 160 380 120 344 102Z" fill="${wyp}" stroke="${o}" stroke-width="2.6" stroke-linejoin="round"/>` +
      `<path d="M404 140Q420 200 410 260" fill="none" stroke="${o}" stroke-width="1.6" opacity=".5"/>` +
      `<ellipse cx="340" cy="88" rx="10" ry="13" transform="rotate(-30 340 88)" fill="${k[2]}" stroke="${obrys(k[2])}" stroke-width="2"/>`,
  },
  kucyki: {
    nazwa: 'Dwa kucyki', dl: 226, tagi: ['slodka'],
    tyl: (p, wyp, o, k) => `<path d="${tylGlowy}" fill="${wyp}" stroke="${o}" stroke-width="2.6"/>` +
      obie(`<path d="M228 146C188 146 166 210 174 290C180 340 166 380 184 412C200 382 214 334 212 284C210 232 222 192 238 170Z" fill="${wyp}" stroke="${o}" stroke-width="2.6" stroke-linejoin="round"/>` +
        `<path d="M196 220Q190 280 196 340" fill="none" stroke="${o}" stroke-width="1.6" opacity=".5"/>`),
    przod: (p, wyp, o, k) => obie(`<circle cx="226" cy="156" r="9" fill="${k[2]}" stroke="${obrys(k[2])}" stroke-width="2"/><circle cx="223" cy="153" r="3" fill="#fff" opacity=".5"/>`),
  },
  kok: {
    nazwa: 'Kok baletnicy', dl: 226, tagi: ['gala'],
    tyl: (p, wyp, o) => `<path d="${tylGlowy}" fill="${wyp}" stroke="${o}" stroke-width="2.6"/>` +
      `<circle cx="300" cy="50" r="34" fill="${wyp}" stroke="${o}" stroke-width="2.6"/><path d="M276 46Q300 22 322 44Q304 34 290 54" fill="none" stroke="${o}" stroke-width="1.8" opacity=".6"/>`,
    przod: (p, wyp, o, k) => `<path d="M274 74Q300 84 326 74" fill="none" stroke="${k[2]}" stroke-width="6" stroke-linecap="round"/>`,
  },
  koczki: {
    nazwa: 'Koczki', dl: 230, tagi: ['slodka', 'kosmos'],
    tyl: (p, wyp, o) => `<path d="${tylGlowy}" fill="${wyp}" stroke="${o}" stroke-width="2.6"/>` +
      obie(`<circle cx="242" cy="74" r="29" fill="${wyp}" stroke="${o}" stroke-width="2.6"/><path d="M226 70Q240 50 258 66" fill="none" stroke="${o}" stroke-width="1.8" opacity=".55"/>`),
    przod: (p, wyp, o, k) => obie(`<path d="M252 98Q262 92 270 98" fill="none" stroke="${k[2]}" stroke-width="5" stroke-linecap="round"/>`),
  },
  warkocze: {
    nazwa: 'Warkocze', dl: 226, tagi: ['slodka', 'wrozka'],
    tyl: (p, wyp, o) => `<path d="${tylGlowy}" fill="${wyp}" stroke="${o}" stroke-width="2.6"/>`,
    przod: (p, wyp, o, k) => warkocz(p, wyp, o, k[2]),
  },
  loki: {
    nazwa: 'Burza loków', dl: 238, szer: 6, tagi: ['gwiazda'],
    tyl: (p, wyp, o) => chmura(p, wyp, o),
  },
  polkucyk: {
    nazwa: 'Półkucyk', dl: 292, tagi: ['wrozka', 'gala'],
    tyl: (p, wyp, o) => `<path d="${STYLE.dlugie.tyl()}" fill="${wyp}" stroke="${o}" stroke-width="2.6"/>`,
    przod: (p, wyp, o, k) => `<path d="M276 72Q300 64 324 72L320 80Q300 72 280 80Z" fill="${k[2]}" stroke="${obrys(k[2])}" stroke-width="1.8"/>`,
  },
};

export const FRYZURY = Object.entries(STYLE).map(([id, s]) => ({ id, nazwa: s.nazwa, tagi: s.tagi || [], k: ['#6b3e26', '#6b3e26', '#ff5d8f'] }));

export function rysujFryzure(p, w) {
  const s = STYLE[w.id] || STYLE.dlugie;
  const wyp = wlosyWyp(p, w.k), o = obrys(w.k[0]);
  const t = s.tyl(p, wyp, o, w.k);
  const tyl = t.startsWith('<') ? t : `<path d="${t}" fill="${wyp}" stroke="${o}" stroke-width="2.6" stroke-linejoin="round"/>`;
  const cz = czapa(s.dl, s.szer || 0);
  let przod = `<path d="${cz}" fill="${wyp}" stroke="${o}" stroke-width="2.6" stroke-linejoin="round"/>` + kosmyki(o);
  if (w.id === 'loki') {
    // loki wychodzą też nad czoło – kilka kółek na brzegu czapy
    for (let i = 0; i < 9; i++) {
      const k = Math.PI + (i / 8) * Math.PI, x = 300 + Math.cos(k) * 74, y = 120 + Math.sin(k) * 50;
      przod += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="16" fill="${wyp}" stroke="${o}" stroke-width="2"/>`;
    }
  }
  if (s.przod) przod += s.przod(p, wyp, o, w.k);
  return { wlosyTyl: tyl, wlosy: przod };
}

const GRZYWKI = {
  brak: { nazwa: 'Przedziałek', d: null },
  prosta: { nazwa: 'Prosta', d: 'M244 152C242 118 262 98 300 96C338 98 358 118 356 152L344 154L334 146L322 155L310 147L300 154L290 147L278 155L266 146L256 154Z' },
  kosmyki: { nazwa: 'Kosmyki', d: 'M240 170C236 120 262 96 300 94C338 96 364 120 360 168L348 140L340 166L326 132L314 162L300 128L288 160L274 130L262 164L254 138Z' },
  boczna: { nazwa: 'Na bok', d: 'M242 176C232 118 268 94 310 96C344 98 360 116 360 146C342 128 316 122 294 132C274 142 256 156 242 176Z' },
  zaslonka: { nazwa: 'Zasłonka', d: 'M300 104C278 110 256 132 248 172L240 172C240 128 262 100 300 98C338 100 360 128 360 172L352 172C344 132 322 110 300 104Z' },
  krotka: { nazwa: 'Krótka', d: 'M246 132C248 108 268 96 300 95C332 96 352 108 354 132L340 128L326 133L312 127L300 133L288 127L274 133L260 128Z' },
};
export const GRZYWKA = Object.entries(GRZYWKI).map(([id, g]) => ({ id, nazwa: g.nazwa }));

export function rysujGrzywke(p, w, stan) {
  const k = stan.w.fryzura?.k || ['#6b3e26', '#6b3e26'];
  const wyp = wlosyWyp(p, k), o = obrys(k[0]);
  const g = GRZYWKI[w.id];
  if (!g || !g.d) return { wlosy: `<path d="M300 114Q298 100 293 88" fill="none" stroke="${o}" stroke-width="2" stroke-linecap="round"/>` };
  return { wlosy: `<path d="${g.d}" fill="${wyp}" stroke="${o}" stroke-width="2.4" stroke-linejoin="round"/>` +
    `<path d="M268 108Q290 100 312 104" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".3"/>` };
}

export const KOLORY_WLOSOW = ['#1d1520', '#3b2418', '#6b3e26', '#a0623a', '#d08a4a', '#f2c46d', '#fbe3a0', '#f4f1ea', '#b8b8c8', '#c0392b', '#ff7a3d', '#ff8fc7', '#c77dff', '#7b6cf6', '#4cc9f0', '#5fd068', '#2ec4b6', '#ff4d8d'];
