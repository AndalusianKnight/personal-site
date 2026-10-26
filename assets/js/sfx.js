/* Sound kit: every effect is synthesised with WebAudio, so there are no audio files to load.
   Browsers only allow sound after a click or key press, so the first gesture unlocks it. */
(function () {
  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }
  var SFX = (function () {
    var ctx = null, on = store('jt-sound') !== 'off', master = null, verb = null, nbuf = null;
    function ac() {
      if (!ctx) {
        var C = window.AudioContext || window.webkitAudioContext; if (!C) return null;
        try { ctx = new C(); } catch (e) { return null; }
        master = ctx.createGain(); master.gain.value = 0.8; master.connect(ctx.destination);
        var len = Math.floor(ctx.sampleRate * 2.4), ib = ctx.createBuffer(2, len, ctx.sampleRate);
        for (var ch = 0; ch < 2; ch++) { var d = ib.getChannelData(ch); for (var i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3); }
        verb = ctx.createConvolver(); verb.buffer = ib; var vg = ctx.createGain(); vg.gain.value = 0.32; verb.connect(vg); vg.connect(master);
        nbuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate); var nd = nbuf.getChannelData(0); for (var j = 0; j < nd.length; j++) nd[j] = Math.random() * 2 - 1;
      }
      if (ctx.state === 'suspended') ctx.resume();
      return ctx;
    }
    function ok() { return on && ac(); }
    function env(g, t, a, peak, d) { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + d); }
    function osc(type, f, t, a, peak, d, dest, detune) {
      var o = ctx.createOscillator(), g = ctx.createGain();
      o.type = type; o.frequency.setValueAtTime(f, t); if (detune) o.detune.value = detune;
      env(g, t, a, peak, d); o.connect(g); g.connect(dest || master); o.start(t); o.stop(t + a + d + 0.05); return o;
    }
    function burst(t, d, peak, type, freq, q, dest) {
      var s = ctx.createBufferSource(); s.buffer = nbuf;
      var f = ctx.createBiquadFilter(); f.type = type || 'bandpass'; f.frequency.value = freq || 2000; f.Q.value = q || 1;
      var g = ctx.createGain(); env(g, t, 0.0008, peak, d);
      s.connect(f); f.connect(g); g.connect(dest || master); s.start(t, Math.random() * 1.5); s.stop(t + d + 0.05);
    }
    function chord(notes, t, peak, decay, lp) {
      var f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = lp || 2600; f.connect(master); f.connect(verb);
      notes.forEach(function (n) {
        osc('triangle', n, t, 0.025, peak, decay, f, -5);
        osc('triangle', n, t, 0.025, peak, decay, f, 5);
        osc('sine', n * 2, t, 0.02, peak * 0.35, decay * 0.6, f);
      });
    }
    var api = {
      unlock: ac,
      get on() { return on; },
      set: function (v) { on = v; store('jt-sound', v ? 'on' : 'off'); },
      click: function () { if (!ok()) return; var t = ctx.currentTime; burst(t, 0.008, 0.16, 'bandpass', 2100, 2.5); burst(t + 0.07, 0.006, 0.08, 'bandpass', 2600, 2.5); },
      key: function (heavy) {
        if (!ok()) return; var t = ctx.currentTime, v = 0.75 + Math.random() * 0.4, f = 1 + (Math.random() - 0.5) * 0.14;
        burst(t, 0.006, 0.45 * v, 'highpass', 3200 * f, 0.7);
        osc('sine', 2750 * f, t, 0.001, 0.035 * v, 0.06);
        osc('sine', 3900 * f, t, 0.001, 0.018 * v, 0.04);
        burst(t + 0.012, heavy ? 0.06 : 0.035, (heavy ? 0.6 : 0.38) * v, 'lowpass', heavy ? 420 : 700, 0.9);
        osc('sine', (heavy ? 95 : 150) * f, t + 0.01, 0.002, (heavy ? 0.22 : 0.12) * v, heavy ? 0.07 : 0.045);
        burst(t + 0.085 + Math.random() * 0.04, 0.005, 0.18 * v, 'highpass', 2800, 0.7);
      },
      keys: function () { var n = 0; (function k() { api.key(n === 6); if (++n < 7) setTimeout(k, n === 5 ? 260 : 90 + Math.random() * 70); })(); },
      beep: function () { if (!ok()) return; osc('square', 1000, ctx.currentTime, 0.003, 0.035, 0.15); },
      blip: function () { if (!ok()) return; osc('square', 1700 + Math.random() * 200, ctx.currentTime, 0.001, 0.012, 0.03); },
      power: function () {
        if (!ok()) return; var t = ctx.currentTime;
        burst(t, 0.006, 0.5, 'highpass', 2500, 0.7);
        burst(t + 0.01, 0.08, 0.7, 'lowpass', 260, 1);
        osc('sine', 52, t + 0.01, 0.003, 0.35, 0.3);
        var s = ctx.createBufferSource(); s.buffer = nbuf; s.loop = true;
        var bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 0.7;
        bp.frequency.setValueAtTime(140, t + 0.1); bp.frequency.exponentialRampToValueAtTime(950, t + 2.4);
        var fg = ctx.createGain(); fg.gain.setValueAtTime(0.0001, t + 0.1); fg.gain.exponentialRampToValueAtTime(0.09, t + 1.6); fg.gain.setValueAtTime(0.09, t + 2.8); fg.gain.exponentialRampToValueAtTime(0.0001, t + 4.2);
        s.connect(bp); bp.connect(fg); fg.connect(master); s.start(t + 0.1); s.stop(t + 4.3);
        var lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 900; lp.connect(master);
        var o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(18, t + 0.2); o.frequency.exponentialRampToValueAtTime(120, t + 2.6);
        var og = ctx.createGain(); og.gain.setValueAtTime(0.0001, t + 0.2); og.gain.exponentialRampToValueAtTime(0.06, t + 1.8); og.gain.setValueAtTime(0.06, t + 2.8); og.gain.exponentialRampToValueAtTime(0.0001, t + 4);
        o.connect(og); og.connect(lp); o.start(t + 0.2); o.stop(t + 4.1);
        var w = ctx.createOscillator(); w.type = 'sine'; w.frequency.setValueAtTime(240, t + 0.3); w.frequency.exponentialRampToValueAtTime(1440, t + 2.7);
        var wg = ctx.createGain(); wg.gain.setValueAtTime(0.0001, t + 0.3); wg.gain.exponentialRampToValueAtTime(0.008, t + 2); wg.gain.exponentialRampToValueAtTime(0.0001, t + 3.8);
        w.connect(wg); wg.connect(master); w.start(t + 0.3); w.stop(t + 3.9);
        for (var i = 0; i < 7; i++) burst(t + 1.5 + i * 0.11 + Math.random() * 0.06, 0.012, 0.22, 'bandpass', 1100 + Math.random() * 900, 3);
      },
      floppy: function () {
        if (!ok()) return; var t = ctx.currentTime;
        for (var r = 0; r < 3; r++) for (var i = 0; i < 9; i++) { var tt = t + r * 0.32 + i * 0.022; burst(tt, 0.012, 0.25, 'bandpass', 850, 4); osc('square', 105, tt, 0.001, 0.025, 0.014); }
      },
      tape: function (d) { if (!ok()) return; var t = ctx.currentTime, n = Math.floor((d || 1.2) / 0.045); for (var i = 0; i < n; i++) osc('square', i % 3 ? 1150 + Math.random() * 900 : 2400, t + i * 0.045, 0.001, 0.009, 0.04); },
      tick: function () { if (!ok()) return; osc('square', 660, ctx.currentTime, 0.002, 0.025, 0.06); },
      chime: function () { if (!ok()) return; chord([130.81, 261.63, 329.63, 392.0, 523.25, 659.25], ctx.currentTime + 0.02, 0.028, 2.8, 2400); },
      page: function () { if (!ok()) return; chord([392.0, 523.25, 783.99], ctx.currentTime, 0.022, 0.9, 3200); },
      achieve: function () { if (!ok()) return; var t = ctx.currentTime, f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 3000; f.connect(master); f.connect(verb); [523.25, 659.25, 783.99, 1046.5].forEach(function (n, i) { osc('triangle', n, t + i * 0.08, 0.01, 0.06, 0.35, f); }); },
      fanfare: function () { if (!ok()) return; var t = ctx.currentTime; chord([261.63, 329.63, 392.0], t, 0.03, 0.4, 3000); chord([349.23, 440.0, 523.25], t + 0.22, 0.03, 0.4, 3000); chord([392.0, 493.88, 587.33, 783.99], t + 0.44, 0.034, 2.2, 3400); },
      error: function () { if (!ok()) return; var t = ctx.currentTime; osc('square', 196, t, 0.003, 0.03, 0.16); osc('square', 147, t + 0.17, 0.003, 0.03, 0.26); },
      print: function (d) { if (!ok()) return; var t = ctx.currentTime, n = Math.floor((d || 0.9) / 0.055); for (var i = 0; i < n; i++) { burst(t + i * 0.055, 0.03, 0.2, 'bandpass', 3200, 2); osc('square', 420 + (i % 3) * 90, t + i * 0.055, 0.001, 0.008, 0.03); } },
      feed: function () { if (!ok()) return; var t = ctx.currentTime; burst(t, 0.14, 0.12, 'bandpass', 600, 1.5); osc('sawtooth', 70, t, 0.01, 0.02, 0.12); },
      decrypt: function (d) {
        if (!ok()) return; var t = ctx.currentTime; d = d || 1.2; var n = Math.floor(d / 0.035);
        for (var i = 0; i < n; i++) osc('square', 700 + i * (900 / n) + Math.random() * 260, t + i * 0.035, 0.001, 0.006, 0.025);
        osc('triangle', 783.99, t + d, 0.01, 0.05, 0.25); osc('triangle', 1174.66, t + d + 0.09, 0.01, 0.05, 0.45);
      },
      honk: function () { if (!ok()) return; var t = ctx.currentTime; [0, 0.24].forEach(function (d) { osc('square', 392, t + d, 0.005, 0.045, 0.15); osc('square', 494, t + d, 0.005, 0.035, 0.15); }); },
      crunch: function () { if (!ok()) return; var t = ctx.currentTime; for (var i = 0; i < 5; i++) burst(t + i * 0.055 + Math.random() * 0.02, 0.03, 0.32, 'bandpass', 1200 + Math.random() * 1400, 1.2); },
      moo: function () {
        if (!ok()) return; var t = ctx.currentTime, f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 720; f.connect(master); f.connect(verb);
        var o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'sawtooth';
        o.frequency.setValueAtTime(150, t); o.frequency.linearRampToValueAtTime(172, t + 0.35); o.frequency.linearRampToValueAtTime(108, t + 1.1);
        g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.16, t + 0.12); g.gain.setValueAtTime(0.16, t + 0.8); g.gain.exponentialRampToValueAtTime(0.0001, t + 1.2);
        o.connect(g); g.connect(f); o.start(t); o.stop(t + 1.25);
      },
      clack: function () { if (!ok()) return; var t = ctx.currentTime; burst(t, 0.02, 0.5, 'bandpass', 1800, 2); osc('square', 120, t, 0.001, 0.07, 0.05); burst(t + 0.17, 0.03, 0.4, 'lowpass', 700, 1); osc('sine', 80, t + 0.17, 0.002, 0.18, 0.08); },
      bubble: function () { if (!ok()) return; var t = ctx.currentTime, o = ctx.createOscillator(), g = ctx.createGain(), f0 = 300 + Math.random() * 300; o.type = 'sine'; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f0 * 2.6, t + 0.12); env(g, t, 0.005, 0.045, 0.12); o.connect(g); g.connect(master); o.start(t); o.stop(t + 0.2); },
      spell: function () {
        if (!ok()) return; var t = ctx.currentTime;
        [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach(function (n, i) { osc('triangle', n, t + i * 0.06, 0.01, 0.035, 0.35, verb); osc('triangle', n, t + i * 0.06, 0.01, 0.03, 0.3); });
        var s = ctx.createBufferSource(); s.buffer = nbuf; var bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 4; bp.frequency.setValueAtTime(400, t); bp.frequency.exponentialRampToValueAtTime(5000, t + 0.6);
        var g = ctx.createGain(); env(g, t, 0.05, 0.12, 0.6); s.connect(bp); bp.connect(g); g.connect(master); g.connect(verb); s.start(t); s.stop(t + 0.75);
      },
      thud: function () { if (!ok()) return; var t = ctx.currentTime; burst(t, 0.06, 0.4, 'lowpass', 380, 1); osc('sine', 90, t, 0.002, 0.2, 0.09); },
      chevron: function () { if (!ok()) return; var t = ctx.currentTime; burst(t, 0.12, 0.5, 'lowpass', 300, 1); osc('sine', 70, t, 0.003, 0.3, 0.25); osc('square', 880, t + 0.1, 0.002, 0.012, 0.08); },
      kawoosh: function () {
        if (!ok()) return; var t = ctx.currentTime;
        var s = ctx.createBufferSource(); s.buffer = nbuf; var f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.setValueAtTime(200, t); f.frequency.exponentialRampToValueAtTime(3500, t + 0.35); f.frequency.exponentialRampToValueAtTime(400, t + 1.6);
        var g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.5, t + 0.3); g.gain.exponentialRampToValueAtTime(0.0001, t + 1.8);
        s.connect(f); f.connect(g); g.connect(master); g.connect(verb); s.start(t); s.stop(t + 1.9);
      }
    };
    return api;
  })();
  window.JT = window.JT || {};
  window.JT.SFX = SFX;
})();
