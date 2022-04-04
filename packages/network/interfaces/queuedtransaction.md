# Interface: QueuedTransaction

Represents a transaction that the game would like to submit to the blockchain.

## Table of contents

### Properties

- [actionId](QueuedTransaction.md#actionid)
- [args](QueuedTransaction.md#args)
- [contract](QueuedTransaction.md#contract)
- [methodName](QueuedTransaction.md#methodname)
- [overrides](QueuedTransaction.md#overrides)

### Methods

- [onReceiptError](QueuedTransaction.md#onreceipterror)
- [onSubmissionError](QueuedTransaction.md#onsubmissionerror)
- [onTransactionReceipt](QueuedTransaction.md#ontransactionreceipt)
- [onTransactionResponse](QueuedTransaction.md#ontransactionresponse)

## Properties

### actionId

• **actionId**: `string`

Uniquely identifies this transaction. Invariant throughout the entire life of a transaction,
from the moment the game conceives of taking that action, to the moment that it finishes either
successfully or with an error.

---

### args

• **args**: `unknown`[]

The arguments we should pass to the method we're executing.

---

### contract

• **contract**: `Contract`

The contract on which to execute this transaction.

---

### methodName

• **methodName**: `string`

The name of the contract method to execute.

---

### overrides

• **overrides**: `TransactionRequest`

Allows the submitter of the transaction to override some low-level blockchain transaction
settings, such as the gas price.

## Methods

### onReceiptError

▸ **onReceiptError**(`e`): `void`

Called if there was an error waiting for this transaction to complete.

#### Parameters

| Name | Type                   |
| :--- | :--------------------- |
| `e`  | `undefined` \| `Error` |

#### Returns

`void`

---

### onSubmissionError

▸ **onSubmissionError**(`e`): `void`

Called if there was an error submitting this transaction.

#### Parameters

| Name | Type                   |
| :--- | :--------------------- |
| `e`  | `undefined` \| `Error` |

#### Returns

`void`

---

### onTransactionReceipt

▸ **onTransactionReceipt**(`e`): `void`

Called when the transaction successfully completes.

#### Parameters

| Name | Type                 |
| :--- | :------------------- |
| `e`  | `TransactionReceipt` |

#### Returns

`void`

---

### onTransactionResponse

▸ **onTransactionResponse**(`e`): `void`

Called when the transaction was successfully submitted to the mempool.

#### Parameters

| Name | Type                  |
| :--- | :-------------------- |
| `e`  | `TransactionResponse` |

#### Returns

`void`
