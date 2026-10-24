// Anomalie: rozmyte duchy (obrazy z Nano Banana w shaderze z glitchem) i pasażerowie, którzy przestali być ludźmi.
import * as THREE from '../lib/three.js';
import { obraz } from './tekstury.js';
import { teksturaTwarzy } from './postacie.js';
import { POL, SUFIT } from './wagony.js';

export const DUCHY = {
  zjawa: { plik: 'zjawa.webp', proporcja: 0.3008, wys: 2.2, jarzenie: 4, kolor: [0.9, 0.9, 1.0], iskry: 0x9fd8ff, aura: 1, kolorAury: 0x5a9cff },
  dama: { plik: 'dama.webp', proporcja: 0.3105, wys: 1.72, jarzenie: 0, kolor: [0.85, 0.95, 1.0], iskry: 0xe0f0ff },
  pelzacz: { plik: 'pelzacz.webp', proporcja: 0.979, wys: 0.95, jarzenie: 0, kolor: [0.95, 0.95, 0.95], iskry: 0xffffff },
  konduktor: { plik: 'konduktor.webp', proporcja: 0.374, wys: 2.35, jarzenie: 5, kolor: [1, 0.9, 0.9], iskry: 0xff4030, aura: 1, kolorAury: 0xff3020 },
  rozmyty: { plik: 'rozmyty.webp', proporcja: 0.3145, wys: 1.82, jarzenie: 0, kolor: [0.95, 0.9, 0.95], iskry: 0xd0c0ff, rozmycie: 0.012 },
  dziecko: { plik: 'dziecko.webp', proporcja: 0.4303, wys: 1.45, jarzenie: 1.5, kolor: [0.85, 0.9, 0.95], iskry: 0xe0f0ff },
  twarz: { plik: 'twarz.jpg', proporcja: 1, wys: 1.5, jarzenie: 0, kolor: [1.2, 1.3, 1.5], iskry: 0xa0c0ff, luma: true, aura: 0.4 },
};
export const OBRAZY_DUCHOW = Object.values(DUCHY).map(d => d.plik);

const VS = `
uniform float czas, glitch;
varying vec2 vUv;
void main() {
  vUv = uv;
  vec3 p = position;
  p.x += sin(p.y * 7.0 + czas * 3.0) * 0.015 * (1.0 + glitch * 8.0);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}`;
const FS = `
uniform sampler2D mapa;
uniform float czas, glitch, alfa, rozmycie, jarzenie, luma, jasnosc, aura;
uniform vec3 barwa, kolorAury;
varying vec2 vUv;
float h(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
vec4 probka(vec2 uv) {
  vec4 c = texture2D(mapa, clamp(uv, 0.001, 0.999));
  if (luma > 0.5) { float l = dot(c.rgb, vec3(0.3, 0.59, 0.11)); c.a = smoothstep(0.04, 0.45, l); }
  return c;
}
void main() {
  vec2 uv = vUv;
  float t = floor(czas * 24.0);
  float pas = floor(uv.y * 38.0);
  if (h(vec2(pas, t)) < 0.05 + glitch * 0.5) uv.x += (h(vec2(pas, t + 1.7)) - 0.5) * (0.05 + glitch * 0.35);
  vec4 c = vec4(0.0);
  for (int i = 0; i < 6; i++) {
    float a = float(i) * 1.047 + czas * 2.0;
    c += probka(uv + vec2(cos(a), sin(a)) * rozmycie);
  }
  c /= 6.0;
  float ab = 0.008 + glitch * 0.04;
  c.r = mix(c.r, probka(uv + vec2(ab, 0.0)).r, 0.75);
  c.b = mix(c.b, probka(uv - vec2(ab, 0.0)).b, 0.75);
  float l = max(c.r, max(c.g, c.b));
  c.rgb = c.rgb * barwa * jasnosc * (1.0 + smoothstep(0.62, 0.92, l) * jarzenie);
  c.rgb = mix(c.rgb, vec3(h(uv * vec2(311.0, 617.0) + t)), glitch * 0.4);
  // Aura: rozmyta otoczka wokół sylwetki – ciemne zjawy odcinają się od ciemnego wagonu.
  float otoczka = 0.0;
  for (int i = 0; i < 8; i++) {
    float a = float(i) * 0.785 + czas * 0.7;
    otoczka += probka(uv + vec2(cos(a), sin(a) * 0.55) * (0.035 + 0.01 * sin(czas * 3.0 + float(i)))).a;
  }
  otoczka = otoczka / 8.0 * aura * (0.75 + 0.25 * sin(czas * 5.0 + uv.y * 9.0));
  float mig = 0.8 + 0.2 * h(vec2(t, 3.3));
  float aa = max(c.a, otoczka * 0.55);
  vec3 kol = mix(kolorAury * 1.6, c.rgb, c.a / max(aa, 0.001));
  kol += kolorAury * otoczka * 0.35 * (1.0 - c.a);
  float a = aa * alfa * mig * (1.0 - glitch * 0.35 * step(0.6, h(vec2(pas * 3.1, t))));
  if (a < 0.01) discard;
  gl_FragColor = vec4(kol, a);
}`;

