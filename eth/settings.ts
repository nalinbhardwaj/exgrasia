import * as path from 'path';
import resolvePackage from 'resolve-package-path';

// HRE stuff
import 'hardhat/types/runtime';

declare module 'hardhat/types/runtime' {
  interface HardhatRuntimeEnvironment {
    DEPLOYER_MNEMONIC: string | undefined;
    ADMIN_PUBLIC_ADDRESS: string | undefined;

    packageDirs: {
      'common-contracts': string;
    };

    contracts: {
      /**
       * Network info
       */
      NETWORK: string;
      NETWORK_ID: number;
      START_BLOCK: number;

      /**
       * Contract addrs
       */
      CORE_CONTRACT_ADDRESS: string;
      GETTERS_CONTRACT_ADDRESS: string;
    };
  }
}

// Resolve workspace package directories
export function resolvePackageDir(pkg: string) {
  const contractsPkg = resolvePackage(pkg, __dirname);
  if (!contractsPkg) {
    throw new Error(`Unable to find the ${pkg} package. Exiting...`);
  }
  return path.dirname(contractsPkg);
}
