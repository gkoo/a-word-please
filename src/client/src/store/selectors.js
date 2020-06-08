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
export const showAboutModalSelector = state => state.showAboutModal;
export const alertsSelector = state => state.alerts;
export const socketConnectedSelector = state => state.socketConnected;

// Game Data
export const gameDataSelector = state => state.gameData;
export const cluesSelector = createSelector(
  gameDataSelector,
  gameData => gameData && gameData.clues
);
export const guesserIdSelector = createSelector(
  gameDataSelector,
  gameData => gameData && gameData.guesserId
);
export const currWordSelector = createSelector(
  gameDataSelector,
  gameData => gameData && gameData.currWord
);
export const currGuessSelector = createSelector(
  gameDataSelector,
  gameData => gameData && gameData.currGuess
);
export const gameStateSelector = createSelector(
  gameDataSelector,
  gameData => gameData && gameData.state
);
export const numPointsSelector = createSelector(
  gameDataSelector,
  gameData => gameData && gameData.numPoints
);
export const playersSelector = createSelector(
  gameDataSelector,
  gameData => gameData && gameData.players
);
export const roundNumSelector = createSelector(
  gameDataSelector,
  gameData => gameData && gameData.roundNum
);
export const skippedTurnSelector = createSelector(
  gameDataSelector,
  gameData => gameData && gameData.skippedTurn
);
export const totalNumRoundsSelector = createSelector(
  gameDataSelector,
  gameData => gameData && gameData.totalNumRounds
);

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