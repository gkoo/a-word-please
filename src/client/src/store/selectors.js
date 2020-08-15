import { createSelector } from 'reselect';

export const alertMessageSelector = state => state.alertMessage;
export const debugEnabledSelector = state => state.debugEnabled;
export const usersSelector = state => state.roomData?.users;
export const connectedUsersSelector = createSelector(
  usersSelector,
  users => users && Object.values(users).filter(user => user.connected),
);
export const spectatorUsersSelector = createSelector(
  usersSelector,
  users => users && Object.values(users).filter(user => user.isSpectator),
)
export const messagesSelector = state => state.messages;
export const nameSelector = state => state.name;
export const socketSelector = state => state.socket;
export const currUserIdSelector = state => state.currUserId;
export const currUserSelector = createSelector(
  currUserIdSelector,
  usersSelector,
  (currUserId, users) => users[currUserId],
);
export const roomCodeSelector = state => state.roomCode;
export const selectedGameSelector = state => state.roomData?.selectedGame;
export const showRulesModalSelector = state => state.showRulesModal;
export const showAboutModalSelector = state => state.showAboutModal;
export const showReleaseNotesModalSelector = state => state.showReleaseNotesModal;
export const alertsSelector = state => state.alerts;
export const socketConnectedSelector = state => state.socketConnected;
export const roomStateSelector = state => state.roomData?.state;

// Game Data
// A Word, Please?
export const gameDataSelector = state => state.gameData;
export const gameIdSelector = createSelector(
  gameDataSelector,
  gameData => gameData && gameData.gameId
);
export const cluesSelector = createSelector(
  gameDataSelector,
  gameData => gameData && gameData.clues
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
  gameData => gameData?.players
);
export const activePlayerSelector = createSelector(
  gameDataSelector,
  playersSelector,
  (gameData, players) => gameData?.activePlayerId && players[gameData.activePlayerId],
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

export const currPlayerSelector = createSelector(
  currUserIdSelector,
  playersSelector,
  (currUserId, players) => players && players[currUserId],
);
export const numRoundsLeftSelector = createSelector(
  roundNumSelector,
  totalNumRoundsSelector,
  (roundNum, totalNumRounds) => Math.max(totalNumRounds - roundNum, 0),
);
// Werewolf
export const roleIdsSelector = createSelector(
  gameDataSelector,
  gameData => gameData && gameData.roleIds
);
export const wakeUpRoleSelector = createSelector(
  gameDataSelector,
  gameData => gameData && gameData.wakeUpRole
)
export const unclaimedRolesSelector = createSelector(
  gameDataSelector,
  gameData => gameData && gameData.unclaimedRoles
);
export const votesSelector = createSelector(
  gameDataSelector,
  gameData => gameData && gameData.votes
);
export const revealingRolesSelector = createSelector(
  gameDataSelector,
  gameData => gameData && gameData.revealingRoles
);
export const showRolesModalSelector = createSelector(
  gameDataSelector,
  gameData => gameData && gameData.showRolesModal
);
export const winnersSelector = createSelector(
  gameDataSelector,
  gameData => gameData && gameData.winners
);
export const eliminatedPlayersSelector = createSelector(
  gameDataSelector,
  playersSelector,
  (gameData, players) => {
    return (
      gameData?.eliminatedPlayerIds &&
        players &&
        gameData.eliminatedPlayerIds.map(id => players[id])
    );
  }
);
export const ensureWerewolfSelector = createSelector(
  gameDataSelector,
  gameData => gameData?.ensureWerewolf
);

// Wavelength
export const spectrumValueSelector = createSelector(
  gameDataSelector,
  gameData => gameData?.spectrumValue,
);
export const currConceptSelector = createSelector(
  gameDataSelector,
  gameData => gameData?.currConcept,
);
export const wavelengthGuessersSelector = createSelector(
  gameDataSelector,
  playersSelector,
  (gameData, players) => {
    if (!gameData) { return []; }

    const { activePlayerId } = gameData;
    return Object.values(players).filter(player => player.id !== activePlayerId);
  }
);
export const clueSelector = createSelector(
  gameDataSelector,
  gameData => gameData?.clue,
);
export const currUserIsSpectatorSelector = createSelector(
  currUserSelector,
  currUser => currUser?.isSpectator,
);
export const currPlayerIsActivePlayerSelector = createSelector(
  gameDataSelector,
  currPlayerSelector,
  currUserIsSpectatorSelector,
  (gameData, currPlayer, isSpectator) => {
    if (isSpectator) { return false; }
    if (!currPlayer) { return false; }
    return gameData?.activePlayerId === currPlayer.id;
  }
);
export const spectrumGuessSelector = createSelector(
  gameDataSelector,
  gameData => gameData?.spectrumGuess,
);
