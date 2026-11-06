'use strict';
// ================= Paletas =================
const SKINS = ['#ffe3cc', '#f9cfa8', '#eab48a', '#d39a6a', '#b07547', '#8a5532', '#61391f'];
const HAIRC = ['#2b1d16', '#5a3824', '#9a5b2c', '#d9963f', '#f3d27a', '#e2553e', '#ff8fc0', '#8d6bea', '#3cb8d2', '#f2f2f2'];
const CLOTH = ['#ff6b6b', '#ff9f43', '#ffd23f', '#7ed957', '#2ec4b6', '#4dabf7', '#5c7cfa', '#a77bf3', '#ff7eb6', '#ffffff', '#5b6474', '#2f3241', '#6a8cc7', '#ffc2d9', '#e9d8b4', '#b9e4c9'];
const SHOES = ['#2f3241', '#ffffff', '#ff6b6b', '#4dabf7', '#ffd23f', '#8a5532'];
const EYES = ['#2a1d1a', '#3b5bdb', '#2f9e44', '#7a4b2a'];
const HAIR_STYLES = ['Curto', 'Longo', 'Cacheado', 'Marias', 'Espetado', 'Coque', 'Careca', 'Rabo de cavalo', 'Tranças', 'Chanel', 'Moicano', 'Ondulado', 'Superlongo', 'Coque duplo', 'Topete', 'Dreads', 'Rabo de lado', 'Franjinha', 'Black power', 'Dividido', 'Chanel ondulado', 'Cachinhos curtos', 'Meio preso'];
const TOPS = [['tee', 'Camiseta'], ['stripes', 'Listrada'], ['tank', 'Regata'], ['shirt', 'Camisa'], ['polo', 'Polo'], ['plaid', 'Xadrez'], ['ruffle', 'Blusa de babado'], ['sweater', 'Suéter'], ['jacket', 'Jaqueta'], ['hoodie', 'Moletom'], ['raincoat', 'Capa de chuva'], ['pajama', 'Pijama'], ['crop', 'Moletom cropped'], ['cardigan', 'Colete escolar'], ['cowprint', 'Camiseta vaquinha'], ['tiedye', 'Tie-dye'], ['stripeslong', 'Listrada manga longa'], ['overalls', 'Jardineira'], ['cowdress', 'Avental vaquinha'], ['dress', 'Vestido'], ['gown', 'Vestido de baile'], ['prenda', 'Vestido de prenda'], ['icegown', 'Vestido de gelo'], ['space', 'Traje espacial']];
const BOTTOMS = [['pants', 'Calça'], ['shorts', 'Shorts'], ['skirt', 'Saia'], ['pleated', 'Saia plissada'], ['jeans', 'Jeans dobrado'], ['cargo', 'Calça cargo'], ['plaidpants', 'Calça xadrez'], ['bombacha', 'Bombacha'], ['tutu', 'Tutu de bailarina'], ['mermaid', 'Cauda de sereia']];
const SHOE_STYLES = [['sneaker', 'Tênis'], ['boot', 'Botas'], ['hightop', 'Tênis cano alto'], ['chunky', 'Tênis tratorado'], ['flat', 'Sapatilha'], ['galocha', 'Galochas'], ['pantufa', 'Pantufas de coelho'], ['patins', 'Patins']];
const NAMES = ['Lia', 'Téo', 'Nina', 'Bento', 'Zoe', 'Caio', 'Malu', 'Davi', 'Iara', 'Rui', 'Bia', 'Luca', 'Maya', 'Enzo', 'Clara', 'Gabi', 'Otto', 'Lara'];
const SLEEVE = { tee: 30, stripes: 30, dress: 16, hoodie: 72, overalls: 30, tank: 0, shirt: 34, sweater: 74, jacket: 74, gown: 0, icegown: 72, space: 74, polo: 30, plaid: 72, ruffle: 22, raincoat: 74, pajama: 74, prenda: 40, crop: 76, cardigan: 74, cowprint: 30, tiedye: 74, stripeslong: 74, cowdress: 30 };
const DRESSES = new Set(['dress', 'gown', 'icegown', 'prenda', 'cowdress']);
const LONG_GOWNS = new Set(['gown', 'icegown', 'prenda']);
const SMALL_HATS = new Set(['bow', 'flower', 'tiara', 'flowercrown', 'catears', 'mouseears', 'dotbow', 'headphones', 'unicornio', 'presilhas']);
const RANDOM_TOPS = ['tee', 'stripes', 'tank', 'shirt', 'polo', 'plaid', 'ruffle', 'sweater', 'jacket', 'hoodie', 'overalls', 'dress', 'crop', 'cardigan', 'cowprint', 'tiedye', 'stripeslong', 'cowdress'];

function randomOutfit() {
  return { top: pick(RANDOM_TOPS), shirt: pick(CLOTH), pants: pick(CLOTH), shoes: pick(SHOES), bottom: pick(['pants', 'pants', 'shorts', 'skirt', 'pleated', 'jeans', 'cargo', 'plaidpants']), shoeStyle: pick(['sneaker', 'sneaker', 'boot', 'flat', 'hightop', 'chunky']), socks: Math.random() < 0.35 ? pick(['#ffffff', '#ff7eb6', '#ffd23f', '#2f3241']) : null };
}
function randomLook() {
  return Object.assign({ skin: pick(SKINS), hairStyle: pick([0, 1, 2, 3, 4, 5, 7, 8, 9, 11, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22]), hairColor: pick(HAIRC), eyes: pick(EYES), freckles: Math.random() < 0.2, lashes: Math.random() < 0.4, back: null, neck: null, hairTip: null }, randomOutfit());
}

// ================= Personagens =================
const HY = -282; // centro da cabeça (relativo aos pés)
// contorno estilo boneca de papel: ativo só enquanto um personagem/pet é desenhado
const CHAR_INK = 'rgba(58,36,40,.88)';
let INK = null;
function ink(w = 3.2) { if (INK) stroke(w, INK); }

function torsoShape() {
  X.beginPath();
  X.moveTo(-42, -200); X.quadraticCurveTo(0, -210, 42, -200);
  X.quadraticCurveTo(56, -197, 56, -180); X.lineTo(53, -104);
  X.quadraticCurveTo(53, -86, 35, -86); X.lineTo(-35, -86);
  X.quadraticCurveTo(-53, -86, -53, -104); X.lineTo(-56, -180);
  X.quadraticCurveTo(-56, -197, -42, -200); X.closePath();
}
function dressShape() {
  X.beginPath();
  X.moveTo(-42, -200); X.quadraticCurveTo(0, -210, 42, -200);
  X.quadraticCurveTo(56, -197, 56, -180); X.lineTo(50, -134);
  X.quadraticCurveTo(66, -100, 74, -64); X.quadraticCurveTo(0, -48, -74, -64);
  X.quadraticCurveTo(-66, -100, -50, -134); X.lineTo(-56, -180);
  X.quadraticCurveTo(-56, -197, -42, -200); X.closePath();
}
function cylShade(w = 60) { X.fillStyle = LG(-w, 0, w, 0, 'rgba(255,255,255,.16)', 'rgba(255,255,255,0)', 'rgba(0,0,0,.14)'); X.fill(); }

// ================= Cabelos =================
// HY = centro da cabeça; a cabeça é uma elipse 80×77. O cabelo tem volume próprio por cima dela.
const hairDark = (col, k = -0.16) => shade(col, k);
const hairGrad = (col, y1, y2) => LG(0, y1, 0, y2, shade(col, 0.14), col, shade(col, -0.16));
// mecha: afina da raiz (x0,y0) até uma ponta arredondada (x1,y1); a raiz é curva e sem contorno,
// assim a mecha se funde no resto do cabelo em vez de virar um triângulo
function lock(x0, y0, x1, y1, w, fill, bend = 0) {
  const mx = (x0 + x1) / 2 + bend, my = (y0 + y1) / 2;
  let dx = x1 - mx, dy = y1 - my; const dl = Math.hypot(dx, dy) || 1; dx /= dl; dy /= dl;
  const r = Math.max(3, w * 0.42), px = -dy * r, py = dx * r;
  const cL = [mx - w * 0.7, my], cR = [mx + w * 0.7, my];
  // ponta: o lado mais perto do controle esquerdo vai primeiro
  let a = [x1 + px, y1 + py], b = [x1 - px, y1 - py];
  if (Math.hypot(a[0] - cL[0], a[1] - cL[1]) > Math.hypot(b[0] - cL[0], b[1] - cL[1])) [a, b] = [b, a];
  const sides = () => {
    X.moveTo(x0 - w, y0);
    X.quadraticCurveTo(cL[0], cL[1], a[0], a[1]);
    X.quadraticCurveTo(x1 + dx * r * 1.5, y1 + dy * r * 1.5, b[0], b[1]);
    X.quadraticCurveTo(cR[0], cR[1], x0 + w, y0);
  };
  X.beginPath(); sides();
  X.quadraticCurveTo(x0 - (x1 - x0) * 0.15, y0 - (y1 - y0) * 0.15, x0 - w, y0);
  // cor lisa vira o mesmo degradê da cabeleira, para a raiz não aparecer
  X.fillStyle = typeof fill === 'string' && fill[0] === '#' ? hairGrad(fill, HY - 130, HY + 16) : fill; X.fill();
  if (INK) { X.beginPath(); sides(); X.lineCap = 'round'; X.lineJoin = 'round'; stroke(2, 'rgba(58,36,40,.5)'); }
}
// coroa de pontas (espetado, moicano): uma silhueta só, com pontas arredondadas
function spikes(col, tips, valleyDy, x0, x1, baseY) {
  const rr = 7;
  const edge = () => {
    X.moveTo(x0, baseY); let px = x0, py = baseY;
    tips.forEach(([tx, ty], i) => {
      X.quadraticCurveTo((px + tx) / 2, (py + ty) / 2 + 6, tx - rr * 0.7, ty + rr);
      X.quadraticCurveTo(tx, ty - rr * 0.5, tx + rr * 0.7, ty + rr);
      const last = i === tips.length - 1, nx = last ? x1 : (tx + tips[i + 1][0]) / 2, ny = last ? baseY : Math.max(ty, tips[i + 1][1]) + valleyDy;
      X.quadraticCurveTo((tx + nx) / 2, (ty + ny) / 2 + 6, nx, ny); px = nx; py = ny;
    });
  };
  X.beginPath(); edge(); X.quadraticCurveTo(0, baseY + 20, x0, baseY);
  X.fillStyle = hairGrad(col, Math.min(...tips.map((p) => p[1])), baseY); X.fill();
  if (INK) { X.beginPath(); edge(); X.lineJoin = 'round'; stroke(3, INK); }
}
// casca de volume sobre o topo da cabeça; hl = altura da linha do cabelo na testa
function hairShell(col, { th = 10, sideY = HY + 16, hl = HY - 30, sides = 1 } = {}) {
  X.beginPath();
  X.moveTo(-(80 + th * 0.6) * sides, sideY);
  X.bezierCurveTo(-(92 + th), HY - 120 - th, 92 + th, HY - 120 - th, (80 + th * 0.6) * sides, sideY);
  X.quadraticCurveTo(66, hl, 0, hl - 6); X.quadraticCurveTo(-66, hl, -(80 + th * 0.6) * sides, sideY);
  X.closePath();
  X.fillStyle = hairGrad(col, HY - 130, sideY); X.fill(); ink(3.2);
}
// brilho em faixa (estilo desenho) e fios finos
function hairShine(cx = -14, cy = HY - 52, r = 64, a0 = 1.18, a1 = 1.52) {
  X.beginPath(); X.arc(cx, cy + 40, r, Math.PI * a0, Math.PI * a1); stroke(9, 'rgba(255,255,255,.26)');
  X.beginPath(); X.arc(cx, cy + 40, r, Math.PI * (a1 + 0.04), Math.PI * (a1 + 0.1)); stroke(9, 'rgba(255,255,255,.2)');
}
function strands(col, n = 6, y0 = HY - 104, y1 = HY - 34, spread = 26) {
  X.save(); X.beginPath(); X.ellipse(0, HY - 10, 86, 88, 0, 0, TAU); X.clip();
  for (let i = 0; i < n; i++) { const x = (i - (n - 1) / 2) * spread; X.beginPath(); X.moveTo(x * 0.6, y0); X.quadraticCurveTo(x * 1.1 + 6, (y0 + y1) / 2, x, y1); stroke(2.2, 'rgba(0,0,0,.12)'); }
  X.restore();
}
// sombra suave da franja sobre a testa
function fringeShadow(y = HY - 26, w = 62) { fe(0, y + 6, w, 9, 'rgba(70,30,20,.08)'); }
// franja de mechas: tips = [[x, y], ...] pontas; raízes distribuídas no alto
function fringe(col, tips, rootY = HY - 78, w = 15, sweep = 0) {
  const n = tips.length;
  tips.forEach(([x, y], i) => {
    const rx = (i - (n - 1) / 2) * 30 - sweep;
    lock(rx, rootY, x, y, w, col, sweep * 0.3);
  });
  // vincos de sombra entre as mechas
  tips.forEach(([x, y], i) => { if (i === 0) return; const px = (tips[i - 1][0] + x) / 2, py = Math.min(tips[i - 1][1], y) - 8; X.beginPath(); X.moveTo((i - n / 2) * 30 - sweep, rootY + 10); X.quadraticCurveTo(px, (rootY + py) / 2, px, py); stroke(2.4, 'rgba(0,0,0,.12)'); });
}
// mecha lateral arredondada (cabelo comprido)
function hairPanel(k, y0, len, col, wave = 0) {
  X.beginPath();
  X.moveTo(k * 62, y0); X.lineTo(k * 96, y0);
  X.bezierCurveTo(k * (106 + wave), y0 + len * 0.35, k * (96 - wave), y0 + len * 0.7, k * 92, y0 + len);
  X.quadraticCurveTo(k * 82, y0 + len + 16, k * 70, y0 + len - 6);
  X.bezierCurveTo(k * (74 - wave), y0 + len * 0.7, k * (76 + wave), y0 + len * 0.35, k * 62, y0);
  X.closePath();
  X.fillStyle = LG(k * 62, 0, k * 104, 0, shade(col, -0.06), shade(col, 0.08), shade(col, -0.14)); X.fill(); ink(3);
  X.beginPath(); X.moveTo(k * 82, y0 + 12); X.quadraticCurveTo(k * (88 + wave), y0 + len * 0.5, k * 80, y0 + len - 4); stroke(2.4, 'rgba(0,0,0,.12)');
  X.beginPath(); X.moveTo(k * 74, y0 + 20); X.quadraticCurveTo(k * 78, y0 + len * 0.4, k * 76, y0 + len * 0.6); stroke(3, 'rgba(255,255,255,.14)');
}
// massa de cabelo atrás do corpo, com pontas em ondas
function backMass(col, y0, len, w = 96, ends = 5) {
  const d = hairDark(col, -0.14), bottom = HY + len;
  X.beginPath(); X.moveTo(-w, y0);
  X.quadraticCurveTo(-w - 10, HY + len * 0.5, -w + 6, bottom);
  for (let i = 0; i < ends; i++) { const x0 = -w + 6 + (i * (2 * w - 12)) / ends, x1 = -w + 6 + ((i + 1) * (2 * w - 12)) / ends; X.quadraticCurveTo((x0 + x1) / 2, bottom + 18, x1, bottom); }
  X.quadraticCurveTo(w + 10, HY + len * 0.5, w, y0);
  X.bezierCurveTo(w, HY - 140, -w, HY - 140, -w, y0);
  X.closePath();
  X.fillStyle = LG(0, HY - 100, 0, bottom, d, shade(col, -0.24)); X.fill(); ink(3.2);
}
function curl(x, y, r, col) { fc(x, y, r, col); X.beginPath(); X.arc(x + 1, y + 1, r * 0.55, 0.3, 4.6); stroke(2, 'rgba(0,0,0,.14)'); fc(x - r * 0.35, y - r * 0.4, r * 0.25, 'rgba(255,255,255,.18)'); }
function tie(x, y, c = '#ff7eb6') { fe(x, y, 10, 8, c); fe(x - 3, y - 3, 3.5, 2.5, 'rgba(255,255,255,.5)'); }
function braid(x1, y1, x2, y2, col) {
  const n = 7;
  for (let i = 0; i <= n; i++) {
    const u = i / n, x = lerp(x1, x2, u), y = lerp(y1, y2, u), s = i % 2 ? 1 : -1;
    fe(x + s * 3, y, 15 - u * 4, 12, LG(x - 15, 0, x + 15, 0, shade(col, 0.1), col, shade(col, -0.15)), s * 0.5);
    X.beginPath(); X.arc(x + s * 3, y, 10 - u * 3, s > 0 ? 0.3 : 2.4, s > 0 ? 1.4 : 3.5); stroke(1.8, 'rgba(0,0,0,.14)');
  }
  tie(x2, y2 + 14);
  lock(x2 - 6, y2 + 18, x2, y2 + 38, 7, col);
}

