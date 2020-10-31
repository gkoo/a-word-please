import React from 'react';
import { useSelector } from 'react-redux';

import Button from 'react-bootstrap/Button';

import GuesserSpectrums from './GuesserSpectrums';
import {
  currUserIsSpectatorSelector,
  clueSelector,
  gameDataSelector,
  socketSelector,
} from '../../store/selectors';

function RevealPhase() {
  const socket = useSelector(socketSelector);
  const gameData = useSelector(gameDataSelector);
  const isSpectator = useSelector(currUserIsSpectatorSelector);
  const clue = useSelector(clueSelector);

  if (!gameData) { return false; }

  const { activePlayerId } = gameData;

  const nextTurn = e => {
    e.preventDefault();
    socket.emit('playerAction', { action: 'nextTurn' });
  };

  return (
    <>
      <div className='text-center'>
        <div className='mb-5'>
          <h2 className='spectrum-clue'>"{clue}"</h2>
        </div>

        <div className='my-5'>
          <GuesserSpectrums/>
        </div>

        {!isSpectator && <Button onClick={nextTurn}>Next Turn</Button>}
      </div>
    </>
  );
}

export default RevealPhase;
