declare const quantityBrand: unique symbol;
declare const unitTagBrand: unique symbol;
declare const unitExprBrand: unique symbol;

type Count = readonly unknown[];

type UnitExponent<
  Numerator extends Count = Count,
  Denominator extends Count = Count,
> = {
  readonly num: readonly [...Numerator];
  readonly den: readonly [...Denominator];
};

type UnitMap = {
  readonly [Token: string]: UnitExponent;
};

type EmptyUnitMap = Record<never, UnitExponent>;

/**
 * Internal normalized unit representation used only at the type level.
 *
 * Examples:
 * - `m/s^2` => `{ factors: { m: { num: [..1], den: [] }, s: { num: [], den: [..2] } } }`
 * - `none` => `{ factors: {} }`
 */
type UnitParts<Factors extends UnitMap = EmptyUnitMap> = {
  readonly factors: Factors;
  readonly [unitExprBrand]: Extract<keyof Factors, string>;
};

/**
 * Fallback shape when a unit cannot be fully resolved at compile time.
 *
 * If unit string parsing fails silently (e.g. malformed tokens), the result
 * is `UnknownUnit`, which is structurally identical for all failed parses and
 * loses type distinctiveness. Avoid passing non-literal or malformed strings
 * to `unit()`.
 */
type UnknownUnit = UnitParts<UnitMap>;

/** Normalized compile-time unit representation. */
export type UnitExpr = UnknownUnit;

/** Canonical dimensionless unit representation. */
export type Dimensionless = UnitFromString<'none'>;

/** Prevents undesired generic widening in function signatures. */
export type NoInfer<ValueType> = [
  ValueType,
][ValueType extends unknown ? 0 : never];

type ZeroExponent = UnitExponent<[], []>;

type IsUnknownMap<Factors extends UnitMap> = string extends keyof Factors ? true
  : false;

type CancelCounts<
  Numerator extends Count,
  Denominator extends Count,
> = Numerator extends readonly [unknown, ...infer NumTail extends unknown[]]
  ? Denominator extends readonly [unknown, ...infer DenTail extends unknown[]]
    ? CancelCounts<NumTail, DenTail>
  : [Numerator, Denominator]
  : [Numerator, Denominator];

type ExponentFor<
  Factors extends UnitMap,
  Token extends string,
> = Token extends keyof Factors ? Factors[Token]
  : ZeroExponent;

type IsZeroExponent<Exponent extends UnitExponent> = Exponent['num'] extends
  readonly [] ? Exponent['den'] extends readonly [] ? true : false
  : false;

type NormalizeMap<Factors extends UnitMap> = {
  readonly [
    Token in keyof Factors as Token extends string
      ? IsZeroExponent<Factors[Token]> extends true ? never : Token
      : never
  ]: Factors[Token];
};

/** Normalizes a full `UnitExpr` object. */
type NormalizeUnit<Unit extends UnitExpr> =
  IsUnknownMap<Unit['factors']> extends true ? UnknownUnit
    : UnitParts<NormalizeMap<Unit['factors']>>;

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

/** Builds `Count` tuple entries (`s^2` -> [unknown, unknown]). */
type RepeatCount<
  Count extends number,
  Output extends unknown[] = [],
> = Output['length'] extends Count ? Output
  : RepeatCount<Count, [...Output, unknown]>;

/**
 * Parses one factor token:
 * - `none` => dimensionless
 * - `m` => m^1
 * - `s^2` => s^2
 */