// chapéus que cobrem o topo da cabeça escondem coque, espetos, topete e crista
// cabelos 20–22 (e o 19 'dividido', que reaproveita o 20 em duas cores)
function hairBackNew(st, col) {
  const d = hairDark(col);
  if (st === 20) backMass(col, HY - 40, 110, 98, 4);
  else if (st === 21) { for (let i = 0; i < 12; i++) { const a = Math.PI * 0.9 + (i / 11) * Math.PI * 1.2; curl(Math.cos(a) * 86, HY - 20 + Math.sin(a) * 84, 24, d); } }
  else if (st === 22) backMass(col, HY - 40, 160, 96, 5);
}
function hairFrontNew(st, col, covered) {
  if (st === 20) {
    hairShell(col, { th: 10, hl: HY - 30 });
    lock(-40, HY - 92, 36, HY - 28, 28, col, -10);
    hairPanel(-1, HY - 30, 104, col, 12); hairPanel(1, HY - 30, 104, col, 12);
    hairShine();
  } else if (st === 21) {
    hairShell(col, { th: 12, hl: HY - 40 });
    for (let r = 0; r < 2; r++) for (let i = 0; i < 7 - r; i++) curl(-64 + i * 21 + r * 10, HY - 44 - r * 26 + Math.abs(i - 3) * 3, 15, r ? shade(col, 0.07) : col);
  } else if (st === 22) {
    hairShell(col, { th: 8, hl: HY - 34 });
    lock(-4, HY - 104, -60, HY - 28, 30, col, -10); lock(4, HY - 104, 60, HY - 28, 30, col, 10);
    hairPanel(-1, HY - 30, 160, col); hairPanel(1, HY - 30, 160, col);
    if (!covered) { fc(0, HY - 116, 22, hairGrad(col, HY - 140, HY - 94)); ink(2.6); X.beginPath(); X.arc(0, HY - 116, 12, 0.4, 5.2); stroke(2.4, 'rgba(0,0,0,.14)'); tie(0, HY - 96); }
    hairShine(-24, HY - 58, 52);
  }
}
// segunda cor padrão do cabelo dividido: contraste com a primeira
function hairSecond(col) { const [r, g, b] = hexRgb(col); return r + g + b > 380 ? '#2b1d16' : '#e8d5b7'; }
// cabelo como peça única (igual à mão): 1ª passada só desenha o contorno grosso de todas as partes,
// 2ª passada preenche tudo por cima sem contorno — some a linha onde uma mecha encosta na outra
function hairLayer(draw) {
  if (!INK) return draw();
  const ink0 = INK, ctx = X, realStroke = ctx.stroke;
  ctx.stroke = () => {};
  ctx.fill = function () {
    const fs = this.fillStyle;
    if (typeof fs === 'string' && fs.startsWith('rgba')) return; // brilhos e sombras não ganham contorno
    this.save(); this.lineWidth = 6; this.lineJoin = 'round'; this.strokeStyle = ink0; realStroke.call(this); this.restore();
  };
  try { draw(); } finally { delete ctx.fill; delete ctx.stroke; }
  INK = null;
  try { draw(); } finally { INK = ink0; }
}
// desenha uma parte do cabelo; o 'dividido' pinta cada metade de uma cor
function hairPart(fn, st, col, col2, covered) {
  if (st !== 19) return fn(st, col, covered);
  for (const [side, c] of [[-1, col], [1, col2 || hairSecond(col)]]) {
    X.save(); X.beginPath(); X.rect(side < 0 ? -400 : 0, -900, 400, 1800); X.clip();
    fn(20, c, covered);
    X.restore();
  }
}
function hairBack(st, col, covered = false) {
  if (st >= 20) return hairBackNew(st, col);
  if (covered && (st === 5 || st === 13)) return;
  const d = hairDark(col);
  if (st === 1) backMass(col, HY - 40, 150);
  else if (st === 2) {
    for (let i = 0; i < 16; i++) { const a = Math.PI * 0.8 + (i / 15) * Math.PI * 1.4; curl(Math.cos(a) * 96, HY - 10 + Math.sin(a) * 92, 34, d); }
    fc(0, HY - 16, 98, d);
  } else if (st === 3) {
    for (const k of [-1, 1]) {
      X.save(); X.translate(k * 84, HY - 2); X.rotate(k * (0.35 + Math.sin(G.t * 2) * 0.04));
      lock(0, 0, k * 22, 110, 24, LG(0, 0, 0, 110, d, shade(col, -0.22)), k * 18);
      lock(0, 6, k * 10, 96, 14, d, k * 10);
      X.restore();
      tie(k * 84, HY - 2);
    }
  } else if (st === 5) {
    fc(0, HY - 104, 36, hairGrad(col, HY - 140, HY - 70));
    X.beginPath(); X.arc(0, HY - 104, 22, 0.4, 5.4); stroke(3, 'rgba(0,0,0,.14)');
    fe(0, HY - 74, 26, 7, '#ff7eb6');
  } else if (st === 7) {
    X.save(); X.translate(56, HY - 70); X.rotate(-0.55 + Math.sin(G.t * 2.2) * 0.07);
    lock(0, 0, 18, 170, 30, LG(0, 0, 0, 170, col, shade(col, -0.22)), 30);
    lock(4, 10, 6, 150, 14, 'rgba(255,255,255,.1)', 20);
    X.restore();
  } else if (st === 9) {
    X.beginPath(); X.moveTo(-98, HY - 40); X.quadraticCurveTo(-104, HY + 50, -78, HY + 72); X.lineTo(78, HY + 72); X.quadraticCurveTo(104, HY + 50, 98, HY - 40); X.bezierCurveTo(98, HY - 140, -98, HY - 140, -98, HY - 40);
    X.fillStyle = LG(0, HY - 100, 0, HY + 72, d, shade(col, -0.24)); X.fill();
  } else if (st === 11) backMass(col, HY - 40, 200, 100, 6);
  else if (st === 12) {
    backMass(col, HY - 40, 170);
    X.beginPath(); X.moveTo(-74, HY + 140); X.quadraticCurveTo(-90, HY + 230, -30, -12); X.lineTo(36, -12); X.quadraticCurveTo(92, HY + 230, 74, HY + 140); X.closePath();
    X.fillStyle = LG(0, HY + 140, 0, -12, shade(col, -0.16), shade(col, -0.26)); X.fill();
    for (let i = 0; i < 4; i++) { X.beginPath(); X.moveTo(-40 + i * 26, HY + 150); X.quadraticCurveTo(-30 + i * 22, HY + 220, -16 + i * 12, -20); stroke(2.4, 'rgba(0,0,0,.1)'); }
    for (let i = 0; i < 6; i++) fc(-40 + (i % 2) * 70, HY + 160 + i * 28, 7, ['#ff7eb6', '#ffffff', '#ffd23f'][i % 3]);
  } else if (st === 13) {
    for (const k of [-1, 1]) { fc(k * 64, HY - 78, 32, hairGrad(col, HY - 110, HY - 46)); X.beginPath(); X.arc(k * 64, HY - 78, 18, 0.3, 5.2); stroke(3, 'rgba(0,0,0,.13)'); fe(k * 52, HY - 54, 14, 6, '#ff7eb6', k * 0.6); }
  } else if (st === 15) {
    for (let i = 0; i < 10; i++) {
      const x = -96 + i * 21.5, len = 140 + (i % 3) * 20;
      fr(x - 10, HY - 40, 20, len, 10, LG(x - 10, 0, x + 10, 0, shade(col, -0.08), d, shade(col, -0.26)));
      for (let k = 1; k < 6; k++) line(x - 7, HY - 40 + k * len / 6, x + 7, HY - 36 + k * len / 6, 2, 'rgba(0,0,0,.14)');
    }
  } else if (st === 17) backMass(col, HY - 40, 210, 98, 1);
  else if (st === 18) {
    for (let i = 0; i < 22; i++) { const a = (i / 22) * TAU; fc(Math.cos(a) * 118, HY - 34 + Math.sin(a) * 114, 30, d); }
    fc(0, HY - 34, 122, RG(-30, HY - 90, 10, 140, shade(col, -0.04), d));
    for (let i = 0; i < 40; i++) { const a = srand(i) * TAU, r = srand(i + 9) * 110; X.beginPath(); X.arc(Math.cos(a) * r, HY - 34 + Math.sin(a) * r, 5, 0.5, 3.6); stroke(1.6, 'rgba(0,0,0,.12)'); }
  }
}

function hairFront(st, col, covered = false) {
  if (covered && (st === 4 || st === 14 || st === 10)) st = 0;
  if (st >= 20) { fringeShadow(); return hairFrontNew(st, col, covered); }
  const d = hairDark(col);
  if (st === 6) { fe(-24, HY - 50, 28, 14, 'rgba(255,255,255,.18)', -0.3); fe(0, HY - 40, 60, 30, 'rgba(0,0,0,.03)'); return; }
  fringeShadow();
  if (st === 0) {
    hairShell(col, { th: 8, hl: HY - 36 });
    fringe(col, [[-56, HY - 30], [-28, HY - 26], [2, HY - 30], [30, HY - 26], [56, HY - 34]], HY - 82, 16, -8);
    for (const k of [-1, 1]) lock(k * 76, HY - 30, k * 80, HY + 18, 8, col);
    hairShine();
  } else if (st === 1 || st === 12) {
    hairShell(col, { th: 10, hl: HY - 30 });
    lock(-40, HY - 90, 34, HY - 30, 30, col, -10); lock(-70, HY - 70, -50, HY - 18, 18, col);
    hairPanel(-1, HY - 30, st === 12 ? 170 : 150, col); hairPanel(1, HY - 30, st === 12 ? 170 : 150, col);
    strands(col, 5); hairShine();
  } else if (st === 2) {
    hairShell(col, { th: 14, hl: HY - 34 });
    for (let i = 0; i < 8; i++) curl(-74 + i * 21, HY - 40 + Math.abs(i - 3.5) * 5, 17, col);
    hairShine(-14, HY - 60);
  } else if (st === 3 || st === 13) {
    hairShell(col, { th: 8, hl: HY - 34 });
    lock(-4, HY - 104, -60, HY - 26, 30, col, -10); lock(4, HY - 104, 60, HY - 26, 30, col, 10);
    X.beginPath(); X.moveTo(0, HY - 108); X.lineTo(0, HY - 50); stroke(3, 'rgba(0,0,0,.14)');
    hairShine(-24, HY - 58, 52);
  } else if (st === 4) {
    hairShell(col, { th: 6, hl: HY - 38 });
    spikes(col, [[-66, HY - 112], [-40, HY - 144], [-12, HY - 158], [18, HY - 156], [44, HY - 140], [68, HY - 110]], 26, -76, 76, HY - 76);
    fringe(col, [[-46, HY - 34], [-14, HY - 30], [18, HY - 32], [48, HY - 36]], HY - 80, 15, -6);
    hairShine();
  } else if (st === 5 || st === 7) {
    hairShell(col, { th: 6, hl: HY - 52 });
    strands(col, 7, HY - 52, HY - 112, 22);
    hairShine(-18, HY - 64, 58);
  } else if (st === 8) {
    hairShell(col, { th: 8, hl: HY - 34 });
    lock(-4, HY - 104, -60, HY - 28, 30, col, -10); lock(4, HY - 104, 60, HY - 28, 30, col, 10);
    X.beginPath(); X.moveTo(0, HY - 108); X.lineTo(0, HY - 50); stroke(3, 'rgba(0,0,0,.14)');
    braid(-78, HY + 6, -66, HY + 146, col); braid(78, HY + 6, 66, HY + 146, col);
    hairShine(-24, HY - 58, 52);
  } else if (st === 9) {
    hairShell(col, { th: 12, hl: HY - 32 });
    X.beginPath(); X.moveTo(-80, HY - 30); X.quadraticCurveTo(0, HY - 44, 80, HY - 30); X.lineTo(78, HY - 70); X.quadraticCurveTo(0, HY - 110, -78, HY - 70); X.closePath(); X.fillStyle = col; X.fill();
    for (let i = -3; i <= 3; i++) line(i * 22, HY - 70, i * 22 + 2, HY - 34, 2, 'rgba(0,0,0,.1)');
    for (const k of [-1, 1]) { X.beginPath(); X.moveTo(k * 70, HY - 40); X.quadraticCurveTo(k * 102, HY + 10, k * 84, HY + 66); X.quadraticCurveTo(k * 70, HY + 74, k * 60, HY + 60); X.quadraticCurveTo(k * 74, HY + 10, k * 62, HY - 30); X.closePath(); X.fillStyle = LG(k * 60, 0, k * 102, 0, col, shade(col, -0.12)); X.fill(); }
    hairShine();
  } else if (st === 10) {
    // laterais raspadas (sombra curtinha) + crista alta em leque
    X.save(); X.globalAlpha = 0.3; hairShell(col, { th: 0, hl: HY - 44 }); X.restore();
    for (let i = 0; i < 30; i++) fc(-70 + srand(i) * 140, HY - 70 + srand(i + 5) * 40 - Math.abs(-70 + srand(i) * 140) * 0.2, 1.4, 'rgba(0,0,0,.12)');
    const tipsM = [[-30, HY - 128], [-14, HY - 160], [0, HY - 176], [14, HY - 162], [30, HY - 130]];
    spikes(col, tipsM, 22, -26, 26, HY - 50);
    for (const [x, y] of tipsM) { X.beginPath(); X.moveTo(x * 0.4, HY - 56); X.quadraticCurveTo(x * 0.8, (y + HY - 56) / 2, x, y + 8); stroke(2.2, 'rgba(0,0,0,.13)'); }
    X.beginPath(); X.moveTo(-6, HY - 150); X.quadraticCurveTo(-10, HY - 100, -6, HY - 58); stroke(5, 'rgba(255,255,255,.25)');
  } else if (st === 11) {
    hairShell(col, { th: 12, hl: HY - 30 });
    lock(-36, HY - 92, 40, HY - 28, 30, col, -12); lock(-70, HY - 70, -48, HY - 16, 18, col);
    hairPanel(-1, HY - 30, 160, col, 14); hairPanel(1, HY - 30, 160, col, 14);
    strands(col, 5); hairShine();
  } else if (st === 14) {
    hairShell(col, { th: 4, hl: HY - 40, sides: 0.98 });
    lock(-30, HY - 54, 70, HY - 152, 34, hairGrad(col, HY - 150, HY - 50), -40);
    lock(-10, HY - 50, 84, HY - 128, 26, col, -28);
    lock(-44, HY - 40, 40, HY - 120, 24, shade(col, 0.08), -40);
    X.beginPath(); X.moveTo(-20, HY - 70); X.quadraticCurveTo(20, HY - 140, 66, HY - 140); stroke(6, 'rgba(255,255,255,.24)');
  } else if (st === 15) {
    hairShell(col, { th: 6, hl: HY - 40 });
    for (let i = 0; i < 7; i++) { const x = -66 + i * 22; fr(x - 9, HY - 80, 18, 46, 9, LG(x - 9, 0, x + 9, 0, col, d)); line(x - 6, HY - 60, x + 6, HY - 56, 2, 'rgba(0,0,0,.14)'); }
    X.beginPath(); X.ellipse(0, HY - 8, 90, 74, 0, Math.PI * 1.08, Math.PI * 1.92); stroke(12, '#ffd23f');
    X.beginPath(); X.ellipse(0, HY - 10, 90, 74, 0, Math.PI * 1.2, Math.PI * 1.45); stroke(4, 'rgba(255,255,255,.4)');
  } else if (st === 16) {
    hairShell(col, { th: 8, hl: HY - 36 });
    lock(30, HY - 96, -50, HY - 30, 30, col, 10);
    X.save(); X.translate(-78, HY - 4); X.rotate(-0.12 + Math.sin(G.t * 2) * 0.05);
    lock(0, 0, -10, 150, 26, LG(0, 0, 0, 150, col, shade(col, -0.2)), -16); lock(-2, 12, -16, 130, 10, 'rgba(255,255,255,.1)', -10);
    X.restore();
    tie(-78, HY - 4, '#ffd23f');
    hairShine(-4, HY - 56, 56);
  } else if (st === 17) {
    hairShell(col, { th: 10, hl: HY - 28 });
    X.beginPath(); X.moveTo(-82, HY - 26); X.lineTo(82, HY - 26); X.lineTo(80, HY - 76); X.quadraticCurveTo(0, HY - 116, -80, HY - 76); X.closePath(); X.fillStyle = col; X.fill();
    for (let i = -3; i <= 3; i++) { line(i * 22, HY - 74, i * 22 + 1, HY - 28, 2, 'rgba(0,0,0,.11)'); X.beginPath(); X.arc(i * 22, HY - 27, 11.5, 0, Math.PI); X.fillStyle = col; X.fill(); }
    hairPanel(-1, HY - 30, 170, col); hairPanel(1, HY - 30, 170, col);
    hairShine();
  } else if (st === 18) {
    hairShell(col, { th: 16, hl: HY - 40 });
    for (let i = 0; i < 9; i++) curl(-80 + i * 20, HY - 46 + Math.abs(i - 4) * 4, 15, col);
  }
}
// mechas coloridas: pintam as pontas da franja e das mechas laterais
function hairTips(st, tip) {
  if (!tip || st === 6) return;
  X.save(); X.globalAlpha = 0.9;
  lock(-30, HY - 60, -38, HY - 28, 9, tip); lock(8, HY - 64, 10, HY - 30, 8, tip); lock(44, HY - 58, 52, HY - 32, 8, tip);
  if ([1, 9, 11, 12, 17, 19, 20, 22].includes(st)) for (const k of [-1, 1]) lock(k * 82, HY + 70, k * 82, HY + 128, 11, tip);
  X.restore();
}
// ----- costas: capa, asas, mochila -----
function drawBackItem(e, t, held) {
  const b = e.back, it = e.top === 'icegown' ? 'icecape' : null;
  if (it) {
    X.beginPath(); X.moveTo(-50, -200); X.lineTo(50, -200); X.quadraticCurveTo(110, -100, 96 + Math.sin(t * 2) * 6, -4); X.quadraticCurveTo(0, 14, -96 - Math.sin(t * 2) * 6, -4); X.quadraticCurveTo(-110, -100, -50, -200); X.closePath();
    X.fillStyle = 'rgba(190,230,255,.55)'; X.fill();
    for (let i = 0; i < 8; i++) { starPath(-70 + i * 20, -40 - (i % 3) * 40, 5, 4, 0.4); X.fillStyle = 'rgba(255,255,255,.85)'; X.fill(); }
  }
  if (!b) return;
  if (b === 'cape') {
    const w = held ? 30 : Math.sin(t * 2.5) * 8;
    X.beginPath(); X.moveTo(-48, -200); X.lineTo(48, -200); X.quadraticCurveTo(96, -110, 84 + w, -20); X.quadraticCurveTo(0, 0, -84 + w, -20); X.quadraticCurveTo(-96, -110, -48, -200); X.closePath();
    X.fillStyle = LG(-90, 0, 90, 0, '#c4302b', '#ff4d4d', '#c4302b'); X.fill();
  } else if (b === 'wings') {
    const f = Math.sin(t * (held ? 20 : 4)) * 0.12;
    for (const k of [-1, 1]) {
      X.save(); X.translate(k * 30, -190); X.rotate(k * (0.5 + f));
      fe(k * 50, -50, 44, 70, 'rgba(190,240,255,.55)', k * 0.3); fe(k * 40, 40, 30, 46, 'rgba(255,210,240,.55)', -k * 0.4);
      X.beginPath(); X.ellipse(k * 50, -50, 44, 70, k * 0.3, 0, TAU); stroke(2, 'rgba(255,255,255,.8)');
      X.restore();
    }
  } else if (b === 'backpack') {
    fr(-62, -196, 124, 120, 26, '#ff9f43'); fr(-50, -120, 100, 40, 14, '#f07b1f');
  } else if (b === 'anjo') {
    const f = Math.sin(t * (held ? 18 : 3)) * 0.1;
    for (const k of [-1, 1]) {
      X.save(); X.translate(k * 34, -180); X.rotate(k * (0.3 + f));
      for (let i = 0; i < 4; i++) fe(k * (40 + i * 16), -40 + i * 18, 40 - i * 6, 18, i % 2 ? '#f3f6fb' : '#ffffff', k * 0.5);
      X.restore();
    }
  } else if (b === 'dinocauda') {
    const w = Math.sin(t * 3) * 0.12;
    X.save(); X.translate(30, -110); X.rotate(0.5 + w);
    X.beginPath(); X.moveTo(0, -24); X.quadraticCurveTo(80, -10, 120, 40); X.quadraticCurveTo(70, 10, 0, 24); X.closePath(); X.fillStyle = '#62c24f'; X.fill();
    for (let i = 0; i < 4; i++) fpoly([20 + i * 24, -18 + i * 9, 30 + i * 24, -36 + i * 12, 40 + i * 24, -12 + i * 10], '#ffd23f');
    X.restore();
    for (let i = 0; i < 5; i++) fpoly([-30 + i * 15, -200 + Math.abs(i - 2) * 4, -22 + i * 15, -222 + Math.abs(i - 2) * 6, -14 + i * 15, -200 + Math.abs(i - 2) * 4], '#ffd23f');
  }
}
// ----- pescoço: lenço, colar, gravata, cachecol -----
function drawNeckItem(e, t) {
  const n = e.neck;
  if (!n || !WEAR[n]) return;
  X.save(); X.translate(0, -204); WEAR[n].draw(t); X.restore();
}

