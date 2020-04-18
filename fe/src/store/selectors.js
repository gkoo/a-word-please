import { createSelector } from 'reselect';

export const playersSelector = state => state.players;
export const messagesSelector = state => state.messages;
export const nameSelector = state => state.name;
export const socketSelector = state => state.socket;
export const currPlayerIdSelector = state => state.currPlayerId;
export const currPlayerSelector = state => state.players[state.currPlayerId];

export const currPlayerHandSelector = createSelector(
  currPlayerSelector,
  currPlayer => currPlayer && currPlayer.hand,
);
