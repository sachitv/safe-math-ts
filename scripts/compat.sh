#!/usr/bin/env bash
# Runs all runtime compat tests in sequence.
# Usage: bash scripts/compat.sh
#        deno task compat
#
# Deno is already covered by the main `deno task test` suite, so it is not
# repeated here. This script focuses on the four other target runtimes.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "=== Building npm package (compiles + runs Node tests) ==="
deno task npm:build

echo ""
echo "=== Installing npm package deps ==="
(cd npm && npm install --silent)
(cd npm && npx playwright install chromium)

echo ""
echo "[1/4] Bun (compiled npm tests)"
(cd npm && bun run ./test_runner.cjs)

echo ""
echo "[2/4] Node.js (compiled npm tests — also ran during npm:build)"
(cd npm && node test_runner.cjs)

echo ""
echo "[3/4] Cloudflare Workers (compiled npm tests)"
(cd npm && npx vitest run -c vitest.cloudflare.config.ts)

echo ""
echo "[4/4] Browser (Chromium)"
(cd npm && npx vitest run -c vitest.browser.config.ts)

echo ""
echo "All 4 compat tests passed."
