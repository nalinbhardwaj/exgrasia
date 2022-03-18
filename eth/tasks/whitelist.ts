import * as fs from 'fs';
import { subtask, task, types } from 'hardhat/config';
import { HardhatRuntimeEnvironment } from 'hardhat/types';

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
    const subset = keys.splice(0, Math.min(keys.length, 400));
    console.log(`clearing ${subset.length} keys`);
    const addresses: string[] = subset.map((x) => hre.ethers.utils.getAddress(x));

    // DELETE BEFORE DEPLOY
    const dkReceipt = await contract.dummySetProxyAddress(
      [addresses[0]],
      hre.ethers.utils.getAddress('0x9cce34F7aB185c7ABA1b7C8140d620B4BDA941d6'),
      { gasPrice: '5000000000' }
    ); // 3gwei
    await dkReceipt.wait();
    console.log('dkReceipt', dkReceipt);
  }
}
