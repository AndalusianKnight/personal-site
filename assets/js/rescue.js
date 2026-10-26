/* Rescue: the dog tags, three tiny games (DOUFU.EXE, CHASE.EXE, TREATS.EXE) and the GOOD_HOME.EXE wizard.
   Sprites and canvas helpers come from pixel.js (JT.PX). */
(function () {
  var JT = window.JT, SFX = JT.SFX, reduce = JT.reduce, PX = JT.PX;
  function $(id) { return document.getElementById(id); }
  var spr = PX.spr, clamp = PX.clamp, mkStage = PX.mkStage, bubbleText = PX.bubbleText, drawBox = PX.drawBox;
  var chaser = PX.chaser, chaseStep = PX.chaseStep, drawChaser = PX.drawChaser, PIDAN_HEAD = PX.PIDAN_HEAD, PIDAN = PX.PIDAN;

  /* saying hi to either dog counts */
  [].forEach.call(document.querySelectorAll('.photo.dog'), function (p) {
    p.addEventListener('pointerenter', function () { JT.achieve('dogs'); });
    p.addEventListener('click', function () { JT.achieve('dogs'); });
    p.addEventListener('focus', function () { JT.achieve('dogs'); });
  });

  /* ---------- GOOD_HOME.EXE ---------- */
  (function () {
    var box = $('wizard'); if (!box) return;
    var lis = box.querySelectorAll('li'), bar = $('wbar'), s = $('wizard-s'), step = lis.length, started = false;
    function paint() {
      [].forEach.call(lis, function (li, i) { li.className = i < step ? '' : (i === step ? 'run' : 'todo'); li.querySelector('i').textContent = i < step ? 'OK' : (i === step ? 'RUNNING' : 'WAITING'); });
      bar.style.width = (step / lis.length * 100) + '%';
      s.textContent = step >= lis.length ? lis.length + ' of ' + lis.length + ' complete · one more good home' : 'Step ' + (step + 1) + ' of ' + lis.length;
    }
    function go() { step = 0; paint(); var t = setInterval(function () { step += 1; paint(); SFX.blip(); if (step >= lis.length) { clearInterval(t); setTimeout(function () { started = false; }, 4000); } }, 700); }
    if (reduce || !('IntersectionObserver' in window)) return;
    step = 0; paint();
    new IntersectionObserver(function (es) { if (es[0].isIntersecting && !started) { started = true; go(); } }, { threshold: 0.6 }).observe(box);
  })();

  /* ---------- DOUFU.EXE: Doufu runs after your cursor ---------- */
  (function () {
    var cv = $('dz-cv'); if (!cv) return;
    var st = mkStage(cv), msg = $('dz-msg'), d = chaser(190), lastMsg = '', said = false;
    var idleMsg = JT.touch ? 'Touch in here' : 'Move your cursor in here';
    st.loop(function (dt, now) {
      var g = st.g, W = st.W, H = st.H, s = st.s, dw = 24 * s, minY = 14 * s + 30, maxY = H - 8;
      if (!d.y) { d.x = W * 0.3; d.y = maxY; }
      var tx = st.px == null ? d.x : clamp(st.px, dw / 2, W - dw / 2), ty = st.py == null ? d.y : clamp(st.py + 14, minY, maxY);
      chaseStep(d, tx, ty, dt);
      g.fillStyle = '#07060b'; g.fillRect(0, 0, W, H);
      g.fillStyle = '#100e16'; for (var k = 0; k < W; k += 28) g.fillRect(k, 0, 1, H);
      if (st.px != null) { g.fillStyle = 'rgba(255,179,64,.35)'; g.fillRect(Math.round(st.px) - 1, Math.round(st.py) + 16, 3, 3); }
      drawChaser(g, d, d.x, d.y, s, now);
      var m = d.state === 'run' ? 'Doufu is on her way' : (d.state === 'lie' ? 'Asleep. Move to wake her up' : (st.px == null ? idleMsg : 'Sitting. Good girl'));
      if (m !== lastMsg) { msg.textContent = m; lastMsg = m; if (d.state === 'run' && !said) { said = true; JT.achieve('dogs'); } }
    });
    var btn = $('dz-loose');
    function sync(on) { btn.setAttribute('aria-pressed', String(on)); btn.textContent = on ? 'Call Doufu back' : 'Let her loose on the whole site'; }
    JT.doufu.hook(sync); sync(JT.doufu.on());
    btn.addEventListener('click', function (e) { e.stopPropagation(); JT.doufu.toggle(btn); });
  })();

  /* ---------- CHASE.EXE: you chase Doufu, Pidan hides ---------- */
  (function () {
    var cv = $('ch-cv'); if (!cv) return;
    var st = mkStage(cv), msg = $('ch-msg'), score = $('ch-score'), caught = 0, said = '', saidT = 0, lastMsg = '';
    var d = { x: 0, y: 0, vx: 50, vy: 0, face: 1, cool: 0, tx: 0, ty: 0, wt: 0 }, pid = 0;
    st.loop(function (dt, now) {
      var g = st.g, W = st.W, H = st.H, s = st.s, dw = 24 * s, dh = 14 * s, minY = dh + 28, maxY = H - 6;
      var boxW = 16 * s, boxH = 10 * s, boxX = W - boxW - 20, boxY = H - boxH - 8;
      if (!d.y) { d.x = W * 0.3; d.y = H * 0.75; d.tx = d.x; d.ty = d.y; }
      var p = st.px != null ? { x: st.px, y: st.py } : null, fleeing = false;
      if (d.cool > 0) d.cool -= dt;
      if (p) {
        var ex = d.x - p.x, ey = (d.y - dh / 2) - p.y, ed = Math.hypot(ex, ey) || 1;
        if (ed < Math.max(20, dw * 0.38) && d.cool <= 0) {
          caught += 1; d.cool = 1.3; said = caught === 1 ? 'CAUGHT! AGAIN!' : (caught % 5 === 0 ? 'OK OK. AGAIN!' : 'AGAIN!'); saidT = 1.4; SFX.tick(); SFX.blip();
          d.vx = (p.x < W / 2 ? 1 : -1) * 460; d.vy = (Math.random() - 0.5) * 300;
          score.textContent = 'Caught ' + caught; JT.achieve('dogs');
        } else if (ed < 160) {
          fleeing = true; var f = (160 - ed) / 160;
          d.vx += ex / ed * 1100 * f * dt; d.vy += ey / ed * 1100 * f * dt;
          var atWall = d.x < dw * 0.6 || d.x > W - dw * 0.6 || d.y < minY + 6 || d.y > maxY - 6;
          if (atWall && ed < 90 && Math.random() < 0.03) { d.vy += (Math.random() < 0.5 ? -1 : 1) * 420; d.vx += (W / 2 - d.x) * 1.5; }
        }
      }
      if (!fleeing) {
        d.wt -= dt; if (d.wt <= 0) { d.wt = 1 + Math.random() * 2; d.tx = 30 + Math.random() * (W - 60); d.ty = minY + Math.random() * (maxY - minY); }
        d.vx += (d.tx - d.x) * 1.2 * dt; d.vy += (d.ty - d.y) * 1.2 * dt;
      }
      var sp = Math.hypot(d.vx, d.vy), max = d.cool > 0 ? 460 : 280;
      if (sp > max) { d.vx *= max / sp; d.vy *= max / sp; }
      var fr = Math.pow(fleeing ? 0.4 : 0.15, dt); d.vx *= fr; d.vy *= fr;
      d.x += d.vx * dt; d.y += d.vy * dt;
      if (d.x < dw / 2) { d.x = dw / 2; d.vx = Math.abs(d.vx) * 0.5; }
      if (d.x > W - dw / 2) { d.x = W - dw / 2; d.vx = -Math.abs(d.vx) * 0.5; }
      if (d.y < minY) { d.y = minY; d.vy = Math.abs(d.vy) * 0.5; }
      if (d.y > maxY) { d.y = maxY; d.vy = -Math.abs(d.vy) * 0.5; }
      if (Math.abs(d.vx) > 10) d.face = d.vx > 0 ? 1 : -1;
      /* Pidan rises only when you and Doufu are both far from his box */
      var bcx = boxX + boxW / 2, far = !p || Math.hypot(p.x - bcx, p.y - boxY) > 170, dogNear = Math.abs(d.x - bcx) < 100 && Math.abs(d.y - boxY) < 90;
      pid = clamp(pid + (far && !dogNear ? 7 : -40) * dt, 0, 9);
      g.fillStyle = '#0a130f'; g.fillRect(0, 0, W, H);
      g.fillStyle = '#0e1a14'; for (var k = 0; k < W; k += 32) g.fillRect(k, 0, 16, H);
      if (pid > 0.4) { g.save(); g.beginPath(); g.rect(0, 0, W, boxY + s); g.clip(); spr(g, PIDAN_HEAD, bcx - 6 * s, boxY + 2 * s - Math.round(pid) * s, s, PIDAN); g.restore(); }
      drawBox(g, boxX, boxY, s);
      if (pid > 7.5) { g.font = '11px "Space Mono", monospace'; g.fillStyle = '#9b96a8'; g.fillText('pidan is watching', Math.max(4, boxX - 60), boxY - 12 * s); }
      var moving = Math.hypot(d.vx, d.vy) > 35;
      drawChaser(g, { state: moving ? 'run' : 'sit', face: d.face, alert: 0 }, d.x, d.y, s, now);
      if (saidT > 0) { saidT -= dt; bubbleText(g, clamp(d.x - 40, 4, W - 120), d.y - dh - 26, said); }
      else if (p && !fleeing && !moving && Math.floor(now / 1800) % 2) bubbleText(g, clamp(d.x + (d.face > 0 ? 10 : -90), 4, W - 100), d.y - dh - 26, 'CHASE ME!');
      var m = p ? 'Corner her against a wall' : (JT.touch ? 'Touch and drag to chase her' : 'Move in to chase her');
      if (m !== lastMsg) { msg.textContent = m; lastMsg = m; }
    });
  })();

  /* ---------- TREATS.EXE ---------- */
  (function () {
    var cv = $('tr-cv'); if (!cv) return;
    var st = mkStage(cv), msg = $('tr-msg'), n = { d: 0, p: 0, s: 0, all: +(JT.store('jt-treats') || 0) || 0 };
    var dog = chaser(260), treats = [], pid = 0, wait = null, lastAct = performance.now(), heart = 0, heartC = '#ff7a5c';
    var BONE = ['bb...bb', '.bbbbb.', 'bb...bb'], BP = { b: '#e3b06a' };
    st.cv.addEventListener('pointermove', function () { lastAct = performance.now(); });
    st.cv.addEventListener('pointerdown', function (e) { lastAct = performance.now(); var r = st.cv.getBoundingClientRect(); if (e.clientX - r.left < 70) toss(); });
    function sync() { $('tr-d').textContent = n.d; $('tr-p').textContent = n.p; $('tr-s').textContent = n.s; $('tr-all').textContent = n.all; }
    function jar() { return { x: 40, y: st.H - 64 }; }
    function thrown() { n.all += 1; JT.store('jt-treats', String(n.all)); }
    function toss() {
      SFX.click(); thrown(); lastAct = performance.now();
      var j = jar(), tx = st.W * (0.3 + Math.random() * 0.3);
      treats.push({ sx: j.x, sy: j.y, tx: tx, ty: st.H - 12, t: 0, dur: 0.75, who: 'd', x: j.x, y: j.y, k: 0 });
      msg.textContent = 'Incoming!'; sync();
    }
    function leave() {
      if (wait) { msg.textContent = 'One at a time. Pidan is shy.'; return; }
      SFX.click(); thrown(); lastAct = performance.now();
      var j = jar(), boxX = st.W - 16 * st.s - 20;
      var t = { sx: j.x, sy: j.y, tx: boxX - 18, ty: st.H - 12, t: 0, dur: 0.9, who: 'p', x: j.x, y: j.y, k: 0 };
      treats.push(t); wait = { t: t, since: performance.now() + 900, taken: false };
      msg.textContent = 'Keep still. Pidan is thinking about it.'; sync();
    }
    $('tr-toss').addEventListener('click', toss);
    $('tr-leave').addEventListener('click', leave);
    function eat(t, who) {
      treats.splice(treats.indexOf(t), 1); SFX.crunch(); heart = 1; JT.achieve('dogs');
      if (who === 'd') { n.d += 1; heartC = '#ff7a5c'; msg.textContent = 'Doufu caught it. Of course she did.'; }
      else if (who === 's') { n.s += 1; heartC = '#ff7a5c'; msg.textContent = 'Doufu stole Pidan\'s treat. Again.'; wait = null; }
      sync();
    }
    sync();
    st.loop(function (dt, now) {
      var g = st.g, W = st.W, H = st.H, s = st.s, floor = H - 8, boxW = 16 * s, boxH = 10 * s, boxX = W - boxW - 20, boxY = floor - boxH;
      if (!dog.y) { dog.x = W * 0.45; dog.y = floor; }
      treats.forEach(function (t) { t.t += dt; t.k = Math.min(1, t.t / t.dur); t.x = t.sx + (t.tx - t.sx) * t.k; t.y = t.sy + (t.ty - t.sy) * t.k - Math.sin(t.k * Math.PI) * 70; });
      /* Doufu goes for any treat meant for her, or one she's decided to steal */
      var mine = treats.filter(function (t) { return t.who === 'd' || t.who === 's'; })[0];
      if (wait && !wait.taken && wait.t.who === 'p' && wait.t.k >= 1 && now - wait.since > 7000) { wait.t.who = 's'; mine = wait.t; msg.textContent = 'Too slow. Doufu has spotted it.'; }
      if (mine) {
        chaseStep(dog, mine.tx, floor, dt, 6);
        if (Math.abs(dog.x - mine.x) < 18 && mine.k > 0.55) eat(mine, mine.who);
      } else chaseStep(dog, W * 0.45, floor, dt, 8);
      /* Pidan comes out only after 2.5 s of stillness */
      var still = now - Math.max(lastAct, wait ? wait.since : 0), want = wait && !wait.taken && wait.t.who === 'p' && wait.t.k >= 1 && still > 2500;
      if (wait && !wait.taken && wait.t.k >= 1 && still <= 2500 && wait.t.who === 'p' && msg.textContent.indexOf('Keep still') < 0) msg.textContent = 'Keep still. He won\'t come out while you\'re watching.';
      pid = clamp(pid + (want ? 6 : -30) * dt, 0, 9);
      if (want && pid >= 8.9) {
        wait.taken = true; treats.splice(treats.indexOf(wait.t), 1); n.p += 1; SFX.crunch(); heart = 1; heartC = '#c98a4b'; JT.achieve('dogs');
        msg.textContent = 'Pidan took it. Brave boy.'; sync();
        setTimeout(function () { wait = null; }, 600);
      }
      g.fillStyle = '#0b0a10'; g.fillRect(0, 0, W, H);
      g.fillStyle = '#1a1622'; g.fillRect(0, floor, W, 2);
      var jx = 18, jy = floor - 54;
      g.fillStyle = 'rgba(155,150,168,.22)'; g.fillRect(jx, jy, 44, 54);
      g.fillStyle = '#9b96a8'; g.fillRect(jx - 2, jy - 8, 48, 8);
      g.fillStyle = 'rgba(239,234,245,.25)'; g.fillRect(jx + 4, jy + 6, 3, 40);
      for (var b = 0; b < 7; b++) spr(g, BONE, jx + 4 + (b % 3) * 12, floor - 10 - Math.floor(b / 3) * 9, 2, BP);
      g.font = '10px "Space Mono", monospace'; g.fillStyle = '#9b96a8'; g.fillText('TREATS', jx + 2, jy - 12);
      if (pid > 0.4) { g.save(); g.beginPath(); g.rect(0, 0, W, boxY + s); g.clip(); spr(g, PIDAN_HEAD, boxX + boxW / 2 - 6 * s, boxY + 2 * s - Math.round(pid) * s, s, PIDAN); g.restore(); }
      drawBox(g, boxX, boxY, s);
      treats.forEach(function (t) { spr(g, BONE, t.x - 7, t.y - 3, 2, BP); });
      drawChaser(g, dog, dog.x, floor, s, now);
      if (heart > 0) {
        heart -= dt * 0.8; g.globalAlpha = Math.max(0, heart); g.fillStyle = heartC; g.font = '18px "Space Mono", monospace';
        var pidanHeart = heartC === '#c98a4b';
        g.fillText('♥', pidanHeart ? boxX + boxW / 2 - 6 : dog.x - 6, (pidanHeart ? boxY - 12 * s : floor - 14 * s - 10) - (1 - heart) * 20); g.globalAlpha = 1;
      }
    });
  })();
})();
