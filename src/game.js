const _ = require('lodash');
const uuid = require('uuid');

const Player = require('./player');
const wordlist = require('./wordlist');

function Game({
  broadcastToRoom,
  broadcastSystemMessage,
  broadcastTo,
  users,
}) {
  this.broadcastToRoom = broadcastToRoom;
  this.broadcastSystemMessage = broadcastSystemMessage;
  this.broadcastTo = broadcastTo;
  this.users = users;
  this.clues = {};
  this.lexicon = [];
  this.lexiconCursor = 0;
  this.numPoints = 0;
  this.skippedTurn = false;
}

Game.STATE_PENDING = 0;
Game.STATE_ENTERING_CLUES = 1;
Game.STATE_REVIEWING_CLUES = 2;
Game.STATE_ENTERING_GUESS = 3;
Game.STATE_TURN_END = 4;
Game.STATE_GAME_END = 5;

Game.MIN_PLAYERS = 2;
Game.TOTAL_NUM_ROUNDS = 13;

Game.prototype = {
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
    this.playerOrder.splice(playerOrderIdx, 1);

    // Remove clue from clues
    delete this.clues[id];

    if (this.playerOrder.indexOf(id) < this.playerOrderCursor) {
      // If removing player ID 1 and player order is [1, 2, 3] with player order cursor at idx 2,
      // player order would become [2, 3], so we need to decrement the cursor or we get an out of
      // bounds error.
      --this.playerOrderCursor;
    }

    if (id === this.guesserId) {
      this.nextTurn(false);
    }

    this.broadcastGameDataToPlayers();
    this.checkIfAllCluesAreIn();
  },

  createLexicon: function() {
    this.lexicon = ['water', 'fire', 'earth', 'air'];
    //this.lexicon = _.shuffle(wordlist);
  },

  determinePlayerOrder: function() {
    const playerIds = this.getConnectedPlayers().map(player => player.id);
    this.playerOrder = _.shuffle(playerIds);

    // keeps track of whose turn it is.
    this.playerOrderCursor = 0;
  },

  nextTurn: function(shouldIncrementRound = true) {
    this.clues = {};
    this.currGuess = null;
    this.skippedTurn = false;

    if (shouldIncrementRound) {
      ++this.roundNum;
    }

    if (this.roundNum > Game.TOTAL_NUM_ROUNDS) {
      this.endGame();
      return;
    }

    // Advance the playerOrderCursor
    this.guesserId = this.playerOrder[this.playerOrderCursor];
    this.playerOrderCursor = (++this.playerOrderCursor) % this.getConnectedPlayers().length;

    this.currWord = this.lexicon[this.lexiconCursor];
    this.lexiconCursor = (++this.lexiconCursor) % this.lexicon.length;
    this.state = Game.STATE_ENTERING_CLUES;

    this.broadcastGameDataToPlayers();
  },

  receiveClue: function(playerId, submittedClue) {
    const clue = submittedClue.toLowerCase();
    let isDuplicate = false;
    Object.keys(this.clues).forEach(playerId => {
      if (this.clues[playerId].clue === clue) {
        this.clues[playerId].isDuplicate = true;
        isDuplicate = true;
      }
    });
    this.clues[playerId] = {
      clue,
      isDuplicate,
    };

    this.broadcastGameDataToPlayers();

    this.checkIfAllCluesAreIn();
  },

  checkIfAllCluesAreIn: function() {
    if (Object.values(this.clues).length === this.getConnectedPlayers().length - 1) {
      // All clues are in!
      setTimeout(() => this.revealCluesToClueGivers(), 500);
    }
  },

  revealCluesToClueGivers: function() {
    const DELAY_TIME = 5000;
    this.state = Game.STATE_REVIEWING_CLUES;
    this.broadcastGameDataToPlayers();
  },

  revealCluesToGuesser: function() {
    const DELAY_TIME = 5000;
    this.state = Game.STATE_ENTERING_GUESS;
    this.broadcastGameDataToPlayers();
  },

  receiveGuess: function(socketId, submittedGuess) {
    const DELAY_TIME = 5000;
    const guess = submittedGuess.toLowerCase();
    this.currGuess = guess;
    const correctGuess = guess === this.currWord.toLowerCase();

    if (correctGuess) {
      ++this.numPoints;
    } else {
      ++this.roundNum;
    }

    this.state = Game.STATE_TURN_END;
    this.broadcastGameDataToPlayers();
  },

  skipTurn: function() {
    this.skippedTurn = true;
    this.state = Game.STATE_TURN_END;
    this.broadcastGameDataToPlayers();
  },

  endRound: function() {
    this.state = this.STATE_ROUND_END;

    // Determine winner
    const roundWinners = this.determineRoundWinners();

    const roundEndMsg = `${roundWinners.map(winner => winner.name).join(' and ')} won the round!`;
    this.broadcastSystemMessage(roundEndMsg);

    const isGameOver = false;
    const gameWinners = roundWinners.filter(
      roundWinner => ++roundWinner.numTokens >= this.maxTokens
    );

    if (gameWinners.length > 0) {
      this.endGame(gameWinners);
      return;
    }

    this.broadcastGameDataToPlayers();
  },

  endGame: function(winners) {
    this.state = Game.STATE_GAME_END;
    this.broadcastGameDataToPlayers();
  },

  // Send all players back to the lobby
  setPending: function() {
    this.state = Game.STATE_PENDING;
    this.players = {};
    this.broadcastGameDataToPlayers();
  },

  isRoundOver: function() { return this.state !== this.STATE_STARTED; },

  isGameOver: function() { return this.state === Game.STATE_GAME_END; },

  emitSystemMessage: function(playerId, msg) {
    const messageObj = {
      id: uuid.v4(),
      text: msg,
      type: 'system',
    };
    this.broadcastTo(playerId, 'message', messageObj);
  },

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
      totalNumRounds: Game.TOTAL_NUM_ROUNDS,
    };
  },
}

module.exports = Game;
