import React from 'react';

import { WEREWOLF_ROLE_LABELS, ROLE_TANNER } from '../../constants';

function TannerView() {
  return <p>{WEREWOLF_ROLE_LABELS[ROLE_TANNER]}: If you are eliminated at the end of the round, you win.</p>;
}

export default TannerView;
