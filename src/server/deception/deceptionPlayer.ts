import Clue from './clue';
import Player from '../player';
import { Role } from './deceptionGame';

class DeceptionPlayer extends Player {
  evidenceCards: Array<Clue>;
  methodCards: Array<Clue>;
  role: Role

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
      evidenceCards: this.evidenceCards,
      methodCards: this.methodCards,
      role: this.role,
    }
  }
}

export default DeceptionPlayer;
