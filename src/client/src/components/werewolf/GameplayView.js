import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button';

import DaytimeView from './DaytimeView';
import NighttimeView from './NighttimeView';
import PlayerCheckboxLabel from '../common/PlayerCheckboxLabel';
import RoleCard from './RoleCard';
import VoteResults from './VoteResults';
import {
  ROLE_DRUNK,
  STATE_WW_NIGHTTIME,
  STATE_WW_DAYTIME,
  STATE_WW_VOTING,
  STATE_WW_VOTE_RESULTS,
} from '../../constants/werewolf';
import { toggleRolesModal } from '../../store/actions';
import {
  currPlayerSelector,
  gameStateSelector,
  playersSelector,
  wakeUpRoleSelector,
} from '../../store/selectors';

function GameplayView() {
  const gameState = useSelector(gameStateSelector);
  const currPlayer = useSelector(currPlayerSelector);
  const players = useSelector(playersSelector);
  const wakeUpRole = useSelector(wakeUpRoleSelector);
  const dispatch = useDispatch();

  const onShowRolesModal = () => dispatch(toggleRolesModal({ show: true }));

  const isAwake = (gameState !== STATE_WW_NIGHTTIME) || (
    currPlayer?.originalRole === wakeUpRole && wakeUpRole !== ROLE_DRUNK
  );

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
        <h1 className='my-3'>
          <span>
            {isAwake ? '😳' : '😴'}
          </span>
        </h1>
        {
          currPlayer &&
            <>
              <h4>
                Your
                {currPlayer.lastKnownRole !== currPlayer.originalRole ? ' last known ' : ' starting '}
                role
              </h4>
              <RoleCard role={currPlayer.lastKnownRole} />
            </>
        }
        <div className='mb-3'><em><small>Roles may change throughout the night...</small></em></div>
        <div><Button variant='link' onClick={onShowRolesModal}>Show role guide</Button></div>
        <h4>Players</h4>
        {
          Object.values(players).map(player => <PlayerCheckboxLabel player={player}/>)
        }
      </Col>
    </Row>
  );
}

export default GameplayView;
