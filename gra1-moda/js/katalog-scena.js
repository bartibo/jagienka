// Scena: zwierzak obok postaci, efekty w powietrzu i tło. Tła to obrazy z Nano Banana 2.1 (Gemini) w tla/.
import { obrys, jasniej, ciemniej, mieszaj, gwiazda, serce, blysk, nietoperz, dynia, losowe } from './narzedzia.js';

/* ---------- ZWIERZAKI ---------- */
const oczka = (x1, x2, y, r = 5, kolor = '#1b1020') => `<circle cx="${x1}" cy="${y}" r="${r}" fill="${kolor}"/><circle cx="${x2}" cy="${y}" r="${r}" fill="${kolor}"/>` +
  `<circle cx="${x1 - r * 0.35}" cy="${y - r * 0.35}" r="${r * 0.38}" fill="#fff"/><circle cx="${x2 - r * 0.35}" cy="${y - r * 0.35}" r="${r * 0.38}" fill="#fff"/>`;

export const ZWIERZAKI = [
  {
    id: 'kot', nazwa: 'Kotek', k: ['#1b1020', '#ffd23f'], tagi: ['halloween', 'kot', 'czarownica'], kadr: '400 600 160 200',
    rysuj: (p, w) => {
      const c = w.k[0], o = obrys(c);
      return { zwierzak: `<g stroke="${o}" stroke-width="2.4" stroke-linejoin="round"><path d="M520 760C560 760 560 700 534 690" fill="none" stroke="${c}" stroke-width="10" stroke-linecap="round"/>` +
        `<path d="M444 772C436 720 452 680 480 680C508 680 524 720 516 772Z" fill="${c}"/><path d="M444 690L448 642L470 664ZM516 690L512 642L490 664Z" fill="${c}"/><circle cx="480" cy="684" r="34" fill="${c}"/></g>` +
        `<path d="M452 664L455 650L465 662ZM508 664L505 650L495 662Z" fill="#ff8fb1"/>` +
        `<ellipse cx="468" cy="682" rx="7" ry="9" fill="${w.k[1]}"/><ellipse cx="492" cy="682" rx="7" ry="9" fill="${w.k[1]}"/><ellipse cx="468" cy="683" rx="2.4" ry="7" fill="#1b1020"/><ellipse cx="492" cy="683" rx="2.4" ry="7" fill="#1b1020"/>` +
        `<path d="M476 696L484 696L480 701Z" fill="#ff8fb1"/><path d="M480 701q-4 5 -8 2M480 701q4 5 8 2" fill="none" stroke="${jasniej(c, 0.5)}" stroke-width="1.4"/>` +
        `<path d="M460 698L440 694M460 702L440 704M500 698L520 694M500 702L520 704" stroke="${jasniej(c, 0.55)}" stroke-width="1.2"/>` };
    },
  },
  {
    id: 'duszek', nazwa: 'Duszek', k: ['#ffffff', '#1b1020'], tagi: ['halloween', 'duch'], kadr: '410 200 160 180', unos: true,
    rysuj: (p, w) => ({ zwierzak: `<g class="unos"><path d="M440 340C436 270 456 236 490 236C524 236 544 270 540 340L528 330L516 344L502 330L490 344L478 330L464 344L452 330Z" fill="${w.k[0]}" fill-opacity=".92" stroke="${mieszaj(w.k[0], '#7a86b8', 0.6)}" stroke-width="2.4" stroke-linejoin="round"/>` +
      `<ellipse cx="478" cy="282" rx="6" ry="9" fill="${w.k[1]}"/><ellipse cx="502" cy="282" rx="6" ry="9" fill="${w.k[1]}"/><ellipse cx="490" cy="304" rx="7" ry="6" fill="${w.k[1]}"/><ellipse cx="466" cy="298" rx="7" ry="4" fill="#ff8fb1" opacity=".6"/><ellipse cx="514" cy="298" rx="7" ry="4" fill="#ff8fb1" opacity=".6"/>` +
      `<path d="M444 300Q424 290 426 272M536 300Q556 290 554 272" fill="none" stroke="${mieszaj(w.k[0], '#7a86b8', 0.6)}" stroke-width="2.4" stroke-linecap="round"/></g>` }),
  },
  {
    id: 'nietoperz', nazwa: 'Nietoperek', k: ['#3b2a5a', '#ffd23f'], tagi: ['halloween', 'wampir'], kadr: '40 170 160 140', unos: true,
    rysuj: (p, w) => ({ zwierzak: `<g class="unos"><path d="${nietoperz(118, 240, 6)}" fill="${w.k[0]}" stroke="${obrys(w.k[0])}" stroke-width="1.6"/><circle cx="118" cy="246" r="20" fill="${w.k[0]}"/>` +
      oczka(110, 126, 242, 5, w.k[1]) + `<path d="M112 254L115 260L118 254M118 254L121 260L124 254" fill="#fff"/></g>` }),
  },
  {
    id: 'dynia', nazwa: 'Dyniek', k: ['#ff8a1f', '#5b7a2a'], tagi: ['halloween', 'dynia'], kadr: '410 640 140 150',
    rysuj: (p, w) => ({ zwierzak: `<ellipse cx="478" cy="736" rx="70" ry="50" fill="${p.promienisty('#ffb84d', '#ffb84d', 0.45, 0)}"/>` + dynia(478, 736, 42, w.k[0], true).replace('#5b7a2a', w.k[1]) }),
  },
  {
    id: 'krolik', nazwa: 'Króliczek', k: ['#ffffff', '#ffb3d9'], tagi: ['slodka', 'wrozka'], kadr: '410 590 150 200',
    rysuj: (p, w) => {
      const c = w.k[0], o = mieszaj(c, '#8a7a9a', 0.55);
      return { zwierzak: `<g stroke="${o}" stroke-width="2.4"><ellipse cx="466" cy="640" rx="10" ry="30" transform="rotate(-10 466 660)" fill="${c}"/><ellipse cx="494" cy="640" rx="10" ry="30" transform="rotate(10 494 660)" fill="${c}"/>` +
        `<ellipse cx="480" cy="744" rx="40" ry="34" fill="${c}"/><circle cx="480" cy="690" r="30" fill="${c}"/><circle cx="518" cy="752" r="10" fill="${c}"/></g>` +
        `<ellipse cx="466" cy="640" rx="4" ry="22" transform="rotate(-10 466 660)" fill="${w.k[1]}"/><ellipse cx="494" cy="640" rx="4" ry="22" transform="rotate(10 494 660)" fill="${w.k[1]}"/>` +
        oczka(469, 491, 688, 4.5) + `<path d="M477 698L483 698L480 702Z" fill="${w.k[1]}"/><ellipse cx="462" cy="700" rx="6" ry="3.5" fill="${w.k[1]}" opacity=".6"/><ellipse cx="498" cy="700" rx="6" ry="3.5" fill="${w.k[1]}" opacity=".6"/>` };
    },
  },
  {
    id: 'piesek', nazwa: 'Piesek', k: ['#d9a066', '#7a4a2a'], tagi: ['codzienna', 'slodka'], kadr: '400 620 170 170',
    rysuj: (p, w) => {
      const c = w.k[0], o = obrys(c);
      return { zwierzak: `<g stroke="${o}" stroke-width="2.4"><path d="M520 742Q548 720 538 700" fill="none" stroke="${c}" stroke-width="9" stroke-linecap="round"/><ellipse cx="482" cy="748" rx="42" ry="30" fill="${c}"/>` +
        `<circle cx="480" cy="696" r="32" fill="${c}"/><ellipse cx="450" cy="700" rx="11" ry="22" transform="rotate(16 450 700)" fill="${w.k[1]}"/><ellipse cx="510" cy="700" rx="11" ry="22" transform="rotate(-16 510 700)" fill="${w.k[1]}"/>` +
        `<ellipse cx="480" cy="712" rx="15" ry="11" fill="${jasniej(c, 0.5)}"/></g>` + oczka(468, 492, 692, 5) + `<ellipse cx="480" cy="707" rx="5.5" ry="4" fill="#1b1020"/><path d="M480 711q0 6 -5 7M480 711q0 6 5 7" stroke="#1b1020" stroke-width="1.6" fill="none"/><path d="M477 718q3 8 6 0Z" fill="#ff7b9c"/>` };
    },
  },
  {
    id: 'sowa', nazwa: 'Sówka', k: ['#8a6a4a', '#ffd23f'], tagi: ['halloween', 'czarownica', 'szkola'], kadr: '410 620 150 170',
    rysuj: (p, w) => {
      const c = w.k[0], o = obrys(c);
      return { zwierzak: `<g stroke="${o}" stroke-width="2.4"><path d="M440 690L446 650L466 674ZM520 690L514 650L494 674Z" fill="${c}"/><ellipse cx="480" cy="720" rx="44" ry="56" fill="${c}"/><ellipse cx="480" cy="736" rx="28" ry="36" fill="${jasniej(c, 0.45)}"/>` +
        `<circle cx="464" cy="694" r="15" fill="#fff"/><circle cx="496" cy="694" r="15" fill="#fff"/></g>` + `<circle cx="464" cy="694" r="9" fill="${w.k[1]}"/><circle cx="496" cy="694" r="9" fill="${w.k[1]}"/>` + oczka(464, 496, 694, 4.5) +
        `<path d="M474 708L486 708L480 718Z" fill="#ff8a1f"/><path d="M466 740q4 4 8 0M486 750q4 4 8 0M470 760q4 4 8 0" stroke="${o}" fill="none" stroke-width="1.4"/><path d="M462 774l-4 8M470 776l0 8M490 776l0 8M498 774l4 8" stroke="#ff8a1f" stroke-width="3" stroke-linecap="round"/>` };
    },
  },
  {
    id: 'pajak', nazwa: 'Pajączek', k: ['#1b1020', '#7b2cbf'], tagi: ['halloween', 'pajak'], kadr: '420 0 120 280', unos: true,
    rysuj: (p, w) => ({ zwierzak: `<path d="M480 0L480 220" stroke="#e8e0f0" stroke-width="1.4"/><g class="unos"><g stroke="${w.k[0]}" stroke-width="3" fill="none" stroke-linecap="round"><path d="M468 228q-16 -12 -22 -2M468 236q-20 -2 -22 10M470 244q-14 6 -14 18M492 228q16 -12 22 -2M492 236q20 -2 22 10M490 244q14 6 14 18"/></g>` +
      `<ellipse cx="480" cy="240" rx="16" ry="18" fill="${w.k[0]}"/><circle cx="480" cy="222" r="12" fill="${w.k[0]}"/>` + oczka(475, 485, 221, 3.6, '#fff').replace(/fill="#fff"\/>/g, 'fill="#1b1020"/>') + `<path d="M472 244q8 6 16 0" stroke="${w.k[1]}" stroke-width="3" fill="none"/></g>` }),
  },
];

