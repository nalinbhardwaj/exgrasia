import { DEFAULT_GAS_PRICES, GAS_PRICES_INTERVAL_MS } from '@darkforest_eth/constants';
import { Monomitter, monomitter } from '@darkforest_eth/events';
import { address } from '@darkforest_eth/serde';
import {
  AutoGasSetting,
  DiagnosticUpdater,
  EthAddress,
  GasPrices,
  SignedMessage,
} from '@darkforest_eth/types';
import {
  JsonRpcProvider,
  TransactionReceipt,
  TransactionRequest,
  TransactionResponse,
} from '@ethersproject/providers';
import { BigNumber, Contract, EventFilter, Wallet } from 'ethers';
import stringify from 'json-stable-stringify';
import debounce from 'just-debounce';
import { ContractLoader } from './Contracts';
import { callWithRetry, getGasSettingGwei, makeProvider, waitForTransaction } from './Network';
import { getAutoGasPrices } from './xDaiApi';

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Responsible for
 * 1) loading the contracts
 * 2) connecting to the network
 */
export class EthConnection {
  /**
   * Keep a reference to all the contracts this {@link EthConnection} has loaded so that they can be
   * reloaded if the RPC url changes.
   *
   * Keyed by the contract address.
   */
  private contracts: Map<string, Contract>;

  /**
   * Keep a reference to all the contract loaders this {@link EthConnection} has loaded
   * so that they can be reloaded if the RPC url changes.
   *
   * Keyed by the contract address.
   */
  private loaders: Map<string, ContractLoader<Contract>>;

  /**
   * Allows {@link EthConnection} to update the global diagnostics, which are displayed in the game
   * client's diagnostics pane.
   */
  private diagnosticsUpdater: DiagnosticUpdater | undefined;

  /**
   * Publishes an event whenever the current block number changes. Can skip block numbers.
   */
  public readonly blockNumber$: Monomitter<number>;

  /**
   * Publishes an event whenever the network's auto gas prices change.
   */
  public readonly gasPrices$: Monomitter<GasPrices>;

  /**
   * It is possible to instantiate an EthConnection without a signer, in which case it is still able
   * to connect to the blockchain, without the ability to send transactions.
   */
  private signer: Wallet | undefined;

  /**
   * Represents the gas price one would pay to achieve the corresponding transaction confirmation
   * speed.
   */
  private gasPrices: GasPrices = {
    slow: 0.001,
    average: 0.003,
    fast: 0.01,
  };

  /**
   * Store this so we can cancel the interval.
   */
  private gasPricesInterval: ReturnType<typeof setInterval> | undefined;

  /**
   * Interval which reloads the balance of the account that this EthConnection is in charge of.
   */
  private balanceInterval: ReturnType<typeof setInterval> | undefined;

  /**
   * The current latest block number.
   */
  private blockNumber;

  /**
   * The provider is the lowest level interface we use to communicate with the blockchain.
   */
  private provider: JsonRpcProvider;

  /**
   * Whenever the RPC url changes, we reload the contract, and also publish an event here.
   */
  public rpcChanged$: Monomitter<string>;

  /**
   * This is kept relatively up-to-date with the balance of the player's wallet on the latest block
   * of whatever blockchain we're connected to.
   */
  private balance: BigNumber;

  /**
   * Any time the balance of the player's address changes, we publish an event here.
   */
  public readonly myBalance$: Monomitter<BigNumber>;

  public constructor(provider: JsonRpcProvider, blockNumber: number) {
    this.contracts = new Map();
    this.loaders = new Map();
    this.provider = provider;
    this.balance = BigNumber.from('0');
    this.blockNumber = blockNumber;
    this.blockNumber$ = monomitter(true);
    this.rpcChanged$ = monomitter(true);
    this.myBalance$ = monomitter(true);
    this.gasPrices$ = monomitter();
    this.rpcChanged$.publish(provider.connection.url);
    this.startPolling();
  }

  private async reloadContracts(): Promise<void> {
    for (const [address, loader] of this.loaders) {
      // Was going to dedupe this with `this.loadContract` but there is no reason to set the loader again.
      const contract = await loader(address, this.provider, this.signer);
      this.contracts.set(address, contract);
    }
  }

