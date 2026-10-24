// Wagony: opis 10 wagonów (układ, pora, światło, anomalie) i budowa wnętrza z brył.
// Układ lokalny wagonu: x w poprzek, y w górę (podłoga 0), z wzdłuż – tylne drzwi z = 0, przednie z = -DL.
import * as THREE from '../lib/three.js';
import { Zbieracz, generator, zwolnij } from './narzedzia.js';
import { T, obraz, tabliczka, plakat } from './tekstury.js';
import { stworzPasazera, stworzStojacego, animujPasazera } from './postacie.js';

export const POL = 1.45, DL = 28, LACZNIK = 1.8, SCIANA = 2.05, SUFIT = 2.45, OKNO_DOL = 0.82, OKNO_GORA = 1.74;
const MODUL = 1.9; // okno + filarek

/* ---------- opisy wagonów ---------- */
export const WAGONY = [
  {
    nazwa: 'Druga klasa', opis: 'Zwykły wagon. Na pewno?', uklad: 'otwarty', pora: 'dzien',
    swiatlo: { kolor: 0xfff3dc, moc: 3.6, otoczenie: 0.55, mruganie: 0.02 }, obsadzenie: 0.45,
    sciany: '#d9d2bf', podloga: ['#5d6266', '#474c50'], tkanina: '#ffffff',
    anomalie: { ile: 2, naraz: 1, czas: 11, typy: ['zjawa', 'zjawa'] }, groza: 0,
    komunikat: 'Witamy w ekspresie Meśnik. Życzymy spokojnej podróży.',
  },
  {
    nazwa: 'Wagon z przedziałami', opis: 'Nie zaglądaj do przedziałów. Albo zaglądaj.', uklad: 'przedzialy', pora: 'dzien',
    swiatlo: { kolor: 0xfff0d0, moc: 4.16, otoczenie: 0.5, mruganie: 0.05 }, obsadzenie: 0.55,
    sciany: '#cfc6ae', podloga: ['#6a5a4a', '#56483a'], tkanina: '#c9b8ff',
    anomalie: { ile: 3, naraz: 1, czas: 10.5, typy: ['dama', 'zjawa', 'pasazer'] }, groza: 0.15,
    komunikat: 'Przypominamy: nie zostawiajcie bagażu bez opieki. I nie patrzcie za długo w szyby przedziałów.',
  },
  {
    nazwa: 'Wagon restauracyjny', opis: 'Dziś w menu: żurek. I coś jeszcze.', uklad: 'restauracja', pora: 'zmierzch',
    swiatlo: { kolor: 0xffd29a, moc: 6.5, otoczenie: 0.55, mruganie: 0.06 }, obsadzenie: 0.6,
    sciany: '#8a5a3a', podloga: ['#3e2a22', '#2e1f19'], tkanina: '#ff9a8a',
    anomalie: { ile: 3, naraz: 2, czas: 10, typy: ['rozmyty', 'twarz', 'pasazer'] }, groza: 0.3,
    komunikat: 'Wagon restauracyjny zaprasza. Dziś w menu żurek. I coś jeszcze.',
  },
  {
    nazwa: 'Wagon sypialny', opis: 'Cisza nocna. Niektórzy nie śpią.', uklad: 'sypialny', pora: 'noc',
    swiatlo: { kolor: 0x9fb4ff, moc: 2.86, otoczenie: 0.2, mruganie: 0.1 }, obsadzenie: 0,
    sciany: '#6a4a36', podloga: ['#3a2a3a', '#2a1f2a'], tkanina: '#ffffff', latarka: true,
    anomalie: { ile: 4, naraz: 2, czas: 9.5, typy: ['dziecko', 'sufit', 'dama', 'twarz'] }, groza: 0.45,
    komunikat: 'Cisza nocna. Prosimy nie budzić pasażerów. Niektórzy nie śpią.',
  },
  {
    nazwa: 'Wagon bagażowy', opis: 'Manekinów proszę nie dotykać.', uklad: 'bagazowy', pora: 'noc',
    swiatlo: { kolor: 0xffc070, moc: 4.16, otoczenie: 0.18, mruganie: 0.12 }, obsadzenie: 0,
    sciany: '#5a5048', podloga: ['#3a3632', '#2a2622'], tkanina: '#ffffff', latarka: true,
    anomalie: { ile: 4, naraz: 2, czas: 9, typy: ['pelzacz', 'manekin', 'manekin', 'zjawa'] }, groza: 0.55,
    komunikat: 'Wagon bagażowy. Pasażerom wstęp wzbroniony. Manekinów proszę nie dotykać.',
  },
  {
    nazwa: 'Pierwsza klasa', opis: 'Sprawdź dokładnie, kto tu siedzi. Dwa razy.', uklad: 'pierwsza', pora: 'noc',
    swiatlo: { kolor: 0xffc890, moc: 5.85, otoczenie: 0.35, mruganie: 0.06 }, obsadzenie: 0.6,
    sciany: '#5b3420', podloga: ['#4a1a1a', '#3a1414'], tkanina: '#ffffff',
    anomalie: { ile: 5, naraz: 2, czas: 9, typy: ['blizniak', 'blizniak', 'pasazer', 'rozmyty', 'zaplecami'] }, groza: 0.6,
    komunikat: 'Pierwsza klasa. Sprawdźcie dokładnie, kto tu siedzi. Dwa razy.',
  },
  {
    nazwa: 'Tunel', opis: 'Gdy gaśnie światło, ONI się ruszają.', uklad: 'otwarty', pora: 'tunel',
    swiatlo: { kolor: 0x7fa0ff, moc: 1.56, otoczenie: 0.08, mruganie: 0.35, awaryjne: true }, obsadzenie: 0.4,
    sciany: '#9a9a90', podloga: ['#3a3e42', '#2a2e32'], tkanina: '#9aa0b0', latarka: true,
    anomalie: { ile: 5, naraz: 2, czas: 8.5, typy: ['migacz', 'migacz', 'pelzacz', 'zaplecami', 'pasazer'] }, groza: 0.7,
    komunikat: 'Wjeżdżamy do tunelu. Włączcie latarki klawiszem F.',
  },
  {
    nazwa: 'Wagon opuszczony', opis: 'Wyłączony z eksploatacji. Od dawna.', uklad: 'opuszczony', pora: 'czerwien',
    swiatlo: { kolor: 0xff9a80, moc: 3.25, otoczenie: 0.16, mruganie: 0.4 }, obsadzenie: 0.3,
    sciany: '#7a7466', podloga: ['#3a3430', '#2a2420'], tkanina: '#8a8a7a', latarka: true,
    anomalie: { ile: 6, naraz: 3, czas: 8, typy: ['zjawa', 'dama', 'pelzacz', 'sufit', 'dziecko', 'twarz'] }, groza: 0.8,
    komunikat: 'Ten wagon jest wyłączony z eksploatacji. Od dawna.',
  },
  {
    nazwa: 'Wagon odwrócony', opis: 'Coś tu jest do góry nogami.', uklad: 'odwrocony', pora: 'czerwien',
    swiatlo: { kolor: 0xffe0d0, moc: 5.2, otoczenie: 0.3, mruganie: 0.15 }, obsadzenie: 0.5,
    sciany: '#b8b0a0', podloga: ['#4a4e52', '#3a3e42'], tkanina: '#ffffff',
    anomalie: { ile: 6, naraz: 3, czas: 7.5, typy: ['zjawa', 'pasazer', 'rozmyty', 'pelzacz', 'zaplecami', 'migacz'] }, groza: 0.85,
    komunikat: 'Wagon numer osiem. Wagon numer osiem. Wagon numer… dziewięć.',
  },
  {
    nazwa: 'Wagon konduktora', opis: 'Kontrola biletów.', uklad: 'konduktor', pora: 'czerwien',
    swiatlo: { kolor: 0xff3020, moc: 5.2, otoczenie: 0.2, mruganie: 0.2 }, obsadzenie: 0.7,
    sciany: '#6a3a34', podloga: ['#2a1a1a', '#1f1414'], tkanina: '#ff8a8a',
    anomalie: { ile: 1, naraz: 4, czas: 9, typy: ['konduktor'] }, groza: 1,
    komunikat: 'Kontrola biletów. Proszę przygotować bilety.',
  },
];

