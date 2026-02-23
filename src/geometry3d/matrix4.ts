import {
  type Dimensionless,
  dimensionlessUnit,
  type NoInfer,
  type Quantity,
  type UnitExpr,
  type UnitTag,
} from '../units.ts';
import { quatNormalize, quatNormalizeUnsafe } from './quaternion.ts';
import type {
  Delta3,
  Dir3,
  FrameTag,
  LinearMat4,
  Mat4,
  Point3,
  ProjectionMat4,
  Quaternion,
} from './types.ts';

/**
 * Casts a raw number into a branded quantity.
 *
 * @param value Raw numeric scalar.
 * @returns Branded quantity.
 */
const asQuantity = <Unit extends UnitExpr>(value: number): Quantity<Unit> =>
  value as Quantity<Unit>;

/**
 * Casts 16 numeric values into a branded affine matrix.
 *
 * @param values Matrix coefficients in row-major order.
 * @returns Branded affine matrix.
 */
const asMat4 = <
  ToFrame extends string,
  FromFrame extends string,
  TranslationUnit extends UnitExpr,
>(
  values: readonly number[],
): Mat4<ToFrame, FromFrame, TranslationUnit> =>
  values as unknown as Mat4<ToFrame, FromFrame, TranslationUnit>;

/**
 * Narrows a dimensionless affine matrix to a linear matrix type.
 *
 * @param value Affine matrix with dimensionless translation slot.
 * @returns Branded linear matrix.
 */
const asLinearMat4 = <ToFrame extends string, FromFrame extends string>(
  value: Mat4<ToFrame, FromFrame, Dimensionless>,
): LinearMat4<ToFrame, FromFrame> =>
  value as unknown as LinearMat4<ToFrame, FromFrame>;

/**
 * Casts 16 numeric values into a branded projection matrix.
 *
 * @param values Matrix coefficients in row-major order.
 * @returns Branded projection matrix.
 */
const asProjectionMat4 = <
  ToFrame extends string,
  FromFrame extends string,
  DepthUnit extends UnitExpr,
>(
  values: readonly number[],
): ProjectionMat4<ToFrame, FromFrame, DepthUnit> =>
  values as unknown as ProjectionMat4<ToFrame, FromFrame, DepthUnit>;

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
 * Creates a typed 4x4 matrix from 16 row-major values.
 *
 * `toFrameTag`, `fromFrameTag`, and `translationUnitTag` enforce explicit
 * frame/unit declaration at construction.
 * Unsafe variant: slices to 16 values without length validation.
 *
 * @param toFrameTag Destination frame token.
 * @param fromFrameTag Source frame token.
 * @param translationUnitTag Translation unit token.
 * @param values Matrix coefficients in row-major order.
 * @returns Typed affine matrix.
 */
export const mat4Unsafe = <
  ToFrame extends string,
  FromFrame extends string,
  TranslationUnit extends UnitExpr,
>(
  toFrameTag: FrameTag<ToFrame>,
  fromFrameTag: FrameTag<FromFrame>,
  translationUnitTag: UnitTag<TranslationUnit>,
  values: readonly number[],
): Mat4<ToFrame, FromFrame, TranslationUnit> => {
  void toFrameTag;
  void fromFrameTag;
  void translationUnitTag;
  return asMat4<ToFrame, FromFrame, TranslationUnit>(values.slice(0, 16));
};

/**
 * Creates a typed 4x4 matrix from 16 row-major values.
 *
 * `toFrameTag`, `fromFrameTag`, and `translationUnitTag` enforce explicit
 * frame/unit declaration at construction.
 * Throws when `values.length !== 16`.
 *
 * @param toFrameTag Destination frame token.
 * @param fromFrameTag Source frame token.
 * @param translationUnitTag Translation unit token.
 * @param values Matrix coefficients in row-major order.
 * @returns Typed affine matrix.
 * @throws {Error} When `values` does not contain exactly 16 entries.
 */
export const mat4 = <
  ToFrame extends string,
  FromFrame extends string,
  TranslationUnit extends UnitExpr,
>(
  toFrameTag: FrameTag<ToFrame>,
  fromFrameTag: FrameTag<FromFrame>,
  translationUnitTag: UnitTag<TranslationUnit>,
  values: readonly number[],
): Mat4<ToFrame, FromFrame, TranslationUnit> => {
  void toFrameTag;
  void fromFrameTag;
  void translationUnitTag;

  if (values.length !== 16) {
    throw new Error(`Mat4 expects 16 values, received ${values.length}`);
  }

  return mat4Unsafe(toFrameTag, fromFrameTag, translationUnitTag, values);
};

/**
 * Creates an identity linear transform for a frame.
 *
 * @param frameTag Frame token.
 * @param dimensionlessUnitTag Dimensionless unit token.
 * @returns Identity linear transform.
 */
export const mat4Identity = <Frame extends string>(
  frameTag: FrameTag<Frame>,
  dimensionlessUnitTag: UnitTag<Dimensionless>,
): LinearMat4<Frame, Frame> => {
  void frameTag;
  return asLinearMat4(
    mat4<Frame, Frame, Dimensionless>(
      frameTag,
      frameTag,
      dimensionlessUnitTag,
      [
        1,
        0,
        0,
        0,
        0,
        1,
        0,
        0,
        0,
        0,
        1,
        0,
        0,
        0,
        0,
        1,
      ],
    ),
  );
};

/**
 * Creates a pure translation matrix in a frame.
 *
 * @param frameTag Frame token.
 * @param translation Translation displacement.
 * @returns Affine translation matrix.
 */
export const mat4FromTranslation = <
  TranslationUnit extends UnitExpr,
  Frame extends string,
>(
  frameTag: FrameTag<Frame>,
  translation: Delta3<TranslationUnit, NoInfer<Frame>>,
): Mat4<
  Frame,
  Frame,
  TranslationUnit
> => (void frameTag,
  asMat4<Frame, Frame, TranslationUnit>([
    1,
    0,
    0,
    translation[0],
    0,
    1,
    0,
    translation[1],
    0,
    0,
    1,
    translation[2],
    0,
    0,
    0,
    1,
  ]));

