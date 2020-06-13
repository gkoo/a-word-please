import React from 'react';
import { useSelector } from 'react-redux';

import PlayerCheckboxLabel from '../common/PlayerCheckboxLabel';
import { currPlayerSelector, playersSelector } from '../../store/selectors';
import { LABELS, ROLE_MASON } from '../../constants';

function MasonView() {
  const currPlayer = useSelector(currPlayerSelector);
  const players = useSelector(playersSelector);
  const otherMason = Object.values(players).find(
    player => player.id !== currPlayer.id && player.originalRole === ROLE_MASON
  );

  return (
    <>
      {
        !!otherMason &&
          <p>Your fellow mason is <PlayerCheckboxLabel player={otherMason}/></p>
      }
      {
        !otherMason &&
          <p>It seems there isn't another {LABELS[ROLE_MASON]}...</p>
      }
    </>
  );
}

export default MasonView;
