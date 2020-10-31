import React from 'react';
import { useSelector } from 'react-redux';

import Button from 'react-bootstrap/Button';

import GuesserSpectrums from './GuesserSpectrums';
import PointsTable from './PointsTable';
import {
  currUserIsSpectatorSelector,
  clueSelector,
  gameDataSelector,
  socketSelector,
} from '../../store/selectors';
import { SPECTRUM_BAND_WIDTH } from '../../constants';

function RevealPhase() {
  const socket = useSelector(socketSelector);
  const gameData = useSelector(gameDataSelector);
  const isSpectator = useSelector(currUserIsSpectatorSelector);
  const clue = useSelector(clueSelector);

  if (!gameData) { return false; }

  const { activePlayerId, spectrumGuess, spectrumValue, players } = gameData;

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

        <PointsTable highlightPlayerId={activePlayerId}/>
        {!isSpectator && <Button onClick={nextTurn}>Next Turn</Button>}
      </div>
    </>
  );
}

export default RevealPhase;
