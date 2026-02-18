# Netlify deploy-guide (snabb version)

Den här guiden är för dig som vill deploya (publicera till webben) med minsta möjliga steg.

## 1) Preview deploy (testlänk)

Kör i **repo-roten** (`/workspace/PanikknappenV2`):

```bash
cd /workspace/PanikknappenV2
./scripts/netlify-deploy.sh preview
```

## 2) Produktionsdeploy (live-länk)

Kör i **repo-roten** (`/workspace/PanikknappenV2`):

```bash
cd /workspace/PanikknappenV2
./scripts/netlify-deploy.sh prod
```


## 2.1) Alternativ: deploy via Build hook (enkelt i CI utan token)

Kör i **repo-roten** (`/workspace/PanikknappenV2`):

```bash
cd /workspace/PanikknappenV2
export NETLIFY_DEPLOY_HOOK_URL='<din-build-hook-url>'
./scripts/netlify-deploy.sh hook
# eller skicka URL direkt:
./scripts/netlify-deploy.sh hook '<din-build-hook-url>'
```

Skapa hook i Netlify UI (webb): **Site configuration** → **Build & deploy** → **Build hooks** → **Add build hook**.

### 2.1.1) Om du får `404 Not Found` på hook
1. Verifiera att hooken finns kvar i Netlify (webb): **Site configuration** → **Build & deploy** → **Build hooks**.
2. Skapa en ny hook och kopiera URL:en igen.
3. Kör från repo-roten: `./scripts/netlify-deploy.sh hook "<ny-build-hook-url>"`.

### 2.1.2) Om hook-URL är i fel format
Scriptet accepterar bara Netlify-hookar i format:
- `https://api.netlify.com/build_hooks/<id>`
- `https://api.netlify.com/preview_server_hooks/<id>`


## 2.2) Deploy via GitHub Actions (webb)

Ni har redan workflow-filen `.github/workflows/netlify-deploy.yml` (automatisk deploy-pipeline i GitHub).

Gör så här i **GitHub UI (webb)**:
1. Öppna repo → fliken **Settings** → **Secrets and variables** → **Actions**.
2. Lägg in secrets: `NETLIFY_AUTH_TOKEN` och `NETLIFY_SITE_ID`.
3. Gå till fliken **Actions** → välj **Netlify Deploy** → klicka **Run workflow**.
4. Följ loggen tills steg `Netlify Deploy` är grön.

## 3) Om login blockerar i container/Codex

Om Netlify CLI (terminalverktyg) ber om login (inloggning) och inte kan öppna browser automatiskt finns två vägar:

### A) Rekommenderat i CI/container: token (engångsnyckel)
1. Gå till Netlify webb: **User settings** → **Applications** → **Personal access tokens**.
2. Skapa en token och kopiera den.
3. Kör i **repo-roten**:

```bash
cd /workspace/PanikknappenV2
export NETLIFY_AUTH_TOKEN='<din-token>'
# krävs i CI/container (non-interactive):
# valfritt men rekommenderat i CI/container:
export NETLIFY_SITE_ID='<din-site-id>'
./scripts/netlify-deploy.sh preview
```

För produktion:

```bash
cd /workspace/PanikknappenV2
export NETLIFY_AUTH_TOKEN='<din-token>'
# krävs i CI/container (non-interactive):
# valfritt men rekommenderat i CI/container:
export NETLIFY_SITE_ID='<din-site-id>'
./scripts/netlify-deploy.sh prod
```

### B) Manuell browser-login
1. Kopiera URL:en som visas i terminalen.
2. Öppna URL:en i din vanliga browser.
3. Godkänn login och kör samma kommando igen.

## 4) Vad scriptet kör i bakgrunden

- Preview: `npx --yes netlify-cli deploy --dir=panik-overlay`
- Produktion: `npx --yes netlify-cli deploy --prod --dir=panik-overlay`
- Hook-läge: `curl -X POST <build-hook-url>` via `./scripts/netlify-deploy.sh hook` (tar URL via env eller argument).
- Hook-läget provar fallback från `preview_server_hooks` till `build_hooks` vid HTTP 404.
- Om `NETLIFY_AUTH_TOKEN` finns kör scriptet non-interactive (utan browser-login) via Netlify CLI:s miljövariabel (miljöinställning).
- Om `NETLIFY_SITE_ID` finns lägger scriptet till `--site <site-id>` för tydlig koppling mot rätt Netlify-site i CI/container.
- I non-interactive miljö stoppar scriptet tidigt med tydligt fel om `NETLIFY_SITE_ID` saknas (för att undvika interaktiv prompt som fastnar).
- Om `NETLIFY_AUTH_TOKEN` finns lägger scriptet till `--auth <token>` automatiskt för non-interactive deploy (utan browser-login).
- Om `NETLIFY_SITE_ID` finns lägger scriptet till `--site <site-id>` för tydlig koppling mot rätt Netlify-site i CI/container.

Det betyder att site-mappen (mappen som publiceras) alltid är `panik-overlay`.
