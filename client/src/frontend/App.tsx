import { DEV_TEST_PRIVATE_KEY } from 'common-types';
import React from 'react';
import { hot } from 'react-hot-loader/root';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { createGlobalStyle } from 'styled-components';
import Game from './Game';
import Splash from './Splash';

// const isProd = process.env.NODE_ENV === 'production';

function App() {
  return (
    <>
      <GlobalStyle />
      <Router>
        <Switch>
          <Route path='/' exact component={Splash} />
          <Route path='/game' exact component={Game} />
          <Route path='/game/:privKeyIdx' exact component={Game} />
          <Route
            path='/guide'
            exact
            component={() => {
              window.location.href =
                'https://gist.github.com/nalinbhardwaj/ea2a7ebde6ee922a4cb995b5c9580040';
              return null;
            }}
          />
        </Switch>
      </Router>
    </>
  );
}

const GlobalStyle = createGlobalStyle`
body {
  color: "#ffffff";
  width: 100vw;
  min-height: 100vh;
  background-color: "#ffffff";
  overflow: hidden;
  font-family: "League Mono", monospace;
}
`;

export default hot(App);
