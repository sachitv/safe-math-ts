#!/usr/bin/env bash
# Runs all runtime compat tests in sequence.
# Usage: bash tests/compat/run-all.sh
#        deno task compat
#
# Deno is already covered by the main `deno task test` suite, so it is not
# repeated here. This script focuses on the four other target runtimes.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

echo "=== Building npm package ==="
deno task npm:build

echo ""
echo "=== Installing compat tooling ==="
(cd tests/compat && npm install --silent)
(cd tests/compat && npx playwright install chromium)

echo ""
echo "[1/4] Bun (full test suite via Deno.test shim)"
bun test --preload ./tests/compat/bun-deno-shim.ts ./tests/*.test.ts ./examples/*.test.ts

echo ""
echo "[2/4] Node.js (full test suite via Deno.test shim)"
node --import ./tests/compat/node-deno-shim.mjs --test ./tests/*.test.ts ./examples/*.test.ts

echo ""
echo "[3/4] Cloudflare Workers (full test suite via Deno.test shim)"
(cd tests/compat/cloudflare && npx vitest run)

echo ""
echo "[4/4] Browser (Chromium)"
(cd tests/compat/browser && npx playwright test)

echo ""
echo "All 4 compat tests passed."
