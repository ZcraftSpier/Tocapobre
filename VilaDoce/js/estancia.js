'use strict';
// ======================================================
//  ESTÂNCIA GAÚCHA: galpão, bichos, lavoura e trator
// ======================================================
const CROPS = {
  milho: { n: 'Milho', col: '#ffd23f' },
  trigo: { n: 'Trigo', col: '#e8b04a' },
  soja: { n: 'Soja', col: '#9bc53d' },
  morango: { n: 'Morango', col: '#e8283f' },
};
const STAGE_MS = 25000;

Object.assign(ITEMS, {
  semente: { n: 'Semente', w: 60, h: 70, draw(it) {
    const c = CROPS[it.crop || 'milho'];
    fpoly([-24, -60, 24, -60, 28, 0, -28, 0], '#d9c29a'); fpoly([-24, -60, -14, -70, 14, -70, 24, -60], '#c4a874');
    fc(0, -32, 14, c.col);
    X.font = '600 11px Fredoka, sans-serif'; X.textAlign = 'center'; X.fillStyle = '#5a3824'; X.fillText(c.n, 0, -8);
  } },
  regador: { n: 'Regador', w: 100, h: 70, draw() {
    fr(-30, -56, 56, 56, 10, '#4dabf7'); fr(-30, -56, 56, 10, 5, '#2f86d6');
    X.beginPath(); X.moveTo(24, -26); X.lineTo(56, -54); stroke(8, '#4dabf7'); fe(58, -56, 9, 6, '#2f86d6', -0.7);
    X.beginPath(); X.arc(-30, -36, 16, Math.PI * 0.5, Math.PI * 1.5); stroke(6, '#2f86d6');
  }, tap(it) { emit('drop', it.x + 50, it.y - 60, 10, 1); Sfx.splash(); } },
  milho: { n: 'Milho', w: 50, h: 100, food: 3, ing: true, draw() {
    fe(0, -48, 16, 40, '#ffd23f'); for (let i = 0; i < 12; i++) fc(-6 + (i % 2) * 12, -76 + Math.floor(i / 2) * 9, 4, '#ffe58a');
    fpoly([-4, -10, -22, -60, -12, -6], '#62c24f'); fpoly([4, -10, 22, -60, 12, -6], '#4ea83c');
  } },
  trigo: { n: 'Trigo', w: 60, h: 110, ing: true, draw() {
    for (let i = -2; i <= 2; i++) { line(i * 4, 0, i * 9, -78, 3, '#d9a441'); fe(i * 9, -88, 6, 14, '#e8b04a', i * 0.15); }
    fr(-12, -30, 24, 8, 3, '#c4302b');
  } },
  soja: { n: 'Soja', w: 60, h: 50, food: 2, ing: true, draw() {
    X.save(); X.translate(0, -24); X.rotate(-0.3);
    fe(0, 0, 26, 11, '#9bc53d'); for (let i = -1; i <= 1; i++) fc(i * 14, 0, 6, '#c3e88d');
    X.restore();
  } },
  morango: { n: 'Morango', w: 50, h: 56, food: 2, ing: true, draw() {
    X.beginPath(); X.moveTo(0, -2); X.bezierCurveTo(-26, -20, -22, -46, 0, -44); X.bezierCurveTo(22, -46, 26, -20, 0, -2); X.fillStyle = '#e8283f'; X.fill();
    for (let i = 0; i < 7; i++) fc(-10 + (i % 3) * 10, -34 + Math.floor(i / 3) * 10, 1.6, '#ffe58a');
    fpoly([-12, -44, 0, -54, 12, -44, 0, -40], '#4ea83c');
  } },
  pinhao: { n: 'Pinhão', w: 60, h: 40, food: 2, draw() {
    for (const [x, r] of [[-14, -0.4], [6, 0.2], [20, 0.6]]) { X.save(); X.translate(x, -14); X.rotate(r); fe(0, 0, 8, 16, '#a0522d'); fe(0, -10, 5, 6, '#f2d6a8'); X.restore(); }
  }, update(it, dt) { if (it.hot > 0) { it.hot -= dt; if (Math.random() < dt * 2) emit('steam', it.x, it.y - 30, 1); } } },
  chimarrao: { n: 'Chimarrão', w: 70, h: 100, drink: 1, draw(it) {
    line(10, -60, 22, -96, 5, '#c9d5e0'); fr(18, -100, 8, 6, 2, '#c9d5e0');
    X.beginPath(); X.moveTo(-26, -60); X.quadraticCurveTo(-34, -10, 0, -2); X.quadraticCurveTo(34, -10, 26, -60); X.closePath();
    X.fillStyle = LG(-30, 0, 30, 0, '#7a4b2a', '#a0662f', '#6b3e26'); X.fill();
    fr(-28, -66, 56, 10, 5, '#c9d5e0'); fr(-26, -36, 52, 6, 2, 'rgba(255,255,255,.25)');
    if ((it.level ?? 1) > 0) fe(0, -62, 20, 5, '#5fa84a');
  } },
  gaita: { n: 'Gaita', w: 100, h: 80, draw() {
    fr(-46, -70, 30, 66, 6, '#c4302b'); fr(16, -70, 30, 66, 6, '#c4302b');
    for (let i = 0; i < 6; i++) fr(-16, -70 + i * 11, 32, 9, 2, i % 2 ? '#2f3241' : '#ffffff');
    for (let i = 0; i < 6; i++) fc(-31, -60 + i * 10, 3, '#ffffff'); for (let i = 0; i < 4; i++) fc(31, -56 + i * 12, 4, '#ffd23f');
  }, tap(it) { Sfx.strum(); emit('note', it.x, it.y - 80, 4); it.sq = 0.4; } },
  galinha: { n: 'Galinha', w: 80, h: 80, draw(it) {
    const t = G.t, peck = it.peck > 0 ? Math.sin(it.peck * 20) * 0.4 : 0;
    X.save(); X.scale(it.dir || 1, 1);
    line(-6, -10, -8, 0, 3, '#ff9f43'); line(6, -10, 8, 0, 3, '#ff9f43');
    fe(0, -30, 30, 24, '#ffffff'); fpoly([-26, -40, -42, -58, -34, -30], '#f1f3f9');
    X.save(); X.translate(18, -46); X.rotate(peck); fc(0, -8, 14, '#ffffff'); fpoly([4, -26, 10, -18, -2, -18], '#e8283f'); fpoly([12, -10, 24, -7, 12, -4], '#ff9f43'); fc(5, -11, 2.6, '#2a1d1a'); fe(8, 2, 3, 5, '#e8283f'); X.restore();
    fe(-4, -28, 14, 10, '#e9edf5', 0.3);
    X.restore();
  }, tap(it) { Sfx.cluck(); hop(it, 420); emit('star', it.x, it.y - 60, 3); },
  update(it, dt) {
    it.peck = Math.max(0, (it.peck || 0) - dt);
    if (it.state !== 'idle' || it.cont || it.onSurf) return;
    it.dir = it.dir || 1;
    it.x += it.dir * 35 * dt;
    if (Math.random() < dt * 0.4 || it.x < 960 || it.x > 1700) it.dir = -it.dir;
    if (Math.random() < dt * 0.3) it.peck = 0.6;
    if (Math.random() < dt * 0.15) Sfx.cluck();
  } },
});

