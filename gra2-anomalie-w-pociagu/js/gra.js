// Meśnik: Anomalie – pętla gry: silnik, gracz z laserem, wagony po kolei, anomalie, HUD, menu i sterowanie.
import * as THREE from '../lib/three.js';
import { $, generator, pamiec, ogranicz } from './narzedzia.js';
import { wczytajWszystko, plotno, teksturaZ } from './tekstury.js';
import { Dzwiek, powiedz } from './dzwiek.js';
import { Wagon, WAGONY, DL, LACZNIK, POL, SUFIT } from './wagony.js';
import { Swiat } from './swiat.js';
import { Duch, Pasazer, Konduktor, Iskry, OBRAZY_DUCHOW } from './anomalie.js';

const ODSTEP = DL + LACZNIK;
const OCZY = 1.62, PROMIEN = 0.22;
const TRUDNOSC = { latwy: { czas: 1.6, boss: 5 }, normalny: { czas: 1, boss: 6 }, koszmar: { czas: 0.7, boss: 8 } };
const dotykowe = matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
const param = new URLSearchParams(location.search);
const TEST = param.has('test');

const ust = Object.assign({ trudnosc: 'normalny', czulosc: 1, glosnosc: 0.8, lagodny: false, jakosc: !dotykowe },
  pamiec.czytaj('ustawienia', {}));

/* ---------- silnik ---------- */
const canvas = $('#scena');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.9;
const scena = new THREE.Scene();
const kamera = new THREE.PerspectiveCamera(72, 1, 0.05, 300);
kamera.rotation.order = 'YXZ';
scena.add(kamera);
const scenaBroni = new THREE.Scene();

// Efekt „taśmy VHS”: aberracja, ziarno, śnieżenie, przesunięcia pasów, winieta, czerwień, zaciemnienie.
const HORROR = {
  uniforms: {
    tDiffuse: { value: null }, czas: { value: 0 }, ziarno: { value: 0.06 }, aberracja: { value: 0.002 }, szum: { value: 0 },
    glitch: { value: 0 }, czerwien: { value: 0 }, zaciemnienie: { value: 0 }, winieta: { value: 1.1 },
  },
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
  fragmentShader: `
uniform sampler2D tDiffuse; uniform float czas, ziarno, aberracja, szum, glitch, czerwien, zaciemnienie, winieta;
varying vec2 vUv;
float h(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
void main() {
  vec2 uv = vUv;
  float t = floor(czas * 30.0);
  if (glitch > 0.0) {
    float pas = floor(uv.y * 22.0 + t * 7.0);
    if (h(vec2(pas, t)) < glitch * 0.55) uv.x += (h(vec2(pas, 3.1)) - 0.5) * 0.18 * glitch;
  }
  vec2 d = uv - 0.5;
  float ab = aberracja + glitch * 0.02;
  vec3 c = vec3(texture2D(tDiffuse, uv + d * ab * 4.0).r, texture2D(tDiffuse, uv).g, texture2D(tDiffuse, uv - d * ab * 4.0).b);
  float n = h(uv * vec2(731.0, 517.0) + t);
  c = mix(c, vec3(n), szum * 0.55);
  c *= 1.0 - szum * 0.3 * step(0.5, fract(uv.y * 220.0 + czas * 12.0));
  c += (h(uv * 997.0 + fract(czas) * 61.0) - 0.5) * ziarno;
  float l = dot(c, vec3(0.3, 0.59, 0.11));
  c = mix(c, vec3(l * 1.3, l * 0.15, l * 0.12), czerwien);
  c *= 1.0 - smoothstep(0.35, 0.95, length(d) * winieta);
  c *= 1.0 - zaciemnienie;
  gl_FragColor = vec4(c, 1.0);
}`,
};
let composer, bloom, horror;
function zbudujPotok() {
  const w = innerWidth, h = innerHeight;
  const pr = ust.jakosc ? Math.min(devicePixelRatio, 1.5) : Math.min(devicePixelRatio, 1) * (dotykowe ? 0.8 : 0.9);
  renderer.setPixelRatio(pr);
  renderer.setSize(w, h, false);
  composer?.dispose?.();
  const rt = new THREE.WebGLRenderTarget(w * pr, h * pr, { type: THREE.HalfFloatType, samples: ust.jakosc ? 4 : 0 });
  composer = new THREE.EffectComposer(renderer, rt);
  composer.setPixelRatio(pr); composer.setSize(w, h);
  composer.addPass(new THREE.RenderPass(scena, kamera));
  const rb = new THREE.RenderPass(scenaBroni, kamera); rb.clear = false; rb.clearDepth = true;
  composer.addPass(rb);
  bloom = new THREE.UnrealBloomPass(new THREE.Vector2(w, h), ust.jakosc ? 0.45 : 0.35, 0.4, 0.92);
  composer.addPass(bloom);
  composer.addPass(new THREE.OutputPass());
  horror = new THREE.ShaderPass(HORROR);
  composer.addPass(horror);
  kamera.aspect = w / h; kamera.updateProjectionMatrix();
}
zbudujPotok();
addEventListener('resize', () => {
  const w = innerWidth, h = innerHeight;
  renderer.setSize(w, h, false); composer.setSize(w, h); bloom.resolution.set(w, h);
  kamera.aspect = w / h; kamera.updateProjectionMatrix();
});

const swiat = new Swiat(scena);
swiat.podepnijKamere(kamera);
const iskry = new Iskry(scena);
const dzwiek = new Dzwiek();
dzwiek.ustawGlosnosc(ust.glosnosc); dzwiek.lagodny = ust.lagodny;

/* ---------- broń: detektor-laser ---------- */
const uchwyt = new THREE.Group(); scenaBroni.add(uchwyt);
scenaBroni.add(new THREE.HemisphereLight(0xcfe8ff, 0x202020, 1.6));
const swiatloBroni = new THREE.PointLight(0x5ff2ff, 0, 1.5, 2); uchwyt.add(swiatloBroni); swiatloBroni.position.set(0.2, -0.1, -0.6);
const bron = new THREE.Group(); bron.position.set(0.3, -0.26, -0.52); bron.scale.setScalar(0.85); uchwyt.add(bron);
const [ekranC, ekranG] = plotno(128, 80);
const ekranTex = teksturaZ(ekranC, { powtarzaj: false });
const mCewki = new THREE.MeshStandardMaterial({ color: 0x000000, emissive: 0x5ff2ff, emissiveIntensity: 2.5 });
{
  const mKorpus = new THREE.MeshStandardMaterial({ color: 0x2c3034, metalness: 0.7, roughness: 0.35 });
  const mJasny = new THREE.MeshStandardMaterial({ color: 0x8a9096, metalness: 0.8, roughness: 0.3 });
  const mGuma = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9 });
  const dodaj = (geo, mat, x, y, z, rx = 0, ry = 0, rz = 0) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.rotation.set(rx, ry, rz); bron.add(m); return m; };
  dodaj(new THREE.BoxGeometry(0.075, 0.085, 0.3), mKorpus, 0, 0, 0);
  dodaj(new THREE.BoxGeometry(0.05, 0.13, 0.065), mGuma, 0, -0.095, 0.08, 0.32);
  dodaj(new THREE.CylinderGeometry(0.02, 0.024, 0.2, 14), mJasny, 0, 0.012, -0.24, Math.PI / 2);
  for (let i = 0; i < 3; i++) dodaj(new THREE.TorusGeometry(0.03, 0.007, 8, 18), mCewki, 0, 0.012, -0.18 - i * 0.04);
  dodaj(new THREE.CylinderGeometry(0.004, 0.004, 0.12), mJasny, 0.03, 0.09, 0.1, 0.3);
  dodaj(new THREE.SphereGeometry(0.008, 8, 6), mCewki, 0.03, 0.15, 0.12);
  const ek = dodaj(new THREE.PlaneGeometry(0.066, 0.042), new THREE.MeshBasicMaterial({ map: ekranTex, toneMapped: false }), 0, 0.046, 0.07, -1.05);
  ek.renderOrder = 2;
}
const LUFA = new THREE.Vector3(0, 0.012, -0.35);

