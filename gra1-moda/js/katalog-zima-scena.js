// Kolekcja zimowa: zwierzaki, efekty w powietrzu i tła. Tła to obrazy z Nano Banana 2.1 (Gemini) w tla/.
import { obrys, jasniej, ciemniej, mieszaj, blysk, losowe, sniezynkaD } from './narzedzia.js';
import { rozsyp, ZWIERZAKI } from './katalog-scena.js';
import { luk } from './katalog-zima-ubrania.js';

const oczka = (x1, x2, y, r = 4.5) => `<circle cx="${x1}" cy="${y}" r="${r}" fill="#1b1020"/><circle cx="${x2}" cy="${y}" r="${r}" fill="#1b1020"/>` +
  `<circle cx="${x1 - r * 0.35}" cy="${y - r * 0.35}" r="${r * 0.38}" fill="#fff"/><circle cx="${x2 - r * 0.35}" cy="${y - r * 0.35}" r="${r * 0.38}" fill="#fff"/>`;
const rumience = (x1, x2, y) => `<ellipse cx="${x1}" cy="${y}" rx="6" ry="3.5" fill="#ff8fb1" opacity=".6"/><ellipse cx="${x2}" cy="${y}" rx="6" ry="3.5" fill="#ff8fb1" opacity=".6"/>`;

