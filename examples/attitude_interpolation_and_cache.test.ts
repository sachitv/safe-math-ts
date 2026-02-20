import {
  createTrsMat4Cache,
  delta3,
  dimensionlessUnit,
  dir3,
  frame,
  point3,
  quantity,
  quat,
  quatSlerp,
  rotateVec3ByQuat,
  transformPoint3,
  unit,
} from '../mod.ts';
import { assert, assertAlmostEquals } from '../tests/assert.test.ts';

Deno.test('example: quaternion interpolation plus TRS cache reuse', () => {
  const frame_world = frame('world');
  const frame_body = frame('body');
  const meter = unit('m');

  const quat_start_world_body = quat(frame_world, frame_body, 0, 0, 0, 1);
  const quat_end_world_body = quat(
    frame_world,
    frame_body,
    0,
    0,
    Math.sin(Math.PI / 4),
    Math.cos(Math.PI / 4),
  );
  const quat_mid_world_body = quatSlerp(
    quat_start_world_body,
    quat_end_world_body,
    0.5,
  );

  const delta_forward_body = delta3(
    frame_body,
    quantity(meter, 1),
    quantity(meter, 0),
    quantity(meter, 0),
  );
  const delta_forward_world = rotateVec3ByQuat(
    delta_forward_body,
    quat_mid_world_body,
  );
  assertAlmostEquals(delta_forward_world[0], Math.SQRT1_2, 1e-12);
  assertAlmostEquals(delta_forward_world[1], Math.SQRT1_2, 1e-12);

  const pose_cache_world_body = createTrsMat4Cache(
    frame_world,
    frame_body,
    meter,
  );
  const delta_offset_world = delta3(
    frame_world,
    quantity(meter, 2),
    quantity(meter, 3),
    quantity(meter, 4),
  );
  const dir_scale_body = dir3(
    frame_body,
    quantity(dimensionlessUnit, 1),
    quantity(dimensionlessUnit, 1),
    quantity(dimensionlessUnit, 1),
  );

  const pose_world_body_a = pose_cache_world_body(
    delta_offset_world,
    quat_mid_world_body,
    dir_scale_body,
  );
  const pose_world_body_b = pose_cache_world_body(
    delta_offset_world,
    quat_mid_world_body,
    dir_scale_body,
  );
  assert(Object.is(pose_world_body_a, pose_world_body_b));

  const delta_offset_shifted_world = delta3(
    frame_world,
    quantity(meter, 3),
    quantity(meter, 3),
    quantity(meter, 4),
  );
  const pose_world_body_c = pose_cache_world_body(
    delta_offset_shifted_world,
    quat_mid_world_body,
    dir_scale_body,
  );
  assert(!Object.is(pose_world_body_a, pose_world_body_c));

  const point_body = point3(
    frame_body,
    quantity(meter, 1),
    quantity(meter, 0),
    quantity(meter, 0),
  );
  const point_world_a = transformPoint3(point_body, pose_world_body_a);
  const point_world_c = transformPoint3(point_body, pose_world_body_c);
  assertAlmostEquals(point_world_c[0] - point_world_a[0], 1, 1e-12);
});
