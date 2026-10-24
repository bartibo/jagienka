// Świat za oknami i światło: panorama przesuwająca się za szybami, słupy, tunel, pula lamp przy graczu.
import * as THREE from '../lib/three.js';
import { obraz, T } from './tekstury.js';

export const PORY = {
  dzien: { pano: 'pano-dzien.jpg', niebo: 0xb7b9b0, mgla: [0x4a4a46, 40, 170], slonce: [0xfff0d8, 1.1], ziemia: '#9a9078', otoczenie: 0xdfe6ff },
  zmierzch: { pano: 'pano-zmierzch.jpg', niebo: 0x3a2e40, mgla: [0x2a2230, 22, 110], slonce: [0xff9a60, 0.7], ziemia: '#4a4440', otoczenie: 0x8a7aa0 },
  noc: { pano: 'pano-noc.jpg', niebo: 0x0b0f16, mgla: [0x06080c, 10, 60], slonce: [0x6a8acc, 0.35], ziemia: '#1e2226', otoczenie: 0x4a5a7a },
  tunel: { pano: null, niebo: 0x020202, mgla: [0x020202, 6, 40], slonce: [0xff8a30, 0], ziemia: '#0a0a0a', otoczenie: 0x303848 },
  czerwien: { pano: 'pano-czerwien.jpg', niebo: 0x2a0606, mgla: [0x140404, 9, 55], slonce: [0xff4a3a, 0.5], ziemia: '#4a2420', otoczenie: 0x7a3a3a },
};
const LAMP = 6;

