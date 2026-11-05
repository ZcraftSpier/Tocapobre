'use strict';
// ======================================================
//  Cenários: arte de fundo, móveis interativos, superfícies e assentos
// ======================================================
const SCENES = {};
const SCENE_ORDER = ['casa', 'cafe', 'estudio', 'parque'];

// ---------- Arte compartilhada ----------
function patDots() { return pat('dots', 70, 70, () => { fc(17, 17, 6, 'rgba(255,255,255,.5)'); fc(52, 52, 6, 'rgba(255,255,255,.5)'); }); }
function patStripes() { return pat('stripes', 90, 10, () => { fr(0, 0, 45, 10, 0, 'rgba(255,255,255,.32)'); }); }
function patTiles() {
  return pat('tiles', 48, 48, () => {
    X.fillStyle = '#fbfdfd'; X.fillRect(0, 0, 48, 48);
    X.fillStyle = 'rgba(120,170,170,.25)'; X.fillRect(0, 0, 48, 2); X.fillRect(0, 0, 2, 48);
    X.fillStyle = 'rgba(255,255,255,.9)'; X.fillRect(6, 6, 14, 4);
  });
}
function patDiamond() {
  return pat('diamond', 60, 60, () => {
    fpoly([30, 8, 52, 30, 30, 52, 8, 30], 'rgba(255,255,255,.35)');
    fc(0, 0, 3, 'rgba(255,215,120,.7)'); fc(60, 0, 3, 'rgba(255,215,120,.7)'); fc(0, 60, 3, 'rgba(255,215,120,.7)'); fc(60, 60, 3, 'rgba(255,215,120,.7)');
  });
}
function patBrick() {
  return pat('brick', 120, 60, () => {
    X.fillStyle = 'rgba(0,0,0,.08)';
    X.fillRect(0, 28, 120, 4); X.fillRect(0, 58, 120, 2);
    X.fillRect(58, 0, 4, 30); X.fillRect(0, 30, 3, 30); X.fillRect(118, 30, 2, 30);
  });
}

function wall(x1, x2, base, p) {
  X.fillStyle = base; X.fillRect(x1, -1400, x2 - x1, 2192);
  if (p) { X.fillStyle = p; X.fillRect(x1, -1400, x2 - x1, 2192); }
  X.fillStyle = LG(0, 0, 0, 790, 'rgba(255,255,255,.16)', 'rgba(0,0,0,.05)');
  X.fillRect(x1, -1400, x2 - x1, 2192);
}
function baseboard(x1, x2, col = '#ffffff') {
  fr(x1, 770, x2 - x1, 26, 0, col);
  X.fillStyle = 'rgba(0,0,0,.06)'; X.fillRect(x1, 790, x2 - x1, 6);
  X.fillStyle = 'rgba(255,255,255,.6)'; X.fillRect(x1, 770, x2 - x1, 3);
}
function ceilingTrim(x1, x2) { fr(x1, 22, x2 - x1, 16, 0, '#ffffff'); X.fillStyle = 'rgba(0,0,0,.05)'; X.fillRect(x1, 38, x2 - x1, 6); }
function persp(x, y, vx) { return vx + (x - vx) * (1 + (y - 794) / 420); }
function floorWood(x1, x2, base) {
  X.fillStyle = LG(0, 794, 0, 1250, shade(base, 0.06), shade(base, -0.1)); X.fillRect(x1, 794, x2 - x1, 900);
  const vx = (x1 + x2) / 2;
  let y = 796, h = 13, row = 0;
  X.save(); X.beginPath(); X.rect(x1, 794, x2 - x1, 900); X.clip();
  while (y < 1350) {
    line(x1 - 200, y, x2 + 200, y, 2, shade(base, -0.16));
    const off = (row * 137) % 240;
    for (let x = x1 - 400 - off; x < x2 + 400; x += 240) {
      const a = persp(x, y, vx), b = persp(x, y + h, vx);
      line(a, y, b, y + h, 2, shade(base, -0.14));
    }
    y += h; h *= 1.17; row++;
  }
  X.restore();
  X.fillStyle = LG(0, 794, 0, 840, 'rgba(0,0,0,.14)', 'rgba(0,0,0,0)'); X.fillRect(x1, 794, x2 - x1, 46);
}
function floorTiles(x1, x2, c1, c2, size = 80) {
  X.fillStyle = c1; X.fillRect(x1, 794, x2 - x1, 900);
  const vx = (x1 + x2) / 2;
  X.save(); X.beginPath(); X.rect(x1, 794, x2 - x1, 900); X.clip();
  let y = 794, h = 16, row = 0;
  while (y < 1350) {
    for (let i = Math.floor((x1 - 600 - vx) / size); i * size + vx < x2 + 600; i++) {
      if ((i + row) % 2) continue;
      const xa = vx + i * size, xb = xa + size;
      fpoly([persp(xa, y, vx), y, persp(xb, y, vx), y, persp(xb, y + h, vx), y + h, persp(xa, y + h, vx), y + h], c2);
    }
    y += h; h *= 1.2; row++;
  }
  X.restore();
  X.fillStyle = LG(0, 794, 0, 840, 'rgba(0,0,0,.14)', 'rgba(0,0,0,0)'); X.fillRect(x1, 794, x2 - x1, 46);
}
function floorGrass(x1, x2) {
  X.fillStyle = LG(0, 780, 0, 1250, '#9ee07a', '#6cc04f', '#58a83f'); X.fillRect(x1, 780, x2 - x1, 900);
  X.save(); X.translate(0, 880); X.scale(1, 0.12);
  X.fillStyle = '#f4dfac'; X.beginPath(); X.ellipse((x1 + x2) / 2, 0, (x2 - x1) * 0.62, 520, 0, 0, TAU); X.fill();
  X.restore();
  for (let i = 0; i < 90; i++) {
    const x = x1 + srand(i) * (x2 - x1), y = 800 + srand(i + 9) * 260;
    if (Math.abs(y - 880) < 40) continue;
    line(x, y, x - 4, y - 14, 3, 'rgba(60,140,50,.45)'); line(x + 5, y, x + 7, y - 12, 3, 'rgba(60,140,50,.45)');
  }
}
function cloud(x, y, s, a = 0.95) {
  X.save(); X.translate(x, y); X.scale(s, s);
  const c = `rgba(255,255,255,${a})`;
  fe(0, 0, 70, 30, c); fc(-30, -14, 30, c); fc(16, -24, 38, c); fc(48, -6, 26, c);
  X.restore();
}
function nightSky(x, y, w, h, seed = 0) {
  X.fillStyle = LG(0, y, 0, y + h, '#0c1846', '#2c3b7c'); X.fillRect(x, y, w, h);
  const t = G.t;
  for (let i = 0; i < 26; i++) {
    const sx = x + srand(i + seed) * w, sy = y + srand(i + seed + 40) * h * 0.75;
    X.globalAlpha *= 0.55 + 0.45 * Math.sin(t * 2 + i);
    starPath(sx, sy, 2 + srand(i + seed + 80) * 3, 4, 0.35); X.fillStyle = '#fff6d0'; X.fill();
    X.globalAlpha = G.nightK;
  }
}
function drawWindow(x, y, w, h, opt = {}) {
  const t = G.t, n = G.nightK;
  fr(x - 16, y - 16, w + 32, h + 32, 14, '#fdfdfd');
  fr(x - 16, y - 16, w + 32, h + 32, 14, LG(0, y - 16, 0, y + h + 16, 'rgba(0,0,0,0)', 'rgba(0,0,0,.08)'));
  X.save(); RR(x, y, w, h, 6); X.clip();
  X.fillStyle = LG(0, y, 0, y + h, '#6ec6ff', '#cfefff'); X.fillRect(x, y, w, h);
  fc(x + w * 0.78, y + h * 0.26, 26, '#fff3b0'); fc(x + w * 0.78, y + h * 0.26, 44, 'rgba(255,243,176,.3)');
  for (let i = 0; i < 3; i++) {
    const cx = x + ((t * 9 * (1 + i * 0.3) + i * 190 + (opt.seed || 0)) % (w + 260)) - 130;
    cloud(cx, y + h * (0.25 + i * 0.17), 0.55 + i * 0.1);
  }
  if (opt.city) {
    const cols = ['#9fb5d9', '#b8c8e6', '#8ea6cf'];
    for (let i = 0; i < 9; i++) {
      const bw = 70 + srand(i) * 60, bh = 90 + srand(i + 3) * 160, bx = x + i * (w / 8) - 20;
      fr(bx, y + h - bh, bw, bh + 10, 6, cols[i % 3]);
      for (let j = 0; j < 4; j++) fr(bx + 12, y + h - bh + 16 + j * 34, bw - 24, 14, 3, 'rgba(255,255,255,.45)');
    }
    fe(x + w * 0.3, y + h + 10, w * 0.5, 50, '#7cc96a');
  } else {
    fe(x + w * 0.25, y + h + 24, w * 0.55, h * 0.32, '#94d67c');
    fe(x + w * 0.85, y + h + 34, w * 0.5, h * 0.42, '#7cc96a');
  }
  if (n > 0.01) {
    X.globalAlpha = n; nightSky(x, y, w, h, opt.seed || 0);
    fc(x + w * 0.72, y + h * 0.3, 24, '#fff6d0'); fc(x + w * 0.72 + 10, y + h * 0.3 - 6, 20, '#22306c');
    if (opt.city) for (let i = 0; i < 9; i++) {
      const bw = 70 + srand(i) * 60, bh = 90 + srand(i + 3) * 160, bx = x + i * (w / 8) - 20;
      fr(bx, y + h - bh, bw, bh + 10, 6, '#1a2350');
      for (let j = 0; j < 4; j++) if (srand(i * 7 + j) > 0.4) fr(bx + 12, y + h - bh + 16 + j * 34, bw - 24, 14, 3, '#ffd77a');
    }
    X.globalAlpha = 1;
  }
  X.restore();
  X.save(); RR(x, y, w, h, 6); X.clip();
  fpoly([x + w * 0.12, y, x + w * 0.34, y, x, y + h * 0.55, x, y + h * 0.3], 'rgba(255,255,255,.22)');
  X.restore();
  if (!opt.noCross) { fr(x + w / 2 - 6, y, 12, h, 0, '#fdfdfd'); fr(x, y + h / 2 - 6, w, 12, 0, '#fdfdfd'); }
  fr(x - 30, y + h + 10, w + 60, 20, 8, '#ffffff'); fr(x - 30, y + h + 24, w + 60, 8, 4, 'rgba(0,0,0,.08)');
  if (opt.curtain) {
    fr(x - 70, y - 44, w + 140, 12, 6, '#c9a27a');
    curtain(x - 60, y - 36, w * 0.3, h + 70, opt.curtain, 1);
    curtain(x + w + 60, y - 36, w * 0.3, h + 70, opt.curtain, -1);
  }
}
function curtain(x, y, w, h, col, d) {
  X.beginPath(); X.moveTo(x, y); X.lineTo(x + d * w, y);
  X.quadraticCurveTo(x + d * w * 0.45, y + h * 0.5, x + d * w * 0.8, y + h);
  X.lineTo(x, y + h); X.closePath();
  X.fillStyle = LG(x, 0, x + d * w, 0, shade(col, -0.1), col, shade(col, 0.15)); X.fill();
  for (let i = 1; i < 4; i++) line(x + d * w * i * 0.2, y + 10, x + d * w * i * 0.18, y + h - 10, 3, 'rgba(0,0,0,.07)');
  fr(x + d * w * 0.3 - 18, y + h * 0.55, 36, 14, 7, shade(col, -0.25));
}
function frame(x, y, w, h, col, art) {
  fr(x + 6, y + 8, w, h, 8, 'rgba(0,0,0,.08)');
  fr(x, y, w, h, 8, col);
  fr(x + 12, y + 12, w - 24, h - 24, 4, '#fffaf2');
  X.save(); RR(x + 20, y + 20, w - 40, h - 40, 3); X.clip(); art(x + 20, y + 20, w - 40, h - 40); X.restore();
}
function artHills(x, y, w, h) {
  X.fillStyle = LG(0, y, 0, y + h, '#9fdcff', '#e6f7ff'); X.fillRect(x, y, w, h);
  fc(x + w * 0.75, y + h * 0.3, h * 0.16, '#ffd23f');
  fe(x + w * 0.3, y + h, w * 0.5, h * 0.45, '#7ed957'); fe(x + w * 0.8, y + h, w * 0.45, h * 0.35, '#5fbf4a');
}
function artAbstract(x, y, w, h) {
  X.fillStyle = '#fff1e6'; X.fillRect(x, y, w, h);
  fc(x + w * 0.35, y + h * 0.45, h * 0.3, '#ff7eb6'); fr(x + w * 0.5, y + h * 0.2, w * 0.3, h * 0.55, 8, '#4dabf7');
  fpoly([x + w * 0.15, y + h, x + w * 0.45, y + h * 0.55, x + w * 0.7, y + h], '#ffd23f');
}
function artCat(x, y, w, h) {
  X.fillStyle = '#e8f6ff'; X.fillRect(x, y, w, h);
  const cx = x + w / 2, cy = y + h * 0.62;
  fpoly([cx - 34, cy - 20, cx - 24, cy - 52, cx - 8, cy - 28], '#ff9f43'); fpoly([cx + 34, cy - 20, cx + 24, cy - 52, cx + 8, cy - 28], '#ff9f43');
  fc(cx, cy, 36, '#ff9f43'); fc(cx - 12, cy - 4, 4, '#2a1d1a'); fc(cx + 12, cy - 4, 4, '#2a1d1a'); fe(cx, cy + 8, 5, 3, '#ff5d8f');
}
function clock(x, y, r) {
  fc(x + 4, y + 6, r + 8, 'rgba(0,0,0,.08)');
  fc(x, y, r + 8, '#ff9f43'); fc(x, y, r, '#fffaf2');
  for (let i = 0; i < 12; i++) { const a = (i / 12) * TAU; fc(x + Math.cos(a) * r * 0.8, y + Math.sin(a) * r * 0.8, i % 3 ? 2.5 : 4.5, '#5b6474'); }
  const d = new Date(), hr = (d.getHours() % 12 + d.getMinutes() / 60) / 12 * TAU, mn = d.getMinutes() / 60 * TAU, sc = d.getSeconds() / 60 * TAU;
  line(x, y, x + Math.sin(hr) * r * 0.45, y - Math.cos(hr) * r * 0.45, 6, '#2f3241');
  line(x, y, x + Math.sin(mn) * r * 0.68, y - Math.cos(mn) * r * 0.68, 4, '#2f3241');
  line(x, y, x + Math.sin(sc) * r * 0.72, y - Math.cos(sc) * r * 0.72, 2, '#ff5d5d');
  fc(x, y, 5, '#2f3241');
}
function rug(cx, cy, rx, ry, c1, c2) {
  fe(cx, cy + 4, rx + 6, ry + 4, 'rgba(0,0,0,.08)');
  fe(cx, cy, rx, ry, c1); fe(cx, cy, rx * 0.78, ry * 0.72, c2); fe(cx, cy, rx * 0.55, ry * 0.46, c1);
}
function pottedPlant(x, y, s = 1, pot = '#ff9b6a') {
  X.save(); X.translate(x, y); X.scale(s, s);
  softShadow(0, 0, 60);
  [[-0.7, 70, '#4ea83c'], [0.7, 70, '#4ea83c'], [-0.3, 92, '#62c24f'], [0.25, 96, '#5fbf4a'], [0, 80, '#71d15a'], [-1.1, 52, '#62c24f'], [1.1, 52, '#62c24f']].forEach(([a, l, c]) => {
    X.save(); X.translate(0, -90); X.rotate(a); fe(0, -l, 20, l, c); line(0, -6, 0, -l * 1.7, 2, 'rgba(255,255,255,.25)'); X.restore();
  });
  fpoly([-46, -94, 46, -94, 34, 0, -34, 0], LG(0, -94, 0, 0, shade(pot, 0.1), shade(pot, -0.1)));
  fr(-52, -104, 104, 20, 8, shade(pot, 0.12));
  X.restore();
}
function lampGlow(x, y, on, col = '#ffe9a8') {
  if (!on) return;
  X.fillStyle = RG(x, y, 4, 110, alpha(col, 0.6), alpha(col, 0)); X.fillRect(x - 110, y - 110, 220, 220);
}
function pillar(x) {
  X.fillStyle = LG(x - 16, 0, x + 16, 0, '#ffffff', '#f1f1f4', '#dcdce4'); X.fillRect(x - 16, -1400, 32, 2195);
}

