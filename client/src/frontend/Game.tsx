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
import { useLocation, useParams } from 'react-router-dom';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';

const enum LoadingStep {
  NONE,
  LOADED_ETH_CONNECTION,
  LOADED_GAME_MANAGER,
}

interface stateType {
  proxyPrivKey: string;
  character: string;
}

export default function Game() {
  const location = useLocation<stateType>();
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
  const passedPrivateKey = location.state?.proxyPrivKey;
  const nuxCharacter: string = location.state?.character;
  const privateKey = passedPrivateKey
    ? passedPrivateKey
    : DEV_TEST_PRIVATE_KEY[privKeyIdx ? parseInt(privKeyIdx) : 0];
  const [input, setInput] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    getEthConnection()
      .then(async (ethConnection) => {
        ethConnection.setAccount(privateKey);
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

  const onGridClick = (coords: WorldCoords) => async () => {
    if (!gameManager || queryingBlockchain) return;
    await gameManager.ownTile(coords, address('0xA1cf9870677Bb213991DDdE342a5CE412c0f676D'));
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (!gameManager || queryingBlockchain) return;
    gameManager.movePlayer(event.key.toLowerCase());
  };

  useEffect(() => {
    if (gameManager && nuxCharacter) {
      gameManager.initPlayerLocation(nuxCharacter);
    }
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
        {gameManager && tiles && initted.value ? (
          <FullScreen>
            <TransformWrapper
              initialScale={2}
              minScale={1}
              initialPositionX={gameManager.selfInfo.coords.y * -38} // meticulously measured
              initialPositionY={gameManager.selfInfo.coords.x * -40}
            >
              <TransformComponent
                wrapperStyle={{
                  maxWidth: '100%',
                  maxHeight: 'calc(100vh - 0.1px)',
                }}
              >
                {tiles.value.map((coordRow, i) => {
                  if (i == 0) return null;
                  return (
                    <GridRow key={i}>
                      {coordRow.map((tile, j) => {
                        if (j == 0) return null;
                        return (
                          <GridSquare
                            key={100 * i + j}
                            style={{
                              backgroundColor: tinycolor(
                                tileTypeToColor[tile.tileType]
                              ).toHexString(),
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
                })}
              </TransformComponent>
            </TransformWrapper>
          </FullScreen>
        ) : (
          <FullScreen>
            <Title>εxgrasia</Title>
            <SubTitle>Loading...</SubTitle>
          </FullScreen>
        )}
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

const FullScreen = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  background-image: url('/public/assets/clouds.svg');
  background-repeat: repeat;
  background-size: 20%;
  height: 100%;
`;

const Title = styled.div`
  font-size: 96px;
  vertical-align: middle;
  margin: 0;
  position: absolute;
  top: 25%;
  left: 25%;
  color: black;
  font-weight: 400;
  user-select: none;
`;

const SubTitle = styled.div`
  font-size: 64px;
  vertical-align: middle;
  margin: 0;
  position: absolute;
  top: 60%;
  right: 25%;
  color: black;
  font-weight: 300;
  line-height: 1.1;
`;
