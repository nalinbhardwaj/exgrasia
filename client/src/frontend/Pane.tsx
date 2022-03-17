import { TextField } from '@mui/material';
import { address, dangerousHTML, EthAddress, PlayerInfo, Tile, WorldCoords } from 'common-types';
import React, { Component, useEffect, useState } from 'react';
import Draggable from 'react-draggable';
import styled from 'styled-components';
import GameManager from '../backend/GameManager';
import { distance, getRandomActionId, prettifyAddress } from '../utils';
import { BN } from 'ethereumjs-util';
import { PluginManager } from '../backend/PluginManager';
import { useEmitterValue } from './Utils/EmitterHooks';
import {
  Modal,
  Button,
  Text,
  Input,
  Checkbox,
  Row,
  Card,
  Divider,
  Grid,
  Switch,
  Col,
} from '@nextui-org/react';
import { CloseSquare, Delete } from 'react-iconly';

type PaneProps = {
  coords: WorldCoords;
  gm: GameManager;
  pm: PluginManager;
  playerInfos: Map<EthAddress, PlayerInfo>;
  onClose: (coords: WorldCoords) => void;
  curTiles: Tile[][];
  prettifiedAddresses: Map<EthAddress, string>;
};

type SettingsProps = {
  gm: GameManager;
  pm: PluginManager;
  onClose: () => void;
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
    <>
      <p style={{ fontSize: '32px' }}>{props.contractTile.smartContractMetaData.description}</p>
      <FuncContainer>
        {abi &&
          abi.map((funcABI, funcIndex) => {
            const isConstant = funcABI.constant !== undefined ? funcABI.constant : false;
            const lookupOnly =
              funcABI.stateMutability === 'view' ||
              funcABI.stateMutability === 'pure' ||
              isConstant;

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
    </>
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
  // Contract pane
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
  return (
    <>
      <div style={{ marginBottom: '12px' }}>
        Develop your own contract using the exgrasia remix IDE.
        <div style={{ marginTop: '6px' }}>
          <Button
            onClick={() => {
              window.open('https://remix.exgrasia.xyz', '_blank');
            }}
          >
            Open exgrasia remix IDE
          </Button>
        </div>
      </div>
      {!tooFar ? (
        <>
          <TextField
            id='standard-basic'
            label='Address'
            variant='standard'
            onChange={handleChange}
          />
          <Button onClick={onClick}>
            Own Tile ({props.coords.x}, {props.coords.y})
          </Button>
        </>
      ) : (
        <>
          You are too far to claim tile ({props.coords.x}, {props.coords.y})
        </>
      )}
    </>
  );
}

function Plugins(props: { coords: WorldCoords; gm: GameManager; pm: PluginManager }) {
  const [pluginOutputs, setPluginOutputs] = useState<Map<string, [string, dangerousHTML]>>(
    new Map()
  );

  useEffect(() => {
    props.pm.renderAllRunningPlugins(props.coords).then((outputs) => {
      setPluginOutputs(outputs);
    });
  }, [props]);

  return (
    <>
      {pluginOutputs &&
        [...pluginOutputs.keys()].map((pluginId) => {
          return (
            <div key={pluginId}>
              <div>{pluginOutputs.get(pluginId)![0]}</div>
              <div dangerouslySetInnerHTML={pluginOutputs.get(pluginId)![1]} />
            </div>
          );
        })}
    </>
  );
}

export function Pane(props: PaneProps) {
  return (
    <Draggable>
      <div className='frosted-glass' style={{ maxWidth: '50%' }}>
        <CloseButton onClick={() => props.onClose(props.coords)}>&#10006;</CloseButton>
        <Title>{getTitle(props)}</Title>
        <Body
          coords={props.coords}
          gm={props.gm}
          playerInfos={props.playerInfos}
          curTiles={props.curTiles}
        />
        <Plugins coords={props.coords} gm={props.gm} pm={props.pm} />
      </div>
    </Draggable>
  );
}

export function SettingsPane(props: SettingsProps) {
  const [spawnedPlugins, setSpawnedPlugins] = useState<string[]>([]);
  const plugins = useEmitterValue(props.pm.plugins$, props.pm.getPlugins());
  const [addPluginName, setAddPluginName] = useState<string>('');
  const [addPluginCodeURL, setAddPluginCodeURL] = useState<string>('');

  useEffect(() => {
    plugins.forEach((plugin) => {
      if (props.pm.isSpawned(plugin.id)) setSpawnedPlugins([...spawnedPlugins, plugin.id]);
    });
  }, [plugins]);

  const handleClick = (pluginId: string) => {
    if (spawnedPlugins.includes(pluginId)) {
      props.pm.destroy(pluginId);
      setSpawnedPlugins(spawnedPlugins.filter((id) => id !== pluginId));
    } else {
      props.pm.spawn(pluginId);
      setSpawnedPlugins([...spawnedPlugins, pluginId]);
    }
  };

  const handleNameChange = (event: { target: { value: React.SetStateAction<string> } }) => {
    setAddPluginName(event.target.value);
  };

  const handleCodeChange = (event: { target: { value: React.SetStateAction<string> } }) => {
    setAddPluginCodeURL(event.target.value);
  };

  const handleAdd = async () => {
    await props.pm.addPluginToLibrary(getRandomActionId(), addPluginName, addPluginCodeURL);
  };

  const handleDelete = (pluginId: string) => {
    props.pm.deletePlugin(pluginId);
    if (spawnedPlugins.includes(pluginId)) {
      setSpawnedPlugins(spawnedPlugins.filter((id) => id !== pluginId));
    }
  };

  return (
    <Draggable>
      <Card
        css={{
          bgBlur: '#111111',
          borderStyle: 'none',
          maxWidth: '25%',
          position: 'absolute',
          top: '25%',
          zIndex: '1',
        }}
      >
        <Card.Header>
          <Text b h1 size={48}>
            ⚙️ Settings
          </Text>
        </Card.Header>
        <Divider />
        <Card.Body css={{ py: '$4' }}>
          <Text css={{ marginBottom: '$4' }}>Manage plugins and add new ones.</Text>
          {plugins.map((plugin) => {
            return (
              <Grid.Container justify='space-between' key={plugin.id}>
                <Grid xs>
                  <Text b size={24} css={{ verticalAlign: 'middle' }}>
                    {plugin.name}
                  </Text>
                </Grid>
                <Grid xs>
                  <Switch
                    shadow
                    color='success'
                    checked={spawnedPlugins.includes(plugin.id)}
                    onChange={(e) => handleClick(plugin.id)}
                    css={{ marginRight: '0px', marginLeft: 'auto' }}
                    size='md'
                  ></Switch>
                  <Button
                    flat
                    auto
                    rounded
                    size='sm'
                    color='error'
                    onClick={() => handleDelete(plugin.id)}
                    css={{ marginRight: '0px', marginLeft: 'auto' }}
                  >
                    <Text color='error'>delete</Text>
                  </Button>
                </Grid>
              </Grid.Container>
            );
          })}
          <Text css={{ marginTop: '$4' }}>Add plugin:</Text>
          <Grid.Container gap={2} css={{ marginTop: '$2' }}>
            <Row css={{ marginTop: '$4' }}>
              <Col>
                <Input
                  size='sm'
                  labelPlaceholder='Name'
                  status='default'
                  onChange={handleNameChange}
                  css={{
                    $$inputPlaceholderColor: '$colors$foreground',
                  }}
                />
              </Col>
              <Col>
                <Input
                  size='sm'
                  labelPlaceholder='Code URL'
                  status='default'
                  onChange={handleCodeChange}
                  css={{
                    $$inputPlaceholderColor: '$colors$foreground',
                  }}
                />
              </Col>
            </Row>
            <Row css={{ marginTop: '$4' }}>
              <Button
                flat
                auto
                rounded
                size='sm'
                color='success'
                onClick={handleAdd}
                css={{ marginRight: '0px', marginLeft: 'auto' }}
              >
                <Text color='success'>add</Text>
              </Button>
            </Row>
          </Grid.Container>
        </Card.Body>
        <Divider />
        <Card.Footer>
          <Row justify='flex-end'>
            <Button flat auto rounded size='sm' color='secondary' onClick={props.onClose}>
              <Text color='primary'>close</Text>
            </Button>
          </Row>
        </Card.Footer>
      </Card>
    </Draggable>
  );
}

const Title = styled.div`
  font-size: 64px;
`;

const CloseButton = styled.div`
  position: absolute;
  top: 3%;
  right: 3%;
  user-select: none;
  cursor: pointer;
  font-size: 24px;
`;
