/* Contact: the green-screen form, the reason chips (?reason= in the link picks one), and CLOCK.SYS. */
(function () {
  var JT = window.JT, SFX = JT.SFX, reduce = JT.reduce;
  function $(id) { return document.getElementById(id); }

  /* ---------- the form ---------- */
  var form = $('contact-form'); if (!form) return;
  var err = $('cf-err'), out = $('cf-out'), msgEl = $('cf-msg'), radios = [].slice.call(form.querySelectorAll('input[name="reason"]'));
  var KEYS = { hiring: 0, project: 1, coffee: 2, rescue: 3, hi: 4 };
  var HELP = { adopt: 'Hi Jesse, I\'d like to adopt a rescue dog. ', foster: 'Hi Jesse, I could foster a rescue dog. ', donate: 'Hi Jesse, I\'d like to donate to the rescues you work with. ', volunteer: 'Hi Jesse, I\'d like to volunteer with a rescue. ' };
  function pick(i, focus) {
    radios[i].checked = true;
    if (focus) { form.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' }); setTimeout(function () { $('cf-name').focus({ preventScroll: true }); }, reduce ? 0 : 500); }
  }
  var q = new URLSearchParams(location.search), r = (q.get('reason') || '').toLowerCase(), help = (q.get('help') || '').toLowerCase();
  if (KEYS[r] != null) pick(KEYS[r]);
  if (HELP[help] && !msgEl.value) msgEl.value = HELP[help];
  [].forEach.call(document.querySelectorAll('.reasons button'), function (b) {
    b.addEventListener('click', function () { pick(+b.getAttribute('data-reason'), true); SFX.page(); });
  });
  form.addEventListener('keydown', function (e) { if ((e.key || '').length === 1 || e.key === 'Backspace' || e.key === 'Enter') SFX.key(e.key === 'Enter' || e.key === ' '); });
  var busy = false;
  form.addEventListener('submit', function (e) {
    e.preventDefault(); SFX.unlock();
    if (busy) return;
    var name = $('cf-name').value.trim(), email = $('cf-email').value.trim(), msg = msgEl.value.trim();
    var reason = (radios.filter(function (x) { return x.checked; })[0] || radios[0]).value;
    if (!name) { err.textContent = '?NAME ERROR  who is this?'; SFX.error(); $('cf-name').focus(); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { err.textContent = '?ADDRESS ERROR  that email looks off'; SFX.error(); $('cf-email').focus(); return; }
    if (!msg) { err.textContent = '?MESSAGE ERROR  nothing to send'; SFX.error(); msgEl.focus(); return; }
    err.textContent = ''; busy = true;
    var step = 0, done = null;
    SFX.tape(1);
    JT.sendMail({ name: name, email: email, reason: reason, message: msg, website: $('cf-web').value }).then(function (res) { done = res; });
    var tmr = setInterval(function () {
      if (step < 10) step += 1;
      out.textContent = 'TRANSMITTING ' + new Array(step + 1).join('▓') + new Array(11 - step).join('░');
      if (step < 10 || !done) return;
      clearInterval(tmr); busy = false;
      if (!done.ok) { out.textContent = ''; err.textContent = '?' + String(done.error || 'SEND').toUpperCase() + ' ERROR  try again'; SFX.error(); return; }
      if (done.via === 'api') {
        out.textContent = 'MESSAGE DELIVERED. Thanks, ' + name + '. I\'ll write back soon.';
        form.reset(); radios[0].checked = true;
      } else {
        out.innerHTML = 'MESSAGE READY. Your email app is opening with it, so press send there.\nIf nothing opens, <a href="' + JT.esc(done.href) + '">send it from here</a>.';
        setTimeout(function () { location.href = done.href; }, 400);
      }
      SFX.chime(); JT.achieve('mail');
    }, 90);
  });

  /* ---------- CLOCK.SYS ---------- */
  (function () {
    var t = $('clk-t'); if (!t) return;
    var m = $('clk-m'), you = $('clk-you'), range = $('clk-r'), box = $('clk'), two = JT.two, preview = null;
    range.value = JT.shanghai().h;
    function tick() {
      var n = JT.shanghai(), b = JT.shanghai(preview == null ? n.h : preview);
      t.textContent = preview == null ? two(n.h) + ':' + two(n.m) + ':' + two(n.s) : two(preview) + ':00';
      t.classList.toggle('pv', preview != null);
      m.textContent = b.long; box.classList.toggle('night', b.night);
      var off = -new Date().getTimezoneOffset() / 60, diff = 8 - off, loc = new Date(), ad = Math.abs(diff);
      you.textContent = preview != null ? 'Preview. Live time is ' + two(n.h) + ':' + two(n.m) + '.'
        : diff === 0 ? 'You\'re on Shanghai time too.'
        : 'It\'s ' + two(loc.getHours()) + ':' + two(loc.getMinutes()) + ' where you are, ' + ad + (ad === 1 ? ' hour ' : ' hours ') + (diff > 0 ? 'behind' : 'ahead of') + ' me.';
    }
    range.addEventListener('input', function () { preview = parseInt(range.value, 10); tick(); SFX.tick(); });
    $('clk-live').addEventListener('click', function () { preview = null; range.value = JT.shanghai().h; tick(); });
    tick(); setInterval(tick, 1000);
  })();
})();
