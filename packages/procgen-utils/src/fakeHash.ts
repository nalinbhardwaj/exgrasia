import bigInt from 'big-integer';

/**
 * Generate a random number based on some seed. Useful for procedural generation.
 *
 * @param seed The seed of the random number.
 */
export function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

type IdxWithRand = {
  idx: number;
  rand: number;
};

const SIZE = 65536; // we permute 256x256 grids of 256x256 mega-chunks
let globalSeed = 1;

const globalRandom = () => {
  return seededRandom(globalSeed++);
};

const arr: IdxWithRand[] = [];
for (let i = 0; i < SIZE; i += 1) {
  arr.push({
    idx: i,
    rand: globalRandom(),
  });
}
arr.sort((a, b) => a.rand - b.rand);
const lookup = arr.map((a) => a.idx);
const lookupInv = Array(SIZE).fill(0);
for (let i = 0; i < SIZE; i += 1) {
  lookupInv[lookup[i]] = i;
}

// return the number in [0, n) congruent to m (mod n)
const posMod = (m: number, n: number) => {
  const val = Math.floor(m / n) * n;
  return m - val;
};

// permutation by lookup table
const sigma = (x: number, y: number) => {
  const val = 256 * x + y;
  const idx = posMod(val, SIZE);
  const ret: [number, number] = [Math.floor(lookup[idx] / 256), lookup[idx] % 256];
  return ret;
};

// cyclic permutation
const cyc = (m: number, n: number) => (r: number, s: number) => {
  const val = posMod(256 * (r + m) + (s + n), SIZE);
  const ret: [number, number] = [Math.floor(val / 256), val % 256];
  return ret;
};

// 4/65536 in a 256x256 square are valid planets
// then generate the rest of the string pseudorandomly
/**
 * @hidden
 */
export const fakeHash = (x: number, y: number) => {
  const m = Math.floor(x / 256);
  const r = x - m * 256;
  const n = Math.floor(y / 256);
  const s = y - n * 256;
  const [mPrime, nPrime] = sigma(m, n);
  const [xPrime, yPrime] = sigma(...cyc(mPrime, nPrime)(...sigma(r, s)));
  const validPlanet = xPrime === 0 && yPrime < 4;
  // first four bytes
  let hash = validPlanet ? '00000000' : '1eadbeef';
  // next 28 bytes, generated 4 at a time. deterministically generated from x, y
  const [rPrime, sPrime] = sigma(r, s);
  const seed = 256 ** 3 * mPrime + 256 ** 2 * rPrime + 256 * nPrime + sPrime;
  for (let i = 0; i < 7; i += 1) {
    const rand = Math.floor(seededRandom(seed + i) * 2 ** 32);
    let append = rand.toString(16);
    while (append.length < 8) {
      append = '0' + append;
    }
    hash += append;
  }
  return bigInt(hash, 16);
};
