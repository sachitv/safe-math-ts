import {
  dimensionlessUnit,
  dir3,
  frame,
  mat4LookAt,
  mat4Perspective,
  point3,
  projectPoint3,
  quantity,
  transformPoint3,
  unit,
} from '../mod.ts';
import { assert, assertAlmostEquals } from '../tests/assert.test.ts';

Deno.test('example: world point to NDC via lookAt and perspective projection', () => {
  const frame_world = frame('world');
  const frame_view = frame('view');
  const frame_ndc = frame('ndc');
  const meter = unit('m');

  const point_eye_world = point3(
    frame_world,
    quantity(meter, 0),
    quantity(meter, 1),
    quantity(meter, 5),
  );
  const point_target_world = point3(
    frame_world,
    quantity(meter, 0),
    quantity(meter, 1),
    quantity(meter, 0),
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

  const pose_ndc_view = mat4Perspective(
    frame_ndc,
    frame_view,
    Math.PI / 3,
    16 / 9,
    quantity(meter, 0.1),
    quantity(meter, 100),
  );

  const point_subject_world = point3(
    frame_world,
    quantity(meter, 0),
    quantity(meter, 1),
    quantity(meter, 0),
  );
  const point_subject_view = transformPoint3(
    point_subject_world,
    pose_view_world,
  );
  const point_subject_ndc = projectPoint3(point_subject_view, pose_ndc_view);

  assertAlmostEquals(point_subject_view[0], 0, 1e-12);
  assertAlmostEquals(point_subject_view[1], 0, 1e-12);
  assertAlmostEquals(point_subject_view[2], -5, 1e-12);
  assertAlmostEquals(point_subject_ndc[0], 0, 1e-12);
  assertAlmostEquals(point_subject_ndc[1], 0, 1e-12);
  assert(point_subject_ndc[2] > -1 && point_subject_ndc[2] < 1);

  const point_right_world = point3(
    frame_world,
    quantity(meter, 1),
    quantity(meter, 1),
    quantity(meter, 0),
  );
  const point_right_view = transformPoint3(point_right_world, pose_view_world);
  const point_right_ndc = projectPoint3(point_right_view, pose_ndc_view);
  assert(point_right_ndc[0] > 0);
});