/**
 * Creates a non-uniform scale matrix in a frame.
 *
 * @param frameTag Frame token.
 * @param dimensionlessUnitTag Dimensionless unit token.
 * @param xScale X axis scale.
 * @param yScale Y axis scale.
 * @param zScale Z axis scale.
 * @returns Linear scale matrix.
 */
export const mat4FromScale = <Frame extends string>(
  frameTag: FrameTag<Frame>,
  dimensionlessUnitTag: UnitTag<Dimensionless>,
  xScale: number,
  yScale: number,
  zScale: number,
): LinearMat4<Frame, Frame> => {
  void frameTag;
  void dimensionlessUnitTag;
  return asLinearMat4(
    asMat4<Frame, Frame, Dimensionless>([
      xScale,
      0,
      0,
      0,
      0,
      yScale,
      0,
      0,
      0,
      0,
      zScale,
      0,
      0,
      0,
      0,
      1,
    ]),
  );
};

/**
 * Creates a rotation matrix from a quaternion.
 *
 * @param toFrameTag Destination frame token.
 * @param fromFrameTag Source frame token.
 * @param dimensionlessUnitTag Dimensionless unit token.
 * @param rotation Input quaternion.
 * @returns Linear rotation matrix.
 */
export const mat4FromQuaternionUnsafe = <
  ToFrame extends string,
  FromFrame extends string,
>(
  toFrameTag: FrameTag<ToFrame>,
  fromFrameTag: FrameTag<FromFrame>,
  dimensionlessUnitTag: UnitTag<Dimensionless>,
  rotation: Quaternion<NoInfer<ToFrame>, NoInfer<FromFrame>>,
): LinearMat4<ToFrame, FromFrame> => {
  void toFrameTag;
  void fromFrameTag;
  void dimensionlessUnitTag;

  const [x, y, z, w] = quatNormalizeUnsafe(rotation);

  const xx = x * x;
  const yy = y * y;
  const zz = z * z;
  const xy = x * y;
  const xz = x * z;
  const yz = y * z;
  const wx = w * x;
  const wy = w * y;
  const wz = w * z;

  return asLinearMat4(
    asMat4<ToFrame, FromFrame, Dimensionless>([
      1 - 2 * (yy + zz),
      2 * (xy - wz),
      2 * (xz + wy),
      0,
      2 * (xy + wz),
      1 - 2 * (xx + zz),
      2 * (yz - wx),
      0,
      2 * (xz - wy),
      2 * (yz + wx),
      1 - 2 * (xx + yy),
      0,
      0,
      0,
      0,
      1,
    ]),
  );
};

/**
 * Creates a rotation matrix from a quaternion.
 *
 * @param toFrameTag Destination frame token.
 * @param fromFrameTag Source frame token.
 * @param dimensionlessUnitTag Dimensionless unit token.
 * @param rotation Input quaternion.
 * @returns Linear rotation matrix.
 * @throws {Error} When `rotation` is near zero length.
 */
export const mat4FromQuaternion = <
  ToFrame extends string,
  FromFrame extends string,
>(
  toFrameTag: FrameTag<ToFrame>,
  fromFrameTag: FrameTag<FromFrame>,
  dimensionlessUnitTag: UnitTag<Dimensionless>,
  rotation: Quaternion<NoInfer<ToFrame>, NoInfer<FromFrame>>,
): LinearMat4<ToFrame, FromFrame> => {
  quatNormalize(rotation);
  return mat4FromQuaternionUnsafe(
    toFrameTag,
    fromFrameTag,
    dimensionlessUnitTag,
    rotation,
  );
};

/**
 * Builds rigid transform matrix from rotation and translation.
 *
 * @param toFrameTag Destination frame token.
 * @param fromFrameTag Source frame token.
 * @param rotation Rotation quaternion.
 * @param translation Translation expressed in `toFrameTag`.
 * @returns Affine rigid transform matrix.
 */
export const mat4FromRigidTransform = <
  ToFrame extends string,
  FromFrame extends string,
  TranslationUnit extends UnitExpr,
>(
  toFrameTag: FrameTag<ToFrame>,
  fromFrameTag: FrameTag<FromFrame>,
  rotation: Quaternion<NoInfer<ToFrame>, NoInfer<FromFrame>>,
  translation: Delta3<TranslationUnit, NoInfer<ToFrame>>,
): Mat4<ToFrame, FromFrame, TranslationUnit> => {
  void toFrameTag;
  void fromFrameTag;

  const rotationMatrix = mat4FromQuaternion(
    toFrameTag,
    fromFrameTag,
    dimensionlessUnit,
    rotation,
  );

  return asMat4<ToFrame, FromFrame, TranslationUnit>([
    rotationMatrix[0],
    rotationMatrix[1],
    rotationMatrix[2],
    translation[0],
    rotationMatrix[4],
    rotationMatrix[5],
    rotationMatrix[6],
    translation[1],
    rotationMatrix[8],
    rotationMatrix[9],
    rotationMatrix[10],
    translation[2],
    0,
    0,
    0,
    1,
  ]);
};

/**
 * Builds an affine transform from translation, rotation, and non-uniform scale.
 *
 * Order: scale in `FromFrame`, then rotate `FromFrame -> ToFrame`, then translate
 * in `ToFrame`.
 *
 * @param toFrameTag Destination frame token.
 * @param fromFrameTag Source frame token.
 * @param translation Translation expressed in `toFrameTag`.
 * @param rotation Rotation from `fromFrameTag` into `toFrameTag`.
 * @param scale Non-uniform scale in `fromFrameTag`.
 * @returns Affine TRS matrix.
 */
export const mat4FromTRSUnsafe = <
  ToFrame extends string,
  FromFrame extends string,
  TranslationUnit extends UnitExpr,
