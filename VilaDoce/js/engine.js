'use strict';
// ======================================================
//  Motor: estado, física, entrada, câmera e renderização
// ======================================================
const H = 1000, GRAV = 2700, MAX_ITEMS = 60;
let DOCK_PX = 92;
function setBottomReserve(px) { DOCK_PX = px; resize(); }
const SAVE_KEY = 'vilaDoce.save.v1';
const G = { sceneId: 'casa', ents: [], st: {}, cam: {}, night: false, nightK: 0, t: 0, parts: [], nextId: 1, viewInv: null };
const byId = new Map();
let canvas, ctx, DPR = 1, SCALE = 1, VW = 1000, VH = 1000, CAMY = 0, CSSW = 0, CSSH = 0;
const pointers = new Map();
let lastTap = { id: null, t: 0 };

const S = () => SCENES[G.sceneId];
function getEnt(id) { return byId.get(id); }
function addEnt(e) { if (!e.id) e.id = G.nextId++; G.ents.push(e); byId.set(e.id, e); return e; }
function removeEnt(e) {
  if (e.kind === 'char' && e.hold) { const it = getEnt(e.hold); if (it) dropFromHand(e, it); }
  if (e.heldBy) { const c = getEnt(e.heldBy); if (c) c.hold = null; }
  G.ents = G.ents.filter((x) => x !== e); byId.delete(e.id);
}

// ---------- Fábricas de entidades ----------
function I(type, x, y, extra) { return Object.assign({ kind: 'item', type, x, y, state: 'idle', bites: 0, level: 1, sq: 0, rot: 0 }, extra); }
function C(name, scene, x, y, opt = {}) {
  const look = opt.look || randomLook();
  return Object.assign({ kind: 'char', name, scene, x, y, state: 'idle', phase: rand(0, 6), blinkT: rand(1, 4), sq: 0, hat: null, face: null, hold: null, seat: null, swing: 0 }, look, opt.seat != null ? { seat: opt.seat } : {});
}
function newWorld() {
  G.ents = []; byId.clear(); G.nextId = 1; G.st = {}; G.cam = {}; G.parts = []; G.friends = {};
  for (const id of SCENE_ORDER) {
    const sc = SCENES[id];
    G.st[id] = {};
    for (const p of sc.props) if (p.state) G.st[id][p.id] = JSON.parse(JSON.stringify(p.state));
    if (sc.rooms) G.st[id].rooms = sc.rooms.map((r) => ({ wall: r.wall, pat: r.pat, floor: r.floor, fc: r.fc }));
    for (const e of sc.init()) {
      e.scene = id; addEnt(e);
      if (e.kind === 'char' && e.seat != null) sitDown(e, e.seat, true);
      else settle(e);
    }
    G.cam[id] = 0;
  }
  G.sceneId = 'casa'; G.night = false; G.nightK = 0;
}
function settle(e) {
  const sc = SCENES[e.scene];
  for (const s of sc.surfaces) if (Math.abs(s.y - e.y) < 1 && e.x >= s.x1 && e.x <= s.x2) { e.z = s.z ?? null; e.cont = s.cont ?? null; return; }
  e.z = null; e.cont = null;
}
function canSpawn() {
  const n = G.ents.filter((e) => e.scene === G.sceneId && e.kind === 'item').length;
  if (n >= MAX_ITEMS) { UI.toast('Muitos itens aqui! Jogue alguns no lixo 🗑️'); return false; }
  return true;
}
function spawnItem(type, x, y, scene) {
  const it = addEnt(I(type, x, y, { scene, pop: 0 }));
  settle(it);
  emit('star', x, y - 40, 8);
  return it;
}

// ---------- Superfícies, assentos ----------
function activeSurfaces(sc) {
  const st = G.st[sc.id];
  const a = sc.surfaces.filter((s) => !s.when || s.when(st));
  for (const e of G.ents) {
    if (e.scene !== sc.id || e.kind !== 'item' || e.state !== 'idle' || e.heldBy) continue;
    const T = ITEMS[e.type];
    if (T.surf) for (const s of T.surf) a.push({ x1: e.x + s.x1, x2: e.x + s.x2, y: e.y + s.y, z: sortKey(e) + 0.5, ent: e.id });
  }
  return a;
}
function seatOccupied(sid, i) { return G.ents.some((e) => e.kind === 'char' && e.scene === sid && e.seat === i && e.state !== 'held'); }
function seatPos(sc, i) { const s = sc.seats[i]; return s.pos ? s.pos(G.st[sc.id]) : { x: s.x, y: s.y, ang: 0 }; }
// lugares de um móvel: T.seats (vários) ou T.seat (um só)
function seatsOf(T) { return T.seats || (T.seat ? [T.seat] : []); }
function furnSeatTaken(f, ix, except) { return G.ents.some((c) => c.kind === 'char' && c !== except && c.seatEnt === f.id && (c.seatIx || 0) === ix); }
// móveis que balançam (rede, cadeira de balanço) só se mexem com alguém sentado
function furnRock(f) { const T = ITEMS[f.type]; return T.rock && G.ents.some((c) => c.seatEnt === f.id) ? Math.sin(G.t * T.rock.speed + f.id) * T.rock.amp : 0; }
function furnSeatPos(f, ix = 0) {
  const S_ = seatsOf(ITEMS[f.type])[ix] || seatsOf(ITEMS[f.type])[0], r = furnRock(f);
  return { x: f.x + S_.dx + r * 60, y: f.y + S_.dy - Math.abs(r) * 10, ang: r * 0.6 };
}
// devolve { i } (assento fixo do cenário), { ent } (móvel) ou null
function findSeat(e, sc) {
  let best = null, bd = 1e9;
  const test = (kind, p, res) => {
    const d = kind === 'bed' ? Math.hypot((e.x - p.x) * 0.6, e.y - 100 - (p.y - 60)) : Math.hypot(e.x - p.x, e.y - 100 - p.y);
    const lim = kind === 'bed' ? 150 : 115;
    if (d < lim && d < bd) { bd = d; best = res; }
  };
  sc.seats.forEach((s, i) => { if (!seatOccupied(sc.id, i)) test(s.kind, seatPos(sc, i), { i }); });
  for (const f of G.ents) {
    if (f.scene !== sc.id || f.kind !== 'item' || f.state !== 'idle' || f.heldBy) continue;
    seatsOf(ITEMS[f.type]).forEach((S_, ix) => { if (!furnSeatTaken(f, ix, e)) test(S_.kind, furnSeatPos(f, ix), { ent: f.id, ix }); });
  }
  return best;
}
function sitDown(e, i, silent) {
  const sc = SCENES[e.scene];
  if (typeof i === 'object' && i.ent != null) {
    const f = getEnt(i.ent), ix = i.ix || 0, kind = seatsOf(ITEMS[f.type])[ix].kind;
    e.seatEnt = f.id; e.seatIx = ix; e.seat = null; e.state = kind === 'bed' ? 'sleep' : 'sit';
    const p = furnSeatPos(f, ix); e.x = p.x; e.y = p.y; e.ang = p.ang; e.z = null;
    if (!silent) { Sfx.drop(0.4); e.sq = 0.3; if (kind === 'bed') { UI.toast(`${e.name} foi tirar um cochilo 💤`); Album.unlock('a_soneca'); } }
    return;
  }
  if (typeof i === 'object') i = i.i;
  const s = sc.seats[i];
  e.seat = i; e.seatEnt = null;
  e.state = s.kind === 'bed' ? 'sleep' : s.kind === 'swing' ? 'swing' : 'sit';
  const p = seatPos(sc, i); e.x = p.x; e.y = p.y; e.ang = p.ang || 0;
  e.z = null;
  if (!silent) {
    Sfx.drop(0.4); e.sq = 0.3;
    if (s.kind === 'stylist') setTimeout(() => UI.openEditor(e), 350);
    if (s.kind === 'swing') { const st = G.st[sc.id].swings; st.v[s.i] += 0.8; }
    if (s.kind === 'bed') { UI.toast(G.night ? `${e.name} está dormindo 💤` : `${e.name} foi tirar um cochilo 💤`); Album.unlock('a_soneca'); }
    if (s.tag) Album.unlock('a_' + s.tag);
  }
}
function standUp(e) {
  if (e.state === 'sit' || e.state === 'swing' || e.state === 'slide') e.y += 100;
  else if (e.state === 'sleep') { e.y += 40; }
  e.seat = null; e.seatEnt = null; e.ang = 0;
}

