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
  const bandWidth = 10;
  const socket = useSelector(socketSelector);
  const spectrumGuess = useSelector(spectrumGuessSelector);
  const spectrumValue = useSelector(spectrumValueSelector);
  const clue = useSelector(clueSelector);

  const nextTurn = e => {
    e.preventDefault();
    socket.emit('playerAction', { action: 'nextTurn' });
  };

  const inFirstBand = (
    spectrumGuess >= spectrumValue - bandWidth*5/2 &&
      spectrumGuess < spectrumValue - bandWidth*3/2
  );
  const inSecondBand = (
    spectrumGuess >= spectrumValue - bandWidth*3/2 &&
    spectrumGuess < spectrumValue - bandWidth/2
  );
  const inThirdBand = (
    spectrumGuess >= spectrumValue - bandWidth/2 &&
    spectrumGuess < spectrumValue + bandWidth/2
  );
  const inFourthBand = (
    spectrumGuess >= spectrumValue + bandWidth/2 &&
      spectrumGuess < spectrumValue + bandWidth*3/2
  );
  const inFifthBand = (
    spectrumGuess >= spectrumValue + bandWidth*3/2 &&
      spectrumGuess < spectrumValue + bandWidth*5/2
  );
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
