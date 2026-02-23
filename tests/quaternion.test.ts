import {
  composeQuats,
  delta3,
  dimensionlessUnit,
  dir3,
  frame,
  quantity,
  quat,
  quatConjugate,
  quatFromAxisAngle,
  quatFromAxisAngleUnsafe,
  quatFromEuler,
  quatIdentity,
  quatInverse,
  quatInverseUnsafe,
  quatNlerp,
  quatNlerpUnsafe,
  quatNorm,
  quatNormalize,
  quatNormalizeUnsafe,
  quatNormSquared,
  quatSlerp,
  quatSlerpUnsafe,
  rotateVec3ByQuat,
  rotateVec3ByQuatUnsafe,
  unit,
} from '../mod.ts';
import {
  assert,
  assertAlmostEquals,
  assertEquals,
  assertThrows,
} from './assert.test.ts';

const assertQuatAlmostEquals = (
  actual: readonly number[],
  expected: readonly number[],
): void => {
  assertEquals(actual.length, expected.length);
  for (let i = 0; i < actual.length; i += 1) {
    assertAlmostEquals(actual[i]!, expected[i]!);
  }
};

Deno.test('quaternion constructors and norms', () => {
  const frame_A = frame('a');
  const frame_B = frame('b');

  const quat_raw_AB = quat(frame_A, frame_B, 1, 2, 3, 4);
  assertEquals(quat_raw_AB, [1, 2, 3, 4]);
  assertEquals(quatIdentity(frame('world')), [0, 0, 0, 1]);
  assertEquals(quatConjugate(quat_raw_AB), [-1, -2, -3, 4]);
  assertEquals(quatNormSquared(quat_raw_AB), 30);
  assertAlmostEquals(quatNorm(quat_raw_AB), Math.sqrt(30));
});

Deno.test('quaternion normalization inversion and errors', () => {
  const frame_A = frame('a');
  const frame_B = frame('b');

  const quat_scaled_AB = quat(frame_A, frame_B, 0, 0, 0, 2);
  assertQuatAlmostEquals(quatNormalize(quat_scaled_AB), [0, 0, 0, 1]);
  assertQuatAlmostEquals(quatInverse(quat_scaled_AB), [0, 0, 0, 0.5]);

  assertThrows(
    () => quatNormalize(quat(frame_A, frame_B, 0, 0, 0, 0)),
    Error,
    'Cannot normalize a zero-length quaternion',
  );
  assertThrows(
    () => quatInverse(quat(frame_A, frame_B, 0, 0, 0, 0)),
    Error,
    'Cannot invert a zero-length quaternion',
  );

  assertThrows(
    () => quatNormalize(quat(frame_A, frame_B, 1e-300, 0, 0, 0)),
    Error,
    'Cannot normalize a zero-length quaternion',
  );
  assertThrows(
    () => quatInverse(quat(frame_A, frame_B, 0, 0, 1e-300, 0)),
    Error,
    'Cannot invert a zero-length quaternion',
  );
});

Deno.test('quaternion composition and vector rotation', () => {
  const frame_world = frame('world');
  const frame_up = frame('up');
  const meter = unit('m');

  const dir_axisz_up = dir3(
    frame_up,
    quantity(dimensionlessUnit, 0),
    quantity(dimensionlessUnit, 0),
    quantity(dimensionlessUnit, 2),
  );
  const dir_axisy_up = dir3(
    frame_up,
    quantity(dimensionlessUnit, 0),
    quantity(dimensionlessUnit, 1),
    quantity(dimensionlessUnit, 0),
  );

  const quat_z90_up_up = quatFromAxisAngle(
    frame_up,
    dir_axisz_up,
    Math.PI / 2,
  );
  const quat_y90_up_up = quatFromAxisAngle(
    frame_up,
    dir_axisy_up,
    Math.PI / 2,
  );
  const quat_identity_world_up = quat(frame_world, frame_up, 0, 0, 0, 1);

  const delta_x_up = delta3(
    frame_up,
    quantity(meter, 1),
    quantity(meter, 0),
    quantity(meter, 0),
  );
  const delta_afterz_up = rotateVec3ByQuat(quat_z90_up_up, delta_x_up);
  assertAlmostEquals(delta_afterz_up[0], 0, 1e-12);
  assertAlmostEquals(delta_afterz_up[1], 1, 1e-12);
  assertAlmostEquals(delta_afterz_up[2], 0, 1e-12);

  const delta_world = rotateVec3ByQuat(quat_identity_world_up, delta_x_up);
  assertAlmostEquals(delta_world[0], 1, 1e-12);
  assertAlmostEquals(delta_world[1], 0, 1e-12);
  assertAlmostEquals(delta_world[2], 0, 1e-12);

  const quat_z90_world_up = composeQuats(
    quat_identity_world_up,
    quat_z90_up_up,
  );
  const delta_z90_world = rotateVec3ByQuat(quat_z90_world_up, delta_x_up);
  assertAlmostEquals(delta_z90_world[0], 0, 1e-12);
  assertAlmostEquals(delta_z90_world[1], 1, 1e-12);
  assertAlmostEquals(delta_z90_world[2], 0, 1e-12);

  const quat_tilted_world_up = composeQuats(
    quat_identity_world_up,
    quat_y90_up_up,
  );
  const delta_tilted_world = rotateVec3ByQuat(quat_tilted_world_up, delta_x_up);
  assertAlmostEquals(delta_tilted_world[0], 0, 1e-12);
  assertAlmostEquals(delta_tilted_world[1], 0, 1e-12);
  assertAlmostEquals(Math.abs(delta_tilted_world[2]), 1, 1e-12);
});

