import { Button, TextField } from '@mui/material';
import { address, EthAddress, PlayerInfo, WorldCoords } from 'common-types';
import React, { Component, useEffect, useState } from 'react';
import Draggable from 'react-draggable';
import styled from 'styled-components';
import GameManager from '../backend/GameManager';
import { distance, prettifyAddress } from '../utils';

type PaneProps = {
  coords: WorldCoords;
  gm: GameManager;
  playerInfos: Map<EthAddress, PlayerInfo>;
  onClose: (coords: WorldCoords) => void;
};

async function getTitle(props: PaneProps): Promise<string> {
  // Contract pane: TODO
  // Player pane
  for (const [addr, playerInfo] of props.playerInfos) {
    if (props.coords.x === playerInfo.coords.x && props.coords.y === playerInfo.coords.y) {
      return playerInfo.emoji + ' ' + (await prettifyAddress(playerInfo.realAddress));
    }
  }
  // Owning pane
  return '❓ Unowned Tile';
}

type BodyProps = {
  coords: WorldCoords;
  gm: GameManager;
  playerInfos: Map<EthAddress, PlayerInfo>;
};

function Body(props: BodyProps) {
  // Contract pane: TODO
  // Player pane
  for (const [addr, playerInfo] of props.playerInfos) {
    if (props.coords.x === playerInfo.coords.x && props.coords.y === playerInfo.coords.y) {
      return <>{playerInfo.emoji + ' is at ' + playerInfo.coords.x + ', ' + playerInfo.coords.y}</>;
    }
  }

  // Owning pane
  const [curAddr, setCurAddr] = useState<string>('');
  const [tooFar, setTooFar] = useState<boolean>(false);

  useEffect(() => {
    props.gm.getSelfInfo().then((info) => {
      setTooFar(distance(info.coords, props.coords) > 1);
    });
  }, [props]);

  const onClick = async () => {
    await props.gm.ownTile(props.coords, address(curAddr));
  };

  const handleChange = (event: { target: { value: React.SetStateAction<string> } }) => {
    setCurAddr(event.target.value);
  };
  // Example contract addr: 0xA1cf9870677Bb213991DDdE342a5CE412c0f676D
  return !tooFar ? (
    <>
      <TextField id='standard-basic' label='Address' variant='standard' onChange={handleChange} />
      <Button variant='contained' onClick={onClick}>
        Own Tile ({props.coords.x}, {props.coords.y})
      </Button>
    </>
  ) : (
    <>
      You are too far to claim tile ({props.coords.x}, {props.coords.y})
    </>
  );
}

export default function Pane(props: PaneProps) {
  const [title, setTitle] = useState<string>('');

  useEffect(() => {
    getTitle(props).then((title) => setTitle(title));
  }, [props]);

  return (
    <Draggable>
      <div className='frosted-glass'>
        <CloseButton onClick={() => props.onClose(props.coords)}>x</CloseButton>
        <Title>{title}</Title>
        <Body coords={props.coords} gm={props.gm} playerInfos={props.playerInfos} />
      </div>
    </Draggable>
  );
}

const Title = styled.div`
  font-size: 64px;
`;

const CloseButton = styled.div`
  position: absolute;
  top: 1%;
  right: 1%;
  user-select: none;
  cursor: pointer;
`;