// ---------- Física ----------
function startFall(e, vx = 0, vy = 0) {
  const sc = SCENES[e.scene];
  e.state = 'fall'; e.vx = clamp(vx, -1700, 1700); e.vy = clamp(vy, -1700, 1700);
  e.floorY = clamp(e.y, sc.floorTop + 12, sc.floorBot);
  e.z = null; e.cont = null;
}
function hop(e, v) { if (e.state !== 'idle' || e.heldBy) return; const fy = e.y, sc = SCENES[e.scene]; startFall(e, rand(-160, 160), -v); if (fy >= sc.floorTop) e.floorY = fy; }
function land(e, y, s, impact) {
  e.y = y;
  const T = e.kind === 'item' ? ITEMS[e.type] : null;
  if (T && T.bounce && impact > 380) { e.vy = -impact * T.bounce; e.vx *= 0.85; if (impact > 700) Sfx.boing(); return; }
  e.state = 'idle'; e.vy = 0;
  if (!(T && T.roll)) e.vx = 0;
  if (T && T.grav) e.rot = 0;
  e.z = s ? s.z ?? null : null; e.cont = s ? s.cont ?? null : null;
  e.onSurf = s ? { x1: s.x1, x2: s.x2 } : null;
  e.onEnt = s ? s.ent ?? null : null;
  e.sq = clamp(impact / 1500, 0, 0.9);
  if (impact > 220) Sfx.drop(clamp(impact / 1500, 0.25, 1), e);
  if (e.kind === 'char' && impact > 1000) e.reactT = 0.9;
}
function stepFall(e, dt, sc) {
  const prev = e.y;
  const T = e.kind === 'item' ? ITEMS[e.type] : null;
  const gk = (T && T.grav ? T.grav : 1) * (sc.underwater ? 0.16 : 1);
  e.vy += GRAV * gk * dt;
  if (sc.underwater) { e.vy = Math.min(e.vy, 230); e.vx *= Math.pow(0.4, dt); }
  e.x += e.vx * dt; e.y += e.vy * dt;
  if (T && T.grav) { e.vy = Math.min(e.vy, 260); e.rot = clamp(Math.atan2(e.vy, Math.abs(e.vx) + 60), -0.7, 0.7) * Math.sign(e.vx || 1); }
  if (e.x < 30) { e.x = 30; e.vx = Math.abs(e.vx) * 0.5; }
  if (e.x > sc.W - 30) { e.x = sc.W - 30; e.vx = -Math.abs(e.vx) * 0.5; }
  if (e.vy > 0) {
    for (const s of activeSurfaces(sc)) {
      if (e.x >= s.x1 && e.x <= s.x2 && prev <= s.y + 0.5 && e.y >= s.y && s.y < e.floorY) { land(e, s.y, s, e.vy); return; }
    }
    if (e.y >= e.floorY) land(e, e.floorY, null, e.vy);
  }
}

// ---------- Interações ----------
function dropFromHand(c, it) {
  it.heldBy = null; c.hold = null;
  it.x = c.x + 60; it.y = Math.min(c.y - 120, SCENES[c.scene].floorBot - 10); it.scene = c.scene;
  startFall(it, 120, -200);
}
function giveItem(c, it) {
  const T = ITEMS[it.type];
  if (T.wear) {
    const slot = T.wear, old = c[slot];
    c[slot] = it.type; removeEnt(it);
    if (old) { const h = headPos(c); const o = addEnt(I(old, h.x + 80, h.y, { scene: c.scene })); startFall(o, 200, -500); }
    emit('star', headPos(c).x, headPos(c).y - 60, 10); Sfx.sparkle(); c.reactT = 1;
    return true;
  }
  if (c.state === 'sleep') return false;
  if (c.hold && c.hold !== it.id) { const old = getEnt(c.hold); if (old) dropFromHand(c, old); }
  c.hold = it.id; it.heldBy = c.id; it.state = 'inhand'; it.z = null; it.cont = null; it.scene = c.scene;
  if ((T.food || T.drink) && !T.petfood) takeBite(c); else { Sfx.pick(); c.reactT = 0.6; }
  return true;
}
function petAt(w, excl) {
  const list = drawList();
  for (let i = list.length - 1; i >= 0; i--) {
    const e = list[i].e;
    if (!e || e === excl || e.type !== 'pet' || e.state === 'held') continue;
    if (Math.abs(w.x - e.x) < 90 && w.y > e.y - 150 && w.y < e.y + 20) return e;
  }
  return null;
}
function takeBite(c) {
  const it = getEnt(c.hold); if (!it) return;
  const T = ITEMS[it.type], h = headPos(c);
  if (T.petfood) { c.reactT = 0.6; Sfx.click(); UI.toast('Ração é para os pets! 🐶'); return; }
  if (T.drink) {
    if (it.level <= 0.01) { c.reactT = 0.5; Sfx.click(); return; }
    it.level = Math.max(0, it.level - 0.34); c.eatT = 0.8; Sfx.gulp();
    c.hunger = Math.max(0, (c.hunger || 0) - 0.15); if (T.onEat) T.onEat(c, it);
    if (it.level <= 0.01) { emit('heart', h.x, h.y - 40, 4); Sfx.yum(); }
  } else if (T.food) {
    it.bites++; c.eatT = 0.9; Sfx.munch();
    c.hunger = Math.max(0, (c.hunger || 0) - 0.3); if (T.onEat) T.onEat(c, it);
    emit('crumb', h.x + 10, h.y + 50, 6, it.type);
    if (it.bites >= T.food) { removeEnt(it); c.hold = null; emit('heart', h.x, h.y - 40, 5); setTimeout(() => Sfx.yum(), 500); }
  } else { c.reactT = 0.8; Sfx.giggle(); }
}
function headPos(c) {
  if (c.state === 'sleep') return { x: c.x - 132, y: c.y - 48 };
  if (c.state === 'sit' || c.state === 'swing' || c.state === 'slide') return { x: c.x, y: c.y - 188 };
  return { x: c.x, y: c.y - 282 };
}
function travel(e, to) {
  const from = e.scene, sc = SCENES[to];
  if (e.kind === 'char') { e.seat = null; e.seatEnt = null; e.goal = null; e.moving = false; }
  e.onEnt = null; e.onSurf = null;
  const place = (x) => {
    x.scene = to;
    x.x = rand(250, Math.min(sc.W - 250, 1100)); x.y = rand(sc.floorTop + 30, sc.floorBot - 10);
    x.state = 'idle'; x.z = null; x.cont = null; x.pop = 0; x.vx = 0; x.vy = 0;
    if (x.kind === 'item' && ITEMS[x.type].float) { x.state = 'float'; x.y = 700; }
  };
  place(e);
  if (e.kind === 'char' && e.hold) { const it = getEnt(e.hold); if (it) it.scene = to; }
  Sfx.whoosh();
  UI.toast(e.name ? `${e.name} foi para: ${sc.name}` : `${ITEMS[e.type].n} enviado para: ${sc.name}`);
  UI.refreshDock();
  void from;
}