const geoPlaska = new THREE.PlaneGeometry(1, 1).translate(0, 0.5, 0);
const geoHit = new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0);
const matHit = new THREE.MeshBasicMaterial({ visible: false });

function materialDucha(def) {
  return new THREE.ShaderMaterial({
    vertexShader: VS, fragmentShader: FS, transparent: true, depthWrite: false, side: THREE.DoubleSide,
    uniforms: {
      mapa: { value: obraz(def.plik) }, czas: { value: 0 }, glitch: { value: 0 }, alfa: { value: 0 },
      rozmycie: { value: def.rozmycie ?? 0.006 }, jarzenie: { value: def.jarzenie }, luma: { value: def.luma ? 1 : 0 },
      jasnosc: { value: 1 }, barwa: { value: new THREE.Vector3(...def.kolor) },
      aura: { value: def.aura ?? 0.6 }, kolorAury: { value: new THREE.Color(def.kolorAury ?? 0x6fb8ff) },
    },
  });
}

const _v = new THREE.Vector3(), _w = new THREE.Vector3();
let licznik = 0;

/* ---------- baza ---------- */
class Anomalia {
  constructor(gra, rodzaj, limit) {
    this.gra = gra; this.rodzaj = rodzaj; this.id = ++licznik;
    this.limit = limit; this.pozostalo = limit;
    this.stan = 'czeka'; this.zycie = 1; this.glitch = 0; this.t = 0;
    this.hitboxy = []; this.szept = null;
    this.ikona = 'img/' + (DUCHY[rodzaj]?.plik || 'jumpscare.jpg');
  }
  get grozna() { return this.stan === 'pojawia' || this.stan === 'aktywna'; }
  // Pozycja w świecie (do strzałek na ekranie, szeptu i ataku).
  pozycja(cel) { return cel.set(0, 0, 0); }
  pojaw() {
    this.stan = 'pojawia'; this.t = 0;
    this.gra.dzwiek.pojawienie(this.gra.wagonNr >= 6 ? 1 : 0.7);
    if (this.gra.wagonNr >= 2 && this.gra.wagon) this.gra.wagon.awaria = Math.max(this.gra.wagon.awaria, 0.25 + Math.random() * 0.3);
    this.szept = this.gra.dzwiek.szept(this.rodzaj === 'dziecko' ? 1.6 : this.rodzaj === 'konduktor' ? 0.6 : 1);
  }
  trafiona(punkt) {
    this.zycie--;
    this.glitch = 1;
    this.gra.dzwiek.trafienie();
    if (this.zycie <= 0) this.zgin();
  }
  zgin() {
    this.stan = 'ginie'; this.t = 0;
    this.szept?.stop(); this.szept = null;
    this.gra.dzwiek.zniszczenie();
    this.pozycja(_v); _v.y += 0.9;
    this.gra.iskry.wybuch(_v, DUCHY[this.rodzaj]?.iskry ?? 0xffffff, 140);
    this.gra.anomaliaZniszczona(this);
  }
  aktualizuj(dt) {
    this.t += dt;
    this.glitch = Math.max(0, this.glitch - dt * 2.2);
    if (this.grozna) {
      if (this.stan === 'pojawia' && this.t > 0.7) this.stan = 'aktywna';
      this.pozostalo -= dt;
      if (this.szept) {
        this.pozycja(_v);
        this.szept.ustaw(_v.x, _v.y + 1.2, _v.z, 0.15 + this.zagrozenie() * 0.6);
      }
      if (this.pozostalo <= 0) this.gra.dopadla(this);
    }
  }
  zagrozenie() { return this.grozna ? 1 - Math.max(0, this.pozostalo) / this.limit : 0; }
  usun() { this.szept?.stop(); this.szept = null; }
}

