/*
 * Шахматный лес: screen, pictures, sounds and turn flow.
 * The rules live in engine.js (window.Forest).
 */
(function () {
  'use strict';

  const F = window.Forest;
  const byId = (id) => document.getElementById(id);

  /* ------------------------------------------------------------------ */
  /* Pictures (inline SVG, so the game looks the same on every device)   */
  /* ------------------------------------------------------------------ */

  const INK = '#2a211b';

  function svg(body, cls) {
    return '<svg' + (cls ? ' class="' + cls + '"' : '') + ' viewBox="0 0 100 100" aria-hidden="true" focusable="false">' + body + '</svg>';
  }
  function eye(cx, cy, r) {
    return '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="' + INK + '"/>' +
      '<circle cx="' + (cx + r * 0.32).toFixed(1) + '" cy="' + (cy - r * 0.36).toFixed(1) + '" r="' + (r * 0.36).toFixed(1) + '" fill="#fff"/>';
  }
  function star(cx, cy, R) {
    const r = R * 0.42;
    const pts = [];
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + (i * Math.PI) / 5;
      const rad = i % 2 ? r : R;
      pts.push((cx + rad * Math.cos(a)).toFixed(1) + ',' + (cy + rad * Math.sin(a)).toFixed(1));
    }
    return '<polygon points="' + pts.join(' ') + '" fill="#ffc93c" stroke="#e8a200" stroke-width="3" stroke-linejoin="round"/>';
  }

  const ART = {
    lion() {
      let mane = '';
      for (let i = 0; i < 12; i++) {
        const a = (i * Math.PI) / 6;
        mane += '<circle cx="' + (50 + 31 * Math.cos(a)).toFixed(1) + '" cy="' + (56 + 31 * Math.sin(a)).toFixed(1) + '" r="11.5"/>';
      }
      return svg(
        '<g fill="#c26a1b">' + mane + '<circle cx="50" cy="56" r="33"/></g>' +
        '<circle cx="27" cy="35" r="8.500" fill="#f7c648"/><circle cx="27" cy="35" r="4.200" fill="#e59a3c"/>' +
        '<circle cx="73" cy="35" r="8.500" fill="#f7c648"/><circle cx="73" cy="35" r="4.200" fill="#e59a3c"/>' +
        '<circle cx="50" cy="58" r="25" fill="#f7c648"/>' +
        '<ellipse cx="50" cy="69" rx="12.500" ry="9.500" fill="#fdeec4"/>' +
        eye(40, 54, 4.2) + eye(60, 54, 4.2) +
        '<path d="M44.500 62.500h11l-5.500 6z" fill="#7a4420"/>' +
        '<path d="M50 68.500v3.500m0 0q-4.500 4.500-8.500 1m8.500-1q4.500 4.500 8.500 1" fill="none" stroke="#7a4420" stroke-width="2" stroke-linecap="round"/>' +
        '<path d="M35 25l-3-17 10 8 8-11 8 11 10-8-3 17z" fill="#ffd43b" stroke="#e8a200" stroke-width="2" stroke-linejoin="round"/>' +
        '<circle cx="50" cy="18" r="2.600" fill="#e5484d"/>',
        'animal'
      );
    },
    hare() {
      return svg(
        '<ellipse cx="37" cy="27" rx="9" ry="24" fill="#d3d9e0" transform="rotate(-9 37 27)"/>' +
        '<ellipse cx="37" cy="29" rx="4.500" ry="17" fill="#f8b9c6" transform="rotate(-9 37 29)"/>' +
        '<ellipse cx="63" cy="27" rx="9" ry="24" fill="#d3d9e0" transform="rotate(9 63 27)"/>' +
        '<ellipse cx="63" cy="29" rx="4.500" ry="17" fill="#f8b9c6" transform="rotate(9 63 29)"/>' +
        '<ellipse cx="50" cy="66" rx="28" ry="25" fill="#e1e6eb" stroke="#bcc4cd" stroke-width="1.500"/>' +
        '<ellipse cx="42.500" cy="75" rx="9.500" ry="7.500" fill="#fff"/><ellipse cx="57.500" cy="75" rx="9.500" ry="7.500" fill="#fff"/>' +
        eye(38, 60, 4.5) + eye(62, 60, 4.5) +
        '<path d="M46 68h8l-4 5z" fill="#f08aa0"/>' +
        '<rect x="46.400" y="77" width="7.200" height="7.500" rx="1.600" fill="#fff" stroke="#c4cad2" stroke-width="1"/>' +
        '<path d="M50 77v7.500" stroke="#c4cad2" stroke-width="1"/>',
        'animal'
      );
    },
    fox() {
      return svg(
        '<path d="M19 42L22 9l25 22z" fill="#ef8a2b"/><path d="M25 33l1.500-15L38 28z" fill="#5b3418"/>' +
        '<path d="M81 42L78 9 53 31z" fill="#ef8a2b"/><path d="M75 33l-1.500-15L62 28z" fill="#5b3418"/>' +
        '<path d="M50 93C31 87 13 63 18 44c5-17 21-20 32-20s27 3 32 20c5 19-13 43-32 49z" fill="#ef8a2b"/>' +
        '<path d="M50 93C35 88 22 73 21 58c10 1 22 8 29 20 7-12 19-19 29-20-1 15-14 30-29 35z" fill="#fff"/>' +
        eye(37, 52, 4.3) + eye(63, 52, 4.3) +
        '<ellipse cx="50" cy="80" rx="5" ry="4" fill="' + INK + '"/>',
        'animal'
      );
    },
    lynx() {
      return svg(
        '<path d="M21 46L20 12l24 19z" fill="#d7a065"/><path d="M26 36l-.500-14L37 30z" fill="#f7e3c6"/><path d="M20 13L15 1l9 8z" fill="' + INK + '"/>' +
        '<path d="M79 46l1-34-24 19z" fill="#d7a065"/><path d="M74 36l.500-14L63 30z" fill="#f7e3c6"/><path d="M80 13l5-12-9 8z" fill="' + INK + '"/>' +
        '<path d="M22 58L5 66l11 5-9 11 14-1-3 10 16-9z" fill="#ecd2ac"/>' +
        '<path d="M78 58l17 8-11 5 9 11-14-1 3 10-16-9z" fill="#ecd2ac"/>' +
        '<ellipse cx="50" cy="57" rx="30" ry="27" fill="#d7a065"/>' +
        '<ellipse cx="50" cy="70" rx="15" ry="11" fill="#fff6e6"/>' +
        '<g fill="#8a5a2e"><circle cx="39" cy="37" r="2"/><circle cx="50" cy="34" r="2"/><circle cx="61" cy="37" r="2"/><circle cx="44.500" cy="42" r="1.600"/><circle cx="55.500" cy="42" r="1.600"/></g>' +
        '<ellipse cx="38" cy="54" rx="6" ry="5" fill="#c3da35"/><ellipse cx="38" cy="54" rx="2" ry="4.400" fill="' + INK + '"/>' +
        '<ellipse cx="62" cy="54" rx="6" ry="5" fill="#c3da35"/><ellipse cx="62" cy="54" rx="2" ry="4.400" fill="' + INK + '"/>' +
        '<path d="M45 63h10l-5 6z" fill="#d6677d"/>' +
        '<path d="M50 69v3m0 0q-4 4-8 1m8-1q4 4 8 1" fill="none" stroke="#7a4a25" stroke-width="2" stroke-linecap="round"/>',
        'animal'
      );
    },
    squirrel() {
      return svg(
        '<path d="M62 95c22 2 36-14 34-36-2-18-14-30-26-28-9 2-12 12-6 18 5 5 9 9 7 18-2 10-9 18-9 28z" fill="#c9621e"/>' +
        '<path d="M74 86c9-4 14-14 13-26-1-9-5-15-11-18" fill="none" stroke="#e58b45" stroke-width="5" stroke-linecap="round"/>' +
        '<path d="M26 38L23 10l21 18z" fill="#d9742a"/><path d="M29 31l-1-11 9 8z" fill="#f6c9a0"/>' +
        '<path d="M66 38l3-28-21 18z" fill="#d9742a"/><path d="M63 31l1-11-9 8z" fill="#f6c9a0"/>' +
        '<ellipse cx="46" cy="60" rx="27" ry="25" fill="#e88c3c"/>' +
        '<ellipse cx="46" cy="71" rx="15" ry="11" fill="#fff3e0"/>' +
        eye(35, 56, 4.8) + eye(57, 56, 4.8) +
        '<ellipse cx="46" cy="65" rx="3.600" ry="2.600" fill="#5a2d0c"/>' +
        '<rect x="42.800" y="73" width="6.400" height="6.500" rx="1.400" fill="#fff" stroke="#e0cfb5" stroke-width="1"/>',
        'animal'
      );
    },
    carrot() {
      return svg(
        '<g transform="rotate(30 50 54)">' +
        '<ellipse cx="38" cy="22" rx="5.500" ry="13" fill="#51b85f" transform="rotate(-32 38 22)"/>' +
        '<ellipse cx="62" cy="22" rx="5.500" ry="13" fill="#51b85f" transform="rotate(32 62 22)"/>' +
        '<ellipse cx="50" cy="18" rx="6" ry="14" fill="#3fa34d"/>' +
        '<path d="M50 28c11 0 18 7 16 17-3 17-9 35-16 47-7-12-13-30-16-47-2-10 5-17 16-17z" fill="#f58a1f"/>' +
        '<path d="M41 46h9M51 58h9M43 69h7" fill="none" stroke="#d96f0e" stroke-width="2.600" stroke-linecap="round"/>' +
        '</g>'
      );
    },
    tree() {
      return svg(
        '<rect x="44" y="76" width="12" height="18" rx="2" fill="#8a5a2b"/>' +
        '<path d="M50 44l36 36H14z" fill="#237032"/>' +
        '<path d="M50 24l31 36H19z" fill="#2b8a3e"/>' +
        '<path d="M50 6l26 34H24z" fill="#2f9e44"/>'
      );
    },
    nut() {
      return svg(
        '<rect x="46.500" y="8" width="7" height="14" rx="3.500" fill="#6b4420"/>' +
        '<path d="M24 46c0-17 12-27 26-27s26 10 26 27z" fill="#8a5a2b"/>' +
        '<path d="M28 46h44c0 25-10 41-22 46-12-5-22-21-22-46z" fill="#e0a85f"/>' +
        '<path d="M38 54c0 12 3 20 7 26" fill="none" stroke="#f3cf9a" stroke-width="4" stroke-linecap="round"/>'
      );
    },
    star() { return svg(star(50, 52, 44)); },
    house() {
      return svg(
        '<path d="M18 46h64v42H18z" fill="#e2b077"/>' +
        '<path d="M50 10L6 48h88z" fill="#d9534a"/>' +
        '<rect x="42" y="60" width="16" height="28" rx="3" fill="#7a4a22"/>',
        'den-house'
      );
    }
  };

  const BOW = '<svg class="bow" viewBox="0 0 44 22" aria-hidden="true" focusable="false">' +
    '<path d="M22 11L3 2v18zM22 11l19-9v18z" fill="currentColor" stroke="#fff" stroke-width="2" stroke-linejoin="round"/>' +
    '<circle cx="22" cy="11" r="5" fill="currentColor" stroke="#fff" stroke-width="2"/></svg>';

  function dieFace(face) {
    switch (face) {
      case 'carrot': return ART.carrot();
      case 'tree': return ART.tree();
      case 'star1': return svg(star(50, 52, 34));
      case 'star2': return svg(star(30, 32, 23) + star(70, 70, 23));
      case 'star3': return svg(star(50, 28, 21) + star(26, 72, 21) + star(74, 72, 21));
      default: return svg('');
    }
  }

  function soundIcon(on) {
    return '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4 9v6h4l5 4V5L8 9z" fill="currentColor"/>' +
      (on
        ? '<path d="M16 8.500a5 5 0 010 7M18.500 6a8.500 8.500 0 010 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>'
        : '<path d="M16.500 9.500l5 5m0-5l-5 5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>') +
      '</svg>';
  }

  /* ------------------------------------------------------------------ */
  /* Words                                                               */
  /* ------------------------------------------------------------------ */

  const TEAM = {
    red: { gen: 'красных', won: 'Победили красные!' },
    blue: { gen: 'синих', won: 'Победили синие!' }
  };
  const ANIMAL = {
    hare: { nom: 'Зайчик', acc: 'Зайчика', fem: false },
    fox: { nom: 'Лисичка', acc: 'Лисичку', fem: true },
    lion: { nom: 'Лев', acc: 'Льва', fem: false },
    lynx: { nom: 'Рысь', acc: 'Рысь', fem: true },
    squirrel: { nom: 'Белочка', acc: 'Белочку', fem: true }
  };
  const STAR_WORDS = ['', '1 звёздочка', '2 звёздочки', '3 звёздочки'];
  const STEP_WORDS = ['', '1 шаг', '2 шага', '3 шага'];
  const COLS = 'abcde';

  function label(p) {
    const fem = ANIMAL[p.kind].fem;
    const colour = p.team === 'red' ? (fem ? 'Красная' : 'Красный') : (fem ? 'Синяя' : 'Синий');
    return colour + ' ' + ANIMAL[p.kind].nom;
  }
  function rolledText(n) { return (n === 1 ? 'Выпала ' : 'Выпало ') + STAR_WORDS[n]; }
  function leftText(n) { return (n === 1 ? 'Остался ' : 'Осталось ') + STEP_WORDS[n] + '.'; }
  function catchText(ev) {
    const h = ANIMAL[ev.piece.kind];
    const t = ANIMAL[ev.captured.kind];
    if (ev.captured.kind === 'lion') return h.nom + (h.fem ? ' поймала' : ' поймал') + ' Льва!';
    return h.nom + (h.fem ? ' поймала ' : ' поймал ') + t.acc + '! ' + t.nom + (t.fem ? ' ушла' : ' ушёл') + ' отдыхать в домик.';
  }
  function noBonusText(out) {
    if (out.kind === 'hare') {
      return out.reason === 'caught'
        ? 'Морковка! Но Зайчик уже отдыхает в домике. Ход пропускается.'
        : 'Морковка! Но Зайчику до неё не добраться. Ход пропускается.';
    }
    return out.reason === 'caught'
      ? 'Дерево! Но Белочка уже отдыхает в домике. Ход пропускается.'
      : 'Дерево! Но оба дерева заняты. Ход пропускается.';
  }

  /* ------------------------------------------------------------------ */
  /* Sound (tiny synth, no files)                                        */
  /* ------------------------------------------------------------------ */

  let soundOn = true;
  let actx = null;
  try { soundOn = localStorage.getItem('forest-sound') !== 'off'; } catch (e) { /* storage may be blocked */ }

  function audio() {
    if (!soundOn) return null;
    try {
      if (!actx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return null;
        actx = new AC();
      }
      if (actx.state === 'suspended') actx.resume();
      return actx;
    } catch (e) {
      return null;
    }
  }
  function tone(a, freq, at, dur, type, vol, slideTo) {
    const o = a.createOscillator();
    const g = a.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, at);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, at + dur);
    g.gain.setValueAtTime(0.0001, at);
    g.gain.exponentialRampToValueAtTime(vol, at + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
    o.connect(g);
    g.connect(a.destination);
    o.start(at);
    o.stop(at + dur + 0.03);
  }
  function sfx(name) {
    const a = audio();
    if (!a) return;
    try {
      const t = a.currentTime + 0.01;
      switch (name) {
        case 'tap': tone(a, 620, t, 0.07, 'sine', 0.08); break;
        case 'roll': for (let i = 0; i < 9; i++) tone(a, 240 + Math.random() * 380, t + i * 0.09, 0.05, 'square', 0.035); break;
        case 'step': tone(a, 420, t, 0.12, 'sine', 0.14, 640); break;
        case 'hop': tone(a, 500, t, 0.1, 'sine', 0.14, 900); tone(a, 700, t + 0.13, 0.12, 'sine', 0.12, 1100); break;
        case 'catch': tone(a, 660, t, 0.12, 'triangle', 0.16, 330); tone(a, 330, t + 0.13, 0.2, 'triangle', 0.14, 200); break;
        case 'bonus': [660, 880, 1100, 1320].forEach((f, i) => tone(a, f, t + i * 0.09, 0.14, 'sine', 0.12)); break;
        case 'rest': tone(a, 300, t, 0.3, 'sine', 0.12, 170); break;
        case 'win': [523, 659, 784, 1047, 784, 1047].forEach((f, i) => tone(a, f, t + i * 0.14, 0.22, 'triangle', 0.16)); break;
      }
    } catch (e) { /* sound is optional */ }
  }

  /* ------------------------------------------------------------------ */
  /* Screen                                                              */
  /* ------------------------------------------------------------------ */

  const el = {
    menu: byId('menu'), game: byId('game'), board: byId('board'), pieces: byId('pieces'),
    die: byId('die'), dieFace: byId('dieFace'), message: byId('message'), steps: byId('steps'), done: byId('btnDone'),
    teamRed: byId('teamRed'), teamBlue: byId('teamBlue'), denRed: byId('denRed'), denBlue: byId('denBlue'),
    whoRed: byId('whoRed'), whoBlue: byId('whoBlue'), sound: byId('btnSound'),
    rules: byId('rules'), quit: byId('quit'), win: byId('win'),
    winArt: byId('winArt'), winTitle: byId('winTitle'), winText: byId('winText'), winWho: byId('winWho'),
    confetti: byId('confetti'), again: byId('btnAgain')
  };

  const CPU_TEAM = 'blue';
  let state = null;
  let mode = 'two'; // 'two' | 'cpu'
  let level = 'easy'; // 'easy' | 'smart'
  let games = 0;
  let session = 0; // changes on every new game or exit, so stale timers stop
  let busy = false; // an animation or the computer is playing: taps are ignored
  let selectedId = null;
  const cellEls = [];
  let pieceEls = {};

  const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  function say(text) { el.message.textContent = text; }
  function isCpuTurn() { return mode === 'cpu' && state.phase !== 'over' && state.turn === CPU_TEAM; }
  function isHumanTurn() { return state.phase !== 'over' && !(mode === 'cpu' && state.turn === CPU_TEAM); }
  function cellEl(x, y) { return cellEls[y * F.SIZE + x]; }

  function buildBoard() {
    for (let y = F.SIZE - 1; y >= 0; y--) {
      for (let x = 0; x < F.SIZE; x++) {
        const type = F.cellType(x, y);
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'cell ' + type + ((x + y) % 2 ? ' alt' : '');
        b.dataset.x = x;
        b.dataset.y = y;
        b.setAttribute('aria-label', 'Клетка ' + COLS[x] + (y + 1) + (type === 'carrot' ? ', морковка' : type === 'tree' ? ', дерево' : ''));
        if (type !== 'grass') b.innerHTML = ART[type]();
        cellEls[y * F.SIZE + x] = b;
        el.board.insertBefore(b, el.pieces);
      }
    }
  }

  function makePiece(p) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'piece ' + p.team;
    b.setAttribute('aria-label', label(p));
    const badge = p.kind === 'hare' ? ART.carrot() : p.kind === 'squirrel' ? ART.nut() : '';
    b.innerHTML = '<span class="token">' + ART[p.kind]() + BOW + '<span class="badge">' + badge + '</span></span>';
    return b;
  }

  function setDie(face) { el.dieFace.innerHTML = dieFace(face); }

  function addToDen(team, p) {
    const node = team === 'red' ? el.denRed : el.denBlue;
    const mini = document.createElement('span');
    mini.className = 'mini ' + p.team;
    mini.setAttribute('role', 'img');
    mini.setAttribute('aria-label', label(p));
    mini.innerHTML = ART[p.kind]();
    node.appendChild(mini);
  }

  /* Bring the whole screen in line with the game state. */
  function refresh() {
    const human = isHumanTurn();
    el.game.dataset.turn = state.turn;

    for (const p of state.pieces) {
      const node = pieceEls[p.id];
      if (!node) continue;
      node.style.setProperty('--x', p.x);
      node.style.setProperty('--y', p.y);
      node.dataset.x = p.x;
      node.dataset.y = p.y;
      node.classList.toggle('shield', p.alive && p.shield);
      node.classList.toggle('gone', !p.alive);
      node.classList.remove('movable', 'selected', 'threatened');
    }
    for (const c of cellEls) c.classList.remove('target');

    if (!busy && human && state.phase === 'move') {
      const moves = F.allMoves(state, state.turn);
      for (const m of moves) pieceEls[m.piece.id].classList.add('movable');
      if (selectedId && pieceEls[selectedId]) {
        pieceEls[selectedId].classList.add('selected');
        for (const m of moves) {
          if (m.piece.id !== selectedId) continue;
          if (m.capture) pieceEls[m.capture.id].classList.add('threatened');
          else cellEl(m.x, m.y).classList.add('target');
        }
      }
    }
    if (!busy && human && state.phase === 'choose') {
      pieceEls[state.choices.pieceId].classList.add('selected');
      for (const t of state.choices.targets) cellEl(t.x, t.y).classList.add('target');
    }

    el.teamRed.classList.toggle('active', state.phase !== 'over' && state.turn === 'red');
    el.teamBlue.classList.toggle('active', state.phase !== 'over' && state.turn === 'blue');

    const canRoll = !busy && human && state.phase === 'roll';
    el.die.disabled = !canRoll;
    el.die.classList.toggle('ready', canRoll);

    const total = state.face && state.face.indexOf('star') === 0 ? Number(state.face.slice(4)) : 0;
    let stars = '';
    if (state.phase === 'move') {
      for (let i = 0; i < total; i++) {
        stars += '<svg viewBox="0 0 100 100"' + (i < state.stepsLeft ? '' : ' class="used"') + '>' + star(50, 52, 44) + '</svg>';
      }
    }
    el.steps.innerHTML = stars;
    el.done.hidden = !(state.phase === 'move' && human);
    el.done.disabled = busy;
  }

  function announceTurn() {
    if (isCpuTurn()) say('Ходит компьютер…');
    else if (mode === 'cpu') say('Твой ход. Брось кубик!');
    else say('Ход ' + TEAM[state.turn].gen + '. Брось кубик!');
  }

  /* If only one animal can move, pick it for the player. */
  function autoSelect() {
    const ids = new Set(F.allMoves(state, state.turn).map((m) => m.piece.id));
    if (selectedId && !ids.has(selectedId)) selectedId = null;
    if (!selectedId && ids.size === 1) selectedId = ids.values().next().value;
  }

  /* ------------------------------------------------------------------ */
  /* Turn flow                                                           */
  /* ------------------------------------------------------------------ */

  async function animateDie(face, my) {
    el.die.classList.remove('landed');
    el.die.classList.add('rolling');
    sfx('roll');
    let i = Math.floor(Math.random() * F.FACES.length);
    for (let n = 0; n < 9; n++) {
      setDie(F.FACES[i++ % F.FACES.length]);
      await pause(90);
      if (my !== session) break;
    }
    el.die.classList.remove('rolling');
    if (my !== session) return;
    setDie(face);
    void el.die.offsetWidth; // restart the landing animation
    el.die.classList.add('landed');
    await pause(250);
  }

  async function rollFlow(my) {
    busy = true;
    selectedId = null;
    refresh();
    const face = F.rollDie();
    await animateDie(face, my);
    if (my !== session) return;
    const out = F.beginRoll(state, face);
    if (!out) return;
    refresh();

    if (out.type === 'rest') {
      sfx('rest');
      say('Ой, звери решили отдохнуть! Ход пропускается.');
      await pause(1900);
      return passTurn(my);
    }
    if (out.type === 'bonus-none') {
      sfx('rest');
      say(noBonusText(out));
      await pause(2300);
      return passTurn(my);
    }
    if (out.type === 'no-moves') {
      sfx('rest');
      say(rolledText(out.steps) + ', но ходить некуда. Ход пропускается.');
      await pause(2300);
      return passTurn(my);
    }
    if (out.type === 'bonus') return playBonus(out, my);
    if (out.type === 'bonus-choose') {
      if (isCpuTurn()) {
        await pause(700);
        if (my !== session) return;
        const t = F.aiChooseBonus(state, level);
        return playBonus(F.applyBonus(state, t.x, t.y), my);
      }
      say(out.kind === 'hare'
        ? 'Морковка! Выбери, к какой морковке прыгнет Зайчик.'
        : 'Дерево! Выбери, на какое дерево прыгнет Белочка.');
      busy = false;
      refresh();
      return;
    }
    // Stars: the team walks.
    if (isCpuTurn()) {
      say(rolledText(out.steps) + '. Компьютер ходит…');
      return cpuMoves(my);
    }
    say(rolledText(out.steps) + '. Выбери зверя и сделай ' + STEP_WORDS[out.steps] + '.');
    busy = false;
    autoSelect();
    refresh();
  }

  async function playBonus(out, my) {
    const node = pieceEls[out.pieceId];
    busy = true;
    node.classList.add('hop', 'moving');
    sfx('bonus');
    say(out.kind === 'hare'
      ? 'Морковка! Зайчик кушает, и его нельзя поймать.'
      : 'Дерево! Белочка грызёт орешек, и её не достать.');
    refresh();
    await pause(450);
    node.classList.remove('hop', 'moving');
    if (my !== session) return;
    if (out.win) {
      await pause(500);
      if (my === session) showWin();
      return;
    }
    await pause(1700);
    return passTurn(my);
  }

  /* Show one step that the engine has already applied. Resolves to true when the turn (or the game) is over. */
  async function playStep(ev, my) {
    const node = pieceEls[ev.piece.id];
    busy = true;
    node.classList.add('moving');
    if (ev.piece.kind === 'squirrel') { node.classList.add('hop'); sfx('hop'); }
    else sfx('step');
    if (ev.captured) say(catchText(ev));
    else if (ev.win === 'hare') say('Зайчик добежал до края леса!');
    refresh();
    await pause(ev.captured ? 240 : 380);
    if (my !== session) return true;
    if (ev.captured) {
      sfx('catch');
      await pause(260);
      if (my !== session) return true;
      const gone = pieceEls[ev.captured.id];
      if (gone) { gone.remove(); delete pieceEls[ev.captured.id]; }
      if (ev.captured.kind !== 'lion') addToDen(ev.piece.team, ev.captured);
    }
    node.classList.remove('moving', 'hop');

    if (ev.win) {
      await pause(ev.win === 'lion' ? 900 : 500);
      if (my === session) showWin();
      return true;
    }
    if (ev.turnOver) {
      if (ev.reason === 'capture') await pause(1700);
      else if (ev.reason === 'stuck') { say('Больше ходить некуда.'); await pause(1300); }
      else await pause(450);
      await passTurn(my);
      return true;
    }
    return false;
  }

  async function passTurn(my) {
    if (my !== session) return;
    F.nextTurn(state);
    selectedId = null;
    busy = false;
    announceTurn();
    refresh();
    if (isCpuTurn()) return cpuTurn(my);
  }

  async function cpuTurn(my) {
    busy = true;
    refresh();
    await pause(900);
    if (my !== session) return;
    return rollFlow(my);
  }

  async function cpuMoves(my) {
    busy = true;
    refresh();
    const plan = F.aiPlan(state, level);
    for (const st of plan) {
      await pause(750);
      if (my !== session) return;
      const ev = F.step(state, st.id, st.x, st.y);
      if (!ev) break;
      if (await playStep(ev, my)) return;
    }
    if (my !== session) return;
    // The computer decided to stop before using every step.
    F.endTurnEarly(state);
    await pause(500);
    return passTurn(my);
  }

  async function humanStep(id, x, y) {
    const my = session;
    const ev = F.step(state, id, x, y);
    if (!ev) return;
    if (await playStep(ev, my)) return;
    if (my !== session) return;
    busy = false;
    selectedId = F.stepMoves(state, F.getPiece(state, id)).length ? id : null;
    autoSelect();
    say(leftText(state.stepsLeft));
    refresh();
  }

  async function chooseBonus(x, y) {
    const my = session;
    const out = F.applyBonus(state, x, y);
    if (out) await playBonus(out, my);
  }

  function nudge(node) {
    node.classList.add('nudge');
    setTimeout(() => node.classList.remove('nudge'), 320);
  }

  function onTap(x, y) {
    if (state.phase === 'choose') {
      if (state.choices.targets.some((t) => t.x === x && t.y === y)) chooseBonus(x, y);
      return;
    }
    if (state.phase !== 'move') return;
    const moves = F.allMoves(state, state.turn);
    if (selectedId && moves.some((m) => m.piece.id === selectedId && m.x === x && m.y === y)) {
      humanStep(selectedId, x, y);
      return;
    }
    const p = F.pieceAt(state, x, y);
    if (p && p.team === state.turn) {
      if (moves.some((m) => m.piece.id === p.id)) {
        selectedId = selectedId === p.id ? null : p.id;
        sfx('tap');
      } else {
        selectedId = null;
        nudge(pieceEls[p.id]);
      }
    } else {
      selectedId = null;
    }
    refresh();
  }

  /* ------------------------------------------------------------------ */
  /* Game start, end, dialogs                                            */
  /* ------------------------------------------------------------------ */

  let lastFocus = null;
  function openModal(node, focusNode) {
    lastFocus = document.activeElement;
    node.hidden = false;
    if (focusNode) focusNode.focus({ preventScroll: true });
  }
  function closeModal(node) {
    if (node.hidden) return;
    node.hidden = true;
    if (lastFocus && document.contains(lastFocus)) lastFocus.focus({ preventScroll: true });
    lastFocus = null;
  }

  function startGame(newMode) {
    audio(); // unlock sound while we are inside a tap
    mode = newMode;
    session++;
    games++;
    state = F.newGame(games % 2 === 1 ? 'red' : 'blue');
    busy = false;
    selectedId = null;

    el.pieces.innerHTML = '';
    pieceEls = {};
    for (const p of state.pieces) {
      const node = makePiece(p);
      node.style.setProperty('--x', p.x);
      node.style.setProperty('--y', p.y);
      pieceEls[p.id] = node;
      el.pieces.appendChild(node);
    }
    el.denRed.innerHTML = ART.house();
    el.denBlue.innerHTML = ART.house();
    el.whoRed.textContent = mode === 'cpu' ? '(ты)' : '';
    el.whoBlue.textContent = mode === 'cpu' ? '(компьютер)' : '';
    el.die.classList.remove('rolling', 'landed');
    setDie('star3');

    el.win.hidden = true;
    el.quit.hidden = true;
    el.menu.hidden = true;
    el.game.hidden = false;
    announceTurn();
    refresh();
    if (isCpuTurn()) cpuTurn(session);
  }

  function toMenu() {
    session++;
    busy = false;
    el.win.hidden = true;
    el.quit.hidden = true;
    el.game.hidden = true;
    el.menu.hidden = false;
  }

  function showWin() {
    const w = state.winner;
    const lion = state.winReason === 'lion';
    busy = true;
    refresh();
    el.winArt.innerHTML = lion ? ART.lion() : ART.hare();
    el.winTitle.textContent = lion ? 'Лев пойман!' : 'Заячий триумф!';
    el.winText.textContent = lion
      ? 'Царские обнимашки! Все звери обнимаются.'
      : 'Зайчик пробежал весь лес и спасся!';
    let who = TEAM[w].won;
    if (mode === 'cpu') who = w === CPU_TEAM ? 'Победил компьютер. В следующий раз получится!' : 'Ты победил!';
    el.winWho.textContent = who;
    el.winWho.className = 'win-who ' + w;

    const colours = ['#e5484d', '#2f7df6', '#ffc93c', '#37b24d', '#ff922b', '#b267e6'];
    let bits = '';
    for (let i = 0; i < 36; i++) {
      bits += '<i style="left:' + (Math.random() * 100).toFixed(1) + '%;background:' + colours[i % colours.length] +
        ';animation-duration:' + (2.6 + Math.random() * 2.6).toFixed(2) + 's;animation-delay:-' + (Math.random() * 5).toFixed(2) + 's"></i>';
    }
    el.confetti.innerHTML = bits;
    sfx('win');
    openModal(el.win, el.again);
  }

  function setSound(on) {
    soundOn = on;
    el.sound.innerHTML = soundIcon(on);
    el.sound.setAttribute('aria-pressed', on ? 'true' : 'false');
    el.sound.setAttribute('aria-label', on ? 'Звук включён' : 'Звук выключен');
    try { localStorage.setItem('forest-sound', on ? 'on' : 'off'); } catch (e) { /* storage may be blocked */ }
  }

  /* ------------------------------------------------------------------ */
  /* Wiring                                                              */
  /* ------------------------------------------------------------------ */

  document.querySelectorAll('[data-art]').forEach((node) => { node.innerHTML = ART[node.dataset.art](); });
  buildBoard();
  setSound(soundOn);

  byId('btnTwo').addEventListener('click', () => startGame('two'));
  byId('btnCpu').addEventListener('click', () => startGame('cpu'));
  document.querySelectorAll('.seg button').forEach((b) => {
    b.addEventListener('click', () => {
      level = b.dataset.level;
      document.querySelectorAll('.seg button').forEach((o) => o.setAttribute('aria-checked', o === b ? 'true' : 'false'));
    });
  });

  byId('btnRulesMenu').addEventListener('click', () => openModal(el.rules, byId('btnRulesClose')));
  byId('btnRules').addEventListener('click', () => openModal(el.rules, byId('btnRulesClose')));
  byId('btnRulesClose').addEventListener('click', () => closeModal(el.rules));
  byId('btnMenu').addEventListener('click', () => openModal(el.quit, byId('btnQuitNo')));
  byId('btnQuitNo').addEventListener('click', () => closeModal(el.quit));
  byId('btnQuitYes').addEventListener('click', toMenu);
  byId('btnAgain').addEventListener('click', () => startGame(mode));
  byId('btnWinMenu').addEventListener('click', toMenu);
  el.sound.addEventListener('click', () => { setSound(!soundOn); sfx('tap'); });

  [el.rules, el.quit].forEach((modal) => {
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(modal); });
  });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (!el.rules.hidden) closeModal(el.rules);
    else if (!el.quit.hidden) closeModal(el.quit);
    else if (state && selectedId && !busy) { selectedId = null; refresh(); }
  });

  el.die.addEventListener('click', () => {
    if (!state || busy || !isHumanTurn() || state.phase !== 'roll') return;
    rollFlow(session);
  });
  el.done.addEventListener('click', () => {
    if (!state || busy || !isHumanTurn() || state.phase !== 'move') return;
    F.endTurnEarly(state);
    passTurn(session);
  });
  el.board.addEventListener('click', (e) => {
    const t = e.target.closest('[data-x]');
    if (!t || !state || busy || !isHumanTurn()) return;
    onTap(Number(t.dataset.x), Number(t.dataset.y));
  });
})();