/* ---------- ZWIERZAKI ---------- */
export const ZWIERZAKI_ZIMA = [
  {
    id: 'pingwin', nazwa: 'Pingwinek', k: ['#1b2a4a', '#e5383b'], tagi: ['zima', 'pingwin', 'lod'], kadr: '410 610 150 180',
    rysuj: (p, w) => {
      const c = w.k[0], o = mieszaj(c, '#000', 0.4);
      return {
        zwierzak: `<g stroke="${o}" stroke-width="2.2"><path d="M448 712Q434 732 440 752Q450 740 454 726Z" fill="${c}"/><path d="M512 712Q526 732 520 752Q510 740 506 726Z" fill="${c}"/>` +
          `<ellipse cx="480" cy="728" rx="34" ry="46" fill="${c}"/><ellipse cx="480" cy="738" rx="24" ry="34" fill="#fff"/><circle cx="480" cy="676" r="27" fill="${c}"/></g>` +
          `<path d="M480 668C468 656 456 666 458 680C460 694 474 698 480 690C486 698 500 694 502 680C504 666 492 656 480 668Z" fill="#fff"/>` + oczka(471, 489, 676, 4) +
          `<path d="M474 686L486 686L480 694Z" fill="#ff8a1f" stroke="#b85a0a" stroke-width="1.2"/>` + rumience(463, 497, 688) +
          `<path d="M462 770Q470 762 478 772ZM482 772Q490 762 498 770Z" fill="#ff8a1f" stroke="#b85a0a" stroke-width="1.2"/>` +
          `<path d="M456 700Q480 712 504 700L506 710Q480 722 454 710Z" fill="${w.k[1]}" stroke="${obrys(w.k[1])}" stroke-width="1.6"/><path d="M494 708L500 734L508 730L502 706Z" fill="${w.k[1]}" stroke="${obrys(w.k[1])}" stroke-width="1.6"/>`,
      };
    },
  },
  {
    id: 'renifer', nazwa: 'Reniferek', k: ['#a0703a', '#e5383b'], tagi: ['zima', 'renifer', 'swieta', 'las'], kadr: '400 590 170 200',
    rysuj: (p, w) => {
      const c = w.k[0], o = obrys(c), rog = 'M466 658Q456 634 444 622M458 640L442 640M452 632L454 614';
      return {
        zwierzak: `<path d="${rog}" fill="none" stroke="#5a3418" stroke-width="5" stroke-linecap="round"/><g transform="matrix(-1 0 0 1 952 0)"><path d="${rog}" fill="none" stroke="#5a3418" stroke-width="5" stroke-linecap="round"/></g>` +
          `<g stroke="${o}" stroke-width="2.2"><path d="M456 744L452 778L464 778L468 750ZM500 744L504 778L492 778L488 750Z" fill="${c}"/><ellipse cx="478" cy="738" rx="40" ry="30" fill="${c}"/>` +
          `<ellipse cx="446" cy="670" rx="12" ry="6" transform="rotate(-25 446 670)" fill="${c}"/><ellipse cx="506" cy="670" rx="12" ry="6" transform="rotate(25 506 670)" fill="${c}"/><circle cx="476" cy="686" r="26" fill="${c}"/></g>` +
          `<ellipse cx="478" cy="744" rx="22" ry="18" fill="${jasniej(c, 0.5)}"/><ellipse cx="476" cy="698" rx="15" ry="11" fill="${jasniej(c, 0.45)}"/>` +
          [[500, 724], [508, 738], [494, 712]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.6" fill="#fff" opacity=".8"/>`).join('') +
          oczka(466, 486, 682, 4) + `<circle cx="476" cy="696" r="6" fill="${p.promienisty(jasniej(w.k[1], 0.4), w.k[1], 1, 1)}"/><circle cx="474" cy="694" r="1.6" fill="#fff"/>` + rumience(460, 492, 694),
      };
    },
  },
  {
    id: 'balwan', nazwa: 'Bałwanek', k: ['#ffffff', '#e5383b'], tagi: ['zima', 'balwan', 'snieg'], kadr: '410 580 160 210',
    rysuj: (p, w) => {
      const c = w.k[0], o = mieszaj(c, '#7a86b8', 0.55), wyp = p.promienisty(c, mieszaj(c, '#bcd0f0', 0.6), 1, 1);
      return {
        zwierzak: `<path d="M448 700L424 680M424 680L418 670M424 680L414 684M512 700L536 680M536 680L542 670M536 680L546 684" stroke="#6b4a2a" stroke-width="3" stroke-linecap="round"/>` +
          `<g stroke="${o}" stroke-width="2.4"><circle cx="480" cy="744" r="38" fill="${wyp}"/><circle cx="480" cy="694" r="28" fill="${wyp}"/><circle cx="480" cy="652" r="22" fill="${wyp}"/></g>` +
          `<path d="M462 636L498 636L496 610L464 610Z" fill="#1b1020"/><path d="M456 636L504 636" stroke="#1b1020" stroke-width="5" stroke-linecap="round"/><path d="M464 628L496 628" stroke="${w.k[1]}" stroke-width="4"/>` +
          oczka(472, 488, 650, 3) + `<path d="M480 656L496 660L480 662Z" fill="#ff8a1f" stroke="#b85a0a" stroke-width="1"/>` + [466, 473, 480, 487, 494].map((x, i) => `<circle cx="${x}" cy="${666 + Math.abs(i - 2) * -1.5 + 2}" r="1.6" fill="#1b1020"/>`).join('') +
          `<path d="M458 674Q480 686 502 674L504 682Q480 694 456 682Z" fill="${w.k[1]}" stroke="${obrys(w.k[1])}" stroke-width="1.6"/><path d="M490 682L496 708L504 704L498 680Z" fill="${w.k[1]}" stroke="${obrys(w.k[1])}" stroke-width="1.6"/>` +
          [696, 712, 740, 760].map(y => `<circle cx="480" cy="${y}" r="3.4" fill="#1b1020"/>`).join(''),
      };
    },
  },
  {
    id: 'lisek', nazwa: 'Lisek polarny', k: ['#ffffff', '#bfe9ff'], tagi: ['zima', 'snieg', 'las'], kadr: '400 610 180 180',
    rysuj: (p, w) => {
      const c = w.k[0], o = mieszaj(c, '#7a86b8', 0.55);
      return {
        zwierzak: `<g stroke="${o}" stroke-width="2.2"><path d="M500 760C540 770 560 730 540 700C530 686 514 690 516 704C530 712 524 740 500 744Z" fill="${c}"/>` +
          `<path d="M452 778C446 740 454 706 480 704C506 706 514 740 508 778Z" fill="${c}"/>` +
          `<path d="M452 660L448 624L470 646ZM508 660L512 624L490 646Z" fill="${c}"/><path d="M480 700C458 700 446 680 450 660C456 644 468 640 480 640C492 640 504 644 510 660C514 680 502 700 480 700Z" fill="${c}"/></g>` +
          `<path d="M454 652L453 634L464 646ZM506 652L507 634L496 646Z" fill="${w.k[1]}"/><path d="M536 704Q544 716 540 730" fill="none" stroke="${w.k[1]}" stroke-width="6" stroke-linecap="round" opacity=".7"/>` +
          oczka(470, 490, 668, 3.6) + `<ellipse cx="480" cy="684" rx="4" ry="3" fill="#1b1020"/>` + rumience(462, 498, 680),
      };
    },
  },
  {
    id: 'mis', nazwa: 'Miś polarny', k: ['#f4f7ff', '#1b1020'], tagi: ['zima', 'snieg', 'lod'], kadr: '400 610 170 180',
    rysuj: (p, w) => {
      const c = w.k[0], o = mieszaj(c, '#7a86b8', 0.55);
      return {
        zwierzak: `<g stroke="${o}" stroke-width="2.2"><ellipse cx="480" cy="744" rx="42" ry="34" fill="${c}"/><ellipse cx="452" cy="770" rx="14" ry="10" fill="${c}"/><ellipse cx="508" cy="770" rx="14" ry="10" fill="${c}"/>` +
          `<circle cx="456" cy="664" r="11" fill="${c}"/><circle cx="504" cy="664" r="11" fill="${c}"/><circle cx="480" cy="688" r="30" fill="${c}"/><ellipse cx="480" cy="700" rx="13" ry="10" fill="${mieszaj(c, '#e8dcc8', 0.6)}"/></g>` +
          `<circle cx="456" cy="664" r="5" fill="#ffc8d8"/><circle cx="504" cy="664" r="5" fill="#ffc8d8"/>` + oczka(469, 491, 684, 3.6) +
          `<ellipse cx="480" cy="696" rx="5" ry="3.6" fill="${w.k[1]}"/><path d="M480 700q-4 5 -8 3M480 700q4 5 8 3" fill="none" stroke="${w.k[1]}" stroke-width="1.4"/>` + rumience(460, 500, 698),
      };
    },
  },
  {
    id: 'foka', nazwa: 'Foczka', k: ['#ffffff', '#c8d4e8'], tagi: ['zima', 'lod', 'pingwin'], kadr: '400 660 180 130',
    rysuj: (p, w) => {
      const c = w.k[0], o = mieszaj(c, '#7a86b8', 0.55);
      return {
        zwierzak: `<g stroke="${o}" stroke-width="2.2"><path d="M520 760Q548 748 552 770Q538 776 522 772Z" fill="${w.k[1]}"/><ellipse cx="490" cy="754" rx="48" ry="24" fill="${c}"/>` +
          `<path d="M468 764Q456 780 474 780Z" fill="${w.k[1]}"/><circle cx="458" cy="730" r="26" fill="${c}"/></g>` +
          `<ellipse cx="449" cy="728" rx="5" ry="6" fill="#1b1020"/><ellipse cx="467" cy="728" rx="5" ry="6" fill="#1b1020"/><circle cx="447" cy="726" r="1.8" fill="#fff"/><circle cx="465" cy="726" r="1.8" fill="#fff"/>` +
          `<ellipse cx="458" cy="740" rx="3.4" ry="2.4" fill="#1b1020"/><path d="M450 742L432 738M450 745L432 748M466 742L484 738M466 745L484 748" stroke="${o}" stroke-width="1" opacity=".7"/>` + rumience(442, 474, 740),
      };
    },
  },
  {
    id: 'sowaSniezna', nazwa: 'Sowa śnieżna', k: ['#ffffff', '#ffd23f'], tagi: ['zima', 'snieg', 'krolowa', 'las'], kadr: '410 620 150 170',
    rysuj: (p, w, stan) => {
      const sowa = ZWIERZAKI.find(z => z.id === 'sowa').rysuj(p, { ...w, k: [w.k[0], w.k[1]] }, stan).zwierzak;
      const r = losowe(13);
      let kropki = '';
      for (let i = 0; i < 14; i++) kropki += `<path d="M${(452 + r() * 56).toFixed(1)} ${(712 + r() * 50).toFixed(1)}l3 -2l3 2" fill="none" stroke="#2a2a3a" stroke-width="1.6" stroke-linecap="round"/>`;
      return { zwierzak: sowa.replace(/stroke="#[0-9a-f]{6}" stroke-width="2.4"/, `stroke="${mieszaj(w.k[0], '#7a86b8', 0.55)}" stroke-width="2.4"`) + kropki };
    },
  },
];

/* ---------- EFEKTY ---------- */
export const EFEKTY_ZIMA = [
  {
    id: 'sniezynki', nazwa: 'Płatki śniegu', k: ['#ffffff', '#bfe9ff'], tagi: ['zima', 'snieg', 'krolowa'],
    rysuj: (p, w) => ({ efekty: rozsyp(12, 22, (x, y, r, i) => `<path class="migot" style="animation-delay:${(r * 2).toFixed(2)}s" d="${sniezynkaD(+x.toFixed(1), +y.toFixed(1), 9 + r * 12)}" stroke="${i % 3 ? w.k[0] : w.k[1]}" stroke-width="${(1.4 + r).toFixed(1)}" stroke-linecap="round" fill="none"/>`) }),
  },
  {
    id: 'zamiec', nazwa: 'Zamieć', k: ['#ffffff', '#dfe8ff'], tagi: ['zima', 'snieg', 'narty'],
    rysuj: (p, w) => ({
      efekty: `<g class="dryf">` + rozsyp(13, 60, (x, y, r, i) => i % 2 ? `<path d="M${x.toFixed(1)} ${y.toFixed(1)}l${(-14 - r * 14).toFixed(1)} ${(6 + r * 6).toFixed(1)}" stroke="${w.k[1]}" stroke-width="${(1 + r * 1.5).toFixed(1)}" stroke-linecap="round" opacity=".7"/>` :
        `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(1.5 + r * 3.5).toFixed(1)}" fill="${w.k[0]}" opacity=".9"/>`, { omin: false }) + `</g>`,
    }),
  },
  {
    id: 'zorza', nazwa: 'Zorza polarna', k: ['#5fd0a0', '#c77dff'], tagi: ['zima', 'zorza', 'kosmos'],
    rysuj: (p, w) => {
      const pas = (y, kolor, op, a) => {
        const id = p.id('zz');
        p.defs.push(`<linearGradient id="${id}" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="${kolor}" stop-opacity="0"/><stop offset=".55" stop-color="${kolor}" stop-opacity="${op}"/><stop offset="1" stop-color="${kolor}" stop-opacity="0"/></linearGradient>`);
        return `<path class="dryf" style="animation-delay:${a}s" d="M-40 ${y}C80 ${y - 60} 180 ${y + 50} 300 ${y - 10}S520 ${y - 70} 640 ${y}L640 ${y + 90}C520 ${y + 20} 420 ${y + 100} 300 ${y + 60}S80 ${y + 30} -40 ${y + 90}Z" fill="url(#${id})"/>`;
      };
      return { efektyTyl: pas(60, w.k[0], 0.7, 0) + pas(150, '#4cc9f0', 0.45, 1.5) + pas(230, w.k[1], 0.55, 3) };
    },
  },
  {
    id: 'lampki', nazwa: 'Lampki', k: ['#ffd23f', '#e5383b'], tagi: ['zima', 'swieta'],
    rysuj: (p, w) => {
      const kol = [w.k[0], w.k[1], '#5fd068', '#4cc9f0', '#c77dff'];
      const pkt = [...luk(-10, 30, 150, 140, 300, 60, 9), ...luk(300, 60, 450, 140, 610, 30, 9).slice(1)];
      return {
        efekty: `<path d="M-10 30Q150 140 300 60Q450 140 610 30" fill="none" stroke="#2e5a3a" stroke-width="2.4"/>` +
          pkt.slice(1, -1).map(([x, y], i) => `<circle class="migot" style="animation-delay:${(i % 3) * 0.6}s" cx="${x.toFixed(1)}" cy="${(y + 12).toFixed(1)}" r="16" fill="${p.promienisty(kol[i % 5], kol[i % 5], 0.55, 0)}"/>` +
            `<rect x="${(x - 3).toFixed(1)}" y="${(y - 1).toFixed(1)}" width="6" height="6" fill="#3a4a3a"/><ellipse cx="${x.toFixed(1)}" cy="${(y + 12).toFixed(1)}" rx="5.5" ry="8.5" fill="${kol[i % 5]}" stroke="${obrys(kol[i % 5])}" stroke-width="1.2"/><ellipse cx="${(x - 1.6).toFixed(1)}" cy="${(y + 9).toFixed(1)}" rx="1.6" ry="3" fill="#fff" opacity=".7"/>`).join(''),
      };
    },
  },
  {
    id: 'sople', nazwa: 'Sople', k: ['#bfe9ff', '#ffffff'], tagi: ['zima', 'lod', 'krolowa'],
    rysuj: (p, w) => {
      const r = losowe(17), g = p.gradient('#ffffff', w.k[0]);
      let s = '';
      for (let x = 8; x < 600; x += 22 + r() * 14) { const d = 24 + r() * 60, s2 = 6 + r() * 5; s += `<path d="M${(x - s2).toFixed(1)} 16L${(x + s2).toFixed(1)} 16L${x.toFixed(1)} ${(16 + d).toFixed(1)}Z" fill="${g}" fill-opacity=".9" stroke="${ciemniej(w.k[0], 0.2)}" stroke-width="1"/><path d="M${(x - 2).toFixed(1)} 20L${(x - 1).toFixed(1)} ${(14 + d * 0.6).toFixed(1)}" stroke="#fff" stroke-width="1.4"/>`; }
      return { efekty: s + `<path d="M0 0L600 0L600 18Q570 26 540 18Q510 28 480 18Q450 26 420 18Q390 28 360 18Q330 26 300 18Q270 28 240 18Q210 26 180 18Q150 28 120 18Q90 26 60 18Q30 28 0 18Z" fill="${w.k[1]}" stroke="#c8d8f0" stroke-width="1.4"/>` };
    },
  },
  {
    id: 'szron', nazwa: 'Szron', k: ['#ffffff', '#bfe9ff'], tagi: ['zima', 'lod', 'krolowa', 'snieg'],
    rysuj: (p, w) => {
      // szronowe paprotki w rogach kadru – jak na zamarzniętej szybie
      const paproc = (x, y, k, dl) => {
        let d = '';
        const c = Math.cos(k), s = Math.sin(k);
        d += `M${x} ${y}l${(c * dl).toFixed(1)} ${(s * dl).toFixed(1)}`;
        for (let i = 1; i < 6; i++) {
          const px = x + c * dl * i / 6, py = y + s * dl * i / 6, l = dl * 0.35 * (1 - i / 7);
          for (const z of [-1, 1]) d += `M${px.toFixed(1)} ${py.toFixed(1)}l${(Math.cos(k + z * 0.7) * l).toFixed(1)} ${(Math.sin(k + z * 0.7) * l).toFixed(1)}`;
        }
        return d;
      };
      let d = '';
      const rogi = [[0, 0, 0.3], [600, 0, Math.PI - 0.3], [0, 800, -0.3], [600, 800, Math.PI + 0.3]];
      for (const [x, y, k0] of rogi) for (let i = 0; i < 5; i++) d += paproc(x, y, k0 + (i - 2) * 0.32 * (y ? -1 : 1) * (x ? -1 : 1), 90 + (i % 2) * 50);
      return { efekty: `<path d="${d}" stroke="${w.k[0]}" stroke-width="2.6" fill="none" stroke-linecap="round" opacity=".85"/><path d="${d}" stroke="${w.k[1]}" stroke-width="1" fill="none" opacity=".9"/>` +
        rozsyp(19, 18, (x, y, r) => `<path class="migot" style="animation-delay:${(r * 2).toFixed(2)}s" d="${blysk(x.toFixed(1), y.toFixed(1), (3 + r * 4).toFixed(1))}" fill="#fff"/>`) };
    },
  },
];

/* ---------- TŁA ---------- */
export const TLA_ZIMA = [
  { id: 'zimowa-wioska', nazwa: 'Zimowa wioska', obraz: 'zimowa-wioska', tagi: ['zima', 'swieta', 'codzienna', 'snieg'] },
  { id: 'lodowisko', nazwa: 'Lodowisko', obraz: 'lodowisko', tagi: ['zima', 'lyzwy'] },
  { id: 'swiateczny-salon', nazwa: 'Świąteczny salon', obraz: 'swiateczny-salon', tagi: ['zima', 'swieta', 'pizama'] },
  { id: 'lodowy-palac', nazwa: 'Lodowy pałac', obraz: 'lodowy-palac', tagi: ['zima', 'krolowa', 'lod', 'gala'] },
  { id: 'gory-narty', nazwa: 'Stok narciarski', obraz: 'gory-narty', tagi: ['zima', 'narty'] },
  { id: 'jarmark', nazwa: 'Świąteczny jarmark', obraz: 'jarmark', tagi: ['zima', 'swieta', 'cukierki', 'elf'] },
  { id: 'zorza-polarna', nazwa: 'Zorza polarna', obraz: 'zorza', tagi: ['zima', 'zorza', 'pingwin', 'lod'] },
  { id: 'las-zimowy', nazwa: 'Zimowy las', obraz: 'las-zimowy', tagi: ['zima', 'snieg', 'renifer', 'las', 'balwan'] },
  { id: 'mrozny', nazwa: 'Mroźny błękit', css: 'linear-gradient(180deg,#e8f6ff,#bfe0f8 55%,#d9c8f0)', kolory: ['#e8f6ff', '#d9c8f0'], tagi: ['zima', 'lod'] },
];
