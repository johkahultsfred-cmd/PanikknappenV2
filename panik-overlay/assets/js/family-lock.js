(async () => {
  const DEFAULT_PIN = '1234';
  const PIN_HASH_KEY = 'familyPinHash';
  const PIN_SALT_KEY = 'familyPinSalt';
  const LEGACY_PIN_KEY = 'familyPinCode';
  const REMEMBER_UNTIL_KEY = 'familyPinRememberUntil';
  const FAILED_KEY = 'familyPinFailedAttempts';
  const LOCK_UNTIL_KEY = 'familyPinLockUntil';
  const AUDIT_KEY = 'familyPinAudit';

  const lockScreen = document.querySelector('#parent-lock');
  const dashboard = document.querySelector('#family-dashboard');
  const pinForm = document.querySelector('#pin-form');
  const pinInput = document.querySelector('#pin-input');
  const rememberDevice = document.querySelector('#remember-device');
  const lockMessage = document.querySelector('#lock-message');
  const lockNowButton = document.querySelector('#lock-now');
  const changePinForm = document.querySelector('#change-pin-form');
  const changePinMessage = document.querySelector('#change-pin-message');

  if (!lockScreen || !dashboard || !pinForm || !pinInput || !lockMessage) {
    return;
  }

  const sanitizePin = (value) => value.replace(/\D/g, '').slice(0, 4);
  const toNumber = (value) => Number.parseInt(value || '0', 10) || 0;

  let lockCountdownTimer = null;

  const setLockMessage = (text, isError = false) => {
    lockMessage.textContent = text;
    lockMessage.classList.toggle('error', isError);
  };

  const setChangeMessage = (text, isError = false) => {
    if (!changePinMessage) return;
    changePinMessage.textContent = text;
    changePinMessage.classList.toggle('error', isError);
  };

  const storeAudit = (message) => {
    const current = JSON.parse(localStorage.getItem(AUDIT_KEY) || '[]');
    current.unshift({ at: new Date().toISOString(), message });
    localStorage.setItem(AUDIT_KEY, JSON.stringify(current.slice(0, 30)));
  };

  const getLockUntil = () => toNumber(localStorage.getItem(LOCK_UNTIL_KEY));
  const getFailedAttempts = () => toNumber(localStorage.getItem(FAILED_KEY));

  const randomSalt = () => {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  };

  const hashPin = async (pin, salt) => {
    const data = new TextEncoder().encode(`${salt}:${pin}`);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer), (b) => b.toString(16).padStart(2, '0')).join('');
  };

  const savePin = async (pin) => {
    const salt = randomSalt();
    const hash = await hashPin(pin, salt);
    localStorage.setItem(PIN_SALT_KEY, salt);
    localStorage.setItem(PIN_HASH_KEY, hash);
  };

  const migrateLegacyPinIfNeeded = async () => {
    const hasHash = localStorage.getItem(PIN_HASH_KEY);
    const hasSalt = localStorage.getItem(PIN_SALT_KEY);

    if (hasHash && hasSalt) return;

    const legacy = localStorage.getItem(LEGACY_PIN_KEY);
    if (legacy && /^\d{4}$/.test(legacy)) {
      await savePin(legacy);
      localStorage.removeItem(LEGACY_PIN_KEY);
      return;
    }

    await savePin(DEFAULT_PIN);
  };

  const verifyPin = async (enteredPin) => {
    const salt = localStorage.getItem(PIN_SALT_KEY) || '';
    const expectedHash = localStorage.getItem(PIN_HASH_KEY) || '';

    if (!salt || !expectedHash) {
      await savePin(DEFAULT_PIN);
      return verifyPin(enteredPin);
    }

    const enteredHash = await hashPin(enteredPin, salt);
    return enteredHash === expectedHash;
  };

  const isRemembered = () => {
    const rememberUntil = toNumber(localStorage.getItem(REMEMBER_UNTIL_KEY));
    return Date.now() < rememberUntil;
  };

  const stopLockCountdown = () => {
    if (lockCountdownTimer) {
      window.clearInterval(lockCountdownTimer);
      lockCountdownTimer = null;
    }
  };

  const getRemainingLockSeconds = () => {
    const lockUntil = getLockUntil();
    return Math.max(0, Math.ceil((lockUntil - Date.now()) / 1000));
  };

  const startLockCountdown = () => {
    stopLockCountdown();
    lockCountdownTimer = window.setInterval(() => {
      const remaining = getRemainingLockSeconds();
      if (remaining <= 0) {
        stopLockCountdown();
        setLockMessage('Du kan försöka igen nu.', false);
        return;
      }
      setLockMessage(`För många fel. Vänta ${remaining} sek och försök igen.`, true);
    }, 500);
  };

  const checkTemporaryBlock = () => {
    const remaining = getRemainingLockSeconds();
    if (remaining > 0) {
      setLockMessage(`För många fel. Vänta ${remaining} sek och försök igen.`, true);
      startLockCountdown();
      return true;
    }
    stopLockCountdown();
    return false;
  };

  const unlockDashboard = () => {
    stopLockCountdown();
    lockScreen.hidden = true;
    dashboard.hidden = false;
    setLockMessage('');
    pinForm.reset();
  };

  const lockDashboard = (message = 'Familjeläget är låst.') => {
    dashboard.hidden = true;
    lockScreen.hidden = false;
    setLockMessage(message);
    pinInput.focus();
  };

  pinInput.addEventListener('input', () => {
    pinInput.value = sanitizePin(pinInput.value);
  });

  pinForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (checkTemporaryBlock()) return;

    const enteredPin = sanitizePin(pinInput.value);

    if (enteredPin.length < 4) {
      setLockMessage('Koden behöver 4 siffror.', true);
      return;
    }

    const isValidPin = await verifyPin(enteredPin);

    if (!isValidPin) {
      const attempts = getFailedAttempts() + 1;
      localStorage.setItem(FAILED_KEY, String(attempts));
      storeAudit(`Misslyckad inloggning (${attempts})`);

      if (attempts >= 3) {
        const lockUntil = Date.now() + 30_000;
        localStorage.setItem(LOCK_UNTIL_KEY, String(lockUntil));
        localStorage.setItem(FAILED_KEY, '0');
      }

      pinInput.value = '';
      if (checkTemporaryBlock()) return;

      setLockMessage('Fel kod. Försök igen.', true);
      return;
    }

    localStorage.setItem(FAILED_KEY, '0');
    localStorage.removeItem(LOCK_UNTIL_KEY);

    if (rememberDevice?.checked) {
      localStorage.setItem(REMEMBER_UNTIL_KEY, String(Date.now() + 15 * 60 * 1000));
    } else {
      localStorage.removeItem(REMEMBER_UNTIL_KEY);
    }

    storeAudit('Lyckad inloggning');
    unlockDashboard();
  });

  if (lockNowButton) {
    lockNowButton.addEventListener('click', () => {
      localStorage.removeItem(REMEMBER_UNTIL_KEY);
      storeAudit('Manuell låsning');
      lockDashboard('Låst manuellt. Ange kod igen.');
    });
  }

  if (changePinForm) {
    const currentPinInput = document.querySelector('#current-pin');
    const newPinInput = document.querySelector('#new-pin');
    const confirmPinInput = document.querySelector('#confirm-pin');

    const sanitizeInput = (inputElement) => {
      if (!inputElement) return;
      inputElement.addEventListener('input', () => {
        inputElement.value = sanitizePin(inputElement.value);
      });
    };

    sanitizeInput(currentPinInput);
    sanitizeInput(newPinInput);
    sanitizeInput(confirmPinInput);

    changePinForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      const currentPin = sanitizePin(currentPinInput?.value || '');
      const newPin = sanitizePin(newPinInput?.value || '');
      const confirmPin = sanitizePin(confirmPinInput?.value || '');

      const currentPinOk = await verifyPin(currentPin);
      if (!currentPinOk) {
        setChangeMessage('Nuvarande kod är fel.', true);
        return;
      }

      if (!/^\d{4}$/.test(newPin)) {
        setChangeMessage('Ny kod måste vara exakt 4 siffror.', true);
        return;
      }

      if (newPin !== confirmPin) {
        setChangeMessage('Ny kod och bekräftelse matchar inte.', true);
        return;
      }

      await savePin(newPin);
      localStorage.removeItem(REMEMBER_UNTIL_KEY);
      storeAudit('Kod bytt i föräldrainställningar');
      setChangeMessage('Kod uppdaterad. Nästa inloggning använder nya koden.');
      changePinForm.reset();
    });
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden && !dashboard.hidden) {
      localStorage.removeItem(REMEMBER_UNTIL_KEY);
      lockDashboard('Appen låstes automatiskt när den låg i bakgrunden.');
      storeAudit('Auto-lås vid bakgrundsläge');
    }
  });

  await migrateLegacyPinIfNeeded();

  if (checkTemporaryBlock()) return;

  if (isRemembered()) {
    unlockDashboard();
  } else {
    lockDashboard('Ange föräldrakod för att fortsätta.');
  }
})();
