import React from 'react';
import { useSelector } from 'react-redux';

import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';

import EndGameButtons from '../common/EndGameButtons';
import { numPointsSelector, socketSelector } from '../../store/selectors';

function GameEndPhase() {
  const numPoints = useSelector(numPointsSelector);
  const socket = useSelector(socketSelector);

  const newGame = e => {
    e.preventDefault();
    socket.emit('playerAction', { action: 'newGame' });
  };

  return (
    <div className='text-center'>
      <h1>Game over!</h1>
      <p>You got {numPoints} points. You are amazing!</p>
      <EndGameButtons/>
    </div>
  );
}

export default GameEndPhase;