function cropDraw(crop, stage, x, y, t) {
  const sway = Math.sin(t * 1.5 + x) * 0.04;
  X.save(); X.translate(x, y); X.rotate(sway);
  if (stage === 0) { fe(-6, -8, 8, 4, '#62c24f', -0.6); fe(6, -8, 8, 4, '#4ea83c', 0.6); line(0, 0, 0, -8, 3, '#4ea83c'); }
  else if (crop === 'milho') {
    const h = [0, 60, 110, 140][stage];
    line(0, 0, 0, -h, 7, '#4ea83c');
    for (let i = 1; i <= stage + 1; i++) { fe(-16, -h * i / (stage + 2), 18, 5, '#62c24f', -0.5); fe(16, -h * (i + 0.5) / (stage + 2), 18, 5, '#5fbf4a', 0.5); }
    if (stage === 3) { fe(12, -82, 9, 22, '#ffd23f', 0.3); fpoly([6, -64, 18, -100, 22, -66], '#7ed957'); }
  } else if (crop === 'trigo') {
    const h = [0, 40, 70, 95][stage], c = stage === 3 ? '#e8b04a' : '#8fcf5a';
    for (let i = -2; i <= 2; i++) { line(i * 5, 0, i * 10, -h, 3, c); if (stage >= 2) fe(i * 10, -h - 8, 5, 12, c); }
  } else if (crop === 'soja') {
    const r = [0, 16, 26, 34][stage];
    fc(-10, -r, r * 0.8, '#5fbf4a'); fc(10, -r * 0.9, r * 0.7, '#4ea83c'); fc(0, -r * 1.4, r * 0.7, '#62c24f');
    if (stage === 3) for (let i = 0; i < 5; i++) fe(-18 + i * 9, -r + (i % 2) * 10, 4, 9, '#c3e88d', 0.4);
  } else {
    const r = [0, 12, 18, 22][stage];
    fc(-12, -r, r * 0.8, '#4ea83c'); fc(12, -r, r * 0.8, '#5fbf4a'); fc(0, -r * 1.3, r * 0.7, '#62c24f');
    if (stage === 3) for (const [dx, dy] of [[-14, -8], [10, -6], [0, -2]]) { X.beginPath(); X.moveTo(dx, dy + 8); X.bezierCurveTo(dx - 9, dy, dx - 7, dy - 10, dx, dy - 9); X.bezierCurveTo(dx + 7, dy - 10, dx + 9, dy, dx, dy + 8); X.fillStyle = '#e8283f'; X.fill(); }
  }
  X.restore();
}
function plotStage(s) { if (!s.crop) return -1; return Math.min(3, Math.floor((Date.now() - s.at) / STAGE_MS)); }
function harvest(s, x, scene) {
  const crop = s.crop; s.crop = null;
  for (let i = 0; i < 3; i++) { const it = spawnItem(crop, x + rand(-30, 30), 860, scene); startFall(it, rand(-220, 220), rand(-650, -400)); it.floorY = rand(860, 930); }
  Sfx.cooked(); emit('star', x, 800, 12); Album.unlock('a_colheita');
}
function makePlot(id, x) {
  return {
    id, x: x - 60, y: 700, w: 120, h: 190, z: 868, state: { crop: null, at: 0 },
    dropRect: { x: x - 75, y: 650, w: 150, h: 260 },
    drop(e, s) {
      if (e.type === 'semente' && !s.crop) { s.crop = e.crop || 'milho'; s.at = Date.now(); removeEnt(e); Sfx.drop(0.4); emit('crumb', x, 860, 6, 'bread'); UI.toast(`Plantou ${CROPS[s.crop].n.toLowerCase()}! Agora é esperar crescer 🌱`); return true; }
      if (e.type === 'regador' && s.crop) { s.at -= 15000; emit('drop', x, 760, 16, 1); Sfx.splash(); return false; }
      return false;
    },
    tap(s) {
      const st = plotStage(s);
      if (st < 0) { UI.toast('Pegue uma semente nos sacos e solte aqui 🌱'); Sfx.click(); }
      else if (st < 3) { const left = Math.ceil((s.at + STAGE_MS * 3 - Date.now()) / 1000); UI.toast(`Ainda crescendo... falta ${left}s (o regador ajuda!)`); Sfx.click(); }
      else harvest(s, x, 'estancia');
      return true;
    },
    draw(s, t) {
      fe(x, 870, 62, 16, '#7a4b2a'); fe(x, 866, 56, 12, '#8a5532');
      for (let i = -2; i <= 2; i++) fc(x + i * 18, 864, 3, '#6b3e26');
      const st = plotStage(s);
      if (st >= 0) cropDraw(s.crop, st, x, 864, t);
      if (st === 3 && Math.sin(t * 4) > 0.6) { starPath(x + 30, 760, 7, 4, 0.3); X.fillStyle = '#fff3a8'; X.fill(); }
    },
  };
}
// o estado de cada objeto fica em st[id do objeto]: 'cavalo' e 'trator'
function horsePos(st) { const h = st.cavalo, b = h && h.trot > 0 ? Math.abs(Math.sin(G.t * 10)) * 12 : 0; return { x: 1654, y: 656 - b, ang: 0 }; }
function tractorPos(st) { const tr = st.trator; return { x: (tr ? tr.x : 2750) - 10, y: 640, ang: 0 }; }