// ---------- Partículas ----------
function emit(type, x, y, n = 1, k) {
  for (let i = 0; i < n; i++) {
    const p = { type, x, y, vx: 0, vy: 0, life: 1, max: 1, s: 1, rot: rand(0, TAU), scene: G.sceneId, k };
    switch (type) {
      case 'heart': p.vx = rand(-60, 60); p.vy = rand(-160, -90); p.max = p.life = rand(1.1, 1.6); p.s = rand(12, 20); break;
      case 'star': p.vx = rand(-260, 260); p.vy = rand(-320, 80); p.max = p.life = rand(0.5, 0.9); p.s = rand(8, 16); break;
      case 'confetti': p.vx = rand(-400, 400); p.vy = rand(-500, -100); p.max = p.life = rand(0.8, 1.4); p.s = rand(6, 10); p.c = pick(['#ff6b6b', '#ffd23f', '#4dabf7', '#7ed957', '#ff7eb6']); break;
      case 'crumb': p.vx = rand(-120, 120); p.vy = rand(-200, 0); p.max = p.life = rand(0.5, 0.9); p.s = rand(3, 6); p.c = k === 'watermelon' ? '#ff5468' : k === 'apple' ? '#fff1d6' : '#e8b06a'; break;
      case 'note': p.vx = rand(-40, 40); p.vy = rand(-90, -60); p.max = p.life = 2; p.s = rand(14, 20); p.c = pick(['#ff6b6b', '#5c7cfa', '#a77bf3', '#2ec4b6']); break;
      case 'z': p.vx = 30; p.vy = -40; p.max = p.life = 2.2; p.s = 22; break;
      case 'drop': p.vx = k ? rand(-280, 280) : rand(-10, 10); p.vy = k ? rand(-420, -120) : 60; p.max = p.life = k ? 0.9 : 0.6; p.s = rand(3, 6); break;
      case 'smoke': p.vx = rand(-12, 12); p.vy = rand(-50, -30); p.max = p.life = rand(1.4, 2); p.s = rand(8, 14); break;
      case 'poof': p.vx = rand(-140, 140); p.vy = rand(-160, -20); p.max = p.life = 0.6; p.s = rand(14, 26); break;
      case 'firefly': p.vx = rand(-20, 20); p.vy = rand(-20, 20); p.max = p.life = rand(3, 5); p.s = 4; break;
      case 'bubble': p.vx = rand(-10, 10); p.vy = rand(-90, -50); p.max = p.life = rand(2.5, 4.5); p.s = rand(4, 10); break;
    }
    G.parts.push(p);
  }
  if (G.parts.length > 600) G.parts.splice(0, G.parts.length - 600);
}
function updParts(dt) {
  for (const p of G.parts) {
    p.life -= dt;
    p.x += p.vx * dt; p.y += p.vy * dt;
    if (p.type === 'star' || p.type === 'crumb' || p.type === 'confetti' || p.type === 'drop') p.vy += (p.type === 'star' ? 600 : 1500) * dt;
    if (p.type === 'note' || p.type === 'z') p.x += Math.sin(p.life * 4) * 30 * dt;
    if (p.type === 'smoke') p.s += dt * 14;
    if (p.type === 'firefly') { p.vx += rand(-60, 60) * dt; p.vy += rand(-60, 60) * dt; }
    p.rot += dt * 4;
  }
  G.parts = G.parts.filter((p) => p.life > 0);
}
function drawParts() {
  for (const p of G.parts) {
    if (p.scene !== G.sceneId) continue;
    const a = clamp(p.life / p.max, 0, 1);
    X.globalAlpha = p.type === 'smoke' ? a * 0.45 : Math.min(1, a * 2);
    switch (p.type) {
      case 'heart': heartPath(p.x, p.y, p.s); X.fillStyle = '#ff5d8f'; X.fill(); fc(p.x - p.s * 0.35, p.y - p.s * 0.4, p.s * 0.15, 'rgba(255,255,255,.7)'); break;
      case 'star': X.save(); X.translate(p.x, p.y); X.rotate(p.rot); starPath(0, 0, p.s, 4, 0.35); X.fillStyle = '#ffe066'; X.fill(); X.restore(); break;
      case 'confetti': X.save(); X.translate(p.x, p.y); X.rotate(p.rot); fr(-p.s / 2, -p.s / 4, p.s, p.s / 2, 1, p.c); X.restore(); break;
      case 'crumb': fc(p.x, p.y, p.s, p.c); break;
      case 'note': fe(p.x, p.y, p.s * 0.5, p.s * 0.38, p.c, -0.4); line(p.x + p.s * 0.45, p.y, p.x + p.s * 0.45, p.y - p.s * 1.4, 3, p.c); line(p.x + p.s * 0.45, p.y - p.s * 1.4, p.x + p.s, p.y - p.s, 3, p.c); break;
      case 'z': X.font = `600 ${p.s * (1.3 - a * 0.4)}px Fredoka, sans-serif`; X.textAlign = 'center'; X.fillStyle = '#5c7cfa'; X.fillText('z', p.x, p.y); break;
      case 'drop': fe(p.x, p.y, p.s * 0.7, p.s, 'rgba(110,190,255,.9)'); break;
      case 'smoke': fc(p.x, p.y, p.s, '#ffffff'); break;
      case 'poof': fc(p.x, p.y, p.s * (1.6 - a), 'rgba(230,230,240,.9)'); break;
      case 'bubble': X.beginPath(); X.arc(p.x + Math.sin(p.life * 3) * 6, p.y, p.s, 0, TAU); stroke(2, 'rgba(255,255,255,.75)'); fc(p.x + Math.sin(p.life * 3) * 6 - p.s * 0.3, p.y - p.s * 0.3, p.s * 0.25, 'rgba(255,255,255,.8)'); break;
      case 'firefly': X.fillStyle = RG(p.x, p.y, 0, 16, 'rgba(255,250,150,.9)', 'rgba(255,250,150,0)'); X.fillRect(p.x - 16, p.y - 16, 32, 32); break;
    }
  }
  X.globalAlpha = 1;
}

