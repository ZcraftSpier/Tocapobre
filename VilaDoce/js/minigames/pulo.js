'use strict';
// Minigame do Fliperama: Pulo nas Nuvens
// Recebe o kit K do Fliperama (js/minigames.js). Valores que mudam a cada
// quadro (posição da área de jogo, tempo, tremida...) são lidos como K.nome.
Mini.addGame((K) => {
  const { burst, cloudArt, coinArt, drawHero, drawParts, end, flash, hitstop, hud, keys, lerpCol, ring, say, sideShade, sky, vib } = K;
  // ---------- 1. Pulo nas Nuvens ----------
  return ({
    id: 'pulo', n: 'Pulo nas Nuvens', ic: '☁️', col: '#7fd3f5', per: 20,
    help: 'Pule nas nuvens para subir! Pise nos passarinhos para ganhar moedas (por baixo eles te derrubam) e pegue o balão para voar. Use ← → ou arraste o dedo.',
    stars: [100, 300, 600],
    start() {
      const g = { x: K.AX + K.AW / 2, y: 820, vy: -1250, vx: 0, cam: 0, top: 820, clouds: [], coins: [], birds: [], ups: [], boost: 0, next: 900, score: 0, got: 0, face: 1, stomps: 0 };
      g.clouds.push({ x: g.x, y: 900, w: 190, k: 'n' });
      g.next = 900;
      return g;
    },
    spawn(g) {
      while (g.next > g.cam - 300) {
        const h = (820 - g.next) / 10;
        g.next -= rand(115, 150 + Math.min(130, h / 3));
        const r = Math.random(), w = Math.max(120, 175 - h / 20);
        const c = { x: K.AX + rand(w / 2 + 10, K.AW - w / 2 - 10), y: g.next, w, k: 'n', vx: 0 };
        if (h > 40 && r < 0.25) { c.k = 'm'; c.vx = rand(90, 160 + Math.min(140, h / 4)) * (Math.random() < 0.5 ? -1 : 1); }
        else if (r > 0.92) c.k = 's';
        g.clouds.push(c);
        if (Math.random() < 0.35) g.coins.push({ x: c.x, y: c.y - 70 });
        if (h > 20 && Math.random() < 0.3) g.clouds.push({ x: K.AX + rand(70, K.AW - 70), y: g.next + rand(40, 80), w: 130, k: 'f' });
        // passarinhos (pise neles!) e o balão que leva para cima
        if (h > 50 && Math.random() < Math.min(0.22, 0.08 + h / 3000)) { const d = Math.random() < 0.5 ? 1 : -1; g.birds.push({ x: d > 0 ? K.AX - 60 : K.AX + K.AW + 60, y: g.next - rand(50, 90), vx: d * rand(130, 230 + Math.min(150, h / 6)), ph: rand(0, 6) }); }
        if (h > 80 && Math.random() < 0.035) g.ups.push({ x: K.AX + rand(60, K.AW - 60), y: g.next - 120 });
      }
    },
    update(g, dt) {
      const dir = (keys.r ? 1 : 0) - (keys.l ? 1 : 0);
      if (dir) g.vx = dir * 620;
      else if (K.ptr && K.ptr.down) g.vx = clamp((K.ptr.x - g.x) * 7, -750, 750);
      else g.vx *= Math.pow(0.02, dt);
      if (Math.abs(g.vx) > 40) g.face = Math.sign(g.vx);
      const py = g.y;
      if (g.boost > 0) { g.boost -= dt; g.vy = -1500; if (Math.random() < dt * 30) burst(g.x, g.y, 1, ['#fff', '#ffd6e7'], 120); }
      g.vy += 2300 * dt; g.x += g.vx * dt; g.y += g.vy * dt;
      if (g.x < K.AX - 30) g.x += K.AW + 60; if (g.x > K.AX + K.AW + 30) g.x -= K.AW + 60;
      for (const c of g.clouds) {
        if (c.k === 'm') { c.x += c.vx * dt; if (c.x < K.AX + c.w / 2 || c.x > K.AX + K.AW - c.w / 2) { c.vx *= -1; c.x = clamp(c.x, K.AX + c.w / 2, K.AX + K.AW - c.w / 2); } }
        if (c.gone) { c.fall = (c.fall || 0) + dt; c.y += 600 * dt; continue; }
        if (g.vy > 0 && py <= c.y - 6 && g.y >= c.y - 6 && Math.abs(g.x - c.x) < c.w / 2 + 14) {
          g.y = c.y - 6; c.sq = 1;
          if (c.k === 'f') { c.gone = true; g.vy = -1000; Sfx.poof(); burst(c.x, c.y - 20, 10, ['#c8ced8', '#e3e7ee']); }
          else if (c.k === 's') { g.vy = -1950; Sfx.whoosh(); say(c.x, c.y - 80, 'Uhuu!', '#ff8fbd'); }
          else { g.vy = -1250; Sfx.boing(); }
          g.stomps = 0;
        }
        if (c.sq) c.sq = Math.max(0, c.sq - dt * 4);
      }
      for (const k of g.coins) if (!k.got && Math.hypot(k.x - g.x, k.y - (g.y - 70)) < 60) { k.got = true; g.got++; Sfx.coin(); burst(k.x, k.y, 8, ['#ffd23f', '#fff1a8']); say(k.x, k.y - 30, '+1', '#ffd23f'); }
      for (const b of g.birds) {
        if (b.dead) { b.vy = (b.vy || -200) + 1800 * dt; b.y += b.vy * dt; b.rot = (b.rot || 0) + dt * 8; continue; }
        b.x += b.vx * dt; b.ph += dt * 14;
        if (Math.abs(b.x - g.x) < 62 && Math.abs(b.y - (g.y - 55)) < 58 && g.boost <= 0) {
          b.dead = true;
          if (g.vy > 0 && g.y < b.y + 25) {
            // pisão: quique alto, moedas, e o combo cresce enquanto não tocar numa nuvem
            g.stomps++; const n = Math.min(5, g.stomps * 2 + 1);
            g.vy = -1450; g.got += n; Sfx.boing(); Sfx.coin(); hitstop(0.06); vib(25);
            burst(b.x, b.y, 12, ['#ffffff', '#9fd3ff', '#ffd23f'], 420); ring(b.x, b.y, '#ffffff', 70); say(b.x, b.y - 40, `+${n}`, '#ffd23f');
            if (g.stomps > 1) say(b.x, b.y - 90, `Pisão x${g.stomps}!`, '#ff8fbd');
          } else {
            g.vy = 420; g.vx = -Math.sign(b.vx) * 500; K.shake = 0.35; flash('#ff6b6b', 0.2); vib(70); Sfx.squeak();
            burst(g.x, g.y - 60, 10, ['#ff8fbd', '#fff'], 360); say(g.x, g.y - 140, 'Ai!', '#ff6b6b');
          }
        }
      }
      for (const u of g.ups) if (!u.got && Math.hypot(u.x - g.x, u.y - (g.y - 70)) < 70) { u.got = true; g.boost = 1.6; Sfx.sparkle(); Sfx.whoosh(); flash('#ffd6e7', 0.2); ring(u.x, u.y, '#ff8fbd', 120); say(u.x, u.y - 60, 'Voando!', '#ff8fbd'); }
      if (g.vy > 900) g.stomps = 0;
      g.cam = Math.min(g.cam, g.y - 520);
      g.top = Math.min(g.top, g.y);
      g.score = Math.floor((820 - g.top) / 10);
      this.spawn(g);
      g.clouds = g.clouds.filter((c) => c.y < g.cam + 1150);
      g.coins = g.coins.filter((k) => !k.got && k.y < g.cam + 1150);
      g.birds = g.birds.filter((b) => b.y < g.cam + 1150 && b.x > K.AX - 200 && b.x < K.AX + K.AW + 200);
      g.ups = g.ups.filter((u) => !u.got && u.y < g.cam + 1150);
      if (g.y > g.cam + 1080) return end();
    },
    draw(g) {
      const h = clamp(-g.cam / 9000, 0, 1);
      sky(lerpCol('#8fd8ff', '#2b2466', h), lerpCol('#e8f8ff', '#7a5cc4', h));
      // estrelas e nuvenzinhas de fundo com parallax
      for (let i = 0; i < 18; i++) {
        const yy = ((srand(i) * 1400 - g.cam * 0.2) % 1400 + 1400) % 1400 - 200, xx = srand(i + 9) * K.VW;
        if (h > 0.25) { X.globalAlpha = h; fc(xx, yy, 2 + srand(i + 3) * 3, '#fff'); X.globalAlpha = 1; }
        else if (i % 3 === 0) { X.globalAlpha = 0.45; cloudArt(xx, yy, 120 + srand(i) * 80); X.globalAlpha = 1; }
      }
      sideShade();
      X.save(); X.translate(0, -g.cam);
      for (const c of g.clouds) {
        X.save(); X.translate(c.x, c.y); X.scale(1 + (c.sq || 0) * 0.12, 1 - (c.sq || 0) * 0.15);
        if (c.gone) X.globalAlpha = Math.max(0, 1 - c.fall * 2);
        if (c.k === 'f') { cloudArt(0, 0, c.w, '#d7dce5', '#b9c0cc'); line(-16, -28, -4, -14, 3, '#9aa2b0'); line(-4, -14, -12, -2, 3, '#9aa2b0'); }
        else if (c.k === 'm') cloudArt(0, 0, c.w, '#eaf6ff', '#bfe0fa');
        else cloudArt(0, 0, c.w);
        if (c.k === 's') { fr(-26, -54, 52, 14, 7, '#ff7eb6'); for (let i = 0; i < 3; i++) line(-16 + i * 16, -40, -16 + i * 16, -28, 4, '#c45b8f'); }
        X.restore();
      }
      for (const k of g.coins) coinArt(k.x, k.y, 20, K.t + k.x);
      for (const u of g.ups) { const yy = u.y + Math.sin(K.t * 3 + u.x) * 8; X.beginPath(); X.moveTo(u.x, yy); X.lineTo(u.x, yy + 50); stroke(2.5, '#9aa0aa'); fe(u.x, yy - 30, 30, 38, LG(0, yy - 68, 0, yy, '#ffb3d1', '#ff5f9e')); fe(u.x - 10, yy - 44, 6, 11, 'rgba(255,255,255,.6)', 0.4); }
      for (const b of g.birds) {
        X.save(); X.translate(b.x, b.y); X.scale(b.vx > 0 ? 1 : -1, 1); if (b.rot) X.rotate(b.rot);
        fe(0, 0, 30, 20, '#7fc8f8'); fc(22, -10, 14, '#7fc8f8'); fpoly([34, -12, 48, -7, 34, -3], '#ffb02e'); fc(26, -13, 3.5, '#2a1d1a');
        fe(-4, -6 - Math.sin(b.ph) * 14, 22, 9, '#5aaee8', -0.3 - Math.sin(b.ph) * 0.5);
        if (b.dead) { line(20, -18, 30, -8, 3, '#2a1d1a'); line(30, -18, 20, -8, 3, '#2a1d1a'); }
        X.restore();
      }
      if (g.boost > 0) { const yy = g.y - 150; X.beginPath(); X.moveTo(g.x, g.y - 90); X.lineTo(g.x, yy); stroke(2.5, '#9aa0aa'); fe(g.x, yy - 40, 40, 50, LG(0, yy - 90, 0, yy, '#ffb3d1', '#ff5f9e')); }
      drawHero(g.x, g.y, 0.3, { joy: g.vy < -300, flip: g.face < 0 });
      X.restore();
      drawParts(g.cam);
      hud(`${g.score} m`, `$ ${g.got}`);
    },
    reward(g) { return g.got + Math.floor(g.score / this.per); },
  });
});
