'use strict';
// ======================================================
//  FUNDO DO MAR
// ======================================================
function coral(x, y, s, c) {
  X.save(); X.translate(x, y); X.scale(s, s);
  const br = (ang, len, w) => { X.save(); X.rotate(ang); fr(-w / 2, -len, w, len, w / 2, c); fc(0, -len, w * 0.7, shade(c, 0.15)); X.restore(); };
  br(0, 90, 22); br(-0.6, 70, 18); br(0.6, 74, 18); br(-1.1, 44, 14); br(1.1, 46, 14);
  X.restore();
}
function fishShape(x, y, s, c, dir) {
  X.save(); X.translate(x, y); X.scale(s * dir, s);
  fe(0, 0, 22, 13, c); fpoly([-18, 0, -34, -12, -34, 12], shade(c, -0.1)); fpoly([-2, -12, 8, -22, 10, -10], shade(c, -0.1));
  fc(10, -3, 3.2, '#ffffff'); fc(11, -3, 1.8, '#1d1f2e'); fe(0, 4, 10, 4, 'rgba(255,255,255,.3)');
  X.restore();
}
SCENES.mar = {
  id: 'mar', name: 'Fundo do mar', W: 2600, floorTop: 815, floorBot: 950, ceil: 60, underwater: true,
  surfaces: [{ x1: 1560, x2: 1980, y: 610 }, { x1: 180, x2: 420, y: 700 }],
  seats: [{ x: 300, y: 690, kind: 'chair' }, { x: 900, y: 790, kind: 'chair' }],
  bg(st, t) {
    const n = G.nightK;
    X.fillStyle = LG(0, -1200, 0, 1000, n > 0.5 ? '#0b2a52' : '#3fb7e8', n > 0.5 ? '#08213f' : '#1f86c4', n > 0.5 ? '#041328' : '#0d4d86'); X.fillRect(-1000, -1400, 5000, 2500);
    // raios de luz
    X.save(); X.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 7; i++) {
      const x = i * 420 - 200 + Math.sin(t * 0.3 + i) * 60;
      fpoly([x, -200, x + 90, -200, x + 260, 900, x + 120, 900], `rgba(200,240,255,${0.05 + 0.03 * Math.sin(t + i)})`);
    }
    X.restore();
    // silhuetas de pedras ao fundo
    X.fillStyle = 'rgba(10,50,90,.45)'; X.beginPath(); X.moveTo(-1000, 820);
    for (let x = -1000; x <= 3800; x += 260) X.quadraticCurveTo(x + 130, 560 + srand(x + 7) * 140, x + 260, 820);
    X.lineTo(3800, 900); X.lineTo(-1000, 900); X.fill();
    // cardumes ao longe
    for (let g = 0; g < 3; g++) for (let i = 0; i < 7; i++) {
      const dir = g % 2 ? -1 : 1, base = ((t * (40 + g * 15) * dir + g * 900) % 3400 + 3400) % 3400 - 400;
      fishShape(base + (i % 4) * 30, 220 + g * 140 + Math.floor(i / 4) * 22 + Math.sin(t * 2 + i) * 6, 0.5, ['#ffd23f', '#ff9f43', '#9fd3ff'][g], dir);
    }
    // tartaruga
    const tx = ((t * 25) % 3400) - 400, ty = 400 + Math.sin(t * 0.7) * 30;
    X.save(); X.translate(tx, ty);
    fe(0, 0, 60, 38, '#5f9e4a'); for (let i = 0; i < 5; i++) fe(-30 + i * 15, -6 + (i % 2) * 10, 10, 9, '#7ac05f');
    fe(66, -4, 22, 16, '#8fcf6a'); fc(76, -8, 3, '#1d1f2e');
    fe(30, 30, 24, 8, '#8fcf6a', 0.6 + Math.sin(t * 3) * 0.3); fe(-30, 30, 20, 7, '#8fcf6a', -0.6 - Math.sin(t * 3) * 0.3);
    X.restore();
    // areia
    X.fillStyle = LG(0, 790, 0, 1200, '#f0dca4', '#d9bf7e'); X.fillRect(-1000, 790, 5000, 700);
    for (let i = 0; i < 40; i++) { const x = srand(i + 70) * 2600, y = 820 + srand(i + 90) * 200; X.beginPath(); X.arc(x, y, 30, Math.PI * 1.1, Math.PI * 1.9); stroke(2, 'rgba(160,120,60,.3)'); }
    // algas
    for (let i = 0; i < 18; i++) {
      const x = srand(i + 200) * 2600, h = 120 + srand(i + 220) * 200;
      X.beginPath(); X.moveTo(x, 800);
      for (let k = 1; k <= 8; k++) X.lineTo(x + Math.sin(t * 1.5 + i + k * 0.6) * 14 * (k / 8), 800 - h * k / 8);
      stroke(12, i % 2 ? '#3fae49' : '#2f8f5a');
    }
    coral(120, 800, 1, '#ff7eb6'); coral(1100, 800, 1.2, '#ff9f43'); coral(1280, 805, 0.8, '#a77bf3'); coral(2300, 800, 1.1, '#ff6b6b'); coral(2480, 805, 0.7, '#ffd23f');
    if (Math.random() < 0.15) emit('bubble', rand(G.cam.mar || 0, (G.cam.mar || 0) + VW), 800, 1);
  },
  props: [
    { id: 'trono', x: 170, y: 560, w: 260, h: 250,
      draw() {
        softShadow(300, 812, 140);
        fe(300, 760, 130, 60, '#8a9bb0'); fe(300, 730, 110, 40, '#a3b3c6');
        X.beginPath(); X.moveTo(190, 700); X.quadraticCurveTo(300, 470, 410, 700); X.closePath(); X.fillStyle = '#ff9ec4'; X.fill();
        for (let i = 0; i < 6; i++) line(300, 700, 210 + i * 36, 560 + Math.abs(i - 2.5) * 30, 4, '#ffb3cf');
        fc(300, 560, 14, '#ffffff');
      } },
    { id: 'concha', x: 800, y: 650, w: 200, h: 160, state: { open: false },
      tap(s) { s.open = !s.open; Sfx.bloop(); return true; },
      draw(s) {
        softShadow(900, 812, 100);
        X.beginPath(); X.arc(900, 800, 96, Math.PI, 0); X.closePath(); X.fillStyle = '#f7b6d2'; X.fill();
        for (let i = 0; i < 7; i++) line(900, 800, 900 + Math.cos(Math.PI + i * Math.PI / 6) * 92, 800 + Math.sin(Math.PI + i * Math.PI / 6) * 92, 3, '#e98bb4');
        const a = s.open ? -0.9 : 0;
        X.save(); X.translate(820, 790); X.rotate(a);
        X.beginPath(); X.arc(80, 0, 92, Math.PI, 0); X.closePath(); X.fillStyle = s.open ? '#ffc8de' : 'rgba(0,0,0,0)'; X.fill();
        X.restore();
        if (s.open) fc(900, 778, 16, RG(894, 772, 2, 18, '#ffffff', '#efe2ff'));
      } },
    { id: 'navio', x: 1520, y: 380, w: 520, h: 430, state: { opened: false },
      tap(s, w) {
        if (w.x > 1860 && w.y > 700 && !s.opened) { s.opened = true; Sfx.door(); spawnTreasure('perola', 1930, 760, 'mar'); UI.toast('O baú se abriu! Uma pérola! 🦪'); return true; }
        Sfx.bloop(); emit('bubble', w.x, w.y, 6); return true;
      },
      draw(s, t) {
        softShadow(1780, 812, 280);
        X.save(); X.translate(1780, 700); X.rotate(-0.12);
        fpoly([-240, -80, 240, -80, 200, 60, -200, 60], '#6b4428');
        for (let i = 0; i < 5; i++) line(-230 + i * 10, -60 + i * 26, 230 - i * 10, -60 + i * 26, 3, 'rgba(0,0,0,.2)');
        fc(-120, -20, 18, '#2f4a5c'); fc(-40, -20, 18, '#2f4a5c'); fc(40, -20, 18, '#2f4a5c');
        fr(-14, -340, 20, 270, 4, '#5a3520');
        X.beginPath(); X.moveTo(6, -320); X.quadraticCurveTo(110, -260 + Math.sin(t) * 8, 6, -170); X.closePath(); X.fillStyle = 'rgba(240,230,210,.55)'; X.fill();
        X.restore();
        const lid = s.opened ? -0.8 : 0;
        fr(1880, 740, 100, 60, 8, '#8a5532'); fr(1878, 760, 104, 8, 3, '#ffcf3d');
        X.save(); X.translate(1880, 742); X.rotate(lid); fr(0, -34, 100, 36, 14, '#a0662f'); fr(42, -14, 16, 18, 4, '#ffcf3d'); X.restore();
        if (!s.opened && Math.sin(t * 3) > 0.7) { starPath(1960, 730, 8, 4, 0.3); X.fillStyle = '#fff3a8'; X.fill(); }
      } },
    { id: 'agua-viva', x: 2050, y: 200, w: 200, h: 300, state: { glow: 0 },
      tap(s) { s.glow = 3; Sfx.sparkle(); return true; },
      update(s, dt) { s.glow = Math.max(0, s.glow - dt); },
      light(s) { return { x: 2150, y: 330 + Math.sin(G.t) * 40, r: s.glow > 0 ? 420 : 200, col: '#ff9ef0' }; },
      draw(s, t) {
        const y = 330 + Math.sin(t) * 40, p = 1 + Math.sin(t * 3) * 0.08, a = s.glow > 0 ? 0.95 : 0.7;
        for (let i = 0; i < 5; i++) { X.beginPath(); X.moveTo(2120 + i * 15, y); X.quadraticCurveTo(2120 + i * 15 + Math.sin(t * 2 + i) * 14, y + 70, 2120 + i * 15, y + 130); stroke(3, `rgba(255,170,240,${a})`); }
        X.beginPath(); X.ellipse(2150, y, 60 * p, 48 / p, 0, Math.PI, 0); X.closePath(); X.fillStyle = `rgba(255,160,235,${a})`; X.fill();
        fe(2135, y - 24, 16, 8, 'rgba(255,255,255,.5)', -0.3);
      } },
    { id: 'pedra', x: 2380, y: 680, w: 200, h: 130,
      draw() { softShadow(2470, 812, 110); fe(2470, 780, 100, 46, '#7d8ea3'); fe(2450, 760, 70, 30, '#93a3b6'); for (let i = 0; i < 4; i++) fc(2410 + i * 30, 752 - (i % 2) * 8, 6, '#ffd23f'); } },
  ],
  update(dt) {
    for (const e of G.ents) {
      if (e.scene !== 'mar' || e.kind !== 'char') continue;
      if (Math.random() < dt * 0.8 && e.state !== 'held') { const h = headPos(e); emit('bubble', h.x + 30, h.y + 20, 1); }
      if (e.bottom === 'mermaid') Album.unlock('a_sereia');
    }
  },
  init() {
    return [
      I('shell', 600, 900), I('starfish', 1300, 920), I('shell', 2200, 905),
      C('Iara', 'mar', 300, 690, { seat: 0, look: Object.assign(randomLook(), { top: 'tank', shirt: '#a77bf3', bottom: 'mermaid', pants: '#2ec4b6', hairStyle: 11, hairColor: '#e2553e' }) }),
      C('Rui', 'mar', 1200, 900),
    ];
  },
};

SCENE_ORDER.length = 0;
SCENE_ORDER.push('casa', 'apto', 'cafe', 'mercado', 'escola', 'estudio', 'petshop', 'estancia', 'praia', 'mar', 'parque');
