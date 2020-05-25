const uuid = require('uuid');

const Game = require('./game');
const User = require('./user');

const MAX_MESSAGES = 50;
const MAX_MESSAGE_LENGTH = 200;

function Room({ broadcastTo, roomCode }) {
  this.broadcastToRoom = (eventName, data) => broadcastTo(roomCode, eventName, data);
  this.broadcastTo = broadcastTo;
  this.roomCode = roomCode;
  this.users = {};
  this.messages = [];
  this.broadcastSystemMessage = (msg) => {
    const messageObj = {
      id: uuid.v4(),
      text: msg,
      type: 'system',
    };
    this.messages.push(messageObj);
    this.broadcastToRoom('message', messageObj);
  };
}

Room.prototype = {
  getUserById: function(id) { return this.users[id]; },

  addUser: function(id) {
    const user = new User({ id });
    this.users[id] = user;
    if (this.getUsers().length === 1) {
      this.promoteRandomLeader();
    }
  },

  onUserDisconnect: function(id) {
    const user = this.users[id];
    const { name } = user;

    console.log(`${id} disconnected`);
    delete this.users[id];
    if (user.isLeader) {
      this.promoteRandomLeader();
    }
    if (this.game) {
      this.game.removePlayer(id);
      const connectedPlayer = Object.values(this.game.players).find(player => player.connected);
      if (!connectedPlayer) { this.game = null; }
    }
    this.broadcastToRoom('userDisconnect', id);

    if (!name) { return; }
    this.broadcastSystemMessage(`${name} disconnected`);
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

  setUserName: function(socket, id, name) {
    const user = this.users[id];
    user.setName(name);
    this.broadcastSystemMessage(`${name} connected`);
    this.broadcastToRoom('newUser', user.serialize());

    if (!this.game) { return; }
    this.game.addPlayer(user);
    this.broadcastToRoom('gameData', this.game.serialize());
  },

  // returns an array of users
  getUsers: function() { return Object.values(this.users); },

  startGame: function() {
    const {
      broadcastToRoom,
      broadcastSystemMessage,
      broadcastTo,
    } = this;
    if (this.game) {
      this.game.newGame();
      return;
    }

    this.game = new Game({
      broadcastToRoom,
      broadcastSystemMessage,
      broadcastTo,
    });
    this.game.setup(this.users);
  },

  playCard: function(userId, cardId, effectData) {
    this.game.playCard(userId, cardId, effectData);
  },

  nextTurn: function(userId) {
    console.log('starting next round');
    if (!this.game) { return false; }
    this.game.nextTurn();
  },

  endGame: function(gameInitiatorId) {
    if (!this.game) { return; }
    this.game.endGame();
  },

  setPending: function() { return this.game && this.game.setPending(); },

  receiveClue: function(socketId, clue) {
    if (!this.game) { return; }
    this.game.receiveClue(socketId, clue);
  },

  revealClues: function() {
    if (!this.game) { return; }
    this.game.revealCluesToGuesser();
  },

  receiveGuess: function(socketId, guess) {
    if (!this.game) { return; }
    this.game.receiveGuess(socketId, guess);
  },

  skipTurn: function(socketId, guess) {
    if (!this.game) { return; }
    this.game.skipTurn();
  },

  sendInitRoomData: function(socket) {
    const users = {};
    const { messages } = this;
    Object.values(this.users).forEach(user => {
      users[user.id] = user.serialize();
    });
    const initData = {
      users,
      messages,
      currUserId: socket.id,
    };
    this.broadcastTo(socket.id, 'initData', initData);

    if (!this.game) { return; }

    this.broadcastTo(socket.id, 'gameData', this.game.serialize());
  },

  sendGameState: function(socketId) {
    if (!this.game) { return; }

    this.broadcastTo(socketId, 'debugInfo', this.game.serialize());
  },
}

module.exports = Room;