>(
  toFrameTag: FrameTag<ToFrame>,
  fromFrameTag: FrameTag<FromFrame>,
  translation: Delta3<TranslationUnit, NoInfer<ToFrame>>,
  rotation: Quaternion<NoInfer<ToFrame>, NoInfer<FromFrame>>,
  scale: Dir3<NoInfer<FromFrame>>,
): Mat4<ToFrame, FromFrame, TranslationUnit> => {
  void toFrameTag;
  void fromFrameTag;

  const [x, y, z, w] = quatNormalizeUnsafe(rotation);

  const xx = x * x;
  const yy = y * y;
  const zz = z * z;
  const xy = x * y;
  const xz = x * z;
  const yz = y * z;
  const wx = w * x;
  const wy = w * y;
  const wz = w * z;

  const sx = scale[0];
  const sy = scale[1];
  const sz = scale[2];

  return asMat4<ToFrame, FromFrame, TranslationUnit>([
    (1 - 2 * (yy + zz)) * sx,
    (2 * (xy - wz)) * sy,
    (2 * (xz + wy)) * sz,
    translation[0],
    (2 * (xy + wz)) * sx,
    (1 - 2 * (xx + zz)) * sy,
    (2 * (yz - wx)) * sz,
    translation[1],
    (2 * (xz - wy)) * sx,
    (2 * (yz + wx)) * sy,
    (1 - 2 * (xx + yy)) * sz,
    translation[2],
    0,
    0,
    0,
    1,
  ]);
};

/**
 * Builds an affine transform from translation, rotation, and non-uniform scale.
 *
 * Order: scale in `FromFrame`, then rotate `FromFrame -> ToFrame`, then translate
 * in `ToFrame`.
 *
 * @param toFrameTag Destination frame token.
 * @param fromFrameTag Source frame token.
 * @param translation Translation expressed in `toFrameTag`.
 * @param rotation Rotation from `fromFrameTag` into `toFrameTag`.
 * @param scale Non-uniform scale in `fromFrameTag`.
 * @returns Affine TRS matrix.
 * @throws {Error} When `rotation` is near zero length.
 */
export const mat4FromTRS = <
  ToFrame extends string,
  FromFrame extends string,
  TranslationUnit extends UnitExpr,
>(
  toFrameTag: FrameTag<ToFrame>,
  fromFrameTag: FrameTag<FromFrame>,
  translation: Delta3<TranslationUnit, NoInfer<ToFrame>>,
  rotation: Quaternion<NoInfer<ToFrame>, NoInfer<FromFrame>>,
  scale: Dir3<NoInfer<FromFrame>>,
): Mat4<ToFrame, FromFrame, TranslationUnit> => {
  quatNormalize(rotation);
  return mat4FromTRSUnsafe(
    toFrameTag,
    fromFrameTag,
    translation,
    rotation,
    scale,
  );
};

/**
 * Creates a cache for TRS matrix construction.
 *
 * Returns a closure that reuses the previous matrix instance when all inputs are
 * numerically unchanged.
 *
 * @param toFrameTag Destination frame token.
 * @param fromFrameTag Source frame token.
 * @param translationUnitTag Translation unit token.
 * @returns Memoized TRS builder.
 */
export const createTrsMat4Cache = <
  ToFrame extends string,
  FromFrame extends string,
  TranslationUnit extends UnitExpr,
>(
  toFrameTag: FrameTag<ToFrame>,
  fromFrameTag: FrameTag<FromFrame>,
  translationUnitTag: UnitTag<TranslationUnit>,
): (
  translation: Delta3<TranslationUnit, NoInfer<ToFrame>>,
  rotation: Quaternion<NoInfer<ToFrame>, NoInfer<FromFrame>>,
  scale: Dir3<NoInfer<FromFrame>>,
) => Mat4<ToFrame, FromFrame, TranslationUnit> => {
  void translationUnitTag;
  let hasCached = false;
  let cached = asMat4<ToFrame, FromFrame, TranslationUnit>([
    1,
    0,
    0,
    0,
    0,
    1,
    0,
    0,
    0,
    0,
    1,
    0,
    0,
    0,
    0,
    1,
  ]);

  let tx = 0;
  let ty = 0;
  let tz = 0;
  let qx = 0;
  let qy = 0;
  let qz = 0;
  let qw = 1;
  let sx = 1;
  let sy = 1;
  let sz = 1;

  return (
    translation: Delta3<TranslationUnit, NoInfer<ToFrame>>,
    rotation: Quaternion<NoInfer<ToFrame>, NoInfer<FromFrame>>,
    scale: Dir3<NoInfer<FromFrame>>,
  ): Mat4<ToFrame, FromFrame, TranslationUnit> => {
    const nextTx = translation[0];
    const nextTy = translation[1];
    const nextTz = translation[2];
    const nextQx = rotation[0];
    const nextQy = rotation[1];
    const nextQz = rotation[2];
    const nextQw = rotation[3];
    const nextSx = scale[0];
    const nextSy = scale[1];
    const nextSz = scale[2];

    if (
      hasCached &&
      nextTx === tx &&
      nextTy === ty &&
      nextTz === tz &&
      nextQx === qx &&
      nextQy === qy &&
      nextQz === qz &&
      nextQw === qw &&
      nextSx === sx &&
      nextSy === sy &&
      nextSz === sz
    ) {
      return cached;
    }

    cached = mat4FromTRS(
      toFrameTag,
      fromFrameTag,
      translation,
      rotation,
      scale,
    );
    hasCached = true;
    tx = nextTx;
    ty = nextTy;
    tz = nextTz;
    qx = nextQx;
    qy = nextQy;
    qz = nextQz;
    qw = nextQw;
    sx = nextSx;
    sy = nextSy;
    sz = nextSz;

    return cached;
  };
};

/**
 * Builds a right-handed perspective projection matrix.
 *
 * Returns a matrix intended for `projectPoint3` (includes perspective divide).
 *
 * @param toFrameTag Destination frame token.
 * @param fromFrameTag Source frame token.
 * @param fieldOfViewYRadians Vertical field of view in radians.
 * @param aspect Width/height aspect ratio.
 * @param near Near clipping plane distance.
 * @param far Far clipping plane distance.
 * @returns Projection matrix.
 */
