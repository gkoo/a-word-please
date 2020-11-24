import React, { useState } from 'react';
import { useSelector } from 'react-redux';

import Button from 'react-bootstrap/Button';

import PlayerCheckboxLabel from '../common/PlayerCheckboxLabel';
import { currPlayerSelector, playersSelector, socketSelector } from '../../store/selectors';
import { WEREWOLF_ROLE_LABELS, ROLE_MASON } from '../../constants/werewolf';

function MasonView() {
  const [ready, setReady] = useState(false);
  const currPlayer = useSelector(currPlayerSelector);
  const players = useSelector(playersSelector);
  const socket = useSelector(socketSelector);
  const otherMason = Object.values(players).find(
    player => player.id !== currPlayer?.id && player.originalRole === ROLE_MASON
  );

  const endTurn = () => {
    socket.emit('playerAction', { action: 'endTurn' });
    setReady(true);
  };

  return (
    <>
      {
        !!otherMason &&
          <p>Your fellow mason is <PlayerCheckboxLabel player={otherMason}/></p>
      }
      {
        !otherMason &&
          <p>It seems there isn't another {WEREWOLF_ROLE_LABELS[ROLE_MASON]}...</p>
      }
      {
        !ready &&
          <div className='text-center'>
            <Button onClick={endTurn}>OK</Button>
          </div>
      }
      {
        ready && otherMason &&
          <em>Waiting for {otherMason.name} to end turn...</em>
      }
    </>
  );
}

export default MasonView;
