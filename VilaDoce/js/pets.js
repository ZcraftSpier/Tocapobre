'use strict';
// ======================================================
//  Pets: arte, comportamento e o Pet Shop
// ======================================================
const PET_COLS = ['#c98a55', '#f2d6a8', '#5a3824', '#ffffff', '#3a3d58', '#9aa0aa', '#ff9f43', '#f6c9a0'];
const PET_NAMES = ['Bolinha', 'Pipoca', 'Thor', 'Mel', 'Luna', 'Bidu', 'Nino', 'Paçoca', 'Fofinho', 'Amora', 'Tico', 'Kiwi', 'Biscoito', 'Lua', 'Pingo', 'Nuvem'];
const SPECIES = [['dog', 'Cachorro'], ['cat', 'Gato'], ['bunny', 'Coelho'], ['hamster', 'Hamster']];
const PET_SPEED = { dog: 130, cat: 95, bunny: 105, hamster: 70 };

// ---------- peças de desenho dos pets ----------
const PET_IRIS = { dog: '#6b4426', cat: '#7cc242', bunny: '#5a3824', hamster: '#2a1d1a' };
function petEye(x, y, closed, iris = '#5a3824', r = 1, slit = false) {
  if (closed) { X.beginPath(); X.arc(x, y - 1, 5.5 * r, 0.15 * Math.PI, 0.85 * Math.PI); stroke(3, '#2a1d1a'); return; }
  fe(x, y, 6.2 * r, 7.6 * r, '#1d1410');
  fe(x, y + 0.6 * r, 4.6 * r, 6 * r, RG(x, y + 3 * r, 0.5, 7 * r, shade(iris, 0.35), iris));
  if (slit) fe(x, y + 0.6 * r, 1.4 * r, 5 * r, '#0d0a08'); else fc(x, y + 0.8 * r, 2.8 * r, '#0d0a08');
  fc(x - 1.9 * r, y - 2.6 * r, 1.9 * r, '#ffffff'); fc(x + 1.8 * r, y + 2.6 * r, 0.9 * r, 'rgba(255,255,255,.8)');
}
// perna arredondada com patinha
function petLeg(x, top, len, col, ang, paw, w = 8) {
  X.save(); X.translate(x, top); X.rotate(ang);
  X.beginPath(); X.moveTo(-w, 0); X.quadraticCurveTo(-w - 2, len * 0.5, -w + 1, len - 4); X.lineTo(w - 1, len - 4); X.quadraticCurveTo(w + 2, len * 0.5, w, 0); X.closePath();
  // a cor pode chegar como 'rgb(...)' (tom escuro); só clareia/escurece cores hexadecimais
  const sh = (k) => (col[0] === '#' ? shade(col, k) : col);
  X.fillStyle = LG(-w, 0, w, 0, sh(0.06), col, sh(-0.12)); X.fill();
  fe(2, len - 2, w + 3, 6, paw || (col[0] === '#' ? shade(col, 0.1) : col));
  X.restore();
}
function petLegs(list, top, len, col, t, walk, id, paw, w) {
  for (const [x, ph] of list) petLeg(x, top, len, col, walk ? Math.sin(t * 16 + id + ph) * 0.45 : 0, paw, w);
}
const bodyGrad = (c, y1, y2) => LG(0, y1, 0, y2, shade(c, 0.14), c, shade(c, -0.15));
function petCollar(x, y, col, rot = 0) {
  X.save(); X.translate(x, y); X.rotate(rot);
  fr(-13, -5, 26, 10, 5, col || '#ff5d5d'); fr(-13, -5, 26, 3, 2, 'rgba(255,255,255,.35)');
  fc(2, 10, 5, '#ffd23f'); fc(1, 9, 1.8, 'rgba(255,255,255,.7)');
  X.restore();
}
function petHat(it, x, y, s) {
  if (!it.hat || !WEAR[it.hat]) return;
  X.save(); X.translate(x, y); X.scale(s, s); WEAR[it.hat].draw(); X.restore();
}
function whiskers(x, y, len, col = 'rgba(70,50,50,.55)') {
  for (const k of [-1, 0, 1]) { X.beginPath(); X.moveTo(x, y + k * 3); X.quadraticCurveTo(x + len * 0.5, y + k * 6 - 2, x + len, y + k * 9); stroke(1.4, col); }
}

