import { Tile, TileType, WorldCoords } from 'common-types';

export const enum ContractEvent {
  TileUpdated = 'TileUpdated',
  PlayerUpdated = 'PlayerUpdated',
}

export enum ContractMethodName {
  MOVE_PLAYER = 'movePlayer',
  INIT_PLAYER_LOCATION = 'initPlayerLocation',
  PROCESS_TILE = 'processTile',
}

export const enum ContractsAPIEvent {
  TileUpdated = 'TileUpdated',
  PlayerUpdated = 'TileUpdated',

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

export type UnconfirmedMovePlayer = TxIntent & {
  methodName: ContractMethodName.MOVE_PLAYER | ContractMethodName.INIT_PLAYER_LOCATION;
  coords: WorldCoords;
};

export type SubmittedMovePlayer = UnconfirmedMovePlayer & SubmittedTx;

export function isUnconfirmedMovePlayer(txIntent: TxIntent): txIntent is UnconfirmedMovePlayer {
  return [ContractMethodName.MOVE_PLAYER, ContractMethodName.INIT_PLAYER_LOCATION].includes(
    txIntent.methodName
  );
}

export type UnconfirmedProcessTile = TxIntent & {
  methodName: ContractMethodName.PROCESS_TILE;
  coords: WorldCoords;
  tsbase: number;
};

export type SubmittedProcessTile = UnconfirmedProcessTile & SubmittedTx;

export function isUnconfirmedProcessTile(txIntent: TxIntent): txIntent is UnconfirmedProcessTile {
  return txIntent.methodName == ContractMethodName.PROCESS_TILE;
}
