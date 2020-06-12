import React from 'react';
import { useSelector } from 'react-redux';

import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button'

import RoleCard from './RoleCard';
import VoteLabel from './VoteLabel';
import * as selectors from '../../store/selectors';
import {
  LABELS,
  ROLE_WEREWOLF,
  ROLE_MINION,
  ROLE_TANNER,
  ROLE_VILLAGER,
  ROLE_MASON,
  ROLE_SEER,
  ROLE_ROBBER,
  ROLE_TROUBLEMAKER,
  ROLE_DRUNK,
  ROLE_INSOMNIAC,
  ROLE_HUNTER,
  ROLE_DOPPELGANGER,
} from '../../constants';

function VoteResults() {
  const players = useSelector(selectors.playersSelector);
  const revealingRoles = useSelector(selectors.revealingRolesSelector);
  const socket = useSelector(selectors.socketSelector);
  const votes = useSelector(selectors.votesSelector);

  const revealRoles = () => socket.emit('playerAction', { action: 'revealRoles' });

  const newGame = () => socket.emit('startGame');

  const revealedPlayers = [];
  if (revealingRoles) {
    // Order players by their role type
    [
      ROLE_WEREWOLF,
      ROLE_MINION,
      ROLE_TANNER,
      ROLE_VILLAGER,
      ROLE_MASON,
      ROLE_SEER,
      ROLE_ROBBER,
      ROLE_TROUBLEMAKER,
      ROLE_DRUNK,
      ROLE_INSOMNIAC,
      ROLE_HUNTER,
      ROLE_DOPPELGANGER,
    ].forEach(role => {
      const playersWithRole = Object.values(players).filter(player => player.role === role);
      playersWithRole.forEach(player => revealedPlayers.push(player));
    });
  }

  return (
    <div className='text-center'>
      {
        revealingRoles && <Button onClick={newGame}>New Game</Button>
      }
      <h1>Here are the results of the vote!</h1>
      <div className='mb-5'>
        {
          Object.keys(votes).map(voterId => {
            const suspectId = votes[voterId];
            return <VoteLabel voter={players[voterId]} suspect={players[suspectId]}/>;
          })
        }
      </div>
      {
        !revealingRoles &&
          <div className='my-3'>
            <Button onClick={revealRoles}>Reveal Roles</Button>
          </div>
      }
      {
        revealingRoles &&
          <div className='reveal-role-gallery'>
            {
              revealedPlayers.map(player => <RoleCard role={player.role} />)
            }
          </div>
      }
    </div>
  );
}

export default VoteResults;
