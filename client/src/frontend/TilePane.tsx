import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import Draggable from 'react-draggable';

import { useInfo, useInitted, useTiles } from './Utils/AppHooks';
import GameManager from '../backend/GameManager';
import { WorldCoords } from 'common-types';

export default function TilePane(props: {
  gameManager: GameManager | undefined;
  coord: WorldCoords | undefined;
  onClose: React.MouseEventHandler<HTMLAnchorElement> | undefined;
}) {
  const playerInfos = useInfo(props.gameManager);

  // TODO: function that returns an Option containing player info to render

  // TODO: contract abi interaction + claim contract stuff

  return (
    <Draggable>
      <PaneContents>
        <CloseButton onClick={props.onClose} href='#'></CloseButton>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
        labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
        laboris nisi ut aliquip ex ea commodo consequat.
        {/* conditional view:
          - if player here, show player stats

          - if contract exists, show contract interaction (and renew btn if it's yours
          - else show claim button (and remix code input)
          */}
      </PaneContents>
    </Draggable>
  );
}

// TODO: clean up absolutes
const PaneContents = styled.div`
  border-color: rgba(0, 0, 0, 0.5);
  border-style: solid;
  border-width: 2px;
  padding: 10px;
  width: 200px;
  background: rgba(255, 255, 255, 1);
`;

// TODO: clean up absolutes
const CloseButton = styled.a`
  & {
    position: absolute;
    right: 25px;
    top: 4px;
    opacity: 0.3;
  }

  &:hover {
    opacity: 1;
  }

  &:before,
  &:after {
    position: absolute;
    left: 15px;
    content: ' ';
    height: 10px;
    width: 2px;
    background-color: #333;
  }

  &:before {
    transform: rotate(45deg);
  }

  &:after {
    transform: rotate(-45deg);
  }
`;
