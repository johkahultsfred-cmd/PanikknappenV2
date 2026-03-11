const HOLD_DURATION_MS = 5000;
const PANIC_INCIDENTS_KEY = "panicIncidents";
const API_INCIDENTS_URL = "../../api/incidents";
const DEFAULT_CHILD_ID = "child-demo-1";
const DEFAULT_FAMILY_ID = "family-demo-1";

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

function getFamilyId() {
  return localStorage.getItem("panicFamilyId") || DEFAULT_FAMILY_ID;
}

function getChildId() {
  return localStorage.getItem("panicChildId") || DEFAULT_CHILD_ID;
}

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

function encodeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function makeScreenshotPreview(payload) {
  const line1 = encodeXml("Panikläge aktiverat");
  const line2 = encodeXml(new Date(payload.timestamp).toLocaleString("sv-SE"));
  const line3 = encodeXml(`Position: ${payload.location?.left || "?"}, ${payload.location?.top || "?"}`);
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='720' height='405'>
    <defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop stop-color='#040a1b'/><stop offset='1' stop-color='#153777'/></linearGradient></defs>
    <rect width='100%' height='100%' fill='url(#g)'/>
    <circle cx='620' cy='60' r='28' fill='#ff416b'/>
    <text x='24' y='80' fill='#ffffff' font-size='40' font-family='Arial' font-weight='700'>Barnets enhet</text>
    <text x='24' y='145' fill='#c5dbff' font-size='28' font-family='Arial'>${line1}</text>
    <text x='24' y='195' fill='#c5dbff' font-size='24' font-family='Arial'>${line2}</text>
    <text x='24' y='235' fill='#c5dbff' font-size='24' font-family='Arial'>${line3}</text>
    <text x='24' y='360' fill='#86b7ff' font-size='20' font-family='Arial'>Demo-screenshot (plats för riktig native screenshot i nästa steg)</text>
  </svg>`;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function buildIncident(payload) {
  return {
    id: `panic-${Date.now()}`,
    childId: getChildId(),
    familyId: getFamilyId(),
    timestamp: payload.activatedAt,
    status: "ny",
    screenshotUrl: makeScreenshotPreview({
      timestamp: payload.activatedAt,
      location: payload.finalPosition
    }),
    location: {
      left: payload.finalPosition.left,
      top: payload.finalPosition.top
    },
    actions: [
      "Skicka push-notis till föräldrar",
      "Öppna familjens livevy",
      "Spara händelse i logg"
    ],
    triggerType: payload.triggerType,
    source: "child-app"
  };
}

function saveIncidentLocal(incident) {
  const current = JSON.parse(localStorage.getItem(PANIC_INCIDENTS_KEY) || "[]");
  current.unshift(incident);
  localStorage.setItem(PANIC_INCIDENTS_KEY, JSON.stringify(current.slice(0, 50)));
}

async function sendIncidentToApi(incident) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4500);

  try {
    const response = await fetch(API_INCIDENTS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(incident),
      signal: controller.signal
    });

    if (!response.ok) {
      throw new Error(`API-svar ${response.status}`);
    }

    const data = await response.json();
    return data.incident || incident;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function saveIncident(incident) {
  try {
    const saved = await sendIncidentToApi(incident);
    saveIncidentLocal(saved);
    return { source: "api" };
  } catch (error) {
    saveIncidentLocal(incident);
    console.warn("API ej nåbar, fallback till lokal lagring.", error.message);
    return { source: "local" };
  }
}

async function triggerPanic(triggerType) {
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

  const incident = buildIncident(payload);
  const savedState = await saveIncident(incident);

  activationLog.textContent = `${formatLog(payload)}\n\nIncident sparad via: ${savedState.source}`;

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
