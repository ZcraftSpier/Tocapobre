'use strict';
// Minigame do Fliperama: Pega-vagalume
// À noite, no campo: toque nos vagalumes enquanto estão ACESOS para guardar no pote.
// Apagados eles fogem. O dourado vale mais; o pernilongo pica (-3 s). 45 segundos.
Mini.addGame((K) => {
  const { FONT, burst, drawHero, drawParts, end, flash, hud, pill, ring, say, sideShade, sky, vib } = K;
  // a partir da fase 2 do horror (js/horror.js), algo estranho aparece neste jogo
  const creepy = () => typeof Horror !== 'undefined' && Horror.stage >= 2;
  const ESCALA = [523.25, 587.33, 659.25, 783.99, 880, 1046.5, 1174.66, 1318.51];
  const lit = (f) => f.kind === 'mosquito' || f.kind === 'olhos' ? f.kind === 'olhos' && Math.sin(K.t * 1.3 + f.ph) > -0.6 : Math.sin(K.t * f.sp + f.ph) > 0.15;
  return ({
    id: 'vagalume', n: 'Pega-vagalume', ic: '✨', col: '#b9a6ff', per: 6,
    help: 'Toque nos vagalumes quando estiverem ACESOS para guardar no pote! Apagados eles fogem. O dourado vale 5. Cuidado com o pernilongo: picada tira 3 segundos.',
    stars: [20, 40, 65],
    start() { return { flies: [], jar: [], fly: [], score: 0, time: 45, el: 0, combo: 0, comboT: 0, joyT: 0, eyesCD: 8 }; },
    jarPos() { return { x: K.AX + K.AW - 90, y: 880 }; },
    spawn(g) {
      const r = Math.random(), kind = r < 0.07 ? 'ouro' : r < 0.17 && g.el > 6 ? 'mosquito' : 'n';
      const side = Math.random() < 0.5;
      g.flies.push({ kind, x: side ? K.AX - 20 : K.AX + K.AW + 20, y: rand(260, 780), vx: (side ? 1 : -1) * rand(40, 90), vy: rand(-30, 30), ph: rand(0, TAU), sp: kind === 'ouro' ? rand(5, 7) : rand(2.2, 3.6), flee: 0 });
    },
    tap(g, x, y) {
      let best = null, bd = 70;
      for (const f of g.flies) { const d = Math.hypot(f.x - x, f.y - y); if (d < bd && !f.flee && !f.gone) { bd = d; best = f; } }
      if (!best) return;
      const f = best;
      if (f.kind === 'olhos') {
        f.gone = true; g.time -= 3; g.combo = 0; Sfx.sting ? Sfx.sting() : Sfx.squeak(); flash('#05040a', 0.35); vib(80); K.shake = 0.25;
        say(f.x, f.y - 50, 'Achei você.', '#c9ced8'); return;
      }
      if (f.kind === 'mosquito') { f.gone = true; g.time -= 3; g.combo = 0; Sfx.squeak(); vib(50); flash('#ff6b6b', 0.15); say(f.x, f.y - 40, 'Ai! -3s', '#ff6b6b'); return; }
      if (!lit(f)) { f.flee = 1; f.vx = (f.x > x ? 1 : -1) * 520; f.vy = -260; g.combo = 0; Sfx.whoosh(); say(f.x, f.y - 40, 'Escapou!', '#c9ced8'); return; }
      // pegou: ele voa até o pote
      f.gone = true; g.combo++; g.comboT = 1.5; g.joyT = 0.4;
      const mult = g.combo >= 10 ? 3 : g.combo >= 5 ? 2 : 1, pts = (f.kind === 'ouro' ? 5 : 1) * mult;
      g.score += pts;
      Sfx.note(ESCALA[Math.min(g.combo - 1, ESCALA.length - 1)]); vib(10);
      if (f.kind === 'ouro') { Sfx.sparkle(); ring(f.x, f.y, '#ffd23f', 90); }
      burst(f.x, f.y, 6, f.kind === 'ouro' ? ['#ffd23f', '#fff6c4'] : ['#fff6a0', '#e8ff9a'], 200);
      say(f.x, f.y - 40, `+${pts}`, mult > 1 ? '#ffd23f' : '#fff6c4');
      if (mult > 1 && (g.combo === 5 || g.combo === 10)) { say(K.AX + K.AW / 2, 300, `x${mult}!`, '#ffd23f'); Sfx.ding(); }
      g.fly.push({ x: f.x, y: f.y, t: 0, ouro: f.kind === 'ouro' });
    },
    update(g, dt) {
      g.el += dt; g.time -= dt; g.joyT -= dt; g.eyesCD -= dt;
      if (g.time <= 0) { g.time = 0; return end(); }
      g.comboT -= dt; if (g.comboT <= 0) g.combo = 0;
      const want = 7 + Math.min(5, Math.floor(g.el / 8));
      if (g.flies.filter((f) => !f.gone && f.kind !== 'olhos').length < want && Math.random() < dt * 4) this.spawn(g);
      // horror: um par de "vagalumes" parados no mato, que piscam juntos
      if (creepy() && g.eyesCD <= 0 && !g.flies.some((f) => f.kind === 'olhos')) {
        g.eyesCD = rand(9, 15);
        g.flies.push({ kind: 'olhos', x: K.AX + rand(80, K.AW - 80), y: rand(700, 790), vx: 0, vy: 0, ph: rand(0, TAU), sp: 0, life: rand(5, 8) });
      }
      for (const f of g.flies) {
        if (f.kind === 'olhos') { f.life -= dt; if (f.life <= 0) f.gone = true; continue; }
        if (!f.flee) {
          f.vx += rand(-80, 80) * dt; f.vy += rand(-80, 80) * dt;
          const sp = Math.hypot(f.vx, f.vy), max = f.kind === 'mosquito' ? 150 : 110;
          if (sp > max) { f.vx *= max / sp; f.vy *= max / sp; }
          if (f.y < 240) f.vy += 60 * dt; if (f.y > 790) f.vy -= 60 * dt;
        }
        f.x += f.vx * dt; f.y += f.vy * dt;
        if (f.x < K.AX - 140 || f.x > K.AX + K.AW + 140 || f.y < -60) f.gone = true;
      }
      g.flies = g.flies.filter((f) => !f.gone);
      // vagalumes voando até o pote
      const J = this.jarPos();
      for (const v of g.fly) { v.t += dt * 1.8; if (v.t >= 1) { v.done = true; g.jar.push({ ph: rand(0, TAU), ouro: v.ouro, x: rand(-26, 26), y: rand(-40, 30) }); if (g.jar.length > 60) g.jar.shift(); } }
      g.fly = g.fly.filter((v) => !v.done);
      void J;
    },
    glow(x, y, r, a, col) { X.fillStyle = RG(x, y, 0, r, `rgba(${col},${a})`, `rgba(${col},0)`); X.fillRect(x - r, y - r, r * 2, r * 2); },
    draw(g) {
      // céu da noite, lua, estrelas e silhuetas de árvores
      sky('#0d1538', '#3a2a6a');
      for (let i = 0; i < 50; i++) { X.globalAlpha = 0.4 + 0.4 * Math.sin(K.t * 2 + i); fc(srand(i) * K.VW, srand(i + 7) * 520, 1.2 + srand(i + 3) * 1.8, '#fff6d0'); }
      X.globalAlpha = 1; fc(K.AX + K.AW * 0.78, 150, 46, '#fff6d0'); fc(K.AX + K.AW * 0.78 + 16, 140, 40, '#1a1f4a');
      X.fillStyle = '#141a3a'; X.beginPath(); X.moveTo(-20, 640);
      for (let x = -20; x <= K.VW + 40; x += 60) X.lineTo(x, 600 - Math.abs(Math.sin(x * 0.013)) * 110 - srand(x) * 40);
      X.lineTo(K.VW + 40, 1020); X.lineTo(-20, 1020); X.closePath(); X.fill();
      fr(-20, 800, K.VW + 40, 240, 0, '#1d2a3a');
      sideShade();
      // vagalumes
      for (const f of g.flies) {
        if (f.kind === 'olhos') {
          if (!lit(f)) continue;
          for (const dx of [-11, 11]) { this.glow(f.x + dx, f.y, 16, 0.55, '255,240,190'); fc(f.x + dx, f.y, 3.2, '#fff6d0'); }
          continue;
        }
        if (f.kind === 'mosquito') {
          const w = Math.sin(K.t * 60) * 5;
          fe(f.x, f.y, 9, 5, '#6b6478'); line(f.x + 8, f.y, f.x + 20, f.y + 2, 2, '#6b6478');
          fe(f.x - 2, f.y - 6 - w * 0.4, 8, 4, 'rgba(220,220,240,.6)', -0.4); fe(f.x + 3, f.y - 6 + w * 0.4, 8, 4, 'rgba(220,220,240,.6)', 0.4);
          continue;
        }
        const on = lit(f), col = f.kind === 'ouro' ? '255,210,60' : '230,255,140';
        if (on) { this.glow(f.x, f.y, f.kind === 'ouro' ? 46 : 34, 0.65, col); fc(f.x, f.y, 6, f.kind === 'ouro' ? '#ffe27a' : '#f4ffb0'); }
        else fc(f.x, f.y, 4, 'rgba(120,130,90,.8)');
        const w = Math.sin(K.t * 40 + f.ph) * 3;
        fe(f.x - 4, f.y - 4 - w, 5, 3, 'rgba(255,255,255,.35)', -0.5); fe(f.x + 4, f.y - 4 + w, 5, 3, 'rgba(255,255,255,.35)', 0.5);
      }
      // pote de vidro (enche de luzinhas)
      const J = this.jarPos();
      for (const v of g.fly) { const k = v.t, x = lerp(v.x, J.x, k), y = lerp(v.y, J.y - 20, k) - Math.sin(k * Math.PI) * 80; this.glow(x, y, 26, 0.7, v.ouro ? '255,210,60' : '230,255,140'); fc(x, y, 5, '#f4ffb0'); }
      fr(J.x - 46, J.y - 70, 92, 110, 20, 'rgba(200,230,255,.18)');
      for (const j of g.jar) { const a = 0.4 + 0.4 * Math.sin(K.t * 3 + j.ph); this.glow(J.x + j.x, J.y + j.y, 14, a, j.ouro ? '255,210,60' : '230,255,140'); fc(J.x + j.x, J.y + j.y, 2.5, '#f4ffb0'); }
      RR(J.x - 46, J.y - 70, 92, 110, 20); stroke(4, 'rgba(220,240,255,.7)');
      fr(J.x - 40, J.y - 84, 80, 18, 6, '#a0754d');
      fr(J.x - 30, J.y - 52, 10, 70, 5, 'rgba(255,255,255,.25)');
      // você, no canto, olhando
      drawHero(K.AX + 70, 960, 0.32, { joy: g.joyT > 0 });
      // mato na frente (balança)
      for (let i = 0; i < Math.ceil(K.VW / 26) + 2; i++) { const x = i * 26 - 10, h = 40 + srand(i) * 50, sw = Math.sin(K.t * 1.5 + i * 0.7) * 6; X.beginPath(); X.moveTo(x, 1000); X.quadraticCurveTo(x + sw, 1000 - h * 0.5, x + sw * 2, 1000 - h); stroke(5, '#26384a'); }
      drawParts();
      hud(String(g.score), `⏱ ${Math.ceil(g.time)}`);
      if (g.combo >= 5) pill(K.VW / 2, 178, 110, 40, `x${g.combo >= 10 ? 3 : 2}`, '#ff5f9e');
      if (g.el < 3) pill(K.VW / 2, 250, Math.min(K.AW - 40, 460), 48, 'Toque nos vagalumes acesos!', '#6b4fd0');
    },
    reward(g) { return Math.floor(g.score / this.per); },
  });
});
