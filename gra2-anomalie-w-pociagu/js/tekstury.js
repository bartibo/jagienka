// Tekstury: obrazy z Nano Banana (img/) i rysowane w canvasie (linoleum, drewno, blacha, gazety, tabliczki).
import * as THREE from '../lib/three.js';

const ladowacz = new THREE.TextureLoader();
const pamiecObrazow = new Map();

export function obraz(nazwa, { powtarzaj = false, srgb = true } = {}) {
  const klucz = nazwa + powtarzaj;
  if (pamiecObrazow.has(klucz)) return pamiecObrazow.get(klucz);
  const t = ladowacz.load('img/' + nazwa);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  if (powtarzaj) t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 4;
  pamiecObrazow.set(klucz, t);
  return t;
}

// Wczytanie wszystkich obrazów przed startem (pasek postępu w menu).
export function wczytajWszystko(lista, postep) {
  let gotowe = 0;
  return Promise.all(lista.map(n => new Promise(ok => {
    const t = obraz(n);
    const koniec = () => { gotowe++; postep?.(gotowe / lista.length); ok(); };
    if (t.image && t.image.complete) koniec();
    else { const img = new Image(); img.onload = img.onerror = koniec; img.src = 'img/' + n; }
  })));
}

export function plotno(w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return [c, c.getContext('2d')];
}

export function teksturaZ(c, { powtarzaj = true, srgb = true } = {}) {
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  if (powtarzaj) t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 4;
  return t;
}

function szum(g, w, h, ile, kolory, rozmiar = [1, 3], alfa = [0.05, 0.25]) {
  for (let i = 0; i < ile; i++) {
    g.globalAlpha = alfa[0] + Math.random() * (alfa[1] - alfa[0]);
    g.fillStyle = kolory[Math.floor(Math.random() * kolory.length)];
    const r = rozmiar[0] + Math.random() * (rozmiar[1] - rozmiar[0]);
    g.fillRect(Math.random() * w, Math.random() * h, r, r);
  }
  g.globalAlpha = 1;
}

const pamiecTekstur = new Map();
function raz(klucz, f) { if (!pamiecTekstur.has(klucz)) pamiecTekstur.set(klucz, f()); return pamiecTekstur.get(klucz); }

