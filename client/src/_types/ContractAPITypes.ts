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

export const tileTypeToTransition = {
  [TileType.UNKNOWN]: ContractMethodName.TRANSITION_TILE,
  [TileType.WATER]: ContractMethodName.TRANSITION_TILE,
  [TileType.SAND]: ContractMethodName.TRANSITION_TILE,
  [TileType.TREE]: ContractMethodName.COLLECT_WOOD,
  [TileType.STUMP]: ContractMethodName.TRANSITION_TILE,
  [TileType.CHEST]: ContractMethodName.TRANSITION_TILE,
  [TileType.FARM]: ContractMethodName.HARVEST_WHEAT,
  [TileType.LAND]: ContractMethodName.BUILD_FARM,
};

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
};

export type SubmittedTransitionTile = UnconfirmedTransitionTile & SubmittedTx;

export function isUnconfirmedTransitionTile(
  txIntent: TxIntent
): txIntent is UnconfirmedTransitionTile {
  return Object.values(tileTypeToTransition).includes(txIntent.methodName);
}
