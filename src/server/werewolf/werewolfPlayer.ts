import Player from '../player';
import { Role } from './werewolfGame';

class WerewolfPlayer extends Player {
  id: string;
  name: string;
  connected: boolean;
  lastKnownRole: Role;
  originalRole: Role;
  role: Role;

  constructor({ id, name }) {
    super({ id, name });
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

  serialize() {
    return {
      ...super.serialize(),
      lastKnownRole: this.lastKnownRole,
      role: this.role,
      originalRole: this.originalRole,
    }
  }
}

export default WerewolfPlayer;
