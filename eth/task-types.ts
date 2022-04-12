// @ts-ignore because they don't exist before first compile
import type {
  TinyWorld,
  TinyWorldGetters,
  TinyWorldRegistry,
  StubTileContract,
  TinyFarm,
  Perlin,
  TinyQuestMaster,
} from 'common-contracts/typechain';

export {
  TinyWorld,
  TinyWorldGetters,
  StubTileContract,
  TinyWorldRegistry,
  Perlin,
  TinyFarm,
  TinyQuestMaster,
};
export interface TinyWorldCoreReturn {
  blockNumber: number;
  contract: TinyWorld;
}

export interface LibraryContracts {
  registry: TinyWorldRegistry;
  perlin: Perlin;
}

export interface TileContracts {
  testTileContract: StubTileContract;
  tinyFishingContract: StubTileContract;
  tinyOpenSeaContract: StubTileContract;
  tinyFarmContract: StubTileContract;
  tinyWheatContract: StubTileContract;
  tinyCornContract: StubTileContract;
  tinyCactusContract: StubTileContract;
  tinyRanchContract: StubTileContract;
  tinyMilkContract: StubTileContract;
  tinyEggContract: StubTileContract;
  tinyMineContract: StubTileContract;
  tinyIronContract: StubTileContract;
  tinyGoldContract: StubTileContract;
  tinyDiamondContract: StubTileContract;
}
