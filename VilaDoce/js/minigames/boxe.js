'use strict';
// Minigame do Fliperama: Boxe da Vila
// Recebe o kit K do Fliperama (js/minigames.js). Valores que mudam a cada
// quadro (posição da área de jogo, tempo, tremida...) são lidos como K.nome.
Mini.addGame((K) => {
  const { FONT, burst, cast, drawParts, end, flash, hitstop, hud, pill, ring, say, sky, starPath, vib } = K;
  // ---------- 8. Boxe da Vila ----------
  // Luta em primeira pessoa contra os moradores da vila. O rival se defende:
  // bata quando a guarda estiver baixa, esquive dos socos (o "!" avisa) e
  // contra-ataque logo depois para ganhar estrelas, que viram o SUPER SOCO.
  const BOX_TIPS = ['Jab', 'Gancho', 'Gancho', 'Uppercut'];
  function luva(x, y, r, col, flip = 1) {
    fe(x, y + r * 0.95, r * 0.62, r * 0.32, '#ffffff');
    fe(x, y, r, r * 1.08, col);
    fe(x + flip * r * 0.78, y + r * 0.15, r * 0.36, r * 0.52, shade(col, -0.12));
    fe(x - flip * r * 0.3, y - r * 0.45, r * 0.32, r * 0.2, 'rgba(255,255,255,.45)', -0.4 * flip);
    X.beginPath(); X.ellipse(x, y, r, r * 1.08, 0, 0, TAU); stroke(r * 0.07, 'rgba(58,36,40,.45)');
  }
  return ({
    id: 'boxe', n: 'Boxe da Vila', ic: '🥊', col: '#ff8a8a', per: 1,
    help: 'Soque (👊) quando a guarda do rival estiver baixa. Quando aparecer "!", ESQUIVE (⬅ ➡) — no gancho, fuja para o lado contrário da luva! Socar logo depois de esquivar rende ⭐, e as estrelas viram o SUPER SOCO. (Teclado: A/D esquiva, J/K soca, espaço = super)',
    stars: [1, 3, 5],
    start() {
      const L = cast().filter((c) => !K.hero || c.name !== K.hero.name);
      const roster = L.map((c) => Object.assign({}, c));
      while (roster.length < 3) roster.push(Object.assign(C(pick(NAMES), 'casa', 0, 0), {}));
      const g = { roster, n: 0, score: 0, hp: 100, stars: 0, dmg: 0, dodge: 0, dodT: 0, dodCD: 0, lastDodge: -9, pT: [0, 0], pCD: 0, hurt: 0, phase: 'intro', timer: 1.6, blockN: 0 };
      this.newFoe(g);
      return g;
    },
    newFoe(g) {
      const src = g.roster[g.n % g.roster.length], lap = Math.floor(g.n / g.roster.length);
      const o = Object.assign({}, src, { x: 0, y: 0, state: 'idle', hold: null, seat: null, seatEnt: null, sq: 0, reactT: 0, moving: false, dancing: false, ang: 0, pop: null, swing: 0 });
      g.o = o; g.foeName = src.name + (lap ? ` ${lap + 1}` : '');
      const L = g.n;
      g.f = { hp: 90 + L * 25, max: 90 + L * 25, st: 'guard', guard: 'high', gT: 1, timer: 1.2, side: 1, kind: 'jab', hurt: 0, ko: 0, downs: 0, count: 0, combo: 0 };
      g.phase = 'intro'; g.timer = 1.6;
      setTimeout(() => K.open && Sfx.bell(), 250);
    },
    lvl(g) { return g.n; },
    // ---- ações do jogador
    dodgeTo(g, d) {
      if (g.phase !== 'fight' || g.dodCD > 0) return;
      g.dodge = d; g.dodT = 0.42; g.dodCD = 0.6; g.lastDodge = -9; Sfx.whoosh();
    },
    punch(g, side) {
      if (g.phase !== 'fight' || g.pCD > 0 || g.dodT > 0.15) return;
      g.pT[side] = 0.2; g.pCD = 0.24;
      const f = g.f, cx = K.AX + K.AW / 2, hy = 420;
      if (f.st === 'down') return;
      const counter = f.st === 'open' && g.lastDodge > 0;
      let dmg = 0;
      if (f.st === 'open' || f.st === 'hurt') dmg = counter ? 11 : 7;
      else if (f.st === 'tell' && f.timer > 0.25) { dmg = 9; f.st = 'hurt'; f.timer = 0.5; say(cx, hy - 120, 'Interrompeu!', '#9fd3ff'); }
      else if (f.st === 'guard' && f.guard === 'low') dmg = 5;
      if (!dmg) {
        // bateu na guarda
        Sfx.knock(); burst(cx + (side ? 40 : -40), hy + 60, 4, ['#fff', '#ffd0d0'], 200); say(cx, hy - 100, 'Bloqueou', '#c9ced8');
        if (++g.blockN >= 3 && f.st === 'guard') { g.blockN = 0; f.st = 'tell'; f.kind = 'jab'; f.side = side ? -1 : 1; f.timer = 0.32; f.quick = true; }
        return;
      }
      g.blockN = 0;
      if (counter) {
        g.lastDodge = -9;
        if (g.stars < 3) { g.stars++; Sfx.ding(); say(cx, hy - 170, '⭐ Estrela!', '#ffd23f'); ring(cx, hy, '#ffd23f', 130); }
      }
      this.hitFoe(g, dmg, counter ? 0.06 : 0.03, side);
    },
    superPunch(g) {
      if (g.phase !== 'fight' || !g.stars || g.pCD > 0) return;
      const f = g.f, cx = K.AX + K.AW / 2;
      if (f.st === 'down') return;
      const dmg = 16 * g.stars + 8; g.stars = 0; g.pT = [0.2, 0.2]; g.pCD = 0.6;
      if (f.st === 'punch') return; // trocou soco: o dele chega antes
      say(cx, 260, 'SUPER SOCO!', '#ffd23f'); flash('#ffd23f', 0.3); hitstop(0.2); vib([50, 30, 100]);
      ring(cx, 380, '#ffd23f', 260); ring(cx, 380, '#fff', 160);
      this.hitFoe(g, dmg, 0, 0, true);
      if (f.st !== 'down') { f.st = 'hurt'; f.timer = 0.9; }
    },
    hitFoe(g, dmg, stop, side, big) {
      const f = g.f, cx = K.AX + K.AW / 2, hy = 420;
      f.hp = Math.max(0, f.hp - dmg); g.dmg += dmg; f.hurt = 0.25;
      Sfx.poof(); vib(big ? 0 : 18); if (stop) hitstop(stop);
      K.shake = big ? 0.5 : 0.12;
      burst(cx + (side ? 30 : -30), hy + 20, big ? 30 : 9, ['#fff', '#ffd23f', '#ff8fbd'], big ? 700 : 340);
      say(cx + rand(-60, 60), hy - 60, `-${Math.round(dmg)}`, '#fff');
      if (f.st === 'guard') { f.st = 'hurt'; f.timer = 0.35; }
      if (f.hp <= 0) {
        f.st = 'down'; f.count = 0; f.timer = 0; f.downs++;
        Sfx.sparkle(); flash('#ffffff', 0.3); hitstop(0.25); vib(120); say(cx, 300, 'NOCAUTE!', '#ffd23f');
      }
    },
    tap(g, x, y) {
      if (this.starTap(g, x, y)) { this.superPunch(g); return; }
      if (y < 880) return;
      const q = Math.floor((x - K.AX) / (K.AW / 4));
      if (q <= 0) this.dodgeTo(g, -1); else if (q === 1) this.punch(g, 0); else if (q === 2) this.punch(g, 1); else this.dodgeTo(g, 1);
    },
    key(g, k) {
      if (k === 'a' || k === 'A' || k === 'ArrowLeft') this.dodgeTo(g, -1);
      if (k === 'd' || k === 'D' || k === 'ArrowRight') this.dodgeTo(g, 1);
      if (k === 'j' || k === 'J') this.punch(g, 0);
      if (k === 'k' || k === 'K') this.punch(g, 1);
      if (k === ' ' || k === 'ArrowUp' || k === 'w' || k === 'W') this.superPunch(g);
    },
    starTap(g, x, y) { return g.stars && Math.hypot(x - (K.AX + K.AW / 2), y - 840) < 60; },
    update(g, dt) {
      const f = g.f, L = this.lvl(g);
      g.dodT -= dt; g.dodCD -= dt; g.pCD -= dt; g.hurt -= dt; g.lastDodge -= dt; f.hurt -= dt;
      g.pT[0] = Math.max(0, g.pT[0] - dt); g.pT[1] = Math.max(0, g.pT[1] - dt);
      if (g.dodT <= 0) g.dodge = 0;
      if (g.phase === 'intro') { g.timer -= dt; if (g.timer <= 0) g.phase = 'fight'; return; }
      if (g.phase === 'won') { g.timer -= dt; f.ko = Math.min(1, f.ko + dt * 3); if (g.timer <= 0) { g.n++; g.hp = Math.min(100, g.hp + 45); g.stars = 0; this.newFoe(g); } return; }
      if (g.phase === 'lost') { g.timer -= dt; if (g.timer <= 0) return end(); return; }
      f.timer -= dt;
      if (f.st === 'down') {
        f.ko = Math.min(1, f.ko + dt * 3);
        f.count += dt * 1.4;
        // rivais a partir do segundo se levantam uma vez
        if (L >= 1 && f.downs < 2 && f.count >= 4) { f.st = 'guard'; f.guard = 'high'; f.gT = 1; f.timer = 0.8; f.hp = f.max * 0.4; f.ko = 0; say(K.AX + K.AW / 2, 300, 'Levantou!', '#ff8fbd'); Sfx.bell(); }
        else if (f.count >= (L >= 1 && f.downs < 2 ? 4 : 3)) { g.phase = 'won'; g.timer = 1.6; g.score++; Sfx.ding(); say(K.AX + K.AW / 2, 250, 'Vitória!', '#7ed957'); burst(K.AX + K.AW / 2, 400, 30, ['#ffd23f', '#ff8fbd', '#7ed957', '#4dabf7'], 650); }
        return;
      }
      if (f.st === 'guard') {
        f.gT -= dt; if (f.gT <= 0) { f.guard = f.guard === 'high' ? 'low' : 'high'; f.gT = f.guard === 'low' ? rand(0.5, 0.9) * Math.max(0.55, 1 - L * 0.08) : rand(0.6, 1.2); }
        if (f.timer <= 0) {
          // escolhe o golpe
          const kinds = L === 0 ? ['jab'] : L === 1 ? ['jab', 'gancho'] : ['jab', 'gancho', 'gancho', 'upper'];
          f.kind = pick(kinds); f.side = Math.random() < 0.5 ? -1 : 1; f.quick = false;
          f.st = 'tell'; f.timer = Math.max(0.42, 0.9 - L * 0.07) * (f.kind === 'upper' ? 1.3 : 1);
          f.combo = L >= 3 && Math.random() < 0.35 ? 1 : 0;
          Sfx.click();
        }
      } else if (f.st === 'tell' && f.timer <= 0) {
        f.st = 'punch'; f.timer = 0.22;
        // esquivou certo?
        const ok = g.dodT > 0 && (f.kind !== 'gancho' || g.dodge === -f.side);
        if (ok) {
          g.lastDodge = 0.85; say(K.AX + K.AW / 2 + g.dodge * 120, 520, 'Esquivou!', '#9fd3ff'); vib(15);
          f.missed = true;
        } else {
          const d = (10 + L * 3) * (f.kind === 'upper' ? 1.6 : f.kind === 'gancho' ? 1.2 : 1);
          g.hp = Math.max(0, g.hp - d); g.hurt = 0.35; g.stars = Math.max(0, g.stars - 1);
          K.shake = 0.4; flash('#ff4d4d', 0.25); vib(90); hitstop(0.08); Sfx.poof(); Sfx.squeak();
          burst(K.AX + K.AW / 2, 600, 14, ['#ff6b6b', '#fff'], 450); say(K.AX + K.AW / 2, 560, `-${Math.round(d)}`, '#ff6b6b');
          f.missed = false;
          if (g.hp <= 0) { g.phase = 'lost'; g.timer = 1.8; say(K.AX + K.AW / 2, 300, 'Nocauteado...', '#ff6b6b'); }
        }
      } else if (f.st === 'punch' && f.timer <= 0) {
        if (f.combo && !f.missed) { f.combo = 0; f.st = 'guard'; f.timer = 0.6; }
        else if (f.combo) { f.combo = 0; f.st = 'tell'; f.side = -f.side; f.kind = 'gancho'; f.timer = 0.38; }
        else if (f.missed) { f.st = 'open'; f.timer = f.kind === 'upper' ? 1.6 : 1.1; } // cansou: hora do contra-ataque
        else { f.st = 'guard'; f.timer = rand(0.9, 1.8) * Math.max(0.45, 1 - L * 0.08); }
      } else if ((f.st === 'open' || f.st === 'hurt') && f.timer <= 0) {
        f.st = 'guard'; f.guard = 'high'; f.gT = 0.8; f.timer = rand(0.9, 1.6) * Math.max(0.45, 1 - L * 0.08);
      }
    },
    draw(g) {
      const f = g.f, o = g.o, cx0 = K.AX + K.AW / 2;
      // ringue
      sky('#3a2a5c', '#ff9ec4');
      for (let i = 0; i < 40; i++) { const x = srand(i) * K.VW, y = 420 + srand(i + 7) * 120; fc(x, y, 16 + srand(i + 3) * 8, ['#ffb199', '#ffd23f', '#9fd3ff', '#c5a3ff', '#8fdc7a'][i % 5]); fc(x, y - 4 - Math.abs(Math.sin(K.t * 4 + i)) * 6, 10, 'rgba(255,255,255,.5)'); }
      X.fillStyle = 'rgba(58,40,80,.35)'; X.fillRect(-20, 400, K.VW + 40, 200);
      X.globalAlpha = 0.18; fe(cx0, 380, 300, 520, '#fff6d0'); X.globalAlpha = 1;
      fr(-20, 700, K.VW + 40, 320, 0, '#e8e0f2'); fr(-20, 700, K.VW + 40, 10, 0, '#cfc2e2');
      const dodX = g.dodT > 0 ? -g.dodge * 150 * Math.sin(Math.min(1, (0.42 - g.dodT) / 0.12) * Math.PI / 2) * Math.min(1, g.dodT / 0.12) : 0;
      // cordas
      ['#ff5d8f', '#ffffff', '#4dabf7'].forEach((c, i) => line(-20, 600 + i * 34, K.VW + 20, 600 + i * 34, 8, c));
      // rival
      const s = 1.25, by = 420 + 282 * s;
      let ox = dodX * 0.6, oy = 0, rot = 0, sc = 1;
      const bob = Math.sin(K.t * 5) * 8;
      if (f.st === 'guard') { ox += Math.sin(K.t * 2.2) * 26; oy += bob; }
      else if (f.st === 'tell') { rot = -f.side * 0.08 + Math.sin(K.t * 40) * 0.02; oy -= 20; ox += f.side * 30; }
      else if (f.st === 'punch') { sc = 1.08; oy += 20; rot = f.side * 0.1; ox += f.missed ? f.side * 120 : 0; }
      else if (f.st === 'open') { rot = Math.sin(K.t * 3) * 0.08; oy += 30; }
      else if (f.st === 'hurt') { rot = Math.sin(K.t * 50) * 0.04; oy -= 10; }
      if (f.hurt > 0) ox += Math.sin(K.t * 80) * 10;
      X.save(); X.translate(cx0 + ox, by + oy);
      if (f.st === 'down' || g.phase === 'won') { X.translate(0, f.ko * 200); X.rotate(f.ko * 1.2); }
      X.scale(s * sc, s * sc); X.rotate(rot);
      o.reactT = f.st === 'open' || f.st === 'hurt' || f.st === 'down' ? 1 : 0; o.blinkT = f.st === 'open' ? 0.05 : o.blinkT;
      drawChar(o, K.t, true);
      if (f.hurt > 0) { X.globalAlpha = f.hurt * 2; fe(0, -250, 90, 110, '#ffffff'); X.globalAlpha = 1; }
      // luvas do rival
      const R = 30, red = '#ff4d5e';
      if (f.st === 'guard' && f.guard === 'high') { luva(-34, -232, R, red, -1); luva(34, -232, R, red, 1); }
      else if (f.st === 'guard' || f.st === 'hurt') { luva(-62, -140, R, red, -1); luva(62, -140, R, red, 1); }
      else if (f.st === 'tell') {
        const sh = Math.sin(K.t * 50) * 3, up = f.kind === 'upper';
        luva(-f.side * 40, -228, R, red, -f.side);
        luva(f.side * (up ? 60 : 110) + sh, up ? -90 : -300, R * 1.1, red, f.side);
      } else if (f.st === 'punch') { luva(-f.side * 40, -228, R, red, -f.side); luva(f.side * 20, -210, R * (f.missed ? 1.4 : 2.4), red, f.side); }
      else { luva(-80, -110, R, red, -1); luva(80, -110, R, red, 1); }
      if (f.st === 'open') for (let i = 0; i < 3; i++) { const a = K.t * 5 + i * TAU / 3; starPath(Math.cos(a) * 60, -360 + Math.sin(a) * 14, 12, 5); X.fillStyle = '#ffd23f'; X.fill(); }
      X.restore();
      // aviso do golpe
      if (f.st === 'tell') {
        const lab = f.kind === 'gancho' ? (f.side > 0 ? 'Gancho ➡  fuja ⬅' : 'fuja ➡  ⬅ Gancho') : f.kind === 'upper' ? 'Uppercut!' : 'Jab!';
        X.font = FONT(700, 90); X.textAlign = 'center'; X.lineWidth = 9; X.strokeStyle = '#fff'; X.fillStyle = '#ff4d4d';
        const yy = 360 + Math.sin(K.t * 25) * 5, xx = clamp(cx0 + ox + f.side * 170, K.AX + 40, K.AX + K.AW - 40); X.strokeText('!', xx, yy); X.fillText('!', xx, yy);
        pill(cx0, 585, Math.min(K.AW - 40, 360), 44, lab, '#c4302b');
      }
      if (f.st === 'down') { X.font = FONT(700, 120); X.textAlign = 'center'; X.fillStyle = '#fff'; X.lineWidth = 10; X.strokeStyle = 'rgba(58,36,40,.6)'; const n = String(Math.min(10, Math.floor(f.count) + 1)); X.strokeText(n, cx0, 420); X.fillText(n, cx0, 420); }
      // luvas do jogador (primeira pessoa)
      const blue = '#4dabf7', gx = dodX * -0.5;
      for (const side of [0, 1]) {
        const k = g.pT[side] > 0 ? Math.sin(Math.PI * (1 - g.pT[side] / 0.2)) : 0;
        const bx = cx0 + (side ? 1 : -1) * K.AW * 0.24 + gx, byy = 800 + Math.sin(K.t * 5 + side) * 6;
        const x = lerp(bx, cx0 + (side ? 30 : -30), k), y = lerp(byy, 470, k), r = lerp(70, 42, k);
        luva(x, y, r, g.hurt > 0 ? '#ff8f8f' : blue, side ? -1 : 1);
      }
      if (g.hurt > 0) { X.globalAlpha = g.hurt; X.fillStyle = 'rgba(255,60,60,.35)'; X.fillRect(-20, -20, K.VW + 40, 1040); X.globalAlpha = 1; }
      // botões
      const bw = K.AW / 4, by2 = 900, bh = 90;
      [['⬅', '#9fb2ff'], ['👊', '#4dabf7'], ['👊', '#4dabf7'], ['➡', '#9fb2ff']].forEach(([lab, col], i) => {
        const x = K.AX + i * bw;
        fr(x + 6, by2 + 6, bw - 12, bh, 22, shade(col, -0.3)); fr(x + 6, by2, bw - 12, bh, 22, col);
        X.font = FONT(700, 44); X.textAlign = 'center'; X.fillStyle = '#fff'; X.fillText(lab, x + bw / 2, by2 + 60);
      });
      if (g.stars) {
        const pulse = 1 + Math.sin(K.t * 8) * 0.06;
        X.save(); X.translate(cx0, 840); X.scale(pulse, pulse);
        fc(0, 0, 56, '#ffb02e'); fc(0, -3, 50, '#ffd23f'); X.font = FONT(700, 22); X.textAlign = 'center'; X.fillStyle = '#7a4a00'; X.fillText('SUPER', 0, 8);
        X.restore();
      }
      // vida e estrelas
      const hb = Math.min(K.AW * 0.42, 360);
      const bar = (x, v, max, nm, col) => {
        X.font = FONT(700, 26); X.textAlign = 'center'; X.fillStyle = '#fff'; X.fillText(nm, x, 152);
        fr(x - hb / 2, 166, hb, 24, 12, 'rgba(0,0,0,.35)'); fr(x - hb / 2 + 3, 169, Math.max(0, (hb - 6) * v / max), 18, 9, col);
      };
      bar(K.AX + K.AW * 0.25, g.hp, 100, K.hero ? K.hero.name : 'Você', '#7ed957');
      bar(K.AX + K.AW * 0.75, f.hp, f.max, g.foeName, '#ff6b6b');
      for (let i = 0; i < 3; i++) { starPath(K.AX + K.AW * 0.25 - 40 + i * 40, 214, 15, 6); X.fillStyle = i < g.stars ? '#ffd23f' : 'rgba(255,255,255,.35)'; X.fill(); }
      if (g.phase === 'intro') pill(cx0, 470, Math.min(K.AW - 40, 520), 70, `Luta ${g.n + 1}: ${g.foeName}`, '#c4302b');
      drawParts();
      hud(`🏆 ${g.score}`);
    },
    reward(g) { return g.score * 4 + Math.floor(g.dmg / 100); },
  });
});
