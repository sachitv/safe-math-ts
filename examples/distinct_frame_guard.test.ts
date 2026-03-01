import { dimensionlessUnit, frame, mat4, quat } from '../mod.ts';
import type { FrameTag } from '../mod.ts';
import { assertThrows } from '../tests/assert.ts';

Deno.test('example: quat and mat4 constructors reject identical to/from frames at runtime', () => {
  const frame_world = frame('world');
  const frame_body = frame('body');

  // Distinct frames compile and run cleanly.
  quat(frame_world, frame_body, 0, 0, 0, 1);
  mat4(frame_world, frame_body, dimensionlessUnit, [
    1,
    0,
    0,
    0,
    0,
    1,
    0,
    0,
    0,
    0,
    1,
    0,
    0,
    0,
    0,
    1,
  ]);

  // TypeScript prevents identical frames at compile time via the DistinctFramePair
  // constraint. We use casts with distinct type literals but the same runtime token
  // to exercise the runtime guard.
  const alias_to = frame_world as unknown as FrameTag<'to'>;
  const alias_from = frame_world as unknown as FrameTag<'from'>;

  assertThrows(
    () => quat(alias_to, alias_from, 0, 0, 0, 1),
    Error,
    'toFrameTag and fromFrameTag must be different',
  );

  assertThrows(
    () =>
      mat4(alias_to, alias_from, dimensionlessUnit, [
        1,
        0,
        0,
        0,
        0,
        1,
        0,
        0,
        0,
        0,
        1,
        0,
        0,
        0,
        0,
        1,
      ]),
    Error,
    'toFrameTag and fromFrameTag must be different',
  );
});
