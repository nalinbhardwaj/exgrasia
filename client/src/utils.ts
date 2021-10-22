import { TileType } from 'common-types';

export const tileTypeToColor = {
  [TileType.UNKNOWN]: 'grey',
  [TileType.WATER]: 'blue',
  [TileType.LAND]: 'green',
};

export const perlinToTileType = (perlin: number) => {
  return perlin > 15 ? TileType.WATER : TileType.LAND;
};
