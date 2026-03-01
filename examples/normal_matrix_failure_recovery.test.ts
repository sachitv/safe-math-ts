import {
  delta3,
  dimensionlessUnit,
  dir3,
  frame,
  mat4FromQuaternion,
  mat4FromTRS,
  normalMatrixFromMat4,
  quantity,
  quat,
  transformDirection3,
  unit,
} from '../mod.ts';
import { assertVec3AlmostEquals, GEOM_EPS } from '../tests/assert.ts';

Deno.test('example: recover from normal-matrix failure with stable fallback', () => {
  const frame_world = frame('world');
  const frame_object = frame('object');
  const meter = unit('m');

  const pose_singular_world_object = mat4FromTRS(
    frame_world,
    frame_object,
    delta3(
      frame_world,
      quantity(meter, 0),
      quantity(meter, 0),
      quantity(meter, 0),
    ),
    quat(frame_world, frame_object, 0, 0, 0, 1),
    dir3(
      frame_object,
      quantity(dimensionlessUnit, 1),
      // Zero Y scale makes the linear 3x3 singular (determinant = 0).
      quantity(dimensionlessUnit, 0),
      quantity(dimensionlessUnit, 1),
    ),
  );

  let pose_normal_world_object = mat4FromQuaternion(
    frame_world,
    frame_object,
    dimensionlessUnit,
    quat(frame_world, frame_object, 0, 0, 0, 1),
  );

  try {
    // Safe API throws on singular transforms.
    pose_normal_world_object = normalMatrixFromMat4(pose_singular_world_object);
  } catch (_error) {
    // Recovery strategy: fall back to identity rotation for stable shading.
    pose_normal_world_object = mat4FromQuaternion(
      frame_world,
      frame_object,
      dimensionlessUnit,
      quat(frame_world, frame_object, 0, 0, 0, 1),
    );
  }

  const dir_normal_object = dir3(
    frame_object,
    quantity(dimensionlessUnit, 0),
    quantity(dimensionlessUnit, 1),
    quantity(dimensionlessUnit, 0),
  );
  const dir_normal_world = transformDirection3(
    pose_normal_world_object,
    dir_normal_object,
  );

  assertVec3AlmostEquals(dir_normal_world, [0, 1, 0], GEOM_EPS);
});
