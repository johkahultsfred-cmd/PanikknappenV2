#!/usr/bin/env bash
set -euo pipefail

MODE="${1:-preview}"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SITE_DIR="$ROOT_DIR/panik-overlay"

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

echo "Tips: Om login krävs, öppna URL:en från terminalen i din vanliga browser och godkänn."

if [[ "$MODE" == "prod" ]]; then
  npx --yes netlify-cli deploy --prod --dir=panik-overlay
else
  npx --yes netlify-cli deploy --dir=panik-overlay
fi
