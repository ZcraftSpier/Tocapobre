'use strict';
// ======================================================
//  Álbum de figurinhas: lugares, receitas, segredos e conquistas
// ======================================================
const Album = (() => {
  const KEY = 'vilaDoce.album';
  let got = {};
  try { got = JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) { /* sem armazenamento */ }

  const PLACES = [['casa', '🏠'], ['apto', '🏢'], ['cafe', '☕'], ['mercado', '🛒'], ['escola', '🏫'], ['estudio', '✨'], ['petshop', '🐾'], ['estancia', '🐄'], ['praia', '🏖️'], ['mar', '🐠'], ['parque', '🌳']];
  const SECRETS = [
    ['quadro', '🖼️', 'O gato do quadro', 'Tem um quadro de gato na sala que parece vivo...'],
    ['ursinho', '🧸', 'Ursinho dançarino', 'Faça muitas cócegas no ursinho do quarto.'],
    ['maca', '🍏', 'Maçã dourada', 'A árvore grande do parque esconde algo no alto.'],
    ['tesouro', '💰', 'Tesouro enterrado', 'Um X marca o lugar na areia da praia.'],
    ['perola', '🦪', 'Pérola do naufrágio', 'O baú do navio afundado guarda um brilho.'],
    ['globo', '🌍', 'Volta ao mundo', 'Gire o globo da escola bem rápido!'],
    ['caixa', '🧾', 'Cliente nº 1000', 'A registradora do mercado adora ser tocada.'],
    ['peixe', '🐟', 'Peixinho dourado', 'Bata no vidro do aquário várias vezes.'],
    ['receita', '📜', 'Receita da vó', 'O quadro do café tem uma anotação secreta.'],
    ['ferradura', '🧲', 'Ferradura da sorte', 'Procure no monte de feno da estância.'],
    ['visita', '🚪', 'Visita surpresa', 'Alguém bate à porta do apartamento...'],
    ['disco', '🪩', 'Noite disco', 'O letreiro do estúdio tem um botão escondido.'],
    ['lua', '🌙', 'Pedido à lua', 'De noite, no parque, toque na lua.'],
    ['barco', '⛵', 'Ahoy, marujo!', 'Toque no barquinho que passa no mapa.'],
  ];
  const ACH = [
    ['mapa', '🗺️', 'Explorador', 'Abra o mapa da vila.'],
    ['pet', '🐶', 'Melhor amigo de 4 patas', 'Adote um pet.'],
    ['banho', '🛁', 'Pet cheiroso', 'Dê banho num pet.'],
    ['decor', '🛋️', 'Decorador', 'Coloque um móvel no modo Decorar.'],
    ['pintor', '🎨', 'Pintor', 'Mude a cor de uma parede.'],
    ['fantasia', '👑', 'Baile de fantasia', 'Vista uma fantasia pronta.'],
    ['amigos', '💞', 'Melhores amigos', 'Dois personagens viram melhores amigos.'],
    ['papo', '💬', 'Tagarela', 'Ouça 30 conversas.'],
    ['danca', '💃', 'Pé de valsa', 'Faça alguém dançar com música.'],
    ['soneca', '😴', 'Dorminhoco', 'Alguém dorme numa cama.'],
    ['escorrega', '🛝', 'Uhuuu!', 'Desça no escorregador do parque.'],
    ['colheita', '🌽', 'Fazendeiro', 'Faça a primeira colheita na estância.'],
    ['trator', '🚜', 'Tratorista', 'Dirija o trator da estância.'],
    ['cavalo', '🐴', 'Cavaleiro', 'Monte no cavalo da estância.'],
    ['chimarrao', '🧉', 'Bah, que mate!', 'Tome um chimarrão.'],
    ['sereia', '🧜', 'Sereia de verdade', 'Leve alguém com cauda de sereia ao fundo do mar.'],
    ['arcoiris', '🌈', 'Arco-íris', 'Veja um arco-íris depois da chuva.'],
    ['geada', '❄️', 'Geada gaúcha', 'Veja a geada de manhã.'],
    ['neve', '☃️', 'Nevou!', 'Veja a neve cair.'],
    ['festa', '🎉', 'Dia de festa', 'Participe de uma festa do calendário.'],
    ['gororoba', '🤢', 'Chef criativo', 'Invente uma gororoba na panela.'],
    ['fliperama', '🕹️', 'Fliperama', 'Jogue um minigame do fliperama.'],
    ['recorde', '🏅', 'Recordista', 'Faça 50 pontos em algum minigame.'],
    ['cofrinho', '💰', 'Cofrinho cheio', 'Junte 300 moedas no fliperama.'],
  ];
  const COL = { lugar: '#4dabf7', receita: '#ff9f43', segredo: '#a77bf3', conquista: '#ff5f9e' };

  function list() {
    const L = [];
    PLACES.forEach(([id, ic]) => L.push({ id: 'l_' + id, cat: 'lugar', ic, n: SCENES[id] ? SCENES[id].name : id, hint: 'Visite este lugar.' }));
    (typeof RECIPES !== 'undefined' ? RECIPES : []).forEach((r) => L.push({ id: 'r_' + r.id, cat: 'receita', ic: r.ic, n: r.n, hint: r.need.map((x, i) => (i === 0 ? ITEMS[x]?.n || x : '?')).join(' + ') }));
    SECRETS.forEach(([id, ic, n, hint]) => L.push({ id: 's_' + id, cat: 'segredo', ic, n, hint }));
    ACH.forEach(([id, ic, n, hint]) => L.push({ id: 'a_' + id, cat: 'conquista', ic, n, hint }));
    return L;
  }
  function has(id) { return !!got[id]; }
  let queue = [], showing = false;
  function unlock(id) {
    if (got[id]) return false;
    const st = list().find((s) => s.id === id);
    if (!st) return false;
    got[id] = Date.now();
    try { localStorage.setItem(KEY, JSON.stringify(got)); } catch (e) { /* sem armazenamento */ }
    queue.push(st); if (!showing) next();
    return true;
  }
  function next() {
    const st = queue.shift();
    const el = document.getElementById('stickerToast');
    if (!st || !el) { showing = false; return; }
    showing = true;
    el.innerHTML = `<div class="stk" style="--c:${COL[st.cat]}">${st.ic}</div><div><small>Nova figurinha!</small><b>${st.n}</b></div>`;
    el.classList.remove('show'); void el.offsetWidth; el.classList.add('show');
    Sfx.sticker();
    setTimeout(() => { el.classList.remove('show'); setTimeout(next, 350); }, 2600);
  }

  // ---------- interface ----------
  let tab = 'lugar';
  function render() {
    const L = list(), done = L.filter((s) => got[s.id]).length;
    document.getElementById('albumCount').textContent = `${done} / ${L.length}`;
    document.getElementById('albumBar').style.width = (100 * done / L.length) + '%';
    document.querySelectorAll('#albumTabs button').forEach((b) => b.classList.toggle('on', b.dataset.cat === tab));
    document.getElementById('albumGrid').innerHTML = L.filter((s) => s.cat === tab).map((s) => got[s.id]
      ? `<div class="acard got" style="--c:${COL[s.cat]}"><div class="stk">${s.ic}</div><b>${s.n}</b>${s.cat === 'receita' ? `<small>${recipeText(s.id)}</small>` : ''}</div>`
      : `<div class="acard"><div class="stk lock">?</div><b>???</b><small>${s.hint}</small></div>`).join('');
  }
  function recipeText(id) {
    const r = RECIPES.find((x) => 'r_' + x.id === id);
    return r ? r.need.map((x) => ITEMS[x]?.n || x).join(' + ') : '';
  }
  function open() { render(); document.getElementById('album').classList.remove('hidden'); Sfx.click(); }
  function close() { document.getElementById('album').classList.add('hidden'); }
  function isOpen() { const a = document.getElementById('album'); return a && !a.classList.contains('hidden'); }
  function init() {
    document.querySelectorAll('#albumTabs button').forEach((b) => b.addEventListener('click', () => { tab = b.dataset.cat; Sfx.click(); render(); }));
    document.getElementById('albumClose').addEventListener('click', close);
    document.getElementById('album').addEventListener('pointerdown', (e) => { if (e.target.id === 'album') close(); });
    document.getElementById('btnAlbum').addEventListener('click', () => { Sfx.unlock(); open(); });
  }
  return { unlock, has, open, close, isOpen, init, list };
})();

