// ============================================================================
// SYSTEM AUDIO (Syntezator Web Audio API: 7 broni, kroki, zombie, tło)
// Bufory szumu liczone raz i używane ponownie, wspólny kompresor na wyjściu,
// echo na zewnątrz, stereo dla jęków zombie i ciche tło (wiatr, nocą świerszcze).
// ============================================================================

const GUN_SOUND = {
    pistol:  { duration: 0.24, filter: 1800, osc: 170, gain: 0.45 },
    magnum:  { duration: 0.36, filter: 1400, osc: 125, gain: 0.60 },
    shotgun: { duration: 0.42, filter: 1100, osc: 105, gain: 0.65 },
    smg:     { duration: 0.16, filter: 2600, osc: 210, gain: 0.35 },
    ak47:    { duration: 0.25, filter: 2100, osc: 150, gain: 0.48 },
    sniper:  { duration: 0.55, filter: 950,  osc: 85,  gain: 0.75 },
    minigun: { duration: 0.18, filter: 2300, osc: 165, gain: 0.42 }
};

export class SoundSystem {
    constructor() {
        this.ctx = null;
        this.master = null;
        this.echoSend = null;
        this.noiseBuffers = {};
        this.lastGroan = 0;
        this.indoors = false;
    }

    init() {
        try {
            if (!this.ctx) {
                const AudioCtx = window.AudioContext || window.webkitAudioContext;
                if (!AudioCtx) return;
                this.ctx = new AudioCtx();
                this.buildGraph();
            }
            if (this.ctx.state === 'suspended') this.ctx.resume();
        } catch (e) {}
    }

    buildGraph() {
        const ctx = this.ctx;
        const comp = ctx.createDynamicsCompressor();
        comp.threshold.value = -14;
        comp.knee.value = 10;
        comp.ratio.value = 5;
        comp.attack.value = 0.003;
        comp.release.value = 0.2;
        this.master = ctx.createGain();
        this.master.gain.value = 0.9;
        this.master.connect(comp);
        comp.connect(ctx.destination);

        // Echo odbite od lasu i domów (słychać tylko na zewnątrz)
        const delay = ctx.createDelay(1.0);
        delay.delayTime.value = 0.21;
        const feedback = ctx.createGain();
        feedback.gain.value = 0.28;
        const echoFilter = ctx.createBiquadFilter();
        echoFilter.type = 'lowpass';
        echoFilter.frequency.value = 1300;
        this.echoSend = ctx.createGain();
        this.echoSend.gain.value = 0.3;
        this.echoSend.connect(delay);
        delay.connect(echoFilter);
        echoFilter.connect(feedback);
        feedback.connect(delay);
        echoFilter.connect(this.master);

        // Gotowe bufory szumu dla każdej broni (zamiast liczenia przy każdym strzale)
        for (const [id, s] of Object.entries(GUN_SOUND)) {
            this.noiseBuffers[id] = this.makeNoise(s.duration, 0.08);
        }
        this.stepNoise = this.makeNoise(0.09, 0.02);
        this.windNoise = this.makeNoise(4.0, 0, true);
        this.startAmbience();
    }

    makeNoise(duration, decay, loop = false) {
        const len = Math.floor(this.ctx.sampleRate * duration);
        const buffer = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        let brown = 0;
        for (let i = 0; i < len; i++) {
            const white = Math.random() * 2 - 1;
            if (loop) {
                brown = (brown + 0.02 * white) / 1.02;
                data[i] = brown * 3.5;
            } else {
                data[i] = white * Math.exp(-i / (this.ctx.sampleRate * decay));
            }
        }
        return buffer;
    }

    startAmbience() {
        const ctx = this.ctx;
        const src = ctx.createBufferSource();
        src.buffer = this.windNoise;
        src.loop = true;
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 520;
        this.windGain = ctx.createGain();
        this.windGain.gain.value = 0.10;
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.frequency.value = 0.09;
        lfoGain.gain.value = 0.05;
        lfo.connect(lfoGain);
        lfoGain.connect(this.windGain.gain);
        src.connect(filter);
        filter.connect(this.windGain);
        this.windGain.connect(this.master);
        src.start();
        lfo.start();
        this.nightChirpTimer = 0;
    }

    // Wywoływane co klatkę: tło zależne od pory dnia i tego, czy gracz jest w domku
    updateAmbience(dt, nightBlend, indoors) {
        if (!this.ctx || !this.windGain) return;
        this.indoors = indoors;
        const target = (indoors ? 0.035 : 0.10) * (1 - nightBlend * 0.35);
        this.windGain.gain.setTargetAtTime(target, this.ctx.currentTime, 0.5);
        this.echoSend.gain.setTargetAtTime(indoors ? 0.04 : 0.3, this.ctx.currentTime, 0.2);
        if (nightBlend > 0.6) {
            this.nightChirpTimer -= dt;
            if (this.nightChirpTimer <= 0) {
                this.nightChirpTimer = 0.6 + Math.random() * 1.6;
                this.playCricket(indoors ? 0.25 : 1.0);
            }
        }
    }

