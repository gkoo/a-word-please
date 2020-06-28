const _ = require('lodash');

class Game {
  static GAME_A_WORD_PLEASE = 1;
  static GAME_WEREWOLF = 2;
  static GAME_WAVELENGTH = 3;

  static STATE_PENDING = 0;
  static STATE_TURN_END = 1;
  static STATE_GAME_END = 2;

  constructor(io, roomCode) {
    this.io = io;
    this.roomCode = roomCode;
    this.deckCursor = 0;
    this.players = {};
  }

  broadcastToRoom(eventName, data) {
    this.io.to(this.roomCode).emit(eventName, data);
  }

  broadcastGameDataToPlayers() {
    this.broadcastToRoom('gameData', this.serialize());
  }

  setup(users) {
    Object.values(users).forEach(user => this.addPlayer(user));
  }

  getConnectedPlayers() {
    return Object.values(this.players).filter(player => player.connected);
  }

  determinePlayerOrder() {
    const playerIds = this.getConnectedPlayers().map(player => player.id);
    this.playerOrder = _.shuffle(playerIds);
    this.activePlayerId = this.playerOrder[0];
  }

  advancePlayerTurn() {
    if (this.activePlayerId && this.playerOrder) {
      const playerOrderIdx = this.playerOrder.indexOf(this.activePlayerId);
      this.activePlayerId = this.playerOrder[(playerOrderIdx + 1) % this.playerOrder.length]
    }
  }

  createDeck(cards) {
    this.deck = _.shuffle(cards);
  }

  drawCard() {
    const currCard = this.deck[this.deckCursor];
    this.deckCursor = (++this.deckCursor) % this.deck.length;
    return currCard;
  }

  newGame() {
    throw new Error('newGame not implemented!');
  }

  addPlayer(user) {
    throw new Error('addPlayer not implemented!');
  }

  removePlayer() {
    throw new Error('removePlayer not implemented!');
  }

  handlePlayerAction() {
    throw new Error('handlePlayerAction not implemented!');
  }

  endGame() {
    throw new Error('endGame not implemented!');
  }

  setPending() {
    throw new Error('setPending not implemented!');
  }

  serialize() {
    throw new Error('serialize not implemented!');
  }
}

module.exports = Game;
