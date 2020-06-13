import React from 'react';
import { useSelector } from 'react-redux';
import cx from 'classnames';

import Button from 'react-bootstrap/Button';
import CardDeck from 'react-bootstrap/CardDeck';

import PlayerCheckboxLabel from '../common/PlayerCheckboxLabel';
import VoteRevealCard from './VoteRevealCard';
import * as selectors from '../../store/selectors';
import {
  ROLE_WEREWOLF,
  ROLE_MINION,
  ROLE_TANNER,
  ROLE_VILLAGER,
} from '../../constants';

const getTeam = role => {
  if ([ROLE_WEREWOLF, ROLE_MINION].includes(role)) {
    return ROLE_WEREWOLF;
  }
  if ([ROLE_TANNER].includes(role)) {
    return ROLE_WEREWOLF;
  }
  return ROLE_VILLAGER;
};

function VoteResults() {
  const eliminatedPlayers = useSelector(selectors.eliminatedPlayersSelector);
  const players = useSelector(selectors.playersSelector);
  const revealingRoles = useSelector(selectors.revealingRolesSelector);
  const socket = useSelector(selectors.socketSelector);
  const winners = useSelector(selectors.winnersSelector);

  const revealRoles = () => socket.emit('playerAction', { action: 'revealRoles' });
  const winnerPlayers = Object.values(players).filter(
    player => winners.includes(getTeam(player.role))
  );

  return (
    <div className='text-center'>
      <div className='mb-5'>
        <h1>Vote Results</h1>
        <div>
          <strong>Eliminated</strong>:
          {eliminatedPlayers.map(player => <PlayerCheckboxLabel player={player} />)}
        </div>
        <div className={cx({ invisible: revealingRoles })}><Button onClick={revealRoles}>Reveal Roles</Button></div>
        <div className={cx({ invisible: !revealingRoles })}>
          <strong>Winners</strong>:
          {winnerPlayers.map(player => <PlayerCheckboxLabel player={player} />)}
        </div>
      </div>
      <CardDeck className='gallery'>
        {
          Object.values(players).map(
            player => <VoteRevealCard player={player} revealingRoles={revealingRoles}/>
          )
        }
      </CardDeck>
    </div>
  );
}

export default VoteResults;
