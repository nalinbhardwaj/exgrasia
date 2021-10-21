import { task } from 'hardhat/config';
import { FactoryOptions, HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployOptions } from '@openzeppelin/hardhat-upgrades/dist/deploy-proxy';
import { Signer, Contract } from 'ethers';
import { TransactionMinedTimeout } from '@openzeppelin/upgrades-core';

import type { Valhalla, ValhallaGetters } from '../task-types';

task('upgrade:core', 'upgrade Valhalla contract (only)').setAction(upgradeCore);

async function upgradeCore({}, hre: HardhatRuntimeEnvironment) {
  await hre.run('utils:assertChainId');

  // need to force a compile for tasks
  await hre.run('compile');

  const { CORE_CONTRACT_ADDRESS } = hre.contracts;

  await upgradeProxyWithRetry<Valhalla>({
    contractName: 'Valhalla',
    contractAddress: CORE_CONTRACT_ADDRESS,
    signerOrOptions: {},
    deployOptions: {},
    retries: 5,
    hre,
  });
}

task('upgrade:getters', 'upgrade ValhallaGetters contract (only)').setAction(upgradeGetters);

async function upgradeGetters({}, hre: HardhatRuntimeEnvironment) {
  await hre.run('utils:assertChainId');

  // need to force a compile for tasks
  await hre.run('compile');

  const { GETTERS_CONTRACT_ADDRESS } = hre.contracts;

  await upgradeProxyWithRetry<ValhallaGetters>({
    contractName: 'ValhallaGetters',
    contractAddress: GETTERS_CONTRACT_ADDRESS,
    signerOrOptions: {},
    deployOptions: {},
    retries: 5,
    hre,
  });
}

async function upgradeProxyWithRetry<C extends Contract>({
  contractName,
  contractAddress,
  signerOrOptions,
  deployOptions,
  hre,
  retries,
}: {
  contractName: string;
  contractAddress: string;
  signerOrOptions: Signer | FactoryOptions | undefined;
  deployOptions: DeployOptions;
  hre: HardhatRuntimeEnvironment;
  retries: number;
}): Promise<C> {
  try {
    const factory = await hre.ethers.getContractFactory(contractName, signerOrOptions);
    const contract = await hre.upgrades.upgradeProxy(contractAddress, factory, deployOptions);
    await contract.deployTransaction.wait();
    return contract as C;
  } catch (e) {
    if (e instanceof TransactionMinedTimeout && retries > 0) {
      console.log(`timed out upgrading ${contractName}, retrying`);
      return upgradeProxyWithRetry({
        contractName,
        contractAddress,
        signerOrOptions,
        deployOptions,
        retries: --retries,
        hre,
      });
    } else {
      throw e;
    }
  }
}
