# API Reference

Complete type and function signatures for safe-math-ts.

## Type reference

### Units

- `UnitExpr`: normalized compile-time unit representation.
- `Dimensionless`: `'none'`.
- `NoInfer<ValueType>`: generic helper to lock inference.
- `UnitTag<Unit extends UnitExpr>`: compile-time unit token.
- `Quantity<Unit extends UnitExpr>`: branded scalar quantity.
- `MulUnit<LeftUnit, RightUnit>`: type-level unit multiplication helper.
- `DivUnit<LeftUnit, RightUnit>`: type-level unit division helper.
- `SqrtUnit<Unit>`: type-level square-root helper for squared units.

### Frames and geometry

- `FrameTag<Frame extends string>`: compile-time frame token.
- `Point3<Unit, Frame>`: branded affine point.
- `Delta3<Unit, Frame>`: branded displacement/translation vector.
- `Dir3<Frame>`: branded unitless direction vector.
- `Quaternion<ToFrame, FromFrame>`: branded quaternion rotation.
- `Mat4<ToFrame, FromFrame, TranslationUnit>`: branded 4x4 affine transform.
- `LinearMat4<ToFrame, FromFrame>`: branded 4x4 linear transform (translation
  fixed to zero).

## API reference

## Token constructors

### `unit`

```ts
unit<Expr extends string>(name: Expr): UnitTag<UnitFromString<Expr>>
```

Creates a compile-time unit token.

### `dimensionlessUnit`

```ts
const dimensionlessUnit: UnitTag<'none'>;
```

Predefined unit token for dimensionless quantities.

### `frame`

```ts
frame<Frame extends string>(name: Frame): FrameTag<Frame>
```

Creates a compile-time frame token.

## Scalar/unit functions (`src/units.ts`)

### `quantity`

```ts
quantity<Unit extends UnitExpr>(unitTag: UnitTag<Unit>, value: number): Quantity<Unit>
```

Creates a quantity with explicit unit token.

### `dimensionless`

```ts
dimensionless(value: number): Quantity<'none'>
```

Creates dimensionless quantity.

### `valueOf`

```ts
valueOf<Unit extends UnitExpr>(value: Quantity<Unit>): number
```

Unwraps to raw number.

### `add`

```ts
add<Unit extends UnitExpr>(left: Quantity<Unit>, right: Quantity<Unit>): Quantity<Unit>
```

### `sub`

```ts
sub<Unit extends UnitExpr>(left: Quantity<Unit>, right: Quantity<Unit>): Quantity<Unit>
```

### `neg`

```ts
neg<Unit extends UnitExpr>(value: Quantity<Unit>): Quantity<Unit>
```

### `abs`

```ts
abs<Unit extends UnitExpr>(value: Quantity<Unit>): Quantity<Unit>
```

### `min`

```ts
min<Unit extends UnitExpr>(left: Quantity<Unit>, right: Quantity<Unit>): Quantity<Unit>
```

### `max`

```ts
max<Unit extends UnitExpr>(left: Quantity<Unit>, right: Quantity<Unit>): Quantity<Unit>
```

### `clamp`

```ts
clamp<Unit extends UnitExpr>(value: Quantity<Unit>, minValue: Quantity<Unit>, maxValue: Quantity<Unit>): Quantity<Unit>
```

Throws when `minValue > maxValue`.

### `scale`

```ts
scale<Unit extends UnitExpr>(value: Quantity<Unit>, scalar: number): Quantity<Unit>
```

### `mul`

```ts
mul<LeftUnit extends UnitExpr, RightUnit extends UnitExpr>(left: Quantity<LeftUnit>, right: Quantity<RightUnit>): Quantity<MulUnit<LeftUnit, RightUnit>>
```

### `div`

```ts
div<LeftUnit extends UnitExpr, RightUnit extends UnitExpr>(left: Quantity<LeftUnit>, right: Quantity<RightUnit>): Quantity<DivUnit<LeftUnit, RightUnit>>
```

### `sqrt`

```ts
sqrt<Unit extends UnitExpr>(value: Quantity<Unit>): Quantity<SqrtUnit<Unit>>
```

Accepts only squared units at compile time.

### `eq`

```ts
eq<Unit extends UnitExpr>(left: Quantity<Unit>, right: Quantity<Unit>): boolean
```

### `lt`

```ts
lt<Unit extends UnitExpr>(left: Quantity<Unit>, right: Quantity<Unit>): boolean
```

### `lte`

```ts
lte<Unit extends UnitExpr>(left: Quantity<Unit>, right: Quantity<Unit>): boolean
```

### `gt`

```ts
gt<Unit extends UnitExpr>(left: Quantity<Unit>, right: Quantity<Unit>): boolean
```

### `gte`

