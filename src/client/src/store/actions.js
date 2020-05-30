// Action Types
export const CONNECT_SOCKET = 'CONNECT_SOCKET';
export const DISCONNECT_SOCKET = 'DISCONNECT_SOCKET';
export const DISMISS_ALERT = 'DISMISS_ALERT';
export const END_GAME = 'END_GAME';
export const NEW_ALERT = 'NEW_ALERT';
export const NEW_LEADER = 'NEW_LEADER';
export const NEW_SOCKET = 'NEW_SOCKET';
export const NEW_USER = 'NEW_USER';
export const RECEIVE_DEBUG_INFO = 'RECEIVE_DEBUG_INFO';
export const RECEIVE_GAME_DATA = 'RECEIVE_GAME_DATA';
export const RECEIVE_INIT_DATA = 'RECEIVE_INIT_DATA';
export const SAVE_NAME = 'SAVE_NAME';
export const SET_ROOM_CODE = 'SET_ROOM_CODE';
export const SHOW_ALERT = 'SHOW_ALERT';
export const TOGGLE_RULES_MODAL = 'TOGGLE_RULES_MODAL';
export const USER_DISCONNECT = 'USER_DISCONNECT';

export function connectSocket() {
  return {
    type: CONNECT_SOCKET,
  }
}

export function disconnectSocket() {
  return {
    type: DISCONNECT_SOCKET,
  }
}

export function dismissAlert(id) {
  return {
    payload: { id },
    type: DISMISS_ALERT,
  }
}

export function endGame(winnerIds) {
  return {
    payload: winnerIds,
    type: END_GAME,
  }
}

export function newAlert({ message, type }) {
  return {
    payload: { message, type },
    type: NEW_ALERT,
  }
}

export function newSocket(socket) {
  return {
    payload: { socket },
    type: NEW_SOCKET,
  }
}

export function newUser({ id, name, isLeader }) {
  return {
    payload: { id, name, isLeader },
    type: NEW_USER,
  }
}

export function receiveDebugInfo(data) {
  return {
    payload: data,
    type: RECEIVE_DEBUG_INFO,
  }
}

export function receiveGameData(gameData) {
  return {
    payload: gameData,
    type: RECEIVE_GAME_DATA,
  }
}

export function receiveInitData({ currUserId, messages, users }) {
  return {
    payload: { currUserId, messages, users },
    type: RECEIVE_INIT_DATA,
  }
}

export function saveName(name) {
  return {
    payload: { name },
    type: SAVE_NAME,
  }
}

export function userDisconnect(userId) {
  return {
    payload: { userId },
    type: USER_DISCONNECT,
  }
}

export function setRoomCode(roomCode) {
  return {
    payload: { roomCode },
    type: SET_ROOM_CODE,
  }
}

export function showAlert(msg) {
  return {
    payload: msg,
    type: SHOW_ALERT,
  }
}

export function toggleRulesModal({ show }) {
  return {
    payload: { show },
    type: TOGGLE_RULES_MODAL,
  }
}
