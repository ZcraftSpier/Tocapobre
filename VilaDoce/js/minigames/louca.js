'use strict';
// Minigame do Fliperama: Lava-louça
// Esfregue a sujeira dos pratos arrastando o dedo (a esponja segue o dedo).
// Quando o prato fica limpinho ele brilha e vem o próximo, mais sujo. 45 segundos,
// e cada prato limpo dá +3 segundos.
Mini.addGame((K) => {
  const { FONT, burst, drawParts, end, flash, hud, pill, ring, say, sideShade, sky, vib } = K;
  // a partir da fase 2 do horror (js/horror.js), algo estranho aparece neste jogo
  const creepy = () => typeof Horror !== 'undefined' && Horror.stage >= 2;
  const N = 256;                                      // resolução da camada de sujeira
  const LOUCAS = [
    { n: 'Prato', base: '#ffffff', rim: '#7fb8e8' }, { n: 'Prato de florzinha', base: '#fff8f0', rim: '#ff9ec4', flores: true },
    { n: 'Prato fundo', base: '#f4fbff', rim: '#7ed1c8', fundo: true }, { n: 'Pratinho de bolo', base: '#fffbe8', rim: '#ffd23f' },
  ];
  const SUJEIRA = [['#c0392b', 'molho'], ['#7a4a2a', 'chocolate'], ['#5c8a3a', 'espinafre'], ['#e8b030', 'gema'], ['#8a4a26', 'feijão']];
  const RECADOS = ['ME AJUDA', 'SOCORRO', 'NÃO SAIA'];
  function novaSujeira(g) {
    const c = g.dirt || document.createElement('canvas'); c.width = c.height = N;
    const d = c.getContext('2d'); d.clearRect(0, 0, N, N);
    d.save(); d.beginPath(); d.arc(N / 2, N / 2, N / 2 - 2, 0, TAU); d.clip();
    const lvl = g.score, blobs = 5 + Math.min(10, lvl);
    for (let i = 0; i < blobs; i++) {
      const [col] = pick(SUJEIRA), a = rand(0, TAU), r = rand(0, N * 0.36), x = N / 2 + Math.cos(a) * r, y = N / 2 + Math.sin(a) * r;
      d.fillStyle = col; d.globalAlpha = rand(0.8, 0.95);
      for (let k = 0; k < 5; k++) { d.beginPath(); d.arc(x + rand(-18, 18), y + rand(-18, 18), rand(10, 26 + lvl), 0, TAU); d.fill(); }
      if (Math.random() < 0.5) { d.lineCap = 'round'; d.lineWidth = rand(10, 18); d.strokeStyle = col; d.beginPath(); d.moveTo(x, y); d.quadraticCurveTo(x + rand(-60, 60), y + rand(-60, 60), x + rand(-80, 80), y + rand(-80, 80)); d.stroke(); }
    }
    d.globalAlpha = 0.9; d.fillStyle = '#d8b07a';
    for (let i = 0; i < 40 + lvl * 4; i++) { d.beginPath(); d.arc(rand(20, N - 20), rand(20, N - 20), rand(2, 4), 0, TAU); d.fill(); }   // farelos
    d.restore();
    g.dirt = c; g.dctx = d; g.total = contaSujeira(g) || 1; g.left = 1;
    g.loucaT = LOUCAS[g.score % LOUCAS.length];
    g.recado = creepy() && g.score > 0 && Math.random() < 0.3 ? pick(RECADOS) : null;
  }
  function contaSujeira(g) {
    const px = g.dctx.getImageData(0, 0, N, N).data; let n = 0;
    for (let i = 3; i < px.length; i += 4) if (px[i] > 40) n++;
    return n;
  }
  return ({
    id: 'louca', n: 'Lava-louça', ic: '🧽', col: '#bfeaff', per: 1,
    help: 'Arraste o dedo para esfregar a sujeira com a esponja! Quando o prato ficar limpinho, vem o próximo. Cada prato limpo dá +3 segundos.',
    stars: [4, 8, 13],
    start() { const g = { score: 0, time: 45, dirt: null, last: null, checkT: 0, scrubT: 0, shine: 0, slide: 0, joyT: 0, moved: false }; novaSujeira(g); return g; },
    geo() { return { cx: K.AX + K.AW / 2, cy: 520, r: Math.min(K.AW * 0.42, 290) }; },
    // esfrega do ponto a até b (coordenadas do jogo)
    scrub(g, a, b) {
      const { cx, cy, r } = this.geo(), k = N / (2 * r), d = g.dctx;
      const toU = (p) => [(p.x - (cx - r)) * k, (p.y - (cy - r)) * k];
      const [u0, v0] = toU(a), [u1, v1] = toU(b), dist = Math.hypot(u1 - u0, v1 - v0), steps = Math.max(1, Math.ceil(dist / 5));
      d.save(); d.globalCompositeOperation = 'destination-out'; d.globalAlpha = 0.5; d.fillStyle = '#000';
      for (let i = 0; i <= steps; i++) { const t2 = i / steps; d.beginPath(); d.arc(u0 + (u1 - u0) * t2, v0 + (v1 - v0) * t2, 20, 0, TAU); d.fill(); }
      d.restore();
      g.moved = true;
    },
    update(g, dt) {
      g.time -= dt; g.joyT -= dt;
      if (g.time <= 0) { g.time = 0; return end(); }
      if (g.slide > 0) { g.slide -= dt; if (g.slide <= 0) { novaSujeira(g); g.last = null; } return; }
      const p = K.ptr, { cx, cy, r } = this.geo();
      if (p && p.down && g.shine <= 0) {
        const cur = { x: p.x, y: p.y };
        if (g.last && Math.hypot(cur.x - cx, cur.y - cy) < r + 40) {
          const mv = Math.hypot(cur.x - g.last.x, cur.y - g.last.y);
          if (mv > 0.5) {
            this.scrub(g, g.last, cur);
            g.scrubT -= dt;
            if (g.scrubT <= 0 && mv > 3) { g.scrubT = 0.16; Sfx.chalk(); vib(4); }
            if (Math.random() < Math.min(0.9, mv / 25)) burst(cur.x + rand(-20, 20), cur.y + rand(-20, 20), 1, ['#ffffff', '#e8f6ff', '#d6efff'], 90);
            if (Math.random() < 0.04) Sfx.bloop();
          }
        }
        g.last = cur;
      } else g.last = null;
      // mede quanto ainda está sujo
      g.checkT -= dt;
      if (g.moved && g.checkT <= 0) {
        g.checkT = 0.15; g.moved = false;
        g.left = contaSujeira(g) / g.total;
        if (g.left < 0.05 && g.shine <= 0) {
          g.dctx.clearRect(0, 0, N, N); g.left = 0;
          g.shine = 0.9; g.score++; g.time += 3; g.joyT = 0.6;
          Sfx.sparkle(); Sfx.ding(); vib(25); ring(cx, cy, '#ffffff', r * 0.9); burst(cx, cy - r * 0.4, 18, ['#ffffff', '#bfeaff', '#ffd23f'], 420);
          say(cx, cy - r - 30, g.recado ? '...' : pick(['Brilhando!', 'Limpinho!', 'Que brilho!']), g.recado ? '#c9ced8' : '#ffd23f');
          say(K.VW / 2, 200, '+3s', '#7ed957');
          if (g.recado) { Sfx.sting && Sfx.sting(); flash('#05040a', 0.25); }
        }
      }
      if (g.shine > 0) { g.shine -= dt; if (g.shine <= 0) g.slide = 0.45; }
    },
    draw(g) {
      const { cx, cy, r } = this.geo(), L = g.loucaT;
      // pia: azulejos e água com espuma
      sky('#dff1ff', '#bfe0f5');
      for (let x = 0; x < K.VW; x += 80) for (let y = 0; y < 760; y += 80) { X.fillStyle = (x / 80 + y / 80) % 2 ? 'rgba(255,255,255,.35)' : 'rgba(255,255,255,.1)'; X.fillRect(x + 2, y + 2, 76, 76); }
      fr(-20, 760, K.VW + 40, 300, 0, '#9fb3c2'); fr(-20, 760, K.VW + 40, 14, 0, '#c9d5e0');
      for (let i = 0; i < 14; i++) fc((srand(i) * K.VW + Math.sin(K.t + i) * 10), 790 + srand(i + 3) * 40, 10 + srand(i + 5) * 14, 'rgba(255,255,255,.75)');
      sideShade();
      // o prato entra pela esquerda e sai pela direita
      const off = g.slide > 0 ? (1 - g.slide / 0.45) * (K.VW) : 0;
      X.save(); X.translate(off, 0);
      fe(cx, cy + r * 0.92, r * 0.95, r * 0.18, 'rgba(40,60,90,.18)');
      fc(cx, cy, r, L.rim); fc(cx, cy, r * 0.93, L.base); fc(cx, cy, r * 0.72, shade(L.base, -0.03));
      X.beginPath(); X.arc(cx, cy, r * 0.72, 0, TAU); stroke(3, 'rgba(120,150,180,.25)');
      if (L.flores) for (let i = 0; i < 10; i++) { const a = i / 10 * TAU; for (let k = 0; k < 5; k++) fc(cx + Math.cos(a) * r * 0.83 + Math.cos(k / 5 * TAU) * 6, cy + Math.sin(a) * r * 0.83 + Math.sin(k / 5 * TAU) * 6, 4, L.rim); }
      if (L.fundo) { X.globalAlpha = 0.25; fc(cx, cy + r * 0.05, r * 0.55, '#bcd'); X.globalAlpha = 1; }
      // horror: um recado escrito no prato, que só aparece quando você limpa
      if (g.recado) { X.save(); X.translate(cx, cy); X.rotate(-0.12); X.font = FONT(700, Math.round(r * 0.22)); X.textAlign = 'center'; X.textBaseline = 'middle'; X.fillStyle = 'rgba(120,20,30,.85)'; X.fillText(g.recado, 0, 0); X.textBaseline = 'alphabetic'; X.restore(); }
      // sujeira
      X.save(); X.beginPath(); X.arc(cx, cy, r * 0.97, 0, TAU); X.clip();
      X.drawImage(g.dirt, cx - r, cy - r, 2 * r, 2 * r);
      X.restore();
      if (g.shine > 0) { X.globalAlpha = Math.min(1, g.shine * 2); for (let i = 0; i < 4; i++) { const a = K.t * 3 + i * 1.6; starPath(cx + Math.cos(a) * r * 0.6, cy + Math.sin(a) * r * 0.5, 20, 8); X.fillStyle = '#ffffff'; X.fill(); } X.globalAlpha = 1; }
      X.restore();
      // esponja segue o dedo
      const p = K.ptr;
      if (p && p.down && g.slide <= 0) {
        X.save(); X.translate(p.x, p.y); X.rotate(Math.sin(K.t * 20) * 0.08);
        fr(-46, -30, 92, 60, 14, '#ffe066'); fr(-46, -30, 92, 22, 10, '#5cb85c');
        for (let i = 0; i < 6; i++) fc(-30 + (i % 3) * 30, 10 + Math.floor(i / 3) * 10, 3, 'rgba(180,140,40,.5)');
        X.restore();
      }
      // quanto falta
      const w = Math.min(K.AW - 80, 380), x0 = cx - w / 2, y0 = cy + r + 50;
      fr(x0, y0, w, 18, 9, 'rgba(255,255,255,.7)'); fr(x0 + 3, y0 + 3, (w - 6) * (1 - g.left), 12, 6, '#4dabf7');
      X.font = FONT(600, 22); X.textAlign = 'center'; X.fillStyle = '#3a5a7a'; X.fillText(`${L.n} · ${Math.round((1 - g.left) * 100)}% limpo`, cx, y0 + 46);
      drawParts();
      hud(String(g.score), `⏱ ${Math.ceil(g.time)}`);
      if (g.score === 0 && g.left > 0.9) pill(cx, 250, Math.min(K.AW - 40, 460), 48, 'Arraste o dedo para esfregar!', '#2a7fc0');
    },
    reward(g) { return Math.floor(g.score / this.per); },
  });
});
