import AWPGame from './a-word-please/awp-game';
import DeceptionGame from './deception/deceptionGame';
import Game, { GameEnum } from './game';
import SfArtistGame from './sf-artist/sfArtistGame';
import WerewolfGame from './werewolf/werewolfGame';
import WavelengthGame from './wavelength/wavelengthGame';
import User from './user';

const VALID_GAMES: Array<number> = [
  GameEnum.AWordPlease,
  GameEnum.Werewolf,
  GameEnum.Wavelength,
  GameEnum.Deception,
  GameEnum.SfArtist,
];

enum RoomState {
  Lobby = 1,
  Game,
}

class Room {
  broadcastToRoom: (eventName: string, data: any) => void;
  io: SocketIO.Server;
  game: Game;
  roomCode: string;
  selectedGame: number;
  state: RoomState;
  users: { [id: string]: User };

  constructor({ io, roomCode }) {
    this.broadcastToRoom = (eventName, data) => io.to(roomCode).emit(eventName, data);
    this.io = io;
    this.roomCode = roomCode;
    this.selectedGame = null;
    this.state = RoomState.Lobby;
    this.users = {};
  }

  getUserById(id) { return this.users[id]; }

  addUser({ socket, originalSocketId, name }) {
    const { id } = socket;
    const existingUser = this.users[originalSocketId];
    let user: User;

    if (!existingUser) {
      user = new User({ id, name });
    } else {
      // we are reconnecting
      user = existingUser;
      user.id = id;
      delete this.users[originalSocketId];
    }

    if (this.game) {
      this.game.maybeReconnect(user, originalSocketId);
    }

    user.connected = true;
    this.users[id] = user;

    if (this.getUsers().length === 1) {
      this.promoteRandomLeader();
    }
    this.broadcastRoomData();
    return user;
  }

  onUserDisconnect(id) {
    const user = this.users[id];

    this.users[id].connected = false;
    if (user.isLeader) {
      this.promoteRandomLeader();
    }
    if (this.game) {
      this.game.disconnectPlayer(id);
      // Clean up game if no players left
      const connectedPlayer = Object.values(this.game.players).find(player => player.connected);
      if (!connectedPlayer) { this.game = null; }
    }
    this.broadcastToRoom('userDisconnect', id);
  }

  promoteRandomLeader() {
    const users = this.getUsers().filter(user => user.connected);

    if (users.length === 0) { return; }

    const newLeader = users[0];
    newLeader.promoteToLeader();
    for (let i = 1; i < users.length; ++i) {
      users[i].unpromoteFromLeader();
    }
    this.broadcastToRoom('newLeader', newLeader.id);
  }

  getLeader() { return Object.values(this.users).find(user => user.isLeader); }

  setUserName(id, name, isSpectator) {
    const user = this.users[id];
    user.setName(name);
    if (isSpectator) {
      user.setSpectator();
    }
    this.broadcastToRoom('newUser', user.serialize());

    if (!this.game) { return; }
    if (!isSpectator) { this.game.addPlayer(user); }

    this.broadcastToRoom('gameData', this.game.serialize());
  }

  // returns an array of users
  getUsers() { return Object.values(this.users); }

  chooseGame(gameId) {
    if (!VALID_GAMES.includes(gameId)) { return; }
    this.selectedGame = gameId;
    this.broadcastToRoom('roomData', this.getRoomData());
  }

  startGame() {
    const { io } = this;
    if (!this.selectedGame) { return; }

    this.state = RoomState.Game;

    const roomData = this.getRoomData();
    this.io.to(this.roomCode).emit('roomData', roomData)

    if (this.game) {
      this.game.newGame();
      return;
    }

    switch (this.selectedGame) {
      case GameEnum.AWordPlease:
        this.game = new AWPGame(this.broadcastToRoom);
        break;
      case GameEnum.Werewolf:
        this.game = new WerewolfGame(this.broadcastToRoom);
        break;
      case GameEnum.Wavelength:
        this.game = new WavelengthGame(
          this.broadcastToRoom,
          (playerId: string, eventName: string, data: any) => {
            this.emitToPlayer(playerId, eventName, data);
          }
        );
        break;
      case GameEnum.Deception:
        this.game = new DeceptionGame(this.broadcastToRoom);
        break;
      case GameEnum.SfArtist:
        this.game = new SfArtistGame(this.broadcastToRoom, this.roomCode);
        break;
      default:
        throw 'Unrecognized game type chosen';
    }
    this.game.setup(this.users);
  }

  nextTurn() {
    if (!this.game) { return false; }
    this.game.nextTurn();
  }

  handlePlayerAction(socket: SocketIO.Socket, data) {
    if (!this.game) { return; }
    if (data.action === 'backToLobby') {
      this.backToLobby();
      return;
    }
    this.game.handlePlayerAction(socket, data);
  }

  endGame() {
    if (!this.game) { return; }
    this.game.endGame();
  }

  backToLobby() {
    this.state = RoomState.Lobby;
    this.game = null;
    this.broadcastToRoom('roomData', this.getRoomData());
  }

  getRoomData() {
    const users = {};
    const { roomCode, state, selectedGame } = this;
    Object.values(this.users).forEach(user => {
      if (user) {
        users[user.id] = user.serialize();
      }
    });
    return {
      roomCode,
      state,
      selectedGame,
      users,
    };
  }

  broadcastRoomData() {
    const roomData = this.getRoomData();
    this.io.to(this.roomCode).emit('roomData', roomData);

    let gameData = this.game ? this.game.serialize() : { state: Game.STATE_PENDING };
    this.io.to(this.roomCode).emit('gameData', gameData)
  }

  emitToPlayer(playerId: string, eventName: string, data: any) {
    this.io.to(playerId).emit(eventName, data);
  }

  sendGameState(socketId) {
    if (this.game) {
      this.io.to(socketId).emit('debugInfo', this.game.serialize())
    }
  }
}

export default Room;
