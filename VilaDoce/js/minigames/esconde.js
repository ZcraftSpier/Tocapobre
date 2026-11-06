'use strict';
// Minigame do Fliperama: Esconde-esconde
// Os moradores espiam de trás de arbustos, caixas e barris. Toque neles antes
// que se escondam de novo! Cuidado com o gato (não vale) e com toques no vazio.
Mini.addGame((K) => {
  const { FONT, burst, drawParts, end, flash, hud, pill, ring, say, sideShade, sky, vib, cast } = K;
  // a partir da fase 2 do horror (js/horror.js), algo estranho aparece neste jogo
  const creepy = () => typeof Horror !== 'undefined' && Horror.stage >= 2;
  const KINDS = ['arbusto', 'caixa', 'barril', 'arbusto', 'cerca'];
  function clone(src) { return Object.assign({}, src, { x: 0, y: 0, state: 'idle', hold: null, seat: null, seatEnt: null, sq: 0, reactT: 0, moving: false, dancing: false, ang: 0, pop: null, swing: 0, stare: 0 }); }
  function ghostLook() {
    return Object.assign(C('???', 'casa', 0, 0, { look: Object.assign(randomLook(), { skin: '#d8d6de', hairColor: '#141218', hairColor2: null, hairTip: null, shirt: '#1d1b24', pants: '#1d1b24', top: 'tee', freckles: false, back: null, neck: null }) }), { ghost: true, stare: 1e9, hat: null, face: null });
  }
  function cover(s) {
    const x = s.x, b = s.base, k = s.k;
    softShadow(x, b + 2, 90 * k, 0.25);
    if (s.kind === 'arbusto') {
      const c1 = '#5cb85c', c2 = '#6ac46a';
      fe(x, b - 40 * k, 95 * k, 50 * k, c1); fc(x - 50 * k, b - 70 * k, 45 * k, c2); fc(x + 45 * k, b - 75 * k, 48 * k, c2); fc(x, b - 95 * k, 52 * k, c1);
      for (let i = 0; i < 5; i++) fc(x - 60 * k + i * 30 * k, b - 60 * k - (i % 2) * 30 * k, 5 * k, '#ff7eb6');
    } else if (s.kind === 'caixa') {
      fr(x - 75 * k, b - 120 * k, 150 * k, 120 * k, 8 * k, '#d9a066'); RR(x - 75 * k, b - 120 * k, 150 * k, 120 * k, 8 * k); stroke(4 * k, 'rgba(58,36,40,.6)');
      line(x - 65 * k, b - 110 * k, x + 65 * k, b - 10 * k, 5 * k, '#b07a43'); line(x + 65 * k, b - 110 * k, x - 65 * k, b - 10 * k, 5 * k, '#b07a43');
    } else if (s.kind === 'barril') {
      fr(x - 60 * k, b - 125 * k, 120 * k, 125 * k, 30 * k, '#a8643a'); fe(x, b - 122 * k, 58 * k, 12 * k, '#7a4b2a');
      for (const y of [-95, -35]) fr(x - 62 * k, b + y * k, 124 * k, 10 * k, 4 * k, '#5b6474');
    } else {
      for (let i = -2; i <= 2; i++) { fr(x + i * 34 * k - 13 * k, b - 125 * k, 26 * k, 125 * k, 6 * k, '#fffaf2'); fpoly([x + i * 34 * k - 13 * k, b - 122 * k, x + i * 34 * k, b - 140 * k, x + i * 34 * k + 13 * k, b - 122 * k], '#fffaf2'); }
      fr(x - 90 * k, b - 95 * k, 180 * k, 12 * k, 5 * k, '#e6dccb'); fr(x - 90 * k, b - 40 * k, 180 * k, 12 * k, 5 * k, '#e6dccb');
    }
  }
  const topOf = (s) => s.base - (s.kind === 'arbusto' ? 140 : s.kind === 'cerca' ? 130 : 122) * s.k;
  return ({
    id: 'esconde', n: 'Esconde-esconde', ic: '🙈', col: '#bfe8a8', per: 3,
    help: 'Os moradores espiam de trás das coisas: toque neles antes que se escondam! Achar rápido vale mais. O gato não conta, e tocar no vazio custa 2 segundos.',
    stars: [10, 18, 28],
    start() {
      const L = cast(), who = L.length ? L : [C('Lia', 'casa', 0, 0)];
      const spots = [];
      [[0.18, 640, 0.8], [0.5, 640, 0.8], [0.82, 640, 0.8], [0.33, 900, 1], [0.67, 900, 1]].forEach(([u, base, k], i) => spots.push({ x: K.AX + K.AW * u, base, k, kind: KINDS[i], busy: false }));
      return { spots, who: who.map(clone), peeks: [], score: 0, time: 45, el: 0, next: 1, joyT: 0, ghostCD: 6 };
    },
    spawn(g) {
      const free = g.spots.filter((s) => !s.busy); if (!free.length) return;
      const s = pick(free); s.busy = true;
      const lvl = Math.min(1, g.el / 40), r = Math.random();
      let kind = 'gente', who = pick(g.who);
      if (creepy() && g.ghostCD <= 0 && r < 0.18) { kind = 'fantasma'; who = ghostLook(); g.ghostCD = rand(8, 14); }
      else if (r < 0.22) kind = 'gato';
      g.peeks.push({ s, kind, who, p: 0, st: 'up', hold: kind === 'fantasma' ? 2.2 : lerp(1.25, 0.55, lvl) * rand(0.85, 1.15), hT: 0 });
    },
    headAt(pk) { const s = pk.s, sc = 0.48 * s.k; return { x: s.x, y: topOf(s) - 20 * sc + (1 - pk.p) * 150 * sc, r: 105 * sc }; },
    tap(g, x, y) {
      for (const pk of g.peeks) {
        if (pk.st === 'found' || pk.p < 0.35) continue;
        const h = this.headAt(pk);
        if (Math.hypot(x - h.x, y - h.y) > h.r) continue;
        if (pk.kind === 'gato') { g.time -= 2; Sfx.meow ? Sfx.meow() : Sfx.squeak(); say(h.x, h.y - 60, 'É o gato! -2s', '#ff9f43'); pk.st = 'down'; vib(30); return; }
        if (pk.kind === 'fantasma') {
          g.time -= 3; pk.st = 'down'; Sfx.sting ? Sfx.sting() : Sfx.squeak(); flash('#05040a', 0.35); vib(80); K.shake = 0.25;
          say(h.x, h.y - 60, 'Achei você.', '#c9ced8'); return;
        }
        const quick = pk.st === 'up' || pk.hT < 0.35, pts = quick ? 2 : 1;
        g.score += pts; g.joyT = 0.4; pk.st = 'found'; pk.hT = 0; pk.who.reactT = 1;
        Sfx.ding(); Sfx.giggle && Sfx.giggle(); vib(15);
        burst(h.x, h.y, 12, ['#ffd23f', '#ff8fbd', '#7ed957', '#fff'], 380); ring(h.x, h.y, '#ffd23f', 90);
        say(h.x, h.y - 70, quick ? `Achei! +2` : 'Achei!', quick ? '#ffd23f' : '#fff');
        return;
      }
      // tocou no vazio
      g.time -= 2; Sfx.drop(0.3); say(x, y - 30, '-2s', '#ff6b6b'); vib(20);
    },
    update(g, dt) {
      g.el += dt; g.time -= dt; g.joyT -= dt; g.ghostCD -= dt;
      if (g.time <= 0) { g.time = 0; return end(); }
      g.next -= dt;
      const lvl = Math.min(1, g.el / 40), maxP = lvl > 0.5 ? 3 : 2;
      if (g.next <= 0 && g.peeks.length < maxP) { g.next = lerp(1.2, 0.55, lvl) * rand(0.8, 1.2); this.spawn(g); }
      for (const pk of g.peeks) {
        if (pk.st === 'up') { pk.p = Math.min(1, pk.p + dt * (pk.kind === 'fantasma' ? 1.5 : 6)); if (pk.p >= 1) { pk.st = 'hold'; pk.hT = 0; } }
        else if (pk.st === 'hold') { pk.hT += dt; if (pk.hT >= pk.hold) pk.st = 'down'; }
        else if (pk.st === 'found') { pk.hT += dt; pk.p = 1 + Math.sin(Math.min(1, pk.hT / 0.35) * Math.PI) * 0.25; if (pk.hT > 0.45) pk.st = 'down'; }
        else { pk.p -= dt * 7; if (pk.p <= 0) { pk.done = true; pk.s.busy = false; } }
      }
      g.peeks = g.peeks.filter((pk) => !pk.done);
    },
    drawPeek(pk) {
      const s = pk.s, sc = 0.48 * s.k, top = topOf(s), feet = top + 262 * sc + (1 - Math.min(1, pk.p)) * 150 * sc - Math.max(0, pk.p - 1) * 120 * sc;
      X.save(); X.beginPath(); X.rect(s.x - 200, -100, 400, s.base - 30 * s.k + 100); X.clip();
      if (pk.kind === 'gato') {
        const y = feet - 262 * sc;
        fpoly([s.x - 40 * s.k, y - 20 * s.k, s.x - 30 * s.k, y - 70 * s.k, s.x - 8 * s.k, y - 34 * s.k], '#ff9f43'); fpoly([s.x + 40 * s.k, y - 20 * s.k, s.x + 30 * s.k, y - 70 * s.k, s.x + 8 * s.k, y - 34 * s.k], '#ff9f43');
        fc(s.x, y, 44 * s.k, '#ff9f43'); fc(s.x - 15 * s.k, y - 4 * s.k, 5 * s.k, '#2a1d1a'); fc(s.x + 15 * s.k, y - 4 * s.k, 5 * s.k, '#2a1d1a'); fe(s.x, y + 10 * s.k, 6 * s.k, 4 * s.k, '#ff5d8f');
      } else {
        X.save(); X.translate(s.x, feet); X.scale(sc, sc); drawChar(pk.who, K.t, true); X.restore();
      }
      X.restore();
    },
    draw(g) {
      // quintal da vila (anoitece devagar no horror)
      sky(creepy() ? '#7a6aa8' : '#9fdcff', creepy() ? '#ffd0b0' : '#fff4e6');
      fe(K.VW * 0.25, 640, K.VW * 0.5, 120, '#a6df8f'); fe(K.VW * 0.8, 650, K.VW * 0.55, 140, '#8fd37a');
      fr(-20, 600, K.VW + 40, 420, 0, '#8fdc7a'); fr(-20, 600, K.VW + 40, 8, 0, '#78c766');
      for (let i = 0; i < 30; i++) fc(srand(i) * K.VW, 660 + srand(i + 4) * 330, 3, 'rgba(60,140,50,.35)');
      sideShade();
      // fileira de trás, depois a da frente (quem espia fica atrás do esconderijo)
      for (const row of [640, 900]) for (const s of g.spots) {
        if (s.base !== row) continue;
        for (const pk of g.peeks) if (pk.s === s) this.drawPeek(pk);
        cover(s);
      }
      drawParts();
      hud(String(g.score), `⏱ ${Math.ceil(g.time)}`);
      if (g.el < 3) pill(K.VW / 2, 250, Math.min(K.AW - 40, 460), 48, 'Toque em quem aparecer!', '#4ea83c');
    },
    reward(g) { return Math.floor(g.score / this.per); },
  });
});
