import {
  type Dimensionless,
  type MulUnit,
  type NoInfer,
  type Quantity,
  quantity,
  type UnitExpr,
  type UnitTag,
} from '../units.ts';
import type { Delta3, Dir3, FrameTag, Point3 } from './types.ts';

/**
 * Casts a raw number into a branded quantity.
 *
 * @param value Raw numeric scalar.
 * @returns Branded quantity.
 */
const asQuantity = <Unit extends UnitExpr>(value: number): Quantity<Unit> =>
  value as Quantity<Unit>;

/**
 * Casts xyz components to a branded displacement tuple.
 *
 * @param x X component.
 * @param y Y component.
 * @param z Z component.
 * @returns Branded displacement.
 */
const asDelta3 = <Unit extends UnitExpr, Frame extends string>(
  x: Quantity<Unit>,
  y: Quantity<Unit>,
  z: Quantity<Unit>,
): Delta3<Unit, Frame> => [x, y, z] as unknown as Delta3<Unit, Frame>;

/**
 * Casts xyz components to a branded point tuple.
 *
 * @param x X component.
 * @param y Y component.
 * @param z Z component.
 * @returns Branded point.
 */
const asPoint3 = <Unit extends UnitExpr, Frame extends string>(
  x: Quantity<Unit>,
  y: Quantity<Unit>,
  z: Quantity<Unit>,
): Point3<Unit, Frame> => [x, y, z] as unknown as Point3<Unit, Frame>;

/**
 * Casts xyz components to a branded direction tuple.
 *
 * @param x X component.
 * @param y Y component.
 * @param z Z component.
 * @returns Branded direction.
 */
const asDir3 = <Frame extends string>(
  x: Quantity<Dimensionless>,
  y: Quantity<Dimensionless>,
  z: Quantity<Dimensionless>,
): Dir3<Frame> => [x, y, z] as unknown as Dir3<Frame>;

/**
 * Constructs a frame-aware displacement vector.
 *
 * @param frameTag Frame token for the resulting displacement.
 * @param x X component.
 * @param y Y component.
 * @param z Z component.
 * @returns Displacement in `frameTag`.
 */
export const delta3 = <Unit extends UnitExpr, Frame extends string>(
  frameTag: FrameTag<Frame>,
  x: Quantity<Unit>,
  y: Quantity<Unit>,
  z: Quantity<Unit>,
): Delta3<Unit, Frame> => {
  void frameTag;
  return asDelta3<Unit, Frame>(x, y, z);
};

/**
 * Constructs a frame-aware point.
 *
 * @param frameTag Frame token for the resulting point.
 * @param x X component.
 * @param y Y component.
 * @param z Z component.
 * @returns Point in `frameTag`.
 */
export const point3 = <Unit extends UnitExpr, Frame extends string>(
  frameTag: FrameTag<Frame>,
  x: Quantity<Unit>,
  y: Quantity<Unit>,
  z: Quantity<Unit>,
): Point3<Unit, Frame> => {
  void frameTag;
  return asPoint3<Unit, Frame>(x, y, z);
};

/**
 * Constructs a frame-aware direction (dimensionless).
 *
 * @param frameTag Frame token for the resulting direction.
 * @param x X component.
 * @param y Y component.
 * @param z Z component.
 * @returns Direction in `frameTag`.
 */
export const dir3 = <Frame extends string>(
  frameTag: FrameTag<Frame>,
  x: Quantity<Dimensionless>,
  y: Quantity<Dimensionless>,
  z: Quantity<Dimensionless>,
): Dir3<Frame> => {
  void frameTag;
  return asDir3<Frame>(x, y, z);
};

/**
 * Constructs a zero displacement for an explicit unit and frame.
 *
 * @param unitTag Unit token for the displacement components.
 * @param frameTag Frame token for the displacement.
 * @returns Zero displacement in the provided unit and frame.
 */
export const zeroVec3 = <Unit extends UnitExpr, Frame extends string>(
  unitTag: UnitTag<Unit>,
  frameTag: FrameTag<Frame>,
): Delta3<Unit, Frame> =>
  delta3<Unit, Frame>(
    frameTag,
    quantity(unitTag, 0),
    quantity(unitTag, 0),
    quantity(unitTag, 0),
  );

/**
 * Adds two displacements with matching unit and frame.
 *
 * @param left Left displacement.
 * @param right Right displacement in the same unit/frame.
 * @returns Component-wise sum.
 */
