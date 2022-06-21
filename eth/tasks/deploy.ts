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
  TinyQuestMaster,
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

  const questMasterContract: TinyQuestMaster = await hre.run('deploy:questMaster', {
    coreAddress,
    tinyFishContractAddress: tileContracts.tinyFishingContract.address,
    tinyOpenSeaContractAddress: tileContracts.tinyOpenSeaContract.address,
    tinyFarmContractAddress: tileContracts.tinyFarmContract.address,
    tinyWheatContractAddress: tileContracts.tinyWheatContract.address,
    tinyCornContractAddress: tileContracts.tinyCornContract.address,
    tinyCactusContractAddress: tileContracts.tinyCactusContract.address,
    tinyRanchContractAddress: tileContracts.tinyRanchContract.address,
    tinyMilkContractAddress: tileContracts.tinyMilkContract.address,
    tinyEggContractAddress: tileContracts.tinyEggContract.address,
    tinyMineContractAddress: tileContracts.tinyMineContract.address,
    tinyIronContractAddress: tileContracts.tinyIronContract.address,
    tinyGoldContractAddress: tileContracts.tinyGoldContract.address,
    tinyDiamondContractAddress: tileContracts.tinyDiamondContract.address,
  });

  await hre.run('deploy:save', {
    coreBlockNumber: tinyWorldCoreReturn.blockNumber,
    registryAddress: libraries.registry.address,
    coreAddress,
    gettersAddress,
    testTileContractAddress: tileContracts.testTileContract.address,
    tinyFishContractAddress: tileContracts.tinyFishingContract.address,
    tinyOpenSeaContractAddress: tileContracts.tinyOpenSeaContract.address,
    tinyFarmContractAddress: tileContracts.tinyFarmContract.address,
    tinyWheatContractAddress: tileContracts.tinyWheatContract.address,
    tinyCornContractAddress: tileContracts.tinyCornContract.address,
    tinyCactusContractAddress: tileContracts.tinyCactusContract.address,
    tinyRanchContractAddress: tileContracts.tinyRanchContract.address,
    tinyMilkContractAddress: tileContracts.tinyMilkContract.address,
    tinyEggContractAddress: tileContracts.tinyEggContract.address,
    tinyMineContractAddress: tileContracts.tinyMineContract.address,
    tinyIronContractAddress: tileContracts.tinyIronContract.address,
    tinyGoldContractAddress: tileContracts.tinyGoldContract.address,
    tinyDiamondContractAddress: tileContracts.tinyDiamondContract.address,
    tinyquestMasterContractAddress: questMasterContract.address,
    tinyCampfireContractAddress: tileContracts.tinyCampfireContract.address,
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
    tinyOpenSeaContractAddress: string;
    tinyFarmContractAddress: string;
    tinyWheatContractAddress: string;
    tinyCornContractAddress: string;
    tinyCactusContractAddress: string;
    tinyRanchContractAddress: string;
    tinyMilkContractAddress: string;
    tinyEggContractAddress: string;
    tinyMineContractAddress: string;
    tinyIronContractAddress: string;
    tinyGoldContractAddress: string;
    tinyDiamondContractAddress: string;
    tinyquestMasterContractAddress: string;
    tinyCampfireContractAddress: string;
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
   export const OPENSEA_MARKET_CONTRACT_ADDRESS = '${args.tinyOpenSeaContractAddress}';
   export const FARM_CONTRACT_ADDRESS = '${args.tinyFarmContractAddress}';
   export const WHEAT_CONTRACT_ADDRESS = '${args.tinyWheatContractAddress}';
   export const CORN_CONTRACT_ADDRESS = '${args.tinyCornContractAddress}';
   export const CACTUS_CONTRACT_ADDRESS = '${args.tinyCactusContractAddress}';
   export const RANCH_CONTRACT_ADDRESS = '${args.tinyRanchContractAddress}';
   export const MILK_CONTRACT_ADDRESS = '${args.tinyMilkContractAddress}';
   export const EGG_CONTRACT_ADDRESS = '${args.tinyEggContractAddress}';
   export const MINE_CONTRACT_ADDRESS = '${args.tinyMineContractAddress}';
   export const IRON_CONTRACT_ADDRESS = '${args.tinyIronContractAddress}';
   export const GOLD_CONTRACT_ADDRESS = '${args.tinyGoldContractAddress}';
   export const DIAMOND_CONTRACT_ADDRESS = '${args.tinyDiamondContractAddress}';
   export const QUEST_MASTER_CONTRACT_ADDRESS = '${args.tinyquestMasterContractAddress}';
   export const CAMPFIRE_CONTRACT_ADDRESS = '${args.tinyCampfireContractAddress}';
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
      [
        '0xF05b5f04B7a77Ca549C0dE06beaF257f40C66FDB', // nibnalin.eth
        '0x62b1273bd0e441980f951e16bf558fbd13e9de25', // nibnalin.eth's proxy
        '0xB6510c1b362728b334AA92e64DFcAb4f3e04054b', // exgrasia deployer
        '0x3097403B64fe672467345bf159F4C9C5464bD89e', // delete later
      ],
    ],
    // Linking external libraries like `Perlin` is not yet supported, or
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

  const TinyOpenSeaContractFactory = await hre.ethers.getContractFactory('TinyOpenSea');
  const tinyOpenSeaContract = await TinyOpenSeaContractFactory.deploy(
    args.coreAddress,
    tinyFishingContract.address
  );
  await tinyOpenSeaContract.deployTransaction.wait();

  const TinyFarmContractFactory = await hre.ethers.getContractFactory('TinyFarm');
  const tinyFarmContract = await TinyFarmContractFactory.deploy(args.coreAddress);
  await tinyFarmContract.deployTransaction.wait();

  const farmContract = await hre.ethers.getContractAt('TinyFarm', tinyFarmContract.address);
  const farmCrops: Contract[] = await Promise.all(
    (
      await farmContract.getCrops()
    ).map(async (addr: string) => await hre.ethers.getContractAt('TinyERC20', addr))
  );

  const TinyRanchContractFactory = await hre.ethers.getContractFactory('TinyRanch');
  const tinyRanchContract = await TinyRanchContractFactory.deploy(
    args.coreAddress,
    farmCrops[0].address,
    farmCrops[1].address,
    farmCrops[2].address
  );
  await tinyRanchContract.deployTransaction.wait();

  const ranchContract = await hre.ethers.getContractAt('TinyRanch', tinyRanchContract.address);
  const ranchProduce: Contract[] = await Promise.all(
    (
      await ranchContract.getProduce()
    ).map(async (addr: string) => await hre.ethers.getContractAt('TinyERC20', addr))
  );

  const TinyMineContractFactory = await hre.ethers.getContractFactory('TinyMine', {
    libraries: {
      Perlin: args.perlinAddress,
    },
  });
  const tinyMineContract = await TinyMineContractFactory.deploy(args.coreAddress);
  await tinyMineContract.deployTransaction.wait();

  const mineContract = await hre.ethers.getContractAt('TinyMine', tinyMineContract.address);
  const mineOres: Contract[] = await Promise.all(
    (
      await mineContract.getOres()
    ).map(async (addr: string) => await hre.ethers.getContractAt('TinyERC20', addr))
  );

  const TinyCampfireContractFactory = await hre.ethers.getContractFactory('TinyCampfire');
  const tinyCampfireContract = await TinyCampfireContractFactory.deploy(args.coreAddress);
  await tinyCampfireContract.deployTransaction.wait();

  return {
    testTileContract: tileContract as StubTileContract,
    tinyFishingContract: tinyFishingContract as StubTileContract,
    tinyOpenSeaContract: tinyOpenSeaContract as StubTileContract,
    tinyFarmContract: tinyFarmContract as StubTileContract,
    tinyWheatContract: farmCrops[0] as StubTileContract,
    tinyCornContract: farmCrops[1] as StubTileContract,
    tinyCactusContract: farmCrops[2] as StubTileContract,
    tinyRanchContract: tinyRanchContract as StubTileContract,
    tinyMilkContract: ranchProduce[0] as StubTileContract,
    tinyEggContract: ranchProduce[1] as StubTileContract,
    tinyMineContract: tinyMineContract as StubTileContract,
    tinyIronContract: mineOres[0] as StubTileContract,
    tinyGoldContract: mineOres[1] as StubTileContract,
    tinyDiamondContract: mineOres[2] as StubTileContract,
    tinyCampfireContract: tinyCampfireContract as StubTileContract,
  };
}