export const mat4PerspectiveUnsafe = <
  ToFrame extends string,
  FromFrame extends string,
  DepthUnit extends UnitExpr,
>(
  toFrameTag: FrameTag<ToFrame>,
  fromFrameTag: FrameTag<FromFrame>,
  fieldOfViewYRadians: number,
  aspect: number,
  near: Quantity<DepthUnit>,
  far: Quantity<NoInfer<DepthUnit>>,
): ProjectionMat4<ToFrame, FromFrame, DepthUnit> => {
  void toFrameTag;
  void fromFrameTag;

  const f = 1 / Math.tan(fieldOfViewYRadians * 0.5);
  const rangeInverse = 1 / (near - far);

  return asProjectionMat4<ToFrame, FromFrame, DepthUnit>([
    f / aspect,
    0,
    0,
    0,
    0,
    f,
    0,
    0,
    0,
    0,
    (far + near) * rangeInverse,
    (2 * far * near) * rangeInverse,
    0,
    0,
    -1,
    0,
  ]);
};

/**
 * Builds a right-handed perspective projection matrix.
 *
 * Returns a matrix intended for `projectPoint3` (includes perspective divide).
 *
 * @param toFrameTag Destination frame token.
 * @param fromFrameTag Source frame token.
 * @param fieldOfViewYRadians Vertical field of view in radians.
 * @param aspect Width/height aspect ratio.
 * @param near Near clipping plane distance.
 * @param far Far clipping plane distance.
 * @returns Projection matrix.
 * @throws {Error} When FOV/aspect/near/far inputs are invalid.
 */
export const mat4Perspective = <
  ToFrame extends string,
  FromFrame extends string,
  DepthUnit extends UnitExpr,
>(
  toFrameTag: FrameTag<ToFrame>,
  fromFrameTag: FrameTag<FromFrame>,
  fieldOfViewYRadians: number,
  aspect: number,
  near: Quantity<DepthUnit>,
  far: Quantity<NoInfer<DepthUnit>>,
): ProjectionMat4<ToFrame, FromFrame, DepthUnit> => {
  void toFrameTag;
  void fromFrameTag;

  if (!(fieldOfViewYRadians > 0 && fieldOfViewYRadians < Math.PI)) {
    throw new Error('fieldOfViewYRadians must be in (0, PI)');
  }
  if (!(aspect > 0)) {
    throw new Error('aspect must be > 0');
  }
  if (!(near > 0 && far > 0 && near < far)) {
    throw new Error('near and far must satisfy 0 < near < far');
  }

  return mat4PerspectiveUnsafe(
    toFrameTag,
    fromFrameTag,
    fieldOfViewYRadians,
    aspect,
    near,
    far,
  );
};

/**
 * Projects a point with a perspective matrix and performs perspective divide.
 *
 * Unsafe variant: performs no `w === 0` guard.
 * Degenerate inputs can yield `NaN`/`Infinity`.
 *
 * @param projection Projection matrix.
 * @param point Input point in projection source frame.
 * @returns Point in normalized device coordinates.
 */
export const projectPoint3Unsafe = <
  ToFrame extends string,
  FromFrame extends string,
  DepthUnit extends UnitExpr,
>(
  projection: ProjectionMat4<ToFrame, FromFrame, DepthUnit>,
  point: Point3<NoInfer<DepthUnit>, NoInfer<FromFrame>>,
): Point3<Dimensionless, ToFrame> => {
  const x = point[0];
  const y = point[1];
  const z = point[2];

  const clipX =
    projection[0] * x
    + projection[1] * y
    + projection[2] * z
    + projection[3];
  const clipY =
    projection[4] * x
    + projection[5] * y
    + projection[6] * z
    + projection[7];
  const clipZ =
    projection[8] * x
    + projection[9] * y
    + projection[10] * z
    + projection[11];
  const clipW =
    projection[12] * x
    + projection[13] * y
    + projection[14] * z
    + projection[15];

  const invW = 1 / clipW;
  return asPoint3<Dimensionless, ToFrame>(
    asQuantity<Dimensionless>(clipX * invW),
    asQuantity<Dimensionless>(clipY * invW),
    asQuantity<Dimensionless>(clipZ * invW),
  );
};

/**
 * Projects a point with a perspective matrix and performs perspective divide.
 *
 * Throws when homogeneous `w` is zero.
 *
 * @param projection Projection matrix.
 * @param point Input point in projection source frame.
 * @returns Point in normalized device coordinates.
 * @throws {Error} When homogeneous `w` equals zero.
 */
export const projectPoint3 = <
  ToFrame extends string,
  FromFrame extends string,
  DepthUnit extends UnitExpr,
>(
  projection: ProjectionMat4<ToFrame, FromFrame, DepthUnit>,
  point: Point3<NoInfer<DepthUnit>, NoInfer<FromFrame>>,
): Point3<Dimensionless, ToFrame> => {
  const clipW =
    projection[12] * point[0]
    + projection[13] * point[1]
    + projection[14] * point[2]
    + projection[15];

  if (clipW === 0) {
    throw new Error('Perspective divide is undefined for w = 0');
  }

  return projectPoint3Unsafe(projection, point);
};

/**
 * Builds a world-to-view pose matrix from eye, target, and up direction.
 *
 * Unsafe variant: performs no degeneracy checks on eye/target/up.
 *
 * @param toFrameTag Destination frame token.
 * @param fromFrameTag Source frame token.
 * @param point_eye_from Camera eye position.
 * @param point_target_from Camera target position.
 * @param dir_up_from Up direction.
 * @returns View matrix.
 */
export const mat4LookAtUnsafe = <
  ToFrame extends string,
  FromFrame extends string,
  TranslationUnit extends UnitExpr,
