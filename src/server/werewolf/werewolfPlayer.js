const Player = require('../player');

class WerewolfPlayer extends Player {
  constructor({ id, name }) {
    super({ id, name });
  }

  setRole({ role, isOriginalRole }) {
    this.role = role;
    this.lastKnownRole = role;
    if (isOriginalRole) {
      this.originalRole = role;
    }
  }

  setLastKnownRole(role) {
    this.lastKnownRole = role;
  }

  serialize() = {
    return {
      ...super.serialize(),
      lastKnownRole: this.lastKnownRole,
      role: this.role,
      originalRole: this.originalRole,
    }
  }
}

module.exports = Player;
