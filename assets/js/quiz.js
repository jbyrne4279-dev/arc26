/* =============================================================================
   Winter Arc 26, Quiz / onboarding funnel engine
   Config-driven: STEPS below is the whole flow. A generic renderer handles each
   step `type`. State persists to localStorage so the paywall/account can be
   pre-filled with the user's plan.

   ►► GO-LIVE CONFIG, edit CONFIG below. ◄◄

   Runs two ways: standalone on start.html, or as an inline full-screen overlay
   on index.html (when a #quizOverlay element is present). Wrapped in an IIFE so
   it can load alongside main.js on the home page without global collisions.
   ========================================================================== */
(function () {
const CONFIG = {
  // App Store link used on the final "download" screen. Keep in sync with main.js.
  APP_STORE_URL: "https://apps.apple.com/app/winter-arc-26/id0000000000",

  // Stripe Payment Links (or any checkout URL). Leave "" to skip real checkout
  // and continue straight to the download screen (good for previewing the flow).
  CHECKOUT_URL_YEARLY: "",
  CHECKOUT_URL_MONTHLY: "",

  // Where the funnel returns if the user exits.
  HOME_URL: "index.html"
};

/* ---------------------------------------------------------------------------
   Content, the entire flow. Edit copy here without touching the renderer.
   ------------------------------------------------------------------------- */
const STEPS = [
  { id: "area", type: "tiles", eyebrow: "Winter Arc 26",
    headline: "Which area needs the most attention?", sub: "Select all that apply.",
    tiles: [
      { name: "Health",  emoji: "❤️", color: "#FF736B" },
      { name: "Money",   emoji: "💸", color: "#59E08C" },
      { name: "Mindset", emoji: "🧘", color: "#F5B01C" },
      { name: "Other",   emoji: "•••", color: "#408CFA" }
    ]},

  { id: "where", type: "single", headline: "How would you honestly describe where you're at?",
    options: ["Things are going well", "Managing, but I can do better", "Stuck and frustrated",
      "Completely drained right now", "Struggling and need a reset"] },

  { id: "reason", type: "single", headline: "What's the main reason you want to level up?",
    options: ["Quit bad habits", "Make more money", "Get in shape", "Fix my mindset", "Take control of my life"] },

  { id: "journey", type: "info", variant: "chart", ctaLabel: "Continue",
    eyebrow: "Your journey", headline: "In 60 days, you'll overcome <span class='accent'>the setback.</span>" },

  { id: "enough", type: "single", headline: "How often do you feel like you did enough?",
    options: ["Often", "Sometimes", "Rarely", "Almost never", "I don't anymore"] },

  { id: "drive", type: "single", headline: "What mainly pushes you to keep going?",
    options: ["Paying the bills", "Not falling behind", "Responsibility to others",
      "Long-term goals I care about", "I'm unsure right now", "None of these"] },

  { id: "quit", type: "multi", headline: "Which of these do you need to quit?", min: 1,
    options: ["Doom scrolling", "Vaping", "Smoking", "Junk food", "Porn", "Alcohol", "Excessive gaming"] },

  { id: "hours", type: "slider", headline: "How many hours a week do you waste on distractions?",
    sub: "e.g. doom scrolling, procrastinating…", min: 0, max: 24, def: 10, unit: "h", ctaLabel: "Next" },

  { id: "teaser1", type: "teaser", eyebrow: "Introducing", poster: "lock",
    line1: "Apps off.", line2: "Zero distractions.", ctaLabel: "Continue" },

  { id: "reward", type: "reward", ctaLabel: "Claim reward" },

  { id: "distraction", type: "single", headline: "Your biggest daily distraction?",
    options: ["My phone", "Social media", "Procrastination", "Video games", "I don't know where to start"] },

  { id: "track", type: "single", headline: "How do you track your goals?",
    options: ["A notebook", "In my head", "I don't"] },

  { id: "commitment_level", type: "single", headline: "How committed are you to changing your life?",
    options: ["I'll do whatever it takes", "I'm ready to start now", "I'll never be who I was"] },

  { id: "notify", type: "notify", headline: "Stay locked in", sub: "Reminders to keep you locked in." },

  { id: "about", type: "inputs", headline: "A little more about you",
    sub: "Pick the @username you'll be known by on the leaderboard.", ctaLabel: "Next",
    fields: [
      { key: "username", label: "Username", type: "username", placeholder: "yourname" },
      { key: "age", label: "Age", type: "number", placeholder: "18" }
    ]},

  { id: "rank", type: "info", variant: "rank", ctaLabel: "Next",
    headline: "Climb the ranks", sub: "Every task earns ELO. Every miss pulls you back." },

  { id: "symptoms", type: "multiGroup", headline: "Symptoms",
    callout: "Procrastination can have serious negative impacts psychologically.",
    sub: "Select all you've been experiencing:",
    groups: [
      { label: "Mental", options: ["Feeling unmotivated", "No ambition to chase goals",
        "Difficulty concentrating", "Brain fog", "General anxiety"] },
      { label: "Physical", options: ["Chronic tiredness", "Poor sleep", "Low energy", "Headaches"] }
    ]},

  { id: "analyzing", type: "analyzing" },

  { id: "results", type: "results", ctaLabel: "Let's go" },

  { id: "teaser2", type: "teaser", eyebrow: "Introducing", poster: "photo",
    line1: "No cheating.", line2: "Photo-verified tasks.", grad: true, ctaLabel: "Continue" },

  { id: "routine", type: "routine", headline: "Build your routine", ctaLabel: "Build my plan" },

  { id: "commit", type: "commit", headline: "Make your commitment",
    sub: "Type it below to lock in your transformation.",
    target: "I commit to myself to lock in starting today" },

  { id: "social", type: "social", ctaLabel: "Start my transformation" },

  { id: "account", type: "account", headline: "Save your progress",
    sub: "So your ELO, streak and rank follow you everywhere." },

  { id: "community", type: "community", headline: "Not reviews. Real posts.", ctaLabel: "Continue" },

  { id: "paywall", type: "paywall", headline: "Choose your plan", sub: "No commitment. Cancel anytime." },

  { id: "verify", type: "verify", headline: "Prove your progress", ctaLabel: "Continue",
    sub: "Every task is verified with a live photo, so your streak is earned, never claimed." },

  { id: "download", type: "download", headline: "You're in. Day 1 starts now." }
];

/* ---------------------------------------------------------------------------
   State
   ------------------------------------------------------------------------- */
const SKEY = "arc26_quiz_v1";
let state = loadState() || { i: 0, answers: {}, plan: null, method: null };

function loadState() { try { return JSON.parse(localStorage.getItem(SKEY)); } catch (e) { return null; } }
function saveState() { try { localStorage.setItem(SKEY, JSON.stringify(state)); } catch (e) {} }
function setAnswer(id, v) { state.answers[id] = v; saveState(); }

/* ---------------------------------------------------------------------------
   DOM refs + tiny helpers
   ------------------------------------------------------------------------- */
const stepEl = document.getElementById("quizStep");
const backBtn = document.getElementById("quizBack");
const ctaBar = document.getElementById("quizCtaBar");
const ctaBtn = document.getElementById("ctaBtn");
const ctaLink = document.getElementById("ctaLink");
const progressFill = document.getElementById("progressFill");
const CHECK = '<svg viewBox="0 0 24 24"><path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z"/></svg>';

// Inline-overlay mode (home page). Absent on the standalone start.html page.
const overlay = document.getElementById("quizOverlay");
const closeBtn = document.getElementById("quizClose");
const EMBEDDED = !!overlay;
let opened = false;
function openQuiz() {
  if (!EMBEDDED) return;
  if (!opened) { opened = true; if (state.i >= STEPS.length) state.i = 0; render(); }
  overlay.classList.add("open");
  overlay.setAttribute("aria-hidden", "false");
  document.documentElement.style.overflow = "hidden";
}
function closeQuiz() {
  if (!EMBEDDED) return;
  overlay.classList.remove("open");
  overlay.setAttribute("aria-hidden", "true");
  document.documentElement.style.overflow = "";
}

function esc(s) { return String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }
function track(ev, data) { try { (window.dataLayer = window.dataLayer || []).push(Object.assign({ event: ev }, data || {})); } catch (e) {} }

function ringSVG(pct, color, size) {
  const r = 42, c = 2 * Math.PI * r, off = c * (1 - pct / 100);
  return `<svg width="${size}" height="${size}" viewBox="0 0 100 100" style="transform:rotate(-90deg)">
    <circle cx="50" cy="50" r="${r}" fill="none" stroke="rgba(255,255,255,.1)" stroke-width="8"/>
    <circle cx="50" cy="50" r="${r}" fill="none" stroke="${color}" stroke-width="8" stroke-linecap="round"
      stroke-dasharray="${c}" stroke-dashoffset="${off}"/></svg>`;
}

/* ---------------------------------------------------------------------------
   CTA configuration
   ------------------------------------------------------------------------- */
function setCTA(label, opts) {
  opts = opts || {};
  ctaBar.style.display = opts.hidden ? "none" : "";
  ctaBtn.textContent = label || "Next";
  ctaBtn.disabled = !!opts.disabled;
  ctaBtn.onclick = opts.onClick || goNext;
  if (opts.link) { ctaLink.hidden = false; ctaLink.textContent = opts.link.label; ctaLink.onclick = opts.link.onClick; }
  else { ctaLink.hidden = true; ctaLink.onclick = null; }
}
function enableCTA(on) { ctaBtn.disabled = !on; }

/* ---------------------------------------------------------------------------
   Navigation
   ------------------------------------------------------------------------- */
function goNext() {
  track("quiz_step_complete", { step: STEPS[state.i].id, index: state.i });
  if (state.i < STEPS.length - 1) { state.i++; saveState(); render(); }
}
function goBack() {
  if (state.i > 0) { state.i--; saveState(); render(); }
  else if (EMBEDDED) closeQuiz();
  else window.location.href = CONFIG.HOME_URL;
}
backBtn.onclick = goBack;

/* ---------------------------------------------------------------------------
   Master render
   ------------------------------------------------------------------------- */
function render() {
  const step = STEPS[state.i];
  const total = STEPS.length;
  progressFill.style.width = (state.i / (total - 1)) * 100 + "%";
  backBtn.hidden = false; // always allow back (first step returns to site)
  stepEl.classList.remove("quiz-step"); void stepEl.offsetWidth; stepEl.classList.add("quiz-step");
  if (overlay) overlay.scrollTo(0, 0); else window.scrollTo(0, 0);
  (HANDLERS[step.type] || HANDLERS.info)(step);
  track("quiz_step_view", { step: step.id, index: state.i });
}

/* ---------------------------------------------------------------------------
   Reusable head markup
   ------------------------------------------------------------------------- */
function head(step) {
  return (step.eyebrow ? `<span class="q-eyebrow">${step.eyebrow}</span>` : "") +
    (step.headline ? `<h1 class="q-head">${step.headline}</h1>` : "") +
    (step.sub ? `<p class="q-sub">${step.sub}</p>` : "");
}

/* ===========================================================================
   HANDLERS
   ======================================================================= */
const HANDLERS = {};

/* ---- single-select ---- */
HANDLERS.single = function (step) {
  const cur = state.answers[step.id];
  stepEl.innerHTML = head(step) + `<div class="opts">` + step.options.map((o, k) =>
    `<button class="opt${cur === o ? " selected" : ""}" data-v="${esc(o)}">
       <span class="opt__num">${k + 1}</span><span class="opt__label">${esc(o)}</span>
       <span class="opt__check">${CHECK}</span></button>`).join("") + `</div>`;
  setCTA(step.ctaLabel || "Next", { disabled: cur == null });
  stepEl.querySelectorAll(".opt").forEach(b => b.onclick = () => {
    stepEl.querySelectorAll(".opt").forEach(x => x.classList.remove("selected"));
    b.classList.add("selected"); setAnswer(step.id, b.dataset.v); enableCTA(true);
  });
};

/* ---- multi-select list ---- */
HANDLERS.multi = function (step) {
  const cur = new Set(state.answers[step.id] || []);
  const min = step.min || 1;
  stepEl.innerHTML = head(step) + `<div class="opts">` + step.options.map(o =>
    `<button class="opt${cur.has(o) ? " selected" : ""}" data-v="${esc(o)}">
       <span class="opt__label">${esc(o)}</span><span class="opt__check">${CHECK}</span></button>`).join("") + `</div>`;
  setCTA(step.ctaLabel || "Next", { disabled: cur.size < min });
  stepEl.querySelectorAll(".opt").forEach(b => b.onclick = () => {
    const v = b.dataset.v;
    if (cur.has(v)) cur.delete(v); else cur.add(v);
    b.classList.toggle("selected");
    setAnswer(step.id, [...cur]); enableCTA(cur.size >= min);
  });
};

/* ---- grouped multi (symptoms) ---- */
HANDLERS.multiGroup = function (step) {
  const cur = new Set(state.answers[step.id] || []);
  stepEl.innerHTML = head(step) +
    (step.callout ? `<div class="callout">${esc(step.callout)}</div>` : "") +
    step.groups.map(g => `<div class="group-label">${esc(g.label)}</div><div class="opts">` +
      g.options.map(o => `<button class="opt${cur.has(o) ? " selected" : ""}" data-v="${esc(o)}">
        <span class="opt__label">${esc(o)}</span><span class="opt__check">${CHECK}</span></button>`).join("") +
      `</div>`).join("");
  setCTA("Next", { disabled: false }); // symptoms can be zero-selected
  stepEl.querySelectorAll(".opt").forEach(b => b.onclick = () => {
    const v = b.dataset.v; if (cur.has(v)) cur.delete(v); else cur.add(v);
    b.classList.toggle("selected"); setAnswer(step.id, [...cur]);
  });
};

/* ---- tiles ---- */
HANDLERS.tiles = function (step) {
  const cur = new Set(state.answers[step.id] || []);
  stepEl.innerHTML = head(step) + `<div class="tiles">` + step.tiles.map(t =>
    `<button class="tile${cur.has(t.name) ? " selected" : ""}" data-v="${esc(t.name)}">
       <span class="tile__tick">${CHECK}</span>
       <span class="tile__ring" style="color:${t.color}"><span style="font-size:22px">${t.emoji}</span></span>
       <span class="tile__name">${esc(t.name)}</span></button>`).join("") + `</div>`;
  setCTA("Next", { disabled: cur.size < 1 });
  stepEl.querySelectorAll(".tile").forEach(b => b.onclick = () => {
    const v = b.dataset.v; if (cur.has(v)) cur.delete(v); else cur.add(v);
    b.classList.toggle("selected"); setAnswer(step.id, [...cur]); enableCTA(cur.size >= 1);
  });
};

/* ---- slider / dial ---- */
HANDLERS.slider = function (step) {
  const val = state.answers[step.id] != null ? state.answers[step.id] : step.def;
  stepEl.innerHTML = head(step) + `<div class="dial-wrap"><div class="dial" id="dial"></div>
    <input type="range" class="slider" id="rng" min="${step.min}" max="${step.max}" value="${val}"></div>`;
  const dial = document.getElementById("dial"), rng = document.getElementById("rng");
  function draw(v) {
    const pct = (v - step.min) / (step.max - step.min) * 100;
    dial.innerHTML = ringSVG(pct, "#FF736B", 220) +
      `<div class="dial__num"><b>${v}${step.unit}</b><span>per week</span></div>`;
  }
  draw(val); setAnswer(step.id, +val);
  rng.oninput = () => { draw(+rng.value); setAnswer(step.id, +rng.value); };
  setCTA(step.ctaLabel || "Next", { disabled: false });
};

/* ---- text inputs (username + age) ---- */
HANDLERS.inputs = function (step) {
  const a = state.answers[step.id] || {};
  stepEl.innerHTML = head(step) + step.fields.map(f => {
    const pre = f.type === "username" ? '<span style="position:absolute;left:16px;top:50%;transform:translateY(-50%);color:var(--text-3);pointer-events:none">@</span>' : "";
    const pad = f.type === "username" ? "style=\"position:relative\"" : "";
    return `<div class="field"><label>${esc(f.label)}</label>
      <div ${pad}>${pre}<input id="f_${f.key}" type="${f.type === "number" ? "number" : "text"}"
        inputmode="${f.type === "number" ? "numeric" : "text"}"
        ${f.type === "username" ? 'style="padding-left:32px" autocapitalize=off autocorrect=off spellcheck=false maxlength=20' : ""}
        placeholder="${esc(f.placeholder)}" value="${esc(a[f.key] || "")}"></div>
      <div class="field__hint" id="h_${f.key}"></div></div>`;
  }).join("");
  const u = document.getElementById("f_username"), age = document.getElementById("f_age");
  const uh = document.getElementById("h_username");
  let uOk = false, checkT;
  function validateAll() { enableCTA(uOk && age && +age.value >= 13 && +age.value <= 100); }
  function checkUser() {
    const v = (u.value || "").toLowerCase().trim();
    uOk = false; clearTimeout(checkT);
    if (!/^[a-z][a-z0-9_]{2,19}$/.test(v)) { uh.className = "field__hint bad"; uh.textContent = v ? "3–20 chars, start with a letter, a–z 0–9 _" : ""; validateAll(); return; }
    uh.className = "field__hint checking"; uh.textContent = "Checking…";
    checkT = setTimeout(() => {
      const taken = ["admin", "arc26", "test", "winter", "root"].includes(v);
      if (taken) { uh.className = "field__hint bad"; uh.textContent = "Taken, try another"; uOk = false; }
      else { uh.className = "field__hint ok"; uh.textContent = "@" + v + " is available"; uOk = true; }
      validateAll();
    }, 550);
  }
  u.oninput = () => { checkUser(); persist(); };
  age.oninput = () => { validateAll(); persist(); };
  function persist() { setAnswer(step.id, { username: u.value.trim(), age: age.value }); }
  if (u.value) checkUser();
  setCTA(step.ctaLabel || "Next", { disabled: true });
};

/* ---- informational (chart / rank / plain) ---- */
HANDLERS.info = function (step) {
  let body = "";
  if (step.variant === "chart") {
    body = `<div class="journey">
      <h4>Your Journey</h4>
      <svg viewBox="0 0 300 120" width="100%" height="120" preserveAspectRatio="none">
        <polyline points="4,110 80,96 150,70 220,40 296,12" fill="none" stroke="#59E08C" stroke-width="3" stroke-linecap="round"/>
        <polyline points="4,86 80,92 150,84 220,90 296,86" fill="none" stroke="#FF736B" stroke-width="3" stroke-linecap="round" stroke-dasharray="2 6"/>
      </svg>
      <div class="legend"><span><i style="background:#59E08C"></i>With Arc26</span><span><i style="background:#FF736B"></i>Without</span></div>
      <div class="axis"><span>Day 1</span><span>Day 60</span></div>
      <div class="stat-ring"><div class="ring">${ringSVG(72, "#59E08C", 64)}</div>
        <p>The average member sees a <b>72% improvement</b> in discipline after joining.</p></div>
    </div>`;
  } else if (step.variant === "rank") {
    const names = ["🥉", "🥈", "🥇", "P", "E", "D", "O", "M", "★"];
    const colors = ["#F2AD7D", "#BAC2C9", "#F5B01C", "#29E3E8", "#36ED7D", "#CCE6FF", "#8F5CEB", "#FA4742", "#59BDF7"];
    body = `<div class="rank-hero">
      <div class="rank-crest" style="display:grid;place-items:center">
        <div style="width:104px;height:104px;border-radius:26px;background:linear-gradient(160deg,#F2AD7D,#8a5230);display:grid;place-items:center;font-size:46px;box-shadow:0 0 44px rgba(242,173,125,.45)">🛡️</div>
      </div>
      <div class="rank-tier">BRONZE</div>
      <div class="rank-tag">Where the arc begins.</div>
      <div class="rank-elo">0 – 80 ELO</div>
      <div class="rank-row">${colors.map((c, k) => `<span class="rank-dot${k === 0 ? " now" : ""}" style="color:${c}">${names[k]}</span>`).join("")}</div>
    </div>`;
  } else {
    body = "";
  }
  stepEl.innerHTML = `<div class="info-center">` + head(step) + body + `</div>`;
  setCTA(step.ctaLabel || "Continue", { disabled: false });
};

/* ---- teaser (phone frame) ---- */
HANDLERS.teaser = function (step) {
  stepEl.innerHTML = `<div class="info-center">
    ${step.eyebrow ? `<span class="q-eyebrow">${esc(step.eyebrow)}</span>` : ""}
    <h1 class="q-head">${esc(step.line1)}<br><span class="${step.grad ? "grad" : "accent"}">${esc(step.line2)}</span></h1>
    <div class="teaser-phone"><div class="phone" style="width:230px">
      <div class="phone__notch"></div>
      <div class="phone__screen"><img class="phone__poster" src="assets/img/posters/${step.poster}.png" alt=""></div>
    </div></div></div>`;
  setCTA(step.ctaLabel || "Continue", { disabled: false });
};

/* ---- reward reel ---- */
const REWARDS = [
  { icon: "⚡", name: "+600 XP", pct: "5.00%" }, { icon: "🖼️", name: "Profile Pic", pct: "3.00%" },
  { icon: "👑", name: "Gold Name", pct: "0.02%" }, { icon: "🎨", name: "App Theme", pct: "1.00%" },
  { icon: "🚫", name: "App Ban 15m", pct: "8.00%" }, { icon: "⚡", name: "+250 XP", pct: "20.00%" },
  { icon: "❄️", name: "Streak Freeze", pct: "2.00%" }, { icon: "⚡", name: "+100 XP", pct: "40.00%" }
];
HANDLERS.reward = function (step) {
  const winner = 0; // "+600 XP"
  const reps = 10, len = REWARDS.length;
  let track = "";
  for (let r = 0; r < reps; r++) for (let k = 0; k < len; k++) {
    const it = REWARDS[k];
    track += `<div class="reel-item"><div class="rc">${it.icon}</div><div class="rn">${it.name}</div><div class="rp">${it.pct}</div></div>`;
  }
  stepEl.innerHTML = `<div class="reward-crate">
    <div class="sys">SYS://REWARD_01 · PROTOCOL: FOCUS</div>
    <div class="crate-art">🎁</div>
    <div class="q-sub" style="text-align:center">Spin your starter reward.</div>
    <div class="reel-window"><div class="reel-track" id="reel">${track}</div></div>
    <div class="reward-result" id="rres"><div class="won">You unlocked</div><div class="prize" id="prize"></div></div>
  </div>`;
  const reel = document.getElementById("reel");
  let spun = state.answers[step.id] ? true : false;

  function spin() {
    if (spun) return; spun = true;
    const windowW = reel.parentElement.clientWidth;
    const item = reel.children[0], pitch = item.offsetWidth + 14;
    const globalIdx = (reps - 2) * len + winner;
    const start = windowW / 2 - pitch / 2;
    reel.style.transform = `translateX(${start}px)`;
    void reel.offsetWidth;
    const target = windowW / 2 - pitch / 2 - globalIdx * pitch;
    reel.style.transition = "transform 4s cubic-bezier(0.12,0.75,0.12,1)";
    requestAnimationFrame(() => { reel.style.transform = `translateX(${target}px)`; });
    reel.addEventListener("transitionend", () => {
      setAnswer(step.id, REWARDS[winner].name);
      document.getElementById("prize").textContent = REWARDS[winner].name;
      document.getElementById("rres").classList.add("show");
      setCTA("Claim & continue", { disabled: false });
    }, { once: true });
  }

  if (spun) { // returning: show result immediately
    const windowW = reel.parentElement.clientWidth, item = reel.children[0], pitch = item.offsetWidth + 14;
    const globalIdx = (reps - 2) * len + winner;
    reel.style.transform = `translateX(${windowW / 2 - pitch / 2 - globalIdx * pitch}px)`;
    document.getElementById("prize").textContent = state.answers[step.id];
    document.getElementById("rres").classList.add("show");
    setCTA("Continue", { disabled: false });
  } else {
    setCTA(step.ctaLabel || "Spin", { disabled: false, onClick: spin });
    setTimeout(spin, 500); // auto-spin shortly after landing
  }
};

/* ---- notifications priming ---- */
HANDLERS.notify = function (step) {
  const rows = [
    ["Winter Arc", "Time to lock in. Your first task is waiting, don't quit now."],
    ["Task alarms", "No snoozing on your transformation."],
    ["Task reminders", "Quiet reminders so nothing slips."],
    ["Daily motivation", "A push when you need it most."]
  ];
  stepEl.innerHTML = `<div class="info-center"><div style="font-size:44px">🔔</div></div>` + head(step) +
    rows.map(r => `<div class="notif"><b>${esc(r[0])}</b><p>${esc(r[1])}</p></div>`).join("");
  setAnswer(step.id, true);
  setCTA("Notifications on", { disabled: false, link: { label: "Not now", onClick: () => { setAnswer(step.id, false); goNext(); } } });
};

/* ---- analyzing sequence ---- */
HANDLERS.analyzing = function (step) {
  const stages = [[10, "Reviewing your symptoms…"], [36, "Looking for patterns…"], [61, "Checking possible triggers…"], [86, "Preparing your insights…"], [100, "Done."]];
  stepEl.innerHTML = `<div class="analyzing"><div class="ring" id="aring"></div><div class="pct" id="apct">0%</div><div class="status" id="astat">Starting…</div></div>`;
  setCTA("Next", { hidden: true });
  const aring = document.getElementById("aring"), apct = document.getElementById("apct"), astat = document.getElementById("astat");
  let s = 0;
  function step2() {
    if (s >= stages.length) { setCTA("See my results", { disabled: false }); ctaBar.style.display = ""; return; }
    const [p, t] = stages[s];
    aring.innerHTML = ringSVG(p, "#408CFA", 150); apct.textContent = p + "%"; astat.textContent = t;
    s++; setTimeout(step2, s === 1 ? 300 : 900);
  }
  step2();
};

/* ---- results / bad news ---- */
HANDLERS.results = function (step) {
  stepEl.innerHTML = `<div class="info-center">
    <h1 class="q-head">We've got some <span class="danger">bad news…</span></h1>
    <p class="q-sub">Your responses show <b style="color:#fff">35% more</b> signs of poor self-discipline than average.</p>
    <div class="res-bars">
      <div class="res-bar"><div class="bar" style="height:82%;background:linear-gradient(180deg,#FF736B,#c23a33)">47%</div><small>Your score</small></div>
      <div class="res-bar"><div class="bar" style="height:24%;background:linear-gradient(180deg,#59E08C,#2f8a55)">12%</div><small>Average</small></div>
    </div>
    <p class="q-sub" style="margin-bottom:6px">This is normal. Men your age often face extra challenges with self-commitment, and it's fixable.</p>
    <p class="disclaimer">This is only an observation, not a diagnosis. Seek a professional for medical advice.</p>
  </div>`;
  setCTA(step.ctaLabel || "Let's go", { disabled: false });
};

/* ---- routine builder ---- */
const TASK_LIB = [
  { n: "Gym", e: "🏋️", tag: "Photo" }, { n: "Cold Shower", e: "🚿", tag: "Photo" },
  { n: "Run", e: "🏃", tag: "Photo" }, { n: "Push Ups", e: "💪", tag: "Photo" },
  { n: "Supplements", e: "💊", tag: "Check off" }, { n: "Read", e: "📖", tag: "Check off" },
  { n: "Journal", e: "📓", tag: "Check off" }, { n: "Study", e: "📚", tag: "Check off" },
  { n: "Lock In", e: "🔒", tag: "1h focus" }, { n: "Walk", e: "🚶", tag: "Check off" },
  { n: "Clean Meal", e: "🥗", tag: "Photo" }, { n: "Make Bed", e: "🛏️", tag: "Photo" }
];
HANDLERS.routine = function (step) {
  const cur = new Set(state.answers[step.id] || ["Gym", "Cold Shower", "Run", "Push Ups"]);
  const custom = state.answers.custom_tasks || [];
  function draw() {
    const all = TASK_LIB.concat(custom.map(n => ({ n, e: "✨", tag: "Custom" })));
    stepEl.innerHTML = head(Object.assign({}, step, { sub: cur.size + " tasks in your plan · adjust anytime" })) +
      `<div class="routine-grid">` + all.map(t =>
        `<button class="task-tile${cur.has(t.n) ? " selected" : ""}" data-v="${esc(t.n)}">
           <span class="tile__tick" style="top:10px;right:10px">${CHECK}</span>
           <div class="ti">${t.e}</div><div class="tn">${esc(t.n)}</div><div class="tt">${t.tag}</div></button>`).join("") +
      `<button class="task-tile add" id="addTask">+ Add custom task</button></div>`;
    stepEl.querySelectorAll(".task-tile[data-v]").forEach(b => b.onclick = () => {
      const v = b.dataset.v; if (cur.has(v)) cur.delete(v); else cur.add(v);
      setAnswer(step.id, [...cur]); draw();
    });
    document.getElementById("addTask").onclick = addCustom;
    setCTA(step.ctaLabel || "Build my plan", { disabled: cur.size < 1 });
  }
  function addCustom() {
    const name = (prompt("New custom task (e.g. Meditate 10 min):") || "").trim().slice(0, 30);
    if (!name) return;
    custom.push(name); cur.add(name);
    state.answers.custom_tasks = custom; setAnswer(step.id, [...cur]); draw();
  }
  draw();
};

/* ---- commitment / hold to lock ---- */
HANDLERS.commit = function (step) {
  const target = step.target;
  stepEl.innerHTML = head(step) +
    `<div class="commit-quote">“<span id="ctext">${esc(target)}</span>”</div>
     <p class="commit-hint">No need for punctuation or capitals.</p>
     <div class="field"><input id="cinput" value="${esc(target)}" autocapitalize=off></div>
     <div class="hold-btn" id="hold"><span class="fill" id="hfill"></span><span class="lbl">✋ Hold to lock in</span></div>`;
  const input = document.getElementById("cinput");
  const hold = document.getElementById("hold"), fill = document.getElementById("hfill"), lbl = hold.querySelector(".lbl");
  input.oninput = () => { document.getElementById("ctext").textContent = input.value; setAnswer(step.id, input.value); };
  setAnswer(step.id, input.value);
  setCTA("Hold the button to continue", { disabled: true, link: { label: "Confirm without holding", onClick: complete } });

  const DUR = 1400; let raf, t0, done = false;
  function frame(now) {
    if (!t0) t0 = now;
    const p = Math.min(1, (now - t0) / DUR);
    fill.style.width = (p * 100) + "%";
    if (p >= 1) { complete(); return; }
    raf = requestAnimationFrame(frame);
  }
  function start(e) { e.preventDefault(); if (done) return; t0 = 0; raf = requestAnimationFrame(frame); }
  function cancel() { if (done) return; cancelAnimationFrame(raf); fill.style.transition = "width .25s"; fill.style.width = "0%"; setTimeout(() => fill.style.transition = "", 260); }
  function complete() {
    if (done) return; done = true; cancelAnimationFrame(raf);
    hold.classList.add("done"); lbl.innerHTML = "🔒 Locked in";
    setAnswer(step.id, input.value); track("quiz_commit", {});
    setTimeout(goNext, 500);
  }
  hold.addEventListener("pointerdown", start);
  hold.addEventListener("pointerup", cancel);
  hold.addEventListener("pointerleave", cancel);
  hold.addEventListener("pointercancel", cancel);
};

/* ---- social proof recap ---- */
HANDLERS.social = function (step) {
  const tasks = state.answers.routine || ["Gym", "Cold Shower", "Run", "Push Ups"];
  const commit = state.answers.commit || "I commit to myself to lock in starting today";
  const avatars = ["J", "M", "D", "R", "A"].map(x => `<span>${x}</span>`).join("");
  stepEl.innerHTML = `<div class="info-center">
    <div class="avatars">${avatars}</div>
    <h1 class="q-head">Join <span class="accent">437,299</span> men on the winter arc</h1>
    <div class="commit-quote" style="font-size:16px;font-style:italic;margin-top:8px">“${esc(commit)}”</div>
    <p class="q-sub" style="margin-top:12px">You made the promise. Now put in the work.</p>
  </div>
  <div class="plan-card"><h4>Your Day 1 · ${tasks.length} tasks</h4><div class="plan-chips">` +
    tasks.map(t => `<span class="plan-chip">${esc(t)}</span>`).join("") + `</div></div>`;
  setCTA(step.ctaLabel || "Start my transformation", { disabled: false });
};

/* ---- account ---- */
HANDLERS.account = function (step) {
  stepEl.innerHTML = `<div class="info-center"><div style="font-size:40px">❄️</div></div>` + head(step) +
    `<button class="auth-btn apple" data-m="apple">
       <svg viewBox="0 0 24 24"><path d="M17.05 12.04c-.03-2.6 2.12-3.85 2.22-3.91-1.21-1.77-3.09-2.01-3.76-2.04-1.6-.16-3.12.94-3.93.94-.81 0-2.06-.92-3.39-.9-1.74.03-3.35 1.01-4.25 2.57-1.81 3.14-.46 7.79 1.3 10.34.86 1.25 1.88 2.65 3.22 2.6 1.29-.05 1.78-.83 3.34-.83 1.56 0 2 .83 3.37.81 1.39-.03 2.27-1.27 3.12-2.53.98-1.45 1.38-2.85 1.4-2.92-.03-.01-2.69-1.03-2.72-4.09zM14.6 4.5c.71-.86 1.19-2.06 1.06-3.25-1.02.04-2.26.68-3 1.54-.66.76-1.24 1.98-1.08 3.14 1.14.09 2.31-.58 3.02-1.43z"/></svg>
       Continue with Apple</button>
     <button class="auth-btn google" data-m="google">
       <svg viewBox="0 0 24 24"><path fill="#4285F4" d="M23 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.2a5.3 5.3 0 01-2.3 3.5v2.9h3.7c2.2-2 3.4-5 3.4-8.6z"/><path fill="#34A853" d="M12 24c3.1 0 5.7-1 7.6-2.8l-3.7-2.9c-1 .7-2.3 1.1-3.9 1.1-3 0-5.5-2-6.4-4.7H1.8v3C3.7 21.4 7.6 24 12 24z"/><path fill="#FBBC05" d="M5.6 14.7a7.2 7.2 0 010-4.6v-3H1.8a12 12 0 000 10.6z"/><path fill="#EA4335" d="M12 4.8c1.7 0 3.2.6 4.4 1.7l3.3-3.3C17.7 1.2 15.1 0 12 0 7.6 0 3.7 2.6 1.8 6.4l3.8 3c.9-2.7 3.4-4.6 6.4-4.6z"/></svg>
       Continue with Google</button>
     <div class="auth-divider">or</div>
     <div id="emailForm" hidden>
       <div class="field"><label>Email</label><input id="a_email" type="email" placeholder="you@email.com"></div>
       <div class="field"><label>Password</label><input id="a_pw" type="password" placeholder="8+ characters"></div>
     </div>
     <button class="auth-btn email" id="emailBtn">Continue with email</button>`;
  // NOTE: Apple/Google/email here store the choice locally and advance. Real auth
  // needs a backend or an OAuth provider, wire it where marked.
  stepEl.querySelectorAll(".auth-btn[data-m]").forEach(b => b.onclick = () => { state.method = b.dataset.m; saveState(); track("quiz_signup", { method: b.dataset.m }); goNext(); });
  const form = document.getElementById("emailForm"), eBtn = document.getElementById("emailBtn");
  eBtn.onclick = () => {
    if (form.hidden) { form.hidden = false; eBtn.textContent = "Create account"; return; }
    const em = document.getElementById("a_email").value.trim(), pw = document.getElementById("a_pw").value;
    if (!/^[^@]+@[^@]+\.[^@]+$/.test(em)) { alert("Enter a valid email."); return; }
    if (pw.length < 8) { alert("Password must be at least 8 characters."); return; }
    state.method = "email"; state.answers.email = em; saveState(); track("quiz_signup", { method: "email" }); goNext();
  };
  setCTA("Next", { hidden: true });
};

/* ---- community / feature recap ---- */
HANDLERS.community = function (step) {
  const feats = [
    ["Ranked ELO ladder", "Miss a day, lose ELO. Every rep counts."],
    ["Photo-verified tasks", "No cheating yourself. Live proof only."],
    ["Focus Mode", "Block your distractions and stay in the arc."],
    ["Morning Jarvis", "Start every day locked in, not scrolling."],
    ["Community", "Share the arc with men on the same path."]
  ];
  stepEl.innerHTML = `<span class="q-eyebrow">Real community</span>` + head(step) +
    `<div class="recap">` + feats.map(f =>
      `<div class="recap-item"><div class="ri" style="font-size:20px">✦</div><div><b>${esc(f[0])}</b><p>${esc(f[1])}</p></div></div>`).join("") + `</div>`;
  setCTA(step.ctaLabel || "Continue", { disabled: false });
};

/* ---- paywall ---- */
HANDLERS.paywall = function (step) {
  let plan = state.plan || "yearly";
  stepEl.innerHTML = `<div class="info-center">${head(step)}</div>
    <button class="plan-opt${plan === "yearly" ? " selected" : ""}" data-p="yearly">
      <span class="plan-badge">Best value · save 64%</span>
      <span class="radio"></span><span class="pt"><b>Yearly</b><small>$60 billed once a year</small></span>
      <span class="pp"><b>$5.00</b><small>/month</small></span></button>
    <button class="plan-opt${plan === "monthly" ? " selected" : ""}" data-p="monthly">
      <span class="radio"></span><span class="pt"><b>Monthly</b><small>Billed every month</small></span>
      <span class="pp"><b>$13.99</b><small>/month</small></span></button>
    <div class="paywall-links"><a href="privacy.html">Privacy</a><a href="#" id="restore">Restore</a><a href="terms.html">Terms</a></div>`;
  state.plan = plan; saveState();
  stepEl.querySelectorAll(".plan-opt").forEach(b => b.onclick = () => {
    plan = b.dataset.p; state.plan = plan; saveState();
    stepEl.querySelectorAll(".plan-opt").forEach(x => x.classList.remove("selected"));
    b.classList.add("selected");
  });
  const restore = document.getElementById("restore"); if (restore) restore.onclick = (e) => { e.preventDefault(); alert("Restore purchases is handled in the app after download."); };
  setCTA("Start subscription", { disabled: false, onClick: () => {
    track("quiz_checkout", { plan });
    const url = plan === "yearly" ? CONFIG.CHECKOUT_URL_YEARLY : CONFIG.CHECKOUT_URL_MONTHLY;
    if (url) { window.location.href = url; return; } // real checkout
    goNext(); // preview: continue to value screen + download
  } });
};

/* ---- verify value screen ---- */
HANDLERS.verify = function (step) {
  stepEl.innerHTML = `<div class="info-center"><div style="font-size:40px">📸</div>${head(step)}
    <div class="verify-frame"><span class="big">🏋️</span><span class="tick">Task verified</span></div>
    <div class="recap"><div class="recap-item" style="justify-content:center"><div><b>Live photo only</b><p>Snap proof in the moment, no camera-roll uploads.</p></div></div></div>
  </div>`;
  setCTA(step.ctaLabel || "Continue", { disabled: false });
};

/* ---- download handoff ---- */
HANDLERS.download = function (step) {
  const tasks = (state.answers.routine || []).length || 4;
  const uname = (state.answers.about && state.answers.about.username) || "";
  const plan = state.plan === "monthly" ? "Monthly · $13.99/mo" : "Yearly · $5.00/mo";
  progressFill.style.width = "100%";
  stepEl.innerHTML = `<div class="info-center"><div style="font-size:48px">🏔️</div>${head(step)}
    <p class="q-sub">Download Arc26 and your plan is waiting on Day 1.</p>
    <div class="store-badges">
      <a class="store-badge" id="dl" href="${esc(CONFIG.APP_STORE_URL)}" target="_blank" rel="noopener">
        <svg viewBox="0 0 24 24"><path d="M17.05 12.04c-.03-2.6 2.12-3.85 2.22-3.91-1.21-1.77-3.09-2.01-3.76-2.04-1.6-.16-3.12.94-3.93.94-.81 0-2.06-.92-3.39-.9-1.74.03-3.35 1.01-4.25 2.57-1.81 3.14-.46 7.79 1.3 10.34.86 1.25 1.88 2.65 3.22 2.6 1.29-.05 1.78-.83 3.34-.83 1.56 0 2 .83 3.37.81 1.39-.03 2.27-1.27 3.12-2.53.98-1.45 1.38-2.85 1.4-2.92-.03-.01-2.69-1.03-2.72-4.09zM14.6 4.5c.71-.86 1.19-2.06 1.06-3.25-1.02.04-2.26.68-3 1.54-.66.76-1.24 1.98-1.08 3.14 1.14.09 2.31-.58 3.02-1.43z"/></svg>
        <span><span class="sm">Download on the</span><br><span class="lg">App Store</span></span></a>
    </div>
    <div class="done-summary">
      ${uname ? `<div class="row"><span>Username</span><span>@${esc(uname)}</span></div>` : ""}
      <div class="row"><span>Daily tasks</span><span>${tasks}</span></div>
      <div class="row"><span>Plan</span><span>${esc(plan)}</span></div>
    </div>
  </div>`;
  document.getElementById("dl").onclick = () => track("quiz_download_click", {});
  setCTA("Back to site", { disabled: false, onClick: () => window.location.href = CONFIG.HOME_URL });
  backBtn.hidden = true;
};

/* ---------------------------------------------------------------------------
   Boot
   ------------------------------------------------------------------------- */
if (EMBEDDED) {
  // Home-page overlay: don't render until opened; wire the launchers.
  document.querySelectorAll("[data-open-quiz]").forEach(function (el) {
    el.addEventListener("click", function (e) { e.preventDefault(); openQuiz(); });
  });
  if (closeBtn) closeBtn.addEventListener("click", closeQuiz);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && overlay.classList.contains("open")) closeQuiz();
  });
} else {
  // Standalone start.html
  if (state.i >= STEPS.length) state.i = 0;
  // Dev/QA: jump to a step with #s=<index> (e.g. start.html#s=9). Harmless in prod.
  const _jump = (location.hash || "").match(/s=(\d+)/);
  if (_jump) state.i = Math.min(+_jump[1], STEPS.length - 1);
  render();
}
})();
