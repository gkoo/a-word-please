const Game = require('../game');

class WerewolfGame extends Game {
  static GAME_ID = Game.GAME_WEREWOLF;
  static STATE_CHOOSING_ROLES = 3;
  static STATE_NIGHTTIME_ACTIONS = 4;
  static STATE_DAYTIME_ACTIONS = 5;
  static STATE_VOTING = 6;

  static MIN_PLAYERS = 3;
  static MAX_PLAYERS = 10;

  constructor(io, roomCode) {
    super(io, roomCode);
  }

  setup(users) {
    super.setup(users);
    this.newGame();
  }

  newGame() {
    this.state = WerewolfGame.STATE_CHOOSING_ROLES;
    this.broadcastGameDataToPlayers();
  }

  addPlayer() {
  }

  removePlayer() {
  }

  endGame() {
  }

  setPending() {
  }

  serialize() {
    return {
      gameId: WerewolfGame.GAME_ID,
      players: this.players,
      state: this.state,
    }
  }
}

module.exports = WerewolfGame;