export const addVec3 = <Unit extends UnitExpr, Frame extends string>(
  left: Delta3<Unit, Frame>,
  right: Delta3<NoInfer<Unit>, NoInfer<Frame>>,
): Delta3<Unit, Frame> => {
  const x = asQuantity<Unit>(left[0] + right[0]);
  const y = asQuantity<Unit>(left[1] + right[1]);
  const z = asQuantity<Unit>(left[2] + right[2]);
  return asDelta3<Unit, Frame>(x, y, z);
};

/**
 * Subtracts two displacements with matching unit and frame.
 *
 * @param left Left displacement.
 * @param right Right displacement in the same unit/frame.
 * @returns Component-wise difference.
 */
export const subVec3 = <Unit extends UnitExpr, Frame extends string>(
  left: Delta3<Unit, Frame>,
  right: Delta3<NoInfer<Unit>, NoInfer<Frame>>,
): Delta3<Unit, Frame> => {
  const x = asQuantity<Unit>(left[0] - right[0]);
  const y = asQuantity<Unit>(left[1] - right[1]);
  const z = asQuantity<Unit>(left[2] - right[2]);
  return asDelta3<Unit, Frame>(x, y, z);
};

/**
 * Negates each displacement component.
 *
 * @param value Displacement to negate.
 * @returns Negated displacement.
 */
export const negVec3 = <Unit extends UnitExpr, Frame extends string>(
  value: Delta3<Unit, Frame>,
): Delta3<Unit, Frame> =>
  asDelta3<Unit, Frame>(
    asQuantity<Unit>(-value[0]),
    asQuantity<Unit>(-value[1]),
    asQuantity<Unit>(-value[2]),
  );

/**
 * Multiplies each displacement component by a unitless scalar.
 *
 * @param value Displacement to scale.
 * @param scalar Unitless multiplier.
 * @returns Scaled displacement.
 */
export const scaleVec3 = <Unit extends UnitExpr, Frame extends string>(
  value: Delta3<Unit, Frame>,
  scalar: number,
): Delta3<Unit, Frame> => {
  const x = asQuantity<Unit>(value[0] * scalar);
  const y = asQuantity<Unit>(value[1] * scalar);
  const z = asQuantity<Unit>(value[2] * scalar);
  return asDelta3<Unit, Frame>(x, y, z);
};

/**
 * Scales a unitless direction by a unitful magnitude.
 *
 * @param value Direction vector.
 * @param magnitude Unitful scalar magnitude.
 * @returns Displacement with unit derived from `magnitude`.
 */
export const scaleDir3 = <Unit extends UnitExpr, Frame extends string>(
  value: Dir3<Frame>,
  magnitude: Quantity<Unit>,
): Delta3<Unit, Frame> =>
  asDelta3<Unit, Frame>(
    asQuantity<Unit>(value[0] * magnitude),
    asQuantity<Unit>(value[1] * magnitude),
    asQuantity<Unit>(value[2] * magnitude),
  );

/**
 * Translates a point by a displacement.
 *
 * @param point Input point.
 * @param delta Translation displacement in the same frame/unit.
 * @returns Translated point.
 */
export const addPoint3 = <Unit extends UnitExpr, Frame extends string>(
  point: Point3<Unit, Frame>,
  delta: Delta3<NoInfer<Unit>, NoInfer<Frame>>,
): Point3<Unit, Frame> =>
  asPoint3<Unit, Frame>(
    asQuantity<Unit>(point[0] + delta[0]),
    asQuantity<Unit>(point[1] + delta[1]),
    asQuantity<Unit>(point[2] + delta[2]),
  );

/**
 * Offsets a point by subtracting a displacement.
 *
 * @param point Input point.
 * @param delta Displacement to subtract.
 * @returns Offset point.
 */
export const subPoint3Delta3 = <Unit extends UnitExpr, Frame extends string>(
  point: Point3<Unit, Frame>,
  delta: Delta3<NoInfer<Unit>, NoInfer<Frame>>,
): Point3<Unit, Frame> =>
  asPoint3<Unit, Frame>(
    asQuantity<Unit>(point[0] - delta[0]),
    asQuantity<Unit>(point[1] - delta[1]),
    asQuantity<Unit>(point[2] - delta[2]),
  );

/**
 * Computes the displacement from `right` point to `left` point.
 *
 * @param left Destination point.
 * @param right Source point.
 * @returns Displacement that moves `right` to `left`.
 */
