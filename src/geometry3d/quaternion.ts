import { type NoInfer, type Quantity, type UnitExpr } from '../units.ts';
import type {
  Delta3,
  Dir3,
  FrameTag,
  LinearMat4,
  Mat4,
  Quaternion,
} from './types.ts';
import { normalizeVec3, normalizeVec3Unsafe } from './vector3.ts';

const NEAR_ZERO = 1e-14;
const ROTATION_MATRIX_TOLERANCE = 1e-8;

type DistinctFramePair<ToFrame extends string, FromFrame extends string> =
  [ToFrame] extends [FromFrame]
    ? ([FromFrame] extends [ToFrame] ? never : unknown)
    : unknown;

const assertDistinctFrames = (toFrame: string, fromFrame: string): void => {
  if (toFrame === fromFrame) {
    throw new Error('toFrameTag and fromFrameTag must be different');
  }
};

/**
 * Casts a raw number into a branded quantity.
 *
 * @param value Raw numeric scalar.
 * @returns Branded quantity.
 */
const asQuantity = <Unit extends UnitExpr>(value: number): Quantity<Unit> =>
  value as Quantity<Unit>;

/**
 * Casts xyzw components to a branded quaternion.
 *
 * @param x Quaternion x component.
 * @param y Quaternion y component.
 * @param z Quaternion z component.
 * @param w Quaternion w component.
 * @returns Branded quaternion.
 */
const asQuaternion = <ToFrame extends string, FromFrame extends string>(
  x: number,
  y: number,
  z: number,
  w: number,
): Quaternion<ToFrame, FromFrame> => {
  const value = [x, y, z, w] as [number, number, number, number];
  Object.defineProperties(value, {
    x: {
      get: () => value[0],
    },
    y: {
      get: () => value[1],
    },
    z: {
      get: () => value[2],
    },
    w: {
      get: () => value[3],
    },
  });
  return value as unknown as Quaternion<ToFrame, FromFrame>;
};

/** Axis composition order for Euler rotations. */
export type EulerOrder = 'XYZ' | 'XZY' | 'YXZ' | 'YZX' | 'ZXY' | 'ZYX';

/**
 * Constructs a frame-aware quaternion.
 *
 * `toFrameTag` and `fromFrameTag` are required to enforce explicit frame declaration.
 *
 * @param toFrameTag Destination frame token.
 * @param fromFrameTag Source frame token.
 * @param x Quaternion x component.
 * @param y Quaternion y component.
 * @param z Quaternion z component.
 * @param w Quaternion w component.
 * @returns Quaternion in `<ToFrame, FromFrame>` order.
 */
export const quat = <ToFrame extends string, FromFrame extends string>(
  toFrameTag: FrameTag<ToFrame>,
  fromFrameTag: FrameTag<FromFrame> & DistinctFramePair<ToFrame, FromFrame>,
  x: number,
  y: number,
  z: number,
  w: number,
): Quaternion<ToFrame, FromFrame> => {
  assertDistinctFrames(toFrameTag, fromFrameTag);
  void toFrameTag;
  void fromFrameTag;
  return asQuaternion<ToFrame, FromFrame>(x, y, z, w);
};

/** Returns the x component of a quaternion. */
export const quatX = <ToFrame extends string, FromFrame extends string>(
  value: Quaternion<ToFrame, FromFrame>,
): number => value[0];

/** Returns the y component of a quaternion. */
export const quatY = <ToFrame extends string, FromFrame extends string>(
  value: Quaternion<ToFrame, FromFrame>,
): number => value[1];

/** Returns the z component of a quaternion. */
export const quatZ = <ToFrame extends string, FromFrame extends string>(
  value: Quaternion<ToFrame, FromFrame>,
): number => value[2];

/** Returns the w component of a quaternion. */
export const quatW = <ToFrame extends string, FromFrame extends string>(
  value: Quaternion<ToFrame, FromFrame>,
): number => value[3];

/**
 * Returns identity quaternion for a frame.
 *
 * @param frameTag Frame token.
 * @returns Identity rotation for the frame.
 */
