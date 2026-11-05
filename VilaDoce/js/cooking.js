'use strict';
// ======================================================
//  Cozinha: junte ingredientes na panela e descubra receitas
// ======================================================
Object.assign(ITEMS, {
  farinha: { n: 'Farinha', w: 70, h: 90, draw() {
    fpoly([-30, -80, 30, -80, 34, 0, -34, 0], LG(-34, 0, 34, 0, '#fffaf0', '#f1e6d0'));
    fpoly([-30, -80, -20, -92, 20, -92, 30, -80], '#e8dcc4');
    fr(-24, -56, 48, 30, 6, '#ff9f43');
    X.font = '600 13px Fredoka, sans-serif'; X.textAlign = 'center'; X.fillStyle = '#fff'; X.fillText('Farinha', 0, -37);
    fc(0, -70, 6, '#ffd23f');
  } },
  acucar: { n: 'Açúcar', w: 64, h: 84, draw() {
    fr(-26, -66, 52, 66, 12, 'rgba(230,240,255,.85)');
    fr(-22, -46, 44, 42, 8, '#ffffff'); for (let i = 0; i < 8; i++) fr(-16 + (i % 4) * 9, -40 + ((i / 4) | 0) * 12, 6, 6, 1, '#f3f6fa');
    fr(-28, -80, 56, 16, 6, '#ff7eb6');
    X.font = '600 11px Fredoka, sans-serif'; X.textAlign = 'center'; X.fillStyle = '#c45b8f'; X.fillText('Açúcar', 0, -52);
  } },
  chocolate: { n: 'Chocolate', w: 84, h: 50, food: 2, draw() {
    fr(-40, -40, 80, 40, 6, '#e04d4d'); fr(-40, -40, 34, 40, 6, '#6b3e26');
    for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) fr(-37 + i * 15, -37 + j * 18, 12, 15, 2, '#7a4b2a');
    fr(-4, -30, 40, 16, 4, '#ffd23f');
  } },
  panqueca: { n: 'Panqueca', w: 100, h: 70, food: 3, draw() {
    fe(0, -4, 50, 9, '#e9eef5');
    for (let i = 0; i < 4; i++) fe(0, -14 - i * 11, 40, 10, i % 2 ? '#e8a64a' : '#f2bb63');
    X.beginPath(); X.moveTo(-30, -52); X.quadraticCurveTo(0, -62, 30, -52); X.lineTo(26, -40); X.quadraticCurveTo(0, -48, -24, -36); X.closePath(); X.fillStyle = '#b5651d'; X.fill();
    fr(-8, -66, 16, 10, 3, '#fff3c4');
  } },
  chococake: { n: 'Bolo de chocolate', w: 110, h: 100, food: 4, draw() {
    fe(0, -2, 58, 9, '#e9eef5');
    fr(-50, -62, 100, 60, 12, LG(0, -62, 0, 0, '#8a5532', '#5a3520'));
    fr(-50, -36, 100, 8, 0, '#c98a55');
    fr(-52, -74, 104, 18, 9, '#3d2416');
    for (let i = 0; i < 9; i++) fr(-44 + i * 10, -74, 4, 7, 2, ['#ff6b6b', '#ffd23f', '#4dabf7', '#ffffff'][i % 4]);
    fc(0, -84, 10, '#e8283f');
  } },
  cuca: { n: 'Cuca', w: 120, h: 70, food: 4, draw() {
    fr(-56, -46, 112, 46, 10, LG(0, -46, 0, 0, '#f2bb63', '#d7893f'));
    for (let i = 0; i < 14; i++) fc(-48 + (i % 7) * 16, -46 + ((i / 7) | 0) * 8, 7, i % 2 ? '#fff1d6' : '#f9dcae');
    for (let i = 0; i < 4; i++) fe(-36 + i * 24, -30, 8, 5, '#ffe58a');
  } },
  brigadeiro: { n: 'Brigadeiro', w: 100, h: 50, food: 3, draw() {
    fe(0, -6, 50, 10, '#ffffff');
    for (const [x, y] of [[-24, -24], [0, -28], [24, -24]]) {
      fr(x - 14, y + 4, 28, 12, 4, '#ff9ec4'); fc(x, y, 14, '#4a2b1c');
      for (let i = 0; i < 6; i++) fr(x - 10 + (i % 3) * 8, y - 10 + ((i / 3) | 0) * 8, 4, 2, 1, ['#ff6b6b', '#ffd23f', '#4dabf7'][i % 3]);
    }
  } },
  fruitsalad: { n: 'Salada de frutas', w: 100, h: 70, food: 3, draw() {
    X.beginPath(); X.arc(0, -36, 46, 0, Math.PI); X.closePath(); X.fillStyle = 'rgba(220,240,255,.8)'; X.fill();
    [['#ff5468', -24, -40], ['#ffd23f', 0, -46], ['#7ed957', 22, -40], ['#ff9f43', -10, -32], ['#ec3f45', 12, -30]].forEach(([c, x, y]) => fr(x - 9, y - 9, 18, 18, 5, c));
    X.beginPath(); X.arc(0, -36, 46, 0, Math.PI); stroke(3, 'rgba(160,200,230,.9)');
  } },
  vitamina: { n: 'Vitamina', w: 64, h: 110, drink: 1, draw(it) {
    const lv = it.level ?? 1;
    fr(-25, -84, 50, 84, 12, 'rgba(220,240,255,.55)');
    if (lv > 0) fr(-21, -4 - 72 * lv, 42, 72 * lv, 9, LG(0, -80, 0, 0, '#ffe58a', '#ffb3c7'));
    line(10, -102, 2, -40, 6, '#7ed957'); fe(-14, -88, 10, 6, '#ffd23f', 0.4);
  } },
  popcorn: { n: 'Pipoca', w: 70, h: 100, food: 3, draw() {
    for (let i = 0; i < 9; i++) fc(-22 + (i % 3) * 22, -70 - ((i / 3) | 0) * 12 + (i % 2) * 4, 13, i % 2 ? '#fff8e1' : '#ffffff');
    fpoly([-30, -66, 30, -66, 22, 0, -22, 0], '#ffffff');
    X.save(); poly([-30, -66, 30, -66, 22, 0, -22, 0]); X.clip(); for (let i = -2; i <= 2; i++) fr(i * 14 - 4, -70, 8, 74, 0, '#ff5d5d'); X.restore();
  } },
  friedegg: { n: 'Ovo frito', w: 90, h: 40, food: 2, draw() {
    fe(0, -6, 44, 9, '#e9eef5');
    X.beginPath(); X.moveTo(-34, -14); X.bezierCurveTo(-40, -34, -10, -36, 0, -30); X.bezierCurveTo(20, -40, 40, -26, 32, -14); X.quadraticCurveTo(0, -6, -34, -14); X.closePath(); X.fillStyle = '#ffffff'; X.fill();
    fc(2, -22, 11, '#ffc21a'); fc(-2, -26, 3, 'rgba(255,255,255,.7)');
  } },
  chocostraw: { n: 'Morango com chocolate', w: 90, h: 70, food: 3, draw() {
    fe(0, -6, 44, 9, '#ffffff');
    for (const [x, y] of [[-22, -24], [0, -30], [22, -24]]) {
      fe(x, y, 12, 16, '#e8283f'); X.save(); X.beginPath(); X.ellipse(x, y, 12, 16, 0, 0, TAU); X.clip(); fr(x - 14, y, 28, 20, 0, '#4a2b1c'); X.restore();
      fe(x, y - 16, 8, 4, '#4ea83c');
    }
  } },
  soup: { n: 'Sopa de legumes', w: 100, h: 60, food: 3, draw() {
    X.beginPath(); X.arc(0, -30, 44, 0, Math.PI); X.closePath(); X.fillStyle = '#ffffff'; X.fill();
    fe(0, -30, 44, 8, '#ffb347'); fc(-14, -30, 5, '#ff9f43'); fc(8, -31, 5, '#ffd23f'); fc(22, -29, 4, '#7ed957');
    X.beginPath(); X.arc(0, -30, 44, 0, Math.PI); stroke(3, '#e6ebf0');
  }, update(it, dt) { if (Math.random() < dt) emit('steam', it.x, it.y - 40, 1); } },
  gororoba: { n: 'Gororoba', w: 90, h: 60, food: 2, onEat(c) { Chat.say(c, pick(['Eca! Que gororoba!', 'Bah, que gosto estranho!', 'Hmm... criativo!'])); }, draw() {
    fe(0, -6, 46, 9, '#e9eef5');
    X.beginPath(); X.moveTo(-36, -10); X.bezierCurveTo(-40, -40, -10, -50, 0, -40); X.bezierCurveTo(20, -56, 44, -36, 36, -10); X.closePath(); X.fillStyle = '#9bc53d'; X.fill();
    fc(-12, -30, 6, '#c3e88d'); fc(14, -36, 4, '#c3e88d'); fc(4, -22, 3, '#6b8e23');
    fc(-6, -34, 3, '#2a1d1a'); fc(8, -34, 3, '#2a1d1a');
  } },
});

