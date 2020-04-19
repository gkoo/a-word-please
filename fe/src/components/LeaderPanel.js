import React from 'react';
import { useSelector } from 'react-redux';

import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';

import { currPlayerSelector, socketSelector } from '../store/selectors';
import {
  STATE_GAME_END,
  STATE_PENDING,
  STATE_ROUND_END,
  STATE_STARTED,
} from '../constants';
import { gameStateSelector } from '../store/selectors';

function LeaderPanel() {
  const currPlayer = useSelector(currPlayerSelector);
  const gameState = useSelector(gameStateSelector);
  const socket = useSelector(socketSelector);

  if (!currPlayer || !currPlayer.isLeader) {
    return <div/>;
  }

  const startGame = e => {
    e.preventDefault();
    socket.emit('startGame');
  };

  const nextRound = e => {
    e.preventDefault();
    socket.emit('nextRound');
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
        {
          [STATE_PENDING, STATE_GAME_END].includes(gameState) &&
            <Button onClick={startGame}>Start game</Button>
        }
        {
          gameState === STATE_ROUND_END &&
            <Button onClick={nextRound}>Next round</Button>
        }
        {
          [STATE_STARTED, STATE_ROUND_END].includes(gameState) &&
            <Button onClick={endGame}>End game</Button>
        }
        <Button onClick={debug}>Debug</Button>
      </ButtonGroup>
    </div>
  );
};

export default LeaderPanel;
