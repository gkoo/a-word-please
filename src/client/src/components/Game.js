import React from 'react';

import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';

import Board from './Board';

function Game({ socket, messages }) {
  return (
    <>
      <Row>
        <Col>
          <Board />
        </Col>
      </Row>
    </>
  );
}

export default Game;
