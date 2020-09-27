import { GAME_SF_ARTIST } from '../constants';
import * as constants from '../constants/sfArtist';
import testPlayersData from './testPlayersData';

//const state = constants.GameState.ExplainRules;
const state = constants.GameState.DrawingPhase;
//const state = constants.GameState.VotingPhase;
//const state = constants.GameState.Results;

export default {
  gameId: GAME_SF_ARTIST,
  players: testPlayersData,
  spectators: [],
  state,
};