/* ---------- EFEKTY ---------- */
function rozsyp(ziarno, n, f, { y0 = 20, y1 = 780, omin = true } = {}) {
  const r = losowe(ziarno);
  let s = '';
  for (let i = 0; i < n; i++) {
    let x = r() * 600;
    const y = y0 + r() * (y1 - y0);
    // środek z postacią zostawiamy luźniejszy, żeby efekt nie zasłaniał twarzy
    if (omin && x > 220 && x < 380 && y < 300) x = x < 300 ? x - 120 : x + 120;
    s += f(x, y, r(), i);
  }
  return s;
}
export const EFEKTY = [
  { id: 'iskierki', nazwa: 'Iskierki', k: ['#ffffff', '#ffd23f'], tagi: ['gala', 'gwiazda', 'wrozka'], rysuj: (p, w) => ({ efekty: rozsyp(1, 26, (x, y, r, i) => `<path class="migot" style="animation-delay:${(r * 2).toFixed(2)}s" d="${blysk(x.toFixed(1), y.toFixed(1), (4 + r * 9).toFixed(1))}" fill="${i % 3 ? w.k[0] : w.k[1]}"/>`) }) },
  { id: 'gwiazdki', nazwa: 'Gwiazdki', k: ['#ffd23f', '#ffffff'], tagi: ['gwiazda', 'kosmos'], rysuj: (p, w) => ({ efekty: rozsyp(2, 20, (x, y, r, i) => `<path class="migot" style="animation-delay:${(r * 2).toFixed(2)}s" d="${gwiazda(x, y, 6 + r * 9)}" fill="${i % 3 ? w.k[0] : w.k[1]}" opacity=".9"/>`) }) },
  { id: 'serduszka', nazwa: 'Serduszka', k: ['#ff4d8d', '#ffb3cf'], tagi: ['slodka'], rysuj: (p, w) => ({ efekty: rozsyp(3, 18, (x, y, r, i) => `<path class="migot" style="animation-delay:${(r * 2).toFixed(2)}s" d="${serce(x, y, 7 + r * 9)}" fill="${i % 2 ? w.k[0] : w.k[1]}" opacity=".9"/>`) }) },
  { id: 'nietoperze', nazwa: 'Nietoperze', k: ['#1b1020', '#3b2a5a'], tagi: ['halloween', 'wampir'], rysuj: (p, w) => ({ efekty: rozsyp(4, 12, (x, y, r, i) => `<path class="trzepot" style="animation-delay:${(r * 2).toFixed(2)}s" d="${nietoperz(x, y, 1.6 + r * 2)}" fill="${i % 2 ? w.k[0] : w.k[1]}"/>`, { y1: 380 }) }) },
  {
    id: 'mgla', nazwa: 'Mgła', k: ['#e8e0ff', '#b8a8e8'], tagi: ['halloween', 'duch', 'czarownica'],
    rysuj: (p, w) => {
      const g = p.gradient(w.k[0], w.k[1]);
      let s = '';
      for (let i = 0; i < 7; i++) s += `<ellipse class="dryf" style="animation-delay:${i * 0.7}s" cx="${40 + i * 90}" cy="${770 - (i % 2) * 18}" rx="120" ry="38" fill="${g}" opacity=".42"/>`;
      return { efekty: s };
    },
  },
  { id: 'banki', nazwa: 'Bańki', k: ['#bfe9ff', '#ffffff'], tagi: ['syrena', 'slodka', 'plaza'], rysuj: (p, w) => ({ efekty: rozsyp(5, 22, (x, y, r) => `<g class="migot" style="animation-delay:${(r * 2).toFixed(2)}s"><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(5 + r * 14).toFixed(1)}" fill="${w.k[0]}" fill-opacity=".25" stroke="${w.k[1]}" stroke-width="1.6"/><circle cx="${(x - 3).toFixed(1)}" cy="${(y - 3).toFixed(1)}" r="${(1.5 + r * 3).toFixed(1)}" fill="#fff"/></g>`) }) },
  {
    id: 'liscie', nazwa: 'Liście', k: ['#ff8a1f', '#c1121f'], tagi: ['dynia', 'halloween', 'las'],
    rysuj: (p, w) => ({ efekty: rozsyp(6, 18, (x, y, r, i) => `<path class="migot" style="animation-delay:${(r * 2).toFixed(2)}s" transform="rotate(${(r * 360).toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})" d="M${x.toFixed(1)} ${(y - 10).toFixed(1)}q9 6 0 20q-9 -14 0 -20Z" fill="${[w.k[0], w.k[1], '#ffd23f'][i % 3]}" stroke="${ciemniej(w.k[0], 0.4)}" stroke-width="1"/>`) }),
  },
  { id: 'snieg', nazwa: 'Śnieg', k: ['#ffffff', '#dfe8ff'], tagi: ['zima'], rysuj: (p, w) => ({ efekty: rozsyp(7, 46, (x, y, r, i) => `<circle class="migot" style="animation-delay:${(r * 2).toFixed(2)}s" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(1.5 + r * 4).toFixed(1)}" fill="${i % 4 ? w.k[0] : w.k[1]}" opacity=".95"/>`, { omin: false }) }) },
  { id: 'konfetti', nazwa: 'Konfetti', k: ['#ff5d8f', '#4cc9f0'], tagi: ['gwiazda', 'slodka', 'gala'], rysuj: (p, w) => ({ efekty: rozsyp(8, 40, (x, y, r, i) => `<rect class="migot" style="animation-delay:${(r * 2).toFixed(2)}s" x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="7" height="12" rx="1.5" transform="rotate(${(r * 360).toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})" fill="${[w.k[0], w.k[1], '#ffd23f', '#5fd068', '#c77dff'][i % 5]}"/>`) }) },
  { id: 'swietliki', nazwa: 'Świetliki', k: ['#fff3b0', '#a0ffb0'], tagi: ['wrozka', 'las', 'halloween'], rysuj: (p, w) => ({ efekty: rozsyp(9, 24, (x, y, r, i) => `<circle class="migot" style="animation-delay:${(r * 2).toFixed(2)}s" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(7 + r * 7).toFixed(1)}" fill="${p.promienisty(i % 2 ? w.k[0] : w.k[1], i % 2 ? w.k[0] : w.k[1], 0.95, 0)}"/>`) }) },
  { id: 'platki', nazwa: 'Płatki róż', k: ['#ff8fc7', '#ff4d8d'], tagi: ['gala', 'ksiezniczka', 'slodka'], rysuj: (p, w) => ({ efekty: rozsyp(10, 22, (x, y, r, i) => `<ellipse class="migot" style="animation-delay:${(r * 2).toFixed(2)}s" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="${(5 + r * 4).toFixed(1)}" ry="${(3 + r * 2).toFixed(1)}" transform="rotate(${(r * 360).toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})" fill="${i % 2 ? w.k[0] : w.k[1]}"/>`) }) },
];

