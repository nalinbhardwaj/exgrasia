import { TextField } from '@mui/material';
import { address, dangerousHTML, EthAddress, PlayerInfo, Tile, WorldCoords } from 'common-types';
import React, { Component, Fragment, useEffect, useState } from 'react';
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
  Link,
  Spacer,
} from '@nextui-org/react';
import { CloseSquare, Delete, Paper } from 'react-iconly';
import { Listbox, Transition } from '@headlessui/react';
import { CheckIcon, SelectorIcon } from '@heroicons/react/solid';
import { BigNumber, ethers } from 'ethers';
import { useTileTxStatus } from './Utils/AppHooks';

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
  return '🔮 Claim Tile';
}

function ContractInstance(props: { coords: WorldCoords; gm: GameManager; contractTile: Tile }) {
  const abi = props.contractTile.smartContractMetaData.extendedAbi;
  const [selectedFuncName, setSelectedFuncName] = useState<string>(
    abi.find((f) => f.name !== undefined)!.name
  );
  const [actionId, setActionId] = useState<string>('');
  const [result, setResult] = useState<any>(undefined);
  const [inputs, setInputs] = useState<Map<number, string>>(new Map());
  const [buttonState, setButtonState] = useState<'none' | 'loading' | 'success' | 'reverted'>(
    'none'
  );
  const tileTxStatus = useTileTxStatus(props.gm);
  const selectedFunc = abi.find((f) => f.name === selectedFuncName) || abi[0];
  const selectedFuncLookupOnly =
    selectedFunc.stateMutability === 'view' ||
    selectedFunc.stateMutability === 'pure' ||
    selectedFunc.constant;

  const extractDataDefault = (item: any) => {
    const ret: any = {};

    if (item._isBigNumber) {
      ret.self = item.toString(10);
      ret.children = [];
    } else {
      if (item instanceof Array) {
        ret.children = item.map((item, index) => {
          return { key: index, value: item };
        });
        ret.self = 'Array';
        ret.isNode = true;
        ret.isLeaf = false;
      } else if (item instanceof Object) {
        ret.children = Object.keys(item).map((key) => {
          return { key: key, value: item[key] };
        });
        ret.self = 'Object';
        ret.isNode = true;
        ret.isLeaf = false;
      } else {
        ret.self = item;
        ret.children = null;
        ret.isNode = false;
        ret.isLeaf = true;
      }
    }
    return ret;
  };

  const renderData = (item: any, key: string | number, keyPath: string) => {
    const data = extractDataDefault(item);
    const children = (data.children || []).map((child: any) => {
      return renderData(child.value, child.key, keyPath + '/' + child.key);
    });

    if (children && children.length > 0) {
      return (
        <div style={{ marginLeft: '16px' }}>
          ↪{key}: {data.self}
          {children}
        </div>
      );
    } else {
      return (
        <div style={{ marginLeft: '16px' }}>
          ↪{key}: {data.self}
        </div>
      );
    }
  };

  const handleClick = async () => {
    const moddedInput = new Array<any>(selectedFunc.inputs.length);
    for (const [idx, v] of inputs) {
      moddedInput[idx] = v;
      if (selectedFunc.inputs[idx].type.endsWith('[]')) {
        moddedInput[idx] = JSON.parse(moddedInput[idx]);
      } else if (selectedFunc.inputs[idx].type == 'bool') {
        moddedInput[idx] = moddedInput[idx] === 'true' || moddedInput[idx] === '1';
      }
    }

    if (selectedFuncLookupOnly) {
      setResult(await props.gm.tileCall(props.coords, selectedFunc.name, moddedInput));
    } else {
      setActionId(await props.gm.tileTx(props.coords, selectedFunc.name, moddedInput));
    }
  };

  useEffect(() => {
    if (tileTxStatus.confirmed.value.includes(actionId)) {
      setButtonState('success');
      setTimeout(() => {
        setButtonState('none');
      }, 2000);
    }
  }, [tileTxStatus.confirmed, actionId]);

  useEffect(() => {
    if (tileTxStatus.submitted.value.includes(actionId)) {
      setButtonState('loading');
    }
  }, [tileTxStatus.submitted, actionId]);

  useEffect(() => {
    if (tileTxStatus.reverted.value.includes(actionId)) {
      setButtonState('reverted');
    }
    setTimeout(() => {
      setButtonState('none');
    }, 2000);
  }, [tileTxStatus.reverted, actionId]);

  const prettifyButtonState = () => {
    switch (buttonState) {
      case 'none':
        return 'submit';
      case 'loading':
        return 'loading...';
      case 'success':
        return 'success';
      case 'reverted':
        return 'reverted';
    }
  };

  return (
    <Grid.Container justify='flex-start' direction='row'>
      <Row css={{ margin: '$4' }}>
        <Col>
          <Listbox
            value={selectedFuncName}
            onChange={(selection) => {
              setSelectedFuncName(selection);
              setInputs(new Map());
              setResult(undefined);
            }}
          >
            <div className='relative mt-1'>
              <Listbox.Button className='relative w-full py-2 pl-3 pr-10 text-left bg-black rounded-lg shadow-md cursor-default focus:outline-none focus-visible:ring-2 focus-visible:ring-opacity-75 focus-visible:ring-white focus-visible:ring-offset-orange-300 focus-visible:ring-offset-2 focus-visible:border-indigo-500 sm:text-sm'>
                <span className='block truncate text-white'>{selectedFunc.name}</span>
                <span className='absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none'>
                  <SelectorIcon className='w-5 h-5 text-white' aria-hidden='true' />
                </span>
              </Listbox.Button>
              <Transition
                as={Fragment}
                leave='transition ease-in duration-100'
                leaveFrom='opacity-100'
                leaveTo='opacity-0'
              >
                <Listbox.Options className='absolute w-full py-1 mt-1 overflow-auto text-base bg-black rounded-md shadow-lg max-h-36 ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm z-max'>
                  {abi.map(
                    (func, funcIdx) =>
                      func.name && (
                        <Listbox.Option
                          key={funcIdx}
                          className={({ active }) =>
                            `cursor-default select-none relative py-2 pl-10 pr-4 ${
                              active ? 'text-warning-yellowtext bg-warning-yellowbg' : 'text-white'
                            }`
                          }
                          value={func.name}
                        >
                          {({ selected }) => (
                            <>
                              <span
                                className={`block truncate ${
                                  selected ? 'font-medium' : 'font-normal'
                                }`}
                              >
                                {func.name}
                              </span>
                              {selected ? (
                                <span className='absolute inset-y-0 left-0 flex items-center pl-3 text-warning-yellowtext'>
                                  <CheckIcon className='w-5 h-5' aria-hidden='true' />
                                </span>
                              ) : null}
                            </>
                          )}
                        </Listbox.Option>
                      )
                  )}
                </Listbox.Options>
              </Transition>
            </div>
          </Listbox>
        </Col>
      </Row>
      {selectedFunc.inputs.map((input, inputIdx) => {
        return (
          <Row key={inputIdx} css={{ margin: '$4' }}>
            <Input
              size='sm'
              label={input.name}
              placeholder={input.type}
              value={inputs.get(inputIdx) || ''}
              status='default'
              onChange={(event) => {
                const newInputs = new Map(inputs);
                newInputs.set(inputIdx, event.target.value);
                setInputs(newInputs);
              }}
              css={{
                $$inputPlaceholderColor: '$colors$foreground',
              }}
            />
            {input.type === 'bytes32' && (
              <Button
                flat
                auto
                rounded
                size='sm'
                color='warning'
                onClick={() => {
                  const newInputs = new Map(inputs);
                  if (ethers.utils.isHexString(inputs.get(inputIdx))) {
                    newInputs.set(
                      inputIdx,
                      ethers.utils.parseBytes32String(inputs.get(inputIdx) || '')
                    );
                    setInputs(newInputs);
                  } else {
                    newInputs.set(
                      inputIdx,
                      ethers.utils.formatBytes32String(inputs.get(inputIdx) || '')
                    );
                    setInputs(newInputs);
                  }
                }}
                css={{
                  marginRight: '0px',
                  marginLeft: 'auto',
                  marginBottom: '0px',
                  marginTop: 'auto',
                }}
              >
                <Text color='warning'>
                  <span style={{ fontFamily: 'monospace' }}>→</span> bytes32
                </Text>
              </Button>
            )}

            {input.type === 'bytes' && (
              <Button
                flat
                auto
                rounded
                size='sm'
                color='warning'
                onClick={() => {
                  const newInputs = new Map(inputs);
                  if (ethers.utils.isHexString(inputs.get(inputIdx))) {
                    newInputs.set(inputIdx, ethers.utils.toUtf8String(inputs.get(inputIdx) || ''));
                    setInputs(newInputs);
                  } else {
                    newInputs.set(
                      inputIdx,
                      ethers.utils.hexlify(ethers.utils.toUtf8Bytes(inputs.get(inputIdx) || ''))
                    );
                    setInputs(newInputs);
                  }
                }}
                css={{
                  marginRight: '0px',
                  marginLeft: 'auto',
                  marginBottom: '0px',
                  marginTop: 'auto',
                }}
              >
                <Text color='warning'>
                  <span style={{ fontFamily: 'monospace' }}>→</span> hex
                </Text>
              </Button>
            )}

            {input.type === 'uint256' && (
              <Button
                flat
                auto
                rounded
                size='sm'
                color='warning'
                onClick={() => {
                  const newInputs = new Map(inputs);
                  console.log('inp', inputs.get(inputIdx));
                  newInputs.set(
                    inputIdx,
                    ethers.utils.parseEther(inputs.get(inputIdx) || '0').toString()
                  );
                  console.log('new', newInputs.get(inputIdx));
                  setInputs(newInputs);
                }}
                css={{
                  marginRight: '0px',
                  marginLeft: 'auto',
                  marginBottom: '0px',
                  marginTop: 'auto',
                }}
              >
                <Text color='warning'>
                  <span style={{ fontFamily: 'monospace' }}>→</span> *= 10^18
                </Text>
              </Button>
            )}
          </Row>
        );
      })}
      <Row css={{ margin: '$4' }}>
        <Button color='warning' flat auto rounded onClick={handleClick} css={{ width: '100%' }}>
          {selectedFuncLookupOnly ? 'call' : prettifyButtonState()}
        </Button>
      </Row>
      {result && (
        <Row css={{ margin: '$4' }}>
          <Card
            css={{
              bgBlur: '#111111',
              borderStyle: 'none',
              overflow: 'scroll',
              maxHeight: '8em',
            }}
          >
            <Text>{renderData(result, 'output', 'output')}</Text>
          </Card>
        </Row>
      )}
    </Grid.Container>
  );
}

