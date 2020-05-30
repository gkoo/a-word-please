import { createSelector } from 'reselect';

export const alertMessageSelector = state => state.alertMessage;
export const debugEnabledSelector = state => state.debugEnabled;
export const usersSelector = state => state.users;
export const messagesSelector = state => state.messages;
export const nameSelector = state => state.name;
export const socketSelector = state => state.socket;
export const currUserIdSelector = state => state.currUserId;
export const currUserSelector = createSelector(
  currUserIdSelector,
  usersSelector,
  (currUserId, users) => users[currUserId],
)
export const roomCodeSelector = state => state.roomCode;
export const showRulesModalSelector = state => state.showRulesModal;
export const alertsSelector = state => state.alerts;
export const socketConnectedSelector = state => state.socketConnected;

// Game Data
export const cluesSelector = state => state.gameData.clues;
// the id of the player whose turn it is
export const guesserIdSelector = state => state.gameData.guesserId;
export const currWordSelector = state => state.gameData.currWord;
export const currGuessSelector = state => state.gameData.currGuess;
export const gameStateSelector = state => state.gameData.state;
export const gameDataSelector = state => state.gameData;
export const numPointsSelector = state => state.gameData.numPoints;
export const playersSelector = state => state.gameData.players;
export const roundNumSelector = state => state.gameData.roundNum;
export const skippedTurnSelector = state => state.gameData.skippedTurn;
export const totalNumRoundsSelector = state => state.gameData.totalNumRounds;

export const currPlayerIsGuesserSelector = createSelector(
  currUserIdSelector,
  guesserIdSelector,
  (currUserId, guesserId) => currUserId === guesserId,
);
export const currPlayerSelector = createSelector(
  currUserIdSelector,
  playersSelector,
  (currUserId, players) => players && players[currUserId],
);
export const guesserSelector = createSelector(
  playersSelector,
  guesserIdSelector,
  (players, guesserId) => players && players[guesserId]
);
export const numRoundsLeftSelector = createSelector(
  roundNumSelector,
  totalNumRoundsSelector,
  (roundNum, totalNumRounds) => Math.max(totalNumRounds - roundNum, 0),
);
