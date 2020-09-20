import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import Toast from 'react-bootstrap/Toast';

import {
  gameDataSelector,
} from '../../store/selectors';

function Timer() {
  const [isShowing, setIsShowing] = useState(false);
  const [autohide, setAutohide] = useState(false);
  const gameData = useSelector(gameDataSelector);

  const { presentationSecondsLeft } = gameData;

  useEffect(() => {
    setIsShowing(presentationSecondsLeft !== undefined);
    setAutohide(!presentationSecondsLeft);
  }, [presentationSecondsLeft]);

  return (
    <div className='timer-container'>
      <Toast show={isShowing} autohide={autohide} delay={3000} onClose={() => setIsShowing(false)}>
        <Toast.Header closeButton={false}>
          <strong className="mr-auto">Current Presentation Time Left</strong>
        </Toast.Header>
        <Toast.Body>
          <h1 className='text-center'>{presentationSecondsLeft || 'Time\'s up!'}</h1>
        </Toast.Body>
      </Toast>
    </div>
  );
}

export default Timer;
