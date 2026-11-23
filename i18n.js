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
    squirrel: { nom: 'Белочка', acc: 'Белочку', fem: true }
  };
  const RU_SHEET = { lion: 'Лев', hare: 'Заяц', squirrel: 'Белка', fox: 'Лиса', lynx: 'Рысь', panther: 'Пантера' };
  const RU_PIECE = { king: 'Король', pawn: 'Пешка', knight: 'Конь', bishop: 'Слон', rook: 'Ладья', queen: 'Ферзь' };
  // Tap hint under the cheat sheet: how the animal moves.
  const RU_HINT = {
    lion: 'ходит на 1 клетку в любую сторону', hare: 'бежит только вперёд', squirrel: 'прыгает буквой «Г» через зверей',
    fox: 'ходит наискосок', lynx: 'ходит прямо: вперёд, назад и вбок', panther: 'ходит и прямо, и наискосок'
  };
  const ruStars = (n) => (n === 1 ? 'Выпала 1 звёздочка' : 'Выпало ' + n + ' звёздочки');
  const ruSteps = (n) => (n === 1 ? '1 шаг' : n + ' шага');

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
    'intro.p3.html': '<b>Стратегию и логику:</b> Поле 5×5 тренирует концентрацию внимания, умение просчитывать шаги вперёд и защищать свои фигуры.',
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

    'label': (team, kind) => {
      const fem = RU_ANIMAL[kind].fem;
      const colour = team === 'red' ? (fem ? 'Красная' : 'Красный') : (fem ? 'Синяя' : 'Синий');
      return colour + ' ' + RU_ANIMAL[kind].nom;
    },
    'cell': (name, type) => 'Клетка ' + name + (type === 'carrot' ? ', морковка' : type === 'tree' ? ', дерево' : ''),
    'turnCpu': 'Ходит компьютер…',
    'turnYou': 'Твой ход. Брось кубик!',
    'turnTeam': (team) => 'Ход ' + (team === 'red' ? 'красных' : 'синих') + '. Брось кубик!',
    'rest': 'Ой, звери решили отдохнуть! Ход пропускается.',
    'noBonus': (kind, reason) => {
      if (kind === 'hare') {
        return reason === 'caught'
          ? 'Морковка! Но Зайчик уже отдыхает в домике. Ход пропускается.'
          : 'Морковка! Но Зайчику до неё не добраться. Ход пропускается.';
      }
      return reason === 'caught'
        ? 'Дерево! Но Белочка уже отдыхает в домике. Ход пропускается.'
        : 'Дерево! Но оба дерева заняты. Ход пропускается.';
    },
    'noMoves': (n) => ruStars(n) + ', но ходить некуда. Ход пропускается.',
    'chooseCarrot': 'Морковка! Выбери, к какой морковке прыгнет Зайчик.',
    'chooseTree': 'Дерево! Выбери, на какое дерево прыгнет Белочка.',
    'rolledCpu': (n) => ruStars(n) + '. Компьютер ходит…',
    'rolledYou': (n) => ruStars(n) + '. Выбери зверя и сделай ' + ruSteps(n) + '.',
    'bonusHare': 'Морковка! Зайчик кушает, и его нельзя поймать.',
    'bonusSquirrel': 'Дерево! Белочка грызёт орешек, и её не достать.',
    'catch': (hunter, prey) => {
      const h = RU_ANIMAL[hunter];
      const p = RU_ANIMAL[prey];
      if (prey === 'lion') return h.nom + (h.fem ? ' поймала' : ' поймал') + ' Льва!';
      return h.nom + (h.fem ? ' поймала ' : ' поймал ') + p.acc + '! ' + p.nom + (p.fem ? ' ушла' : ' ушёл') + ' отдыхать в домик.';
    },
    'hareHome': 'Зайчик добежал до края леса!',
    'stuck': 'Больше ходить некуда.',
    'left': (n) => (n === 1 ? 'Остался ' : 'Осталось ') + ruSteps(n) + '.',
    'timeUp': 'Время вышло! Ход переходит к сопернику.',
    'timerLeft': (n) => 'Осталось секунд: ' + n,
    'winLionTitle': 'Лев пойман!',
    'winHareTitle': 'Заячий триумф!',
    'winLionText': 'Царские обнимашки! Все звери обнимаются.',
    'winHareText': 'Зайчик пробежал весь лес и спасся!',
    'winTeam': (team) => (team === 'red' ? 'Победили красные!' : 'Победили синие!'),
    'winCpu': 'Победил компьютер. В следующий раз получится!',
    'winYou': 'Ты победил!'
  };

  /* ---------------- Slovenčina ---------------- */
  const SK_ANIMAL = {
    hare: { nom: 'Zajačik', acc: 'Zajačika', fem: false },
    fox: { nom: 'Líška', acc: 'Líšku', fem: true },
    lion: { nom: 'Lev', acc: 'Leva', fem: false },
    lynx: { nom: 'Rys', acc: 'Rysa', fem: false },
    squirrel: { nom: 'Veverička', acc: 'Veveričku', fem: true }
  };
  const SK_SHEET = { lion: 'Lev', hare: 'Zajac', squirrel: 'Veverička', fox: 'Líška', lynx: 'Rys', panther: 'Panter' };
  const SK_PIECE = { king: 'Kráľ', pawn: 'Pešiak', knight: 'Jazdec', bishop: 'Strelec', rook: 'Veža', queen: 'Dáma' };
  const SK_HINT = {
    lion: 'chodí o 1 políčko ľubovoľným smerom', hare: 'beží iba dopredu', squirrel: 'skáče do tvaru „L“ ponad zvieratká',
    fox: 'chodí šikmo', lynx: 'chodí rovno: dopredu, dozadu a nabok', panther: 'chodí rovno aj šikmo'
  };
  const skStars = (n) => (n === 1 ? 'Padla 1 hviezdička' : 'Padli ' + n + ' hviezdičky');
  const skSteps = (n) => (n === 1 ? '1 krok' : n + ' kroky');

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
    'intro.p3.html': '<b>Stratégiu a logiku:</b> Pole 5×5 trénuje sústredenie, schopnosť premyslieť si kroky dopredu a chrániť svoje figúrky.',
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

    'label': (team, kind) => {
      const fem = SK_ANIMAL[kind].fem;
      const colour = team === 'red' ? (fem ? 'Červená' : 'Červený') : (fem ? 'Modrá' : 'Modrý');
      return colour + ' ' + SK_ANIMAL[kind].nom;
    },
    'cell': (name, type) => 'Políčko ' + name + (type === 'carrot' ? ', mrkva' : type === 'tree' ? ', strom' : ''),
    'turnCpu': 'Ťahá počítač…',
    'turnYou': 'Si na ťahu. Hoď kockou!',
    'turnTeam': (team) => 'Ťahajú ' + (team === 'red' ? 'červení' : 'modrí') + '. Hoď kockou!',
    'rest': 'Ojoj, zvieratká si išli oddýchnuť! Ťah sa vynecháva.',
    'noBonus': (kind, reason) => {
      if (kind === 'hare') {
        return reason === 'caught'
          ? 'Mrkva! Ale Zajačik už oddychuje v domčeku. Ťah sa vynecháva.'
          : 'Mrkva! Ale Zajačik sa k nej nedostane. Ťah sa vynecháva.';
      }
      return reason === 'caught'
        ? 'Strom! Ale Veverička už oddychuje v domčeku. Ťah sa vynecháva.'
        : 'Strom! Ale oba stromy sú obsadené. Ťah sa vynecháva.';
    },
    'noMoves': (n) => skStars(n) + ', ale nie je kam ísť. Ťah sa vynecháva.',
    'chooseCarrot': 'Mrkva! Vyber, ku ktorej mrkve skočí Zajačik.',
    'chooseTree': 'Strom! Vyber, na ktorý strom vyskočí Veverička.',
    'rolledCpu': (n) => skStars(n) + '. Počítač ťahá…',
    'rolledYou': (n) => skStars(n) + '. Vyber zvieratko a urob ' + skSteps(n) + '.',
    'bonusHare': 'Mrkva! Zajačik papá a nikto ho nemôže chytiť.',
    'bonusSquirrel': 'Strom! Veverička hryzie oriešok a nikto ju nedostane.',
    'catch': (hunter, prey) => {
      const h = SK_ANIMAL[hunter];
      const p = SK_ANIMAL[prey];
      if (prey === 'lion') return h.nom + (h.fem ? ' chytila' : ' chytil') + ' Leva!';
      return h.nom + (h.fem ? ' chytila ' : ' chytil ') + p.acc + '! ' + p.nom + (p.fem ? ' išla' : ' išiel') + ' oddychovať do domčeka.';
    },
    'hareHome': 'Zajačik dobehol na koniec lesa!',
    'stuck': 'Už nie je kam ísť.',
    'left': (n) => (n === 1 ? 'Zostal 1 krok.' : 'Zostali ' + n + ' kroky.'),
    'timeUp': 'Čas vypršal! Ťah prechádza na súpera.',
    'timerLeft': (n) => 'Zostáva sekúnd: ' + n,
    'winLionTitle': 'Lev je chytený!',
    'winHareTitle': 'Zajačí triumf!',
    'winLionText': 'Kráľovské objímanie! Všetky zvieratká sa objímajú.',
    'winHareText': 'Zajačik prebehol celý les a zachránil sa!',
    'winTeam': (team) => (team === 'red' ? 'Vyhrali červení!' : 'Vyhrali modrí!'),
    'winCpu': 'Vyhral počítač. Nabudúce to vyjde!',
    'winYou': 'Vyhral si!'
  };

  /* ---------------- English ---------------- */
  const EN_ANIMAL = { hare: 'Bunny', fox: 'Fox', lion: 'Lion', lynx: 'Lynx', squirrel: 'Squirrel' };
  const EN_SHEET = { lion: 'Lion', hare: 'Bunny', squirrel: 'Squirrel', fox: 'Fox', lynx: 'Lynx', panther: 'Panther' };
  const EN_PIECE = { king: 'King', pawn: 'Pawn', knight: 'Knight', bishop: 'Bishop', rook: 'Rook', queen: 'Queen' };
  const EN_HINT = {
    lion: 'moves 1 square in any direction', hare: 'runs forward only', squirrel: 'jumps in an “L” over animals',
    fox: 'moves diagonally', lynx: 'moves straight: forward, back and sideways', panther: 'moves straight and diagonally'
  };
  const enStars = (n) => (n === 1 ? '1 star' : n + ' stars');
  const enSteps = (n) => (n === 1 ? '1 step' : n + ' steps');

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
    'intro.p3.html': '<b>Strategy and logic:</b> The 5×5 board trains concentration, thinking steps ahead and protecting your own pieces.',
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

    'label': (team, kind) => (team === 'red' ? 'Red ' : 'Blue ') + EN_ANIMAL[kind],
    'cell': (name, type) => 'Square ' + name + (type === 'carrot' ? ', carrot' : type === 'tree' ? ', tree' : ''),
    'turnCpu': 'The computer is playing…',
    'turnYou': 'Your turn. Roll the die!',
    'turnTeam': (team) => (team === 'red' ? 'Red' : 'Blue') + ' team’s turn. Roll the die!',
    'rest': 'Oh, the animals decided to rest! The turn is skipped.',
    'noBonus': (kind, reason) => {
      if (kind === 'hare') {
        return reason === 'caught'
          ? 'Carrot! But the Bunny is already resting in the den. The turn is skipped.'
          : 'Carrot! But the Bunny can’t reach one. The turn is skipped.';
      }
      return reason === 'caught'
        ? 'Tree! But the Squirrel is already resting in the den. The turn is skipped.'
        : 'Tree! But both trees are taken. The turn is skipped.';
    },
    'noMoves': (n) => 'Rolled ' + enStars(n) + ', but there is nowhere to go. The turn is skipped.',
    'chooseCarrot': 'Carrot! Choose which carrot the Bunny jumps to.',
    'chooseTree': 'Tree! Choose which tree the Squirrel jumps onto.',
    'rolledCpu': (n) => 'Rolled ' + enStars(n) + '. The computer is moving…',
    'rolledYou': (n) => 'You rolled ' + enStars(n) + '. Pick an animal and make ' + enSteps(n) + '.',
    'bonusHare': 'Carrot! The Bunny is eating and can’t be caught.',
    'bonusSquirrel': 'Tree! The Squirrel is nibbling a nut and can’t be reached.',
    'catch': (hunter, prey) => {
      if (prey === 'lion') return 'The ' + EN_ANIMAL[hunter] + ' caught the Lion!';
      return 'The ' + EN_ANIMAL[hunter] + ' caught the ' + EN_ANIMAL[prey] + '! The ' + EN_ANIMAL[prey] + ' went to rest in the den.';
    },
    'hareHome': 'The Bunny reached the edge of the forest!',
    'stuck': 'No more moves.',
    'left': (n) => enSteps(n) + ' left.',
    'timeUp': 'Time’s up! The turn passes to the other side.',
    'timerLeft': (n) => (n === 1 ? '1 second left' : n + ' seconds left'),
    'winLionTitle': 'The Lion is caught!',
    'winHareTitle': 'Bunny’s triumph!',
    'winLionText': 'Royal hugs! All the animals hug each other.',
    'winHareText': 'The Bunny ran through the whole forest and escaped!',
    'winTeam': (team) => (team === 'red' ? 'The Red team wins!' : 'The Blue team wins!'),
    'winCpu': 'The computer won. You’ll do it next time!',
    'winYou': 'You won!'
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