// ---------- Câmera ----------
// ---------- Qualidade adaptativa (resolução do canvas) ----------
// Celulares têm devicePixelRatio 2.5–3: desenhar tudo nessa resolução custa
// caro. Começamos num teto menor em telas de toque e ajustamos conforme o FPS.
const TOUCH = matchMedia('(pointer: coarse)').matches;
const Q = { max: Math.min(devicePixelRatio || 1, TOUCH ? 1.5 : 2), min: 1, k: 0, acc: 0, n: 0, cool: 0 };
Q.k = Q.max;
function qualityTick(ms) {
  // média de tempo de quadro a cada ~1,5 s; muda a resolução com histerese
  if (Q.cool > 0) { Q.cool -= ms; return; }
  Q.acc += ms; Q.n++;
  if (Q.acc < 1500) return;
  const avg = Q.acc / Q.n; Q.acc = 0; Q.n = 0;
  let k = Q.k;
  if (avg > 24 && k > Q.min) k = Math.max(Q.min, k - 0.25);
  else if (avg < 14 && k < Q.max) k = Math.min(Q.max, k + 0.25);
  if (k !== Q.k) { Q.k = k; resize(); Q.cool = 1500; }
}
function resize() {
  CSSW = innerWidth; CSSH = innerHeight; DPR = Math.min(devicePixelRatio || 1, Q.k);
  canvas.width = Math.round(CSSW * DPR); canvas.height = Math.round(CSSH * DPR);
  canvas.style.width = CSSW + 'px'; canvas.style.height = CSSH + 'px';
  const avail = CSSH - DOCK_PX;
  SCALE = Math.min(avail / H, Math.max(CSSW / 1150, (avail / H) * 0.74));
  VW = CSSW / SCALE; VH = CSSH / SCALE; CAMY = H + DOCK_PX / SCALE - VH;
  for (const id of SCENE_ORDER) clampCam(id);
}
function clampCam(id) {
  const W = SCENES[id].W;
  if (VW >= W) G.cam[id] = (W - VW) / 2;
  else G.cam[id] = clamp(G.cam[id] || 0, 0, W - VW);
}
function toWorld(cx, cy) { return { x: cx / SCALE + G.cam[G.sceneId], y: cy / SCALE + CAMY }; }

// ---------- Teste de clique ----------
function visible(e) {
  if (e.scene !== G.sceneId || e.heldBy || e.state === 'booth') return false;
  if (e.cont) { const s = G.st[e.scene][e.cont]; if (s && !s.open) return false; }
  return true;
}
function charBox(c) {
  const s = c.state;
  if (s === 'sleep') return [c.x - 220, c.y - 110, c.x + 170, c.y + 10];
  if (s === 'sit' || s === 'swing' || s === 'slide') return [c.x - 66, c.y - 285, c.x + 66, c.y + 75];
  return [c.x - 66, c.y - 372, c.x + 66, c.y + 6];
}
function sortKey(e) {
  if (e.state === 'held') return 1e6;
  if (e.kind === 'item') { const T = ITEMS[e.type]; if (T.wall) return e.y - 5000; if (T.flat) return e.y - 3000; }
  if (e.seatEnt) { const f = getEnt(e.seatEnt); if (f) return sortKey(f) + 0.6; }
  return e.z ?? e.y;
}
function drawList() {
  const sc = S();
  const list = G.ents.filter(visible).map((e) => ({ k: sortKey(e), e }));
  for (const p of sc.props) if (p.z != null) list.push({ k: p.z, p });
  list.sort((a, b) => a.k - b.k);
  return list;
}
function hitEnt(w) {
  const list = drawList();
  const pad = 14;
  for (let i = list.length - 1; i >= 0; i--) {
    const e = list[i].e; if (!e) continue;
    if (e.kind === 'char') {
      if (e.hold) {
        const it = getEnt(e.hold);
        if (it) { const T = ITEMS[it.type]; if (Math.abs(w.x - it.x) < T.w * 0.4 + pad && w.y < it.y + pad && w.y > it.y - T.h * 0.72 - pad) return { ent: it }; }
      }
      const [x1, y1, x2, y2] = charBox(e);
      if (w.x >= x1 && w.x <= x2 && w.y >= y1 && w.y <= y2) {
        const h = headPos(e);
        if (e.state !== 'sleep') {
          if (e.hat && w.y < h.y - 62 && Math.abs(w.x - h.x) < 85) return { ent: e, part: 'hat' };
          if (e.face && Math.abs(w.y - (h.y + 6)) < 20 && Math.abs(Math.abs(w.x - h.x) - 30) < 20) return { ent: e, part: 'face' };
        }
        return { ent: e };
      }
    } else {
      const T = ITEMS[e.type];
      if (Math.abs(w.x - e.x) < T.w / 2 + pad && w.y <= e.y + pad && w.y >= e.y - T.h - pad) return { ent: e };
    }
  }
  return null;
}
function hitProp(w) {
  const props = S().props;
  for (let i = props.length - 1; i >= 0; i--) {
    const p = props[i];
    if (p.tap && w.x >= p.x && w.x <= p.x + p.w && w.y >= p.y && w.y <= p.y + p.h) return p;
  }
  return null;
}
function charAt(w, excl) {
  const list = drawList();
  for (let i = list.length - 1; i >= 0; i--) {
    const e = list[i].e;
    if (!e || e === excl || e.kind !== 'char' || e.state === 'held') continue;
    const [x1, y1, x2, y2] = charBox(e);
    if (w.x >= x1 - 20 && w.x <= x2 + 20 && w.y >= y1 - 20 && w.y <= y2 + 20) return e;
  }
  return null;
}

