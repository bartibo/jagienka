// Pasażerowie: proste postacie z brył (siedzące lub stojące manekiny), twarze rysowane w canvasie, drobne ruchy.
import * as THREE from '../lib/three.js';
import { plotno, teksturaZ, T } from './tekstury.js';

const SKORA = ['#f1d0b5', '#e8bf9c', '#d9a77f', '#c08a62', '#9a6a45', '#6e4a30', '#f5dcc8'];
const WLOSY = ['#2b1d14', '#4a3020', '#7a5230', '#b88a4a', '#d9c08a', '#1a1a1a', '#8c8c8c', '#e6e6e6', '#7a2a1a'];
const GORY = ['#2f4a6d', '#6d2f2f', '#2f6d4a', '#5a5a5a', '#8a6d3b', '#3b2f6d', '#1f1f24', '#a8a090', '#6d4a2f', '#2a5a5a', '#7a1f3d', '#c2b280'];
const DOLY = ['#22252b', '#2f3540', '#3b3328', '#1a1a1a', '#4a4a50', '#283a52'];

// Wspólne geometrie (nie zwalniane przy usuwaniu wagonu).
const G = {
  kapsula: new THREE.CapsuleGeometry(1, 1, 4, 8),
  kula: new THREE.SphereGeometry(1, 20, 14),
  czapa: new THREE.SphereGeometry(1, 20, 10, 0, Math.PI * 2, 0, Math.PI * 0.55),
  box: new THREE.BoxGeometry(1, 1, 1),
  walec: new THREE.CylinderGeometry(1, 1, 1, 12),
  plaska: new THREE.PlaneGeometry(1, 1),
};
Object.values(G).forEach(g => { g.userData.wspolna = true; });

const pamiecMat = new Map();
function mat(kolor, { szorstkosc = 0.85, metal = 0, emisja = null } = {}) {
  const k = kolor + szorstkosc + metal + emisja;
  if (!pamiecMat.has(k)) {
    const m = new THREE.MeshStandardMaterial({ color: kolor, roughness: szorstkosc, metalness: metal });
    if (emisja) { m.emissive = new THREE.Color(emisja); m.emissiveIntensity = 1.5; }
    m.userData.wspolny = true;
    pamiecMat.set(k, m);
  }
  return pamiecMat.get(k);
}