// cor da manga: algumas roupas têm camisa branca por baixo
const WHITE_SLEEVE = new Set(['cardigan', 'cowprint']);
function sleeveColor(e) { return WHITE_SLEEVE.has(e.top) ? '#ffffff' : e.top === 'cowdress' ? e.pants : e.shirt; }
function stripeCol(e) { const [r, g, b] = hexRgb(e.shirt); return r + g + b > 450 ? '#2f3241' : '#ffffff'; }
const CUFFED = new Set(['hoodie', 'sweater', 'jacket', 'crop', 'stripeslong', 'tiedye', 'cardigan']);
function drawArm(sx, sy, ang, e, sleeve) {
  X.save(); X.translate(sx, sy); X.rotate(ang);
  fr(-10, -6, 20, 80, 10, e.skin); ink(4.4);
  if (sleeve > 0) {
    const sc = sleeveColor(e), path = () => RR(-13, -12, 26, sleeve + 12, 12);
    path(); X.fillStyle = sc; X.fill();
    if (e.top === 'stripeslong' || e.top === 'tiedye') {
      X.save(); path(); X.clip();
      if (e.top === 'stripeslong') for (let y = 4; y < sleeve; y += 18) fr(-14, y, 28, 8, 0, stripeCol(e));
      else { fr(-14, 10, 28, 24, 0, '#ffd23f'); fr(-14, 34, 28, 24, 0, '#7ed1f7'); fr(-14, 58, 28, 30, 0, '#a77bf3'); }
      X.restore();
    }
    if (e.top === 'cowprint') fe(-3, 8, 6, 8, e.shirt, 0.4);
    path(); ink(3);
    if (CUFFED.has(e.top)) { const cc = shade(sc === '#ffffff' ? '#e6ebf2' : sc, -0.1); fr(-13, sleeve - 8, 26, 12, 6, cc); RR(-13, sleeve - 8, 26, 12, 6); ink(2.4); }
    if (e.top === 'space') fr(-14, sleeve - 10, 28, 14, 6, '#a77bf3');
    if (e.top === 'icegown') { X.globalAlpha = 0.5; fr(-13, -12, 26, sleeve + 12, 12, '#ffffff'); X.globalAlpha = 1; }
  }
  drawHand(e.skin, sx < 0 ? 1 : -1, sleeve > 0 ? sleeve : 4);
  X.restore();
}
// mão com quatro dedos e polegar (side = lado do polegar), centrada em y≈80 no braço
function drawHand(skin, side, top = 40) {
  X.save(); X.scale(side, 1);
  // tudo abaixo de `top` (fim da manga) vira uma peça só com o pulso
  X.save(); X.beginPath(); X.rect(-40, top, 80, 200); X.clip();
  // silhueta única: palma + dedos + polegar num só caminho; contorno grosso por baixo e pele por cima
  const fl = [13, 16, 15, 12];
  const shape = () => {
    X.beginPath();
    for (let i = 0; i < 4; i++) { const x = -9.5 + i * 5.4; X.roundRect(x - 3.2, 80, 6.4, fl[i] + 6, 3.2); }
    X.ellipse(9.5, 81, 4.4, 9.5, -0.4, 0, TAU);
    X.roundRect(-13, 64, 23, 27, 10);
    X.rect(-10, top - 20, 20, 90 - top);
  };
  if (INK) { shape(); X.lineJoin = 'round'; X.lineWidth = 4.4; X.strokeStyle = INK; X.stroke(); }
  shape(); X.fillStyle = skin; X.fill('nonzero');
  // dedos sugeridos por tracinhos suaves
  for (let i = 1; i < 4; i++) { const x = -9.5 + i * 5.4 - 2.7; line(x, 88, x, 80 + Math.min(fl[i], fl[i - 1]) + 2, 1.3, 'rgba(90,50,40,.28)'); }
  X.restore();
  fe(-5, 72, 5, 3, 'rgba(255,255,255,.18)');
  X.restore();
}
// calçados grandes e arredondados (boneca de papel)
function shoe(x, y, col, style) {
  X.save(); X.translate(x, y); X.scale(1.2, 1.2);
  if (style === 'hightop' || style === 'chunky') {
    const sole = style === 'chunky' ? 12 : 6, top = style === 'hightop' ? -34 : -12;
    fr(-16, top, 30, -top + 6, 10, col); ink(3);
    fe(3, 2, 22, 12, col); ink(3);
    fr(-20, 6, 46, sole, sole / 2, '#ffffff'); ink(2.6);
    if (style === 'chunky') for (let i = 0; i < 4; i++) line(-14 + i * 11, 12, -14 + i * 11, 16, 1.5, 'rgba(0,0,0,.18)');
    fc(16, 8, 5, '#ffffff');
    if (style === 'hightop') { fc(-2, top + 10, 5, '#ffffff'); RR(-16, top, 30, 9, 4); X.fillStyle = shade(col === '#ffffff' ? '#d0d4dc' : col, -0.15); X.fill(); for (let i = 0; i < 3; i++) line(-8, top + 14 + i * 7, 8, top + 17 + i * 7, 2, '#ffffff'); }
    else { line(-4, -6, 8, -9, 2, '#ffffff'); line(-2, 0, 10, -3, 2, '#ffffff'); }
  } else shoeBase(0, 0, col, style);
  X.restore();
}
function shoeBase(x, y, col, style) {
  const dk = shade(col === '#ffffff' ? '#d0d4dc' : col, -0.25);
  if (style === 'galocha') {
    fr(x - 18, y - 58, 36, 64, 12, col); fr(x - 20, y - 60, 40, 10, 5, dk);
    fe(x + 2, y + 4, 24, 10, col); fe(x + 2, y + 9, 24, 4, dk); fr(x - 12, y - 50, 6, 40, 3, 'rgba(255,255,255,.4)');
    return;
  }
  if (style === 'pantufa') {
    fe(x, y, 26, 16, col); fe(x, y + 8, 26, 6, dk);
    fe(x - 9, y - 22, 6, 14, col, -0.3); fe(x + 9, y - 22, 6, 14, col, 0.3); fe(x - 9, y - 22, 3, 9, '#ffb3c7', -0.3); fe(x + 9, y - 22, 3, 9, '#ffb3c7', 0.3);
    fc(x - 6, y - 4, 2.5, '#2a1d1a'); fc(x + 6, y - 4, 2.5, '#2a1d1a'); fc(x, y + 2, 2.5, '#ff7d8f');
    return;
  }
  if (style === 'patins') {
    fr(x - 16, y - 36, 32, 40, 10, col); fe(x + 2, y + 2, 24, 8, col);
    fr(x - 22, y + 6, 48, 6, 3, '#9aa6b2');
    for (const wx of [-14, 2, 18]) { fc(x + wx, y + 18, 7, '#ff5d8f'); fc(x + wx, y + 18, 3, '#ffffff'); }
    line(x - 8, y - 28, x + 8, y - 20, 2, '#ffffff'); line(x - 8, y - 16, x + 8, y - 8, 2, '#ffffff');
    return;
  }
  if (style === 'boot') { fr(x - 17, y - 44, 34, 46, 10, col); fr(x - 17, y - 44, 34, 9, 5, shade(col === '#ffffff' ? '#d0d4dc' : col, -0.15)); }
  if (style === 'flat') {
    fe(x, y + 2, 20, 10, col); fe(x, y + 8, 20, 4, shade(col === '#ffffff' ? '#d0d4dc' : col, -0.25));
    fc(x, y - 4, 4.5, '#ffffff'); return;
  }
  fe(x, y, 23, 13, col); ink(3);
  if (style !== 'boot') { fe(x + 1, y + 6, 24, 6, col === '#ffffff' ? '#e6ebf2' : '#fbfbfd'); fe(x + 9, y - 1, 10, 8, shade(col === '#ffffff' ? '#d0d4dc' : col, 0.12)); }
  fe(x, y + 9, 23, 4, shade(col === '#ffffff' ? '#d0d4dc' : col, -0.25));
  fe(x - 7, y - 5, 8, 4, 'rgba(255,255,255,.35)');
  if (style !== 'boot') { line(x - 8, y - 6, x + 4, y - 9, 2, 'rgba(255,255,255,.7)'); }
}
function mermaidTail(e, t, sit, held) {
  const c = e.pants, w = Math.sin(t * (held ? 8 : 2) + (e.phase || 0)) * (held ? 14 : 5);
  X.save();
  if (sit) { X.translate(0, -118); X.scale(1, 0.62); X.translate(0, 118); }
  X.beginPath(); X.moveTo(-52, -118); X.quadraticCurveTo(-56, -50, -16 + w, -14); X.lineTo(16 + w, -14); X.quadraticCurveTo(56, -50, 52, -118); X.closePath();
  X.fillStyle = LG(-52, 0, 52, 0, shade(c, -0.1), shade(c, 0.15), shade(c, -0.15)); X.fill();
  X.save(); X.clip();
  for (let r = 0; r < 6; r++) for (let i = -3; i <= 3; i++) { X.beginPath(); X.arc(i * 18 + (r % 2) * 9, -104 + r * 16, 9, 0, Math.PI); stroke(2, 'rgba(255,255,255,.3)'); }
  X.restore();
  X.beginPath(); X.moveTo(w, -20); X.quadraticCurveTo(-46 + w, -24, -58 + w, 6); X.quadraticCurveTo(-20 + w, -2, w, 0); X.quadraticCurveTo(20 + w, -2, 58 + w, 6); X.quadraticCurveTo(46 + w, -24, w, -20); X.closePath();
  X.fillStyle = shade(c, -0.12); X.fill();
  X.restore();
}

