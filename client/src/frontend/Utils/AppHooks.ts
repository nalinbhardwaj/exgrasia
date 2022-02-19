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
    const newCoords = gameManager ? await gameManager.getLocation() : { x: -2, y: -2 };
    console.log('useLocation coords', newCoords);
    setCoords(new Wrapper(newCoords));
  }, [gameManager]);

  useEmitterSubscribe(gameManager?.playerUpdated$, onUpdate);

  return coords;
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