    playCricket(vol) {
        const ctx = this.ctx;
        const now = ctx.currentTime;
        const freq = 4200 + Math.random() * 600;
        const pan = ctx.createStereoPanner();
        pan.pan.value = Math.random() * 2 - 1;
        pan.connect(this.master);
        for (let i = 0; i < 3; i++) {
            const t = now + i * 0.055;
            const osc = ctx.createOscillator();
            const g = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.value = freq;
            g.gain.setValueAtTime(0.0001, t);
            g.gain.exponentialRampToValueAtTime(0.012 * vol, t + 0.008);
            g.gain.exponentialRampToValueAtTime(0.0001, t + 0.04);
            osc.connect(g);
            g.connect(pan);
            osc.start(t);
            osc.stop(t + 0.045);
        }
    }

    // vol/pan – strzał innego gracza: ciszej z odległości i z kierunku
    playGunshot(weaponId, vol = 1, pan = 0) {
        try {
            if (!this.ctx) return;
            const ctx = this.ctx;
            const now = ctx.currentTime;
            const s = GUN_SOUND[weaponId] || GUN_SOUND.pistol;
            let out = this.master;
            if (vol !== 1 || pan !== 0) {
                const panner = ctx.createStereoPanner();
                panner.pan.value = Math.max(-1, Math.min(1, pan));
                const g = ctx.createGain();
                g.gain.value = vol;
                g.connect(panner);
                panner.connect(this.master);
                out = g;
            }

            const noise = ctx.createBufferSource();
            noise.buffer = this.noiseBuffers[weaponId] || this.noiseBuffers.pistol;
            noise.playbackRate.value = 0.94 + Math.random() * 0.12;

            const filter = ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(s.filter * 1.6, now);
            filter.frequency.exponentialRampToValueAtTime(s.filter * 0.5, now + s.duration);

            const gain = ctx.createGain();
            gain.gain.setValueAtTime(s.gain, now);
            gain.gain.exponentialRampToValueAtTime(0.008, now + s.duration);

            noise.connect(filter);
            filter.connect(gain);
            gain.connect(out);
            gain.connect(this.echoSend);
            noise.start(now);

            // Niskie „uderzenie” prochu
            const osc = ctx.createOscillator();
            const oscGain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(s.osc, now);
            osc.frequency.exponentialRampToValueAtTime(32, now + 0.14);
            oscGain.gain.setValueAtTime(s.gain * 1.1, now);
            oscGain.gain.exponentialRampToValueAtTime(0.01, now + 0.16);
            osc.connect(oscGain);
            oscGain.connect(out);
            osc.start(now);
            osc.stop(now + 0.17);
        } catch (e) {}
    }

    playFootstep(isIndoors = false, sprint = false) {
        try {
            if (!this.ctx) return;
            const ctx = this.ctx;
            const now = ctx.currentTime;
            const src = ctx.createBufferSource();
            src.buffer = this.stepNoise;
            src.playbackRate.value = 0.8 + Math.random() * 0.4;
            const filter = ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.value = isIndoors ? 420 : 1500 + Math.random() * 700;
            filter.Q.value = isIndoors ? 1.6 : 0.8;
            const gain = ctx.createGain();
            gain.gain.value = (isIndoors ? 0.5 : 0.22) * (sprint ? 1.3 : 1);
            src.connect(filter);
            filter.connect(gain);
            gain.connect(this.master);
            src.start(now);

            if (isIndoors) {
                // Głuchy stuk drewnianej podłogi
                const osc = ctx.createOscillator();
                const g = ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(130, now);
                osc.frequency.exponentialRampToValueAtTime(45, now + 0.07);
                g.gain.setValueAtTime(0.14, now);
                g.gain.exponentialRampToValueAtTime(0.004, now + 0.08);
                osc.connect(g);
                g.connect(this.master);
                osc.start(now);
                osc.stop(now + 0.09);
            }
        } catch (e) {}
    }

    playEmptyClick() {
        try {
            if (!this.ctx) return;
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'square';
            osc.frequency.setValueAtTime(780, now);
            osc.frequency.setValueAtTime(420, now + 0.02);
            gain.gain.setValueAtTime(0.12, now);
            gain.gain.exponentialRampToValueAtTime(0.005, now + 0.05);
            osc.connect(gain);
            gain.connect(this.master);
            osc.start(now);
            osc.stop(now + 0.05);
        } catch (e) {}
    }

