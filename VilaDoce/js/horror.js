'use strict';
// ======================================================
//  A Vila por baixo: o horror que vai aparecendo aos poucos
// ======================================================
//  Fases (avançam com o tempo de jogo OU com as partidas no Fliperama):
//   0 – tudo normal
//   1 – quase imperceptível: alguém para e olha para você; uma fala sai errada
//   2 – inquietante: um estranho aparece no canto, figura na janela à noite,
//       música do rádio desafina, uma figurinha do álbum muda
//   3 – pronto para a virada: ela acontece na próxima partida do Fliperama
//   4 – depois da virada: a vila nunca mais amanhece
//
//  Para testar: abra o jogo com ?fase=0..4 no endereço (ex.: index.html?fase=2)
//  ou rode Horror.setStage(2) no console. Horror.reset() volta tudo ao normal.
//
//  TEXTOS: todos ficam aqui embaixo para você trocar pela sua história.
// ======================================================
const HORROR_TXT = {
  // falas que escapam no meio do dia, por fase
  falas: {
    1: ['Você também ouviu alguém bater na porta ontem?', 'Quantas pessoas moravam aqui antes?', 'Às vezes eu esqueço de piscar.', 'Já reparou que ninguém sai da vila?'],
    2: ['Não olha para a janela.', 'Ele voltou.', 'A gente não pode parar de sorrir.', 'Você está jogando há bastante tempo, né?', 'Quem é aquele no canto?'],
    4: ['Você ficou.', 'Agora você também mora aqui.', 'Ninguém vai embora da Vila.', 'Sorria.', 'Por que você parou de sorrir?'],
  },
  // avisos (toasts) estranhos
  avisos: {
    2: ['Bom dia. Ele também acordou.', 'Alguém mexeu nos seus móveis.', 'Salvo. Salvo. Salvo.'],
    4: ['Não existe dia na Vila.', 'Ele está olhando.', 'Você não pode sair.'],
  },
  estranho: '???',                // nome do morador que aparece sozinho
  estranhoFala: '...',            // o que ele diz quando você toca nele
  // texto da virada (uma linha por vez, na tela preta)
  virada: ['Você jogou bastante.', 'A gente gostou de você.', 'Então você vai ficar.', 'Para sempre.'],
  tituloDepois: 'Vila',           // o nome do jogo depois da virada
  subtituloDepois: 'Ninguém vai embora.',
  noiteFixa: 'Não existe dia na Vila.',
};
// minutos de jogo ou partidas no Fliperama para chegar a cada fase (o que vier primeiro)
const HORROR_FASES = [null, { min: 8, plays: 3 }, { min: 20, plays: 8 }, { min: 35, plays: 15 }];