/* ---------- materiały ---------- */
function std(o) { return new THREE.MeshStandardMaterial(Object.assign({ roughness: 0.8 }, o)); }
const wspolne = {};
function W(nazwa, f) { if (!wspolne[nazwa]) { wspolne[nazwa] = f(); wspolne[nazwa].userData.wspolny = true; } return wspolne[nazwa]; }
const M = {
  metal: () => W('metal', () => std({ color: 0x9aa0a6, metalness: 0.7, roughness: 0.35 })),
  ciemnyMetal: () => W('cmetal', () => std({ color: 0x2a2c30, metalness: 0.6, roughness: 0.5 })),
  guma: () => W('guma', () => std({ color: 0x151515, roughness: 0.9 })),
  szyba: () => W('szyba', () => new THREE.MeshStandardMaterial({ color: 0x223038, metalness: 0.2, roughness: 0.05, transparent: true, opacity: 0.16, depthWrite: false })),
  szybaPrzedzialu: () => W('szybap', () => new THREE.MeshStandardMaterial({ color: 0xaab8c0, metalness: 0.1, roughness: 0.1, transparent: true, opacity: 0.12, depthWrite: false, side: THREE.DoubleSide })),
  bialy: () => W('bialy', () => std({ color: 0xeeeae0, roughness: 0.9 })),
  oslona: () => W('oslona', () => std({ color: 0xbdb8a8, roughness: 0.95 })),
  obrus: () => W('obrus', () => std({ color: 0xf2eee6, roughness: 0.95 })),
  harmonijka: () => W('harm', () => std({ map: T.harmonijka(), roughness: 0.95, side: THREE.DoubleSide })),
  blacha: () => W('blacha', () => std({ map: T.blacha(), metalness: 0.5, roughness: 0.5 })),
  skrzynia: () => W('skrz', () => std({ map: T.skrzynia(), roughness: 0.9 })),
  czerwony: () => W('czerw', () => std({ color: 0xb01818, roughness: 0.4 })),
  zielonySygnal: () => W('ziel', () => std({ color: 0x000000, emissive: 0x20ff60, emissiveIntensity: 3 })),
  czerwonySygnal: () => W('czs', () => std({ color: 0x000000, emissive: 0xff2010, emissiveIntensity: 3 })),
  czarny: () => W('czarny', () => std({ color: 0x050505, roughness: 1 })),
  szybaDrzwi: () => W('szybad', () => std({ color: 0x0c1418, roughness: 0.08, metalness: 0.7 })),
  awaryjne: () => W('awar', () => std({ color: 0x000000, emissive: 0x3060ff, emissiveIntensity: 2.5 })),
};

/* ---------- drzwi ---------- */
function drzwi(scena, z, mat, tyl) {
  const g = new THREE.Group(); g.position.set(0, 0, z);
  const skrzydlo = new THREE.Group(); g.add(skrzydlo);
  const zb = new Zbieracz();
  zb.box(mat, 0.12, 2.0, 0.05, -0.39, 1.0, 0).box(mat, 0.12, 2.0, 0.05, 0.39, 1.0, 0);
  zb.box(mat, 0.66, 0.95, 0.05, 0, 0.475, 0).box(mat, 0.66, 0.22, 0.05, 0, 1.89, 0);
  zb.box(M.ciemnyMetal(), 0.04, 0.3, 0.07, 0.3, 1.05, 0);
  zb.box(M.szybaDrzwi(), 0.66, 0.83, 0.02, 0, 1.365, 0);
  zb.zbuduj(skrzydlo);
  scena.add(g);
  const tab = tabliczka();
  const ekran = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.155), new THREE.MeshBasicMaterial({ map: tab, toneMapped: false }));
  ekran.position.set(0, 2.2, tyl ? -0.06 : 0.06); if (!tyl) ekran.rotation.y = 0; else ekran.rotation.y = Math.PI;
  g.add(ekran);
  const lampka = new THREE.Mesh(new THREE.SphereGeometry(0.035, 10, 8), M.czerwonySygnal());
  lampka.position.set(0.42, 2.2, tyl ? -0.06 : 0.06); g.add(lampka);
  return { grupa: g, skrzydlo, tab, ekran, lampka, otwarcie: 0, cel: 0, zamknieta: true };
}

