import { ProofArgs, Tile } from 'common-types';

class SnarkArgsHelper {
  private readonly seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  async getProof(tile: Tile): Promise<ProofArgs> {
    return new Promise<ProofArgs>((resolve) => {
      setTimeout(() => {
        resolve([
          ['0', '0'],
          [
            ['0', '0'],
            ['0', '0'],
          ],
          ['0', '0'],
          [
            tile.coords.x.toString(),
            tile.coords.y.toString(),
            this.seed.toString(),
            tile.tileType.toString(),
          ],
        ]);
      }, 2000);
    });
  }
}

export default SnarkArgsHelper;
