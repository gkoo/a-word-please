import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import {
  BrowserRouter as Router,
  Switch,
  Redirect,
  Route,
} from "react-router-dom";

import Homepage from './Homepage';
import Room from './Room';
import SessionIndex from './components/SessionIndex';
import { env, routePrefix, sessionsPrefix } from './constants';
import * as serviceWorker from './serviceWorker';
import store from './store';

if (env === 'production' && !window.location.href.match(/koofitness\.club/)) {
  // Redirect to new URL
  const pathMatch = window.location.href.match(/https?:\/\/[^/]+\/?(.*)/);
  window.location.href = `http://koofitness.club/${pathMatch[1]}`;
} else {
  ReactDOM.render(
    <React.StrictMode>
      <Provider store={store}>
        <Router>
          <Switch>
            <Route path={`${routePrefix}/rooms/:roomCode`} component={Room}/>
            <Route path={`${sessionsPrefix}/sessions`} component={SessionIndex}/>
            <Route path={routePrefix} component={Homepage}/>
            <Route>
              <Redirect to={routePrefix} />
            </Route>
          </Switch>
        </Router>
      </Provider>
    </React.StrictMode>,
    document.getElementById('root')
  );
}

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
