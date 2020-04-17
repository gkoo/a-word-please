// Action Types
export const PLAYER_MESSAGE = 'PLAYER_MESSAGE';

// Actions
export function playerMessage(message) {
  return {
    payload: { message },
    type: PLAYER_MESSAGE,
  }
}