// Twarz na kuli: przód kuli (+z) to u = 0.25, więc twarz leży w 1/4 szerokości tekstury.
export function teksturaTwarzy(skora, { oczy = 'otwarte', okulary = false, usta = 'prosto', pustka = false, wlosy = '#2b1d14', szminka = false } = {}) {
  const [c, g] = plotno(256, 128);
  g.fillStyle = skora; g.fillRect(0, 0, 256, 128);
  const cx = 64, cy = 60;
  // Lekki cień pod brwiami i na policzkach.
  g.fillStyle = 'rgba(0,0,0,.08)'; g.fillRect(cx - 24, cy - 12, 48, 6);
  if (pustka) {
    g.fillStyle = '#000';
    g.beginPath(); g.ellipse(cx - 11, cy, 7, 9, 0, 0, 7); g.ellipse(cx + 11, cy, 7, 9, 0, 0, 7); g.fill();
    g.beginPath(); g.ellipse(cx, cy + 27, 8, 16, 0, 0, 7); g.fill();
    g.strokeStyle = 'rgba(0,0,0,.4)'; g.lineWidth = 2;
    for (let i = 0; i < 6; i++) { g.beginPath(); g.moveTo(cx - 11 + (i % 2) * 22, cy + 8); g.lineTo(cx - 14 + i * 5, cy + 20 + i * 2); g.stroke(); }
  } else {
    g.fillStyle = wlosy; g.fillRect(cx - 19, cy - 13, 13, 3); g.fillRect(cx + 6, cy - 13, 13, 3);
    if (oczy === 'zamkniete') {
      g.strokeStyle = '#2a1a12'; g.lineWidth = 2;
      g.beginPath(); g.arc(cx - 11, cy - 1, 5, 0.2, Math.PI - 0.2); g.stroke();
      g.beginPath(); g.arc(cx + 11, cy - 1, 5, 0.2, Math.PI - 0.2); g.stroke();
    } else {
      g.fillStyle = '#f4f1ea';
      g.beginPath(); g.ellipse(cx - 11, cy, 5.5, 3.6, 0, 0, 7); g.ellipse(cx + 11, cy, 5.5, 3.6, 0, 0, 7); g.fill();
      g.fillStyle = oczy === 'puste' ? '#fff' : '#1c140f';
      g.beginPath(); g.arc(cx - 11, cy, 2.6, 0, 7); g.arc(cx + 11, cy, 2.6, 0, 7); g.fill();
    }
    g.fillStyle = 'rgba(0,0,0,.14)'; g.fillRect(cx - 2, cy + 4, 4, 11);
    g.strokeStyle = szminka ? '#9a2a3a' : '#7a4a3a'; g.lineWidth = szminka ? 4 : 2.5;
    g.beginPath();
    if (usta === 'usmiech') g.arc(cx, cy + 16, 8, 0.3, Math.PI - 0.3);
    else if (usta === 'smutne') g.arc(cx, cy + 30, 8, Math.PI + 0.4, -0.4);
    else { g.moveTo(cx - 7, cy + 22); g.lineTo(cx + 7, cy + 22); }
    g.stroke();
    if (okulary) {
      g.strokeStyle = '#111'; g.lineWidth = 2.5;
      g.strokeRect(cx - 19, cy - 6, 15, 11); g.strokeRect(cx + 4, cy - 6, 15, 11);
      g.beginPath(); g.moveTo(cx - 4, cy - 2); g.lineTo(cx + 4, cy - 2); g.stroke();
    }
  }
  // Uszy po bokach (u = 0 i 0.5).
  g.fillStyle = 'rgba(0,0,0,.12)'; g.fillRect(0, cy - 8, 6, 20); g.fillRect(122, cy - 8, 12, 20);
  const t = teksturaZ(c, { powtarzaj: false });
  t.userData.wlasna = true;
  return t;
}

// Kapsuła między dwoma punktami (kości rąk i nóg); geometrie wspólne dla tych samych wymiarów.
const kapsuly = new Map();
function kapsula(r, dl) {
  const k = Math.round(r * 200) + ':' + Math.round(dl * 100);
  if (!kapsuly.has(k)) { const g = new THREE.CapsuleGeometry(Math.round(r * 200) / 200, Math.round(dl * 100) / 100, 3, 8); g.userData.wspolna = true; kapsuly.set(k, g); }
  return kapsuly.get(k);
}
const _a = new THREE.Vector3(), _b = new THREE.Vector3(), _up = new THREE.Vector3(0, 1, 0);
function kosc(rodzic, m, a, b, r) {
  _a.set(...a); _b.set(...b);
  const dl = _a.distanceTo(_b);
  const s = new THREE.Mesh(kapsula(r, Math.max(0.001, dl - 2 * r)), m);
  s.position.copy(_a).add(_b).multiplyScalar(0.5);
  s.quaternion.setFromUnitVectors(_up, _b.clone().sub(_a).normalize());
  rodzic.add(s);
  return s;
}

/* Pasażer siedzący przodem do +z; początek układu = środek siedzenia na podłodze.
   Zwraca obiekt z grupą, głową (do obracania) i niewidzialną bryłą trafień. */
