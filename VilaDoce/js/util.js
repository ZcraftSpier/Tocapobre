'use strict';
// ---------- Utilitários matemáticos ----------
const TAU = Math.PI * 2;
const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const rand = (a, b) => a + Math.random() * (b - a);
const pick = (a) => a[(Math.random() * a.length) | 0];
const srand = (i) => { const s = Math.sin(i * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const easeOutBack = (t) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };

// ---------- Contexto de desenho atual ----------
let X = null;

function hexRgb(h) {
  h = h.replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const n = parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
const _shadeCache = new Map();
// amt > 0 clareia, amt < 0 escurece
function shade(hex, amt) {
  const k = hex + amt;
  let v = _shadeCache.get(k);
  if (v) return v;
  const [r, g, b] = hexRgb(hex);
  const t = amt < 0 ? 0 : 255, p = Math.abs(amt);
  v = `rgb(${Math.round(lerp(r, t, p))},${Math.round(lerp(g, t, p))},${Math.round(lerp(b, t, p))})`;
  _shadeCache.set(k, v);
  return v;
}
function alpha(hex, a) { const [r, g, b] = hexRgb(hex); return `rgba(${r},${g},${b},${a})`; }

function RR(x, y, w, h, r) {
  r = Math.max(0, Math.min(r, w / 2, h / 2));
  X.beginPath();
  X.moveTo(x + r, y);
  X.arcTo(x + w, y, x + w, y + h, r);
  X.arcTo(x + w, y + h, x, y + h, r);
  X.arcTo(x, y + h, x, y, r);
  X.arcTo(x, y, x + w, y, r);
  X.closePath();
}
function fr(x, y, w, h, r, f) { RR(x, y, w, h, r); X.fillStyle = f; X.fill(); }
function fe(x, y, rx, ry, f, rot) { X.beginPath(); X.ellipse(x, y, Math.abs(rx), Math.abs(ry), rot || 0, 0, TAU); X.fillStyle = f; X.fill(); }
function fc(x, y, r, f) { fe(x, y, r, r, f); }
function poly(p) { X.beginPath(); X.moveTo(p[0], p[1]); for (let i = 2; i < p.length; i += 2) X.lineTo(p[i], p[i + 1]); X.closePath(); }
function fpoly(p, f) { poly(p); X.fillStyle = f; X.fill(); }
function LG(x1, y1, x2, y2, ...c) { const g = X.createLinearGradient(x1, y1, x2, y2); c.forEach((s, i) => g.addColorStop(i / (c.length - 1), s)); return g; }
function RG(x, y, r0, r1, ...c) { const g = X.createRadialGradient(x, y, r0, x, y, r1); c.forEach((s, i) => g.addColorStop(i / (c.length - 1), s)); return g; }
function stroke(w, col) { X.lineWidth = w; X.strokeStyle = col; X.lineCap = 'round'; X.lineJoin = 'round'; X.stroke(); }
function line(x1, y1, x2, y2, w, col) { X.beginPath(); X.moveTo(x1, y1); X.lineTo(x2, y2); stroke(w, col); }
function softShadow(x, y, rx, a = 0.22) {
  X.save(); X.translate(x, y); X.scale(1, 0.24);
  X.fillStyle = RG(0, 0, 0, rx, `rgba(50,35,70,${a})`, 'rgba(50,35,70,0)');
  X.beginPath(); X.arc(0, 0, rx, 0, TAU); X.fill(); X.restore();
}
function heartPath(x, y, s) {
  X.beginPath();
  X.moveTo(x, y + s * 0.35);
  X.bezierCurveTo(x - s * 1.1, y - s * 0.35, x - s * 0.45, y - s * 1.05, x, y - s * 0.45);
  X.bezierCurveTo(x + s * 0.45, y - s * 1.05, x + s * 1.1, y - s * 0.35, x, y + s * 0.35);
  X.closePath();
}
function starPath(x, y, r, pts = 5, inner = 0.45) {
  X.beginPath();
  for (let i = 0; i < pts * 2; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / pts, rr = i % 2 ? r * inner : r;
    i ? X.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr) : X.moveTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
  }
  X.closePath();
}

// Padrões em alta resolução, em cache por contexto
const _patC = {}, _patO = {};
function pat(key, w, h, fn) {
  const o = _patO[key];
  if (o && o.ctx === X) return o.p;
  let c = _patC[key];
  if (!c) {
    c = document.createElement('canvas');
    c.width = w * 2; c.height = h * 2;
    const g = c.getContext('2d'); g.scale(2, 2);
    const prev = X; X = g; fn(w, h); X = prev;
    _patC[key] = c;
  }
  const p = X.createPattern(c, 'repeat');
  try { p.setTransform(new DOMMatrix().scale(0.5, 0.5)); } catch (e) { /* navegadores antigos */ }
  _patO[key] = { ctx: X, p };
  return p;
}
