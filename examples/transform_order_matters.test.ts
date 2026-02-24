import {
  composeMat4,
  delta3,
  dimensionlessUnit,
  dir3,
  frame,
  mat4FromQuaternion,
  mat4FromTranslation,
  point3,
  quantity,
  quatFromAxisAngle,
  transformPoint3,
  unit,
} from '../mod.ts';
import { GEOM_EPS, assertVec3AlmostEquals } from '../tests/assert.test.ts';

Deno.test('example: compose order changes transform result', () => {
  const frame_world = frame('world');
  const meter = unit('m');
  const none = dimensionlessUnit;

  const pose_translate_world = mat4FromTranslation(
    frame_world,
    delta3(
      frame_world,
      quantity(meter, 2),
      quantity(meter, 0),
      quantity(meter, 0),
    ),
  );
  const pose_rotate_world = mat4FromQuaternion(
    frame_world,
    frame_world,
    none,
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
  );

  const point_world = point3(
    frame_world,
    quantity(meter, 1),
    quantity(meter, 0),
    quantity(meter, 0),
  );

  const pose_translate_then_rotate = composeMat4(
    pose_rotate_world,
    pose_translate_world,
  );
  const pose_rotate_then_translate = composeMat4(
    pose_translate_world,
    pose_rotate_world,
  );

  const point_a_world = transformPoint3(pose_translate_then_rotate, point_world);
  const point_b_world = transformPoint3(pose_rotate_then_translate, point_world);
  const expected_point_a_world = [0, 3, 0] as const;
  const expected_point_b_world = [2, 1, 0] as const;

  assertVec3AlmostEquals(point_a_world, expected_point_a_world, GEOM_EPS);
  assertVec3AlmostEquals(point_b_world, expected_point_b_world, GEOM_EPS);
});