/* ---------- stan gry ---------- */
let stan = 'menu';
let wagon = null, nastepny = null, poprzedni = null, doUsuniecia = 0;
let wagonNr = 0, ziarno = 1;
let plan = [], anomalie = [], doZniszczenia = 0, zniszczone = 0, czasWagonu = 0, wyczyszczony = false;
let czas = 0, czasDopadniecia = 0, sprawca = null, potrzasanie = 0, doSpojrzenia = 30, spojrzenie = 0;
const gracz = { yaw: 0, pitch: 0, cieplo: 0, przegrzany: 0, doStrzalu: 0, latarka: false, odrzut: 0, krok: 0, bieg: 0, ruch: 0 };
const staty = { start: 0, czas: 0, strzaly: 0, trafienia: 0, pomylki: 0, smierci: 0, anomalie: 0 };
const najdalej = () => pamiec.czytaj('najdalej', 0);

const gra = {
  get scena() { return scena; }, get kamera() { return kamera; }, get wagon() { return wagon; }, get wagonNr() { return wagonNr; },
  get czas() { return czas; }, dzwiek, iskry,
  dopadla, anomaliaZniszczona, wybierzMiejsce, usunPasazera, przywolaj, bossPasek,
};

/* ---------- wagony ---------- */
function zbudujWagon(nr) {
  ziarno = (Math.random() * 1e9) | 0;
  return new Wagon(nr, -nr * ODSTEP, ziarno);
}

function zacznijWagon(nr, { odNowa = false } = {}) {
  [wagon, nastepny, poprzedni].forEach(w => w?.usun());
  anomalie.forEach(a => a.usun()); anomalie = [];
  dzwiek.ciszaSzeptow();
  wagonNr = nr;
  wagon = zbudujWagon(nr); scena.add(wagon.grupa);
  nastepny = poprzedni = null;
  kamera.position.set(0, OCZY, wagon.z0 - 1.0);
  gracz.yaw = 0; gracz.pitch = 0; gracz.cieplo = 0; gracz.przegrzany = 0;
  swiat.ustawPore(wagon.m.pora, wagon);
  zaplanuj();
  pokazTytul(odNowa);
  if (!odNowa) ogloszenie(wagon.m.komunikat, nr === 8 ? 1.2 : 1);
  bossPasek(null);
  if (wagon.m.latarka && !gracz.latarka && !odNowa) podpowiedz(dotykowe ? 'Ciemno? Włącz latarkę przyciskiem 🔦.' : 'Ciemno? Włącz latarkę klawiszem F.', 5);
}

function zaplanuj() {
  const m = wagon.m, los = generator(ziarno + 7);
  const typy = los.tasuj([...m.anomalie.typy]);
  plan = typy.map((typ, i) => ({
    typ,
    prog: 0.1 + (i + los.zakres(0.15, 0.75)) / typy.length * 0.74,
    czas: 9 + i * los.zakres(6, 9) * (1 - wagonNr * 0.04),
    gotowa: false,
  }));
  if (wagonNr === 0) { plan[0].prog = 0.28; plan[0].czas = 14; }
  doZniszczenia = plan.length; zniszczone = 0; czasWagonu = 0; wyczyszczony = false;
  wagon.tablica(`WAGON ${wagonNr + 1}`, `ANOMALIE: ${doZniszczenia}`);
  odswiezZnaki(true);
}

function limitCzasu(mnoznik = 1) { return wagon.m.anomalie.czas * TRUDNOSC[ust.trudnosc].czas * mnoznik; }

// Wybór miejsca dla anomalii względem gracza (przed nim, za plecami, w oknie…), w układzie świata.
function wybierzMiejsce(rodzaj, min = 3, max = 12) {
  const pz = kamera.position.z, w = wagon, los = Math.random;
  const przed = p => pz - p.z >= min && pz - p.z <= max;
  const za = p => p.z - pz >= min && p.z - pz <= max && p.z < w.z0 - 0.8;
  let lista = [];
  if (rodzaj === 'przed') lista = w.miejsca.przejscie.filter(przed);
  else if (rodzaj === 'zaPlecami') lista = w.miejsca.przejscie.filter(za);
  else if (rodzaj === 'miedzy') lista = w.miejsca.miedzy.filter(przed);
  else if (rodzaj === 'przedzial') lista = w.miejsca.przedzialy.filter(przed);
  else if (rodzaj === 'okno') lista = w.miejsca.okna.filter(przed).map(p => ({ x: p.x * (POL + 0.32), y: 0.42, z: p.z, okno: p.x }));
  else if (rodzaj === 'dowolne') lista = w.miejsca.przejscie.filter(p => Math.abs(p.z - pz) > 3);
  const zajete = anomalie.filter(a => a.grupa && a.grozna).map(a => a.grupa.position.z);
  lista = lista.filter(p => zajete.every(z => Math.abs(z - p.z) > 1.2));
  if (!lista.length) return null;
  const p = lista[Math.floor(los() * lista.length)];
  return { ...p };
}

function wybierzPasazera(filtr, min = 2, max = 13) {
  const pz = kamera.position.z, uzyci = new Set(anomalie.map(a => a.p?.grupa));
  const lista = wagon.pasazerowie.filter(p => {
    const z = p.grupa.position.z + wagon.z0;
    return !uzyci.has(p.grupa) && !p.cien && pz - z >= min && pz - z <= max && filtr(p);
  });
  return lista.length ? lista[Math.floor(Math.random() * lista.length)] : null;
}