```ts
gte<Unit extends UnitExpr>(left: Quantity<Unit>, right: Quantity<Unit>): boolean
```

### `sum`

```ts
sum<Unit extends UnitExpr>(values: readonly Quantity<Unit>[]): Quantity<Unit>
```

### `average`

```ts
average<Unit extends UnitExpr>(values: readonly [Quantity<Unit>, ...Quantity<Unit>[]]): Quantity<Unit>
```

## Vector functions (`src/geometry3d/vector3.ts`)

### `delta3`

```ts
delta3<Unit extends UnitExpr, Frame extends string>(frameTag: FrameTag<Frame>, x: Quantity<Unit>, y: Quantity<Unit>, z: Quantity<Unit>): Delta3<Unit, Frame>
```

### `point3`

```ts
point3<Unit extends UnitExpr, Frame extends string>(frameTag: FrameTag<Frame>, x: Quantity<Unit>, y: Quantity<Unit>, z: Quantity<Unit>): Point3<Unit, Frame>
```

### `dir3`

```ts
dir3<Frame extends string>(frameTag: FrameTag<Frame>, x: Quantity<'none'>, y: Quantity<'none'>, z: Quantity<'none'>): Dir3<Frame>
```

### `zeroVec3`

```ts
zeroVec3<Unit extends UnitExpr, Frame extends string>(unitTag: UnitTag<Unit>, frameTag: FrameTag<Frame>): Delta3<Unit, Frame>
```

### `addVec3`

```ts
addVec3<Unit extends UnitExpr, Frame extends string>(left: Delta3<Unit, Frame>, right: Delta3<Unit, Frame>): Delta3<Unit, Frame>
```

### `addPoint3`

```ts
addPoint3<Unit extends UnitExpr, Frame extends string>(point: Point3<Unit, Frame>, delta: Delta3<Unit, Frame>): Point3<Unit, Frame>
```

### `subPoint3`

```ts
subPoint3<Unit extends UnitExpr, Frame extends string>(left: Point3<Unit, Frame>, right: Point3<Unit, Frame>): Delta3<Unit, Frame>
```

### `subPoint3Delta3`

```ts
subPoint3Delta3<Unit extends UnitExpr, Frame extends string>(point: Point3<Unit, Frame>, delta: Delta3<Unit, Frame>): Point3<Unit, Frame>
```

### `subVec3`

```ts
subVec3<Unit extends UnitExpr, Frame extends string>(left: Delta3<Unit, Frame>, right: Delta3<Unit, Frame>): Delta3<Unit, Frame>
```

### `negVec3`

```ts
negVec3<Unit extends UnitExpr, Frame extends string>(value: Delta3<Unit, Frame>): Delta3<Unit, Frame>
```

### `scaleVec3`

```ts
scaleVec3<Unit extends UnitExpr, Frame extends string>(value: Delta3<Unit, Frame>, scalar: number): Delta3<Unit, Frame>
```

### `scaleDir3`

```ts
scaleDir3<Unit extends UnitExpr, Frame extends string>(value: Dir3<Frame>, magnitude: Quantity<Unit>): Delta3<Unit, Frame>
```

### `dotVec3`

```ts
dotVec3<LeftUnit extends UnitExpr, RightUnit extends UnitExpr, Frame extends string>(left: Delta3<LeftUnit, Frame>, right: Delta3<RightUnit, Frame>): Quantity<MulUnit<LeftUnit, RightUnit>>
```

### `crossVec3`

```ts
crossVec3<LeftUnit extends UnitExpr, RightUnit extends UnitExpr, Frame extends string>(left: Delta3<LeftUnit, Frame>, right: Delta3<RightUnit, Frame>): Delta3<MulUnit<LeftUnit, RightUnit>, Frame>
```

### `lengthSquaredVec3`

```ts
lengthSquaredVec3<Unit extends UnitExpr, Frame extends string>(value: Delta3<Unit, Frame>): Quantity<MulUnit<Unit, Unit>>
```

### `lengthVec3`

```ts
lengthVec3<Unit extends UnitExpr, Frame extends string>(value: Delta3<Unit, Frame>): Quantity<Unit>
```

### `distanceVec3`

```ts
distanceVec3<Unit extends UnitExpr, Frame extends string>(left: Delta3<Unit, Frame>, right: Delta3<Unit, Frame>): Quantity<Unit>
distanceVec3<Unit extends UnitExpr, Frame extends string>(left: Point3<Unit, Frame>, right: Point3<Unit, Frame>): Quantity<Unit>
```

### `distancePoint3`

```ts
distancePoint3<Unit extends UnitExpr, Frame extends string>(left: Point3<Unit, Frame>, right: Point3<Unit, Frame>): Quantity<Unit>
```

### `normalizeVec3`

```ts
normalizeVec3<Unit extends UnitExpr, Frame extends string>(value: Delta3<Unit, Frame>): Dir3<Frame>
```

