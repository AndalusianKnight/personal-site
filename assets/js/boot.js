/* First visit of a session: welcome screen, power on, BIOS, drives and tape, READY countdown, then home.
   Space (or the Pause button) freezes it so every line can be read. Skip intro is always one click away. */
(function () {
  var JT = window.JT, SFX = JT.SFX, reduce = JT.reduce, html = document.documentElement;
  function $(id) { return document.getElementById(id); }
  var boot = $('boot'), pre = $('boot-text'), welcome = $('welcome'), ctl = $('bootctl'), skipBtn = $('bootskip');
  if (!boot) return;

  function chk(label, status, cls) { return label + ' ' + new Array(Math.max(3, 34 - label.length)).join('.') + ' <span class="' + (cls || 'ok') + '">' + status + '</span>'; }
  var BOOT = [
    ['<span class="dim">JESSETHE BIOS v2.6  (C) 1984-2026 JESSETHE SYSTEMS</span>', 'beep', 700],
    ['', null, 100],
    [chk('CPU: HUMAN-1 CORE @ 3.2GHz', 'OK'), 'blip', 170],
    [chk('MEMORY TEST: 65536K', 'OK'), 'blip', 280],
    [chk('CAFFEINE LEVEL', 'OPTIMAL'), 'blip', 160],
    [chk('SLEEP SCHEDULE', 'NOT FOUND', 'warn'), 'blip', 200],
    [chk('CITIZENSHIP: CA / BR / PT', 'AUTHORIZED'), 'blip', 160],
    [chk('LANGUAGE PACKS: EN FR PT ZH', '2 INSTALLING', 'warn'), 'blip', 160],
    [chk('HOMES: 13 CITIES ON 4 CONTINENTS', 'OK'), 'blip', 160],
    [chk('FIXED ADDRESS', 'NOMAD', 'warn'), 'blip', 160],
    [chk('CURRENT LOCATION', 'SHANGHAI'), 'blip', 160],
    [chk('HARVARD.ROM  CS + HISTORY', 'CUM LAUDE'), 'blip', 160],
    [chk('GPA REGISTER', '3.91'), 'blip', 160],
    [chk('PM MODULE: BERKELEY HAAS', 'LOADED'), 'blip', 160],
    [chk('HBS CASE COMPETITION', '1ST PLACE'), 'blip', 160],
    [chk('ZEBU.SYS', 'PIVOTED'), 'blip', 160],
    [chk('TAURIA.SYS', 'ACQUIRED'), 'blip', 160],
    [chk('ZERO-KNOWLEDGE ENCRYPTION', 'ENABLED'), 'blip', 160],
    [chk('O2 TANK (SCUBA)', 'FULL'), 'blip', 160],
    [chk('CHALK BAG (BOULDERING)', 'READY'), 'blip', 160],
    [chk('PIDAN.DOG', 'HIDING', 'warn'), 'blip', 160],
    [chk('DOUFU.DOG', 'ZOOMIES'), 'blip', 160],
    [chk('STARGATE: CHEVRON SEVEN', 'LOCKED'), 'blip', 160],
    [chk('D20 CALIBRATION', 'NAT 20'), 'blip', 160],
    ['', null, 100],
    ['DETECTING DRIVES', 'floppy', 220],
    ['  FDD0  ZEBU.DSK      REBU  ZEBU', null, 700],
    ['  FDD1  TAURIA.DSK    CONNECT  LOCKBOX  CAL  CALLS', null, 160],
    ['  HDD0  TRAVEL.LOG  EDUCATION  RESCUE  HOBBIES', null, 160],
    ['', null, 220],
    ['<span class="vi">LOAD "JESSE.SYS",8,1</span>', null, 300]
  ];
  var LOADED = 'LOADING [' + new Array(21).join('█') + '] 100%\n\nREADY.\n';
  var bootBody = BOOT.map(function (l) { return l[0]; }).join('\n') + '\n';
  function anyLine(n) { return '<span class="any">PRESS ANY KEY TO BOOT JESSETHE.COM ... ' + n + '</span> <span class="cursor"></span>'; }

  var phase = html.classList.contains('boot-on') ? 'welcome' : 'home';
  var timers = [], queue = [], qTimer = 0, paused = false, curHTML = '', count = 5;
  JT.blockKeys = function () { return phase !== 'home'; };

  function later(fn, ms) { timers.push(setTimeout(fn, ms)); }
  function seq(d, fn) { queue.push([d, fn]); }
  function pump() { clearTimeout(qTimer); if (paused || !queue.length) return; qTimer = setTimeout(function () { var st = queue.shift(); st[1](); pump(); }, queue[0][0]); }
  function paint(h) {
    curHTML = h;
    pre.innerHTML = h + (paused ? '\n<span class="vi">❚❚ PAUSED · SPACE TO RESUME' + (phase === 'count' ? ' · ANY OTHER KEY TO BOOT' : '') + '</span>' : '');
    var sc = pre.parentNode; sc.scrollTop = sc.scrollHeight;
  }
  function countHTML() { return bootBody + LOADED + (paused ? '' : anyLine(count)); }
  function setPaused(v) {
    if (phase !== 'boot' && phase !== 'count') return;
    paused = v;
    ctl.textContent = v ? '▶ Resume' : '❚❚ Pause'; ctl.setAttribute('aria-pressed', String(v));
    boot.classList.toggle('paused', v);
    paint(phase === 'count' ? countHTML() : curHTML);
    if (v) clearTimeout(qTimer); else pump();
  }
  function clearAll() {
    timers.forEach(clearTimeout); timers = []; queue = []; clearTimeout(qTimer); paused = false;
    ctl.hidden = true; skipBtn.hidden = true; ctl.textContent = '❚❚ Pause'; ctl.setAttribute('aria-pressed', 'false');
    boot.classList.remove('loading', 'poweron', 'degauss', 'paused', 'reveal');
  }
  function powerOn() {
    clearAll();
    welcome.hidden = true;
    phase = 'boot'; ctl.hidden = false; skipBtn.hidden = false;
    if (reduce) { paint(bootBody + LOADED); startCountdown(); return; }
    paint('');
    void boot.offsetWidth; boot.classList.add('poweron');
    SFX.power();
    var out = '';
    seq(300, function () {});
    BOOT.forEach(function (l) { seq(l[2], function () { out += l[0] + '\n'; paint(out + '<span class="cursor"></span>'); if (l[1]) SFX[l[1]](); }); });
    seq(250, function () { boot.classList.add('loading'); SFX.tape(1.25); });
    for (var i = 1; i <= 20; i++) (function (n) { seq(60, function () { paint(out + 'LOADING [' + new Array(n + 1).join('█') + new Array(21 - n).join('░') + '] ' + (n * 5) + '%\n<span class="cursor"></span>'); }); })(i);
    seq(150, function () { boot.classList.remove('loading'); SFX.beep(); startCountdown(); });
    pump();
  }
  function startCountdown() {
    phase = 'count'; count = 5;
    paint(countHTML());
    for (var i = 0; i < 5; i++) seq(1000, function () { count -= 1; if (count <= 0) { arrive(true); return; } paint(countHTML()); SFX.tick(); });
    pump();
  }
  function done() {
    phase = 'home'; clearAll();
    html.classList.remove('boot-on');
    try { sessionStorage.setItem('jt-booted', '1'); } catch (e) {}
    JT.store('jt-visited', '1');
    JT.achieve('boot');
  }
  /* The screen collapses, then a scan line draws the homepage in, with the startup chime. */
  function arrive(full) {
    if (phase === 'transition' || phase === 'home') return;
    clearAll(); phase = 'transition';
    if (reduce || !full) { if (full) SFX.chime(); else SFX.page(); done(); return; }
    boot.classList.add('degauss');
    later(function () {
      boot.classList.remove('degauss'); boot.classList.add('reveal'); SFX.chime();
      var s = document.createElement('div'); s.className = 'boot-sweep'; document.body.appendChild(s);
      later(function () { s.remove(); done(); }, 920);
    }, 380);
  }
  JT.reboot = function () {
    clearAll(); phase = 'welcome'; pre.innerHTML = ''; welcome.hidden = false;
    html.classList.add('boot-on'); $('pw').focus({ preventScroll: true });
  };

  $('pw').addEventListener('click', function (e) { e.stopPropagation(); powerOn(); });
  welcome.addEventListener('click', function (e) { if (phase === 'welcome' && !e.target.closest('.small')) powerOn(); });
  $('skip').addEventListener('click', function (e) { e.stopPropagation(); arrive(false); });
  skipBtn.addEventListener('click', function (e) { e.stopPropagation(); arrive(false); });
  ctl.addEventListener('click', function (e) { e.stopPropagation(); setPaused(!paused); });
  boot.addEventListener('click', function () { if (phase === 'count') { SFX.key(); arrive(true); } });
  document.addEventListener('keydown', function (e) {
    if (phase === 'home' || phase === 'transition' || JT.printerOpen() || JT.inField(e)) return;
    if (e.metaKey || e.ctrlKey || e.altKey || e.key === 'Tab' || e.key === 'Shift') return;
    if (e.key === 'Escape') { e.preventDefault(); arrive(false); return; }
    if (phase === 'welcome') {
      if (e.key === 'Enter' || e.key === ' ') { if (e.target.closest && e.target.closest('.small button')) return; }
      e.preventDefault(); powerOn(); return;
    }
    if (e.key === ' ' || e.key === 'p' || e.key === 'P') { e.preventDefault(); setPaused(!paused); return; }
    if (phase === 'count') { e.preventDefault(); SFX.key(); arrive(true); }
  });
  if (phase === 'welcome') $('pw').focus({ preventScroll: true });
})();