export const subPoint3 = <Unit extends UnitExpr, Frame extends string>(
  left: Point3<Unit, Frame>,
  right: Point3<NoInfer<Unit>, NoInfer<Frame>>,
): Delta3<Unit, Frame> =>
  asDelta3<Unit, Frame>(
    asQuantity<Unit>(left[0] - right[0]),
    asQuantity<Unit>(left[1] - right[1]),
    asQuantity<Unit>(left[2] - right[2]),
  );

/**
 * Computes dot product for two displacements/directions in the same frame.
 *
 * @param left Left vector.
 * @param right Right vector in the same frame.
 * @returns Scalar product with multiplied unit.
 */
export const dotVec3 = <
  LeftUnit extends UnitExpr,
  RightUnit extends UnitExpr,
  Frame extends string,
>(
  left: Delta3<LeftUnit, Frame>,
  right: Delta3<RightUnit, NoInfer<Frame>>,
): Quantity<MulUnit<LeftUnit, RightUnit>> => {
  const xx = left[0] * right[0];
  const yy = left[1] * right[1];
  const zz = left[2] * right[2];
  const dot = xx + yy + zz;
  return asQuantity<MulUnit<LeftUnit, RightUnit>>(dot);
};

/**
 * Computes cross product for two displacements/directions in the same frame.
 *
 * @param left Left vector.
 * @param right Right vector in the same frame.
 * @returns Cross-product vector with multiplied unit.
 */
export const crossVec3 = <
  LeftUnit extends UnitExpr,
  RightUnit extends UnitExpr,
  Frame extends string,
>(
  left: Delta3<LeftUnit, Frame>,
  right: Delta3<RightUnit, NoInfer<Frame>>,
): Delta3<MulUnit<LeftUnit, RightUnit>, Frame> => {
  const x = asQuantity<MulUnit<LeftUnit, RightUnit>>(
    left[1] * right[2] - left[2] * right[1],
  );
  const y = asQuantity<MulUnit<LeftUnit, RightUnit>>(
    left[2] * right[0] - left[0] * right[2],
  );
  const z = asQuantity<MulUnit<LeftUnit, RightUnit>>(
    left[0] * right[1] - left[1] * right[0],
  );
  return asDelta3<MulUnit<LeftUnit, RightUnit>, Frame>(x, y, z);
};

/**
 * Computes squared Euclidean length of a displacement/direction.
 *
 * @param value Input vector.
 * @returns Squared length.
 */
export const lengthSquaredVec3 = <Unit extends UnitExpr, Frame extends string>(
  value: Delta3<Unit, Frame>,
): Quantity<MulUnit<Unit, Unit>> => dotVec3(value, value);

/**
 * Computes Euclidean length of a displacement/direction.
 *
 * @param value Input vector.
 * @returns Vector length.
 */
export const lengthVec3 = <Unit extends UnitExpr, Frame extends string>(
  value: Delta3<Unit, Frame>,
): Quantity<Unit> => asQuantity<Unit>(Math.hypot(value[0], value[1], value[2]));

/**
 * Computes Euclidean distance between two displacements.
 *
 * @param left Left displacement.
 * @param right Right displacement in the same unit/frame.
 * @returns Distance magnitude.
 */
export function distanceVec3<Unit extends UnitExpr, Frame extends string>(
  left: Delta3<Unit, Frame>,
  right: Delta3<NoInfer<Unit>, NoInfer<Frame>>,
): Quantity<Unit>;

/**
 * Computes Euclidean distance between two points.
 *
 * @param left Left point.
 * @param right Right point in the same unit/frame.
 * @returns Distance magnitude.
 */
export function distanceVec3<Unit extends UnitExpr, Frame extends string>(
  left: Point3<Unit, Frame>,
  right: Point3<NoInfer<Unit>, NoInfer<Frame>>,
): Quantity<Unit>;

export function distanceVec3<Unit extends UnitExpr, Frame extends string>(
  left: Delta3<Unit, Frame> | Point3<Unit, Frame>,
  right:
    | Delta3<NoInfer<Unit>, NoInfer<Frame>>
    | Point3<NoInfer<Unit>, NoInfer<Frame>>,
): Quantity<Unit> {
  const dx = left[0] - right[0];
  const dy = left[1] - right[1];
  const dz = left[2] - right[2];
  const distance = Math.hypot(dx, dy, dz);
  return asQuantity<Unit>(distance);
}

/**
 * Computes Euclidean distance between two points.
 *
 * @param left Left point.
 * @param right Right point in the same unit/frame.
 * @returns Distance magnitude.
 */
