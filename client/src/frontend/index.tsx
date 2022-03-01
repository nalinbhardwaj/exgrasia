import { Config, DAppProvider, Mainnet } from '@usedapp/core';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App from './App';

const config: Config = {
  readOnlyChainId: Mainnet.chainId,
  readOnlyUrls: {
    [Mainnet.chainId]: 'https://mainnet.infura.io/v3/62687d1a985d4508b2b7a24827551934',
  },
};

ReactDOM.render(
  <DAppProvider config={config}>
    <App />
  </DAppProvider>,
  document.getElementById('root')
);
