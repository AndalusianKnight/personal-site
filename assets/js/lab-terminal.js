/* Concept C: the homepage is the terminal. The real one, mounted full size, with clickable commands for anyone who'd rather not type. */
(function () {
  var JT = window.JT, LAB = JT.LAB, host = document.getElementById('term-host');
  if (!LAB || !host) return;
  LAB.whenBooted(function () {
    LAB.demo(host, ['now', 'ls']);
    if (!JT.touch) setTimeout(function () { if (JT.termIdle()) JT.openTerm(); }, JT.reduce ? 0 : 3200);
  });
})();
