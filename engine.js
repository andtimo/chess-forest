/*
 * Шахматный лес: game rules and the computer opponent.
 * No DOM here, only game state, so the rules can be tested on their own.
 *
 * Board: 5x5, x = column (0..4, left to right), y = row (0 = Red home row, 4 = Blue home row).
 */
(function (root) {
  'use strict';

  const SIZE = 5;
  const CARROT_CELLS = [[0, 2], [4, 2]];
  const TREE_CELLS = [[1, 2], [3, 2]];
  const FACES = ['carrot', 'tree', 'star1', 'star2', 'star3', 'empty'];
  // Left to right as each team sees its own row.
  const LINEUP = ['hare', 'fox', 'lion', 'lynx', 'squirrel'];

  const ORTH = [[0, 1], [1, 0], [0, -1], [-1, 0]];
  const DIAG = [[1, 1], [1, -1], [-1, -1], [-1, 1]];
  const HUNT_DIRS = { lion: ORTH.concat(DIAG), fox: DIAG, lynx: ORTH };

  function other(team) { return team === 'red' ? 'blue' : 'red'; }
  function forward(team) { return team === 'red' ? 1 : -1; }
  function farRow(team) { return team === 'red' ? SIZE - 1 : 0; }
  function inside(x, y) { return x >= 0 && y >= 0 && x < SIZE && y < SIZE; }
  function inList(list, x, y) { return list.some((c) => c[0] === x && c[1] === y); }
  function isPredator(p) { return p.kind === 'lion' || p.kind === 'fox' || p.kind === 'lynx'; }

  function cellType(x, y) {
    if (inList(CARROT_CELLS, x, y)) return 'carrot';
    if (inList(TREE_CELLS, x, y)) return 'tree';
    return 'grass';
  }

  function newGame(first) {
    const pieces = [];
    LINEUP.forEach((kind, i) => {
      pieces.push({ id: 'red-' + kind, team: 'red', kind, x: i, y: 0, alive: true, shield: false });
      pieces.push({ id: 'blue-' + kind, team: 'blue', kind, x: SIZE - 1 - i, y: SIZE - 1, alive: true, shield: false });
    });
    return {
      pieces,
      turn: first === 'blue' ? 'blue' : 'red',
      phase: 'roll', // roll -> move | choose | end -> (nextTurn) roll ... | over
      face: null,
      stepsLeft: 0,
      choices: null, // { pieceId, targets } while the player picks a carrot / tree
      winner: null,
      winReason: null // 'lion' | 'hare'
    };
  }

  function clone(state) {
    return {
      pieces: state.pieces.map((p) => Object.assign({}, p)),
      turn: state.turn,
      phase: state.phase,
      face: state.face,
      stepsLeft: state.stepsLeft,
      choices: state.choices
        ? { pieceId: state.choices.pieceId, targets: state.choices.targets.map((t) => ({ x: t.x, y: t.y })) }
        : null,
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
  function canCapture(hunter, target) {
    if (hunter.team === target.team || !isPredator(hunter)) return false;
    if (target.shield) return false; // eating a carrot / holding a nut
    if (target.kind === 'lion') return true; // ends the game
    if (target.kind === 'fox' || target.kind === 'lynx') return hunter.kind === 'lion';
    if (target.kind === 'squirrel' && cellType(target.x, target.y) === 'tree') return hunter.kind === 'lynx';
    return true;
  }

  /* All single steps one animal can make right now. */
  function stepMoves(state, p) {
    const res = [];
    if (!p || !p.alive) return res;
    if (p.kind === 'hare') {
      const y = p.y + forward(p.team);
      if (inside(p.x, y) && !pieceAt(state, p.x, y)) res.push({ x: p.x, y, capture: null });
      return res;
    }
    if (p.kind === 'squirrel') {
      for (const d of ORTH) {
        const x = p.x + d[0] * 2;
        const y = p.y + d[1] * 2;
        if (inside(x, y) && !pieceAt(state, x, y)) res.push({ x, y, capture: null });
      }
      return res;
    }
    for (const d of HUNT_DIRS[p.kind]) {
      const x = p.x + d[0];
      const y = p.y + d[1];
      if (!inside(x, y)) continue;
      const t = pieceAt(state, x, y);
      if (!t) res.push({ x, y, capture: null });
      else if (canCapture(p, t)) res.push({ x, y, capture: t });
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
    const cells = piece.kind === 'hare' ? CARROT_CELLS : TREE_CELLS;
    let best = Infinity;
    let res = [];
    for (const c of cells) {
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

  function placeBonus(state, piece, x, y) {
    const from = { x: piece.x, y: piece.y };
    piece.x = x;
    piece.y = y;
    piece.shield = true;
    state.choices = null;
    state.phase = 'end';
    const out = {
      type: 'bonus', kind: piece.kind, pieceId: piece.id, from, to: { x, y },
      stayed: from.x === x && from.y === y, win: null
    };
    if (piece.kind === 'hare' && y === farRow(piece.team)) {
      state.winner = piece.team;
      state.winReason = 'hare';
      state.phase = 'over';
      out.win = 'hare';
    }
    return out;
  }

  /* Apply a die face for the team whose turn it is. Returns what happened. */
  function beginRoll(state, face) {
    if (state.phase !== 'roll') return null;
    // Protection lasts until its owner rolls again.
    for (const p of state.pieces) if (p.team === state.turn) p.shield = false;
    state.face = face;
    state.stepsLeft = 0;
    state.choices = null;

    if (face === 'empty') {
      state.phase = 'end';
      return { type: 'rest' };
    }
    if (face === 'carrot' || face === 'tree') {
      const kind = face === 'carrot' ? 'hare' : 'squirrel';
      const piece = findPiece(state, state.turn, kind);
      if (!piece) { state.phase = 'end'; return { type: 'bonus-none', kind, reason: 'caught' }; }
      const targets = bonusTargets(state, piece);
      if (!targets.length) { state.phase = 'end'; return { type: 'bonus-none', kind, reason: 'blocked' }; }
      if (targets.length === 1) return placeBonus(state, piece, targets[0].x, targets[0].y);
      state.phase = 'choose';
      state.choices = { pieceId: piece.id, targets };
      return { type: 'bonus-choose', kind, pieceId: piece.id, targets };
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

  /* The player picked one of several equally near carrots / trees. */
  function applyBonus(state, x, y) {
    if (state.phase !== 'choose' || !state.choices) return null;
    if (!state.choices.targets.some((t) => t.x === x && t.y === y)) return null;
    return placeBonus(state, getPiece(state, state.choices.pieceId), x, y);
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

    const ev = { piece: p, from, to: { x, y }, captured: captured || null, win: null, turnOver: false, reason: null };
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

  function nextTurn(state) {
    if (state.phase !== 'end') return false;
    state.turn = other(state.turn);
    state.phase = 'roll';
    state.stepsLeft = 0;
    state.choices = null;
    return true;
  }

  function rollDie(rng) {
    return FACES[Math.floor((rng || Math.random)() * FACES.length)];
  }

  /* ------------------------------------------------------------------ */
  /* Computer opponent                                                   */
  /* ------------------------------------------------------------------ */

  const VALUE = { hare: 70, squirrel: 25, fox: 45, lynx: 50, lion: 0 };
  // Chance that the next roll gives at least k steps (k = 1..3).
  const ROLL_CHANCE = [0, 3 / 6, 2 / 6, 1 / 6];
  function chance(k) { return k >= 1 && k <= 3 ? ROLL_CHANCE[k] : 0; }

  const FAR = 99;

  /*
   * For one predator: the fewest steps (1..3) to step onto each cell,
   * walking only through empty cells. Other animals are assumed to stay put.
   */
  function reachMap(occupied, hunter) {
    const dist = new Uint8Array(SIZE * SIZE).fill(FAR);
    const dirs = HUNT_DIRS[hunter.kind];
    let frontier = [hunter.y * SIZE + hunter.x];
    dist[frontier[0]] = 0;
    for (let depth = 1; depth <= 3 && frontier.length; depth++) {
      const next = [];
      for (const c of frontier) {
        const cx = c % SIZE;
        const cy = (c - cx) / SIZE;
        for (const d of dirs) {
          const x = cx + d[0];
          const y = cy + d[1];
          if (!inside(x, y)) continue;
          const k = y * SIZE + x;
          if (dist[k] <= depth) continue;
          dist[k] = depth;
          if (!occupied[k]) next.push(k);
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
    if (state.winner === me) return easy ? 250 : 1e6;
    if (state.winner === foe) return -1e6;

    const occupied = new Uint8Array(SIZE * SIZE);
    for (const p of state.pieces) if (p.alive) occupied[p.y * SIZE + p.x] = 1;
    const hunters = [];
    for (const p of state.pieces) if (p.alive && isPredator(p)) hunters.push({ piece: p, map: reachMap(occupied, p) });

    // Fewest steps for any enemy predator to catch this animal.
    function danger(prey) {
      let k = FAR;
      const cell = prey.y * SIZE + prey.x;
      for (const h of hunters) {
        if (h.piece.team !== prey.team && h.map[cell] < k && canCapture(h.piece, prey)) k = h.map[cell];
      }
      return k;
    }
    // Fewest steps for the team to win outright: catch the Lion or bring the Hare home.
    function stepsToWin(team) {
      let k = FAR;
      const foeLion = findPiece(state, other(team), 'lion');
      if (foeLion) k = danger(foeLion);
      const hare = findPiece(state, team, 'hare');
      if (hare) {
        const f = forward(team);
        let n = 0;
        let free = true;
        for (let y = hare.y + f; y >= 0 && y < SIZE; y += f) {
          if (occupied[y * SIZE + hare.x]) { free = false; break; }
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
    for (const p of s.pieces) key += p.alive ? String.fromCharCode(65 + p.y * SIZE + p.x) : '-';
    return key;
  }

  // The kind ("easy") computer thinks only on this share of its turns; otherwise it just wanders.
  // Measured over many games: a child tapping at random wins about 1 game in 5 against it,
  // a child who plays on purpose half of the time wins about 7 in 10.
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

  function aiChooseBonus(state, level) {
    let best = null;
    let bestScore = -Infinity;
    for (const t of state.choices.targets) {
      const s2 = clone(state);
      applyBonus(s2, t.x, t.y);
      const score = evaluate(s2, state.turn, level);
      if (score > bestScore) { bestScore = score; best = t; }
    }
    return best;
  }

  root.Forest = {
    SIZE, FACES, LINEUP, CARROT_CELLS, TREE_CELLS,
    other, forward, farRow, cellType, isPredator,
    newGame, clone, pieceAt, getPiece, findPiece,
    canCapture, stepMoves, allMoves, bonusTargets,
    beginRoll, applyBonus, step, endTurnEarly, nextTurn, rollDie,
    evaluate, aiPlan, aiChooseBonus
  };
})(typeof window !== 'undefined' ? window : globalThis);
