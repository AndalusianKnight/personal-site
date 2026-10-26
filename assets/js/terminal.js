/* The drop-down terminal: press ~ on any page. Navigation, help and most of the secrets. */
(function () {
  var JT = window.JT, SFX = JT.SFX, esc = JT.esc, reduce = JT.reduce, root = document.documentElement;
  function $(id) { return document.getElementById(id); }

  document.body.insertAdjacentHTML('beforeend',
    '<section class="console" id="console" aria-label="Terminal" aria-hidden="true">' +
      '<div class="console-bar"><span>JESSETHE TERMINAL · TTY1</span><span>Tab completes · ↑ history · ~ or Esc closes</span><button type="button" id="console-x">Close ✕</button></div>' +
      '<div class="console-out" id="out" aria-live="polite"></div>' +
      '<form class="cline" id="cform" autocomplete="off">' +
        '<label class="ps1" id="ps1" for="cin">jesse@jessethe:~$</label>' +
        '<span class="mirror" aria-hidden="true"><span id="mtext"></span><span class="cursor"></span></span>' +
        '<input id="cin" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" enterkeyhint="send" tabindex="-1">' +
      '</form>' +
    '</section>');

  var con = $('console'), out = $('out'), cin = $('cin'), mtext = $('mtext'), ps1 = $('ps1'), cform = $('cform');
  var PS1 = 'jesse@jessethe:~$', hist = [], hpos = 0, form = null, cmdCount = 0, opener = null;
  function print(html) { var d = document.createElement('div'); d.innerHTML = html; out.appendChild(d); out.scrollTop = out.scrollHeight; }
  function printLines(lines, gap) { lines.forEach(function (l, i) { setTimeout(function () { print(l); }, i * (gap || 120)); }); }
  var PAGE_IDS = {}; JT.PAGES.forEach(function (p) { PAGE_IDS[p.id] = p; }); PAGE_IDS.home = { id: 'home', name: 'Home', c: 'violet' };

  function isOpen() { return con.classList.contains('open'); }
  function openTerm() {
    if (isOpen()) { cin.focus({ preventScroll: true }); return; }
    opener = document.activeElement;
    con.classList.add('open'); con.setAttribute('aria-hidden', 'false'); cin.tabIndex = 0;
    SFX.blip();
    setTimeout(function () { cin.focus({ preventScroll: true }); }, reduce ? 0 : 120);
  }
  function closeTerm() {
    if (!isOpen()) return;
    con.classList.remove('open'); con.setAttribute('aria-hidden', 'true'); cin.tabIndex = -1; cin.blur();
    if (opener && opener.focus && opener !== document.body) opener.focus({ preventScroll: true });
  }
  JT.openTerm = openTerm; JT.closeTerm = closeTerm; JT.termOpen = isOpen;

  function openPage(p) {
    var id = p.split('/')[0] || 'home';
    if (id === '~' || id === '') id = 'home';
    if (!PAGE_IDS[id]) {
      print('<span class="p">?FILE NOT FOUND  ERROR</span>\n<span class="a">CHEVRON SEVEN WILL NOT LOCK.</span>\nThe address you dialed doesn\'t exist. <span class="c">Pidan may have eaten this page.</span>\n<span class="d">(this is the 404)  try</span> <span class="u">ls</span>');
      SFX.error(); return;
    }
    if (id === JT.page) { print('<span class="d">you are already on</span> <span class="u">' + (id === 'home' ? '/' : '/' + id) + '</span>'); return; }
    print('<span class="d">LOAD "' + id.toUpperCase() + '",8,1</span>');
    print('→ opening <span class="u">jessethe.com/' + (id === 'home' ? '' : id) + '</span>');
    setTimeout(function () { JT.goPage(id); }, 450);
  }

  /* Stargate */
  var gateBusy = false, NUM = ['ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT'];
  function dial(total, cb) {
    if (gateBusy) return; gateBusy = true;
    var n = 0;
    (function lock() {
      n += 1; SFX.chevron(); cb(n, total);
      if (n < total) setTimeout(lock, 420); else setTimeout(function () { SFX.kawoosh(); gateBusy = false; cb(total + 1, total); JT.achieve('gate'); }, 600);
    })();
  }
  function dialPrint(n, total) { if (n <= total) print('CHEVRON ' + NUM[n - 1] + (n === total ? ' <span class="a">LOCKED</span>' : ' ENCODED')); else print('<span class="cy">*KAWOOSH*</span> wormhole established.'); }

  /* d20 */
  var rolls = 0;
  function rollD20(force) { rolls += 1; var n = force || Math.floor(Math.random() * 20) + 1; if (rolls % 4 === 0) n = 20; SFX.blip(); return n; }
  function unlockSheet() { JT.store('jt-sheet', '1'); JT.achieve('nat20'); }

  var COURSES = [
    ['CSCI S-80', 'Artificial Intelligence', 'cs'], ['EXPO E-34', 'Business Rhetoric', 'biz'], ['MA129', 'Calculus', 'arts'],
    ['CP164', 'Data Structures', 'cs'], ['CSCI E-59', 'Designing and Developing Relational and NoSQL Databases', 'cs'],
    ['DGMD E-28', 'Developing Single-Page Web Applications', 'cs'], ['ANTH E-1000', 'Egyptian Civilization', 'hist'],
    ['BU127', 'Financial Accounting', 'biz'], ['FREN E-1', 'French I', 'arts'], ['FREN E-2', 'French II', 'arts'],
    ['CSCI E-11', 'Frontiers of Computer Science: AI, the Internet of Things, and Cybersecurity (MIT)', 'cs'],
    ['CSCI E-12', 'Fundamentals of Web Development', 'cs'], ['PHIL E-110', 'Hindu Philosophy', 'hist'],
    ['HIST E-1588', 'History of Judaism and Jewish Cultures', 'hist'], ['CLEP', 'History of Western Civilization', 'hist'],
    ['HIST E-1960', 'History of the Cold War', 'hist'], ['DRAM E-21', 'Improvisation', 'arts'], ['DRAM E-10', 'Introduction to Acting', 'arts'],
    ['COMPSCI 50', 'Introduction to Computer Science', 'cs'], ['HBS Online', 'Leadership Principles', 'biz'],
    ['EC140', 'Macroeconomics', 'biz'], ['EC120', 'Microeconomics', 'biz'],
    ['PHIL E-154', 'Mindfulness: Self, Science, and Sport', 'hist'], ['HBS Online', 'Negotiation Mastery', 'biz'],
    ['AS101', 'Our Place in the Cosmos: Astronomy', 'arts'], ['PHIL E-155', 'Philosophy of Happiness', 'hist'],
    ['DGMD E-23', 'Planning Successful Websites and Applications', 'cs'], ['HIST E-1825', 'Power and Civilization of China', 'hist'],
    ['MGMT E-2035', 'Principles of Real Estate', 'biz'], ['Exec Ed', 'Product Management (Berkeley Haas)', 'biz'],
    ['CP104', 'Programming with Python', 'cs'], ['MGMT E-5030', 'Project Management', 'biz'],
    ['MATH E-3', 'Quantitative Reasoning', 'arts'], ['EC285', 'Statistics & Econometrics', 'biz'],
    ['HBS Online', 'Strategy Execution', 'biz'], ['HIST E-1465', 'The United States World Order', 'hist'],
    ['BU111', 'Understanding and Assessing the Business Environment', 'biz'], ['CSCI S-33A', 'Web Programming', 'cs']
  ];
  var CATS = [['cs', 'Computer science'], ['hist', 'History & philosophy'], ['biz', 'Business & economics'], ['arts', 'Maths, science & arts']];

  var ZEBEE = [
    '                \\_/  \\_/',
    '        ___      (o  o)',
    '   ____/   \\_____/ \\__/',
    '  /                  |',
    ' *|    Z E B E E     /',
    '   \\__||______||___/',
    '      ||      ||',
    '      ^^      ^^'].join('\n');

  var BANDS = [
    [0, 5, 'Jesse is asleep. Pidan is on guard. Doufu is dreaming of being chased.'],
    [6, 6, 'Early walk. Pidan is suspicious of the morning.'],
    [7, 8, 'Coffee in progress. Caffeine level rising.'],
    [9, 11, 'Jesse is online, probably building something.'],
    [12, 12, 'Lunch. Probably xiaolongbao.'],
    [13, 17, 'Jesse is online, probably building something.'],
    [18, 18, 'Evening walk. Doufu is demanding to be chased.'],
    [19, 19, 'Dinner time in Shanghai.'],
    [20, 22, 'Evening. On D&D nights, three demigods are in trouble.'],
    [23, 23, 'Winding down. Sleep schedule: still not found.']];
  function two(v) { return String(v).padStart(2, '0'); }

  /* wild magic: an original surge table, in the spirit of the wild magic sorcerer */
  function termFx(cls, ms) { con.classList.add(cls); setTimeout(function () { con.classList.remove(cls); }, ms); }
  var SURGE = [
    ['Your next spell goes off centred on you. The DM asks you to roll a new character.'],
    ['Your skin turns a vivid blue for a few seconds. So does the site.', function () { if (root.hasAttribute('data-c64')) return; root.setAttribute('data-c64', ''); setTimeout(function () { root.removeAttribute('data-c64'); }, 8000); }],
    ['You float a few inches off the ground. So does this terminal.', function () { if (!reduce) termFx('floaty', 6000); }],
    ['You can only shout for the next twenty seconds.', function () { termFx('shout', 20000); }],
    ['You turn invisible for a moment. So does the terminal.', function () { termFx('ghost', 3000); }],
    ['Gravity gets confused. Hold on to something.', function () { if (!reduce) termFx('flip', 3500); }],
    ['You teleport somewhere random on the site.', function () { var P = JT.PAGES.filter(function (p) { return p.id !== JT.page; }); var p = P[(Math.random() * P.length) | 0]; setTimeout(function () { openPage(p.id); }, 900); }],
    ['A third eye opens on your forehead, and you notice a secret.', function () { var f = JT.found(), a = JT.ACH.filter(function (x) { return x.secret && !f[x.id]; })[0]; print(a ? '<span class="d">THIRD EYE:</span> ' + esc(a.hint) : '<span class="d">THIRD EYE:</span> you\'ve already found every secret.'); }],
    ['Doufu appears out of nowhere, demands to be chased, and vanishes before you can stand up.'],
    ['You turn into a potted plant until your next turn. Now Pidan is hiding from you too.'],
    ['A small, polite tentacled creature appears, apologises for the interruption, and leaves.'],
    ['Butterflies and flower petals pour out of your sleeves. Pidan sneezes.'],
    ['A d20 falls out of the sky and rolls.', function () { setTimeout(function () { CMDS.roll('d20'); }, 500); }],
    ['Somewhere nearby, a Stargate chevron locks.', function () { SFX.chevron(); }],
    ['Your hair falls out and grows back by morning. It looks better, honestly.'],
    ['Everything within thirty feet smells faintly of coffee. Caffeine level: maximum.'],
    ['A unicorn appears, looks at the site, nods approvingly, and leaves.'],
    ['You grow a beard made of feathers. It is magnificent.'],
    ['You regain all your sorcery points. Ajax is jealous.'],
    ['Natural 20. Pure, untamed luck. Ajax\'s character sheet unlocks.', function () { unlockSheet(); }]];
  var surged = false;
  function surge() {
    var n = Math.floor(Math.random() * 20) + 1, e = SURGE[n - 1]; SFX.spell();
    print('<span class="v">WILD MAGIC SURGE</span>  <span class="d">d20 =</span> <span class="a">' + n + '</span>\n' + esc(e[0]) + (surged ? '' : '\n<span class="d">(An original surge table for this site, in the spirit of the wild magic sorcerer.)</span>'));
    surged = true;
    if (e[1]) e[1]();
  }

  var CMDS = {
    help: function () {
      print(['<span class="a">AVAILABLE COMMANDS</span>',
        '  <span class="u">help</span>                 this list',
        '  <span class="u">whoami</span>               who is Jesse',
        '  <span class="u">ls</span> [work]            list pages or products',
        '  <span class="u">open</span> &lt;page&gt;          go to a page (or cd)',
        '  <span class="u">dial</span> &lt;page&gt;          go there by Stargate',
        '  <span class="u">home about work education travel rescue hobbies contact</span>',
        '  <span class="u">courses</span>              list my courses',
        '  <span class="u">mail</span>                 write me a message, right here',
        '  <span class="u">cv</span>                   print my CV',
        '  <span class="u">achievements</span>         your progress',
        '  <span class="u">dogs  pidan  doufu</span>   meet the rescue dogs',
        '  <span class="u">roll d20</span>             test your luck',
        '  <span class="u">time</span>                 what Jesse is probably doing',
        '  <span class="u">cheats</span>               every easter egg (spoilers!)',
        '  <span class="u">sound on|off</span>         toggle sound',
        '  <span class="u">reboot  date  history  clear  exit</span>',
        '<span class="d">There are also commands not on this list.</span>'].join('\n'));
    },
    whoami: function () { print('<span class="v">Jesse Thé</span>. Founder, product builder, <span class="a">Harvard alum</span>.\nBuilt six products from zero to market at Zebu and Tauria (acquired),\nthen finished a CS degree at Harvard, cum laude, with a secondary in History.\nCanadian, Brazilian, Portuguese. 13 cities so far, currently Shanghai.\nScuba diver, boulderer, dungeon master. Two rescue dogs.'); },
    cheats: function () {
      print(['<span class="a">CHEAT CODES AND EASTER EGGS</span> <span class="d">(spoilers ahead)</span>',
        '  <span class="u">↑ ↑ ↓ ↓ ← → ← → B A</span>  Commodore 64 colours (outside the terminal)',
        '  <span class="u">sudo roll d20</span>         loaded dice: always a natural 20',
        '  <span class="u">roll d20</span>              a fair roll. A 20 unlocks Ajax\'s sheet',
        '  <span class="u">dial earth</span>            lock all seven chevrons',
        '  <span class="u">dial atlantis</span>         eight chevrons, Pegasus galaxy',
        '  <span class="u">dial about</span>            dial the gate, then go to a page',
        '  <span class="u">wild magic</span>            a wild magic surge. Roll the d20',
        '  <span class="u">apt-get moo</span>           a visit from Zebee',
        '  <span class="u">sudo hire jesse</span>       root access',
        '  <span class="u">sudo rm -rf /</span>         please don\'t',
        '  <span class="u">xyzzy</span>                 a magic word',
        '  <span class="u">ls -a</span>                 hidden files, then <span class="u">cat .dm_notes</span> or <span class="u">cat .yearbook</span>',
        '  <span class="u">indeed  halo  coffee</span>  try them',
        '  <span class="u">open nowhere</span>          the 404',
        '  <span class="u">reboot</span>                watch the boot again',
        '  Click the headshot on Home five times',
        '<span class="d">More eggs hatch as the other pages go live.</span>'].join('\n'));
    },
    ls: function (a) {
      if (a === 'work' || a === 'work/') { print('<span class="a">project-rebu</span>  <span class="a">zebu</span>  <span class="p">tauria-connect</span>  <span class="p">tauria-lockbox</span>  <span class="p">tauria-cal</span>  <span class="p">tauria-calls</span>\n<span class="d">the product pages arrive with the Work page</span>'); return; }
      if (a === '-a' || a === '-la') { print('.  ..  <span class="d">.secrets</span>  <span class="d">.dm_notes</span>  <span class="d">.yearbook</span>  about/  work/  education/  travel/  rescue/  hobbies/  contact/'); return; }
      print('<span class="v">about/</span>  <span class="a">work/</span>  <span style="color:var(--green)">education/</span>  <span class="cy">travel/</span>  <span class="c">rescue/</span>  <span class="p">hobbies/</span>  <span class="u">contact/</span>');
    },
    'cat .dm_notes': function () { print('<span class="a">DM NOTES:</span> the demigods will never suspect the oracle.'); JT.achieve('dm'); },
    'cat .yearbook': function () { print('<span class="a">YEARBOOK:</span> top student in English Literature of the whole graduating class.\n<span class="d">High school. It still counts.</span>'); },
    'cat .secrets': function () { print('The real secret: Pidan has eaten at least one of these notes.'); },
    cat: function (a) { print(a ? '<span class="p">cat:</span> ' + esc(a) + ': no such file <span class="d">(try</span> <span class="u">ls -a</span><span class="d">)</span>' : '<span class="d">usage:</span> <span class="u">cat</span> &lt;file&gt;'); },
    open: function (a) { openPage((a || '').replace(/^\/|\/$/g, '')); },
    cd: function (a) { if (!a || a === '~' || a === '/' || a === '..') { if (JT.page === 'home') print('<span class="d">already home</span>'); else openPage('home'); return; } openPage(a.replace(/^\/|\/$/g, '')); },
    contact: function () { openPage('contact'); },
    mail: function () { form = { step: 0, data: {} }; print('<span class="a">NEW MESSAGE</span> <span class="d">(type cancel to stop)</span>'); ps1.textContent = 'name>'; },
    cv: function () { print('<span class="d">PRINTER: 9-PIN ONLINE · feeding CV.TXT</span>'); setTimeout(JT.printCV, 300); },
    courses: function () {
      var lines = ['<span class="a">' + COURSES.length + ' COURSES</span> <span class="d">(Harvard, MIT, HBS Online, Berkeley Haas, Lazaridis)</span>'];
      CATS.forEach(function (c) { lines.push('<span class="u">' + c[1].toUpperCase() + '</span>'); COURSES.filter(function (x) { return x[2] === c[0]; }).forEach(function (x) { lines.push('  <span class="d">' + esc(x[0]) + '</span>  ' + esc(x[1])); }); });
      print(lines.join('\n')); JT.achieve('courses');
    },
    achievements: function () {
      var f = JT.found();
      print(JT.ACH.map(function (a) { var got = f[a.id], hide = a.secret && !got; return (got ? '<span class="a">[x]</span> ' : '[ ] ') + esc(hide ? '??? (' + a.hint + ')' : a.t); }).join('\n') + '\n<span class="d">' + Object.keys(f).length + '/21 earned</span>');
    },
    dogs: function () {
      print('<span class="c">' + esc('   / \\__        __/ \\\n  (    @\\___  ___/@    )\n  /         O O         \\\n /   (_____/   \\_____)   \\\n/_____/   U     U   \\_____\\') + '</span>\n<span class="c">Pidan</span> (皮蛋) and <span class="c">Doufu</span> (豆腐), best friends from Huangshan, China.\nType <span class="u">pidan</span> or <span class="u">doufu</span> for a status report.');
      JT.achieve('dogs');
    },
    pidan: function () { print('<span class="c">PIDAN.DOG</span>  皮蛋 · "century egg" · good boy\nMODE: shy / nervous. Last seen shredding page 2 of the CV.'); JT.achieve('dogs'); },
    doufu: function () { print('<span class="c">DOUFU.DOG</span>  豆腐 · "tofu" · good girl\nMODE: opposite of Pidan. Requests that you chase. Will not take no for an answer.'); JT.achieve('dogs'); },
    ajax: function () { print('<span class="v">AJAX.EXE</span>  Aberrant Mind sorcerer\nFORM: astral elf <span class="p">(unstable)</span>\nPET: one gnome squidling, currently on Ajax\'s shoulder.\n<span class="d">Roll a natural 20 to read the full sheet.</span>'); },
    coffee: function () { printLines(['brewing  [██░░░░░░░░]', 'brewing  [██████░░░░]', 'brewing  [██████████]', 'CAFFEINE LEVEL ............ <span class="a">MAXIMUM</span>', '<span class="d">Real coffee: at the Harvard Club of Boston or New York, if we\'re both in town.</span>'], 300); },
    roll: function (a, loaded) {
      if (a === 'd20 --loaded' || a === '--loaded') loaded = true;
      else if (a && a !== 'd20') { print('<span class="d">only the d20 is calibrated</span>'); return; }
      var n = rollD20(loaded ? 20 : 0);
      if (loaded) { print('[d20] <span class="a">NATURAL 20!</span> <span class="d">Loaded dice. The DM saw that, and allows it this once.</span>'); unlockSheet(); }
      else if (n === 20) { print('[d20] <span class="a">NATURAL 20!</span> Ajax\'s character sheet is unlocked on the Hobbies page.'); unlockSheet(); }
      else if (n === 1) { print('[d20] <span class="p">1. Critical fail.</span> The DM sighs.'); SFX.error(); }
      else print('[d20] You rolled <span class="u">' + n + '</span>. ' + (n > 14 ? 'Not bad.' : 'Roll again?'));
    },
    dial: function (a) {
      if (gateBusy) return;
      if (a === 'atlantis' || a === 'pegasus') { print('<span class="d">intergalactic address: 8 chevrons</span>'); dial(8, dialPrint); return; }
      if (!a) { print('<span class="d">usage:</span> <span class="u">dial</span> &lt;page&gt;  <span class="d">try</span> <span class="u">dial about</span>'); return; }
      var dest = { earth: 'home', home: 'home' }[a] || a.replace(/^\/|\/$/g, '');
      if (!PAGE_IDS[dest]) { SFX.error(); print('<span class="p">CHEVRON SEVEN WILL NOT LOCK.</span>\n<span class="d">no gate address for</span> ' + esc(a) + '<span class="d">. try</span> <span class="u">dial about</span>'); return; }
      print('<span class="d">dialling ' + dest.toUpperCase() + '…</span>');
      dial(7, function (n, t) { dialPrint(n, t); if (n > t && dest !== JT.page) setTimeout(function () { openPage(dest); }, 900); });
    },
    indeed: function () { print('<span class="a">Indeed.</span>'); },
    halo: function () { print('<span style="color:var(--green)">"Wake me, when you need me."</span>'); },
    sudo: function (a) {
      if (a === 'roll d20' || a === 'roll') { CMDS.roll('d20', true); return; }
      if (a === 'hire jesse') { print('<span class="a">[sudo] permission granted.</span> Great choice. Opening contact…'); JT.achieve('hire'); setTimeout(function () { openPage('contact'); }, 900); }
      else if (a === 'rm -rf /' || a === 'rm -rf /*') { SFX.error(); printLines(['<span class="p">deleting /work …</span>', '<span class="p">deleting /travel …</span>', '<span class="p">deleting /rescue …</span>', '<span class="p">KERNEL PANIC</span>', 'just kidding. Doufu unplugged the keyboard.'], 350); }
      else print('<span class="u">visitor</span> is not in the sudoers file. This incident will be reported.');
    },
    xyzzy: function () { print('Nothing happens.'); JT.achieve('xyzzy'); },
    hello: function () { print('Hi! Type <span class="u">help</span> to see what I can do.'); },
    hi: function () { CMDS.hello(); },
    sound: function (a) { if (a === 'on' || a === 'off') { SFX.set(a === 'on'); JT.syncMute(); print('sound ' + a); } else print('usage: sound on|off'); },
    date: function () { print(new Date().toString()); },
    time: function () { var d = new Date(Date.now() + 8 * 3600000), h = d.getUTCHours(), b = BANDS.filter(function (x) { return h >= x[0] && h <= x[1]; })[0]; print('<span class="a">' + two(h) + ':' + two(d.getUTCMinutes()) + '</span> in Shanghai. ' + esc(b[2])); },
    history: function () { print(hist.map(function (h, i) { return '  ' + (i + 1) + '  ' + esc(h); }).join('\n') || '<span class="d">empty</span>'); },
    clear: function () { out.innerHTML = ''; },
    exit: function () { closeTerm(); },
    reboot: function () { print('<span class="a">REBOOTING…</span>'); try { sessionStorage.removeItem('jt-booted'); } catch (e) {} setTimeout(function () { if (JT.page === 'home' && JT.reboot) { closeTerm(); JT.reboot(); } else JT.goPage('home'); }, 500); },
    konami: function () { print('Try it with the arrow keys, outside the terminal.'); },
    moo: function () { SFX.moo(); print('<span class="u">' + esc(ZEBEE) + '</span>\n<span class="a">"Have you mooed today?"</span>\n<span class="d">Zebee, the Zebu mascot, says hi.</span>'); },
    'apt-get': function (a) { if (a === 'moo' || a === 'install moo') { CMDS.moo(); return; } print('<span class="p">E:</span> Unable to locate package ' + esc(a || '') + '\n<span class="d">This system has one package, and it moos.</span>'); },
    'wild magic': surge,
    surge: surge
  };
  ['home', 'about', 'work', 'education', 'travel', 'rescue', 'hobbies'].forEach(function (p) { CMDS[p] = function () { openPage(p); }; });
  var NAMES = Object.keys(CMDS).filter(function (k) { return k.indexOf(' ') < 0 && k.indexOf('.') < 0; });

  function run(raw) {
    var line = raw.trim();
    print('<span>' + esc(ps1.textContent) + '</span> <span class="u">' + esc(raw) + '</span>');
    if (form) { formStep(line); return; }
    if (!line) return;
    hist.push(line); hpos = hist.length;
    cmdCount += 1; if (cmdCount >= 5) JT.achieve('term');
    var lower = line.toLowerCase().replace(/\s+/g, ' ');
    if (CMDS[lower]) { CMDS[lower](); return; }
    var sp = lower.indexOf(' '), cmd = sp < 0 ? lower : lower.slice(0, sp), arg = sp < 0 ? '' : lower.slice(sp + 1).trim();
    if (CMDS[cmd]) { CMDS[cmd](arg); return; }
    SFX.error(); print('<span class="p">?SYNTAX ERROR</span>  type <span class="u">help</span>');
  }
  /* Until the contact form has its serverless function, a terminal message becomes an email draft. */
  function formStep(v) {
    if (v.toLowerCase() === 'cancel') { form = null; ps1.textContent = PS1; print('<span class="d">message cancelled</span>'); return; }
    if (form.step === 0) { if (!v) { print('<span class="p">name required</span>'); return; } form.data.name = v; form.step = 1; ps1.textContent = 'email>'; }
    else if (form.step === 1) { if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) { SFX.error(); print('<span class="p">?ADDRESS ERROR</span> that email looks off, try again'); return; } form.data.email = v; form.step = 2; ps1.textContent = 'message>'; }
    else {
      if (!v) { print('<span class="p">message required</span>'); return; }
      var d = form.data, href = 'mailto:jessethe@alumni.harvard.edu?subject=' + encodeURIComponent('Hello from jessethe.com: ' + d.name) + '&body=' + encodeURIComponent(v + '\n\n' + d.name + ' <' + d.email + '>');
      ps1.textContent = PS1; form = null;
      printLines(['<span class="d">TRANSMITTING ▓▓▓▓▓▓▓▓▓▓</span>', '<span class="a">MESSAGE READY.</span> Your mail app should open with it. <span class="d">If it doesn\'t,</span> <a href="' + esc(href) + '">send it from here</a><span class="d">.</span>'], 500);
      setTimeout(function () { location.href = href; }, 1100);
      JT.achieve('mail');
    }
  }

  function syncMirror() { mtext.textContent = cin.value; }
  cin.addEventListener('input', syncMirror);
  cin.addEventListener('keydown', function (e) {
    if ((e.key === '~' || e.key === '`') && !cin.value && !form) { e.preventDefault(); closeTerm(); return; }
    if (e.key === 'Escape') { e.preventDefault(); closeTerm(); return; }
    if (e.key.length === 1 || e.key === 'Backspace' || e.key === 'Enter') SFX.key(e.key === 'Enter' || e.key === ' ');
    if (e.key === 'ArrowUp' && hist.length && !form) { e.preventDefault(); hpos = Math.max(0, hpos - 1); cin.value = hist[hpos]; syncMirror(); }
    else if (e.key === 'ArrowDown' && hist.length && !form) { e.preventDefault(); hpos = Math.min(hist.length, hpos + 1); cin.value = hist[hpos] || ''; syncMirror(); }
    else if (e.key === 'Tab' && cin.value && !form) {
      var m = NAMES.filter(function (n) { return n.indexOf(cin.value.toLowerCase()) === 0; });
      if (m.length === 1) { e.preventDefault(); cin.value = m[0] + ' '; syncMirror(); } else if (m.length > 1) { e.preventDefault(); print(m.join('  ')); }
    }
  });
  cform.addEventListener('submit', function (e) { e.preventDefault(); var v = cin.value; cin.value = ''; syncMirror(); run(v); });
  con.addEventListener('click', function (e) { if (!e.target.closest('a, button')) cin.focus({ preventScroll: true }); });
  $('console-x').addEventListener('click', closeTerm);
  $('termbtn').addEventListener('click', function () { if (isOpen()) closeTerm(); else openTerm(); });
  document.querySelectorAll('[data-term]').forEach(function (b) { b.addEventListener('click', function () { openTerm(); }); });
  document.addEventListener('keydown', function (e) {
    if (e.key !== '~' && e.key !== '`') return;
    if (JT.inField(e) || e.metaKey || e.ctrlKey || e.altKey || JT.printerOpen() || (JT.blockKeys && JT.blockKeys())) return;
    e.preventDefault(); openTerm();
  });
  print('<span class="d">JESSETHE TERMINAL v2.6 · type</span> <span class="u">help</span> <span class="d">to begin</span>');
})();
