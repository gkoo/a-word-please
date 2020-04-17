const Player = require('./Player');
function Room() {
  const players = {};
  const messages = ['here are', 'your first', 'messages'];

  this.addPlayer = (id) => {
    const player = new Player(id);
    players[id] = player;
  };

  this.removePlayer = id => {
    delete players[id];
  };

  this.setPlayerName = (id, name) => {
    players[id].setName(name);
  };
}

module.exports = Room;
