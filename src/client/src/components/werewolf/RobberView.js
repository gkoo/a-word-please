import React, { useState } from 'react';
import { useSelector } from 'react-redux';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';

import PlayerCheckboxLabel from '../common/PlayerCheckboxLabel';
import RoleCard from './RoleCard';
import { currPlayerSelector, playersSelector, socketSelector } from '../../store/selectors';

function RobberView({ showWakeUp }) {
  const [playerToRobId, setPlayerToRobId] = useState(null);
  const players = useSelector(playersSelector);
  const currPlayer = useSelector(currPlayerSelector);
  const socket = useSelector(socketSelector);
  const otherPlayers = Object.values(players).filter(player => player.id !== currPlayer.id);
  const playerToRob = playerToRobId ? players[playerToRobId] : null;

  const robRole = () => {
    socket.emit('playerAction', {
      action: 'robRole',
      playerId: playerToRobId,
    });
  };

  const renderPlayerButton = player => {
    return (
      <Button key={player.id} onClick={() => setPlayerToRobId(player.id)}>{player.name}</Button>
    );
  };

  return (
    <>
      {showWakeUp && <h1>Wake up.</h1>}
      <p>
        Choose another player. You will switch roles with that player and then look at your
        new role.
      </p>
      {
        !playerToRob &&
          <ButtonGroup className='mr-2'>
            {otherPlayers.map(renderPlayerButton)}
          </ButtonGroup>
      }
      {
        playerToRob &&
          <>
            <Row className='my-3'>
              <Col>
                <p>Your new role:</p>
                <RoleCard role={playerToRob.role}/>
                <p><PlayerCheckboxLabel player={playerToRob} /> is now the Robber.</p>
              </Col>
            </Row>
            <Row className='my-3'>
              <Col>
                <Button onClick={robRole}>Go back to sleep</Button>
              </Col>
            </Row>
          </>
      }
    </>
  );
}

export default RobberView;
