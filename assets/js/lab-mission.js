/* Concept B: mission control. Live panels: Shanghai time and what Jesse is probably doing, a small globe with the
   thirteen homes, the dogs' status, achievements, the terminal, and every room. */
(function () {
  var JT = window.JT, LAB = JT.LAB, reduce = JT.reduce, P = JT.PX;
  function $(id) { return document.getElementById(id); }
  if (!LAB || !$('mc-time')) return;
  var dpr = Math.min(window.devicePixelRatio || 1, 2);

  /* ---------- 02 · the clock and the day, hour by hour ---------- */
  var KINDS = [['sleep', 'Asleep', /asleep|winding/i, '#2b2640'], ['walk', 'Dog walks', /walk/i, 'var(--coral)'], ['coffee', 'Coffee', /coffee/i, 'var(--amber)'],
    ['build', 'Building', /building/i, 'var(--cyan)'], ['food', 'Food', /lunch|dinner/i, 'var(--green)'], ['dnd', 'Maybe D&D', /d&d/i, 'var(--pink)']];
  function kind(h) { var s = JT.shanghai(h).short; for (var i = 0; i < KINDS.length; i++) if (KINDS[i][2].test(s)) return KINDS[i]; return KINDS[0]; }
  var day = $('mc-day'), cells = [];
  for (var h = 0; h < 24; h++) { var c = document.createElement('i'), k = kind(h); c.style.background = k[3]; c.title = JT.two(h) + ':00 · ' + JT.shanghai(h).short; day.appendChild(c); cells.push(c); }
  $('mc-legend').innerHTML = KINDS.map(function (k) { return '<li><i style="background:' + k[3] + '"></i>' + k[1] + '</li>'; }).join('');
  var lastH = -1;
  function tick() {
    var n = JT.shanghai();
    $('mc-time').innerHTML = JT.two(n.h) + ':' + JT.two(n.m) + '<small>:' + JT.two(n.s) + '</small>';
    if (n.h !== lastH) {
      lastH = n.h; $('mc-band').textContent = n.long;
      cells.forEach(function (c, i) { c.classList.toggle('on', i === n.h); });
      var j = $('mc-jesse'); j.textContent = n.night ? 'Asleep' : 'Online'; j.className = n.night ? 'warn' : 'ok';
    }
  }
  tick(); setInterval(tick, 1000);

  /* ---------- 03 · a small globe with the thirteen homes and the path between them ---------- */
  (function () {
    var cv = $('mc-globe'); if (!cv || !JT.LAND) return;
    var g = cv.getContext('2d'), D = Math.PI / 180, W = 0, R = 0, yaw = -100 * D, tilt = 22 * D, vis = true;
    function vec(lat, lon) { var p = lat * D, l = lon * D; return [Math.cos(p) * Math.sin(l), Math.sin(p), Math.cos(p) * Math.cos(l)]; }
    var raw = atob(JT.LAND), land = [];
    for (var i = 0; i < raw.length; i += 2) { var lat = raw.charCodeAt(i) * 2 - 90, k = Math.max(1, Math.round(1 / Math.max(Math.cos(lat * D), 0.05))); land.push(vec(lat, raw.charCodeAt(i + 1) * 2 - 180 + k)); }
    var HOMES = [[43.65, -79.38], [19.43, -99.13], [44.79, 20.45], [38.72, -9.14], [52.37, 4.9], [-23.55, -46.63], [55.68, 12.57], [42.37, -71.11], [45.5, -73.57], [22.54, 114.06], [39.47, -0.38], [43.77, 11.26], [31.23, 121.47]].map(function (h) { return vec(h[0], h[1]); });
    function slerp(a, b, t) { var dot = a[0] * b[0] + a[1] * b[1] + a[2] * b[2], om = Math.acos(Math.min(1, Math.max(-1, dot))); if (om < 1e-6) return a; var s = Math.sin(om), wa = Math.sin((1 - t) * om) / s, wb = Math.sin(t * om) / s; return [a[0] * wa + b[0] * wb, a[1] * wa + b[1] * wb, a[2] * wa + b[2] * wb]; }
    var PATH = [];
    for (var s = 0; s < HOMES.length - 1; s++) for (var t = 0; t <= 24; t++) PATH.push(slerp(HOMES[s], HOMES[s + 1], t / 24));
    function size() { W = cv.clientWidth; cv.width = W * dpr; cv.height = W * dpr; g.setTransform(dpr, 0, 0, dpr, 0, 0); R = W * 0.44; }
    function proj(v) { var cy = Math.cos(yaw), sy = Math.sin(yaw), ct = Math.cos(tilt), st = Math.sin(tilt); var x1 = v[0] * cy + v[2] * sy, z1 = v[2] * cy - v[0] * sy, y2 = v[1] * ct - z1 * st, z2 = v[1] * st + z1 * ct; return [W / 2 + R * x1, W / 2 - R * y2, z2]; }
    function draw(now) {
      g.clearRect(0, 0, W, W);
      g.fillStyle = 'rgba(95,227,232,.05)'; g.beginPath(); g.arc(W / 2, W / 2, R, 0, Math.PI * 2); g.fill();
      g.strokeStyle = 'rgba(95,227,232,.25)'; g.lineWidth = 1; g.stroke();
      g.fillStyle = '#5fe3e8';
      for (var i = 0; i < land.length; i++) { var q = proj(land[i]); if (q[2] > 0) { g.globalAlpha = 0.25 + 0.55 * q[2]; g.fillRect(q[0] - 0.8, q[1] - 0.8, 1.6, 1.6); } }
      g.globalAlpha = 1; g.strokeStyle = '#ffb340'; g.lineWidth = 1.2; g.beginPath();
      var pen = false;
      PATH.forEach(function (v) { var q = proj(v); if (q[2] > 0) { if (pen) g.lineTo(q[0], q[1]); else g.moveTo(q[0], q[1]); pen = true; } else pen = false; });
      g.globalAlpha = 0.7; g.stroke(); g.globalAlpha = 1;
      HOMES.forEach(function (v, i) {
        var q = proj(v); if (q[2] <= 0) return;
        var last = i === HOMES.length - 1;
        g.fillStyle = last ? '#ff5fa8' : '#a77bff'; g.beginPath(); g.arc(q[0], q[1], last ? 3.2 : 2.2, 0, Math.PI * 2); g.fill();
        if (last && !reduce) { var p = (now / 1400) % 1; g.strokeStyle = 'rgba(255,95,168,' + (1 - p) + ')'; g.beginPath(); g.arc(q[0], q[1], 3 + p * 12, 0, Math.PI * 2); g.stroke(); }
      });
    }
    size(); window.addEventListener('resize', size);
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { vis = es[0].isIntersecting; }).observe(cv);
    var last = performance.now();
    (function loop(now) {
      var dt = Math.min(0.05, (now - last) / 1000); last = now;
      if (vis && !document.hidden) { if (!reduce) yaw += dt * 0.25; draw(now); }
      requestAnimationFrame(loop);
    })(last);
  })();

  /* ---------- 06 · crew status: Doufu does zoomies, Pidan hides in his box ---------- */
  (function () {
    var cv = $('mc-dogs'); if (!cv || !P) return;
    var st = P.mkStage(cv, { scale: function (w) { return w < 300 ? 2 : 3; } }), x = 40, dir = 1;
    function frame(dt, now) {
      var g = st.g, W = st.W, H = st.H, s = st.s, floor = H - 8;
      g.clearRect(0, 0, W, H);
      g.fillStyle = 'rgba(255,122,92,.18)'; g.fillRect(0, floor, W, 2);
      var boxX = W - 22 * s, boxTop = floor - 10 * s;
      if (!reduce) { x += dir * dt * W * 0.35; if (x > boxX - 30 * s) { x = boxX - 30 * s; dir = -1; } if (x < 6) { x = 6; dir = 1; } }
      var far = Math.abs(x + 12 * s - boxX) > W * 0.4, peek = far ? Math.min(6, Math.floor(now / 120) % 30) : 0;
      if (peek) P.spr(g, P.PIDAN_HEAD, boxX + 2 * s, boxTop + 2 * s - peek * s, s, P.PIDAN);
      P.drawBox(g, boxX, boxTop, s);
      var rows = reduce ? P.dogFrame('sit', 0) : P.dogFrame('run', now);
      P.spr(g, rows, x, floor - rows.length * s, s, P.DOUFU, dir < 0);
    }
    if (reduce) frame(0, 0); else st.loop(frame);
  })();

  /* ---------- 08 · progress ---------- */
  function hint() {
    var f = JT.found(), next = JT.ACH.filter(function (a) { return a.secret && !f[a.id]; })[0];
    $('mc-hint').textContent = next ? 'Next secret: ' + next.hint : 'You\'ve found every secret. Impressive, and slightly concerning.';
  }
  hint();
  $('mc-achbtn').addEventListener('click', function () { var b = $('achbtn'); if (b) b.click(); });
  document.addEventListener('click', function () { setTimeout(hint, 400); });

  /* ---------- 05 · the terminal ---------- */
  LAB.whenBooted(function () { LAB.demo($('term-host')); });
})();
