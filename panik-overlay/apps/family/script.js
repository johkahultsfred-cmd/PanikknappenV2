const PANIC_INCIDENTS_KEY = "panicIncidents";
const SECURITY_LOG_KEY = "familySecurityLog";
const API_INCIDENTS_URL = "../../api/incidents";
const PUSH_PUBLIC_KEY_URL = "../../api/push/public-key";
const PUSH_SUBSCRIBE_URL = "../../api/push/subscribe";
const PUSH_UNSUBSCRIBE_URL = "../../api/push/unsubscribe";
const DEFAULT_FAMILY_ID = "family-demo-1";
const POLL_INTERVAL_MS = 10000;

const eventList = document.getElementById("eventList");
const securityLogList = document.getElementById("securityLogList");
const activeSignalValue = document.getElementById("activeSignalValue");
const latestAlarmValue = document.getElementById("latestAlarmValue");
const todayCountValue = document.getElementById("todayCountValue");
const latestShot = document.getElementById("latestShot");
const latestShotWrap = document.getElementById("latestShotWrap");
const noShotText = document.getElementById("noShotText");
const incidentInboxList = document.getElementById("incidentInboxList");
const newAlarmIndicator = document.getElementById("newAlarmIndicator");
const pushStatusText = document.getElementById("pushStatusText");
const enablePushBtn = document.getElementById("enablePushBtn");
const disablePushBtn = document.getElementById("disablePushBtn");

let latestKnownIncidentId = null;

function getFamilyId() {
  const fromQuery = new URLSearchParams(window.location.search).get("familyId");
  if (fromQuery) {
    localStorage.setItem("panicFamilyId", fromQuery);
    return fromQuery;
  }
  return localStorage.getItem("panicFamilyId") || DEFAULT_FAMILY_ID;
}

function safeReadJson(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn("Kunde inte läsa key:", key, error);
    return [];
  }
}

function safeWriteJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn("Kunde inte skriva key:", key, error);
  }
}

function appendSecurityLog(text) {
  const logs = safeReadJson(SECURITY_LOG_KEY);
  logs.unshift({ at: new Date().toISOString(), text });
  safeWriteJson(SECURITY_LOG_KEY, logs.slice(0, 30));
  renderSecurityLog();
}

function renderSecurityLog() {
  const logs = safeReadJson(SECURITY_LOG_KEY);

  if (!logs.length) {
    securityLogList.innerHTML = "<li>Ingen säkerhetslogg ännu.</li>";
    return;
  }

  securityLogList.innerHTML = logs
    .map((item) => `<li><span>${new Date(item.at).toLocaleTimeString("sv-SE")}</span> ${item.text}</li>`)
    .join("");
}

function formatDateTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "okänd tid";

  return date.toLocaleString("sv-SE", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
}

function mapApiIncident(item) {
  return {
    id: item.id,
    childId: item.childId,
    familyId: item.familyId,
    activatedAt: item.timestamp,
    status: item.status || "ny",
    screenshot: item.screenshotUrl || "",
    location: item.location || null,
    actions: Array.isArray(item.actions) ? item.actions : [],
    triggerType: item.triggerType || "okänd"
  };
}

async function fetchIncidentsFromApi() {
  const url = `${API_INCIDENTS_URL}?familyId=${encodeURIComponent(getFamilyId())}`;
  const response = await fetch(url, { headers: { Accept: "application/json" } });
  if (!response.ok) {
    throw new Error(`API-svar ${response.status}`);
  }
  const data = await response.json();
  const incidents = (data.incidents || []).map(mapApiIncident);
  safeWriteJson(PANIC_INCIDENTS_KEY, incidents);
  return { incidents, source: "api" };
}

function readIncidentsLocal() {
  const local = safeReadJson(PANIC_INCIDENTS_KEY);
  return local.map((item) => ({
    ...item,
    activatedAt: item.activatedAt || item.timestamp || new Date().toISOString(),
    screenshot: item.screenshot || item.screenshotUrl || ""
  }));
}

async function loadIncidents() {
  try {
    return await fetchIncidentsFromApi();
  } catch (error) {
    console.warn("API ej nåbar, fallback till localStorage", error.message);
    return { incidents: readIncidentsLocal(), source: "local" };
  }
}

function renderKpi(incidents) {
  if (!incidents.length) {
    activeSignalValue.textContent = "Ingen aktiv paniksignal";
    activeSignalValue.classList.remove("danger");
    latestAlarmValue.textContent = "Ingen signal ännu";
    todayCountValue.textContent = "0";
    return;
  }

  const latest = incidents[0];
  const hasNew = incidents.some((item) => item.status !== "hanterad");
  activeSignalValue.textContent = hasNew ? "Paniksignal mottagen" : "Alla larm hanterade";
  activeSignalValue.classList.toggle("danger", hasNew);
  latestAlarmValue.textContent = formatDateTime(latest.activatedAt);

  const today = new Date().toISOString().slice(0, 10);
  const todayCount = incidents.filter((item) => String(item.activatedAt || "").startsWith(today)).length;
  todayCountValue.textContent = String(todayCount);
}

function renderEventList(incidents) {
  if (!incidents.length) {
    eventList.innerHTML = "<li>Ingen händelse ännu.</li>";
    return;
  }

  eventList.innerHTML = incidents
    .slice(0, 10)
    .map((item) => {
      const actions = Array.isArray(item.actions) && item.actions.length
        ? item.actions.join(" · ")
        : "Inga säkerhetssteg loggade";
      return `<li><span>${formatDateTime(item.activatedAt)}</span> Paniksignal via ${item.triggerType || "okänd"}. ${actions}.</li>`;
    })
    .join("");
}