function drawPet(it, t) {
  const sp = it.species || 'dog', c = it.col || '#c98a55';
  const d = shade(c, -0.2), l = shade(c, 0.24), id = it.id || 0;
  const mode = it.state === 'held' || it.state === 'inhand' || it.state === 'fall' ? 'held' : (it.mode || 'stand');
  const walk = mode === 'walk';
  const closed = mode === 'sleep' || ((t * 0.7 + id * 1.3) % 4) < 0.1;
  const happy = (it.happyT || 0) > 0 || mode === 'held';
  const low = mode === 'sleep' || mode === 'lie';
  const pink = '#ffb3c7';
  X.save();
  X.scale((it.dir || 1) * 1.35, 1.35);
  if (sp === 'bunny' && walk) X.translate(0, -Math.abs(Math.sin(t * 10 + id)) * 22);
  if (mode === 'held') X.rotate(Math.sin(t * 6 + id) * 0.08);

  if (sp === 'dog') {
    const H = mode === 'sit' ? [30, -112] : low ? [58, -50] : [52, -94];
    const wag = Math.sin(t * (happy ? 20 : 5) + id) * (happy ? 0.45 : 0.15);
    // rabo afinando na ponta
    X.save(); X.translate(mode === 'sit' ? -34 : -50, mode === 'sit' ? -24 : low ? -30 : -66); X.rotate((low ? -1.7 : -0.7) + wag);
    X.beginPath(); X.moveTo(-6, 2); X.quadraticCurveTo(-12, -22, -3, -40); X.quadraticCurveTo(5, -22, 6, 2); X.closePath(); X.fillStyle = c; X.fill(); X.restore();
    if (low) {
      fe(0, -28, 58, 24, bodyGrad(c, -52, -4)); fe(8, -16, 38, 9, l);
      fe(58, -8, 18, 8, l); fe(38, -7, 16, 8, l);
      if (it.spot) { fe(-18, -38, 16, 10, d, 0.2); fc(-6, -42, 7, d); }
    } else if (mode === 'sit') {
      petLeg(22, -62, 62, d, 0, shade(c, 0.05));
      fe(-8, -48, 36, 33, bodyGrad(c, -82, -14), -0.5); fe(10, -56, 20, 24, l, -0.3);
      fe(-26, -18, 26, 19, c); fe(-12, -5, 19, 7, l);
      if (it.spot) { fe(-16, -58, 13, 10, d); fc(-24, -50, 7, d); }
      petLeg(32, -64, 64, c, 0, l);
    } else {
      petLegs([[-26, Math.PI], [32, 0]], -52, 50, d, t, walk, id);
      fe(-32, -60, 30, 28, bodyGrad(c, -88, -32)); fe(32, -60, 30, 30, bodyGrad(c, -90, -30)); fe(0, -60, 54, 28, bodyGrad(c, -88, -32));
      fe(8, -44, 36, 11, l);
      if (it.spot) { fe(-16, -70, 17, 11, d, 0.3); fc(-4, -74, 8, d); fc(-28, -66, 6, d); }
      petLegs([[-40, 0], [22, Math.PI]], -52, 52, c, t, walk, id, l);
    }
    const [hx, hy] = H;
    petCollar(hx - 14, hy + 24, it.collar, -0.5);
    fe(hx - 18, hy, 12, 26, d, 0.3);
    fc(hx, hy, 29, RG(hx - 8, hy - 12, 4, 34, shade(c, 0.12), c, shade(c, -0.08)));
    fe(hx + 8, hy + 13, 20, 14, c);
    fe(hx + 26, hy + 10, 19, 13, l);
    fe(hx + 40, hy + 3, 7.5, 6, '#2a1d1a'); fc(hx + 38, hy + 1, 2.2, 'rgba(255,255,255,.6)');
    X.beginPath(); X.moveTo(hx + 39, hy + 8); X.quadraticCurveTo(hx + 37, hy + 17, hx + 27, hy + 17); stroke(2.5, '#4a2a2a');
    if (happy && !closed) { fe(hx + 30, hy + 23, 6.5, 8, '#ff7d8f'); line(hx + 30, hy + 18, hx + 30, hy + 27, 1.5, '#e85d75'); }
    petEye(hx + 10, hy - 6, closed, PET_IRIS.dog, 1.15);
    X.beginPath(); X.arc(hx + 10, hy - 16, 8, 1.15 * Math.PI, 1.8 * Math.PI); stroke(2.5, d);
    fe(hx - 10, hy + 2, 11, 25, d, 0.12); fe(hx - 9, hy - 6, 5, 10, 'rgba(255,255,255,.12)', 0.12);
    petHat(it, hx - 2, hy - 22, 0.42);
  } else if (sp === 'cat') {
    const H = mode === 'sit' ? [20, -98] : low ? [46, -44] : [44, -84];
    const wv = Math.sin(t * (happy ? 6 : 2) + id) * 10, tabby = c === '#ff9f43' || it.spot;
    // rabo grosso afinando, com listras no gato rajado
    X.save();
    X.beginPath();
    if (low) { X.moveTo(-44, -20); X.bezierCurveTo(-90, -20, -80, 6, -40, 0); }
    else { const bx = mode === 'sit' ? -24 : -42, by = mode === 'sit' ? -10 : -52; X.moveTo(bx, by); X.bezierCurveTo(bx - 42, by - 4, bx - 36 + wv, by - 70, bx - 18 + wv, by - 72); }
    stroke(12, c); stroke(6, shade(c, 0.08));
    X.restore();
    if (low) { fe(0, -24, 50, 21, bodyGrad(c, -45, -3)); fe(44, -6, 15, 7, l); fe(28, -6, 14, 7, l); }
    else if (mode === 'sit') {
      fe(-6, -42, 29, 35, bodyGrad(c, -77, -7), -0.25); fe(-20, -14, 21, 15, c);
      petLegs([[12, 0], [24, 0]], -54, 54, c, t, false, id, l, 6);
      fe(4, -44, 15, 20, l, -0.2);
    } else {
      petLegs([[-22, Math.PI], [30, 0]], -46, 46, d, t, walk, id, null, 6);
      fe(0, -52, 46, 21, bodyGrad(c, -73, -31)); fe(6, -40, 28, 8, l);
      petLegs([[-34, 0], [20, Math.PI]], -46, 46, c, t, walk, id, l, 6);
    }
    if (tabby) { X.save(); X.globalAlpha = 0.35; for (let i = 0; i < 4; i++) fe(-28 + i * 14, low ? -38 : mode === 'sit' ? -60 + i * 10 : -68, 4, 10, d, 0.2); X.restore(); }
    const [hx, hy] = H;
    petCollar(hx - 8, hy + 22, it.collar, -0.3);
    fpoly([hx - 23, hy - 6, hx - 19, hy - 42, hx - 2, hy - 20], c); fpoly([hx + 4, hy - 20, hx + 16, hy - 44, hx + 23, hy - 8], c);
    fpoly([hx - 18, hy - 13, hx - 16, hy - 33, hx - 7, hy - 20], pink); fpoly([hx + 8, hy - 20, hx + 15, hy - 36, hx + 18, hy - 13], pink);
    fe(hx, hy, 27, 24, RG(hx - 8, hy - 10, 4, 30, shade(c, 0.12), c, shade(c, -0.08)));
    fpoly([hx - 26, hy + 4, hx - 34, hy + 10, hx - 24, hy + 13], c); fpoly([hx + 24, hy + 4, hx + 32, hy + 12, hx + 22, hy + 14], c);
    if (tabby) { for (const dx of [-8, 0, 8]) line(hx + dx, hy - 22, hx + dx * 0.6, hy - 12, 3, d); }
    fe(hx + 14, hy + 9, 12, 8, l);
    X.beginPath(); X.moveTo(hx + 20, hy + 1); X.lineTo(hx + 26, hy + 1); X.lineTo(hx + 23, hy + 6); X.closePath(); X.fillStyle = '#ff7d8f'; X.fill();
    X.beginPath(); X.moveTo(hx + 23, hy + 6); X.quadraticCurveTo(hx + 20, hy + 11, hx + 17, hy + 9); X.moveTo(hx + 23, hy + 6); X.quadraticCurveTo(hx + 26, hy + 11, hx + 29, hy + 9); stroke(1.8, '#5a3030');
    petEye(hx + 6, hy - 3, closed, PET_IRIS.cat, 1.05, true);
    whiskers(hx + 24, hy + 8, 22);
    petHat(it, hx - 2, hy - 18, 0.36);
  } else if (sp === 'bunny') {
    const H = low ? [38, -40] : [30, -72];
    for (const [x, y, r] of [[-36, -44, 11], [-42, -38, 8], [-30, -36, 8]]) fc(x, low ? y + 16 : y, r, '#ffffff');
    if (low) fe(0, -26, 44, 24, bodyGrad(c, -50, -2));
    else { fe(-4, -38, 37, 34, bodyGrad(c, -72, -4)); fe(16, -6, 18, 8, shade(c, -0.1)); fe(-18, -4, 22, 9, c); fe(-20, -3, 14, 5, l); }
    fe(6, low ? -18 : -30, 18, 15, l);
    const [hx, hy] = H, ew = Math.sin(t * 3 + id) * 0.08;
    for (const [dx, rot, len] of [[-9, -0.28 + ew, 30], [7, 0.16 - ew, 32]]) {
      fe(hx + dx, hy - 10 - len, 9, len, c, rot);
      fe(hx + dx, hy - 10 - len, 4.5, len - 8, LG(0, hy - 10 - len * 2, 0, hy - 10, '#ffd6e2', pink), rot);
    }
    fc(hx, hy, 24, RG(hx - 6, hy - 8, 3, 28, shade(c, 0.12), c, shade(c, -0.08)));
    fe(hx + 14, hy + 8, 10, 8, l);
    fc(hx + 21, hy + 4, 3.6, '#ff7d8f'); fc(hx + 20, hy + 3, 1.2, 'rgba(255,255,255,.6)');
    line(hx + 21, hy + 7, hx + 21, hy + 11, 1.5, '#a86060');
    fe(hx + 4, hy + 10, 6, 4, 'rgba(255,120,140,.35)');
    petEye(hx + 7, hy - 4, closed, PET_IRIS.bunny, 1.1);
    whiskers(hx + 22, hy + 6, 16);
    petCollar(hx - 8, hy + 22, it.collar, -0.3);
    petHat(it, hx - 2, hy - 18, 0.32);
  } else {
    const bob = walk ? Math.abs(Math.sin(t * 18 + id)) * 3 : 0;
    X.translate(0, -bob);
    fe(-12, -3, 7, 4, pink); fe(14, -3, 7, 4, pink);
    fe(0, -26, 34, 26, bodyGrad(c, -52, 0));
    fe(10, -16, 22, 13, '#fff6ec');
    fe(24, -22, 10, 9, '#fff6ec');
    if (it.spot) { fe(-14, -36, 12, 8, d); fc(-4, -42, 5, d); }
    fc(4, -48, 7.5, d); fc(20, -46, 7.5, d); fc(4, -48, 4, pink); fc(20, -46, 4, pink);
    petEye(22, -32, closed, PET_IRIS.hamster, 0.95);
    fc(33, -26, 3, '#ff7d8f');
    fe(26, -14, 4, 3, pink); fe(16, -12, 4, 3, pink);
    whiskers(33, -25, 12);
    petHat(it, 14, -46, 0.24);
  }
  X.restore();
}