function stworzAnomalie(typ) {
  const m = wagon.m;
  const duch = (obraz, miejsce, opcje = {}, mn = 1) => miejsce && new Duch(gra, obraz, limitCzasu(mn), { miejsce, ...opcje });
  let a = null;
  switch (typ) {
    case 'zjawa': a = duch('zjawa', wybierzMiejsce('przed', 5, 12), { ruch: 'podchodzi' }); break;
    case 'dama': a = duch('dama', wybierzMiejsce(m.uklad === 'przedzialy' || m.uklad === 'sypialny' ? 'przedzial' : 'miedzy', 4, 11) || wybierzMiejsce('przed', 5, 11), { ruch: 'aniol' }); break;
    case 'pelzacz': a = duch('pelzacz', wybierzMiejsce('przed', 7, 13), { ruch: 'pelza' }); break;
    case 'sufit': a = duch('pelzacz', wybierzMiejsce('przed', 4, 10), { ruch: 'pelza', naSuficie: true }); break;
    case 'rozmyty': a = duch('rozmyty', wybierzMiejsce('miedzy', 3, 11) || wybierzMiejsce('przed', 4, 11), { ruch: 'kolysze' }); break;
    case 'dziecko': a = duch('dziecko', wybierzMiejsce('zaPlecami', 2.5, 6) || wybierzMiejsce('przed', 5, 10), {}, 1.15); break;
    case 'zaplecami': {
      const o = ['zjawa', 'dama', 'dziecko'][Math.floor(Math.random() * 3)];
      a = duch(o, wybierzMiejsce('zaPlecami', 2.5, 7) || wybierzMiejsce('przed', 5, 12), { ruch: o === 'dziecko' ? 'stoi' : 'podchodzi' }, 1.1);
      break;
    }
    case 'twarz': { const mj = wybierzMiejsce('okno', 2.5, 10); a = mj && duch('twarz', mj, { okno: mj.okno }, 1.1); break; }
    case 'migacz': a = duch('zjawa', wybierzMiejsce('przed', 3, 10), { ruch: 'migacz' }, 1.2); break;
    case 'pasazer': {
      const p = wybierzPasazera(p => !p.manekin);
      if (p) a = new Pasazer(gra, limitCzasu(1.35), p, { wariant: ['obrot', 'szyja', 'pustka', 'oczy'][Math.floor(Math.random() * 4)] });
      break;
    }
    case 'blizniak': {
      const p = wybierzPasazera(p => !p.manekin && p.siedzenie);
      const pz = kamera.position.z;
      const wolne = wagon.siedzenia.filter(s => !s.zajete && pz - s.z > 2 && pz - s.z < 13);
      if (p && wolne.length) a = new Pasazer(gra, limitCzasu(1.45), p, { wariant: 'blizniak', klon: true, siedzenie: wolne[Math.floor(Math.random() * wolne.length)] });
      break;
    }
    case 'manekin': {
      const p = wybierzPasazera(p => p.manekin, 2, 12);
      if (p) a = new Pasazer(gra, limitCzasu(1.2), p, { wariant: 'manekin' });
      break;
    }
    case 'konduktor': {
      const mj = wybierzMiejsce('przed', 8, 14) || wybierzMiejsce('dowolne');
      a = new Konduktor(gra, limitCzasu(1.1), mj, TRUDNOSC[ust.trudnosc].boss);
      bossPasek(1);
      break;
    }
  }
  // Zapas: gdy nie ma pasażera albo miejsca – zwykła zjawa gdziekolwiek.
  if (!a) a = duch('zjawa', wybierzMiejsce('przed', 3, 12) || wybierzMiejsce('dowolne') || { x: 0, z: kamera.position.z - 6 }, { ruch: 'podchodzi' });
  return a;
}

function przywolaj(ile) {
  for (let i = 0; i < ile; i++) {
    const typ = ['zjawa', 'pelzacz', 'dama'][Math.floor(Math.random() * 3)];
    const a = stworzAnomalie(typ);
    anomalie.push(a); a.pojaw(); doZniszczenia++;
  }
  odswiezZnaki(true);
}

function anomaliaZniszczona(a) {
  zniszczone++; staty.anomalie++;
  odswiezZnaki(true);
  const zostalo = doZniszczenia - zniszczone + plan.filter(p => !p.gotowa).length * 0;
  wagon.tablica(`WAGON ${wagonNr + 1}`, `ANOMALIE: ${Math.max(0, doZniszczenia - zniszczone)}`);
  if (a instanceof Konduktor) bossPasek(null);
  if (wagonNr === 0 && zniszczone === 1) podpowiedz('Brawo! Tak się to robi. Idź dalej i miej oczy dookoła głowy.', 4);
  if (zostalo <= 0 && plan.every(p => p.gotowa)) wagonCzysty();
}

function wagonCzysty() {
  if (wyczyszczony) return;
  wyczyszczony = true;
  wagon.odblokuj();
  wagon.tablica(`WAGON ${wagonNr + 1}`, 'PRZEJŚCIE OTWARTE', '#5dff8a');
  dzwiek.sukces();
  komunikat(wagonNr === 9 ? 'Konduktor pokonany. Lokomotywa przed tobą.' : 'Wagon czysty. Drzwi odblokowane.', 'dobry', 2.6);
  if (wagonNr === 0) podpowiedz('Drzwi na końcu wagonu są otwarte. Przejdź dalej.', 5);
  if (wagonNr < 9) { nastepny = zbudujWagon(wagonNr + 1); scena.add(nastepny.grupa); wagon.zaslepka.visible = false; }
}

function usunPasazera(p) {
  const i = wagon.pasazerowie.indexOf(p);
  if (i >= 0) wagon.pasazerowie.splice(i, 1);
}

function dopadla(a) {
  if (stan !== 'gra') return;
  stan = 'dopadla'; czasDopadniecia = 0; sprawca = a;
  staty.smierci++;
  dzwiek.ciszaSzeptow();
  dzwiek.krzyk();
  potrzasanie = 1;
  const s = $('#straszak'), img = s.querySelector('img');
  if (!ust.lagodny) {
    img.src = a.ikona.endsWith('.jpg') ? 'img/jumpscare.jpg' : a.ikona;
    s.className = 'pokaz ' + (a.ikona.endsWith('.jpg') ? 'twarz' : 'duch');
  }
  // Duch rzuca się na gracza.
  if (a.grupa) { a.grupa.position.set(kamera.position.x, 0, kamera.position.z); }
}

/* ---------- strzał ---------- */
const promien = new THREE.Raycaster();
const promienie = [];
const geoPromienia = new THREE.CylinderGeometry(1, 1, 1, 8, 1, true).translate(0, 0.5, 0).rotateX(Math.PI / 2);
const mRdzen = new THREE.MeshBasicMaterial({ color: new THREE.Color(1.5, 6, 7), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false });
const mPoswiata = new THREE.MeshBasicMaterial({ color: new THREE.Color(0.1, 1.2, 1.6), transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false });
const _a = new THREE.Vector3(), _b = new THREE.Vector3(), _c = new THREE.Vector2(0, 0);

