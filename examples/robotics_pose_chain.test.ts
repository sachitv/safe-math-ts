import {
  composeMat4,
  delta3,
  frame,
  mat4FromRigidTransform,
  point3,
  quantity,
  quat,
  transformPoint3,
  unit,
} from '../mod.ts';
import { assertAlmostEquals } from '../tests/assert.test.ts';

Deno.test('example: compose vehicle and sensor poses for robotics localization', () => {
  const frame_world = frame('world');
  const frame_vehicle = frame('vehicle');
  const frame_lidar = frame('lidar');
  const meter = unit('m');

  const sin45 = Math.sin(Math.PI / 4);
  const cos45 = Math.cos(Math.PI / 4);

  /** `pose_vehicle_lidar` maps points from lidar frame into vehicle frame. */
  const quat_mount_vehicle_lidar = quat(
    frame_vehicle,
    frame_lidar,
    0,
    0,
    sin45,
    cos45,
  );
  const delta_mount_vehicle = delta3(
    frame_vehicle,
    quantity(meter, 1),
    quantity(meter, 0),
    quantity(meter, 1),
  );
  const pose_vehicle_lidar = mat4FromRigidTransform(
    frame_vehicle,
    frame_lidar,
    quat_mount_vehicle_lidar,
    delta_mount_vehicle,
  );

  /** `pose_world_vehicle` maps points from vehicle frame into world frame. */
  const quat_heading_world_vehicle = quat(
    frame_world,
    frame_vehicle,
    0,
    0,
    sin45,
    cos45,
  );
  const delta_vehicle_world = delta3(
    frame_world,
    quantity(meter, 10),
    quantity(meter, 0),
    quantity(meter, 0),
  );
  const pose_world_vehicle = mat4FromRigidTransform(
    frame_world,
    frame_vehicle,
    quat_heading_world_vehicle,
    delta_vehicle_world,
  );

  const pose_world_lidar = composeMat4(pose_world_vehicle, pose_vehicle_lidar);

  const point_hit_lidar = point3(
    frame_lidar,
    quantity(meter, 2),
    quantity(meter, 0),
    quantity(meter, 0),
  );
  const point_hit_world = transformPoint3(pose_world_lidar, point_hit_lidar);

  assertAlmostEquals(point_hit_world[0], 8, 1e-12);
  assertAlmostEquals(point_hit_world[1], 1, 1e-12);
  assertAlmostEquals(point_hit_world[2], 1, 1e-12);
});
