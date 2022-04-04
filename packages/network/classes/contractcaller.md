# Class: ContractCaller

Instead of allowing the game to call `view` functions on the blockchain directly, all contract
calls should go through this class. Its purpose is to throttle the calls to a reasonable rate,
and to gracefully handle errors and retries

## Table of contents

### Constructors

- [constructor](ContractCaller.md#constructor)

### Properties

- [diagnosticsUpdater](ContractCaller.md#diagnosticsupdater)
- [maxRetries](ContractCaller.md#maxretries)
- [queue](ContractCaller.md#queue)

### Methods

- [makeCall](ContractCaller.md#makecall)
- [setDiagnosticUpdater](ContractCaller.md#setdiagnosticupdater)

## Constructors

### constructor

• **new ContractCaller**(`queue?`, `maxRetries?`)

#### Parameters

| Name          | Type                              |
| :------------ | :-------------------------------- |
| `queue?`      | [`Queue`](../interfaces/Queue.md) |
| `maxRetries?` | `number`                          |

## Properties

### diagnosticsUpdater

• `Private` `Optional` **diagnosticsUpdater**: `DiagnosticUpdater`

Allows us to update the data that might be displayed in the UI.

---

### maxRetries

• `Private` **maxRetries**: `number`

The maximum amount of times that we want the game to retry any individual call. Retries are
appended to the end of the queue, meaning they respect the throttling settings of this class.

---

### queue

• `Private` `Readonly` **queue**: [`Queue`](../interfaces/Queue.md)

Queue which stores future contract calls.

## Methods

### makeCall

▸ **makeCall**<`T`\>(`contractViewFunction`, `args?`): `Promise`<`T`\>

Submits a call to the call queue. Each call is retried a maximum of
{@link ContractCaller.DEFAULT_MAX_CALL_RETRIES} times. Returns a promise that resolves if the call was
successful, and rejects if it failed even after all the retries.

#### Type parameters

| Name |
| :--- |
| `T`  |

#### Parameters

| Name                   | Type                     | Default value |
| :--------------------- | :----------------------- | :------------ |
| `contractViewFunction` | `ContractFunction`<`T`\> | `undefined`   |
| `args`                 | `unknown`[]              | `[]`          |

#### Returns

`Promise`<`T`\>

---

### setDiagnosticUpdater

▸ **setDiagnosticUpdater**(`diagnosticUpdater?`): `void`

Sets the diagnostics updater to the one you provide. If you don't set this, everything apart
from diagnostics continues to function.

#### Parameters

| Name                 | Type                |
| :------------------- | :------------------ |
| `diagnosticUpdater?` | `DiagnosticUpdater` |

#### Returns

`void`
