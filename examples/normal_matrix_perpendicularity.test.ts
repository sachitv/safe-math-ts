import {
  crossVec3,
  delta3,
  dimensionlessUnit,
  dir3,
  dotVec3,
  frame,
  mat4FromTRS,
  normalizeVec3,
  normalMatrixFromMat4,
  quantity,
  quat,
  transformDirection3,
  unit,
} from '../mod.ts';
import { assertAlmostEquals } from '../tests/assert.test.ts';

Deno.test('example: normal matrix keeps transformed normal perpendicular', () => {
  const frame_world = frame('world');
  const frame_object = frame('object');
  const meter = unit('m');

  const sin15 = Math.sin(Math.PI / 12);
  const cos15 = Math.cos(Math.PI / 12);

  const pose_world_object = mat4FromTRS(
    frame_world,
    frame_object,
    delta3(
      frame_world,
      quantity(meter, 0),
      quantity(meter, 0),
      quantity(meter, 0),
    ),
    quat(frame_world, frame_object, 0, sin15, 0, cos15),
    dir3(
      frame_object,
      quantity(dimensionlessUnit, 2),
      quantity(dimensionlessUnit, 1),
      quantity(dimensionlessUnit, 0.5),
    ),
  );

  const tangent_a_object = delta3(
    frame_object,
    quantity(meter, 1),
    quantity(meter, 0),
    quantity(meter, 1),
  );
  const tangent_b_object = delta3(
    frame_object,
    quantity(meter, 0),
    quantity(meter, 1),
    quantity(meter, 0),
  );

  const normal_object = normalizeVec3(crossVec3(tangent_a_object, tangent_b_object));
  const tangent_a_world = transformDirection3(pose_world_object, tangent_a_object);
  const tangent_b_world = transformDirection3(pose_world_object, tangent_b_object);
  const normal_world = normalizeVec3(
    transformDirection3(normalMatrixFromMat4(pose_world_object), normal_object),
  );

  assertAlmostEquals(dotVec3(normal_world, tangent_a_world), 0, 1e-10);
  assertAlmostEquals(dotVec3(normal_world, tangent_b_world), 0, 1e-10);
});
