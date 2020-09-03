import React, { useState } from 'react';
import { useSelector } from 'react-redux';

import Button from 'react-bootstrap/Button';

import { ROLE_ACCOMPLICE, ROLE_WITNESS } from '../../constants';
import {
  currPlayerSelector,
  currUserIsSpectatorSelector,
  gameDataSelector,
  socketSelector,
} from '../../store/selectors';

function RulesView() {
  const currPlayer = useSelector(currPlayerSelector);
  const currUserIsSpectator = useSelector(currUserIsSpectatorSelector);
  const gameData = useSelector(gameDataSelector);
  const socket = useSelector(socketSelector);

  const { includeAccomplice, includeWitness, playersReady } = gameData;

  const onReady = () => {
    socket.emit('playerAction', { action: 'ready' });
  };

  const togglePlayWithWitness = () => {
    socket.emit('playerAction', {
      action: 'toggleRole',
      role: ROLE_WITNESS,
      shouldInclude: !includeWitness,
    });
  };

  const togglePlayWithAccomplice = () => {
    socket.emit('playerAction', {
      action: 'toggleRole',
      role: ROLE_ACCOMPLICE,
      shouldInclude: !includeAccomplice,
    });
  };

  return (
    <div className='text-center'>
      <h1>Welcome to Deception: Murder in Hong Kong</h1>
      <p>One person will be forensic scientist.</p>
      <p>One person will be murderer.</p>
      <p>Everyone else investigators.</p>

      <div className='text-center my-3'>
        <Button
          active={includeAccomplice}
          variant='outline-info'
          className='mx-3'
          onClick={() => togglePlayWithAccomplice()}
        >
          Play with Accomplice
        </Button>
        <Button
          active={includeWitness}
          variant='outline-info'
          onClick={() => togglePlayWithWitness()}
        >
          Play with Witness
        </Button>
      </div>

      {
        !currUserIsSpectator && !playersReady[currPlayer?.id] &&
          <Button onClick={onReady}>
            Ready?
          </Button>
      }
      {
        !currUserIsSpectator && playersReady[currPlayer?.id] &&
          <Button disabled>
            Waiting for others...
          </Button>
      }
    </div>
  );
}

export default RulesView;
