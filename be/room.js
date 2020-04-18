const Player = require('./Player');
function Room() {
  this.players = {};
  this.messages = ['here are', 'your first', 'messages'];

  this.addPlayer = (id) => {
    const player = new Player(id);
    this.players[id] = player;
    if (this.getPlayers().length === 1) {
      this.promoteRandomLeader();
    }
  };

  this.removePlayer = id => {
    const player = this.players[id];
    delete this.players[id];
    if (player.isLeader) {
      this.promoteRandomLeader();
    }
  };

  this.promoteRandomLeader = () => {
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

  this.setPlayerName = (id, name) => {
    this.players[id].setName(name);
  };

  this.handleMessage = msg => {
    this.messages.push(msg);
  };

  // returns an array of players
  this.getPlayers = () => Object.values(this.players);
}

module.exports = Room;
