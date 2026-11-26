/*
 * Шахматный лес: all texts in Russian, Slovak and English.
 * A value is either a string or a function that builds the string (for plurals, genders, names).
 * Keys with an .html suffix may contain <b> tags.
 */
(function (root) {
  'use strict';

  /* ---------------- Русский ---------------- */
  const RU_ANIMAL = {
    hare: { nom: 'Зайчик', acc: 'Зайчика', fem: false },
    fox: { nom: 'Лисичка', acc: 'Лисичку', fem: true },
    lion: { nom: 'Лев', acc: 'Льва', fem: false },
    lynx: { nom: 'Рысь', acc: 'Рысь', fem: true },
    squirrel: { nom: 'Белочка', acc: 'Белочку', fem: true },
    panther: { nom: 'Пантера', acc: 'Пантеру', fem: true }
  };
  const RU_SHEET = { lion: 'Лев', hare: 'Заяц', squirrel: 'Белка', fox: 'Лиса', lynx: 'Рысь', panther: 'Пантера' };
  const RU_PIECE = { king: 'Король', pawn: 'Пешка', knight: 'Конь', bishop: 'Слон', rook: 'Ладья', queen: 'Ферзь' };
  // Tap hint under the cheat sheet: how the animal moves.
  const RU_HINT = {
    lion: 'ходит на 1 клетку в любую сторону', hare: 'бежит только вперёд', squirrel: 'прыгает буквой «Г» через зверей',
    fox: 'ходит наискосок', lynx: 'ходит прямо: вперёд, назад и вбок',
    panther: 'бежит по прямой в любую сторону на 1–3 клетки'
  };
  const ruStars = (n) => (n === 1 ? 'Выпала 1 звёздочка' : 'Выпало ' + n + ' звёздочки');
  const ruSteps = (n) => (n === 1 ? '1 шаг' : n + ' шага');
  const ruLeft = (n) => (n === 1 ? 'Остался ' : 'Осталось ') + ruSteps(n) + '.';
  const ruCell = { carrot: ', морковка', tree: ', дерево', trap: ', капкан' };
  // 1 игра, 2 игры, 5 игр
  const ruPl = (n, one, few, many) => {
    const d = n % 10;
    const h = n % 100;
    return n + ' ' + (d === 1 && h !== 11 ? one : d >= 2 && d <= 4 && (h < 12 || h > 14) ? few : many);
  };
  const ruDraws = (d) => (d ? ' · ' + ruPl(d, 'ничья', 'ничьи', 'ничьих') : '');
  // Trainer treats: [nominative, accusative]
  const RU_TREAT = { carrot: ['морковка', 'морковку'], nut: ['орешек', 'орешек'], berry: ['ягодка', 'ягодку'], star: ['звёздочка', 'звёздочку'] };
  const cap = (w) => w.charAt(0).toUpperCase() + w.slice(1);

  const ru = {
    'doc.title': 'Шахматный лес',
    'meta.desc': 'Шахматный лес: первая ступень к большим шахматам для детей от 2 лет.',
    'lang.label': 'Язык',
    'about': 'О методике',

    'intro.title': 'ШАХМАТНЫЙ ЛЕС',
    'intro.subtitle': 'Первая ступень к большим шахматам для детей от 2 лет',
    'intro.lead': 'Это не просто сказочная игра, а авторская предшахматная тренировочная площадка. Мы заменили сложные абстрактные фигуры на понятных лесных жителей, чтобы мягко подготовить мозг ребёнка к настоящим шахматам.',
    'intro.h': 'Что развивает игра:',
    'intro.p1.html': '<b>Наглядно-образное мышление:</b> Каждый зверь повторяет траекторию реальной шахматной фигуры:',
    'pair': (a, p) => '<b>' + RU_SHEET[a] + '</b> — ' + RU_PIECE[p],
    'intro.p2.html': '<b>Понимание геометрии доски:</b> Ребёнок учится видеть прямые линии, диагонали и клетки безопасности без скучной зубрёжки.',
    'intro.p3.html': '<b>Стратегию и логику:</b> Поля 5×5 и 6×6 тренируют концентрацию внимания, умение просчитывать шаги вперёд и защищать свои фигуры.',
    'intro.maps': 'Играйте с малышами на Карте 1, а с детьми от 4 лет и старше — покоряйте тактическую Карту 2!',
    'intro.go': 'ПЕРЕЙТИ В ИГРУ',
    'intro.skip': 'Больше не показывать при входе',
    'intro.sheet': 'Зверь = шахматная фигура',
    'sheetItem': (a, p) => RU_SHEET[a] + ' = ' + RU_PIECE[p],
    'sheetHint': (a) => RU_HINT[a],

    'menu.subtitle': 'Лесная игра для маленьких шахматистов',
    'menu.two': 'Играть вдвоём',
    'menu.cpu': 'Играть с компьютером',
    'menu.level': 'Компьютер:',
    'menu.easy': 'Добрый',
    'menu.smart': 'Хитрый',
    'menu.timer': 'Таймер:',
    'menu.timer0': 'Без таймера',
    'menu.timer30': '30 секунд',
    'menu.timer15': '15 секунд',
    'menu.timer30s': '30 сек', // short labels for narrow phones
    'menu.timer15s': '15 сек',
    'menu.timerNote0': 'для малышей 2–3 лет',
    'menu.timerNote30': 'для детей 4–6 лет',
    'menu.timerNote15': 'Блиц для старших детей и взрослых',
    'menu.rules': 'Правила',
    'menu.map': 'Карта',
    'menu.school': 'Тренажёр: Учимся ходить',
    // Score (kept on this device): per computer level, and Red against Blue for two players
    'score.cpu': (lvl, s) => (lvl === 'easy' ? 'Добрый' : 'Хитрый') + ': ' + ruPl(s.w + s.l + s.d, 'игра', 'игры', 'игр') +
      ' · ' + ruPl(s.w, 'победа', 'победы', 'побед') + ' · ' + ruPl(s.l, 'поражение', 'поражения', 'поражений') + ruDraws(s.d),
    'score.two': (s) => 'Вдвоём: ' + ruPl(s.red + s.blue + s.d, 'игра', 'игры', 'игр') + ' · Красные ' + s.red + ' · Синие ' + s.blue + ruDraws(s.d),
    'score.reset': 'Сбросить счёт',
    'score.ask': 'Сбросить весь счёт?',
    'score.yes': 'Да, сбросить',
    'score.no': 'Нет',
    'map.1': 'Солнечная поляна',
    'map.1.age': '2–4 года',
    'map.2': 'Глубокий лес',
    'map.2.age': '4+ лет',

    'game.menu': 'Меню',
    'team.red': 'Красные',
    'team.blue': 'Синие',
    'team.turn': 'ходят',
    'den.red': 'Домик красных',
    'den.blue': 'Домик синих',
    'die': 'Бросить кубик',
    'done': 'Закончить ход',
    'who.you': '(ты)',
    'who.cpu': '(компьютер)',
    'sound.on': 'Звук включён',
    'sound.off': 'Звук выключен',

    'quit.title': 'Закончить игру?',
    'quit.text': 'Звери вернутся на свои места.',
    'quit.no': 'Играть дальше',
    'quit.yes': 'В меню',
    'win.again': 'Играть ещё',
    'win.menu': 'В меню',

    'rules.title': 'Как играть',
    'rules.close': 'Понятно',
    'rules.h.win': 'Как победить',
    'rules.lion.html': '<b>Царские обнимашки.</b> Поймай чужого Льва своим Львом.',
    'rules.hare.html': '<b>Заячий триумф.</b> Доведи своего Зайчика до дальнего края леса.',
    'rules.h.die': 'Кубик',
    'rules.die': 'Команды ходят по очереди. Брось кубик и делай то, что выпало.',
    'rules.carrot.html': '<b>Морковка.</b> Твой Зайчик прыгает к ближайшей морковке и кушает. Пока соперник делает свой ход, Зайчика нельзя поймать.',
    'rules.tree.html': '<b>Дерево.</b> Твоя Белочка прыгает на ближайшее дерево и получает орешек. Пока соперник делает свой ход, её никто не достанет.',
    'rules.stars.html': '<b>Звёздочки.</b> Сколько звёздочек, столько шагов. Шаги можно отдать одному зверю или разделить между разными. Можно закончить ход раньше.',
    'rules.empty.html': '<b>Пустая грань.</b> Звери решили отдохнуть, ход пропускается.',
    'rules.timer': 'Таймер (если включён): на ход даётся 30 или 15 секунд. Не успел — ход переходит к сопернику.',
    'rules.h.moves': 'Как ходят звери',
    'rules.oneStep': 'Один шаг каждого зверя:',
    'rules.m.lion.html': '<b>Лев</b> идёт на одну клетку в любую сторону. Ловит любого зверя соперника.',
    'rules.m.hare.html': '<b>Зайчик</b> идёт на одну клетку только вперёд. Никого не ловит.',
    'rules.m.squirrel.html': '<b>Белочка</b> прыгает буквой «Г», как шахматный конь: две клетки прямо и одну вбок. Перепрыгивает через зверей. Никого не ловит.',
    'rules.m.fox.html': '<b>Лисичка</b> идёт на одну клетку наискосок. Ловит Зайчика и Белочку.',
    'rules.m.lynx.html': '<b>Рысь</b> идёт на одну клетку прямо: вперёд, назад или вбок. Ловит Зайчика и Белочку. Только Рысь может поймать Белочку на дереве.',
    'rules.h.hunt': 'Лесная охота',
    'rules.hunt1': 'Чтобы поймать зверя, наступи на его клетку. Пойманный зверь уходит отдыхать в домик.',
    'rules.hunt2': 'Поймал зверя, и ход закончился.',
    'rules.hunt3': 'Перепрыгивать через других зверей умеет только Белочка.',
    'rules.hunt4': 'Чужого Льва может поймать только Лев.',
    // Map 2 «Глубокий лес» (6x6). The Panther and trap texts are the author's, word for word
    // (only «но боится воды» was dropped: there is no water on the 6x6 map; OK'd 2026-11-24).
    'rules.map1': 'Карта 1: «Солнечная поляна» (2–4 года)',
    'rules.map2': 'Карта 2: «Глубокий Лес» (Уровень 4+ лет)',
    'rules.draw.html': '<b>Ничья.</b> Если на поле остались только два Льва, игра заканчивается вничью.',
    'rules.carrottree.html': '<b>Морковка или Дерево:</b> выберите сами — Зайчика на Морковку или Белочку на Дерево.',
    'rules.trapface.html': '<b>Капкан:</b> в капкан попадает тот ваш зверь, который ближе всех к свободному капкану (кроме Льва). Если таких несколько — выбираете вы.',
    'rules.bonusNote': 'Пока соперник делает свой ход, Зайчика на морковке и Белочку с орешком поймать нельзя.',
    'rules.walkIn': 'Если Зайчик сам дойдёт до морковки или Белочка сама допрыгнет до дерева, они тоже кушают: пока соперник делает свой ход, их нельзя поймать. В этот ход они больше не ходят.',
    'rules.m.lynx2.html': '<b>Рысь</b> идёт на одну клетку прямо: вперёд, назад или вбок. Ловит Зайчика и Белочку.',
    'rules.m.panther.html': '<b>Пантера (= Ферзь):</b> Самая быстрая хищница. Ходит во все стороны (прямо и наискосок) на 1, 2 или 3 клетки. Умеет лазить на Дерево за Белкой.',
    'rules.trap.html': '<b>Капкан:</b> Опасная клетка. Если зверь наступит на неё, он пропускает 2 хода (Лев слишком мудр и не может наступить в капкан, а Белка может его перепрыгнуть). Чтобы спасти друга быстрее, подойдите любым своим зверем на соседнюю клетку.',
    'rules.run': 'Пантера тратит по звёздочке на каждую клетку и за один ход бежит только по одной прямой, не сворачивая.',
    'rules.h.cells': 'Особые клетки',
    'rules.hunt5': 'Белочку на дереве (без орешка) могут поймать только Рысь и Пантера.',
    'rules.hunt6': 'Зверя в капкане тоже можно поймать, но охотник сам попадёт в капкан.',
    'rules.hunt7': 'Лисичку, Рысь и Пантеру может поймать только Лев.',

    'label': (team, kind) => {
      const fem = RU_ANIMAL[kind].fem;
      const colour = team === 'red' ? (fem ? 'Красная' : 'Красный') : (fem ? 'Синяя' : 'Синий');
      return colour + ' ' + RU_ANIMAL[kind].nom;
    },
    'pieceTrapped': 'в капкане',
    'cell': (name, type) => 'Клетка ' + name + (ruCell[type] || ''),
    'turnCpu': 'Ходит компьютер…',
    'turnYou': 'Твой ход. Брось кубик!',
    'turnTeam': (team) => 'Ход ' + (team === 'red' ? 'красных' : 'синих') + '. Брось кубик!',
    'rest': 'Ой, звери решили отдохнуть! Ход пропускается.',
    'noBonus': (kind, reason) => {
      if (kind === 'carrottree') return 'Морковка или Дерево! Но ни Зайчик, ни Белочка сейчас не могут прыгнуть. Ход пропускается.';
      if (kind === 'hare') {
        return reason === 'caught'
          ? 'Морковка! Но Зайчик уже отдыхает в домике. Ход пропускается.'
          : 'Морковка! Но Зайчику до неё не добраться. Ход пропускается.';
      }
      if (reason === 'trapped') return 'Дерево! Но Белочка сидит в капкане. Ход пропускается.';
      return reason === 'caught'
        ? 'Дерево! Но Белочка уже отдыхает в домике. Ход пропускается.'
        : 'Дерево! Но оба дерева заняты. Ход пропускается.';
    },
    'noMoves': (n) => ruStars(n) + ', но ходить некуда. Ход пропускается.',
    'chooseCarrot': 'Морковка! Выбери, к какой морковке прыгнет Зайчик.',
    'chooseTree': 'Дерево! Выбери, на какое дерево прыгнет Белочка.',
    'chooseCarrotTree': 'Морковка или Дерево! Кто прыгнет? Нажми на Зайчика или на Белочку.',
    'rolledCpu': (n) => ruStars(n) + '. Компьютер ходит…',
    'rolledYou': (n) => ruStars(n) + '. Выбери зверя и сделай ' + ruSteps(n) + '.',
    'bonusHare': 'Морковка! Зайчик кушает, и его нельзя поймать.',
    'bonusSquirrel': 'Дерево! Белочка грызёт орешек, и её не достать.',
    // Map 2 trap face
    'trapFace': (k) => {
      const a = RU_ANIMAL[k];
      return 'Капкан! ' + a.nom + (a.fem ? ' была ближе всех и попалась' : ' был ближе всех и попался') + ': пропустит 2 хода.';
    },
    'trapFaceAgain': (k) => {
      const a = RU_ANIMAL[k];
      return 'Капкан! ' + a.nom + (a.fem ? ' всё ещё стояла в капкане и снова попалась' : ' всё ещё стоял в капкане и снова попался') + ': пропустит 2 хода.';
    },
    'trapChooseAnimal': 'Капкан! Несколько зверей одинаково близко. Выбери, кто попадёт в капкан.',
    'trapChooseCell': (k) => 'Капкан! Выбери, в какой капкан попадёт ' + RU_ANIMAL[k].nom + '.',
    'trapNone': 'Капкан! Но попасть в капкан некому. Ход пропускается.',
    'inTrap': (k) => {
      const a = RU_ANIMAL[k];
      return a.nom + (a.fem ? ' попала' : ' попал') + ' в капкан и пропустит 2 хода. Спаси ' + (a.fem ? 'её' : 'его') +
        ': подойди к ' + (a.fem ? 'ней' : 'нему') + ' другим зверем!';
    },
    'freed': (kinds, left) => 'Ура! ' + kinds.map((k) => RU_ANIMAL[k].nom).join(' и ') + ' на свободе!' + (left ? ' ' + ruLeft(left) : ''),
    'trappedTap': (k, n) => {
      const a = RU_ANIMAL[k];
      return a.nom + ' в капкане' + (n === 1 ? ' (последний ход).' : ' (ещё ' + n + ' хода).') +
        ' Чтобы спасти, подойди к ' + (a.fem ? 'ней' : 'нему') + ' другим зверем.';
    },
    'catch': (hunter, prey) => {
      const h = RU_ANIMAL[hunter];
      const p = RU_ANIMAL[prey];
      if (prey === 'lion') return h.nom + (h.fem ? ' поймала' : ' поймал') + ' Льва!';
      return h.nom + (h.fem ? ' поймала ' : ' поймал ') + p.acc + '! ' + p.nom + (p.fem ? ' ушла' : ' ушёл') + ' отдыхать в домик.';
    },
    'hareHome': 'Зайчик добежал до края леса!',
    'stuck': 'Больше ходить некуда.',
    'left': ruLeft,
    'timeUp': 'Время вышло! Ход переходит к сопернику.',
    'timerLeft': (n) => 'Осталось секунд: ' + n,
    'winLionTitle': 'Лев пойман!',
    'winHareTitle': 'Заячий триумф!',
    'winLionText': 'Царские обнимашки! Все звери обнимаются.',
    'winHareText': 'Зайчик пробежал весь лес и спасся!',
    'winTeam': (team) => (team === 'red' ? 'Победили красные!' : 'Победили синие!'),
    'winCpu': 'Победил компьютер. В следующий раз получится!',
    'winYou': 'Ты победил!',
    'winDrawTitle': 'Ничья!',
    'winDrawText': 'Львы подружились — победила дружба.',
    // The Hare walked onto a carrot / the Squirrel jumped onto a tree by itself
    'ate': (k, left) => (k === 'hare'
      ? 'Зайчик дошёл до морковки! Он кушает, и его нельзя поймать.'
      : 'Белочка запрыгнула на дерево! Она грызёт орешек, и её не достать.') + (left ? ' ' + ruLeft(left) : ''),

    // Trainer «Лесная школа»
    'school.title': 'Лесная школа',
    'school.back': 'Назад',
    'school.pupils': 'Кого учим',
    'school.name': (k) => RU_SHEET[k],
    'school.pupil': (k, done) => RU_SHEET[k] + (done ? ', выучено' : ''),
    'school.pick': 'Кого будем учить? Нажми на зверя внизу.',
    'school.tap': (k) => 'Нажми на ' + RU_ANIMAL[k].acc + '!',
    'school.go': (tr) => 'Видишь следы? Нажми на ' + RU_TREAT[tr][1] + '!',
    'school.first': (k) => 'Сначала нажми на ' + RU_ANIMAL[k].acc + '.',
    'school.wrong': (tr) => 'Не сюда! ' + cap(RU_TREAT[tr][0]) + ' вот тут.',
    'school.cannot': (k) => 'Так ' + RU_ANIMAL[k].nom + (k === 'squirrel' ? ' не прыгает' : ' не ходит') + '. Иди по следам!',
    'school.yum': (n) => 'Молодец! ' + (n === 1 ? 'Ещё одна вкусняшка.' : 'Ещё ' + n + ' вкусняшки.'),
    'school.done': (k) => 'Ура! ' + RU_ANIMAL[k].nom + (RU_ANIMAL[k].fem ? ' научилась' : ' научился') + ' ходить! Выбери следующего зверя.',
    'school.crunch': 'Хрум!',
    'school.cell': (name, tr) => 'Клетка ' + name + (tr ? ', ' + RU_TREAT[tr][0] : ''),
    'school.progress': (n, total) => 'Съедено ' + n + ' из ' + total
  };

  /* ---------------- Slovenčina ---------------- */
  const SK_ANIMAL = {
    hare: { nom: 'Zajačik', acc: 'Zajačika', fem: false },
    fox: { nom: 'Líška', acc: 'Líšku', fem: true },
    lion: { nom: 'Lev', acc: 'Leva', fem: false },
    lynx: { nom: 'Rys', acc: 'Rysa', fem: false },
    squirrel: { nom: 'Veverička', acc: 'Veveričku', fem: true },
    panther: { nom: 'Panter', acc: 'Pantera', fem: false }
  };
  const SK_SHEET = { lion: 'Lev', hare: 'Zajac', squirrel: 'Veverička', fox: 'Líška', lynx: 'Rys', panther: 'Panter' };
  const SK_PIECE = { king: 'Kráľ', pawn: 'Pešiak', knight: 'Jazdec', bishop: 'Strelec', rook: 'Veža', queen: 'Dáma' };
  const SK_HINT = {
    lion: 'chodí o 1 políčko ľubovoľným smerom', hare: 'beží iba dopredu', squirrel: 'skáče do tvaru „L“ ponad zvieratká',
    fox: 'chodí šikmo', lynx: 'chodí rovno: dopredu, dozadu a nabok',
    panther: 'beží rovno ľubovoľným smerom o 1–3 políčka'
  };
  const skStars = (n) => (n === 1 ? 'Padla 1 hviezdička' : 'Padli ' + n + ' hviezdičky');
  const skSteps = (n) => (n === 1 ? '1 krok' : n + ' kroky');
  const skLeft = (n) => (n === 1 ? 'Zostal 1 krok.' : 'Zostali ' + n + ' kroky.');
  const skCell = { carrot: ', mrkva', tree: ', strom', trap: ', pasca' };
  // 1 hra, 2 hry, 5 hier
  const skPl = (n, one, few, many) => n + ' ' + (n === 1 ? one : n >= 2 && n <= 4 ? few : many);
  const skDraws = (d) => (d ? ' · ' + skPl(d, 'remíza', 'remízy', 'remíz') : '');
  const SK_TREAT = { carrot: ['mrkva', 'mrkvu'], nut: ['oriešok', 'oriešok'], berry: ['bobuľka', 'bobuľku'], star: ['hviezdička', 'hviezdičku'] };

  const sk = {
    'doc.title': 'Šachový les',
    'meta.desc': 'Šachový les: prvý krok k veľkému šachu pre deti od 2 rokov.',
    'lang.label': 'Jazyk',
    'about': 'O metodike',

    'intro.title': 'ŠACHOVÝ LES',
    'intro.subtitle': 'Prvý krok k veľkému šachu pre deti od 2 rokov',
    'intro.lead': 'Nie je to len rozprávková hra, ale autorské predšachové tréningové ihrisko. Zložité abstraktné figúrky sme nahradili zrozumiteľnými lesnými obyvateľmi, aby sme jemne pripravili mozog dieťaťa na skutočný šach.',
    'intro.h': 'Čo hra rozvíja:',
    'intro.p1.html': '<b>Názorno-obrazné myslenie:</b> Každé zvieratko opakuje dráhu skutočnej šachovej figúrky:',
    'pair': (a, p) => '<b>' + SK_SHEET[a] + '</b> — ' + SK_PIECE[p],
    'intro.p2.html': '<b>Pochopenie geometrie šachovnice:</b> Dieťa sa učí vidieť priame línie, uhlopriečky a bezpečné políčka bez nudného biflovania.',
    'intro.p3.html': '<b>Stratégiu a logiku:</b> Polia 5×5 a 6×6 trénujú sústredenie, schopnosť premyslieť si kroky dopredu a chrániť svoje figúrky.',
    'intro.maps': 'S najmenšími sa hrajte na Mape 1 a s deťmi od 4 rokov dobývajte taktickú Mapu 2!',
    'intro.go': 'PREJSŤ DO HRY',
    'intro.skip': 'Pri vstupe už nezobrazovať',
    'intro.sheet': 'Zvieratko = šachová figúrka',
    'sheetItem': (a, p) => SK_SHEET[a] + ' = ' + SK_PIECE[p],
    'sheetHint': (a) => SK_HINT[a],

    'menu.subtitle': 'Lesná hra pre malých šachistov',
    'menu.two': 'Hrať vo dvojici',
    'menu.cpu': 'Hrať s počítačom',
    'menu.level': 'Počítač:',
    'menu.easy': 'Dobrý',
    'menu.smart': 'Prefíkaný',
    'menu.timer': 'Časovač:',
    'menu.timer0': 'Bez časovača',
    'menu.timer30': '30 sekúnd',
    'menu.timer15': '15 sekúnd',
    'menu.timer30s': '30 sekúnd',
    'menu.timer15s': '15 sekúnd',
    'menu.timerNote0': 'pre najmenších od 2 do 3 rokov',
    'menu.timerNote30': 'pre deti od 4 do 6 rokov',
    'menu.timerNote15': 'Blesková hra pre staršie deti a dospelých',
    'menu.rules': 'Pravidlá',
    'menu.map': 'Mapa',
    'menu.school': 'Tréning: Učíme sa chodiť',
    'score.cpu': (lvl, s) => (lvl === 'easy' ? 'Dobrý' : 'Prefíkaný') + ': ' + skPl(s.w + s.l + s.d, 'hra', 'hry', 'hier') +
      ' · ' + skPl(s.w, 'výhra', 'výhry', 'výhier') + ' · ' + skPl(s.l, 'prehra', 'prehry', 'prehier') + skDraws(s.d),
    'score.two': (s) => 'Vo dvojici: ' + skPl(s.red + s.blue + s.d, 'hra', 'hry', 'hier') + ' · Červení ' + s.red + ' · Modrí ' + s.blue + skDraws(s.d),
    'score.reset': 'Vynulovať skóre',
    'score.ask': 'Vynulovať celé skóre?',
    'score.yes': 'Áno, vynulovať',
    'score.no': 'Nie',
    'map.1': 'Slnečná čistinka',
    'map.1.age': '2–4 roky',
    'map.2': 'Hlboký les',
    'map.2.age': '4+ roky',

    'game.menu': 'Menu',
    'team.red': 'Červení',
    'team.blue': 'Modrí',
    'team.turn': 'ťahajú',
    'den.red': 'Domček červených',
    'den.blue': 'Domček modrých',
    'die': 'Hodiť kockou',
    'done': 'Ukončiť ťah',
    'who.you': '(ty)',
    'who.cpu': '(počítač)',
    'sound.on': 'Zvuk zapnutý',
    'sound.off': 'Zvuk vypnutý',

    'quit.title': 'Ukončiť hru?',
    'quit.text': 'Zvieratká sa vrátia na svoje miesta.',
    'quit.no': 'Hrať ďalej',
    'quit.yes': 'Do menu',
    'win.again': 'Hrať znova',
    'win.menu': 'Do menu',

    'rules.title': 'Ako hrať',
    'rules.close': 'Rozumiem',
    'rules.h.win': 'Ako vyhrať',
    'rules.lion.html': '<b>Kráľovské objímanie.</b> Chyť súperovho Leva svojím Levom.',
    'rules.hare.html': '<b>Zajačí triumf.</b> Doveď svojho Zajačika na druhý koniec lesa.',
    'rules.h.die': 'Kocka',
    'rules.die': 'Tímy sa striedajú. Hoď kockou a urob to, čo padlo.',
    'rules.carrot.html': '<b>Mrkva.</b> Tvoj Zajačik skočí k najbližšej mrkve a papá. Kým súper robí svoj ťah, Zajačika nemožno chytiť.',
    'rules.tree.html': '<b>Strom.</b> Tvoja Veverička vyskočí na najbližší strom a dostane oriešok. Kým súper robí svoj ťah, nikto ju nedostane.',
    'rules.stars.html': '<b>Hviezdičky.</b> Koľko hviezdičiek, toľko krokov. Kroky môžeš dať jednému zvieratku alebo ich rozdeliť medzi viaceré. Ťah môžeš ukončiť aj skôr.',
    'rules.empty.html': '<b>Prázdna stena.</b> Zvieratká si išli oddýchnuť, ťah sa vynecháva.',
    'rules.timer': 'Časovač (ak je zapnutý): na ťah máš 30 alebo 15 sekúnd. Ak to nestihneš, ťah prechádza na súpera.',
    'rules.h.moves': 'Ako chodia zvieratká',
    'rules.oneStep': 'Jeden krok každého zvieratka:',
    'rules.m.lion.html': '<b>Lev</b> prejde o jedno políčko ľubovoľným smerom. Chytí akékoľvek súperovo zvieratko.',
    'rules.m.hare.html': '<b>Zajačik</b> prejde o jedno políčko, iba dopredu. Nikoho nechytá.',
    'rules.m.squirrel.html': '<b>Veverička</b> skáče do tvaru písmena „L“ ako šachový jazdec: dve políčka rovno a jedno nabok. Preskakuje zvieratká. Nikoho nechytá.',
    'rules.m.fox.html': '<b>Líška</b> prejde o jedno políčko šikmo. Chytá Zajačika a Veveričku.',
    'rules.m.lynx.html': '<b>Rys</b> prejde o jedno políčko rovno: dopredu, dozadu alebo nabok. Chytá Zajačika a Veveričku. Iba Rys môže chytiť Veveričku na strome.',
    'rules.h.hunt': 'Lesný lov',
    'rules.hunt1': 'Zvieratko chytíš tak, že stúpiš na jeho políčko. Chytené zvieratko ide oddychovať do domčeka.',
    'rules.hunt2': 'Keď chytíš zvieratko, ťah sa končí.',
    'rules.hunt3': 'Preskakovať iné zvieratká vie iba Veverička.',
    'rules.hunt4': 'Súperovho Leva môže chytiť iba Lev.',
    'rules.map1': 'Mapa 1: „Slnečná čistinka“ (2–4 roky)',
    'rules.map2': 'Mapa 2: „Hlboký les“ (Úroveň 4+ roky)',
    'rules.draw.html': '<b>Remíza.</b> Ak na poli zostali iba dva Levy, hra končí remízou.',
    'rules.carrottree.html': '<b>Mrkva alebo Strom:</b> vyberte si sami — Zajačika na Mrkvu alebo Veveričku na Strom.',
    'rules.trapface.html': '<b>Pasca:</b> do pasce sa chytí to vaše zvieratko, ktoré je najbližšie k voľnej pasci (okrem Leva). Ak je takých viac, vyberáte vy.',
    'rules.bonusNote': 'Kým súper robí svoj ťah, Zajačika na mrkve ani Veveričku s orieškom nemožno chytiť.',
    'rules.walkIn': 'Ak Zajačik sám dôjde k mrkve alebo Veverička sama doskočí na strom, tiež papajú: kým súper robí svoj ťah, nemožno ich chytiť. V tomto ťahu sa už nepohnú.',
    'rules.m.lynx2.html': '<b>Rys</b> prejde o jedno políčko rovno: dopredu, dozadu alebo nabok. Chytá Zajačika a Veveričku.',
    'rules.m.panther.html': '<b>Panter (= Dáma):</b> Najrýchlejší predátor. Chodí všetkými smermi (rovno aj šikmo) o 1, 2 alebo 3 polia. Vie liezť na Strom za Veveričkou.',
    'rules.trap.html': '<b>Pasca:</b> Nebezpečné pole. Ak naň zvieratko stúpi, vynechá 2 ťahy (Lev je príliš múdry a do pasce nestúpi, Veverička ju dokáže preskočiť). Ak chcete kamaráta zachrániť skôr, príďte s akýmkoľvek svojím zvieratkom na susedné pole.',
    'rules.run': 'Panter minie na každé políčko jednu hviezdičku a počas jedného ťahu beží iba po jednej priamke, bez zatáčania.',
    'rules.h.cells': 'Zvláštne políčka',
    'rules.hunt5': 'Veveričku na strome (bez orieška) môžu chytiť iba Rys a Panter.',
    'rules.hunt6': 'Aj zvieratko v pasci sa dá chytiť, ale lovec sa potom sám chytí do pasce.',
    'rules.hunt7': 'Líšku, Rysa a Pantera môže chytiť iba Lev.',

    'label': (team, kind) => {
      const fem = SK_ANIMAL[kind].fem;
      const colour = team === 'red' ? (fem ? 'Červená' : 'Červený') : (fem ? 'Modrá' : 'Modrý');
      return colour + ' ' + SK_ANIMAL[kind].nom;
    },
    'pieceTrapped': 'v pasci',
    'cell': (name, type) => 'Políčko ' + name + (skCell[type] || ''),
    'turnCpu': 'Ťahá počítač…',
    'turnYou': 'Si na ťahu. Hoď kockou!',
    'turnTeam': (team) => 'Ťahajú ' + (team === 'red' ? 'červení' : 'modrí') + '. Hoď kockou!',
    'rest': 'Ojoj, zvieratká si išli oddýchnuť! Ťah sa vynecháva.',
    'noBonus': (kind, reason) => {
      if (kind === 'carrottree') return 'Mrkva alebo Strom! Ale ani Zajačik, ani Veverička teraz nemôžu skočiť. Ťah sa vynecháva.';
      if (kind === 'hare') {
        return reason === 'caught'
          ? 'Mrkva! Ale Zajačik už oddychuje v domčeku. Ťah sa vynecháva.'
          : 'Mrkva! Ale Zajačik sa k nej nedostane. Ťah sa vynecháva.';
      }
      if (reason === 'trapped') return 'Strom! Ale Veverička je v pasci. Ťah sa vynecháva.';
      return reason === 'caught'
        ? 'Strom! Ale Veverička už oddychuje v domčeku. Ťah sa vynecháva.'
        : 'Strom! Ale oba stromy sú obsadené. Ťah sa vynecháva.';
    },
    'noMoves': (n) => skStars(n) + ', ale nie je kam ísť. Ťah sa vynecháva.',
    'chooseCarrot': 'Mrkva! Vyber, ku ktorej mrkve skočí Zajačik.',
    'chooseTree': 'Strom! Vyber, na ktorý strom vyskočí Veverička.',
    'chooseCarrotTree': 'Mrkva alebo Strom! Kto skočí? Ťukni na Zajačika alebo na Veveričku.',
    'rolledCpu': (n) => skStars(n) + '. Počítač ťahá…',
    'rolledYou': (n) => skStars(n) + '. Vyber zvieratko a urob ' + skSteps(n) + '.',
    'bonusHare': 'Mrkva! Zajačik papá a nikto ho nemôže chytiť.',
    'bonusSquirrel': 'Strom! Veverička hryzie oriešok a nikto ju nedostane.',
    'trapFace': (k) => {
      const a = SK_ANIMAL[k];
      return 'Pasca! ' + a.nom + (a.fem ? ' bola najbližšie a chytila sa' : ' bol najbližšie a chytil sa') + ': vynechá 2 ťahy.';
    },
    'trapFaceAgain': (k) => {
      const a = SK_ANIMAL[k];
      return 'Pasca! ' + a.nom + (a.fem ? ' ešte stála v pasci a znova sa chytila' : ' ešte stál v pasci a znova sa chytil') + ': vynechá 2 ťahy.';
    },
    'trapChooseAnimal': 'Pasca! Viac zvieratiek je rovnako blízko. Vyber, ktoré sa chytí do pasce.',
    'trapChooseCell': (k) => 'Pasca! Vyber, do ktorej pasce sa chytí ' + SK_ANIMAL[k].nom + '.',
    'trapNone': 'Pasca! Ale do pasce sa nemá kto chytiť. Ťah sa vynecháva.',
    'inTrap': (k) => {
      const a = SK_ANIMAL[k];
      return a.nom + (a.fem ? ' sa chytila' : ' sa chytil') + ' do pasce a vynechá 2 ťahy. Zachráň ' + (a.fem ? 'ju' : 'ho') +
        ': príď k ' + (a.fem ? 'nej' : 'nemu') + ' iným zvieratkom!';
    },
    'freed': (kinds, left) => 'Hurá! ' + kinds.map((k) => SK_ANIMAL[k].nom).join(' a ') + (kinds.length > 1 ? ' sú' : ' je') + ' z pasce von!' + (left ? ' ' + skLeft(left) : ''),
    'trappedTap': (k, n) => {
      const a = SK_ANIMAL[k];
      return a.nom + ' je v pasci' + (n === 1 ? ' (posledný ťah).' : ' (ešte ' + n + ' ťahy).') +
        ' Ak ' + (a.fem ? 'ju' : 'ho') + ' chceš zachrániť, príď k ' + (a.fem ? 'nej' : 'nemu') + ' iným zvieratkom.';
    },
    'catch': (hunter, prey) => {
      const h = SK_ANIMAL[hunter];
      const p = SK_ANIMAL[prey];
      if (prey === 'lion') return h.nom + (h.fem ? ' chytila' : ' chytil') + ' Leva!';
      return h.nom + (h.fem ? ' chytila ' : ' chytil ') + p.acc + '! ' + p.nom + (p.fem ? ' išla' : ' išiel') + ' oddychovať do domčeka.';
    },
    'hareHome': 'Zajačik dobehol na koniec lesa!',
    'stuck': 'Už nie je kam ísť.',
    'left': skLeft,
    'timeUp': 'Čas vypršal! Ťah prechádza na súpera.',
    'timerLeft': (n) => 'Zostáva sekúnd: ' + n,
    'winLionTitle': 'Lev je chytený!',
    'winHareTitle': 'Zajačí triumf!',
    'winLionText': 'Kráľovské objímanie! Všetky zvieratká sa objímajú.',
    'winHareText': 'Zajačik prebehol celý les a zachránil sa!',
    'winTeam': (team) => (team === 'red' ? 'Vyhrali červení!' : 'Vyhrali modrí!'),
    'winCpu': 'Vyhral počítač. Nabudúce to vyjde!',
    'winYou': 'Vyhral si!',
    'winDrawTitle': 'Remíza!',
    'winDrawText': 'Levy sa spriatelili — vyhralo priateľstvo.',
    'ate': (k, left) => (k === 'hare'
      ? 'Zajačik došiel k mrkve! Papá a nikto ho nemôže chytiť.'
      : 'Veverička vyskočila na strom! Hryzie oriešok a nikto ju nedostane.') + (left ? ' ' + skLeft(left) : ''),

    'school.title': 'Lesná škola',
    'school.back': 'Späť',
    'school.pupils': 'Koho učíme',
    'school.name': (k) => SK_SHEET[k],
    'school.pupil': (k, done) => SK_SHEET[k] + (done ? ', naučené' : ''),
    'school.pick': 'Koho budeme učiť? Ťukni na zvieratko dole.',
    'school.tap': (k) => 'Ťukni na ' + SK_ANIMAL[k].acc + '!',
    'school.go': (tr) => 'Vidíš stopy? Ťukni na ' + SK_TREAT[tr][1] + '!',
    'school.first': (k) => 'Najprv ťukni na ' + SK_ANIMAL[k].acc + '.',
    'school.wrong': (tr) => 'Nie sem! ' + SK_TREAT[tr][0].charAt(0).toUpperCase() + SK_TREAT[tr][0].slice(1) + ' je tamto.',
    'school.cannot': (k) => 'Tak ' + SK_ANIMAL[k].nom + (k === 'squirrel' ? ' neskáče' : ' nechodí') + '. Choď po stopách!',
    'school.yum': (n) => 'Výborne! ' + (n === 1 ? 'Ešte jedna maškrta.' : 'Ešte ' + n + ' maškrty.'),
    'school.done': (k) => 'Hurá! ' + SK_ANIMAL[k].nom + (SK_ANIMAL[k].fem ? ' sa naučila' : ' sa naučil') + ' chodiť! Vyber si ďalšie zvieratko.',
    'school.crunch': 'Chrum!',
    'school.cell': (name, tr) => 'Políčko ' + name + (tr ? ', ' + SK_TREAT[tr][0] : ''),
    'school.progress': (n, total) => 'Zjedené ' + n + ' z ' + total
  };

  /* ---------------- English ---------------- */
  const EN_ANIMAL = { hare: 'Bunny', fox: 'Fox', lion: 'Lion', lynx: 'Lynx', squirrel: 'Squirrel', panther: 'Panther' };
  const EN_SHEET = { lion: 'Lion', hare: 'Bunny', squirrel: 'Squirrel', fox: 'Fox', lynx: 'Lynx', panther: 'Panther' };
  const EN_PIECE = { king: 'King', pawn: 'Pawn', knight: 'Knight', bishop: 'Bishop', rook: 'Rook', queen: 'Queen' };
  const EN_HINT = {
    lion: 'moves 1 square in any direction', hare: 'runs forward only', squirrel: 'jumps in an “L” over animals',
    fox: 'moves diagonally', lynx: 'moves straight: forward, back and sideways',
    panther: 'runs straight in any direction, 1–3 squares'
  };
  const enStars = (n) => (n === 1 ? '1 star' : n + ' stars');
  const enSteps = (n) => (n === 1 ? '1 step' : n + ' steps');
  const enLeft = (n) => enSteps(n) + ' left.';
  const enCell = { carrot: ', carrot', tree: ', tree', trap: ', trap' };
  const enPl = (n, one, many) => n + ' ' + (n === 1 ? one : many);
  const enDraws = (d) => (d ? ' · ' + enPl(d, 'draw', 'draws') : '');

  const en = {
    'doc.title': 'Chess Forest',
    'meta.desc': 'Chess Forest: the first step towards real chess, for children from 2 years old.',
    'lang.label': 'Language',
    'about': 'About the method',

    'intro.title': 'CHESS FOREST',
    'intro.subtitle': 'The first step towards real chess, for children from 2 years old',
    'intro.lead': 'This is not just a fairy-tale game, but an original pre-chess training ground. We have replaced complex abstract pieces with friendly forest animals to gently prepare a child’s brain for real chess.',
    'intro.h': 'What the game develops:',
    'intro.p1.html': '<b>Visual thinking:</b> Every animal follows the path of a real chess piece:',
    'pair': (a, p) => '<b>' + EN_SHEET[a] + '</b> — ' + EN_PIECE[p],
    'intro.p2.html': '<b>Understanding the board:</b> The child learns to see straight lines, diagonals and safe squares without boring memorisation.',
    'intro.p3.html': '<b>Strategy and logic:</b> The 5×5 and 6×6 boards train concentration, thinking steps ahead and protecting your own pieces.',
    'intro.maps': 'Play Map 1 with toddlers, and take on the tactical Map 2 with children aged 4 and older!',
    'intro.go': 'GO TO THE GAME',
    'intro.skip': 'Don’t show this at start again',
    'intro.sheet': 'Animal = chess piece',
    'sheetItem': (a, p) => EN_SHEET[a] + ' = ' + EN_PIECE[p],
    'sheetHint': (a) => EN_HINT[a],

    'menu.subtitle': 'A forest game for little chess players',
    'menu.two': 'Play together',
    'menu.cpu': 'Play with the computer',
    'menu.level': 'Computer:',
    'menu.easy': 'Kind',
    'menu.smart': 'Clever',
    'menu.timer': 'Timer:',
    'menu.timer0': 'No Timer',
    'menu.timer30': '30 sec',
    'menu.timer15': '15 sec',
    'menu.timer30s': '30 sec',
    'menu.timer15s': '15 sec',
    'menu.timerNote0': 'for little ones aged 2–3',
    'menu.timerNote30': 'for children aged 4–6',
    'menu.timerNote15': 'Blitz for older children and adults',
    'menu.rules': 'Rules',
    'menu.map': 'Map',
    'menu.school': 'Trainer: Learn the Moves',
    'score.cpu': (lvl, s) => (lvl === 'easy' ? 'Kind' : 'Clever') + ': ' + enPl(s.w + s.l + s.d, 'game', 'games') +
      ' · ' + enPl(s.w, 'win', 'wins') + ' · ' + enPl(s.l, 'loss', 'losses') + enDraws(s.d),
    'score.two': (s) => 'Together: ' + enPl(s.red + s.blue + s.d, 'game', 'games') + ' · Red ' + s.red + ' · Blue ' + s.blue + enDraws(s.d),
    'score.reset': 'Reset score',
    'score.ask': 'Reset the whole score?',
    'score.yes': 'Yes, reset',
    'score.no': 'No',
    'map.1': 'Sunny Glade',
    'map.1.age': '2–4 yrs',
    'map.2': 'Deep Forest',
    'map.2.age': '4+ yrs',

    'game.menu': 'Menu',
    'team.red': 'Red',
    'team.blue': 'Blue',
    'team.turn': 'to move',
    'den.red': 'Red team’s den',
    'den.blue': 'Blue team’s den',
    'die': 'Roll the die',
    'done': 'End turn',
    'who.you': '(you)',
    'who.cpu': '(computer)',
    'sound.on': 'Sound on',
    'sound.off': 'Sound off',

    'quit.title': 'End the game?',
    'quit.text': 'The animals will go back to their places.',
    'quit.no': 'Keep playing',
    'quit.yes': 'To the menu',
    'win.again': 'Play again',
    'win.menu': 'To the menu',

    'rules.title': 'How to play',
    'rules.close': 'Got it',
    'rules.h.win': 'How to win',
    'rules.lion.html': '<b>Royal hugs.</b> Catch the other team’s Lion with your Lion.',
    'rules.hare.html': '<b>Bunny’s triumph.</b> Bring your Bunny to the far edge of the forest.',
    'rules.h.die': 'The die',
    'rules.die': 'The teams take turns. Roll the die and do what it shows.',
    'rules.carrot.html': '<b>Carrot.</b> Your Bunny jumps to the nearest carrot and eats. While the other team takes its turn, the Bunny can’t be caught.',
    'rules.tree.html': '<b>Tree.</b> Your Squirrel jumps onto the nearest tree and gets a nut. While the other team takes its turn, nobody can reach her.',
    'rules.stars.html': '<b>Stars.</b> As many stars, as many steps. Give all the steps to one animal or share them between several. You can end your turn early.',
    'rules.empty.html': '<b>Empty side.</b> The animals decided to rest; the turn is skipped.',
    'rules.timer': 'Timer (if switched on): you have 30 or 15 seconds for a turn. If time runs out, the turn passes to the other side.',
    'rules.h.moves': 'How the animals move',
    'rules.oneStep': 'One step of each animal:',
    'rules.m.lion.html': '<b>Lion</b> moves one square in any direction. Catches any animal of the other team.',
    'rules.m.hare.html': '<b>Bunny</b> moves one square, forward only. Catches nobody.',
    'rules.m.squirrel.html': '<b>Squirrel</b> jumps in an “L” like a chess knight: two squares straight and one to the side. Jumps over animals. Catches nobody.',
    'rules.m.fox.html': '<b>Fox</b> moves one square diagonally. Catches the Bunny and the Squirrel.',
    'rules.m.lynx.html': '<b>Lynx</b> moves one square straight: forward, back or sideways. Catches the Bunny and the Squirrel. Only the Lynx can catch a Squirrel on a tree.',
    'rules.h.hunt': 'Forest hunt',
    'rules.hunt1': 'To catch an animal, step onto its square. The caught animal goes to rest in the den.',
    'rules.hunt2': 'After a catch, the turn ends.',
    'rules.hunt3': 'Only the Squirrel can jump over other animals.',
    'rules.hunt4': 'Only a Lion can catch the other team’s Lion.',
    'rules.map1': 'Map 1: "Sunny Glade" (2–4 yrs)',
    'rules.map2': 'Map 2: "Deep Forest" (Level 4+ yrs)',
    'rules.draw.html': '<b>Draw.</b> If only the two Lions are left on the board, the game ends in a draw.',
    'rules.carrottree.html': '<b>Carrot or Tree:</b> you choose — send the Bunny to a Carrot or the Squirrel to a Tree.',
    'rules.trapface.html': '<b>Trap:</b> the one of your animals that is closest to a free trap falls into it (not the Lion). If several are equally close, you choose.',
    'rules.bonusNote': 'While the other side takes its turn, the Bunny on a carrot and the Squirrel with a nut can’t be caught.',
    'rules.walkIn': 'If the Bunny walks to a carrot or the Squirrel jumps onto a tree by itself, it eats too: while the other side takes its turn, it can’t be caught. It doesn’t move again this turn.',
    'rules.m.lynx2.html': '<b>Lynx</b> moves one square straight: forward, back or sideways. Catches the Bunny and the Squirrel.',
    'rules.m.panther.html': '<b>Panther (= Queen):</b> The fastest predator. Moves in all directions (straight and diagonally) by 1, 2, or 3 squares. Can climb the Tree to catch the Squirrel.',
    'rules.trap.html': '<b>Trap:</b> A dangerous square. Any animal stepping on it misses 2 turns (the Lion is too wise to step into a trap, and the Squirrel can jump over it). To rescue a trapped friend early, move any of your other animals to an adjacent square.',
    'rules.run': 'The Panther uses one star per square, and within one turn it runs along a single straight line without turning.',
    'rules.h.cells': 'Special squares',
    'rules.hunt5': 'A Squirrel on a tree (without a nut) can be caught only by the Lynx and the Panther.',
    'rules.hunt6': 'An animal in a trap can still be caught, but then the hunter is stuck in the trap itself.',
    'rules.hunt7': 'Only a Lion can catch the Fox, the Lynx and the Panther.',

    'label': (team, kind) => (team === 'red' ? 'Red ' : 'Blue ') + EN_ANIMAL[kind],
    'pieceTrapped': 'in a trap',
    'cell': (name, type) => 'Square ' + name + (enCell[type] || ''),
    'turnCpu': 'The computer is playing…',
    'turnYou': 'Your turn. Roll the die!',
    'turnTeam': (team) => (team === 'red' ? 'Red' : 'Blue') + ' team’s turn. Roll the die!',
    'rest': 'Oh, the animals decided to rest! The turn is skipped.',
    'noBonus': (kind, reason) => {
      if (kind === 'carrottree') return 'Carrot or Tree! But neither the Bunny nor the Squirrel can jump now. The turn is skipped.';
      if (kind === 'hare') {
        return reason === 'caught'
          ? 'Carrot! But the Bunny is already resting in the den. The turn is skipped.'
          : 'Carrot! But the Bunny can’t reach one. The turn is skipped.';
      }
      if (reason === 'trapped') return 'Tree! But the Squirrel is stuck in a trap. The turn is skipped.';
      return reason === 'caught'
        ? 'Tree! But the Squirrel is already resting in the den. The turn is skipped.'
        : 'Tree! But both trees are taken. The turn is skipped.';
    },
    'noMoves': (n) => 'Rolled ' + enStars(n) + ', but there is nowhere to go. The turn is skipped.',
    'chooseCarrot': 'Carrot! Choose which carrot the Bunny jumps to.',
    'chooseTree': 'Tree! Choose which tree the Squirrel jumps onto.',
    'chooseCarrotTree': 'Carrot or Tree! Who jumps? Tap the Bunny or the Squirrel.',
    'rolledCpu': (n) => 'Rolled ' + enStars(n) + '. The computer is moving…',
    'rolledYou': (n) => 'You rolled ' + enStars(n) + '. Pick an animal and make ' + enSteps(n) + '.',
    'bonusHare': 'Carrot! The Bunny is eating and can’t be caught.',
    'bonusSquirrel': 'Tree! The Squirrel is nibbling a nut and can’t be reached.',
    'trapFace': (k) => 'Trap! The ' + EN_ANIMAL[k] + ' was the closest and got caught: it misses 2 turns.',
    'trapFaceAgain': (k) => 'Trap! The ' + EN_ANIMAL[k] + ' was still standing in the trap and got caught again: it misses 2 turns.',
    'trapChooseAnimal': 'Trap! Several animals are equally close. Choose which one falls into the trap.',
    'trapChooseCell': (k) => 'Trap! Choose which trap the ' + EN_ANIMAL[k] + ' falls into.',
    'trapNone': 'Trap! But nobody can fall in. The turn is skipped.',
    'inTrap': (k) => 'The ' + EN_ANIMAL[k] + ' is caught in a trap and misses 2 turns. Rescue it: move another animal next to it!',
    'freed': (kinds, left) => 'Hooray! The ' + kinds.map((k) => EN_ANIMAL[k]).join(' and the ') + (kinds.length > 1 ? ' are' : ' is') + ' free!' + (left ? ' ' + enLeft(left) : ''),
    'trappedTap': (k, n) => 'The ' + EN_ANIMAL[k] + ' is in a trap' + (n === 1 ? ' (last turn).' : ' (' + n + ' more turns).') + ' To rescue it, move another animal next to it.',
    'catch': (hunter, prey) => {
      if (prey === 'lion') return 'The ' + EN_ANIMAL[hunter] + ' caught the Lion!';
      return 'The ' + EN_ANIMAL[hunter] + ' caught the ' + EN_ANIMAL[prey] + '! The ' + EN_ANIMAL[prey] + ' went to rest in the den.';
    },
    'hareHome': 'The Bunny reached the edge of the forest!',
    'stuck': 'No more moves.',
    'left': enLeft,
    'timeUp': 'Time’s up! The turn passes to the other side.',
    'timerLeft': (n) => (n === 1 ? '1 second left' : n + ' seconds left'),
    'winLionTitle': 'The Lion is caught!',
    'winHareTitle': 'Bunny’s triumph!',
    'winLionText': 'Royal hugs! All the animals hug each other.',
    'winHareText': 'The Bunny ran through the whole forest and escaped!',
    'winTeam': (team) => (team === 'red' ? 'The Red team wins!' : 'The Blue team wins!'),
    'winCpu': 'The computer won. You’ll do it next time!',
    'winYou': 'You won!',
    'winDrawTitle': 'A draw!',
    'winDrawText': 'The Lions made friends — friendship wins.',
    'ate': (k, left) => (k === 'hare'
      ? 'The Bunny reached a carrot! It’s eating and can’t be caught.'
      : 'The Squirrel jumped onto a tree! It’s nibbling a nut and can’t be reached.') + (left ? ' ' + enLeft(left) : ''),

    'school.title': 'Forest School',
    'school.back': 'Back',
    'school.pupils': 'Who learns',
    'school.name': (k) => EN_SHEET[k],
    'school.pupil': (k, done) => EN_SHEET[k] + (done ? ', learned' : ''),
    'school.pick': 'Who will learn today? Tap an animal below.',
    'school.tap': (k) => 'Tap the ' + EN_ANIMAL[k] + '!',
    'school.go': (tr) => 'See the paw prints? Tap the ' + tr + '!',
    'school.first': (k) => 'First tap the ' + EN_ANIMAL[k] + '.',
    'school.wrong': (tr) => 'Not here! The ' + tr + ' is over there.',
    'school.cannot': (k) => 'The ' + EN_ANIMAL[k] + (k === 'squirrel' ? ' can’t jump there' : ' can’t go there') + '. Follow the paw prints!',
    'school.yum': (n) => 'Well done! ' + (n === 1 ? 'One more treat.' : n + ' more treats.'),
    'school.done': (k) => 'Hooray! The ' + EN_ANIMAL[k] + ' has learned to move! Pick the next animal.',
    'school.crunch': 'Crunch!',
    'school.cell': (name, tr) => 'Square ' + name + (tr ? ', ' + tr : ''),
    'school.progress': (n, total) => n + ' of ' + total + ' eaten'
  };

  /* First visit: follow the phone's main language; anything other than RU / SK / CS / EN starts in Russian. */
  function detect() {
    const first = String((navigator.languages && navigator.languages[0]) || navigator.language || '').toLowerCase();
    const code = first.slice(0, 2);
    if (code === 'sk' || code === 'cs') return 'sk';
    if (code === 'en') return 'en';
    return 'ru';
  }

  root.ForestI18n = { langs: { ru, sk, en }, codes: ['ru', 'sk', 'en'], detect };
})(typeof window !== 'undefined' ? window : globalThis);
