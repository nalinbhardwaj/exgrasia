import { DEFAULT_MAX_CALL_RETRIES } from '@darkforest_eth/constants';
import { AutoGasSetting, EthAddress, GasPrices, SignedMessage } from '@darkforest_eth/types';
import { JsonRpcProvider, TransactionReceipt } from '@ethersproject/providers';
import { BigNumber, Contract, ContractInterface, providers, utils, Wallet } from 'ethers';
import stringify from 'json-stable-stringify';
import retry from 'p-retry';
import timeout from 'p-timeout';
import { PendingTransaction } from './TxExecutor';

export type RetryErrorHandler = (i: number, e: Error) => void;

/**
 * Calls the given function, retrying it if there is an error.
 *
 * @todo Get rid of this, and make use of {@link ContractCaller}.
 */
export const callWithRetry = async <T>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fn: (...args: any[]) => Promise<T>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  args: any[] = [],
  onError?: RetryErrorHandler,
  maxRetries = DEFAULT_MAX_CALL_RETRIES,
  retryInterval = 1000
): Promise<T> => {
  return retry(() => fn(...args), {
    // TODO: Should we set maxRetryTime?
    retries: maxRetries,
    minTimeout: retryInterval,
    maxTimeout: 60_000,
    onFailedAttempt(e) {
      console.error(`error: ${e}`);
      console.log(`retrying (${e.attemptNumber + 1}/${maxRetries})...`);
      if (onError) {
        try {
          onError(e.attemptNumber, e);
        } catch (e) {
          console.log(`failed executing callWithRetry error handler`, e);
        }
      }
    },
  });
};

/**
 * Given the user's auto gas setting, and the current set of gas prices on the network, returns the
 * preferred gas price. If an invalid {@link AutoGasSetting} is provided, then returns undefined.
 */
export function getGasSettingGwei(
  setting: AutoGasSetting,
  gasPrices: GasPrices
): number | undefined {
  switch (setting) {
    case AutoGasSetting.Slow:
      return gasPrices.slow;
    case AutoGasSetting.Average:
      return gasPrices.average;
    case AutoGasSetting.Fast:
      return gasPrices.fast;
    default:
      return undefined;
  }
}

/**
 * A function that just never resolves.s
 */
export function neverResolves(): Promise<void> {
  return new Promise(() => {});
}

/**
 * A useful utility function that breaks up the proverbial number line (defined by {@code total} and
 * {@code querySize}), and calls {@code getterFn} for each of the sections on the number line.
 *
 * @param total the total amount of of items to get
 * @param querySize the chunk size
 * @param getterFn a function that fetches something, given a start index and end index
 * @param onProgress whenever a chunk is loaded, this function is called with the fraction of
 * individual items that have been loaded so far.
 * @param offset the index to start fetching, can be used to skip previously fetched elements.
 * @returns a list of each of the individual items that were loaded.
 */
export const aggregateBulkGetter = async <T>(
  total: number,
  querySize: number,
  getterFn: (startIdx: number, endIdx: number) => Promise<T[]>,
  // the parameter to this function is a value between 0 and 1. We guarantee at least one call to
  // `onProgress` if you provide it. The guaranteed call is the one at the end, where the value is 1.
  onProgress?: (fractionCompleted: number) => void,
  offset = 0
): Promise<T[]> => {
  const promises: Promise<T[]>[] = [];
  let loadedSoFar = 0;

  for (let page = 0; page * querySize + offset < total; page += 1) {
    const start = page * querySize + offset;
    const end = Math.min((page + 1) * querySize + offset, total);
    const loadedThisBatch = end - start;
    promises.push(
      new Promise<T[]>(async (resolve) => {
        let res: T[] = [];
        while (res.length === 0) {
          res = await getterFn(start, end);
          loadedSoFar += loadedThisBatch;
          onProgress && onProgress(loadedSoFar / total);
        }

        resolve(res);
      })
    );
  }

  const unflattenedResults = await Promise.all(promises);

  onProgress && onProgress(1);

  return unflattenedResults.flat();
};

