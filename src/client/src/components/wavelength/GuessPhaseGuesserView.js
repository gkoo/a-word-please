import React from 'react';
import { useSelector } from 'react-redux';

import Button from 'react-bootstrap/Button';

import Spectrum from './Spectrum';
import * as selectors from '../../store/selectors';

function GuessPhaseGuesserView() {
  const socket = useSelector(selectors.socketSelector);

  const onSubmitGuess = e => {
    e.preventDefault();
    socket.emit('playerAction', { action: 'submitGuess' });
  };

  return (
    <>
      <Spectrum/>
      <p className='mt-5'>Adjust the slider to where you think this clue falls on the spectrum.</p>
      <div className='text-center'>
        <Button type='submit' onClick={onSubmitGuess}>Enter guess</Button>
      </div>
    </>
  );
}

export default GuessPhaseGuesserView;
