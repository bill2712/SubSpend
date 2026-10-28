#!/usr/bin/env bash
# Build for GitHub Pages (served from /SubSpend/) and publish dist/ to the gh-pages branch.
# Usage: npm run deploy:gh-pages
set -euo pipefail
repo="$(cd "$(dirname "$0")/.." && pwd)"
cd "$repo"
npm run build:gh-pages
rev="$(git rev-parse --short HEAD)"
tmp="$(mktemp -d)"
trap 'git -C "$repo" worktree remove --force "$tmp" >/dev/null 2>&1 || true; git -C "$repo" branch -D gh-pages-tmp >/dev/null 2>&1 || true' EXIT
git worktree add --detach "$tmp" >/dev/null 2>&1
cd "$tmp"
git checkout --orphan gh-pages-tmp >/dev/null 2>&1
git rm -rfq . >/dev/null 2>&1 || true
cp -R "$repo/dist/." .
rm -rf .vite
git add -A
git commit -qm "Deploy $rev to GitHub Pages"
git push -f origin HEAD:gh-pages
echo "Deployed. Live at https://bill2712.github.io/SubSpend/ (allow a minute for GitHub to publish)."
