import {
  frame,
  mat4Perspective,
  point3,
  projectPoint3,
  projectPoint3Unsafe,
  quantity,
  unit,
} from '../mod.ts';
import {
  assert,
  assertAlmostEquals,
  assertThrows,
  GEOM_EPS,
} from '../tests/assert.ts';

Deno.test('example: projection edge behavior at near, far, behind-camera, and w=0', () => {
  const frame_view = frame('view');
  const frame_ndc = frame('ndc');
  const meter = unit('m');

  const pose_ndc_view = mat4Perspective(
    frame_ndc,
    frame_view,
    Math.PI / 2,
    1,
    quantity(meter, 1),
    quantity(meter, 10),
  );

  const point_near_view = point3(
    frame_view,
    quantity(meter, 0),
    quantity(meter, 0),
    quantity(meter, -1),
  );
  const point_far_view = point3(
    frame_view,
    quantity(meter, 0),
    quantity(meter, 0),
    quantity(meter, -10),
  );
  const point_behind_view = point3(
    frame_view,
    quantity(meter, 0),
    quantity(meter, 0),
    quantity(meter, 1),
  );
  const point_wzero_view = point3(
    frame_view,
    quantity(meter, 0),
    quantity(meter, 0),
    quantity(meter, 0),
  );

  const point_near_ndc = projectPoint3(pose_ndc_view, point_near_view);
  const point_far_ndc = projectPoint3(pose_ndc_view, point_far_view);
  const point_behind_ndc = projectPoint3(pose_ndc_view, point_behind_view);

  assertAlmostEquals(point_near_ndc[2], -1, GEOM_EPS);
  assertAlmostEquals(point_far_ndc[2], 1, GEOM_EPS);
  assert(point_behind_ndc[2] > 1 + GEOM_EPS);

  assertThrows(
    () => projectPoint3(pose_ndc_view, point_wzero_view),
    Error,
    'Perspective divide is undefined for w',
  );

  const point_wzero_ndc_unsafe = projectPoint3Unsafe(
    pose_ndc_view,
    point_wzero_view,
  );
  assert(
    !Number.isFinite(point_wzero_ndc_unsafe[0]) ||
      !Number.isFinite(point_wzero_ndc_unsafe[1]) ||
      !Number.isFinite(point_wzero_ndc_unsafe[2]),
  );
});
