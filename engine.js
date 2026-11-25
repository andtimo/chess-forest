/*
 * Шахматный лес: game rules and the computer opponent.
 * No DOM here, only game state, so the rules can be tested on their own.
 *
 * Board: n x n (n = 5 or 6 per map), x = column (0..n-1, left to right), y = row (0 = Red home row, n-1 = Blue home row).
 * Two maps; each is the same for both teams when the board is turned round (every special cell has a twin):
 *   1 «Солнечная поляна», 5x5: Hare, Fox, Lion, Lynx, Squirrel; two carrots, two trees.
 *   2 «Глубокий лес», 6x6: Hare, Fox, Lion, Panther, Lynx, Squirrel; two carrots, two trees, two traps.
 */
(function (root) {
  'use strict';

  const SIZE = 5; // Map 1's size, kept for older callers; use sizeOf(map)
  const MAPS = {
    1: {
      size: 5,
      lineup: ['hare', 'fox', 'lion', 'lynx', 'squirrel'], // left to right as each team sees its own row
      cells: { carrot: [[0, 2], [4, 2]], tree: [[1, 2], [3, 2]] },
      faces: ['carrot', 'tree', 'star1', 'star2', 'star3', 'empty']
    },
    2: {
      size: 6,
      lineup: ['hare', 'fox', 'lion', 'panther', 'lynx', 'squirrel'],
      // "Middle band": seen from each team's own side, its third row reads carrot, trap, tree
      // (Red: a3, c3, e3; Blue: f4, d4, b4).
      cells: { carrot: [[0, 2], [5, 3]], tree: [[4, 2], [1, 3]], trap: [[2, 2], [3, 3]] },
      // 'carrottree': the player sends the Hare to a carrot or the Squirrel to a tree;
      // 'trap': the roller's animal nearest to a free trap falls into it
      faces: ['carrottree', 'star1', 'star2', 'star3', 'empty', 'trap'],
      lionsDraw: true // only the two Lions left: a draw (careful players could circle forever)
    }
  };
  // Map 1 names, kept for older callers.
  const CARROT_CELLS = MAPS[1].cells.carrot;
  const TREE_CELLS = MAPS[1].cells.tree;
  const FACES = MAPS[1].faces;
  const LINEUP = MAPS[1].lineup;

  const KNIGHT = [[1, 2], [2, 1], [2, -1], [1, -2], [-1, -2], [-2, -1], [-2, 1], [-1, 2]];
  const ORTH = [[0, 1], [1, 0], [0, -1], [-1, 0]];
  const DIAG = [[1, 1], [1, -1], [-1, -1], [-1, 1]];
  const ALL8 = ORTH.concat(DIAG);
  const HUNT_DIRS = { lion: ALL8, fox: DIAG, lynx: ORTH, panther: ALL8 };
  // The Panther runs in one straight line during a turn: each star moves it one cell, but it doesn't turn.
  const RUNNERS = { panther: true };
  // Die faces that send an animal to a special cell, and who may go.
  const BONUS_KINDS = { carrot: ['hare'], tree: ['squirrel'], carrottree: ['hare', 'squirrel'] };
  const BONUS_CELL = { hare: 'carrot', squirrel: 'tree' };
  const TRAP_TURNS = 2; // a trapped animal sits out this many of its team's turns

  function mapId(m) { return MAPS[m] ? Number(m) : 1; }
  function sizeOf(map) { return MAPS[mapId(map)].size; }
  function other(team) { return team === 'red' ? 'blue' : 'red'; }
  function forward(team) { return team === 'red' ? 1 : -1; }
  function farRow(team, map) { return team === 'red' ? sizeOf(map) - 1 : 0; }
  function inside(x, y, n) { return x >= 0 && y >= 0 && x < n && y < n; }
  function inList(list, x, y) { return list.some((c) => c[0] === x && c[1] === y); }
  function isPredator(p) { return !!HUNT_DIRS[p.kind]; }
  function cheb(ax, ay, bx, by) { return Math.max(Math.abs(ax - bx), Math.abs(ay - by)); }

  function cellsOf(map, type) { return MAPS[mapId(map)].cells[type] || []; }
  function facesOf(map) { return MAPS[mapId(map)].faces; }
  function lineupOf(map) { return MAPS[mapId(map)].lineup; }
  // Cell types per map as a flat n*n grid (looked up very often by the computer's search).
  const GRID = {};
  function buildGrid(id) {
    const n = MAPS[id].size;
    const g = [];
    for (let y = 0; y < n; y++) {
      for (let x = 0; x < n; x++) {
        let type = 'grass';
        for (const t in MAPS[id].cells) if (inList(MAPS[id].cells[t], x, y)) type = t;
        g.push(type);
      }
    }
    GRID[id] = g;
  }
  for (const id in MAPS) buildGrid(id);
  /* Test hook: try another layout of special cells on a map. */
  function setCells(map, cells) { MAPS[mapId(map)].cells = cells; buildGrid(mapId(map)); }
  function cellType(x, y, map) { const id = GRID[map] ? map : 1; return GRID[id][y * MAPS[id].size + x]; }
  /* Who may stand on a cell at all. */
  function canEnter(kind, type) {
    if (type === 'trap') return kind !== 'lion'; // the Lion is too wise to step into a trap
    return true;
  }

  function newGame(first, map) {
    map = mapId(map);
    const n = sizeOf(map);
    const pieces = [];
    lineupOf(map).forEach((kind, i) => {
      pieces.push({ id: 'red-' + kind, team: 'red', kind, x: i, y: 0, alive: true, shield: false, trapped: 0, trapFresh: false });
      pieces.push({ id: 'blue-' + kind, team: 'blue', kind, x: n - 1 - i, y: n - 1, alive: true, shield: false, trapped: 0, trapFresh: false });
    });
    return {
      map,
      pieces,
      turn: first === 'blue' ? 'blue' : 'red',
      phase: 'roll', // roll -> move | choose | end -> (nextTurn) roll ... | over
      face: null,
      stepsLeft: 0,
      choices: null, // { options: [{ pieceId, kind, targets }] } while the player picks where a bonus jump goes
      runs: {}, // Panther: the direction its first step this turn locked in
      winner: null,
      winReason: null // 'lion' | 'hare' | 'draw' (Map 2: only the two Lions left; winner stays null)
    };
  }

  function clone(state) {
    return {
      map: state.map,
      pieces: state.pieces.map((p) => Object.assign({}, p)),
      turn: state.turn,
      phase: state.phase,
      face: state.face,
      stepsLeft: state.stepsLeft,
      choices: state.choices
        ? { options: state.choices.options.map((o) => ({ pieceId: o.pieceId, kind: o.kind, targets: o.targets.map((t) => ({ x: t.x, y: t.y })) })) }
        : null,
      runs: Object.assign({}, state.runs),
      winner: state.winner,
      winReason: state.winReason
    };
  }

  function pieceAt(state, x, y) {
    for (const p of state.pieces) if (p.alive && p.x === x && p.y === y) return p;
    return null;
  }
  function getPiece(state, id) {
    for (const p of state.pieces) if (p.id === id) return p;
    return null;
  }
  function findPiece(state, team, kind) {
    for (const p of state.pieces) if (p.alive && p.team === team && p.kind === kind) return p;
    return null;
  }

  /* Who may catch whom. */
  function canCapture(hunter, target, map) {
    if (hunter.team === target.team || !isPredator(hunter)) return false;
    if (target.shield) return false; // eating a carrot / holding a nut
    const type = cellType(target.x, target.y, map);
    if (!canEnter(hunter.kind, type)) return false; // the hunter would have to step onto that cell
    if (target.kind === 'lion') return hunter.kind === 'lion'; // only a Lion catches a Lion; ends the game
    if (target.kind !== 'hare' && target.kind !== 'squirrel') return hunter.kind === 'lion'; // Fox, Lynx, Panther
    if (target.kind === 'squirrel' && type === 'tree') return hunter.kind === 'lynx' || hunter.kind === 'panther';
    return true;
  }

  /* All single steps one animal can make right now. */
  function stepMoves(state, p) {
    const res = [];
    if (!p || !p.alive || p.trapped > 0) return res;
    const map = state.map;
    const n = sizeOf(map);
    const free = (x, y) => inside(x, y, n) && !pieceAt(state, x, y) && canEnter(p.kind, cellType(x, y, map));
    if (p.kind === 'hare') {
      const y = p.y + forward(p.team);
      if (free(p.x, y)) res.push({ x: p.x, y, capture: null });
      return res;
    }
    if (p.kind === 'squirrel') {
      // L-shaped jump like a chess knight, over any animals and traps; it never catches.
      for (const d of KNIGHT) {
        const x = p.x + d[0];
        const y = p.y + d[1];
        if (free(x, y)) res.push({ x, y, capture: null });
      }
      return res;
    }
    const run = RUNNERS[p.kind] && state.runs ? state.runs[p.id] : null;
    for (const d of run ? [run] : HUNT_DIRS[p.kind]) {
      const x = p.x + d[0];
      const y = p.y + d[1];
      if (!inside(x, y, n) || !canEnter(p.kind, cellType(x, y, map))) continue;
      const t = pieceAt(state, x, y);
      if (!t) res.push({ x, y, capture: null });
      else if (canCapture(p, t, map)) res.push({ x, y, capture: t });
    }
    return res;
  }

  function allMoves(state, team) {
    const res = [];
    for (const p of state.pieces) {
      if (!p.alive || p.team !== team) continue;
      for (const m of stepMoves(state, p)) res.push({ piece: p, x: m.x, y: m.y, capture: m.capture });
    }
    return res;
  }

  /* Carrot / tree cells the animal may jump to: the nearest free one(s). */
  function bonusTargets(state, piece) {
    let best = Infinity;
    let res = [];
    for (const c of cellsOf(state.map, BONUS_CELL[piece.kind])) {
      const occupant = pieceAt(state, c[0], c[1]);
      if (occupant && occupant !== piece) continue;
      // The hare never goes backward.
      if (piece.kind === 'hare' && (c[1] - piece.y) * forward(piece.team) < 0) continue;
      const d = (c[0] - piece.x) * (c[0] - piece.x) + (c[1] - piece.y) * (c[1] - piece.y);
      if (d < best) { best = d; res = [{ x: c[0], y: c[1] }]; }
      else if (d === best) res.push({ x: c[0], y: c[1] });
    }
    return res;
  }

  /* A teammate arriving next to a trapped animal (any of the 8 cells around it) frees it.
     Not called when the arriving animal lands in a trap itself: it rescues nobody. */
  function rescue(state, mover) {
    const freed = [];
    for (const q of state.pieces) {
      if (!q.alive || q === mover || q.team !== mover.team || q.trapped <= 0) continue;
      if (Math.max(Math.abs(q.x - mover.x), Math.abs(q.y - mover.y)) === 1) {
        q.trapped = 0;
        q.trapFresh = false;
        freed.push(q.id);
      }
    }
    return freed;
  }

  /*
   * Trap face: the roller's animals (not the Lion, not already trapped) that stand nearest to a free trap,
   * counted in steps in any direction, as the Lion walks. Each with its nearest free trap(s).
   * A trap the animal itself stands on counts as free for it (distance 0).
   */
  function trapOptions(state) {
    const traps = cellsOf(state.map, 'trap');
    let best = Infinity;
    let options = [];
    for (const p of state.pieces) {
      if (!p.alive || p.team !== state.turn || p.kind === 'lion' || p.trapped > 0) continue;
      let pd = Infinity;
      let targets = [];
      for (const c of traps) {
        const occupant = pieceAt(state, c[0], c[1]);
        if (occupant && occupant !== p) continue;
        const d = cheb(c[0], c[1], p.x, p.y);
        if (d < pd) { pd = d; targets = [{ x: c[0], y: c[1] }]; }
        else if (d === pd) targets.push({ x: c[0], y: c[1] });
      }
      if (!targets.length) continue;
      if (pd < best) { best = pd; options = [{ pieceId: p.id, kind: p.kind, targets }]; }
      else if (pd === best) options.push({ pieceId: p.id, kind: p.kind, targets });
    }
    return options;
  }

  function placeTrap(state, piece, x, y) {
    const from = { x: piece.x, y: piece.y };
    piece.x = x;
    piece.y = y;
    piece.trapped = TRAP_TURNS;
    piece.trapFresh = true;
    state.choices = null;
    state.phase = 'end';
    return {
      type: 'trap', kind: piece.kind, pieceId: piece.id, from, to: { x, y },
      stayed: from.x === x && from.y === y, win: null,
      freed: [] // an animal that lands in a trap rescues nobody (your choice, 2026-11-24)
    };
  }

  /* A chosen jump: into a trap on the trap face, otherwise to a carrot / tree. */
  function place(state, piece, x, y) {
    return state.face === 'trap' ? placeTrap(state, piece, x, y) : placeBonus(state, piece, x, y);
  }

  function placeBonus(state, piece, x, y) {
    const from = { x: piece.x, y: piece.y };
    piece.x = x;
    piece.y = y;
    piece.shield = true;
    state.choices = null;
    state.phase = 'end';
    const out = {
      type: 'bonus', kind: piece.kind, pieceId: piece.id, from, to: { x, y },
      stayed: from.x === x && from.y === y, win: null, freed: rescue(state, piece)
    };
    if (piece.kind === 'hare' && y === farRow(piece.team, state.map)) {
      state.winner = piece.team;
      state.winReason = 'hare';
      state.phase = 'over';
      out.win = 'hare';
    }
    return out;
  }

  function chooseOut(state, kind) {
    const options = state.choices.options;
    const one = options.length === 1 ? options[0] : null;
    const type = state.face === 'trap' ? 'trap-choose' : 'bonus-choose';
    return { type, kind: one ? one.kind : kind, options, pieceId: one ? one.pieceId : null, targets: one ? one.targets : [] };
  }

  /* Apply a die face for the team whose turn it is. Returns what happened. */
  function beginRoll(state, face) {
    if (state.phase !== 'roll') return null;
    // Protection lasts until its owner rolls again.
    for (const p of state.pieces) if (p.team === state.turn) p.shield = false;
    state.face = face;
    state.stepsLeft = 0;
    state.choices = null;
    state.runs = {};

    if (face === 'empty') {
      state.phase = 'end';
      return { type: 'rest' };
    }
    if (face === 'trap') {
      const options = trapOptions(state);
      if (!options.length) { state.phase = 'end'; return { type: 'trap-none' }; } // nobody can go: like a rest
      if (options.length === 1 && options[0].targets.length === 1) {
        const o = options[0];
        return placeTrap(state, getPiece(state, o.pieceId), o.targets[0].x, o.targets[0].y);
      }
      state.phase = 'choose';
      state.choices = { options };
      return chooseOut(state, 'trap');
    }
    const kinds = BONUS_KINDS[face];
    if (kinds) {
      const kind = kinds.length > 1 ? face : kinds[0];
      const options = [];
      let reason = 'caught';
      for (const k of kinds) {
        const piece = findPiece(state, state.turn, k);
        if (!piece) continue;
        if (piece.trapped > 0) { if (reason === 'caught') reason = 'trapped'; continue; }
        const targets = bonusTargets(state, piece);
        if (!targets.length) { reason = 'blocked'; continue; }
        options.push({ pieceId: piece.id, kind: k, targets });
      }
      if (!options.length) { state.phase = 'end'; return { type: 'bonus-none', kind, reason }; }
      if (options.length === 1 && options[0].targets.length === 1) {
        const o = options[0];
        return placeBonus(state, getPiece(state, o.pieceId), o.targets[0].x, o.targets[0].y);
      }
      state.phase = 'choose';
      state.choices = { options };
      return chooseOut(state, kind);
    }
    const steps = Number(face.slice(4));
    if (!allMoves(state, state.turn).length) {
      state.phase = 'end';
      return { type: 'no-moves', steps };
    }
    state.stepsLeft = steps;
    state.phase = 'move';
    return { type: 'stars', steps };
  }

  /*
   * The player picked the cell for a jump (one of several carrots / trees / traps).
   * pieceId says which animal goes; without it the cell must belong to one animal only
   * (on a trap tie several animals share the same trap: then the animal has to be named).
   */
  function applyBonus(state, x, y, pieceId) {
    if (state.phase !== 'choose' || !state.choices) return null;
    const hits = state.choices.options.filter((o) =>
      (!pieceId || o.pieceId === pieceId) && o.targets.some((t) => t.x === x && t.y === y));
    if (hits.length !== 1) return null;
    return place(state, getPiece(state, hits[0].pieceId), x, y);
  }

  /* The player tapped the animal instead of a cell (Carrot/Tree face: the Hare or the Squirrel; trap face: a tie). */
  function chooseBonusPiece(state, pieceId) {
    if (state.phase !== 'choose' || !state.choices) return null;
    const o = state.choices.options.find((op) => op.pieceId === pieceId);
    if (!o) return null;
    if (o.targets.length === 1) return place(state, getPiece(state, pieceId), o.targets[0].x, o.targets[0].y);
    if (state.choices.options.length === 1) return null; // this animal is already chosen: now pick a cell
    state.choices = { options: [o] };
    return chooseOut(state, o.kind);
  }

  /* One step of one animal. Returns null if the step is not allowed. */
  function step(state, pieceId, x, y) {
    if (state.phase !== 'move' || state.stepsLeft < 1) return null;
    const p = getPiece(state, pieceId);
    if (!p || !p.alive || p.team !== state.turn) return null;
    const mv = stepMoves(state, p).find((m) => m.x === x && m.y === y);
    if (!mv) return null;

    const from = { x: p.x, y: p.y };
    const captured = mv.capture;
    if (captured) captured.alive = false;
    p.x = x;
    p.y = y;
    state.stepsLeft -= 1;
    if (!state.runs) state.runs = {};
    if (RUNNERS[p.kind] && !state.runs[p.id]) state.runs[p.id] = [x - from.x, y - from.y];
    const intoTrap = cellType(x, y, state.map) === 'trap';
    if (intoTrap) { p.trapped = TRAP_TURNS; p.trapFresh = true; }
    const freed = intoTrap ? [] : rescue(state, p); // an animal that lands in a trap rescues nobody

    const ev = { piece: p, from, to: { x, y }, captured: captured || null, win: null, turnOver: false, reason: null, trapped: intoTrap, freed };
    if (captured && captured.kind === 'lion') { state.winner = p.team; state.winReason = 'lion'; }
    else if (p.kind === 'hare' && y === farRow(p.team, state.map)) { state.winner = p.team; state.winReason = 'hare'; }
    else if (captured && MAPS[state.map].lionsDraw && state.pieces.every((q) => !q.alive || q.kind === 'lion')) {
      state.winReason = 'draw'; // nobody wins: winner stays null
    }

    if (state.winner || state.winReason === 'draw') {
      state.phase = 'over';
      state.stepsLeft = 0;
      ev.win = state.winReason;
      ev.turnOver = true;
    } else if (captured) {
      state.stepsLeft = 0; // a catch ends the turn
      state.phase = 'end';
      ev.turnOver = true;
      ev.reason = 'capture';
    } else if (intoTrap) {
      state.stepsLeft = 0; // stepping into a trap ends the turn, like a catch
      state.phase = 'end';
      ev.turnOver = true;
      ev.reason = 'trap';
    } else if (state.stepsLeft === 0) {
      state.phase = 'end';
      ev.turnOver = true;
      ev.reason = 'steps';
    } else if (!allMoves(state, state.turn).length) {
      state.stepsLeft = 0;
      state.phase = 'end';
      ev.turnOver = true;
      ev.reason = 'stuck';
    }
    return ev;
  }

  function endTurnEarly(state) {
    if (state.phase !== 'move') return false;
    state.stepsLeft = 0;
    state.phase = 'end';
    return true;
  }

  /* The turn timer ran out: the turn is lost; steps already made stay. */
  function timeOut(state) {
    if (state.phase !== 'roll' && state.phase !== 'move' && state.phase !== 'choose') return false;
    // A tie on the trap face can't be dodged by waiting: one of the tied animals falls in at random.
    // Returns that trap event instead of true.
    if (state.phase === 'choose' && state.face === 'trap') {
      const all = [];
      for (const o of state.choices.options) for (const tg of o.targets) all.push({ pieceId: o.pieceId, x: tg.x, y: tg.y });
      const c = all[Math.floor(Math.random() * all.length)];
      return Object.assign(applyBonus(state, c.x, c.y, c.pieceId), { timedOut: true });
    }
    // The die wasn't rolled, but the turn still counts: this team's protection ends as if it had rolled.
    if (state.phase === 'roll') for (const p of state.pieces) if (p.team === state.turn) p.shield = false;
    state.stepsLeft = 0;
    state.choices = null;
    state.phase = 'end';
    return true;
  }

  function nextTurn(state) {
    if (state.phase !== 'end') return false;
    // The finished turn counts for this team's trapped animals (but not the turn they stepped in).
    for (const p of state.pieces) {
      if (p.team !== state.turn || !(p.trapped > 0)) continue;
      if (p.trapFresh) p.trapFresh = false;
      else p.trapped -= 1;
    }
    state.turn = other(state.turn);
    state.phase = 'roll';
    state.stepsLeft = 0;
    state.choices = null;
    state.runs = {};
    return true;
  }

  function rollDie(rng, map) {
    const faces = facesOf(map);
    return faces[Math.floor((rng || Math.random)() * faces.length)];
  }

  /* ------------------------------------------------------------------ */
  /* Computer opponent                                                   */
  /* ------------------------------------------------------------------ */

  const VALUE = { hare: 70, squirrel: 25, fox: 45, lynx: 50, panther: 60, lion: 0 };
  // Chance that the next roll gives at least k steps (k = 1..3).
  const ROLL_CHANCE = [0, 3 / 6, 2 / 6, 1 / 6];
  function chance(k) { return k >= 1 && k <= 3 ? ROLL_CHANCE[k] : 0; }

  const FAR = 99;

  /*
   * For one predator: the fewest steps (1..3) to step onto each cell,
   * walking only through empty cells it may enter. Other animals are assumed to stay put.
   * A trap ends the walk; the Panther only runs in straight lines.
   */
  function reachMap(occupied, hunter, map) {
    const N = sizeOf(map);
    const dist = new Uint8Array(N * N).fill(FAR);
    const dirs = HUNT_DIRS[hunter.kind];
    const ok = (x, y) => inside(x, y, N) && canEnter(hunter.kind, cellType(x, y, map));
    const stops = (x, y, k) => occupied[k] || cellType(x, y, map) === 'trap';
    dist[hunter.y * N + hunter.x] = 0;
    if (RUNNERS[hunter.kind]) {
      for (const d of dirs) {
        let x = hunter.x;
        let y = hunter.y;
        for (let n = 1; n <= 3; n++) {
          x += d[0];
          y += d[1];
          if (!ok(x, y)) break;
          const k = y * N + x;
          if (n < dist[k]) dist[k] = n;
          if (stops(x, y, k)) break;
        }
      }
      return dist;
    }
    let frontier = [hunter.y * N + hunter.x];
    for (let depth = 1; depth <= 3 && frontier.length; depth++) {
      const next = [];
      for (const c of frontier) {
        const cx = c % N;
        const cy = (c - cx) / N;
        for (const d of dirs) {
          const x = cx + d[0];
          const y = cy + d[1];
          if (!ok(x, y)) continue;
          const k = y * N + x;
          if (dist[k] <= depth) continue;
          dist[k] = depth;
          if (!stops(x, y, k)) next.push(k);
        }
      }
      frontier = next;
    }
    return dist;
  }

  /* How good the position is for `me`, assuming the opponent rolls next. */
  function evaluate(state, me, level) {
    const foe = other(me);
    const easy = level === 'easy';
    const map = state.map;
    const N = sizeOf(map);
    if (state.winner === me) return easy ? 250 : 1e6;
    if (state.winner === foe) return -1e6;
    if (state.winReason === 'draw') return 0;

    // Still stuck in a trap on that team's next turn?
    const stuckNext = (p) => p.trapped > 0 && (p.team !== state.turn || p.trapped - (p.trapFresh ? 0 : 1) > 0);
    const occupied = new Uint8Array(N * N);
    for (const p of state.pieces) if (p.alive) occupied[p.y * N + p.x] = 1;
    const hunters = [];
    for (const p of state.pieces) if (p.alive && isPredator(p) && !stuckNext(p)) hunters.push({ piece: p, map: reachMap(occupied, p, map) });

    // Fewest steps for any enemy predator to catch this animal.
    function danger(prey) {
      let k = FAR;
      const cell = prey.y * N + prey.x;
      for (const h of hunters) {
        if (h.piece.team !== prey.team && h.map[cell] < k && canCapture(h.piece, prey, map)) k = h.map[cell];
      }
      return k;
    }
    // Fewest steps for the team to win outright: catch the Lion or bring the Hare home.
    function stepsToWin(team) {
      let k = FAR;
      const foeLion = findPiece(state, other(team), 'lion');
      if (foeLion) k = danger(foeLion);
      const hare = findPiece(state, team, 'hare');
      if (hare && !stuckNext(hare)) {
        const f = forward(team);
        let n = 0;
        let free = true;
        for (let y = hare.y + f; y >= 0 && y < N; y += f) {
          const type = cellType(hare.x, y, map);
          if (occupied[y * N + hare.x] || type === 'trap') { free = false; break; }
          n++;
        }
        if (free && n < k) k = n;
      }
      return k;
    }

    const caution = easy ? 0.2 : 1;
    let score = 0;
    for (const p of state.pieces) {
      if (!p.alive) continue;
      const mine = p.team === me;
      score += (mine ? 1 : -1) * VALUE[p.kind];
      if (p.kind === 'hare') {
        const progress = p.team === 'red' ? p.y : N - 1 - p.y;
        score += (mine ? 1 : -1) * progress * 12;
      }
      if (p.trapped > 0) score += (mine ? -1 : 1) * 9 * p.trapped; // an animal in a trap can't help
      if (p.kind !== 'lion') {
        // Animals that can be caught on the next turn.
        const risk = VALUE[p.kind] * chance(danger(p));
        score += mine ? -caution * risk : 0.4 * risk;
      }
    }
    score -= caution * 1200 * chance(stepsToWin(foe));
    score += 180 * chance(stepsToWin(me));
    return score;
  }

  function positionKey(s) {
    const N = sizeOf(s.map);
    let key = s.stepsLeft + s.phase.charAt(0);
    for (const p of s.pieces) key += p.alive ? String.fromCharCode(65 + p.y * N + p.x) + (p.trapped > 0 ? p.trapped : '') : '-';
    for (const id in s.runs) key += id + s.runs[id].join(',');
    return key;
  }

  // The kind ("easy") computer thinks only on this share of its turns; otherwise it just wanders.
  // Measured over many games on Map 1 (only a Lion catches a Lion): a child tapping at random wins about 1 game in 7
  // against it, a child who plays on purpose half of the time wins about 7 in 10.
  const EASY_FOCUS = 0.2;

  function randomPlan(state, rng) {
    const s = clone(state);
    const seq = [];
    while (s.phase === 'move') {
      const moves = allMoves(s, s.turn);
      const m = moves[Math.floor(rng() * moves.length)];
      step(s, m.piece.id, m.x, m.y);
      seq.push({ id: m.piece.id, x: m.x, y: m.y });
      if (rng() < 0.15) break; // sometimes stops early, like a real player
    }
    return seq;
  }

  /* Pick the steps for a star roll: an array of { id, x, y }, possibly shorter than the roll. */
  function aiPlan(state, level, rng) {
    rng = rng || Math.random;
    if (level === 'easy' && rng() >= EASY_FOCUS) return randomPlan(state, rng);
    const me = state.turn;
    const noise = level === 'easy' ? 200 : 8;
    const seen = new Set(); // the same position reached by another order of steps is not searched twice
    let best = null;
    (function search(s, seq) {
      if (seq.length) {
        const score = evaluate(s, me, level) + seq.length * 2 + (rng() - 0.5) * noise;
        if (!best || score > best.score) best = { score, seq: seq.slice() };
      }
      if (s.phase !== 'move') return;
      for (const mv of allMoves(s, me)) {
        const s2 = clone(s);
        step(s2, mv.piece.id, mv.x, mv.y);
        const key = positionKey(s2);
        if (seen.has(key)) continue;
        seen.add(key);
        seq.push({ id: mv.piece.id, x: mv.x, y: mv.y });
        search(s2, seq);
        seq.pop();
      }
    })(state, []);
    return best ? best.seq : [];
  }

  /* Where to send the jump (carrot / tree, or which tied animal goes into which trap): returns the chosen cell { x, y }. */
  function aiChooseBonus(state, level) {
    let best = null;
    let bestScore = -Infinity;
    for (const o of state.choices.options) {
      for (const t of o.targets) {
        const s2 = clone(state);
        applyBonus(s2, t.x, t.y, o.pieceId);
        const score = evaluate(s2, state.turn, level);
        if (score > bestScore) { bestScore = score; best = { pieceId: o.pieceId, x: t.x, y: t.y }; }
      }
    }
    return best; // { pieceId, x, y }: pass all three to applyBonus
  }

  root.Forest = {
    SIZE, MAPS, FACES, LINEUP, CARROT_CELLS, TREE_CELLS, TRAP_TURNS,
    other, forward, farRow, sizeOf, cellType, cellsOf, facesOf, lineupOf, canEnter, isPredator, setCells,
    newGame, clone, pieceAt, getPiece, findPiece,
    canCapture, stepMoves, allMoves, bonusTargets, trapOptions,
    beginRoll, applyBonus, chooseBonusPiece, step, endTurnEarly, timeOut, nextTurn, rollDie,
    evaluate, aiPlan, aiChooseBonus
  };
})(typeof window !== 'undefined' ? window : globalThis);
