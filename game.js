/* Position Quest — game logic */
"use strict";

const $ = (s) => document.querySelector(s);
const board = $("#board");
const hero = $("#hero");
const target = $("#target");
const deco = $("#deco");
const editor = $("#editor");
const userStyle = $("#user-css");
const levelStyle = $("#level-css");
const meter = $("#meter");
const winPanel = $("#win");
const hintEl = $("#hint");
const announcement = $("#announcement");
const progressCount = $("#progress-count");
const progressFill = $("#progress-fill");
const bestScoreEl = $("#best-score");

const LEVELS = [
  {
    name: "Level 01 — Nudge",
    brief:
      "Move YOU to MARK with <code>position: relative</code>, <code>left</code> and <code>top</code>.",
    target: "left:55%; top:55%;",
    heroBase: "",
    deco: "",
    start: "/* Try position: relative; left: ...; top: ...; */\n",
    hint: "position: relative;\nleft: ~55%; top: ~55%;  ← watch the live preview, tune it in",
  },
  {
    name: "Level 02 — Backwards",
    brief:
      "Move up and left. Use <code>position: relative</code> with negative offsets.",
    target: "left:6%; top:8%;",
    heroBase: "#hero{margin-left:48%;margin-top:210px;}",
    deco: "",
    start: "/* Use negative left and top values. */\n",
    hint: "position: relative;\nleft: -42%; top: -200px;  (tune it)",
  },
  {
    name: "Level 03 — Break free",
    brief:
      "Reach the top-right target. Use <code>position: absolute</code>, <code>top</code> and <code>right</code>.",
    target: "right:6%; top:8%;",
    heroBase: "",
    deco: '<div class="crate flow-crate">SUPPLY</div>',
    start: "/* Try position: absolute; top: ...; right: ...; */\n",
    hint: "position: absolute;\ntop: 8%; right: 6%;",
  },
  {
    name: "Level 04 — Dead centre",
    brief:
      "Center YOU in the board with <code>position: absolute</code>, <code>inset</code> and <code>margin</code>.",
    target: "inset:0; margin:auto;",
    heroBase: "",
    deco: "",
    start: "/* Try inset: 0; margin: auto; */\n",
    hint: "position: absolute;\ninset: 0; margin: auto;",
  },
  {
    name: "Level 05 — South-west anchor",
    brief:
      "Reach the bottom-left target using <code>position: absolute</code>, <code>bottom</code> and <code>left</code>.",
    target: "left:8%; bottom:10%;",
    heroBase: "",
    deco: '<div class="crate" style="left:44%;top:38%;width:120px;height:120px;z-index:5;">CRATE</div>',
    start: "/* Try bottom: ...; left: ...; */\n",
    hint: "position: absolute;\nleft: 8%; bottom: 10%;",
  },
  {
    name: "Level 06 — Above the crate",
    brief:
      "Cover MARK above the crate. Position YOU and set <code>z-index</code> higher than 5.",
    target: "left:42%; top:42%;",
    heroBase: "",
    deco: '<div class="crate" style="left:calc(42% - 34px);top:calc(42% - 34px);width:120px;height:120px;z-index:5;">CRATE · Z 5</div>',
    start: "/* Position YOU, then set z-index above 5. */\n",
    hint: "position: absolute;\nleft: 42%; top: 42%;\nz-index: 6;",
    zAbove: 5,
  },
  {
    name: "Level 07 — Hide the courier",
    brief:
      "Move YOU behind the crate onto MARK. Set <code>z-index</code> below 5.",
    target: "left:calc(28% + 34px); top:calc(28% + 34px);",
    heroBase: "#hero{position:relative;z-index:9;margin-left:18%;margin-top:120px;}",
    deco: '<div class="crate" style="left:28%;top:28%;width:120px;height:120px;z-index:5;">CRATE · Z 5</div>',
    start: "/* Set z-index below 5, then move to MARK. */\n",
    hint: "z-index: 4;\nleft: ~14%; top: ~-80px;  (position: relative; — you already have it)",
    zBelow: 5,
  },
  {
    name: "Level 08 — Off the board",
    brief:
      "Reach the screen’s bottom-right target with <code>position: fixed</code>.",
    target: "position:fixed; right:24px; bottom:24px;",
    heroBase: "",
    deco: "",
    start: "/* Try position: fixed; right: ...; bottom: ...; */\n",
    hint: "position: fixed;\nright: 24px; bottom: 24px;",
  },
  {
    name: "Level 09 — Halfway out",
    brief:
      "Center YOU across the board’s top edge. Use <code>position: absolute</code>, a negative <code>top</code> and <code>calc()</code>.",
    target: "left:calc(50% - 26px); top:-26px;",
    heroBase: "",
    deco: '<div class="crate" style="left:16%;bottom:12%;width:90px;height:90px;">CRATE</div><div class="crate" style="right:14%;bottom:18%;width:90px;height:90px;">CRATE</div>',
    start: "/* Try a negative top and left: calc(...); */\n",
    hint: "position: absolute;\ntop: -26px; left: calc(50% - 26px);",
  },
  {
    name: "Level 10 — The beacon",
    brief:
      "Center YOU on the screen with <code>position: fixed</code>, <code>inset</code> and <code>margin</code>.",
    target: "position:fixed; inset:0; margin:auto;",
    heroBase: "",
    deco: '<div class="crate" style="left:12%;top:16%;width:110px;height:110px;">CRATE</div><div class="crate" style="right:10%;top:24%;width:110px;height:110px;">CRATE</div><div class="crate" style="left:24%;bottom:14%;width:110px;height:110px;">CRATE</div>',
    start: "/* Try position: fixed; inset: 0; margin: auto; */\n",
    hint: "position: fixed;\ninset: 0; margin: auto;",
  },
];

