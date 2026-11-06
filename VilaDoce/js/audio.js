'use strict';
// ======================================================
//  Áudio sintetizado com WebAudio (sem arquivos externos)
//  Efeitos com timbres suaves (kalimba, marimba, sinos, madeira),
//  leve reverberação, variação a cada toque e música composta.
// ======================================================
const Sfx = (() => {
  let ac = null, out = null, bus = null, muted = false, voices = true, musicTimer = null, step = 0, nbuf = null;
  // contexto/destino em uso (permite renderizar offline para testes)
  let TC = null, TB = null;
  const A = () => TC || ac;
  const B = () => TB || bus;
  const now = () => A().currentTime;

  function unlock() {
    try {
      if (!ac) {
        ac = new (window.AudioContext || window.webkitAudioContext)();
        out = ac.createGain(); out.gain.value = 0.55;
        const comp = ac.createDynamicsCompressor();
        comp.threshold.value = -18; comp.ratio.value = 3;
        out.connect(comp); comp.connect(ac.destination);
        bus = makeBus(ac, out);
      }
      if (ac.state === 'suspended') ac.resume();
    } catch (e) { /* sem áudio */ }
  }
  // barramento de efeitos: seco + envio para reverberação curta e macia
  function makeBus(a, dest) {
    const dry = a.createGain(); dry.gain.value = 1;
    const tone = a.createBiquadFilter(); tone.type = 'lowpass'; tone.frequency.value = 6500; tone.Q.value = 0.4;
    dry.connect(tone); tone.connect(dest);
    const wet = a.createGain(); wet.gain.value = 1;
    const conv = a.createConvolver();
    const len = Math.floor(a.sampleRate * 1.3), ir = a.createBuffer(2, len, a.sampleRate);
    for (let c = 0; c < 2; c++) {
      const d = ir.getChannelData(c);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3.2);
    }
    conv.buffer = ir;
    const wlp = a.createBiquadFilter(); wlp.type = 'lowpass'; wlp.frequency.value = 3500;
    const wg = a.createGain(); wg.gain.value = 0.35;
    wet.connect(conv); conv.connect(wlp); wlp.connect(wg); wg.connect(dest);
    return { dry, wet };
  }
  const ok = () => !muted && A() && B();
  const vary = (k = 0.04) => 1 + (Math.random() * 2 - 1) * k;
  // saída de um som: ganho com envelope ligado ao seco e à reverberação
  function voiceOut(t, att, peak, dec, wet = 0.2) {
    const a = A(), g = a.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(peak, t + att);
    g.gain.setTargetAtTime(0, t + att, dec / 4);
    g.connect(B().dry);
    if (wet > 0) { const s = a.createGain(); s.gain.value = wet; g.connect(s); s.connect(B().wet); }
    return g;
  }
  function osc(type, f, t, end, dest) {
    const o = A().createOscillator();
    if (typeof type === 'string') o.type = type; else o.setPeriodicWave(type);
    o.frequency.setValueAtTime(f, t);
    o.connect(dest); o.start(t); o.stop(end);
    return o;
  }
  // ---------- instrumentos ----------
  // kalimba/marimba: fundamental + parcial agudo que some rápido
  function pluck(f, { t = 0, v = 0.12, dec = 0.35, bright = 0.5, partial = 4, wet = 0.22 } = {}) {
    if (!ok()) return;
    const st = now() + t;
    const g = voiceOut(st, 0.004, v, dec, wet);
    osc('sine', f, st, st + dec * 1.3, g);
    if (bright > 0) {
      const g2 = A().createGain(); g2.gain.setValueAtTime(bright * 0.45, st); g2.gain.setTargetAtTime(0, st, dec * 0.06);
      g2.connect(g); osc('sine', f * partial, st, st + dec * 0.6, g2);
    }
  }
  // sino suave (parciais inarmônicos)
  function chime(f, { t = 0, v = 0.08, dec = 1, wet = 0.35 } = {}) {
    if (!ok()) return;
    const st = now() + t, g = voiceOut(st, 0.003, v, dec, wet);
    osc('sine', f, st, st + dec * 1.3, g);
    [[2.76, 0.28], [5.4, 0.1]].forEach(([r, k]) => {
      const g2 = A().createGain(); g2.gain.setValueAtTime(k, st); g2.gain.setTargetAtTime(0, st, dec * 0.12);
      g2.connect(g); osc('sine', f * r, st, st + dec * 0.8, g2);
    });
  }
  // tom com glissando (usado com moderação)
  function glide(f1, f2, dur, { t = 0, v = 0.1, type = 'sine', wet = 0.15, att = 0.008 } = {}) {
    if (!ok()) return;
    const st = now() + t, g = voiceOut(st, att, v, dur, wet);
    const o = osc(type, f1, st, st + dur * 1.4, g);
    o.frequency.exponentialRampToValueAtTime(Math.max(20, f2), st + dur);
  }
  function noiseBuf(a) {
    if (a === ac && nbuf) return nbuf;
    const b = a.createBuffer(1, a.sampleRate * 2, a.sampleRate), ch = b.getChannelData(0);
    for (let i = 0; i < ch.length; i++) ch[i] = Math.random() * 2 - 1;
    if (a === ac) nbuf = b;
    return b;
  }
  // ruído filtrado com varredura opcional de frequência
  function hiss(dur, { t = 0, v = 0.08, type = 'lowpass', f = 1200, f2 = null, q = 0.7, att = 0.005, wet = 0.15 } = {}) {
    if (!ok()) return;
    const a = A(), st = now() + t;
    const s = a.createBufferSource(); s.buffer = noiseBuf(a);
    const fl = a.createBiquadFilter(); fl.type = type; fl.Q.value = q;
    fl.frequency.setValueAtTime(f, st);
    if (f2) fl.frequency.exponentialRampToValueAtTime(f2, st + dur);
    const g = voiceOut(st, att, v, dur, wet);
    s.connect(fl); fl.connect(g);
    s.start(st, Math.random() * 1.2); s.stop(st + dur * 1.5 + 0.05);
  }
  // violão por síntese Karplus-Strong (corda dedilhada realista)
  const ksCache = new Map();
  function ksBuffer(a, f) {
    const key = a.sampleRate + ':' + Math.round(f);
    if (ksCache.has(key)) return ksCache.get(key);
    const sr = a.sampleRate, n = Math.floor(sr * 1.6), p = Math.max(2, Math.round(sr / f));
    const b = a.createBuffer(1, n, sr), d = b.getChannelData(0), ring = new Float32Array(p);
    for (let i = 0; i < p; i++) ring[i] = Math.random() * 2 - 1;
    // excitação suavizada (menos "chiado" no ataque da corda)
    for (let pass = 0; pass < 4; pass++) for (let i = 0; i < p; i++) ring[i] = (ring[i] + ring[(i + 1) % p] + ring[(i + p - 1) % p]) / 3;
    let mx = 0; for (let i = 0; i < p; i++) mx = Math.max(mx, Math.abs(ring[i])); for (let i = 0; i < p; i++) ring[i] /= mx || 1;
    let prev = 0;
    for (let i = 0; i < n; i++) {
      const j = i % p, x = ring[j];
      d[i] = x;
      const y = 0.497 * (x + prev);
      prev = x; ring[j] = y;
    }
    ksCache.set(key, b);
    return b;
  }
  function string(f, { t = 0, v = 0.16 } = {}) {
    if (!ok()) return;
    const a = A(), st = now() + t, s = a.createBufferSource(); s.buffer = ksBuffer(a, f);
    const lp = a.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1800; lp.Q.value = 0.5;
    const g = voiceOut(st, 0.004, v, 1.4, 0.3);
    s.connect(lp); lp.connect(g); s.start(st); s.stop(st + 1.6);
  }
  // vozes de bichos: fonte vocal suave + formantes que deslizam entre vogais
  const FORM = { a: [800, 1250, 2600], e: [500, 1900, 2650], i: [320, 2300, 3000], o: [520, 900, 2450], u: [360, 780, 2300] };
  const glottal = new WeakMap();
  function glottalWave(a) {
    let w = glottal.get(a);
    if (w) return w;
    const n = 28, re = new Float32Array(n), im = new Float32Array(n);
    for (let k = 1; k < n; k++) im[k] = 1 / Math.pow(k, 1.55);
    w = a.createPeriodicWave(re, im);
    glottal.set(a, w);
    return w;
  }
  function creature(vowels, f0a, f0b, dur, { t = 0, v = 0.1, shift = 1, vib = 0, wet = 0.15, mid = null } = {}) {
    if (!ok()) return;
    const a = A(), st = now() + t, g = voiceOut(st, 0.015, v, dur, wet);
    const o = a.createOscillator(); o.setPeriodicWave(glottalWave(a));
    o.frequency.setValueAtTime(f0a, st);
    if (mid) o.frequency.linearRampToValueAtTime(mid, st + dur * 0.45);
    o.frequency.linearRampToValueAtTime(f0b, st + dur);
    if (vib) { const l = a.createOscillator(), lg = a.createGain(); l.frequency.value = vib; lg.gain.value = f0a * 0.04; l.connect(lg); lg.connect(o.frequency); l.start(st); l.stop(st + dur * 1.3); }
    for (let k = 0; k < 2; k++) {
      const bp = a.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = k ? 8 : 5;
      vowels.forEach((vw, i) => { const fr = FORM[vw][k] * shift, tt = st + (dur * i) / Math.max(1, vowels.length - 1); i ? bp.frequency.linearRampToValueAtTime(fr, tt) : bp.frequency.setValueAtTime(fr, tt); });
      const gg = a.createGain(); gg.gain.value = k ? 2.4 : 2;
      o.connect(bp); bp.connect(gg); gg.connect(g);
    }
    o.start(st); o.stop(st + dur * 1.3);
  }
  // ---------- instrumentos de desenho animado ----------
  // apito de êmbolo (slide whistle): seno puro com vibrato
  function whistle(f1, f2, dur, { t = 0, v = 0.05, vib = 7, wet = 0.2 } = {}) {
    if (!ok()) return;
    const a = A(), st = now() + t, g = voiceOut(st, 0.03, v, dur, wet);
    const o = osc('sine', f1, st, st + dur * 1.4, g); o.frequency.exponentialRampToValueAtTime(f2, st + dur);
    const l = a.createOscillator(), lg = a.createGain(); l.frequency.value = vib; lg.gain.value = f1 * 0.025;
    l.connect(lg); lg.connect(o.frequency); l.start(st); l.stop(st + dur * 1.4);
  }
  // "bloop" de borracha: tom arredondado que sobe e balança
  function rubber(f1, f2, dur, { t = 0, v = 0.1, wob = 22, wet = 0.12 } = {}) {
    if (!ok()) return;
    const a = A(), st = now() + t, g = voiceOut(st, 0.006, v, dur, wet);
    const lp = a.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1800; lp.connect(g);
    const o = osc('triangle', f1, st, st + dur * 1.4, lp); o.frequency.exponentialRampToValueAtTime(f2, st + dur * 0.6);
    const l = a.createOscillator(), lg = a.createGain(); l.frequency.value = wob; lg.gain.setValueAtTime(f2 * 0.08, st); lg.gain.exponentialRampToValueAtTime(1, st + dur);
    l.connect(lg); lg.connect(o.frequency); l.start(st); l.stop(st + dur * 1.4);
  }
  // tuba (baixo de fanfarra)
  function tuba(f, { t = 0, v = 0.08, dur = 0.22 } = {}) {
    if (!ok()) return;
    const a = A(), st = now() + t, g = voiceOut(st, 0.02, v, dur, 0.1);
    const lp = a.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 520; lp.Q.value = 1.2; lp.connect(g);
    osc('triangle', f, st, st + dur * 1.5, lp); osc('sine', f / 2, st, st + dur * 1.5, lp);
  }
  // bloco de madeira (tique-taque)
  function wood(f, { t = 0, v = 0.05 } = {}) { pluck(f, { t, v, dec: 0.05, bright: 0.9, partial: 2.3, wet: 0.08 }); }
  const PENTA = [523.25, 587.33, 659.25, 783.99, 880, 1046.5, 1174.66, 1318.51, 1567.98];
  // evita empilhar o mesmo som várias vezes no mesmo instante
  const lastAt = {};
  function once(name, gap = 0.04) {
    const a = A(); if (!a) return false;
    if (TC) return true;
    const tt = a.currentTime;
    if (lastAt[name] && tt - lastAt[name] < gap) return false;
    lastAt[name] = tt; return true;
  }

  // ---------- voz por formantes (conversas) — mantida como estava ----------
  let vbus = null;
  const VOWEL_OF = {
    a: 'a', á: 'a', à: 'a', â: 'a', ã: 'a', h: 'a', k: 'a', r: 'a',
    e: 'e', é: 'e', ê: 'e', b: 'e', c: 'e', ç: 'e', d: 'e', f: 'e', g: 'e', l: 'e', m: 'e', n: 'e', p: 'e', s: 'e', t: 'e', v: 'e', z: 'e',
    i: 'i', í: 'i', j: 'i', x: 'i', y: 'i',
    o: 'o', ó: 'o', ô: 'o', õ: 'o',
    u: 'u', ú: 'u', q: 'u', w: 'u',
  };
  const PLOSIVE = 'bcdgkpqt', FRICATIVE = 'fhjsvxzç';
  function makeVoiceBus(a, dest) {
    const g = a.createGain(); g.gain.value = 0.55;
    const hp = a.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 140;
    const lp = a.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 4200; lp.Q.value = 0.5;
    g.connect(hp); hp.connect(lp); lp.connect(dest);
    return g;
  }
  function voiceLine(a, dest, text, pitch, t0) {
    const letters = [...text.toLowerCase()];
    const syl = letters.filter((c) => VOWEL_OF[c] || /[0-9]/.test(c)).length;
    const stp = syl > 34 ? 0.05 : 0.06;
    const ask = /\?\s*$/.test(text), excl = text.includes('!');
    const f0 = 245 * pitch * (excl ? 1.06 : 1);
    const shift = 1.32 * Math.pow(pitch, 0.3);
    const vol = (excl ? 0.55 : 0.45) * 0.5 / Math.sqrt(pitch);
    let t = t0, n = 0;
    for (const ch of letters) {
      if (ch === ' ') { t += 0.035; continue; }
      if ('.,;…'.includes(ch)) { t += 0.13; continue; }
      if ('!?'.includes(ch)) { t += 0.1; continue; }
      const v = VOWEL_OF[ch] || (/[0-9]/.test(ch) ? 'o' : null);
      if (!v || n >= 40) continue;
      n++;
      const prog = n / Math.max(1, syl);
      let f = f0 * (1 + (Math.random() - 0.5) * 0.09) * (1 - prog * 0.08);
      if (ask && prog > 0.7) f *= 1 + (prog - 0.7) * 0.9;
      const isVowel = 'aeiouáàâãéêíóôõú'.includes(ch);
      const onset = !isVowel && (PLOSIVE.includes(ch) || FRICATIVE.includes(ch)) ? (PLOSIVE.includes(ch) ? 0.012 : 0.026) : 0;
      if (onset) {
        const s = a.createBufferSource(); s.buffer = noiseBuf(a);
        const bf = a.createBiquadFilter(); bf.type = PLOSIVE.includes(ch) ? 'highpass' : 'bandpass';
        bf.frequency.value = PLOSIVE.includes(ch) ? 2200 : 5200; bf.Q.value = 0.8;
        const ng = a.createGain();
        ng.gain.setValueAtTime(0, t); ng.gain.linearRampToValueAtTime(PLOSIVE.includes(ch) ? 0.05 : 0.03, t + 0.004); ng.gain.linearRampToValueAtTime(0, t + onset + 0.01);
        s.connect(bf); bf.connect(ng); ng.connect(dest);
        s.start(t, Math.random() * 0.4); s.stop(t + onset + 0.02);
      }
      const st = t + onset * 0.6, dur = 0.085;
      const o = a.createOscillator(); o.setPeriodicWave(glottalWave(a));
      o.frequency.setValueAtTime(f, st); o.frequency.linearRampToValueAtTime(f * 0.95, st + dur);
      const vib = a.createOscillator(), vg = a.createGain(); vib.frequency.value = 7; vg.gain.value = f * 0.012;
      vib.connect(vg); vg.connect(o.frequency);
      const env = a.createGain();
      env.gain.setValueAtTime(0, st);
      env.gain.linearRampToValueAtTime(vol, st + 0.014);
      env.gain.setValueAtTime(vol, st + dur - 0.03);
      env.gain.linearRampToValueAtTime(0, st + dur);
      const fm = FORM[v];
      [[fm[0], 5, 1], [fm[1], 9, 0.55], [fm[2], 12, 0.22]].forEach(([ff, q, gg], i) => {
        const bp = a.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = q;
        const target = ff * shift;
        if (i === 1 && !isVowel) { bp.frequency.setValueAtTime(target * 0.78, st); bp.frequency.linearRampToValueAtTime(target, st + 0.025); }
        else bp.frequency.value = target;
        const g = a.createGain(); g.gain.value = gg * (i === 0 ? 2.2 : 3.2);
        o.connect(bp); bp.connect(g); g.connect(env);
      });
      env.connect(dest);
      o.start(st); vib.start(st); o.stop(st + dur + 0.02); vib.stop(st + dur + 0.02);
      t += stp;
    }
    return t - t0;
  }

  // ---------- música composta (não aleatória) ----------
  // notas por nome → frequência
  const NOTE = (n) => { const m = { C: -9, D: -7, E: -5, F: -4, G: -2, A: 0, B: 2 }; const o = +n.slice(-1), s = n.length === 3 ? (n[1] === '#' ? 1 : -1) : 0; return 440 * Math.pow(2, (m[n[0]] + s + (o - 4) * 12) / 12); };
  // acordes: [fundamental, quinta, nota, nota]
  const SONGS = {
    // marchinha de desenho animado: tuba "pom-pá", pizzicato, bloco de madeira
    pop: {
      beat: 200, steps: 8,
      chords: [['C3', 'G2', 'E4', 'G4'], ['G2', 'D3', 'B3', 'D4'], ['A2', 'E3', 'C4', 'E4'], ['F2', 'C3', 'A3', 'C4'], ['C3', 'G2', 'E4', 'G4'], ['F2', 'C3', 'A3', 'C4'], ['G2', 'D3', 'B3', 'D4'], ['C3', 'G2', 'E4', 'G4']],
      mel: [
        ['C5', null, 'E5', 'G5', 'E5', null, 'C5', null], ['D5', null, 'G5', 'B5', 'A5', 'G5', null, null],
        ['C5', null, 'E5', 'A5', 'G5', 'E5', 'C5', null], ['A4', 'C5', 'F5', null, 'E5', 'D5', null, null],
        ['E5', 'E5', 'G5', null, 'C6', null, 'B5', 'A5'], ['A5', null, 'F5', 'A5', 'G5', null, 'F5', null],
        ['D5', 'E5', 'F5', 'G5', 'A5', 'B5', 'D6', null], ['C6', null, 'G5', null, 'C5', null, null, null],
      ],
    },
    // vaneira animada (2/4) em lá menor: baixo, gaita e pandeiro
    gaucho: {
      beat: 165, steps: 8,
      chords: [['A2', 'E3', 'C4', 'E4'], ['D3', 'A2', 'F4', 'A4'], ['G2', 'D3', 'B3', 'D4'], ['C3', 'G2', 'E4', 'G4'], ['F2', 'C3', 'A3', 'C4'], ['D3', 'A2', 'F4', 'A4'], ['E2', 'B2', 'G#3', 'B3'], ['A2', 'E3', 'C4', 'E4']],
      mel: [
        ['E5', null, 'A5', 'C6', 'B5', 'A5', 'E5', null], ['F5', null, 'A5', 'D6', 'C6', 'A5', 'F5', null],
        ['D5', 'G5', 'B5', null, 'A5', 'G5', 'D5', null], ['E5', 'G5', 'C6', null, 'B5', 'G5', 'E5', null],
        ['A5', null, 'C6', 'A5', 'F5', null, 'A5', 'C6'], ['D6', null, 'C6', 'A5', 'F5', null, 'D5', null],
        ['G#5', null, 'B5', 'E6', 'D6', 'B5', 'G#5', null], ['A5', null, 'E5', null, 'A4', null, null, null],
      ],
    },
  };
  let detune = 0, style = null, rainSrc = null, rainGain = null, reedWave = null;
  function reed(f, { t = 0, v = 0.03, dur = 0.2 } = {}) {
    if (!ok()) return;
    const a = A(), st = now() + t;
    if (!reedWave) { const n = 14, re = new Float32Array(n), im = new Float32Array(n); for (let k = 1; k < n; k++) im[k] = (k % 2 ? 1 : 0.55) / k; reedWave = a.createPeriodicWave(re, im); }
    const g = voiceOut(st, 0.03, v, dur * 1.6, 0.2);
    const lp = a.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1700; lp.connect(g);
    osc(reedWave, f, st, st + dur * 2, lp); osc(reedWave, f * 1.004, st, st + dur * 2, lp);
  }
  function tick() {
    const NT = (n) => NOTE(n) * (detune ? 1 + (Math.random() - 0.5) * detune : 1);
    if (muted || !ac || !style) { step++; return; }
    const S = SONGS[style], n = S.steps, bar = Math.floor(step / n), s = step % n;
    const ch = S.chords[bar % S.chords.length], mel = S.mel[bar % S.mel.length];
    if (style === 'pop') {
      if (s === 0) tuba(NT(ch[0]), { v: 0.05 });
      if (s === 4) tuba(NT(ch[1]), { v: 0.045 });
      if (s === 2 || s === 6) ch.slice(2).forEach((x, i) => pluck(NT(x), { t: i * 0.01, v: 0.03, dec: 0.12, bright: 0.3, wet: 0.1 }));
      if (s % 2 === 1) wood(s % 4 === 1 ? 900 : 1250, { v: 0.022 });
      if (mel[s]) pluck(NT(mel[s]), { v: 0.065, dec: 0.3, bright: 0.55, partial: 3.9, wet: 0.25 });
      if (bar % 8 === 7 && s === 5) whistle(600, 1200, 0.3, { v: 0.018 });
    } else {
      if (s === 0 || s === 4) { pluck(NT(s ? ch[1] : ch[0]), { v: 0.1, dec: 0.3, bright: 0.15 }); rubber(120, 70, 0.08, { v: 0.04, wob: 6, wet: 0 }); }
      if (s === 2 || s === 6 || s === 7) ch.slice(2).forEach((x) => reed(NT(x), { v: s === 7 ? 0.007 : 0.011, dur: 0.09 }));
      if (s % 2 === 1) hiss(0.035, { v: 0.014, type: 'bandpass', f: 5200, q: 1.5, wet: 0 });
      if (mel[s]) reed(NT(mel[s]), { v: 0.022, dur: 0.15 });
    }
    step++;
  }

  const api = {
    unlock,
    // pegar: personagem diz "uííí!", pet faz um barulhinho, objeto faz "bloop" de borracha
    pick(e) {
      if (!once('pick', 0.08)) return;
      if (e && e.kind === 'char') {
        const p = (typeof Chat !== 'undefined' ? Chat.voiceOf(e) : 1) * vary(0.05);
        creature(['u', 'i', 'i'], 330 * p, 620 * p, 0.26, { v: 0.07, shift: 1.3 * Math.pow(p, 0.3), mid: 520 * p });
        whistle(500 * p, 1100 * p, 0.22, { t: 0.02, v: 0.02 });
      } else if (e && e.type === 'pet') {
        if (e.species === 'dog') creature(['a', 'i'], 620, 760, 0.1, { v: 0.07, shift: 1.15 });
        else if (e.species === 'cat') creature(['i', 'a'], 600, 700, 0.16, { v: 0.12, shift: 1.15 });
        else creature(['i'], 1100, 1400, 0.08, { v: 0.05, shift: 1.6 });
      } else rubber(260 * vary(0.08), 620 * vary(0.05), 0.16, { v: 0.09 });
    },
    // soltar: "plof" de borracha; queda alta de personagem faz "uff!"
    drop(k = 0.6, e) {
      if (!once('drop', 0.07)) return;
      k = clamp(k, 0.15, 1);
      rubber(300 * vary(0.06), 95, 0.13, { v: 0.16 * k, wob: 30, wet: 0.05 });
      hiss(0.05, { v: 0.035 * k, f: 260, wet: 0 });
      if (e && e.kind === 'char' && k > 0.55) { const p = typeof Chat !== 'undefined' ? Chat.voiceOf(e) : 1; creature(['u', 'o'], 300 * p, 210 * p, 0.14, { t: 0.04, v: 0.07, shift: 1.2 }); }
      else if (k > 0.75) wood(520 * vary(0.08), { t: 0.05, v: 0.04 });
    },
    // mola grande: "boiiing"
    boing() {
      if (!once('boing', 0.12) || !ok()) return;
      const a = A(), st = now(), g = voiceOut(st, 0.005, 0.11, 0.6, 0.15);
      const o = osc('triangle', 130 * vary(0.05), st, st + 0.8, g); o.frequency.exponentialRampToValueAtTime(320, st + 0.5);
      const l = a.createOscillator(), lg = a.createGain(); l.frequency.value = 19; lg.gain.setValueAtTime(70, st); lg.gain.exponentialRampToValueAtTime(2, st + 0.6);
      l.connect(lg); lg.connect(o.frequency); l.start(st); l.stop(st + 0.8);
    },
    // "nham nham nham"
    munch() {
      if (!once('munch', 0.3)) return;
      for (let i = 0; i < 3; i++) { const t = i * 0.14; creature(['a', 'u'], 280 + i * 15, 230, 0.09, { t, v: 0.06, shift: 1.1 }); hiss(0.04, { t: t + 0.05, v: 0.035, type: 'bandpass', f: rand(1000, 1500), q: 1.2, wet: 0 }); }
    },
    // "glub glub"
    gulp() { for (let i = 0; i < 2; i++) { rubber(420 * vary(), 160, 0.1, { t: i * 0.16, v: 0.09, wob: 12 }); glide(500, 900, 0.04, { t: i * 0.16 + 0.08, v: 0.02 }); } },
    // "hmmm!" + brilho
    yum() { creature(['u', 'u', 'a'], 280, 420, 0.4, { v: 0.07, shift: 1.15, mid: 260 }); ['E6', 'G6', 'C7'].forEach((n, i) => chime(NOTE(n), { t: 0.3 + i * 0.06, v: 0.025, dec: 0.6 })); },
    sparkle() { if (!once('sparkle', 0.08)) return; const ns = PENTA.slice(4).sort(() => Math.random() - 0.5).slice(0, 4); ns.forEach((f, i) => chime(f, { t: i * 0.045, v: 0.035, dec: 0.6, wet: 0.45 })); whistle(1200, 2400, 0.18, { v: 0.012 }); },
    giggle() { if (!once('giggle', 0.25)) return; for (let i = 0; i < 5; i++) creature(['i', 'e'], 520 + i * 30 + rand(0, 40), 600 + i * 35, 0.065, { t: i * 0.08, v: 0.065, shift: 1.35 }); },
    click() { if (!once('click', 0.03)) return; wood(1150 * vary(0.06), { v: 0.04 }); },
    // porta: "nhééc" + toc
    door() { whistle(260, 330, 0.25, { v: 0.018, vib: 18 }); wood(240 * vary(), { t: 0.18, v: 0.1 }); },
    // "pwof!" de fumacinha
    poof() { if (!once('poof', 0.1)) return; hiss(0.3, { v: 0.09, f: 2200, f2: 300, att: 0.01, wet: 0.25 }); rubber(500, 180, 0.12, { v: 0.05 }); },
    // viagem: apito de desenho subindo "fiiiu!"
    whoosh() { if (!once('whoosh', 0.2)) return; whistle(420, 1300, 0.35, { v: 0.045 }); hiss(0.35, { v: 0.03, type: 'bandpass', f: 500, f2: 1600, q: 0.8, att: 0.1, wet: 0.2 }); },
    // "splóóóch" + bolhas
    splash() {
      if (!once('splash', 0.2)) return;
      rubber(700, 160, 0.18, { v: 0.08, wob: 14 });
      hiss(0.35, { v: 0.08, f: 2200, f2: 500, att: 0.01, wet: 0.2 });
      for (let i = 0; i < 5; i++) rubber(rand(380, 520), rand(900, 1300), 0.06, { t: 0.12 + i * 0.07 + Math.random() * 0.03, v: 0.03, wob: 30 });
    },
    note(f) { pluck(f, { v: 0.09, dec: 0.55, bright: 0.45, wet: 0.3 }); chime(f * 2, { v: 0.02, dec: 0.5 }); },
    ding() { chime(1318 * vary(0.01), { v: 0.09, dec: 1.4 }); chime(1975, { t: 0.12, v: 0.04, dec: 1 }); },
    // rolha de desenho: "plóc!"
    pop() { if (!once('pop', 0.06)) return; glide(950 * vary(0.06), 200, 0.06, { v: 0.12, wet: 0.08 }); wood(700, { t: 0.01, v: 0.03 }); },
    chirp() { whistle(1700, 2500, 0.08, { v: 0.04, vib: 30 }); whistle(1900, 2700, 0.08, { t: 0.11, v: 0.035, vib: 30 }); },
    // patinho de borracha: "kuí-kuí"
    squeak() { for (let i = 0; i < 2; i++) creature(['i', 'u'], 820, 700, 0.1, { t: i * 0.14, v: 0.12, shift: 1.35 }); },
    brew() { for (let i = 0; i < 8; i++) rubber(rand(200, 320), rand(500, 700), 0.07, { t: i * 0.12 + Math.random() * 0.05, v: 0.035, wob: 18 }); hiss(1, { v: 0.03, f: 500, att: 0.1 }); },
    strum() {
      const ch = pick([['C3', 'E3', 'G3', 'C4', 'E4'], ['A2', 'E3', 'A3', 'C4', 'E4'], ['G2', 'B2', 'D3', 'G3', 'B3'], ['F2', 'C3', 'F3', 'A3', 'C4']]);
      ch.forEach((n, i) => string(NOTE(n), { t: i * 0.028, v: 0.1 }));
    },
    beep() { pluck(1568, { v: 0.045, dec: 0.07, bright: 0.1, wet: 0.05 }); pluck(2093, { t: 0.07, v: 0.035, dec: 0.08, bright: 0.1, wet: 0.05 }); },
    // "ca-tchim!"
    coin() { if (!once('coin', 0.08)) return; wood(900, { v: 0.04 }); chime(1319, { t: 0.05, v: 0.06, dec: 0.5 }); chime(1760, { t: 0.11, v: 0.06, dec: 0.9 }); },
    chalk() { for (let i = 0; i < 3; i++) hiss(0.06, { t: i * 0.07, v: 0.025, type: 'bandpass', f: rand(2800, 3600), q: 3, wet: 0 }); },
    bell() { chime(880, { v: 0.09, dec: 1.6 }); chime(1320, { t: 0.01, v: 0.04, dec: 1.2 }); },
    // caranguejo: "tic-tic" de pinça
    pinch() { wood(1500, { v: 0.05 }); wood(1700, { t: 0.08, v: 0.05 }); },
    // piano: frase curta e alegre, nunca igual
    piano() {
      if (!once('piano', 0.4)) return;
      const phrases = [['C5', 'E5', 'G5', 'C6'], ['G4', 'C5', 'E5', 'D5', 'C5'], ['E5', 'D5', 'C5', 'D5', 'E5', 'E5', 'E5'], ['C5', 'G5', 'A5', 'G5'], ['F5', 'E5', 'D5', 'C5']];
      pick(phrases).forEach((n, i) => { pluck(NOTE(n), { t: i * 0.16, v: 0.08, dec: 0.9, bright: 0.25, partial: 2, wet: 0.3 }); pluck(NOTE(n) / 2, { t: i * 0.16, v: 0.03, dec: 0.7, bright: 0.1, partial: 2 }); });
    },
    xylo() { ['C5', 'D5', 'E5', 'G5', 'A5', 'C6'].forEach((n, i) => pluck(NOTE(n), { t: i * 0.09, v: 0.08, dec: 0.6, bright: 0.5, partial: 3.9, wet: 0.3 })); },
    wave() { hiss(1.6, { v: 0.05, f: 350, f2: 900, att: 0.6, wet: 0.2 }); },
    // bichos estilo desenho
    bark() { if (!once('bark', 0.3)) return; const p = vary(0.08); creature(['a', 'o'], 520 * p, 360 * p, 0.1, { v: 0.1, shift: 1.05 }); creature(['a', 'o'], 560 * p, 380 * p, 0.1, { t: 0.15, v: 0.1, shift: 1.05 }); },
    meow() { if (!once('meow', 0.35)) return; const p = vary(0.06); creature(['i', 'a', 'o', 'u'], 620 * p, 480 * p, 0.55, { v: 0.08, shift: 1.25, vib: 6, mid: 880 * p }); },
    moo() { creature(['u', 'o', 'o', 'u'], 175, 105, 1.1, { v: 0.12, shift: 0.72, vib: 5.5, mid: 160 }); },
    cluck() { if (!once('cluck', 0.5)) return; for (let i = 0; i < 3; i++) creature(['o', 'a'], 620, 560, 0.06, { t: i * 0.11, v: 0.05, shift: 1.15 }); creature(['a', 'o'], 760, 900, 0.2, { t: 0.36, v: 0.06, shift: 1.2, mid: 1000 }); },
    neigh() { creature(['i', 'e', 'a'], 760, 420, 0.75, { v: 0.15, shift: 1, vib: 14 }); hiss(0.18, { t: 0.78, v: 0.05, f: 900, wet: 0.1 }); },
    // trator: "put-put-put" + buzina "fom-fom!"
    tractor() {
      if (!once('tractor', 0.6)) return;
      for (let i = 0; i < 7; i++) { rubber(110, 70, 0.07, { t: i * 0.11, v: 0.07, wob: 8, wet: 0 }); hiss(0.05, { t: i * 0.11, v: 0.035, f: 220, wet: 0 }); }
      tuba(392, { t: 0.8, v: 0.06, dur: 0.12 }); tuba(392, { t: 0.98, v: 0.06, dur: 0.16 });
    },
    bloop() { if (!once('bloop', 0.08)) return; rubber(260 * vary(0.08), 700, 0.12, { v: 0.08, wob: 26, wet: 0.3 }); },
    knock() { for (const t of [0, 0.16]) wood(200, { t, v: 0.14 }); },
    // "ta-dá!" de fanfarra
    cooked() { tuba(NOTE('G3'), { v: 0.04, dur: 0.12 }); tuba(NOTE('C4'), { t: 0.14, v: 0.045, dur: 0.4 }); ['C5', 'E5', 'G5'].forEach((n) => pluck(NOTE(n), { t: 0.14, v: 0.04, dec: 0.6, bright: 0.3 })); ['G6', 'C7'].forEach((n, i) => chime(NOTE(n), { t: 0.3 + i * 0.07, v: 0.025, dec: 0.8 })); },
    sticker() { ['C5', 'E5', 'G5', 'C6'].forEach((n, i) => pluck(NOTE(n), { t: i * 0.07, v: 0.07, dec: 0.5, bright: 0.5, wet: 0.35 })); whistle(1000, 2000, 0.2, { t: 0.26, v: 0.015 }); [1568, 2093].forEach((f, i) => chime(f, { t: 0.32 + i * 0.06, v: 0.03, dec: 1 })); },
    // "fiuuuuu... POW!"
    firework() { whistle(500, 1700, 0.65, { v: 0.03, vib: 9 }); hiss(0.9, { t: 0.65, v: 0.12, f: 900, f2: 120, wet: 0.4 }); rubber(220, 60, 0.3, { t: 0.65, v: 0.08, wob: 10 }); for (let i = 0; i < 8; i++) hiss(0.02, { t: 0.85 + Math.random() * 0.6, v: 0.025, type: 'highpass', f: 4000, wet: 0.2 }); },
    // voz "animalês" das conversas
    speak(text, pitch = 1) {
      if (muted || !ac || !voices) return;
      if (!vbus) vbus = makeVoiceBus(ac, out);
      voiceLine(ac, vbus, text, pitch, ac.currentTime + 0.02);
    },
    _voiceLine: (...a) => voiceLine(...a),
    _makeVoiceBus: (...a) => makeVoiceBus(...a),
    // testes: renderiza um efeito num contexto offline
    _offline(a, dest, fn) { const pt = TC, pb = TB; TC = a; TB = makeBus(a, dest); try { fn(); } finally { TC = pt; TB = pb; } },
    setVoices(v) { voices = v; },
    setDetune(d) { detune = d; },
    get voices() { return voices; },
    setMuted(m) { muted = m; },
    get muted() { return muted; },
    // music('pop' | 'gaucho' | null)
    music(st) {
      if (st === true) st = 'pop';
      if (st === style) return;
      if (musicTimer) { clearInterval(musicTimer); musicTimer = null; }
      style = st || null;
      if (style) { step = 0; musicTimer = setInterval(tick, SONGS[style].beat); }
    },
    get musicStyle() { return style; },
    // chuva contínua (ruído suave): nível 0..1
    rain(level) {
      if (!ac) return;
      if (!rainSrc) {
        rainSrc = ac.createBufferSource(); rainSrc.buffer = noiseBuf(ac); rainSrc.loop = true;
        const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1100;
        const hp = ac.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 250;
        rainGain = ac.createGain(); rainGain.gain.value = 0;
        rainSrc.connect(hp); hp.connect(lp); lp.connect(rainGain); rainGain.connect(out); rainSrc.start();
      }
      rainGain.gain.setTargetAtTime(muted ? 0 : level * 0.06, ac.currentTime, 0.6);
    },
  };
  return api;
})();
