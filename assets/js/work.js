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
  /* ---------- shared by the three Tauria demos below: real AES-GCM, in the browser ---------- */
  var SUB = window.crypto && window.crypto.subtle;
  function hexOf(u8, n) { var s = '', m = Math.min(u8.length, n || u8.length); for (var i = 0; i < m; i++) s += ('0' + u8[i].toString(16)).slice(-2); return s; }
  function zkSay(el, text, cls) { el.textContent = text; el.className = 'zk-log' + (cls ? ' ' + cls : ''); }
  function aesKey() { return SUB.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']); }
  function aesSeal(key, bytes) { var iv = crypto.getRandomValues(new Uint8Array(12)); return SUB.encrypt({ name: 'AES-GCM', iv: iv }, key, bytes).then(function (ct) { return { iv: iv, ct: new Uint8Array(ct) }; }); }
  function fingerprint(key) { return SUB.exportKey('raw', key).then(function (raw) { return SUB.digest('SHA-256', raw); }).then(function (h) { return hexOf(new Uint8Array(h), 8).replace(/(....)/g, '$1 ').trim(); }); }
  function fsize(n) { return n < 1024 ? n + ' B' : n < 1048576 ? (n / 1024).toFixed(1) + ' KB' : (n / 1048576).toFixed(1) + ' MB'; }
  function noCrypto(el) { zkSay(el, 'This browser has no WebCrypto (it needs a secure https page), so this demo can\'t run here.', 'bad'); }

  /* ---------- LOCKBOX.EXE: cut a file into chunks and encrypt each one before it leaves the device ---------- */
  if ($('lbx-chunks')) (function () {
    var drop = $('lbx-drop'), input = $('lbx-file'), list = $('lbx-chunks'), logEl = $('lbx-log'), view = $('lbx-view'), peekB = $('lbx-peek'), openB = $('lbx-open');
    var box = null, busy = false;
    if (!SUB) { noCrypto(logEl); return; }
    var SAMPLE_NAME = 'contract_FINAL_v7_actually_final.txt';
    var SAMPLE = 'This agreement is made in Shanghai between Pidan ("the Good Boy") and Doufu ("the Other One").\n\n' +
      '1. Pidan keeps the sofa. Doufu keeps the bed. Nobody keeps the cat.\n2. Neither party shall eat the other party\'s homework.\n' +
      '3. Treats are split 50/50 and audited nightly.\n4. Walks happen at 7:00 and 19:00, rain or shine.\n5. Any squirrel sighted is jointly owned.\n\nSigned with two paw prints.';
    function lock(name, buf) {
      if (busy) return;
      if (buf.byteLength > 25 * 1048576) { zkSay(logEl, 'That one is over 25 MB. Try something smaller.', 'bad'); return; }
      busy = true; view.hidden = true; peekB.disabled = openB.disabled = true;
      var bytes = new Uint8Array(buf), n = Math.min(12, Math.max(3, Math.ceil(bytes.length / 2048))), size = Math.max(1, Math.ceil(bytes.length / n)), key, hash;
      $('lbx-name').textContent = name + ' · ' + fsize(bytes.length) + ' · cut into ' + n + ' chunks';
      list.innerHTML = '';
      SUB.digest('SHA-256', bytes).then(function (h) { hash = hexOf(new Uint8Array(h)); return aesKey(); })
        .then(function (k) { key = k; return fingerprint(k); })
        .then(function (fp) {
          $('lbx-key').textContent = fp;
          var jobs = [];
          for (var i = 0; i < n; i++) jobs.push(aesSeal(key, bytes.subarray(i * size, Math.min(bytes.length, (i + 1) * size))));
          return Promise.all(jobs);
        })
        .then(function (chunks) {
          box = { name: name, key: key, chunks: chunks, hash: hash, text: /\.(txt|md|csv|json|html?|js|css|svg|xml)$/i.test(name) };
          var total = 0;
          chunks.forEach(function (c, i) {
            total += c.ct.length;
            var el = document.createElement('div'); el.className = 'lbx-c'; el.style.setProperty('--i', i);
            el.innerHTML = '<b>' + JT.two(i + 1) + '</b><code>' + hexOf(c.ct, 9) + '…</code><small>' + fsize(c.ct.length) + '</small>';
            list.appendChild(el);
          });
          SFX.decrypt(0.6);
          zkSay(logEl, 'Stored ' + chunks.length + ' encrypted chunks, ' + fsize(total) + ' in all, each with its own IV. Lockbox has no key.', '');
          peekB.disabled = openB.disabled = false; busy = false;
        }, function () { busy = false; zkSay(logEl, 'Something went wrong encrypting that file. Try another one.', 'bad'); });
    }
    function readFile(f) { if (!f) return; var r = new FileReader(); r.onload = function () { lock(f.name, r.result); }; r.readAsArrayBuffer(f); }
    input.addEventListener('change', function () { readFile(input.files[0]); input.value = ''; });
    ['dragenter', 'dragover'].forEach(function (t) { drop.addEventListener(t, function (e) { e.preventDefault(); drop.classList.add('over'); }); });
    ['dragleave', 'drop'].forEach(function (t) { drop.addEventListener(t, function () { drop.classList.remove('over'); }); });
    drop.addEventListener('drop', function (e) { e.preventDefault(); readFile(e.dataTransfer && e.dataTransfer.files[0]); });
    $('lbx-sample').addEventListener('click', function () { lock(SAMPLE_NAME, new TextEncoder().encode(SAMPLE).buffer); });
    peekB.addEventListener('click', function () {
      if (!box) return;
      var c = box.chunks[0].ct, s = '';
      for (var i = 0; i < Math.min(c.length, 260); i++) s += String.fromCharCode(33 + (c[i] % 94));
      view.hidden = false; view.className = 'lbx-view noise screen-dark'; view.textContent = s;
      SFX.error(); zkSay(logEl, 'Lockbox opens chunk 01 without the key and gets noise. It can store, sync and share this file, but never read it.', 'bad');
    });
    openB.addEventListener('click', function () {
      if (!box) return;
      Promise.all(box.chunks.map(function (c) { return SUB.decrypt({ name: 'AES-GCM', iv: c.iv }, box.key, c.ct); })).then(function (parts) {
        var len = parts.reduce(function (a, p) { return a + p.byteLength; }, 0), all = new Uint8Array(len), o = 0;
        parts.forEach(function (p) { all.set(new Uint8Array(p), o); o += p.byteLength; });
        return SUB.digest('SHA-256', all).then(function (h) {
          var ok = hexOf(new Uint8Array(h)) === box.hash;
          view.hidden = false; view.className = 'lbx-view screen-dark';
          view.textContent = box.text ? new TextDecoder().decode(all.subarray(0, 1400)) : '(' + fsize(len) + ' of ' + box.name + ', back in one piece)';
          SFX.page();
          zkSay(logEl, (ok ? '✓ ' : '✗ ') + 'Decrypted ' + parts.length + ' chunks on your device and stitched them back together. The SHA-256 ' + (ok ? 'matches' : 'doesn\'t match') + ' the original: ' + box.hash.slice(0, 16) + '…', ok ? 'ok' : 'bad');
        });
      });
    });
  })();

  /* ---------- FREEBUSY.EXE: four calendars, encrypted; the overlap is found on the organiser's device ---------- */
  if ($('fb-grid')) (function () {
    var grid = $('fb-grid'), logEl = $('fb-log'), view = 'you', hit = -1, sealed = {}, N = 18, T0 = 9;
    var PEOPLE = [
      { id: 'you', name: 'You', city: 'The Hague', off: 0, ev: [[9, 10, 'Standup'], [11, 12.5, 'Board prep'], [14, 15, 'Walk the dogs'], [17, 18, 'Investor call']] },
      { id: 'ana', name: 'Ana', city: 'Lisbon', off: -1, ev: [[12, 13, 'Lunch with a client'], [15, 16, 'Design review']] },
      { id: 'luka', name: 'Luka', city: 'Belgrade', off: 0, ev: [[10, 11.5, 'Sprint planning'], [13, 14, 'Dentist'], [16.5, 17, '1:1']] },
      { id: 'sam', name: 'Sam', city: 'Toronto', off: -6, ev: [[15, 15.5, 'School run'], [17.5, 18, 'Customer call']] }
    ];
    function hm(h) { var m = Math.round(((h % 24) + 24) % 24 * 60); return JT.two(Math.floor(m / 60)) + ':' + JT.two(m % 60); }
    /* each slot: off (outside that person's 9 to 6), busy (with the event's title) or free. Times are The Hague's. */
    function state(p, s) {
      var h = T0 + s / 2, local = h + p.off;
      if (local < 9 || local >= 18) return { k: 'off' };
      for (var i = 0; i < p.ev.length; i++) if (h >= p.ev[i][0] && h < p.ev[i][1]) return { k: 'busy', t: p.ev[i][2], e: i };
      return { k: 'free' };
    }
    function segs(p) {
      var out = [];
      for (var s = 0; s < N; s++) {
        var st = state(p, s), last = out[out.length - 1];
        if (last && last.k === st.k && last.e === st.e) last.n += 1; else out.push({ k: st.k, t: st.t, e: st.e, s: s, n: 1 });
      }
      return out;
    }
    function draw() {
      var html = '<span class="fb-corner">The Hague</span>';
      for (var s = 0; s < N; s += 2) html += '<span class="fb-h" style="grid-column: ' + (s + 2) + ' / span 2">' + (T0 + s / 2) + ':00</span>';
      PEOPLE.forEach(function (p, r) {
        var row = r + 2;
        html += '<span class="fb-who" style="grid-row: ' + row + '"><b>' + p.name + '</b>' + p.city + '</span>';
        if (view === 'server') {
          html += '<span class="fb-seg fb-ct" style="grid-row: ' + row + '; grid-column: 2 / span ' + N + '">' + (sealed[p.id] || 'encrypting…') + '</span>';
          return;
        }
        var mine = (view === p.id);
        segs(p).forEach(function (g) {
          var label = g.k === 'off' ? 'off' : g.k === 'busy' ? (mine ? JT.esc(g.t) : 'busy') : '';
          html += '<span class="fb-seg ' + g.k + (mine && g.k === 'busy' ? ' mine' : '') + '" style="grid-row: ' + row + '; grid-column: ' + (g.s + 2) + ' / span ' + g.n + '">' + label + '</span>';
        });
      });
      if (hit >= 0 && view !== 'server') html += '<span class="fb-hit" style="grid-row: 2 / span ' + PEOPLE.length + '; grid-column: ' + (hit + 2) + ' / span 1"><b>' + hm(T0 + hit / 2) + '</b></span>';
      grid.innerHTML = html;
      grid.classList.toggle('srv', view === 'server');
    }
    document.querySelectorAll('.fb-views [data-view]').forEach(function (b) {
      b.addEventListener('click', function () {
        view = b.getAttribute('data-view'); SFX.click();
        document.querySelectorAll('.fb-views [data-view]').forEach(function (x) { var on = x === b; x.setAttribute('aria-pressed', String(on)); x.classList.toggle('ghost', !on); });
        draw();
        zkSay(logEl, view === 'server' ? 'The server stores and relays four encrypted calendars. It can\'t tell who is busy when, let alone why.'
          : view === 'ana' ? 'Ana sees her own day in full. Everyone else is just busy or free.' : 'You see your own day in full. Everyone else is just busy or free.', view === 'server' ? 'bad' : '');
      });
    });
    $('fb-find').addEventListener('click', function () {
      if (view === 'server') {
        zkSay(logEl, 'The server can\'t do this: it can\'t read the maps. Handing it to your device…', 'bad');
        setTimeout(function () { var b = document.querySelector('.fb-views [data-view="you"]'); b.click(); find(); }, 1100);
        return;
      }
      find();
    });
    function find() {
      hit = -1;
      for (var s = 0; s < N && hit < 0; s++) if (PEOPLE.every(function (p) { return state(p, s).k === 'free'; })) hit = s;
      draw(); SFX.page();
      if (hit < 0) { zkSay(logEl, 'No time works for everyone today.', 'bad'); return; }
      var h = T0 + hit / 2;
      zkSay(logEl, '✓ ' + hm(h) + ' in The Hague works for everyone: that\'s ' + hm(h - 1) + ' in Lisbon, ' + hm(h) + ' in Belgrade and ' + hm(h - 6) + ' in Toronto. Your device found it. The server relayed four encrypted maps and learned nothing.', 'ok');
    }
    draw();
    if (!SUB) { noCrypto(logEl); return; }
    var enc = new TextEncoder();
    PEOPLE.forEach(function (p) {
      aesKey().then(function (k) { return aesSeal(k, enc.encode(JSON.stringify(p.ev))); }).then(function (c) {
        var h = hexOf(c.ct); sealed[p.id] = (h + h).slice(0, 150); if (view === 'server') draw();
      });
    });
  })();

  /* ---------- REKEY.EXE: a group call whose key changes every time someone joins or leaves ---------- */
  if ($('rk-call')) (function () {
    var callEl = $('rk-call'), framesEl = $('rk-frames'), logEl = $('rk-log'), spyB = $('rk-spy');
    var people = [['You', 'var(--violet)'], ['Ana', 'var(--cyan)'], ['Luka', 'var(--amber)']];
    var spare = [['Sam', 'var(--green)'], ['Mei', 'var(--pink)'], ['Omar', 'var(--coral)'], ['Lena', 'var(--text)']];
    var epoch = 0, key = null, last = null, gone = null, vis = true, busy = false;
    if (!SUB) { noCrypto(logEl); return; }
    function draw() {
      callEl.innerHTML = people.map(function (p) { return '<div class="rk-p" style="--c: ' + p[1] + '"><b>' + p[0].charAt(0) + '</b><span>' + p[0] + '</span></div>'; }).join('');
    }
    function frame() {
      if (!key) return;
      var e = epoch;
      aesSeal(key, crypto.getRandomValues(new Uint8Array(24))).then(function (f) {
        last = f;
        var el = document.createElement('code'); el.className = 'rk-f'; el.style.setProperty('--h', String((e * 67 + 200) % 360));
        el.innerHTML = '<b>key #' + e + '</b> ' + hexOf(f.ct, 10);
        framesEl.insertBefore(el, framesEl.firstChild);
        while (framesEl.children.length > 6) framesEl.removeChild(framesEl.lastChild);
      });
    }
    function rotate(msg) {
      busy = true; epoch += 1;
      return aesKey().then(function (k) { key = k; return fingerprint(k); }).then(function (fp) {
        $('rk-key').textContent = fp; $('rk-epoch').textContent = 'Key #' + epoch + ' · held by ' + people.length + ' devices';
        callEl.classList.remove('flash'); void callEl.offsetWidth; callEl.classList.add('flash');
        zkSay(logEl, msg, ''); busy = false; frame();
      });
    }
    $('rk-join').addEventListener('click', function () {
      if (busy) return;
      if (!spare.length) { zkSay(logEl, 'The call is full. Someone has to leave first.', 'bad'); return; }
      var p = spare.shift(); people.push(p); draw(); SFX.blip();
      rotate(p[0] + ' joined. Key #' + (epoch + 1) + ' went to all ' + people.length + ' devices, each copy encrypted for that device alone. ' + p[0] + ' can\'t decrypt anything said before they arrived.');
    });
    $('rk-leave').addEventListener('click', function () {
      if (busy) return;
      if (people.length <= 2) { zkSay(logEl, 'Two people is the smallest call there is. Add someone first.', 'bad'); return; }
      var i = 1 + Math.floor(Math.random() * (people.length - 1)), p = people.splice(i, 1)[0];
      spare.push(p); draw(); SFX.tick();
      gone = { name: p[0], key: key, epoch: epoch };
      spyB.disabled = false; spyB.textContent = 'Listen in with ' + p[0] + '\'s old key';
      rotate(p[0] + ' left. Key #' + (epoch + 1) + ' went to the ' + people.length + ' devices still on the call, so ' + p[0] + '\'s copy of key #' + epoch + ' is now useless.');
    });
    spyB.addEventListener('click', function () {
      if (!gone || !last) return;
      SUB.decrypt({ name: 'AES-GCM', iv: last.iv }, gone.key, last.ct).then(function () { zkSay(logEl, 'That should never happen.', 'bad'); }, function () {
        SFX.error();
        zkSay(logEl, 'Decryption failed: AES-GCM rejected it. ' + gone.name + ' tried the newest frame with key #' + gone.epoch + ' and heard nothing.', 'bad');
      });
    });
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { vis = es[0].isIntersecting; }).observe(callEl);
    if (!reduce) setInterval(function () { if (vis && !document.hidden && !busy) frame(); }, 1100);
    draw();
    rotate('Three people on the call, one shared key. Every frame on the wire is sealed with it.');
  })();
})();
