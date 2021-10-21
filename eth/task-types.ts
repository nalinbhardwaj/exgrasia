// @ts-ignore because they don't exist before first compile
import type { Valhalla, ValhallaGetters } from 'common-contracts/typechain';

export { Valhalla, ValhallaGetters };

export interface ValhallaCoreReturn {
  blockNumber: number;
  contract: Valhalla;
}
