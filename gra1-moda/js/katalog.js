// Spis kategorii: kolejność w tablicy = kolejność rysowania w obrębie jednej warstwy.
import * as T from './katalog-twarz.js';
import * as W from './katalog-wlosy.js';
import * as U from './katalog-ubrania.js';
import * as D from './katalog-dodatki.js';
import * as S from './katalog-scena.js';

const KOL = ['Kolor', 'Drugi kolor'];

export const KATEGORIE = [
  { id: 'skora', nazwa: 'Skóra', ikona: '🎨', elementy: T.SKORA, kolory: ['Skóra'], kadr: '214 86 172 200', okragle: true },
  { id: 'ksztalt', nazwa: 'Buzia', ikona: '🥚', elementy: T.KSZTALT, kolory: [], kadr: '214 86 172 200' },
  { id: 'uszy', nazwa: 'Uszy', ikona: '🧝‍♀️', elementy: T.USZY, kolory: [], kadr: '186 110 228 120' },

  { id: 'oczy', nazwa: 'Oczy', ikona: '👀', elementy: T.OCZY, kolory: ['Tęczówki'], kadr: '230 144 140 92', rysuj: T.rysujOczy },
  { id: 'rzesy', nazwa: 'Rzęsy', ikona: '✨', elementy: T.RZESY, kolory: ['Rzęsy'], kadr: '230 144 140 92' },
  { id: 'kreska', nazwa: 'Kreska', ikona: '🖊️', elementy: T.KRESKA, kolory: ['Kreska'], kadr: '230 144 140 92' },
  { id: 'cienie', nazwa: 'Cienie', ikona: '🎨', elementy: T.CIENIE, kolory: ['Kolor', 'Drugi kolor'], kadr: '230 144 140 92', rysuj: T.rysujCienie, brak: true },
  { id: 'brwi', nazwa: 'Brwi', ikona: '〰️', elementy: T.BRWI, kolory: ['Brwi'], kadr: '232 120 136 90', rysuj: T.rysujBrwi },
  { id: 'nos', nazwa: 'Nosek', ikona: '👃', elementy: T.NOS, kolory: [], kadr: '258 188 84 60', rysuj: T.rysujNos },
  { id: 'usta', nazwa: 'Usta', ikona: '💋', elementy: T.USTA, kolory: ['Szminka'], kadr: '258 204 84 60', rysuj: T.rysujUsta },
  { id: 'policzki', nazwa: 'Policzki', ikona: '😊', elementy: T.POLICZKI, kolory: ['Róż', 'Piegi'], kadr: '226 150 148 100', rysuj: T.rysujPoliczki },
  { id: 'malunki', nazwa: 'Malunki', ikona: '🎭', elementy: T.MALUNKI, kolory: ['Kolor', 'Drugi kolor'], kadr: '220 100 160 180', rysuj: T.rysujMalunki },

  { id: 'fryzura', nazwa: 'Fryzura', ikona: '💇‍♀️', elementy: W.FRYZURY, kolory: ['Włosy', 'Końcówki', 'Gumki'], kadr: '140 10 320 400', rysuj: W.rysujFryzure, paleta: W.KOLORY_WLOSOW },
  { id: 'grzywka', nazwa: 'Grzywka', ikona: '✂️', elementy: W.GRZYWKA, kolory: [], kadr: '214 60 172 150', rysuj: W.rysujGrzywke, uwaga: 'Kolor jak włosy (Fryzura)' },
  { id: 'nakrycie', nazwa: 'Na głowę', ikona: '👒', elementy: D.NAKRYCIA, kolory: KOL, wzory: true, kadr: '160 -20 280 260', brak: true },

  { id: 'rajstopy', nazwa: 'Rajstopy', ikona: '🧦', elementy: U.RAJSTOPY, kolory: KOL, wzory: true, kadr: '196 380 208 410', brak: true },
  { id: 'buty', nazwa: 'Buty', ikona: '👠', elementy: U.BUTY, kolory: KOL, wzory: true, kadr: '226 590 148 200', brak: true },
  { id: 'dol', nazwa: 'Dół', ikona: '👖', elementy: U.DOLY, kolory: KOL, wzory: true, kadr: '170 380 260 400', brak: true, uwaga: 'Sukienka zakrywa górę i dół' },
  { id: 'gora', nazwa: 'Góra', ikona: '👚', elementy: U.GORY, kolory: KOL, wzory: true, kadr: '180 250 240 240', brak: true, uwaga: 'Sukienka zakrywa górę i dół' },
  { id: 'suknia', nazwa: 'Sukienki', ikona: '👗', elementy: U.SUKIENKI, kolory: KOL, wzory: true, kadr: '120 240 360 550', brak: true },
  { id: 'okrycie', nazwa: 'Okrycia', ikona: '🧥', elementy: U.OKRYCIA, kolory: KOL, wzory: true, kadr: '140 200 320 420', brak: true },
  { id: 'rekawiczki', nazwa: 'Rękawiczki', ikona: '🧤', elementy: D.REKAWICZKI, kolory: KOL, kadr: '170 380 90 180', brak: true },

  { id: 'naszyjnik', nazwa: 'Na szyję', ikona: '📿', elementy: D.NASZYJNIKI, kolory: KOL, wzory: true, kadr: '236 236 128 128', brak: true },
  { id: 'kolczyki', nazwa: 'Kolczyki', ikona: '💎', elementy: D.KOLCZYKI, kolory: ['Kolor'], kadr: '206 160 70 70', brak: true },
  { id: 'okulary', nazwa: 'Okulary', ikona: '🕶️', elementy: D.OKULARY, kolory: ['Oprawki', 'Szkła'], kadr: '226 136 148 92', brak: true },
  { id: 'wreka', nazwa: 'W dłoni', ikona: '🪄', elementy: D.WRECE, kolory: KOL, wzory: true, kadr: '110 370 200 280', brak: true },
  { id: 'skrzydla', nazwa: 'Skrzydła', ikona: '🦋', elementy: D.SKRZYDLA, kolory: KOL, kadr: '110 200 380 300', brak: true },
  { id: 'ogon', nazwa: 'Ogon', ikona: '🐈‍⬛', elementy: D.OGONY, kolory: KOL, kadr: '290 330 200 200', brak: true },

  { id: 'tlo', nazwa: 'Tło', ikona: '🏰', elementy: S.TLA, kolory: [], tlo: true },
  { id: 'zwierzak', nazwa: 'Zwierzak', ikona: '🐾', elementy: S.ZWIERZAKI, kolory: ['Kolor', 'Drugi kolor'], kadr: '400 600 160 200', brak: true },
  { id: 'efekty', nazwa: 'Efekty', ikona: '🌟', elementy: S.EFEKTY, kolory: KOL, kadr: '0 0 600 800', brak: true },
];

