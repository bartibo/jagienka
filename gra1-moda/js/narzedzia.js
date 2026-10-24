// Wspólne klocki rysunku: ścieżki symetryczne, kolory, wzory tkanin, losowość z ziarnem.
// Cała postać żyje w układzie 600 × 800 (środek ciała x = 300), żeby każde ubranie pasowało do każdego innego.

export const SRODEK = 300;
const lustro = x => +(2 * SRODEK - x).toFixed(1);

// Ścieżka symetryczna: opisujemy tylko lewą połowę (od środka u góry, wzdłuż lewego boku, do środka na dole),
// prawa powstaje lustrzanie – dzięki temu ubrania i ciało są zawsze równe, a rysowanie zajmuje połowę czasu.
// Odcinek: [x,y] = linia, [cx,cy,x,y] = łuk Q, [c1x,c1y,c2x,c2y,x,y] = łuk C.
export function sym(start, odcinki) {
  let d = `M${start[0]} ${start[1]}`;
  const punkty = [start];
  for (const o of odcinki) {
    d += (o.length === 6 ? 'C' : o.length === 4 ? 'Q' : 'L') + o.join(' ');
    punkty.push([o[o.length - 2], o[o.length - 1]]);
  }
  const ost = punkty[punkty.length - 1];
  if (ost[0] !== SRODEK) d += `L${lustro(ost[0])} ${ost[1]}`;
  for (let i = odcinki.length - 1; i >= 0; i--) {
    const o = odcinki[i], cel = punkty[i];
    if (o.length === 6) d += `C${lustro(o[2])} ${o[3]} ${lustro(o[0])} ${o[1]} ${lustro(cel[0])} ${cel[1]}`;
    else if (o.length === 4) d += `Q${lustro(o[0])} ${o[1]} ${lustro(cel[0])} ${cel[1]}`;
    else d += `L${lustro(cel[0])} ${cel[1]}`;
  }
  return d + 'Z';
}

// Odbicie całego elementu na prawą stronę (nogi, ręce, rękawy, uszy).
export const ODBICIE = `transform="matrix(-1 0 0 1 ${2 * SRODEK} 0)"`;
export const obie = s => s + `<g ${ODBICIE}>${s}</g>`;

