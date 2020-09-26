import * as constants from '../constants';
import testPlayersData from './testPlayersData';

export default {
  activePlayerId: 'gordon',
  //activePlayerId: 'willy',
  clue: 'The quick brown fox jumped over the lazy dog',
  currConcept: ['Bad', 'Good'],
  gameId: constants.GAME_WAVELENGTH,
  players: testPlayersData,
  pointsForPlayer: {
    gordon: 5,
    yuriko: 3,
    rishi: 10,
  },
  roundNum: 13,
  spectators: [],
  //state: constants.STATE_WAVELENGTH_CLUE_PHASE,
  //state: constants.STATE_WAVELENGTH_GUESS_PHASE,
  //state: constants.STATE_WAVELENGTH_REVEAL_PHASE,
  state: constants.STATE_WAVELENGTH_GAME_END_PHASE,
  spectrumGuess: 100,
  spectrumValue: 80,
  totalNumRounds: 13,
};
