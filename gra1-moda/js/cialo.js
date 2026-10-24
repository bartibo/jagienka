// Ciało postaci: wymiary, skóra, głowa i dłonie. Ubrania w katalogu rysuje się wzdłuż tych samych punktów,
// więc zmiana tu wymaga sprawdzenia ubrań (zrzut ekranu przed i po).
import { sym, obie, mieszaj } from './narzedzia.js';

export const TULOW = sym([300, 280], [
  [284, 280, 256, 284, 240, 292],
  [226, 299, 222, 318, 232, 338],
  [252, 368, 268, 390, 266, 405],
  [265, 428, 247, 440, 247, 462],
  [246, 480, 272, 494, 300, 497],
]);
export const NOGA = 'M246 452C242 510 250 570 262 615C258 650 266 700 276 736L292 736C294 700 298 665 294 615C296 570 300 530 300 496Z';
export const STOPA = 'M275 730C270 748 263 760 265 768C267 775 293 775 296 768C298 760 295 745 293 730Z';
export const SZYJA = 'M285 226L284 290L316 290L315 226Z';
// Ręka jako ścieżka otwarta: wypełnienie domyka się samo, a obrys nie rysuje kreski w miejscu, gdzie ręka wchodzi w bark.
export const REKA = 'M240 292C222 296 214 316 214 340C213 370 210 400 208 420C205 450 202 475 202 494L222 494C224 470 228 445 232 420C236 395 242 362 247 336';
// Dłoń z palcami: kciuk z przodu (od strony ciała), palce lekko podwinięte.
export const DLON = 'M201 484C197 496 195 510 196 522C196 531 198 538 201 543C203 547 207 549 211 548C215 547 218 544 219 540C220 535 220 530 219 526C222 528 226 527 227 523C228 516 226 506 223 496L223 484Z';
export const DLON_DET = 'M204 527Q205 536 206 544M209 529Q210 538 211 547M214 528Q215 536 215 544M219 526Q217 519 218 511';
// Punkt, w którym dłoń (lewa na ekranie) trzyma przedmiot.
export const CHWYT = [212, 516];

export const TWARZE = {
  okragla: sym([300, 92], [[260, 92, 236, 122, 236, 165], [236, 210, 264, 246, 300, 250]]),
  owalna: sym([300, 92], [[262, 92, 239, 122, 239, 165], [239, 214, 268, 256, 300, 258]]),
  serduszko: sym([300, 92], [[257, 92, 234, 120, 234, 160], [235, 198, 270, 238, 300, 254]]),
  pyzata: sym([300, 94], [[256, 94, 232, 124, 233, 168], [234, 214, 262, 246, 300, 248]]),
};

export const obrysSkory = c => mieszaj(c, '#6b2a3a', 0.5);

// Skóra ciała rysowana dwa razy: najpierw grubszy obrys wszystkich części, potem same wypełnienia.
// Dzięki temu nogi, tułów i szyja zlewają się w jedną sylwetkę bez kresek na łączeniach.
export function cialo(p, skora) {
  const o = obrysSkory(skora);
  const ksz = (styl) => `<path d="${NOGA}" ${styl}/><path d="${NOGA}" ${styl} transform="matrix(-1 0 0 1 600 0)"/>` +
    `<path d="${STOPA}" ${styl}/><path d="${STOPA}" ${styl} transform="matrix(-1 0 0 1 600 0)"/>` +
    `<path d="${TULOW}" ${styl}/><path d="${SZYJA}" ${styl}/>`;
  return `<g>${ksz(`fill="${skora}" stroke="${o}" stroke-width="5.2" stroke-linejoin="round"`)}${ksz(`fill="${skora}"`)}` +
    `<g opacity=".7">${ksz(`fill="${p.cien}"`)}</g>` +
    // cień pod brodą na szyi
    `<path d="M285 244Q300 272 315 244L315 266Q300 278 285 266Z" fill="${o}" opacity=".22"/>` +
    // kolana, obojczyki i pępek – drobiazgi, które ożywiają gołą skórę
    obie(`<path d="M270 612Q278 618 286 612" fill="none" stroke="${o}" stroke-width="1.6" opacity=".5"/>` +
      `<path d="M268 628Q276 634 284 630" fill="none" stroke="${o}" stroke-width="1.2" opacity=".25"/>` +
      `<path d="M262 297Q276 302 291 298" fill="none" stroke="${o}" stroke-width="1.6" stroke-linecap="round" opacity=".35"/>`) +
    `<path d="M300 432q-2 4 0 6" fill="none" stroke="${o}" stroke-width="1.8" opacity=".55"/></g>`;
}