>(
  toFrameTag: FrameTag<ToFrame>,
  fromFrameTag: FrameTag<FromFrame>,
  point_eye_from: Point3<TranslationUnit, NoInfer<FromFrame>>,
  point_target_from: Point3<TranslationUnit, NoInfer<FromFrame>>,
  dir_up_from: Dir3<NoInfer<FromFrame>>,
): Mat4<ToFrame, FromFrame, TranslationUnit> => {
  void toFrameTag;
  void fromFrameTag;

  const forwardX = point_target_from[0] - point_eye_from[0];
  const forwardY = point_target_from[1] - point_eye_from[1];
  const forwardZ = point_target_from[2] - point_eye_from[2];
  const forwardLength = Math.hypot(forwardX, forwardY, forwardZ);
  const dir_forward_x = forwardX / forwardLength;
  const dir_forward_y = forwardY / forwardLength;
  const dir_forward_z = forwardZ / forwardLength;

  const upLength = Math.hypot(dir_up_from[0], dir_up_from[1], dir_up_from[2]);
  const upX = dir_up_from[0] / upLength;
  const upY = dir_up_from[1] / upLength;
  const upZ = dir_up_from[2] / upLength;

  const rightX = dir_forward_y * upZ - dir_forward_z * upY;
  const rightY = dir_forward_z * upX - dir_forward_x * upZ;
  const rightZ = dir_forward_x * upY - dir_forward_y * upX;
  const rightLength = Math.hypot(rightX, rightY, rightZ);

  const dir_right_x = rightX / rightLength;
  const dir_right_y = rightY / rightLength;
  const dir_right_z = rightZ / rightLength;

  const dir_up_orthogonal_x = dir_right_y * dir_forward_z -
    dir_right_z * dir_forward_y;
  const dir_up_orthogonal_y = dir_right_z * dir_forward_x -
    dir_right_x * dir_forward_z;
  const dir_up_orthogonal_z = dir_right_x * dir_forward_y -
    dir_right_y * dir_forward_x;

  const tx = -(dir_right_x * point_eye_from[0] +
    dir_right_y * point_eye_from[1] +
    dir_right_z * point_eye_from[2]);
  const ty = -(dir_up_orthogonal_x * point_eye_from[0] +
    dir_up_orthogonal_y * point_eye_from[1] +
    dir_up_orthogonal_z * point_eye_from[2]);
  const tz = dir_forward_x * point_eye_from[0] +
    dir_forward_y * point_eye_from[1] +
    dir_forward_z * point_eye_from[2];

  return asMat4<ToFrame, FromFrame, TranslationUnit>([
    dir_right_x,
    dir_right_y,
    dir_right_z,
    asQuantity<TranslationUnit>(tx),
    dir_up_orthogonal_x,
    dir_up_orthogonal_y,
    dir_up_orthogonal_z,
    asQuantity<TranslationUnit>(ty),
    -dir_forward_x,
    -dir_forward_y,
    -dir_forward_z,
    asQuantity<TranslationUnit>(tz),
    0,
    0,
    0,
    1,
  ]);
};

/**
 * Builds a world-to-view pose matrix from eye, target, and up direction.
 *
 * `upDirection` must be dimensionless and non-zero.
 *
 * @param toFrameTag Destination frame token.
 * @param fromFrameTag Source frame token.
 * @param point_eye_from Camera eye position.
 * @param point_target_from Camera target position.
 * @param dir_up_from Up direction.
 * @returns View matrix.
 * @throws {Error} When eye/target/up vectors form a degenerate basis.
 */
export const mat4LookAt = <
  ToFrame extends string,
  FromFrame extends string,
  TranslationUnit extends UnitExpr,
>(
  toFrameTag: FrameTag<ToFrame>,
  fromFrameTag: FrameTag<FromFrame>,
  point_eye_from: Point3<TranslationUnit, NoInfer<FromFrame>>,
  point_target_from: Point3<TranslationUnit, NoInfer<FromFrame>>,
  dir_up_from: Dir3<NoInfer<FromFrame>>,
): Mat4<ToFrame, FromFrame, TranslationUnit> => {
  void toFrameTag;
  void fromFrameTag;

  const forwardX = point_target_from[0] - point_eye_from[0];
  const forwardY = point_target_from[1] - point_eye_from[1];
  const forwardZ = point_target_from[2] - point_eye_from[2];
  const forwardLength = Math.hypot(forwardX, forwardY, forwardZ);
  if (forwardLength === 0) {
    throw new Error('LookAt requires eye and target to be distinct');
  }

  const dir_forward_x = forwardX / forwardLength;
  const dir_forward_y = forwardY / forwardLength;
  const dir_forward_z = forwardZ / forwardLength;

  const upLength = Math.hypot(dir_up_from[0], dir_up_from[1], dir_up_from[2]);
  if (upLength === 0) {
    throw new Error('LookAt requires a non-zero up direction');
  }
  const upX = dir_up_from[0] / upLength;
  const upY = dir_up_from[1] / upLength;
  const upZ = dir_up_from[2] / upLength;

  const rightX = dir_forward_y * upZ - dir_forward_z * upY;
  const rightY = dir_forward_z * upX - dir_forward_x * upZ;
  const rightZ = dir_forward_x * upY - dir_forward_y * upX;
  const rightLength = Math.hypot(rightX, rightY, rightZ);
  if (rightLength === 0) {
    throw new Error('LookAt up direction cannot be parallel to forward');
  }

  return mat4LookAtUnsafe(
    toFrameTag,
    fromFrameTag,
    point_eye_from,
    point_target_from,
    dir_up_from,
  );
};

/**
 * Transposes any matrix while swapping frame direction.
 *
 * @param value Input affine matrix.
 * @returns Transposed matrix with swapped frame direction.
 */
export function transposeMat4<
  ToFrame extends string,
  FromFrame extends string,
  TranslationUnit extends UnitExpr,
>(
  value: Mat4<ToFrame, FromFrame, TranslationUnit>,
): Mat4<FromFrame, ToFrame, TranslationUnit>;

/**
 * Transposes a linear matrix while keeping linear typing.
 *
 * @param value Input linear matrix.
 * @returns Transposed linear matrix with swapped frame direction.
 */