export function stworzPasazera(los, { manekin = false, cien = false, ubior = null } = {}) {
  const grupa = new THREE.Group();
  const skora = manekin ? '#e9e4da' : los.wybierz(SKORA);
  const kWlosow = los.wybierz(WLOSY);
  const kobieta = los.szansa(0.5);
  const dziecko = !manekin && los.szansa(0.08);
  const sk = dziecko ? 0.72 : 1;
  const mSkora = cien ? mat('#050507', { szorstkosc: 1 }) : mat(skora, { szorstkosc: manekin ? 0.35 : 0.7 });
  const mGora = cien ? mSkora : manekin ? mat('#d8d2c8', { szorstkosc: 0.4 }) : mat(ubior?.gora || los.wybierz(GORY));
  const mDol = cien ? mSkora : manekin ? mat('#cfc9bf', { szorstkosc: 0.4 }) : mat(ubior?.dol || los.wybierz(DOLY));
  const mBut = cien ? mSkora : mat(los.wybierz(['#111', '#2a1a10', '#3a2a20', '#555']), { szorstkosc: 0.5 });

  const ciało = new THREE.Group(); ciało.scale.setScalar(sk); grupa.add(ciało);
  const tulow = new THREE.Group(); tulow.position.set(0, 0.55, -0.12); ciało.add(tulow);
  // Biodra i uda (poziomo), łydki (pionowo), buty.
  for (const s of [-1, 1]) {
    kosc(ciało, mDol, [s * 0.1, 0.52, -0.08], [s * 0.11, 0.53, 0.33], 0.075);
    kosc(ciało, mDol, [s * 0.11, 0.5, 0.36], [s * 0.11, 0.1, 0.4], 0.06);
    const but = new THREE.Mesh(G.box, mBut); but.scale.set(0.1, 0.08, 0.24); but.position.set(s * 0.11, 0.04, 0.44); ciało.add(but);
  }
  // Tułów: kapsuła spłaszczona z przodu.
  const klatka = new THREE.Mesh(G.kapsula, mGora);
  klatka.scale.set(0.2, 0.22, 0.14); klatka.position.set(0, 0.28, 0); tulow.add(klatka);
  if (kobieta && los.szansa(0.4) && !manekin) { // spódnica / sukienka na udach
    const sp = new THREE.Mesh(G.box, mGora); sp.scale.set(0.34, 0.1, 0.42); sp.position.set(0, -0.0, 0.2); tulow.add(sp);
  }
  // Ręce: ramię w dół, przedramię na kolana (albo trzyma gazetę / telefon).
  const coRobi = manekin || cien ? 'nic' : los.wybierz(['nic', 'nic', 'gazeta', 'telefon', 'telefon', 'spi', 'ksiazka']);
  const dlonie = [];
  for (const s of [-1, 1]) {
    const bark = [s * 0.21, 0.47, 0], lok = [s * 0.24, 0.17, 0.05];
    const dlon = coRobi === 'nic' || coRobi === 'spi' ? [s * 0.15, 0.03, 0.3] : [s * 0.1, 0.18, 0.34];
    kosc(tulow, mGora, bark, lok, 0.055);
    kosc(tulow, mGora, lok, dlon, 0.048);
    const d = new THREE.Mesh(G.kula, mSkora); d.scale.setScalar(0.045); d.position.set(...dlon); tulow.add(d); dlonie.push(d);
  }
  // Szyja i głowa (głowa w osobnej grupie, żeby nią kręcić).
  const szyja = new THREE.Mesh(G.walec, mSkora); szyja.scale.set(0.05, 0.12, 0.05); szyja.position.set(0, 0.58, 0); tulow.add(szyja);
  const glowa = new THREE.Group(); glowa.name = 'glowa'; glowa.position.set(0, 0.62, 0); tulow.add(glowa);
  const oczy = coRobi === 'spi' ? 'zamkniete' : 'otwarte';
  const opisTwarzy = { oczy, okulary: los.szansa(0.25), usta: los.wybierz(['prosto', 'prosto', 'usmiech', 'smutne']), wlosy: kWlosow, szminka: kobieta && los.szansa(0.4) };
  const mTwarz = manekin || cien ? mSkora : new THREE.MeshStandardMaterial({ map: teksturaTwarzy(skora, opisTwarzy), roughness: 0.7 });
  const czaszka = new THREE.Mesh(G.kula, mTwarz); czaszka.scale.set(0.105, 0.125, 0.11); czaszka.position.set(0, 0.11, 0); glowa.add(czaszka);
  // Fryzura.
  if (!manekin && !cien) {
    const mW = mat(kWlosow, { szorstkosc: 0.95 });
    const styl = kobieta ? los.wybierz(['dlugie', 'kok', 'krotkie', 'dlugie', 'czapka']) : los.wybierz(['krotkie', 'krotkie', 'lyse', 'czapka', 'kaszkiet']);
    if (styl !== 'lyse') {
      const cz = new THREE.Mesh(G.czapa, styl === 'czapka' ? mat(los.wybierz(GORY)) : mW);
      cz.scale.set(0.115, styl === 'czapka' ? 0.14 : 0.13, 0.12); cz.position.set(0, 0.115, -0.008); cz.rotation.x = -0.25; glowa.add(cz);
    }
    if (styl === 'dlugie') { const d = new THREE.Mesh(G.box, mW); d.scale.set(0.22, 0.3, 0.08); d.position.set(0, 0.0, -0.08); glowa.add(d); }
    if (styl === 'kok') { const k = new THREE.Mesh(G.kula, mW); k.scale.setScalar(0.055); k.position.set(0, 0.2, -0.09); glowa.add(k); }
    if (styl === 'kaszkiet') { const d = new THREE.Mesh(G.walec, mat('#3a3a3a')); d.scale.set(0.12, 0.02, 0.12); d.position.set(0, 0.2, 0.02); glowa.add(d); }
  }
  // Rekwizyty.
  let swiatlo = null;
  if (coRobi === 'gazeta') {
    const g = new THREE.Mesh(G.plaska, new THREE.MeshStandardMaterial({ map: T.gazeta(), side: THREE.DoubleSide, roughness: 0.9 }));
    g.material.userData.wspolny = true;
    g.scale.set(0.42, 0.31, 1); g.position.set(0, 0.3, 0.38); g.rotation.x = -0.25; tulow.add(g);
  } else if (coRobi === 'telefon') {
    const t = new THREE.Mesh(G.box, mat('#111', { szorstkosc: 0.3 })); t.scale.set(0.07, 0.13, 0.012); t.position.set(0.04, 0.24, 0.34); t.rotation.x = -0.9; tulow.add(t);
    const ekran = new THREE.Mesh(G.plaska, mat('#000', { emisja: '#9fd0ff' })); ekran.scale.set(0.06, 0.115, 1); ekran.position.set(0.04, 0.245, 0.347); ekran.rotation.x = -0.9; ekran.position.z += 0.007; tulow.add(ekran);
    swiatlo = ekran;
    glowa.rotation.x = 0.35;
  } else if (coRobi === 'ksiazka') {
    const k = new THREE.Mesh(G.box, mat(los.wybierz(['#7a1f1f', '#1f3a7a', '#2a5a2a']))); k.scale.set(0.22, 0.03, 0.16); k.position.set(0, 0.2, 0.36); k.rotation.x = 0.5; tulow.add(k);
    glowa.rotation.x = 0.3;
  } else if (coRobi === 'spi') {
    glowa.rotation.z = (los.szansa(0.5) ? 1 : -1) * 0.35; glowa.rotation.x = 0.2;
  }
  if (!manekin && !cien && los.szansa(0.2)) { // słuchawki
    const s = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.012, 6, 16, Math.PI), mat('#111')); s.position.set(0, 0.12, 0); glowa.add(s);
  }

  // Niewidzialna bryła trafień.
  const hitbox = new THREE.Mesh(G.box, new THREE.MeshBasicMaterial({ visible: false }));
  hitbox.name = 'hitbox';
  hitbox.scale.set(0.5 * sk, 1.4 * sk, 0.7); hitbox.position.set(0, 0.7 * sk, 0.05);
  grupa.add(hitbox);

  return {
    grupa, glowa, tulow, hitbox, czaszka, skora, opisTwarzy, swiatlo, coRobi, cien,
    faza: los() * 10, celGlowy: 0, doZmiany: los.zakres(1, 6), patrzy: false, wymuszonePatrzenie: false,
    bazaGlowy: { x: glowa.rotation.x, y: glowa.rotation.y, z: glowa.rotation.z },
  };
}

