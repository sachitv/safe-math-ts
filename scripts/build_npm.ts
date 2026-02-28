import { build, emptyDir } from '@deno/dnt';

// Use Deno APIs directly to avoid needing @std/jsonc if it's not in deps
const denoConfigText = await Deno.readTextFile('./deno.json');
const denoConfig = JSON.parse(denoConfigText) as { version?: string };
const pkgVersion = typeof denoConfig.version === 'string'
  ? denoConfig.version
  : '0.0.0';

// Produce the npm package artifacts from the canonical Deno entrypoint.
await emptyDir('./npm');

await build({
  typeCheck: false,
  test: false,
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
    type: 'module',
    exports: {
      '.': {
        import: './esm/mod.js',
        types: './esm/mod.d.ts',
      },
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