export function transposeMat4<ToFrame extends string, FromFrame extends string>(
  value: LinearMat4<ToFrame, FromFrame>,
): LinearMat4<FromFrame, ToFrame>;

export function transposeMat4<
  ToFrame extends string,
  FromFrame extends string,
  TranslationUnit extends UnitExpr,
>(
  value: Mat4<ToFrame, FromFrame, TranslationUnit>,
): Mat4<FromFrame, ToFrame, TranslationUnit> {
  return asMat4<FromFrame, ToFrame, TranslationUnit>([
    value[0],
    value[4],
    value[8],
    value[12],
    value[1],
    value[5],
    value[9],
    value[13],
    value[2],
    value[6],
    value[10],
    value[14],
    value[3],
    value[7],
    value[11],
    value[15],
  ]);
}

/**
 * Multiplies two raw 4x4 matrices in row-major order.
 *
 * @param left Left matrix values.
 * @param right Right matrix values.
 * @returns Product matrix values.
 */
const multiplyRaw = (
  left: readonly number[],
  right: readonly number[],
): number[] => {
  const output = new Array<number>(16);

  for (let row = 0; row < 4; row += 1) {
    const rowOffset = row * 4;
    for (let column = 0; column < 4; column += 1) {
      output[rowOffset + column] = left[rowOffset]! * right[column]! +
        left[rowOffset + 1]! * right[column + 4]! +
        left[rowOffset + 2]! * right[column + 8]! +
        left[rowOffset + 3]! * right[column + 12]!;
    }
  }

  return output;
};

/**
 * Composes two linear transforms in chain order.
 *
 * `composeMat4(outer, inner)` returns `outer * inner`, so `inner` is applied
 * first.
 *
 * @param outer Outer transform.
 * @param inner Inner transform.
 * @returns Composed transform.
 */
export function composeMat4<
  ToFrame extends string,
  ViaFrame extends string,
  FromFrame extends string,
>(
  outer: LinearMat4<ToFrame, ViaFrame>,
  inner: LinearMat4<NoInfer<ViaFrame>, FromFrame>,
): LinearMat4<ToFrame, FromFrame>;

/**
 * Composes affine outer with linear inner in chain order.
 *
 * `composeMat4(outer, inner)` returns `outer * inner`, so `inner` is applied
 * first.
 *
 * @param outer Outer transform.
 * @param inner Inner transform.
 * @returns Composed transform.
 */
export function composeMat4<
  ToFrame extends string,
  ViaFrame extends string,
  FromFrame extends string,
  TranslationUnit extends UnitExpr,
>(
  outer: Mat4<ToFrame, ViaFrame, TranslationUnit>,
  inner: LinearMat4<NoInfer<ViaFrame>, FromFrame>,
): Mat4<ToFrame, FromFrame, TranslationUnit>;

/**
 * Composes linear outer with affine inner in chain order.
 *
 * `composeMat4(outer, inner)` returns `outer * inner`, so `inner` is applied
 * first.
 *
 * @param outer Outer transform.
 * @param inner Inner transform.
 * @returns Composed transform.
 */
export function composeMat4<
  ToFrame extends string,
  ViaFrame extends string,
  FromFrame extends string,
  TranslationUnit extends UnitExpr,
>(
  outer: LinearMat4<ToFrame, ViaFrame>,
  inner: Mat4<NoInfer<ViaFrame>, FromFrame, TranslationUnit>,
): Mat4<ToFrame, FromFrame, TranslationUnit>;

/**
 * Composes affine transforms with matching translation units in chain order.
 *
 * `composeMat4(outer, inner)` returns `outer * inner`, so `inner` is applied
 * first.
 *
 * @param outer Outer transform.
 * @param inner Inner transform.
 * @returns Composed transform.
 */
export function composeMat4<
  ToFrame extends string,
  ViaFrame extends string,
  FromFrame extends string,
  TranslationUnit extends UnitExpr,
>(
  outer: Mat4<ToFrame, ViaFrame, TranslationUnit>,
  inner: Mat4<NoInfer<ViaFrame>, FromFrame, NoInfer<TranslationUnit>>,
): Mat4<ToFrame, FromFrame, TranslationUnit>;

/**
 * Composes affine transforms with different translation units in chain order.
 *
 * Result translation unit is widened to `UnitExpr`.
 * `composeMat4(outer, inner)` returns `outer * inner`, so `inner` is applied
 * first.
 *
 * @param outer Outer transform.
 * @param inner Inner transform.
 * @returns Composed transform with widened translation unit.
 */
export function composeMat4<
  ToFrame extends string,
  ViaFrame extends string,
  FromFrame extends string,
  LeftTranslationUnit extends UnitExpr,
  RightTranslationUnit extends UnitExpr,
>(
  outer: Mat4<ToFrame, ViaFrame, LeftTranslationUnit>,
  inner: Mat4<NoInfer<ViaFrame>, FromFrame, RightTranslationUnit>,
): Mat4<ToFrame, FromFrame, UnitExpr> {
  return asMat4<ToFrame, FromFrame, UnitExpr>(multiplyRaw(outer, inner));
}

/**
 * Checks whether two scalar values are within epsilon tolerance.
 *
 * @param actual Computed value.
 * @param expected Reference value.
 * @param epsilon Absolute tolerance.
 * @returns `true` when values are close enough.
 */
const isApproximately = (
  actual: number,
  expected: number,
  epsilon: number,
): boolean => Math.abs(actual - expected) <= epsilon;

/**
 * Validates that a matrix represents a rigid transform.
 *
 * @param value Raw matrix values.
 * @param epsilon Absolute tolerance for orthonormal checks.
 * @throws {Error} When the matrix is not rigid.
 */
