/**
 * PAN1K KnApPen!!! — app.js
 * Handles: confetti, navigation, PIN, profile selection, celebration burst.
 *
 * Architecture: single-page, 4 screens, no framework, no build step.
 * All state lives in module-scoped variables — no localStorage (privacy).
 */

'use strict';

/* ═══════════════════════════════════════════════════════════════
   CONSTANTS
═══════════════════════════════════════════════════════════════ */
const CORRECT_PIN = '1234';

const CANDY_COLORS = [
  '#FC7107', // orange
  '#16B7C9', // teal
  '#C3DB33', // green
  '#8B2FC9', // purple
  '#FCD30B', // yellow
  '#E63B1F', // red
  '#FC81CF', // pink
  '#ffffff',  // white
];

const CANDY_SHAPES = ['pill-h', 'pill-v', 'dot', 'square'];

const PROFILES = {
  teen: {
    label:      'TEEN',
    sub:        'Profil 1 · Aktiv',
    accentColor: '#FC7107',
    ringColor:   '#FC7107',
    badgeBg:     '#FC7107',
    charSelector: '.anim-teen .char img',
  },
  kid: {
    label:      'KID',
    sub:        'Profil 2 · Aktiv',
    accentColor: '#7a9a00',
    ringColor:   '#C3DB33',
    badgeBg:     '#C3DB33',
    charSelector: '.anim-kid .char img',
  },
};

/* ═══════════════════════════════════════════════════════════════
   STATE
═══════════════════════════════════════════════════════════════ */
let pinBuffer  = '';
let wrongTries = 0;
let currentScreen = 'screen-home';

/* ═══════════════════════════════════════════════════════════════
   CONFETTI
═══════════════════════════════════════════════════════════════ */
function createCandy(container) {
  const el      = document.createElement('div');
  const color   = CANDY_COLORS[Math.floor(Math.random() * CANDY_COLORS.length)];
  const shape   = CANDY_SHAPES[Math.floor(Math.random() * CANDY_SHAPES.length)];
  const size    = (Math.random() * 0.7 + 0.4);
  const left    = Math.random() * 100;
  const delay   = Math.random() * 6;
  const dur     = Math.random() * 4 + 4;
  const wobDur  = Math.random() * 1.5 + 1.5;
  const wobX    = (Math.random() * 2 - 1).toFixed(1);
  const r0      = Math.floor(Math.random() * 360);
  const r1      = r0 + Math.floor(Math.random() * 720 - 360);

  el.style.cssText = [
    `position:absolute`,
    `left:${left}%`,
    `top:${-(size + 1)}cqw`,
    `background:${color}`,
    `--r0:${r0}deg`,
    `--r1:${r1}deg`,
    `--sx:1`,
    `--wx:${wobX}cqw`,
    `animation:fall ${dur}s ${delay}s linear infinite,wobble ${wobDur}s ${delay}s ease-in-out infinite`,
  ].join(';');

  switch (shape) {
    case 'pill-h':
      el.style.width = `${size * 2.2}cqw`; el.style.height = `${size}cqw`;
      el.style.borderRadius = '50px'; break;
    case 'pill-v':
      el.style.width = `${size}cqw`; el.style.height = `${size * 2.2}cqw`;
      el.style.borderRadius = '50px'; break;
    case 'dot':
      el.style.width = `${size * 0.9}cqw`; el.style.height = `${size * 0.9}cqw`;
      el.style.borderRadius = '50%'; break;
    case 'square':
      el.style.width = `${size}cqw`; el.style.height = `${size}cqw`;
      el.style.borderRadius = '2px'; break;
  }

  container.appendChild(el);
}

function initConfetti(containerId, count = 32) {
  const container = document.getElementById(containerId);
  if (!container) return;
  for (let i = 0; i < count; i++) createCandy(container);
}

/* ═══════════════════════════════════════════════════════════════
   NAVIGATION
═══════════════════════════════════════════════════════════════ */
function navigate(fromId, toId, opts = {}) {
  const fromEl = document.getElementById(fromId);
  const toEl   = document.getElementById(toId);
  if (!fromEl || !toEl) return;
  fromEl.classList.add(opts.slideUp ? 'slide-out-up' : 'hidden');
  toEl.classList.remove('hidden', 'slide-out-up');
  currentScreen = toId;
}

function goHome() {
  const curEl  = document.getElementById(currentScreen);
  const homeEl = document.getElementById('screen-home');
  if (curEl)  curEl.classList.add('hidden');
  if (homeEl) homeEl.classList.remove('hidden', 'slide-out-up');
  currentScreen = 'screen-home';
}

/* ═══════════════════════════════════════════════════════════════
   PIN
═══════════════════════════════════════════════════════════════ */
function updatePinDots() {
  document.getElementById('pin-error')?.classList.remove('visible');
  for (let i = 0; i < 4; i++) {
    document.getElementById(`pd${i}`)?.classList.toggle('filled', i < pinBuffer.length);
  }
}

