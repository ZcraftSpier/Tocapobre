'use strict';
// ======================================================
//  Mais móveis para decorar (origem: base central do móvel)
// ======================================================
Object.assign(ITEMS, {
  sofa2: { n: 'Sofá', decor: 1, cat: 'sala', w: 300, h: 175, cols: SOFT, seats: [{ dx: -62, dy: -86, kind: 'chair' }, { dx: 62, dy: -86, kind: 'chair' }], draw(it) {
    const c = dcol(it, this);
    fr(-140, -172, 280, 110, 42, LG(0, -172, 0, -62, shade(c, 0.14), c));
    for (const x of [-62, 62]) fr(x - 52, -160, 104, 80, 26, 'rgba(255,255,255,.12)');
    fr(-152, -112, 42, 102, 20, shade(c, -0.1)); fr(110, -112, 42, 102, 20, shade(c, -0.1));
    for (const x of [-62, 62]) fr(x - 56, -96, 112, 30, 14, shade(c, 0.1));
    fr(-140, -70, 280, 60, 18, c);
    fr(-128, -12, 14, 12, 4, '#7a4b2a'); fr(114, -12, 14, 12, 4, '#7a4b2a');
  } },
  camaCasal: { n: 'Cama de casal', decor: 1, cat: 'quarto', w: 430, h: 220, cols: ['#ff9ec4', '#9fd3ff', '#b5e08a', '#ffd23f', '#d6c4fb'], surf: [{ x1: -200, x2: 200, y: -88 }],
    seats: [{ dx: 0, dy: -100, kind: 'bed' }, { dx: 14, dy: -76, kind: 'bed' }], draw(it) {
      const c = dcol(it, this);
      fr(-216, -216, 40, 212, 14, '#c98a55'); heartPath(-196, -176, 14); X.fillStyle = '#ff7eb6'; X.fill();
      fr(184, -140, 32, 136, 12, '#c98a55');
      fr(-206, -94, 412, 50, 16, '#ffffff'); fr(-210, -50, 420, 40, 12, shade('#c98a55', -0.08));
      fr(-198, -128, 90, 40, 18, '#fff6e8'); fr(-196, -108, 90, 40, 18, '#fffaf2');
      fr(-90, -104, 290, 62, 24, LG(0, -104, 0, -42, shade(c, 0.14), c));
      for (let i = 0; i < 5; i++) heartPath(-60 + i * 56, -72, 8), X.fillStyle = 'rgba(255,255,255,.45)', X.fill();
      fr(-200, -12, 16, 12, 4, '#8a5532'); fr(184, -12, 16, 12, 4, '#8a5532');
    } },
  mesaJantar: { n: 'Mesa de jantar', decor: 1, cat: 'cozinha', w: 300, h: 130, cols: ['#e03131', '#4dabf7', '#7ed957', '#ffd23f'], surf: [{ x1: -140, x2: 140, y: -122 }], draw(it) {
    const c = dcol(it, this);
    fr(-120, -110, 16, 110, 6, '#a0662f'); fr(104, -110, 16, 110, 6, '#a0662f');
    fr(-146, -126, 292, 22, 8, '#c98a55');
    // toalha xadrez
    X.save(); RR(-150, -128, 300, 56, 8); X.clip();
    X.fillStyle = '#ffffff'; X.fillRect(-150, -128, 300, 56);
    for (let x = -150; x < 150; x += 24) fr(x, -128, 12, 56, 0, alpha(c, 0.55));
    for (let y = -128; y < -72; y += 24) fr(-150, y, 300, 12, 0, alpha(c, 0.55));
    X.restore();
    for (let i = 0; i < 12; i++) X.beginPath(), X.arc(-138 + i * 25, -72, 12, 0, Math.PI), X.fillStyle = '#ffffff', X.fill();
  } },
  cadeira: { n: 'Cadeira', decor: 1, cat: 'cozinha', w: 110, h: 180, cols: WOOD, seat: { dx: 0, dy: -74, kind: 'chair' }, draw(it) {
    const c = dcol(it, this);
    fr(-46, -176, 14, 176, 6, shade(c, -0.15)); fr(32, -176, 14, 176, 6, shade(c, -0.15));
    for (let i = 0; i < 3; i++) fr(-40, -168 + i * 26, 80, 12, 6, c);
    fr(-54, -84, 108, 18, 8, LG(0, -84, 0, -66, shade(c, 0.1), c));
    fr(-44, -66, 10, 66, 4, shade(c, -0.2)); fr(34, -66, 10, 66, 4, shade(c, -0.2));
  } },
  escrivaninha: { n: 'Escrivaninha', decor: 1, cat: 'quarto', w: 230, h: 140, cols: WOOD, surf: [{ x1: -104, x2: 104, y: -132 }], draw(it) {
    const c = dcol(it, this);
    fr(-108, -120, 70, 120, 8, shade(c, -0.08)); for (let i = 0; i < 3; i++) { fr(-100, -112 + i * 38, 54, 30, 5, shade(c, 0.08)); fc(-73, -97 + i * 38, 4, shade(c, -0.35)); }
    fr(94, -120, 14, 120, 5, shade(c, -0.2));
    fr(-114, -136, 228, 20, 8, LG(0, -136, 0, -116, shade(c, 0.12), c));
  } },
  computador: { n: 'Computador', decor: 1, cat: 'quarto', w: 130, h: 120, draw(it) {
    const t = G.t;
    fr(-12, -30, 24, 26, 4, '#9aa6b2'); fe(0, -4, 34, 6, '#7a8794');
    fr(-60, -116, 120, 86, 10, '#2f3241');
    X.save(); RR(-52, -108, 104, 70, 6); X.clip();
    if (!it.on) { X.fillStyle = '#1d1f2e'; X.fillRect(-52, -108, 104, 70); }
    else {
      X.fillStyle = LG(0, -108, 0, -38, '#6ec6ff', '#cfefff'); X.fillRect(-52, -108, 104, 70);
      fe(0, -36, 70, 14, '#7ed957');
      const bx = -40 + ((t * 40) % 80), by = -58 - Math.abs(Math.sin(t * 5)) * 26;
      fr(bx - 7, by - 7, 14, 14, 3, '#ff5d8f'); starPath(30, -90, 7); X.fillStyle = '#ffd23f'; X.fill();
    }
    X.restore();
    fr(-50, -2, 76, 10, 4, '#d4dae2');
  }, tap(it) { it.on = !it.on; Sfx.beep(); } },
  tvDecor: { n: 'TV', decor: 1, cat: 'sala', w: 180, h: 150, draw(it) {
    const t = G.t, ch = it.ch || 0;
    line(-50, 0, -40, -30, 6, '#5b6474'); line(50, 0, 40, -30, 6, '#5b6474');
    fr(-86, -146, 172, 120, 14, '#2f3241');
    X.save(); RR(-76, -136, 152, 100, 8); X.clip();
    if (!ch) { X.fillStyle = '#24263a'; X.fillRect(-76, -136, 152, 100); fpoly([-60, -136, -30, -136, -76, -70, -76, -100], 'rgba(255,255,255,.08)'); }
    else if (ch === 1) { ['#ff6b6b', '#ff9f43', '#ffd23f', '#7ed957', '#4dabf7', '#a77bf3'].forEach((c, i) => { X.fillStyle = c; X.fillRect(-76 + i * 26, -136, 26, 100); }); }
    else if (ch === 2) { X.fillStyle = '#9fdcff'; X.fillRect(-76, -136, 152, 100); fe(0, -36, 100, 20, '#7ed957'); const x = Math.sin(t * 2) * 50; fc(x, -70 - Math.abs(Math.sin(t * 6)) * 20, 14, '#ff9f43'); }
    else { X.fillStyle = '#1d2a5a'; X.fillRect(-76, -136, 152, 100); for (let i = 0; i < 14; i++) fc(Math.cos(t * 0.6 + i) * 64, -86 + Math.sin(t * 0.8 + i * 1.7) * 40, 2.5, '#fff6d0'); }
    X.restore();
    fc(72, -32, 3, ch ? '#7ed957' : '#ff6b6b');
  }, tap(it) { it.ch = ((it.ch || 0) + 1) % 4; Sfx.click(); } },
  piano: { n: 'Piano', decor: 1, cat: 'sala', w: 250, h: 220, cols: ['#2f3241', '#ffffff', '#a0662f', '#ff7eb6'], draw(it) {
    const c = dcol(it, this);
    fr(-120, -216, 240, 150, 14, LG(-120, 0, 120, 0, shade(c, 0.12), c, shade(c, -0.12)));
    fr(-110, -150, 220, 8, 3, shade(c, -0.25));
    fr(-114, -112, 228, 34, 6, '#ffffff');
    for (let i = 0; i < 15; i++) line(-114 + i * 15.2, -112, -114 + i * 15.2, -78, 1.5, '#c9d5e0');
    for (let i = 0; i < 14; i++) if (![2, 6, 9, 13].includes(i)) fr(-104 + i * 15.2, -112, 9, 20, 2, '#1d1f2e');
    fr(-120, -80, 240, 16, 6, shade(c, -0.1));
    fr(-110, -66, 16, 66, 5, shade(c, -0.2)); fr(94, -66, 16, 66, 5, shade(c, -0.2));
    for (let i = 0; i < 3; i++) fe(-70 + i * 26, -180 + Math.sin(G.t * 2 + i) * 4, 6, 4, 'rgba(255,255,255,.25)');
  }, tap(it) { Sfx.piano(); emit('note', it.x, it.y - 230, 5); it.sq = 0.2; } },
  lareira: { n: 'Lareira', decor: 1, cat: 'sala', w: 240, h: 240, light: { dx: 0, dy: -70, r: 520 }, draw(it, t) {
    t = G.t;
    fr(-118, -236, 236, 236, 10, '#b06a3d');
    for (let r = 0; r < 8; r++) for (let i = 0; i < 4; i++) fr(-114 + i * 58 + (r % 2) * 29, -232 + r * 29, 54, 25, 3, r % 2 ? '#c27a4a' : '#a85f33');
    fr(-128, -246, 256, 22, 6, '#8a5532');
    fr(-70, -150, 140, 150, 60, '#2a1d1a');
    if (!it.off) {
      for (let i = 0; i < 3; i++) {
        const h = 90 + Math.sin(t * 12 + i * 2) * 16 - i * 22, w = 46 - i * 12, c = ['#ff6a2a', '#ffb347', '#fff3b0'][i];
        X.beginPath(); X.moveTo(-w, -12); X.quadraticCurveTo(-w, -12 - h * 0.5, Math.sin(t * 8) * 8, -12 - h); X.quadraticCurveTo(w, -12 - h * 0.5, w, -12); X.closePath(); X.fillStyle = c; X.fill();
      }
      lampGlow(0, -60, G.nightK > 0.05, '#ffb15a');
    }
    for (const r of [-0.25, 0.25]) { X.save(); X.translate(0, -12); X.rotate(r); fr(-56, -8, 112, 16, 8, '#7a4b2a'); X.restore(); }
  }, tap(it) { it.off = !it.off; Sfx.click(); if (!it.off) emit('star', it.x, it.y - 100, 8); },
  update(it, dt) { if (!it.off && Math.random() < dt * 2) emit('smoke', it.x + rand(-20, 20), it.y - 250, 1); } },
  banheira: { n: 'Banheira', decor: 1, cat: 'cozinha', w: 260, h: 120, cols: ['#ffffff', '#ffd6e5', '#cfe8ff', '#fff3c4'], seat: { dx: 0, dy: -46, kind: 'chair' }, draw(it) {
    const c = dcol(it, this);
    for (const x of [-100, 100]) { fc(x, -8, 12, '#ffd23f'); }
    X.beginPath(); X.moveTo(-124, -100); X.lineTo(124, -100); X.quadraticCurveTo(124, -14, 70, -14); X.lineTo(-70, -14); X.quadraticCurveTo(-124, -14, -124, -100); X.closePath();
    X.fillStyle = LG(0, -100, 0, -14, shade(c, 0.05), shade(c, -0.08)); X.fill();
    fe(0, -98, 120, 12, '#bfe6ff');
    const busy = G.ents.some((e) => e.seatEnt === it.id);
    for (let i = 0; i < (busy ? 9 : 4); i++) fc(-100 + i * (busy ? 25 : 60), -100 - Math.abs(Math.sin(G.t * 2 + i)) * 8, 12 + (i % 3) * 4, 'rgba(255,255,255,.95)');
    line(110, -100, 110, -150, 6, '#c9d5e0'); line(110, -150, 84, -150, 6, '#c9d5e0');
  }, update(it, dt) { if (G.ents.some((e) => e.seatEnt === it.id) && Math.random() < dt * 4) emit('bubble', it.x + rand(-90, 90), it.y - 110, 1); } },
  abajur: { n: 'Abajur', decor: 1, cat: 'quarto', w: 70, h: 110, cols: ['#ffd0de', '#fff3c4', '#cfe8ff', '#d6efc4'], light: { dx: 0, dy: -80, r: 320 }, draw(it) {
    const c = dcol(it, this), on = !it.off;
    fe(0, -4, 22, 6, '#a77bf3'); fr(-5, -60, 10, 56, 4, '#a77bf3');
    lampGlow(0, -78, on && G.nightK > 0.05);
    fpoly([-24, -104, 24, -104, 36, -58, -36, -58], on ? LG(0, -104, 0, -58, '#fff4c2', c) : shade(c, -0.15));
  }, tap(it) { it.off = !it.off; Sfx.click(); } },
  espelho: { n: 'Espelho', decor: 1, cat: 'quarto', w: 120, h: 240, cols: ['#ffd23f', '#ffffff', '#ff9ec4', '#c98a55'], draw(it) {
    const c = dcol(it, this);
    line(-30, 0, -20, -40, 6, shade(c, -0.2)); line(30, 0, 20, -40, 6, shade(c, -0.2));
    fe(0, -134, 52, 100, c);
    fe(0, -134, 42, 90, LG(-40, -220, 40, -50, '#eaf6ff', '#c8e2f5', '#eaf6ff'));
    fpoly([-24, -190, -6, -200, -34, -110, -38, -140], 'rgba(255,255,255,.55)');
  }, tap(it) { Sfx.sparkle(); emit('star', it.x, it.y - 150, 10); UI.toast(pick(['Que visual lindo! ✨', 'Espelho, espelho meu...', 'Arrasou no look!'])); } },
  janela: { n: 'Janela', decor: 1, wall: 1, cat: 'parede', w: 230, h: 230, cols: ['#ff9ec4', '#9fd3ff', '#b5e08a', '#ffd23f', '#d6c4fb'], draw(it) {
    drawWindow(-90, -200, 180, 170, { curtain: dcol(it, this), seed: it.id * 13 });
  } },
  rede: { n: 'Rede', decor: 1, cat: 'quarto', w: 380, h: 220, cols: ['#ff6b6b', '#4dabf7', '#7ed957', '#ffd23f', '#a77bf3'], seat: { dx: 10, dy: -92, kind: 'bed' }, rock: { speed: 1.4, amp: 0.1 }, draw(it) {
    const c = dcol(it, this), r = furnRock(it);
    for (const x of [-180, 180]) { fr(x - 9, -220, 18, 220, 6, '#8a5532'); fe(x, -2, 20, 6, '#7a4b2a'); }
    X.save(); X.translate(r * 60, 0);
    X.beginPath(); X.moveTo(-170, -190); X.quadraticCurveTo(0, -20, 170, -190); X.quadraticCurveTo(0, -110, -170, -190); X.closePath();
    X.fillStyle = c; X.fill();
    X.save(); X.clip(); for (let i = -6; i <= 6; i++) fr(i * 28 - 7, -200, 14, 200, 0, 'rgba(255,255,255,.35)'); X.restore();
    for (let i = 0; i < 9; i++) line(-150 + i * 37, -150 + Math.abs(i - 4) * 9, -152 + i * 37, -126 + Math.abs(i - 4) * 9, 2, shade(c, 0.4));
    X.restore();
    line(-170, -190, -180, -200, 3, '#c9a874'); line(170, -190, 180, -200, 3, '#c9a874');
  } },
  cadeiraBalanco: { n: 'Cadeira de balanço', decor: 1, cat: 'sala', w: 170, h: 200, cols: WOOD, seat: { dx: 0, dy: -84, kind: 'chair' }, rock: { speed: 2.2, amp: 0.07 }, draw(it) {
    const c = dcol(it, this), r = furnRock(it);
    X.save(); X.rotate(r);
    X.beginPath(); X.moveTo(-82, -6); X.quadraticCurveTo(0, 14, 82, -6); stroke(10, shade(c, -0.25));
    fr(-60, -196, 14, 190, 6, shade(c, -0.15)); fr(46, -196, 14, 190, 6, shade(c, -0.15));
    for (let i = 0; i < 4; i++) fr(-50, -186 + i * 24, 100, 12, 6, c);
    fr(-64, -94, 128, 18, 8, LG(0, -94, 0, -76, shade(c, 0.1), c));
    fr(-60, -76, 120, 10, 4, shade(c, -0.1)); fr(-48, -112, 96, 22, 10, '#ff9ec4');
    X.restore();
  } },
  luzinhas: { n: 'Pisca-pisca', decor: 1, wall: 1, cat: 'parede', w: 380, h: 70, light: { dx: 0, dy: -30, r: 380 }, draw(it) {
    X.beginPath(); X.moveTo(-180, -60); X.quadraticCurveTo(0, 10, 180, -60); stroke(2, '#5b6474');
    const cs = ['#ff6b6b', '#ffd23f', '#7ed957', '#4dabf7', '#ff7eb6'];
    for (let i = 0; i < 11; i++) {
      const u = (i + 0.5) / 11, x = lerp(-180, 180, u), y = -60 + Math.sin(u * Math.PI) * 36 + 8, c = cs[i % 5];
      const on = !it.off && Math.sin(G.t * 3 + i * 1.7) > -0.4;
      fe(x, y, 7, 10, on ? c : shade(c, -0.45));
      if (on && G.nightK > 0.05) { X.fillStyle = RG(x, y, 2, 30, alpha(c, 0.55), alpha(c, 0)); X.fillRect(x - 30, y - 30, 60, 60); }
    }
  }, tap(it) { it.off = !it.off; Sfx.click(); } },
  bandeiraRS: { n: 'Bandeira do RS', decor: 1, wall: 1, cat: 'parede', w: 160, h: 120, draw() {
    X.save(); RR(-70, -110, 140, 96, 4); X.clip();
    fpoly([-70, -110, 70, -110, -70, -14], '#2f9e44'); fpoly([70, -110, 70, -14, -70, -14], '#ffd43b');
    X.beginPath(); X.moveTo(-70, -14); X.lineTo(70, -110); stroke(26, '#e03131');
    X.restore();
    fe(0, -62, 18, 20, '#ffffff'); fe(0, -62, 12, 14, '#4dabf7');
    fr(-74, -114, 148, 104, 4, 'rgba(0,0,0,0)'); RR(-70, -110, 140, 96, 4); stroke(3, '#c9a874');
  } },
  gaiola: { n: 'Gaiola com passarinho', decor: 1, cat: 'diversao', w: 100, h: 170, draw(it) {
    const t = G.t, hop = Math.abs(Math.sin(t * 3 + it.id)) > 0.95 ? -10 : 0;
    fe(0, -6, 40, 8, '#c9a874'); fr(-4, -60, 8, 54, 3, '#c9a874');
    X.beginPath(); X.moveTo(-40, -60); X.lineTo(-40, -130); X.quadraticCurveTo(0, -180, 40, -130); X.lineTo(40, -60); X.closePath();
    X.fillStyle = 'rgba(255,240,200,.15)'; X.fill();
    for (let i = 0; i <= 6; i++) { const x = -40 + i * 13.3; line(x, -60, x, -130 - Math.sin((i / 6) * Math.PI) * 30, 2, '#c9a874'); }
    fr(-44, -64, 88, 8, 3, '#c9a874'); line(-30, -84, 30, -84, 3, '#a0754d');
    X.save(); X.translate(0, -96 + hop);
    fe(0, 0, 16, 12, '#ffd23f'); fc(10, -8, 9, '#ffd23f'); fpoly([18, -9, 26, -6, 18, -4], '#ff9f43'); fc(12, -10, 2, '#2a1d1a'); fe(-6, 0, 9, 6, '#f5c32c', 0.4);
    X.restore();
  }, tap(it) { Sfx.chirp(); emit('note', it.x, it.y - 170, 3); } },
  cabaninha: { n: 'Cabaninha', decor: 1, cat: 'diversao', w: 220, h: 230, cols: ['#ff9ec4', '#9fd3ff', '#ffd23f', '#b5e08a'], seat: { dx: 0, dy: -46, kind: 'chair' }, draw(it) {
    const c = dcol(it, this);
    fpoly([-104, 0, 0, -210, 104, 0], LG(-104, 0, 104, 0, shade(c, -0.08), c, shade(c, -0.12)));
    for (let i = -2; i <= 2; i++) line(0, -210, i * 40, 0, 2, 'rgba(255,255,255,.35)');
    fpoly([-40, 0, 0, -120, 40, 0], '#5a3d4a');
    line(-12, -230, 12, -196, 5, '#a0754d'); line(12, -230, -12, -196, 5, '#a0754d');
    for (let i = 0; i < 6; i++) fpoly([-70 + i * 28, -60 + Math.abs(i - 2.5) * 10, -56 + i * 28, -60 + Math.abs(i - 2.5) * 10, -63 + i * 28, -40 + Math.abs(i - 2.5) * 10], ['#ff6b6b', '#ffd23f', '#4dabf7'][i % 3]);
  } },
});

