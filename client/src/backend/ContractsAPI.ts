import { CORE_CONTRACT_ADDRESS, GETTERS_CONTRACT_ADDRESS } from 'common-contracts';
import {
  ProveTileContractCallArgs,
  TransitionTileContractCallArgs,
  Tile,
  TileType,
  WorldCoords,
  Awaited,
  address,
  EthAddress,
  PlayerInfo,
  TileContractMetaData,
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
  Contract,
  ContractFunction /*, ethers, Event, providers*/,
  providers,
} from 'ethers';
import {
  ContractEvent,
  ContractMethodName,
  ContractsAPIEvent,
  SubmittedInitPlayer,
  SubmittedMovePlayer,
  SubmittedOwnTile,
  SubmittedTileCall,
  SubmittedTx,
  UnconfirmedInitPlayer,
  UnconfirmedMovePlayer,
  UnconfirmedOwnTile,
  UnconfirmedTileCall,
} from '../_types/ContractAPITypes';
import {
  loadCoreContract,
  loadGettersContract,
  loadStubTileContract,
  loadFullTileContract,
} from './Blockchain';
import { nullAddress } from '../utils';

export type RawTile = Awaited<ReturnType<TinyWorld['getCachedTile(tuple)']>>;
export type RawCoords = Awaited<ReturnType<TinyWorld['playerLocation']>>;