// ---------- Fábricas de móveis reutilizáveis ----------
function makeTrash(id, x) {
  return {
    id, x: x - 48, y: 680, w: 96, h: 125, z: 806, state: { lid: 0 },
    dropRect: { x: x - 70, y: 620, w: 140, h: 200 },
    drop(e, s) {
      if (e.kind !== 'item') return false;
      if (ITEMS[e.type].pet) { UI.toast(`Ei! ${e.name} não vai pro lixo 🐾`); petSound(e.species); return false; }
      emit('poof', x, 700, 8); removeEnt(e); s.lid = 1; Sfx.poof(); return true;
    },
    tap(s) { s.lid = 1; Sfx.click(); UI.toast('Arraste itens para o lixo para jogá-los fora'); return true; },
    update(s, dt) { s.lid = Math.max(0, s.lid - dt * 1.6); },
    draw(s) {
      softShadow(x, 806, 60);
      fpoly([x - 40, 700, x + 40, 700, x + 32, 806, x - 32, 806], LG(x - 40, 0, x + 40, 0, '#8fd0a0', '#5fbf7a', '#46a062'));
      for (let i = -1; i <= 1; i++) line(x + i * 18, 716, x + i * 15, 794, 4, 'rgba(255,255,255,.25)');
      X.save(); X.translate(x - 44, 700); X.rotate(-Math.sin(s.lid * Math.PI) * 0.6);
      fr(0, -14, 88, 16, 7, '#3f9a5a'); fr(34, -24, 20, 12, 5, '#3f9a5a'); X.restore();
      X.save(); X.translate(x, 760); X.scale(0.5, 0.5);
      X.beginPath(); X.arc(0, 0, 22, 0.3, TAU - 0.3); stroke(7, 'rgba(255,255,255,.7)'); X.restore();
    },
  };
}
function makeChair(id, x, sy, col, style = 0) {
  return {
    id, x: x - 60, y: sy - 140, w: 120, h: 220, z: sy - 1,
    draw() {
      softShadow(x, 900, 70);
      const wood = style === 1 ? '#c98a55' : shade(col, -0.25);
      fr(x - 48, sy + 10, 12, 80, 5, wood); fr(x + 36, sy + 10, 12, 80, 5, wood);
      fr(x - 42, sy - 140, 84, 120, 22, LG(0, sy - 140, 0, sy, shade(col, 0.1), col));
      fr(x - 30, sy - 124, 60, 30, 12, 'rgba(255,255,255,.22)');
      fr(x - 56, sy - 6, 112, 26, 12, shade(col, -0.08));
      fr(x - 56, sy - 6, 112, 10, 8, shade(col, 0.12));
    },
  };
}
function makeTable(id, cx, top, w, col, z, round) {
  return {
    id, x: cx - w / 2, y: top - 10, w, h: 160, z,
    draw() {
      softShadow(cx, z - 4, w * 0.55);
      if (round) {
        fr(cx - 10, top + 12, 20, z - top - 30, 6, shade(col, -0.3));
        fe(cx, z - 16, 56, 12, shade(col, -0.35));
        fe(cx, top + 8, w / 2, 18, shade(col, -0.2)); fe(cx, top, w / 2, 16, col); fe(cx - w * 0.15, top - 4, w * 0.2, 5, 'rgba(255,255,255,.3)');
      } else {
        fr(cx - w / 2 + 16, top + 10, 16, z - top - 10, 6, shade(col, -0.3)); fr(cx + w / 2 - 32, top + 10, 16, z - top - 10, 6, shade(col, -0.3));
        fr(cx - w / 2, top - 4, w, 26, 10, LG(0, top - 4, 0, top + 22, shade(col, 0.12), shade(col, -0.15)));
        fr(cx - w / 2 + 10, top - 2, w - 20, 5, 3, 'rgba(255,255,255,.35)');
      }
    },
  };
}
function makeFloorLamp(id, x, col) {
  return {
    id, x: x - 60, y: 360, w: 120, h: 440, state: { on: true },
    tap(s) { s.on = !s.on; Sfx.click(); return true; },
    light(s) { return s.on ? { x, y: 440, r: 460 } : null; },
    draw(s) {
      softShadow(x, 800, 50);
      fe(x, 794, 40, 10, '#3a3d58'); fr(x - 5, 440, 10, 352, 5, '#3a3d58');
      lampGlow(x, 450, s.on && G.nightK > 0.05);
      fpoly([x - 42, 360, x + 42, 360, x + 66, 444, x - 66, 444], s.on ? LG(0, 360, 0, 444, '#fff4c2', col) : LG(0, 360, 0, 444, shade(col, -0.05), shade(col, -0.25)));
      fe(x, 444, 66, 8, s.on ? '#fff7d6' : shade(col, -0.3));
    },
  };
}

