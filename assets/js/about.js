/* About: SLIDES.EXE, a carousel slide projector. Three slides are photos; the rest are painted in SVG
   until real photos replace them (swap `ph` for `img` in the list below). */
(function () {
  var JT = window.JT, SFX = JT.SFX, esc = JT.esc, reduce = JT.reduce;
  function $(id) { return document.getElementById(id); }
  var scr = $('sl-screen'); if (!scr) return;
  var slot = $('sl-slide'), cap = $('sl-cap'), num = $('sl-n'), slots = $('sl-slots'), autoB = $('sl-auto');
  var IMG = JT.base + 'assets/img/';

  /* ---------- painted slides (viewBox 400 x 300) ---------- */
  function stamp(t) { return '<text x="388" y="288" text-anchor="end" font-family="VT323, monospace" font-size="18" fill="#ff8c1a" opacity=".9" letter-spacing="1">' + t + '</text>'; }
  function grad(id, a, b, c) { return '<linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + a + '"/>' + (c ? '<stop offset=".55" stop-color="' + b + '"/><stop offset="1" stop-color="' + c + '"/>' : '<stop offset="1" stop-color="' + b + '"/>') + '</linearGradient>'; }
  function svg(defs, body) { return '<svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs>' + defs + '</defs>' + body + '</svg>'; }
  /* pixel sprites from pixel.js, as SVG */
  function px(rows, x, y, s, pal, flip) {
    var w = rows[0].length, o = '';
    rows.forEach(function (r, j) { for (var i = 0; i < r.length; i++) { var c = r[i]; if (c === '.' || !pal[c]) continue; o += '<rect x="' + (x + (flip ? w - 1 - i : i) * s) + '" y="' + (y + j * s) + '" width="' + s + '" height="' + s + '" fill="' + pal[c] + '"/>'; } });
    return o;
  }
  var SCENES = {
    dive: function () {
      var rays = '', bub = '', k;
      for (k = 0; k < 5; k++) rays += '<polygon points="' + (60 + k * 70) + ',0 ' + (90 + k * 70) + ',0 ' + (10 + k * 80) + ',300 ' + (-20 + k * 80) + ',300" fill="#fff" opacity=".05"/>';
      [[262, 96, 4], [270, 78, 3], [258, 62, 5], [268, 40, 3], [262, 22, 4], [274, 8, 2]].forEach(function (b) { bub += '<circle cx="' + b[0] + '" cy="' + b[1] + '" r="' + b[2] + '" fill="none" stroke="#dff7ff" stroke-opacity=".7"/>'; });
      return svg(grad('dv', '#0f7d9c', '#06364f', '#020d18'),
        '<rect width="400" height="300" fill="url(#dv)"/>' + rays +
        '<path d="M0 262 Q60 246 120 258 T240 254 T400 250 V300 H0Z" fill="#0b1d26"/>' +
        '<circle cx="64" cy="250" r="16" fill="#ff7a5c"/><circle cx="84" cy="256" r="10" fill="#ff5fa8"/><circle cx="330" cy="246" r="13" fill="#ffb340" opacity=".85"/><rect x="300" y="226" width="4" height="30" fill="#59ff95" opacity=".7"/><rect x="308" y="232" width="4" height="24" fill="#59ff95" opacity=".5"/>' +
        '<g transform="translate(212 132) rotate(-14)"><rect x="-26" y="-22" width="40" height="11" rx="5" fill="#ffb340"/><ellipse cx="0" cy="0" rx="44" ry="11" fill="#0a1218"/><circle cx="48" cy="-4" r="9" fill="#0a1218"/><rect x="47" y="-9" width="10" height="7" rx="2" fill="#5fe3e8"/><polygon points="-42,-4 -78,-16 -76,4" fill="#ff5fa8"/><polygon points="-42,4 -78,10 -70,22" fill="#ff5fa8"/><rect x="6" y="6" width="30" height="5" rx="2" fill="#0a1218" transform="rotate(30 6 6)"/></g>' +
        bub + '<text x="16" y="34" font-family="VT323, monospace" font-size="30" fill="#5fe3e8">18 M</text><text x="16" y="52" font-family="Space Mono, monospace" font-size="10" fill="#5fe3e8" opacity=".7" letter-spacing="2">MAX DEPTH</text>' + stamp('DIVE LOG'));
    },
    harvard: function () {
      var win = '', i, j;
      for (i = 0; i < 9; i++) for (j = 0; j < 3; j++) if (i !== 4) win += '<rect x="' + (66 + i * 30) + '" y="' + (168 + j * 30) + '" width="10" height="16" fill="' + ((i + j) % 3 ? '#ffd77a' : '#5a2a22') + '"/>';
      return svg(grad('hv', '#2b1d4a', '#a8507a', '#ffb06a'),
        '<rect width="400" height="300" fill="url(#hv)"/><circle cx="318" cy="70" r="20" fill="#ffe2b0" opacity=".85"/>' +
        '<rect x="186" y="60" width="28" height="72" fill="#f4efe8"/><polygon points="200,6 186,60 214,60" fill="#f4efe8"/><rect x="194" y="76" width="12" height="18" fill="#5a2a22"/><rect x="182" y="128" width="36" height="12" fill="#e9e1cf"/>' +
        '<rect x="52" y="140" width="296" height="112" fill="#8a3b2b"/><polygon points="40,142 200,112 360,142" fill="#5a2a22"/><rect x="184" y="196" width="32" height="56" fill="#3b1a14"/><rect x="176" y="140" width="48" height="10" fill="#e9e1cf"/>' + win +
        '<circle cx="34" cy="226" r="34" fill="#1e3b22"/><circle cx="368" cy="222" r="38" fill="#1e3b22"/><circle cx="18" cy="250" r="24" fill="#2b4f2e"/>' +
        '<path d="M0 252 H400 V300 H0Z" fill="#2b4f2e"/><path d="M160 300 L190 252 H210 L240 300Z" fill="#c9b79a" opacity=".8"/>' + stamp('HARVARD YARD'));
    },
    boulder: function () {
      var holds = [[120, 236, '#ffb340'], [158, 204, '#ff5fa8'], [196, 170, '#5fe3e8'], [174, 132, '#59ff95'], [214, 100, '#ffb340'], [250, 72, '#a77bff'], [236, 44, '#ff5fa8'], [300, 150, '#5fe3e8'], [90, 170, '#a77bff'], [320, 230, '#59ff95']], h = '';
      holds.forEach(function (o, k) { h += '<ellipse cx="' + o[0] + '" cy="' + o[1] + '" rx="' + (9 + k % 3 * 2) + '" ry="7" fill="' + o[2] + '" transform="rotate(' + (k * 23) + ' ' + o[0] + ' ' + o[1] + ')"/><circle cx="' + (o[0] + 4) + '" cy="' + (o[1] - 2) + '" r="2" fill="#fff" opacity=".6"/>'; });
      return svg(grad('bw', '#4a4558', '#2a2733'),
        '<rect width="400" height="300" fill="url(#bw)"/><polygon points="0,0 150,0 110,300 0,300" fill="#3a3546"/><polygon points="270,0 400,0 400,300 300,300" fill="#332f3f"/>' + h +
        '<g stroke="#08070c" stroke-width="7" stroke-linecap="round" fill="none"><path d="M196 140 L190 196"/><path d="M196 140 L214 104"/><path d="M196 140 L170 136"/><path d="M190 196 L158 206"/><path d="M190 196 L200 232"/></g><circle cx="200" cy="124" r="10" fill="#08070c"/>' +
        '<circle cx="216" cy="102" r="7" fill="#fff" opacity=".35"/><circle cx="172" cy="132" r="6" fill="#fff" opacity=".25"/>' +
        '<rect x="0" y="262" width="400" height="38" fill="#1d4b8f"/><rect x="0" y="262" width="400" height="4" fill="#2a63b8"/>' + stamp('CHALK NOT OPTIONAL'));
    },
    rescue: function () {
      var P = JT.PX, body = '<rect width="400" height="300" fill="url(#rs)"/><circle cx="330" cy="62" r="24" fill="#ffe08a"/><path d="M0 214 Q100 196 200 210 T400 204 V300 H0Z" fill="#3f7a3a"/><path d="M0 240 Q120 226 240 238 T400 236 V300 H0Z" fill="#2d5a2b"/>';
      var paws = ''; [[40, 270], [70, 258], [100, 272], [130, 260]].forEach(function (p) { paws += '<g fill="#efe6da" opacity=".5"><ellipse cx="' + p[0] + '" cy="' + p[1] + '" rx="6" ry="5"/><circle cx="' + (p[0] - 6) + '" cy="' + (p[1] - 7) + '" r="2.4"/><circle cx="' + p[0] + '" cy="' + (p[1] - 9) + '" r="2.4"/><circle cx="' + (p[0] + 6) + '" cy="' + (p[1] - 7) + '" r="2.4"/></g>'; });
      if (P) {
        body += px(P.DOUFU_BODY.concat(P.DOUFU_LEGS[0]), 150, 190, 5, P.DOUFU);
        body += '<rect x="282" y="226" width="80" height="50" fill="#8a5a2b"/><rect x="272" y="221" width="20" height="10" fill="#a8703a"/><rect x="352" y="221" width="20" height="10" fill="#a8703a"/>' + px(P.PIDAN_HEAD, 292, 186, 5, P.PIDAN) + '<rect x="282" y="226" width="80" height="50" fill="#8a5a2b"/><rect x="282" y="231" width="80" height="5" fill="#6b4520"/>';
      }
      return svg(grad('rs', '#7fc8ff', '#ffe2b0'), body + paws + '<rect x="16" y="16" width="132" height="24" fill="#ff7a5c"/><text x="82" y="34" text-anchor="middle" font-family="VT323, monospace" font-size="20" fill="#08070c">RESCUE DAY</text>' + stamp('ANHUI'));
    },
    retro: function () {
      var g = '<rect width="400" height="300" fill="url(#rt)"/>' +
        '<rect x="128" y="34" width="144" height="104" rx="10" fill="#2a2733"/><rect x="140" y="44" width="120" height="84" rx="8" fill="#062a12"/><text x="150" y="70" font-family="VT323, monospace" font-size="16" fill="#59ff95">READY.</text><text x="150" y="88" font-family="VT323, monospace" font-size="16" fill="#59ff95">LOAD "*",8,1</text><rect x="150" y="96" width="8" height="12" fill="#59ff95"/><rect x="186" y="138" width="28" height="10" fill="#2a2733"/>' +
        '<rect x="20" y="150" width="360" height="10" fill="#6b4520"/><rect x="20" y="250" width="360" height="10" fill="#6b4520"/>';
      var C = [[30, 120, 30, '#3a3a40', 'N64'], [72, 124, 26, '#c9c6d2', 'PS1'], [108, 128, 22, '#14121b', 'PS2'], [150, 112, 38, '#5b3fa0', 'GC'], [204, 132, 18, '#efeaf5', 'Wii'], [242, 118, 32, '#1c1a20', 'XBOX'], [298, 126, 24, '#efeaf5', '360'], [338, 124, 26, '#14121b', 'ONE']];
      C.forEach(function (c) { var y = 250 - c[2]; g += '<rect x="' + c[0] + '" y="' + y + '" width="' + (c[4] === 'GC' ? 38 : 34) + '" height="' + c[2] + '" fill="' + c[3] + '" stroke="#08070c"/><text x="' + (c[0] + 17) + '" y="' + (y + c[2] / 2 + 4) + '" text-anchor="middle" font-family="Space Mono, monospace" font-size="8" fill="' + (c[3] === '#efeaf5' || c[3] === '#c9c6d2' ? '#14121b' : '#ffb340') + '">' + c[4] + '</text>'; });
      g += '<rect x="40" y="172" width="80" height="64" fill="#d8d2c4" stroke="#08070c"/><rect x="48" y="180" width="64" height="40" fill="#1d4b8f"/><text x="80" y="204" text-anchor="middle" font-family="Space Mono, monospace" font-size="8" fill="#fff">XP</text>';
      return svg(grad('rt', '#2a1f3d', '#120d1d'), g + stamp('THE RETRO SHELF'));
    },
    lisbon: function () {
      var roofs = '', k;
      for (k = 0; k < 7; k++) roofs += '<rect x="' + (k * 60 - 10) + '" y="' + (150 - (k % 3) * 18) + '" width="56" height="' + (150 + (k % 3) * 18) + '" fill="' + ['#f4efe8', '#ffd9a8', '#c9e4f2'][k % 3] + '"/><polygon points="' + (k * 60 - 14) + ',' + (152 - (k % 3) * 18) + ' ' + (k * 60 + 18) + ',' + (130 - (k % 3) * 18) + ' ' + (k * 60 + 50) + ',' + (152 - (k % 3) * 18) + '" fill="#c8553d"/><rect x="' + (k * 60 + 4) + '" y="' + (170 - (k % 3) * 18) + '" width="10" height="14" fill="#2a63b8" opacity=".6"/><rect x="' + (k * 60 + 26) + '" y="' + (170 - (k % 3) * 18) + '" width="10" height="14" fill="#2a63b8" opacity=".6"/>';
      return svg(grad('lb', '#6fc3ff', '#d8f0ff'),
        '<rect width="400" height="300" fill="url(#lb)"/><rect x="0" y="96" width="400" height="22" fill="#2a7fbf"/><path d="M0 118 L400 118" stroke="#fff" stroke-opacity=".5" stroke-dasharray="6 10"/>' + roofs +
        '<g transform="translate(118 196)"><rect x="0" y="0" width="150" height="64" rx="6" fill="#ffcc33"/><rect x="0" y="0" width="150" height="16" rx="6" fill="#f4efe8"/><rect x="10" y="22" width="22" height="20" fill="#3a5a7a"/><rect x="40" y="22" width="22" height="20" fill="#3a5a7a"/><rect x="70" y="22" width="22" height="20" fill="#3a5a7a"/><rect x="100" y="22" width="22" height="20" fill="#3a5a7a"/><rect x="128" y="22" width="14" height="34" fill="#3a5a7a"/><text x="20" y="13" font-family="VT323, monospace" font-size="13" fill="#14121b">28 PRAZERES</text><line x1="75" y1="0" x2="95" y2="-40" stroke="#14121b" stroke-width="2"/><circle cx="30" cy="66" r="7" fill="#14121b"/><circle cx="120" cy="66" r="7" fill="#14121b"/></g>' +
        '<rect x="0" y="268" width="400" height="32" fill="#8a8578"/><line x1="0" y1="270" x2="400" y2="270" stroke="#4a4558" stroke-width="2"/>' + stamp('LISBOA'));
    },
    train: function () {
      return svg(grad('tr', '#9fd4ff', '#e8f6ff'),
        '<rect width="400" height="300" fill="url(#tr)"/><rect x="0" y="170" width="400" height="130" fill="#5f9e3a"/><rect x="0" y="200" width="400" height="10" fill="#7ab84a"/><rect x="0" y="236" width="400" height="10" fill="#7ab84a"/><rect x="0" y="216" width="400" height="5" fill="#5fb8ff"/>' +
        '<g transform="translate(316 108)"><polygon points="-10,62 10,62 6,0 -6,0" fill="#6b4520"/><g transform="rotate(20)"><rect x="-3" y="-56" width="6" height="56" fill="#f4efe8"/><rect x="-3" y="0" width="6" height="56" fill="#f4efe8"/><rect x="-56" y="-3" width="56" height="6" fill="#f4efe8"/><rect x="0" y="-3" width="56" height="6" fill="#f4efe8"/></g><circle r="5" fill="#14121b"/></g>' +
        '<g transform="translate(24 138)"><rect x="0" y="0" width="250" height="44" rx="8" fill="#ffc917"/><rect x="0" y="30" width="250" height="8" fill="#003082"/><rect x="246" y="4" width="16" height="34" rx="6" fill="#ffc917"/>' +
        '<rect x="14" y="8" width="26" height="16" fill="#1c3a5a"/><rect x="52" y="8" width="26" height="16" fill="#1c3a5a"/><rect x="90" y="8" width="26" height="16" fill="#1c3a5a"/><rect x="128" y="8" width="26" height="16" fill="#1c3a5a"/><rect x="166" y="8" width="26" height="16" fill="#1c3a5a"/><rect x="204" y="8" width="26" height="16" fill="#1c3a5a"/><circle cx="40" cy="46" r="5" fill="#14121b"/><circle cx="210" cy="46" r="5" fill="#14121b"/></g>' +
        '<rect x="0" y="186" width="400" height="3" fill="#4a4558"/>' + stamp('AMS → DEN HAAG'));
    }
  };

  var S = [
    { img: 'headshot', pos: '50% 22%', cap: 'The official headshot. The curls are not negotiable.' },
    { img: 'pidan', pos: '50% 26%', cap: 'Pidan, doing his best impression of a dog who isn\'t nervous.' },
    { img: 'doufu', pos: '50% 22%', cap: 'Doufu, about two seconds before she asks you to chase her.' },
    { ph: 'dive', cap: 'Eighteen metres down, right at the Open Water limit. I\'m the calm one.' },
    { ph: 'harvard', cap: 'Harvard Yard at dusk. I never got tired of this walk.' },
    { ph: 'boulder', cap: 'Halfway up a boulder problem. The chalk was not optional.' },
    { ph: 'rescue', cap: 'A rescue day in Anhui: vet trips, baths and a lot of very happy dogs.' },
    { ph: 'retro', cap: 'PS1, N64, PS2, GameCube, Wii, an XP PC and every Xbox. The reason this site boots.' },
    { ph: 'lisbon', cap: 'Lisbon. Player 2 cleaned plastic off the reefs while I cleaned up bugs.' },
    { ph: 'train', cap: 'The daily train from Amsterdam to The Hague, back when Tauria\'s HQ moved to the Netherlands.' }
  ];

  var NS = 'http://www.w3.org/2000/svg', i = 0, rot = 0, busy = false, timer = 0;
  S.forEach(function (x, k) {
    var gEl = document.createElementNS(NS, 'g'); gEl.setAttribute('transform', 'rotate(' + (k * 360 / S.length) + ' 80 80)');
    var r = document.createElementNS(NS, 'rect'); r.setAttribute('x', '72'); r.setAttribute('y', '10'); r.setAttribute('width', '16'); r.setAttribute('height', '34'); r.setAttribute('fill', x.img ? '#e9e1cf' : '#b9a6e8'); r.setAttribute('stroke', '#0c0b10');
    var t = document.createElementNS(NS, 'text'); t.setAttribute('x', '80'); t.setAttribute('y', '40'); t.setAttribute('text-anchor', 'middle'); t.setAttribute('font-size', '7'); t.setAttribute('font-family', 'Space Mono, monospace'); t.setAttribute('fill', '#14121b'); t.textContent = String(k + 1);
    gEl.appendChild(r); gEl.appendChild(t); slots.appendChild(gEl);
  });
  function pad(v) { return String(v).padStart(2, '0'); }
  function render() {
    var x = S[i];
    slot.innerHTML = x.img
      ? '<picture><source srcset="' + IMG + x.img + '.webp" type="image/webp"><img alt="' + esc(x.cap) + '" src="' + IMG + x.img + '.jpg" style="object-position:' + x.pos + '"></picture>'
      : SCENES[x.ph]();
    slot.setAttribute('aria-label', x.cap); slot.setAttribute('role', 'img');
    cap.textContent = x.cap; num.textContent = 'Slide ' + pad(i + 1) + ' / ' + pad(S.length);
    slots.style.transform = 'rotate(' + rot + 'deg)';
  }
  function go(dir) {
    if (busy) return; busy = true; SFX.clack();
    scr.classList.remove('drop'); scr.classList.add('dark');
    setTimeout(function () {
      i = (i + dir + S.length) % S.length; rot -= dir * 360 / S.length; render();
      scr.classList.remove('dark'); void scr.offsetWidth; scr.classList.add('drop'); busy = false;
    }, reduce ? 0 : 170);
  }
  function stopAuto() { clearInterval(timer); timer = 0; autoB.setAttribute('aria-pressed', 'false'); }
  $('sl-next').addEventListener('click', function () { go(1); });
  $('sl-prev').addEventListener('click', function () { go(-1); });
  scr.addEventListener('click', function () { go(1); });
  scr.addEventListener('keydown', function (e) { if (e.key === 'ArrowRight') { e.preventDefault(); go(1); } else if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); } });
  autoB.addEventListener('click', function () {
    if (timer) { stopAuto(); return; }
    autoB.setAttribute('aria-pressed', 'true'); go(1); timer = setInterval(function () { go(1); }, 3800);
  });
  document.addEventListener('visibilitychange', function () { if (document.hidden && timer) stopAuto(); });
  render();
})();