function petSound(sp) {
  if (sp === 'dog') Sfx.bark(); else if (sp === 'cat') Sfx.meow(); else Sfx.squeak();
}
function petFeed(pet, food) {
  const T = ITEMS[food.type];
  food.bites = (food.bites || 0) + 1; Sfx.munch();
  emit('crumb', pet.x + (pet.dir || 1) * 50, pet.y - 40, 5, food.type);
  pet.happyT = 1.6; pet.eatT = 0.9;
  if (food.bites >= T.food) { removeEnt(food); emit('heart', pet.x, pet.y - 110, 4); petSound(pet.species); return true; }
  return false;
}
function petInterest(it) {
  let best = null, bd = 650;
  for (const e of G.ents) {
    if (e === it || e.scene !== it.scene || e.kind !== 'item' || e.state !== 'idle' || e.heldBy || !visible(e)) continue;
    const T = ITEMS[e.type];
    if (!(T.food || T.toy || T.roll) || T.pet) continue;
    if (e.onSurf || e.onEnt || e.z != null || Math.abs(e.y - it.y) > 120) continue;
    const dd = Math.abs(e.x - it.x);
    if (dd < bd) { bd = dd; best = e; }
  }
  return best;
}
function petAI(it, dt) {
  it.happyT = Math.max(0, (it.happyT || 0) - dt);
  if (it.state !== 'idle') { it.mode = 'stand'; it.tgt = null; return; }
  const sc = SCENES[it.scene], sp = it.species;
  const host = it.onEnt ? getEnt(it.onEnt) : null;
  if (host && ITEMS[host.type].petbed) { it.mode = 'sleep'; if (Math.random() < dt * 0.5) emit('z', it.x, it.y - 70, 1); return; }
  const onFloor = !it.onSurf && !it.onEnt && it.z == null;
  it.pt = (it.pt || 0) - dt;
  if (!onFloor) {
    if (it.mode === 'walk' || !it.mode) it.mode = 'sit';
    if (it.pt <= 0) { it.mode = pick(['sit', 'lie', 'stand']); it.pt = rand(3, 7); }
    return;
  }
  let tg = it.tgt ? getEnt(it.tgt) : null;
  if (tg && (tg.scene !== it.scene || tg.state !== 'idle' || tg.heldBy || !visible(tg))) { tg = null; it.tgt = null; }
  if (!tg && it.pt <= 0) { tg = petInterest(it); if (tg) it.tgt = tg.id; }
  if (tg) {
    const dx = tg.x - it.x;
    if (Math.abs(dx) > 60) { it.mode = 'walk'; it.dir = Math.sign(dx); it.x += it.dir * PET_SPEED[sp] * 1.35 * dt; return; }
    const T = ITEMS[tg.type];
    if (T.food) {
      it.mode = 'stand'; it.eatT = (it.eatT || 0) - dt;
      if (it.eatT <= 0 && petFeed(it, tg)) { it.tgt = null; it.pt = rand(2, 4); }
      return;
    }
    tg.vx = (it.dir || 1) * rand(380, 620);
    if (!T.roll) hop(tg, 320);
    it.happyT = 1.5; it.tgt = null; it.pt = rand(1.2, 3); it.mode = 'stand';
    if (Math.random() < 0.6) petSound(sp);
    hop(it, 300);
    return;
  }
  if (G.night && it.mode !== 'walk') { it.mode = 'sleep'; if (Math.random() < dt * 0.5) emit('z', it.x, it.y - 70, 1); if (it.pt <= 0) it.pt = rand(4, 8); return; }
  if (it.mode === 'walk') {
    it.x += (it.dir || 1) * PET_SPEED[sp] * dt;
    if (it.x < 60 || it.x > sc.W - 60) { it.dir = -(it.dir || 1); it.x = clamp(it.x, 60, sc.W - 60); }
    if (it.pt <= 0) { it.mode = Math.random() < 0.6 ? 'sit' : 'stand'; it.pt = rand(2, 5); }
    return;
  }
  if (it.pt <= 0) {
    const r = Math.random();
    if (r < 0.55) { it.mode = 'walk'; it.dir = pick([-1, 1]); it.pt = rand(1.5, 4); }
    else if (r < 0.8) { it.mode = 'sit'; it.pt = rand(2, 5); }
    else { it.mode = 'lie'; it.pt = rand(3, 6); }
  }
}

