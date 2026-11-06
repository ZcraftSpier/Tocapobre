'use strict';
// Minigame do Fliperama: Memória Musical
// Recebe o kit K do Fliperama (js/minigames.js). Valores que mudam a cada
// quadro (posição da área de jogo, tempo, tremida...) são lidos como K.nome.
Mini.addGame((K) => {
  const { FONT, burst, drawHero, drawParts, end, flash, hud, pill, ring, say, sideShade, sky, vib } = K;
  // ---------- 4. Memória Musical ----------
  const PADS = [['#ff7eb6', 523.25], ['#ffd23f', 659.25], ['#4dabf7', 783.99], ['#7ed957', 1046.5]];
  return ({
    id: 'memoria', n: 'Memória Musical', ic: '🎵', col: '#c5a3ff', per: 2,
    help: 'Observe a sequência e repita tocando nas carinhas (ou teclas 1 a 4). Seja rápido! A partir da rodada 5 as carinhas trocam de lugar.',
    stars: [6, 10, 14],
    start() { const g = { seq: [], at: 0, phase: 'wait', timer: 0.8, lit: -1, litT: 0, score: 0, sad: 0, joyT: 0, inT: 0, perm: [0, 1, 2, 3], prev: [0, 1, 2, 3], swapT: 0 }; return g; },
    // posição atual de cada carinha (anima a troca de lugar)
    pads(g) {
      const L = this.layout(), k = g.swapT > 0 ? 1 - g.swapT / 0.55 : 1, e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
      return PADS.map((_, i) => { const a = L[g.prev[i]], b = L[g.perm[i]]; return { x: lerp(a.x, b.x, e), y: lerp(a.y, b.y, e) - Math.sin(e * Math.PI) * 60 * (i % 2 ? 1 : -1), s: a.s }; });
    },
    layout() {
      const sz = Math.min(K.AW * 0.42, 250), gap = sz * 0.12, cx = K.AX + K.AW / 2, cy = 560;
      return PADS.map((p, i) => ({ x: cx + (i % 2 ? gap / 2 : -gap / 2 - sz), y: cy + (i > 1 ? gap / 2 : -gap / 2 - sz), s: sz }));
    },
    light(g, i) { g.lit = i; g.litT = 0.32; Sfx.note(PADS[i][1]); },
    update(g, dt) {
      g.litT -= dt; g.joyT -= dt; if (g.litT <= 0) g.lit = -1;
      if (g.swapT > 0) { g.swapT -= dt; if (g.swapT <= 0) g.prev = g.perm.slice(); }
      if (g.phase === 'input') { g.inT += dt; if (g.inT > 3) { g.phase = 'over'; g.timer = 1.1; g.late = true; K.shake = 0.3; Sfx.squeak(); flash('#ff6b6b', 0.2); vib(80); return; } }
      if (g.phase === 'wait') { g.timer -= dt; if (g.timer <= 0 && g.swapT <= 0) { g.seq.push((Math.random() * 4) | 0); g.at = 0; g.phase = 'show'; g.timer = 0.3; } }
      else if (g.phase === 'show') {
        g.timer -= dt;
        if (g.timer <= 0) {
          if (g.at < g.seq.length) { this.light(g, g.seq[g.at]); g.at++; g.timer = Math.max(0.28, 0.6 - g.seq.length * 0.025); }
          else if (g.lit < 0) { g.phase = 'input'; g.at = 0; g.inT = 0; }
        }
      } else if (g.phase === 'over') { g.timer -= dt; if (g.timer <= 0) return end(); }
    },
    press(g, i) {
      if (g.phase !== 'input') return;
      this.light(g, i); g.inT = 0;
      const P = this.pads(g)[i], cx = P.x + P.s / 2, cy = P.y + P.s / 2;
      if (g.seq[g.at] !== i) { g.phase = 'over'; g.timer = 1.1; g.sad = i + 1; K.shake = 0.3; Sfx.squeak(); flash('#ff6b6b', 0.2); vib(80); return; }
      g.at++; burst(cx, cy, 6, [PADS[i][0], '#fff'], 260); ring(cx, cy, PADS[i][0], P.s * 0.6); vib(10);
      if (g.at >= g.seq.length) {
        g.score = g.seq.length; g.phase = 'wait'; g.timer = 0.9; g.joyT = 0.8; say(K.AX + K.AW / 2, 250, 'Isso!', '#7ed957'); setTimeout(() => K.open && Sfx.ding(), 250);
        if (g.score % 5 === 0) { flash('#fff6c4', 0.25); burst(K.AX + K.AW / 2, 560, 30, ['#ff7eb6', '#ffd23f', '#4dabf7', '#7ed957'], 650); say(K.AX + K.AW / 2, 320, `Rodada ${g.score}! 🎉`, '#ffd23f'); Sfx.sparkle(); vib(40); }
        if (g.score >= 5 && Math.random() < 0.6) {
          // troca duas carinhas de lugar
          const a = (Math.random() * 4) | 0, b = (a + 1 + ((Math.random() * 3) | 0)) % 4;
          g.prev = g.perm.slice(); [g.perm[a], g.perm[b]] = [g.perm[b], g.perm[a]]; g.swapT = 0.55; g.timer = 0.6;
          setTimeout(() => K.open && Sfx.whoosh(), 700);
        }
      }
    },
    tap(g, x, y) { if (g.swapT > 0) return; this.pads(g).forEach((p, i) => { if (x > p.x && x < p.x + p.s && y > p.y && y < p.y + p.s) this.press(g, i); }); },
    key(g, k) { const n = parseInt(k, 10); if (n >= 1 && n <= 4) this.press(g, n - 1); },
    draw(g) {
      sky('#e6dbff', '#ffe6f2');
      for (let i = 0; i < 14; i++) { X.globalAlpha = 0.25; X.font = FONT(600, 30 + srand(i) * 30); X.fillStyle = '#a77bf3'; X.fillText(i % 2 ? '♪' : '♫', srand(i + 1) * K.VW, ((srand(i + 2) * 1000 - K.t * 30 * (1 + srand(i))) % 1000 + 1000) % 1000); }
      X.globalAlpha = 1;
      sideShade();
      this.pads(g).forEach((p, i) => {
        const on = g.lit === i, col = PADS[i][0], bad = g.sad === i + 1;
        X.save(); X.translate(p.x + p.s / 2, p.y + p.s / 2); const k = on ? 1.06 : 1; X.scale(k, k);
        fr(-p.s / 2, -p.s / 2 + 10, p.s, p.s, p.s * 0.22, shade(col, -0.25));
        fr(-p.s / 2, -p.s / 2, p.s, p.s, p.s * 0.22, on ? shade(col, 0.3) : col);
        RR(-p.s / 2, -p.s / 2, p.s, p.s, p.s * 0.22); stroke(5, 'rgba(58,36,40,.7)');
        if (on) { X.globalAlpha = 0.5; fr(-p.s / 2 - 10, -p.s / 2 - 10, p.s + 20, p.s + 20, p.s * 0.26, alpha(col, 0.4)); X.globalAlpha = 1; }
        const e = p.s * 0.14, LN = '#2a1d1a';
        if (on && !bad) { X.beginPath(); X.arc(-e, -4, 9, 1.1 * Math.PI, 1.9 * Math.PI); stroke(5, LN); X.beginPath(); X.arc(e, -4, 9, 1.1 * Math.PI, 1.9 * Math.PI); stroke(5, LN); }
        else { fe(-e, -6, 7, 9, LN); fe(e, -6, 7, 9, LN); }
        fe(-e * 1.7, 14, 12, 7, 'rgba(255,100,110,.35)'); fe(e * 1.7, 14, 12, 7, 'rgba(255,100,110,.35)');
        X.beginPath();
        if (bad) X.arc(0, 30, 12, 1.15 * Math.PI, 1.85 * Math.PI); else if (on) { X.arc(0, 14, 16, 0, Math.PI); X.closePath(); X.fillStyle = '#7a2b3a'; X.fill(); X.beginPath(); X.arc(0, 14, 16, 0, Math.PI); }
        else X.arc(0, 14, 11, 0.15 * Math.PI, 0.85 * Math.PI);
        stroke(4.5, LN);
        X.font = FONT(700, 26); X.textAlign = 'center'; X.fillStyle = 'rgba(255,255,255,.75)'; X.fillText(String(i + 1), p.s / 2 - 26, p.s / 2 - 18);
        X.restore();
      });
      const msg = g.phase === 'show' || g.phase === 'wait' ? (g.swapT > 0 ? 'Trocaram de lugar!' : 'Preste atenção...') : g.phase === 'input' ? 'Sua vez!' : g.late ? 'Tempo!' : 'Ah não!';
      pill(K.AX + K.AW / 2, 210, 320, 56, msg, '#7a4fd0');
      if (g.phase === 'input') { const w = 260, k = Math.max(0, 1 - g.inT / 3); fr(K.AX + K.AW / 2 - w / 2, 250, w, 12, 6, 'rgba(255,255,255,.6)'); fr(K.AX + K.AW / 2 - w / 2, 250, w * k, 12, 6, k < 0.35 ? '#ff6b6b' : '#a77bf3'); }
      drawHero(K.AX + K.AW - 70, 990, 0.24, { joy: g.joyT > 0, flip: true });
      drawParts();
      hud(String(g.score));
    },
    reward(g) { return g.score; },
  });
});
