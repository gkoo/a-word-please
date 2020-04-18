import io from 'socket.io-client';

import * as actions from './actions';

const socketIoServerUrl = 'http://localhost:5000';

const initialState = {
  gameData: {},
  players: {},
  messages: [],
  socket: io(socketIoServerUrl),
};

export default function reducer(state = initialState, action) {
  let newMessages, newPlayers;

  switch(action.type) {
    case actions.GAME_START:
      console.log(action.payload);
      const newGameData = {
        ...state.gameData,
        state: action.payload.state,
      };
      return {
        ...state,
        gameData: newGameData,
      };

    case actions.NEW_PLAYER:
      const { id, name, isLeader } = action.payload;
      newPlayers = {
        ...state.players,
      };
      newPlayers[action.payload.id] = {
        id,
        name,
        isLeader,
      };
      return {
        ...state,
        players: newPlayers,
      };

    case actions.PLAYER_DISCONNECT:
      const disconnectedPlayerId = action.payload.playerId;
      newPlayers = {};
      Object.keys(state.players).forEach(playerId => {
        if (playerId !== disconnectedPlayerId) {
          newPlayers[playerId] = state.players[playerId];
        }
      });
      return {
        ...state,
        players: newPlayers,
      }

    case actions.PLAYER_MESSAGE:
      newMessages = [...state.messages, action.payload.message];
      return {
        ...state,
        messages: newMessages,
      };

    case actions.RECEIVE_INIT_DATA:
      const { currPlayerId, messages, players } = action.payload;
      return {
        ...state,
        currPlayerId,
        messages,
        players,
      };

    case actions.SAVE_NAME:
      return {
        ...state,
        name: action.payload.name,
      };

    case actions.SYSTEM_MESSAGE:
      newMessages = [...state.messages, action.payload.message];
      return {
        ...state,
        messages: newMessages,
      };

    default:
      return state;
  }
};
