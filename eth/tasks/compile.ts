import {
  HardhatArguments,
  HardhatRuntimeEnvironment,
  RunSuperFunction,
  TaskArguments,
} from 'hardhat/types';
import { task } from 'hardhat/config';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as prettier from 'prettier';

task('compile', 'hook the compile step and copy our abis after').setAction(copyAbi);

async function copyAbi(
  args: HardhatArguments,
  hre: HardhatRuntimeEnvironment,
  runSuper: RunSuperFunction<TaskArguments>
) {
  await runSuper(args);

  // save the contract ABIs to client
  const coreAbi = prettier.format(
    JSON.stringify((await hre.artifacts.readArtifact('TinyWorld')).abi),
    { semi: false, parser: 'json' }
  );
  const gettersAbi = prettier.format(
    JSON.stringify((await hre.artifacts.readArtifact('TinyWorldGetters')).abi),
    { semi: false, parser: 'json' }
  );
  const stubTileAbi = prettier.format(
    JSON.stringify((await hre.artifacts.readArtifact('StubTileContract')).abi),
    { semi: false, parser: 'json' }
  );
  const testTileAbi = prettier.format(
    JSON.stringify((await hre.artifacts.readArtifact('TestTileContract')).abi),
    { semi: false, parser: 'json' }
  );
  const tinyERC20Abi = prettier.format(
    JSON.stringify((await hre.artifacts.readArtifact('TinyERC20')).abi),
    { semi: false, parser: 'json' }
  );
  const tinyFishingAbi = prettier.format(
    JSON.stringify((await hre.artifacts.readArtifact('TinyFish')).abi),
    { semi: false, parser: 'json' }
  );
  const tinyOpenSeaAbi = prettier.format(
    JSON.stringify((await hre.artifacts.readArtifact('TinyOpenSea')).abi),
    { semi: false, parser: 'json' }
  );
  const tinyFarmAbi = prettier.format(
    JSON.stringify((await hre.artifacts.readArtifact('TinyFarm')).abi),
    { semi: false, parser: 'json' }
  );
  const tinyRanchAbi = prettier.format(
    JSON.stringify((await hre.artifacts.readArtifact('TinyRanch')).abi),
    { semi: false, parser: 'json' }
  );
  const tinyMineAbi = prettier.format(
    JSON.stringify((await hre.artifacts.readArtifact('TinyMine')).abi),
    { semi: false, parser: 'json' }
  );
  const tinyQuestMasterAbi = prettier.format(
    JSON.stringify((await hre.artifacts.readArtifact('TinyQuestMaster')).abi),
    { semi: false, parser: 'json' }
  );
  const tinyCampfireAbi = prettier.format(
    JSON.stringify((await hre.artifacts.readArtifact('TinyCampfire')).abi),
    { semi: false, parser: 'json' }
  );
  const registryAbi = prettier.format(
    JSON.stringify((await hre.artifacts.readArtifact('TinyWorldRegistry')).abi),
    { semi: false, parser: 'json' }
  );
  const abisDir = path.join(hre.packageDirs['common-contracts'], 'abis');

  await fs.mkdir(abisDir, { recursive: true });

  // Save contract ABIs to client
  await fs.writeFile(path.join(abisDir, 'TinyWorld.json'), coreAbi);
  await fs.writeFile(path.join(abisDir, 'TinyWorldGetters.json'), gettersAbi);
  await fs.writeFile(path.join(abisDir, 'StubTileContract.json'), stubTileAbi);
  await fs.writeFile(path.join(abisDir, 'TestTileContract.json'), testTileAbi);
  await fs.writeFile(path.join(abisDir, 'TinyERC20.json'), tinyERC20Abi);
  await fs.writeFile(path.join(abisDir, 'TinyFishing.json'), tinyFishingAbi);
  await fs.writeFile(path.join(abisDir, 'TinyOpenSea.json'), tinyOpenSeaAbi);
  await fs.writeFile(path.join(abisDir, 'TinyFarm.json'), tinyFarmAbi);
  await fs.writeFile(path.join(abisDir, 'TinyRanch.json'), tinyRanchAbi);
  await fs.writeFile(path.join(abisDir, 'TinyMine.json'), tinyMineAbi);
  await fs.writeFile(path.join(abisDir, 'TinyQuestMaster.json'), tinyQuestMasterAbi);
  await fs.writeFile(path.join(abisDir, 'TinyCampfire.json'), tinyCampfireAbi);
  await fs.writeFile(path.join(abisDir, 'TinyWorldRegistry.json'), registryAbi);
}

// todo upstream export of task name
task('size-contracts', 'post contract sizer hook to ensure hardhat compile').setAction(
  contractSizer
);

async function contractSizer(
  args: HardhatArguments,
  hre: HardhatRuntimeEnvironment,
  runSuper: RunSuperFunction<TaskArguments>
) {
  // force a compile to make sure size data is fresh
  await hre.run('compile');
  await runSuper(args);
}
