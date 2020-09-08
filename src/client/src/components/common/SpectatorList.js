import React from 'react';

import PlayerCheckboxLabel from '../common/PlayerCheckboxLabel';

function SpectatorList({ user }) {
  const spectatorUsers = useSelector(spectatorUsersSelector);

  if (spectatorUsers.length === 0) {
    return false;
  }

  return (
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
  );
}

export default SpectatorList;
