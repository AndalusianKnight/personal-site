/* Education: the course list (collapsed, with filters), the redacted award and the paper reader. */
(function () {
  var JT = window.JT, SFX = JT.SFX, reduce = JT.reduce;
  function $(id) { return document.getElementById(id); }

  /* ---------- course list ---------- */
  var btn = $('courses-btn'), box = $('courses-box'), list = $('courses'), filters = $('course-filters');
  if (btn && box) {
    var items = [].slice.call(list.querySelectorAll('li')), total = items.length, cur = 'all';
    var CATS = [['all', 'All'], ['cs', 'Computer science'], ['hist', 'History & philosophy'], ['biz', 'Business & economics'], ['arts', 'Maths, science & arts']];
    function setOpen(open) {
      box.hidden = !open; btn.setAttribute('aria-expanded', String(open));
      btn.textContent = open ? 'Hide courses ▴' : 'See all ' + total + ' courses ▾';
    }
    CATS.forEach(function (c) {
      var n = c[0] === 'all' ? total : items.filter(function (li) { return li.getAttribute('data-cat') === c[0]; }).length;
      var b = document.createElement('button'); b.type = 'button'; b.setAttribute('data-c', c[0]); b.setAttribute('aria-pressed', String(c[0] === 'all'));
      b.textContent = c[1] + ' · ' + n;
      b.addEventListener('click', function () {
        cur = c[0];
        items.forEach(function (li) { li.hidden = cur !== 'all' && li.getAttribute('data-cat') !== cur; });
        filters.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', String(x.getAttribute('data-c') === cur)); });
      });
      filters.appendChild(b);
    });
    filters.hidden = false; btn.hidden = false; setOpen(false);
    btn.addEventListener('click', function () { var open = box.hidden; setOpen(open); if (open) { SFX.page(); JT.achieve('courses'); } });
  }

  /* ---------- the redacted award ---------- */
  var yb = $('yearbook');
  if (yb) yb.addEventListener('click', function () {
    if (yb.classList.contains('open')) return;
    yb.classList.add('open'); yb.parentNode.classList.add('open');
    yb.innerHTML = '<small>Declassified · high school</small><span>Top student in English Literature of my whole graduating class. In high school, but it still counts.</span>';
    yb.setAttribute('aria-label', 'Top student in English Literature of my whole graduating class, in high school');
    SFX.decrypt(0.9); JT.scramble(yb, 900);
  });

  /* ---------- papers open in the reader ---------- */
  var reader = $('reader'), rin = $('reader-in'), rtitle = $('reader-title'), texts = $('paper-texts'), links = [].slice.call(document.querySelectorAll('.papers a'));
  if (!reader || !texts) return;
  texts.hidden = true;
  function open(id, opts) {
    var src = document.getElementById(id); if (!src) return;
    links.forEach(function (a) { a.setAttribute('aria-current', String(a.getAttribute('data-paper') === id)); });
    rin.innerHTML = src.innerHTML; rtitle.textContent = 'READER.EXE · ' + src.getAttribute('data-fn');
    reader.hidden = false;
    rin.classList.remove('loading'); void rin.offsetWidth; if (!reduce) rin.classList.add('loading');
    if (opts.user) { SFX.page(); history.replaceState(null, '', '#' + id); reader.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'nearest' }); }
    JT.achieve('paper');
  }
  links.forEach(function (a) { a.addEventListener('click', function (e) { e.preventDefault(); open(a.getAttribute('data-paper'), { user: true }); }); });
  $('reader-x').addEventListener('click', function () {
    reader.hidden = true; links.forEach(function (a) { a.setAttribute('aria-current', 'false'); });
    history.replaceState(null, '', location.pathname + location.search);
  });
  if (location.hash && document.getElementById(location.hash.slice(1)) && document.getElementById(location.hash.slice(1)).classList.contains('paper-src')) {
    open(location.hash.slice(1), {}); setTimeout(function () { reader.scrollIntoView({ block: 'center' }); }, 50);
  }
})();