// detalhes de calça: jeans com barra dobrada, cargo com bolso, xadrez
function pantsDeco(e, b, y0, len, k, sit) {
  if (b !== 'jeans' && b !== 'cargo' && b !== 'plaidpants') return;
  const cx = sit ? k * 20 : 0, hw = sit ? 12 : b === 'cargo' ? 15 : 11, path = () => RR(cx - hw, y0, hw * 2, len, Math.min(hw, 12));
  if (b === 'plaidpants') {
    X.save(); path(); X.clip();
    for (let x = -36; x < 36; x += 14) fr(cx + x, y0, 6, len, 0, 'rgba(0,0,0,.2)');
    for (let y = 0; y < len; y += 14) fr(cx - 20, y0 + y, 40, 6, 0, 'rgba(0,0,0,.2)');
    for (let x = -33; x < 36; x += 14) line(cx + x + 4, y0, cx + x + 4, y0 + len, 1.4, 'rgba(255,255,255,.4)');
    X.restore(); path(); ink(3);
  } else if (b === 'jeans') {
    line(cx + k * 3, y0 + 6, cx + k * 3, y0 + len - 16, 1.6, 'rgba(255,255,255,.35)');
    if (!sit) { fr(cx - hw - 1, y0 + len - 18, hw * 2 + 2, 13, 5, shade(e.pants, 0.28)); RR(cx - hw - 1, y0 + len - 18, hw * 2 + 2, 13, 5); ink(2.4); }
  } else {
    const px = sit ? cx - 7 : k > 0 ? 1 : -13;
    fr(px, y0 + (sit ? 10 : 30), 12, 16, 3, shade(e.pants, -0.12)); RR(px, y0 + (sit ? 10 : 30), 12, 16, 3); ink(2);
    if (!sit) { fr(cx - hw, y0 + len - 12, hw * 2, 10, 5, shade(e.pants, -0.14)); }
  }
}
// estampa de vaquinha dentro do recorte atual
function cowSpots(col, x0, y0, w, h) {
  const sp = [[0.2, 0.2, 14, 10], [0.7, 0.15, 10, 8], [0.45, 0.5, 16, 12], [0.15, 0.75, 11, 13], [0.8, 0.6, 13, 10], [0.6, 0.9, 10, 8]];
  for (const [fx, fy, rx, ry] of sp) { fe(x0 + fx * w, y0 + fy * h, rx, ry, col, fx * 2); fe(x0 + fx * w + rx * 0.6, y0 + fy * h - ry * 0.4, rx * 0.4, ry * 0.5, col); }
}

