// @ts-ignore because they don't exist before first compile
import type {
  TinyWorld,
  TinyWorldGetters,
  TinyWorldRegistry,
  StubTileContract,
  Perlin,
} from 'common-contracts/typechain';

export { TinyWorld, TinyWorldGetters, StubTileContract, TinyWorldRegistry, Perlin };
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
  tinyFarmContract: StubTileContract;
  tinyMineContract: StubTileContract;
}
