class Player {
  constructor({ id, name, socketId }) {
    this.id = id;
    this.name = name;
    this.connected = true;
    this.socketId = socketId;
  }

  serialize() {
    return {
      id: this.id,
      name: this.name,
    };
  }
}

module.exports = Player;
