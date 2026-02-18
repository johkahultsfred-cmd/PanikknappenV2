(() => {
  const DEFAULT_PIN = '1234';
  const PIN_KEY = 'familyPinCode';
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

  const getStoredPin = () => {
    const storedPin = localStorage.getItem(PIN_KEY);
    if (storedPin && /^\d{4}$/.test(storedPin)) {
      return storedPin;
    }
    localStorage.setItem(PIN_KEY, DEFAULT_PIN);
    return DEFAULT_PIN;
  };

  const setLockMessage = (text, isError = false) => {
    lockMessage.textContent = text;
    lockMessage.classList.toggle('error', isError);
  };

  const setChangeMessage = (text, isError = false) => {
    if (!changePinMessage) return;
    changePinMessage.textContent = text;
    changePinMessage.classList.toggle('error', isError);
  };

  const toNumber = (value) => Number.parseInt(value || '0', 10) || 0;

  const getLockUntil = () => toNumber(localStorage.getItem(LOCK_UNTIL_KEY));

  const getFailedAttempts = () => toNumber(localStorage.getItem(FAILED_KEY));

  const storeAudit = (message) => {
    const current = JSON.parse(localStorage.getItem(AUDIT_KEY) || '[]');
    current.unshift({
      at: new Date().toISOString(),
      message
    });
    localStorage.setItem(AUDIT_KEY, JSON.stringify(current.slice(0, 30)));
  };

  const isRemembered = () => {
    const rememberUntil = toNumber(localStorage.getItem(REMEMBER_UNTIL_KEY));
    return Date.now() < rememberUntil;
  };

  const unlockDashboard = () => {
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

  const getRemainingLockSeconds = () => {
    const lockUntil = getLockUntil();
    return Math.max(0, Math.ceil((lockUntil - Date.now()) / 1000));
  };

  const checkTemporaryBlock = () => {
    const remaining = getRemainingLockSeconds();
    if (remaining > 0) {
      setLockMessage(`För många fel. Vänta ${remaining} sek och försök igen.`, true);
      return true;
    }
    return false;
  };

  pinInput.addEventListener('input', () => {
    pinInput.value = sanitizePin(pinInput.value);
  });

  pinForm.addEventListener('submit', (event) => {
    event.preventDefault();

    if (checkTemporaryBlock()) {
      return;
    }

    const enteredPin = sanitizePin(pinInput.value);
    const expectedPin = getStoredPin();

    if (enteredPin.length < 4) {
      setLockMessage('Koden behöver 4 siffror.', true);
      return;
    }

    if (enteredPin !== expectedPin) {
      const attempts = getFailedAttempts() + 1;
      localStorage.setItem(FAILED_KEY, String(attempts));
      storeAudit(`Misslyckad inloggning (${attempts})`);

      if (attempts >= 3) {
        const lockUntil = Date.now() + 30_000;
        localStorage.setItem(LOCK_UNTIL_KEY, String(lockUntil));
        localStorage.setItem(FAILED_KEY, '0');
      }

      pinInput.value = '';
      if (checkTemporaryBlock()) {
        return;
      }

      setLockMessage('Fel kod. Försök igen.', true);
      return;
    }

    localStorage.setItem(FAILED_KEY, '0');
    localStorage.removeItem(LOCK_UNTIL_KEY);

    if (rememberDevice && rememberDevice.checked) {
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
    changePinForm.addEventListener('submit', (event) => {
      event.preventDefault();

      const currentPin = sanitizePin(document.querySelector('#current-pin')?.value || '');
      const newPin = sanitizePin(document.querySelector('#new-pin')?.value || '');
      const confirmPin = sanitizePin(document.querySelector('#confirm-pin')?.value || '');

      if (currentPin !== getStoredPin()) {
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

      localStorage.setItem(PIN_KEY, newPin);
      localStorage.removeItem(REMEMBER_UNTIL_KEY);
      storeAudit('Kod bytt i föräldrainställningar');
      setChangeMessage('Kod uppdaterad. Nästa inloggning använder nya koden.');
      changePinForm.reset();
    });
  }

  if (isRemembered()) {
    unlockDashboard();
  } else {
    lockDashboard('Ange föräldrakod för att fortsätta.');
  }
})();
