import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  resolve: {
    alias: [
      {
        find: /.*_dnt\.test_shims\.js$/,
        replacement: fileURLToPath(
          new URL('./esm/vitest-deno-shim.mjs', import.meta.url),
        ),
      },
    ],
  },
  test: {
    browser: {
      enabled: true,
      headless: true,
      provider: 'playwright',
      instances: [{ browser: 'chromium' }],
    },
    include: ['esm/tests/*.test.js', 'esm/examples/*.test.js'],
  },
});
