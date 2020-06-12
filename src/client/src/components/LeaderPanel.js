import React from 'react';
import { useSelector } from 'react-redux';

import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';

import {
  currUserSelector,
  debugEnabledSelector,
  socketSelector,
} from '../store/selectors';
import {
  GAME_STATE_PENDING,
  GAME_STATE_TURN_END,
  GAME_STATE_GAME_END,
} from '../constants';
import { gameStateSelector } from '../store/selectors';

function LeaderPanel({ numUsers }) {
  const currUser = useSelector(currUserSelector);
  const debugEnabled = useSelector(debugEnabledSelector);
  const gameState = useSelector(gameStateSelector);
  const socket = useSelector(socketSelector);

  if (!currUser) {
    return <div/>;
  }

  const startGame = e => {
    e.preventDefault();
    socket.emit('startGame');
  };

  const nextTurn = e => {
    e.preventDefault();
    socket.emit('nextTurn');
  };

  const endGame = e => {
    e.preventDefault();

    if (window.confirm('This will end the game. Are you sure?')) {
      socket.emit('endGame');
    }
  };

  const debug = e => {
    e.preventDefault();
    socket.emit('debug');
  };

  const wrongNumPlayers = numUsers < 2;

  const renderStartGameButton = () => {
    const buttonLabel = gameState === GAME_STATE_PENDING ? 'Start game' : 'New game';

    return <Button onClick={startGame} disabled={wrongNumPlayers}>{buttonLabel}</Button>;
  };

  return (
    <div>
      <ButtonGroup>
        {[GAME_STATE_PENDING, GAME_STATE_GAME_END].includes(gameState) && renderStartGameButton()}
        {
          gameState === GAME_STATE_TURN_END &&
            <Button onClick={nextTurn}>Next Turn</Button>
        }
        {
          (gameState !== GAME_STATE_PENDING && gameState !== GAME_STATE_GAME_END) &&
            <Button onClick={endGame}>End game</Button>
        }
        {
          debugEnabled &&
            <Button onClick={debug}>Debug</Button>
        }
      </ButtonGroup>
    </div>
  );
};

export default LeaderPanel;
