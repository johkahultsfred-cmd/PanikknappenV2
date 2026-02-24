#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'HELP'
Användning:
  ./scripts/samla-repos.sh <källa-1> [källa-2 ...]

Källor som stöds:
  - GitHub-URL/repo-URL (klonas till import/repos)
  - Lokal mappväg (kopieras till import/repos)

Exempel 1 (GitHub-repos):
  ./scripts/samla-repos.sh \
    https://github.com/ditt-konto/PanikknappenV2.git \
    https://github.com/ditt-konto/panik-overlay.git

Exempel 2 (Windows via /mnt/c):
  ./scripts/samla-repos.sh \
    "/mnt/c/panikknappen-samlad/PanikknappenV2" \
    "/mnt/c/panikknappen-samlad/panik-overlay"

Vad scriptet gör:
  1) Skapar mappen import/repos i repo-roten.
  2) För git-URL: git clone (eller git pull --ff-only om repo redan finns).
  3) För lokal mapp: kopierar innehåll (skriver över befintliga filer med samma namn).
HELP
}

is_repo_url() {
  local input="$1"
  [[ "$input" =~ ^https?:// ]] || [[ "$input" =~ ^git@ ]]
}

if [[ "${1:-}" == "-h" || "${1:-}" == "--help" ]]; then
  usage
  exit 0
fi

if [[ "$#" -lt 1 ]]; then
  echo "Fel: du måste skicka minst en källa." >&2
  usage
  exit 1
fi

repo_root="$(git rev-parse --show-toplevel)"
target_dir="$repo_root/import/repos"
mkdir -p "$target_dir"

for source in "$@"; do
  if is_repo_url "$source"; then
    repo_name="$(basename "$source" .git)"
    repo_path="$target_dir/$repo_name"

    if [[ -d "$repo_path/.git" ]]; then
      echo "Uppdaterar befintlig repo: $repo_name"
      git -C "$repo_path" pull --ff-only
    else
      echo "Klonar: $source -> $repo_path"
      git clone "$source" "$repo_path"
    fi
    continue
  fi

  if [[ -d "$source" ]]; then
    folder_name="$(basename "$source")"
    folder_path="$target_dir/$folder_name"

    mkdir -p "$folder_path"
    echo "Kopierar lokal mapp: $source -> $folder_path"
    cp -a "$source"/. "$folder_path"/
    continue
  fi

  echo "Fel: okänd källa eller mapp saknas: $source" >&2
  exit 1

done

echo
echo "Klart. Dina importerade mappar finns i: $target_dir"
echo "Verifiera med: rg --files import/repos | head -n 40"
