// Action Types
export const CLEAR_NAME = 'CLEAR_NAME';
export const CLEAR_STROKE = 'CLEAR_STROKE';
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
export const RECEIVE_ROOM_DATA = 'RECEIVE_ROOM_DATA';
export const RECEIVE_USER_ID = 'RECEIVE_USER_ID';
export const SAVE_NAME = 'SAVE_NAME';
export const SAVE_STROKE = 'SAVE_STROKE';
export const SET_ROOM_CODE = 'SET_ROOM_CODE';
export const SHOW_ALERT = 'SHOW_ALERT';
export const TOGGLE_ABOUT_MODAL = 'TOGGLE_ABOUT_MODAL';
export const TOGGLE_RELEASE_NOTES_MODAL = 'TOGGLE_RELEASE_NOTES_MODAL';
export const TOGGLE_ROLES_MODAL = 'TOGGLE_ROLES_MODAL';
export const UPDATE_SPECTRUM_GUESS = 'UPDATE_SPECTRUM_GUESS';
export const UPDATE_USER_PREFERENCE = 'UPDATE_USER_PREFERENCE';
export const USER_DISCONNECT = 'USER_DISCONNECT';

export function clearName() {
  return {
    type: CLEAR_NAME,
  }
}

export function clearStrokes() {
  return {
    type: CLEAR_STROKE,
  }
}

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

export function newUser(data) {
  return {
    payload: data,
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

export function receiveRoomData(data) {
  return {
    payload: data,
    type: RECEIVE_ROOM_DATA,
  }
}

export function receiveUserId(userId) {
  return {
    payload: userId,
    type: RECEIVE_USER_ID,
  }
}

export function saveName({ name, isSpectator }) {
  return {
    payload: { name, isSpectator },
    type: SAVE_NAME,
  }
}

export function saveStroke(pathObj) {
  return {
    payload: pathObj,
    type: SAVE_STROKE,
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

export function toggleAboutModal({ show }) {
  return {
    payload: { show },
    type: TOGGLE_ABOUT_MODAL,
  }
}

export function toggleReleaseNotesModal({ show }) {
  return {
    payload: { show },
    type: TOGGLE_RELEASE_NOTES_MODAL,
  };
}

export function toggleRolesModal({ show }) {
  return {
    payload: { show },
    type: TOGGLE_ROLES_MODAL,
  }
}

export function updateSpectrumGuess(guessData) {
  return {
    payload: { guessData },
    type: UPDATE_SPECTRUM_GUESS,
  }
}

export function updateUserPreference(preferenceName, preferenceValue) {
  return {
    payload: { preferenceName, preferenceValue },
    type: UPDATE_USER_PREFERENCE,
  }
}
