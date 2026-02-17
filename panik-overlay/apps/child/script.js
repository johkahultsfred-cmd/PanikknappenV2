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

function startHold(event) {
  event.preventDefault();

  const pos = getPointerPosition(event);
  dragging = true;
  pointerMoved = false;
  holdStartedAt = Date.now();
  startOffsetX = pos.x - panicButton.offsetLeft;
  startOffsetY = pos.y - panicButton.offsetTop;

  statusText.textContent = messages[currentLanguage].holding;
  updateCountdown();

  holdTimer = setTimeout(() => triggerPanic(pos.type), HOLD_DURATION_MS);
  countdownInterval = setInterval(updateCountdown, 250);
}

function updateCountdown() {
  if (!holdStartedAt) {
    countdownText.textContent = "";
    return;
  }

  const elapsed = Date.now() - holdStartedAt;
  const remaining = Math.max(0, HOLD_DURATION_MS - elapsed);
  const seconds = Math.ceil(remaining / 1000);
  countdownText.textContent = messages[currentLanguage].countdown(seconds);
}

function moveButton(event) {
  if (!dragging) return;

  const pos = getPointerPosition(event);
  const left = pos.x - startOffsetX;
  const top = pos.y - startOffsetY;

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

  if (!wasTriggered) {
    statusText.textContent = messages[currentLanguage].waiting;
    countdownText.textContent = "";
  }
}

function triggerPanic(triggerType) {
  panicButton.classList.add("triggered");
  panicButtonText.textContent = messages[currentLanguage].sent;
  statusText.textContent = messages[currentLanguage].activated;
  countdownText.textContent = "";

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

panicButton.addEventListener("mousedown", startHold);
panicButton.addEventListener("touchstart", startHold, { passive: false });
window.addEventListener("mousemove", moveButton);
window.addEventListener("touchmove", moveButton, { passive: false });
window.addEventListener("mouseup", stopHold);
window.addEventListener("touchend", stopHold);
languageSelect.addEventListener("change", (event) => setLanguage(event.target.value));

setLanguage(currentLanguage);