export const T = {
  linoleum: (baza = '#5a5f63', pas = '#41464a') => raz('lin' + baza + pas, () => {
    const [c, g] = plotno(256, 512);
    g.fillStyle = baza; g.fillRect(0, 0, 256, 512);
    szum(g, 256, 512, 5000, ['#000', '#fff', '#888'], [1, 2.5], [0.04, 0.18]);
    g.fillStyle = pas; g.globalAlpha = 0.55; g.fillRect(80, 0, 96, 512); g.globalAlpha = 1;
    g.strokeStyle = 'rgba(0,0,0,.25)'; g.lineWidth = 2;
    for (let y = 0; y < 512; y += 128) { g.beginPath(); g.moveTo(0, y); g.lineTo(256, y); g.stroke(); }
    return teksturaZ(c);
  }),
  panel: (kolor = '#d8d2c2') => raz('panel' + kolor, () => {
    const [c, g] = plotno(256, 256);
    const gr = g.createLinearGradient(0, 0, 0, 256);
    gr.addColorStop(0, kolor); gr.addColorStop(1, '#00000022');
    g.fillStyle = kolor; g.fillRect(0, 0, 256, 256);
    g.fillStyle = gr; g.fillRect(0, 0, 256, 256);
    szum(g, 256, 256, 1500, ['#000', '#fff'], [1, 2], [0.02, 0.06]);
    g.strokeStyle = 'rgba(0,0,0,.18)'; g.lineWidth = 3; g.strokeRect(0, 0, 256, 256);
    return teksturaZ(c);
  }),
  drewno: (baza = '#5b3420', ciemne = '#3a1f12') => raz('drewno' + baza, () => {
    const [c, g] = plotno(512, 512);
    g.fillStyle = baza; g.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 140; i++) {
      g.strokeStyle = Math.random() < 0.5 ? ciemne : '#8a5a3a';
      g.globalAlpha = 0.08 + Math.random() * 0.18; g.lineWidth = 1 + Math.random() * 3;
      const y = Math.random() * 512, a = Math.random() * 6;
      g.beginPath(); g.moveTo(0, y);
      for (let x = 0; x <= 512; x += 32) g.lineTo(x, y + Math.sin(x / 70 + a) * 6);
      g.stroke();
    }
    g.globalAlpha = 0.5; g.fillStyle = ciemne;
    for (let x = 0; x < 512; x += 128) g.fillRect(x, 0, 3, 512);
    g.globalAlpha = 1;
    return teksturaZ(c);
  }),
  aksamit: (baza = '#6d0f1a') => raz('aks' + baza, () => {
    const [c, g] = plotno(256, 256);
    g.fillStyle = baza; g.fillRect(0, 0, 256, 256);
    for (let x = 0; x < 256; x += 16) { g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(x, 0, 3, 256); g.fillStyle = 'rgba(255,255,255,.05)'; g.fillRect(x + 6, 0, 4, 256); }
    szum(g, 256, 256, 3000, ['#000', '#ff9aa8'], [1, 2], [0.03, 0.1]);
    return teksturaZ(c);
  }),
  blacha: () => raz('blacha', () => {
    const [c, g] = plotno(256, 256);
    g.fillStyle = '#6f7275'; g.fillRect(0, 0, 256, 256);
    szum(g, 256, 256, 2500, ['#000', '#fff'], [1, 3], [0.03, 0.12]);
    g.fillStyle = 'rgba(255,255,255,.22)';
    for (let y = 0; y < 256; y += 32) for (let x = (y / 32) % 2 ? 16 : 0; x < 256; x += 32) {
      g.save(); g.translate(x + 8, y + 8); g.rotate(0.7); g.fillRect(-9, -2, 18, 4); g.restore();
    }
    return teksturaZ(c);
  }),
  harmonijka: () => raz('harm', () => {
    const [c, g] = plotno(64, 256);
    for (let y = 0; y < 256; y += 16) {
      const gr = g.createLinearGradient(0, y, 0, y + 16);
      gr.addColorStop(0, '#1d1d1f'); gr.addColorStop(0.5, '#3a3a3e'); gr.addColorStop(1, '#0b0b0c');
      g.fillStyle = gr; g.fillRect(0, y, 64, 16);
    }
    return teksturaZ(c);
  }),
  skrzynia: () => raz('skrz', () => {
    const [c, g] = plotno(256, 256);
    g.fillStyle = '#7a5a36'; g.fillRect(0, 0, 256, 256);
    for (let y = 0; y < 256; y += 42) { g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(0, y, 256, 3); }
    szum(g, 256, 256, 2500, ['#3b2a16', '#b48a5a'], [1, 4], [0.05, 0.2]);
    g.strokeStyle = '#4a3218'; g.lineWidth = 22; g.strokeRect(11, 11, 234, 234);
    g.beginPath(); g.moveTo(11, 11); g.lineTo(245, 245); g.stroke();
    g.fillStyle = 'rgba(20,10,0,.6)'; g.font = 'bold 28px monospace'; g.fillText('KRUCHE', 72, 140);
    return teksturaZ(c);
  }),
  beton: () => raz('beton', () => {
    const [c, g] = plotno(256, 256);
    g.fillStyle = '#2a2826'; g.fillRect(0, 0, 256, 256);
    szum(g, 256, 256, 6000, ['#000', '#5a554e'], [1, 4], [0.05, 0.3]);
    for (let i = 0; i < 30; i++) { g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(Math.random() * 256, 0, 2 + Math.random() * 5, 256); }
    return teksturaZ(c);
  }),
  trawa: (baza = '#2b3320') => raz('trawa' + baza, () => {
    const [c, g] = plotno(256, 256);
    g.fillStyle = baza; g.fillRect(0, 0, 256, 256);
    szum(g, 256, 256, 6000, ['#000', '#6b7a45', '#3d2f22'], [1, 5], [0.05, 0.35]);
    return teksturaZ(c);
  }),
  gazeta: () => raz('gazeta', () => {
    const [c, g] = plotno(256, 192);
    g.fillStyle = '#e8e2d2'; g.fillRect(0, 0, 256, 192);
    g.fillStyle = '#222'; g.font = 'bold 22px Georgia, serif'; g.fillText('KURIER NOCNY', 40, 26);
    g.fillRect(8, 34, 240, 2);
    g.font = 'bold 13px Georgia, serif'; g.fillText('ZNIKNIĘCIA W POCIĄGU', 10, 52);
    for (let k = 0; k < 3; k++) for (let y = 62; y < 184; y += 6) g.fillRect(10 + k * 82, y, 70 - Math.random() * 14, 2);
    g.fillStyle = '#777'; g.fillRect(176, 60, 70, 50);
    return teksturaZ(c, { powtarzaj: false });
  }),
};

// Tabliczka nad drzwiami: numer wagonu i licznik pozostałych anomalii (rysowana na nowo przy zmianach).
export function tabliczka() {
  const [c, g] = plotno(256, 64);
  const t = teksturaZ(c, { powtarzaj: false });
  t.userData.wlasna = true;
  t.rysuj = (gora, dol, kolor = '#ff3b2f') => {
    g.fillStyle = '#050505'; g.fillRect(0, 0, 256, 64);
    g.fillStyle = kolor; g.shadowColor = kolor; g.shadowBlur = 8;
    g.font = 'bold 26px monospace'; g.textAlign = 'center';
    g.fillText(gora, 128, 28);
    g.font = 'bold 18px monospace'; g.fillText(dol, 128, 54);
    g.shadowBlur = 0;
    t.needsUpdate = true;
  };
  return t;
}

// Plakat w wagonie: ilustracja z Nano Banana + napis dorysowany w canvasie (model nie pisze liter).
export function plakat(nazwa, napis, podpis) {
  const [c, g] = plotno(384, 512);
  const t = teksturaZ(c, { powtarzaj: false });
  t.userData.wlasna = true;
  const img = new Image();
  img.onload = () => {
    g.drawImage(img, 0, 0, 384, 512);
    g.textAlign = 'center';
    g.font = '900 44px "Arial Black", Impact, sans-serif';
    g.fillStyle = '#a3241a'; g.fillText(napis, 192, 70);
    g.font = 'bold 20px Georgia, serif'; g.fillStyle = '#2a1a10';
    g.fillText(podpis, 192, 104);
    t.needsUpdate = true;
  };
  img.src = 'img/' + nazwa;
  return t;
}
