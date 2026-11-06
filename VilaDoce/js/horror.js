'use strict';
// ======================================================
//  A Vila por baixo: o horror que vai aparecendo aos poucos
// ======================================================
//  O horror só COMEÇA quando o jogador faz o RITUAL DO ESPELHO (veja HORROR_RITUAL):
//  à noite, no Estúdio, com uma única pessoa lá, sentada na cadeira de um espelho,
//  bater 3 vezes nesse espelho em poucos segundos. Até lá o jogo é só fofo.
//  Pistas para descobrir: moradores contam a "lenda do espelho" nas conversas de
//  noite, uma figurinha secreta do álbum dá a dica, à noite o espelho faz "toc"
//  em vez de brilhar, e quem quase acerta vê o espelho embaçar com uma mão.
//
//  Fases (depois do ritual, avançam com o tempo de jogo OU com as partidas no Fliperama):
//   0 – tudo normal (até o ritual)
//   1 – quase imperceptível: alguém para e olha para você; uma fala sai errada
//   2 – inquietante: um estranho aparece no canto, figura na janela à noite,
//       música desafina e às vezes some, zumbido à noite, passos, batidas na
//       porta, uma figurinha do álbum muda
//   3 – pronto para a virada: ela acontece na próxima partida do Fliperama
//   4 – depois da virada: a vila nunca mais amanhece e há páginas de um diário
//       espalhadas pelos lugares; juntando todas, o jogador escolhe FUGIR ou FICAR
//
//  Para testar: abra o jogo com ?fase=0..4 no endereço (ex.: index.html?fase=4)
//  ou rode no console: Horror._ritual() (faz o ritual na hora), Horror.setStage(4),
//  Horror._paginas() (pega todas as páginas menos uma), Horror._evento(),
//  Horror._estranho(), Horror.reset().
//
//  TEXTOS: todos ficam aqui embaixo para você trocar pela sua história.
// ======================================================
const HORROR_TXT = {
  // falas que escapam no meio do dia, por fase ('voltou' = depois de recomeçar o mundo)
  falas: {
    1: ['Você também ouviu alguém bater na porta ontem?', 'Quantas pessoas moravam aqui antes?', 'Às vezes eu esqueço de piscar.', 'Já reparou que ninguém sai da vila?'],
    2: ['Não olha para a janela.', 'Ele voltou.', 'A gente não pode parar de sorrir.', 'Você está jogando há bastante tempo, né?', 'Quem é aquele no canto?'],
    4: ['Você ficou.', 'Agora você também mora aqui.', 'Ninguém vai embora da Vila.', 'Sorria.', 'Por que você parou de sorrir?'],
    voltou: ['Você voltou.', 'A gente lembra de você.', 'Desta vez você fica?'],
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
  // páginas do diário: aparecem depois da virada, uma em cada lugar (x e y no mundo do cenário)
  paginasDica: 'Há páginas rasgadas espalhadas pela vila.',
  paginas: [
    { cena: 'casa', x: 2585, y: 850, texto: 'Dia 1. Cheguei na Vila Doce. Todo mundo sorri tanto. Parece um sonho.' },
    { cena: 'escola', x: 1950, y: 850, texto: 'A professora pediu para eu escrever o nome da minha cidade. Eu não lembrei.' },
    { cena: 'mercado', x: 320, y: 850, texto: 'As prateleiras se enchem sozinhas. Nunca vi ninguém trazer nada.' },
    { cena: 'parque', x: 2560, y: 850, texto: 'Contei os moradores. Ontem eram quatro. Hoje são cinco. Ninguém chegou.' },
    { cena: 'praia', x: 2330, y: 850, texto: 'O mar não tem fim. Nadei até cansar e a praia continuava atrás de mim.' },
    { cena: 'estancia', x: 2960, y: 850, texto: 'O galo canta às cinco da manhã. Mas aqui nunca é de manhã.' },
    { cena: 'mar', x: 1330, y: 850, texto: 'Achei a saída. É só querer ir embora. O difícil é querer.' },
  ],
  escolha: { titulo: 'Você juntou todas as páginas.', texto: 'Existe uma saída. Mas eles estão esperando a sua resposta.', fugir: 'Fugir', ficar: 'Ficar' },
  finalFugir: ['Você correu sem olhar para trás.', 'As vozes foram ficando longe...', '...até a vila ficar pequena,', 'e doce de novo.'],
  finalFicar: ['Você ficou.', 'Eles pararam de olhar.', 'Agora você também sorri.', 'Bem-vindo à Vila.'],
  subtituloFugiu: 'Crie suas próprias histórias num mundinho cheio de surpresas. De novo.',
  recomecarAviso: 'Tem certeza? Eles vão lembrar de você.',
  // pistas do ritual: conversas dos moradores ("A:fala|B:resposta") e a dica da figurinha secreta
  lendasNoite: [
    'A:Conhece a lenda do espelho do Estúdio?|B:Que de noite ele responde se a gente bater três vezes?|A:Isso! Mas só se a pessoa estiver sozinha...|B:Credo! Nem pensar!',
    'A:Minha avó dizia pra nunca bater no espelho de noite.|B:Por quê?|A:Porque alguém pode bater de volta.',
  ],
  lendasEstudio: [
    'A:Esse espelho embaça sozinho às vezes.|B:Deve ser o vapor do secador.|A:De noite? Sem ninguém aqui?',
    'A:Não gosto de sentar sozinho nessa cadeira.|B:Por quê?|A:Parece que tem alguém do outro lado do espelho.',
  ],
  figurinha: 'Do outro lado',
  dicaAlbum: 'Quando a vila dorme, só uma pessoa na cadeira. Três batidas no espelho.',
};
// O RITUAL que acorda a vila. Troque aqui para mudar o que o jogador precisa fazer.
const HORROR_RITUAL = {
  cena: 'estudio',   // lugar onde ficam os espelhos
  noite: true,       // precisa ser de noite (botão da lua)
  sozinho: true,     // só UMA pessoa naquele lugar
  sentado: true,     // essa pessoa sentada na cadeira do espelho em que se bate
  batidas: 3,        // quantas batidas (toques) no espelho
  segundos: 3,       // ...dentro de quantos segundos
};
// fase 1 só com o ritual; as seguintes: minutos de jogo ou partidas no Fliperama
// contados A PARTIR DO RITUAL (o que vier primeiro)
const HORROR_FASES = [null, null, { min: 8, plays: 4 }, { min: 18, plays: 9 }];

const Horror = (() => {
  const KEY = 'vilaDoce.h';
  const fresh = () => ({ t: 0, plays: 0, stage: 0, pages: [], ending: null, lembra: 0, hinted: false, mirrorDone: false, cracked: null });
  const st = fresh();
  try { Object.assign(st, JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) { /* sem armazenamento */ }
  const q = /[?&]fase=(\d)/.exec(location.search);
  if (q) st.stage = +q[1];
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) { /* sem armazenamento */ } };
  // textos originais da página, para voltar ao normal depois de recomeçar ou fugir
  const $ = (s) => document.querySelector(s);
  const ORIG = { title: document.title, brand: $('.brand b')?.textContent, h1: $('#splash h1')?.innerHTML, p: $('#splash p')?.textContent };
  let saveT = 0, evT = 40, ghostT = 0, rv = null, overlay = null, mir = null, mirWait = -1, fog = null, taps = { id: null, n: 0, t0: 0 };
  // pistas do ritual entram nas conversas dos moradores
  if (typeof DIALOGS !== 'undefined') {
    DIALOGS.noite.push(...HORROR_TXT.lendasNoite);
    if (DIALOGS.lugares.estudio) DIALOGS.lugares.estudio.push(...HORROR_TXT.lendasEstudio);
  }

  const calm = () => st.ending === 'ficou';                 // final "ficar": a vila em paz, noite eterna
  const hunting = () => st.stage >= 4 && !st.ending;         // depois da virada, procurando as páginas

  function check() {
    if (st.stage < 1 || st.stage >= 3) return;   // a fase 1 só começa com o ritual
    const f = HORROR_FASES[st.stage + 1];
    if (st.t / 60 >= f.min || st.plays >= f.plays) { st.stage++; save(); applyStage(); }
  }
  function applyStage() {
    Sfx.setDetune && Sfx.setDetune(calm() ? 0.03 : st.stage >= 4 ? 0.08 : st.stage >= 2 ? 0.025 : 0);
    const dark = st.stage >= 4;
    document.title = dark ? HORROR_TXT.tituloDepois : ORIG.title;
    if ($('.brand b')) $('.brand b').textContent = dark ? HORROR_TXT.tituloDepois : ORIG.brand;
    if ($('#splash h1')) $('#splash h1')[dark ? 'textContent' : 'innerHTML'] = dark ? HORROR_TXT.tituloDepois : ORIG.h1;
    if ($('#splash p')) $('#splash p').textContent = dark ? HORROR_TXT.subtituloDepois : st.ending === 'fugiu' ? HORROR_TXT.subtituloFugiu : ORIG.p;
    document.documentElement.classList.toggle('vila-escura', dark);
    const tab = $('#albumTabs [data-cat=paginas]'); if (tab) tab.classList.toggle('hidden', !(st.stage >= 4 || st.pages.length));
    if (!dark && typeof Sfx.drone === 'function') Sfx.drone(0);
  }

  // ---------- eventos ----------
  const chars = () => G.ents.filter((e) => e.kind === 'char' && !e.ghost && e.scene === G.sceneId && visible(e) && e.state !== 'held' && e.state !== 'sleep');
  function stare(e, dur) { e.stare = dur; e.goal = null; e.moving = false; e.dancing = false; }
  function event() {
    const L = chars(), s = st.stage;
    const r = Math.random();
    // no Estúdio, o espelho é o susto da vez
    if (s >= 2 && G.sceneId === 'estudio' && r < 0.35) return mirrorScare();
    // sons: batidas na porta, passos, a música que some de repente
    if (s >= 2 && r < 0.12) return Sfx.doorKnock();
    if (s >= 2 && r < 0.22) return Sfx.steps(rand(4, 7) | 0);
    if (s >= 2 && r < 0.3 && Sfx.musicStyle) return Sfx.hush(rand(6, 10));
    if (s >= 2 && r < 0.45 && !G.ents.some((e) => e.ghost)) return spawnGhost();
    if (s >= 2 && r < 0.55) { const a = HORROR_TXT.avisos[s >= 4 ? 4 : 2]; return UI.toast(pick(a)); }
    if (!L.length) return;
    const e = pick(L);
    if (r < 0.8) stare(e, s >= 4 ? rand(6, 12) : rand(4, 7));
    else if (!Chat.isBusy(e)) {
      const pool = st.lembra && s < 2 && Math.random() < 0.5 ? HORROR_TXT.falas.voltou : HORROR_TXT.falas[s >= 4 ? 4 : s >= 2 ? 2 : 1];
      stare(e, 3); Chat.say(e, pick(pool));
    }
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
  let droneSet = -1;
  function update(dt) {
    if (!document.hidden) st.t += dt;
    saveT += dt; if (saveT > 5) { saveT = 0; save(); check(); }
    for (const e of G.ents) if (e.stare > 0 && !e.ghost) { e.stare -= dt; e.blinkT = Math.max(e.blinkT, 0.5); }
    for (const e of G.ents) if (e.ghost && e.scene !== G.sceneId) removeEnt(e);
    if (ghostT > 0) { ghostT -= dt; if (ghostT <= 0) clearGhosts(); }
    // zumbido: à noite a partir da fase 2; sempre depois da virada; baixinho no final "ficar"
    const dl = calm() ? 0.3 : st.stage >= 4 ? 1 : st.stage >= 2 && G.nightK > 0.5 ? 0.6 : 0;
    if (dl !== droneSet && typeof Sfx.drone === 'function') { droneSet = dl; Sfx.drone(dl); }
    if (st.stage >= 4) {
      if (!G.night) { G.night = true; UI.syncNight && UI.syncNight(); }
      if (!calm()) for (const e of G.ents) if (e.kind === 'char' && !e.ghost && e.scene === G.sceneId && !e.stare && e.state === 'idle' && !e.goal && Math.random() < dt * 0.15) stare(e, rand(4, 9));
      if (hunting() && !st.hinted && !overlay) { st.hinted = true; save(); setTimeout(() => UI.toast(`${HORROR_TXT.paginasDica} (${st.pages.length}/${HORROR_TXT.paginas.length})`), 2500); }
    }
    // primeira visita ao Estúdio a partir da fase 2: o espelho assusta uma vez, sem demora
    if (mir) { mir.t -= dt; if (mir.t <= 0) mir = null; }
    if (fog) { fog.t -= dt; if (fog.t <= 0) fog = null; }
    if (st.stage >= 2 && !calm() && !st.mirrorDone && G.sceneId === 'estudio') {
      if (mirWait < 0) mirWait = rand(5, 9);
      mirWait -= dt; if (mirWait <= 0) { st.mirrorDone = true; save(); mirrorScare(); }
    } else if (G.sceneId !== 'estudio') mirWait = -1;
    if (st.stage < 1 || calm()) return;
    evT -= dt;
    if (evT <= 0) { evT = st.stage >= 4 ? rand(12, 25) : st.stage >= 2 ? rand(25, 45) : rand(50, 90); event(); }
  }
  // cor do escurecimento da noite (mais avermelhada depois da virada; arroxeada no final "ficar")
  function tint(k) {
    if (calm()) return `rgb(${Math.round(lerp(255, 110, k))},${Math.round(lerp(255, 80, k))},${Math.round(lerp(255, 150, k))})`;
    return st.stage >= 4 ? `rgb(${Math.round(lerp(255, 120, k))},${Math.round(lerp(255, 60, k))},${Math.round(lerp(255, 90, k))})` : null;
  }
  // figurinha que muda
  function icon(s) { return st.stage >= 2 && s.id === 'l_casa' ? '👁️' : s.ic; }
  // figura na janela do quarto à noite
  function windowFigure(x, y, w, h, seed, n) {
    if (st.stage < 2 || calm() || seed !== 30 || n < 0.6) return;
    X.globalAlpha = Math.min(1, (n - 0.6) * 2.5);
    const cx = x + w * 0.38, by = y + h;
    fc(cx, by - h * 0.55, w * 0.14, '#05040a'); fr(cx - w * 0.17, by - h * 0.45, w * 0.34, h * 0.5, 14, '#05040a');
    fc(cx - w * 0.05, by - h * 0.56, 2.5, '#fff6d0'); fc(cx + w * 0.05, by - h * 0.56, 2.5, '#fff6d0');
    X.globalAlpha = 1;
  }

  // ---------- susto no espelho do Estúdio ----------
  // por uma fração de segundo, o espelho mostra o estranho atrás de você
  function mirrorScare() {
    const sts = [['st1', 400], ['st2', 800]], cam = G.cam.estudio || 0;
    const vis = sts.filter(([, x]) => x > cam + 60 && x < cam + VW - 60);
    const [id] = pick(vis.length ? vis : sts);
    mir = { id, t: 0.38 };
    Sfx.sting(); try { navigator.vibrate && navigator.vibrate(60); } catch (e) { /* */ }
  }
  // ---------- o ritual do espelho ----------
  // chamado quando o jogador toca num espelho do Estúdio; devolve true se o toque foi "usado" aqui
  function mirrorTap(id, seatIdx) {
    const R = HORROR_RITUAL;
    if (st.stage >= 1 || G.sceneId !== R.cena || (R.noite && !G.night)) return false;   // de dia (ou depois do ritual): espelho normal
    if (taps.id !== id || G.t - taps.t0 > R.segundos) taps = { id, n: 0, t0: G.t };
    taps.n++;
    Sfx.knock();                                      // à noite, o espelho faz "toc" em vez de brilhar
    if (taps.n < R.batidas) return true;
    taps = { id: null, n: 0, t0: 0 };
    const people = G.ents.filter((e) => e.kind === 'char' && !e.ghost && e.scene === R.cena);
    const seated = people.find((e) => e.seat === seatIdx && e.state === 'sit');
    if ((R.sozinho && people.length !== 1) || (R.sentado && !seated)) {
      // quase: o espelho embaça e aparece a marca de uma mão do outro lado
      fog = { id, t: 3 }; Sfx.whoosh();
      return true;
    }
    ritual(id, seated || people[0]);
    return true;
  }
  function ritual(id, who) {
    st.stage = 1; st.t = 0; st.plays = 0; save(); applyStage();
    mir = { id, t: 1.6 };                             // o estranho aparece no espelho, agora por mais tempo
    Sfx.sting(); Sfx.hush(12);
    try { navigator.vibrate && navigator.vibrate([60, 40, 120]); } catch (e) { /* */ }
    const fd = document.getElementById('fade'); if (fd) { fd.classList.remove('go'); fd.classList.add('dark'); void fd.offsetWidth; fd.classList.add('go'); setTimeout(() => fd.classList.remove('dark', 'go'), 700); }
    for (const e of G.ents) if (e.kind === 'char' && !e.ghost && e.scene === G.sceneId) stare(e, 9);
    if (who) who.stare = 12;
    setTimeout(() => { st.cracked = id; save(); Sfx.poof(); emit('star', id === 'st2' ? 800 : 400, 300, 6); }, 1600);   // o espelho racha
    setTimeout(() => Sfx.doorKnock(), 2400);                                                                           // e alguém bate de volta
    setTimeout(() => Album.unlock('s_espelho'), 4500);
  }

  // chamado pelo desenho de cada espelho (cx = centro; o vidro vai de y 160 a 470)
  function mirror(id, cx) {
    // rachadura que fica depois do ritual
    if (st.cracked === id) {
      const ox = cx + 34, oy = 262;
      X.save(); RR(cx - 120, 160, 240, 310, 112); X.clip();
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * TAU + srand(i + 3) * 0.5;
        let x = ox, y = oy; X.beginPath(); X.moveTo(x, y);
        for (let k = 1; k <= 4; k++) { const r = 34 * k * (0.7 + srand(i * 7 + k) * 0.6); x = ox + Math.cos(a + (srand(i + k) - 0.5) * 0.5) * r; y = oy + Math.sin(a + (srand(i * 3 + k) - 0.5) * 0.5) * r; X.lineTo(x, y); }
        stroke(4, 'rgba(70,70,95,.35)'); stroke(1.6, 'rgba(255,255,255,.85)');
      }
      fc(ox, oy, 6, 'rgba(255,255,255,.7)');
      X.restore();
    }
    // embaçado com a marca de uma mão (quase fez o ritual)
    if (fog && fog.id === id) {
      const a = Math.min(1, fog.t) * 0.7;
      X.save(); RR(cx - 120, 160, 240, 310, 112); X.clip();
      X.globalAlpha = a; X.fillStyle = '#f4f7fb'; X.fillRect(cx - 120, 160, 240, 310);
      // a mão encostada do outro lado do vidro
      const hx = cx - 20, hy = 330;
      fe(hx, hy, 26, 30, 'rgba(150,160,180,.55)');
      [[-22, -40, -0.35], [-8, -50, -0.1], [8, -50, 0.1], [22, -42, 0.3], [32, -6, 0.9]].forEach(([dx, dy, r]) => fe(hx + dx, hy + dy, 7, 18, 'rgba(150,160,180,.55)', r));
      X.globalAlpha = 1; X.restore();
    }
    if (!mir || mir.id !== id) return;
    X.save(); RR(cx - 120, 160, 240, 310, 112); X.clip();
    X.fillStyle = 'rgba(10,8,20,.35)'; X.fillRect(cx - 120, 160, 240, 310);
    const j = (Math.random() - 0.5) * 4;
    fe(cx + j, 300, 78, 96, '#141218');                           // cabelo
    fe(cx + j, 322, 52, 64, '#d8d6de');                           // rosto pálido
    fe(cx - 18 + j, 312, 8, 11, '#05040a'); fe(cx + 18 + j, 312, 8, 11, '#05040a');
    line(cx - 10 + j, 352, cx + 10 + j, 352, 3, '#3a2a30');
    fr(cx - 70 + j, 380, 140, 100, 40, '#1d1b24');                 // ombros
    X.restore();
  }

  // ---------- páginas do diário (depois da virada) ----------
  const pagesHere = (sid) => (hunting() ? HORROR_TXT.paginas.map((p, i) => ({ ...p, i })).filter((p) => p.cena === sid && !st.pages.includes(p.i)) : []);
  function drawWorld(sc, t) {
    for (const p of pagesHere(sc.id)) {
      const glow = 0.5 + 0.5 * Math.sin(t * 2.4 + p.i);
      X.save(); X.translate(p.x, p.y);
      X.globalAlpha = 0.35 + glow * 0.4; fe(0, -6, 70, 26, 'rgba(255,240,200,.5)'); X.globalAlpha = 1;
      X.rotate(-0.25 + p.i * 0.13);
      fpoly([-26, -34, 22, -38, 28, 26, -22, 30, -16, 10, -28, 0], '#f3ead6'); // papel rasgado
      for (let k = 0; k < 4; k++) line(-16, -22 + k * 11, 16, -24 + k * 11, 2, 'rgba(90,70,60,.45)');
      X.restore();
    }
  }
  // usado pelo toque no cenário: devolve um "prop" falso para a página tocada
  function pageProp(w) {
    const p = pagesHere(G.sceneId).find((q) => Math.abs(w.x - q.x) < 60 && Math.abs(w.y - (q.y - 6)) < 60);
    return p ? { id: '__pagina', tap: () => collect(p) } : null;
  }
  function collect(p) {
    if (st.pages.includes(p.i)) return true;
    st.pages.push(p.i); save(); applyStage();
    Sfx.sticker(); emit('smoke', p.x, p.y - 20, 6);
    const n = st.pages.length, tot = HORROR_TXT.paginas.length;
    showOverlay([{ cls: 'hPaper', text: p.texto }, { cls: 'hSmall', text: `Página ${n} de ${tot}` }], [{ lab: 'Fechar', fn: () => { closeOverlay(); if (n >= tot) setTimeout(choice, 600); } }]);
    return true;
  }
  function choice() {
    const E = HORROR_TXT.escolha;
    Sfx.hush(30);
    showOverlay([{ cls: 'hTitle', text: E.titulo }, { cls: 'hText', text: E.texto }], [
      { lab: E.fugir, fn: () => ending('fugiu') },
      { lab: E.ficar, fn: () => ending('ficou') },
    ], true);
  }
  function ending(kind) {
    const lines = kind === 'fugiu' ? HORROR_TXT.finalFugir : HORROR_TXT.finalFicar;
    let i = 0;
    const step = () => {
      if (i < lines.length) { showOverlay([{ cls: 'hText big', text: lines[i++] }], [], true, kind === 'fugiu' ? 'light' : 'dark'); setTimeout(step, 2600); return; }
      closeOverlay();
      if (kind === 'fugiu') {
        // de volta ao começo: a vila doce de novo (mas ela lembra)
        const lembra = st.lembra + 1;
        Object.assign(st, fresh(), { ending: 'fugiu', lembra });
        G.night = false; UI.syncNight && UI.syncNight(); clearGhosts(); for (const e of G.ents) e.stare = 0;
      } else {
        st.ending = 'ficou';
        for (const e of G.ents) if (e.kind === 'char') { e.stare = 0; e.reactT = 1.5; }
      }
      save(); applyStage(); droneSet = -1;
      Album.unlock(kind === 'fugiu' ? 's_fuga' : 's_morador');
    };
    step();
  }
  // tela por cima de tudo (DOM) para ler páginas, escolher e ver os finais
  function showOverlay(parts, buttons, opaque, theme) {
    closeOverlay();
    overlay = document.createElement('div');
    overlay.id = 'hOverlay'; overlay.className = (opaque ? 'opaque ' : '') + (theme || '');
    const box = document.createElement('div'); box.className = 'hBox';
    for (const p of parts) { const d = document.createElement('div'); d.className = p.cls; d.textContent = p.text; box.appendChild(d); }
    if (buttons.length) {
      const row = document.createElement('div'); row.className = 'hBtns';
      for (const b of buttons) { const el = document.createElement('button'); el.className = 'primary'; el.textContent = b.lab; el.addEventListener('click', () => { Sfx.click(); b.fn(); }); row.appendChild(el); }
      box.appendChild(row);
    }
    overlay.appendChild(box);
    document.getElementById('app').appendChild(overlay);
  }
  function closeOverlay() { if (overlay) { overlay.remove(); overlay = null; } }
  // lista para a aba "Páginas" do álbum
  function pageList() { return HORROR_TXT.paginas.map((p, i) => ({ found: st.pages.includes(i), texto: p.texto, cena: SCENES[p.cena] ? SCENES[p.cena].name : p.cena })); }

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
  function blocking() { return !!overlay; }

  // recomeçar o mundo também desfaz o horror (mas a vila "lembra" se você já tinha visto coisas estranhas)
  function resetAll() {
    const lembra = st.stage >= 2 || st.ending ? st.lembra + 1 : st.lembra;
    Object.assign(st, fresh(), { lembra });
    rv = null; closeOverlay(); droneSet = -1;
    for (const e of G.ents) e.stare = 0;
    G.night = false; G.nightK = 0; UI.syncNight && UI.syncNight();
    save(); applyStage();
  }
  function resetWarning() { return st.stage >= 2 || st.ending ? HORROR_TXT.recomecarAviso : null; }
  function setStage(n) { st.stage = n; save(); applyStage(); }
  function reset() { Object.assign(st, fresh()); rv = null; save(); location.reload(); }
  function init() { applyStage(); }
  return {
    // para testar no console: Horror._evento() dispara um evento, Horror._estranho() chama o estranho,
    // Horror._paginas() pega todas as páginas menos uma
    _evento: event, _estranho: spawnGhost, _espelho: mirrorScare, mirror, mirrorTap,
    _ritual() { ritual('st1', G.ents.find((e) => e.kind === 'char' && e.scene === G.sceneId)); },
    _paginas() { st.pages = HORROR_TXT.paginas.map((_, i) => i).slice(0, -1); save(); applyStage(); },
    init, update, tint, icon, windowFigure, drawWorld, pageProp, pageList, tapGhost, onMiniStart, onMiniEnd, miniOverlay,
    blockDay, blocking, resetAll, resetWarning, setStage, reset,
    get stage() { return st.stage; }, get revealing() { return !!rv && rv.t >= 5; }, state: st,
  };
})();
