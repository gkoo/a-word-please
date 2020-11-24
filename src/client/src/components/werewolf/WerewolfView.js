import React, { useState } from 'react';
import { useSelector } from 'react-redux';

import Button from 'react-bootstrap/Button';

import PlayerCheckboxLabel from '../common/PlayerCheckboxLabel';
import { currPlayerSelector, playersSelector, socketSelector } from '../../store/selectors';
import { WEREWOLF_ROLE_LABELS, ROLE_WEREWOLF } from '../../constants/werewolf';

function WerewolfView() {
  const [ready, setReady] = useState(false);
  const currPlayer = useSelector(currPlayerSelector);
  const players = useSelector(playersSelector);
  const socket = useSelector(socketSelector);
  const otherWerewolves = Object.values(players).filter(
    player => player.id !== currPlayer?.id && player.originalRole === ROLE_WEREWOLF
  );

  const endTurn = () => {
    socket.emit('playerAction', { action: 'endTurn' });
    setReady(true);
  };

  return (
    <>
      <p>
        {WEREWOLF_ROLE_LABELS[ROLE_WEREWOLF]}: Avoid persecution from the villagers!
      </p>
      {
        otherWerewolves.length > 0 &&
          <p>
            Your fellow {otherWerewolves.length > 1 ? 'werewolves are' : 'werewolf is'}:{' '}
            {otherWerewolves.map(player => <PlayerCheckboxLabel player={player}/>)}
          </p>
      }
      {
        otherWerewolves.length === 0 &&
          <p>It seems there aren't any other werewolves...</p>
      }
      {
        !ready &&
          <div className='text-center'>
            <Button onClick={endTurn}>OK</Button>
          </div>
      }
      {
        ready &&
          <em>Waiting for other werewolves to end turn...</em>
      }
    </>
  );
}

export default WerewolfView;
