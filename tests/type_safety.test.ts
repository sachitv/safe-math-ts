import {
  addPoint3,
  addVec3,
  composeMat4,
  delta3,
  dimensionlessUnit,
  dir3,
  div,
  frame,
  mat4,
  mat4FromQuaternion,
  mat4FromTranslation,
  mul,
  point3,
  quantity,
  quat,
  quatFromAxisAngle,
  quatFromRotationMatrix,
  rotateVec3ByQuat,
  sqrt,
  subPoint3,
  transformPoint3,
  unit,
} from '../mod.ts';
import type { DivUnit, MulUnit, UnitFromString } from '../mod.ts';
import { assert, assertSameUnitType } from './assert.ts';

const frame_world = frame('world');
const frame_body = frame('body');
const meter = unit('m');
const second = unit('s');
const secondSquared = unit('s^2');
const dynamicUnitName: string = 'm';
const literalUnitName = 'kg' as const;
const dynamicFromFunction = (name: string): string => name;
const widenedUnitName = dynamicFromFunction('s');

// @ts-expect-error dynamic string input must not be accepted
unit(dynamicUnitName);
// @ts-expect-error function-returned string is widened and must be rejected
unit(widenedUnitName);

unit(literalUnitName);
quantity(unit(literalUnitName), 1);

// @ts-expect-error widened unit should be rejected before quantity construction
quantity(unit(dynamicUnitName), 1);

const makeQuantityFromDynamic = (name: string, value: number) => {
  // @ts-expect-error helper wrappers must not permit widened unit strings
  return quantity(unit(name), value);
};
void makeQuantityFromDynamic;

type IsEqual<Left, Right> = (<Type>() => Type extends Left ? 1 : 2) extends
  (<Type>() => Type extends Right ? 1 : 2) ? true
  : false;

type AssertTrue<Value extends true> = Value;

type _assert_parse_canonical_acceleration = AssertTrue<
  IsEqual<UnitFromString<'m/s/s'>, UnitFromString<'m/s^2'>>
>;
type _assert_parse_factor_cancellation = AssertTrue<
  IsEqual<UnitFromString<'m*s/s'>, UnitFromString<'m'>>
>;
type _assert_parse_dimensionless_factor = AssertTrue<
  IsEqual<UnitFromString<'none*m'>, UnitFromString<'m'>>
>;
type _assert_mul_type_cancellation = AssertTrue<
  IsEqual<
    MulUnit<UnitFromString<'m/s'>, UnitFromString<'s'>>,
    UnitFromString<'m'>
  >
>;
type _assert_div_type_expansion = AssertTrue<
  IsEqual<
    DivUnit<UnitFromString<'m'>, UnitFromString<'s^2'>>,
    UnitFromString<'m/s^2'>
  >
>;
type _assert_mul_commutative_canonical = AssertTrue<
  IsEqual<UnitFromString<'m*s'>, UnitFromString<'s*m'>>
>;
type _assert_div_commutative_denominator = AssertTrue<
  IsEqual<UnitFromString<'kg*m/s^2'>, UnitFromString<'m*kg/s/s'>>
>;

const point_world = point3(
  frame_world,
  quantity(meter, 1),
  quantity(meter, 2),
  quantity(meter, 3),
);
const point_other_world = point3(
  frame_world,
  quantity(second, 1),
  quantity(second, 2),
  quantity(second, 3),
);
const point_body = point3(
  frame_body,
  quantity(meter, 1),
  quantity(meter, 2),
  quantity(meter, 3),
);

const delta_world = delta3(
  frame_world,
  quantity(meter, 1),
  quantity(meter, 2),
  quantity(meter, 3),
);
const delta_other_world = delta3(
  frame_world,
  quantity(second, 1),
  quantity(second, 2),
  quantity(second, 3),
);
const delta_body = delta3(
  frame_body,
  quantity(meter, 1),
  quantity(meter, 2),
  quantity(meter, 3),
);

const meters = quantity(meter, 6);
const seconds = quantity(second, 2);
const secondsSquared = quantity(secondSquared, 4);
const velocity = div(meters, seconds);
const accelerationComposed = div(velocity, seconds);
const accelerationCanonical = div(meters, secondsSquared);

assertSameUnitType(accelerationComposed, accelerationCanonical);

// @ts-expect-error velocity and acceleration units should not match
assertSameUnitType(velocity, accelerationComposed);

const area = mul(meters, meters);
const distanceRoot = sqrt(area);
assertSameUnitType(distanceRoot, meters);

// @ts-expect-error sqrt requires squared units
sqrt(meters);

