const HOLD_DURATION_MS = 5000;
const panicButton = document.getElementById("panic");
const languageSelect = document.getElementById("languageSelect");
const titleText = document.getElementById("titleText");
const descriptionText = document.getElementById("descriptionText");
const statusText = document.getElementById("statusText");
const countdownText = document.getElementById("countdownText");
const panicButtonText = document.getElementById("panicButtonText");
const logTitle = document.getElementById("logTitle");
const activationLog = document.getElementById("activationLog");
const languageLabel = document.getElementById("languageLabel");
const countdownBar = document.getElementById("countdownBar");

const messages = {
  sv: {
    language: "Språk",
    title: "Barnens panikknapp",
    description: "Håll inne knappen i 5 sekunder för att aktivera larm.",
    waiting: "Status: väntar",
    holding: "Status: håller inne...",
    activated: "Status: aktiverad",
    button: "PANIK",
    sent: "SKICKAT",
    countdown: (seconds) => `Larm om: ${seconds} s`,
    logTitle: "Senaste aktivering",
    noLog: "Ingen aktivering ännu."
  },
  en: {
    language: "Language",
    title: "Children's panic button",
    description: "Hold the button for 5 seconds to activate alert.",
    waiting: "Status: waiting",
    holding: "Status: holding...",
    activated: "Status: activated",
    button: "PANIC",
    sent: "SENT",
    countdown: (seconds) => `Alert in: ${seconds} s`,
    logTitle: "Latest activation",
    noLog: "No activation yet."
  }
};

let currentLanguage = navigator.language && navigator.language.startsWith("en") ? "en" : "sv";
languageSelect.value = currentLanguage;

let dragging = false;
let holdStartedAt = 0;
let holdTimer = null;
let countdownInterval = null;
let startOffsetX = 0;
let startOffsetY = 0;
let pointerMoved = false;

function setLanguage(lang) {
  currentLanguage = messages[lang] ? lang : "sv";
  const t = messages[currentLanguage];

  languageLabel.textContent = t.language;
  titleText.textContent = t.title;
  descriptionText.textContent = t.description;
  logTitle.textContent = t.logTitle;

  if (!panicButton.classList.contains("triggered")) {
    panicButtonText.textContent = t.button;
    statusText.textContent = t.waiting;
  }

  const savedLog = getLatestLog();
  activationLog.textContent = savedLog ? formatLog(savedLog) : t.noLog;
}

function getPointerPosition(event) {
  if (event.touches && event.touches[0]) {
    return { x: event.touches[0].clientX, y: event.touches[0].clientY, type: "touch" };
  }

  return { x: event.clientX, y: event.clientY, type: event.pointerType || "mouse" };
}

function setProgress(percent) {
  countdownBar.style.width = `${Math.min(100, Math.max(0, percent))}%`;
}

function startHold(event) {
  event.preventDefault();

  const pos = getPointerPosition(event);
  dragging = true;
  pointerMoved = false;
  holdStartedAt = Date.now();
  startOffsetX = pos.x - panicButton.offsetLeft;
  startOffsetY = pos.y - panicButton.offsetTop;

  panicButton.classList.remove("triggered");
  panicButtonText.textContent = messages[currentLanguage].button;
  statusText.textContent = messages[currentLanguage].holding;
  updateCountdown();

  if (window.gsap) {
    window.gsap.to(panicButton, { scale: 1.08, duration: 0.2 });
  }

  holdTimer = setTimeout(() => triggerPanic(pos.type), HOLD_DURATION_MS);
  countdownInterval = setInterval(updateCountdown, 120);
}

function updateCountdown() {
  if (!holdStartedAt) {
    countdownText.textContent = "";
    setProgress(0);
    return;
  }

  const elapsed = Date.now() - holdStartedAt;
  const remaining = Math.max(0, HOLD_DURATION_MS - elapsed);
  const seconds = Math.ceil(remaining / 1000);
  countdownText.textContent = messages[currentLanguage].countdown(seconds);
  setProgress((elapsed / HOLD_DURATION_MS) * 100);
}

function moveButton(event) {
  if (!dragging) return;

  const pos = getPointerPosition(event);
  const maxX = window.innerWidth - panicButton.offsetWidth;
  const maxY = window.innerHeight - panicButton.offsetHeight;
  const left = Math.max(0, Math.min(maxX, pos.x - startOffsetX));
  const top = Math.max(0, Math.min(maxY, pos.y - startOffsetY));

  panicButton.style.left = `${left}px`;
  panicButton.style.top = `${top}px`;

  pointerMoved = true;
}

function stopHold() {
  const wasTriggered = panicButton.classList.contains("triggered");
  dragging = false;
  holdStartedAt = 0;

  clearTimeout(holdTimer);
  clearInterval(countdownInterval);

  if (window.gsap) {
    window.gsap.to(panicButton, { scale: 1, duration: 0.25 });
  }

  if (!wasTriggered) {
    statusText.textContent = messages[currentLanguage].waiting;
    countdownText.textContent = "";
    setProgress(0);
  }
}

function triggerPanic(triggerType) {
  panicButton.classList.add("triggered");
  panicButtonText.textContent = messages[currentLanguage].sent;
  statusText.textContent = messages[currentLanguage].activated;
  countdownText.textContent = "";
  setProgress(100);

  const payload = {
    activatedAt: new Date().toISOString(),
    holdDurationMs: HOLD_DURATION_MS,
    triggerType,
    movedDuringHold: pointerMoved,
    finalPosition: {
      left: panicButton.style.left || `${panicButton.offsetLeft}px`,
      top: panicButton.style.top || `${panicButton.offsetTop}px`
    },
    language: currentLanguage,
    platform: navigator.platform,
    userAgent: navigator.userAgent
  };

  persistLog(payload);
  activationLog.textContent = formatLog(payload);

  if (window.gsap) {
    window.gsap.fromTo(
      panicButton,
      { filter: "drop-shadow(0 0 0 rgba(47,212,159,0.2))" },
      { filter: "drop-shadow(0 0 22px rgba(47,212,159,0.92))", yoyo: true, repeat: 1, duration: 0.4 }
    );
  }

  console.log("🚨 Panic activated", payload);
}

function persistLog(payload) {
  const existing = JSON.parse(localStorage.getItem("panicActivationLog") || "[]");
  existing.unshift(payload);
  localStorage.setItem("panicActivationLog", JSON.stringify(existing.slice(0, 25)));
}

function getLatestLog() {
  const logs = JSON.parse(localStorage.getItem("panicActivationLog") || "[]");
  return logs.length ? logs[0] : null;
}

function formatLog(log) {
  return JSON.stringify(log, null, 2);
}

function initAnimations() {
  if (!window.gsap) return;

  window.gsap.from(".topbar, .info-card, .log-card", {
    y: 20,
    opacity: 0,
    duration: 0.55,
    stagger: 0.08,
    ease: "power2.out"
  });

  window.gsap.to(".pulse-ring", {
    scale: 1.18,
    opacity: 0.25,
    duration: 1.2,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut"
  });

  window.gsap.to("#panic .flame", {
    scale: 1.06,
    y: -2,
    transformOrigin: "center center",
    duration: 0.65,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut"
  });
}

panicButton.addEventListener("mousedown", startHold);
panicButton.addEventListener("touchstart", startHold, { passive: false });
window.addEventListener("mousemove", moveButton);
window.addEventListener("touchmove", moveButton, { passive: false });
window.addEventListener("mouseup", stopHold);
window.addEventListener("touchend", stopHold);
languageSelect.addEventListener("change", (event) => setLanguage(event.target.value));

setLanguage(currentLanguage);
initAnimations();
