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

## Tillfälligt undantag (GitHub Pages på prov)

> **Viktigt just nu:** Vi kör ett tillfälligt undantag där instruktioner om Netlify pausas tills vidare.
>
> Under provperioden gäller:
> - Primärt deploy-spår är **GitHub Pages** (via GitHub Actions).
> - Netlify-relaterade punkter i den här README:n och i andra guider räknas som **fallback** (reservspår), inte standard.
> - Om en instruktion krockar: följ GitHub Pages-spåret först.

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
- Nytt hjälpscript `scripts/netlify-deploy.sh` finns för preview/prod-deploy (publicering) med samma mappval (`panik-overlay`) och stöd för `NETLIFY_AUTH_TOKEN` (token för inloggad CLI-körning utan browser).
- Ny to-do/funktionskarta är skapad i `to-do/readme.md` med uppdelning: klart, delvis klart, planerat och arkitekturstatus.
- Portal, barnläge och familjeläge har fått ett nytt visuellt premiumlyft med responsiv layout, förbättrad typografi och tydligare CTA-kort.
- GSAP (animationsbibliotek) är installerat och används lokalt via `assets/vendor/gsap.min.js` för mjuka mikroanimationer i barnläget.
- Familjeläget har nu kodlås för föräldrafunktioner med initial testkod `1234`, lokal säkerhetslogg och automatisk låsning efter inaktivitet (5 minuter).
- Felsökning klar: `panik-overlay/package.json` hade dubbla `check`-nycklar (konfigurationsfält), nu ersatt med en enda check som verifierar både familjeläge-script och lås-script.
- Felsökning klar: `scripts/netlify-deploy.sh` använder nu samma argumentkedja utan dubbletter och stödjer även `NETLIFY_SITE_ID` (site-id för direkt koppling i CI/container).
- Förbättring klar: deploy-scriptet använder nu absolut publish-mapp, undviker `--auth`-flagga och stoppar tidigt med tydligt fel om site-id saknas i non-interactive miljö.
- Förbättring klar: deploy-scriptet har nu även `hook`-läge med `NETLIFY_DEPLOY_HOOK_URL` (build hook-länk) för enkel trigger i CI utan CLI-login.
- Förbättring klar: hook-läget provar nu fallback från `preview_server_hooks` till `build_hooks` vid 404 för bättre felsökning.
- Förbättring klar: hook-läget stödjer nu hook-URL både via env (`NETLIFY_DEPLOY_HOOK_URL`) och direktargument samt städar temporärsvar med `mktemp`/`trap`.
- Förbättring klar: hook-fel visar nu exakt 3-stegs återställning när Netlify svarar 404 (saknad/ogiltig hook).
- Förbättring klar: scriptet validerar nu hook-URL-format tidigt och stoppar direkt om värdet inte är en Netlify-hook-länk.
- Deployförsök (preview/testpublicering) kördes i container men stoppades korrekt när `NETLIFY_AUTH_TOKEN` saknas i non-interactive miljö.
- Uppföljning klar: GitHub Secrets är ordnade, men lokal Codex-session behöver fortfarande `export NETLIFY_AUTH_TOKEN` innan manuell preview-deploy kan köras här.
- Felsökning klar: GitHub Actions deploy använder nu `npx netlify-cli deploy --dir=.` i `panik-overlay` för att undvika `package.json`-fel i repo-roten.
- Felsökning klar: GitHub Actions verifierar nu först `NETLIFY_AUTH_TOKEN` + `NETLIFY_SITE_ID` och väljer automatiskt `preview` på brancher samt `prod` på `main`.
- Strategibyte klart: deploy-spåret går nu via GitHub Pages (GitHub-hosting) med nytt workflow för statisk publicering från `panik-overlay`.
- Förtydligat: Netlify-workflow körs nu endast manuellt (workflow_dispatch) så GitHub Pages förblir huvudspår utan automatisk Netlify-körning på `main`.
- Uppföljning klar: PR-spåret är flyttat till branch `Variant_3` för vidare ändringar i ett eget, tydligt arbetsflöde.
- Felsökning klar: portal, barn och familj har nu relativa sökvägar + tidig URL-normalisering till avslutande snedstreck (`/.../`) så resurser och kodupplåsning fungerar både på domänrot och i undermapp (t.ex. GitHub Pages).
- Felsökning klar: GitHub Pages-workflow använder nu separata build/deploy-jobb med explicit `environment: github-pages` och tydliga permissions för att minska 401/"Bad credentials" vid deploy-steget.
- Stabiliseringssteg klart: ny guide `STABILISERING.md` beskriver konfliktfri sökvägsstrategi, rebase-rutin och testmatris för rot/undermapp före merge.
- Felsökning klar: familjelägets upplåsning använder nu safe-hantering av localStorage (med fallback) så vyn öppnas även om browsern blockerar lagring i den aktuella sessionen.
- Felsökning klar: familjelåset dolde sig inte visuellt trots godkänd kod eftersom CSS-regeln `.parent-lock { display: grid; }` överstyrde HTML-attributet `hidden`; ny regel `.parent-lock[hidden] { display: none; }` löser detta.

