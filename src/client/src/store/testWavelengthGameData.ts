import * as constants from '../constants';
import testPlayersData from './testPlayersData';

export default {
  activePlayerId: 'gordon',
  //activePlayerId: 'willy',
  clue: 'The quick brown fox jumped over the lazy dog',
  currConcept: ['Bad', 'Good'],
  gameId: constants.GAME_WAVELENGTH,
  numPoints: 0,
  players: testPlayersData,
  roundNum: 13,
  //state: constants.STATE_WAVELENGTH_CLUE_PHASE,
  state: constants.STATE_WAVELENGTH_GUESS_PHASE,
  //state: constants.STATE_WAVELENGTH_REVEAL_PHASE,
  //state: constants.STATE_WAVELENGTH_GAME_END_PHASE,
  spectrumGuess: 140,
  spectrumValue: 80,
  totalNumRounds: 13,
};
