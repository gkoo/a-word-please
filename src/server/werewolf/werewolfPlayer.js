const Player = require('../player');

class WerewolfPlayer extends Player {
  constructor({ id, name }) {
    super({ id, name });
  }

  setRole({ role, isOriginalRole }) {
    this.role = role;
    if (isOriginalRole) {
      this.originalRole = role;
    }
  }
}

module.exports = Player;