### Föreslagna nästa aktiviteter
1. Byt från testkod till riktig personlig kod per familj och lagra den säkrare (hash/krypterad variant).
2. Koppla familjeappens snabbåtgärder till riktig backend/API i stället för simulerad logg.
3. Lägg till valbar extra säkerhet i mobil (biometri via native wrapper).

### Pågående aktivitet (nu)
- Verifiera online-deploy efter URL-normalisering och säkerställ att familjeläge kan låsas upp med kod även i undermappsläge.

### Kvar att göra
- Lägga tillbaka/ansluta serverkod för full WebSocket- och incidentkedja i detta repo.
- Lägga till fler språk än svenska/engelska (enligt prioritering).
- Ersätta mockdata (testdata) i familjeappen med riktig data.
- Flytta föräldrakod från lokal lagring till säkrare serverkontroll när backend är redo.
- Definiera vilka loggfält som ska exporteras/delas utanför browsern.
- Fortsätt använda parentesförklaringar för tekniska ord i all användarnära dokumentation.
- Slutföra produktionsdeploy med `./scripts/netlify-deploy.sh prod` (eller `netlify deploy --prod --dir=panik-overlay`) efter att CLI-login är klart eller `NETLIFY_AUTH_TOKEN` + `NETLIFY_SITE_ID` är satta i miljön.
- Flytta föräldrakod till servervalidering för att undvika att kod ligger synligt i klientkod.

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

## 3.2 Installera som app i mobil (PWA)

När sajten ligger på HTTPS (säker webb-länk, t.ex. Netlify) kan mobilen erbjuda installation:

- **Android/Chrome:** install-banner i appen visas när browsern tillåter install-prompt.
- **iPhone/Safari:** öppna **Dela** → **Lägg till på hemskärmen**.

Efter installation öppnas appen i fristående läge (utan browserfält) och grundsidorna fungerar även offline via service worker (cache-lager lokalt i mobilen).

---

## 4) Netlify Deploy – pausad under GitHub Pages-provet

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


## 4.3 Deploy via GitHub Pages (helt gratis, primärt spår nu)

Det här repo:t har nu workflow (automatiskt körflöde) i `.github/workflows/github-pages.yml` som publicerar mappen `panik-overlay` till GitHub Pages.

### 4.3.1 Engångsinställning i GitHub (webb)
1. Öppna repo:t i GitHub (webb).
2. Klicka **Settings**.
3. Klicka **Pages** i vänstermenyn.
4. Under **Build and deployment** välj **Source: GitHub Actions**.

### 4.3.2 Publicera (deploy)
- Automatiskt: push till `main` triggar deploy.
- Manuellt: **Actions** → **GitHub Pages Deploy** → **Run workflow**.

Kör gärna lokal check först i repo-roten:

```bash
cd /workspace/PanikknappenV2/panik-overlay
npm run check
```

När deploy är klar blir länken normalt:
- `https://johkahultsfred-cmd.github.io/PanikknappenV2/`

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

---

## 9) Föräldrakod i familjeläge (webb + mobil/PWA)

Nu kräver familjeläget en 4-siffrig föräldrakod innan känsliga funktioner visas.

### Så funkar det nu
- Initial testkod: `1234`.
- Efter 3 felaktiga försök: tillfällig spärr i 30 sekunder.
- Valbar "kom ihåg denna enhet" i 15 minuter.
- Möjlighet att byta kod direkt i familjelägets föräldrainställningar.
- Enkel händelselogg sparas lokalt i browsern (localStorage).

### Varför detta fungerar i både webb och mobil
- Mobilappen här är PWA (installerad webbapp), så samma kodlås körs i browser och i installerat app-läge.
- Ingen separat implementation behövs just nu för iOS/Android så länge familjeläget körs från samma webbapp.

### Smart nästa nivå (rekommenderat)
1. Flytta kodverifiering till backend/API (serverkontroll) så PIN aldrig behöver lagras lokalt.
2. Lägg till biometriskt lås (Face ID/Touch ID/fingeravtryck) via enhetens säkra funktioner när native wrapper finns.
3. Lägg till adminflöde för återställning av kod via verifierad vuxenkontakt.
