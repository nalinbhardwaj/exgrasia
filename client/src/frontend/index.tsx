import { Config, DAppProvider, ChainId } from '@usedapp/core';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App from './App';
import './index.css';
import { createTheme, NextUIProvider } from '@nextui-org/react';

const darkTheme = createTheme({
  type: 'dark',
  theme: {
    fonts: {
      sans: 'League Mono, monospace',
      mono: 'League Mono, monospace',
    },
    colors: {
      primary: '$cyan100',
      secondary: '$gray900',
      inputPlaceholderColor: '$cyan100',
    },
  },
});

const config: Config = {
  readOnlyChainId: 300,
  readOnlyUrls: {
    [69]: 'https://kovan.optimism.io',
    [300]: 'https://optimism.gnosischain.com',
  },
};

ReactDOM.render(
  <NextUIProvider theme={darkTheme}>
    <DAppProvider config={config}>
      <App />
    </DAppProvider>
  </NextUIProvider>,
  document.getElementById('root')
);
