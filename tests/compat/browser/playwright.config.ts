import { defineConfig, devices } from '@playwright/test';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// Project root is three levels up from this file (tests/compat/browser/).
const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');

export default defineConfig({
  testDir: '.',
  // Use Python's built-in static file server — no extra npm package required.
  webServer: {
    command: 'python3 -m http.server 3000',
    cwd: projectRoot,
    port: 3000,
    reuseExistingServer: !process.env.CI,
  },
  use: {
    baseURL: 'http://localhost:3000',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});