subtask('deploy:questMaster', 'deploy and return the quest master').setAction(deployQuestMaster);

async function deployQuestMaster(
  args: {
    coreAddress: string;
    tinyFishContractAddress: string;
    tinyOpenSeaContractAddress: string;
    tinyFarmContractAddress: string;
    tinyWheatContractAddress: string;
    tinyCornContractAddress: string;
    tinyCactusContractAddress: string;
    tinyRanchContractAddress: string;
    tinyMilkContractAddress: string;
    tinyEggContractAddress: string;
    tinyMineContractAddress: string;
    tinyIronContractAddress: string;
    tinyGoldContractAddress: string;
    tinyDiamondContractAddress: string;
  },
  hre: HardhatRuntimeEnvironment
): Promise<TinyQuestMaster> {
  const TinyQuestMasterContractFactory = await hre.ethers.getContractFactory('TinyQuestMaster');
  const tinyQuestMasterContract = await TinyQuestMasterContractFactory.deploy(
    args.coreAddress,
    args.tinyFishContractAddress,
    args.tinyOpenSeaContractAddress,
    args.tinyWheatContractAddress,
    args.tinyCornContractAddress,
    args.tinyCactusContractAddress,
    args.tinyRanchContractAddress,
    args.tinyMilkContractAddress,
    args.tinyEggContractAddress,
    args.tinyIronContractAddress,
    args.tinyGoldContractAddress,
    args.tinyDiamondContractAddress
  );
  await tinyQuestMasterContract.deployTransaction.wait();
  return tinyQuestMasterContract as TinyQuestMaster;
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
