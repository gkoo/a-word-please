import _ from 'lodash';
import uuid from 'uuid';

import Player from './player.js';
import wordlist from './wordlist.js';

function AWPGame({
  broadcastToRoom,
  users,
}) {
  this.broadcastToRoom = broadcastToRoom;
  this.users = users;
  this.clues = {};
  this.lexicon = [];
  this.lexiconCursor = 0;
  this.numPoints = 0;
  this.skippedTurn = false;
}

AWPGame.STATE_PENDING = 0;
AWPGame.STATE_ENTERING_CLUES = 1;
AWPGame.STATE_REVIEWING_CLUES = 2;
AWPGame.STATE_ENTERING_GUESS = 3;
AWPGame.STATE_TURN_END = 4;
AWPGame.STATE_GAME_END = 5;

AWPGame.MAX_WORD_LENGTH = 20;
AWPGame.MIN_PLAYERS = 2;
AWPGame.TOTAL_NUM_ROUNDS = 13;

AWPGame.prototype = {
  setup: function(users) {
    const userList = Object.values(users);
    this.players = {};

    userList.forEach(user => this.addPlayer(user));
    this.createLexicon();
    this.determinePlayerOrder();
    this.newGame();
  },

  newGame: function() {
    this.roundNum = 0;
    this.numPoints = 0;
    this.nextTurn();
  },

  addPlayer: function(user) {
    const { id, name } = user;

    if (!name) { return; }

    this.players[user.id] = new Player({
      id,
      name,
    });

    if (this.playerOrder) {
      this.playerOrder.push(user.id);
    }
  },

  getConnectedPlayers: function() {
    return Object.values(this.players).filter(player => player.connected);
  },

  removePlayer: function(id) {
    if (this.players[id]) { this.players[id].connected = false; }

    // Remove from player order
    const playerOrderIdx = this.playerOrder.indexOf(id);

    // For some reason, players get disconnected without being in the game
    if (playerOrderIdx >= 0) {
      this.playerOrder.splice(playerOrderIdx, 1);
    }

    // Remove clue from clues
    if (this.clues[id]) { delete this.clues[id]; }

    if (id === this.guesserId) {
      this.guesserId = this.playerOrder[playerOrderIdx % this.playerOrder.length];
      this.nextTurn(false);
    }

    this.broadcastGameDataToPlayers();

    if (this.state === AWPGame.STATE_ENTERING_CLUES) {
      // TODO: unmark duplicates
      this.checkIfAllCluesAreIn();
    }
  },

  createLexicon: function() {
    //this.lexicon = ['water', 'fire', 'earth', 'air'];
    this.lexicon = _.shuffle(wordlist);
  },

  determinePlayerOrder: function() {
    const playerIds = this.getConnectedPlayers().map(player => player.id);
    this.playerOrder = _.shuffle(playerIds);

    this.guesserId = this.playerOrder[0];
  },

  nextTurn: function(shouldIncrementRound = true) {
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
    if (shouldIncrementRound) {
      const playerOrderIdx = this.playerOrder.indexOf(this.guesserId);
      this.guesserId = this.playerOrder[(playerOrderIdx + 1) % this.playerOrder.length]
    }

    this.currWord = this.lexicon[this.lexiconCursor];
    this.lexiconCursor = (++this.lexiconCursor) % this.lexicon.length;
    this.state = AWPGame.STATE_ENTERING_CLUES;

    this.broadcastGameDataToPlayers();
  },

  receiveClue: function(playerId, submittedClue) {
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
  },

  checkIfAllCluesAreIn: function() {
    if (Object.values(this.clues).length === this.getConnectedPlayers().length - 1) {
      this.revealCluesToClueGivers();
    }
  },

  revealCluesToClueGivers: function() {
    this.state = AWPGame.STATE_REVIEWING_CLUES;
    this.broadcastGameDataToPlayers();
  },

  revealCluesToGuesser: function() {
    this.state = AWPGame.STATE_ENTERING_GUESS;
    this.broadcastGameDataToPlayers();
  },

  receiveGuess: function(socketId, submittedGuess) {
    const guess = submittedGuess.substring(0, AWPGame.MAX_WORD_LENGTH);
    const formattedGuess = guess.toLowerCase().replace(/\s/g, '');
    this.currGuess = guess;
    const correctGuess = formattedGuess === this.currWord.toLowerCase().replace(/\s/g, '');

    if (correctGuess) {
      ++this.numPoints;
    } else {
      ++this.roundNum;
    }

    this.state = AWPGame.STATE_TURN_END;
    this.broadcastGameDataToPlayers();
  },

  skipTurn: function() {
    this.skippedTurn = true;
    this.state = AWPGame.STATE_TURN_END;
    this.broadcastGameDataToPlayers();
  },

  endGame: function() {
    this.state = AWPGame.STATE_GAME_END;
    this.broadcastGameDataToPlayers();
  },

  // Send all players back to the lobby
  setPending: function() {
    this.state = AWPGame.STATE_PENDING;
    this.players = {};
    this.broadcastGameDataToPlayers();
  },

  isRoundOver: function() { return this.state !== this.STATE_STARTED; },

  isGameOver: function() { return this.state === AWPGame.STATE_GAME_END; },

  broadcastGameDataToPlayers: function() {
    this.broadcastToRoom('gameData', this.serialize());
  },

  serialize: function() {
    const {
      clues,
      currGuess,
      currWord,
      guesserId,
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
      guesserId,
      numPoints,
      players,
      playerOrder,
      roundNum,
      skippedTurn,
      state,
      totalNumRounds: AWPGame.TOTAL_NUM_ROUNDS,
    };
  },
}

export default AWPGame;