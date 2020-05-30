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
  STATE_PENDING,
  STATE_ENTERING_CLUES,
  STATE_REVIEWING_CLUES,
  STATE_ENTERING_GUESS,
  STATE_TURN_END,
  STATE_GAME_END,
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
    const buttonLabel = gameState === STATE_PENDING ? 'Start game' : 'New game';

    if (wrongNumPlayers) {
      return <Button onClick={startGame} disabled>{buttonLabel}</Button>;
    }
    return <Button onClick={startGame}>{buttonLabel}</Button>;
  };

  return (
    <div>
      <ButtonGroup>
        {[STATE_PENDING, STATE_GAME_END].includes(gameState) && renderStartGameButton()}
        {
          gameState === STATE_TURN_END &&
            <Button onClick={nextTurn}>Next Turn</Button>
        }
        {
          [
            STATE_ENTERING_CLUES,
            STATE_REVIEWING_CLUES,
            STATE_ENTERING_GUESS,
            STATE_TURN_END,
          ].includes(gameState) &&
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
