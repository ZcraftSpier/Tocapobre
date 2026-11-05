'use strict';
// ======================================================
//  Interface: dock de lugares, botões, editor de personagem, menus
// ======================================================
const ICONS = {
  casa: '<svg viewBox="0 0 48 48"><path d="M8 22 24 9l16 13v16a3 3 0 0 1-3 3H11a3 3 0 0 1-3-3z" fill="#ff8a65"/><path d="M5 23 24 7l19 16" fill="none" stroke="#d9534f" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><rect x="19" y="27" width="10" height="14" rx="2" fill="#fff3e0"/><rect x="31" y="24" width="6" height="6" rx="1.5" fill="#bfe9ff"/></svg>',
  cafe: '<svg viewBox="0 0 48 48"><path d="M9 20h26v9a11 11 0 0 1-11 11h-4A11 11 0 0 1 9 29z" fill="#ffffff"/><path d="M35 23h2a5 5 0 0 1 0 10h-3" fill="none" stroke="#fff" stroke-width="3.5"/><rect x="9" y="25" width="26" height="4" fill="#ff7eb6"/><ellipse cx="22" cy="20" rx="13" ry="3" fill="#8a5532"/><path d="M17 8c-2 3 2 5 0 8M24 6c-2 3 2 5 0 8M31 8c-2 3 2 5 0 8" stroke="#fff" stroke-width="2.4" fill="none" stroke-linecap="round" opacity=".8"/></svg>',
  estudio: '<svg viewBox="0 0 48 48"><path d="M24 6 28 18h12l-10 7 4 12-10-7-10 7 4-12-10-7h12z" fill="#ffd23f"/><circle cx="38" cy="10" r="3" fill="#fff"/><circle cx="9" cy="36" r="2.5" fill="#fff"/></svg>',
  parque: '<svg viewBox="0 0 48 48"><rect x="21" y="26" width="6" height="16" rx="2" fill="#8a5f3a"/><circle cx="24" cy="18" r="12" fill="#7ed957"/><circle cx="15" cy="24" r="8" fill="#5fbf4a"/><circle cx="33" cy="24" r="8" fill="#5fbf4a"/><circle cx="20" cy="15" r="2.5" fill="#ff6b6b"/><circle cx="29" cy="20" r="2.5" fill="#ff6b6b"/></svg>',
};
ICONS.mercado = '<svg viewBox="0 0 48 48"><path d="M5 9h6l4 20h22l4-14H13" fill="none" stroke="#fff" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M15 15h24l-3 11H17z" fill="#ffd23f"/><circle cx="18" cy="37" r="4" fill="#fff"/><circle cx="34" cy="37" r="4" fill="#fff"/><circle cx="22" cy="12" r="5" fill="#ff6b6b"/><circle cx="30" cy="12" r="4" fill="#7ed957"/></svg>';
ICONS.escola = '<svg viewBox="0 0 48 48"><rect x="8" y="10" width="32" height="22" rx="3" fill="#2c5a46" stroke="#c98a55" stroke-width="3"/><path d="M14 20h8M14 25h14" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/><path d="m31 17 4 4" stroke="#ffd23f" stroke-width="2.4" stroke-linecap="round"/><path d="M14 32 10 41M34 32l4 9" stroke="#c98a55" stroke-width="3" stroke-linecap="round"/></svg>';
ICONS.praia = '<svg viewBox="0 0 48 48"><circle cx="35" cy="12" r="6" fill="#ffd23f"/><path d="M4 34c5-3 9-3 14 0s9 3 14 0 9-3 12 0v8H4z" fill="#4dc4e8"/><path d="M22 10a14 14 0 0 1 14 14H8a14 14 0 0 1 14-14z" fill="#ff6b6b"/><path d="M17 12.5 22 24l5-11.5" fill="#fff"/><path d="M22 24v16" stroke="#fff" stroke-width="2.6" stroke-linecap="round"/></svg>';
ICONS.apto = '<svg viewBox="0 0 48 48"><rect x="10" y="6" width="28" height="36" rx="3" fill="#fff"/><g fill="#5c7cfa"><rect x="15" y="11" width="6" height="6" rx="1.5"/><rect x="27" y="11" width="6" height="6" rx="1.5"/><rect x="15" y="21" width="6" height="6" rx="1.5"/><rect x="27" y="21" width="6" height="6" rx="1.5"/></g><rect x="20" y="31" width="8" height="11" rx="2" fill="#ff8fb8"/></svg>';
ICONS.petshop = '<svg viewBox="0 0 48 48"><ellipse cx="24" cy="31" rx="10" ry="8.5" fill="#fff"/><g fill="#fff"><ellipse cx="13" cy="20" rx="4.2" ry="5.2"/><ellipse cx="20" cy="13" rx="4.2" ry="5.2"/><ellipse cx="28" cy="13" rx="4.2" ry="5.2"/><ellipse cx="35" cy="20" rx="4.2" ry="5.2"/></g></svg>';
ICONS.estancia = '<svg viewBox="0 0 48 48"><path d="M6 24 18 14l12 10v16H6z" fill="#e2553e"/><path d="M4 25 18 12l14 13" fill="none" stroke="#9a2420" stroke-width="3" stroke-linecap="round"/><path d="M12 30l12 10M24 30 12 40" stroke="#fff" stroke-width="2.4"/><rect x="33" y="10" width="9" height="30" rx="4.5" fill="#fff"/><path d="M4 42h40" stroke="#5fbf4a" stroke-width="4" stroke-linecap="round"/></svg>';
ICONS.mar = '<svg viewBox="0 0 48 48"><ellipse cx="22" cy="24" rx="13" ry="8" fill="#ffd23f"/><path d="M8 24 1 17v14z" fill="#ff9f43"/><circle cx="28" cy="22" r="2.4" fill="#2f3241"/><circle cx="38" cy="10" r="3" fill="none" stroke="#fff" stroke-width="2"/><circle cx="42" cy="18" r="2" fill="none" stroke="#fff" stroke-width="2"/><path d="M8 44c0-8 4-10 4-16M40 44c0-6-4-8-3-14" stroke="#3fae49" stroke-width="3" fill="none" stroke-linecap="round"/></svg>';
const LOC_COL = { estancia: '#b5e08a', mar: '#3aa6e0', apto: '#9fb2ff', petshop: '#ff9ec4', casa: '#ffb199', cafe: '#c79a7a', mercado: '#6fd6c8', escola: '#ffcf5c', estudio: '#c5a3ff', praia: '#7fd3f5', parque: '#8fdc7a' };

