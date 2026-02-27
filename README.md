# safe-math-ts

A zero-dependency Deno/TypeScript 3D math library with strict compile-time
safety for:

- Units
- Frames of reference
- Transform composition

The library is functional and exports **types + functions only** (no classes).

## Strictness model

This library intentionally requires explicit tags when creating values:

- You must create units with `unit('m')`, `unit('s')`, etc.
- You must create frames with `frame('world')`, `frame('body')`, etc.
- You must pass those tags into constructors like `quantity`, `point3`,
  `delta3`, `dir3`, `quat`, and `mat4`.

This prevents accidental creation of unframed or unitless math objects.

## Install / import

```ts
import {
  delta3,
  dimensionlessUnit,
  dir3,
  frame,
  mat4FromRigidTransform,
  point3,
  quantity,
  quat,
  transformPoint3,
  unit,
} from './mod.ts';
```

## Quick start

```ts
import {
  delta3,
  dimensionlessUnit,
  dir3,
  frame,
  mat4FromRigidTransform,
  point3,
  quantity,
  quat,
  transformPoint3,
  unit,
} from './mod.ts';

const V = frame('V'); // Source frame
const L = frame('L'); // Destination frame
const m = unit('m');
const none = dimensionlessUnit;

const point_V = point3(
  V,
  quantity(m, 1),
  quantity(m, 2),
  quantity(m, 3),
);

const delta_offset_L = delta3(
  L,
  quantity(m, 10),
  quantity(m, 0),
  quantity(m, 0),
);

const dir_axisz_V = dir3(
  V,
  quantity(none, 0),
  quantity(none, 0),
  quantity(none, 1),
);

const quat_turn_LV = quat(
  L,
  V,
  dir_axisz_V[0] * Math.sin(Math.PI / 4),
  dir_axisz_V[1] * Math.sin(Math.PI / 4),
  dir_axisz_V[2] * Math.sin(Math.PI / 4),
  Math.cos(Math.PI / 4),
);

const pose_LV = mat4FromRigidTransform(
  L,
  V,
  quat_turn_LV,
  delta_offset_L,
);

const point_L = transformPoint3(pose_LV, point_V);
```

## Common usage patterns

- Use `point3` for absolute locations in a frame.
- Use `delta3` for translations/displacements.
- Use `dir3` for unitless axes and orientation vectors.
- Compute relative motion with `subPoint3(point_a, point_b)`.
- Apply rigid transforms to points with `transformPoint3`.
- Apply linear transforms/rotations to displacements with `transformDirection3`
  or `rotateVec3ByQuat`.

## Safe and unsafe APIs

- Safe APIs are the default functions (for example `normalizeVec3`, `clamp`,
  `mat4Perspective`, `projectPoint3`).
- Unsafe APIs end with `Unsafe` (for example `normalizeVec3Unsafe`,
  `clampUnsafe`, `mat4PerspectiveUnsafe`, `projectPoint3Unsafe`).
- Safe APIs validate inputs and throw on invalid/degenerate cases.
- Unsafe APIs skip validation and can produce `NaN`/`Infinity` on invalid
  inputs.
- Recommended pattern:
  1. Validate at system boundaries with safe APIs.
  2. Use unsafe APIs only in hot paths where inputs are already guaranteed.

## Naming best practices

- Transform and rotation generics always use `<To, From>` order.
- Transform matrices use `pose_<frame rules>`.
- Quaternions use `quat_<name>_<frame rules>`.
- Position vectors use `point_<name>_<frame>` (or `point_<frame>` when no name
  is needed).
- Direction vectors use `dir_<name>_<frame>` (or `dir_<frame>` when no name is
  needed).
- Displacement vectors use `delta_<name>_<frame>` (or `delta_<frame>`).
- Single-letter frame symbols use compact `ToFrom` suffixes: `pose_LV`,
  `quat_turn_LV`, `point_L`, `dir_V`, `delta_V`.
- Multi-letter frame symbols use one token per frame: `pose_local_vehicle`,
  `quat_turn_local_vehicle`, `point_local`, `dir_vehicle`, `delta_vehicle`.
- Frame tokens themselves are single words. If a frame name would include
  spaces, smash it into one word (for example `earthcenter`, `vehiclerear`),
  then use names like `pose_earthcenter_vehiclerear` and
  `quat_turn_earthcenter_vehiclerear`.
- Frame tag variable names themselves can be whatever you prefer (`L`,
  `frame_local`, `localFrame`), but choose frame tokens that keep derived
  variable names readable.
- This naming convention is for frame-bearing quantities only; it does not apply
  to units (for example, `meter`, `second`, `none` are fine).
- Prefer short uppercase frame symbols (`L`, `V`, `B`, `W`) in handwritten math
  and derived variable names.

Examples:

- `pose_LV: Mat4<'L', 'V', 'm'>` maps points in `V` to `L`, so:
  `point_L = transformPoint3(pose_LV, point_V)`.
