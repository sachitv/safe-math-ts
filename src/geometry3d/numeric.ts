/** Values at or below this magnitude are treated as zero-length. */
export const NEAR_ZERO = 1e-14;

/** Default tolerance for scale-invariant relative comparisons. */
export const RELATIVE_EPSILON = 1e-10;

/** Precomputed square of {@link RELATIVE_EPSILON} for squared-term comparisons. */
export const RELATIVE_EPSILON_SQ = RELATIVE_EPSILON * RELATIVE_EPSILON;

/**
 * Checks whether a value is finite and strictly greater than `threshold`.
 *
 * `NaN` and `Infinity` always fail, since a plain `value > threshold`
 * comparison is silently `false` for `NaN` and would let it slip past a
 * naive validation guard.
 *
 * @param value Value to check.
 * @param threshold Exclusive lower bound.
 * @returns `true` when `value` is finite and above `threshold`.
 */
export const isFiniteAndAbove = (value: number, threshold: number): boolean =>
  Number.isFinite(value) && value > threshold;

/**
 * Checks whether two scalar values are within epsilon tolerance.
 *
 * @param actual Computed value.
 * @param expected Reference value.
 * @param epsilon Absolute tolerance.
 * @returns `true` when values are close enough.
 */
export const isApproximately = (
  actual: number,
  expected: number,
  epsilon: number,
): boolean => Math.abs(actual - expected) <= epsilon;

/**
 * Sum of squares of a 3-vector's components (squared Euclidean length).
 *
 * @param x First component.
 * @param y Second component.
 * @param z Third component.
 * @returns Squared length.
 */
export const lengthSquared3 = (x: number, y: number, z: number): number =>
  x * x + y * y + z * z;
