import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import cx from 'classnames';

import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button';

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
import { toggleRolesModal } from '../../store/actions';
import {
  currPlayerSelector,
  gameStateSelector,
  revealingRolesSelector,
  socketSelector,
  wakeUpRoleSelector,
} from '../../store/selectors';

function GameplayView() {
  const gameState = useSelector(gameStateSelector);
  const currPlayer = useSelector(currPlayerSelector);
  const revealingRoles = useSelector(revealingRolesSelector);
  const socket = useSelector(socketSelector);
  const wakeUpRole = useSelector(wakeUpRoleSelector);
  const dispatch = useDispatch();
  let isAwake = false;

  const newGame = () => socket.emit('startGame');

  const onShowRolesModal = () => dispatch(toggleRolesModal({ show: true }));

  switch (gameState) {
    case STATE_WW_NIGHTTIME:
      isAwake = currPlayer.originalRole === wakeUpRole && wakeUpRole !== ROLE_DRUNK;
    default:
      isAwake = true;
  }

  return (
    <Row>
      <Col sm={8} className='main-panel py-5 text-center'>
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
      <Col sm={4} className='main-panel py-5 text-center'>
        {
          gameState === STATE_WW_VOTE_RESULTS && revealingRoles &&
            <Button onClick={newGame}>New Game</Button>
        }
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
        <div className='mb-3'><em><small>Roles may change throughout the night...</small></em></div>
        <div><Button variant='link' onClick={onShowRolesModal}>Show role guide</Button></div>
      </Col>
    </Row>
  );
}

export default GameplayView;
