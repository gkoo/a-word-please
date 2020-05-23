const _ = require('lodash');
const uuid = require('uuid');

const Player = require('./player');

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
}

Game.prototype = {
  STATE_PENDING: 0,
  STATE_STARTED: 1,
  STATE_ENTERING_CLUES: 2,
  STATE_REVIEWING_CLUES: 3,
  STATE_ENTERING_GUESS: 4,
  STATE_ROUND_END: 5,
  STATE_GAME_END: 6,

  MIN_PLAYERS: 2,
  MAX_PLAYERS: 4,

  setup: function(users) {
    const userList = Object.values(users);
    this.state = this.STATE_STARTED;
    this.players = {};

    userList.forEach(user => {
      const player = new Player({ id: user.id, name: user.name });
      this.players[user.id] = player;
    });
    this.roundNum = 0;
    this.createLexicon();
    this.determinePlayerOrder();
    this.state = this.STATE_STARTED;
    this.broadcastSystemMessage('Game has started!');
    this.nextTurn();
    this.broadcastGameDataToPlayers();
  },

  getPlayers: function() {
    return Object.values(this.players);
  },

  removeUser: function(id) {
    if (this.players[id]) { this.players[id].connected = false; }
  },

  // TODO: IMPLEMENT
  createLexicon: function() {
    this.lexicon = ['water', 'fire', 'earth', 'air'];
  },

  determinePlayerOrder: function() {
    const playerIds = this.getPlayers().map(player => player.id);
    this.playerOrder = _.shuffle(playerIds);

    // keeps track of whose turn it is.
    this.playerOrderCursor = 0;
  },

  nextTurn: function() {
    if (this.state !== this.STATE_STARTED) { return; }

    this.clues = {};
    this.revealTo = null;

    ++this.roundNum;

    // Advance the playerOrderCursor
    this.guesserId = this.playerOrder[this.playerOrderCursor];
    this.playerOrderCursor = (++this.playerOrderCursor) % this.getPlayers().length;

    this.currWord = this.lexicon[this.lexiconCursor++];
    this.state = this.STATE_ENTERING_CLUES;

    this.broadcastGameDataToPlayers();
  },

  receiveClue: function(playerId, submittedClue) {
    const isDuplicate = false;
    Object.keys(this.clues).forEach(playerId => {
      if (this.clues[playerId].clue === submittedClue) {
        this.clues[playerId].isDuplicate = true;
        isDuplicate = true;
      }
    });
    this.clues[playerId] = {
      clue: submittedClue,
      isDuplicate,
    };

    this.broadcastGameDataToPlayers();

    if (Object.values(this.clues).length === this.getPlayers().length - 1) {
      // All clues are in!
      setTimeout(() => this.revealCluesToClueGivers(), 500);
    }
  },

  revealCluesToClueGivers: function() {
    const DELAY_TIME = 5000;
    this.state = this.STATE_REVIEWING_CLUES;
    this.broadcastGameDataToPlayers();
    setTimeout(() => this.revealCluesToGuesser(), DELAY_TIME);
  },

  revealCluesToGuesser: function() {
    const DELAY_TIME = 5000;
    this.revealTo = 'guesser';
    this.state = this.STATE_ENTERING_GUESS;
    this.broadcastGameDataToPlayers();
  },

  receiveGuess: function(socketId, guess) {
    if (guess.toLowerCase() === this.currWord.toLowerCase()) {
      // Correct guess
    }
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
    console.log('end game');
    this.broadcastSystemMessage('Game is over!');
    this.state = this.STATE_GAME_END;

    this.broadcastGameDataToPlayers();
  },

  // Send all players back to the lobby
  setPending: function() {
    this.state = this.STATE_PENDING;
    this.players = {};
    this.broadcastGameDataToPlayers();
  },

  isRoundOver: function() { return this.state !== this.STATE_STARTED; },

  isGameOver: function() { return this.state === this.STATE_GAME_END; },

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
      guesserId,
      currWord,
      players,
      revealTo,
      roundNum,
      state
    } = this;

    return {
      clues,
      guesserId,
      currWord,
      players,
      revealTo,
      roundNum,
      state
    };
  },
}

module.exports = Game;
