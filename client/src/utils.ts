import { rand } from 'common-procgen-utils';
import { mimcWithRounds } from 'common-procgen-utils/dist/mimc';
import { TileType, WorldCoords, Tile } from 'common-types';

export const tileTypeToColor = {
  [TileType.UNKNOWN]: 'grey',
  [TileType.WATER]: '#3C91E6',
  [TileType.BEACH]: '#EE964B',
  [TileType.TREE]: '#0A8754',
  [TileType.CHEST]: '#53F4FF',
  [TileType.LAND]: '#0A8754',
};

export const getRandomTree = (coords: WorldCoords, width: number) => {
  const trees = ['🌲', '🌴', '🌳', '🎄'];
  const random = Math.floor(rand(4)(coords.x * width + coords.y) % trees.length);
  return trees[random];
};

export const getRaritySeed = (coords: WorldCoords, seed: number, scale: number) => {
  const hash = mimcWithRounds(4, seed)(coords.x, coords.y, scale).toString(2);
  const extracted = parseInt(hash.slice(-4), 2);
  return extracted;
};

export const seedToTileType = (perlin1: number, _perlin2: number, raritySeed: number): number => {
  if (perlin1 > 18 && raritySeed < 1) {
    return TileType.TREE;
  } else if (perlin1 > 15) {
    return TileType.LAND;
  } else if (perlin1 > 13) return TileType.BEACH;
  return TileType.WATER;
};

export const getRandomActionId = () => {
  const hex = '0123456789abcdef';

  let ret = '';
  for (let i = 0; i < 10; i += 1) {
    ret += hex[Math.floor(hex.length * Math.random())];
  }
  return ret;
};
