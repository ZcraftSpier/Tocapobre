'use strict';
// Minigame do Fliperama: Pula-corda
// Dois moradores batem a corda cantando "Salada, saladinha..."; toque para pular
// quando a corda chegar no chão. No "foguinho!" a corda dispara por alguns giros.
Mini.addGame((K) => {
  const { FONT, burst, drawHero, drawParts, end, flash, hud, pill, ring, say, sideShade, sky, vib, cast } = K;
  // a partir da fase 2 do horror (js/horror.js), algo estranho aparece neste jogo
  const creepy = () => typeof Horror !== 'undefined' && Horror.stage >= 2;
  const FLOOR = 860, TOP = 520, GRAV = 2800;
  // tamanho dos personagens acompanha a largura da área de jogo (no retrato ficam menores)
  const ts = () => clamp(K.AW / 900, 0.42, 0.62), hsz = () => ts() * 0.82;
  const CANTIGA = ['Salada,', 'saladinha,', 'bem', 'temperadinha,', 'com sal,', 'pimenta,', 'fogo,', 'foguinho!'];
  const TREZE = ['Treze,', 'treze,', 'treze,', 'treze,', 'treze,', 'treze,', 'treze,', 'treze...'];
  const sleeveOf = (e) => SLEEVE[e.top] || 30;
  function clone(src) { return Object.assign({}, src, { x: 0, y: 0, state: 'idle', hold: null, seat: null, seatEnt: null, sq: 0, reactT: 0, moving: false, dancing: false, ang: 0, pop: null, swing: 0, stare: 0, eatT: 0 }); }
  return ({
    id: 'pula', n: 'Pula-corda', ic: '🪢', col: '#ffe08a', per: 6,
    help: 'Toque para pular quando a corda chegar no chão! Pular bem na hora vale mais. No "foguinho!" a corda dispara — aguente firme. Você tem 3 vidas. (Teclado: espaço)',
    stars: [15, 35, 60],
    start() {
      const L = cast().filter((c) => !K.hero || c.name !== K.hero.name);
      const pool = L.length >= 2 ? L : L.concat([C('Bia', 'casa', 0, 0), C('Rui', 'casa', 0, 0)]);
      const a = pick(pool), b = pick(pool.filter((c) => c !== a));
      return { turners: [clone(a), clone(b)], phi: Math.PI * 0.4, period: 1.6, basePeriod: 1.6, y: 0, vy: 0, jumpT: 0, airT: 0, lives: 3, score: 0, combo: 0, word: 0, fire: 0, trip: 0, joyT: 0, treze: false, laps: 0 };
    },
    // altura do pulo depende da velocidade da corda (corda rápida = pulinho curto)
    airTime(g) { return clamp(g.period * 0.6, 0.3, 0.62); },
    jump(g) {
      if (g.y > 0.5 || g.trip > 0) return;
      const T = this.airTime(g); g.airT = T; g.jumpT = 0; g.vy = GRAV * T / 2; Sfx.boing(); vib(6);
    },
    tap(g) { this.jump(g); },
    key(g, k) { if (k === ' ' || k === 'ArrowUp' || k === 'Enter') this.jump(g); },
    turnerX(i) { return K.AX + K.AW / 2 + (i ? 1 : -1) * Math.min(K.AW * 0.36, 330); },
    // mão que gira a corda (coordenadas do personagem e do mundo)
    hand(g, i) {
      const k = i ? -1 : 1, lx = k * (92 + 6 * Math.sin(g.phi)), ly = -150 + 34 * Math.cos(g.phi);
      return { lx, ly, x: this.turnerX(i) + lx * ts(), y: FLOOR + ly * ts() };
    },
    pass(g) {
      // a corda chegou no chão: quem estava no ar passou
      const cx = K.AX + K.AW / 2;
      if (g.y > 18) {
        const perfect = g.jumpT > g.airT * 0.25 && g.jumpT < g.airT * 0.75;
        g.combo++; const pts = perfect ? 2 : 1; g.score += pts; g.joyT = 0.3;
        if (perfect) { say(cx, FLOOR - 260, `Perfeito! +2`, '#ffd23f'); ring(cx, FLOOR - 10, '#ffd23f', 80); vib(12); } else Sfx.pop();
        // no foguinho a corda gira rápido por alguns giros, depois volta ao normal
        if (g.fire > 0) {
          g.fire--; burst(cx, FLOOR, 6, ['#ff9f43', '#ffd23f', '#ff6b6b'], 260);
          if (!g.fire) { g.period = Math.max(0.62, g.basePeriod - 0.03); say(cx, FLOOR - 340, 'Ufa!', '#7ed957'); }
          return;
        }
        // a dupla canta a próxima palavra (no horror, às vezes só conta "treze")
        const words = g.treze ? TREZE : CANTIGA;
        say(this.turnerX(g.word % 2), FLOOR - 300, words[g.word % words.length], g.treze ? '#c9ced8' : '#fff');
        g.word++;
        g.period = Math.max(0.56, g.period - 0.035);
        if (g.word % CANTIGA.length === 0) {
          if (!g.treze) { g.fire = 6; g.basePeriod = g.period; g.period = Math.max(0.42, g.period * 0.62); Sfx.whoosh(); flash('#ffb066', 0.15); say(cx, FLOOR - 380, 'FOGUINHO!', '#ff6b4a'); }
          g.treze = creepy() && Math.random() < 0.35;
          for (const o of g.turners) o.stare = g.treze ? 1e9 : 0;
        }
      } else {
        // tropeçou: a corda bate nas pernas e para um pouquinho
        g.lives--; g.combo = 0; g.trip = 0.9; g.fire = 0; g.word = 0; g.treze = false; for (const o of g.turners) o.stare = 0;
        g.period = Math.min(1.6, g.period + 0.2);
        K.shake = 0.3; flash('#ff6b6b', 0.18); vib(80); Sfx.squeak(); say(cx, FLOOR - 260, 'Ops!', '#ff6b6b');
        if (g.lives <= 0) g.over = 0.001;
      }
    },
    update(g, dt) {
      g.joyT -= dt;
      if (g.over) { g.over += dt; if (g.over > 1.2) return end(); return; }
      // pulo
      if (g.y > 0 || g.vy > 0) { g.jumpT += dt; g.vy -= GRAV * dt; g.y = Math.max(0, g.y + g.vy * dt); if (g.y === 0) g.vy = 0; }
      if (g.trip > 0) { g.trip -= dt; return; }
      // a corda gira; quando passa por um múltiplo de 2π, está no chão
      const before = Math.floor(g.phi / TAU);
      g.phi += TAU / g.period * dt;
      if (Math.floor(g.phi / TAU) > before) this.pass(g);
    },
    drawRope(g, front) {
      // a corda está na frente quando desce (antes de passar no chão) e atrás quando sobe
      const s = Math.sin(g.phi % TAU);
      if (front !== s < 0) return;
      const a = this.hand(g, 0), b = this.hand(g, 1), cx = K.AX + K.AW / 2;
      const midY = (FLOOR + 6 + TOP) / 2 + (FLOOR + 6 - TOP) / 2 * Math.cos(g.phi);
      const C2 = [2 * cx - (a.x + b.x) / 2, 2 * midY - (a.y + b.y) / 2];
      const col = g.treze ? '#2a1d2a' : g.fire > 0 ? '#ff7a2f' : '#ff5d8f';
      X.beginPath(); X.moveTo(a.x, a.y); X.quadraticCurveTo(C2[0], C2[1], b.x, b.y); stroke(front ? 8 : 6, col);
      if (g.fire > 0 && Math.random() < 0.6) burst(cx + rand(-120, 120), midY, 1, ['#ffd23f', '#ff9f43'], 120);
    },
    draw(g) {
      const cx = K.AX + K.AW / 2;
      // pátio da escola ao entardecer
      sky('#ffd6a5', '#fff4e6');
      fe(K.VW * 0.2, 760, K.VW * 0.45, 120, '#bfe8a8'); fe(K.VW * 0.8, 770, K.VW * 0.5, 130, '#a6df8f');
      fr(-20, 740, K.VW + 40, 300, 0, '#e8d6b8'); fr(-20, 740, K.VW + 40, 8, 0, '#d6c19c');
      for (let i = 0; i < 9; i++) { const x = ((i * 137) % 1000) / 1000 * K.VW; fr(x, 790 + (i % 3) * 40, 60, 6, 3, 'rgba(160,120,80,.25)'); }
      sideShade();
      this.drawRope(g, false);
      // quem bate a corda: o braço de dentro gira a ponta da corda (braço com cotovelo, art.js)
      g.turners.forEach((o, i) => {
        const k = i ? -1 : 1, h = this.hand(g, i);
        o.armPose = {
          [k > 0 ? 'R' : 'L']: { e: [k * 64, -132 + 10 * Math.cos(g.phi)], h: [h.lx, h.ly] },
          [k > 0 ? 'L' : 'R']: { e: [-k * 62, -140], h: [-k * 70, -100] },
        };
        o.reactT = g.trip > 0 && !o.stare ? 1 : 0;
        X.save(); X.translate(this.turnerX(i), FLOOR); X.scale(ts(), ts()); softShadow(0, 2, 70, 0.25); drawChar(o, K.t, true);
        fc(h.lx, h.ly, 14, '#a0754d');   // cabo da corda
        X.restore();
      });
      // você, pulando no meio
      softShadow(cx, FLOOR + 2, 60 - g.y * 0.15, 0.25);
      drawHero(cx, FLOOR - g.y, hsz(), { joy: g.y > 5, rot: g.trip > 0 ? Math.sin(K.t * 30) * 0.15 : 0 });
      this.drawRope(g, true);
      drawParts();
      hud(String(g.score), null, g.lives);
      if (g.combo >= 5) pill(K.VW / 2, 160, 190, 40, `Sequência ${g.combo}`, '#ff5f9e');
      if (g.score === 0 && g.lives === 3) pill(cx, 300, Math.min(K.AW - 40, 460), 48, 'Pule quando a corda chegar no chão!', '#c45b8f');
    },
    reward(g) { return Math.floor(g.score / this.per); },
  });
});
