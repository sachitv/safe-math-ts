# Developing

Development workflow for `safe-math-ts`.

## Requirements

- Deno 2.x

## Local Commands

```sh
deno task check
deno test -A
deno test -A --coverage=coverage
deno coverage coverage
deno bench --no-check benchmarks
```

`deno test -A` is the default verification command before committing.

## Project Structure

- `src/units.ts` Core unit-safe scalar math and unit type machinery.
- `src/geometry3d/` Frame-safe vector/quaternion/matrix APIs.
- `tests/` Unit, runtime, and compile-time type safety checks.
- `examples/` Usage scenarios validated as tests.

## Design Rules

- Keep zero runtime dependencies.
- Preserve function-only API (no classes).
- Keep frame generics in `<ToFrame, FromFrame>` order.
- Safe functions validate and throw; `Unsafe` variants skip validation.
- Prefer explicit intermediate variables for dense math expressions.

## Type Safety Rules

- `unit(...)` should only accept literal/narrow string expressions.
- Widened `string` unit names must fail at compile time.
- Add `@ts-expect-error` cases in `tests/type_safety.test.ts` for regressions.

## Testing Expectations

- Maintain full test pass and 100% line/branch coverage.
- For behavior changes, add/adjust runtime tests.
- For typing changes, add/adjust compile-time assertions and negative cases.

## Documentation

- Keep `README.md` user-oriented.
- Keep API docs in `README.md` concise and focused on non-obvious constraints.
- Update docs in the same change when public API behavior changes.