function drawChar(e, t, noItem) {
  const inkPrev = INK; INK = CHAR_INK;
  const s = e.state;
  const held = s === 'held' || s === 'fall';
  const sitLike = s === 'sit' || s === 'swing' || s === 'slide';
  const sleep = s === 'sleep';
  const ph = e.phase || 0;
  X.save();
  X.translate(e.x, e.y);
  if (sleep) { X.translate(150, -48); X.rotate(-Math.PI / 2); }
  else if (sitLike) { if (e.ang) X.rotate(e.ang); X.translate(0, 94); }
  if (held) { X.translate(0, -300); X.rotate(e.swing || 0); X.translate(0, 300); }
  const walking = !!e.moving && s === 'idle', dancing = !!e.dancing && s === 'idle';
  if (walking) { X.translate(0, -Math.abs(Math.sin(t * 11 + ph)) * 9); X.rotate((e.facing || 1) * 0.05); }
  if (dancing) { X.translate(0, -Math.abs(Math.sin(t * 6 + ph)) * 14); X.rotate(Math.sin(t * 3 + ph) * 0.1); }
  const sq = e.sq || 0;
  if (sq > 0.01) X.scale(1 + sq * 0.16, 1 - sq * 0.16);
  const br = Math.sin(t * 2.3 + ph) * 0.012;
  X.scale(1 - br * 0.5, 1 + br);
  if (e.pop != null && e.pop < 1) { const k = Math.max(0.01, easeOutBack(e.pop)); X.scale(k, k); }

  const top = e.top, bottom = e.bottom || 'pants', sst = e.shoeStyle || 'sneaker';
  const isDress = DRESSES.has(top), longGown = LONG_GOWNS.has(top), space = top === 'space';
  const mermaid = bottom === 'mermaid' && !longGown;
  const skirt = bottom === 'skirt' && !isDress && !space;
  const shorts = bottom === 'shorts' && !isDress && !space;
  const bomb = bottom === 'bombacha' && !isDress && !space;
  const tutu = bottom === 'tutu' && !isDress && !space;
  const pleated = bottom === 'pleated' && !isDress && !space;
  const cargo = bottom === 'cargo' && !isDress && !space;
  const skirtLike = skirt || pleated;
  const thighCol = space ? e.shirt : (isDress || skirtLike) ? e.skin : e.pants;
  const shinCol = space ? e.shirt : (isDress || skirtLike || shorts) ? e.skin : e.pants;
  const bareShin = shinCol === e.skin && !space;
  drawBackItem(e, t, held);
  const coveredHead = !!(e.hat && WEAR[e.hat] && !SMALL_HATS.has(e.hat));
  hairLayer(() => hairPart(hairBack, e.hairStyle, e.hairColor, e.hairColor2, coveredHead));

  // ----- pernas -----
  if (mermaid) mermaidTail(e, t, sitLike, held);
  else if (longGown) { if (!sitLike) for (const k of [-1, 1]) shoe(k * 22, -4, e.shoes, sst === 'boot' ? 'flat' : sst); }
  else if (sitLike) {
    fr(-40, -114, 80, 34, 16, thighCol); ink(3);
    for (const k of [-1, 1]) {
      fr(k * 20 - 12, -92, 24, 62, 12, shinCol); ink(3);
      pantsDeco(e, bottom, -92, 62, k, true);
      if (bareShin && e.socks) { fr(k * 20 - 12, -58, 24, 28, 8, e.socks); RR(k * 20 - 12, -58, 24, 28, 8); ink(2.6); }
      if (space) fe(k * 20, -88, 12, 9, '#7ed957');
      shoe(k * 20, -26, e.shoes, sst);
    }
  } else {
    const dang = held ? Math.sin(t * 9 + ph) * 0.28 : walking ? Math.sin(t * 11 + ph) * 0.38 : dancing ? Math.sin(t * 6 + ph) * 0.3 : 0;
    if (!isDress && !skirtLike) { fr(bomb ? -48 : cargo ? -42 : -38, -118, bomb ? 96 : cargo ? 84 : 76, 36, 14, thighCol); ink(3); }
    for (const k of [-1, 1]) {
      X.save(); X.translate(k * 17, -104); X.rotate(dang * k);
      if (bomb) {
        // bombacha: perna larga e franzida, presa no tornozelo
        fe(k * 3, 36, 24, 50, e.pants); ink(3); fr(-11, 66, 22, 26, 10, e.pants);
        for (let i = -1; i <= 1; i++) line(k * 3 + i * 8, 4, k * 3 + i * 10, 70, 2.5, shade(e.pants, -0.18));
        fr(-13, 70, 26, 8, 4, shade(e.pants, -0.22));
      } else if (cargo) {
        fr(-15, 0, 30, 92, 12, e.pants); ink(3);
      } else { fr(-11, 0, 22, 92, 11, shinCol); ink(3); }
      pantsDeco(e, bottom, 0, 92, k, false);
      if (shorts) { fr(-14, -4, 28, 42, 11, e.pants); ink(3); }
      if (bareShin && e.socks) { fr(-11, 58, 22, 34, 9, e.socks); RR(-11, 58, 22, 34, 9); ink(2.6); fr(-11, 58, 22, 6, 3, 'rgba(0,0,0,.08)'); }
      if (space) fr(-12, 38, 24, 18, 8, '#7ed957');
      shoe(k * 3, 94, e.shoes, sst);
      X.restore();
    }
  }

  // ----- tronco (mais estreito, estilo boneca de papel) -----
  X.save(); X.scale(0.8, 1);
  if (top === 'hoodie' || top === 'raincoat') fe(0, -194, 62, 24, shade(e.shirt, -0.2));
  if (longGown) {
    const c = e.shirt, wide = top === 'gown' ? 106 : top === 'prenda' ? 100 : 82;
    X.beginPath(); X.moveTo(-44, -146); X.bezierCurveTo(-64, -110, -wide + 4, -50, -wide, -2); X.quadraticCurveTo(0, 12, wide, -2); X.bezierCurveTo(wide - 4, -50, 64, -110, 44, -146); X.closePath();
    X.fillStyle = LG(-wide, 0, wide, 0, shade(c, -0.1), shade(c, 0.12), shade(c, -0.12)); X.fill(); ink(3.2);
    if (top === 'gown') {
      for (let i = 0; i < 7; i++) fc(-90 + i * 30, -6, 17, shade(c, 0.18));
      for (const k of [-1, 1]) { X.beginPath(); X.moveTo(k * 40, -136); X.quadraticCurveTo(k * 80, -90, k * 60, -40); stroke(5, shade(c, 0.25)); }
    } else if (top === 'prenda') {
      // vestido de prenda: babados em camadas
      [[-96, -10, 100], [-64, -50, 82], [-34, -92, 64]].forEach(([, y, w2]) => {
        for (let i = 0; i < 9; i++) { const x = -w2 + i * (w2 * 2) / 8; X.beginPath(); X.arc(x, y, w2 / 7.5, 0, Math.PI); X.fillStyle = '#ffffff'; X.fill(); }
        fr(-w2, y - 6, w2 * 2, 8, 4, shade(c, 0.22));
      });
    } else {
      X.save(); X.globalAlpha = 0.85;
      for (let i = 0; i < 14; i++) { starPath(-60 + srand(i) * 120, -130 + srand(i + 9) * 120, 4, 4, 0.4); X.fillStyle = '#ffffff'; X.fill(); }
      X.restore();
    }
    torsoShape(); X.fillStyle = c; X.fill(); torsoShape(); cylShade(56);
    fr(-50, -150, 100, 12, 6, shade(c, -0.18));
    if (top === 'gown') { X.beginPath(); X.moveTo(-30, -200); X.quadraticCurveTo(0, -176, 30, -200); X.closePath(); X.fillStyle = e.skin; X.fill(); }
    if (top === 'prenda') { for (let i = 0; i < 7; i++) fc(-30 + i * 10, -198, 6, '#ffffff'); for (let i = 0; i < 3; i++) fc(0, -180 + i * 14, 3, shade(c, -0.25)); }
  } else if (top === 'dress') {
    dressShape(); X.fillStyle = e.shirt; X.fill(); cylShade(74);
    fr(-52, -142, 104, 12, 6, shade(e.shirt, -0.16));
    X.save(); dressShape(); X.clip();
    for (let i = 0; i < 9; i++) fc(-64 + i * 16, -64, 4, 'rgba(255,255,255,.55)');
    X.restore();
  } else if (top === 'cowdress') {
    // vestido-avental de vaquinha sobre camiseta
    torsoShape(); X.fillStyle = e.pants; X.fill();
    X.save(); dressShape(); X.clip();
    X.beginPath(); RR(-34, -178, 68, 50, 12); X.rect(-90, -140, 180, 100);
    X.fillStyle = '#fffaf2'; X.fill(); X.save(); X.clip(); cowSpots(e.shirt, -70, -178, 140, 120); X.restore();
    X.restore();
    RR(-34, -178, 68, 44, 12); ink(3);
    line(-28, -174, -40, -204, 9, '#fffaf2'); line(28, -174, 40, -204, 9, '#fffaf2');
    fc(-26, -168, 4.5, '#ffd23f'); fc(26, -168, 4.5, '#ffd23f');
    fr(-18, -164, 36, 22, 7, shade(e.pants === '#ffffff' ? '#ffd6e5' : e.pants, 0.1)); RR(-18, -164, 36, 22, 7); ink(2.2);
    X.beginPath(); X.moveTo(-60, -132); X.quadraticCurveTo(0, -126, 60, -132); stroke(3, 'rgba(0,0,0,.18)');
  } else {
    torsoShape(); X.fillStyle = top === 'cowprint' ? '#ffffff' : e.shirt; X.fill();
    if (top === 'cowprint') { X.save(); torsoShape(); X.clip(); cowSpots(e.shirt, -56, -200, 112, 110); X.restore(); }
    if (top === 'tiedye') {
      X.save(); torsoShape(); X.clip();
      const cs = ['#ffd23f', '#7ed1f7', '#a77bf3', '#ff7eb6', '#7ed957', e.shirt];
      for (let r = 150, i = 0; r > 8; r -= 18, i++) { X.beginPath(); X.ellipse(10 + i * 2, -146 + i, r, r * 0.9, i * 0.5, 0, TAU); X.fillStyle = alpha(cs[i % cs.length], 0.85); X.fill(); }
      X.restore();
    }
    if (top === 'stripeslong') {
      X.save(); torsoShape(); X.clip();
      for (let y = -192; y < -86; y += 18) fr(-60, y, 120, 8, 0, stripeCol(e));
      X.restore();
    }
    if (e.top === 'stripes') {
      X.save(); torsoShape(); X.clip();
      const sc = e.shirt === '#ffffff' ? 'rgba(60,80,140,.55)' : 'rgba(255,255,255,.72)';
      for (let y = -190; y < -86; y += 24) fr(-60, y, 120, 11, 0, sc);
      X.restore();
    }
    torsoShape(); cylShade(56); torsoShape(); X.fillStyle = LG(0, -205, 0, -86, 'rgba(255,255,255,.1)', 'rgba(0,0,0,0)', 'rgba(0,0,0,.1)'); X.fill(); for (const k of [-1, 1]) fe(k * 44, -150, 6, 30, 'rgba(0,0,0,.06)');
    if (e.top === 'hoodie') {
      fr(-32, -142, 64, 36, 14, shade(e.shirt, -0.08));
      line(-12, -196, -14, -160, 4, '#ffffff'); line(12, -196, 14, -160, 4, '#ffffff');
    }
    if (e.top === 'overalls') {
      fr(-36, -170, 72, 86, 14, e.pants);
      line(-30, -166, -40, -200, 11, e.pants); line(30, -166, 40, -200, 11, e.pants);
      fc(-27, -160, 5, '#ffd23f'); fc(27, -160, 5, '#ffd23f');
      fr(-17, -148, 34, 24, 8, shade(e.pants, -0.12));
      // cereja no bolso
      line(-4, -146, 2, -136, 2, '#3c8f3a'); line(6, -146, 2, -136, 2, '#3c8f3a');
      fc(-5, -134, 5.5, '#e23b4a'); fc(7, -134, 5.5, '#e23b4a'); fc(-7, -136, 1.6, '#ffffff'); fc(5, -136, 1.6, '#ffffff');
    }
    if (top === 'crop') {
      // moletom cropped largo: barra canelada e barriguinha aparecendo
      X.save(); torsoShape(); X.clip();
      fr(-60, -122, 120, 40, 0, e.skin);
      if (!skirtLike && !tutu) fr(-60, -100, 120, 16, 0, e.pants);
      fc(0, -110, 2.2, shade(e.skin, -0.2));
      X.restore();
      fr(-58, -136, 116, 16, 8, shade(e.shirt === '#ffffff' ? '#e6ebf2' : e.shirt, -0.1)); RR(-58, -136, 116, 16, 8); ink(2.6);
      for (let x = -48; x <= 48; x += 8) line(x, -133, x, -123, 1.4, 'rgba(0,0,0,.12)');
      fe(0, -200, 30, 9, shade(e.shirt === '#ffffff' ? '#e6ebf2' : e.shirt, -0.12));
    }
    if (top === 'cardigan') {
      // colete escolar em V por cima de camisa branca com gola
      X.save(); torsoShape(); X.clip();
      fpoly([-34, -212, 0, -146, 34, -212], '#ffffff');
      for (let r = 0; r < 3; r++) for (let i = -2; i <= 2; i++) { const x = i * 28 + (r % 2) * 14, y = -168 + r * 24; fpoly([x, y - 9, x + 9, y, x, y + 9, x - 9, y], 'rgba(255,255,255,.18)'); }
      fr(-60, -104, 120, 20, 0, shade(e.shirt, -0.12));
      for (let x = -56; x <= 56; x += 7) line(x, -102, x, -86, 1.4, 'rgba(0,0,0,.12)');
      X.restore();
      X.beginPath(); X.moveTo(-32, -204); X.lineTo(0, -146); X.lineTo(32, -204); stroke(6, shade(e.shirt, -0.16));
      for (const k of [-1, 1]) { fpoly([k * 4, -196, k * 30, -206, k * 26, -184], '#ffffff'); X.beginPath(); X.moveTo(k * 4, -196); X.lineTo(k * 30, -206); X.lineTo(k * 26, -184); X.closePath(); ink(2.2); }
    }
    if (top === 'cowprint' || top === 'tiedye' || top === 'stripeslong') fe(0, -200, 28, 8, 'rgba(0,0,0,.12)');
    if (top === 'tee') { starPath(0, -150, 15); X.fillStyle = 'rgba(255,255,255,.55)'; X.fill(); }
    if (top === 'polo') {
      const cc = shade(e.shirt, -0.15);
      fpoly([-24, -204, 0, -190, -6, -180, -30, -196], cc); fpoly([24, -204, 0, -190, 6, -180, 30, -196], cc);
      fr(-4, -190, 8, 34, 3, cc); fc(0, -178, 3, '#ffffff'); fc(0, -166, 3, '#ffffff');
      fr(-53, -110, 106, 8, 4, cc);
    }
    if (top === 'plaid') {
      X.save(); torsoShape(); X.clip();
      for (let x = -60; x < 60; x += 28) fr(x, -210, 12, 130, 0, 'rgba(0,0,0,.16)');
      for (let y = -200; y < -80; y += 28) fr(-60, y, 120, 12, 0, 'rgba(0,0,0,.16)');
      for (let x = -54; x < 60; x += 28) line(x, -210, x, -80, 1.5, 'rgba(255,255,255,.35)');
      X.restore();
      fpoly([-22, -204, 0, -188, -8, -176, -30, -196], shade(e.shirt, -0.2)); fpoly([22, -204, 0, -188, 8, -176, 30, -196], shade(e.shirt, -0.2));
    }
    if (top === 'ruffle') {
      for (let i = 0; i < 7; i++) { X.beginPath(); X.arc(-36 + i * 12, -196, 9, 0, Math.PI); X.fillStyle = '#ffffff'; X.fill(); }
      for (let i = 0; i < 5; i++) { X.beginPath(); X.arc(-24 + i * 12, -176, 7, 0, Math.PI); X.fillStyle = 'rgba(255,255,255,.75)'; X.fill(); }
    }
    if (top === 'raincoat') {
      for (const x of [-16, 16]) for (let i = 0; i < 3; i++) fc(x, -176 + i * 26, 6, shade(e.shirt, -0.3));
      fr(-46, -128, 26, 8, 3, shade(e.shirt, -0.2)); fr(20, -128, 26, 8, 3, shade(e.shirt, -0.2));
      line(0, -198, 0, -88, 2.5, shade(e.shirt, -0.25));
    }
    if (top === 'pajama') {
      X.save(); torsoShape(); X.clip();
      for (let i = 0; i < 8; i++) { const x = -44 + (i % 4) * 30, y = -182 + Math.floor(i / 4) * 44 + (i % 2) * 10; if (i % 3) { starPath(x, y, 8, 5, 0.45); X.fillStyle = 'rgba(255,255,255,.7)'; X.fill(); } else { fc(x, y, 7, 'rgba(255,240,170,.85)'); fc(x + 4, y - 3, 6, e.shirt); } }
      X.restore();
      for (let i = 0; i < 3; i++) fc(0, -176 + i * 24, 4, '#ffffff');
    }
    if (top === 'tank') { for (const k of [-1, 1]) fpoly([k * 57, -198, k * 34, -202, k * 57, -150], e.skin); X.beginPath(); X.moveTo(-26, -204); X.quadraticCurveTo(0, -170, 26, -204); X.closePath(); X.fillStyle = e.skin; X.fill(); }
    if (top === 'shirt') {
      const cc = e.shirt === '#ffffff' ? '#e6ebf2' : '#ffffff';
      fpoly([-26, -204, 0, -184, -8, -172, -32, -194], cc); fpoly([26, -204, 0, -184, 8, -172, 32, -194], cc);
      for (let i = 0; i < 4; i++) fc(0, -164 + i * 20, 3.5, shade(e.shirt, -0.25));
      fr(16, -168, 24, 22, 5, shade(e.shirt, -0.08));
    }
    if (top === 'sweater') {
      X.save(); torsoShape(); X.clip();
      for (let r = 0; r < 4; r++) for (let i = -2; i <= 2; i++) { const x = i * 30 + (r % 2) * 15, y = -184 + r * 26; fpoly([x, y - 12, x + 12, y, x, y + 12, x - 12, y], 'rgba(255,255,255,.22)'); }
      X.restore();
      fr(-54, -102, 108, 16, 8, shade(e.shirt, -0.15)); fe(0, -200, 28, 10, shade(e.shirt, -0.2));
    }
    if (top === 'jacket') {
      fr(-16, -202, 32, 116, 6, '#ffffff');
      line(-16, -198, -16, -88, 3, shade(e.shirt, -0.3)); line(16, -198, 16, -88, 3, shade(e.shirt, -0.3));
      fpoly([-16, -202, -40, -204, -28, -170], shade(e.shirt, -0.15)); fpoly([16, -202, 40, -204, 28, -170], shade(e.shirt, -0.15));
      fr(-46, -126, 22, 5, 2, shade(e.shirt, -0.25)); fr(24, -126, 22, 5, 2, shade(e.shirt, -0.25));
    }
    if (space) {
      fr(-32, -180, 64, 48, 10, '#7ed957'); fr(-24, -172, 48, 32, 6, '#5fbf4a');
      fc(-12, -156, 5, '#ff4d4d'); fc(2, -156, 5, '#4dabf7'); fc(16, -156, 5, '#ffd23f');
      fe(0, -199, 40, 11, '#a77bf3'); fr(-54, -108, 108, 14, 6, '#a77bf3');
    }
  }
  if (DRESSES.has(top) && !LONG_GOWNS.has(top)) { dressShape(); ink(3.2); } else { torsoShape(); ink(3.4); }
  const skDy = top === 'crop' ? 12 : 0;
  if (skirt) {
    X.save(); X.translate(0, skDy);
    X.beginPath(); X.moveTo(-52, -118); X.lineTo(52, -118); X.lineTo(72, -56); X.quadraticCurveTo(0, -46, -72, -56); X.closePath();
    X.fillStyle = LG(-72, 0, 72, 0, shade(e.pants, -0.08), shade(e.pants, 0.1), shade(e.pants, -0.12)); X.fill(); ink(3);
    for (let i = -2; i <= 2; i++) line(i * 22, -114, i * 30, -56, 2.5, 'rgba(0,0,0,.1)');
    fr(-54, -122, 108, 10, 5, shade(e.pants, -0.2));
    X.restore();
  }
  if (pleated) {
    // saia plissada curtinha (uniforme)
    X.save(); X.translate(0, skDy);
    const n = 8, pts = [];
    for (let i = 0; i <= n; i++) pts.push(-76 + i * 19, i % 2 ? -62 : -58);
    X.beginPath(); X.moveTo(-54, -120); X.lineTo(54, -120); X.lineTo(76, -58);
    for (let i = pts.length - 2; i >= 0; i -= 2) X.lineTo(pts[i], pts[i + 1]);
    X.closePath(); X.fillStyle = e.pants; X.fill(); ink(3);
    for (let i = 1; i < n; i++) { const x = -76 + i * 19; line(x * 0.7, -116, x, -60, 2, i % 2 ? 'rgba(0,0,0,.22)' : 'rgba(255,255,255,.18)'); }
    fr(-55, -124, 110, 10, 5, shade(e.pants, -0.18)); RR(-55, -124, 110, 10, 5); ink(2.4);
    X.restore();
  }
  if (tutu) {
    // tutu de bailarina: camadas de tule
    for (let k = 0; k < 3; k++) { X.beginPath(); X.ellipse(0, -100 + k * 4, 84 - k * 10, 22 - k * 3, 0, 0, TAU); X.fillStyle = alpha(e.pants === '#ffffff' ? '#ffd6e5' : e.pants, 0.55); X.fill(); }
    for (let i = 0; i < 10; i++) { X.beginPath(); X.arc(-72 + i * 16, -94, 9, 0, Math.PI); X.fillStyle = 'rgba(255,255,255,.55)'; X.fill(); }
    fr(-54, -124, 108, 12, 6, shade(e.shirt, -0.1));
  }
  if (e.back === 'backpack') { line(-36, -198, -32, -118, 10, '#f07b1f'); line(36, -198, 32, -118, 10, '#f07b1f'); }
  if (e.back === 'bolsa') {
    // bolsinha transversal
    line(-40, -200, 46, -112, 7, '#2f3241');
    fr(28, -124, 46, 36, 12, '#ff7eb6'); RR(28, -124, 46, 36, 12); ink(2.8);
    fr(28, -124, 46, 16, 10, shade('#ff7eb6', -0.12)); fc(51, -108, 4, '#ffd23f');
  }

  X.restore();
  // ----- braços -----
  const sleeve = SLEEVE[e.top] || 30;
  let aL, aR;
  if (held) { aL = 2.5 + Math.sin(t * 8 + ph) * 0.15; aR = -2.5 - Math.sin(t * 8 + ph + 1) * 0.15; }
  else if (sleep) { aL = 0.12; aR = -0.12; }
  else { const sw = Math.sin(t * 1.6 + ph) * 0.04; aL = 0.18 + sw; aR = -0.18 - sw; }
  if (e.reactT > 0 && !held) aR = -2.5 + Math.sin(t * 16) * 0.35;
  if (s === 'swing' || s === 'slide') { aL = 2.6; aR = -2.6; }
  if (dancing) { aL = 2.3 + Math.sin(t * 6 + ph) * 0.6; aR = -2.3 + Math.sin(t * 6 + ph) * 0.6; }
  else if (walking) { aL = 0.18 + Math.sin(t * 11 + ph) * 0.35; aR = -0.18 + Math.sin(t * 11 + ph) * 0.35; }
  const eating = e.eatT > 0;
  if (e.hold && !held) aR = -0.7;
  if (eating) aR = 2.35 + Math.sin(t * 18) * 0.08;
  drawArm(-38, -186, aL, e, sleeve);
  if (!eating) drawArm(38, -186, aR, e, sleeve);
  if (top === 'gown') for (const k of [-1, 1]) { fe(k * 40, -190, 26, 22, shade(e.shirt, 0.15)); fe(k * 37, -196, 10, 6, 'rgba(255,255,255,.35)'); }
  if (top === 'ruffle') for (const k of [-1, 1]) fe(k * 40, -184, 20, 16, shade(e.shirt, 0.12));

  // ----- cabeça -----
  fr(-11, -224, 22, 36, 10, shade(e.skin, -0.1));
  drawNeckItem(e, t);
  fc(-79, HY + 8, 16, e.skin); ink(3); fc(79, HY + 8, 16, e.skin); ink(3);
  fc(-79, HY + 8, 8, shade(e.skin, -0.12)); fc(79, HY + 8, 8, shade(e.skin, -0.12));
  fe(0, -206, 34, 9, 'rgba(60,30,30,.16)');
  fe(0, HY, 80, 77, e.skin); ink(3.6);
  fe(0, HY, 80, 77, RG(-24, HY - 34, 10, 112, 'rgba(255,255,255,.2)', 'rgba(255,255,255,0)', 'rgba(0,0,0,.06)'));
  X.beginPath(); X.ellipse(0, HY, 80, 77, 0, 0.15 * Math.PI, 0.85 * Math.PI); stroke(3, shade(e.skin, -0.12));

  // rosto
  let mood = 'smile';
  if (sleep) mood = 'sleep';
  else if (eating) mood = 'chew';
  else if (held) mood = 'wee';
  else if (typeof Chat !== 'undefined' && Chat.talking(e)) mood = 'talk';
  else if (e.reactT > 0 || s === 'swing' || s === 'slide' || dancing) mood = 'laugh';
  // olhar fixo (horror): olha direto para você, sem piscar; a partir da fase 2 o rosto perde o sorriso
  const staring = e.stare > 0 && !sleep && !held;
  if (staring && mood !== 'talk' && (e.ghost || (typeof Horror !== 'undefined' && Horror.stage >= 2))) mood = 'flat';
  else if (staring && mood !== 'talk') mood = 'smile';
  const lx = staring ? 0 : e.lx || 0, ly = staring ? 0 : e.ly || 0;
  const blink = !staring && e.blinkT < 0.13;
  // rosto expressivo: olhos com branco, íris e pálpebra marcada; nariz com volume; boca aberta sorrindo
  const ey = HY + 6;
  const LN = '#2a1d1a', MOUTH = '#6b1f2a', TONGUE = '#ff7d8f';
  const bc = shade(e.hairColor === '#f2f2f2' ? '#9aa0aa' : e.hairColor, -0.25);
  for (const k of [-1, 1]) {
    const ex = k * 29;
    if (!e.ghost) fe(k * 50, HY + 32, 14, 9, 'rgba(255,100,110,.34)');
    if (mood === 'sleep') { X.beginPath(); X.arc(ex, ey - 2, 6, 0.15 * Math.PI, 0.85 * Math.PI); stroke(3.5, LN); }
    else if (mood === 'laugh' || mood === 'chew') { X.beginPath(); X.arc(ex, ey + 4, 6.5, 1.12 * Math.PI, 1.88 * Math.PI); stroke(3.8, LN); }
    else if (blink) line(ex - 5, ey + 1, ex + 5, ey + 1, 3.5, LN);
    else {
      // olhos de pontinho preto
      const ix = ex + lx * 0.5, iy = ey + ly * 0.5;
      if (mood === 'flat') fe(ix, iy, 7.5, 9, LN); else fe(ix, iy, 5.6, 7, LN);
      if (e.lashes) line(ix + k * 4, iy - 5, ix + k * 9, iy - 9, 2.6, LN);
    }
    // sobrancelha fininha
    const by = ey - 20 - (mood === 'wee' ? 5 : 0);
    X.beginPath(); X.moveTo(ex - 7, by + 1); X.quadraticCurveTo(ex, by - 3, ex + 7, by + 1);
    X.lineCap = 'round'; stroke(3.2, bc);
    if (e.freckles) for (let i = 0; i < 5; i++) fc(k * (38 + (i % 3) * 7), HY + 26 + (i % 2) * 6, 1.9, 'rgba(150,80,50,.55)');
  }
  // narizinho simples
  X.beginPath(); X.arc(0, HY + 21, 4.5, 0.15 * Math.PI, 0.85 * Math.PI); stroke(2.6, shade(e.skin, -0.3));
  // boca
  const my = HY + 36;
  const openMouth = (w, h, teeth = true) => {
    const path = () => { X.beginPath(); X.moveTo(-w, my - 3); X.quadraticCurveTo(0, my + 1, w, my - 3); X.quadraticCurveTo(w * 0.9, my + h, 0, my + h); X.quadraticCurveTo(-w * 0.9, my + h, -w, my - 3); X.closePath(); };
    path(); X.fillStyle = MOUTH; X.fill();
    X.save(); path(); X.clip();
    fe(0, my + h + 1, w * 0.62, h * 0.45, TONGUE);
    if (teeth) fr(-w, my - 8, w * 2, 8, 0, '#ffffff');
    X.restore();
    path(); stroke(2.4, CHAR_INK);
  };
  if (mood === 'flat') line(-9, my - 2, 9, my - 2, 3.4, MOUTH);
  else if (mood === 'smile') { X.beginPath(); X.arc(0, my - 8, 10, 0.2 * Math.PI, 0.8 * Math.PI); X.lineCap = 'round'; stroke(3.4, MOUTH); }
  else if (mood === 'wee') { fe(0, my + 2, 6, 8, MOUTH); }
  else if (mood === 'laugh') openMouth(13, 14, false);
  else if (mood === 'talk') { const o = Math.abs(Math.sin(t * 21 + ph)); openMouth(8 - o * 1.5, 3 + o * 9, false); }
  else if (mood === 'chew') { const o = Math.abs(Math.sin(t * 18)); openMouth(8, 2 + o * 6, false); }
  else { X.beginPath(); X.arc(0, my - 6, 11, 0.25 * Math.PI, 0.75 * Math.PI); stroke(4, MOUTH); }

  hairLayer(() => hairPart(hairFront, e.hairStyle, e.hairColor, e.hairColor2, coveredHead));
  hairTips(e.hairStyle, e.hairTip);
  if (e.hat) { X.save(); const w = WEAR[e.hat]; X.translate(w.ox || 0, w.oy); if (w.rot) X.rotate(w.rot); if (w.sc) X.scale(w.sc, w.sc); w.draw(); X.restore(); }
  if (e.face) { X.save(); X.translate(0, ey + 2); WEAR[e.face].draw(); X.restore(); }
  else if (SCENES[e.scene] && SCENES[e.scene].underwater && e.bottom !== 'mermaid') {
    // máscara de mergulho automática no fundo do mar
    fr(-56, ey - 22, 112, 46, 22, 'rgba(160,220,255,.35)'); RR(-56, ey - 22, 112, 46, 22); stroke(6, '#ff9f43');
    line(-56, ey - 2, -82, ey - 6, 6, '#ff9f43'); line(56, ey - 2, 82, ey - 6, 6, '#ff9f43');
    fpoly([-46, ey - 16, -24, ey - 16, -50, ey + 10], 'rgba(255,255,255,.35)');
    X.beginPath(); X.moveTo(86, ey + 20); X.lineTo(92, ey - 70); X.quadraticCurveTo(94, ey - 84, 104, ey - 82); stroke(9, '#4dabf7');
  }

  // braço direito por cima (comer) + item na mão
  if (eating) drawArm(38, -186, aR, e, sleeve);
  if (e.hold && !noItem) {
    const it = getEnt(e.hold);
    if (it) {
      const hx = 38 - 80 * Math.sin(aR), hy = -186 + 80 * Math.cos(aR);
      X.save(); X.translate(hx, hy + 14); X.scale(0.72, 0.72);
      drawItemShape(it, t);
      if (G.viewInv && it.type !== 'balloon') {
        const p = G.viewInv.multiply(X.getTransform()).transformPoint(new DOMPoint(0, 0));
        it.x = p.x; it.y = p.y;
      } else if (G.viewInv) {
        const p = G.viewInv.multiply(X.getTransform()).transformPoint(new DOMPoint(0, -150));
        it.x = p.x; it.y = p.y + 150 * 0.72;
      }
      X.restore();
      X.save(); X.translate(hx, hy); X.rotate(aR); X.translate(0, -80); drawHand(e.skin, -1); X.restore();
    }
  }
  X.restore();
  INK = inkPrev;
}

