import {
  composeMat4,
  delta3,
  frame,
  invertRigidMat4,
  mat4FromRigidTransform,
  mat4Perspective,
  point3,
  projectPoint3,
  quantity,
  quat,
  transformPoint3,
  unit,
} from '../mod.ts';
import {
  GEOM_EPS,
  assertInRange,
  assertVec3AlmostEquals,
} from '../tests/assert.test.ts';

Deno.test('example: world to vehicle to camera to view to NDC chain', () => {
  const frame_world = frame('world');
  const frame_vehicle = frame('vehicle');
  const frame_camera = frame('camera');
  const frame_view = frame('view');
  const frame_ndc = frame('ndc');
  const meter = unit('m');

  const sin15 = Math.sin(Math.PI / 12);
  const cos15 = Math.cos(Math.PI / 12);

  const pose_world_vehicle = mat4FromRigidTransform(
    frame_world,
    frame_vehicle,
    quat(frame_world, frame_vehicle, 0, 0, sin15, cos15),
    delta3(
      frame_world,
      quantity(meter, 10),
      quantity(meter, 2),
      quantity(meter, 0),
    ),
  );
  const pose_vehicle_camera = mat4FromRigidTransform(
    frame_vehicle,
    frame_camera,
    quat(frame_vehicle, frame_camera, 0, 0, 0, 1),
    delta3(
      frame_vehicle,
      quantity(meter, 0.5),
      quantity(meter, 0.1),
      quantity(meter, 1.4),
    ),
  );
  const pose_view_camera = mat4FromRigidTransform(
    frame_view,
    frame_camera,
    quat(frame_view, frame_camera, 0, 0, 0, 1),
    delta3(
      frame_view,
      quantity(meter, 0),
      quantity(meter, 0),
      quantity(meter, 0),
    ),
  );

  const pose_world_camera = composeMat4(pose_world_vehicle, pose_vehicle_camera);
  const pose_camera_world = invertRigidMat4(pose_world_camera);
  const pose_view_world = composeMat4(pose_view_camera, pose_camera_world);

  const point_feature_camera = point3(
    frame_camera,
    quantity(meter, 0.5),
    quantity(meter, 0.2),
    quantity(meter, -5),
  );
  const point_feature_world = transformPoint3(pose_world_camera, point_feature_camera);
  const point_feature_view = transformPoint3(pose_view_world, point_feature_world);
  assertVec3AlmostEquals(point_feature_view, [0.5, 0.2, -5], GEOM_EPS);

  const pose_ndc_view = mat4Perspective(
    frame_ndc,
    frame_view,
    Math.PI / 3,
    16 / 9,
    quantity(meter, 0.1),
    quantity(meter, 100),
  );
  const point_feature_ndc = projectPoint3(pose_ndc_view, point_feature_view);

  assertInRange(point_feature_ndc[0], -1, 1, GEOM_EPS);
  assertInRange(point_feature_ndc[1], -1, 1, GEOM_EPS);
  assertInRange(point_feature_ndc[2], -1, 1, GEOM_EPS);
});
