'use strict';
// Minigame do Fliperama: Voo Doce
// Seu personagem voa com um chapéu de hélice: cada toque dá um impulso para cima.
// Passe pelos vãos entre as colunas de doce sem encostar nelas nem no chão.
Mini.addGame((K) => {
  const { FONT, burst, drawHero, drawParts, end, flash, hitstop, hud, pill, ring, say, sky, vib, coinArt, cloudArt } = K;
  // a partir da fase 2 do horror (js/horror.js), algo estranho aparece neste jogo
  const creepy = () => typeof Horror !== 'undefined' && Horror.stage >= 2;
  const GRAV = 2300, FLAP = -720, GROUND = 900, COLW = 110, SPACING = 360, HR = 26;
  const SABORES = [['#ff7eb6', '#fff5fa'], ['#7ed1c8', '#f2fffc'], ['#ffd23f', '#fffbe8'], ['#a77bf3', '#f6f0ff']];
  const ESCALA = [523.25, 587.33, 659.25, 783.99, 880, 1046.5];
  return ({
    id: 'voo', n: 'Voo Doce', ic: '🍭', col: '#ffc9e0', per: 5,
    help: 'Toque para dar um impulso com o chapéu de hélice! Passe pelos vãos entre as colunas de doce sem encostar nelas nem no chão. (Teclado: espaço)',
    stars: [10, 25, 50],
    start() {
      const g = { y: 430, vy: FLAP, cols: [], dist: 0, score: 0, got: 0, dead: 0, spin: 0, spinV: 30, lastGap: 480, crow: null, crowCD: rand(10, 16), hist: [] };
      this.spawn(g, this.hx() + 600);   // a primeira coluna já vem perto (na tela larga não precisa esperar)
      return g;
    },
    hx() { return K.AX + K.AW * 0.3; },
    speed(g) { return 280 + Math.min(140, g.score * 4); },
    flap(g) { if (g.dead) return; g.vy = FLAP; g.spinV = 60; Sfx.bloop(); vib(5); },
    tap(g) { this.flap(g); },
    key(g, k) { if (k === ' ' || k === 'ArrowUp' || k === 'Enter' || k === 'w' || k === 'W') this.flap(g); },
    spawn(g, x) {
      const size = Math.max(210, 290 - g.score * 2.5);
      const gap = clamp(g.lastGap + rand(-220, 220), 230 + size / 2 - 120, GROUND - 90 - size / 2);
      g.lastGap = gap;
      const dark = creepy() && g.score > 2 && Math.random() < 0.15;
      g.cols.push({ x, gap, size, scored: false, dark, sab: pick(SABORES), coin: Math.random() < 0.35 ? { got: false } : null });
    },
    hit(g, c) {
      // círculo do personagem contra os dois retângulos da coluna
      const cx = this.hx(), cy = g.y - 6, x0 = c.x - COLW / 2, x1 = c.x + COLW / 2;
      const test = (y0, y1) => { const nx = clamp(cx, x0, x1), ny = clamp(cy, y0, y1); return Math.hypot(cx - nx, cy - ny) < HR; };
      return test(-200, c.gap - c.size / 2) || test(c.gap + c.size / 2, GROUND);
    },
    die(g) {
      g.dead = 0.001; g.vy = -320; K.shake = 0.4; flash('#ffffff', 0.25); hitstop(0.1); vib(100); Sfx.poof(); Sfx.squeak();
      burst(this.hx(), g.y, 16, ['#ff8fbd', '#ffd23f', '#fff'], 420); say(this.hx(), g.y - 80, 'Ai!', '#ff6b6b');
    },
    update(g, dt) {
      g.spinV = Math.max(14, g.spinV - dt * 60); g.spin += g.spinV * dt;
      g.vy = Math.min(900, g.vy + GRAV * dt); g.y += g.vy * dt;
      if (g.y < 30) { g.y = 30; g.vy = Math.max(g.vy, 0); }
      if (g.dead) {
        g.dead += dt;
        if (g.y > GROUND - 34) { g.y = GROUND - 34; g.vy = 0; }
        if (g.dead > 1.2) return end();
        return;
      }
      const v = this.speed(g);
      g.dist += v * dt;
      // novas colunas sempre com o mesmo espaçamento, nascendo fora da tela à direita
      for (let last = g.cols[g.cols.length - 1]; !last || last.x <= K.VW + COLW - SPACING; last = g.cols[g.cols.length - 1]) this.spawn(g, last ? last.x + SPACING : K.VW + COLW);
      const hx = this.hx();
      for (const c of g.cols) {
        c.x -= v * dt;
        if (!c.scored && c.x + COLW / 2 < hx - HR) { c.scored = true; g.score++; Sfx.note(ESCALA[g.score % ESCALA.length]); if (g.score % 10 === 0) { say(hx, g.y - 90, `${g.score}!`, '#ffd23f'); ring(hx, g.y, '#ffd23f', 110); Sfx.ding(); } }
        if (c.coin && !c.coin.got && Math.hypot(c.x - hx, c.gap - g.y) < 50) { c.coin.got = true; g.got++; Sfx.coin(); burst(c.x, c.gap, 6, ['#ffd23f', '#fff1a8'], 200); }
        if (this.hit(g, c)) { this.die(g); return; }
      }
      g.cols = g.cols.filter((c) => c.x > -COLW * 2);
      if (g.y > GROUND - 30) { g.y = GROUND - 30; this.die(g); return; }
      // horror: um corvo voa atrás de você por alguns segundos, imitando seus movimentos
      g.hist.push(g.y); if (g.hist.length > 40) g.hist.shift();
      g.crowCD -= dt;
      if (g.crow) { g.crow.t -= dt; if (g.crow.t <= 0) g.crow = null; }
      else if (creepy() && g.crowCD <= 0) { g.crow = { t: rand(5, 7) }; g.crowCD = rand(14, 22); }
    },
    pillar(x, y0, y1, sab, dark, capTop) {
      // coluna de doce listrada; a ponta virada para o vão tem cobertura escorrendo
      const [c1, c2] = dark ? ['#2a1d2a', '#4a2a4a'] : sab, w = COLW;
      X.save(); X.beginPath(); X.rect(x - w / 2, y0, w, y1 - y0); X.clip();
      X.fillStyle = c2; X.fillRect(x - w / 2, y0, w, y1 - y0);
      for (let s = Math.floor(y0 / 44) * 44 - w; s < y1 + w; s += 44) { X.beginPath(); X.moveTo(x - w / 2, s); X.lineTo(x + w / 2, s - w * 0.6); X.lineTo(x + w / 2, s - w * 0.6 + 20); X.lineTo(x - w / 2, s + 20); X.closePath(); X.fillStyle = c1; X.fill(); }
      fr(x - w / 2, y0, 14, y1 - y0, 0, 'rgba(255,255,255,.25)');
      X.restore();
      X.beginPath(); X.rect(x - w / 2, y0, w, y1 - y0); stroke(3, 'rgba(58,36,40,.25)');
      // cobertura na ponta
      const cy = capTop ? y0 : y1, cw = w + 18, ch = 30, top = capTop ? cy - 6 : cy - ch + 6, frost = dark ? '#5a3a5a' : '#ffffff';
      fr(x - cw / 2, top, cw, ch, 14, frost);
      for (let i = 0; i < 4; i++) { const dx = x - cw / 2 + 14 + i * (cw - 28) / 3; fe(dx, capTop ? top + ch + 4 : top - 4 + ch, 7, 10 + (i % 2) * 6, frost); }
      if (capTop && !dark) { fc(x, top - 8, 11, '#e8283f'); line(x, top - 18, x + 8, top - 32, 3, '#4ea83c'); }
      return { x, y: capTop ? top + ch / 2 : top + ch / 2 };
    },
    draw(g) {
      const hx = this.hx();
      // céu, nuvens e casinhas da vila ao fundo
      sky('#ffd6e7', '#fff7d6');
      for (let i = 0; i < 5; i++) { X.globalAlpha = 0.85; cloudArt(((srand(i) * (K.VW + 400) - g.dist * 0.15) % (K.VW + 400) + K.VW + 400) % (K.VW + 400) - 200, 110 + i * 70, 140 + srand(i + 2) * 90); X.globalAlpha = 1; }
      const HC = ['#ffb199', '#ffcf5c', '#9fb2ff', '#ff9ec4', '#6fd6c8', '#c5a3ff'];
      for (let i = -1; i < K.VW / 160 + 2; i++) {
        const id = Math.floor(g.dist * 0.35 / 160) + i, x = id * 160 - g.dist * 0.35, h = 90 + srand(id) * 90, col = HC[((id % 6) + 6) % 6];
        X.globalAlpha = 0.55; fr(x + 10, GROUND - h, 120, h, 8, col); fpoly([x, GROUND - h + 6, x + 70, GROUND - h - 50, x + 140, GROUND - h + 6], shade(col, -0.2)); X.globalAlpha = 1;
      }
      // colunas
      for (const c of g.cols) {
        this.pillar(c.x, -40, c.gap - c.size / 2, c.sab, c.dark, false);
        const cap = this.pillar(c.x, c.gap + c.size / 2, GROUND, c.sab, c.dark, true);
        if (c.dark) {
          // horror: um olho na cobertura acompanha você
          const ex = c.x, ey = cap.y, d = Math.hypot(hx - ex, g.y - ey) || 1;
          fe(ex, ey, 18, 11, '#f3eef6'); fc(ex + (hx - ex) / d * 7, ey + (g.y - ey) / d * 4, 6, '#05040a');
        }
        if (c.coin && !c.coin.got) coinArt(c.x, c.gap, 20, K.t + c.x * 0.01);
      }
      // chão de doce
      fr(-20, GROUND, K.VW + 40, 120, 0, '#8fdc7a'); fr(-20, GROUND, K.VW + 40, 12, 0, '#6ac46a');
      for (let x = -((g.dist) % 60) - 60; x < K.VW + 60; x += 60) fr(x, GROUND + 22, 30, 10, 5, '#ffffff');
      // corvo (horror) atrás de você, com um atraso
      if (g.crow) {
        const yy = g.hist[0] ?? g.y, cx = hx - 150 - Math.max(0, 1 - g.crow.t) * 300, flapA = Math.sin(K.t * 14) * 0.6;
        X.save(); X.translate(cx, yy - 10);
        fe(0, 0, 26, 15, '#141218'); fc(20, -8, 11, '#141218'); fpoly([28, -9, 42, -5, 28, -2], '#3a3240'); fc(22, -10, 2.6, '#d8d6de');
        X.save(); X.rotate(-0.4 - flapA); fe(-4, -10, 24, 8, '#1d1b24'); X.restore();
        X.restore();
      }
      // você com o chapéu de hélice (inclina conforme sobe ou cai)
      const rot = g.dead ? g.dead * 8 : clamp(g.vy / 1100, -0.45, 0.9);
      X.save(); X.translate(hx, g.y); X.rotate(rot);
      drawHero(0, 52, 0.28, { joy: g.vy < 0 && !g.dead });
      const hy = -58;
      X.beginPath(); X.arc(0, hy + 10, 20, Math.PI, 0); X.closePath(); X.fillStyle = '#ff5d5d'; X.fill(); stroke(2.5, 'rgba(58,36,40,.6)');
      X.beginPath(); X.moveTo(0, hy + 10); X.arc(0, hy + 10, 20, Math.PI, Math.PI * 1.5); X.closePath(); X.fillStyle = '#ffd23f'; X.fill();
      line(0, hy - 10, 0, hy - 2, 3, '#5b6474');
      const pw = Math.abs(Math.cos(g.spin)) * 34 + 4;
      fe(0, hy - 12, pw, 5, '#4dabf7'); fc(0, hy - 12, 4, '#2f3241');
      X.restore();
      drawParts();
      hud(String(g.score), g.got ? `$ ${g.got}` : null);
      if (g.score === 0 && g.dist < 400) pill(K.VW / 2, 250, Math.min(K.AW - 40, 460), 48, 'Toque para voar!', '#c45b8f');
    },
    reward(g) { return g.got + Math.floor(g.score / this.per); },
  });
});