- `quat_turn_LV: Quaternion<'L', 'V'>` rotates vectors from `V` into `L`.
- `delta_local: Delta3<'m', 'local'>` represents a translation/displacement in
  `local`.
- `pose_local_vehicle: Mat4<'local', 'vehicle', 'm'>` maps points in `vehicle`
  to `local`.
- `composeMat4(pose_LB, pose_BV)` returns `pose_LV` (chain `L <- B <- V`).

## API overview

This section documents the important public API and constraints without listing
every overload.

### Core types

Units:

- `UnitExpr`
- `Dimensionless`
- `UnitFromString<Expr>`
- `UnitTag<Unit>`
- `Quantity<Unit>`
- `MulUnit<A, B>`, `DivUnit<A, B>`, `SqrtUnit<U>`

Frames and geometry:

- `FrameTag<Frame>`
- `Point3<Unit, Frame>`
- `Delta3<Unit, Frame>`
- `Dir3<Frame>`
- `Quaternion<ToFrame, FromFrame>`
- `Mat4<ToFrame, FromFrame, TranslationUnit>`
- `LinearMat4<ToFrame, FromFrame>`
- `ProjectionMat4<ToFrame, FromFrame, DepthUnit>`

### Constructors and tokens

```ts
unit<Expr extends string>(name: string extends Expr ? never : Expr): UnitTag<UnitFromString<Expr>>
const dimensionlessUnit: UnitTag<Dimensionless>
frame<Frame extends string>(name: Frame): FrameTag<Frame>

quantity<Unit extends UnitExpr>(unitTag: UnitTag<Unit>, value: number): Quantity<Unit>
dimensionless(value: number): Quantity<Dimensionless>
valueOf<Unit extends UnitExpr>(value: Quantity<Unit>): number
```

Non-obvious constraints:

- `unit(...)` accepts literal/narrow string types only.
- `sqrt(...)` is compile-time guarded and only allowed for square-rootable
  units.

```ts
sqrt<Unit extends UnitExpr>(
  value: [SqrtUnit<Unit>] extends [never] ? never : Quantity<Unit>,
): Quantity<SqrtUnit<Unit>>
```

### Scalar unit math

- Arithmetic: `add`, `sub`, `neg`, `abs`, `scale`, `mul`, `div`, `sqrt`
- Bounds: `min`, `max`, `clamp`, `clampUnsafe`
- Comparisons: `eq`, `approxEq`, `lt`, `lte`, `gt`, `gte`
- Aggregation: `sum`, `average`

### 3D vector and point operations

Construction:

- `delta3`, `point3`, `dir3`, `zeroVec3`

Affine/frame-safe operations:

- `addVec3`, `subVec3`, `negVec3`, `scaleVec3`
- `addPoint3`, `subPoint3Delta3`, `subPoint3`

Geometry:

- `dotVec3`, `crossVec3`
- `lengthSquaredVec3`, `lengthVec3`
- `distanceVec3`, `distancePoint3`
- `normalizeVec3`, `normalizeVec3Unsafe`
- `lerpVec3`
- `projectVec3`, `projectVec3Unsafe`
- `reflectVec3`, `reflectVec3Unsafe`
- `angleBetweenVec3`, `angleBetweenVec3Unsafe`
- `scaleDir3`

### Quaternion operations

- Construction and identity: `quat`, `quatIdentity`
- Algebra: `quatConjugate`, `quatNorm`, `quatNormSquared`, `composeQuats`
- Normalization/inversion: `quatNormalize`, `quatNormalizeUnsafe`,
  `quatInverse`, `quatInverseUnsafe`
- Rotations: `rotateVec3ByQuat`, `rotateVec3ByQuatUnsafe`
- Builders/interpolation: `quatFromAxisAngle`, `quatFromAxisAngleUnsafe`,
  `quatFromEuler`, `quatFromEulerUnsafe`, `quatNlerp`, `quatNlerpUnsafe`,
  `quatSlerp`, `quatSlerpUnsafe`

### Matrix operations

Construction:

- `mat4`, `mat4Unsafe`, `mat4Identity`
- `mat4FromTranslation`, `mat4FromScale`
- `mat4FromQuaternion`, `mat4FromQuaternionUnsafe`
- `mat4FromRigidTransform`
- `mat4FromTRS`, `mat4FromTRSUnsafe`
- `createTrsMat4Cache`
- `mat4Perspective`, `mat4PerspectiveUnsafe`
- `mat4Ortho`, `mat4OrthoUnsafe`
- `mat4LookAt`, `mat4LookAtUnsafe`

Composition and transforms:

- `transposeMat4`
- `composeMat4`
- `invertRigidMat4`, `invertRigidMat4Unsafe`
- `normalMatrixFromMat4`, `normalMatrixFromMat4Unsafe`
- `transformPoint3`
- `transformDirection3`
- `projectPoint3`, `projectPoint3Unsafe`
