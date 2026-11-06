'use strict';
// Minigame do Fliperama: Torre de Doces
// Uma camada de bolo vai e volta; toque para soltar. O que fica para fora
// cai; acertar em cheio mantém o tamanho (e 3 em cheio seguidos fazem crescer).
Mini.addGame((K) => {
  const { FONT, burst, drawParts, end, flash, hud, pill, ring, say, sideShade, sky, vib, lerpCol } = K;
  // a partir da fase 2 do horror (js/horror.js), algo estranho aparece neste jogo
  const creepy = () => typeof Horror !== 'undefined' && Horror.stage >= 2;
  const LH = 44, BASE_W = 300, BASE_Y = 900;
  const FLAV = [['#ffd6e5', '#ff7eb6'], ['#fff1c4', '#ffd23f'], ['#d6f0ff', '#4dabf7'], ['#e3f7d6', '#7ed957'], ['#efe2ff', '#a77bf3'], ['#ffe3cf', '#ff9f43'], ['#8a5a3c', '#5a3520']];
  const SCALE = [523.25, 587.33, 659.25, 698.46, 783.99, 880, 987.77, 1046.5];
  return ({
    id: 'torre', n: 'Torre de Doces', ic: '🎂', col: '#ffd6e5', per: 3,
    help: 'Toque para soltar a camada de bolo em cima da torre. O que ficar para fora cai! Acertar em cheio mantém o tamanho — e 3 em cheio seguidos fazem a camada crescer.',
    stars: [12, 25, 40],
    start() {
      const g = { layers: [{ x: K.AX + K.AW / 2, w: BASE_W, c: 0 }], cur: null, bits: [], score: 0, combo: 0, cam: 0, over: 0, dir: 1, joyT: 0 };
      this.next(g);
      return g;
    },
    top(g) { return g.layers[g.layers.length - 1]; },
    next(g) {
      const top = this.top(g), n = g.layers.length;
      const dark = creepy() && n > 5 && Math.random() < 0.08;
      g.dir = -g.dir;
      g.cur = { x: g.dir > 0 ? K.AX + top.w / 2 - 60 : K.AX + K.AW - top.w / 2 + 60, w: top.w, c: dark ? 6 : n % 6, dark, sp: Math.min(720, 260 + n * 14) };
    },
    yOf(i) { return BASE_Y - (i + 1) * LH; },
    drop(g) {
      if (g.over || !g.cur) return;
      const top = this.top(g), c = g.cur;
      const a1 = Math.max(c.x - c.w / 2, top.x - top.w / 2), a2 = Math.min(c.x + c.w / 2, top.x + top.w / 2);
      const y = this.yOf(g.layers.length);
      if (a2 - a1 <= 2) {
        // errou tudo: a camada cai e acabou
        g.bits.push({ x: c.x, y, w: c.w, c: c.c, vx: g.dir * 80, vy: 0, rot: 0, vr: g.dir * 2 });
        g.cur = null; g.over = 0.001; K.shake = 0.3; Sfx.drop(0.8); vib(80); say(c.x, y - 60, 'Caiu!', '#ff6b6b');
        return;
      }
      let nx = (a1 + a2) / 2, nw = a2 - a1;
      const perfect = Math.abs(c.x - top.x) < 7;
      if (perfect) {
        nx = top.x; nw = c.w; g.combo++;
        if (g.combo >= 3) nw = Math.min(BASE_W, nw + 14);
        Sfx.note(SCALE[(g.combo - 1) % SCALE.length] * (g.combo > 8 ? 2 : 1)); vib(15);
        ring(nx, y + LH / 2, '#ffffff', nw * 0.6); burst(nx, y + LH / 2, 10, ['#fff', '#ffd23f', FLAV[c.c][1]], 300);
        say(nx, y - 40, g.combo >= 3 ? `Em cheio x${g.combo}!` : 'Em cheio!', '#ffd23f');
        if (g.combo % 5 === 0) flash('#fff6c4', 0.15);
      } else {
        g.combo = 0; Sfx.drop(0.5); vib(8);
        // pedaço que sobrou cai girando
        const cutL = c.x - c.w / 2 < a1, cx = cutL ? (c.x - c.w / 2 + a1) / 2 : (a2 + c.x + c.w / 2) / 2, cw = c.w - nw;
        g.bits.push({ x: cx, y, w: cw, c: c.c, vx: cutL ? -120 : 120, vy: -80, rot: 0, vr: cutL ? -3 : 3 });
      }
      if (c.dark) { Sfx.note(110); say(nx, y - 70, '...', '#c9ced8'); }
      g.layers.push({ x: nx, w: nw, c: c.c, dark: c.dark, sq: 1 });
      g.score = g.layers.length - 1; g.joyT = 0.3;
      this.next(g);
    },
    tap(g) { this.drop(g); },
    key(g, k) { if (k === ' ' || k === 'Enter' || k === 'ArrowDown') this.drop(g); },
    update(g, dt) {
      g.joyT -= dt;
      for (const L of g.layers) if (L.sq) L.sq = Math.max(0, L.sq - dt * 5);
      for (const b of g.bits) { b.vy += 1800 * dt; b.x += b.vx * dt; b.y += b.vy * dt; b.rot += b.vr * dt; }
      g.bits = g.bits.filter((b) => b.y < g.cam + 1300);
      // câmera sobe junto com a torre
      const want = Math.min(0, this.yOf(g.layers.length) - 420);
      g.cam = lerp(g.cam, want, Math.min(1, dt * 4));
      if (g.over) { g.over += dt; if (g.over > 1.3) return end(); return; }
      const c = g.cur; if (!c) return;
      c.x += g.dir * c.sp * dt;
      const L = K.AX + c.w / 2 - 70, R = K.AX + K.AW - c.w / 2 + 70;
      if (c.x > R) { c.x = R; g.dir = -1; } else if (c.x < L) { c.x = L; g.dir = 1; }
    },
    layer(x, y, w, c, dark, sq = 0) {
      const [cream, cake] = FLAV[c];
      X.save(); X.translate(x, y + LH); X.scale(1 + sq * 0.06, 1 - sq * 0.12); X.translate(-x, -(y + LH));
      fr(x - w / 2, y + 6, w, LH - 6, 10, dark ? '#3a1d2a' : cake);
      fr(x - w / 2, y + 6, w, 8, 6, 'rgba(255,255,255,.18)');
      if (!dark) {
        fr(x - w / 2, y, w, 14, 7, cream);
        // gotinhas de cobertura
        for (let i = 0; i < Math.floor(w / 34); i++) { const dx = x - w / 2 + 14 + i * 34; fe(dx, y + 14, 7, 9 + (i % 3) * 3, cream); }
      } else { fc(x, y + LH / 2 + 2, 7, '#e8e2f0'); fc(x, y + LH / 2 + 2, 3, '#05040a'); }
      X.restore();
    },
    draw(g) {
      // o céu vai escurecendo conforme a torre sobe
      const h = clamp(-g.cam / 4000, 0, 1);
      sky(lerpCol('#ffd6e7', '#2b2466', h), lerpCol('#fff7d6', '#7a5cc4', h));
      if (h > 0.3) { X.globalAlpha = h; for (let i = 0; i < 30; i++) fc(srand(i) * K.VW, srand(i + 9) * 900, 1.5 + srand(i + 3) * 2, '#fff6d0'); X.globalAlpha = 1; }
      sideShade();
      X.save(); X.translate(0, -g.cam);
      // prato e mesa
      fr(-20, BASE_Y + 10, K.VW + 40, 400, 0, '#c98a55'); fr(-20, BASE_Y + 10, K.VW + 40, 12, 0, '#a8693a');
      const b0 = g.layers[0];
      fe(b0.x, BASE_Y + 8, BASE_W * 0.7, 18, '#ffffff'); fe(b0.x, BASE_Y + 4, BASE_W * 0.62, 12, '#eef4f9');
      g.layers.forEach((L, i) => { if (i) this.layer(L.x, this.yOf(i - 1), L.w, L.c, L.dark, L.sq); });
      if (g.cur) { const c = g.cur, y = this.yOf(g.layers.length - 1) - 70; this.layer(c.x, y, c.w, c.c, c.dark); X.globalAlpha = 0.25; fr(c.x - c.w / 2, this.yOf(g.layers.length - 1), c.w, 6, 3, '#3a2428'); X.globalAlpha = 1; }
      for (const b of g.bits) { X.save(); X.translate(b.x, b.y + LH / 2); X.rotate(b.rot); X.translate(-b.x, -(b.y + LH / 2)); this.layer(b.x, b.y, b.w, b.c, false); X.restore(); }
      // cereja no topo quando a torre está alta
      if (g.score >= 10) { const T = this.top(g), y = this.yOf(g.layers.length - 2); fc(T.x, y - 6, 12, '#e8283f'); line(T.x, y - 16, T.x + 8, y - 32, 3, '#4ea83c'); }
      X.restore();
      drawParts(g.cam);
      hud(String(g.score));
      if (g.combo >= 3) pill(K.VW / 2, 124, 170, 40, `Em cheio x${g.combo}`, '#ff5f9e');
      if (g.score === 0 && !g.over) pill(K.VW / 2, 300, Math.min(K.AW - 40, 420), 48, 'Toque para soltar o bolo', '#c45b8f');
    },
    reward(g) { return Math.floor(g.score / this.per); },
  });
});
