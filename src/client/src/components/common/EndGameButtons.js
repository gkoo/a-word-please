import React from 'react';
import { useSelector } from 'react-redux';

import Button from 'react-bootstrap/Button';

import { socketSelector, } from '../../store/selectors';

function EndGameButtons() {
  const socket = useSelector(socketSelector);

  const newGame = () => socket.emit('startGame');

  const backToLobby = e => {
    e.preventDefault();
    const confirmed = window.confirm('The game will end for everyone and you will be sent back to the lobby. Are you sure?');
    if (confirmed) {
      socket.emit('playerAction', { action: 'backToLobby' });
    }
  };

  return (
    <div className='text-center my-5'>
      <Button onClick={newGame} className='mr-1'>New Game</Button>
      <Button onClick={backToLobby} className='ml-1'>Back To Lobby</Button>
    </div>
  );
}

export default EndGameButtons;
