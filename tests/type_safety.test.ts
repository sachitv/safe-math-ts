import {
  addPoint3,
  addVec3,
  composeMat4,
  delta3,
  dimensionlessUnit,
  dir3,
  frame,
  mat4,
  mat4FromQuaternion,
  mat4FromTranslation,
  point3,
  quantity,
  quat,
  quatFromAxisAngle,
  rotateVec3ByQuat,
  subPoint3,
  transformPoint3,
  unit,
} from '../mod.ts';
import { assert } from './assert.test.ts';

const frame_world = frame('world');
const frame_body = frame('body');
const meter = unit('m');
const second = unit('s');

const point_world = point3(
  frame_world,
  quantity(meter, 1),
  quantity(meter, 2),
  quantity(meter, 3),
);
const point_seconds_world = point3(
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
const delta_seconds_world = delta3(
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

addVec3(delta_world, delta_world);

// @ts-expect-error unit mismatch should fail
addVec3(delta_world, delta_seconds_world);

// @ts-expect-error frame mismatch should fail
addVec3(delta_world, delta_body);

addPoint3(point_world, delta_world);
subPoint3(point_world, point_world);

// @ts-expect-error cannot add point to point
addPoint3(point_world, point_world);

// @ts-expect-error point subtraction frame mismatch
subPoint3(point_world, point_body);

// @ts-expect-error point subtraction unit mismatch
subPoint3(point_world, point_seconds_world);

const quat_identity_body_world = quat(frame_body, frame_world, 0, 0, 0, 1);
rotateVec3ByQuat(quat_identity_body_world, delta_world);

// @ts-expect-error wrong input frame for rotation
rotateVec3ByQuat(quat_identity_body_world, delta_body);

const pose_world_world = mat4FromTranslation(frame_world, delta_world);
transformPoint3(pose_world_world, point_world);

// @ts-expect-error wrong point frame
transformPoint3(pose_world_world, point_body);

const pose_world_world_dimensionless = mat4(
  frame_world,
  frame_world,
  dimensionlessUnit,
  [
    1,
    0,
    0,
    1,
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
);

// @ts-expect-error non-linear dimensionless matrix cannot transform unitful point
transformPoint3(pose_world_world_dimensionless, point_world);

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
composeMat4(pose_world_world_rot, pose_world_world);

// @ts-expect-error axis-angle requires direction type, not unitful displacement
quatFromAxisAngle(frame_world, delta_world, Math.PI / 2);

// @ts-expect-error unit mismatch with non-linear matrix should fail composition
composeMat4(pose_world_world_dimensionless, pose_world_world);

Deno.test('type-safety compile checks are loaded', () => {
  assert(true);
});