const RECIPES = [
  { id: 'panqueca', n: 'Panqueca', ic: '🥞', need: ['farinha', 'egg', 'milk'], out: 'panqueca' },
  { id: 'bolo', n: 'Bolo de festa', ic: '🎂', need: ['farinha', 'egg', 'acucar'], out: 'cake' },
  { id: 'bolochoc', n: 'Bolo de chocolate', ic: '🍫', need: ['farinha', 'egg', 'acucar', 'chocolate'], out: 'chococake' },
  { id: 'cuca', n: 'Cuca da vó', ic: '🍰', need: ['farinha', 'egg', 'acucar', 'banana'], out: 'cuca' },
  { id: 'brigadeiro', n: 'Brigadeiro', ic: '🟤', need: ['chocolate', 'milk', 'acucar'], out: 'brigadeiro' },
  { id: 'salada', n: 'Salada de frutas', ic: '🥗', need: ['apple', 'banana', 'orange'], out: 'fruitsalad' },
  { id: 'vitamina', n: 'Vitamina', ic: '🥤', need: ['banana', 'milk'], out: 'vitamina' },
  { id: 'pipoca', n: 'Pipoca', ic: '🍿', need: ['milho'], out: 'popcorn' },
  { id: 'ovofrito', n: 'Ovo frito', ic: '🍳', need: ['egg'], out: 'friedegg' },
  { id: 'pao', n: 'Pão caseiro', ic: '🍞', need: ['farinha', 'milk'], out: 'bread' },
  { id: 'suco', n: 'Suco de laranja', ic: '🧃', need: ['orange'], out: 'juice' },
  { id: 'morango', n: 'Morango com chocolate', ic: '🍓', need: ['morango', 'chocolate'], out: 'chocostraw' },
  { id: 'sopa', n: 'Sopa de legumes', ic: '🍲', need: ['carrot', 'milho'], out: 'soup' },
];
const INGREDIENTS = ['farinha', 'acucar', 'chocolate', 'egg', 'milk', 'apple', 'banana', 'orange', 'carrot', 'milho', 'trigo', 'morango', 'soja', 'watermelon'];
INGREDIENTS.forEach((k) => { if (ITEMS[k]) ITEMS[k].ing = true; });
// tipos de item criados depois (lavoura) marcam a si mesmos com ing: true

