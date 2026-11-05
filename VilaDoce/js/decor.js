'use strict';
// ======================================================
//  Decoração: móveis colocáveis, paredes/pisos por cômodo e o Apartamento
// ======================================================
const WALLC = ['#ffe2d0', '#d3efe5', '#e6dffc', '#fff3c4', '#ffe0ec', '#dff1ff', '#ffffff', '#f3e3d3', '#cfe8c8', '#ffd6a5', '#c5d3ff', '#3a3f5c'];
const FLOORC = ['#d9a066', '#e7b98a', '#b07547', '#8a5532', '#f4efe6', '#c9d5e0', '#ffd0de', '#cfe8ff', '#d6efc4', '#fff1b8', '#a77bf3', '#5b6474'];
const WALL_PATS = [['', 'Liso'], ['dots', 'Bolinhas'], ['stripes', 'Listras'], ['diamond', 'Losangos'], ['brick', 'Tijolinho'], ['stars', 'Estrelas']];
const FLOOR_TYPES = [['wood', 'Madeira'], ['tiles', 'Ladrilho'], ['checker', 'Xadrez'], ['carpet', 'Carpete']];

function patStars() {
  return pat('stars', 90, 90, () => { starPath(22, 22, 8); X.fillStyle = 'rgba(255,255,255,.55)'; X.fill(); starPath(67, 67, 6); X.fill(); });
}
function wallPat(k) { return { dots: patDots, stripes: patStripes, diamond: patDiamond, brick: patBrick, stars: patStars }[k]?.() || null; }
function drawRoomWalls(sc, st) {
  sc.rooms.forEach((r, i) => { const s = st.rooms[i]; wall(r.x1, r.x2, s.wall, wallPat(s.pat)); });
}
function drawRoomFloors(sc, st) {
  sc.rooms.forEach((r, i) => {
    const s = st.rooms[i], c = s.fc;
    if (s.floor === 'wood') floorWood(r.x1, r.x2, c);
    else if (s.floor === 'tiles') floorTiles(r.x1, r.x2, c, shade(c, -0.09), 90);
    else if (s.floor === 'checker') floorTiles(r.x1, r.x2, shade(c, 0.55), shade(c, -0.3), 80);
    else {
      X.fillStyle = LG(0, 794, 0, 1250, shade(c, 0.05), shade(c, -0.08)); X.fillRect(r.x1, 794, r.x2 - r.x1, 900);
      for (let k = 0; k < 160; k++) fc(r.x1 + srand(k + i * 99) * (r.x2 - r.x1), 800 + srand(k + 7) * 400, 2, 'rgba(255,255,255,.18)');
      X.fillStyle = LG(0, 794, 0, 840, 'rgba(0,0,0,.14)', 'rgba(0,0,0,0)'); X.fillRect(r.x1, 794, r.x2 - r.x1, 46);
    }
  });
}
function roomAt(sc, x) { return Math.max(0, sc.rooms.findIndex((r) => x >= r.x1 && x < r.x2)); }

