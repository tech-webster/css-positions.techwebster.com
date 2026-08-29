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

const LEVELS = [
  {
    name: "Draft 01 — Nudge",
    brief:
      "The hero sits in normal flow. Your first job: shift it onto the mark. <code>position: relative</code> offsets a box from where it would be — without disturbing the flow.",
    target: "left:55%; top:55%;",
    heroBase: "",
    deco: "",
    start: "/* Land the hero on the mark.\n   Try position: relative; then left & top */\n",
    hint: "position: relative;\nleft: ~55%; top: ~55%;  ← watch the live preview, tune it in",
  },
  {
    name: "Draft 02 — Backwards",
    brief:
      "The hero starts far from the mark — and you'll need to move it <em>up and left</em>. Offsets can be negative: <code>top: -80px</code> pulls a box upward.",
    target: "left:6%; top:8%;",
    heroBase: "#hero{margin-left:48%;margin-top:210px;}",
    deco: "",
    start: "/* Negative values are allowed.\n   position: relative; left: -...; top: -...; */\n",
    hint: "position: relative;\nleft: -42%; top: -200px;  (tune it)",
  },
  {
    name: "Draft 03 — Break free",
    brief:
      "Relative offsets leave a hole behind. <code>position: absolute</code> removes the hero from the flow and anchors it to the nearest <em>positioned</em> ancestor — this drafting board. Grab the mark from the top-right corner.",
    target: "right:6%; top:8%;",
    heroBase: "",
    deco: '<div class="crate flow-crate">SUPPLY</div>',
    start: "/* position: absolute; anchors to the board.\n   Pick your edges: top / right / bottom / left */\n",
    hint: "position: absolute;\ntop: 8%; right: 6%;",
  },
  {
    name: "Draft 04 — Dead centre",
    brief:
      "Classic interview question: centre a box in its parent. With <code>position: absolute</code>, set every edge (<code>inset: 0</code>) and let <code>margin: auto</code> split the leftover space.",
    target: "inset:0; margin:auto;",
    heroBase: "",
    deco: "",
    start: "/* position: absolute;\n   inset: 0; margin: auto;   → dead centre\n   (or 50% + translate, your call) */\n",
    hint: "position: absolute;\ninset: 0; margin: auto;",
  },
  {
    name: "Draft 05 — South-west anchor",
    brief:
      "You don't have to measure from the top-left. <code>right</code> and <code>bottom</code> anchor from the other edges — often cleaner. Reach the mark near the bottom-left corner.",
    target: "left:8%; bottom:10%;",
    heroBase: "",
    deco: '<div class="crate" style="left:44%;top:38%;width:120px;height:120px;z-index:5;">CRATE</div>',
    start: "/* position: absolute; then bottom: ... left: ... */\n",
    hint: "position: absolute;\nleft: 8%; bottom: 10%;",
  },
  {
    name: "Draft 06 — Above the crate",
    brief:
      "A crate sits over the mark. <code>z-index</code> controls stacking order — but only on <em>positioned</em> elements. The crate is z-index 5. Get on the mark <em>and</em> paint above it.",
    target: "left:42%; top:42%;",
    heroBase: "",
    deco: '<div class="crate" style="left:calc(42% - 34px);top:calc(42% - 34px);width:120px;height:120px;z-index:5;">CRATE · Z 5</div>',
    start: "/* position + coordinates + z-index above 5 */\n",
    hint: "position: absolute;\nleft: 42%; top: 42%;\nz-index: 6;",
    zAbove: 5,
  },
  {
    name: "Draft 07 — Hide the courier",
    brief:
      "Now the opposite: slip the hero <em>behind</em> the crate so the guard can't see it. It starts at z-index 9 — drop it below 5 while overlapping the crate.",
    target: "left:calc(28% + 34px); top:calc(28% + 34px);",
    heroBase: "#hero{position:relative;z-index:9;margin-left:18%;margin-top:120px;}",
    deco: '<div class="crate" style="left:28%;top:28%;width:120px;height:120px;z-index:5;">CRATE · Z 5</div>',
    start: "/* You start at z-index 9 (positioned).\n   Go behind the crate. */\n",
    hint: "z-index: 4;\nleft: ~14%; top: ~-80px;  (position: relative; — you already have it)",
    zBelow: 5,
  },
  {
    name: "Draft 08 — Off the board",
    brief:
      "The mark has left the board — it's pinned to your <em>viewport</em>, bottom-right. That's <code>position: fixed</code>: anchored to the screen, ignoring all scrolling. Chase it out of the drafting board.",
    target: "position:fixed; right:24px; bottom:24px;",
    heroBase: "",
    deco: "",
    start: "/* position: fixed; anchors to the viewport,\n   not the board. Escape! */\n",
    hint: "position: fixed;\nright: 24px; bottom: 24px;",
  },
  {
    name: "Draft 09 — Halfway out",
    brief:
      "The mark straddles the top edge of the board — half of it is outside. Negative offsets and <code>calc()</code> are your tools. A box may absolutely sit outside its containing block.",
    target: "left:calc(50% - 26px); top:-26px;",
    heroBase: "",
    deco: '<div class="crate" style="left:16%;bottom:12%;width:90px;height:90px;">CRATE</div><div class="crate" style="right:14%;bottom:18%;width:90px;height:90px;">CRATE</div>',
    start: "/* position: absolute; top: -...; left: calc(50% - ...) */\n",
    hint: "position: absolute;\ntop: -26px; left: calc(50% - 26px);",
  },
  {
    name: "Draft 10 — The beacon",
    brief:
      "Final draft. The mark is the beacon at the exact centre of your <em>screen</em> — fixed positioning again, this time centred with <code>inset: 0; margin: auto</code>. Match it. Get certified.",
    target: "position:fixed; inset:0; margin:auto;",
    heroBase: "",
    deco: '<div class="crate" style="left:12%;top:16%;width:110px;height:110px;">CRATE</div><div class="crate" style="right:10%;top:24%;width:110px;height:110px;">CRATE</div><div class="crate" style="left:24%;bottom:14%;width:110px;height:110px;">CRATE</div>',
    start: "/* The last one. position: fixed; inset: 0; margin: auto;\n   — or 50% + transform: translate(-50%, -50%) */\n",
    hint: "position: fixed;\ninset: 0; margin: auto;",
  },
];

