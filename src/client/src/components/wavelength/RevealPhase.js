import React from 'react';
import { useSelector } from 'react-redux';

import Button from 'react-bootstrap/Button';

import Spectrum from './Spectrum';
import {
  clueSelector,
  socketSelector,
  spectrumGuessSelector,
  spectrumValueSelector,
} from '../../store/selectors';

function RevealPhase() {
  const socket = useSelector(socketSelector);
  const spectrumGuess = useSelector(spectrumGuessSelector);
  const spectrumValue = useSelector(spectrumValueSelector);
  const clue = useSelector(clueSelector);

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
          <Spectrum
            disabled={true}
            guessValue={spectrumGuess}
            value={spectrumValue}
            showBands={true}
          />
        </div>
        <Button onClick={nextTurn}>Next Turn</Button>
      </div>
    </>
  );
}

export default RevealPhase;
