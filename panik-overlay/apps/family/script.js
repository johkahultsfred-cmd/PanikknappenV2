const PARENT_CODE_LOCK_DISABLED = true;
const TEST_PARENT_CODE = "1234";
const SECURITY_LOG_KEY = "familySecurityLog";
const SESSION_UNLOCK_KEY = "familyUnlockedAt";
const AUTO_LOCK_MS = 5 * 60 * 1000;

const familyShell = document.getElementById("familyShell");
const parentLock = document.getElementById("parentLock");
const codeForm = document.getElementById("codeForm");
const parentCodeInput = document.getElementById("parentCodeInput");
const lockMessage = document.getElementById("lockMessage");
const securityLogList = document.getElementById("securityLogList");
const eventList = document.getElementById("eventList");
const lockAgainBtn = document.getElementById("lockAgainBtn");

let autoLockTimer = null;

function safeRead(key, fallback = null) {
  try {
    const value = localStorage.getItem(key);
    return value === null ? fallback : value;
  } catch (error) {
    console.warn("Kunde inte läsa från localStorage:", error);
    return fallback;
  }
}

function safeWrite(key, value) {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    console.warn("Kunde inte skriva till localStorage:", error);
    return false;
  }
}

function safeRemove(key) {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.warn("Kunde inte ta bort från localStorage:", error);
  }
}


function nowLabel() {
  return new Date().toLocaleString("sv-SE", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    day: "2-digit",
    month: "short"
  });
}

function readSecurityLog() {
  const raw = safeRead(SECURITY_LOG_KEY, "[]") || "[]";

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn("Säkerhetslogg var trasig JSON och återställdes:", error);
    safeWrite(SECURITY_LOG_KEY, "[]");
    return [];
  }
}

function saveSecurityLog(logItems) {
  safeWrite(SECURITY_LOG_KEY, JSON.stringify(logItems.slice(0, 25)));
}

function appendSecurityLog(text) {
  const logs = readSecurityLog();
  logs.unshift({ at: new Date().toISOString(), text });
  saveSecurityLog(logs);
  renderSecurityLog();
}

function renderSecurityLog() {
  const logs = readSecurityLog();

  if (!logs.length) {
    securityLogList.innerHTML = "<li>Ingen säkerhetslogg ännu.</li>";
    return;
  }

  securityLogList.innerHTML = logs
    .map((item) => `<li><span>${new Date(item.at).toLocaleTimeString("sv-SE")}</span> ${item.text}</li>`)
    .join("");
}

function setLockedState(isLocked) {
  familyShell.dataset.locked = String(isLocked);
  familyShell.ariaHidden = String(isLocked);

  if (isLocked) {
    familyShell.setAttribute("inert", "");
    parentLock.hidden = false;
    parentCodeInput.value = "";
    parentCodeInput.focus();
    lockMessage.textContent = "Ange koden för att öppna familjeläge.";
    lockMessage.classList.remove("error");
    return;
  }

  familyShell.removeAttribute("inert");
  parentLock.hidden = true;
}

function markUnlocked() {
  const persisted = safeWrite(SESSION_UNLOCK_KEY, String(Date.now()));
  setLockedState(false);
  appendSecurityLog(
    PARENT_CODE_LOCK_DISABLED
      ? "Familjeläge öppnades utan kod (tillfälligt läge)."
      : "Familjeläge upplåst med kod."
  );
  if (!persisted) {
    appendSecurityLog("Varning: session kunde inte sparas i localStorage. Upplåsning fungerar ändå för denna vy.");
  }
  resetAutoLock();
}

function shouldStayUnlocked() {
  const unlockedAt = Number(safeRead(SESSION_UNLOCK_KEY, "0") || "0");
  if (!unlockedAt) return false;
  return Date.now() - unlockedAt < AUTO_LOCK_MS;
}

function lockFamily(reason) {
  safeRemove(SESSION_UNLOCK_KEY);
  appendSecurityLog(reason || "Familjeläge låstes.");
  setLockedState(true);

  if (autoLockTimer) {
    window.clearTimeout(autoLockTimer);
    autoLockTimer = null;
  }
}

function resetAutoLock() {
  if (autoLockTimer) {
    window.clearTimeout(autoLockTimer);
  }

  autoLockTimer = window.setTimeout(() => {
    lockFamily("Automatisk låsning efter inaktivitet.");
  }, AUTO_LOCK_MS);
}

function addFamilyActionLog(actionText) {
  const item = document.createElement("li");
  item.innerHTML = `<span>${nowLabel()}</span> ${actionText}`;
  eventList.prepend(item);

  while (eventList.children.length > 10) {
    eventList.removeChild(eventList.lastElementChild);
  }
}

if (PARENT_CODE_LOCK_DISABLED) {
  lockAgainBtn.hidden = true;
  markUnlocked();
} else {
  codeForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const enteredCode = parentCodeInput.value.trim();

    if (enteredCode === TEST_PARENT_CODE) {
      lockMessage.textContent = "Kod godkänd. Familjeläge öppnas.";
      lockMessage.classList.remove("error");
      markUnlocked();
      return;
    }

    lockMessage.textContent = "Fel kod. Försök igen.";
    lockMessage.classList.add("error");
    appendSecurityLog("Misslyckat kodförsök i familjeläge.");
    parentCodeInput.select();
  });

  lockAgainBtn.addEventListener("click", () => {
    lockFamily("Manuell låsning via knappen 'Lås familjeläge igen'.");
  });
}

document.querySelectorAll("button[data-action]").forEach((button) => {
  button.addEventListener("click", () => {
    const action = button.dataset.action;
    appendSecurityLog(`Snabbåtgärd använd: ${action}.`);
    addFamilyActionLog(`${action} (simulerad åtgärd)`);
    resetAutoLock();
  });
});

["click", "keydown", "touchstart"].forEach((eventName) => {
  familyShell.addEventListener(eventName, () => {
    if (PARENT_CODE_LOCK_DISABLED) return;
    if (parentLock.hidden) resetAutoLock();
  });
});

if (!PARENT_CODE_LOCK_DISABLED) {
  if (shouldStayUnlocked()) {
    setLockedState(false);
    appendSecurityLog("Familjeläge återöppnades via aktiv session.");
    resetAutoLock();
  } else {
    setLockedState(true);
  }
}

renderSecurityLog();
