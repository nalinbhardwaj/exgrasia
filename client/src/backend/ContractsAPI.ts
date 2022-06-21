import {
  CORE_CONTRACT_ADDRESS,
  GETTERS_CONTRACT_ADDRESS,
  REGISTRY_CONTRACT_ADDRESS,
} from 'common-contracts';
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
import type { TinyWorld, TinyWorldGetters, TinyWorldRegistry } from 'common-contracts/typechain';
import {
  ContractCaller,
  EthConnection,
  ethToWei,
  // QueuedTransaction,
  TxExecutor,
} from 'exgrasia-network';
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
  UnconfirmedTileTx,
} from '../_types/ContractAPITypes';
import {
  loadCoreContract,
  loadGettersContract,
  loadStubTileContract,
  loadFullTileContract,
  loadRegistryContract,
} from './Blockchain';
import { nullAddress, promiseWithTimeout } from '../utils';

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

  private abiCache: Map<string, any[]>;

  get coreContract() {
    return this.ethConnection.getContract<TinyWorld>(CORE_CONTRACT_ADDRESS);
  }

  get gettersContract() {
    return this.ethConnection.getContract<TinyWorldGetters>(GETTERS_CONTRACT_ADDRESS);
  }

  get registryContract() {
    return this.ethConnection.getContract<TinyWorldRegistry>(REGISTRY_CONTRACT_ADDRESS);
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
    this.txExecutor = new TxExecutor(ethConnection);
    this.abiCache = new Map();

    this.setupEventListeners();
  }

  public destroy(): void {
    this.removeEventListeners();
  }

  private makeCall<T>(contractViewFunction: ContractFunction<T>, args: unknown[] = []): Promise<T> {
    return this.contractCaller.makeCall(contractViewFunction, args);
  }

  private async decodeTile(rawTile: RawTile): Promise<Tile> {
    const coords = decodeCoords(rawTile.coords);
    const tileContractMetaData = await this.getTileContractMetaData(
      address(rawTile.smartContract),
      coords
    );
    return {
      coords: coords,
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
    const playerInfos = await this.makeCall<{
      0: RawCoords[];
      1: string[];
      2: boolean[];
      3: boolean[];
      4: boolean[];
    }>(this.coreContract.getPlayerInfos);
    const playerIds = await this.makeCall<string[]>(this.coreContract.getPlayerIds);

    const registryPlayerInfos = await this.makeCall<{ 0: string[]; 1: string[] }>(
      this.registryContract.getPlayerInfos
    );

    const proxyToRealMap: Map<EthAddress, EthAddress> = new Map();
    for (let i = 0; i < registryPlayerInfos[0].length; i++) {
      proxyToRealMap.set(address(registryPlayerInfos[0][i]), address(registryPlayerInfos[1][i]));
    }

    const playerMap: Map<EthAddress, PlayerInfo> = new Map();
    for (let i = 0; i < playerIds.length; i++) {
      playerMap.set(address(playerIds[i]), {
        coords: decodeCoords(playerInfos[0][i]),
        emoji: playerInfos[1][i],
        proxyAddress: address(playerIds[i]),
        realAddress: address(proxyToRealMap.get(address(playerIds[i])) || playerIds[i]),
        canMoveWater: playerInfos[2][i],
        canMoveSnow: playerInfos[3][i],
        canPutAnything: playerInfos[4][i],
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

    if (!addr) {
      throw new Error('no address');
    }

    const rawCoords = await this.makeCall<RawCoords>(this.coreContract.playerLocation, [addr]);
    const emoji = await this.makeCall<string>(this.coreContract.playerEmoji, [addr]);
    const canMoveWater = await this.makeCall<boolean>(this.coreContract.canMoveWater, [addr]);
    const canMoveSnow = await this.makeCall<boolean>(this.coreContract.canMoveSnow, [addr]);
    const canPutAnything = await this.makeCall<boolean>(this.coreContract.canPutAnything, [addr]);
    const realAddress = await this.makeCall<string>(this.registryContract.getRealAddress, [addr]);
    return {
      coords: decodeCoords(rawCoords),
      emoji,
      proxyAddress: address(addr),
      realAddress: address(realAddress),
      canMoveWater,
      canMoveSnow,
      canPutAnything,
    };
  }

  async fetchABIURL(url: string) {
    if (!this.abiCache.has(url)) {
      const val = await fetch(url).then((res) => res.json());
      this.abiCache.set(url, val);
    }
    return this.abiCache.get(url)!;
  }

  async makeStubCalls(tileContract: Contract, coords: WorldCoords) {
    const emoji = await this.makeCall<string>(tileContract.tileEmoji, [coords]);
    const name = await this.makeCall<string>(tileContract.tileName, [coords]);
    const description = await this.makeCall<string>(tileContract.tileDescription, [coords]);
    const extendedAbiURL = await this.makeCall<string>(tileContract.tileABI, [coords]);
    const extendedAbi = await this.fetchABIURL(extendedAbiURL);
    return { emoji, name, description, extendedAbi };
  }

  public async getTileContractMetaData(
    addr: EthAddress,
    coords: WorldCoords
  ): Promise<TileContractMetaData> {
    if (!this.txExecutor) {
      throw new Error('no signer, cannot execute tx');
    }

    if (addr == nullAddress) return { emoji: '', name: '', description: '', extendedAbi: [] };

    console.log('addr', addr);
    let tileContract = await this.getStubTileContract(addr);
    let emoji = '🔮';
    let name = 'Unknown';
    let description = 'This tile has an air of mystery to it';
    let extendedAbi: any[] = [];
    try {
      const result = await promiseWithTimeout(this.makeStubCalls(tileContract, coords), 60000);
      if (!/\p{Emoji}/gu.test(result.emoji)) {
        throw new Error('bad emoji');
      }
      emoji = result.emoji;
      name = result.name;
      description = result.description;
      extendedAbi = result.extendedAbi;
    } catch (e) {
      console.log('error parsing', e);
    }
    console.log('addr done', addr);

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

  public async tileTx(action: UnconfirmedTileTx) {
    if (!this.txExecutor) {
      throw new Error('no signer, cannot execute tx');
    }

    const tileContract = await this.getFullTileContract(action.addr, action.abi);
    const overrides = action.value !== undefined ? { value: action.value } : undefined;

    const tx = this.txExecutor.queueTransaction(
      action.actionId,
      tileContract,
      action.methodName,
      action.args,
      overrides
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

    if (addr == nullAddress) return null;

    const tileContract = await this.getFullTileContract(addr, abi);
    const res = await this.makeCall<any>(tileContract[methodName], args);
    return res;
  }

  public async getProxyAddress(realAddress: string) {
    const proxyAddress = await this.makeCall<string>(this.registryContract.getProxyAddress, [
      address(realAddress),
    ]);
    return address(proxyAddress);
  }

  public async getTileNFTs(
    addr: EthAddress,
    abi: any[],
    ownerAddress: EthAddress
  ): Promise<string[]> {
    if (!this.txExecutor) {
      throw new Error('no signer, cannot execute tx');
    }

    if (addr == nullAddress) return [];

    const tileContract = await this.getFullTileContract(addr, abi);
    if (
      !('balanceOf' in tileContract) ||
      !('tokenOfOwnerByIndex' in tileContract) ||
      !('tokenURI' in tileContract)
    ) {
      throw new Error('Tile contract is not enumerable');
    }
    const balance = (
      await this.makeCall<EthersBN>(tileContract['balanceOf'], [address(ownerAddress)])
    ).toNumber();
    const res: string[] = [];
    for (let i = 0; i < balance; i++) {
      const tokenIdx = (
        await this.makeCall<EthersBN>(tileContract['tokenOfOwnerByIndex'], [
          address(ownerAddress),
          i,
        ])
      ).toNumber();
      const tokenURI = await this.makeCall<string>(tileContract['tokenURI'], [tokenIdx]);
      res.push(tokenURI);
    }
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
        this.emit(ContractsAPIEvent.TxReverted, submitted, e);
        throw e;
      });
  }
}

export async function makeContractsAPI(ethConnection: EthConnection): Promise<ContractsAPI> {
  // Could turn this into an array and iterate, but I like the explicitness
  await ethConnection.loadContract(CORE_CONTRACT_ADDRESS, loadCoreContract);
  await ethConnection.loadContract(GETTERS_CONTRACT_ADDRESS, loadGettersContract);
  await ethConnection.loadContract(REGISTRY_CONTRACT_ADDRESS, loadRegistryContract);

  return new ContractsAPI(ethConnection);
}
