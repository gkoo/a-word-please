import React from 'react';

import { WEREWOLF_ROLE_LABELS, ROLE_VILLAGER } from '../../constants/werewolf';

function VillagerView() {
  return (
    <>
      <p>
        {WEREWOLF_ROLE_LABELS[ROLE_VILLAGER]}: You're not really sure what's going on, aside from the fact that
        there are some scary werewolves creeping around. But you're just happy to be along for the
        ride.
      </p>
      <p>You do not have any nighttime actions.</p>
    </>
  );
}

export default VillagerView;

