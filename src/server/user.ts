class User {
  id: string;
  name: string;
  isLeader: boolean;
  connected: boolean;
  isSpectator: boolean;

  constructor({ id, name }: { id: string, name: string }) {
    this.id = id;
    this.name = name;
    this.isLeader = false;
    this.connected = true;
    this.isSpectator = false;
  }

  setName(name: string) {
    this.name = name;
  }

  promoteToLeader() {
    this.isLeader = true;
  }

  unpromoteFromLeader() {
    this.isLeader = false;
  }

  setSpectator() {
    this.isSpectator = true;
  }

  serialize() {
    return {
      id: this.id,
      isLeader: this.isLeader,
      isSpectator: this.isSpectator,
      name: this.name,
      connected: this.connected,
    };
  }
}

module.exports = User;
