import io from 'socket.io-client';

import * as actions from './actions';
import * as constants from '../constants';

// Change to 1 to develop UI
const useTestState = 0;

const { env } = constants;

const initialState = {
  alerts: [],
  currUserId: null,
  debugEnabled: env !== 'production',
  gameData: {
    players: {},
  },
  roomData: {
    selectedGame: null,
    users: {},
  },
  nextAlertId: 0,
  socketConnected: false,
  messages: [],
  showAboutModal: false,
  showReleaseNotesModal: false,
  showRolesModal: false,
  showRulesModal: false,
  socket: null,
};

const testPlayersData = {
  gordon: {
    id: 'gordon',
    name: 'Gordon',
    isLeader: true,
    color: 'red',
    connected: true,
  },
  yuriko: {
    id: 'yuriko',
    name: 'Yuriko',
    color: 'purple',
    connected: true,
  },
  aj: {
    id: 'aj',
    name: 'AJ',
    color: 'pink',
    connected: true,
  },
  willy: {
    id: 'willy',
    name: 'Willy',
    color: 'red',
    connected: true,
  },
  rishi: {
    id: 'rishi',
    name: 'Rishi',
    color: 'orange',
    connected: true,
  },
};

const testAwpGameData = {
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
  roundNum: 0,
  skippedTurn: false,
  //state: constants.GAME_STATE_PENDING,
  state: constants.STATE_AWP_ENTERING_CLUES,
  //state: constants.STATE_AWP_REVIEWING_CLUES,
  //state: constants.STATE_AWP_ENTERING_GUESS,
  //state: constants.STATE_AWP_TURN_END,
  //state: constants.STATE_AWP_GAME_END,
  totalNumRounds: 13,
};

const roleToTest = constants.ROLE_MINION;

const testWerewolfGameData = {
  eliminatedPlayerIds: ['gordon'],
  wakeUpRole: constants.ROLE_ROBBER,
  gameId: constants.GAME_WEREWOLF,
  players: {
    gordon: {
      id: 'gordon',
      name: 'Gordon',
      isLeader: true,
      color: 'indigo',
      originalRole: roleToTest,
      lastKnownRole: roleToTest,
      role: roleToTest,
    },
    yuriko: {
      id: 'yuriko',
      name: 'Yuriko',
      color: 'indigo',
      originalRole: constants.ROLE_MASON,
      lastKnownRole: constants.ROLE_MASON,
      role: constants.ROLE_MASON,
    },
    aj: {
      id: 'aj',
      name: 'AJ',
      color: 'indigo',
      originalRole: constants.ROLE_SEER,
      lastKnownRole: constants.ROLE_SEER,
      role: constants.ROLE_SEER,
    },
    willy: {
      id: 'willy',
      name: 'Willy',
      color: 'indigo',
      originalRole: constants.ROLE_ROBBER,
      lastKnownRole: constants.ROLE_ROBBER,
      role: constants.ROLE_ROBBER,
    },
    rishi: {
      id: 'rishi',
      name: 'Rishi',
      color: 'indigo',
      originalRole: constants.ROLE_VILLAGER,
      lastKnownRole: constants.ROLE_VILLAGER,
      role: constants.ROLE_VILLAGER,
    },
  },
  revealingRoles: true,
  roleIds: [
    'werewolf1',
    'werewolf2',
    'villager2',
    'villager1',
    'hunter',
    'seer',
    'doppelganger',
    'robber',
    'tanner',
  ],
  //state: constants.STATE_WW_CHOOSING_ROLES,
  //state: constants.STATE_WW_NIGHTTIME,
  //state: constants.STATE_WW_DAYTIME,
  //state: constants.STATE_WW_VOTING,
  state: constants.STATE_WW_VOTE_RESULTS,
  unclaimedRoles: [constants.ROLE_WEREWOLF, constants.ROLE_DRUNK, constants.ROLE_DOPPELGANGER],
  votes: {
    'gordon': 'willy',
    'yuriko': 'yuriko',
    'aj': 'yuriko',
    'willy': 'gordon',
    'rishi': 'willy',
  },
  winners: [constants.ROLE_WEREWOLF],
};