function cookResult(list) {
  const set = [...new Set(list.map((t) => (t === 'trigo' ? 'farinha' : t)))].sort().join(',');
  return RECIPES.find((r) => [...r.need].sort().join(',') === set) || null;
}
// ---------- panela genérica (usada no fogão da casa e no fogão a lenha) ----------
const Pot = {
  drop(e, s) {
    if (e.kind !== 'item' || !ITEMS[e.type].ing || s.cook > 0) return false;
    s.ing = s.ing || [];
    if (s.ing.length >= 5) { UI.toast('A panela está cheia! Toque para cozinhar.'); return false; }
    s.ing.push(e.type); emit('drop', e.x, e.y - 30, 6, 1); removeEnt(e); Sfx.bloop();
    if (s.ing.length === 1) UI.toast('Coloque mais ingredientes e toque no fogão para cozinhar 🍳');
    return true;
  },
  tap(s) {
    if (!s.ing || !s.ing.length || s.cook > 0) return false;
    s.cook = 2.4; s.on = true; Sfx.brew(); return true;
  },
  update(s, dt, x, y, scene) {
    if (!(s.cook > 0)) return;
    s.cook -= dt;
    if (Math.random() < dt * 12) emit('smoke', x + rand(-20, 20), y - 60, 1);
    if (s.cook <= 0) {
      const r = cookResult(s.ing);
      const out = r ? r.out : 'gororoba';
      const it = spawnItem(out, x + rand(-50, 50), y, scene); it.level = 1;
      startFall(it, rand(-200, 200), -500);
      s.ing = []; s.cook = 0;
      Sfx.cooked(); emit('star', x, y - 80, 14);
      if (r) { UI.toast(`Você fez: ${r.n}! ${r.ic}`); Album.unlock('r_' + r.id); }
      else { UI.toast('Ih... virou gororoba! 🤢'); Album.unlock('a_gororoba'); }
    }
  },
  draw(s, t, x, y) {
    if (!(s.ing && s.ing.length) && !(s.cook > 0)) return;
    const sh = s.cook > 0 ? Math.sin(t * 40) * 2 : 0;
    fr(x - 46 + sh, y - 52, 92, 52, 14, LG(x - 46, 0, x + 46, 0, '#c9d5e0', '#9aa6b2'));
    fr(x - 52 + sh, y - 58, 104, 12, 6, '#7a8794'); fr(x - 8 + sh, y - 70, 16, 12, 5, '#5b6474');
    if (s.cook > 0) return;
    const n = s.ing.length, bw = n * 46 + 20, bx = x - bw / 2, by = y - 160;
    fr(bx, by, bw, 64, 20, 'rgba(255,255,255,.92)'); fpoly([x - 10, by + 64, x + 10, by + 64, x, by + 78], 'rgba(255,255,255,.92)');
    s.ing.forEach((k, i) => { X.save(); X.translate(bx + 33 + i * 46, by + 56); const T = ITEMS[k]; const sc2 = Math.min(0.45, 48 / Math.max(T.w, T.h)); X.scale(sc2, sc2); drawItemShape({ type: k, level: 1, v: 0 }, t); X.restore(); });
  },
};

