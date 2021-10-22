import { ethers, upgrades } from 'hardhat';
import { TinyWorld, TinyWorldGetters } from 'common-contracts/typechain';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';

export interface TestContracts {
  core: TinyWorld;
  getters: TinyWorldGetters;
}

export interface World {
  contracts: TestContracts;
  user1: SignerWithAddress;
  user2: SignerWithAddress;
  deployer: SignerWithAddress;
  user1Core: TinyWorld;
  user2Core: TinyWorld;
  user1Getters: TinyWorldGetters;
  user2Getters: TinyWorldGetters;
}

export async function initializeContracts(): Promise<TestContracts> {
  const [deployer] = await ethers.getSigners();

  const CoreFactory = await ethers.getContractFactory('TinyWorld');
  const core = (await upgrades.deployProxy(CoreFactory, [243])) as TinyWorld;

  const GettersFactory = await ethers.getContractFactory('TinyWorldGetters');
  const getters = (await upgrades.deployProxy(GettersFactory, [core.address])) as TinyWorldGetters;

  return {
    core,
    getters,
  };
}

export async function initializeWorld(): Promise<World> {
  const contracts = await initializeContracts();
  const [deployer, user1, user2] = await ethers.getSigners();

  return {
    contracts,
    user1,
    user2,
    deployer,
    user1Core: contracts.core.connect(user1),
    user2Core: contracts.core.connect(user2),
    user1Getters: contracts.getters.connect(user1),
    user2Getters: contracts.getters.connect(user2),
  };
}
