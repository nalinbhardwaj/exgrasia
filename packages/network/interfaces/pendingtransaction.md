# Interface: PendingTransaction

Represents a transaction that is in flight.

## Table of contents

### Properties

- [confirmed](PendingTransaction.md#confirmed)
- [submitted](PendingTransaction.md#submitted)

## Properties

### confirmed

• **confirmed**: `Promise`<`TransactionReceipt`\>

Resolves or rejects depending on the success or failure of this transaction to execute.

---

### submitted

• **submitted**: `Promise`<`TransactionResponse`\>

Resolves or rejects depending on the success or failure of this transaction to get into the
mempool. If this rejects, [PendingTransaction.confirmed](PendingTransaction.md#confirmed) neither rejects nor resolves.
