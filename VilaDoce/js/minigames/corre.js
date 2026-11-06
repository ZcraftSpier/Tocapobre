'use strict';
// Minigame do Fliperama: Corre-Corre
// Recebe o kit K do Fliperama (js/minigames.js). Valores que mudam a cada
// quadro (posição da área de jogo, tempo, tremida...) são lidos como K.nome.
Mini.addGame((K) => {
  // a partir da fase 2 do horror (js/horror.js), algo estranho aparece neste jogo
  const creepy = () => typeof Horror !== 'undefined' && Horror.stage >= 2;
  const { burst, cloudArt, coinArt, drawHero, drawParts, end, flash, hitstop, hud, ring, say, sideShade, sky, vib } = K;
  // ---------- 5. Corre-Corre ----------
  const OBST = [['cone', 56, 74], ['caixa', 84, 84], ['caixa2', 84, 160], ['banco', 150, 62], ['hidrante', 56, 92], ['poca', 130, 12]];
  return ({
    id: 'corre', n: 'Corre-Corre', ic: '🏃', col: '#8fdc7a', per: 25,
    help: 'Toque ou aperte espaço para pular (dá para pular duas vezes). Passarinhos voam baixo: fique no chão para passar por baixo! O escudo aguenta uma batida.',
    stars: [80, 220, 450],
    start() { return { y: 0, vy: 0, jumps: 0, sp: 520, dist: 0, obs: [], coins: [], ups: [], nextO: 700, got: 0, score: 0, dead: 0, shield: false, inv: 0, streak: 0 }; },
    jump(g) {
      if (g.dead) return;
      if (g.jumps < 2) { g.vy = g.jumps ? -1000 : -1180; g.jumps++; Sfx.boing(); if (g.jumps === 2) burst(K.AX + 180, 860 + g.y, 6, ['#fff', '#e3f4ff'], 200); }
    },
    tap(g) { this.jump(g); },
    key(g, k) { if (k === ' ' || k === 'ArrowUp' || k === 'w' || k === 'W') this.jump(g); },
    update(g, dt) {
      if (g.dead) { g.dead += dt; g.vy += 3000 * dt; g.y = Math.min(0, g.y + g.vy * dt); if (g.dead > 1) return end(); return; }
      g.sp = Math.min(1150, 520 + g.dist / 40); g.dist += g.sp * dt; g.score = Math.floor(g.dist / 100); g.inv -= dt;
      g.vy += 3000 * dt; g.y += g.vy * dt; if (g.y >= 0) { g.y = 0; g.vy = 0; g.jumps = 0; }
      const hx = K.AX + 180;
      g.nextO -= g.sp * dt;
      if (g.nextO <= 0) {
        const pool = g.dist < 2500 ? OBST.filter((o) => o[0] !== 'caixa2') : OBST, o = g.dist > 1800 && Math.random() < 0.22 ? ['passaro', 90, 0] : pick(pool);
        g.obs.push({ k: o[0], w: o[1], h: o[2], x: K.AX + K.AW + 100, ph: rand(0, 6) });
        if (!g.shield && g.dist > 1200 && Math.random() < 0.07) g.ups.push({ x: K.AX + K.AW + 100 + o[1] + rand(200, 300), y: 700 });
        if (o[0] === 'passaro') for (let i = 0; i < 4; i++) g.coins.push({ x: K.AX + K.AW + 100 + i * 60, y: 815 }); // moedas no chão, por baixo do passarinho
        else if (Math.random() < 0.55) for (let i = 0; i < 5; i++) g.coins.push({ x: K.AX + K.AW + 100 + o[1] / 2 + (i - 2) * 60, y: 860 - o[2] - 110 - Math.sin(i / 4 * Math.PI) * 90 });
        else if (Math.random() < 0.5) for (let i = 0; i < 4; i++) g.coins.push({ x: K.AX + K.AW + 420 + i * 60, y: 820 });
        g.nextO = rand(420, 760) * (g.sp / 520) * 0.8;
      }
      for (const o of g.obs) { o.x -= g.sp * dt * (o.k === 'passaro' ? 1.25 : 1); o.ph += dt * 14; }
      for (const u of g.ups) u.x -= g.sp * dt;
      g.ups = g.ups.filter((u) => !u.got && u.x > K.AX - 100);
      for (const c of g.coins) c.x -= g.sp * dt;
      g.obs = g.obs.filter((o) => o.x + o.w > K.AX - 200);
      g.coins = g.coins.filter((c) => !c.got && c.x > K.AX - 100);
      const feet = 860 + g.y;
      for (const c of g.coins) if (Math.abs(c.x - hx) < 50 && c.y > feet - 150 && c.y < feet + 20) {
        c.got = true; g.got++; g.streak++; Sfx.coin(); burst(c.x, c.y, 6, ['#ffd23f', '#fff1a8']);
        if (g.streak % 10 === 0) { g.got += 5; say(hx, feet - 200, `+5 sequência!`, '#ffd23f'); Sfx.ding(); ring(hx, feet - 60, '#ffd23f', 120); vib(20); }
      }
      // moeda que passou sem ser pega quebra a sequência
      for (const c of g.coins) if (!c.got && !c.miss && c.x < hx - 60) { c.miss = true; g.streak = 0; }
      for (const u of g.ups) if (Math.abs(u.x - hx) < 60 && Math.abs(u.y - (feet - 60)) < 90) { u.got = true; g.shield = true; Sfx.sparkle(); flash('#9fd3ff', 0.2); say(hx, feet - 200, 'Escudo!', '#9fd3ff'); ring(hx, feet - 60, '#4dabf7', 130); vib(20); }
      for (const o of g.obs) {
        if (o.k === 'poca' || o.hit) continue;
        const hitBox = o.k === 'passaro'
          ? hx + 24 > o.x + 12 && hx - 24 < o.x + o.w - 12 && feet - 112 < 735 && feet > 690
          : hx + 24 > o.x + 8 && hx - 24 < o.x + o.w - 8 && feet > 860 - o.h + 10;
        if (!hitBox || g.inv > 0) continue;
        if (g.shield) {
          g.shield = false; g.inv = 1; o.hit = true; K.shake = 0.3; Sfx.knock(); flash('#9fd3ff', 0.25); hitstop(0.08); vib(60);
          burst(hx + 30, feet - 60, 16, ['#9fd3ff', '#fff', '#4dabf7'], 480); ring(hx, feet - 60, '#4dabf7', 150); say(hx, feet - 180, 'Ufa!', '#9fd3ff');
          continue;
        }
        g.dead = 0.001; g.vy = -900; K.shake = 0.4; Sfx.poof(); say(hx, feet - 180, 'Ai!', '#ff6b6b'); burst(hx, feet - 60, 12, ['#ff8fbd', '#ffd23f', '#fff'], 420);
        hitstop(0.12); flash('#ff6b6b', 0.25); vib(120);
      }
      for (const o of g.obs) if (o.k === 'poca' && !o.sp && g.y === 0 && hx > o.x && hx < o.x + o.w) { o.sp = 1; Sfx.splash(); burst(hx, 856, 10, ['#7fc8f8', '#bfe6ff'], 300); }
    },
    draw(g) {
      sky('#8fd8ff', '#e8f8ff');
      const d = g.dist;
      for (let i = 0; i < 4; i++) { X.globalAlpha = 0.7; cloudArt(((srand(i) * (K.VW + 400) - d * 0.08) % (K.VW + 400) + K.VW + 400) % (K.VW + 400) - 200, 120 + i * 70, 150 + srand(i + 2) * 80); X.globalAlpha = 1; }
      // casinhas ao fundo
      const HC = ['#ffb199', '#ffcf5c', '#9fb2ff', '#ff9ec4', '#6fd6c8', '#c5a3ff'];
      for (let i = -1; i < K.VW / 230 + 2; i++) {
        const id = Math.floor(d * 0.3 / 230) + i, x = id * 230 - d * 0.3, hh = 160 + srand(id) * 120, col = HC[((id % 6) + 6) % 6];
        fr(x + 20, 760 - hh, 170, hh + 20, 10, col); fpoly([x + 8, 770 - hh, x + 105, 690 - hh, x + 202, 770 - hh], shade(col, -0.25));
        for (let j = 0; j < 2; j++) {
          // horror: um rosto pálido numa janela (sempre a mesma casa enquanto ela passa)
          const face = creepy() && srand(id * 7 + j + 31) > 0.95, wx = x + 45 + j * 75, wy = 800 - hh;
          fr(wx, wy, 44, 40, 6, face ? '#1d1b24' : '#fff8e1');
          if (face) { fc(wx + 22, wy + 22, 10, '#d8d6de'); fc(wx + 18, wy + 20, 2, '#05040a'); fc(wx + 26, wy + 20, 2, '#05040a'); }
        }
      }
      // árvores
      for (let i = -1; i < K.VW / 300 + 2; i++) {
        const id = Math.floor(d * 0.6 / 300) + i, x = id * 300 - d * 0.6 + srand(id + 7) * 100;
        fr(x - 9, 730, 18, 80, 6, '#a0714a'); fc(x, 710, 52, '#6ac46a'); fc(x - 28, 730, 34, '#5cb85c'); fc(x + 30, 728, 36, '#5cb85c');
      }
      fr(0, 800, K.VW, 60, 0, '#d9d2c5'); for (let i = -1; i < K.VW / 80 + 2; i++) fr(i * 80 - (d % 80), 800, 4, 60, 0, '#c8c0b2');
      fr(0, 860, K.VW, 140, 0, '#8fdc7a'); fr(0, 860, K.VW, 10, 0, '#78c766');
      for (const o of g.obs) {
        const x = o.x, b = 860;
        if (o.k === 'cone') { fpoly([x + 10, b, x + 46, b, x + 32, b - 74, x + 24, b - 74], '#ff7a2f'); fr(x + 15, b - 44, 26, 12, 3, '#fff'); fr(x + 2, b - 8, 52, 10, 4, '#e45c17'); }
        else if (o.k === 'caixa' || o.k === 'caixa2') {
          for (let j = 0; j < (o.k === 'caixa2' ? 2 : 1); j++) { const y = b - 84 - j * 78; fr(x, y, 84, 84, 8, '#d9a066'); RR(x, y, 84, 84, 8); stroke(4, 'rgba(58,36,40,.7)'); line(x + 10, y + 10, x + 74, y + 74, 4, '#b07a43'); line(x + 74, y + 10, x + 10, y + 74, 4, '#b07a43'); }
        } else if (o.k === 'banco') { fr(x, b - 62, 150, 16, 6, '#c47a45'); fr(x, b - 40, 150, 10, 5, '#a8643a'); fr(x + 12, b - 46, 12, 46, 3, '#5b6474'); fr(x + 126, b - 46, 12, 46, 3, '#5b6474'); }
        else if (o.k === 'hidrante') { fr(x + 8, b - 78, 40, 78, 12, '#ec3f45'); fe(x + 28, b - 80, 22, 14, '#c92f35'); fr(x, b - 54, 56, 14, 6, '#c92f35'); fr(x + 4, b - 6, 48, 8, 3, '#a6262b'); }
        else if (o.k === 'poca') fe(x + o.w / 2, b + 6, o.w / 2, 12, 'rgba(90,170,230,.75)');
        else if (o.k === 'passaro') {
          const y = 712, cx = x + o.w / 2;
          X.save(); X.translate(cx, y); X.scale(-1, 1); if (o.hit) X.globalAlpha = 0.4;
          fe(0, 0, 34, 22, '#ff9f43'); fc(26, -10, 15, '#ff9f43'); fpoly([38, -12, 54, -7, 38, -2], '#ffd23f'); fc(30, -13, 3.5, '#2a1d1a');
          fe(-4, -6 - Math.sin(o.ph) * 16, 24, 10, '#e8822a', -0.3 - Math.sin(o.ph) * 0.5);
          X.restore(); X.globalAlpha = 1;
          // sombra no chão avisa por onde ele passa
          fe(cx, 858, 40, 8, 'rgba(0,0,0,.12)');
        }
      }
      for (const u of g.ups) { const yy = u.y + Math.sin(K.t * 4) * 8; fc(u.x, yy, 34, 'rgba(159,211,255,.45)'); fpoly([u.x - 20, yy - 22, u.x + 20, yy - 22, u.x + 20, yy + 2, u.x, yy + 24, u.x - 20, yy + 2], '#4dabf7'); fpoly([u.x - 12, yy - 14, u.x, yy - 14, u.x, yy + 12, u.x - 12, yy + 2], '#9fd3ff'); }
      for (const c of g.coins) coinArt(c.x, c.y, 18, K.t + c.x * 0.01);
      sideShade();
      const air = g.y < -2;
      softShadow(K.AX + 180, 862, 50 + g.y * 0.05, 0.25);
      if (g.inv > 0 && Math.sin(K.t * 40) > 0) X.globalAlpha = 0.4;
      drawHero(K.AX + 180, 860 + g.y, 0.3, { run: !air && !g.dead, joy: air && !g.dead, rot: g.dead ? -0.5 : 0 });
      X.globalAlpha = 1;
      if (g.shield) { X.globalAlpha = 0.35 + 0.1 * Math.sin(K.t * 6); fe(K.AX + 180, 860 + g.y - 60, 70, 85, '#9fd3ff'); X.globalAlpha = 1; X.beginPath(); X.ellipse(K.AX + 180, 860 + g.y - 60, 70, 85, 0, 0, TAU); stroke(4, 'rgba(77,171,247,.8)'); }
      // linhas de velocidade
      if (g.sp > 800) { X.globalAlpha = (g.sp - 800) / 700; for (let i = 0; i < 8; i++) { const y = 120 + srand(i) * 600, x = ((srand(i + 3) * K.VW - K.t * 2400) % K.VW + K.VW) % K.VW; line(x, y, x + 120, y, 3, 'rgba(255,255,255,.7)'); } X.globalAlpha = 1; }
      drawParts();
      hud(`${g.score} m`, `$ ${g.got}`);
    },
    reward(g) { return g.got + Math.floor(g.score / this.per); },
  });
});
