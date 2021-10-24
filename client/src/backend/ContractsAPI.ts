import { CORE_CONTRACT_ADDRESS, GETTERS_CONTRACT_ADDRESS } from 'common-contracts';
import {
  ProveTileContractCallArgs,
  TransitionTileContractCallArgs,
  Tile,
  TileType,
  WorldCoords,
  Awaited,
} from 'common-types';
import type { TinyWorld, TinyWorldGetters } from 'common-contracts/typechain';
import {
  ContractCaller,
  EthConnection,
  ethToWei,
  // QueuedTransaction,
  TxExecutor,
} from '@darkforest_eth/network';
import { EventEmitter } from 'events';
import {
  BigNumber as EthersBN,
  ContractFunction /*, ethers, Event, providers*/,
  providers,
} from 'ethers';
import {
  ContractEvent,
  ContractMethodName,
  ContractsAPIEvent,
  SubmittedProveTile,
  SubmittedTransitionTile,
  SubmittedTx,
  UnconfirmedProveTile,
  UnconfirmedTransitionTile,
} from '../_types/ContractAPITypes';
import { loadCoreContract, loadGettersContract } from './Blockchain';

export type RawTile = Awaited<ReturnType<TinyWorld['getCachedTile']>>;

export function decodeTile(rawTile: RawTile): Tile {
  return {
    coords: {
      x: rawTile.coords.x.toNumber(),
      y: rawTile.coords.y.toNumber(),
    },
    currentTileType: rawTile.currentTileType,
    perl: rawTile.perlin.map(toNumber),
    raritySeed: rawTile.raritySeed.toNumber(),
    isPrepped: true,
  };
}

/**
 * Roughly contains methods that map 1:1 with functions that live in the contract. Responsible for
 * reading and writing to and from the blockchain.
 *
 * @todo don't inherit from {@link EventEmitter}. instead use {@link Monomitter}
 */
export class ContractsAPI extends EventEmitter {
  /**
   * Don't allow users to submit txs if balance falls below this amount/
   */
  private static readonly MIN_BALANCE = ethToWei(0.002);

  /**
   * Instrumented {@link ThrottledConcurrentQueue} for blockchain reads.
   */
  private readonly contractCaller: ContractCaller;

  /**
   * Instrumented {@link ThrottledConcurrentQueue} for blockchain writes.
   */
  private readonly txExecutor: TxExecutor | undefined;

  /**
   * Our connection to the blockchain. In charge of low level networking, and also of the burner
   * wallet.
   */
  private ethConnection: EthConnection;

  get coreContract() {
    return this.ethConnection.getContract<TinyWorld>(CORE_CONTRACT_ADDRESS);
  }

  get gettersContract() {
    return this.ethConnection.getContract<TinyWorldGetters>(GETTERS_CONTRACT_ADDRESS);
  }

  public constructor(ethConnection: EthConnection) {
    super();
    this.contractCaller = new ContractCaller();
    this.ethConnection = ethConnection;
    this.txExecutor = new TxExecutor(ethConnection, () => '1');

    this.setupEventListeners();
  }

  public destroy(): void {
    this.removeEventListeners();
  }

  private makeCall<T>(contractViewFunction: ContractFunction<T>, args: unknown[] = []): Promise<T> {
    return this.contractCaller.makeCall(contractViewFunction, args);
  }

  public async setupEventListeners(): Promise<void> {
    const { coreContract } = this;

    const filter = {
      address: coreContract.address,
      topics: [
        [coreContract.filters.TileUpdated(null).topics].map(
          (topicsOrUndefined) => (topicsOrUndefined || [])[0]
        ),
      ] as Array<string | Array<string>>,
    };

    const eventHandlers = {
      [ContractEvent.TileUpdated]: (rawTile: RawTile) => {
        this.emit(ContractsAPIEvent.TileUpdated, rawTile);
      },
    };

    this.ethConnection.subscribeToContractEvents(coreContract, eventHandlers, filter);
  }

  public removeEventListeners(): void {
    const { coreContract } = this;

    coreContract.removeAllListeners(ContractEvent.TileUpdated);
  }

  public async getSeed(): Promise<number> {
    return (await this.makeCall<EthersBN>(this.coreContract.seed)).toNumber();
  }

  // public async doRandomTileUpdate(coords: WorldCoords, tileType: TileType) {
  //   await this.makeCall(this.coreContract.randomTileUpdate, [coords.x, coords.y, tileType]);
  // }

  public async transitionTile(
    args: TransitionTileContractCallArgs,
    action: UnconfirmedTransitionTile
  ): Promise<providers.TransactionReceipt> {
    if (!this.txExecutor) {
      throw new Error('no signer, cannot execute tx');
    }

    const tx = this.txExecutor.queueTransaction(
      action.actionId,
      this.coreContract,
      ContractMethodName.TRANSITION_TILE,
      args
    );
    const unminedTransitionTileTx: SubmittedTransitionTile = {
      ...action,
      txHash: (await tx.submitted).hash,
      sentAtTimestamp: Math.floor(Date.now() / 1000),
    };

    return this.waitFor(unminedTransitionTileTx, tx.confirmed);
  }

  public async getWorldScale(): Promise<number> {
    return (await this.makeCall<EthersBN>(this.coreContract.worldScale)).toNumber();
  }

  public async getWorldWidth(): Promise<number> {
    return (await this.makeCall<EthersBN>(this.coreContract.worldWidth)).toNumber();
  }

  public async getCachedTile(coords: WorldCoords): Promise<Tile> {
    const rawTile = await this.makeCall<RawTile>(this.coreContract.getCachedTile, [coords]);
    return decodeTile(rawTile);
  }

  public async getTouchedTilesWithoutPerl(): Promise<Tile[]> {
    const rawTiles = await this.makeCall<RawTile[]>(this.coreContract.getTouchedTiles, []);
    return rawTiles.map(decodeTile);
  }

  /**
   * Given an unconfirmed (but submitted) transaction, emits the appropriate
   * [[ContractsAPIEvent]].
   */
  public waitFor(submitted: SubmittedTx, receiptPromise: Promise<providers.TransactionReceipt>) {
    this.emit(ContractsAPIEvent.TxSubmitted, submitted);

    return receiptPromise
      .then((receipt) => {
        this.emit(ContractsAPIEvent.TxConfirmed, submitted);
        return receipt;
      })
      .catch((e) => {
        this.emit(ContractsAPIEvent.TxReverted, submitted);
        throw e;
      });
  }

  async proveTile(
    args: ProveTileContractCallArgs,
    action: UnconfirmedProveTile
  ): Promise<providers.TransactionReceipt> {
    if (!this.txExecutor) {
      throw new Error('no signer, cannot execute tx');
    }

    const tx = this.txExecutor.queueTransaction(
      action.actionId,
      this.coreContract,
      ContractMethodName.PROVE_TILE,
      args
    );
    const unminedProveTileTx: SubmittedProveTile = {
      ...action,
      txHash: (await tx.submitted).hash,
      sentAtTimestamp: Math.floor(Date.now() / 1000),
    };

    return this.waitFor(unminedProveTileTx, tx.confirmed);
  }
}

export async function makeContractsAPI(ethConnection: EthConnection): Promise<ContractsAPI> {
  // Could turn this into an array and iterate, but I like the explicitness
  await ethConnection.loadContract(CORE_CONTRACT_ADDRESS, loadCoreContract);
  await ethConnection.loadContract(GETTERS_CONTRACT_ADDRESS, loadGettersContract);

  return new ContractsAPI(ethConnection);
}
