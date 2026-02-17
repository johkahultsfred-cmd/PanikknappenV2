# Panikknappen V2 – noob-vänlig projektguide

Det här dokumentet är skrivet för dig som vill **bygga, testa och publicera appen snabbt** utan att vara kodexpert.

---

## 1) Projektöversikt

**Idé:** En flytande panikknapp-overlay som kan dras runt på skärmen och triggas med långt tryck.

**Kodplats:**
- Appfiler: `panik-overlay/`
- Huvudsida: `panik-overlay/index.html`
- Electron-fil (lokal desktop-körning): `panik-overlay/main.js`

---

## 2) Statuslogg (levande arbetsyta)

> Uppdatera den här sektionen varje gång du/agenten gör ändringar.

### Tidigare utförda aktiviteter
- Grundstruktur för overlay finns.
- Interaktion för drag + långtryck finns i `index.html`.

### Föreslagna nästa aktiviteter
1. Rensa bort gamla/överlappande filer (`style.css`, `script.js`) om de inte används.
2. Välj primär körmodell:
   - Endast webb (rekommenderat först), eller
   - Electron desktop-app.
3. Sätt upp automatisk deploy till Netlify.

### Pågående aktivitet (nu)
- Dokumentation och workflow-optimering för enkel utveckling + deploy.

### Kvar att göra
- Koppla egen Netlify-site till repo.
- Lägga till enkel validering/check-script i `package.json`.
- Publicera första live-version och verifiera länk.

---

## 3) Snabbstart lokalt (exakt steg-för-steg)

Kör dessa kommandon i terminalen från repo-roten (`/workspace/PanikknappenV2`):

```bash
cd /workspace/PanikknappenV2
npx --yes serve panik-overlay -l 4173
```

Öppna sedan i browser:
- `http://localhost:4173`

Stoppa servern:
- `Ctrl + C`

---

## 4) Netlify Deploy – enkel och pålitlig väg

Mål: få en **publik URL** för preview/test.

### 4.1 Förberedelser (en gång)
1. Skapa konto på Netlify.
2. Installera CLI globalt:

```bash
npm install -g netlify-cli
```

3. Logga in:

```bash
netlify login
```

### 4.2 Deploy direkt från denna mapp

Kör från repo-roten:

```bash
cd /workspace/PanikknappenV2
netlify deploy --dir=panik-overlay
```

När du är nöjd, publicera till produktion:

```bash
netlify deploy --prod --dir=panik-overlay
```

Netlify visar din live-länk i terminalen, t.ex.:
- `https://din-site.netlify.app`

> Tips: Spara länken direkt under sektion **6) Live-länk**.

---

## 5) Verifiering/checklista efter deploy

Efter deploy ska du alltid kontrollera:

1. Sidan öppnas utan fel.
2. Knappen syns.
3. Knappen går att dra.
4. Långtryck ändrar status visuellt.
5. Testa i mobilvy (browser devtools).

---

## 6) Live-länk (fyll i efter deploy)

- Production URL: `EJ SATT ÄNNU`
- Senast verifierad: `EJ SATT ÄNNU`
- Verifierad av: `EJ SATT ÄNNU`

---

## 7) Noob-guide: hur du jobbar med mig (AI-agenten)

När du vill fortsätta, skriv t.ex.:

- "Deploya senaste versionen till Netlify och ge mig länken."
- "Gör UI snyggare men behåll enkelheten."
- "Lägg till 10-sekunders nedräkning före panik triggas."
- "Skapa en checklista jag kan följa innan release."

Jag gör då:
1. Kodändringar.
2. Kör tester/checkar.
3. Förklarar exakt vad som gjorts.
4. Ger dig copy/paste-kommandon.

---

## 8) Workflow-standard (rekommenderad)

1. **Planera mini-ändring** (1 feature åt gången).
2. **Implementera**.
3. **Verifiera lokalt**.
4. **Commit med tydlig text**.
5. **Deploy preview/production**.
6. **Dokumentera status i denna README**.

Detta gör att du alltid vet:
- vad som gjorts,
- vad som kör just nu,
- vad nästa steg är.
