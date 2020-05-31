import uuid from 'uuid';

import Game from './game.js';
import User from './user.js';

const MAX_MESSAGES = 50;
const MAX_MESSAGE_LENGTH = 200;

function Room({ io, roomCode }) {
  this.broadcastToRoom = (eventName, data) => io.to(roomCode).emit(eventName, data);
  this.io = io;
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
      io,
    } = this;
    if (this.game) {
      this.game.newGame();
      return;
    }

    this.game = new Game({
      broadcastToRoom,
      broadcastSystemMessage,
      io,
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

  getInitRoomData: function(socketId) {
    const users = {};
    const { messages } = this;
    Object.values(this.users).forEach(user => {
      users[user.id] = user.serialize();
    });
    return {
      users,
      messages,
      currUserId: socketId,
    };
  },

  sendInitRoomData: function(socket) {
    const initData = this.getInitRoomData(socket.id);
    this.io.to(socket.id).emit('initData', initData)

    let gameData = this.game ? this.game.serialize() : { state: Game.STATE_PENDING };
    this.io.to(socket.id).emit('gameData', gameData)
  },

  sendGameState: function(socketId) {
    let debugData = this.game ? this.game.serialize() : this.getInitRoomData(socketId);

    this.io.to(socketId).emit('debugInfo', debugData)
  },
}

export default Room;
