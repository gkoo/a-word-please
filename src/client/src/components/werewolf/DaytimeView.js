import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import cx from 'classnames';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import ToggleButton from 'react-bootstrap/ToggleButton';
import ToggleButtonGroup from 'react-bootstrap/ToggleButtonGroup'

import PlayerLabel from './PlayerLabel';
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
    <div className='px-5'>
      <div className='mb-5'>
        <h1>🌞</h1>
        <h1>Good morning!</h1>
        <p>
          Hopefully you rested well, because the village needs to vote on who to eliminate.
        </p>
      </div>
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
                    <span className={cx('mr-1', { invisible: !votes[player.id] })}>✅</span>
                    <PlayerLabel player={player} />
                  </div>
                )
              }
            </Col>
          </Row>
      }
      <Row className='my-5'>
        <Col md={{ span: 8, offset: 2 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
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
