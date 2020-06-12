import React from 'react';
import { useSelector } from 'react-redux';

import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import DaytimeView from './DaytimeView';
import NighttimeView from './NighttimeView';
import RoleCard from './RoleCard';
import VoteResults from './VoteResults';
import {
  ROLE_DRUNK,
  STATE_WW_NIGHTTIME,
  STATE_WW_DAYTIME,
  STATE_WW_VOTING,
  STATE_WW_VOTE_RESULTS,
} from '../../constants';
import { currPlayerSelector, gameStateSelector, wakeUpRoleSelector } from '../../store/selectors';

function GameplayView() {
  const gameState = useSelector(gameStateSelector);
  const currPlayer = useSelector(currPlayerSelector);
  const wakeUpRole = useSelector(wakeUpRoleSelector);
  let isAwake = false;

  switch (gameState) {
    case STATE_WW_NIGHTTIME:
      isAwake = currPlayer.originalRole === wakeUpRole && wakeUpRole !== ROLE_DRUNK;
    default:
      isAwake = true;
  }

  return (
    <Row>
      <Col sm={8} className='main-panel py-5'>
        {
          gameState === STATE_WW_NIGHTTIME &&
            <NighttimeView />
        }
        {
          [STATE_WW_DAYTIME, STATE_WW_VOTING].includes(gameState) &&
            <DaytimeView />
        }
        {
          gameState === STATE_WW_VOTE_RESULTS &&
            <VoteResults />
        }
      </Col>
      <Col sm={4} className='text-center main-panel py-5'>
        <h1>
          <span>
            {isAwake ? '😳' : '😴'}
          </span>
        </h1>
        <h4>
          Your
          {currPlayer.lastKnownRole !== currPlayer.originalRole ? ' last known ' : ' starting '}
          role
        </h4>
        <RoleCard role={currPlayer.lastKnownRole} />
        <p><em><small>Roles may change throughout the night...</small></em></p>
      </Col>
    </Row>
  );
}

export default GameplayView;
