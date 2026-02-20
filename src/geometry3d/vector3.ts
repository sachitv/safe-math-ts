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

const asQuantity = <Unit extends UnitExpr>(value: number): Quantity<Unit> =>
  value as Quantity<Unit>;

const asDelta3 = <Unit extends UnitExpr, Frame extends string>(
  x: Quantity<Unit>,
  y: Quantity<Unit>,
  z: Quantity<Unit>,
): Delta3<Unit, Frame> => [x, y, z] as unknown as Delta3<Unit, Frame>;

const asPoint3 = <Unit extends UnitExpr, Frame extends string>(
  x: Quantity<Unit>,
  y: Quantity<Unit>,
  z: Quantity<Unit>,
): Point3<Unit, Frame> => [x, y, z] as unknown as Point3<Unit, Frame>;

const asDir3 = <Frame extends string>(
  x: Quantity<Dimensionless>,
  y: Quantity<Dimensionless>,
  z: Quantity<Dimensionless>,
): Dir3<Frame> => [x, y, z] as unknown as Dir3<Frame>;

/** Constructs a frame-aware displacement vector. */
export const delta3 = <Unit extends UnitExpr, Frame extends string>(
  frameTag: FrameTag<Frame>,
  x: Quantity<Unit>,
  y: Quantity<Unit>,
  z: Quantity<Unit>,
): Delta3<Unit, Frame> => {
  void frameTag;
  return asDelta3<Unit, Frame>(x, y, z);
};

/** Constructs a frame-aware point. */
export const point3 = <Unit extends UnitExpr, Frame extends string>(
  frameTag: FrameTag<Frame>,
  x: Quantity<Unit>,
  y: Quantity<Unit>,
  z: Quantity<Unit>,
): Point3<Unit, Frame> => {
  void frameTag;
  return asPoint3<Unit, Frame>(x, y, z);
};

/** Constructs a frame-aware direction (dimensionless). */
export const dir3 = <Frame extends string>(
  frameTag: FrameTag<Frame>,
  x: Quantity<Dimensionless>,
  y: Quantity<Dimensionless>,
  z: Quantity<Dimensionless>,
): Dir3<Frame> => {
  void frameTag;
  return asDir3<Frame>(x, y, z);
};

/** Constructs a zero displacement for an explicit unit and frame. */
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

/** Adds two displacements with matching unit and frame. */
export const addVec3 = <Unit extends UnitExpr, Frame extends string>(
  left: Delta3<Unit, Frame>,
  right: Delta3<NoInfer<Unit>, NoInfer<Frame>>,
): Delta3<Unit, Frame> =>
  asDelta3<Unit, Frame>(
    asQuantity<Unit>(left[0] + right[0]),
    asQuantity<Unit>(left[1] + right[1]),
    asQuantity<Unit>(left[2] + right[2]),
  );

/** Subtracts two displacements with matching unit and frame. */
export const subVec3 = <Unit extends UnitExpr, Frame extends string>(
  left: Delta3<Unit, Frame>,
  right: Delta3<NoInfer<Unit>, NoInfer<Frame>>,
): Delta3<Unit, Frame> =>
  asDelta3<Unit, Frame>(
    asQuantity<Unit>(left[0] - right[0]),
    asQuantity<Unit>(left[1] - right[1]),
    asQuantity<Unit>(left[2] - right[2]),
  );

/** Negates each displacement component. */
export const negVec3 = <Unit extends UnitExpr, Frame extends string>(
  value: Delta3<Unit, Frame>,
): Delta3<Unit, Frame> =>
  asDelta3<Unit, Frame>(
    asQuantity<Unit>(-value[0]),
    asQuantity<Unit>(-value[1]),
    asQuantity<Unit>(-value[2]),
  );

/** Multiplies each displacement component by a unitless scalar. */
export const scaleVec3 = <Unit extends UnitExpr, Frame extends string>(
  value: Delta3<Unit, Frame>,
  scalar: number,
): Delta3<Unit, Frame> =>
  asDelta3<Unit, Frame>(
    asQuantity<Unit>(value[0] * scalar),
    asQuantity<Unit>(value[1] * scalar),
    asQuantity<Unit>(value[2] * scalar),
  );