// ================= Acessórios (chapéus e óculos) =================
const WEAR = {
  cap: { n: 'Boné', slot: 'hat', oy: -320, w: 160, h: 96, draw() {
    X.beginPath(); X.moveTo(-76, 0); X.bezierCurveTo(-76, -96, 76, -96, 76, 0); X.closePath();
    X.fillStyle = '#ff5d5d'; X.fill(); cylShade(76);
    fe(54, -4, 52, 11, '#d13b3b'); fc(0, -72, 7, '#d13b3b');
    fr(-20, -48, 40, 22, 8, '#ffffff'); starPath(0, -37, 9); X.fillStyle = '#ff5d5d'; X.fill();
  } },
  beanie: { n: 'Gorro', slot: 'hat', oy: -318, w: 160, h: 110, draw() {
    X.beginPath(); X.moveTo(-78, 0); X.bezierCurveTo(-78, -104, 78, -104, 78, 0); X.closePath();
    X.fillStyle = '#4dabf7'; X.fill(); cylShade(78);
    fr(-82, -26, 164, 32, 14, '#2f86d6');
    for (let i = -3; i <= 3; i++) line(i * 22, -22, i * 22, 2, 3, 'rgba(255,255,255,.25)');
    fc(0, -84, 18, '#ffffff'); fc(-5, -90, 6, 'rgba(255,255,255,.8)');
  } },
  tophat: { n: 'Cartola', slot: 'hat', oy: -326, w: 170, h: 130, draw() {
    fe(0, -6, 84, 15, '#23253a');
    fr(-50, -124, 100, 120, 10, LG(-50, 0, 50, 0, '#3a3d58', '#23253a', '#15162a'));
    fr(-50, -44, 100, 18, 0, '#e2553e');
    fe(0, -124, 50, 9, '#3a3d58');
  } },
  crown: { n: 'Coroa', slot: 'hat', oy: -330, w: 140, h: 80, draw() {
    fpoly([-60, 0, -68, -64, -34, -32, 0, -78, 34, -32, 68, -64, 60, 0], LG(0, -78, 0, 0, '#fff1a6', '#ffcf3d', '#e79b12'));
    fr(-62, -14, 124, 16, 6, '#e79b12');
    fc(0, -78, 8, '#ff5d8f'); fc(-68, -64, 7, '#4dabf7'); fc(68, -64, 7, '#7ed957');
    fc(0, -8, 6, '#ff5d8f'); fc(-36, -8, 5, '#4dabf7'); fc(36, -8, 5, '#4dabf7');
  } },
  bow: { n: 'Laço', slot: 'hat', oy: -350, ox: 50, rot: 0.35, sc: 0.85, w: 120, h: 70, draw() {
    fpoly([0, -30, -56, -62, -56, 2], '#ff5d8f'); fpoly([0, -30, 56, -62, 56, 2], '#ff5d8f');
    fpoly([0, -30, -40, -50, -40, -10], '#ff86ad'); fpoly([0, -30, 40, -50, 40, -10], '#ff86ad');
    fc(0, -30, 13, '#e43f74');
  } },
  flower: { n: 'Flor', slot: 'hat', oy: -336, ox: -54, sc: 0.9, w: 90, h: 90, draw() {
    for (let i = 0; i < 6; i++) { const a = (i / 6) * TAU; fc(Math.cos(a) * 22, -40 + Math.sin(a) * 22, 17, '#ffd23f'); }
    fc(0, -40, 15, '#ff8a3d'); fc(-4, -45, 5, 'rgba(255,255,255,.6)');
  } },
  glasses: { n: 'Óculos', slot: 'face', w: 140, h: 50, draw() {
    for (const k of [-1, 1]) { X.beginPath(); X.arc(k * 30, 0, 21, 0, TAU); X.fillStyle = 'rgba(200,230,255,.25)'; X.fill(); stroke(5, '#2f3241'); }
    line(-9, -4, 9, -4, 5, '#2f3241'); line(-51, -4, -76, -10, 5, '#2f3241'); line(51, -4, 76, -10, 5, '#2f3241');
  } },
  sunglasses: { n: 'Óculos escuros', slot: 'face', w: 150, h: 50, draw() {
    for (const k of [-1, 1]) { fr(k * 31 - 25, -18, 50, 36, 14, '#1d1f2e'); fe(k * 31 - 9, -8, 9, 5, 'rgba(255,255,255,.35)', -0.4); }
    line(-8, -6, 8, -6, 6, '#1d1f2e'); line(-56, -8, -78, -12, 5, '#1d1f2e'); line(56, -8, 78, -12, 5, '#1d1f2e');
  } },
  hearts: { n: 'Óculos coração', slot: 'face', w: 150, h: 54, draw() {
    for (const k of [-1, 1]) { heartPath(k * 31, 2, 26); X.fillStyle = '#ff5d8f'; X.fill(); fe(k * 31 - 9, -10, 7, 4, 'rgba(255,255,255,.45)', -0.4); }
    line(-8, -6, 8, -6, 5, '#e43f74'); line(-56, -8, -78, -12, 5, '#e43f74'); line(56, -8, 78, -12, 5, '#e43f74');
  } },
};

