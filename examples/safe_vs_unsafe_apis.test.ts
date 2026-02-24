import {
  delta3,
  frame,
  normalizeVec3,
  normalizeVec3Unsafe,
  projectVec3,
  projectVec3Unsafe,
  quantity,
  unit,
} from '../mod.ts';
import {
  GEOM_EPS,
  assert,
  assertThrows,
  assertVec3AlmostEquals,
} from '../tests/assert.test.ts';

Deno.test('example: safe and unsafe API behavior on validated and degenerate inputs', () => {
  const frame_world = frame('world');
  const meter = unit('m');

  const delta_input_world = delta3(
    frame_world,
    quantity(meter, 3),
    quantity(meter, 4),
    quantity(meter, 0),
  );
  const delta_axisy_world = delta3(
    frame_world,
    quantity(meter, 0),
    quantity(meter, 1),
    quantity(meter, 0),
  );
  const delta_zero_world = delta3(
    frame_world,
    quantity(meter, 0),
    quantity(meter, 0),
    quantity(meter, 0),
  );

  const dir_safe_world = normalizeVec3(delta_input_world);
  const dir_unsafe_world = normalizeVec3Unsafe(delta_input_world);
  assertVec3AlmostEquals(dir_safe_world, dir_unsafe_world, GEOM_EPS);

  const delta_proj_safe_world = projectVec3(delta_input_world, delta_axisy_world);
  const delta_proj_unsafe_world = projectVec3Unsafe(
    delta_input_world,
    delta_axisy_world,
  );
  assertVec3AlmostEquals(delta_proj_safe_world, delta_proj_unsafe_world, GEOM_EPS);

  assertThrows(
    () => normalizeVec3(delta_zero_world),
    Error,
    'Cannot normalize a zero-length vector',
  );
  assertThrows(
    () => projectVec3(delta_input_world, delta_zero_world),
    Error,
    'Cannot project onto a zero-length vector',
  );

  const dir_from_zero_unsafe = normalizeVec3Unsafe(delta_zero_world);
  const delta_proj_zero_unsafe = projectVec3Unsafe(delta_input_world, delta_zero_world);
  assert(
    !Number.isFinite(dir_from_zero_unsafe[0])
      || !Number.isFinite(dir_from_zero_unsafe[1])
      || !Number.isFinite(dir_from_zero_unsafe[2]),
  );
  assert(
    !Number.isFinite(delta_proj_zero_unsafe[0])
      || !Number.isFinite(delta_proj_zero_unsafe[1])
      || !Number.isFinite(delta_proj_zero_unsafe[2]),
  );
});
