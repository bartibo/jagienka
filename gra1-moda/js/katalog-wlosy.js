// Fryzury: część tylna (za ciałem) i przednia „czapa” wokół twarzy. Grzywka to osobny wybór, kolor bierze z fryzury.
// Kolory fryzury: [nasada, końcówki (ombre), gumki i spinki].
import { sym, obie, obrys, ciemniej, jasniej } from './narzedzia.js';
import { TWARZE } from './cialo.js';

const wlosyWyp = (p, k) => k[0] === k[1] ? k[0] : p.gradient(k[0], k[1], 90, 560, 'userSpaceOnUse');

// Czapa włosów nad czołem z kosmykami po bokach twarzy; dl = gdzie kończą się kosmyki.
function czapa(dl = 232, szer = 0) {
  return sym([300, 69], [
    [254, 67, 219 - szer, 98, 218 - szer, 148],
    [217 - szer, 186, 219 - szer, dl - 34, 225 - szer, dl - 2],
    // kosmyk przy policzku zwęża się w szpic, z drugim, krótszym obok
    [228 - szer, dl + 6, 233, dl + 11],
    [236, dl + 2, 238, dl - 6],
    [241, dl - 1, 244, dl - 2],
    [241, dl - 40, 240, 164, 252, 132],
    [266, 114, 286, 110, 300, 114],
  ]);
}
const tylGlowy = sym([300, 70], [[254, 68, 220, 100, 220, 150], [220, 190, 226, 218, 238, 234], [300, 240]]);

// Pasmo połysku („anielska aureola” z anime): gładka góra i ząbkowany dół wzdłuż łuku głowy.
const POLYSK = (() => {
  const P = [[224, 124], [300, 62], [376, 124]];
  const q = t => [0, 1].map(i => (1 - t) ** 2 * P[0][i] + 2 * t * (1 - t) * P[1][i] + t * t * P[2][i]);
  let d = `M${P[0][0]} ${P[0][1]}Q${P[1][0]} ${P[1][1]} ${P[2][0]} ${P[2][1]}`;
  for (let i = 14; i >= 0; i--) { const [x, y] = q(i / 14); d += `L${x.toFixed(1)} ${(y + (i % 2 ? 13 : 7)).toFixed(1)}`; }
  return d + 'Z';
})();

