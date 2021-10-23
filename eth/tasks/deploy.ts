import { subtask, task, types } from 'hardhat/config';
import { FactoryOptions, HardhatRuntimeEnvironment } from 'hardhat/types';
import * as fs from 'fs';
import * as path from 'path';
import type { TinyWorld, TinyWorldGetters, TinyWorldCoreReturn } from '../task-types';
import * as prettier from 'prettier';
import { Signer, Contract } from 'ethers';
import { DeployOptions } from '@openzeppelin/hardhat-upgrades/dist/deploy-proxy';
import { TransactionMinedTimeout } from '@openzeppelin/upgrades-core';

task('deploy', 'deploy all contracts').setAction(deploy);

async function deploy(_args: {}, hre: HardhatRuntimeEnvironment) {
  // need to force a compile for tasks
  await hre.run('compile');

  // deploy the core contract
  const tinyWorldCoreReturn: TinyWorldCoreReturn = await hre.run('deploy:core', {});

  const coreAddress = tinyWorldCoreReturn.contract.address;
  console.log('TinyWorldCore deployed to:', coreAddress);

  const tinyWorldGetters: TinyWorldGetters = await hre.run('deploy:getters', {
    coreAddress,
  });

  const gettersAddress = tinyWorldGetters.address;

  await hre.run('deploy:save', {
    coreBlockNumber: tinyWorldCoreReturn.blockNumber,
    coreAddress,
    gettersAddress,
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
  `,
    { ...options, parser: 'babel-ts' }
  );

  fs.writeFileSync(contractsFile, addrFileContents);
}

subtask('deploy:core', 'deploy and return tokens contract').setAction(deployCore);

async function deployCore(_args: {}, hre: HardhatRuntimeEnvironment): Promise<TinyWorldCoreReturn> {
  const tinyWorldCore = await deployProxyWithRetry<TinyWorld>({
    contractName: 'TinyWorld',
    signerOrOptions: {},
    contractArgs: [
      hre.initializers.SEED_1,
      hre.initializers.WORLD_WIDTH,
      hre.initializers.WORLD_SCALE,
    ],
    deployOptions: {},
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
  deployOptions: DeployOptions;
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
