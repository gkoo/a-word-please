import React from 'react';
import { useSelector } from 'react-redux';

import Button from 'react-bootstrap/Button';

import PlayerCheckboxLabel from '../common/PlayerCheckboxLabel';
import { currPlayerSelector, playersSelector, socketSelector } from '../../store/selectors';
import { LABELS, ROLE_MINION, ROLE_WEREWOLF } from '../../constants';

function MinionView() {
  const currPlayer = useSelector(currPlayerSelector);
  const players = useSelector(playersSelector);
  const socket = useSelector(socketSelector);
  const werewolves = Object.values(players).filter(
    player => player.id !== currPlayer.id && player.originalRole === ROLE_WEREWOLF
  );

  const endTurn = () => {
    socket.emit('playerAction', { action: 'endTurn' });
  };

  return (
    <>
      <p>
        {LABELS[ROLE_MINION]}: Draw suspicion away from the werewolves. If the werewolves win, you win.
      </p>
      {
        werewolves.length > 0 &&
          <>
            <p>
              The {werewolves.length > 1 ? 'werewolves are' : 'werewolf is'}
              {werewolves.map(player => <PlayerCheckboxLabel player={player}/>)}
            </p>
            <p>
              They don't know that you are the {LABELS[ROLE_MINION]}.
            </p>
          </>
      }
      {
        werewolves.length === 0 &&
          <p>It seems there aren't any werewolves...</p>
      }
      <div className='text-center'>
        <Button onClick={endTurn}>OK</Button>
      </div>
    </>
  );
}

export default MinionView;
