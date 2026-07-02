/** Values at or below this magnitude are treated as zero-length. */
export const NEAR_ZERO = 1e-14;

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
