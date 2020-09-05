import Player from '../player';
import { Role } from './werewolfGame';

class WerewolfPlayer extends Player {
  id: string;
  name: string;
  connected: boolean;
  lastKnownRole: Role;
  originalRole: Role;
  playing: boolean; // TODO remove
  role: Role;

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

export default WerewolfPlayer;
