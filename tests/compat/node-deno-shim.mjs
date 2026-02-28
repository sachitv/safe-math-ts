// Minimal shim that maps Deno.test() to Node.js's built-in test() so the
// existing Deno test suite can run unmodified under Node.js.
// Loaded via: node --import ./tests/compat/node-deno-shim.mjs --test ...
import { test } from 'node:test';

globalThis.Deno = { test };
