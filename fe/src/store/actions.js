// Action Types
export const RECEIVE_GAME_DATA = 'RECEIVE_GAME_DATA';
export const NEW_LEADER = 'NEW_LEADER';
export const NEW_PLAYER = 'NEW_PLAYER';
export const PLAYER_DISCONNECT = 'PLAYER_DISCONNECT';
export const PLAYER_MESSAGE = 'PLAYER_MESSAGE';
export const RECEIVE_DEBUG_INFO = 'RECEIVE_DEBUG_INFO';
export const RECEIVE_INIT_DATA = 'RECEIVE_INIT_DATA';
export const SAVE_NAME = 'SAVE_NAME';
export const SYSTEM_MESSAGE = 'SYSTEM_MESSAGE';

// Actions
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

export function newPlayer({ id, name, isLeader }) {
  return {
    payload: { id, name, isLeader },
    type: NEW_PLAYER,
  }
}

export function playerMessage(message) {
  return {
    payload: { message },
    type: PLAYER_MESSAGE,
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

export function systemMessage(message) {
  return {
    payload: { message },
    type: SYSTEM_MESSAGE,
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