// Postać stojąca (manekiny w bagażowym, pasażer przy oknie) – ta sama budowa, wyprostowana.
export function stworzStojacego(los, { manekin = true, cien = false } = {}) {
  const p = stworzPasazera(los, { manekin, cien });
  const c = p.grupa.children[0];
  c.children.forEach(o => { if (o !== p.tulow) o.visible = false; });
  p.tulow.position.set(0, 1.0, 0);
  const m = manekin ? mat('#cfc9bf', { szorstkosc: 0.4 }) : cien ? mat('#050507', { szorstkosc: 1 }) : mat(los.wybierz(DOLY));
  for (const s of [-1, 1]) kosc(c, m, [s * 0.1, 1.02, 0], [s * 0.1, 0.07, 0], 0.07);
  if (manekin) { const pal = new THREE.Mesh(G.walec, mat('#333', { metal: 0.6, szorstkosc: 0.4 })); pal.scale.set(0.2, 0.03, 0.2); pal.position.y = 0.015; c.add(pal); }
  else for (const s of [-1, 1]) { const but = new THREE.Mesh(G.box, mat('#151515', { szorstkosc: 0.5 })); but.scale.set(0.1, 0.08, 0.24); but.position.set(s * 0.1, 0.04, 0.05); c.add(but); }
  p.hitbox.scale.set(0.5, 1.8, 0.4); p.hitbox.position.set(0, 0.9, 0);
  p.manekin = manekin;
  return p;
}

