# agents.md — PAN1K KnApPen!!!

Maskinläsbar kontext för AI-agenter (Codex, Cursor, Copilot, Claude, etc.).

---

## Projektöversikt

**Typ:** Statisk PWA (Progressive Web App), inga ramverk, ingen byggprocess  
**Syfte:** Mobilapp-UI profilväljare för barn/tonåringar med föräldrakontroll  
**Canvas:** 1080×1920 (9:16), skalas via CSS `aspect-ratio` till alla skärmar  
**Språk:** Svenska (sv)

---

## Filstruktur & ansvar

```
index.html          DOM-struktur, 4 skärmar, inga inline-scripts utöver SW-registrering
css/main.css        All styling — design-tokens, layout, animationer, skärmar
js/app.js           All logik — navigation, PIN, konfetti, profilval, canvas-animation
service-worker.js   Cache-first offline-strategi, precache vid install
manifest.json       PWA-metadata
assets/image*.png   Grafiska tillgångar (PNG, RGBA, extraherade från PPTX)
```

---

## Arkitekturmönster

### Skärmnavigation

Fyra `div.screen` med id `screen-home | screen-pin | screen-profile | screen-parental`.

```
screen-home ──[onclick showPin()]──► screen-pin ──[PIN korrekt]──► screen-parental
     │
     └──[onclick selectProfile(type)]──► screen-profile
```

**CSS-klasser som styr synlighet:**
- `.hidden` — translateY(100%), opacity 0, pointer-events none (slide in from below)
- `.slide-out-up` — translateY(-100%), opacity 0 (slide out upward)
- (ingen klass) — synlig

**JS API:**
```js
navigate(fromId, toId, { slideUp: false }) // intern
goHome()                                    // publik — alltid tillgänglig
showPin()                                   // publik — visar PIN-skärm
selectProfile('teen' | 'kid')               // publik — visar profil-skärm
```

### Layoutsystem

Alla element positioneras absolut i procent av 1080×1920:

```css
/* Formel (ex. element med left=298.5px i 1080px canvas): */
left: calc(298.5 / 1080 * 100%); /* = 27.64% */
top:  calc(515.4 / 1920 * 100%); /* = 26.84% */
```

Ursprungskoordinaterna kommer från PPTX EMU-systemet:
```
EMU → px: value / 914400 * 96
EMU i PPTX för x: relative to slide width  (10287000 EMU = 1080px)
EMU i PPTX för y: relative to slide height (18288000 EMU = 1920px)
```

### Typstorlekar

Används `cqh` / `cqw` (container query units) relativt `.scene`:

```css
font-size: 8.5cqh;  /* 8.5% av scene-höjden */
font-size: 6.5cqh;  /* etc. */
```

---

## State

All state är modul-scoped i `js/app.js`. Ingen extern lagring.

```js
let pinBuffer    = '';   // String, 0–4 siffror
let wrongTries   = 0;    // Number, ökar vid fel PIN
let currentScreen = 'screen-home'; // String, aktuell skärm-id
```

---

## Assets

| Fil | Storlek | Innehåll | Används av |
|---|---|---|---|
| `image1.png`  | 188KB | Regnbågsstripe (1268×149) | Top + bottom stripe, alla skärmar |
| `image2.png`  | 103KB | Lila pill-knapp (498×178) | Parental Access-knapp |
| `image3.png`  |  81KB | Föräldrakaraktär cirkel (265×272) | Parental char + PIN-header + parental-dash |
| `image4.png`  | 203KB | Grön KID-knapp (514×334) | KID-knapp |
| `image5.png`  |  60KB | KID-silhuett (218×360) | KID-karaktär |
| `image6.png`  |  86KB | Orange TEEN-knapp (356×224) | TEEN-knapp |
| `image7.png`  |  59KB | TEEN-silhuett (259×335) | TEEN-karaktär + profil-screen + parental-card |
| `image8.png`  |  15KB | Status notch/separator (653×46) | Notch + separator-linje |
| `image9.png`  |  71KB | Teal header-bakgrund (853×193) | Header base + profil-screen header |
| `image10.png` | 194KB | Colorful blob-overlay (2134×750) | Header overlay (118% bredd, clip via overflow) |
| `image11.png` | ~200KB | Panik-karaktär (1213×1066, fixed) | Top-left hero |

**OBS:** `image11.png` har modifierats — övre 160px transparenta (Canva-artefakt "ICONS" borttagen).

---

## Konfetti-system

`initConfetti(containerId, count)` skapar `<div>`-element med CSS-animationer:

- **Former:** `pill-h`, `pill-v`, `dot`, `square`
- **Färger:** `#FC7107 #16B7C9 #C3DB33 #8B2FC9 #FCD30B #E63B1F #FC81CF #ffffff`
- **Animationer:** `fall` (vertikal, linjär, loop) + `wobble` (horisontell sinusvåg)
- **Enheter:** `cqw` / `cqh` — skalrar med canvas

Celebration burst vid profilval sker via Canvas 2D API i `launchCelebration(color)`.

---

## Utbyggnadspunkter

### Lägg till profil
```js
// js/app.js — PROFILES-objektet
PROFILES['junior'] = {
  label:       'JUNIOR',
  sub:         'Profil 3 · Aktiv',
  accentColor: '#8B2FC9',
  ringColor:   '#8B2FC9',
  badgeBg:     '#8B2FC9',
  charSelector: '.anim-junior .char img',
};
```

```html
<!-- index.html — ny knappgrupp i screen-home -->
<div class="anim-junior" style="...">
  <div class="btn-wrap" onclick="selectProfile('junior')">
    <img src="assets/image-junior-btn.png" alt="JUNIOR">
  </div>
</div>
```

### Persistent PIN (localStorage)
```js
// Ersätt konstanten med:
const CORRECT_PIN = localStorage.getItem('parentPin') ?? '1234';

// Spara ny PIN:
localStorage.setItem('parentPin', newPin);
```

### Ändra PIN via UI
Implementera en ny skärm `screen-change-pin` med dubbel PIN-verifikation. Länka från "Ändra PIN-kod"-raden i parental dashboard.

### Analytics/telemetri
`selectProfile()` och `showPin()` är centrala hooks — lägg in tracking-anrop där.

---

## Kodkonventioner

- `'use strict'` i app.js
- Inga globala variabler utom de som exponeras via `Object.assign(window, {...})`
- `const` > `let`, aldrig `var`
- Funktioner namnges med camelCase verbform: `selectProfile`, `showPin`, `goHome`
- CSS-klasser: kebab-case, BEM-inspirerat (`.profile-card`, `.profile-card-name`)
- Inga kommentarer på rad, bara block-kommentarer för sektioner

---

## Testning

Ingen testsvit är inkluderad. För manuell testning:

1. Starta lokal server: `python3 -m http.server 8080`
2. Öppna `http://localhost:8080` i Chrome DevTools med device emulation (9:16)
3. Flöde: Hem → TEEN/KID → Profil aktiv → Tillbaka → Parental Access → PIN `1234` → Dashboard

**Snapshot-test med Playwright:**
```js
const { chromium } = require('playwright');
const browser = await chromium.launch();
const page = await browser.newPage();
await page.setViewportSize({ width: 432, height: 768 });
await page.goto('http://localhost:8080');
await page.screenshot({ path: 'snapshot-home.png' });
```
