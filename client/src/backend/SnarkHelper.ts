import { SnarkJSProofAndSignals, Tile, SnarkInput, ProveTileContractCallArgs } from 'common-types';
import FastQueue from 'fastq';

type ZKPTask = {
  taskId: number;
  input: unknown;
  circuit: string; // path
  zkey: string; // path
  vkey: string; // path

  onSuccess: (proof: SnarkJSProofAndSignals) => void;
  onError: (e: Error) => void;
};

class SnarkProverQueue {
  private taskQueue: FastQueue.queue;
  private taskCount: number;

  constructor() {
    this.taskQueue = FastQueue(this.execute.bind(this), 1);
    this.taskCount = 0;
  }

  public doProof(
    input: SnarkInput,
    circuit: string,
    zkey: string,
    vkey: string
  ): Promise<SnarkJSProofAndSignals> {
    const taskId = this.taskCount++;
    const task = {
      input,
      circuit,
      zkey,
      vkey,
      taskId,
    };

    return new Promise<SnarkJSProofAndSignals>((resolve, reject) => {
      this.taskQueue.push(task, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }

  private getVerificationKey = async (vkey: string) => {
    return await fetch(vkey).then(function (res) {
      return res.json();
    });
  };

  private checkProof = async function (proof: string, publicSignals: string[], vkey_path: string) {
    const vKey = await this.getVerificationKey(vkey_path);

    const res = await window.snarkjs.groth16.verify(vKey, publicSignals, proof);
    return res;
  };

  private async execute(
    task: ZKPTask,
    cb: (err: Error | null, result: SnarkJSProofAndSignals | null) => void
  ) {
    try {
      console.log(`proving ${task.taskId}`);
      const { proof, publicSignals } = await window.snarkjs.groth16.fullProve(
        task.input,
        task.circuit,
        task.zkey
      );
      console.log(`proved ${task.taskId}`);
      const res = await this.checkProof(proof, publicSignals, task.vkey);
      console.log(`proof ${task.taskId} verification: ${res}`);
      cb(null, { proof, publicSignals });
    } catch (e) {
      console.error('error while calculating SNARK proof:');
      console.error(e);
      cb(e, null);
    }
  }
}

class SnarkArgsHelper {
  private readonly seed: number;
  private readonly width: number;
  private readonly scale: number;
  private readonly snarkProverQueue: SnarkProverQueue;

  constructor(seed: number, width: number, scale: number) {
    this.seed = seed;
    this.scale = scale;
    this.width = width;
    this.snarkProverQueue = new SnarkProverQueue();
  }

  async getBasicProof(tile: Tile): Promise<SnarkJSProofAndSignals> {
    try {
      const start = Date.now();
      console.log('INIT: calculating witness and proof');
      console.log(`tile basic proof ${tile.tileType}`);
      const input: SnarkInput = {
        x: tile.coords.x.toString(),
        y: tile.coords.y.toString(),
        seed: this.seed.toString(),
        width: this.width.toString(),
        scale: this.scale.toString(),
        tileType: tile.tileType.toString(),
      };

      console.log(`input: ${tile.tileType}`);

      const { proof, publicSignals } = await this.snarkProverQueue.doProof(
        input,
        'public/circuits/main.wasm',
        'public/circuits/main.zkey',
        'public/circuits/verification_key.json'
      );
      const end = Date.now();
      console.log(`INIT: calculated witness and proof in ${end - start}ms`);

      return { proof, publicSignals };
    } catch (e) {
      throw e;
    }
  }

  async getFakeProof(tile: Tile): Promise<ProveTileContractCallArgs> {
    return new Promise((resolve) => {
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
