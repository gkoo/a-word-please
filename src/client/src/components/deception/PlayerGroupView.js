import React from 'react';
import { useSelector } from 'react-redux';

import CardDeck from 'react-bootstrap/CardDeck';

import PlayerView from './PlayerView';
import { ROLE_SCIENTIST } from '../../constants';
import { playersSelector } from '../../store/selectors';

function PlayerGroupView() {
  const players = useSelector(playersSelector);
  const nonScientistPlayers = Object.values(players).filter(player => player.role !== ROLE_SCIENTIST);

  return (
    <CardDeck>
      {nonScientistPlayers.map(player => <PlayerView key={player.id} player={player} />)}
    </CardDeck>
  );
}

export default PlayerGroupView;