// ======================================================
//  CASA
// ======================================================
SCENES.casa = {
  id: 'casa', name: 'Casa', W: 2700, floorTop: 805, floorBot: 950, ceil: 300,
  surfaces: [
    { x1: 45, x2: 245, y: 332 },
    { x1: 58, x2: 232, y: 466, cont: 'fridge', when: (s) => s.fridge.open },
    { x1: 58, x2: 232, y: 596, cont: 'fridge', when: (s) => s.fridge.open },
    { x1: 58, x2: 232, y: 700, cont: 'fridge', when: (s) => s.fridge.open },
    { x1: 58, x2: 232, y: 780, cont: 'fridge', when: (s) => s.fridge.open },
    { x1: 292, x2: 832, y: 548 },
    { x1: 846, x2: 936, y: 372 },
    { x1: 345, x2: 600, y: 796, z: 932 },
    { x1: 1100, x2: 1440, y: 398 },
    { x1: 1562, x2: 1800, y: 640 },
    { x1: 1175, x2: 1365, y: 858, z: 934 },
    { x1: 1898, x2: 2082, y: 468, cont: 'wardrobe', when: (s) => s.wardrobe.open },
    { x1: 1898, x2: 2082, y: 620, cont: 'wardrobe', when: (s) => s.wardrobe.open },
    { x1: 1898, x2: 2082, y: 776, cont: 'wardrobe', when: (s) => s.wardrobe.open },
    { x1: 1888, x2: 2092, y: 290 },
    { x1: 2148, x2: 2252, y: 700 },
    { x1: 2310, x2: 2670, y: 450 },
    { x1: 2310, x2: 2600, y: 690 },
  ],
  seats: [
    { x: 250, y: 842, kind: 'chair' }, { x: 690, y: 842, kind: 'chair' },
    { x: 1165, y: 712, kind: 'chair' }, { x: 1270, y: 712, kind: 'chair' }, { x: 1375, y: 712, kind: 'chair' },
    { x: 2470, y: 450, kind: 'bed' }, { x: 2470, y: 690, kind: 'bed' },
  ],
  bg(st, t) {
    drawRoomWalls(this, st);
    ceilingTrim(-1000, 3700);
    X.fillStyle = patTiles(); X.fillRect(290, 360, 546, 190);
    X.fillStyle = 'rgba(0,0,0,.06)'; X.fillRect(290, 360, 546, 4);
    baseboard(-1000, 3700);
    drawRoomFloors(this, st);
    pillar(945); pillar(1855);
    drawWindow(340, 160, 230, 170, { curtain: '#ff9f9f', seed: 10 });
    clock(1270, 200, 52);
    frame(1590, 210, 180, 150, '#ff9f43', artHills);
    frame(985, 230, 90, 110, '#7ed957', artCat);
    rug(1270, 885, 330, 52, '#ff8fb8', '#ffd0de');
    drawWindow(2130, 150, 180, 200, { curtain: '#a77bf3', seed: 30 });
    frame(2370, 160, 110, 130, '#4dabf7', artAbstract);
    rug(2190, 900, 210, 40, '#7ad0f0', '#c7eefb');
    // guirlanda
    X.beginPath(); X.moveTo(1880, 90); X.quadraticCurveTo(2280, 170, 2680, 90); stroke(2, '#9aa0aa');
    for (let i = 0; i < 12; i++) {
      const u = i / 11, x = lerp(1880, 2680, u), y = 90 + Math.sin(u * Math.PI) * 40 + 8;
      starPath(x, y, 10); X.fillStyle = ['#ffd23f', '#ff7eb6', '#4dabf7'][i % 3]; X.fill();
    }
  },
  props: [
    { id: 'kitchenLamp', x: 410, y: 0, w: 120, h: 140, state: { on: true },
      tap(s) { s.on = !s.on; Sfx.click(); return true; },
      light(s) { return s.on ? { x: 470, y: 120, r: 520 } : null; },
      draw(s) {
        line(470, 0, 470, 80, 3, '#5b6474');
        lampGlow(470, 120, s.on && G.nightK > 0.05);
        X.beginPath(); X.moveTo(420, 120); X.quadraticCurveTo(420, 76, 470, 76); X.quadraticCurveTo(520, 76, 520, 120); X.closePath();
        X.fillStyle = '#2ec4b6'; X.fill();
        fe(470, 120, 50, 7, s.on ? '#fff7d6' : '#249c91');
      } },
    { id: 'fridge', x: 36, y: 330, w: 218, h: 465, state: { open: false }, container: true,
      tap(s) { s.open = !s.open; Sfx.door(); return true; },
      draw(s) {
        softShadow(145, 800, 140);
        fr(36, 326, 218, 470, 24, LG(36, 0, 254, 0, '#ffffff', '#eef4f9', '#cfdbe6'));
        if (!s.open) {
          fr(46, 340, 198, 126, 18, LG(46, 0, 244, 0, '#ffffff', '#e6eef5'));
          fr(46, 474, 198, 310, 18, LG(46, 0, 244, 0, '#ffffff', '#e6eef5'));
          fr(214, 380, 10, 60, 5, '#b7c6d4'); fr(214, 500, 10, 92, 5, '#b7c6d4');
          fr(80, 520, 70, 86, 4, '#fffbe8'); fpoly([94, 590, 115, 548, 136, 590], '#7ed957'); fc(126, 544, 8, '#ffd23f');
          fc(115, 520, 7, '#ff5d5d'); fc(170, 650, 12, '#4dabf7'); fc(90, 700, 10, '#ffd23f'); starPath(170, 700, 12); X.fillStyle = '#ff7eb6'; X.fill();
        } else {
          fr(48, 338, 194, 446, 16, LG(0, 338, 0, 784, '#f6fcff', '#d9ecf7'));
          fe(145, 352, 64, 10, 'rgba(255,255,220,.95)');
          fr(48, 466, 194, 10, 0, '#c8d9e6');
          [596, 700].forEach((y) => { fr(52, y, 186, 7, 3, 'rgba(160,205,235,.95)'); });
          fr(56, 720, 178, 60, 10, 'rgba(160,205,235,.35)');
          fpoly([254, 330, 300, 306, 300, 820, 254, 796], LG(254, 0, 300, 0, '#dce6ef', '#ffffff'));
          [420, 560, 680].forEach((y) => fpoly([258, y, 296, y - 18, 296, y + 10, 258, y + 26], 'rgba(160,205,235,.7)'));
        }
      } },
    { id: 'counter', x: 0, y: 0, w: 0, h: 0,
      draw() {
        fr(300, 556, 330, 238, 4, '#7ad0c3');
        for (let i = 0; i < 3; i++) { fr(312 + i * 106, 580, 96, 196, 10, '#8ddbcf'); fr(312 + i * 106 + 40, 600, 16, 6, 3, '#ffffff'); }
        fr(290, 540, 550, 22, 8, LG(0, 540, 0, 562, '#ffffff', '#d7dde6'));
        fe(455, 548, 64, 7, '#9fb3c2');
        // armário de cima
        fr(846, 358, 92, 14, 5, '#c98a55');
        fr(856, 300, 24, 58, 4, '#ff7eb6'); fr(886, 312, 20, 46, 4, '#ffd23f'); fr(910, 290, 22, 68, 4, '#7ed957');
      } },
    { id: 'faucet', x: 420, y: 460, w: 80, h: 90, state: { on: false },
      tap(s) { s.on = !s.on; Sfx.click(); if (s.on) Sfx.splash(); return true; },
      update(s, dt) { if (s.on && Math.random() < dt * 20) emit('drop', 476 + rand(-3, 3), 520, 1); },
      draw(s) {
        fr(446, 480, 16, 64, 6, '#b7c6d4'); X.beginPath(); X.moveTo(454, 486); X.quadraticCurveTo(454, 462, 480, 466); X.lineTo(480, 482); stroke(12, '#c9d5e0');
        fr(434, 520, 40, 10, 5, '#ff7eb6');
        if (s.on) { fr(472, 484, 9, 62, 4, LG(0, 484, 0, 548, 'rgba(120,200,255,.9)', 'rgba(120,200,255,.4)')); }
      } },
    { id: 'stove', x: 640, y: 540, w: 192, h: 255, state: { on: false },
      tap(s) { s.on = !s.on; Sfx.click(); return true; },
      light(s) { return s.on ? { x: 735, y: 680, r: 200, col: '#ff9a3c' } : null; },
      update(s, dt) { if (s.on && Math.random() < dt * 3) emit('smoke', rand(670, 800), 530, 1); },
      draw(s, t) {
        // coifa
        fpoly([680, 250, 790, 250, 830, 330, 640, 330], LG(640, 0, 830, 0, '#e6ebf0', '#c4ccd6'));
        fr(700, 120, 70, 132, 4, '#d4dae2');
        fr(640, 556, 192, 238, 6, LG(640, 0, 832, 0, '#ffffff', '#e1e6ec'));
        fr(660, 616, 152, 126, 12, '#3a3d58');
        fr(672, 628, 128, 102, 8, s.on ? LG(0, 628, 0, 730, '#ffb15a', '#ff6a2a') : '#24263a');
        fr(680, 600, 110, 8, 4, '#b7c6d4');
        [690, 780].forEach((x) => { fc(x, 584, 9, s.on ? '#ff5d3a' : '#5b6474'); });
        fr(632, 540, 208, 18, 6, '#3a3d58');
        [690, 780].forEach((x) => {
          fe(x, 542, 40, 6, '#1d1f2e');
          if (s.on) for (let i = 0; i < 7; i++) {
            const a = (i / 7) * TAU, f = 6 + Math.sin(t * 20 + i) * 3;
            fe(x + Math.cos(a) * 26, 538, 5, f, i % 2 ? '#ffb347' : '#4dabf7');
          }
        });
      } },
    makeTrash('trash', 890),
    makeChair('chairK1', 250, 842, '#ffd23f', 1),
    makeChair('chairK2', 690, 842, '#ffd23f', 1),
    makeTable('tableK', 472, 800, 290, '#f0a35e', 931),
    makeFloorLamp('lampL', 1000, '#ffd23f'),
    { id: 'sofa', x: 0, y: 0, w: 0, h: 0,
      draw() {
        softShadow(1270, 800, 280);
        fr(1060, 560, 420, 170, 40, LG(0, 560, 0, 730, '#7c8cf8', '#5c6ef0'));
        [1165, 1270, 1375].forEach((x) => fr(x - 50, 580, 100, 120, 30, 'rgba(255,255,255,.12)'));
        fr(1050, 700, 440, 100, 26, LG(0, 700, 0, 800, '#6b7cf5', '#4e5fd6'));
        fr(1062, 704, 416, 24, 14, 'rgba(255,255,255,.18)');
        fr(1030, 630, 62, 168, 30, '#5869e8'); fr(1448, 630, 62, 168, 30, '#5869e8');
        fr(1060, 790, 18, 14, 4, '#3a3d58'); fr(1462, 790, 18, 14, 4, '#3a3d58');
        fr(1092, 610, 64, 60, 20, '#ffd23f'); fr(1386, 610, 64, 60, 20, '#ff7eb6');
        // prateleira
        fr(1100, 398, 340, 16, 6, '#c98a55'); fr(1130, 412, 12, 24, 3, '#a8703f'); fr(1400, 412, 12, 24, 3, '#a8703f');
      } },
    { id: 'radio', x: 1250, y: 320, w: 120, h: 80, state: { on: false },
      tap(s) { s.on = !s.on; Sfx.click(); UI.toast(s.on ? '♪ Rádio ligado' : 'Rádio desligado'); return true; },
      update(s, dt) { if (s.on && Math.random() < dt * 2.5) emit('note', rand(1270, 1350), 330, 1); },
      draw(s, t) {
        const b = s.on ? Math.sin(t * 12) * 2 : 0;
        fr(1250, 330 - b, 120, 68 + b, 14, '#ff6b6b');
        fc(1290, 366, 22 + b * 0.5, '#2f3241'); fc(1290, 366, 10, '#5b6474');
        fr(1322, 346, 36, 12, 4, '#fff1d6'); fc(1330, 378, 6, '#ffd23f'); fc(1350, 378, 6, s.on ? '#7ed957' : '#5b6474');
        line(1360, 330, 1380, 290, 3, '#5b6474');
      } },
    { id: 'tv', x: 1560, y: 460, w: 240, h: 330, state: { on: false, ch: 0 },
      tap(s) { if (!s.on) { s.on = true; s.ch = 0; } else if (s.ch < 2) s.ch++; else s.on = false; Sfx.click(); return true; },
      light(s) { return s.on ? { x: 1680, y: 550, r: 320, col: '#9fd3ff' } : null; },
      draw(s, t) {
        softShadow(1680, 800, 140);
        fr(1560, 640, 240, 150, 12, LG(0, 640, 0, 790, '#f0a35e', '#d9853d'));
        fr(1576, 660, 100, 56, 8, '#f7b673'); fr(1684, 660, 100, 56, 8, '#f7b673');
        fr(1576, 724, 208, 56, 8, '#f7b673');
        fc(1626, 688, 5, '#a8703f'); fc(1734, 688, 5, '#a8703f'); fc(1680, 752, 5, '#a8703f');
        fr(1650, 620, 60, 22, 6, '#3a3d58');
        fr(1574, 466, 212, 156, 16, '#2f3241');
        X.save(); RR(1586, 478, 188, 132, 8); X.clip();
        if (!s.on) { X.fillStyle = LG(1586, 478, 1774, 610, '#3d4160', '#1d1f2e'); X.fillRect(1586, 478, 188, 132); fpoly([1600, 478, 1650, 478, 1586, 560, 1586, 520], 'rgba(255,255,255,.08)'); }
        else if (s.ch === 0) {
          X.fillStyle = LG(0, 478, 0, 610, '#6ec6ff', '#cfefff'); X.fillRect(1586, 478, 188, 132);
          fe(1680, 620, 140, 40, '#7ed957');
          const bx = 1600 + ((t * 60) % 220), by = 560 - Math.abs(Math.sin(t * 4)) * 40;
          fc(bx, by, 16, '#ff6b6b'); fc(bx - 5, by - 5, 3, '#fff'); fc(bx + 5, by - 5, 3, '#fff');
          fc(1740, 505, 16, '#ffd23f');
        } else if (s.ch === 1) {
          const cs = ['#ff6b6b', '#ff9f43', '#ffd23f', '#7ed957', '#4dabf7', '#a77bf3'];
          cs.forEach((c, i) => { X.fillStyle = c; X.fillRect(1586 + i * 32, 478, 32, 132); });
          X.font = 'bold 26px Fredoka, sans-serif'; X.textAlign = 'center'; X.fillStyle = '#fff'; X.fillText('Vila TV', 1680, 552 + Math.sin(t * 3) * 6);
        } else {
          X.fillStyle = '#1d2a5a'; X.fillRect(1586, 478, 188, 132);
          for (let i = 0; i < 18; i++) { const a = t * 0.5 + i; fc(1680 + Math.cos(a * 1.3) * 80, 544 + Math.sin(a) * 50, 3, '#fff6d0'); }
          fc(1680, 544, 26, '#ff9f43'); fe(1680, 544, 46, 8, 'rgba(255,215,120,.7)', 0.3);
        }
        X.restore();
        fc(1770, 616, 3, s.on ? '#7ed957' : '#ff6b6b');
      } },
    makeTable('coffeeTable', 1270, 862, 210, '#ffffff', 933, false),
    { id: 'wardrobe', x: 1888, y: 290, w: 204, h: 505, state: { open: false }, container: true,
      tap(s) { s.open = !s.open; Sfx.door(); return true; },
      draw(s) {
        softShadow(1990, 800, 130);
        fr(1888, 290, 204, 506, 14, LG(1888, 0, 2092, 0, '#f7b673', '#e9974c'));
        if (!s.open) {
          fr(1900, 304, 88, 480, 10, '#ffc185'); fr(1992, 304, 88, 480, 10, '#ffc185');
          fr(1972, 520, 8, 50, 4, '#a8703f'); fr(2000, 520, 8, 50, 4, '#a8703f');
          heartPath(1944, 400, 18); X.fillStyle = '#ff7eb6'; X.fill(); starPath(2036, 400, 18); X.fillStyle = '#ffd23f'; X.fill();
        } else {
          fr(1898, 302, 184, 484, 8, '#6b4428');
          line(1904, 330, 2076, 330, 5, '#c9d5e0');
          [['#ff6b6b', 1920], ['#4dabf7', 1960], ['#ffd23f', 2000], ['#a77bf3', 2040]].forEach(([c, x]) => {
            line(x, 330, x, 342, 3, '#c9d5e0'); fpoly([x - 20, 344, x + 20, 344, x + 16, 440, x - 16, 440], c);
          });
          [468, 620].forEach((y) => fr(1898, y, 184, 10, 3, '#a8703f'));
          fpoly([1888, 298, 1856, 280, 1856, 812, 1888, 796], '#ffc185');
          fpoly([2092, 298, 2124, 280, 2124, 812, 2092, 796], '#ffc185');
        }
      } },
    { id: 'nightLamp', x: 2140, y: 560, w: 120, h: 240, state: { on: true },
      tap(s) { s.on = !s.on; Sfx.click(); return true; },
      light(s) { return s.on ? { x: 2200, y: 610, r: 360 } : null; },
      draw(s) {
        softShadow(2200, 800, 70);
        fr(2148, 700, 104, 96, 10, '#ffffff'); fr(2156, 720, 88, 30, 6, '#f3effa'); fc(2200, 735, 5, '#a77bf3');
        fr(2190, 640, 20, 60, 6, '#a77bf3');
        lampGlow(2200, 620, s.on && G.nightK > 0.05);
        fpoly([2170, 580, 2230, 580, 2248, 644, 2152, 644], s.on ? LG(0, 580, 0, 644, '#fff4c2', '#ffd0de') : '#e3b3c4');
      } },
    { id: 'bunk', x: 2300, y: 290, w: 400, h: 510, state: {},
      draw() {
        softShadow(2490, 800, 230);
        const w = '#4dabf7';
        fr(2296, 290, 22, 510, 8, w); fr(2672, 290, 22, 510, 8, w);
        fr(2310, 452, 370, 50, 12, '#ffffff'); fr(2310, 492, 370, 16, 6, shade(w, -0.1));
        fr(2310, 692, 370, 50, 12, '#ffffff'); fr(2310, 732, 370, 16, 6, shade(w, -0.1));
        fr(2318, 412, 80, 46, 20, '#fff6e8'); fr(2318, 652, 80, 46, 20, '#fff6e8');
        fr(2310, 360, 370, 14, 6, w);
        for (let y = 520; y < 800; y += 44) line(2618, y, 2664, y, 7, shade(w, 0.1));
        line(2618, 508, 2618, 800, 8, w); line(2664, 508, 2664, 800, 8, w);
      },
      front() {
        [[450, '#ff9f43'], [690, '#7ed957']].forEach(([y, c]) => {
          fr(2400, y - 62, 214, 78, 26, LG(0, y - 62, 0, y + 16, shade(c, 0.1), c));
          for (let i = 0; i < 4; i++) fc(2430 + i * 52, y - 22, 9, 'rgba(255,255,255,.4)');
        });
      } },
  ],
  init() {
    return [
      I('apple', 120, 596), I('carrot', 200, 596), I('milk', 100, 700), I('juice', 180, 700), I('egg', 145, 466), I('watermelon', 145, 780),
      I('banana', 330, 548), I('bread', 590, 548),
      I('cake', 472, 796), I('pizza', 400, 796),
      I('plant', 1410, 398), I('book', 1160, 398),
      I('cupcake', 1220, 858), I('donut', 1320, 858),
      I('ball', 1620, 900), I('guitar', 2090, 890), I('teddy', 2350, 450),
      I('cap', 1950, 620), I('crown', 2030, 468), I('sunglasses', 1990, 776),
      C('Lia', 'casa', 1375, 712, { seat: 4 }), C('Téo', 'casa', 820, 890), C('Bento', 'casa', 2200, 905),
    ];
  },
};

