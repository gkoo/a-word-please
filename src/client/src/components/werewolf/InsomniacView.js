import React from 'react';
import { useSelector } from 'react-redux';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';

import { currPlayerSelector, socketSelector } from '../../store/selectors';
import { LABELS } from '../../constants';

function InsomniacView() {
  const currPlayer = useSelector(currPlayerSelector);
  const socket = useSelector(socketSelector);

  const endTurn = () => {
    socket.emit('playerAction', { action: 'endTurn' });
  };

  return (
    <>
      <h1>Wake up.</h1>
      <Row className='my-3'>
        <Col>
          Your role is: <u>{LABELS[currPlayer.role]}</u>. Was it what you expected?
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

export default InsomniacView;
