#!/usr/bin/env bash
# 组装 GitHub Pages 静态站点：website + icons + shared → .website-dist
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT="${ROOT}/.website-dist"

rm -rf "$OUT"
mkdir -p "$OUT"

cp -R "${ROOT}/website/"* "$OUT/"
cp -R "${ROOT}/icons" "$OUT/icons"
cp -R "${ROOT}/shared" "$OUT/shared"

echo "网站构建完成: $OUT"
