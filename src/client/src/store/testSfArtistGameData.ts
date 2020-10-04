import { GAME_SF_ARTIST } from '../constants';
import * as constants from '../constants/sfArtist';
import testPlayersData from './testPlayersData';

//const state = constants.GameState.ExplainRules;
//const state = constants.GameState.EnterPhrasesPhase;
//const state = constants.GameState.DisplaySubject;
//const state = constants.GameState.DrawingPhase;
//const state = constants.GameState.VotingPhase;
const state = constants.GameState.Results;

export default {
  activePlayerId: 'gordon',
  fakeArtistId: 'gordon',
  gameId: GAME_SF_ARTIST,
  players: testPlayersData,
  playersReady: {
    'gordon': 1,
    'yuriko': 1,
  },
  spectators: [],
  state,
  subjectEntry: {
    subject: 'Titanic',
    category: 'Movie',
  },
  votes: {
    gordon: 'rishi',
    yuriko: 'gordon',
    willy: 'gordon',
  },
};
