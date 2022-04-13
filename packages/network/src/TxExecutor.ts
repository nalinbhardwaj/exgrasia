import { AutoGasSetting, DiagnosticUpdater, NetworkEvent } from '@darkforest_eth/types';
import { Contract, providers } from 'ethers';
import deferred from 'p-defer';
import timeout from 'p-timeout';
import { ConcurrentQueueConfiguration } from '.';
import { EthConnection } from './EthConnection';
import { gweiToWei } from './Network';
import { ThrottledConcurrentQueue } from './ThrottledConcurrentQueue';

/**
 * Returns either a string that represents the gas price we should use by default for transactions,
 * or a string that represents the fact that we should be using one of the automatic gas prices.
 */
export type GasPriceSettingProvider = (
  transactionRequest: QueuedTransaction
) => AutoGasSetting | string;

/**
 * {@link TxExecutor} calls this before executing a function to determine whether or not that
 * function should execute. If this function throws, the transaction is cancelled.
 */
export type BeforeTransaction = (transactionRequest: QueuedTransaction) => Promise<void>;

/**
 * {@link TxExecutor} calls this after executing a transaction.
 */
export type AfterTransaction = (
  transactionRequest: QueuedTransaction,
  performanceMetrics: unknown
) => Promise<void>;

/**
 * Represents a transaction that the game would like to submit to the blockchain.
 */
export interface QueuedTransaction {
  /**
   * Uniquely identifies this transaction. Invariant throughout the entire life of a transaction,
   * from the moment the game conceives of taking that action, to the moment that it finishes either
   * successfully or with an error.
   */
  actionId: string;

  /**
   * Called if there was an error submitting this transaction.
   */
  onSubmissionError: (e: Error | undefined) => void;

  /**
   * Called if there was an error waiting for this transaction to complete.
   */
  onReceiptError: (e: Error | undefined) => void;

  /**
   * Called when the transaction was successfully submitted to the mempool.
   */
  onTransactionResponse: (e: providers.TransactionResponse) => void;

  /**
   * Called when the transaction successfully completes.
   */
  onTransactionReceipt: (e: providers.TransactionReceipt) => void;

  /**
   * The contract on which to execute this transaction.
   */
  contract: Contract;

  /**
   * The name of the contract method to execute.
   */
  methodName: string;

  /**
   * The arguments we should pass to the method we're executing.
   */
  args: unknown[];

  /**
   * Allows the submitter of the transaction to override some low-level blockchain transaction
   * settings, such as the gas price.
   */
  overrides: providers.TransactionRequest;

  /**
   * If the user provided an auto gas setting, record that here for logging purposes.
   */
  autoGasPriceSetting?: AutoGasSetting | string;
}

/**
 * Represents a transaction that is in flight.
 */
export interface PendingTransaction {
  /**
   * Resolves or rejects depending on the success or failure of this transaction to get into the
   * mempool. If this rejects, {@link PendingTransaction.confirmed} neither rejects nor resolves.
   */
  submitted: Promise<providers.TransactionResponse>;

  /**
   * Resolves or rejects depending on the success or failure of this transaction to execute.
   */
  confirmed: Promise<providers.TransactionReceipt>;
}

export class TxExecutor {
  /**
   * A transaction is considered to have errored if haven't successfully submitted to mempool within
   * this amount of time.
   */
  private static readonly TX_SUBMIT_TIMEOUT = 30000;

  /**
   * We refresh the nonce if it hasn't been updated in this amount of time.
   */
  private static readonly NONCE_STALE_AFTER_MS = 5_000;

  /**
   * Our interface to the blockchain.
   */
  private readonly ethConnection: EthConnection;

  /**
   * If present, called before every transaction, to give the user of {@link TxExecutor} the
   * opportunity to cancel the event by throwing an exception. Useful for interstitials.
   */
  private readonly beforeTransaction?: BeforeTransaction;

  /**
   * If present, called after every transaction with the transaction info as well as its performance
   * metrics.
   */
  private readonly afterTransaction?: AfterTransaction;

  /**
   * Task queue which executes transactions in a controlled manner.
   */
  private readonly queue: ThrottledConcurrentQueue;

  /**
   * We record the last transaction timestamp so that we know when it's a good time to refresh the
   * nonce.
   */
  private lastTransactionTimestamp: number;

  /**
   * All Ethereum transactions have a nonce. The nonce should strictly increase with each
   * transaction.
   */
  private nonce: number | undefined;

  /**
   * Allows us to record some diagnostics that appear in the DiagnosticsPane of the Dark Forest client.
   */
  private diagnosticsUpdater?: DiagnosticUpdater;

  /**
   * Unless overridden, these are the default transaction options each blockchain transaction will
   * be sent with.
   */
  private defaultTxOptions: providers.TransactionRequest = {
    gasLimit: 15_000_000,
  };

  constructor(
    ethConnection: EthConnection,
    beforeTransaction?: BeforeTransaction,
    afterTransaction?: AfterTransaction,
    queueConfiguration?: ConcurrentQueueConfiguration
  ) {
    this.queue = new ThrottledConcurrentQueue(
      queueConfiguration ?? {
        invocationIntervalMs: 200,
        maxInvocationsPerIntervalMs: 3,
        maxConcurrency: 1,
      }
    );
    this.lastTransactionTimestamp = Date.now();
    this.ethConnection = ethConnection;
    this.beforeTransaction = beforeTransaction;
    this.afterTransaction = afterTransaction;
  }

