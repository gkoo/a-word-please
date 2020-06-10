function Player({ id, name }) {
  this.id = id;
  this.name = name;
  this.connected = true;
}

Player.prototype = {
  serialize: function () {
    const {
      id,
      name,
    } = this;

    return {
      id,
      name,
    }
  },
}

module.exports = Player;
