class Player {
  id: string;
  name: string;
  connected: boolean;
  isSpectator: boolean;

  constructor({ id, name, isSpectator = false }) {
    this.id = id;
    this.name = name;
    this.connected = true;
    this.isSpectator = isSpectator;
  }

  serialize() {
    return {
      id: this.id,
      name: this.name,
      connected: this.connected,
    };
  }
}

export default Player;
