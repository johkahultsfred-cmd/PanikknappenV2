# To-do / Funktionskarta för Panikknappen V2

Det här dokumentet samlar nuläget i en tydlig karta så vi kan jobba vidare utan kaos.

## 1) ✅ Funktioner som HAR funnits i kod

### 🧒 Barn-app: flytande overlay-knapp (flera versioner)

Har funnits i olika varianter (historiskt i projektet):
- Enkel overlay-version
- Aura/magisk version
- WebSocket-version kopplad till server
- Electron-overlay (desktop)

Funktioner som har funnits:
- Alltid överst (alwaysOnTop)
- Transparent bakgrund
- Ingen ram
- SkipTaskbar
- Ej fullscreenbar
- Klickbar overlay
- Dragbar knapp
- Begränsad till skärmkanter
- Touch + mus-stöd
- Offset-korrekt drag
- Text följer knappens position

### 🟢 Håll-in-aktivering

Har funnits:
- 3 sekunders håll (enkel version)
- 5 sekunders håll (WebSocket-version)
- Visuell nedräkning
- Animation under nedräkning
- Ljudsignal (beep)
- Sparkles-effekt
- Halo-effekt runt knapp
- Skak-animation
- Avbryts om man släpper
- Avbryts om man börjar dra

### 🟢 Låsning och tillstånd

Har funnits:
- `localStorage`-flagga (`panicActive`)
- Knapp blir låst efter aktivering
- Text ändras till "Hjälp är på väg ❤️"
- Visuell nedtoning (brightness-filter)
- Automatisk reset via server-polling

### 🟢 Serverkoppling (WebSocket) – stöd som funnits

Funktioner som har funnits i server/WS-versioner:
- WebSocket-anslutning
- Auto reconnect
- `PANIC`
- `COOLDOWN`
- `STATUS` broadcast
- `ALERT` broadcast
- `RESET` broadcast
- Incident-objekt med metadata (alias/offenderAlias/platform/ip m.m.)
- Screenshot-limit per minut
- Cooldown (15 sek)
- Låst tillstånd per barn
- Central state-hantering

### 🟢 Screenshot-hantering (serverstöd)

Funktioner som har funnits:
- `SCREENSHOT` via WebSocket
- Base64-lagring i state
- Max 40/minut
- Broadcast till föräldraklient

> Notering: Barn-appen skickar inte screenshot fullt ut i alla varianter.

### 🟢 Reset-system

Har funnits:
- `GET /reset-status`
- `POST /mark-reset`
- Polling från barn-app varannan sekund
- Återställning av knapp + rensning av `localStorage`

---

## 2) 🟡 Funktioner som DELVIS finns

| Funktion | Status |
| --- | --- |
| Screenshot från barn | Serverdel klar, barn-app ej komplett i alla versioner |
| Automatiskt blockera motpart | Metadata finns, global teknisk blockering ej klar |
| Automeddelande till motpart | Fält finns, inte kopplat till spel/API |
| Nätverkseffekt (riskzon) | Arkitektur möjlig, ej byggd |
| Test-läge | Inte implementerat |
| Föräldra-notiser (push) | Inte byggt (bara WebSocket idag) |

---

## 3) 🔵 Planerade men inte fullt implementerade

- Riktig OS-screenshot via Electron API
- Pushnotiser
- Riskzon-system mellan användare
- Permanent databas
- Autentisering
- Separat test-knapp (skilt från skarp panic)
- Logg-historik i UI
- Prenumerationssystem
- Juridisk metadata-säkring
- AI-riskanalys

---

## 4) 🧠 Arkitektur och tekniska komponenter

Nuvarande repo innehåller tydligt:
- Overlay-webbapp (`panik-overlay/apps/child/index.html`)
- Föräldra-UI (design/prototyp) (`panik-overlay/apps/family/index.html`)
- Electron-shell för overlay (`panik-overlay/main.js`, `panik-overlay/preload.js`)
- Portal-ingång (`panik-overlay/index.html`)

Serverkod för full WebSocket/incident/reset-flöde verkar inte ligga i denna uppladdade repo just nu.
Det betyder att serverdelen i denna karta ska ses som "finns i tidigare/annan version" tills filerna finns här.

---

## 5) Arbetsfokus framåt (enkel prioritering)

1. Få en stabil barn-app + deploy (publicering till webben) i nuvarande repo.
2. Lägga tillbaka eller koppla in serverkod i samma repo.
3. Koppla föräldra-UI till riktiga realtidsdata.
4. Bygga säkerhet (auth/databas/loggar) steg för steg.

---

## 6) Nästa konkreta steg

- Bekräfta om server-repot ska läggas in här eller köras separat.
- Om separat: dokumentera URL + API/WS-kontrakt i README.
- Om samma repo: lägg in servermapp och koppla barn/föräldraflöde end-to-end.
