import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import tinycolor from 'tinycolor2';
import { CORE_CONTRACT_ADDRESS } from 'common-contracts';
import GameManager from '../backend/GameManager';
import { EthConnection } from '@darkforest_eth/network';
import { getEthConnection } from '../backend/Blockchain';
import { DEV_TEST_PRIVATE_KEY, Tile, TileType, WorldCoords } from 'common-types';
import { tileTypeToColor, getTileEmoji } from '../utils';
import {
  useBreadScore,
  useGameManager,
  useLocation,
  useTiles,
  useWheatScore,
  useWoodScore,
} from './Utils/AppHooks';

const enum LoadingStep {
  NONE,
  LOADED_ETH_CONNECTION,
  LOADED_GAME_MANAGER,
}

export default function LandingPage() {
  const [gameManager, setGameManager] = useState<GameManager | undefined>();
  const [ethConnection, setEthConnection] = useState<EthConnection | undefined>();
  const [step, setStep] = useState(LoadingStep.NONE);
  const [error, setError] = useState('no errors');
  const [queryCoords, setQueryCoords] = useState<WorldCoords | undefined>();
  const [queryingBlockchain, setQueryingBlockchain] = useState<boolean>(false);
  const [lastQueryResult, setLastQueryResult] = useState<TileType | undefined>();
  const tiles = useTiles(gameManager);
  const wheatScore = useWheatScore(gameManager);
  const woodScore = useWoodScore(gameManager);
  const breadScore = useBreadScore(gameManager);
  const location = useLocation(gameManager);

  useEffect(() => {
    getEthConnection()
      .then(async (ethConnection) => {
        ethConnection.setAccount(DEV_TEST_PRIVATE_KEY);
        setEthConnection(ethConnection);
        setStep(LoadingStep.LOADED_ETH_CONNECTION);
        const gm = await GameManager.create(ethConnection);
        window.gm = gm;
        setGameManager(gm);
        setStep(LoadingStep.LOADED_GAME_MANAGER);
      })
      .catch((e) => {
        setError(e.message);
      });
  }, []);

  const onGridClick = (i: number, j: number) => async () => {
    if (gameManager && !queryingBlockchain) {
      const coords = { x: i, y: j };
      console.log('here');
      setQueryCoords(coords);
      setQueryingBlockchain(true);
      const tileType = await gameManager.getCachedTileType(coords);
      setLastQueryResult(tileType);
      console.log('there', tileType);
      setQueryingBlockchain(false);
    }
  };

  const generateAndCheckProof = (i: number, j: number) => async () => {
    if (gameManager && !queryingBlockchain) {
      const coords = { x: i, y: j };
      setQueryingBlockchain(true);
      const tileType = await gameManager.getCachedTileType(coords);
      setQueryingBlockchain(false);
      if (tileType !== 0) {
        return;
      }
      const tile = gameManager.getTile(coords);
      const check = await gameManager.checkProof(tile);
      console.log(check);
    }
  };

  const proveOrTransition = (tile: Tile) => async () => {
    if (!gameManager || queryingBlockchain) return;
    console.log('proveOrTransition');
    if (!tile.isPrepped) return gameManager.proveTile(tile.coords);
    return await gameManager.transitionTile(tile);
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (!gameManager || queryingBlockchain) return;

    console.debug('Key event', event);
    const keyToDirection: any = {
      w: [-1, 0],
      a: [0, -1],
      s: [1, 0],
      d: [0, 1],
    };

    if (event.key in keyToDirection) {
      console.log({
        x: location.value.x + keyToDirection[event.key][0],
        y: location.value.y + keyToDirection[event.key][1],
      });
      gameManager.movePlayer({
        x: location.value.x + keyToDirection[event.key][0],
        y: location.value.y + keyToDirection[event.key][1],
      });
    }
  };

  useEffect(() => {
    if (gameManager) {
      gameManager.tileUpdated$.publish();
      gameManager.playerUpdated$.publish();
    }
    document.addEventListener('keydown', handleKeyDown);
    return function cleanup() {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [gameManager]);

  return (
    <>
      <Page>
        <h1>Hello!</h1>
        <p>{`The contract address is: ${CORE_CONTRACT_ADDRESS}`}</p>
        <p>{`The current loading step is: ${step}`}</p>
        {ethConnection ? <p>{`current user: ${ethConnection.getAddress()}`}</p> : null}
        <p>{`GameManager loaded: ${!!gameManager}`}</p>
        {gameManager && (
          <p>{`world seed: ${gameManager.getWorldSeed()}. world width: ${gameManager.getWorldWidth()}`}</p>
        )}
        {gameManager && (
          <p>{`wood score: ${woodScore.value}. wheat score: ${wheatScore.value}. bread score: ${breadScore.value}`}</p>
        )}
        {gameManager && <p>{`location.x: ${location.value.x}, location.y: ${location.value.y}`}</p>}
        <p>{`errors: ${error}`}</p>
        {lastQueryResult !== undefined ? (
          <p>{`last queried for (${queryCoords?.x}, ${queryCoords?.y}): cached tile type is ${lastQueryResult}`}</p>
        ) : null}
        <p>yo</p>
        {gameManager && tiles
          ? tiles.value.map((coordRow, i) => {
              return (
                <GridRow key={i}>
                  {coordRow.map((tile, j) => {
                    const content = getTileEmoji(tile, tile.isPrepped, coordRow.length);

                    return (
                      <GridSquare
                        key={100 * i + j}
                        onClick={proveOrTransition(tile)}
                        style={{
                          backgroundColor: tinycolor(tileTypeToColor[tile.currentTileType])
                            .darken(tile.isPrepped ? -10 : 0)
                            .toHexString(),
                        }}
                      >
                        {i == location.value.x && j == location.value.y && (
                          <span style={{ fontSize: '20px', zIndex: 10 }}>👨‍🎨</span>
                        )}
                        <span style={{ fontSize: '20px' }}>{content}</span>
                      </GridSquare>
                    );
                  })}
                </GridRow>
              );
            })
          : null}
      </Page>
    </>
  );
}

const Page = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  color: black;
  font-size: 12;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const GridRow = styled.div`
  display: flex;
  flex-direction: row;
`;

const GridSquare = styled.div`
  width: 22px;
  height: 22px;
  border-color: black;
  border-style: solid;
  border-width: 1px;
  justify-content: center;
  vertical-align: middle;
  text-align: center;
`;
