import React, { useEffect, useState } from 'react';

import styled from 'styled-components';

import Draggable from 'react-draggable';

export default function TilePane() {
  return (
    <Draggable>
      <PaneContents>
        {/* onClick, call passed in function to remove from list */}
        <CloseButton href='#'></CloseButton>
        foo
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
  z-index: 10;
`;

// TODO: clean up absolutes
const CloseButton = styled.a`
  & {
    position: absolute;
    right: 25px;
    top: 2px;
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
