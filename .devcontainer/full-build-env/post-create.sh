#!/bin/bash
set -e

# --- Directory ownership (for mounted credential files) ---
sudo mkdir -p /home/vscode/.local/state /home/vscode/.codex /home/vscode/.local/share/opencode /home/vscode/.config/opencode
sudo chown -R vscode:vscode /home/vscode/.local/state /home/vscode/.codex /home/vscode/.local/share /home/vscode/.config || true

# --- Bun ---
curl -fsSL https://bun.sh/install | bash
# Symlink into /usr/local/bin so Bun is on PATH for all shells and scripts.
sudo ln -sf "${HOME}/.bun/bin/bun" /usr/local/bin/bun

# --- Compat test tooling (wrangler + @playwright/test) ---
(cd tests/compat && npm install)

# --- Playwright: install Chromium and its OS-level dependencies ---
(cd tests/compat && npx playwright install chromium --with-deps)
