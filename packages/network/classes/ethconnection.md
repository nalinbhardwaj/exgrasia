# Class: EthConnection

Responsible for

1. loading the contracts
2. connecting to the network

## Table of contents

### Constructors

- [constructor](EthConnection.md#constructor)

### Properties

- [balance](EthConnection.md#balance)
- [balanceInterval](EthConnection.md#balanceinterval)
- [blockNumber](EthConnection.md#blocknumber)
- [blockNumber$](EthConnection.md#blocknumber$)
- [contracts](EthConnection.md#contracts)
- [diagnosticsUpdater](EthConnection.md#diagnosticsupdater)
- [gasPrices](EthConnection.md#gasprices)
- [gasPrices$](EthConnection.md#gasprices$)
- [gasPricesInterval](EthConnection.md#gaspricesinterval)
- [loaders](EthConnection.md#loaders)
- [myBalance$](EthConnection.md#mybalance$)
- [provider](EthConnection.md#provider)
- [rpcChanged$](EthConnection.md#rpcchanged$)
- [signer](EthConnection.md#signer)

### Methods

- [destroy](EthConnection.md#destroy)
- [getAddress](EthConnection.md#getaddress)
- [getAutoGasPriceGwei](EthConnection.md#getautogaspricegwei)
- [getAutoGasPrices](EthConnection.md#getautogasprices)
- [getContract](EthConnection.md#getcontract)
- [getMyBalance](EthConnection.md#getmybalance)
- [getNonce](EthConnection.md#getnonce)
- [getPrivateKey](EthConnection.md#getprivatekey)
- [getProvider](EthConnection.md#getprovider)
- [getRpcEndpoint](EthConnection.md#getrpcendpoint)
- [getSigner](EthConnection.md#getsigner)
- [hasSigner](EthConnection.md#hassigner)
- [loadBalance](EthConnection.md#loadbalance)
- [loadContract](EthConnection.md#loadcontract)
- [onNewBlock](EthConnection.md#onnewblock)
- [processEvents](EthConnection.md#processevents)
- [refreshBalance](EthConnection.md#refreshbalance)
- [refreshGasPrices](EthConnection.md#refreshgasprices)
- [reloadContracts](EthConnection.md#reloadcontracts)
- [sendTransaction](EthConnection.md#sendtransaction)
- [setAccount](EthConnection.md#setaccount)
- [setDiagnosticUpdater](EthConnection.md#setdiagnosticupdater)
- [setRpcUrl](EthConnection.md#setrpcurl)
- [signMessage](EthConnection.md#signmessage)
- [startPolling](EthConnection.md#startpolling)
- [stopPolling](EthConnection.md#stoppolling)
- [subscribeToContractEvents](EthConnection.md#subscribetocontractevents)
- [waitForTransaction](EthConnection.md#waitfortransaction)

## Constructors

### constructor

• **new EthConnection**(`provider`)

#### Parameters

| Name       | Type              |
| :--------- | :---------------- |
| `provider` | `JsonRpcProvider` |

## Properties

### balance

• `Private` **balance**: `BigNumber`

This is kept relatively up-to-date with the balance of the player's wallet on the latest block
of whatever blockchain we're connected to.

---

### balanceInterval

• `Private` **balanceInterval**: `undefined` \| `Timeout`

Interval which reloads the balance of the account that this EthConnection is in charge of.

---

### blockNumber

• `Private` **blockNumber**: `number` = `0`

The current latest block number.

---

### blockNumber$

• `Readonly` **blockNumber$**: `Monomitter`<`number`\>

Publishes an event whenever the current block number changes. Can skip block numbers.

---

### contracts

• `Private` **contracts**: `Map`<`string`, `Contract`\>

Keep a reference to all the contracts this [EthConnection](EthConnection.md) has loaded so that they can be
reloaded if the RPC url changes.

Keyed by the contract address.

---

### diagnosticsUpdater

• `Private` **diagnosticsUpdater**: `undefined` \| `DiagnosticUpdater`

Allows [EthConnection](EthConnection.md) to update the global diagnostics, which are displayed in the game
client's diagnostics pane.

---

### gasPrices

• `Private` **gasPrices**: `GasPrices`

Represents the gas price one would pay to achieve the corresponding transaction confirmation
speed.

---

### gasPrices$

• `Readonly` **gasPrices$**: `Monomitter`<`GasPrices`\>

Publishes an event whenever the network's auto gas prices change.

---

### gasPricesInterval

• `Private` **gasPricesInterval**: `undefined` \| `Timeout`

Store this so we can cancel the interval.

---

### loaders

• `Private` **loaders**: `Map`<`string`, [`ContractLoader`](../README.md#contractloader)<`Contract`\>\>

Keep a reference to all the contract loaders this [EthConnection](EthConnection.md) has loaded
so that they can be reloaded if the RPC url changes.

Keyed by the contract address.

---

### myBalance$

• `Readonly` **myBalance$**: `Monomitter`<`BigNumber`\>

Any time the balance of the player's address changes, we publish an event here.

---

### provider

• `Private` **provider**: `JsonRpcProvider`

The provider is the lowest level interface we use to communicate with the blockchain.

---

### rpcChanged$

• **rpcChanged$**: `Monomitter`<`string`\>

Whenever the RPC url changes, we reload the contract, and also publish an event here.

---

### signer

• `Private` **signer**: `undefined` \| `Wallet`

It is possible to instantiate an EthConnection without a signer, in which case it is still able
to connect to the blockchain, without the ability to send transactions.

## Methods

### destroy

▸ **destroy**(): `void`

Cleans up any important handles.

#### Returns

`void`

---

### getAddress

▸ **getAddress**(): `undefined` \| `EthAddress`

Returns the address of the signer, if one was set.

#### Returns

`undefined` \| `EthAddress`

---

### getAutoGasPriceGwei

▸ **getAutoGasPriceGwei**(`gasPrices`, `gasPriceSetting`): `number`

Get the gas price, measured in Gwei, that we should send given the current prices for
transaction speeds, and given the user's gas price setting.

#### Parameters

| Name              | Type        |
| :---------------- | :---------- |
| `gasPrices`       | `GasPrices` |
| `gasPriceSetting` | `string`    |

#### Returns

`number`

---

### getAutoGasPrices

▸ **getAutoGasPrices**(): `GasPrices`

Gets a copy of the latest gas prices.

#### Returns

`GasPrices`

---

### getContract

▸ **getContract**<`T`\>(`address`): `T`

Retreives a contract from the registry. Must exist otherwise this will throw.

#### Type parameters

| Name | Type                     |
| :--- | :----------------------- |
| `T`  | extends `Contract`<`T`\> |

#### Parameters

| Name      | Type     | Description                            |
| :-------- | :------- | :------------------------------------- |
| `address` | `string` | The address to load from the registry. |

#### Returns

`T`

The contract requested

---

### getMyBalance

▸ **getMyBalance**(): `undefined` \| `BigNumber`

Gets the current balance of the burner wallet this [EthConnection](EthConnection.md) is in charge of.

#### Returns

`undefined` \| `BigNumber`

---

### getNonce

▸ **getNonce**(): `Promise`<`number`\>

Gets the signer's nonce, or `0`.

#### Returns

`Promise`<`number`\>

---

### getPrivateKey

▸ **getPrivateKey**(): `undefined` \| `string`

Returns the private key of the signer, if one was set.

#### Returns

`undefined` \| `string`

---

### getProvider

▸ **getProvider**(): `JsonRpcProvider`

Gets the provider this [EthConnection](EthConnection.md) is currently using. Don't store a reference to
this (unless you're writing plugins), as the provider can change.

#### Returns

`JsonRpcProvider`

---

### getRpcEndpoint

▸ **getRpcEndpoint**(): `string`

#### Returns

`string`

---

### getSigner

▸ **getSigner**(): `undefined` \| `Wallet`

Gets the wallet, which represents the account that this [EthConnection](EthConnection.md) sends
transactions on behalf of.

#### Returns

`undefined` \| `Wallet`

---

### hasSigner

▸ **hasSigner**(): `boolean`

#### Returns

`boolean`

---

### loadBalance

▸ **loadBalance**(`address`): `Promise`<`BigNumber`\>

Gets the balance of the given address (player or contract) measured in Wei. Wei is the base
unit in which amounts of Ether and xDai are measured.

**`see`** https://ethdocs.org/en/latest/ether.html#denominations

#### Parameters

| Name      | Type         |
| :-------- | :----------- |
| `address` | `EthAddress` |

#### Returns

`Promise`<`BigNumber`\>

---

### loadContract

▸ **loadContract**<`T`\>(`address`, `loader`): `Promise`<`T`\>

Loads a contract into this [EthConnection](EthConnection.md).

#### Type parameters

| Name | Type                     |
| :--- | :----------------------- |
| `T`  | extends `Contract`<`T`\> |

#### Parameters

| Name      | Type                                                  | Description                                            |
| :-------- | :---------------------------------------------------- | :----------------------------------------------------- |
| `address` | `string`                                              | The contract address to register the contract against. |
| `loader`  | [`ContractLoader`](../README.md#contractloader)<`T`\> | The loader used to load (or reload) this contract.     |

#### Returns

`Promise`<`T`\>

---

### onNewBlock

▸ `Private` **onNewBlock**(`latestBlockNumber`, `contract`, `handlers`, `eventFilter`): `void`

Whenever we become aware of the fact that there have been one or more new blocks mined on the
blockchain, we need to update the internal game state of the game to reflect everything that
has happnened in those blocks. The way we find out what happened during those blocks is by
filtering all the events that have occured in those blocks to those that represent the various
actions that can occur on the game.

#### Parameters

| Name                | Type                                   |
| :------------------ | :------------------------------------- |
| `latestBlockNumber` | `number`                               |
| `contract`          | `Contract`                             |
| `handlers`          | `Partial`<`Record`<`string`, `any`\>\> |
| `eventFilter`       | `EventFilter`                          |

#### Returns

`void`

---

### processEvents

▸ `Private` **processEvents**(`startBlock`, `endBlock`, `eventFilter`, `contract`, `handlers`): `Promise`<`void`\>

Downloads and processes all the events that have occurred in the given range of blocks.

#### Parameters

| Name          | Type                                   | Description |
| :------------ | :------------------------------------- | :---------- |
| `startBlock`  | `number`                               | inclusive   |
| `endBlock`    | `number`                               | inclusive   |
| `eventFilter` | `EventFilter`                          | -           |
| `contract`    | `Contract`                             | -           |
| `handlers`    | `Partial`<`Record`<`string`, `any`\>\> | -           |

#### Returns

`Promise`<`void`\>

---

### refreshBalance

▸ `Private` **refreshBalance**(): `Promise`<`void`\>

#### Returns

`Promise`<`void`\>

---

### refreshGasPrices

▸ `Private` **refreshGasPrices**(): `Promise`<`void`\>

Loads gas prices from xDai.

#### Returns

`Promise`<`void`\>

---

### reloadContracts

▸ `Private` **reloadContracts**(): `Promise`<`void`\>

#### Returns

`Promise`<`void`\>

---

### sendTransaction

▸ **sendTransaction**(`request`): `Promise`<`TransactionResponse`\>

Sends a transaction on behalf of the account that can be set via
[EthConnection.setAccount](EthConnection.md#setaccount). Throws an error if no account was set.

#### Parameters

| Name      | Type                 |
| :-------- | :------------------- |
| `request` | `TransactionRequest` |

#### Returns

`Promise`<`TransactionResponse`\>

---

### setAccount

▸ **setAccount**(`skey`): `Promise`<`void`\>

Changes the ethereum account on behalf of which this [EthConnection](EthConnection.md) sends transactions. Reloads
the contracts.

#### Parameters

| Name   | Type     |
| :----- | :------- |
| `skey` | `string` |

#### Returns

`Promise`<`void`\>

---

### setDiagnosticUpdater

▸ **setDiagnosticUpdater**(`diagnosticUpdater?`): `void`

For collecting diagnostics.

#### Parameters

| Name                 | Type                |
| :------------------- | :------------------ |
| `diagnosticUpdater?` | `DiagnosticUpdater` |

#### Returns

`void`

---

### setRpcUrl

▸ **setRpcUrl**(`rpcUrl`): `Promise`<`void`\>

Changes the RPC url we're connected to, and reloads the ethers contract references.

#### Parameters

| Name     | Type     |
| :------- | :------- |
| `rpcUrl` | `string` |

#### Returns

`Promise`<`void`\>

---

### signMessage

▸ **signMessage**(`message`): `Promise`<`string`\>

Signs a string, or throws an error if a signer has not been set.

#### Parameters

| Name      | Type     |
| :-------- | :------- |
| `message` | `string` |

#### Returns

`Promise`<`string`\>

---

### startPolling

▸ `Private` **startPolling**(): `void`

Kicks off an interval that regularly reloads the gas prices from xDai.

#### Returns

`void`

---

### stopPolling

▸ `Private` **stopPolling**(): `void`

#### Returns

`void`

---

### subscribeToContractEvents

▸ **subscribeToContractEvents**(`contract`, `handlers`, `eventFilter`): `void`

#### Parameters

| Name          | Type                                   |
| :------------ | :------------------------------------- |
| `contract`    | `Contract`                             |
| `handlers`    | `Partial`<`Record`<`string`, `any`\>\> |
| `eventFilter` | `EventFilter`                          |

#### Returns

`void`

---

### waitForTransaction

▸ **waitForTransaction**(`txHash`): `Promise`<`TransactionReceipt`\>

Returns a promise that resolves when the transaction with the given hash is confirmed, and
rejects if the transaction reverts or if there's a network error.

#### Parameters

| Name     | Type     |
| :------- | :------- |
| `txHash` | `string` |

#### Returns

`Promise`<`TransactionReceipt`\>
