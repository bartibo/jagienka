// Drobne narzędzia: losowanie z ziarnem, liczby, zbieranie brył w kilka dużych siatek (mało wywołań rysowania).
import * as THREE from '../lib/three.js';

export const $ = s => document.querySelector(s);
export const ogranicz = (v, a, b) => Math.min(b, Math.max(a, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const gladko = (a, b, v) => { const t = ogranicz((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };

// Generator liczb z ziarnem (mulberry32) – ten sam wagon można zbudować ponownie, a anomalie wylosować od nowa.
export function generator(ziarno) {
  let a = ziarno >>> 0;
  const r = () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  r.zakres = (a, b) => a + r() * (b - a);
  r.calk = (a, b) => Math.floor(a + r() * (b - a + 1));
  r.wybierz = t => t[Math.floor(r() * t.length)];
  r.szansa = p => r() < p;
  r.tasuj = t => { for (let i = t.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [t[i], t[j]] = [t[j], t[i]]; } return t; };
  return r;
}

/* ---------- pamięć przeglądarki (może jej nie być: tryb prywatny, blokada) ---------- */
const PRZEDROSTEK = 'gra2-anomalie:';
export const pamiec = {
  czytaj(k, d) { try { const v = localStorage.getItem(PRZEDROSTEK + k); return v ? JSON.parse(v) : d; } catch { return d; } },
  zapisz(k, v) { try { localStorage.setItem(PRZEDROSTEK + k, JSON.stringify(v)); } catch { /* bez zapisu też się gra */ } },
};

// Zbieracz: statyczne bryły wagonu grupowane po materiale i sklejane w jedną siatkę na materiał.
const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _p = new THREE.Vector3(), _s = new THREE.Vector3();
const _box = new THREE.BoxGeometry(1, 1, 1);
const _cyl = new THREE.CylinderGeometry(1, 1, 1, 12);
const _plane = new THREE.PlaneGeometry(1, 1);
export class Zbieracz {
  constructor() { this.mapa = new Map(); }
  dodaj(mat, geo, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1) {
    const g = geo.clone();
    _m.compose(_p.set(x, y, z), _q.setFromEuler(_e.set(rx, ry, rz)), _s.set(sx, sy, sz));
    g.applyMatrix4(_m);
    if (!this.mapa.has(mat)) this.mapa.set(mat, []);
    this.mapa.get(mat).push(g);
    return this;
  }
  // Prostopadłościan o wymiarach w×h×d ze środkiem w (x, y, z).
  box(mat, w, h, d, x, y, z, rx = 0, ry = 0, rz = 0) { return this.dodaj(mat, _box, x, y, z, rx, ry, rz, w, h, d); }
  // Walec o promieniu r i wysokości h, oś pionowa (obrót przez rx/rz).
  walec(mat, r, h, x, y, z, rx = 0, ry = 0, rz = 0) { return this.dodaj(mat, _cyl, x, y, z, rx, ry, rz, r, h, r); }
  plaszczyzna(mat, w, h, x, y, z, rx = 0, ry = 0, rz = 0) { return this.dodaj(mat, _plane, x, y, z, rx, ry, rz, w, h, 1); }
  zbuduj(grupa) {
    const siatki = [];
    for (const [mat, lista] of this.mapa) {
      const g = THREE.BufferGeometryUtils.mergeGeometries(lista, false);
      lista.forEach(x => x.dispose());
      if (!g) continue;
      const m = new THREE.Mesh(g, mat);
      m.matrixAutoUpdate = false; m.updateMatrix();
      grupa.add(m); siatki.push(m);
    }
    this.mapa.clear();
    return siatki;
  }
}

// Zwolnienie pamięci karty graficznej po usuniętym wagonie.
export function zwolnij(obiekt) {
  obiekt.traverse(o => {
    if (o.geometry && !o.geometry.userData.wspolna) o.geometry.dispose();
    const m = o.material;
    if (m) (Array.isArray(m) ? m : [m]).forEach(x => { if (!x.userData.wspolny) { if (x.map && x.map.userData.wlasna) x.map.dispose(); x.dispose(); } });
  });
  obiekt.removeFromParent();
}
