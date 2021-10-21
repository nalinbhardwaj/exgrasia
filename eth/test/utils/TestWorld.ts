import { ethers, upgrades } from 'hardhat';
import { Valhalla, ValhallaGetters } from 'common-contracts/typechain';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';

export interface TestContracts {
  core: Valhalla;
  getters: ValhallaGetters;
}

export interface World {
  contracts: TestContracts;
  user1: SignerWithAddress;
  user2: SignerWithAddress;
  deployer: SignerWithAddress;
  user1Core: Valhalla;
  user2Core: Valhalla;
  user1Getters: ValhallaGetters;
  user2Getters: ValhallaGetters;
}

export async function initializeContracts(): Promise<TestContracts> {
  const [deployer] = await ethers.getSigners();

  const CoreFactory = await ethers.getContractFactory('Valhalla');
  const core = (await upgrades.deployProxy(CoreFactory, [deployer.address])) as Valhalla;

  const GettersFactory = await ethers.getContractFactory('ValhallaGetters');
  const getters = (await upgrades.deployProxy(GettersFactory, [
    deployer.address,
    core.address,
  ])) as ValhallaGetters;

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
