'use strict';
// ======================================================
//  Lugares extras: Mercado, Escola e Praia (+ itens novos)
// ======================================================

// ---------- Itens novos ----------
Object.assign(ITEMS, {
  orange: { n: 'Laranja', w: 66, h: 70, food: 3, draw() {
    fc(0, -32, 32, RG(-10, -44, 4, 40, '#ffc46b', '#ff9f1c', '#e07b00'));
    for (let i = 0; i < 6; i++) fc(-14 + (i % 3) * 12, -46 + ((i / 3) | 0) * 22, 1.6, 'rgba(160,80,0,.35)');
    fe(8, -64, 12, 6, '#5fbf4a', 0.4); fr(-2, -68, 4, 8, 2, '#7a4b2a');
  } },
  shell: { n: 'Concha', w: 70, h: 56, draw() {
    X.beginPath(); X.moveTo(0, -4); X.arc(0, -4, 34, Math.PI * 1.05, Math.PI * 1.95); X.closePath();
    X.fillStyle = LG(0, -40, 0, 0, '#ffd6e5', '#ff9ec4'); X.fill();
    for (let i = 0; i < 6; i++) { const a = Math.PI * (1.12 + i * 0.15); line(0, -4, Math.cos(a) * 32, -4 + Math.sin(a) * 32, 2.5, 'rgba(230,90,140,.5)'); }
    fr(-12, -8, 24, 10, 4, '#ffb3cf');
  }, tap(it) { Sfx.wave(); it.sq = 0.4; emit('star', it.x, it.y - 40, 4); } },
  starfish: { n: 'Estrela-do-mar', w: 76, h: 70, draw() {
    starPath(0, -34, 36, 5, 0.46); X.fillStyle = LG(0, -70, 0, 0, '#ffb066', '#ff7a3d'); X.fill();
    for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + (i / 5) * TAU; fc(Math.cos(a) * 18, -34 + Math.sin(a) * 18, 2.6, '#ffe2c4'); }
    fc(-4, -42, 3, '#2a1d1a'); fc(6, -42, 3, '#2a1d1a');
  } },
  bucket: { n: 'Baldinho', w: 80, h: 90, draw() {
    X.beginPath(); X.arc(0, -62, 34, Math.PI, 0); stroke(4, '#2f86d6');
    fpoly([-34, -62, 34, -62, 26, 0, -26, 0], LG(-34, 0, 34, 0, '#6ec0ff', '#4dabf7', '#2f86d6'));
    fr(-36, -66, 72, 10, 5, '#82c6fb');
    fe(0, -62, 30, 5, '#eccb85');
    fr(18, -108, 8, 50, 4, '#ffd23f'); fe(22, -110, 12, 16, '#ff6b6b');
  } },
  crab: { n: 'Caranguejo', w: 96, h: 70, draw(it) {
    const t = G.t, w = it.state === 'idle' ? Math.sin(t * 16 + it.id) * 4 : 0;
    for (const k of [-1, 1]) for (let i = 0; i < 3; i++) line(k * 18, -18, k * (36 + i * 4), -2 + (i % 2 ? w : -w), 4, '#e2553e');
    fe(0, -24, 34, 20, LG(0, -44, 0, -4, '#ff8a6a', '#e2553e'));
    for (const k of [-1, 1]) {
      line(k * 22, -30, k * 38, -46, 5, '#e2553e');
      fe(k * 42, -52, 12, 10, '#ff6b4f'); fpoly([k * 44, -56, k * 58, -66, k * 52, -50], '#ff6b4f');
      line(k * 9, -40, k * 11, -56, 3, '#e2553e'); fc(k * 11, -58, 6, '#fff'); fc(k * 11, -58, 3, '#2a1d1a');
    }
    X.beginPath(); X.arc(0, -22, 9, 0.2, Math.PI - 0.2); stroke(3, '#8a2a1a');
  }, tap(it) { Sfx.pinch(); hop(it, 420); }, update(it, dt) {
    if (it.state !== 'idle' || it.cont || it.onSurf) return;
    it.dir = it.dir || 1;
    it.x += it.dir * 55 * dt;
    if (Math.random() < dt * 0.4 || it.x < 60 || it.x > SCENES[it.scene].W - 60) it.dir = -it.dir;
  } },
  coconut: { n: 'Água de coco', w: 74, h: 116, drink: 1, draw(it) {
    fc(0, -36, 34, RG(-10, -50, 4, 40, '#9be36a', '#5fbf4a', '#3f8f3f'));
    fe(0, -62, 16, 6, '#fff7e0');
    line(6, -66, 18, -108, 5, '#ff7eb6');
    if ((it.level ?? 1) > 0) { X.beginPath(); X.moveTo(-26, -104); X.quadraticCurveTo(-8, -124, 10, -104); X.closePath(); X.fillStyle = '#ffd23f'; X.fill(); line(-8, -104, -4, -78, 2.5, '#c98a55'); }
    fe(-12, -48, 6, 10, 'rgba(255,255,255,.35)', -0.4);
  } },
  xylo: { n: 'Xilofone', w: 130, h: 60, draw() {
    fr(-62, -16, 124, 12, 5, '#a8703f');
    ['#ff6b6b', '#ff9f43', '#ffd23f', '#7ed957', '#4dabf7', '#a77bf3'].forEach((c, i) => fr(-58 + i * 20, -54 + i * 4, 16, 44 - i * 4, 5, c));
    line(30, -60, 60, -86, 4, '#c98a55'); fc(62, -88, 7, '#ffffff');
  }, tap(it) { Sfx.xylo(); emit('note', it.x, it.y - 70, 4); it.sq = 0.3; } },
  plane: { n: 'Aviãozinho', w: 100, h: 50, grav: 0.16, draw() {
    fpoly([-48, -20, 50, -30, -20, -6], '#ffffff');
    fpoly([-48, -20, 50, -30, -30, -34], '#eef3f8');
    fpoly([-20, -6, 50, -30, -12, -22], '#d4dee8');
    line(-46, -20, 48, -30, 1.5, 'rgba(0,0,0,.1)');
  }, tap(it) { if (it.state !== 'idle') return; Sfx.whoosh(); startFall(it, it.x < SCENES[it.scene].W / 2 ? 650 : -650, -520); } },
  cereal: { n: 'Cereal', w: 70, h: 100, food: 4, draw() {
    fr(-30, -96, 60, 96, 6, LG(-30, 0, 30, 0, '#ffd23f', '#ffb400'));
    fr(-24, -84, 48, 40, 8, '#ff6b6b'); fc(0, -64, 14, '#fff3c4'); fc(-6, -68, 4, '#e8a64a'); fc(6, -60, 4, '#e8a64a');
    fr(-30, -96, 60, 10, 4, '#e09a00');
  } },
});

