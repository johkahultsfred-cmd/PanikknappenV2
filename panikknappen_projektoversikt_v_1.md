# 👑 Panikknappen / Guardian Bubble – Projektöversikt

## 🎯 Vision
Skapa en familjeanpassad säkerhets‑overlay för barn som spelar online.
Systemet fungerar som en "AZ Screen Recorder – fast för trygghet".

Målet är en flytande, inställningsbar bubbla som:
- Ligger ovanpå spel
- Är diskret men alltid tillgänglig
- Kan expandera till meny
- Har panikfunktion med nedräkning
- Skickar larm till föräldra‑app via server

---

# 🧱 Nuvarande Status

## ✅ Electron Overlay
- Transparent
- Frameless
- AlwaysOnTop
- Stabil start via npm
- Preload korrekt kopplad

## ✅ WebSocket‑koppling
- Barn registrerar sig via REGISTER
- PANIC skickas till server
- Screenshot skickas (via preload bridge)

## ✅ PANIC‑flöde
- 5 sekunders hålltid
- Nedräkning
- Visuell laddning
- Skickar:
  - childId
  - alias
  - plattform
  - offenderAlias
  - autoMessage
  - blocked = true

## ✅ Safe‑Mode UI
Visar lugnande text:
"Du är en hjälte ❤️"

---

# 🫧 Guardian Bubble v2 – Ny Riktning

Overlay utvecklas till ett komplett system:

## 1️⃣ Flyttbar bubbla
- Dragbar
- Sparar position (localStorage)
- Återställs vid omstart

## 2️⃣ Expand‑läge
Planerad funktion:
- 🔴 Panik
- 🧪 Test
- 💬 Kontakta vuxen
- ⚙️ Inställningar

## 3️⃣ Inställningssystem
Planerade inställningar:
- Storlek
- Färg
- Transparens
- Aura på/av
- Ljud på/av
- Hålltid (3–5 sek)
- Auto‑block på/av
- Auto‑meddelande text

## 4️⃣ Föräldra‑app
- Tar emot ALERT
- Visar incident
- Kan markera åtgärdad
- Sparar historik

---

# 🔧 Tekniska Lärdomar

- main.js får inte innehålla DOM‑kod
- Drag fungerar endast med position:absolute
- transform: translate bryter drag
- frame:false kräver egen drag‑logik
- localStorage fungerar för overlay‑state

---

# 📦 Export
Electron‑projektet har exporterats till ZIP.

---

# 🚀 Nästa Steg

Prioriteringsordning:
1. Förfina drag + snap‑to‑edge
2. Bygga expand‑meny runt bubblan
3. Implementera inställningspanel
4. Synka inställningar med server
5. Förbered produktionsbuild

---

# 👑 Projektets Identitet

Detta är inte längre en knapp.
Det är ett familjesäkerhetssystem.

Guardian Bubble – Version 2.0

Utvecklas vidare.

