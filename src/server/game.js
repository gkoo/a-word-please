const _ = require('lodash');

const Player = require('./player.js');

class Game {
  static GAME_A_WORD_PLEASE = 1;
  static GAME_WEREWOLF = 2;
  static GAME_WAVELENGTH = 3;
  static GAME_DECEPTION = 4;

  static STATE_PENDING = 0;
  static STATE_TURN_END = 1;
  static STATE_GAME_END = 2;

  constructor(io, roomCode) {
    this.io = io;
    this.roomCode = roomCode;
    this.deckCursor = 0;
    this.players = {};
    this.playerClass = Player;
  }

  broadcastToRoom(eventName, data) {
    this.io.to(this.roomCode).emit(eventName, data);
  }

  broadcastGameDataToPlayers() {
    this.broadcastToRoom('gameData', this.serialize());
  }

  setup(users) {
    const playerUsers = Object.values(users).filter(user => !user.isSpectator);
    playerUsers.forEach(user => this.addPlayer(user));
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

  maybeReconnect(user, originalSocketId) {
    // Look for the player based on their socketId.
    const player = Object.values(this.players).find(p => p.socketId === originalSocketId);

    // In case a game started while the player was reconnecting
    if (!player) {
      if (user.name) {
        // Only add user to the game if they have a name
        this.addPlayer(user);
      }
      return;
    }

    // There was a player here before. Let's restore her.
    player.socketId = user.socketId;
    player.connected = true;
    broadcastGameDataToPlayers();
  }

  newGame() {
    throw new Error('newGame not implemented!');
  }

  // Players will start off with an id equal to their socket.id. However, this won't necessarily
  // always be the case. If there is a temporary disconnect and the player reconnects, we will
  // attempt to reconnect them to the same ID that they had before, but using their new socket.id
  // value for communication.
  addPlayer({ id, name }) {
    if (!name) { return; }

    this.players[id] = new this.playerClass({
      id,
      name,
      socketId: id,
    });
  }

  removePlayer(id) {
    if (this.players[id]) { this.players[id].connected = false; }
  }

  handlePlayerAction() {
    throw new Error('handlePlayerAction not implemented!');
  }

  endGame() {
    this.state = Game.STATE_GAME_END;
    this.broadcastGameDataToPlayers();
  }

  setPending() {
    throw new Error('setPending not implemented!');
  }

  serialize() {
    throw new Error('serialize not implemented!');
  }
}

module.exports = Game;
