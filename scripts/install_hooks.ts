const source = new URL('../.githooks/pre-commit', import.meta.url);
const target = new URL('../.git/hooks/pre-commit', import.meta.url);

const sourcePath = decodeURIComponent(source.pathname);
const targetPath = decodeURIComponent(target.pathname);

const gitHooksDir = decodeURIComponent(
  new URL('../.git/hooks', import.meta.url).pathname,
);
await Deno.mkdir(gitHooksDir, { recursive: true });
await Deno.copyFile(sourcePath, targetPath);
await Deno.chmod(targetPath, 0o755);

console.log(`Installed pre-commit hook at ${targetPath}`);
console.log(`Source hook: ${sourcePath}`);