/* ---------- duch z obrazka ---------- */
export class Duch extends Anomalia {
  constructor(gra, rodzaj, limit, { miejsce, ruch = 'stoi', obraz: plik = rodzaj, wys = null, naSuficie = false, okno = 0 }) {
    super(gra, rodzaj, limit);
    const def = DUCHY[plik];
    this.def = def; this.ruch = ruch; this.naSuficie = naSuficie; this.okno = okno;
    this.ikona = 'img/' + def.plik;
    this.grupa = new THREE.Group();
    this.billboard = new THREE.Group(); this.grupa.add(this.billboard);
    const h = wys || def.wys, w = h * def.proporcja;
    this.h = h; this.w = w;
    this.mat = materialDucha(def);
    this.siatka = new THREE.Mesh(geoPlaska, this.mat);
    this.siatka.scale.set(w, h, 1);
    this.siatka.renderOrder = 5;
    this.billboard.add(this.siatka);
    // Echo – drugi, bledszy obraz z opóźnieniem (ruch „rozmazuje się”).
    this.matEcho = materialDucha(def);
    this.echo = new THREE.Mesh(geoPlaska, this.matEcho);
    this.echo.scale.set(w * 1.06, h * 1.03, 1); this.echo.renderOrder = 4;
    this.gra.scena.add(this.echo);
    const hit = new THREE.Mesh(geoHit, matHit);
    hit.scale.set(Math.max(0.35, w * 0.62), h * 0.92, 0.35);
    this.billboard.add(hit); this.hitboxy.push(hit);
    if (naSuficie) { this.billboard.rotation.z = Math.PI; this.billboard.position.y = SUFIT - 0.02; this.billboard.scale.x = -1; }
    this.grupa.position.set(miejsce.x, miejsce.y || 0, miejsce.z);
    this.cel = new THREE.Vector3().copy(this.grupa.position);
    this.grupa.visible = false; this.echo.visible = false;
    this.widoczny = true; this.doMigniecia = 0;
    gra.scena.add(this.grupa);
  }
  pozycja(cel) { return cel.copy(this.grupa.position).setY(this.naSuficie ? SUFIT - this.h - 0.2 : this.grupa.position.y); }
  pojaw() {
    super.pojaw();
    this.grupa.visible = true; this.echo.visible = true;
    this.echo.position.copy(this.grupa.position);
    this.glitch = 1;
    if (this.ruch === 'migacz') this.gra.wagon.awaria = 1.2;
  }
  // Czy duch jest na ekranie (dla „anioła”, który rusza się tylko, gdy nie patrzysz).
  naEkranie() {
    const k = this.gra.kamera;
    _v.copy(this.grupa.position); _v.y += this.h * 0.5;
    _v.project(k);
    return _v.z < 1 && Math.abs(_v.x) < 1.05 && Math.abs(_v.y) < 1.1;
  }
  aktualizuj(dt) {
    super.aktualizuj(dt);
    const k = this.gra.kamera, g = this.grupa, gracz = k.position;
    const czas = this.gra.czas;
    // Billboard: obrót tylko wokół osi pionowej, twarzą do gracza.
    const kat = Math.atan2(gracz.x - g.position.x, gracz.z - g.position.z);
    this.billboard.rotation.y = this.okno ? (this.okno > 0 ? -Math.PI / 2 : Math.PI / 2) : kat;
    const odl = Math.hypot(gracz.x - g.position.x, gracz.z - g.position.z);
    if (this.grozna) {
      const sila = Math.min(1, this.t / 0.7);
      let alfa = sila;
      // Zachowania.
      if (this.ruch === 'podchodzi' && odl > 2.2) this.idzDo(gracz, dt * 0.35);
      if (this.ruch === 'pelza' && odl > 1.7) this.idzDo(gracz, dt * (1.0 + this.gra.wagonNr * 0.05));
      if (this.ruch === 'aniol' && odl > 1.6 && !this.naEkranie()) this.idzDo(gracz, dt * 2.6);
      if (this.ruch === 'kolysze') g.position.x = this.cel.x + Math.sin(this.t * 1.7) * 0.25;
      if (this.ruch === 'migacz') {
        this.doMigniecia -= dt;
        if (this.doMigniecia <= 0) {
          this.widoczny = !this.widoczny;
          this.doMigniecia = this.widoczny ? 1.1 : 0.9;
          if (!this.widoczny) {
            const m = this.gra.wybierzMiejsce('przed', 3, 10) || this.gra.wybierzMiejsce('dowolne');
            if (m) g.position.set(m.x, 0, m.z);
            this.gra.wagon.awaria = 0.9;
          } else { this.glitch = 0.8; this.echo.position.copy(g.position); }
        }
        alfa *= this.widoczny ? 1 : 0;
      }
      if (this.okno) this.siatka.scale.setScalar(1).set(this.w * (1 + this.t * 0.02), this.h * (1 + this.t * 0.02), 1);
      this.mat.uniforms.alfa.value = alfa;
      this.hitboxy[0].visible = alfa > 0.3;
    } else if (this.stan === 'ginie') {
      // Zgaśnięcie jak stary telewizor: spłaszczenie do kreski i błysk.
      const p = this.t / 0.55;
      this.glitch = 1;
      this.siatka.scale.set(this.w * (1 + p * 1.5), this.h * Math.max(0.01, 1 - p * p), 1);
      this.mat.uniforms.alfa.value = Math.max(0, 1 - p * 0.6);
      this.matEcho.uniforms.alfa.value = 0;
      if (p >= 1) { this.stan = 'martwa'; this.usun(); }
    }
    const jasnosc = Math.max(0.7, Math.min(1, this.gra.wagon?.jasnosc ?? 1));
    for (const m of [this.mat, this.matEcho]) {
      m.uniforms.czas.value = czas + this.id;
      m.uniforms.glitch.value = Math.min(1, this.glitch + (this.grozna ? this.zagrozenie() * 0.25 : 0));
      m.uniforms.jasnosc.value = jasnosc;
    }
    // Echo goni oryginał z opóźnieniem.
    this.echo.position.lerp(g.position, Math.min(1, dt * 3));
    this.echo.position.y = g.position.y + (this.naSuficie ? 0 : 0);
    this.echo.rotation.copy(this.billboard.rotation);
    if (this.naSuficie) { this.echo.position.y = SUFIT - 0.02; this.echo.rotation.z = Math.PI; }
    this.matEcho.uniforms.alfa.value = this.mat.uniforms.alfa.value * 0.28;
  }
  idzDo(cel, krok) {
    const g = this.grupa.position;
    _w.set(cel.x - g.x, 0, cel.z - g.z);
    const d = _w.length(); if (d < 0.01) return;
    _w.multiplyScalar(Math.min(krok, d) / d);
    g.x = Math.max(-POL + 0.3, Math.min(POL - 0.3, g.x + _w.x));
    g.z += _w.z;
  }
  usun() {
    super.usun();
    this.grupa.removeFromParent(); this.echo.removeFromParent();
    this.mat.dispose(); this.matEcho.dispose();
  }
}

