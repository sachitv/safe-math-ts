import {
  add,
  addVec3,
  composeMat4,
  delta3,
  mat4FromTranslation,
} from '../mod.ts';
import { quantity, unit } from '../src/units.ts';
import { frame } from '../src/geometry3d/types.ts';

const ITERATIONS = 1_000_000;

let sink = 0;

const consume = (value: number): void => {
  sink = value;
};

const rawComposeMat4 = (
  first: readonly number[],
  second: readonly number[],
): number[] => {
  const output = new Array<number>(16);

  for (let row = 0; row < 4; row += 1) {
    const rowOffset = row * 4;
    for (let column = 0; column < 4; column += 1) {
      output[rowOffset + column] = second[rowOffset]! * first[column]! +
        second[rowOffset + 1]! * first[column + 4]! +
        second[rowOffset + 2]! * first[column + 8]! +
        second[rowOffset + 3]! * first[column + 12]!;
    }
  }

  return output;
};

Deno.bench({
  name: 'scalar add raw (+) [baseline]',
  group: 'scalar add',
  baseline: true,
}, () => {
  const left = 1.25;
  const right = 2.75;
  let total = 0;

  for (let index = 0; index < ITERATIONS; index += 1) {
    total += left + right;
  }

  consume(total);
});

Deno.bench({ name: 'scalar add helper add()', group: 'scalar add' }, () => {
  const meters = unit('m');
  const left = quantity(meters, 1.25);
  const right = quantity(meters, 2.75);
  let total = 0;

  for (let index = 0; index < ITERATIONS; index += 1) {
    total += add(left, right);
  }

  consume(total);
});

Deno.bench({
  name: 'delta3 add raw [baseline]',
  group: 'delta3 add',
  baseline: true,
}, () => {
  const left0 = 1.0;
  const left1 = 2.0;
  const left2 = 3.0;
  const right0 = 4.0;
  const right1 = 5.0;
  const right2 = 6.0;
  let total = 0;

  for (let index = 0; index < ITERATIONS; index += 1) {
    const out0 = left0 + right0;
    const out1 = left1 + right1;
    const out2 = left2 + right2;
    total += out0 + out1 + out2;
  }

  consume(total);
});

Deno.bench({ name: 'delta3 add helper addVec3()', group: 'delta3 add' }, () => {
  const meters = unit('m');
  const world = frame('world');
  const left = delta3(
    world,
    quantity(meters, 1),
    quantity(meters, 2),
    quantity(meters, 3),
  );
  const right = delta3(
    world,
    quantity(meters, 4),
    quantity(meters, 5),
    quantity(meters, 6),
  );
  let total = 0;

  for (let index = 0; index < ITERATIONS; index += 1) {
    const out = addVec3(left, right);
    total += out[0] + out[1] + out[2];
  }

  consume(total);
});

Deno.bench({
  name: 'mat4 compose raw [baseline]',
  group: 'mat4 compose',
  baseline: true,
}, () => {
  const meters = unit('m');
  const world = frame('world');
  const translationA = delta3(
    world,
    quantity(meters, 1),
    quantity(meters, 2),
    quantity(meters, 3),
  );
  const translationB = delta3(
    world,
    quantity(meters, 4),
    quantity(meters, 5),
    quantity(meters, 6),
  );
  const first = mat4FromTranslation(world, translationA);
  const second = mat4FromTranslation(world, translationB);
  let total = 0;

  for (let index = 0; index < ITERATIONS; index += 1) {
    const out = rawComposeMat4(first, second);
    total += out[3]! + out[7]! + out[11]!;
  }

  consume(total);
});

Deno.bench({
  name: 'mat4 compose helper composeMat4()',
  group: 'mat4 compose',
}, () => {
  const meters = unit('m');
  const world = frame('world');
  const translationA = delta3(
    world,
    quantity(meters, 1),
    quantity(meters, 2),
    quantity(meters, 3),
  );
  const translationB = delta3(
    world,
    quantity(meters, 4),
    quantity(meters, 5),
    quantity(meters, 6),
  );
  const first = mat4FromTranslation(world, translationA);
  const second = mat4FromTranslation(world, translationB);
  let total = 0;

  for (let index = 0; index < ITERATIONS; index += 1) {
    const out = composeMat4(first, second);
    total += out[3] + out[7] + out[11];
  }

  consume(total);
});

consume(sink);
