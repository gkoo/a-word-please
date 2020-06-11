import React, { useState } from 'react';
import { useSelector } from 'react-redux';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import ToggleButton from 'react-bootstrap/ToggleButton';
import ToggleButtonGroup from 'react-bootstrap/ToggleButtonGroup'

import { LABELS, ROLE_DRUNK, STATE_WW_VOTING } from '../../constants';
import * as selectors from '../../store/selectors';

function DaytimeView() {
  const [playerToEliminate, setPlayerToEliminate] = useState(null);
  const [notes, setNotes] = useState('');
  const gameState = useSelector(selectors.gameStateSelector);
  const players = useSelector(selectors.playersSelector);
  const currPlayer = useSelector(selectors.currPlayerSelector);
  const socket = useSelector(selectors.socketSelector);
  const votes = useSelector(selectors.votesSelector);

  const otherPlayers = Object.values(players).filter(player => player.id !== currPlayer.id);

  const startVoting = () => socket.emit('playerAction', { action: 'startVoting' });

  const onEditVote = suspectId => {
    setPlayerToEliminate(suspectId);
    socket.emit(
      'playerAction',
      {
        action: 'voteToEliminate',
        suspectId: suspectId,
      },
    )
  };

  const renderPlayerButton = player => {
    return (
      <ToggleButton name='playerToEliminate' key={player.id} value={player.id}>
        {player.name}
      </ToggleButton>
    );
  };

  return(
    <div className='text-center'>
      <h1>Good morning!</h1>
      <h3>
        Your last known role:{' '}
        {
          currPlayer.lastKnownRole === ROLE_DRUNK &&
            <>
              <u>???</u>
              ({' ' + LABELS[currPlayer.lastKnownRole]})
            </>
        }
        {
          currPlayer.lastKnownRole !== ROLE_DRUNK &&
            <u>{LABELS[currPlayer.lastKnownRole]}</u>
        }
      </h3>
      <p>
        Hopefully you rested well, because the village needs to vote on who to eliminate. Start
        deliberating!
      </p>
      {
        gameState !== STATE_WW_VOTING &&
          <Button onClick={startVoting}>Start Voting</Button>
      }
      {
        gameState === STATE_WW_VOTING &&
          <Row>
            <Col xs={6} className='text-center'>
              <h3>Time to vote!</h3>
              <em><small>You can change your vote until all votes are in</small></em>
              <br />
              <ToggleButtonGroup
                onChange={onEditVote}
                vertical
                name='playerToEliminate'
                value={playerToEliminate}
              >
                {otherPlayers.map(renderPlayerButton)}
                {renderPlayerButton(currPlayer)}
              </ToggleButtonGroup>
            </Col>
            <Col xs={6} className='text-center'>
              <h3>Votes cast</h3>
              {
                Object.values(players).map(player =>
                  <div>
                    {!!votes[player.id] && '✅ '}
                    <span className='ml-1'>{player.name}</span>
                  </div>
                )
              }
            </Col>
          </Row>
      }
      <Row className='my-5'>
        <Col md={{ span: 6, offset: 3 }}>
        <Form.Group>
          <Form.Label>You may take notes in this area</Form.Label>
          <Form.Control
            as="textarea"
            rows="3"
            placeholder="Enter notes here"
            value={notes}
            onChange={e => setNotes(e.target.value)}
          />
        </Form.Group>
        </Col>
      </Row>
    </div>
  );
}

export default DaytimeView;