/* ---------- pasażer-anomalia ---------- */
const matOczu = new THREE.MeshBasicMaterial({ color: new THREE.Color(6, 0.3, 0.2) });
const geoOka = new THREE.SphereGeometry(0.012, 8, 6);
export class Pasazer extends Anomalia {
  constructor(gra, limit, pasazer, { wariant, klon = false, siedzenie = null }) {
    super(gra, 'pasazer', limit);
    this.p = pasazer; this.wariant = wariant; this.klon = klon;
    this.ikona = 'img/jumpscare.jpg';
    if (klon) {
      // Bliźniak: kopia istniejącego pasażera na wolnym miejscu – identyczny, tylko… patrzy.
      const g = pasazer.grupa.clone();
      g.position.set(siedzenie.x, 0, siedzenie.z - gra.wagon.z0);
      g.rotation.y = siedzenie.f > 0 ? 0 : Math.PI;
      g.visible = false;
      gra.wagon.wnetrze.add(g);
      const glowa = g.getObjectByName('glowa');
      this.p = { grupa: g, glowa, hitbox: g.getObjectByName('hitbox'), czaszka: glowa.children[0], skora: pasazer.skora };
      siedzenie.zajete = true;
    }
    this.hitboxy.push(this.p.hitbox);
    this.baza = { y: this.p.glowa.position.y, ry: this.p.glowa.rotation.y, x: this.p.grupa.position.x, z: this.p.grupa.position.z };
    this.doDrgania = 1;
  }
  pozycja(cel) { return this.p.grupa.getWorldPosition(cel); }
  pojaw() {
    super.pojaw();
    const p = this.p;
    p.zamrozony = true;
    if (this.klon) { p.grupa.visible = true; this.glitch = 1; }
    if (this.wariant === 'pustka' || this.wariant === 'oczy') {
      p.czaszka.material = new THREE.MeshStandardMaterial({ map: teksturaTwarzy(p.skora, { pustka: this.wariant === 'pustka' }), roughness: 0.7 });
    }
    if (this.wariant === 'oczy' || this.wariant === 'pustka') {
      for (const s of [-1, 1]) { const o = new THREE.Mesh(geoOka, matOczu); o.position.set(s * 0.038, 0.12, 0.102); p.glowa.add(o); }
    }
  }
  aktualizuj(dt) {
    super.aktualizuj(dt);
    const p = this.p, k = this.gra.kamera;
    if (this.grozna) {
      const s = Math.min(1, this.t / 2.2);
      if (this.wariant === 'obrot') p.glowa.rotation.y = this.baza.ry + s * Math.PI;
      if (this.wariant === 'szyja') { p.glowa.position.y = this.baza.y + s * 0.38; p.glowa.rotation.z = Math.sin(this.t * 2) * 0.2; }
      if (this.wariant === 'pustka' || this.wariant === 'oczy' || this.klon || this.wariant === 'manekin') {
        // Wpatruje się w gracza.
        p.glowa.getWorldPosition(_v);
        const parentRot = p.grupa.rotation.y;
        let kat = Math.atan2(k.position.x - _v.x, k.position.z - _v.z) - parentRot;
        kat = Math.atan2(Math.sin(kat), Math.cos(kat));
        p.glowa.rotation.y = Math.max(-1.6, Math.min(1.6, kat));
        p.glowa.rotation.z = this.wariant === 'pustka' ? 0.5 : 0;
      }
      if (this.wariant === 'manekin' && !this.naEkranie()) {
        // Manekin podchodzi, gdy na niego nie patrzysz.
        const g = p.grupa.position;
        _v.set(k.position.x - (g.x), 0, k.position.z - (g.z + this.gra.wagon.z0));
        const d = _v.length();
        if (d > 1.5) { _v.multiplyScalar(Math.min(dt * 2.2, d) / d); g.x += _v.x; g.z += _v.z; p.grupa.rotation.y = Math.atan2(_v.x, _v.z); }
      }
      // Krótkie drgnięcia „glitch” co jakiś czas.
      this.doDrgania -= dt;
      const drga = this.doDrgania < 0.12;
      if (this.doDrgania <= 0) this.doDrgania = 0.5 + Math.random() * 1.0;
      p.grupa.position.x = (this.wariant === 'manekin' ? p.grupa.position.x : this.baza.x) + (drga ? (Math.random() - 0.5) * 0.06 : 0);
      p.grupa.visible = !(drga && Math.random() < 0.3);
    } else if (this.stan === 'ginie') {
      const q = this.t / 0.5;
      p.grupa.scale.set(1 + q * 1.5, Math.max(0.01, 1 - q * q), 1 + q);
      p.grupa.visible = Math.random() < 0.7;
      if (q >= 1) { this.stan = 'martwa'; this.usun(); }
    }
  }
  naEkranie() {
    this.p.grupa.getWorldPosition(_v); _v.y += 1; _v.project(this.gra.kamera);
    return _v.z < 1 && Math.abs(_v.x) < 1.05 && Math.abs(_v.y) < 1.1;
  }
  zgin() { super.zgin(); this.gra.usunPasazera(this.p); }
  usun() { super.usun(); if (this.stan === 'martwa') this.p.grupa.removeFromParent(); }
}

