#!/usr/bin/env bash
set -euo pipefail

MODE="${1:-preview}"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PUBLISH_DIR="$ROOT_DIR/panik-overlay"
AUTH_TOKEN="${NETLIFY_AUTH_TOKEN:-}"
SITE_ID="${NETLIFY_SITE_ID:-}"

if [[ ! -d "$PUBLISH_DIR" ]]; then
  echo "Fel: hittar inte mappen panik-overlay i repo-roten."
  exit 1
fi

if [[ "$MODE" != "preview" && "$MODE" != "prod" ]]; then
  echo "Användning: ./scripts/netlify-deploy.sh [preview|prod]"
  exit 1
fi

cd "$ROOT_DIR"

echo "Kör Netlify deploy från: $ROOT_DIR"
echo "Publicerar mapp: $PUBLISH_DIR"

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
