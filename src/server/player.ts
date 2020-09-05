class Player {
  id: string;
  name: string;
  connected: boolean;
  socketId: string;

  constructor({ id, name, socketId }) {
    this.id = id;
    this.name = name;
    this.connected = true;
    this.socketId = socketId;
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
