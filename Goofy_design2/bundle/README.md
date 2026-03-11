# PAN1K KnApPen!!!

En mobilapp-inspirerad profilväljare för barn och tonåringar, byggd som en progressiv webbapp (PWA). Designen är pixel-for-pixel rekonstruerad från originaldesignen i PPTX/WebP-format.

---

> ⚠️ **Obs:** `assets/*.png` ligger inte i git i denna branch för att undvika PR-larm om binärfiler.
> Kör kommandot nedan i repo-roten om du vill återskapa bilderna lokalt:
>
> ```bash
> unzip -o Goofy_design2.zip "bundle/assets/*" -d Goofy_design2
> ```

## Skärmar

| Skärm | Beskrivning |
|---|---|
| **Profilväljare** | Startsida med TEEN, KID och Föräldraåtkomst |
| **PIN-pad** | 4-siffrig PIN för föräldraåtkomst (standard: `1234`) |
| **Profil aktiv** | Bekräftelseskärm med konfetti-animation |
| **Föräldrakontroll** | Dashboard med profilkort och inställningstoglar |

---

## Projektstruktur

```
panik-knappen/
├── index.html            # App-skal, fyra skärmar
├── manifest.json         # PWA-manifest
├── service-worker.js     # Offline-cache (cache-first)
├── css/
│   └── main.css          # Komplett design-system
├── js/
│   └── app.js            # All interaktionslogik
└── assets/
    ├── image1.png        # Regnbågsstripe (top + bottom)
    ├── image2.png        # Parental Access-pill (lila)
    ├── image3.png        # Föräldrakaraktär (cirkel)
    ├── image4.png        # KID-knapp (grön)
    ├── image5.png        # KID-silhuett
    ├── image6.png        # TEEN-knapp (orange)
    ├── image7.png        # TEEN-silhuett
    ├── image8.png        # Status-notch / separator
    ├── image9.png        # Teal header-bakgrund
    ├── image10.png       # Header blob-overlay
    └── image11.png       # Panik-karaktär (toppvänster)
```

---

## Deploy

### Statisk hosting (rekommenderat)

Fungerar direkt på alla statiska hostingtjänster:

```bash
# Vercel
npx vercel --prod

# Netlify
npx netlify deploy --prod --dir .

# GitHub Pages
# Push till gh-pages branch, aktivera i repo-inställningar
```

### Lokal server (för PWA + service worker)

Service workern kräver HTTPS eller `localhost`. Öppna **inte** direkt via `file://`.

```bash
# Python 3
python3 -m http.server 8080

# Node.js (npx)
npx serve .

# PHP
php -S localhost:8080
```

Besök sedan `http://localhost:8080`.

### Docker (enkel statisk server)

```dockerfile
FROM nginx:alpine
COPY . /usr/share/nginx/html
EXPOSE 80
```

```bash
docker build -t panik-knappen .
docker run -p 8080:80 panik-knappen
```

---

## Design-system

Alla mått är i **container query units** (`cqw` / `cqh`) relativt en `1080×1920` canvas, skalad med `aspect-ratio: 9/16`. Det innebär att layouten är identisk på alla skärmstorlekar.

### Färgpaletten

| Token | Hex | Användning |
|---|---|---|
| `--color-orange`  | `#FC7107` | TEEN-knapp, KnApPen-text |
| `--color-teal`    | `#16B7C9` | Header-bakgrund |
| `--color-green`   | `#C3DB33` | KID-knapp |
| `--color-purple`  | `#8B2FC9` | Parental Access, PIN-skärm |
| `--color-yellow`  | `#FCD30B` | Konfetti |
| `--color-red`     | `#E63B1F` | Konfetti |
| `--color-bg`      | `#FFFCF7` | App-bakgrund (off-white) |

### Typsnitt

- **Display:** Fredoka One (Google Fonts)
- **Body/UI:** Nunito 700/800/900 (Google Fonts)

---

## Konfiguration

### Ändra PIN-koden

I `js/app.js`, rad 1 i konstantblocket:

```js
const CORRECT_PIN = '1234'; // ← Ändra här
```

### Lägg till en profil

1. Lägg till ett objekt i `PROFILES` i `js/app.js`
2. Skapa en knapp i `index.html` med `onclick="selectProfile('nytt-id')"`
3. Lägg till assets i `assets/`

### Uppdatera service worker-cache

Vid ny deploy — bumpa versionen i `service-worker.js`:

```js
const CACHE_VERSION = 'panik-v1.0.1'; // ← Bumpa
```

---

## Teknisk stack

- **Inga ramverk** — ren HTML5, CSS3, ES2020
- **Inga beroenden** — inga `node_modules`, ingen byggprocess
- **PWA** — installationsbar, fungerar offline
- **Container Queries** — responsiv utan media queries
- **CSS Custom Properties** — design-tokens direkt i CSS
- **Canvas API** — konfetti-burst vid profilval

---

## Browser-stöd

| Browser | Version | Status |
|---|---|---|
| Chrome / Edge | 105+ | ✅ Fullt stöd |
| Safari / iOS  | 16+  | ✅ Fullt stöd |
| Firefox       | 110+ | ✅ Fullt stöd |
| Samsung Internet | 20+ | ✅ Fullt stöd |

Kräver stöd för CSS Container Queries (`container-type: size`).

---

## Ursprung

Designen är extraherad och rekonstruerad från originalfiler i PPTX-format. Alla 11 PNG-assets extraherades direkt ur PPTX-arkivet (zip), och positionerna beräknades från EMU-koordinater (English Metric Units) till procent av 1080×1920-canvasen.
