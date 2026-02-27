#!/bin/bash
set -e

# Create directories before touching ownership
sudo mkdir -p /home/vscode/.local/state /home/vscode/.codex /home/vscode/.local/share/opencode /home/vscode/.config/opencode

# Only change ownership of directories we own (not the read-only mounted files)
sudo chown -R vscode:vscode /home/vscode/.local/state /home/vscode/.codex /home/vscode/.local/share /home/vscode/.config || true
