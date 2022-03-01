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
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import SplashMap from './SplashMap.json';
import { Mainnet, DAppProvider, useEtherBalance, useEthers, Config } from '@usedapp/core';

export default function Splash() {
  const [liveMap, setLiveMap] = useState<TileType[][]>(SplashMap);
  const [ticks, setTicks] = useState(36);
  const [tickDirection, setTickDirection] = useState(true);
  const { activateBrowserWallet, account } = useEthers();

  useEffect(() => {
    const interval = setInterval(() => {
      setTicks((ticks) => (tickDirection ? ticks + 1 : ticks - 1));
    }, 800);
    return () => clearInterval(interval);
  }, [tickDirection]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTickDirection((tickDirection) => !tickDirection);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <Page>
        {liveMap &&
          liveMap.map((row, i) => (
            <GridRow key={i}>
              {row.map((tile: TileType, j) => (
                <GridSquare
                  key={100 * i + j}
                  style={{
                    backgroundColor: tinycolor(
                      i + j <= ticks && i >= 10 && j >= 12
                        ? tileTypeToColor[TileType.WATER]
                        : tileTypeToColor[tile]
                    ).toHexString(),
                  }}
                ></GridSquare>
              ))}
            </GridRow>
          ))}
      </Page>
      <Page style={{ zIndex: 1 }}>
        <Title>εxgrasia</Title>
        <SubTitle onClick={() => activateBrowserWallet()}>
          {account ? <>connected {account.slice(-10)}</> : <>connect wallet</>}
        </SubTitle>
        <Twitter>
          <a href='https://twitter.com/exgrasia' target='_blank' style={{ textDecoration: 'none' }}>
            <span role='img' aria-label='bird'>
              🐦
            </span>
          </a>
        </Twitter>
      </Page>
    </>
  );
}

const Title = styled.div`
  font-size: 96px;
  vertical-align: middle;
  margin: 0;
  position: absolute;
  top: 25%;
  left: 25%;
  color: white;
  font-weight: 400;
  user-select: none;
`;

const SubTitle = styled.div`
  font-size: 64px;
  vertical-align: middle;
  margin: 0;
  position: absolute;
  bottom: 25%;
  right: 25%;
  color: white;
  font-weight: 300;
  text-decoration: underline;
  line-height: 1.1;
  user-select: none;
  cursor: pointer;
`;

const Twitter = styled.div`
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
`;

const Page = styled.div`
  overflow: hidden;
  color: black;
  display: flex;
  flex-direction: column;
  align-items: center;
  vertical-align: middle;
  justify-content: space-between;
  height: 100%;
  width: 100%;
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
`;

const GridRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  height: 100%;
  width: 100%;
`;

const GridSquare = styled.div`
  width: 100%;
  height: 100%;
  border-color: rgba(0, 0, 0, 0.15);
  border-style: solid;
  border-width: 1px;
  justify-content: center;
  vertical-align: middle;
`;
