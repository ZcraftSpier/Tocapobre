'use strict';
// ======================================================
//  Fliperama: minigames com o seu personagem
//  (pulo nas nuvens, chuva de comida, estoura balão, memória musical, corre-corre)
// ======================================================
const Mini = (() => {
  const KEY = 'vilaDoce.mini';
  const data = { coins: 0, best: {} };
  try { Object.assign(data, JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) { /* sem armazenamento */ }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) {} };
  const $ = (s) => document.querySelector(s);

  let el, cv, ctx, hcv, hctx, open = false, raf = 0, lastT = 0, t = 0;
  let VW = 1000, SC = 1, DPR = 1, CW = 0, CH = 0, AW = 1000, AX = 0;
  let mode = 'menu', cur = null, G_ = null, hero = null, heroIx = 0, shake = 0;
  const keys = {};
  let ptr = null, parts = [];
  const FONT = (w, s) => `${w} ${s}px Fredoka, sans-serif`;

  // ---------- personagem que joga ----------
  function cast() { return (typeof G !== 'undefined' ? G.ents : []).filter((e) => e.kind === 'char'); }
  function pickHero() {
    const L = cast();
    if (!L.length) { hero = Object.assign(C('Você', 'casa', 0, 0), {}); return; }
    heroIx = ((heroIx % L.length) + L.length) % L.length;
    const src = L[heroIx];
    hero = Object.assign({}, src, { x: 0, y: 0, state: 'idle', hold: null, seat: null, seatEnt: null, sq: 0, reactT: 0, moving: false, dancing: false, ang: 0, pop: null, swing: 0 });
  }
  // desenha o herói com os pés em (x, y)
  function drawHero(x, y, s, o = {}) {
    hero.moving = !!o.run; hero.reactT = o.joy ? 1 : 0; hero.sq = o.sq || 0;
    X.save(); X.translate(x, y); if (o.rot) X.rotate(o.rot); X.scale(s * (o.flip ? -1 : 1), s);
    drawChar(hero, t, true);
    X.restore();
  }

  // ---------- partículas e textos ----------
  function burst(x, y, n, cols, sp = 380) {
    for (let i = 0; i < n; i++) {
      const a = rand(0, TAU), v = rand(sp * 0.3, sp);
      parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 120, life: rand(0.5, 0.9), max: 0.9, r: rand(5, 10), col: pick(cols), kind: 'dot' });
    }
  }
  function say(x, y, txt, col = '#fff') { parts.push({ x, y, vx: 0, vy: -90, life: 0.9, max: 0.9, txt, col, kind: 'txt' }); }
  function stepParts(dt) {
    for (const p of parts) { p.life -= dt; p.x += p.vx * dt; p.y += p.vy * dt; if (p.kind === 'dot') p.vy += 900 * dt; }
    parts = parts.filter((p) => p.life > 0);
  }
  function drawParts(dy = 0) {
    for (const p of parts) {
      X.globalAlpha = clamp(p.life / p.max * 1.6, 0, 1);
      if (p.kind === 'dot') fc(p.x, p.y - dy, p.r, p.col);
      else { X.font = FONT(700, 34); X.textAlign = 'center'; X.lineWidth = 6; X.strokeStyle = 'rgba(58,36,40,.55)'; X.strokeText(p.txt, p.x, p.y - dy); X.fillStyle = p.col; X.fillText(p.txt, p.x, p.y - dy); }
    }
    X.globalAlpha = 1;
  }

  // ---------- peças de desenho ----------
  function coinArt(x, y, r, tt = 0) {
    const sx = Math.abs(Math.cos(tt * 3)) * 0.75 + 0.25;
    X.save(); X.translate(x, y); X.scale(sx, 1);
    fc(0, 0, r, '#e8a317'); fc(0, -1.5, r * 0.84, LG(0, -r, 0, r, '#ffe27a', '#ffc21a'));
    fr(-r * 0.16, -r * 0.45, r * 0.32, r * 0.9, r * 0.16, '#f2a90f');
    fe(-r * 0.4, -r * 0.4, r * 0.18, r * 0.28, 'rgba(255,255,255,.6)', 0.5);
    X.restore();
  }
  function cloudArt(x, y, w, col = '#ffffff', shadeCol = '#dfe9f5') {
    const h = w * 0.32;
    fr(x - w / 2, y - h * 0.55, w, h * 0.9, h * 0.45, shadeCol);
    fc(x - w * 0.22, y - h * 0.65, h * 0.6, col); fc(x + w * 0.05, y - h * 0.9, h * 0.75, col); fc(x + w * 0.28, y - h * 0.6, h * 0.55, col);
    fr(x - w / 2, y - h * 0.75, w, h * 0.75, h * 0.38, col);
  }
  function heart(x, y, s, col) { heartPath(x, y, s); X.fillStyle = col; X.fill(); }
  function pill(x, y, w, h, txt, col = '#3a2428') {
    fr(x - w / 2, y - h / 2, w, h, h / 2, 'rgba(255,255,255,.88)');
    let tx = x;
    if (txt.startsWith('$ ')) { txt = txt.slice(2); coinArt(x - w / 2 + h * 0.62, y, h * 0.34, 0); tx = x + h * 0.25; }
    X.font = FONT(700, h * 0.6); X.textAlign = 'center'; X.textBaseline = 'middle'; X.fillStyle = col; X.fillText(txt, tx, y + 2); X.textBaseline = 'alphabetic';
  }
  function sky(top, bot) { X.fillStyle = LG(0, 0, 0, 1000, top, bot); X.fillRect(0, 0, VW, 1000); }
  function sideShade() {
    if (AX < 4) return;
    X.fillStyle = 'rgba(58,40,80,.18)'; X.fillRect(0, 0, AX, 1000); X.fillRect(AX + AW, 0, VW - AX - AW, 1000);
  }
  function itemArt(type, x, y, s, rot = 0) {
    const T = ITEMS[type]; if (!T) return;
    X.save(); X.translate(x, y); X.rotate(rot); X.scale(s, s); X.translate(0, T.h / 2);
    T.draw({ type, level: 1 }, t);
    X.restore();
  }
  function bombArt(x, y, r) {
    fc(x, y, r, '#3b3446'); fc(x - r * 0.35, y - r * 0.35, r * 0.28, 'rgba(255,255,255,.3)');
    fr(x - r * 0.25, y - r * 1.15, r * 0.5, r * 0.3, 3, '#6b6478');
    X.beginPath(); X.moveTo(x, y - r * 1.15); X.quadraticCurveTo(x + r * 0.4, y - r * 1.6, x + r * 0.2, y - r * 1.8); stroke(4, '#a8834f');
    fc(x + r * 0.2, y - r * 1.85, 6 + Math.sin(t * 30) * 2, '#ffb02e'); fc(x + r * 0.2, y - r * 1.85, 3, '#fff6c4');
    // olhinhos bravos
    fc(x - r * 0.3, y + 2, 4, '#fff'); fc(x + r * 0.3, y + 2, 4, '#fff');
    line(x - r * 0.5, y - 8, x - r * 0.12, y - 3, 3, '#fff'); line(x + r * 0.5, y - 8, x + r * 0.12, y - 3, 3, '#fff');
  }

  // ======================================================
  //  Jogos
  // ======================================================
  const GAMES = [];

  // ---------- 1. Pulo nas Nuvens ----------
  GAMES.push({
    id: 'pulo', n: 'Pulo nas Nuvens', ic: '☁️', col: '#7fd3f5', per: 20,
    help: 'Pule nas nuvens para subir! Use ← → ou arraste o dedo.',
    start() {
      const g = { x: AX + AW / 2, y: 820, vy: -1250, vx: 0, cam: 0, top: 820, clouds: [], coins: [], next: 900, score: 0, got: 0, face: 1 };
      g.clouds.push({ x: g.x, y: 900, w: 190, k: 'n' });
      g.next = 900;
      return g;
    },
    spawn(g) {
      while (g.next > g.cam - 300) {
        const h = (820 - g.next) / 10;
        g.next -= rand(115, 150 + Math.min(130, h / 3));
        const r = Math.random(), w = Math.max(120, 175 - h / 20);
        const c = { x: AX + rand(w / 2 + 10, AW - w / 2 - 10), y: g.next, w, k: 'n', vx: 0 };
        if (h > 40 && r < 0.25) { c.k = 'm'; c.vx = rand(90, 160 + Math.min(140, h / 4)) * (Math.random() < 0.5 ? -1 : 1); }
        else if (r > 0.92) c.k = 's';
        g.clouds.push(c);
        if (Math.random() < 0.35) g.coins.push({ x: c.x, y: c.y - 70 });
        if (h > 20 && Math.random() < 0.3) g.clouds.push({ x: AX + rand(70, AW - 70), y: g.next + rand(40, 80), w: 130, k: 'f' });
      }
    },
    update(g, dt) {
      const dir = (keys.r ? 1 : 0) - (keys.l ? 1 : 0);
      if (dir) g.vx = dir * 620;
      else if (ptr && ptr.down) g.vx = clamp((ptr.x - g.x) * 7, -750, 750);
      else g.vx *= Math.pow(0.02, dt);
      if (Math.abs(g.vx) > 40) g.face = Math.sign(g.vx);
      const py = g.y;
      g.vy += 2300 * dt; g.x += g.vx * dt; g.y += g.vy * dt;
      if (g.x < AX - 30) g.x += AW + 60; if (g.x > AX + AW + 30) g.x -= AW + 60;
      for (const c of g.clouds) {
        if (c.k === 'm') { c.x += c.vx * dt; if (c.x < AX + c.w / 2 || c.x > AX + AW - c.w / 2) { c.vx *= -1; c.x = clamp(c.x, AX + c.w / 2, AX + AW - c.w / 2); } }
        if (c.gone) { c.fall = (c.fall || 0) + dt; c.y += 600 * dt; continue; }
        if (g.vy > 0 && py <= c.y - 6 && g.y >= c.y - 6 && Math.abs(g.x - c.x) < c.w / 2 + 14) {
          g.y = c.y - 6; c.sq = 1;
          if (c.k === 'f') { c.gone = true; g.vy = -1000; Sfx.poof(); burst(c.x, c.y - 20, 10, ['#c8ced8', '#e3e7ee']); }
          else if (c.k === 's') { g.vy = -1950; Sfx.whoosh(); say(c.x, c.y - 80, 'Uhuu!', '#ff8fbd'); }
          else { g.vy = -1250; Sfx.boing(); }
        }
        if (c.sq) c.sq = Math.max(0, c.sq - dt * 4);
      }
      for (const k of g.coins) if (!k.got && Math.hypot(k.x - g.x, k.y - (g.y - 70)) < 60) { k.got = true; g.got++; Sfx.coin(); burst(k.x, k.y, 8, ['#ffd23f', '#fff1a8']); say(k.x, k.y - 30, '+1', '#ffd23f'); }
      g.cam = Math.min(g.cam, g.y - 520);
      g.top = Math.min(g.top, g.y);
      g.score = Math.floor((820 - g.top) / 10);
      this.spawn(g);
      g.clouds = g.clouds.filter((c) => c.y < g.cam + 1150);
      g.coins = g.coins.filter((k) => !k.got && k.y < g.cam + 1150);
      if (g.y > g.cam + 1080) return end();
    },
    draw(g) {
      const h = clamp(-g.cam / 9000, 0, 1);
      sky(lerpCol('#8fd8ff', '#2b2466', h), lerpCol('#e8f8ff', '#7a5cc4', h));
      // estrelas e nuvenzinhas de fundo com parallax
      for (let i = 0; i < 18; i++) {
        const yy = ((srand(i) * 1400 - g.cam * 0.2) % 1400 + 1400) % 1400 - 200, xx = srand(i + 9) * VW;
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
      for (const k of g.coins) coinArt(k.x, k.y, 20, t + k.x);
      drawHero(g.x, g.y, 0.3, { joy: g.vy < -300, flip: g.face < 0 });
      X.restore();
      drawParts(g.cam);
      hud(`${g.score} m`, `$ ${g.got}`);
    },
    reward(g) { return g.got + Math.floor(g.score / this.per); },
  });

  // ---------- 2. Chuva de Comida ----------
  const FOODS = ['apple', 'banana', 'pizza', 'cake', 'donut', 'icecream', 'watermelon', 'orange', 'chocolate', 'brigadeiro', 'popcorn', 'morango'];
  GAMES.push({
    id: 'chuva', n: 'Chuva de Comida', ic: '🍎', col: '#ffb199', per: 4,
    help: 'Pegue as comidas na cesta e fuja das bombinhas! Use ← → ou arraste.',
    start() { return { x: AX + AW / 2, vx: 0, face: 1, drops: [], spawnT: 0.6, lives: 3, score: 0, combo: 0, joyT: 0, hurtT: 0, el: 0 }; },
    update(g, dt) {
      g.el += dt;
      const dir = (keys.r ? 1 : 0) - (keys.l ? 1 : 0);
      if (dir) g.vx = dir * 820;
      else if (ptr && ptr.down) g.vx = clamp((ptr.x - g.x) * 9, -1000, 1000);
      else g.vx = 0;
      if (Math.abs(g.vx) > 40) g.face = Math.sign(g.vx);
      g.x = clamp(g.x + g.vx * dt, AX + 60, AX + AW - 60);
      g.joyT -= dt; g.hurtT -= dt;
      const lvl = Math.min(1, g.el / 90);
      g.spawnT -= dt;
      if (g.spawnT <= 0) {
        g.spawnT = lerp(1.0, 0.42, lvl) * rand(0.8, 1.2);
        const r = Math.random(), foods = FOODS.filter((k) => ITEMS[k]);
        g.drops.push({ x: AX + rand(50, AW - 50), y: -60, vy: lerp(260, 560, lvl) * rand(0.9, 1.15), rot: rand(-0.4, 0.4), vr: rand(-2, 2),
          k: r < lerp(0.12, 0.28, lvl) ? 'bomb' : r > 0.95 ? 'star' : pick(foods) });
      }
      const bx = g.x, by = 760;
      for (const d of g.drops) {
        d.y += d.vy * dt; d.rot += d.vr * dt;
        if (!d.done && d.y > by - 40 && d.y < by + 10 && Math.abs(d.x - bx) < 74) {
          d.done = true;
          if (d.k === 'bomb') { g.lives--; g.combo = 0; g.hurtT = 0.6; shake = 0.4; Sfx.poof(); burst(d.x, d.y, 16, ['#3b3446', '#ffb02e', '#8a8299'], 500); say(d.x, d.y - 40, 'Ai!', '#ff6b6b'); }
          else {
            const pts = d.k === 'star' ? 5 : 1 + (g.combo >= 9 ? 1 : 0);
            g.score += pts; g.combo++; g.joyT = 0.35;
            d.k === 'star' ? Sfx.sparkle() : Sfx.munch();
            burst(d.x, d.y, 7, ['#ffd23f', '#ff8fbd', '#7ed957']); say(d.x, d.y - 40, '+' + pts, '#fff');
            if (g.combo % 10 === 0) { say(g.x, 640, `Combo ${g.combo}!`, '#ffd23f'); Sfx.ding(); }
          }
        }
        if (!d.done && d.y > 1040) { d.done = true; if (d.k !== 'bomb' && d.k !== 'star') { g.lives--; g.combo = 0; g.hurtT = 0.4; Sfx.drop(0.4); say(d.x, 940, 'Ops!', '#ff6b6b'); } }
      }
      g.drops = g.drops.filter((d) => !d.done);
      if (g.lives <= 0) return end();
    },
    draw(g) {
      sky('#9fdcff', '#fff4e6');
      fe(VW * 0.2, 980, VW * 0.5, 160, '#a6df8f'); fe(VW * 0.8, 1000, VW * 0.55, 180, '#8fd37a');
      fr(0, 890, VW, 110, 0, '#7cc966'); fr(0, 890, VW, 10, 0, '#6bb857');
      sideShade();
      for (const d of g.drops) {
        if (d.k === 'bomb') bombArt(d.x, d.y, 30);
        else if (d.k === 'star') { X.save(); X.translate(d.x, d.y); X.rotate(d.rot); starPath(0, 0, 34, 15); X.fillStyle = '#ffd23f'; X.fill(); stroke(4, '#f2a90f'); X.restore(); }
        else itemArt(d.k, d.x, d.y, 0.8, d.rot);
      }
      const sh = g.hurtT > 0 ? Math.sin(t * 60) * 6 : 0;
      drawHero(g.x + sh, 900, 0.34, { run: Math.abs(g.vx) > 40, joy: g.joyT > 0, flip: g.face < 0 });
      // cesta
      const bx = g.x + sh, by = 760 - (Math.abs(g.vx) > 40 ? Math.abs(Math.sin(t * 11 + (hero.phase || 0))) * 3 : 0);
      X.save(); X.translate(bx, by);
      X.beginPath(); X.moveTo(-70, -26); X.lineTo(70, -26); X.lineTo(54, 26); X.lineTo(-54, 26); X.closePath();
      X.fillStyle = LG(0, -26, 0, 26, '#e0a868', '#b97a3c'); X.fill(); stroke(4, 'rgba(58,36,40,.8)');
      for (let i = -2; i <= 2; i++) line(i * 24, -22, i * 20, 22, 3, 'rgba(120,70,30,.45)');
      line(-64, -6, 64, -6, 3, 'rgba(120,70,30,.45)');
      fr(-74, -34, 148, 14, 7, '#c98a4a'); RR(-74, -34, 148, 14, 7); stroke(3.5, 'rgba(58,36,40,.8)');
      X.restore();
      drawParts();
      hud(String(g.score), null, g.lives);
    },
    reward(g) { return Math.floor(g.score / this.per); },
  });

  // ---------- 3. Estoura Balão ----------
  const BCOLS = ['#ff5d8f', '#4dabf7', '#7ed957', '#ffd23f', '#a77bf3', '#ff9f43'];
  GAMES.push({
    id: 'baloes', n: 'Estoura Balão', ic: '🎈', col: '#ff9ec4', per: 5,
    help: 'Toque nos balões para estourar! Os dourados valem mais. Cuidado com as nuvens de chuva!',
    start() { return { bs: [], spawnT: 0, time: 45, score: 0, el: 0, joyT: 0 }; },
    update(g, dt) {
      g.el += dt; g.time -= dt; g.joyT -= dt;
      const lvl = Math.min(1, g.el / 40);
      g.spawnT -= dt;
      if (g.spawnT <= 0) {
        g.spawnT = lerp(0.75, 0.32, lvl);
        const r = Math.random();
        g.bs.push({ x: AX + rand(60, AW - 60), y: 1100, vy: lerp(170, 360, lvl) * rand(0.85, 1.25), ph: rand(0, TAU), s: rand(0.85, 1.15),
          k: r < 0.15 + lvl * 0.1 ? 'chuva' : r > 0.93 ? 'ouro' : 'n', col: pick(BCOLS) });
      }
      for (const b of g.bs) { b.y -= b.vy * dt; b.x += Math.sin(t * 2 + b.ph) * 30 * dt; }
      g.bs = g.bs.filter((b) => b.y > -160 && !b.pop);
      if (g.time <= 0) { g.time = 0; return end(); }
    },
    tap(g, x, y) {
      for (let i = g.bs.length - 1; i >= 0; i--) {
        const b = g.bs[i];
        if (Math.hypot((x - b.x) / (44 * b.s), (y - (b.y - 52 * b.s)) / (56 * b.s)) < 1.15) {
          b.pop = true;
          if (b.k === 'chuva') { g.time = Math.max(0, g.time - 5); shake = 0.35; Sfx.poof(); burst(b.x, b.y - 50, 12, ['#8a96a8', '#4dabf7'], 420); say(b.x, b.y - 90, '-5s', '#9fd3ff'); }
          else { const p = b.k === 'ouro' ? 5 : 1; g.score += p; g.joyT = 0.3; Sfx.pop(); if (p > 1) Sfx.sparkle(); burst(b.x, b.y - 50, 12, b.k === 'ouro' ? ['#ffd23f', '#fff1a8'] : [b.col, '#fff']); say(b.x, b.y - 90, '+' + p, '#fff'); }
          return;
        }
      }
    },
    draw(g) {
      sky('#ffd6e7', '#fff7d6');
      for (let i = 0; i < 5; i++) { X.globalAlpha = 0.6; cloudArt(((srand(i) * VW + t * 14 * (i + 1)) % (VW + 300)) - 150, 140 + i * 130, 160 + srand(i + 4) * 90); X.globalAlpha = 1; }
      fr(0, 930, VW, 70, 0, '#8fdc7a');
      sideShade();
      for (const b of g.bs) {
        X.save(); X.translate(b.x, b.y); X.scale(b.s, b.s);
        X.beginPath(); X.moveTo(0, 0); X.bezierCurveTo(10, 30, -10, 60, 0, 90); stroke(2.5, '#9aa0aa');
        if (b.k === 'chuva') {
          cloudArt(0, -30, 120, '#8a96a8', '#6f7b8e');
          fc(-16, -52, 4.5, '#2a2430'); fc(16, -52, 4.5, '#2a2430'); line(-26, -64, -10, -58, 3, '#2a2430'); line(26, -64, 10, -58, 3, '#2a2430');
          fpoly([4, -20, -10, 6, 2, 6, -6, 30, 16, -2, 4, -2, 12, -20], '#ffd23f');
        } else {
          const col = b.k === 'ouro' ? '#ffc21a' : b.col;
          fpoly([-7, 4, 7, 4, 0, -6], shade(col, -0.2));
          fe(0, -52, 42, 52, RG(-14, -72, 4, 60, shade(col, 0.35), col, shade(col, -0.2)));
          X.beginPath(); X.ellipse(0, -52, 42, 52, 0, 0, TAU); stroke(3, 'rgba(58,36,40,.35)');
          fe(-16, -72, 8, 15, 'rgba(255,255,255,.45)', 0.4);
          if (b.k === 'ouro') { starPath(0, -52, 16, 7); X.fillStyle = '#fff6c4'; X.fill(); }
        }
        X.restore();
      }
      drawHero(AX + 90, 960, 0.26, { joy: g.joyT > 0 });
      drawParts();
      hud(String(g.score), `⏱ ${Math.ceil(g.time)}`);
    },
    reward(g) { return Math.floor(g.score / this.per); },
  });

  // ---------- 4. Memória Musical ----------
  const PADS = [['#ff7eb6', 523.25], ['#ffd23f', 659.25], ['#4dabf7', 783.99], ['#7ed957', 1046.5]];
  GAMES.push({
    id: 'memoria', n: 'Memória Musical', ic: '🎵', col: '#c5a3ff', per: 2,
    help: 'Observe a sequência e repita tocando nas carinhas (ou teclas 1 a 4).',
    start() { const g = { seq: [], at: 0, phase: 'wait', timer: 0.8, lit: -1, litT: 0, score: 0, sad: 0, joyT: 0 }; return g; },
    layout() {
      const sz = Math.min(AW * 0.42, 250), gap = sz * 0.12, cx = AX + AW / 2, cy = 560;
      return PADS.map((p, i) => ({ x: cx + (i % 2 ? gap / 2 : -gap / 2 - sz), y: cy + (i > 1 ? gap / 2 : -gap / 2 - sz), s: sz }));
    },
    light(g, i) { g.lit = i; g.litT = 0.32; Sfx.note(PADS[i][1]); },
    update(g, dt) {
      g.litT -= dt; g.joyT -= dt; if (g.litT <= 0) g.lit = -1;
      if (g.phase === 'wait') { g.timer -= dt; if (g.timer <= 0) { g.seq.push((Math.random() * 4) | 0); g.at = 0; g.phase = 'show'; g.timer = 0.3; } }
      else if (g.phase === 'show') {
        g.timer -= dt;
        if (g.timer <= 0) {
          if (g.at < g.seq.length) { this.light(g, g.seq[g.at]); g.at++; g.timer = Math.max(0.28, 0.6 - g.seq.length * 0.025); }
          else if (g.lit < 0) { g.phase = 'input'; g.at = 0; }
        }
      } else if (g.phase === 'over') { g.timer -= dt; if (g.timer <= 0) return end(); }
    },
    press(g, i) {
      if (g.phase !== 'input') return;
      this.light(g, i);
      if (g.seq[g.at] !== i) { g.phase = 'over'; g.timer = 1.1; g.sad = i + 1; shake = 0.3; Sfx.squeak(); return; }
      g.at++;
      if (g.at >= g.seq.length) { g.score = g.seq.length; g.phase = 'wait'; g.timer = 0.9; g.joyT = 0.8; say(AX + AW / 2, 250, 'Isso!', '#7ed957'); setTimeout(() => open && Sfx.ding(), 250); }
    },
    tap(g, x, y) { this.layout().forEach((p, i) => { if (x > p.x && x < p.x + p.s && y > p.y && y < p.y + p.s) this.press(g, i); }); },
    key(g, k) { const n = parseInt(k, 10); if (n >= 1 && n <= 4) this.press(g, n - 1); },
    draw(g) {
      sky('#e6dbff', '#ffe6f2');
      for (let i = 0; i < 14; i++) { X.globalAlpha = 0.25; X.font = FONT(600, 30 + srand(i) * 30); X.fillStyle = '#a77bf3'; X.fillText(i % 2 ? '♪' : '♫', srand(i + 1) * VW, ((srand(i + 2) * 1000 - t * 30 * (1 + srand(i))) % 1000 + 1000) % 1000); }
      X.globalAlpha = 1;
      sideShade();
      this.layout().forEach((p, i) => {
        const on = g.lit === i, col = PADS[i][0], bad = g.sad === i + 1;
        X.save(); X.translate(p.x + p.s / 2, p.y + p.s / 2); const k = on ? 1.06 : 1; X.scale(k, k);
        fr(-p.s / 2, -p.s / 2 + 10, p.s, p.s, p.s * 0.22, shade(col, -0.25));
        fr(-p.s / 2, -p.s / 2, p.s, p.s, p.s * 0.22, on ? shade(col, 0.3) : col);
        RR(-p.s / 2, -p.s / 2, p.s, p.s, p.s * 0.22); stroke(5, 'rgba(58,36,40,.7)');
        if (on) { X.globalAlpha = 0.5; fr(-p.s / 2 - 10, -p.s / 2 - 10, p.s + 20, p.s + 20, p.s * 0.26, alpha(col, 0.4)); X.globalAlpha = 1; }
        const e = p.s * 0.14, LN = '#2a1d1a';
        if (on && !bad) { X.beginPath(); X.arc(-e, -4, 9, 1.1 * Math.PI, 1.9 * Math.PI); stroke(5, LN); X.beginPath(); X.arc(e, -4, 9, 1.1 * Math.PI, 1.9 * Math.PI); stroke(5, LN); }
        else { fe(-e, -6, 7, 9, LN); fe(e, -6, 7, 9, LN); }
        fe(-e * 1.7, 14, 12, 7, 'rgba(255,100,110,.35)'); fe(e * 1.7, 14, 12, 7, 'rgba(255,100,110,.35)');
        X.beginPath();
        if (bad) X.arc(0, 30, 12, 1.15 * Math.PI, 1.85 * Math.PI); else if (on) { X.arc(0, 14, 16, 0, Math.PI); X.closePath(); X.fillStyle = '#7a2b3a'; X.fill(); X.beginPath(); X.arc(0, 14, 16, 0, Math.PI); }
        else X.arc(0, 14, 11, 0.15 * Math.PI, 0.85 * Math.PI);
        stroke(4.5, LN);
        X.font = FONT(700, 26); X.textAlign = 'center'; X.fillStyle = 'rgba(255,255,255,.75)'; X.fillText(String(i + 1), p.s / 2 - 26, p.s / 2 - 18);
        X.restore();
      });
      const msg = g.phase === 'show' || g.phase === 'wait' ? 'Preste atenção...' : g.phase === 'input' ? 'Sua vez!' : 'Ah não!';
      pill(AX + AW / 2, 210, 300, 56, msg, '#7a4fd0');
      drawHero(AX + AW - 70, 990, 0.24, { joy: g.joyT > 0, flip: true });
      drawParts();
      hud(String(g.score));
    },
    reward(g) { return g.score; },
  });

  // ---------- 5. Corre-Corre ----------
  const OBST = [['cone', 56, 74], ['caixa', 84, 84], ['caixa2', 84, 160], ['banco', 150, 62], ['hidrante', 56, 92], ['poca', 130, 12]];
  GAMES.push({
    id: 'corre', n: 'Corre-Corre', ic: '🏃', col: '#8fdc7a', per: 25,
    help: 'Toque ou aperte espaço para pular. Dá para pular duas vezes no ar!',
    start() { return { y: 0, vy: 0, jumps: 0, sp: 520, dist: 0, obs: [], coins: [], nextO: 700, got: 0, score: 0, dead: 0 }; },
    jump(g) {
      if (g.dead) return;
      if (g.jumps < 2) { g.vy = g.jumps ? -1000 : -1180; g.jumps++; Sfx.boing(); if (g.jumps === 2) burst(AX + 180, 860 + g.y, 6, ['#fff', '#e3f4ff'], 200); }
    },
    tap(g) { this.jump(g); },
    key(g, k) { if (k === ' ' || k === 'ArrowUp' || k === 'w' || k === 'W') this.jump(g); },
    update(g, dt) {
      if (g.dead) { g.dead += dt; g.vy += 3000 * dt; g.y = Math.min(0, g.y + g.vy * dt); if (g.dead > 1) return end(); return; }
      g.sp = Math.min(1150, 520 + g.dist / 40); g.dist += g.sp * dt; g.score = Math.floor(g.dist / 100);
      g.vy += 3000 * dt; g.y += g.vy * dt; if (g.y >= 0) { g.y = 0; g.vy = 0; g.jumps = 0; }
      const hx = AX + 180;
      g.nextO -= g.sp * dt;
      if (g.nextO <= 0) {
        const pool = g.dist < 2500 ? OBST.filter((o) => o[0] !== 'caixa2') : OBST, o = pick(pool);
        g.obs.push({ k: o[0], w: o[1], h: o[2], x: AX + AW + 100 });
        if (Math.random() < 0.55) for (let i = 0; i < 5; i++) g.coins.push({ x: AX + AW + 100 + o[1] / 2 + (i - 2) * 60, y: 860 - o[2] - 110 - Math.sin(i / 4 * Math.PI) * 90 });
        else if (Math.random() < 0.5) for (let i = 0; i < 4; i++) g.coins.push({ x: AX + AW + 420 + i * 60, y: 820 });
        g.nextO = rand(420, 760) * (g.sp / 520) * 0.8;
      }
      for (const o of g.obs) o.x -= g.sp * dt;
      for (const c of g.coins) c.x -= g.sp * dt;
      g.obs = g.obs.filter((o) => o.x + o.w > AX - 200);
      g.coins = g.coins.filter((c) => !c.got && c.x > AX - 100);
      const feet = 860 + g.y;
      for (const c of g.coins) if (Math.abs(c.x - hx) < 50 && c.y > feet - 150 && c.y < feet + 20) { c.got = true; g.got++; Sfx.coin(); burst(c.x, c.y, 6, ['#ffd23f', '#fff1a8']); }
      for (const o of g.obs) {
        if (o.k === 'poca') continue;
        if (hx + 24 > o.x + 8 && hx - 24 < o.x + o.w - 8 && feet > 860 - o.h + 10) { g.dead = 0.001; g.vy = -900; shake = 0.4; Sfx.poof(); say(hx, feet - 180, 'Ai!', '#ff6b6b'); burst(hx, feet - 60, 12, ['#ff8fbd', '#ffd23f', '#fff'], 420); }
      }
      for (const o of g.obs) if (o.k === 'poca' && !o.sp && g.y === 0 && hx > o.x && hx < o.x + o.w) { o.sp = 1; Sfx.splash(); burst(hx, 856, 10, ['#7fc8f8', '#bfe6ff'], 300); }
    },
    draw(g) {
      sky('#8fd8ff', '#e8f8ff');
      const d = g.dist;
      for (let i = 0; i < 4; i++) { X.globalAlpha = 0.7; cloudArt(((srand(i) * (VW + 400) - d * 0.08) % (VW + 400) + VW + 400) % (VW + 400) - 200, 120 + i * 70, 150 + srand(i + 2) * 80); X.globalAlpha = 1; }
      // casinhas ao fundo
      const HC = ['#ffb199', '#ffcf5c', '#9fb2ff', '#ff9ec4', '#6fd6c8', '#c5a3ff'];
      for (let i = -1; i < VW / 230 + 2; i++) {
        const id = Math.floor(d * 0.3 / 230) + i, x = id * 230 - d * 0.3, hh = 160 + srand(id) * 120, col = HC[((id % 6) + 6) % 6];
        fr(x + 20, 760 - hh, 170, hh + 20, 10, col); fpoly([x + 8, 770 - hh, x + 105, 690 - hh, x + 202, 770 - hh], shade(col, -0.25));
        for (let j = 0; j < 2; j++) fr(x + 45 + j * 75, 800 - hh, 44, 40, 6, '#fff8e1');
      }
      // árvores
      for (let i = -1; i < VW / 300 + 2; i++) {
        const id = Math.floor(d * 0.6 / 300) + i, x = id * 300 - d * 0.6 + srand(id + 7) * 100;
        fr(x - 9, 730, 18, 80, 6, '#a0714a'); fc(x, 710, 52, '#6ac46a'); fc(x - 28, 730, 34, '#5cb85c'); fc(x + 30, 728, 36, '#5cb85c');
      }
      fr(0, 800, VW, 60, 0, '#d9d2c5'); for (let i = -1; i < VW / 80 + 2; i++) fr(i * 80 - (d % 80), 800, 4, 60, 0, '#c8c0b2');
      fr(0, 860, VW, 140, 0, '#8fdc7a'); fr(0, 860, VW, 10, 0, '#78c766');
      for (const o of g.obs) {
        const x = o.x, b = 860;
        if (o.k === 'cone') { fpoly([x + 10, b, x + 46, b, x + 32, b - 74, x + 24, b - 74], '#ff7a2f'); fr(x + 15, b - 44, 26, 12, 3, '#fff'); fr(x + 2, b - 8, 52, 10, 4, '#e45c17'); }
        else if (o.k === 'caixa' || o.k === 'caixa2') {
          for (let j = 0; j < (o.k === 'caixa2' ? 2 : 1); j++) { const y = b - 84 - j * 78; fr(x, y, 84, 84, 8, '#d9a066'); RR(x, y, 84, 84, 8); stroke(4, 'rgba(58,36,40,.7)'); line(x + 10, y + 10, x + 74, y + 74, 4, '#b07a43'); line(x + 74, y + 10, x + 10, y + 74, 4, '#b07a43'); }
        } else if (o.k === 'banco') { fr(x, b - 62, 150, 16, 6, '#c47a45'); fr(x, b - 40, 150, 10, 5, '#a8643a'); fr(x + 12, b - 46, 12, 46, 3, '#5b6474'); fr(x + 126, b - 46, 12, 46, 3, '#5b6474'); }
        else if (o.k === 'hidrante') { fr(x + 8, b - 78, 40, 78, 12, '#ec3f45'); fe(x + 28, b - 80, 22, 14, '#c92f35'); fr(x, b - 54, 56, 14, 6, '#c92f35'); fr(x + 4, b - 6, 48, 8, 3, '#a6262b'); }
        else if (o.k === 'poca') fe(x + o.w / 2, b + 6, o.w / 2, 12, 'rgba(90,170,230,.75)');
      }
      for (const c of g.coins) coinArt(c.x, c.y, 18, t + c.x * 0.01);
      sideShade();
      const air = g.y < -2;
      softShadow(AX + 180, 862, 50 + g.y * 0.05, 0.25);
      drawHero(AX + 180, 860 + g.y, 0.3, { run: !air && !g.dead, joy: air && !g.dead, rot: g.dead ? -0.5 : 0 });
      drawParts();
      hud(`${g.score} m`, `$ ${g.got}`);
    },
    reward(g) { return g.got + Math.floor(g.score / this.per); },
  });

  // ---------- HUD ----------
  function hud(main, sub, lives) {
    pill(VW / 2, 60, Math.max(140, main.length * 26 + 60), 64, main);
    if (sub) pill(VW / 2, 124, Math.max(110, sub.length * 18 + 40), 44, sub, '#7a5a3a');
    if (lives != null) for (let i = 0; i < 3; i++) heart(VW / 2 - 40 + i * 40, 108, 30, i < lives ? '#ff5f7e' : 'rgba(255,255,255,.7)');
  }
  function starPath(x, y, r1, r2) {
    X.beginPath();
    for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? r2 : r1; X.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); }
    X.closePath();
  }
  function lerpCol(a, b, k) {
    const A = hexRgb(a), B = hexRgb(b);
    return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], k))).join(',')})`;
  }

  // ======================================================
  //  Fluxo: menu → pronto → jogando → fim
  // ======================================================
  function buildMenu() {
    $('#miniGames').innerHTML = GAMES.map((g) => `<button class="mgCard" data-g="${g.id}" style="--c:${g.col}"><span class="mgIc">${g.ic}</span><b>${g.n}</b><small>Recorde: ${data.best[g.id] || 0}</small></button>`).join('');
    $('#miniGames').querySelectorAll('[data-g]').forEach((b) => b.addEventListener('click', () => { Sfx.click(); play(GAMES.find((g) => g.id === b.dataset.g)); }));
    $('#miniCoins').textContent = data.coins;
    $('#miniHeroName').textContent = hero ? hero.name : '';
  }
  function showMenu() {
    mode = 'menu'; cur = null; G_ = null; parts = [];
    $('#miniMenu').classList.remove('hidden'); $('#miniOver').classList.add('hidden');
    buildMenu();
  }
  function play(gm) {
    cur = gm; G_ = gm.start(); parts = []; mode = 'ready';
    $('#miniMenu').classList.add('hidden'); $('#miniOver').classList.add('hidden');
  }
  function begin() { mode = 'play'; Sfx.sparkle(); }
  function end() {
    if (mode !== 'play') return;
    mode = 'over';
    const sc = G_.score, earned = cur.reward(G_), best = data.best[cur.id] || 0, rec = sc > best;
    if (rec) data.best[cur.id] = sc;
    data.coins += earned; save();
    $('#miniOverT').textContent = rec && sc > 0 ? 'Novo recorde! 🏆' : 'Fim de jogo!';
    $('#miniOverS').textContent = String(sc);
    $('#miniOverP').textContent = `Recorde: ${data.best[cur.id] || 0} · Moedas ganhas: +${earned}`;
    $('#miniCoins').textContent = data.coins;
    setTimeout(() => { if (mode === 'over') $('#miniOver').classList.remove('hidden'); }, 350);
    rec && sc > 0 ? Sfx.sticker() : Sfx.drop(0.5);
    Album.unlock('a_fliperama');
    if (sc >= 50) Album.unlock('a_recorde');
    if (data.coins >= 300) Album.unlock('a_cofrinho');
  }

  // ---------- laço ----------
  function resize() {
    DPR = Math.min(2, devicePixelRatio || 1);
    CW = el.clientWidth; CH = el.clientHeight;
    cv.width = Math.round(CW * DPR); cv.height = Math.round(CH * DPR);
    SC = CH / 1000; VW = CW / SC;
    AW = clamp(VW, 400, 1000); AX = (VW - AW) / 2;
  }
  function loop(now) {
    if (!open) return;
    const dt = Math.min(0.05, (now - lastT) / 1000 || 0.016); lastT = now; t += dt;
    if (mode === 'play') { cur.update(G_, dt); stepParts(dt); }
    else if (mode === 'over') stepParts(dt);
    if (shake > 0) shake -= dt;
    const X0 = X; X = ctx;
    try {
      X.setTransform(DPR * SC, 0, 0, DPR * SC, 0, 0);
      if (shake > 0) X.translate(rand(-8, 8), rand(-8, 8));
      if (cur) {
        cur.draw(G_);
        if (mode === 'ready') {
          X.fillStyle = 'rgba(58,40,80,.35)'; X.fillRect(-20, -20, VW + 40, 1040);
          fr(VW / 2 - Math.min(VW * 0.45, 330), 330, Math.min(VW * 0.9, 660), 300, 34, '#fff');
          X.textAlign = 'center'; X.fillStyle = '#3a2428'; X.font = FONT(700, Math.min(46, Math.min(VW * 0.9, 660) / 12)); X.fillText(`${cur.ic} ${cur.n}`, VW / 2, 410);
          X.font = FONT(500, 26); X.fillStyle = '#7a6a80'; wrap(cur.help, VW / 2, 462, Math.min(VW * 0.8, 580), 34);
          X.font = FONT(700, 34); X.fillStyle = '#ff5f9e'; X.globalAlpha = 0.6 + Math.sin(t * 5) * 0.4; X.fillText('Toque para começar', VW / 2, 590); X.globalAlpha = 1;
        }
      } else {
        sky('#c5a3ff', '#ffb3d1');
        for (let i = 0; i < 20; i++) { X.globalAlpha = 0.35; fc(srand(i) * VW, ((srand(i + 5) * 1100 - t * 40 * (0.5 + srand(i + 1))) % 1100 + 1100) % 1100, 6 + srand(i + 2) * 14, '#fff'); }
        X.globalAlpha = 1;
      }
    } finally { X = X0; }
    if (mode === 'menu' && hero) drawHeroPreview();
    raf = requestAnimationFrame(loop);
  }
  function wrap(txt, x, y, w, lh) {
    const words = txt.split(' '); let ln = '';
    for (const wd of words) { const tst = ln ? ln + ' ' + wd : wd; if (X.measureText(tst).width > w && ln) { X.fillText(ln, x, y); ln = wd; y += lh; } else ln = tst; }
    X.fillText(ln, x, y);
  }
  function drawHeroPreview() {
    const w = hcv.clientWidth, h = hcv.clientHeight;
    if (hcv.width !== w * DPR) { hcv.width = w * DPR; hcv.height = h * DPR; }
    const X0 = X; X = hctx;
    try {
      X.setTransform(DPR, 0, 0, DPR, 0, 0); X.clearRect(0, 0, w, h);
      hero.dancing = true; hero.moving = false; hero.reactT = 0;
      X.save(); X.translate(w / 2, h - 6); const s = h / 470; X.scale(s, s); drawChar(hero, t, true); X.restore();
      hero.dancing = false;
    } finally { X = X0; }
  }

  // ---------- entrada ----------
  function toLocal(ev) { const r = cv.getBoundingClientRect(); return { x: (ev.clientX - r.left) / SC, y: (ev.clientY - r.top) / SC }; }
  function onDown(ev) {
    Sfx.unlock();
    const p = toLocal(ev); ptr = { ...p, down: true };
    if (mode === 'ready') { begin(); return; }
    if (mode === 'play' && cur.tap) cur.tap(G_, p.x, p.y);
  }
  function onMove(ev) { if (ptr) Object.assign(ptr, toLocal(ev)); }
  function onUp() { if (ptr) ptr.down = false; }
  function onKey(ev, down) {
    if (!open) return;
    const k = ev.key;
    if (k === 'ArrowLeft' || k === 'a' || k === 'A') keys.l = down;
    if (k === 'ArrowRight' || k === 'd' || k === 'D') keys.r = down;
    if (!down) return;
    if (k === 'Escape') { back(); return; }
    if (mode === 'ready' && (k === ' ' || k === 'Enter')) { begin(); ev.preventDefault(); return; }
    if (mode === 'over' && (k === ' ' || k === 'Enter')) { play(cur); ev.preventDefault(); return; }
    if (mode === 'play' && cur.key) { cur.key(G_, k); if (k === ' ') ev.preventDefault(); }
  }
  function back() { Sfx.click(); if (mode === 'menu') close(); else showMenu(); }

  function show() {
    if (open) return;
    open = true; el.classList.remove('hidden');
    pickHero(); resize(); showMenu();
    Sfx.unlock();
    lastT = performance.now(); raf = requestAnimationFrame(loop);
  }
  function close() { open = false; cancelAnimationFrame(raf); el.classList.add('hidden'); mode = 'menu'; cur = null; G_ = null; keys.l = keys.r = false; }

  function init() {
    el = $('#mini'); cv = $('#miniCanvas'); ctx = cv.getContext('2d');
    hcv = $('#miniHero'); hctx = hcv.getContext('2d');
    cv.addEventListener('pointerdown', onDown); cv.addEventListener('pointermove', onMove);
    addEventListener('pointerup', onUp); addEventListener('pointercancel', onUp);
    addEventListener('keydown', (e) => onKey(e, true)); addEventListener('keyup', (e) => onKey(e, false));
    addEventListener('resize', () => { if (open) resize(); });
    $('#btnMini').addEventListener('click', () => { Sfx.click(); show(); });
    $('#miniBack').addEventListener('click', back);
    $('#miniPrev').addEventListener('click', () => { heroIx--; pickHero(); buildMenu(); Sfx.click(); });
    $('#miniNext').addEventListener('click', () => { heroIx++; pickHero(); buildMenu(); Sfx.click(); });
    $('#miniAgain').addEventListener('click', () => { Sfx.click(); play(cur); });
    $('#miniToMenu').addEventListener('click', () => { Sfx.click(); showMenu(); });
  }
  return { init, show, close, isOpen: () => open, covering: () => open, data };
})();