// ======================================================
//  CAFÉ
// ======================================================
SCENES.cafe = {
  id: 'cafe', name: 'Café', W: 2300, floorTop: 805, floorBot: 950, ceil: 260,
  surfaces: [
    { x1: 85, x2: 905, y: 548 },
    { x1: 130, x2: 510, y: 470 },
    { x1: 120, x2: 520, y: 400 },
    { x1: 965, x2: 1215, y: 664 },
    { x1: 1360, x2: 1540, y: 766, z: 937 },
    { x1: 1860, x2: 2040, y: 766, z: 937 },
  ],
  seats: [{ x: 1270, y: 830, kind: 'chair' }, { x: 1630, y: 830, kind: 'chair' }, { x: 1770, y: 830, kind: 'chair' }, { x: 2130, y: 830, kind: 'chair' }],
  bg(st, t) {
    wall(-1000, 3400, '#fff1dc', patStripes());
    X.fillStyle = '#c27a4a'; X.fillRect(-1000, 600, 4400, 192); X.fillStyle = patBrick(); X.fillRect(-1000, 600, 4400, 192);
    fr(-1000, 590, 4400, 14, 0, '#8a5532');
    ceilingTrim(-1000, 3400);
    baseboard(-1000, 3400, '#8a5532');
    floorTiles(-1000, 3400, '#f3efe9', '#3a3546', 70);
    // quadro do menu
    fr(110, 130, 420, 240, 16, '#a8703f'); fr(126, 146, 388, 208, 8, '#2c3a33');
    X.font = '600 38px Fredoka, sans-serif'; X.textAlign = 'center'; X.fillStyle = '#fffbe8'; X.fillText('Café Doce', 320, 200);
    X.font = '400 22px Fredoka, sans-serif'; X.textAlign = 'left'; X.fillStyle = 'rgba(255,251,232,.85)';
    ['Café ........ 2', 'Croissant ... 3', 'Bolo ........ 4'].forEach((s, i) => X.fillText(s, 160, 244 + i * 32));
    X.beginPath(); X.arc(460, 280, 24, 0, Math.PI); stroke(3, '#ffd23f'); line(436, 280, 484, 280, 3, '#ffd23f');
    drawWindow(1340, 140, 800, 320, { city: true, seed: 50, noCross: true });
    for (let i = 1; i < 4; i++) fr(1340 + i * 200 - 5, 140, 10, 320, 0, '#fdfdfd');
    for (let i = 0; i < 10; i++) {
      X.beginPath(); X.moveTo(1324 + i * 83, 126); X.lineTo(1324 + (i + 1) * 83, 126); X.arc(1324 + i * 83 + 41.5, 126, 41.5, 0, Math.PI); X.closePath();
      X.fillStyle = i % 2 ? '#ffffff' : '#ff6b6b'; X.fill();
    }
    fr(1316, 108, 848, 22, 6, '#e04d4d');
    // nicho do forno
    fr(940, 310, 300, 350, 20, '#b06a3d');
    pottedPlant(40, 795, 0.9, '#4dabf7');
  },
  props: [
    ...[500, 1450, 1950].map((x, i) => ({ id: 'pend' + i, x: x - 60, y: 0, w: 120, h: 190, state: { on: true },
      tap(s) { s.on = !s.on; Sfx.click(); return true; },
      light(s) { return s.on ? { x, y: 190, r: 480 } : null; },
      draw(s) {
        line(x, 0, x, 130, 3, '#3a3d58');
        lampGlow(x, 180, s.on && G.nightK > 0.05);
        X.beginPath(); X.moveTo(x - 50, 182); X.quadraticCurveTo(x - 46, 128, x, 128); X.quadraticCurveTo(x + 46, 128, x + 50, 182); X.closePath();
        X.fillStyle = '#2f3241'; X.fill(); fe(x, 182, 50, 7, s.on ? '#fff3c4' : '#1d1f2e');
        if (s.on) fc(x, 186, 12, '#fffbe8');
      } })),
    { id: 'counter', x: 0, y: 0, w: 0, h: 0,
      draw() {
        softShadow(490, 800, 440);
        fr(80, 556, 830, 240, 8, '#7a4b2a');
        for (let i = 0; i < 16; i++) fr(92 + i * 51, 572, 40, 210, 8, i % 2 ? '#8a5532' : '#93603c');
        fr(70, 538, 850, 24, 10, LG(0, 538, 0, 562, '#fffaf2', '#e8dccb'));
        // vitrine (fundo)
        fr(120, 400, 400, 148, 10, 'rgba(255,240,220,.55)');
        fr(124, 470, 392, 6, 3, 'rgba(255,255,255,.9)');
        // caixa registradora
        fr(790, 476, 100, 72, 10, '#5c7cfa'); fr(802, 450, 76, 30, 6, '#3a50b8'); fr(812, 456, 56, 16, 3, '#9fe8b0');
        for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) fr(806 + i * 24, 496 + j * 20, 18, 12, 3, '#e6ebff');
      },
      front() {
        X.fillStyle = 'rgba(200,235,255,.16)'; X.fillRect(120, 400, 400, 148);
        RR(116, 396, 408, 156, 12); stroke(5, 'rgba(255,255,255,.7)');
        fpoly([150, 404, 200, 404, 140, 520, 124, 520], 'rgba(255,255,255,.18)');
      } },
    { id: 'coffeeMachine', x: 576, y: 350, w: 170, h: 200, state: { brew: 0 },
      tap(s) {
        if (s.brew > 0) return true;
        if (!canSpawn()) return true;
        s.brew = 1.1; Sfx.brew(); return true;
      },
      update(s, dt) {
        if (s.brew > 0) {
          if (Math.random() < dt * 10) emit('steam', 660 + rand(-10, 10), 420, 1);
          s.brew -= dt;
          if (s.brew <= 0) { const it = spawnItem('coffee', 660 + rand(-14, 14), 548, 'cafe'); it.level = 1; Sfx.ding(); }
        }
      },
      draw(s, t) {
        fr(580, 360, 160, 188, 20, LG(580, 0, 740, 0, '#ff6b6b', '#e04d4d', '#c43b3b'));
        fr(596, 376, 128, 50, 12, '#2f3241'); fc(626, 400, 10, s.brew > 0 ? '#7ed957' : '#ffd23f'); fc(660, 400, 10, '#ffffff'); fc(694, 400, 10, '#4dabf7');
        fr(640, 432, 40, 30, 6, '#c9d5e0'); fr(652, 460, 16, 12, 3, '#9aa6b2');
        if (s.brew > 0) fr(657, 472, 6, 70, 3, '#6b3e26');
        fr(600, 534, 120, 12, 5, '#9aa6b2');
        fe(616, 372, 14, 4, 'rgba(255,255,255,.4)');
      } },
    { id: 'oven', x: 950, y: 320, w: 280, h: 340, state: { bake: 0 },
      tap(s) {
        if (s.bake > 0) return true;
        if (!canSpawn()) return true;
        s.bake = 1.6; Sfx.click(); return true;
      },
      light(s) { return s.bake > 0 ? { x: 1090, y: 470, r: 300, col: '#ff9a3c' } : null; },
      update(s, dt) {
        if (s.bake > 0) {
          s.bake -= dt;
          if (s.bake <= 0) { spawnItem(pick(['bread', 'croissant', 'cupcake', 'cake', 'donut', 'pizza']), rand(1000, 1180), 664, 'cafe'); Sfx.ding(); }
        }
      },
      draw(s, t) {
        fr(960, 330, 260, 310, 14, LG(960, 0, 1220, 0, '#3a3d58', '#2f3241'));
        fr(986, 356, 208, 30, 8, '#24263a');
        for (let i = 0; i < 4; i++) fc(1010 + i * 50, 371, 8, i === 0 && s.bake > 0 ? '#ff6b6b' : '#7a7f99');
        const glow = s.bake > 0 ? 0.6 + Math.sin(t * 10) * 0.2 : 0.15;
        fr(986, 404, 208, 200, 16, '#1d1f2e');
        fr(1000, 418, 180, 172, 10, LG(0, 418, 0, 590, `rgba(255,170,80,${glow})`, `rgba(255,90,40,${glow})`));
        fr(1000, 540, 180, 6, 3, 'rgba(255,255,255,.3)');
        fr(1040, 392, 100, 10, 5, '#c9d5e0');
        // bancada abaixo do forno
        softShadow(1090, 800, 160);
        fr(960, 664, 260, 132, 8, '#7a4b2a'); fr(952, 650, 276, 20, 8, LG(0, 650, 0, 670, '#fffaf2', '#e8dccb'));
        fr(976, 690, 228, 90, 10, '#8a5532');
      } },
    makeTrash('trash', 2240),
    makeChair('chC1', 1270, 830, '#ff9f43', 1), makeChair('chC2', 1630, 830, '#2ec4b6', 1),
    makeChair('chC3', 1770, 830, '#ff7eb6', 1), makeChair('chC4', 2130, 830, '#ffd23f', 1),
    makeTable('tbC1', 1450, 770, 200, '#ffffff', 936, true),
    makeTable('tbC2', 1950, 770, 200, '#ffffff', 936, true),
  ],
  init() {
    return [
      I('croissant', 200, 470), I('donut', 300, 470), I('cupcake', 420, 470),
      I('cake', 230, 548), I('bread', 420, 548), I('juice', 760, 548),
      I('coffee', 1450, 766), I('croissant', 1980, 766),
      C('Nina', 'cafe', 1630, 830, { seat: 1 }),
    ];
  },
};

