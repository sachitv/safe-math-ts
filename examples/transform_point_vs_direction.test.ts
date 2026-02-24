import {
  delta3,
  dimensionlessUnit,
  dir3,
  frame,
  mat4FromRigidTransform,
  point3,
  quantity,
  quatFromAxisAngle,
  transformDirection3,
  transformPoint3,
  unit,
} from '../mod.ts';
import { GEOM_EPS, assertAlmostEquals } from '../tests/assert.test.ts';

Deno.test('example: translation affects points but not directions', () => {
  const frame_world = frame('world');
  const meter = unit('m');

  const pose_same_frame_world = mat4FromRigidTransform(
    frame_world,
    frame_world,
    quatFromAxisAngle(
      frame_world,
      dir3(
        frame_world,
        quantity(dimensionlessUnit, 0),
        quantity(dimensionlessUnit, 0),
        quantity(dimensionlessUnit, 1),
      ),
      Math.PI / 2,
    ),
    delta3(
      frame_world,
      quantity(meter, 10),
      quantity(meter, 0),
      quantity(meter, 0),
    ),
  );

  const point_world = point3(
    frame_world,
    quantity(meter, 1),
    quantity(meter, 0),
    quantity(meter, 0),
  );
  const delta_world = delta3(
    frame_world,
    quantity(meter, 1),
    quantity(meter, 0),
    quantity(meter, 0),
  );

  const point_transformed_world = transformPoint3(
    pose_same_frame_world,
    point_world,
  );
  const delta_transformed_world = transformDirection3(
    pose_same_frame_world,
    delta_world,
  );

  assertAlmostEquals(point_transformed_world[0], 10, GEOM_EPS);
  assertAlmostEquals(point_transformed_world[1], 1, GEOM_EPS);
  assertAlmostEquals(delta_transformed_world[0], 0, GEOM_EPS);
  assertAlmostEquals(delta_transformed_world[1], 1, GEOM_EPS);
});
