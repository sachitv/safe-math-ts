declare const quantityBrand: unique symbol;
declare const unitTagBrand: unique symbol;

/**
 * Internal normalized unit representation used only at the type level.
 *
 * Examples:
 * - `m/s^2` => `{ num: ['m'], den: ['s', 's'] }`
 * - `none` => `{ num: [], den: [] }`
 */
type UnitParts<
  Numerator extends readonly string[] = [],
  Denominator extends readonly string[] = [],
> = {
  readonly num: readonly [...Numerator];
  readonly den: readonly [...Denominator];
};

/** Fallback shape when a unit cannot be fully resolved at compile time. */
type UnknownUnit = UnitParts<readonly string[], readonly string[]>;

/** Normalized compile-time unit representation. */
export type UnitExpr = UnknownUnit;

/** Canonical dimensionless unit representation. */
export type Dimensionless = UnitFromString<'none'>;

/** Prevents undesired generic widening in function signatures. */
export type NoInfer<ValueType> = [
  ValueType,
][ValueType extends unknown ? 0 : never];

/** Returns whether `Token` exists inside `Tokens`. */
type IncludesToken<
  Tokens extends readonly string[],
  Token extends string,
> = Tokens extends
  readonly [infer Head extends string, ...infer Tail extends string[]]
  ? Head extends Token ? true : IncludesToken<Tail, Token>
  : false;

/** Removes only the first instance of `Token` from `Tokens`. */
type RemoveFirstToken<
  Tokens extends readonly string[],
  Token extends string,
> = Tokens extends
  readonly [infer Head extends string, ...infer Tail extends string[]]
  ? Head extends Token ? Tail : [Head, ...RemoveFirstToken<Tail, Token>]
  : [];

/**
 * Cancels common factors between numerator and denominator token lists.
 *
 * Example:
 * - num ['m', 's'], den ['s'] => num ['m'], den []
 */
type CancelTokens<
  Numerator extends readonly string[],
  Denominator extends readonly string[],
  KeptNumerator extends string[] = [],
> = Numerator extends readonly [
  infer Head extends string,
  ...infer Tail extends string[],
]
  ? IncludesToken<Denominator, Head> extends true
    ? CancelTokens<Tail, RemoveFirstToken<Denominator, Head>, KeptNumerator>
  : CancelTokens<Tail, Denominator, [...KeptNumerator, Head]>
  : UnitParts<KeptNumerator, [...Denominator]>;

/**
 * Normalization entrypoint for raw token lists.
 *
 * If either side is widened (not a fixed tuple), return `UnknownUnit`.
 */
type NormalizeTokens<
  Numerator extends readonly string[],
  Denominator extends readonly string[],
> = number extends Numerator['length'] ? UnknownUnit
  : number extends Denominator['length'] ? UnknownUnit
  : CancelTokens<Numerator, Denominator>;

/** Normalizes a full `UnitExpr` object. */
type NormalizeUnit<Unit extends UnitExpr> = NormalizeTokens<
  Unit['num'],
  Unit['den']
>;

type IsNaturalNumberText<Value extends string> = Value extends '' ? false
  : Value extends `-${string}` ? false
  : Value extends `${string}.${string}` ? false
  : Value extends `${string}e${string}` | `${string}E${string}` ? false
  : true;

/**
 * Parses a natural-number literal string (`'2'`) into its number literal (`2`).
 *
 * Returns `null` for negative/decimal/exponential forms so callers can
 * safely fall back to opaque token handling for invalid exponents.
 */
type ParseNat<Value extends string> = IsNaturalNumberText<Value> extends true
  ? Value extends `${infer Parsed extends number}`
    ? `${Parsed}` extends Value ? Parsed
    : null
  : null
  : null;

/** Builds `Count` copies of `Token` (`s^2` -> ['s', 's']). */
type RepeatToken<
  Token extends string,
  Count extends number,
  Output extends string[] = [],
> = Output['length'] extends Count ? Output
  : RepeatToken<Token, Count, [...Output, Token]>;

/**
 * Parses one factor token:
 * - `none` => dimensionless
 * - `m` => ['m']
 * - `s^2` => ['s', 's']
 */
type ParseFactor<Factor extends string> = string extends Factor ? UnknownUnit
  : Factor extends '' ? UnknownUnit
  : Factor extends 'none' ? UnitParts
  : Factor extends `${infer Base}^${infer ExponentText}`
    ? Base extends '' ? UnknownUnit
    : ParseNat<ExponentText> extends infer Exponent extends number
      ? UnitParts<RepeatToken<Base, Exponent>, []>
    : UnitParts<[Factor], []>
  : UnitParts<[Factor], []>;

/**
 * Splits an expression into `[term, operator, rest]`.
 *
 * Example:
 * - `m/s^2` -> ['m', '/', 's^2']
 */
type TakeTerm<
  Source extends string,
  Current extends string = '',
> = string extends Source ? [Source, '', '']
  : Source extends `${infer Character}${infer Rest}`
    ? Character extends '*' | '/' ? [Current, Character, Rest]
    : TakeTerm<Rest, `${Current}${Character}`>
  : [Current, '', ''];

/** Type-level unit multiplication helper. */
export type MulUnit<LeftUnit extends UnitExpr, RightUnit extends UnitExpr> =
  NormalizeTokens<
    [...LeftUnit['num'], ...RightUnit['num']],
    [...LeftUnit['den'], ...RightUnit['den']]
  >;

