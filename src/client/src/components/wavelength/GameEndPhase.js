import React from 'react';

import EndGameButtons from '../common/EndGameButtons';
import PointsTable from './PointsTable';

function GameEndPhase() {
  return (
    <div className='text-center'>
      <h1 className='mb-5'>Game over!</h1>
      <PointsTable/>
      <EndGameButtons/>
    </div>
  );
}

export default GameEndPhase;
