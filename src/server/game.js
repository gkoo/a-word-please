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
    throw new Error('newGame not implemented!');
  }

  addPlayer() {
    throw new Error('removePlayer not implemented!');
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
