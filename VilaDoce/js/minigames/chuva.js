'use strict';
// Minigame do Fliperama: Chuva de Comida
// Recebe o kit K do Fliperama (js/minigames.js). Valores que mudam a cada
// quadro (posição da área de jogo, tempo, tremida...) são lidos como K.nome.
Mini.addGame((K) => {
  const { bombArt, burst, drawHero, drawParts, end, flash, heart, hitstop, hud, itemArt, keys, pill, ring, say, sideShade, sky, starPath, vib } = K;
  // ---------- 2. Chuva de Comida ----------
  const FOODS = ['apple', 'banana', 'pizza', 'cake', 'donut', 'icecream', 'watermelon', 'orange', 'chocolate', 'brigadeiro', 'popcorn', 'morango'];
  return ({
    id: 'chuva', n: 'Chuva de Comida', ic: '🍎', col: '#ffb199', per: 8,
    help: 'Pegue as comidas e fuja das bombinhas! Pegar em sequência multiplica os pontos. O ímã puxa a comida e o coração dá vida extra. Use ← → ou arraste.',
    stars: [25, 70, 140],
    mult(g) { return Math.min(4, 1 + Math.floor(g.combo / 8)); },
    start() { return { x: K.AX + K.AW / 2, vx: 0, face: 1, drops: [], spawnT: 0.6, lives: 3, score: 0, combo: 0, joyT: 0, hurtT: 0, el: 0, magT: 0 }; },
    update(g, dt) {
      g.el += dt;
      const dir = (keys.r ? 1 : 0) - (keys.l ? 1 : 0);
      if (dir) g.vx = dir * 820;
      else if (K.ptr && K.ptr.down) g.vx = clamp((K.ptr.x - g.x) * 9, -1000, 1000);
      else g.vx = 0;
      if (Math.abs(g.vx) > 40) g.face = Math.sign(g.vx);
      g.x = clamp(g.x + g.vx * dt, K.AX + 60, K.AX + K.AW - 60);
      g.joyT -= dt; g.hurtT -= dt; g.magT -= dt;
      const lvl = Math.min(1, g.el / 90);
      g.spawnT -= dt;
      if (g.spawnT <= 0) {
        g.spawnT = lerp(1.0, 0.42, lvl) * rand(0.8, 1.2);
        const r = Math.random(), foods = FOODS.filter((k) => ITEMS[k]);
        g.drops.push({ x: K.AX + rand(50, K.AW - 50), y: -60, vy: lerp(260, 560, lvl) * rand(0.9, 1.15), rot: rand(-0.4, 0.4), vr: rand(-2, 2),
          k: r < lerp(0.12, 0.28, lvl) ? 'bomb' : r > 0.95 ? 'star' : r > 0.93 && g.lives < 3 ? 'heart' : r > 0.91 && g.magT <= 0 ? 'magnet' : pick(foods) });
      }
      const bx = g.x, by = 760;
      for (const d of g.drops) {
        d.y += d.vy * dt; d.rot += d.vr * dt;
        if (g.magT > 0 && d.k !== 'bomb' && d.y > 250) d.x += (bx - d.x) * Math.min(1, dt * 4);
        if (!d.done && d.y > by - 40 && d.y < by + 10 && Math.abs(d.x - bx) < 74) {
          d.done = true;
          if (d.k === 'bomb') { g.lives--; g.combo = 0; g.hurtT = 0.6; K.shake = 0.4; Sfx.poof(); burst(d.x, d.y, 16, ['#3b3446', '#ffb02e', '#8a8299'], 500); ring(d.x, d.y, '#ffb02e', 130); say(d.x, d.y - 40, 'Ai!', '#ff6b6b'); flash('#ff6b6b', 0.22); hitstop(0.08); vib(90); }
          else if (d.k === 'heart') { g.lives = Math.min(3, g.lives + 1); Sfx.sparkle(); burst(d.x, d.y, 12, ['#ff5f7e', '#ffd6e5'], 380); say(d.x, d.y - 40, '+1 ❤', '#ff5f7e'); ring(d.x, d.y, '#ff8fbd'); vib(20); }
          else if (d.k === 'magnet') { g.magT = 6; Sfx.whoosh(); Sfx.sparkle(); flash('#9fd3ff', 0.18); say(d.x, d.y - 40, 'Ímã!', '#9fd3ff'); ring(d.x, d.y, '#4dabf7', 140); vib(20); }
          else {
            const before = this.mult(g);
            g.combo++; const pts = (d.k === 'star' ? 5 : 1) * before;
            g.score += pts; g.joyT = 0.35;
            d.k === 'star' ? (Sfx.sparkle(), flash('#ffe27a', 0.15)) : Sfx.munch();
            burst(d.x, d.y, 7, ['#ffd23f', '#ff8fbd', '#7ed957']); say(d.x, d.y - 40, '+' + pts, '#fff'); vib(8);
            if (this.mult(g) > before) { say(g.x, 620, `x${this.mult(g)}!`, '#ffd23f'); Sfx.ding(); ring(g.x, 760, '#ffd23f', 160); }
          }
        }
        if (!d.done && d.y > 1040) { d.done = true; if (d.k !== 'bomb' && d.k !== 'star') { g.lives--; g.combo = 0; g.hurtT = 0.4; Sfx.drop(0.4); say(d.x, 940, 'Ops!', '#ff6b6b'); } }
      }
      g.drops = g.drops.filter((d) => !d.done);
      if (g.lives <= 0) return end();
    },
    draw(g) {
      sky('#9fdcff', '#fff4e6');
      fe(K.VW * 0.2, 980, K.VW * 0.5, 160, '#a6df8f'); fe(K.VW * 0.8, 1000, K.VW * 0.55, 180, '#8fd37a');
      fr(0, 890, K.VW, 110, 0, '#7cc966'); fr(0, 890, K.VW, 10, 0, '#6bb857');
      sideShade();
      for (const d of g.drops) {
        if (d.k === 'bomb') bombArt(d.x, d.y, 30);
        else if (d.k === 'heart') { fc(d.x, d.y - 4, 40, 'rgba(255,255,255,.5)'); heart(d.x, d.y + 10, 34, '#ff5f7e'); }
        else if (d.k === 'magnet') { X.save(); X.translate(d.x, d.y); X.rotate(d.rot); X.beginPath(); X.arc(0, -4, 24, Math.PI, 0); stroke(16, '#e8283f'); fr(-32, -6, 16, 22, 3, '#e6ebf0'); fr(16, -6, 16, 22, 3, '#e6ebf0'); X.restore(); }
        else if (d.k === 'star') { X.save(); X.translate(d.x, d.y); X.rotate(d.rot); starPath(0, 0, 34, 15); X.fillStyle = '#ffd23f'; X.fill(); stroke(4, '#f2a90f'); X.restore(); }
        else itemArt(d.k, d.x, d.y, 0.8, d.rot);
      }
      const sh = g.hurtT > 0 ? Math.sin(K.t * 60) * 6 : 0;
      if (g.magT > 0) { X.globalAlpha = 0.25 + 0.15 * Math.sin(K.t * 10); for (let i = 0; i < 3; i++) { X.beginPath(); X.arc(g.x, 760, 90 + ((K.t * 120 + i * 60) % 180), Math.PI * 1.1, Math.PI * 1.9); stroke(4, '#4dabf7'); } X.globalAlpha = 1; }
      drawHero(g.x + sh, 900, 0.34, { run: Math.abs(g.vx) > 40, joy: g.joyT > 0, flip: g.face < 0 });
      // cesta
      const bx = g.x + sh, by = 760 - (Math.abs(g.vx) > 40 ? Math.abs(Math.sin(K.t * 11 + (K.hero.phase || 0))) * 3 : 0);
      X.save(); X.translate(bx, by);
      X.beginPath(); X.moveTo(-70, -26); X.lineTo(70, -26); X.lineTo(54, 26); X.lineTo(-54, 26); X.closePath();
      X.fillStyle = LG(0, -26, 0, 26, '#e0a868', '#b97a3c'); X.fill(); stroke(4, 'rgba(58,36,40,.8)');
      for (let i = -2; i <= 2; i++) line(i * 24, -22, i * 20, 22, 3, 'rgba(120,70,30,.45)');
      line(-64, -6, 64, -6, 3, 'rgba(120,70,30,.45)');
      fr(-74, -34, 148, 14, 7, '#c98a4a'); RR(-74, -34, 148, 14, 7); stroke(3.5, 'rgba(58,36,40,.8)');
      X.restore();
      drawParts();
      hud(String(g.score), null, g.lives);
      if (this.mult(g) > 1) pill(K.VW / 2, 160, 90, 40, `x${this.mult(g)}`, '#ff5f9e');
    },
    reward(g) { return Math.floor(g.score / this.per); },
  });
});
