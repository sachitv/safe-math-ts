# API Reference

Complete exported API for safe-math-ts.

## Safety model

- Safe APIs use the base name (for example `normalizeVec3`, `clamp`, `mat4`).
- Unsafe APIs use the `Unsafe` suffix (for example `normalizeVec3Unsafe`,
  `clampUnsafe`, `mat4Unsafe`).
- Safe APIs validate inputs and throw on invalid/degenerate cases.
- Unsafe APIs skip validation and may return `NaN`/`Infinity` on invalid input.

## Type reference

### Units

- `UnitExpr`
- `Dimensionless`
- `NoInfer<ValueType>`
- `UnitFromString<Expr>`
- `UnitTag<Unit extends UnitExpr>`
- `Quantity<Unit extends UnitExpr>`
- `MulUnit<LeftUnit, RightUnit>`
- `DivUnit<LeftUnit, RightUnit>`
- `SqrtUnit<Unit>`

### Frames and geometry

- `FrameTag<Frame extends string>`
- `Point3<Unit, Frame>`
- `Delta3<Unit, Frame>`
- `Dir3<Frame>`
- `Quaternion<ToFrame, FromFrame>`
- `Mat4<ToFrame, FromFrame, TranslationUnit>`
- `LinearMat4<ToFrame, FromFrame>`
- `ProjectionMat4<ToFrame, FromFrame, DepthUnit>`
- `EulerOrder = 'XYZ' | 'XZY' | 'YXZ' | 'YZX' | 'ZXY' | 'ZYX'`

## Token constructors

```ts
unit<Expr extends string>(name: Expr): UnitTag<UnitFromString<Expr>>
const dimensionlessUnit: UnitTag<Dimensionless>
frame<Frame extends string>(name: Frame): FrameTag<Frame>
```

## Scalar/unit functions (`src/units.ts`)

```ts
quantity<Unit extends UnitExpr>(unitTag: UnitTag<Unit>, value: number): Quantity<Unit>
dimensionless(value: number): Quantity<Dimensionless>
valueOf<Unit extends UnitExpr>(value: Quantity<Unit>): number

add<Unit extends UnitExpr>(left: Quantity<Unit>, right: Quantity<NoInfer<Unit>>): Quantity<Unit>
sub<Unit extends UnitExpr>(left: Quantity<Unit>, right: Quantity<NoInfer<Unit>>): Quantity<Unit>
neg<Unit extends UnitExpr>(value: Quantity<Unit>): Quantity<Unit>
abs<Unit extends UnitExpr>(value: Quantity<Unit>): Quantity<Unit>
min<Unit extends UnitExpr>(left: Quantity<Unit>, right: Quantity<NoInfer<Unit>>): Quantity<Unit>
max<Unit extends UnitExpr>(left: Quantity<Unit>, right: Quantity<NoInfer<Unit>>): Quantity<Unit>

clampUnsafe<Unit extends UnitExpr>(
  value: Quantity<Unit>,
  minValue: Quantity<NoInfer<Unit>>,
  maxValue: Quantity<NoInfer<Unit>>,
): Quantity<Unit>

clamp<Unit extends UnitExpr>(
  value: Quantity<Unit>,
  minValue: Quantity<NoInfer<Unit>>,
  maxValue: Quantity<NoInfer<Unit>>,
): Quantity<Unit>

scale<Unit extends UnitExpr>(value: Quantity<Unit>, scalar: number): Quantity<Unit>
mul<LeftUnit extends UnitExpr, RightUnit extends UnitExpr>(
  left: Quantity<LeftUnit>,
  right: Quantity<RightUnit>,
): Quantity<MulUnit<LeftUnit, RightUnit>>
div<LeftUnit extends UnitExpr, RightUnit extends UnitExpr>(
  left: Quantity<LeftUnit>,
  right: Quantity<RightUnit>,
): Quantity<DivUnit<LeftUnit, RightUnit>>
sqrt<Unit extends UnitExpr>(value: Quantity<Unit>): Quantity<SqrtUnit<Unit>>

eq<Unit extends UnitExpr>(left: Quantity<Unit>, right: Quantity<NoInfer<Unit>>): boolean
approxEq<Unit extends UnitExpr>(
  left: Quantity<Unit>,
  right: Quantity<NoInfer<Unit>>,
  tolerance?: number,
): boolean
lt<Unit extends UnitExpr>(left: Quantity<Unit>, right: Quantity<NoInfer<Unit>>): boolean
lte<Unit extends UnitExpr>(left: Quantity<Unit>, right: Quantity<NoInfer<Unit>>): boolean
gt<Unit extends UnitExpr>(left: Quantity<Unit>, right: Quantity<NoInfer<Unit>>): boolean
gte<Unit extends UnitExpr>(left: Quantity<Unit>, right: Quantity<NoInfer<Unit>>): boolean

sum<Unit extends UnitExpr>(values: readonly Quantity<Unit>[]): Quantity<Unit>
average<Unit extends UnitExpr>(
  values: readonly [Quantity<Unit>, ...Quantity<Unit>[]],
): Quantity<Unit>
```

