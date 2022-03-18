import { EthConnection } from '@darkforest_eth/network';
import { monomitter, Monomitter, Subscription } from '@darkforest_eth/events';
import { perlin, PerlinConfig, getRaritySeed } from 'common-procgen-utils';
import { address, EthAddress, PlayerInfo, Tile, WorldCoords } from 'common-types';
import { EventEmitter } from 'events';
import { ContractsAPI, makeContractsAPI, RawTile } from './ContractsAPI';
import { getRandomActionId, getRandomTree, nullAddress, seedToTileAttrs } from '../utils';
import {
  ContractMethodName,
  ContractsAPIEvent,
  isUnconfirmedMovePlayer,
  SubmittedTx,
  TxIntent,
  UnconfirmedMovePlayer,
  UnconfirmedInitPlayer,
  isUnconfirmedInitPlayer,
  UnconfirmedOwnTile,
  UnconfirmedTileTx,
  isUnconfirmedOwnTile,
  isUnconfirmedTileTx,
} from '../_types/ContractAPITypes';

class GameManager extends EventEmitter {
  /**
   * The ethereum address of the player who is currently logged in. We support 'no account',
   * represented by `undefined` in the case when you want to simply load the game state from the
   * contract and view it without be able to make any moves.
   */
  private readonly account: EthAddress | undefined;

  /**
   * Allows us to make contract calls, and execute transactions. Be careful about how you use this
   * guy. You don't want to cause your client to send an excessive amount of traffic to whatever
   * node you're connected to.
   *
   * Interacting with the blockchain isn't free, and we need to be mindful about about the way our
   * application interacts with the blockchain. The current rate limiting strategy consists of three
   * points:
   *
   * - data that needs to be fetched often should be fetched in bulk.
   * - rate limit smart contract calls (reads from the blockchain), implemented by
   *   {@link ContractCaller} and transactions (writes to the blockchain on behalf of the player),
   *   implemented by {@link TxExecutor} via two separately tuned {@link ThrottledConcurrentQueue}s.
   */
  private readonly contractsAPI: ContractsAPI;

  /**
   * An interface to the blockchain that is a little bit lower-level than {@link ContractsAPI}. It
   * allows us to do basic operations such as wait for a transaction to complete, check the player's
   * address and balance, etc.
   */
  private readonly ethConnection: EthConnection;

  private readonly worldSeed: number;
  private readonly worldWidth: number;
  private readonly worldScale: number;

  private readonly tiles: Tile[][];
  public selfInfo: PlayerInfo;
  public playerInfos: Map<EthAddress, PlayerInfo>;

  private readonly perlinConfig1: PerlinConfig;
  private readonly perlinConfig2: PerlinConfig;

  public tileUpdated$: Monomitter<void>;
  public playerUpdated$: Monomitter<void>;
  public tileTxUpdated$: Monomitter<[TxIntent, 'submitted' | 'confirmed' | 'reverted']>;

  private constructor(
    account: EthAddress | undefined,
    ethConnection: EthConnection,
    contractsAPI: ContractsAPI,
    worldSeed: number,
    worldWidth: number,
    worldScale: number,
    touchedTiles: Tile[],
    selfInfo: PlayerInfo,
    playerInfos: Map<EthAddress, PlayerInfo>
  ) {
    super();

    this.account = account;
    this.ethConnection = ethConnection;
    this.contractsAPI = contractsAPI;
    this.worldSeed = worldSeed;
    this.worldWidth = worldWidth;
    this.worldScale = worldScale;
    this.tiles = [];
    this.selfInfo = selfInfo;
    this.playerInfos = playerInfos;
    this.perlinConfig1 = {
      seed: worldSeed,
      scale: worldScale,
      mirrorX: false,
      mirrorY: false,
      floor: true,
    };
    this.perlinConfig2 = {
      seed: worldSeed + 1,
      scale: worldScale,
      mirrorX: false,
      mirrorY: false,
      floor: true,
    };

    this.tileUpdated$ = monomitter();
    this.playerUpdated$ = monomitter();
    this.tileTxUpdated$ = monomitter();

    for (let i = 0; i < worldWidth; i++) {
      this.tiles.push([]);
      for (let j = 0; j < worldWidth; j++) {
        const coords = { x: i, y: j };
        const perl1 = perlin(coords, this.perlinConfig1);
        const perl2 = perlin(coords, this.perlinConfig2);
        const raritySeed = getRaritySeed(coords.x, coords.y);
        const tileAttrs = seedToTileAttrs(coords, perl1, perl2);
        this.tiles[i].push({
          coords: coords,
          perlin: [perl1, perl2],
          raritySeed: raritySeed,
          tileType: tileAttrs.tileType,
          temperatureType: tileAttrs.temperatureType,
          altitudeType: tileAttrs.altitudeType,
          owner: nullAddress,
          smartContract: nullAddress,
          smartContractMetaData: { emoji: '', description: '', name: '', extendedAbi: [] },
        });
      }
    }

    for (let touchedTile of touchedTiles) {
      this.tiles[touchedTile.coords.x][touchedTile.coords.y] = touchedTile;
    }
  }