// ================= Itens =================
const ITEMS = {
  apple: { n: 'Maçã', w: 70, h: 82, food: 3, draw() {
    fe(0, -34, 34, 32, LG(-30, -66, 30, 0, '#ff8a7a', '#ec3f45', '#b8182c'));
    fe(-13, -46, 8, 12, 'rgba(255,255,255,.55)', -0.5);
    fr(-3, -80, 6, 18, 3, '#7a4b2a'); fe(14, -72, 15, 7, '#62c24f', -0.5);
  } },
  banana: { n: 'Banana', w: 104, h: 50, food: 3, draw() {
    X.beginPath(); X.moveTo(-48, -36); X.quadraticCurveTo(0, 4, 48, -40);
    X.quadraticCurveTo(54, -46, 46, -48); X.quadraticCurveTo(0, -20, -44, -46); X.closePath();
    X.fillStyle = LG(0, -48, 0, -10, '#fff08a', '#ffd23f', '#e8a92a'); X.fill();
    fc(-46, -41, 5, '#6b4a2b'); fc(49, -44, 4, '#6b4a2b');
  } },
  pizza: { n: 'Pizza', w: 96, h: 80, food: 3, draw() {
    fpoly([-42, -64, 42, -64, 0, 0], LG(0, -64, 0, 0, '#ffe08a', '#ffc94d'));
    fr(-48, -78, 96, 18, 9, LG(0, -78, 0, -60, '#f0a85a', '#c97a32'));
    fc(-14, -46, 9, '#d64545'); fc(14, -40, 8, '#d64545'); fc(0, -20, 7, '#d64545');
    fc(18, -54, 3, '#3f8f3f'); fc(-6, -32, 3, '#3f8f3f');
  } },
  cake: { n: 'Bolo', w: 110, h: 100, food: 4, draw() {
    fe(0, -2, 58, 9, '#e9eef5');
    fr(-50, -62, 100, 60, 12, LG(0, -62, 0, 0, '#ffd0de', '#ff9ebb'));
    fr(-50, -36, 100, 8, 0, '#fff4e0');
    X.beginPath(); X.moveTo(-50, -54); X.lineTo(-50, -66); X.quadraticCurveTo(-50, -72, -44, -72); X.lineTo(44, -72); X.quadraticCurveTo(50, -72, 50, -66); X.lineTo(50, -54);
    for (let i = 0; i <= 5; i++) { const x = 50 - i * 20; X.quadraticCurveTo(x - 10, -36 - (i % 2) * 8, x - 20, -54); }
    X.closePath(); X.fillStyle = '#ffffff'; X.fill();
    fc(0, -82, 11, '#e8283f'); fc(-3, -86, 3.5, 'rgba(255,255,255,.7)'); line(0, -92, 6, -102, 3, '#5a8f3a');
  } },
  donut: { n: 'Rosquinha', w: 84, h: 80, food: 3, draw() {
    X.beginPath(); X.arc(0, -38, 38, 0, TAU); X.moveTo(13, -38); X.arc(0, -38, 13, 0, TAU, true);
    X.fillStyle = '#d99a5b'; X.fill();
    X.beginPath(); X.arc(0, -40, 34, 0, TAU); X.moveTo(15, -40); X.arc(0, -40, 15, 0, TAU, true);
    X.fillStyle = '#ff8fb8'; X.fill();
    const cs = ['#fff', '#4dabf7', '#ffd23f', '#7ed957'];
    for (let i = 0; i < 12; i++) { const a = i * 0.52, r = 24 + (i % 2) * 4; X.save(); X.translate(Math.cos(a) * r, -40 + Math.sin(a) * r); X.rotate(a * 2); fr(-5, -1.5, 10, 3, 1.5, cs[i % 4]); X.restore(); }
  } },
  icecream: { n: 'Sorvete', w: 70, h: 120, food: 3, draw() {
    fpoly([-24, -64, 24, -64, 0, 0], '#e9b16b');
    X.save(); poly([-24, -64, 24, -64, 0, 0]); X.clip();
    for (let i = -3; i < 4; i++) { line(i * 14 - 20, -70, i * 14 + 20, 0, 2.5, '#c98c46'); line(i * 14 + 20, -70, i * 14 - 20, 0, 2.5, '#c98c46'); }
    X.restore();
    fc(0, -72, 27, '#ffb3d1'); fc(-8, -100, 23, '#9ee6c5'); fc(8, -96, 6, 'rgba(255,255,255,.5)');
    fc(-10, -122, 8, '#e8283f');
  } },
  juice: { n: 'Suco', w: 64, h: 110, drink: 1, draw(it) {
    const lv = it.level ?? 1;
    fr(-25, -84, 50, 84, 12, 'rgba(220,240,255,.55)');
    if (lv > 0) fr(-21, -4 - 72 * lv, 42, 72 * lv, 9, LG(0, -80, 0, 0, '#ffc04d', '#ff8a2a'));
    line(8, -100, 0, -40, 6, '#ff5d8f');
    fc(-20, -84, 13, '#ffb347'); fc(-20, -84, 9, '#ffd57a');
    fr(-18, -78, 6, 60, 3, 'rgba(255,255,255,.5)');
  } },
  milk: { n: 'Leite', w: 64, h: 116, drink: 1, draw(it) {
    fr(-28, -88, 56, 88, 6, '#ffffff');
    fpoly([-28, -88, 0, -112, 28, -88], '#eef3f8'); fr(-6, -116, 12, 10, 2, '#4dabf7');
    fr(-28, -60, 56, 30, 0, '#4dabf7');
    fe(-10, -76, 7, 5, '#2f3241'); fe(14, -18, 6, 4, '#2f3241');
    X.font = 'bold 15px Fredoka, sans-serif'; X.textAlign = 'center'; X.fillStyle = '#fff'; X.fillText('LEITE', 0, -40);
    if ((it.level ?? 1) <= 0) { fr(-28, -88, 56, 88, 6, 'rgba(0,0,0,.08)'); }
  } },
  coffee: { n: 'Café', w: 80, h: 64, drink: 1, draw(it) {
    fe(0, -3, 40, 8, '#e9eef5');
    X.beginPath(); X.arc(26, -30, 12, -1.2, 1.2); stroke(6, '#ffffff');
    fr(-26, -52, 52, 48, 14, LG(-26, 0, 26, 0, '#ffffff', '#e3e8ee'));
    if ((it.level ?? 1) > 0) fe(0, -50, 22, 5, '#6b3e26');
    fr(-26, -32, 52, 8, 0, '#ff7eb6');
  }, update(it, dt) { if ((it.level ?? 1) > 0 && Math.random() < dt * 1.2) emit('steam', it.x, it.y - 60, 1); } },
  cupcake: { n: 'Cupcake', w: 70, h: 96, food: 3, draw() {
    fpoly([-28, -40, 28, -40, 20, 0, -20, 0], '#7ad0f0');
    for (let i = -2; i <= 2; i++) line(i * 10, -38, i * 7, -2, 3, '#58b6da');
    fc(-14, -46, 17, '#fff3f8'); fc(14, -46, 17, '#fff3f8'); fc(0, -62, 20, '#ffe2ee'); fc(0, -76, 12, '#fff3f8');
    fc(2, -90, 8, '#e8283f');
  } },
  croissant: { n: 'Croissant', w: 104, h: 56, food: 3, draw() {
    const cs = ['#e8a64a', '#f2bb63', '#e8a64a', '#f2bb63', '#e8a64a'];
    [[-40, -18, 14], [-22, -28, 19], [0, -32, 22], [22, -28, 19], [40, -18, 14]].forEach((p, i) => fe(p[0], p[1], p[2] + 4, p[2], cs[i], (i - 2) * 0.35));
    fe(-6, -42, 14, 5, 'rgba(255,255,255,.35)');
  } },
  bread: { n: 'Pão', w: 110, h: 60, food: 3, draw() {
    fe(0, -26, 52, 26, LG(0, -52, 0, 0, '#f6c27a', '#d7893f'));
    for (let i = -1; i <= 1; i++) line(i * 22 - 8, -40, i * 22 + 8, -22, 4, '#f9dcae');
  } },
  carrot: { n: 'Cenoura', w: 50, h: 110, food: 3, draw() {
    fpoly([-14, -76, 14, -76, 2, 0, -2, 0], LG(0, -76, 0, 0, '#ff9f43', '#f07b1f'));
    line(-8, -54, 2, -54, 3, '#d9681a'); line(-2, -32, 6, -32, 3, '#d9681a');
    fe(-8, -90, 6, 16, '#5fbf4a', -0.3); fe(8, -90, 6, 16, '#4ea83c', 0.3); fe(0, -96, 6, 18, '#62c24f');
  } },
  watermelon: { n: 'Melancia', w: 110, h: 62, food: 3, draw() {
    X.beginPath(); X.arc(0, -4, 54, Math.PI, 0); X.closePath(); X.fillStyle = '#3fae49'; X.fill();
    X.beginPath(); X.arc(0, -4, 47, Math.PI, 0); X.closePath(); X.fillStyle = '#d7f5c3'; X.fill();
    X.beginPath(); X.arc(0, -4, 42, Math.PI, 0); X.closePath(); X.fillStyle = '#ff5468'; X.fill();
    for (let i = 0; i < 6; i++) fe(-28 + i * 11, -14 - (i % 2) * 12, 2.5, 4, '#2f3241');
  } },
  egg: { n: 'Ovo', w: 58, h: 74, tapHint: true, draw(it) {
    fe(0, -35, 27, 35, LG(-20, -66, 20, 0, '#fffaf0', '#f1e3c8'));
    fe(-9, -48, 6, 10, 'rgba(255,255,255,.8)', -0.3);
    const c = it.crack || 0;
    if (c > 0) { X.beginPath(); X.moveTo(-24, -40); X.lineTo(-12, -48); X.lineTo(-2, -38); if (c > 1) { X.lineTo(10, -50); X.lineTo(24, -40); } stroke(3, '#a08868'); }
  }, tap(it) {
    it.crack = (it.crack || 0) + 1; it.sq = 0.5; Sfx.click();
    if (it.crack >= 3) { it.type = 'chick'; it.crack = 0; emit('star', it.x, it.y - 40, 10); Sfx.chirp(); }
  } },
  chick: { n: 'Pintinho', w: 70, h: 80, draw() {
    line(-10, -6, -12, 0, 4, '#ff9f43'); line(10, -6, 12, 0, 4, '#ff9f43');
    fe(0, -30, 30, 26, '#ffd84d'); fc(4, -58, 20, '#ffd84d');
    fe(-10, -28, 14, 10, '#f5c32c', 0.3);
    fc(11, -62, 4, '#2a1d1a'); fc(10, -63.5, 1.4, '#fff');
    fpoly([22, -58, 34, -54, 22, -50], '#ff9f43');
    fe(-1, -78, 3, 7, '#ffd84d', -0.4);
  }, tap(it) { Sfx.chirp(); hop(it, 520); }, update(it, dt) {
    if (it.state === 'idle' && !it.cont && Math.random() < dt * 0.22) { hop(it, 380); if (Math.random() < 0.5) Sfx.chirp(); }
  } },
  ball: { n: 'Bola', w: 78, h: 78, bounce: 0.55, roll: true, draw(it) {
    X.save(); X.translate(0, -36); X.rotate(it.rot || 0);
    fc(0, 0, 36, '#ff6b6b');
    X.save(); X.beginPath(); X.arc(0, 0, 36, 0, TAU); X.clip();
    fr(-40, -9, 80, 18, 0, '#ffffff'); fr(-9, -40, 18, 80, 0, '#4dabf7');
    X.restore(); X.restore();
    fc(-12, -50, 9, 'rgba(255,255,255,.45)');
    X.beginPath(); X.arc(0, -36, 36, 0, TAU); X.fillStyle = RG(-12, -50, 4, 44, 'rgba(255,255,255,0)', 'rgba(0,0,0,.18)'); X.fill();
  }, tap(it) { Sfx.boing(); hop(it, 900); } },
  teddy: { n: 'Ursinho', w: 92, h: 104, draw() {
    const b = '#b5793f', l = '#d9a36b';
    fe(-26, -10, 16, 12, b); fe(26, -10, 16, 12, b);
    fe(0, -36, 34, 32, b); fe(0, -32, 20, 18, l);
    fe(-34, -44, 11, 20, b, 0.4); fe(34, -44, 11, 20, b, -0.4);
    fc(-26, -96, 13, b); fc(26, -96, 13, b); fc(-26, -96, 7, l); fc(26, -96, 7, l);
    fc(0, -76, 30, b); fe(0, -68, 14, 10, l);
    fc(-11, -82, 4, '#2a1d1a'); fc(11, -82, 4, '#2a1d1a'); fe(0, -72, 5, 3.5, '#2a1d1a');
    fr(-14, -50, 28, 8, 4, '#ff5d8f');
  }, tap(it) { Sfx.squeak(); it.sq = 0.6; emit('heart', it.x, it.y - 100, 2); } },
  book: { n: 'Livro', w: 64, h: 86, draw() {
    fr(-26, -82, 54, 82, 6, '#f3efe6');
    fr(-30, -82, 52, 82, 6, LG(-30, 0, 22, 0, '#4a63d9', '#5c7cfa'));
    fr(-30, -82, 9, 82, 4, '#3a50b8');
    fr(-14, -64, 28, 6, 3, '#ffd23f'); fr(-14, -52, 20, 4, 2, 'rgba(255,255,255,.7)');
  } },
  plant: { n: 'Planta', w: 80, h: 110, draw() {
    [[-0.5, 26], [0.5, 26], [-0.15, 34], [0.2, 30], [-0.8, 20], [0.85, 20]].forEach(([a, l]) => {
      X.save(); X.translate(0, -50); X.rotate(a); fe(0, -l, 11, l, a > 0 ? '#4ea83c' : '#62c24f'); X.restore();
    });
    fpoly([-30, -52, 30, -52, 22, 0, -22, 0], LG(0, -52, 0, 0, '#ff9b6a', '#e2703e'));
    fr(-34, -58, 68, 12, 5, '#f08655');
  } },
  guitar: { n: 'Violão', w: 80, h: 160, draw() {
    fr(-6, -156, 12, 92, 4, '#7a4b2a'); fr(-10, -164, 20, 16, 4, '#5a3520');
    fc(0, -34, 32, '#ff9f43'); fc(0, -76, 24, '#ff9f43'); fc(0, -40, 10, '#5a3520');
    fr(-14, -18, 28, 6, 3, '#5a3520');
    for (let i = -1; i <= 1; i++) line(i * 3, -150, i * 3, -16, 1, 'rgba(255,255,255,.7)');
    fe(-12, -50, 8, 14, 'rgba(255,255,255,.25)', 0.3);
  }, tap(it) { Sfx.strum(); emit('note', it.x, it.y - 120, 3); it.sq = 0.3; } },
  balloon: { n: 'Balão', w: 90, h: 260, float: true, draw(it) {
    const col = it.col || '#ff5d8f';
    X.beginPath(); X.moveTo(0, 0); X.bezierCurveTo(14, -50, -14, -100, 0, -152); stroke(2.5, '#9aa0aa');
    fpoly([-7, -148, 7, -148, 0, -158], shade(col, -0.2));
    fe(0, -206, 42, 52, RG(-14, -226, 4, 60, shade(col, 0.35), col, shade(col, -0.2)));
    fe(-16, -226, 8, 15, 'rgba(255,255,255,.45)', 0.4);
  }, tap(it) { Sfx.pop(); emit('confetti', it.x, it.y - 200, 18); removeEnt(it); } },
  // ----- objetos de escola e brinquedinhos -----
  popit: { n: 'Pop-it', decor: 1, cat: 'objetos', w: 96, h: 70, cols: ['#ff7eb6', '#a77bf3', '#7ed957', '#4dabf7'], draw(it) {
    const cs = ['#ff6b6b', '#ff9f43', '#ffd23f', '#7ed957', '#4dabf7', '#a77bf3'], p = it.popped || 0;
    X.beginPath(); X.moveTo(0, -6); X.bezierCurveTo(-60, -40, -40, -86, 0, -60); X.bezierCurveTo(40, -86, 60, -40, 0, -6); X.closePath();
    X.fillStyle = cs[0]; X.fill(); X.save(); X.clip();
    for (let i = 0; i < 6; i++) fr(-50, -82 + i * 13, 100, 13, 0, cs[i]);
    let n = 0;
    for (let r = 0; r < 5; r++) for (let c = 0; c < 5; c++) {
      const x = -24 + c * 12 + (r % 2) * 6, y = -70 + r * 12;
      fc(x, y, 4.6, (p >> (n++ % 24)) & 1 ? 'rgba(0,0,0,.22)' : 'rgba(255,255,255,.4)');
    }
    X.restore();
    X.beginPath(); X.moveTo(0, -6); X.bezierCurveTo(-60, -40, -40, -86, 0, -60); X.bezierCurveTo(40, -86, 60, -40, 0, -6); X.closePath(); stroke(3, CHAR_INK);
  }, tap(it) { it.popped = (it.popped || 0) ^ (1 << ((Math.random() * 24) | 0)); Sfx.pop(); it.sq = 0.25; } },
  celular: { n: 'Celular', decor: 1, cat: 'objetos', w: 50, h: 86, cols: ['#ff7eb6', '#2f3241', '#a77bf3', '#7ed1f7'], draw(it) {
    const c = dcol(it, this);
    fr(-22, -84, 44, 84, 10, c); RR(-22, -84, 44, 84, 10); stroke(3, CHAR_INK);
    fr(-17, -78, 34, 66, 5, it.on ? LG(0, -78, 0, -12, '#7ed1f7', '#a77bf3') : '#1d1f2e');
    if (it.on) { fc(-6, -60, 4, '#ffffff'); fr(-10, -48, 20, 4, 2, 'rgba(255,255,255,.7)'); fr(-10, -40, 14, 4, 2, 'rgba(255,255,255,.5)'); }
    fc(0, -6, 3, 'rgba(255,255,255,.5)');
  }, tap(it) { it.on = !it.on; Sfx.beep(); } },
  calculadora: { n: 'Calculadora', decor: 1, cat: 'objetos', w: 60, h: 86, cols: ['#ffd23f', '#7ed957', '#ff9f43'], draw(it) {
    const c = dcol(it, this);
    fr(-26, -84, 52, 84, 8, c); RR(-26, -84, 52, 84, 8); stroke(3, CHAR_INK);
    fr(-20, -76, 40, 18, 4, '#cfe8c8'); X.fillStyle = '#2f3241'; X.font = 'bold 13px sans-serif'; X.textAlign = 'right'; X.fillText(String(it.num || 0), 17, -62);
    for (let r = 0; r < 4; r++) for (let k = 0; k < 3; k++) fr(-19 + k * 14, -52 + r * 12, 10, 8, 3, r === 3 && k === 2 ? '#ff6b6b' : '#ffffff');
  }, tap(it) { it.num = ((it.num || 0) * 10 + ((Math.random() * 10) | 0)) % 100000; Sfx.click(); } },
  lapis: { n: 'Lápis', decor: 1, cat: 'objetos', w: 110, h: 30, cols: ['#ffd23f', '#ff7eb6', '#4dabf7'], draw(it) {
    const c = dcol(it, this);
    fr(-44, -22, 74, 16, 3, c); fr(-44, -22, 74, 5, 2, shade(c, 0.15));
    fr(-54, -22, 12, 16, 3, '#ff9fb0'); fr(-44, -22, 6, 16, 0, '#c9ccd4');
    fpoly([30, -22, 50, -14, 30, -6], '#f3d2a2'); fpoly([44, -16.5, 50, -14, 44, -11.5], '#2f3241');
    X.beginPath(); X.rect(-54, -22, 84, 16); stroke(2.6, CHAR_INK);
  } },
  regua: { n: 'Régua', decor: 1, cat: 'objetos', w: 130, h: 26, cols: ['#ffe9a8', '#bfe6ff', '#ffd1e4'], draw(it) {
    fr(-62, -22, 124, 20, 3, dcol(it, this)); RR(-62, -22, 124, 20, 3); stroke(2.6, CHAR_INK);
    for (let i = 0; i <= 20; i++) line(-56 + i * 5.6, -22, -56 + i * 5.6, i % 5 ? -17 : -13, 1.4, '#2f3241');
  } },
  durex: { n: 'Fita adesiva', decor: 1, cat: 'objetos', w: 64, h: 60, cols: ['#ff7eb6', '#7ed957', '#4dabf7'], draw(it) {
    const c = dcol(it, this);
    fr(-28, -22, 56, 22, 6, c); fc(-6, -30, 22, 'rgba(255,240,200,.9)'); X.beginPath(); X.arc(-6, -30, 22, 0, TAU); stroke(3, CHAR_INK);
    fc(-6, -30, 11, '#ffffff'); X.beginPath(); X.arc(-6, -30, 11, 0, TAU); stroke(2.4, CHAR_INK);
    fpoly([14, -36, 30, -30, 26, -22], '#ffffff'); RR(-28, -22, 56, 22, 6); stroke(3, CHAR_INK);
  } },
};
function mouseEars(col) {
  X.beginPath(); X.arc(0, 30, 84, Math.PI * 1.15, Math.PI * 1.85); stroke(9, col);
  for (const k of [-1, 1]) { fc(k * 66, -58, 36, col); fc(k * 60, -66, 12, 'rgba(255,255,255,.12)'); }
}
Object.assign(WEAR, {
  mouseears: { n: 'Orelhas de ratinho', slot: 'hat', oy: -318, w: 190, h: 110, draw() { mouseEars('#1d1f2e'); } },
  dotbow: { n: 'Laço de bolinhas', slot: 'hat', oy: -318, w: 190, h: 130, draw() {
    mouseEars('#1d1f2e');
    X.save(); X.translate(0, -60);
    for (const k of [-1, 1]) { X.beginPath(); X.moveTo(0, 0); X.quadraticCurveTo(k * 50, -48, k * 66, -6); X.quadraticCurveTo(k * 50, 36, 0, 0); X.closePath(); X.fillStyle = '#ff3b4f'; X.fill(); }
    X.save(); X.beginPath(); for (const k of [-1, 1]) { X.moveTo(0, 0); X.quadraticCurveTo(k * 50, -48, k * 66, -6); X.quadraticCurveTo(k * 50, 36, 0, 0); } X.clip();
    for (let i = 0; i < 10; i++) fc(-56 + (i % 5) * 28, -18 + ((i / 5) | 0) * 26 + (i % 2) * 6, 6, '#ffffff');
    X.restore();
    fc(0, 0, 13, '#e0283c'); X.restore();
  } },
  tiara: { n: 'Tiara', slot: 'hat', oy: -336, w: 120, h: 56, draw() {
    X.beginPath(); X.moveTo(-54, 0); X.lineTo(-40, -22); X.lineTo(-22, -10); X.lineTo(0, -40); X.lineTo(22, -10); X.lineTo(40, -22); X.lineTo(54, 0); X.quadraticCurveTo(0, -12, -54, 0); X.closePath();
    X.fillStyle = LG(0, -40, 0, 0, '#ffffff', '#cfe7ff', '#9cc8f2'); X.fill(); stroke(2, '#8ab4e0');
    fc(0, -22, 7, '#5c7cfa'); fc(-28, -8, 4, '#ff7eb6'); fc(28, -8, 4, '#ff7eb6');
  } },
  pirate: { n: 'Chapéu de pirata', slot: 'hat', oy: -318, w: 200, h: 100, draw() {
    X.beginPath(); X.moveTo(-96, -8); X.quadraticCurveTo(-60, -110, 0, -84); X.quadraticCurveTo(60, -110, 96, -8); X.quadraticCurveTo(0, 14, -96, -8); X.closePath();
    X.fillStyle = LG(0, -100, 0, 0, '#3a3d58', '#1d1f2e'); X.fill();
    X.beginPath(); X.moveTo(-96, -8); X.quadraticCurveTo(0, 6, 96, -8); stroke(5, '#e8b04a');
    fc(0, -46, 15, '#ffffff'); fc(-5, -48, 3.5, '#1d1f2e'); fc(5, -48, 3.5, '#1d1f2e'); line(-14, -26, 14, -36, 4, '#ffffff'); line(14, -26, -14, -36, 4, '#ffffff');
  } },
  wizard: { n: 'Chapéu de mago', slot: 'hat', oy: -316, w: 190, h: 200, draw() {
    fe(0, -4, 92, 16, '#3b4bc8');
    X.beginPath(); X.moveTo(-64, -6); X.quadraticCurveTo(-20, -120, 10, -180); X.quadraticCurveTo(40, -200, 56, -170); X.quadraticCurveTo(30, -160, 26, -140); X.quadraticCurveTo(50, -60, 64, -6); X.closePath();
    X.fillStyle = LG(-64, 0, 64, 0, '#4a63d9', '#5c7cfa', '#3b4bc8'); X.fill();
    starPath(-10, -60, 12); X.fillStyle = '#fff3a8'; X.fill(); starPath(20, -110, 8); X.fill(); starPath(18, -30, 7); X.fill();
    fc(-20, -100, 10, '#fff3a8'); fc(-14, -104, 9, '#4a63d9');
  } },
  cowboy: { n: 'Chapéu de cowboy', slot: 'hat', oy: -318, w: 230, h: 100, draw() {
    X.beginPath(); X.moveTo(-112, -20); X.quadraticCurveTo(-90, 6, 0, 4); X.quadraticCurveTo(90, 6, 112, -20); X.quadraticCurveTo(80, -2, 0, -6); X.quadraticCurveTo(-80, -2, -112, -20); X.closePath();
    X.fillStyle = '#a0662f'; X.fill();
    X.beginPath(); X.moveTo(-56, -6); X.quadraticCurveTo(-60, -84, -20, -80); X.quadraticCurveTo(0, -66, 20, -80); X.quadraticCurveTo(60, -84, 56, -6); X.closePath();
    X.fillStyle = LG(-56, 0, 56, 0, '#c4843e', '#a0662f'); X.fill();
    fr(-56, -26, 112, 14, 4, '#5a3520');
  } },
  flowercrown: { n: 'Coroa de flores', slot: 'hat', oy: -330, w: 180, h: 60, draw() {
    X.beginPath(); X.arc(0, 60, 96, Math.PI * 1.15, Math.PI * 1.85); stroke(6, '#4ea83c');
    const cs = ['#ff7eb6', '#ffd23f', '#ffffff', '#a77bf3', '#ff9f43'];
    for (let i = 0; i < 7; i++) {
      const a = Math.PI * (1.17 + i * 0.11), x = Math.cos(a) * 96, y = 60 + Math.sin(a) * 96;
      for (let p = 0; p < 5; p++) { const b = (p / 5) * TAU; fc(x + Math.cos(b) * 8, y + Math.sin(b) * 8, 7, cs[i % 5]); }
      fc(x, y, 5, '#ffb400');
    }
  } },
  catears: { n: 'Orelhas de gatinho', slot: 'hat', oy: -318, w: 180, h: 100, draw() {
    X.beginPath(); X.arc(0, 30, 84, Math.PI * 1.15, Math.PI * 1.85); stroke(9, '#ff7eb6');
    for (const k of [-1, 1]) { fpoly([k * 30, -44, k * 74, -94, k * 76, -30], '#ff7eb6'); fpoly([k * 42, -44, k * 70, -78, k * 70, -40], '#ffd0e2'); }
  } },
  headphones: { n: 'Fone de ouvido', slot: 'hat', oy: -322, w: 200, h: 150, gy: -50, draw() {
    X.beginPath(); X.moveTo(-86, 36); X.bezierCurveTo(-96, -96, 96, -96, 86, 36); stroke(12, '#5c7cfa');
    for (const k of [-1, 1]) { fr(k * 86 - 18, 18, 36, 56, 16, '#3b4bc8'); fr(k * 86 - 10, 26, 20, 40, 10, '#ff7eb6'); }
  } },
  mask: { n: 'Máscara de herói', slot: 'face', w: 160, h: 50, draw() {
    X.beginPath();
    X.moveTo(-74, -6); X.quadraticCurveTo(-60, -26, -30, -22); X.quadraticCurveTo(0, -26, 30, -22); X.quadraticCurveTo(60, -26, 74, -6); X.quadraticCurveTo(64, 20, 30, 16); X.quadraticCurveTo(0, 8, -30, 16); X.quadraticCurveTo(-64, 20, -74, -6); X.closePath();
    for (const k of [-1, 1]) { X.moveTo(k * 30 + 13, 0); X.ellipse(k * 30, 0, 13, 11, 0, 0, TAU); }
    X.fillStyle = '#1d1f2e'; X.fill('evenodd');
    line(-74, -6, -92, 4, 5, '#1d1f2e'); line(74, -6, 92, 4, 5, '#1d1f2e');
  } },
  starglasses: { n: 'Óculos estrela', slot: 'face', w: 150, h: 60, draw() {
    for (const k of [-1, 1]) { starPath(k * 31, 0, 26, 5, 0.55); X.fillStyle = 'rgba(255,210,63,.85)'; X.fill(); stroke(3, '#ff9f43'); }
    line(-8, -4, 8, -4, 4, '#ff9f43');
  } },
  cape: { n: 'Capa de herói', slot: 'back', w: 120, h: 110, gy: 0, draw() {
    X.beginPath(); X.moveTo(-40, -100); X.lineTo(40, -100); X.quadraticCurveTo(66, -50, 56, 0); X.quadraticCurveTo(0, 8, -56, 0); X.quadraticCurveTo(-66, -50, -40, -100); X.closePath();
    X.fillStyle = LG(-60, 0, 60, 0, '#c4302b', '#ff4d4d', '#c4302b'); X.fill();
    fr(-44, -106, 88, 12, 6, '#ffd23f');
  } },
  wings: { n: 'Asas de fada', slot: 'back', w: 150, h: 110, draw() {
    for (const k of [-1, 1]) { fe(k * 34, -66, 30, 44, 'rgba(160,225,255,.8)', k * 0.4); fe(k * 28, -20, 22, 28, 'rgba(255,200,235,.8)', -k * 0.4); }
    fc(0, -44, 7, '#ffd23f');
  } },
  backpack: { n: 'Mochila', slot: 'back', w: 110, h: 120, draw() {
    fr(-46, -112, 92, 112, 24, '#ff9f43'); fr(-34, -56, 68, 40, 12, '#f07b1f'); fr(-14, -120, 28, 14, 7, '#f07b1f'); fc(0, -36, 4, '#ffd23f');
  } },
});
Object.assign(WEAR, {
  gaucho: { n: 'Chapéu gaúcho', slot: 'hat', oy: -320, w: 220, h: 90, draw() {
    fe(0, -4, 108, 16, '#1d1f2e'); fr(-52, -70, 104, 68, 14, '#2f3241'); fr(-52, -26, 104, 10, 3, '#8a5532');
    X.beginPath(); X.moveTo(-60, 0); X.quadraticCurveTo(0, 120, 60, 0); stroke(3, '#8a5532');
  } },
  boina: { n: 'Boina', slot: 'hat', oy: -330, w: 170, h: 60, draw() { fe(6, -22, 84, 30, '#e2553e', -0.08); fc(0, -50, 6, '#c4302b'); } },
  chef: { n: 'Chapéu de chef', slot: 'hat', oy: -318, w: 160, h: 150, draw() { fr(-56, -40, 112, 40, 8, '#ffffff'); for (const [x, y, r] of [[-40, -70, 34], [0, -90, 40], [40, -70, 34]]) fc(x, y, r, '#ffffff'); fr(-56, -14, 112, 6, 3, '#e6ebf2'); } },
  unicornio: { n: 'Tiara de unicórnio', slot: 'hat', oy: -330, w: 160, h: 120, draw() {
    X.beginPath(); X.arc(0, 40, 84, Math.PI * 1.15, Math.PI * 1.85); stroke(8, '#ff9ec4');
    fpoly([-14, -36, 0, -110, 14, -36], LG(0, -110, 0, -36, '#fff3a8', '#ffcf3d'));
    for (const k of [-1, 1]) fpoly([k * 40, -34, k * 58, -66, k * 64, -28], '#ffffff');
  } },
  papainoel: { n: 'Gorro de Natal', slot: 'hat', oy: -318, w: 170, h: 140, draw() {
    X.beginPath(); X.moveTo(-72, -10); X.quadraticCurveTo(-10, -150, 90, -90); X.lineTo(72, -10); X.closePath(); X.fillStyle = '#e03131'; X.fill();
    fr(-80, -24, 160, 30, 15, '#ffffff'); fc(92, -88, 18, '#ffffff');
  } },
  dino: { n: 'Capuz de dinossauro', slot: 'hat', oy: -318, w: 180, h: 130, draw() {
    X.beginPath(); X.moveTo(-84, 30); X.bezierCurveTo(-96, -110, 96, -110, 84, 30); X.lineTo(64, 30); X.bezierCurveTo(70, -60, -70, -60, -64, 30); X.closePath(); X.fillStyle = '#62c24f'; X.fill();
    for (let i = 0; i < 5; i++) fpoly([-40 + i * 20, -72 + Math.abs(i - 2) * 6, -30 + i * 20, -98 + Math.abs(i - 2) * 8, -20 + i * 20, -72 + Math.abs(i - 2) * 6], '#ffd23f');
    for (const k of [-1, 1]) { fc(k * 34, -66, 10, '#ffffff'); fc(k * 34, -66, 5, '#2a1d1a'); }
  } },
  bigode: { n: 'Bigode', slot: 'face', w: 120, h: 40, draw() { X.save(); X.translate(0, 30); for (const k of [-1, 1]) fe(k * 18, 0, 20, 8, '#3a2622', k * -0.3); X.restore(); } },
  palhaco: { n: 'Nariz de palhaço', slot: 'face', w: 60, h: 40, draw() { fc(0, 16, 14, '#e8283f'); fc(-4, 11, 4, 'rgba(255,255,255,.6)'); } },
  tapaolho: { n: 'Tapa-olho', slot: 'face', w: 150, h: 50, draw() { fe(-30, 0, 18, 16, '#1d1f2e'); line(-60, -24, 70, -30, 3, '#1d1f2e'); } },
  anjo: { n: 'Asas de anjo', slot: 'back', w: 150, h: 100, draw() { for (const k of [-1, 1]) for (let i = 0; i < 3; i++) fe(k * (20 + i * 14), -60 + i * 16, 30 - i * 5, 14, '#ffffff', k * 0.5); } },
  dinocauda: { n: 'Cauda de dinossauro', slot: 'back', w: 140, h: 80, draw() { X.beginPath(); X.moveTo(-50, -10); X.quadraticCurveTo(10, -70, 60, -10); X.closePath(); X.fillStyle = '#62c24f'; X.fill(); for (let i = 0; i < 3; i++) fpoly([-20 + i * 24, -28, -12 + i * 24, -50, -4 + i * 24, -28], '#ffd23f'); } },
  lenco: { n: 'Lenço gaúcho', slot: 'neck', gy: -40, w: 90, h: 70, draw() { fe(0, 4, 30, 9, '#e03131'); fpoly([-10, 6, 10, 6, 14, 40, -14, 40], '#c4302b'); fc(0, 8, 8, '#e03131'); } },
  perolas: { n: 'Colar de pérolas', slot: 'neck', gy: -30, w: 90, h: 50, draw() { for (let i = 0; i < 9; i++) { const a = Math.PI * (0.15 + i * 0.0875); fc(Math.cos(a) * 34, 2 + Math.sin(a) * 22, 5, '#fbf6ff'); } } },
  gravata: { n: 'Gravata borboleta', slot: 'neck', gy: -30, w: 70, h: 40, draw() { fpoly([0, 10, -24, -2, -24, 22], '#e03131'); fpoly([0, 10, 24, -2, 24, 22], '#e03131'); fc(0, 10, 6, '#b02020'); } },
  bucket: { n: 'Chapéu bucket de vaquinha', slot: 'hat', oy: -318, w: 210, h: 110, draw() {
    const crown = () => { X.beginPath(); X.moveTo(-72, 0); X.bezierCurveTo(-76, -88, 76, -88, 72, 0); X.closePath(); };
    X.beginPath(); X.moveTo(-104, 10); X.quadraticCurveTo(0, -16, 104, 10); X.quadraticCurveTo(100, 30, 0, 26); X.quadraticCurveTo(-100, 30, -104, 10); X.closePath();
    X.fillStyle = '#fffaf2'; X.fill(); X.save(); X.clip(); cowSpots('#2f3241', -100, -4, 200, 30); X.restore();
    X.beginPath(); X.moveTo(-104, 10); X.quadraticCurveTo(0, -16, 104, 10); X.quadraticCurveTo(100, 30, 0, 26); X.quadraticCurveTo(-100, 30, -104, 10); X.closePath(); stroke(3.2, CHAR_INK);
    crown(); X.fillStyle = '#fffaf2'; X.fill(); X.save(); X.clip(); cowSpots('#2f3241', -70, -70, 140, 70); X.restore(); crown(); stroke(3.2, CHAR_INK);
    fr(-72, -14, 144, 12, 4, '#ff9fc0'); X.beginPath(); X.rect(-72, -14, 144, 12); stroke(2.4, CHAR_INK);
  } },
  presilhas: { n: 'Presilhas', slot: 'hat', oy: -318, w: 120, h: 50, draw() {
    for (const [x, y, r, c] of [[-46, 6, -0.5, '#ff7eb6'], [-30, -14, -0.35, '#ffd23f'], [44, 0, 0.45, '#7ed1f7']]) {
      X.save(); X.translate(x, y); X.rotate(r); fr(-15, -5, 30, 10, 5, c); RR(-15, -5, 30, 10, 5); stroke(2.4, CHAR_INK); fc(-6, 0, 2, 'rgba(255,255,255,.7)'); X.restore();
    }
  } },
  bolsa: { n: 'Bolsinha transversal', slot: 'back', w: 100, h: 90, draw() { line(-40, -80, 30, 0, 6, '#2f3241'); fr(4, -10, 50, 40, 12, '#ff7eb6'); fc(29, 8, 5, '#ffd23f'); } },
  cachecol: { n: 'Cachecol', slot: 'neck', gy: -60, w: 110, h: 100, draw() { fr(-40, -4, 80, 22, 11, '#4dabf7'); for (let i = 0; i < 3; i++) fr(-30 + i * 24, -4, 10, 22, 0, '#ffffff'); fr(14, 10, 22, 60, 8, '#4dabf7'); fr(14, 30, 22, 8, 0, '#ffffff'); } },
});
for (const k in WEAR) {
  const w = WEAR[k];
  ITEMS[k] = { n: w.n, w: w.w, h: w.h + 20, wear: w.slot, draw() { if (w.gy) X.translate(0, w.gy); else if (w.slot === 'face') X.translate(0, -24); w.draw(); } };
}