// ---------- Móveis e enfeites ----------
const dcol = (it, T) => T.cols[(it.v || 0) % T.cols.length];
const SOFT = ['#ff7eb6', '#5c7cfa', '#7ed957', '#ffd23f', '#a77bf3', '#ff9f43', '#2ec4b6', '#5b6474'];
const WOOD = ['#c98a55', '#e0a46a', '#8a5532', '#ffffff', '#ff9ec4', '#9fd3ff'];
Object.assign(ITEMS, {
  armchair: { n: 'Poltrona', decor: 1, w: 180, h: 175, cols: SOFT, seat: { dx: 0, dy: -90, kind: 'chair' }, draw(it) {
    const c = dcol(it, this);
    fr(-78, -172, 156, 112, 40, LG(0, -172, 0, -60, shade(c, 0.14), c));
    fr(-60, -156, 120, 40, 18, 'rgba(255,255,255,.14)');
    fr(-92, -112, 40, 100, 20, shade(c, -0.1)); fr(52, -112, 40, 100, 20, shade(c, -0.1));
    fr(-62, -96, 124, 30, 14, shade(c, 0.1));
    fr(-84, -70, 168, 60, 18, c);
    fr(-74, -12, 14, 12, 4, '#7a4b2a'); fr(60, -12, 14, 12, 4, '#7a4b2a');
  } },
  beanbag: { n: 'Pufe', decor: 1, w: 150, h: 110, cols: SOFT, seat: { dx: 0, dy: -62, kind: 'chair' }, draw(it) {
    const c = dcol(it, this);
    X.beginPath(); X.moveTo(-70, 0); X.bezierCurveTo(-90, -70, -50, -110, 0, -104); X.bezierCurveTo(50, -110, 90, -70, 70, 0); X.closePath();
    X.fillStyle = RG(-20, -70, 10, 110, shade(c, 0.2), c, shade(c, -0.15)); X.fill();
    fe(0, -66, 46, 14, 'rgba(0,0,0,.08)');
  } },
  bed: { n: 'Cama', decor: 1, w: 390, h: 170, cols: ['#ff9f43', '#7ed957', '#4dabf7', '#ff7eb6', '#a77bf3', '#ffd23f'], seat: { dx: 0, dy: -80, kind: 'bed' }, surf: [{ x1: -180, x2: 180, y: -80 }], draw(it) {
    const c = dcol(it, this);
    fr(-196, -176, 30, 172, 12, '#c98a55'); fr(170, -130, 26, 126, 12, '#c98a55');
    fr(-186, -84, 372, 46, 14, '#ffffff');
    fr(-190, -46, 380, 36, 10, shade('#c98a55', -0.08));
    fr(-182, -12, 16, 12, 4, '#8a5532'); fr(166, -12, 16, 12, 4, '#8a5532');
    fr(-176, -114, 84, 40, 18, '#fff6e8');
    fr(-80, -96, 262, 56, 22, LG(0, -96, 0, -40, shade(c, 0.12), c));
    for (let i = 0; i < 4; i++) fc(-50 + i * 64, -70, 8, 'rgba(255,255,255,.4)');
  } },
  sidetable: { n: 'Mesinha', decor: 1, w: 140, h: 120, cols: WOOD, surf: [{ x1: -62, x2: 62, y: -114 }], draw(it) {
    const c = dcol(it, this);
    fr(-50, -100, 12, 100, 5, shade(c, -0.25)); fr(38, -100, 12, 100, 5, shade(c, -0.25));
    fr(-48, -96, 96, 40, 8, shade(c, -0.08)); fc(0, -76, 5, shade(c, -0.35));
    fr(-66, -118, 132, 20, 8, LG(0, -118, 0, -98, shade(c, 0.12), c));
  } },
  bookshelf: { n: 'Estante', decor: 1, w: 180, h: 300, cols: WOOD, surf: [{ x1: -78, x2: 78, y: -296 }, { x1: -70, x2: 70, y: -160 }], draw(it) {
    const c = dcol(it, this);
    fr(-84, -296, 168, 296, 10, LG(-84, 0, 84, 0, shade(c, 0.08), shade(c, -0.12)));
    fr(-72, -284, 144, 272, 6, shade(c, -0.35));
    [-160, -76].forEach((y) => fr(-76, y, 152, 12, 3, c));
    const bc = ['#ff6b6b', '#4dabf7', '#ffd23f', '#7ed957', '#a77bf3', '#ff9f43'];
    for (let i = 0; i < 8; i++) fr(-66 + i * 17, -76 - 56 - (i % 3) * 6, 14, 56 + (i % 3) * 6, 3, bc[i % 6]);
    for (let i = 0; i < 6; i++) fr(-62 + i * 22, -12 - 50, 18, 50, 3, bc[(i + 2) % 6]);
  } },
  plantbig: { n: 'Planta grande', decor: 1, w: 130, h: 230, cols: ['#ff9b6a', '#4dabf7', '#ffffff', '#ffd23f', '#a77bf3'], draw(it) { pottedPlant(0, 0, 1, dcol(it, this)); } },
  cactus: { n: 'Cacto', decor: 1, w: 90, h: 150, cols: ['#ff9b6a', '#ffffff', '#ff7eb6', '#4dabf7'], draw(it) {
    fr(-16, -140, 32, 110, 16, '#5fbf4a'); fr(-46, -110, 22, 50, 11, '#5fbf4a'); fr(24, -120, 22, 54, 11, '#5fbf4a');
    fr(-40, -70, 30, 14, 7, '#5fbf4a'); fr(10, -76, 30, 14, 7, '#5fbf4a');
    fc(0, -146, 9, '#ff7eb6');
    fpoly([-30, -40, 30, -40, 22, 0, -22, 0], dcol(it, this)); fr(-34, -46, 68, 12, 5, shade(dcol(it, this), 0.1));
  } },
  floorlamp: { n: 'Luminária', decor: 1, w: 120, h: 330, cols: ['#ffd23f', '#ff9ec4', '#9fd3ff', '#ffffff', '#7ed957'], light: { dx: 0, dy: -290, r: 440 },
    tap(it) { it.off = !it.off; Sfx.click(); },
    draw(it) {
      const c = dcol(it, this), on = !it.off;
      fe(0, -6, 38, 9, '#3a3d58'); fr(-5, -300, 10, 296, 5, '#3a3d58');
      lampGlow(0, -290, on && G.nightK > 0.05);
      fpoly([-38, -360, 38, -360, 60, -284, -60, -284], on ? LG(0, -360, 0, -284, '#fff4c2', c) : shade(c, -0.2));
      fe(0, -284, 60, 7, on ? '#fff7d6' : shade(c, -0.3));
    } },
  rugRound: { n: 'Tapete redondo', decor: 1, flat: 1, w: 320, h: 56, cols: ['#ff8fb8', '#4dabf7', '#7ed957', '#ffd23f', '#a77bf3'], draw(it) {
    const c = dcol(it, this); fe(0, -24, 156, 26, c); fe(0, -24, 118, 19, shade(c, 0.35)); fe(0, -24, 80, 13, c);
  } },
  rugRect: { n: 'Tapete', decor: 1, flat: 1, w: 380, h: 64, cols: ['#ff9f43', '#2ec4b6', '#5c7cfa', '#ff7eb6'], draw(it) {
    const c = dcol(it, this);
    fpoly([-150, -54, 150, -54, 180, 0, -180, 0], c);
    for (let i = 0; i < 5; i++) { const y = -48 + i * 10; fpoly([-150 - i * 6, y, 150 + i * 6, y, 152 + i * 6, y + 4, -152 - i * 6, y + 4], 'rgba(255,255,255,.35)'); }
  } },
  painting: { n: 'Quadro', decor: 1, wall: 1, w: 180, h: 160, cols: ['#ff9f43', '#4dabf7', '#7ed957', '#ff7eb6', '#ffd23f', '#a77bf3'], draw(it) {
    frame(-80, -150, 160, 140, dcol(it, this), [artHills, artCat, artAbstract][(it.v || 0) % 3]);
  } },
  poster: { n: 'Pôster', decor: 1, wall: 1, w: 130, h: 180, cols: ['#a77bf3', '#ff6b6b', '#2ec4b6', '#ff9f43'], draw(it) {
    const c = dcol(it, this);
    fr(-58, -170, 116, 164, 6, c); fr(-50, -162, 100, 148, 4, shade(c, 0.3));
    starPath(0, -104, 34); X.fillStyle = '#fff'; X.fill();
    X.font = '600 18px Fredoka, sans-serif'; X.textAlign = 'center'; X.fillStyle = c; X.fillText('Vila Doce', 0, -36);
    fc(0, -164, 5, '#ff5d5d');
  } },
  wallshelf: { n: 'Prateleira', decor: 1, wall: 1, w: 210, h: 40, cols: WOOD, surf: [{ x1: -96, x2: 96, y: -18 }], draw(it) {
    const c = dcol(it, this);
    fr(-100, -20, 200, 16, 6, LG(0, -20, 0, -4, shade(c, 0.1), shade(c, -0.1)));
    fpoly([-70, -4, -50, -4, -70, 18], shade(c, -0.25)); fpoly([70, -4, 50, -4, 70, 18], shade(c, -0.25));
  } },
  wallclock: { n: 'Relógio', decor: 1, wall: 1, w: 120, h: 130, draw() { clock(0, -64, 46); } },
  garland: { n: 'Varal de bandeiras', decor: 1, wall: 1, w: 360, h: 90, draw() {
    X.beginPath(); X.moveTo(-170, -80); X.quadraticCurveTo(0, -20, 170, -80); stroke(2, '#9aa0aa');
    for (let i = 0; i < 7; i++) {
      const u = (i + 0.5) / 7, x = lerp(-170, 170, u), y = -80 + Math.sin(u * Math.PI) * 30;
      fpoly([x - 20, y, x + 20, y, x, y + 38], ['#ff6b6b', '#ffd23f', '#4dabf7', '#7ed957', '#a77bf3'][i % 5]);
    }
  } },
  aquarium: { n: 'Aquário', decor: 1, w: 170, h: 130, tap(it) { emit('smoke', it.x, it.y - 90, 4); Sfx.splash(); }, draw() {
    const t = G.t;
    fr(-80, -16, 160, 16, 5, '#3a3d58');
    fr(-76, -124, 152, 110, 10, 'rgba(160,220,255,.55)');
    fr(-72, -108, 144, 92, 6, LG(0, -108, 0, -16, '#7fd0ff', '#2a9fd6'));
    fe(0, -20, 70, 8, '#f4dfac');
    for (let i = 0; i < 3; i++) { X.beginPath(); X.moveTo(-50 + i * 40, -18); X.quadraticCurveTo(-60 + i * 40 + Math.sin(t * 2 + i) * 8, -50, -50 + i * 40, -80); stroke(5, '#4ea83c'); }
    for (let i = 0; i < 3; i++) {
      const fx = Math.sin(t * (0.8 + i * 0.3) + i * 2) * 52, fy = -50 - i * 16, dir = Math.cos(t * (0.8 + i * 0.3) + i * 2) > 0 ? 1 : -1;
      X.save(); X.translate(fx, fy); X.scale(dir, 1);
      fe(0, 0, 12, 8, ['#ff9f43', '#ff6b6b', '#ffd23f'][i]); fpoly([-10, 0, -20, -7, -20, 7], ['#ff9f43', '#ff6b6b', '#ffd23f'][i]); fc(6, -2, 2, '#2a1d1a');
      X.restore();
    }
    fpoly([-72, -108, -40, -108, -72, -60], 'rgba(255,255,255,.25)');
  } },
  toybox: { n: 'Baú de brinquedos', decor: 1, w: 160, h: 110, cols: ['#4dabf7', '#ff6b6b', '#7ed957', '#a77bf3'], surf: [{ x1: -72, x2: 72, y: -104 }], draw(it) {
    const c = dcol(it, this);
    fr(-74, -90, 148, 90, 12, LG(0, -90, 0, 0, shade(c, 0.1), shade(c, -0.1)));
    fr(-78, -108, 156, 24, 10, shade(c, -0.15));
    starPath(-36, -46, 14); X.fillStyle = '#ffd23f'; X.fill(); heartPath(0, -42, 13); X.fillStyle = '#ff7eb6'; X.fill(); fc(36, -46, 12, '#ffffff');
  } },
  petbed: { n: 'Caminha de pet', decor: 1, petbed: 1, w: 160, h: 56, cols: ['#ff7eb6', '#4dabf7', '#7ed957', '#ffd23f'], surf: [{ x1: -62, x2: 62, y: -20 }], draw(it) {
    const c = dcol(it, this);
    fe(0, -24, 76, 26, shade(c, -0.12)); fe(0, -26, 58, 16, '#fff6e8'); fe(0, -10, 76, 14, c);
    for (let i = 0; i < 4; i++) fc(-45 + i * 30, -10, 4, 'rgba(255,255,255,.5)');
  } },
});
const DECOR_LIST = ['armchair', 'beanbag', 'bed', 'sidetable', 'bookshelf', 'toybox', 'plantbig', 'cactus', 'floorlamp', 'rugRound', 'rugRect', 'painting', 'poster', 'wallshelf', 'wallclock', 'garland', 'aquarium', 'petbed'];

