import 'Game' from '../game';

class WerewolfGame extends Game {
  constructor({ broadcastToRoom, users }) {
    this.broadcastToRoom = broadcastToRoom;
    this.users = users;
  }

  setup() {
    super();
  }

  newGame() {
  }
}

export default WerewolfGame;