const DONE_KEY = "pq-done";
const MUTE_KEY = "pq-mute";
const BEST_KEY = "pq-best-edits";
function readJSON(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "null");
    return value === null ? fallback : value;
  } catch {
    return fallback;
  }
}
const storedDone = readJSON(DONE_KEY, []);
const done = new Set(Array.isArray(storedDone) ? storedDone.map(Number).filter(Number.isInteger) : []);
const storedBest = readJSON(BEST_KEY, {});
const bestEdits = storedBest && typeof storedBest === "object" && !Array.isArray(storedBest) ? storedBest : {};
let current = 0;
let locked = false;
let edits = 0;

/* ---------- progress ---------- */
const unlockedMax = () => {
  let max = 0;
  done.forEach((i) => (max = Math.max(max, Number(i) + 1)));
  return Math.min(max, LEVELS.length - 1);
};

function saveProgress() {
  try { localStorage.setItem(DONE_KEY, JSON.stringify([...done])); } catch { /* private mode */ }
}

function renderProgress() {
  const cleared = done.size;
  const percent = Math.round((cleared / LEVELS.length) * 100);
  progressCount.textContent = cleared + " / " + LEVELS.length + " cleared";
  progressFill.style.width = percent + "%";
  const scores = Object.values(bestEdits).filter(Number.isFinite);
  bestScoreEl.textContent = scores.length ? "Best edits " + Math.min(...scores) : "Best run —";
}

function renderChips() {
  $("#chips").innerHTML = "";
  LEVELS.forEach((lv, i) => {
    const b = document.createElement("button");
    b.className = "chip";
    b.textContent = i + 1;
    b.setAttribute("role", "tab");
    const unlocked = i <= unlockedMax();
    b.disabled = !unlocked;
    b.title = unlocked ? lv.name : "Locked — clear earlier drafts first";
    if (i === current) b.classList.add("current");
    if (done.has(i)) b.classList.add("done");
    b.addEventListener("click", () => loadLevel(i));
    $("#chips").appendChild(b);
  });
}

/* ---------- level loading ---------- */
function loadLevel(i) {
  current = i;
  locked = false;
  const lv = LEVELS[i];
  $("#lv-name").textContent = lv.name;
  $("#lv-brief").innerHTML = lv.brief;
  levelStyle.textContent = lv.heroBase;
  target.style.cssText = lv.target;
  deco.innerHTML = lv.deco;
  editor.value = lv.start;
  applyCSS();
  check();
  target.classList.remove("near");
  edits = 0;
  winPanel.hidden = true;
  hintEl.hidden = true;
  renderChips();
  renderProgress();
  editor.focus();
}

/* ---------- applying user CSS ---------- */
function applyCSS() {
  // neutralise any accidental </style> breakout
  userStyle.textContent = "#hero{" + editor.value.replace(/<\/style/gi, "") + "}";
}

/* ---------- win check ---------- */
function rectsOverlap(h, t) {
  const w = Math.min(h.right, t.right) - Math.max(h.left, t.left);
  const hgt = Math.min(h.bottom, t.bottom) - Math.max(h.top, t.top);
  if (w <= 0 || hgt <= 0) return 0;
  return (w * hgt) / (t.width * t.height);
}

function zOf(el) {
  const z = getComputedStyle(el).zIndex;
  return z === "auto" ? 0 : parseInt(z, 10);
}

