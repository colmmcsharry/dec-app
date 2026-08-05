#!/usr/bin/env bash
# Detect (and optionally wipe) iCloud/Finder conflict copies that break Android builds.
# Those show up as "file 2.xml", "intermediates 3", etc. inside android build dirs.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

MODE="${1:-check}" # check | clean | fix

paths=(
  "android/app/build"
  "android/app/.cxx"
  "android/build"
)

junk=()
while IFS= read -r -d '' f; do
  junk+=("$f")
done < <(
  find "${paths[@]}" \
    \( -name '* *' -o -name '* 2' -o -name '* 2.*' -o -name '* 3' -o -name '* 3.*' \) \
    \( -type f -o -type d \) -print0 2>/dev/null || true
)

if [[ "$MODE" == "clean" || "$MODE" == "fix" ]]; then
  echo "Wiping Android build caches…"
  rm -rf "${paths[@]}"
  echo "Done. Next Android Studio build will be a full rebuild (slower once)."
  exit 0
fi

if ((${#junk[@]} > 0)); then
  echo "⚠  Found ${#junk[@]} iCloud/Finder junk path(s) that will break/slow Android builds."
  printf '  %s\n' "${junk[@]:0:15}"
  if ((${#junk[@]} > 15)); then
    echo "  …and $((${#junk[@]} - 15)) more"
  fi
  echo ""
  echo "Fix now:  npm run android:clean"
  exit 1
fi

echo "✓ Android build folders look clean (no 'file 2.xml' junk)."
exit 0
