import { rand } from '@darkforest_eth/hashing';
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

export const isRare = (coords: WorldCoords, width: number) => {
  return rand(4)(coords.x * width + coords.y) < 1;
};

export const perlinToTileType = (coords: WorldCoords, perlin: number, width: number): number => {
  if (perlin > 15) {
    if (perlin > 18 && isRare(coords, width)) {
      return TileType.TREE;
    }
    return TileType.LAND;
  } else if (perlin > 13) return TileType.BEACH;
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
