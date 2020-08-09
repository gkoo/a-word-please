import React from 'react';
import { useSelector } from 'react-redux';

import Button from 'react-bootstrap/Button';

import { socketSelector, } from '../../store/selectors';

function BackToLobbyButton() {
  const socket = useSelector(socketSelector);
  const backToLobby = e => {
    e.preventDefault();
    const confirmed = window.confirm('The game will end for everyone and you will be sent back to the lobby. Are you sure?');
    if (confirmed) {
      socket.emit('playerAction', { action: 'backToLobby' });
    }
  };

  return (
    <Button onClick={backToLobby}>Back To Lobby</Button>
  );
}

export default BackToLobbyButton;
