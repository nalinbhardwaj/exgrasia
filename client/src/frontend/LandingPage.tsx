import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { CORE_CONTRACT_ADDRESS } from 'common-contracts';
import GameManager from '../backend/GameManager';
import { EthConnection } from '@darkforest_eth/network';
import { getEthConnection } from '../backend/Blockchain';
import { DEV_TEST_PRIVATE_KEY, TileType, WorldCoords } from 'common-types';
import { tileTypeToColor, getRandomTree } from '../utils';

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
      setQueryCoords(coords);
      setQueryingBlockchain(true);
      const tileType = await gameManager.getCachedTile(coords);
      setLastQueryResult(tileType);
      setQueryingBlockchain(false);
    }
  };

  const submitProof = (i: number, j: number) => async () => {
    if (gameManager && !queryingBlockchain) {
      console.log('submitProof', i, j);
      const coords = { x: i, y: j };
      setQueryingBlockchain(true);
      const tileType = await gameManager.getCachedTile(coords);
      setQueryingBlockchain(false);
      console.log(`cached tiletype: ${tileType}`);
      if (tileType !== 0) {
        return;
      }
      const ogTileType = gameManager.getOriginalTile(coords);
      const check = gameManager.proveTile(ogTileType);
      console.log('checked', check);
    }
  };

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
        {gameManager
          ? gameManager.getOriginalTiles().map((coordRow, i) => {
              return (
                <GridRow key={i}>
                  {coordRow.map((tile, j) => {
                    const tree = getRandomTree({ x: i, y: j }, coordRow.length);

                    return (
                      <GridSquare
                        key={100 * i + j}
                        onClick={submitProof(i, j)}
                        style={{ backgroundColor: tileTypeToColor[tile.tileType] }}
                      >
                        {tile.tileType === TileType.TREE && (
                          <span style={{ fontSize: '20px' }}>{tree}</span>
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
