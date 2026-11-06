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

  // ======================================================
  //  Kit para os jogos (cada jogo fica em js/minigames/<nome>.js e chama
  //  Mini.addGame((K) => ({ id, n, ic, col, help, start, update, draw, ... })))
  // ======================================================
  const K = {
    get AW() { return AW; },
    get AX() { return AX; },
    FONT,
    get VW() { return VW; },
    bombArt,
    burst,
    cast,
    cloudArt,
    coinArt,
    drawHero,
    drawParts,
    end,
    flash,
    heart,
    get hero() { return hero; },
    hitstop,
    hud,
    itemArt,
    keys,
    lerpCol,
    get open() { return open; },
    get parts() { return parts; },
    pill,
    get ptr() { return ptr; },
    ring,
    say,
    get shake() { return shake; }, set shake(v) { shake = v; },
    sideShade,
    sky,
    starPath,
    get t() { return t; },
    vib,
  };
  function addGame(factory) { GAMES.push(factory(K)); if (open) buildMenu(); }

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
  return { init, show, close, addGame, isOpen: () => open, covering: () => open, data };
})();
