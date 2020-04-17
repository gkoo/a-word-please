// Action Types
export const SUBMIT_MESSAGE = 'SUBMIT_MESSAGE';

// Actions
export function submitMessage(message) {
  return {
    payload: { message },
    type: SUBMIT_MESSAGE,
  }
}
