import {
  addPoint3,
  addVec3,
  angleBetweenVec3,
  angleBetweenVec3Unsafe,
  crossVec3,
  delta3,
  dimensionlessUnit,
  dir3,
  distancePoint3,
  dotVec3,
  frame,
  lengthSquaredVec3,
  lengthVec3,
  lerpVec3,
  negVec3,
  normalizeVec3,
  normalizeVec3Unsafe,
  point3,
  projectVec3,
  projectVec3Unsafe,
  quantity,
  reflectVec3,
  reflectVec3Unsafe,
  scaleDir3,
  scaleVec3,
  subPoint3,
  subPoint3Delta3,
  subVec3,
  unit,
  valueOf,
  zeroVec3,
} from '../mod.ts';
import {
  assert,
  assertAlmostEquals,
  assertEquals,
  assertThrows,
} from './assert.test.ts';

Deno.test('delta3 creation and basic operations', () => {
  const meter = unit('m');
  const frame_world = frame('world');

  const delta_a_world = delta3(
    frame_world,
    quantity(meter, 1),
    quantity(meter, 2),
    quantity(meter, 3),
  );
  const delta_b_world = delta3(
    frame_world,
    quantity(meter, 4),
    quantity(meter, 5),
    quantity(meter, 6),
  );
  assertEquals(addVec3(delta_a_world, delta_b_world), [5, 7, 9]);
  assertEquals(subVec3(delta_b_world, delta_a_world), [3, 3, 3]);
  assertEquals(negVec3(delta_a_world), [-1, -2, -3]);
  assertEquals(scaleVec3(delta_a_world, 2), [2, 4, 6]);
  assertEquals(zeroVec3(meter, frame_world), [0, 0, 0]);
});

Deno.test('point/delta affine operations', () => {
  const frame_world = frame('world');
  const meter = unit('m');

  const point_origin_world = point3(
    frame_world,
    quantity(meter, 0),
    quantity(meter, 0),
    quantity(meter, 0),
  );
  const delta_offset_world = delta3(
    frame_world,
    quantity(meter, 3),
    quantity(meter, 4),
    quantity(meter, 0),
  );

  const point_world = addPoint3(point_origin_world, delta_offset_world);
  assertEquals(point_world, [3, 4, 0]);
  assertEquals(subPoint3(point_world, point_origin_world), [3, 4, 0]);
  assertEquals(subPoint3Delta3(point_world, delta_offset_world), [0, 0, 0]);
  assertEquals(valueOf(distancePoint3(point_world, point_origin_world)), 5);

  const point_mid_world = lerpVec3(point_origin_world, point_world, 0.5);
  assertEquals(point_mid_world, [1.5, 2, 0]);
});

Deno.test('dot/cross and direction scaling', () => {
  const frame_world = frame('world');
  const meter = unit('m');
  const second = unit('s');

  const delta_axisx_world = delta3(
    frame_world,
    quantity(meter, 1),
    quantity(meter, 0),
    quantity(meter, 0),
  );
  const delta_axisy_world = delta3(
    frame_world,
    quantity(second, 0),
    quantity(second, 1),
    quantity(second, 0),
  );

  assertEquals(valueOf(dotVec3(delta_axisx_world, delta_axisy_world)), 0);
  assertEquals(crossVec3(delta_axisx_world, delta_axisy_world), [0, 0, 1]);

  const dir_forward_world = dir3(
    frame_world,
    quantity(dimensionlessUnit, 0),
    quantity(dimensionlessUnit, 0),
    quantity(dimensionlessUnit, 1),
  );
  const delta_forward_world = scaleDir3(dir_forward_world, quantity(meter, 2));
  assertEquals(delta_forward_world, [0, 0, 2]);
});

