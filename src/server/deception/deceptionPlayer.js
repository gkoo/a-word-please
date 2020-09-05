import Player from '../player';

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
      evidenceCards: this.evidenceCards,
      methodCards: this.methodCards,
      role: this.role,
    }
  }
}

export default DeceptionPlayer;
