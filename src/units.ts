declare const quantityBrand: unique symbol;
declare const unitTagBrand: unique symbol;

/** Canonical dimensionless unit expression. */
export type Dimensionless = '1';

/** String-based unit expression type. */
export type UnitExpr = string;

/** Prevents undesired generic widening in function signatures. */
export type NoInfer<ValueType> = [
  ValueType,
][ValueType extends unknown ? 0 : never];

/** Compile-time token for explicitly declaring units. */
export type UnitTag<Unit extends UnitExpr> = string & {
  readonly [unitTagBrand]: Unit;
};

/**
 * Unit-branded scalar quantity.
 *
 * Runtime representation is a plain number.
 */
export type Quantity<Unit extends UnitExpr> = number & {
  readonly [quantityBrand]: Unit;
};

/** Type-level unit multiplication helper. */
export type MulUnit<LeftUnit extends UnitExpr, RightUnit extends UnitExpr> =
  LeftUnit extends Dimensionless ? RightUnit
    : RightUnit extends Dimensionless ? LeftUnit
    : `${LeftUnit}*${RightUnit}`;

/** Type-level unit division helper. */
export type DivUnit<LeftUnit extends UnitExpr, RightUnit extends UnitExpr> =
  RightUnit extends Dimensionless ? LeftUnit
    : LeftUnit extends Dimensionless ? `${Dimensionless}/${RightUnit}`
    : `${LeftUnit}/${RightUnit}`;

const asQuantity = <Unit extends UnitExpr>(value: number): Quantity<Unit> =>
  value as Quantity<Unit>;

/** Creates a compile-time unit token. */
export const unit = <Unit extends UnitExpr>(name: Unit): UnitTag<Unit> =>
  name as unknown as UnitTag<Unit>;

/** Shared compile-time token for dimensionless quantities. */
export const dimensionlessUnit: UnitTag<Dimensionless> = unit('1');

/** Creates a quantity from an explicit unit token and numeric value. */
export const quantity = <Unit extends UnitExpr>(
  unitTag: UnitTag<Unit>,
  value: number,
): Quantity<Unit> => {
  void unitTag;
  return asQuantity<Unit>(value);
};

/** Creates a dimensionless quantity. */
export const dimensionless = (value: number): Quantity<Dimensionless> =>
  asQuantity<Dimensionless>(value);

/** Unwraps a quantity to its raw numeric value. */
export const valueOf = <Unit extends UnitExpr>(value: Quantity<Unit>): number =>
  value;

/** Adds two same-unit quantities. */
export const add = <Unit extends UnitExpr>(
  left: Quantity<Unit>,
  right: Quantity<NoInfer<Unit>>,
): Quantity<Unit> => asQuantity<Unit>(left + right);

/** Subtracts two same-unit quantities. */
export const sub = <Unit extends UnitExpr>(
  left: Quantity<Unit>,
  right: Quantity<NoInfer<Unit>>,
): Quantity<Unit> => asQuantity<Unit>(left - right);

/** Negates a quantity. */
export const neg = <Unit extends UnitExpr>(
  value: Quantity<Unit>,
): Quantity<Unit> => asQuantity<Unit>(-value);

/** Absolute value of a quantity. */
export const abs = <Unit extends UnitExpr>(
  value: Quantity<Unit>,
): Quantity<Unit> => asQuantity<Unit>(Math.abs(value));

/** Returns the smaller of two same-unit quantities. */
export const min = <Unit extends UnitExpr>(
  left: Quantity<Unit>,
  right: Quantity<NoInfer<Unit>>,
): Quantity<Unit> => asQuantity<Unit>(Math.min(left, right));

/** Returns the larger of two same-unit quantities. */
export const max = <Unit extends UnitExpr>(
  left: Quantity<Unit>,
  right: Quantity<NoInfer<Unit>>,
): Quantity<Unit> => asQuantity<Unit>(Math.max(left, right));

/**
 * Clamps a quantity to the inclusive range [`minValue`, `maxValue`].
 *
 * Throws when `minValue > maxValue`.
 */
