import React from 'react';

import { useSelector } from 'react-redux';

import Spectrum from './Spectrum';
import SpectrumBands from './SpectrumBands';

import * as selectors from '../../store/selectors';

function GuessPhasePsychicView() {
  const { currTurnPoints } = useSelector(selectors.gameDataSelector);
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
          <div className='my-3 py-1' style={{ backgroundColor: '#333' }}>
            <h4 className='text-center'>
              {player.name}
              {currTurnPoints[player.id] > 0 && ` +${currTurnPoints[player.id]}`}
            </h4>
            <Spectrum value={spectrumGuesses[player.id]} disabled={true}/>
          </div>
        )
      }
    </>
  );
}

export default GuessPhasePsychicView;