/**
 * Given a transaction hash and a JsonRpcProvider, waits for the given transaction to complete.
 */
export function waitForTransaction(
  provider: JsonRpcProvider,
  txHash: string
): Promise<TransactionReceipt> {
  return retry(
    async (tries) => {
      console.log(`[wait-tx] WAITING ON tx hash: ${txHash} tries ${tries}`);

      try {
        const receipt = await timeout(provider.getTransactionReceipt(txHash), 30 * 1000);

        if (receipt) {
          console.log(`[wait-tx] FINISHED tx hash: ${txHash} tries ${tries}`);
          return receipt;
        } else {
          return Promise.reject(new Error("couldn't get receipt"));
        }
      } catch (e) {
        console.error(`[wait-tx] TIMED OUT tx hash: ${txHash} tries ${tries} error:`, e);
        return Promise.reject(e);
      }
    },
    {
      // TODO: Should we set maxRetryTime?
      retries: DEFAULT_MAX_CALL_RETRIES,
      minTimeout: 5000,
      maxTimeout: 60_000,
      factor: 1.5,
      onFailedAttempt(e) {
        console.log(`[wait-tx] SLEEPING tx hash: ${txHash} tries ${e.attemptNumber} sleeping...`);
      },
    }
  );
}

/**
 * @param contractAddress the address of the contract you want to connect to
 * @param contractABI a javacript object representing the ABI
 */
export function createContract<C extends Contract>(
  contractAddress: string,
  contractABI: ContractInterface,
  provider: JsonRpcProvider,
  signer?: Wallet
): C {
  return new Contract(contractAddress, contractABI, signer ?? provider) as C;
}

/**
 * Creates a new {@link JsonRpcProvider}, and makes sure that it's connected to xDai if we're in
 * production.
 */
export function makeProvider(rpcUrl: string): JsonRpcProvider {
  let provider;

  if (rpcUrl.startsWith('wss://')) {
    provider = new providers.WebSocketProvider(rpcUrl);
  } else {
    provider = new providers.StaticJsonRpcProvider(rpcUrl);
    provider.pollingInterval = 8000;
  }

  return provider;
}

/**
 * Ensures that the given message was properly signed.
 */
export function assertProperlySigned(message: SignedMessage<unknown>): void {
  const preSigned = stringify(message.message);

  if (!verifySignature(preSigned, message.signature as string, message.sender as EthAddress)) {
    throw new Error(`failed to verify: ${message}`);
  }
}

/**
 * Returns whether or not the given message was signed by the given address.
 */
export function verifySignature(message: string, signature: string, address: EthAddress): boolean {
  return utils.verifyMessage(message, signature).toLowerCase() === address;
}

/**
 * Returns the given amount of gwei in wei as a big integer.
 */
export function gweiToWei(gwei: number): BigNumber {
  return utils.parseUnits(gwei + '', 'gwei');
}

/**
 * Returns the given amount of wei in gwei as a number.
 */
export function weiToGwei(wei: BigNumber): number {
  return parseFloat(utils.formatUnits(wei, 'gwei'));
}

/**
 * Returns the given amount of wei in gwei as a number.
 */
export function weiToEth(wei: BigNumber): number {
  return parseFloat(utils.formatEther(wei));
}

/**
 * Returns the given amount of eth in wei as a big integer.
 */
export function ethToWei(eth: number): BigNumber {
  return utils.parseEther(eth + '');
}

/**
 * Whether or not some value is being transferred in this transaction.
 */
export function isPurchase(tx: providers.TransactionRequest): boolean {
  return tx.value !== undefined && tx.value > 0;
}

/**
 * When you submit a transaction via {@link TxExecutor}, you are given a {@link PendingTransaction}.
 * This function either resolves when the transaction confirms, or rejects if there is any error.
 */
export async function getResult(
  pendingTransaction: PendingTransaction
): Promise<TransactionReceipt> {
  const [_submitted, confirmed] = await Promise.all([
    pendingTransaction.submitted,
    pendingTransaction.confirmed,
  ]);

  return confirmed;
}
