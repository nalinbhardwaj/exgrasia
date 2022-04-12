import * as fs from 'fs';
import { subtask, task, types } from 'hardhat/config';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import {
  TESTING_CONTRACT_ADDRESS,
  FISHING_CONTRACT_ADDRESS,
  OPENSEA_MARKET_CONTRACT_ADDRESS,
  FARM_CONTRACT_ADDRESS,
  WHEAT_CONTRACT_ADDRESS,
  CORN_CONTRACT_ADDRESS,
  CACTUS_CONTRACT_ADDRESS,
  RANCH_CONTRACT_ADDRESS,
  MILK_CONTRACT_ADDRESS,
  EGG_CONTRACT_ADDRESS,
  MINE_CONTRACT_ADDRESS,
  IRON_CONTRACT_ADDRESS,
  GOLD_CONTRACT_ADDRESS,
  DIAMOND_CONTRACT_ADDRESS,
  QUEST_MASTER_CONTRACT_ADDRESS,
} from 'common-contracts';

task('whitelist:enableKeys', 'enables keys stored in the given file path')
  .addPositionalParam(
    'filePath',
    'the path to the file containing keys to enable',
    undefined,
    types.string
  )
  .setAction(whitelistEnable);

async function whitelistEnable(args: { filePath: string }, hre: HardhatRuntimeEnvironment) {
  await hre.run('utils:assertChainId');
  const keyFileContents = fs.readFileSync(args.filePath).toString();
  const keys = keyFileContents.split('\n').filter((k) => k.length > 0);

  const contract = await hre.ethers.getContractAt(
    'TinyWorldRegistry',
    hre.contracts.REGISTRY_CONTRACT_ADDRESS
  );

  while (keys.length > 0) {
    const subset = keys.splice(0, 2);
    console.log(`clearing ${subset.length} keys`);
    const addresses: string[] = subset.map((x) => hre.ethers.utils.getAddress(x));

    // DELETE BEFORE DEPLOY
    const dkReceipt = await contract.dummySetProxyAddress([addresses[0]], addresses[1], {
      gasPrice: '5000000000',
    }); // 3gwei
    await dkReceipt.wait();
    console.log('dkReceipt', dkReceipt);
  }
}

task('whitelist:questMaster', 'set QuestMaster as Admin')
  .addPositionalParam('address', 'address of quest master contract', undefined, types.string)
  .setAction(whitelistQuestMaster);

async function whitelistQuestMaster(args: { address: string }, hre: HardhatRuntimeEnvironment) {
  await hre.run('utils:assertChainId');
  const contract = await hre.ethers.getContractAt('TinyWorld', hre.contracts.CORE_CONTRACT_ADDRESS);
  const dkReceipt = await contract.setQuestMaster(hre.ethers.utils.getAddress(args.address), {
    gasPrice: '5000000000',
  }); // 3gwei
  await dkReceipt.wait();
  console.log('dkReceipt', dkReceipt);
}

task('whitelist:contracts', 'set whitelisted contracts as Admin').setAction(whitelistContracts);

async function whitelistContracts(args: {}, hre: HardhatRuntimeEnvironment) {
  await hre.run('utils:assertChainId');
  const contract = await hre.ethers.getContractAt('TinyWorld', hre.contracts.CORE_CONTRACT_ADDRESS);
  const dkReceipt = await contract.addWhitelistedContracts(
    [
      TESTING_CONTRACT_ADDRESS,
      FISHING_CONTRACT_ADDRESS,
      OPENSEA_MARKET_CONTRACT_ADDRESS,
      FARM_CONTRACT_ADDRESS,
      WHEAT_CONTRACT_ADDRESS,
      CORN_CONTRACT_ADDRESS,
      CACTUS_CONTRACT_ADDRESS,
      RANCH_CONTRACT_ADDRESS,
      MILK_CONTRACT_ADDRESS,
      EGG_CONTRACT_ADDRESS,
      MINE_CONTRACT_ADDRESS,
      IRON_CONTRACT_ADDRESS,
      GOLD_CONTRACT_ADDRESS,
      DIAMOND_CONTRACT_ADDRESS,
      QUEST_MASTER_CONTRACT_ADDRESS,
    ],
    {
      gasPrice: '5000000000',
    }
  ); // 3gwei
  await dkReceipt.wait();
  console.log('dkReceipt', dkReceipt);
}
