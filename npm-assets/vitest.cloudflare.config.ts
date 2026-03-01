import { defineWorkersConfig } from '@cloudflare/vitest-pool-workers/config';
import { fileURLToPath } from 'node:url';

export default defineWorkersConfig({
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
    poolOptions: {
      workers: { wrangler: { configPath: './wrangler.toml' } },
    },
    include: ['esm/tests/*.test.js', 'esm/examples/*.test.js'],
  },
});
