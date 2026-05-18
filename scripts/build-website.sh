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

# 部署包使用根相对路径（开发时 website/index.html 用 ../）
if sed --version 2>/dev/null | grep -q GNU; then
  sed -i 's|"\.\./icons/|"icons/|g; s|"\.\./shared/|"shared/|g' "$OUT/index.html"
else
  sed -i '' 's|"\.\./icons/|"icons/|g; s|"\.\./shared/|"shared/|g' "$OUT/index.html"
fi

echo "网站构建完成: $OUT"
