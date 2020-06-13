import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import cx from 'classnames';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import CardDeck from 'react-bootstrap/CardDeck';

import PlayerCheckboxLabel from '../common/PlayerCheckboxLabel';
import RoleCard from './RoleCard';
import VoteLabel from './VoteLabel';
import VoteRevealCard from './VoteRevealCard';
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

  return (
    <div className='text-center'>
      <div className='mb-5'>
        <h1>Vote Results</h1>
        <div className={cx({ invisible: revealingRoles })}><Button onClick={revealRoles}>Reveal Roles</Button></div>
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