## Vector functions (`src/geometry3d/vector3.ts`)

```ts
delta3<Unit extends UnitExpr, Frame extends string>(
  frameTag: FrameTag<Frame>,
  x: Quantity<Unit>,
  y: Quantity<Unit>,
  z: Quantity<Unit>,
): Delta3<Unit, Frame>

point3<Unit extends UnitExpr, Frame extends string>(
  frameTag: FrameTag<Frame>,
  x: Quantity<Unit>,
  y: Quantity<Unit>,
  z: Quantity<Unit>,
): Point3<Unit, Frame>

dir3<Frame extends string>(
  frameTag: FrameTag<Frame>,
  x: Quantity<Dimensionless>,
  y: Quantity<Dimensionless>,
  z: Quantity<Dimensionless>,
): Dir3<Frame>

zeroVec3<Unit extends UnitExpr, Frame extends string>(
  unitTag: UnitTag<Unit>,
  frameTag: FrameTag<Frame>,
): Delta3<Unit, Frame>

addVec3<Unit extends UnitExpr, Frame extends string>(
  left: Delta3<Unit, Frame>,
  right: Delta3<NoInfer<Unit>, NoInfer<Frame>>,
): Delta3<Unit, Frame>
subVec3<Unit extends UnitExpr, Frame extends string>(
  left: Delta3<Unit, Frame>,
  right: Delta3<NoInfer<Unit>, NoInfer<Frame>>,
): Delta3<Unit, Frame>
negVec3<Unit extends UnitExpr, Frame extends string>(value: Delta3<Unit, Frame>): Delta3<Unit, Frame>
scaleVec3<Unit extends UnitExpr, Frame extends string>(value: Delta3<Unit, Frame>, scalar: number): Delta3<Unit, Frame>
scaleDir3<Unit extends UnitExpr, Frame extends string>(value: Dir3<Frame>, magnitude: Quantity<Unit>): Delta3<Unit, Frame>

addPoint3<Unit extends UnitExpr, Frame extends string>(
  point: Point3<Unit, Frame>,
  delta: Delta3<NoInfer<Unit>, NoInfer<Frame>>,
): Point3<Unit, Frame>
subPoint3Delta3<Unit extends UnitExpr, Frame extends string>(
  point: Point3<Unit, Frame>,
  delta: Delta3<NoInfer<Unit>, NoInfer<Frame>>,
): Point3<Unit, Frame>
subPoint3<Unit extends UnitExpr, Frame extends string>(
  left: Point3<Unit, Frame>,
  right: Point3<NoInfer<Unit>, NoInfer<Frame>>,
): Delta3<Unit, Frame>

dotVec3<LeftUnit extends UnitExpr, RightUnit extends UnitExpr, Frame extends string>(
  left: Delta3<LeftUnit, Frame>,
  right: Delta3<RightUnit, NoInfer<Frame>>,
): Quantity<MulUnit<LeftUnit, RightUnit>>
crossVec3<LeftUnit extends UnitExpr, RightUnit extends UnitExpr, Frame extends string>(
  left: Delta3<LeftUnit, Frame>,
  right: Delta3<RightUnit, NoInfer<Frame>>,
): Delta3<MulUnit<LeftUnit, RightUnit>, Frame>

lengthSquaredVec3<Unit extends UnitExpr, Frame extends string>(value: Delta3<Unit, Frame>): Quantity<MulUnit<Unit, Unit>>
lengthVec3<Unit extends UnitExpr, Frame extends string>(value: Delta3<Unit, Frame>): Quantity<Unit>

distanceVec3<Unit extends UnitExpr, Frame extends string>(
  left: Delta3<Unit, Frame>,
  right: Delta3<NoInfer<Unit>, NoInfer<Frame>>,
): Quantity<Unit>
distanceVec3<Unit extends UnitExpr, Frame extends string>(
  left: Point3<Unit, Frame>,
  right: Point3<NoInfer<Unit>, NoInfer<Frame>>,
): Quantity<Unit>
distancePoint3<Unit extends UnitExpr, Frame extends string>(
  left: Point3<Unit, Frame>,
  right: Point3<NoInfer<Unit>, NoInfer<Frame>>,
): Quantity<Unit>

normalizeVec3Unsafe<Unit extends UnitExpr, Frame extends string>(
  value: Delta3<Unit, Frame>,
): Dir3<Frame>
normalizeVec3<Unit extends UnitExpr, Frame extends string>(
  value: Delta3<Unit, Frame>,
): Dir3<Frame>

lerpVec3<Unit extends UnitExpr, Frame extends string>(
  start: Delta3<Unit, Frame>,
  end: Delta3<NoInfer<Unit>, NoInfer<Frame>>,
  t: number,
): Delta3<Unit, Frame>
lerpVec3<Unit extends UnitExpr, Frame extends string>(
  start: Point3<Unit, Frame>,
  end: Point3<NoInfer<Unit>, NoInfer<Frame>>,
  t: number,
): Point3<Unit, Frame>

projectVec3Unsafe<ValueUnit extends UnitExpr, OntoUnit extends UnitExpr, Frame extends string>(
  value: Delta3<ValueUnit, Frame>,
  onto: Delta3<OntoUnit, NoInfer<Frame>>,
): Delta3<ValueUnit, Frame>
projectVec3<ValueUnit extends UnitExpr, OntoUnit extends UnitExpr, Frame extends string>(
  value: Delta3<ValueUnit, Frame>,
  onto: Delta3<OntoUnit, NoInfer<Frame>>,
): Delta3<ValueUnit, Frame>

reflectVec3Unsafe<Unit extends UnitExpr, Frame extends string>(
  incident: Delta3<Unit, Frame>,
  normal: Dir3<NoInfer<Frame>>,
): Delta3<Unit, Frame>
reflectVec3<Unit extends UnitExpr, Frame extends string>(
  incident: Delta3<Unit, Frame>,
  normal: Dir3<NoInfer<Frame>>,
): Delta3<Unit, Frame>

angleBetweenVec3Unsafe<LeftUnit extends UnitExpr, RightUnit extends UnitExpr, Frame extends string>(
  left: Delta3<LeftUnit, Frame>,
  right: Delta3<RightUnit, NoInfer<Frame>>,
): number
angleBetweenVec3<LeftUnit extends UnitExpr, RightUnit extends UnitExpr, Frame extends string>(
  left: Delta3<LeftUnit, Frame>,
  right: Delta3<RightUnit, NoInfer<Frame>>,
): number
```