  /**
   * Loads a contract into this {@link EthConnection}.
   *
   * @param address The contract address to register the contract against.
   * @param loader The loader used to load (or reload) this contract.
   */
  public async loadContract<T extends Contract>(
    address: string,
    loader: ContractLoader<T>
  ): Promise<T> {
    this.loaders.set(address, loader);
    const contract = await loader(address, this.provider, this.signer);
    this.contracts.set(address, contract);
    return contract;
  }

  /**
   * Retreives a contract from the registry. Must exist otherwise this will throw.
   * @param address The address to load from the registry.
   * @returns The contract requested
   */
  public getContract<T extends Contract>(address: string): T {
    const contract = this.contracts.get(address);
    if (!contract) {
      throw new Error(`Contract never loaded. Address: ${address}`);
    }
    return contract as T;
  }

  /**
   * Changes the RPC url we're connected to, and reloads the ethers contract references.
   */
  public async setRpcUrl(rpcUrl: string): Promise<void> {
    const newProvider = await makeProvider(rpcUrl);
    await this.reloadContracts();
    this.rpcChanged$.publish(newProvider.connection.url);
    this.provider = newProvider;
  }

  /**
   * Changes the ethereum account on behalf of which this {@link EthConnection} sends transactions. Reloads
   * the contracts.
   */
  public async setAccount(skey: string): Promise<void> {
    this.signer = new Wallet(skey, this.provider);
    this.balance = await this.loadBalance(this.signer.address as EthAddress);
    await this.reloadContracts();
  }

  private async refreshBalance() {
    if (this.signer) {
      const balance = await this.loadBalance(this.signer.address as EthAddress);
      this.balance = balance;
      this.myBalance$.publish(balance);
    }
  }

  /**
   * Gets a copy of the latest gas prices.
   */
  public getAutoGasPrices(): GasPrices {
    return { ...this.gasPrices };
  }

  /**
   * Get the gas price, measured in Gwei, that we should send given the current prices for
   * transaction speeds, and given the user's gas price setting.
   */
  public getAutoGasPriceGwei(gasPrices: GasPrices): number {
    return gasPrices.average;
  }

  public getRpcEndpoint(): string {
    return this.provider.connection.url;
  }

  public hasSigner(): boolean {
    return !!this.signer;
  }

  public subscribeToContractEvents(
    contract: Contract,
    // map from contract event to function. using type 'any' here to satisfy typescript - each of
    // the functions has a different type signature.
    handlers: Partial<Record<string, any>>,
    eventFilter: EventFilter
  ) {
    const debouncedOnNewBlock = debounce(this.onNewBlock.bind(this), 1000, true, true);

    this.provider.on('block', async (latestBlockNumber: number) => {
      debouncedOnNewBlock(latestBlockNumber, contract, handlers, eventFilter);
    });
  }

  /**
   * Whenever we become aware of the fact that there have been one or more new blocks mined on the
   * blockchain, we need to update the internal game state of the game to reflect everything that
   * has happnened in those blocks. The way we find out what happened during those blocks is by
   * filtering all the events that have occured in those blocks to those that represent the various
   * actions that can occur on the game.
   */
  private onNewBlock(
    latestBlockNumber: number,
    contract: Contract,
    handlers: Partial<Record<string, any>>,
    eventFilter: EventFilter
  ) {
    const previousBlockNumber = this.blockNumber;
    this.blockNumber = latestBlockNumber;
    this.blockNumber$.publish(latestBlockNumber);

    console.log(`processing events for ${latestBlockNumber - previousBlockNumber} blocks`);

    this.processEvents(
      Math.min(previousBlockNumber + 1, latestBlockNumber),
      latestBlockNumber,
      eventFilter,
      contract,
      handlers
    );
  }

  /**
   * Downloads and processes all the events that have occurred in the given range of blocks.
   *
   * @param startBlock inclusive
   * @param endBlock inclusive
   */
  private async processEvents(
    startBlock: number,
    endBlock: number,
    eventFilter: EventFilter,
    contract: Contract,
    // map from contract event name to the handler for that contract event
    handlers: Partial<Record<string, any>>
  ) {
    const logs = await this.provider.getLogs({
      fromBlock: startBlock, // inclusive
      toBlock: endBlock, // inclusive
      ...eventFilter,
    });

    logs.forEach((log) => {
      const parsedData = contract.interface.parseLog(log);
      const handler = handlers[parsedData.name];
      if (handler !== undefined) {
        handler(...parsedData.args);
      }
    });
  }

