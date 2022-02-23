// @ts-ignore because they don't exist before first compile
import type {
  TinyWorld,
  TinyWorldGetters,
  Verifier,
  TestTileContract,
} from 'common-contracts/typechain';

export { TinyWorld, TinyWorldGetters, Verifier, TestTileContract };
export interface TinyWorldCoreReturn {
  blockNumber: number;
  contract: TinyWorld;
}

export interface LibraryContracts {
  verifier: Verifier;
  tileContract: TestTileContract;
}
