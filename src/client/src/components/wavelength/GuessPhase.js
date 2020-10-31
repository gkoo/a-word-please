import React from 'react';
import { useSelector } from 'react-redux';

import GuessPhasePsychicView from './GuessPhasePsychicView';
import GuessPhaseGuesserView from './GuessPhaseGuesserView';
import * as selectors from '../../store/selectors';

function GuessPhase() {
  const clue = useSelector(selectors.clueSelector);
  const currPlayerIsActivePlayer = useSelector(selectors.currPlayerIsActivePlayerSelector);
  const currUserIsSpectator = useSelector(selectors.currUserIsSpectatorSelector);
  const activePlayer = useSelector(selectors.activePlayerSelector);

  if (!clue) {
    return <h1>Waiting for {activePlayer.name} to enter a clue...</h1>;
  }

  const isGuesser = !currPlayerIsActivePlayer && !currUserIsSpectator;

  return (
    <>
      <div className='text-center mb-5'>
        <h2 className='spectrum-clue'>"{clue}"</h2>
      </div>
      {
        (currPlayerIsActivePlayer || currUserIsSpectator) && <GuessPhasePsychicView/>
      }
      {
        isGuesser && <GuessPhaseGuesserView/>
      }
      {
        !isGuesser &&
          <p>Your teammates are choosing a point on the spectrum based on the clue you've provided.</p>
      }
    </>
  );
}

export default GuessPhase;