export const quatIdentity = <Frame extends string>(
  frameTag: FrameTag<Frame>,
): Quaternion<Frame, Frame> => {
  void frameTag;
  return asQuaternion<Frame, Frame>(0, 0, 0, 1);
};

/**
 * Computes quaternion conjugate.
 *
 * @param value Input quaternion.
 * @returns Conjugated quaternion with swapped frame direction.
 */
export const quatConjugate = <ToFrame extends string, FromFrame extends string>(
  value: Quaternion<ToFrame, FromFrame>,
): Quaternion<FromFrame, ToFrame> =>
  asQuaternion<FromFrame, ToFrame>(-value[0], -value[1], -value[2], value[3]);

/**
 * Computes squared quaternion norm.
 *
 * @param value Input quaternion.
 * @returns Squared norm.
 */
export const quatNormSquared = <
  ToFrame extends string,
  FromFrame extends string,
>(
  value: Quaternion<ToFrame, FromFrame>,
): number =>
  value[0] * value[0] +
  value[1] * value[1] +
  value[2] * value[2] +
  value[3] * value[3];

/**
 * Computes quaternion norm.
 *
 * @param value Input quaternion.
 * @returns Euclidean norm.
 */
export const quatNorm = <ToFrame extends string, FromFrame extends string>(
  value: Quaternion<ToFrame, FromFrame>,
): number => Math.sqrt(quatNormSquared(value));

/**
 * Normalizes quaternion length to 1.
 *
 * Unsafe variant: performs no zero-length guard.
 * Degenerate inputs can yield `NaN`/`Infinity`.
 *
 * @param value Quaternion to normalize.
 * @returns Unit quaternion.
 */
export const quatNormalizeUnsafe = <
  ToFrame extends string,
  FromFrame extends string,
>(
  value: Quaternion<ToFrame, FromFrame>,
): Quaternion<ToFrame, FromFrame> => {
  const norm = quatNorm(value);
  return asQuaternion<ToFrame, FromFrame>(
    value[0] / norm,
    value[1] / norm,
    value[2] / norm,
    value[3] / norm,
  );
};

/**
 * Normalizes quaternion length to 1.
 *
 * Throws when quaternion norm is zero.
 *
 * @param value Quaternion to normalize.
 * @returns Unit quaternion.
 * @throws {Error} When the quaternion is near zero length.
 */
export const quatNormalize = <ToFrame extends string, FromFrame extends string>(
  value: Quaternion<ToFrame, FromFrame>,
): Quaternion<ToFrame, FromFrame> => {
  const norm = quatNorm(value);
  if (norm <= NEAR_ZERO) {
    throw new Error('Cannot normalize a zero-length quaternion');
  }

  return quatNormalizeUnsafe(value);
};

/**
 * Computes quaternion inverse.
 *
 * Unsafe variant: performs no zero-length guard.
 * Degenerate inputs can yield `NaN`/`Infinity`.
 *
 * @param value Quaternion to invert.
 * @returns Inverse quaternion in swapped frame direction.
 */
export const quatInverseUnsafe = <
  ToFrame extends string,
  FromFrame extends string,
>(
  value: Quaternion<ToFrame, FromFrame>,
): Quaternion<FromFrame, ToFrame> => {
  const normSquared = quatNormSquared(value);
  const conjugate = quatConjugate(value);
  return asQuaternion<FromFrame, ToFrame>(
    conjugate[0] / normSquared,
    conjugate[1] / normSquared,
    conjugate[2] / normSquared,
    conjugate[3] / normSquared,
  );
};

/**
 * Computes quaternion inverse.
 *
 * Throws when quaternion norm is zero.
 *
 * @param value Quaternion to invert.
 * @returns Inverse quaternion in swapped frame direction.
 * @throws {Error} When the quaternion is near zero length.
 */
export const quatInverse = <ToFrame extends string, FromFrame extends string>(
  value: Quaternion<ToFrame, FromFrame>,
): Quaternion<FromFrame, ToFrame> => {
  const normSquared = quatNormSquared(value);
  if (normSquared <= NEAR_ZERO * NEAR_ZERO) {
    throw new Error('Cannot invert a zero-length quaternion');
  }

  return quatInverseUnsafe(value);
};

