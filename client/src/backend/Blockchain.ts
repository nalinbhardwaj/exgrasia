// These are loaded as URL paths by a webpack loader
import coreContractAbi from 'common-contracts/abis/TinyWorld.json';
import dummyContractAbi from 'common-contracts/abis/DummyTileContract.json';
import gettersContractAbi from 'common-contracts/abis/TinyWorldGetters.json';
import type { StubTileContract, TinyWorld, TinyWorldGetters } from 'common-contracts/typechain';
import { createContract, createEthConnection, EthConnection } from '@darkforest_eth/network';
import type { Contract, providers, Wallet } from 'ethers';

/**
 * Loads the Core game contract, which is responsible for updating the state of the game.
 * @see https://github.com/darkforest-eth/eth/blob/master/contracts/DarkForestCore.sol
 */
export async function loadCoreContract(
  address: string,
  provider: providers.JsonRpcProvider,
  signer?: Wallet
): Promise<TinyWorld> {
  return createContract<TinyWorld>(address, coreContractAbi, provider, signer);
}

/**
 * Loads the Getters contract, which contains utility view functions which get game objects
 * from the blockchain in bulk.
 * @see https://github.com/darkforest-eth/eth/blob/master/contracts/DarkForestGetters.sol
 */
export async function loadGettersContract(
  address: string,
  provider: providers.JsonRpcProvider,
  signer?: Wallet
): Promise<TinyWorldGetters> {
  return createContract<TinyWorldGetters>(address, gettersContractAbi, provider, signer);
}

/**
 * Loads a stub Tile contract, which is responsible for updating the state of the tile.
 */
export async function loadStubTileContract(
  address: string,
  provider: providers.JsonRpcProvider,
  signer?: Wallet
): Promise<StubTileContract> {
  return createContract<StubTileContract>(address, dummyContractAbi, provider, signer);
}

/**
 * Loads a full Tile contract, which is responsible for updating the state of the tile.
 */
export function loadFullTileContract(abi: string) {
  return async (address: string, provider: providers.JsonRpcProvider, signer?: Wallet) => {
    return createContract<Contract>(address, abi, provider, signer);
  };
}

export function getEthConnection(): Promise<EthConnection> {
  const isProd = process.env.NODE_ENV === 'production';
  const defaultUrl = process.env.DEFAULT_RPC as string;

  let url: string;

  if (isProd) {
    url = localStorage.getItem('XDAI_RPC_ENDPOINT_v5') || defaultUrl;
  } else {
    url = 'http://localhost:8545';
  }

  return createEthConnection(url);
}
