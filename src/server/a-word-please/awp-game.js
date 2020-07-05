const _ = require('lodash');
const uuid = require('uuid');

const Game = require('../game');
const Player = require('../player.js');
const wordlist = require('./wordlist.js');

class AWPGame extends Game {
  static GAME_ID = Game.GAME_A_WORD_PLEASE;
  static STATE_ENTERING_CLUES = 3;
  static STATE_REVIEWING_CLUES = 4;
  static STATE_ENTERING_GUESS = 5;

  static MAX_WORD_LENGTH = 20;
  static MIN_PLAYERS = 2;
  static TOTAL_NUM_ROUNDS = 13;

  constructor(io, roomCode) {
    super(io, roomCode);
    this.clues = {};
    this.lexicon = [];
    this.lexiconCursor = 0;
    this.numPoints = 0;
    this.skippedTurn = false;
  }

  setup(users) {
    super.setup(users);
    this.createDeck(wordlist);
    this.determinePlayerOrder();
    this.newGame();
  }

  newGame() {
    this.roundNum = 0;
    this.numPoints = 0;
    this.nextTurn();
  }

  addPlayer(user) {
    const { id, name } = user;

    if (!name) { return; }

    this.players[user.id] = new Player({
      id,
      name,
    });

    if (this.playerOrder) {
      this.playerOrder.push(user.id);
    }
  }

  getConnectedPlayers() {
    return Object.values(this.players).filter(player => player.connected);
  }

  removePlayer(id) {
    if (this.players[id]) { this.players[id].connected = false; }

    // Remove from player order
    const playerOrderIdx = this.playerOrder.indexOf(id);

    // For some reason, players get disconnected without being in the game
    if (playerOrderIdx >= 0) {
      this.playerOrder.splice(playerOrderIdx, 1);
    }

    // Remove clue from clues
    if (this.clues[id]) { delete this.clues[id]; }

    if (id === this.activePlayerId) {
      this.nextTurn(false);
    }

    this.broadcastGameDataToPlayers();

    if (this.state === AWPGame.STATE_ENTERING_CLUES) {
      // TODO: unmark duplicates
      this.checkIfAllCluesAreIn();
    }
  }

  nextTurn(shouldIncrementRound = true) {
    this.clues = {};
    this.currGuess = null;
    this.skippedTurn = false;

    if (shouldIncrementRound) {
      ++this.roundNum;
    }

    if (this.roundNum > AWPGame.TOTAL_NUM_ROUNDS) {
      this.endGame();
      return;
    }

    // Advance the playerOrderCursor
    // No action needed if we're advancing turn due to a player disconnect
    this.advancePlayerTurn();

    this.currWord = this.drawCard();
    this.state = AWPGame.STATE_ENTERING_CLUES;

    this.broadcastGameDataToPlayers();
  }

  handlePlayerAction(playerId, data) {
    switch (data.action) {
      case 'submitClue':
        return this.receiveClue(playerId, data.clue);
      case 'revealClues':
        return this.revealCluesToGuesser();
      case 'submitGuess':
        return this.receiveGuess(data.guess);
      case 'skipTurn':
        return this.skipTurn();
      default:
        throw new Error(`Unexpected action ${data.action}`);
    }
  }

  receiveClue(playerId, submittedClue) {
    const clue = submittedClue.substring(0, AWPGame.MAX_WORD_LENGTH);
    const formattedClue = clue.toLowerCase().replace(/\s/g, '');
    let isDuplicate = false;
    Object.keys(this.clues).forEach(playerId => {
      if (this.clues[playerId].clue.toLowerCase().replace(/\s/g, '') === formattedClue) {
        this.clues[playerId].isDuplicate = true;
        isDuplicate = true;
      }
    });
    this.clues[playerId] = {
      clue,
      isDuplicate,
    };

    this.broadcastGameDataToPlayers();

    setTimeout(() => this.checkIfAllCluesAreIn(), 500);
  }

  checkIfAllCluesAreIn() {
    if (Object.values(this.clues).length === this.getConnectedPlayers().length - 1) {
      this.revealCluesToClueGivers();
    }
  }

  revealCluesToClueGivers() {
    this.state = AWPGame.STATE_REVIEWING_CLUES;
    this.broadcastGameDataToPlayers();
  }

  revealCluesToGuesser() {
    this.state = AWPGame.STATE_ENTERING_GUESS;
    this.broadcastGameDataToPlayers();
  }

  receiveGuess(submittedGuess) {
    const guess = submittedGuess.substring(0, AWPGame.MAX_WORD_LENGTH);
    const formattedGuess = guess.toLowerCase().replace(/\s/g, '');
    this.currGuess = guess;
    const correctGuess = formattedGuess === this.currWord.toLowerCase().replace(/\s/g, '');

    if (correctGuess) {
      ++this.numPoints;
    } else {
      ++this.roundNum;
    }

    this.state = Game.STATE_TURN_END;
    this.broadcastGameDataToPlayers();
  }

  skipTurn() {
    this.skippedTurn = true;
    this.state = AWPGame.STATE_TURN_END;
    this.broadcastGameDataToPlayers();
  }

  endGame() {
    console.log('end game');
    this.state = Game.STATE_GAME_END;
    this.broadcastGameDataToPlayers();
  }

  // Send all players back to the lobby
  setPending() {
    this.state = Game.STATE_PENDING;
    this.players = {};
    this.broadcastGameDataToPlayers();
  }

  isRoundOver() {
    return this.state !== this.STATE_STARTED;
  }

  isGameOver() {
    return this.state === Game.STATE_GAME_END;
  }

  serialize() {
    const {
      clues,
      currGuess,
      currWord,
      numPoints,
      players,
      playerOrder,
      roundNum,
      skippedTurn,
      state,
    } = this;

    return {
      clues,
      currGuess,
      currWord,
      gameId: AWPGame.GAME_ID,
      guesserId: this.activePlayerId,
      numPoints,
      players,
      playerOrder,
      roundNum,
      skippedTurn,
      state,
      totalNumRounds: AWPGame.TOTAL_NUM_ROUNDS,
    };
  }
}

module.exports = AWPGame;
