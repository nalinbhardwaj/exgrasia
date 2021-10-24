import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { CORE_CONTRACT_ADDRESS } from 'common-contracts';
import GameManager from '../backend/GameManager';
import { EthConnection } from '@darkforest_eth/network';
import { getEthConnection } from '../backend/Blockchain';
import { DEV_TEST_PRIVATE_KEY, Tile, TileType, WorldCoords } from 'common-types';
import { tileTypeToColor, getTileEmoji } from '../utils';
import { useGameManager, useTiles } from './Utils/AppHooks';

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
  const [tileEmojis, setTileEmojis] = useState<string[][]>([]);

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
    if (tile.isPrepped && tile.currentTileType == TileType.LAND)
      return await gameManager.transitionTile(tile, TileType.FARM);
    else return await gameManager.proveTile(tile.coords);
  };

  useEffect(() => {
    if (gameManager) {
      gameManager.tileUpdated$.publish();
    }
  }, [gameManager]);

  return (
    <>
      <Page>
        <h1>Hello!</h1>
        <p>{`The contract address is: ${CORE_CONTRACT_ADDRESS}`}</p>
        <p>{`The current loading step is: ${step}`}</p>
        {ethConnection ? <p>{`current user: ${ethConnection.getAddress()}`}</p> : null}
        <p>{`GameManager loaded: ${!!gameManager}`}</p>
        {gameManager ? (
          <p>{`world seed: ${gameManager.getWorldSeed()}. world width: ${gameManager.getWorldWidth()}`}</p>
        ) : null}
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
                        style={{ backgroundColor: tileTypeToColor[tile.currentTileType] }}
                      >
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
