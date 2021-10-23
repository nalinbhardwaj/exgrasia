import { Tile } from 'common-types';

export const enum ContractEvent {
  TileUpdated = 'TileUpdated',
}

export enum ContractMethodName {
  PROVE_TILE = 'proveTile',
}

export const enum ContractsAPIEvent {
  TileUpdated = 'TileUpdated',

  TxInitFailed = 'TxInitFailed',
  TxSubmitted = 'TxSubmitted',
  TxConfirmed = 'TxConfirmed',
  TxReverted = 'TxReverted',
}

export type TxIntent = {
  // we generate a txId so we can reference the tx
  // before it is submitted to chain and given a txHash
  actionId: string;
  methodName: ContractMethodName;
};

export type SubmittedTx = TxIntent & {
  txHash: string;
  sentAtTimestamp: number;
};

export type UnconfirmedProveTile = TxIntent & {
  methodName: ContractMethodName.PROVE_TILE;
  tile: Tile;
};

export type SubmittedProveTile = UnconfirmedProveTile & SubmittedTx;

export function isUnconfirmedProveTile(txIntent: TxIntent): txIntent is UnconfirmedProveTile {
  return txIntent.methodName === ContractMethodName.PROVE_TILE;
}
