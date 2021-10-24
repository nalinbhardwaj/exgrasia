/**
 * This package contains MiMC hashing utilities for use with Dark Forest.
 * The MiMC algorithm is used for both finding planet hashes and calculating
 * the perlin in-game. Among other things, these values are often needed for
 * generating Snarks.
 *
 * ## Installation
 *
 * You can install this package using [`npm`](https://www.npmjs.com) or
 * [`yarn`](https://classic.yarnpkg.com/lang/en/) by running:
 *
 * ```bash
 * npm install --save @darkforest_eth/hashing
 * ```
 * ```bash
 * yarn add @darkforest_eth/hashing
 * ```
 *
 * When using this in a plugin, you might want to load it with [skypack](https://www.skypack.dev)
 *
 * ```js
 * import * as hashing from 'http://cdn.skypack.dev/@darkforest_eth/hashing'
 * ```
 *
 * @packageDocumentation
 */
import { fakeHash, seededRandom } from './fakeHash';
import { Fraction } from './fractions/bigFraction.js';
import mimcHash, { modPBigInt, modPBigIntNative } from './mimc';
import {
  getRandomGradientAt,
  IntegerVector,
  MAX_PERLIN_VALUE,
  perlin,
  PerlinConfig,
  rand,
} from './perlin';

export {
  mimcHash,
  PerlinConfig,
  IntegerVector,
  perlin,
  rand,
  getRandomGradientAt,
  modPBigInt,
  modPBigIntNative,
  fakeHash,
  seededRandom,
  Fraction,
  MAX_PERLIN_VALUE,
};
