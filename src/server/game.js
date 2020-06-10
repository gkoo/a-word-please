class Game {
  static GAME_A_WORD_PLEASE = 1;
  static GAME_WEREWOLF = 2;

  static STATE_PENDING = 0;
  static STATE_TURN_END = 1;
  static STATE_GAME_END = 2;

  constructor(io, roomCode) {
    this.io = io;
    this.roomCode = roomCode;
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

  newGame() {
    throw 'newGame not implemented!';
  }

  addPlayer() {
    throw 'removePlayer not implemented!';
  }

  removePlayer() {
    throw 'removePlayer not implemented!';
  }

  endGame() {
    throw 'endGame not implemented!';
  }

  setPending() {
    throw 'setPending not implemented!';
  }

  serialize() {
    throw 'serialize not implemented!';
  }
}

module.exports = Game;