function kosmyki(p, o, czapa, kolor) {
  // pasma, połysk i cienkie kosmyki – bez nich włosy wyglądają jak plastikowy hełm
  const klip = p.id('cz');
  p.defs.push(`<clipPath id="${klip}"><path d="${czapa}"/></clipPath>`);
  return `<g clip-path="url(#${klip})"><path d="${POLYSK}" fill="${jasniej(kolor, 0.45)}" opacity=".5"/><path d="M262 90Q280 82 296 82" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".55"/></g>` +
    obie(`<path d="M232 130Q228 170 234 210" fill="none" stroke="${o}" stroke-width="1.6" opacity=".45"/><path d="M246 98Q238 106 234 120" fill="none" stroke="${o}" stroke-width="1.6" opacity=".45"/>` +
      `<path d="M288 74Q254 88 238 140" fill="none" stroke="${o}" stroke-width="1.3" opacity=".35"/><path d="M294 72Q266 92 254 126" fill="none" stroke="${o}" stroke-width="1.2" opacity=".3"/>` +
      `<path d="M226 160Q222 196 228 226" fill="none" stroke="#fff" stroke-width="2" opacity=".18" stroke-linecap="round"/>`);
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

// Warkocz przerzucony przez ramię: ogniwa coraz mniejsze ku dołowi, lekko falujące.
function warkoczBok(wyp, o, gumka) {
  let s = '';
  for (let i = 0; i < 11; i++) {
    const t = i / 10, x = 250 - 16 * t + 6 * Math.sin(t * 4), y = 214 + 246 * t, r = 15 - 6 * t;
    s += `<ellipse cx="${(x + (i % 2 ? 3 : -3)).toFixed(1)}" cy="${y.toFixed(1)}" rx="${r.toFixed(1)}" ry="${(r + 4).toFixed(1)}" transform="rotate(${i % 2 ? 28 : -28} ${x.toFixed(1)} ${y.toFixed(1)})" fill="${wyp}" stroke="${o}" stroke-width="2.2"/>`;
  }
  return s + `<path d="M232 468Q220 492 228 510Q236 498 240 512Q246 494 244 470Z" fill="${wyp}" stroke="${o}" stroke-width="2.2" stroke-linejoin="round"/>` +
    `<ellipse cx="238" cy="466" rx="10" ry="5" fill="${gumka}" stroke="${obrys(gumka)}" stroke-width="2"/>`;
}

// Korona z warkocza: ogniwa ułożone łukiem nad czołem.
function warkoczKorona(wyp, o) {
  let s = '';
  for (let i = 0; i <= 14; i++) {
    const k = (196 + i * 10.6) * Math.PI / 180, x = 300 + Math.cos(k) * 80, y = 150 + Math.sin(k) * 74, kat = (k * 180 / Math.PI) + 90 + (i % 2 ? 28 : -28);
    s += `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="10" ry="14" transform="rotate(${kat.toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})" fill="${wyp}" stroke="${o}" stroke-width="2"/>`;
  }
  return s;
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
    // końcówki zwężone w szpic, a nie zaokrąglone jak kiełbaski
    tyl: () => sym([300, 72], [[252, 70, 216, 100, 214, 160], [211, 240, 206, 360, 203, 462], [205, 478, 208, 488, 212, 500], [218, 488, 224, 482, 230, 480], [234, 490, 238, 500, 244, 508], [250, 494, 256, 486, 262, 484], [268, 494, 272, 502, 276, 508], [282, 492, 290, 484, 300, 480]]),
    pasma: 'M224 170Q216 320 214 470M238 200Q232 330 240 490',
  },
  fale: {
    nazwa: 'Fale', dl: 300, tagi: ['syrena', 'gala'], pasma: 'M222 170Q212 230 220 260Q206 330 214 400Q200 450 214 490',
    tyl: () => sym([300, 72], [[250, 70, 212, 102, 210, 160], [204, 210, 222, 250, 206, 300], [192, 350, 218, 392, 202, 440], [190, 480, 212, 512, 226, 500], [238, 512, 252, 508, 258, 496], [300, 480]]),
  },
  syrenka: {
    nazwa: 'Bardzo długie', dl: 310, tagi: ['syrena', 'wrozka'], pasma: 'M220 170Q212 260 218 330Q202 420 214 520Q204 600 220 650',
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
  warkoczBoczny: {
    nazwa: 'Warkocz na bok', dl: 236, tagi: ['zima', 'krolowa', 'wrozka'],
    tyl: () => sym([300, 72], [[252, 70, 214, 100, 212, 160], [210, 210, 214, 250, 226, 272], [244, 282, 262, 276, 272, 266], [300, 262]]),
    przod: (p, wyp, o, k) => warkoczBok(wyp, o, k[2]),
  },
  koronaWarkocz: {
    nazwa: 'Korona z warkocza', dl: 216, tagi: ['zima', 'ksiezniczka', 'gala'],
    tyl: (p, wyp, o) => `<path d="${tylGlowy}" fill="${wyp}" stroke="${o}" stroke-width="2.6"/><circle cx="300" cy="236" r="26" fill="${wyp}" stroke="${o}" stroke-width="2.6"/>`,
    przod: (p, wyp, o) => warkoczKorona(wyp, o),
  },
  niskieKucyki: {
    nazwa: 'Niskie kucyki', dl: 230, tagi: ['zima', 'slodka', 'narty'],
    tyl: (p, wyp, o) => `<path d="${tylGlowy}" fill="${wyp}" stroke="${o}" stroke-width="2.6"/>`,
    przod: (p, wyp, o, k) => obie(`<path d="M242 230C214 248 202 300 212 344C220 378 204 404 214 432C238 416 254 384 250 350C246 316 260 278 258 244Z" fill="${wyp}" stroke="${o}" stroke-width="2.4" stroke-linejoin="round"/>` +
      `<path d="M236 262Q226 300 232 340M244 270Q238 320 240 360" fill="none" stroke="${o}" stroke-width="1.4" opacity=".45"/>` +
      `<ellipse cx="246" cy="240" rx="9" ry="7" fill="${k[2]}" stroke="${obrys(k[2])}" stroke-width="2"/>`),
  },
  polkucyk: {
    nazwa: 'Półkucyk', dl: 292, tagi: ['wrozka', 'gala'],
    tyl: (p, wyp, o) => `<path d="${STYLE.dlugie.tyl()}" fill="${wyp}" stroke="${o}" stroke-width="2.6"/>`,
    przod: (p, wyp, o, k) => `<path d="M276 72Q300 64 324 72L320 80Q300 72 280 80Z" fill="${k[2]}" stroke="${obrys(k[2])}" stroke-width="1.8"/>`,
  },
};

export const FRYZURY = Object.entries(STYLE).map(([id, s]) => ({ id, nazwa: s.nazwa, tagi: s.tagi || [], k: ['#6b3e26', '#6b3e26', '#ff5d8f'] }));

// Cień, który włosy rzucają na czoło: kształt włosów przesunięty w dół i przycięty do twarzy.
export function cienNaTwarzy(p, d, stan, przes = 6, moc = 0.16) {
  const klip = p.id('ctw');
  p.defs.push(`<clipPath id="${klip}"><path d="${TWARZE[stan?.w?.ksztalt?.id] || TWARZE.okragla}"/></clipPath>`);
  return `<g clip-path="url(#${klip})"><path d="${d}" fill="#5a1f3a" opacity="${moc}" transform="translate(0 ${przes})"/></g>`;
}

export function rysujFryzure(p, w, stan) {
  const s = STYLE[w.id] || STYLE.dlugie;
  const wyp = wlosyWyp(p, w.k), o = obrys(w.k[0]);
  // tył głowy ciemniejszy niż przód – włosy mają głębię, a twarz „wychodzi” do przodu
  const wypTyl = wlosyWyp(p, w.k.map(c => ciemniej(c, 0.16)));
  const t = s.tyl(p, wypTyl, o, w.k);
  let tyl = t.startsWith('<') ? t : `<path d="${t}" fill="${wypTyl}" stroke="${o}" stroke-width="2.6" stroke-linejoin="round"/>`;
  if (s.pasma) tyl += obie(`<path d="${s.pasma}" fill="none" stroke="${o}" stroke-width="1.5" opacity=".35" stroke-linecap="round"/>`);
  const cz = czapa(s.dl, s.szer || 0);
  let przod = cienNaTwarzy(p, cz, stan) + `<path d="${cz}" fill="${wyp}" stroke="${o}" stroke-width="2.6" stroke-linejoin="round"/>` + kosmyki(p, o, cz, w.k[0]);
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
  kurtyna: { nazwa: 'Firanka', d: 'M300 96C266 96 244 116 240 160L246 180C250 150 264 124 300 104C336 124 350 150 354 180L360 160C356 116 334 96 300 96Z' },
  zaslonka: { nazwa: 'Zasłonka', d: 'M300 104C278 110 256 132 248 172L240 172C240 128 262 100 300 98C338 100 360 128 360 172L352 172C344 132 322 110 300 104Z' },
  krotka: { nazwa: 'Krótka', d: 'M246 132C248 108 268 96 300 95C332 96 352 108 354 132L340 128L326 133L312 127L300 133L288 127L274 133L260 128Z' },
};
export const GRZYWKA = Object.entries(GRZYWKI).map(([id, g]) => ({ id, nazwa: g.nazwa }));

export function rysujGrzywke(p, w, stan) {
  const k = stan.w.fryzura?.k || ['#6b3e26', '#6b3e26'];
  const wyp = wlosyWyp(p, k), o = obrys(k[0]);
  const g = GRZYWKI[w.id];
  if (!g || !g.d) return { wlosy: `<path d="M300 114Q298 100 293 88" fill="none" stroke="${o}" stroke-width="2" stroke-linecap="round"/>` };
  return { wlosy: cienNaTwarzy(p, g.d, stan, 7, 0.2) + `<path d="${g.d}" fill="${wyp}" stroke="${o}" stroke-width="2.4" stroke-linejoin="round"/>` +
    `<path d="M268 108Q290 100 312 104" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".3"/>` +
    obie(`<path d="M282 112Q272 126 266 142" fill="none" stroke="${o}" stroke-width="1.2" opacity=".35"/>`) };
}

export const KOLORY_WLOSOW = ['#1d1520', '#3b2418', '#6b3e26', '#a0623a', '#d08a4a', '#f2c46d', '#fbe3a0', '#f4f1ea', '#b8b8c8', '#c0392b', '#ff7a3d', '#ff8fc7', '#c77dff', '#7b6cf6', '#4cc9f0', '#5fd068', '#2ec4b6', '#ff4d8d'];