function check() {
  const lv = LEVELS[current];
  const h = hero.getBoundingClientRect();
  const t = target.getBoundingClientRect();
  if (h.width === 0 || h.height === 0) return updateMeter(null);

  const hc = { x: h.left + h.width / 2, y: h.top + h.height / 2 };
  const tc = { x: t.left + t.width / 2, y: t.top + t.height / 2 };
  const dist = Math.round(Math.hypot(hc.x - tc.x, hc.y - tc.y));
  updateMeter(dist);
  target.classList.toggle("near", dist < 25);

  const overlap = rectsOverlap(h, t);
  if (locked || overlap < 0.6) return;

  // anti-cheese: hero must be roughly mark-sized and actually rendered
  if ((h.width * h.height) / (t.width * t.height) > 1.6) return;
  const cs = getComputedStyle(hero);
  if (cs.visibility === "hidden" || parseFloat(cs.opacity) < 0.1) return;

  if (lv.zAbove !== undefined && zOf(hero) <= lv.zAbove) return;
  if (lv.zBelow !== undefined && zOf(hero) >= lv.zBelow) return;

  // approved!
  locked = true;
  target.classList.remove("near");
  done.add(current);
  saveProgress();
  if (!Number.isFinite(bestEdits[current]) || edits < bestEdits[current]) {
    bestEdits[current] = edits;
    try { localStorage.setItem(BEST_KEY, JSON.stringify(bestEdits)); } catch { /* private mode */ }
  }
  renderChips();
  renderProgress();
  announcement.textContent = "Level " + (current + 1) + " approved in " + edits + " " + (edits === 1 ? "edit" : "edits") + ".";
  $("#win-sub").textContent =
    current === LEVELS.length - 1
      ? "All 10 drafts cleared — you're a certified positioner."
      : ["The foreman is pleased.", "Clean lines. Next sheet.", "That's how a pro anchors.", "Nailed the coordinates."][current % 4];
  winPanel.hidden = false;
  $("#win-stats").textContent =
    "Cleared in " + edits + (edits === 1 ? " edit" : " edits") +
    (edits <= 6 ? " — first-draft quality." : edits <= 15 ? " — solid drafting." : " — the foreman has seen smoother.");
  chime();
  confetti();
  $("#next-btn").textContent = current === LEVELS.length - 1 ? "Play again ↺" : "Next level →";
  confetti();
}

function updateMeter(dist) {
  if (dist === null) {
    meter.textContent = "Δ —";
    meter.classList.remove("hot");
    return;
  }
  meter.textContent = "Δ " + dist + "px";
  meter.classList.toggle("hot", dist < 40);
}

/* ---------- sound (WebAudio, no assets) ---------- */
let audioCtx;
const muted = () => localStorage.getItem(MUTE_KEY) === "1";
function tone(freq, start, dur, type = "sine", gain = 0.06) {
  if (muted()) return;
  audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
  const o = audioCtx.createOscillator(), g = audioCtx.createGain();
  o.type = type;
  o.frequency.value = freq;
  g.gain.setValueAtTime(gain, audioCtx.currentTime + start);
  g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + start + dur);
  o.connect(g).connect(audioCtx.destination);
  o.start(audioCtx.currentTime + start);
  o.stop(audioCtx.currentTime + start + dur);
}
const chime = () => { tone(523, 0, 0.18); tone(659, 0.1, 0.18); tone(784, 0.2, 0.3); };

/* ---------- confetti ---------- */
function confetti() {
  const c = $("#confetti");
  const colors = ["#ff7f00", "#fafafa", "#ff9b38", "#a8a8ad"];
  for (let i = 0; i < 42; i++) {
    const s = document.createElement("i");
    s.style.left = Math.random() * 100 + "%";
    s.style.background = colors[i % colors.length];
    s.style.animationDelay = Math.random() * 0.5 + "s";
    s.style.animationDuration = 1 + Math.random() * 0.9 + "s";
    c.appendChild(s);
  }
  setTimeout(() => (c.innerHTML = ""), 2400);
}

/* ---------- events ---------- */
let timer;
editor.addEventListener("input", () => {
  edits++;
  applyCSS();
  clearTimeout(timer);
  timer = setTimeout(check, 220);
});
editor.addEventListener("keydown", (e) => {
  if (e.key === "Tab") {
    e.preventDefault();
    const { selectionStart: a, selectionEnd: b } = editor;
    editor.value = editor.value.slice(0, a) + "  " + editor.value.slice(b);
    editor.selectionStart = editor.selectionEnd = a + 2;
    editor.dispatchEvent(new Event("input"));
  }
});

$("#reset-btn").addEventListener("click", () => {
  editor.value = LEVELS[current].start;
  applyCSS();
  check();
  editor.focus();
});
$("#hint-btn").addEventListener("click", () => {
  hintEl.textContent = LEVELS[current].hint;
  hintEl.hidden = !hintEl.hidden;
  if (!hintEl.hidden) announcement.textContent = "Hint shown.";
});
$("#cheat-btn").addEventListener("click", () => $("#cheat").showModal());
$("#mute-btn").addEventListener("click", (e) => {
  const next = muted() ? "0" : "1";
  localStorage.setItem(MUTE_KEY, next);
  e.currentTarget.textContent = next === "1" ? "🔇 Sound off" : "🔊 Sound on";
});
$("#next-btn").addEventListener("click", () =>
  loadLevel(current === LEVELS.length - 1 ? 0 : current + 1)
);
$("#clear-progress-btn").addEventListener("click", () => {
  if (!confirm("Clear all completed drafts and best scores?")) return;
  done.clear();
  Object.keys(bestEdits).forEach((key) => delete bestEdits[key]);
  try {
    localStorage.removeItem(DONE_KEY);
    localStorage.removeItem(BEST_KEY);
  } catch { /* private mode */ }
  loadLevel(0);
  announcement.textContent = "Progress cleared. Starting again from Draft 01.";
});

/* ---------- boot ---------- */
$("#mute-btn").textContent = muted() ? "🔇 Sound off" : "🔊 Sound on";
loadLevel(Math.min(unlockedMax(), LEVELS.length - 1));
renderProgress();

$("#help-btn").addEventListener("click", () => $("#help").showModal());