function strzal() {
  if (stan !== 'gra') return;
  if (gracz.przegrzany > 0) { dzwiek.pudlo(); return; }
  if (gracz.doStrzalu > 0) return;
  gracz.doStrzalu = 0.17;
  gracz.cieplo += 13;
  if (gracz.cieplo >= 100) { gracz.cieplo = 100; gracz.przegrzany = 1.5; dzwiek.przegrzanie(); komunikat('Laser przegrzany!', 'zly', 1.2); }
  dzwiek.laser();
  gracz.odrzut = 1; swiat.blysk.intensity = 5; swiatloBroni.intensity = 3;
  staty.strzaly++;
  promien.setFromCamera(_c, kamera); promien.far = 40;
  const mapa = new Map();
  for (const a of anomalie) if (a.grozna) for (const h of a.hitboxy) if (h.visible !== false) mapa.set(h, a);
  const pasazerowie = new Map();
  for (const p of wagon.pasazerowie) if (!p.cien && !mapa.has(p.hitbox)) pasazerowie.set(p.hitbox, p);
  const cele = promien.intersectObjects([...mapa.keys(), ...pasazerowie.keys()], false);
  const sw = promien.intersectObjects([wagon.grupa, nastepny?.grupa].filter(Boolean), true)
    .filter(h => h.object.material && h.object.material.visible !== false && !h.object.material.transparent && !pasazerowie.has(h.object) && !mapa.has(h.object));
  const dSw = sw[0]?.distance ?? 40;
  const cel = cele[0];
  let koniec;
  if (cel && cel.distance <= dSw + 0.3) {
    koniec = cel.point;
    const a = mapa.get(cel.object);
    if (a) { staty.trafienia++; a.trafiona(cel.point); iskry.wybuch(cel.point, 0x5ff2ff, 40, 3); }
    else niewinny(pasazerowie.get(cel.object), cel.point);
  } else {
    koniec = sw[0]?.point ?? promien.ray.at(40, new THREE.Vector3());
    iskry.wybuch(koniec, 0xffa040, 10, 1.2);
  }
  // Promień od lufy do celu (lufa liczona z pozycji broni w scenie broni = układ kamery).
  bron.updateMatrixWorld(true);
  _a.copy(LUFA); bron.localToWorld(_a);
  for (const [mat, r] of [[mRdzen, 0.007], [mPoswiata, 0.03]]) {
    const m = new THREE.Mesh(geoPromienia, mat.clone());
    m.position.copy(_a); m.lookAt(koniec); m.scale.set(r, r, _a.distanceTo(koniec));
    m.userData.zycie = 0.12; m.userData.alfa = mat.opacity;
    scena.add(m); promienie.push(m);
  }
}

function niewinny(p, punkt) {
  staty.pomylki++;
  dzwiek.ej();
  gracz.cieplo = 100; gracz.przegrzany = 2.2; dzwiek.przegrzanie();
  komunikat('To był zwykły pasażer! Laser przegrzany.', 'zly', 2);
  iskry.wybuch(punkt, 0xffa040, 20, 1.5);
  p.glowa.rotation.x = -0.4; p.doZmiany = 0.6;
}

/* ---------- sterowanie ---------- */
const klawisze = new Set();
addEventListener('keydown', e => {
  klawisze.add(e.code);
  if (e.code === 'KeyF' && stan === 'gra') przelaczLatarke();
  if ((e.code === 'Escape' || e.code === 'KeyP') && stan === 'gra' && dotykowe) pauza();
});
addEventListener('keyup', e => klawisze.delete(e.code));
addEventListener('blur', () => { klawisze.clear(); if (stan === 'gra' && !TEST) pauza(); });
canvas.addEventListener('mousedown', e => {
  if (stan !== 'gra') return;
  if (!dotykowe && document.pointerLockElement !== canvas) { zablokujMysz(); return; }
  if (e.button === 0) strzal();
});
addEventListener('mousemove', e => {
  if (stan !== 'gra' || document.pointerLockElement !== canvas) return;
  obroc(e.movementX, e.movementY, 0.0022);
});
document.addEventListener('pointerlockchange', () => {
  if (document.pointerLockElement !== canvas && stan === 'gra' && !TEST) pauza();
});
function zablokujMysz() { if (dotykowe || TEST) return; try { const r = canvas.requestPointerLock({ unadjustedMovement: true }); r?.catch?.(() => canvas.requestPointerLock()); } catch { canvas.requestPointerLock(); } }
function obroc(dx, dy, k) {
  gracz.yaw -= dx * k * ust.czulosc;
  gracz.pitch = ogranicz(gracz.pitch - dy * k * ust.czulosc, -1.35, 1.35);
}
function przelaczLatarke() { gracz.latarka = !gracz.latarka; dzwiek.zamek(); }

// Dotyk: joystick z lewej, rozglądanie przeciąganiem po prawej, przyciski.
const joy = { id: null, x: 0, y: 0, cx: 0, cy: 0 }, patrz = { id: null, x: 0, y: 0 };
if (dotykowe) {
  document.body.classList.add('dotyk');
  const jEl = $('#joystick'), galka = jEl.querySelector('i');
  jEl.addEventListener('touchstart', e => {
    const t = e.changedTouches[0], r = jEl.getBoundingClientRect();
    joy.id = t.identifier; joy.cx = r.left + r.width / 2; joy.cy = r.top + r.height / 2; e.preventDefault();
  }, { passive: false });
  addEventListener('touchmove', e => {
    for (const t of e.changedTouches) {
      if (t.identifier === joy.id) {
        const dx = t.clientX - joy.cx, dy = t.clientY - joy.cy, d = Math.hypot(dx, dy), m = 55;
        const k = d > m ? m / d : 1;
        joy.x = dx * k / m; joy.y = dy * k / m;
        galka.style.transform = `translate(${dx * k}px, ${dy * k}px)`;
      } else if (t.identifier === patrz.id) {
        obroc(t.clientX - patrz.x, t.clientY - patrz.y, 0.005);
        patrz.x = t.clientX; patrz.y = t.clientY;
      }
    }
  }, { passive: false });
  const koniecDotyku = e => {
    for (const t of e.changedTouches) {
      if (t.identifier === joy.id) { joy.id = null; joy.x = joy.y = 0; galka.style.transform = ''; }
      if (t.identifier === patrz.id) patrz.id = null;
    }
  };
  addEventListener('touchend', koniecDotyku); addEventListener('touchcancel', koniecDotyku);
  canvas.addEventListener('touchstart', e => {
    for (const t of e.changedTouches) if (t.clientX > innerWidth * 0.35 && patrz.id === null) { patrz.id = t.identifier; patrz.x = t.clientX; patrz.y = t.clientY; }
    e.preventDefault();
  }, { passive: false });
  $('#d-strzal').addEventListener('touchstart', e => { e.preventDefault(); strzal(); }, { passive: false });
  $('#d-latarka').addEventListener('touchstart', e => { e.preventDefault(); if (stan === 'gra') przelaczLatarke(); }, { passive: false });
  $('#przycisk-pauzy').addEventListener('click', () => { if (stan === 'gra') pauza(); });
}

