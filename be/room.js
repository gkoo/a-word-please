const Game = require('./Game');
const Player = require('./Player');

function Room() {
  this.players = {};
  this.messages = ['here are', 'your first', 'messages'];

  this.getPlayerById = id => this.players[id];

  this.addPlayer = id => {
    const player = new Player(id);
    this.players[id] = player;
    if (this.getPlayers().length === 1) {
      promoteRandomLeader();
    }
  };

  this.removePlayer = id => {
    const player = this.players[id];
    delete this.players[id];
    if (player.isLeader) {
      promoteRandomLeader();
    }
  };

  const promoteRandomLeader = () => {
    const players = this.getPlayers();

    if (players.length === 0) {
      return;
    }

    players[0].promoteToLeader();
    console.log(`${players[0].name || players[0].id} is the new leader`);
    for (let i = 1; i < players.length; ++i) {
      players[i].unpromoteFromLeader();
    }
  }

  this.setPlayerName = (id, name) => this.players[id].setName(name);

  this.handleMessage = msg => {
    this.messages.push(msg);
  };

  // returns an array of players
  this.getPlayers = () => Object.values(this.players);

  this.startGame = (gameInitiatorId) => {
    const playerIds = this.getPlayers().map(player => player.id);
    if (!this.playerIsLeader(gameInitiatorId)) { return; }
    this.game = new Game({ playerIds });
    this.game.setup();

    const gameDataForPlayers = {};
    playerIds.forEach(playerId => {
      gameDataForPlayers[playerId] = this.game.serializeForPlayer(playerId);
    });

    return gameDataForPlayers;
  };

  this.endGame = (gameInitiatorId) => {
    if (!this.playerIsLeader(gameInitiatorId)) { return false; }
    if (!this.game) { return false; }
    this.game.end();
    return true;
  }

  this.playerIsLeader = (playerId) => {
    const player = this.getPlayerById(playerId);
    return player.isLeader;
  };
}

module.exports = Room;