const DONE_KEY = "pq-done";
const done = new Set(JSON.parse(localStorage.getItem(DONE_KEY) || "[]"));
let current = 0;
let locked = false;

/* ---------- progress ---------- */
const unlockedMax = () => {
  let max = 0;
  done.forEach((i) => (max = Math.max(max, Number(i) + 1)));
  return Math.min(max, LEVELS.length - 1);
};

function saveProgress() {
  localStorage.setItem(DONE_KEY, JSON.stringify([...done]));
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
  $("#sheet-no").textContent = String(i + 1).padStart(2, "0") + " / " + LEVELS.length;
  levelStyle.textContent = lv.heroBase;
  target.style.cssText = lv.target;
  deco.innerHTML = lv.deco;
  editor.value = lv.start;
  applyCSS();
  check();
  winPanel.hidden = true;
  hintEl.hidden = true;
  renderChips();
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

  const overlap = rectsOverlap(h, t);
  const hc = { x: h.left + h.width / 2, y: h.top + h.height / 2 };
  const tc = { x: t.left + t.width / 2, y: t.top + t.height / 2 };
  const dist = Math.round(Math.hypot(hc.x - tc.x, hc.y - tc.y));
  updateMeter(dist);

  if (locked || overlap < 0.6) return;
  if (lv.zAbove !== undefined && zOf(hero) <= lv.zAbove) return;
  if (lv.zBelow !== undefined && zOf(hero) >= lv.zBelow) return;

  // approved!
  locked = true;
  done.add(current);
  saveProgress();
  renderChips();
  $("#win-sub").textContent =
    current === LEVELS.length - 1
      ? "All 10 drafts cleared — you're a certified positioner."
      : ["The foreman is pleased.", "Clean lines. Next sheet.", "That's how a pro anchors.", "Nailed the coordinates."][current % 4];
  winPanel.hidden = false;
  $("#next-btn").textContent = current === LEVELS.length - 1 ? "Play again ↺" : "Next draft →";
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

/* ---------- confetti ---------- */
function confetti() {
  const c = $("#confetti");
  const colors = ["#ffc94d", "#7fd1ff", "#ff6b6b", "#9ef0c0"];
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
});
$("#cheat-btn").addEventListener("click", () => $("#cheat").showModal());
$("#next-btn").addEventListener("click", () =>
  loadLevel(current === LEVELS.length - 1 ? 0 : current + 1)
);

/* ---------- boot ---------- */
loadLevel(Math.min(unlockedMax(), LEVELS.length - 1));