// ---------- Casa com cômodos personalizáveis ----------
SCENES.casa.rooms = [
  { x1: -1000, x2: 945, name: 'Cozinha', wall: '#d3efe5', pat: 'stripes', floor: 'tiles', fc: '#f4efe6' },
  { x1: 945, x2: 1855, name: 'Sala', wall: '#ffe2d0', pat: 'dots', floor: 'wood', fc: '#d9a066' },
  { x1: 1855, x2: 3700, name: 'Quarto', wall: '#e6dffc', pat: 'stripes', floor: 'wood', fc: '#e7b98a' },
];

// ======================================================
//  APARTAMENTO (para decorar do zero)
// ======================================================
SCENES.apto = {
  id: 'apto', name: 'Apartamento', W: 2000, floorTop: 805, floorBot: 950, ceil: 260,
  rooms: [
    { x1: -1000, x2: 1000, name: 'Sala', wall: '#dff1ff', pat: '', floor: 'wood', fc: '#e7b98a' },
    { x1: 1000, x2: 3000, name: 'Quarto', wall: '#fff3c4', pat: 'stars', floor: 'carpet', fc: '#cfe8ff' },
  ],
  surfaces: [],
  seats: [],
  bg(st, t) {
    drawRoomWalls(this, st);
    ceilingTrim(-1000, 3000);
    baseboard(-1000, 3000);
    drawRoomFloors(this, st);
    pillar(1000);
    // porta
    fr(70, 400, 170, 396, 10, '#ffffff'); fr(84, 414, 142, 382, 6, '#c98a55');
    fr(98, 430, 114, 150, 8, '#d9a066'); fr(98, 600, 114, 170, 8, '#d9a066'); fc(206, 600, 8, '#ffd23f');
    drawWindow(380, 170, 380, 260, { curtain: '#ff9ec4', seed: 120 });
    drawWindow(1420, 180, 240, 220, { seed: 140 });
  },
  props: [
    makePendant('l1', 560, '#5c7cfa'), makePendant('l2', 1500, '#ffd23f'),
    { id: 'tip', x: 1100, y: 450, w: 260, h: 140,
      tap() { Sfx.sparkle(); UI.toast('Toque no rolo de pintura (🖌️) lá em cima para decorar!'); return true; },
      draw(s, t) {
        fr(1110, 470, 240, 110, 18, 'rgba(255,255,255,.75)');
        X.font = '600 26px Fredoka, sans-serif'; X.textAlign = 'center'; X.fillStyle = '#c45b8f';
        X.fillText('Lar, doce lar', 1230, 515);
        X.font = '400 18px Fredoka, sans-serif'; X.fillStyle = '#8b809a'; X.fillText('decore do seu jeito ✨', 1230, 548);
      } },
    makeTrash('trash', 1920),
  ],
  init() {
    return [
      I('rugRound', 560, 900), I('armchair', 460, 830, { v: 1 }), I('plantbig', 820, 830), I('sidetable', 650, 830),
      I('bed', 1500, 830, { v: 3 }), I('wallclock', 1230, 380), I('petbed', 1150, 900),
      P('cat', 'Luna', 1200, 905, { col: '#3a3d58' }),
      C('Maya', 'apto', 300, 900),
    ];
  },
};

SCENE_ORDER.length = 0;
SCENE_ORDER.push('casa', 'apto', 'cafe', 'mercado', 'escola', 'estudio', 'petshop', 'praia', 'parque');