function pinPress(key) {
  if (key === 'del') {
    pinBuffer = pinBuffer.slice(0, -1);
    updatePinDots();
    return;
  }

  if (key === 'ok') {
    if (pinBuffer === CORRECT_PIN) {
      // Correct — go to parental dashboard
      navigate('screen-pin', 'screen-parental');
      pinBuffer  = '';
      wrongTries = 0;
      setTimeout(updatePinDots, 400);
      const hint = document.getElementById('pin-hint');
      if (hint) hint.style.display = 'none';
      document.getElementById('pin-error')?.classList.remove('visible');
    } else {
      // Wrong
      wrongTries++;
      const dots = document.getElementById('pin-dots');
      dots?.classList.add('error');
      document.getElementById('pin-error')?.classList.add('visible');
      setTimeout(() => dots?.classList.remove('error'), 500);
      pinBuffer = '';
      updatePinDots();
      if (wrongTries >= 2) {
        const hint = document.getElementById('pin-hint');
        if (hint) hint.style.display = 'block';
      }
    }
    return;
  }

  if (pinBuffer.length < 4) {
    pinBuffer += key;
    updatePinDots();
    if (pinBuffer.length === 4) setTimeout(() => pinPress('ok'), 200);
  }
}

function showPin() {
  pinBuffer = '';
  updatePinDots();
  navigate('screen-home', 'screen-pin');
}

/* ═══════════════════════════════════════════════════════════════
   PROFILE SELECTION
═══════════════════════════════════════════════════════════════ */
function selectProfile(type) {
  const p = PROFILES[type];
  if (!p) return;

  // Update profile screen elements
  const nameEl  = document.getElementById('profile-name');
  const tagEl   = document.getElementById('profile-tag');
  const bgEl    = document.getElementById('profile-char-bg');
  const ringEl  = document.getElementById('profile-ring');
  const badgeEl = document.getElementById('profile-badge');
  const charEl  = document.getElementById('profile-char-img');
  const subEl   = document.getElementById('profile-sub');

  if (nameEl)  { nameEl.textContent = p.label; nameEl.style.color = p.accentColor; }
  if (tagEl)   tagEl.textContent = p.label;
  if (bgEl)    bgEl.style.background = p.ringColor;
  if (ringEl)  ringEl.style.borderColor = p.ringColor;
  if (badgeEl) badgeEl.style.background = p.badgeBg;
  if (subEl)   subEl.textContent = p.sub;

  // Copy character image src from home screen
  const srcEl = document.querySelector(`#screen-home ${p.charSelector}`);
  if (srcEl && charEl) charEl.src = srcEl.src;

  navigate('screen-home', 'screen-profile', { slideUp: true });
  setTimeout(() => launchCelebration(p.ringColor), 300);
}

/* ═══════════════════════════════════════════════════════════════
   CELEBRATION CONFETTI BURST (canvas)
═══════════════════════════════════════════════════════════════ */
function launchCelebration(accentColor) {
  const canvas = document.getElementById('celebrate-canvas');
  const scene  = canvas?.closest('.scene');
  if (!canvas || !scene) return;

  canvas.width  = scene.clientWidth;
  canvas.height = scene.clientHeight;
  const ctx = canvas.getContext('2d');

  const colors = [accentColor, '#FC7107', '#16B7C9', '#FCD30B', '#8B2FC9', '#ffffff'];
  const cx = canvas.width / 2;
  const cy = canvas.height * 0.42;

  const particles = Array.from({ length: 80 }, () => {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 8 + 4;
    return {
      x: cx, y: cy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - Math.random() * 4,
      color:   colors[Math.floor(Math.random() * colors.length)],
      size:    Math.random() * 6 + 2,
      gravity: 0.25,
      alpha:   1,
      rot:     Math.random() * 360,
      rotV:    Math.random() * 8 - 4,
      type:    Math.random() > 0.5 ? 'rect' : 'circle',
      w:       Math.random() * 8 + 3,
      h:       Math.random() * 4 + 2,
    };
  });

  let rafId;
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = 0;
    for (const p of particles) {
      if (p.alpha <= 0) continue;
      alive++;
      p.x += p.vx; p.y += p.vy; p.vy += p.gravity;
      p.vx *= 0.99; p.rot += p.rotV;
      p.alpha = Math.max(0, p.alpha - 0.012);
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle   = p.color;
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rot * Math.PI) / 180);
      if (p.type === 'circle') {
        ctx.beginPath();
        ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      }
      ctx.restore();
    }
    if (alive > 0) rafId = requestAnimationFrame(draw);
  }

  draw();
  setTimeout(() => {
    cancelAnimationFrame(rafId);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }, 3000);
}

/* ═══════════════════════════════════════════════════════════════
   PARENTAL TOGGLES
═══════════════════════════════════════════════════════════════ */
function toggleSwitch(id) {
  document.getElementById(id)?.classList.toggle('on');
}

/* ═══════════════════════════════════════════════════════════════
   INIT
═══════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  initConfetti('confetti-home', 32);
});

/* ── Expose to inline onclick handlers ── */
Object.assign(window, {
  showPin,
  goHome,
  pinPress,
  selectProfile,
  toggleSwitch,
});