/* ---------- budowa wagonu ---------- */
export class Wagon {
  constructor(nr, z0, ziarno) {
    this.nr = nr; this.m = WAGONY[nr]; this.z0 = z0;
    this.los = generator(ziarno);
    this.grupa = new THREE.Group(); this.grupa.position.z = z0;
    this.wnetrze = new THREE.Group(); this.grupa.add(this.wnetrze);
    this.lampy = []; this.kolizje = []; this.pasazerowie = []; this.siedzenia = [];
    this.miejsca = { przejscie: [], miedzy: [], okna: [], sufit: [], przedzialy: [] };
    this.osobne = []; // obiekty z animacją (żarówki, kartki)
    this.mruganie = 0; this.czasMrugania = 0; this.jasnosc = 1; this.awaria = 0;
    this.sciezka = null;
    const m = this.m;
    this.mat = {
      sciana: std({ map: T.panel(m.sciany), roughness: 0.7 }),
      sufit: std({ color: 0xaaa598, roughness: 0.9, side: THREE.DoubleSide }),
      podloga: std({ map: T.linoleum(...m.podloga), roughness: 0.75 }),
      lampa: new THREE.MeshStandardMaterial({ color: 0x000000, emissive: m.swiatlo.kolor, emissiveIntensity: 1.6 }),
      tkanina: std({ map: obraz('tkanina.jpg', { powtarzaj: true }), color: m.tkanina, roughness: 0.95 }),
      drzwi: std({ color: 0x8a8f94, metalness: 0.4, roughness: 0.5 }),
    };
    if (m.uklad === 'pierwsza' || m.uklad === 'sypialny' || m.uklad === 'restauracja') this.mat.sciana = std({ map: T.drewno(m.sciany), roughness: 0.55 });
    if (m.uklad === 'pierwsza') this.mat.tkanina = std({ map: T.aksamit(), roughness: 0.9 });
    if (m.uklad === 'bagazowy') this.mat.sciana = std({ map: T.drewno('#4a4038', '#2a241e'), roughness: 0.9 });
    this.mat.podloga.map = this.mat.podloga.map.clone(); this.mat.podloga.map.repeat.set(1, DL / 4); this.mat.podloga.map.needsUpdate = true; this.mat.podloga.map.userData.wlasna = true;
    this.zb = new Zbieracz(); this.zbStaly = new Zbieracz();
    this.skorupa();
    const u = m.uklad;
    if (u === 'otwarty' || u === 'opuszczony' || u === 'odwrocony' || u === 'konduktor') this.otwarty();
    else if (u === 'przedzialy') this.przedzialy(false);
    else if (u === 'sypialny') this.przedzialy(true);
    else if (u === 'restauracja') this.restauracja();
    else if (u === 'bagazowy') this.bagazowy();
    else if (u === 'pierwsza') this.pierwsza();
    this.zb.zbuduj(this.wnetrze);
    this.zbStaly.zbuduj(this.grupa);
    if (u === 'odwrocony') { this.wnetrze.scale.y = -1; this.wnetrze.position.y = SUFIT - 0.02; }
    this.lacznik();
    this.drzwiTyl = drzwi(this.grupa, 0, this.mat.drzwi, true);
    this.drzwiPrzod = drzwi(this.grupa, -DL, this.mat.drzwi, false);
    this.drzwiTyl.ekran.visible = false; this.drzwiTyl.lampka.visible = false;
    // Kolizje w układzie świata.
    this.kolizje = this.kolizje.map(k => ({ x0: k.x0, x1: k.x1, z0: k.z0 + z0, z1: k.z1 + z0 }));
    this.lampy.forEach(l => { l.z += z0; l.baza = l.moc; });
    for (const k of Object.keys(this.miejsca)) this.miejsca[k].forEach(p => { p.z += z0; });
    this.siedzenia.forEach(s => { s.z += z0; });
  }