const assertRigidTransform = (
  value: readonly number[],
  epsilon: number,
): void => {
  const row0x = value[0]!;
  const row0y = value[1]!;
  const row0z = value[2]!;
  const row1x = value[4]!;
  const row1y = value[5]!;
  const row1z = value[6]!;
  const row2x = value[8]!;
  const row2y = value[9]!;
  const row2z = value[10]!;

  const norm0 = row0x * row0x + row0y * row0y + row0z * row0z;
  const norm1 = row1x * row1x + row1y * row1y + row1z * row1z;
  const norm2 = row2x * row2x + row2y * row2y + row2z * row2z;

  const dot01 = row0x * row1x + row0y * row1y + row0z * row1z;
  const dot02 = row0x * row2x + row0y * row2y + row0z * row2z;
  const dot12 = row1x * row2x + row1y * row2y + row1z * row2z;
  const hasFiniteNorms =
    Number.isFinite(norm0)
    && Number.isFinite(norm1)
    && Number.isFinite(norm2);
  const hasUnitLengthRows =
    isApproximately(norm0, 1, epsilon)
    && isApproximately(norm1, 1, epsilon)
    && isApproximately(norm2, 1, epsilon);
  const hasOrthogonalRows =
    isApproximately(dot01, 0, epsilon)
    && isApproximately(dot02, 0, epsilon)
    && isApproximately(dot12, 0, epsilon);
  const hasAffineBottomRow =
    isApproximately(value[12]!, 0, epsilon)
    && isApproximately(value[13]!, 0, epsilon)
    && isApproximately(value[14]!, 0, epsilon)
    && isApproximately(value[15]!, 1, epsilon);
  const isRigid =
    hasFiniteNorms
    && hasUnitLengthRows
    && hasOrthogonalRows
    && hasAffineBottomRow;

  if (!isRigid) {
    throw new Error('Matrix is not a rigid transform');
  }
};

/**
 * Inverts a linear rigid matrix while preserving linear typing.
 *
 * @param value Input linear matrix.
 * @returns Inverse matrix with swapped frame direction.
 */
export function invertRigidMat4Unsafe<
  ToFrame extends string,
  FromFrame extends string,
>(
  value: LinearMat4<ToFrame, FromFrame>,
): LinearMat4<FromFrame, ToFrame>;

/**
 * Inverts a rigid affine matrix without validation.
 *
 * @param value Input affine matrix.
 * @returns Inverse matrix with swapped frame direction.
 */
export function invertRigidMat4Unsafe<
  ToFrame extends string,
  FromFrame extends string,
  TranslationUnit extends UnitExpr,
>(
  value: Mat4<ToFrame, FromFrame, TranslationUnit>,
): Mat4<FromFrame, ToFrame, TranslationUnit>;

export function invertRigidMat4Unsafe<
  ToFrame extends string,
  FromFrame extends string,
  TranslationUnit extends UnitExpr,
>(
  value: Mat4<ToFrame, FromFrame, TranslationUnit>,
): Mat4<FromFrame, ToFrame, TranslationUnit> {
  const r00 = value[0];
  const r01 = value[1];
  const r02 = value[2];
  const r10 = value[4];
  const r11 = value[5];
  const r12 = value[6];
  const r20 = value[8];
  const r21 = value[9];
  const r22 = value[10];

  const tx = value[3];
  const ty = value[7];
  const tz = value[11];

  const inverseTx = -(r00 * tx + r10 * ty + r20 * tz);
  const inverseTy = -(r01 * tx + r11 * ty + r21 * tz);
  const inverseTz = -(r02 * tx + r12 * ty + r22 * tz);

  return asMat4<FromFrame, ToFrame, TranslationUnit>([
    r00,
    r10,
    r20,
    inverseTx,
    r01,
    r11,
    r21,
    inverseTy,
    r02,
    r12,
    r22,
    inverseTz,
    0,
    0,
    0,
    1,
  ]);
}

/**
 * Inverts a linear rigid matrix while preserving linear typing.
 *
 * @param value Input linear matrix.
 * @returns Inverse matrix with swapped frame direction.
 */
export function invertRigidMat4<
  ToFrame extends string,
  FromFrame extends string,
>(
  value: LinearMat4<ToFrame, FromFrame>,
): LinearMat4<FromFrame, ToFrame>;

/**
 * Inverts a rigid affine matrix.
 *
 * Throws when matrix fails rigid transform validation.
 *
 * @param value Input affine matrix.
 * @returns Inverse matrix with swapped frame direction.
 * @throws {Error} When `value` is not a rigid transform.
 */
export function invertRigidMat4<
  ToFrame extends string,
  FromFrame extends string,
  TranslationUnit extends UnitExpr,
>(
  value: Mat4<ToFrame, FromFrame, TranslationUnit>,
): Mat4<FromFrame, ToFrame, TranslationUnit>;

export function invertRigidMat4<
  ToFrame extends string,
  FromFrame extends string,
  TranslationUnit extends UnitExpr,
>(
  value: Mat4<ToFrame, FromFrame, TranslationUnit>,
): Mat4<FromFrame, ToFrame, TranslationUnit> {
  assertRigidTransform(value, 1e-10);
  return invertRigidMat4Unsafe(value);
}

/**
 * Builds a normal matrix (inverse-transpose of upper-left 3x3 linear part).
 *
 * Unsafe variant: performs no singularity guard.
 * Degenerate inputs can yield `NaN`/`Infinity`.
 *
 * @param value Input affine transform.
 * @returns Normal matrix as a linear transform.
 */
export const normalMatrixFromMat4Unsafe = <
  ToFrame extends string,
  FromFrame extends string,
  TranslationUnit extends UnitExpr,
>(
  value: Mat4<ToFrame, FromFrame, TranslationUnit>,
): LinearMat4<ToFrame, FromFrame> => {
  const a = value[0];
  const b = value[1];
  const c = value[2];
  const d = value[4];
  const e = value[5];
  const f = value[6];
  const g = value[8];
  const h = value[9];
  const i = value[10];

  const co00 = e * i - f * h;
  const co01 = c * h - b * i;
  const co02 = b * f - c * e;
  const co10 = f * g - d * i;
  const co11 = a * i - c * g;
  const co12 = c * d - a * f;
  const co20 = d * h - e * g;
  const co21 = b * g - a * h;
  const co22 = a * e - b * d;
  const determinant = a * co00 + b * co10 + c * co20;
  const inverseDeterminant = 1 / determinant;

  return asLinearMat4(
    asMat4<ToFrame, FromFrame, Dimensionless>([
      co00 * inverseDeterminant,
      co10 * inverseDeterminant,
      co20 * inverseDeterminant,
      0,
      co01 * inverseDeterminant,
      co11 * inverseDeterminant,
      co21 * inverseDeterminant,
      0,
      co02 * inverseDeterminant,
      co12 * inverseDeterminant,
      co22 * inverseDeterminant,
      0,
      0,
      0,
      0,
      1,
    ]),
  );
};

