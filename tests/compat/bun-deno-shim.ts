// Minimal shim that maps Deno.test() to Bun's test() so the existing
// Deno test suite can run unmodified under Bun.
// Loaded via: bun test --preload tests/compat/bun-deno-shim.ts
import { test } from 'bun:test';

(globalThis as never as { Deno: unknown }).Deno = { test };