// ---------- Arte compartilhada ----------
function skyBg(t, seed = 3) {
  const n = G.nightK;
  X.fillStyle = LG(0, -1200, 0, 800, '#4fb3f0', '#8fd6ff', '#e2f6ff'); X.fillRect(-1000, -1400, 5000, 2200);
  if (n > 0.01) { X.globalAlpha = n; nightSky(-1000, -1400, 5000, 2200, seed); X.globalAlpha = 1; }
  if (n < 0.99) { X.globalAlpha = 1 - n; fc(2100, 150, 60, '#fff3b0'); fc(2100, 150, 100, 'rgba(255,243,176,.35)'); X.globalAlpha = 1; }
  if (n > 0.01) { X.globalAlpha = n; fc(700, 140, 50, '#fff6d0'); fc(724, 126, 44, '#1e2b68'); X.globalAlpha = 1; }
  for (let i = 0; i < 6; i++) cloud(((t * (6 + i * 2) + i * 640 + seed * 90) % 3800) - 600, 80 + (i % 3) * 70, 0.9 + (i % 2) * 0.4, 0.95 - n * 0.6);
}
function makePendant(id, x, col) {
  return {
    id, x: x - 60, y: 0, w: 120, h: 190, state: { on: true },
    tap(s) { s.on = !s.on; Sfx.click(); return true; },
    light(s) { return s.on ? { x, y: 190, r: 480 } : null; },
    draw(s) {
      line(x, 0, x, 120, 3, '#5b6474');
      lampGlow(x, 180, s.on && G.nightK > 0.05);
      X.beginPath(); X.moveTo(x - 54, 180); X.lineTo(x - 30, 124); X.lineTo(x + 30, 124); X.lineTo(x + 54, 180); X.closePath();
      X.fillStyle = col; X.fill(); fe(x, 180, 54, 7, s.on ? '#fff3c4' : shade(col, -0.3));
    },
  };
}
function makeSpawnCrate(id, x, type, col) {
  return {
    id, x, y: 560, w: 140, h: 160, state: {},
    tap() { if (!canSpawn()) return true; spawnItem(type, x + 70 + rand(-30, 30), 600, 'mercado'); Sfx.coin(); return true; },
    draw() {
      X.save(); X.beginPath(); X.rect(x - 10, 520, 160, 100); X.clip();
      [[30, 650], [70, 640], [110, 650], [50, 612], [90, 612], [70, 588]].forEach(([dx, y]) => {
        X.save(); X.translate(x + dx, y); X.scale(0.62, 0.62); ITEMS[type].draw({}); X.restore();
      });
      X.restore();
      fr(x, 620, 140, 80, 8, LG(0, 620, 0, 700, '#d9985f', '#b8763d'));
      for (let i = 1; i < 3; i++) line(x + 6, 620 + i * 26, x + 134, 620 + i * 26, 3, 'rgba(0,0,0,.12)');
      fr(x + 34, 680, 72, 32, 8, '#ffffff');
      X.font = '600 18px Fredoka, sans-serif'; X.textAlign = 'center'; X.fillStyle = col; X.fillText(ITEMS[type].n, x + 70, 702);
    },
  };
}

