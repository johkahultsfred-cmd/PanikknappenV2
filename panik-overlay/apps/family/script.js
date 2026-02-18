const SECURITY_LOG_KEY = "familySecurityLog";

const securityLogList = document.getElementById("securityLogList");
const eventList = document.getElementById("eventList");

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

function addFamilyActionLog(actionText) {
  const item = document.createElement("li");
  item.innerHTML = `<span>${nowLabel()}</span> ${actionText}`;
  eventList.prepend(item);

  while (eventList.children.length > 10) {
    eventList.removeChild(eventList.lastElementChild);
  }
}

document.querySelectorAll("button[data-action]").forEach((button) => {
  button.addEventListener("click", () => {
    const action = button.dataset.action;
    appendSecurityLog(`Snabbåtgärd använd: ${action}.`);
    addFamilyActionLog(`${action} (simulerad åtgärd)`);
  });
});

appendSecurityLog("Familjeläge öppnades direkt utan kodlås (tillfälligt).");
renderSecurityLog();
