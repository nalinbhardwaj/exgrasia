import { Button, TextField } from '@mui/material';
import { address, EthAddress, PlayerInfo, Tile, WorldCoords } from 'common-types';
import React, { Component, useEffect, useState } from 'react';
import Draggable from 'react-draggable';
import styled from 'styled-components';
import GameManager from '../backend/GameManager';
import { distance, prettifyAddress } from '../utils';
import { BN } from 'ethereumjs-util';

type PaneProps = {
  coords: WorldCoords;
  gm: GameManager;
  playerInfos: Map<EthAddress, PlayerInfo>;
  onClose: (coords: WorldCoords) => void;
  curTiles: Tile[][];
  prettifiedAddresses: Map<EthAddress, string>;
};

function getTitle(props: PaneProps): string {
  // Contract pane
  const contractTile = props.curTiles[props.coords.x][props.coords.y];
  if (contractTile.smartContractMetaData.emoji !== '') {
    return contractTile.smartContractMetaData.emoji + ' ' + contractTile.smartContractMetaData.name;
  }

  // Player pane
  for (const [addr, playerInfo] of props.playerInfos) {
    if (props.coords.x === playerInfo.coords.x && props.coords.y === playerInfo.coords.y) {
      return (
        playerInfo.emoji +
        ' ' +
        (props.prettifiedAddresses.get(playerInfo.proxyAddress) || playerInfo.realAddress)
      );
    }
  }
  // Owning pane
  return '❓ Unowned Tile';
}

function ContractBody(props: { coords: WorldCoords; gm: GameManager; contractTile: Tile }) {
  const abi = props.contractTile.smartContractMetaData.extendedAbi;
  const [results, setResults] = useState<Map<number, any>>(new Map());
  const [inputs, setInputs] = useState<Map<number, Map<number, any>>>(new Map());

  const handleClick = async (
    funcName: string,
    funcIndex: number,
    inputLength: number,
    lookupOnly: boolean
  ) => {
    const moddedInput = new Array<any>(inputLength);
    for (const [idx, v] of inputs.get(funcIndex) || new Map()) {
      moddedInput[idx] = JSON.parse(v);
    }
    const result = lookupOnly
      ? await props.gm.tileCall(props.coords, funcName, moddedInput)
      : await props.gm.tileTx(props.coords, funcName, moddedInput);
    console.log('result', result);
    setResults(new Map(results.set(funcIndex, result)));
  };

  const handleChange = (
    event: { target: { value: React.SetStateAction<string> } },
    funcIndex: number,
    inputIndex: number
  ) => {
    setInputs(
      new Map(
        inputs.set(
          funcIndex,
          (inputs.get(funcIndex) || new Map()).set(inputIndex, event.target.value)
        )
      )
    );
  };
  return (
    <FuncContainer>
      {abi &&
        abi.map((funcABI, funcIndex) => {
          const isConstant = funcABI.constant !== undefined ? funcABI.constant : false;
          const lookupOnly =
            funcABI.stateMutability === 'view' || funcABI.stateMutability === 'pure' || isConstant;

          return (
            <>
              {funcABI.inputs &&
                funcABI.inputs.map((input, inputIndex) => {
                  return (
                    <TextField
                      key={funcABI.name + inputIndex}
                      id='standard-basic'
                      label={input.name}
                      variant='standard'
                      onChange={(event) => handleChange(event, funcIndex, inputIndex)}
                    />
                  );
                })}
              <Button
                key={funcABI.name}
                style={{ margin: '10px' }}
                variant='contained'
                onClick={() =>
                  handleClick(funcABI.name, funcIndex, funcABI.inputs.length, lookupOnly)
                }
              >
                {funcABI.name}
              </Button>
              {results.has(funcIndex) && lookupOnly && (
                <>{JSON.stringify(results.get(funcIndex), null, 2)}</>
              )}
            </>
          );
        })}
    </FuncContainer>
  );
}

const FuncContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  vertical-align: middle;
  justify-content: space-between;
`;

type BodyProps = {
  coords: WorldCoords;
  gm: GameManager;
  playerInfos: Map<EthAddress, PlayerInfo>;
  curTiles: Tile[][];
};

function Body(props: BodyProps) {
  // Contract pane: TODO
  const contractTile = props.curTiles[props.coords.x][props.coords.y];
  if (contractTile.smartContractMetaData.emoji !== '') {
    return <ContractBody coords={props.coords} gm={props.gm} contractTile={contractTile} />;
  }
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
  return (
    <Draggable>
      <div className='frosted-glass'>
        <CloseButton onClick={() => props.onClose(props.coords)}>x</CloseButton>
        <Title>{getTitle(props)}</Title>
        <Body
          coords={props.coords}
          gm={props.gm}
          playerInfos={props.playerInfos}
          curTiles={props.curTiles}
        />
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