// ======================================================
//  MERCADO
// ======================================================
SCENES.mercado = {
  id: 'mercado', name: 'Mercado', W: 2400, floorTop: 805, floorBot: 950, ceil: 260,
  surfaces: [
    { x1: 80, x2: 700, y: 600 },
    { x1: 815, x2: 1385, y: 420 }, { x1: 815, x2: 1385, y: 560 }, { x1: 815, x2: 1385, y: 700 },
    { x1: 1465, x2: 1695, y: 630 },
    { x1: 1790, x2: 2250, y: 640 },
    { x1: 1110, x2: 1260, y: 770, z: 902 },
  ],
  seats: [],
  bg(st, t) {
    wall(-1000, 3400, '#e3f6ef', patStripes());
    ceilingTrim(-1000, 3400);
    baseboard(-1000, 3400, '#2ec4b6');
    floorTiles(-1000, 3400, '#f6f7f9', '#dfe4ea', 90);
    fr(640, 50, 640, 96, 30, LG(0, 50, 0, 146, '#3ad1c2', '#21a99c'));
    X.font = '600 52px Fredoka, sans-serif'; X.textAlign = 'center'; X.fillStyle = '#ffffff'; X.fillText('Mercadinho', 960, 116);
    fc(700, 98, 22, '#ffd23f'); fc(1220, 98, 22, '#ff6b6b');
    // placas de corredor
    [['Frutas', 390, '#ff6b6b'], ['Mercearia', 1100, '#5c7cfa'], ['Gelados', 1580, '#4dabf7'], ['Caixa', 2020, '#ff9f43']].forEach(([s, x, c]) => {
      line(x - 50, 0, x - 50, 200, 2, '#9aa6b2'); line(x + 50, 0, x + 50, 200, 2, '#9aa6b2');
      fr(x - 80, 196, 160, 46, 14, c); X.font = '600 24px Fredoka, sans-serif'; X.fillStyle = '#fff'; X.fillText(s, x, 228);
    });
  },
  props: [
    makePendant('l1', 390, '#2ec4b6'), makePendant('l2', 1100, '#2ec4b6'), makePendant('l3', 2020, '#2ec4b6'),
    { id: 'stand', x: 0, y: 0, w: 0, h: 0,
      draw() {
        softShadow(390, 800, 330);
        fr(70, 600, 640, 22, 8, '#8a5532');
        fr(90, 620, 20, 180, 6, '#7a4b2a'); fr(670, 620, 20, 180, 6, '#7a4b2a');
        fr(70, 700, 640, 100, 10, '#a8703f');
        for (let i = 0; i < 8; i++) fr(84 + i * 78, 714, 66, 72, 8, '#b8804f');
      } },
    makeSpawnCrate('cApple', 90, 'apple', '#e2553e'), makeSpawnCrate('cBanana', 240, 'banana', '#e0a800'),
    makeSpawnCrate('cOrange', 390, 'orange', '#ff8a00'), makeSpawnCrate('cMelon', 540, 'watermelon', '#3f9a5a'),
    { id: 'shelves', x: 0, y: 0, w: 0, h: 0,
      draw() {
        softShadow(1100, 800, 320);
        fr(800, 250, 600, 546, 14, LG(800, 0, 1400, 0, '#ffffff', '#eef2f6'));
        fr(812, 262, 576, 530, 8, '#dfe8f0');
        const cols = ['#ff6b6b', '#ffd23f', '#5c7cfa', '#7ed957', '#ff9f43', '#a77bf3', '#2ec4b6'];
        [420, 560, 700].forEach((y, r) => {
          for (let i = 0; i < 9; i++) {
            const c = cols[(i + r * 3) % cols.length], bx = 822 + i * 62, h = 70 + ((i * 7 + r) % 3) * 12;
            if (r === 1) { fr(bx + 6, y - 64, 44, 64, 8, c); fr(bx + 6, y - 64, 44, 12, 6, '#d4dae2'); fr(bx + 12, y - 44, 32, 18, 4, 'rgba(255,255,255,.7)'); }
            else { fr(bx, y - h, 54, h, 6, shade(c, -0.05)); fr(bx + 8, y - h + 14, 38, 24, 6, 'rgba(255,255,255,.75)'); fc(bx + 27, y - h + 26, 7, c); }
          }
          fr(800, y, 600, 16, 4, '#c9d5e0'); fr(800, y + 12, 600, 6, 3, '#ffd23f');
        });
      } },
    { id: 'freezer', x: 1455, y: 600, w: 250, h: 200,
      tap() { if (!canSpawn()) return true; spawnItem('icecream', rand(1500, 1660), 630, 'mercado'); Sfx.coin(); return true; },
      draw(s, t) {
        softShadow(1580, 800, 140);
        fr(1455, 640, 250, 158, 18, LG(0, 640, 0, 798, '#ffffff', '#dfe8f0'));
        fr(1470, 660, 220, 50, 10, '#4dabf7');
        X.font = '600 26px Fredoka, sans-serif'; X.textAlign = 'center'; X.fillStyle = '#fff'; X.fillText('Sorvetes', 1580, 694);
        fr(1460, 618, 240, 24, 10, 'rgba(200,235,255,.75)');
        for (let i = 0; i < 6; i++) fc(1490 + i * 36, 628, 9, ['#ffb3d1', '#9ee6c5', '#fff3c4'][i % 3]);
        fr(1462, 618, 240, 8, 4, 'rgba(255,255,255,.8)');
        for (let i = 0; i < 3; i++) { const y = 740 + ((t * 18 + i * 20) % 50); fe(1580 + (i - 1) * 60, y, 20, 3, 'rgba(255,255,255,.5)'); }
      } },
    { id: 'checkout', x: 1790, y: 520, w: 470, h: 280,
      dropRect: { x: 1790, y: 480, w: 330, h: 190 },
      drop(e) {
        if (e.kind !== 'item') return false;
        Sfx.beep(); setTimeout(() => Sfx.coin(), 140); emit('star', e.x, e.y - 60, 8);
        UI.toast(`Bip! ${ITEMS[e.type].n} — obrigado pela compra!`);
        return false;
      },
      tap(s, w) { if (w.x > 2140) { Sfx.coin(); emit('star', 2200, 560, 10); } else { Sfx.beep(); UI.toast('Solte produtos na esteira para passar no caixa'); } return true; },
      draw(s, t) {
        softShadow(2020, 800, 260);
        fr(1790, 650, 470, 148, 12, LG(0, 650, 0, 798, '#ff9f43', '#f07b1f'));
        fr(1806, 668, 300, 112, 10, '#ffb466');
        fr(1784, 628, 482, 22, 8, '#fffaf2');
        // esteira
        fr(1800, 616, 310, 18, 9, '#2f3241');
        for (let x = 1806 + ((t * 40) % 24); x < 2100; x += 24) line(x, 620, x, 630, 2, '#5b6474');
        // leitor
        fr(2060, 590, 40, 30, 6, '#3a3d58'); fr(2066, 596, 28, 8, 3, '#ff3b3b');
        // registradora
        fr(2140, 560, 110, 72, 12, '#5c7cfa'); fr(2150, 530, 90, 34, 8, '#3a50b8'); fr(2160, 536, 70, 18, 4, '#9fe8b0');
        X.font = '600 14px Fredoka, sans-serif'; X.textAlign = 'center'; X.fillStyle = '#1d6b3a'; X.fillText('R$ 0,00', 2195, 550);
        for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) fr(2154 + i * 30, 578 + j * 22, 24, 14, 4, '#e6ebff');
      } },
    { id: 'cart', x: 1100, y: 690, w: 170, h: 220, z: 901,
      tap() { Sfx.click(); UI.toast('O carrinho guarda o que você colocar dentro 🛒'); return true; },
      draw() {
        softShadow(1185, 905, 110);
        X.beginPath(); X.moveTo(1080, 690); X.lineTo(1100, 700); stroke(8, '#ff6b6b');
        X.beginPath(); X.moveTo(1100, 700); X.lineTo(1270, 700); X.lineTo(1250, 800); X.lineTo(1120, 800); X.closePath();
        X.fillStyle = 'rgba(200,215,230,.35)'; X.fill(); stroke(6, '#9aa6b2');
        for (let i = 1; i < 6; i++) line(1100 + i * 28, 704, 1118 + i * 22, 796, 3, 'rgba(120,140,160,.6)');
        for (let i = 1; i < 3; i++) line(1104 + i * 4, 700 + i * 33, 1266 - i * 7, 700 + i * 33, 3, 'rgba(120,140,160,.6)');
        line(1130, 800, 1130, 880, 6, '#9aa6b2'); line(1240, 800, 1240, 880, 6, '#9aa6b2'); line(1120, 870, 1250, 870, 6, '#9aa6b2');
        fc(1130, 892, 12, '#3a3d58'); fc(1240, 892, 12, '#3a3d58');
      } },
    makeTrash('trash', 2335),
  ],
  init() {
    return [
      I('milk', 860, 420), I('juice', 950, 420), I('cereal', 1300, 420),
      I('bread', 900, 560), I('croissant', 1260, 560), I('carrot', 1000, 700), I('egg', 1330, 700),
      I('apple', 200, 600), I('orange', 480, 600),
      I('banana', 1880, 640),
      C('Davi', 'mercado', 1950, 900),
    ];
  },
};