function ContractBody(props: { coords: WorldCoords; gm: GameManager; contractTile: Tile }) {
  const [expanders, setExpanders] = useState<number>(1);

  return (
    <div style={{ minHeight: '320px' }}>
      <Text css={{ margin: '$4' }}>{props.contractTile.smartContractMetaData.description}</Text>
      {[...Array(expanders)].map((_, i) => {
        return (
          <div key={i}>
            <ContractInstance
              key={i}
              coords={props.coords}
              gm={props.gm}
              contractTile={props.contractTile}
            />
            {i < expanders - 1 ? <Spacer></Spacer> : null}
          </div>
        );
      })}
      <Button
        size='sm'
        flat
        rounded
        auto
        color='secondary'
        onClick={() => {
          setExpanders(expanders + 1);
        }}
        css={{
          width: '5%',
          marginRight: '$4',
          marginLeft: 'auto',
          marginTop: '$4',
          marginBottom: '0',
        }}
      >
        <Text color='primary'>+</Text>
      </Button>
    </div>
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
      return (
        <Text>
          {playerInfo.emoji + ' is at (' + playerInfo.coords.x + ', ' + playerInfo.coords.y + ')'}
        </Text>
      );
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
      {!tooFar ? (
        <>
          <Text css={{ marginTop: '$4', marginBottom: '$2', marginLeft: '12px' }}>
            Claim tile ({props.coords.x}, {props.coords.y})
          </Text>

          <Grid.Container gap={2} justify='space-between' css={{ alignItems: 'center' }}>
            <Grid xs>
              <Input
                fullWidth
                size='sm'
                labelPlaceholder='Contract Address'
                status='default'
                onChange={handleChange}
                css={{
                  $$inputPlaceholderColor: '$colors$foreground',
                }}
              />
            </Grid>
            <Grid xs>
              <Button
                flat
                auto
                rounded
                size='sm'
                color='success'
                onClick={onClick}
                css={{ marginRight: '0px', marginLeft: 'auto' }}
              >
                <Text color='success'>claim</Text>
              </Button>
            </Grid>
          </Grid.Container>
          <Grid.Container gap={2} justify='space-between' css={{ alignItems: 'center' }}>
            <Grid xs>
              <Text b css={{ verticalAlign: 'middle', alignItems: 'center' }}>
                Code your own tile
              </Text>
            </Grid>
            <Grid xs>
              <Button
                size='sm'
                color='warning'
                flat
                auto
                rounded
                onClick={() => {
                  window.open('https://remix.exgrasia.xyz/', '_blank');
                }}
                css={{ marginRight: '0px', marginLeft: 'auto' }}
              >
                launch εxgrasia ide
              </Button>
            </Grid>
          </Grid.Container>
        </>
      ) : (
        <Text css={{ marginTop: '$4', marginBottom: '$2' }}>
          You are too far to claim tile ({props.coords.x}, {props.coords.y})
        </Text>
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
            pluginOutputs.get(pluginId)![1]['__html'] !== '' && (
              <div key={pluginId}>
                <Text b size={24}>
                  {pluginOutputs.get(pluginId)![0]}
                </Text>
                <Card
                  css={{
                    bgBlur: '#111111',
                    borderStyle: 'none',
                    overflow: 'scroll',
                    maxHeight: '8em',
                  }}
                >
                  <Text>
                    <div dangerouslySetInnerHTML={pluginOutputs.get(pluginId)![1]} />
                  </Text>
                </Card>
              </div>
            )
          );
        })}
    </>
  );
}

