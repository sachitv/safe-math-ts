import {
  delta3,
  dimensionlessUnit,
  dir3,
  frame,
  mat4LookAt,
  mat4Perspective,
  normalizeVec3,
  point3,
  quantity,
  unit,
} from '../mod.ts';
import { assertThrows } from '../tests/assert.ts';

Deno.test('example: safe APIs throw on degenerate camera and vector inputs', () => {
  const frame_world = frame('world');
  const frame_view = frame('view');
  const frame_ndc = frame('ndc');
  const meter = unit('m');

  const point_eye_world = point3(
    frame_world,
    quantity(meter, 0),
    quantity(meter, 0),
    quantity(meter, 0),
  );
  const dir_up_world = dir3(
    frame_world,
    quantity(dimensionlessUnit, 0),
    quantity(dimensionlessUnit, 1),
    quantity(dimensionlessUnit, 0),
  );

  assertThrows(
    () =>
      mat4LookAt(
        frame_view,
        frame_world,
        point_eye_world,
        point_eye_world,
        dir_up_world,
      ),
    Error,
    'LookAt requires eye and target to be distinct',
  );

  assertThrows(
    () =>
      mat4Perspective(
        frame_ndc,
        frame_view,
        Math.PI / 3,
        1,
        quantity(meter, 10),
        quantity(meter, 1),
      ),
    Error,
    'near and far must satisfy 0 < near < far',
  );

  assertThrows(
    () =>
      normalizeVec3(
        delta3(
          frame_world,
          quantity(meter, 0),
          quantity(meter, 0),
          quantity(meter, 0),
        ),
      ),
    Error,
    'Cannot normalize a zero-length vector',
  );
});