## Quaternion functions (`src/geometry3d/quaternion.ts`)

```ts
quat<ToFrame extends string, FromFrame extends string>(
  toFrameTag: FrameTag<ToFrame>,
  fromFrameTag: FrameTag<FromFrame>,
  x: number,
  y: number,
  z: number,
  w: number,
): Quaternion<ToFrame, FromFrame>

quatIdentity<Frame extends string>(frameTag: FrameTag<Frame>): Quaternion<Frame, Frame>
quatConjugate<ToFrame extends string, FromFrame extends string>(
  value: Quaternion<ToFrame, FromFrame>,
): Quaternion<FromFrame, ToFrame>
quatNormSquared<ToFrame extends string, FromFrame extends string>(
  value: Quaternion<ToFrame, FromFrame>,
): number
quatNorm<ToFrame extends string, FromFrame extends string>(
  value: Quaternion<ToFrame, FromFrame>,
): number

quatNormalizeUnsafe<ToFrame extends string, FromFrame extends string>(
  value: Quaternion<ToFrame, FromFrame>,
): Quaternion<ToFrame, FromFrame>
quatNormalize<ToFrame extends string, FromFrame extends string>(
  value: Quaternion<ToFrame, FromFrame>,
): Quaternion<ToFrame, FromFrame>

quatInverseUnsafe<ToFrame extends string, FromFrame extends string>(
  value: Quaternion<ToFrame, FromFrame>,
): Quaternion<FromFrame, ToFrame>
quatInverse<ToFrame extends string, FromFrame extends string>(
  value: Quaternion<ToFrame, FromFrame>,
): Quaternion<FromFrame, ToFrame>

composeQuats<ToFrame extends string, ViaFrame extends string, FromFrame extends string>(
  outer: Quaternion<ToFrame, ViaFrame>,
  inner: Quaternion<NoInfer<ViaFrame>, FromFrame>,
): Quaternion<ToFrame, FromFrame>

rotateVec3ByQuatUnsafe<Unit extends UnitExpr, ToFrame extends string, FromFrame extends string>(
  value: Delta3<Unit, NoInfer<FromFrame>>,
  rotation: Quaternion<ToFrame, FromFrame>,
): Delta3<Unit, ToFrame>
rotateVec3ByQuatUnsafe<ToFrame extends string, FromFrame extends string>(
  value: Dir3<NoInfer<FromFrame>>,
  rotation: Quaternion<ToFrame, FromFrame>,
): Dir3<ToFrame>

rotateVec3ByQuat<Unit extends UnitExpr, ToFrame extends string, FromFrame extends string>(
  value: Delta3<Unit, NoInfer<FromFrame>>,
  rotation: Quaternion<ToFrame, FromFrame>,
): Delta3<Unit, ToFrame>
rotateVec3ByQuat<ToFrame extends string, FromFrame extends string>(
  value: Dir3<NoInfer<FromFrame>>,
  rotation: Quaternion<ToFrame, FromFrame>,
): Dir3<ToFrame>

quatFromAxisAngleUnsafe<Frame extends string>(
  frameTag: FrameTag<Frame>,
  axis: Dir3<Frame>,
  angleRadians: number,
): Quaternion<Frame, Frame>
quatFromAxisAngle<Frame extends string>(
  frameTag: FrameTag<Frame>,
  axis: Dir3<Frame>,
  angleRadians: number,
): Quaternion<Frame, Frame>

quatFromEulerUnsafe<Frame extends string>(
  frameTag: FrameTag<Frame>,
  xRadians: number,
  yRadians: number,
  zRadians: number,
  order?: EulerOrder,
): Quaternion<Frame, Frame>
quatFromEuler<Frame extends string>(
  frameTag: FrameTag<Frame>,
  xRadians: number,
  yRadians: number,
  zRadians: number,
  order?: EulerOrder,
): Quaternion<Frame, Frame>

quatNlerpUnsafe<ToFrame extends string, FromFrame extends string>(
  start: Quaternion<ToFrame, FromFrame>,
  end: Quaternion<NoInfer<ToFrame>, NoInfer<FromFrame>>,
  t: number,
): Quaternion<ToFrame, FromFrame>
quatNlerp<ToFrame extends string, FromFrame extends string>(
  start: Quaternion<ToFrame, FromFrame>,
  end: Quaternion<NoInfer<ToFrame>, NoInfer<FromFrame>>,
  t: number,
): Quaternion<ToFrame, FromFrame>

quatSlerpUnsafe<ToFrame extends string, FromFrame extends string>(
  start: Quaternion<ToFrame, FromFrame>,
  end: Quaternion<NoInfer<ToFrame>, NoInfer<FromFrame>>,
  t: number,
): Quaternion<ToFrame, FromFrame>
quatSlerp<ToFrame extends string, FromFrame extends string>(
  start: Quaternion<ToFrame, FromFrame>,
  end: Quaternion<NoInfer<ToFrame>, NoInfer<FromFrame>>,
  t: number,
): Quaternion<ToFrame, FromFrame>
```

