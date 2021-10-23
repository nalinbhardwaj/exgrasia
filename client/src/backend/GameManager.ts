import { EthConnection } from '@darkforest_eth/network';
import { perlin, PerlinConfig } from '@darkforest_eth/hashing';
import { EthAddress, Tile, TileType, WorldCoords } from 'common-types';
import { EventEmitter } from 'events';
import { ContractsAPI, makeContractsAPI } from './ContractsAPI';
import SnarkHelper from './SnarkHelper';
import { getRandomActionId, perlinToTileType } from '../utils';
import {
  ContractMethodName,
  ContractsAPIEvent,
  isUnconfirmedProveTile,
  SubmittedTx,
  TxIntent,
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
   * Responsible for generating snark proofs.
   */
  private readonly snarkHelper: SnarkHelper;

  /**
   * An interface to the blockchain that is a little bit lower-level than {@link ContractsAPI}. It
   * allows us to do basic operations such as wait for a transaction to complete, check the player's
   * address and balance, etc.
   */
  private readonly ethConnection: EthConnection;

  private readonly worldSeed: number;
  private readonly worldWidth: number;

  private readonly tiles: Tile[][];

  private readonly perlinConfig: PerlinConfig;

  private constructor(
    account: EthAddress | undefined,
    ethConnection: EthConnection,
    contractsAPI: ContractsAPI,
    worldSeed: number,
    worldWidth: number,
    touchedTiles: Tile[],
    snarkHelper: SnarkHelper
  ) {
    super();

    this.account = account;
    this.ethConnection = ethConnection;
    this.contractsAPI = contractsAPI;
    this.worldSeed = worldSeed;
    this.worldWidth = worldWidth;
    this.snarkHelper = snarkHelper;
    this.tiles = [];
    this.perlinConfig = { key: worldSeed, scale: 4, mirrorX: false, mirrorY: false, floor: true };

    for (let i = 0; i < worldWidth; i++) {
      this.tiles.push([]);
      for (let j = 0; j < worldWidth; j++) {
        const coords = { x: i, y: j };
        const originalTileType = perlinToTileType(perlin(coords, this.perlinConfig));
        this.tiles[i].push({
          coords: coords,
          originalTileType,
          currentTileType: originalTileType,
        });
      }
    }
    for (const touchedTile of touchedTiles) {
      this.tiles[touchedTile.coords.x][touchedTile.coords.y] = touchedTile;
      console.log('loaded touched tile from contract:');
      console.log(touchedTile);
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
    const touchedTiles = await contractsAPI.getTouchedTiles();

    const snarkHelper = new SnarkHelper(worldSeed);

    const gameManager = new GameManager(
      account,
      ethConnection,
      contractsAPI,
      worldSeed,
      worldWidth,
      touchedTiles,
      snarkHelper
    );

    // important that this happens AFTER we load the game state from the blockchain. Otherwise our
    // 'loading game state' contract calls will be competing with events from the blockchain that
    // are happening now, which makes no sense.
    contractsAPI.setupEventListeners();

    // set up listeners: whenever ContractsAPI reports some game state update,
    // do some logic
    // also, handle state updates for locally-initialized txIntents
    gameManager.contractsAPI
      .on(ContractsAPIEvent.TileUpdated, async (_tile: Tile) => {
        // todo: update in memory data store
        // todo: emit event to UI
      })
      .on(ContractsAPIEvent.TxSubmitted, (unconfirmedTx: SubmittedTx) => {
        // todo: save the tx to localstorage
        gameManager.onTxSubmit(unconfirmedTx);
      })
      .on(ContractsAPIEvent.TxConfirmed, async (unconfirmedTx: SubmittedTx) => {
        // todo: remove the tx from localstorage
        if (isUnconfirmedProveTile(unconfirmedTx)) {
          // todo: update in memory data store
        }
        gameManager.onTxConfirmed(unconfirmedTx);
      })
      .on(ContractsAPIEvent.TxReverted, async (unconfirmedTx: SubmittedTx) => {
        // todo: removethe tx from localStorage
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

  getOriginalTiles(): Tile[][] {
    return this.tiles;
  }

  getOriginalTile(coords: WorldCoords): TileType {
    console.log(
      `originalTiles, ${JSON.stringify(this.tiles[coords.x][coords.y].originalTileType)}`
    );
    return this.tiles[coords.x][coords.y].originalTileType;
  }

  async getTileTypeOfCoords(coords: WorldCoords): Promise<TileType> {
    const res = await this.contractsAPI.getCachedTile(coords);
    console.log(`coords-> res: ${coords}, ${res}`);
    return res.currentTileType === 0 ? this.getOriginalTile(coords) : res.currentTileType;
  }

  async checkProof(tile: Tile): Promise<boolean> {
    return this.snarkHelper
      .getBasicProof(tile)
      .then((snarkArgs) => {
        console.log('got snark args: ', JSON.stringify(snarkArgs));
        return true;
      })
      .catch((err) => {
        console.error(err);
        return false;
      });
  }

  public proveTile(tile: Tile): GameManager {
    if (!this.account) {
      throw new Error('no account set');
    }

    const actionId = getRandomActionId();
    const txIntent = {
      actionId,
      methodName: ContractMethodName.PROVE_TILE,
      tile,
    };
    this.onTxIntent(txIntent);

    this.snarkHelper
      .getFakeProof(tile)
      .then((callArgs) => {
        return this.contractsAPI.proveTile(callArgs, txIntent);
      })
      .catch((err) => {
        this.onTxIntentFail(txIntent, err);
      });

    return this;
  }
}

export default GameManager;
