/* Concept A: the boot ends on a desktop. Windows drag, close and come back from the taskbar, every room is an icon,
   and Pidan and Doufu sleep on the taskbar. On a phone the same pieces become a home screen with a dock. */
(function () {
  var JT = window.JT, LAB = JT.LAB, reduce = JT.reduce;
  function $(id) { return document.getElementById(id); }
  var desk = $('desk'); if (!desk || !LAB) return;
  var mq = window.matchMedia('(min-width: 900px) and (min-height: 620px)');
  function isDesk() { return mq.matches; }

  /* the status bar becomes the menu bar (on a phone it stays at the bottom) */
  var osbar = document.querySelector('.osbar'), main = $('main');
  if (osbar) {
    osbar.classList.add('os-menubar'); main.parentNode.insertBefore(osbar, main);
  }
  var ready = osbar && osbar.querySelector('.ready');

  /* ---------- windows ---------- */
  var wins = [].slice.call(desk.querySelectorAll('.osw')), Z = 10, dragged = {}, term = $('w-term'), host = $('term-host');
  function taskBtn(id) { return document.querySelector('[data-task="' + id + '"]'); }
  function front(w) { wins.forEach(function (x) { x.classList.toggle('active', x === w); }); w.style.zIndex = ++Z; }
  function sync(w) { var t = taskBtn(w.id); if (t) { t.setAttribute('aria-pressed', String(!w.hidden)); if (!w.hidden) t.hidden = false; } }
  function openWin(id) {
    var w = $(id); if (!w) return;
    if (w === term && !isDesk()) { w.classList.add('open'); startDemo(); return; }
    var was = w.hidden; w.hidden = false; front(w); sync(w);
    if (was && !reduce) { w.classList.remove('pop'); void w.offsetWidth; w.classList.add('pop'); }
    if (w === term) startDemo();
  }
  function closeWin(w) {
    if (w === term && !isDesk()) { w.classList.remove('open'); return; }
    w.hidden = true; w.classList.remove('active'); sync(w);
  }
  wins.forEach(function (w) {
    w.addEventListener('pointerdown', function () { if (isDesk() && !w.hidden) front(w); });
    w.querySelector('.w-x').addEventListener('click', function () { closeWin(w); if (w.id === 'w-readme') JT.store('jt-readme', '1'); });
    var bar = w.querySelector('.win-bar');
    bar.addEventListener('pointerdown', function (e) {
      if (!isDesk() || e.button !== 0 || e.target.closest('button')) return;
      e.preventDefault();
      var sx = e.clientX, sy = e.clientY, ox = w.offsetLeft, oy = w.offsetTop, dw = desk.clientWidth, dh = desk.clientHeight;
      bar.setPointerCapture(e.pointerId); w.classList.add('dragging');
      function mv(ev) {
        w.style.left = Math.max(80 - w.offsetWidth, Math.min(dw - 80, ox + ev.clientX - sx)) + 'px';
        w.style.top = Math.max(0, Math.min(dh - 32, oy + ev.clientY - sy)) + 'px';
        dragged[w.id] = true;
      }
      function up() { bar.removeEventListener('pointermove', mv); bar.removeEventListener('pointerup', up); bar.removeEventListener('pointercancel', up); w.classList.remove('dragging'); }
      bar.addEventListener('pointermove', mv); bar.addEventListener('pointerup', up); bar.addEventListener('pointercancel', up);
    });
  });
  document.querySelectorAll('[data-task]').forEach(function (b) {
    b.addEventListener('click', function () {
      var w = $(b.getAttribute('data-task'));
      if (w.hidden) { openWin(w.id); if (w === term) JT.openTerm(); }
      else if (w.classList.contains('active')) closeWin(w);
      else { front(w); if (w === term) JT.openTerm(); }
    });
  });
  document.querySelectorAll('[data-open]').forEach(function (b) {
    b.addEventListener('click', function () { openWin(b.getAttribute('data-open')); });
  });
  document.querySelectorAll('#w-readme [data-close]').forEach(function (b) {
    b.addEventListener('click', function () { closeWin($('w-readme')); JT.store('jt-readme', '1'); });
  });
  /* the terminal asks for focus (the ~ key, a [data-term] button): bring its window back */
  document.addEventListener('jt:termfocus', function () {
    if (isDesk()) { if (term.hidden) openWin('w-term'); else front(term); }
    else term.classList.add('open');
  });
  document.addEventListener('jt:termclose', function () { if (!isDesk()) term.classList.remove('open'); });

  /* windows start where they fit: ID on the left, the terminal and NOW.TXT beside it, icons on the right edge */
  var iconsEl = desk.querySelector('.icons');
  function place(w, x, y, width) {
    if (dragged[w.id]) return;
    w.style.left = Math.round(x) + 'px'; w.style.top = Math.round(y) + 'px'; if (width) w.style.width = Math.round(width) + 'px';
  }
  function layout() {
    if (ready) ready.textContent = isDesk() ? '◆ jessethe OS' : 'READY.';
    if (!isDesk()) { wins.forEach(function (w) { w.style.left = w.style.top = w.style.width = w.style.zIndex = ''; }); host.style.height = ''; return; }
    var W = desk.clientWidth, H = desk.clientHeight, icW = iconsEl.offsetWidth + 22, pad = Math.max(20, Math.min(44, W * 0.03));
    var idW = Math.min(470, Math.max(360, W * 0.36)), top = Math.round(pad * 0.75);
    place($('w-id'), pad, top, idW);
    var tx = pad + idW + 28, tw = Math.max(320, Math.min(640, W - tx - icW - 10)), th = Math.max(200, Math.min(320, H * 0.46));
    place(term, tx, top, tw); host.style.height = th + 'px';
    place($('w-now'), tx + Math.min(48, tw * 0.08), top + th + 58, Math.min(400, tw));
    place($('w-bin'), Math.max(pad, W / 2 - 170), H * 0.26, 340);
    place($('w-readme'), Math.min(W - icW - 410, tx + 40), top + 110, 400);
  }
  layout();
  window.addEventListener('resize', layout);
  if (mq.addEventListener) mq.addEventListener('change', layout); else if (mq.addListener) mq.addListener(layout);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout);
  front($('w-term')); front($('w-id'));

  /* ---------- the recycle bin ---------- */
  document.querySelectorAll('.binlist button').forEach(function (b) {
    b.addEventListener('click', function () {
      document.querySelectorAll('.binlist button').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      $('binout').textContent = b.textContent + ': ' + b.getAttribute('data-joke');
    });
  });

  /* ---------- the terminal: the demo plays once the window is on screen ---------- */
  var demoed = false;
  function startDemo() { if (demoed) return; demoed = true; LAB.demo(host); }
  LAB.whenBooted(function () {
    if (isDesk()) startDemo(); else JT.termMount(host);
    if (isDesk() && !JT.store('jt-readme')) setTimeout(function () { openWin('w-readme'); }, reduce ? 0 : 1600);
  });

  /* ---------- Pidan and Doufu asleep on the taskbar. Doufu wakes up if you come close. Pidan does not. ---------- */
  var cv = $('sleepers'), P = JT.PX;
  if (cv && P) {
    var g = cv.getContext('2d'), s = 2, CW = 116, CH = 34, dpr = Math.min(window.devicePixelRatio || 1, 2), woke = false;
    cv.width = CW * dpr; cv.height = CH * dpr; cv.style.width = CW + 'px'; cv.style.height = CH + 'px';
    g.setTransform(dpr, 0, 0, dpr, 0, 0); g.imageSmoothingEnabled = false;
    var LIE = P.dogFrame('lie', 0), SLEEPY = { k: P.PIDAN.k, w: P.PIDAN.w, n: P.PIDAN.n, e: '#3a2614', b: P.PIDAN.b, t: P.PIDAN.t };
    var draw = function (now) {
      g.clearRect(0, 0, CW, CH);
      P.spr(g, P.PIDAN_HEAD, 6, CH - 10 * s - 2, s, SLEEPY);
      g.fillStyle = '#1c1a20'; g.fillRect(4, CH - 4, 28, 3);
      if (!JT.doufu || !JT.doufu.on()) {
        P.spr(g, LIE, 40, CH - LIE.length * s, s, P.DOUFU, true);
        g.font = '11px "Space Mono", monospace'; g.fillStyle = '#9b96a8';
        g.fillText(Math.floor(now / 700) % 3 === 0 ? 'z' : (Math.floor(now / 700) % 3 === 1 ? 'z z' : 'z z Z'), 88, 12);
      } else { g.font = '10px "Space Mono", monospace'; g.fillStyle = '#9b96a8'; g.fillText('(empty)', 50, 22); }
      g.font = '10px "Space Mono", monospace'; g.fillStyle = '#9b96a8'; g.fillText('z', 32, 10);
    };
    if (reduce) draw(0); else (function loop(now) { if (!document.hidden) draw(now); setTimeout(function () { requestAnimationFrame(loop); }, 250); })(performance.now());
    cv.parentNode.title = 'Pidan is asleep and would like to stay that way. Doufu is a light sleeper.';
    document.addEventListener('pointermove', function (e) {
      if (woke || !isDesk() || e.pointerType !== 'mouse' || !JT.doufu || JT.doufu.on()) return;
      var r = cv.getBoundingClientRect(), dx = e.clientX - (r.left + 64), dy = e.clientY - (r.top + 20);
      if (dx * dx + dy * dy < 70 * 70) {
        woke = true; JT.doufu.start(cv); JT.achieve('dogs');
        JT.bubble(cv, 'Doufu woke up and wants to be chased. <b>Esc</b> sends her back to bed.', 5500);
      }
    }, { passive: true });
  }
})();