  static async create(ethConnection: EthConnection) {
    const account = ethConnection.getAddress();

    if (!account) {
      throw new Error('no account on eth connection');
    }

    const contractsAPI = await makeContractsAPI(ethConnection);
    const worldSeed = await contractsAPI.getSeed();
    const worldWidth = await contractsAPI.getWorldWidth();
    const worldScale = await contractsAPI.getWorldScale();
    const touchedTiles = await contractsAPI.getTouchedTiles();
    const selfInfo = await contractsAPI.getSelfInfo();
    const playerInfos = await contractsAPI.getPlayerInfos();

    const gameManager = new GameManager(
      account,
      ethConnection,
      contractsAPI,
      worldSeed,
      worldWidth,
      worldScale,
      touchedTiles,
      selfInfo,
      playerInfos
    );

    // important that this happens AFTER we load the game state from the blockchain. Otherwise our
    // 'loading game state' contract calls will be competing with events from the blockchain that
    // are happening now, which makes no sense.
    contractsAPI.setupEventListeners();

    // set up listeners: whenever ContractsAPI reports some game state update,
    // do some logic
    // also, handle state updates for locally-initialized txIntents
    gameManager.contractsAPI
      .on(ContractsAPIEvent.PlayerUpdated, async (moverAddr: EthAddress, coords: WorldCoords) => {
        // todo: update in memory data store
        // todo: emit event to UI
        // TODO: do something???
        console.log('event player', coords);

        if (!gameManager.account) {
          throw new Error('no account set');
        }
        if (gameManager.selfInfo.coords.x === 0) {
          gameManager.selfInfo = await gameManager.getSelfInfoLive();
        }
        gameManager.playerUpdated$.publish();
      })
      .on(ContractsAPIEvent.TileUpdated, async (tile: Tile) => {
        // todo: update in memory data store
        // todo: emit event to UI
        // TODO: do something???
        console.log('event tile', tile);

        if (!gameManager.account) {
          throw new Error('no account set');
        }
        gameManager.tiles[tile.coords.x][tile.coords.y] = tile;
        gameManager.tileUpdated$.publish();
      })
      .on(ContractsAPIEvent.TxSubmitted, (unconfirmedTx: SubmittedTx) => {
        // todo: save the tx to localstorage
        if (isUnconfirmedTileTx(unconfirmedTx)) {
          gameManager.tileTxUpdated$.publish([unconfirmedTx, 'submitted']);
        }
        gameManager.onTxSubmit(unconfirmedTx);
      })
      .on(ContractsAPIEvent.TxConfirmed, async (unconfirmedTx: SubmittedTx) => {
        // todo: remove the tx from localstorage
        if (isUnconfirmedMovePlayer(unconfirmedTx)) {
          gameManager.selfInfo.coords = unconfirmedTx.coords;
          gameManager.playerUpdated$.publish();
        }
        if (isUnconfirmedTileTx(unconfirmedTx)) {
          gameManager.tileTxUpdated$.publish([unconfirmedTx, 'confirmed']);
        }
        gameManager.onTxConfirmed(unconfirmedTx);
      })
      .on(ContractsAPIEvent.TxReverted, async (unconfirmedTx: SubmittedTx, error: any) => {
        // todo: remove the tx from localStorage
        if (isUnconfirmedTileTx(unconfirmedTx)) {
          gameManager.tileTxUpdated$.publish([unconfirmedTx, 'reverted']);
        }
        gameManager.onTxReverted(unconfirmedTx);
      });

    return gameManager;
  }

  private onTxIntent(txIntent: TxIntent): void {
    // hook to be called on txIntent initialization
    // pop up a little notification, save txIntent to memory
    // if you want to display it to UI
    console.log('txIntent initialized:');
    console.log(txIntent);
  }

  private onTxSubmit(unminedTx: SubmittedTx): void {
    // hook to be called on successful tx submission to mempool
    // pop up a little notification or log something to console
    console.log('submitted tx:');
    console.log(unminedTx);
  }

