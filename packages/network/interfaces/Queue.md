# Interface: Queue

Let's keep things flexible by keeping this type small.

## Implemented by

- [`ThrottledConcurrentQueue`](../classes/ThrottledConcurrentQueue.md)

## Table of contents

### Methods

- [add](Queue.md#add)
- [size](Queue.md#size)

## Methods

### add

▸ **add**<`T`\>(`start`): `Promise`<`T`\>

#### Type parameters

| Name |
| :--- |
| `T`  |

#### Parameters

| Name    | Type                  |
| :------ | :-------------------- |
| `start` | () => `Promise`<`T`\> |

#### Returns

`Promise`<`T`\>

---

### size

▸ **size**(): `number`

#### Returns

`number`
