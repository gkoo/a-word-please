import React from 'react';
import { useSelector } from 'react-redux';

import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';

import {
  gameDataSelector,
  socketSelector,
} from '../../store/selectors';

function ScientistInstructions() {
  const gameData = useSelector(gameDataSelector);
  const socket = useSelector(socketSelector);

  const onStartTimer = () => socket.emit('playerAction', { action: 'startTimer' });
  const onEndTimer = () => socket.emit('playerAction', { action: 'endTimer' });
  const onEndRound = () => socket.emit('playerAction', { action: 'endRound' });

  const {
    presentationSecondsLeft,
    roundNum,
    totalNumRounds,
  } = gameData;

  const isLastRound = roundNum >= totalNumRounds;

  return (
    <Alert variant='info' className='mb-5'>
      <Alert.Heading>
        Forensic Scientist Instructions
      </Alert.Heading>
      {
        !isLastRound &&
          <p>
            This is the { roundNum === 1 ? '1st' : '2nd' } of {totalNumRounds} rounds. Each
            player gets 30 seconds to make their case. Please time them and start the next
            round once everyone is done.
          </p>
      }
      {
        isLastRound &&
          <p>
            This is the last round. When everyone is done making an accusation, please end the
            game.
          </p>
      }
      <div className='text-center'>
        {
          !presentationSecondsLeft &&
            <Button onClick={onStartTimer} className='mx-1'>
              Start Timer
            </Button>
        }
        {
          presentationSecondsLeft &&
            <Button onClick={onEndTimer} className='mx-1'>
              End Timer
            </Button>
        }
        <Button onClick={onEndRound} className='mx-1'>
          { roundNum < totalNumRounds ? 'Start Next Round' : 'End Game' }
        </Button>
      </div>
    </Alert>
  );
}

export default ScientistInstructions;
