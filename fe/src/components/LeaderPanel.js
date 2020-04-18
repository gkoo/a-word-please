import React from 'react';
import { useSelector } from 'react-redux';

import Button from 'react-bootstrap/Button';

import * as selectors from '../store/selectors';

function LeaderPanel() {
  const currPlayer = useSelector(selectors.currPlayer);
  const socket = useSelector(selectors.socket);

  if (!currPlayer || !currPlayer.isLeader) {
    return <div/>;
  }

  const startGame = e => {
    e.preventDefault();
    socket.emit('startGame');
  };

  return (
    <div>
      <Button onClick={startGame}>Start game</Button>
    </div>
  );
};

export default LeaderPanel;
