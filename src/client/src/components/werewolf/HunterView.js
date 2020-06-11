import React from 'react';
import { useSelector } from 'react-redux';

import { currPlayerSelector, playersSelector } from '../../store/selectors';
import { LABELS, ROLE_HUNTER, ROLE_WEREWOLF } from '../../constants';

function HunterView() {
  const currPlayer = useSelector(currPlayerSelector);
  const players = useSelector(playersSelector);
  const werewolves = Object.values(players).filter(
    player => player.id !== currPlayer.id && player.originalRole === ROLE_WEREWOLF
  );

  return (
    <p>If you die, the person you vote to kill also dies.</p>
  );
}

export default HunterView;