const Horror = (() => {
  const KEY = 'vilaDoce.h';
  const st = { t: 0, plays: 0, stage: 0 };
  try { Object.assign(st, JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) { /* sem armazenamento */ }
  const q = /[?&]fase=(\d)/.exec(location.search);
  if (q) st.stage = +q[1];
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) { /* sem armazenamento */ } };
  let saveT = 0, evT = 40, ghostT = 0, rv = null;

  function check() {
    if (st.stage >= 3) return;
    const f = HORROR_FASES[st.stage + 1];
    if (st.t / 60 >= f.min || st.plays >= f.plays) { st.stage++; save(); applyStage(); }
  }
  function applyStage() {
    Sfx.setDetune && Sfx.setDetune(st.stage >= 4 ? 0.08 : st.stage >= 2 ? 0.025 : 0);
    if (st.stage >= 4) {
      document.title = HORROR_TXT.tituloDepois;
      const b = document.querySelector('.brand b'); if (b) b.textContent = HORROR_TXT.tituloDepois;
      const h = document.querySelector('#splash h1'); if (h) h.textContent = HORROR_TXT.tituloDepois;
      const p = document.querySelector('#splash p'); if (p) p.textContent = HORROR_TXT.subtituloDepois;
      document.documentElement.classList.add('vila-escura');
    }
  }

  // ---------- eventos ----------
  const chars = () => G.ents.filter((e) => e.kind === 'char' && !e.ghost && e.scene === G.sceneId && visible(e) && e.state !== 'held' && e.state !== 'sleep');
  function stare(e, dur) { e.stare = dur; e.goal = null; e.moving = false; e.dancing = false; }
  function event() {
    const L = chars(), s = st.stage;
    const r = Math.random();
    if (s >= 2 && r < 0.25 && !G.ents.some((e) => e.ghost)) return spawnGhost();
    if (s >= 2 && r < 0.4) { const a = HORROR_TXT.avisos[s >= 4 ? 4 : 2]; return UI.toast(pick(a)); }
    if (!L.length) return;
    const e = pick(L);
    if (r < 0.7) stare(e, s >= 4 ? rand(6, 12) : rand(4, 7));
    else if (!Chat.isBusy(e)) { stare(e, 3); Chat.say(e, pick(HORROR_TXT.falas[s >= 4 ? 4 : s >= 2 ? 2 : 1])); }
  }
  function spawnGhost() {
    const sc = S(), cam = G.cam[sc.id], side = Math.random() < 0.5;
    const x = clamp(side ? cam + 90 : cam + VW - 90, 80, sc.W - 80);
    const look = Object.assign(randomLook(), { skin: '#d8d6de', hairColor: '#141218', hairColor2: null, hairTip: null, shirt: '#1d1b24', pants: '#1d1b24', shoes: '#0e0d12', top: 'tee', bottom: 'pants', socks: null, freckles: false, back: null, neck: null });
    const g = addEnt(C(HORROR_TXT.estranho, sc.id, x, sc.floorTop + 30, { look }));
    g.scene = sc.id; g.ghost = true; g.stare = 1e9; g.hat = null; g.face = null; settle(g);
    ghostT = rand(14, 22);
  }
  function tapGhost(e) {
    Chat.say(e, HORROR_TXT.estranhoFala);
    setTimeout(() => { if (byId.has(e.id)) { emit('smoke', e.x, e.y - 150, 8); removeEnt(e); } }, 1200);
  }
  function clearGhosts() { for (const e of G.ents.filter((x) => x.ghost)) removeEnt(e); }

  // ---------- laço da vila ----------
  function update(dt) {
    if (!document.hidden) st.t += dt;
    saveT += dt; if (saveT > 5) { saveT = 0; save(); check(); }
    for (const e of G.ents) if (e.stare > 0 && !e.ghost) { e.stare -= dt; e.blinkT = Math.max(e.blinkT, 0.5); }
    for (const e of G.ents) if (e.ghost && e.scene !== G.sceneId) removeEnt(e);
    if (ghostT > 0) { ghostT -= dt; if (ghostT <= 0) clearGhosts(); }
    if (st.stage >= 4) {
      G.night = true;
      // depois da virada, quem não está fazendo nada fica olhando para você
      for (const e of G.ents) if (e.kind === 'char' && !e.ghost && e.scene === G.sceneId && !e.stare && e.state === 'idle' && !e.goal && Math.random() < dt * 0.15) stare(e, rand(4, 9));
    }
    if (st.stage < 1) return;
    evT -= dt;
    if (evT <= 0) { evT = st.stage >= 4 ? rand(12, 25) : st.stage >= 2 ? rand(25, 45) : rand(50, 90); event(); }
  }
  // cor do escurecimento da noite (mais avermelhada depois da virada)
  function tint(k) { return st.stage >= 4 ? `rgb(${Math.round(lerp(255, 120, k))},${Math.round(lerp(255, 60, k))},${Math.round(lerp(255, 90, k))})` : null; }
  // figurinha que muda
  function icon(s) { return st.stage >= 2 && s.id === 'l_casa' ? '👁️' : s.ic; }
  // figura na janela do quarto à noite
  function windowFigure(x, y, w, h, seed, n) {
    if (st.stage < 2 || seed !== 30 || n < 0.6) return;
    X.globalAlpha = Math.min(1, (n - 0.6) * 2.5);
    const cx = x + w * 0.38, by = y + h;
    fc(cx, by - h * 0.55, w * 0.14, '#05040a'); fr(cx - w * 0.17, by - h * 0.45, w * 0.34, h * 0.5, 14, '#05040a');
    fc(cx - w * 0.05, by - h * 0.56, 2.5, '#fff6d0'); fc(cx + w * 0.05, by - h * 0.56, 2.5, '#fff6d0');
    X.globalAlpha = 1;
  }

  // ---------- Fliperama: a virada ----------
  function onMiniStart() {
    if (st.stage !== 3) return;
    rv = { t: 0, line: -1, lineT: 0 };
  }
  function onMiniEnd() { st.plays++; save(); check(); }
  // chamado pelo laço do Fliperama; devolve true enquanto a virada estiver acontecendo
  function miniOverlay(ctx, cv, dt, playing) {
    if (!rv) return false;
    if (playing || rv.t > 0) rv.t += dt;
    const T = rv.t;
    if (T < 5) return false;               // deixa jogar normalmente por alguns segundos
    for (const id of ['miniOver', 'miniMenu']) { const el = document.getElementById(id); if (el) el.classList.add('hidden'); }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    const W = cv.width, Hh = cv.height;
    if (T < 7.5) {
      // falhas na imagem: faixas deslocadas, cores invertidas
      for (let i = 0; i < 8; i++) {
        const y = Math.random() * Hh, h = 8 + Math.random() * 60, dx = (Math.random() - 0.5) * 120 * (T - 5);
        ctx.drawImage(cv, 0, y, W, h, dx, y, W, h);
      }
      if (Math.random() < 0.25) { ctx.globalCompositeOperation = 'difference'; ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, W, Hh); ctx.globalCompositeOperation = 'source-over'; }
      ctx.fillStyle = `rgba(0,0,0,${(T - 5) / 2.5 * 0.8})`; ctx.fillRect(0, 0, W, Hh);
      if (Math.random() < dt * 6) { Sfx.squeak(); try { navigator.vibrate && navigator.vibrate(40); } catch (e) { /* */ } }
      return true;
    }
    // tela preta com o texto
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, Hh);
    const per = 2.4, i = Math.floor((T - 7.5) / per), lines = HORROR_TXT.virada;
    if (i !== rv.line) { rv.line = i; if (i < lines.length) Sfx.speak && Sfx.speak(lines[i], 0.6); }
    if (i < lines.length) {
      const k = ((T - 7.5) % per) / per, a = Math.min(1, k * 4) * Math.min(1, (1 - k) * 4);
      ctx.globalAlpha = a; ctx.fillStyle = '#e8e2f0'; ctx.textAlign = 'center';
      ctx.font = `600 ${Math.round(Math.min(W, Hh) / 16)}px Fredoka, sans-serif`;
      ctx.fillText(lines[i], W / 2 + (Math.random() - 0.5) * 3, Hh / 2);
      ctx.globalAlpha = 1;
      return true;
    }
    // acabou: volta para a vila, que nunca mais amanhece
    rv = null; st.stage = 4; save(); applyStage();
    Mini.close(); G.night = true; G.nightK = 1;
    for (const e of G.ents) if (e.kind === 'char' && e.scene === G.sceneId) stare(e, rand(8, 14));
    setTimeout(() => UI.toast(HORROR_TXT.noiteFixa), 800);
    return true;
  }
  function blockDay() { if (st.stage >= 4) { UI.toast(HORROR_TXT.noiteFixa); return true; } return false; }

  function setStage(n) { st.stage = n; save(); applyStage(); }
  function reset() { st.t = 0; st.plays = 0; st.stage = 0; rv = null; save(); location.reload(); }
  function init() { applyStage(); }
  return {
    // para testar no console: Horror._evento() dispara um evento, Horror._estranho() chama o estranho
    _evento: event, _estranho: spawnGhost,
    init, update, tint, icon, windowFigure, tapGhost, onMiniStart, onMiniEnd, miniOverlay, blockDay, setStage, reset,
    get stage() { return st.stage; }, get revealing() { return !!rv && rv.t >= 5; }, state: st,
  };
})();