// ======================================================
//  ESTÚDIO (salão & moda)
// ======================================================
function makeStation(id, cx, seatIdx) {
  return {
    id, x: cx - 120, y: 150, w: 240, h: 380,
    tap() { Sfx.sparkle(); UI.toast('Coloque alguém na cadeira para mudar o visual ✨'); return true; },
    draw(s, t) {
      fr(cx - 140, 140, 280, 350, 130, '#ffd6e5');
      fr(cx - 120, 160, 240, 310, 112, LG(cx - 120, 160, cx + 120, 470, '#eaf6ff', '#c8e2f5', '#eaf6ff'));
      fpoly([cx - 70, 200, cx - 20, 200, cx - 110, 400, cx - 120, 330], 'rgba(255,255,255,.45)');
      for (let i = 0; i < 9; i++) {
        const a = Math.PI + (i / 8) * Math.PI, bx = cx + Math.cos(a) * 128, by = 290 + Math.sin(a) * 140;
        fc(bx, by, 9, G.nightK > 0.3 ? '#fff3b0' : '#ffffff'); fc(bx, by, 4, '#ffe58a');
      }
      fr(cx - 150, 500, 300, 22, 8, '#ffffff');
      fr(cx - 110, 470, 22, 32, 6, '#a77bf3'); fr(cx - 80, 480, 18, 22, 6, '#2ec4b6'); fr(cx + 80, 474, 26, 28, 8, '#ff9f43');
      // cadeira
      const sy = 740;
      softShadow(cx, 860, 80);
      fe(cx, 858, 60, 12, '#9aa6b2'); fr(cx - 10, sy + 20, 20, 840 - sy, 6, '#c9d5e0');
      fr(cx - 56, sy - 150, 112, 150, 34, LG(0, sy - 150, 0, sy, '#ff7eb6', '#e85d9a'));
      fr(cx - 66, sy - 8, 132, 32, 14, '#e85d9a');
      fr(cx - 78, sy - 60, 24, 70, 12, '#f07aae'); fr(cx + 54, sy - 60, 24, 70, 12, '#f07aae');
    },
  };
}
SCENES.estudio = {
  id: 'estudio', name: 'Estúdio', W: 2000, floorTop: 805, floorBot: 950, ceil: 260,
  surfaces: [
    { x1: 250, x2: 550, y: 500 }, { x1: 650, x2: 950, y: 500 },
    { x1: 1075, x2: 1425, y: 360 }, { x1: 1075, x2: 1425, y: 520 }, { x1: 1075, x2: 1425, y: 680 },
  ],
  seats: [{ x: 400, y: 740, kind: 'stylist' }, { x: 800, y: 740, kind: 'stylist' }],
  bg(st, t) {
    wall(-1000, 3000, '#ffe0ec', patDiamond());
    X.fillStyle = '#ffffff'; X.fillRect(-1000, 580, 4000, 212);
    for (let x = -1000; x < 3000; x += 120) fr(x + 14, 600, 92, 170, 8, '#fff2f7');
    fr(-1000, 572, 4000, 12, 0, '#f3c6d8');
    ceilingTrim(-1000, 3000);
    baseboard(-1000, 3000, '#f3c6d8');
    floorWood(-1000, 3000, '#eac9a1');
    rug(1000, 900, 300, 44, '#a77bf3', '#d6c4fb');
    // letreiro neon
    const g = 0.75 + Math.sin(t * 3) * 0.1;
    X.font = '600 50px Fredoka, sans-serif'; X.textAlign = 'center';
    X.shadowColor = '#ff4fa3'; X.shadowBlur = 24 * g; X.fillStyle = '#ff7eb6'; X.fillText('Estúdio ✦ Estilo', 1250, 150); X.shadowBlur = 0;
    X.fillStyle = 'rgba(255,255,255,.7)'; X.fillText('Estúdio ✦ Estilo', 1250, 148);
    pottedPlant(1000, 795, 0.85, '#ffd23f');
  },
  props: [
    makeStation('st1', 400, 0), makeStation('st2', 800, 1),
    { id: 'shelf', x: 0, y: 0, w: 0, h: 0,
      draw() {
        softShadow(1250, 800, 210);
        fr(1060, 220, 380, 576, 16, LG(1060, 0, 1440, 0, '#ffffff', '#f3eef7'));
        fr(1074, 234, 352, 548, 10, '#fbe6ef');
        [360, 520, 680].forEach((y) => { fr(1066, y, 368, 14, 6, '#e6cfe0'); });
        X.font = '600 26px Fredoka, sans-serif'; X.textAlign = 'center'; X.fillStyle = '#c45b8f'; X.fillText('Acessórios', 1250, 214);
      } },
    { id: 'booth', x: 1540, y: 180, w: 300, h: 620, state: { close: 0, who: null, timer: 0 },
      dropRect: { x: 1530, y: 160, w: 320, h: 680 },
      drop(e, s) {
        if (e.kind !== 'char' || s.who) return false;
        s.who = e.id; s.timer = 1.5; e.state = 'booth'; e.x = 1690; e.y = 880; Sfx.whoosh(); return true;
      },
      tap() { Sfx.click(); UI.toast('Arraste alguém para o provador para trocar de roupa!'); return true; },
      update(s, dt) {
        s.close += ((s.who ? 1 : 0) - s.close) * Math.min(1, dt * 7);
        if (s.who) {
          s.timer -= dt;
          if (Math.random() < dt * 8) emit('star', rand(1580, 1800), rand(300, 700), 1);
          if (s.timer <= 0) {
            const c = getEnt(s.who);
            if (c) { Object.assign(c, randomOutfit()); c.state = 'idle'; c.reactT = 1.4; c.sq = 0.5; emit('star', 1690, 650, 16); Sfx.sparkle(); }
            s.who = null;
          }
        }
      },
      draw(s) {
        softShadow(1690, 806, 170);
        fr(1540, 180, 300, 40, 14, '#a77bf3');
        X.font = '600 24px Fredoka, sans-serif'; X.textAlign = 'center'; X.fillStyle = '#fff'; X.fillText('Provador', 1690, 208);
        fr(1550, 220, 280, 580, 8, '#f3eefe');
        fr(1546, 230, 288, 8, 4, '#c9d5e0');
        const cw = lerp(46, 140, s.close);
        for (const d of [-1, 1]) {
          const x0 = d < 0 ? 1550 : 1830;
          X.beginPath(); X.moveTo(x0, 234); X.lineTo(x0 - d * cw, 234); X.lineTo(x0 - d * cw * 0.95, 800); X.lineTo(x0, 800); X.closePath();
          X.fillStyle = LG(x0, 0, x0 - d * cw, 0, '#7a4fd6', '#9b6ff0'); X.fill();
          for (let i = 1; i < 5; i++) line(x0 - d * cw * i * 0.2, 240, x0 - d * cw * i * 0.2, 796, 3, 'rgba(0,0,0,.1)');
        }
        if (s.close < 0.5) { fr(1630, 300, 120, 160, 50, 'rgba(255,255,255,.6)'); fr(1640, 310, 100, 140, 44, LG(0, 300, 0, 460, '#eaf6ff', '#c8e2f5')); }
      } },
    { id: 'rack', x: 0, y: 0, w: 0, h: 0,
      draw() {
        line(1880, 300, 1880, 790, 6, '#c9d5e0'); line(1990, 300, 1990, 790, 6, '#c9d5e0'); line(1870, 300, 2000, 300, 6, '#c9d5e0');
        ['#ff6b6b', '#ffd23f', '#2ec4b6'].forEach((c, i) => { const x = 1905 + i * 38; line(x, 300, x, 316, 3, '#9aa6b2'); fpoly([x - 18, 316, x + 18, 316, x + 14, 420, x - 14, 420], c); });
      } },
  ],
  init() {
    return [
      I('cap', 1130, 360), I('tophat', 1250, 360), I('crown', 1370, 360),
      I('bow', 1130, 520), I('flower', 1250, 520), I('beanie', 1370, 520),
      I('glasses', 1130, 680), I('sunglasses', 1250, 680), I('hearts', 1370, 680),
      C('Zoe', 'estudio', 600, 900),
    ];
  },
};

