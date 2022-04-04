import { subtask, task, types } from 'hardhat/config';
import { FactoryOptions, HardhatRuntimeEnvironment } from 'hardhat/types';
import * as fs from 'fs';
import * as path from 'path';
import type {
  TinyWorld,
  TinyWorldGetters,
  TinyWorldCoreReturn,
  LibraryContracts,
  StubTileContract,
  TinyWorldRegistry,
  TileContracts,
  Perlin,
} from '../task-types';
import * as prettier from 'prettier';
import { Signer, Contract } from 'ethers';
// import { any } from '@openzeppelin/hardhat-upgrades/dist/deploy-proxy';
import { TransactionMinedTimeout } from '@openzeppelin/upgrades-core';

task('deploy', 'deploy all contracts').setAction(deploy);

async function deploy(_args: {}, hre: HardhatRuntimeEnvironment) {
  // need to force a compile for tasks
  await hre.run('compile');

  // deploy libraries
  const libraries: LibraryContracts = await hre.run('deploy:libraries');
  // deploy the core contract
  const tinyWorldCoreReturn: TinyWorldCoreReturn = await hre.run('deploy:core', {
    registryAddress: libraries.registry.address,
    perlinAddress: libraries.perlin.address,
  });

  const coreAddress = tinyWorldCoreReturn.contract.address;
  console.log('TinyWorldCore deployed to:', coreAddress);

  const tinyWorldGetters: TinyWorldGetters = await hre.run('deploy:getters', {
    coreAddress,
  });

  const tileContracts: TileContracts = await hre.run('deploy:tileContracts', {
    coreAddress,
    perlinAddress: libraries.perlin.address,
  });

  const gettersAddress = tinyWorldGetters.address;

  await hre.run('deploy:save', {
    coreBlockNumber: tinyWorldCoreReturn.blockNumber,
    registryAddress: libraries.registry.address,
    coreAddress,
    gettersAddress,
    testTileContractAddress: tileContracts.testTileContract.address,
    tinyFishContractAddress: tileContracts.tinyFishingContract.address,
    tinyFarmContractAddress: tileContracts.tinyFarmContract.address,
    tinyMineContractAddress: tileContracts.tinyMineContract.address,
  });

  // give all contract administration over to an admin address if was provided
  if (hre.ADMIN_PUBLIC_ADDRESS) {
    await hre.upgrades.admin.transferProxyAdminOwnership(hre.ADMIN_PUBLIC_ADDRESS);
  }

  console.log('Deployed successfully. Godspeed cadet.');
}

subtask('deploy:save').setAction(deploySave);

async function deploySave(
  args: {
    coreBlockNumber: number;
    coreAddress: string;
    gettersAddress: string;
    registryAddress: string;
    testTileContractAddress: string;
    tinyFishContractAddress: string;
    tinyFarmContractAddress: string;
    tinyMineContractAddress: string;
  },
  hre: HardhatRuntimeEnvironment
) {
  const isDev = hre.network.name === 'localhost';

  const contractsFile = path.join(hre.packageDirs['common-contracts'], 'index.ts');

  const options = prettier.resolveConfig.sync(contractsFile);

  // Save the addresses of the deployed contracts to the `common-contracts` package
  const addrFileContents = prettier.format(
    `
  /**
   * This package contains deployed contract addresses, ABIs, and Typechain types
   * for TinyWorld.
   *
   * ## Installation
   *
   * These contracts are not currently published online, but in the future may
   * be made available on NPM or Skypack.
   *
   * ## Typechain
   *
   * The Typechain types can be found in the \`typechain\` directory.
   *
   * ## ABIs
   *
   * The contract ABIs can be found in the \`abis\` directory.
   *
   * @packageDocumentation
   */

  /**
   * The name of the network where these contracts are deployed.
   */
  export const NETWORK = '${hre.network.name}';
  /**
   * The id of the network where these contracts are deployed.
   */
  export const NETWORK_ID = ${hre.network.config.chainId};
  /**
   * The block in which the TinyWorld contract was deployed.
   */
  export const START_BLOCK = ${isDev ? 0 : args.coreBlockNumber};
  /**
   * The address for the TinyWorld contract.
   */
  export const CORE_CONTRACT_ADDRESS = '${args.coreAddress}';
  /**
   * The address for the TinyWorldGetters contract.
   */
  export const GETTERS_CONTRACT_ADDRESS = '${args.gettersAddress}';
  /**
   * The address for the TinyWorldRegistry contract.
   */
  export const REGISTRY_CONTRACT_ADDRESS = '${args.registryAddress}';
  /**
   * The addresses for the Tile contracts.
   */
   export const TESTING_CONTRACT_ADDRESS = '${args.testTileContractAddress}';
   export const FISHING_CONTRACT_ADDRESS = '${args.tinyFishContractAddress}';
   export const FARM_CONTRACT_ADDRESS = '${args.tinyFarmContractAddress}';
   export const MINE_CONTRACT_ADDRESS = '${args.tinyMineContractAddress}';
   `,
    { ...options, parser: 'babel-ts' }
  );

  fs.writeFileSync(contractsFile, addrFileContents);
}

subtask('deploy:libraries', 'deploy and return tokens contract').setAction(deployLibraries);

