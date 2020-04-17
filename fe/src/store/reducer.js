import io from 'socket.io-client';

import * as actions from './actions';

const socketIoServerUrl = 'http://localhost:5000';

const initialState = {
  messages: [],
  socket: io(socketIoServerUrl),
};

export default function reducer(state = initialState, action) {
  switch(action.type) {
    case actions.PLAYER_MESSAGE:
      const messages = [...state.messages, action.payload.message];
      return {
        ...state,
        messages,
      };
    default:
      return state;
  }
};
