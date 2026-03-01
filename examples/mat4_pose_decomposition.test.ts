import {
  delta3,
  dimensionlessUnit,
  frame,
  mat4FromQuaternion,
  mat4FromRigidTransform,
  mat4FromScale,
  quantity,
  quat,
  rotateVec3ByQuat,
  unit,
} from '../mod.ts';
import {
  assertAlmostEquals,
  assertThrows,
  assertVec3AlmostEquals,
  GEOM_EPS,
} from '../tests/assert.ts';

Deno.test('example: extract translation and orientation from a rigid transform', () => {
  const frame_world = frame('world');
  const frame_body = frame('body');
  const meter = unit('m');

  // A 90° rotation around Z (half-angle = 45°), with a known translation.
  const sin45 = Math.sin(Math.PI / 4);
  const cos45 = Math.cos(Math.PI / 4);
  const quat_z90_world_body = quat(frame_world, frame_body, 0, 0, sin45, cos45);
  const delta_offset_world = delta3(
    frame_world,
    quantity(meter, 5),
    quantity(meter, -2),
    quantity(meter, 1),
  );

  const pose_world_body = mat4FromRigidTransform(
    frame_world,
    frame_body,
    quat_z90_world_body,
    delta_offset_world,
  );

  // .translation() returns the translation column as a typed Delta3.
  const extracted_translation_world = pose_world_body.translation();
  assertAlmostEquals(extracted_translation_world[0], 5, GEOM_EPS);
  assertAlmostEquals(extracted_translation_world[1], -2, GEOM_EPS);
  assertAlmostEquals(extracted_translation_world[2], 1, GEOM_EPS);

  // .quat() extracts and validates the orientation from the upper-left 3×3 block.
  const extracted_quat_world_body = pose_world_body.quat();

  // Rotating +X body by the extracted quaternion should give +Y world (90° Z rotation).
  const delta_x_body = delta3(
    frame_body,
    quantity(meter, 1),
    quantity(meter, 0),
    quantity(meter, 0),
  );
  assertVec3AlmostEquals(
    rotateVec3ByQuat(extracted_quat_world_body, delta_x_body),
    [0, 1, 0],
    GEOM_EPS,
  );

  // Re-building the rotation matrix from the extracted quaternion reproduces the
  // linear part of the original pose matrix.
  const rot_roundtrip_world_body = mat4FromQuaternion(
    frame_world,
    frame_body,
    dimensionlessUnit,
    extracted_quat_world_body,
  );
  for (let i = 0; i < 12; i += 1) {
    assertAlmostEquals(rot_roundtrip_world_body[i]!, pose_world_body[i]!, GEOM_EPS);
  }
});

Deno.test('example: mat4.quat() throws on a non-rotation linear part', () => {
  const frame_world = frame('world');

  // A non-uniform scale matrix has non-unit columns and is not a valid rotation.
  const scale_world = mat4FromScale(frame_world, dimensionlessUnit, 2, 1, 1);

  assertThrows(
    () => scale_world.quat(),
    Error,
    'Input matrix is not a valid rotation matrix',
  );
});