// ======================================================
//  Segredos espalhados pela vila
// ======================================================
function secretTap(st, need, fn) { st.n = (st.n || 0) + 1; if (st.n >= need) { st.n = 0; fn(); return true; } return false; }

Object.assign(ITEMS, {
  treasure: { n: 'Tesouro', w: 90, h: 80, draw(it) {
    const t = G.t, sh = 0.5 + Math.sin(t * 4) * 0.5;
    if (it.sid === 'maca') {
      fe(0, -34, 34, 32, LG(-30, -66, 30, 0, '#fff3a8', '#ffcf3d', '#e79b12'));
      fr(-3, -80, 6, 18, 3, '#7a4b2a'); fe(14, -72, 15, 7, '#62c24f', -0.5);
    } else if (it.sid === 'tesouro') {
      fr(-44, -50, 88, 50, 8, '#8a5532'); X.beginPath(); X.moveTo(-44, -50); X.quadraticCurveTo(0, -84, 44, -50); X.closePath(); X.fillStyle = '#a0662f'; X.fill();
      fr(-46, -54, 92, 8, 3, '#ffcf3d'); fr(-8, -60, 16, 20, 4, '#ffcf3d');
      for (let i = 0; i < 5; i++) fc(-30 + i * 15, -76 + (i % 2) * 6, 7, '#ffd23f');
    } else if (it.sid === 'perola') {
      fe(0, -14, 40, 14, '#c9a6e0'); fc(0, -34, 20, RG(-6, -40, 2, 22, '#ffffff', '#f3e9ff', '#cdb8e8'));
    } else if (it.sid === 'ferradura') {
      X.beginPath(); X.arc(0, -40, 26, Math.PI * 0.85, Math.PI * 2.15); stroke(14, '#ffcf3d');
    } else {
      starPath(0, -40, 34); X.fillStyle = '#ffcf3d'; X.fill();
    }
    X.globalAlpha = sh; starPath(28, -70, 8, 4, 0.3); X.fillStyle = '#fff'; X.fill(); X.globalAlpha = 1;
  },
  tap(it) { Album.unlock('s_' + it.sid); Sfx.sparkle(); emit('star', it.x, it.y - 60, 14); emit('confetti', it.x, it.y - 60, 12); },
  onGrab(it) { Album.unlock('s_' + it.sid); } },
});
function spawnTreasure(sid, x, y, scene) { const it = spawnItem('treasure', x, y, scene); it.sid = sid; startFall(it, 0, -300); Sfx.sparkle(); return it; }