// fogão da casa vira panela
(() => {
  const stove = SCENES.casa.props.find((p) => p.id === 'stove');
  stove.state = { on: false, ing: [], cook: 0 };
  stove.dropRect = { x: 630, y: 420, w: 220, h: 160 };
  stove.drop = (e, s) => Pot.drop(e, s);
  const tap0 = stove.tap, upd0 = stove.update, draw0 = stove.draw;
  stove.tap = (s, w, st) => (Pot.tap(s) ? true : tap0(s, w, st));
  stove.update = (s, dt, st, t) => { upd0(s, dt, st, t); Pot.update(s, dt, 735, 548, 'casa'); };
  stove.draw = (s, t, st) => { draw0(s, t, st); Pot.draw(s, t, 735, 540); };
  // potes de ingredientes na prateleira da cozinha
  SCENES.casa.props.push({ id: 'pantry', x: 846, y: 280, w: 92, h: 92,
    tap() { if (!canSpawn()) return true; const k = pick(['farinha', 'acucar', 'chocolate']); spawnItem(k, rand(560, 620), 548, 'casa'); Sfx.pop(); UI.toast(`${ITEMS[k].n} na bancada!`); return true; } });
  // prateleiras do mercado: toque para pegar produtos
  const sh = SCENES.mercado.props.find((p) => p.id === 'shelves');
  Object.assign(sh, { x: 800, y: 250, w: 600, h: 546,
    tap(s, w) {
      if (!canSpawn()) return true;
      const row = w.y < 430 ? 0 : w.y < 570 ? 1 : 2, y = [420, 560, 700][row];
      const k = pick([['farinha', 'acucar'], ['chocolate', 'cereal', 'farinha'], ['milk', 'egg', 'acucar']][row]);
      spawnItem(k, clamp(w.x, 830, 1370), y, 'mercado'); Sfx.coin(); return true;
    } });
  ITEMS.cereal.ing = false;
})();