  // Ściany z oknami, podłoga, łukowy sufit, lampy, półki, ściany czołowe.
  skorupa() {
    const zb = this.zb, m = this.mat, u = this.m.uklad;
    zb.plaszczyzna(m.podloga, POL * 2, DL, 0, 0, -DL / 2, -Math.PI / 2);
    // Sufit: wycinek walca (łuk od ścian 2.05 do 2.45 m).
    const R = 2.828, kat = Math.asin(POL / R);
    const sufit = new THREE.CylinderGeometry(R, R, DL, 24, 1, true, Math.PI - kat, 2 * kat);
    zb.dodaj(m.sufit, sufit, 0, SUFIT - R, -DL / 2, Math.PI / 2, 0, 0);
    sufit.dispose();
    const n = Math.floor(DL / MODUL), start = -(DL - n * MODUL) / 2;
    for (const s of [-1, 1]) {
      const x = s * (POL + 0.04);
      if ((u === 'przedzialy' || u === 'sypialny') && s === -1) continue; // lewą ścianę buduje przedzialy()
      {
        zb.box(m.sciana, 0.08, OKNO_DOL, DL, x, OKNO_DOL / 2, -DL / 2);
        zb.box(m.sciana, 0.08, SCIANA - OKNO_GORA + 0.05, DL, x, (OKNO_GORA + SCIANA) / 2, -DL / 2);
        zb.box(M.bialy(), 0.16, 0.035, DL, s * (POL - 0.04), OKNO_DOL, -DL / 2); // parapet
        for (let i = 0; i <= n; i++) {
          const z = start - i * MODUL;
          zb.box(m.sciana, 0.1, OKNO_GORA - OKNO_DOL, i === 0 || i === n ? 1.0 : 0.55, x, (OKNO_DOL + OKNO_GORA) / 2, i === 0 ? z + 0.22 : i === n ? z - 0.22 : z);
          if (i < n) {
            const zs = z - MODUL / 2;
            zb.plaszczyzna(M.szyba(), MODUL - 0.55, OKNO_GORA - OKNO_DOL, x - s * 0.02, (OKNO_DOL + OKNO_GORA) / 2, zs, 0, -s * Math.PI / 2);
            zb.box(M.guma(), 0.03, 0.04, MODUL - 0.55, x - s * 0.04, OKNO_GORA - 0.02, zs).box(M.guma(), 0.03, 0.04, MODUL - 0.55, x - s * 0.04, OKNO_DOL + 0.02, zs);
            this.miejsca.okna.push({ x: s, z: zs });
          }
        }
      }
    }
    // Ściany czołowe z otworem na drzwi (osobny zbieracz – w odwróconym wagonie drzwi zostają na dole).
    const zs = this.zbStaly;
    for (const z of [0, -DL]) {
      zs.box(m.sciana, POL - 0.45, SCIANA + 0.4, 0.08, -(POL + 0.45) / 2, (SCIANA + 0.4) / 2, z);
      zs.box(m.sciana, POL - 0.45, SCIANA + 0.4, 0.08, (POL + 0.45) / 2, (SCIANA + 0.4) / 2, z);
      zs.box(m.sciana, 0.9, SUFIT - 2.0, 0.08, 0, 2.0 + (SUFIT - 2.0) / 2, z);
      zs.box(M.ciemnyMetal(), 0.06, 2.0, 0.12, -0.48, 1.0, z).box(M.ciemnyMetal(), 0.06, 2.0, 0.12, 0.48, 1.0, z).box(M.ciemnyMetal(), 1.02, 0.06, 0.12, 0, 2.02, z);
      // Gaśnica i młotek przy drzwiach.
      const sz = z === 0 ? -1 : 1;
      if (u !== 'bagazowy') zs.walec(M.czerwony(), 0.07, 0.42, 1.25, 0.21, z - sz * 0.12);
      zs.box(M.czerwony(), 0.18, 0.24, 0.04, -1.1, 1.5, z - sz * 0.06);
      for (const s of [-1, 1]) this.kolizje.push({ x0: s < 0 ? -3 : 0.45, x1: s < 0 ? -0.45 : 3, z0: z - 0.08, z1: z + 0.08 });
    }
    // Plakaty na ścianie czołowej (od strony wejścia widać przednią).
    if (u !== 'bagazowy') {
      const zly = this.nr >= 5;
      const pl = [['plakat-gory.jpg', 'TATRY', 'Jedź z nami ekspresem Meśnik'], ['plakat-morze.jpg', 'BAŁTYK', 'Koleje Meśnik zapraszają']];
      if (zly) pl[0] = ['plakat-zly.jpg', 'TATRY', 'Jedź z nami. Zostań z nami.'];
      pl.forEach(([n, a, b], i) => {
        const tex = plakat(n, a, b);
        const s = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.67), std({ map: tex, roughness: 0.6 }));
        s.position.set(i ? 0.95 : -0.95, 1.35, -DL + 0.05);
        this.wnetrze.add(s);
      });
    }
    // Lampy sufitowe: pas świetlówek przez środek + punkty dla puli świateł.
    const sw = this.m.swiatlo;
    if (u !== 'sypialny' && u !== 'bagazowy') {
      for (let z = -1.6; z > -DL + 1; z -= 2.2) {
        if (u === 'opuszczony' && this.los.szansa(0.45)) {
          const s = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.04, 1.3), M.ciemnyMetal());
          s.position.set(0, SUFIT - 0.35, z); s.rotation.x = this.los.zakres(-0.5, 0.5); s.rotation.z = this.los.zakres(-0.3, 0.3);
          this.wnetrze.add(s); continue;
        }
        zb.box(this.mat.lampa, 0.3, 0.03, 1.3, 0, SUFIT - 0.03, z);
        zb.box(M.metal(), 0.36, 0.05, 1.4, 0, SUFIT - 0.005, z);
      }
      for (let z = -2.5; z > -DL; z -= 4.6) this.lampy.push({ x: 0, y: SUFIT - 0.55, z, kolor: sw.kolor, moc: sw.moc });
    }
    if (sw.awaryjne) { // niebieskie listwy przy podłodze
      for (const s of [-1, 1]) zb.box(M.awaryjne(), 0.02, 0.02, DL - 1, s * 0.5, 0.03, -DL / 2);
    }
    // Półki bagażowe.
    if (u === 'otwarty' || u === 'opuszczony' || u === 'odwrocony' || u === 'konduktor' || u === 'pierwsza') {
      for (const s of [-1, 1]) {
        for (const dx of [0.75, 0.95, 1.15, 1.35]) zb.walec(M.metal(), 0.012, DL - 1.2, s * dx, 1.93, -DL / 2, Math.PI / 2);
        for (let z = -1.5; z > -DL + 1; z -= 1.9) zb.box(M.metal(), 0.7, 0.03, 0.03, s * 1.05, 1.92, z);
        for (let z = -1.2; z > -DL + 1; z -= this.los.zakres(0.5, 2.5)) {
          if (this.los.szansa(0.5)) continue;
          const w = this.los.zakres(0.3, 0.6), h = this.los.zakres(0.15, 0.3);
          zb.box(this.matBagazu(), 0.45, h, w, s * 1.05, 1.95 + h / 2, z);
        }
      }
    }
    // Ściany boczne – kolizje.
    this.kolizje.push({ x0: -3, x1: -POL + 0.02, z0: -DL, z1: 0 }, { x0: POL - 0.02, x1: 3, z0: -DL, z1: 0 });
    // Punkty przejścia (środek) i sufitu.
    if (u !== 'bagazowy') for (let z = -1.5; z > -DL + 1; z -= 1) { this.miejsca.przejscie.push({ x: u === 'przedzialy' || u === 'sypialny' ? 0.95 : u === 'pierwsza' ? -0.2 : 0, z }); this.miejsca.sufit.push({ x: 0, z }); }
  }

  matBagazu() {
    const k = this.los.wybierz(['#3a2a1f', '#1f2a3a', '#5a1f1f', '#2a2a2a', '#4a4a3a', '#6a5a3a']);
    this._bagaze ||= {};
    return this._bagaze[k] ||= std({ color: k, roughness: 0.7 });
  }

  // Siedzenie (fotel) przodem do kierunku f = ±1 (+1 → patrzy na +z, w stronę gracza wchodzącego).
  fotel(x, z, f, { szer = 0.44, mat = this.mat.tkanina, duzy = false } = {}) {
    const zb = this.zb, h = duzy ? 1.25 : 1.15;
    zb.box(mat, szer, 0.13, 0.5, x, 0.42, z + f * 0.02);
    zb.box(mat, szer, h - 0.45, 0.13, x, 0.45 + (h - 0.45) / 2, z - f * 0.27, -f * 0.1);
    if (!duzy) zb.box(M.oslona(), szer - 0.12, 0.13, 0.135, x, h - 0.1, z - f * 0.29, -f * 0.1);
    zb.box(M.ciemnyMetal(), szer - 0.06, 0.35, 0.05, x, 0.18, z);
    this.siedzenia.push({ x, z, f, zajete: false });
  }

  posadz(siedzenie, opcje = {}) {
    const p = stworzPasazera(this.los, opcje);
    p.grupa.position.set(siedzenie.x, 0, siedzenie.z);
    p.grupa.rotation.y = siedzenie.f > 0 ? 0 : Math.PI;
    this.wnetrze.add(p.grupa);
    p.siedzenie = siedzenie; siedzenie.zajete = true;
    this.pasazerowie.push(p);
    return p;
  }

  // Wagon otwarty 2+2 w układzie „vis-à-vis”, z wariantami: opuszczony, odwrócony, konduktora.
  otwarty() {
    const u = this.m.uklad, los = this.los, zb = this.zb;
    const n = Math.floor((DL - 2.4) / MODUL);
    for (let i = 0; i < n; i++) {
      const zb0 = -1.2 - i * MODUL;
      for (const s of [-1, 1]) {
        for (const x of [0.72, 1.17]) {
          if (u === 'opuszczony' && los.szansa(0.15)) { // wyrwany fotel leży w przejściu
            zb.box(this.mat.tkanina, 0.44, 0.13, 0.5, s * los.zakres(0.5, 1.0), 0.1, zb0 - los.zakres(0, 1.8), los.zakres(-1, 1), los.zakres(0, 3), 0.2);
            continue;
          }
          const fA = u === 'konduktor' ? 1 : -1;
          this.fotel(s * x, zb0 - 0.4, fA);
          this.fotel(s * x, zb0 - 1.5, 1);
        }
        zb.box(M.ciemnyMetal(), 0.42, 0.035, 0.36, s * 1.22, 0.72, zb0 - 0.95);
        this.miejsca.miedzy.push({ x: s * 0.95, z: zb0 - 0.95 });
      }
    }
    const ob = this.m.obsadzenie;
    for (const s of this.siedzenia) {
      if (s.z > -1.5) continue;
      if (los.szansa(ob)) {
        const p = this.posadz(s, { cien: u === 'opuszczony' });
        if (u === 'konduktor') p.wymuszonePatrzenie = true;
        if (u === 'opuszczony') p.zamrozony = true;
      }
    }
    // Siedzenia nie kolidują z graczem tylko w odwróconym wagonie (wiszą pod sufitem).
    if (u !== 'odwrocony') for (const s of [-1, 1]) this.kolizje.push({ x0: s < 0 ? -2 : 0.48, x1: s < 0 ? -0.48 : 2, z0: -DL + 1.1, z1: -1.1 });
    if (u === 'odwrocony') {
      // Świetlówki „na podłodze” – po odwróceniu wnętrza lampy trafiają na dół.
      for (const l of this.lampy) l.y = 0.3;
      for (let i = 0; i < 14; i++) this.miejsca.przejscie.push({ x: los.zakres(-1, 1), z: los.zakres(-DL + 2, -2) });
    }
    if (u === 'opuszczony') {
      // Śmieci, kartki, zwisające kable.
      for (let i = 0; i < 40; i++) zb.plaszczyzna(M.bialy(), los.zakres(0.1, 0.3), los.zakres(0.1, 0.3), los.zakres(-1.3, 1.3), 0.005, los.zakres(-DL + 1, -1), -Math.PI / 2, 0, los.zakres(0, 3));
      for (let i = 0; i < 8; i++) zb.walec(M.guma(), 0.01, los.zakres(0.4, 1), los.zakres(-0.5, 0.5), SUFIT - 0.4, los.zakres(-DL + 1, -1), los.zakres(-0.3, 0.3), 0, los.zakres(-0.3, 0.3));
    }
  }

  // Wagon z przedziałami (dzienny) lub sypialny (zamknięte kabiny): korytarz po prawej (+x).
  przedzialy(sypialny) {
    const zb = this.zb, los = this.los, m = this.mat;
    const DP = 2.2, n = Math.floor((DL - 3.6) / DP), start = -1.8; // przedsionki przy drzwiach
    const xs = 0.35; // ściana przedziałów
    const mKabina = std({ color: 0x4a2c1c, roughness: 0.6 }), mPoswiata = std({ color: 0, emissive: 0xff5a20, emissiveIntensity: 0.6 });
    // Ściana zewnętrzna przedziałów (lewa) z oknami.
    const x = -(POL + 0.04);
    zb.box(m.sciana, 0.08, OKNO_DOL, DL, x, OKNO_DOL / 2, -DL / 2);
    zb.box(m.sciana, 0.08, SCIANA - OKNO_GORA + 0.05, DL, x, (OKNO_GORA + SCIANA) / 2, -DL / 2);
    // Wypełnienie pasa okien przed pierwszym i za ostatnim przedziałem.
    const koniec = start - n * DP;
    zb.box(m.sciana, 0.1, OKNO_GORA - OKNO_DOL, -start, x, (OKNO_DOL + OKNO_GORA) / 2, start / 2);
    zb.box(m.sciana, 0.1, OKNO_GORA - OKNO_DOL, koniec + DL, x, (OKNO_DOL + OKNO_GORA) / 2, (koniec - DL) / 2);
    zb.box(m.sciana, POL + xs, SCIANA, 0.06, (-POL + xs) / 2, SCIANA / 2, koniec);
    for (let i = 0; i < n; i++) {
      const z0 = start - i * DP, zc = z0 - DP / 2;
      // ścianka między przedziałami + filarek okna
      zb.box(m.sciana, POL + xs, SCIANA, 0.06, (-POL + xs) / 2, SCIANA / 2, z0);
      zb.box(m.sciana, 0.1, OKNO_GORA - OKNO_DOL, 0.5, x, (OKNO_DOL + OKNO_GORA) / 2, z0);
      zb.plaszczyzna(M.szyba(), DP - 0.5, OKNO_GORA - OKNO_DOL, x + 0.02, (OKNO_DOL + OKNO_GORA) / 2, zc, 0, Math.PI / 2);
      if (sypialny) {
        // Pełna ściana z drzwiami kabiny, czasem uchylonymi.
        const uchylone = los.szansa(0.25);
        zb.box(m.sciana, 0.06, SCIANA, DP - 0.8, xs, SCIANA / 2, zc + 0.6 + 0.0);
        zb.box(m.sciana, 0.06, SCIANA - 1.95, 0.8, xs, 1.95 + (SCIANA - 1.95) / 2, zc - 0.4 + 0.0);
        zb.box(mKabina, 0.05, 1.95, 0.75, xs + (uchylone ? -0.25 : 0.01), 0.975, zc - 0.4 + (uchylone ? -0.25 : 0), 0, uchylone ? 0.9 : 0);
        zb.box(M.metal(), 0.06, 0.08, 0.14, xs + 0.04, 1.65, zc - 0.05);
        if (uchylone) {
          // Słaba poświata z kabiny.
          zb.box(mPoswiata, 0.02, 1.9, 0.6, xs - 0.6, 0.95, zc - 0.4);
          this.miejsca.przedzialy.push({ x: xs - 0.5, z: zc - 0.4 });
        }
        if (i % 2 === 0) this.lampy.push({ x: 0.95, y: SCIANA - 0.1, z: zc, kolor: this.m.swiatlo.kolor, moc: this.m.swiatlo.moc });
        zb.box(this.mat.lampa, 0.2, 0.04, 0.2, 0.95, SCIANA + 0.15, zc);
        zb.box(M.awaryjne(), 0.05, 0.03, 0.12, POL - 0.05, 0.25, zc);
      } else {
        // Przeszklona ściana z drzwiami przesuwnymi i dwie ławki po 3 miejsca.
        zb.box(m.sciana, 0.06, 0.9, DP, xs, 0.45, zc);
        zb.box(m.sciana, 0.06, SCIANA - 1.95, DP, xs, 1.95 + (SCIANA - 1.95) / 2, zc);
        zb.plaszczyzna(M.szybaPrzedzialu(), DP - 0.1, 1.05, xs, 1.42, zc, 0, Math.PI / 2);
        for (const dz of [DP / 2 - 0.03, -DP / 2 + 0.03, -0.3, 0.3]) zb.box(M.ciemnyMetal(), 0.07, 1.05, 0.04, xs, 1.42, zc + dz);
        for (const xx of [-1.15, -0.62, -0.09]) { this.fotel(xx, z0 - 0.42, -1, { szer: 0.5 }); this.fotel(xx, z0 - DP + 0.42, 1, { szer: 0.5 }); }
        zb.box(M.ciemnyMetal(), 0.35, 0.03, 0.45, -1.25, 0.72, zc);
        zb.box(this.mat.lampa, 0.4, 0.03, 0.4, -0.55, SCIANA - 0.02, zc);
        this.lampy.push({ x: -0.6, y: SCIANA - 0.2, z: zc, kolor: 0xffe2b0, moc: this.m.swiatlo.moc * 0.6 });
        this.miejsca.przedzialy.push({ x: -0.6, z: zc });
        // Bagaże nad ławkami.
        zb.box(M.metal(), 1.7, 0.02, 0.35, -0.55, 1.9, z0 - 0.25).box(M.metal(), 1.7, 0.02, 0.35, -0.55, 1.9, z0 - DP + 0.25);
        if (los.szansa(0.6)) zb.box(this.matBagazu(), 0.5, 0.22, 0.32, -0.9, 2.02, z0 - 0.25);
      }
    }
    // Korytarz: świetlówki, poręcz pod oknami.
    zb.walec(M.metal(), 0.015, DL - 1, POL - 0.08, 1.0, -DL / 2, Math.PI / 2);
    if (!sypialny) for (let z = -2; z > -DL + 1; z -= 4.4) { zb.box(this.mat.lampa, 0.2, 0.03, 1.0, 0.95, SUFIT - 0.12, z); this.lampy.push({ x: 0.95, y: SUFIT - 0.3, z, kolor: this.m.swiatlo.kolor, moc: this.m.swiatlo.moc * 0.7 }); }
    for (const s of this.siedzenia) if (los.szansa(this.m.obsadzenie)) this.posadz(s);
    if (sypialny) { // ktoś stoi przy oknie korytarza, tyłem do nas
      for (let k = 0; k < 2; k++) {
        const p = stworzStojacego(los, { manekin: false });
        p.grupa.position.set(1.25, 0, -6 - k * 11 - los.zakres(0, 3)); p.grupa.rotation.y = Math.PI / 2;
        this.wnetrze.add(p.grupa); this.pasazerowie.push(p);
        this.kolizje.push({ x0: 1.05, x1: 1.45, z0: p.grupa.position.z - 0.25, z1: p.grupa.position.z + 0.25 });
      }
    }
    this.kolizje.push({ x0: -3, x1: xs + 0.06, z0: koniec, z1: start });
    zb.box(m.sciana, POL + xs, SCIANA, 0.06, (-POL + xs) / 2, SCIANA / 2, start);
    // Ciemna podłoga przedziałów (tutaj tylko korytarz ma linoleum – reszta i tak za szybą).
  }

  restauracja() {
    const zb = this.zb, los = this.los;
    const bar = 6;
    for (let z = -1.6; z > -DL + bar + 1; z -= 1.95) {
      for (const s of [-1, 1]) {
        const xt = s * 1.0;
        zb.box(M.obrus(), 0.72, 0.04, 0.8, xt, 0.74, z - 0.95);
        zb.box(M.obrus(), 0.74, 0.18, 0.82, xt, 0.66, z - 0.95);
        zb.walec(M.ciemnyMetal(), 0.04, 0.7, xt, 0.35, z - 0.95);
        // lampka z abażurem i nakrycia
        zb.walec(M.metal(), 0.012, 0.2, xt + s * 0.25, 0.86, z - 0.95);
        zb.dodaj(this.mat.lampa, new THREE.ConeGeometry(0.08, 0.1, 12, 1, true), xt + s * 0.25, 0.98, z - 0.95);
        this.lampy.push({ x: xt + s * 0.25, y: 1.05, z: z - 0.95, kolor: 0xffb060, moc: 1.4 });
        for (const dz of [-0.25, 0.25]) {
          zb.walec(M.bialy(), 0.1, 0.012, xt - s * 0.05, 0.77, z - 0.95 + dz);
          zb.walec(M.szybaPrzedzialu(), 0.03, 0.11, xt + s * 0.12, 0.82, z - 0.95 + dz);
        }
        for (const x of [0.72, 1.22]) { this.fotel(s * x, z - 0.3, -1, { szer: 0.42 }); this.fotel(s * x, z - 1.6, 1, { szer: 0.42 }); }
        this.miejsca.miedzy.push({ x: s * 0.6, z: z - 0.95 });
      }
    }
    for (const s of this.siedzenia) if (los.szansa(this.m.obsadzenie)) this.posadz(s);
    for (const s of [-1, 1]) this.kolizje.push({ x0: s < 0 ? -2 : 0.5, x1: s < 0 ? -0.5 : 2, z0: -DL + bar + 0.5, z1: -1.1 });
    // Bar: lada, półki z butelkami, kasa.
    const z0 = -DL + bar;
    zb.box(std({ map: T.drewno('#3a1f12', '#1f0f08'), roughness: 0.4 }), 0.6, 1.05, 4.6, -0.95, 0.525, z0 - 2.6);
    zb.box(M.metal(), 0.7, 0.04, 4.7, -0.95, 1.07, z0 - 2.6);
    for (let z = z0 - 0.6; z > z0 - 5; z -= 0.12) for (const y of [1.25, 1.6]) {
      const k = los.wybierz([0x2a8a3a, 0x8a3a1a, 0xa08020, 0x3a5aa0, 0xe0e0d0]);
      zb.walec(std({ color: k, roughness: 0.15, metalness: 0.1, emissive: k, emissiveIntensity: 0.15 }), 0.03, 0.26, -POL + 0.1, y + 0.13, z);
    }
    zb.box(M.ciemnyMetal(), 0.2, 0.02, 4.6, -POL + 0.1, 1.24, z0 - 2.6).box(M.ciemnyMetal(), 0.2, 0.02, 4.6, -POL + 0.1, 1.59, z0 - 2.6);
    this.kolizje.push({ x0: -2, x1: -0.6, z0: z0 - 5, z1: z0 - 0.2 });
    // Barman (stoi za ladą).
    const b = stworzStojacego(los, { manekin: false }); b.grupa.position.set(-1.25, 0, z0 - 2.4); b.grupa.rotation.y = Math.PI / 2;
    this.wnetrze.add(b.grupa); this.pasazerowie.push(b);
    for (let z = -1.5; z > z0 - 4.5; z -= 1.2) this.miejsca.przejscie.push({ x: 0, z });
  }

  // Bagażowy: skrzynie zygzakiem (ścieżka zmienia stronę), manekiny, kołyszące się żarówki.
  bagazowy() {
    const zb = this.zb, los = this.los;
    const sciezka = [];
    let strona = 1;
    for (let z = -2.2; z > -DL + 2; z -= 3.6) {
      strona = -strona;
      const x0 = strona < 0 ? -POL : 0.0, x1 = strona < 0 ? 0.0 : POL;
      for (let k = 0; k < 4; k++) {
        const w = los.zakres(0.5, 0.9), h = los.zakres(0.5, 1.1), d = los.zakres(0.5, 0.9);
        const xx = los.zakres(x0 + w / 2, x1 - w / 2), zz = z - los.zakres(0, 2.2);
        zb.box(M.skrzynia(), w, h, d, xx, h / 2, zz, 0, los.zakres(-0.2, 0.2), 0);
        if (los.szansa(0.5)) zb.box(this.matBagazu(), w * 0.7, 0.3, d * 0.7, xx, h + 0.15, zz, 0, los.zakres(-0.5, 0.5), 0);
      }
      this.kolizje.push({ x0: Math.max(-2, x0 - 0.1), x1: Math.min(2, x1 + 0.1), z0: z - 2.7, z1: z + 0.45 });
      sciezka.push({ z: z - 1.1, x: -strona * 0.45 });
      // Manekiny w wolnej części.
      for (let k = 0; k < 2; k++) {
        const p = stworzStojacego(los);
        const px = -strona * los.zakres(0.9, 1.25), pz = z - los.zakres(0.2, 2.4);
        p.grupa.position.set(px, 0, pz); p.grupa.rotation.y = los.zakres(0, Math.PI * 2);
        this.wnetrze.add(p.grupa); this.pasazerowie.push(p);
        this.kolizje.push({ x0: px - 0.22, x1: px + 0.22, z0: pz - 0.22, z1: pz + 0.22 });
      }
      // Żarówka na kablu.
      const zar = new THREE.Group(); zar.position.set(0, SUFIT - 0.05, z - 1.2);
      const kabel = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.5), M.guma()); kabel.position.y = -0.25; zar.add(kabel);
      const ba = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 8), this.mat.lampa); ba.position.y = -0.52; zar.add(ba);
      this.wnetrze.add(zar);
      const lampa = { x: 0, y: SUFIT - 0.6, z: z - 1.2, kolor: this.m.swiatlo.kolor, moc: this.m.swiatlo.moc, zarowka: zar, faza: los() * 6 };
      this.lampy.push(lampa); this.osobne.push(lampa);
    }
    this.sciezka = sciezka;
    for (const p of sciezka) { this.miejsca.przejscie.push({ x: p.x, z: p.z }); this.miejsca.sufit.push({ x: p.x, z: p.z }); }
    // Klatka dla ptaków, wózek.
    zb.walec(M.metal(), 0.25, 0.5, 1.1, 0.25, -DL + 1.2);
    this.kolizje.push({ x0: 0.8, x1: 1.5, z0: -DL + 0.9, z1: -DL + 1.5 });
  }

  // Pierwsza klasa: fotele 1+2 z aksamitu, zasłony, lampki na stolikach, przejście przesunięte w lewo.
  pierwsza() {
    const zb = this.zb, los = this.los;
    const n = Math.floor((DL - 2.4) / 2.2);
    const zaslona = std({ color: 0x7a1020, roughness: 0.95, side: THREE.DoubleSide });
    for (let i = 0; i < n; i++) {
      const zb0 = -1.2 - i * 2.2;
      for (const [x, sz] of [[-1.05, 0.62], [0.42, 0.56], [1.05, 0.56]]) {
        this.fotel(x, zb0 - 0.42, -1, { szer: sz, duzy: true });
        this.fotel(x, zb0 - 1.78, 1, { szer: sz, duzy: true });
      }
      for (const [x, w] of [[-1.15, 0.45], [0.75, 1.1]]) {
        zb.box(std({ map: T.drewno('#4a2a18'), roughness: 0.4 }), w, 0.04, 0.5, x, 0.72, zb0 - 1.1);
      }
      zb.walec(M.metal(), 0.015, 0.22, -1.25, 0.85, zb0 - 1.1);
      zb.dodaj(this.mat.lampa, new THREE.ConeGeometry(0.08, 0.1, 12, 1, true), -1.25, 0.98, zb0 - 1.1);
      this.miejsca.miedzy.push({ x: 0.75, z: zb0 - 1.1 }, { x: -1.1, z: zb0 - 1.1 });
    }
    for (const s of [-1, 1]) for (let z = -1.0; z > -DL + 1; z -= MODUL) {
      zb.box(zaslona, 0.04, 1.0, 0.3, s * (POL - 0.06), 1.3, z - 0.15, 0, 0, 0);
    }
    for (const s of this.siedzenia) if (los.szansa(this.m.obsadzenie)) this.posadz(s, { ubior: { gora: los.wybierz(['#1a1a22', '#3a0f18', '#2a2a2a', '#40301a', '#e8e0d0']), dol: '#1a1a1a' } });
    this.kolizje.push({ x0: -2, x1: -0.66, z0: -DL + 1.1, z1: -1.1 }, { x0: 0.13, x1: 2, z0: -DL + 1.1, z1: -1.1 });
  }

  // Łącznik (harmonijka) za przednimi drzwiami.
  lacznik() {
    const zb = new Zbieracz(), z0 = -DL, z1 = -DL - LACZNIK;
    zb.box(M.blacha(), 1.2, 0.05, LACZNIK + 0.2, 0, -0.02, (z0 + z1) / 2);
    for (const s of [-1, 1]) zb.plaszczyzna(M.harmonijka(), LACZNIK, 2.1, s * 0.62, 1.05, (z0 + z1) / 2, 0, -s * Math.PI / 2, Math.PI / 2);
    zb.plaszczyzna(M.harmonijka(), 1.24, LACZNIK, 0, 2.1, (z0 + z1) / 2, Math.PI / 2);
    zb.zbuduj(this.grupa);
    this.kolizje.push({ x0: -3, x1: -0.56, z0: z1 - 0.2, z1: z0 }, { x0: 0.56, x1: 3, z0: z1 - 0.2, z1: z0 });
    // Zaślepka na końcu łącznika – do czasu zbudowania następnego wagonu (w ostatnim: jasne światło lokomotywy).
    const ostatni = this.nr === WAGONY.length - 1;
    this.zaslepka = new THREE.Mesh(new THREE.BoxGeometry(1.3, 2.3, 0.05), ostatni
      ? new THREE.MeshBasicMaterial({ color: new THREE.Color(3, 2.9, 2.6) }) : std({ color: 0x1a1c1e, metalness: 0.5, roughness: 0.6 }));
    this.zaslepka.position.set(0, 1.1, z1 - 0.05);
    this.grupa.add(this.zaslepka);
  }

  /* ---------- w trakcie gry ---------- */
  tablica(gora, dol, kolor) { this.drzwiPrzod.tab.rysuj(gora, dol, kolor); }
  odblokuj() { this.drzwiPrzod.lampka.material = M.zielonySygnal(); this.drzwiPrzod.zamknieta = false; }

  // Kolizje drzwi (zamkniętych lub w trakcie ruchu).
  kolizjeDrzwi(lista) {
    for (const [d, z] of [[this.drzwiTyl, this.z0], [this.drzwiPrzod, this.z0 - DL]]) {
      if (d.otwarcie < 0.75) lista.push({ x0: -0.5, x1: 0.5, z0: z - 0.1, z1: z + 0.1 });
    }
  }

  aktualizuj(dt, czas, kamera) {
    for (const d of [this.drzwiTyl, this.drzwiPrzod]) {
      d.otwarcie += Math.sign(d.cel - d.otwarcie) * Math.min(Math.abs(d.cel - d.otwarcie), dt * 1.8);
      d.skrzydlo.position.x = d.otwarcie * 0.88;
    }
    // Mruganie światła: losowe przygasanie, czasem dłuższa awaria.
    const sw = this.m.swiatlo;
    this.czasMrugania -= dt;
    if (this.czasMrugania <= 0) {
      this.czasMrugania = 0.05 + Math.random() * 0.4;
      this.mruganie = Math.random() < sw.mruganie ? Math.random() * 0.9 : 0;
    }
    if (this.awaria > 0) this.awaria -= dt;
    this.jasnosc = this.awaria > 0 ? (Math.random() < 0.08 ? 0.6 : 0.03) : 1 - this.mruganie;
    this.mat.lampa.emissiveIntensity = 1.6 * this.jasnosc;
    for (const l of this.lampy) l.moc = l.baza * this.jasnosc;
    for (const l of this.osobne) if (l.zarowka) {
      l.faza += dt;
      l.zarowka.rotation.z = Math.sin(l.faza * 1.3) * 0.18; l.zarowka.rotation.x = Math.sin(l.faza * 0.9) * 0.12;
      l.x = Math.sin(l.zarowka.rotation.z) * 0.5;
    }
    const kz = kamera.position.z;
    for (const p of this.pasazerowie) {
      if (Math.abs(p.grupa.position.z + this.z0 - kz) < 14) animujPasazera(p, dt, czas, kamera);
    }
  }

  usun() { zwolnij(this.grupa); }
}
