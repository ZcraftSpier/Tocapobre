'use strict';
// Minigame do Fliperama: Rinha de Galo
// Recebe o kit K do Fliperama (js/minigames.js). Valores que mudam a cada
// quadro (posição da área de jogo, tempo, tremida...) são lidos como K.nome.
Mini.addGame((K) => {
  const { FONT, burst, drawParts, end, flash, hitstop, hud, pill, ring, say, sky, vib } = K;
  // ---------- 7. Rinha de Galo ----------
  // Luta por tempo: bica com o medidor no meio para causar mais dano e
  // defende quando o rival se arma ("!"). Cada vitória traz um rival mais forte.
  const RIVAIS = [
    { n: 'Pintado', body: '#e8e2d4', neck: '#f2c75c', tail: '#3a3d58', spots: '#8a7a66' },
    { n: 'Carijó', body: '#8a8f99', neck: '#c9ced8', tail: '#2f3241', spots: '#ffffff' },
    { n: 'Pescoço Pelado', body: '#c4302b', neck: '#ff9b8a', tail: '#1f4d3a' },
    { n: 'Garnizé Brabo', body: '#d98b2b', neck: '#ffd23f', tail: '#2a2a3a' },
    { n: 'Índio', body: '#5a3520', neck: '#c45b2b', tail: '#14303a' },
    { n: 'Tinhoso', body: '#24222e', neck: '#7a1f2b', tail: '#0d0c12', eye: '#ffd23f' },
  ];
  const HEROI_GALO = { n: 'Seu galo', body: '#c8452c', neck: '#f0a030', tail: '#1f4d3a' };
  // galo com os pés em (x, y), virado para a direita (dir = 1) ou esquerda (-1)
  function galoArt(x, y, s, c, o = {}) {
    X.save(); X.translate(x, y);
    if (o.ko) { X.translate(0, -30 * s); X.rotate(-Math.PI / 2 * o.ko); }
    X.scale(s * (o.dir || 1), s);
    const bob = o.ko ? 0 : Math.sin(K.t * 6 + (o.ph || 0)) * 3, up = o.up || 0, lunge = o.lunge || 0;
    X.translate(lunge * 60, 0);
    // pernas e esporas
    for (const k of [-1, 1]) {
      const lx = k * 14 + 6;
      line(lx, -52, lx + (o.ko ? 0 : k * 3), -4, 7, '#e8b23a');
      line(lx, -4, lx + 18, 0, 5, '#e8b23a'); line(lx, -4, lx - 12, 0, 5, '#e8b23a');
      line(lx - 2, -22, lx - 14, -20, 4, '#f3e6c4');
    }
    X.translate(0, bob - up * 30);
    X.rotate(-up * 0.25 + lunge * 0.25);
    // cauda
    const tc = [c.tail, shade(c.tail, 0.25), shade(c.tail, -0.2)];
    for (let i = 0; i < 6; i++) {
      const a = 0.3 + i * 0.18 + Math.sin(K.t * 3 + i) * 0.03;
      X.beginPath(); X.moveTo(-40, -80); X.quadraticCurveTo(-70 - i * 6, -150 - i * 6 + a * 20, -95 - i * 8 + a * 30, -70 + i * 12);
      stroke(12 - i, tc[i % 3]);
    }
    // corpo
    fe(0, -82, 56, 40, c.body);
    if (c.spots) for (let i = 0; i < 10; i++) fc(-36 + srand(i) * 70, -100 + srand(i + 4) * 36, 4, c.spots);
    // asa (levantada ao defender)
    X.save(); X.translate(-4, -84); X.rotate(o.guard ? -0.9 : 0.15 + Math.sin(K.t * 6) * 0.03);
    fe(0, 0, 36, 22, shade(c.body, -0.2)); for (let i = 0; i < 3; i++) line(-20 + i * 10, 4, -30 + i * 10, 16, 3, shade(c.body, -0.35));
    X.restore();
    // pescoço e cabeça
    fpoly([22, -108, 40, -150, 62, -146, 52, -96], c.neck);
    fc(50, -150, 20, c.neck);
    fpoly([36, -166, 42, -184, 50, -170, 56, -188, 62, -168, 68, -178, 66, -160], '#e8283f');
    fpoly([66, -154, 86, -148, 66, -142], '#f2b33a');
    fe(62, -132, 6, 10, '#e8283f');
    if (o.ko) { line(50, -158, 58, -150, 3, '#2a1d1a'); line(58, -158, 50, -150, 3, '#2a1d1a'); }
    else {
      fc(54, -156, 6, '#fff'); fc(56, -156, 3.4, c.eye || '#2a1d1a');
      if (o.mad) line(46, -166, 62, -160, 3.5, '#2a1d1a');
    }
    if (o.hurt > 0) { X.globalAlpha = Math.min(1, o.hurt * 3) * 0.6; fe(10, -100, 70, 60, '#ffffff'); X.globalAlpha = 1; }
    X.restore();
  }
  return ({
    id: 'rinha', n: 'Rinha de Galo', ic: '🐓', col: '#ffb38a', per: 1,
    help: 'BICAR com o ponteiro no meio da barra acerta forte. Quando o rival mostrar "!", DEFENDER — e bique logo depois para um contra-ataque! Críticos e defesas enchem a ESPORADA. Cuidado: rivais fortes fingem. (Teclado: J bica, F defende)',
    stars: [2, 4, 7],
    start() {
      const g = { score: 0, hp: 100, lvl: 0, mt: 0, atkCD: 0, defCD: 0, defT: 0, lunge: 0, hurt: 0, phase: 'intro', timer: 1.4, dmg: 0, sp: 0, counter: 0 };
      this.newRival(g);
      return g;
    },
    newRival(g) {
      const L = g.lvl, R = RIVAIS[L % RIVAIS.length];
      g.e = { ...R, n: L >= RIVAIS.length ? `${R.n} ${Math.floor(L / RIVAIS.length) + 1}` : R.n, hp: 60 + L * 15, max: 60 + L * 15, st: 'idle', timer: 1.2, lunge: 0, hurt: 0, ko: 0 };
      g.phase = 'intro'; g.timer = 1.4; g.mt = 0;
      setTimeout(() => K.open && Sfx.bell(), 200);
    },
    meter(g) { return 1 - Math.abs((g.mt % 2) - 1); },
    pos(g) { return { px: K.AX + K.AW * 0.3, ex: K.AX + K.AW * 0.7, gy: 760, s: Math.min(1.25, K.AW / 640) }; },
    attack(g) {
      if (g.phase !== 'fight' || g.atkCD > 0) return;
      const e = g.e, { ex } = this.pos(g);
      g.atkCD = 0.45; g.lunge = 0.25;
      let dmg;
      if (g.sp >= 1) {
        // ESPORADA: golpe especial com a barra cheia
        g.sp = 0; dmg = 40 + g.lvl * 6; g.atkCD = 0.7;
        Sfx.poof(); Sfx.knock(); e.hurt = 0.5; K.shake = 0.5; hitstop(0.18); flash('#ffd23f', 0.3); vib([40, 30, 80]);
        burst(ex - 20, 640, 34, [e.body, e.neck, e.tail, '#fff', '#ffd23f'], 700); ring(ex, 640, '#ffd23f', 220); ring(ex, 640, '#fff', 140);
        say(ex, 440, 'ESPORADA!', '#ffd23f');
        if (e.st === 'wind' || e.st === 'idle') { e.st = 'stun'; e.timer = 1.1; }
      } else {
        const acc = 1 - Math.abs(this.meter(g) - 0.5) * 2, crit = acc > 0.86, ctr = g.counter > 0;
        dmg = 5 + 13 * acc;
        if (crit) dmg *= 1.8;
        if (e.st === 'stun') dmg *= 1.3;
        if (ctr) { dmg *= 1.5; g.counter = 0; }
        if (e.st === 'idle' && !crit && !ctr && Math.random() < Math.min(0.35, 0.08 + g.lvl * 0.04)) {
          dmg *= 0.3; Sfx.knock(); say(ex, 480, 'Desviou!', '#c9ced8');
        } else {
          Sfx.poof(); e.hurt = 0.3; K.shake = crit ? 0.25 : 0.1; vib(crit ? 35 : 12);
          burst(ex - 20, 640, crit ? 14 : 7, [e.body, e.neck, e.tail, '#fff'], crit ? 460 : 300);
          if (crit || ctr) { hitstop(0.06); ring(ex, 640, crit ? '#ffd23f' : '#9fd3ff', 110); }
          if (ctr) say(ex, 410, 'Contra-ataque!', '#9fd3ff');
          if (crit) { g.sp = Math.min(1, g.sp + 0.34); say(ex, 480, 'Crítico!', '#ffd23f'); if (e.st === 'wind') { e.st = 'stun'; e.timer = 0.9; say(ex, 420, 'Atordoado!', '#ff8fbd'); } }
        }
      }
      e.hp = Math.max(0, e.hp - dmg); g.dmg += dmg;
      if (e.hp <= 0) { e.st = 'ko'; g.phase = 'won'; g.timer = 1.8; g.score++; Sfx.sparkle(); setTimeout(() => K.open && Sfx.ding(), 300); say(K.AX + K.AW / 2, 360, 'Vitória!', '#7ed957'); }
    },
    defend(g) {
      if (g.phase !== 'fight' || g.defCD > 0) return;
      g.defT = 0.38; g.defCD = 0.6; Sfx.click();
    },
    tap(g, x, y) {
      if (y < 820) return;
      if (x < K.AX + K.AW / 2) this.attack(g); else this.defend(g);
    },
    key(g, k) {
      if (k === 'j' || k === 'J' || k === 'ArrowRight') this.attack(g);
      if (k === 'f' || k === 'F' || k === 'ArrowLeft' || k === ' ') this.defend(g);
    },
    update(g, dt) {
      const e = g.e, L = g.lvl, { px, ex } = this.pos(g);
      g.atkCD -= dt; g.defCD -= dt; g.defT -= dt; g.counter -= dt; g.lunge = Math.max(0, g.lunge - dt); g.hurt -= dt;
      e.lunge = Math.max(0, e.lunge - dt); e.hurt -= dt;
      g.mt += dt * (1.15 + L * 0.09);
      if (g.phase === 'intro') { g.timer -= dt; if (g.timer <= 0) g.phase = 'fight'; return; }
      if (g.phase === 'won') {
        e.ko = Math.min(1, e.ko + dt * 4); g.timer -= dt;
        if (g.timer <= 0) { g.lvl++; g.hp = Math.min(100, g.hp + 35); this.newRival(g); }
        return;
      }
      if (g.phase === 'lost') { g.ko = Math.min(1, (g.ko || 0) + dt * 4); g.timer -= dt; if (g.timer <= 0) return end(); return; }
      e.timer -= dt;
      if (e.st === 'idle' && e.timer <= 0) { e.st = 'wind'; e.timer = Math.max(0.36, 0.85 - L * 0.06); e.feint = L >= 2 && Math.random() < Math.min(0.35, 0.12 + L * 0.04); Sfx.cluck(); }
      else if (e.st === 'wind' && e.timer <= 0 && e.feint) {
        // finta: se armou mas não atacou... e ataca logo em seguida
        e.feint = false; e.st = 'idle'; e.timer = 0.25; say(ex, 470, 'Finta!', '#c9ced8');
      } else if (e.st === 'wind' && e.timer <= 0) {
        e.st = 'strike'; e.timer = 0.2; e.lunge = 0.25;
        if (g.defT > 0) {
          e.st = 'stun'; e.timer = 0.9; Sfx.knock(); K.shake = 0.15; g.counter = 0.6; g.sp = Math.min(1, g.sp + 0.25); hitstop(0.05); vib(25);
          say(px, 480, 'Defendeu!', '#9fd3ff'); burst(px + 60, 640, 8, ['#fff', '#c9ced8'], 300); ring(px + 50, 640, '#9fd3ff', 100);
        } else {
          const d = 10 + L * 2.2;
          g.hp = Math.max(0, g.hp - d); g.hurt = 0.3; K.shake = 0.3; Sfx.poof(); flash('#ff4d4d', 0.2); vib(70); hitstop(0.05);
          burst(px + 20, 640, 10, [HEROI_GALO.body, HEROI_GALO.neck, '#fff'], 380); say(px, 480, `-${Math.round(d)}`, '#ff6b6b');
          if (g.hp <= 0) { g.phase = 'lost'; g.timer = 1.6; Sfx.squeak(); }
        }
      } else if ((e.st === 'strike' || e.st === 'stun') && e.timer <= 0) { e.st = 'idle'; e.timer = rand(0.7, 1.5) * Math.max(0.5, 1 - L * 0.05); }
      void ex;
    },
    draw(g) {
      // céu de fim de tarde
      sky('#3b2a4f', '#e8835a');
      const { px, ex, gy, s } = this.pos(g), e = g.e;
      fc(K.AX + K.AW * 0.8, 470, 70, 'rgba(255,214,140,.85)');
      // plateia de sombras atrás da cerca (olhinhos que piscam...)
      const nP = Math.max(6, Math.round(K.VW / 90));
      for (let i = 0; i < nP; i++) {
        const x = (i + 0.5) * K.VW / nP + srand(i) * 20, h = 70 + srand(i + 3) * 40, y = 600 - h;
        fc(x, y, 30 + srand(i + 7) * 8, '#1d1426'); fr(x - 34, y + 10, 68, 140, 26, '#1d1426');
        if (Math.sin(K.t * 0.7 + i * 1.7) > -0.85) { fc(x - 9, y - 2, 3, 'rgba(255,230,160,.7)'); fc(x + 9, y - 2, 3, 'rgba(255,230,160,.7)'); }
      }
      // cerca do terreiro
      fr(-20, 600, K.VW + 40, 14, 4, '#6b4529'); fr(-20, 650, K.VW + 40, 14, 4, '#6b4529');
      for (let x = -10; x < K.VW + 40; x += 70) fr(x, 580, 14, 110, 4, '#5a3520');
      // chão de terra
      X.fillStyle = LG(0, 680, 0, 1000, '#b07a4a', '#7a4b2a'); X.fillRect(-20, 690, K.VW + 40, 320);
      fe(K.AX + K.AW / 2, gy + 10, K.AW * 0.42, 50, 'rgba(255,220,170,.18)');
      for (let i = 0; i < 40; i++) fc(srand(i + 20) * K.VW, 720 + srand(i + 40) * 260, 3, 'rgba(60,35,20,.25)');
      // galos
      softShadow(px, gy + 2, 90 * s, 0.3); softShadow(ex, gy + 2, 90 * s, 0.3);
      galoArt(px, gy, s, HEROI_GALO, { dir: 1, lunge: g.lunge > 0 ? Math.sin(Math.PI * (1 - g.lunge / 0.25)) * 1.2 : 0, guard: g.defT > 0, hurt: g.hurt, ko: g.ko || 0 });
      galoArt(ex, gy, s, e, { dir: -1, ph: 2, mad: true, up: e.st === 'wind' ? 1 : 0, lunge: e.lunge > 0 ? Math.sin(Math.PI * (1 - e.lunge / 0.25)) * 1.4 : 0, hurt: e.hurt, ko: e.ko });
      if (e.st === 'wind') { X.font = FONT(700, 80); X.textAlign = 'center'; X.fillStyle = '#ff4d4d'; X.lineWidth = 8; X.strokeStyle = '#fff'; X.strokeText('!', ex, 470 - Math.sin(K.t * 20) * 6); X.fillText('!', ex, 470 - Math.sin(K.t * 20) * 6); }
      if (e.st === 'stun') for (let i = 0; i < 3; i++) { const a = K.t * 5 + i * TAU / 3; fc(ex + Math.cos(a) * 40, 520 + Math.sin(a) * 12, 7, '#ffd23f'); }
      // barras de vida
      const bw = Math.min(K.AW * 0.4, 360);
      const bar = (x, v, max, nm, col) => {
        X.font = FONT(700, 26); X.textAlign = 'center'; X.fillStyle = '#fff'; X.fillText(nm, x, 182);
        fr(x - bw / 2, 196, bw, 26, 13, 'rgba(0,0,0,.35)');
        fr(x - bw / 2 + 3, 199, Math.max(0, (bw - 6) * v / max), 20, 10, col);
      };
      bar(K.AX + K.AW * 0.25, g.hp, 100, HEROI_GALO.n, '#7ed957');
      // barra da esporada
      fr(K.AX + K.AW * 0.25 - bw / 2, 230, bw, 12, 6, 'rgba(0,0,0,.35)');
      fr(K.AX + K.AW * 0.25 - bw / 2 + 2, 232, Math.max(0, (bw - 4) * g.sp), 8, 4, g.sp >= 1 ? (Math.sin(K.t * 12) > 0 ? '#ffd23f' : '#fff6c4') : '#ffb02e');
      bar(K.AX + K.AW * 0.75, e.hp, e.max, e.n, '#ff6b6b');
      // medidor de força
      const mw = Math.min(K.AW * 0.7, 520), mx = K.AX + K.AW / 2 - mw / 2, my = 290, m = this.meter(g);
      fr(mx, my, mw, 30, 15, 'rgba(0,0,0,.35)');
      fr(mx + mw * 0.07, my + 4, mw * 0.86, 22, 11, LG(mx, 0, mx + mw, 0, '#ff6b6b', '#ffd23f', '#7ed957', '#ffd23f', '#ff6b6b'));
      fr(mx + mw * 0.43, my + 4, mw * 0.14, 22, 6, 'rgba(255,255,255,.55)');
      fr(mx + mw * m - 5, my - 8, 10, 46, 5, '#fff'); RR(mx + mw * m - 5, my - 8, 10, 46, 5); stroke(3, '#3a2428');
      // botões
      const by = 840, bh = 130, half = K.AW / 2;
      const btn = (x, lab, col, on) => {
        fr(x + 14, by + 8, half - 28, bh, 26, shade(col, -0.3));
        fr(x + 14, by + (on ? 8 : 0), half - 28, bh, 26, col);
        X.font = FONT(700, Math.min(44, (half - 50) / (lab.length * 0.62))); X.textAlign = 'center'; X.fillStyle = '#fff'; X.fillText(lab, x + half / 2, by + bh / 2 + 14 + (on ? 8 : 0));
      };
      if (g.sp >= 1) btn(K.AX, '⚡ ESPORADA', g.atkCD > 0 ? '#c9a84a' : (Math.sin(K.t * 10) > 0 ? '#ffc21a' : '#ffb02e'), g.atkCD > 0);
      else btn(K.AX, g.counter > 0 ? '💥 CONTRA!' : '🐓 BICAR', g.atkCD > 0 ? '#c98a6a' : g.counter > 0 ? '#ff5f9e' : '#ff7a45', g.atkCD > 0);
      btn(K.AX + half, '🛡️ DEFENDER', g.defCD > 0 ? '#7a8aa8' : '#4d8af7', g.defT > 0);
      if (g.phase === 'intro') {
        pill(K.AX + K.AW / 2, 420, Math.min(K.AW - 40, 520), 70, `Round ${g.lvl + 1}: ${e.n}`, '#c4302b');
      }
      drawParts();
      hud(`🏆 ${g.score}`);
    },
    reward(g) { return g.score * 3 + Math.floor(g.dmg / 100); },
  });
});
