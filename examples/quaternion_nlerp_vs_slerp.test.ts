import {
  angleBetweenVec3,
  delta3,
  frame,
  quantity,
  quat,
  quatNlerp,
  quatSlerp,
  rotateVec3ByQuat,
  unit,
} from '../mod.ts';
import { assert, assertAlmostEquals, GEOM_EPS } from '../tests/assert.ts';

Deno.test('example: quatNlerp versus quatSlerp interpolation behavior', () => {
  const frame_world = frame('world');
  const frame_body = frame('body');
  const meter = unit('m');

  const quat_start_world_body = quat(frame_world, frame_body, 0, 0, 0, 1);
  const quat_end_world_body = quat(frame_world, frame_body, 0, 0, 1, 0);

  const quat_nlerp_world_body = quatNlerp(
    quat_start_world_body,
    quat_end_world_body,
    0.25,
  );
  const quat_slerp_world_body = quatSlerp(
    quat_start_world_body,
    quat_end_world_body,
    0.25,
  );

  const delta_axisx_body = delta3(
    frame_body,
    quantity(meter, 1),
    quantity(meter, 0),
    quantity(meter, 0),
  );
  const delta_axisx_world = delta3(
    frame_world,
    quantity(meter, 1),
    quantity(meter, 0),
    quantity(meter, 0),
  );

  const delta_nlerp_world = rotateVec3ByQuat(
    quat_nlerp_world_body,
    delta_axisx_body,
  );
  const delta_slerp_world = rotateVec3ByQuat(
    quat_slerp_world_body,
    delta_axisx_body,
  );

  const angle_nlerp = angleBetweenVec3(delta_axisx_world, delta_nlerp_world);
  const angle_slerp = angleBetweenVec3(delta_axisx_world, delta_slerp_world);

  assertAlmostEquals(angle_slerp, Math.PI / 4, GEOM_EPS);
  assert(Math.abs(angle_nlerp - angle_slerp) > 1e-2);
});
