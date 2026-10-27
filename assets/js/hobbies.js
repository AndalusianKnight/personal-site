/* Hobbies: the shelf (with a Stargate that dials), the d20 and Ajax's sheet, the dive gauge,
   the boulder problem and the console collection. The shelf's text lives in #favs in the page;
   this file only paints the covers. */
(function () {
  var JT = window.JT, SFX = JT.SFX, reduce = JT.reduce, esc = JT.esc, PX = JT.PX;
  function $(id) { return document.getElementById(id); }
  var spr = PX.spr, clamp = PX.clamp, mkStage = PX.mkStage;

  /* ---------- d20 and Ajax's sheet ---------- */
  var d20n = $('d20n'), sheet = $('sheet'), d20out = $('d20-out'), rolls = 0, rolling = false, ajaxTrue = false;
  function showSheet(scroll) {
    if (!sheet || !sheet.hidden) return;
    sheet.hidden = false;
    if (scroll) sheet.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'nearest' });
  }
  function rollD20() {
    if (rolling) return; rolling = true; rolls += 1;
    var n = Math.floor(Math.random() * 20) + 1, i = 0;
    if (rolls % 4 === 0) n = 20;
    (function spin() {
      d20n.textContent = String(Math.floor(Math.random() * 20) + 1); SFX.blip();
      if (++i < (reduce ? 1 : 10)) { setTimeout(spin, 50 + i * 12); return; }
      d20n.textContent = String(n); rolling = false;
      if (n === 20) {
        d20out.textContent = 'Natural 20! Ajax\'s sheet is unlocked.'; SFX.fanfare();
        JT.store('jt-sheet', '1'); JT.achieve('nat20'); showSheet(true);
      } else if (n === 1) { d20out.textContent = 'A 1. Critical fail. The DM sighs.'; SFX.error(); }
      else d20out.textContent = 'You rolled ' + n + '. ' + (n > 14 ? 'Close. Roll again?' : 'Roll again?');
    })();
  }
  if ($('d20')) $('d20').addEventListener('click', rollD20);
  /* rolled a 20 before (here or in the terminal)? the sheet stays unlocked */
  if (sheet && JT.store('jt-sheet') === '1') showSheet(false);
  if ($('ajax-reveal')) $('ajax-reveal').addEventListener('click', function () {
    ajaxTrue = !ajaxTrue; var r = $('ajax-race'), b = this;
    r.classList.remove('shift'); void r.offsetWidth; r.classList.add('shift'); SFX.error();
    setTimeout(function () { r.textContent = ajaxTrue ? 'Changeling (true form)' : 'Astral elf'; }, 250);
    b.textContent = ajaxTrue ? 'Resume disguise' : 'Reveal true form';
  });

  /* ---------- the shelf ---------- */
  (function () {
    var favs = $('favs'), shelf = $('shelf'), info = $('info'), tabs = $('shelf-tabs'); if (!favs || !shelf) return;
    function gate(id, ring, chev, stops, n) {
      var s = '<defs><radialGradient id="' + id + '" cx="50%" cy="50%" r="50%">' + stops.map(function (c, i) { return '<stop offset="' + [0, 0.35, 1][i] + '" stop-color="' + c + '"/>'; }).join('') + '</radialGradient></defs><g transform="translate(100 140)"><circle r="70" fill="none" stroke="' + ring + '" stroke-width="16"/><circle r="70" fill="none" stroke="#2c2a36" stroke-width="2" stroke-dasharray="3 5"/><circle class="eh" r="58" fill="url(#' + id + ')"/><g fill="' + chev + '">';
      for (var i = 0; i < n; i++) s += '<polygon class="chev" data-i="' + i + '" transform="rotate(' + (i * 360 / n) + ')" points="-7,-82 7,-82 0,-70"/>';
      return s + '</g></g>';
    }
    function stars(list) { return list.map(function (p) { return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="1" fill="#e8f0ff"/>'; }).join(''); }
    function laurel() {
      var s = '';
      for (var side = -1; side <= 1; side += 2) for (var i = 0; i < 8; i++) {
        var deg = 90 - side * (16 + i * 17), a = deg * Math.PI / 180, x = 100 + 48 * Math.cos(a), y = 132 + 48 * Math.sin(a);
        s += '<ellipse cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" rx="9" ry="3.6" fill="#d9b25f" transform="rotate(' + (deg + 90 + side * 30).toFixed(0) + ' ' + x.toFixed(1) + ' ' + y.toFixed(1) + ')"/>';
      }
      return s + '<path d="M93,182 Q100,176 107,182" stroke="#d9b25f" stroke-width="2" fill="none"/>';
    }
    var D20 = '<g transform="translate(55 90) scale(.9)" fill="none" stroke="#f0d28a" stroke-width="3" stroke-linejoin="round"><polygon points="50,4 91,27 91,73 50,96 9,73 9,27"/><polygon points="50,26 76,68 24,68"/><path d="M50,4 L50,26 M91,27 L76,68 M91,73 L76,68 M50,96 L76,68 M50,96 L24,68 M9,73 L24,68 M9,27 L24,68 M9,27 L50,26 M91,27 L50,26"/></g>';
    var MOTIF = {
      sg1: gate('eh1', '#5a5866', '#ff8a3d', ['#d8f6ff', '#5fb8ff', '#123a8a'], 9),
      atlantis: gate('eh2', '#3f5f66', '#7ef0ff', ['#e8fffb', '#5fe3e8', '#0d4d5a'], 9) + '<g fill="#0b1f2a" opacity=".9"><rect x="70" y="190" width="10" height="26"/><rect x="84" y="176" width="12" height="40"/><rect x="100" y="166" width="10" height="50"/><rect x="114" y="182" width="12" height="34"/></g>',
      irongiant: stars([[30, 40], [160, 54], [140, 30], [52, 210], [170, 200]]) + '<rect x="48" y="74" width="104" height="116" rx="46" fill="#3a4250"/><rect x="48" y="150" width="104" height="40" fill="#2c323c"/><circle cx="80" cy="128" r="26" fill="#fff4b8" opacity=".18"/><circle cx="120" cy="128" r="26" fill="#fff4b8" opacity=".18"/><circle cx="80" cy="128" r="14" fill="#fff4b8"/><circle cx="120" cy="128" r="14" fill="#fff4b8"/>',
      shrek: '<circle cx="100" cy="142" r="46" fill="#9cc74a"/><path d="M58,124 L36,106 L46,136 Z" fill="#9cc74a"/><path d="M142,124 L164,106 L154,136 Z" fill="#9cc74a"/><circle cx="84" cy="136" r="5" fill="#2b2b16"/><circle cx="116" cy="136" r="5" fill="#2b2b16"/><path d="M80,160 Q100,176 120,160" stroke="#2b2b16" stroke-width="4" fill="none" stroke-linecap="round"/>',
      halo3: stars([[30, 40], [160, 30], [120, 80], [40, 200], [170, 190], [90, 60], [60, 110]]) + '<defs><radialGradient id="pl" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="#7bd6a0"/><stop offset="1" stop-color="#0b3a2a"/></radialGradient></defs><circle cx="100" cy="150" r="46" fill="url(#pl)"/><ellipse cx="100" cy="150" rx="86" ry="18" fill="none" stroke="#e8c36a" stroke-width="5" transform="rotate(-14 100 150)"/>',
      civ4: '<circle cx="100" cy="138" r="54" fill="#1d4f7c"/><path d="M70,110 q14,-10 26,0 q6,14 -8,20 q-16,4 -18,-20z M108,140 q20,-6 26,8 q-4,20 -22,16 q-10,-8 -4,-24z" fill="#3f8f5a"/><ellipse cx="100" cy="138" rx="54" ry="18" fill="none" stroke="#8fc3e8" stroke-opacity=".45"/><ellipse cx="100" cy="138" rx="22" ry="54" fill="none" stroke="#8fc3e8" stroke-opacity=".45"/><text x="100" y="156" text-anchor="middle" font-family="Chakra Petch, sans-serif" font-weight="700" font-size="50" fill="#e9c46a" stroke="#3a2a08" stroke-width="2">IV</text>',
      aom: '<g stroke="#ffd36a" stroke-opacity=".35" stroke-width="2">' + [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(function (a) { return '<line x1="100" y1="140" x2="' + (100 + 80 * Math.cos(a * Math.PI / 180)).toFixed(1) + '" y2="' + (140 + 80 * Math.sin(a * Math.PI / 180)).toFixed(1) + '"/>'; }).join('') + '</g><path d="M114,70 L78,148 L102,148 L86,214 L132,128 L106,128 Z" fill="#ffd36a" stroke="#7a4a00" stroke-width="2"/>',
      dnd: '<text x="100" y="186" text-anchor="middle" font-family="Georgia, serif" font-size="150" fill="#e8c26a" stroke="#5a0d0d" stroke-width="3">&amp;</text>',
      jobs: '<line x1="40" y1="96" x2="160" y2="96" stroke="#1b1b1b" stroke-width="1"/><text x="100" y="150" text-anchor="middle" font-family="IBM Plex Sans, sans-serif" font-weight="600" font-size="34" fill="#151515" letter-spacing="2">STEVE</text><text x="100" y="186" text-anchor="middle" font-family="IBM Plex Sans, sans-serif" font-weight="600" font-size="34" fill="#151515" letter-spacing="2">JOBS</text><line x1="40" y1="206" x2="160" y2="206" stroke="#1b1b1b" stroke-width="1"/>',
      meditations: laurel() + '<text x="100" y="144" text-anchor="middle" font-family="Georgia, serif" font-size="30" fill="#d9b25f">XII</text>',
      threebody: '<ellipse cx="100" cy="135" rx="66" ry="24" fill="none" stroke="#ff9a3d" stroke-opacity=".35" transform="rotate(-20 100 135)"/><ellipse cx="100" cy="135" rx="54" ry="30" fill="none" stroke="#ff9a3d" stroke-opacity=".25" transform="rotate(35 100 135)"/><circle cx="58" cy="120" r="22" fill="#ff9a3d" opacity=".18"/><circle cx="58" cy="120" r="12" fill="#ffb86b"/><circle cx="140" cy="108" r="18" fill="#ff9a3d" opacity=".18"/><circle cx="140" cy="108" r="9" fill="#ffd08a"/><circle cx="112" cy="170" r="16" fill="#ff9a3d" opacity=".18"/><circle cx="112" cy="170" r="8" fill="#ffc27a"/><circle cx="96" cy="140" r="3" fill="#8fd0ff"/>',
      dmg: D20
    };
    /* the art for each cover; the words come from the page */
    var ART = {
      jobs: { kind: 'book', c1: '#f4f2ee', c2: '#e6e2da', fg: '#151515', title: ['WALTER ISAACSON'], fs: 12, sub: 'BIOGRAPHY · 2011', sub2: '#555', file: 'BOOK_01.TXT' },
      meditations: { kind: 'book', c1: '#2a1e14', c2: '#120c08', fg: '#e9d8b0', title: ['MEDITATIONS'], fs: 22, sub: 'MARCUS AURELIUS', sub2: '#c9a868', file: 'BOOK_02.TXT' },
      threebody: { kind: 'book', c1: '#050407', c2: '#1a0d05', fg: '#ffd08a', title: ['THE THREE-', 'BODY PROBLEM'], fs: 19, sub: 'LIU CIXIN', sub2: '#c9a070', file: 'BOOK_03.TXT' },
      dmg: { kind: 'book', c1: '#3a1206', c2: '#160603', fg: '#f0d28a', title: ['DUNGEON', 'MASTER\'S GUIDE'], fs: 19, sub: 'WIZARDS OF THE COAST', sub2: '#c9a070', file: 'BOOK_04.TXT' },
      sg1: { kind: 'vhs', band: 'VHS', c1: '#05070f', c2: '#0b1430', title: ['STARGATE SG·1'], fs: 24, sub: '1997 – 2007 · 10 SEASONS', file: 'SHOW_01.TXT', egg: 7 },
      atlantis: { kind: 'vhs', band: 'VHS', c1: '#041015', c2: '#0b2a33', title: ['STARGATE', 'ATLANTIS'], fs: 22, sub: '2004 – 2009 · 5 SEASONS', file: 'SHOW_02.TXT', egg: 8 },
      irongiant: { kind: 'vhs', band: 'VHS', c1: '#0a1426', c2: '#1b2b4a', title: ['THE IRON', 'GIANT'], fs: 24, sub: '1999 · WARNER BROS.', file: 'FILM_01.TXT' },
      shrek: { kind: 'vhs', band: 'VHS', c1: '#1d2a0c', c2: '#3c5216', title: ['SHREK'], fs: 34, sub: '2001 · DREAMWORKS', file: 'FILM_02.TXT' },
      halo3: { kind: 'game', band: 'XBOX 360', c1: '#0c1a14', c2: '#02070a', title: ['HALO 3'], fs: 34, sub: 'BUNGIE · 2007', file: 'GAME_01.TXT' },
      civ4: { kind: 'game', band: 'PC CD-ROM', c1: '#2b1d0a', c2: '#0e1b2b', title: ['CIVILIZATION'], fs: 21, sub: 'FIRAXIS · 2005', file: 'GAME_02.TXT' },
      aom: { kind: 'game', band: 'PC CD-ROM', c1: '#3a0d0d', c2: '#120a2a', title: ['AGE OF', 'MYTHOLOGY'], fs: 21, sub: 'ENSEMBLE · 2002', file: 'GAME_03.TXT' },
      dnd: { kind: 'game', band: 'TABLETOP', c1: '#5a0d0d', c2: '#1a0505', title: ['DUNGEONS', '&amp; DRAGONS'], fs: 21, sub: 'SINCE 1974', file: 'GAME_04.TXT', egg: 'd20' }
    };
    function caseSVG(id, o) {
      var book = o.kind === 'book', bg = 'g-' + id;
      var band = book ? '<rect width="14" height="300" fill="rgba(0,0,0,.35)"/><rect x="14" width="2" height="300" fill="rgba(255,255,255,.12)"/>'
        : '<rect width="200" height="26" fill="#0b0a0f"/><text x="190" y="18" text-anchor="end" font-family="Space Mono, monospace" font-size="11" fill="#fff" letter-spacing="2">' + o.band + '</text>';
      var fs = o.fs || 24, y = 246 - (o.title.length - 1) * (fs + 2);
      var title = o.title.map(function (l, i) { return '<text x="' + (book ? 107 : 100) + '" y="' + (y + i * (fs + 2)) + '" text-anchor="middle" font-family="Chakra Petch, sans-serif" font-weight="700" font-size="' + fs + '" fill="' + (o.fg || '#fff') + '" letter-spacing="1">' + l + '</text>'; }).join('');
      return '<svg viewBox="0 0 200 300" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs><linearGradient id="' + bg + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + o.c1 + '"/><stop offset="1" stop-color="' + o.c2 + '"/></linearGradient></defs><rect width="200" height="300" fill="url(#' + bg + ')"/>' + MOTIF[id] + band + title +
        '<text x="' + (book ? 107 : 100) + '" y="276" text-anchor="middle" font-family="Space Mono, monospace" font-size="9" fill="' + (o.sub2 || '#c9c3d6') + '" letter-spacing="2">' + o.sub + '</text></svg>';
    }
    var SHELF = {};
    [].forEach.call(favs.querySelectorAll('section'), function (sec) {
      SHELF[sec.getAttribute('data-kind')] = [].map.call(sec.querySelectorAll('li'), function (li) {
        var id = li.getAttribute('data-id'), ps = li.querySelectorAll('p');
        return { id: id, art: ART[id], t: li.querySelector('b').textContent, meta: li.querySelector('.meta').textContent, desc: ps[0].textContent, take: ps[1].textContent };
      });
    });
    function setInfo(it, extra) {
      info.innerHTML = '<span class="fname">' + it.art.file + '</span><h3>' + esc(it.t) + '</h3><span class="meta">' + esc(it.meta) + '</span><p>' + esc(it.desc) + '</p><p class="take"><span>My take</span>' + esc(it.take) + '</p>' + (extra || '');
    }
    /* the Stargate dials: chevrons lock in the order the show uses, the master chevron at the top last */
    var gateBusy = false, NUM = ['ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT'], ORDER = { 7: [1, 2, 3, 6, 7, 8, 0], 8: [1, 2, 3, 6, 7, 8, 4, 0] };
    function dial(cover, total) {
      if (gateBusy) return; gateBusy = true;
      var chevs = cover.querySelectorAll('.chev'), order = ORDER[total], n = 0, log = document.createElement('p');
      log.className = 'dial'; info.appendChild(log);
      [].forEach.call(chevs, function (c) { c.classList.remove('lit'); });
      cover.classList.remove('kawoosh');
      (function lock() {
        var c = chevs[order[n]]; n += 1;
        if (c) c.classList.add('lit');
        SFX.chevron(); log.textContent = 'CHEVRON ' + NUM[n - 1] + (n === total ? ' LOCKED' : ' ENCODED');
        if (n < total) { setTimeout(lock, reduce ? 60 : 420); return; }
        setTimeout(function () {
          SFX.kawoosh(); cover.classList.add('kawoosh'); log.textContent = '*KAWOOSH* Wormhole established.' + (total === 8 ? ' Hello, Pegasus.' : '');
          gateBusy = false; JT.achieve('gate');
          setTimeout(function () { [].forEach.call(chevs, function (c) { c.classList.remove('lit'); }); cover.classList.remove('kawoosh'); }, 3800);
        }, reduce ? 100 : 600);
      })();
    }
    function fill(k) {
      shelf.innerHTML = '';
      SHELF[k].forEach(function (it, i) {
        var b = document.createElement('button'); b.type = 'button'; b.className = 'cover' + (it.art.kind === 'book' ? ' book' : '');
        b.setAttribute('aria-pressed', String(i === 0)); b.setAttribute('aria-label', it.t);
        b.innerHTML = caseSVG(it.id, it.art);
        b.addEventListener('click', function () {
          var again = b.getAttribute('aria-pressed') === 'true' && b.dataset.seen === '1'; b.dataset.seen = '1';
          shelf.querySelectorAll('.cover').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
          setInfo(it); JT.achieve('shelf'); SFX.page();
          if (again && typeof it.art.egg === 'number') dial(b, it.art.egg);
          else if (again && it.art.egg === 'd20') { rollD20(); info.insertAdjacentHTML('beforeend', '<p class="dial">The d20 is rolling, further down the page.</p>'); }
        });
        shelf.appendChild(b);
      });
      setInfo(SHELF[k][0]);
    }
    var tabBtns = [].slice.call(tabs.querySelectorAll('button'));
    function pick(t, focus) {
      tabBtns.forEach(function (x) { var on = x === t; x.setAttribute('aria-selected', String(on)); x.tabIndex = on ? 0 : -1; });
      $('shelf-panel').setAttribute('aria-labelledby', t.id);
      if (focus) t.focus();
      fill(t.getAttribute('data-k'));
    }
    tabBtns.forEach(function (t, i) {
      t.addEventListener('click', function () { pick(t); });
      t.addEventListener('keydown', function (e) {
        var j = e.key === 'ArrowRight' ? i + 1 : e.key === 'ArrowLeft' ? i - 1 : e.key === 'Home' ? 0 : e.key === 'End' ? tabBtns.length - 1 : null;
        if (j === null) return; e.preventDefault(); pick(tabBtns[(j + tabBtns.length) % tabBtns.length], true);
      });
    });
    favs.hidden = true; tabs.hidden = false; $('shelf-panel').hidden = false;
    fill('books');
  })();

  /* ---------- the dive gauge ---------- */
  (function () {
    var cv = $('dive-cv'); if (!cv) return;
    var r = $('dive-r'), dOut = $('dive-d'), pOut = $('dive-p'), nOut = $('dive-n'), msg = $('dive-msg');
    var st = mkStage(cv), depth = 0, target = 0, fish = [], bubbles = [], lastMsg = '', bt = 0, lastB = 0, deep = false;
    for (var i = 0; i < 10; i++) fish.push({ x: Math.random(), d: 6 + Math.random() * 11, v: (Math.random() < 0.5 ? -1 : 1) * (0.03 + Math.random() * 0.05), c: ['#ffb340', '#5fe3e8', '#ff7a5c', '#a77bff', '#59ff95'][i % 5] });
    var FISH = ['.cc.c', 'ccccc', '.cc.c'];
    var DIVER = ['......tttttt......', 'ff...bbbbbbbbsmm..', 'ffffbbbbbbbbbbsmm.', 'ff...bbbbbbbbbs...', '.........bb.bb....'];
    var DP = { t: '#ffb340', b: '#1d2733', f: '#a77bff', s: '#e7c9a8', m: '#5fe3e8' };
    function setT(v) { target = clamp(v, 0, 18); r.value = target.toFixed(1); }
    r.addEventListener('input', function () { target = parseFloat(r.value) || 0; });
    var dragY = null, startT = 0;
    cv.addEventListener('pointerdown', function (e) { dragY = e.clientY; startT = target; try { cv.setPointerCapture(e.pointerId); } catch (x) {} });
    cv.addEventListener('pointermove', function (e) { if (dragY == null) return; setT(startT + (e.clientY - dragY) / (st.H / 14)); });
    cv.addEventListener('pointerup', function () { dragY = null; });
    cv.addEventListener('pointercancel', function () { dragY = null; });
    /* no-stop limits from the recreational dive planner table, in minutes */
    var NDL = [[10, 219], [12, 147], [14, 98], [16, 72], [18, 56]];
    function ndl(d) { if (d < 9.5) return '—'; for (var k = 0; k < NDL.length; k++) if (d <= NDL[k][0] + 0.05) return NDL[k][1] + ' min'; return '56 min'; }
    function say(d) {
      if (d < 0.4) return 'At the surface. Mask on, regulator in. Drag down in the water to descend.';
      if (d < 3) return 'Just under. Equalise your ears every metre or so.';
      if (d < 6) return 'About 5 m. This is where the safety stop happens on the way back up.';
      if (d < 10) return 'Red is the first colour to fade. Everything is turning blue-green.';
      if (d < 15) return 'Past 10 m, twice the pressure of the surface. A school of fish drifts by.';
      if (d < 17.8) return 'The reef opens up below. Keep an eye on your air.';
      return '18 m, the Open Water limit. Time to turn around.';
    }
    function mix(a, b, k) { return 'rgb(' + Math.round(a[0] + (b[0] - a[0]) * k) + ',' + Math.round(a[1] + (b[1] - a[1]) * k) + ',' + Math.round(a[2] + (b[2] - a[2]) * k) + ')'; }
    st.loop(function (dt, now) {
      var prev = depth; depth += (target - depth) * Math.min(1, dt * 3); if (Math.abs(target - depth) < 0.01) depth = target;
      var g = st.g, W = st.W, H = st.H, k = depth / 18, s = W > 360 ? 5 : 4, px = H / 10;
      var grd = g.createLinearGradient(0, 0, 0, H);
      grd.addColorStop(0, mix([64, 196, 214], [10, 48, 86], Math.min(1, k * 1.15))); grd.addColorStop(1, mix([14, 86, 128], [3, 14, 32], k));
      g.fillStyle = grd; g.fillRect(0, 0, W, H);
      var surf = H * 0.22 - depth * px;
      if (surf > -10) {
        g.fillStyle = 'rgba(220,250,255,.75)'; for (var x = 0; x < W; x += 6) g.fillRect(x, surf + Math.sin(x * 0.08 + now / 400) * 2, 4, 2);
        g.fillStyle = 'rgba(255,255,255,.06)'; for (var ray = 0; ray < 5; ray++) { g.beginPath(); var rx = (ray * W / 4 + now / 60) % (W + 80) - 40; g.moveTo(rx, surf); g.lineTo(rx + 30, surf); g.lineTo(rx + 90, H); g.lineTo(rx + 40, H); g.closePath(); g.fill(); }
      }
      var floorY = H / 2 + (19.8 - depth) * px;
      if (floorY < H) {
        g.fillStyle = mix([200, 180, 138], [96, 108, 104], Math.min(1, k)); g.beginPath(); g.moveTo(0, H); for (var sx = 0; sx <= W; sx += 8) g.lineTo(sx, floorY + Math.sin(sx * 0.03) * 4); g.lineTo(W, H); g.closePath(); g.fill();
        g.fillStyle = 'rgba(0,0,0,.12)'; for (var sd = 0; sd < W; sd += 23) g.fillRect(sd, floorY + 10 + (sd * 7) % 30, 2, 2);
        g.fillStyle = '#4a5560'; g.fillRect(W * 0.86, floorY - 8, 18, 10); g.fillRect(W * 0.86 + 4, floorY - 12, 10, 4);
        g.fillStyle = '#ff7a5c'; g.fillRect(W * 0.15, floorY - 14, 6, 14); g.fillRect(W * 0.15 - 6, floorY - 10, 6, 4); g.fillRect(W * 0.15 + 6, floorY - 8, 6, 4);
        g.fillStyle = '#a77bff'; g.fillRect(W * 0.72, floorY - 18, 5, 18); g.fillRect(W * 0.72 + 5, floorY - 12, 6, 4);
        g.fillStyle = '#59ff95'; for (var w2 = 0; w2 < 4; w2++) g.fillRect(W * 0.4 + w2 * 10, floorY - 10 - Math.sin(now / 500 + w2) * 3, 3, 10);
      }
      fish.forEach(function (f) {
        f.x += f.v * dt; if (f.x > 1.1) f.x = -0.1; if (f.x < -0.1) f.x = 1.1;
        var fy = H / 2 + (f.d - depth) * px; if (fy < surf + 10 || fy > H + 10 || fy < -10) return;
        spr(g, FISH, f.x * W, fy, 3, { c: f.c }, f.v < 0);
      });
      var dx = W / 2 - 9 * s, dy = H / 2 - 2 * s + Math.sin(now / 700) * 3;
      spr(g, DIVER, dx, dy, s, DP);
      bt += dt; if (bt > 0.5) { bt = 0; bubbles.push({ x: dx + 16 * s, y: dy, r: 2 + Math.random() * 2 }); }
      g.strokeStyle = 'rgba(230,250,255,.7)'; g.lineWidth = 1;
      bubbles = bubbles.filter(function (b) { b.y -= 40 * dt; b.x += Math.sin(b.y / 10) * 0.3; g.beginPath(); g.arc(b.x, b.y, b.r, 0, Math.PI * 2); g.stroke(); return b.y > Math.max(0, surf); });
      g.font = '10px "Space Mono", monospace'; g.fillStyle = 'rgba(239,234,245,.75)'; g.fillText(depth.toFixed(1) + ' M', 10, 18);
      if (Math.abs(depth - prev) > 0.02 && now - lastB > 380) { lastB = now; SFX.bubble(); }
      dOut.textContent = depth.toFixed(1); pOut.textContent = (1 + depth / 10).toFixed(1); nOut.textContent = ndl(depth);
      var m = say(depth); if (m !== lastMsg) { msg.textContent = m; lastMsg = m; }
      if (depth >= 17.9 && !deep) { deep = true; SFX.chime(); }
      if (depth < 15) deep = false;
    });
  })();

  /* ---------- the boulder problem ---------- */
  (function () {
    var cv = $('cl-cv'); if (!cv) return;
    var st = mkStage(cv), msg = $('cl-msg');
    var ROUTE = [[0.30, 0.86], [0.50, 0.72], [0.36, 0.57], [0.58, 0.43], [0.44, 0.28], [0.60, 0.12]];
    var OTHER = [[0.14, 0.70, '#ff5fa8'], [0.82, 0.80, '#5fe3e8'], [0.76, 0.55, '#ff5fa8'], [0.20, 0.40, '#5fe3e8'], [0.86, 0.30, '#59ff95'], [0.24, 0.15, '#59ff95'], [0.70, 0.66, '#59ff95'], [0.12, 0.90, '#5fe3e8'], [0.84, 0.10, '#ff5fa8']];
    var CL = ['s.....s', '.s...s.', '..sks..', '..ccc..', '.ccccc.', '..ccc..', '..ppp..', '..p.p..', '.pp.pp.', '.bb.bb.'];
    var CP = { s: '#e7c9a8', k: '#2a1d10', c: '#a77bff', p: '#5b7bd5', b: '#efeaf5' };
    var START = JT.touch ? 'Tap the amber holds from the bottom up. Start on S, finish on T.' : 'Click the amber holds from the bottom up. Start on S, finish on T.';
    var at = -1, falls = 0, me = { x: 0.30, y: 0.86 }, aim = { x: 0.30, y: 0.86 }, puffs = [], sent = false;
    function hp(h) { return { x: h[0] * st.W, y: h[1] * st.H }; }
    function puff(p) { for (var k = 0; k < 10; k++) puffs.push({ x: p.x, y: p.y, vx: (Math.random() - 0.5) * 60, vy: (Math.random() - 0.7) * 50, a: 1 }); }
    function reset() { at = -1; falls = 0; sent = false; aim = { x: ROUTE[0][0], y: 0.86 }; msg.textContent = START; }
    $('cl-reset').addEventListener('click', reset);
    st.cv.addEventListener('pointerdown', function (e) {
      var r = st.cv.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top, R = JT.touch ? 26 : 18;
      if (sent) { reset(); return; }
      for (var i = 0; i < ROUTE.length; i++) {
        var p = hp(ROUTE[i]);
        if (Math.hypot(p.x - x, p.y - y) < R) {
          if (i === at + 1) {
            at = i; aim = { x: ROUTE[i][0], y: ROUTE[i][1] }; puff(p); SFX.thud();
            if (i === ROUTE.length - 1) { sent = true; SFX.fanfare(); msg.textContent = 'SENT! ' + (falls ? 'Took ' + (falls + 1) + ' attempts. Click the wall to go again.' : 'Flashed it, first try. Click the wall to go again.'); }
            else msg.textContent = 'Move ' + (i + 1) + ' of ' + ROUTE.length + '. Next amber hold.';
          } else if (i <= at) msg.textContent = 'You\'re already past that one.';
          else { falls += 1; at = -1; aim = { x: ROUTE[0][0], y: 0.86 }; SFX.error(); msg.textContent = 'Too big a move. You fell. Back to the start.'; }
          return;
        }
      }
      for (var j = 0; j < OTHER.length; j++) { var q = hp(OTHER[j]); if (Math.hypot(q.x - x, q.y - y) < R) { SFX.error(); msg.textContent = 'Off route. Only the amber holds count.'; return; } }
    });
    st.loop(function (dt) {
      var g = st.g, W = st.W, H = st.H, s = 4;
      me.x += (aim.x - me.x) * Math.min(1, dt * 6); me.y += (aim.y - me.y) * Math.min(1, dt * 6);
      g.fillStyle = '#2a2733'; g.fillRect(0, 0, W, H);
      g.fillStyle = '#322e3d'; for (var px = 0; px < W; px += 80) g.fillRect(px, 0, 1, H);
      g.fillStyle = '#1b1824'; for (var tx = 10; tx < W; tx += 20) for (var ty = 10; ty < H; ty += 20) g.fillRect(tx, ty, 2, 2);
      OTHER.forEach(function (o) { var p = hp(o); g.fillStyle = o[2]; g.beginPath(); g.ellipse(p.x, p.y, 9, 7, 0.4, 0, Math.PI * 2); g.fill(); });
      ROUTE.forEach(function (h, i) {
        var p = hp(h); g.fillStyle = i <= at ? '#ffd27a' : '#ffb340'; g.beginPath(); g.ellipse(p.x, p.y, 11, 8, -0.3, 0, Math.PI * 2); g.fill();
        g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(p.x - 4, p.y - 4, 3, 2);
        if (i === 0 || i === ROUTE.length - 1) { g.font = '10px "Space Mono", monospace'; g.fillStyle = '#efeaf5'; g.fillText(i === 0 ? 'S' : 'T', p.x + 13, p.y + 4); }
      });
      spr(g, CL, me.x * W - 3.5 * s, me.y * H - 0.5 * s, s, CP);
      puffs = puffs.filter(function (p) { p.x += p.vx * dt; p.y += p.vy * dt; p.a -= dt * 1.5; g.fillStyle = 'rgba(255,255,255,' + Math.max(0, p.a) + ')'; g.fillRect(p.x, p.y, 3, 3); return p.a > 0; });
      if (sent) { g.font = '700 28px "Chakra Petch", sans-serif'; g.fillStyle = '#ffb340'; g.textAlign = 'center'; g.fillText('SENT!', W / 2, H / 2); g.textAlign = 'left'; }
    });
    reset();
  })();

  /* ---------- the console collection ---------- */
  (function () {
    var box = $('retro'), info = $('retro-info'); if (!box) return;
    var btns = [].slice.call(box.querySelectorAll('button'));
    btns.forEach(function (b) {
      b.addEventListener('click', function () {
        btns.forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        info.innerHTML = '<span class="label">' + esc(b.getAttribute('data-year')) + '</span><b>' + esc(b.querySelector('b').textContent) + '</b><p>' + esc(b.getAttribute('data-note')) + '</p>';
        SFX.page();
      });
    });
  })();

  /* ---------- Ajax casts spells ---------- */
  (function () {
    var cv = $('ajax-cv'); if (!cv) return;
    var g = cv.getContext('2d'), W = 260, H = 170, d = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = W * d; cv.height = H * d; g.setTransform(d, 0, 0, d, 0, 0); g.imageSmoothingEnabled = false;
    var AJ = [
      '......hhhh......', '.....hhhhhh.....', '....hhsssshh....', '..sshsesseshss..', '...shsssssshs...', '....hhsssshh....',
      '.......ss.......', '....rrrttrrr....', '...rrrrrrrrrr...', '..rrrRrrrrRrrr..', '..srRrrrrrrRrs..', '...rRrrttrrRr...',
      '...rRrrrrrrRr...', '...RrrrrrrrrR...', '..RRrrrrrrrrRR..', '..RRrrrrrrrrRR..', '..RRRrrrrrrRRR..', '..tttttttttttt..',
      '....bb....bb....', '...bbb....bbb...'];
    var ELF = { h: '#e9e6ff', s: '#cfd6ff', e: '#a77bff', r: '#5b3fa8', R: '#3a2770', t: '#ffb340', b: '#2a2233' };
    var TRUE = { h: '#f6f6f8', s: '#d9d9de', e: '#ffffff', r: '#5b3fa8', R: '#3a2770', t: '#ffb340', b: '#2a2233' };
    var SQ = ['.qqqq.', 'qwqqwq', 'qqqqqq', 'q.q.q.', '.q.q.q'], SQP = { q: '#c58bff', w: '#ffffff' };
    var SPELLS = [
      ['Mind Sliver', 'A splinter of psychic energy, aimed at one mind.'],
      ['Arms of Hadar', 'Shadowy tentacles burst out of the ground around him.'],
      ['Dissonant Whispers', 'A tune only the target can hear, and it is not a nice one.'],
      ['Hunger of Hadar', 'A sphere of freezing dark from somewhere between the stars.'],
      ['Detect Thoughts', 'He reads your surface thoughts. They mostly say "is this a website?"']];
    var si = -1, ct = -1, s = 6, ax = 22, ay = H - 20 * s - 6;
    var STARS = []; for (var k = 0; k < 14; k++) STARS.push([Math.random() * 2 - 1, Math.random() * 2 - 1]);
    $('ajax-btn').addEventListener('click', function () {
      si = (si + 1) % SPELLS.length; ct = 0; SFX.spell();
      $('ajax-spell').textContent = 'Casting ' + SPELLS[si][0]; $('ajax-sd').textContent = SPELLS[si][1];
    });
    var vis = true;
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { vis = es[0].isIntersecting; }).observe(cv);
    var last = performance.now();
    (function f(now) {
      var dt = Math.min(0.05, Math.max(0, (now - last) / 1000)); last = now;
      if (vis && !sheet.hidden) {
        g.clearRect(0, 0, W, H);
        var pal = ajaxTrue ? TRUE : ELF, bob = reduce ? 0 : Math.round(Math.sin(now / 400) * 1.5);
        if (ct >= 0) ct += dt;
        var T = ct, hx = ax + 13.5 * s, hy = ay + 10.5 * s, live = ct >= 0 && ct < 1.4;
        if (live && si === 1) {
          for (var a = 0; a < 7; a++) {
            var ang = Math.PI * (0.05 + a * 0.15), L = 70 * Math.sin(Math.PI * Math.min(1, T / 1.4)), ox = ax + 8 * s, oy = ay + 20 * s;
            g.strokeStyle = '#3a1d6e'; g.lineWidth = 6; g.beginPath(); g.moveTo(ox, oy);
            for (var u = 0; u <= 1; u += 0.1) g.lineTo(ox - Math.cos(ang) * L * u + Math.sin(u * 9 + now / 120) * 5, oy - Math.sin(ang) * L * u);
            g.stroke(); g.strokeStyle = '#a77bff'; g.lineWidth = 2; g.stroke();
          }
        }
        spr(g, AJ, ax, ay + bob, s, pal);
        spr(g, SQ, ax + 12 * s, ay + 3 * s + bob - (reduce ? 0 : Math.round(Math.abs(Math.sin(now / 300)) * 3)), 4, SQP);
        if (live) {
          g.fillStyle = 'rgba(205,184,255,' + (0.5 + 0.5 * Math.sin(now / 60)) + ')'; g.beginPath(); g.arc(hx, hy, 5, 0, Math.PI * 2); g.fill();
          if (si === 0) {
            var k2 = Math.min(1, T / 0.5), bx = hx + (W - 30 - hx) * k2;
            for (var tr = 0; tr < 6; tr++) { g.fillStyle = 'rgba(167,123,255,' + (1 - tr / 6) + ')'; g.fillRect(bx - tr * 9, hy - 3 + Math.sin(tr + now / 50) * 2, 6, 6); }
            if (T > 0.5) { g.strokeStyle = 'rgba(255,95,168,' + Math.max(0, 1 - (T - 0.5)) + ')'; g.lineWidth = 2; g.beginPath(); g.arc(W - 30, hy, (T - 0.5) * 40, 0, Math.PI * 2); g.stroke(); }
          } else if (si === 2) {
            for (var ring = 0; ring < 3; ring++) {
              var rr = ((T * 110) + ring * 30) % 150, cx0 = ax + 8 * s, cy0 = ay + 3 * s;
              g.strokeStyle = 'rgba(167,123,255,' + Math.max(0, 1 - rr / 150) + ')'; g.lineWidth = 2; g.beginPath();
              for (var q = 0; q <= Math.PI * 2 + 0.01; q += 0.2) { var rq = rr + Math.sin(q * 6 + now / 80) * 3; g.lineTo(cx0 + Math.cos(q) * rq, cy0 + Math.sin(q) * rq); }
              g.stroke();
            }
          } else if (si === 3) {
            var R = 40 * Math.sin(Math.PI * Math.min(1, T / 1.4)), cx1 = W - 60, cy1 = H / 2;
            g.fillStyle = '#050407'; g.beginPath(); g.arc(cx1, cy1, R, 0, Math.PI * 2); g.fill();
            g.strokeStyle = '#a77bff'; g.lineWidth = 2; g.stroke();
            g.fillStyle = '#efeaf5'; STARS.forEach(function (p) { if (Math.hypot(p[0], p[1]) < 0.9) g.fillRect(cx1 + p[0] * R * 0.8, cy1 + p[1] * R * 0.8, 2, 2); });
          } else if (si === 4) {
            g.font = '16px "Space Mono", monospace';
            ['?', '!', '…', '?', '*'].forEach(function (ch, i) { var tt = T - i * 0.15; if (tt < 0) return; g.fillStyle = 'rgba(255,179,64,' + Math.max(0, 1 - tt / 1.1) + ')'; g.fillText(ch, ax + 10 * s + tt * 120, ay + 2 * s - tt * 30 + i * 6); });
          }
        } else if (ct >= 1.4) ct = -1;
      }
      requestAnimationFrame(f);
    })(last);
  })();
})();
