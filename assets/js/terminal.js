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
    JT.store('jt-tnudge', '9'); var nd = document.querySelector('.tnudge'); if (nd) nd.remove();
    SFX.blip();
    setTimeout(function () { cin.focus({ preventScroll: true }); }, reduce ? 0 : 120);
  }
  function closeTerm() {
    if (!isOpen()) return;
    con.classList.remove('open'); con.setAttribute('aria-hidden', 'true'); cin.tabIndex = -1; cin.blur();
    if (opener && opener.focus && opener !== document.body) opener.focus({ preventScroll: true });
  }
  JT.openTerm = openTerm; JT.closeTerm = closeTerm; JT.termOpen = isOpen;

  /* a page, a product (work/zebu, or just zebu) or the adventure, as an address on this site */
  var PRODUCTS = ['project-rebu', 'zebu', 'tauria-connect', 'tauria-lockbox', 'tauria-cal', 'tauria-calls'];
  function resolve(p) {
    p = (p || '').toLowerCase().replace(/^\/+|\/+$/g, '');
    if (p === '' || p === '~' || p === 'home' || p === 'earth') return { id: 'home', sub: '', path: '', href: JT.url('home') };
    var parts = p.split('/'), id = parts[0], sub = parts[1] || '';
    if (parts.length > 2) return null;
    if (!sub && PRODUCTS.indexOf(id) >= 0) { sub = id; id = 'work'; }
    if (id === 'adventure' && !sub) return { id: id, sub: '', path: id, href: JT.url(id) };
    if (!PAGE_IDS[id] || id === 'home') return null;
    if (sub) return id === 'work' && PRODUCTS.indexOf(sub) >= 0 ? { id: id, sub: sub, path: id + '/' + sub, href: JT.url(id) + sub + '/' } : null;
    return { id: id, sub: '', path: id, href: JT.url(id) };
  }
  function openPage(p) {
    var r = resolve(p);
    if (!r) {
      print('<span class="p">?FILE NOT FOUND  ERROR</span>\n<span class="a">CHEVRON SEVEN WILL NOT LOCK.</span>\nThe address you dialed doesn\'t exist. <span class="c">Pidan may have eaten this page.</span>\n<span class="d">(this is the 404)  try</span> <span class="u">ls</span>');
      SFX.error(); return;
    }
    if (r.id === JT.page && r.sub === JT.sub) { print('<span class="d">you are already on</span> <span class="u">/' + r.path + '</span>'); return; }
    print('<span class="d">LOAD "' + (r.path || 'HOME').toUpperCase() + '",8,1</span>');
    print('→ opening <span class="u">jessethe.com/' + r.path + '</span>');
    setTimeout(function () { JT.go(r.href); }, 450);
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
  function loose(on) {
    if (!JT.doufu) { print('<span class="d">Doufu is asleep on this page.</span>'); return; }
    if (!on) { if (JT.doufu.on()) { JT.doufu.stop(); print('Doufu trots back to her bed. <span class="d">Good girl.</span>'); } else print('<span class="d">Doufu is already home.</span>'); return; }
    if (JT.doufu.on()) { print('<span class="d">She\'s already loose. Look behind you.</span>'); return; }
    JT.achieve('dogs');
    print('<span class="c">DOUFU.DOG</span> is loose. ' + (JT.touch ? 'Tap anywhere' : 'Move your cursor') + ' and she\'ll chase it.\n<span class="d">bring her back with</span> <span class="u">doufu home</span> <span class="d">or Esc</span>');
    setTimeout(function () { closeTerm(); JT.doufu.start($('termbtn')); }, 700);
  }
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
        '  <span class="u">adventure</span>            play the text adventure',
        '  <span class="u">mail</span>                 write me a message, right here',
        '  <span class="u">cv</span>                   print my CV',
        '  <span class="u">achievements</span>         your progress',
        '  <span class="u">dogs  pidan  doufu</span>   meet the rescue dogs',
        '  <span class="u">roll d20</span>             test your luck',
        '  <span class="u">time</span>                 what Jesse is probably doing',
        '  <span class="u">doufu loose</span>          let Doufu chase your cursor',
        '  <span class="u">cheats</span>               every easter egg (spoilers!)',
        '  <span class="u">sound on|off</span>         toggle sound',
        '  <span class="u">commentary on|off</span>    my notes on why things are the way they are',
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
        '  <span class="u">reboot</span>                watch the full boot again',
        '  <span class="u">screensaver</span>           or leave the site alone for a minute',
        '  <span class="u">doufu loose</span>           she chases your cursor, on any page',
        '  <span class="u">adventure</span>             the text adventure. xyzzy works there too',
        '  Click the headshot on Home five times',
        '  Click the Stargate cover on Hobbies, then click it again',
        '  Roll the d20 on Hobbies until it lands on 20',
        '  Click the redacted award on Education',
        '<span class="d">Every achievement has a hint in the drawer. Open it from the status bar.</span>'].join('\n'));
    },
    ls: function (a) {
      if (a === 'work' || a === 'work/') { print('<span class="a">project-rebu/</span>  <span class="a">zebu/</span>  <span class="p">tauria-connect/</span>  <span class="p">tauria-lockbox/</span>  <span class="p">tauria-cal/</span>  <span class="p">tauria-calls/</span>\n<span class="d">open one with</span> <span class="u">open work/zebu</span>'); return; }
      if (a === '-a' || a === '-la') { print('.  ..  <span class="d">.secrets</span>  <span class="d">.dm_notes</span>  <span class="d">.yearbook</span>  about/  work/  education/  travel/  rescue/  hobbies/  contact/  adventure/'); return; }
      if (a && a !== '/' && a !== '~') { print('<span class="d">nothing to list in</span> ' + esc(a) + '<span class="d">. try</span> <span class="u">ls work</span>'); return; }
      print('<span class="v">about/</span>  <span class="a">work/</span>  <span style="color:var(--green)">education/</span>  <span class="cy">travel/</span>  <span class="c">rescue/</span>  <span class="p">hobbies/</span>  <span class="u">contact/</span>  <span style="color:var(--green)">adventure/</span>');
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
    doufu: function (a) {
      if (a === 'loose' || a === '--loose') { loose(true); return; }
      if (a === 'home' || a === 'stop' || a === 'sit' || a === 'come' || a === 'back') { loose(false); return; }
      print('<span class="c">DOUFU.DOG</span>  豆腐 · "tofu" · good girl\nMODE: opposite of Pidan. Requests that you chase. Will not take no for an answer.\n<span class="d">try</span> <span class="u">doufu loose</span>');
      JT.achieve('dogs');
    },
    'let doufu loose': function () { loose(true); },
    screensaver: function () {
      if (!JT.saver) { print('<span class="d">no screensaver on this page</span>'); return; }
      print('<span class="d">PIDAN.SCR · DOUFU.SCR</span> starting… <span class="d">move the mouse or press a key to wake up</span>');
      setTimeout(function () { closeTerm(); JT.saver.start(); }, 700);
    },
    afk: function () { CMDS.screensaver(); },
    adventure: function () {
      if (JT.page === 'adventure') { print('<span class="d">you\'re already in it. type in the green box.</span>'); setTimeout(function () { closeTerm(); var i = $('adv-in'); if (i) i.focus({ preventScroll: true }); }, 500); return; }
      SFX.floppy(); openPage('adventure');
    },
    ajax: function () { print('<span class="v">AJAX.EXE</span>  Aberrant Mind sorcerer\nFORM: astral elf <span class="p">(unstable)</span>\nPET: one gnome squidling, currently on Ajax\'s shoulder.\n<span class="d">' + (JT.store('jt-sheet') === '1' ? 'Your natural 20 unlocked the full sheet. It\'s on the Hobbies page:</span> <span class="u">open hobbies</span>' : 'The full sheet is on the Hobbies page, behind a natural 20. Try</span> <span class="u">roll d20</span>')); },
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
      var dest = resolve(a);
      if (!dest) { SFX.error(); print('<span class="p">CHEVRON SEVEN WILL NOT LOCK.</span>\n<span class="d">no gate address for</span> ' + esc(a) + '<span class="d">. try</span> <span class="u">dial about</span>'); return; }
      print('<span class="d">dialling ' + (dest.path || 'earth').toUpperCase() + '…</span>');
      dial(7, function (n, t) { dialPrint(n, t); if (n > t && (dest.id !== JT.page || dest.sub !== JT.sub)) setTimeout(function () { openPage(a); }, 900); });
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
    commentary: function (a) {
      var on = a === 'on' ? true : a === 'off' ? false : !JT.dcOn();
      JT.setDC(on); print(on ? '<span style="color:#ffd77a">DIRECTOR\'S COMMENTARY ON.</span> <span class="d">Look for the yellow notes. There\'s one on every page.</span>' : '<span class="d">commentary off</span>');
    },
    notes: function (a) { CMDS.commentary(a); },
    sound: function (a) { if (a === 'on' || a === 'off') { SFX.set(a === 'on'); JT.syncMute(); print('sound ' + a); } else print('usage: sound on|off'); },
    date: function () { print(new Date().toString()); },
    time: function () { var n = JT.shanghai(); print('<span class="a">' + JT.two(n.h) + ':' + JT.two(n.m) + '</span> in Shanghai. ' + esc(n.long)); },
    history: function () { print(hist.map(function (h, i) { return '  ' + (i + 1) + '  ' + esc(h); }).join('\n') || '<span class="d">empty</span>'); },
    clear: function () { out.innerHTML = ''; },
    exit: function () { closeTerm(); },
    reboot: function () { print('<span class="a">REBOOTING…</span>'); try { sessionStorage.removeItem('jt-booted'); } catch (e) {} setTimeout(function () { if (JT.page === 'home' && JT.reboot) { closeTerm(); JT.reboot(); } else JT.go(JT.url('home') + '?boot'); }, 500); },
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
  /* A terminal message goes through the same route as the contact form: delivered, or an email draft. */
  function formStep(v) {
    if (v.toLowerCase() === 'cancel') { form = null; ps1.textContent = PS1; print('<span class="d">message cancelled</span>'); return; }
    if (form.step === 0) { if (!v) { print('<span class="p">name required</span>'); return; } form.data.name = v; form.step = 1; ps1.textContent = 'email>'; }
    else if (form.step === 1) { if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) { SFX.error(); print('<span class="p">?ADDRESS ERROR</span> that email looks off, try again'); return; } form.data.email = v; form.step = 2; ps1.textContent = 'message>'; }
    else {
      if (!v) { print('<span class="p">message required</span>'); return; }
      var d = form.data; d.message = v; d.reason = 'From the terminal';
      ps1.textContent = PS1; form = null;
      print('<span class="d">TRANSMITTING ▓▓▓▓▓▓▓▓▓▓</span>');
      JT.sendMail(d).then(function (res) {
        if (!res.ok) { SFX.error(); print('<span class="p">?SEND ERROR</span> ' + esc(res.error || '') + '. try <span class="u">mail</span> again'); return; }
        if (res.via === 'api') print('<span class="a">MESSAGE DELIVERED.</span> Thanks, ' + esc(d.name) + '. I\'ll write back soon.');
        else {
          print('<span class="a">MESSAGE READY.</span> Your mail app should open with it. <span class="d">If it doesn\'t,</span> <a href="' + esc(res.href) + '">send it from here</a><span class="d">.</span>');
          setTimeout(function () { location.href = res.href; }, 700);
        }
        JT.achieve('mail');
      });
    }
  }

  function syncMirror() { mtext.textContent = cin.value; }
  /* type a command for the visitor, one key at a time, then run it */
  var typing = 0;
  function typeIn(cmd) {
    if (form) return;
    clearTimeout(typing); cin.value = ''; syncMirror();
    var k = 0;
    typing = setTimeout(function step() {
      if (k < cmd.length) { cin.value += cmd[k++]; syncMirror(); SFX.key(false); typing = setTimeout(step, reduce ? 0 : 60); return; }
      typing = setTimeout(function () { var v = cin.value; cin.value = ''; syncMirror(); run(v); }, reduce ? 0 : 260);
    }, reduce ? 0 : 280);
  }
  JT.typeIn = function (cmd) { openTerm(); typeIn(cmd); };
  cin.addEventListener('input', syncMirror);
  cin.addEventListener('keydown', function (e) {
    if ((e.key === '~' || e.key === '`') && !cin.value && !form) { e.preventDefault(); closeTerm(); return; }
    if (e.key === 'Escape') { e.preventDefault(); closeTerm(); return; }
    if ((e.key || '').length === 1 || e.key === 'Backspace' || e.key === 'Enter') SFX.key(e.key === 'Enter' || e.key === ' ');
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
  /* [data-term] opens the terminal; data-term="roll d20" also types that command */
  document.querySelectorAll('[data-term]').forEach(function (b) {
    var c = b.getAttribute('data-term'); if (b.classList.contains('now-try')) b.hidden = false;
    b.addEventListener('click', function () { openTerm(); if (c) typeIn(c); });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== '~' && e.key !== '`') return;
    if (JT.inField(e) || e.metaKey || e.ctrlKey || e.altKey || JT.printerOpen() || (JT.blockKeys && JT.blockKeys())) return;
    e.preventDefault(); openTerm();
  });
  print('<span class="d">JESSETHE TERMINAL v2.6 · type</span> <span class="u">help</span> <span class="d">to begin</span>');

  /* a nudge pointing at the terminal button, on a visitor's first two page views, until they open it */
  (function () {
    var seen = +(JT.store('jt-tnudge') || 0), btn = $('termbtn'), tries = 0; if (seen >= 2 || !btn) return;
    function show() {
      if (isOpen()) return;
      if (root.classList.contains('boot-on') || !btn.offsetParent || document.hidden) { if (++tries < 40) setTimeout(show, 1500); return; }
      JT.store('jt-tnudge', String(seen + 1));
      var r = btn.getBoundingClientRect(), d = document.createElement('div');
      d.className = 'tnudge'; d.setAttribute('role', 'status');
      d.innerHTML = (JT.touch ? 'Psst. There\'s a terminal on every page. Tap <b>~</b> down here.' : 'Psst. There\'s a terminal on every page. Press <b>~</b> to open it.') + '<button type="button" aria-label="Dismiss">✕</button>';
      d.addEventListener('click', function (e) { d.remove(); if (!e.target.closest('button')) openTerm(); });
      document.body.appendChild(d);
      /* sit above the button, kept on screen, with the tail pointing at the button's middle */
      var w = d.offsetWidth, mid = r.left + r.width / 2, left = Math.max(16, Math.min(window.innerWidth - w - 16, mid - w + 28));
      d.style.left = left + 'px'; d.style.bottom = (window.innerHeight - r.top + 12) + 'px';
      d.style.setProperty('--tail', Math.max(8, Math.min(w - 18, mid - left - 5)) + 'px');
      setTimeout(function () { d.remove(); }, 9000);
    }
    setTimeout(show, 2500);
  })();
})();
