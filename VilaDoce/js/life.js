'use strict';
// ======================================================
//  Vida própria: necessidades, passeios, dança e amizades
// ======================================================
const Life = (() => {
  const CFG_KEY = 'vilaDoce.life';
  const cfg = { on: true };
  try { Object.assign(cfg, JSON.parse(localStorage.getItem(CFG_KEY) || '{}')); } catch (e) { /* sem armazenamento */ }
  const SPEED = 125;

  function musicOn(sid) {
    const st = G.st[sid];
    if (sid === 'casa') return st.radio && st.radio.on;
    if (sid === 'estancia') return st.radio && st.radio.on;
    if (sid === 'estudio') return st.secNeon && st.secNeon.disco > 0;
    return false;
  }
  function onFloor(e) { return !e.onSurf && !e.onEnt && e.z == null; }

  // ---------- necessidades ----------
  function needs(e, dt) {
    if (e.hunger == null) e.hunger = rand(0, 0.4);
    if (e.energy == null) e.energy = rand(0.7, 1);
    if (e.fun == null) e.fun = rand(0.5, 1);
    const k = e.scene === G.sceneId ? 1 : 0.4;
    e.hunger = clamp(e.hunger + dt * k / 260, 0, 1);
    if (e.state === 'sleep') e.energy = Math.min(1, e.energy + dt / 35);
    else e.energy = clamp(e.energy - dt * k / (G.night ? 160 : 480), 0, 1);
    let fun = -dt * k / 220;
    if (e.state === 'swing' || e.state === 'slide' || e.dancing) fun = dt / 8;
    if (typeof Chat !== 'undefined' && Chat.talking(e)) fun = dt / 10;
    if (e.state === 'held') fun = dt / 12;
    e.fun = clamp(e.fun + fun, 0, 1);
  }

  // ---------- assentos livres (cenário + móveis) ----------
  function seatsFor(sc, kinds) {
    const out = [];
    sc.seats.forEach((s, i) => {
      if (!kinds.includes(s.kind) || seatOccupied(sc.id, i)) return;
      const p = seatPos(sc, i); out.push({ ref: { i }, x: p.x, kind: s.kind });
    });
    for (const f of G.ents) {
      if (f.scene !== sc.id || f.kind !== 'item' || f.state !== 'idle' || f.heldBy) continue;
      seatsOf(ITEMS[f.type]).forEach((S_, ix) => {
        if (kinds.includes(S_.kind) && !furnSeatTaken(f, ix)) out.push({ ref: { ent: f.id, ix }, x: f.x + S_.dx, kind: S_.kind });
      });
    }
    return out;
  }
  function nearest(list, x) { return list.sort((a, b) => Math.abs(a.x - x) - Math.abs(b.x - x))[0]; }

  // ---------- decisão ----------
  function decide(e, sc) {
    const busy = typeof Chat !== 'undefined' && Chat.isBusy(e);
    if (busy) return;
    if (e.hunger > 0.7) {
      const food = G.ents.filter((f) => f.scene === sc.id && f.kind === 'item' && visible(f) && f.state === 'idle' && ITEMS[f.type].food && !ITEMS[f.type].petfood && !ITEMS[f.type].pet && f.type !== 'gororoba')
        .sort((a, b) => Math.abs(a.x - e.x) - Math.abs(b.x - e.x))[0];
      if (food) { e.goal = { type: 'eat', id: food.id, x: food.x }; return; }
    }
    if (e.energy < 0.22 || (G.night && e.energy < 0.6)) {
      const bed = nearest(seatsFor(sc, ['bed']), e.x);
      if (bed) { e.goal = { type: 'seat', ref: bed.ref, x: bed.x, kind: 'bed' }; return; }
    }
    const r = Math.random();
    if (r < 0.4) e.goal = { type: 'walk', x: clamp(e.x + rand(-500, 500), 80, sc.W - 80) };
    else if (r < 0.62) {
      const s = nearest(seatsFor(sc, ['chair', 'swing']), e.x);
      if (s && Math.abs(s.x - e.x) < 900) e.goal = { type: 'seat', ref: s.ref, x: s.x, kind: s.kind };
    } else if (r < 0.8) {
      const f = G.ents.filter((o) => o !== e && o.kind === 'char' && o.scene === sc.id && o.state !== 'held')
        .sort((a, b) => friendship(e, b) - friendship(e, a) || Math.abs(a.x - e.x) - Math.abs(b.x - e.x))[0];
      if (f) e.goal = { type: 'walk', x: clamp(f.x + (f.x > e.x ? -150 : 150), 80, sc.W - 80) };
    }
  }
  function arrive(e, sc) {
    const g = e.goal; e.goal = null; e.moving = false;
    if (g.type === 'eat') {
      const f = getEnt(g.id);
      if (f && f.state === 'idle' && visible(f) && !f.heldBy && Math.abs(f.x - e.x) < 120) { giveItem(e, f); e.autoEat = 1.2; }
    } else if (g.type === 'seat') {
      const ok = g.ref.ent != null ? (() => { const f = getEnt(g.ref.ent); return f && f.state === 'idle' && !furnSeatTaken(f, g.ref.ix || 0); })() : !seatOccupied(sc.id, g.ref.i);
      if (ok) { sitDown(e, g.ref); if (g.kind === 'bed') e.autoSleep = true; else e.autoSat = rand(10, 22); }
    }
  }
  function think(e, dt, sc) {
    e.dancing = false;
    if (e.stare > 0 || e.ghost) { e.moving = false; e.goal = null; return; }
    if (e.state === 'sit' && e.autoSat > 0) { e.autoSat -= dt; if (e.autoSat <= 0 && !(typeof Chat !== 'undefined' && Chat.isBusy(e))) { standUp(e); startFall(e, 0, 0); e.thinkT = rand(2, 5); } return; }
    if (e.state === 'sleep' && e.energy >= 0.98 && !G.night && e.autoSleep) { e.autoSleep = false; standUp(e); startFall(e, 0, 0); return; }
    if (e.state !== 'idle' || e.heldBy) { e.moving = false; e.goal = null; return; }
    if (e.autoEat > 0 && e.hold) { e.autoEat -= dt; if (e.autoEat <= 0) { takeBite(e); e.autoEat = e.hold ? 1.3 : 0; } return; }
    if (e.aiPause > 0) { e.aiPause -= dt; e.moving = false; return; }
    if (!onFloor(e)) return;
    if (musicOn(sc.id) && !e.goal) {
      e.dancing = true; e.moving = false;
      if (!e.danced) { e.danced = true; Album.unlock('a_danca'); }
      return;
    }
    e.danced = false;
    if (e.goal) {
      const dx = e.goal.x - e.x;
      if (Math.abs(dx) < 24) { arrive(e, sc); return; }
      if (typeof Chat !== 'undefined' && Chat.isBusy(e)) { e.moving = false; return; }
      e.moving = true; e.facing = Math.sign(dx);
      e.x += Math.sign(dx) * Math.min(Math.abs(dx), SPEED * dt);
      e.walkLeft = (e.walkLeft ?? 9) - dt;
      if (e.walkLeft <= 0) { e.goal = null; e.moving = false; e.walkLeft = 9; }
      return;
    }
    e.moving = false;
    e.thinkT = (e.thinkT ?? rand(2, 6)) - dt;
    if (e.thinkT <= 0) { e.thinkT = rand(5, 11); e.walkLeft = 9; decide(e, sc); }
  }
  function update(dt) {
    const sc = S();
    for (const e of G.ents) {
      if (e.kind !== 'char') continue;
      needs(e, dt);
      if (cfg.on && e.scene === sc.id) think(e, dt, sc); else { e.moving = false; e.dancing = musicOn(e.scene) && e.state === 'idle' && onFloor(e); }
    }
  }

  // ---------- amizades ----------
  const fkey = (a, b) => (a.id < b.id ? a.id + '-' + b.id : b.id + '-' + a.id);
  function friendship(a, b) { return (G.friends && G.friends[fkey(a, b)]) || 0; }
  function befriend(a, b) {
    if (!a || !b || a.kind !== 'char' || b.kind !== 'char') return;
    G.friends = G.friends || {};
    const k = fkey(a, b), v = (G.friends[k] || 0) + 1;
    G.friends[k] = Math.min(10, v);
    if (v === 5) {
      UI.toast(`${a.name} e ${b.name} agora são melhores amigos! 💞`);
      Album.unlock('a_amigos'); Sfx.yum();
    }
    if (a.scene === G.sceneId) emit('heart', (a.x + b.x) / 2, Math.min(headPos(a).y, headPos(b).y) - 60, v >= 5 ? 5 : 2);
  }
  function bestFriend(a) {
    let best = null, bv = 4;
    for (const o of G.ents) if (o !== a && o.kind === 'char') { const v = friendship(a, o); if (v > bv) { bv = v; best = o; } }
    return best;
  }

  // ---------- balões de pensamento ----------
  function drawThoughts() {
    if (!cfg.on) return;
    for (const e of G.ents) {
      if (e.kind !== 'char' || e.scene !== G.sceneId || !visible(e) || e.state === 'held' || e.say) continue;
      let ic = null;
      if (e.hunger > 0.75) ic = '🍎'; else if (e.energy < 0.2 && e.state !== 'sleep') ic = '💤'; else if (e.fun < 0.15) ic = '🎈';
      if (!ic) continue;
      const h = headPos(e), x = h.x + 70, y = h.y - 120 + Math.sin(G.t * 2 + e.id) * 5;
      fc(h.x + 38, h.y - 66, 7, '#ffffff'); fc(h.x + 52, h.y - 86, 11, '#ffffff');
      fe(x, y, 44, 36, '#ffffff'); fc(x - 26, y - 12, 18, '#ffffff'); fc(x + 24, y - 14, 20, '#ffffff');
      X.font = '38px sans-serif'; X.textAlign = 'center'; X.textBaseline = 'middle'; X.fillText(ic, x, y); X.textBaseline = 'alphabetic';
    }
  }
  function setOn(v) { cfg.on = v; try { localStorage.setItem(CFG_KEY, JSON.stringify(cfg)); } catch (e) { /* sem armazenamento */ } }
  return { update, drawThoughts, befriend, friendship, bestFriend, cfg, setOn, musicOn };
})();
