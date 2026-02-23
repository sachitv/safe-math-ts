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
import { assertAlmostEquals } from '../tests/assert.test.ts';

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

  assertAlmostEquals(point_local_roundtrip[0], point_local[0], 1e-10);
  assertAlmostEquals(point_local_roundtrip[1], point_local[1], 1e-10);
  assertAlmostEquals(point_local_roundtrip[2], point_local[2], 1e-10);
});