export function decodeCoords(rawCoords: RawCoords): WorldCoords {
  return {
    x: rawCoords.x.toNumber(),
    y: rawCoords.y.toNumber(),
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

  private async getStubTileContract(addr: EthAddress) {
    await this.ethConnection.loadContract(addr, loadStubTileContract);
    console.log('loaded stub tile contract', addr);
    return this.ethConnection.getContract<Contract>(addr);
  }

  private async getFullTileContract(addr: EthAddress, abi: any[]) {
    await this.ethConnection.loadContract(addr, loadFullTileContract(abi));
    console.log('loaded full tile contract', addr);
    return this.ethConnection.getContract<Contract>(addr);
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

  private async decodeTile(rawTile: RawTile): Promise<Tile> {
    const tileContractMetaData = await this.getTileContractMetaData(address(rawTile.smartContract));
    return {
      coords: decodeCoords(rawTile.coords),
      perlin: [rawTile.perlin[0].toNumber(), rawTile.perlin[1].toNumber()],
      raritySeed: rawTile.raritySeed.toNumber(),
      tileType: rawTile.tileType,
      temperatureType: rawTile.temperatureType,
      altitudeType: rawTile.altitudeType,
      owner: address(rawTile.owner),
      smartContract: address(rawTile.smartContract),
      smartContractMetaData: tileContractMetaData,
    };
  }

  public async setupEventListeners(): Promise<void> {
    const { coreContract } = this;

    const filter = {
      address: coreContract.address,
      topics: [
        [
          coreContract.filters.PlayerUpdated(null, null).topics,
          coreContract.filters.TileUpdated(null).topics,
        ].map((topicsOrUndefined) => (topicsOrUndefined || [])[0]),
      ] as Array<string | Array<string>>,
    };

    const eventHandlers = {
      [ContractEvent.PlayerUpdated]: (rawAddress: string, coords: RawCoords) => {
        this.emit(ContractsAPIEvent.PlayerUpdated, address(rawAddress), decodeCoords(coords));
      },
      [ContractEvent.TileUpdated]: async (rawTile: RawTile) => {
        this.emit(ContractsAPIEvent.TileUpdated, await this.decodeTile(rawTile));
      },
    };

    this.ethConnection.subscribeToContractEvents(coreContract, eventHandlers, filter);
  }

  public removeEventListeners(): void {
    const { coreContract } = this;

    coreContract.removeAllListeners(ContractEvent.PlayerUpdated);
    coreContract.removeAllListeners(ContractEvent.TileUpdated);
  }

  public async getSeed(): Promise<number> {
    return (await this.makeCall<EthersBN>(this.coreContract.seed)).toNumber();
  }

  public async getWorldScale(): Promise<number> {
    return (await this.makeCall<EthersBN>(this.coreContract.worldScale)).toNumber();
  }

  public async getWorldWidth(): Promise<number> {
    return (await this.makeCall<EthersBN>(this.coreContract.worldWidth)).toNumber();
  }

  public async getTouchedTiles(): Promise<Tile[]> {
    const touchedTiles = await this.makeCall<RawTile[]>(this.coreContract.getTouchedTiles);

    return Promise.all(touchedTiles.map(async (rawTile) => await this.decodeTile(rawTile)));
  }

  public async getPlayerInfos(): Promise<Map<EthAddress, PlayerInfo>> {
    const playerInfos = await this.makeCall<{ 0: RawCoords[]; 1: string[] }>(
      this.coreContract.getPlayerInfos
    );
    const playerIds = await this.makeCall<string[]>(this.coreContract.getPlayerIds);

    const playerMap: Map<EthAddress, PlayerInfo> = new Map();
    for (let i = 0; i < playerIds.length; i++) {
      playerMap.set(address(playerIds[i]), {
        coords: decodeCoords(playerInfos[0][i]),
        emoji: playerInfos[1][i],
      });
    }
    return playerMap;
  }

  public async getInitted(): Promise<boolean> {
    if (!this.txExecutor) {
      throw new Error('no signer, cannot execute tx');
    }

    const addr = this.ethConnection.getAddress();

    const initted = await this.makeCall<boolean>(this.coreContract.playerInited, [addr]);
    return initted;
  }

  public async getSelfInfo(): Promise<PlayerInfo> {
    if (!this.txExecutor) {
      throw new Error('no signer, cannot execute tx');
    }

    const addr = this.ethConnection.getAddress();

    const rawCoords = await this.makeCall<RawCoords>(this.coreContract.playerLocation, [addr]);
    const emoji = await this.makeCall<string>(this.coreContract.playerEmoji, [addr]);
    return { coords: decodeCoords(rawCoords), emoji };
  }

  public async getTileContractMetaData(addr: EthAddress): Promise<TileContractMetaData> {
    if (!this.txExecutor) {
      throw new Error('no signer, cannot execute tx');
    }

    if (addr == nullAddress) return { emoji: '', name: '', description: '', extendedAbi: [] };

    const tileContract = await this.getStubTileContract(addr);
    const emoji = await this.makeCall<string>(tileContract.emoji);
    const name = await this.makeCall<string>(tileContract.name);
    const description = await this.makeCall<string>(tileContract.description);
    const extendedAbiURL = await this.makeCall<string>(tileContract.extendedAbi);
    const extendedAbi: any[] = await fetch(extendedAbiURL).then((res) => res.json());

    return { emoji, name, description, extendedAbi };
  }

  public async initPlayerLocation(action: UnconfirmedInitPlayer) {
    if (!this.txExecutor) {
      throw new Error('no signer, cannot execute tx');
    }

    const tx = this.txExecutor.queueTransaction(
      action.actionId,
      this.coreContract,
      action.methodName,
      [action.emoji]
    );
    const unminedInitPlayerTx: SubmittedInitPlayer = {
      ...action,
      txHash: (await tx.submitted).hash,
      sentAtTimestamp: Math.floor(Date.now() / 1000),
    };

    return this.waitFor(unminedInitPlayerTx, tx.confirmed);
  }

  public async movePlayer(action: UnconfirmedMovePlayer) {
    if (!this.txExecutor) {
      throw new Error('no signer, cannot execute tx');
    }

    const tx = this.txExecutor.queueTransaction(
      action.actionId,
      this.coreContract,
      action.methodName,
      [action.coords]
    );
    const unminedMovePlayerTx: SubmittedMovePlayer = {
      ...action,
      txHash: (await tx.submitted).hash,
      sentAtTimestamp: Math.floor(Date.now() / 1000),
    };

    return this.waitFor(unminedMovePlayerTx, tx.confirmed);
  }

  public async ownTile(action: UnconfirmedOwnTile) {
    if (!this.txExecutor) {
      throw new Error('no signer, cannot execute tx');
    }

    const tx = this.txExecutor.queueTransaction(
      action.actionId,
      this.coreContract,
      action.methodName,
      [action.coords, action.smartContract]
    );
    const unminedOwnTileTx: SubmittedOwnTile = {
      ...action,
      txHash: (await tx.submitted).hash,
      sentAtTimestamp: Math.floor(Date.now() / 1000),
    };

    return this.waitFor(unminedOwnTileTx, tx.confirmed);
  }

  public async tileTx(action: UnconfirmedTileCall) {
    if (!this.txExecutor) {
      throw new Error('no signer, cannot execute tx');
    }

    const tileContract = await this.getFullTileContract(action.addr, action.abi);

    const tx = this.txExecutor.queueTransaction(
      action.actionId,
      tileContract,
      action.methodName,
      action.args
    );
    const unminedTestCallTx: SubmittedTileCall = {
      ...action,
      txHash: (await tx.submitted).hash,
      sentAtTimestamp: Math.floor(Date.now() / 1000),
    };

    return this.waitFor(unminedTestCallTx, tx.confirmed);
  }

  public async tileCall(addr: EthAddress, abi: any[], methodName: string, args: any): Promise<any> {
    if (!this.txExecutor) {
      throw new Error('no signer, cannot execute tx');
    }

    if (addr == nullAddress) return undefined;

    const tileContract = await this.getFullTileContract(addr, abi);
    const res = await this.makeCall<string>(tileContract[methodName], args);
    return res;
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
}

export async function makeContractsAPI(ethConnection: EthConnection): Promise<ContractsAPI> {
  // Could turn this into an array and iterate, but I like the explicitness
  await ethConnection.loadContract(CORE_CONTRACT_ADDRESS, loadCoreContract);
  await ethConnection.loadContract(GETTERS_CONTRACT_ADDRESS, loadGettersContract);

  return new ContractsAPI(ethConnection);
}