/**
 * Composes two frame-compatible quaternions in chain order.
 *
 * `composeQuats(outer, inner)` returns `outer * inner`, so `inner` is applied
 * first.
 *
 * @param outer Outer rotation.
 * @param inner Inner rotation.
 * @returns Composed rotation `outer * inner`.
 */
export const composeQuats = <
  ToFrame extends string,
  ViaFrame extends string,
  FromFrame extends string,
>(
  outer: Quaternion<ToFrame, ViaFrame>,
  inner: Quaternion<NoInfer<ViaFrame>, FromFrame>,
): Quaternion<ToFrame, FromFrame> => {
  const [x1, y1, z1, w1] = inner;
  const [x2, y2, z2, w2] = outer;

  const x = w2 * x1 +
    x2 * w1 +
    y2 * z1 -
    z2 * y1;
  const y = w2 * y1 -
    x2 * z1 +
    y2 * w1 +
    z2 * x1;
  const z = w2 * z1 +
    x2 * y1 -
    y2 * x1 +
    z2 * w1;
  const w = w2 * w1 -
    x2 * x1 -
    y2 * y1 -
    z2 * z1;

  return asQuaternion<ToFrame, FromFrame>(x, y, z, w);
};

/**
 * Rotates a displacement vector from `FromFrame` into `ToFrame`.
 *
 * @param rotation Quaternion mapping `FromFrame -> ToFrame`.
 * @param value Displacement to rotate.
 * @returns Rotated displacement in `ToFrame`.
 */
export function rotateVec3ByQuatUnsafe<
  Unit extends UnitExpr,
  ToFrame extends string,
  FromFrame extends string,
>(
  rotation: Quaternion<ToFrame, FromFrame>,
  value: Delta3<Unit, NoInfer<FromFrame>>,
): Delta3<Unit, ToFrame>;

/**
 * Rotates a direction vector from `FromFrame` into `ToFrame`.
 *
 * @param rotation Quaternion mapping `FromFrame -> ToFrame`.
 * @param value Direction to rotate.
 * @returns Rotated direction in `ToFrame`.
 */
export function rotateVec3ByQuatUnsafe<
  ToFrame extends string,
  FromFrame extends string,
>(
  rotation: Quaternion<ToFrame, FromFrame>,
  value: Dir3<NoInfer<FromFrame>>,
): Dir3<ToFrame>;

export function rotateVec3ByQuatUnsafe<
  Unit extends UnitExpr,
  ToFrame extends string,
  FromFrame extends string,
>(
  rotation: Quaternion<ToFrame, FromFrame>,
  value: Delta3<Unit, NoInfer<FromFrame>> | Dir3<NoInfer<FromFrame>>,
): Delta3<Unit, ToFrame> | Dir3<ToFrame> {
  const [qx, qy, qz, qw] = quatNormalizeUnsafe(rotation);
  const [vx, vy, vz] = value;

  // Quaternion-vector rotation via optimized form:
  // t = 2 * cross(q.xyz, v), v' = v + qw * t + cross(q.xyz, t)
  const tx = 2 * (
    qy * vz -
    qz * vy
  );
  const ty = 2 * (
    qz * vx -
    qx * vz
  );
  const tz = 2 * (
    qx * vy -
    qy * vx
  );

  const rotatedX = vx +
    qw * tx +
    (qy * tz - qz * ty);
  const rotatedY = vy +
    qw * ty +
    (qz * tx - qx * tz);
  const rotatedZ = vz +
    qw * tz +
    (qx * ty - qy * tx);

  return [
    asQuantity<Unit>(rotatedX),
    asQuantity<Unit>(rotatedY),
    asQuantity<Unit>(rotatedZ),
  ] as unknown as Delta3<Unit, ToFrame> | Dir3<ToFrame>;
}

/**
 * Rotates a displacement vector from `FromFrame` into `ToFrame`.
 *
 * @param rotation Quaternion mapping `FromFrame -> ToFrame`.
 * @param value Displacement to rotate.
 * @returns Rotated displacement in `ToFrame`.
 */
