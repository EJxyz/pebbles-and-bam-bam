/* ===========================================================
   Mia Bella's Star Friends — a picture + audio learning game for ages 1–3
   Plain JavaScript, no build step. Everything stays on-device.
   =========================================================== */

(function () {
  "use strict";

  /* ---------- Saved progress (localStorage) ---------- */
  const SAVE_KEY = "starFriendsSave_v1";
  const save = loadSave();

  function loadSave() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) {
        // Merge onto defaults so saves from older versions gain new fields.
        return Object.assign(defaultSave(), JSON.parse(raw));
      }
    } catch (e) { /* ignore */ }
    return defaultSave();
  }
  function defaultSave() {
    return {
      avatar: null, // dataURL of the kid's photo, or an emoji, or null
      stars: 0,
      levels: { counting: 1, colors: 1, shapes: 1, numbers: 1, animals: 1 },
      streak: { counting: 0, colors: 0, shapes: 0, numbers: 0, animals: 0 },
      lang: "en",          // "en" or "es"
      voiceGender: "female", // "female" or "male"
      skyMode: "auto"       // "auto" | "day" | "night"
    };
  }
  function persist() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); } catch (e) {}
  }

  /* ===========================================================
     LANGUAGE (i18n) — English + Spanish for spoken and on-screen text.
     t(key, params) returns the string in the saved language.
     =========================================================== */
  const STRINGS = {
    en: {
      makeCharacter: "Let's make your character!",
      addPhoto: "📷 Add My Photo",
      photoPrivate: "🔒 Photo stays private on this device",
      removePhoto: "🗑️ Remove Photo",
      photoRemoved: "Photo removed!",
      myVoiceClips: "My Voice Clips",
      voiceClipsHint: "Record short clips in your own voice. They play at happy moments and stay private on this device.",
      clipCorrect: "Correct answer",
      clipDone: "Finished a round",
      clipLevelUp: "Leveled up",
      clipNewPlace: "New place",
      clipAdd: "Add",
      clipChange: "Change",
      clipClear: "Clear",
      orAnimal: "or pick an animal friend",
      orShape: "or pick a shape",
      letsPlay: "▶️ Let's Play!",
      whereGo: "Where do you want to go?",
      levelWord: "Level",
      moreWord: "more",
      greatPhoto: "What a great photo! You look amazing!",
      pickedFriend: "Yay! That's your friend!",
      pickedShape: "Yay! That's your shape!",
      placeLocked: "This place is locked. Earn {n} more stars!",
      gateLocked: "The gate to {name} is locked. Earn {n} more stars!",
      offWeGo: "Off we go to {name}!",
      tryAgain: "Try again! You can do it!",
      newCharacter: "Let's make a new character!",
      keepPlaying: "▶️ Keep Playing",
      levelUp: "LEVEL UP! 🎉",
      youDidIt: "You did it! 🎉",
      newLand: "NEW LAND!",
      newPlace: "NEW PLACE!",
      isOpen: "{name} is open!",
      sayLevelUp: "Wow! You leveled up! You are so smart!",
      sayDone: "Hooray! You finished! Great work!",
      sayNewLand: "Amazing! A whole new land is open! You can explore {name} now!",
      sayNewPlace: "Wow! You unlocked a new place! You can visit {name} now!",
      praise: ["Yay!", "Great job!", "You got it!", "Awesome!", "Super!", "Wonderful!", "Well done!"],
      // questions
      qCount: "How many do you see? Count them!",
      qColor: "Which one is {name}?",
      qShape: "Can you find the {name}?",
      qNumber: "Find the number {n}!",
      qAnimalName: "Where is the {name}?",
      qAnimalSound: "Who says {sound}?",
      promptFind: "Find {NAME}",
      promptFindThe: "Find the {NAME}",
      promptHowMany: "", // the count prompt is just the pictures
      promptWhoSays: "Who says \"{sound}\"?",
      // grown-ups / settings
      forGrownups: "For Grown-Ups",
      gatePrompt: "To continue, answer this:",
      gateWrong: "Not quite — try again.",
      ok: "OK",
      settings: "Grown-Up Settings",
      starsLabel: "Stars:",
      language: "Language",
      voice: "Voice",
      english: "English",
      spanish: "Español",
      female: "Female",
      male: "Male",
      startOver: "🔄 Start Over",
      resetHint: "This clears all stars, levels, and the chosen character so your child can start fresh.",
      confirmReset: "Start completely over?",
      yesReset: "Yes, start over",
      noReset: "No, keep playing"
    },
    es: {
      makeCharacter: "¡Vamos a crear tu personaje!",
      addPhoto: "📷 Agregar mi foto",
      photoPrivate: "🔒 La foto queda privada en este dispositivo",
      removePhoto: "🗑️ Quitar la foto",
      photoRemoved: "¡Foto eliminada!",
      myVoiceClips: "Mis grabaciones de voz",
      voiceClipsHint: "Graba clips cortos con tu propia voz. Se reproducen en momentos felices y quedan privados en este dispositivo.",
      clipCorrect: "Respuesta correcta",
      clipDone: "Terminó una ronda",
      clipLevelUp: "Subió de nivel",
      clipNewPlace: "Nuevo lugar",
      clipAdd: "Agregar",
      clipChange: "Cambiar",
      clipClear: "Quitar",
      orAnimal: "o elige un amigo animal",
      orShape: "o elige una figura",
      letsPlay: "▶️ ¡A jugar!",
      whereGo: "¿A dónde quieres ir?",
      levelWord: "Nivel",
      moreWord: "más",
      greatPhoto: "¡Qué linda foto! ¡Te ves genial!",
      pickedFriend: "¡Bien! ¡Ese es tu amigo!",
      pickedShape: "¡Bien! ¡Esa es tu figura!",
      placeLocked: "Este lugar está cerrado. ¡Gana {n} estrellas más!",
      gateLocked: "La puerta a {name} está cerrada. ¡Gana {n} estrellas más!",
      offWeGo: "¡Vamos a {name}!",
      tryAgain: "¡Inténtalo otra vez! ¡Tú puedes!",
      newCharacter: "¡Vamos a crear un nuevo personaje!",
      keepPlaying: "▶️ Seguir jugando",
      levelUp: "¡SUBISTE DE NIVEL! 🎉",
      youDidIt: "¡Lo lograste! 🎉",
      newLand: "¡NUEVA TIERRA!",
      newPlace: "¡NUEVO LUGAR!",
      isOpen: "¡{name} está abierto!",
      sayLevelUp: "¡Guau! ¡Subiste de nivel! ¡Eres muy inteligente!",
      sayDone: "¡Hurra! ¡Terminaste! ¡Buen trabajo!",
      sayNewLand: "¡Increíble! ¡Hay una nueva tierra! ¡Ahora puedes explorar {name}!",
      sayNewPlace: "¡Guau! ¡Abriste un nuevo lugar! ¡Ahora puedes visitar {name}!",
      praise: ["¡Sí!", "¡Muy bien!", "¡Lo lograste!", "¡Genial!", "¡Súper!", "¡Maravilloso!", "¡Bien hecho!"],
      qCount: "¿Cuántos ves? ¡Cuéntalos!",
      qColor: "¿Cuál es {name}?",
      qShape: "¿Puedes encontrar el {name}?",
      qNumber: "¡Encuentra el número {n}!",
      qAnimalName: "¿Dónde está el {name}?",
      qAnimalSound: "¿Quién dice {sound}?",
      promptFind: "Encuentra {NAME}",
      promptFindThe: "Encuentra el {NAME}",
      promptHowMany: "",
      promptWhoSays: "¿Quién dice \"{sound}\"?",
      forGrownups: "Para adultos",
      gatePrompt: "Para continuar, responde esto:",
      gateWrong: "Casi — inténtalo otra vez.",
      ok: "OK",
      settings: "Ajustes para adultos",
      starsLabel: "Estrellas:",
      language: "Idioma",
      voice: "Voz",
      english: "English",
      spanish: "Español",
      female: "Femenina",
      male: "Masculina",
      startOver: "🔄 Empezar de nuevo",
      resetHint: "Esto borra todas las estrellas, los niveles y el personaje para que tu hijo empiece de nuevo.",
      confirmReset: "¿Empezar completamente de nuevo?",
      yesReset: "Sí, empezar de nuevo",
      noReset: "No, seguir jugando"
    }
  };

  function t(key, params) {
    const lang = save.lang || "en";
    let s = (STRINGS[lang] && STRINGS[lang][key]);
    if (s === undefined) s = STRINGS.en[key];
    if (s === undefined) return key;
    if (params && typeof s === "string") {
      Object.keys(params).forEach(k => {
        s = s.replace(new RegExp("\\{" + k + "\\}", "g"), params[k]);
      });
    }
    return s;
  }

  // Fill every element carrying a data-i18n key with the current language text.
  function applyStaticText() {
    document.querySelectorAll("[data-i18n]").forEach(el => {
      const key = el.getAttribute("data-i18n");
      el.textContent = t(key);
    });
    document.documentElement.lang = (save.lang === "es") ? "es" : "en";
  }

  // Reflect the current language in every selector (flags + dropdown).
  function syncLangControls() {
    document.querySelectorAll("#lang-flags .lang-flag").forEach(b => {
      b.classList.toggle("selected", b.getAttribute("data-lang") === save.lang);
    });
    const sel = document.getElementById("lang-select");
    if (sel) sel.value = save.lang || "en";
  }

  // Switch language: persist, update all static text, and re-render the map.
  function applyLanguage(lang) {
    save.lang = (lang === "es") ? "es" : "en";
    persist();
    applyStaticText();
    syncLangControls();
    // Re-render the map so region titles / stop names update immediately.
    if (document.getElementById("screen-home").classList.contains("active")) {
      renderRegion(currentRegionIndex, false);
    }
  }

  /* ---------- Audio: speech + sound effects ---------- */
  const audioCtx = (window.AudioContext || window.webkitAudioContext)
    ? new (window.AudioContext || window.webkitAudioContext)()
    : null;

  /* ---------- Voice selection (language + gender, least robotic) ---------- */
  let availableVoices = [];
  function refreshVoices() {
    if (!("speechSynthesis" in window)) return;
    availableVoices = window.speechSynthesis.getVoices() || [];
  }
  if ("speechSynthesis" in window) {
    refreshVoices();
    // Many browsers load voices asynchronously.
    window.speechSynthesis.onvoiceschanged = refreshVoices;
  }

  // Hints to guess a voice's gender from its name (best effort across devices).
  const FEMALE_HINTS = ["female", "woman", "mujer", "samantha", "victoria", "karen",
    "tessa", "fiona", "moira", "paulina", "monica", "mónica", "google español",
    "google us english", "google uk english female", "zira", "susan", "linda", "sara",
    "helena", "laura", "catherine", "serena", "allison", "ava", "nicky", "joana"];
  const MALE_HINTS = ["male", "man", "hombre", "daniel", "alex", "fred", "diego",
    "jorge", "carlos", "juan", "google uk english male", "david", "mark", "george",
    "oliver", "arthur", "rishi", "aaron", "tom", "pablo"];

  function voiceGenderGuess(v) {
    const n = (v.name || "").toLowerCase();
    if (FEMALE_HINTS.some(h => n.indexOf(h) !== -1)) return "female";
    if (MALE_HINTS.some(h => n.indexOf(h) !== -1)) return "male";
    return "unknown";
  }

  // Prefer natural/neural voices over the flat default robotic one.
  function voiceQuality(v) {
    const n = (v.name || "").toLowerCase();
    let q = 0;
    if (n.indexOf("google") !== -1) q += 3;      // Google voices sound natural
    if (n.indexOf("natural") !== -1) q += 4;
    if (n.indexOf("microsoft") !== -1) q += 2;
    if (n.indexOf("premium") !== -1 || n.indexOf("enhanced") !== -1) q += 3;
    if (v.localService === false) q += 1;        // cloud voices are usually nicer
    return q;
  }

  function pickVoice(lang, gender) {
    if (!availableVoices.length) refreshVoices();
    const prefix = lang === "es" ? "es" : "en";
    // Only voices for the chosen language.
    let pool = availableVoices.filter(v =>
      (v.lang || "").toLowerCase().indexOf(prefix) === 0);
    if (!pool.length) pool = availableVoices.slice(); // fallback: any voice

    // Rank: matching gender first, then natural quality.
    const scored = pool.map(v => {
      const g = voiceGenderGuess(v);
      let score = voiceQuality(v);
      if (g === gender) score += 10;          // strongly prefer requested gender
      else if (g === "unknown") score += 2;   // neutral is okay
      return { v, score };
    }).sort((a, b) => b.score - a.score);

    return scored.length ? scored[0].v : null;
  }

  function speak(text) {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    const lang = save.lang || "en";
    u.lang = lang === "es" ? "es-ES" : "en-US";
    const v = pickVoice(lang, save.voiceGender || "female");
    if (v) u.voice = v;
    // Warmer, less robotic settings: near-natural rate, gentle lift in pitch.
    u.rate = 0.95;
    u.pitch = (save.voiceGender === "male") ? 1.0 : 1.15;
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

  /* ===========================================================
     PRIVATE VOICE CLIPS (device-only)
     A parent can record short clips (praise / celebration) in a family
     member's voice. Stored only in this browser's localStorage, never
     uploaded. If a clip exists for a moment, it plays INSTEAD of TTS.
     =========================================================== */
  // The moments we support, in play-priority order per situation.
  const CLIP_SLOTS = [
    { id: "correct",  labelKey: "clipCorrect"  },
    { id: "done",     labelKey: "clipDone"     },
    { id: "levelup",  labelKey: "clipLevelUp"  },
    { id: "newplace", labelKey: "clipNewPlace" }
  ];
  const CLIPS_KEY = "starFriendsClips_v1";

  // Clips live in their own storage key so they don't bloat the main save.
  let voiceClips = loadClips();
  function loadClips() {
    try {
      const raw = localStorage.getItem(CLIPS_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) { /* ignore */ }
    return {}; // { correct: dataURL, done: dataURL, ... }
  }
  function persistClips() {
    try { localStorage.setItem(CLIPS_KEY, JSON.stringify(voiceClips)); return true; }
    catch (e) { return false; } // storage full, etc.
  }
  function hasClip(id) { return typeof voiceClips[id] === "string" && voiceClips[id].length > 0; }

  // Play a recorded clip. Returns true if one existed and started playing.
  function playClip(id) {
    if (!hasClip(id)) return false;
    try {
      const a = new Audio(voiceClips[id]);
      a.volume = 1;
      a.play().catch(() => {});
      return true;
    } catch (e) { return false; }
  }

  // Speak a moment: prefer the recorded clip; fall back to TTS text.
  // `fallbackText` is the sentence to speak if no clip is set.
  function speakMoment(clipId, fallbackText) {
    if (playClip(clipId)) {
      // A clip played; cancel any pending TTS so they don't overlap.
      window.speechSynthesis && window.speechSynthesis.cancel();
      return;
    }
    if (fallbackText) speak(fallbackText);
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
    updateRemovePhotoButton();
  }

  // Show "Remove Photo" only when an uploaded photo is the current avatar.
  function updateRemovePhotoButton() {
    const btn = document.getElementById("remove-photo");
    if (!btn) return;
    const isPhoto = typeof save.avatar === "string" && save.avatar.indexOf("data:") === 0;
    btn.hidden = !isPhoto;
  }

  // Clear the "selected" highlight on every picker (animals, shapes)
  function clearPickerSelection() {
    document.querySelectorAll(".animal-choice.selected")
      .forEach(b => b.classList.remove("selected"));
  }

  // Build a picker row of emoji choices on the welcome screen.
  // praiseKey is an i18n key resolved at click time (so it respects language).
  function buildEmojiPicker(containerId, emojis, praiseKey) {
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
        speak(t(praiseKey));
      });
      picker.appendChild(btn);
    });
  }

  buildEmojiPicker("animal-picker", AVATAR_ANIMALS, "pickedFriend");
  buildEmojiPicker("shape-picker", AVATAR_SHAPES, "pickedShape");

  // Remove just the uploaded photo (keep all stars and levels).
  (function setupRemovePhoto() {
    const btn = document.getElementById("remove-photo");
    if (!btn) return;
    btn.addEventListener("click", () => {
      resumeAudio();
      setAvatar(null);                 // back to default face, progress untouched
      clearPickerSelection();
      if (photoInput) photoInput.value = ""; // allow re-picking the same file
      speak(t("photoRemoved"));
    });
  })();

  /* ---------- Day / night sky on the welcome screen ---------- */
  // Resolve whether it should look like night: honor a saved override,
  // otherwise decide from the device clock (night roughly 7pm–6am).
  function isNightNow() {
    const mode = save.skyMode || "auto";
    if (mode === "day") return false;
    if (mode === "night") return true;
    const h = new Date().getHours();
    return (h >= 19 || h < 6);
  }

  function applySky() {
    const welcome = document.getElementById("screen-welcome");
    const toggle = document.getElementById("daynight-toggle");
    if (!welcome) return;
    const night = isNightNow();
    welcome.classList.toggle("night", night);
    if (toggle) toggle.textContent = night ? "🌙" : "☀️";
  }

  (function setupDayNight() {
    const toggle = document.getElementById("daynight-toggle");
    if (!toggle) return;
    toggle.addEventListener("click", () => {
      resumeAudio();
      // Tap flips to the opposite of what's shown now, and remembers it.
      save.skyMode = isNightNow() ? "day" : "night";
      persist();
      applySky();
    });
  })();

  // Quick language flags on the welcome screen.
  (function setupLangFlags() {
    const flags = document.querySelectorAll("#lang-flags .lang-flag");
    flags.forEach(btn => {
      btn.addEventListener("click", () => {
        resumeAudio();
        applyLanguage(btn.getAttribute("data-lang"));
        speak(t("whereGo")); // short sample in the newly chosen language
      });
    });
  })();

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
        speak(t("greatPhoto"));
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
     ILLUSTRATED SVG BACKGROUND SCENES
     Hand-drawn, layered vector art for each region. These fill the map
     and scale crisply to any screen. preserveAspectRatio="none" lets them
     stretch edge-to-edge behind the stops.
     =========================================================== */
  const SCENE_MEADOW = [
    '<svg class="scene-svg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" aria-hidden="true">',
      '<defs>',
        '<linearGradient id="mSky" x1="0" y1="0" x2="0" y2="1">',
          '<stop offset="0" stop-color="#aee4ff"/><stop offset="1" stop-color="#e8f8ff"/>',
        '</linearGradient>',
        '<linearGradient id="mGround" x1="0" y1="0" x2="0" y2="1">',
          '<stop offset="0" stop-color="#8fd66a"/><stop offset="1" stop-color="#5fb245"/>',
        '</linearGradient>',
      '</defs>',
      '<rect width="100" height="100" fill="url(#mSky)"/>',
      // sun
      '<circle cx="82" cy="18" r="9" fill="#fff3a6"/>',
      '<circle cx="82" cy="18" r="6.5" fill="#ffe14d"/>',
      // clouds
      '<g fill="#ffffff" opacity="0.9">',
        '<ellipse cx="22" cy="16" rx="9" ry="4.5"/><ellipse cx="30" cy="15" rx="7" ry="4"/>',
        '<ellipse cx="55" cy="24" rx="7" ry="3.5"/><ellipse cx="61" cy="23" rx="5" ry="3"/>',
      '</g>',
      // rolling hills
      '<path d="M0 62 Q25 48 50 60 T100 56 V100 H0 Z" fill="#a7e07f"/>',
      '<path d="M0 74 Q30 60 60 72 T100 70 V100 H0 Z" fill="url(#mGround)"/>',
      // flowers
      '<g>',
        '<g transform="translate(12,88)"><circle r="1.6" fill="#ff6b9d"/><circle r="0.7" fill="#fff"/></g>',
        '<g transform="translate(40,92)"><circle r="1.6" fill="#ffd93d"/><circle r="0.7" fill="#fff"/></g>',
        '<g transform="translate(68,90)"><circle r="1.6" fill="#b24dff"/><circle r="0.7" fill="#fff"/></g>',
        '<g transform="translate(88,94)"><circle r="1.6" fill="#ff6b9d"/><circle r="0.7" fill="#fff"/></g>',
      '</g>',
      // a friendly tree
      '<g transform="translate(8,58)"><rect x="-1.2" y="8" width="2.4" height="10" fill="#8a5a3c"/>',
        '<circle cx="0" cy="4" r="7" fill="#4fae4f"/><circle cx="-4" cy="7" r="5" fill="#5fc25f"/>',
        '<circle cx="4" cy="7" r="5" fill="#5fc25f"/></g>',
    '</svg>'
  ].join('');

  const SCENE_JUNGLE = [
    '<svg class="scene-svg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" aria-hidden="true">',
      '<defs>',
        '<linearGradient id="jSky" x1="0" y1="0" x2="0" y2="1">',
          '<stop offset="0" stop-color="#bff0d0"/><stop offset="1" stop-color="#e9fff0"/>',
        '</linearGradient>',
        '<linearGradient id="jGround" x1="0" y1="0" x2="0" y2="1">',
          '<stop offset="0" stop-color="#3f9d54"/><stop offset="1" stop-color="#2b7d3e"/>',
        '</linearGradient>',
      '</defs>',
      '<rect width="100" height="100" fill="url(#jSky)"/>',
      // layered canopy hills
      '<path d="M0 30 Q25 18 50 30 T100 28 V100 H0 Z" fill="#8fd6a0"/>',
      '<path d="M0 50 Q30 38 60 50 T100 48 V100 H0 Z" fill="#5fb878"/>',
      '<path d="M0 72 Q25 62 55 72 T100 70 V100 H0 Z" fill="url(#jGround)"/>',
      // big palm trees on the sides
      '<g transform="translate(10,40)">',
        '<rect x="-1.4" y="0" width="2.8" height="40" rx="1" fill="#8a5a3c"/>',
        '<g fill="#2e8b4f">',
          '<path d="M0 0 Q-14 -6 -18 4 Q-8 -2 0 2 Z"/>',
          '<path d="M0 0 Q14 -6 18 4 Q8 -2 0 2 Z"/>',
          '<path d="M0 0 Q-10 -14 -2 -18 Q-2 -8 2 0 Z"/>',
          '<path d="M0 0 Q10 -14 2 -18 Q2 -8 -2 0 Z"/>',
        '</g>',
      '</g>',
      '<g transform="translate(90,44)">',
        '<rect x="-1.4" y="0" width="2.8" height="36" rx="1" fill="#8a5a3c"/>',
        '<g fill="#2e8b4f">',
          '<path d="M0 0 Q-14 -6 -18 4 Q-8 -2 0 2 Z"/>',
          '<path d="M0 0 Q14 -6 18 4 Q8 -2 0 2 Z"/>',
          '<path d="M0 0 Q-10 -14 -2 -18 Q-2 -8 2 0 Z"/>',
          '<path d="M0 0 Q10 -14 2 -18 Q2 -8 -2 0 Z"/>',
        '</g>',
      '</g>',
      // hanging vines + a flower
      '<g stroke="#2e8b4f" stroke-width="0.8" fill="none" opacity="0.8">',
        '<path d="M35 0 q3 10 -1 18"/><path d="M62 0 q-3 12 1 20"/>',
      '</g>',
      '<g transform="translate(62,22)"><circle r="2" fill="#ff5fa2"/><circle r="0.9" fill="#ffe14d"/></g>',
    '</svg>'
  ].join('');

  const SCENE_CITY = [
    '<svg class="scene-svg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" aria-hidden="true">',
      '<defs>',
        '<linearGradient id="cSky" x1="0" y1="0" x2="0" y2="1">',
          '<stop offset="0" stop-color="#9ec9ff"/><stop offset="1" stop-color="#e6f1ff"/>',
        '</linearGradient>',
      '</defs>',
      '<rect width="100" height="100" fill="url(#cSky)"/>',
      // sun + clouds
      '<circle cx="16" cy="16" r="7" fill="#ffe673"/>',
      '<g fill="#ffffff" opacity="0.9"><ellipse cx="70" cy="14" rx="9" ry="4"/><ellipse cx="78" cy="13" rx="6" ry="3.2"/></g>',
      // skyline: colorful buildings with windows
      '<g>',
        '<rect x="4"  y="52" width="14" height="48" fill="#ff8aa6"/>',
        '<rect x="20" y="40" width="12" height="60" fill="#7cc6ff"/>',
        '<rect x="34" y="58" width="14" height="42" fill="#ffd56b"/>',
        '<rect x="50" y="34" width="13" height="66" fill="#a98bff"/>',
        '<rect x="65" y="50" width="14" height="50" fill="#6bd6a0"/>',
        '<rect x="81" y="44" width="15" height="56" fill="#ff9f6b"/>',
      '</g>',
      // windows (rows of little squares)
      '<g fill="#ffffff" opacity="0.85">',
        '<rect x="7"  y="56" width="2.5" height="2.5"/><rect x="12" y="56" width="2.5" height="2.5"/>',
        '<rect x="7"  y="62" width="2.5" height="2.5"/><rect x="12" y="62" width="2.5" height="2.5"/>',
        '<rect x="23" y="44" width="2.5" height="2.5"/><rect x="28" y="44" width="2.5" height="2.5"/>',
        '<rect x="23" y="50" width="2.5" height="2.5"/><rect x="28" y="50" width="2.5" height="2.5"/>',
        '<rect x="53" y="38" width="2.5" height="2.5"/><rect x="58" y="38" width="2.5" height="2.5"/>',
        '<rect x="53" y="44" width="2.5" height="2.5"/><rect x="58" y="44" width="2.5" height="2.5"/>',
        '<rect x="84" y="48" width="2.5" height="2.5"/><rect x="90" y="48" width="2.5" height="2.5"/>',
      '</g>',
      // street
      '<rect x="0" y="92" width="100" height="8" fill="#6b7280"/>',
      '<g stroke="#ffe14d" stroke-width="1" stroke-dasharray="4 3"><line x1="0" y1="96" x2="100" y2="96"/></g>',
    '</svg>'
  ].join('');

  /* ===========================================================
     WORLD MAP — three gated regions you walk between.
     Meadow -> Jungle -> City. Each is its own full screen with an
     illustrated SVG scene, its own stops, and gates to travel.
     =========================================================== */
  // Three regions, each a full screen with its own illustrated SVG scene,
  // its own stops, and a gate to walk to the next region. Stop x/y are
  // percentages within that region's screen.
  const REGIONS = [
    {
      id: "meadow",
      title: "Sunny Meadow", titleEs: "Pradera Soleada",
      gateStars: 0,            // stars needed to ENTER this region
      stops: [
        { topic: "counting", emoji: "🔢", name: "Counting Meadow", nameEs: "Pradera de Contar", x: 22, y: 78, needStars: 0 },
        { topic: "colors",   emoji: "🎨", name: "Color Garden",    nameEs: "Jardín de Colores",  x: 52, y: 60, needStars: 3 },
        { topic: "shapes",   emoji: "🔷", name: "Shape Hills",     nameEs: "Colinas de Figuras", x: 78, y: 44, needStars: 8 }
      ]
    },
    {
      id: "jungle",
      title: "Wild Jungle", titleEs: "Selva Salvaje",
      gateStars: 14,
      stops: [
        { topic: "animals",  emoji: "🐾", name: "Jungle Trail",  nameEs: "Sendero de la Selva", x: 24, y: 76, needStars: 14 },
        { topic: "numbers",  emoji: "5️⃣", name: "Number Vines",  nameEs: "Lianas de Números",   x: 50, y: 58, needStars: 22 },
        { topic: "counting", emoji: "🦜", name: "Parrot Peak",   nameEs: "Pico del Loro",       x: 76, y: 42, needStars: 32 },
        { topic: "colors",   emoji: "🌺", name: "Flower Falls",  nameEs: "Cascada de Flores",   x: 50, y: 26, needStars: 42 }
      ]
    },
    {
      id: "city",
      title: "Busy City", titleEs: "Ciudad Activa",
      gateStars: 54,
      stops: [
        { topic: "shapes",  emoji: "🟦", name: "Shape City",    nameEs: "Ciudad de Figuras", x: 24, y: 74, needStars: 54 },
        { topic: "numbers", emoji: "🚦", name: "Number Street", nameEs: "Calle de Números",  x: 52, y: 56, needStars: 66 },
        { topic: "animals", emoji: "🦁", name: "City Zoo",      nameEs: "Zoológico Urbano",  x: 78, y: 38, needStars: 80 }
      ]
    }
  ];

  // Region title / stop name in the current language.
  function regionTitle(r) { return (save.lang === "es" && r.titleEs) ? r.titleEs : r.title; }
  function stopName(s) { return (save.lang === "es" && s.nameEs) ? s.nameEs : s.name; }

  let currentRegionIndex = 0; // which region screen the kid is viewing

  function isUnlocked(stop) { return save.stars >= stop.needStars; }
  function regionUnlocked(region) { return save.stars >= region.gateStars; }

  // Every stop across all regions, with its region attached (for celebrations).
  function allStops() {
    const out = [];
    REGIONS.forEach(r => r.stops.forEach(s => out.push(
      Object.assign({ regionId: r.id, regionTitle: r.title }, s)
    )));
    return out;
  }

  // The region containing the furthest stop the kid has unlocked.
  function furthestRegionIndex() {
    let idx = 0;
    REGIONS.forEach((r, i) => { if (regionUnlocked(r)) idx = i; });
    return idx;
  }

  function refreshHome() {
    document.getElementById("total-stars").textContent = save.stars;
  }

  function placeMapAvatar(x, y, animate) {
    const av = document.getElementById("map-avatar");
    if (!av) return;
    if (!animate) av.style.transition = "none";
    av.style.left = x + "%";
    av.style.top = y + "%";
    if (!animate) {
      void av.offsetWidth; // force reflow, then restore transition
      av.style.transition = "";
    }
  }

  /* ---------- Illustrated SVG background scenes ---------- */
  // Each returns an <svg> that fills the map, drawn with layered shapes.
  function sceneSVG(regionId) {
    if (regionId === "meadow") return SCENE_MEADOW;
    if (regionId === "jungle") return SCENE_JUNGLE;
    if (regionId === "city")   return SCENE_CITY;
    return "";
  }

  // Draw a gentle trail that threads this region's stops in order.
  function drawTrail(stops) {
    const path = document.getElementById("map-trail");
    if (!path || !stops.length) return;
    let d = "M " + stops[0].x + " " + stops[0].y;
    for (let i = 1; i < stops.length; i++) {
      const prev = stops[i - 1], cur = stops[i];
      const midY = (prev.y + cur.y) / 2;
      const bend = (i % 2 === 0) ? -10 : 10;
      const cx = (prev.x + cur.x) / 2 + bend;
      d += " Q " + cx + " " + midY + " " + cur.x + " " + cur.y;
    }
    path.setAttribute("d", d);
  }

  function renderRegion(index, animateAvatar) {
    currentRegionIndex = Math.max(0, Math.min(index, REGIONS.length - 1));
    const region = REGIONS[currentRegionIndex];

    // Title + backdrop
    const titleEl = document.getElementById("region-title");
    if (titleEl) titleEl.textContent = regionTitle(region);
    const sceneEl = document.getElementById("map-scene");
    if (sceneEl) sceneEl.innerHTML = sceneSVG(region.id);

    // Trail
    drawTrail(region.stops);

    // Stops
    const stopsEl = document.getElementById("map-stops");
    stopsEl.innerHTML = "";
    region.stops.forEach(stop => {
      const unlocked = isUnlocked(stop);
      const btn = document.createElement("button");
      btn.className = "map-stop " + (unlocked ? "unlocked" : "locked");
      btn.style.left = stop.x + "%";
      btn.style.top = stop.y + "%";

      const bubble = '<span class="stop-bubble">' + stop.emoji + "</span>";
      const name = '<span class="stop-name">' + stopName(stop) + "</span>";
      let extra;
      if (unlocked) {
        extra = '<span class="stop-level">' + t("levelWord") + " " + save.levels[stop.topic] + "</span>";
      } else {
        const need = stop.needStars - save.stars;
        extra = '<span class="stop-lock">🔒</span>' +
                '<span class="stop-unlock-hint">⭐ ' + need + " " + t("moreWord") + "</span>";
      }
      btn.innerHTML = bubble + name + extra;

      btn.addEventListener("click", () => {
        resumeAudio();
        if (unlocked) {
          placeMapAvatar(stop.x, stop.y, true);
          setTimeout(() => startTopic(stop.topic), 850);
        } else {
          const need = stop.needStars - save.stars;
          speak(t("placeLocked", { n: need }));
        }
      });

      stopsEl.appendChild(btn);
    });

    // Gates (travel between regions)
    renderGates();

    // Avatar: sit near the first stop of this region.
    const first = region.stops[0];
    placeMapAvatar(first.x, first.y - 14, animateAvatar);
  }

  function renderGates() {
    const gatesEl = document.getElementById("map-gates");
    if (!gatesEl) return;
    gatesEl.innerHTML = "";

    const hasPrev = currentRegionIndex > 0;
    const hasNext = currentRegionIndex < REGIONS.length - 1;

    // Back gate (top-left corner) -> previous region
    if (hasPrev) {
      const prev = REGIONS[currentRegionIndex - 1];
      const back = document.createElement("button");
      back.className = "map-gate gate-back";
      back.innerHTML = '<span class="gate-arch">⟵🚪</span>' +
                       '<span class="gate-label">' + regionTitle(prev) + "</span>";
      back.addEventListener("click", () => {
        resumeAudio();
        travelToRegion(currentRegionIndex - 1);
      });
      gatesEl.appendChild(back);
    }

    // Forward gate (top-right corner) -> next region
    if (hasNext) {
      const next = REGIONS[currentRegionIndex + 1];
      const open = regionUnlocked(next);
      const fwd = document.createElement("button");
      fwd.className = "map-gate gate-next " + (open ? "unlocked" : "locked");
      if (open) {
        fwd.innerHTML = '<span class="gate-arch">🚪⟶</span>' +
                        '<span class="gate-label">' + regionTitle(next) + "</span>";
      } else {
        const need = next.gateStars - save.stars;
        fwd.innerHTML = '<span class="gate-arch">🔒</span>' +
                        '<span class="gate-label">' + regionTitle(next) + "</span>" +
                        '<span class="gate-hint">⭐ ' + need + " " + t("moreWord") + "</span>";
      }
      fwd.addEventListener("click", () => {
        resumeAudio();
        if (open) {
          travelToRegion(currentRegionIndex + 1);
        } else {
          const need = next.gateStars - save.stars;
          speak(t("gateLocked", { name: regionTitle(next), n: need }));
        }
      });
      gatesEl.appendChild(fwd);
    }
  }

  // Walk through a gate to another region with a little travel feel.
  function travelToRegion(index) {
    const region = REGIONS[index];
    speak(t("offWeGo", { name: regionTitle(region) }));
    const map = document.getElementById("map");
    if (map) {
      map.classList.add("map-travel");
      setTimeout(() => {
        renderRegion(index, false);
        map.classList.remove("map-travel");
      }, 350);
    } else {
      renderRegion(index, false);
    }
  }

  function goHome() {
    refreshHome();
    show("screen-home");
    // Land in the region of the furthest place the kid has reached.
    renderRegion(furthestRegionIndex(), false);
    speak(t("whereGo"));
  }

  /* ===========================================================
     GAME CONTENT
     =========================================================== */

  const COLORS = [
    { name: "red",    es: "rojo",     hex: "#ff4d4d" },
    { name: "blue",   es: "azul",     hex: "#4d79ff" },
    { name: "green",  es: "verde",    hex: "#5bd75b" },
    { name: "yellow", es: "amarillo", hex: "#ffe14d" },
    { name: "purple", es: "morado",   hex: "#b24dff" },
    { name: "orange", es: "naranja",  hex: "#ff9f40" },
    { name: "pink",   es: "rosa",     hex: "#ff7fbf" },
    { name: "brown",  es: "café",     hex: "#a9744f" }
  ];

  const SHAPES = [
    { name: "circle",   es: "círculo",   emoji: "⚫" },
    { name: "square",   es: "cuadrado",  emoji: "🟥" },
    { name: "triangle", es: "triángulo", emoji: "🔺" },
    { name: "star",     es: "estrella",  emoji: "⭐" },
    { name: "heart",    es: "corazón",   emoji: "❤️" },
    { name: "diamond",  es: "rombo",     emoji: "🔷" }
  ];

  const ANIMALS = [
    { name: "dog",   es: "perro",   emoji: "🐶", sound: "woof woof", soundEs: "guau guau" },
    { name: "cat",   es: "gato",    emoji: "🐱", sound: "meow",       soundEs: "miau" },
    { name: "cow",   es: "vaca",    emoji: "🐮", sound: "moo",        soundEs: "muu" },
    { name: "duck",  es: "pato",    emoji: "🦆", sound: "quack quack",soundEs: "cuac cuac" },
    { name: "frog",  es: "rana",    emoji: "🐸", sound: "ribbit",     soundEs: "croac" },
    { name: "lion",  es: "león",    emoji: "🦁", sound: "roar",       soundEs: "roar" },
    { name: "pig",   es: "cerdo",   emoji: "🐷", sound: "oink",       soundEs: "oink" },
    { name: "sheep", es: "oveja",   emoji: "🐑", sound: "baa",        soundEs: "beee" },
    { name: "horse", es: "caballo", emoji: "🐴", sound: "neigh",      soundEs: "iiiih" },
    { name: "bee",   es: "abeja",   emoji: "🐝", sound: "buzz buzz",  soundEs: "bzzz" }
  ];

  // Name/sound of a content item in the current language.
  function label(item) { return (save.lang === "es" && item.es) ? item.es : item.name; }
  function animalSound(item) { return (save.lang === "es" && item.soundEs) ? item.soundEs : item.sound; }

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
    // Record which places and region gates were locked at the start, so we can
    // tell if the kid opens something new during this round.
    const stopsBefore = allStops().filter(s => !isUnlocked(s)).map(s => s.name);
    const regionsBefore = REGIONS.filter(r => !regionUnlocked(r)).map(r => r.id);
    current = { topic, qIndex: 0, correctCount: 0, question: null, lastAnswer: null, stopsBefore, regionsBefore };
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
      say: t("qCount"),
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
      say: t("qColor", { name: label(target) }),
      prompt: t("promptFind", { NAME: label(target).toUpperCase() }),
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
      say: t("qShape", { name: label(target) }),
      prompt: t("promptFindThe", { NAME: label(target).toUpperCase() }),
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
      say: t("qNumber", { n: answer }),
      prompt: t("promptFind", { NAME: String(answer) }),
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
    const snd = animalSound(target);
    return {
      say: bySound
        ? t("qAnimalSound", { sound: snd })
        : t("qAnimalName", { name: label(target) }),
      prompt: bySound
        ? t("promptWhoSays", { sound: snd })
        : t("promptFindThe", { NAME: label(target).toUpperCase() }),
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
    // Generate a question, but avoid repeating the previous question's answer
    // so the same item doesn't come up twice in a row. Re-roll a few times;
    // give up gracefully if the pool is tiny (so we never loop forever).
    let q = makeQuestion(current.topic);
    for (let tries = 0; tries < 8 && q.answer === current.lastAnswer; tries++) {
      q = makeQuestion(current.topic);
    }
    current.lastAnswer = q.answer;
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
      speakMoment("correct", randomPraise());
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
      speak(t("tryAgain"));
      setTimeout(() => btn.classList.remove("wrong"), 500);
    }
  }

  function randomPraise() {
    const p = t("praise");
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

    // Did the stars earned this round open a new region gate (most exciting),
    // or a new place within a region?
    const stopsBefore = current.stopsBefore || [];
    const regionsBefore = current.regionsBefore || [];

    const newRegion = REGIONS.find(
      r => regionsBefore.indexOf(r.id) !== -1 && regionUnlocked(r)
    );
    const newStop = allStops().find(
      s => stopsBefore.indexOf(s.name) !== -1 && isUnlocked(s)
    );

    // Prefer announcing a brand-new region; otherwise a new place.
    let unlock = null;
    if (newRegion) {
      unlock = { kind: "region", emoji: "🗺️", name: regionTitle(newRegion) };
    } else if (newStop) {
      unlock = { kind: "stop", emoji: newStop.emoji, name: stopName(newStop) };
    }

    showCelebration(leveledUp, unlock);
  }

  /* ---------- Celebration banner + big fireworks ---------- */
  function showCelebration(leveledUp, unlock) {
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

    // Opening a new region (or place) is the most exciting thing, so it
    // wins the banner over a level-up. clipId picks which recorded clip
    // (if any) plays for this moment; otherwise `voice` TTS is spoken.
    let msg, line2 = "", voice, bursts = 3, clipId;
    if (unlock && unlock.kind === "region") {
      msg = t("newLand") + " " + String.fromCodePoint(0x1F5FA);
      line2 = '<div class="cheer-sub">' + unlock.emoji + " " + t("isOpen", { name: unlock.name }) + "</div>";
      voice = t("sayNewLand", { name: unlock.name });
      bursts = 9;
      clipId = "newplace";
    } else if (unlock && unlock.kind === "stop") {
      msg = t("newPlace") + " " + String.fromCodePoint(0x1F5FA);
      line2 = '<div class="cheer-sub">' + unlock.emoji + " " + t("isOpen", { name: unlock.name }) + "</div>";
      voice = t("sayNewPlace", { name: unlock.name });
      bursts = 7;
      clipId = "newplace";
    } else if (leveledUp) {
      msg = t("levelUp");
      voice = t("sayLevelUp");
      bursts = 6;
      clipId = "levelup";
    } else {
      msg = t("youDidIt");
      voice = t("sayDone");
      bursts = 3;
      clipId = "done";
    }

    banner.innerHTML =
      '<div class="avatar-circle cheer-avatar" style="' + avatarBg + '">' + avatarInner + '</div>' +
      '<div class="cheer">' + msg + '</div>' +
      line2 +
      '<button class="big-button go-button" id="celebrate-continue">' + t("keepPlaying") + '</button>';

    banner.classList.add("show");
    fireworksShow(bursts);
    speakMoment(clipId, voice);

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
    const langSelect = document.getElementById("lang-select");
    const voiceSelect = document.getElementById("voice-select");

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
        // Reflect current settings in the dropdowns.
        if (langSelect) langSelect.value = save.lang || "en";
        if (voiceSelect) voiceSelect.value = save.voiceGender || "female";
        buildVoiceClipRows();
      } else {
        gateError.hidden = false;
        gateInput.value = "";
        newGateQuestion();
      }
    }

    // Speak a short sample so a grown-up can hear the chosen voice/language.
    function previewVoice() {
      speak(t("whereGo"));
    }

    // Build the per-clip rows (label, status, Add/Change, play, Clear).
    function buildVoiceClipRows() {
      const rowsEl = document.getElementById("voiceclip-rows");
      if (!rowsEl) return;
      rowsEl.innerHTML = "";

      CLIP_SLOTS.forEach(slot => {
        const have = hasClip(slot.id);
        const row = document.createElement("div");
        row.className = "voiceclip-row";

        const name = document.createElement("span");
        name.className = "voiceclip-name";
        name.textContent = (have ? "✓ " : "") + t(slot.labelKey);

        // Hidden file input for this slot (audio only).
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "audio/*";
        input.hidden = true;
        input.addEventListener("change", (e) => {
          const file = e.target.files && e.target.files[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = () => {
            voiceClips[slot.id] = reader.result; // data URL, device-only
            if (!persistClips()) {
              // Storage likely full — drop it and tell nothing breaks.
              delete voiceClips[slot.id];
              alert("That clip is too big to save on this device. Try a shorter recording.");
            }
            buildVoiceClipRows();
            playClip(slot.id); // preview it right away
          };
          reader.readAsDataURL(file);
        });

        const addBtn = document.createElement("button");
        addBtn.className = "voiceclip-btn";
        addBtn.textContent = have ? t("clipChange") : t("clipAdd");
        addBtn.addEventListener("click", () => { resumeAudio(); input.click(); });

        const actions = document.createElement("span");
        actions.className = "voiceclip-actions";
        actions.appendChild(addBtn);

        if (have) {
          const playBtn = document.createElement("button");
          playBtn.className = "voiceclip-btn play";
          playBtn.textContent = "▶️";
          playBtn.addEventListener("click", () => { resumeAudio(); playClip(slot.id); });
          const clearBtn = document.createElement("button");
          clearBtn.className = "voiceclip-btn clear";
          clearBtn.textContent = t("clipClear");
          clearBtn.addEventListener("click", () => {
            delete voiceClips[slot.id];
            persistClips();
            buildVoiceClipRows();
          });
          actions.appendChild(playBtn);
          actions.appendChild(clearBtn);
        }

        row.appendChild(name);
        row.appendChild(actions);
        row.appendChild(input);
        rowsEl.appendChild(row);
      });
    }

    function doReset() {
      // Wipe saved progress in place (save is a const) and clear storage.
      const fresh = defaultSave();
      Object.keys(fresh).forEach(k => { save[k] = fresh[k]; });
      try { localStorage.removeItem(SAVE_KEY); } catch (e) {}
      persist();
      // Reset the avatar shown everywhere back to the default face.
      applyAvatar(null);
      updateRemovePhotoButton();
      document.querySelectorAll(".animal-choice.selected")
        .forEach(b => b.classList.remove("selected"));
      refreshHome();
      closeModal();
      // Send the child back to the very start.
      show("screen-welcome");
      speak(t("newCharacter"));
    }

    openBtn.addEventListener("click", openModal);
    closeBtn.addEventListener("click", closeModal);
    modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });
    gateSubmit.addEventListener("click", checkGate);
    gateInput.addEventListener("keydown", (e) => { if (e.key === "Enter") checkGate(); });

    resetBtn.addEventListener("click", () => { resetConfirm.hidden = false; });
    resetNo.addEventListener("click", () => { resetConfirm.hidden = true; });
    resetYes.addEventListener("click", doReset);

    // Language + voice settings.
    if (langSelect) {
      langSelect.addEventListener("change", () => {
        applyLanguage(langSelect.value);
        previewVoice();
      });
    }
    if (voiceSelect) {
      voiceSelect.addEventListener("change", () => {
        save.voiceGender = voiceSelect.value === "male" ? "male" : "female";
        persist();
        previewVoice();
      });
    }
  })();

  /* ---------- Boot ---------- */
  if (save.avatar) applyAvatar(save.avatar);
  updateRemovePhotoButton(); // show Remove Photo if a photo is already set
  applyStaticText();   // render all static UI text in the saved language
  syncLangControls();  // highlight the saved language flag / dropdown
  applySky();          // set day/night sky on the welcome screen
  refreshHome();
  // Welcome screen is active by default via HTML.
})();