// Wyjątkowe kadry miniatur dla przedmiotów, które wystają poza kadr kategorii.
const KADRY = { 'wreka:miotla': '120 280 160 500', 'wreka:balon': '90 150 190 400', 'wreka:rozdzka': '130 370 130 190', 'wreka:lizak': '140 370 120 190', 'wreka:bukiet': '150 420 110 130', 'okrycie:wampirza': '140 110 320 420' };
export const kadrElementu = (kat, el) => el.kadr || KADRY[`${kat.id}:${el.id}`] || kat.kadr;

export const KAT = Object.fromEntries(KATEGORIE.map(k => [k.id, k]));
export const element = (katId, id) => KAT[katId]?.elementy.find(e => e.id === id);

export const GRUPY = [
  { id: 'postac', nazwa: 'Postać', ikona: '👧', kat: ['skora', 'ksztalt', 'uszy'] },
  { id: 'twarz', nazwa: 'Buzia', ikona: '😊', kat: ['oczy', 'brwi', 'nos', 'usta', 'policzki'] },
  { id: 'makijaz', nazwa: 'Makijaż', ikona: '💄', kat: ['cienie', 'kreska', 'rzesy', 'malunki'] },
  { id: 'wlosy', nazwa: 'Włosy', ikona: '💇‍♀️', kat: ['fryzura', 'grzywka', 'nakrycie'] },
  { id: 'ubrania', nazwa: 'Ubrania', ikona: '👗', kat: ['suknia', 'gora', 'dol', 'okrycie', 'rajstopy', 'buty'] },
  { id: 'dodatki', nazwa: 'Dodatki', ikona: '💍', kat: ['naszyjnik', 'kolczyki', 'okulary', 'rekawiczki', 'wreka', 'skrzydla', 'ogon'] },
  { id: 'scena', nazwa: 'Scena', ikona: '🎃', kat: ['tlo', 'zwierzak', 'efekty'] },
];

export const PALETA = ['#ffffff', '#f4f1ea', '#fff3b0', '#ffd23f', '#ffb84d', '#ff8a1f', '#ff7a3d', '#e5383b', '#c1121f', '#5c0a1e',
  '#ffd6ec', '#ffb3d9', '#ff8fc7', '#ff5d8f', '#ff4d8d', '#c13ad6', '#e9a5ff', '#c77dff', '#8b5cf6', '#7b2cbf', '#3b2a5a',
  '#bfe9ff', '#4cc9f0', '#5b8def', '#2b4c9a', '#2ec4b6', '#a0e7c0', '#5fd068', '#7fb069', '#5b7a2a',
  '#e6c8a8', '#c58556', '#8b5a2b', '#3b2418', '#b8b8c8', '#6a6a7a', '#2b2d42', '#1b1020'];

export { S, T, W, U, D };