export const distancePoint3 = <Unit extends UnitExpr, Frame extends string>(
  left: Point3<Unit, Frame>,
  right: Point3<NoInfer<Unit>, NoInfer<Frame>>,
): Quantity<Unit> => distanceVec3(left, right);

const NEAR_ZERO = 1e-14;

/**
 * Normalizes displacement length to 1.
 *
 * Unsafe variant: performs no zero-length guard.
 * Degenerate inputs can yield `NaN`/`Infinity`.
 *
 * @param value Vector to normalize.
 * @returns Unit-length direction in the same frame.
 */
export const normalizeVec3Unsafe = <
  Unit extends UnitExpr,
  Frame extends string,
>(
  value: Delta3<Unit, Frame>,
): Dir3<Frame> => {
  const magnitude = lengthVec3(value);
  return asDir3<Frame>(
    asQuantity<Dimensionless>(value[0] / magnitude),
    asQuantity<Dimensionless>(value[1] / magnitude),
    asQuantity<Dimensionless>(value[2] / magnitude),
  );
};

/**
 * Normalizes displacement length to 1.
 *
 * Throws when vector length is at or below `1e-14`.
 *
 * @param value Vector to normalize.
 * @returns Unit-length direction in the same frame.
 * @throws {Error} When the vector is near zero length.
 */
export const normalizeVec3 = <Unit extends UnitExpr, Frame extends string>(
  value: Delta3<Unit, Frame>,
): Dir3<Frame> => {
  const magnitude = lengthVec3(value);
  if (magnitude <= NEAR_ZERO) {
    throw new Error('Cannot normalize a zero-length vector');
  }

  return normalizeVec3Unsafe(value);
};

/**
 * Linearly interpolates between two displacements.
 *
 * @param start Start displacement.
 * @param end End displacement in the same unit/frame.
 * @param t Interpolation parameter.
 * @returns Interpolated displacement.
 */
export function lerpVec3<Unit extends UnitExpr, Frame extends string>(
  start: Delta3<Unit, Frame>,
  end: Delta3<NoInfer<Unit>, NoInfer<Frame>>,
  t: number,
): Delta3<Unit, Frame>;

/**
 * Linearly interpolates between two points.
 *
 * @param start Start point.
 * @param end End point in the same unit/frame.
 * @param t Interpolation parameter.
 * @returns Interpolated point.
 */
export function lerpVec3<Unit extends UnitExpr, Frame extends string>(
  start: Point3<Unit, Frame>,
  end: Point3<NoInfer<Unit>, NoInfer<Frame>>,
  t: number,
): Point3<Unit, Frame>;

export function lerpVec3<Unit extends UnitExpr, Frame extends string>(
  start: Delta3<Unit, Frame> | Point3<Unit, Frame>,
  end:
    | Delta3<NoInfer<Unit>, NoInfer<Frame>>
    | Point3<NoInfer<Unit>, NoInfer<Frame>>,
  t: number,
): Delta3<Unit, Frame> | Point3<Unit, Frame> {
  const inverseT = 1 - t;
  const x = start[0] * inverseT +
    end[0] * t;
  const y = start[1] * inverseT +
    end[1] * t;
  const z = start[2] * inverseT +
    end[2] * t;

  return [
    asQuantity<Unit>(x),
    asQuantity<Unit>(y),
    asQuantity<Unit>(z),
  ] as unknown as Delta3<Unit, Frame> | Point3<Unit, Frame>;
}

/**
 * Projects a displacement onto another displacement in the same frame.
 *
 * Unsafe variant: performs no zero-length guard for `onto`.
 *
 * @param value Vector being projected.
 * @param onto Target direction for projection.
 * @returns Projection of `value` onto `onto`.
 */
export const projectVec3Unsafe = <
  ValueUnit extends UnitExpr,
  OntoUnit extends UnitExpr,
  Frame extends string,
>(
  value: Delta3<ValueUnit, Frame>,
  onto: Delta3<OntoUnit, NoInfer<Frame>>,
): Delta3<ValueUnit, Frame> => {
  const ontoLengthSquared = onto[0] * onto[0] +
    onto[1] * onto[1] +
    onto[2] * onto[2];
  const dotValueOnto = value[0] * onto[0] +
    value[1] * onto[1] +
    value[2] * onto[2];
  const scalar = dotValueOnto / ontoLengthSquared;

  return asDelta3<ValueUnit, Frame>(
    asQuantity<ValueUnit>(onto[0] * scalar),
    asQuantity<ValueUnit>(onto[1] * scalar),
    asQuantity<ValueUnit>(onto[2] * scalar),
  );
};

