import React from 'react';
import { useSelector } from 'react-redux';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';

import { socketSelector } from '../../store/selectors';

function DrunkView() {
  const socket = useSelector(socketSelector);

  const swapRoleWithUnclaimed = () => {
    socket.emit('playerAction', { action: 'swapRoleWithUnclaimed' });
  };

  return (
    <>
      <h1>Wake up.</h1>
      <Row className='my-3'>
        <Col>
          Your role will be switched with an unclaimed role. You may now go back to sleep.
        </Col>
      </Row>
      <Row>
        <Col>
          <Button onClick={swapRoleWithUnclaimed}>Go back to sleep</Button>
        </Col>
      </Row>
    </>
  );
}

export default DrunkView;