export function rotateVec3ByQuat<
  Unit extends UnitExpr,
  ToFrame extends string,
  FromFrame extends string,
>(
  rotation: Quaternion<ToFrame, FromFrame>,
  value: Delta3<Unit, NoInfer<FromFrame>>,
): Delta3<Unit, ToFrame>;

/**
 * Rotates a direction vector from `FromFrame` into `ToFrame`.
 *
 * @param rotation Quaternion mapping `FromFrame -> ToFrame`.
 * @param value Direction to rotate.
 * @returns Rotated direction in `ToFrame`.
 */
export function rotateVec3ByQuat<
  ToFrame extends string,
  FromFrame extends string,
>(
  rotation: Quaternion<ToFrame, FromFrame>,
  value: Dir3<NoInfer<FromFrame>>,
): Dir3<ToFrame>;

export function rotateVec3ByQuat<
  Unit extends UnitExpr,
  ToFrame extends string,
  FromFrame extends string,
>(
  rotation: Quaternion<ToFrame, FromFrame>,
  value: Delta3<Unit, NoInfer<FromFrame>> | Dir3<NoInfer<FromFrame>>,
): Delta3<Unit, ToFrame> | Dir3<ToFrame> {
  quatNormalize(rotation);
  return rotateVec3ByQuatUnsafe(
    rotation,
    value as Delta3<Unit, NoInfer<FromFrame>>,
  );
}

const isNear = (a: number, b: number, tolerance: number): boolean =>
  Math.abs(a - b) <= tolerance;

const dot3 = (
  ax: number,
  ay: number,
  az: number,
  bx: number,
  by: number,
  bz: number,
): number => ax * bx + ay * by + az * bz;

const lengthSquared3 = (x: number, y: number, z: number): number =>
  dot3(x, y, z, x, y, z);

const det3 = (
  m00: number,
  m01: number,
  m02: number,
  m10: number,
  m11: number,
  m12: number,
  m20: number,
  m21: number,
  m22: number,
): number =>
  m00 * (m11 * m22 - m12 * m21) -
  m01 * (m10 * m22 - m12 * m20) +
  m02 * (m10 * m21 - m11 * m20);

const assertValidRotationBasis = (
  m00: number,
  m01: number,
  m02: number,
  m10: number,
  m11: number,
  m12: number,
  m20: number,
  m21: number,
  m22: number,
): void => {
  const entries = [m00, m01, m02, m10, m11, m12, m20, m21, m22];
  if (!entries.every(Number.isFinite)) {
    throw new Error('Rotation matrix contains non-finite values');
  }

  const col0LengthSquared = lengthSquared3(m00, m10, m20);
  const col1LengthSquared = lengthSquared3(m01, m11, m21);
  const col2LengthSquared = lengthSquared3(m02, m12, m22);
  const col01Dot = dot3(m00, m10, m20, m01, m11, m21);
  const col02Dot = dot3(m00, m10, m20, m02, m12, m22);
  const col12Dot = dot3(m01, m11, m21, m02, m12, m22);
  const determinant = det3(
    m00,
    m01,
    m02,
    m10,
    m11,
    m12,
    m20,
    m21,
    m22,
  );

  if (
    !isNear(col0LengthSquared, 1, ROTATION_MATRIX_TOLERANCE) ||
    !isNear(col1LengthSquared, 1, ROTATION_MATRIX_TOLERANCE) ||
    !isNear(col2LengthSquared, 1, ROTATION_MATRIX_TOLERANCE) ||
    Math.abs(col01Dot) > ROTATION_MATRIX_TOLERANCE ||
    Math.abs(col02Dot) > ROTATION_MATRIX_TOLERANCE ||
    Math.abs(col12Dot) > ROTATION_MATRIX_TOLERANCE ||
    !isNear(determinant, 1, ROTATION_MATRIX_TOLERANCE)
  ) {
    throw new Error('Input matrix is not a valid rotation matrix');
  }
};

