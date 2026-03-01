#!/bin/bash
set -e

# --- Directory ownership (for mounted credential files) ---
sudo mkdir -p /home/vscode/.local/state /home/vscode/.codex /home/vscode/.local/share/opencode /home/vscode/.config/opencode
sudo chown -R vscode:vscode /home/vscode/.local/state /home/vscode/.codex /home/vscode/.local/share /home/vscode/.config || true

# --- Playwright: install Chrome and its OS-level dependencies ---
npx playwright install chrome --with-deps
