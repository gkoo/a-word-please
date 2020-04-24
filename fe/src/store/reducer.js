import io from 'socket.io-client';

import * as actions from './actions';

import { STATE_PENDING, STATE_GAME_END } from '../constants';

const socketIoServerUrl = 'http://localhost:5000';

const initialState = {
  gameState: STATE_PENDING,
  players: {},
  messages: [],
  socket: io(socketIoServerUrl),
};

export default function reducer(state = initialState, action) {
  let newMessages, newPlayers, players;

  switch(action.type) {
    case actions.BARON_REVEAL:
      const baronRevealData = action.payload;
      return {
        ...state,
        baronRevealData,
      };

    case actions.CLOSE_END_GAME_MODAL:
      return {
        ...state,
        showEndGameModal: false,
      };

    case actions.DISMISS_REVEAL:
      return {
        ...state,
        baronRevealData: undefined,
        priestRevealCard: undefined,
      };

    case actions.END_GAME:
      const winnerIds = action.payload;
      return {
        ...state,
        gameState: STATE_GAME_END,
        showEndGameModal: true,
        winnerIds,
      };

    case actions.NEW_LEADER:
      const { playerId } = action.payload;
      const player = {
        ...state.players[playerId],
        isLeader: true,
      };
      newPlayers = {
        ...state.players,
        [playerId]: player,
      };
      return {
        ...state,
        players: newPlayers,
      };

    case actions.NEW_PLAYER:
      const { id, name, isLeader } = action.payload;
      const oldPlayer = state.players[id] || {};
      const newPlayer = {
        ...oldPlayer,
        id,
        name,
        isLeader,
      };
      newPlayers = {
        ...state.players,
      };
      newPlayers[id] = newPlayer;
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

    case actions.NEW_MESSAGE:
      newMessages = [...state.messages, action.payload.message];
      return {
        ...state,
        messages: newMessages,
      };

    case actions.PRIEST_REVEAL:
      return {
        ...state,
        priestRevealCard: action.payload.card,
      };

    case actions.RECEIVE_DEBUG_INFO:
      console.log(action.payload);
      return state;

    case actions.RECEIVE_GAME_DATA:
      const { activePlayerId, roundNum } = action.payload;
      const gameState = action.payload.state;
      players = action.payload.players;

      newPlayers = {};
      Object.keys(players).forEach(playerId => {
        newPlayers[playerId] = {
          ...state.players[playerId],
          ...players[playerId],
        }
      });

      return {
        ...state,
        activePlayerId,
        gameState,
        players: newPlayers,
        roundNum,
      };

    case actions.RECEIVE_INIT_DATA:
      const { currPlayerId, messages } = action.payload;
      players = action.payload.players;
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

    default:
      return state;
  }
};