/** Scales a unitless direction by a unitful magnitude. */
export const scaleDir3 = <Unit extends UnitExpr, Frame extends string>(
  value: Dir3<Frame>,
  magnitude: Quantity<Unit>,
): Delta3<Unit, Frame> =>
  asDelta3<Unit, Frame>(
    asQuantity<Unit>(value[0] * magnitude),
    asQuantity<Unit>(value[1] * magnitude),
    asQuantity<Unit>(value[2] * magnitude),
  );

/** Translates a point by a displacement. */
export const addPoint3 = <Unit extends UnitExpr, Frame extends string>(
  point: Point3<Unit, Frame>,
  delta: Delta3<NoInfer<Unit>, NoInfer<Frame>>,
): Point3<Unit, Frame> =>
  asPoint3<Unit, Frame>(
    asQuantity<Unit>(point[0] + delta[0]),
    asQuantity<Unit>(point[1] + delta[1]),
    asQuantity<Unit>(point[2] + delta[2]),
  );

/** Offsets a point by subtracting a displacement. */
export const subPoint3Delta3 = <Unit extends UnitExpr, Frame extends string>(
  point: Point3<Unit, Frame>,
  delta: Delta3<NoInfer<Unit>, NoInfer<Frame>>,
): Point3<Unit, Frame> =>
  asPoint3<Unit, Frame>(
    asQuantity<Unit>(point[0] - delta[0]),
    asQuantity<Unit>(point[1] - delta[1]),
    asQuantity<Unit>(point[2] - delta[2]),
  );

/** Computes the displacement from `right` point to `left` point. */
export const subPoint3 = <Unit extends UnitExpr, Frame extends string>(
  left: Point3<Unit, Frame>,
  right: Point3<NoInfer<Unit>, NoInfer<Frame>>,
): Delta3<Unit, Frame> =>
  asDelta3<Unit, Frame>(
    asQuantity<Unit>(left[0] - right[0]),
    asQuantity<Unit>(left[1] - right[1]),
    asQuantity<Unit>(left[2] - right[2]),
  );

/** Computes dot product for two displacements/directions in the same frame. */
export const dotVec3 = <
  LeftUnit extends UnitExpr,
  RightUnit extends UnitExpr,
  Frame extends string,
>(
  left: Delta3<LeftUnit, Frame>,
  right: Delta3<RightUnit, NoInfer<Frame>>,
): Quantity<MulUnit<LeftUnit, RightUnit>> =>
  asQuantity<MulUnit<LeftUnit, RightUnit>>(
    left[0] * right[0] + left[1] * right[1] + left[2] * right[2],
  );

/** Computes cross product for two displacements/directions in the same frame. */
export const crossVec3 = <
  LeftUnit extends UnitExpr,
  RightUnit extends UnitExpr,
  Frame extends string,
>(
  left: Delta3<LeftUnit, Frame>,
  right: Delta3<RightUnit, NoInfer<Frame>>,
): Delta3<MulUnit<LeftUnit, RightUnit>, Frame> =>
  asDelta3<MulUnit<LeftUnit, RightUnit>, Frame>(
    asQuantity<MulUnit<LeftUnit, RightUnit>>(
      left[1] * right[2] - left[2] * right[1],
    ),
    asQuantity<MulUnit<LeftUnit, RightUnit>>(
      left[2] * right[0] - left[0] * right[2],
    ),
    asQuantity<MulUnit<LeftUnit, RightUnit>>(
      left[0] * right[1] - left[1] * right[0],
    ),
  );

/** Computes squared Euclidean length of a displacement/direction. */
export const lengthSquaredVec3 = <Unit extends UnitExpr, Frame extends string>(
  value: Delta3<Unit, Frame>,
): Quantity<MulUnit<Unit, Unit>> => dotVec3(value, value);

/** Computes Euclidean length of a displacement/direction. */
export const lengthVec3 = <Unit extends UnitExpr, Frame extends string>(
  value: Delta3<Unit, Frame>,
): Quantity<Unit> => asQuantity<Unit>(Math.hypot(value[0], value[1], value[2]));

/** Computes Euclidean distance between two displacements. */
export function distanceVec3<Unit extends UnitExpr, Frame extends string>(
  left: Delta3<Unit, Frame>,
  right: Delta3<NoInfer<Unit>, NoInfer<Frame>>,
): Quantity<Unit>;

