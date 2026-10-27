/* Travel: the dot-matrix globe that flies the thirteen homes in order, a postcard for each home,
   the travelling party and the departures board. The homes come from the #pc-src list in the page. */
(function () {
  var JT = window.JT, SFX = JT.SFX, reduce = JT.reduce;
  function $(id) { return document.getElementById(id); }
  function flag(cc) { return JT.base + 'assets/img/flag-' + cc + '.png'; }
  function two(n) { return String(n).padStart(2, '0'); }

  /* ---------- the globe ---------- */
  (function () {
    var cv = $('globe'), src = $('pc-src'); if (!cv || !src) return;
    var g = cv.getContext('2d'), rotLabel = $('globe-rot'), legLabel = $('globe-leg');
    var D = Math.PI / 180;
    function vec(lat, lon) { var p = lat * D, l = lon * D; return [Math.cos(p) * Math.sin(l), Math.sin(p), Math.cos(p) * Math.cos(l)]; }
    /* land: one byte pair per dot from Natural Earth's 110m land, latitude and longitude in 2 degree steps */
    var raw = atob('AwADCgMUAx4DKAMyAzwDRgNQA1oDZANuA3gDggOMA5YDoAOqBA4EFQQcBCMEKgQxBD8ERgRNBFQEWwRiBGkEcAR3BH4EhQSMBJMEmgShBRIFGAUeBSQFKgUwBU4FVAVaBWAFZgVsBXIFeAV+BYQFigWQBZYFnAWiBgoGDwYUBhkGHgYjBigGLQYyBksGUAZVBloGXwZkBmkGbgZzBngGfQaCBocGjAaRBpYGmwagBqUHEAcUBxgHHAcgByQHKAcsBzAHNAdQB1QHWAdcB2AHZAdoB2wHcAd0B3gHfAeAB4QHiAeMB5AHlAeYB5wHoAekB6gIHAgoCCwIMAg0CDgIVAhYCFwIYAhkCGgIbAhwCHQIeAh8CIAIhAiICIwIkAiUCJgInAigCKQIqAknCTYJOQlUCVcJWgldCWAJYwlmCWkJbAlvCXIJdQl4CX4JgQmECYcJigmNCZAJkwmWCZkJnAmfCaIJpQmoCasJrgo5CmkKbApvCnIKdQp4Cn4KgQqECocKigqNCpAKkwqWCpkKnAqfCqIKpQqoC3ILdQt4C4ELhAuHC4oLjQuQC5MLlguZC5wLnwuiDHQMkhI2EzQTNhQ0FDYVNBU1FTYVNxU4FjUWNhY3Fq0Wrhc1FzYXNxc4F64Xrxg1GDYYNxg4GDkYoxiwGTUZNhk3GTgZORk6GbEaNRo2GjcaOBo5GjoaOxo8GqAaoRqjGrEashs2GzcbOBs5GzobOxs8G6AboRuiG6MbpBw2HDccOBw5HDocOxw8HD0cPhxjHGQclByVHJ8coByhHKIcoxykHKUdNh03HTgdOR06HTsdPB09HT4dPx1jHWQdZR1mHWcdaB2UHZUdlh2XHZgdmR2cHZ0dnh2fHaAdoR2iHaMdpB2lHjYeNx44HjkeOh47HjwePR4+Hj8eQB5jHmQeZR5mHmceaB6UHpUelh6XHpgemR6aHpsenB6dHp4enx6gHqEeoh6jHqQepR6mHzYfNx84HzkfOh87HzwfPR8+Hz8fQB9BH2IfYx9kH2UfZh9nH2gfaR+TH5QflR+WH5cfmB+ZH5ofmx+cH50fnh+fH6AfoR+iH6MfpB+lH6YgNyA4IDkgOiA7IDwgPSA+ID8gQCBBIGEgYiBjIGQgZSBmIGcgaCBpIJMglCCVIJYglyCYIJkgmiCbIJwgnSCeIJ8goCChIKIgoyCkIKUgpiE3ITghOSE6ITshPCE9IT4hPyFAIUEhQiFhIWIhYyFkIWUhZiFnIWghaSFqIWshcCFxIZMhlCGVIZYhlyGYIZkhmiGbIZwhnSGeIZ8hoCGhIaIhoyGkIaUiNyI4IjkiOiI7IjwiPSI+Ij8iQCJBIkIiQyJEImEiYiJjImQiZSJmImciaCJpImoiayJwInEikyKUIpUiliKXIpgimSKaIpsinCKdIp4inyKgIqEioiKjIqQjNyM4IzkjOiM7IzwjPSM+Iz8jQCNBI0IjQyNEI0UjYCNhI2IjYyNkI2UjZiNnI2gjaSNqI3AjcSOWI5cjmCOZI5ojmyOcI50jniOfI6AjoSOiI6MkNyQ4JDkkOiQ7JDwkPSQ+JD8kQCRBJEIkQyREJEUkYCRhJGIkYyRkJGUkZiRnJGgkaSRqJGskcCRxJHIklySYJJkkmiSbJJwknSSeJJ8koCShJKIlNSU2JTclOCU5JTolOyU8JT0lPiU/JUAlQSVCJUMlRCVFJUYlYCVhJWIlYyVkJWUlZiVnJWglaSVqJWslbCVtJXElciWYJZklmiWbJZwlnSWeJaEloiY0JjUmNiY3JjgmOSY6JjsmPCY9Jj4mPyZAJkEmQiZDJkQmRSZGJmAmYSZiJmMmZCZlJmYmZyZoJmkmaiZrJmwmbSZyJpkmmyacJp0moSczJzQnNSc2JzcnOCc5JzonOyc8Jz0nPic/J0AnQSdCJ0MnRCdFJ0YnYSdiJ2MnZCdlJ2YnZydoJ2knaidrJ2wnbSecJ6EoMyg0KDUoNig3KDgoOSg6KDsoPCg9KD4oPyhAKEEoQihDKEQoRShGKEcoYShiKGMoZChlKGYoZyhoKGkoaihrKGwobSikKTIpMyk0KTUpNik3KTgpOSk6KTspPCk9KT4pPylAKUEpQilDKUQpRSlGKUcpSClhKWIpYylkKWUpZilnKWgpaSlqKWspbCltKZEpkimfKaApoSmjKakqMSoyKjMqNCo1KjYqNyo4KjkqOio7KjwqPSo+Kj8qQCpBKkIqQypEKkUqRipHKmAqYSpiKmMqZCplKmYqZypoKmkqaiprKmwqjyqfKqAqoSqiKqMqpCqnKzErMiszKzQrNSs2KzcrOCs5KzorOys8Kz0rPis/K0ArQStCK0MrRCtFK0YrYCthK2IrYytkK2UrZitnK2graStqK2srbCttK40rjiuTK5wrnSueK58roCuhK6YsMiwzLDQsNSw2LDcsOCw5LDosOyw8LD0sPiw/LEAsQSxCLEMsXyxgLGEsYixjLGQsZSxmLGcsaCxpLGosayxsLG0sbiyMLI0skSySLJMsliycLJ4sny0yLTMtNC01LTYtNy04LTktOi07LTwtPS0+LT8tQC1fLWAtYS1iLWMtZC1lLWYtZy1oLWktai1rLWwtbS1uLYwtjS2RLZItky2ULjMuNC41LjYuNy44LjkuOi47LjwuPS4+Lj8uQC5fLmAuYS5iLmMuZC5lLmYuZy5oLmkuai5rLmwubS5uLm8ucC6LLowujS6SLpMulC8zLzQvNS82LzcvOC85LzovOy88Lz0vPi8/L14vXy9gL2EvYi9jL2QvZS9mL2cvaC9pL2ovay9sL20vbi9vL3AvcS+KL4wvjS+TL5QwMzA0MDUwNjA3MDgwOTA6MDswPDA+MFUwVjBXMFgwWTBaMFwwXTBeMF8wYDBhMGIwYzBkMGUwZjBnMGgwaTBqMGswbDBtMG4wbzBwMHEwjDCUMJgxMTEzMTQxNTE2MTcxODE5MToxOzFTMVQxVTFWMVcxWDFZMVoxWzFcMV0xXjFfMWAxYTFiMWMxZDFlMWYxZzFoMWkxajFrMWwxbTFuMW8xcDFxMXIxgjGLMZcxmDIvMjQyNTI2MjcyODI5MjoyUzJUMlUyVjJXMlgyWTJaMlsyXDJdMl4yXzJgMmEyYjJjMmQyZTJmMmcyaDJpMmoyazJsMm0ybjJvMnAycTJyMoAygTKLMo4ylTKXMy8zUjNTM1QzVTNWM1czWDNZM1ozWzNcM10zXjNfM2AzYTNiM2MzZDNlM2YzZzNoM2kzajNrM2wzbTNuM28zczOAM4EzizONM44zjzOQM5g0LDQtNC40LzRSNFM0VDRVNFY0VzRYNFk0WjRbNFw0XTReNF80YDRhNGI0YzRkNGU0ZjRnNGg0aTRqNGs0bDRtNG40cDRxNH80gDSBNIs0jDSNNI40jzSQNJY0lzUpNSs1LDUtNVI1UzVUNVU1VjVXNVg1WTVaNVs1XDVdNV41XzVgNWE1YjVjNWQ1ZTVmNWc1aDVpNWo1azVsNW01bzVwNXE1cjVzNX81gDWBNYk1izWMNY01jjWPNZY2JzYoNik2KjYrNiw2LTYzNjg2UjZTNlQ2VTZWNlc2WDZZNlo2WzZcNl02XjZfNmA2YTZiNmM2ZDZlNmY2ZzZoNmk2ajZrNmw2bzZwNnE2cjZzNnQ2dTZ/NoA2gTaCNoM2iTaKNos2jDaNNo42ljclNyY3JzcoNyk3LTczNzQ3UjdTN1Q3VTdWN1c3WDdZN1o3WzdcN103XjdfN2A3YTdiN2M3ZDdlN2Y3ZzdoN2k3ajdrN2w3bjdvN3A3cTdyN3M3dDd1N3Y3fjd/N4A3gTeCN4M3hDeIN4k3ijeLN4w3jTeOOCU4JjgnOCg4MjhSOFM4VDhVOFY4VzhYOFk4WjhbOFw4XTheOF84YDhhOGI4YzhkOGU4ZjhnOGg4aThqOGs4bjhvOHA4cThyOHM4dDh1OHY4dzh9OH44fziAOIE4gjiDOIQ4hTiGOIg4iTiKOIs4jDiNOI44jziQOJE4kjkkOSU5JjknOSg5UjlTOVQ5VTlWOVc5WDlZOVo5WzlcOV05XjlfOWA5YTliOWM5ZDllOWY5ZzloOWk5ajlrOW05bjlvOXA5cTlyOXM5dDl1OXY5fDl9OX45fzmAOYE5gjmDOYQ5hTmGOYc5iDmJOYo5izmMOY05jjmPOZA5kTmSOZM5lDmWOiM6JDolOiY6JzooOjE6UzpUOlU6VjpXOlg6WTpaOls6XDpdOl46XzpgOmE6YjpjOmQ6ZTpmOmc6aDppOmo6bDptOm46bzpwOnE6cjp3Ong6eTp6Ons6fDp9On46fzqAOoE6gjqDOoQ6hTqGOoc6iDqJOoo6izqMOo06jjqPOpA6kTqSOpM6lDqVOyE7IjsjOyQ7JTsmOyc7KDspOzE7VDtVO1Y7VztYO1k7WjtbO1w7XTteO187YDthO2I7YztkO2U7ZjtnO2g7aTtqO2w7bTtuO287cDtxO3Q7dTt2O3c7eDt5O3o7ezt8O307fjt/O4A7gTuCO4M7hDuFO4Y7hzuIO4k7ijuLO4w7jTuOO487kDuRO5I7kzuUO5U7ljwgPCI8IzwkPCU8JjwnPCg8KTwqPCs8LDwvPDA8VTxWPFc8WDxZPFo8WzxcPF08XjxfPGA8YTxiPGM8ZDxlPGY8ZzxoPGk8ajxrPGw8bTxuPG88cDxxPHM8dDx1PHY8dzx4PHk8ejx7PHw8fTx+PH88gDyBPII8gzyEPIU8hjyHPIg8iTyKPIs8jDyNPI48jzyQPJE8kjyTPJQ8lTyWPSA9IT0iPSM9JD0l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'), land = [];
    for (var i = 0; i < raw.length; i += 2) { var lat = raw.charCodeAt(i) * 2 - 90, k = Math.max(1, Math.round(1 / Math.max(Math.cos(lat * D), 0.05))); land.push(vec(lat, raw.charCodeAt(i + 1) * 2 - 180 + k)); }
    var HOMES = [].slice.call(src.children).map(function (li, i) {
      var la = +li.getAttribute('data-lat'), lo = +li.getAttribute('data-lon');
      return { n: li.querySelector('.pc-n').textContent, c: li.querySelector('.pc-c').textContent.replace(/^,\s*/, ''), cc: li.getAttribute('data-cc'), slug: li.id,
        lat: la, lon: lo, note: li.querySelector('p').textContent, coffee: li.querySelectorAll('dd')[0].textContent, food: li.querySelectorAll('dd')[1].textContent, i: i, p: vec(la, lo) };
    });
    var LAST = HOMES.length - 1;
    /* places visited: they flash as they roll past the middle of the globe. They come from the #places-list in the page */
    var placeBtns = [].slice.call(document.querySelectorAll('#places-list button[data-lat]'));
    var VISITED = placeBtns.filter(function (b) { return !b.hasAttribute('data-home'); }).map(function (b) {
      return { n: b.textContent, b: b, p: vec(+b.getAttribute('data-lat'), +b.getAttribute('data-lon')), last: -1e9, start: -1, queued: false };
    });
    var GRAT = [];
    for (var la = -60; la <= 60; la += 30) { var ring = []; for (var lo = 0; lo <= 360; lo += 5) ring.push(vec(la, lo)); GRAT.push(ring); }
    for (var lo2 = 0; lo2 < 360; lo2 += 30) { var mer = []; for (var la2 = -90; la2 <= 90; la2 += 5) mer.push(vec(la2, lo2)); GRAT.push(mer); }
    function slerp(a, b, t) { var dot = a[0] * b[0] + a[1] * b[1] + a[2] * b[2], om = Math.acos(Math.min(1, Math.max(-1, dot))); if (om < 1e-6) return a.slice(); var s = Math.sin(om), wa = Math.sin((1 - t) * om) / s, wb = Math.sin(t * om) / s; return [a[0] * wa + b[0] * wb, a[1] * wa + b[1] * wb, a[2] * wa + b[2] * wb]; }
    var SEGS = [];
    for (var si = 0; si < LAST; si++) {
      var A = HOMES[si].p, B = HOMES[si + 1].p, om = Math.acos(Math.min(1, Math.max(-1, A[0] * B[0] + A[1] * B[1] + A[2] * B[2]))), pts = [];
      for (var j = 0; j <= 72; j++) { var t = j / 72, v = slerp(A, B, t), h = 1 + (0.02 + 0.2 * om / Math.PI) * Math.sin(Math.PI * t); pts.push([v[0] * h, v[1] * h, v[2] * h]); }
      SEGS.push({ pts: pts, dur: 1.3 + om * 1.5, km: Math.round(om * 6371) });
    }
    var yaw = 79 * D, tilt = 30 * D, W = 0, H = 0, R = 0, dpr = 1, visible = true, dragging = false, moved = 0, lastDrag = -1e9, lx = 0, ly = 0, hover = null;
    var tour = { seg: 0, t: 0, state: 'pause', wait: 1.2, fade: 1 }, mode = 'tour', focusH = null, spot = null, allOn = false, arrived = 0, queue = [], lastPulse = 0, opened = {};
    function size() { dpr = Math.min(window.devicePixelRatio || 1, 2); W = cv.clientWidth * dpr; H = cv.clientHeight * dpr; cv.width = W; cv.height = H; R = Math.min(W, H) * 0.4; }
    function P(v) { var cy = Math.cos(yaw), sy = Math.sin(yaw), ct = Math.cos(tilt), st = Math.sin(tilt); var x1 = v[0] * cy + v[2] * sy, z1 = v[2] * cy - v[0] * sy, y2 = v[1] * ct - z1 * st, z2 = v[1] * st + z1 * ct; return [W / 2 + R * x1, H / 2 - R * y2, z2, x1, y2]; }
    function vis(q) { return q[2] > 0 || (q[3] * q[3] + q[4] * q[4]) > 1; }
    function ease(x) { return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2; }
    function ballPos() {
      if (tour.state === 'fly') { var s = SEGS[tour.seg], f = ease(Math.min(1, tour.t / s.dur)) * (s.pts.length - 1), a = Math.floor(f), b = Math.min(a + 1, s.pts.length - 1), r = f - a; return { idx: f, p: [s.pts[a][0] + (s.pts[b][0] - s.pts[a][0]) * r, s.pts[a][1] + (s.pts[b][1] - s.pts[a][1]) * r, s.pts[a][2] + (s.pts[b][2] - s.pts[a][2]) * r] }; }
      return { idx: -1, p: HOMES[arrived].p };
    }
    function angTo(v) { var n = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]); return { yaw: -Math.atan2(v[0], v[2]), tilt: Math.max(-30 * D, Math.min(45 * D, Math.asin(v[1] / n) * 0.75)) }; }
    function wrap(a) { while (a > Math.PI) a -= 2 * Math.PI; while (a < -Math.PI) a += 2 * Math.PI; return a; }

    /* ---------- postcards ---------- */
    var pcCity = $('pc-city'), pcMode = $('pc-mode'), pcNote = $('pc-note'), pcFlag = $('pc-flag'), pcResume = $('pc-resume'), pcGeo = $('pc-geo'), pcLive = $('pc-live'), sky = $('sky'), homesEl = $('homes');
    function hash(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
    function rng(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; var t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
    var SKIES = [['#2a1240', '#ff7a5c'], ['#0c1e3a', '#5fe3e8'], ['#2a0f33', '#ff5fa8'], ['#241a3a', '#ffb340'], ['#0b2424', '#59ff95'], ['#1e1240', '#a77bff']];
    /* a pixel skyline for each city, seeded by its name, until real photos arrive */
    function drawSky(name) {
      var w = 160, hh = 70; sky.width = w; sky.height = hh;
      var c = sky.getContext('2d'), r = rng(hash(name)), pal = SKIES[hash(name) % SKIES.length];
      var gr = c.createLinearGradient(0, 0, 0, hh); gr.addColorStop(0, '#08070c'); gr.addColorStop(0.75, pal[0]); gr.addColorStop(1, pal[0]); c.fillStyle = gr; c.fillRect(0, 0, w, hh);
      for (var s = 0; s < 22; s++) { c.fillStyle = 'rgba(255,255,255,' + (0.3 + r() * 0.6).toFixed(2) + ')'; c.fillRect(Math.floor(r() * w), Math.floor(r() * 34), 1, 1); }
      var sx = 30 + r() * 100, sy = 44, sr = 18 + r() * 5;
      c.fillStyle = pal[1];
      for (var y = -sr; y < sr; y++) { if (y > sr * 0.15 && (Math.floor(y) % 4 === 0 || Math.floor(y) % 4 === 1)) continue; var hw = Math.sqrt(sr * sr - y * y); c.fillRect(Math.round(sx - hw), Math.round(sy + y), Math.round(hw * 2), 1); }
      var x = 0;
      while (x < w) {
        var bw = 6 + Math.floor(r() * 16), bh = 10 + Math.floor(r() * 30); if (r() < 0.12) bh += 14;
        c.fillStyle = '#0b0a12'; c.fillRect(x, hh - bh, bw, bh);
        if (r() < 0.2) c.fillRect(x + Math.floor(bw / 2), hh - bh - 6, 1, 6);
        for (var wy = hh - bh + 3; wy < hh - 3; wy += 4) for (var wx = x + 2; wx < x + bw - 2; wx += 3) if (r() < 0.32) { c.fillStyle = r() < 0.8 ? 'rgba(255,179,64,.85)' : pal[1]; c.fillRect(wx, wy, 1, 1); }
        x += bw + (r() < 0.3 ? 1 : 0);
      }
    }
    function geo(h) { return Math.abs(h.lat).toFixed(2) + '°' + (h.lat < 0 ? 'S' : 'N') + ' · ' + Math.abs(h.lon).toFixed(2) + '°' + (h.lon < 0 ? 'W' : 'E'); }
    var homeBtns = HOMES.map(function (h) {
      var li = document.createElement('li'), b = document.createElement('button');
      b.type = 'button';
      b.innerHTML = '<span class="no">' + two(h.i + 1) + '</span><img class="flag" src="' + flag(h.cc) + '" alt="" width="20" height="15"><span>' + JT.esc(h.n) + (h.i === LAST ? '<i class="nowtag">NOW</i>' : '') + '</span>';
      b.addEventListener('click', function () { focus(h, true); });
      li.appendChild(b); homesEl.appendChild(li); return b;
    });
    var shown = null;
    function showCard(h, how) {
      pcMode.textContent = (how === 'focus' ? 'SELECTED' : 'NOW ARRIVING') + ' · HOME ' + two(h.i + 1) + '/' + HOMES.length + (h.i === LAST ? ' · YOU ARE HERE' : '');
      homeBtns.forEach(function (b, i) { b.setAttribute('aria-current', String(i === h.i)); });
      if (shown === h) return; shown = h;
      pcCity.textContent = h.n + ', ' + h.c;
      pcFlag.src = flag(h.cc); pcFlag.alt = h.c;
      pcNote.textContent = h.note; pcGeo.textContent = geo(h);
      $('pc-coffee').textContent = h.coffee; $('pc-food').textContent = h.food;
      drawSky(h.n);
    }
    function mark(b) { placeBtns.forEach(function (x) { x.setAttribute('aria-current', String(x === b)); }); }
    function focus(h, user) {
      mode = 'focus'; focusH = h; spot = null; mark(placeBtns.filter(function (b) { return b.getAttribute('data-home') === h.slug; })[0]); pcResume.hidden = false; lastDrag = -1e9; showCard(h, 'focus');
      if (user) pcLive.textContent = h.n + ', ' + h.c + '. ' + h.note + ' Best coffee: ' + h.coffee + '. Best food: ' + h.food + '.';
      opened[h.i] = true; JT.achieve('home'); if (Object.keys(opened).length >= 5) JT.achieve('flyer');
    }
    /* fly to a place I visited but didn't live in: no postcard, just the dot and its name */
    function spotOn(v) {
      var where = v.b.closest('li').querySelector('b').textContent;
      mode = 'spot'; spot = v; focusH = null; pcResume.hidden = false; lastDrag = -1e9; mark(v.b);
      homeBtns.forEach(function (b) { b.setAttribute('aria-current', 'false'); });
      pcLive.textContent = v.n + ', ' + where + '.';
    }
    pcResume.addEventListener('click', function () { mode = 'tour'; focusH = null; spot = null; mark(null); pcResume.hidden = true; showCard(HOMES[arrived], 'tour'); });
    showCard(reduce ? HOMES[LAST] : HOMES[0], 'tour');
    if (reduce) { arrived = LAST; var a1 = angTo(HOMES[LAST].p); yaw = a1.yaw; tilt = a1.tilt; }

    function update(dt, now) {
      if (mode === 'tour' && !reduce) {
        if (tour.state === 'pause') { tour.wait -= dt; if (tour.wait <= 0 && tour.seg < SEGS.length) { tour.state = 'fly'; tour.t = 0; } }
        else if (tour.state === 'fly') { tour.t += dt; if (tour.t >= SEGS[tour.seg].dur) { arrived = tour.seg + 1; tour.seg += 1; showCard(HOMES[arrived], 'tour'); if (visible) SFX.blip(); if (tour.seg >= SEGS.length) { tour.state = 'end'; tour.wait = 4; } else { tour.state = 'pause'; tour.wait = 1.1; } } }
        else if (tour.state === 'end') { tour.wait -= dt; if (tour.wait < 1) tour.fade = Math.max(0, tour.wait); if (tour.wait <= 0) { tour.seg = 0; arrived = 0; tour.state = 'pause'; tour.wait = 1.2; tour.fade = 1; showCard(HOMES[0], 'tour'); } }
      }
      if (!dragging && now - lastDrag > 4000 && (!reduce || mode !== 'tour')) {
        var tgt = angTo(mode === 'focus' ? focusH.p : mode === 'spot' ? spot.p : ballPos().p);
        var k = reduce ? 1 : Math.min(1, dt * (mode !== 'tour' ? 3 : 1.6)), dy0 = wrap(tgt.yaw - yaw);
        if (reduce && Math.abs(dy0) + Math.abs(tgt.tilt - tilt) > 1e-4) dirty = true;
        yaw += dy0 * k; tilt += (tgt.tilt - tilt) * k;
      }
      if (reduce || allOn) return;
      VISITED.forEach(function (v) {
        if (v.queued || now - v.last < 30000) return;
        var q = P(v.p);
        if (q[2] > 0.55 && Math.abs(q[3]) < 0.3) { v.queued = true; queue.push(v); }
      });
      if (queue.length && now - lastPulse > 260) { var v = queue.shift(); v.queued = false; v.start = now; v.last = now; lastPulse = now; }
    }
    function drawPath(pts, last, col) { g.strokeStyle = col; g.beginPath(); var pen = false; for (var j = 0; j <= last; j++) { var q = P(pts[j]); if (vis(q)) { if (pen) g.lineTo(q[0], q[1]); else g.moveTo(q[0], q[1]); pen = true; } else pen = false; } g.stroke(); }
    /* a city name in a dark box beside its dot, flipped left near the right edge */
    function tag(q, label) {
      var tw = g.measureText(label).width, lxp = q[0] + 8 * dpr;
      if (lxp + tw + 8 * dpr > W) lxp = q[0] - 8 * dpr - tw - 8 * dpr;
      g.fillStyle = 'rgba(8,7,12,.75)'; g.fillRect(lxp, q[1] - 17 * dpr, tw + 8 * dpr, 14 * dpr);
      g.fillStyle = '#efeaf5'; g.fillText(label, lxp + 4 * dpr, q[1] - 6 * dpr);
    }
    function draw(now) {
      g.clearRect(0, 0, W, H);
      var grd = g.createRadialGradient(W / 2 - R * .3, H / 2 - R * .3, R * .1, W / 2, H / 2, R);
      grd.addColorStop(0, 'rgba(95,227,232,0.10)'); grd.addColorStop(1, 'rgba(8,7,12,0)');
      g.fillStyle = grd; g.beginPath(); g.arc(W / 2, H / 2, R, 0, Math.PI * 2); g.fill();
      g.strokeStyle = 'rgba(95,227,232,0.55)'; g.lineWidth = 1.2 * dpr; g.stroke();
      g.strokeStyle = 'rgba(95,227,232,0.12)'; g.lineWidth = dpr;
      GRAT.forEach(function (ring) { g.beginPath(); var pen = false; ring.forEach(function (v) { var q = P(v); if (q[2] > 0) { if (pen) g.lineTo(q[0], q[1]); else g.moveTo(q[0], q[1]); pen = true; } else pen = false; }); g.stroke(); });
      var s = 1.7 * dpr;
      for (var i = 0; i < land.length; i++) { var q = P(land[i]); if (q[2] <= 0) continue; g.fillStyle = 'rgba(95,227,232,' + (0.22 + 0.7 * q[2]).toFixed(2) + ')'; g.fillRect(q[0] - s / 2, q[1] - s / 2, s, s); }
      VISITED.forEach(function (v) {
        if (v.start < 0) return; var age = (now - v.start) / 1000; if (age > 1.4) return;
        var q = P(v.p); if (q[2] <= 0) return; var a = 1 - age / 1.4;
        g.fillStyle = 'rgba(239,234,245,' + a.toFixed(2) + ')'; g.beginPath(); g.arc(q[0], q[1], 2.2 * dpr, 0, Math.PI * 2); g.fill();
        g.strokeStyle = 'rgba(95,227,232,' + a.toFixed(2) + ')'; g.lineWidth = dpr; g.beginPath(); g.arc(q[0], q[1], (2 + age * 9) * dpr, 0, Math.PI * 2); g.stroke();
      });
      /* every place at once, with the one you picked (or point at) lit up */
      if (allOn || spot) VISITED.forEach(function (v) {
        if (!allOn && v !== spot) return;
        var q = P(v.p); if (q[2] <= 0) return;
        var on = v === spot || v === hover;
        g.fillStyle = on ? '#ffffff' : 'rgba(239,234,245,' + (0.3 + 0.6 * q[2]).toFixed(2) + ')';
        g.beginPath(); g.arc(q[0], q[1], (on ? 3 : 1.8) * dpr, 0, Math.PI * 2); g.fill();
        if (!on) return;
        var pulse = reduce ? 0.3 : (now / 1000) % 1.4 / 1.4; g.strokeStyle = 'rgba(239,234,245,' + (1 - pulse).toFixed(2) + ')'; g.lineWidth = dpr; g.beginPath(); g.arc(q[0], q[1], (4 + pulse * 10) * dpr, 0, Math.PI * 2); g.stroke();
      });
      var upto = reduce ? SEGS.length : tour.seg;
      g.lineWidth = 1.5 * dpr;
      for (var sgi = 0; sgi < upto; sgi++) drawPath(SEGS[sgi].pts, SEGS[sgi].pts.length - 1, 'rgba(255,179,64,' + (0.5 * tour.fade).toFixed(2) + ')');
      if (!reduce && tour.state === 'fly') {
        var bp = ballPos(), sg = SEGS[tour.seg];
        drawPath(sg.pts, Math.floor(bp.idx), 'rgba(255,179,64,0.95)');
        var bq = P(bp.p);
        if (vis(bq)) {
          var gl = g.createRadialGradient(bq[0], bq[1], 0, bq[0], bq[1], 12 * dpr); gl.addColorStop(0, 'rgba(255,255,255,1)'); gl.addColorStop(0.25, 'rgba(255,179,64,.9)'); gl.addColorStop(1, 'rgba(255,179,64,0)');
          g.fillStyle = gl; g.beginPath(); g.arc(bq[0], bq[1], 12 * dpr, 0, Math.PI * 2); g.fill();
        }
      }
      g.font = (10 * dpr) + 'px "Space Mono", monospace';
      HOMES.forEach(function (h) {
        var q = P(h.p); if (q[2] <= 0.02) return;
        var active = (mode === 'tour' ? arrived === h.i : focusH === h) || hover === h;
        g.strokeStyle = active ? '#ffb340' : h.i === LAST ? '#59ff95' : 'rgba(167,123,255,' + Math.min(1, 0.4 + q[2]).toFixed(2) + ')'; g.lineWidth = 1.6 * dpr;
        g.beginPath(); g.arc(q[0], q[1], (active ? 4.5 : 3.2) * dpr, 0, Math.PI * 2); g.stroke();
        if (active) {
          var pulse = reduce ? 0.3 : (now / 1000) % 1.4 / 1.4; g.strokeStyle = 'rgba(255,179,64,' + (1 - pulse).toFixed(2) + ')'; g.lineWidth = dpr; g.beginPath(); g.arc(q[0], q[1], (5 + pulse * 12) * dpr, 0, Math.PI * 2); g.stroke();
          tag(q, h.n.toUpperCase());
        }
      });
      VISITED.forEach(function (v) { if (v !== spot && v !== hover) return; var q = P(v.p); if (q[2] > 0.02) tag(q, v.n.toUpperCase()); });
      var deg = ((-yaw / D) % 360 + 360) % 360;
      rotLabel.textContent = 'ROT ' + deg.toFixed(1).padStart(5, '0') + '° · DRAG TO SPIN';
      var leg = Math.min(tour.seg, SEGS.length - 1);
      legLabel.textContent = mode !== 'tour' ? 'TOUR PAUSED' : (reduce || tour.state === 'end' ? 'TOUR COMPLETE' : 'LEG ' + two(leg + 1) + '/' + two(SEGS.length) + ' · ' + SEGS[leg].km.toLocaleString('en-US') + ' KM');
    }
    function pick(e) {
      var r = cv.getBoundingClientRect(), x = (e.clientX - r.left) * dpr, y = (e.clientY - r.top) * dpr, best = null, bd = 18 * dpr;
      HOMES.forEach(function (h) { var q = P(h.p); if (q[2] <= 0.02) return; var d = Math.hypot(q[0] - x, q[1] - y); if (d < bd) { bd = d; best = h; } });
      if (!best && allOn) { bd = 12 * dpr; VISITED.forEach(function (v) { var q = P(v.p); if (q[2] <= 0.02) return; var d = Math.hypot(q[0] - x, q[1] - y); if (d < bd) { bd = d; best = v; } }); }
      return best;
    }
    var lastT = performance.now(), dirty = true;
    function frame(now) {
      var dt = Math.min(0.05, (now - lastT) / 1000); lastT = now;
      update(dt, now);
      /* with reduced motion nothing moves on its own, so only redraw after input */
      if (visible && (!reduce || dirty)) { draw(now); dirty = false; }
      requestAnimationFrame(frame);
    }
    cv.addEventListener('pointerdown', function (e) { dragging = true; moved = 0; lx = e.clientX; ly = e.clientY; cv.setPointerCapture(e.pointerId); });
    cv.addEventListener('pointermove', function (e) {
      if (!dragging) { var hv = pick(e); if (hv !== hover) { hover = hv; dirty = true; cv.classList.toggle('hot', !!hover); } return; }
      var dx = e.clientX - lx, dy = e.clientY - ly; moved += Math.abs(dx) + Math.abs(dy);
      yaw += dx * 0.4 * D; tilt = Math.max(-60 * D, Math.min(60 * D, tilt + dy * 0.3 * D)); lx = e.clientX; ly = e.clientY; dirty = true;
      if (moved > 6) lastDrag = performance.now();
    });
    cv.addEventListener('pointerup', function (e) { dragging = false; if (moved < 6) { var h = pick(e); if (h) { SFX.click(); if (h.b) spotOn(h); else focus(h, true); dirty = true; } } });
    cv.addEventListener('pointercancel', function () { dragging = false; });
    cv.addEventListener('pointerleave', function () { hover = null; dirty = true; cv.classList.remove('hot'); });
    homeBtns.forEach(function (b) { b.addEventListener('click', function () { dirty = true; }); });
    pcResume.addEventListener('click', function () { dirty = true; });
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { visible = es[0].isIntersecting; dirty = true; }).observe(cv);
    window.addEventListener('resize', function () { size(); dirty = true; });

    /* "Show every place I've been": every visited place stays lit, and the list opens */
    var plBtn = $('places-btn'), plList = $('places-list'), plNote = $('places-note');
    if (plBtn && plList) {
      plList.hidden = true; plNote.hidden = true; plBtn.hidden = false;
      plBtn.addEventListener('click', function () {
        allOn = !allOn; dirty = true; SFX.page();
        plList.hidden = !allOn; plNote.hidden = !allOn;
        plBtn.setAttribute('aria-expanded', String(allOn));
        plBtn.textContent = allOn ? 'Just the homes, please' : 'Show every place I\'ve been';
      });
      placeBtns.forEach(function (b) {
        b.addEventListener('click', function () {
          SFX.click(); dirty = true;
          var slug = b.getAttribute('data-home'), h = slug && HOMES.filter(function (x) { return x.slug === slug; })[0];
          if (h) focus(h, true); else spotOn(VISITED.filter(function (v) { return v.b === b; })[0]);
          /* bring the globe back into view if a good part of it is off screen */
          var r = cv.getBoundingClientRect(), seen = Math.min(r.bottom, window.innerHeight) - Math.max(r.top, 0);
          if (seen < r.height * 0.8) cv.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
        });
      });
    }
    $('globe-wrap').hidden = false; src.hidden = true;
    size(); draw(performance.now());
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { size(); dirty = true; });
    /* jessethe.com/travel/#lisbon opens that postcard */
    var deep = location.hash && HOMES.filter(function (h) { return '#' + h.slug === location.hash; })[0];
    if (deep) { focus(deep, false); if (reduce) { var a0 = angTo(deep.p); yaw = a0.yaw; tilt = a0.tilt; } }
    requestAnimationFrame(frame);
  })();

  /* ---------- the travelling party: pixel portraits ---------- */
  (function () {
    var PX = JT.PX; if (!PX) return;
    /* Player 2 gets the second controller */
    var PAD = ['...cccccccccc...', '.cccccccccccccc.', 'ccckcccccccccacc', 'cckkkcccccccbcac', 'ccckcccccccccbcc', 'cccccccccccccccc', 'ccccc......ccccc', 'cccc........cccc', '.cc..........cc.'];
    var PADC = { c: '#c9c6d2', k: '#1b1824', a: '#ff5fa8', b: '#ffb340' };
    [].forEach.call(document.querySelectorAll('canvas.pav'), function (cv) {
      var who = cv.getAttribute('data-who'), d = Math.min(window.devicePixelRatio || 1, 2), g = cv.getContext('2d');
      cv.width = 48 * d; cv.height = 48 * d; g.setTransform(d, 0, 0, d, 0, 0); g.imageSmoothingEnabled = false;
      g.fillStyle = '#110f17'; g.fillRect(0, 0, 48, 48);
      if (who === 'pidan') PX.spr(g, PX.PIDAN_HEAD, 6, 9, 3, PX.PIDAN);
      else if (who === 'doufu') PX.spr(g, PX.DOUFU_BODY.slice(0, 8).map(function (r) { return r.slice(12); }), 6, 12, 3, PX.DOUFU);
      else if (who === 'p2') { PX.spr(g, PAD, 4, 13, 2.5, PADC); g.font = '9px "Space Mono", monospace'; g.fillStyle = '#5fe3e8'; g.fillText('P2', 4, 10); }
    });
  })();

  /* ---------- the departures board ---------- */
  (function () {
    var board = $('flapboard'), btn = $('flap-btn'), next = $('flap-next'); if (!board || !next) return;
    var CH = ' ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.-', CELLS = 13;
    var ANSWERS = ['ASK PLAYER 2', 'DOG FRIENDLY', 'NEAR A REEF', 'ROLL A D20', 'NOT TELLING', 'SOMEWHERE NEW', 'CLASSIFIED'];
    var rows = [].map.call(board.querySelectorAll('.flaps'), function (el) {
      var text = el.getAttribute('data-text'); el.textContent = ''; el.setAttribute('aria-label', text);
      var cells = [];
      for (var i = 0; i < CELLS; i++) { var c = document.createElement('i'); c.setAttribute('aria-hidden', 'true'); c.textContent = ' '; el.appendChild(c); cells.push({ el: c, ch: ' ' }); }
      return { el: el, cells: cells, text: text };
    });
    function pad(t) { return (t + '             ').slice(0, CELLS); }
    var ticking = 0;
    /* each cell flips forward through the alphabet until it lands on its letter, like a Solari board */
    function flipTo(row, text, done) {
      var target = pad(text.toUpperCase().replace(/[^ A-Z0-9.-]/g, ' ')), left = CELLS;
      row.text = text; row.el.setAttribute('aria-label', text.trim());
      function fin() { if (--left === 0 && done) done(); }
      row.cells.forEach(function (c, i) {
        var goal = target[i];
        if (reduce) { c.ch = goal; c.el.textContent = goal; fin(); return; }
        (function step() {
          if (c.ch === goal) { fin(); return; }
          c.ch = CH[(CH.indexOf(c.ch) + 1) % CH.length];
          c.el.textContent = c.ch; c.el.classList.remove('flip'); void c.el.offsetWidth; c.el.classList.add('flip');
          var now = performance.now(); if (now - ticking > 45) { ticking = now; SFX.tick(); }
          setTimeout(step, 30);
        })();
      });
    }
    var asked = 0, last = 'CLASSIFIED', started = false;
    function start() {
      if (started) return; started = true;
      var n = 0; rows.forEach(function (r) { flipTo(r, r.text, function () { if (++n === rows.length) btn.hidden = false; }); });
    }
    btn.addEventListener('click', function () {
      asked++;
      var pick;
      if (asked === 9) pick = 'STOP ASKING';
      else { var pool = ANSWERS.filter(function (a) { return a !== last; }); pick = pool[Math.floor(Math.random() * pool.length)]; }
      last = pick; btn.disabled = true;
      flipTo(rows[rows.length - 1], pick, function () { btn.disabled = false; });
    });
    if (reduce || !('IntersectionObserver' in window)) start();
    else new IntersectionObserver(function (es, ob) { if (es[0].isIntersecting) { ob.disconnect(); setTimeout(start, 200); } }, { threshold: 0.4 }).observe(board);
  })();
})();
