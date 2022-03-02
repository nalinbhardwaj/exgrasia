import { Config, DAppProvider, ChainId } from '@usedapp/core';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App from './App';

const config: Config = {
  readOnlyChainId: ChainId.xDai,
  readOnlyUrls: {
    [ChainId.xDai]: 'https://poa-xdai.gateway.pokt.network/v1/lb/621ed98c4e140e003a32d166',
  },
};

ReactDOM.render(
  <DAppProvider config={config}>
    <App />
  </DAppProvider>,
  document.getElementById('root')
);
