// @ts-ignore because they don't exist before first compile
import type { TinyWorld, TinyWorldGetters } from 'common-contracts/typechain';

export { TinyWorld, TinyWorldGetters };

export interface TinyWorldCoreReturn {
  blockNumber: number;
  contract: TinyWorld;
}
