'use strict';
// Minigame do Fliperama: Estoura Balão
// Recebe o kit K do Fliperama (js/minigames.js). Valores que mudam a cada
// quadro (posição da área de jogo, tempo, tremida...) são lidos como K.nome.
Mini.addGame((K) => {
  const { FONT, burst, cloudArt, drawHero, drawParts, end, flash, hitstop, hud, pill, ring, say, sideShade, sky, starPath, vib } = K;
  // ---------- 3. Estoura Balão ----------
  const BCOLS = ['#ff5d8f', '#4dabf7', '#7ed957', '#ffd23f', '#a77bf3', '#ff9f43'];
  return ({
    id: 'baloes', n: 'Estoura Balão', ic: '🎈', col: '#ff9ec4', per: 10,
    help: 'Estoure balões em sequência para multiplicar os pontos! O balão de confete estoura todos em volta, o relógio dá +5s. Cuidado com as nuvens de chuva!',
    stars: [40, 90, 160],
    mult(g) { return Math.min(5, 1 + Math.floor(g.chain / 5)); },
    start() { return { bs: [], spawnT: 0, time: 45, score: 0, el: 0, joyT: 0, chain: 0, chainT: 0 }; },
    update(g, dt) {
      g.el += dt; g.time -= dt; g.joyT -= dt;
      g.chainT -= dt; if (g.chainT <= 0 && g.chain) { if (g.chain >= 10) say(K.AX + K.AW / 2, 300, `Sequência de ${g.chain}!`, '#ffd23f'); g.chain = 0; }
      const lvl = Math.min(1, g.el / 40);
      g.spawnT -= dt;
      if (g.spawnT <= 0) {
        g.spawnT = lerp(0.75, 0.32, lvl);
        const r = Math.random();
        g.bs.push({ x: K.AX + rand(60, K.AW - 60), y: 1100, vy: lerp(170, 360, lvl) * rand(0.85, 1.25), ph: rand(0, TAU), s: rand(0.85, 1.15),
          k: r < 0.15 + lvl * 0.1 ? 'chuva' : r > 0.95 ? 'ouro' : r > 0.91 ? 'confete' : r > 0.885 ? 'relogio' : 'n', col: pick(BCOLS) });
      }
      for (const b of g.bs) { b.y -= b.vy * dt; b.x += Math.sin(K.t * 2 + b.ph) * 30 * dt; }
      g.bs = g.bs.filter((b) => b.y > -160 && !b.pop);
      if (g.time <= 0) { g.time = 0; return end(); }
    },
    popB(g, b, blast) {
      if (b.pop) return;
      b.pop = true;
      const cy = b.y - 52 * b.s;
      if (b.k === 'chuva') {
        if (blast) { burst(b.x, cy, 8, ['#8a96a8', '#c9ced8'], 300); return; } // explosão de confete desfaz as nuvens sem castigo
        g.time = Math.max(0, g.time - 5); g.chain = 0; K.shake = 0.35; Sfx.poof(); burst(b.x, cy, 12, ['#8a96a8', '#4dabf7'], 420); say(b.x, b.y - 90, '-5s', '#9fd3ff'); flash('#4d6080', 0.2); vib(70);
        return;
      }
      g.chain++; g.chainT = 0.9;
      const m = this.mult(g), p = (b.k === 'ouro' ? 5 : 1) * m;
      g.score += p; g.joyT = 0.3; Sfx.pop(); vib(8);
      burst(b.x, cy, 12, b.k === 'ouro' ? ['#ffd23f', '#fff1a8'] : [b.col, '#fff']); say(b.x, b.y - 90, '+' + p, m > 1 ? '#ffd23f' : '#fff');
      if (b.k === 'ouro') { Sfx.sparkle(); ring(b.x, cy, '#ffd23f'); }
      if (b.k === 'relogio') { g.time += 5; Sfx.ding(); say(b.x, b.y - 140, '+5s', '#7ed957'); ring(b.x, cy, '#7ed957'); }
      if (b.k === 'confete') {
        Sfx.poof(); Sfx.sparkle(); hitstop(0.07); flash('#ffffff', 0.2); K.shake = 0.25; vib(50);
        ring(b.x, cy, '#ff8fbd', 280); burst(b.x, cy, 30, ['#ff6b6b', '#ffd23f', '#4dabf7', '#7ed957', '#ff7eb6'], 650);
        for (const o of g.bs) if (!o.pop && Math.hypot(o.x - b.x, o.y - b.y) < 280) this.popB(g, o, true);
      }
    },
    tap(g, x, y) {
      for (let i = g.bs.length - 1; i >= 0; i--) {
        const b = g.bs[i];
        if (Math.hypot((x - b.x) / (44 * b.s), (y - (b.y - 52 * b.s)) / (56 * b.s)) < 1.15) { this.popB(g, b, false); return; }
      }
    },
    draw(g) {
      sky('#ffd6e7', '#fff7d6');
      for (let i = 0; i < 5; i++) { X.globalAlpha = 0.6; cloudArt(((srand(i) * K.VW + K.t * 14 * (i + 1)) % (K.VW + 300)) - 150, 140 + i * 130, 160 + srand(i + 4) * 90); X.globalAlpha = 1; }
      fr(0, 930, K.VW, 70, 0, '#8fdc7a');
      sideShade();
      for (const b of g.bs) {
        X.save(); X.translate(b.x, b.y); X.scale(b.s, b.s);
        X.beginPath(); X.moveTo(0, 0); X.bezierCurveTo(10, 30, -10, 60, 0, 90); stroke(2.5, '#9aa0aa');
        if (b.k === 'chuva') {
          cloudArt(0, -30, 120, '#8a96a8', '#6f7b8e');
          fc(-16, -52, 4.5, '#2a2430'); fc(16, -52, 4.5, '#2a2430'); line(-26, -64, -10, -58, 3, '#2a2430'); line(26, -64, 10, -58, 3, '#2a2430');
          fpoly([4, -20, -10, 6, 2, 6, -6, 30, 16, -2, 4, -2, 12, -20], '#ffd23f');
        } else {
          const col = b.k === 'ouro' ? '#ffc21a' : b.k === 'confete' ? '#ff5f9e' : b.k === 'relogio' ? '#7ed957' : b.col;
          fpoly([-7, 4, 7, 4, 0, -6], shade(col, -0.2));
          fe(0, -52, 42, 52, RG(-14, -72, 4, 60, shade(col, 0.35), col, shade(col, -0.2)));
          X.beginPath(); X.ellipse(0, -52, 42, 52, 0, 0, TAU); stroke(3, 'rgba(58,36,40,.35)');
          fe(-16, -72, 8, 15, 'rgba(255,255,255,.45)', 0.4);
          if (b.k === 'ouro') { starPath(0, -52, 16, 7); X.fillStyle = '#fff6c4'; X.fill(); }
          if (b.k === 'confete') { for (let i = 0; i < 9; i++) fc(-26 + srand(i) * 52, -86 + srand(i + 5) * 66, 5, ['#ff6b6b', '#ffd23f', '#4dabf7', '#7ed957'][i % 4]); X.font = FONT(700, 30); X.textAlign = 'center'; X.fillStyle = '#fff'; X.fillText('💥', 0, -40); }
          if (b.k === 'relogio') { fc(0, -52, 22, '#fff'); line(0, -52, 0, -66, 4, '#3a2428'); line(0, -52, 10, -52, 4, '#3a2428'); }
        }
        X.restore();
      }
      drawHero(K.AX + 90, 960, 0.26, { joy: g.joyT > 0 });
      drawParts();
      hud(String(g.score), `⏱ ${Math.ceil(g.time)}`);
      if (this.mult(g) > 1) pill(K.VW / 2, 178, 90, 40, `x${this.mult(g)}`, '#ff5f9e');
      // barrinha da sequência
      if (g.chain) { const w = 160, k = Math.max(0, g.chainT / 0.9); fr(K.VW / 2 - w / 2, 206, w, 8, 4, 'rgba(255,255,255,.6)'); fr(K.VW / 2 - w / 2, 206, w * k, 8, 4, '#ff5f9e'); }
    },
    reward(g) { return Math.floor(g.score / this.per); },
  });
});
