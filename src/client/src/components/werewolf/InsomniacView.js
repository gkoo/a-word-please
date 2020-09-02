import React from 'react';
import { useSelector } from 'react-redux';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';

import RoleCard from './RoleCard';
import { currPlayerSelector, socketSelector, wakeUpRoleSelector } from '../../store/selectors';
import { WEREWOLF_ROLE_LABELS, ROLE_INSOMNIAC } from '../../constants';

function InsomniacView() {
  const currPlayer = useSelector(currPlayerSelector);
  const socket = useSelector(socketSelector);
  const wakeUpRole = useSelector(wakeUpRoleSelector);
  const isAwake = currPlayer.originalRole === wakeUpRole;

  const endTurn = () => {
    socket.emit('playerAction', { action: 'endTurn' });
  };

  if (isAwake) {
    return (
      <>
        <h1>Wake up.</h1>
        <Row className='my-3'>
          <Col>
            <p>Your role:</p>
            <RoleCard role={currPlayer.role}/>
            <p>Was it what you expected?</p>
          </Col>
        </Row>
        <Row>
          <Col>
            <Button onClick={endTurn}>Lie awake until sunrise</Button>
          </Col>
        </Row>
      </>
    );
  }

  // passive view
  return (
    <p>{WEREWOLF_ROLE_LABELS[ROLE_INSOMNIAC]}: You will wake up at the end of the night to look at your role.</p>
  );
}

export default InsomniacView;
