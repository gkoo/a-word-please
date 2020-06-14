const Player = require('../player');

class WerewolfPlayer extends Player {
  constructor({ id, name }) {
    super({ id, name });
    this.playing = false;
  }

  setRole({ role, isOriginalRole }) {
    this.role = role;
    if (isOriginalRole) {
      this.originalRole = role;
      this.lastKnownRole = role;
    }
  }

  setLastKnownRole(role) {
    this.lastKnownRole = role;
  }

  // Distinguishes active players from spectators
  setPlaying() {
    this.playing = true;
  }

  serialize() {
    return {
      ...super.serialize(),
      lastKnownRole: this.lastKnownRole,
      playing: this.playing,
      role: this.role,
      originalRole: this.originalRole,
    }
  }
}

module.exports = WerewolfPlayer;
