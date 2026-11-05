'use strict';
// ======================================================
//  Mapa da vila: visão geral ilustrada, toque num lugar para viajar
// ======================================================
const MapView = (() => {
  const MW = 1600, MH = 1000;
  const LOCS = {
    petshop: { x: 430, y: 360 }, estudio: { x: 790, y: 280 }, apto: { x: 590, y: 470 },
    casa: { x: 330, y: 610 }, cafe: { x: 830, y: 585 }, mercado: { x: 1050, y: 440 },
    escola: { x: 1250, y: 560 }, parque: { x: 900, y: 790 }, praia: { x: 1330, y: 830 },
    estancia: { x: 560, y: 820 }, mar: { x: 1470, y: 250 },
  };
  const ROADS = [
    [[180, 700], [330, 660], [520, 610], [700, 600], [840, 610], [1000, 590], [1180, 610], [1330, 640], [1440, 700]],
    [[590, 520], [600, 610]], [[430, 410], [470, 520], [590, 520], [800, 370], [1000, 480], [1050, 490]],
    [[820, 610], [860, 720], [900, 820]], [[1250, 610], [1300, 740], [1330, 860]], [[330, 660], [340, 640]],
    [[520, 610], [540, 720], [560, 840]],
  ];
  let el, cv, ctx, open = false, hover = null, press = null, zoom = null, alphaIn = 0;
  let scale = 1, ox = 0, oy = 0, panX = 0, panY = 0, drag = null, lastW = 0, lastH = 0;
  const ptrs = new Map();

  // ---------- geometria ----------
  function islandPath(k = 1) {
    X.beginPath();
    for (let i = 0; i <= 64; i++) {
      const a = (i / 64) * TAU;
      const r = 1 + Math.sin(a * 3 + 1) * 0.05 + Math.sin(a * 5 + 2) * 0.035 + Math.sin(a * 9) * 0.015;
      const x = 800 + Math.cos(a) * 730 * r * k, y = 545 + Math.sin(a) * 440 * r * k;
      i ? X.lineTo(x, y) : X.moveTo(x, y);
    }
    X.closePath();
  }
  function roadPath(pts) {
    X.beginPath(); X.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length - 1; i++) {
      const mx = (pts[i][0] + pts[i + 1][0]) / 2, my = (pts[i][1] + pts[i + 1][1]) / 2;
      X.quadraticCurveTo(pts[i][0], pts[i][1], mx, my);
    }
    const l = pts[pts.length - 1]; X.lineTo(l[0], l[1]);
  }
  function along(pts, u) {
    const seg = pts.length - 1, f = u * seg, i = Math.min(seg - 1, Math.floor(f)), k = f - i;
    return [lerp(pts[i][0], pts[i + 1][0], k), lerp(pts[i][1], pts[i + 1][1], k), Math.atan2(pts[i + 1][1] - pts[i][1], pts[i + 1][0] - pts[i][0])];
  }

  // ---------- arte dos prédios (origem: base central) ----------
  function win(x, y, w, h) {
    const n = G.nightK;
    fr(x, y, w, h, 4, n > 0.5 ? '#ffe08a' : '#bfe6ff');
    if (n <= 0.5) fpoly([x, y, x + w * 0.5, y, x, y + h * 0.6], 'rgba(255,255,255,.5)');
  }
  function roofTri(x1, x2, base, top, col) { fpoly([x1 - 10, base, (x1 + x2) / 2, top, x2 + 10, base], col); fpoly([x1 - 10, base, (x1 + x2) / 2, top, (x1 + x2) / 2, base], 'rgba(255,255,255,.12)'); }
  const B = {
    casa() {
      fr(64, -150, 18, 40, 3, '#c4302b');
      fr(-66, -96, 132, 96, 8, LG(-66, 0, 66, 0, '#fff7ec', '#f3e3d0'));
      roofTri(-66, 66, -90, -160, '#ff6b6b');
      fr(-14, -50, 28, 50, 6, '#c98a55'); fc(8, -24, 3, '#ffd23f');
      win(-52, -70, 28, 26); win(24, -70, 28, 26);
      fr(-72, -4, 144, 8, 4, '#d9c6ae');
      pottedPlantMini(-58, 0); pottedPlantMini(58, 0);
    },
    apto() {
      fr(-56, -200, 112, 200, 8, LG(-56, 0, 56, 0, '#b6c3ff', '#8c9ef5'));
      fr(-62, -208, 124, 14, 5, '#6f82e0');
      for (let r = 0; r < 5; r++) for (let c = 0; c < 3; c++) win(-44 + c * 32, -186 + r * 32, 24, 20);
      fr(-16, -38, 32, 38, 5, '#ff8fb8'); fr(-30, -44, 60, 8, 3, '#ffffff');
    },
    cafe() {
      fr(-70, -110, 140, 110, 8, '#fff1dc');
      fr(-74, -122, 148, 18, 6, '#c27a4a');
      for (let i = 0; i < 7; i++) { X.beginPath(); X.moveTo(-70 + i * 20, -104); X.lineTo(-50 + i * 20, -104); X.arc(-60 + i * 20, -104, 10, 0, Math.PI); X.closePath(); X.fillStyle = i % 2 ? '#ffffff' : '#ff6b6b'; X.fill(); }
      win(-56, -82, 50, 40); fr(14, -64, 34, 64, 6, '#8a5532');
      fc(0, -150, 22, '#ffffff'); fr(-12, -160, 24, 18, 5, '#ff7eb6'); X.beginPath(); X.arc(13, -152, 6, -1.2, 1.2); stroke(3, '#ff7eb6');
    },
    mercado() {
      fr(-90, -110, 180, 110, 8, '#e3f6ef');
      fr(-96, -130, 192, 26, 8, '#2ec4b6');
      X.font = '600 20px Fredoka, sans-serif'; X.textAlign = 'center'; X.fillStyle = '#fff'; X.fillText('Mercado', 0, -110);
      win(-78, -88, 60, 50); win(18, -88, 60, 50);
      fr(-18, -50, 36, 50, 5, '#9fe8de');
      fc(-56, -22, 9, '#ff6b6b'); fc(-40, -24, 9, '#ffd23f'); fc(-48, -36, 9, '#7ed957');
    },
    escola() {
      fr(-94, -110, 188, 110, 8, '#ffe3a8');
      roofTri(-94, 94, -104, -150, '#ff9f43');
      fr(-18, -200, 36, 70, 6, '#ffcf5c'); roofTri(-18, 18, -196, -226, '#e2553e');
      fc(0, -176, 10, '#ffffff'); line(0, -176, 0, -183, 2, '#2f3241'); line(0, -176, 5, -176, 2, '#2f3241');
      line(40, -150, 40, -210, 3, '#9aa0aa'); fpoly([40, -210, 70, -200, 40, -190], '#4dabf7');
      for (let i = 0; i < 4; i++) win(-82 + i * 44, -86, 32, 30);
      fr(-16, -44, 32, 44, 5, '#4dabf7');
    },
    estudio() {
      fr(-66, -120, 132, 120, 10, '#ffd0e2');
      X.beginPath(); X.moveTo(-74, -116); X.quadraticCurveTo(-37, -150, 0, -116); X.quadraticCurveTo(37, -150, 74, -116); X.closePath(); X.fillStyle = '#ff7eb6'; X.fill();
      starPath(0, -160, 22); X.fillStyle = '#ffd23f'; X.fill();
      win(-52, -94, 104, 36); fr(-16, -50, 32, 50, 6, '#a77bf3');
      X.font = '600 15px Fredoka, sans-serif'; X.textAlign = 'center'; X.fillStyle = '#c45b8f'; X.fillText('Estilo', 0, -64);
    },
    petshop() {
      fr(-66, -104, 132, 104, 8, '#e5f1ff');
      X.beginPath(); X.moveTo(-76, -100); X.lineTo(76, -100); X.lineTo(66, -130); X.lineTo(-66, -130); X.closePath(); X.fillStyle = '#ff9ec4'; X.fill();
      fc(0, -150, 22, '#ffffff'); fe(0, -144, 9, 7, '#ff7eb6'); for (let i = 0; i < 3; i++) fc(-9 + i * 9, -156, 3.5, '#ff7eb6');
      win(-54, -80, 46, 36); fr(14, -58, 36, 58, 6, '#5c9ce6');
      fr(70, -40, 44, 40, 4, '#ffcf5c'); fpoly([64, -40, 92, -64, 120, -40], '#ff6b6b'); fe(92, -14, 10, 14, '#7a4b2a');
    },
    praia() {
      fe(0, -6, 110, 26, '#fff1c9');
      fr(-60, -26, 60, 18, 6, '#4dabf7'); for (let i = 0; i < 3; i++) fr(-56 + i * 20, -26, 8, 18, 0, 'rgba(255,255,255,.6)');
      line(26, -10, 26, -110, 4, '#ffffff');
      for (let i = 0; i < 6; i++) { const a0 = Math.PI + (i / 6) * Math.PI, a1 = Math.PI + ((i + 1) / 6) * Math.PI; X.beginPath(); X.moveTo(26, -120); X.lineTo(26 + Math.cos(a0) * 60, -96 + Math.sin(a0) * 6); X.lineTo(26 + Math.cos(a1) * 60, -96 + Math.sin(a1) * 6); X.closePath(); X.fillStyle = i % 2 ? '#ffffff' : '#ff9f43'; X.fill(); }
      X.save(); X.translate(-70, 0); X.scale(0.42, 0.42); palm(0, 0, 1); X.restore();
      fr(60, -20, 20, 14, 4, '#e8c27a'); fr(64, -34, 12, 16, 3, '#d4a85c');
    },
    estancia() {
      fe(0, -4, 130, 30, '#b9e08f');
      for (let i = 0; i < 4; i++) fr(30 + i * 22, -40, 14, 36, 4, i % 2 ? '#ffd23f' : '#7ed957');
      fr(-110, -90, 100, 90, 6, '#c4302b'); fpoly([-120, -88, -60, -132, 0, -88], '#9a2420');
      line(-90, -60, -40, -10, 5, '#ffffff'); line(-40, -60, -90, -10, 5, '#ffffff');
      fr(-6, -120, 26, 120, 12, '#d4dae2'); fe(7, -120, 13, 6, '#e6ebf0');
      fe(66, -14, 26, 14, '#ffffff'); fe(58, -16, 8, 6, '#2f3241'); fc(88, -22, 9, '#ffffff');
      line(-130, -30, -130, -80, 3, '#9aa0aa'); fpoly([-130, -80, -96, -80, -130, -56], '#2f9e44'); fpoly([-96, -80, -96, -56, -130, -56], '#ffd43b');
    },
    mar() {
      const t = G.t;
      for (let i = 0; i < 3; i++) { X.beginPath(); X.arc(0, -10, 50 + i * 26 + (t * 20 % 26), Math.PI * 1.1, Math.PI * 1.9); stroke(3, 'rgba(255,255,255,.5)'); }
      fpoly([-60, -30, 60, -30, 46, 0, -46, 0], '#ffffff'); fr(-30, -60, 40, 30, 6, '#ff9f43');
      line(30, -30, 30, -110, 4, '#9aa0aa'); fr(30, -110, 40, 26, 2, '#e8283f'); line(30, -110, 70, -84, 4, '#ffffff');
      const jx = Math.sin(t * 2) * 30, jy = -Math.abs(Math.sin(t * 2)) * 50;
      X.save(); X.translate(-70 + jx, -20 + jy); X.rotate(Math.cos(t * 2) * 0.6); fe(0, 0, 16, 9, '#ffd23f'); fpoly([-12, 0, -24, -8, -24, 8], '#ff9f43'); X.restore();
      for (let i = 0; i < 4; i++) fc(-10 + i * 10, -70 - ((t * 30 + i * 20) % 60), 4, 'rgba(255,255,255,.8)');
    },
    parque() {
      fe(0, -4, 120, 30, '#8fdc7a');
      fe(-30, -6, 34, 10, '#7fd0ff');
      line(-90, 0, -80, -70, 5, '#ff6b6b'); line(-30, 0, -40, -70, 5, '#ff6b6b'); line(-86, -70, -34, -70, 6, '#ff6b6b');
      line(-70, -70, -70, -30, 2, '#9aa6b2'); line(-50, -70, -50, -30, 2, '#9aa6b2'); fr(-76, -32, 32, 6, 3, '#ffd23f');
      line(20, 0, 20, -60, 5, '#4dabf7'); X.beginPath(); X.moveTo(26, -58); X.quadraticCurveTo(60, -40, 80, 0); stroke(9, '#ff9f43');
      treeMini(-110, -6, 0.9); treeMini(100, -10, 1.1); treeMini(70, -40, 0.8);
    },
  };
  function treeMini(x, y, s) {
    X.save(); X.translate(x, y); X.scale(s, s);
    fe(0, 2, 22, 6, 'rgba(0,40,0,.15)'); fr(-4, -24, 8, 26, 3, '#8a5f3a');
    const n = G.nightK > 0.5;
    fc(0, -40, 22, n ? '#2f6b4e' : '#5fbf4a'); fc(-10, -30, 15, n ? '#2a5e45' : '#4ea83c'); fc(8, -52, 12, 'rgba(255,255,255,.14)');
    X.restore();
  }
  function pottedPlantMini(x, y) { fr(x - 6, y - 12, 12, 12, 3, '#ff9b6a'); fc(x, y - 18, 9, '#5fbf4a'); }

  // ---------- desenho ----------
  function drawMini(e, x, y, s, t) {
    const keep = { x: e.x, y: e.y, state: e.state, ang: e.ang, sq: e.sq, pop: e.pop };
    X.save(); X.translate(x, y); X.scale(s, s);
    e.x = 0; e.y = 0; e.state = 'idle'; e.ang = 0; e.sq = 0; e.pop = null;
    if (e.kind === 'char') drawChar(e, t, true); else drawItemShape(e, t);
    Object.assign(e, keep);
    X.restore();
  }
  function drawMap(t) {
    const w = cv.clientWidth, h = cv.clientHeight, d = Math.min(devicePixelRatio || 1, 2);
    if (cv.width !== Math.round(w * d) || cv.height !== Math.round(h * d)) { cv.width = Math.round(w * d); cv.height = Math.round(h * d); }
    if (w !== lastW || h !== lastH) { fit(w, h); lastW = w; lastH = h; }
    const prevX = X, prevInv = G.viewInv;
    X = ctx; G.viewInv = null;
    X.setTransform(d, 0, 0, d, 0, 0);
    // mar
    X.fillStyle = LG(0, 0, 0, h, '#6fd6f5', '#3aaee0'); X.fillRect(0, 0, w, h);
    let zs = 1, zx = 0, zy = 0;
    if (zoom) { const k = easeInOut(Math.min(1, zoom.t / 0.55)); zs = 1 + k * 2.2; zx = zoom.x; zy = zoom.y; }
    const s = scale * zs;
    const tx = ox + panX, ty = oy + panY;
    X.setTransform(d * s, 0, 0, d * s, d * (tx * zs + (1 - zs) * (zx * scale + tx) + 0), d * (ty * zs + (1 - zs) * (zy * scale + ty)));
    // ondinhas
    for (let i = 0; i < 70; i++) {
      const x = srand(i) * 2400 - 400, y = srand(i + 70) * 1500 - 250, o = Math.sin(t * 1.5 + i) * 6;
      X.beginPath(); X.arc(x + o, y, 14, Math.PI * 1.15, Math.PI * 1.85); stroke(3, 'rgba(255,255,255,.35)');
    }
    // barco
    const bx = ((t * 22) % 2400) - 400, by = 960 + Math.sin(t * 1.2) * 6;
    fpoly([bx - 40, by, bx + 40, by, bx + 30, by + 16, bx - 30, by + 16], '#ffffff'); fpoly([bx, by - 4, bx, by - 64, bx + 34, by - 6], '#ff6b6b');
    // ilha
    X.save(); X.translate(14, 22); islandPath(1.02); X.fillStyle = 'rgba(20,80,120,.25)'; X.fill(); X.restore();
    islandPath(1.03); X.fillStyle = 'rgba(255,255,255,.6)'; X.fill();
    islandPath(1); X.fillStyle = '#f7e3b0'; X.fill();
    islandPath(0.93); X.fillStyle = LG(0, 100, 0, 1000, '#a8e486', '#7ccc5c'); X.fill();
    X.save(); islandPath(0.93); X.clip();
    for (let i = 0; i < 40; i++) { const x = 100 + srand(i + 300) * 1400, y = 120 + srand(i + 340) * 820; fe(x, y, 40, 14, 'rgba(255,255,255,.08)'); }
    // montanhas
    [[170, 380, 120], [280, 330, 150], [400, 210, 110]].forEach(([x, y, r]) => {
      fpoly([x - r, y + 40, x, y - r, x + r, y + 40], '#9bb3c9'); fpoly([x, y - r, x + r, y + 40, x + 10, y + 40], '#8199b0');
      fpoly([x - r * 0.3, y - r * 0.55, x, y - r, x + r * 0.32, y - r * 0.52, x + 8, y - r * 0.6], '#ffffff');
    });
    // rio
    X.beginPath(); X.moveTo(280, 300); X.bezierCurveTo(240, 480, 120, 560, 160, 760); X.quadraticCurveTo(190, 900, 120, 1000);
    stroke(30, '#6fd0f5'); X.beginPath(); X.moveTo(280, 300); X.bezierCurveTo(240, 480, 120, 560, 160, 760); stroke(10, 'rgba(255,255,255,.35)');
    // lago no parque
    fe(1060, 800, 70, 30, '#6fd0f5'); fe(1050, 794, 40, 10, 'rgba(255,255,255,.35)');
    X.restore();
    // estradas
    for (const r of ROADS) { roadPath(r); stroke(30, '#d9cdb6'); }
    for (const r of ROADS) { roadPath(r); stroke(22, '#f3ead8'); }
    X.setLineDash([12, 14]); for (const r of ROADS) { roadPath(r); stroke(2.5, '#ffffff'); } X.setLineDash([]);
    // ponte
    fr(150, 672, 50, 34, 6, '#c98a55'); line(150, 670, 200, 670, 4, '#8a5532'); line(150, 708, 200, 708, 4, '#8a5532');
    // árvores
    const items = [];
    for (let i = 0; i < 90; i++) {
      const x = 120 + srand(i + 500) * 1360, y = 160 + srand(i + 600) * 780;
      const dx = (x - 800) / 680, dy = (y - 545) / 410; if (dx * dx + dy * dy > 0.82) continue;
      if (Object.values(LOCS).some((p) => Math.abs(p.x - x) < 120 && y > p.y - 200 && y < p.y + 50)) continue;
      if (x < 470 && y < 430) continue;
      items.push({ y, f: () => treeMini(x, y, 0.8 + srand(i) * 0.5) });
    }
    for (const id in LOCS) {
      const p = LOCS[id];
      items.push({ y: p.y, f: () => {
        const hv = hover === id, pr = press === id;
        const k = pr ? 0.94 : hv ? 1.08 : 1;
        X.save(); X.translate(p.x, p.y); X.scale(k, k);
        fe(0, 4, 100, 18, 'rgba(30,60,30,.18)');
        B[id]();
        X.restore();
      } });
    }
    items.sort((a, b) => a.y - b.y).forEach((it) => it.f());
    // carrinho
    const [cx, cy, ca] = along(ROADS[0], (t * 0.05) % 1);
    X.save(); X.translate(cx, cy - 6); X.rotate(ca); fr(-18, -10, 36, 20, 7, '#ff6b6b'); fr(-8, -8, 14, 16, 4, '#bfe6ff'); X.restore();
    // personagens e pets ao lado dos lugares
    for (const id in LOCS) {
      const p = LOCS[id];
      const ents = G.ents.filter((e) => e.scene === id && (e.kind === 'char' || e.type === 'pet') && !e.heldBy);
      ents.slice(0, 4).forEach((e, i) => {
        const x = p.x - 66 + i * 44, y = p.y + 40 + (i % 2) * 6;
        if (e.kind === 'char') drawMini(e, x, y, 0.13, t); else drawMini(e, x, y, 0.22, t);
      });
      if (ents.length > 4) {
        fr(p.x + 112, p.y + 4, 44, 26, 13, '#ffffff');
        X.font = '600 16px Fredoka, sans-serif'; X.textAlign = 'center'; X.fillStyle = '#c45b8f'; X.fillText('+' + (ents.length - 4), p.x + 134, p.y + 23);
      }
      // rótulo
      const name = SCENES[id].name;
      X.font = '600 22px Fredoka, sans-serif';
      const tw = X.measureText(name).width + 28;
      fr(p.x - tw / 2, p.y + 56, tw, 34, 17, hover === id ? '#ff5f9e' : 'rgba(255,255,255,.95)');
      X.textAlign = 'center'; X.fillStyle = hover === id ? '#ffffff' : '#3a2f4a'; X.fillText(name, p.x, p.y + 80);
    }
    // você está aqui
    const cur = LOCS[G.sceneId];
    if (cur) {
      const pinH = { parque: 120, praia: 160, apto: 260, escola: 270, estancia: 180, mar: 160 }[G.sceneId] || 215;
      const by2 = cur.y - pinH + Math.sin(t * 4) * 8;
      X.beginPath(); X.moveTo(cur.x, by2 + 44); X.bezierCurveTo(cur.x - 30, by2 + 10, cur.x - 26, by2 - 26, cur.x, by2 - 26); X.bezierCurveTo(cur.x + 26, by2 - 26, cur.x + 30, by2 + 10, cur.x, by2 + 44); X.closePath();
      X.fillStyle = '#ff5f9e'; X.fill(); fc(cur.x, by2 - 2, 10, '#ffffff');
    }
    // nuvens e pássaros
    for (let i = 0; i < 5; i++) {
      const x = ((t * (10 + i * 3) + i * 520) % 2600) - 500, y = 120 + (i % 3) * 260;
      cloud(x, y, 1.2 + (i % 2) * 0.3, 0.85 - G.nightK * 0.4);
    }
    for (let i = 0; i < 4; i++) {
      const x = ((t * 60 + i * 400) % 2200) - 300, y = 200 + i * 60 + Math.sin(t * 2 + i) * 20, f = Math.sin(t * 12 + i) * 6;
      X.beginPath(); X.moveTo(x - 10, y - f); X.quadraticCurveTo(x - 5, y - 6, x, y); X.quadraticCurveTo(x + 5, y - 6, x + 10, y - f); stroke(2.5, '#3a3d58');
    }
    // noite
    X.setTransform(d, 0, 0, d, 0, 0);
    const n = G.nightK;
    if (n > 0.01) {
      X.globalCompositeOperation = 'multiply';
      X.fillStyle = `rgb(${Math.round(lerp(255, 90, n))},${Math.round(lerp(255, 100, n))},${Math.round(lerp(255, 170, n))})`;
      X.fillRect(0, 0, w, h); X.globalCompositeOperation = 'source-over';
    }
    if (zoom) { X.fillStyle = `rgba(255,255,255,${clamp((zoom.t - 0.25) / 0.3, 0, 1)})`; X.fillRect(0, 0, w, h); }
    else if (alphaIn < 1) { X.fillStyle = `rgba(255,255,255,${1 - alphaIn})`; X.fillRect(0, 0, w, h); }
    X = prevX; G.viewInv = prevInv;
  }
  const easeInOut = (k) => (k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2);

  // ---------- câmera do mapa ----------
  function fit(w, h) {
    const top = 64, avail = h - top;
    const contain = Math.min(w / MW, avail / MH);
    scale = Math.max(contain, Math.min((avail / MH) * 0.95, 1));
    ox = (w - MW * scale) / 2; oy = top + (avail - MH * scale) / 2;
    centerOn(G.sceneId);
  }
  function centerOn(id) {
    const w = cv.clientWidth, h = cv.clientHeight, p = LOCS[id] || { x: MW / 2, y: MH / 2 };
    panX = 0; panY = 0;
    if (MW * scale > w) panX = w / 2 - (ox + p.x * scale);
    if (MH * scale > h) panY = h / 2 - (oy + p.y * scale);
    clampPan();
  }
  function clampPan() {
    const w = cv.clientWidth, h = cv.clientHeight;
    const ex = Math.max(0, (MW * scale - w) / 2), ey = Math.max(0, (MH * scale - h) / 2);
    panX = clamp(panX, -ex - 40, ex + 40); panY = clamp(panY, -ey - 40, ey + 40);
  }
  function toMap(cx, cy) { const r = cv.getBoundingClientRect(); return { x: (cx - r.left - ox - panX) / scale, y: (cy - r.top - oy - panY) / scale }; }
  function locAt(cx, cy) {
    const m = toMap(cx, cy);
    for (const id in LOCS) { const p = LOCS[id]; if (m.x > p.x - 100 && m.x < p.x + 100 && m.y > p.y - 210 && m.y < p.y + 95) return id; }
    return null;
  }

  // ---------- entrada ----------
  function onDown(ev) {
    if (zoom) return;
    cv.setPointerCapture(ev.pointerId);
    ptrs.set(ev.pointerId, { x: ev.clientX, y: ev.clientY });
    drag = { sx: ev.clientX, sy: ev.clientY, px: panX, py: panY, moved: false };
    press = locAt(ev.clientX, ev.clientY);
  }
  function onMove(ev) {
    if (!drag) { hover = locAt(ev.clientX, ev.clientY); cv.style.cursor = hover ? 'pointer' : 'grab'; return; }
    const dx = ev.clientX - drag.sx, dy = ev.clientY - drag.sy;
    if (!drag.moved && Math.hypot(dx, dy) > 8) { drag.moved = true; press = null; }
    if (drag.moved) { panX = drag.px + dx; panY = drag.py + dy; clampPan(); }
  }
  function onUp(ev) {
    ptrs.delete(ev.pointerId);
    if (!drag) return;
    if (!drag.moved) {
      const m = toMap(ev.clientX, ev.clientY), t = G.t, bx = ((t * 22) % 2400) - 400, by = 960;
      if (Math.abs(m.x - bx) < 70 && Math.abs(m.y - by + 20) < 60) { drag = null; press = null; Sfx.bloop(); if (Album.unlock('s_barco')) UI.toast('Ahoy, marujo! ⛵'); return; }
    }
    const id = !drag.moved ? locAt(ev.clientX, ev.clientY) : null;
    drag = null; press = null;
    if (id) go(id);
  }
  function go(id) {
    const p = LOCS[id];
    zoom = { id, x: p.x, y: p.y - 60, t: 0 };
    Sfx.whoosh();
  }

  // ---------- API ----------
  function init() {
    el = document.getElementById('map'); cv = document.getElementById('mapCanvas'); ctx = cv.getContext('2d');
    cv.addEventListener('pointerdown', onDown);
    cv.addEventListener('pointermove', onMove);
    cv.addEventListener('pointerup', onUp);
    cv.addEventListener('pointercancel', onUp);
    cv.addEventListener('pointerleave', () => { hover = null; });
    document.getElementById('mapClose').addEventListener('click', () => { Sfx.click(); close(); });
    addEventListener('resize', () => { lastW = 0; });
  }
  function show() {
    if (open) return;
    open = true; zoom = null; alphaIn = 0; hover = null; lastW = 0;
    el.classList.remove('hidden'); Sfx.whoosh(); Album.unlock('a_mapa');
    UI.hideBubble();
  }
  function close() { open = false; zoom = null; el.classList.add('hidden'); }
  function tick(t, dt) {
    if (!open) return;
    alphaIn = Math.min(1, alphaIn + dt * 3);
    if (zoom) {
      zoom.t += dt;
      if (zoom.t >= 0.6) { const id = zoom.id; close(); if (id !== G.sceneId) goScene(id); else UI.setScene(id); return; }
    }
    drawMap(t);
  }
  return { init, show, close, tick, isOpen: () => open, covering: () => open && alphaIn >= 1 && !zoom };
})();