const testWavelengthGameData = {
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

const testDeceptionGameData = {
  gameId: constants.GAME_DECEPTION,
  playersReady: {
    'gordon': 1
  },
  players: {
    gordon: {
      id: 'gordon',
      name: 'Gordon',
      color: 'red',
      role: constants.ROLE_MURDERER,
    },
    yuriko: {
      id: 'yuriko',
      name: 'Yuriko',
      color: 'purple',
      connected: true,
      role: constants.ROLE_SCIENTIST,
    },
    aj: {
      id: 'aj',
      name: 'AJ',
      color: 'pink',
      connected: true,
      role: constants.ROLE_INVESTIGATOR,
    },
  },
  //state: constants.STATE_DECEPTION_EXPLAIN_RULES,
  state: constants.STATE_DECEPTION_CHOOSE_MEANS_EVIDENCE,
  //state: constants.STATE_DECEPTION_WITNESSING,
  //state: constants.STATE_DECEPTION_SCIENTIST_INITIAL_TILES,
}

//const testGameDataToUse = testAwpGameData;
//const testGameDataToUse = testWerewolfGameData;
//const testGameDataToUse = testWavelengthGameData;
const testGameDataToUse = testDeceptionGameData;

const testState = {
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
};

const stateToUse = useTestState ? testState : initialState;

const colors = [
  'indigo',
  'purple',
  'pink',
  'red',
  'orange',
  'yellow',
  'green',
  'teal',
  'cyan',
  'warning',
  'danger',
];

const getColorForPlayerName = name => {
  const letters = name.split('');
  const charCodes = letters.map(letter => letter.charCodeAt(0));
  const sum = charCodes.reduce((currSum, currCode) => currSum + currCode);
  return colors[sum % colors.length];
};

export default function reducer(state = stateToUse, action) {
  let name, newAlerts, newPlayers, newUsers, players;

  switch(action.type) {
    case actions.CLEAR_NAME:
      return {
        ...state,
        name: undefined,
      };

    case actions.CONNECT_SOCKET:
      state.socket.open();
      return {
        ...state,
        socketConnected: true,
      }

    case actions.DISMISS_ALERT:
      const { id } = action.payload;
      const { alerts } = state;
      const alertIdx = alerts.findIndex(alert => alert.id === id);
      return {
        ...state,
        alerts: [
          ...alerts.slice(0, alertIdx),
          ...alerts.slice(alertIdx+1),
        ],
      };

    case actions.DISCONNECT_SOCKET:
      state.socket.close();
      return {
        ...state,
        gameData: null,
        name: null,
        roomData: null,
        socketConnected: false,
      }

    case actions.NEW_SOCKET:
      if (state.socket) {
        return state;
      }
      const ioServerDomain = (env === 'production') ? '/' : 'http://localhost:5000';
      return {
        ...state,
        socket: io(ioServerDomain),
      };

    case actions.NEW_USER:
      const userId = action.payload.id;
      name = action.payload.name;
      const oldUser = state.roomData?.users[userId] || {};

      newAlerts = [...state.alerts];
      const shouldShowAlert = userId !== state.currUserId;

      if (shouldShowAlert) {
        newAlerts.push({
          id: state.nextAlertId,
          message: `${name} has connected`,
          type: 'info',
        });
      }

      return {
        ...state,
        // Add an alert to notify that a new user has connected
        alerts: newAlerts,
        // Increment the id for the next alert
        nextAlertId: shouldShowAlert ? state.nextAlertId + 1 : state.nextAlertId,
        roomData: {
          ...state.roomData,
          users: {
            ...state.roomData?.users,
            [userId]: {
              ...oldUser,
              ...action.payload,
            },
          },
        },
      };

    // When another user has disconnected
    case actions.USER_DISCONNECT:
      const disconnectedUserId = action.payload.userId;
      const disconnectedUser = state.roomData?.users[disconnectedUserId];
      const playerName = disconnectedUser && disconnectedUser.name;

      newUsers = {};

      Object.keys(state.roomData?.users).forEach(userId => {
        newUsers[userId] = state.roomData?.users[userId];
        if (disconnectedUserId === userId) {
          newUsers[userId].connected = false;
        }
      });

      newAlerts = state.alerts;

      if (playerName) {
        newAlerts = [
          ...state.alerts,
          {
            id: state.nextAlertId,
            message: `${playerName} has disconnected`,
            type: 'danger',
          }
        ];
      }

      return {
        ...state,
        // Add an alert to notify that the user has disconnected
        alerts: newAlerts,
        // Increment the id for the next alert
        nextAlertId: state.nextAlertId + 1,
        roomData: {
          ...state.roomData,
          users: newUsers,
        },
        // Mark the user as disconnected
        players: {
          ...state.gameData.players,
          [disconnectedUserId]: {
            ...state.gameData.players[disconnectedUserId],
            connected: false,
          },
        },
      }

    case actions.NEW_ALERT:
      const { message, type } = action.payload;
      let { nextAlertId } = state;

      const alert = {
        id: nextAlertId,
        message,
        type,
      };
      return {
        ...state,
        alerts: [...state.alerts, alert],
        nextAlertId: nextAlertId + 1,
      };

    case actions.RECEIVE_DEBUG_INFO:
      console.log(action.payload);
      return state;

    case actions.RECEIVE_GAME_DATA:
      const fieldsFromClient = ['showRolesModal'];
      const dataFromClient = {};
      fieldsFromClient.forEach(field => {
        dataFromClient[field] = state.gameData && state.gameData[field];
      });

      players = action.payload.players;

      newPlayers = {};

      if (players) {
        Object.keys(players).forEach((playerId, idx) => {
          let color;
          if (action.payload.gameId === constants.GAME_WEREWOLF) {
            color = 'indigo';
          } else {
            color = getColorForPlayerName(players[playerId].name);
          }
          newPlayers[playerId] = {
            ...state.gameData.players[playerId],
            ...players[playerId],
            color,
          }
        });
      }

      return {
        ...state,
        gameData: {
          ...action.payload,
          ...dataFromClient,
          players: newPlayers,
        },
      };

    case actions.RECEIVE_ROOM_DATA:
      const newRoomData = action.payload;
      const { roomData } = state;

      window.localStorage.setItem('socketId', newRoomData.currUserId);

      return {
        ...state,
        roomData: {
          ...roomData,
          ...newRoomData,
        },
      };

    case actions.RECEIVE_USER_ID:
      return {
        ...state,
        currUserId: action.payload,
      };

    case actions.SAVE_NAME:
      name = action.payload.name;
      const { isSpectator } = action.payload;

      return {
        ...state,
        debugEnabled: (name && name.toLowerCase() === 'gordon') || state.debugEnabled, // >_<
        name,
        isSpectator,
      };

    case actions.SET_ROOM_CODE:
      const { roomCode } = action.payload;

      return {
        ...state,
        roomCode,
      };

    case actions.SHOW_ALERT:
      return {
        ...state,
        alertMessage: action.payload,
      };

    case actions.TOGGLE_ABOUT_MODAL:
      return {
        ...state,
        showAboutModal: action.payload.show,
      };

    case actions.TOGGLE_RELEASE_NOTES_MODAL:
      return {
        ...state,
        showReleaseNotesModal: action.payload.show,
      };

    case actions.TOGGLE_ROLES_MODAL:
      if (!state.gameData) { return state; }
      return {
        ...state,
        gameData: {
          ...state.gameData,
          showRolesModal: action.payload.show,
        },
      };

    case actions.TOGGLE_RULES_MODAL:
      return {
        ...state,
        showRulesModal: action.payload.show,
      };

    case actions.UPDATE_SPECTRUM_GUESS:
      const newGameData = {
        ...state.gameData,
        spectrumGuess: action.payload.guess,
      };

      return {
        ...state,
        gameData: newGameData,
      };

    default:
      return state;
  }
};
