function User({ id, name }) {
  this.id = id;
  this.name = name;
  this.isLeader = false;
  this.connected = true;
  this.isSpectator = false;

  this.setName = name => {
    this.name = name;
  };

  this.promoteToLeader = () => {
    this.isLeader = true;
  };

  this.unpromoteFromLeader = () => {
    this.isLeader = false;
  };

  this.setSpectator = () => {
    this.isSpectator = true;
  };

  this.serialize = () => {
    return {
      id: this.id,
      isLeader: this.isLeader,
      isSpectator: this.isSpectator,
      name: this.name,
      connected: this.connected,
    };
  };
}

module.exports = User;
