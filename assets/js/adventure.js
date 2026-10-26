/* The Encrypted CV: a short text adventure across six of Jesse's homes.
   The CV is on a floppy, the key is split in three, and winning prints the CV.
   The game saves itself in this browser after every move. */
(function () {
  var JT = window.JT, SFX = JT.SFX, esc = JT.esc, reduce = JT.reduce;
  function $(id) { return document.getElementById(id); }
  var out = $('adv-out'), form = $('adv-form'), inp = $('adv-in'), side = $('adv-side');
  if (!out || !form) return;

  var SAVE = 'jt-adv', S, queue = [], busy = false;
  var CITY = { toronto: 'Toronto', cambridge: 'Cambridge', lisbon: 'Lisbon', amsterdam: 'Amsterdam', shenzhen: 'Shenzhen', shanghai: 'Shanghai' };
  var ALIAS = { harvard: 'cambridge', boston: 'cambridge', 'harvard yard': 'cambridge', 'the hague': 'amsterdam', hague: 'amsterdam', home: 'shanghai', tauria: 'toronto', 'tauria hq': 'toronto', hq: 'toronto', shelter: 'shenzhen' };
  var ELSE = ['mexico city', 'mexico', 'belgrade', 'sao paulo', 'são paulo', 'copenhagen', 'montreal', 'valencia', 'florence'];
  var ELSEWHERE = {
    'new york': 'Only ever for coffee at the Harvard Club. Nothing for this quest there.',
    huangshan: 'Where Pidan and Doufu were born. They\'re at the shelter in Shenzhen today, though.',
    atlantis: 'That needs eight chevrons, and this is a plane ticket.',
    earth: 'You\'re already on Earth. Probably.'
  };
  var COMPASS = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw', 'north', 'south', 'east', 'west', 'up', 'down'];

  function u(word, cmd) { return '<button type="button" class="u" data-cmd="' + esc(cmd || 'examine ' + word) + '">' + esc(word) + '</button>'; }
  function say(h, cls) { var d = document.createElement('div'); d.innerHTML = h; if (cls) d.className = cls; out.appendChild(d); out.scrollTop = out.scrollHeight; }
  /* print a few lines with a pause between each, holding further commands until the last one lands */
  function later(lines, gap, done) {
    busy = true;
    var k = 0;
    function step() {
      say(lines[k]); k += 1;
      if (k < lines.length) { setTimeout(step, reduce ? 0 : gap); return; }
      if (done) done();
      busy = false; save(); render(); next();
    }
    setTimeout(step, reduce ? 0 : gap);
  }
  function parts() { return ['1', '2', '3'].filter(function (k) { return S.key[k]; }).length; }
  function items(withKeys) {
    var list = [];
    if (S.inv.floppy) list.push('TAURIA.DSK (encrypted)');
    if (S.inv.gear) list.push('dive gear');
    if (S.inv.treats) list.push('a bag of treats (slightly chewed)');
    if (withKeys) ['1', '2', '3'].forEach(function (k) { if (S.key[k]) list.push('key part ' + k + ' (' + S.key[k] + ')'); });
    return list;
  }
  function desc(at) {
    switch (at) {
      case 'toronto': return '<span class="a">TORONTO · TAURIA HQ</span>\nTauria\'s first headquarters. The whiteboards are still covered in encryption diagrams' + (S.inv.floppy ? '.' : ', and on a desk sits a ' + u('floppy') + ' disk labelled TAURIA.DSK.') + ' One ' + u('whiteboard') + ' says READ ME.';
      case 'cambridge': return '<span class="a">CAMBRIDGE · HARVARD YARD</span>\nFallen leaves, tourists, and the John Harvard ' + u('statue') + ' with its suspiciously shiny foot.' + (S.key['1'] ? ' The rubber duck looks pleased with itself.' : ' A yellow rubber ' + u('duck') + ' sits on the Science Center steps, waiting for someone with a bug.');
      case 'lisbon': return '<span class="a">LISBON · THE COAST</span>\nVolunteers are hauling plastic off the ' + u('reef') + '. A small dive shop rents ' + u('gear') + '.' + (S.inv.gear ? ' Your gear is ready, so you could ' + u('dive', 'dive') + '.' : '');
      case 'amsterdam': return '<span class="a">AMSTERDAM · CENTRAAL STATION</span>\nBikes everywhere, most of them pointed roughly at the canal. A ' + u('train') + ' to The Hague leaves every few minutes.';
      case 'shenzhen': return '<span class="a">SHENZHEN · THE RESCUE SHELTER</span>\nDogs everywhere, all of them delighted to see you. A cardboard ' + u('box') + ' in the corner trembles slightly.' + (S.inv.treats || S.f.gave ? '' : ' A white-and-ginger dog zooms past with a bag of treats in her mouth. That\'s ' + u('Doufu', 'examine doufu') + '.');
      case 'shanghai': return '<span class="a">SHANGHAI · HOME</span>\nTwo empty dog ' + u('beds') + ', a stack of character sheets, and an old ' + u('computer') + ' humming in the corner. Its floppy drive is empty.';
    }
    return '';
  }
  function intro() {
    out.innerHTML = '';
    say('<span class="v">ADVENTURE.EXE · THE ENCRYPTED CV</span>\nYour CV is on an old floppy disk, encrypted, and the key is scattered across your homes.\nType ' + u('help', 'help') + ' for commands, or ' + u('hint', 'hint') + ' if you get stuck.', 'gap');
  }
  function fresh() { return { at: 'toronto', inv: {}, key: {}, f: {}, won: false }; }
  function reset() { S = fresh(); intro(); say(desc(S.at)); save(); render(); }
  function save() { JT.store(SAVE, JSON.stringify(S)); }
  function load() {
    try { var s = JSON.parse(JT.store(SAVE) || 'null'); if (s && CITY[s.at] && s.inv && s.key && s.f) return s; } catch (e) {}
    return null;
  }

  /* things you can examine: where they are ('*' anywhere, 'inv:x' while carrying x, a|b either), then what you see */
  var EX = {
    whiteboard: ['toronto', '"KEY SPLIT IN THREE. Part 1: ask the duck. Part 2: eighteen metres down. Part 3: whoever is hiding." Someone has drawn a small dog in the corner.'],
    board: ['toronto', 'See: whiteboard.'],
    diagrams: ['toronto', 'Mostly arrows pointing at boxes labelled THE SERVER CAN\'T READ THIS. It never could.'],
    floppy: ['inv:floppy|toronto', 'A 3.5" floppy disk. The label reads CV.TXT (ENCRYPTED). It needs a three-part key.'],
    disk: ['inv:floppy|toronto', 'A 3.5" floppy disk. The label reads CV.TXT (ENCRYPTED). It needs a three-part key.'],
    duck: ['cambridge', 'A yellow rubber duck. Famous for fixing code by listening patiently.'],
    statue: ['cambridge', 'The John Harvard statue, also known as the statue of three lies. It isn\'t really him, he didn\'t found the place, and the date is wrong.'],
    foot: ['cambridge', 'Tourists rub it for luck. Locals know better, and so should you.'],
    leaves: ['cambridge', 'Red, orange and gold. Cambridge in October is unfair to every other city.'],
    reef: ['lisbon', 'Under the plastic, the reef is beautiful. Mostly beautiful.'],
    volunteers: ['lisbon', 'They\'re hauling plastic off the reef, one bag at a time. One of them waves at you.'],
    gear: ['lisbon|inv:gear', 'A mask, fins and a tank, sized for an Open Water diver.'],
    shop: ['lisbon', 'A tiny dive shop. They rent gear to anyone with an Open Water card, which you have.'],
    train: ['amsterdam', 'A yellow double-decker train. It goes to The Hague, if you want to ride it.'],
    bikes: ['amsterdam', 'Thousands of bikes. Three of them are in the canal.'],
    canal: ['amsterdam', 'Calm, green and full of bikes.'],
    box: ['shenzhen', 'Two shy eyes peer out of the shredded paper. That\'s Pidan. Something metal glints underneath him.'],
    pidan: ['shenzhen', 'A black, tan and white dog with big ears, hiding in a box. Shy, but very good.'],
    doufu: ['shenzhen', 'White and ginger, very fast, very pleased with herself.'],
    dogs: ['shenzhen', 'Every dog here was rescued, taken to a vet, neutered and fed by volunteers. Every one of them wants a home. <a href="../rescue/">Help one</a>.'],
    shelter: ['shenzhen', 'Every dog here was rescued, taken to a vet, neutered and fed by volunteers. Every one of them wants a home. <a href="../rescue/">Help one</a>.'],
    treats: ['inv:treats', 'A bag of treats. Doufu\'s teeth marks are on every single one.'],
    computer: ['shanghai', 'An old PC with a floppy drive, waiting for a disk and a key.'],
    beds: ['shanghai', 'Both empty. The dogs are visiting the shelter in Shenzhen today.'],
    sheets: ['shanghai', 'Character sheets for three demigods. One of them is mostly doodles.'],
    printer: ['shanghai', 'An old 9-pin dot-matrix printer. It only wakes up for something important.'],
    d20: ['*', 'Your lucky d20. It has rolled a few natural 20s in its time, and many more 1s.']
  };
  function canSee(where) {
    return where.split('|').some(function (w) { return w === '*' || w === S.at || (w.indexOf('inv:') === 0 && S.inv[w.slice(4)]); });
  }

  var STOP = ['the', 'a', 'an', 'to', 'at', 'with', 'on', 'into', 'in', 'up', 'some', 'my', 'for', 'around'];
  var VERB = { l: 'look', x: 'examine', inspect: 'examine', read: 'examine', check: 'examine', i: 'inventory', inv: 'inventory', get: 'take', grab: 'take', pick: 'take', rent: 'take',
    go: 'fly', travel: 'fly', walk: 'fly', ask: 'talk', speak: 'talk', explain: 'talk', debug: 'talk', insert: 'use', run: 'chase', feed: 'give', ride: 'train', board: 'train',
    swim: 'dive', pat: 'pet', stroke: 'pet', cuddle: 'pet', '?': 'help', q: 'quit', exit: 'quit', whoami: 'who', h: 'help' };

  function cmd(raw) {
    var line = raw.trim().toLowerCase().replace(/\s+/g, ' ').replace(/[.!?]+$/, '');
    if (!line) return;
    say('<span class="u">&gt; ' + esc(raw.trim()) + '</span>');
    if (line === 'restart' || line === 'play again' || line === 'new game') { SFX.floppy(); reset(); return; }
    if (S.won && line !== 'xyzzy') { say('You already won. The CV is printed. Type ' + u('restart', 'restart') + ' to play again.'); return; }
    var w = line.split(' ');
    var v = VERB[w[0]] || w[0], rest = w.slice(1).filter(function (x) { return STOP.indexOf(x) < 0; }).join(' ');
    if (line === 'who am i') v = 'who';
    if (v === 'look' && rest) v = 'examine';
    if (v === 'take' && rest === 'train') v = 'train';
    if (v === 'talk' && w[0] === 'debug' && !rest) rest = 'duck';
    if (COMPASS.indexOf(v) >= 0 || (v === 'fly' && COMPASS.indexOf(rest) >= 0)) { say('This quest travels by plane, not by compass. Type ' + u('map', 'map') + '.'); return; }

    if (v === 'help') { say('Commands: ' + u('look', 'look') + ', ' + u('map', 'map') + ', fly &lt;city&gt;, examine &lt;thing&gt;, take &lt;thing&gt;, talk &lt;someone&gt;, ' + u('inventory', 'inventory') + ', ' + u('hint', 'hint') + ', ' + u('restart', 'restart') + '.\nSome places have their own verbs. Tap any <span class="u">white word</span> to look at it.'); return; }
    if (v === 'look') { say(desc(S.at)); return; }
    if (v === 'map') {
      say('Six of your homes matter on this quest: ' + Object.keys(CITY).map(function (c) { return c === S.at ? '<span class="c">' + CITY[c] + '</span>' : u(CITY[c], 'fly ' + c); }).join(', ') + '.\nYou\'re in <span class="c">' + CITY[S.at] + '</span>. Type fly and a city, or tap one.');
      return;
    }
    if (v === 'fly') {
      var dest = ALIAS[rest] || rest;
      if (!dest) { say('Fly where? Type ' + u('map', 'map') + '.'); return; }
      if (CITY[dest]) {
        if (dest === S.at) { say('You\'re already in ' + CITY[dest] + '.'); return; }
        S.at = dest; SFX.tick(); say('<span class="d">Wheels up… and down.</span>'); say(desc(dest)); return;
      }
      if (ELSEWHERE[dest]) { say(ELSEWHERE[dest]); return; }
      if (ELSE.indexOf(dest) >= 0) { say('You lived there once, and loved it, but nothing for this quest is there. Type ' + u('map', 'map') + '.'); return; }
      say('You haven\'t lived there. Yet.'); return;
    }
    if (v === 'inventory') { var have = items(true); say(have.length ? 'You\'re carrying ' + have.join(', ') + ' and a d20.' : 'You\'re carrying nothing but a d20.'); return; }
    if (v === 'examine') {
      var e = EX[rest];
      if (e && canSee(e[0])) { say(e[1]); return; }
      say(rest ? 'You don\'t see that here.' : 'Examine what?'); return;
    }
    if (v === 'take') {
      if ((rest === 'floppy' || rest === 'disk' || rest === 'tauria.dsk' || rest === 'floppy disk') && S.at === 'toronto') {
        if (S.inv.floppy) { say('You already have it.'); return; }
        S.inv.floppy = true; SFX.floppy(); say('Taken. The label reads CV.TXT (ENCRYPTED). The key was split into three parts. Of course it was.'); return;
      }
      if ((rest === 'gear' || rest === 'mask' || rest === 'dive gear' || rest === 'tank' || rest === 'fins') && S.at === 'lisbon') {
        if (S.inv.gear) { say('You already have your gear.'); return; }
        S.inv.gear = true; say('You rent a mask, fins and a tank. The owner checks your Open Water card and nods. Now you could ' + u('dive', 'dive') + '.'); return;
      }
      if (rest === 'duck' && S.at === 'cambridge') { say('The duck belongs to the Science Center. Try talking to it instead.'); return; }
      if ((rest === 'key' || rest === 'tag') && S.at === 'shenzhen') { say(S.key['3'] ? 'You already have it.' : 'Pidan growls, very politely. Not without a bribe.'); return; }
      if ((rest === 'treats' || rest === 'bag') && S.at === 'shenzhen') { say(S.inv.treats ? 'You already have them.' : 'Doufu is much faster than you. Maybe if you chased her…'); return; }
      if ((rest === 'bike' || rest === 'bikes') && S.at === 'amsterdam') { say('You\'d never get it through airport security.'); return; }
      if ((rest === 'flip-flop' || rest === 'flipflop' || rest === 'plastic') && S.at === 'lisbon') { say('You carry it up for the volunteers. One less thing on the reef.'); return; }
      if (rest === 'd20') { say('It\'s already in your pocket. It always is.'); return; }
      if (rest === 'dog' || rest === 'pidan' || rest === 'doufu') { say(S.at === 'shenzhen' ? 'They already came home with you once. That\'s a different story, on the <a href="../rescue/">Rescue</a> page.' : 'They\'re at the shelter in Shenzhen today.'); return; }
      say('You can\'t take that.'); return;
    }
    if (v === 'talk') {
      if (rest === 'duck' && S.at === 'cambridge') {
        if (S.key['1']) { say('The duck has nothing more to say. It never did.'); return; }
        S.key['1'] = '7F3A'; SFX.chime();
        later(['You explain your problem to the duck, line by line.', 'Halfway through, you spot the answer yourself. The duck says nothing, as always.', 'Under it you find a small tag: <span class="a">KEY PART 1 · 7F3A</span>'], 650); return;
      }
      if (rest === 'statue' && S.at === 'cambridge') { say('John Harvard says nothing. To be fair, it isn\'t really him.'); return; }
      if (rest === 'volunteers' && S.at === 'lisbon') { say('"Bring something up with you when you dive," they say. "The reef will thank you."'); return; }
      if ((rest === 'pidan' || rest === 'box') && S.at === 'shenzhen') { say(S.key['3'] ? 'Pidan thumps his tail once inside the box. That\'s a lot, for him.' : 'Pidan listens from inside the box. He is not ready to talk. A treat might help.'); return; }
      if (rest === 'doufu' && S.at === 'shenzhen') { say('Doufu wags at you and drops into a play bow. She wants to be ' + u('chased', 'chase doufu') + '.'); return; }
      say('Nobody here answers.'); return;
    }
    if (v === 'pet') {
      if (S.at !== 'shenzhen') { say('Pidan and Doufu are at the shelter in Shenzhen today.'); return; }
      if (rest === 'pidan') { say(S.key['3'] ? 'Pidan leans into your hand. You\'re friends now.' : 'Pidan flinches, then lets you pat his head. Once. Very gently.'); return; }
      if (rest === 'doufu' || !rest || rest === 'dog' || rest === 'dogs') { say('Doufu flops over for belly rubs, then leaps up. She\'d rather be chased.'); return; }
      say('It doesn\'t seem to want that.'); return;
    }
    if (v === 'dive') {
      if (S.at !== 'lisbon') { say('There\'s no water here worth diving in.'); return; }
      if (!S.inv.gear) { say('You hold your breath and make it about two metres. Rent some ' + u('gear', 'take gear') + ' first.'); return; }
      if (S.key['2']) { say('You\'ve already found what was down there. The reef thanks you.'); return; }
      S.key['2'] = 'C0DE'; SFX.bubble();
      later(['<span class="c">5 m.</span> The colours start to fade.', '<span class="c">10 m.</span> A school of fish drifts past.', '<span class="c">18 m.</span> The Open Water limit. Wedged in the coral, next to a lost flip-flop, is a brass tag: <span class="a">KEY PART 2 · C0DE</span>', 'You ascend slowly, with a safety stop at 5 m. Good diver.'], 700, function () { SFX.bubble(); }); return;
    }
    if (v === 'train') {
      if (S.at !== 'amsterdam') { say('No train here goes anywhere useful.'); return; }
      later(['The train glides to The Hague in under an hour.', 'At the Security Delta office, a sign says AUTHORISED FOUNDERS ONLY. You were one, so you wave at reception.', 'Nothing for this quest here, but a lovely ride. You head back to Amsterdam.'], 650); return;
    }
    if (v === 'chase') {
      if (rest === 'pidan') { say('Pidan does not want to be chased. Pidan wants you to stop looking at him.'); return; }
      if (rest !== 'doufu' && rest !== 'dog') { say('Chase whom?'); return; }
      if (S.at !== 'shenzhen') { say('Doufu isn\'t here. She\'d be thrilled that you asked, though.'); return; }
      if (S.inv.treats || S.f.gave) { say('Doufu loves this. You\'re out of breath. Nothing else happens.'); return; }
      S.inv.treats = true;
      later(['You chase Doufu around the shelter. Once. Twice. Three times.', 'She has never been happier. She drops the bag of treats at your feet so you\'ll do it again.'], 650); return;
    }
    if (v === 'give') {
      if (S.at !== 'shenzhen') { say('There\'s nobody here who wants that.'); return; }
      if (!S.inv.treats) { say('You have nothing Pidan wants. Doufu has the treats.'); return; }
      if (rest.indexOf('doufu') >= 0) { say('Doufu has already eaten half the bag. Pidan is the one who needs a bribe.'); return; }
      if (S.key['3']) { say('Pidan has had enough treats for one day.'); return; }
      delete S.inv.treats; S.f.gave = true; S.key['3'] = '2026'; SFX.crunch();
      later(['You leave a treat by the box and keep very still.', 'After a long moment, Pidan creeps out, takes it, and nudges a small tag towards you with his nose: <span class="a">KEY PART 3 · 2026</span>'], 950); return;
    }
    if (v === 'use' || v === 'decrypt') {
      if (S.at !== 'shanghai') { say('There\'s no computer here. The one at home in Shanghai has a floppy drive.'); return; }
      if (!S.inv.floppy) { say('The drive is empty. Didn\'t you leave a disk at Tauria HQ?'); return; }
      var have = parts();
      if (have < 3) { SFX.error(); say('The computer asks for a key. You have ' + have + ' of 3 parts. Type ' + u('hint', 'hint') + ' if you\'re stuck.'); return; }
      S.won = true; SFX.decrypt(1.4);
      later(['You insert TAURIA.DSK and type <span class="a">7F3A-C0DE-2026</span>.', 'DECRYPTING ▓▓▓▓▓▓▓▓▓▓', '<span class="a">CV.TXT UNLOCKED.</span> The old dot-matrix printer in the corner wakes up…', '<span class="v">*** YOU HAVE WON ***</span> Type ' + u('restart', 'restart') + ' to play again.'], 750, function () { SFX.fanfare(); setTimeout(JT.printCV, 900); }); return;
    }
    if (v === 'hint') {
      var h = !S.inv.floppy ? (S.at === 'toronto' ? 'Take the floppy. Then read the whiteboard.' : 'Start at Tauria HQ in Toronto. Take the floppy.')
        : !S.key['1'] ? 'Fly to Cambridge and talk to the duck.'
        : !S.key['2'] ? (S.inv.gear ? 'You have gear. Dive.' : 'In Lisbon, rent some gear, then dive.')
        : !S.key['3'] ? (S.inv.treats ? 'Give the treats to Pidan.' : 'In Shenzhen, chase Doufu.')
        : 'Fly home to Shanghai and use the floppy.';
      say('<span class="d">HINT:</span> ' + h); return;
    }
    if (v === 'who') { say('You\'re Jesse. Founder, product builder, Harvard alum, and currently locked out of your own CV.'); return; }
    if (v === 'score') { say('Key parts: ' + parts() + ' of 3.' + (S.inv.floppy ? ' Floppy: yes.' : ' Floppy: still in Toronto.')); return; }
    if (v === 'save' || v === 'load') { say('Your game saves itself after every move. It lives in this browser, and nowhere else.'); return; }
    if (v === 'quit') { say('There\'s no quitting a quest. Close the tab if you must. Your game is saved.'); return; }
    if (v === 'xyzzy') { say('Nothing happens. Wrong adventure, but nice try.'); JT.achieve('xyzzy'); return; }
    if (v === 'plugh') { say('A hollow voice says "Plugh." Then, nothing. Also the wrong adventure.'); return; }
    if (v === 'grue' || line === 'eaten by a grue') { say('There are no grues on this site. Pidan checked. Twice.'); return; }
    if (v === 'coffee' || line === 'drink coffee') { say('You drink a coffee. Caffeine level: optimal.'); return; }
    if (v === 'sleep' || v === 'nap') { say('Sleep schedule: still not found.'); return; }
    if (v === 'roll') {
      var n = Math.floor(Math.random() * 20) + 1;
      if (n === 20) { JT.store('jt-sheet', '1'); JT.achieve('nat20'); say('You roll your d20. <span class="a">Natural 20!</span> It doesn\'t open floppy disks, but Ajax\'s sheet on the <a href="../hobbies/">Hobbies</a> page is unlocked.'); return; }
      say('You roll your d20. ' + n + '. The DM nods.'); return;
    }
    SFX.error(); say('I don\'t know how to do that. Type ' + u('help', 'help') + '.');
  }
  function next() { while (!busy && queue.length) { cmd(queue.shift()); if (!busy) { save(); render(); } } }
  function submit(v) { queue.push(v); next(); }

  /* the quest log beside the screen */
  var keyEls = ['1', '2', '3'].map(function (k) { return $('adv-k' + k); }), mapBtns = [].slice.call(document.querySelectorAll('#adv-map button')), inv = $('adv-inv'), won = $('adv-won'), drawn = false;
  function render() {
    keyEls.forEach(function (slot, i) {
      var k = String(i + 1), b = slot.querySelector('b'), val = S.key[k] || '????';
      if (slot.getAttribute('data-v') === val) return;
      slot.setAttribute('data-v', val); b.textContent = val; slot.classList.toggle('got', !!S.key[k]);
      if (S.key[k] && drawn) JT.scramble(b, 700);
    });
    mapBtns.forEach(function (b) { if (b.getAttribute('data-city') === S.at) b.setAttribute('aria-current', 'location'); else b.removeAttribute('aria-current'); });
    inv.innerHTML = items().concat('a d20').map(function (x) { return '<li>' + esc(x.charAt(0).toUpperCase() + x.slice(1)) + '</li>'; }).join('');
    won.hidden = !S.won;
    drawn = true;
  }

  form.addEventListener('submit', function (e) { e.preventDefault(); var v = inp.value; inp.value = ''; submit(v); });
  inp.addEventListener('keydown', function (e) {
    if ((e.key === '~' || e.key === '`') && !inp.value) { e.preventDefault(); JT.openTerm(); return; }
    if (e.key === 'Escape') { inp.blur(); return; }
    if ((e.key || '').length === 1 || e.key === 'Enter' || e.key === 'Backspace') SFX.key(e.key === 'Enter');
  });
  /* white words in the log, the buttons under the screen and the map all type a command for you */
  function typed(c) { submit(c); if (!JT.touch) inp.focus({ preventScroll: true }); }
  out.addEventListener('click', function (e) { var b = e.target.closest('button[data-cmd]'); if (b) typed(b.getAttribute('data-cmd')); });
  $('adv-btns').addEventListener('click', function (e) { var b = e.target.closest('button[data-cmd]'); if (b) typed(b.getAttribute('data-cmd')); });
  mapBtns.forEach(function (b) { b.addEventListener('click', function () { typed('fly ' + b.getAttribute('data-city')); }); });
  $('adv-restart').addEventListener('click', function () { typed('restart'); });
  out.parentNode.addEventListener('click', function (e) { if (!e.target.closest('a, button') && !window.getSelection().toString()) inp.focus({ preventScroll: true }); });

  form.hidden = false; $('adv-btns').hidden = false; side.hidden = false; $('advwrap').classList.add('on');
  S = load();
  if (S) {
    intro();
    say(S.won ? '<span class="d">SAVE GAME FOUND.</span> You already won this one. Type ' + u('restart', 'restart') + ' to play again.' : '<span class="d">SAVE GAME FOUND.</span> ' + parts() + ' of 3 key parts. Picking up where you left off.');
    say(desc(S.at)); render();
  } else reset();
  if (!JT.touch) inp.focus({ preventScroll: true });
})();
