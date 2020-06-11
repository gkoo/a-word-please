import React from 'react';
import { useSelector } from 'react-redux';

import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button'

import VoteLabel from './VoteLabel';
import * as selectors from '../../store/selectors';
import { LABELS } from '../../constants';

function VoteResults() {
  const players = useSelector(selectors.playersSelector);
  const revealingRoles = useSelector(selectors.revealingRolesSelector);
  const socket = useSelector(selectors.socketSelector);
  const votes = useSelector(selectors.votesSelector);

  const revealRoles = () => socket.emit('playerAction', { action: 'revealRoles' });

  const newGame = () => socket.emit('startGame');

  return (
    <div className='text-center'>
      {
        revealingRoles && <Button onClick={newGame}>New Game</Button>
      }
      <h1>Here are the results of the vote!</h1>
      {
        !revealingRoles &&
          <>
            {
              Object.keys(votes).map(voterId => {
                const suspectId = votes[voterId];
                return <VoteLabel voter={players[voterId]} suspect={players[suspectId]}/>;
              })
            }
            <div className='my-3'>
              <Button onClick={revealRoles}>Reveal Roles</Button>
            </div>
          </>
      }
      {
        revealingRoles &&
          <>
            {
              Object.keys(votes).map(voterId => {
                const suspectId = votes[voterId];
                return (
                  <Row>
                    <Col xs={6}>
                      <VoteLabel voter={players[voterId]} suspect={players[suspectId]}/>
                    </Col>
                    <Col xs={6}>
                      {LABELS[players[voterId].role]}
                    </Col>
                  </Row>
                );
              })
            }
          </>
      }
    </div>
  );
}

export default VoteResults;