Deno.test('length normalization projection reflection angle', () => {
  const frame_world = frame('world');
  const meter = unit('m');

  const delta_world = delta3(
    frame_world,
    quantity(meter, 3),
    quantity(meter, 4),
    quantity(meter, 0),
  );

  assertEquals(valueOf(lengthSquaredVec3(delta_world)), 25);
  assertEquals(valueOf(lengthVec3(delta_world)), 5);

  const dir_normalized_world = normalizeVec3(delta_world);
  assertAlmostEquals(dir_normalized_world[0], 0.6);
  assertAlmostEquals(dir_normalized_world[1], 0.8);
  assertAlmostEquals(dir_normalized_world[2], 0);

  const delta_value_world = delta3(
    frame_world,
    quantity(meter, 2),
    quantity(meter, 2),
    quantity(meter, 0),
  );
  const delta_onto_world = delta3(
    frame_world,
    quantity(meter, 1),
    quantity(meter, 0),
    quantity(meter, 0),
  );

  const delta_projected_world = projectVec3(
    delta_value_world,
    delta_onto_world,
  );
  assertAlmostEquals(delta_projected_world[0], 2, 1e-12);
  assertAlmostEquals(delta_projected_world[1], 0, 1e-12);
  assertAlmostEquals(delta_projected_world[2], 0, 1e-12);

  const delta_incident_world = delta3(
    frame_world,
    quantity(meter, 1),
    quantity(meter, -1),
    quantity(meter, 0),
  );
  const dir_normal_world = dir3(
    frame_world,
    quantity(dimensionlessUnit, 0),
    quantity(dimensionlessUnit, 2),
    quantity(dimensionlessUnit, 0),
  );
  const delta_reflected_world = reflectVec3(
    delta_incident_world,
    dir_normal_world,
  );
  assertAlmostEquals(delta_reflected_world[0], 1, 1e-12);
  assertAlmostEquals(delta_reflected_world[1], 1, 1e-12);
  assertAlmostEquals(delta_reflected_world[2], 0, 1e-12);

  const delta_axisx_world = delta3(
    frame_world,
    quantity(meter, 1),
    quantity(meter, 0),
    quantity(meter, 0),
  );
  const delta_axisy_world = delta3(
    frame_world,
    quantity(meter, 0),
    quantity(meter, 1),
    quantity(meter, 0),
  );
  assertAlmostEquals(
    angleBetweenVec3(delta_axisx_world, delta_axisy_world),
    Math.PI / 2,
  );

  assertThrows(
    () =>
      projectVec3(
        delta_value_world,
        delta3(
          frame_world,
          quantity(meter, 0),
          quantity(meter, 0),
          quantity(meter, 0),
        ),
      ),
    Error,
    'Cannot project onto a zero-length vector',
  );

  assertThrows(
    () =>
      angleBetweenVec3(
        delta_axisx_world,
        delta3(
          frame_world,
          quantity(meter, 0),
          quantity(meter, 0),
          quantity(meter, 0),
        ),
      ),
    Error,
    'Cannot compute angle with a zero-length vector',
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

Deno.test('near-zero vectors are rejected by epsilon guards', () => {
  const frame_world = frame('world');
  const meter = unit('m');

  assertThrows(
    () =>
      normalizeVec3(
        delta3(
          frame_world,
          quantity(meter, 1e-300),
          quantity(meter, 0),
          quantity(meter, 0),
        ),
      ),
    Error,
    'Cannot normalize a zero-length vector',
  );

  assertThrows(
    () =>
      projectVec3(
        delta3(
          frame_world,
          quantity(meter, 1),
          quantity(meter, 0),
          quantity(meter, 0),
        ),
        delta3(
          frame_world,
          quantity(meter, 1e-300),
          quantity(meter, 0),
          quantity(meter, 0),
        ),
      ),
    Error,
    'Cannot project onto a zero-length vector',
  );

  assertThrows(
    () =>
      angleBetweenVec3(
        delta3(
          frame_world,
          quantity(meter, 1),
          quantity(meter, 0),
          quantity(meter, 0),
        ),
        delta3(
          frame_world,
          quantity(meter, 1e-300),
          quantity(meter, 0),
          quantity(meter, 0),
        ),
      ),
    Error,
    'Cannot compute angle with a zero-length vector',
  );
});

Deno.test('unsafe vector helpers skip validation checks', () => {
  const frame_world = frame('world');
  const meter = unit('m');

  const delta_zero_world = delta3(
    frame_world,
    quantity(meter, 0),
    quantity(meter, 0),
    quantity(meter, 0),
  );
  const delta_x_world = delta3(
    frame_world,
    quantity(meter, 1),
    quantity(meter, 0),
    quantity(meter, 0),
  );
  const dir_zero_world = dir3(
    frame_world,
    quantity(dimensionlessUnit, 0),
    quantity(dimensionlessUnit, 0),
    quantity(dimensionlessUnit, 0),
  );

  const dir_normalized_world = normalizeVec3Unsafe(delta_zero_world);
  assert(Number.isNaN(dir_normalized_world[0]));

  const delta_projected_world = projectVec3Unsafe(
    delta_x_world,
    delta_zero_world,
  );
  assert(Number.isNaN(delta_projected_world[0]));

  const angle = angleBetweenVec3Unsafe(delta_x_world, delta_zero_world);
  assert(Number.isNaN(angle));

  const delta_reflected_world = reflectVec3Unsafe(
    delta_x_world,
    dir_zero_world,
  );
  assert(Number.isNaN(delta_reflected_world[0]));
});

Deno.test('subPoint3 yields Delta3', () => {
  const frame_world = frame('world');
  const meter = unit('m');

  const point_a_world = point3(
    frame_world,
    quantity(meter, 5),
    quantity(meter, 3),
    quantity(meter, 1),
  );
  const point_b_world = point3(
    frame_world,
    quantity(meter, 2),
    quantity(meter, 1),
    quantity(meter, 0),
  );

  const delta_world = subPoint3(point_a_world, point_b_world);
  assertEquals(delta_world, [3, 2, 1]);
});

Deno.test('lerpVec3 extrapolation t<0 and t>1', () => {
  const frame_world = frame('world');
  const meter = unit('m');

  const point_a_world = point3(
    frame_world,
    quantity(meter, 0),
    quantity(meter, 0),
    quantity(meter, 0),
  );
  const point_b_world = point3(
    frame_world,
    quantity(meter, 10),
    quantity(meter, 0),
    quantity(meter, 0),
  );

  const point_before_world = lerpVec3(point_a_world, point_b_world, -0.5);
  assertAlmostEquals(point_before_world[0], -5, 1e-12);

  const point_beyond_world = lerpVec3(point_a_world, point_b_world, 1.5);
  assertAlmostEquals(point_beyond_world[0], 15, 1e-12);
});

Deno.test('crossVec3 anti-commutativity', () => {
  const frame_world = frame('world');
  const meter = unit('m');

  const delta_a_world = delta3(
    frame_world,
    quantity(meter, 1),
    quantity(meter, 2),
    quantity(meter, 3),
  );
  const delta_b_world = delta3(
    frame_world,
    quantity(meter, 4),
    quantity(meter, 5),
    quantity(meter, 6),
  );

  const cross_ab = crossVec3(delta_a_world, delta_b_world);
  const cross_ba = crossVec3(delta_b_world, delta_a_world);
  assertAlmostEquals(cross_ab[0], -cross_ba[0], 1e-12);
  assertAlmostEquals(cross_ab[1], -cross_ba[1], 1e-12);
  assertAlmostEquals(cross_ab[2], -cross_ba[2], 1e-12);
});

Deno.test('angleBetweenVec3 symmetry', () => {
  const frame_world = frame('world');
  const meter = unit('m');

  const delta_a_world = delta3(
    frame_world,
    quantity(meter, 1),
    quantity(meter, 0),
    quantity(meter, 0),
  );
  const delta_b_world = delta3(
    frame_world,
    quantity(meter, 0),
    quantity(meter, 1),
    quantity(meter, 1),
  );

  const angle_ab = angleBetweenVec3(delta_a_world, delta_b_world);
  const angle_ba = angleBetweenVec3(delta_b_world, delta_a_world);
  assertAlmostEquals(angle_ab, angle_ba, 1e-12);
});