/* ---------- ruch gracza i kolizje ---------- */
function kolizje() {
  const lista = [];
  for (const w of [wagon, nastepny, poprzedni]) if (w) { lista.push(...w.kolizje); w.kolizjeDrzwi(lista); }
  return lista;
}
function rozepchnij(p, lista) {
  for (const k of lista) {
    const cx = ogranicz(p.x, k.x0, k.x1), cz = ogranicz(p.z, k.z0, k.z1);
    const dx = p.x - cx, dz = p.z - cz, d2 = dx * dx + dz * dz;
    if (d2 < PROMIEN * PROMIEN) {
      if (d2 > 1e-8) { const d = Math.sqrt(d2), o = (PROMIEN - d) / d; p.x += dx * o; p.z += dz * o; }
      else { // środek w bryle – wypchnij najkrótszą drogą
        const l = p.x - k.x0, r = k.x1 - p.x, f = p.z - k.z0, b = k.z1 - p.z, m = Math.min(l, r, f, b);
        if (m === l) p.x = k.x0 - PROMIEN; else if (m === r) p.x = k.x1 + PROMIEN; else if (m === f) p.z = k.z0 - PROMIEN; else p.z = k.z1 + PROMIEN;
      }
    }
  }
}
function ruchGracza(dt) {
  let fx = 0, fz = 0;
  if (klawisze.has('KeyW') || klawisze.has('ArrowUp')) fz -= 1;
  if (klawisze.has('KeyS') || klawisze.has('ArrowDown')) fz += 1;
  if (klawisze.has('KeyA') || klawisze.has('ArrowLeft')) fx -= 1;
  if (klawisze.has('KeyD') || klawisze.has('ArrowRight')) fx += 1;
  if (joy.id !== null) { fx += joy.x; fz += joy.y; }
  const d = Math.hypot(fx, fz);
  if (d > 1) { fx /= d; fz /= d; }
  const bieg = klawisze.has('ShiftLeft') || klawisze.has('ShiftRight') || (joy.id !== null && Math.hypot(joy.x, joy.y) > 0.95);
  const v = (bieg ? 4.6 : 2.9) * Math.min(1, d);
  const s = Math.sin(gracz.yaw), c = Math.cos(gracz.yaw);
  const p = { x: kamera.position.x, z: kamera.position.z };
  p.x += (fx * c + fz * s) * v * dt;
  p.z += (-fx * s + fz * c) * v * dt;
  rozepchnij(p, kolizje());
  const przesuniecie = Math.hypot(p.x - kamera.position.x, p.z - kamera.position.z);
  kamera.position.x = p.x; kamera.position.z = p.z;
  gracz.ruch += (Math.min(1, przesuniecie / dt / 3) - gracz.ruch) * Math.min(1, dt * 8);
  gracz.krok += przesuniecie;
  if (gracz.krok > (bieg ? 0.75 : 0.62)) { gracz.krok = 0; dzwiek.krok(); }
}

/* ---------- HUD ---------- */
let ostatnieZnaki = '';
function odswiezZnaki(pelne) {
  const el = $('#hud-anomalie');
  const ile = Math.max(doZniszczenia, plan.length);
  const aktywne = anomalie.filter(a => a.grozna);
  const klucz = `${ile}|${zniszczone}|${aktywne.length}`;
  if (pelne || klucz !== ostatnieZnaki) {
    ostatnieZnaki = klucz;
    let h = '';
    for (let i = 0; i < ile; i++) h += `<span class="znak ${i < zniszczone ? 'zniszczona' : i < zniszczone + aktywne.length ? 'aktywna' : 'czeka'}"></span>`;
    el.innerHTML = h;
  }
  const akt = el.querySelectorAll('.aktywna');
  aktywne.forEach((a, i) => akt[i]?.style.setProperty('--p', (100 - a.zagrozenie() * 100).toFixed(1)));
}
const wskazniki = [];
function odswiezWskazniki() {
  const el = $('#wskazniki');
  const akt = anomalie.filter(a => a.grozna);
  while (wskazniki.length < akt.length) { const i = document.createElement('i'); el.appendChild(i); wskazniki.push(i); }
  wskazniki.forEach((w, i) => {
    const a = akt[i];
    if (!a) { w.style.display = 'none'; return; }
    a.pozycja(_b); _b.y = Math.max(0.6, _b.y) + 0.6;
    _b.project(kamera);
    const zaPlecami = _b.z > 1;
    let x = _b.x, y = _b.y;
    if (zaPlecami) { x = -x; y = -y; if (Math.abs(x) < 0.01 && Math.abs(y) < 0.01) y = -1; }
    const naEkranie = !zaPlecami && Math.abs(x) < 0.92 && Math.abs(y) < 0.92;
    const widac = wagonNr < 6 || a.zagrozenie() > 0.45;
    if (naEkranie || !widac) { w.style.display = 'none'; return; }
    const kat = Math.atan2(y, x);
    const rx = innerWidth / 2 - 34, ry = innerHeight / 2 - 34;
    const px = innerWidth / 2 + Math.cos(kat) * rx, py = innerHeight / 2 - Math.sin(kat) * ry;
    w.style.display = 'block';
    w.style.left = px + 'px'; w.style.top = py + 'px';
    w.style.transform = `rotate(${Math.PI / 2 - kat}rad)`;
    w.style.opacity = (0.45 + a.zagrozenie() * 0.55).toFixed(2);
  });
}
function rysujEkranBroni(liczba) {
  const g = ekranG;
  g.fillStyle = '#021014'; g.fillRect(0, 0, 128, 80);
  const kolor = liczba ? '#ff3b2f' : '#5ff2ff';
  g.fillStyle = kolor; g.font = 'bold 14px monospace'; g.fillText(liczba ? 'ANOMALIA' : 'SKAN...', 8, 18);
  g.font = 'bold 34px monospace'; g.fillText(String(liczba), 8, 58);
  g.strokeStyle = kolor; g.lineWidth = 2; g.beginPath();
  for (let x = 44; x < 124; x += 2) { const y = 44 + Math.sin(x * 0.3 + czas * 12) * (liczba ? 10 + Math.random() * 10 : 3) ; x === 44 ? g.moveTo(x, y) : g.lineTo(x, y); }
  g.stroke();
  g.fillStyle = gracz.przegrzany > 0 ? '#ff3b2f' : '#ffb02f';
  g.fillRect(8, 68, 112 * gracz.cieplo / 100, 6);
  ekranTex.needsUpdate = true;
}

let tKomunikatu = null, tPodpowiedzi = null, tNapisow = null;
function komunikat(tekst, klasa = '', sek = 2) {
  const el = $('#komunikat'); el.textContent = tekst; el.className = 'widoczne ' + klasa;
  clearTimeout(tKomunikatu); tKomunikatu = setTimeout(() => el.classList.remove('widoczne'), sek * 1000);
}
function podpowiedz(tekst, sek = 4) {
  const el = $('#podpowiedz'); el.textContent = tekst; el.classList.add('widoczne');
  clearTimeout(tPodpowiedzi); tPodpowiedzi = setTimeout(() => el.classList.remove('widoczne'), sek * 1000);
}
function ogloszenie(tekst, opozn = 1) {
  setTimeout(() => {
    if (stan !== 'gra') return;
    dzwiek.gong();
    setTimeout(() => {
      powiedz(tekst);
      const el = $('#napisy'); el.textContent = tekst; el.classList.add('widoczne');
      clearTimeout(tNapisow); tNapisow = setTimeout(() => el.classList.remove('widoczne'), 3500 + tekst.length * 55);
    }, 1300);
  }, opozn * 1000);
}
function pokazTytul(odNowa) {
  const el = $('#tytul-wagonu'), m = wagon.m;
  el.querySelector('small').textContent = odNowa ? 'JESZCZE RAZ' : `${wagonNr + 1} / 10`;
  el.querySelector('b').textContent = `WAGON ${wagonNr + 1}`;
  el.querySelector('span').textContent = odNowa ? 'Anomalia cię dopadła. Wagon od początku.' : `${m.nazwa} — ${m.opis}`;
  el.classList.remove('pokaz', 'glitchuje'); void el.offsetWidth; el.classList.add('pokaz');
  if (wagonNr === 8 && !odNowa) { // „pętla”: najpierw znowu ósemka
    el.querySelector('b').textContent = 'WAGON 8'; el.classList.add('glitchuje');
    setTimeout(() => { el.querySelector('b').textContent = 'WAGON 9'; setTimeout(() => el.classList.remove('glitchuje'), 500); }, 1500);
  }
  $('#hud-wagon').innerHTML = `Wagon <b>${wagonNr + 1}</b>/10 · ${m.nazwa}`;
}
function bossPasek(v) {
  $('#boss').hidden = v === null;
  if (v !== null) $('#boss-zycie').style.width = (v * 100) + '%';
}

