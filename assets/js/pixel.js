/* Pixel Pidan and Doufu: the sprites, a few canvas helpers the pages share,
   the screensaver (a minute with no input) and Doufu on the loose (she chases your cursor). */
(function () {
  var JT = window.JT, SFX = JT.SFX, reduce = JT.reduce;

  /* Doufu: white with ginger ears and eye patches, orange collar, plume tail. Faces right. */
  var DOUFU_BODY = [
    '.................oo.....',
    '.w..............ooo.....',
    'ww.............oooow....',
    'www............okowww...',
    '.ww...........wwwwwwwwk.',
    '..ww.........rwwwwwwwt..',
    '..wwwwwwwwwwwrwwwww.....',
    '...wwwwwwwwwwrwww.......',
    '...wwwwwwwwwwwww........',
    '...wwwwwwwwwwwww........',
    '....ccwwwwwwwcc.........'];
  var DOUFU_LEGS = [
    ['...ww.........ww........', '..ww...........ww.......', '.ww.............ww......'],
    ['.....ww.....ww..........', '......ww...ww...........', '......w.....w...........']];
  var DOUFU = { w: '#f4efe8', c: '#d6ccbf', o: '#d9803a', k: '#141414', t: '#ff7a8a', r: '#e8642a' };
  /* Pidan: black-and-tan face, cream inner ears, white muzzle, tan brows. Faces you. */
  var PIDAN_HEAD = [
    'kk........kk',
    'kwk......kwk',
    'kwwkkkkkkwwk',
    'kkkkkkkkkkkk',
    'kknnkkkknnkk',
    'knnennnnennk',
    'nnnnwwwwnnnn',
    'nnwwwbbwwwnn',
    '.nwwwttwwwn.',
    '..wwwwwwww..'];
  var PIDAN = { k: '#1c1a20', w: '#efe6da', n: '#c98a4b', e: '#050407', b: '#0b0a0d', t: '#ff8a9a' };

  function spr(c, rows, x, y, s, pal, flip) {
    var w = rows[0].length;
    for (var j = 0; j < rows.length; j++) {
      var r = rows[j];
      for (var i = 0; i < r.length; i++) {
        var ch = r[i]; if (ch === '.' || !pal[ch]) continue;
        c.fillStyle = pal[ch]; c.fillRect(Math.round(x + (flip ? w - 1 - i : i) * s), Math.round(y + j * s), Math.ceil(s), Math.ceil(s));
      }
    }
  }
  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }
  /* A canvas that tracks its own size and the pointer, and only animates while on screen. */
  function mkStage(cv, opts) {
    opts = opts || {};
    var st = { cv: cv, g: cv.getContext('2d'), W: 0, H: 0, s: 3, vis: true, px: null, py: null, still: performance.now() };
    function fit() {
      var d = Math.min(window.devicePixelRatio || 1, 2);
      st.W = cv.clientWidth || 300; st.H = cv.clientHeight || 220;
      cv.width = Math.round(st.W * d); cv.height = Math.round(st.H * d);
      st.g.setTransform(d, 0, 0, d, 0, 0); st.g.imageSmoothingEnabled = false;
      st.s = opts.scale ? opts.scale(st.W) : (st.W < 380 ? 2 : 3);
      if (st.onfit) st.onfit();
    }
    fit(); window.addEventListener('resize', fit);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
    function pos(e) { var r = cv.getBoundingClientRect(); st.px = e.clientX - r.left; st.py = e.clientY - r.top; st.still = performance.now(); }
    cv.addEventListener('pointermove', pos); cv.addEventListener('pointerdown', pos);
    cv.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') { st.px = null; st.py = null; } });
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { st.vis = es[0].isIntersecting; }).observe(cv);
    st.loop = function (fn) {
      var last = performance.now();
      (function f(now) { var dt = Math.min(0.05, Math.max(0, (now - last) / 1000)); last = now; if (st.vis && !document.hidden) fn(dt, now); requestAnimationFrame(f); })(last);
    };
    return st;
  }
  function bubbleText(c, x, y, text) {
    c.font = '11px "Space Mono", monospace';
    var tw = c.measureText(text).width;
    c.fillStyle = '#efeaf5'; c.fillRect(x, y, tw + 10, 16); c.fillRect(x + 4, y + 16, 4, 4);
    c.fillStyle = '#08070c'; c.fillText(text, x + 5, y + 12);
  }
  function drawBox(c, x, y, s) {
    var w = 16 * s, h = 10 * s;
    c.fillStyle = '#8a5a2b'; c.fillRect(x, y, w, h);
    c.fillStyle = '#a8703a'; c.fillRect(x - 2 * s, y - s, 4 * s, 2 * s); c.fillRect(x + w - 2 * s, y - s, 4 * s, 2 * s);
    c.fillStyle = '#6b4520'; c.fillRect(x, y + s, w, s);
    c.fillStyle = '#c9a26a'; c.fillRect(x + 3 * s, y + 4 * s, 5 * s, 3 * s);
    c.fillStyle = '#efe6da'; c.fillRect(x - 3 * s, y + h - s, 2 * s, s); c.fillRect(x + w + 2 * s, y + h - s, s, s); c.fillRect(x + w + 4 * s, y + h - s, 2 * s, s);
  }
  var DF_RUN = [DOUFU_BODY.concat(DOUFU_LEGS[0]), DOUFU_BODY.concat(DOUFU_LEGS[1])];
  var DF_SIT = DOUFU_BODY.concat(['...ww.........ww........', '...ww.........ww........', '..www........www........']);
  var DF_LIE = ['........................', '........................', '........................'].concat(DOUFU_BODY).concat(['..wwwww......wwwww......']);
  function dogFrame(state, now) { return state === 'run' ? DF_RUN[Math.floor(now / 90) % 2] : (state === 'lie' ? DF_LIE : DF_SIT); }
  /* one Doufu that chases a target point */
  function chaser(speed) { return { x: 0, y: 0, face: 1, state: 'sit', idle: 0, alert: 0, speed: speed }; }
  function chaseStep(d, tx, ty, dt, near) {
    var dx = tx - d.x, dy = ty - d.y, dist = Math.hypot(dx, dy);
    if (dist > (near || 26)) {
      if (d.state !== 'run') { d.state = 'run'; d.alert = d.idle > 1 ? 0.35 : 0; }
      d.idle = 0;
      if (d.alert > 0) d.alert -= dt;
      else { var v = Math.min(dist, d.speed * dt); d.x += dx / dist * v; d.y += dy / dist * v; }
      if (Math.abs(dx) > 3) d.face = dx > 0 ? 1 : -1;
    } else {
      if (d.state === 'run') d.state = 'sit';
      d.idle += dt; if (d.idle > 3) d.state = 'lie';
    }
  }
  function drawChaser(c, d, cx, bottom, s, now) {
    var rows = dogFrame(d.state, now), dw = 24 * s, bob = d.state === 'run' && Math.floor(now / 90) % 2 ? -s : 0;
    c.fillStyle = 'rgba(0,0,0,.35)'; c.fillRect(Math.round(cx - dw * 0.4), Math.round(bottom - s), Math.round(dw * 0.8), s);
    spr(c, rows, cx - dw / 2, bottom - rows.length * s + bob, s, DOUFU, d.face < 0);
    var hx = d.face > 0 ? cx + dw * 0.12 : cx - dw * 0.62, hy = bottom - 14 * s - 24;
    if (d.alert > 0) bubbleText(c, hx, hy, '!');
    else if (d.state === 'lie') { c.font = '12px "Space Mono", monospace'; c.fillStyle = '#9b96a8'; c.fillText(Math.floor(now / 600) % 2 ? 'z Z' : 'z', hx + 6, hy + 14); }
  }
  JT.PX = { DOUFU_BODY: DOUFU_BODY, DOUFU_LEGS: DOUFU_LEGS, DOUFU: DOUFU, PIDAN_HEAD: PIDAN_HEAD, PIDAN: PIDAN,
    spr: spr, clamp: clamp, mkStage: mkStage, bubbleText: bubbleText, drawBox: drawBox, dogFrame: dogFrame,
    chaser: chaser, chaseStep: chaseStep, drawChaser: drawChaser };

  /* ---------- Doufu on the loose: she follows your cursor around the whole page ---------- */
  var loose = null, cx = null, cy = null, looseHooks = [];
  document.addEventListener('pointermove', function (e) { cx = e.clientX; cy = e.clientY; }, { passive: true });
  document.addEventListener('pointerdown', function (e) { cx = e.clientX; cy = e.clientY; }, { passive: true });
  function looseSync() { looseHooks.forEach(function (f) { f(!!loose); }); }
  function startLoose(from) {
    if (loose) return;
    var s = 3, cw = 24 * s + 90, ch = 15 * s + 44, dpr = Math.min(window.devicePixelRatio || 1, 2);
    var c = document.createElement('canvas'); c.className = 'doufu-loose'; c.setAttribute('aria-hidden', 'true');
    c.width = cw * dpr; c.height = ch * dpr; c.style.width = cw + 'px'; c.style.height = ch + 'px';
    document.body.appendChild(c);
    var g = c.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0); g.imageSmoothingEnabled = false;
    var L = chaser(260), r = from && from.getBoundingClientRect ? from.getBoundingClientRect() : { left: window.innerWidth / 2, top: window.innerHeight - 120, width: 0 };
    L.x = r.left + window.scrollX + r.width / 2; L.y = r.top + window.scrollY; L.c = c; L.on = true;
    loose = L; SFX.blip(); looseSync();
    var last = performance.now();
    (function f(now) {
      if (!L.on) return;
      var dt = Math.min(0.05, Math.max(0, (now - last) / 1000)); last = now;
      var docW = document.documentElement.clientWidth, docH = Math.max(document.documentElement.scrollHeight, ch + 10);
      if (cx != null) chaseStep(L, cx + window.scrollX, cy + window.scrollY + 34, dt, 34);
      L.x = clamp(L.x, cw / 2, docW - cw / 2); L.y = clamp(L.y, ch, docH - 4);
      c.style.transform = 'translate(' + Math.round(L.x - cw / 2) + 'px,' + Math.round(L.y - ch) + 'px)';
      g.clearRect(0, 0, cw, ch);
      drawChaser(g, L, cw / 2, ch - 2, s, now);
      requestAnimationFrame(f);
    })(last);
  }
  function stopLoose() { if (!loose) return; loose.on = false; if (loose.c.parentNode) loose.c.parentNode.removeChild(loose.c); loose = null; looseSync(); }
  JT.doufu = { start: startLoose, stop: stopLoose, on: function () { return !!loose; }, toggle: function (from) { if (loose) stopLoose(); else startLoose(from); }, hook: function (f) { looseHooks.push(f); } };
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') stopLoose(); });

  /* ---------- screensaver: a minute with no input ---------- */
  var saver = null, scv = null, sctx = null, saverRaf = 0, saverOn = 0, idleT = performance.now(), moveFrom = null;
  function saverFrame(t0) {
    var W = window.innerWidth, H = window.innerHeight, d = Math.min(window.devicePixelRatio || 1, 2);
    scv.width = Math.round(W * d); scv.height = Math.round(H * d); sctx.setTransform(d, 0, 0, d, 0, 0); sctx.imageSmoothingEnabled = false;
    var s = Math.max(4, Math.floor(Math.min(W, H) / 100)), floor = Math.round(H * 0.7) + 14 * s, shreds = [];
    for (var i = 0; i < 18; i++) shreds.push([Math.random() * 30 - 22, Math.random() * 3 | 0, Math.random() < 0.5]);
    var boxW = 20 * s, boxH = 12 * s, boxX = Math.round(W * 0.7 - boxW / 2), boxTop = floor - boxH;
    function frame(now) {
      var t = (now - t0) / 1000;
      sctx.fillStyle = '#050407'; sctx.fillRect(0, 0, W, H);
      sctx.fillStyle = '#1a1622'; sctx.fillRect(0, floor, W, 2);
      sctx.font = '12px "Space Mono", monospace'; sctx.fillStyle = '#9b96a8';
      sctx.fillText('PIDAN.SCR · DOUFU.SCR', 20, 30);
      sctx.textAlign = 'center'; sctx.fillText(JT.touch ? 'TAP TO WAKE' : 'MOVE THE MOUSE OR PRESS ANY KEY', W / 2, H - 70); sctx.textAlign = 'left';
      var span = W + 50 * s, dx = ((t * W / 3 + W * 0.12 + 26 * s) % span) - 26 * s, frameNo = Math.floor(t * 10) % 2, bob = frameNo ? 0 : -s;
      var dogMid = dx + 12 * s, near = Math.abs(dogMid - (boxX + boxW / 2)) < Math.max(W * 0.22, 30 * s);
      /* Pidan rises slowly, peeks, and ducks fast when Doufu gets close */
      var cyc = (Math.sin(t * 0.9 + Math.PI / 2) + 1) / 2, peek = near ? 0 : Math.min(10, Math.round(Math.max(0, cyc * 1.5 - 0.35) * 10));
      if (peek > 0) spr(sctx, PIDAN_HEAD, boxX + boxW / 2 - 6 * s, boxTop + 2 * s - peek * s, s, PIDAN);
      sctx.fillStyle = '#8a5a2b'; sctx.fillRect(boxX, boxTop, boxW, boxH);
      sctx.fillStyle = '#a8703a'; sctx.fillRect(boxX - 3 * s, boxTop - s, 5 * s, 2 * s); sctx.fillRect(boxX + boxW - 2 * s, boxTop - s, 5 * s, 2 * s);
      sctx.fillStyle = '#6b4520'; sctx.fillRect(boxX, boxTop + s, boxW, s);
      sctx.fillStyle = '#c9a26a'; sctx.fillRect(boxX + 3 * s, boxTop + 5 * s, 6 * s, 3 * s);
      sctx.fillStyle = '#6b4520'; sctx.fillRect(boxX + 4 * s, boxTop + 6 * s, 4 * s, s);
      /* shredded paper, Pidan's handiwork */
      shreds.forEach(function (p) { sctx.fillStyle = p[2] ? '#efe6da' : '#cfc6bb'; sctx.fillRect(boxX + p[0] * s, floor - s - p[1] * s, p[2] ? 2 * s : s, s); });
      spr(sctx, DOUFU_BODY.concat(DOUFU_LEGS[frameNo]), dx, floor - 14 * s + bob, s, DOUFU);
      if ((t % 5) < 2.2) {
        var bx = dx + 14 * s, by = floor - 21 * s;
        sctx.font = Math.max(12, 2 * s) + 'px "Space Mono", monospace';
        var label = 'CHASE ME!', tw = sctx.measureText(label).width;
        sctx.fillStyle = '#efeaf5'; sctx.fillRect(bx, by, tw + 2 * s, 3 * s); sctx.fillRect(bx + s, by + 3 * s, s, s);
        sctx.fillStyle = '#08070c'; sctx.fillText(label, bx + s, by + 2.2 * s);
      }
      if (peek > 5) { sctx.font = '11px "Space Mono", monospace'; sctx.fillStyle = '#9b96a8'; sctx.fillText('pidan is shy', boxX + boxW + 4 * s, boxTop - 2 * s); }
      saverRaf = requestAnimationFrame(frame);
    }
    saverRaf = requestAnimationFrame(frame);
  }
  function startSaver() {
    if (saver && !saver.hidden) return;
    if (!saver) {
      saver = document.createElement('div'); saver.className = 'saver'; saver.hidden = true;
      saver.innerHTML = '<canvas aria-label="Screensaver: Doufu zooms past while Pidan peeks out of a box"></canvas>';
      document.body.appendChild(saver); scv = saver.firstChild; sctx = scv.getContext('2d');
    }
    saver.hidden = false; saverOn = performance.now(); moveFrom = null;
    saverFrame(performance.now());
    setTimeout(function () { if (saver && !saver.hidden) JT.achieve('afk'); }, 3000);
  }
  function stopSaver() { if (!saver) return; cancelAnimationFrame(saverRaf); saver.hidden = true; moveFrom = null; }
  function activity(e) {
    idleT = performance.now();
    if (!saver || saver.hidden || performance.now() - saverOn < 1200 || e.type === 'scroll') return;
    if (e.type === 'mousemove') {
      if (!moveFrom) { moveFrom = [e.clientX, e.clientY]; return; }
      if (Math.abs(e.clientX - moveFrom[0]) + Math.abs(e.clientY - moveFrom[1]) < 24) return;
    }
    /* the key or tap that wakes the screen does nothing else */
    if (e.type === 'keydown' || e.type === 'pointerdown') { if (e.cancelable) e.preventDefault(); e.stopPropagation(); }
    stopSaver();
  }
  ['mousemove', 'keydown', 'pointerdown', 'wheel', 'touchstart', 'scroll'].forEach(function (ev) { window.addEventListener(ev, activity, { passive: ev !== 'keydown' && ev !== 'pointerdown', capture: true }); });
  JT.saver = { start: startSaver, stop: stopSaver };
  function busy() {
    return (JT.printerOpen && JT.printerOpen()) || (JT.termOpen && JT.termOpen()) || document.documentElement.classList.contains('boot-on') || JT.inField({ target: document.activeElement });
  }
  if (!reduce) setInterval(function () { if ((!saver || saver.hidden) && !busy() && performance.now() - idleT > 60000 && document.visibilityState === 'visible') startSaver(); }, 2000);
})();
