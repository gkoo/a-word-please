// Action Types
export const BARON_REVEAL = 'BARON_REVEAL';
export const CLOSE_END_GAME_MODAL = 'CLOSE_END_GAME_MODAL';
export const DISMISS_REVEAL = 'DISMISS_REVEAL';
export const END_GAME = 'END_GAME';
export const RECEIVE_GAME_DATA = 'RECEIVE_GAME_DATA';
export const NEW_MESSAGE = 'NEW_MESSAGE';
export const NEW_LEADER = 'NEW_LEADER';
export const NEW_PLAYER = 'NEW_PLAYER';
export const PLAYER_DISCONNECT = 'PLAYER_DISCONNECT';
export const PRIEST_REVEAL = 'PRIEST_REVEAL';
export const RECEIVE_DEBUG_INFO = 'RECEIVE_DEBUG_INFO';
export const RECEIVE_INIT_DATA = 'RECEIVE_INIT_DATA';
export const SAVE_NAME = 'SAVE_NAME';

// Actions
export function baronReveal(baronData) {
  return {
    payload: baronData,
    type: BARON_REVEAL,
  }
}

export function closeEndGameModal() {
  return {
    type: CLOSE_END_GAME_MODAL,
  }
}

export function dismissReveal() {
  return {
    type: DISMISS_REVEAL,
  }
}

export function endGame(winnerIds) {
  return {
    payload: winnerIds,
    type: END_GAME,
  }
}

export function receiveGameData(gameData) {
  return {
    payload: gameData,
    type: RECEIVE_GAME_DATA,
  }
}

export function newLeader(playerId) {
  return {
    payload: { playerId },
    type: NEW_LEADER,
  }
}

export function newMessage(message) {
  return {
    payload: { message },
    type: NEW_MESSAGE,
  }
}

export function newPlayer({ id, name, isLeader }) {
  return {
    payload: { id, name, isLeader },
    type: NEW_PLAYER,
  }
}

export function receiveDebugInfo(data) {
  return {
    payload: data,
    type: RECEIVE_DEBUG_INFO,
  }
}

export function receiveInitData({ currPlayerId, messages, players }) {
  return {
    payload: { currPlayerId, messages, players },
    type: RECEIVE_INIT_DATA,
  }
}

export function saveName(name) {
  return {
    payload: { name },
    type: SAVE_NAME,
  }
}

export function playerDisconnect(playerId) {
  return {
    payload: { playerId },
    type: PLAYER_DISCONNECT,
  }
}

export function priestReveal(card) {
  return {
    payload: { card },
    type: PRIEST_REVEAL,
  }
}