SCENES.estancia = {
  id: 'estancia', name: 'Estância', W: 3100, floorTop: 815, floorBot: 950, ceil: -500, outdoor: true,
  surfaces: [
    { x1: 130, x2: 350, y: 600 }, { x1: 690, x2: 890, y: 690 }, { x1: 400, x2: 520, y: 450 },
  ],
  seats: [
    { x: 560, y: 760, kind: 'chair' }, { x: 640, y: 760, kind: 'chair' },
    { x: 1650, y: 680, kind: 'chair', tag: 'cavalo', pos: horsePos },
    { x: 2700, y: 640, kind: 'chair', tag: 'trator', pos: tractorPos },
  ],
  bg(st, t) {
    skyBg(t, 11);
    const n = G.nightK > 0.5;
    X.fillStyle = n ? '#355c48' : '#9bd77e'; X.beginPath(); X.moveTo(-1000, 720);
    for (let x = -1000; x <= 4200; x += 300) X.quadraticCurveTo(x + 150, 600 + srand(x) * 60, x + 300, 720);
    X.lineTo(4200, 800); X.lineTo(-1000, 800); X.fill();
    // araucárias ao longe
    for (let i = 0; i < 9; i++) {
      const x = -200 + i * 420 + srand(i + 30) * 120, y = 700, c = n ? '#24463a' : '#4f8a4a', s = 0.8 + srand(i + 60) * 0.5;
      line(x, y, x, y - 210 * s, 7, n ? '#2a2a3a' : '#7a5a3a');
      // copa em forma de taça/guarda-chuva, típica da araucária
      for (const k of [-1, 1]) { X.beginPath(); X.moveTo(x, y - 150 * s); X.quadraticCurveTo(x + k * 50 * s, y - 170 * s, x + k * 80 * s, y - 215 * s); stroke(5, n ? '#2a2a3a' : '#7a5a3a'); }
      fe(x, y - 215 * s, 105 * s, 18 * s, c);
      for (let k = -4; k <= 4; k++) fc(x + k * 24 * s, y - 222 * s - (4 - Math.abs(k)) * 2, 14 * s, c);
      fe(x, y - 232 * s, 70 * s, 10 * s, n ? '#2f5a48' : '#5fa25a');
    }
    // silo e celeiro ao fundo
    fr(2900, 470, 70, 250, 30, n ? '#5b6474' : '#d4dae2'); fe(2935, 470, 35, 14, n ? '#7a8394' : '#e6ebf0');
    fr(2380, 560, 220, 160, 6, n ? '#6b2b2b' : '#c4302b'); fpoly([2366, 560, 2490, 480, 2614, 560], n ? '#4a1e1e' : '#9a2420');
    line(2440, 620, 2540, 700, 8, '#ffffff'); line(2540, 620, 2440, 700, 8, '#ffffff');
    floorGrass(-1000, 4200);
    // estrada de chão
    X.fillStyle = 'rgba(200,160,100,.5)'; X.fillRect(-1000, 900, 5200, 34);
    // cerca
    for (let x = 960; x <= 1760; x += 80) fr(x - 5, 720, 10, 90, 3, '#a0754d');
    fr(950, 740, 820, 8, 3, '#a0754d'); fr(950, 775, 820, 8, 3, '#a0754d');
    // galpão (fundo)
    X.fillStyle = '#b07547'; X.fillRect(0, 300, 940, 500);
    for (let x = 0; x < 940; x += 46) line(x, 300, x, 800, 3, 'rgba(0,0,0,.12)');
    fpoly([-40, 300, 470, 170, 980, 300], '#7a4b2a'); fr(-40, 292, 1020, 16, 4, '#5a3520');
    fr(30, 300, 26, 500, 6, '#8a5532'); fr(890, 300, 26, 500, 6, '#8a5532');
    // bandeira do RS
    line(860, 200, 860, 120, 4, '#9aa0aa');
    X.save(); X.translate(860, 122); X.beginPath(); X.rect(0, 0, 70, 46); X.clip();
    fpoly([0, 0, 70, 0, 0, 46], '#2f9e44'); fpoly([70, 0, 70, 46, 0, 46], '#ffd43b'); X.beginPath(); X.moveTo(0, 46); X.lineTo(70, 0); stroke(12, '#e03131');
    X.restore();
    // prateleira e quadro do galpão
    fr(400, 450, 140, 12, 4, '#5a3520');
    frame(600, 380, 130, 100, '#5a3520', artHills);
  },
  props: [
    { id: 'lampiao', x: 440, y: 230, w: 80, h: 110, state: { on: true },
      tap(s) { s.on = !s.on; Sfx.click(); return true; },
      light(s) { return s.on ? { x: 480, y: 330, r: 520, col: '#ffb15a' } : null; },
      draw(s) { line(480, 250, 480, 290, 3, '#3a3d58'); lampGlow(480, 320, s.on && G.nightK > 0.05, '#ffd08a'); fr(462, 290, 36, 50, 10, s.on ? '#ffe2a8' : '#c9d5e0'); fr(458, 286, 44, 10, 4, '#3a3d58'); } },
    { id: 'fogao', x: 110, y: 470, w: 260, h: 330, state: { on: true, ing: [], cook: 0 },
      dropRect: { x: 110, y: 470, w: 260, h: 160 },
      drop(e, s) { return Pot.drop(e, s); },
      tap(s) { if (Pot.tap(s)) return true; s.on = !s.on; Sfx.click(); return true; },
      light(s) { return s.on ? { x: 240, y: 700, r: 300, col: '#ff8a3c' } : null; },
      update(s, dt) { Pot.update(s, dt, 240, 600, 'estancia'); if (s.on && Math.random() < dt * 3) emit('smoke', 330, 330, 1); },
      draw(s, t) {
        softShadow(240, 800, 150);
        fr(310, 320, 34, 200, 4, '#3a3d58');
        fr(120, 600, 240, 200, 10, '#3a3d58'); fr(112, 590, 256, 20, 6, '#24263a');
        fr(150, 650, 90, 70, 8, '#1d1f2e');
        if (s.on) { fr(156, 656, 78, 58, 6, LG(0, 656, 0, 714, '#ffd08a', '#ff5a2a')); for (let i = 0; i < 4; i++) fe(170 + i * 18, 700 - Math.abs(Math.sin(t * 9 + i)) * 12, 6, 12, '#ffe58a'); }
        fr(260, 650, 80, 120, 8, '#5b6474'); fc(330, 710, 5, '#c9d5e0');
        fr(150, 740, 180, 40, 6, '#a0522d'); for (let i = 0; i < 5; i++) fe(170 + i * 36, 760, 16, 10, '#8a5532');
        Pot.draw(s, t, 240, 592);
      } },
    { id: 'pinhoes', x: 380, y: 730, w: 110, h: 70,
      tap() {
        const f = G.st.estancia.fogao;
        if (!f.on) { UI.toast('Acenda o fogão a lenha primeiro 🔥'); Sfx.click(); return true; }
        if (!canSpawn()) return true;
        const it = spawnItem('pinhao', rand(150, 330), 600, 'estancia'); it.hot = 20; Sfx.pop(); UI.toast('Pinhão na chapa! Bah, que cheiro bom!'); return true;
      },
      draw() { fe(435, 790, 50, 12, '#8a5532'); fr(390, 742, 90, 50, 12, '#c98a55'); for (let i = 0; i < 8; i++) fe(400 + (i % 4) * 20, 742 - Math.floor(i / 4) * 8, 7, 10, '#a0522d', 0.3); } },
    { id: 'mesa', x: 690, y: 600, w: 200, h: 200,
      tap(s, w) {
        if (w.x > 800) { if (!canSpawn()) return true; const it = spawnItem('chimarrao', rand(720, 860), 690, 'estancia'); it.level = 1; Sfx.gulp(); UI.toast('Um chimarrão quentinho, tchê! 🧉'); }
        return true;
      },
      draw() {
        softShadow(790, 800, 120);
        fr(700, 700, 14, 100, 4, '#7a4b2a'); fr(866, 700, 14, 100, 4, '#7a4b2a'); fr(690, 690, 200, 18, 6, '#a0662f');
        fr(830, 600, 40, 90, 14, '#c9d5e0'); fr(836, 590, 28, 14, 6, '#9aa6b2'); fr(864, 620, 12, 30, 5, '#9aa6b2');
      } },
    { id: 'radio', x: 400, y: 380, w: 120, h: 75, state: { on: false },
      tap(s) { s.on = !s.on; Sfx.click(); UI.toast(s.on ? '♪ Rádio gaúcho: vaneira! Bora dançar!' : 'Rádio desligado'); return true; },
      update(s, dt) { if (s.on && Math.random() < dt * 2.5) emit('note', rand(420, 500), 380, 1); },
      draw(s, t) { const b = s.on ? Math.sin(t * 12) * 2 : 0; fr(410, 392 - b, 100, 58 + b, 12, '#2f9e44'); fc(440, 422, 16, '#2f3241'); fr(468, 404, 32, 10, 3, '#fff1d6'); fc(485, 432, 6, s.on ? '#ffd43b' : '#5b6474'); } },
    makeChair('banco1', 560, 760, '#a0662f', 1), makeChair('banco2', 640, 760, '#a0662f', 1),
    { id: 'galinheiro', x: 980, y: 560, w: 220, h: 240,
      tap() { if (!canSpawn()) return true; spawnItem('egg', rand(1010, 1170), 880, 'estancia'); Sfx.cluck(); UI.toast('Ovo fresquinho! 🥚'); return true; },
      draw() {
        softShadow(1090, 806, 120);
        fr(1000, 620, 180, 180, 8, '#e0a46a'); fpoly([985, 624, 1090, 560, 1195, 624], '#c4302b');
        fr(1060, 700, 60, 100, 6, '#7a4b2a'); fr(1020, 650, 40, 30, 4, '#ffe2a8');
        line(1090, 800, 1130, 870, 6, '#a0754d');
      } },
    { id: 'vaca', x: 1250, y: 620, w: 300, h: 200, state: { m: 0 },
      tap(s) { s.m = 1; Sfx.moo(); if (canSpawn()) { const it = spawnItem('milk', rand(1300, 1500), 880, 'estancia'); it.level = 1; } return true; },
      update(s, dt) { s.m = Math.max(0, s.m - dt); },
      draw(s, t) {
        softShadow(1400, 812, 160);
        const chew = Math.sin(t * 3) * 2, W = '#fbfaf7', W2 = '#e6e2da', B = '#2f3241';
        const leg = (x, col) => {
          X.beginPath(); X.moveTo(x - 13, 712); X.quadraticCurveTo(x - 15, 750, x - 10, 788); X.lineTo(x + 10, 788); X.quadraticCurveTo(x + 14, 750, x + 13, 712); X.closePath();
          X.fillStyle = LG(x - 13, 0, x + 13, 0, col, shade(col === W ? '#fbfaf7' : '#e6e2da', -0.08)); X.fill();
          fe(x, 756, 9, 6, 'rgba(0,0,0,.05)'); fr(x - 12, 786, 24, 14, 5, '#3a2a20');
        };
        leg(1318, W2); leg(1454, W2);
        // rabo com tufo
        X.beginPath(); X.moveTo(1290, 662); X.quadraticCurveTo(1266, 720 + Math.sin(t * 2) * 8, 1272, 766); stroke(6, W2);
        fe(1272 + Math.sin(t * 2) * 3, 774, 9, 14, B);
        // corpo com manchas
        X.save(); RR(1282, 636, 236, 116, 56); X.clip();
        X.fillStyle = LG(0, 636, 0, 752, '#ffffff', W, W2); X.fillRect(1282, 636, 236, 116);
        fe(1340, 676, 42, 30, B, 0.3); fc(1376, 662, 18, B); fe(1446, 716, 34, 22, B, -0.2); fc(1300, 724, 16, B); fe(1478, 664, 18, 14, B);
        X.restore();
        fe(1400, 700, 110, 56, 'rgba(255,255,255,0)');
        fe(1402, 756, 28, 13, '#ffb3c7'); for (let i = 0; i < 4; i++) fe(1386 + i * 11, 768, 3, 6, '#f59ab3');
        leg(1340, W); leg(1478, W);
        // cabeça
        X.save(); X.translate(1528, 662 + chew); X.rotate(s.m > 0 ? -0.22 : 0);
        fe(-34, -16, 18, 9, W2, -0.5); fe(-34, -16, 10, 5, '#ffb3c7', -0.5);
        fpoly([-18, -36, -26, -58, -8, -40], '#efe3c7'); fpoly([18, -38, 28, -60, 8, -42], '#efe3c7');
        fe(0, 0, 38, 40, RG(-10, -12, 4, 44, '#ffffff', W, W2));
        fe(-6, -20, 16, 12, B, 0.3);
        fe(10, 28, 34, 22, LG(0, 10, 0, 50, '#ffc8d4', '#f9a9be'));
        fe(0, 26, 4, 5, '#9a4a5a'); fe(20, 26, 4, 5, '#9a4a5a');
        if (s.m > 0) fe(10, 42, 12, 6, '#7a2e3a'); else { X.beginPath(); X.arc(10, 36, 9, 0.2, Math.PI - 0.2); stroke(2.5, '#9a4a5a'); }
        petEye(-12, -6, false, '#3a2a20', 1.2); petEye(18, -8, false, '#3a2a20', 1.2);
        line(-18, -16, -12, -20, 2, '#2a1d1a'); line(24, -18, 30, -22, 2, '#2a1d1a');
        X.restore();
        // sininho no pescoço
        fr(1488, 696 + chew, 40, 7, 3, '#c4302b'); fe(1508, 714 + chew, 9, 10, '#ffcf3d'); fc(1508, 722 + chew, 2.5, '#a0662f');
        X.font = '600 18px Fredoka, sans-serif'; X.textAlign = 'center'; X.fillStyle = '#c45b8f'; X.fillText('Mimosa', 1400, 624);
      } },
    { id: 'cavalo', x: 1560, y: 560, w: 220, h: 260, state: { trot: 0 },
      tap(s) { s.trot = 4; Sfx.neigh(); return true; },
      update(s, dt) { s.trot = Math.max(0, s.trot - dt); if (s.trot > 0 && Math.random() < dt * 6) emit('crumb', 1600 + rand(-40, 60), 810, 1, 'bread'); },
      draw(s, t) {
        const b = s.trot > 0 ? Math.abs(Math.sin(t * 10)) * 12 : 0, k = s.trot > 0 ? Math.sin(t * 10) * 0.3 : 0;
        softShadow(1665, 812, 130);
        const C1 = '#a0662f', C2 = '#7a4a22', M = '#3a2a20', y0 = -b;
        const body = (fill) => { X.beginPath(); X.ellipse(1662, 696 + y0, 92, 42, 0, 0, TAU); X.fillStyle = fill; X.fill(); };
        // pernas com joelho e casco (as de trás ficam mais escuras)
        const leg = (x, ph, col) => {
          X.save(); X.translate(x, 712 + y0); X.rotate(Math.sin(t * 10 + ph) * k);
          X.beginPath(); X.moveTo(-10, 0); X.quadraticCurveTo(-11, 40, -7, 52); X.quadraticCurveTo(-9, 70, -7, 84); X.lineTo(7, 84); X.quadraticCurveTo(9, 70, 7, 52); X.quadraticCurveTo(11, 40, 10, 0); X.closePath();
          X.fillStyle = col; X.fill(); fe(0, 50, 8, 5, 'rgba(0,0,0,.08)');
          fr(-8, 74, 16, 10, 3, '#f3ead8'); fr(-9, 82, 18, 10, 4, M);
          X.restore();
        };
        leg(1622, Math.PI, C2); leg(1706, 0, C2);
        // rabo com fios
        for (let i = 0; i < 4; i++) { X.beginPath(); X.moveTo(1576, 676 + y0); X.bezierCurveTo(1546 - i * 4, 700 + y0, 1548 + Math.sin(t * 3 + i) * 6, 740, 1556 + i * 4, 782); stroke(7 - i, i % 2 ? M : '#4a3628'); }
        body(LG(0, 654 + y0, 0, 738 + y0, shade(C1, 0.14), C1, shade(C1, -0.12)));
        fe(1608, 690 + y0, 44, 40, C1); fe(1716, 690 + y0, 40, 40, C1);
        body(RG(1640, 676 + y0, 10, 100, 'rgba(255,255,255,.12)', 'rgba(255,255,255,0)'));
        // pescoço e cabeça
        X.beginPath(); X.moveTo(1704, 668 + y0); X.quadraticCurveTo(1716, 612 + y0, 1756, 584 + y0); X.lineTo(1786, 604 + y0); X.quadraticCurveTo(1758, 640 + y0, 1752, 710 + y0); X.closePath();
        X.fillStyle = LG(1700, 0, 1790, 0, shade(C1, 0.1), C1); X.fill();
        fe(1786, 600 + y0, 42, 21, C1, 0.55);
        fe(1810, 622 + y0, 17, 15, shade(C1, 0.18), 0.4); fe(1816, 624 + y0, 3.5, 2.5, M);
        X.beginPath(); X.moveTo(1772, 590 + y0); X.quadraticCurveTo(1796, 600 + y0, 1808, 616 + y0); stroke(6, '#f3ead8');
        fpoly([1756, 582 + y0, 1760, 554 + y0, 1770, 580 + y0], C2); fpoly([1766, 578 + y0, 1774, 552 + y0, 1780, 580 + y0], C1);
        petEye(1778, 590 + y0, false, '#3a2a20', 1.15);
        // crina ondulando
        for (let i = 0; i < 7; i++) { const px = 1758 - i * 10, py = 584 + i * 14 + y0; X.beginPath(); X.moveTo(px, py); X.quadraticCurveTo(px - 14, py + 6 + Math.sin(t * 4 + i) * 3, px - 10, py + 20); stroke(8, i % 2 ? M : '#4a3628'); }
        X.beginPath(); X.moveTo(1762, 572 + y0); X.quadraticCurveTo(1780, 576 + y0, 1784, 588 + y0); stroke(6, M);
        // sela com manta e estribo
        fr(1612, 662 + y0, 84, 26, 9, '#c4302b'); for (let i = 0; i < 6; i++) fr(1616 + i * 14, 684 + y0, 8, 6, 2, '#ffd23f');
        fr(1624, 648 + y0, 62, 18, 9, '#5a3520'); fr(1678, 640 + y0, 10, 14, 4, '#5a3520');
        line(1650, 666 + y0, 1648, 714 + y0, 3, '#3a2a20'); X.beginPath(); X.arc(1648, 720 + y0, 7, 0, Math.PI); stroke(3, '#c9d5e0');
        leg(1606, 0, C1); leg(1724, Math.PI, C1);
      } },
    makePlot('plot1', 1840), makePlot('plot2', 1980), makePlot('plot3', 2120), makePlot('plot4', 2260),
    { id: 'sacos', x: 2440, y: 700, w: 230, h: 120,
      tap(s, w) {
        if (!canSpawn()) return true;
        const keys = Object.keys(CROPS), i = clamp(Math.floor((w.x - 2440) / 58), 0, 3);
        const it = spawnItem('semente', 2470 + i * 58, 880, 'estancia'); it.crop = keys[i]; Sfx.pop();
        UI.toast(`Semente de ${CROPS[keys[i]].n.toLowerCase()}! Solte num canteiro 🌱`); return true;
      },
      draw() {
        Object.keys(CROPS).forEach((k, i) => {
          const x = 2470 + i * 58;
          softShadow(x, 812, 30);
          fpoly([x - 24, 730, x + 24, 730, x + 28, 810, x - 28, 810], '#d9c29a'); fe(x, 730, 22, 8, '#c4a874');
          fc(x, 766, 12, CROPS[k].col);
          X.font = '600 12px Fredoka, sans-serif'; X.textAlign = 'center'; X.fillStyle = '#5a3824'; X.fillText(CROPS[k].n, x, 800);
        });
      } },
    { id: 'trator', x: 2600, y: 520, w: 320, h: 300, state: { x: 2750, dir: 0, rev: 0 },
      tap(s) { s.dir = s.dir ? 0 : (s.x > 2300 ? -1 : 1); if (s.dir) { Sfx.tractor(); UI.toast('Vrum! O trator colhe o que estiver maduro 🚜'); } return true; },
      update(s, dt) {
        if (!s.dir) return;
        s.x += s.dir * 110 * dt; this.x = s.x - 150;
        s.rev -= dt; if (s.rev <= 0) { s.rev = 0.8; Sfx.tractor(); }
        if (Math.random() < dt * 8) emit('smoke', s.x + 40, 520, 1);
        if (s.x < 1840) { s.x = 1840; s.dir = 1; } if (s.x > 2900) { s.x = 2900; s.dir = 0; }
        for (const p of SCENES.estancia.props) if (p.id.startsWith('plot')) { const ps = G.st.estancia[p.id]; const px = p.x + 60; if (Math.abs(px - s.x) < 30 && plotStage(ps) === 3) harvest(ps, px, 'estancia'); }
      },
      draw(s, t) {
        const x = s.x, b = s.dir ? Math.sin(t * 20) * 2 : 0;
        softShadow(x, 812, 150);
        fc(x - 70, 750 + b, 58, '#2f3241'); fc(x - 70, 750 + b, 30, '#ffd23f');
        fc(x + 80, 776 + b, 34, '#2f3241'); fc(x + 80, 776 + b, 16, '#ffd23f');
        fr(x - 100, 660 + b, 230, 80, 16, '#2f9e44'); fr(x + 40, 600 + b, 90, 70, 12, '#3fae49');
        fr(x - 60, 560 + b, 80, 100, 8, 'rgba(200,235,255,.5)'); fr(x - 66, 552 + b, 92, 12, 5, '#2f9e44');
        fr(x + 100, 560 + b, 12, 50, 4, '#5b6474');
        X.font = '600 18px Fredoka, sans-serif'; X.textAlign = 'center'; X.fillStyle = '#ffd23f'; X.fillText('VILA', x + 10, 712 + b);
      } },
    { id: 'feno', x: 2980, y: 680, w: 120, h: 130, state: { n: 0, done: false },
      tap(s) {
        emit('crumb', 3040, 720, 6, 'bread'); Sfx.drop(0.3);
        if (!s.done && secretTap(s, 3, () => { s.done = true; spawnTreasure('ferradura', 3040, 760, 'estancia'); UI.toast('Algo brilhou no feno! 🍀'); })) return true;
        return true;
      },
      draw() { softShadow(3040, 812, 70); fe(3040, 760, 60, 50, '#e8c27a'); fe(3040, 730, 46, 30, '#f2d68a'); for (let i = 0; i < 8; i++) line(3000 + i * 10, 720, 3006 + i * 10, 800, 2, 'rgba(160,110,40,.4)'); } },
  ],
  init() {
    return [
      I('gaita', 600, 760), I('chimarrao', 760, 690, { level: 1 }), I('regador', 2380, 900),
      I('semente', 1900, 920, { crop: 'milho' }), I('semente', 2000, 925, { crop: 'morango' }),
      I('galinha', 1100, 900), I('galinha', 1300, 920),
      P('dog', 'Thor', 900, 910, { col: '#5a3824', spot: false }),
      C('Otto', 'estancia', 700, 905), C('Lara', 'estancia', 1900, 900),
    ];
  },
};
// tomar chimarrão vale figurinha
ITEMS.chimarrao.onEat = () => Album.unlock('a_chimarrao');
ITEMS.morango.ing = true; ITEMS.milho.ing = true; ITEMS.trigo.ing = true; ITEMS.soja.ing = true;