/**
 * Builds quaternion from a matrix rotation basis.
 *
 * Accepts either a linear matrix or the linear part of an affine matrix.
 * Unsafe variant performs no orthonormality validation.
 *
 * @param toFrameTag Destination frame token.
 * @param fromFrameTag Source frame token.
 * @param matrix Rotation matrix in `<ToFrame, FromFrame>` order.
 * @returns Quaternion in `<ToFrame, FromFrame>` order.
 */
export function quatFromRotationMatrixUnsafe<
  ToFrame extends string,
  FromFrame extends string,
>(
  toFrameTag: FrameTag<ToFrame>,
  fromFrameTag: FrameTag<FromFrame>,
  matrix: LinearMat4<NoInfer<ToFrame>, NoInfer<FromFrame>>,
): Quaternion<ToFrame, FromFrame>;
/** Overload accepting an affine matrix and using its upper-left 3x3 basis. */
export function quatFromRotationMatrixUnsafe<
  ToFrame extends string,
  FromFrame extends string,
  TranslationUnit extends UnitExpr,
>(
  toFrameTag: FrameTag<ToFrame>,
  fromFrameTag: FrameTag<FromFrame>,
  matrix: Mat4<NoInfer<ToFrame>, NoInfer<FromFrame>, TranslationUnit>,
): Quaternion<ToFrame, FromFrame>;
export function quatFromRotationMatrixUnsafe<
  ToFrame extends string,
  FromFrame extends string,
  TranslationUnit extends UnitExpr,
>(
  toFrameTag: FrameTag<ToFrame>,
  fromFrameTag: FrameTag<FromFrame>,
  matrix: Mat4<NoInfer<ToFrame>, NoInfer<FromFrame>, TranslationUnit>,
): Quaternion<ToFrame, FromFrame> {
  void toFrameTag;
  void fromFrameTag;

  const m00 = matrix[0];
  const m10 = matrix[1];
  const m20 = matrix[2];
  const m01 = matrix[4];
  const m11 = matrix[5];
  const m21 = matrix[6];
  const m02 = matrix[8];
  const m12 = matrix[9];
  const m22 = matrix[10];

  const trace = m00 + m11 + m22;
  let x = 0;
  let y = 0;
  let z = 0;
  let w = 1;

  if (trace > 0) {
    const s = Math.sqrt(trace + 1) * 2;
    w = 0.25 * s;
    x = (m21 - m12) / s;
    y = (m02 - m20) / s;
    z = (m10 - m01) / s;
  } else if (m00 > m11 && m00 > m22) {
    const s = Math.sqrt(1 + m00 - m11 - m22) * 2;
    w = (m21 - m12) / s;
    x = 0.25 * s;
    y = (m01 + m10) / s;
    z = (m02 + m20) / s;
  } else if (m11 > m22) {
    const s = Math.sqrt(1 + m11 - m00 - m22) * 2;
    w = (m02 - m20) / s;
    x = (m01 + m10) / s;
    y = 0.25 * s;
    z = (m12 + m21) / s;
  } else {
    const s = Math.sqrt(1 + m22 - m00 - m11) * 2;
    w = (m10 - m01) / s;
    x = (m02 + m20) / s;
    y = (m12 + m21) / s;
    z = 0.25 * s;
  }

  return quatNormalizeUnsafe(asQuaternion<ToFrame, FromFrame>(x, y, z, w));
}

/**
 * Builds quaternion from a matrix rotation basis.
 *
 * Accepts either a linear matrix or the linear part of an affine matrix.
 * Throws when the matrix basis is not orthonormal right-handed rotation.
 *
 * @param toFrameTag Destination frame token.
 * @param fromFrameTag Source frame token.
 * @param matrix Rotation matrix in `<ToFrame, FromFrame>` order.
 * @returns Quaternion in `<ToFrame, FromFrame>` order.
 * @throws {Error} When matrix is not a valid finite rotation matrix.
 */
export function quatFromRotationMatrix<
  ToFrame extends string,
  FromFrame extends string,
