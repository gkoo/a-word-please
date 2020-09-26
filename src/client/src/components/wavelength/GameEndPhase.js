import React from 'react';
import { useSelector } from 'react-redux';

import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';

import EndGameButtons from '../common/EndGameButtons';
import PointsTable from './PointsTable';
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
      <h1 className='mb-5'>Game over!</h1>
      <PointsTable/>
      <EndGameButtons/>
    </div>
  );
}

export default GameEndPhase;
