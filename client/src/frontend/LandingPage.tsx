import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import tinycolor from 'tinycolor2';
import { CORE_CONTRACT_ADDRESS } from 'common-contracts';
import GameManager from '../backend/GameManager';
import { EthConnection } from '@darkforest_eth/network';
import { getEthConnection } from '../backend/Blockchain';
import { DEV_TEST_PRIVATE_KEY, Tile, TileType, WorldCoords } from 'common-types';
import { tileTypeToColor, getTileEmoji } from '../utils';
import { useLocation, useTiles } from './Utils/AppHooks';

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
        console.log(e);
        setError(e.message);
      });
  }, []);

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
                    return (
                      <GridSquare
                        key={100 * i + j}
                        style={{
                          backgroundColor: tinycolor(tileTypeToColor[tile.currentTileType])
                            .darken(tile.isPrepped ? -10 : 0)
                            .toHexString(),
                        }}
                      >
                        {i === location.value.x && j === location.value.y && (
                          <span style={{ fontSize: '15px', zIndex: 10 }}>👨‍🎨</span>
                        )}
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
  font-size: 7;
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
  border-color: rgba(0, 0, 0, 0.15);
  border-style: solid;
  border-width: 1px;
  justify-content: center;
  vertical-align: middle;
  text-align: center;
`;
