function Player({ id, name }) {
  this.id = id;
  this.name = name;
  this.connected = true;
}

Player.prototype = {
  serialize: function ({ includeHand }) {
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

export default Player;