/** Type-level unit division helper. */
export type DivUnit<LeftUnit extends UnitExpr, RightUnit extends UnitExpr> =
  NormalizeTokens<
    [...LeftUnit['num'], ...RightUnit['den']],
    [...LeftUnit['den'], ...RightUnit['num']]
  >;

/**
 * Extracts square-rootable pairs.
 *
 * Example:
 * - ['m', 'm', 's', 's'] => ['m', 's']
 * - ['m'] => never (not pairable)
 */
type PairTokens<
  Tokens extends readonly string[],
  Output extends string[] = [],
> = number extends Tokens['length'] ? never
  : Tokens extends
    readonly [infer Head extends string, ...infer Tail extends string[]]
    ? IncludesToken<Tail, Head> extends true
      ? PairTokens<RemoveFirstToken<Tail, Head>, [...Output, Head]>
    : never
  : Output;

/** Type-level square-root helper for normalized unit expressions. */
export type SqrtUnit<Unit extends UnitExpr> = NormalizeUnit<Unit> extends
  infer Normalized extends UnitExpr
  ? [PairTokens<Normalized['num']>] extends [never] ? never
  : [PairTokens<Normalized['den']>] extends [never] ? never
  : UnitParts<
    PairTokens<Normalized['num']>,
    PairTokens<Normalized['den']>
  >
  : never;

/**
 * Recursive parser:
 * 1. Parse the next factor
 * 2. Apply pending operator to accumulated unit
 * 3. Continue until no operator remains
 */
type ParseUnitTail<
  Accumulated extends UnitExpr,
  Operator extends string,
  Rest extends string,
> = Operator extends '' ? Accumulated
  : TakeTerm<Rest> extends [
    infer NextFactor extends string,
    infer NextOperator extends string,
    infer NextRest extends string,
  ]
    ? ParseFactor<NextFactor> extends infer NextUnit extends UnitExpr
      ? ParseUnitTail<
        Operator extends '*' ? MulUnit<Accumulated, NextUnit>
          : Operator extends '/' ? DivUnit<Accumulated, NextUnit>
          : Accumulated,
        NextOperator,
        NextRest
      >
    : never
  : never;

/** Parses the first factor, then delegates to `ParseUnitTail`. */
type ParseUnitExpr<Expr extends string> = TakeTerm<Expr> extends [
  infer FirstFactor extends string,
  infer FirstOperator extends string,
  infer Rest extends string,
]
  ? ParseFactor<FirstFactor> extends infer FirstUnit extends UnitExpr
    ? ParseUnitTail<FirstUnit, FirstOperator, Rest>
  : never
  : never;

/** Converts a unit expression string into a normalized compile-time unit type. */
export type UnitFromString<Expr extends string> = ParseUnitExpr<Expr>;

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

const asQuantity = <Unit extends UnitExpr>(value: number): Quantity<Unit> =>
  value as Quantity<Unit>;

/** Creates a compile-time unit token. */
export const unit = <Expr extends string>(
  name: Expr,
): UnitTag<UnitFromString<Expr>> =>
  name as unknown as UnitTag<UnitFromString<Expr>>;

/** Shared compile-time token for dimensionless quantities. */
export const dimensionlessUnit: UnitTag<Dimensionless> = unit('none');

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
 * Unsafe variant: performs no bound-order validation.
 */
export const clampUnsafe = <Unit extends UnitExpr>(
  value: Quantity<Unit>,
  minValue: Quantity<NoInfer<Unit>>,
  maxValue: Quantity<NoInfer<Unit>>,
): Quantity<Unit> => max(minValue, min(value, maxValue));

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

  return clampUnsafe(value, minValue, maxValue);
};

/** Multiplies a quantity by a unitless scalar. */
export const scale = <Unit extends UnitExpr>(
  value: Quantity<Unit>,
  scalar: number,
): Quantity<Unit> => asQuantity<Unit>(value * scalar);

/** Multiplies two quantities and composes normalized unit expressions. */
export const mul = <LeftUnit extends UnitExpr, RightUnit extends UnitExpr>(
  left: Quantity<LeftUnit>,
  right: Quantity<RightUnit>,
): Quantity<MulUnit<LeftUnit, RightUnit>> =>
  asQuantity<MulUnit<LeftUnit, RightUnit>>(left * right);

/** Divides two quantities and composes normalized unit expressions. */
export const div = <LeftUnit extends UnitExpr, RightUnit extends UnitExpr>(
  left: Quantity<LeftUnit>,
  right: Quantity<RightUnit>,
): Quantity<DivUnit<LeftUnit, RightUnit>> =>
  asQuantity<DivUnit<LeftUnit, RightUnit>>(left / right);

/** Computes square root of a squared-unit quantity. */
export function sqrt<Unit extends UnitExpr>(
  value: [SqrtUnit<Unit>] extends [never] ? never : Quantity<Unit>,
): Quantity<SqrtUnit<Unit>>;
export function sqrt<Unit extends UnitExpr>(
  value: Quantity<Unit>,
): Quantity<SqrtUnit<Unit>> {
  return asQuantity<SqrtUnit<Unit>>(Math.sqrt(value));
}

/**
 * Strict equality (`===`) for same-unit quantities.
 *
 * This uses exact comparison and does **not** account for floating-point
 * rounding error. After arithmetic (e.g. `add`, `sub`, `mul`) the result
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
