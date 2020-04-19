import React from 'react';
import { useSelector } from 'react-redux';

import {
  activePlayerIdSelector,
  gameStateSelector,
  playersSelector,
} from '../store/selectors';
import PlayerView from './PlayerView';

function Board() {
  const activePlayerId = useSelector(activePlayerIdSelector);
  const gameState = useSelector(gameStateSelector);
  const players = useSelector(playersSelector);

  if (gameState !== 'STARTED') {
    return (
      <>
        <h1>Waiting for game to start...</h1>
      </>
    );
  }

  return (
    <>
      {
        gameState === 'STARTED' &&
          Object.values(players).map(player => {
            return (
              <PlayerView player={player} active={player.id === activePlayerId}/>
            )
          })
      }
    </>
  );
}

export default Board;
