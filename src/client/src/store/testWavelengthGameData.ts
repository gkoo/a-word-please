import * as constants from '../constants';
import testPlayersData from './testPlayersData';

export default {
  activePlayerId: 'gordon',
  //activePlayerId: 'willy',
  clue: 'The quick brown fox jumped over the lazy dog',
  currConcept: ['Bad', 'Good'],
  currTurnPoints: {
    'gordon': 3,
  },
  gameId: constants.GAME_WAVELENGTH,
  players: testPlayersData,
  playersReady: { gordon: true },
  pointsForPlayer: {
    gordon: 5,
    yuriko: 3,
    rishi: 10,
  },
  roundNum: 13,
  spectators: [],
  //state: constants.STATE_WAVELENGTH_CLUE_PHASE,
  //state: constants.STATE_WAVELENGTH_GUESS_PHASE,
  state: constants.STATE_WAVELENGTH_REVEAL_PHASE,
  //state: constants.STATE_WAVELENGTH_GAME_END_PHASE,
  spectrumGuesses: {
    yuriko: 200,
    aj: 50,
    rishi: 110,
    willy: 140,
  },
  spectrumValue: 80,
  totalNumRounds: 13,
};
