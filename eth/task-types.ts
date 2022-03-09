// @ts-ignore because they don't exist before first compile
import type {
  TinyWorld,
  TinyWorldGetters,
  TinyWorldRegistry,
  StubTileContract,
} from 'common-contracts/typechain';

export { TinyWorld, TinyWorldGetters, StubTileContract, TinyWorldRegistry };
export interface TinyWorldCoreReturn {
  blockNumber: number;
  contract: TinyWorld;
}

export interface LibraryContracts {
  registry: TinyWorldRegistry;
}

export interface TileContracts {
  testTileContract: StubTileContract;
  tinyFishingContract: StubTileContract;
}
