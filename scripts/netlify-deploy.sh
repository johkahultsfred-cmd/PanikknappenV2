#!/usr/bin/env bash
set -euo pipefail

MODE="${1:-preview}"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PUBLISH_DIR="$ROOT_DIR/panik-overlay"
AUTH_TOKEN="${NETLIFY_AUTH_TOKEN:-}"
SITE_ID="${NETLIFY_SITE_ID:-}"
DEPLOY_HOOK_URL="${NETLIFY_DEPLOY_HOOK_URL:-}"

if [[ ! -d "$PUBLISH_DIR" ]]; then
  echo "Fel: hittar inte mappen panik-overlay i repo-roten."
  exit 1
fi

if [[ "$MODE" != "preview" && "$MODE" != "prod" && "$MODE" != "hook" ]]; then
  echo "Användning: ./scripts/netlify-deploy.sh [preview|prod|hook]"
  exit 1
fi

cd "$ROOT_DIR"

echo "Kör Netlify deploy från: $ROOT_DIR"
echo "Publicerar mapp: $PUBLISH_DIR"

if [[ "$MODE" == "hook" ]]; then
  if [[ -z "$DEPLOY_HOOK_URL" ]]; then
    echo "Fel: NETLIFY_DEPLOY_HOOK_URL saknas för hook-läge."
    echo "Lösning:"
    echo "  1) Skapa Build hook i Netlify (Site configuration > Build & deploy > Build hooks)."
    echo "  2) Kör i repo-roten:"
    echo "     export NETLIFY_DEPLOY_HOOK_URL='<din-hook-url>'"
    echo "  3) Kör deploy igen: ./scripts/netlify-deploy.sh hook"
    exit 1
  fi

  echo "Trigger deploy via Netlify deploy-hook..."
  curl --fail --show-error --silent -X POST -H "Content-Type: application/json" -d '{}' "$DEPLOY_HOOK_URL"
  echo
  echo "Hook deploy triggat. Kontrollera status i Netlify UI > Deploys."
  exit 0
fi

# Non-interactive miljö (utan terminalfönster): kräver token för att undvika browser-login.
if [[ -z "$AUTH_TOKEN" && ! -t 1 ]]; then
  echo "Fel: ingen terminal-session för browser-login och NETLIFY_AUTH_TOKEN saknas."
  echo "Lösning:"
  echo "  1) Skapa Personal Access Token i Netlify (User settings > Applications > Personal access tokens)."
  echo "  2) Kör i repo-roten:"
  echo "     export NETLIFY_AUTH_TOKEN='<din-token>'"
  echo "  3) Kör deploy igen: ./scripts/netlify-deploy.sh $MODE"
  exit 1
fi

DEPLOY_ARGS=(deploy --dir "$PUBLISH_DIR")

if [[ "$MODE" == "prod" ]]; then
  DEPLOY_ARGS+=(--prod)
fi

if [[ -n "$SITE_ID" ]]; then
  echo "NETLIFY_SITE_ID hittades och skickas med till Netlify CLI."
  DEPLOY_ARGS+=(--site "$SITE_ID")
elif [[ ! -t 1 ]]; then
  echo "Fel: NETLIFY_SITE_ID saknas i non-interactive miljö."
  echo "Lösning:"
  echo "  1) Hämta Site ID i Netlify (Site settings > General > Site details)."
  echo "  2) Kör i repo-roten:"
  echo "     export NETLIFY_SITE_ID='<din-site-id>'"
  echo "  3) Kör deploy igen: ./scripts/netlify-deploy.sh $MODE"
  exit 1
fi

if [[ -n "$AUTH_TOKEN" ]]; then
  echo "NETLIFY_AUTH_TOKEN hittades och används för icke-interaktiv deploy."
else
  echo "Tips: Om login krävs, öppna URL:en från terminalen i din vanliga browser och godkänn."
fi

npx --yes netlify-cli "${DEPLOY_ARGS[@]}"