// quadro do gato (casa)
SCENES.casa.props.push({ id: 'secQuadro', x: 975, y: 220, w: 110, h: 130, state: { wink: 0 },
  tap(s) { s.wink = 1.2; Sfx.meow(); if (Album.unlock('s_quadro')) UI.toast('O gato do quadro piscou pra você! 😉'); return true; },
  update(s, dt) { s.wink = Math.max(0, s.wink - dt); },
  draw(s) { if (s.wink > 0) { line(1018, 290, 1030, 290, 4, '#2a1d1a'); fpoly([1010, 300, 1020, 300, 1016, 306], '#ff5d8f'); } } });
// ursinho: muitas cócegas
const _teddyTap = ITEMS.teddy.tap;
ITEMS.teddy.tap = (it) => { _teddyTap(it); it.taps = (it.taps || 0) + 1; if (it.taps >= 5) { it.taps = 0; hop(it, 700); emit('note', it.x, it.y - 100, 5); Sfx.xylo(); Album.unlock('s_ursinho'); } };
// aquário: bater no vidro
const _aqTap = ITEMS.aquarium.tap;
ITEMS.aquarium.tap = (it) => { _aqTap(it); it.taps = (it.taps || 0) + 1; if (it.taps >= 5) { it.taps = 0; it.gold = true; Album.unlock('s_peixe'); UI.toast('Um peixinho dourado apareceu! ✨'); } };
const _aqDraw = ITEMS.aquarium.draw;
ITEMS.aquarium.draw = function (it, t) { _aqDraw.call(this, it, t); if (it.gold) { const fx = Math.cos(G.t * 1.7) * 46; X.save(); X.translate(fx, -70); X.scale(Math.sin(G.t * 1.7) > 0 ? -1 : 1, 1); fe(0, 0, 14, 9, '#ffcf3d'); fpoly([-12, 0, -24, -8, -24, 8], '#ffb400'); fc(7, -2, 2, '#2a1d1a'); X.restore(); } };
// maçã dourada na árvore do parque
SCENES.parque.props.push({ id: 'secArvore', x: 170, y: 120, w: 330, h: 300, state: {},
  tap(s) { emit('drop', rand(200, 460), 300, 4, 1); Sfx.whoosh(); if (secretTap(s, 3, () => spawnTreasure('maca', 330, 420, 'parque'))) UI.toast('Caiu algo brilhante da árvore!'); return true; } });
