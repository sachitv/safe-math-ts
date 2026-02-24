import {
  angleBetweenVec3,
  delta3,
  dimensionlessUnit,
  dir3,
  dotVec3,
  frame,
  mat4FromTRS,
  negVec3,
  normalizeVec3,
  normalMatrixFromMat4,
  quantity,
  quat,
  reflectVec3,
  scaleDir3,
  transformDirection3,
  unit,
} from '../mod.ts';
import { GEOM_EPS, assert, assertAlmostEquals } from '../tests/assert.test.ts';

Deno.test('example: transform normals and reflect an incoming direction', () => {
  const frame_world = frame('world');
  const frame_object = frame('object');
  const meter = unit('m');

  const sin15 = Math.sin(Math.PI / 12);
  const cos15 = Math.cos(Math.PI / 12);

  const delta_offset_world = delta3(
    frame_world,
    quantity(meter, 0),
    quantity(meter, 0),
    quantity(meter, 0),
  );
  const quat_tilt_world_object = quat(
    frame_world,
    frame_object,
    0,
    sin15,
    0,
    cos15,
  );
  const dir_scale_object = dir3(
    frame_object,
    quantity(dimensionlessUnit, 2),
    quantity(dimensionlessUnit, 1),
    quantity(dimensionlessUnit, 0.5),
  );

  const pose_world_object = mat4FromTRS(
    frame_world,
    frame_object,
    delta_offset_world,
    quat_tilt_world_object,
    dir_scale_object,
  );

  const dir_normal_object = dir3(
    frame_object,
    quantity(dimensionlessUnit, 0),
    quantity(dimensionlessUnit, 0),
    quantity(dimensionlessUnit, 1),
  );
  const delta_normal_world = transformDirection3(normalMatrixFromMat4(pose_world_object), dir_normal_object);
  const dir_normal_world = normalizeVec3(delta_normal_world);

  const delta_incoming_world = delta3(
    frame_world,
    quantity(meter, 0.5),
    quantity(meter, -1),
    quantity(meter, -0.5),
  );
  const delta_reflected_world = reflectVec3(
    delta_incoming_world,
    dir_normal_world,
  );

  const delta_reference_world = scaleDir3(
    dir_normal_world,
    quantity(meter, 1),
  );
  const angle_incidence = angleBetweenVec3(
    negVec3(delta_incoming_world),
    delta_reference_world,
  );
  const angle_reflection = angleBetweenVec3(
    delta_reflected_world,
    delta_reference_world,
  );
  assertAlmostEquals(angle_incidence, angle_reflection, GEOM_EPS);

  const normal_component = dotVec3(
    delta_reflected_world,
    delta_reference_world,
  );
  assert(normal_component > GEOM_EPS);
});