// ======================================================
//  PARQUE
// ======================================================
const SWING = { L: 420, py: 300, xs: [800, 1000] };
function slideP(u) {
  const p0 = [1398, 478], p1 = [1530, 470], p2 = [1560, 792], p3 = [1735, 792];
  const m = 1 - u;
  const x = m * m * m * p0[0] + 3 * m * m * u * p1[0] + 3 * m * u * u * p2[0] + u * u * u * p3[0];
  const y = m * m * m * p0[1] + 3 * m * m * u * p1[1] + 3 * m * u * u * p2[1] + u * u * u * p3[1];
  const dx = 3 * m * m * (p1[0] - p0[0]) + 6 * m * u * (p2[0] - p1[0]) + 3 * u * u * (p3[0] - p2[0]);
  const dy = 3 * m * m * (p1[1] - p0[1]) + 6 * m * u * (p2[1] - p1[1]) + 3 * u * u * (p3[1] - p2[1]);
  return { x, y, ang: Math.atan2(dy, dx) };
}
function streetLamp(id, x) {
  return {
    id, x: x - 40, y: 300, w: 80, h: 500, state: { on: true },
    tap(s) { s.on = !s.on; Sfx.click(); return true; },
    light(s) { return s.on ? { x, y: 340, r: 480 } : null; },
    draw(s) {
      softShadow(x, 800, 40);
      fr(x - 6, 340, 12, 460, 5, '#3a3d58'); fe(x, 796, 26, 8, '#3a3d58');
      lampGlow(x, 330, s.on && G.nightK > 0.05);
      fr(x - 22, 300, 44, 50, 12, s.on && G.nightK > 0.05 ? '#fff3b0' : '#e6ebf0'); fr(x - 28, 292, 56, 12, 6, '#3a3d58');
    },
  };
}
SCENES.parque = {
  id: 'parque', name: 'Parque', W: 2800, floorTop: 815, floorBot: 950, ceil: -500, outdoor: true,
  surfaces: [
    { x1: 190, x2: 480, y: 452 },
    { x1: 1282, x2: 1404, y: 470 },
    { x1: 1860, x2: 2140, y: 742, z: 802 },
    { x1: 2270, x2: 2500, y: 560 },
  ],
  seats: [
    { x: 800, y: 720, kind: 'swing', i: 0, pos: (st) => swingPos(st, 0) },
    { x: 1000, y: 720, kind: 'swing', i: 1, pos: (st) => swingPos(st, 1) },
    { x: 2640, y: 770, kind: 'chair' }, { x: 2740, y: 770, kind: 'chair' },
  ],
  bg(st, t) {
    const n = G.nightK;
    X.fillStyle = LG(0, -1200, 0, 800, '#4fb3f0', '#8fd6ff', '#e2f6ff'); X.fillRect(-1000, -1400, 4800, 2200);
    if (n > 0.01) { X.globalAlpha = n; nightSky(-1000, -1400, 4800, 2200, 3); X.globalAlpha = 1; }
    if (n < 0.99) { X.globalAlpha = 1 - n; fc(2380, 140, 60, '#fff3b0'); fc(2380, 140, 100, 'rgba(255,243,176,.35)'); X.globalAlpha = 1; }
    if (n > 0.01) { X.globalAlpha = n; fc(600, 140, 50, '#fff6d0'); fc(624, 126, 44, '#1e2b68'); X.globalAlpha = 1; }
    for (let i = 0; i < 6; i++) cloud(((t * (6 + i * 2) + i * 640) % 3600) - 600, 80 + (i % 3) * 70, 0.9 + (i % 2) * 0.4, 0.95 - n * 0.6);
    X.fillStyle = n > 0.5 ? '#3e6a63' : '#a8dfa0'; X.beginPath(); X.moveTo(-1000, 700);
    for (let x = -1000; x <= 3800; x += 200) X.quadraticCurveTo(x + 100, 560 + srand(x) * 80, x + 200, 700);
    X.lineTo(3800, 800); X.lineTo(-1000, 800); X.fill();
    for (let i = 0; i < 14; i++) {
      const x = -400 + i * 300 + srand(i) * 120, y = 690;
      fr(x - 6, y - 40, 12, 50, 4, n > 0.5 ? '#3a3d58' : '#a0754d');
      fc(x, y - 70, 40, n > 0.5 ? '#2f5a52' : '#7ccc6a'); fc(x - 22, y - 50, 28, n > 0.5 ? '#2f5a52' : '#86d474');
    }
    X.fillStyle = n > 0.5 ? '#355c48' : '#7fcf62'; X.beginPath(); X.moveTo(-1000, 790);
    for (let x = -1000; x <= 3800; x += 90) X.quadraticCurveTo(x + 45, 740 + srand(x + 5) * 20, x + 90, 790);
    X.lineTo(3800, 800); X.lineTo(-1000, 800); X.fill();
    floorGrass(-1000, 3800);
    for (let i = 0; i < 26; i++) {
      const x = srand(i + 100) * 2800, y = 820 + srand(i + 200) * 150;
      if (Math.abs(y - 880) < 45) continue;
      const c = ['#ff7eb6', '#ffd23f', '#ffffff', '#a77bf3'][i % 4];
      line(x, y, x, y - 18, 3, '#4ea83c');
      for (let k = 0; k < 5; k++) { const a = (k / 5) * TAU; fc(x + Math.cos(a) * 6, y - 22 + Math.sin(a) * 6, 5, c); }
      fc(x, y - 22, 4, '#ff9f43');
    }
    if (n > 0.5 && Math.random() < 0.25) emit('firefly', rand(G.cam.parque || 0, (G.cam.parque || 0) + VW), rand(500, 900), 1);
  },
  props: [
    { id: 'tree', x: 0, y: 0, w: 0, h: 0,
      draw() {
        softShadow(330, 810, 170);
        fpoly([290, 810, 300, 420, 360, 420, 372, 810], LG(290, 0, 372, 0, '#a0754d', '#8a5f3a'));
        X.beginPath(); X.moveTo(320, 470); X.quadraticCurveTo(250, 450, 190, 460); stroke(22, '#8a5f3a');
        X.beginPath(); X.moveTo(340, 470); X.quadraticCurveTo(420, 450, 480, 460); stroke(22, '#8a5f3a');
        const c = G.nightK > 0.5 ? ['#2f6b4e', '#3a7d5a'] : ['#5fbf4a', '#7ed957'];
        [[330, 260, 150], [200, 320, 100], [460, 320, 100], [260, 200, 100], [410, 200, 100], [330, 150, 90]].forEach(([x, y, r], i) => fc(x, y, r, c[i % 2]));
        [[280, 190], [380, 260], [220, 320], [440, 300], [330, 130]].forEach(([x, y]) => fc(x, y, 12, '#ff6b6b'));
      },
      front() {
        const c = G.nightK > 0.5 ? '#3a7d5a' : '#6fcd57';
        fc(170, 420, 46, c); fc(500, 420, 46, c);
      } },
    { id: 'swings', x: 680, y: 260, w: 440, h: 560, state: { a: [0.04, -0.03], v: [0, 0] },
      tap(s, w) { const i = w.x < 900 ? 0 : 1; s.v[i] += (s.v[i] >= 0 ? 1 : -1) * 0.9; Sfx.whoosh(); return true; },
      update(s, dt, st) {
        for (let i = 0; i < 2; i++) {
          const occ = seatOccupied('parque', i);
          s.v[i] += -6.6 * Math.sin(s.a[i]) * dt;
          if (occ && Math.abs(s.a[i]) < 0.3) s.v[i] += Math.sign(s.v[i] || 1) * dt * 0.6;
          s.v[i] *= Math.pow(occ ? 0.9 : 0.6, dt);
          s.a[i] = clamp(s.a[i] + s.v[i] * dt, -0.9, 0.9);
        }
      },
      draw(s) {
        softShadow(900, 812, 270);
        const col = '#ff6b6b';
        line(660, 810, 720, 290, 16, shade(col, -0.15)); line(1140, 810, 1080, 290, 16, shade(col, -0.15));
        line(640, 290, 1160, 290, 20, col);
        line(700, 810, 735, 300, 14, col); line(1100, 810, 1065, 300, 14, col);
        SWING.xs.forEach((px, i) => {
          const a = s.a[i], sx = px + Math.sin(a) * SWING.L, sy = SWING.py + Math.cos(a) * SWING.L;
          const ox = Math.cos(a) * 46, oy = -Math.sin(a) * 46;
          line(px - 40, SWING.py, sx - ox, sy - oy, 4, '#9aa6b2'); line(px + 40, SWING.py, sx + ox, sy + oy, 4, '#9aa6b2');
          X.save(); X.translate(sx, sy); X.rotate(a); fr(-58, -4, 116, 18, 8, '#ffd23f'); X.restore();
        });
      } },
    { id: 'slide', x: 1260, y: 330, w: 500, h: 470,
      dropRect: { x: 1240, y: 300, w: 220, h: 300 },
      drop(e) {
        if (e.kind === 'item' && ITEMS[e.type].float) return false;
        e.state = 'slide'; e.su = 0; e.seat = null; Sfx.whoosh(); return true;
      },
      tap() { Sfx.click(); UI.toast('Solte alguém no topo do escorregador!'); return true; },
      draw() {
        softShadow(1500, 810, 260);
        line(1295, 478, 1290, 808, 12, '#4dabf7'); line(1355, 478, 1352, 808, 12, '#4dabf7');
        for (let y = 520; y < 800; y += 46) line(1295, y, 1352, y, 8, '#82c6fb');
        fr(1278, 466, 132, 18, 6, '#2f86d6');
        line(1395, 478, 1395, 808, 12, '#4dabf7');
        X.beginPath(); for (let u = 0; u <= 1.001; u += 0.05) { const p = slideP(u); u ? X.lineTo(p.x, p.y + 10) : X.moveTo(p.x, p.y + 10); }
        stroke(44, '#ff9f43');
        X.beginPath(); for (let u = 0; u <= 1.001; u += 0.05) { const p = slideP(u); u ? X.lineTo(p.x, p.y + 4) : X.moveTo(p.x, p.y + 4); }
        stroke(26, '#ffc06b');
        X.beginPath(); X.moveTo(1290, 400); X.lineTo(1290, 470); X.moveTo(1400, 400); X.lineTo(1400, 470); X.moveTo(1290, 400); X.lineTo(1400, 400); stroke(8, '#2f86d6');
      } },
    streetLamp('lamp1', 1790),
    { id: 'fountain', x: 1850, y: 520, w: 300, h: 290, z: 801,
      dropRect: { x: 1850, y: 560, w: 300, h: 250 },
      drop(e) { emit('drop', e.x, 740, 14, 1); Sfx.splash(); return false; },
      tap() { Sfx.splash(); emit('drop', 2000, 560, 16, 1); return true; },
      update(s, dt) { if (Math.random() < dt * 14) emit('drop', 2000 + rand(-8, 8), 540, 1, 1); },
      draw(s, t) {
        softShadow(2000, 806, 190);
        fe(2000, 778, 160, 30, '#c9d5e0'); fr(1840, 740, 320, 56, 26, LG(0, 740, 0, 796, '#e6ebf0', '#b7c6d4'));
        fe(2000, 744, 148, 18, LG(0, 726, 0, 762, '#7fd0ff', '#4dabf7'));
        for (let i = 0; i < 4; i++) fe(2000 + Math.sin(t * 2 + i * 2) * 90, 744, 16, 3, 'rgba(255,255,255,.6)');
        fr(1984, 600, 32, 140, 10, '#d4dae2');
        fe(2000, 600, 70, 14, '#c9d5e0'); fe(2000, 596, 60, 9, '#7fd0ff');
        for (const d of [-1, 1]) {
          X.beginPath(); X.moveTo(2000, 560); X.quadraticCurveTo(2000 + d * 70, 520, 2000 + d * 110, 740);
          X.setLineDash([16, 12]); X.lineDashOffset = -t * 60; stroke(6, 'rgba(160,220,255,.9)'); X.setLineDash([]);
        }
        fr(1994, 548, 12, 52, 5, '#d4dae2');
      } },
    { id: 'balloons', x: 2170, y: 220, w: 110, h: 360, state: {},
      tap() {
        if (!canSpawn()) return true;
        const it = spawnItem('balloon', 2215, 520, 'parque'); it.col = pick(['#ff5d8f', '#4dabf7', '#ffd23f', '#7ed957', '#a77bf3', '#ff9f43']);
        it.state = 'float'; it.vy = -40; Sfx.pop(); return true;
      },
      draw(s, t) {
        [['#ff5d8f', -26, 0], ['#4dabf7', 16, -20], ['#ffd23f', -4, -46], ['#7ed957', 28, 20]].forEach(([c, dx, dy], i) => {
          const bx = 2215 + dx + Math.sin(t * 1.5 + i) * 5, by = 300 + dy;
          X.beginPath(); X.moveTo(2240, 560); X.quadraticCurveTo(bx, by + 140, bx, by + 50); stroke(2, '#9aa6b2');
          fe(bx, by, 32, 40, RG(bx - 10, by - 16, 3, 46, shade(c, 0.35), c, shade(c, -0.2)));
          fe(bx - 12, by - 14, 6, 11, 'rgba(255,255,255,.45)', 0.4);
        });
      } },
    { id: 'cart', x: 2260, y: 240, w: 260, h: 560, state: {},
      tap() {
        if (!canSpawn()) return true;
        spawnItem('icecream', rand(2300, 2470), 560, 'parque'); Sfx.ding(); return true;
      },
      draw(s, t) {
        softShadow(2385, 806, 160);
        line(2385, 250, 2385, 560, 8, '#c9d5e0');
        for (let i = 0; i < 8; i++) {
          const a0 = Math.PI + (i / 8) * Math.PI, a1 = Math.PI + ((i + 1) / 8) * Math.PI;
          X.beginPath(); X.moveTo(2385, 250); X.lineTo(2385 + Math.cos(a0) * 150, 330 + Math.sin(a0) * 10); X.lineTo(2385 + Math.cos(a1) * 150, 330 + Math.sin(a1) * 10); X.closePath();
          X.fillStyle = i % 2 ? '#ffffff' : '#2ec4b6'; X.fill();
        }
        fr(2264, 560, 242, 180, 22, LG(0, 560, 0, 740, '#ffffff', '#e6f2f8'));
        fr(2264, 560, 242, 18, 8, '#2ec4b6');
        fr(2290, 600, 190, 90, 16, '#ff7eb6');
        X.font = '600 32px Fredoka, sans-serif'; X.textAlign = 'center'; X.fillStyle = '#fff'; X.fillText('Sorvetes', 2385, 656);
        for (const wx of [2310, 2460]) { fc(wx, 760, 36, '#3a3d58'); fc(wx, 760, 16, '#c9d5e0'); }
        line(2510, 620, 2560, 600, 8, '#c9d5e0');
      } },
    streetLamp('lamp2', 2585),
    { id: 'bench', x: 0, y: 0, w: 0, h: 0,
      draw() {
        softShadow(2690, 806, 140);
        fr(2600, 640, 180, 22, 8, '#c98a55'); fr(2600, 676, 180, 22, 8, '#c98a55');
        fr(2592, 760, 196, 22, 8, '#d9985f');
        line(2615, 640, 2615, 806, 10, '#3a3d58'); line(2765, 640, 2765, 806, 10, '#3a3d58');
      } },
  ],
  init() {
    return [
      I('ball', 600, 900), I('apple', 340, 452), I('icecream', 2330, 560),
      C('Caio', 'parque', 800, 720, { seat: 0 }), C('Malu', 'parque', 1500, 900),
    ];
  },
};
function swingPos(st, i) {
  const a = st.swings.a[i], px = SWING.xs[i];
  return { x: px + Math.sin(a) * SWING.L, y: SWING.py + Math.cos(a) * SWING.L, ang: a };
}
