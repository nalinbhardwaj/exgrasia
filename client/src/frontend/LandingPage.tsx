import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import tinycolor from 'tinycolor2';
import { CORE_CONTRACT_ADDRESS } from 'common-contracts';
import GameManager from '../backend/GameManager';
import { EthConnection } from '@darkforest_eth/network';
import { getEthConnection } from '../backend/Blockchain';
import {
  address,
  DEV_TEST_PRIVATE_KEY,
  Tile,
  TileContractMetaData,
  TileType,
  WorldCoords,
} from 'common-types';
import { tileTypeToColor, getTileEmoji, nullAddress } from '../utils';
import { useInfo, useInitted, useTiles } from './Utils/AppHooks';
import { useParams } from 'react-router-dom';

import TilePane from './TilePane';

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
  const playerInfos = useInfo(gameManager);
  const initted = useInitted(gameManager);
  const { privKeyIdx } = useParams<{ privKeyIdx?: string }>();
  const privateKey = DEV_TEST_PRIVATE_KEY[privKeyIdx ? parseInt(privKeyIdx) : 0];
  const [input, setInput] = useState<Map<string, string>>(new Map());

  // array of tiles that player has open panes for
  const [openTiles, setOpenTiles] = useState<Set<WorldCoords>>(new Set());

  // NOTE: commented out while I iterate on the tilepane
  // useEffect(() => {
  //   getEthConnection()
  //     .then(async (ethConnection) => {
  //       ethConnection.setAccount(privateKey);
  //       setEthConnection(ethConnection);
  //       setStep(LoadingStep.LOADED_ETH_CONNECTION);
  //       const gm = await GameManager.create(ethConnection);
  //       window.gm = gm;
  //       setGameManager(gm);
  //       setStep(LoadingStep.LOADED_GAME_MANAGER);
  //     })
  //     .catch((e) => {
  //       console.log(e);
  //       setError(e.message);
  //     });
  // }, []);

  const onGridClick = (coords: WorldCoords) => async () => {
    // NOTE: nibnalin old logic for taking ownership of a tile
    if (!gameManager || queryingBlockchain) return;
    await gameManager.ownTile(coords, address('0xA1cf9870677Bb213991DDdE342a5CE412c0f676D'));
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (!gameManager || queryingBlockchain) return;
    gameManager.movePlayer(event.key.toLowerCase());
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
        {/* gameManager && (
          <p>{`world seed: ${gameManager.getWorldSeed()}. world width: ${gameManager.getWorldWidth()}`}</p>
        ) */}
        {/* gameManager && (
          <p>{`selfCoords.x: ${gameManager.selfInfo.coords.x}, selfCoords.y: ${gameManager.selfInfo.coords.x}`}</p>
        )*/}
        {/* gameManager && <p>{`initted: ${initted.value}`}</p> */}
        <p>{`errors: ${error}`}</p>
        {lastQueryResult !== undefined ? (
          <p>{`last queried for (${queryCoords?.x}, ${queryCoords?.y}): cached tile type is ${lastQueryResult}`}</p>
        ) : null}

        {/* figure out close-ability, then put it in its own class */}
        {/* close-ability involves calling a function in the LandingPage.tsx scope that removes the item from the list */}
        <TilePane></TilePane>

        {/* for each open tile, create a DF-like draggable */}

        {/* NOTE: nibnalin's old logic for showing contract metadata for selected tile */}
        {/* gameManager && tiles
          ? tiles.value.map((coordRow, i) => {
              if (i == 0) return null;
              return coordRow.map((tile, j) => {
                if (j == 0) return null;
                if (tiles.value[i][j].smartContractMetaData.name)
                  return (
                    <div key={100 * i + j + 100000}>
                      {Pane(
                        gameManager,
                        { x: i, y: j },
                        tiles.value[i][j].smartContractMetaData,
                        input,
                        setInput
                      )}
                    </div>
                  );
                else return null;
              });
            })
          : null */}

        {/* gameManager && tiles
          ? tiles.value.map((coordRow, i) => {
              if (i == 0) return null;
              return (
                <GridRow key={i}>
                  {coordRow.map((tile, j) => {
                    if (j == 0) return null;
                    return (
                      <GridSquare
                        key={100 * i + j}
                        style={{
                          backgroundColor: tinycolor(tileTypeToColor[tile.tileType]).toHexString(),
                        }}
                        onClick={onGridClick({ x: i, y: j })}
                      >
                        {[...playerInfos.value.keys()].map((addr) => {
                          const playerInfo = playerInfos.value.get(addr);
                          if (
                            playerInfo &&
                            playerInfo.coords.x === i &&
                            playerInfo.coords.y === j
                          ) {
                            return (
                              <span key={addr} style={{ fontSize: '15px', zIndex: 10 }}>
                                {playerInfo.emoji}
                              </span>
                            );
                          }
                        })}
                        {tile.smartContractMetaData.emoji}
                      </GridSquare>
                    );
                  })}
                </GridRow>
              );
            })
          : null */}
      </Page>
    </>
  );
}

function Pane(
  gm: GameManager,
  coords: WorldCoords,
  props: TileContractMetaData,
  input: Map<string, string>,
  setInput: React.Dispatch<React.SetStateAction<Map<string, string>>>
) {
  return (
    <div key={props.name}>
      <div>{`Contract coords x: ${coords.x}, y: ${coords.y}`}</div>
      <div>{`Contract name: ${props.name}, emoji: ${props.emoji}, desc: ${props.description}`}</div>
      {gm && props.extendedAbi && props.extendedAbi.length > 0
        ? props.extendedAbi.map((contractFunc, i) => {
            const purity =
              contractFunc.stateMutability == 'view' || contractFunc.stateMutability == 'pure';
            const handleSubmit = async (event: { preventDefault: () => void }) => {
              event.preventDefault();
              const strInp = input.get(contractFunc.name);
              console.log('strInp', strInp);
              const inp = strInp ? JSON.parse(strInp) : [];
              console.log(inp);
              const result = purity
                ? await gm.tileCall(coords, contractFunc.name, inp)
                : await gm.tileTx(coords, contractFunc.name, inp);
              console.log(result);
            };
            const handleChange = (name: string, e: React.ChangeEvent<HTMLInputElement>) => {
              let newInput = input;
              newInput.set(name, e.target.value);
              setInput(newInput);
            };
            console.log('contractFunc name', contractFunc.name);
            return (
              <form onSubmit={handleSubmit} key={contractFunc.name}>
                <label>
                  {`${JSON.stringify(contractFunc.name)}, ${JSON.stringify(contractFunc.inputs)}`}
                  <input
                    key={contractFunc.name}
                    type='text'
                    value={input.get(contractFunc.name)}
                    onChange={(e) => handleChange(contractFunc.name, e)}
                  />
                </label>
                <input key={contractFunc.name} type='submit' value='Submit' />
              </form>
            );
          })
        : null}
    </div>
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
