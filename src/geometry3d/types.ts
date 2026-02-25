import type { Dimensionless, Quantity, UnitExpr } from '../units.ts';

declare const frameTagBrand: unique symbol;
declare const vecBrand: unique symbol;
declare const pointBrand: unique symbol;
declare const dirBrand: unique symbol;
declare const deltaBrand: unique symbol;
declare const quatBrand: unique symbol;
declare const matBrand: unique symbol;
declare const linearMatBrand: unique symbol;
declare const projectionMatBrand: unique symbol;

/** Compile-time token for explicitly declaring frames. */
export type FrameTag<Frame extends string> = string & {
  readonly [frameTagBrand]: Frame;
};

/**
 * Creates a compile-time frame token.
 *
 * @param name Frame identifier text.
 * @returns Branded frame token used by frame-aware APIs.
 */
export const frame = <Frame extends string>(name: Frame): FrameTag<Frame> =>
  name as unknown as FrameTag<Frame>;

/** Shared raw 3D tuple used by point/direction/displacement variants. */
type Vec3Base<Unit extends UnitExpr, Frame extends string> =
  & readonly [
    Quantity<Unit>,
    Quantity<Unit>,
    Quantity<Unit>,
  ]
  & {
    readonly [vecBrand]: {
      readonly unit: Unit;
      readonly frame: Frame;
    };
  };

/**
 * Unitful point in an affine frame.
 *
 * Points are locations and are not directly addable with other points.
 */
export type Point3<Unit extends UnitExpr, Frame extends string> =
  & Vec3Base<Unit, Frame>
  & {
    readonly [pointBrand]: {
      readonly unit: Unit;
      readonly frame: Frame;
    };
  };

/**
 * Dimensionless direction in a frame.
 *
 * Represents orientation/axis information.  The constructor does **not**
 * enforce unit length — functions that require a true unit vector
 * (e.g. `reflectVec3`, `quatFromAxisAngle`) normalize internally.
 */
export type Dir3<Frame extends string> =
  & Delta3<Dimensionless, Frame>
  & {
    readonly [dirBrand]: {
      readonly frame: Frame;
    };
  };

/**
 * Unitful displacement (delta/translation) in a frame.
 *
 * This is the vector quantity that can be added/subtracted and used for translation.
 */
export type Delta3<Unit extends UnitExpr, Frame extends string> =
  & Vec3Base<Unit, Frame>
  & {
    readonly [deltaBrand]: {
      readonly unit: Unit;
      readonly frame: Frame;
    };
  };

/** Quaternion rotation in `<ToFrame, FromFrame>` order. */
export type Quaternion<ToFrame extends string, FromFrame extends string> =
  & readonly [
    number,
    number,
    number,
    number,
  ]
  & {
    readonly [quatBrand]: {
      readonly toFrame: ToFrame;
      readonly fromFrame: FromFrame;
    };
  };

/**
 * Affine 4x4 transform in `<ToFrame, FromFrame>` order.
 *
 * `TranslationUnit` describes the translation component unit.
 * Storage layout is column-major:
 * `[m00,m10,m20,m30, m01,m11,m21,m31, m02,m12,m22,m32, m03,m13,m23,m33]`.
 * The transform APIs multiply points/directions as column vectors on the right,
 * so `m03/m13/m23` live at indices 12/13/14.
 */
export type Mat4<
  ToFrame extends string,
  FromFrame extends string,
  TranslationUnit extends UnitExpr,
> =
  & readonly [
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
  ]
  & {
    readonly [matBrand]: {
      readonly translationUnit: TranslationUnit;
      readonly toFrame: ToFrame;
      readonly fromFrame: FromFrame;
    };
  };

/**
 * Linear-only (zero translation) matrix in `<ToFrame, FromFrame>` order.
 */
export type LinearMat4<ToFrame extends string, FromFrame extends string> =
  & Mat4<ToFrame, FromFrame, Dimensionless>
  & {
    readonly [linearMatBrand]: {
      readonly toFrame: ToFrame;
      readonly fromFrame: FromFrame;
    };
  };

/**
 * Perspective 4x4 projection matrix in `<ToFrame, FromFrame>` order.
 *
 * Uses the same column-major storage layout as `Mat4`.
 */
export type ProjectionMat4<
  ToFrame extends string,
  FromFrame extends string,
  DepthUnit extends UnitExpr,
> =
  & readonly [
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
  ]
  & {
    readonly [projectionMatBrand]: {
      readonly depthUnit: DepthUnit;
      readonly toFrame: ToFrame;
      readonly fromFrame: FromFrame;
    };
  };
