import React from 'react';
import { useSelector } from 'react-redux';

import Spectrum from './Spectrum';
import { clueSelector, spectrumGuessSelector, spectrumValueSelector } from '../../store/selectors';

function RevealPhase() {
  const spectrumValue = useSelector(spectrumValueSelector);
  const spectrumGuess = useSelector(spectrumGuessSelector);
  const clue = useSelector(clueSelector);

  return (
    <>
      <div className='text-center mb-5'>
        <h2 className='spectrum-clue'>{clue}</h2>
      </div>
      <div className='my-5'>
        <Spectrum
          disabled={true}
          guessValue={spectrumGuess}
          value={spectrumValue}
          showBands={true}
        />
        {/* TODO next Turn button */}
      </div>
    </>
  );
}

export default RevealPhase;
