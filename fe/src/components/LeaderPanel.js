import React from 'react';
import { useSelector } from 'react-redux';

import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';

import { currPlayerSelector, socketSelector } from '../store/selectors';

function LeaderPanel() {
  const currPlayer = useSelector(currPlayerSelector);
  const socket = useSelector(socketSelector);

  if (!currPlayer || !currPlayer.isLeader) {
    return <div/>;
  }

  const startGame = e => {
    e.preventDefault();
    socket.emit('startGame');
  };

  const endGame = e => {
    e.preventDefault();
    socket.emit('endGame');
  };

  const debug = e => {
    e.preventDefault();
    socket.emit('debug');
  };

  return (
    <div>
      <ButtonGroup aria-label="Basic example">
        <Button onClick={startGame}>Start game</Button>
        <Button onClick={endGame}>End game</Button>
        <Button onClick={debug}>Debug</Button>
      </ButtonGroup>
    </div>
  );
};

export default LeaderPanel;
