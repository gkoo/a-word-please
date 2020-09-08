import React from 'react';
import { useSelector } from 'react-redux';

import CardDeck from 'react-bootstrap/CardDeck';

import PlayerView from './PlayerView';
import { ROLE_SCIENTIST } from '../../constants';
import { connectedPlayersSelector } from '../../store/selectors';

function PlayerGroupView(props) {
  const connectedPlayers = useSelector(connectedPlayersSelector);
  const nonScientistPlayers = Object.values(connectedPlayers).filter(player => player.role !== ROLE_SCIENTIST);

  return (
    <CardDeck>
      {nonScientistPlayers.map(player => <PlayerView key={player.id} player={player} {...props} />)}
    </CardDeck>
  );
}

export default PlayerGroupView;