>(
  toFrameTag: FrameTag<ToFrame>,
  fromFrameTag: FrameTag<FromFrame>,
  matrix: LinearMat4<NoInfer<ToFrame>, NoInfer<FromFrame>>,
): Quaternion<ToFrame, FromFrame>;
/** Overload accepting an affine matrix and validating its upper-left 3x3 basis. */
export function quatFromRotationMatrix<
  ToFrame extends string,
  FromFrame extends string,
  TranslationUnit extends UnitExpr,
>(
  toFrameTag: FrameTag<ToFrame>,
  fromFrameTag: FrameTag<FromFrame>,
  matrix: Mat4<NoInfer<ToFrame>, NoInfer<FromFrame>, TranslationUnit>,
): Quaternion<ToFrame, FromFrame>;
export function quatFromRotationMatrix<
  ToFrame extends string,
  FromFrame extends string,
  TranslationUnit extends UnitExpr,
>(
  toFrameTag: FrameTag<ToFrame>,
  fromFrameTag: FrameTag<FromFrame>,
  matrix: Mat4<NoInfer<ToFrame>, NoInfer<FromFrame>, TranslationUnit>,
): Quaternion<ToFrame, FromFrame> {
  const m00 = matrix[0];
  const m10 = matrix[1];
  const m20 = matrix[2];
  const m01 = matrix[4];
  const m11 = matrix[5];
  const m21 = matrix[6];
  const m02 = matrix[8];
  const m12 = matrix[9];
  const m22 = matrix[10];
  assertValidRotationBasis(
    m00,
    m01,
    m02,
    m10,
    m11,
    m12,
    m20,
    m21,
    m22,
  );

  return quatFromRotationMatrixUnsafe(toFrameTag, fromFrameTag, matrix);
}

/**
 * Creates a quaternion from axis-angle representation.
 *
 * Axis is normalized internally.
 * Unsafe variant: performs no zero-length guard for `axis`.
 *
 * @param frameTag Frame token.
 * @param axis Rotation axis.
 * @param angleRadians Rotation angle in radians.
 * @returns Quaternion in `<Frame, Frame>` order.
 */
export const quatFromAxisAngleUnsafe = <Frame extends string>(
  frameTag: FrameTag<Frame>,
  axis: Dir3<Frame>,
  angleRadians: number,
): Quaternion<Frame, Frame> => {
  void frameTag;
  const normalizedAxis = normalizeVec3Unsafe(axis);
  const halfAngle = angleRadians * 0.5;
  const sinHalfAngle = Math.sin(halfAngle);
  const cosHalfAngle = Math.cos(halfAngle);

  return asQuaternion<Frame, Frame>(
    normalizedAxis[0] * sinHalfAngle,
    normalizedAxis[1] * sinHalfAngle,
    normalizedAxis[2] * sinHalfAngle,
    cosHalfAngle,
  );
};

/**
 * Creates a quaternion from axis-angle representation.
 *
 * Axis is normalized internally.
 * Throws when axis has zero length.
 *
 * @param frameTag Frame token.
 * @param axis Rotation axis.
 * @param angleRadians Rotation angle in radians.
 * @returns Quaternion in `<Frame, Frame>` order.
 * @throws {Error} When `axis` is near zero length.
 */
export const quatFromAxisAngle = <Frame extends string>(
  frameTag: FrameTag<Frame>,
  axis: Dir3<Frame>,
  angleRadians: number,
): Quaternion<Frame, Frame> => {
  normalizeVec3(axis);
  return quatFromAxisAngleUnsafe(frameTag, axis, angleRadians);
};

/**
 * Builds a frame-local quaternion from Euler angles and explicit axis order.
 *
 * Rotations are composed in intrinsic order: the `order` string describes
 * which axis is applied first (leftmost) through last (rightmost). For example
 * `'ZYX'` applies Z first, then Y, then X.
 *
 * @param frameTag Frame token.
 * @param xRadians Rotation around X axis in radians.
 * @param yRadians Rotation around Y axis in radians.
 * @param zRadians Rotation around Z axis in radians.
 * @param order Euler axis composition order.
 * @returns Quaternion in `<Frame, Frame>` order.
 */
