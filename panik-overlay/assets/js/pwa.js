let deferredPrompt;

function isStandalone() {
  return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone;
}

function createInstallBanner() {
  const banner = document.createElement("section");
  banner.className = "install-banner";
  banner.setAttribute("aria-live", "polite");
  banner.innerHTML = `
    <p>Installera appen för snabbare öppning och fullskärmsläge.</p>
    <div class="install-banner__actions">
      <button type="button" class="install">Installera</button>
      <button type="button" class="dismiss">Inte nu</button>
    </div>
  `;

  const installBtn = banner.querySelector(".install");
  const dismissBtn = banner.querySelector(".dismiss");

  installBtn.addEventListener("click", async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
    banner.classList.remove("show");
  });

  dismissBtn.addEventListener("click", () => banner.classList.remove("show"));
  document.body.appendChild(banner);
  return banner;
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;

  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch((error) => {
      console.warn("Service worker kunde inte registreras:", error);
    });
  });
}

function setupInstallPrompt() {
  if (isStandalone()) return;

  const banner = createInstallBanner();

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredPrompt = event;
    banner.classList.add("show");
  });

  window.addEventListener("appinstalled", () => {
    banner.classList.remove("show");
    deferredPrompt = null;
  });
}

registerServiceWorker();
setupInstallPrompt();