// lua no parque à noite
SCENES.parque.props.push({ id: 'secLua', x: 540, y: 80, w: 130, h: 120,
  tap() { if (!G.night) return false; Sfx.sparkle(); emit('star', 600, 180, 20); if (Album.unlock('s_lua')) UI.toast('Você fez um pedido à lua 🌙'); return true; } });
// tesouro enterrado na praia
SCENES.praia.props.push({ id: 'secAreia', x: 1840, y: 860, w: 140, h: 70, z: 861, state: { dug: 0, done: false },
  tap(s) {
    if (s.done) return false;
    s.dug++; emit('crumb', 1910, 880, 8, 'bread'); Sfx.drop(0.5);
    if (s.dug >= 3) { s.done = true; spawnTreasure('tesouro', 1910, 880, 'praia'); UI.toast('Você desenterrou um tesouro! 💰'); }
    return true;
  },
  draw(s) {
    if (s.done) { fe(1910, 900, 50, 12, '#e0b670'); return; }
    fe(1910, 896, 60 - s.dug * 8, 18 - s.dug * 3, '#ecc985'); fe(1910, 890, 46 - s.dug * 6, 10, '#f7e3b0');
    line(1896, 880, 1924, 900, 4, '#c4302b'); line(1924, 880, 1896, 900, 4, '#c4302b');
  } });
// globo da escola girando rápido
SCENES.escola.props.forEach((p) => {
  if (p.id !== 'globe') return;
  const t0 = p.tap;
  p.tap = (s, w, st) => { t0(s, w, st); if (s.v > 16 && Album.unlock('s_globo')) UI.toast('Volta ao mundo! 🌍'); return true; };
});
// registradora do mercado
SCENES.mercado.props.forEach((p) => {
  if (p.id !== 'checkout') return;
  const t0 = p.tap;
  p.tap = (s, w, st) => { t0(s, w, st); if (w.x > 2140) { s.reg = (s.reg || 0) + 1; if (s.reg >= 10) { s.reg = 0; emit('confetti', 2200, 540, 30); if (Album.unlock('s_caixa')) UI.toast('Parabéns! Cliente nº 1000! 🎉'); } } return true; };
});
// receita secreta no quadro do café
SCENES.cafe.props.push({ id: 'secMenu', x: 110, y: 130, w: 420, h: 240,
  tap() { Sfx.chalk(); UI.toast('Anotação: "farinha + ovo + açúcar + banana = Cuca da vó" 📜'); Album.unlock('s_receita'); return true; } });
// porta do apartamento: visita surpresa
SCENES.apto.props.push({ id: 'secPorta', x: 70, y: 400, w: 170, h: 396, state: { n: 0 },
  tap(s) {
    Sfx.knock();
    if (secretTap(s, 3, () => {
      const c = addCharacter(); c.x = 160; c.scene = 'apto';
      Album.unlock('s_visita');
      setTimeout(() => Chat.say(c, 'Toc toc! Cheguei pra visitar!'), 900);
    })) return true;
    UI.toast('Toc, toc...'); return true;
  } });
// letreiro do estúdio: noite disco
SCENES.estudio.props.push({ id: 'secNeon', x: 1000, y: 100, w: 500, h: 70, state: { n: 0, disco: 0 },
  tap(s) { Sfx.click(); if (secretTap(s, 3, () => { s.disco = 12; Album.unlock('s_disco'); Sfx.music('pop'); setTimeout(() => Sfx.music(null), 12000); })) UI.toast('🪩 Noite disco!'); return true; },
  update(s, dt) { s.disco = Math.max(0, s.disco - dt); if (s.disco > 0) { if (Math.random() < dt * 20) emit('confetti', rand(G.cam.estudio, G.cam.estudio + VW), 60, 1); } },
  draw(s, t) {
    if (s.disco <= 0) return;
    X.save(); X.globalCompositeOperation = 'lighter';
    ['#ff4fa3', '#4dabf7', '#7ed957', '#ffd23f'].forEach((c, i) => { const x = 1000 + Math.sin(t * 2 + i * 1.6) * 700; X.fillStyle = RG(x, 820, 10, 260, alpha(c, 0.35), alpha(c, 0)); X.fillRect(x - 260, 560, 520, 520); });
    X.restore();
    fc(1000, 30, 30, '#d4dae2'); for (let i = 0; i < 12; i++) fr(985 + (i % 4) * 8, 12 + ((i / 4) | 0) * 10, 7, 7, 1, i % 2 ? '#ffffff' : '#9fd3ff');
  } });
