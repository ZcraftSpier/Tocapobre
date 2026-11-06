'use strict';
// Minigame do Fliperama: Piano Doce
// Recebe o kit K do Fliperama (js/minigames.js). Valores que mudam a cada
// quadro (posição da área de jogo, tempo, tremida...) são lidos como K.nome.
Mini.addGame((K) => {
  const { FONT, burst, drawHero, drawParts, end, flash, hud, pill, ring, say, sideShade, sky, vib } = K;
  // ---------- 6. Piano Doce ----------
  // Teclas caem em 4 colunas; toque cada uma quando chegar e a música vai saindo.
  const NT = { C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392, A4: 440, B4: 493.88, C5: 523.25, D5: 587.33, E5: 659.25 };
  const SONGS = [
    ['Brilha, brilha, estrelinha', 'C4 C4 G4 G4 A4 A4 G4 F4 F4 E4 E4 D4 D4 C4 G4 G4 F4 F4 E4 E4 D4 G4 G4 F4 F4 E4 E4 D4 C4 C4 G4 G4 A4 A4 G4 F4 F4 E4 E4 D4 D4 C4'],
    ['Ode à Alegria', 'E4 E4 F4 G4 G4 F4 E4 D4 C4 C4 D4 E4 E4 D4 D4 E4 E4 F4 G4 G4 F4 E4 D4 C4 C4 D4 E4 D4 C4 C4'],
    ['Parabéns pra você', 'G4 G4 A4 G4 C5 B4 G4 G4 A4 G4 D5 C5 G4 G4 E5 C5 B4 A4 F4 F4 E4 C4 D4 C4'],
    ['Cai, cai, balão', 'G4 G4 F4 E4 D4 G4 G4 F4 E4 D4 C4 E4 G4 E4 D4 C4 C4 E4 G4 E4 D4 C4'],
  ];
  // nota mais aguda → coluna mais à direita; evita repetir a coluna quando a nota muda
  const SONG_TILES = SONGS.map(([n, s]) => {
    const notes = s.split(' '), uniq = [...new Set(notes)].sort((a, b) => NT[a] - NT[b]);
    let prev = -1, prevN = '';
    const tiles = notes.map((k) => {
      let lane = Math.min(3, Math.floor(uniq.indexOf(k) * 4 / uniq.length));
      if (k !== prevN && lane === prev) lane = (lane + (uniq.indexOf(k) > uniq.indexOf(prevN) ? 1 : 3)) % 4;
      prev = lane; prevN = k;
      return { lane, f: NT[k] };
    });
    return { n, tiles };
  });
  const PIANO_COLS = ['#ff7eb6', '#a77bf3', '#4dabf7', '#7ed957'];
  const TH = 200, KEYS_Y = 870;
  return ({
    id: 'piano', n: 'Piano Doce', ic: '🎹', col: '#d6c4fb', per: 40,
    help: 'Toque nas teclas coloridas e toque a música! Perto da linha vale mais e o combo multiplica. Só perde vida a tecla que passar — e 40 acertos seguidos devolvem uma vida. (Teclado: D F J K)',
    stars: [60, 160, 350],
    mult(g) { return Math.min(4, 1 + Math.floor(g.combo / 15)); },
    board() { const bw = Math.min(K.AW - 30, 760); return { bx: K.AX + (K.AW - bw) / 2, bw, lw: bw / 4 }; },
    start() {
      const g = { tiles: [], song: (Math.random() * SONGS.length) | 0, at: 0, row: 0, hits: 0, started: false, sp: 300, score: 0, combo: 0, lives: 3, lock: 0, over: 0, joyT: 0, keyT: [0, 0, 0, 0], songT: 2.5 };
      for (let i = 0; i < 8; i++) this.addTile(g, KEYS_Y - TH - 20 - i * TH);
      return g;
    },
    addTile(g, y) {
      const S = SONG_TILES[g.song];
      if (g.at >= S.tiles.length) { g.song = (g.song + 1) % SONG_TILES.length; g.at = 0; g.pendingSong = true; }
      const src = SONG_TILES[g.song].tiles[g.at++];
      const row = g.row++, first = !g.tiles.length;
      g.tiles.push({ lane: src.lane, f: src.f, y, row, hit: 0, t: 0, first, song: g.pendingSong ? g.song : -1 });
      // teclas duplas quando já está rápido: a segunda toca a quinta da nota (harmonia)
      if (!first && g.sp > 680 && Math.random() < Math.min(0.18, (g.sp - 680) / 1500 + 0.06)) {
        const lane2 = (src.lane + 1 + ((Math.random() * 3) | 0)) % 4;
        g.tiles.push({ lane: lane2, f: src.f * 1.5, y, row, hit: 0, t: 0, dbl: true, song: -1 });
      }
      g.pendingSong = false;
    },
    target(g) { return g.tiles.find((k) => !k.hit); },
    press(g, lane) {
      if (g.over) return;
      const first = this.target(g);
      if (!first || first.y + TH < 0 || g.lock > 0) return;
      g.keyT[lane] = 0.18;
      const k = g.tiles.find((t2) => !t2.hit && t2.row === first.row && t2.lane === lane);
      const { bx, lw } = this.board();
      if (!k) {
        // coluna errada: só quebra o combo e trava os toques por um instante (não tira vida)
        g.combo = 0; g.lock = 0.3; K.shake = 0.15; Sfx.squeak(); vib(40);
        say(bx + lw * (lane + 0.5), KEYS_Y - 60, 'Ops!', '#ff6b6b');
        return;
      }
      const before = this.mult(g);
      k.hit = 1; g.started = true; g.hits++; g.combo++; g.joyT = 0.35;
      const perfect = Math.abs(k.y + TH - KEYS_Y) < 110, pts = (perfect ? 3 : 1) * before;
      g.score += pts;
      Sfx.note(k.f); vib(perfect ? 12 : 6);
      if (k.song >= 0) g.songT = 2.5, g.songN = k.song;
      const cx = bx + lw * (k.lane + 0.5);
      burst(cx, k.y + TH / 2, perfect ? 12 : 6, [PIANO_COLS[k.lane], '#fff', '#ffd23f'], perfect ? 380 : 260);
      if (perfect) { say(cx, k.y + TH / 2, `Perfeito! +${pts}`, '#ffd23f'); ring(cx, KEYS_Y, PIANO_COLS[k.lane], lw * 0.7); }
      else say(cx, k.y + TH / 2, `+${pts}`, '#fff');
      if (g.combo % 40 === 0 && g.lives < 3) { g.lives++; say(K.AX + K.AW / 2, 360, '+1 ❤', '#ff5f7e'); Sfx.sparkle(); }
      if (this.mult(g) > before) { say(K.AX + K.AW / 2, 300, `x${this.mult(g)}!`, '#ff8fbd'); flash(PIANO_COLS[k.lane], 0.18); setTimeout(() => K.open && Sfx.ding(), 120); }
    },
    tap(g, x, y) {
      const { bx, bw, lw } = this.board();
      if (x < bx || x > bx + bw) return;
      this.press(g, clamp(Math.floor((x - bx) / lw), 0, 3));
    },
    key(g, k) {
      const m = { d: 0, f: 1, j: 2, k: 3, D: 0, F: 1, J: 2, K: 3, 1: 0, 2: 1, 3: 2, 4: 3 };
      if (m[k] != null) this.press(g, m[k]);
    },
    update(g, dt) {
      g.joyT -= dt; g.songT -= dt; g.lock -= dt;
      for (let i = 0; i < 4; i++) g.keyT[i] -= dt;
      for (const k of g.tiles) if (k.hit) k.t += dt;
      if (g.over) { g.over += dt; if (g.over > 1.2) return end(); return; }
      if (!g.started) return;
      g.sp = Math.min(820, 300 + g.hits * 3.2);
      const dy = g.sp * dt;
      for (const k of g.tiles) k.y += dy;
      const top = Math.min(...g.tiles.map((k) => k.y));
      if (top > -TH * 2) this.addTile(g, top - TH);
      const k = this.target(g);
      if (k && k.y > KEYS_Y + 70) {
        for (const o of g.tiles) if (!o.hit && o.row === k.row) o.hit = 2;
        g.lives--; g.combo = 0; K.shake = 0.3; Sfx.squeak(); flash('#ff6b6b', 0.18); vib(70);
        const { bx, lw } = this.board(); say(bx + lw * (k.lane + 0.5), KEYS_Y - 40, 'Passou!', '#ff6b6b');
        if (g.lives <= 0) g.over = 0.001;
      }
      g.tiles = g.tiles.filter((t2) => t2.y < 1100);
    },
    draw(g) {
      sky('#2b2350', '#6a4fa8');
      // brilhinhos ao fundo
      for (let i = 0; i < 24; i++) { X.globalAlpha = 0.25 + 0.25 * Math.sin(K.t * 2 + i); fc(srand(i) * K.VW, srand(i + 9) * 800, 2 + srand(i + 3) * 3, '#fff6d0'); }
      X.globalAlpha = 1;
      sideShade();
      const { bx, bw, lw } = this.board();
      // trilhos
      fr(bx - 8, -20, bw + 16, KEYS_Y + 20, 0, 'rgba(255,255,255,.08)');
      for (let i = 0; i < 4; i++) {
        X.fillStyle = LG(0, 0, 0, KEYS_Y, 'rgba(255,255,255,0)', alpha(PIANO_COLS[i], 0.12 + (g.keyT[i] > 0 ? 0.25 : 0)));
        X.fillRect(bx + lw * i, 0, lw, KEYS_Y);
        if (i) line(bx + lw * i, 0, bx + lw * i, KEYS_Y, 2, 'rgba(255,255,255,.15)');
      }
      // teclas que caem
      for (const k of g.tiles) {
        if (k.y > 1000 || k.y + TH < 0) continue;
        const x = bx + lw * k.lane + 6, w = lw - 12, col = PIANO_COLS[k.lane];
        if (k.hit === 1) {
          const a = Math.max(0, 1 - k.t * 3); if (a <= 0) continue;
          X.globalAlpha = a; fr(x, k.y + 4, w, TH - 8, 18, alpha(col, 0.5)); X.globalAlpha = 1;
          continue;
        }
        const bad = k.hit === 2;
        fr(x, k.y + 10, w, TH - 8, 18, bad ? '#8a2a3a' : shade(col, -0.35));
        fr(x, k.y + 4, w, TH - 12, 18, bad ? '#ff6b6b' : LG(0, k.y, 0, k.y + TH, shade(col, 0.25), col));
        fr(x + 10, k.y + 14, w - 20, 16, 8, 'rgba(255,255,255,.35)');
        // notinha musical na tecla
        const nx = x + w / 2, ny = k.y + TH / 2 + 4;
        fe(nx - 6, ny + 14, 11, 8, 'rgba(255,255,255,.85)', -0.4); line(nx + 4, ny + 12, nx + 4, ny - 18, 4, 'rgba(255,255,255,.85)'); line(nx + 4, ny - 18, nx + 16, ny - 10, 4, 'rgba(255,255,255,.85)');
        if (k.first && !g.started) {
          X.font = FONT(700, 26); X.textAlign = 'center'; X.fillStyle = '#fff'; X.globalAlpha = 0.6 + Math.sin(K.t * 5) * 0.4;
          X.fillText('Toque!', nx, k.y + TH - 26); X.globalAlpha = 1;
        }
      }
      // linha de acerto e teclado
      fr(bx - 8, KEYS_Y - 6, bw + 16, 8, 4, 'rgba(255,240,180,.9)');
      fr(bx - 8, KEYS_Y + 2, bw + 16, 1000 - KEYS_Y, 0, '#fffaf2');
      for (let i = 0; i < 4; i++) {
        const on = g.keyT[i] > 0, x = bx + lw * i;
        fr(x + 3, KEYS_Y + 8 + (on ? 6 : 0), lw - 6, 110, 10, on ? alpha(PIANO_COLS[i], 0.55) : '#ffffff');
        RR(x + 3, KEYS_Y + 8 + (on ? 6 : 0), lw - 6, 110, 10); stroke(3, 'rgba(58,36,40,.25)');
        if (i < 3) fr(x + lw - 14, KEYS_Y + 2, 28, 62, 6, '#3a2f4a');
      }
      // nome da música
      if (g.songT > 0) {
        X.globalAlpha = Math.min(1, g.songT);
        const nm = '♪ ' + SONG_TILES[g.songN ?? g.song].n;
        pill(K.AX + K.AW / 2, 225, Math.min(K.AW - 40, nm.length * 15 + 60), 46, nm, '#7a4fd0');
        X.globalAlpha = 1;
      }
      // personagem dançando, se couber ao lado do piano
      if (bx > 140) {
        K.hero.dancing = g.started && !g.over;
        const big = bx > 320;
        drawHero(bx - (big ? 150 : 90), 990, big ? 0.42 : 0.26, { joy: g.joyT > 0 });
        K.hero.dancing = false;
      }
      drawParts();
      hud(String(g.score), null, g.lives);
      if (g.combo >= 5) pill(K.VW / 2, 160, 210, 40, `Combo ${g.combo}${this.mult(g) > 1 ? ' · x' + this.mult(g) : ''}`, '#ff5f9e');
    },
    reward(g) { return Math.floor(g.score / this.per); },
  });
});
