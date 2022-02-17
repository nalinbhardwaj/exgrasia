import { useCallback, useState } from 'react';
import { Wrapper } from '../../Backend/Utils/Wrapper';
import GameManager from '../../Backend/GameManager';
import { useEmitterSubscribe, useWrappedEmitter } from './EmitterHooks';
import { EthAddress, Tile, TileType, WorldCoords } from 'common-types';
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

export function useLocation(gameManager: GameManager | undefined): Wrapper<WorldCoords> {
  const [coords, setCoords] = useState<Wrapper<WorldCoords>>(() => new Wrapper({ x: -1, y: -1 }));

  const onUpdate = useCallback(async () => {
    console.log('onUpdate useLocation');
    setCoords(new Wrapper(gameManager ? await gameManager.getLocation() : { x: -1, y: -1 }));
  }, [gameManager]);

  useEmitterSubscribe(gameManager?.playerUpdated$, onUpdate);

  return coords;
}
