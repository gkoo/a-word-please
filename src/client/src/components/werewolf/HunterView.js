import React from 'react';

import { LABELS, ROLE_HUNTER } from '../../constants';

function HunterView() {
  return (
    <>
      <p>
        {LABELS[ROLE_HUNTER]}: If you are eliminated, the person you vote to eliminate is also
        eliminated.
      </p>
      <p>You do not have any nighttime actions.</p>
    </>
  );
}

export default HunterView;