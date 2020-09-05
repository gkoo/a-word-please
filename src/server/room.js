const AWPGame = require('./a-word-please/awp-game.js');
const DeceptionGame = require('./deception/deceptionGame.js');
const Game = require('./game.js');
const WerewolfGame = require('./werewolf/werewolfGame.js');
const WavelengthGame = require('./wavelength/wavelengthGame.js');
const User = require('./user.js');

const VALID_GAMES = [
  Game.GAME_A_WORD_PLEASE,
  Game.GAME_WEREWOLF,
  Game.GAME_WAVELENGTH,
  Game.GAME_DECEPTION,
];

const STATE_LOBBY = 1;
const STATE_GAME = 2;

function Room({ io, roomCode }) {
  this.broadcastToRoom = (eventName, data) => io.to(roomCode).emit(eventName, data);
  this.io = io;
  this.roomCode = roomCode;
  this.selectedGame = null;
  this.state = STATE_LOBBY;
  this.users = {};
}

Room.prototype = {
  getUserById: function(id) { return this.users[id]; },

  addUser: function({ socket, originalSocketId, name }) {
    const { id } = socket;
    const existingUser = this.users[originalSocketId];
    let user;

    if (!existingUser) {
      user = new User({ id, name });
    } else {
      // we are reconnecting
      user = existingUser;
      user.id = id;
      delete this.users[originalSocketId];

      if (this.game) {
        this.game.maybeReconnect(user, originalSocketId);
      }
    }
    user.connected = true;
    this.users[id] = user;

    if (this.getUsers().length === 1) {
      this.promoteRandomLeader();
    }
    this.broadcastRoomData();
    return user;
  },

  onUserDisconnect: function(id) {
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
  },

  promoteRandomLeader: function() {
    const users = this.getUsers();

    if (users.length === 0) { return; }

    const newLeader = users[0];
    newLeader.promoteToLeader();
    for (let i = 1; i < users.length; ++i) {
      users[i].unpromoteFromLeader();
    }
    this.broadcastToRoom('newLeader', newLeader.id);
  },

  getLeader: function() { return Object.values(this.users).find(user => user.isLeader); },

  setUserName: function(id, name, isSpectator) {
    const user = this.users[id];
    user.setName(name);
    if (isSpectator) {
      user.setSpectator();
    }
    this.broadcastToRoom('newUser', user.serialize());

    if (!this.game) { return; }
    if (!isSpectator) { this.game.addPlayer(user); }

    this.broadcastToRoom('gameData', this.game.serialize());
  },

  // returns an array of users
  getUsers: function() { return Object.values(this.users); },

  chooseGame: function(gameId) {
    if (!VALID_GAMES.includes(gameId)) { return; }
    this.selectedGame = gameId;
    this.broadcastToRoom('roomData', this.getRoomData());
  },

  startGame: function() {
    const { io } = this;
    if (!this.selectedGame) { return; }

    this.state = STATE_GAME;

    const roomData = this.getRoomData();
    this.io.to(this.roomCode).emit('roomData', roomData)

    if (this.game) {
      this.game.newGame();
      return;
    }

    switch (this.selectedGame) {
      case Game.GAME_A_WORD_PLEASE:
        this.game = new AWPGame(this.io, this.roomCode);
        break;
      case Game.GAME_WEREWOLF:
        this.game = new WerewolfGame(this.io, this.roomCode);
        break;
      case Game.GAME_WAVELENGTH:
        this.game = new WavelengthGame(this.io, this.roomCode);
        break;
      case Game.GAME_DECEPTION:
        this.game = new DeceptionGame(this.io, this.roomCode);
        break;
      default:
        throw 'Unrecognized game type chosen';
    }
    this.game.setup(this.users);
  },

  nextTurn: function() {
    console.log('starting next round');
    if (!this.game) { return false; }
    this.game.nextTurn();
  },

  handlePlayerAction: function(socket, data) {
    if (!this.game) { return; }
    if (data.action === 'backToLobby') {
      this.backToLobby();
      return;
    }
    this.game.handlePlayerAction(socket.id, data);
  },

  endGame: function() {
    if (!this.game) { return; }
    this.game.endGame();
  },

  backToLobby: function() {
    this.state = STATE_LOBBY;
    this.game = null;
    this.broadcastToRoom('roomData', this.getRoomData());
  },

  getRoomData: function() {
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
  },

  broadcastRoomData: function() {
    const roomData = this.getRoomData();
    this.io.to(this.roomCode).emit('roomData', roomData);

    let gameData = this.game ? this.game.serialize() : { state: Game.STATE_PENDING };
    this.io.to(this.roomCode).emit('gameData', gameData)
  },

  sendGameState: function(socketId) {
    if (this.game) {
      this.io.to(socketId).emit('debugInfo', this.game.serialize())
    }
  },
}

module.exports = Room;
