import {
  delta3,
  frame,
  invertRigidMat4,
  mat4FromRigidTransform,
  point3,
  quantity,
  quat,
  transformPoint3,
  unit,
} from '../mod.ts';
import { GEOM_EPS, assertVec3AlmostEquals } from '../tests/assert.test.ts';

Deno.test('example: rigid transform round-trip returns original point', () => {
  const frame_world = frame('world');
  const frame_local = frame('local');
  const meter = unit('m');

  const sin30 = Math.sin(Math.PI / 6);
  const cos30 = Math.cos(Math.PI / 6);

  const pose_world_local = mat4FromRigidTransform(
    frame_world,
    frame_local,
    quat(frame_world, frame_local, 0, 0, sin30, cos30),
    delta3(
      frame_world,
      quantity(meter, 4),
      quantity(meter, -2),
      quantity(meter, 1),
    ),
  );
  const pose_local_world = invertRigidMat4(pose_world_local);

  const point_local = point3(
    frame_local,
    quantity(meter, 1.25),
    quantity(meter, -0.5),
    quantity(meter, 3),
  );

  const point_world = transformPoint3(pose_world_local, point_local);
  const point_local_roundtrip = transformPoint3(pose_local_world, point_world);

  assertVec3AlmostEquals(point_local_roundtrip, point_local, GEOM_EPS);
});
