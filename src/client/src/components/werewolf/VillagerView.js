import React from 'react';
import { useSelector } from 'react-redux';

import { currPlayerSelector, playersSelector } from '../../store/selectors';

function VillagerView() {
  return (
    <p>
      You're not really sure what's going on, aside from the fact that there are some scary
      werewolves creeping around. But you're just happy to be along for the ride.
    </p>
  );
}

export default VillagerView;

