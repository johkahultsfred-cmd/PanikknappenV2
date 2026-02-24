#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Användning:
  ./scripts/samla-repos.sh <repo-url-1> [repo-url-2 ...]

Exempel:
  ./scripts/samla-repos.sh \
    https://github.com/ditt-konto/PanikknappenV2.git \
    https://github.com/ditt-konto/panik-overlay.git

Vad scriptet gör:
  1) Skapar mappen import/repos i repo-roten.
  2) Klonar varje repo dit (eller kör git pull om mappen redan finns).
EOF
}

if [[ "${1:-}" == "-h" || "${1:-}" == "--help" ]]; then
  usage
  exit 0
fi

if [[ "$#" -lt 1 ]]; then
  echo "Fel: du måste skicka minst en repo-URL." >&2
  usage
  exit 1
fi

repo_root="$(git rev-parse --show-toplevel)"
target_dir="$repo_root/import/repos"
mkdir -p "$target_dir"

for repo_url in "$@"; do
  repo_name="$(basename "$repo_url" .git)"
  repo_path="$target_dir/$repo_name"

  if [[ -d "$repo_path/.git" ]]; then
    echo "Uppdaterar befintlig repo: $repo_name"
    git -C "$repo_path" pull --ff-only
  else
    echo "Klonar: $repo_url -> $repo_path"
    git clone "$repo_url" "$repo_path"
  fi
done

echo
echo "Klart. Dina importerade repos finns i: $target_dir"
echo "Verifiera med: rg --files import/repos | head -n 40"
