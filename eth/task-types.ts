// @ts-ignore because they don't exist before first compile
import type {
  TinyWorld,
  TinyWorldGetters,
  Verifier,
  TinyWorldRegistry,
  StubTileContract,
} from 'common-contracts/typechain';

export { TinyWorld, TinyWorldGetters, Verifier, StubTileContract, TinyWorldRegistry };
export interface TinyWorldCoreReturn {
  blockNumber: number;
  contract: TinyWorld;
}

export interface LibraryContracts {
  verifier: Verifier;
  tileContract: StubTileContract;
  registry: TinyWorldRegistry;
}
