import React, { useState } from 'react';
import { useSelector } from 'react-redux';

import Button from 'react-bootstrap/Button';

import { currPlayerSelector, gameDataSelector, socketSelector } from '../../store/selectors';

function RulesView() {
  const [playWithAccomplice, setPlayWithAccomplice] = useState(false);
  const [playWithWitness, setPlayWithWitness] = useState(false);
  const currPlayer = useSelector(currPlayerSelector);
  const gameData = useSelector(gameDataSelector);
  const socket = useSelector(socketSelector);

  const { playersReady } = gameData;

  const onReady = () => {
    socket.emit('playerAction', { action: 'ready' });
  };

  return (
    <div className='text-center'>
      <h1>Welcome to Deception: Murder in Hong Kong</h1>
      <p>One person will be forensic scientist.</p>
      <p>One person will be murderer.</p>
      <p>Everyone else investigators.</p>

      {/* Uncomment when ready
      <div className='text-center my-3'>
        <Button
          active={playWithAccomplice}
          variant='outline-info'
          className='mx-3'
          onClick={() => setPlayWithAccomplice(!playWithAccomplice)}
        >
          Play with Accomplice
        </Button>
        <Button
          active={playWithWitness}
          variant='outline-info'
          onClick={() => setPlayWithWitness(!playWithWitness)}
        >
          Play with Witness
        </Button>
      </div>
      */}

      {
        !playersReady[currPlayer.id] &&
          <Button onClick={onReady}>
            Ready?
          </Button>
      }
      {
        playersReady[currPlayer.id] &&
          <Button disabled>
            Waiting for others...
          </Button>
      }
    </div>
  );
}

export default RulesView;