  /**
   * Schedules this transaction for execution.
   */
  public queueTransaction(
    actionId: string,
    contract: Contract,
    methodName: string,
    args: unknown[],
    overrides: providers.TransactionRequest = {
      gasPrice: undefined,
      gasLimit: 15000000,
    }
  ): PendingTransaction {
    this.diagnosticsUpdater?.updateDiagnostics((d) => {
      d.transactionsInQueue++;
    });

    const {
      promise: submittedPromise,
      reject: rejectTxResponse,
      resolve: txResponse,
    } = deferred<providers.TransactionResponse>();

    const {
      promise: receiptPromise,
      reject: rejectTxReceipt,
      resolve: txReceipt,
    } = deferred<providers.TransactionReceipt>();

    const txRequest: QueuedTransaction = {
      methodName,
      actionId,
      contract,
      args,
      overrides,
      onSubmissionError: rejectTxResponse,
      onReceiptError: rejectTxReceipt,
      onTransactionResponse: txResponse,
      onTransactionReceipt: txReceipt,
    };

    if (overrides.gasPrice === undefined) {
      txRequest.overrides.gasPrice = gweiToWei(
        this.ethConnection.getAutoGasPriceGwei(this.ethConnection.getAutoGasPrices())
      );
    }

    this.queue.add(() => {
      this.diagnosticsUpdater?.updateDiagnostics((d) => {
        d.transactionsInQueue--;
      });

      return this.execute(txRequest);
    });

    return {
      submitted: submittedPromise,
      confirmed: receiptPromise,
    };
  }

  /**
   * If the nonce is probably stale, reload it from the blockchain.
   */
  private async maybeUpdateNonce() {
    if (
      this.nonce === undefined ||
      Date.now() - this.lastTransactionTimestamp > TxExecutor.NONCE_STALE_AFTER_MS
    ) {
      const newNonce = await this.ethConnection.getNonce();
      if (newNonce !== undefined) this.nonce = newNonce;
    }
  }

  /**
   * Executes the given queued transaction. This is a field rather than a method declaration on
   * purpose for `this` purposes.
   */
  private execute = async (txRequest: QueuedTransaction) => {
    let time_called: number | undefined = undefined;
    let error: Error | undefined = undefined;
    let time_submitted: number | undefined = undefined;
    let time_confirmed: number | undefined = undefined;
    let time_errored: number | undefined = undefined;
    let tx_hash: string | undefined = undefined;

    const time_exec_called = Date.now();

    try {
      await this.maybeUpdateNonce();

      if (this.beforeTransaction) {
        await this.beforeTransaction(txRequest);
      }

      const requestWithDefaults = Object.assign(
        JSON.parse(JSON.stringify(this.defaultTxOptions)),
        txRequest.overrides
      );

      time_called = Date.now();
      const submitted = await timeout<providers.TransactionResponse>(
        txRequest.contract[txRequest.methodName](...txRequest.args, {
          ...requestWithDefaults,
          nonce: this.nonce,
        }),
        TxExecutor.TX_SUBMIT_TIMEOUT,
        `tx request ${txRequest.actionId} failed to submit: timed out}`
      );
      time_submitted = Date.now();
      tx_hash = submitted.hash;
      if (this.nonce !== undefined) {
        this.nonce += 1;
      }
      this.lastTransactionTimestamp = time_submitted;
      txRequest.onTransactionResponse(submitted);

      const confirmed = await this.ethConnection.waitForTransaction(submitted.hash);
      if (confirmed.status !== 1) {
        time_errored = Date.now();
        const errTx = await this.ethConnection.getProvider().getTransaction(submitted.hash);
        try {
          //@ts-expect-error
          await this.ethConnection.getProvider().call(errTx);
        } catch (err: any) {
          console.error(err.error.message);
          throw new Error(err.error.message);
        }
      } else {
        time_confirmed = Date.now();
        txRequest.onTransactionReceipt(confirmed);
      }
    } catch (e) {
      console.error(e);
      error = e as Error;
      if (!time_submitted) {
        time_errored = Date.now();
        txRequest.onSubmissionError(error);
      } else {
        // Ran out of retries, set nonce to undefined to refresh it
        if (!time_errored) {
          this.nonce = undefined;
          time_errored = Date.now();
        }
        txRequest.onReceiptError(error);
      }
    } finally {
      this.diagnosticsUpdater?.updateDiagnostics((d) => {
        d.totalTransactions++;
      });
    }

    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    const logEvent: NetworkEvent = {
      tx_to: txRequest.contract.address,
      tx_type: txRequest.methodName,
      auto_gas_price_setting: txRequest.autoGasPriceSetting,
      time_exec_called,
      tx_hash,
    };

    if (time_called && time_submitted) {
      logEvent.wait_submit = time_submitted - time_called;
      if (time_confirmed) {
        logEvent.wait_confirm = time_confirmed - time_called;
      }
    }

    if (error && time_errored) {
      logEvent.error = error.message || JSON.stringify(error);
      logEvent.wait_error = time_errored - time_exec_called;

      try {
        /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
        if ((error as any).body) {
          /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
          logEvent.parsed_error = String.fromCharCode.apply(null, (error as any).body || []);
        }
      } catch (e) {}
    }

    logEvent.rpc_endpoint = this.ethConnection.getRpcEndpoint();
    logEvent.user_address = this.ethConnection.getAddress();

    this.afterTransaction && this.afterTransaction(txRequest, logEvent);
  };

  public setDiagnosticUpdater(diagnosticUpdater?: DiagnosticUpdater) {
    this.diagnosticsUpdater = diagnosticUpdater;
  }
}
