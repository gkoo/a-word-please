import React from 'react';

import { LABELS, ROLE_DRUNK } from '../../constants';

function DrunkView() {
  return (
    <>
      <p>{LABELS[ROLE_DRUNK]}: Your role will be switched with an unclaimed role sometime during the night.</p>
      <p>You do not have any nighttime actions.</p>
    </>
  );
}

export default DrunkView;