// ---------- Entrada (mouse + toque, multitoque) ----------
function onDown(ev) {
  Sfx.unlock();
  if (UI.blocking()) return;
  canvas.setPointerCapture(ev.pointerId);
  const w = toWorld(ev.clientX, ev.clientY);
  // páginas do diário (horror) ficam por cima de tudo, então têm prioridade no toque
  const page = Horror.pageProp(w);
  const P = { id: ev.pointerId, sx: ev.clientX, sy: ev.clientY, cx: ev.clientX, cy: ev.clientY, moved: false, cand: page ? null : hitEnt(w), ent: null, prop: page, cam0: G.cam[G.sceneId], hist: [] };
  if (!P.cand && !P.prop) P.prop = hitProp(w);
  pointers.set(ev.pointerId, P);
}
function grab(P, h) {
  let e = h.ent;
  const w = toWorld(P.cx, P.cy);
  if (h.part === 'hat' || h.part === 'face') {
    const slot = h.part, type = e[slot]; e[slot] = null;
    const hp = headPos(e);
    e = addEnt(I(type, w.x, w.y + 30, { scene: e.scene }));
  } else if (e.heldBy) {
    const c = getEnt(e.heldBy); if (c) c.hold = null; e.heldBy = null; e.scene = G.sceneId;
  } else if (e.kind === 'char' && (e.seat != null || e.seatEnt || e.state === 'slide')) standUp(e);
  if (e.state === 'slide') e.state = 'idle';
  e.state = 'held'; e.z = null; e.cont = null; e.swing = 0; e.pop = null; e.onSurf = null; e.onEnt = null;
  e.goal = null; e.moving = false; e.dancing = false; e.autoSat = 0; e.autoSleep = false;
  if (e.kind === 'item' && ITEMS[e.type].onGrab) ITEMS[e.type].onGrab(e);
  P.ent = e; P.off = { x: e.x - w.x, y: e.y - w.y };
  P.hist = [{ x: e.x, y: e.y, t: performance.now() }];
  Sfx.pick(e);
  UI.dragStart(e);
}
function moveHeld(P) {
  const e = P.ent, sc = S(), w = toWorld(P.cx, P.cy);
  e.x = clamp(w.x + P.off.x, 20, sc.W - 20);
  e.y = Math.min(w.y + P.off.y, sc.floorBot + 30);
  const now = performance.now();
  P.hist.push({ x: e.x, y: e.y, t: now });
  while (P.hist.length > 2 && now - P.hist[0].t > 110) P.hist.shift();
}
function onMove(ev) {
  const P = pointers.get(ev.pointerId); if (!P) return;
  P.cx = ev.clientX; P.cy = ev.clientY;
  if (!P.moved && Math.hypot(P.cx - P.sx, P.cy - P.sy) > 8) {
    P.moved = true;
    if (P.cand) grab(P, P.cand);
  }
  if (P.ent) { moveHeld(P); UI.dragHover(ev.clientX, ev.clientY); }
  else if (P.moved) {
    const panners = [...pointers.values()].filter((q) => !q.ent);
    if (panners.length === 1) { G.cam[G.sceneId] = P.cam0 - (P.cx - P.sx) / SCALE; clampCam(G.sceneId); }
  }
}
function onUp(ev) {
  const P = pointers.get(ev.pointerId); if (!P) return;
  pointers.delete(ev.pointerId);
  const w = toWorld(ev.clientX, ev.clientY);
  if (P.ent) { P.cx = ev.clientX; P.cy = ev.clientY; moveHeld(P); release(P, w); return; }
  if (P.moved) return;
  if (P.cand) tapEnt(P.cand.ent, w);
  else if (P.prop) { const st = G.st[G.sceneId]; P.prop.tap(st[P.prop.id], w, st); }
}
function tapEnt(e, w) {
  if (e.kind === 'char') {
    if (e.ghost) { Horror.tapGhost(e); return; }
    if (e.stare > 0 && !e.ghost) e.stare = 0; // tocou: volta ao normal, como se nada tivesse acontecido
    const now = performance.now();
    if (lastTap.id === e.id && now - lastTap.t < 380) { lastTap.id = null; UI.openEditor(e); return; }
    lastTap = { id: e.id, t: now };
    if (e.hold && (ITEMS[getEnt(e.hold)?.type]?.food || ITEMS[getEnt(e.hold)?.type]?.drink)) takeBite(e);
    else if (e.state === 'sleep') { e.sq = 0.4; Sfx.squeak(); emit('z', e.x - 120, e.y - 120, 1); }
    else { e.reactT = 1.2; e.sq = 0.35; if (!Chat.tapLine(e)) Sfx.giggle(); }
    UI.showBubble(e);
  } else {
    const T = ITEMS[e.type];
    if (UI.decorOn() && T.cols) { e.v = ((e.v || 0) + 1) % 1000; e.sq = 0.4; Sfx.click(); emit('star', e.x, e.y - T.h * 0.6, 5); }
    else if (T.tap) T.tap(e); else { e.sq = 0.5; Sfx.click(); }
  }
}
function release(P, w) {
  const e = P.ent, sc = S(), st = G.st[sc.id];
  UI.dragEnd();
  if (e.kind === 'char') { e.aiPause = 10; setTimeout(() => Chat.onDrop(e), 450); }
  let vx = 0, vy = 0;
  if (P.hist.length > 1) {
    const a = P.hist[0], b = P.hist[P.hist.length - 1], dt = (b.t - a.t) / 1000;
    if (dt > 0.01 && performance.now() - b.t < 80) { vx = (b.x - a.x) / dt * 0.6; vy = (b.y - a.y) / dt * 0.6; }
  }
  const el = document.elementFromPoint(P.cx, P.cy);
  const T = e.kind === 'item' ? ITEMS[e.type] : null;
  if (el && el.closest && el.closest('#decoPanel')) {
    if (T && !T.pet) { emit('poof', e.x, e.y - 40, 10); Sfx.poof(); removeEnt(e); UI.toast('Guardado ✓'); return; }
    e.y = sc.floorBot - 10;
  }
  const loc = el && el.closest ? el.closest('[data-loc]') : null;
  if (loc && loc.dataset.loc !== G.sceneId) { travel(e, loc.dataset.loc); return; }
  if (loc) { e.y = sc.floorBot - 10; }
  if (T && T.wall) { e.state = 'idle'; e.y = clamp(e.y, 110, sc.floorTop - 20); e.z = null; e.sq = 0.3; Sfx.drop(0.35); return; }
  for (const p of sc.props) {
    if (!p.drop) continue;
    const r = p.dropRect || p;
    if (w.x >= r.x && w.x <= r.x + r.w && w.y >= r.y && w.y <= r.y + r.h && p.drop(e, st[p.id], w, st)) return;
  }
  if (T && !T.pet && (T.wear === 'hat' || T.food)) {
    const pet = petAt(w, e);
    if (pet) {
      if (T.wear) { const old = pet.hat; pet.hat = e.type; removeEnt(e); if (old) { const o = addEnt(I(old, pet.x, pet.y - 120, { scene: pet.scene })); startFall(o, 200, -400); } emit('star', pet.x, pet.y - 100, 8); Sfx.sparkle(); petSound(pet.species); return; }
      if (!petFeed(pet, e)) startFall(e, 0, 0);
      return;
    }
  }
  if (T && (!T.decor || T.cat === 'objetos')) { const c = charAt(w, e); if (c && giveItem(c, e)) return; }
  if (e.kind === 'char') { const si = findSeat(e, sc); if (si) { sitDown(e, si); return; } }
  if (e.kind === 'item' && ITEMS[e.type].float) { e.state = 'float'; e.vy = -60; return; }
  if (Math.hypot(vx, vy) < 250) {
    for (const s of activeSurfaces(sc)) {
      if (e.x >= s.x1 && e.x <= s.x2 && e.y >= s.y - 8 && e.y <= s.y + 30) { land(e, s.y, s, 300); return; }
    }
  }
  startFall(e, vx, vy);
}

