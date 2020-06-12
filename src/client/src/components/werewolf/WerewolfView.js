import React from 'react';
import { useSelector } from 'react-redux';

import PlayerLabel from './PlayerLabel';
import { currPlayerSelector, playersSelector } from '../../store/selectors';
import { LABELS, ROLE_WEREWOLF } from '../../constants';

function WerewolfView() {
  const currPlayer = useSelector(currPlayerSelector);
  const players = useSelector(playersSelector);
  const otherWerewolves = Object.values(players).filter(
    player => player.id !== currPlayer.id && player.originalRole === ROLE_WEREWOLF
  );

  return (
    <>
      {
        otherWerewolves.length > 0 &&
          <p>
            Your fellow {otherWerewolves.length > 1 ? 'werewolves are' : 'werewolf is'}:{' '}
            {otherWerewolves.map(player => <PlayerLabel player={player}/>)}
          </p>
      }
      {
        otherWerewolves.length === 0 &&
          <p>It seems there aren't any other werewolves...</p>
      }
    </>
  );
}

export default WerewolfView;
