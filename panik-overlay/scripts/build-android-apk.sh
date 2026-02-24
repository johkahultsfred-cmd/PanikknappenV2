#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ANDROID_DIR="$ROOT_DIR/android"
APK_PATH="$ANDROID_DIR/app/build/outputs/apk/debug/app-debug.apk"

if [[ ! -d "$ANDROID_DIR" ]]; then
  echo "Fel: android-mappen saknas. Kör först: cd panik-overlay && npx cap add android"
  exit 1
fi

if [[ -z "${ANDROID_HOME:-}" && -z "${ANDROID_SDK_ROOT:-}" && ! -f "$ANDROID_DIR/local.properties" ]]; then
  echo "Fel: Android SDK hittades inte."
  echo "Lösning: sätt ANDROID_HOME/ANDROID_SDK_ROOT eller skapa android/local.properties med sdk.dir=/din/sdk/sökväg"
  exit 1
fi

echo "Steg 1/2: synkar webbfiler till Android-projekt..."
cd "$ROOT_DIR"
node scripts/build-webdir.js
npx @capacitor/cli@7 sync android

echo "Steg 2/2: bygger debug APK..."
cd "$ANDROID_DIR"
./gradlew assembleDebug

echo "Klar: APK finns här -> $APK_PATH"