// ---------- Atualização ----------
function updEnt(e, dt, sc) {
  e.sq = Math.max(0, (e.sq || 0) - dt * 3.5);
  if (e.pop != null) { e.pop += dt * 2.5; if (e.pop >= 1) e.pop = null; }
  if (e.kind === 'char') {
    e.blinkT -= dt; if (e.blinkT < 0) e.blinkT = rand(2, 5);
    e.reactT = Math.max(0, (e.reactT || 0) - dt); e.eatT = Math.max(0, (e.eatT || 0) - dt);
    // olhar
    let tx = Math.sin(G.t * 0.5 + e.phase) * 3, ty = 0;
    const lp = G.lookPt;
    const mate = e.talkWith ? getEnt(e.talkWith) : null;
    if (e.stare > 0) { tx = 0; ty = 0; }
    else if (mate) { const h = headPos(e), m2 = mate.kind === 'char' ? headPos(mate) : { x: mate.x, y: mate.y - 60 }; tx = Math.sign(m2.x - h.x) * 5; ty = clamp((m2.y - h.y) / 60, -3, 3); }
    else if (lp && e.scene === G.sceneId) { const h = headPos(e); const dx = lp.x - h.x, dy = lp.y - h.y, d = Math.hypot(dx, dy); if (d < 700 && d > 1) { tx = (dx / d) * 5; ty = (dy / d) * 4; } }
    e.lx = lerp(e.lx || 0, tx, Math.min(1, dt * 8)); e.ly = lerp(e.ly || 0, ty, Math.min(1, dt * 8));
    if (e.state === 'held') {
      const P = [...pointers.values()].find((p) => p.ent === e);
      let v = 0;
      if (P && P.hist.length > 1) { const a = P.hist[0], b = P.hist[P.hist.length - 1]; v = (b.x - a.x) / Math.max(0.016, (b.t - a.t) / 1000); }
      e.swing = lerp(e.swing || 0, clamp(-v / 2600, -0.55, 0.55), Math.min(1, dt * 9));
    }
    if (e.seatEnt && (e.state === 'sit' || e.state === 'sleep')) {
      const f = getEnt(e.seatEnt);
      if (!f || f.state !== 'idle' || f.scene !== e.scene || f.heldBy) { standUp(e); e.x += 0; startFall(e, 0, 0); }
      else { const p = furnSeatPos(f, e.seatIx || 0); e.x = p.x; e.y = p.y; e.ang = e.state === 'sit' ? p.ang : 0; }
    }
    if (e.seat != null && (e.state === 'sit' || e.state === 'swing' || e.state === 'sleep')) {
      const p = seatPos(SCENES[e.scene], e.seat); e.x = p.x; e.y = p.y; e.ang = p.ang || 0;
      if (e.state === 'sleep' && Math.random() < dt * 0.7 && e.scene === G.sceneId) emit('z', e.x - 120, e.y - 110, 1);
    }
  } else {
    const T = ITEMS[e.type];
    if (e.onEnt && e.state === 'idle') {
      const f = getEnt(e.onEnt);
      if (!f || f.state !== 'idle' || f.scene !== e.scene || f.heldBy) { e.onEnt = null; startFall(e, 0, 0); }
    }
    if (T.update && e.scene === G.sceneId && visible(e)) T.update(e, dt);
    if (e.state === 'float') {
      e.vy = lerp(e.vy || 0, -130, dt * 2); e.y += e.vy * dt; e.x += Math.sin(G.t * 1.3 + e.id) * 12 * dt;
      if (sc.outdoor) { if (e.y < -900) removeEnt(e); }
      else if (e.y < sc.ceil) { e.y = sc.ceil; e.vy = 0; }
    }
    if (T.roll && e.state === 'idle' && Math.abs(e.vx || 0) > 4) {
      e.x += e.vx * dt; e.rot = (e.rot || 0) + (e.vx * dt) / 36; e.vx *= Math.pow(0.25, dt);
      if (e.x < 30 || e.x > sc.W - 30) { e.vx = -e.vx; e.x = clamp(e.x, 30, sc.W - 30); }
      if (e.onSurf && (e.x < e.onSurf.x1 || e.x > e.onSurf.x2)) { e.onSurf = null; startFall(e, e.vx, 0); }
    }
  }
  if (e.state === 'fall') stepFall(e, dt, sc);
  if (e.state === 'slide') {
    e.su += dt * (0.45 + e.su * 1.7);
    const p = slideP(Math.min(1, e.su));
    e.x = p.x; e.y = p.y; e.ang = e.kind === 'char' ? p.ang * 0.35 : 0; if (e.kind === 'item') e.rot = p.ang * 0.5;
    if (e.su >= 1) {
      if (e.kind === 'char') { e.y += 100; e.reactT = 1.4; Sfx.giggle(); Album.unlock('a_escorrega'); }
      e.ang = 0; e.rot = 0;
      startFall(e, 760, -260); e.floorY = rand(860, 930);
    }
  }
}
let saveT = 0, lastT = 0;
function update(dt) {
  G.t += dt;
  G.nightK = lerp(G.nightK, G.night ? 1 : 0, Math.min(1, dt * 2.5));
  const lp = [...pointers.values()].find((p) => p.ent) || [...pointers.values()][0];
  G.lookPt = lp ? toWorld(lp.cx, lp.cy) : null;
  // auto-scroll ao arrastar perto da borda
  for (const P of pointers.values()) {
    if (!P.ent) continue;
    const edge = 70;
    let d = 0;
    if (P.cx < edge) d = -(edge - P.cx); else if (P.cx > CSSW - edge) d = P.cx - (CSSW - edge);
    if (d) { G.cam[G.sceneId] += d * 14 * dt / SCALE; clampCam(G.sceneId); moveHeld(P); }
  }
  for (const id of SCENE_ORDER) {
    const sc = SCENES[id], st = G.st[id];
    if (id === G.sceneId) { for (const p of sc.props) if (p.update) p.update(st[p.id], dt, st, G.t); if (sc.update) sc.update(dt); }
  }
  for (const e of [...G.ents]) if (byId.has(e.id)) updEnt(e, dt, SCENES[e.scene]);
  updParts(dt);
  Chat.update(dt);
  Life.update(dt);
  Weather.update(dt);
  Horror.update(dt);
  const sid = G.sceneId;
  Sfx.music(sid === 'casa' && G.st.casa.radio.on ? 'pop' : sid === 'estancia' && G.st.estancia.radio.on ? 'gaucho' : sid === 'estudio' && G.st.estudio.secNeon && G.st.estudio.secNeon.disco > 0 ? 'pop' : null);
  saveT += dt; if (saveT > 4) { saveT = 0; save(); }
}

