#!/usr/bin/env bash
set -euo pipefail

MODE="${1:-preview}"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PUBLISH_DIR="$ROOT_DIR/panik-overlay"
AUTH_TOKEN="${NETLIFY_AUTH_TOKEN:-}"
SITE_ID="${NETLIFY_SITE_ID:-}"
# Tillåt hook-URL både via env och som andra argumentet: ./scripts/netlify-deploy.sh hook <url>
DEPLOY_HOOK_URL="${2:-${NETLIFY_DEPLOY_HOOK_URL:-}}"

if [[ ! -d "$PUBLISH_DIR" ]]; then
  echo "Fel: hittar inte mappen panik-overlay i repo-roten."
  exit 1
fi

if [[ "$MODE" != "preview" && "$MODE" != "prod" && "$MODE" != "hook" ]]; then
  echo "Användning: ./scripts/netlify-deploy.sh [preview|prod|hook] [hook-url]"
  exit 1
fi

is_valid_netlify_hook_url() {
  local url="$1"
  [[ "$url" =~ ^https://api\.netlify\.com/(build_hooks|preview_server_hooks)/[A-Za-z0-9]+$ ]]
}

print_hook_recovery_steps() {
  echo "Lösning (3 steg):"
  echo "  1) Öppna Netlify UI: Site configuration > Build & deploy > Build hooks."
  echo "  2) Skapa en ny Build hook och kopiera hela URL:en."
  echo "  3) Kör i repo-roten: ./scripts/netlify-deploy.sh hook '<ny-build-hook-url>'"
}

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

  if ! is_valid_netlify_hook_url "$DEPLOY_HOOK_URL"; then
    echo "Fel: ogiltig hook-URL."
    echo "Ange en riktig Netlify hook-länk, t.ex.:"
    echo "  https://api.netlify.com/build_hooks/<id>"
    echo "  https://api.netlify.com/preview_server_hooks/<id>"
    print_hook_recovery_steps
    exit 1
  fi

  RESPONSE_FILE="$(mktemp)"
  trap 'rm -f "$RESPONSE_FILE"' EXIT

  trigger_hook() {
    local url="$1"
    curl --silent --output "$RESPONSE_FILE" --write-out '%{http_code}' -X POST -H "Content-Type: application/json" -d '{}' "$url" || true
  }

  echo "Trigger deploy via Netlify deploy-hook..."
  HOOK_RESPONSE_CODE="$(trigger_hook "$DEPLOY_HOOK_URL")"

  if [[ "$HOOK_RESPONSE_CODE" == "200" || "$HOOK_RESPONSE_CODE" == "201" || "$HOOK_RESPONSE_CODE" == "202" ]]; then
    cat "$RESPONSE_FILE"
    echo
    echo "Hook deploy triggat. Kontrollera status i Netlify UI > Deploys."
    exit 0
  fi

  # Fallback: vissa länkar delas som preview_server_hooks, men build_hooks är vanlig endpoint.
  if [[ "$HOOK_RESPONSE_CODE" == "404" && "$DEPLOY_HOOK_URL" == *"/preview_server_hooks/"* ]]; then
    FALLBACK_HOOK_URL="${DEPLOY_HOOK_URL/\/preview_server_hooks\//\/build_hooks\/}"
    echo "Hook-URL gav 404. Försöker fallback till build_hooks-endpoint..."
    HOOK_RESPONSE_CODE="$(trigger_hook "$FALLBACK_HOOK_URL")"

    if [[ "$HOOK_RESPONSE_CODE" == "200" || "$HOOK_RESPONSE_CODE" == "201" || "$HOOK_RESPONSE_CODE" == "202" ]]; then
      cat "$RESPONSE_FILE"
      echo
      echo "Hook deploy triggat via fallback-endpoint. Kontrollera status i Netlify UI > Deploys."
      exit 0
    fi
  fi

  echo "Fel: deploy-hook misslyckades (HTTP $HOOK_RESPONSE_CODE)."
  echo "Tips: kontrollera att länken är en giltig Build hook i Netlify (Site configuration > Build & deploy > Build hooks)."
  print_hook_recovery_steps
  if [[ -s "$RESPONSE_FILE" ]]; then
    echo "Svar från server:"
    cat "$RESPONSE_FILE"
  fi
  exit 1
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