export function ramiona(p, skora) {
  const o = obrysSkory(skora);
  return obie(`<path d="${REKA}" fill="${skora}" stroke="${o}" stroke-width="2.6" stroke-linejoin="round"/><path d="${REKA}" fill="${p.cien}" opacity=".7"/>`);
}

export function dlonie(skora, kolorRekawiczki) {
  const k = kolorRekawiczki || skora, o = kolorRekawiczki ? mieszaj(k, '#1a0820', 0.5) : obrysSkory(skora);
  return obie(`<path d="${DLON}" fill="${k}" stroke="${o}" stroke-width="2.4" stroke-linejoin="round"/>` +
    `<path d="${DLON_DET}" fill="none" stroke="${o}" stroke-width="1.6" stroke-linecap="round" opacity=".75"/>`);
}

// Uszy rysowane przed twarzą: twarz zasłania ich nasadę, więc widać tylko małżowinę.
export const USZY = {
  ludzkie: 'M240 166C224 158 218 182 228 194C232 199 238 200 241 196',
  elfie: 'M240 162C222 154 204 140 194 128C200 154 214 190 241 198',
  male: 'M240 170C230 166 226 182 233 190C236 193 239 193 241 191',
};

// Delikatny cień przy brzegu twarzy: środek zostaje jasny, krawędź ciemnieje – buzia przestaje być płaska.
function cienTwarzy(p, o) {
  const klucz = 'cienTwarzy' + o;
  if (!p.pamiec.has(klucz)) {
    const id = p.id('ct');
    p.defs.push(`<radialGradient id="${id}" cx=".5" cy=".42" r=".62"><stop offset=".62" stop-color="${o}" stop-opacity="0"/><stop offset="1" stop-color="${o}" stop-opacity=".32"/></radialGradient>`);
    p.pamiec.set(klucz, `url(#${id})`);
  }
  return p.pamiec.get(klucz);
}

export function glowa(p, skora, ksztalt = 'okragla', uszy = 'ludzkie') {
  const o = obrysSkory(skora);
  const ucho = USZY[uszy] || USZY.ludzkie;
  const d = TWARZE[ksztalt] || TWARZE.okragla;
  return obie(`<path d="${ucho}" fill="${skora}" stroke="${o}" stroke-width="2.6" stroke-linejoin="round"/>` +
    `<path d="M236 176q-6 4 -2 12" fill="none" stroke="${o}" stroke-width="1.6" opacity=".6"/>`) +
    `<path d="${d}" fill="${skora}" stroke="${o}" stroke-width="2.8" stroke-linejoin="round"/>` +
    `<path d="${d}" fill="${cienTwarzy(p, o)}"/>` +
    `<path d="${d}" fill="${p.promienisty('#ffffff', '#ffffff', 0.18, 0)}"/>` +
    // jaśniejsze kości policzkowe i czubek brody
    obie(`<ellipse cx="258" cy="194" rx="14" ry="9" fill="${p.promienisty('#ffffff', '#ffffff', 0.22, 0)}"/>`) +
    `<ellipse cx="300" cy="240" rx="12" ry="5" fill="${p.promienisty('#ffffff', '#ffffff', 0.2, 0)}"/>`;
}

// Bielizna, gdy nic nie zakrywa tułowia – postać nigdy nie stoi „goła”.
export function bielizna(p, gora, dol) {
  const k = '#f4ecff', o = '#b9a6d6';
  let s = '';
  if (dol) s += p.ksztalt(sym([300, 428], [[262, 428], [252, 440, 246, 452, 245, 466], [247, 506], [292, 509], [300, 500]]), k, o);
  if (gora) s += p.ksztalt(sym([300, 312], [[290, 312, 283, 302, 281, 290], [272, 290], [266, 314, 254, 332, 246, 340], [254, 365, 263, 390, 263, 410], [262, 422, 259, 432, 258, 438], [300, 440]]), k, o) +
    `<path d="M292 314q8 8 16 0" fill="none" stroke="${o}" stroke-width="1.6"/>`;
  return s;
}