// ---------- Renderização ----------
function render() {
  const sc = S(), st = G.st[sc.id], t = G.t;
  X = ctx;
  const camX = G.cam[sc.id];
  const m = new DOMMatrix([DPR * SCALE, 0, 0, DPR * SCALE, -camX * DPR * SCALE, -CAMY * DPR * SCALE]);
  X.setTransform(m);
  G.viewInv = m.inverse();
  drawBg(sc, st, t, camX, m);
  Weather.drawBack(sc);
  // ignora o que está fora da tela (com folga para desenhos que extrapolam a caixa)
  const vx1 = camX - 320, vx2 = camX + VW + 320;
  const off = (p) => p.w > 0 && (p.x + p.w < vx1 || p.x > vx2);
  for (const p of sc.props) if (p.z == null && p.draw && !off(p)) p.draw(st[p.id], t, st);
  const list = drawList();
  for (const it of list) {
    if (it.p) { if (!off(it.p)) it.p.draw(st[it.p.id], t, st); continue; }
    const e = it.e;
    if (e.x < vx1 || e.x > vx2) continue;
    if (e.kind === 'char') {
      if (e.state === 'idle') softShadow(e.x, e.y + 2, 80, 0.26);
      else if (e.state === 'held' || e.state === 'fall') softShadow(e.x, clamp(e.state === 'fall' ? e.floorY : e.y + 40, sc.floorTop + 12, sc.floorBot), 60, 0.14);
      drawChar(e, t);
    } else {
      const T = ITEMS[e.type];
      if (e.state === 'idle' && !T.wall && !T.flat) softShadow(e.x, e.y + 1, T.w * 0.55, 0.22);
      drawItem(e, t);
    }
  }
  Horror.drawWorld(sc, t);
  drawParts();
  for (const p of sc.props) if (p.front) p.front(st[p.id], t, st);
  Weather.drawFront(sc);
  // noite + luzes
  X.setTransform(DPR, 0, 0, DPR, 0, 0);
  const k = G.nightK;
  if (k > 0.01) {
    X.globalCompositeOperation = 'multiply';
    X.fillStyle = Horror.tint(k) || `rgb(${Math.round(lerp(255, 78, k))},${Math.round(lerp(255, 86, k))},${Math.round(lerp(255, 160, k))})`;
    X.fillRect(0, 0, CSSW, CSSH);
    X.globalCompositeOperation = 'lighter';
    const lights = [];
    for (const p of sc.props) if (p.light) { const L = p.light(st[p.id]); if (L) lights.push(L); }
    for (const e of G.ents) {
      if (e.scene !== sc.id || e.kind !== 'item' || !visible(e)) continue;
      const T = ITEMS[e.type];
      if (T.light && !e.off) lights.push({ x: e.x + T.light.dx, y: e.y + T.light.dy, r: T.light.r });
    }
    for (const L of lights) {
      const sx = (L.x - camX) * SCALE, sy = (L.y - CAMY) * SCALE, r = L.r * SCALE;
      const col = L.col ? hexRgb(L.col) : [255, 196, 120];
      X.fillStyle = RG(sx, sy, 0, r, `rgba(${col},${0.42 * k})`, `rgba(${col},${0.16 * k})`, `rgba(${col},0)`);
      X.fillRect(sx - r, sy - r, r * 2, r * 2);
    }
    X.globalCompositeOperation = 'source-over';
  }
  Weather.drawScreen(sc);
  X.setTransform(m); Life.drawThoughts(); Chat.draw(); X.setTransform(DPR, 0, 0, DPR, 0, 0);
  // a vinheta agora é um gradiente CSS fixo (#vignette), sem custo por quadro
}

// ---------- Cache do cenário de fundo ----------
// O fundo (paredes, piso, céu, morros...) é quase todo estático e era
// redesenhado inteiro a cada quadro. Agora é desenhado num canvas fora da tela
// e só refeito quando algo muda (cômodo, noite, tamanho) ou a cada sc.bgRefresh s
// (nuvens nas janelas, relógio). Camadas animadas: sc.sky() é desenhado antes do
// cache (céu, nuvens) e sc.anim() depois (ondas, barco, algas...), a cada quadro.
const BG_REFRESH = 0.4, BG_MAXPX = 8e6;
const BGC = { c: null, g: null, key: '', t: -1e9, x0: 0, y0: 0, k: 1 };
function bgKey(sc, st) {
  return sc.id + '|' + Math.round(VW) + 'x' + Math.round(VH) + '|' + (SCALE * DPR).toFixed(4) + '|' + Math.round(G.nightK * 24) + '|' + (st.rooms ? JSON.stringify(st.rooms) : '');
}
function drawBg(sc, st, t, camX, m) {
  const W = sc.W, x0 = Math.min(0, (W - VW) / 2) - 4, x1 = Math.max(W, x0 + VW) + 8;
  const k = SCALE * DPR, ww = x1 - x0, hh = VH + 8;
  let kc = Math.min(k, 4096 / ww, Math.sqrt(BG_MAXPX / (ww * hh)));
  if (sc.sky) sc.sky(st, t);
  if (kc < k * 0.7) { sc.bg(st, t); if (sc.anim) sc.anim(st, t); return; } // grande demais (telas enormes): desenha direto
  const key = bgKey(sc, st);
  if (key !== BGC.key || t - BGC.t >= (sc.bgRefresh ?? BG_REFRESH) || t < BGC.t) {
    const pw = Math.ceil(ww * kc), ph = Math.ceil(hh * kc);
    if (!BGC.c) { BGC.c = document.createElement('canvas'); BGC.g = BGC.c.getContext('2d'); }
    if (BGC.c.width !== pw || BGC.c.height !== ph) { BGC.c.width = pw; BGC.c.height = ph; }
    BGC.x0 = x0; BGC.y0 = CAMY - 4; BGC.k = kc; BGC.key = key; BGC.t = t;
    const prev = X; X = BGC.g;
    X.setTransform(kc, 0, 0, kc, -x0 * kc, -BGC.y0 * kc);
    X.clearRect(x0, BGC.y0, ww, hh);
    sc.bg(st, t);
    X.setTransform(1, 0, 0, 1, 0, 0); X.globalAlpha = 1; X.globalCompositeOperation = 'source-over'; X.shadowBlur = 0;
    X = prev; X.setTransform(m);
  }
  // copia só a parte visível do cache
  const sx = (camX - BGC.x0) * BGC.k, sy = (CAMY - BGC.y0) * BGC.k;
  const sw = Math.min(VW * BGC.k, BGC.c.width - sx), sh = Math.min(VH * BGC.k, BGC.c.height - sy);
  X.setTransform(1, 0, 0, 1, 0, 0);
  X.drawImage(BGC.c, sx, sy, sw, sh, 0, 0, sw * k / BGC.k, sh * k / BGC.k);
  X.setTransform(m);
  if (sc.anim) sc.anim(st, t);
}
function frame_(now) {
  const ms = now - lastT;
  const dt = Math.min(0.05, ms / 1000 || 0.016);
  lastT = now;
  if (!document.hidden && ms > 0 && ms < 250) qualityTick(ms);
  update(dt);
  if (!MapView.covering() && !Mini.covering()) render();
  MapView.tick(G.t, dt);
  UI.tick(G.t);
  requestAnimationFrame(frame_);
}

