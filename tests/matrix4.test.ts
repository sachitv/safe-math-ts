import {
  composeMat4,
  createTrsMat4Cache,
  delta3,
  dimensionlessUnit,
  dir3,
  frame,
  invertRigidMat4,
  invertRigidMat4Unsafe,
  mat4,
  mat4FromQuaternion,
  mat4FromQuaternionUnsafe,
  mat4FromRigidTransform,
  mat4FromScale,
  mat4FromTranslation,
  mat4FromTRS,
  mat4FromTRSUnsafe,
  mat4Identity,
  mat4LookAt,
  mat4LookAtUnsafe,
  mat4Perspective,
  mat4PerspectiveUnsafe,
  mat4Unsafe,
  normalMatrixFromMat4,
  normalMatrixFromMat4Unsafe,
  point3,
  projectPoint3,
  projectPoint3Unsafe,
  quantity,
  quat,
  quatFromAxisAngle,
  transformDirection3,
  transformPoint3,
  transposeMat4,
  unit,
} from '../mod.ts';
import {
  assert,
  assertAlmostEquals,
  assertEquals,
  assertThrows,
} from './assert.test.ts';

Deno.test('mat4 constructor validates length and identity/transpose work', () => {
  const frame_A = frame('a');
  const frame_B = frame('b');
  assertThrows(
    () => mat4(frame_A, frame_B, dimensionlessUnit, [1, 2, 3]),
    Error,
    'Mat4 expects 16 values',
  );

  const frame_world = frame('world');
  const pose_identity_world = mat4Identity(
    frame_world,
    dimensionlessUnit,
  );
  assertEquals(pose_identity_world, [
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
  assertEquals(
    transposeMat4(pose_identity_world),
    pose_identity_world,
  );
});

Deno.test('translation and scale transforms points and directions', () => {
  const frame_world = frame('world');
  const meter = unit('m');

  const point_world = point3(
    frame_world,
    quantity(meter, 1),
    quantity(meter, 2),
    quantity(meter, 3),
  );
  const delta_world = delta3(
    frame_world,
    quantity(meter, 1),
    quantity(meter, 2),
    quantity(meter, 3),
  );
  const delta_offset_world = delta3(
    frame_world,
    quantity(meter, 4),
    quantity(meter, 5),
    quantity(meter, 6),
  );

  const pose_world = mat4FromTranslation(
    frame_world,
    delta_offset_world,
  );
  const point_moved_world = transformPoint3(pose_world, point_world);
  const delta_moved_world = transformDirection3(
    pose_world,
    delta_world,
  );

  assertEquals(point_moved_world, [5, 7, 9]);
  assertEquals(delta_moved_world, [1, 2, 3]);

  const pose_scale_world = mat4FromScale(
    frame_world,
    dimensionlessUnit,
    2,
    3,
    4,
  );
  const delta_scaled_world = transformDirection3(
    pose_scale_world,
    delta_world,
  );
  assertEquals(delta_scaled_world, [2, 6, 12]);
});

Deno.test('rotation matrix from quaternion rotates vectors', () => {
  const frame_world = frame('world');
  const meter = unit('m');

  const dir_axisz_world = dir3(
    frame_world,
    quantity(dimensionlessUnit, 0),
    quantity(dimensionlessUnit, 0),
    quantity(dimensionlessUnit, 1),
  );
  const quat_z90_world = quatFromAxisAngle(
    frame_world,
    dir_axisz_world,
    Math.PI / 2,
  );
  const pose_rot_world = mat4FromQuaternion(
    frame_world,
    frame_world,
    dimensionlessUnit,
    quat_z90_world,
  );

  const delta_x_world = delta3(
    frame_world,
    quantity(meter, 1),
    quantity(meter, 0),
    quantity(meter, 0),
  );
  const delta_rotated_world = transformDirection3(
    pose_rot_world,
    delta_x_world,
  );

  assertAlmostEquals(delta_rotated_world[0], 0, 1e-12);
  assertAlmostEquals(delta_rotated_world[1], 1, 1e-12);
  assertAlmostEquals(delta_rotated_world[2], 0, 1e-12);
});

Deno.test('compose and invert rigid transforms', () => {
  const frame_world = frame('world');
  const meter = unit('m');

  const dir_axisz_world = dir3(
    frame_world,
    quantity(dimensionlessUnit, 0),
    quantity(dimensionlessUnit, 0),
    quantity(dimensionlessUnit, 1),
  );
  const quat_z90_world = quatFromAxisAngle(
    frame_world,
    dir_axisz_world,
    Math.PI / 2,
  );
  const delta_offset_world = delta3(
    frame_world,
    quantity(meter, 10),
    quantity(meter, 0),
    quantity(meter, 0),
  );

  const pose_rigid_world = mat4FromRigidTransform(
    frame_world,
    frame_world,
    quat_z90_world,
    delta_offset_world,
  );
  const pose_inverse_world = invertRigidMat4(pose_rigid_world);

  const point_world = point3(
    frame_world,
    quantity(meter, 1),
    quantity(meter, 0),
    quantity(meter, 0),
  );
  const point_moved_world = transformPoint3(
    pose_rigid_world,
    point_world,
  );
  assertAlmostEquals(point_moved_world[0], 10, 1e-12);
  assertAlmostEquals(point_moved_world[1], 1, 1e-12);
  assertAlmostEquals(point_moved_world[2], 0, 1e-12);

  const point_restored_world = transformPoint3(
    pose_inverse_world,
    point_moved_world,
  );
  assertAlmostEquals(point_restored_world[0], 1, 1e-10);
  assertAlmostEquals(point_restored_world[1], 0, 1e-10);
  assertAlmostEquals(point_restored_world[2], 0, 1e-10);

  const pose_shiftx_world = mat4FromTranslation(
    frame_world,
    delta3(
      frame_world,
      quantity(meter, 1),
      quantity(meter, 0),
      quantity(meter, 0),
    ),
  );
  const pose_shifty_world = mat4FromTranslation(
    frame_world,
    delta3(
      frame_world,
      quantity(meter, 0),
      quantity(meter, 2),
      quantity(meter, 0),
    ),
  );
  const pose_composed_world = composeMat4(
    pose_shiftx_world,
    pose_shifty_world,
  );
  const point_composed_world = transformPoint3(
    pose_composed_world,
    point3(
      frame_world,
      quantity(meter, 0),
      quantity(meter, 0),
      quantity(meter, 0),
    ),
  );
  assertEquals(point_composed_world, [1, 2, 0]);

  const pose_rot_world = mat4FromQuaternion(
    frame_world,
    frame_world,
    dimensionlessUnit,
    quat_z90_world,
  );
  const pose_rot_then_shiftx_world = composeMat4(
    pose_rot_world,
    pose_shiftx_world,
  );
  const point_mixed_world = transformPoint3(
    pose_rot_then_shiftx_world,
    point3(
      frame_world,
      quantity(meter, 1),
      quantity(meter, 0),
      quantity(meter, 0),
    ),
  );
  assertAlmostEquals(point_mixed_world[0], 1, 1e-12);
  assertAlmostEquals(point_mixed_world[1], 1, 1e-12);
  assertAlmostEquals(point_mixed_world[2], 0, 1e-12);
});

Deno.test('invertRigidMat4 rejects non-rigid matrices', () => {
  const frame_world = frame('world');
  const pose_nonrigid_world = mat4FromScale(
    frame_world,
    dimensionlessUnit,
    2,
    3,
    4,
  );
  assertThrows(
    () => invertRigidMat4(pose_nonrigid_world),
    Error,
    'Matrix is not a rigid transform',
  );
});

Deno.test('lookAt and perspective projection', () => {
  const frame_world = frame('world');
  const frame_view = frame('view');
  const frame_ndc = frame('ndc');
  const meter = unit('m');

  const point_eye_world = point3(
    frame_world,
    quantity(meter, 0),
    quantity(meter, 0),
    quantity(meter, 0),
  );
  const point_target_world = point3(
    frame_world,
    quantity(meter, 0),
    quantity(meter, 0),
    quantity(meter, -1),
  );
  const dir_up_world = dir3(
    frame_world,
    quantity(dimensionlessUnit, 0),
    quantity(dimensionlessUnit, 1),
    quantity(dimensionlessUnit, 0),
  );

  const pose_view_world = mat4LookAt(
    frame_view,
    frame_world,
    point_eye_world,
    point_target_world,
    dir_up_world,
  );
  const point_forward_world = point3(
    frame_world,
    quantity(meter, 0),
    quantity(meter, 0),
    quantity(meter, -5),
  );
  const point_forward_view = transformPoint3(
    pose_view_world,
    point_forward_world,
  );
  assertAlmostEquals(point_forward_view[0], 0, 1e-12);
  assertAlmostEquals(point_forward_view[1], 0, 1e-12);
  assertAlmostEquals(point_forward_view[2], -5, 1e-12);

  const pose_ndc_view = mat4Perspective(
    frame_ndc,
    frame_view,
    Math.PI / 2,
    1,
    quantity(meter, 1),
    quantity(meter, 10),
  );
  const point_ndc = projectPoint3(pose_ndc_view, point_forward_view);
  assertAlmostEquals(point_ndc[0], 0, 1e-12);
  assertAlmostEquals(point_ndc[1], 0, 1e-12);
  assertAlmostEquals(point_ndc[2], 0.7777777777777777, 1e-12);

  assertThrows(
    () =>
      projectPoint3(
        pose_ndc_view,
        point3(
          frame_view,
          quantity(meter, 0),
          quantity(meter, 0),
          quantity(meter, 0),
        ),
      ),
    Error,
    'Perspective divide is undefined for w = 0',
  );

  assertThrows(
    () =>
      mat4Perspective(
        frame_ndc,
        frame_view,
        0,
        1,
        quantity(meter, 1),
        quantity(meter, 10),
      ),
    Error,
    'fieldOfViewYRadians must be in (0, PI)',
  );
  assertThrows(
    () =>
      mat4Perspective(
        frame_ndc,
        frame_view,
        Math.PI / 2,
        0,
        quantity(meter, 1),
        quantity(meter, 10),
      ),
    Error,
    'aspect must be > 0',
  );
  assertThrows(
    () =>
      mat4Perspective(
        frame_ndc,
        frame_view,
        Math.PI / 2,
        1,
        quantity(meter, 10),
        quantity(meter, 1),
      ),
    Error,
    'near and far must satisfy 0 < near < far',
  );
});

Deno.test('lookAt input validation', () => {
  const frame_world = frame('world');
  const frame_view = frame('view');
  const meter = unit('m');

  const point_world = point3(
    frame_world,
    quantity(meter, 0),
    quantity(meter, 0),
    quantity(meter, 0),
  );
  const dir_up_world = dir3(
    frame_world,
    quantity(dimensionlessUnit, 0),
    quantity(dimensionlessUnit, 1),
    quantity(dimensionlessUnit, 0),
  );
  assertThrows(
    () =>
      mat4LookAt(
        frame_view,
        frame_world,
        point_world,
        point_world,
        dir_up_world,
      ),
    Error,
    'LookAt requires eye and target to be distinct',
  );

  const point_target_world = point3(
    frame_world,
    quantity(meter, 0),
    quantity(meter, 0),
    quantity(meter, -1),
  );
  assertThrows(
    () =>
      mat4LookAt(
        frame_view,
        frame_world,
        point_world,
        point_target_world,
        dir3(
          frame_world,
          quantity(dimensionlessUnit, 0),
          quantity(dimensionlessUnit, 0),
          quantity(dimensionlessUnit, 0),
        ),
      ),
    Error,
    'LookAt requires a non-zero up direction',
  );

  assertThrows(
    () =>
      mat4LookAt(
        frame_view,
        frame_world,
        point_world,
        point_target_world,
        dir3(
          frame_world,
          quantity(dimensionlessUnit, 0),
          quantity(dimensionlessUnit, 0),
          quantity(dimensionlessUnit, -1),
        ),
      ),
    Error,
    'LookAt up direction cannot be parallel to forward',
  );
});

Deno.test('normal matrix from non-uniform scale', () => {
  const frame_world = frame('world');
  const meter = unit('m');
  const pose_scale_world = mat4FromScale(
    frame_world,
    dimensionlessUnit,
    2,
    3,
    4,
  );
  const pose_normal_world = normalMatrixFromMat4(
    pose_scale_world,
  );
  const delta_x_world = delta3(
    frame_world,
    quantity(meter, 1),
    quantity(meter, 0),
    quantity(meter, 0),
  );
  const delta_normalized_world = transformDirection3(
    pose_normal_world,
    delta_x_world,
  );
  assertAlmostEquals(delta_normalized_world[0], 0.5, 1e-12);
  assertAlmostEquals(delta_normalized_world[1], 0, 1e-12);
  assertAlmostEquals(delta_normalized_world[2], 0, 1e-12);

  assertThrows(
    () =>
      normalMatrixFromMat4(
        mat4FromScale(frame_world, dimensionlessUnit, 1, 0, 1),
      ),
    Error,
    'Cannot build a normal matrix from a singular transform',
  );
});

Deno.test('trs transform and cache reuse', () => {
  const frame_world = frame('world');
  const meter = unit('m');
  const delta_offset_world = delta3(
    frame_world,
    quantity(meter, 2),
    quantity(meter, 3),
    quantity(meter, 4),
  );
  const quat_identity_world = quatFromAxisAngle(
    frame_world,
    dir3(
      frame_world,
      quantity(dimensionlessUnit, 0),
      quantity(dimensionlessUnit, 0),
      quantity(dimensionlessUnit, 1),
    ),
    0,
  );
  const dir_scale_world = dir3(
    frame_world,
    quantity(dimensionlessUnit, 2),
    quantity(dimensionlessUnit, 3),
    quantity(dimensionlessUnit, 4),
  );

  const pose_world = mat4FromTRS(
    frame_world,
    frame_world,
    delta_offset_world,
    quat_identity_world,
    dir_scale_world,
  );
  const point_world = point3(
    frame_world,
    quantity(meter, 1),
    quantity(meter, 1),
    quantity(meter, 1),
  );
  const point_transformed_world = transformPoint3(
    pose_world,
    point_world,
  );
  assertEquals(point_transformed_world, [4, 6, 8]);

  const pose_cache_world = createTrsMat4Cache(
    frame_world,
    frame_world,
    meter,
  );
  const pose_cached_first_world = pose_cache_world(
    delta_offset_world,
    quat_identity_world,
    dir_scale_world,
  );
  const pose_cached_second_world = pose_cache_world(
    delta_offset_world,
    quat_identity_world,
    dir_scale_world,
  );
  assert(Object.is(pose_cached_first_world, pose_cached_second_world));
});

Deno.test('unsafe matrix helpers skip validation checks', () => {
  const frame_world = frame('world');
  const frame_ndc = frame('ndc');
  const meter = unit('m');
  const point_origin_world = point3(
    frame_world,
    quantity(meter, 0),
    quantity(meter, 0),
    quantity(meter, 0),
  );

  const pose_invalid_world = mat4Unsafe(
    frame_world,
    frame_world,
    dimensionlessUnit,
    [1, 2, 3],
  );
  assertEquals(pose_invalid_world, [1, 2, 3]);

  const pose_perspective_invalid = mat4PerspectiveUnsafe(
    frame_ndc,
    frame_world,
    0,
    0,
    quantity(meter, 1),
    quantity(meter, 1),
  );
  assert(!Number.isFinite(pose_perspective_invalid[0]));

  const point_projected = projectPoint3Unsafe(
    pose_perspective_invalid,
    point_origin_world,
  );
  assert(
    Number.isNaN(point_projected[0]) || !Number.isFinite(point_projected[0]),
  );

  const pose_lookat_invalid = mat4LookAtUnsafe(
    frame_world,
    frame_world,
    point_origin_world,
    point_origin_world,
    dir3(
      frame_world,
      quantity(dimensionlessUnit, 0),
      quantity(dimensionlessUnit, 0),
      quantity(dimensionlessUnit, 0),
    ),
  );
  assert(Number.isNaN(pose_lookat_invalid[0]));

  const pose_scale_world = mat4FromScale(
    frame_world,
    dimensionlessUnit,
    2,
    3,
    4,
  );
  invertRigidMat4Unsafe(pose_scale_world);

  const pose_singular_world = mat4FromScale(
    frame_world,
    dimensionlessUnit,
    1,
    0,
    1,
  );
  const pose_normal_unsafe_world = normalMatrixFromMat4Unsafe(
    pose_singular_world,
  );
  assert(!Number.isFinite(pose_normal_unsafe_world[5]));

  const quat_zero_world_world = quat(frame_world, frame_world, 0, 0, 0, 0);
  const pose_rot_unsafe_world = mat4FromQuaternionUnsafe(
    frame_world,
    frame_world,
    dimensionlessUnit,
    quat_zero_world_world,
  );
  assert(Number.isNaN(pose_rot_unsafe_world[0]));

  const pose_trs_unsafe_world = mat4FromTRSUnsafe(
    frame_world,
    frame_world,
    delta3(
      frame_world,
      quantity(meter, 0),
      quantity(meter, 0),
      quantity(meter, 0),
    ),
    quat_zero_world_world,
    dir3(
      frame_world,
      quantity(dimensionlessUnit, 1),
      quantity(dimensionlessUnit, 1),
      quantity(dimensionlessUnit, 1),
    ),
  );
  assert(Number.isNaN(pose_trs_unsafe_world[0]));
});
