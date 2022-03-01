import React, { useEffect, useState } from 'react';

import styled from 'styled-components';

import Draggable from 'react-draggable';

export default function TilePane(props: {
  onClose: React.MouseEventHandler<HTMLAnchorElement> | undefined;
}) {
  return (
    <Draggable>
      <PaneContents>
        <CloseButton onClick={props.onClose} href='#'></CloseButton>
        {/* TODO: display logic based on w/e else exists in tile that we care about */}
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
