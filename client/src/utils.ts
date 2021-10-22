import { TileType } from 'common-types';

export const tileTypeToColor = {
  [TileType.UNKNOWN]: 'grey',
  [TileType.WATER]: 'blue',
  [TileType.LAND]: 'green',
};

export const perlinToTileType = (perlin: number) => {
  return perlin > 15 ? TileType.LAND : TileType.WATER;
};

export const getRandomActionId = () => {
  const hex = '0123456789abcdef';

  let ret = '';
  for (let i = 0; i < 10; i += 1) {
    ret += hex[Math.floor(hex.length * Math.random())];
  }
  return ret;
};