// ======================================================
//  ESCOLA
// ======================================================
const BOARD = ['hello', 'math', 'draw', 'abc'];
function makeDesk(id, x, col) {
  return {
    id, x: x - 100, y: 770, w: 200, h: 160, z: 931,
    draw() {
      softShadow(x, 930, 110);
      fr(x - 86, 790, 14, 140, 5, '#9aa6b2'); fr(x + 72, 790, 14, 140, 5, '#9aa6b2');
      fr(x - 96, 776, 192, 24, 8, LG(0, 776, 0, 800, '#f7c48a', '#d9985f'));
      fr(x - 80, 800, 160, 50, 8, col);
      fr(x - 60, 812, 120, 6, 3, 'rgba(255,255,255,.4)');
    },
  };
}
SCENES.escola = {
  id: 'escola', name: 'Escola', W: 2400, floorTop: 805, floorBot: 950, ceil: 260,
  surfaces: [
    { x1: 1180, x2: 1470, y: 640 },
    { x1: 1520, x2: 1690, y: 560 }, { x1: 1520, x2: 1690, y: 680 },
    { x1: 310, x2: 1090, y: 470 },
    { x1: 310, x2: 490, y: 776, z: 932 }, { x1: 610, x2: 790, y: 776, z: 932 }, { x1: 910, x2: 1090, y: 776, z: 932 },
  ],
  seats: [{ x: 400, y: 770, kind: 'chair' }, { x: 700, y: 770, kind: 'chair' }, { x: 1000, y: 770, kind: 'chair' }, { x: 1560, y: 842, kind: 'chair' }],
  bg(st, t) {
    wall(-1000, 3400, '#fff3c4', patDots());
    X.fillStyle = '#ffd88a'; X.fillRect(-1000, 600, 4400, 192);
    for (let x = -1000; x < 3400; x += 110) fr(x + 12, 616, 86, 160, 10, '#ffe3a8');
    fr(-1000, 592, 4400, 12, 0, '#f0b85a');
    ceilingTrim(-1000, 3400);
    baseboard(-1000, 3400, '#c98a55');
    floorWood(-1000, 3400, '#d9a066');
    // bandeirinhas ABC
    X.beginPath(); X.moveTo(100, 50); X.quadraticCurveTo(1200, 120, 2300, 50); stroke(2, '#9aa6b2');
    'ABCDEFGHIJKLMN'.split('').forEach((ch, i) => {
      const u = (i + 0.5) / 14, x = lerp(100, 2300, u), y = 50 + Math.sin(u * Math.PI) * 35;
      fpoly([x - 28, y, x + 28, y, x, y + 56], ['#ff6b6b', '#4dabf7', '#7ed957', '#ffd23f', '#a77bf3'][i % 5]);
      X.font = '600 24px Fredoka, sans-serif'; X.textAlign = 'center'; X.fillStyle = '#fff'; X.fillText(ch, x, y + 28);
    });
    drawWindow(1800, 170, 200, 230, { curtain: '#7ed957', seed: 70 });
    drawWindow(2130, 170, 200, 230, { curtain: '#7ed957', seed: 90 });
    clock(1560, 230, 46);
    frame(1200, 220, 170, 130, '#4dabf7', artCat);
    rug(700, 900, 420, 46, '#4dabf7', '#9fd3ff');
  },
  props: [
    makePendant('l1', 500, '#ff9f43'), makePendant('l2', 1100, '#ff9f43'), makePendant('l3', 1900, '#ff9f43'),
    { id: 'board', x: 290, y: 140, w: 820, h: 330, state: { d: 0 },
      tap(s) { s.d = (s.d + 1) % BOARD.length; Sfx.chalk(); emit('smoke', rand(400, 1000), rand(220, 400), 6); return true; },
      draw(s, t) {
        fr(290, 140, 820, 330, 18, '#b8763d'); fr(306, 156, 788, 298, 10, LG(306, 156, 1094, 454, '#2f6b54', '#244f41'));
        fr(300, 462, 800, 14, 6, '#a8703f'); fr(380, 452, 44, 10, 4, '#fff'); fr(440, 452, 30, 10, 4, '#ffd23f'); fr(860, 448, 70, 16, 5, '#ff9ec4');
        X.save(); RR(306, 156, 788, 298, 10); X.clip();
        X.fillStyle = 'rgba(255,255,255,.05)'; for (let i = 0; i < 6; i++) fe(400 + i * 130, 300 + (i % 2) * 60, 90, 30, 'rgba(255,255,255,.04)');
        const ch = '#f6f3e8';
        X.textAlign = 'center'; X.fillStyle = ch;
        const k = BOARD[s.d];
        if (k === 'hello') { X.font = '600 72px Fredoka, sans-serif'; X.fillText('Olá, Vila!', 700, 300); X.font = '400 30px Fredoka, sans-serif'; X.fillText('toque para mudar a lição', 700, 370); heartPath(1000, 230, 22); stroke(4, '#ff9ec4'); }
        else if (k === 'math') { X.font = '600 80px Fredoka, sans-serif'; X.fillText('2 + 2 = 4', 640, 330); starPath(960, 300, 40); stroke(4, '#ffd23f'); X.font = '400 28px Fredoka, sans-serif'; X.fillText('muito bem!', 960, 380); }
        else if (k === 'draw') {
          X.beginPath(); X.arc(460, 250, 40, 0, TAU); stroke(5, '#ffd23f');
          for (let i = 0; i < 8; i++) { const a = (i / 8) * TAU; line(460 + Math.cos(a) * 52, 250 + Math.sin(a) * 52, 460 + Math.cos(a) * 70, 250 + Math.sin(a) * 70, 4, '#ffd23f'); }
          X.beginPath(); X.moveTo(640, 420); X.lineTo(640, 310); X.lineTo(720, 240); X.lineTo(800, 310); X.lineTo(800, 420); X.closePath(); stroke(5, ch);
          X.beginPath(); X.rect(700, 360, 40, 60); stroke(4, ch);
          X.beginPath(); X.moveTo(320, 430); X.quadraticCurveTo(700, 400, 1080, 430); stroke(4, '#7ed957');
          for (let i = 0; i < 3; i++) { X.beginPath(); X.arc(900 + i * 60, 400, 12, 0, TAU); stroke(4, '#ff9ec4'); }
        } else { X.font = '600 90px Fredoka, sans-serif'; X.fillText('A  B  C', 700, 300); X.font = '400 34px Fredoka, sans-serif'; X.fillText('a   b   c', 700, 380); }
        X.restore();
      } },
    { id: 'teacher', x: 1170, y: 600, w: 310, h: 200,
      draw() {
        softShadow(1325, 800, 170);
        fr(1180, 650, 290, 146, 10, LG(0, 650, 0, 796, '#c98a55', '#a8703f'));
        fr(1196, 668, 120, 112, 8, '#d9985f'); fc(1256, 724, 6, '#7a4b2a');
        fr(1170, 630, 310, 22, 8, '#e0a46a');
      } },
    { id: 'globe', x: 1400, y: 520, w: 80, h: 120, state: { a: 0, v: 0.2 },
      tap(s) { s.v += 6; Sfx.whoosh(); return true; },
      update(s, dt) { s.a += s.v * dt; s.v = Math.max(0.2, s.v * Math.pow(0.4, dt)); },
      draw(s) {
        fe(1440, 636, 30, 6, '#a8703f'); fr(1436, 600, 8, 36, 3, '#a8703f');
        X.beginPath(); X.arc(1440, 566, 46, 2.3, 4.0); stroke(4, '#c9a24a');
        X.save(); X.beginPath(); X.arc(1440, 566, 38, 0, TAU); X.clip();
        fc(1440, 566, 38, '#4dabf7');
        for (let i = -1; i < 3; i++) { const x = 1440 + (((s.a * 30 + i * 50) % 150) + 150) % 150 - 75; fe(x, 556 + i * 6, 18, 12, '#7ed957', i); fe(x + 20, 584, 10, 8, '#7ed957'); }
        fc(1426, 552, 14, 'rgba(255,255,255,.25)');
        X.restore();
      } },
    { id: 'cubby', x: 0, y: 0, w: 0, h: 0,
      draw() {
        softShadow(1605, 800, 100);
        fr(1510, 440, 190, 356, 12, '#ffffff');
        [['#ff6b6b', '#4dabf7'], ['#7ed957', '#ffd23f'], ['#a77bf3', '#ff9f43']].forEach((r, j) => r.forEach((c, i) => fr(1522 + i * 90, 452 + j * 118 + (j ? 0 : 0), 76, j === 2 ? 100 : 96, 8, alpha(c, 0.25))));
        [560, 680].forEach((y) => fr(1510, y, 190, 12, 4, '#e6ebf0'));
      } },
    makeChair('chDesk1', 400, 770, '#ff6b6b'), makeChair('chDesk2', 700, 770, '#4dabf7'), makeChair('chDesk3', 1000, 770, '#7ed957'),
    makeDesk('desk1', 400, '#ff8a8a'), makeDesk('desk2', 700, '#6fbcf9'), makeDesk('desk3', 1000, '#95e073'),
    makeChair('chRead', 1560, 842, '#ffd23f', 1),
    { id: 'easel', x: 2180, y: 440, w: 200, h: 380, state: { p: 0 },
      tap(s) { s.p = (s.p + 1) % 4; Sfx.sparkle(); emit('confetti', 2280, 560, 12); return true; },
      draw(s) {
        softShadow(2280, 806, 100);
        line(2220, 806, 2260, 440, 10, '#a8703f'); line(2340, 806, 2300, 440, 10, '#a8703f'); line(2280, 806, 2280, 520, 8, '#8a5532');
        fr(2196, 470, 168, 190, 6, '#ffffff');
        X.save(); RR(2206, 480, 148, 170, 4); X.clip();
        if (s.p === 0) artHills(2206, 480, 148, 170);
        else if (s.p === 1) artCat(2206, 480, 148, 170);
        else if (s.p === 2) artAbstract(2206, 480, 148, 170);
        else { X.fillStyle = '#fff'; X.fillRect(2206, 480, 148, 170); for (let i = 0; i < 6; i++) { heartPath(2230 + (i % 3) * 50, 530 + ((i / 3) | 0) * 70, 16); X.fillStyle = ['#ff6b6b', '#ffd23f', '#4dabf7'][i % 3]; X.fill(); } }
        X.restore();
        fr(2190, 660, 180, 14, 5, '#a8703f');
        ['#ff6b6b', '#ffd23f', '#4dabf7', '#7ed957'].forEach((c, i) => fr(2206 + i * 22, 650, 14, 10, 3, c));
      } },
    makeTrash('trash', 140),
  ],
  init() {
    return [
      I('apple', 1220, 640), I('book', 1330, 640),
      I('book', 1560, 560), I('xylo', 1610, 680), I('plane', 450, 776), I('book', 980, 776),
      C('Iara', 'escola', 700, 770, { seat: 1 }), C('Luca', 'escola', 1900, 900),
    ];
  },
};