const EXPLORER_BASE_URL = 'https://kovan-optimistic.etherscan.io/address/';

function shortenAddress(addr: EthAddress) {
  return addr.slice(0, 6) + '...' + addr.slice(-4);
}

export function Footer(props: BodyProps) {
  // Contract pane
  const contractTile = props.curTiles[props.coords.x][props.coords.y];
  if (contractTile.smartContractMetaData.emoji !== '') {
    return (
      <Link color='text' href={EXPLORER_BASE_URL + contractTile.smartContract} target='_blank'>
        🔗 Contract {shortenAddress(contractTile.smartContract)}
      </Link>
    );
  }
  // Player pane
  for (const [addr, playerInfo] of props.playerInfos) {
    if (props.coords.x === playerInfo.coords.x && props.coords.y === playerInfo.coords.y) {
      return (
        <Link color='text' href={EXPLORER_BASE_URL + playerInfo.realAddress} target='_blank'>
          🔗 Address {shortenAddress(playerInfo.realAddress)}
        </Link>
      );
    }
  }
  return <div></div>;
}

export function Pane(props: PaneProps) {
  return (
    <Draggable>
      <Card
        css={{
          bgBlur: '#111111',
          borderStyle: 'none',
          maxWidth: '50%',
          width: 'fit-content',
          blockSize: 'fit-content',
          position: 'absolute',
          top: '25%',
          zIndex: '1',
        }}
      >
        <Card.Header>
          <Text b h1 size={48}>
            {getTitle(props)}
          </Text>
        </Card.Header>
        <Divider />
        <Card.Body css={{ py: '$4' }}>
          <Body
            coords={props.coords}
            gm={props.gm}
            playerInfos={props.playerInfos}
            curTiles={props.curTiles}
          />
          <Plugins coords={props.coords} gm={props.gm} pm={props.pm} />
        </Card.Body>
        <Divider />
        <Card.Footer>
          <Row justify='space-between' css={{ verticalAlign: 'middle', alignItems: 'center' }}>
            <Footer
              coords={props.coords}
              gm={props.gm}
              playerInfos={props.playerInfos}
              curTiles={props.curTiles}
            ></Footer>
            <Button
              flat
              auto
              rounded
              size='sm'
              color='secondary'
              onClick={() => props.onClose(props.coords)}
            >
              <Text color='primary'>close</Text>
            </Button>
          </Row>
        </Card.Footer>
      </Card>
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
          <Text css={{ marginBottom: '$4' }}>Manage plugins</Text>
          {plugins.map((plugin) => {
            return (
              <Grid.Container
                justify='space-between'
                key={plugin.id}
                css={{ alignItems: 'center' }}
              >
                <Grid xs>
                  <Text b size={24} css={{ verticalAlign: 'middle', alignItems: 'center' }}>
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
          <Text css={{ marginTop: '$4' }}>Add plugin</Text>
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
                  type='url'
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
