import React from 'react';
import { useSelector } from 'react-redux';

import EndGameButtons from '../common/EndGameButtons';
import VoteResultTable from '../common/VoteResultTable';

import { gameDataSelector } from '../../store/selectors';

function ResultsView() {
  const gameData = useSelector(gameDataSelector);

  return (
    <>
      <h2 className='text-center'>Results</h2>
      <VoteResultTable voteMap={gameData.votes}/>
      <EndGameButtons/>
    </>
  );
}

export default ResultsView;
