const Player = require('./Player');
function Room() {
  this.players = {};
  this.messages = ['here are', 'your first', 'messages'];

  this.addPlayer = (id) => {
    const player = new Player(id);
    this.players[id] = player;
  };

  this.removePlayer = id => {
    delete this.players[id];
  };

  this.setPlayerName = (id, name) => {
    this.players[id].setName(name);
  };

  this.handleMessage = msg => {
    this.messages.push(msg);
  };
}

module.exports = Room;
