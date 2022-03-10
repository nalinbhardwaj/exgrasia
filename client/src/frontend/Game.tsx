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
  EthAddress,
  Tile,
  TileContractMetaData,
  TileType,
  WorldCoords,
} from 'common-types';
import { tileTypeToColor, getTileEmoji, nullAddress, prettifyAddress } from '../utils';
import { useInfo, useInitted, useTiles } from './Utils/AppHooks';
import { useLocation, useParams } from 'react-router-dom';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { Tooltip } from '@mui/material';
import Draggable from 'react-draggable';
import './Pane.css';
import { Pane, SettingsPane } from './Pane';
import { PluginManager } from '../backend/PluginManager';

const enum LoadingStep {
  NONE,
  LOADED_ETH_CONNECTION,
  LOADED_GAME_MANAGER,
  LOADED_PLUGIN_MANAGER,
}

interface stateType {
  proxyPrivKey: string;
  character: string;
}

export default function Game() {
  const location = useLocation<stateType>();
  const [gameManager, setGameManager] = useState<GameManager | undefined>();
  const [pluginManager, setPluginManager] = useState<PluginManager | undefined>();
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
  const [openPanes, setOpenPanes] = useState<WorldCoords[]>([]);
  const [prettifiedAddresses, setPrettifiedAddresses] = useState<Map<EthAddress, string>>(
    new Map()
  );
  const [openSettings, setOpenSettings] = useState<boolean>(false);

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
        const pm = new PluginManager(gameManager!);
        window.pm = pm;
        setPluginManager(pm);
        setStep(LoadingStep.LOADED_PLUGIN_MANAGER);
      })
      .catch((e) => {
        console.log(e);
        setError(e.message);
      });
  }, []);

  const onGridClick = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>,
    coords: WorldCoords
  ) => {
    event.preventDefault();
    if (!gameManager || queryingBlockchain) return;
    for (const openPane of openPanes) {
      if (openPane.x === coords.x && openPane.y === coords.y) {
        return;
      }
    }
    setOpenPanes([...openPanes, coords]);
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

  const onClose = (coords: WorldCoords) => {
    setOpenPanes(openPanes.filter((c) => c !== coords));
  };

  useEffect(() => {
    const fetch = async () => {
      for (const [playerAddress, playerInfo] of playerInfos.value) {
        if (prettifiedAddresses.has(playerAddress)) continue;
        prettifiedAddresses.set(playerAddress, await prettifyAddress(playerInfo.realAddress));
      }
    };
    fetch();
  }, [playerInfos]);

  return (
    <>
      <Page>
        {gameManager && pluginManager && tiles && initted.value ? (
          <>
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
                              onContextMenu={(event) => onGridClick(event, { x: i, y: j })}
                            >
                              {tile.smartContractMetaData.emoji === '' ? (
                                [...playerInfos.value.keys()].map((addr) => {
                                  const playerInfo = playerInfos.value.get(addr);
                                  if (
                                    playerInfo &&
                                    playerInfo.coords.x === i &&
                                    playerInfo.coords.y === j
                                  ) {
                                    return (
                                      <Tooltip
                                        title={prettifiedAddresses.get(addr) || addr}
                                        key={100 * i + j}
                                        placement='top'
                                      >
                                        <span
                                          key={100 * i + j}
                                          style={{ fontSize: '15px', zIndex: 10 }}
                                        >
                                          {playerInfo.emoji}
                                        </span>
                                      </Tooltip>
                                    );
                                  }
                                })
                              ) : (
                                <Tooltip
                                  key={100 * i + j}
                                  title={tile.smartContractMetaData.name}
                                  placement='top'
                                >
                                  <span key={100 * i + j}>{tile.smartContractMetaData.emoji}</span>
                                </Tooltip>
                              )}
                            </GridSquare>
                          );
                        })}
                      </GridRow>
                    );
                  })}
                </TransformComponent>
              </TransformWrapper>
            </FullScreen>
            {openPanes.map((coords) => {
              return (
                <Pane
                  key={coords.x * 100 + coords.y}
                  coords={coords}
                  gm={gameManager}
                  pm={pluginManager}
                  playerInfos={playerInfos.value}
                  onClose={onClose}
                  curTiles={tiles.value}
                  prettifiedAddresses={prettifiedAddresses}
                />
              );
            })}
            <SettingsIcon>
              <span role='img' aria-label='gear' onClick={() => setOpenSettings(!openSettings)}>
                ⚙️
              </span>
            </SettingsIcon>
            {openSettings && (
              <SettingsPane
                gm={gameManager}
                pm={pluginManager}
                onClose={() => setOpenSettings(false)}
              />
            )}
          </>
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

const SettingsIcon = styled.div`
  font-size: 64px;
  vertical-align: middle;
  margin: 0;
  position: absolute;
  bottom: 1%;
  left: 1%;
  color: white;
  font-weight: 300;
  line-height: 1.1;
  a {
    text-decoration: none;
  }
  user-select: none;
  cursor: pointer;
  z-index: 10;
`;
