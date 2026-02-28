import { defineWorkersConfig } from '@cloudflare/vitest-pool-workers/config';

export default defineWorkersConfig({
  test: {
    poolOptions: {
      workers: {
        wrangler: { configPath: './wrangler.toml' },
      },
    },
    // Shim runs inside workerd before each test file, mapping Deno.test → vitest test().
    setupFiles: ['./vitest-deno-shim.ts'],
    include: ['../../../tests/*.test.ts', '../../../examples/*.test.ts'],
    // assert.test.ts is a helper module with no tests; compat/** is infrastructure.
    exclude: ['../../../tests/assert.test.ts', '../../../tests/compat/**'],
  },
});