Throws when length is zero.

### `lerpVec3`

```ts
lerpVec3<Unit extends UnitExpr, Frame extends string>(start: Delta3<Unit, Frame>, end: Delta3<Unit, Frame>, t: number): Delta3<Unit, Frame>
lerpVec3<Unit extends UnitExpr, Frame extends string>(start: Point3<Unit, Frame>, end: Point3<Unit, Frame>, t: number): Point3<Unit, Frame>
```

## Quaternion functions (`src/geometry3d/quaternion.ts`)

### `quat`

```ts
quat<ToFrame extends string, FromFrame extends string>(toFrameTag: FrameTag<ToFrame>, fromFrameTag: FrameTag<FromFrame>, x: number, y: number, z: number, w: number): Quaternion<ToFrame, FromFrame>
```

### `quatIdentity`

```ts
quatIdentity<Frame extends string>(frameTag: FrameTag<Frame>): Quaternion<Frame, Frame>
```

### `quatConjugate`

```ts
quatConjugate<ToFrame extends string, FromFrame extends string>(value: Quaternion<ToFrame, FromFrame>): Quaternion<FromFrame, ToFrame>
```

### `quatNormSquared`

```ts
quatNormSquared<ToFrame extends string, FromFrame extends string>(value: Quaternion<ToFrame, FromFrame>): number
```

### `quatNorm`

```ts
quatNorm<ToFrame extends string, FromFrame extends string>(value: Quaternion<ToFrame, FromFrame>): number
```

### `quatNormalize`

```ts
quatNormalize<ToFrame extends string, FromFrame extends string>(value: Quaternion<ToFrame, FromFrame>): Quaternion<ToFrame, FromFrame>
```

Throws when norm is zero.

### `quatInverse`

```ts
quatInverse<ToFrame extends string, FromFrame extends string>(value: Quaternion<ToFrame, FromFrame>): Quaternion<FromFrame, ToFrame>
```

Throws when norm is zero.

### `composeQuats`

```ts
composeQuats<ToFrame extends string, ViaFrame extends string, FromFrame extends string>(first: Quaternion<ViaFrame, FromFrame>, second: Quaternion<ToFrame, ViaFrame>): Quaternion<ToFrame, FromFrame>
```

Order: apply `first`, then `second`.

### `rotateVec3ByQuat`

```ts
rotateVec3ByQuat<Unit extends UnitExpr, ToFrame extends string, FromFrame extends string>(rotation: Quaternion<ToFrame, FromFrame>, value: Delta3<Unit, FromFrame>): Delta3<Unit, ToFrame>
rotateVec3ByQuat<ToFrame extends string, FromFrame extends string>(rotation: Quaternion<ToFrame, FromFrame>, value: Dir3<FromFrame>): Dir3<ToFrame>
```

### `quatFromAxisAngle`

```ts
quatFromAxisAngle<Frame extends string>(frameTag: FrameTag<Frame>, axis: Dir3<Frame>, angleRadians: number): Quaternion<Frame, Frame>
```

Axis is normalized internally. Throws for zero axis.

## Matrix functions (`src/geometry3d/matrix4.ts`)

### `mat4`

```ts
mat4<ToFrame extends string, FromFrame extends string, TranslationUnit extends UnitExpr>(toFrameTag: FrameTag<ToFrame>, fromFrameTag: FrameTag<FromFrame>, translationUnitTag: UnitTag<TranslationUnit>, values: readonly number[]): Mat4<ToFrame, FromFrame, TranslationUnit>
```

Throws when value count is not 16.

### `mat4Identity`

```ts
mat4Identity<Frame extends string>(frameTag: FrameTag<Frame>, dimensionlessUnitTag: UnitTag<'none'>): LinearMat4<Frame, Frame>
```

### `mat4FromTranslation`

```ts
mat4FromTranslation<TranslationUnit extends UnitExpr, Frame extends string>(frameTag: FrameTag<Frame>, translation: Delta3<TranslationUnit, Frame>): Mat4<Frame, Frame, TranslationUnit>
```

### `mat4FromScale`

```ts
mat4FromScale<Frame extends string>(frameTag: FrameTag<Frame>, dimensionlessUnitTag: UnitTag<'none'>, xScale: number, yScale: number, zScale: number): LinearMat4<Frame, Frame>
```

### `mat4FromQuaternion`

```ts
mat4FromQuaternion<ToFrame extends string, FromFrame extends string>(toFrameTag: FrameTag<ToFrame>, fromFrameTag: FrameTag<FromFrame>, dimensionlessUnitTag: UnitTag<'none'>, rotation: Quaternion<ToFrame, FromFrame>): LinearMat4<ToFrame, FromFrame>
```

### `mat4FromRigidTransform`

