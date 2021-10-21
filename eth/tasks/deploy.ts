import { subtask, task, types } from 'hardhat/config';
import { FactoryOptions, HardhatRuntimeEnvironment } from 'hardhat/types';
import * as fs from 'fs';
import * as path from 'path';
import type { Valhalla, ValhallaGetters, ValhallaCoreReturn } from '../task-types';
import * as prettier from 'prettier';
import { Signer, Contract } from 'ethers';
import { DeployOptions } from '@openzeppelin/hardhat-upgrades/dist/deploy-proxy';
import { TransactionMinedTimeout } from '@openzeppelin/upgrades-core';

task('deploy', 'deploy all contracts').setAction(deploy);

async function deploy(_args: {}, hre: HardhatRuntimeEnvironment) {
  // need to force a compile for tasks
  await hre.run('compile');

  // Were only using one account, getSigners()[0], the deployer. Becomes the ProxyAdmin
  const [deployer] = await hre.ethers.getSigners();
  // give contract administration over to an admin adress if was provided, or use deployer
  const controllerWalletAddress =
    hre.ADMIN_PUBLIC_ADDRESS !== undefined ? hre.ADMIN_PUBLIC_ADDRESS : deployer.address;

  // deploy the core contract
  const valhallaCoreReturn: ValhallaCoreReturn = await hre.run('deploy:core', {
    controllerWalletAddress,
  });

  const coreAddress = valhallaCoreReturn.contract.address;
  console.log('ValhallaCore deployed to:', coreAddress);

  const valhallaGetters: ValhallaGetters = await hre.run('deploy:getters', {
    controllerWalletAddress,
    coreAddress,
  });

  const gettersAddress = valhallaGetters.address;

  await hre.run('deploy:save', {
    coreBlockNumber: valhallaCoreReturn.blockNumber,
    coreAddress,
    gettersAddress,
  });

  // give all contract administration over to an admin adress if was provided
  if (hre.ADMIN_PUBLIC_ADDRESS) {
    await hre.upgrades.admin.transferProxyAdminOwnership(hre.ADMIN_PUBLIC_ADDRESS);

    console.log('Deployed successfully. Godspeed cadet.');
  }
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
   * for the Valhalla prize universe.
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
   * The block in which the Valhalla contract was deployed.
   */
  export const START_BLOCK = ${isDev ? 0 : args.coreBlockNumber};
  /**
   * The address for the Valhalla contract.
   */
  export const CORE_CONTRACT_ADDRESS = '${args.coreAddress}';
  /**
   * The address for the ValhallaGetters contract.
   */
  export const GETTERS_CONTRACT_ADDRESS = '${args.gettersAddress}';
  `,
    { ...options, parser: 'babel-ts' }
  );

  fs.writeFileSync(contractsFile, addrFileContents);
}

subtask('deploy:core', 'deploy and return tokens contract')
  .addParam('controllerWalletAddress', '', undefined, types.string)
  .setAction(deployCore);

async function deployCore(
  args: {
    controllerWalletAddress: string;
  },
  hre: HardhatRuntimeEnvironment
): Promise<ValhallaCoreReturn> {
  const valhallaCore = await deployProxyWithRetry<Valhalla>({
    contractName: 'Valhalla',
    signerOrOptions: {},
    contractArgs: [args.controllerWalletAddress],
    deployOptions: {},
    retries: 5,
    hre,
  });

  const blockNumber = await (await valhallaCore.deployTransaction.wait()).blockNumber;

  return {
    // should be impossible to not exist since we waited on it in deployProxyWithRetry
    blockNumber,
    contract: valhallaCore,
  };
}

subtask('deploy:getters', 'deploy and return getters')
  .addParam('controllerWalletAddress', '', undefined, types.string)
  .addParam('coreAddress', '', undefined, types.string)
  .setAction(deployGetters);

async function deployGetters(
  args: {
    controllerWalletAddress: string;
    coreAddress: string;
    tokensAddress: string;
    utilsAddress: string;
  },
  hre: HardhatRuntimeEnvironment
): Promise<ValhallaGetters> {
  return deployProxyWithRetry<ValhallaGetters>({
    contractName: 'ValhallaGetters',
    signerOrOptions: {},
    contractArgs: [args.controllerWalletAddress, args.coreAddress],
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
