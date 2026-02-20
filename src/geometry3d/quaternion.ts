import { type NoInfer, type Quantity, type UnitExpr } from '../units.ts';
import type { Delta3, Dir3, FrameTag, Quaternion } from './types.ts';
import { normalizeVec3 } from './vector3.ts';

const NEAR_ZERO = 1e-14;

const asQuantity = <Unit extends UnitExpr>(value: number): Quantity<Unit> =>
  value as Quantity<Unit>;

const asQuaternion = <ToFrame extends string, FromFrame extends string>(
  x: number,
  y: number,
  z: number,
  w: number,
): Quaternion<ToFrame, FromFrame> =>
  [x, y, z, w] as unknown as Quaternion<ToFrame, FromFrame>;

/** Axis composition order for Euler rotations. */
export type EulerOrder = 'XYZ' | 'XZY' | 'YXZ' | 'YZX' | 'ZXY' | 'ZYX';

/**
 * Constructs a frame-aware quaternion.
 *
 * `toFrameTag` and `fromFrameTag` are required to enforce explicit frame declaration.
 */
export const quat = <ToFrame extends string, FromFrame extends string>(
  toFrameTag: FrameTag<ToFrame>,
  fromFrameTag: FrameTag<FromFrame>,
  x: number,
  y: number,
  z: number,
  w: number,
): Quaternion<ToFrame, FromFrame> => {
  void toFrameTag;
  void fromFrameTag;
  return asQuaternion<ToFrame, FromFrame>(x, y, z, w);
};

/** Returns identity quaternion for a frame. */
export const quatIdentity = <Frame extends string>(
  frameTag: FrameTag<Frame>,
): Quaternion<Frame, Frame> => {
  void frameTag;
  return asQuaternion<Frame, Frame>(0, 0, 0, 1);
};

/** Computes quaternion conjugate. */
export const quatConjugate = <ToFrame extends string, FromFrame extends string>(
  value: Quaternion<ToFrame, FromFrame>,
): Quaternion<FromFrame, ToFrame> =>
  asQuaternion<FromFrame, ToFrame>(-value[0], -value[1], -value[2], value[3]);

/** Computes squared quaternion norm. */
export const quatNormSquared = <
  ToFrame extends string,
  FromFrame extends string,
>(
  value: Quaternion<ToFrame, FromFrame>,
): number =>
  value[0] * value[0] + value[1] * value[1] + value[2] * value[2] +
  value[3] * value[3];

/** Computes quaternion norm. */
export const quatNorm = <ToFrame extends string, FromFrame extends string>(
  value: Quaternion<ToFrame, FromFrame>,
): number => Math.sqrt(quatNormSquared(value));

/**
 * Normalizes quaternion length to 1.
 *
 * Throws when quaternion norm is zero.
 */
export const quatNormalize = <ToFrame extends string, FromFrame extends string>(
  value: Quaternion<ToFrame, FromFrame>,
): Quaternion<ToFrame, FromFrame> => {
  const norm = quatNorm(value);
  if (norm <= NEAR_ZERO) {
    throw new Error('Cannot normalize a zero-length quaternion');
  }

  return asQuaternion<ToFrame, FromFrame>(
    value[0] / norm,
    value[1] / norm,
    value[2] / norm,
    value[3] / norm,
  );
};

/**
 * Computes quaternion inverse.
 *
 * Throws when quaternion norm is zero.
 */
export const quatInverse = <ToFrame extends string, FromFrame extends string>(
  value: Quaternion<ToFrame, FromFrame>,
): Quaternion<FromFrame, ToFrame> => {
  const normSquared = quatNormSquared(value);
  if (normSquared <= NEAR_ZERO * NEAR_ZERO) {
    throw new Error('Cannot invert a zero-length quaternion');
  }

  const conjugate = quatConjugate(value);
  return asQuaternion<FromFrame, ToFrame>(
    conjugate[0] / normSquared,
    conjugate[1] / normSquared,
    conjugate[2] / normSquared,
    conjugate[3] / normSquared,
  );
};

/**
 * Composes two frame-compatible quaternions.
 *
 * Order: apply `first`, then apply `second`.
 */
export const composeQuats = <
  ToFrame extends string,
  ViaFrame extends string,
  FromFrame extends string,
