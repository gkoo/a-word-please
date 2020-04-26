function User(id) {
  this.id = id;
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