const UI = (() => {
  const $ = (s) => document.querySelector(s);
  let edChar = null, pv, pctx, toastT = 0, splashOn = true, spCtx, splashChars = [];
  let bubbleChar = null, bubbleT = 0;

  function init() {
    const dock = $('#dock');
    dock.innerHTML = '<button class="loc mapbtn" id="btnMap" aria-label="Mapa"><span class="ico"><svg viewBox="0 0 48 48"><path d="M6 12l11-4 14 4 11-4v28l-11 4-14-4-11 4z" fill="#fff"/><path d="M17 8v28M31 12v28" stroke="#c9d5e0" stroke-width="2"/><circle cx="24" cy="21" r="5" fill="#ff5f9e"/><path d="M24 31l-4-7h8z" fill="#ff5f9e"/><path d="M9 30c4-3 6 1 8-2" stroke="#7fd0ff" stroke-width="2.4" fill="none" stroke-linecap="round"/></svg></span><span class="lbl">Mapa</span></button>' + SCENE_ORDER.map((id) => `<button class="loc" data-loc="${id}" style="--c:${LOC_COL[id]}" aria-label="${SCENES[id].name}"><span class="ico">${ICONS[id]}</span><span class="lbl">${SCENES[id].name}</span><span class="badge"></span></button>`).join('');
    dock.querySelectorAll('.loc[data-loc]').forEach((b) => b.addEventListener('click', () => { Sfx.unlock(); goScene(b.dataset.loc); }));
    $('#btnMap').addEventListener('click', () => { Sfx.unlock(); MapView.show(); });
    MapView.init();
    $('#btnNight').addEventListener('click', () => { Sfx.unlock(); setNightIcon(toggleNight()); });
    $('#btnAdd').addEventListener('click', () => { Sfx.unlock(); addCharacter(); });
    $('#btnSound').addEventListener('click', () => { Sfx.unlock(); Sfx.setMuted(!Sfx.muted); setSoundIcon(); try { localStorage.setItem('vilaDoce.muted', Sfx.muted ? '1' : '0'); } catch (e) {} });
    $('#btnMenu').addEventListener('click', () => { Sfx.click(); show('#menu'); });
    $('#btnPeople').addEventListener('click', () => { Sfx.unlock(); Sfx.click(); openPeople(); });
    $('#peopleClose').addEventListener('click', () => hide('#people'));
    $('#people').addEventListener('pointerdown', (e) => { if (e.target.id === 'people') hide('#people'); });
    $('#editBubble').addEventListener('pointerdown', (e) => { e.stopPropagation(); });
    $('#editBubble').addEventListener('click', () => { const c = bubbleChar; hideBubble(); if (c) openEditor(c); });
    $('#menuClose').addEventListener('click', () => hide('#menu'));
    Album.init();
    Mini.init();
    $('#optLife').checked = Life.cfg.on;
    $('#optLife').addEventListener('change', (e) => { Life.setOn(e.target.checked); Sfx.click(); toast(e.target.checked ? 'Personagens com vontade própria 🚶' : 'Personagens parados'); });
    $('#optClock').checked = Weather.cfg.clock;
    $('#optClock').addEventListener('change', (e) => { Weather.setCfg('clock', e.target.checked); Sfx.click(); });
    buildWxOpts();
    $('#optChat').checked = Chat.cfg.chat; $('#optVoices').checked = Chat.cfg.voices;
    $('#optChat').addEventListener('change', (e) => { Chat.setCfg('chat', e.target.checked); Sfx.click(); toast(e.target.checked ? 'Conversas ligadas 💬' : 'Conversas desligadas'); });
    $('#optVoices').addEventListener('change', (e) => { Chat.setCfg('voices', e.target.checked); Sfx.unlock(); if (e.target.checked) Sfx.speak('Oba! Vozes ligadas!', 1.1); toast(e.target.checked ? 'Vozes ligadas 🗣️' : 'Vozes desligadas'); });
    $('#menuFull').addEventListener('click', () => {
      const d = document.documentElement;
      if (!document.fullscreenElement) (d.requestFullscreen || d.webkitRequestFullscreen || (() => {})).call(d);
      else document.exitFullscreen();
      hide('#menu');
    });
    let resetArm = false;
    $('#menuReset').addEventListener('click', (ev) => {
      if (!resetArm) { resetArm = true; ev.currentTarget.textContent = 'Toque de novo para confirmar'; setTimeout(() => { resetArm = false; $('#menuReset').textContent = 'Recomeçar o mundo'; }, 2500); return; }
      resetArm = false; $('#menuReset').textContent = 'Recomeçar o mundo';
      resetWorld(); hide('#menu'); toast('Mundo novinho em folha ✨');
    });
    // editor
    pv = $('#pv'); pctx = pv.getContext('2d');
    $('#edOk').addEventListener('click', closeEditor);
    $('#editor').addEventListener('pointerdown', (e) => { if (e.target.id === 'editor') closeEditor(); });
    $('#edName').addEventListener('input', (e) => { if (edChar) edChar.name = e.target.value.slice(0, 12) || '?'; });
    let delArm = false;
    $('#edDel').addEventListener('click', (ev) => {
      if (!edChar) return;
      if (!delArm) { delArm = true; ev.currentTarget.textContent = 'Confirmar?'; setTimeout(() => { delArm = false; $('#edDel').textContent = 'Remover'; }, 2200); return; }
      delArm = false; $('#edDel').textContent = 'Remover';
      emit('poof', edChar.x, edChar.y - 150, 12); Sfx.poof(); removeEnt(edChar); closeEditor(); refreshDock();
    });
    $('#edRand').addEventListener('click', () => {
      if (!edChar) return;
      if (edChar.kind === 'item') Object.assign(edChar, { col: pick(PET_COLS), collar: pick(CLOTH), spot: Math.random() < 0.5 });
      else Object.assign(edChar, randomLook());
      Sfx.sparkle(); buildEditor();
    });
    $('#btnDecor').addEventListener('click', () => { Sfx.unlock(); Sfx.click(); decorOn() ? closeDecor() : openDecor(); });
    $('#decoDone').addEventListener('click', closeDecor);
    document.querySelectorAll('.dtabs button').forEach((b) => b.addEventListener('click', () => { if (b.disabled) return; decoTab = b.dataset.tab; Sfx.click(); buildDecor(); setBottomReserve($('#decoPanel').offsetHeight + 20); }));
    // splash
    spCtx = $('#spCanvas').getContext('2d');
    splashChars = [0, 1, 2].map((i) => Object.assign(C('', 'casa', 0, 0), { phase: i * 2 }));
    splashChars[1].hat = 'crown';
    $('#play').addEventListener('click', () => {
      Sfx.unlock(); Sfx.sparkle();
      splashOn = false; $('#splash').classList.add('out');
      setTimeout(() => $('#splash').remove(), 700);
      MapView.show();
      setTimeout(() => Album.unlock('l_' + G.sceneId), 900);
      if (innerHeight > innerWidth * 1.2) setTimeout(() => toast('Dica: gire o celular para ver mais 🔄'), 900);
    });
    try { if (localStorage.getItem('vilaDoce.muted') === '1') Sfx.setMuted(true); } catch (e) {}
    setSoundIcon(); setNightIcon(G.night); setScene(G.sceneId);
  }
  function show(s) { $(s).classList.remove('hidden'); }
  function hide(s) { $(s).classList.add('hidden'); }
  function buildWxOpts() {
    const groups = [
      ['mode', 'Clima', [['auto', 'Automático'], ['sol', '☀️ Sol'], ['chuva', '🌧️ Chuva'], ['geada', '❄️ Geada'], ['neve', '☃️ Neve']]],
      ['season', 'Estação', [['auto', 'Pela data'], ['verao', 'Verão'], ['outono', 'Outono'], ['inverno', 'Inverno'], ['primavera', 'Primavera']]],
      ['fest', 'Festa', [['auto', 'Pela data'], ['none', 'Nenhuma'], ['farroupilha', 'Farroupilha'], ['junina', 'Junina'], ['natal', 'Natal'], ['pascoa', 'Páscoa'], ['anonovo', 'Ano Novo']]],
    ];
    $('#wxOpts').innerHTML = groups.map(([k, label, opts]) => `<div class="wxRow"><span>${label}</span><div class="chips">${opts.map(([v, l]) => `<button class="chip ${Weather.cfg[k] === v ? 'sel' : ''}" data-wk="${k}" data-v="${v}">${l}</button>`).join('')}</div></div>`).join('');
    $('#wxOpts').querySelectorAll('[data-wk]').forEach((b) => b.addEventListener('click', () => { Weather.setCfg(b.dataset.wk, b.dataset.v); Sfx.click(); buildWxOpts(); }));
  }
  function syncNight() { setNightIcon(G.night); }
  function blocking() { return splashOn || MapView.isOpen() || Album.isOpen() || Mini.isOpen() || !$('#menu').classList.contains('hidden') || !$('#people').classList.contains('hidden') || !!edChar; }

  // ---------- bolha "Editar" sobre o personagem tocado ----------
  function showBubble(c) { bubbleChar = c; bubbleT = 3.2; $('#editBubble').classList.remove('hidden'); placeBubble(); }
  function hideBubble() { bubbleChar = null; $('#editBubble').classList.add('hidden'); }
  function placeBubble() {
    const c = bubbleChar;
    if (!c || !getEnt(c.id) || c.scene !== G.sceneId || c.state === 'held' || c.state === 'booth') { hideBubble(); return; }
    if (c.heldBy) { hideBubble(); return; }
    const h = c.kind === 'item' ? { x: c.x, y: c.y - 30 } : headPos(c), b = $('#editBubble');
    const x = (h.x - G.cam[G.sceneId]) * SCALE, y = (h.y - (c.state === 'sleep' ? 90 : 120) - CAMY) * SCALE;
    b.style.left = Math.round(x) + 'px'; b.style.top = Math.round(Math.max(70, y)) + 'px';
  }

  // ---------- modo Decorar ----------
  let decoTab = 'moveis', decoRoom = null, decoScene = null, decoCat = 'todos';
  function decorOn() { return !$('#decoPanel').classList.contains('hidden'); }
  function openDecor() {
    $('#decoPanel').classList.remove('hidden'); $('#dockWrap').classList.add('away'); $('#btnDecor').classList.add('active');
    decoRoom = null; buildDecor(); toast('Modo Decorar: arraste os móveis para a cena 🛋️');
    setBottomReserve($('#decoPanel').offsetHeight + 20);
  }
  function closeDecor() {
    $('#decoPanel').classList.add('hidden'); $('#dockWrap').classList.remove('away'); $('#btnDecor').classList.remove('active');
    setBottomReserve(92);
    Sfx.click(); save();
  }
  function thumb(cv, type) {
    const T = ITEMS[type], r = cv.getBoundingClientRect(), d = Math.min(devicePixelRatio || 1, 2);
    cv.width = Math.round(r.width * d); cv.height = Math.round(r.height * d);
    const g = cv.getContext('2d'), prev = X; X = g;
    const s = Math.min((r.width - 10) / T.w, (r.height - 8) / T.h);
    X.setTransform(d * s, 0, 0, d * s, (r.width / 2) * d, (r.height - 4) * d);
    drawItemShape({ type, v: 0, level: 1 }, G.t);
    X = prev;
  }
  function buildDecor() {
    const sc = S(), st = G.st[sc.id], body = $('#decoBody');
    const hasRooms = !!sc.rooms;
    document.querySelectorAll('.dtabs button').forEach((b) => {
      b.disabled = b.dataset.tab !== 'moveis' && !hasRooms;
      b.classList.toggle('on', b.dataset.tab === decoTab);
    });
    if (!hasRooms && decoTab !== 'moveis') { decoTab = 'moveis'; return buildDecor(); }
    decoScene = sc.id;
    if (decoTab === 'moveis') {
      const list = decoCat === 'todos' ? DECOR_LIST : DECOR_LIST.filter((k) => ITEMS[k].cat === decoCat);
      body.innerHTML = `<div class="chips dcats">${[['todos', '✨ Todos'], ...DECOR_CATS].map(([k, l]) => `<button class="chip ${decoCat === k ? 'sel' : ''}" data-dcat="${k}">${l}</button>`).join('')}</div>`
        + `<div class="dlist">${list.map((k) => `<button class="dcard" data-type="${k}"><canvas></canvas><span>${ITEMS[k].n}</span></button>`).join('')}</div>`;
      body.querySelectorAll('[data-dcat]').forEach((b) => b.addEventListener('click', () => { decoCat = b.dataset.dcat; Sfx.click(); buildDecor(); setBottomReserve($('#decoPanel').offsetHeight + 20); }));
      body.querySelectorAll('.dcard').forEach((b) => {
        thumb(b.querySelector('canvas'), b.dataset.type);
        b.addEventListener('click', () => {
          if (!canSpawn()) return;
          const type = b.dataset.type, T = ITEMS[type];
          const x = G.cam[sc.id] + VW / 2 + rand(-120, 120);
          const y = T.wall ? rand(260, 380) : sc.floorTop + 30 + rand(0, 40);
          const it = spawnItem(type, x, y, sc.id);
          if (!T.wall) { it.y = 200; startFall(it, 0, 0); it.floorY = y; }
          Sfx.pop(); Album.unlock('a_decor');
        });
      });
      return;
    }
    if (decoRoom == null || decoRoom >= sc.rooms.length) decoRoom = roomAt(sc, G.cam[sc.id] + VW / 2);
    const r = st.rooms[decoRoom];
    const roomChips = `<div class="chips">${sc.rooms.map((rm, i) => `<button class="chip ${i === decoRoom ? 'sel' : ''}" data-room="${i}">${rm.name}</button>`).join('')}</div>`;
    const sw = (key, list) => `<div class="sw">${list.map((c) => `<button class="swc ${r[key] === c ? 'sel' : ''}" style="background:${c}" data-rk="${key}" data-v="${c}"></button>`).join('')}</div>`;
    const ch = (key, list) => `<div class="chips">${list.map(([v, l]) => `<button class="chip ${r[key] === v ? 'sel' : ''}" data-rk="${key}" data-v="${v}">${l}</button>`).join('')}</div>`;
    body.innerHTML = `<div class="dgrid">${roomChips}${decoTab === 'paredes' ? sw('wall', WALLC) + ch('pat', WALL_PATS) : sw('fc', FLOORC) + ch('floor', FLOOR_TYPES)}</div>`;
    body.querySelectorAll('[data-room]').forEach((b) => b.addEventListener('click', () => {
      decoRoom = +b.dataset.room; Sfx.click();
      const rm = sc.rooms[decoRoom]; G.cam[sc.id] = (Math.max(rm.x1, 0) + Math.min(rm.x2, sc.W)) / 2 - VW / 2; clampCam(sc.id);
      buildDecor();
    }));
    body.querySelectorAll('[data-rk]').forEach((b) => b.addEventListener('click', () => {
      r[b.dataset.rk] = b.dataset.v; Sfx.sparkle(); if (b.dataset.rk === 'wall' || b.dataset.rk === 'pat') Album.unlock('a_pintor');
      const rm = sc.rooms[decoRoom];
      for (let i = 0; i < 8; i++) emit('star', rand(Math.max(rm.x1, G.cam[sc.id]), Math.min(rm.x2, G.cam[sc.id] + VW)), rand(200, 900), 1);
      buildDecor();
    }));
  }

  // ---------- painel de personagens ----------
  function openPeople() {
    const chars = G.ents.filter((e) => e.kind === 'char').concat(G.ents.filter((e) => e.type === 'pet'));
    const grid = $('#peopleGrid');
    grid.innerHTML = chars.map((c) => { const bf = c.kind === 'char' ? Life.bestFriend(c) : null; return `<button class="pcard" data-id="${c.id}"><canvas></canvas><b>${c.name.replace(/[<>&]/g, '')}</b><small><i style="background:${LOC_COL[c.scene]}"></i>${SCENES[c.scene].name}</small>${bf ? `<small class="bff">💞 ${bf.name.replace(/[<>&]/g, '')}</small>` : ''}</button>`; }).join('')
      + '<button class="pcard add" id="pAdd"><span>+</span><b>Novo</b><small>personagem</small></button>';
    show('#people');
    grid.querySelectorAll('.pcard[data-id]').forEach((b) => {
      const c = getEnt(+b.dataset.id), cv = b.querySelector('canvas'), r = cv.getBoundingClientRect();
      drawFigure(cv.getContext('2d'), r.width, r.height, [c], G.t, r.height / 400);
      b.addEventListener('click', () => {
        hide('#people');
        if (c.heldBy) { const h = getEnt(c.heldBy); if (h) { h.hold = null; c.heldBy = null; c.x = h.x + 80; c.y = h.y; c.state = 'idle'; } }
        if (c.scene !== G.sceneId) goScene(c.scene);
        G.cam[c.scene] = c.x - VW / 2; clampCam(c.scene);
        setTimeout(() => openEditor(c), 120);
      });
    });
    $('#pAdd').addEventListener('click', () => { hide('#people'); const c = addCharacter(); setTimeout(() => openEditor(c), 700); });
  }
  function setNightIcon(n) {
    $('#btnNight').innerHTML = n
      ? '<svg viewBox="0 0 24 24"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" fill="#ffd23f"/></svg>'
      : '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="5" fill="#ffb400"/><g stroke="#ffb400" stroke-width="2.2" stroke-linecap="round"><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8"/></g></svg>';
  }
  function setSoundIcon() {
    $('#btnSound').innerHTML = Sfx.muted
      ? '<svg viewBox="0 0 24 24"><path d="M4 9h4l5-4v14l-5-4H4z" fill="#5b6474"/><path d="m16 9 5 6m0-6-5 6" stroke="#ff6b6b" stroke-width="2.2" stroke-linecap="round"/></svg>'
      : '<svg viewBox="0 0 24 24"><path d="M4 9h4l5-4v14l-5-4H4z" fill="#5c7cfa"/><path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" stroke="#5c7cfa" stroke-width="2.2" fill="none" stroke-linecap="round"/></svg>';
  }
  function setScene(id) {
    document.querySelectorAll('.loc').forEach((b) => b.classList.toggle('on', b.dataset.loc === id));
    const f = $('#fade'); f.classList.remove('go'); void f.offsetWidth; f.classList.add('go');
    $('#sceneName').textContent = SCENES[id].name;
    hideBubble();
    if (decorOn() && decoScene !== id) { decoRoom = null; buildDecor(); }
    const cur = document.querySelector(`.loc[data-loc="${id}"]`);
    if (cur && cur.scrollIntoView) cur.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
    refreshDock();
  }
  function refreshDock() {
    document.querySelectorAll('.loc[data-loc]').forEach((b) => {
      const n = G.ents.filter((e) => e.kind === 'char' && e.scene === b.dataset.loc).length;
      const el = b.querySelector('.badge'); el.textContent = n || ''; el.style.display = n ? '' : 'none';
    });
  }
  function toast(msg) {
    const t = $('#toast'); t.textContent = msg; t.classList.add('show');
    clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 2200);
  }
  function dragStart(e) { $('#dock').classList.add('drag'); $('#dropHint').textContent = e.kind === 'char' ? `Solte ${e.name} num lugar para viajar` : 'Solte num lugar para enviar'; }
  function dragHover(x, y) {
    const el = document.elementFromPoint(x, y), loc = el && el.closest ? el.closest('[data-loc]') : null;
    document.querySelectorAll('.loc').forEach((b) => b.classList.toggle('hover', b === loc));
  }
  function dragEnd() { $('#dock').classList.remove('drag'); document.querySelectorAll('.loc.hover').forEach((b) => b.classList.remove('hover')); }

  // ---------- editor ----------
  function swatches(key, list) {
    return `<div class="sw">${list.map((c) => `<button class="swc ${edChar[key] === c ? 'sel' : ''}" style="background:${c}" data-k="${key}" data-v="${c}" aria-label="${c}"></button>`).join('')}</div>`;
  }
  function chips(key, list) {
    return `<div class="chips">${list.map(([v, l]) => `<button class="chip ${String(edChar[key]) === String(v) ? 'sel' : ''}" data-k="${key}" data-v="${v}">${l}</button>`).join('')}</div>`;
  }
  function buildEditor() {
    const c = edChar;
    $('#edName').value = c.name;
    $('#edTabs').style.display = c.kind === 'item' ? 'none' : '';
    if (c.kind !== 'item') { buildCharEditor(); return; }
    if (c.kind === 'item') {
      $('#edOpts').innerHTML = `
        <h4>Espécie</h4>${chips('species', SPECIES)}
        <h4>Cor</h4>${swatches('col', PET_COLS)}
        <h4>Manchinhas</h4>${chips('spot', [['true', 'Com manchas'], ['false', 'Sem manchas']])}
        <h4>Coleira</h4>${swatches('collar', CLOTH)}
        <h4>Chapéu</h4>${chips('hat', [['', 'Nenhum'], ...Object.keys(WEAR).filter((k) => WEAR[k].slot === 'hat').map((k) => [k, WEAR[k].n])])}`;
      $('#edOpts').querySelectorAll('[data-k]').forEach((b) => b.addEventListener('click', () => {
        const k = b.dataset.k; let v = b.dataset.v;
        if (k === 'spot') v = v === 'true';
        if (k === 'hat' && v === '') v = null;
        edChar[k] = v; edChar.happyT = 1.2; petSound(edChar.species);
        const sc = $('#edOpts').scrollTop; buildEditor(); $('#edOpts').scrollTop = sc;
      }));
      return;
    }
    $('#edOpts').innerHTML = `
      <h4>Pele</h4>${swatches('skin', SKINS)}
      <h4>Cabelo</h4>${chips('hairStyle', HAIR_STYLES.map((n, i) => [i, n]))}
      ${swatches('hairColor', HAIRC)}
      <h4>Olhos</h4>${swatches('eyes', EYES)}
      <h4>Roupa</h4>${chips('top', TOPS)}
      ${swatches('shirt', CLOTH)}
      <h4>${c.top === 'dress' ? 'Meias' : 'Calça'}</h4>${swatches('pants', CLOTH)}
      <h4>Sapatos</h4>${swatches('shoes', SHOES)}
      <h4>Acessórios</h4>${chips('hat', [['', 'Nenhum'], ...Object.keys(WEAR).filter((k) => WEAR[k].slot === 'hat').map((k) => [k, WEAR[k].n])])}
      ${chips('face', [['', 'Sem óculos'], ...Object.keys(WEAR).filter((k) => WEAR[k].slot === 'face').map((k) => [k, WEAR[k].n])])}`;
    $('#edOpts').querySelectorAll('[data-k]').forEach((b) => b.addEventListener('click', () => {
      const k = b.dataset.k; let v = b.dataset.v;
      if (k === 'hairStyle') v = +v;
      if ((k === 'hat' || k === 'face') && v === '') v = null;
      edChar[k] = v; Sfx.click(); edChar.reactT = 0.8;
      const sc = $('#edOpts').scrollTop; buildEditor(); $('#edOpts').scrollTop = sc;
    }));
  }
  // ---------- editor do personagem (abas) ----------
  const ED_TABS = [['corpo', 'Corpo'], ['cabelo', 'Cabelo'], ['roupa', 'Roupas'], ['acess', 'Acessórios'], ['fant', 'Fantasias ✨']];
  const COSTUMES = [
    ['Princesa dourada', { top: 'gown', shirt: '#ffd23f', hat: 'tiara', hairStyle: 11, hairColor: '#5a3824', shoes: '#ffd23f', shoeStyle: 'flat' }],
    ['Princesa azul', { top: 'gown', shirt: '#9fd3ff', hat: 'tiara', hairStyle: 5, hairColor: '#f3d27a', shoes: '#ffffff', shoeStyle: 'flat' }],
    ['Rainha do gelo', { top: 'icegown', shirt: '#a5d8ff', hairStyle: 8, hairColor: '#f2f2f2', shoes: '#cfe7ff', shoeStyle: 'flat' }],
    ['Sereia', { top: 'tank', shirt: '#a77bf3', bottom: 'mermaid', pants: '#2ec4b6', hairStyle: 11, hairColor: '#e2553e' }],
    ['Patrulheiro espacial', { top: 'space', shirt: '#ffffff', shoes: '#a77bf3', shoeStyle: 'boot', hairStyle: 0 }],
    ['Pirata', { top: 'shirt', shirt: '#ffffff', pants: '#2f3241', shoes: '#2f3241', shoeStyle: 'boot', hat: 'pirate' }],
    ['Mago', { top: 'hoodie', shirt: '#5c7cfa', pants: '#2f3241', shoes: '#5b6474', hat: 'wizard', back: 'cape' }],
    ['Ratinha', { top: 'dress', shirt: '#ff3b4f', pants: '#ffffff', shoes: '#ffd23f', shoeStyle: 'flat', hat: 'dotbow' }],
    ['Ratinho', { top: 'tank', shirt: '#2f3241', bottom: 'shorts', pants: '#ff3b4f', shoes: '#ffd23f', shoeStyle: 'sneaker', hat: 'mouseears' }],
    ['Cowboy', { top: 'shirt', shirt: '#ffd23f', pants: '#4a63d9', shoes: '#8a5532', shoeStyle: 'boot', hat: 'cowboy' }],
    ['Fada', { top: 'dress', shirt: '#7ed957', pants: '#7ed957', shoes: '#7ed957', shoeStyle: 'flat', hairStyle: 5, hairColor: '#f3d27a', back: 'wings' }],
    ['Super-herói', { top: 'tee', shirt: '#4dabf7', pants: '#4dabf7', shoes: '#ff4d4d', shoeStyle: 'boot', back: 'cape', face: 'mask' }],
    ['Cabelo superlongo', { top: 'dress', shirt: '#a77bf3', pants: '#ff7eb6', shoes: '#ff7eb6', shoeStyle: 'flat', hairStyle: 12, hairColor: '#f3d27a', hat: 'flowercrown' }],
    ['Roqueira', { top: 'jacket', shirt: '#2f3241', bottom: 'skirt', pants: '#ff3b4f', shoes: '#2f3241', shoeStyle: 'boot', hairStyle: 10, hairColor: '#ff8fc0', face: 'sunglasses', hat: 'headphones' }],
    ['Gaúcho', { top: 'shirt', shirt: '#ffffff', bottom: 'bombacha', pants: '#2f3241', shoes: '#2f3241', shoeStyle: 'boot', hat: 'gaucho', neck: 'lenco' }],
    ['Prenda', { top: 'prenda', shirt: '#ff7eb6', hairStyle: 8, hat: 'flower', shoes: '#ffffff', shoeStyle: 'flat', neck: null }],
    ['Chef', { top: 'shirt', shirt: '#ffffff', pants: '#2f3241', shoes: '#2f3241', hat: 'chef', neck: 'gravata' }],
    ['Unicórnio', { top: 'ruffle', shirt: '#d6c4fb', bottom: 'tutu', pants: '#ff9ec4', shoes: '#ffffff', shoeStyle: 'flat', hat: 'unicornio', hairTip: '#8d6bea' }],
    ['Dinossauro', { top: 'hoodie', shirt: '#62c24f', pants: '#62c24f', shoes: '#ffd23f', hat: 'dino', back: 'dinocauda' }],
    ['Papai Noel', { top: 'raincoat', shirt: '#e03131', pants: '#e03131', shoes: '#2f3241', shoeStyle: 'boot', hat: 'papainoel', face: 'bigode' }],
    ['Palhaço', { top: 'stripes', shirt: '#ffd23f', bottom: 'pants', pants: '#4dabf7', shoes: '#ff6b6b', hairStyle: 18, hairColor: '#e2553e', face: 'palhaco', neck: 'gravata' }],
    ['Bailarina', { top: 'tank', shirt: '#ffb3cf', bottom: 'tutu', pants: '#ffd6e5', shoes: '#ffb3cf', shoeStyle: 'flat', hairStyle: 5 }],
    ['Pijama', { top: 'pajama', shirt: '#5c7cfa', pants: '#5c7cfa', shoes: '#ffffff', shoeStyle: 'pantufa' }],
    ['Dia de chuva', { top: 'raincoat', shirt: '#ffd23f', shoes: '#ffd23f', shoeStyle: 'galocha' }],
    ['Explorador', { top: 'shirt', shirt: '#c9a24a', bottom: 'shorts', pants: '#8a5532', shoes: '#8a5532', shoeStyle: 'boot', back: 'backpack', hat: 'cap' }],
    ['Escolar', { top: 'cardigan', shirt: '#2f3241', bottom: 'pleated', pants: '#2f3241', shoes: '#2f3241', shoeStyle: 'flat', socks: '#ffffff', hairStyle: 19, hairColor: '#f3d27a', hairColor2: '#2b1d16' }],
    ['Vaquinha', { top: 'cowprint', shirt: '#2f3241', bottom: 'jeans', pants: '#6a8cc7', shoes: '#ffffff', shoeStyle: 'chunky', hat: 'bucket', back: 'bolsa' }],
    ['Avental vaquinha', { top: 'cowdress', shirt: '#2f3241', pants: '#ffc2d9', shoes: '#ff7eb6', shoeStyle: 'hightop', socks: '#ffffff', hairStyle: 3, hat: 'presilhas' }],
    ['Tie-dye', { top: 'tiedye', shirt: '#ff7eb6', bottom: 'cargo', pants: '#b9e4c9', shoes: '#ffffff', shoeStyle: 'chunky', hairStyle: 20, hairColor: '#ff8fc0' }],
    ['Cropped fofo', { top: 'crop', shirt: '#ffc2d9', bottom: 'plaidpants', pants: '#ff6b6b', shoes: '#ffffff', shoeStyle: 'hightop', hairStyle: 22, hairColor: '#9a5b2c', hat: 'presilhas' }],
    ['Jardineira cereja', { top: 'overalls', shirt: '#ffffff', pants: '#ff9fc0', bottom: 'plaidpants', shoes: '#2f3241', shoeStyle: 'chunky', hairStyle: 21, back: 'backpack' }],
  ];
  const COSTUME_BASE = { hat: null, face: null, back: null, neck: null, hairTip: null, socks: null, bottom: 'pants', shoeStyle: 'sneaker' };
  let edTab = 'corpo';
  const yesNo = [['true', 'Sim'], ['false', 'Não']];
  const slotChips = (slot, none) => [['', none], ...Object.keys(WEAR).filter((k) => WEAR[k].slot === slot).map((k) => [k, WEAR[k].n])];
  function buildCharEditor() {
    const c = edChar;
    $('#edTabs').innerHTML = ED_TABS.map(([k, l]) => `<button class="${k === edTab ? 'on' : ''}" data-tab="${k}">${l}</button>`).join('');
    $('#edTabs').querySelectorAll('button').forEach((b) => b.addEventListener('click', () => { edTab = b.dataset.tab; Sfx.click(); buildCharEditor(); $('#edOpts').scrollTop = 0; }));
    const dress = DRESSES.has(c.top);
    let html = '';
    if (edTab === 'corpo') html = `<h4>Pele</h4>${swatches('skin', SKINS)}<h4>Sardas</h4>${chips('freckles', yesNo)}<h4>Cílios</h4>${chips('lashes', yesNo)}<h4>Voz</h4>${chips('voice', [['0.7', 'Grave'], ['1', 'Média'], ['1.3', 'Aguda'], ['1.7', 'Fininha']])}`;
    else if (edTab === 'cabelo') html = `<h4>Penteado</h4>${chips('hairStyle', HAIR_STYLES.map((n, i) => [i, n]))}<h4>Cor do cabelo</h4>${swatches('hairColor', HAIRC)}${c.hairStyle === 19 ? `<h4>Segunda cor (lado direito)</h4>${swatches('hairColor2', HAIRC)}` : ''}<h4>Mechas coloridas</h4>${chips('hairTip', [['', 'Sem mechas']])}${swatches('hairTip', HAIRC)}`;
    else if (edTab === 'roupa') html = `<h4>Parte de cima</h4>${chips('top', TOPS)}${swatches('shirt', CLOTH)}
      <h4>${dress ? (c.top === 'cowdress' ? 'Camiseta' : 'Cor extra') : 'Parte de baixo'}</h4>${dress ? '' : chips('bottom', BOTTOMS)}${swatches('pants', CLOTH)}
      <h4>Sapatos</h4>${chips('shoeStyle', SHOE_STYLES)}${swatches('shoes', SHOES.concat(['#ffd23f', '#a77bf3', '#ff7eb6', '#7ed957']).filter((v, i, a) => a.indexOf(v) === i))}
      <h4>Meias</h4>${chips('socks', [['', 'Sem meias']])}${swatches('socks', ['#ffffff', '#ff7eb6', '#ffd23f', '#7ed1f7', '#a77bf3', '#2f3241', '#ff6b6b'])}`;
    else if (edTab === 'acess') html = `<h4>Cabeça</h4>${chips('hat', slotChips('hat', 'Nenhum'))}<h4>Rosto</h4>${chips('face', slotChips('face', 'Nada'))}<h4>Pescoço</h4>${chips('neck', slotChips('neck', 'Nada'))}<h4>Costas</h4>${chips('back', slotChips('back', 'Nada'))}`;
    else html = `<h4>Fantasias prontas — toque para vestir</h4><div class="cgrid">${COSTUMES.map(([n], i) => `<button class="ccard" data-cos="${i}"><canvas></canvas><span>${n}</span></button>`).join('')}</div>`;
    $('#edOpts').innerHTML = html;
    $('#edOpts').querySelectorAll('[data-k]').forEach((b) => b.addEventListener('click', () => {
      const k = b.dataset.k; let v = b.dataset.v;
      if (k === 'hairStyle') v = +v;
      if (k === 'freckles' || k === 'lashes') v = v === 'true';
      if (k === 'voice') v = +v;
      if ((k === 'hat' || k === 'face' || k === 'back' || k === 'neck' || k === 'hairTip' || k === 'socks') && v === '') v = null;
      edChar[k] = v; Sfx.click(); edChar.reactT = 0.8;
      if (k === 'voice') { Sfx.speak(`Oi! Eu sou ${edChar.name}!`, v); edChar.say = { text: `Oi! Eu sou ${edChar.name}!`, t: 0, dur: 1.4 }; }
      const sc = $('#edOpts').scrollTop; buildCharEditor(); $('#edOpts').scrollTop = sc;
    }));
    $('#edOpts').querySelectorAll('[data-cos]').forEach((b) => {
      const look = Object.assign({}, c, COSTUME_BASE, COSTUMES[+b.dataset.cos][1], { hold: null, state: 'idle', reactT: 0, eatT: 0, sq: 0, pop: null, blinkT: 2 });
      const cv = b.querySelector('canvas'), r = cv.getBoundingClientRect();
      drawFigure(cv.getContext('2d'), r.width, r.height, [look], G.t, r.height / 420);
      b.addEventListener('click', () => {
        Object.assign(edChar, COSTUME_BASE, COSTUMES[+b.dataset.cos][1]); Album.unlock('a_fantasia');
        edChar.reactT = 1.2; Sfx.sparkle(); emit('star', edChar.x, edChar.y - 200, 12);
        const sc = $('#edOpts').scrollTop; buildCharEditor(); $('#edOpts').scrollTop = sc;
      });
    });
  }
  function openEditor(c) {
    if (edChar || !getEnt(c.id)) return;
    edChar = c; buildEditor(); show('#editor'); Sfx.sparkle();
    for (const P of pointers.values()) if (P.ent) release(P, toWorld(P.cx, P.cy));
    pointers.clear();
  }
  function closeEditor() { edChar = null; hide('#editor'); Sfx.click(); save(); }

  function drawFigure(c2d, w, h, chars, t, scale) {
    const d = Math.min(devicePixelRatio || 1, 2);
    const cv = c2d.canvas;
    if (cv.width !== Math.round(w * d)) { cv.width = Math.round(w * d); cv.height = Math.round(h * d); }
    const prevX = X, prevInv = G.viewInv;
    X = c2d; G.viewInv = null;
    X.setTransform(d, 0, 0, d, 0, 0); X.clearRect(0, 0, w, h);
    chars.forEach((c, i) => {
      const cx = w * (i + 1) / (chars.length + 1);
      X.save(); X.setTransform(d * scale, 0, 0, d * scale, cx * d, (h - 14) * d);
      softShadow(0, 2, 80, 0.25);
      const keep = { x: c.x, y: c.y, state: c.state };
      c.x = 0; c.y = 0; if (c.state !== 'idle') c.state = 'idle';
      if (c.kind === 'item') { const k = Math.min(1.6, (w * 0.9) / (260 * scale)); X.scale(k, k); X.translate(-12, 0); drawItemShape(c, t); }
      else drawChar(c, t);
      c.x = keep.x; c.y = keep.y; c.state = keep.state;
      X.restore();
    });
    X = prevX; G.viewInv = prevInv;
  }
  let lastTick = 0;
  function tick(t) {
    const dt = t - lastTick; lastTick = t;
    if (bubbleChar) { bubbleT -= dt; if (bubbleT <= 0 || edChar) hideBubble(); else placeBubble(); }
    if (edChar) {
      edChar.blinkT -= 0; // olhos animados pelo motor
      const r = pv.getBoundingClientRect();
      drawFigure(pctx, r.width, r.height, [edChar], t, Math.min(r.height / 480, r.width / 230));
    }
    if (splashOn) {
      const cv = $('#spCanvas'); if (!cv) return;
      const r = cv.getBoundingClientRect();
      splashChars.forEach((c, i) => { c.reactT = Math.sin(t * 1.5 + i * 2) > 0.6 ? 0.2 : 0; c.blinkT = ((t + i) % 3.5) + 0.01; });
      drawFigure(spCtx, r.width, r.height, splashChars, t, Math.min(r.height / 420, r.width / 700));
    }
  }
  return { init, toast, setScene, refreshDock, dragStart, dragHover, dragEnd, openEditor, blocking, tick, showBubble, hideBubble, decorOn, syncNight };
})();
