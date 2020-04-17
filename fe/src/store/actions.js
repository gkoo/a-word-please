// Action Types
export const NEW_PLAYER = 'NEW_PLAYER';
export const PLAYER_MESSAGE = 'PLAYER_MESSAGE';
export const SAVE_NAME = 'SAVE_NAME';

// Actions
export function newPlayer({ id, name }) {
  return {
    payload: { id, name },
    type: NEW_PLAYER,
  }
}

export function playerMessage(message) {
  return {
    payload: { message },
    type: PLAYER_MESSAGE,
  }
}

export function saveName(name) {
  return {
    payload: { name },
    type: SAVE_NAME,
  }
}