export const clamp = <Unit extends UnitExpr>(
  value: Quantity<Unit>,
  minValue: Quantity<NoInfer<Unit>>,
  maxValue: Quantity<NoInfer<Unit>>,
): Quantity<Unit> => {
  if (minValue > maxValue) {
    throw new Error('minValue must be <= maxValue');
  }

  return max(minValue, min(value, maxValue));
};

/** Multiplies a quantity by a unitless scalar. */
export const scale = <Unit extends UnitExpr>(
  value: Quantity<Unit>,
  scalar: number,
): Quantity<Unit> => asQuantity<Unit>(value * scalar);

/** Multiplies two quantities and composes their unit expressions. */
export const mul = <LeftUnit extends UnitExpr, RightUnit extends UnitExpr>(
  left: Quantity<LeftUnit>,
  right: Quantity<RightUnit>,
): Quantity<MulUnit<LeftUnit, RightUnit>> =>
  asQuantity<MulUnit<LeftUnit, RightUnit>>(left * right);

/** Divides two quantities and composes their unit expressions. */
export const div = <LeftUnit extends UnitExpr, RightUnit extends UnitExpr>(
  left: Quantity<LeftUnit>,
  right: Quantity<RightUnit>,
): Quantity<DivUnit<LeftUnit, RightUnit>> =>
  asQuantity<DivUnit<LeftUnit, RightUnit>>(left / right);

/** Computes square root of a squared-unit quantity. */
export const sqrt = <Unit extends UnitExpr>(
  value: Quantity<`${Unit}*${Unit}`>,
): Quantity<Unit> => asQuantity<Unit>(Math.sqrt(value));

/**
 * Strict equality (`===`) for same-unit quantities.
 *
 * This uses exact comparison and does **not** account for floating-point
 * rounding error.  After arithmetic (e.g. `add`, `sub`, `mul`) the result
 * may differ from the mathematically expected value by a small epsilon.
 * Use `approxEq` when comparing quantities that have been through arithmetic.
 */
export const eq = <Unit extends UnitExpr>(
  left: Quantity<Unit>,
  right: Quantity<NoInfer<Unit>>,
): boolean => left === right;

/**
 * Approximate equality for same-unit quantities.
 *
 * Returns `true` when the absolute difference is within `tolerance`
 * (default `1e-10`).
 */
export const approxEq = <Unit extends UnitExpr>(
  left: Quantity<Unit>,
  right: Quantity<NoInfer<Unit>>,
  tolerance = 1e-10,
): boolean => Math.abs(left - right) <= tolerance;

/** Less-than comparison for same-unit quantities. */
export const lt = <Unit extends UnitExpr>(
  left: Quantity<Unit>,
  right: Quantity<NoInfer<Unit>>,
): boolean => left < right;

/** Less-than-or-equal comparison for same-unit quantities. */
export const lte = <Unit extends UnitExpr>(
  left: Quantity<Unit>,
  right: Quantity<NoInfer<Unit>>,
): boolean => left <= right;

/** Greater-than comparison for same-unit quantities. */
export const gt = <Unit extends UnitExpr>(
  left: Quantity<Unit>,
  right: Quantity<NoInfer<Unit>>,
): boolean => left > right;

/** Greater-than-or-equal comparison for same-unit quantities. */
export const gte = <Unit extends UnitExpr>(
  left: Quantity<Unit>,
  right: Quantity<NoInfer<Unit>>,
): boolean => left >= right;

/** Sums a list of same-unit quantities. */
export const sum = <Unit extends UnitExpr>(
  values: readonly Quantity<Unit>[],
): Quantity<Unit> => {
  let total = 0;
  for (const value of values) {
    total += value;
  }

  return asQuantity<Unit>(total);
};

/** Computes average of a non-empty list of same-unit quantities. */
export const average = <Unit extends UnitExpr>(
  values: readonly [Quantity<Unit>, ...Quantity<Unit>[]],
): Quantity<Unit> => asQuantity<Unit>(sum(values) / values.length);
