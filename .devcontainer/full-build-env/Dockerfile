FROM mcr.microsoft.com/devcontainers/base:ubuntu-24.04

# Install Playwright Chromium OS-level dependencies non-interactively
RUN apt-get update && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
    libasound2t64 \
    libatk-bridge2.0-0t64 \
    libatk1.0-0t64 \
    libatspi2.0-0t64 \
    libcairo2 \
    libcups2t64 \
    libdbus-1-3 \
    libgbm1 \
    libglib2.0-0t64 \
    libnspr4 \
    libnss3 \
    libpango-1.0-0 \
    libx11-6 \
    libxcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxkbcommon0 \
    libxrandr2 \
    && rm -rf /var/lib/apt/lists/*

# Create credential directories for opencode/codex bind mounts
RUN mkdir -p /home/vscode/.local/state /home/vscode/.codex /home/vscode/.local/share/opencode /home/vscode/.config/opencode \
    && chown -R vscode:vscode /home/vscode/.local/state /home/vscode/.codex /home/vscode/.local/share /home/vscode/.config
