class Game {
  constructor(io, roomCode) {
    this.io = io;
    this.roomCode = roomCode;
    this.players = {};
  }

  broadcastToRoom(eventName, data) {
    this.io.to(this.roomCode).emit(eventName, data);
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
