import React from 'react';
import { useSelector } from 'react-redux';

import PlayerView from './PlayerView';

import { playersSelector } from '../../store/selectors';

function PlayerGroupView() {
  const players = useSelector(playersSelector);

  return (
    <>
      {Object.values(players).map(player => <PlayerView key={player.id} player={player} />)}
    </>
  );
}

export default PlayerGroupView;