Object.assign(ITEMS, {
  pet: { n: 'Pet', w: 190, h: 170, pet: true,
    draw(it, t) { drawPet(it, t); },
    tap(it) { petSound(it.species); it.happyT = 1.6; emit('heart', it.x, it.y - 120, 2); hop(it, 340); UI.showBubble(it); },
    update(it, dt) { petAI(it, dt); } },
  petfood: { n: 'Ração', w: 90, h: 50, food: 3, petfood: true, draw() {
    fe(0, -26, 40, 9, '#8a5532');
    for (let i = 0; i < 9; i++) fc(-26 + i * 6.5, -28 - (i % 3) * 3, 5, i % 2 ? '#b07547' : '#c98a55');
    X.beginPath(); X.moveTo(-44, -26); X.lineTo(44, -26); X.lineTo(34, 0); X.lineTo(-34, 0); X.closePath();
    X.fillStyle = LG(-44, 0, 44, 0, '#ff6b6b', '#e04d4d'); X.fill();
    fe(0, -26, 44, 7, 'rgba(0,0,0,.08)');
    heartPath(0, -12, 7); X.fillStyle = '#fff'; X.fill();
  } },
  bone: { n: 'Ossinho', w: 90, h: 36, toy: true, draw() {
    fr(-30, -22, 60, 14, 7, '#fbf6ea');
    for (const k of [-1, 1]) { fc(k * 34, -24, 10, '#fbf6ea'); fc(k * 34, -10, 10, '#fbf6ea'); }
    fr(-24, -20, 48, 4, 2, 'rgba(0,0,0,.05)');
  }, tap(it) { Sfx.squeak(); hop(it, 500); } },
  yarn: { n: 'Novelo', w: 64, h: 64, toy: true, roll: true, bounce: 0.3, draw(it) {
    X.save(); X.translate(0, -30); X.rotate(it.rot || 0);
    fc(0, 0, 30, '#ff7eb6');
    for (let i = -2; i <= 2; i++) { X.beginPath(); X.ellipse(0, 0, 28, 10, i * 0.6, 0, TAU); stroke(2.5, 'rgba(200,60,120,.45)'); }
    X.restore();
    X.beginPath(); X.moveTo(20, -8); X.quadraticCurveTo(40, 0, 52, -4); stroke(3, '#ff7eb6');
  }, tap(it) { Sfx.boing(); hop(it, 600); } },
});