/* ---------- Konduktor (boss) ---------- */
export class Konduktor extends Duch {
  constructor(gra, limit, miejsce, zycie) {
    super(gra, 'konduktor', limit, { miejsce, ruch: 'podchodzi' });
    this.zycie = this.maxZycie = zycie;
    this.doSkoku = 4;
  }
  trafiona(punkt) {
    this.zycie--;
    this.glitch = 1;
    this.gra.dzwiek.trafienie();
    this.gra.bossPasek(this.zycie / this.maxZycie);
    if (this.zycie <= 0) { this.zgin(); return; }
    this.pozostalo = this.limit;
    this.skocz();
    const ile = this.maxZycie - this.zycie;
    if (ile % 2 === 0) this.gra.przywolaj(ile >= 4 ? 2 : 1);
  }
  skocz() {
    const m = this.gra.wybierzMiejsce(Math.random() < 0.3 ? 'zaPlecami' : 'przed', 3, 9) || this.gra.wybierzMiejsce('dowolne');
    if (m) { this.grupa.position.set(m.x, 0, m.z); }
    this.gra.wagon.awaria = 0.5;
    this.gra.dzwiek.pojawienie(0.8);
    this.doSkoku = 3 + Math.random() * 2;
  }
  aktualizuj(dt) {
    super.aktualizuj(dt);
    if (this.grozna) { this.doSkoku -= dt; if (this.doSkoku <= 0) this.skocz(); }
  }
}

