import { EthConnection } from '@darkforest_eth/network';
import { perlin, PerlinConfig } from '@darkforest_eth/hashing';
import { EthAddress, fakePerlin, Tile, TileType, WorldCoords } from 'common-types';
import { EventEmitter } from 'events';
import { ContractsAPI, makeContractsAPI } from './ContractsAPI';
import SnarkHelper from './SnarkHelper';
import { perlinToTileType } from '../utils';

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

  private readonly originalTiles: Tile[][];

  private readonly perlinConfig: PerlinConfig;

  private constructor(
    account: EthAddress | undefined,
    ethConnection: EthConnection,
    contractsAPI: ContractsAPI,
    worldSeed: number,
    worldWidth: number,
    snarkHelper: SnarkHelper
  ) {
    super();

    this.account = account;
    this.ethConnection = ethConnection;
    this.contractsAPI = contractsAPI;
    this.worldSeed = worldSeed;
    this.worldWidth = worldWidth;
    this.snarkHelper = snarkHelper;
    this.originalTiles = [];
    this.perlinConfig = { key: worldSeed, scale: 4, mirrorX: false, mirrorY: false, floor: true };

    for (let i = 0; i < worldWidth; i++) {
      this.originalTiles.push([]);
      for (let j = 0; j < worldWidth; j++) {
        const coords = { x: i, y: j };
        this.originalTiles[i].push({
          coords: coords,
          tileType: perlinToTileType(perlin(coords, this.perlinConfig)),
        });
      }
    }
    console.log(this.originalTiles);
  }

  static async create(ethConnection: EthConnection) {
    const account = ethConnection.getAddress();

    if (!account) {
      throw new Error('no account on eth connection');
    }

    const contractsAPI = await makeContractsAPI(ethConnection);
    const worldSeed = await contractsAPI.getSeed();
    const worldWidth = await contractsAPI.getWorldWidth();

    const snarkHelper = new SnarkHelper(worldSeed);

    const gameManager = new GameManager(
      account,
      ethConnection,
      contractsAPI,
      worldSeed,
      worldWidth,
      snarkHelper
    );

    // important that this happens AFTER we load the game state from the blockchain. Otherwise our
    // 'loading game state' contract calls will be competing with events from the blockchain that
    // are happening now, which makes no sense.
    contractsAPI.setupEventListeners();

    // TODO setup gameManager listeners

    return gameManager;
  }

  getWorldSeed(): number {
    return this.worldSeed;
  }

  getWorldWidth(): number {
    return this.worldWidth;
  }

  getOriginalTiles(): Tile[][] {
    return this.originalTiles;
  }

  getOriginalTile(coords: WorldCoords): TileType {
    console.log(
      `originalTiles, ${JSON.stringify(this.originalTiles[coords.x][coords.y].tileType)}`
    );
    return this.originalTiles[coords.x][coords.y].tileType;
  }

  async getCachedTile(coords: WorldCoords): Promise<TileType> {
    const res = await this.contractsAPI.getCachedTile(coords);
    console.log(`coords-> res: ${coords}, ${res}`);
    return res === 0 ? this.getOriginalTile(coords) : res;
  }

  async checkProof(tile: Tile): Promise<Boolean> {
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
}

export default GameManager;
