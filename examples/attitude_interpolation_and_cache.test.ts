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
import {
  assert,
  assertAlmostEquals,
  assertMat4AlmostEquals,
  GEOM_EPS,
} from '../tests/assert.test.ts';

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
    quat_mid_world_body,
    delta_forward_body,
  );
  assertAlmostEquals(delta_forward_world[0], Math.SQRT1_2, GEOM_EPS);
  assertAlmostEquals(delta_forward_world[1], Math.SQRT1_2, GEOM_EPS);

  const buildPoseWorldBody = createTrsMat4Cache(
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

  const pose_world_body = buildPoseWorldBody(
    delta_offset_world,
    quat_mid_world_body,
    dir_scale_body,
  );
  const pose_world_body_recomputed = buildPoseWorldBody(
    delta_offset_world,
    quat_mid_world_body,
    dir_scale_body,
  );
  assertMat4AlmostEquals(pose_world_body, pose_world_body_recomputed, GEOM_EPS);

  const delta_offset_shifted_world = delta3(
    frame_world,
    quantity(meter, 3),
    quantity(meter, 3),
    quantity(meter, 4),
  );
  const pose_shifted_world_body = buildPoseWorldBody(
    delta_offset_shifted_world,
    quat_mid_world_body,
    dir_scale_body,
  );
  assert(
    Math.abs(pose_shifted_world_body[12] - pose_world_body[12]) > GEOM_EPS,
  );

  const point_body = point3(
    frame_body,
    quantity(meter, 1),
    quantity(meter, 0),
    quantity(meter, 0),
  );
  const point_world = transformPoint3(pose_world_body, point_body);
  const point_shifted_world = transformPoint3(
    pose_shifted_world_body,
    point_body,
  );
  assertAlmostEquals(point_shifted_world[0] - point_world[0], 1, GEOM_EPS);
});
