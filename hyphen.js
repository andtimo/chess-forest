/*
 * Шахматный лес: hyphenation for justified texts (Russian, Slovak, English).
 * Inserts soft hyphens (U+00AD) so every browser can split long words, even without its own dictionaries.
 * Syllable rules: between two vowel groups the consonants are split
 *   0 consonants -> between the vowels (Russian only), 1 -> before it, 2 -> in the middle, 3+ -> two go right.
 * Letters й ъ ь stay on the left; digraphs (ch, dz, th ...) are never split.
 * Words the rules get wrong go into EXCEPTIONS.
 */
(function (root) {
  'use strict';

  const SHY = '­';
  const LANG = {
    ru: {
      vowels: 'аеёиоуыэюя', sticky: 'йъь', min: [2, 2], splitVowels: true, oneConsonant: true,
      digraphs: []
    },
    sk: {
      vowels: 'aáäeéiíoóôuúyý', sticky: '', min: [2, 2], splitVowels: false, oneConsonant: true,
      digraphs: ['ch', 'dz', 'dž'], syllabic: 'rŕlĺ'
    },
    // English spelling doesn't follow simple syllable rules: only the hand-checked words below are split.
    en: { rules: false }
  };

  // Hand-checked hyphenation ('-' marks the allowed breaks). Overrides the rules; for English it is the only source.
  const EXCEPTIONS = {
    ru: {
      'абстрактные': 'аб-стракт-ные', 'настоящим': 'на-сто-я-щим', 'наглядно': 'на-гляд-но',
      'повторяет': 'по-вто-ря-ет', 'геометрии': 'гео-мет-рии', 'безопасности': 'без-опас-но-сти',
      'просто': 'про-сто', 'просчитывать': 'про-счи-ты-вать', 'тактическую': 'так-ти-че-скую'
    },
    sk: {
      'abstraktné': 'ab-strakt-né', 'nahradili': 'na-hra-di-li', 'pripravili': 'pri-pra-vi-li',
      'uhlopriečky': 'uhlo-prieč-ky', 'sústredenie': 'sú-stre-de-nie', 'dopredu': 'do-pre-du'
    },
    en: {
      'replaced': 're-placed', 'complex': 'com-plex', 'abstract': 'ab-stract', 'friendly': 'friend-ly',
      'gently': 'gent-ly', 'thinking': 'think-ing', 'follows': 'fol-lows', 'understanding': 'un-der-stand-ing',
      'concentration': 'con-cen-tra-tion', 'protecting': 'pro-tect-ing', 'toddlers': 'tod-dlers',
      'tactical': 'tac-ti-cal', 'children': 'chil-dren', 'older': 'old-er', 'original': 'orig-i-nal',
      'training': 'train-ing', 'prepare': 'pre-pare', 'animals': 'an-i-mals', 'animal': 'an-i-mal',
      'develops': 'de-vel-ops', 'diagonals': 'di-ag-o-nals', 'without': 'with-out', 'boring': 'bor-ing',
      'memorisation': 'mem-o-ri-sa-tion', 'strategy': 'strat-e-gy', 'visual': 'vis-u-al',
      'forest': 'for-est', 'pieces': 'piec-es'
    }
  };

  function breaks(word, cfg) {
    const w = word.toLowerCase();
    const n = w.length;
    const isLetter = (c) => c !== undefined && c.toLowerCase() !== c.toUpperCase();
    const rawVowel = (i) => cfg.vowels.indexOf(w[i]) >= 0;
    const rawCons = (i) => isLetter(w[i]) && !rawVowel(i);
    // Slovak r/l between consonants act as vowels (vlk, krk, prst).
    const isVowel = (i) => rawVowel(i) ||
      (!!cfg.syllabic && cfg.syllabic.indexOf(w[i]) >= 0 && i > 0 && rawCons(i - 1) && (i === n - 1 || rawCons(i + 1)));

    // Vowel groups: [start, end) index pairs.
    const groups = [];
    for (let i = 0; i < n; i++) {
      if (!isVowel(i)) continue;
      if (groups.length && groups[groups.length - 1][1] === i) groups[groups.length - 1][1] = i + 1;
      else groups.push([i, i + 1]);
    }
    const points = [];
    // Inside a vowel group (Russian: тра-ек-то-рия).
    if (cfg.splitVowels) {
      for (const g of groups) for (let i = g[0] + 1; i < g[1]; i++) points.push(i);
    }
    // Between vowel groups.
    for (let k = 0; k + 1 < groups.length; k++) {
      const a = groups[k][1];
      const b = groups[k + 1][0];
      const len = b - a; // consonants between the two vowel groups
      let cut;
      if (len === 0) continue;
      if (len === 1) { if (!cfg.oneConsonant) continue; cut = a; }
      else if (len === 2) cut = a + 1;
      else cut = b - 2;
      // й ъ ь never start a line: move the break after the last of them in the cluster.
      for (let i = a; i < b; i++) if (cfg.sticky.indexOf(w[i]) >= 0 && i >= cut) cut = i + 1;
      // Never split a digraph: move the break before it.
      for (const d of cfg.digraphs) {
        if (cut > a - 1 && w.substr(cut - 1, d.length) === d && cut - 1 >= a) cut -= 1;
      }
      if (!cfg.oneConsonant && cut === a) continue;
      if (cut > a - 1 && cut <= b) points.push(cut);
    }
    return points
      .filter((p) => p >= cfg.min[0] && n - p >= cfg.min[1])
      .sort((x, y) => x - y)
      .filter((p, i, arr) => arr.indexOf(p) === i);
  }

  function hyphenateWord(word, lang) {
    const cfg = LANG[lang];
    if (!cfg || word.length < 5) return word;
    const ex = EXCEPTIONS[lang][word.toLowerCase()];
    if (ex !== undefined) {
      // Copy the original letters (keeps capitals) and put breaks where the exception has '-'.
      let out = '';
      let j = 0;
      for (const ch of ex) {
        if (ch === '-') out += SHY;
        else out += word[j++];
      }
      return out;
    }
    if (cfg.rules === false) return word;
    const pts = breaks(word, cfg);
    let out = '';
    let last = 0;
    for (const p of pts) { out += word.slice(last, p) + SHY; last = p; }
    return out + word.slice(last);
  }

  const WORD = /[\p{L}]+/gu;
  function hyphenateText(text, lang) { return text.replace(WORD, (w) => hyphenateWord(w, lang)); }

  /* Hyphenate every text node inside an element (keeps <b> and other tags). */
  function apply(el, lang) {
    if (!LANG[lang]) return;
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach((node) => { node.nodeValue = hyphenateText(node.nodeValue, lang); });
  }

  root.ForestHyphen = { apply, hyphenateText, hyphenateWord, SHY };
})(typeof window !== 'undefined' ? window : globalThis);
