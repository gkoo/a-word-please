import React from 'react';
import { useSelector } from 'react-redux';

import { currPlayerSelector, playersSelector } from '../../store/selectors';
import { LABELS, ROLE_MINION, ROLE_WEREWOLF } from '../../constants';

function MinionView() {
  const currPlayer = useSelector(currPlayerSelector);
  const players = useSelector(playersSelector);
  const werewolves = Object.values(players).filter(
    player => player.id !== currPlayer.id && player.originalRole === ROLE_WEREWOLF
  );

  return (
    <>
      <p>
        Your job is to draw suspicion away from the werewolves. If the werewolves win, you win.
      </p>
      {
        werewolves.length > 0 &&
          <p>
            The {werewolves.length > 1 ? 'werewolves are ' : 'werewolf is '}
            {werewolves.map(player => player.name).join(' and ')}. They don't know that you are
            the {LABELS[ROLE_MINION]}.
          </p>
      }
      {
        werewolves.length === 0 &&
          <p>It seems there aren't any werewolves...</p>
      }
    </>
  );
}

export default MinionView;
