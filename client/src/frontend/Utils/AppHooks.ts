import { useCallback, useState } from 'react';
import { Wrapper } from '../../Backend/Utils/Wrapper';
import GameManager from '../../Backend/GameManager';
import { useEmitterSubscribe, useWrappedEmitter } from './EmitterHooks';
import { EthAddress, PlayerInfo, Tile, TileType, WorldCoords } from 'common-types';
import { createDefinedContext } from './createDefinedContext';

export const { useDefinedContext: useGameManager, provider: GameManagerProvider } =
  createDefinedContext<GameManager>();

/**
 * Hook which gets you the tiles
 */
export function useTiles(gameManager: GameManager | undefined): Wrapper<Tile[][]> {
  const [tiles, setTiles] = useState<Wrapper<Tile[][]>>(
    () => new Wrapper(gameManager ? gameManager.getTiles() : [])
  );

  const onUpdate = useCallback(() => {
    console.log('onUpdate');
    setTiles(new Wrapper(gameManager ? gameManager.getTiles() : []));
  }, [gameManager]);

  useEmitterSubscribe(gameManager?.tileUpdated$, onUpdate);

  return tiles;
}

export function useInfo(
  gameManager: GameManager | undefined
): Wrapper<Map<EthAddress, PlayerInfo>> {
  const [playerInfos, setPlayerInfos] = useState<Wrapper<Map<EthAddress, PlayerInfo>>>(
    () => new Wrapper(new Map())
  );

  const onUpdate = useCallback(async () => {
    console.log('onUpdate useLocation');
    const newInfos = gameManager ? await gameManager.getPlayerInfos() : new Map();
    console.log('useLocation infos', newInfos);
    setPlayerInfos(new Wrapper(newInfos));
  }, [gameManager]);

  useEmitterSubscribe(gameManager?.playerUpdated$, onUpdate);

  return playerInfos;
}

export function useInitted(gameManager: GameManager | undefined): Wrapper<boolean> {
  const [initted, setinitted] = useState<Wrapper<boolean>>(() => new Wrapper(false));

  const onUpdate = useCallback(async () => {
    const newInitted = gameManager ? await gameManager.getInitted() : false;
    setinitted(new Wrapper(newInitted));
  }, [gameManager]);

  useEmitterSubscribe(gameManager?.playerUpdated$, onUpdate);

  return initted;
}

export function useTileTxStatus(gameManager: GameManager | undefined): {
  submitted: Wrapper<string[]>;
  confirmed: Wrapper<string[]>;
  reverted: Wrapper<string[]>;
} {
  const [submittedTileTx, setSubmittedTileTx] = useState<Wrapper<string[]>>(() => new Wrapper([]));
  const [confirmedTileTx, setConfirmedTileTx] = useState<Wrapper<string[]>>(() => new Wrapper([]));
  const [revertedTileTx, setRevertedTileTx] = useState<Wrapper<string[]>>(() => new Wrapper([]));

  const onUpdate = useCallback(async ([tx, status]) => {
    if (status == 'submitted') {
      setSubmittedTileTx(new Wrapper([...submittedTileTx.value, tx.actionId]));
    }
    if (status == 'confirmed') {
      setConfirmedTileTx(new Wrapper([...confirmedTileTx.value, tx.actionId]));
    }
    if (status == 'reverted') {
      setRevertedTileTx(new Wrapper([...revertedTileTx.value, tx.actionId]));
    }
  }, []);

  useEmitterSubscribe(gameManager?.tileTxUpdated$, onUpdate);

  return {
    submitted: submittedTileTx,
    confirmed: confirmedTileTx,
    reverted: revertedTileTx,
  };
}
