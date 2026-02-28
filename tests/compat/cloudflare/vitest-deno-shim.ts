// Maps Deno.test() to Vitest's test() so the existing test suite runs inside
// the Cloudflare Workers runtime (workerd) via @cloudflare/vitest-pool-workers.
import { test } from 'vitest';

(globalThis as never as { Deno: unknown }).Deno = { test };
