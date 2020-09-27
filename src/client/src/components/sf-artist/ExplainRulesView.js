import React from 'react';
import { useSelector } from 'react-redux';

import Button from 'react-bootstrap/Button';

import {
  currPlayerSelector,
  currUserIsSpectatorSelector,
  gameDataSelector,
  socketSelector,
} from '../../store/selectors';

function ExplainRules() {
  const currPlayer = useSelector(currPlayerSelector);
  const currUserIsSpectator = useSelector(currUserIsSpectatorSelector);
  const gameData = useSelector(gameDataSelector);
  const socket = useSelector(socketSelector);

  const { playersReady } = gameData;

  const onReady = () => socket.emit('playerAction', { action: 'ready' });

  return (
    <div className='text-center'>
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

export default ExplainRules;