    playReload() {
        try {
            if (!this.ctx) return;
            const now = this.ctx.currentTime;
            [0, 0.22].forEach((offset, idx) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(idx === 0 ? 480 : 690, now + offset);
                osc.frequency.setValueAtTime(idx === 0 ? 350 : 910, now + offset + 0.04);
                gain.gain.setValueAtTime(0.16, now + offset);
                gain.gain.exponentialRampToValueAtTime(0.005, now + offset + 0.09);
                osc.connect(gain);
                gain.connect(this.master);
                osc.start(now + offset);
                osc.stop(now + offset + 0.09);
            });
        } catch (e) {}
    }

    playHit(isHeadshot = false) {
        try {
            if (!this.ctx) return;
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = isHeadshot ? 'sine' : 'triangle';
            osc.frequency.setValueAtTime(isHeadshot ? 1150 : 310, now);
            osc.frequency.exponentialRampToValueAtTime(isHeadshot ? 1850 : 110, now + 0.08);
            gain.gain.setValueAtTime(isHeadshot ? 0.3 : 0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.09);
            osc.connect(gain);
            gain.connect(this.master);
            osc.start(now);
            osc.stop(now + 0.09);
        } catch (e) {}
    }

    // Jęk zombie z kierunku (pan -1..1) i odległości (vol 0..1); co najwyżej kilka na sekundę
    playZombieGroan(isTank = false, pan = 0, vol = 1) {
        try {
            if (!this.ctx) return;
            const ctx = this.ctx;
            const now = ctx.currentTime;
            if (now - this.lastGroan < 0.25) return;
            this.lastGroan = now;

            const dur = 0.7 + Math.random() * 0.5;
            const osc = ctx.createOscillator();
            osc.type = 'sawtooth';
            const baseFreq = isTank ? 55 : (85 + Math.random() * 40);
            osc.frequency.setValueAtTime(baseFreq, now);
            osc.frequency.linearRampToValueAtTime(baseFreq * 0.7, now + dur);

            // Drżenie głosu
            const vib = ctx.createOscillator();
            const vibGain = ctx.createGain();
            vib.frequency.value = 5 + Math.random() * 4;
            vibGain.gain.value = baseFreq * 0.06;
            vib.connect(vibGain);
            vibGain.connect(osc.frequency);

            // Formant „ooh/aah”
            const formant = ctx.createBiquadFilter();
            formant.type = 'bandpass';
            formant.frequency.setValueAtTime(isTank ? 320 : 520, now);
            formant.frequency.linearRampToValueAtTime(isTank ? 240 : 380, now + dur);
            formant.Q.value = 2.2;

            const gain = ctx.createGain();
            gain.gain.setValueAtTime(0.0001, now);
            gain.gain.exponentialRampToValueAtTime(0.32 * vol, now + 0.12);
            gain.gain.exponentialRampToValueAtTime(0.003, now + dur);

            const panner = ctx.createStereoPanner();
            panner.pan.value = Math.max(-1, Math.min(1, pan));

            osc.connect(formant);
            formant.connect(gain);
            gain.connect(panner);
            panner.connect(this.master);
            osc.start(now);
            vib.start(now);
            osc.stop(now + dur + 0.05);
            vib.stop(now + dur + 0.05);
        } catch (e) {}
    }

    playPlayerHurt() {
        try {
            if (!this.ctx) return;
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(155, now);
            osc.frequency.exponentialRampToValueAtTime(50, now + 0.22);
            gain.gain.setValueAtTime(0.35, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.24);
            osc.connect(gain);
            gain.connect(this.master);
            osc.start(now);
            osc.stop(now + 0.25);
        } catch (e) {}
    }

    playWaveHorn() {
        try {
            if (!this.ctx) return;
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(112, now);
            osc.frequency.linearRampToValueAtTime(88, now + 1.3);
            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(260, now);
            gain.gain.setValueAtTime(0.01, now);
            gain.gain.linearRampToValueAtTime(0.24, now + 0.28);
            gain.gain.exponentialRampToValueAtTime(0.005, now + 1.4);
            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.master);
            gain.connect(this.echoSend);
            osc.start(now);
            osc.stop(now + 1.45);
        } catch (e) {}
    }

    playCashSound() {
        try {
            if (!this.ctx) return;
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(987.77, now);
            osc.frequency.setValueAtTime(1318.51, now + 0.08);
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.005, now + 0.25);
            osc.connect(gain);
            gain.connect(this.master);
            osc.start(now);
            osc.stop(now + 0.26);
        } catch (e) {}
    }
}

export const audio = new SoundSystem();
