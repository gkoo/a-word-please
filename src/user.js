function User({ id, name }) {
  this.id = id;
  this.name = name;
  this.isLeader = false;

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
    const { id, isLeader, name } = this;
    return {
      id,
      isLeader,
      name,
    };
  }
}

module.exports = User;
