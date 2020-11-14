import { GAME_SF_ARTIST } from '../constants';
import * as constants from '../constants/sfArtist';

//const state = constants.GameState.GameEnd;
//const state = constants.GameState.ExplainRules;
//const state = constants.GameState.EnterPhrasesPhase;
//const state = constants.GameState.DisplaySubject;
//const state = constants.GameState.DrawingPhase;
const state = constants.GameState.VotingPhase;

const testPlayers = {
  gordon: {
    id: 'gordon',
    name: 'Gordon',
    isLeader: true,
    color: 'red',
    connected: true,
    brushColor: '#b22222',
  },
  yuriko: {
    id: 'yuriko',
    name: 'Yuriko',
    color: 'purple',
    connected: true,
    brushColor: '#006400',
  },
  aj: {
    id: 'aj',
    name: 'AJ',
    color: 'pink',
    connected: true,
    brushColor: '#ff8c00',
  },
  willy: {
    id: 'willy',
    name: 'Willy',
    color: 'red',
    connected: true,
    brushColor: '#ff1493',
  },
  rishi: {
    id: 'rishi',
    name: 'Rishi',
    color: 'orange',
    connected: true,
    brushColor: '#663399',
  },
}

export default {
  activePlayerId: 'gordon',
  fakeArtistId: 'gordon',
  gameId: GAME_SF_ARTIST,
  playerOrder: [
    'willy',
    'aj',
    'gordon',
    'yuriko',
    'rishi',
  ],
  players: testPlayers,
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
