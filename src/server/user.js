function User({ id, name }) {
  this.id = id;
  this.name = name;
  this.isLeader = false;
  this.connected = true;

  this.setName = name => {
    this.name = name;
  };

  this.promoteToLeader = () => {
    this.isLeader = true;
  };

  this.unpromoteFromLeader = () => {
    this.isLeader = false;
  }

  this.serialize = () => {
    const { id, connected, isLeader, name } = this;
    return {
      id,
      isLeader,
      name,
      connected,
    };
  }
}

module.exports = User;
