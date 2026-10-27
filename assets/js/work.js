/* Work and the six product pages: floppy disks, tabs, the Tauria decrypt-on-arrival,
   and three playable demos (REBU.EXE, ZEBEE.EXE, ZERO_KNOWLEDGE.EXE). */
(function () {
  var JT = window.JT, SFX = JT.SFX, reduce = JT.reduce, PX = JT.PX;
  function $(id) { return document.getElementById(id); }
  var GLYPHS = JT.GLYPHS;

  /* ---------- floppy disks: click one and it ejects into the drive ---------- */
  document.querySelectorAll('.disk').forEach(function (d) {
    d.setAttribute('data-nosfx', '');
    d.addEventListener('click', function (e) {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button) return;
      SFX.unlock(); SFX.floppy(); JT.achieve('disk');
      if (!reduce) d.classList.add('eject');
    });
  });
  window.addEventListener('pageshow', function (e) { if (e.persisted) document.querySelectorAll('.disk.eject').forEach(function (d) { d.classList.remove('eject'); }); });

  var scramble = JT.scramble;
  function hexLine() { var s = ''; for (var i = 0; i < 96; i++) s += '0123456789abcdef'[(Math.random() * 16) | 0] + (i % 2 ? ' ' : ''); return s; }

  /* ---------- product page ---------- */
  var content = $('pw-content');
  if (content) {
    JT.achieve('disk');
    var enc = !!document.querySelector('.pwin.enc');
    var tablist = document.querySelector('.ptabs'), tabs = [].slice.call(tablist.querySelectorAll('[role="tab"]')), body = $('pw-body');
    var panels = tabs.map(function (t) { return $(t.getAttribute('aria-controls')); });
    function select(i, opts) {
      opts = opts || {};
      tabs.forEach(function (t, k) { var on = k === i; t.setAttribute('aria-selected', String(on)); t.tabIndex = on ? 0 : -1; panels[k].hidden = !on; });
      if (opts.focus) tabs[i].focus();
      if (opts.hash) history.replaceState(null, '', '#' + panels[i].id.replace(/^p-/, ''));
      if (enc && opts.fx && !reduce) { SFX.decrypt(0.4); scramble(panels[i], 400); }
    }
    tablist.hidden = false; body.classList.add('tabbed');
    tabs.forEach(function (t, k) {
      t.addEventListener('click', function () { select(k, { hash: true, fx: true }); });
      t.addEventListener('keydown', function (e) {
        var n = { ArrowRight: k + 1, ArrowLeft: k - 1, Home: 0, End: tabs.length - 1 }[e.key];
        if (n === undefined) return;
        e.preventDefault(); SFX.click(); select((n + tabs.length) % tabs.length, { focus: true, hash: true, fx: true });
      });
    });
    var start = 0, h = location.hash.slice(1);
    panels.forEach(function (p, k) { if (h && p.id === 'p-' + h) start = k; });
    select(start);

    if (enc) {
      var crypt = $('pw-crypt'), ct = $('pw-crypt-t'), hx = $('pw-hex'), bar = $('pw-cbar');
      var finish = function () {
        crypt.classList.add('done'); ct.textContent = 'Decrypted on your device · the server never saw it'; hx.textContent = 'key verified · AES-256 · zero knowledge';
        JT.achieve('decrypt');
      };
      content.classList.add('ready');
      if (reduce) finish();
      else {
        crypt.classList.remove('done'); ct.textContent = 'Encrypted · decrypting on your device'; bar.style.width = '0';
        var hexTimer = setInterval(function () { hx.textContent = hexLine(); }, 70);
        setTimeout(function () { SFX.decrypt(1.5); }, 350);
        scramble(content, 1900, function () { clearInterval(hexTimer); finish(); }, function (p) { bar.style.width = (p * 100) + '%'; });
      }
    } else if (!reduce) { var wi = content.parentNode; wi.classList.add('loading'); }
  }

  /* ---------- REBU.EXE: hail a taxi or a limo ---------- */
  if ($('rb-cv') && PX) (function () {
    var clamp = PX.clamp, st = PX.mkStage($('rb-cv')), msg = $('rb-msg'), cnt = $('rb-n'), kind = 'taxi', car = null, city = null, cityW = 0, rides = 0;
    var tb = $('rb-taxi'), lb = $('rb-limo');
    function pick(k) { kind = k; tb.setAttribute('aria-pressed', String(k === 'taxi')); lb.setAttribute('aria-pressed', String(k === 'limo')); tb.classList.toggle('ghost', k !== 'taxi'); lb.classList.toggle('ghost', k !== 'limo'); }
    tb.addEventListener('click', function () { pick('taxi'); });
    lb.addEventListener('click', function () { pick('limo'); });
    function build(W, H) {
      var seed = 7, rnd = function () { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }, out = [], x = 0;
      while (x < W) { var w = 26 + rnd() * 46, h = H * (0.18 + rnd() * 0.32), wins = []; for (var yy = 8; yy < h - 6; yy += 10) for (var xx = 5; xx < w - 6; xx += 9) if (rnd() < 0.45) wins.push([xx, yy]); out.push({ x: x, w: w, h: h, wins: wins, c: rnd() < 0.5 ? '#15121e' : '#1b1726' }); x += w + 2; }
      return out;
    }
    function hail(x) {
      if (car) return;
      x = clamp(x, 40, st.W - 40);
      var len = (kind === 'limo' ? 46 : 30) * st.s;
      car = { kind: kind, pin: x, x: -len - 10, len: len, t: 0, phase: 'find' }; SFX.click();
      msg.textContent = 'Finding a driver…';
    }
    st.cv.addEventListener('pointerdown', function (e) { var r = st.cv.getBoundingClientRect(); hail(e.clientX - r.left); });
    st.cv.tabIndex = 0;
    st.cv.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); hail(st.W * (0.3 + Math.random() * 0.4)); } });
    function drawCar(g, c, y, s) {
      var x = Math.round(c.x), L = c.len, limo = c.kind === 'limo';
      var body = limo ? '#34323f' : '#ffcc33', cab = limo ? '#2a2833' : '#ffcc33', win = limo ? '#56607a' : '#22424c';
      g.fillStyle = cab; g.fillRect(x + 6 * s, y - 7 * s, L - 14 * s, 4 * s);
      g.fillStyle = win; var n = limo ? 5 : 2, ww = (L - 18 * s) / n;
      for (var k = 0; k < n; k++) g.fillRect(Math.round(x + 8 * s + k * ww), y - 6 * s, Math.round(ww - s), 2 * s);
      g.fillStyle = body; g.fillRect(x, y - 3 * s, L, 4 * s);
      if (limo) { g.fillStyle = '#c9c4d6'; g.fillRect(x + s, y - 2 * s, L - 2 * s, Math.max(1, Math.round(s / 2))); g.fillStyle = '#4a4757'; g.fillRect(x + 6 * s, y - 8 * s, L - 14 * s, s); }
      else { g.fillStyle = '#14121b'; for (var q = 0; q < L - 4 * s; q += 2 * s) g.fillRect(x + 2 * s + q, y - s, s, s); g.fillStyle = '#efeaf5'; g.fillRect(x + L / 2 - 3 * s, y - 9 * s, 6 * s, 2 * s); g.fillStyle = '#14121b'; g.font = Math.max(7, 2 * s) + 'px "Space Mono", monospace'; g.fillText('TAXI', x + L / 2 - 3 * s + 1, y - 7 * s - 1); }
      if (c.phase === 'wait') { g.fillStyle = 'rgba(255,242,179,.55)'; g.fillRect(Math.round(x + L / 2 - 2 * s), y - 6 * s, 3 * s, 5 * s); }
      g.fillStyle = '#0a090d'; g.fillRect(x + 3 * s, y + s, 5 * s, 3 * s); g.fillRect(x + L - 9 * s, y + s, 5 * s, 3 * s);
      g.fillStyle = '#fff8c0'; g.fillRect(x + L - s, y - 2 * s, s, s);
      g.fillStyle = '#ff3b4a'; g.fillRect(x, y - 2 * s, s, s);
      var hl = g.createLinearGradient(x + L, 0, x + L + 70, 0); hl.addColorStop(0, 'rgba(255,248,192,.22)'); hl.addColorStop(1, 'rgba(255,248,192,0)'); g.fillStyle = hl; g.beginPath(); g.moveTo(x + L, y - 2 * s); g.lineTo(x + L + 70, y - 5 * s); g.lineTo(x + L + 70, y + 3 * s); g.closePath(); g.fill();
    }
    function person(g, x, y, s, wave, now) {
      g.fillStyle = '#e7c9a8'; g.fillRect(x - s, y - 10 * s, 2 * s, 2 * s);
      g.fillStyle = '#a77bff'; g.fillRect(x - s, y - 8 * s, 2 * s, 4 * s);
      g.fillStyle = '#e7c9a8'; if (wave) g.fillRect(x + s, y - 11 * s + (Math.floor(now / 200) % 2) * s, s, 3 * s);
      g.fillStyle = '#2a2733'; g.fillRect(x - s, y - 4 * s, s, 4 * s); g.fillRect(x, y - 4 * s, s, 4 * s);
    }
    st.loop(function (dt, now) {
      var g = st.g, W = st.W, H = st.H, s = st.s, walkY = Math.round(H * 0.6), roadY = Math.round(H * 0.68), laneY = Math.round(H * 0.86);
      if (cityW !== W) { city = build(W, H); cityW = W; }
      var sky = g.createLinearGradient(0, 0, 0, walkY); sky.addColorStop(0, '#07060b'); sky.addColorStop(1, '#1a1030'); g.fillStyle = sky; g.fillRect(0, 0, W, walkY);
      city.forEach(function (b) { g.fillStyle = b.c; g.fillRect(b.x, walkY - b.h, b.w, b.h); g.fillStyle = 'rgba(255,214,120,.55)'; b.wins.forEach(function (w) { g.fillRect(b.x + w[0], walkY - b.h + w[1], 4, 4); }); });
      g.fillStyle = '#2a2733'; g.fillRect(0, walkY, W, roadY - walkY);
      g.fillStyle = '#121017'; g.fillRect(0, roadY, W, H - roadY);
      g.fillStyle = '#4a4558'; for (var k = 0; k < W; k += 40) g.fillRect(k, laneY, 20, 2);
      if (car) {
        car.t += dt;
        var stopX = car.pin - car.len / 2;
        if (car.phase === 'find' && car.t > 0.8) { car.phase = 'in'; car.t = 0; msg.textContent = 'Driver found. Arriving now'; }
        if (car.phase === 'in') { var k2 = Math.min(1, car.t / 1.6), e = 1 - Math.pow(1 - k2, 3); car.x = (-car.len - 10) + (stopX + car.len + 10) * e; if (k2 >= 1) { car.phase = 'wait'; car.t = 0; SFX.honk(); msg.textContent = 'Your ' + car.kind + ' has arrived'; } }
        else if (car.phase === 'wait' && car.t > 1.1) { car.phase = 'out'; car.t = 0; rides += 1; cnt.textContent = 'Rides ' + rides; msg.textContent = rides === 3 ? 'Three rides. You\'re a better customer than most taxi owners were' : 'On the way'; }
        else if (car.phase === 'out') { car.x = stopX + Math.pow(car.t, 2) * 260; if (car.x > W + 20) { car = null; msg.textContent = 'Tap the sidewalk to hail another'; } }
        if (car && car.phase !== 'out') person(g, Math.round(car.pin), walkY + Math.round((roadY - walkY) * 0.7), s, car.phase !== 'wait' || car.t < 0.5, now);
        if (car) drawCar(g, car, roadY + 10 * s, s);
      }
    });
  })();

  /* ---------- ZEBEE.EXE: the Zebu mascot ---------- */
  if ($('zb-cv') && PX) (function () {
    var ZEBU = [
      '.................h..h.',
      '..........ddd....hhhh.',
      '.........ddddd..dggggd',
      '..ggggggggddddggggkggg',
      '.gggggggggggggggggggpp',
      'g.gggggggggggggggwgg..',
      'g.ggggggggggggggww....',
      '..gggggggggggggw......'];
    var ZLEGS = [['..gg.gg......gg.gg....', '..gg.gg......gg.gg....', '..kk.kk......kk.kk....'], ['...gggg......gggg.....', '...gggg......gggg.....', '...kkkk......kkkk.....']];
    var ZPAL = { g: '#cfcac2', d: '#8f8a83', k: '#141414', h: '#efe2c2', p: '#e3a0a0', w: '#f4efe8' };
    var st = PX.mkStage($('zb-cv')), z = { x: 60, face: 1, hop: 0, moo: 0, pause: 0 }, moos = 0, cnt = $('zb-n');
    var LINES = ['MOO.', 'MOO!', 'HAVE YOU MOOED TODAY?', 'MOO. (PIVOT PENDING)', 'MOOOOO.'];
    function moo() { SFX.moo(); z.moo = 1.6; z.hop = 0.35; z.pause = 1.2; moos += 1; cnt.textContent = 'Moos ' + moos; }
    st.cv.addEventListener('pointerdown', moo);
    st.cv.tabIndex = 0;
    st.cv.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); moo(); } });
    st.loop(function (dt, now) {
      var g = st.g, W = st.W, H = st.H, s = st.s + 1, zw = 22 * s, floor = H - 22;
      g.fillStyle = '#0b120c'; g.fillRect(0, 0, W, H);
      g.fillStyle = '#112016'; g.fillRect(0, floor, W, H - floor);
      g.fillStyle = '#ffb340'; g.beginPath(); g.arc(W - 40, 34, 10, 0, Math.PI * 2); g.fill();
      if (z.pause > 0) z.pause -= dt; else { z.x += z.face * 34 * dt; if (z.x > W - zw - 10) z.face = -1; if (z.x < 10) z.face = 1; }
      if (z.hop > 0) z.hop -= dt;
      var walking = z.pause <= 0, rows = ZEBU.concat(ZLEGS[walking ? Math.floor(now / 220) % 2 : 0]), hy = z.hop > 0 ? -Math.sin(z.hop / 0.35 * Math.PI) * 10 : 0;
      PX.spr(g, rows, z.x, floor - rows.length * s + hy, s, ZPAL, z.face < 0);
      if (z.moo > 0) { z.moo -= dt; var t = LINES[(moos - 1) % LINES.length]; g.font = '11px "Space Mono", monospace'; var tw = g.measureText(t).width + 10; PX.bubbleText(g, PX.clamp(z.face > 0 ? z.x + zw - 30 : z.x - 20, 4, W - tw - 4), floor - rows.length * s - 30, t); }
    });
  })();

  /* ---------- ZERO_KNOWLEDGE.EXE: real AES-GCM in the browser ---------- */
  if ($('zk-ct')) (function () {
    var C = window.crypto && window.crypto.subtle, key = null, packet = null, enc = new TextEncoder(), dec = new TextDecoder();
    var k1 = $('zk-k1'), k2 = $('zk-k2'), ct = $('zk-ct'), out = $('zk-out'), slog = $('zk-slog'), blog = $('zk-blog'), msgEl = $('zk-msg'), quiet = false;
    function hex(u8) { var s = ''; for (var i = 0; i < u8.length; i++) s += ('0' + u8[i].toString(16)).slice(-2); return s; }
    function b64(u8) { var s = ''; for (var i = 0; i < u8.length; i++) s += String.fromCharCode(u8[i]); return btoa(s); }
    function log(el, text, cls) { el.textContent = text; el.className = 'zk-log' + (cls ? ' ' + cls : ''); }
    function snd(name, a) { if (!quiet) SFX[name](a); }
    function newKey(cb) {
      if (!C) { k1.textContent = k2.textContent = 'unavailable'; log(slog, 'This browser has no Web Crypto (it needs HTTPS), so the demo can\'t run here.', 'bad'); return; }
      C.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']).then(function (k) { key = k; return C.exportKey('raw', k); }).then(function (raw) {
        var h = hex(new Uint8Array(raw)); k1.textContent = k2.textContent = 'AES-256 · ' + h.slice(0, 12) + '…' + h.slice(-4);
        packet = null; ct.textContent = 'Nothing yet. Send a message.'; out.textContent = 'Waiting…'; out.classList.remove('bad'); log(slog, ''); log(blog, '');
        if (cb) cb();
      });
    }
    function fly(id, cb) { var el = $(id); el.classList.remove('go'); void el.offsetWidth; el.classList.add('go'); setTimeout(cb, reduce ? 0 : 620); }
    function reveal(el, text) {
      var n = 0, steps = 14;
      (function f() {
        n += 1; var k = Math.floor(text.length * n / steps), s = text.slice(0, k);
        for (var i = k; i < text.length; i++) s += text[i] === ' ' ? ' ' : GLYPHS[(Math.random() * GLYPHS.length) | 0];
        el.textContent = s; if (n < steps && !reduce) setTimeout(f, 40); else el.textContent = text;
      })();
    }
    function showCt() { ct.textContent = 'IV ' + hex(packet.iv) + '\n' + b64(packet.ct); ct.classList.remove('flash'); void ct.offsetWidth; ct.classList.add('flash'); }
    function deliver() {
      var p = packet;
      fly('zk-p2', function () {
        C.decrypt({ name: 'AES-GCM', iv: p.iv }, key, p.ct).then(function (buf) {
          out.classList.remove('bad'); snd('decrypt', 0.7); reveal(out, dec.decode(buf));
          log(blog, 'Unlocked with the shared key. The integrity check passed.', 'ok');
          if (!quiet) JT.achieve('decrypt');
        }, function () {
          out.classList.add('bad'); out.textContent = 'MESSAGE REJECTED'; snd('error');
          log(blog, 'Someone changed this message on the way. The integrity check caught it, so it was thrown away unread.', 'bad');
        });
      });
    }
    function send() {
      if (!key) return;
      var text = msgEl.value.trim() || '(empty message)', iv = window.crypto.getRandomValues(new Uint8Array(12));
      snd('click');
      C.encrypt({ name: 'AES-GCM', iv: iv }, key, enc.encode(text)).then(function (buf) {
        packet = { iv: iv, ct: new Uint8Array(buf) }; out.textContent = '…'; out.classList.remove('bad'); log(slog, ''); log(blog, '');
        fly('zk-p1', function () { showCt(); log(slog, 'Received ' + packet.ct.length + ' bytes of ciphertext. Stored and forwarded without reading.', ''); deliver(); });
      });
    }
    $('zk-send').addEventListener('click', function () { quiet = false; send(); });
    $('zk-new').addEventListener('click', function () { quiet = false; newKey(); });
    $('zk-read').addEventListener('click', function () {
      if (!packet) { log(slog, 'Nothing to read yet.', ''); return; }
      SFX.error(); log(slog, 'DECRYPT FAILED. There\'s no key on this server, so the ciphertext above is all it will ever see.', 'bad');
    });
    $('zk-tamper').addEventListener('click', function () {
      if (!packet) { log(slog, 'Nothing to tamper with yet.', ''); return; }
      quiet = false; var c = packet.ct.slice(); c[(Math.random() * c.length) | 0] ^= 1 << ((Math.random() * 8) | 0);
      packet = { iv: packet.iv, ct: c }; showCt(); SFX.blip(); log(slog, 'Flipped a single bit, then forwarded it anyway.', 'bad'); deliver();
    });
    newKey(function () { quiet = true; send(); });
  })();
})();
