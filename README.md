# Panikknappen V2 – noob-vänlig projektguide

Det här dokumentet är skrivet för dig som vill **bygga, testa och publicera appen snabbt** utan att vara kodexpert.

---

## 1) Projektöversikt

**Idé:** En flytande panikknapp-overlay som kan dras runt på skärmen och triggas med långt tryck.

**Kodplats:**
- Appportal (ingång): `panik-overlay/index.html`
- Barnapp: `panik-overlay/apps/child/`
- Familjeapp (designförslag): `panik-overlay/apps/family/`
- Electron-fil (lokal desktop-körning): `panik-overlay/main.js`

---

## 2) Statuslogg (levande arbetsyta)

> Uppdatera den här sektionen varje gång du/agenten gör ändringar.

### Tidigare utförda aktiviteter
- Grundstruktur för overlay finns.
- Interaktion för drag + långtryck (5 sekunder) finns i barnappen.
- Språkstöd (svenska/engelska) och aktiveringslogg i browser (`localStorage`) är tillagt.
- Ny app-portal finns i `panik-overlay/index.html` med två val: barnapp och familjeapp.
- Barnappen använder nu SVG-knappen med animation i `panik-overlay/apps/child/`.
- Förslag på familjeapp-design finns i `panik-overlay/apps/family/`.
- Netlify-konfiguration (`netlify.toml`) är verifierad med `publish = "panik-overlay"`, Node 20 och redirect för SPA (single page app/en-sides-app).
- Deploy-test via `npx netlify-cli deploy --dir=panik-overlay` är kört i CI/container och stoppade vid Netlify-login (inloggning) eftersom browser-öppning saknas i miljön.
- Nytt hjälpscript `scripts/netlify-deploy.sh` finns för preview/prod-deploy (publicering) med samma mappval (`panik-overlay`).
- Ny to-do/funktionskarta är skapad i `to-do/readme.md` med uppdelning: klart, delvis klart, planerat och arkitekturstatus.
- Portal, barnläge och familjeläge har fått ett nytt visuellt premiumlyft med responsiv layout, förbättrad typografi och tydligare CTA-kort.
- GSAP (animationsbibliotek) är installerat och används lokalt via `assets/vendor/gsap.min.js` för mjuka mikroanimationer i barnläget.

### Föreslagna nästa aktiviteter
1. Bekräfta om serverdel ska ligga i samma repo eller separat repo.
2. Om separat server: dokumentera exakt WS/API-kontrakt i README.
3. Koppla familjeappens knappar till riktig data/API när backend finns.

### Pågående aktivitet (nu)
- Förbereda nästa steg för backend-koppling så nya premiumgränssnittet kan läsa riktig incidentdata.

### Kvar att göra
- Lägga tillbaka/ansluta serverkod för full WebSocket- och incidentkedja i detta repo.
- Lägga till fler språk än svenska/engelska (enligt prioritering).
- Ersätta mockdata (testdata) i familjeappen med riktig data.
- Definiera vilka loggfält som ska exporteras/delas utanför browsern.
- Fortsätt använda parentesförklaringar för tekniska ord i all användarnära dokumentation.
- Slutföra produktionsdeploy med `./scripts/netlify-deploy.sh prod` (eller `netlify deploy --prod --dir=panik-overlay`) efter att CLI-login är klart.

---

## 3) Snabbstart lokalt (exakt steg-för-steg)

Kör dessa kommandon i terminalen från repo-roten (`/workspace/PanikknappenV2`):

```bash
cd /workspace/PanikknappenV2
cd panik-overlay
npm run preview
```

Öppna sedan i browser:
- `http://localhost:4173`

Stoppa servern:
- `Ctrl + C`


## 3.1 Enkel check (validering)

Kör i `panik-overlay/`:

```bash
cd /workspace/PanikknappenV2/panik-overlay
npm run check
```

Detta check-script (snabb kontroll) verifierar att den nya appstrukturen finns (portal + barnapp + familjeapp).

---

## 4) Netlify Deploy – enkel och pålitlig väg

Mål: få en **publik URL** för preview/test.

Vill du ha en kort variant? Öppna `NETLIFY_DEPLOY.md` (snabbguide med copy/paste-kommandon).

Repo:t har nu en `netlify.toml` (Netlify konfigurationsfil) i repo-roten som pekar ut:
- `publish = "panik-overlay"` (mappen som ska publiceras)
- redirect-regel för `/*` till `/index.html` (gör att sidan laddar rätt även om du öppnar en undersökväg).

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

Om du kör i Codex/container (isolerad körmiljö) där browser inte kan öppnas automatiskt:

1. Kopiera URL:en som Netlify CLI (terminalverktyg) visar.
2. Öppna URL:en manuellt i din vanliga browser och godkänn login.
3. Gå tillbaka till terminalen och kör deploy-kommandot igen.

### 4.1.1 Snabbdeploy med hjälpscript (rekommenderad)

Kör i **repo-roten** (`/workspace/PanikknappenV2`):

```bash
cd /workspace/PanikknappenV2
./scripts/netlify-deploy.sh preview
```

För produktion:

```bash
cd /workspace/PanikknappenV2
./scripts/netlify-deploy.sh prod
```

Scriptet använder `npx netlify-cli` (engångskörning av CLI utan global installation) och publicerar alltid från `panik-overlay`.

### 4.2 Deploy via Netlify UI (webbläsare)

1. Gå till Netlify (webb) och öppna din site.
2. Klicka **Deploys**.
3. Klicka **Trigger deploy** → **Deploy site** för ny build (ny publicering).
4. Om repo-koppling saknas: **Add new site** → **Import an existing project** och välj GitHub-repot.

Alternativ med CLI (terminalverktyg), från repo-roten:

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

- Production/Preview URL: `https://deploy-preview-4--beautiful-creponne-1506ee.netlify.app`
- Senast verifierad: `2026-02-17`
- Verifierad av: `Användare + AI-agent`

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


## 9) Nya språkregler för AI-svar (viktigt)

För att göra allt ännu mer noob-vänligt gäller följande när AI-agenten hjälper dig:

1. Tekniska ord ska alltid följas av en enkel parentes-förklaring.
   - Exempel: `deploy (publicera till webben)`
   - Exempel: `commit (spara en versionspunkt i Git)`
   - Exempel: `pull request/PR (förslag på ändringar i GitHub)`

2. Instruktioner ska anpassas efter var du jobbar:
   - **Codex (webb):** AI ska skriva exakt vad du gör i chatten/webbgränssnittet.
   - **GitHub (webb):** AI ska nämna rätt flikar/knappar i GitHub-webben.
   - **Netlify (webb):** AI ska ge tydliga UI-steg för deploy/publicering.

3. Om ett terminalkommando behövs ska AI alltid skriva:
   - exakt copy/paste-kommando,
   - var det körs (repo-rot, undermapp, eller i Netlify/GitHub UI).