/* ---------- przejścia między wagonami ---------- */
function drzwiIPrzejscia(dt) {
  const kz = kamera.position.z;
  if (wyczyszczony && wagon.drzwiPrzod.cel === 0 && kz - (wagon.z0 - DL) < 2.8 && !wagon.przeszedl) {
    wagon.drzwiPrzod.cel = 1; dzwiek.drzwi();
    if (nastepny) nastepny.drzwiTyl.cel = 1;
    if (wagonNr === 9) wagon.przeszedl = true;
  }
  if (nastepny && kz < nastepny.z0 - 1.3) {
    // Wejście do następnego wagonu: drzwi za plecami się zamykają.
    poprzedni = wagon; wagon = nastepny; nastepny = null;
    wagon.drzwiTyl.cel = 0; poprzedni.drzwiPrzod.cel = 0; doUsuniecia = 1.2;
    dzwiek.drzwi(); setTimeout(() => dzwiek.zamek(), 700);
    wagonNr++;
    if (wagonNr > najdalej()) pamiec.zapisz('najdalej', wagonNr);
    swiat.ustawPore(wagon.m.pora, wagon);
    zaplanuj(); pokazTytul(false);
    ogloszenie(wagon.m.komunikat, wagonNr === 8 ? 1.4 : 1);
    if (wagon.m.latarka && !gracz.latarka) podpowiedz(dotykowe ? 'Ciemno? Włącz latarkę przyciskiem 🔦.' : 'Ciemno? Włącz latarkę klawiszem F.', 5);
    if (wagonNr === 1) podpowiedz('Uwaga: anomalią może być też pasażer. Szukaj tego, co się zmieniło.', 6);
    if (wagonNr === 5) podpowiedz('Bliźniaki: jeden z nich nie jest człowiekiem. Który się w ciebie wpatruje?', 6);
    if (wagonNr === 6) podpowiedz('Migacze widać tylko przez chwilę, gdy gaśnie światło.', 6);
  }
  if (poprzedni && doUsuniecia > 0) { doUsuniecia -= dt; if (doUsuniecia <= 0) { poprzedni.usun(); poprzedni = null; } }
  if (wagonNr === 9 && wyczyszczony && kz < wagon.z0 - DL - 0.4) koniecGry();
}

function koniecGry() {
  if (stan === 'koniec') return;
  stan = 'koniec';
  staty.czas = (performance.now() - staty.start) / 1000;
  $('#biel').classList.add('pokaz');
  dzwiek.ciszaSzeptow(); dzwiek.gong();
  setTimeout(() => powiedz('Stacja końcowa. Dziękujemy za podróż ekspresem Meśnik.'), 1200);
  document.exitPointerLock?.();
  const min = Math.floor(staty.czas / 60), sek = Math.round(staty.czas % 60);
  const celnosc = staty.strzaly ? Math.round(staty.trafienia / staty.strzaly * 100) : 0;
  const rekordy = pamiec.czytaj('rekordy', {});
  const poprz = rekordy[ust.trudnosc];
  const nowy = !poprz || staty.czas < poprz;
  if (nowy) { rekordy[ust.trudnosc] = staty.czas; pamiec.zapisz('rekordy', rekordy); }
  pamiec.zapisz('najdalej', 0);
  $('#k-tekst').textContent = 'Pociąg zatrzymał się. Drzwi otworzyły się na zalany światłem peron. Za tobą — dziesięć pustych wagonów.';
  $('#k-staty').innerHTML = [
    ['Czas', `${min} min ${sek} s${nowy ? ' · NOWY REKORD' : ''}`], ['Zniszczone anomalie', staty.anomalie], ['Celność lasera', `${celnosc}%`],
    ['Pomyłki (pasażerowie)', staty.pomylki], ['Ile razy cię dopadły', staty.smierci], ['Poziom', { latwy: 'Łatwy', normalny: 'Normalny', koszmar: 'Koszmar' }[ust.trudnosc]],
  ].map(([a, b]) => `<dt>${a}</dt><dd>${b}</dd>`).join('');
  const ranga = staty.smierci === 0 && staty.pomylki === 0 ? 'Ranga: ŁOWCA ANOMALII 👁️ — bez jednego błędu!'
    : staty.smierci <= 2 ? 'Ranga: Pogromca duchów' : staty.smierci <= 6 ? 'Ranga: Odważny pasażer' : 'Ranga: Udało się. Ledwo.';
  $('#k-ranga').textContent = ranga;
  setTimeout(() => { pokazEkran('#koniec'); $('#hud').hidden = true; $('#dotyk').hidden = true; }, 2600);
}

