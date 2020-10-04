import React from 'react';
import { useSelector } from 'react-redux';

import Button from 'react-bootstrap/Button';

import {
  currPlayerSelector,
  currUserIsSpectatorSelector,
  gameDataSelector,
  socketSelector,
} from '../../store/selectors';

function ReadyButton() {
  const currPlayer = useSelector(currPlayerSelector);
  const currUserIsSpectator = useSelector(currUserIsSpectatorSelector);
  const gameData = useSelector(gameDataSelector);
  const socket = useSelector(socketSelector);

  const onReady = () => socket.emit('playerAction', { action: 'ready' });
  const currPlayerIsReady = gameData.playersReady[currPlayer?.id];

  return (
    <div className='text-center mt-5'>
      {
        !currUserIsSpectator &&
          <Button onClick={onReady} disabled={currPlayerIsReady}>
            { currPlayerIsReady ? 'Waiting for others...' : 'Ready?' }
          </Button>
      }
    </div>
  );
}

export default ReadyButton;
