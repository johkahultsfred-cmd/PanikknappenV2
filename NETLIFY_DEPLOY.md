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
```

Skapa hook i Netlify UI (webb): **Site configuration** → **Build & deploy** → **Build hooks** → **Add build hook**.

## 3) Om login blockerar i container/Codex

Om Netlify CLI (terminalverktyg) ber om login (inloggning) och inte kan öppna browser automatiskt finns två vägar:

### A) Rekommenderat i CI/container: token (engångsnyckel)
1. Gå till Netlify webb: **User settings** → **Applications** → **Personal access tokens**.
2. Skapa en token och kopiera den.
3. Kör i **repo-roten**:

```bash
cd /workspace/PanikknappenV2
export NETLIFY_AUTH_TOKEN='<din-token>'
# valfritt men rekommenderat i CI/container:
export NETLIFY_SITE_ID='<din-site-id>'
./scripts/netlify-deploy.sh preview
```

För produktion:

```bash
cd /workspace/PanikknappenV2
export NETLIFY_AUTH_TOKEN='<din-token>'
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
- Om `NETLIFY_AUTH_TOKEN` finns lägger scriptet till `--auth <token>` automatiskt för non-interactive deploy (utan browser-login).
- Om `NETLIFY_SITE_ID` finns lägger scriptet till `--site <site-id>` för tydlig koppling mot rätt Netlify-site i CI/container.

Det betyder att site-mappen (mappen som publiceras) alltid är `panik-overlay`.
