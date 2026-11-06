'use strict';
// Minigame do Fliperama: Queda de Braço
// Você (braço vindo de baixo da tela) contra os moradores da vila, numa mesa.
// Cada toque faz força; tocar com o ponteiro no VERDE vale muito mais. Quando o
// rival avisa ("!"), ele aperta com tudo: toque rápido para segurar.
// Derrube a mão dele para a DIREITA; se a sua encostar na mesa à esquerda, perdeu.
Mini.addGame((K) => {
  const { FONT, burst, drawParts, end, flash, hitstop, hud, pill, ring, say, sideShade, sky, vib, cast } = K;
  // a partir da fase 2 do horror (js/horror.js), algo estranho aparece neste jogo
  const creepy = () => typeof Horror !== 'undefined' && Horror.stage >= 2;
  const TY_FAR = 640, TY_NEAR = 770, PIV_Y = 702, R = 150, S = 1.15;
  const sleeveOf = (e) => SLEEVE[e.top] || 30;
  function clone(src) {
    // sem braços "normais": eles são desenhados aqui, por cima da mesa (art.js, drawArmBent)
    return Object.assign({}, src, { x: 0, y: 0, state: 'idle', hold: null, seat: null, seatEnt: null, sq: 0, reactT: 0, moving: false, dancing: false, ang: 0, pop: null, swing: 0, stare: 0, eatT: 0, armPose: { L: null, R: null } });
  }
  // mão fechada (punho) com polegar e dedos
  function punho(x, y, r, skin, flip = 1) {
    fe(x, y, r, r * 0.92, skin); X.beginPath(); X.ellipse(x, y, r, r * 0.92, 0, 0, TAU); stroke(r * 0.12, 'rgba(58,36,40,.75)');
    for (let i = -1; i <= 1; i++) line(x + flip * r * 0.2, y + i * r * 0.3, x + flip * r * 0.68, y + i * r * 0.3, r * 0.09, 'rgba(58,36,40,.4)');
    fe(x - flip * r * 0.55, y - r * 0.38, r * 0.3, r * 0.48, shade(skin, 0.06), -0.6 * flip);
    X.beginPath(); X.ellipse(x - flip * r * 0.55, y - r * 0.38, r * 0.3, r * 0.48, -0.6 * flip, 0, TAU); stroke(r * 0.08, 'rgba(58,36,40,.55)');
  }
  return ({
    id: 'queda', n: 'Queda de Braço', ic: '💪', col: '#ffcf9e', per: 1,
    help: 'Toque para fazer força — tocar com o ponteiro no VERDE vale muito mais! Quando aparecer "!", o rival vai apertar: toque rápido para segurar. Derrube a mão dele para a direita! (Teclado: espaço)',
    stars: [1, 2, 4],
    start() {
      const L = cast().filter((c) => !K.hero || c.name !== K.hero.name);
      const roster = (L.length ? L : [C('Téo', 'casa', 0, 0)]).map((c) => Object.assign({}, c));
      const g = { roster, n: 0, score: 0, phase: 'intro', timer: 1.5, bal: 0, vis: 0, stam: 1, cur: 0, perfT: 0, surge: 0, tell: 0, nextSurge: 3, gelo: 0, joyT: 0 };
      this.newFoe(g);
      return g;
    },
    newFoe(g) {
      const src = g.roster[g.n % g.roster.length], lap = Math.floor(g.n / g.roster.length);
      g.o = clone(src); g.foeName = src.name + (lap ? ` ${lap + 1}` : '');
      g.bal = 0; g.vis = 0; g.stam = 1; g.rt = 0; g.surge = 0; g.tell = 0; g.gelo = 0; g.nextSurge = rand(2.5, 4);
      g.phase = 'intro'; g.timer = 1.5;
      setTimeout(() => K.open && Sfx.bell(), 250);
    },
    // faixa verde do medidor de força (fica menor a cada rival)
    zone(g) { const w = Math.max(0.1, 0.22 - g.n * 0.018); return [0.5 - w / 2, 0.5 + w / 2]; },
    cursor(g) { return 1 - Math.abs((g.cur % 2) - 1); },
    // mãos agarradas: giram em volta dos cotovelos, no meio da mesa
    hands(g) { const a = g.vis * 1.25, cx = K.AX + K.AW / 2; return { x: cx + Math.sin(a) * R, y: PIV_Y - Math.cos(a) * R }; },
    push(g) {
      if (g.phase !== 'fight') return;
      const [a, b] = this.zone(g), c = this.cursor(g), h = this.hands(g);
      // toque no verde empurra muito e recupera o fôlego; toques fracos seguidos vão cansando
      if (c >= a && c <= b) {
        g.bal += 0.1; g.stam = 1; g.perfT = 0.25; g.joyT = 0.3;
        Sfx.pop(); vib(18); burst(h.x, h.y, 8, ['#ffd23f', '#fff'], 260); say(h.x, h.y - 80, 'Força!', '#ffd23f');
      } else { g.bal += 0.042 * g.stam; g.stam = Math.max(0.3, g.stam * 0.94); Sfx.click(); vib(5); }
    },
    tap(g) { this.push(g); },
    key(g, k) { if (k === ' ' || k === 'Enter' || k === 'j' || k === 'J') this.push(g); },
    update(g, dt) {
      g.joyT -= dt; g.perfT -= dt;
      g.cur += dt * (1.0 + g.n * 0.12);
      g.stam = Math.min(1, g.stam + 0.35 * dt);
      g.vis = lerp(g.vis, g.bal, Math.min(1, dt * 14));   // a mão anda suave atrás do valor real
      if (g.phase === 'intro') { g.timer -= dt; if (g.timer <= 0) g.phase = 'fight'; return; }
      if (g.phase === 'won' || g.phase === 'lost') {
        // a mão de quem perdeu desce até encostar na mesa
        g.bal = lerp(g.bal, g.phase === 'won' ? 1.18 : -1.18, Math.min(1, dt * 12)); g.vis = g.bal;
        g.timer -= dt;
        if (g.timer <= 0) { if (g.phase === 'won') { g.n++; this.newFoe(g); } else return end(); }
        return;
      }
      // o rival faz força o tempo todo, e de vez em quando "aperta" (avisa com "!")
      g.rt += dt; g.nextSurge -= dt;
      if (g.tell > 0) { g.tell -= dt; if (g.tell <= 0) { g.surge = 1.3 + g.n * 0.08; Sfx.whoosh(); if (g.gelo) { const h = this.hands(g); say(h.x, h.y - 120, 'Sua mão está gelada.', '#c9ced8'); Sfx.sting && Sfx.sting(); } } }
      else if (g.surge > 0) { g.surge -= dt; if (g.surge <= 0) { g.gelo = 0; g.nextSurge = rand(2.2, 4) * Math.max(0.55, 1 - g.n * 0.07); } }
      else if (g.nextSurge <= 0) { g.tell = Math.max(0.35, 0.7 - g.n * 0.04); Sfx.click(); if (creepy() && Math.random() < 0.3) g.gelo = 1; }
      // depois de 6 s, ele aperta cada vez mais: nenhuma rodada fica empatada para sempre
      const tired = 1 + Math.max(0, g.rt - 6) * 0.08;
      const pull = (g.surge > 0 ? (0.24 + 0.07 * g.n) * (g.gelo ? 1.4 : 1) : 0.08 + 0.04 * g.n) * tired * (0.9 + Math.sin(K.t * 3) * 0.1);
      g.bal = clamp(g.bal - pull * dt, -1, 1);
      const h = this.hands(g);
      if (g.bal >= 1) {
        g.phase = 'won'; g.timer = 1.8; g.score++;
        hitstop(0.15); flash('#fff6c4', 0.2); K.shake = 0.45; vib([40, 30, 90]); Sfx.drop(1); setTimeout(() => K.open && Sfx.ding(), 200);
        burst(h.x, h.y + 30, 24, ['#ffd23f', '#ff8fbd', '#7ed957', '#fff'], 520); ring(h.x, h.y + 30, '#ffd23f', 150);
        say(K.AX + K.AW / 2, 300, 'Venceu!', '#7ed957');
      } else if (g.bal <= -1) {
        g.phase = 'lost'; g.timer = 1.7;
        hitstop(0.12); flash('#ff6b6b', 0.2); K.shake = 0.4; vib(100); Sfx.drop(1); Sfx.squeak();
        say(K.AX + K.AW / 2, 300, 'Perdeu...', '#ff6b6b');
      }
    },
    draw(g) {
      const cx = K.AX + K.AW / 2, h = this.hands(g), o = g.o, hs = K.hero;
      // salão de madeira com varal de lampadinhas
      sky('#7a5236', '#3a2418');
      for (let x = -40; x < K.VW + 40; x += 120) { X.fillStyle = 'rgba(0,0,0,.08)'; X.fillRect(x, 0, 6, 1000); }
      X.beginPath(); X.moveTo(-20, 80); X.quadraticCurveTo(K.VW / 2, 180, K.VW + 20, 80); stroke(3, '#2a1a10');
      for (let i = 0; i <= 16; i++) {
        const u = i / 16, x = lerp(-20, K.VW + 20, u), y = 80 + Math.sin(u * Math.PI) * 50 + 12, c = ['#ffd23f', '#ff7eb6', '#7ed957', '#4dabf7'][i % 4];
        X.globalAlpha = 0.22 + 0.12 * Math.sin(K.t * 3 + i); fc(x, y, 24, c); X.globalAlpha = 1; fc(x, y, 9, c);
      }
      sideShade();
      // rival atrás da mesa (treme quando aperta)
      const strain = g.surge > 0 || g.tell > 0, shk = strain ? Math.sin(K.t * 60) * 3 : 0;
      const feetY = TY_FAR + 110 * S, ox = cx + shk;
      o.reactT = g.bal < -0.45 && g.phase !== 'won' ? 1 : 0;                           // ri quando está ganhando
      o.stare = g.gelo && strain ? 1 : 0; if (o.stare) o.reactT = 0;                      // horror: encara, sem piscar
      X.save(); X.translate(ox, feetY); X.scale(S, S); drawChar(o, K.t, true); X.restore();
      // mesa: tampo em perspectiva e frente
      fpoly([cx - 330, TY_FAR, cx + 330, TY_FAR, cx + 430, TY_NEAR, cx - 430, TY_NEAR], '#c98a55');
      line(cx - 330, TY_FAR, cx + 330, TY_FAR, 4, '#e0a46b');
      for (let i = 1; i < 5; i++) { const u = i / 5; line(lerp(cx - 330, cx - 430, 0) + u * 660, TY_FAR, lerp(cx - 430, cx + 430, u), TY_NEAR, 2, 'rgba(90,50,25,.25)'); }
      fe(cx - 150, 690, 40, 12, 'rgba(58,36,40,.16)'); fe(cx + 150, 690, 40, 12, 'rgba(58,36,40,.16)');   // onde a mão bate
      fr(cx - 430, TY_NEAR, 860, 300, 0, '#8a5532'); fr(cx - 430, TY_NEAR, 860, 14, 0, '#6b4024');
      // braços do rival por cima da mesa (em coordenadas do personagem)
      const toL = (x, y) => [(x - ox) / S, (y - feetY) / S];
      X.save(); X.translate(ox, feetY); X.scale(S, S);
      drawArmBent([-38, -186], [-80, -112], [-76, -52], o, sleeveOf(o));                  // braço apoiado na mesa
      drawArmBent([38, -186], toL(cx + 18, PIV_Y - 6), toL(h.x, h.y), o, sleeveOf(o));    // braço da disputa
      X.restore();
      punho(ox - 76 * S, feetY - 52 * S, 22, o.skin, -1);
      // seu braço, vindo de baixo da tela (mais grosso: está perto)
      const Z = 1.9;
      X.save(); X.scale(Z, Z);
      drawArmBent([(cx - 175) / Z, 1110 / Z], [(cx - 28) / Z, (TY_NEAR + 8) / Z], [h.x / Z, (h.y + 10) / Z], hs, sleeveOf(hs));
      X.restore();
      // mãos agarradas
      punho(h.x + 8, h.y - 8, 34, o.skin, 1);
      punho(h.x - 8, h.y + 8, 42, hs.skin, -1);
      if (g.perfT > 0) { X.globalAlpha = g.perfT * 3; fc(h.x, h.y, 70, 'rgba(255,240,180,.5)'); X.globalAlpha = 1; }
      // horror: uma mão pálida agarra por cima
      if (g.gelo && strain) {
        const j = Math.sin(K.t * 40) * 2;
        X.beginPath(); X.moveTo(h.x - 150 + j, h.y - 260); X.quadraticCurveTo(h.x - 120, h.y - 90, h.x - 22 + j, h.y - 30); stroke(26, '#bfbcc8'); stroke(20, '#d8d6de');
        for (let i = 0; i < 4; i++) { fe(h.x - 26 + i * 15 + j, h.y - 22 + Math.abs(i - 1.5) * 4, 7, 16, '#d8d6de', 0.3); fc(h.x - 26 + i * 15 + j, h.y - 8 + Math.abs(i - 1.5) * 4, 3, '#2a2430'); }
      }
      // aviso de aperto
      if (g.tell > 0) {
        X.font = FONT(700, 90); X.textAlign = 'center'; X.lineWidth = 9; X.strokeStyle = '#fff'; X.fillStyle = '#ff4d4d';
        const yy = 340 + Math.sin(K.t * 25) * 5; X.strokeText('!', cx + 160, yy); X.fillText('!', cx + 160, yy);
      }
      // quem está ganhando
      const mw = Math.min(K.AW - 60, 520), mx = cx - mw / 2, my = 190;
      fr(mx, my, mw, 22, 11, 'rgba(0,0,0,.35)');
      fr(mx + 3, my + 3, mw / 2 - 3, 16, 8, 'rgba(255,107,107,.75)'); fr(cx, my + 3, mw / 2 - 3, 16, 8, 'rgba(126,217,87,.8)');
      const kx = cx + (mw / 2 - 12) * clamp(g.vis, -1, 1);
      fc(kx, my + 11, 17, hs.skin); X.beginPath(); X.arc(kx, my + 11, 17, 0, TAU); stroke(3, '#3a2428');
      X.font = FONT(700, 20); X.fillStyle = '#ffd6d6'; X.textAlign = 'left'; X.fillText('PERDE', mx, my - 8);
      X.textAlign = 'right'; X.fillStyle = '#d6ffcc'; X.fillText('VENCE', mx + mw, my - 8);
      X.textAlign = 'center'; X.fillStyle = '#fff'; X.font = FONT(700, 24); X.fillText(g.foeName, cx, my + 58);
      // medidor de força: toque com o ponteiro no verde
      const pw = Math.min(K.AW - 60, 460), px = cx - pw / 2, py = 900, [za, zb] = this.zone(g), c = this.cursor(g);
      fr(px, py, pw, 30, 15, 'rgba(0,0,0,.4)');
      fr(px + pw * za, py + 4, pw * (zb - za), 22, 8, g.perfT > 0 ? '#d6ffcc' : '#7ed957');
      fr(px + pw * c - 5, py - 8, 10, 46, 5, '#fff'); RR(px + pw * c - 5, py - 8, 10, 46, 5); stroke(3, '#3a2428');
      if (g.phase === 'fight' && g.n === 0 && g.score === 0 && Math.abs(g.bal) < 0.3) pill(cx, py - 40, Math.min(K.AW - 40, 380), 40, 'Toque no verde!', '#4ea83c');
      if (g.phase === 'intro') pill(cx, 450, Math.min(K.AW - 40, 520), 64, `Rodada ${g.n + 1}: ${g.foeName}`, '#c4302b');
      drawParts();
      hud(`🏆 ${g.score}`);
    },
    reward(g) { return g.score * 4; },
  });
});
