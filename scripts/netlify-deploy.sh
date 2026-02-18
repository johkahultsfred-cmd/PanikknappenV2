#!/usr/bin/env bash
set -euo pipefail

MODE="${1:-preview}"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SITE_DIR="$ROOT_DIR/panik-overlay"
AUTH_TOKEN="${NETLIFY_AUTH_TOKEN:-}"

if [[ ! -d "$SITE_DIR" ]]; then
  echo "Fel: hittar inte mappen panik-overlay i repo-roten."
  exit 1
fi

if [[ "$MODE" != "preview" && "$MODE" != "prod" ]]; then
  echo "Användning: ./scripts/netlify-deploy.sh [preview|prod]"
  exit 1
fi

cd "$ROOT_DIR"

echo "Kör Netlify deploy från: $ROOT_DIR"

if [[ -n "$AUTH_TOKEN" ]]; then
  echo "NETLIFY_AUTH_TOKEN hittad: kör non-interactive deploy (utan browser-login)."
  AUTH_ARGS=(--auth "$AUTH_TOKEN")
else
  AUTH_ARGS=()
  if [[ ! -t 1 ]]; then
    echo "Fel: ingen terminal-session för browser-login och NETLIFY_AUTH_TOKEN saknas."
    echo "Lösning:"
    echo "  1) Skapa en Personal Access Token i Netlify (User settings > Applications > Personal access tokens)."
    echo "  2) Kör i repo-roten:"
    echo "     export NETLIFY_AUTH_TOKEN='<din-token>'"
    echo "  3) Kör deploy igen: ./scripts/netlify-deploy.sh $MODE"
    exit 1
  fi
  echo "Tips: Om login krävs, öppna URL:en från terminalen i din vanliga browser och godkänn."
fi

if [[ "$MODE" == "prod" ]]; then
  npx --yes netlify-cli deploy --prod --dir=panik-overlay "${AUTH_ARGS[@]}"
else
  npx --yes netlify-cli deploy --dir=panik-overlay "${AUTH_ARGS[@]}"
fi
