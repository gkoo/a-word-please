class Player {
  constructor({ id, name }) {
    this.id = id;
    this.name = name;
    this.connected = true;
  }

  serialize() {
    return {
      id: this.id,
      name: this.name,
    };
  }
}

module.exports = Player;
