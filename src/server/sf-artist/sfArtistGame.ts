import Game, { GameEnum } from '../game';

class SfArtistGame extends Game {
  allStrokes: Array<object>;
  roomCode: string;

  constructor(broadcastToRoom, roomCode) {
    super(broadcastToRoom);
    this.roomCode = roomCode;
  }

  setup(users) {
    super.setup(users);
    this.newGame();
    this.allStrokes = [];
  }

  newGame() {
    this.broadcastGameDataToPlayers();
  }

  handlePlayerAction(socket: SocketIO.Socket, data: { [key: string]: any }) {
    switch (data.action) {
      case 'newStroke':
        return this.newStroke(socket, data);
      default:
        throw new Error(`Unrecognized player action: ${data.action}!`);
    }
  }

  newStroke(socket: SocketIO.Socket, data: any) {
    const playerId = socket.id;

    if (playerId !== this.activePlayerId) {
      // TODO
    }

    this.allStrokes.push(data.path);
    socket.to(this.roomCode).emit('newStroke', data.path);
  }

  nextTurn() {
  }

  serialize() {
    return {
      gameId: GameEnum.SfArtist,
    };
  }
}

export default SfArtistGame;
