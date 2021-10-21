import * as path from 'path';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { HardhatUserConfig, extendEnvironment } from 'hardhat/config';
import '@nomiclabs/hardhat-ethers';
import '@openzeppelin/hardhat-upgrades';
import 'hardhat-typechain';
import 'hardhat-contract-sizer';
import * as settings from './settings';

import './tasks/utils';
import './tasks/deploy';
import './tasks/wallet';
import './tasks/upgrade';
import './tasks/compile';

require('dotenv').config();

const { DEPLOYER_MNEMONIC, ADMIN_PUBLIC_ADDRESS } = process.env;

// Ensure we can lookup the needed workspace packages
const packageDirs = {
  'common-contracts': settings.resolvePackageDir('common-contracts'),
};

extendEnvironment((env: HardhatRuntimeEnvironment) => {
  env.DEPLOYER_MNEMONIC = DEPLOYER_MNEMONIC;
  env.ADMIN_PUBLIC_ADDRESS = ADMIN_PUBLIC_ADDRESS;

  env.packageDirs = packageDirs;

  env.contracts = require(`common-contracts`);
});

// The xdai config, but it isn't added to networks unless we have a DEPLOYER_MNEMONIC
const xdai = {
  url: 'https://rpc.xdaichain.com/',
  accounts: {
    mnemonic: DEPLOYER_MNEMONIC,
  },
  chainId: 100,
};

// The mainnet config, but it isn't added to networks unless we have a DEPLOYER_MNEMONIC
const mainnet = {
  // Brian's Infura Valhalla endpoint (free tier)
  url: 'https://mainnet.infura.io/v3/446b71241bef422f839afdc0a444bf57',
  accounts: {
    mnemonic: DEPLOYER_MNEMONIC,
  },
  chainId: 1,
};

const config: HardhatUserConfig = {
  defaultNetwork: 'hardhat',
  networks: {
    // Check for a DEPLOYER_MNEMONIC before we add xdai/mainnet network to the list of networks
    // Ex: If you try to deploy to xdai without DEPLOYER_MNEMONIC, you'll see this error:
    // > Error HH100: Network xdai doesn't exist
    ...(DEPLOYER_MNEMONIC ? { xdai } : undefined),
    ...(DEPLOYER_MNEMONIC ? { mainnet } : undefined),
    localhost: {
      url: 'http://localhost:8545/',
      accounts: {
        // Same mnemonic used in the .env.example
        mnemonic: 'change typical hire slam amateur loan grid fix drama electric seed label',
      },
      chainId: 31337,
    },
    // Used when you dont specify a network on command line, like in tests
    hardhat: {
      accounts: [
        // from/deployer is default the first address in accounts
        {
          privateKey: '0x044C7963E9A89D4F8B64AB23E02E97B2E00DD57FCB60F316AC69B77135003AEF',
          balance: '100000000000000000000',
        },
        // user1 in tests
        {
          privateKey: '0x523170AAE57904F24FFE1F61B7E4FF9E9A0CE7557987C2FC034EACB1C267B4AE',
          balance: '100000000000000000000',
        },
        // user2 in tests
        {
          privateKey: '0x67195c963ff445314e667112ab22f4a7404bad7f9746564eb409b9bb8c6aed32',
          balance: '100000000000000000000',
        },
      ],
      blockGasLimit: 16777215,
    },
  },
  solidity: {
    version: '0.8.4',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  contractSizer: {
    alphaSort: true,
    runOnCompile: false,
    disambiguatePaths: false,
  },
  typechain: {
    outDir: path.join(packageDirs['common-contracts'], 'typechain'),
  },
};

export default config;
