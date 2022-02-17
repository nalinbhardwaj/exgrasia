import { rand } from 'common-procgen-utils';
import { mimcWithRounds } from 'common-procgen-utils/dist/mimc';
import { TileType, WorldCoords, Tile } from 'common-types';

export const tileTypeToColor = {
  [TileType.UNKNOWN]: 'grey',
  [TileType.WATER]: '#3C91E6',
  [TileType.SAND]: '#EFDD6F',
  [TileType.TREE]: '#0A8754',
  [TileType.STUMP]: '#0A8754',
  [TileType.CHEST]: '#53F4FF',
  [TileType.FARM]: '#0A8754',
  [TileType.WINDMILL]: '#0A8754',
  [TileType.GRASS]: '#0A8754',
  [TileType.SNOW]: '#FFFAFA',
  [TileType.STONE]: '#918E85',
  [TileType.ICE]: '#D6FFFA',
};

export const getRandomTree = (coords: WorldCoords, width: number) => {
  const trees = ['🌲', '🌴', '🌳', '🎄'];
  const random = 1;
  return trees[random];
};

export const getRaritySeed = (coords: WorldCoords, seed: number, scale: number) => {
  const hash = mimcWithRounds(4, seed)(coords.x, coords.y, scale).toString(2);
  const extracted = parseInt(hash.slice(-4), 2);
  return extracted;
};

export const getTileEmoji = (tile: Tile, width: number) => {
  return '';
};

enum ALTITUDE {
  SEA,
  BEACH,
  LAND,
  MOUNTAIN,
  MOUNTAINTOP,
}

enum TEMPERATURE {
  COLD,
  NORMAL,
  HOT,
}

export const seedToTileType = (
  coords: WorldCoords,
  perlin1: number,
  perlin2: number,
  raritySeed: number
): number => {
  const height = perlin1;
  let temperature = perlin2;
  temperature += Math.floor((coords.x - 50) / 2);

  let altitudeType = ALTITUDE.SEA;
  if (height > 40) {
    altitudeType = ALTITUDE.MOUNTAINTOP;
  } else if (height > 37) {
    altitudeType = ALTITUDE.MOUNTAIN;
  } else if (height > 32) {
    altitudeType = ALTITUDE.LAND;
  } else if (height > 30) {
    altitudeType = ALTITUDE.BEACH;
  }

  let temperatureType = TEMPERATURE.COLD;
  if (temperature > 42) {
    temperatureType = TEMPERATURE.HOT;
  } else if (temperature > 22) {
    temperatureType = TEMPERATURE.NORMAL;
  }

  if (temperatureType === TEMPERATURE.COLD) {
    if (altitudeType === ALTITUDE.MOUNTAINTOP) {
      return TileType.SNOW;
    } else if (altitudeType === ALTITUDE.MOUNTAIN) {
      return TileType.SNOW;
    } else if (altitudeType === ALTITUDE.LAND) {
      return TileType.SNOW;
    } else if (altitudeType === ALTITUDE.BEACH) {
      if (raritySeed < 12) {
        return TileType.ICE;
      }
      return TileType.SNOW;
    } else {
      if (raritySeed < 2) {
        return TileType.ICE;
      }
      return TileType.WATER;
    }
  } else if (temperatureType === TEMPERATURE.NORMAL) {
    if (altitudeType === ALTITUDE.MOUNTAINTOP) {
      return TileType.SNOW;
    } else if (altitudeType === ALTITUDE.MOUNTAIN) {
      return TileType.STONE;
    } else if (altitudeType === ALTITUDE.LAND) {
      if (raritySeed < 1) {
        return TileType.TREE;
      }
      return TileType.GRASS;
    } else if (altitudeType === ALTITUDE.BEACH) {
      return TileType.SAND;
    } else {
      return TileType.WATER;
    }
  } else {
    if (altitudeType === ALTITUDE.MOUNTAINTOP) {
      return TileType.STONE;
    } else if (altitudeType === ALTITUDE.MOUNTAIN) {
      if (raritySeed < 8) {
        return TileType.STONE;
      }
      return TileType.SAND;
    } else if (altitudeType === ALTITUDE.LAND) {
      return TileType.SAND;
    } else if (altitudeType === ALTITUDE.BEACH) {
      if (raritySeed < 6) {
        return TileType.GRASS;
      }
      return TileType.SAND;
    } else {
      return TileType.WATER;
    }
  }
};

export const getRandomActionId = () => {
  const hex = '0123456789abcdef';

  let ret = '';
  for (let i = 0; i < 10; i += 1) {
    ret += hex[Math.floor(hex.length * Math.random())];
  }
  return ret;
};
