function Player(id) {
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
}

module.exports = Player;
