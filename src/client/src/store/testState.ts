import * as constants from '../constants';
//import testAwpGameData from './testWavelengthGameData';
//import testDeceptionGameData from './testDeceptionGameData';
//import testPlayersData from './testPlayersData';
import testSfArtistGameData from './testSfArtistGameData';
//import testWavelengthGameData from './testWavelengthGameData';
//import testWerewolfGameData from './testWerewolfGameData';

const { env } = constants;

//const testGameDataToUse = testAwpGameData;
//const testGameDataToUse = testWerewolfGameData;
//const testGameDataToUse = testWavelengthGameData;
//const testGameDataToUse = testDeceptionGameData;
const testGameDataToUse = testSfArtistGameData;

export default {
  alerts: [
    //{
      //id: 0,
      //message: 'Gordon is dumb!',
      //type: 'danger',
    //},
    //{
      //id: 1,
      //message: 'No he\'s not!',
      //type: 'primary',
    //},
  ],
  currUserId: 'gordon',
  debugEnabled: env !== 'production',
  gameData: testGameDataToUse,
  name: 'Gordon',
  nextAlertId: 5,
  roomData: {
    selectedGame: null,
    state: constants.ROOM_STATE_GAME,
    users: {
      gordon: {
        id: 'gordon',
        name: 'Gordon',
        isLeader: true,
      },
      steve: {
        id: 'steve',
        name: 'Steve',
        isSpectator: true,
      },
      yuriko: {
        id: 'yuriko',
        name: 'Yuriko',
      },
    },
  },
  showAboutModal: false,
  showRulesModal: false,
  socket: null,
  userPreferences: {},
};
