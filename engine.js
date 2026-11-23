/*
 * Шахматный лес: game rules and the computer opponent.
 * No DOM here, only game state, so the rules can be tested on their own.
 *
 * Board: 5x5, x = column (0..4, left to right), y = row (0 = Red home row, 4 = Blue home row).
 * Two maps; each is the same for both teams when the board is turned round (every special cell has a twin):
 *   1 «Солнечная поляна»: Hare, Fox, Lion, Lynx, Squirrel; two carrots, two trees.
 *   2 «Глубокий лес»: Hare, Bear, Lion, Panther, Squirrel; two carrots, two trees, water in the centre, two traps.
 */
(function (root) {
  'use strict';

  const SIZE = 5;
  const MAPS = {
    1: {
      lineup: ['hare', 'fox', 'lion', 'lynx', 'squirrel'], // left to right as each team sees its own row
      cells: { carrot: [[0, 2], [4, 2]], tree: [[1, 2], [3, 2]] },
      faces: ['carrot', 'tree', 'star1', 'star2', 'star3', 'empty']
    },
    2: {
      lineup: ['hare', 'bear', 'lion', 'panther', 'squirrel'],
      // the traps (d2, b4) stand in front of each team's Panther
      cells: { carrot: [[0, 2], [4, 2]], tree: [[1, 2], [3, 2]], water: [[2, 2]], trap: [[3, 1], [1, 3]] },
      // 'food': the player sends the Hare to a carrot or the Bear into the water
      faces: ['food', 'tree', 'star1', 'star2', 'star3', 'empty']
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
  const HUNT_DIRS = { lion: ALL8, fox: DIAG, lynx: ORTH, bear: ORTH, panther: ALL8 };
  // Bear and Panther run in one straight line during a turn: each star moves them one cell, but they don't turn.
  const RUNNERS = { bear: true, panther: true };
  // Die faces that send an animal to a special cell, and who may go.
  const BONUS_KINDS = { carrot: ['hare'], tree: ['squirrel'], food: ['hare', 'bear'] };
  const BONUS_CELL = { hare: 'carrot', squirrel: 'tree', bear: 'water' };
  const TRAP_TURNS = 2; // a trapped animal sits out this many of its team's turns

  function mapId(m) { return MAPS[m] ? Number(m) : 1; }
  function other(team) { return team === 'red' ? 'blue' : 'red'; }
  function forward(team) { return team === 'red' ? 1 : -1; }
  function farRow(team) { return team === 'red' ? SIZE - 1 : 0; }
  function inside(x, y) { return x >= 0 && y >= 0 && x < SIZE && y < SIZE; }
  function inList(list, x, y) { return list.some((c) => c[0] === x && c[1] === y); }
  function isPredator(p) { return !!HUNT_DIRS[p.kind]; }

  function cellsOf(map, type) { return MAPS[mapId(map)].cells[type] || []; }
  function facesOf(map) { return MAPS[mapId(map)].faces; }
  function lineupOf(map) { return MAPS[mapId(map)].lineup; }
  // Cell types per map as a flat 25-cell grid (looked up very often by the computer's search).
  const GRID = {};
  for (const id in MAPS) {
    const g = [];
    for (let y = 0; y < SIZE; y++) {
      for (let x = 0; x < SIZE; x++) {
        let type = 'grass';
        for (const t in MAPS[id].cells) if (inList(MAPS[id].cells[t], x, y)) type = t;
        g.push(type);
      }
    }
    GRID[id] = g;
  }
  function cellType(x, y, map) { return (GRID[map] || GRID[1])[y * SIZE + x]; }
  /* Who may stand on a cell at all. */
  function canEnter(kind, type) {
    if (type === 'water') return kind === 'bear'; // only the Bear swims
    if (type === 'trap') return kind !== 'lion'; // the Lion is too wise to step into a trap
    return true;
  }

  function newGame(first, map) {
    map = mapId(map);
    const pieces = [];
    lineupOf(map).forEach((kind, i) => {
      pieces.push({ id: 'red-' + kind, team: 'red', kind, x: i, y: 0, alive: true, shield: false, trapped: 0, trapFresh: false });
      pieces.push({ id: 'blue-' + kind, team: 'blue', kind, x: SIZE - 1 - i, y: SIZE - 1, alive: true, shield: false, trapped: 0, trapFresh: false });
    });
    return {
      map,
      pieces,
      turn: first === 'blue' ? 'blue' : 'red',
      phase: 'roll', // roll -> move | choose | end -> (nextTurn) roll ... | over
      face: null,
      stepsLeft: 0,
      choices: null, // { options: [{ pieceId, kind, targets }] } while the player picks where a bonus jump goes
      runs: {}, // Bear / Panther: the direction their first step this turn locked in
      winner: null,
      winReason: null // 'lion' | 'hare'
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
    if (target.kind === 'bear' && type === 'water') return false; // a swimming Bear is untouchable
    if (target.kind !== 'hare' && target.kind !== 'squirrel') return hunter.kind === 'lion'; // Fox, Lynx, Bear, Panther
    if (target.kind === 'squirrel' && type === 'tree') return hunter.kind === 'lynx' || hunter.kind === 'panther';
    return true;
  }

  /* All single steps one animal can make right now. */
  function stepMoves(state, p) {
    const res = [];
    if (!p || !p.alive || p.trapped > 0) return res;
    const map = state.map;
    const free = (x, y) => inside(x, y) && !pieceAt(state, x, y) && canEnter(p.kind, cellType(x, y, map));
    if (p.kind === 'hare') {
      const y = p.y + forward(p.team);
      if (free(p.x, y)) res.push({ x: p.x, y, capture: null });
      return res;
    }
    if (p.kind === 'squirrel') {
      // L-shaped jump like a chess knight, over any animals, water and traps; it never catches.
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
      if (!inside(x, y) || !canEnter(p.kind, cellType(x, y, map))) continue;
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

  /* Carrot / tree / water cells the animal may jump to: the nearest free one(s). */
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

  /* A teammate arriving next to a trapped animal (any of the 8 cells around it) frees it. */
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

  function placeBonus(state, piece, x, y) {
    const from = { x: piece.x, y: piece.y };
    piece.x = x;
    piece.y = y;
    if (piece.kind !== 'bear') piece.shield = true; // the Bear is safe in the water anyway
    state.choices = null;
    state.phase = 'end';
    const out = {
      type: 'bonus', kind: piece.kind, pieceId: piece.id, from, to: { x, y },
      stayed: from.x === x && from.y === y, win: null, freed: rescue(state, piece)
    };
    if (piece.kind === 'hare' && y === farRow(piece.team)) {
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
    return { type: 'bonus-choose', kind: one ? one.kind : kind, options, pieceId: one ? one.pieceId : null, targets: one ? one.targets : [] };
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
    const kinds = BONUS_KINDS[face];
    if (kinds) {
      const kind = face === 'food' ? 'food' : kinds[0];
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

  /* The player picked the cell for a bonus jump (one of several carrots / trees, or the water). */
  function applyBonus(state, x, y) {
    if (state.phase !== 'choose' || !state.choices) return null;
    for (const o of state.choices.options) {
      if (o.targets.some((t) => t.x === x && t.y === y)) return placeBonus(state, getPiece(state, o.pieceId), x, y);
    }
    return null;
  }

  /* The player tapped the animal instead of a cell (Carrot / Fish face: the Hare or the Bear). */
  function chooseBonusPiece(state, pieceId) {
    if (state.phase !== 'choose' || !state.choices) return null;
    const o = state.choices.options.find((op) => op.pieceId === pieceId);
    if (!o) return null;
    if (o.targets.length === 1) return placeBonus(state, getPiece(state, pieceId), o.targets[0].x, o.targets[0].y);
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
    const freed = rescue(state, p);

    const ev = { piece: p, from, to: { x, y }, captured: captured || null, win: null, turnOver: false, reason: null, trapped: intoTrap, freed };
    if (captured && captured.kind === 'lion') { state.winner = p.team; state.winReason = 'lion'; }
    else if (p.kind === 'hare' && y === farRow(p.team)) { state.winner = p.team; state.winReason = 'hare'; }

    if (state.winner) {
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

  const VALUE = { hare: 70, squirrel: 25, fox: 45, lynx: 50, bear: 55, panther: 60, lion: 0 };
  // Chance that the next roll gives at least k steps (k = 1..3).
  const ROLL_CHANCE = [0, 3 / 6, 2 / 6, 1 / 6];
  function chance(k) { return k >= 1 && k <= 3 ? ROLL_CHANCE[k] : 0; }

  const FAR = 99;

  /*
   * For one predator: the fewest steps (1..3) to step onto each cell,
   * walking only through empty cells it may enter. Other animals are assumed to stay put.
   * A trap ends the walk; Bear and Panther only run in straight lines.
   */
  function reachMap(occupied, hunter, map) {
    const dist = new Uint8Array(SIZE * SIZE).fill(FAR);
    const dirs = HUNT_DIRS[hunter.kind];
    const ok = (x, y) => inside(x, y) && canEnter(hunter.kind, cellType(x, y, map));
    const stops = (x, y, k) => occupied[k] || cellType(x, y, map) === 'trap';
    dist[hunter.y * SIZE + hunter.x] = 0;
    if (RUNNERS[hunter.kind]) {
      for (const d of dirs) {
        let x = hunter.x;
        let y = hunter.y;
        for (let n = 1; n <= 3; n++) {
          x += d[0];
          y += d[1];
          if (!ok(x, y)) break;
          const k = y * SIZE + x;
          if (n < dist[k]) dist[k] = n;
          if (stops(x, y, k)) break;
        }
      }
      return dist;
    }
    let frontier = [hunter.y * SIZE + hunter.x];
    for (let depth = 1; depth <= 3 && frontier.length; depth++) {
      const next = [];
      for (const c of frontier) {
        const cx = c % SIZE;
        const cy = (c - cx) / SIZE;
        for (const d of dirs) {
          const x = cx + d[0];
          const y = cy + d[1];
          if (!ok(x, y)) continue;
          const k = y * SIZE + x;
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
    if (state.winner === me) return easy ? 250 : 1e6;
    if (state.winner === foe) return -1e6;

    // Still stuck in a trap on that team's next turn?
    const stuckNext = (p) => p.trapped > 0 && (p.team !== state.turn || p.trapped - (p.trapFresh ? 0 : 1) > 0);
    const occupied = new Uint8Array(SIZE * SIZE);
    for (const p of state.pieces) if (p.alive) occupied[p.y * SIZE + p.x] = 1;
    const hunters = [];
    for (const p of state.pieces) if (p.alive && isPredator(p) && !stuckNext(p)) hunters.push({ piece: p, map: reachMap(occupied, p, map) });

    // Fewest steps for any enemy predator to catch this animal.
    function danger(prey) {
      let k = FAR;
      const cell = prey.y * SIZE + prey.x;
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
        for (let y = hare.y + f; y >= 0 && y < SIZE; y += f) {
          const type = cellType(hare.x, y, map);
          if (occupied[y * SIZE + hare.x] || type === 'water' || type === 'trap') { free = false; break; }
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
        const progress = p.team === 'red' ? p.y : SIZE - 1 - p.y;
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
    let key = s.stepsLeft + s.phase.charAt(0);
    for (const p of s.pieces) key += p.alive ? String.fromCharCode(65 + p.y * SIZE + p.x) + (p.trapped > 0 ? p.trapped : '') : '-';
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

  /* Where to send the bonus jump: returns the chosen cell { x, y }. */
  function aiChooseBonus(state, level) {
    let best = null;
    let bestScore = -Infinity;
    for (const o of state.choices.options) {
      for (const t of o.targets) {
        const s2 = clone(state);
        applyBonus(s2, t.x, t.y);
        const score = evaluate(s2, state.turn, level);
        if (score > bestScore) { bestScore = score; best = t; }
      }
    }
    return best;
  }

  root.Forest = {
    SIZE, MAPS, FACES, LINEUP, CARROT_CELLS, TREE_CELLS, TRAP_TURNS,
    other, forward, farRow, cellType, cellsOf, facesOf, lineupOf, canEnter, isPredator,
    newGame, clone, pieceAt, getPiece, findPiece,
    canCapture, stepMoves, allMoves, bonusTargets,
    beginRoll, applyBonus, chooseBonusPiece, step, endTurnEarly, timeOut, nextTurn, rollDie,
    evaluate, aiPlan, aiChooseBonus
  };
})(typeof window !== 'undefined' ? window : globalThis);
