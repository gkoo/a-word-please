import React from 'react';
import { useSelector } from 'react-redux';

import PlayerGroupView from './PlayerGroupView';
import TilesView from './TilesView';
import {
  gameDataSelector,
  playersSelector,
} from '../../store/selectors';

function DeliberationView() {
  const players = useSelector(playersSelector);

  return (
    <>
      <h1>Welcome to the Deliberation View!</h1>
      <PlayerGroupView />
      <TilesView />
    </>
  );
}

export default DeliberationView;