/**
 * Projects a displacement onto another displacement in the same frame.
 *
 * @param value Vector being projected.
 * @param onto Target direction for projection.
 * @returns Projection of `value` onto `onto`.
 * @throws {Error} When `onto` is near zero length.
 */
export const projectVec3 = <
  ValueUnit extends UnitExpr,
  OntoUnit extends UnitExpr,
  Frame extends string,
>(
  value: Delta3<ValueUnit, Frame>,
  onto: Delta3<OntoUnit, NoInfer<Frame>>,
): Delta3<ValueUnit, Frame> => {
  const ontoLengthSquared = onto[0] * onto[0] +
    onto[1] * onto[1] +
    onto[2] * onto[2];
  if (ontoLengthSquared <= NEAR_ZERO * NEAR_ZERO) {
    throw new Error('Cannot project onto a zero-length vector');
  }

  return projectVec3Unsafe(value, onto);
};

/**
 * Reflects a displacement around a normal direction.
 *
 * Unsafe variant: performs no zero-length guard for `normal`.
 *
 * @param incident Incident displacement.
 * @param normal Reflection normal direction.
 * @returns Reflected displacement.
 */
export const reflectVec3Unsafe = <Unit extends UnitExpr, Frame extends string>(
  incident: Delta3<Unit, Frame>,
  normal: Dir3<NoInfer<Frame>>,
): Delta3<Unit, Frame> => {
  const dir_normalized = normalizeVec3Unsafe(normal);
  const dotIncidentNormal = incident[0] * dir_normalized[0] +
    incident[1] * dir_normalized[1] +
    incident[2] * dir_normalized[2];
  const scale = 2 * dotIncidentNormal;

  return asDelta3<Unit, Frame>(
    asQuantity<Unit>(incident[0] - dir_normalized[0] * scale),
    asQuantity<Unit>(incident[1] - dir_normalized[1] * scale),
    asQuantity<Unit>(incident[2] - dir_normalized[2] * scale),
  );
};

/**
 * Reflects a displacement around a normal direction.
 *
 * @param incident Incident displacement.
 * @param normal Reflection normal direction.
 * @returns Reflected displacement.
 * @throws {Error} When `normal` is near zero length.
 */
export const reflectVec3 = <Unit extends UnitExpr, Frame extends string>(
  incident: Delta3<Unit, Frame>,
  normal: Dir3<NoInfer<Frame>>,
): Delta3<Unit, Frame> => {
  normalizeVec3(normal);
  return reflectVec3Unsafe(incident, normal);
};

/**
 * Computes the angle in radians between two displacements.
 *
 * Unsafe variant: performs no zero-length guards.
 *
 * @param left Left vector.
 * @param right Right vector.
 * @returns Angle in radians.
 */
export const angleBetweenVec3Unsafe = <
  LeftUnit extends UnitExpr,
  RightUnit extends UnitExpr,
  Frame extends string,
>(
  left: Delta3<LeftUnit, Frame>,
  right: Delta3<RightUnit, NoInfer<Frame>>,
): number => {
  const leftLength = Math.hypot(left[0], left[1], left[2]);
  const rightLength = Math.hypot(right[0], right[1], right[2]);
  const dotLeftRight = left[0] * right[0] +
    left[1] * right[1] +
    left[2] * right[2];
  const lengthProduct = leftLength * rightLength;
  const cosine = dotLeftRight / lengthProduct;

  const clamped = Math.max(-1, Math.min(1, cosine));
  return Math.acos(clamped);
};

/**
 * Computes the angle in radians between two non-zero displacements.
 *
 * @param left Left vector.
 * @param right Right vector.
 * @returns Angle in radians.
 * @throws {Error} When either vector is near zero length.
 */
export const angleBetweenVec3 = <
  LeftUnit extends UnitExpr,
  RightUnit extends UnitExpr,
  Frame extends string,
>(
  left: Delta3<LeftUnit, Frame>,
  right: Delta3<RightUnit, NoInfer<Frame>>,
): number => {
  const leftLength = Math.hypot(left[0], left[1], left[2]);
  const rightLength = Math.hypot(right[0], right[1], right[2]);

  if (leftLength <= NEAR_ZERO || rightLength <= NEAR_ZERO) {
    throw new Error('Cannot compute angle with a zero-length vector');
  }

  return angleBetweenVec3Unsafe(left, right);
};