async function deployLibraries({}, hre: HardhatRuntimeEnvironment): Promise<LibraryContracts> {
  const PerlinContract = await hre.ethers.getContractFactory('Perlin');
  const perlin = await PerlinContract.deploy();
  await perlin.deployTransaction.wait();

  const TinyWorldRegistry = await hre.ethers.getContractFactory('TinyWorldRegistry');
  const registry = await TinyWorldRegistry.deploy();
  await registry.deployTransaction.wait();

  return {
    registry: registry as TinyWorldRegistry,
    perlin: perlin as Perlin,
  };
}

subtask('deploy:core', 'deploy and return tokens contract')
  .addParam('registryAddress', '', undefined, types.string)
  .addParam('perlinAddress', '', undefined, types.string)
  .setAction(deployCore);

async function deployCore(
  args: {
    registryAddress: string;
    perlinAddress: string;
  },
  hre: HardhatRuntimeEnvironment
): Promise<TinyWorldCoreReturn> {
  const tinyWorldCore = await deployProxyWithRetry<TinyWorld>({
    contractName: 'TinyWorld',
    signerOrOptions: {
      libraries: {
        Perlin: args.perlinAddress,
      },
    },
    contractArgs: [
      hre.initializers.SEED_1,
      hre.initializers.WORLD_WIDTH,
      hre.initializers.WORLD_SCALE,
      args.registryAddress,
    ],
    // Linking external libraries like `DarkForestUtils` is not yet supported, or
    // skip this check with the `unsafeAllowLinkedLibraries` flag
    deployOptions: { unsafeAllowLinkedLibraries: true },
    retries: 5,
    hre,
  });

  const blockNumber = await (await tinyWorldCore.deployTransaction.wait()).blockNumber;

  console.log((await tinyWorldCore.seed()).toNumber());

  return {
    // should be impossible to not exist since we waited on it in deployProxyWithRetry
    blockNumber,
    contract: tinyWorldCore,
  };
}

subtask('deploy:getters', 'deploy and return getters')
  .addParam('coreAddress', '', undefined, types.string)
  .setAction(deployGetters);

async function deployGetters(
  args: {
    coreAddress: string;
  },
  hre: HardhatRuntimeEnvironment
): Promise<TinyWorldGetters> {
  return deployProxyWithRetry<TinyWorldGetters>({
    contractName: 'TinyWorldGetters',
    signerOrOptions: {},
    contractArgs: [args.coreAddress],
    deployOptions: {},
    retries: 5,
    hre,
  });
}

subtask('deploy:tileContracts', 'deploy and return tile contracts')
  .addParam('coreAddress', '', undefined, types.string)
  .addParam('perlinAddress', '', undefined, types.string)
  .setAction(deployTileContracts);

async function deployTileContracts(
  args: {
    coreAddress: string;
    perlinAddress: string;
  },
  hre: HardhatRuntimeEnvironment
): Promise<TileContracts> {
  const TileContractFactory = await hre.ethers.getContractFactory('TestTileContract');
  const tileContract = await TileContractFactory.deploy();
  await tileContract.deployTransaction.wait();

  const TinyFishingContractFactory = await hre.ethers.getContractFactory('TinyFish');
  const tinyFishingContract = await TinyFishingContractFactory.deploy(args.coreAddress);
  await tinyFishingContract.deployTransaction.wait();

  const TinyFarmContractFactory = await hre.ethers.getContractFactory('TinyFarm');
  const tinyFarmContract = await TinyFarmContractFactory.deploy(args.coreAddress);
  await tinyFarmContract.deployTransaction.wait();

  const TinyMineContractFactory = await hre.ethers.getContractFactory('TinyMine', {
    libraries: {
      Perlin: args.perlinAddress,
    },
  });
  const tinyMineContract = await TinyMineContractFactory.deploy(args.coreAddress);
  await tinyMineContract.deployTransaction.wait();

  return {
    testTileContract: tileContract as StubTileContract,
    tinyFishingContract: tinyFishingContract as StubTileContract,
    tinyFarmContract: tinyFarmContract as StubTileContract,
    tinyMineContract: tinyMineContract as StubTileContract,
  };
}

async function deployProxyWithRetry<C extends Contract>({
  contractName,
  signerOrOptions,
  contractArgs,
  deployOptions,
  hre,
  retries,
}: {
  contractName: string;
  signerOrOptions: Signer | FactoryOptions | undefined;
  contractArgs: unknown[];
  deployOptions: any;
  hre: HardhatRuntimeEnvironment;
  retries: number;
}): Promise<C> {
  try {
    const factory = await hre.ethers.getContractFactory(contractName, signerOrOptions);
    const contract = await hre.upgrades.deployProxy(factory, contractArgs, deployOptions);
    await contract.deployTransaction.wait();
    return contract as C;
  } catch (e) {
    if (e instanceof TransactionMinedTimeout && retries > 0) {
      console.log(`timed out deploying ${contractName}, retrying`);
      return deployProxyWithRetry({
        contractName,
        signerOrOptions,
        contractArgs,
        deployOptions,
        retries: --retries,
        hre,
      });
    } else {
      throw e;
    }
  }
}