function P(species, name, x, y, extra) {
  return I('pet', x, y, Object.assign({ species, name, col: pick(PET_COLS), collar: pick(CLOTH), dir: pick([-1, 1]), spot: Math.random() < 0.4, hat: null, mode: 'stand' }, extra));
}
function adoptPet(species, x, y, scene) {
  const used = new Set(G.ents.filter((e) => e.type === 'pet').map((e) => e.name));
  const name = PET_NAMES.find((n) => !used.has(n)) || pick(PET_NAMES);
  const p = spawnItem('pet', x, y, scene);
  Object.assign(p, { species, name, col: pick(PET_COLS), collar: pick(CLOTH), dir: 1, spot: Math.random() < 0.4, hat: null, mode: 'sit', pt: 2 });
  Album.unlock('a_pet');
  return p;
}
function casaPets() {
  return [P('dog', 'Bidu', 1480, 900, { col: '#c98a55', spot: true }), P('cat', 'Mel', 2050, 910, { col: '#ff9f43', spot: false })];
}
const _casaInit = SCENES.casa.init;
SCENES.casa.init = () => _casaInit().concat(casaPets());

// ======================================================
//  PET SHOP
// ======================================================
function makeAdopt(id, x, species, label, col) {
  const fake = { species, col, mode: 'sleep', id: x, dir: 1, collar: '#ff5d5d' };
  return {
    id, x: x - 125, y: 360, w: 250, h: 300,
    tap() {
      if (G.ents.filter((e) => e.type === 'pet').length >= 40) { UI.toast('Já tem muitos pets na vila!'); return true; }
      if (!canSpawn()) return true;
      const p = adoptPet(species, x + rand(-40, 40), 900, 'petshop');
      petSound(species); emit('heart', p.x, 760, 6);
      UI.toast(`Novo amigo: ${p.name}! Toque nele para editar 🐾`);
      return true;
    },
    draw(s, t) {
      fr(x - 120, 380, 240, 260, 24, '#ffffff');
      fr(x - 108, 392, 216, 200, 16, LG(0, 392, 0, 592, alpha(col, 0.25), alpha(col, 0.5)));
      fe(x, 570, 80, 16, shade(col, -0.05));
      X.save(); X.translate(x, 572); X.scale(0.7, 0.7); drawPet(fake, t); X.restore();
      if (Math.random() < 0.01) emit('z', x + 30, 480, 1);
      fpoly([x - 108, 392, x - 60, 392, x - 108, 480], 'rgba(255,255,255,.35)');
      fr(x - 100, 600, 200, 32, 12, col);
      X.font = '600 20px Fredoka, sans-serif'; X.textAlign = 'center'; X.fillStyle = '#fff'; X.fillText(label, x, 623);
    },
  };
}
SCENES.petshop = {
  id: 'petshop', name: 'Pet Shop', W: 2300, floorTop: 805, floorBot: 950, ceil: 260,
  surfaces: [
    { x1: 1320, x2: 1640, y: 450 }, { x1: 1320, x2: 1640, y: 620 },
    { x1: 1950, x2: 2150, y: 700 },
  ],
  seats: [],
  bg(st, t) {
    wall(-1000, 3400, '#e5f1ff', patDots());
    X.fillStyle = '#bfe0ff'; X.fillRect(-1000, 640, 4400, 152);
    fr(-1000, 632, 4400, 12, 0, '#9ccfff');
    ceilingTrim(-1000, 3400);
    baseboard(-1000, 3400, '#5c9ce6');
    floorTiles(-1000, 3400, '#ffffff', '#ffe3ef', 90);
    // letreiro
    fr(380, 60, 680, 100, 34, LG(0, 60, 0, 160, '#ffb3cf', '#ff7eb6'));
    X.font = '600 54px Fredoka, sans-serif'; X.textAlign = 'center'; X.fillStyle = '#fff'; X.fillText('Pet Shop Amigo', 720, 128);
    for (const px of [420, 1020]) { fc(px, 110, 14, '#fff'); for (let i = 0; i < 3; i++) fc(px - 14 + i * 14, 88, 6, '#fff'); }
    // patinhas no chão
    for (let i = 0; i < 6; i++) { const x = 300 + i * 260, y = 880 + (i % 2) * 30; fe(x, y, 14, 6, 'rgba(255,126,182,.25)'); for (let k = 0; k < 3; k++) fc(x - 12 + k * 12, y - 12, 4, 'rgba(255,126,182,.25)'); }
  },
  props: [
    makePendant('l1', 400, '#ff7eb6'), makePendant('l2', 1100, '#ff7eb6'), makePendant('l3', 1900, '#ff7eb6'),
    { id: 'base', x: 0, y: 0, w: 0, h: 0,
      draw() { softShadow(630, 800, 560); fr(30, 640, 1200, 156, 14, '#ffd0e2'); for (let i = 0; i < 4; i++) fr(50 + i * 300, 660, 260, 120, 14, '#ffe3ef'); } },
    makeAdopt('aDog', 180, 'dog', 'Adote um cachorro', '#ff9f43'),
    makeAdopt('aCat', 480, 'cat', 'Adote um gato', '#a77bf3'),
    makeAdopt('aBun', 780, 'bunny', 'Adote um coelho', '#7ed957'),
    makeAdopt('aHam', 1080, 'hamster', 'Adote um hamster', '#4dabf7'),
    { id: 'shelf', x: 1300, y: 280, w: 360, h: 520,
      tap(s, w) {
        if (!canSpawn()) return true;
        const type = w.y < 450 ? 'petfood' : w.y < 620 ? pick(['bone', 'yarn']) : 'petbed';
        spawnItem(type, rand(1360, 1600), type === 'petbed' ? 880 : (w.y < 450 ? 450 : 620), 'petshop'); Sfx.coin(); return true;
      },
      draw() {
        softShadow(1480, 800, 200);
        fr(1300, 280, 360, 516, 14, '#ffffff'); fr(1312, 292, 336, 496, 8, '#fff0f6');
        [450, 620].forEach((y) => fr(1306, y, 348, 14, 5, '#ffc2da'));
        X.font = '600 22px Fredoka, sans-serif'; X.textAlign = 'center'; X.fillStyle = '#c45b8f';
        X.fillText('Ração  ·  Brinquedos  ·  Caminhas', 1480, 272);
        for (let i = 0; i < 4; i++) fr(1330 + i * 80, 700, 64, 80, 10, ['#ff9f43', '#4dabf7', '#7ed957', '#a77bf3'][i]);
      } },
    { id: 'tub', x: 1930, y: 560, w: 240, h: 240, state: {},
      dropRect: { x: 1910, y: 520, w: 280, h: 300 },
      drop(e) {
        if (e.type !== 'pet') return false;
        emit('smoke', 2050, 680, 14); emit('heart', 2050, 600, 4); emit('drop', 2050, 680, 10, 1);
        Sfx.splash(); setTimeout(() => Sfx.sparkle(), 300); e.happyT = 3;
        UI.toast(`${e.name} tomou banho! Cheirosinho ✨`); Album.unlock('a_banho');
        return false;
      },
      tap() { Sfx.splash(); emit('smoke', 2050, 680, 10); UI.toast('Solte um pet na banheira para dar banho 🛁'); return true; },
      draw(s, t) {
        softShadow(2050, 800, 140);
        fr(2030, 720, 40, 80, 8, '#c9d5e0');
        X.beginPath(); X.moveTo(1940, 700); X.lineTo(2160, 700); X.quadraticCurveTo(2160, 760, 2100, 760); X.lineTo(2000, 760); X.quadraticCurveTo(1940, 760, 1940, 700); X.closePath();
        X.fillStyle = LG(0, 700, 0, 760, '#ffffff', '#dce8f5'); X.fill();
        fe(2050, 702, 110, 10, '#bfe6ff');
        for (let i = 0; i < 7; i++) fc(1960 + i * 30, 698 - Math.abs(Math.sin(t * 2 + i)) * 6, 10 + (i % 3) * 3, 'rgba(255,255,255,.9)');
        line(2150, 700, 2150, 600, 6, '#c9d5e0'); line(2150, 600, 2110, 600, 6, '#c9d5e0'); fe(2106, 606, 12, 6, '#9aa6b2');
      } },
    makeTrash('trash', 2240),
  ],
  init() {
    return [
      I('petfood', 1380, 450), I('petfood', 1600, 450), I('bone', 1400, 620), I('yarn', 1560, 620),
      I('petbed', 700, 900), I('aquarium', 1240, 900),
      P('bunny', 'Paçoca', 500, 905, { col: '#ffffff' }),
      C('Enzo', 'petshop', 1800, 900),
    ];
  },
};
