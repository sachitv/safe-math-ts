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
const one = dimensionlessUnit;

const point_V = point3(
  V,
  quantity(m, 1),
  quantity(m, 2),
  quantity(m, 3),
);

const delta_translation_L = delta3(
  L,
  quantity(m, 10),
  quantity(m, 0),
  quantity(m, 0),
);

const dir_axisz_V = dir3(
  V,
  quantity(one, 0),
  quantity(one, 0),
  quantity(one, 1),
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
  delta_translation_L,
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
  to units (for example, `meter`, `second`, `one` are fine).
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
- `composeMat4(pose_BV, pose_LB)` returns `pose_LV` (apply `V -> B`, then
  `B -> L`).

## Full API reference

See [`API_REFERENCE.md`](API_REFERENCE.md) for complete type definitions and all
function signatures.
