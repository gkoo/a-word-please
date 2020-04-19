import React from 'react';

import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';

function PlayerList({ players }) {
  return (
    <Container>
      <Row>
        <Col lg={{ span: 4, offset: 4 }}>
          <h3>Players</h3>
          <ul>
            {
              Object.values(players).map(playerData => {
                return playerData.name && (
                  <li>{playerData.name} {playerData.isLeader && '(L)'}</li>
                )
              })
            }
          </ul>
        </Col>
      </Row>
    </Container>
  );
};

export default PlayerList;