/* ---------- TŁA ---------- */
// obraz: plik w tla/ (z Nano Banana), albo css: gradient narysowany kodem.
export const TLA = [
  { id: 'przezroczyste', nazwa: 'Przezroczyste', css: null },
  { id: 'halloween-cmentarz', nazwa: 'Cmentarzyk', obraz: 'halloween-cmentarz', tagi: ['halloween', 'duch', 'szkielet', 'zombie', 'wampir'] },
  { id: 'nawiedzony-dwor', nazwa: 'Nawiedzony dwór', obraz: 'nawiedzony-dwor', tagi: ['halloween', 'duch', 'wampir'] },
  { id: 'halloween-dynie', nazwa: 'Dyniowe pole', obraz: 'halloween-dynie', tagi: ['halloween', 'dynia', 'las'] },
  { id: 'pracownia-czarownicy', nazwa: 'Pracownia czarownicy', obraz: 'pracownia-czarownicy', tagi: ['halloween', 'czarownica', 'kot'] },
  { id: 'impreza-halloween', nazwa: 'Impreza Halloween', obraz: 'impreza-halloween', tagi: ['halloween', 'dynia', 'diabel', 'kot', 'pajak'] },
  { id: 'wybieg', nazwa: 'Wybieg', obraz: 'wybieg', tagi: ['gwiazda', 'gala'] },
  { id: 'sala-balowa', nazwa: 'Sala balowa', obraz: 'sala-balowa', tagi: ['gala', 'ksiezniczka', 'wampir'] },
  { id: 'pokoj', nazwa: 'Pokoik', obraz: 'pokoj', tagi: ['slodka', 'codzienna'] },
  { id: 'paryz', nazwa: 'Paryż', obraz: 'paryz', tagi: ['paryz', 'codzienna'] },
  { id: 'plaza', nazwa: 'Plaża', obraz: 'plaza', tagi: ['plaza'] },
  { id: 'podwodny', nazwa: 'Podwodne królestwo', obraz: 'podwodny', tagi: ['syrena'] },
  { id: 'las-wrozek', nazwa: 'Las wróżek', obraz: 'las-wrozek', tagi: ['wrozka', 'las'] },
  { id: 'kraina-slodyczy', nazwa: 'Kraina słodyczy', obraz: 'kraina-slodyczy', tagi: ['slodka', 'cukierki'] },
  { id: 'zima', nazwa: 'Zimowa kraina', obraz: 'zima', tagi: ['zima'] },
  { id: 'kosmos', nazwa: 'Kosmos', obraz: 'kosmos', tagi: ['kosmos', 'gwiazda'] },
  { id: 'roz', nazwa: 'Różowy', css: 'linear-gradient(160deg,#ffd6ec,#ffb3d9 60%,#e9a5ff)', kolory: ['#ffd6ec', '#e9a5ff'] },
  { id: 'noc', nazwa: 'Halloweenowa noc', css: 'linear-gradient(180deg,#1b1238,#4a1f6e 60%,#ff7a2a)', kolory: ['#1b1238', '#ff7a2a'], tagi: ['halloween'] },
  { id: 'mieta', nazwa: 'Miętowy', css: 'linear-gradient(160deg,#d8fff0,#a8e6cf 60%,#88d8f0)', kolory: ['#d8fff0', '#88d8f0'] },
  { id: 'zachod', nazwa: 'Zachód słońca', css: 'linear-gradient(180deg,#ffd27a,#ff8fa3 55%,#a77bd8)', kolory: ['#ffd27a', '#a77bd8'] },
  { id: 'studio', nazwa: 'Studio', css: 'radial-gradient(circle at 50% 40%,#ffffff,#e9e4f4 70%)', kolory: ['#ffffff', '#e9e4f4'] },
];
