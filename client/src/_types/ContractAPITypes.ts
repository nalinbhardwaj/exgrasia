import { Tile, TileType } from 'common-types';

export const enum ContractEvent {
  TileUpdated = 'TileUpdated',
}

export enum ContractMethodName {
  GET_WHEAT_SCORE = 'wheatScore',
  GET_WOOD_SCORE = 'woodScore',
  PROVE_TILE = 'proveTile',
  TRANSITION_TILE = 'transitionTile',
  BUILD_FARM = 'buildFarm',
  COLLECT_WOOD = 'collectWood',
  HARVEST_WHEAT = 'harvestWheat',
  MAKE_WINDMILL = 'makeWindmill',
  MAKE_BREAD = 'makeBread',
}

export const possibleTransitions = [
  ContractMethodName.TRANSITION_TILE,
  ContractMethodName.COLLECT_WOOD,
  ContractMethodName.HARVEST_WHEAT,
  ContractMethodName.BUILD_FARM,
  ContractMethodName.MAKE_WINDMILL,
];

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

export type UnconfirmedTransitionTile = TxIntent & {
  tile: Tile;
  toTileType: TileType;
};

export type SubmittedTransitionTile = UnconfirmedTransitionTile & SubmittedTx;

export function isUnconfirmedTransitionTile(
  txIntent: TxIntent
): txIntent is UnconfirmedTransitionTile {
  return possibleTransitions.includes(txIntent.methodName);
}
