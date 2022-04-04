# fork of @darkforest_eth/network at 6.6.6

# @darkforest_eth/network

This package contains functions and classes useful for communicating with the blockchain.

## Installation

You can install this package using [`npm`](https://www.npmjs.com) or
[`yarn`](https://classic.yarnpkg.com/lang/en/) by running:

```bash
npm install --save @darkforest_eth/network
```

```bash
yarn add @darkforest_eth/network
```

When using this in a plugin, you might want to load it with [skypack](https://www.skypack.dev)

```js
import * as network from 'http://cdn.skypack.dev/@darkforest_eth/network';
```

## Table of contents

### Classes

- [ContractCaller](classes/ContractCaller.md)
- [EthConnection](classes/EthConnection.md)
- [ThrottledConcurrentQueue](classes/ThrottledConcurrentQueue.md)
- [TxExecutor](classes/TxExecutor.md)

### Interfaces

- [ConcurrentQueueConfiguration](interfaces/ConcurrentQueueConfiguration.md)
- [PendingTransaction](interfaces/PendingTransaction.md)
- [Queue](interfaces/Queue.md)
- [QueuedTransaction](interfaces/QueuedTransaction.md)

### Type aliases

- [AfterTransaction](README.md#aftertransaction)
- [BeforeTransaction](README.md#beforetransaction)
- [ContractLoader](README.md#contractloader)
- [GasPriceSettingProvider](README.md#gaspricesettingprovider)
- [RetryErrorHandler](README.md#retryerrorhandler)

### Functions

- [aggregateBulkGetter](README.md#aggregatebulkgetter)
- [assertProperlySigned](README.md#assertproperlysigned)
- [callWithRetry](README.md#callwithretry)
- [createContract](README.md#createcontract)
- [createEthConnection](README.md#createethconnection)
- [ethToWei](README.md#ethtowei)
- [getAutoGasPrices](README.md#getautogasprices)
- [getGasSettingGwei](README.md#getgassettinggwei)
- [getResult](README.md#getresult)
- [gweiToWei](README.md#gweitowei)
- [isPurchase](README.md#ispurchase)
- [makeProvider](README.md#makeprovider)
- [neverResolves](README.md#neverresolves)
- [verifySignature](README.md#verifysignature)
- [waitForTransaction](README.md#waitfortransaction)
- [weiToEth](README.md#weitoeth)
- [weiToGwei](README.md#weitogwei)

## Type aliases

### AfterTransaction

Ƭ **AfterTransaction**: (`transactionRequest`: [`QueuedTransaction`](interfaces/QueuedTransaction.md), `performanceMetrics`: `unknown`) => `Promise`<`void`\>

#### Type declaration

▸ (`transactionRequest`, `performanceMetrics`): `Promise`<`void`\>

[TxExecutor](classes/TxExecutor.md) calls this after executing a transaction.

##### Parameters

| Name                 | Type                                                   |
| :------------------- | :----------------------------------------------------- |
| `transactionRequest` | [`QueuedTransaction`](interfaces/QueuedTransaction.md) |
| `performanceMetrics` | `unknown`                                              |

##### Returns

`Promise`<`void`\>

---

### BeforeTransaction

Ƭ **BeforeTransaction**: (`transactionRequest`: [`QueuedTransaction`](interfaces/QueuedTransaction.md)) => `Promise`<`void`\>

#### Type declaration

▸ (`transactionRequest`): `Promise`<`void`\>

[TxExecutor](classes/TxExecutor.md) calls this before executing a function to determine whether or not that
function should execute. If this function throws, the transaction is cancelled.

##### Parameters

| Name                 | Type                                                   |
| :------------------- | :----------------------------------------------------- |
| `transactionRequest` | [`QueuedTransaction`](interfaces/QueuedTransaction.md) |

##### Returns

`Promise`<`void`\>

---

### ContractLoader

Ƭ **ContractLoader**<`T`\>: (`address`: `string`, `provider`: `providers.JsonRpcProvider`, `signer?`: `Wallet`) => `Promise`<`T`\>

#### Type parameters

| Name | Type               |
| :--- | :----------------- |
| `T`  | extends `Contract` |

#### Type declaration

▸ (`address`, `provider`, `signer?`): `Promise`<`T`\>

##### Parameters

| Name       | Type                        |
| :--------- | :-------------------------- |
| `address`  | `string`                    |
| `provider` | `providers.JsonRpcProvider` |
| `signer?`  | `Wallet`                    |

##### Returns

`Promise`<`T`\>

---

### GasPriceSettingProvider

Ƭ **GasPriceSettingProvider**: (`transactionRequest`: [`QueuedTransaction`](interfaces/QueuedTransaction.md)) => `AutoGasSetting` \| `string`

#### Type declaration

▸ (`transactionRequest`): `AutoGasSetting` \| `string`

Returns either a string that represents the gas price we should use by default for transactions,
or a string that represents the fact that we should be using one of the automatic gas prices.

##### Parameters

| Name                 | Type                                                   |
| :------------------- | :----------------------------------------------------- |
| `transactionRequest` | [`QueuedTransaction`](interfaces/QueuedTransaction.md) |

##### Returns

`AutoGasSetting` \| `string`

---

### RetryErrorHandler

Ƭ **RetryErrorHandler**: (`i`: `number`, `e`: `Error`) => `void`

#### Type declaration

▸ (`i`, `e`): `void`

##### Parameters

| Name | Type     |
| :--- | :------- |
| `i`  | `number` |
| `e`  | `Error`  |

##### Returns

`void`

## Functions

### aggregateBulkGetter

▸ `Const` **aggregateBulkGetter**<`T`\>(`total`, `querySize`, `getterFn`, `onProgress?`, `offset?`): `Promise`<`T`[]\>

A useful utility function that breaks up the proverbial number line (defined by {@code total} and
{@code querySize}), and calls {@code getterFn} for each of the sections on the number line.

#### Type parameters

| Name |
| :--- |
| `T`  |

#### Parameters

| Name          | Type                                                            | Default value | Description                                                                                                             |
| :------------ | :-------------------------------------------------------------- | :------------ | :---------------------------------------------------------------------------------------------------------------------- |
| `total`       | `number`                                                        | `undefined`   | the total amount of of items to get                                                                                     |
| `querySize`   | `number`                                                        | `undefined`   | the chunk size                                                                                                          |
| `getterFn`    | (`startIdx`: `number`, `endIdx`: `number`) => `Promise`<`T`[]\> | `undefined`   | a function that fetches something, given a start index and end index                                                    |
| `onProgress?` | (`fractionCompleted`: `number`) => `void`                       | `undefined`   | whenever a chunk is loaded, this function is called with the fraction of individual items that have been loaded so far. |
| `offset`      | `number`                                                        | `0`           | the index to start fetching, can be used to skip previously fetched elements.                                           |

#### Returns

`Promise`<`T`[]\>

a list of each of the individual items that were loaded.

---

### assertProperlySigned

▸ **assertProperlySigned**(`message`): `void`

Ensures that the given message was properly signed.

#### Parameters

| Name      | Type                        |
| :-------- | :-------------------------- |
| `message` | `SignedMessage`<`unknown`\> |

#### Returns

`void`

---

### callWithRetry

▸ `Const` **callWithRetry**<`T`\>(`fn`, `args?`, `onError?`, `maxRetries?`, `retryInterval?`): `Promise`<`T`\>

Calls the given function, retrying it if there is an error.

**`todo`** Get rid of this, and make use of [ContractCaller](classes/ContractCaller.md).

#### Type parameters

| Name |
| :--- |
| `T`  |

#### Parameters

| Name            | Type                                               | Default value |
| :-------------- | :------------------------------------------------- | :------------ |
| `fn`            | (...`args`: `any`[]) => `Promise`<`T`\>            | `undefined`   |
| `args`          | `any`[]                                            | `[]`          |
| `onError?`      | [`RetryErrorHandler`](README.md#retryerrorhandler) | `undefined`   |
| `maxRetries`    | `12`                                               | `undefined`   |
| `retryInterval` | `number`                                           | `1000`        |

#### Returns

`Promise`<`T`\>

---

### createContract

▸ **createContract**<`C`\>(`contractAddress`, `contractABI`, `provider`, `signer?`): `C`

#### Type parameters

| Name | Type                     |
| :--- | :----------------------- |
| `C`  | extends `Contract`<`C`\> |

#### Parameters

| Name              | Type                | Description                                        |
| :---------------- | :------------------ | :------------------------------------------------- |
| `contractAddress` | `string`            | the address of the contract you want to connect to |
| `contractABI`     | `ContractInterface` | a javacript object representing the ABI            |
| `provider`        | `JsonRpcProvider`   | -                                                  |
| `signer?`         | `Wallet`            | -                                                  |

#### Returns

`C`

---

### createEthConnection

▸ **createEthConnection**(`rpcUrl`): `Promise`<[`EthConnection`](classes/EthConnection.md)\>

#### Parameters

| Name     | Type     |
| :------- | :------- |
| `rpcUrl` | `string` |

#### Returns

`Promise`<[`EthConnection`](classes/EthConnection.md)\>

---

### ethToWei

▸ **ethToWei**(`eth`): `BigNumber`

Returns the given amount of eth in wei as a big integer.

#### Parameters

| Name  | Type     |
| :---- | :------- |
| `eth` | `number` |

#### Returns

`BigNumber`

---

### getAutoGasPrices

▸ **getAutoGasPrices**(): `Promise`<`GasPrices`\>

Gets the current gas prices from xDai's price oracle. If the oracle is broken, return some sane
defaults.

#### Returns

`Promise`<`GasPrices`\>

---

### getGasSettingGwei

▸ **getGasSettingGwei**(`setting`, `gasPrices`): `number` \| `undefined`

Given the user's auto gas setting, and the current set of gas prices on the network, returns the
preferred gas price. If an invalid {@link AutoGasSetting} is provided, then returns undefined.

#### Parameters

| Name        | Type             |
| :---------- | :--------------- |
| `setting`   | `AutoGasSetting` |
| `gasPrices` | `GasPrices`      |

#### Returns

`number` \| `undefined`

---

### getResult

▸ **getResult**(`pendingTransaction`): `Promise`<`TransactionReceipt`\>

When you submit a transaction via [TxExecutor](classes/TxExecutor.md), you are given a [PendingTransaction](interfaces/PendingTransaction.md).
This function either resolves when the transaction confirms, or rejects if there is any error.

#### Parameters

| Name                 | Type                                                     |
| :------------------- | :------------------------------------------------------- |
| `pendingTransaction` | [`PendingTransaction`](interfaces/PendingTransaction.md) |

#### Returns

`Promise`<`TransactionReceipt`\>

---

### gweiToWei

▸ **gweiToWei**(`gwei`): `BigNumber`

Returns the given amount of gwei in wei as a big integer.

#### Parameters

| Name   | Type     |
| :----- | :------- |
| `gwei` | `number` |

#### Returns

`BigNumber`

---

### isPurchase

▸ **isPurchase**(`tx`): `boolean`

Whether or not some value is being transferred in this transaction.

#### Parameters

| Name | Type                           |
| :--- | :----------------------------- |
| `tx` | `providers.TransactionRequest` |

#### Returns

`boolean`

---

### makeProvider

▸ **makeProvider**(`rpcUrl`): `JsonRpcProvider`

Creates a new {@link JsonRpcProvider}, and makes sure that it's connected to xDai if we're in
production.

#### Parameters

| Name     | Type     |
| :------- | :------- |
| `rpcUrl` | `string` |

#### Returns

`JsonRpcProvider`

---

### neverResolves

▸ **neverResolves**(): `Promise`<`void`\>

A function that just never resolves.s

#### Returns

`Promise`<`void`\>

---

### verifySignature

▸ **verifySignature**(`message`, `signature`, `address`): `boolean`

Returns whether or not the given message was signed by the given address.

#### Parameters

| Name        | Type         |
| :---------- | :----------- |
| `message`   | `string`     |
| `signature` | `string`     |
| `address`   | `EthAddress` |

#### Returns

`boolean`

---

### waitForTransaction

▸ **waitForTransaction**(`provider`, `txHash`): `Promise`<`TransactionReceipt`\>

Given a transaction hash and a JsonRpcProvider, waits for the given transaction to complete.

#### Parameters

| Name       | Type              |
| :--------- | :---------------- |
| `provider` | `JsonRpcProvider` |
| `txHash`   | `string`          |

#### Returns

`Promise`<`TransactionReceipt`\>

---

### weiToEth

▸ **weiToEth**(`wei`): `number`

Returns the given amount of wei in gwei as a number.

#### Parameters

| Name  | Type        |
| :---- | :---------- |
| `wei` | `BigNumber` |

#### Returns

`number`

---

### weiToGwei

▸ **weiToGwei**(`wei`): `number`

Returns the given amount of wei in gwei as a number.

#### Parameters

| Name  | Type        |
| :---- | :---------- |
| `wei` | `BigNumber` |

#### Returns

`number`