>(
  first: Quaternion<ViaFrame, FromFrame>,
  second: Quaternion<ToFrame, NoInfer<ViaFrame>>,
): Quaternion<ToFrame, FromFrame> => {
  const [x1, y1, z1, w1] = first;
  const [x2, y2, z2, w2] = second;

  return asQuaternion<ToFrame, FromFrame>(
    w2 * x1 + x2 * w1 + y2 * z1 - z2 * y1,
    w2 * y1 - x2 * z1 + y2 * w1 + z2 * x1,
    w2 * z1 + x2 * y1 - y2 * x1 + z2 * w1,
    w2 * w1 - x2 * x1 - y2 * y1 - z2 * z1,
  );
};

/** Rotates a vector from `FromFrame` into `ToFrame`. */
export function rotateVec3ByQuat<
  Unit extends UnitExpr,
  ToFrame extends string,
  FromFrame extends string,
>(
  rotation: Quaternion<ToFrame, FromFrame>,
  value: Delta3<Unit, NoInfer<FromFrame>>,
): Delta3<Unit, ToFrame>;

/** Rotates a direction from `FromFrame` into `ToFrame`. */
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
  const [qx, qy, qz, qw] = quatNormalize(rotation);
  const [vx, vy, vz] = value;

  const tx = 2 * (qy * vz - qz * vy);
  const ty = 2 * (qz * vx - qx * vz);
  const tz = 2 * (qx * vy - qy * vx);

  return [
    asQuantity<Unit>(vx + qw * tx + (qy * tz - qz * ty)),
    asQuantity<Unit>(vy + qw * ty + (qz * tx - qx * tz)),
    asQuantity<Unit>(vz + qw * tz + (qx * ty - qy * tx)),
  ] as unknown as Delta3<Unit, ToFrame> | Dir3<ToFrame>;
}

/**
 * Creates a quaternion from axis-angle representation.
 *
 * Axis is normalized internally.
 * Throws when axis has zero length.
 */
export const quatFromAxisAngle = <Frame extends string>(
  frameTag: FrameTag<Frame>,
  axis: Dir3<Frame>,
  angleRadians: number,
): Quaternion<Frame, Frame> => {
  void frameTag;
  const normalizedAxis = normalizeVec3(axis);
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

/** Builds a frame-local quaternion from Euler angles and explicit axis order. */
export const quatFromEuler = <Frame extends string>(
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
    quat_result = composeQuats(quat_result, makeAxisQuat(axis));
  }

  return quatNormalize(quat_result);
};

/** Normalized linear interpolation with shortest-path hemisphere selection. */
export const quatNlerp = <ToFrame extends string, FromFrame extends string>(
  start: Quaternion<ToFrame, FromFrame>,
  end: Quaternion<NoInfer<ToFrame>, NoInfer<FromFrame>>,
  t: number,
): Quaternion<ToFrame, FromFrame> => {
  let endX = end[0];
  let endY = end[1];
  let endZ = end[2];
  let endW = end[3];

  const dot = start[0] * endX + start[1] * endY + start[2] * endZ +
    start[3] * endW;
  if (dot < 0) {
    endX = -endX;
    endY = -endY;
    endZ = -endZ;
    endW = -endW;
  }

  const inverseT = 1 - t;
  return quatNormalize(
    asQuaternion<ToFrame, FromFrame>(
      start[0] * inverseT + endX * t,
      start[1] * inverseT + endY * t,
      start[2] * inverseT + endZ * t,
      start[3] * inverseT + endW * t,
    ),
  );
};

/** Spherical interpolation with shortest-path hemisphere selection. */
export const quatSlerp = <ToFrame extends string, FromFrame extends string>(
  start: Quaternion<ToFrame, FromFrame>,
  end: Quaternion<NoInfer<ToFrame>, NoInfer<FromFrame>>,
  t: number,
): Quaternion<ToFrame, FromFrame> => {
  let endX = end[0];
  let endY = end[1];
  let endZ = end[2];
  let endW = end[3];

  let cosine = start[0] * endX + start[1] * endY + start[2] * endZ +
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

  return quatNormalize(
    asQuaternion<ToFrame, FromFrame>(
      s0 * start[0] + s1 * endX,
      s0 * start[1] + s1 * endY,
      s0 * start[2] + s1 * endZ,
      s0 * start[3] + s1 * endW,
    ),
  );
};