/* ---------- pętla ---------- */
let ostatni = performance.now();
let klatkaHUD = 0;
function klatka(t) {
  requestAnimationFrame(klatka);
  const dt = Math.min(0.05, (t - ostatni) / 1000); ostatni = t;
  if (stan === 'menu' || stan === 'pauza') return;
  czas += dt;
  if (stan === 'gra') {
    ruchGracza(dt);
    czasWagonu += dt;
    const postep = (wagon.z0 - kamera.position.z) / DL;
    const naraz = wagon.m.anomalie.naraz;
    for (const z of plan) {
      if (z.gotowa || anomalie.filter(a => a.grozna).length >= naraz) continue;
      if (postep >= z.prog || czasWagonu >= z.czas) {
        z.gotowa = true;
        const a = stworzAnomalie(z.typ);
        anomalie.push(a); a.pojaw();
        if (wagonNr === 0 && anomalie.length === 1) podpowiedz(dotykowe ? 'ANOMALIA! Wyceluj i naciśnij ⚡, zanim skończy się jej czas.' : 'ANOMALIA! Wyceluj i kliknij lewym przyciskiem myszy, zanim skończy się jej czas.', 5);
        if (a instanceof Pasazer && wagonNr === 1) podpowiedz('Ten pasażer… coś z nim nie tak. Strzelaj!', 4);
      }
    }
    // Od wagonu 5: wszyscy pasażerowie naraz odwracają głowy w stronę gracza. Tylko patrzą.
    if (wagonNr >= 4 && wagonNr < 9) {
      doSpojrzenia -= dt;
      if (doSpojrzenia <= 0 && spojrzenie <= 0) { spojrzenie = 3.2; dzwiek.pojawienie(0.4); wagon.pasazerowie.forEach(p => { p.wymuszonePatrzenie = true; }); }
      if (spojrzenie > 0) {
        spojrzenie -= dt;
        if (spojrzenie <= 0) { doSpojrzenia = 22 + Math.random() * 20; wagon.pasazerowie.forEach(p => { p.wymuszonePatrzenie = false; }); }
      }
    }
  }
  if (stan === 'gra' || stan === 'dopadla') {
    for (const a of anomalie) a.aktualizuj(dt);
    anomalie = anomalie.filter(a => a.stan !== 'martwa' || (a.usun(), false));
  }
  if (stan === 'dopadla') {
    czasDopadniecia += dt;
    if (czasDopadniecia > 1.1) $('#straszak').className = '';
    if (czasDopadniecia > 1.5) {
      stan = 'gra';
      zacznijWagon(wagonNr, { odNowa: true });
    }
  }
  for (const w of [wagon, nastepny, poprzedni]) w?.aktualizuj(dt, czas, kamera);
  if (stan === 'gra') drzwiIPrzejscia(dt);
  swiat.aktualizuj(dt, czas, kamera, [wagon, nastepny, poprzedni].filter(Boolean), stan !== 'koniec');
  iskry.aktualizuj(dt);

  // Kamera: rozglądanie, kołysanie pociągu, chód, wstrząs.
  potrzasanie = Math.max(0, potrzasanie - dt * 1.2);
  const kolys = Math.sin(czas * 1.3) * 0.006 + Math.sin(czas * 0.47) * 0.004;
  const chod = Math.sin(czas * 9) * 0.03 * gracz.ruch;
  kamera.rotation.set(gracz.pitch + (Math.random() - 0.5) * potrzasanie * 0.08, gracz.yaw + (Math.random() - 0.5) * potrzasanie * 0.08, kolys);
  kamera.position.y = OCZY + Math.abs(chod) * 0.8 - (stan === 'dopadla' ? czasDopadniecia * 0.3 : 0);
  kamera.position.x += kolys * 0.02;
  kamera.updateMatrixWorld();

  // Broń: podąża za kamerą, kołysze się przy chodzeniu, odrzut.
  uchwyt.position.copy(kamera.position); uchwyt.quaternion.copy(kamera.quaternion);
  gracz.odrzut = Math.max(0, gracz.odrzut - dt * 8);
  gracz.doStrzalu -= dt;
  if (gracz.przegrzany > 0) { gracz.przegrzany -= dt; if (gracz.przegrzany <= 0) gracz.cieplo = 40; }
  else gracz.cieplo = Math.max(0, gracz.cieplo - dt * 28);
  bron.position.set(0.3 + Math.sin(czas * 4.5) * 0.006 * gracz.ruch, -0.26 + chod * 0.25, -0.52 + gracz.odrzut * 0.05);
  bron.rotation.x = gracz.odrzut * 0.15;
  const goraco = gracz.cieplo / 100;
  mCewki.emissive.setRGB(0.37 + goraco * 0.63, 0.95 - goraco * 0.6, 1 - goraco * 0.9);
  swiat.blysk.intensity = Math.max(0, swiat.blysk.intensity - dt * 40);
  swiatloBroni.intensity = Math.max(0, swiatloBroni.intensity - dt * 25);
  swiat.latarka.intensity = gracz.latarka ? 22 : 0;
  for (let i = promienie.length - 1; i >= 0; i--) {
    const m = promienie[i]; m.userData.zycie -= dt;
    m.material.opacity = Math.max(0, m.userData.zycie / 0.12) * (m.userData.alfa ?? 1);
    if (m.userData.zycie <= 0) { m.removeFromParent(); m.material.dispose(); promienie.splice(i, 1); }
  }

  // Zagrożenie: najbliższa końca czasu anomalia → śnieżenie, serce, dron.
  const zagrozenie = anomalie.reduce((m, a) => Math.max(m, a.zagrozenie()), 0);
  dzwiek.aktualizuj(dt, kamera, { groza: wagon.m.groza, zagrozenie, tunel: wagon.m.pora === 'tunel', jedzie: stan !== 'koniec' });
  const u = horror.uniforms;
  u.czas.value = czas;
  const dop = stan === 'dopadla' ? czasDopadniecia : 0;
  u.szum.value = Math.pow(zagrozenie, 2.2) * 0.4 + (dop ? 0.5 : 0) + (wagon.awaria > 0 ? 0.06 : 0);
  u.glitch.value = Math.max(Math.pow(zagrozenie, 3) * 0.35, dop ? 1 : 0, anomalie.reduce((m, a) => Math.max(m, a.stan === 'ginie' ? 0.25 : 0), 0));
  u.czerwien.value = Math.max(0, zagrozenie - 0.55) * 0.5 + (dop ? 0.6 : 0) + (wagonNr === 9 ? 0.08 : 0);
  u.aberracja.value = 0.0015 + zagrozenie * 0.004;
  u.zaciemnienie.value = dop > 1.1 ? Math.min(1, (dop - 1.1) / 0.4) : 0;
  u.winieta.value = 1.05 + zagrozenie * 0.35 + wagon.m.groza * 0.15;

  // HUD.
  if (stan === 'gra') {
    odswiezZnaki(false);
    odswiezWskazniki();
    const cel = $('#celownik');
    promien.setFromCamera(_c, kamera); promien.far = 30;
    const hb = anomalie.filter(a => a.grozna).flatMap(a => a.hitboxy).filter(h => h.visible !== false);
    cel.classList.toggle('namierzony', hb.length > 0 && promien.intersectObjects(hb, false).length > 0);
    cel.classList.toggle('przegrzany', gracz.przegrzany > 0);
    $('#cieplo').setAttribute('stroke-dasharray', `${gracz.cieplo.toFixed(0)} 100`);
    if (++klatkaHUD % 4 === 0) rysujEkranBroni(anomalie.filter(a => a.grozna).length);
  }
  composer.render(dt);
}
requestAnimationFrame(klatka);

