const Player = require('../player');

class DeceptionPlayer extends Player {
  constructor(data) {
    super(data)
    this.evidenceCards = [];
    this.methodCards = [];
  }

  setRole(role) {
    this.role = role;
  }

  serialize() {
    return {
      ...super.serialize(),
      role: this.role,
    }
  }
}

module.exports = DeceptionPlayer;