export class Swiat {
  constructor(scena) {
    this.scena = scena;
    this.predkosc = 24; // m/s – prędkość pociągu dla przesuwu krajobrazu
    this.przesuw = 0;
    scena.background = new THREE.Color(0x000000);
    scena.fog = new THREE.Fog(0x000000, 10, 60);

    this.niebo = new THREE.HemisphereLight(0xffffff, 0x302820, 0.6);
    scena.add(this.niebo);
    this.slonce = new THREE.DirectionalLight(0xffffff, 1);
    this.slonce.position.set(-6, 5, 2);
    scena.add(this.slonce, this.slonce.target);
    this.lampy = [];
    for (let i = 0; i < LAMP; i++) {
      const l = new THREE.PointLight(0xffffff, 0, 10, 2);
      scena.add(l); this.lampy.push(l);
    }
    // Pomarańczowe błyski lamp tunelowych przez okna.
    this.tunelSwiatlo = new THREE.PointLight(0xff8a30, 0, 7, 1.5);
    scena.add(this.tunelSwiatlo);

    // Panoramy po obu stronach (lustrzane powtarzanie ukrywa szew obrazu).
    this.zewn = new THREE.Group(); scena.add(this.zewn);
    this.panoMat = new THREE.MeshBasicMaterial({ color: 0xffffff, fog: false });
    const panoGeo = new THREE.PlaneGeometry(420, 52);
    for (const s of [-1, 1]) {
      const p = new THREE.Mesh(panoGeo, this.panoMat);
      p.position.set(s * 42, 3.5, 0); p.rotation.y = -s * Math.PI / 2;
      if (s > 0) p.scale.x = -1; // obie strony przesuwają się w tę samą stronę (do tyłu pociągu)
      this.zewn.add(p);
    }
    // Ziemia przy torach (szybki przesuw = wrażenie prędkości).
    this.ziemiaTex = T.trawa().clone(); this.ziemiaTex.repeat.set(2, 60); this.ziemiaTex.needsUpdate = true;
    this.ziemiaMat = new THREE.MeshBasicMaterial({ map: this.ziemiaTex, color: 0x8a8a7a, fog: false });
    for (const s of [-1, 1]) {
      const g = new THREE.Mesh(new THREE.PlaneGeometry(5, 240), this.ziemiaMat);
      g.rotation.x = -Math.PI / 2; g.position.set(s * 4.1, -1.3, 0);
      this.zewn.add(g);
    }
    // Słupy trakcyjne i drzewa przelatujące za oknem.
    this.slupy = [];
    const mSlup = new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.8 });
    const gSlup = new THREE.CylinderGeometry(0.12, 0.15, 16, 6), gRam = new THREE.BoxGeometry(2.5, 0.12, 0.12);
    for (let i = 0; i < 10; i++) {
      const g = new THREE.Group();
      const s = i % 2 ? 1 : -1;
      const sl = new THREE.Mesh(gSlup, mSlup); sl.position.y = 0; g.add(sl);
      const ra = new THREE.Mesh(gRam, mSlup); ra.position.set(-s * 1.2, 6.8, 0); g.add(ra);
      g.position.set(s * 3.6, -1.3, -i * 30);
      g.userData.krok = 300;
      this.zewn.add(g); this.slupy.push(g);
    }
    // Tunel: ściany tuż za szybami z lampami.
    this.tunel = new THREE.Group(); this.tunel.visible = false; this.zewn.add(this.tunel);
    const bt = T.beton().clone(); bt.repeat.set(60, 2); bt.needsUpdate = true;
    this.betonTex = bt;
    const mBet = new THREE.MeshStandardMaterial({ map: bt, roughness: 1, color: 0x8a8a8a });
    for (const s of [-1, 1]) {
      const sc = new THREE.Mesh(new THREE.PlaneGeometry(240, 8), mBet);
      sc.position.set(s * 2.6, 1.5, 0); sc.rotation.y = -s * Math.PI / 2; this.tunel.add(sc);
    }
    const mLampT = new THREE.MeshBasicMaterial({ color: new THREE.Color(4, 1.6, 0.4), fog: false });
    this.lampyTunelu = [];
    for (let i = 0; i < 16; i++) {
      const l = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.12, 0.6), mLampT);
      const s = i % 2 ? 1 : -1;
      l.position.set(s * 2.55, 2.2, -i * 15); l.userData.krok = 240;
      this.tunel.add(l); this.lampyTunelu.push(l);
    }
    // Latarka i błysk lasera przy kamerze.
    this.latarka = new THREE.SpotLight(0xfff2dd, 0, 24, 0.5, 0.85, 1.3);
    this.blysk = new THREE.PointLight(0x40e0ff, 0, 6, 2);
    this.odwrocony = false;
  }

  podepnijKamere(kamera) {
    kamera.add(this.latarka, this.latarka.target, this.blysk);
    this.latarka.position.set(0.25, -0.2, 0); this.latarka.target.position.set(0, 0, -5);
    this.blysk.position.set(0.25, -0.2, -0.6);
  }

  ustawPore(nazwa, wagon) {
    const p = PORY[nazwa];
    this.pora = nazwa;
    this.scena.background.set(p.niebo);
    this.scena.fog.color.set(p.mgla[0]); this.scena.fog.near = p.mgla[1]; this.scena.fog.far = p.mgla[2];
    this.slonce.color.set(p.slonce[0]); this.slonce.intensity = p.slonce[1];
    this.niebo.color.set(p.otoczenie); this.niebo.intensity = wagon.m.swiatlo.otoczenie;
    this.niebo.groundColor.set(0x2a2018);
    this.ziemiaMat.color.set(p.ziemia);
    if (p.pano) {
      const t = obraz(p.pano); t.wrapS = THREE.MirroredRepeatWrapping; t.repeat.set(2, wagon.m.uklad === 'odwrocony' ? -1 : 1);
      t.wrapT = THREE.RepeatWrapping; t.needsUpdate = true;
      this.panoTex = t; this.panoMat.map = t; this.panoMat.needsUpdate = true;
    }
    const tunel = nazwa === 'tunel';
    this.tunel.visible = tunel;
    this.zewn.children.forEach(c => { if (c !== this.tunel) c.visible = !tunel; });
    this.odwrocony = wagon.m.uklad === 'odwrocony';
  }

  aktualizuj(dt, czas, kamera, wagony, jedzie = true) {
    const v = jedzie ? this.predkosc : 0;
    this.przesuw += v * dt;
    this.zewn.position.z = kamera.position.z;
    this.zewn.position.y = this.odwrocony ? 0 : 0;
    if (this.panoTex) this.panoTex.offset.x = (this.przesuw * 0.0009) % 4;
    this.ziemiaTex.offset.y = (this.przesuw / 4) % 1;
    this.betonTex.offset.x = (this.przesuw / 4) % 1;
    for (const s of this.slupy) {
      s.position.z += v * dt;
      if (s.position.z > 40) s.position.z -= s.userData.krok;
    }
    // Lampy tunelu przelatują obok; najbliższa oświetla wnętrze.
    let blisko = 99;
    for (const l of this.lampyTunelu) {
      l.position.z += v * dt * 1.2;
      if (l.position.z > 30) l.position.z -= 240;
      blisko = Math.min(blisko, Math.abs(l.position.z));
    }
    this.tunelSwiatlo.intensity = this.pora === 'tunel' ? Math.max(0, 1 - blisko / 4) * 9 : 0;
    this.tunelSwiatlo.position.set(1.0, 1.8, kamera.position.z - 1);
    // Pula lamp: 6 najbliższych lamp z bieżących wagonów (stała liczba świateł = brak przeładowań shaderów).
    this._t = (this._t || 0) - dt;
    if (this._t <= 0) {
      this._t = 0.2;
      const kz = kamera.position.z;
      this._lista = wagony.flatMap(w => w.lampy).sort((a, b) => Math.abs(a.z - kz) - Math.abs(b.z - kz)).slice(0, LAMP);
    }
    const lista = this._lista || [];
    for (let i = 0; i < LAMP; i++) {
      const l = this.lampy[i], z = lista[i];
      if (!z) { l.intensity = 0; continue; }
      l.position.set(z.x, z.y, z.z);
      l.color.set(z.kolor);
      l.intensity = z.moc;
    }
  }
}
