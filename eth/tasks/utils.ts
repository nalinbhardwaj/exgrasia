import { TinyWorld, TinyWorldGetters } from '../task-types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { subtask } from 'hardhat/config';

subtask('utils:assertChainId', 'Assert proper network is selectaed').setAction(assertChainId);

async function assertChainId({}, hre: HardhatRuntimeEnvironment) {
  const { NETWORK_ID } = hre.contracts;

  if (hre.network.config.chainId !== NETWORK_ID) {
    throw new Error(
      `Hardhat defined network chain id ${hre.network.config.chainId} is NOT same as contracts network id: ${NETWORK_ID}.`
    );
  }
}

subtask('utils:getCore', 'get the current core contract').setAction(getCore);

async function getCore({}, hre: HardhatRuntimeEnvironment): Promise<TinyWorld> {
  const { CORE_CONTRACT_ADDRESS } = hre.contracts;

  const [deployer] = await hre.ethers.getSigners();
  const TinyWorldFactory = await hre.ethers.getContractFactory('TinyWorld', {});

  const tinyWorld = TinyWorldFactory.attach(CORE_CONTRACT_ADDRESS);
  return tinyWorld.connect(deployer) as TinyWorld;
}

subtask('utils:getGetters', 'get the current getters contract').setAction(getGetters);

async function getGetters({}, hre: HardhatRuntimeEnvironment): Promise<TinyWorldGetters> {
  const { GETTERS_CONTRACT_ADDRESS } = hre.contracts;

  const [deployer] = await hre.ethers.getSigners();
  const GettersFactory = await hre.ethers.getContractFactory('TinyWorldGetters');
  const getters = GettersFactory.attach(GETTERS_CONTRACT_ADDRESS);
  return getters.connect(deployer) as TinyWorldGetters;
}
