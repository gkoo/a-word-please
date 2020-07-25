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
import { SPECTRUM_BAND_WIDTH } from '../../constants';

function RevealPhase() {
  const socket = useSelector(socketSelector);
  const spectrumGuess = useSelector(spectrumGuessSelector);
  const spectrumValue = useSelector(spectrumValueSelector);
  const clue = useSelector(clueSelector);

  const nextTurn = e => {
    e.preventDefault();
    socket.emit('playerAction', { action: 'nextTurn' });
  };

  const band1LeftBound = spectrumValue - SPECTRUM_BAND_WIDTH * 5/2;
  const band2LeftBound = spectrumValue - SPECTRUM_BAND_WIDTH * 3/2;
  const band3LeftBound = spectrumValue - SPECTRUM_BAND_WIDTH/2;
  const band4LeftBound = spectrumValue + SPECTRUM_BAND_WIDTH/2;
  const band5LeftBound = spectrumValue + SPECTRUM_BAND_WIDTH * 3/2;
  const band5RightBound = spectrumValue + SPECTRUM_BAND_WIDTH * 5/2;

  const inFirstBand = spectrumGuess >= band1LeftBound && spectrumGuess < band2LeftBound;
  const inSecondBand = spectrumGuess >= band2LeftBound && spectrumGuess < band3LeftBound;
  const inThirdBand = spectrumGuess >= band3LeftBound && spectrumGuess < band4LeftBound;
  const inFourthBand = spectrumGuess >= band4LeftBound && spectrumGuess < band5LeftBound;
  const inFifthBand = spectrumGuess >= band5LeftBound && spectrumGuess < band5RightBound;

  const gotPoints = inFirstBand || inSecondBand || inThirdBand || inFourthBand || inFifthBand;
  const bandSelections = {
    firstBand: inFirstBand,
    secondBand: inSecondBand,
    thirdBand: inThirdBand,
    fourthBand: inFourthBand,
    fifthBand: inFifthBand,
  };

  const renderPointsMessage = () => {
    if (inFirstBand || inFifthBand) {
      return '+2 points';
    }
    if (inSecondBand || inFourthBand) {
      return '+3 points';
    }
    if (inThirdBand) {
      return '+4 points';
    }
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
            showBands={true}
            bandSelections={bandSelections}
          />
          {/* TODO: show how many points won */}
        </div>
        <h3 className='my-5'>
          {
            (inFirstBand || inFifthBand) &&
              '+2 points'
          }
          {
            (inSecondBand || inFourthBand) &&
              '+3 points'
          }
          {
            inThirdBand &&
              '+4 points'
          }
        </h3>
        <Button onClick={nextTurn}>Next Turn</Button>
      </div>
    </>
  );
}

export default RevealPhase;
