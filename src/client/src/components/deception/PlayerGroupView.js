import React from 'react';
import { useSelector } from 'react-redux';

import CardDeck from 'react-bootstrap/CardDeck';

import PlayerView from './PlayerView';
import { Role } from '../../constants/deception';
import { connectedPlayersSelector } from '../../store/selectors';

function PlayerGroupView(props) {
  const connectedPlayers = useSelector(connectedPlayersSelector);
  const nonScientistPlayers = Object.values(connectedPlayers).filter(player => player.role !== Role.Scientist);

  return (
    <CardDeck>
      {nonScientistPlayers.map(player => <PlayerView key={player.id} player={player} {...props} />)}
    </CardDeck>
  );
}

export default PlayerGroupView;
