import React from 'react';
import { useSelector } from 'react-redux';

import ClueCard from './ClueCard';
import { cluesSelector } from '../store/selectors';

function CluesView({ largeView, redactDuplicates }) {
  const clues = useSelector(cluesSelector);

  return (
    <>
      {
        Object.keys(clues).map(playerId => {
          const clueData = clues[playerId];
          return (
            <ClueCard
              clueData={clueData}
              playerId={playerId}
              isRedacted={redactDuplicates && clueData.isDuplicate}
            />
          );
        })
      }
    </>
  );
}

export default CluesView;