## Matrix functions (`src/geometry3d/matrix4.ts`)

```ts
mat4Unsafe<ToFrame extends string, FromFrame extends string, TranslationUnit extends UnitExpr>(
  toFrameTag: FrameTag<ToFrame>,
  fromFrameTag: FrameTag<FromFrame>,
  translationUnitTag: UnitTag<TranslationUnit>,
  values: readonly number[],
): Mat4<ToFrame, FromFrame, TranslationUnit>
mat4<ToFrame extends string, FromFrame extends string, TranslationUnit extends UnitExpr>(
  toFrameTag: FrameTag<ToFrame>,
  fromFrameTag: FrameTag<FromFrame>,
  translationUnitTag: UnitTag<TranslationUnit>,
  values: readonly number[],
): Mat4<ToFrame, FromFrame, TranslationUnit>

mat4Identity<Frame extends string>(
  frameTag: FrameTag<Frame>,
  dimensionlessUnitTag: UnitTag<Dimensionless>,
): LinearMat4<Frame, Frame>
mat4FromTranslation<TranslationUnit extends UnitExpr, Frame extends string>(
  frameTag: FrameTag<Frame>,
  translation: Delta3<TranslationUnit, Frame>,
): Mat4<Frame, Frame, TranslationUnit>
mat4FromScale<Frame extends string>(
  frameTag: FrameTag<Frame>,
  dimensionlessUnitTag: UnitTag<Dimensionless>,
  xScale: number,
  yScale: number,
  zScale: number,
): LinearMat4<Frame, Frame>

mat4FromQuaternionUnsafe<ToFrame extends string, FromFrame extends string>(
  toFrameTag: FrameTag<ToFrame>,
  fromFrameTag: FrameTag<FromFrame>,
  dimensionlessUnitTag: UnitTag<Dimensionless>,
  rotation: Quaternion<ToFrame, FromFrame>,
): LinearMat4<ToFrame, FromFrame>
mat4FromQuaternion<ToFrame extends string, FromFrame extends string>(
  toFrameTag: FrameTag<ToFrame>,
  fromFrameTag: FrameTag<FromFrame>,
  dimensionlessUnitTag: UnitTag<Dimensionless>,
  rotation: Quaternion<ToFrame, FromFrame>,
): LinearMat4<ToFrame, FromFrame>

mat4FromRigidTransform<ToFrame extends string, FromFrame extends string, TranslationUnit extends UnitExpr>(
  toFrameTag: FrameTag<ToFrame>,
  fromFrameTag: FrameTag<FromFrame>,
  rotation: Quaternion<ToFrame, FromFrame>,
  translation: Delta3<TranslationUnit, NoInfer<ToFrame>>,
): Mat4<ToFrame, FromFrame, TranslationUnit>

mat4FromTRSUnsafe<ToFrame extends string, FromFrame extends string, TranslationUnit extends UnitExpr>(
  toFrameTag: FrameTag<ToFrame>,
  fromFrameTag: FrameTag<FromFrame>,
  translation: Delta3<TranslationUnit, NoInfer<ToFrame>>,
  rotation: Quaternion<NoInfer<ToFrame>, NoInfer<FromFrame>>,
  scale: Dir3<NoInfer<FromFrame>>,
): Mat4<ToFrame, FromFrame, TranslationUnit>
mat4FromTRS<ToFrame extends string, FromFrame extends string, TranslationUnit extends UnitExpr>(
  toFrameTag: FrameTag<ToFrame>,
  fromFrameTag: FrameTag<FromFrame>,
  translation: Delta3<TranslationUnit, NoInfer<ToFrame>>,
  rotation: Quaternion<NoInfer<ToFrame>, NoInfer<FromFrame>>,
  scale: Dir3<NoInfer<FromFrame>>,
): Mat4<ToFrame, FromFrame, TranslationUnit>

createTrsMat4Cache<ToFrame extends string, FromFrame extends string, TranslationUnit extends UnitExpr>(
  toFrameTag: FrameTag<ToFrame>,
  fromFrameTag: FrameTag<FromFrame>,
  translationUnitTag: UnitTag<TranslationUnit>,
): (
  translation: Delta3<TranslationUnit, NoInfer<ToFrame>>,
  rotation: Quaternion<NoInfer<ToFrame>, NoInfer<FromFrame>>,
  scale: Dir3<NoInfer<FromFrame>>,
) => Mat4<ToFrame, FromFrame, TranslationUnit>

mat4PerspectiveUnsafe<ToFrame extends string, FromFrame extends string, DepthUnit extends UnitExpr>(
  toFrameTag: FrameTag<ToFrame>,
  fromFrameTag: FrameTag<FromFrame>,
  fieldOfViewYRadians: number,
  aspect: number,
  near: Quantity<DepthUnit>,
  far: Quantity<NoInfer<DepthUnit>>,
): ProjectionMat4<ToFrame, FromFrame, DepthUnit>
mat4Perspective<ToFrame extends string, FromFrame extends string, DepthUnit extends UnitExpr>(
  toFrameTag: FrameTag<ToFrame>,
  fromFrameTag: FrameTag<FromFrame>,
  fieldOfViewYRadians: number,
  aspect: number,
  near: Quantity<DepthUnit>,
  far: Quantity<NoInfer<DepthUnit>>,
): ProjectionMat4<ToFrame, FromFrame, DepthUnit>

projectPoint3Unsafe<ToFrame extends string, FromFrame extends string, DepthUnit extends UnitExpr>(
  point: Point3<NoInfer<DepthUnit>, NoInfer<FromFrame>>,
  projection: ProjectionMat4<ToFrame, FromFrame, DepthUnit>,
): Point3<Dimensionless, ToFrame>
projectPoint3<ToFrame extends string, FromFrame extends string, DepthUnit extends UnitExpr>(
  point: Point3<NoInfer<DepthUnit>, NoInfer<FromFrame>>,
  projection: ProjectionMat4<ToFrame, FromFrame, DepthUnit>,
): Point3<Dimensionless, ToFrame>

mat4LookAtUnsafe<ToFrame extends string, FromFrame extends string, TranslationUnit extends UnitExpr>(
  toFrameTag: FrameTag<ToFrame>,
  fromFrameTag: FrameTag<FromFrame>,
  point_eye_from: Point3<TranslationUnit, NoInfer<FromFrame>>,
  point_target_from: Point3<TranslationUnit, NoInfer<FromFrame>>,
  dir_up_from: Dir3<NoInfer<FromFrame>>,
): Mat4<ToFrame, FromFrame, TranslationUnit>
mat4LookAt<ToFrame extends string, FromFrame extends string, TranslationUnit extends UnitExpr>(
  toFrameTag: FrameTag<ToFrame>,
  fromFrameTag: FrameTag<FromFrame>,
  point_eye_from: Point3<TranslationUnit, NoInfer<FromFrame>>,
  point_target_from: Point3<TranslationUnit, NoInfer<FromFrame>>,
  dir_up_from: Dir3<NoInfer<FromFrame>>,
): Mat4<ToFrame, FromFrame, TranslationUnit>

transposeMat4<ToFrame extends string, FromFrame extends string, TranslationUnit extends UnitExpr>(
  value: Mat4<ToFrame, FromFrame, TranslationUnit>,
): Mat4<FromFrame, ToFrame, TranslationUnit>
transposeMat4<ToFrame extends string, FromFrame extends string>(
  value: LinearMat4<ToFrame, FromFrame>,
): LinearMat4<FromFrame, ToFrame>

composeMat4<ToFrame extends string, ViaFrame extends string, FromFrame extends string>(
  outer: LinearMat4<ToFrame, ViaFrame>,
  inner: LinearMat4<NoInfer<ViaFrame>, FromFrame>,
): LinearMat4<ToFrame, FromFrame>
composeMat4<ToFrame extends string, ViaFrame extends string, FromFrame extends string, TranslationUnit extends UnitExpr>(
  outer: Mat4<ToFrame, ViaFrame, TranslationUnit>,
  inner: LinearMat4<NoInfer<ViaFrame>, FromFrame>,
): Mat4<ToFrame, FromFrame, TranslationUnit>
composeMat4<ToFrame extends string, ViaFrame extends string, FromFrame extends string, TranslationUnit extends UnitExpr>(
  outer: LinearMat4<ToFrame, ViaFrame>,
  inner: Mat4<NoInfer<ViaFrame>, FromFrame, TranslationUnit>,
): Mat4<ToFrame, FromFrame, TranslationUnit>
composeMat4<ToFrame extends string, ViaFrame extends string, FromFrame extends string, TranslationUnit extends UnitExpr>(
  outer: Mat4<ToFrame, ViaFrame, TranslationUnit>,
  inner: Mat4<NoInfer<ViaFrame>, FromFrame, NoInfer<TranslationUnit>>,
): Mat4<ToFrame, FromFrame, TranslationUnit>
composeMat4<ToFrame extends string, ViaFrame extends string, FromFrame extends string, LeftTranslationUnit extends UnitExpr, RightTranslationUnit extends UnitExpr>(
  outer: Mat4<ToFrame, ViaFrame, LeftTranslationUnit>,
  inner: Mat4<NoInfer<ViaFrame>, FromFrame, RightTranslationUnit>,
): Mat4<ToFrame, FromFrame, UnitExpr>

invertRigidMat4Unsafe<ToFrame extends string, FromFrame extends string>(
  value: LinearMat4<ToFrame, FromFrame>,
): LinearMat4<FromFrame, ToFrame>
invertRigidMat4Unsafe<ToFrame extends string, FromFrame extends string, TranslationUnit extends UnitExpr>(
  value: Mat4<ToFrame, FromFrame, TranslationUnit>,
): Mat4<FromFrame, ToFrame, TranslationUnit>
invertRigidMat4<ToFrame extends string, FromFrame extends string>(
  value: LinearMat4<ToFrame, FromFrame>,
): LinearMat4<FromFrame, ToFrame>
invertRigidMat4<ToFrame extends string, FromFrame extends string, TranslationUnit extends UnitExpr>(
  value: Mat4<ToFrame, FromFrame, TranslationUnit>,
): Mat4<FromFrame, ToFrame, TranslationUnit>

normalMatrixFromMat4Unsafe<ToFrame extends string, FromFrame extends string, TranslationUnit extends UnitExpr>(
  value: Mat4<ToFrame, FromFrame, TranslationUnit>,
): LinearMat4<ToFrame, FromFrame>
normalMatrixFromMat4<ToFrame extends string, FromFrame extends string, TranslationUnit extends UnitExpr>(
  value: Mat4<ToFrame, FromFrame, TranslationUnit>,
): LinearMat4<ToFrame, FromFrame>

transformPoint3<TranslationUnit extends UnitExpr, ToFrame extends string, FromFrame extends string>(
  point: Point3<NoInfer<TranslationUnit>, NoInfer<FromFrame>>,
  matrix: Mat4<ToFrame, FromFrame, TranslationUnit>,
): Point3<TranslationUnit, ToFrame>
transformPoint3<Unit extends UnitExpr, ToFrame extends string, FromFrame extends string>(
  point: Point3<Unit, NoInfer<FromFrame>>,
  matrix: LinearMat4<ToFrame, FromFrame>,
): Point3<Unit, ToFrame>

transformDirection3<Unit extends UnitExpr, MatrixTranslationUnit extends UnitExpr, ToFrame extends string, FromFrame extends string>(
  direction: Delta3<Unit, NoInfer<FromFrame>>,
  matrix: Mat4<ToFrame, FromFrame, MatrixTranslationUnit>,
): Delta3<Unit, ToFrame>
transformDirection3<MatrixTranslationUnit extends UnitExpr, ToFrame extends string, FromFrame extends string>(
  direction: Dir3<NoInfer<FromFrame>>,
  matrix: Mat4<ToFrame, FromFrame, MatrixTranslationUnit>,
): Dir3<ToFrame>
```

## Safe API error conditions

Safe APIs that can throw:

- `clamp` when `minValue > maxValue`
- `normalizeVec3` when vector length is too small
- `projectVec3` when projection target length is too small
- `reflectVec3` when normal length is too small
- `angleBetweenVec3` when either input length is too small
- `quatNormalize` when quaternion length is too small
- `quatInverse` when quaternion length is too small
- `quatFromAxisAngle` when axis length is too small
- `mat4` when value count is not 16
- `mat4Perspective` when FOV/aspect/near/far are invalid
- `projectPoint3` when homogeneous `w === 0`
- `mat4LookAt` for degenerate eye/target/up configurations
- `invertRigidMat4` when matrix fails rigid transform checks
- `normalMatrixFromMat4` when linear part is singular

## Development

```bash
deno task check
deno test
deno test --coverage=coverage --no-check
deno coverage coverage
```
