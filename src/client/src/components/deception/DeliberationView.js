import React from 'react';
import { useSelector } from 'react-redux';

import Button from 'react-bootstrap/Button';

import PlayerGroupView from './PlayerGroupView';
import TilesView from './TilesView';
import {
  currPlayerIsScientistSelector,
  gameDataSelector,
  playersSelector,
  socketSelector,
} from '../../store/selectors';

function DeliberationView() {
  const players = useSelector(playersSelector);
  const socket = useSelector(socketSelector);
  const currPlayerIsScientist = useSelector(currPlayerIsScientistSelector);

  const onStartNextRound = () => socket.emit('handlePlayerAction', { action: 'nextRound' });

  return (
    <>
      <h1>Welcome to the Deliberation View!</h1>
      <div className='text-center my-2'>
        {
          currPlayerIsScientist &&
            <>
              <p>Forensic Scientist: When everyone is done making their case, start the next round.</p>
              <Button onClick={onStartNextRound}>
                Start Next Round
              </Button>
            </>
        }
      </div>
      <PlayerGroupView />
      <TilesView />
    </>
  );
}

export default DeliberationView;