/** Computes Euclidean distance between two points. */
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
  return asQuantity<Unit>(
    Math.hypot(
      left[0] - right[0],
      left[1] - right[1],
      left[2] - right[2],
    ),
  );
}

/** Computes Euclidean distance between two points. */
export const distancePoint3 = <Unit extends UnitExpr, Frame extends string>(
  left: Point3<Unit, Frame>,
  right: Point3<NoInfer<Unit>, NoInfer<Frame>>,
): Quantity<Unit> => distanceVec3(left, right);

const NEAR_ZERO = 1e-14;

/**
 * Normalizes displacement length to 1.
 *
 * Throws when vector length is at or below `1e-14`.
 */
export const normalizeVec3 = <Unit extends UnitExpr, Frame extends string>(
  value: Delta3<Unit, Frame>,
): Dir3<Frame> => {
  const magnitude = lengthVec3(value);
  if (magnitude <= NEAR_ZERO) {
    throw new Error('Cannot normalize a zero-length vector');
  }

  return asDir3<Frame>(
    asQuantity<Dimensionless>(value[0] / magnitude),
    asQuantity<Dimensionless>(value[1] / magnitude),
    asQuantity<Dimensionless>(value[2] / magnitude),
  );
};

/** Linearly interpolates between two displacements. */
export function lerpVec3<Unit extends UnitExpr, Frame extends string>(
  start: Delta3<Unit, Frame>,
  end: Delta3<NoInfer<Unit>, NoInfer<Frame>>,
  t: number,
): Delta3<Unit, Frame>;

/** Linearly interpolates between two points. */
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
  return [
    asQuantity<Unit>(start[0] * inverseT + end[0] * t),
    asQuantity<Unit>(start[1] * inverseT + end[1] * t),
    asQuantity<Unit>(start[2] * inverseT + end[2] * t),
  ] as unknown as Delta3<Unit, Frame> | Point3<Unit, Frame>;
}

/** Projects a displacement onto another displacement in the same frame. */
export const projectVec3 = <
  ValueUnit extends UnitExpr,
  OntoUnit extends UnitExpr,
  Frame extends string,
>(
  value: Delta3<ValueUnit, Frame>,
  onto: Delta3<OntoUnit, NoInfer<Frame>>,
): Delta3<ValueUnit, Frame> => {
  const ontoLengthSquared = onto[0] * onto[0] + onto[1] * onto[1] +
    onto[2] * onto[2];
  if (ontoLengthSquared <= NEAR_ZERO * NEAR_ZERO) {
    throw new Error('Cannot project onto a zero-length vector');
  }

  const scalar = (value[0] * onto[0] + value[1] * onto[1] +
    value[2] * onto[2]) /
    ontoLengthSquared;

  return asDelta3<ValueUnit, Frame>(
    asQuantity<ValueUnit>(onto[0] * scalar),
    asQuantity<ValueUnit>(onto[1] * scalar),
    asQuantity<ValueUnit>(onto[2] * scalar),
  );
};

/** Reflects a displacement around a normal direction. */
export const reflectVec3 = <Unit extends UnitExpr, Frame extends string>(
  incident: Delta3<Unit, Frame>,
  normal: Dir3<NoInfer<Frame>>,
): Delta3<Unit, Frame> => {
  const dir_normalized = normalizeVec3(normal);
  const scale = 2 *
    (incident[0] * dir_normalized[0] + incident[1] * dir_normalized[1] +
      incident[2] * dir_normalized[2]);

  return asDelta3<Unit, Frame>(
    asQuantity<Unit>(incident[0] - dir_normalized[0] * scale),
    asQuantity<Unit>(incident[1] - dir_normalized[1] * scale),
    asQuantity<Unit>(incident[2] - dir_normalized[2] * scale),
  );
};

/** Computes the angle in radians between two non-zero displacements. */
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

  const cosine = (left[0] * right[0] + left[1] * right[1] +
    left[2] * right[2]) /
    (leftLength * rightLength);

  const clamped = Math.max(-1, Math.min(1, cosine));
  return Math.acos(clamped);
};
