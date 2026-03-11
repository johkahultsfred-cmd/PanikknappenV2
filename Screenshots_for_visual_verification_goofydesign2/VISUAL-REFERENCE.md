# VISUAL-REFERENCE.md — PAN1K KnApPen!!!

Pixel-exakta skärmdumpar för verifiering av bygget.  
Fångade vid viewport **432×768px** (9:16), servade via lokal HTTP.  
Referensupplösning för designsystemet: **1080×1920px**.

---

## Skärmdumpar

Alla filer finns i `screenshots/`.

| Fil | Skärm | Tillstånd |
|---|---|---|
| `01-home.png`               | Profilväljare | Normal (animationer klara) |
| `02-home-teen-hover.png`    | Profilväljare | TEEN-knapp hover — scale(1.04) |
| `03-pin-empty.png`          | PIN-pad | Tom, 0 siffror |
| `04-pin-partial.png`        | PIN-pad | 2 siffror ifyllda (dots fyllda) |
| `05-pin-error.png`          | PIN-pad | Fel PIN — felmeddelande synligt |
| `06-parental-dashboard.png` | Föräldrakontroll | Alla toggle ON |
| `07-parental-toggle.png`    | Föräldrakontroll | "Daglig tidsgräns" toggle OFF |
| `08-profile-teen.png`       | TEEN aktiv | Konfetti-burst färdig |
| `09-profile-kid.png`        | KID aktiv | Konfetti-burst färdig |
| `10-home-1080x1920.png`     | Profilväljare | Full 1080×1920 designupplösning |

---

## Kritiska visuella checkpoints

### Skärm 1 — Profilväljare (`screen-home`)

- **Header:** Teal bakgrund (#16B7C9) täcker ~19.9% av höjden
- **Rainbow stripe:** 6.6% hög, överst och underst, färger vänster→höger: teal, grön, gul, orange, röd-orange, röd, teal, lila
- **PAN1K:** Vit Fredoka One, övre vänster i header, svart text-shadow
- **KnApPen!!!:** Orange (#FC7107), under PAN1K, med svart shadow
- **Panik-karaktär:** Övre vänster, delvis utanför canvas (avsiktligt)
- **TEEN-knapp:** Orange blob, ~27% från vänster, ~27% från topp, täcker ~81% av bredden
- **TEEN-silhuett:** Glad springande figur, vänster om knappen
- **KID-knapp:** Grön blob, ~28% från vänster, ~54% från topp
- **KID-silhuett:** Figur med orange keps, vänster om knappen
- **Parental Access:** Lila pill-knapp, ~41% från vänster, ~81% från topp
- **Föräldrakaraktär:** Lila cirkel med förälder+baby, vänster om pill
- **Konfetti:** Pill/dot-formade bitar i orange/teal/grön/lila/gul, faller kontinuerligt

### Skärm 2 — PIN-pad (`screen-pin`)

- **Header:** Lila (#8B2FC9), "Föräldraåtkomst", ← tillbaka-knapp
- **4 dots:** Cirklar med lila border, fylls lila vid inmatning
- **Knappar:** 3×4 grid, runda (#F0EDE8), OK-knapp lila, ⌫ orange
- **Fel-animation:** Röd text "Fel PIN-kod", dots skakar horisontellt
- **Hint:** Syns efter 2 fel: "Tips: PIN är 1234"

### Skärm 3 — Profil aktiv (`screen-profile`)

- **TEEN:** Orange accent (#FC7107), orange badge, orange pulsring
- **KID:** Grön accent (#7a9a00 text, #C3DB33 ring/badge)
- **Karaktär:** Sitter i oval bakgrundsfärg (~15% opacity), pulsande ring
- **Konfetti-burst:** Exploderar från mitten vid öppning, 80 partiklar, ~3 sek

### Skärm 4 — Föräldrakontroll (`screen-parental`)

- **Header:** Lila, "Föräldrakontroll"
- **Profil-kort:** TEEN (orange border) + KID (grön border), med silhuett-ikon
- **Toggle ON:** Lila background, knapp höger
- **Toggle OFF:** Grå background, knapp vänster
- **Rader:** Daglig tidsgräns / Aviseringar / Innehållsfilter / Ändra PIN-kod

---

## Animationsbeteenden

| Element | Animation | Timing |
|---|---|---|
| Header + texter | `dropIn` — faller in uppifrån med lätt rotation | 0.7s, delay 0.1s |
| TEEN-grupp | `bounceIn` — studsar in med overshoot | 0.65s, delay 0.25s |
| KID-grupp | `bounceIn` | 0.65s, delay 0.40s |
| Parental-grupp | `bounceIn` | 0.65s, delay 0.55s |
| Panik-karaktär | `bob` — flytande upp/ned med rotation | 2.8s loop |
| TEEN-silhuett | `bob` | 3.2s loop |
| KID-silhuett | `bob` | 3.8s loop, delay 0.6s |
| Föräldrakaraktär | `bob` | 2.5s loop, delay 1.1s |
| Konfetti | `fall` + `wobble` | 4–8s loop, staggerat |
| PIN dots | `shake` vid fel | 0.4s engångskörning |
| Pulsring (profil) | `pulse-ring` — expanderar + tonar bort | 1.8s loop |
| Konfetti burst | Canvas 2D, 80 partiklar | ~3s, triggas vid profilval |

---

## Skärmövergångar

```
Från          →  Till              CSS
─────────────────────────────────────────────────────
screen-home   →  screen-pin        translateY(100%→0)   slide up
screen-home   →  screen-profile    translateY(-100%←0)  slide out up
screen-pin    →  screen-parental   translateY(100%→0)   slide up
any           →  screen-home       reverse slide
```

Transition-tid: **0.45s** `cubic-bezier(.77, 0, .18, 1)`

---

## Typografi

| Text | Font | Storlek | Färg |
|---|---|---|---|
| PAN1K | Fredoka One | 8.5cqh | Vit + svart shadow |
| KnApPen!!! | Fredoka One | 6.5cqh | #FC7107 |
| PIN-label | Nunito 800 | 3.2cqw | #555 |
| PIN-knappar | Fredoka One | 6cqw | #333 |
| Sektionsrubriker | Nunito 900 | 3cqw | #999 |
| Profil-namn (stor) | Fredoka One | 8cqw | Accent-färg |
| "PROFIL 1 · AKTIV" | Nunito 700 | 3cqw | #888 |

---

## Om verifiering misslyckas

Vanliga orsaker om bygget ser fel ut:

1. **Positioner förskjutna** → Kontrollera att `.scene` har `container-type: size` och `aspect-ratio: 9/16`
2. **Bilder saknas** → Verifiera att `assets/`-mappen finns relativt `index.html`
3. **Font laddar inte** → Google Fonts kräver internetanslutning vid första load; service workern cachar sedan
4. **Konfetti syns inte** → Kontrollera att `js/app.js` är laddat och `DOMContentLoaded` triggar `initConfetti()`
5. **Animationer saknas** → Kräver CSS Container Queries (`container-type: size`) — Chrome 105+, Safari 16+, Firefox 110+
6. **Service worker-fel** → SW registreras inte på `file://` — kör via HTTP-server