```ts
mat4FromRigidTransform<ToFrame extends string, FromFrame extends string, TranslationUnit extends UnitExpr>(toFrameTag: FrameTag<ToFrame>, fromFrameTag: FrameTag<FromFrame>, rotation: Quaternion<ToFrame, FromFrame>, translation: Delta3<TranslationUnit, ToFrame>): Mat4<ToFrame, FromFrame, TranslationUnit>
```

### `transposeMat4`

```ts
transposeMat4<ToFrame extends string, FromFrame extends string, TranslationUnit extends UnitExpr>(value: Mat4<ToFrame, FromFrame, TranslationUnit>): Mat4<FromFrame, ToFrame, TranslationUnit>
transposeMat4<ToFrame extends string, FromFrame extends string>(value: LinearMat4<ToFrame, FromFrame>): LinearMat4<FromFrame, ToFrame>
```

### `composeMat4`

```ts
composeMat4<ToFrame extends string, ViaFrame extends string, FromFrame extends string>(first: LinearMat4<ViaFrame, FromFrame>, second: LinearMat4<ToFrame, ViaFrame>): LinearMat4<ToFrame, FromFrame>
composeMat4<ToFrame extends string, ViaFrame extends string, FromFrame extends string, TranslationUnit extends UnitExpr>(first: LinearMat4<ViaFrame, FromFrame>, second: Mat4<ToFrame, ViaFrame, TranslationUnit>): Mat4<ToFrame, FromFrame, TranslationUnit>
composeMat4<ToFrame extends string, ViaFrame extends string, FromFrame extends string, TranslationUnit extends UnitExpr>(first: Mat4<ViaFrame, FromFrame, TranslationUnit>, second: LinearMat4<ToFrame, ViaFrame>): Mat4<ToFrame, FromFrame, TranslationUnit>
composeMat4<ToFrame extends string, ViaFrame extends string, FromFrame extends string, TranslationUnit extends UnitExpr>(first: Mat4<ViaFrame, FromFrame, TranslationUnit>, second: Mat4<ToFrame, ViaFrame, TranslationUnit>): Mat4<ToFrame, FromFrame, TranslationUnit>
composeMat4<ToFrame extends string, ViaFrame extends string, FromFrame extends string, LeftTranslationUnit extends UnitExpr, RightTranslationUnit extends UnitExpr>(first: Mat4<ViaFrame, FromFrame, LeftTranslationUnit>, second: Mat4<ToFrame, ViaFrame, RightTranslationUnit>): Mat4<ToFrame, FromFrame, UnitExpr>
```

Order: apply `first`, then `second`.

### `invertRigidMat4`

```ts
invertRigidMat4<ToFrame extends string, FromFrame extends string>(value: LinearMat4<ToFrame, FromFrame>): LinearMat4<FromFrame, ToFrame>
invertRigidMat4<ToFrame extends string, FromFrame extends string, TranslationUnit extends UnitExpr>(value: Mat4<ToFrame, FromFrame, TranslationUnit>): Mat4<FromFrame, ToFrame, TranslationUnit>
```

Throws when matrix is not rigid.

### `transformPoint3`

```ts
transformPoint3<TranslationUnit extends UnitExpr, ToFrame extends string, FromFrame extends string>(matrix: Mat4<ToFrame, FromFrame, TranslationUnit>, point: Point3<TranslationUnit, FromFrame>): Point3<TranslationUnit, ToFrame>
transformPoint3<Unit extends UnitExpr, ToFrame extends string, FromFrame extends string>(matrix: LinearMat4<ToFrame, FromFrame>, point: Point3<Unit, FromFrame>): Point3<Unit, ToFrame>
```

Includes translation.

### `transformDirection3`

```ts
transformDirection3<Unit extends UnitExpr, MatrixTranslationUnit extends UnitExpr, ToFrame extends string, FromFrame extends string>(matrix: Mat4<ToFrame, FromFrame, MatrixTranslationUnit>, direction: Delta3<Unit, FromFrame>): Delta3<Unit, ToFrame>
transformDirection3<MatrixTranslationUnit extends UnitExpr, ToFrame extends string, FromFrame extends string>(matrix: Mat4<ToFrame, FromFrame, MatrixTranslationUnit>, direction: Dir3<FromFrame>): Dir3<ToFrame>
```

Ignores translation.

## Error conditions

Functions that throw by design:

- `clamp` when `minValue > maxValue`
- `normalizeVec3` on zero vector
- `quatNormalize` on zero quaternion
- `quatInverse` on zero quaternion
- `quatFromAxisAngle` on zero axis
- `mat4` with non-16 input length
- `invertRigidMat4` for non-rigid matrices

## Development

```bash
deno task check
deno test --coverage=coverage --coverage-raw-data-only
deno coverage coverage
```
