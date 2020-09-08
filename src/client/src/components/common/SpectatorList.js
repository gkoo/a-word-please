import React from 'react';
import { useSelector } from 'react-redux';

import PlayerCheckboxLabel from '../common/PlayerCheckboxLabel';
import { spectatorUsersSelector } from '../../store/selectors';

function SpectatorList({ user }) {
  const spectatorUsers = useSelector(spectatorUsersSelector);

  if (spectatorUsers.length === 0) {
    return false;
  }

  return (
    <>
      <h3 className='mt-5'><u>Spectators</u></h3>
      {
        spectatorUsers.filter(user => user.connected).map(spectatorUser =>
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