type ParseFactor<Factor extends string> = string extends Factor ? UnknownUnit
  : Factor extends '' ? UnknownUnit
  : Factor extends 'none' ? UnitParts<EmptyUnitMap>
  : Factor extends `${infer Base}^${infer ExponentText}`
    ? Base extends '' ? UnknownUnit
    : ParseNat<ExponentText> extends infer Exponent extends number ? UnitParts<
        {
          readonly [Token in Base]: UnitExponent<RepeatCount<Exponent>, []>;
        }
      >
    : UnitParts<
      {
        readonly [Token in Factor]: UnitExponent<[unknown], []>;
      }
    >
  : UnitParts<
    {
      readonly [Token in Factor]: UnitExponent<[unknown], []>;
    }
  >;

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
  IsUnknownMap<LeftUnit['factors']> extends true ? UnknownUnit
    : IsUnknownMap<RightUnit['factors']> extends true ? UnknownUnit
    : UnitParts<
      NormalizeMap<
        {
          readonly [
            Token in
              | keyof LeftUnit['factors']
              | keyof RightUnit['factors'] as Token extends string ? Token
                : never
          ]: CancelCounts<
            [
              ...ExponentFor<LeftUnit['factors'], Token & string>['num'],
              ...ExponentFor<RightUnit['factors'], Token & string>['num'],
            ],
            [
              ...ExponentFor<LeftUnit['factors'], Token & string>['den'],
              ...ExponentFor<RightUnit['factors'], Token & string>['den'],
            ]
          > extends [
            infer Numerator extends Count,
            infer Denominator extends Count,
          ] ? UnitExponent<Numerator, Denominator>
            : never;
        }
      >
    >;

/** Type-level unit division helper. */
export type DivUnit<LeftUnit extends UnitExpr, RightUnit extends UnitExpr> =
  IsUnknownMap<LeftUnit['factors']> extends true ? UnknownUnit
    : IsUnknownMap<RightUnit['factors']> extends true ? UnknownUnit
    : UnitParts<
      NormalizeMap<
        {
          readonly [
            Token in
              | keyof LeftUnit['factors']
              | keyof RightUnit['factors'] as Token extends string ? Token
                : never
          ]: CancelCounts<
            [
              ...ExponentFor<LeftUnit['factors'], Token & string>['num'],
              ...ExponentFor<RightUnit['factors'], Token & string>['den'],
            ],
            [
              ...ExponentFor<LeftUnit['factors'], Token & string>['den'],
              ...ExponentFor<RightUnit['factors'], Token & string>['num'],
            ]
          > extends [
            infer Numerator extends Count,
            infer Denominator extends Count,
          ] ? UnitExponent<Numerator, Denominator>
            : never;
        }
      >
    >;

type HalfCount<
  Source extends Count,
  Output extends unknown[] = [],
> = Source extends readonly [unknown, unknown, ...infer Tail extends unknown[]]
  ? HalfCount<Tail, [...Output, unknown]>
  : Source extends readonly [] ? Output
  : never;

type HalfFactor<Factor extends UnitExponent> = UnitExponent<
  HalfCount<Factor['num']>,
  HalfCount<Factor['den']>
>;

type HasInvalidHalf<Factors extends UnitMap> = true extends {
  [Token in keyof Factors]: HalfCount<Factors[Token]['num']> extends never
    ? true
    : HalfCount<Factors[Token]['den']> extends never ? true
    : false;
}[keyof Factors] ? true
  : false;

/** Type-level square-root helper for normalized unit expressions. */
export type SqrtUnit<Unit extends UnitExpr> = NormalizeUnit<Unit> extends
  infer Normalized extends UnitExpr
  ? IsUnknownMap<Normalized['factors']> extends true ? never
  : HasInvalidHalf<Normalized['factors']> extends true ? never
  : UnitParts<
    NormalizeMap<
      {
        readonly [Token in keyof Normalized['factors']]: HalfFactor<
          Normalized['factors'][Token]
        >;
      }
    >
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
> = Operator extends '' ? NormalizeUnit<Accumulated>
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

/**
 * Casts a raw number into a branded quantity.
 *
 * @param value Raw numeric scalar.
 * @returns Branded quantity of the requested unit type.
 */
const asQuantity = <Unit extends UnitExpr>(value: number): Quantity<Unit> =>
  value as Quantity<Unit>;

/**
 * Creates a compile-time unit token.
 *
 * @param name Unit expression text (for example `m/s^2` or `none`).
 * @returns Branded token used to construct unit-safe quantities.
 */
export const unit = <Expr extends string>(
  name: string extends Expr ? never : Expr,
): UnitTag<UnitFromString<Expr>> =>
  name as unknown as UnitTag<UnitFromString<Expr>>;

