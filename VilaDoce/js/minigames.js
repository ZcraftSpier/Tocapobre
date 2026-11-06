'use strict';
// ======================================================
//  Fliperama: minigames com o seu personagem
//  (pulo nas nuvens, chuva de comida, estoura balão, memória musical, corre-corre, piano doce, rinha de galo, boxe da vila, descida na neve)
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
  function cast() { return (typeof G !== 'undefined' ? G.ents : []).filter((e) => e.kind === 'char' && !e.ghost); }
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
      parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 120, life: rand(0.5, 0.9), max: 0.9, r: rand(5, 10), col: pick(cols), kind: 'dot', sh: (Math.random() * 3) | 0, rot: rand(0, TAU), vr: rand(-10, 10) });
    }
  }
  // ---------- impacto: pausa no golpe, clarão, vibração, onda de choque ----------
  let hitT = 0, flashT = 0, flashMax = 0.15, flashC = '#fff', hudPop = 0, hudLast = '';
  function hitstop(sec) { hitT = Math.max(hitT, sec); }
  function flash(c = '#fff', sec = 0.15) { flashC = c; flashT = flashMax = sec; }
  function vib(ms) { try { if (navigator.vibrate) navigator.vibrate(ms); } catch (e) { /* sem vibração */ } }
  function ring(x, y, col, r = 90) { parts.push({ x, y, vx: 0, vy: 0, life: 0.45, max: 0.45, r, col, kind: 'ring' }); }
  function say(x, y, txt, col = '#fff') { parts.push({ x, y, vx: 0, vy: -90, life: 0.9, max: 0.9, txt, col, kind: 'txt' }); }
  function stepParts(dt) {
    for (const p of parts) { p.life -= dt; p.x += p.vx * dt; p.y += p.vy * dt; if (p.kind === 'dot') { p.vy += 900 * dt; p.rot += p.vr * dt; } }
    parts = parts.filter((p) => p.life > 0);
  }
  function drawParts(dy = 0) {
    for (const p of parts) {
      X.globalAlpha = clamp(p.life / p.max * 1.6, 0, 1);
      if (p.kind === 'dot') {
        if (!p.sh) fc(p.x, p.y - dy, p.r, p.col);
        else { X.save(); X.translate(p.x, p.y - dy); X.rotate(p.rot); if (p.sh === 1) { starPath(0, 0, p.r * 1.4, p.r * 0.6); X.fillStyle = p.col; X.fill(); } else fr(-p.r, -p.r * 0.5, p.r * 2, p.r, 2, p.col); X.restore(); }
      } else if (p.kind === 'ring') {
        const k = 1 - p.life / p.max; X.globalAlpha = (1 - k) * 0.8;
        X.beginPath(); X.arc(p.x, p.y - dy, p.r * (0.3 + k), 0, TAU); stroke(10 * (1 - k) + 2, p.col);
      } else {
        // texto que "salta" ao aparecer
        const age = p.max - p.life, k = age < 0.12 ? 1.7 - age / 0.12 * 0.7 : 1;
        X.save(); X.translate(p.x, p.y - dy); X.scale(k, k); X.translate(-p.x, -(p.y - dy));
        X.font = FONT(700, 34); X.textAlign = 'center'; X.lineWidth = 6; X.strokeStyle = 'rgba(58,36,40,.55)'; X.strokeText(p.txt, p.x, p.y - dy); X.fillStyle = p.col; X.fillText(p.txt, p.x, p.y - dy);
        X.restore();
      }
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
    help: 'Pule nas nuvens para subir! Pise nos passarinhos para ganhar moedas (por baixo eles te derrubam) e pegue o balão para voar. Use ← → ou arraste o dedo.',
    stars: [100, 300, 600],
    start() {
      const g = { x: AX + AW / 2, y: 820, vy: -1250, vx: 0, cam: 0, top: 820, clouds: [], coins: [], birds: [], ups: [], boost: 0, next: 900, score: 0, got: 0, face: 1, stomps: 0 };
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
        // passarinhos (pise neles!) e o balão que leva para cima
        if (h > 50 && Math.random() < Math.min(0.22, 0.08 + h / 3000)) { const d = Math.random() < 0.5 ? 1 : -1; g.birds.push({ x: d > 0 ? AX - 60 : AX + AW + 60, y: g.next - rand(50, 90), vx: d * rand(130, 230 + Math.min(150, h / 6)), ph: rand(0, 6) }); }
        if (h > 80 && Math.random() < 0.035) g.ups.push({ x: AX + rand(60, AW - 60), y: g.next - 120 });
      }
    },
    update(g, dt) {
      const dir = (keys.r ? 1 : 0) - (keys.l ? 1 : 0);
      if (dir) g.vx = dir * 620;
      else if (ptr && ptr.down) g.vx = clamp((ptr.x - g.x) * 7, -750, 750);
      else g.vx *= Math.pow(0.02, dt);
      if (Math.abs(g.vx) > 40) g.face = Math.sign(g.vx);
      const py = g.y;
      if (g.boost > 0) { g.boost -= dt; g.vy = -1500; if (Math.random() < dt * 30) burst(g.x, g.y, 1, ['#fff', '#ffd6e7'], 120); }
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
            g.vy = 420; g.vx = -Math.sign(b.vx) * 500; shake = 0.35; flash('#ff6b6b', 0.2); vib(70); Sfx.squeak();
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
      g.birds = g.birds.filter((b) => b.y < g.cam + 1150 && b.x > AX - 200 && b.x < AX + AW + 200);
      g.ups = g.ups.filter((u) => !u.got && u.y < g.cam + 1150);
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
      for (const u of g.ups) { const yy = u.y + Math.sin(t * 3 + u.x) * 8; X.beginPath(); X.moveTo(u.x, yy); X.lineTo(u.x, yy + 50); stroke(2.5, '#9aa0aa'); fe(u.x, yy - 30, 30, 38, LG(0, yy - 68, 0, yy, '#ffb3d1', '#ff5f9e')); fe(u.x - 10, yy - 44, 6, 11, 'rgba(255,255,255,.6)', 0.4); }
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

  // ---------- 2. Chuva de Comida ----------
  const FOODS = ['apple', 'banana', 'pizza', 'cake', 'donut', 'icecream', 'watermelon', 'orange', 'chocolate', 'brigadeiro', 'popcorn', 'morango'];
  GAMES.push({
    id: 'chuva', n: 'Chuva de Comida', ic: '🍎', col: '#ffb199', per: 8,
    help: 'Pegue as comidas e fuja das bombinhas! Pegar em sequência multiplica os pontos. O ímã puxa a comida e o coração dá vida extra. Use ← → ou arraste.',
    stars: [25, 70, 140],
    mult(g) { return Math.min(4, 1 + Math.floor(g.combo / 8)); },
    start() { return { x: AX + AW / 2, vx: 0, face: 1, drops: [], spawnT: 0.6, lives: 3, score: 0, combo: 0, joyT: 0, hurtT: 0, el: 0, magT: 0 }; },
    update(g, dt) {
      g.el += dt;
      const dir = (keys.r ? 1 : 0) - (keys.l ? 1 : 0);
      if (dir) g.vx = dir * 820;
      else if (ptr && ptr.down) g.vx = clamp((ptr.x - g.x) * 9, -1000, 1000);
      else g.vx = 0;
      if (Math.abs(g.vx) > 40) g.face = Math.sign(g.vx);
      g.x = clamp(g.x + g.vx * dt, AX + 60, AX + AW - 60);
      g.joyT -= dt; g.hurtT -= dt; g.magT -= dt;
      const lvl = Math.min(1, g.el / 90);
      g.spawnT -= dt;
      if (g.spawnT <= 0) {
        g.spawnT = lerp(1.0, 0.42, lvl) * rand(0.8, 1.2);
        const r = Math.random(), foods = FOODS.filter((k) => ITEMS[k]);
        g.drops.push({ x: AX + rand(50, AW - 50), y: -60, vy: lerp(260, 560, lvl) * rand(0.9, 1.15), rot: rand(-0.4, 0.4), vr: rand(-2, 2),
          k: r < lerp(0.12, 0.28, lvl) ? 'bomb' : r > 0.95 ? 'star' : r > 0.93 && g.lives < 3 ? 'heart' : r > 0.91 && g.magT <= 0 ? 'magnet' : pick(foods) });
      }
      const bx = g.x, by = 760;
      for (const d of g.drops) {
        d.y += d.vy * dt; d.rot += d.vr * dt;
        if (g.magT > 0 && d.k !== 'bomb' && d.y > 250) d.x += (bx - d.x) * Math.min(1, dt * 4);
        if (!d.done && d.y > by - 40 && d.y < by + 10 && Math.abs(d.x - bx) < 74) {
          d.done = true;
          if (d.k === 'bomb') { g.lives--; g.combo = 0; g.hurtT = 0.6; shake = 0.4; Sfx.poof(); burst(d.x, d.y, 16, ['#3b3446', '#ffb02e', '#8a8299'], 500); ring(d.x, d.y, '#ffb02e', 130); say(d.x, d.y - 40, 'Ai!', '#ff6b6b'); flash('#ff6b6b', 0.22); hitstop(0.08); vib(90); }
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
      fe(VW * 0.2, 980, VW * 0.5, 160, '#a6df8f'); fe(VW * 0.8, 1000, VW * 0.55, 180, '#8fd37a');
      fr(0, 890, VW, 110, 0, '#7cc966'); fr(0, 890, VW, 10, 0, '#6bb857');
      sideShade();
      for (const d of g.drops) {
        if (d.k === 'bomb') bombArt(d.x, d.y, 30);
        else if (d.k === 'heart') { fc(d.x, d.y - 4, 40, 'rgba(255,255,255,.5)'); heart(d.x, d.y + 10, 34, '#ff5f7e'); }
        else if (d.k === 'magnet') { X.save(); X.translate(d.x, d.y); X.rotate(d.rot); X.beginPath(); X.arc(0, -4, 24, Math.PI, 0); stroke(16, '#e8283f'); fr(-32, -6, 16, 22, 3, '#e6ebf0'); fr(16, -6, 16, 22, 3, '#e6ebf0'); X.restore(); }
        else if (d.k === 'star') { X.save(); X.translate(d.x, d.y); X.rotate(d.rot); starPath(0, 0, 34, 15); X.fillStyle = '#ffd23f'; X.fill(); stroke(4, '#f2a90f'); X.restore(); }
        else itemArt(d.k, d.x, d.y, 0.8, d.rot);
      }
      const sh = g.hurtT > 0 ? Math.sin(t * 60) * 6 : 0;
      if (g.magT > 0) { X.globalAlpha = 0.25 + 0.15 * Math.sin(t * 10); for (let i = 0; i < 3; i++) { X.beginPath(); X.arc(g.x, 760, 90 + ((t * 120 + i * 60) % 180), Math.PI * 1.1, Math.PI * 1.9); stroke(4, '#4dabf7'); } X.globalAlpha = 1; }
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
      if (this.mult(g) > 1) pill(VW / 2, 160, 90, 40, `x${this.mult(g)}`, '#ff5f9e');
    },
    reward(g) { return Math.floor(g.score / this.per); },
  });

  // ---------- 3. Estoura Balão ----------
  const BCOLS = ['#ff5d8f', '#4dabf7', '#7ed957', '#ffd23f', '#a77bf3', '#ff9f43'];
  GAMES.push({
    id: 'baloes', n: 'Estoura Balão', ic: '🎈', col: '#ff9ec4', per: 10,
    help: 'Estoure balões em sequência para multiplicar os pontos! O balão de confete estoura todos em volta, o relógio dá +5s. Cuidado com as nuvens de chuva!',
    stars: [40, 90, 160],
    mult(g) { return Math.min(5, 1 + Math.floor(g.chain / 5)); },
    start() { return { bs: [], spawnT: 0, time: 45, score: 0, el: 0, joyT: 0, chain: 0, chainT: 0 }; },
    update(g, dt) {
      g.el += dt; g.time -= dt; g.joyT -= dt;
      g.chainT -= dt; if (g.chainT <= 0 && g.chain) { if (g.chain >= 10) say(AX + AW / 2, 300, `Sequência de ${g.chain}!`, '#ffd23f'); g.chain = 0; }
      const lvl = Math.min(1, g.el / 40);
      g.spawnT -= dt;
      if (g.spawnT <= 0) {
        g.spawnT = lerp(0.75, 0.32, lvl);
        const r = Math.random();
        g.bs.push({ x: AX + rand(60, AW - 60), y: 1100, vy: lerp(170, 360, lvl) * rand(0.85, 1.25), ph: rand(0, TAU), s: rand(0.85, 1.15),
          k: r < 0.15 + lvl * 0.1 ? 'chuva' : r > 0.95 ? 'ouro' : r > 0.91 ? 'confete' : r > 0.885 ? 'relogio' : 'n', col: pick(BCOLS) });
      }
      for (const b of g.bs) { b.y -= b.vy * dt; b.x += Math.sin(t * 2 + b.ph) * 30 * dt; }
      g.bs = g.bs.filter((b) => b.y > -160 && !b.pop);
      if (g.time <= 0) { g.time = 0; return end(); }
    },
    popB(g, b, blast) {
      if (b.pop) return;
      b.pop = true;
      const cy = b.y - 52 * b.s;
      if (b.k === 'chuva') {
        if (blast) { burst(b.x, cy, 8, ['#8a96a8', '#c9ced8'], 300); return; } // explosão de confete desfaz as nuvens sem castigo
        g.time = Math.max(0, g.time - 5); g.chain = 0; shake = 0.35; Sfx.poof(); burst(b.x, cy, 12, ['#8a96a8', '#4dabf7'], 420); say(b.x, b.y - 90, '-5s', '#9fd3ff'); flash('#4d6080', 0.2); vib(70);
        return;
      }
      g.chain++; g.chainT = 0.9;
      const m = this.mult(g), p = (b.k === 'ouro' ? 5 : 1) * m;
      g.score += p; g.joyT = 0.3; Sfx.pop(); vib(8);
      burst(b.x, cy, 12, b.k === 'ouro' ? ['#ffd23f', '#fff1a8'] : [b.col, '#fff']); say(b.x, b.y - 90, '+' + p, m > 1 ? '#ffd23f' : '#fff');
      if (b.k === 'ouro') { Sfx.sparkle(); ring(b.x, cy, '#ffd23f'); }
      if (b.k === 'relogio') { g.time += 5; Sfx.ding(); say(b.x, b.y - 140, '+5s', '#7ed957'); ring(b.x, cy, '#7ed957'); }
      if (b.k === 'confete') {
        Sfx.poof(); Sfx.sparkle(); hitstop(0.07); flash('#ffffff', 0.2); shake = 0.25; vib(50);
        ring(b.x, cy, '#ff8fbd', 280); burst(b.x, cy, 30, ['#ff6b6b', '#ffd23f', '#4dabf7', '#7ed957', '#ff7eb6'], 650);
        for (const o of g.bs) if (!o.pop && Math.hypot(o.x - b.x, o.y - b.y) < 280) this.popB(g, o, true);
      }
    },
    tap(g, x, y) {
      for (let i = g.bs.length - 1; i >= 0; i--) {
        const b = g.bs[i];
        if (Math.hypot((x - b.x) / (44 * b.s), (y - (b.y - 52 * b.s)) / (56 * b.s)) < 1.15) { this.popB(g, b, false); return; }
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
          const col = b.k === 'ouro' ? '#ffc21a' : b.k === 'confete' ? '#ff5f9e' : b.k === 'relogio' ? '#7ed957' : b.col;
          fpoly([-7, 4, 7, 4, 0, -6], shade(col, -0.2));
          fe(0, -52, 42, 52, RG(-14, -72, 4, 60, shade(col, 0.35), col, shade(col, -0.2)));
          X.beginPath(); X.ellipse(0, -52, 42, 52, 0, 0, TAU); stroke(3, 'rgba(58,36,40,.35)');
          fe(-16, -72, 8, 15, 'rgba(255,255,255,.45)', 0.4);
          if (b.k === 'ouro') { starPath(0, -52, 16, 7); X.fillStyle = '#fff6c4'; X.fill(); }
          if (b.k === 'confete') { for (let i = 0; i < 9; i++) fc(-26 + srand(i) * 52, -86 + srand(i + 5) * 66, 5, ['#ff6b6b', '#ffd23f', '#4dabf7', '#7ed957'][i % 4]); X.font = FONT(700, 30); X.textAlign = 'center'; X.fillStyle = '#fff'; X.fillText('💥', 0, -40); }
          if (b.k === 'relogio') { fc(0, -52, 22, '#fff'); line(0, -52, 0, -66, 4, '#3a2428'); line(0, -52, 10, -52, 4, '#3a2428'); }
        }
        X.restore();
      }
      drawHero(AX + 90, 960, 0.26, { joy: g.joyT > 0 });
      drawParts();
      hud(String(g.score), `⏱ ${Math.ceil(g.time)}`);
      if (this.mult(g) > 1) pill(VW / 2, 178, 90, 40, `x${this.mult(g)}`, '#ff5f9e');
      // barrinha da sequência
      if (g.chain) { const w = 160, k = Math.max(0, g.chainT / 0.9); fr(VW / 2 - w / 2, 206, w, 8, 4, 'rgba(255,255,255,.6)'); fr(VW / 2 - w / 2, 206, w * k, 8, 4, '#ff5f9e'); }
    },
    reward(g) { return Math.floor(g.score / this.per); },
  });

  // ---------- 4. Memória Musical ----------
  const PADS = [['#ff7eb6', 523.25], ['#ffd23f', 659.25], ['#4dabf7', 783.99], ['#7ed957', 1046.5]];
  GAMES.push({
    id: 'memoria', n: 'Memória Musical', ic: '🎵', col: '#c5a3ff', per: 2,
    help: 'Observe a sequência e repita tocando nas carinhas (ou teclas 1 a 4). Seja rápido! A partir da rodada 5 as carinhas trocam de lugar.',
    stars: [6, 10, 14],
    start() { const g = { seq: [], at: 0, phase: 'wait', timer: 0.8, lit: -1, litT: 0, score: 0, sad: 0, joyT: 0, inT: 0, perm: [0, 1, 2, 3], prev: [0, 1, 2, 3], swapT: 0 }; return g; },
    // posição atual de cada carinha (anima a troca de lugar)
    pads(g) {
      const L = this.layout(), k = g.swapT > 0 ? 1 - g.swapT / 0.55 : 1, e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
      return PADS.map((_, i) => { const a = L[g.prev[i]], b = L[g.perm[i]]; return { x: lerp(a.x, b.x, e), y: lerp(a.y, b.y, e) - Math.sin(e * Math.PI) * 60 * (i % 2 ? 1 : -1), s: a.s }; });
    },
    layout() {
      const sz = Math.min(AW * 0.42, 250), gap = sz * 0.12, cx = AX + AW / 2, cy = 560;
      return PADS.map((p, i) => ({ x: cx + (i % 2 ? gap / 2 : -gap / 2 - sz), y: cy + (i > 1 ? gap / 2 : -gap / 2 - sz), s: sz }));
    },
    light(g, i) { g.lit = i; g.litT = 0.32; Sfx.note(PADS[i][1]); },
    update(g, dt) {
      g.litT -= dt; g.joyT -= dt; if (g.litT <= 0) g.lit = -1;
      if (g.swapT > 0) { g.swapT -= dt; if (g.swapT <= 0) g.prev = g.perm.slice(); }
      if (g.phase === 'input') { g.inT += dt; if (g.inT > 3) { g.phase = 'over'; g.timer = 1.1; g.late = true; shake = 0.3; Sfx.squeak(); flash('#ff6b6b', 0.2); vib(80); return; } }
      if (g.phase === 'wait') { g.timer -= dt; if (g.timer <= 0 && g.swapT <= 0) { g.seq.push((Math.random() * 4) | 0); g.at = 0; g.phase = 'show'; g.timer = 0.3; } }
      else if (g.phase === 'show') {
        g.timer -= dt;
        if (g.timer <= 0) {
          if (g.at < g.seq.length) { this.light(g, g.seq[g.at]); g.at++; g.timer = Math.max(0.28, 0.6 - g.seq.length * 0.025); }
          else if (g.lit < 0) { g.phase = 'input'; g.at = 0; g.inT = 0; }
        }
      } else if (g.phase === 'over') { g.timer -= dt; if (g.timer <= 0) return end(); }
    },
    press(g, i) {
      if (g.phase !== 'input') return;
      this.light(g, i); g.inT = 0;
      const P = this.pads(g)[i], cx = P.x + P.s / 2, cy = P.y + P.s / 2;
      if (g.seq[g.at] !== i) { g.phase = 'over'; g.timer = 1.1; g.sad = i + 1; shake = 0.3; Sfx.squeak(); flash('#ff6b6b', 0.2); vib(80); return; }
      g.at++; burst(cx, cy, 6, [PADS[i][0], '#fff'], 260); ring(cx, cy, PADS[i][0], P.s * 0.6); vib(10);
      if (g.at >= g.seq.length) {
        g.score = g.seq.length; g.phase = 'wait'; g.timer = 0.9; g.joyT = 0.8; say(AX + AW / 2, 250, 'Isso!', '#7ed957'); setTimeout(() => open && Sfx.ding(), 250);
        if (g.score % 5 === 0) { flash('#fff6c4', 0.25); burst(AX + AW / 2, 560, 30, ['#ff7eb6', '#ffd23f', '#4dabf7', '#7ed957'], 650); say(AX + AW / 2, 320, `Rodada ${g.score}! 🎉`, '#ffd23f'); Sfx.sparkle(); vib(40); }
        if (g.score >= 5 && Math.random() < 0.6) {
          // troca duas carinhas de lugar
          const a = (Math.random() * 4) | 0, b = (a + 1 + ((Math.random() * 3) | 0)) % 4;
          g.prev = g.perm.slice(); [g.perm[a], g.perm[b]] = [g.perm[b], g.perm[a]]; g.swapT = 0.55; g.timer = 0.6;
          setTimeout(() => open && Sfx.whoosh(), 700);
        }
      }
    },
    tap(g, x, y) { if (g.swapT > 0) return; this.pads(g).forEach((p, i) => { if (x > p.x && x < p.x + p.s && y > p.y && y < p.y + p.s) this.press(g, i); }); },
    key(g, k) { const n = parseInt(k, 10); if (n >= 1 && n <= 4) this.press(g, n - 1); },
    draw(g) {
      sky('#e6dbff', '#ffe6f2');
      for (let i = 0; i < 14; i++) { X.globalAlpha = 0.25; X.font = FONT(600, 30 + srand(i) * 30); X.fillStyle = '#a77bf3'; X.fillText(i % 2 ? '♪' : '♫', srand(i + 1) * VW, ((srand(i + 2) * 1000 - t * 30 * (1 + srand(i))) % 1000 + 1000) % 1000); }
      X.globalAlpha = 1;
      sideShade();
      this.pads(g).forEach((p, i) => {
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
      const msg = g.phase === 'show' || g.phase === 'wait' ? (g.swapT > 0 ? 'Trocaram de lugar!' : 'Preste atenção...') : g.phase === 'input' ? 'Sua vez!' : g.late ? 'Tempo!' : 'Ah não!';
      pill(AX + AW / 2, 210, 320, 56, msg, '#7a4fd0');
      if (g.phase === 'input') { const w = 260, k = Math.max(0, 1 - g.inT / 3); fr(AX + AW / 2 - w / 2, 250, w, 12, 6, 'rgba(255,255,255,.6)'); fr(AX + AW / 2 - w / 2, 250, w * k, 12, 6, k < 0.35 ? '#ff6b6b' : '#a77bf3'); }
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
    help: 'Toque ou aperte espaço para pular (dá para pular duas vezes). Passarinhos voam baixo: fique no chão para passar por baixo! O escudo aguenta uma batida.',
    stars: [80, 220, 450],
    start() { return { y: 0, vy: 0, jumps: 0, sp: 520, dist: 0, obs: [], coins: [], ups: [], nextO: 700, got: 0, score: 0, dead: 0, shield: false, inv: 0, streak: 0 }; },
    jump(g) {
      if (g.dead) return;
      if (g.jumps < 2) { g.vy = g.jumps ? -1000 : -1180; g.jumps++; Sfx.boing(); if (g.jumps === 2) burst(AX + 180, 860 + g.y, 6, ['#fff', '#e3f4ff'], 200); }
    },
    tap(g) { this.jump(g); },
    key(g, k) { if (k === ' ' || k === 'ArrowUp' || k === 'w' || k === 'W') this.jump(g); },
    update(g, dt) {
      if (g.dead) { g.dead += dt; g.vy += 3000 * dt; g.y = Math.min(0, g.y + g.vy * dt); if (g.dead > 1) return end(); return; }
      g.sp = Math.min(1150, 520 + g.dist / 40); g.dist += g.sp * dt; g.score = Math.floor(g.dist / 100); g.inv -= dt;
      g.vy += 3000 * dt; g.y += g.vy * dt; if (g.y >= 0) { g.y = 0; g.vy = 0; g.jumps = 0; }
      const hx = AX + 180;
      g.nextO -= g.sp * dt;
      if (g.nextO <= 0) {
        const pool = g.dist < 2500 ? OBST.filter((o) => o[0] !== 'caixa2') : OBST, o = g.dist > 1800 && Math.random() < 0.22 ? ['passaro', 90, 0] : pick(pool);
        g.obs.push({ k: o[0], w: o[1], h: o[2], x: AX + AW + 100, ph: rand(0, 6) });
        if (!g.shield && g.dist > 1200 && Math.random() < 0.07) g.ups.push({ x: AX + AW + 100 + o[1] + rand(200, 300), y: 700 });
        if (o[0] === 'passaro') for (let i = 0; i < 4; i++) g.coins.push({ x: AX + AW + 100 + i * 60, y: 815 }); // moedas no chão, por baixo do passarinho
        else if (Math.random() < 0.55) for (let i = 0; i < 5; i++) g.coins.push({ x: AX + AW + 100 + o[1] / 2 + (i - 2) * 60, y: 860 - o[2] - 110 - Math.sin(i / 4 * Math.PI) * 90 });
        else if (Math.random() < 0.5) for (let i = 0; i < 4; i++) g.coins.push({ x: AX + AW + 420 + i * 60, y: 820 });
        g.nextO = rand(420, 760) * (g.sp / 520) * 0.8;
      }
      for (const o of g.obs) { o.x -= g.sp * dt * (o.k === 'passaro' ? 1.25 : 1); o.ph += dt * 14; }
      for (const u of g.ups) u.x -= g.sp * dt;
      g.ups = g.ups.filter((u) => !u.got && u.x > AX - 100);
      for (const c of g.coins) c.x -= g.sp * dt;
      g.obs = g.obs.filter((o) => o.x + o.w > AX - 200);
      g.coins = g.coins.filter((c) => !c.got && c.x > AX - 100);
      const feet = 860 + g.y;
      for (const c of g.coins) if (Math.abs(c.x - hx) < 50 && c.y > feet - 150 && c.y < feet + 20) {
        c.got = true; g.got++; g.streak++; Sfx.coin(); burst(c.x, c.y, 6, ['#ffd23f', '#fff1a8']);
        if (g.streak % 10 === 0) { g.got += 5; say(hx, feet - 200, `+5 sequência!`, '#ffd23f'); Sfx.ding(); ring(hx, feet - 60, '#ffd23f', 120); vib(20); }
      }
      // moeda que passou sem ser pega quebra a sequência
      for (const c of g.coins) if (!c.got && !c.miss && c.x < hx - 60) { c.miss = true; g.streak = 0; }
      for (const u of g.ups) if (Math.abs(u.x - hx) < 60 && Math.abs(u.y - (feet - 60)) < 90) { u.got = true; g.shield = true; Sfx.sparkle(); flash('#9fd3ff', 0.2); say(hx, feet - 200, 'Escudo!', '#9fd3ff'); ring(hx, feet - 60, '#4dabf7', 130); vib(20); }
      for (const o of g.obs) {
        if (o.k === 'poca' || o.hit) continue;
        const hitBox = o.k === 'passaro'
          ? hx + 24 > o.x + 12 && hx - 24 < o.x + o.w - 12 && feet - 112 < 735 && feet > 690
          : hx + 24 > o.x + 8 && hx - 24 < o.x + o.w - 8 && feet > 860 - o.h + 10;
        if (!hitBox || g.inv > 0) continue;
        if (g.shield) {
          g.shield = false; g.inv = 1; o.hit = true; shake = 0.3; Sfx.knock(); flash('#9fd3ff', 0.25); hitstop(0.08); vib(60);
          burst(hx + 30, feet - 60, 16, ['#9fd3ff', '#fff', '#4dabf7'], 480); ring(hx, feet - 60, '#4dabf7', 150); say(hx, feet - 180, 'Ufa!', '#9fd3ff');
          continue;
        }
        g.dead = 0.001; g.vy = -900; shake = 0.4; Sfx.poof(); say(hx, feet - 180, 'Ai!', '#ff6b6b'); burst(hx, feet - 60, 12, ['#ff8fbd', '#ffd23f', '#fff'], 420);
        hitstop(0.12); flash('#ff6b6b', 0.25); vib(120);
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
        else if (o.k === 'passaro') {
          const y = 712, cx = x + o.w / 2;
          X.save(); X.translate(cx, y); X.scale(-1, 1); if (o.hit) X.globalAlpha = 0.4;
          fe(0, 0, 34, 22, '#ff9f43'); fc(26, -10, 15, '#ff9f43'); fpoly([38, -12, 54, -7, 38, -2], '#ffd23f'); fc(30, -13, 3.5, '#2a1d1a');
          fe(-4, -6 - Math.sin(o.ph) * 16, 24, 10, '#e8822a', -0.3 - Math.sin(o.ph) * 0.5);
          X.restore(); X.globalAlpha = 1;
          // sombra no chão avisa por onde ele passa
          fe(cx, 858, 40, 8, 'rgba(0,0,0,.12)');
        }
      }
      for (const u of g.ups) { const yy = u.y + Math.sin(t * 4) * 8; fc(u.x, yy, 34, 'rgba(159,211,255,.45)'); fpoly([u.x - 20, yy - 22, u.x + 20, yy - 22, u.x + 20, yy + 2, u.x, yy + 24, u.x - 20, yy + 2], '#4dabf7'); fpoly([u.x - 12, yy - 14, u.x, yy - 14, u.x, yy + 12, u.x - 12, yy + 2], '#9fd3ff'); }
      for (const c of g.coins) coinArt(c.x, c.y, 18, t + c.x * 0.01);
      sideShade();
      const air = g.y < -2;
      softShadow(AX + 180, 862, 50 + g.y * 0.05, 0.25);
      if (g.inv > 0 && Math.sin(t * 40) > 0) X.globalAlpha = 0.4;
      drawHero(AX + 180, 860 + g.y, 0.3, { run: !air && !g.dead, joy: air && !g.dead, rot: g.dead ? -0.5 : 0 });
      X.globalAlpha = 1;
      if (g.shield) { X.globalAlpha = 0.35 + 0.1 * Math.sin(t * 6); fe(AX + 180, 860 + g.y - 60, 70, 85, '#9fd3ff'); X.globalAlpha = 1; X.beginPath(); X.ellipse(AX + 180, 860 + g.y - 60, 70, 85, 0, 0, TAU); stroke(4, 'rgba(77,171,247,.8)'); }
      // linhas de velocidade
      if (g.sp > 800) { X.globalAlpha = (g.sp - 800) / 700; for (let i = 0; i < 8; i++) { const y = 120 + srand(i) * 600, x = ((srand(i + 3) * VW - t * 2400) % VW + VW) % VW; line(x, y, x + 120, y, 3, 'rgba(255,255,255,.7)'); } X.globalAlpha = 1; }
      drawParts();
      hud(`${g.score} m`, `$ ${g.got}`);
    },
    reward(g) { return g.got + Math.floor(g.score / this.per); },
  });

  // ---------- 6. Piano Doce ----------
  // Teclas caem em 4 colunas; toque cada uma quando chegar e a música vai saindo.
  const NT = { C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392, A4: 440, B4: 493.88, C5: 523.25, D5: 587.33, E5: 659.25 };
  const SONGS = [
    ['Brilha, brilha, estrelinha', 'C4 C4 G4 G4 A4 A4 G4 F4 F4 E4 E4 D4 D4 C4 G4 G4 F4 F4 E4 E4 D4 G4 G4 F4 F4 E4 E4 D4 C4 C4 G4 G4 A4 A4 G4 F4 F4 E4 E4 D4 D4 C4'],
    ['Ode à Alegria', 'E4 E4 F4 G4 G4 F4 E4 D4 C4 C4 D4 E4 E4 D4 D4 E4 E4 F4 G4 G4 F4 E4 D4 C4 C4 D4 E4 D4 C4 C4'],
    ['Parabéns pra você', 'G4 G4 A4 G4 C5 B4 G4 G4 A4 G4 D5 C5 G4 G4 E5 C5 B4 A4 F4 F4 E4 C4 D4 C4'],
    ['Cai, cai, balão', 'G4 G4 F4 E4 D4 G4 G4 F4 E4 D4 C4 E4 G4 E4 D4 C4 C4 E4 G4 E4 D4 C4'],
  ];
  // nota mais aguda → coluna mais à direita; evita repetir a coluna quando a nota muda
  const SONG_TILES = SONGS.map(([n, s]) => {
    const notes = s.split(' '), uniq = [...new Set(notes)].sort((a, b) => NT[a] - NT[b]);
    let prev = -1, prevN = '';
    const tiles = notes.map((k) => {
      let lane = Math.min(3, Math.floor(uniq.indexOf(k) * 4 / uniq.length));
      if (k !== prevN && lane === prev) lane = (lane + (uniq.indexOf(k) > uniq.indexOf(prevN) ? 1 : 3)) % 4;
      prev = lane; prevN = k;
      return { lane, f: NT[k] };
    });
    return { n, tiles };
  });
  const PIANO_COLS = ['#ff7eb6', '#a77bf3', '#4dabf7', '#7ed957'];
  const TH = 200, KEYS_Y = 870;
  GAMES.push({
    id: 'piano', n: 'Piano Doce', ic: '🎹', col: '#d6c4fb', per: 40,
    help: 'Toque nas teclas coloridas e toque a música! Perto da linha vale mais e o combo multiplica. Só perde vida a tecla que passar — e 40 acertos seguidos devolvem uma vida. (Teclado: D F J K)',
    stars: [60, 160, 350],
    mult(g) { return Math.min(4, 1 + Math.floor(g.combo / 15)); },
    board() { const bw = Math.min(AW - 30, 760); return { bx: AX + (AW - bw) / 2, bw, lw: bw / 4 }; },
    start() {
      const g = { tiles: [], song: (Math.random() * SONGS.length) | 0, at: 0, row: 0, hits: 0, started: false, sp: 300, score: 0, combo: 0, lives: 3, lock: 0, over: 0, joyT: 0, keyT: [0, 0, 0, 0], songT: 2.5 };
      for (let i = 0; i < 8; i++) this.addTile(g, KEYS_Y - TH - 20 - i * TH);
      return g;
    },
    addTile(g, y) {
      const S = SONG_TILES[g.song];
      if (g.at >= S.tiles.length) { g.song = (g.song + 1) % SONG_TILES.length; g.at = 0; g.pendingSong = true; }
      const src = SONG_TILES[g.song].tiles[g.at++];
      const row = g.row++, first = !g.tiles.length;
      g.tiles.push({ lane: src.lane, f: src.f, y, row, hit: 0, t: 0, first, song: g.pendingSong ? g.song : -1 });
      // teclas duplas quando já está rápido: a segunda toca a quinta da nota (harmonia)
      if (!first && g.sp > 680 && Math.random() < Math.min(0.18, (g.sp - 680) / 1500 + 0.06)) {
        const lane2 = (src.lane + 1 + ((Math.random() * 3) | 0)) % 4;
        g.tiles.push({ lane: lane2, f: src.f * 1.5, y, row, hit: 0, t: 0, dbl: true, song: -1 });
      }
      g.pendingSong = false;
    },
    target(g) { return g.tiles.find((k) => !k.hit); },
    press(g, lane) {
      if (g.over) return;
      const first = this.target(g);
      if (!first || first.y + TH < 0 || g.lock > 0) return;
      g.keyT[lane] = 0.18;
      const k = g.tiles.find((t2) => !t2.hit && t2.row === first.row && t2.lane === lane);
      const { bx, lw } = this.board();
      if (!k) {
        // coluna errada: só quebra o combo e trava os toques por um instante (não tira vida)
        g.combo = 0; g.lock = 0.3; shake = 0.15; Sfx.squeak(); vib(40);
        say(bx + lw * (lane + 0.5), KEYS_Y - 60, 'Ops!', '#ff6b6b');
        return;
      }
      const before = this.mult(g);
      k.hit = 1; g.started = true; g.hits++; g.combo++; g.joyT = 0.35;
      const perfect = Math.abs(k.y + TH - KEYS_Y) < 110, pts = (perfect ? 3 : 1) * before;
      g.score += pts;
      Sfx.note(k.f); vib(perfect ? 12 : 6);
      if (k.song >= 0) g.songT = 2.5, g.songN = k.song;
      const cx = bx + lw * (k.lane + 0.5);
      burst(cx, k.y + TH / 2, perfect ? 12 : 6, [PIANO_COLS[k.lane], '#fff', '#ffd23f'], perfect ? 380 : 260);
      if (perfect) { say(cx, k.y + TH / 2, `Perfeito! +${pts}`, '#ffd23f'); ring(cx, KEYS_Y, PIANO_COLS[k.lane], lw * 0.7); }
      else say(cx, k.y + TH / 2, `+${pts}`, '#fff');
      if (g.combo % 40 === 0 && g.lives < 3) { g.lives++; say(AX + AW / 2, 360, '+1 ❤', '#ff5f7e'); Sfx.sparkle(); }
      if (this.mult(g) > before) { say(AX + AW / 2, 300, `x${this.mult(g)}!`, '#ff8fbd'); flash(PIANO_COLS[k.lane], 0.18); setTimeout(() => open && Sfx.ding(), 120); }
    },
    tap(g, x, y) {
      const { bx, bw, lw } = this.board();
      if (x < bx || x > bx + bw) return;
      this.press(g, clamp(Math.floor((x - bx) / lw), 0, 3));
    },
    key(g, k) {
      const m = { d: 0, f: 1, j: 2, k: 3, D: 0, F: 1, J: 2, K: 3, 1: 0, 2: 1, 3: 2, 4: 3 };
      if (m[k] != null) this.press(g, m[k]);
    },
    update(g, dt) {
      g.joyT -= dt; g.songT -= dt; g.lock -= dt;
      for (let i = 0; i < 4; i++) g.keyT[i] -= dt;
      for (const k of g.tiles) if (k.hit) k.t += dt;
      if (g.over) { g.over += dt; if (g.over > 1.2) return end(); return; }
      if (!g.started) return;
      g.sp = Math.min(820, 300 + g.hits * 3.2);
      const dy = g.sp * dt;
      for (const k of g.tiles) k.y += dy;
      const top = Math.min(...g.tiles.map((k) => k.y));
      if (top > -TH * 2) this.addTile(g, top - TH);
      const k = this.target(g);
      if (k && k.y > KEYS_Y + 70) {
        for (const o of g.tiles) if (!o.hit && o.row === k.row) o.hit = 2;
        g.lives--; g.combo = 0; shake = 0.3; Sfx.squeak(); flash('#ff6b6b', 0.18); vib(70);
        const { bx, lw } = this.board(); say(bx + lw * (k.lane + 0.5), KEYS_Y - 40, 'Passou!', '#ff6b6b');
        if (g.lives <= 0) g.over = 0.001;
      }
      g.tiles = g.tiles.filter((t2) => t2.y < 1100);
    },
    draw(g) {
      sky('#2b2350', '#6a4fa8');
      // brilhinhos ao fundo
      for (let i = 0; i < 24; i++) { X.globalAlpha = 0.25 + 0.25 * Math.sin(t * 2 + i); fc(srand(i) * VW, srand(i + 9) * 800, 2 + srand(i + 3) * 3, '#fff6d0'); }
      X.globalAlpha = 1;
      sideShade();
      const { bx, bw, lw } = this.board();
      // trilhos
      fr(bx - 8, -20, bw + 16, KEYS_Y + 20, 0, 'rgba(255,255,255,.08)');
      for (let i = 0; i < 4; i++) {
        X.fillStyle = LG(0, 0, 0, KEYS_Y, 'rgba(255,255,255,0)', alpha(PIANO_COLS[i], 0.12 + (g.keyT[i] > 0 ? 0.25 : 0)));
        X.fillRect(bx + lw * i, 0, lw, KEYS_Y);
        if (i) line(bx + lw * i, 0, bx + lw * i, KEYS_Y, 2, 'rgba(255,255,255,.15)');
      }
      // teclas que caem
      for (const k of g.tiles) {
        if (k.y > 1000 || k.y + TH < 0) continue;
        const x = bx + lw * k.lane + 6, w = lw - 12, col = PIANO_COLS[k.lane];
        if (k.hit === 1) {
          const a = Math.max(0, 1 - k.t * 3); if (a <= 0) continue;
          X.globalAlpha = a; fr(x, k.y + 4, w, TH - 8, 18, alpha(col, 0.5)); X.globalAlpha = 1;
          continue;
        }
        const bad = k.hit === 2;
        fr(x, k.y + 10, w, TH - 8, 18, bad ? '#8a2a3a' : shade(col, -0.35));
        fr(x, k.y + 4, w, TH - 12, 18, bad ? '#ff6b6b' : LG(0, k.y, 0, k.y + TH, shade(col, 0.25), col));
        fr(x + 10, k.y + 14, w - 20, 16, 8, 'rgba(255,255,255,.35)');
        // notinha musical na tecla
        const nx = x + w / 2, ny = k.y + TH / 2 + 4;
        fe(nx - 6, ny + 14, 11, 8, 'rgba(255,255,255,.85)', -0.4); line(nx + 4, ny + 12, nx + 4, ny - 18, 4, 'rgba(255,255,255,.85)'); line(nx + 4, ny - 18, nx + 16, ny - 10, 4, 'rgba(255,255,255,.85)');
        if (k.first && !g.started) {
          X.font = FONT(700, 26); X.textAlign = 'center'; X.fillStyle = '#fff'; X.globalAlpha = 0.6 + Math.sin(t * 5) * 0.4;
          X.fillText('Toque!', nx, k.y + TH - 26); X.globalAlpha = 1;
        }
      }
      // linha de acerto e teclado
      fr(bx - 8, KEYS_Y - 6, bw + 16, 8, 4, 'rgba(255,240,180,.9)');
      fr(bx - 8, KEYS_Y + 2, bw + 16, 1000 - KEYS_Y, 0, '#fffaf2');
      for (let i = 0; i < 4; i++) {
        const on = g.keyT[i] > 0, x = bx + lw * i;
        fr(x + 3, KEYS_Y + 8 + (on ? 6 : 0), lw - 6, 110, 10, on ? alpha(PIANO_COLS[i], 0.55) : '#ffffff');
        RR(x + 3, KEYS_Y + 8 + (on ? 6 : 0), lw - 6, 110, 10); stroke(3, 'rgba(58,36,40,.25)');
        if (i < 3) fr(x + lw - 14, KEYS_Y + 2, 28, 62, 6, '#3a2f4a');
      }
      // nome da música
      if (g.songT > 0) {
        X.globalAlpha = Math.min(1, g.songT);
        const nm = '♪ ' + SONG_TILES[g.songN ?? g.song].n;
        pill(AX + AW / 2, 225, Math.min(AW - 40, nm.length * 15 + 60), 46, nm, '#7a4fd0');
        X.globalAlpha = 1;
      }
      // personagem dançando, se couber ao lado do piano
      if (bx > 140) {
        hero.dancing = g.started && !g.over;
        const big = bx > 320;
        drawHero(bx - (big ? 150 : 90), 990, big ? 0.42 : 0.26, { joy: g.joyT > 0 });
        hero.dancing = false;
      }
      drawParts();
      hud(String(g.score), null, g.lives);
      if (g.combo >= 5) pill(VW / 2, 160, 210, 40, `Combo ${g.combo}${this.mult(g) > 1 ? ' · x' + this.mult(g) : ''}`, '#ff5f9e');
    },
    reward(g) { return Math.floor(g.score / this.per); },
  });

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
    const bob = o.ko ? 0 : Math.sin(t * 6 + (o.ph || 0)) * 3, up = o.up || 0, lunge = o.lunge || 0;
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
      const a = 0.3 + i * 0.18 + Math.sin(t * 3 + i) * 0.03;
      X.beginPath(); X.moveTo(-40, -80); X.quadraticCurveTo(-70 - i * 6, -150 - i * 6 + a * 20, -95 - i * 8 + a * 30, -70 + i * 12);
      stroke(12 - i, tc[i % 3]);
    }
    // corpo
    fe(0, -82, 56, 40, c.body);
    if (c.spots) for (let i = 0; i < 10; i++) fc(-36 + srand(i) * 70, -100 + srand(i + 4) * 36, 4, c.spots);
    // asa (levantada ao defender)
    X.save(); X.translate(-4, -84); X.rotate(o.guard ? -0.9 : 0.15 + Math.sin(t * 6) * 0.03);
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
  GAMES.push({
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
      setTimeout(() => open && Sfx.bell(), 200);
    },
    meter(g) { return 1 - Math.abs((g.mt % 2) - 1); },
    pos(g) { return { px: AX + AW * 0.3, ex: AX + AW * 0.7, gy: 760, s: Math.min(1.25, AW / 640) }; },
    attack(g) {
      if (g.phase !== 'fight' || g.atkCD > 0) return;
      const e = g.e, { ex } = this.pos(g);
      g.atkCD = 0.45; g.lunge = 0.25;
      let dmg;
      if (g.sp >= 1) {
        // ESPORADA: golpe especial com a barra cheia
        g.sp = 0; dmg = 40 + g.lvl * 6; g.atkCD = 0.7;
        Sfx.poof(); Sfx.knock(); e.hurt = 0.5; shake = 0.5; hitstop(0.18); flash('#ffd23f', 0.3); vib([40, 30, 80]);
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
          Sfx.poof(); e.hurt = 0.3; shake = crit ? 0.25 : 0.1; vib(crit ? 35 : 12);
          burst(ex - 20, 640, crit ? 14 : 7, [e.body, e.neck, e.tail, '#fff'], crit ? 460 : 300);
          if (crit || ctr) { hitstop(0.06); ring(ex, 640, crit ? '#ffd23f' : '#9fd3ff', 110); }
          if (ctr) say(ex, 410, 'Contra-ataque!', '#9fd3ff');
          if (crit) { g.sp = Math.min(1, g.sp + 0.34); say(ex, 480, 'Crítico!', '#ffd23f'); if (e.st === 'wind') { e.st = 'stun'; e.timer = 0.9; say(ex, 420, 'Atordoado!', '#ff8fbd'); } }
        }
      }
      e.hp = Math.max(0, e.hp - dmg); g.dmg += dmg;
      if (e.hp <= 0) { e.st = 'ko'; g.phase = 'won'; g.timer = 1.8; g.score++; Sfx.sparkle(); setTimeout(() => open && Sfx.ding(), 300); say(AX + AW / 2, 360, 'Vitória!', '#7ed957'); }
    },
    defend(g) {
      if (g.phase !== 'fight' || g.defCD > 0) return;
      g.defT = 0.38; g.defCD = 0.6; Sfx.click();
    },
    tap(g, x, y) {
      if (y < 820) return;
      if (x < AX + AW / 2) this.attack(g); else this.defend(g);
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
          e.st = 'stun'; e.timer = 0.9; Sfx.knock(); shake = 0.15; g.counter = 0.6; g.sp = Math.min(1, g.sp + 0.25); hitstop(0.05); vib(25);
          say(px, 480, 'Defendeu!', '#9fd3ff'); burst(px + 60, 640, 8, ['#fff', '#c9ced8'], 300); ring(px + 50, 640, '#9fd3ff', 100);
        } else {
          const d = 10 + L * 2.2;
          g.hp = Math.max(0, g.hp - d); g.hurt = 0.3; shake = 0.3; Sfx.poof(); flash('#ff4d4d', 0.2); vib(70); hitstop(0.05);
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
      fc(AX + AW * 0.8, 470, 70, 'rgba(255,214,140,.85)');
      // plateia de sombras atrás da cerca (olhinhos que piscam...)
      const nP = Math.max(6, Math.round(VW / 90));
      for (let i = 0; i < nP; i++) {
        const x = (i + 0.5) * VW / nP + srand(i) * 20, h = 70 + srand(i + 3) * 40, y = 600 - h;
        fc(x, y, 30 + srand(i + 7) * 8, '#1d1426'); fr(x - 34, y + 10, 68, 140, 26, '#1d1426');
        if (Math.sin(t * 0.7 + i * 1.7) > -0.85) { fc(x - 9, y - 2, 3, 'rgba(255,230,160,.7)'); fc(x + 9, y - 2, 3, 'rgba(255,230,160,.7)'); }
      }
      // cerca do terreiro
      fr(-20, 600, VW + 40, 14, 4, '#6b4529'); fr(-20, 650, VW + 40, 14, 4, '#6b4529');
      for (let x = -10; x < VW + 40; x += 70) fr(x, 580, 14, 110, 4, '#5a3520');
      // chão de terra
      X.fillStyle = LG(0, 680, 0, 1000, '#b07a4a', '#7a4b2a'); X.fillRect(-20, 690, VW + 40, 320);
      fe(AX + AW / 2, gy + 10, AW * 0.42, 50, 'rgba(255,220,170,.18)');
      for (let i = 0; i < 40; i++) fc(srand(i + 20) * VW, 720 + srand(i + 40) * 260, 3, 'rgba(60,35,20,.25)');
      // galos
      softShadow(px, gy + 2, 90 * s, 0.3); softShadow(ex, gy + 2, 90 * s, 0.3);
      galoArt(px, gy, s, HEROI_GALO, { dir: 1, lunge: g.lunge > 0 ? Math.sin(Math.PI * (1 - g.lunge / 0.25)) * 1.2 : 0, guard: g.defT > 0, hurt: g.hurt, ko: g.ko || 0 });
      galoArt(ex, gy, s, e, { dir: -1, ph: 2, mad: true, up: e.st === 'wind' ? 1 : 0, lunge: e.lunge > 0 ? Math.sin(Math.PI * (1 - e.lunge / 0.25)) * 1.4 : 0, hurt: e.hurt, ko: e.ko });
      if (e.st === 'wind') { X.font = FONT(700, 80); X.textAlign = 'center'; X.fillStyle = '#ff4d4d'; X.lineWidth = 8; X.strokeStyle = '#fff'; X.strokeText('!', ex, 470 - Math.sin(t * 20) * 6); X.fillText('!', ex, 470 - Math.sin(t * 20) * 6); }
      if (e.st === 'stun') for (let i = 0; i < 3; i++) { const a = t * 5 + i * TAU / 3; fc(ex + Math.cos(a) * 40, 520 + Math.sin(a) * 12, 7, '#ffd23f'); }
      // barras de vida
      const bw = Math.min(AW * 0.4, 360);
      const bar = (x, v, max, nm, col) => {
        X.font = FONT(700, 26); X.textAlign = 'center'; X.fillStyle = '#fff'; X.fillText(nm, x, 182);
        fr(x - bw / 2, 196, bw, 26, 13, 'rgba(0,0,0,.35)');
        fr(x - bw / 2 + 3, 199, Math.max(0, (bw - 6) * v / max), 20, 10, col);
      };
      bar(AX + AW * 0.25, g.hp, 100, HEROI_GALO.n, '#7ed957');
      // barra da esporada
      fr(AX + AW * 0.25 - bw / 2, 230, bw, 12, 6, 'rgba(0,0,0,.35)');
      fr(AX + AW * 0.25 - bw / 2 + 2, 232, Math.max(0, (bw - 4) * g.sp), 8, 4, g.sp >= 1 ? (Math.sin(t * 12) > 0 ? '#ffd23f' : '#fff6c4') : '#ffb02e');
      bar(AX + AW * 0.75, e.hp, e.max, e.n, '#ff6b6b');
      // medidor de força
      const mw = Math.min(AW * 0.7, 520), mx = AX + AW / 2 - mw / 2, my = 290, m = this.meter(g);
      fr(mx, my, mw, 30, 15, 'rgba(0,0,0,.35)');
      fr(mx + mw * 0.07, my + 4, mw * 0.86, 22, 11, LG(mx, 0, mx + mw, 0, '#ff6b6b', '#ffd23f', '#7ed957', '#ffd23f', '#ff6b6b'));
      fr(mx + mw * 0.43, my + 4, mw * 0.14, 22, 6, 'rgba(255,255,255,.55)');
      fr(mx + mw * m - 5, my - 8, 10, 46, 5, '#fff'); RR(mx + mw * m - 5, my - 8, 10, 46, 5); stroke(3, '#3a2428');
      // botões
      const by = 840, bh = 130, half = AW / 2;
      const btn = (x, lab, col, on) => {
        fr(x + 14, by + 8, half - 28, bh, 26, shade(col, -0.3));
        fr(x + 14, by + (on ? 8 : 0), half - 28, bh, 26, col);
        X.font = FONT(700, Math.min(44, (half - 50) / (lab.length * 0.62))); X.textAlign = 'center'; X.fillStyle = '#fff'; X.fillText(lab, x + half / 2, by + bh / 2 + 14 + (on ? 8 : 0));
      };
      if (g.sp >= 1) btn(AX, '⚡ ESPORADA', g.atkCD > 0 ? '#c9a84a' : (Math.sin(t * 10) > 0 ? '#ffc21a' : '#ffb02e'), g.atkCD > 0);
      else btn(AX, g.counter > 0 ? '💥 CONTRA!' : '🐓 BICAR', g.atkCD > 0 ? '#c98a6a' : g.counter > 0 ? '#ff5f9e' : '#ff7a45', g.atkCD > 0);
      btn(AX + half, '🛡️ DEFENDER', g.defCD > 0 ? '#7a8aa8' : '#4d8af7', g.defT > 0);
      if (g.phase === 'intro') {
        pill(AX + AW / 2, 420, Math.min(AW - 40, 520), 70, `Round ${g.lvl + 1}: ${e.n}`, '#c4302b');
      }
      drawParts();
      hud(`🏆 ${g.score}`);
    },
    reward(g) { return g.score * 3 + Math.floor(g.dmg / 100); },
  });

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
  GAMES.push({
    id: 'boxe', n: 'Boxe da Vila', ic: '🥊', col: '#ff8a8a', per: 1,
    help: 'Soque (👊) quando a guarda do rival estiver baixa. Quando aparecer "!", ESQUIVE (⬅ ➡) — no gancho, fuja para o lado contrário da luva! Socar logo depois de esquivar rende ⭐, e as estrelas viram o SUPER SOCO. (Teclado: A/D esquiva, J/K soca, espaço = super)',
    stars: [1, 3, 5],
    start() {
      const L = cast().filter((c) => !hero || c.name !== hero.name);
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
      setTimeout(() => open && Sfx.bell(), 250);
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
      const f = g.f, cx = AX + AW / 2, hy = 420;
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
      const f = g.f, cx = AX + AW / 2;
      if (f.st === 'down') return;
      const dmg = 16 * g.stars + 8; g.stars = 0; g.pT = [0.2, 0.2]; g.pCD = 0.6;
      if (f.st === 'punch') return; // trocou soco: o dele chega antes
      say(cx, 260, 'SUPER SOCO!', '#ffd23f'); flash('#ffd23f', 0.3); hitstop(0.2); vib([50, 30, 100]);
      ring(cx, 380, '#ffd23f', 260); ring(cx, 380, '#fff', 160);
      this.hitFoe(g, dmg, 0, 0, true);
      if (f.st !== 'down') { f.st = 'hurt'; f.timer = 0.9; }
    },
    hitFoe(g, dmg, stop, side, big) {
      const f = g.f, cx = AX + AW / 2, hy = 420;
      f.hp = Math.max(0, f.hp - dmg); g.dmg += dmg; f.hurt = 0.25;
      Sfx.poof(); vib(big ? 0 : 18); if (stop) hitstop(stop);
      shake = big ? 0.5 : 0.12;
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
      const q = Math.floor((x - AX) / (AW / 4));
      if (q <= 0) this.dodgeTo(g, -1); else if (q === 1) this.punch(g, 0); else if (q === 2) this.punch(g, 1); else this.dodgeTo(g, 1);
    },
    key(g, k) {
      if (k === 'a' || k === 'A' || k === 'ArrowLeft') this.dodgeTo(g, -1);
      if (k === 'd' || k === 'D' || k === 'ArrowRight') this.dodgeTo(g, 1);
      if (k === 'j' || k === 'J') this.punch(g, 0);
      if (k === 'k' || k === 'K') this.punch(g, 1);
      if (k === ' ' || k === 'ArrowUp' || k === 'w' || k === 'W') this.superPunch(g);
    },
    starTap(g, x, y) { return g.stars && Math.hypot(x - (AX + AW / 2), y - 840) < 60; },
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
        if (L >= 1 && f.downs < 2 && f.count >= 4) { f.st = 'guard'; f.guard = 'high'; f.gT = 1; f.timer = 0.8; f.hp = f.max * 0.4; f.ko = 0; say(AX + AW / 2, 300, 'Levantou!', '#ff8fbd'); Sfx.bell(); }
        else if (f.count >= (L >= 1 && f.downs < 2 ? 4 : 3)) { g.phase = 'won'; g.timer = 1.6; g.score++; Sfx.ding(); say(AX + AW / 2, 250, 'Vitória!', '#7ed957'); burst(AX + AW / 2, 400, 30, ['#ffd23f', '#ff8fbd', '#7ed957', '#4dabf7'], 650); }
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
          g.lastDodge = 0.85; say(AX + AW / 2 + g.dodge * 120, 520, 'Esquivou!', '#9fd3ff'); vib(15);
          f.missed = true;
        } else {
          const d = (10 + L * 3) * (f.kind === 'upper' ? 1.6 : f.kind === 'gancho' ? 1.2 : 1);
          g.hp = Math.max(0, g.hp - d); g.hurt = 0.35; g.stars = Math.max(0, g.stars - 1);
          shake = 0.4; flash('#ff4d4d', 0.25); vib(90); hitstop(0.08); Sfx.poof(); Sfx.squeak();
          burst(AX + AW / 2, 600, 14, ['#ff6b6b', '#fff'], 450); say(AX + AW / 2, 560, `-${Math.round(d)}`, '#ff6b6b');
          f.missed = false;
          if (g.hp <= 0) { g.phase = 'lost'; g.timer = 1.8; say(AX + AW / 2, 300, 'Nocauteado...', '#ff6b6b'); }
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
      const f = g.f, o = g.o, cx0 = AX + AW / 2;
      // ringue
      sky('#3a2a5c', '#ff9ec4');
      for (let i = 0; i < 40; i++) { const x = srand(i) * VW, y = 420 + srand(i + 7) * 120; fc(x, y, 16 + srand(i + 3) * 8, ['#ffb199', '#ffd23f', '#9fd3ff', '#c5a3ff', '#8fdc7a'][i % 5]); fc(x, y - 4 - Math.abs(Math.sin(t * 4 + i)) * 6, 10, 'rgba(255,255,255,.5)'); }
      X.fillStyle = 'rgba(58,40,80,.35)'; X.fillRect(-20, 400, VW + 40, 200);
      X.globalAlpha = 0.18; fe(cx0, 380, 300, 520, '#fff6d0'); X.globalAlpha = 1;
      fr(-20, 700, VW + 40, 320, 0, '#e8e0f2'); fr(-20, 700, VW + 40, 10, 0, '#cfc2e2');
      const dodX = g.dodT > 0 ? -g.dodge * 150 * Math.sin(Math.min(1, (0.42 - g.dodT) / 0.12) * Math.PI / 2) * Math.min(1, g.dodT / 0.12) : 0;
      // cordas
      ['#ff5d8f', '#ffffff', '#4dabf7'].forEach((c, i) => line(-20, 600 + i * 34, VW + 20, 600 + i * 34, 8, c));
      // rival
      const s = 1.25, by = 420 + 282 * s;
      let ox = dodX * 0.6, oy = 0, rot = 0, sc = 1;
      const bob = Math.sin(t * 5) * 8;
      if (f.st === 'guard') { ox += Math.sin(t * 2.2) * 26; oy += bob; }
      else if (f.st === 'tell') { rot = -f.side * 0.08 + Math.sin(t * 40) * 0.02; oy -= 20; ox += f.side * 30; }
      else if (f.st === 'punch') { sc = 1.08; oy += 20; rot = f.side * 0.1; ox += f.missed ? f.side * 120 : 0; }
      else if (f.st === 'open') { rot = Math.sin(t * 3) * 0.08; oy += 30; }
      else if (f.st === 'hurt') { rot = Math.sin(t * 50) * 0.04; oy -= 10; }
      if (f.hurt > 0) ox += Math.sin(t * 80) * 10;
      X.save(); X.translate(cx0 + ox, by + oy);
      if (f.st === 'down' || g.phase === 'won') { X.translate(0, f.ko * 200); X.rotate(f.ko * 1.2); }
      X.scale(s * sc, s * sc); X.rotate(rot);
      o.reactT = f.st === 'open' || f.st === 'hurt' || f.st === 'down' ? 1 : 0; o.blinkT = f.st === 'open' ? 0.05 : o.blinkT;
      drawChar(o, t, true);
      if (f.hurt > 0) { X.globalAlpha = f.hurt * 2; fe(0, -250, 90, 110, '#ffffff'); X.globalAlpha = 1; }
      // luvas do rival
      const R = 30, red = '#ff4d5e';
      if (f.st === 'guard' && f.guard === 'high') { luva(-34, -232, R, red, -1); luva(34, -232, R, red, 1); }
      else if (f.st === 'guard' || f.st === 'hurt') { luva(-62, -140, R, red, -1); luva(62, -140, R, red, 1); }
      else if (f.st === 'tell') {
        const sh = Math.sin(t * 50) * 3, up = f.kind === 'upper';
        luva(-f.side * 40, -228, R, red, -f.side);
        luva(f.side * (up ? 60 : 110) + sh, up ? -90 : -300, R * 1.1, red, f.side);
      } else if (f.st === 'punch') { luva(-f.side * 40, -228, R, red, -f.side); luva(f.side * 20, -210, R * (f.missed ? 1.4 : 2.4), red, f.side); }
      else { luva(-80, -110, R, red, -1); luva(80, -110, R, red, 1); }
      if (f.st === 'open') for (let i = 0; i < 3; i++) { const a = t * 5 + i * TAU / 3; starPath(Math.cos(a) * 60, -360 + Math.sin(a) * 14, 12, 5); X.fillStyle = '#ffd23f'; X.fill(); }
      X.restore();
      // aviso do golpe
      if (f.st === 'tell') {
        const lab = f.kind === 'gancho' ? (f.side > 0 ? 'Gancho ➡  fuja ⬅' : 'fuja ➡  ⬅ Gancho') : f.kind === 'upper' ? 'Uppercut!' : 'Jab!';
        X.font = FONT(700, 90); X.textAlign = 'center'; X.lineWidth = 9; X.strokeStyle = '#fff'; X.fillStyle = '#ff4d4d';
        const yy = 360 + Math.sin(t * 25) * 5, xx = clamp(cx0 + ox + f.side * 170, AX + 40, AX + AW - 40); X.strokeText('!', xx, yy); X.fillText('!', xx, yy);
        pill(cx0, 585, Math.min(AW - 40, 360), 44, lab, '#c4302b');
      }
      if (f.st === 'down') { X.font = FONT(700, 120); X.textAlign = 'center'; X.fillStyle = '#fff'; X.lineWidth = 10; X.strokeStyle = 'rgba(58,36,40,.6)'; const n = String(Math.min(10, Math.floor(f.count) + 1)); X.strokeText(n, cx0, 420); X.fillText(n, cx0, 420); }
      // luvas do jogador (primeira pessoa)
      const blue = '#4dabf7', gx = dodX * -0.5;
      for (const side of [0, 1]) {
        const k = g.pT[side] > 0 ? Math.sin(Math.PI * (1 - g.pT[side] / 0.2)) : 0;
        const bx = cx0 + (side ? 1 : -1) * AW * 0.24 + gx, byy = 800 + Math.sin(t * 5 + side) * 6;
        const x = lerp(bx, cx0 + (side ? 30 : -30), k), y = lerp(byy, 470, k), r = lerp(70, 42, k);
        luva(x, y, r, g.hurt > 0 ? '#ff8f8f' : blue, side ? -1 : 1);
      }
      if (g.hurt > 0) { X.globalAlpha = g.hurt; X.fillStyle = 'rgba(255,60,60,.35)'; X.fillRect(-20, -20, VW + 40, 1040); X.globalAlpha = 1; }
      // botões
      const bw = AW / 4, by2 = 900, bh = 90;
      [['⬅', '#9fb2ff'], ['👊', '#4dabf7'], ['👊', '#4dabf7'], ['➡', '#9fb2ff']].forEach(([lab, col], i) => {
        const x = AX + i * bw;
        fr(x + 6, by2 + 6, bw - 12, bh, 22, shade(col, -0.3)); fr(x + 6, by2, bw - 12, bh, 22, col);
        X.font = FONT(700, 44); X.textAlign = 'center'; X.fillStyle = '#fff'; X.fillText(lab, x + bw / 2, by2 + 60);
      });
      if (g.stars) {
        const pulse = 1 + Math.sin(t * 8) * 0.06;
        X.save(); X.translate(cx0, 840); X.scale(pulse, pulse);
        fc(0, 0, 56, '#ffb02e'); fc(0, -3, 50, '#ffd23f'); X.font = FONT(700, 22); X.textAlign = 'center'; X.fillStyle = '#7a4a00'; X.fillText('SUPER', 0, 8);
        X.restore();
      }
      // vida e estrelas
      const hb = Math.min(AW * 0.42, 360);
      const bar = (x, v, max, nm, col) => {
        X.font = FONT(700, 26); X.textAlign = 'center'; X.fillStyle = '#fff'; X.fillText(nm, x, 152);
        fr(x - hb / 2, 166, hb, 24, 12, 'rgba(0,0,0,.35)'); fr(x - hb / 2 + 3, 169, Math.max(0, (hb - 6) * v / max), 18, 9, col);
      };
      bar(AX + AW * 0.25, g.hp, 100, hero ? hero.name : 'Você', '#7ed957');
      bar(AX + AW * 0.75, f.hp, f.max, g.foeName, '#ff6b6b');
      for (let i = 0; i < 3; i++) { starPath(AX + AW * 0.25 - 40 + i * 40, 214, 15, 6); X.fillStyle = i < g.stars ? '#ffd23f' : 'rgba(255,255,255,.35)'; X.fill(); }
      if (g.phase === 'intro') pill(cx0, 470, Math.min(AW - 40, 520), 70, `Luta ${g.n + 1}: ${g.foeName}`, '#c4302b');
      drawParts();
      hud(`🏆 ${g.score}`);
    },
    reward(g) { return g.score * 4 + Math.floor(g.dmg / 100); },
  });

  // ---------- 9. Descida na Neve ----------
  // Snowboard sem fim: toque para pular, segure no ar para dar mortal e
  // aterrisse reto. Pule pedras e buracos e deslize nos varais de bandeirinha.
  const NEVE_SKY = [['#8fd8ff', '#e8f8ff'], ['#ff9a6b', '#ffd6a5'], ['#2b2466', '#7a5cc4'], ['#ffb3c7', '#fff1d6']];
  GAMES.push({
    id: 'neve', n: 'Descida na Neve', ic: '🏂', col: '#bfe6ff', per: 100,
    help: 'Toque para pular. SEGURE no ar para dar um mortal e solte para aterrissar de pé! Mortais dão pontos e velocidade. Pule pedras e buracos e deslize nos varais. (Teclado: espaço)',
    stars: [800, 2500, 6000],
    T(g, x) { return x * 0.32 + 110 * Math.sin(x / 300 + g.p[0]) + 45 * Math.sin(x / 110 + g.p[1]) + 18 * Math.sin(x / 47 + g.p[2]); },
    slope(g, x) { return Math.atan2(this.T(g, x + 4) - this.T(g, x - 4), 8); },
    gapAt(g, x) { return g.gaps.find((q) => x > q.a && x < q.b); },
    start() {
      const g = { p: [rand(0, 6), rand(0, 6), rand(0, 6)], x: 0, y: 0, v: 450, vx: 0, vy: 0, st: 'ground', rot: 0, spin: 0, camX: 0, camY: 0,
        gaps: [], rocks: [], ropes: [], coins: [], nextGap: 2400, nextRock: 900, nextRope: 1600, nextCoin: 700,
        dist: 0, pts: 0, score: 0, got: 0, chain: 0, chainT: 0, boost: 0, dead: 0, rope: null, lastSnow: 0 };
      g.y = this.T(g, 0); g.camY = g.y; g.rot = this.slope(g, 0);
      return g;
    },
    spawn(g) {
      const far = g.x + 2600;
      const free = (a, b) => !g.gaps.some((q) => b > q.a - 150 && a < q.b + 150) && !g.rocks.some((r) => r.x > a - 150 && r.x < b + 150);
      while (g.nextGap < far) { const w = 200 + Math.min(220, g.dist / 250); g.gaps.push({ a: g.nextGap, b: g.nextGap + w }); g.nextGap += w + rand(1700, 3200); }
      while (g.nextRock < far) { if (free(g.nextRock - 40, g.nextRock + 40)) g.rocks.push({ x: g.nextRock, s: rand(0.8, 1.25) }); g.nextRock += rand(650, 1500); }
      while (g.nextRope < far) {
        const a = g.nextRope, b = a + rand(380, 620);
        if (free(a, b)) g.ropes.push({ a, b, ya: this.T(g, a) - 175, yb: this.T(g, b) - 160 });
        g.nextRope += rand(1600, 2800);
      }
      while (g.nextCoin < far) {
        const x0 = g.nextCoin;
        if (!this.gapAt(g, x0) && !this.gapAt(g, x0 + 420)) for (let i = 0; i < 6; i++) { const x = x0 + i * 70; g.coins.push({ x, y: this.T(g, x) - 90 - Math.sin(i / 5 * Math.PI) * 90 }); }
        g.nextCoin += rand(700, 1400);
      }
      const old = g.x - 800;
      g.gaps = g.gaps.filter((q) => q.b > old); g.rocks = g.rocks.filter((r) => r.x > old); g.ropes = g.ropes.filter((r) => r.b > old); g.coins = g.coins.filter((c) => !c.got && c.x > old);
    },
    jump(g) {
      if (g.dead) return;
      if (g.st === 'ground') {
        const a = this.slope(g, g.x);
        g.vx = g.v * Math.cos(a); g.vy = g.v * Math.sin(a) - 980; g.st = 'air'; g.spin = 0; Sfx.whoosh();
        burst(this.sx(g, g.x), g.y - g.camY + 520, 6, ['#ffffff', '#dff1ff'], 220);
      } else if (g.st === 'rope') {
        g.st = 'air'; g.vy = -760; g.spin = 0; g.rope = null; Sfx.whoosh();
      }
    },
    tap(g) { this.jump(g); },
    key(g, k) { if (k === ' ' || k === 'ArrowUp' || k === 'w' || k === 'W') this.jump(g); },
    sx(g, x) { return Math.min(VW * 0.3, AX + AW * 0.3 + 200) + (x - g.camX); },
    trick(g, pts, label) {
      g.chain++; g.chainT = 2;
      const p = pts * g.chain; g.pts += p;
      say(this.sx(g, g.x), g.y - g.camY + 380, `${label} +${p}${g.chain > 1 ? ` (x${g.chain})` : ''}`, '#ffd23f');
    },
    crash(g, why) {
      if (g.dead) return;
      g.dead = 0.001; g.st = 'crash'; shake = 0.45; flash('#ffffff', 0.25); hitstop(0.12); vib(120); Sfx.poof(); Sfx.squeak();
      burst(this.sx(g, g.x), g.y - g.camY + 480, 22, ['#ffffff', '#dff1ff', '#ff8fbd'], 520); say(this.sx(g, g.x), g.y - g.camY + 360, why, '#ff6b6b');
    },
    update(g, dt) {
      const hold = (ptr && ptr.down) || keys.sp;
      g.chainT -= dt; if (g.chainT <= 0 && g.st === 'ground') g.chain = 0;
      g.boost -= dt;
      if (g.dead) {
        g.dead += dt; g.vy += 2200 * dt; g.x += g.vx * 0.4 * dt; g.y = Math.min(g.y + g.vy * dt, this.gapAt(g, g.x) ? g.y + g.vy * dt : this.T(g, g.x)); g.rot += dt * 9;
        if (g.dead > 1.3) return end();
      } else if (g.st === 'ground') {
        const a = this.slope(g, g.x);
        g.v = clamp(g.v + (1500 * Math.sin(a) - 110) * dt + (g.boost > 0 ? 500 * dt : 0), 360, g.boost > 0 ? 1650 : 1350);
        g.x += g.v * Math.cos(a) * dt;
        g.rot = lerp(g.rot, a, Math.min(1, dt * 14));
        if (this.gapAt(g, g.x)) { g.st = 'air'; g.vx = g.v * Math.cos(a); g.vy = g.v * Math.sin(a); g.spin = 0; }
        else g.y = this.T(g, g.x);
        g.lastSnow -= dt; if (g.lastSnow <= 0) { g.lastSnow = 0.05; parts.push({ x: this.sx(g, g.x) - 30, y: g.y - g.camY + 520, vx: -g.v * 0.25 + rand(-40, 40), vy: rand(-160, -40), life: 0.5, max: 0.5, r: rand(3, 7), col: '#ffffff', kind: 'dot', sh: 0, rot: 0, vr: 0 }); }
        for (const r of g.rocks) if (!r.hit && Math.abs(r.x - g.x) < 34 * r.s) { r.hit = true; this.crash(g, 'Pedra!'); }
      } else if (g.st === 'rope') {
        const r = g.rope, k = (r.yb - r.ya) / (r.b - r.a), a = Math.atan(k);
        g.v = clamp(g.v + 600 * Math.sin(a) * dt, 420, 1400);
        g.x += g.v * Math.cos(a) * dt; g.y = r.ya + (g.x - r.a) * k; g.rot = a;
        g.pts += Math.round(120 * dt * Math.max(1, g.chain)); g.chainT = 2;
        if (Math.random() < dt * 25) burst(this.sx(g, g.x), g.y - g.camY + 520, 1, ['#ffd23f', '#fff'], 180);
        if (g.x >= r.b) { g.st = 'air'; g.vx = g.v * Math.cos(a); g.vy = -380; g.spin = 0; g.rope = null; this.trick(g, 50, 'Varal!'); }
      } else {
        // no ar
        const py = g.y;
        g.vy += 2200 * dt; g.x += g.vx * dt; g.y += g.vy * dt;
        g.holdT = hold ? (g.holdT || 0) + dt : 0;
        if (g.holdT > 0.15) { const d = 7.5 * dt; g.rot -= d; g.spin += d; }
        else if (!hold) {
          // sem segurar, a prancha vai se alinhando com a ladeira de baixo
          let df = ((this.slope(g, g.x) - g.rot) % TAU + TAU) % TAU; if (df > Math.PI) df -= TAU;
          g.rot += df * Math.min(1, dt * 4);
        }
        for (const r of g.ropes) {
          if (g.vy > 0 && g.x > r.a && g.x < r.b) {
            const ry = r.ya + (g.x - r.a) * (r.yb - r.ya) / (r.b - r.a);
            if (py <= ry + 2 && g.y >= ry) { g.st = 'rope'; g.rope = r; g.y = ry; g.v = Math.max(g.v, Math.hypot(g.vx, g.vy) * 0.8); this.landTricks(g); Sfx.ding(); vib(15); break; }
          }
        }
        if (g.st === 'air') {
          for (const r of g.rocks) if (!r.hit && Math.abs(r.x - g.x) < 26 * r.s && g.y > this.T(g, r.x) - 34 * r.s) { r.hit = true; this.crash(g, 'Pedra!'); }
          const gap = this.gapAt(g, g.x);
          if (gap && g.y > this.T(g, g.x) + 300) this.crash(g, 'Caiu no buraco!');
          else if (!gap && !g.dead && g.vy > 0 && g.y >= this.T(g, g.x)) {
            const a = this.slope(g, g.x);
            let diff = ((g.rot - a) % TAU + TAU) % TAU; if (diff > Math.PI) diff -= TAU;
            g.y = this.T(g, g.x);
            if (Math.abs(diff) > 0.75) this.crash(g, 'Tombo!');
            else {
              g.st = 'ground'; g.rot = a; g.v = clamp(g.vx * Math.cos(a) + g.vy * Math.sin(a), 360, 1650);
              burst(this.sx(g, g.x), g.y - g.camY + 520, 8, ['#ffffff', '#dff1ff'], 260);
              if (Math.abs(diff) < 0.2 && g.spin > 1) say(this.sx(g, g.x), g.y - g.camY + 330, 'Aterrissagem perfeita!', '#9fd3ff');
              this.landTricks(g);
            }
          }
        }
      }
      // moedas
      for (const c of g.coins) if (!c.got && Math.abs(c.x - g.x) < 50 && Math.abs(c.y - (g.y - 60)) < 80) { c.got = true; g.got++; Sfx.coin(); burst(this.sx(g, c.x), c.y - g.camY + 520, 5, ['#ffd23f', '#fff1a8'], 200); }
      // câmera
      g.camX = g.x; g.camY = lerp(g.camY, g.y, Math.min(1, dt * 5));
      g.dist = Math.max(g.dist, g.x);
      g.score = Math.floor(g.dist / 10) + g.pts;
      this.spawn(g);
    },
    landTricks(g) {
      const flips = Math.floor((g.spin + 0.75) / TAU);
      if (flips > 0) {
        this.trick(g, 100 * flips * flips, flips === 1 ? 'Mortal!' : flips === 2 ? 'Mortal duplo!' : `Mortal x${flips}!`);
        g.boost = 1.2 + flips * 0.4; g.v = Math.min(1650, g.v + 220 * flips); Sfx.sparkle(); vib(25 * flips);
        ring(this.sx(g, g.x), g.y - g.camY + 470, '#ffd23f', 120 + flips * 40); if (flips > 1) flash('#fff6c4', 0.2);
      }
      g.spin = 0;
    },
    draw(g) {
      // céu muda com a distância: dia → pôr do sol → noite → amanhecer
      const ph = (g.dist / 9000) % NEVE_SKY.length, i0 = Math.floor(ph), k = ph - i0, n1 = NEVE_SKY[i0], n2 = NEVE_SKY[(i0 + 1) % NEVE_SKY.length];
      sky(lerpCol(n1[0], n2[0], k), lerpCol(n1[1], n2[1], k));
      const night = i0 === 2 ? 1 - Math.max(0, k - 0.7) / 0.3 : i0 === 1 ? Math.max(0, k - 0.6) / 0.4 : 0;
      if (night > 0) { X.globalAlpha = night; for (let i = 0; i < 40; i++) fc(srand(i) * VW, srand(i + 4) * 500, 1.5 + srand(i + 8) * 2, '#fff6d0'); X.globalAlpha = 1; }
      fc(VW * 0.75, 200, 60, night > 0.5 ? '#fff6d0' : 'rgba(255,243,176,.9)');
      // montanhas ao fundo (parallax)
      const layers = [[0.15, 380, 160, '#c9d8f0', 0], [0.3, 470, 120, '#a9bde0', 3], [0.5, 560, 90, '#8fa6d1', 7]];
      for (const [pf, base, amp, col, sd] of layers) {
        X.beginPath(); X.moveTo(-20, 1020);
        for (let x = -20; x <= VW + 40; x += 30) { const wx = (x + g.camX * pf) / 160 + sd; X.lineTo(x, base + Math.sin(wx) * amp * 0.5 + Math.sin(wx * 2.3 + sd) * amp * 0.3 - Math.abs(Math.sin(wx * 0.7)) * amp * 0.6); }
        X.lineTo(VW + 40, 1020); X.closePath(); X.fillStyle = night > 0.5 ? shade(col, -0.55) : col; X.fill();
      }
      // pinheiros
      for (let i = -1; i < VW / 140 + 2; i++) {
        const id = Math.floor(g.camX * 0.7 / 140) + i, x = id * 140 - g.camX * 0.7 + srand(id) * 60, h = 70 + srand(id + 3) * 60, y = 640 + srand(id + 5) * 40;
        fpoly([x, y - h, x - h * 0.35, y, x + h * 0.35, y], night > 0.5 ? '#24463a' : '#4f8a6a');
      }
      const oy = 520 - g.camY, ox = (wx) => this.sx(g, wx);
      // varais de bandeirinhas
      for (const r of g.ropes) {
        const x1 = ox(r.a), x2 = ox(r.b);
        line(x1, this.T(g, r.a) + oy, x1, r.ya + oy, 6, '#a0754d'); line(x2, this.T(g, r.b) + oy, x2, r.yb + oy, 6, '#a0754d');
        line(x1, r.ya + oy, x2, r.yb + oy, 3, '#5b6474');
        const n = Math.floor((r.b - r.a) / 40);
        for (let j = 0; j < n; j++) { const u = (j + 0.5) / n, x = lerp(x1, x2, u), y = lerp(r.ya, r.yb, u) + oy; fpoly([x - 12, y, x + 12, y, x, y + 22], ['#ff6b6b', '#ffd23f', '#4dabf7', '#7ed957', '#ff7eb6'][j % 5]); }
      }
      // chão de neve (com buracos)
      X.beginPath(); let open2 = false;
      const flush = (xe) => { X.lineTo(xe, 1100); X.closePath(); open2 = false; };
      for (let x = -20; x <= VW + 40; x += 12) {
        const wx = g.camX + x - this.sx(g, g.camX), y = this.T(g, wx) + oy, inGap = this.gapAt(g, wx);
        if (inGap) { if (open2) flush(x - 12); continue; }
        if (!open2) { X.moveTo(x, 1100); X.lineTo(x, y); open2 = true; } else X.lineTo(x, y);
      }
      if (open2) flush(VW + 40);
      X.fillStyle = LG(0, 300, 0, 1000, '#ffffff', '#dfeaf8'); X.fill(); stroke(4, 'rgba(140,170,210,.6)');
      // pedras
      for (const r of g.rocks) { const x = ox(r.x), y = this.T(g, r.x) + oy; fe(x, y - 14 * r.s, 38 * r.s, 30 * r.s, '#7a8394'); fe(x - 8 * r.s, y - 26 * r.s, 18 * r.s, 10 * r.s, '#ffffff'); }
      for (const c of g.coins) if (!c.got) coinArt(ox(c.x), c.y + oy, 18, t + c.x * 0.01);
      // personagem na prancha (gira em torno do meio do corpo)
      const px = ox(g.x), py = g.y + oy;
      if (g.boost > 0 && !g.dead) for (let j = 1; j < 6; j++) { X.globalAlpha = 0.12 * (6 - j); fc(px - j * 26, py - 50, 34 - j * 4, '#ffd23f'); } X.globalAlpha = 1;
      X.save(); X.translate(px, py - 45); X.rotate(g.rot); X.translate(0, 45);
      fr(-58, -6, 116, 12, 6, '#ff5d8f'); fr(-58, -6, 116, 4, 3, 'rgba(255,255,255,.5)');
      drawHero(0, -4, 0.24, { joy: g.st === 'air' && !g.dead });
      X.restore();
      drawParts();
      hud(String(g.score), `$ ${g.got}`);
      if (g.chain > 1) pill(VW / 2, 178, 110, 40, `x${g.chain}`, '#ff5f9e');
      if (g.dist < 600 && !g.dead) pill(VW / 2, 300, Math.min(AW - 40, 520), 48, 'Toque = pular · Segure no ar = mortal', '#4d6fb3');
    },
    reward(g) { return g.got + Math.floor(g.score / this.per); },
  });

  // ---------- HUD ----------
  function hud(main, sub, lives) {
    if (main !== hudLast) { if (hudLast) hudPop = 0.22; hudLast = main; }
    const k = 1 + Math.max(0, hudPop) * 1.3;
    X.save(); X.translate(VW / 2, 60); X.scale(k, k); X.translate(-VW / 2, -60);
    pill(VW / 2, 60, Math.max(140, main.length * 26 + 60), 64, main);
    X.restore();
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
    cur = gm; G_ = gm.start(); parts = []; mode = 'ready'; hudLast = ''; hitT = 0; flashT = 0;
    Horror.onMiniStart();
    $('#miniMenu').classList.add('hidden'); $('#miniOver').classList.add('hidden');
  }
  function begin() { mode = 'play'; Sfx.sparkle(); }
  function end() {
    if (mode !== 'play') return;
    mode = 'over';
    const sc = G_.score, earned = cur.reward(G_), best = data.best[cur.id] || 0, rec = sc > best;
    if (rec) data.best[cur.id] = sc;
    data.coins += earned; save();
    const nSt = (cur.stars || []).filter((v) => sc >= v).length;
    $('#miniOverT').textContent = (cur.stars ? '⭐'.repeat(nSt) + '☆'.repeat(3 - nSt) + '  ' : '') + (rec && sc > 0 ? 'Novo recorde! 🏆' : 'Fim de jogo!');
    if (nSt === 3) { burst(VW / 2, 300, 30, ['#ffd23f', '#ff8fbd', '#7ed957', '#4dabf7'], 600); vib(60); }
    $('#miniOverS').textContent = String(sc);
    $('#miniOverP').textContent = `Recorde: ${data.best[cur.id] || 0} · Moedas ganhas: +${earned}`;
    $('#miniCoins').textContent = data.coins;
    setTimeout(() => { if (mode === 'over') $('#miniOver').classList.remove('hidden'); }, 350);
    rec && sc > 0 ? Sfx.sticker() : Sfx.drop(0.5);
    Album.unlock('a_fliperama');
    Horror.onMiniEnd();
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
    hudPop -= dt;
    const rev = Horror.revealing;
    if (mode === 'play' && !rev) { if (hitT > 0) hitT -= dt; else cur.update(G_, dt); stepParts(dt); }
    else if (mode === 'over') stepParts(dt);
    if (shake > 0) shake -= dt;
    const X0 = X; X = ctx;
    try {
      X.setTransform(DPR * SC, 0, 0, DPR * SC, 0, 0);
      if (shake > 0) X.translate(rand(-8, 8), rand(-8, 8));
      if (cur) {
        cur.draw(G_);
        if (flashT > 0) { flashT -= dt; X.globalAlpha = Math.max(0, flashT / flashMax) * 0.45; X.fillStyle = flashC; X.fillRect(-20, -20, VW + 40, 1040); X.globalAlpha = 1; }
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
    if (Horror.miniOverlay(ctx, cv, dt, mode === 'play') && !open) return;
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
    if (k === ' ' || k === 'ArrowUp' || k === 'w' || k === 'W') keys.sp = down;
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
  function close() { open = false; cancelAnimationFrame(raf); el.classList.add('hidden'); mode = 'menu'; cur = null; G_ = null; keys.l = keys.r = keys.sp = false; }

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
