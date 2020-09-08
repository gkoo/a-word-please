import React from 'react';
import { useSelector } from 'react-redux';

import PlayerCheckboxLabel from '../common/PlayerCheckboxLabel';
import {
  connectedSpectatorsSelector,
} from '../../store/selectors';

function SpectatorList({ user }) {
  const connectedSpectatorUsers = useSelector(connectedSpectatorsSelector);

  if (connectedSpectatorUsers.length === 0) {
    return false;
  }

  return (
    <>
      <h3 className='mt-5'><u>Spectators</u></h3>
      {
        Object.values(connectedSpectatorUsers).filter(user => user.connected).map(spectatorUser =>
          <>
            <PlayerCheckboxLabel
              player={spectatorUser}
            />
            <br />
          </>
        )
      }
    </>
  );
}

export default SpectatorList;
