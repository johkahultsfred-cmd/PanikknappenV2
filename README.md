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
- Förtydligat Windows-import (filkopiering från `C:\`) med exakt copy/paste-flöde till repo (projektmapp på GitHub) i Codex-miljön.
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
- Familjeläget har lokal säkerhetslogg och föräldrakod-flödet ligger kvar i koden men är tillfälligt avstängt i UI tills stabil fix är klar.
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
- Felsökning klar: barn- och familjesidan använder nu relativa filvägar (sökvägar utan inledande `/`) så CSS/JS/back-länkar fungerar även efter deploy på undersökväg (t.ex. GitHub Pages).
- Felsökning klar (2026-02-18): föräldralåset i familjeläget respekterar nu `hidden`-attributet i CSS när låsflödet används.
- Ändring klar (2026-02-18): kodlåset i familjeläget är tillfälligt avstängt så sidan öppnas direkt utan kod medan vidare felsökning pågår.
- Ändring klar (2026-02-18): barnläget skickar nu incidenter till gemensam larminkorg (lokal demo) och familjeläget visar dessa med status, tidsstämpel och demo-screenshot.
- Justering klar (2026-02-18): tidigare `?simple=1`-spår är borttaget igen efter feedback.
- Ny demo klar (2026-02-18): barnets knapp skickar nu incidentdata till familjeläget (lokalt), med notisbar logg, säkerhetssteg och simulerad screenshot i föräldravy.
- Ändring klar (2026-02-18): familjeläget visar nu riktig larminkorg från barnappen (lokal incidentlogg) med tidsstämpel, status och skärmbild (SVG-bild från knappen) samt knapp för att markera larm som hanterat.
- MVP klar (2026-02-18): lokal Node-backend (`panik-overlay/server/api-server.js`) med API-endpoints för incidenter är tillagd och barn/familj använder API med fallback till localStorage.
- Nyhet klar (2026-02-18): riktig Web Push-grund är inkopplad med VAPID-nycklar, server-endpoints för subscription och push-notis till familjeläge när barnincident skapas.
- Plan klar (2026-02-23): native-spår (riktig mobilapp) är beskrivet steg-för-steg för overlay över andra appar, bakgrundsspårning och säker larmkedja.
- Dokumentation fixad (2026-02-23): kommandon är nu relative (relativa sökvägar), så samma copy/paste fungerar i macOS/Linux och Windows PowerShell utan `/workspace/...`.
- Dokumentation fixad (2026-02-23): alla kvarvarande `/workspace/...`-rader i README + NETLIFY_DEPLOY är borttagna för att undvika Windows-felet `Set-Location: Cannot find path`.
- Felsökning klar (2026-02-23): Capacitor-kommandon är nu förtydligade till `panik-overlay/`, så `android platform has not been added yet` undviks när sync körs från rätt mapp.
- Backendkoppling klar (2026-02-24): familjelägets snabbåtgärder sparas nu via API-endpoint (`POST /api/family-actions`) i stället för enbart simulerad lokal logg.
- Stabilisering klar (2026-02-24): backend startar nu igen efter uppdatering av `web-push`, och snabbåtgärds-API (`POST/GET /api/family-actions`) är verifierat med lokal servertest.
- CI-fix klar (2026-02-24): `.github/workflows/webpack.yml` kör nu i `panik-overlay/` med `npm ci` + `npm run check`, så GitHub Actions letar rätt `package.json` och undviker ENOENT-felet i repo-roten.
- CI-fix klar (2026-02-24): Android-workflows använder nu Node 22 i GitHub Actions, så `npx cap sync android` uppfyller Capacitor-kravet (`>=22`) och slutar krascha.
- Windows-fix klar (2026-02-24): snabbstarten använder nu relativa sökvägar och PowerShell-exempel med riktig lokal repo-mapp, så `cd workspace/PanikknappenV2`-felet undviks.
- Tillfällig förenkling klar (2026-02-24): hårdkodad testkod är borttagen och föräldrakod är avstängd tills låsflödet är stabilt igen.

### Föreslagna nästa aktiviteter
1. Byt från testkod till riktig personlig kod per familj och lagra den säkrare (hash/krypterad variant).
2. Lägg till valbar extra säkerhet i mobil (biometri via native wrapper).
3. Visa backend-logg för snabbåtgärder i egen vy i familjeläget.

### Pågående aktivitet (nu)
- Verifiera nästa online-deploy efter länkfixen för barn/familj och bekräfta att båda undersidorna laddar korrekt.
- Planera ny, stabil återaktivering av föräldrakod (utan hårdkodad testkod) efter verifierat låsflöde.
- Bryta ut native-MVP (första fungerande mobilversion) med overlay-behörighet i Android och samma API-flöde som webbappen.
- Visa historik för snabbåtgärder från backend i familjelägets UI (gränssnitt).

### Kvar att göra
- Lägga tillbaka/ansluta serverkod för full WebSocket- och incidentkedja i detta repo.
- Lägga till fler språk än svenska/engelska (enligt prioritering).
- Ersätta mockdata (testdata) i familjeappen med riktig data.
- Återaktivera kodlåset i familjeläget när inloggningsflödet fungerar stabilt för testgruppen.
- Definiera vilka loggfält som ska exporteras/delas utanför browsern.
- Fortsätt använda parentesförklaringar för tekniska ord i all användarnära dokumentation.
- Slutföra produktionsdeploy med `./scripts/netlify-deploy.sh prod` (eller `netlify deploy --prod --dir=panik-overlay`) efter att CLI-login är klart eller `NETLIFY_AUTH_TOKEN` + `NETLIFY_SITE_ID` är satta i miljön.
- Flytta föräldrakod till servervalidering för att undvika att kod ligger synligt i klientkod.
- Bygg riktig push-notis (mobilnotis) + backend-lagring så familjen får signal även på annan enhet än samma browser-data.
- För notiser mellan olika telefoner behövs backend + push-tjänst (server + push), lokal demo visar idag flödet i browsern och är nästa steg att koppla till riktig server.

---

## 3.4 Native-spår (riktig mobilapp) – enkel 3-stegsplan

Detta spår behövs om målet är en knapp som kan ligga över andra appar/spel (system-overlay) på samma sätt som skärminspelningsappar.

### Steg 1: Android wrapper (mobilskal) runt nuvarande app
Mål: återanvänd nuvarande UI (gränssnitt) men köra som native-app (riktig mobilapp).

Kör i **repo-roten** först (projektmapp på GitHub):

```bash
# Alla plattformar
cd panik-overlay
```

Kör sedan i **panik-overlay/**:

```bash
# Alla plattformar (macOS/Linux/Windows PowerShell)
npx cap add android
```

Om du redan har mappen `panik-overlay/android/` behöver du inte köra `cap add` igen.

Resultat: du får (eller återanvänder) Android-projektmappen där vi kan aktivera mobilbehörigheter.

### Steg 2: Aktivera overlay + bakgrundsservice i Android
Mål: kunna visa knapp över andra appar och hålla larmkedjan aktiv i bakgrunden.

Gör i **Android Studio (Android-utvecklingsverktyg)**:
1. Öppna mappen `android/`.
2. Lägg till behörighet för overlay (visa över andra appar) i `AndroidManifest.xml`.
3. Lägg till foreground service (bakgrundstjänst med synlig notis) för stabil övervakning.

Kodrad att lägga i `AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW" />
```

### Steg 3: Koppla nuvarande panikflöde till native-signaler
Mål: behålla din panikknapp + familjeflöde men med riktig mobilnivå.

I appen:
1. Knapptryck -> skicka incident till samma API (`POST /api/incidents`).
2. Skicka push (mobilnotis) till familjeenhet.
3. Lägg till riktig screenshot (skärmbild) + plats (GPS-position) via native-plugin.

Snabb check i **repo-roten** efter webbuppdatering:

```bash
# Alla plattformar
cd panik-overlay
npm run check
```

Synka sedan webbbygget till Android-projektet (kör i `panik-overlay/`):

```bash
# Alla plattformar
cd panik-overlay
npx cap sync android
```

### Viktig avgränsning
- iOS (iPhone) tillåter inte samma fria overlay över andra appar som Android.
- Rekommendation: börja med Android för overlay-kravet, och behåll iOS som PWA-spår (installerad webbapp) tills vidare.

---

## 3) Snabbstart lokalt (exakt steg-för-steg)

### 3.0 Om dina filer ligger i `C:\` (Windows)

Om du sitter i Codex/container (isolierad Linux-miljö) men dina filer finns i Windows, kopiera först in dem till repo-roten (huvudmappen för projektet).

Kör i terminalen:

```bash
# Kör i repo-roten (mappen där README.md ligger)
cp -r /mnt/c/DIN/MAPP/* .
```

Verifiera direkt efter kopiering:

```bash
# Kör i repo-roten
pwd
rg --files
```

Byt `DIN/MAPP` till din riktiga Windows-sökväg (samma mappar som i `C:\...`).

Om du kör i Windows PowerShell (inte i container) ska du först gå till din riktiga projektmapp, t.ex.:

```powershell
# Exempel – byt sökväg till där du faktiskt har klonat repot
cd C:\Users\lunag\Documents\GitHub\PanikknappenV2
```

Kör dessa kommandon i terminalen från repo-roten (projektmapp på GitHub):

```bash
# Alla plattformar
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
# Alla plattformar
cd panik-overlay
npm run check
```

Detta check-script (snabb kontroll) verifierar att den nya appstrukturen finns (portal + barnapp + familjeapp).

## 3.2 Installera som app i mobil (PWA)

När sajten ligger på HTTPS (säker webb-länk, t.ex. Netlify) kan mobilen erbjuda installation:

- **Android/Chrome:** install-banner i appen visas när browsern tillåter install-prompt.
- **iPhone/Safari:** öppna **Dela** → **Lägg till på hemskärmen**.

Efter installation öppnas appen i fristående läge (utan browserfält) och grundsidorna fungerar även offline via service worker (cache-lager lokalt i mobilen).

Tips för två ikoner på olika enheter:
- Barnets enhet: öppna `.../apps/child/` och välj **Lägg till på hemskärmen**.
- Förälderns enhet: öppna `.../apps/family/` och lägg till den som egen ikon.
- Test med två telefoner: öppna barnlänken i barnets telefon och familjelänken i förälderns telefon. Trigga sedan barnknappen och kontrollera incident i familjeläget.
- Lokal körning i repo-roten (för API + app tillsammans):
```bash
# Alla plattformar
cd panik-overlay
npm run preview
```
- Aktivera push i förälderns app: öppna `.../apps/family/` och tryck **Aktivera push-notiser**.
- Tillåt notiser när browsern frågar om tillstånd.

---


## 3.3 Arkitektur nu och nästa steg (enkel plan)

### Nu (MVP i repo:t)
- Barnapp skickar incident till `POST /api/incidents`.
- Familjeapp hämtar incidenter från `GET /api/incidents?familyId=...`.
- Familjeapp kan markera hanterad via `PATCH /api/incidents/:id`.
- Om API inte svarar används fallback i `localStorage` (lokal lagring i browsern).

### Nästa steg för riktig cross-device (mellan olika telefoner)
1. Flytta API till driftad backend (server) med riktig databas.
2. Lagra push-token per föräldraenhet.
3. Skicka push-notis när ny incident skapas.
4. Behåll polling (hämtning var 10:e sekund) som reserv.
5. Verifiera notis i installerad PWA på förälderns enhet.

### Föreslagen minimal backend
- Server: Node.js API (enkel serverdel).
- Databas: Postgres (SQL-databas) eller Supabase.
- Push: Web Push (browser-notiser) är nu inkopplad lokalt med VAPID, och kan senare bytas/kompletteras med Firebase Cloud Messaging.


### Nya push-endpoints i MVP
- `GET /api/push/public-key`
- `POST /api/push/subscribe`
- `POST /api/push/unsubscribe`

### Enkel incidentmodell
```json
{
  "id": "uuid",
  "childId": "child-demo-1",
  "familyId": "family-demo-1",
  "timestamp": "2026-02-18T20:00:00.000Z",
  "status": "ny",
  "screenshotUrl": "https://... eller data-url",
  "location": { "left": "120px", "top": "340px" },
  "actions": ["Skicka push", "Spara logg"]
}
```

## 4) Netlify Deploy – pausad under GitHub Pages-provet

Mål: få en **publik URL** för preview/test.

Vill du ha en kort variant? Öppna `NETLIFY_DEPLOY.md` (snabbguide med copy/paste-kommandon).

Repo:t har nu en `netlify.toml` (Netlify konfigurationsfil) i repo-roten som pekar ut:
- `publish = "panik-overlay"` (mappen som ska publiceras)
- redirect-regel för `/*` till `/index.html` (gör att sidan laddar rätt även om du öppnar en undersökväg).

1. Öppna repo:t i GitHub (webb).
2. Klicka **Settings**.
3. Klicka **Pages** i vänstermenyn.
4. Under **Build and deployment** välj **Source: GitHub Actions**.

### 4.2 Publicera (deploy)
- Automatiskt: push till `main` triggar deploy.
- Manuellt: **Actions** → **GitHub Pages Deploy** → **Run workflow**.

Kör gärna lokal check först i **repo-roten i Codex (webb)**:

```bash
cd panik-overlay
npm run check
```

När deploy är klar blir länken normalt:
- `https://johkahultsfred-cmd.github.io/PanikknappenV2/`


Kör i **repo-roten** (mappen där du klonat repo (projektmapp på GitHub)):

```bash
./scripts/netlify-deploy.sh preview
```

### 4.4 Felsökning i Git (divergent branches vid `git pull`)
Om du får felet:

```bash
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
netlify deploy --dir=panik-overlay
```

Kör i **repo-roten i Codex (webb)**:

```bash
# Rekommenderad engångsinställning i detta repo (använder rebase = lägger dina commits ovanpå senaste main)
git config pull.rebase true

### 4.3.2 Publicera (deploy)
- Automatiskt: push till `main` triggar deploy.
- Manuellt: **Actions** → **GitHub Pages Deploy** → **Run workflow**.

Kör gärna lokal check först i repo-roten:

```bash
cd panik-overlay
npm run check
```

Om du i stället vill använda merge (sammanfogning) som standard i detta repo:

### 4.4 Krav i GitHub/Netlify för live API + app
1. **GitHub (webb):** pusha ändringar till branch och mergea till `main`.
2. **Netlify (webb):** Site settings → Build & deploy → Publish directory = `panik-overlay`.
3. Om du vill köra separat backend senare: sätt `API_BASE_URL` som miljövariabel i Netlify under **Site settings → Environment variables**.
4. Kör deploy (publicera) med:
```bash
netlify deploy --dir=panik-overlay
```
Produktion:
```bash
netlify deploy --prod --dir=panik-overlay
```

Tips: använd samma strategi varje gång i repo:t för att undvika onödiga konflikter (krockar i historik).

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

Föräldrakod är **tillfälligt avstängd** tills låsflödet fungerar stabilt igen.

### Så funkar det nu
- Familjeläget öppnas direkt utan sifferkod.
- Ingen hårdkodad testkod används längre.
- Säkerhetslogg i browsern (localStorage) fungerar fortsatt.

### Nästa säkra återstart av kodlås
1. Återinför kodlås med servervalidering (kontroll i backend/API) i stället för hårdkod i klienten.
2. Lägg till tydlig testplan för felkod, spärr och "kom ihåg enhet" innan den slås på för användare.
3. Dokumentera ny startkod per familj i säkert adminflöde i stället för gemensam demo-kod.
