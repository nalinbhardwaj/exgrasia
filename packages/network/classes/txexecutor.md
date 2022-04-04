# Class: TxExecutor

## Table of contents

### Constructors

- [constructor](TxExecutor.md#constructor)

### Properties

- [afterTransaction](TxExecutor.md#aftertransaction)
- [beforeTransaction](TxExecutor.md#beforetransaction)
- [defaultTxOptions](TxExecutor.md#defaulttxoptions)
- [diagnosticsUpdater](TxExecutor.md#diagnosticsupdater)
- [ethConnection](TxExecutor.md#ethconnection)
- [gasSettingProvider](TxExecutor.md#gassettingprovider)
- [lastTransactionTimestamp](TxExecutor.md#lasttransactiontimestamp)
- [nonce](TxExecutor.md#nonce)
- [queue](TxExecutor.md#queue)
- [NONCE_STALE_AFTER_MS](TxExecutor.md#nonce_stale_after_ms)
- [TX_SUBMIT_TIMEOUT](TxExecutor.md#tx_submit_timeout)

### Methods

- [execute](TxExecutor.md#execute)
- [maybeUpdateNonce](TxExecutor.md#maybeupdatenonce)
- [queueTransaction](TxExecutor.md#queuetransaction)
- [setDiagnosticUpdater](TxExecutor.md#setdiagnosticupdater)

## Constructors

### constructor

• **new TxExecutor**(`ethConnection`, `gasSettingProvider`, `beforeTransaction?`, `afterTransaction?`)

#### Parameters

| Name                 | Type                                                              |
| :------------------- | :---------------------------------------------------------------- |
| `ethConnection`      | [`EthConnection`](EthConnection.md)                               |
| `gasSettingProvider` | [`GasPriceSettingProvider`](../README.md#gaspricesettingprovider) |
| `beforeTransaction?` | [`BeforeTransaction`](../README.md#beforetransaction)             |
| `afterTransaction?`  | [`AfterTransaction`](../README.md#aftertransaction)               |

## Properties

### afterTransaction

• `Private` `Optional` `Readonly` **afterTransaction**: [`AfterTransaction`](../README.md#aftertransaction)

If present, called after every transaction with the transaction info as well as its performance
metrics.

---

### beforeTransaction

• `Private` `Optional` `Readonly` **beforeTransaction**: [`BeforeTransaction`](../README.md#beforetransaction)

If present, called before every transaction, to give the user of [TxExecutor](TxExecutor.md) the
opportunity to cancel the event by throwing an exception. Useful for interstitials.

---

### defaultTxOptions

• `Private` **defaultTxOptions**: `TransactionRequest`

Unless overridden, these are the default transaction options each blockchain transaction will
be sent with.

---

### diagnosticsUpdater

• `Private` `Optional` **diagnosticsUpdater**: `DiagnosticUpdater`

Allows us to record some diagnostics that appear in the DiagnosticsPane of the Dark Forest client.

---

### ethConnection

• `Private` `Readonly` **ethConnection**: [`EthConnection`](EthConnection.md)

Our interface to the blockchain.

---

### gasSettingProvider

• `Private` `Readonly` **gasSettingProvider**: [`GasPriceSettingProvider`](../README.md#gaspricesettingprovider)

Communicates to the [TxExecutor](TxExecutor.md) the gas price we should be paying for each transaction,
if there is not a manual gas price specified for that transaction.

---

### lastTransactionTimestamp

• `Private` **lastTransactionTimestamp**: `number`

We record the last transaction timestamp so that we know when it's a good time to refresh the
nonce.

---

### nonce

• `Private` **nonce**: `undefined` \| `number`

All Ethereum transactions have a nonce. The nonce should strictly increase with each
transaction.

---

### queue

• `Private` `Readonly` **queue**: [`ThrottledConcurrentQueue`](ThrottledConcurrentQueue.md)

Task queue which executes transactions in a controlled manner.

---

### NONCE_STALE_AFTER_MS

▪ `Static` `Private` `Readonly` **NONCE_STALE_AFTER_MS**: `5000`

We refresh the nonce if it hasn't been updated in this amount of time.

---

### TX_SUBMIT_TIMEOUT

▪ `Static` `Private` `Readonly` **TX_SUBMIT_TIMEOUT**: `30000`

A transaction is considered to have errored if haven't successfully submitted to mempool within
this amount of time.

## Methods

### execute

▸ `Private` **execute**(`txRequest`): `Promise`<`void`\>

Executes the given queued transaction. This is a field rather than a method declaration on
purpose for `this` purposes.

#### Parameters

| Name        | Type                                                      |
| :---------- | :-------------------------------------------------------- |
| `txRequest` | [`QueuedTransaction`](../interfaces/QueuedTransaction.md) |

#### Returns

`Promise`<`void`\>

---

### maybeUpdateNonce

▸ `Private` **maybeUpdateNonce**(): `Promise`<`void`\>

If the nonce is probably stale, reload it from the blockchain.

#### Returns

`Promise`<`void`\>

---

### queueTransaction

▸ **queueTransaction**(`actionId`, `contract`, `methodName`, `args`, `overrides?`): [`PendingTransaction`](../interfaces/PendingTransaction.md)

Schedules this transaction for execution.

#### Parameters

| Name         | Type                 |
| :----------- | :------------------- |
| `actionId`   | `string`             |
| `contract`   | `Contract`           |
| `methodName` | `string`             |
| `args`       | `unknown`[]          |
| `overrides`  | `TransactionRequest` |

#### Returns

[`PendingTransaction`](../interfaces/PendingTransaction.md)

---

### setDiagnosticUpdater

▸ **setDiagnosticUpdater**(`diagnosticUpdater?`): `void`

#### Parameters

| Name                 | Type                |
| :------------------- | :------------------ |
| `diagnosticUpdater?` | `DiagnosticUpdater` |

#### Returns

`void`
