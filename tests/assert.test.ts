import type { Quantity, UnitExpr } from '../mod.ts';

/** Throws when the condition is falsy. */
export const assert = (
  condition: boolean,
  message = 'Assertion failed',
): void => {
  if (!condition) {
    throw new Error(message);
  }
};

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const deepEqual = (left: unknown, right: unknown): boolean => {
  if (Object.is(left, right)) {
    return true;
  }

  if (Array.isArray(left) && Array.isArray(right)) {
    if (left.length !== right.length) {
      return false;
    }

    for (let index = 0; index < left.length; index += 1) {
      if (!deepEqual(left[index], right[index])) {
        return false;
      }
    }

    return true;
  }

  if (isObject(left) && isObject(right)) {
    const leftKeys = Object.keys(left);
    const rightKeys = Object.keys(right);

    if (leftKeys.length !== rightKeys.length) {
      return false;
    }

    for (const key of leftKeys) {
      if (!(key in right)) {
        return false;
      }

      if (!deepEqual(left[key], right[key])) {
        return false;
      }
    }

    return true;
  }

  return false;
};

/** Asserts deep equality between two values. */
export const assertEquals = <ActualType, ExpectedType>(
  actual: ActualType,
  expected: ExpectedType,
  message = 'Expected values to be equal',
): void => {
  if (!deepEqual(actual, expected)) {
    throw new Error(
      `${message}: actual=${JSON.stringify(actual)} expected=${
        JSON.stringify(expected)
      }`,
    );
  }
};

/** Asserts near-equality between two numbers within a tolerance. */
export const assertAlmostEquals = (
  actual: number,
  expected: number,
  tolerance = 1e-10,
  message = 'Expected values to be approximately equal',
): void => {
  if (Math.abs(actual - expected) > tolerance) {
    throw new Error(
      `${message}: actual=${actual} expected=${expected} tolerance=${tolerance}`,
    );
  }
};

export const GEOM_EPS = 1e-9;

export const assertInRange = (
  actual: number,
  min: number,
  max: number,
  tolerance = 0,
  message = 'Expected value to be in range',
): void => {
  if (actual < min - tolerance || actual > max + tolerance) {
    throw new Error(
      `${message}: actual=${actual} min=${min} max=${max} tolerance=${tolerance}`,
    );
  }
};

export const assertVec3AlmostEquals = (
  actual: readonly [number, number, number],
  expected: readonly [number, number, number],
  tolerance = GEOM_EPS,
): void => {
  assertAlmostEquals(actual[0], expected[0], tolerance, 'Vec3 x mismatch');
  assertAlmostEquals(actual[1], expected[1], tolerance, 'Vec3 y mismatch');
  assertAlmostEquals(actual[2], expected[2], tolerance, 'Vec3 z mismatch');
};

export const assertMat4AlmostEquals = (
  actual: readonly number[],
  expected: readonly number[],
  tolerance = GEOM_EPS,
): void => {
  if (actual.length !== 16 || expected.length !== 16) {
    throw new Error('Expected both matrices to have 16 elements');
  }

  for (let index = 0; index < 16; index += 1) {
    const actualValue = actual[index];
    const expectedValue = expected[index];
    if (actualValue === undefined || expectedValue === undefined) {
      throw new Error('Expected both matrices to have 16 elements');
    }

    assertAlmostEquals(
      actualValue,
      expectedValue,
      tolerance,
      `Mat4 element mismatch at index ${index}`,
    );
  }
};

/** Asserts that a function throws, optionally matching error type and message. */
export const assertThrows = (
  fn: () => unknown,
  errorType?: new (...args: never[]) => Error,
  messageIncludes?: string,
): void => {
  try {
    fn();
  } catch (error) {
    if (errorType !== undefined && !(error instanceof errorType)) {
      throw new Error(
        `Expected error type ${errorType.name}, got ${
          (error as Error).constructor?.name ?? 'unknown'
        }`,
      );
    }

    if (messageIncludes === undefined) {
      return;
    }

    const message = error instanceof Error ? error.message : String(error);
    if (!message.includes(messageIncludes)) {
      throw new Error(
        `Expected error message to include "${messageIncludes}", got "${message}"`,
      );
    }

    return;
  }

  throw new Error('Expected function to throw');
};

/** Compile-time only assertion that two quantities share the same unit type. */
export const assertSameUnitType = <Unit extends UnitExpr>(
  _left: Quantity<Unit>,
  _right: Quantity<Unit>,
): void => {
  /** Type-level assertion only; runtime values are plain numbers. */
};