/** Shared compile-time token for the `none` (dimensionless) unit. */
export const dimensionlessUnit: UnitTag<Dimensionless> = unit('none');

/**
 * Creates a quantity from an explicit unit token and numeric value.
 *
 * @param unitTag Compile-time unit token.
 * @param value Raw numeric value.
 * @returns Branded unit-safe quantity.
 */
export const quantity = <Unit extends UnitExpr>(
  unitTag: UnitTag<Unit>,
  value: number,
): Quantity<Unit> => {
  void unitTag;
  return asQuantity<Unit>(value);
};

/**
 * Creates a dimensionless quantity.
 *
 * @param value Raw numeric value.
 * @returns Quantity branded as `none`.
 */
export const dimensionless = (value: number): Quantity<Dimensionless> =>
  asQuantity<Dimensionless>(value);

/**
 * Unwraps a quantity to its raw numeric value.
 *
 * @param value Branded quantity.
 * @returns Underlying runtime number.
 */
export const valueOf = <Unit extends UnitExpr>(value: Quantity<Unit>): number =>
  value;

/**
 * Adds two same-unit quantities.
 *
 * @param left Left operand.
 * @param right Right operand with the same unit as `left`.
 * @returns Sum in the same unit.
 */
export const add = <Unit extends UnitExpr>(
  left: Quantity<Unit>,
  right: Quantity<NoInfer<Unit>>,
): Quantity<Unit> => asQuantity<Unit>(left + right);

/**
 * Subtracts two same-unit quantities.
 *
 * @param left Left operand.
 * @param right Right operand with the same unit as `left`.
 * @returns Difference in the same unit.
 */
export const sub = <Unit extends UnitExpr>(
  left: Quantity<Unit>,
  right: Quantity<NoInfer<Unit>>,
): Quantity<Unit> => asQuantity<Unit>(left - right);

/**
 * Negates a quantity.
 *
 * @param value Input quantity.
 * @returns Quantity with sign flipped.
 */
export const neg = <Unit extends UnitExpr>(
  value: Quantity<Unit>,
): Quantity<Unit> => asQuantity<Unit>(-value);

/**
 * Computes absolute value of a quantity.
 *
 * @param value Input quantity.
 * @returns Non-negative quantity in the same unit.
 */
export const abs = <Unit extends UnitExpr>(
  value: Quantity<Unit>,
): Quantity<Unit> => asQuantity<Unit>(Math.abs(value));

/**
 * Returns the smaller of two same-unit quantities.
 *
 * @param left Left operand.
 * @param right Right operand with the same unit as `left`.
 * @returns Smaller quantity.
 */
export const min = <Unit extends UnitExpr>(
  left: Quantity<Unit>,
  right: Quantity<NoInfer<Unit>>,
): Quantity<Unit> => asQuantity<Unit>(Math.min(left, right));

/**
 * Returns the larger of two same-unit quantities.
 *
 * @param left Left operand.
 * @param right Right operand with the same unit as `left`.
 * @returns Larger quantity.
 */
export const max = <Unit extends UnitExpr>(
  left: Quantity<Unit>,
  right: Quantity<NoInfer<Unit>>,
): Quantity<Unit> => asQuantity<Unit>(Math.max(left, right));

/**
 * Clamps a quantity to the inclusive range [`minValue`, `maxValue`].
 *
 * Unsafe variant: performs no bound-order validation.
 *
 * @param value Value to clamp.
 * @param minValue Inclusive lower bound.
 * @param maxValue Inclusive upper bound.
 * @returns Clamped quantity.
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
 *
 * @param value Value to clamp.
 * @param minValue Inclusive lower bound.
 * @param maxValue Inclusive upper bound.
 * @returns Clamped quantity.
 * @throws {Error} When `minValue > maxValue`.
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

/**
 * Multiplies a quantity by a unitless scalar.
 *
 * @param value Input quantity.
 * @param scalar Unitless scale factor.
 * @returns Scaled quantity in the same unit.
 */
export const scale = <Unit extends UnitExpr>(
  value: Quantity<Unit>,
  scalar: number,
): Quantity<Unit> => asQuantity<Unit>(value * scalar);

