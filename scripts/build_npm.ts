import { build, emptyDir } from '@deno/dnt';

// Use Deno APIs directly to avoid needing @std/jsonc if it's not in deps
const denoConfigText = await Deno.readTextFile('./deno.json');
const denoConfig = JSON.parse(denoConfigText) as { version?: string };
const pkgVersion = typeof denoConfig.version === 'string'
  ? denoConfig.version
  : '0.0.0';

// Produce the npm package artifacts from the canonical Deno entrypoint.
await emptyDir('./npm');

// Note: "type" is intentionally omitted here so that dnt's generated
// test_runner.js (which uses require/CJS) works during the build-time test run.
// npm/esm/package.json (written by dnt) has {"type":"module"} so all source
// files under esm/ are still treated as ESM. We restore "type":"module" on
// the root package.json in the post-processing step below.
await build({
  typeCheck: false,
  test: true,
  scriptModule: false,
  entryPoints: ['./mod.ts'],
  outDir: './npm',
  package: {
    name: '@sachitv/safe-math-ts',
    version: pkgVersion,
    description:
      'A zero-dependency Deno/TypeScript 3D math library with strict compile-time safety.',
    license: 'MIT',
    repository: {
      type: 'git',
      url: 'git+https://github.com/sachitv/safe-math-ts.git',
    },
    bugs: {
      url: 'https://github.com/sachitv/safe-math-ts/issues',
    },
    homepage: 'https://github.com/sachitv/safe-math-ts',
    engines: {
      node: '>=22',
    },
    sideEffects: false,
    publishConfig: {
      access: 'public',
    },
    exports: {
      '.': {
        import: './esm/mod.js',
        types: './esm/mod.d.ts',
      },
    },
    devDependencies: {
      'vitest': '^3.0.0',
      '@vitest/browser': '^3.0.0',
      'playwright': '^1.50.0',
      '@cloudflare/vitest-pool-workers': '^0.12.18',
      'wrangler': '^3.101.0',
    },
  },
  packageManager: 'npm',
  shims: {
    deno: 'dev',
  },
  compilerOptions: {
    lib: ['ESNext', 'DOM'],
  },
});

await Deno.copyFile('./README.md', './npm/README.md');
await Deno.copyFile('./LICENSE', './npm/LICENSE');

// --- Post-processing ---

// 1. Rename test_runner.js → test_runner.cjs and restore "type":"module" on
//    the root package.json (safe to do now that dnt's test run is complete).
await Deno.rename('./npm/test_runner.js', './npm/test_runner.cjs');
const pkgJson = JSON.parse(await Deno.readTextFile('./npm/package.json'));
pkgJson.type = 'module';
pkgJson.scripts.test = 'node test_runner.cjs';
await Deno.writeTextFile(
  './npm/package.json',
  JSON.stringify(pkgJson, null, 2) + '\n',
);

// 2-5. Copy vitest configs, wrangler config, and the vitest Deno.test shim
//      from npm-assets/ into the npm output directory.
await Deno.copyFile('./npm-assets/wrangler.toml', './npm/wrangler.toml');
await Deno.copyFile(
  './npm-assets/esm/vitest-deno-shim.mjs',
  './npm/esm/vitest-deno-shim.mjs',
);
await Deno.copyFile(
  './npm-assets/vitest.cloudflare.config.ts',
  './npm/vitest.cloudflare.config.ts',
);
await Deno.copyFile(
  './npm-assets/vitest.browser.config.ts',
  './npm/vitest.browser.config.ts',
);
