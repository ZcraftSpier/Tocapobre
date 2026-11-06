'use strict';
// Minigame do Fliperama: Pescaria
// Toque para jogar a linha, toque de novo quando a boia afundar ("!") e
// SEGURE para puxar. Solte quando a linha ficar tensa demais, senão arrebenta.
Mini.addGame((K) => {
  const { FONT, burst, drawHero, drawParts, end, flash, hud, pill, ring, say, sideShade, sky, vib, keys } = K;
  // a partir da fase 2 do horror (js/horror.js), algo estranho aparece neste jogo
  const creepy = () => typeof Horror !== 'undefined' && Horror.stage >= 2;
  // [nome, cor, pontos, força, tamanho, chance]
  const PEIXES = [
    ['Lambari', '#c9d5e0', 10, 0.7, 0.7, 30], ['Tilápia', '#9fb5d9', 20, 1, 1, 24], ['Baiacu', '#ffd23f', 25, 1.1, 0.9, 14],
    ['Peixe-palhaço', '#ff9f43', 30, 1.15, 0.8, 12], ['Dourado', '#ffc21a', 60, 1.6, 1.3, 7], ['Bota velha', '#7a5a3a', 2, 0.5, 1, 9],
  ];
  const BONECA = ['Boneca molhada', '#f3d6c8', 0, 0.6, 1, 0];
  function sorteia() {
    if (creepy() && Math.random() < 0.08) return BONECA;
    const tot = PEIXES.reduce((s, p) => s + p[5], 0); let r = Math.random() * tot;
    for (const p of PEIXES) if ((r -= p[5]) <= 0) return p;
    return PEIXES[0];
  }
  function peixe(x, y, s, col, dir = 1, nome) {
    X.save(); X.translate(x, y); X.scale(s * dir, s);
    if (nome === 'Bota velha') { fr(-30, -40, 34, 60, 8, col); fr(-30, 6, 64, 22, 10, col); fr(-30, -40, 34, 10, 4, shade(col, -0.2)); X.restore(); return; }
    if (nome === 'Boneca molhada') {
      fe(0, 10, 26, 36, '#c4a0b0'); fc(0, -36, 22, col); fe(0, -48, 26, 14, '#3a2a30');
      fc(-8, -36, 3.2, '#05040a'); fc(8, -36, 3.2, '#05040a'); X.beginPath(); X.arc(0, -30, 7, 0.15 * Math.PI, 0.85 * Math.PI); stroke(2.4, '#7a2b3a');
      X.restore(); return;
    }
    fpoly([-38, 0, -62, -20, -62, 20], shade(col, -0.15));
    fe(0, 0, 44, 26, col); fe(4, 8, 30, 12, 'rgba(255,255,255,.35)');
    fpoly([-4, -22, 12, -36, 18, -20], shade(col, -0.15));
    fc(26, -6, 6, '#fff'); fc(28, -6, 3.2, '#1d1f2e');
    X.restore();
  }
  return ({
    id: 'pesca', n: 'Pescaria', ic: '🎣', col: '#9fd3ff', per: 25,
    help: 'Toque para jogar a linha. Quando a boia afundar e aparecer "!", TOQUE para fisgar. Depois SEGURE para puxar — e solte quando a linha ficar vermelha, senão arrebenta! Você tem 60 segundos. (Teclado: espaço)',
    stars: [60, 150, 260],
    start() { return { phase: 'idle', time: 60, score: 0, timer: 0, fish: null, prog: 0, ten: 0, pull: 0, pullT: 1, bob: 0, caught: [], show: null, joyT: 0, nib: 0 }; },
    pos() { const px = K.AX + K.AW * 0.22; return { px, py: 560, bx: K.AX + K.AW * 0.68, by: 640 }; },
    cast(g) { g.phase = 'cast'; g.timer = 0.5; Sfx.whoosh(); },
    hook(g) {
      if (g.phase === 'bite') { g.phase = 'reel'; g.prog = 0.12; g.ten = 0.2; g.pullT = rand(0.6, 1.2); g.pull = 0; Sfx.splash(); vib(30); const p = this.pos(); burst(p.bx, p.by, 10, ['#bfe6ff', '#fff'], 300); say(p.bx, p.by - 80, 'Fisgou!', '#7ed957'); }
      else if (g.phase === 'wait') { g.phase = 'idle'; Sfx.drop(0.3); const p = this.pos(); say(p.bx, p.by - 80, 'Cedo demais', '#c9ced8'); }
    },
    tap(g) { if (g.phase === 'idle') this.cast(g); else this.hook(g); },
    key(g, k) { if (k === ' ' || k === 'Enter') { if (g.phase === 'idle') this.cast(g); else this.hook(g); } },
    update(g, dt) {
      g.time -= dt; g.joyT -= dt; g.bob += dt;
      if (g.time <= 0 && g.phase !== 'reel' && g.phase !== 'show') { g.time = 0; return end(); }
      if (g.time <= -8) return end();            // dá um tempinho para terminar de puxar
      const p = this.pos(), hold = (K.ptr && K.ptr.down) || keys.sp;
      if (g.phase === 'cast') { g.timer -= dt; if (g.timer <= 0) { g.phase = 'wait'; g.timer = rand(1.4, 3.6); g.fish = sorteia(); Sfx.splash(); burst(p.bx, p.by, 6, ['#bfe6ff', '#fff'], 200); } }
      else if (g.phase === 'wait') {
        g.timer -= dt; g.nib -= dt;
        if (g.nib <= 0 && Math.random() < dt * 1.5) { g.nib = 0.25; Sfx.click(); }   // beliscadas que enganam
        if (g.timer <= 0) { g.phase = 'bite'; g.timer = 0.75; Sfx.pop(); vib(20); }
      } else if (g.phase === 'bite') {
        g.timer -= dt; if (g.timer <= 0) { g.phase = 'idle'; say(p.bx, p.by - 80, 'Escapou...', '#c9ced8'); Sfx.drop(0.3); }
      } else if (g.phase === 'reel') {
        const F = g.fish;
        g.pullT -= dt;
        if (g.pullT <= 0) { g.pull = g.pull ? 0 : 1; g.pullT = g.pull ? rand(0.5, 1.1) * F[3] : rand(0.7, 1.6) / F[3]; if (g.pull) { Sfx.splash(); burst(p.bx, p.by, 5, ['#bfe6ff'], 220); } }
        if (hold) { g.prog += dt * 0.32 / F[3] * (g.pull ? 0.35 : 1); g.ten += dt * (g.pull ? 1.25 * F[3] : 0.38); }
        else { g.ten -= dt * 1.1; g.prog -= dt * (g.pull ? 0.12 : 0.03); }
        g.ten = clamp(g.ten, 0, 1.2); g.prog = clamp(g.prog, 0, 1);
        if (g.ten >= 1) {
          g.phase = 'idle'; K.shake = 0.3; vib(90); Sfx.squeak(); flash('#ff6b6b', 0.18);
          say(p.bx, p.by - 90, 'Arrebentou!', '#ff6b6b'); burst(p.bx, p.by, 8, ['#fff'], 260);
        } else if (g.prog >= 1) {
          g.phase = 'show'; g.timer = 1.5; g.score += F[2]; g.caught.push(F[0]); g.joyT = 1;
          g.show = { F, t: 0 };
          if (F === BONECA) { Sfx.sting ? Sfx.sting() : Sfx.squeak(); vib(60); }
          else { Sfx.coin(); if (F[2] >= 50) { Sfx.sparkle(); flash('#fff6c4', 0.2); } vib(30); burst(K.AX + K.AW / 2, 420, 18, ['#ffd23f', '#fff', F[1]], 450); ring(K.AX + K.AW / 2, 420, '#ffd23f', 140); }
        }
      } else if (g.phase === 'show') { g.timer -= dt; g.show.t += dt; if (g.timer <= 0) { g.phase = 'idle'; g.show = null; } }
    },
    draw(g) {
      const p = this.pos();
      sky('#9fdcff', '#fff4e6');
      fc(K.AX + K.AW * 0.85, 160, 50, '#fff3b0');
      for (let i = 0; i < 3; i++) { X.globalAlpha = 0.7; fe(((srand(i) * K.VW + K.t * 12 * (i + 1)) % (K.VW + 300)) - 150, 120 + i * 60, 90, 26, '#fff'); X.globalAlpha = 1; }
      // água
      X.fillStyle = LG(0, 560, 0, 1000, creepy() ? '#3f8fc0' : '#5fd0f0', creepy() ? '#123a5c' : '#2a7fc0'); X.fillRect(-20, 580, K.VW + 40, 440);
      for (let r = 0; r < 4; r++) { X.beginPath(); for (let x = -20; x <= K.VW + 20; x += 30) { const y = 600 + r * 40 + Math.sin(x * 0.02 + K.t * (1 + r * 0.3)) * 4; x === -20 ? X.moveTo(x, y) : X.lineTo(x, y); } stroke(3, `rgba(255,255,255,${0.18 - r * 0.03})`); }
      // sombra do peixe embaixo da boia
      if (g.phase === 'wait' || g.phase === 'bite' || g.phase === 'reel') {
        const sx = p.bx + Math.sin(K.t * 2) * 30 - (g.phase === 'reel' ? g.prog * (p.bx - p.px) * 0.6 : 0);
        X.globalAlpha = 0.25; peixe(sx, p.by + 90, 0.9 * (g.fish ? g.fish[4] : 1), '#0d3050', -1); X.globalAlpha = 1;
      }
      sideShade();
      // píer
      fr(-20, p.py, p.px + 70 + 20, 26, 4, '#b07a4a'); for (let x = -10; x < p.px + 70; x += 40) line(x, p.py + 2, x, p.py + 24, 2, 'rgba(0,0,0,.2)');
      for (const x of [p.px - 120, p.px + 40]) fr(x, p.py + 20, 18, 300, 4, '#8a5a3a');
      drawHero(p.px, p.py, 0.3, { joy: g.joyT > 0 });
      // vara e linha
      const tipX = p.px + 150, tipY = p.py - 200 - (g.phase === 'reel' && (K.ptr && K.ptr.down || keys.sp) ? 20 : 0);
      line(p.px + 30, p.py - 80, tipX, tipY, 6, '#6b4529');
      let bx = p.bx, by = p.by + Math.sin(g.bob * 3) * 4;
      if (g.phase === 'idle') { bx = tipX; by = tipY + 60; }
      else if (g.phase === 'cast') { const k = 1 - g.timer / 0.5; bx = lerp(tipX, p.bx, k); by = lerp(tipY, p.by, k) - Math.sin(k * Math.PI) * 160; }
      else if (g.phase === 'wait' && g.nib > 0) by += 8;
      else if (g.phase === 'bite') by += 20 + Math.sin(K.t * 40) * 4;
      else if (g.phase === 'reel') { bx = lerp(p.bx, tipX + 40, g.prog); by = p.by + (g.pull ? 14 + Math.sin(K.t * 30) * 6 : 6); }
      if (g.phase === 'show') { bx = tipX; by = tipY + 60; }
      const ten = g.phase === 'reel' ? g.ten : 0;
      X.beginPath(); X.moveTo(tipX, tipY); X.quadraticCurveTo((tipX + bx) / 2, Math.max(tipY, by) + 60 * (1 - ten), bx, by); stroke(2, ten > 0.75 ? '#ff6b6b' : 'rgba(255,255,255,.9)');
      if (g.phase !== 'show') { fc(bx, by, 11, '#ff5d5d'); fe(bx, by - 2, 11, 5, '#ffffff'); }
      if (g.phase === 'bite') { X.font = FONT(700, 80); X.textAlign = 'center'; X.lineWidth = 8; X.strokeStyle = '#fff'; X.fillStyle = '#ff4d4d'; X.strokeText('!', bx, by - 50); X.fillText('!', bx, by - 50); }
      // barras de puxar
      if (g.phase === 'reel') {
        const w = Math.min(K.AW - 60, 480), x0 = K.AX + (K.AW - w) / 2;
        X.font = FONT(700, 24); X.textAlign = 'left'; X.fillStyle = '#3a2428';
        X.fillText('Puxando', x0, 214); fr(x0, 222, w, 20, 10, 'rgba(255,255,255,.7)'); fr(x0 + 3, 225, (w - 6) * g.prog, 14, 7, '#7ed957');
        X.fillText('Linha', x0, 276); fr(x0, 284, w, 20, 10, 'rgba(255,255,255,.7)');
        fr(x0 + 3, 287, (w - 6) * Math.min(1, g.ten), 14, 7, g.ten > 0.75 ? (Math.sin(K.t * 30) > 0 ? '#ff4d4d' : '#ff9f9f') : g.ten > 0.5 ? '#ffd23f' : '#4dabf7');
        fr(x0 + w * 0.75, 284, 3, 20, 1, 'rgba(58,36,40,.4)');
        pill(K.AX + K.AW / 2, 350, Math.min(K.AW - 40, 420), 46, g.ten > 0.75 ? 'SOLTE!' : 'Segure para puxar', g.ten > 0.75 ? '#e8283f' : '#2a7fc0');
      } else if (g.phase === 'idle') pill(K.AX + K.AW / 2, 300, Math.min(K.AW - 40, 420), 46, 'Toque para jogar a linha', '#2a7fc0');
      else if (g.phase === 'wait') pill(K.AX + K.AW / 2, 300, Math.min(K.AW - 40, 420), 46, 'Espere a boia afundar...', '#2a7fc0');
      // peixe pescado
      if (g.show) {
        const F = g.show.F, k = Math.min(1, g.show.t * 5), cx = K.AX + K.AW / 2;
        X.globalAlpha = 0.85; fc(cx, 420, 120 * k, '#ffffff'); X.globalAlpha = 1;
        peixe(cx, 430 - Math.sin(K.t * 8) * 6, 1.4 * F[4] * k, F[1], 1, F[0]);
        pill(cx, 575, Math.min(K.AW - 40, 360), 50, F === BONECA ? `${F[0]}` : `${F[0]} +${F[2]}`, F === BONECA ? '#3a2a30' : '#2a7fc0');
        if (F === BONECA) { X.font = FONT(600, 24); X.textAlign = 'center'; X.fillStyle = '#3a2a30'; X.fillText('Ela estava sorrindo.', cx, 630); }
      }
      drawParts();
      hud(String(g.score), `⏱ ${Math.max(0, Math.ceil(g.time))}`);
    },
    reward(g) { return Math.floor(g.score / this.per); },
  });
});
