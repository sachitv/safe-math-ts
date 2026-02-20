import {
  abs,
  add,
  approxEq,
  average,
  clamp,
  dimensionless,
  dimensionlessUnit,
  div,
  eq,
  gt,
  gte,
  lt,
  lte,
  max,
  min,
  mul,
  neg,
  quantity,
  scale,
  sqrt,
  sub,
  sum,
  unit,
  valueOf,
} from '../mod.ts';
import type { Quantity } from '../mod.ts';
import {
  assert,
  assertAlmostEquals,
  assertEquals,
  assertThrows,
} from './assert.test.ts';

const assertUnit = <Unit extends string>(
  _value: Quantity<Unit>,
): void => {
  // Compile-time only assertion that the quantity carries Unit.
};

Deno.test('units arithmetic and comparisons', () => {
  const meter = unit('m');
  const a = quantity(meter, 5);
  const b = quantity(meter, 2);

  const added = add(a, b);
  const subtracted = sub(a, b);
  const negated = neg(b);
  const absolute = abs(negated);
  const minimum = min(a, b);
  const maximum = max(a, b);
  const scaled = scale(a, 2);

  assertUnit<'m'>(added);
  assertUnit<'m'>(subtracted);
  assertUnit<'m'>(negated);
  assertUnit<'m'>(absolute);
  assertUnit<'m'>(minimum);
  assertUnit<'m'>(maximum);
  assertUnit<'m'>(scaled);

  assertEquals(valueOf(added), 7);
  assertEquals(valueOf(subtracted), 3);
  assertEquals(valueOf(negated), -2);
  assertEquals(valueOf(absolute), 2);
  assertEquals(valueOf(minimum), 2);
  assertEquals(valueOf(maximum), 5);
  assertEquals(valueOf(scaled), 10);

  assert(eq(a, quantity(meter, 5)));
  assert(!eq(a, b));
  assert(lt(b, a));
  assert(lte(b, b));
  assert(gt(a, b));
  assert(gte(a, a));
});

Deno.test('units multiplication division and sqrt', () => {
  const meter = unit('m');
  const second = unit('s');
  const secondSquared = unit('s^2');
  const meters = quantity(meter, 3);
  const seconds = quantity(second, 2);
  const secondsSquared = quantity(secondSquared, 4);

  const area = mul(meters, meters);
  const velocity = div(meters, seconds);
  const accelerationComposed = div(velocity, seconds);
  const accelerationCanonical = div(meters, secondsSquared);
  assertUnit<'m*m'>(area);
  assertUnit<'m/s'>(velocity);
  assertUnit<'m/s/s'>(accelerationComposed);
  assertUnit<'m/s^2'>(accelerationCanonical);

  assertEquals(valueOf(area), 9);
  assertEquals(valueOf(velocity), 1.5);
  assertEquals(valueOf(accelerationComposed), 0.75);
  assertEquals(valueOf(accelerationCanonical), 0.75);

  const root = sqrt(area);
  assertUnit<'m'>(root);
  assertEquals(valueOf(root), 3);
});

Deno.test('dimensionless helper and aggregation', () => {
  const one = dimensionless(1);
  assertUnit<'1'>(one);
  assertEquals(valueOf(one), 1);

  const kilogram = unit('kg');
  const values = [
    quantity(kilogram, 2),
    quantity(kilogram, 4),
    quantity(kilogram, 6),
  ] as const;
  const summed = sum(values);
  const summedEmpty = sum([] as Quantity<'kg'>[]);
  const averaged = average(values);

  assertUnit<'kg'>(summed);
  assertUnit<'kg'>(summedEmpty);
  assertUnit<'kg'>(averaged);

  assertEquals(valueOf(summed), 12);
  assertEquals(valueOf(summedEmpty), 0);
  assertEquals(valueOf(averaged), 4);

  const explicit = quantity(dimensionlessUnit, 2);
  assertUnit<'1'>(explicit);
  assertEquals(valueOf(explicit), 2);
});

Deno.test('clamp enforces range and validates bounds', () => {
  const meter = unit('m');
  const value = quantity(meter, 5);
  const minValue = quantity(meter, 0);
  const maxValue = quantity(meter, 3);
  const clampedMax = clamp(value, minValue, maxValue);
  const clampedMiddle = clamp(quantity(meter, 1), minValue, maxValue);

  assertUnit<'m'>(clampedMax);
  assertUnit<'m'>(clampedMiddle);

  assertEquals(valueOf(clampedMax), 3);
  assertEquals(valueOf(clampedMiddle), 1);

  assertThrows(
    () => clamp(value, quantity(meter, 4), quantity(meter, 2)),
    Error,
    'minValue must be <= maxValue',
  );
});

Deno.test('basic numeric invariants', () => {
  const meter = unit('m');
  const a = quantity(meter, 10);
  const b = quantity(meter, 6);
  const c = quantity(meter, 4);
  const difference = sub(a, b);

  assertUnit<'m'>(difference);

  assertAlmostEquals(valueOf(difference), valueOf(c));
});

Deno.test('approxEq handles floating-point rounding', () => {
  const meter = unit('m');
  const a = add(quantity(meter, 0.1), quantity(meter, 0.2));
  const b = quantity(meter, 0.3);

  assert(!eq(a, b));
  assert(approxEq(a, b));
  assert(approxEq(a, b, 1e-15));
  assert(!approxEq(quantity(meter, 1), quantity(meter, 2)));
});
