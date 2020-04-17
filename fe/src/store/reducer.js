import io from 'socket.io-client';

import * as actions from './actions';

const socketIoServerUrl = 'http://localhost:5000';

const initialState = {
  players: {},
  messages: [],
  socket: io(socketIoServerUrl),
};

export default function reducer(state = initialState, action) {
  switch(action.type) {
    case actions.NEW_PLAYER:
      const newPlayers = {
        ...state.players,
      };
      newPlayers[action.payload.id] = { name: action.payload.name };
      return {
        ...state,
        players: newPlayers,
      };
    case actions.PLAYER_MESSAGE:
      const newMessages = [...state.messages, action.payload.message];
      return {
        ...state,
        messages: newMessages,
      };
    case actions.RECEIVE_INIT_DATA:
      const { players } = action.payload;
      const messages = action.payload.messages;
      return {
        ...state,
        messages,
        players,
      };
    case actions.SAVE_NAME:
      return {
        ...state,
        name: action.payload.name,
      };
    default:
      return state;
  }
};