/* ---------- kolory ---------- */
export function hexNaRgb(h) {
  h = h.replace('#', '');
  if (h.length === 3) h = h.split('').map(c => c + c).join('');
  const n = parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
const naHex = (r, g, b) => '#' + [r, g, b].map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
export function mieszaj(a, b, t) {
  const x = hexNaRgb(a), y = hexNaRgb(b);
  return naHex(x[0] + (y[0] - x[0]) * t, x[1] + (y[1] - x[1]) * t, x[2] + (y[2] - x[2]) * t);
}
export const ciemniej = (c, t = 0.45) => mieszaj(c, '#2a1430', t);
export const jasniej = (c, t = 0.4) => mieszaj(c, '#ffffff', t);
export function jasnosc(c) {
  const [r, g, b] = hexNaRgb(c);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}
// Obrys o ton ciemniejszy od wypełnienia wygląda „kreskówkowo”, a czarny obrys przy czarnym ubraniu by znikał.
export const obrys = c => jasnosc(c) < 0.18 ? mieszaj(c, '#000000', 0.5) : ciemniej(c, 0.5);

/* ---------- losowość z ziarnem (efekty mają stały układ, więc nie skaczą przy każdej zmianie) ---------- */
export function losowe(ziarno) {
  let a = ziarno >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ---------- drobne kształty ---------- */
export function gwiazda(cx, cy, r, ramiona = 5, wew = 0.45, obrot = -90) {
  let d = '';
  for (let i = 0; i < ramiona * 2; i++) {
    const rr = i % 2 ? r * wew : r, k = (obrot + i * 180 / ramiona) * Math.PI / 180;
    d += (i ? 'L' : 'M') + (cx + rr * Math.cos(k)).toFixed(1) + ' ' + (cy + rr * Math.sin(k)).toFixed(1);
  }
  return d + 'Z';
}
export function serce(cx, cy, r) {
  return `M${cx} ${cy + r * 0.9}C${cx - r * 1.4} ${cy}${' '}${cx - r * 0.9} ${cy - r * 1.1} ${cx} ${cy - r * 0.35}C${cx + r * 0.9} ${cy - r * 1.1} ${cx + r * 1.4} ${cy} ${cx} ${cy + r * 0.9}Z`;
}
// Błysk w kształcie czteroramiennej gwiazdki – „brokat” w całej grze.
export const blysk = (cx, cy, r) => (cx = +cx, cy = +cy, r = +r, `M${cx} ${cy - r}Q${cx + r * 0.18} ${cy - r * 0.18} ${cx + r} ${cy}Q${cx + r * 0.18} ${cy + r * 0.18} ${cx} ${cy + r}Q${cx - r * 0.18} ${cy + r * 0.18} ${cx - r} ${cy}Q${cx - r * 0.18} ${cy - r * 0.18} ${cx} ${cy - r}Z`);
export function nietoperz(cx, cy, s) {
  const p = (x, y) => `${(cx + x * s).toFixed(1)} ${(cy + y * s).toFixed(1)}`;
  return `M${p(0, -3)}C${p(-3, -6)} ${p(-6, -8)} ${p(-12, -7)}C${p(-10, -4)} ${p(-10, -1)} ${p(-12, 2)}C${p(-9, 1)} ${p(-7, 2)} ${p(-6, 4)}C${p(-4, 2)} ${p(-2, 3)} ${p(0, 5)}C${p(2, 3)} ${p(4, 2)} ${p(6, 4)}C${p(7, 2)} ${p(9, 1)} ${p(12, 2)}C${p(10, -1)} ${p(10, -4)} ${p(12, -7)}C${p(6, -8)} ${p(3, -6)} ${p(0, -3)}Z` +
    `M${p(-2, -3)}L${p(-2.6, -6)}L${p(-0.8, -4)}Z M${p(2, -3)}L${p(2.6, -6)}L${p(0.8, -4)}Z`;
}
export function dynia(cx, cy, r, kolor = '#ff8a1f', buzia = false) {
  const o = obrys(kolor);
  let s = `<g stroke="${o}" stroke-width="${Math.max(1, r / 12)}" stroke-linejoin="round">`;
  s += `<path d="M${cx} ${cy - r * 0.8}q${-r * 0.1} ${-r * 0.35} ${r * 0.12} ${-r * 0.5}" fill="none" stroke="#5b7a2a" stroke-width="${r / 6}" stroke-linecap="round"/>`;
  s += `<ellipse cx="${cx - r * 0.42}" cy="${cy}" rx="${r * 0.62}" ry="${r * 0.82}" fill="${kolor}"/>`;
  s += `<ellipse cx="${cx + r * 0.42}" cy="${cy}" rx="${r * 0.62}" ry="${r * 0.82}" fill="${kolor}"/>`;
  s += `<ellipse cx="${cx}" cy="${cy}" rx="${r * 0.55}" ry="${r * 0.86}" fill="${jasniej(kolor, 0.12)}"/>`;
  if (buzia) {
    s += `<g fill="#4a2208" stroke="none"><path d="${gwiazda(cx - r * 0.3, cy - r * 0.15, r * 0.17, 3, 0.5)}"/><path d="${gwiazda(cx + r * 0.3, cy - r * 0.15, r * 0.17, 3, 0.5)}"/>` +
      `<path d="M${cx - r * 0.45} ${cy + r * 0.2}Q${cx} ${cy + r * 0.75} ${cx + r * 0.45} ${cy + r * 0.2}L${cx + r * 0.22} ${cy + r * 0.32}L${cx} ${cy + r * 0.22}L${cx - r * 0.22} ${cy + r * 0.32}Z"/></g>`;
  }
  return s + '</g>';
}
export function kwiatek(cx, cy, r, kolor, srodek = '#ffd23f') {
  let s = `<g stroke="${obrys(kolor)}" stroke-width="${Math.max(0.8, r / 8)}">`;
  for (let i = 0; i < 5; i++) {
    const k = (i * 72 - 90) * Math.PI / 180;
    s += `<circle cx="${(cx + Math.cos(k) * r * 0.62).toFixed(1)}" cy="${(cy + Math.sin(k) * r * 0.62).toFixed(1)}" r="${(r * 0.48).toFixed(1)}" fill="${kolor}"/>`;
  }
  return s + `<circle cx="${cx}" cy="${cy}" r="${(r * 0.36).toFixed(1)}" fill="${srodek}"/></g>`;
}

/* ---------- wzory tkanin ---------- */
export const WZORY = [
  { id: 'gladki', nazwa: 'Gładki' },
  { id: 'paski', nazwa: 'Paski' },
  { id: 'pionowe', nazwa: 'Prążki' },
  { id: 'skosne', nazwa: 'Skośne' },
  { id: 'groszki', nazwa: 'Groszki' },
  { id: 'kratka', nazwa: 'Kratka' },
  { id: 'szachownica', nazwa: 'Szachy' },
  { id: 'serduszka', nazwa: 'Serduszka' },
  { id: 'gwiazdki', nazwa: 'Gwiazdki' },
  { id: 'kwiatki', nazwa: 'Kwiatki' },
  { id: 'panterka', nazwa: 'Panterka' },
  { id: 'brokat', nazwa: 'Brokat' },
  { id: 'pajeczyna', nazwa: 'Pajęczyna' },
  { id: 'nietoperze', nazwa: 'Nietoperze' },
  { id: 'dynie', nazwa: 'Dynie' },
  { id: 'ombre', nazwa: 'Ombre' },
  { id: 'tecza', nazwa: 'Tęcza' },
];

const TECZA = ['#ff5d8f', '#ff9f43', '#ffd23f', '#5fd068', '#4cc9f0', '#7b6cf6', '#c77dff'];

// Każdy obraz SVG dostaje własny przedrostek identyfikatorów – miniatury na jednej stronie nie mieszają sobie wzorów.
export class Plotno {
  constructor(pref = 'p') {
    this.pref = pref;
    this.defs = [];
    this.n = 0;
    this.pamiec = new Map();
  }
  id(nazwa = 'x') { return `${this.pref}${nazwa}${this.n++}`; }

  // Cieniowanie, które nadaje płaskim kształtom objętość: ciemniej przy brzegach, delikatny połysk z lewej.
  get cien() {
    if (!this.pamiec.has('cien')) {
      const id = this.id('cien');
      this.defs.push(`<linearGradient id="${id}" x1="0" x2="1" y1="0" y2="0">` +
        `<stop offset="0" stop-color="#1b0a2a" stop-opacity=".26"/><stop offset=".22" stop-color="#1b0a2a" stop-opacity="0"/>` +
        `<stop offset=".36" stop-color="#fff" stop-opacity=".16"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/>` +
        `<stop offset=".78" stop-color="#1b0a2a" stop-opacity=".04"/><stop offset="1" stop-color="#1b0a2a" stop-opacity=".3"/></linearGradient>`);
      this.pamiec.set('cien', `url(#${id})`);
    }
    return this.pamiec.get('cien');
  }

  gradient(c1, c2, y1 = 0, y2 = 1, jednostki = 'objectBoundingBox') {
    const klucz = `g${c1}${c2}${y1}${y2}${jednostki}`;
    if (!this.pamiec.has(klucz)) {
      const id = this.id('gr');
      this.defs.push(`<linearGradient id="${id}" x1="0" x2="0" y1="${y1}" y2="${y2}" gradientUnits="${jednostki}"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient>`);
      this.pamiec.set(klucz, `url(#${id})`);
    }
    return this.pamiec.get(klucz);
  }

  promienisty(c1, c2, op1 = 1, op2 = 0) {
    const klucz = `r${c1}${c2}${op1}${op2}`;
    if (!this.pamiec.has(klucz)) {
      const id = this.id('rg');
      this.defs.push(`<radialGradient id="${id}"><stop offset="0" stop-color="${c1}" stop-opacity="${op1}"/><stop offset="1" stop-color="${c2}" stop-opacity="${op2}"/></radialGradient>`);
      this.pamiec.set(klucz, `url(#${id})`);
    }
    return this.pamiec.get(klucz);
  }

  // Wypełnienie tkaniny: kolor główny (tło wzoru) + kolor drugi (motyw).
  wzor(wz, c1, c2) {
    if (!wz || wz === 'gladki') return c1;
    if (wz === 'ombre') return this.gradient(c1, c2);
    const klucz = `w${wz}${c1}${c2}`;
    if (this.pamiec.has(klucz)) return this.pamiec.get(klucz);
    const id = this.id('wz');
    const t = (w, h, tresc, extra = '') => `<pattern id="${id}" width="${w}" height="${h}" patternUnits="userSpaceOnUse"${extra}><rect width="${w}" height="${h}" fill="${c1}"/>${tresc}</pattern>`;
    let p;
    switch (wz) {
      case 'paski': p = t(20, 20, `<rect y="0" width="20" height="9" fill="${c2}"/>`); break;
      case 'pionowe': p = t(14, 14, `<rect width="5" height="14" fill="${c2}"/>`); break;
      case 'skosne': p = t(18, 18, `<rect width="8" height="18" fill="${c2}"/>`, ' patternTransform="rotate(40)"'); break;
      case 'groszki': p = t(22, 22, `<circle cx="5.5" cy="5.5" r="3.6" fill="${c2}"/><circle cx="16.5" cy="16.5" r="3.6" fill="${c2}"/>`); break;
      case 'kratka': p = t(24, 24, `<rect width="24" height="10" fill="${c2}" opacity=".45"/><rect width="10" height="24" fill="${c2}" opacity=".45"/><rect width="2" height="24" x="16" fill="${c2}" opacity=".5"/><rect width="24" height="2" y="16" fill="${c2}" opacity=".5"/>`); break;
      case 'szachownica': p = t(24, 24, `<rect width="12" height="12" fill="${c2}"/><rect x="12" y="12" width="12" height="12" fill="${c2}"/>`); break;
      case 'serduszka': p = t(28, 28, `<path d="${serce(7, 8, 4.6)}" fill="${c2}"/><path d="${serce(21, 22, 4.6)}" fill="${c2}"/>`); break;
      case 'gwiazdki': p = t(30, 30, `<path d="${gwiazda(8, 8, 5.5)}" fill="${c2}"/><path d="${gwiazda(23, 23, 4)}" fill="${c2}"/>`); break;
      case 'kwiatki': p = t(34, 34, kwiatek(9, 9, 6, c2, '#ffe680') + kwiatek(26, 26, 5, mieszaj(c2, '#ffffff', 0.35), '#ffe680')); break;
      case 'panterka': {
        const plama = (x, y, r) => `<path d="M${x - r} ${y}q${r * 0.2} ${-r * 1.1} ${r} ${-r * 0.8}q${r * 1.2} ${r * 0.1} ${r * 0.9} ${r}q${-r * 0.4} ${r * 0.9} ${-r} ${r * 0.6}q${-r * 0.9} ${-r * 0.1} ${-r * 0.9} ${-r * 0.8}z" fill="none" stroke="${c2}" stroke-width="2.6" stroke-dasharray="${r * 1.6} ${r * 0.7}"/><circle cx="${x}" cy="${y}" r="${r * 0.35}" fill="${mieszaj(c1, c2, 0.4)}"/>`;
        p = t(40, 40, plama(10, 11, 6) + plama(30, 28, 5.5) + plama(32, 8, 3.5) + plama(9, 32, 3.8)); break;
      }
      case 'brokat': {
        const r = losowe(7); let s = '';
        for (let i = 0; i < 14; i++) s += `<circle cx="${(r() * 30).toFixed(1)}" cy="${(r() * 30).toFixed(1)}" r="${(0.6 + r() * 1.2).toFixed(1)}" fill="${i % 3 ? c2 : '#fff'}" opacity="${(0.55 + r() * 0.45).toFixed(2)}"/>`;
        s += `<path d="${blysk(22, 8, 4)}" fill="#fff"/>`;
        p = t(30, 30, s); break;
      }
      case 'pajeczyna': {
        let s = `<g fill="none" stroke="${c2}" stroke-width="1.1" opacity=".85">`;
        for (let i = 0; i < 8; i++) {
          const k = i * Math.PI / 4;
          s += `<line x1="30" y1="30" x2="${(30 + Math.cos(k) * 30).toFixed(1)}" y2="${(30 + Math.sin(k) * 30).toFixed(1)}"/>`;
        }
        for (const r of [8, 16, 24]) {
          let d = '';
          for (let i = 0; i <= 8; i++) {
            const k = i * Math.PI / 4, k0 = (i - 0.5) * Math.PI / 4;
            d += i ? `Q${(30 + Math.cos(k0) * r * 0.78).toFixed(1)} ${(30 + Math.sin(k0) * r * 0.78).toFixed(1)} ` : 'M';
            d += `${(30 + Math.cos(k) * r).toFixed(1)} ${(30 + Math.sin(k) * r).toFixed(1)}`;
          }
          s += `<path d="${d}"/>`;
        }
        p = t(60, 60, s + '</g>'); break;
      }
      case 'nietoperze': p = t(40, 34, `<path d="${nietoperz(11, 10, 0.7)}" fill="${c2}"/><path d="${nietoperz(30, 26, 0.55)}" fill="${c2}"/>`); break;
      case 'dynie': p = t(38, 38, dynia(10, 11, 6, c2) + dynia(28, 29, 5, c2)); break;
      case 'tecza': p = t(10, 70, TECZA.map((c, i) => `<rect y="${i * 10}" width="10" height="10" fill="${c}"/>`).join('')); break;
      default: return c1;
    }
    this.defs.push(p);
    const url = `url(#${id})`;
    this.pamiec.set(klucz, url);
    return url;
  }

  // Kształt ubrania: wypełnienie + obrys + cieniowanie objętości.
  ksztalt(d, wyp, kolorObrysu, { cien = true, gr = 2.6, extra = '' } = {}) {
    return `<path d="${d}" fill="${wyp}" stroke="${kolorObrysu}" stroke-width="${gr}" stroke-linejoin="round"${extra}/>` +
      (cien ? `<path d="${d}" fill="${this.cien}" pointer-events="none"/>` : '');
  }
}