// ======================================================
//  PRAIA
// ======================================================
function palm(x, y, s) {
  X.save(); X.translate(x, y); X.scale(s, s);
  X.beginPath(); X.moveTo(-14, 0); X.quadraticCurveTo(-40, -200, 10, -400); X.lineTo(30, -396); X.quadraticCurveTo(-14, -200, 14, 0); X.closePath();
  X.fillStyle = LG(-20, 0, 30, 0, '#c98a55', '#a8703f'); X.fill();
  for (let i = 0; i < 9; i++) line(-20 + i * 2, -40 - i * 40, 14 + i * 2, -46 - i * 40, 3, 'rgba(0,0,0,.12)');
  const leaf = G.nightK > 0.5 ? '#2f6b4e' : '#4ea83c';
  [-2.6, -2.0, -1.2, -0.5, 0.2, -3.2].forEach((a, i) => {
    X.save(); X.translate(20, -400); X.rotate(a + Math.sin(G.t * 1.2 + i) * 0.04);
    X.beginPath(); X.moveTo(0, 0); X.quadraticCurveTo(80, -50, 170, 20); X.quadraticCurveTo(80, -14, 0, 0);
    X.fillStyle = i % 2 ? leaf : shade(leaf === '#4ea83c' ? '#4ea83c' : '#2f6b4e', 0.12); X.fill(); X.restore();
  });
  fc(10, -390, 14, '#7a4b2a'); fc(32, -392, 14, '#8a5532');
  X.restore();
}
SCENES.praia = {
  id: 'praia', name: 'Praia', W: 2600, floorTop: 815, floorBot: 950, ceil: -500, outdoor: true,
  surfaces: [
    { x1: 220, x2: 400, y: 470 },
    { x1: 1460, x2: 1790, y: 600 },
  ],
  seats: [{ x: 310, y: 452, kind: 'chair' }, { x: 790, y: 806, kind: 'chair' }, { x: 990, y: 806, kind: 'chair' }],
  // céu e nuvens a cada quadro; ilha, mar e areia no cache; ondas, barco e coqueiros por cima
  sky(st, t) { skyBg(t, 7); },
  bg() {
    const n = G.nightK;
    // ilha
    fe(1900, 600, 260, 50, n > 0.5 ? '#2c4a52' : '#9ad0a0');
    // mar
    X.fillStyle = LG(0, 590, 0, 800, n > 0.5 ? '#1d3f73' : '#5fd0f0', n > 0.5 ? '#14305c' : '#2a9fd6'); X.fillRect(-1000, 596, 5000, 210);
    // areia
    X.fillStyle = LG(0, 790, 0, 1250, '#f7e3b0', '#ecc985', '#e0b670'); X.fillRect(-1000, 790, 5000, 900);
    X.fillStyle = 'rgba(180,140,80,.25)'; X.fillRect(-1000, 790, 5000, 24);
    for (let i = 0; i < 120; i++) fc(srand(i + 400) * 2600, 830 + srand(i + 500) * 260, 2, 'rgba(160,120,60,.25)');
  },
  anim(st, t) {
    const n = G.nightK;
    // só a faixa visível das ondas (antes: 5000 de largura em todo quadro)
    const cx = G.cam.praia || 0, xa = Math.floor((cx - 120) / 120) * 120, xb = xa + VW + 360;
    // veleiro
    const bx = ((t * 14) % 3400) - 400;
    fpoly([bx, 590, bx + 90, 590, bx + 76, 610, bx + 14, 610], n > 0.5 ? '#3a3d58' : '#ffffff');
    fpoly([bx + 44, 586, bx + 44, 500, bx + 84, 586], n > 0.5 ? '#5b6474' : '#ff6b6b');
    for (let r = 0; r < 6; r++) {
      const y = 620 + r * 30;
      X.beginPath();
      for (let x = xa; x <= xb; x += 40) { const yy = y + Math.sin(x * 0.02 + t * (1 + r * 0.2) + r) * 4; x === xa ? X.moveTo(x, yy) : X.lineTo(x, yy); }
      stroke(3, `rgba(255,255,255,${0.12 + r * 0.03})`);
    }
    X.fillStyle = n > 0.5 ? 'rgba(255,246,208,.25)' : 'rgba(255,243,176,.35)';
    for (let i = 0; i < 6; i++) fe(n > 0.5 ? 700 : 2100, 620 + i * 26, 60 - i * 6 + Math.sin(t * 2 + i) * 10, 4, X.fillStyle);
    const sw = Math.sin(t * 0.9) * 8;
    X.beginPath(); X.moveTo(xa, 800 + sw);
    for (let x = xa; x <= xb; x += 60) X.quadraticCurveTo(x + 30, 812 + sw + Math.sin(x * 0.05 + t * 2) * 4, x + 60, 800 + sw);
    X.lineTo(xb + 60, 790); X.lineTo(xa, 790); X.closePath(); X.fillStyle = 'rgba(255,255,255,.75)'; X.fill();
    palm(1300, 815, 0.95); palm(2480, 815, 1.05);
    if (Math.random() < 0.004) Sfx.wave();
  },
  props: [
    { id: 'tower', x: 200, y: 360, w: 220, h: 450, state: {},
      tap() { Sfx.bell(); UI.toast('Salva-vidas de plantão! 🛟'); return true; },
      draw() {
        softShadow(310, 816, 140);
        line(230, 816, 250, 480, 12, '#ffffff'); line(390, 816, 370, 480, 12, '#ffffff');
        line(236, 700, 384, 600, 7, '#e6ebf0'); line(384, 700, 236, 600, 7, '#e6ebf0');
        fr(210, 466, 200, 22, 8, '#ff6b6b');
        fr(250, 360, 120, 92, 18, '#ffffff'); fr(260, 372, 100, 60, 12, '#ff6b6b'); fr(272, 384, 76, 10, 5, '#ffffff');
        X.beginPath(); X.arc(310, 360, 0, 0, 0);
        fc(410, 560, 30, '#ff6b6b'); fc(410, 560, 16, '#f7e3b0'); for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + 0.78; fr(410 + Math.cos(a) * 23 - 6, 560 + Math.sin(a) * 23 - 6, 12, 12, 3, '#ffffff'); }
      } },
    { id: 'umbrella', x: 680, y: 330, w: 360, h: 140, state: { spin: 0 },
      tap(s) { s.spin = 1; Sfx.whoosh(); return true; },
      update(s, dt) { s.spin = Math.max(0, s.spin - dt); },
      draw(s) {
        X.save(); X.translate(0, 900); X.scale(1, 0.14);
        fr(740, -260, 300, 520, 60, '#4dabf7'); for (let i = 0; i < 5; i++) fr(740 + i * 60, -260, 30, 520, 0, 'rgba(255,255,255,.5)');
        X.restore();
        line(890, 380, 880, 830, 8, '#ffffff');
        const w = Math.sin(s.spin * 20) * 6 * s.spin;
        for (let i = 0; i < 8; i++) {
          const a0 = Math.PI + (i / 8) * Math.PI, a1 = Math.PI + ((i + 1) / 8) * Math.PI;
          X.beginPath(); X.moveTo(890, 340 + w); X.lineTo(890 + Math.cos(a0) * 190, 440 + Math.sin(a0) * 10); X.quadraticCurveTo(890 + Math.cos((a0 + a1) / 2) * 170, 460, 890 + Math.cos(a1) * 190, 440 + Math.sin(a1) * 10); X.closePath();
          X.fillStyle = i % 2 ? '#ffffff' : '#ff9f43'; X.fill();
        }
        fc(890, 336 + w, 8, '#ff9f43');
        // espreguiçadeiras
        [790, 990].forEach((x, i) => {
          const c = i ? '#7ed957' : '#ff7eb6';
          line(x - 60, 830, x - 50, 806, 6, '#c9d5e0'); line(x + 60, 830, x + 50, 806, 6, '#c9d5e0');
          fr(x - 66, 796, 132, 20, 8, c);
          X.save(); X.translate(x, 800); X.rotate(-0.2); fr(-56, -130, 112, 134, 18, shade(c, 0.1)); for (let k = 0; k < 4; k++) fr(-56, -120 + k * 34, 112, 12, 0, 'rgba(255,255,255,.35)'); X.restore();
        });
      } },
    { id: 'castle', x: 1110, y: 690, w: 180, h: 130,
      tap() { Sfx.sparkle(); emit('star', 1200, 700, 10); UI.toast('Que castelo lindo! 🏰'); return true; },
      draw(s, t) {
        softShadow(1200, 822, 100);
        const sand = '#e8c27a', d = '#d4a85c';
        fr(1120, 760, 160, 60, 10, sand); fr(1130, 720, 40, 50, 6, d); fr(1230, 720, 40, 50, 6, d); fr(1170, 690, 60, 80, 6, sand);
        for (const x of [1130, 1230]) for (let i = 0; i < 3; i++) fr(x + i * 14, 710, 10, 12, 2, d);
        for (let i = 0; i < 4; i++) fr(1172 + i * 15, 680, 10, 12, 2, sand);
        fr(1190, 740, 20, 30, 10, '#a07a3c');
        line(1200, 680, 1200, 630, 3, '#7a4b2a'); fpoly([1200, 630, 1236 + Math.sin(t * 6) * 4, 642, 1200, 654], '#ff6b6b');
      } },
    { id: 'kiosk', x: 1440, y: 340, w: 370, h: 460,
      tap() { if (!canSpawn()) return true; const it = spawnItem('coconut', rand(1500, 1760), 600, 'praia'); it.level = 1; Sfx.coin(); return true; },
      light() { return { x: 1625, y: 470, r: 360 }; },
      draw(s, t) {
        softShadow(1625, 816, 210);
        line(1470, 816, 1470, 420, 12, '#a8703f'); line(1780, 816, 1780, 420, 12, '#a8703f');
        fr(1450, 610, 350, 200, 14, LG(0, 610, 0, 810, '#c98a55', '#a8703f'));
        for (let i = 0; i < 7; i++) fr(1462 + i * 48, 626, 38, 170, 6, i % 2 ? '#b8804f' : '#c48b56');
        fr(1440, 592, 370, 22, 8, '#e0a46a');
        // telhado de palha
        X.beginPath(); X.moveTo(1410, 450); X.lineTo(1625, 340); X.lineTo(1840, 450); X.closePath(); X.fillStyle = '#e8c27a'; X.fill();
        for (let i = 0; i < 18; i++) { const x = 1416 + i * 24; line(x, 452, x + Math.sin(t * 2 + i) * 3, 482, 8, i % 2 ? '#d9ae62' : '#e8c27a'); }
        fr(1530, 486, 190, 50, 14, '#2ec4b6');
        X.font = '600 30px Fredoka, sans-serif'; X.textAlign = 'center'; X.fillStyle = '#fff'; X.fillText('Água de coco', 1625, 520);
        [1500, 1750].forEach((x) => { line(x, 482, x, 500, 2, '#7a4b2a'); fc(x, 512, 12, G.nightK > 0.05 ? '#fff3b0' : '#ffd23f'); });
      } },
    { id: 'fire', x: 1980, y: 700, w: 160, h: 140, z: 840, state: { on: false },
      tap(s) { s.on = !s.on; Sfx.click(); if (s.on) emit('star', 2060, 780, 10); return true; },
      light(s) { return s.on ? { x: 2060, y: 760, r: 420, col: '#ff9a3c' } : null; },
      update(s, dt) { if (s.on && Math.random() < dt * 6) emit('smoke', 2060 + rand(-10, 10), 720, 1); },
      draw(s, t) {
        softShadow(2060, 840, 90);
        for (let i = 0; i < 6; i++) { const a = (i / 6) * TAU; fe(2060 + Math.cos(a) * 54, 830 + Math.sin(a) * 10, 18, 12, '#9aa6b2'); }
        X.save(); X.translate(2060, 820); X.rotate(0.3); fr(-60, -9, 120, 18, 9, '#8a5532'); X.restore();
        X.save(); X.translate(2060, 820); X.rotate(-0.3); fr(-60, -9, 120, 18, 9, '#7a4b2a'); X.restore();
        if (s.on) {
          for (let i = 0; i < 3; i++) {
            const h = 70 + Math.sin(t * 14 + i * 2) * 14 - i * 16, w = 30 - i * 7, c = ['#ff6a2a', '#ffb347', '#fff3b0'][i];
            X.beginPath(); X.moveTo(2060 - w, 815); X.quadraticCurveTo(2060 - w, 815 - h * 0.5, 2060 + Math.sin(t * 9) * 6, 815 - h); X.quadraticCurveTo(2060 + w, 815 - h * 0.5, 2060 + w, 815); X.closePath(); X.fillStyle = c; X.fill();
          }
        }
      } },
    { id: 'board', x: 2240, y: 560, w: 90, h: 260,
      tap() { Sfx.wave(); UI.toast('Bora surfar! 🏄'); return true; },
      draw() {
        softShadow(2285, 820, 50);
        X.save(); X.translate(2285, 820); X.rotate(0.12);
        fe(0, -130, 40, 140, LG(-40, 0, 40, 0, '#ffd23f', '#ff9f43'));
        fr(-6, -260, 12, 260, 6, '#ff6b6b');
        X.restore();
      } },
    { id: 'sea', x: 0, y: 0, w: 0, h: 0,
      dropRect: { x: -1000, y: 590, w: 5000, h: 170 },
      drop(e, s, w) {
        if (findSeat(e, SCENES.praia)) return false;
        emit('drop', w.x, 790, 14, 1); Sfx.splash(); return false;
      } },
  ],
  init() {
    return [
      I('shell', 600, 900), I('starfish', 1450, 920), I('bucket', 1080, 880), I('crab', 1700, 900),
      I('ball', 500, 880), I('coconut', 1560, 600), I('watermelon', 1700, 600),
      C('Rui', 'praia', 310, 452, { seat: 0 }), C('Bia', 'praia', 990, 806, { seat: 2 }),
    ];
  },
};

SCENE_ORDER.length = 0;
SCENE_ORDER.push('casa', 'cafe', 'mercado', 'escola', 'estudio', 'praia', 'parque');