  private onTxIntentFail(txIntent: TxIntent, e: Error): void {
    // hook to be called when tx fails to submit (SNARK proof fails,
    // or rejected from mempool for whatever reason
    // pop up a little notification, clear the txIntent from memory
    // if it was being displayed in UI
    console.log(`txIntent failed with error ${e.message}`);
    if (isUnconfirmedTileTx(txIntent)) {
      this.tileTxUpdated$.publish([txIntent, 'reverted']);
    }
    console.log(txIntent);
  }

  private onTxConfirmed(tx: SubmittedTx) {
    // hook to be called when tx is mined successfully
    // pop up a little notification or log block explorer link
    // clear txIntent from memory if it was being displayed in UI
    console.log('confirmed tx:');
    console.log(tx);
  }

  private onTxReverted(tx: SubmittedTx) {
    // hook to be called if tx reverts
    // pop up a little notification or log block explorer link
    // clear txIntent from memory if it was being displayed in UI
    console.log('reverted tx:');
    console.log(tx);
  }

  getWorldSeed(): number {
    return this.worldSeed;
  }

  getWorldWidth(): number {
    return this.worldWidth;
  }

  public async movePlayer(key: string) {
    console.debug('Key event', key);
    const keyToDirection: any = {
      w: [-1, 0],
      a: [0, -1],
      s: [1, 0],
      d: [0, 1],
    };

    const location = (await this.getSelfInfo()).coords;

    if (!(key in keyToDirection)) {
      return;
    }

    const coords = {
      x: location.x + keyToDirection[key][0],
      y: location.y + keyToDirection[key][1],
    };

    console.log('motionCoords', coords);

    if (!this.account) {
      throw new Error('no account set');
    }

    const actionId = getRandomActionId();
    const txIntent: UnconfirmedMovePlayer = {
      actionId,
      methodName: ContractMethodName.MOVE_PLAYER,
      coords,
    };
    this.onTxIntent(txIntent);
    this.contractsAPI.movePlayer(txIntent).catch((err) => {
      this.onTxIntentFail(txIntent, err);
    });

    return this;
  }

  public async getSelfInfo() {
    return this.selfInfo;
  }

  public async getSelfInfoLive() {
    return this.contractsAPI.getSelfInfo();
  }

  public async getPlayerInfos() {
    if (!this.account) {
      throw new Error('no account set');
    }

    const ret = await this.contractsAPI.getPlayerInfos();
    ret.set(this.account, this.selfInfo); // optimistically override self location for speed

    return ret;
  }

  public async getInitted() {
    return this.contractsAPI.getInitted();
  }

  public async initPlayerLocation(emoji: string) {
    if (!this.account) {
      throw new Error('no account set');
    }

    const actionId = getRandomActionId();
    const txIntent: UnconfirmedInitPlayer = {
      actionId,
      methodName: ContractMethodName.INIT_PLAYER_LOCATION,
      emoji,
    };
    this.onTxIntent(txIntent);
    this.contractsAPI.initPlayerLocation(txIntent).catch((err) => {
      this.onTxIntentFail(txIntent, err);
    });

    return this;
  }

  public async ownTile(coords: WorldCoords, smartContract: EthAddress) {
    if (!this.account) {
      throw new Error('no account set');
    }

    const actionId = getRandomActionId();
    const txIntent: UnconfirmedOwnTile = {
      actionId,
      methodName: ContractMethodName.OWN_TILE,
      coords,
      smartContract,
    };
    this.onTxIntent(txIntent);
    this.contractsAPI.ownTile(txIntent).catch((err) => {
      this.onTxIntentFail(txIntent, err);
    });

    return this;
  }

  public async tileTx(coords: WorldCoords, methodName: string, args: any) {
    if (!this.account) {
      throw new Error('no account set');
    }

    const actionId = getRandomActionId();
    const txIntent: UnconfirmedTileTx = {
      actionId,
      methodName: methodName,
      addr: this.tiles[coords.x][coords.y].smartContract,
      abi: this.tiles[coords.x][coords.y].smartContractMetaData.extendedAbi,
      args: args,
    };
    this.onTxIntent(txIntent);
    this.contractsAPI.tileTx(txIntent).catch((err) => {
      this.onTxIntentFail(txIntent, err);
    });

    return actionId;
  }

  public async tileCall(coords: WorldCoords, methodName: string, args: any) {
    return this.contractsAPI.tileCall(
      this.tiles[coords.x][coords.y].smartContract,
      this.tiles[coords.x][coords.y].smartContractMetaData.extendedAbi,
      methodName,
      args
    );
  }

  getTiles(): Tile[][] {
    return this.tiles;
  }
}

export default GameManager;
