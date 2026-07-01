import {
  delta3,
  dimensionlessUnit,
  frame,
  mat4FromQuaternion,
  mat4Unsafe,
  quantity,
  quat,
  quatFromRotationMatrix,
  quatFromRotationMatrixUnsafe,
  quatNormalize,
  quatW,
  quatX,
  quatY,
  quatZ,
  rotateVec3ByQuat,
  unit,
} from '../mod.ts';
import {
  assertAlmostEquals,
  assertThrows,
  assertVec3AlmostEquals,
  GEOM_EPS,
} from '../tests/assert.ts';

Deno.test('example: recover quaternion from rotation matrix and read named components', () => {
  const frame_world = frame('world');
  const frame_body = frame('body');
  const meter = unit('m');

  // Build a 45° rotation around the Z axis (half-angle = 22.5°).
  const sin22 = Math.sin(Math.PI / 8);
  const cos22 = Math.cos(Math.PI / 8);
  const quat_z45_world_body = quat(frame_world, frame_body, 0, 0, sin22, cos22);

  // Convert to a pure rotation matrix, then recover the quaternion.
  const rot_world_body = mat4FromQuaternion(
    frame_world,
    frame_body,
    dimensionlessUnit,
    quat_z45_world_body,
  );
  const recovered_world_body = quatFromRotationMatrix(
    frame_world,
    frame_body,
    rot_world_body,
  );

  // Rotating +X body should land at (cos45, sin45, 0) world after a 45° Z rotation.
  const delta_x_body = delta3(
    frame_body,
    quantity(meter, 1),
    quantity(meter, 0),
    quantity(meter, 0),
  );
  const cos45 = Math.cos(Math.PI / 4);
  const sin45 = Math.sin(Math.PI / 4);
  assertVec3AlmostEquals(
    rotateVec3ByQuat(recovered_world_body, delta_x_body),
    [cos45, sin45, 0],
    GEOM_EPS,
  );

  // Named accessor functions (quatX/Y/Z/W) read the tuple's components; the
  // round-tripped quaternion matches the original component-wise.
  assertAlmostEquals(
    quatX(recovered_world_body),
    quatX(quat_z45_world_body),
    GEOM_EPS,
  );
  assertAlmostEquals(
    quatY(recovered_world_body),
    quatY(quat_z45_world_body),
    GEOM_EPS,
  );
  assertAlmostEquals(
    quatZ(recovered_world_body),
    quatZ(quat_z45_world_body),
    GEOM_EPS,
  );
  assertAlmostEquals(
    quatW(recovered_world_body),
    quatW(quat_z45_world_body),
    GEOM_EPS,
  );

  // quatFromRotationMatrixUnsafe skips orthonormality validation; on valid input
  // it produces the same result as the safe variant.
  const recovered_unsafe_world_body = quatFromRotationMatrixUnsafe(
    frame_world,
    frame_body,
    rot_world_body,
  );
  assertAlmostEquals(
    quatX(recovered_unsafe_world_body),
    quatX(recovered_world_body),
    GEOM_EPS,
  );
  assertAlmostEquals(
    quatY(recovered_unsafe_world_body),
    quatY(recovered_world_body),
    GEOM_EPS,
  );
  assertAlmostEquals(
    quatZ(recovered_unsafe_world_body),
    quatZ(recovered_world_body),
    GEOM_EPS,
  );
  assertAlmostEquals(
    quatW(recovered_unsafe_world_body),
    quatW(recovered_world_body),
    GEOM_EPS,
  );
});

Deno.test('example: quatFromRotationMatrix round-trips an arbitrary normalised quaternion', () => {
  const frame_local = frame('local');
  const frame_vehicle = frame('vehicle');
  const meter = unit('m');

  const quat_local_vehicle = quatNormalize(
    quat(frame_local, frame_vehicle, 0.31, -0.19, 0.44, 0.81),
  );
  const rot_local_vehicle = mat4FromQuaternion(
    frame_local,
    frame_vehicle,
    dimensionlessUnit,
    quat_local_vehicle,
  );
  const recovered_local_vehicle = quatFromRotationMatrix(
    frame_local,
    frame_vehicle,
    rot_local_vehicle,
  );

  // Rotating the same vector with the original and recovered quaternion must agree.
  const delta_input_vehicle = delta3(
    frame_vehicle,
    quantity(meter, 1.2),
    quantity(meter, -0.4),
    quantity(meter, 0.7),
  );
  assertVec3AlmostEquals(
    rotateVec3ByQuat(recovered_local_vehicle, delta_input_vehicle),
    rotateVec3ByQuat(quat_local_vehicle, delta_input_vehicle),
    GEOM_EPS,
  );
});

Deno.test('example: quatFromRotationMatrix rejects a non-orthonormal matrix', () => {
  const frame_world = frame('world');
  const frame_body = frame('body');

  // A matrix whose first column has length 2 is not a valid rotation.
  const scale_x_world_body = mat4Unsafe(
    frame_world,
    frame_body,
    dimensionlessUnit,
    [2, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
  );

  assertThrows(
    () => quatFromRotationMatrix(frame_world, frame_body, scale_x_world_body),
    Error,
    'Input matrix is not a valid rotation matrix',
  );
});