function renderScreenshot(incidents) {
  const latestWithShot = incidents.find((item) => item.screenshot);

  if (!latestWithShot) {
    latestShotWrap.hidden = true;
    noShotText.hidden = false;
    latestShot.removeAttribute("src");
    return;
  }

  latestShot.src = latestWithShot.screenshot;
  latestShotWrap.hidden = false;
  noShotText.hidden = true;
}

function renderIncidentInbox(incidents) {
  if (!incidents.length) {
    incidentInboxList.innerHTML = "<li>Ingen incident ännu.</li>";
    return;
  }

  incidentInboxList.innerHTML = incidents
    .slice(0, 20)
    .map((incident) => {
      const statusLabel = incident.status === "hanterad" ? "Hanterad" : "Ny";
      const button = incident.status === "hanterad"
        ? ""
        : `<button class=\"incident-handle-btn\" data-incident-id=\"${incident.id}\">Markera hanterad</button>`;
      return `
        <li class="incident-item">
          <p><span>${formatDateTime(incident.activatedAt)}</span> ${statusLabel} · ${incident.childId || "okänt barn"}</p>
          ${button}
        </li>
      `;
    })
    .join("");

  incidentInboxList.querySelectorAll("[data-incident-id]").forEach((button) => {
    button.addEventListener("click", () => {
      markIncidentHandled(button.dataset.incidentId);
    });
  });
}

async function markIncidentHandled(incidentId) {
  const incidents = readIncidentsLocal();
  const target = incidents.find((item) => item.id === incidentId);
  if (!target) return;

  const handledAt = new Date().toISOString();

  try {
    const response = await fetch(`${API_INCIDENTS_URL}/${incidentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "hanterad", handledAt })
    });

    if (!response.ok) {
      throw new Error(`API-svar ${response.status}`);
    }

    appendSecurityLog(`Incident ${incidentId} markerad som hanterad via API.`);
  } catch (error) {
    appendSecurityLog(`API nere, incident ${incidentId} markerad lokalt.`);
    const updated = incidents.map((item) => item.id === incidentId ? { ...item, status: "hanterad", handledAt } : item);
    safeWriteJson(PANIC_INCIDENTS_KEY, updated);
  }

  await refreshDashboard();
}

function renderNewAlarmIndicator(incidents, source) {
  if (!incidents.length) {
    newAlarmIndicator.hidden = true;
    latestKnownIncidentId = null;
    return;
  }

  const latestId = incidents[0].id;
  if (latestKnownIncidentId && latestKnownIncidentId !== latestId) {
    newAlarmIndicator.hidden = false;
    newAlarmIndicator.textContent = `Nytt larm mottaget (${source})`;
  }

  latestKnownIncidentId = latestId;
}

async function refreshDashboard() {
  const { incidents, source } = await loadIncidents();
  renderKpi(incidents);
  renderEventList(incidents);
  renderScreenshot(incidents);
  renderIncidentInbox(incidents);
  renderNewAlarmIndicator(incidents, source);
}

function startPolling() {
  window.setInterval(() => {
    refreshDashboard();
  }, POLL_INTERVAL_MS);
}

function urlB64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

async function updatePushStatusLabel() {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    pushStatusText.textContent = "Push stöds inte i denna enhet/browser.";
    enablePushBtn.disabled = true;
    disablePushBtn.disabled = true;
    return;
  }

  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();

  if (subscription) {
    pushStatusText.textContent = "Push-notis aktiv.";
    enablePushBtn.disabled = true;
    disablePushBtn.disabled = false;
  } else {
    pushStatusText.textContent = "Push-notis inte aktiv ännu.";
    enablePushBtn.disabled = false;
    disablePushBtn.disabled = true;
  }
}

async function enablePushNotifications() {
  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      pushStatusText.textContent = "Notistillstånd nekades.";
      return;
    }

    const registration = await navigator.serviceWorker.ready;
    const keyRes = await fetch(PUSH_PUBLIC_KEY_URL);
    if (!keyRes.ok) throw new Error(`Kunde inte hämta push-nyckel (${keyRes.status})`);
    const { publicKey } = await keyRes.json();

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlB64ToUint8Array(publicKey)
    });

    const saveRes = await fetch(PUSH_SUBSCRIBE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        familyId: getFamilyId(),
        subscription
      })
    });

    if (!saveRes.ok) {
      throw new Error(`Kunde inte spara push-subscription (${saveRes.status})`);
    }

    appendSecurityLog("Push-notis aktiverad i familjeläge.");
    await updatePushStatusLabel();
  } catch (error) {
    pushStatusText.textContent = `Push kunde inte aktiveras: ${error.message}`;
  }
}

async function disablePushNotifications() {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      await updatePushStatusLabel();
      return;
    }

    await fetch(PUSH_UNSUBSCRIBE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ endpoint: subscription.endpoint })
    });

    await subscription.unsubscribe();
    appendSecurityLog("Push-notis avaktiverad i familjeläge.");
    await updatePushStatusLabel();
  } catch (error) {
    pushStatusText.textContent = `Kunde inte stänga av push: ${error.message}`;
  }
}

document.querySelectorAll("button[data-action]").forEach((button) => {
  button.addEventListener("click", () => {
    const action = button.dataset.action;
    appendSecurityLog(`Snabbåtgärd använd: ${action}.`);
  });
});

window.addEventListener("storage", (event) => {
  if (event.key === PANIC_INCIDENTS_KEY) {
    refreshDashboard();
    appendSecurityLog("Ny paniksignal synkad från barnets app.");
  }
});

enablePushBtn.addEventListener("click", enablePushNotifications);
disablePushBtn.addEventListener("click", disablePushNotifications);

refreshDashboard();
renderSecurityLog();
startPolling();
updatePushStatusLabel();
