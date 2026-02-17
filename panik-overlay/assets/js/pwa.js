let deferredPrompt;

function isStandalone() {
  return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone;
}

function isIosSafari() {
  const ua = window.navigator.userAgent;
  const isIos = /iPad|iPhone|iPod/.test(ua);
  const isSafari = /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua);
  return isIos && isSafari;
}

function createBanner(message, installable = false) {
  const banner = document.createElement("section");
  banner.className = "install-banner";
  banner.setAttribute("aria-live", "polite");

  if (installable) {
    banner.innerHTML = `
      <p>${message}</p>
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
  } else {
    banner.innerHTML = `
      <p>${message}</p>
      <div class="install-banner__actions">
        <button type="button" class="dismiss">Stäng</button>
      </div>
    `;

    banner.querySelector(".dismiss").addEventListener("click", () => {
      banner.classList.remove("show");
    });
  }

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

  if (isIosSafari()) {
    const iosBanner = createBanner("iPhone: Tryck Dela och välj Lägg till på hemskärmen.", false);
    iosBanner.classList.add("show");
    return;
  }

  const banner = createBanner("Installera appen för snabbare öppning och fullskärmsläge.", true);

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