/* ---------- iskry przy trafieniu i zniszczeniu ---------- */
export class Iskry {
  constructor(scena, n = 900) {
    this.n = n; this.i = 0;
    const g = new THREE.BufferGeometry();
    this.poz = new Float32Array(n * 3); this.kol = new Float32Array(n * 3);
    this.pr = new Float32Array(n * 3); this.zycie = new Float32Array(n); this.baza = new Float32Array(n * 3);
    g.setAttribute('position', new THREE.BufferAttribute(this.poz, 3));
    g.setAttribute('color', new THREE.BufferAttribute(this.kol, 3));
    this.punkty = new THREE.Points(g, new THREE.PointsMaterial({ size: 0.045, vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
    this.punkty.frustumCulled = false;
    scena.add(this.punkty);
  }
  wybuch(p, kolor, ile = 60, sila = 2.5) {
    const c = new THREE.Color(kolor);
    for (let k = 0; k < ile; k++) {
      const i = this.i = (this.i + 1) % this.n;
      this.poz.set([p.x + (Math.random() - 0.5) * 0.4, p.y + (Math.random() - 0.5) * 1.2, p.z + (Math.random() - 0.5) * 0.4], i * 3);
      const a = Math.random() * 6.28, b = Math.random() - 0.5;
      this.pr.set([Math.cos(a) * sila * Math.random(), b * sila * 1.5, Math.sin(a) * sila * Math.random()], i * 3);
      this.zycie[i] = 0.6 + Math.random() * 0.8;
      const j = Math.random() < 0.3 ? 3 : 1.6;
      this.baza.set([c.r * j, c.g * j, c.b * j], i * 3);
    }
  }
  aktualizuj(dt) {
    for (let i = 0; i < this.n; i++) {
      if (this.zycie[i] <= 0) { this.kol[i * 3] = this.kol[i * 3 + 1] = this.kol[i * 3 + 2] = 0; continue; }
      this.zycie[i] -= dt;
      const z = Math.max(0, this.zycie[i]);
      for (let k = 0; k < 3; k++) { this.poz[i * 3 + k] += this.pr[i * 3 + k] * dt; this.pr[i * 3 + k] *= 1 - dt * 1.5; this.kol[i * 3 + k] = this.baza[i * 3 + k] * Math.min(1, z * 1.5); }
      this.pr[i * 3 + 1] -= dt * 0.6;
    }
    this.punkty.geometry.attributes.position.needsUpdate = true;
    this.punkty.geometry.attributes.color.needsUpdate = true;
  }
}