  /**
   * Returns the address of the signer, if one was set.
   */
  public getAddress(): EthAddress | undefined {
    if (!this.signer) {
      return undefined;
    }

    return address(this.signer.address);
  }

  /**
   * Returns the private key of the signer, if one was set.
   */
  public getPrivateKey(): string | undefined {
    if (!this.signer) {
      return undefined;
    }

    return this.signer.privateKey;
  }

  /**
   * Gets the signer's nonce, or `0`.
   */
  public async getNonce(): Promise<number> {
    if (!this.signer) {
      return 0;
    }

    return callWithRetry<number>(this.provider.getTransactionCount.bind(this.provider), [
      this.signer.address,
    ]);
  }

  /**
   * Signs a string, or throws an error if a signer has not been set.
   */
  public async signMessage(message: string): Promise<string> {
    if (!this.signer) {
      throw new Error('no signer was set.');
    }

    return this.signer.signMessage(message);
  }

  /**
   * Returns a version of this message signed by the account that this {@code EthConnectio} is
   * logged in as.
   */
  public async signMessageObject<T>(obj: T): Promise<SignedMessage<T>> {
    if (!this.signer) {
      throw new Error('no signer was set.');
    }

    const stringified = stringify(obj);
    const signature = await this.signMessage(stringified);

    return {
      signature,
      sender: this.signer.address.toLowerCase() as EthAddress,
      message: obj,
    };
  }

  /**
   * Gets the balance of the given address (player or contract) measured in Wei. Wei is the base
   * unit in which amounts of Ether and xDai are measured.
   *
   * @see https://ethdocs.org/en/latest/ether.html#denominations
   */
  public async loadBalance(address: EthAddress): Promise<BigNumber> {
    return await callWithRetry<BigNumber>(this.provider.getBalance.bind(this.provider), [address]);
  }

  /**
   * Sends a transaction on behalf of the account that can be set via
   * {@link EthConnection.setAccount}. Throws an error if no account was set.
   */
  public sendTransaction(request: TransactionRequest): Promise<TransactionResponse> {
    if (!this.signer) throw new Error(`no signer`);
    return this.signer.sendTransaction(request);
  }

  /**
   * Gets the provider this {@link EthConnection} is currently using. Don't store a reference to
   * this (unless you're writing plugins), as the provider can change.
   */
  public getProvider(): JsonRpcProvider {
    return this.provider;
  }

  /**
   * Gets the wallet, which represents the account that this {@link EthConnection} sends
   * transactions on behalf of.
   */
  public getSigner(): Wallet | undefined {
    return this.signer;
  }

  /**
   * Gets the current balance of the burner wallet this {@link EthConnection} is in charge of.
   */
  public getMyBalance(): BigNumber | undefined {
    return this.balance;
  }

  /**
   * Returns a promise that resolves when the transaction with the given hash is confirmed, and
   * rejects if the transaction reverts or if there's a network error.
   */
  public waitForTransaction(txHash: string): Promise<TransactionReceipt> {
    return waitForTransaction(this.provider, txHash);
  }

  /**
   * For collecting diagnostics.
   */
  public setDiagnosticUpdater(diagnosticUpdater?: DiagnosticUpdater) {
    this.diagnosticsUpdater = diagnosticUpdater;
    this.rpcChanged$.subscribe(() => {
      diagnosticUpdater?.updateDiagnostics(
        (diagnostics) => (diagnostics.rpcUrl = this.getRpcEndpoint())
      );
    });
    this.gasPrices$.subscribe((gasPrices) => {
      diagnosticUpdater?.updateDiagnostics((diagnostics) => (diagnostics.gasPrices = gasPrices));
    });
  }

  /**
   * Cleans up any important handles.
   */
  public destroy() {
    this.stopPolling();
  }

  private stopPolling() {
    if (this.gasPricesInterval) {
      clearInterval(this.gasPricesInterval);
    }

    if (this.balanceInterval) {
      clearInterval(this.balanceInterval);
    }
  }

  /**
   * Kicks off an interval that regularly reloads the balance
   */
  private startPolling() {
    this.refreshBalance();
    this.balanceInterval = setInterval(this.refreshBalance.bind(this), 1000 * 10);
  }
}

export async function createEthConnection(rpcUrl: string): Promise<EthConnection> {
  const provider = await makeProvider(rpcUrl);
  const blockNumber = await provider.getBlockNumber();
  return new EthConnection(provider, blockNumber);
}
