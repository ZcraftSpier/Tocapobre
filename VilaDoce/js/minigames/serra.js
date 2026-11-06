'use strict';
// Minigame do Fliperama: Subida da Serra
// Dirija o carrinho pelos morros: segure o lado DIREITO da tela para acelerar e o
// ESQUERDO para frear (teclado: → e ←). No ar, acelerar empina o carro e frear
// abaixa o bico. Se a cabeça bater no chão, capotou! Pegue moedas e gasolina.
Mini.addGame((K) => {
  const { FONT, burst, drawHero, drawParts, end, flash, hitstop, hud, pill, ring, say, sky, vib, keys, coinArt, cloudArt } = K;
  // a partir da fase 2 do horror (js/horror.js), algo estranho aparece neste jogo
  const creepy = () => typeof Horror !== 'undefined' && Horror.stage >= 2;
  // física simples de carro de duas rodas (unidades do jogo; y cresce para baixo)
  const GRAV = 1350, WR = 24, WHEELS = [[-58, 34], [58, 34]], HEAD = [-4, -66], ROOF = [[-46, -60], [40, -60]];
  const KS = 240, DS = 15, GAS = 950, BRAKE = 1300, VMAX = 1100, INERTIA = 2600;
  const GHOST = { skin: '#d8d6de', hair: '#141218' };
  return ({
    id: 'serra', n: 'Subida da Serra', ic: '🚗', col: '#ffb3a7', per: 100,
    help: 'Segure a DIREITA da tela para acelerar e a ESQUERDA para frear. No ar, acelerar empina e frear abaixa o bico — não deixe a cabeça bater no chão! Pegue moedas e gasolina. (Teclado: → acelera, ← freia)',
    stars: [200, 600, 1200],
    start() {
      const g = { p: [rand(0, 6), rand(0, 6), rand(0, 6)], x: 200, y: 0, vx: 0, vy: 0, th: 0, w: 0, wr: 0, coins: [], fuels: [], nextCoin: 500, nextFuel: 1100, fuel: 1, got: 0, dist: 0, score: 0, dead: 0, emptyT: 0, camY: 0, airT: 0, rotAir: 0, contacts: 2, ghost: 0, ghostCD: rand(12, 20), gas: false, brake: false };
      g.y = this.H(g, g.x) - WHEELS[0][1] - WR + 2; g.camY = g.y - 480; g.x0 = g.x;
      return g;
    },
    // altura do chão: morros que vão ficando maiores com a distância e, depois de ~600 m, calombos
    H(g, x) {
      const A = 30 + Math.min(150, Math.max(0, x - 500) / 40), B = Math.min(26, Math.max(0, x - 6000) / 150);
      return 760 - A * (0.55 * Math.sin(x / 300 + g.p[0]) + 0.3 * Math.sin(x / 140 + g.p[1]) + 0.15 * Math.sin(x / 61 + g.p[2])) - B * Math.max(0, Math.sin(x / 38 + g.p[1])) ** 3;
    },
    baseX() { return Math.min(K.VW * 0.3, K.AX + K.AW * 0.3 + 200); },
    rot(g, [ox, oy]) { const c = Math.cos(g.th), s = Math.sin(g.th); return [ox * c - oy * s, ox * s + oy * c]; },
    physics(g, dt) {
      const n = 4, h = dt / n, gas = g.gas && g.fuel > 0 && !g.dead, brake = g.brake && !g.dead;
      for (let st = 0; st < n; st++) {
        let ax = 0, ay = GRAV, al = 0, contacts = 0;
        for (const W of WHEELS) {
          const [rx, ry] = this.rot(g, W), wx = g.x + rx, wy = g.y + ry;
          const gy = this.H(g, wx), slope = (this.H(g, wx + 2) - this.H(g, wx - 2)) / 4;
          const nl = Math.hypot(slope, 1), nx = slope / nl, ny = -1 / nl;          // normal do chão (para cima)
          const pen = (wy + WR - gy) / nl;
          if (pen <= 0) continue;
          contacts++;
          const vwx = g.vx - g.w * ry, vwy = g.vy + g.w * rx, vn = vwx * nx + vwy * ny;
          const fn = Math.max(0, KS * pen - DS * vn);                              // mola + amortecedor
          const tx = 1 / nl, ty = slope / nl, vt = vwx * tx + vwy * ty;
          let ft = -vt * 0.6;                                                       // atrito de rolagem
          if (gas) ft += GAS * Math.max(0, 1 - vt / VMAX);
          if (brake) ft += vt > 25 ? -Math.min(BRAKE, vt * 10) : -GAS * 0.35;      // freia; parado, dá ré devagar
          const Fx = nx * fn + tx * ft, Fy = ny * fn + ty * ft;
          ax += Fx; ay += Fy; al += (rx * Fy - ry * Fx) / INERTIA;
        }
        if (contacts) { if (gas) al -= 2.2; }                                       // acelerar levanta o bico
        else { if (gas) al -= 7; if (brake) al += 7; g.w *= 1 - 0.6 * h; }          // controle no ar
        g.vx += ax * h; g.vy += ay * h; g.w += al * h;
        g.x += g.vx * h; g.y += g.vy * h; g.th += g.w * h;
        g.contacts = contacts;
      }
    },
    update(g, dt) {
      const p = K.ptr;
      g.gas = !!((p && p.down && p.x > K.VW / 2) || keys.r);
      g.brake = !!((p && p.down && p.x <= K.VW / 2) || keys.l);
      const wasAir = g.contacts === 0;
      this.physics(g, dt);
      g.wr += g.vx / WR * dt;
      if (g.dead) { g.dead += dt; if (g.dead > 1.4) return end(); g.camY = lerp(g.camY, g.y - 480, Math.min(1, dt * 3)); return; }
      // gasolina
      g.fuel = Math.max(0, g.fuel - dt * (g.gas ? 0.05 : 0.02));
      if (g.fuel <= 0 && Math.abs(g.vx) < 12) { g.emptyT += dt; if (g.emptyT > 1.5) { say(this.baseX(), 380, 'Sem gasolina!', '#ff9f43'); g.dead = 0.6; Sfx.drop(0.5); } } else g.emptyT = 0;
      // voos e cambalhotas
      if (g.contacts === 0) { g.airT += dt; g.rotAir += g.w * dt; }
      else if (wasAir) {
        const flips = Math.floor((Math.abs(g.rotAir) + 0.8) / TAU);
        if (flips > 0) { g.got += 5 * flips; Sfx.sparkle(); vib(30); ring(this.baseX(), 460, '#ffd23f', 120); say(this.baseX(), 360, flips > 1 ? `Cambalhota x${flips}! +${5 * flips}` : 'Cambalhota! +5', '#ffd23f'); }
        else if (g.airT > 0.9) { g.got += 2; Sfx.coin(); say(this.baseX(), 380, 'Voou! +2', '#9fd3ff'); }
        if (g.airT > 0.25) { Sfx.drop(Math.min(1, g.airT)); burst(this.baseX(), 520, 6, ['#c9a27a', '#e8d6b8'], 220); }
        g.airT = 0; g.rotAir = 0;
      }
      // capotou: a cabeça (ou o teto) encostou no chão
      for (const pt of [HEAD, ...ROOF]) {
        const [rx, ry] = this.rot(g, pt), wx = g.x + rx, wy = g.y + ry;
        if (wy > this.H(g, wx) - 2) {
          g.dead = 0.001; K.shake = 0.45; flash('#ffffff', 0.25); hitstop(0.12); vib(120); Sfx.poof(); Sfx.squeak();
          say(this.baseX(), 380, 'Capotou!', '#ff6b6b'); burst(this.baseX(), 470, 18, ['#ff8fbd', '#ffd23f', '#fff'], 460);
          break;
        }
      }
      // moedas e gasolina pela estrada
      while (g.nextCoin < g.x + 2200) {
        const x0 = g.nextCoin;
        for (let i = 0; i < 5; i++) { const x = x0 + i * 46; g.coins.push({ x, y: this.H(g, x) - 70 - Math.sin(i / 4 * Math.PI) * 26 }); }
        g.nextCoin += rand(420, 820);
      }
      while (g.nextFuel < g.x + 2200) { g.fuels.push({ x: g.nextFuel, y: this.H(g, g.nextFuel) - 44 }); g.nextFuel += rand(1300, 1900); }
      for (const c of g.coins) if (!c.got && Math.hypot(c.x - g.x, c.y - g.y) < 64) { c.got = true; g.got++; Sfx.coin(); burst(this.baseX() + (c.x - g.x), c.y - g.camY, 5, ['#ffd23f', '#fff1a8'], 180); }
      for (const f of g.fuels) if (!f.got && Math.hypot(f.x - g.x, f.y - g.y) < 70) { f.got = true; g.fuel = 1; g.fuelGot = (g.fuelGot || 0) + 1; Sfx.sparkle(); vib(20); say(this.baseX(), 380, 'Gasolina!', '#7ed957'); }
      g.coins = g.coins.filter((c) => !c.got && c.x > g.x - 900); g.fuels = g.fuels.filter((f) => !f.got && f.x > g.x - 900);
      // horror: alguém no banco de trás
      g.ghostCD -= dt;
      if (g.ghost > 0) g.ghost -= dt;
      else if (creepy() && g.ghostCD <= 0) { g.ghost = rand(4, 6); g.ghostCD = rand(16, 26); }
      g.dist = Math.max(g.dist, g.x - g.x0); g.score = Math.floor(g.dist / 10);
      g.camY = lerp(g.camY, g.y - 480, Math.min(1, dt * 4));
    },
    car(g) {
      // carrinho no referencial do carro (centro do corpo na origem)
      const ghost = g.ghost > 0;
      fr(-46, -64, 92, 60, 22, '#cfeaff');                                    // vidros
      if (ghost) {                                                           // horror: o estranho no banco de trás
        fe(-33, -40, 14, 17, GHOST.hair); fe(-33, -34, 10, 13, GHOST.skin);
        fc(-36, -36, 2.3, '#05040a'); fc(-29, -36, 2.3, '#05040a');
      }
      drawHero(16, 22, 0.21, { joy: g.contacts === 0 && !g.dead });
      fr(-17, -64, 6, 58, 3, '#e8443a');                                     // coluna entre as janelas
      fr(-48, -68, 96, 10, 6, '#ff6b5e');                                    // teto
      fr(-84, -10, 168, 46, 18, '#ff6b5e'); fr(-84, -10, 168, 12, 8, 'rgba(255,255,255,.25)');
      fr(-84, 22, 168, 10, 5, '#d8463a');
      fr(70, -2, 14, 12, 5, '#fff6c4'); fr(-84, -2, 10, 12, 4, '#ffb3a7');   // farol e lanterna
      line(-10, -6, -10, 30, 2, 'rgba(120,30,30,.35)'); fr(-28, 6, 14, 4, 2, 'rgba(120,30,30,.45)');
    },
    wheel(x, y, rot) {
      fc(x, y, WR, '#2f3241'); fc(x, y, WR * 0.55, '#c9d5e0');
      for (let i = 0; i < 4; i++) { const a = rot + i * Math.PI / 2; line(x, y, x + Math.cos(a) * WR * 0.5, y + Math.sin(a) * WR * 0.5, 3, '#8a96a8'); }
      fc(x, y, 4, '#5b6474');
    },
    draw(g) {
      const bx = this.baseX(), toX = (wx) => bx + (wx - g.x), toY = (wy) => wy - g.camY;
      // céu, sol, nuvens e serras ao fundo (com parallax)
      sky('#8fd8ff', '#fff4e6');
      fc(K.VW * 0.82, 150, 54, '#fff3b0');
      for (let i = 0; i < 4; i++) { X.globalAlpha = 0.8; cloudArt(((srand(i) * (K.VW + 400) - g.x * 0.1) % (K.VW + 400) + K.VW + 400) % (K.VW + 400) - 200, 120 + i * 50, 150 + srand(i + 2) * 80); X.globalAlpha = 1; }
      for (const [pf, base, amp, col] of [[0.15, 560, 120, '#b8dcc4'], [0.35, 640, 90, '#9fd3a8']]) {
        X.beginPath(); X.moveTo(-20, 1020);
        for (let x = -20; x <= K.VW + 40; x += 30) { const wx = (x + g.x * pf) / 170; X.lineTo(x, base - Math.abs(Math.sin(wx)) * amp - Math.sin(wx * 2.7) * amp * 0.25); }
        X.lineTo(K.VW + 40, 1020); X.closePath(); X.fillStyle = col; X.fill();
      }
      // estrada de terra com grama
      X.beginPath(); X.moveTo(-20, 1100);
      for (let x = -20; x <= K.VW + 40; x += 12) X.lineTo(x, toY(this.H(g, g.x + x - bx)));
      X.lineTo(K.VW + 40, 1100); X.closePath();
      X.fillStyle = LG(0, toY(this.H(g, g.x)) - 100, 0, toY(this.H(g, g.x)) + 400, '#c98a55', '#8a5532'); X.fill();
      X.beginPath(); for (let x = -20; x <= K.VW + 40; x += 12) { const y = toY(this.H(g, g.x + x - bx)); x < -10 ? X.moveTo(x, y) : X.lineTo(x, y); } stroke(14, '#6ac46a');
      // placas de distância a cada 100 m
      for (let m = Math.floor((g.x - bx) / 1000) * 1000; m < g.x + K.VW; m += 1000) {
        if (m <= g.x0) continue; const x = toX(m), y = toY(this.H(g, m));
        fr(x - 3, y - 70, 6, 70, 2, '#8a5532'); fr(x - 30, y - 92, 60, 30, 6, '#fffaf2');
        X.font = FONT(700, 18); X.textAlign = 'center'; X.fillStyle = '#5a3824'; X.fillText(`${Math.round((m - g.x0) / 10)} m`, x, y - 71);
      }
      for (const f of g.fuels) { const x = toX(f.x), y = toY(f.y); fr(x - 18, y - 24, 36, 46, 8, '#e8283f'); fr(x - 8, y - 32, 16, 10, 3, '#5b6474'); X.font = FONT(700, 20); X.textAlign = 'center'; X.fillStyle = '#fff'; X.fillText('⛽', x, y + 8); }
      for (const c of g.coins) coinArt(toX(c.x), toY(c.y), 18, K.t + c.x * 0.01);
      // carro
      for (const W of WHEELS) { const [rx, ry] = this.rot(g, W); this.wheel(bx + rx, toY(g.y + ry), g.wr); }
      X.save(); X.translate(bx, toY(g.y)); X.rotate(g.th); this.car(g); X.restore();
      // pedais
      const pw = Math.min(170, K.AW * 0.3), py = 900;
      const pedal = (x, lab, on, col) => { X.globalAlpha = on ? 0.95 : 0.6; fr(x - pw / 2, py - 40, pw, 80, 22, col); X.globalAlpha = 1; X.font = FONT(700, 26); X.textAlign = 'center'; X.fillStyle = '#fff'; X.fillText(lab, x, py + 9); };
      pedal(K.AX + pw / 2 + 16, 'FREIO', g.brake, '#e8443a');
      pedal(K.AX + K.AW - pw / 2 - 16, 'ACELERA', g.gas, '#4ea83c');
      // gasolina
      const fw = Math.min(K.AW * 0.35, 220), fx = K.VW / 2 - fw / 2;
      X.font = FONT(700, 22); X.textAlign = 'right'; X.fillStyle = '#3a2428'; X.fillText('⛽', fx - 8, 180);
      fr(fx, 162, fw, 22, 11, 'rgba(255,255,255,.75)'); fr(fx + 3, 165, (fw - 6) * g.fuel, 16, 8, g.fuel < 0.25 ? (Math.sin(K.t * 10) > 0 ? '#ff4d4d' : '#ffb3a7') : '#7ed957');
      drawParts();
      hud(`${g.score} m`, `$ ${g.got}`);
      if (g.dist < 150 && !g.dead) pill(K.VW / 2, 260, Math.min(K.AW - 40, 520), 48, 'Segure à direita para acelerar', '#4ea83c');
    },
    reward(g) { return g.got + Math.floor(g.score / this.per); },
  });
});
