// Składanie postaci z warstw. Stan to zwykły obiekt { imie, w: { kategoria: { id, k: [kolory], wz } } },
// więc da się go zapisać w localStorage jednym JSON-em i odtworzyć co do piksela.
import { Plotno, obrys } from './narzedzia.js';
import { cialo, ramiona, glowa, dlonie, bielizna } from './cialo.js';
import { KATEGORIE, KAT, element } from './katalog.js';

export const WARSTWY = ['efektyTyl', 'skrzydla', 'tyl', 'wlosyTyl', 'ogon', 'cialo', 'bielizna', 'rajstopy', 'buty', 'dol', 'gora', 'suknia', 'okrycie',
  'ramiona', 'rekawy', 'rekawiczki', 'szyja', 'glowa', 'twarzPod', 'oczy', 'twarzNad', 'wlosy', 'kolczyki', 'czapka', 'okulary', 'wreka', 'dlon', 'wrekaNad', 'zwierzak', 'efekty'];
// Zwierzak i efekty stoją w scenie, nie skalują się razem z postacią.
const SCENA = new Set(['zwierzak', 'efekty', 'efektyTyl']);
// Głowa siedzi 8 px niżej niż w rysunkach katalogu – krótsza szyja wygląda słodziej, a katalog zostaje w jednym układzie.
const GLOWA = new Set(['wlosyTyl', 'glowa', 'twarzPod', 'oczy', 'twarzNad', 'wlosy', 'kolczyki', 'czapka', 'okulary']);
const PRZESUN_GLOWY = 8;

export function kolory(katId, w) {
  const el = element(katId, w.id);
  return w.k && w.k.length ? w.k : (el?.k || ['#cccccc', '#999999']);
}

export function rysujPostac(stan, { pref = 'p', kadr = '0 0 600 800', pelny = true, animacja = false, szer, wys, tylkoKat = null } = {}) {
  const p = new Plotno(pref);
  const L = Object.fromEntries(WARSTWY.map(n => [n, '']));
  const w = stan.w;
  const jestSuknia = w.suknia && w.suknia.id !== 'brak';
  for (const kat of KATEGORIE) {
    if (tylkoKat && kat.id !== tylkoKat) continue;
    const wyb = w[kat.id];
    if (!wyb || wyb.id === 'brak' || kat.tlo) continue;
    if (jestSuknia && (kat.id === 'gora' || kat.id === 'dol')) continue;
    const el = element(kat.id, wyb.id);
    const f = el?.rysuj || kat.rysuj;
    if (!el || !f) continue;
    const k = kolory(kat.id, wyb);
    const wz = wyb.wz || el.wz || 'gladki';
    const dane = { id: wyb.id, k, wz, wyp: p.wzor(wz, k[0], k[1] ?? k[0]), o: obrys(k[0] || '#888888') };
    const wynik = f(p, dane, stan) || {};
    for (const [n, s] of Object.entries(wynik)) if (s && n in L) L[n] += s;
  }
  if (!tylkoKat) {
    const skora = kolory('skora', w.skora || { id: 'jasna' })[0];
    L.cialo = cialo(p, skora);
    L.ramiona = ramiona(p, skora);
    L.glowa = glowa(p, skora, w.ksztalt?.id, w.uszy?.id);
    if (!jestSuknia) L.bielizna = bielizna(p, !w.gora || w.gora.id === 'brak', !w.dol || w.dol.id === 'brak');
    const rek = w.rekawiczki && w.rekawiczki.id !== 'brak' ? kolory('rekawiczki', w.rekawiczki) : null;
    // zimowe rękawiczki (jednopalczaste, bez palców) zmieniają kształt dłoni, więc rysują ją same
    const rekEl = rek && element('rekawiczki', w.rekawiczki.id);
    L.dlon = rekEl?.dlon ? rekEl.dlon(p, { k: rek }, skora) : dlonie(skora, rek ? rek[0] : null);
    if (w.rekawiczki?.id === 'lapki') {
      // poduszeczki kocich łapek
      const pad = `<ellipse cx="212" cy="528" rx="7" ry="6" fill="${rek[1]}"/><circle cx="204" cy="516" r="3" fill="${rek[1]}"/><circle cx="212" cy="512" r="3" fill="${rek[1]}"/><circle cx="220" cy="516" r="3" fill="${rek[1]}"/>`;
      L.dlon += pad + `<g transform="matrix(-1 0 0 1 600 0)">${pad}</g>`;
    }
  }
  const postac = WARSTWY.filter(n => !SCENA.has(n)).map(n => GLOWA.has(n) && L[n] ? `<g transform="translate(0 ${PRZESUN_GLOWY})">${L[n]}</g>` : L[n]).join('');
  // Skala 0,94 od stóp: uszy królika i czubek kapelusza mieszczą się w kadrze, a stopy stoją tam, gdzie stały.
  const grupa = pelny ? `<g transform="translate(300 790) scale(.94) translate(-300 -790)">${postac}</g>` : postac;
  const wymiar = szer ? ` width="${szer}" height="${wys}"` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${kadr}"${wymiar} class="${animacja ? 'zywa' : ''}"><defs>${p.defs.join('')}</defs>` +
    L.efektyTyl + grupa + L.zwierzak + L.efekty + '</svg>';
}

export const DOMYSLNA = {
  imie: '',
  w: {
    skora: { id: 'jasna', k: ['#ffdcc4'] }, ksztalt: { id: 'okragla' }, uszy: { id: 'ludzkie' },
    oczy: { id: 'duze', k: ['#5b8def'] }, rzesy: { id: 'naturalne', k: ['#2a1a2e'] }, kreska: { id: 'brak', k: ['#1b1020'] },
    cienie: { id: 'brak' }, brwi: { id: 'naturalne', k: ['#5a3726'] }, nos: { id: 'zgrabny' }, usta: { id: 'usmiech', k: ['#e8848f'] },
    policzki: { id: 'rumience', k: ['#ff8fa8', '#b0705a'] }, malunki: { id: 'brak' },
    fryzura: { id: 'dlugie', k: ['#6b3e26', '#6b3e26', '#ff5d8f'] }, grzywka: { id: 'zaslonka' }, nakrycie: { id: 'brak' },
    rajstopy: { id: 'rajstopy', k: ['#ffffff', '#ffffff'] }, buty: { id: 'emu', k: ['#c8a070', '#f6ead8'] }, dol: { id: 'mini', k: ['#8b5cf6', '#ffffff'] },
    gora: { id: 'sweterWarkocz', k: ['#ffd6e8', '#ffffff'] }, suknia: { id: 'brak' }, okrycie: { id: 'brak' }, rekawiczki: { id: 'brak' },
    naszyjnik: { id: 'brak' }, kolczyki: { id: 'brak' }, okulary: { id: 'brak' }, wreka: { id: 'brak' }, skrzydla: { id: 'brak' },
    ogon: { id: 'brak' }, tlo: { id: 'zimowa-wioska' }, zwierzak: { id: 'brak' }, efekty: { id: 'snieg' },
  },
};

export const klon = o => JSON.parse(JSON.stringify(o));

// Uzupełnia stan zapisany starszą wersją gry o kategorie, których wtedy nie było.
export function napraw(stan) {
  const s = klon(DOMYSLNA);
  if (stan && stan.w) {
    s.imie = stan.imie || '';
    for (const k of Object.keys(stan.w)) if (KAT[k] && (stan.w[k].id === 'brak' || element(k, stan.w[k].id))) s.w[k] = stan.w[k];
  }
  return s;
}

