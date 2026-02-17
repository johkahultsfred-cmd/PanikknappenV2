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

## 3) Om login blockerar i container/Codex

Om Netlify CLI (terminalverktyg) ber om login (inloggning) och inte kan öppna browser automatiskt:

1. Kopiera URL:en som visas i terminalen.
2. Öppna URL:en i din vanliga browser.
3. Godkänn login och kör samma kommando igen.

## 4) Vad scriptet kör i bakgrunden

- Preview: `npx --yes netlify-cli deploy --dir=panik-overlay`
- Produktion: `npx --yes netlify-cli deploy --prod --dir=panik-overlay`

Det betyder att site-mappen (mappen som publiceras) alltid är `panik-overlay`.