export const quatFromEulerUnsafe = <Frame extends string>(
  frameTag: FrameTag<Frame>,
  xRadians: number,
  yRadians: number,
  zRadians: number,
  order: EulerOrder = 'ZYX',
): Quaternion<Frame, Frame> => {
  const makeAxisQuat = (axis: 'X' | 'Y' | 'Z'): Quaternion<Frame, Frame> => {
    const angle = axis === 'X' ? xRadians : axis === 'Y' ? yRadians : zRadians;
    const half = angle * 0.5;
    const sinHalf = Math.sin(half);
    const cosHalf = Math.cos(half);

    if (axis === 'X') {
      return asQuaternion<Frame, Frame>(sinHalf, 0, 0, cosHalf);
    }

    if (axis === 'Y') {
      return asQuaternion<Frame, Frame>(0, sinHalf, 0, cosHalf);
    }

    return asQuaternion<Frame, Frame>(0, 0, sinHalf, cosHalf);
  };

  let quat_result = quatIdentity(frameTag);
  for (let index = 0; index < order.length; index += 1) {
    const axis = order[index] as 'X' | 'Y' | 'Z';
    quat_result = composeQuats(makeAxisQuat(axis), quat_result);
  }

  return quatNormalizeUnsafe(quat_result);
};

/**
 * Builds a frame-local quaternion from Euler angles and explicit axis order.
 *
 * Rotations are composed in intrinsic order: the `order` string describes
 * which axis is applied first (leftmost) through last (rightmost). For example
 * `'ZYX'` applies Z first, then Y, then X.
 *
 * @param frameTag Frame token.
 * @param xRadians Rotation around X axis in radians.
 * @param yRadians Rotation around Y axis in radians.
 * @param zRadians Rotation around Z axis in radians.
 * @param order Euler axis composition order.
 * @returns Normalized quaternion in `<Frame, Frame>` order.
 */
export const quatFromEuler = <Frame extends string>(
  frameTag: FrameTag<Frame>,
  xRadians: number,
  yRadians: number,
  zRadians: number,
  order: EulerOrder = 'ZYX',
): Quaternion<Frame, Frame> => {
  const quat_result = quatFromEulerUnsafe(
    frameTag,
    xRadians,
    yRadians,
    zRadians,
    order,
  );
  return quatNormalize(quat_result);
};

/**
 * Normalized linear interpolation with shortest-path hemisphere selection.
 *
 * @param start Start quaternion.
 * @param end End quaternion.
 * @param t Interpolation parameter.
 * @returns Interpolated normalized quaternion.
 */
export const quatNlerpUnsafe = <
  ToFrame extends string,
  FromFrame extends string,
>(
  start: Quaternion<ToFrame, FromFrame>,
  end: Quaternion<NoInfer<ToFrame>, NoInfer<FromFrame>>,
  t: number,
): Quaternion<ToFrame, FromFrame> => {
  let endX = end[0];
  let endY = end[1];
  let endZ = end[2];
  let endW = end[3];

  const dot = start[0] * endX +
    start[1] * endY +
    start[2] * endZ +
    start[3] * endW;
  if (dot < 0) {
    endX = -endX;
    endY = -endY;
    endZ = -endZ;
    endW = -endW;
  }

  const inverseT = 1 - t;
  return quatNormalizeUnsafe(
    asQuaternion<ToFrame, FromFrame>(
      start[0] * inverseT +
        endX * t,
      start[1] * inverseT +
        endY * t,
      start[2] * inverseT +
        endZ * t,
      start[3] * inverseT +
        endW * t,
    ),
  );
};

/**
 * Normalized linear interpolation with shortest-path hemisphere selection.
 *
 * @param start Start quaternion.
 * @param end End quaternion.
 * @param t Interpolation parameter.
 * @returns Interpolated normalized quaternion.
 */