/* ---------- menu i ekrany ---------- */
function pokazEkran(sel) {
  for (const e of document.querySelectorAll('.ekran')) e.hidden = true;
  if (sel) $(sel).hidden = false;
}
let powrotZUstawien = '#menu', poczatekPauzy = 0;
function pauza() {
  if (stan !== 'gra') return;
  stan = 'pauza'; poczatekPauzy = performance.now();
  dzwiek.wstrzymaj(true);
  try { speechSynthesis.pause(); } catch { /* brak mowy */ }
  pokazEkran('#pauza');
}
function wznow() {
  pokazEkran(null);
  stan = 'gra'; ostatni = performance.now();
  staty.start += performance.now() - poczatekPauzy;
  dzwiek.wstrzymaj(false);
  try { speechSynthesis.resume(); } catch { /* brak mowy */ }
  zablokujMysz();
}
function nowaGra(nr) {
  pokazEkran(null);
  $('#hud').hidden = false; $('#dotyk').hidden = !dotykowe;
  $('#biel').classList.remove('pokaz');
  dzwiek.start(); dzwiek.wstrzymaj(false);
  Object.assign(staty, { start: performance.now(), strzaly: 0, trafienia: 0, pomylki: 0, smierci: 0, anomalie: 0 });
  stan = 'gra'; ostatni = performance.now();
  zacznijWagon(nr);
  if (nr === 0) podpowiedz(dotykowe ? 'Lewy kciuk – chodzenie, przeciąganie po prawej – rozglądanie się.' : 'W A S D – chodzenie, mysz – rozglądanie się. Idź naprzód.', 6);
  zablokujMysz();
}
function wyjdzDoMenu() {
  stan = 'menu';
  [wagon, nastepny, poprzedni].forEach(w => w?.usun()); wagon = nastepny = poprzedni = null;
  anomalie.forEach(a => a.usun()); anomalie = [];
  dzwiek.wstrzymaj(true);
  $('#hud').hidden = true; $('#dotyk').hidden = true; $('#biel').classList.remove('pokaz');
  odswiezMenu();
  pokazEkran('#menu');
}
function odswiezMenu() {
  const n = najdalej();
  const k = $('#b-kontynuuj');
  k.hidden = n < 1; k.textContent = `Kontynuuj od wagonu ${n + 1}`;
  const r = pamiec.czytaj('rekordy', {});
  const opis = Object.entries(r).map(([p, s]) => `${{ latwy: 'łatwy', normalny: 'normalny', koszmar: 'koszmar' }[p]} ${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}`);
  $('#rekord').textContent = opis.length ? 'Najlepsze czasy: ' + opis.join(' · ') : '';
}

$('#b-start').onclick = () => nowaGra(param.has('wagon') ? ogranicz(+param.get('wagon') - 1, 0, 9) : 0);
$('#b-kontynuuj').onclick = () => nowaGra(najdalej());
$('#b-jak').onclick = () => pokazEkran('#jak');
$('#b-ustawienia').onclick = () => { powrotZUstawien = '#menu'; pokazUstawienia(); };
$('#p-wroc').onclick = wznow;
$('#p-od-nowa').onclick = () => { pokazEkran(null); stan = 'gra'; ostatni = performance.now(); staty.start += performance.now() - poczatekPauzy; dzwiek.wstrzymaj(false); zacznijWagon(wagonNr, { odNowa: true }); zablokujMysz(); };
$('#p-ustawienia').onclick = () => { powrotZUstawien = '#pauza'; pokazUstawienia(); };
$('#p-menu').onclick = wyjdzDoMenu;
$('#k-znowu').onclick = () => nowaGra(0);
$('#k-menu').onclick = wyjdzDoMenu;
for (const z of document.querySelectorAll('#jak .zamknij')) z.onclick = () => pokazEkran('#menu');
$('#ustawienia .zamknij').onclick = () => {
  const jakosc = $('#u-jakosc').checked;
  Object.assign(ust, {
    trudnosc: document.querySelector('input[name=trudnosc]:checked').value,
    czulosc: +$('#u-czulosc').value, glosnosc: +$('#u-glosnosc').value, lagodny: $('#u-lagodny').checked,
  });
  if (jakosc !== ust.jakosc) { ust.jakosc = jakosc; zbudujPotok(); }
  pamiec.zapisz('ustawienia', ust);
  dzwiek.ustawGlosnosc(ust.glosnosc); dzwiek.lagodny = ust.lagodny;
  pokazEkran(powrotZUstawien);
};
function pokazUstawienia() {
  document.querySelector(`input[name=trudnosc][value=${ust.trudnosc}]`).checked = true;
  $('#u-czulosc').value = ust.czulosc; $('#u-glosnosc').value = ust.glosnosc;
  $('#u-lagodny').checked = ust.lagodny; $('#u-jakosc').checked = ust.jakosc;
  pokazEkran('#ustawienia');
}

// Głosy syntezatora ładują się asynchronicznie – poproś o nie zawczasu.
try { speechSynthesis.getVoices(); speechSynthesis.onvoiceschanged = () => speechSynthesis.getVoices(); } catch { /* brak mowy */ }

// Ładowanie obrazów, potem start.
wczytajWszystko([...OBRAZY_DUCHOW, 'pano-dzien.jpg', 'pano-zmierzch.jpg', 'pano-noc.jpg', 'pano-czerwien.jpg', 'tkanina.jpg', 'jumpscare.jpg', 'plakat-gory.jpg', 'plakat-morze.jpg', 'plakat-zly.jpg'],
  p => { $('#ladowanie i').style.width = (p * 100) + '%'; })
  .then(() => {
    $('#b-start').disabled = false; $('#ladowanie').style.opacity = 0;
    odswiezMenu();
    if (TEST) nowaGra(ogranicz(+(param.get('wagon') || 1) - 1, 0, 9));
  });

// Haki do testów automatycznych (?test): skok do wagonu, przywołanie anomalii, ustawienie kamery.
window.__gra = {
  stan: () => ({ stan, wagonNr, anomalie: anomalie.map(a => [a.rodzaj, a.stan, +a.pozostalo.toFixed(1), a.pozycja(new THREE.Vector3()).toArray().map(v => +v.toFixed(2))]), z: kamera.position.z, x: kamera.position.x, yaw: gracz.yaw, zniszczone, doZniszczenia, wycz: wyczyszczony, dp: wagon.drzwiPrzod.otwarcie, nt: nastepny?.drzwiTyl.otwarcie ?? null, nz0: nastepny?.z0 ?? null }),
  kamera: (x, z, yaw = 0, pitch = 0) => { kamera.position.x = x; kamera.position.z = wagon.z0 + z; gracz.yaw = yaw; gracz.pitch = pitch; },
  anomalia: typ => { const a = stworzAnomalie(typ); anomalie.push(a); a.pojaw(); doZniszczenia++; return a.rodzaj; },
  strzal, czysc: () => { anomalie.forEach(a => a.grozna && a.zgin()); plan.forEach(p => { p.gotowa = true; }); wagonCzysty(); },
  latarka: v => { gracz.latarka = v; }, kierunek: (y, p = 0) => { gracz.yaw = y; gracz.pitch = p; }, wagon: nr => { zacznijWagon(nr); },
  celuj: () => {
    const a = anomalie.find(a => a.grozna && a.hitboxy[0]?.visible !== false); if (!a) return false;
    const p = a.hitboxy[0].getWorldPosition(new THREE.Vector3()); p.y += 0.6;
    const d = p.sub(kamera.position); gracz.yaw = Math.atan2(-d.x, -d.z); gracz.pitch = Math.atan2(d.y, Math.hypot(d.x, d.z)); return a.rodzaj;
  },
  bezLimitu: () => { anomalie.forEach(a => { a.limit = a.pozostalo = 9999; }); plan.forEach(p => { p.gotowa = true; }); },
};
