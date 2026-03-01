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
  assertAlmostEquals,
  assertSameUnitType,
  GEOM_EPS,
} from '../tests/assert.ts';

Deno.test('example: unit-safe constant-acceleration kinematics', () => {
  const frame_world = frame('world');
  const meter = unit('m');
  const second = unit('s');
  const meterPerSecond = unit('m/s');
  const meterPerSecondSquared = unit('m/s^2');

  const speed_initial = quantity(meterPerSecond, 20);
  const accel_braking = quantity(meterPerSecondSquared, -5);
  const time_step = quantity(second, 2);

  /** Kinematic velocity update: `v1 = v0 + a * t`. */
  const speed_change = mul(accel_braking, time_step);
  const speed_next = add(speed_initial, speed_change);
  assertSameUnitType(speed_next, quantity(meterPerSecond, 0));
  assertAlmostEquals(valueOf(speed_next), 10, GEOM_EPS);

  /** Kinematic displacement update: `x = v0 * t + 0.5 * a * t^2`. */
  const distance_step = add(
    mul(speed_initial, time_step),
    scale(mul(accel_braking, mul(time_step, time_step)), 0.5),
  );
  assertAlmostEquals(valueOf(distance_step), 30, GEOM_EPS);
  assertSameUnitType(distance_step, quantity(meter, 0));

  const point_start_world = point3(
    frame_world,
    quantity(meter, 0),
    quantity(meter, 0),
    quantity(meter, 0),
  );
  const delta_motion_world = delta3(
    frame_world,
    distance_step,
    quantity(meter, 0),
    quantity(meter, 0),
  );
  const point_next_world = addPoint3(point_start_world, delta_motion_world);
  assertAlmostEquals(point_next_world[0], 30, GEOM_EPS);
});
