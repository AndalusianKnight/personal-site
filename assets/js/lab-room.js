/* Concept D: Jesse's room in Shanghai. The boot ends on the computer on the desk and the camera pulls back to show the
   room. Everything that glows is a door: the floppy box is Work, the pennant is Education, the dog bed is Rescue,
   and a few things (the lamp, the d20, the window, the poster) just do something. */
(function () {
  var JT = window.JT, LAB = JT.LAB, reduce = JT.reduce;
  function $(id) { return document.getElementById(id); }
  var room = $('room'); if (!room || !LAB) return;
  var wrap = $('room-wrap'), pan = $('room-pan'), tip = $('room-tip'), svg = room.querySelector('.room-svg');
  var hs = [].slice.call(svg.querySelectorAll('.hs'));

  /* things that act rather than link get button semantics */
  hs.forEach(function (a) { if (a.hasAttribute('data-act')) { a.setAttribute('tabindex', '0'); a.setAttribute('role', 'button'); } });

  /* ---------- the lamp: on at night, off by day, and yours to flick ---------- */
  function lampDefault() { room.classList.toggle('lamp-off', JT.theme() === 'light'); }
  lampDefault();
  document.addEventListener('jt:theme', function () { lampDefault(); if (cur) show(cur); });

  /* ---------- tooltips ---------- */
  var cur = null, live = null, lastPointer = '', tapPrev = null;
  function tipText(a) {
    var k = a.getAttribute('data-hs'), t = a.getAttribute('data-tip');
    if (k === 'window') {
      var n = JT.shanghai(), light = JT.theme() === 'light';
      t = JT.two(n.h) + ':' + JT.two(n.m) + ' in Shanghai. ' + n.long + ' ' + (light ? 'Click to close the blinds (dark mode).' : 'Click to open the blinds (light mode).');
    }
    if (k === 'trophy') t = JT.countFound() + ' of ' + JT.ACH.length + ' achievements found. Click to see them all.';
    if (k === 'lamp') t = room.classList.contains('lamp-off') ? 'Desk lamp. Click to switch it on.' : 'Desk lamp. Click to switch it off.';
    return t;
  }
  function fill(a, extra) {
    tip.innerHTML = '<b>' + JT.esc(a.getAttribute('data-name')) + '</b>' + JT.esc(extra || tipText(a)) +
      (lastPointer === 'touch' ? ' <kbd>tap again</kbd>' : '');
  }
  function place(a) {
    var r = a.getBoundingClientRect(), R = room.getBoundingClientRect();
    var x = r.left - R.left + r.width / 2, top = r.top - R.top, below = top < 96;
    var vl = pan.scrollLeft, vw = pan.clientWidth, half = Math.min(140, vw / 2 - 6);
    x = Math.max(vl + half, Math.min(vl + vw - half, x));
    tip.style.left = x + 'px'; tip.style.top = (below ? r.bottom - R.top : top) + 'px';
    tip.classList.toggle('below', below);
  }
  function show(a, extra) {
    cur = a; hs.forEach(function (x) { x.classList.toggle('on', x === a); });
    tip.style.setProperty('--c', 'var(--' + a.getAttribute('data-c') + ')');
    fill(a, extra); place(a); tip.classList.add('on');
    clearInterval(live);
    if (a.getAttribute('data-hs') === 'window') live = setInterval(function () { if (cur === a) fill(a); }, 1000);
  }
  function hide(a) {
    if (a && cur !== a) return;
    cur = null; clearInterval(live); tip.classList.remove('on');
    hs.forEach(function (x) { x.classList.remove('on'); });
  }
  room.addEventListener('pointerdown', function (e) { lastPointer = e.pointerType; tapPrev = cur; }, true);
  room.addEventListener('keydown', function () { lastPointer = 'key'; }, true);
  document.addEventListener('pointerdown', function (e) { if (!e.target.closest || !e.target.closest('.hs')) hide(); });
  hs.forEach(function (a) {
    a.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') show(a); });
    a.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') hide(a); });
    a.addEventListener('focus', function () { show(a); });
    a.addEventListener('blur', function () { hide(a); });
    a.addEventListener('click', function (e) {
      e.preventDefault();
      /* on a touch screen the first tap reads the label, the second one goes */
      if (lastPointer === 'touch' && tapPrev !== a) { show(a); tapPrev = a; return; }
      activate(a);
    });
    a.addEventListener('keydown', function (e) {
      if (a.hasAttribute('data-act') && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); activate(a); }
    });
  });

  /* ---------- what each thing does ---------- */
  var rolls = 0;
  function roll(a) {
    rolls += 1;
    var n = Math.floor(Math.random() * 20) + 1; if (rolls % 4 === 0) n = 20;
    var out = $('d20out');
    out.textContent = n === 20 ? 'NAT 20!' : String(n);
    out.classList.toggle('crit', n === 20); out.classList.remove('pop'); out.getBoundingClientRect(); out.classList.add('pop');
    JT.SFX.clack();
    if (n === 20) { JT.store('jt-sheet', '1'); JT.achieve('nat20'); show(a, 'Natural 20! The character sheet in Hobbies is unlocked.'); }
    else if (n === 1) show(a, 'A natural 1. Doufu is eyeing the die. Roll again.');
    else show(a, 'You rolled ' + n + '. Roll again?');
  }
  function activate(a) {
    var act = a.getAttribute('data-act');
    if (!act) { hide(); LAB.zoomTo(a, new URL(a.getAttribute('href'), location.href).href, a.getAttribute('data-c')); return; }
    if (act === 'roll') { roll(a); return; }
    if (act === 'lamp') { room.classList.toggle('lamp-off'); JT.SFX.click(); show(a); return; }
    if (act === 'theme') { JT.setTheme(JT.theme() === 'light' ? 'dark' : 'light'); show(a); return; }
    hide();
    if (act === 'term') JT.openTerm();
    else if (act === 'gate') JT.typeIn('dial earth');
    else if (act === 'cv') JT.printCV();
    else if (act === 'ach') { var b = $('achbtn'); if (b) b.click(); }
  }

  /* ---------- on a phone the room is wider than the screen: start on the desk, swipe to look around ---------- */
  var centred = 0;
  function centre() { if (pan.scrollWidth > pan.clientWidth + 4) { pan.scrollLeft = pan.scrollWidth * 0.53 - pan.clientWidth / 2; centred = pan.scrollLeft; } }
  centre();
  window.addEventListener('resize', function () { if (cur) place(cur); });
  pan.addEventListener('scroll', function () {
    if (Math.abs(pan.scrollLeft - centred) > 24) $('room-swipe').classList.add('gone');
    if (cur) place(cur);
  }, { passive: true });

  /* ---------- the camera: the boot ends on the computer's screen, then pulls back to show the room ---------- */
  var play = !reduce;
  try {
    if (sessionStorage.getItem('jt-room-cam') && !document.documentElement.classList.contains('boot-on')) play = false;
    sessionStorage.setItem('jt-room-cam', '1');
  } catch (e) {}
  function sweep() {
    /* a quick pass over everything you can click, so the room explains itself */
    if (reduce) { room.classList.add('sweep'); hs.forEach(function (a) { a.classList.add('lit'); }); setTimeout(function () { hs.forEach(function (a) { a.classList.remove('lit'); }); }, 1600); return; }
    room.classList.add('sweep');
    hs.forEach(function (a, i) {
      setTimeout(function () { a.classList.add('lit'); setTimeout(function () { a.classList.remove('lit'); }, 420); }, 120 + i * 85);
    });
  }
  if (play) { room.classList.add('cam'); wrap.classList.add('neon-off'); }
  LAB.whenBooted(function () {
    if (!play) return;
    centre();
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        room.classList.add('cam-go'); room.classList.remove('cam');
        setTimeout(function () { room.classList.remove('cam-go'); wrap.classList.remove('neon-off'); wrap.classList.add('neon-on'); sweep(); }, 2050);
      });
    });
  });
})();