const BITES = [[0.42, -0.8], [-0.42, -0.72], [0.36, -0.32], [-0.36, -0.28]];
function drawItemShape(it, t) {
  const T = ITEMS[it.type];
  if (!T) return;
  if (T.food && it.bites > 0) {
    X.save();
    X.beginPath(); X.rect(-400, -400, 800, 800);
    const r = T.w * 0.24;
    for (let i = 0; i < it.bites && i < 4; i++) {
      const bx = BITES[i][0] * T.w, by = BITES[i][1] * T.h;
      X.moveTo(bx + r, by); X.arc(bx, by, r, 0, TAU);
    }
    X.clip('evenodd');
    T.draw(it, t);
    X.restore();
  } else T.draw(it, t);
}
function drawItem(it, t) {
  X.save();
  X.translate(it.x, it.y);
  if (it.rot && !ITEMS[it.type].roll) X.rotate(it.rot);
  const sq = it.sq || 0;
  if (sq > 0.01) X.scale(1 + sq * 0.2, 1 - sq * 0.2);
  if (it.pop != null && it.pop < 1) { const k = Math.max(0.01, easeOutBack(it.pop)); X.scale(k, k); }
  if (it.state === 'held') X.scale(1.08, 1.08);
  drawItemShape(it, t);
  X.restore();
}
