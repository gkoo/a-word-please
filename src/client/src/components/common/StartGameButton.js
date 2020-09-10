import React from 'react';
import { useSelector } from 'react-redux';

import Button from 'react-bootstrap/Button';

import { socketSelector, } from '../../store/selectors';

function StartGameButton({ disabled }) {
  const socket = useSelector(socketSelector);
  const startGame = e => {
    e.preventDefault();
    socket.emit('startGame');
  };

  return (
    <Button onClick={startGame} disabled={disabled}>Start Game</Button>
  );
}

export default StartGameButton;
