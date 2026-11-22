/*
 * Шахматный лес: screen, pictures, sounds, languages and turn flow.
 * The rules live in engine.js (window.Forest), the texts in i18n.js (window.ForestI18n).
 */
(function () {
  'use strict';

  const F = window.Forest;
  const I18N = window.ForestI18n;
  const byId = (id) => document.getElementById(id);

  /* ------------------------------------------------------------------ */
  /* Storage (may be blocked in private windows: never let it break)     */
  /* ------------------------------------------------------------------ */

  function load(key) { try { return localStorage.getItem(key); } catch (e) { return null; } }
  function save(key, value) {
    try { if (value === null) localStorage.removeItem(key); else localStorage.setItem(key, value); } catch (e) { /* ignore */ }
  }

  /* ------------------------------------------------------------------ */
  /* Language                                                            */
  /* ------------------------------------------------------------------ */

  let lang = load('forest-lang');
  if (I18N.codes.indexOf(lang) < 0) lang = I18N.detect();

  function t(key) {
    const v = I18N.langs[lang][key];
    if (v === undefined) return key;
    if (typeof v !== 'function') return v;
    return v.apply(null, Array.prototype.slice.call(arguments, 1));
  }

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
        '<circle cx="27" cy="35" r="8.5" fill="#f7c648"/><circle cx="27" cy="35" r="4.2" fill="#e59a3c"/>' +
        '<circle cx="73" cy="35" r="8.5" fill="#f7c648"/><circle cx="73" cy="35" r="4.2" fill="#e59a3c"/>' +
        '<circle cx="50" cy="58" r="25" fill="#f7c648"/>' +
        '<ellipse cx="50" cy="69" rx="12.5" ry="9.5" fill="#fdeec4"/>' +
        eye(40, 54, 4.2) + eye(60, 54, 4.2) +
        '<path d="M44.5 62.5h11l-5.5 6z" fill="#7a4420"/>' +
        '<path d="M50 68.5v3.5m0 0q-4.5 4.5-8.5 1m8.5-1q4.5 4.5 8.5 1" fill="none" stroke="#7a4420" stroke-width="2" stroke-linecap="round"/>' +
        '<path d="M35 25l-3-17 10 8 8-11 8 11 10-8-3 17z" fill="#ffd43b" stroke="#e8a200" stroke-width="2" stroke-linejoin="round"/>' +
        '<circle cx="50" cy="18" r="2.6" fill="#e5484d"/>',
        'animal'
      );
    },
    hare() {
      return svg(
        '<ellipse cx="37" cy="27" rx="9" ry="24" fill="#d3d9e0" transform="rotate(-9 37 27)"/>' +
        '<ellipse cx="37" cy="29" rx="4.5" ry="17" fill="#f8b9c6" transform="rotate(-9 37 29)"/>' +
        '<ellipse cx="63" cy="27" rx="9" ry="24" fill="#d3d9e0" transform="rotate(9 63 27)"/>' +
        '<ellipse cx="63" cy="29" rx="4.5" ry="17" fill="#f8b9c6" transform="rotate(9 63 29)"/>' +
        '<ellipse cx="50" cy="66" rx="28" ry="25" fill="#e1e6eb" stroke="#bcc4cd" stroke-width="1.5"/>' +
        '<ellipse cx="42.5" cy="75" rx="9.5" ry="7.5" fill="#fff"/><ellipse cx="57.5" cy="75" rx="9.5" ry="7.5" fill="#fff"/>' +
        eye(38, 60, 4.5) + eye(62, 60, 4.5) +
        '<path d="M46 68h8l-4 5z" fill="#f08aa0"/>' +
        '<rect x="46.4" y="77" width="7.2" height="7.5" rx="1.6" fill="#fff" stroke="#c4cad2" stroke-width="1"/>' +
        '<path d="M50 77v7.5" stroke="#c4cad2" stroke-width="1"/>',
        'animal'
      );
    },
    fox() {
      return svg(
        '<path d="M19 42L22 9l25 22z" fill="#ef8a2b"/><path d="M25 33l1.5-15L38 28z" fill="#5b3418"/>' +
        '<path d="M81 42L78 9 53 31z" fill="#ef8a2b"/><path d="M75 33l-1.5-15L62 28z" fill="#5b3418"/>' +
        '<path d="M50 93C31 87 13 63 18 44c5-17 21-20 32-20s27 3 32 20c5 19-13 43-32 49z" fill="#ef8a2b"/>' +
        '<path d="M50 93C35 88 22 73 21 58c10 1 22 8 29 20 7-12 19-19 29-20-1 15-14 30-29 35z" fill="#fff"/>' +
        eye(37, 52, 4.3) + eye(63, 52, 4.3) +
        '<ellipse cx="50" cy="80" rx="5" ry="4" fill="' + INK + '"/>',
        'animal'
      );
    },
    lynx() {
      return svg(
        '<path d="M21 46L20 12l24 19z" fill="#d7a065"/><path d="M26 36l-.5-14L37 30z" fill="#f7e3c6"/><path d="M20 13L15 1l9 8z" fill="' + INK + '"/>' +
        '<path d="M79 46l1-34-24 19z" fill="#d7a065"/><path d="M74 36l.5-14L63 30z" fill="#f7e3c6"/><path d="M80 13l5-12-9 8z" fill="' + INK + '"/>' +
        '<path d="M22 58L5 66l11 5-9 11 14-1-3 10 16-9z" fill="#ecd2ac"/>' +
        '<path d="M78 58l17 8-11 5 9 11-14-1 3 10-16-9z" fill="#ecd2ac"/>' +
        '<ellipse cx="50" cy="57" rx="30" ry="27" fill="#d7a065"/>' +
        '<ellipse cx="50" cy="70" rx="15" ry="11" fill="#fff6e6"/>' +
        '<g fill="#8a5a2e"><circle cx="39" cy="37" r="2"/><circle cx="50" cy="34" r="2"/><circle cx="61" cy="37" r="2"/><circle cx="44.5" cy="42" r="1.6"/><circle cx="55.5" cy="42" r="1.6"/></g>' +
        '<ellipse cx="38" cy="54" rx="6" ry="5" fill="#c3da35"/><ellipse cx="38" cy="54" rx="2" ry="4.4" fill="' + INK + '"/>' +
        '<ellipse cx="62" cy="54" rx="6" ry="5" fill="#c3da35"/><ellipse cx="62" cy="54" rx="2" ry="4.4" fill="' + INK + '"/>' +
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
        '<ellipse cx="46" cy="65" rx="3.6" ry="2.6" fill="#5a2d0c"/>' +
        '<rect x="42.8" y="73" width="6.4" height="6.5" rx="1.4" fill="#fff" stroke="#e0cfb5" stroke-width="1"/>',
        'animal'
      );
    },
    panther() {
      return svg(
        '<circle cx="25" cy="31" r="12" fill="#2f2f3c"/><circle cx="25" cy="31" r="6" fill="#5a5a70"/>' +
        '<circle cx="75" cy="31" r="12" fill="#2f2f3c"/><circle cx="75" cy="31" r="6" fill="#5a5a70"/>' +
        '<ellipse cx="50" cy="57" rx="32" ry="30" fill="#2f2f3c"/>' +
        '<ellipse cx="50" cy="71" rx="15" ry="11" fill="#4c4c5e"/>' +
        '<ellipse cx="37" cy="52" rx="6.5" ry="5.2" fill="#ffd43b"/><ellipse cx="37" cy="52" rx="2" ry="4.4" fill="#111"/>' +
        '<ellipse cx="63" cy="52" rx="6.5" ry="5.2" fill="#ffd43b"/><ellipse cx="63" cy="52" rx="2" ry="4.4" fill="#111"/>' +
        '<path d="M45 63h10l-5 6z" fill="#e58aa0"/>' +
        '<path d="M50 69v3m0 0q-4 4-8 1m8-1q4 4 8 1" fill="none" stroke="#9a9ab2" stroke-width="2" stroke-linecap="round"/>' +
        '<path d="M30 68l-14-2m14 6l-13 4m53-8l14-2m-14 6l13 4" stroke="#8a8aa2" stroke-width="1.6" stroke-linecap="round"/>',
        'animal'
      );
    },
    carrot() {
      return svg(
        '<g transform="rotate(30 50 54)">' +
        '<ellipse cx="38" cy="22" rx="5.5" ry="13" fill="#51b85f" transform="rotate(-32 38 22)"/>' +
        '<ellipse cx="62" cy="22" rx="5.5" ry="13" fill="#51b85f" transform="rotate(32 62 22)"/>' +
        '<ellipse cx="50" cy="18" rx="6" ry="14" fill="#3fa34d"/>' +
        '<path d="M50 28c11 0 18 7 16 17-3 17-9 35-16 47-7-12-13-30-16-47-2-10 5-17 16-17z" fill="#f58a1f"/>' +
        '<path d="M41 46h9M51 58h9M43 69h7" fill="none" stroke="#d96f0e" stroke-width="2.6" stroke-linecap="round"/>' +
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
        '<rect x="46.5" y="8" width="7" height="14" rx="3.5" fill="#6b4420"/>' +
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
    },
    brain() {
      return svg(
        '<path d="M48 18c-5-5-15-5-19 1-7 0-13 6-12 13-6 4-7 12-3 17-3 7 1 15 8 17 1 7 9 12 16 9 4 3 8 3 10 0z" fill="#f7a8c4"/>' +
        '<path d="M52 18c5-5 15-5 19 1 7 0 13 6 12 13 6 4 7 12 3 17 3 7-1 15-8 17-1 7-9 12-16 9-4 3-8 3-10 0z" fill="#f48fb1"/>' +
        '<path d="M50 20v62M28 34c6 0 9 4 9 9M25 55c6-2 11 2 11 7M72 34c-6 0-9 4-9 9M75 55c-6-2-11 2-11 7" fill="none" stroke="#c2185b" stroke-width="3" stroke-linecap="round"/>'
      );
    },
    board() {
      let cells = '';
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          cells += '<rect x="' + (17 + c * 22) + '" y="' + (17 + r * 22) + '" width="22" height="22" fill="' + ((r + c) % 2 ? '#ffe2b8' : '#93d36b') + '"/>';
        }
      }
      return svg(
        '<rect x="10" y="10" width="80" height="80" rx="10" fill="#a9713d"/>' + cells +
        '<path d="M28 72L72 28" stroke="#2f7df6" stroke-width="5" stroke-linecap="round" stroke-dasharray="1 9"/>' +
        '<path d="M28 28v44" stroke="#e5484d" stroke-width="5" stroke-linecap="round" stroke-dasharray="1 9"/>'
      );
    },
    target() {
      return svg(
        '<circle cx="46" cy="54" r="34" fill="#e5484d"/><circle cx="46" cy="54" r="24" fill="#fff"/>' +
        '<circle cx="46" cy="54" r="14" fill="#e5484d"/><circle cx="46" cy="54" r="5" fill="#fff"/>' +
        '<path d="M47 53L82 18" stroke="#3a2a18" stroke-width="5" stroke-linecap="round"/>' +
        '<path d="M80 8l2 12 12 2-8 8-12-2-2-12z" fill="#ffc93c" stroke="#e8a200" stroke-width="2" stroke-linejoin="round"/>'
      );
    },
    info() {
      return '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="9.5" fill="none" stroke="currentColor" stroke-width="2"/>' +
        '<circle cx="12" cy="7.4" r="1.5" fill="currentColor"/><path d="M12 11v6.2" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/></svg>';
    }
  };

  /* Chess pieces for the cheat sheet. */
  const PIECE_INK = 'fill="#3a2a18" stroke="#fff" stroke-width="2.5" stroke-linejoin="round"';
  const BASE = '<rect x="22" y="78" width="56" height="13" rx="4" ' + PIECE_INK + '/>';
  const PIECE = {
    king() {
      return svg('<path d="M46 4h8v8h8v8h-8v8h-8v-8h-8v-8h8z" ' + PIECE_INK + '/>' +
        '<path d="M28 38c0-9 44-9 44 0l-9 40H37z" ' + PIECE_INK + '/>' + BASE);
    },
    pawn() {
      return svg('<circle cx="50" cy="30" r="14" ' + PIECE_INK + '/>' +
        '<path d="M37 46h26l-5 8 7 24H35l7-24z" ' + PIECE_INK + '/>' + BASE);
    },
    knight() {
      return svg('<path d="M32 78c0-16 9-22 15-30-7 3-14 4-18 0-4-5 1-11 8-17l10-9 2-10 7 9c15 5 23 20 21 38l-3 19z" ' + PIECE_INK + '/>' +
        '<circle cx="50" cy="28" r="3" fill="#fff"/>' + BASE);
    },
    bishop() {
      return svg('<circle cx="50" cy="11" r="6" ' + PIECE_INK + '/>' +
        '<path d="M50 18c13 10 19 21 15 33-2 7-7 11-15 11s-13-4-15-11c-4-12 2-23 15-33z" ' + PIECE_INK + '/>' +
        '<path d="M53 30l-7 12" stroke="#fff" stroke-width="3" stroke-linecap="round"/>' +
        '<path d="M39 62h22l5 16H34z" ' + PIECE_INK + '/>' + BASE);
    },
    rook() {
      return svg('<path d="M26 12h11v9h7v-9h12v9h7v-9h11v22l-9 7v37H35V41l-9-7z" ' + PIECE_INK + '/>' + BASE);
    },
    queen() {
      return svg('<circle cx="16" cy="22" r="6" ' + PIECE_INK + '/><circle cx="33" cy="13" r="6" ' + PIECE_INK + '/>' +
        '<circle cx="50" cy="9" r="6" ' + PIECE_INK + '/><circle cx="67" cy="13" r="6" ' + PIECE_INK + '/><circle cx="84" cy="22" r="6" ' + PIECE_INK + '/>' +
        '<path d="M17 29l13 22 3-31 11 29 6-31 6 31 11-29 3 31 13-22-9 49H26z" ' + PIECE_INK + '/>' + BASE);
    }
  };
  const SHEET = [['lion', 'king'], ['hare', 'pawn'], ['squirrel', 'knight'], ['fox', 'bishop'], ['lynx', 'rook'], ['panther', 'queen']];

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
        ? '<path d="M16 8.5a5 5 0 010 7M18.5 6a8.5 8.5 0 010 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>'
        : '<path d="M16.5 9.5l5 5m0-5l-5 5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>') +
      '</svg>';
  }

  const COLS = 'abcde';
  function label(p) { return t('label', p.team, p.kind); }

  /* ------------------------------------------------------------------ */
  /* Sound (tiny synth, no files)                                        */
  /* ------------------------------------------------------------------ */

  let soundOn = load('forest-sound') !== 'off';
  let actx = null;

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
      const t0 = a.currentTime + 0.01;
      switch (name) {
        case 'tap': tone(a, 620, t0, 0.07, 'sine', 0.08); break;
        case 'roll': for (let i = 0; i < 9; i++) tone(a, 240 + Math.random() * 380, t0 + i * 0.09, 0.05, 'square', 0.035); break;
        case 'step': tone(a, 420, t0, 0.12, 'sine', 0.14, 640); break;
        case 'hop': tone(a, 500, t0, 0.1, 'sine', 0.14, 900); tone(a, 700, t0 + 0.13, 0.12, 'sine', 0.12, 1100); break;
        case 'catch': tone(a, 660, t0, 0.12, 'triangle', 0.16, 330); tone(a, 330, t0 + 0.13, 0.2, 'triangle', 0.14, 200); break;
        case 'bonus': [660, 880, 1100, 1320].forEach((f, i) => tone(a, f, t0 + i * 0.09, 0.14, 'sine', 0.12)); break;
        case 'rest': tone(a, 300, t0, 0.3, 'sine', 0.12, 170); break;
        case 'win': [523, 659, 784, 1047, 784, 1047].forEach((f, i) => tone(a, f, t0 + i * 0.14, 0.22, 'triangle', 0.16)); break;
      }
    } catch (e) { /* sound is optional */ }
  }

  /* ------------------------------------------------------------------ */
  /* Screen                                                              */
  /* ------------------------------------------------------------------ */

  const el = {
    intro: byId('intro'), introScroll: byId('introScroll'), sheet: byId('sheet'), skip: byId('skipIntro'),
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
  let lastMsg = null; // [key, args] so the message can be re-said in another language
  let introReturn = 'menu'; // where "Go to the game" leads: 'menu' | 'game'
  const cellEls = [];
  let pieceEls = {};

  const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  function say(key) {
    const args = Array.prototype.slice.call(arguments, 1);
    lastMsg = [key, args];
    el.message.textContent = t.apply(null, [key].concat(args));
  }
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
        if (type !== 'grass') b.innerHTML = ART[type]();
        cellEls[y * F.SIZE + x] = b;
        el.board.insertBefore(b, el.pieces);
      }
    }
  }

  function buildSheet() {
    el.sheet.innerHTML = SHEET.map((pair) =>
      '<li role="img" aria-label="' + t('sheetItem', pair[0], pair[1]) + '">' +
      '<span class="s-animal">' + ART[pair[0]]() + '</span>' +
      '<span class="s-eq" aria-hidden="true">=</span>' +
      '<span class="s-piece">' + PIECE[pair[1]]() + '</span></li>'
    ).join('');
    // The same pairs as a small list inside the first point of the landing page.
    byId('pairs').innerHTML = SHEET.map((pair) =>
      '<li><span class="pair-ico" aria-hidden="true">' + ART[pair[0]]() + '</span><span>' + t('pair', pair[0], pair[1]) + '</span></li>'
    ).join('');
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
    mini.dataset.team = p.team;
    mini.dataset.kind = p.kind;
    mini.setAttribute('aria-label', label(p));
    mini.innerHTML = ART[p.kind]();
    node.appendChild(mini);
  }

  function renderWho() {
    el.whoRed.textContent = mode === 'cpu' ? t('who.you') : '';
    el.whoBlue.textContent = mode === 'cpu' ? t('who.cpu') : '';
  }

  /* Put every text on the page into the current language. */
  function applyLang() {
    document.documentElement.lang = lang;
    document.title = t('doc.title');
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', t('meta.desc'));
    document.querySelectorAll('[data-t]').forEach((n) => { n.textContent = t(n.dataset.t); });
    document.querySelectorAll('[data-t-html]').forEach((n) => { n.innerHTML = t(n.dataset.tHtml); });
    document.querySelectorAll('[data-t-aria]').forEach((n) => { n.setAttribute('aria-label', t(n.dataset.tAria)); });
    // Justified landing texts get break points inside long words, so lines don't get wide gaps.
    if (window.ForestHyphen) document.querySelectorAll('.intro-lead, .dev p, .maps').forEach((n) => window.ForestHyphen.apply(n, lang));
    document.querySelectorAll('.lang button').forEach((b) => { b.setAttribute('aria-pressed', b.dataset.lang === lang ? 'true' : 'false'); });
    buildSheet();
    for (const c of cellEls) {
      const x = Number(c.dataset.x);
      const y = Number(c.dataset.y);
      c.setAttribute('aria-label', t('cell', COLS[x] + (y + 1), F.cellType(x, y)));
    }
    if (state) {
      for (const p of state.pieces) if (pieceEls[p.id]) pieceEls[p.id].setAttribute('aria-label', label(p));
    }
    document.querySelectorAll('.mini').forEach((m) => { m.setAttribute('aria-label', t('label', m.dataset.team, m.dataset.kind)); });
    renderWho();
    setSound(soundOn);
    if (lastMsg) say.apply(null, [lastMsg[0]].concat(lastMsg[1]));
    if (!el.win.hidden) renderWin();
  }

  function setLang(code) {
    if (I18N.codes.indexOf(code) < 0 || code === lang) return;
    lang = code;
    save('forest-lang', code);
    applyLang();
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
      for (const tg of state.choices.targets) cellEl(tg.x, tg.y).classList.add('target');
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
    if (isCpuTurn()) say('turnCpu');
    else if (mode === 'cpu') say('turnYou');
    else say('turnTeam', state.turn);
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
      say('rest');
      await pause(1900);
      return passTurn(my);
    }
    if (out.type === 'bonus-none') {
      sfx('rest');
      say('noBonus', out.kind, out.reason);
      await pause(2300);
      return passTurn(my);
    }
    if (out.type === 'no-moves') {
      sfx('rest');
      say('noMoves', out.steps);
      await pause(2300);
      return passTurn(my);
    }
    if (out.type === 'bonus') return playBonus(out, my);
    if (out.type === 'bonus-choose') {
      if (isCpuTurn()) {
        await pause(700);
        if (my !== session) return;
        const tg = F.aiChooseBonus(state, level);
        return playBonus(F.applyBonus(state, tg.x, tg.y), my);
      }
      say(out.kind === 'hare' ? 'chooseCarrot' : 'chooseTree');
      busy = false;
      refresh();
      return;
    }
    // Stars: the team walks.
    if (isCpuTurn()) {
      say('rolledCpu', out.steps);
      return cpuMoves(my);
    }
    say('rolledYou', out.steps);
    busy = false;
    autoSelect();
    refresh();
  }

  async function playBonus(out, my) {
    const node = pieceEls[out.pieceId];
    busy = true;
    node.classList.add('hop', 'moving');
    sfx('bonus');
    say(out.kind === 'hare' ? 'bonusHare' : 'bonusSquirrel');
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
    if (ev.captured) say('catch', ev.piece.kind, ev.captured.kind);
    else if (ev.win === 'hare') say('hareHome');
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
      else if (ev.reason === 'stuck') { say('stuck'); await pause(1300); }
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
    say('left', state.stepsLeft);
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
      if (state.choices.targets.some((tg) => tg.x === x && tg.y === y)) chooseBonus(x, y);
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
  /* Screens: landing page, menu, game; dialogs                          */
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

  function showIntro(from) {
    introReturn = from;
    el.skip.checked = load('forest-skip-intro') === '1';
    el.menu.hidden = true;
    el.game.hidden = true;
    el.intro.hidden = false;
    el.introScroll.scrollTop = 0;
  }
  function leaveIntro() {
    audio(); // unlock sound while we are inside a tap
    el.intro.hidden = true;
    if (introReturn === 'game' && state) el.game.hidden = false;
    else el.menu.hidden = false;
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
    renderWho();
    el.die.classList.remove('rolling', 'landed');
    setDie('star3');

    el.win.hidden = true;
    el.quit.hidden = true;
    el.intro.hidden = true;
    el.menu.hidden = true;
    el.game.hidden = false;
    announceTurn();
    refresh();
    if (isCpuTurn()) cpuTurn(session);
  }

  function toMenu() {
    session++;
    busy = false;
    state = null;
    lastMsg = null;
    el.win.hidden = true;
    el.quit.hidden = true;
    el.game.hidden = true;
    el.menu.hidden = false;
  }

  function renderWin() {
    const w = state.winner;
    const lion = state.winReason === 'lion';
    el.winArt.innerHTML = lion ? ART.lion() : ART.hare();
    el.winTitle.textContent = t(lion ? 'winLionTitle' : 'winHareTitle');
    el.winText.textContent = t(lion ? 'winLionText' : 'winHareText');
    el.winWho.textContent = mode === 'cpu' ? t(w === CPU_TEAM ? 'winCpu' : 'winYou') : t('winTeam', w);
    el.winWho.className = 'win-who ' + w;
  }

  function showWin() {
    busy = true;
    refresh();
    renderWin();
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
    el.sound.setAttribute('aria-label', t(on ? 'sound.on' : 'sound.off'));
  }

  /* ------------------------------------------------------------------ */
  /* Wiring                                                              */
  /* ------------------------------------------------------------------ */

  document.querySelectorAll('[data-art]').forEach((node) => { node.innerHTML = ART[node.dataset.art](); });
  buildBoard();
  applyLang();

  document.querySelectorAll('.lang button').forEach((b) => b.addEventListener('click', () => setLang(b.dataset.lang)));
  byId('btnGo').addEventListener('click', leaveIntro);
  el.skip.addEventListener('change', () => save('forest-skip-intro', el.skip.checked ? '1' : null));
  byId('btnAboutMenu').addEventListener('click', () => showIntro('menu'));
  byId('btnAbout').addEventListener('click', () => showIntro('game'));

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
  el.sound.addEventListener('click', () => {
    setSound(!soundOn);
    save('forest-sound', soundOn ? 'on' : 'off');
    sfx('tap');
  });

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
    const tg = e.target.closest('[data-x]');
    if (!tg || !state || busy || !isHumanTurn()) return;
    onTap(Number(tg.dataset.x), Number(tg.dataset.y));
  });

  // First screen: the landing page, unless the parent asked not to show it again.
  if (load('forest-skip-intro') === '1') el.menu.hidden = false;
  else showIntro('menu');
})();
