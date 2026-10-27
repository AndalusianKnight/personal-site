/* The shared shell for every page: pixel cursor, status bar, achievements, page changes,
   the CV printer and a few global eggs. The terminal lives in terminal.js, the boot in boot.js. */
(function () {
  var JT = window.JT = window.JT || {};
  var SFX = JT.SFX;
  var root = document.documentElement;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var base = root.getAttribute('data-root') || '';
  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function $(id) { return document.getElementById(id); }
  function inField(e) { var t = e.target; return t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT'); }
  JT.store = store; JT.esc = esc; JT.reduce = reduce; JT.inField = inField; JT.base = base;
  JT.touch = !!(window.matchMedia && window.matchMedia('(hover: none) and (pointer: coarse)').matches);

  var PAGES = [
    { id: 'about', key: 'F1', name: 'About', c: 'violet', d: 'Who I am, where I\'m from, what I\'m into' },
    { id: 'work', key: 'F2', name: 'Work', c: 'amber', d: 'Two startups, six products, one exit' },
    { id: 'education', key: 'F3', name: 'Education', c: 'green', d: 'Harvard, HBS Online, Berkeley Haas, MIT, Lazaridis' },
    { id: 'travel', key: 'F4', name: 'Travel', c: 'cyan', d: '13 homes and 40+ countries on a globe' },
    { id: 'rescue', key: 'F5', name: 'Rescue', c: 'coral', d: 'Pidan, Doufu and rescue work in China' },
    { id: 'hobbies', key: 'F6', name: 'Hobbies', c: 'pink', d: 'Stargate, Halo, Civ, books and D&D' },
    { id: 'contact', key: 'F7', name: 'Contact', c: 'text', d: 'Hiring, projects, or coffee in Boston or New York' }
  ];
  JT.PAGES = PAGES;

  /* scramble an element's text into glyphs, then reveal it left to right (the Tauria decrypt) */
  var GLYPHS = JT.GLYPHS = 'ABCDEFabcdef0123456789+/=#%$&@', scrambleToken = 0;
  JT.scramble = function (el, dur, onDone, onTick) {
    var token = ++scrambleToken, nodes = [], w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null), n;
    while ((n = w.nextNode())) if (n.nodeValue.trim()) nodes.push(n);
    var orig = nodes.map(function (x) { return x.nodeValue; }), total = orig.reduce(function (s, x) { return s + x.length; }, 0), start = performance.now();
    el.classList.add('scrambling');
    (function frame(now) {
      if (token !== scrambleToken) { nodes.forEach(function (x, i) { x.nodeValue = orig[i]; }); el.classList.remove('scrambling'); return; }
      var p = reduce ? 1 : Math.min(1, ((now || performance.now()) - start) / dur), cut = Math.floor(p * total), acc = 0;
      nodes.forEach(function (x, i) {
        var s = orig[i], o = '';
        for (var j = 0; j < s.length; j++) { var c = s[j]; o += (acc + j < cut || c === ' ' || c === '\n') ? c : GLYPHS[(Math.random() * GLYPHS.length) | 0]; }
        x.nodeValue = o; acc += s.length;
      });
      if (onTick) onTick(p);
      if (p < 1) requestAnimationFrame(frame);
      else { el.classList.remove('scrambling'); if (onDone) onDone(); }
    })();
  };
  JT.page = document.body.getAttribute('data-page') || 'home';
  JT.sub = document.body.getAttribute('data-sub') || '';
  JT.url = function (id) { return base + (id === 'home' ? '' : id + '/'); };

  /* ---------- sound unlock + clicks ---------- */
  ['pointerdown', 'keydown'].forEach(function (ev) { document.addEventListener(ev, function () { SFX.unlock(); }, { once: true, capture: true }); });
  document.addEventListener('click', function (e) {
    var t = e.target.closest('button, a');
    if (t && !t.hasAttribute('data-nosfx')) SFX.click();
  });

  /* ---------- pixel art: hand cursor and trophy ---------- */
  var HAND = ['    ##          ','   #..#         ','   #..#         ','   #..#         ','   #..###       ','   #..#..###    ','   #..#..#..##  ','## #..#..#..#.# ','#..#........#.# ','#...#.........# ',' #............# ','  #...........# ','  #..........#  ','   #.........#  ','   #.........#  ','   ###########  '];
  var TROPHY = ['                ','  ############  ',' #.#........#.# ','#..#........#..#','#..#........#..#',' #.#........#.# ','  ##........##  ','   #........#   ','    #......#    ','     ##..##     ','      #..#      ','      #..#      ','     #....#     ','    ########    ','    #......#    ','    ########    '];
  function pix(fill, ink, map) {
    var r = '';
    map.forEach(function (row, y) { for (var x = 0; x < row.length; x++) { var c = row[x]; if (c === '#' || c === '.') r += '<rect x="' + x + '" y="' + y + '" width="1" height="1" fill="' + (c === '#' ? ink : fill) + '"/>'; } });
    return 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 16 16" shape-rendering="crispEdges">' + r + '</svg>');
  }
  var hand = pix('#ffffff', '#000000', HAND), handHot = pix('#ffb340', '#000000', HAND);
  var trophyGold = pix('#ffb340', '#000000', TROPHY), trophyPink = pix('#ff5fa8', '#000000', TROPHY);
  var cs = document.createElement('style');
  cs.textContent = 'html, body { cursor: url("' + hand + '") 9 0, auto; } a, button, label, summary, .photo, .welcome, .boot, .hot { cursor: url("' + handHot + '") 9 0, pointer; } .cline input { cursor: text; }';
  document.head.appendChild(cs);

  /* ---------- shared chrome: status bar, toast, drawer, printer ---------- */
  var here = JT.page === 'home' ? 'HOME' : (PAGES.filter(function (p) { return p.id === JT.page; })[0] || { name: JT.page }).name.toUpperCase();
  if (JT.sub) here += ' / ' + JT.sub.replace(/-/g, ' ').toUpperCase();
  document.body.insertAdjacentHTML('beforeend',
    '<footer class="sitefoot"><div class="b88row" id="b88"></div><span class="label">© 2026 Jesse Thé · jessethe.com · no trackers, one d20</span></footer>' +
    '<footer class="osbar" aria-label="Status bar">' +
      '<span class="left"><span class="ready">READY.</span><span>' + esc(here) + '</span><span class="tz" id="osclock"></span></span>' +
      '<span class="right"><button type="button" class="achbtn" id="achbtn" aria-expanded="false" aria-controls="drawer"><img alt="" src="' + trophyGold + '"><span class="achlbl">Achievements</span><span><b class="ach-n">0</b>/21</span></button>' +
      '<button type="button" id="termbtn" title="Open the terminal (~)" aria-label="Terminal">~<span class="tlbl"> Terminal</span><i class="tcur" aria-hidden="true"></i></button><button type="button" id="dcbtn" aria-pressed="false" title="Director\'s commentary: Jesse\'s notes on why things are the way they are">Notes off</button><button type="button" id="mute" aria-pressed="false">Sound on</button></span>' +
    '</footer>' +
    '<div class="toast" id="toast" role="status" aria-live="polite"><img id="trophy" alt="" src="' + trophyGold + '"><div><small id="toast-k">ACHIEVEMENT UNLOCKED</small><b id="toast-t"></b><span id="toast-d"></span></div></div>' +
    '<aside class="drawer" id="drawer" hidden aria-label="Achievements">' +
      '<div class="win-bar"><i></i><span>ACHIEVEMENTS.EXE</span><button type="button" id="drawer-x" aria-label="Close achievements">✕</button></div>' +
      '<div class="drawer-sum"><span class="label">Earned <b class="ach-n">0</b> of 21</span><div class="meter" aria-hidden="true"><b class="ach-meter"></b></div></div>' +
      '<div class="drawer-list" id="ach-drawer"></div>' +
    '</aside>' +
    '<div class="overlay" id="printer-ov" hidden>' +
      '<div class="printer" role="dialog" aria-modal="true" aria-label="CV printout">' +
        '<div class="printer-head"><span><span class="led"></span>9-pin printer · CV.TXT</span><button type="button" id="pr-close">Close ✕</button></div>' +
        '<div class="paper-wrap" id="paper-wrap"><div class="paper"><pre id="paper"></pre></div></div>' +
        '<div class="printer-foot"><button type="button" class="btn g" id="pr-save">Save CV.TXT</button><span class="label">A PDF version lands here soon.</span></div>' +
      '</div>' +
    '</div>');

  /* 88x31 buttons, the way the 90s web intended. The blinking one is mandatory. */
  var B88 = [
    ['JESSE THÉ', 'jessethe.com', '#a77bff', '#120a22', '#fff', 'JT', 0, 'home'],
    ['BEST VIEWED', 'AT 800×600', '#c0c0c0', '#2a2a2a', '#000', '800'],
    ['POWERED BY', 'COFFEE', '#ffb340', '#2a1a05', '#000', 'JAVA'],
    ['RESCUE', 'A DOG', '#ff7a5c', '#2a0d07', '#fff', '♥', 0, 'rescue'],
    ['HTML5', 'HAND-CODED', '#59ff95', '#062a12', '#000', '&lt;/&gt;'],
    ['NO', 'TRACKERS', '#5fe3e8', '#05252a', '#000', '0'],
    ['PLAY THE', 'ADVENTURE', '#59ff95', '#04140a', '#000', '&gt;_', 0, 'adventure'],
    ['SG-1', 'CHEVRON 7', '#5fb8ff', '#05102a', '#fff', '◎', 0, 'hobbies'],
    ['NEW!', 'NAT 20', '#ff5fa8', '#2a0516', '#fff', '20', 1, 'hobbies']
  ];
  $('b88').innerHTML = B88.map(function (b) {
    var blink = b[6] ? '<animate attributeName="opacity" values="1;1;0;0" keyTimes="0;.5;.5;1" dur="1s" repeatCount="indefinite"/>' : '';
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="88" height="31" viewBox="0 0 88 31" shape-rendering="crispEdges" aria-hidden="true"><rect width="88" height="31" fill="' + b[3] + '"/><rect x="0" y="0" width="88" height="1" fill="#fff" fill-opacity=".5"/><rect x="0" y="0" width="1" height="31" fill="#fff" fill-opacity=".5"/><rect x="0" y="30" width="88" height="1" fill="#000"/><rect x="87" y="0" width="1" height="31" fill="#000"/><rect x="3" y="3" width="30" height="25" fill="' + b[2] + '"/><text x="18" y="20" text-anchor="middle" font-family="VT323, monospace" font-size="14" fill="' + b[4] + '">' + b[5] + blink + '</text><text x="60" y="14" text-anchor="middle" font-family="VT323, monospace" font-size="11" fill="' + b[2] + '">' + esc(b[0]) + '</text><text x="60" y="25" text-anchor="middle" font-family="VT323, monospace" font-size="11" fill="#fff">' + esc(b[1]) + '</text></svg>';
    var label = esc(b[0] + ' ' + b[1]);
    return b[7] ? '<a class="b88" href="' + JT.url(b[7]) + '" aria-label="' + label + '">' + svg + '</a>' : '<span class="b88" role="img" aria-label="' + label + '">' + svg + '</span>';
  }).join('');

  /* what Jesse is probably doing, on Shanghai time */
  var BANDS = [
    [0, 5, 'Jesse is asleep. Pidan is on guard. Doufu is dreaming of being chased.', 'Jesse is asleep', true],
    [6, 6, 'Early walk. Pidan is suspicious of the morning.', 'Morning walk', false],
    [7, 8, 'Coffee in progress. Caffeine level rising.', 'Coffee in progress', false],
    [9, 11, 'Jesse is online, probably building something.', 'Probably building something', false],
    [12, 12, 'Lunch. Probably xiaolongbao.', 'Lunch · probably xiaolongbao', false],
    [13, 17, 'Jesse is online, probably building something.', 'Probably building something', false],
    [18, 18, 'Evening walk. Doufu is demanding to be chased.', 'Walking the dogs', false],
    [19, 19, 'Dinner time in Shanghai.', 'Dinner', false],
    [20, 22, 'Evening. On D&D nights, three demigods are in trouble.', 'Evening · maybe D&D night', false],
    [23, 23, 'Winding down. Sleep schedule: still not found.', 'Winding down', true]];
  function two(v) { return String(v).padStart(2, '0'); }
  JT.two = two;
  JT.shanghai = function (hour) {
    var d = new Date(Date.now() + 8 * 3600000), h = hour == null ? d.getUTCHours() : hour, b = BANDS[0];
    for (var i = 0; i < BANDS.length; i++) if (h >= BANDS[i][0] && h <= BANDS[i][1]) b = BANDS[i];
    return { h: h, m: d.getUTCMinutes(), s: d.getUTCSeconds(), long: b[2], short: b[3], night: b[4] };
  };
  var osclock = $('osclock');
  function clockTick() { var n = JT.shanghai(); osclock.textContent = two(n.h) + ':' + two(n.m) + ' in Shanghai · ' + n.short; }
  clockTick(); setInterval(clockTick, 15000);

  /* next and previous program at the foot of each page */
  var pi = -1; PAGES.forEach(function (p, k) { if (p.id === JT.page) pi = k; });
  var mainEl = document.getElementById('main');
  if (pi >= 0 && !JT.sub && mainEl) {
    var prev = pi > 0 ? PAGES[pi - 1] : { id: 'home', key: 'ESC', name: 'Home', c: 'violet' }, next = pi < PAGES.length - 1 ? PAGES[pi + 1] : { id: 'home', key: 'HOME', name: 'Home', c: 'violet' };
    var nav = document.createElement('nav'); nav.className = 'nextprog'; nav.setAttribute('aria-label', 'Previous and next program');
    nav.innerHTML = '<a href="' + JT.url(prev.id) + '" style="--c: var(--' + prev.c + ')"><span>◀ ' + (prev.id === 'home' ? 'Back to' : 'Previous · ' + prev.key) + '</span><b>' + esc(prev.name) + '</b></a>' +
      '<a href="' + JT.url(next.id) + '" style="--c: var(--' + next.c + ')"><span>' + (next.id === 'home' ? 'Back to' : 'Next · ' + next.key) + ' ▶</span><b>' + esc(next.name) + '</b></a>';
    (mainEl.querySelector('.pg') || mainEl).appendChild(nav);
  }

  var muteBtn = $('mute');
  function syncMute() { muteBtn.textContent = SFX.on ? 'Sound on' : 'Sound off'; muteBtn.setAttribute('aria-pressed', String(!SFX.on)); }
  syncMute();
  JT.syncMute = syncMute;
  muteBtn.addEventListener('click', function () { SFX.set(!SFX.on); syncMute(); });

  /* ---------- director's commentary: Jesse's notes in the margins, switched on from the status bar ---------- */
  var NOTES = {
    home: ['.programs', 'before', 'The intro is long on purpose. I wanted the first ten seconds to feel like switching on my parents\' old computer. Come back another day and you get the short version.'],
    about: ['.specs > .label', 'after', 'The specs panel exists because I\'m Canadian, Brazilian and Portuguese, and "where are you from" deserves a technical answer.'],
    work: ['#disks-h', 'head', 'Every disk in this box shipped to real users. That\'s the only rule for getting in.'],
    'project-rebu': ['#demo-h', 'head', 'Rebu was live with a taxi company and a limo company, with real riders. We pivoted, but it shipped, and shipping is the part that counts.'],
    zebu: ['#demo-h', 'head', 'Zebee was our real mascot. Every startup needs one, and ours could moo.'],
    'tauria-connect': ['#demo-h', 'head', 'This demo runs real encryption in your browser. The server in the middle gets exactly what ours got: nothing it can read.'],
    education: ['#schools-h', 'head', 'I took the long way through Harvard, in and out of Cambridge for four years. I loved every walk across that campus.'],
    travel: ['#globe-h', 'head', 'The trail follows the order I actually lived in these cities. Amsterdam to São Paulo was a long leg.'],
    rescue: ['#play-h', 'head', 'Pidan and Doufu are real, and everything they do on this site is something they really do.'],
    hobbies: ['#shelf-h', 'head', 'I could talk about any of these for an hour. Stargate most of all.'],
    contact: ['#why-h', 'head', 'Achievements are the site map in disguise. Earn them all and you\'ve seen everything I wanted to show you.'],
    adventure: ['#how-h', 'head', 'The key really is split in three. Old habits from building encryption products.'],
    '404': ['.stub .lede', 'after', 'Chevron seven will not lock. If you know, you know.']
  };
  var note = NOTES[JT.sub] || (JT.sub ? null : NOTES[JT.page]), noteAt = note && document.querySelector(note[0]);
  if (noteAt) {
    var dc = document.createElement('aside'); dc.className = 'dc'; dc.setAttribute('aria-label', 'Director\'s commentary');
    dc.innerHTML = '<b>Director\'s commentary · Jesse</b><p>' + esc(note[2]) + '</p>';
    if (note[1] === 'before') noteAt.parentNode.insertBefore(dc, noteAt);
    else { var after = note[1] === 'head' ? (noteAt.closest('.blk-head') || noteAt) : noteAt; after.parentNode.insertBefore(dc, after.nextSibling); }
  }
  var dcBtn = $('dcbtn');
  function setDC(on) {
    if (on) root.setAttribute('data-dc', ''); else root.removeAttribute('data-dc');
    dcBtn.textContent = on ? 'Notes on' : 'Notes off'; dcBtn.setAttribute('aria-pressed', String(on));
    store('jt-dc', on ? '1' : '');
  }
  JT.setDC = setDC; JT.dcOn = function () { return root.hasAttribute('data-dc'); };
  setDC(store('jt-dc') === '1');
  dcBtn.addEventListener('click', function () { setDC(!root.hasAttribute('data-dc')); });

  /* ---------- achievements (kept in this browser across pages and visits) ---------- */
  var ACH = [
    { id: 'boot', t: 'Hello, World', d: 'Power on the site.' },
    { id: 'cv', t: 'PC LOAD LETTER', d: 'Print or download the CV.' },
    { id: 'disk', t: 'Insert Disk 2', d: 'Open a project in Work.' },
    { id: 'decrypt', t: 'Zero Knowledge', d: 'Decrypt one of the Tauria apps.' },
    { id: 'home', t: 'Jet Lag', d: 'Open a postcard from one of the homes on the globe.' },
    { id: 'flyer', t: 'Frequent Flyer Miles', d: 'Open postcards from five different homes.' },
    { id: 'courses', t: 'Syllabus Week', d: 'Open the full course list.' },
    { id: 'paper', t: 'Required Reading', d: 'Open a paper from school.' },
    { id: 'shelf', t: 'Shelf Life', d: 'Read about a favourite show, game or book.' },
    { id: 'dogs', t: 'Good Boy, Good Girl', d: 'Say hi to Pidan and Doufu.' },
    { id: 'term', t: 'Terminal Velocity', d: 'Run five commands in the terminal.' },
    { id: 'mail', t: 'You\'ve Got Mail', d: 'Send Jesse a message.' },
    { id: 'gate', t: 'Chevron Seven Locked', d: 'Dial the Stargate.', secret: true, hint: 'A ring on the shelf wants to spin.' },
    { id: 'nat20', t: 'Natural 20', d: 'Roll a natural 20.', secret: true, hint: 'Roll for it.' },
    { id: 'konami', t: 'Up Up Down Down', d: 'Enter the Konami code.', secret: true, hint: 'An old cheat code still works here.' },
    { id: 'glitch', t: 'Glitch in the Matrix', d: 'Break the headshot.', secret: true, hint: 'Some photos don\'t like being poked.' },
    { id: 'hire', t: 'Root Access', d: 'sudo hire jesse', secret: true, hint: 'Ask the terminal nicely, as root.' },
    { id: 'afk', t: 'Away From Keyboard', d: 'Watch the screensaver.', secret: true, hint: 'Take a break.' },
    { id: 'xyzzy', t: 'Nothing Happens', d: 'Say the magic word.', secret: true, hint: 'A magic word from a much older adventure.' },
    { id: 'dm', t: 'Behind the Screen', d: 'Read the DM\'s notes.', secret: true, hint: 'Hidden files are still files.' },
    { id: 'stalker', t: 'Stalker', d: 'Earn every other achievement.', final: true }
  ];
  var ACHBY = {}; ACH.forEach(function (a) { ACHBY[a.id] = a; });
  var found = {};
  try { found = JSON.parse(store('jt-ach') || '{}') || {}; } catch (e) { found = {}; }
  var toast = $('toast'), toastTimer, toastQ = [], toastBusy = false;
  function achRow(a) {
    var got = !!found[a.id], hide = a.secret && !got;
    return '<div class="ach' + (got ? ' got' : '') + (a.final ? ' final' : '') + '"><img alt="" src="' + (a.final ? trophyPink : trophyGold) + '"><div><b>' + esc(hide ? '???' : a.t) + '</b><span>' + esc(hide ? 'Hint: ' + a.hint : a.d) + '</span></div><i>' + (got ? 'EARNED' : (a.secret ? 'SECRET' : 'TO DO')) + '</i></div>';
  }
  function achHTML() {
    var guide = ACH.filter(function (a) { return !a.secret && !a.final; }), secret = ACH.filter(function (a) { return a.secret; }), fin = ACH.filter(function (a) { return a.final; });
    return '<div class="ach-group"><span class="label">The guide · ' + guide.length + '</span>' + guide.map(achRow).join('') + '</div><div class="ach-group"><span class="label">Secrets · ' + secret.length + '</span>' + secret.map(achRow).join('') + fin.map(achRow).join('') + '</div>';
  }
  function renderAch() {
    var n = Object.keys(found).length;
    document.querySelectorAll('.ach-n').forEach(function (e) { e.textContent = n; });
    document.querySelectorAll('.ach-meter').forEach(function (e) { e.style.width = (n / ACH.length * 100) + '%'; });
    if (!$('drawer').hidden) $('ach-drawer').innerHTML = achHTML();
  }
  function showToast(item) {
    var a = item.a;
    toastBusy = true;
    $('toast-k').textContent = (a.final ? 'FINAL ACHIEVEMENT · ' : 'ACHIEVEMENT UNLOCKED · ') + item.n + '/21';
    $('toast-t').textContent = a.t;
    $('toast-d').textContent = a.final ? 'You found everything. Jesse is flattered and slightly concerned.' : a.d;
    $('trophy').src = a.final ? trophyPink : trophyGold;
    toast.classList.add('show');
    if (a.final) SFX.fanfare(); else SFX.achieve();
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove('show'); setTimeout(function () { toastBusy = false; if (toastQ.length) showToast(toastQ.shift()); }, 350); }, a.final ? 5000 : (toastQ.length ? 1600 : 2800));
  }
  function achieve(id) {
    if (found[id] || !ACHBY[id]) return;
    found[id] = true;
    var item = { a: ACHBY[id], n: Object.keys(found).length };
    if (toastBusy) toastQ.push(item); else showToast(item);
    if (!found.stalker && ACH.every(function (x) { return x.final || found[x.id]; })) { found.stalker = true; toastQ.push({ a: ACHBY.stalker, n: 21 }); }
    store('jt-ach', JSON.stringify(found));
    renderAch();
  }
  JT.ACH = ACH; JT.found = function () { return found; }; JT.achieve = achieve;
  renderAch();
  var drawer = $('drawer'), achbtn = $('achbtn');
  function setDrawer(open) { drawer.hidden = !open; achbtn.setAttribute('aria-expanded', String(open)); if (open) $('ach-drawer').innerHTML = achHTML(); }
  achbtn.addEventListener('click', function () { setDrawer(drawer.hidden); });
  $('drawer-x').addEventListener('click', function () { setDrawer(false); });

  /* ---------- page changes: chime + scan wipe in the new page's colour ---------- */
  function colourOf(href) {
    var m = PAGES.filter(function (p) { return href.indexOf('/' + p.id + '/') >= 0; })[0];
    return m ? 'var(--' + m.c + ')' : 'var(--violet)';
  }
  function go(href) {
    if (reduce) { location.href = href; return; }
    SFX.page();
    var w = document.createElement('div'); w.className = 'wipe out'; w.style.setProperty('--c', colourOf(new URL(href, location.href).pathname));
    document.body.appendChild(w);
    setTimeout(function () { location.href = href; }, 260);
  }
  JT.go = go;
  JT.goPage = function (id) { go(JT.url(id)); };
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href]');
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || a.target || a.hasAttribute('download')) return;
    var u = new URL(a.href, location.href);
    if (u.origin !== location.origin || u.hash && u.pathname === location.pathname) return;
    e.preventDefault(); go(a.href);
  });
  if (!reduce && JT.page !== 'home') {
    var w = document.createElement('div'); w.className = 'wipe in'; document.body.appendChild(w);
    setTimeout(function () { w.remove(); }, 700);
  }
  window.addEventListener('pageshow', function (e) { if (e.persisted) document.querySelectorAll('.wipe').forEach(function (x) { x.remove(); }); });

  /* F1 to F7 open the programs */
  document.addEventListener('keydown', function (e) {
    if (e.metaKey || e.ctrlKey || e.altKey || JT.blockKeys && JT.blockKeys()) return;
    var p = PAGES.filter(function (x) { return x.key === e.key; })[0];
    if (p) { e.preventDefault(); if (p.id !== JT.page || JT.sub) JT.goPage(p.id); }
  });

  /* ---------- headshot glitch (click it five times) ---------- */
  var hs = $('headshot');
  if (hs) {
    var hsClicks = 0, hsTimer;
    hs.addEventListener('click', function () {
      hsClicks += 1; clearTimeout(hsTimer); hsTimer = setTimeout(function () { hsClicks = 0; }, 1500);
      if (hsClicks >= 5) { hsClicks = 0; hs.classList.remove('glitch'); void hs.offsetWidth; hs.classList.add('glitch'); SFX.error(); achieve('glitch'); }
    });
  }

  /* ---------- konami: Commodore 64 colours ---------- */
  var KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'], kpos = 0;
  function setC64(v) { if (v) root.setAttribute('data-c64', ''); else root.removeAttribute('data-c64'); store('jt-c64', v ? '1' : ''); }
  if (store('jt-c64') === '1') root.setAttribute('data-c64', '');
  JT.setC64 = setC64;
  document.addEventListener('keydown', function (e) {
    if (inField(e)) return;
    var k = (e.key || '').length === 1 ? e.key.toLowerCase() : e.key;
    kpos = (k === KONAMI[kpos]) ? kpos + 1 : (k === KONAMI[0] ? 1 : 0);
    if (kpos === KONAMI.length) { kpos = 0; setC64(!root.hasAttribute('data-c64')); achieve('konami'); }
  });

  /* ---------- dot-matrix CV printer ---------- */
  var CV = [
    'JESSE DAVID THÉ',
    'Senior Product Manager · Harvard alum',
    'jessethe@alumni.harvard.edu',
    'Work authorization: CA · BR · PT + EU',
    '',
    '== EXPERIENCE ====================',
    '2018-2023  TAURIA (ACQUIRED)',
    '  Founder, CEO & Head of Product',
    '  Zero-knowledge encrypted Connect,',
    '  Lockbox, Cal and Calls.',
    '  Raised $5M. Team grew 4 -> 50+.',
    '2015-2018  ZEBU',
    '  Founder, CEO & Product Lead',
    '  Project Rebu (taxi), then Zebu ERP.',
    '',
    '== EDUCATION =====================',
    'HARVARD UNIVERSITY  2025',
    '  ALB Computer Science',
    '  Secondary in History',
    '  GPA 3.91 · Cum Laude · Dean\'s Award',
    'HBS ONLINE  Leadership & Management',
    'BERKELEY HAAS  Product Management',
    '  1st place, HBS case competition',
    '',
    '-- END OF PAGE 1 --'
  ];
  var prOv = $('printer-ov'), paper = $('paper'), paperWrap = $('paper-wrap'), prTimers = [], prReturn = null;
  function printCV() {
    prTimers.forEach(clearTimeout); prTimers = [];
    prReturn = document.activeElement;
    paper.textContent = ''; prOv.hidden = false; $('pr-close').focus({ preventScroll: true });
    achieve('cv');
    if (reduce) { paper.textContent = CV.join('\n'); return; }
    var out = '';
    CV.forEach(function (line, i) {
      prTimers.push(setTimeout(function () {
        out += (i ? '\n' : '') + line; paper.textContent = out; paperWrap.scrollTop = paperWrap.scrollHeight;
        if (line) SFX.print(Math.min(0.5, 0.06 + line.length * 0.012)); else SFX.feed();
      }, 250 + i * 150));
    });
  }
  function closePrinter() { prTimers.forEach(clearTimeout); prOv.hidden = true; if (prReturn && prReturn.focus) prReturn.focus({ preventScroll: true }); }
  JT.printCV = printCV;
  JT.printerOpen = function () { return !prOv.hidden; };
  $('pr-close').addEventListener('click', closePrinter);
  prOv.addEventListener('click', function (e) { if (e.target === prOv) closePrinter(); });
  $('pr-save').addEventListener('click', function () {
    var a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([CV.join('\n') + '\n'], { type: 'text/plain;charset=utf-8' }));
    a.download = 'jesse-the-cv.txt'; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
  });
  document.querySelectorAll('[data-cv]').forEach(function (b) { b.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); printCV(); }); });

  /* ---------- messages to Jesse: through /api/contact once it has a mail key, otherwise as an email draft ---------- */
  var MAILTO = 'jessethe@alumni.harvard.edu', bornAt = Date.now();
  JT.mailto = function (d) {
    return 'mailto:' + MAILTO + '?subject=' + encodeURIComponent((d.reason || 'Hello from jessethe.com') + ': ' + d.name) + '&body=' + encodeURIComponent(d.message + '\n\n' + d.name + ' <' + d.email + '>');
  };
  JT.sendMail = function (d) {
    var draft = { ok: true, via: 'mailto', href: JT.mailto(d) };
    if (!window.fetch || location.protocol === 'file:') return Promise.resolve(draft);
    return fetch(base + 'api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: d.name, email: d.email, reason: d.reason || '', message: d.message, website: d.website || '', t: Date.now() - bornAt }) })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { status: r.status, j: j }; }); })
      .then(function (x) {
        if (x.status === 200 && x.j.ok) return { ok: true, via: 'api' };
        if (x.status === 400 && x.j.error) return { ok: false, error: x.j.error };
        return draft;
      })
      .catch(function () { return draft; });
  };

  /* ---------- Escape closes overlays ---------- */
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (!prOv.hidden) closePrinter();
    else if (!drawer.hidden) { setDrawer(false); achbtn.focus(); }
  });
})();
