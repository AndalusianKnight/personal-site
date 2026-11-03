/* Concept A-lite: today's hero, with a live terminal, NOW.TXT and the rooms as icons underneath. */
(function () {
  var JT = window.JT, LAB = JT.LAB, host = document.getElementById('term-host');
  if (!LAB || !host) return;
  LAB.whenBooted(function () { LAB.demo(host); });
})();
