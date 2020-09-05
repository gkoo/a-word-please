class Player {
  id: string;
  name: string;
  connected: boolean;

  constructor({ id, name }) {
    this.id = id;
    this.name = name;
    this.connected = true;
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
