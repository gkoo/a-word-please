import React, { useState } from 'react';
import { useSelector } from 'react-redux';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import ToggleButton from 'react-bootstrap/ToggleButton';
import ToggleButtonGroup from 'react-bootstrap/ToggleButtonGroup'

import { currPlayerSelector, playersSelector, socketSelector } from '../../store/selectors';

function TroublemakerView() {
  const [targets, setTargets] = useState([]);
  const currPlayer = useSelector(currPlayerSelector);
  const players = useSelector(playersSelector);
  const socket = useSelector(socketSelector);
  const otherPlayers = Object.values(players).filter(player => player.id !== currPlayer.id);

  const switchRoles = () => socket.emit('playerAction', {
    action: 'troublemakeRoles',
    playerIds: targets,
  });

  const onChange = value => {
    if (value.length > 2) {
      alert('You can only choose two switch two players. Please deselect a player first.');
      return;
    }
    setTargets(value);
  };

  const renderPlayerButton = player => {
    return (
      <ToggleButton key={player.id} value={player.id} name='troublemakerTargets'>
        {player.name}
      </ToggleButton>
    );
  };

  return (
    <>
      <h1>Wake up.</h1>
      <p>
        Choose two other players and switch their roles. Devious!
      </p>
      <Row>
        <Col>
          <ToggleButtonGroup
            name='troublemakerTargets'
            type='checkbox'
            onChange={onChange}
            value={targets}
          >
            {otherPlayers.map(renderPlayerButton)}
          </ToggleButtonGroup>
        </Col>
      </Row>
      <Row className='my-3'>
        <Col>
          {
            targets.length === 2 &&
              <Button onClick={switchRoles}>
                Switch {players[targets[0]].name} and {players[targets[1]].name}'s roles
              </Button>
          }
        </Col>
      </Row>
    </>
  );
}

export default TroublemakerView;
