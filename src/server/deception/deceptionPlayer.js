const DeceptionGame = require('./DeceptionGame');
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

  isScientist() {
    return this.role === DeceptionGame.ROLE_SCIENTIST;
  }

  isMurderer() {
    return this.role === DeceptionGame.ROLE_MURDERER;
  }

  serialize() {
    return {
      ...super.serialize(),
      evidenceCards: this.evidenceCards,
      methodCards: this.methodCards,
      role: this.role,
    }
  }
}

module.exports = DeceptionPlayer;