Deno.test('quaternion euler and interpolation helpers', () => {
  const frame_world = frame('world');
  const meter = unit('m');
  const dir_axisz_world = dir3(
    frame_world,
    quantity(dimensionlessUnit, 0),
    quantity(dimensionlessUnit, 0),
    quantity(dimensionlessUnit, 1),
  );
  const quat_z90_world_world = quatFromEuler(
    frame_world,
    0,
    0,
    Math.PI / 2,
    'XYZ',
  );

  const delta_x_world = delta3(
    frame_world,
    quantity(meter, 1),
    quantity(meter, 0),
    quantity(meter, 0),
  );
  const delta_rotated_world = rotateVec3ByQuat(quat_z90_world_world, delta_x_world);
  assertAlmostEquals(delta_rotated_world[0], 0, 1e-12);
  assertAlmostEquals(delta_rotated_world[1], 1, 1e-12);
  assertAlmostEquals(delta_rotated_world[2], 0, 1e-12);

  const quat_180_world_world = quatFromAxisAngle(
    frame_world,
    dir_axisz_world,
    Math.PI,
  );
  const quat_nlerp_world_world = quatNlerp(
    quatIdentity(frame_world),
    quat_180_world_world,
    0.5,
  );
  const quat_slerp_world_world = quatSlerp(
    quatIdentity(frame_world),
    quat_180_world_world,
    0.5,
  );

  const delta_nlerp_world = rotateVec3ByQuat(quat_nlerp_world_world, delta_x_world);
  const delta_slerp_world = rotateVec3ByQuat(quat_slerp_world_world, delta_x_world);
  assertAlmostEquals(delta_nlerp_world[0], 0, 1e-12);
  assertAlmostEquals(delta_nlerp_world[1], 1, 1e-12);
  assertAlmostEquals(delta_slerp_world[0], 0, 1e-12);
  assertAlmostEquals(delta_slerp_world[1], 1, 1e-12);

  const quat_negidentity_world_world = quat(
    frame_world,
    frame_world,
    0,
    0,
    0,
    -1,
  );
  const quat_shortest_nlerp_world_world = quatNlerp(
    quatIdentity(frame_world),
    quat_negidentity_world_world,
    0.5,
  );
  const quat_shortest_slerp_world_world = quatSlerp(
    quatIdentity(frame_world),
    quat_negidentity_world_world,
    0.5,
  );
  assertQuatAlmostEquals(quat_shortest_nlerp_world_world, [0, 0, 0, 1]);
  assertQuatAlmostEquals(quat_shortest_slerp_world_world, [0, 0, 0, 1]);
});

Deno.test('axis-angle rejects zero axis', () => {
  const frame_world = frame('world');
  const dir_axiszero_world = dir3(
    frame_world,
    quantity(dimensionlessUnit, 0),
    quantity(dimensionlessUnit, 0),
    quantity(dimensionlessUnit, 0),
  );

  assertThrows(
    () => quatFromAxisAngle(frame_world, dir_axiszero_world, Math.PI / 2),
    Error,
    'Cannot normalize a zero-length vector',
  );
});

Deno.test('unsafe quaternion helpers skip validation checks', () => {
  const frame_world = frame('world');
  const meter = unit('m');
  const quat_zero_world_world = quat(frame_world, frame_world, 0, 0, 0, 0);
  const quat_identity_world_world = quat(frame_world, frame_world, 0, 0, 0, 1);
  const quat_negidentity_world_world = quat(
    frame_world,
    frame_world,
    0,
    0,
    0,
    -1,
  );
  const dir_axiszero_world = dir3(
    frame_world,
    quantity(dimensionlessUnit, 0),
    quantity(dimensionlessUnit, 0),
    quantity(dimensionlessUnit, 0),
  );
  const delta_x_world = delta3(
    frame_world,
    quantity(meter, 1),
    quantity(meter, 0),
    quantity(meter, 0),
  );

  const quat_normalized_world_world = quatNormalizeUnsafe(
    quat_zero_world_world,
  );
  assert(Number.isNaN(quat_normalized_world_world[0]));

  const quat_inverse_world_world = quatInverseUnsafe(quat_zero_world_world);
  assert(Number.isNaN(quat_inverse_world_world[3]));

  const delta_rotated_world = rotateVec3ByQuatUnsafe(quat_zero_world_world, delta_x_world);
  assert(Number.isNaN(delta_rotated_world[0]));

  const quat_axis_world_world = quatFromAxisAngleUnsafe(
    frame_world,
    dir_axiszero_world,
    Math.PI / 2,
  );
  assert(Number.isNaN(quat_axis_world_world[0]));

  const quat_nlerp_world_world = quatNlerpUnsafe(
    quat_zero_world_world,
    quat_zero_world_world,
    0.5,
  );
  assert(Number.isNaN(quat_nlerp_world_world[0]));
  const quat_nlerp_shortest_world_world = quatNlerpUnsafe(
    quat_identity_world_world,
    quat_negidentity_world_world,
    0.5,
  );
  assertQuatAlmostEquals(quat_nlerp_shortest_world_world, [0, 0, 0, 1]);

  const quat_slerp_world_world = quatSlerpUnsafe(
    quat_zero_world_world,
    quat_zero_world_world,
    0.5,
  );
  assert(Number.isNaN(quat_slerp_world_world[0]));
  const quat_slerp_shortest_world_world = quatSlerpUnsafe(
    quat_identity_world_world,
    quat_negidentity_world_world,
    0.5,
  );
  assertQuatAlmostEquals(quat_slerp_shortest_world_world, [0, 0, 0, 1]);
});