/**
 * Multiplies two quantities and composes normalized unit expressions.
 *
 * @param left Left quantity.
 * @param right Right quantity.
 * @returns Product with type-level multiplied unit.
 */
export const mul = <LeftUnit extends UnitExpr, RightUnit extends UnitExpr>(
  left: Quantity<LeftUnit>,
  right: Quantity<RightUnit>,
): Quantity<MulUnit<LeftUnit, RightUnit>> =>
  asQuantity<MulUnit<LeftUnit, RightUnit>>(left * right);

/**
 * Divides two quantities and composes normalized unit expressions.
 *
 * @param left Numerator quantity.
 * @param right Denominator quantity.
 * @returns Quotient with type-level divided unit.
 */
export const div = <LeftUnit extends UnitExpr, RightUnit extends UnitExpr>(
  left: Quantity<LeftUnit>,
  right: Quantity<RightUnit>,
): Quantity<DivUnit<LeftUnit, RightUnit>> =>
  asQuantity<DivUnit<LeftUnit, RightUnit>>(left / right);

/**
 * Computes square root of a quantity.
 *
 * @param value Quantity whose unit can be square-rooted at compile time.
 * @returns Square root with inferred root unit.
 */
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
 *
 * @param left Left operand.
 * @param right Right operand with the same unit as `left`.
 * @returns `true` only when values are exactly equal.
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
 *
 * @param left Left operand.
 * @param right Right operand with the same unit as `left`.
 * @param tolerance Maximum absolute difference allowed.
 * @returns `true` when values are approximately equal.
 */
export const approxEq = <Unit extends UnitExpr>(
  left: Quantity<Unit>,
  right: Quantity<NoInfer<Unit>>,
  tolerance = 1e-10,
): boolean => Math.abs(left - right) <= tolerance;

/**
 * Less-than comparison for same-unit quantities.
 *
 * @param left Left operand.
 * @param right Right operand with the same unit as `left`.
 * @returns `true` when `left < right`.
 */
export const lt = <Unit extends UnitExpr>(
  left: Quantity<Unit>,
  right: Quantity<NoInfer<Unit>>,
): boolean => left < right;

/**
 * Less-than-or-equal comparison for same-unit quantities.
 *
 * @param left Left operand.
 * @param right Right operand with the same unit as `left`.
 * @returns `true` when `left <= right`.
 */
export const lte = <Unit extends UnitExpr>(
  left: Quantity<Unit>,
  right: Quantity<NoInfer<Unit>>,
): boolean => left <= right;

/**
 * Greater-than comparison for same-unit quantities.
 *
 * @param left Left operand.
 * @param right Right operand with the same unit as `left`.
 * @returns `true` when `left > right`.
 */
export const gt = <Unit extends UnitExpr>(
  left: Quantity<Unit>,
  right: Quantity<NoInfer<Unit>>,
): boolean => left > right;

/**
 * Greater-than-or-equal comparison for same-unit quantities.
 *
 * @param left Left operand.
 * @param right Right operand with the same unit as `left`.
 * @returns `true` when `left >= right`.
 */
export const gte = <Unit extends UnitExpr>(
  left: Quantity<Unit>,
  right: Quantity<NoInfer<Unit>>,
): boolean => left >= right;

/**
 * Sums a list of same-unit quantities.
 *
 * @param values Input quantities with identical units.
 * @returns Total sum in the same unit.
 */
export const sum = <Unit extends UnitExpr>(
  values: readonly Quantity<Unit>[],
): Quantity<Unit> => {
  let total = 0;
  for (const value of values) {
    total += value;
  }

  return asQuantity<Unit>(total);
};

/**
 * Computes average of a non-empty list of same-unit quantities.
 *
 * @param values Non-empty input list.
 * @returns Arithmetic mean in the same unit.
 */
export const average = <Unit extends UnitExpr>(
  values: readonly [Quantity<Unit>, ...Quantity<Unit>[]],
): Quantity<Unit> => asQuantity<Unit>(sum(values) / values.length);
