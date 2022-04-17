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
import {
  TESTING_CONTRACT_ADDRESS,
  FISHING_CONTRACT_ADDRESS,
  OPENSEA_MARKET_CONTRACT_ADDRESS,
  FARM_CONTRACT_ADDRESS,
  WHEAT_CONTRACT_ADDRESS,
  CORN_CONTRACT_ADDRESS,
  CACTUS_CONTRACT_ADDRESS,
  RANCH_CONTRACT_ADDRESS,
  MILK_CONTRACT_ADDRESS,
  EGG_CONTRACT_ADDRESS,
  MINE_CONTRACT_ADDRESS,
  IRON_CONTRACT_ADDRESS,
  GOLD_CONTRACT_ADDRESS,
  DIAMOND_CONTRACT_ADDRESS,
  QUEST_MASTER_CONTRACT_ADDRESS,
  CAMPFIRE_CONTRACT_ADDRESS,
} from 'common-contracts';

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

export const getRandomMotionMessage = (): string => {
  const messages = [
    ' checking for insects',
    ' tightening shoelaces',
    ' eating berries',
    ' refilling water',
    ' brushing off dirt',
    ' testing flashlight',
    ' wiping sweat beads',
    ' gripping shoulder straps',
    ' surveying the lands',
  ];
  return messages[Math.floor(Math.random() * messages.length)];
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

export const promiseWithTimeout = function <T>(
  promise: Promise<T>,
  ms: number,
  timeoutError = new Error('Promise timed out')
): Promise<T> {
  // create a promise that rejects in milliseconds
  const timeout = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(timeoutError);
    }, ms);
  });

  // returns a race between timeout and the passed promise
  return Promise.race<T>([promise, timeout]);
};

export const whitelistedContracts = (): { [key: string]: string } => {
  return {
    'Tiny Fishing Stand': FISHING_CONTRACT_ADDRESS,
    'Tiny OpenSea Fish Market': OPENSEA_MARKET_CONTRACT_ADDRESS,
    'Tiny Farm': FARM_CONTRACT_ADDRESS,
    'Tiny Wheat': WHEAT_CONTRACT_ADDRESS,
    'Tiny Corn': CORN_CONTRACT_ADDRESS,
    'Tiny Cactus': CACTUS_CONTRACT_ADDRESS,
    'Tiny Ranch': RANCH_CONTRACT_ADDRESS,
    'Tiny Milk': MILK_CONTRACT_ADDRESS,
    'Tiny Egg': EGG_CONTRACT_ADDRESS,
    'Tiny Mine': MINE_CONTRACT_ADDRESS,
    'Tiny Iron': IRON_CONTRACT_ADDRESS,
    'Tiny Gold': GOLD_CONTRACT_ADDRESS,
    'Tiny Diamond': DIAMOND_CONTRACT_ADDRESS,
    'Tiny Quest Master': QUEST_MASTER_CONTRACT_ADDRESS,
    'Tiny Campfire': CAMPFIRE_CONTRACT_ADDRESS,
  };
};
