/* ===========================================================
   Star Friends — a picture + audio learning game for ages 1–3
   Plain JavaScript, no build step. Everything stays on-device.
   =========================================================== */

(function () {
  "use strict";

  // Temporary on-screen error reporter: if any script error happens, show it
  // so we can see why a button might not be wired up. (Will be removed later.)
  window.addEventListener("error", function (e) {
    let box = document.getElementById("debug-error");
    if (!box) {
      box = document.createElement("div");
      box.id = "debug-error";
      box.style.cssText = "position:fixed;left:0;right:0;bottom:0;z-index:999;" +
        "background:#b00;color:#fff;font:14px monospace;padding:8px;white-space:pre-wrap;";
      document.body.appendChild(box);
    }
    box.textContent = "JS ERROR: " + e.message + "\n@ " + e.filename + ":" + e.lineno;
  });

  /* ---------- Saved progress (localStorage) ---------- */
  const SAVE_KEY = "starFriendsSave_v1";
  const save = loadSave();

  function loadSave() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) { /* ignore */ }
    return defaultSave();
  }
  function defaultSave() {
    return {
      avatar: null, // dataURL of the kid's photo, or an emoji, or null
      stars: 0,
      levels: { counting: 1, colors: 1, shapes: 1, numbers: 1, animals: 1 },
      streak: { counting: 0, colors: 0, shapes: 0, numbers: 0, animals: 0 }
    };
  }
  function persist() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); } catch (e) {}
  }

  /* ---------- Audio: speech + sound effects ---------- */
  const audioCtx = (window.AudioContext || window.webkitAudioContext)
    ? new (window.AudioContext || window.webkitAudioContext)()
    : null;

  function speak(text) {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.9;    // a little slower for little ears
    u.pitch = 1.3;   // friendly, higher voice
    u.volume = 1;
    window.speechSynthesis.speak(u);
  }

  // A short cheerful tone (used for correct answers)
  function playChime() {
    if (!audioCtx) return;
    resumeAudio();
    const now = audioCtx.currentTime;
    [523.25, 659.25, 783.99].forEach((f, i) => {
      const o = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      o.type = "triangle";
      o.frequency.value = f;
      o.connect(g); g.connect(audioCtx.destination);
      const t = now + i * 0.12;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.3, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
      o.start(t); o.stop(t + 0.32);
    });
  }

  // A soft "boop" for a gentle miss (never harsh for little kids)
  function playBoop() {
    if (!audioCtx) return;
    resumeAudio();
    const now = audioCtx.currentTime;
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = "sine";
    o.frequency.setValueAtTime(300, now);
    o.frequency.exponentialRampToValueAtTime(180, now + 0.25);
    o.connect(g); g.connect(audioCtx.destination);
    g.gain.setValueAtTime(0.25, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    o.start(now); o.stop(now + 0.32);
  }

  // Firework "bang" — a noise burst + low thump
  function playBang() {
    if (!audioCtx) return;
    resumeAudio();
    const now = audioCtx.currentTime;
    // noise burst
    const buffer = audioCtx.createBuffer(1, audioCtx.sampleRate * 0.4, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 2);
    }
    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;
    const ng = audioCtx.createGain();
    ng.gain.setValueAtTime(0.5, now);
    ng.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    noise.connect(ng); ng.connect(audioCtx.destination);
    noise.start(now);
    // low thump
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = "sine";
    o.frequency.setValueAtTime(120, now);
    o.frequency.exponentialRampToValueAtTime(40, now + 0.3);
    o.connect(g); g.connect(audioCtx.destination);
    g.gain.setValueAtTime(0.6, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    o.start(now); o.stop(now + 0.42);
  }

  function resumeAudio() {
    if (audioCtx && audioCtx.state === "suspended") audioCtx.resume();
  }

  /* ---------- Fireworks on the canvas ---------- */
  const canvas = document.getElementById("fx");
  const ctx = canvas.getContext("2d");
  let particles = [];
  let fxRunning = false;

  function sizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  sizeCanvas();
  window.addEventListener("resize", sizeCanvas);

  function burst(x, y) {
    const colors = ["#ff6b9d", "#4ecdc4", "#ffd93d", "#a685e2", "#6bcf7f", "#ff9f40"];
    const n = 40;
    for (let i = 0; i < n; i++) {
      const angle = (Math.PI * 2 * i) / n;
      const speed = 2 + Math.random() * 4;
      particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 2 + Math.random() * 3
      });
    }
    playBang();
  }

  function runFx() {
    if (fxRunning) return;
    fxRunning = true;
    (function frame() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.06; // gravity
        p.life -= 0.016;
        ctx.globalAlpha = Math.max(p.life, 0);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      particles = particles.filter(p => p.life > 0);
      if (particles.length > 0) {
        requestAnimationFrame(frame);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        fxRunning = false;
      }
    })();
  }

  function fireworksShow(bursts) {
    let count = 0;
    const doBurst = () => {
      const x = canvas.width * (0.2 + Math.random() * 0.6);
      const y = canvas.height * (0.2 + Math.random() * 0.4);
      burst(x, y);
      runFx();
      if (++count < bursts) setTimeout(doBurst, 350);
    };
    doBurst();
  }

  /* ---------- Avatar handling ---------- */
  const photoInput = document.getElementById("photo-input");
  const avatarCircles = () => document.querySelectorAll(".avatar-circle");

  // Default avatars kids can pick instead of a photo
  const AVATAR_ANIMALS = ["🐶", "🐱", "🐰", "🦊", "🐻", "🐼", "🦁", "🐸", "🐵", "🦄", "🐧", "🐥"];
  const AVATAR_SHAPES  = ["⭐", "❤️", "🔵", "🟥", "🔺", "🔷", "🟢", "🟣"];

  // Apply the saved avatar everywhere. A photo is stored as a dataURL
  // (starts with "data:"); an animal friend is stored as an emoji string.
  function applyAvatar(value) {
    const isPhoto = typeof value === "string" && value.indexOf("data:") === 0;
    document.querySelectorAll(".avatar-circle").forEach(el => {
      const ph = el.querySelector(".avatar-placeholder");
      if (isPhoto) {
        el.style.backgroundImage = `url('${value}')`;
        if (ph) ph.style.display = "none";
      } else {
        el.style.backgroundImage = "";
        if (ph) {
          ph.style.display = "";
          ph.textContent = value || "🙂";
        }
      }
    });
  }

  function setAvatar(value) {
    save.avatar = value;
    persist();
    applyAvatar(value);
  }

  // Clear the "selected" highlight on every picker (animals, shapes)
  function clearPickerSelection() {
    document.querySelectorAll(".animal-choice.selected")
      .forEach(b => b.classList.remove("selected"));
  }

  // Build a picker row of emoji choices on the welcome screen
  function buildEmojiPicker(containerId, emojis, praise) {
    const picker = document.getElementById(containerId);
    if (!picker) return;
    emojis.forEach(emoji => {
      const btn = document.createElement("button");
      btn.className = "animal-choice";
      btn.textContent = emoji;
      if (save.avatar === emoji) btn.classList.add("selected");
      btn.addEventListener("click", () => {
        resumeAudio();
        clearPickerSelection();   // only one avatar at a time, across all rows
        btn.classList.add("selected");
        setAvatar(emoji);
        speak(praise);
      });
      picker.appendChild(btn);
    });
  }

  buildEmojiPicker("animal-picker", AVATAR_ANIMALS, "Yay! That's your friend!");
  buildEmojiPicker("shape-picker", AVATAR_SHAPES, "Yay! That's your shape!");

  photoInput.addEventListener("change", (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      // Downscale to keep storage small & private (stays on device)
      const img = new Image();
      img.onload = () => {
        const size = 400;
        const c = document.createElement("canvas");
        c.width = c.height = size;
        const cx = c.getContext("2d");
        const scale = Math.max(size / img.width, size / img.height);
        const w = img.width * scale, h = img.height * scale;
        cx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
        const dataUrl = c.toDataURL("image/jpeg", 0.85);
        setAvatar(dataUrl);
        // Clear any selected animal or shape, since a photo now wins
        clearPickerSelection();
        speak("What a great photo! You look amazing!");
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });

  /* ---------- Screen navigation ---------- */
  function show(screenId) {
    document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
    document.getElementById(screenId).classList.add("active");
  }

  document.getElementById("start-button").addEventListener("click", () => {
    resumeAudio();
    goHome();
  });

  document.getElementById("back-button").addEventListener("click", () => {
    window.speechSynthesis && window.speechSynthesis.cancel();
    goHome();
  });

  /* ===========================================================
     WORLD MAP — a journey across three regions that fills the screen.
     Bottom = grassy Meadow, middle = Jungle, top = City.
     Each stop sits at a point (x%, y%); it unlocks once the kid has
     earned `needStars` total stars. The path winds upward as a journey.
     =========================================================== */
  const MAP_STOPS = [
    // --- Meadow (bottom) ---
    { topic: "counting", region: "meadow", emoji: "🔢", name: "Counting Meadow", x: 16, y: 92, needStars: 0 },
    { topic: "colors",   region: "meadow", emoji: "🎨", name: "Color Garden",    x: 38, y: 80, needStars: 3 },
    { topic: "shapes",   region: "meadow", emoji: "🔷", name: "Shape Hills",     x: 20, y: 68, needStars: 8 },
    // --- Jungle (middle) ---
    { topic: "animals",  region: "jungle", emoji: "🐾", name: "Jungle Trail",    x: 46, y: 58, needStars: 15 },
    { topic: "numbers",  region: "jungle", emoji: "5️⃣", name: "Number Vines",    x: 72, y: 50, needStars: 24 },
    { topic: "counting", region: "jungle", emoji: "🦜", name: "Parrot Peak",     x: 50, y: 40, needStars: 34 },
    { topic: "colors",   region: "jungle", emoji: "🌺", name: "Flower Falls",    x: 24, y: 34, needStars: 45 },
    // --- City (top) ---
    { topic: "shapes",   region: "city",   emoji: "🏙️", name: "Shape City",      x: 50, y: 24, needStars: 58 },
    { topic: "numbers",  region: "city",   emoji: "🚦", name: "Number Street",   x: 76, y: 16, needStars: 72 },
    { topic: "animals",  region: "city",   emoji: "🏛️", name: "City Zoo",        x: 50, y: 7,  needStars: 88 }
  ];

  function isUnlocked(stop) { return save.stars >= stop.needStars; }

  // The avatar rides to the furthest stop the kid has unlocked.
  function furthestUnlocked() {
    let s = MAP_STOPS[0];
    for (const stop of MAP_STOPS) if (isUnlocked(stop)) s = stop;
    return s;
  }

  function refreshHome() {
    document.getElementById("total-stars").textContent = save.stars;
  }

  function placeMapAvatar(stop, animate) {
    const av = document.getElementById("map-avatar");
    if (!av) return;
    if (!animate) av.style.transition = "none";
    av.style.left = stop.x + "%";
    av.style.top = stop.y + "%";
    if (!animate) {
      // force reflow then restore transition for future moves
      void av.offsetWidth;
      av.style.transition = "";
    }
  }

  // Draw the winding trail so it threads through every stop in order.
  function drawTrail() {
    const path = document.getElementById("map-trail");
    if (!path) return;
    let d = "M " + MAP_STOPS[0].x + " " + MAP_STOPS[0].y;
    for (let i = 1; i < MAP_STOPS.length; i++) {
      const prev = MAP_STOPS[i - 1];
      const cur = MAP_STOPS[i];
      // A smooth curve: control point sits between the two stops, nudged sideways.
      const midY = (prev.y + cur.y) / 2;
      const bend = (i % 2 === 0) ? -12 : 12;
      const cx = (prev.x + cur.x) / 2 + bend;
      d += " Q " + cx + " " + midY + " " + cur.x + " " + cur.y;
    }
    path.setAttribute("d", d);
  }

  // Paint simple scenery per region so the map feels like a real world.
  function buildScenery() {
    const el = document.getElementById("map-scenery");
    if (!el) return;
    // Decorative emoji scattered across the three bands. Each: emoji, x%, y%, size(vmin).
    const SCENERY = [
      // City band (top, y ~0-30)
      ["☁️", 12, 6, 7], ["☁️", 85, 10, 8], ["🏢", 14, 20, 9], ["🏬", 88, 22, 9],
      ["🏢", 30, 12, 7], ["🏙️", 66, 26, 8],
      // Jungle band (middle, y ~30-62)
      ["🌴", 10, 44, 10], ["🌴", 90, 40, 10], ["🌿", 34, 62, 7], ["🌳", 86, 60, 9],
      ["🍃", 60, 34, 6], ["🐒", 14, 56, 6], ["🦜", 82, 50, 6],
      // Meadow band (bottom, y ~62-100)
      ["🌳", 70, 72, 10], ["🌲", 8, 80, 9], ["🌼", 56, 92, 6], ["🌷", 30, 96, 6],
      ["🍄", 84, 90, 6], ["🦋", 62, 66, 5]
    ];
    el.innerHTML = SCENERY.map(function (s) {
      return '<span class="scenery" style="left:' + s[1] + '%;top:' + s[2] +
             '%;font-size:' + s[3] + 'vmin">' + s[0] + '</span>';
    }).join('');
  }

  function renderMap() {
    const stopsEl = document.getElementById("map-stops");
    if (!stopsEl) return;
    buildScenery();
    drawTrail();
    stopsEl.innerHTML = "";

    MAP_STOPS.forEach(stop => {
      const unlocked = isUnlocked(stop);
      const btn = document.createElement("button");
      btn.className = "map-stop " + (unlocked ? "unlocked" : "locked");
      btn.style.left = stop.x + "%";
      btn.style.top = stop.y + "%";

      const bubble = '<span class="stop-bubble">' + stop.emoji + "</span>";
      const name = '<span class="stop-name">' + stop.name + "</span>";
      let extra;
      if (unlocked) {
        extra = '<span class="stop-level">Level ' + save.levels[stop.topic] + "</span>";
      } else {
        const need = stop.needStars - save.stars;
        extra = '<span class="stop-lock">🔒</span>' +
                '<span class="stop-unlock-hint">⭐ ' + need + " more</span>";
      }
      btn.innerHTML = bubble + name + extra;

      btn.addEventListener("click", () => {
        resumeAudio();
        if (unlocked) {
          placeMapAvatar(stop, true);
          // let the avatar walk over, then open the game
          setTimeout(() => startTopic(stop.topic), 850);
        } else {
          const need = stop.needStars - save.stars;
          speak("This place is locked. Earn " + need + " more stars to visit "
                + stop.name + "!");
        }
      });

      stopsEl.appendChild(btn);
    });
  }

  function goHome() {
    refreshHome();
    renderMap();
    show("screen-home");
    placeMapAvatar(furthestUnlocked(), false);
    speak("Where do you want to go?");
  }

  /* ===========================================================
     GAME CONTENT
     =========================================================== */

  const COLORS = [
    { name: "red", hex: "#ff4d4d" },
    { name: "blue", hex: "#4d79ff" },
    { name: "green", hex: "#5bd75b" },
    { name: "yellow", hex: "#ffe14d" },
    { name: "purple", hex: "#b24dff" },
    { name: "orange", hex: "#ff9f40" },
    { name: "pink", hex: "#ff7fbf" },
    { name: "brown", hex: "#a9744f" }
  ];

  const SHAPES = [
    { name: "circle", emoji: "⚫" },
    { name: "square", emoji: "🟥" },
    { name: "triangle", emoji: "🔺" },
    { name: "star", emoji: "⭐" },
    { name: "heart", emoji: "❤️" },
    { name: "diamond", emoji: "🔷" }
  ];

  const ANIMALS = [
    { name: "dog", emoji: "🐶", sound: "woof woof" },
    { name: "cat", emoji: "🐱", sound: "meow" },
    { name: "cow", emoji: "🐮", sound: "moo" },
    { name: "duck", emoji: "🦆", sound: "quack quack" },
    { name: "frog", emoji: "🐸", sound: "ribbit" },
    { name: "lion", emoji: "🦁", sound: "roar" },
    { name: "pig", emoji: "🐷", sound: "oink" },
    { name: "sheep", emoji: "🐑", sound: "baa" },
    { name: "horse", emoji: "🐴", sound: "neigh" },
    { name: "bee", emoji: "🐝", sound: "buzz buzz" }
  ];

  const COUNT_EMOJIS = ["🍎", "🎈", "⭐", "🐟", "🌸", "🍌", "🚗", "🦋"];

  /* ---------- Game state ---------- */
  const QUESTIONS_PER_ROUND = 5;
  const STREAK_TO_LEVEL = 5; // correct answers in a round to level up
  let current = null; // { topic, qIndex, correctCount, question }

  const promptBtn = document.getElementById("prompt-button");
  const promptText = document.getElementById("prompt-text");
  const choicesEl = document.getElementById("choices");
  const dotsEl = document.getElementById("progress-dots");

  promptBtn.addEventListener("click", () => {
    if (current && current.question) speak(current.question.say);
  });

  function startTopic(topic) {
    // Record which stops were locked at the start, so we can tell if the
    // kid unlocks a new place during this round.
    const lockedBefore = MAP_STOPS.filter(s => !isUnlocked(s)).map(s => s.topic);
    current = { topic, qIndex: 0, correctCount: 0, question: null, lockedBefore };
    show("screen-game");
    buildDots();
    nextQuestion();
  }

  function buildDots() {
    dotsEl.innerHTML = "";
    for (let i = 0; i < QUESTIONS_PER_ROUND; i++) {
      const d = document.createElement("div");
      d.className = "dot";
      dotsEl.appendChild(d);
    }
  }
  function markDot(i) {
    const dots = dotsEl.querySelectorAll(".dot");
    if (dots[i]) dots[i].classList.add("done");
  }

  function pickDistinct(arr, n, mustInclude) {
    const pool = arr.slice();
    const out = [];
    if (mustInclude !== undefined) {
      out.push(mustInclude);
      const idx = pool.findIndex(x => x === mustInclude);
      if (idx >= 0) pool.splice(idx, 1);
    }
    while (out.length < n && pool.length) {
      const i = Math.floor(Math.random() * pool.length);
      out.push(pool.splice(i, 1)[0]);
    }
    return shuffle(out);
  }
  function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

  /* ---------- Question generators ---------- */
  function makeQuestion(topic) {
    const level = save.levels[topic];
    switch (topic) {
      case "counting": return makeCounting(level);
      case "colors":   return makeColors(level);
      case "shapes":   return makeShapes(level);
      case "numbers":  return makeNumbers(level);
      case "animals":  return makeAnimals(level);
    }
  }

  function makeCounting(level) {
    const max = Math.min(3 + level * 2, 10); // grows with level
    const answer = randInt(1, max);
    const emoji = COUNT_EMOJIS[Math.floor(Math.random() * COUNT_EMOJIS.length)];
    const display = emoji.repeat(answer);
    // choices are numbers
    const options = pickDistinct(
      Array.from({ length: max }, (_, i) => i + 1), 3, answer
    );
    return {
      say: "How many do you see? Count them!",
      prompt: display,
      promptIsBig: true,
      choices: options.map(n => ({ label: String(n), value: n, cls: "text" })),
      answer,
      cols: 3
    };
  }

  function makeColors(level) {
    const count = level >= 3 ? 4 : 3;
    const set = pickDistinct(COLORS, count);
    const target = set[Math.floor(Math.random() * set.length)];
    return {
      say: "Which one is " + target.name + "?",
      prompt: "Find " + target.name.toUpperCase(),
      choices: set.map(c => ({
        swatch: c.hex, value: c.name, cls: "swatch"
      })),
      answer: target.name,
      cols: count === 4 ? 4 : 3
    };
  }

  function makeShapes(level) {
    const count = level >= 3 ? 4 : 3;
    const set = pickDistinct(SHAPES, count);
    const target = set[Math.floor(Math.random() * set.length)];
    return {
      say: "Can you find the " + target.name + "?",
      prompt: "Find the " + target.name.toUpperCase(),
      choices: set.map(s => ({ label: s.emoji, value: s.name, cls: "" })),
      answer: target.name,
      cols: count === 4 ? 4 : 3
    };
  }

  function makeNumbers(level) {
    const max = Math.min(5 + level * 2, 20);
    const answer = randInt(1, max);
    const options = pickDistinct(
      Array.from({ length: max }, (_, i) => i + 1), 3, answer
    );
    return {
      say: "Find the number " + answer + "!",
      prompt: "Find " + answer,
      choices: options.map(n => ({ label: String(n), value: n, cls: "text" })),
      answer,
      cols: 3
    };
  }

  function makeAnimals(level) {
    const count = level >= 3 ? 4 : 3;
    const set = pickDistinct(ANIMALS, count);
    const target = set[Math.floor(Math.random() * set.length)];
    // At higher levels, ask by sound instead of name
    const bySound = level >= 2 && Math.random() < 0.5;
    return {
      say: bySound
        ? "Who says " + target.sound + "?"
        : "Where is the " + target.name + "?",
      prompt: bySound ? "Who says \"" + target.sound + "\"?" : "Find the " + target.name.toUpperCase(),
      choices: set.map(a => ({ label: a.emoji, value: a.name, cls: "" })),
      answer: target.name,
      cols: count === 4 ? 4 : 3
    };
  }

  /* ---------- Render a question ---------- */
  function nextQuestion() {
    if (current.qIndex >= QUESTIONS_PER_ROUND) {
      finishRound();
      return;
    }
    const q = makeQuestion(current.topic);
    current.question = q;

    promptText.textContent = q.prompt;
    promptText.style.fontSize = q.promptIsBig ? "" : "";
    if (q.promptIsBig) {
      promptText.style.letterSpacing = "0.5rem";
      promptText.style.fontSize = "clamp(2.2rem, 10vmin, 5rem)";
    } else {
      promptText.style.letterSpacing = "";
      promptText.style.fontSize = "";
    }

    choicesEl.className = "choices cols-" + q.cols;
    choicesEl.innerHTML = "";

    q.choices.forEach(choice => {
      const btn = document.createElement("button");
      btn.className = "choice " + (choice.cls || "");
      if (choice.swatch) {
        const fill = document.createElement("div");
        fill.className = "swatch-fill";
        fill.style.background = choice.swatch;
        btn.appendChild(fill);
      } else {
        btn.textContent = choice.label;
      }
      btn.addEventListener("click", () => handleAnswer(btn, choice.value, q));
      choicesEl.appendChild(btn);
    });

    speak(q.say);
  }

  let locked = false;
  function handleAnswer(btn, value, q) {
    if (locked) return;
    const isCorrect = value === q.answer;

    if (isCorrect) {
      locked = true;
      btn.classList.add("correct");
      playChime();
      save.stars += 1;
      current.correctCount += 1;
      markDot(current.qIndex);
      refreshHome();
      persist();
      speak(randomPraise());
      // small firework at the button
      const r = btn.getBoundingClientRect();
      burst(r.left + r.width / 2, r.top + r.height / 2);
      runFx();
      setTimeout(() => {
        locked = false;
        current.qIndex += 1;
        nextQuestion();
      }, 1400);
    } else {
      btn.classList.add("wrong");
      playBoop();
      speak("Try again! You can do it!");
      setTimeout(() => btn.classList.remove("wrong"), 500);
    }
  }

  function randomPraise() {
    const p = ["Yay!", "Great job!", "You got it!", "Awesome!", "Super!", "Wonderful!", "Well done!"];
    return p[Math.floor(Math.random() * p.length)];
  }

  /* ---------- End of round ---------- */
  function finishRound() {
    const topic = current.topic;
    const leveledUp = current.correctCount >= STREAK_TO_LEVEL;
    if (leveledUp && save.levels[topic] < 5) {
      save.levels[topic] += 1;
    }
    persist();
    refreshHome();

    // Did the stars earned this round open a brand-new place on the map?
    const lockedBefore = current.lockedBefore || [];
    const newlyUnlocked = MAP_STOPS.find(
      s => lockedBefore.indexOf(s.topic) !== -1 && isUnlocked(s)
    );

    showCelebration(leveledUp, newlyUnlocked);
  }

  /* ---------- Celebration banner + big fireworks ---------- */
  function showCelebration(leveledUp, newlyUnlocked) {
    let banner = document.getElementById("celebrate-banner");
    if (!banner) {
      banner = document.createElement("div");
      banner.id = "celebrate-banner";
      document.body.appendChild(banner);
    }
    const isPhoto = typeof save.avatar === "string" && save.avatar.indexOf("data:") === 0;
    const avatarBg = isPhoto ? `background-image:url('${save.avatar}')` : "";
    const avatarInner = isPhoto
      ? ""
      : '<span class="avatar-placeholder">' + (save.avatar || "🙂") + '</span>';

    // Unlocking a new place is the most exciting thing, so it wins the banner.
    let msg, line2 = "", voice;
    if (newlyUnlocked) {
      msg = "NEW PLACE! " + String.fromCodePoint(0x1F5FA);
      line2 = ['<div class="cheer-sub">', newlyUnlocked.emoji, ' ', newlyUnlocked.name, ' is open!</div>'].join('');
      voice = "Wow! You unlocked a new place! You can visit " + newlyUnlocked.name + " now!";
    } else if (leveledUp) {
      msg = "LEVEL UP! 🎉";
      voice = "Wow! You leveled up! You are so smart!";
    } else {
      msg = "You did it! 🎉";
      voice = "Hooray! You finished! Great work!";
    }

    banner.innerHTML =
      '<div class="avatar-circle cheer-avatar" style="' + avatarBg + '">' + avatarInner + '</div>' +
      '<div class="cheer">' + msg + '</div>' +
      line2 +
      '<button class="big-button go-button" id="celebrate-continue">▶️ Keep Playing</button>';

    banner.classList.add("show");
    fireworksShow(newlyUnlocked ? 8 : (leveledUp ? 6 : 3));
    speak(voice);

    document.getElementById("celebrate-continue").addEventListener("click", () => {
      banner.classList.remove("show");
      window.speechSynthesis && window.speechSynthesis.cancel();
      goHome();
    });
  }

  /* ===========================================================
     GROWN-UPS AREA — child-locked reset / start over
     =========================================================== */
  (function setupGrownups() {
    const openBtn   = document.getElementById("grownups-button");
    const modal     = document.getElementById("grownups-modal");
    const closeBtn  = document.getElementById("grownups-close");
    const gate      = document.getElementById("grownups-gate");
    const panel     = document.getElementById("grownups-panel");
    const gateQ     = document.getElementById("gate-question");
    const gateInput = document.getElementById("gate-answer");
    const gateSubmit= document.getElementById("gate-submit");
    const gateError = document.getElementById("gate-error");
    const panelStars= document.getElementById("panel-stars");
    const resetBtn  = document.getElementById("reset-button");
    const resetConfirm = document.getElementById("reset-confirm");
    const resetYes  = document.getElementById("reset-yes");
    const resetNo   = document.getElementById("reset-no");

    if (!openBtn || !modal) return;

    let gateAnswer = 0;

    function newGateQuestion() {
      // A small two-number sum a grown-up can do, a toddler can't.
      const a = 2 + Math.floor(Math.random() * 7); // 2..8
      const b = 2 + Math.floor(Math.random() * 7); // 2..8
      gateAnswer = a + b;
      gateQ.textContent = a + " + " + b + " = ?";
    }

    function openModal() {
      // Stop any narration and reset the modal to its locked state.
      window.speechSynthesis && window.speechSynthesis.cancel();
      gate.hidden = false;
      panel.hidden = true;
      resetConfirm.hidden = true;
      gateError.hidden = true;
      gateInput.value = "";
      newGateQuestion();
      modal.classList.add("show");
      modal.setAttribute("aria-hidden", "false");
      setTimeout(() => gateInput.focus(), 50);
    }

    function closeModal() {
      modal.classList.remove("show");
      modal.setAttribute("aria-hidden", "true");
    }

    function checkGate() {
      if (parseInt(gateInput.value, 10) === gateAnswer) {
        gateError.hidden = true;
        gate.hidden = true;
        panel.hidden = false;
        panelStars.textContent = save.stars;
      } else {
        gateError.hidden = false;
        gateInput.value = "";
        newGateQuestion();
      }
    }

    function doReset() {
      // Wipe saved progress in place (save is a const) and clear storage.
      const fresh = defaultSave();
      Object.keys(fresh).forEach(k => { save[k] = fresh[k]; });
      try { localStorage.removeItem(SAVE_KEY); } catch (e) {}
      persist();
      // Reset the avatar shown everywhere back to the default face.
      applyAvatar(null);
      document.querySelectorAll(".animal-choice.selected")
        .forEach(b => b.classList.remove("selected"));
      refreshHome();
      closeModal();
      // Send the child back to the very start.
      show("screen-welcome");
      speak("Let's make a new character!");
    }

    openBtn.addEventListener("click", openModal);
    closeBtn.addEventListener("click", closeModal);
    modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });
    gateSubmit.addEventListener("click", checkGate);
    gateInput.addEventListener("keydown", (e) => { if (e.key === "Enter") checkGate(); });

    resetBtn.addEventListener("click", () => { resetConfirm.hidden = false; });
    resetNo.addEventListener("click", () => { resetConfirm.hidden = true; });
    resetYes.addEventListener("click", doReset);
  })();

  /* ---------- Boot ---------- */
  if (save.avatar) applyAvatar(save.avatar);
  refreshHome();
  // Welcome screen is active by default via HTML.
})();
