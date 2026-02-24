import {
  add,
  addPoint3,
  delta3,
  frame,
  mul,
  point3,
  quantity,
  scale,
  unit,
  valueOf,
} from '../mod.ts';
import {
  GEOM_EPS,
  assertAlmostEquals,
  assertSameUnitType,
} from '../tests/assert.test.ts';

Deno.test('example: cookbook constant-acceleration update loop', () => {
  const frame_world = frame('world');
  const meter = unit('m');
  const second = unit('s');
  const meterPerSecond = unit('m/s');
  const meterPerSecondSquared = unit('m/s^2');

  const dt = quantity(second, 0.5);
  const accel_world = quantity(meterPerSecondSquared, 2);

  let speed_world = quantity(meterPerSecond, 0);
  let point_world = point3(
    frame_world,
    quantity(meter, 0),
    quantity(meter, 0),
    quantity(meter, 0),
  );

  for (let step = 0; step < 4; step += 1) {
    const speed_change = mul(accel_world, dt);
    const distance_step = add(
      mul(speed_world, dt),
      scale(mul(accel_world, mul(dt, dt)), 0.5),
    );

    speed_world = add(speed_world, speed_change);
    point_world = addPoint3(
      point_world,
      delta3(
        frame_world,
        distance_step,
        quantity(meter, 0),
        quantity(meter, 0),
      ),
    );
  }

  assertSameUnitType(speed_world, quantity(meterPerSecond, 0));
  assertAlmostEquals(valueOf(speed_world), 4, GEOM_EPS);
  assertAlmostEquals(point_world[0], 4, GEOM_EPS);
});