// categorias do painel de decoração
const DECOR_CATS = [['sala', '🛋️ Sala'], ['quarto', '🛏️ Quarto'], ['cozinha', '🍽️ Cozinha e banho'], ['parede', '🖼️ Parede'], ['diversao', '🎈 Diversão'], ['objetos', '✏️ Objetos']];
Object.assign(ITEMS.armchair, { cat: 'sala' }); Object.assign(ITEMS.beanbag, { cat: 'sala' }); Object.assign(ITEMS.bed, { cat: 'quarto' });
Object.assign(ITEMS.sidetable, { cat: 'sala' }); Object.assign(ITEMS.bookshelf, { cat: 'sala' }); Object.assign(ITEMS.toybox, { cat: 'diversao' });
Object.assign(ITEMS.plantbig, { cat: 'sala' }); Object.assign(ITEMS.cactus, { cat: 'sala' }); Object.assign(ITEMS.floorlamp, { cat: 'sala' });
Object.assign(ITEMS.rugRound, { cat: 'quarto' }); Object.assign(ITEMS.rugRect, { cat: 'sala' });
['painting', 'poster', 'wallshelf', 'wallclock', 'garland'].forEach((k) => { ITEMS[k].cat = 'parede'; });
Object.assign(ITEMS.aquarium, { cat: 'diversao' }); Object.assign(ITEMS.petbed, { cat: 'diversao' });
DECOR_LIST.push('sofa2', 'tvDecor', 'piano', 'lareira', 'cadeiraBalanco', 'camaCasal', 'escrivaninha', 'computador', 'abajur', 'espelho', 'rede', 'mesaJantar', 'cadeira', 'banheira', 'janela', 'luzinhas', 'bandeiraRS', 'gaiola', 'cabaninha');
DECOR_LIST.push('popit', 'celular', 'calculadora', 'lapis', 'regua', 'durex');
