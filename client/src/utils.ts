import { rand } from 'common-procgen-utils';
import { mimcWithRounds } from 'common-procgen-utils/dist/mimc';
import {
  TileType,
  WorldCoords,
  Tile,
  AltitudeType,
  TemperatureType,
  address,
  EthAddress,
} from 'common-types';
import { ethers } from 'ethers';
import { keccak256, toUtf8Bytes } from 'ethers/lib/utils';

export const tileTypeToColor = {
  [TileType.UNKNOWN]: 'grey',
  [TileType.WATER]: '#3C91E6',
  [TileType.SAND]: '#EFDD6F',
  [TileType.TREE]: '#0A8754', //
  [TileType.STUMP]: '#0A8754', //
  [TileType.CHEST]: '#53F4FF', //
  [TileType.FARM]: '#0A8754',
  [TileType.WINDMILL]: '#0A8754', //
  [TileType.GRASS]: '#0A8754',
  [TileType.SNOW]: '#FFFAFA',
  [TileType.STONE]: '#918E85',
  [TileType.ICE]: '#D6FFFA', //
};

export const getRandomTree = (coords: WorldCoords, width: number) => {
  const trees = ['🌲', '🌴', '🌳', '🎄'];
  const random = 1;
  return trees[random];
};

export const getTileEmoji = (tile: Tile, width: number) => {
  return '';
};

export const seedToTileAttrs = (
  coords: WorldCoords,
  perlin1: number,
  perlin2: number
): { tileType: TileType; altitudeType: AltitudeType; temperatureType: TemperatureType } => {
  const height = perlin1;
  let temperature = perlin2;
  temperature += Math.floor((coords.x - 50) / 2);

  let altitudeType = AltitudeType.SEA;
  if (height > 40) {
    altitudeType = AltitudeType.MOUNTAINTOP;
  } else if (height > 37) {
    altitudeType = AltitudeType.MOUNTAIN;
  } else if (height > 32) {
    altitudeType = AltitudeType.LAND;
  } else if (height > 30) {
    altitudeType = AltitudeType.BEACH;
  }

  let temperatureType = TemperatureType.COLD;
  if (temperature > 42) {
    temperatureType = TemperatureType.HOT;
  } else if (temperature > 22) {
    temperatureType = TemperatureType.NORMAL;
  }

  let tileType = TileType.UNKNOWN;

  if (temperatureType === TemperatureType.COLD) {
    if (altitudeType === AltitudeType.MOUNTAINTOP) {
      tileType = TileType.SNOW;
    } else if (altitudeType === AltitudeType.MOUNTAIN) {
      tileType = TileType.SNOW;
    } else if (altitudeType === AltitudeType.LAND) {
      tileType = TileType.SNOW;
    } else if (altitudeType === AltitudeType.BEACH) {
      tileType = TileType.SNOW;
    } else {
      tileType = TileType.WATER;
    }
  } else if (temperatureType === TemperatureType.NORMAL) {
    if (altitudeType === AltitudeType.MOUNTAINTOP) {
      tileType = TileType.SNOW;
    } else if (altitudeType === AltitudeType.MOUNTAIN) {
      tileType = TileType.STONE;
    } else if (altitudeType === AltitudeType.LAND) {
      tileType = TileType.GRASS;
    } else if (altitudeType === AltitudeType.BEACH) {
      tileType = TileType.SAND;
    } else {
      tileType = TileType.WATER;
    }
  } else {
    if (altitudeType === AltitudeType.MOUNTAINTOP) {
      tileType = TileType.STONE;
    } else if (altitudeType === AltitudeType.MOUNTAIN) {
      tileType = TileType.SAND;
    } else if (altitudeType === AltitudeType.LAND) {
      tileType = TileType.SAND;
    } else if (altitudeType === AltitudeType.BEACH) {
      tileType = TileType.SAND;
    } else {
      tileType = TileType.WATER;
    }
  }
  return { tileType, temperatureType, altitudeType };
};

export const getRandomActionId = () => {
  const hex = '0123456789abcdef';

  let ret = '';
  for (let i = 0; i < 10; i += 1) {
    ret += hex[Math.floor(hex.length * Math.random())];
  }
  return ret;
};

export const nullAddress = address('0x0000000000000000000000000000000000000000');

export const generatePrivateKey = (entropy: string) => {
  const privateKey = keccak256(toUtf8Bytes(entropy));
  return privateKey;
};

const provider = new ethers.providers.InfuraProvider('mainnet', '661cfe1251ae47d2a6cd6d883750f357');

export const fetchENS = async (address: EthAddress) => {
  return provider.lookupAddress(address);
};

export const prettifyAddress = async (address: EthAddress) => {
  const ens = await fetchENS(address);
  console.log('ens', ens);
  if (ens) {
    return ens;
  }
  return address.slice(0, 6) + '...' + address.slice(-4);
};

export const distance = (a: WorldCoords, b: WorldCoords) => {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
};
