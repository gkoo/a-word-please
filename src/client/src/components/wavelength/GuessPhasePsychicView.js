import React from 'react';

import { useSelector } from 'react-redux';

import Spectrum from './Spectrum';
import SpectrumBands from './SpectrumBands';

import * as selectors from '../../store/selectors';

function GuessPhasePsychicView() {
  const spectrumGuesses = useSelector(selectors.spectrumGuessesSelector);
  const connectedPlayers = useSelector(selectors.connectedPlayersSelector);
  const activePlayer = useSelector(selectors.activePlayerSelector);

  const guesserPlayers = connectedPlayers.filter(player => player.id !== activePlayer.id);

  if (!spectrumGuesses) { return false; }

  return (
    <>
      <SpectrumBands/>
      {
        guesserPlayers.map(player =>
          <>
            <h4>{player.name}</h4>
            <Spectrum value={spectrumGuesses[player.id]} disabled={true}/>
          </>
        )
      }
    </>
  );
}

export default GuessPhasePsychicView;
