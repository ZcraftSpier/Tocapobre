'use strict';
// Minigame do Fliperama: Descida na Neve
// Recebe o kit K do Fliperama (js/minigames.js). Valores que mudam a cada
// quadro (posição da área de jogo, tempo, tremida...) são lidos como K.nome.
Mini.addGame((K) => {
  const { burst, coinArt, drawHero, drawParts, end, flash, hitstop, hud, keys, lerpCol, pill, ring, say, sky, vib } = K;
  // ---------- 9. Descida na Neve ----------
  // Snowboard sem fim: toque para pular, segure no ar para dar mortal e
  // aterrisse reto. Pule pedras e buracos e deslize nos varais de bandeirinha.
  const NEVE_SKY = [['#8fd8ff', '#e8f8ff'], ['#ff9a6b', '#ffd6a5'], ['#2b2466', '#7a5cc4'], ['#ffb3c7', '#fff1d6']];
  return ({
    id: 'neve', n: 'Descida na Neve', ic: '🏂', col: '#bfe6ff', per: 100,
    help: 'Toque para pular. SEGURE no ar para dar um mortal e solte para aterrissar de pé! Mortais dão pontos e velocidade. Pule pedras e buracos e deslize nos varais. (Teclado: espaço)',
    stars: [800, 2500, 6000],
    T(g, x) { return x * 0.32 + 110 * Math.sin(x / 300 + g.p[0]) + 45 * Math.sin(x / 110 + g.p[1]) + 18 * Math.sin(x / 47 + g.p[2]); },
    slope(g, x) { return Math.atan2(this.T(g, x + 4) - this.T(g, x - 4), 8); },
    gapAt(g, x) { return g.gaps.find((q) => x > q.a && x < q.b); },
    start() {
      const g = { p: [rand(0, 6), rand(0, 6), rand(0, 6)], x: 0, y: 0, v: 450, vx: 0, vy: 0, st: 'ground', rot: 0, spin: 0, camX: 0, camY: 0,
        gaps: [], rocks: [], ropes: [], coins: [], nextGap: 2400, nextRock: 900, nextRope: 1600, nextCoin: 700,
        dist: 0, pts: 0, score: 0, got: 0, chain: 0, chainT: 0, boost: 0, dead: 0, rope: null, lastSnow: 0 };
      g.y = this.T(g, 0); g.camY = g.y; g.rot = this.slope(g, 0);
      return g;
    },
    spawn(g) {
      const far = g.x + 2600;
      const free = (a, b) => !g.gaps.some((q) => b > q.a - 150 && a < q.b + 150) && !g.rocks.some((r) => r.x > a - 150 && r.x < b + 150);
      while (g.nextGap < far) { const w = 200 + Math.min(220, g.dist / 250); g.gaps.push({ a: g.nextGap, b: g.nextGap + w }); g.nextGap += w + rand(1700, 3200); }
      while (g.nextRock < far) { if (free(g.nextRock - 40, g.nextRock + 40)) g.rocks.push({ x: g.nextRock, s: rand(0.8, 1.25) }); g.nextRock += rand(650, 1500); }
      while (g.nextRope < far) {
        const a = g.nextRope, b = a + rand(380, 620);
        if (free(a, b)) g.ropes.push({ a, b, ya: this.T(g, a) - 175, yb: this.T(g, b) - 160 });
        g.nextRope += rand(1600, 2800);
      }
      while (g.nextCoin < far) {
        const x0 = g.nextCoin;
        if (!this.gapAt(g, x0) && !this.gapAt(g, x0 + 420)) for (let i = 0; i < 6; i++) { const x = x0 + i * 70; g.coins.push({ x, y: this.T(g, x) - 90 - Math.sin(i / 5 * Math.PI) * 90 }); }
        g.nextCoin += rand(700, 1400);
      }
      const old = g.x - 800;
      g.gaps = g.gaps.filter((q) => q.b > old); g.rocks = g.rocks.filter((r) => r.x > old); g.ropes = g.ropes.filter((r) => r.b > old); g.coins = g.coins.filter((c) => !c.got && c.x > old);
    },
    jump(g) {
      if (g.dead) return;
      if (g.st === 'ground') {
        const a = this.slope(g, g.x);
        g.vx = g.v * Math.cos(a); g.vy = g.v * Math.sin(a) - 980; g.st = 'air'; g.spin = 0; Sfx.whoosh();
        burst(this.sx(g, g.x), g.y - g.camY + 520, 6, ['#ffffff', '#dff1ff'], 220);
      } else if (g.st === 'rope') {
        g.st = 'air'; g.vy = -760; g.spin = 0; g.rope = null; Sfx.whoosh();
      }
    },
    tap(g) { this.jump(g); },
    key(g, k) { if (k === ' ' || k === 'ArrowUp' || k === 'w' || k === 'W') this.jump(g); },
    sx(g, x) { return Math.min(K.VW * 0.3, K.AX + K.AW * 0.3 + 200) + (x - g.camX); },
    trick(g, pts, label) {
      g.chain++; g.chainT = 2;
      const p = pts * g.chain; g.pts += p;
      say(this.sx(g, g.x), g.y - g.camY + 380, `${label} +${p}${g.chain > 1 ? ` (x${g.chain})` : ''}`, '#ffd23f');
    },
    crash(g, why) {
      if (g.dead) return;
      g.dead = 0.001; g.st = 'crash'; K.shake = 0.45; flash('#ffffff', 0.25); hitstop(0.12); vib(120); Sfx.poof(); Sfx.squeak();
      burst(this.sx(g, g.x), g.y - g.camY + 480, 22, ['#ffffff', '#dff1ff', '#ff8fbd'], 520); say(this.sx(g, g.x), g.y - g.camY + 360, why, '#ff6b6b');
    },
    update(g, dt) {
      const hold = (K.ptr && K.ptr.down) || keys.sp;
      g.chainT -= dt; if (g.chainT <= 0 && g.st === 'ground') g.chain = 0;
      g.boost -= dt;
      if (g.dead) {
        g.dead += dt; g.vy += 2200 * dt; g.x += g.vx * 0.4 * dt; g.y = Math.min(g.y + g.vy * dt, this.gapAt(g, g.x) ? g.y + g.vy * dt : this.T(g, g.x)); g.rot += dt * 9;
        if (g.dead > 1.3) return end();
      } else if (g.st === 'ground') {
        const a = this.slope(g, g.x);
        g.v = clamp(g.v + (1500 * Math.sin(a) - 110) * dt + (g.boost > 0 ? 500 * dt : 0), 360, g.boost > 0 ? 1650 : 1350);
        g.x += g.v * Math.cos(a) * dt;
        g.rot = lerp(g.rot, a, Math.min(1, dt * 14));
        if (this.gapAt(g, g.x)) { g.st = 'air'; g.vx = g.v * Math.cos(a); g.vy = g.v * Math.sin(a); g.spin = 0; }
        else g.y = this.T(g, g.x);
        g.lastSnow -= dt; if (g.lastSnow <= 0) { g.lastSnow = 0.05; K.parts.push({ x: this.sx(g, g.x) - 30, y: g.y - g.camY + 520, vx: -g.v * 0.25 + rand(-40, 40), vy: rand(-160, -40), life: 0.5, max: 0.5, r: rand(3, 7), col: '#ffffff', kind: 'dot', sh: 0, rot: 0, vr: 0 }); }
        for (const r of g.rocks) if (!r.hit && Math.abs(r.x - g.x) < 34 * r.s) { r.hit = true; this.crash(g, 'Pedra!'); }
      } else if (g.st === 'rope') {
        const r = g.rope, k = (r.yb - r.ya) / (r.b - r.a), a = Math.atan(k);
        g.v = clamp(g.v + 600 * Math.sin(a) * dt, 420, 1400);
        g.x += g.v * Math.cos(a) * dt; g.y = r.ya + (g.x - r.a) * k; g.rot = a;
        g.pts += Math.round(120 * dt * Math.max(1, g.chain)); g.chainT = 2;
        if (Math.random() < dt * 25) burst(this.sx(g, g.x), g.y - g.camY + 520, 1, ['#ffd23f', '#fff'], 180);
        if (g.x >= r.b) { g.st = 'air'; g.vx = g.v * Math.cos(a); g.vy = -380; g.spin = 0; g.rope = null; this.trick(g, 50, 'Varal!'); }
      } else {
        // no ar
        const py = g.y;
        g.vy += 2200 * dt; g.x += g.vx * dt; g.y += g.vy * dt;
        g.holdT = hold ? (g.holdT || 0) + dt : 0;
        if (g.holdT > 0.15) { const d = 7.5 * dt; g.rot -= d; g.spin += d; }
        else if (!hold) {
          // sem segurar, a prancha vai se alinhando com a ladeira de baixo
          let df = ((this.slope(g, g.x) - g.rot) % TAU + TAU) % TAU; if (df > Math.PI) df -= TAU;
          g.rot += df * Math.min(1, dt * 4);
        }
        for (const r of g.ropes) {
          if (g.vy > 0 && g.x > r.a && g.x < r.b) {
            const ry = r.ya + (g.x - r.a) * (r.yb - r.ya) / (r.b - r.a);
            if (py <= ry + 2 && g.y >= ry) { g.st = 'rope'; g.rope = r; g.y = ry; g.v = Math.max(g.v, Math.hypot(g.vx, g.vy) * 0.8); this.landTricks(g); Sfx.ding(); vib(15); break; }
          }
        }
        if (g.st === 'air') {
          for (const r of g.rocks) if (!r.hit && Math.abs(r.x - g.x) < 26 * r.s && g.y > this.T(g, r.x) - 34 * r.s) { r.hit = true; this.crash(g, 'Pedra!'); }
          const gap = this.gapAt(g, g.x);
          if (gap && g.y > this.T(g, g.x) + 300) this.crash(g, 'Caiu no buraco!');
          else if (!gap && !g.dead && g.vy > 0 && g.y >= this.T(g, g.x)) {
            const a = this.slope(g, g.x);
            let diff = ((g.rot - a) % TAU + TAU) % TAU; if (diff > Math.PI) diff -= TAU;
            g.y = this.T(g, g.x);
            if (Math.abs(diff) > 0.75) this.crash(g, 'Tombo!');
            else {
              g.st = 'ground'; g.rot = a; g.v = clamp(g.vx * Math.cos(a) + g.vy * Math.sin(a), 360, 1650);
              burst(this.sx(g, g.x), g.y - g.camY + 520, 8, ['#ffffff', '#dff1ff'], 260);
              if (Math.abs(diff) < 0.2 && g.spin > 1) say(this.sx(g, g.x), g.y - g.camY + 330, 'Aterrissagem perfeita!', '#9fd3ff');
              this.landTricks(g);
            }
          }
        }
      }
      // moedas
      for (const c of g.coins) if (!c.got && Math.abs(c.x - g.x) < 50 && Math.abs(c.y - (g.y - 60)) < 80) { c.got = true; g.got++; Sfx.coin(); burst(this.sx(g, c.x), c.y - g.camY + 520, 5, ['#ffd23f', '#fff1a8'], 200); }
      // câmera
      g.camX = g.x; g.camY = lerp(g.camY, g.y, Math.min(1, dt * 5));
      g.dist = Math.max(g.dist, g.x);
      g.score = Math.floor(g.dist / 10) + g.pts;
      this.spawn(g);
    },
    landTricks(g) {
      const flips = Math.floor((g.spin + 0.75) / TAU);
      if (flips > 0) {
        this.trick(g, 100 * flips * flips, flips === 1 ? 'Mortal!' : flips === 2 ? 'Mortal duplo!' : `Mortal x${flips}!`);
        g.boost = 1.2 + flips * 0.4; g.v = Math.min(1650, g.v + 220 * flips); Sfx.sparkle(); vib(25 * flips);
        ring(this.sx(g, g.x), g.y - g.camY + 470, '#ffd23f', 120 + flips * 40); if (flips > 1) flash('#fff6c4', 0.2);
      }
      g.spin = 0;
    },
    draw(g) {
      // céu muda com a distância: dia → pôr do sol → noite → amanhecer
      const ph = (g.dist / 9000) % NEVE_SKY.length, i0 = Math.floor(ph), k = ph - i0, n1 = NEVE_SKY[i0], n2 = NEVE_SKY[(i0 + 1) % NEVE_SKY.length];
      sky(lerpCol(n1[0], n2[0], k), lerpCol(n1[1], n2[1], k));
      const night = i0 === 2 ? 1 - Math.max(0, k - 0.7) / 0.3 : i0 === 1 ? Math.max(0, k - 0.6) / 0.4 : 0;
      if (night > 0) { X.globalAlpha = night; for (let i = 0; i < 40; i++) fc(srand(i) * K.VW, srand(i + 4) * 500, 1.5 + srand(i + 8) * 2, '#fff6d0'); X.globalAlpha = 1; }
      fc(K.VW * 0.75, 200, 60, night > 0.5 ? '#fff6d0' : 'rgba(255,243,176,.9)');
      // montanhas ao fundo (parallax)
      const layers = [[0.15, 380, 160, '#c9d8f0', 0], [0.3, 470, 120, '#a9bde0', 3], [0.5, 560, 90, '#8fa6d1', 7]];
      for (const [pf, base, amp, col, sd] of layers) {
        X.beginPath(); X.moveTo(-20, 1020);
        for (let x = -20; x <= K.VW + 40; x += 30) { const wx = (x + g.camX * pf) / 160 + sd; X.lineTo(x, base + Math.sin(wx) * amp * 0.5 + Math.sin(wx * 2.3 + sd) * amp * 0.3 - Math.abs(Math.sin(wx * 0.7)) * amp * 0.6); }
        X.lineTo(K.VW + 40, 1020); X.closePath(); X.fillStyle = night > 0.5 ? shade(col, -0.55) : col; X.fill();
      }
      // pinheiros
      for (let i = -1; i < K.VW / 140 + 2; i++) {
        const id = Math.floor(g.camX * 0.7 / 140) + i, x = id * 140 - g.camX * 0.7 + srand(id) * 60, h = 70 + srand(id + 3) * 60, y = 640 + srand(id + 5) * 40;
        fpoly([x, y - h, x - h * 0.35, y, x + h * 0.35, y], night > 0.5 ? '#24463a' : '#4f8a6a');
      }
      const oy = 520 - g.camY, ox = (wx) => this.sx(g, wx);
      // varais de bandeirinhas
      for (const r of g.ropes) {
        const x1 = ox(r.a), x2 = ox(r.b);
        line(x1, this.T(g, r.a) + oy, x1, r.ya + oy, 6, '#a0754d'); line(x2, this.T(g, r.b) + oy, x2, r.yb + oy, 6, '#a0754d');
        line(x1, r.ya + oy, x2, r.yb + oy, 3, '#5b6474');
        const n = Math.floor((r.b - r.a) / 40);
        for (let j = 0; j < n; j++) { const u = (j + 0.5) / n, x = lerp(x1, x2, u), y = lerp(r.ya, r.yb, u) + oy; fpoly([x - 12, y, x + 12, y, x, y + 22], ['#ff6b6b', '#ffd23f', '#4dabf7', '#7ed957', '#ff7eb6'][j % 5]); }
      }
      // chão de neve (com buracos)
      X.beginPath(); let open2 = false;
      const flush = (xe) => { X.lineTo(xe, 1100); X.closePath(); open2 = false; };
      for (let x = -20; x <= K.VW + 40; x += 12) {
        const wx = g.camX + x - this.sx(g, g.camX), y = this.T(g, wx) + oy, inGap = this.gapAt(g, wx);
        if (inGap) { if (open2) flush(x - 12); continue; }
        if (!open2) { X.moveTo(x, 1100); X.lineTo(x, y); open2 = true; } else X.lineTo(x, y);
      }
      if (open2) flush(K.VW + 40);
      X.fillStyle = LG(0, 300, 0, 1000, '#ffffff', '#dfeaf8'); X.fill(); stroke(4, 'rgba(140,170,210,.6)');
      // pedras
      for (const r of g.rocks) { const x = ox(r.x), y = this.T(g, r.x) + oy; fe(x, y - 14 * r.s, 38 * r.s, 30 * r.s, '#7a8394'); fe(x - 8 * r.s, y - 26 * r.s, 18 * r.s, 10 * r.s, '#ffffff'); }
      for (const c of g.coins) if (!c.got) coinArt(ox(c.x), c.y + oy, 18, K.t + c.x * 0.01);
      // personagem na prancha (gira em torno do meio do corpo)
      const px = ox(g.x), py = g.y + oy;
      if (g.boost > 0 && !g.dead) for (let j = 1; j < 6; j++) { X.globalAlpha = 0.12 * (6 - j); fc(px - j * 26, py - 50, 34 - j * 4, '#ffd23f'); } X.globalAlpha = 1;
      X.save(); X.translate(px, py - 45); X.rotate(g.rot); X.translate(0, 45);
      fr(-58, -6, 116, 12, 6, '#ff5d8f'); fr(-58, -6, 116, 4, 3, 'rgba(255,255,255,.5)');
      drawHero(0, -4, 0.24, { joy: g.st === 'air' && !g.dead });
      X.restore();
      drawParts();
      hud(String(g.score), `$ ${g.got}`);
      if (g.chain > 1) pill(K.VW / 2, 178, 110, 40, `x${g.chain}`, '#ff5f9e');
      if (g.dist < 600 && !g.dead) pill(K.VW / 2, 300, Math.min(K.AW - 40, 520), 48, 'Toque = pular · Segure no ar = mortal', '#4d6fb3');
    },
    reward(g) { return g.got + Math.floor(g.score / this.per); },
  });
});