// ---------- Salvar / carregar ----------
function save() {
  try {
    const ents = G.ents.filter((e) => !e.ghost).map((e) => { const o = Object.assign({}, e); if (o.state === 'held') o.state = 'idle'; delete o.onSurf; delete o.say; delete o.talkWith; delete o.talkCD; delete o.goal; delete o.moving; delete o.dancing; return o; });
    localStorage.setItem(SAVE_KEY, JSON.stringify({ v: 1, sceneId: G.sceneId, night: G.night, ents, st: G.st, cam: G.cam, nextId: G.nextId, friends: G.friends || {} }));
  } catch (e) { /* armazenamento indisponível */ }
}
function load() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return false;
    const d = JSON.parse(raw);
    if (d.v !== 1) return false;
    const hadPets = d.ents.some((e) => e.type === 'pet');
    newWorld();
    // lugares novos (que não existiam no save) mantêm seus objetos iniciais
    const fresh = G.ents.filter((e) => !d.st[e.scene]);
    G.ents = []; byId.clear();
    let nid = d.nextId;
    const remap = new Map();
    for (const e of fresh) { remap.set(e.id, nid); e.id = nid++; }
    for (const e of fresh) { if (e.hold) e.hold = remap.get(e.hold); if (e.heldBy) e.heldBy = remap.get(e.heldBy); }
    d.ents = d.ents.concat(fresh); d.nextId = nid;
    for (const e of d.ents) {
      if (!SCENES[e.scene]) continue;
      if (e.kind === 'item' && !ITEMS[e.type]) continue;
      if (e.state === 'fall' || e.state === 'slide' || e.state === 'booth') { e.state = 'idle'; e.y = SCENES[e.scene].floorTop + 60; e.z = null; e.cont = null; e.ang = 0; }
      G.ents.push(e); byId.set(e.id, e);
    }
    for (const id of SCENE_ORDER) Object.assign(G.st[id], d.st[id] || {});
    if (G.st.estudio.booth) { G.st.estudio.booth.who = null; G.st.estudio.booth.close = 0; }
    G.cam = Object.assign(G.cam, d.cam); G.nextId = d.nextId; G.friends = d.friends || {};
    // saves antigos: a casa ganha seus pets
    if (!hadPets) for (const e of casaPets()) { e.scene = 'casa'; e.id = G.nextId++; G.ents.push(e); byId.set(e.id, e); } G.night = !!d.night; G.nightK = G.night ? 1 : 0;
    G.sceneId = SCENES[d.sceneId] ? d.sceneId : 'casa';
    return true;
  } catch (e) { return false; }
}
function resetWorld() { Horror.resetAll(); newWorld(); resize(); save(); UI.setScene(G.sceneId); }

// ---------- Ações globais ----------
function goScene(id) {
  if (id === G.sceneId) return;
  for (const P of pointers.values()) if (P.ent) release(P, toWorld(P.cx, P.cy));
  pointers.clear();
  G.sceneId = id; clampCam(id);
  Sfx.whoosh();
  UI.setScene(id);
  Album.unlock('l_' + id);
}
function addCharacter() {
  const used = new Set(G.ents.filter((e) => e.kind === 'char').map((e) => e.name));
  const name = NAMES.find((n) => !used.has(n)) || pick(NAMES);
  const sc = S();
  const c = addEnt(C(name, sc.id, G.cam[sc.id] + VW / 2 + rand(-120, 120), 200));
  c.scene = sc.id; startFall(c, 0, 0); c.floorY = rand(sc.floorTop + 40, sc.floorBot - 10); c.pop = 0;
  emit('star', c.x, 260, 14); Sfx.sparkle();
  UI.toast(`${name} chegou na vila! Toque 2× para editar`);
  UI.refreshDock();
  return c;
}
function toggleNight() { if (Horror.blockDay()) return G.night; G.night = !G.night; Sfx.sparkle(); UI.toast(G.night ? 'Boa noite! 🌙' : 'Bom dia! ☀️'); return G.night; }

function boot() {
  canvas = document.getElementById('game');
  ctx = canvas.getContext('2d');
  if (!load()) newWorld();
  resize();
  addEventListener('resize', resize);
  canvas.addEventListener('pointerdown', onDown);
  canvas.addEventListener('pointermove', onMove);
  canvas.addEventListener('pointerup', onUp);
  canvas.addEventListener('pointercancel', onUp);
  canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  addEventListener('wheel', (e) => { if (UI.blocking()) return; G.cam[G.sceneId] += (e.deltaX || e.deltaY) / SCALE; clampCam(G.sceneId); }, { passive: true });
  addEventListener('keydown', (e) => {
    if (e.target && e.target.tagName === 'INPUT') return;
    if (e.key === 'm' || e.key === 'M') { if (MapView.isOpen()) MapView.close(); else if (!UI.blocking()) MapView.show(); return; }
    if (e.key === 'Escape' && MapView.isOpen()) { MapView.close(); return; }
    if (UI.blocking()) return;
    if (e.key === 'ArrowLeft') { G.cam[G.sceneId] -= 120; clampCam(G.sceneId); }
    if (e.key === 'ArrowRight') { G.cam[G.sceneId] += 120; clampCam(G.sceneId); }
    const n = parseInt(e.key, 10); if (n >= 1 && n <= SCENE_ORDER.length) goScene(SCENE_ORDER[n - 1]);
  });
  addEventListener('pagehide', save);
  document.addEventListener('visibilitychange', () => { if (document.hidden) save(); });
  UI.init();
  Horror.init();
  requestAnimationFrame((t) => { lastT = t; frame_(t); });
}
window.addEventListener('DOMContentLoaded', boot);