export const quatNlerp = <ToFrame extends string, FromFrame extends string>(
  start: Quaternion<ToFrame, FromFrame>,
  end: Quaternion<NoInfer<ToFrame>, NoInfer<FromFrame>>,
  t: number,
): Quaternion<ToFrame, FromFrame> => {
  let endX = end[0];
  let endY = end[1];
  let endZ = end[2];
  let endW = end[3];

  const dot = start[0] * endX +
    start[1] * endY +
    start[2] * endZ +
    start[3] * endW;
  if (dot < 0) {
    endX = -endX;
    endY = -endY;
    endZ = -endZ;
    endW = -endW;
  }

  const inverseT = 1 - t;
  const quat_blend = asQuaternion<ToFrame, FromFrame>(
    start[0] * inverseT +
      endX * t,
    start[1] * inverseT +
      endY * t,
    start[2] * inverseT +
      endZ * t,
    start[3] * inverseT +
      endW * t,
  );
  return quatNormalize(quat_blend);
};

/**
 * Spherical interpolation with shortest-path hemisphere selection.
 *
 * @param start Start quaternion.
 * @param end End quaternion.
 * @param t Interpolation parameter.
 * @returns Interpolated normalized quaternion.
 */
export const quatSlerpUnsafe = <
  ToFrame extends string,
  FromFrame extends string,
>(
  start: Quaternion<ToFrame, FromFrame>,
  end: Quaternion<NoInfer<ToFrame>, NoInfer<FromFrame>>,
  t: number,
): Quaternion<ToFrame, FromFrame> => {
  let endX = end[0];
  let endY = end[1];
  let endZ = end[2];
  let endW = end[3];

  let cosine = start[0] * endX +
    start[1] * endY +
    start[2] * endZ +
    start[3] * endW;
  if (cosine < 0) {
    cosine = -cosine;
    endX = -endX;
    endY = -endY;
    endZ = -endZ;
    endW = -endW;
  }

  if (cosine > 0.9995) {
    return quatNlerpUnsafe(start, asQuaternion(endX, endY, endZ, endW), t);
  }

  const theta0 = Math.acos(Math.max(-1, Math.min(1, cosine)));
  const sinTheta0 = Math.sin(theta0);
  const theta = theta0 * t;
  const sinTheta = Math.sin(theta);
  const s0 = Math.sin(theta0 - theta) / sinTheta0;
  const s1 = sinTheta / sinTheta0;

  return quatNormalizeUnsafe(
    asQuaternion<ToFrame, FromFrame>(
      s0 * start[0] +
        s1 * endX,
      s0 * start[1] +
        s1 * endY,
      s0 * start[2] +
        s1 * endZ,
      s0 * start[3] +
        s1 * endW,
    ),
  );
};

/**
 * Spherical interpolation with shortest-path hemisphere selection.
 *
 * @param start Start quaternion.
 * @param end End quaternion.
 * @param t Interpolation parameter.
 * @returns Interpolated normalized quaternion.
 */
export const quatSlerp = <ToFrame extends string, FromFrame extends string>(
  start: Quaternion<ToFrame, FromFrame>,
  end: Quaternion<NoInfer<ToFrame>, NoInfer<FromFrame>>,
  t: number,
): Quaternion<ToFrame, FromFrame> => {
  let endX = end[0];
  let endY = end[1];
  let endZ = end[2];
  let endW = end[3];

  let cosine = start[0] * endX +
    start[1] * endY +
    start[2] * endZ +
    start[3] * endW;
  if (cosine < 0) {
    cosine = -cosine;
    endX = -endX;
    endY = -endY;
    endZ = -endZ;
    endW = -endW;
  }

  if (cosine > 0.9995) {
    return quatNlerp(start, asQuaternion(endX, endY, endZ, endW), t);
  }

  const theta0 = Math.acos(Math.max(-1, Math.min(1, cosine)));
  const sinTheta0 = Math.sin(theta0);
  const theta = theta0 * t;
  const sinTheta = Math.sin(theta);
  const s0 = Math.sin(theta0 - theta) / sinTheta0;
  const s1 = sinTheta / sinTheta0;
  const quat_blend = asQuaternion<ToFrame, FromFrame>(
    s0 * start[0] +
      s1 * endX,
    s0 * start[1] +
      s1 * endY,
    s0 * start[2] +
      s1 * endZ,
    s0 * start[3] +
      s1 * endW,
  );
  return quatNormalize(quat_blend);
};
