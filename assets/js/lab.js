/* The homepage lab: five takes on the front door, to compare before one of them replaces today's homepage.
   Shared here: the copy every take uses, the pixel icons, the zoom into a room and the terminal demo. */
(function () {
  var JT = window.JT, esc = JT.esc, reduce = JT.reduce;

  /* 16x16 pixel icons. '#' is the outline, letters come from each icon's palette, '.' is clear. */
  var ICONS = {
    id: { m: ["................","................",".##############.",".#wwwwwwwwwwww#.",".#w####wwwwwww#.",".#w#aa#w#####w#.",".#w#aa#wwwwwww#.",".#w#aa#w###www#.",".#w####wwwwwww#.",".#wwwwwwwwwwww#.",".#w##########w#.",".#wwwwwwwwwwww#.",".#w#######wwww#.",".#wwwwwwwwwwww#.",".##############.","................"], p: {"w": "#efeaf5", "a": "#a77bff"} },
    disk: { m: ["................",".#############..",".#kk#wwwww#kk##.",".#kk#ww#ww#kkk#.",".#kk#ww#ww#kkk#.",".#kk#wwwww#kkk#.",".#kkk#####kkkk#.",".#kkkkkkkkkkkk#.",".#kaaaaaaaaaak#.",".#kaWWWWWWWWak#.",".#kaW####WWWak#.",".#kaWWWWWWWWak#.",".#kaW#####WWak#.",".#kaWWWWWWWWak#.",".##############.","................"], p: {"k": "#3a3546", "w": "#c9c6d2", "a": "#ffb340", "W": "#efeaf5"} },
    cap: { m: ["................","................",".......##.......",".....##aa##.....","...##aaaaaa##...",".##aaaaaaaaaa##.","#aaaaaaaaaaaaaa#",".##aaaaaaaaaa##y","...##aaaaaa##.y.","....#a####a#..y.","....#aaaaaa#..y.","....#aaaaaa#.yyy",".....######..yyy","................","................","................"], p: {"a": "#59ff95", "y": "#ffb340"} },
    globe: { m: ["................","......####......","....###cc###....","...##ghccgg##...","..##gggccggg##..","..#gggccccgcc#..",".##cggcccgggg##.",".#cccggccggggc#.",".#ccccggccgggc#.",".##cccggccggc##.","..#cccgcccgcc#..","..##ccgcccgc##..","...##ccgccc##...","....###cc###....","......####......",".....######....."], p: {"c": "#1f6f8b", "g": "#59ff95", "h": "#5fe3e8"} },
    bowl: { m: ["................","................","...##......##...","..#ww#....#ww#..","...#wwwwwwww#...","..#ww#....#ww#..","...##......##...","................",".##############.","#aaaaaaaaaaaaaa#","#abbbbbbbbbbbba#",".#aaaaaaaaaaaa#.","..#aaaaaaaaaa#..","...##########...","................","................"], p: {"w": "#efe6da", "a": "#ff7a5c", "b": "#ffb39f"} },
    d20: { m: ["................","......###.......","....##b####.....","..##bbbbbbb##...","##bbbbbabbbbb#..","#bbbbbaaabbbb#..","#bbbbbawwbbbb#..","#bbbbawwaabbb#..","#bbbaaaaaaabb#..","#bbbaaaaaaabb#..","#bbaaaaaaaaab#..","##b#bbbbbbbb##..","..##bbbbbbb##...","....##bbb##.....","......###.......","................"], p: {"a": "#ff5fa8", "b": "#b8155a", "w": "#fff0f7"} },
    mail: { m: ["................","................","................",".##############.",".#w#wwwwwwww#w#.",".#ww#wwwwww#ww#.",".#www#wwww#www#.",".#wwww#rr#wwww#.",".#wwww#rr#wwww#.",".#www#w##w#www#.",".#ww#wwwwww#ww#.",".#w#wwwwwwww#w#.",".##############.","................","................","................"], p: {"w": "#efeaf5", "r": "#ff5fa8"} },
    adv: { m: ["................",".#############..",".#kk#wwwww#kk##.",".#kk#ww#ww#kkk#.",".#kk#wwwww#kkk#.",".#kkk#####kkkk#.",".#kkkkkkkkkkkk#.",".#kggggggg###k#.",".#kgWWWWW#...#..",".#kgWWWWW#...#..",".#kgWWWW#######.",".#kgWWWW#ggggg#.",".#kgWWWW#gg#gg#.",".#kgWWWW#gg#gg#.",".########ggggg#.",".........######."], p: {"k": "#3a3546", "w": "#c9c6d2", "g": "#59ff95", "W": "#efeaf5"} },
    bin: { m: ["................","......####......",".....#....#.....","..############..","..#ssssssssss#..","..############..","...#s#s#s#s#s...","...#s#s#s#s#s...","...#s#s#s#s#s...","...#s#s#s#s#s...","...#s#s#s#s#s...","...#s#s#s#s#s...","...#s#s#s#s#s...","...##########...","................","................"], p: {"s": "#aaa5b8"} },
    term: { m: ["................",".##############.",".#kkkkkkkkkkkk#.",".#kgkkkkkkkkkk#.",".#kkgkkkkkkkkk#.",".#kkkgkkkkkkkk#.",".#kkgkkkkkkkkk#.",".#kgkkkggggkkk#.",".#kkkkkkkkkkkk#.",".##############.","......#ss#......",".....##ss##.....","...##########...","...#ssssssss#...","...##########...","................"], p: {"k": "#040806", "g": "#59ff95", "s": "#aaa5b8"} },
    cv: { m: ["................","....########....","....#wwwwww#....","....#w####w#....","....#wwwwww#....",".##############.","#ssssssssssssss#","#ssssssssssagss#","#ssssssssssssss#","#s############s#","#s#wwwwwwwwww#s#","##w###wwwwwww###","..#wwwwwwwwww#..","..#w####wwwww#..","..#wwwwwwwwww#..","..############.."], p: {"w": "#efeaf5", "s": "#aaa5b8", "a": "#ffb340", "g": "#59ff95"} }
  };
  function icon(name, size) {
    var ic = ICONS[name]; if (!ic) return '';
    var r = '';
    ic.m.forEach(function (row, y) {
      for (var x = 0; x < 16;) {
        var ch = row[x], n = 1;
        if (ch === '.') { x++; continue; }
        while (x + n < 16 && row[x + n] === ch) n++;
        r += '<rect x="' + x + '" y="' + y + '" width="' + n + '" height="1" fill="' + (ch === '#' ? '#141018' : ic.p[ch]) + '"/>';
        x += n;
      }
    });
    return '<svg class="px-ico" viewBox="0 0 16 16" width="' + (size || 48) + '" height="' + (size || 48) + '" shape-rendering="crispEdges" aria-hidden="true" focusable="false">' + r + '</svg>';
  }
  /* any element with data-icon="globe" gets that icon drawn inside it */
  document.querySelectorAll('[data-icon]').forEach(function (el) { el.insertAdjacentHTML('afterbegin', icon(el.getAttribute('data-icon'), +el.getAttribute('data-size') || 48)); });

  /* the rooms, as doors: the file name a desktop would show, the icon and the line under it */
  var EXTRA = {
    about: { file: 'ABOUT.ME', icon: 'id', hover: 'The person behind the boot screen' },
    work: { file: 'WORK/', icon: 'disk', hover: 'Six products, one exit' },
    education: { file: 'SCHOOL/', icon: 'cap', hover: 'Harvard, HBS, Berkeley Haas, MIT' },
    travel: { file: 'TRAVEL.MAP', icon: 'globe', hover: 'Thirteen homes, one flight path' },
    rescue: { file: 'RESCUE/', icon: 'bowl', hover: 'Meet Pidan and Doufu' },
    hobbies: { file: 'HOBBIES/', icon: 'd20', hover: 'Dives, boulders and a lot of dice' },
    contact: { file: 'MAIL', icon: 'mail', hover: 'Say hi' }
  };
  var ROOMS = JT.PAGES.map(function (p) {
    var r = {}, k; for (k in p) r[k] = p[k]; for (k in EXTRA[p.id]) r[k] = EXTRA[p.id][k];
    r.href = JT.url(p.id); return r;
  });
  ROOMS.push({ id: 'adventure', key: '', name: 'Adventure', c: 'green', inv: 'play the adventure', file: 'ENCRYPTED_CV.ADV', icon: 'adv', hover: 'A text adventure. Bring snacks.', href: JT.url('adventure') });

  /* the words every take shares, so they can be compared on looks alone */
  var COPY = {
    bio: ['Canadian, Brazilian, Portuguese, now in Shanghai.', 'Sold a company, went back to Harvard.', 'Builds products people can trust.', 'Travels with Player 2 and two rescue dogs.'],
    intro: 'I build products people can trust: two startups, six products, one exit. Since Harvard I\'ve been reading, building side projects and travelling with Player 2 and our two rescue dogs. Next, I want to help build something cool or useful.',
    next: 'A Senior Product Manager role or product consulting, on something cool or useful. Remote is great, and so is anywhere in the world.',
    motto: 'Earn the trust. Then earn the attention.',
    now: JT.NOW,
    updated: 'Updated ' + JT.NOW_UPDATED
  };
  function nowHTML(n) {
    return '<dl class="nowlist">' + COPY.now.slice(0, n || COPY.now.length).map(function (r) {
      return '<div><dt>' + esc(r[0]) + '</dt><dd>' + (r[0] === 'Living in' ? '<img class="flag" src="' + JT.base + 'assets/img/flag-cn.png" alt="" width="20" height="15">' : '') + esc(r[1]) + '</dd></div>';
    }).join('') + '</dl>';
  }

  /* open a room by zooming a frame out of the thing that was clicked, in the room's colour */
  function zoomTo(from, href, c) {
    if (reduce || !from || !from.getBoundingClientRect) { JT.go(href); return; }
    var r = from.getBoundingClientRect(), z = document.createElement('div');
    z.className = 'zoomrect'; z.style.setProperty('--c', 'var(--' + (c || 'violet') + ')');
    z.style.left = r.left + 'px'; z.style.top = r.top + 'px'; z.style.width = r.width + 'px'; z.style.height = r.height + 'px';
    document.body.appendChild(z);
    JT.SFX.page();
    requestAnimationFrame(function () { requestAnimationFrame(function () { z.classList.add('go'); }); });
    setTimeout(function () { location.href = href; }, 340);
  }
  window.addEventListener('pageshow', function (e) { if (e.persisted) document.querySelectorAll('.zoomrect').forEach(function (x) { x.remove(); }); });
  /* links marked data-zoom open with the zoom instead of the usual page wipe */
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[data-zoom]');
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault(); e.stopPropagation(); zoomTo(a.querySelector('[data-zoom-from]') || a, a.href, a.getAttribute('data-zoom'));
  }, true);

  /* run fn once the boot has finished (or straight away when there was no boot) */
  function whenBooted(fn) {
    if (JT.booted || !document.getElementById('boot')) { fn(); return; }
    document.addEventListener('jt:booted', function once() { document.removeEventListener('jt:booted', once); fn(); });
  }

  /* the terminal demo: mount the real terminal in host, type a couple of commands the first time
     this tab sees a homepage, then hand over the keyboard */
  function invite() {
    JT.termPrint('<span class="d">your turn. try:</span> ' + ['help', 'roll d20', 'doufu loose', 'tour'].map(function (c) { return JT.termLink(c); }).join(' <span class="d">·</span> '));
  }
  function demo(host, cmds) {
    if (!host.classList.contains('console-host')) JT.termMount(host);
    cmds = cmds || ['whoami', 'ls'];
    var played = false; try { played = sessionStorage.getItem('jt-demo') === '1'; sessionStorage.setItem('jt-demo', '1'); } catch (e) {}
    JT.termClear();
    if (played || reduce) { cmds.forEach(function (c) { JT.termRun(c); }); invite(); return; }
    var i = 0;
    (function next() {
      if (i >= cmds.length || !JT.termIdle()) { invite(); return; }
      JT.termType(cmds[i++], function () { setTimeout(next, 650); });
    })();
  }

  JT.LAB = { icon: icon, ROOMS: ROOMS, COPY: COPY, nowHTML: nowHTML, zoomTo: zoomTo, whenBooted: whenBooted, demo: demo };
})();
