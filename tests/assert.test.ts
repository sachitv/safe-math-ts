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
