// Dźwięk gry – wszystko z syntezatora Web Audio, bez plików: stukot kół, szum, szepty anomalii, laser, krzyk.
export class Dzwiek {
  constructor() {
    this.ac = null;
    this.glosnosc = 0.8;
    this.lagodny = false;
    this.doStukotu = 0; this.okresStukotu = 1.25;
    this.doSerca = 0;
    this.szepty = new Set();
  }

  start() {
    if (this.ac) { this.ac.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    const ac = this.ac = new AC();
    this.master = ac.createGain(); this.master.gain.value = this.glosnosc;
    const komp = ac.createDynamicsCompressor();
    komp.threshold.value = -16; komp.ratio.value = 5; komp.attack.value = 0.003; komp.release.value = 0.2;
    this.master.connect(komp).connect(ac.destination);

    // Bufory szumu: biały (syki, kliknięcia) i brązowy (dudnienie pociągu).
    const n = ac.sampleRate * 2;
    this.bialy = ac.createBuffer(1, n, ac.sampleRate);
    this.brazowy = ac.createBuffer(1, n, ac.sampleRate);
    const b = this.bialy.getChannelData(0), br = this.brazowy.getChannelData(0);
    let ost = 0;
    for (let i = 0; i < n; i++) { b[i] = Math.random() * 2 - 1; ost = (ost + 0.02 * b[i]) / 1.02; br[i] = ost * 3.5; }

    // Pogłos z wygenerowanej odpowiedzi impulsowej – do dźwięków „z drugiej strony”.
    this.poglos = ac.createConvolver();
    const dl = ac.sampleRate * 2.6, ir = ac.createBuffer(2, dl, ac.sampleRate);
    for (let k = 0; k < 2; k++) { const d = ir.getChannelData(k); for (let i = 0; i < dl; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / dl, 3); }
    this.poglos.buffer = ir;
    this.poglosWy = ac.createGain(); this.poglosWy.gain.value = 0.5;
    this.poglos.connect(this.poglosWy).connect(this.master);

    // Tło: dudnienie kół (brązowy szum przez dolnoprzepustowy filtr).
    const dud = this.zrodloSzumu(this.brazowy, true);
    this.dudFiltr = ac.createBiquadFilter(); this.dudFiltr.type = 'lowpass'; this.dudFiltr.frequency.value = 160;
    this.dudGain = ac.createGain(); this.dudGain.gain.value = 0.32;
    dud.connect(this.dudFiltr).connect(this.dudGain).connect(this.master); dud.start();
    // Wiatr za oknem.
    const wiatr = this.zrodloSzumu(this.bialy, true);
    const wf = ac.createBiquadFilter(); wf.type = 'bandpass'; wf.frequency.value = 500; wf.Q.value = 0.6;
    this.wiatrGain = ac.createGain(); this.wiatrGain.gain.value = 0.025;
    wiatr.connect(wf).connect(this.wiatrGain).connect(this.master); wiatr.start();
    // Dron grozy: dwa rozstrojone piły, głośność zależy od wagonu.
    this.dronGain = ac.createGain(); this.dronGain.gain.value = 0;
    const df = ac.createBiquadFilter(); df.type = 'lowpass'; df.frequency.value = 260;
    for (const f of [41.2, 41.7, 61.9]) { const o = ac.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f; o.connect(df); o.start(); }
    const lfo = ac.createOscillator(), lg = ac.createGain(); lfo.frequency.value = 0.07; lg.gain.value = 120; lfo.connect(lg).connect(df.frequency); lfo.start();
    df.connect(this.dronGain).connect(this.master);
    // Wysoki pisk w uszach przy dużym zagrożeniu.
    this.piskGain = ac.createGain(); this.piskGain.gain.value = 0;
    const pisk = ac.createOscillator(); pisk.frequency.value = 3150; pisk.connect(this.piskGain).connect(this.master); pisk.start();
  }

  ustawGlosnosc(v) { this.glosnosc = v; if (this.master) this.master.gain.value = v; }
  wstrzymaj(tak) { if (!this.ac) return; tak ? this.ac.suspend() : this.ac.resume(); }

  zrodloSzumu(buf = this.bialy, petla = false) {
    const s = this.ac.createBufferSource(); s.buffer = buf; s.loop = petla;
    if (petla) s.loopStart = Math.random();
    return s;
  }

  // Pojedynczy ton z obwiednią (opcjonalnie przesuwana częstotliwość).
  ton(f, dl, { typ = 'sine', g = 0.2, f2 = null, opozn = 0, atak = 0.005, wyj = null, poglos = 0 } = {}) {
    if (!this.ac) return;
    const ac = this.ac, t0 = ac.currentTime + opozn;
    const o = ac.createOscillator(), v = ac.createGain();
    o.type = typ; o.frequency.setValueAtTime(f, t0);
    if (f2) o.frequency.exponentialRampToValueAtTime(f2, t0 + dl);
    v.gain.setValueAtTime(0.0001, t0); v.gain.exponentialRampToValueAtTime(g, t0 + atak);
    v.gain.exponentialRampToValueAtTime(0.0001, t0 + dl);
    o.connect(v).connect(wyj || this.master);
    if (poglos) { const p = ac.createGain(); p.gain.value = poglos; v.connect(p).connect(this.poglos); }
    o.start(t0); o.stop(t0 + dl + 0.05);
  }

  // Krótki szum przez filtr (kliknięcia, kroki, syki).
  szum(dl, { typ = 'bandpass', f = 1000, q = 1, g = 0.2, opozn = 0, f2 = null, atak = 0.002, poglos = 0, wyj = null } = {}) {
    if (!this.ac) return;
    const ac = this.ac, t0 = ac.currentTime + opozn;
    const s = this.zrodloSzumu(), fl = ac.createBiquadFilter(), v = ac.createGain();
    fl.type = typ; fl.frequency.setValueAtTime(f, t0); fl.Q.value = q;
    if (f2) fl.frequency.exponentialRampToValueAtTime(f2, t0 + dl);
    v.gain.setValueAtTime(0.0001, t0); v.gain.exponentialRampToValueAtTime(g, t0 + atak);
    v.gain.exponentialRampToValueAtTime(0.0001, t0 + dl);
    s.connect(fl).connect(v).connect(wyj || this.master);
    if (poglos) { const p = ac.createGain(); p.gain.value = poglos; v.connect(p).connect(this.poglos); }
    s.start(t0, Math.random()); s.stop(t0 + dl + 0.05);
  }

  /* ---------- efekty ---------- */
  stuk(g = 0.16) {
    this.szum(0.07, { f: 2200, q: 1.5, g: g * 0.6 });
    this.ton(95, 0.09, { g, f2: 55 });
  }
  krok() { this.szum(0.08, { typ: 'lowpass', f: 380, g: 0.07 + Math.random() * 0.03 }); }
  laser() {
    this.ton(1500, 0.16, { typ: 'square', g: 0.07, f2: 160 });
    this.ton(3100, 0.1, { typ: 'sawtooth', g: 0.035, f2: 700 });
    this.szum(0.05, { typ: 'highpass', f: 4000, g: 0.08 });
  }
  trafienie() {
    for (let i = 0; i < 9; i++) this.ton(200 + Math.random() * 2600, 0.03, { typ: 'square', g: 0.07, opozn: i * 0.022 });
    this.szum(0.25, { f: 900, q: 4, g: 0.12, f2: 4000 });
  }
  zniszczenie() {
    this.ton(680, 0.75, { typ: 'sawtooth', g: 0.12, f2: 38, poglos: 0.6 });
    this.szum(0.6, { typ: 'highpass', f: 300, g: 0.16, f2: 7000, poglos: 0.5 });
    for (let i = 0; i < 6; i++) this.ton(400 + Math.random() * 3000, 0.04, { typ: 'square', g: 0.05, opozn: 0.1 + i * 0.05 });
  }
  pojawienie(sila = 1) {
    this.ton(58, 1.2, { g: 0.32 * sila, f2: 31, atak: 0.02 });
    this.szum(1.3, { f: 2400, q: 8, g: 0.05 * sila, atak: 0.6, poglos: 0.8 });
    if (!this.lagodny) this.ton(1244, 1.1, { typ: 'sawtooth', g: 0.018 * sila, f2: 1174, atak: 0.4, poglos: 0.7 });
  }
  pudlo() { this.szum(0.06, { typ: 'highpass', f: 3000, g: 0.05 }); }
  przegrzanie() {
    this.szum(0.9, { typ: 'highpass', f: 2500, g: 0.14, f2: 6000 });
    this.ton(420, 0.12, { typ: 'square', g: 0.06 }); this.ton(320, 0.2, { typ: 'square', g: 0.06, opozn: 0.13 });
  }
  drzwi() {
    this.szum(0.7, { f: 3200, q: 0.7, g: 0.16, atak: 0.03 });
    this.szum(0.9, { typ: 'lowpass', f: 220, g: 0.25, opozn: 0.1, atak: 0.1 });
  }
  zamek() { this.ton(160, 0.08, { typ: 'square', g: 0.1 }); this.szum(0.05, { f: 1800, g: 0.15 }); }
  gong() {
    this.ton(659, 1.6, { g: 0.13, poglos: 0.5 });
    this.ton(523, 2.0, { g: 0.13, opozn: 0.55, poglos: 0.5 });
  }
  sukces() { [523, 659, 784].forEach((f, i) => this.ton(f, 0.5, { typ: 'triangle', g: 0.08, opozn: i * 0.09, poglos: 0.3 })); }
  ej() { this.ton(330, 0.09, { typ: 'square', g: 0.06, f2: 250 }); this.ton(260, 0.14, { typ: 'square', g: 0.06, opozn: 0.1, f2: 200 }); }
  serce(g = 0.4) { this.ton(62, 0.16, { g, f2: 40 }); this.ton(58, 0.18, { g: g * 0.8, f2: 38, opozn: 0.2 }); }
  krzyk() {
    if (!this.ac) return;
    if (this.lagodny) { this.ton(220, 0.6, { typ: 'sawtooth', g: 0.15, f2: 110, poglos: 0.5 }); return; }
    const ac = this.ac, t0 = ac.currentTime, dl = 1.4;
    for (let i = 0; i < 5; i++) {
      const o = ac.createOscillator(), v = ac.createGain(), vib = ac.createOscillator(), vg = ac.createGain();
      o.type = 'sawtooth'; o.frequency.setValueAtTime(300 + Math.random() * 500, t0);
      o.frequency.exponentialRampToValueAtTime(900 + Math.random() * 900, t0 + 0.25);
      o.frequency.exponentialRampToValueAtTime(150 + Math.random() * 100, t0 + dl);
      vib.frequency.value = 25 + Math.random() * 20; vg.gain.value = 90; vib.connect(vg).connect(o.frequency);
      v.gain.setValueAtTime(0.0001, t0); v.gain.exponentialRampToValueAtTime(0.16, t0 + 0.02); v.gain.exponentialRampToValueAtTime(0.0001, t0 + dl);
      o.connect(v).connect(this.master); const p = ac.createGain(); p.gain.value = 0.5; v.connect(p).connect(this.poglos);
      o.start(t0); vib.start(t0); o.stop(t0 + dl); vib.stop(t0 + dl);
    }
    this.szum(1.2, { f: 1500, q: 0.5, g: 0.5, f2: 300 });
    this.ton(45, 1.4, { g: 0.6, f2: 25 });
  }

  // Szept anomalii z kierunku (HRTF). Zwraca uchwyt do przesuwania i wyciszania.
  szept(wysokosc = 1) {
    if (!this.ac) return null;
    const ac = this.ac;
    const s = this.zrodloSzumu(this.bialy, true);
    const f = ac.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 1300 * wysokosc; f.Q.value = 5;
    const f2 = ac.createBiquadFilter(); f2.type = 'bandpass'; f2.frequency.value = 2700 * wysokosc; f2.Q.value = 7;
    const mod = ac.createGain(); mod.gain.value = 0;
    const lfo = ac.createOscillator(), lg = ac.createGain(); lfo.type = 'square'; lfo.frequency.value = 3 + Math.random() * 5; lg.gain.value = 0.5;
    const lfo2 = ac.createOscillator(), lg2 = ac.createGain(); lfo2.frequency.value = 0.4 + Math.random(); lg2.gain.value = 500 * wysokosc;
    lfo.connect(lg).connect(mod.gain); lfo2.connect(lg2).connect(f.frequency);
    const gl = ac.createGain(); gl.gain.value = 0;
    const p = ac.createPanner(); p.panningModel = 'HRTF'; p.distanceModel = 'inverse'; p.refDistance = 2; p.rolloffFactor = 1.2;
    s.connect(f).connect(mod); s.connect(f2).connect(mod);
    mod.connect(gl).connect(p).connect(this.master);
    const pg = ac.createGain(); pg.gain.value = 0.4; gl.connect(pg).connect(this.poglos);
    s.start(); lfo.start(); lfo2.start();
    const uchwyt = {
      ustaw: (x, y, z, glos) => {
        if (p.positionX) { p.positionX.value = x; p.positionY.value = y; p.positionZ.value = z; } else p.setPosition(x, y, z);
        gl.gain.setTargetAtTime(glos, ac.currentTime, 0.1);
      },
      stop: () => {
        gl.gain.setTargetAtTime(0, ac.currentTime, 0.05);
        setTimeout(() => { try { s.stop(); lfo.stop(); lfo2.stop(); } catch { /* już stoi */ } }, 300);
        this.szepty.delete(uchwyt);
      },
    };
    this.szepty.add(uchwyt);
    return uchwyt;
  }
  ciszaSzeptow() { [...this.szepty].forEach(s => s.stop()); }

  // Słuchacz = kamera; tło zależy od wagonu (tunel głośniej, dron grozy).
  aktualizuj(dt, kamera, { groza = 0, zagrozenie = 0, tunel = false, jedzie = true }) {
    if (!this.ac) return;
    const L = this.ac.listener, p = kamera.position, k = kamera.getWorldDirection(this._k || (this._k = kamera.position.clone()));
    if (L.positionX) {
      L.positionX.value = p.x; L.positionY.value = p.y; L.positionZ.value = p.z;
      L.forwardX.value = k.x; L.forwardY.value = k.y; L.forwardZ.value = k.z;
      L.upX.value = 0; L.upY.value = 1; L.upZ.value = 0;
    } else { L.setPosition(p.x, p.y, p.z); L.setOrientation(k.x, k.y, k.z, 0, 1, 0); }
    const t = this.ac.currentTime;
    this.dudGain.gain.setTargetAtTime(jedzie ? (tunel ? 0.55 : 0.32) : 0.04, t, 0.5);
    this.dudFiltr.frequency.setTargetAtTime(tunel ? 260 : 160, t, 0.5);
    this.wiatrGain.gain.setTargetAtTime(jedzie ? (tunel ? 0.06 : 0.025) : 0, t, 0.5);
    this.dronGain.gain.setTargetAtTime(0.012 + groza * 0.05 + zagrozenie * 0.05, t, 0.8);
    this.piskGain.gain.setTargetAtTime(this.lagodny ? 0 : Math.max(0, zagrozenie - 0.6) * 0.01, t, 0.3);
    if (jedzie) {
      this.doStukotu -= dt;
      if (this.doStukotu <= 0) {
        this.doStukotu = this.okresStukotu * (0.9 + Math.random() * 0.2);
        const g = tunel ? 0.22 : 0.15;
        this.stuk(g); setTimeout(() => this.stuk(g * 0.9), 140);
      }
    }
    if (zagrozenie > 0.45) {
      this.doSerca -= dt;
      if (this.doSerca <= 0) { this.doSerca = 1.1 - zagrozenie * 0.6; this.serce(0.25 + zagrozenie * 0.3); }
    }
  }
}

// Komunikaty pociągu: gong + syntezator mowy (jeśli przeglądarka ma polski głos) + napisy w grze.
export function powiedz(tekst, { wysokosc = 0.7, tempo = 0.88 } = {}) {
  try {
    const ss = window.speechSynthesis;
    if (!ss) return;
    ss.cancel();
    const u = new SpeechSynthesisUtterance(tekst);
    u.lang = 'pl-PL'; u.pitch = wysokosc; u.rate = tempo; u.volume = 0.9;
    const glos = ss.getVoices().find(v => v.lang && v.lang.toLowerCase().startsWith('pl'));
    if (!glos) return;
    u.voice = glos;
    ss.speak(u);
  } catch { /* bez mowy zostają napisy */ }
}