// Ruchy pasażera: oddech, rozglądanie się, czasem patrzy na gracza.
const _v = new THREE.Vector3();
export function animujPasazera(p, dt, czas, kamera) {
  if (p.zamrozony) return;
  p.faza += dt;
  p.tulow.scale.y = 1 + Math.sin(p.faza * 1.6) * 0.012;
  p.doZmiany -= dt;
  if (p.doZmiany <= 0) {
    p.doZmiany = 2 + Math.random() * 6;
    p.celGlowy = p.coRobi === 'spi' || p.manekin ? 0 : (Math.random() - 0.5) * 1.2;
    p.patrzy = Math.random() < 0.25;
  }
  let cel = p.celGlowy, celX = p.bazaGlowy.x;
  if ((p.patrzy || p.wymuszonePatrzenie) && p.coRobi !== 'spi') {
    p.glowa.getWorldPosition(_v);
    const dx = kamera.position.x - _v.x, dz = kamera.position.z - _v.z;
    const odl = Math.hypot(dx, dz);
    if (odl < 7 || p.wymuszonePatrzenie) {
      const kat = Math.atan2(dx, dz) - p.grupa.rotation.y - (p.grupa.parent?.rotation.y || 0);
      let k = Math.atan2(Math.sin(kat), Math.cos(kat));
      cel = Math.max(-1.3, Math.min(1.3, k));
      celX = -0.1;
    }
  }
  const sz = p.wymuszonePatrzenie ? 6 : 2.5;
  p.glowa.rotation.y += (cel - p.glowa.rotation.y) * Math.min(1, dt * sz);
  p.glowa.rotation.x += (celX - p.glowa.rotation.x) * Math.min(1, dt * 2);
  if (p.swiatlo) p.swiatlo.material.emissiveIntensity = 1.2 + Math.sin(czas * 3 + p.faza) * 0.2;
}
