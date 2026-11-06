'use strict';
// ======================================================
//  Conversas: personagens batem papo com balões e vozes "animalês"
// ======================================================
const Chat = (() => {
  const CFG_KEY = 'vilaDoce.cfg';
  const cfg = { chat: true, voices: true };
  try { Object.assign(cfg, JSON.parse(localStorage.getItem(CFG_KEY) || '{}')); } catch (e) { /* sem armazenamento */ }
  const LETTER = 0.058, HOLD = 1.5;
  let talks = [], cd = 3, heard = 0;

  const lower = (s) => s.charAt(0).toLowerCase() + s.slice(1);
  function voiceOf(e) {
    if (e.voice) return +e.voice;
    let h = 0; for (const ch of e.name || 'x') h = (h * 31 + ch.charCodeAt(0)) % 997;
    return 0.8 + (h % 70) / 100;
  }
  function busy(e) { return talks.some((k) => k.a === e || k.b === e); }
  function free(e) {
    return e && !e.ghost && !(e.stare > 0) && e.scene === G.sceneId && byId.has(e.id) && !e.heldBy && ['idle', 'sit', 'swing'].includes(e.state);
  }
  function say(e, text) {
    if (!cfg.chat) return 0;
    const dur = text.length * LETTER + 0.25;
    e.say = { text, t: 0, dur };
    if (e.scene === G.sceneId) {
      if (e.type === 'pet') petSound(e.species);
      else Sfx.speak(text, voiceOf(e));
    }
    return dur;
  }

  // ---------- roteiros ----------
  // transforma "A:fala|B:resposta" em [[quem, texto], ...], evitando repetir os recentes
  const recent = [];
  function parse(src, a, b) {
    return src.split('|').map((l) => [l[0] === 'A' ? a : b, l.slice(2).replace(/\{A\}/g, a.name).replace(/\{B\}/g, b.name)]);
  }
  function fresh(list) {
    const ok = list.filter((s) => !recent.includes(s));
    const s = pick(ok.length ? ok : list);
    recent.push(s); if (recent.length > 40) recent.shift();
    return s;
  }
  function weighted(pairs) {
    const tot = pairs.reduce((s, p) => s + p[0], 0);
    let r = Math.random() * tot;
    for (const [w, f] of pairs) { if ((r -= w) <= 0) return f; }
    return pairs[pairs.length - 1][1];
  }
  function script(a, b) {
    const pool = [
      [4, () => parse(fresh(DIALOGS.geral), a, b)],
      [3, () => parse(fresh(DIALOGS.regiao), a, b)],
    ];
    const pl = DIALOGS.lugares[a.scene];
    if (pl) pool.push([3.5, () => parse(fresh(pl), a, b)]);
    if (G.night) pool.push([3, () => parse(fresh(DIALOGS.noite), a, b)]);
    if (Life.friendship(a, b) >= 5) pool.push([3, () => parse(fresh(DIALOGS.amigos), a, b)]);
    const fest = typeof Weather !== 'undefined' && Weather.festival();
    if (fest && DIALOGS.festas[fest]) pool.push([4, () => parse(fresh(DIALOGS.festas[fest]), a, b)]);
    const wx = typeof Weather !== 'undefined' && Weather.visibleKind();
    if (wx && DIALOGS.clima[wx]) pool.push([4, () => parse(fresh(DIALOGS.clima[wx]), a, b)]);
    if (DIALOGS.estacao[typeof Weather !== 'undefined' ? Weather.season() : '']) pool.push([1, () => parse(fresh(DIALOGS.estacao[Weather.season()]), a, b)]);
    const opts = [];
    if (b.hat && WEAR[b.hat]) opts.push(() => [[a, `Adorei ${b.hat === 'crown' || b.hat === 'tiara' ? 'sua' : 'seu'} ${lower(WEAR[b.hat].n)}!`], [b, pick(['Obrigado! Peguei no Estúdio.', 'Valeu! Combina comigo, né?'])]]);
    if (LONG_GOWNS.has(b.top)) opts.push(() => [[a, 'Que vestido lindo!'], [b, 'Parece de princesa, né?'], [a, 'Parece mesmo!']]);
    if ((b.bottom || '') === 'mermaid') opts.push(() => [[a, 'Você é uma sereia de verdade?'], [b, 'Shhh... é segredo!']]);
    const held = a.hold && getEnt(a.hold);
    if (held && ITEMS[held.type].food && !ITEMS[held.type].petfood) opts.push(() => [[a, `Quer um pedaço de ${lower(ITEMS[held.type].n)}?`], [b, pick(['Sim, por favor!', 'Hmm, quero!', 'Não, obrigado!'])]]);
    const pet = G.ents.find((e) => e.type === 'pet' && e.scene === a.scene && Math.abs(e.x - a.x) < 700 && !e.heldBy);
    const bark = pet ? (pet.species === 'dog' ? 'Au au! 🐾' : pet.species === 'cat' ? 'Miau! 🐾' : 'Hihi! 🐾') : '';
    if (pet) {
      opts.push(() => [[a, `${pet.name} é muito fofo!`], [pet, bark], [b, 'Concordou! Haha!']]);
      opts.push(() => [[a, `Vem cá, ${pet.name}!`], [pet, bark], [b, `${pet.name} te adora!`]]);
      opts.push(() => [[a, `Já deu comida pro ${pet.name}?`], [b, 'Ainda não! Vou pegar a ração.'], [pet, bark]]);
    }
    if (opts.length) pool.push([2.5, () => pick(opts)()]);
    return weighted(pool)();
  }

  function start(a, b, lines) {
    if (!cfg.chat || busy(a) || busy(b)) return;
    talks.push({ a, b, lines: lines || script(a, b), i: -1, wait: 0.15 });
    a.talkWith = b.id; b.talkWith = a.id;
  }
  function end(k) {
    talks = talks.filter((x) => x !== k);
    for (const e of [k.a, k.b]) { e.talkWith = null; e.talkCD = rand(6, 12); }
  }

  // ---------- atualização ----------
  function update(dt) {
    for (const e of G.ents) if (e.say) { e.say.t += dt; if (e.say.t > e.say.dur + HOLD) e.say = null; }
    for (const e of G.ents) if (e.talkCD) e.talkCD = Math.max(0, e.talkCD - dt);
    if (!cfg.chat) { if (talks.length) talks.slice().forEach(end); return; }
    for (const k of talks.slice()) {
      if (!free(k.a) || !free(k.b) || k.a.scene !== k.b.scene) { end(k); continue; }
      k.wait -= dt;
      if (k.wait > 0) continue;
      k.i++;
      if (k.i >= k.lines.length) {
        if (k.a.kind === 'char' && k.b.kind === 'char') Life.befriend(k.a, k.b);
        heard++; if (heard >= 30) Album.unlock('a_papo');
        end(k); continue;
      }
      const [who, text] = k.lines[k.i];
      if (!byId.has(who.id)) { end(k); continue; }
      k.wait = say(who, text) + 0.45;
      if (who.kind === 'char') who.reactT = 0;
    }
    cd -= dt;
    if (cd <= 0 && talks.length < 2) {
      cd = rand(3, 7);
      const cs = G.ents.filter((e) => e.kind === 'char' && free(e) && !busy(e) && !e.talkCD);
      const pairs = [];
      for (let i = 0; i < cs.length; i++) for (let j = i + 1; j < cs.length; j++) {
        if (Math.abs(cs[i].x - cs[j].x) < 560) pairs.push([cs[i], cs[j]]);
      }
      if (pairs.length) { const [a, b] = pick(pairs); Math.random() < 0.5 ? start(a, b) : start(b, a); }
    }
  }
  // soltar alguém perto de outro personagem: eles se cumprimentam
  function onDrop(e) {
    if (!cfg.chat || e.kind !== 'char' || busy(e)) return;
    const other = G.ents.filter((o) => o !== e && o.kind === 'char' && free(o) && !busy(o) && Math.abs(o.x - e.x) < 380)
      .sort((p, q) => Math.abs(p.x - e.x) - Math.abs(q.x - e.x))[0];
    if (other) start(e, other, parse(fresh(DIALOGS.chegada), e, other));
  }
  function tapLine(e) {
    if (!cfg.chat || busy(e)) return false;
    say(e, pick(DIALOGS.toque));
    return true;
  }

  // ---------- balões ----------
  function wrap(text, maxW) {
    const words = text.split(' '), lines = [];
    let cur = '';
    for (const w of words) { const tst = cur ? cur + ' ' + w : w; if (X.measureText(tst).width > maxW && cur) { lines.push(cur); cur = w; } else cur = tst; }
    if (cur) lines.push(cur);
    return lines;
  }
  function draw() {
    const camX = G.cam[G.sceneId];
    for (const e of G.ents) {
      if (!e.say || e.scene !== G.sceneId || e.heldBy || !visible(e)) continue;
      const s = e.say;
      const a = clamp((s.dur + HOLD - s.t) / 0.35, 0, 1), pop = Math.min(1, s.t * 7);
      const hp = e.kind === 'char' ? headPos(e) : { x: e.x, y: e.y - 110 };
      const anchorY = hp.y - (e.kind === 'char' ? 100 : 40);
      X.font = '600 30px Fredoka, sans-serif';
      const lines = wrap(s.text, 330);
      const bw = Math.max(...lines.map((l) => X.measureText(l).width)) + 44, bh = lines.length * 38 + 26;
      const bx = clamp(hp.x, camX + bw / 2 + 12, camX + VW - bw / 2 - 12), by = anchorY - 22;
      X.save(); X.globalAlpha = a;
      X.translate(hp.x, anchorY); X.scale(easeOutBack(pop), easeOutBack(pop)); X.translate(-hp.x, -anchorY);
      fr(bx - bw / 2 + 4, by - bh + 6, bw, bh, 24, 'rgba(60,30,80,.16)');
      fpoly([hp.x - 14, by - 2, hp.x + 14, by - 2, hp.x, by + 20], '#ffffff');
      fr(bx - bw / 2, by - bh, bw, bh, 24, '#ffffff');
      let shown = Math.ceil(s.t / LETTER);
      X.fillStyle = '#3a2f4a'; X.textAlign = 'left'; X.textBaseline = 'middle';
      lines.forEach((l, i) => {
        const part = l.slice(0, Math.max(0, shown)); shown -= l.length + 1;
        X.fillText(part, bx - X.measureText(l).width / 2, by - bh + 32 + i * 38);
      });
      X.textBaseline = 'alphabetic';
      X.restore();
    }
  }
  function talking(e) { return !!(e.say && e.say.t < e.say.dur); }
  function setCfg(k, v) {
    cfg[k] = v; Sfx.setVoices(cfg.voices);
    try { localStorage.setItem(CFG_KEY, JSON.stringify(cfg)); } catch (e) { /* sem armazenamento */ }
  }
  Sfx.setVoices(cfg.voices);
  return { update, draw, onDrop, tapLine, talking, voiceOf, say, cfg, setCfg, isBusy: busy, _script: script };
})();