/**
 * Builds a normal matrix (inverse-transpose of upper-left 3x3 linear part).
 *
 * Throws when the linear part is singular.
 *
 * @param value Input affine transform.
 * @returns Normal matrix as a linear transform.
 * @throws {Error} When the upper-left 3x3 block is singular.
 */
export const normalMatrixFromMat4 = <
  ToFrame extends string,
  FromFrame extends string,
  TranslationUnit extends UnitExpr,
>(
  value: Mat4<ToFrame, FromFrame, TranslationUnit>,
): LinearMat4<ToFrame, FromFrame> => {
  const a = value[0];
  const b = value[1];
  const c = value[2];
  const d = value[4];
  const e = value[5];
  const f = value[6];
  const g = value[8];
  const h = value[9];
  const i = value[10];

  const co00 = e * i - f * h;
  const co10 = f * g - d * i;
  const co20 = d * h - e * g;

  const determinant = a * co00 + b * co10 + c * co20;
  if (determinant === 0) {
    throw new Error('Cannot build a normal matrix from a singular transform');
  }

  return normalMatrixFromMat4Unsafe(value);
};

/**
 * Transforms a point with affine matrix and matching translation unit.
 *
 * Includes translation.
 *
 * @param matrix Affine transform.
 * @param point Input point.
 * @returns Transformed point.
 */
export function transformPoint3<
  TranslationUnit extends UnitExpr,
  ToFrame extends string,
  FromFrame extends string,
>(
  matrix: Mat4<ToFrame, FromFrame, TranslationUnit>,
  point: Point3<NoInfer<TranslationUnit>, NoInfer<FromFrame>>,
): Point3<TranslationUnit, ToFrame>;

/**
 * Transforms a point with linear matrix.
 *
 * Unit can be any expression because translation is absent.
 *
 * @param matrix Linear transform.
 * @param point Input point.
 * @returns Transformed point.
 */
export function transformPoint3<
  Unit extends UnitExpr,
  ToFrame extends string,
  FromFrame extends string,
>(
  matrix: LinearMat4<ToFrame, FromFrame>,
  point: Point3<Unit, NoInfer<FromFrame>>,
): Point3<Unit, ToFrame>;

export function transformPoint3<
  Unit extends UnitExpr,
  MatrixTranslationUnit extends UnitExpr,
  ToFrame extends string,
  FromFrame extends string,
>(
  matrix: Mat4<ToFrame, FromFrame, MatrixTranslationUnit>,
  point: Point3<Unit, NoInfer<FromFrame>>,
): Point3<Unit, ToFrame> {
  const x = point[0];
  const y = point[1];
  const z = point[2];
  const transformedX =
    matrix[0] * x
    + matrix[1] * y
    + matrix[2] * z
    + matrix[3];
  const transformedY =
    matrix[4] * x
    + matrix[5] * y
    + matrix[6] * z
    + matrix[7];
  const transformedZ =
    matrix[8] * x
    + matrix[9] * y
    + matrix[10] * z
    + matrix[11];

  return asPoint3<Unit, ToFrame>(
    asQuantity<Unit>(transformedX),
    asQuantity<Unit>(transformedY),
    asQuantity<Unit>(transformedZ),
  );
}

/**
 * Transforms a direction vector using only matrix linear part.
 *
 * Ignores translation component.
 *
 * @param matrix Transform matrix.
 * @param direction Input displacement direction.
 * @returns Transformed displacement direction.
 */
export function transformDirection3<
  Unit extends UnitExpr,
  MatrixTranslationUnit extends UnitExpr,
  ToFrame extends string,
  FromFrame extends string,
>(
  matrix: Mat4<ToFrame, FromFrame, MatrixTranslationUnit>,
  direction: Delta3<Unit, NoInfer<FromFrame>>,
): Delta3<Unit, ToFrame>;

/**
 * Transforms a unitless direction while preserving direction typing.
 *
 * @param matrix Transform matrix.
 * @param direction Input unitless direction.
 * @returns Transformed unitless direction.
 */
export function transformDirection3<
  MatrixTranslationUnit extends UnitExpr,
  ToFrame extends string,
  FromFrame extends string,
>(
  matrix: Mat4<ToFrame, FromFrame, MatrixTranslationUnit>,
  direction: Dir3<NoInfer<FromFrame>>,
): Dir3<ToFrame>;

export function transformDirection3<
  Unit extends UnitExpr,
  MatrixTranslationUnit extends UnitExpr,
  ToFrame extends string,
  FromFrame extends string,
>(
  matrix: Mat4<ToFrame, FromFrame, MatrixTranslationUnit>,
  direction: Delta3<Unit, NoInfer<FromFrame>> | Dir3<NoInfer<FromFrame>>,
): Delta3<Unit, ToFrame> | Dir3<ToFrame> {
  const x = direction[0];
  const y = direction[1];
  const z = direction[2];
  const transformedX =
    matrix[0] * x
    + matrix[1] * y
    + matrix[2] * z;
  const transformedY =
    matrix[4] * x
    + matrix[5] * y
    + matrix[6] * z;
  const transformedZ =
    matrix[8] * x
    + matrix[9] * y
    + matrix[10] * z;

  return asDelta3<Unit, ToFrame>(
    asQuantity<Unit>(transformedX),
    asQuantity<Unit>(transformedY),
    asQuantity<Unit>(transformedZ),
  ) as Delta3<Unit, ToFrame> | Dir3<ToFrame>;
}
