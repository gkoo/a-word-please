import * as constants from '../constants';
import testPlayersData from './testPlayersData';

export default {
  //clues: {},
  activePlayerId: 'willy',
  //activePlayerId: 'gordon',
  clues: {
    'gordon': {
      clue: 'fire',
      isDuplicate: false,
    },
  },
  currGuess: 'hydrant',
  currWord: 'water',
  gameId: constants.GAME_A_WORD_PLEASE,
  numPoints: 7,
  players: testPlayersData,
  playersReady: {},
  roundNum: 0,
  skippedTurn: false,
  spectators: [],
  //state: constants.GAME_STATE_PENDING,
  state: constants.STATE_AWP_ENTERING_CLUES,
  //state: constants.STATE_AWP_REVIEWING_CLUES,
  //state: constants.STATE_AWP_ENTERING_GUESS,
  //state: constants.STATE_AWP_TURN_END,
  //state: constants.STATE_AWP_GAME_END,
  totalNumRounds: 13,
};
