import {
  composeMat4,
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
import { assert, assertAlmostEquals } from '../tests/assert.test.ts';

Deno.test('example: sensor extrinsics chain with lidar and camera', () => {
  const frame_world = frame('world');
  const frame_vehicle = frame('vehicle');
  const frame_lidar = frame('lidar');
  const frame_camera = frame('camera');
  const meter = unit('m');

  const sin45 = Math.sin(Math.PI / 4);
  const cos45 = Math.cos(Math.PI / 4);
  const sin15 = Math.sin(Math.PI / 12);
  const cos15 = Math.cos(Math.PI / 12);

  const pose_world_vehicle = mat4FromRigidTransform(
    frame_world,
    frame_vehicle,
    quat(frame_world, frame_vehicle, 0, 0, sin45, cos45),
    delta3(
      frame_world,
      quantity(meter, 10),
      quantity(meter, 1),
      quantity(meter, 0),
    ),
  );

  const pose_vehicle_lidar = mat4FromRigidTransform(
    frame_vehicle,
    frame_lidar,
    quat(frame_vehicle, frame_lidar, 0, 0, 0, 1),
    delta3(
      frame_vehicle,
      quantity(meter, 1),
      quantity(meter, 0),
      quantity(meter, 1),
    ),
  );

  const pose_vehicle_camera = mat4FromRigidTransform(
    frame_vehicle,
    frame_camera,
    quat(frame_vehicle, frame_camera, 0, sin15, 0, cos15),
    delta3(
      frame_vehicle,
      quantity(meter, 0.5),
      quantity(meter, 0.2),
      quantity(meter, 1.2),
    ),
  );

  const pose_world_lidar = composeMat4(pose_world_vehicle, pose_vehicle_lidar);
  const pose_world_camera = composeMat4(pose_world_vehicle, pose_vehicle_camera);

  const point_hit_lidar = point3(
    frame_lidar,
    quantity(meter, 2),
    quantity(meter, -0.5),
    quantity(meter, 0),
  );
  const point_hit_camera = point3(
    frame_camera,
    quantity(meter, 1.5),
    quantity(meter, 0.1),
    quantity(meter, 0.3),
  );

  const point_hit_world = transformPoint3(
    pose_world_lidar,
    point_hit_lidar,
  );
  const point_hit_world_from_camera = transformPoint3(
    pose_world_camera,
    point_hit_camera,
  );

  const pose_lidar_world = invertRigidMat4(pose_world_lidar);
  const point_hit_lidar_roundtrip = transformPoint3(
    pose_lidar_world,
    point_hit_world,
  );

  assertAlmostEquals(point_hit_lidar_roundtrip[0], point_hit_lidar[0], 1e-10);
  assertAlmostEquals(point_hit_lidar_roundtrip[1], point_hit_lidar[1], 1e-10);
  assertAlmostEquals(point_hit_lidar_roundtrip[2], point_hit_lidar[2], 1e-10);

  // Both chained transforms are valid and yield finite world points.
  assert(Number.isFinite(point_hit_world[0]));
  assert(Number.isFinite(point_hit_world[1]));
  assert(Number.isFinite(point_hit_world[2]));
  assert(Number.isFinite(point_hit_world_from_camera[0]));
  assert(Number.isFinite(point_hit_world_from_camera[1]));
  assert(Number.isFinite(point_hit_world_from_camera[2]));
});