addVec3(delta_world, delta_world);

// @ts-expect-error unit mismatch should fail
addVec3(delta_world, delta_other_world);

// @ts-expect-error frame mismatch should fail
addVec3(delta_world, delta_body);

addPoint3(point_world, delta_world);
subPoint3(point_world, point_world);

// @ts-expect-error cannot add point to point
addPoint3(point_world, point_world);

// @ts-expect-error point subtraction frame mismatch
subPoint3(point_world, point_body);

// @ts-expect-error point subtraction unit mismatch
subPoint3(point_world, point_other_world);

const quat_identity_body_world = quat(frame_body, frame_world, 0, 0, 0, 1);
rotateVec3ByQuat(quat_identity_body_world, delta_world);
const quat_component_x: number = quat_identity_body_world.x;
void quat_component_x;

// The `if (false)` blocks below let TypeScript type-check the enclosed code
// (validating the @ts-expect-error directive) without executing it at runtime.
// This is necessary because these calls would throw a runtime error in addition
// to being compile-time type errors — so they cannot be bare top-level
// statements like the other @ts-expect-error checks in this file.
// deno-lint-ignore no-constant-condition
if (false) {
  // @ts-expect-error quaternion component accessors are readonly
  quat_identity_body_world.x = 1;
}

// deno-lint-ignore no-constant-condition
if (false) {
  // @ts-expect-error two-frame quaternion constructor must use distinct frames
  quat(frame_world, frame_world, 0, 0, 0, 1);
}

// @ts-expect-error wrong input frame for rotation
rotateVec3ByQuat(quat_identity_body_world, delta_body);

const pose_world_world = mat4FromTranslation(frame_world, delta_world);
transformPoint3(pose_world_world, point_world);
const delta_from_pose_world = pose_world_world.translation();
addVec3(delta_from_pose_world, delta_world);

// @ts-expect-error transformPoint3 requires matrix-first argument order
transformPoint3(point_world, pose_world_world);

const pose_seconds_translation_world = mat4FromTranslation(
  frame_world,
  delta_other_world,
);

// @ts-expect-error affine transform translation unit must match point unit
transformPoint3(pose_seconds_translation_world, point_world);

// @ts-expect-error wrong point frame
transformPoint3(pose_world_world, point_body);

const pose_body_world_generic = mat4(
  frame_body,
  frame_world,
  dimensionlessUnit,
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
    1,
    0,
    0,
    1,
  ],
);

// Same pattern: if (false) guards a call that is both a type error and a
// runtime throw, so the block never executes but TypeScript still checks it.
// deno-lint-ignore no-constant-condition
if (false) {
  // @ts-expect-error two-frame matrix constructor must use distinct frames
  mat4(frame_world, frame_world, dimensionlessUnit, [
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
}

// @ts-expect-error non-linear dimensionless matrix cannot transform unitful point
transformPoint3(pose_body_world_generic, point_world);

const dir_axisz_world = dir3(
  frame_world,
  quantity(dimensionlessUnit, 0),
  quantity(dimensionlessUnit, 0),
  quantity(dimensionlessUnit, 1),
);
const pose_world_world_rot = mat4FromQuaternion(
  frame_world,
  frame_world,
  dimensionlessUnit,
  quatFromAxisAngle(frame_world, dir_axisz_world, Math.PI / 2),
);
const quat_from_pose_world_world = pose_world_world_rot.quat();
rotateVec3ByQuat(quat_from_pose_world_world, delta_world);
const quat_world_world_from_rot = quatFromRotationMatrix(
  frame_world,
  frame_world,
  pose_world_world_rot,
);
rotateVec3ByQuat(quat_world_world_from_rot, delta_world);
composeMat4(pose_world_world_rot, pose_world_world);
const pose_body_body = mat4FromTranslation(frame_body, delta_body);

// @ts-expect-error compose requires matching frame chain (outer.from == inner.to)
composeMat4(pose_world_world, pose_body_body);

// @ts-expect-error wrong destination frame tag for matrix input
quatFromRotationMatrix(frame_body, frame_world, pose_world_world_rot);

// @ts-expect-error wrong source frame tag for matrix input
quatFromRotationMatrix(frame_world, frame_body, pose_world_world_rot);

// @ts-expect-error axis-angle requires direction type, not unitful displacement
quatFromAxisAngle(frame_world, delta_world, Math.PI / 2);

// @ts-expect-error unit mismatch with non-linear matrix should fail composition
composeMat4(pose_body_world_generic, pose_world_world);

Deno.test('type-safety compile checks are loaded', () => {
  assert(true);
});
