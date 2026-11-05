'use strict';
// ======================================================
//  Clima, estações do ano e festas do calendário
// ======================================================
const Weather = (() => {
  const KEY = 'vilaDoce.wx';
  const cfg = { mode: 'auto', season: 'auto', fest: 'auto', clock: false };
  try { Object.assign(cfg, JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) { /* sem armazenamento */ }
  let cur = 'sol', timer = 40, rainbowT = 0, wetK = 0, frostK = 0, snowK = 0;
  let drops = [], flakes = [], leaves = [], booms = [], boomT = 2;

  // ---------- calendário ----------
  function easter(y) {
    const a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
    const mo = Math.floor((h + l - 7 * m + 114) / 31), da = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(y, mo - 1, da);
  }
  function season() {
    if (cfg.season !== 'auto') return cfg.season;
    const m = new Date().getMonth();
    return m === 11 || m <= 1 ? 'verao' : m <= 4 ? 'outono' : m <= 7 ? 'inverno' : 'primavera';
  }
  function festival() {
    if (cfg.fest !== 'auto') return cfg.fest === 'none' ? null : cfg.fest;
    const d = new Date(), m = d.getMonth() + 1, day = d.getDate();
    if (m === 9 && day >= 13 && day <= 20) return 'farroupilha';
    if (m === 6) return 'junina';
    if ((m === 12 && day === 31) || (m === 1 && day === 1)) return 'anonovo';
    if (m === 12 && day <= 26) return 'natal';
    const e = easter(d.getFullYear()), diff = (d - e) / 86400000;
    if (diff > -7 && diff < 2) return 'pascoa';
    return null;
  }
  function kind() { return cfg.mode === 'auto' ? cur : cfg.mode; }
  function outdoor() { const sc = S(); return !!sc.outdoor; }
  function visibleKind() {
    const k = kind();
    if (rainbowT > 0 && outdoor()) return 'arcoiris';
    if (k === 'sol') return null;
    if ((k === 'geada' || k === 'neve') && !outdoor()) return null;
    return k;
  }
  function pickWeather() {
    const s = season(), f = festival();
    const table = { verao: [['sol', 0.72], ['chuva', 0.28]], outono: [['sol', 0.55], ['chuva', 0.45]], inverno: [['sol', 0.35], ['chuva', 0.25], ['geada', 0.32], ['neve', 0.08]], primavera: [['sol', 0.62], ['chuva', 0.38]] }[s];
    if (f === 'natal' && Math.random() < 0.5) return 'neve';
    let r = Math.random();
    for (const [k, p] of table) { if ((r -= p) <= 0) return k; }
    return 'sol';
  }

  // ---------- atualização ----------
  let lastNight = null;
  function update(dt) {
    if (cfg.clock) {
      const h = new Date().getHours();
      G.night = h < 6 || h >= 18;
      if (G.night !== lastNight) { lastNight = G.night; UI.syncNight(); }
    }
    if (cfg.mode === 'auto') {
      timer -= dt;
      if (timer <= 0) { const prev = cur; cur = pickWeather(); timer = rand(70, 160); if (prev === 'chuva' && cur !== 'chuva') rainbowT = 45; }
    }
    rainbowT = Math.max(0, rainbowT - dt);
    const k = kind();
    wetK = lerp(wetK, k === 'chuva' ? 1 : 0, Math.min(1, dt * 0.8));
    frostK = lerp(frostK, k === 'geada' ? 1 : 0, Math.min(1, dt * 0.6));
    snowK = lerp(snowK, k === 'neve' ? 1 : 0, Math.min(1, dt * 0.5));
    const out = outdoor() && !S().underwater;
    Sfx.rain(wetK * (out ? 1 : 0.35) * (S().underwater ? 0 : 1));
    // partículas em espaço de tela
    const w = CSSW, h = CSSH;
    if (out && wetK > 0.05) for (let i = 0; i < w * dt * 0.9 * wetK; i++) drops.push({ x: rand(-40, w), y: rand(-60, 0), v: rand(900, 1300) });
    if (out && snowK > 0.05) for (let i = 0; i < w * dt * 0.08 * snowK; i++) flakes.push({ x: rand(0, w), y: -10, v: rand(40, 90), ph: rand(0, 6), s: rand(2, 5) });
    const s = season();
    if (out && (s === 'outono' || s === 'primavera') && Math.random() < dt * 1.5) leaves.push({ x: rand(0, w), y: -10, v: rand(40, 70), ph: rand(0, 6), r: rand(0, 6), c: s === 'outono' ? pick(['#ff9f43', '#e2553e', '#ffd23f']) : pick(['#ffb3cf', '#ffffff', '#ffd6e5']) });
    drops = drops.filter((d) => (d.y += d.v * dt, d.x += d.v * 0.15 * dt, d.y < h));
    flakes = flakes.filter((f) => (f.y += f.v * dt, f.x += Math.sin(G.t + f.ph) * 20 * dt, f.y < h));
    leaves = leaves.filter((l) => (l.y += l.v * dt, l.x += Math.sin(G.t * 1.5 + l.ph) * 40 * dt, l.r += dt * 2, l.y < h));
    if (drops.length > 900) drops.splice(0, drops.length - 900);
    // fumacinha de frio
    if (out && (frostK > 0.5 || snowK > 0.5)) for (const e of G.ents) if (e.kind === 'char' && e.scene === G.sceneId && Math.random() < dt * 0.6 && e.state !== 'held') { const hp = headPos(e); emit('smoke', hp.x + 10, hp.y + 40, 1); }
    // fogos de ano novo
    const f = festival();
    if (f === 'anonovo' && G.night && out) {
      boomT -= dt;
      if (boomT <= 0) { boomT = rand(0.8, 2); const bx = rand(w * 0.15, w * 0.85), by = rand(h * 0.1, h * 0.35), c = pick(['#ff6b6b', '#ffd23f', '#4dabf7', '#7ed957', '#ff7eb6']); for (let i = 0; i < 40; i++) { const a = (i / 40) * TAU; booms.push({ x: bx, y: by, vx: Math.cos(a) * rand(80, 160), vy: Math.sin(a) * rand(80, 160), l: 1.4, c }); } Sfx.firework(); }
    }
    booms = booms.filter((b) => (b.x += b.vx * dt, b.y += b.vy * dt, b.vy += 60 * dt, b.l -= dt, b.l > 0));
    // figurinhas
    if (out && rainbowT > 0) Album.unlock('a_arcoiris');
    if (out && frostK > 0.6) Album.unlock('a_geada');
    if (out && snowK > 0.6) Album.unlock('a_neve');
    if (f) Album.unlock('a_festa');
    // ovos de páscoa escondidos
    if (f === 'pascoa') {
      const st = G.st[G.sceneId], today = new Date().toDateString();
      if (st._eggs !== today) { st._eggs = today; const sc = S(); for (let i = 0; i < 2; i++) { const x = rand(200, sc.W - 200); const it = addEnt(I('chocoegg', x, rand(sc.floorTop + 20, sc.floorBot), { scene: sc.id })); settle(it); } }
    }
  }

  // ---------- desenho ----------
  function bunting(sc, cols, lights) {
    const y0 = 34;
    X.beginPath();
    for (let x = -300; x <= sc.W + 300; x += 20) { const u = ((x + 300) % 420) / 420; const y = y0 + Math.sin(u * Math.PI) * 26; x === -300 ? X.moveTo(x, y) : X.lineTo(x, y); }
    stroke(2, 'rgba(90,90,110,.6)');
    let i = 0;
    for (let x = -280; x <= sc.W + 300; x += 60, i++) {
      const u = ((x + 300) % 420) / 420, y = y0 + Math.sin(u * Math.PI) * 26, c = cols[i % cols.length];
      if (lights) { const on = Math.sin(G.t * 3 + i) > -0.3; fc(x, y + 10, 9, on ? c : shade(c, -0.4)); if (on) { X.fillStyle = RG(x, y + 10, 2, 30, alpha(c, 0.5), alpha(c, 0)); X.fillRect(x - 30, y - 20, 60, 60); } }
      else fpoly([x - 22, y, x + 22, y, x, y + 42], c);
    }
  }
  function xmasTree(x, y) {
    softShadow(x, y, 80);
    fr(x - 12, y - 40, 24, 40, 4, '#8a5532');
    [[0, 150, 70], [40, 120, 58], [80, 92, 44]].forEach(([dy, w2, h2], k) => fpoly([x - w2 / 1.6, y - 30 - dy, x, y - 30 - dy - h2 * 1.6, x + w2 / 1.6, y - 30 - dy], k % 2 ? '#2f9e44' : '#3fae49'));
    for (let i = 0; i < 9; i++) fc(x + Math.sin(i * 2.3) * 50 * (1 - i / 12), y - 60 - i * 18, 6, ['#ff6b6b', '#ffd23f', '#4dabf7'][i % 3]);
    starPath(x, y - 250, 18); X.fillStyle = '#ffd23f'; X.fill();
  }
  // depois do fundo (céu): arco-íris e enfeites de festa
  function drawBack(sc) {
    if (sc.outdoor && rainbowT > 0) {
      const a = Math.min(1, rainbowT / 4) * Math.min(1, (45 - rainbowT) / 4) * 0.45, cx = sc.W * 0.55;
      ['#ff4d4d', '#ff9f43', '#ffd23f', '#7ed957', '#4dabf7', '#5c7cfa', '#a77bf3'].forEach((c, i) => { X.beginPath(); X.arc(cx, 900, 820 - i * 22, Math.PI, 0); stroke(22, alpha(c, a)); });
    }
    if (sc.underwater) return;
    const f = festival();
    if (f === 'farroupilha') bunting(sc, ['#2f9e44', '#e03131', '#ffd43b']);
    else if (f === 'junina') bunting(sc, ['#ff6b6b', '#ffd23f', '#4dabf7', '#7ed957', '#ff7eb6', '#a77bf3']);
    else if (f === 'natal') { bunting(sc, ['#ff4d4d', '#7ed957', '#ffd23f', '#4dabf7'], true); if (sc.id === 'casa') xmasTree(1520, 800); if (sc.id === 'parque') xmasTree(1150, 800); }
    else if (f === 'pascoa') bunting(sc, ['#ffd6e5', '#d6c4fb', '#c7eefb', '#fff3c4', '#d6efc4']);
    else if (f === 'anonovo') bunting(sc, ['#ffd23f', '#e6ebf0', '#ffcf3d', '#ffffff'], true);
  }
  // sobre as entidades: geada e neve no chão
  function drawFront(sc) {
    if (!sc.outdoor || sc.underwater) return;
    const camX = G.cam[sc.id];
    if (frostK > 0.02) {
      X.fillStyle = `rgba(235,245,255,${0.5 * frostK})`; X.fillRect(camX - 50, 790, VW + 100, 600);
      for (let i = 0; i < 60; i++) { const x = camX + srand(i + 900) * VW, y = 800 + srand(i + 950) * 200; X.globalAlpha = frostK * (0.5 + 0.5 * Math.sin(G.t * 3 + i)); starPath(x, y, 4, 4, 0.3); X.fillStyle = '#ffffff'; X.fill(); }
      X.globalAlpha = 1;
    }
    if (snowK > 0.02) {
      X.fillStyle = `rgba(250,252,255,${0.75 * snowK})`; X.fillRect(camX - 50, 800, VW + 100, 600);
      X.beginPath(); X.moveTo(camX - 50, 805);
      for (let x = camX - 50; x < camX + VW + 50; x += 40) X.quadraticCurveTo(x + 20, 790 + Math.sin(x * 0.05) * 6, x + 40, 805);
      X.lineTo(camX + VW + 50, 820); X.lineTo(camX - 50, 820); X.closePath(); X.fillStyle = `rgba(255,255,255,${snowK})`; X.fill();
    }
  }
  // em espaço de tela, depois da noite
  function drawScreen(sc) {
    const out = sc.outdoor && !sc.underwater;
    if (wetK > 0.02) {
      X.fillStyle = `rgba(60,70,100,${(out ? 0.22 : 0.08) * wetK})`; X.fillRect(0, 0, CSSW, CSSH);
      if (out) { X.strokeStyle = 'rgba(200,225,255,.55)'; X.lineWidth = 1.5; X.beginPath(); for (const d of drops) { X.moveTo(d.x, d.y); X.lineTo(d.x + 4, d.y + 22); } X.stroke(); }
    }
    if (out) {
      for (const f of flakes) fc(f.x, f.y, f.s, 'rgba(255,255,255,.9)');
      for (const l of leaves) { X.save(); X.translate(l.x, l.y); X.rotate(l.r); fe(0, 0, 7, 4, l.c); X.restore(); }
    }
    for (const b of booms) { X.globalAlpha = Math.min(1, b.l); fc(b.x, b.y, 3, b.c); }
    X.globalAlpha = 1;
  }

  // ---------- opções ----------
  function setCfg(k, v) { cfg[k] = v; if (k === 'mode' && v !== 'auto') cur = v; try { localStorage.setItem(KEY, JSON.stringify(cfg)); } catch (e) { /* sem armazenamento */ } }
  return { update, drawBack, drawFront, drawScreen, festival, season, visibleKind, kind, cfg, setCfg };
})();

ITEMS.chocoegg = { n: 'Ovo de chocolate', w: 64, h: 76, food: 3, draw() {
  fe(0, -36, 28, 36, LG(-20, -70, 20, 0, '#a0662f', '#7a4b2a'));
  X.save(); X.beginPath(); X.ellipse(0, -36, 28, 36, 0, 0, TAU); X.clip();
  fr(-30, -44, 60, 12, 0, '#ff7eb6'); for (let i = 0; i < 4; i++) fc(-18 + i * 12, -38, 3, '#ffd23f');
  X.restore();
  fe(-9, -52, 6, 10, 'rgba(255,255,255,.3)', -0.3);
} };
