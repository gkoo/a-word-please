const uuid = require('uuid');

const Game = require('./game');
const Message = require('./message');
const User = require('./user');

const MAX_MESSAGES = 50;
const MAX_MESSAGE_LENGTH = 200;

function Room({ broadcast, emitToUser }) {
  this.users = {};
  this.messages = [];

  this.getUserById = id => this.users[id];

  this.addUser = id => {
    const user = new User(id);
    this.users[id] = user;
    if (this.getUsers().length === 1) {
      promoteRandomLeader();
    }
    if (!this.game) { return; }

    this.game.addSpectator(id);
  };

  this.removeUser = id => {
    const user = this.users[id];
    delete this.users[id];
    if (user.isLeader) {
      promoteRandomLeader();
    }
  };

  this.onUserDisconnect = id => {
    const { name } = this.users[id];

    this.removeUser(id);
    broadcast('userDisconnect', id);
    const leader = this.getLeader();

    if (!name) { return; }
    broadcastSystemMessage(`${name} disconnected`);
  };

  const promoteRandomLeader = () => {
    const users = this.getUsers();

    if (users.length === 0) { return; }

    const newLeader = users[0];
    newLeader.promoteToLeader();
    for (let i = 1; i < users.length; ++i) {
      users[i].unpromoteFromLeader();
    }
    broadcast('newLeader', newLeader.id);
  };

  this.getLeader = () => Object.values(this.users).find(user => user.isLeader);

  this.setUserName = (id, name) => {
    const user = this.users[id];
    user.setName(name);
    broadcastSystemMessage(`${name} connected`);
    broadcast('newUser', user.serialize());
  };

  this.handleMessage = (senderId, msg) => {
    const { messages } = this;
    const messageObj = new Message({
      id: uuid.v4(),
      senderName: this.users[senderId].name,
      text: msg.substring(0, MAX_MESSAGE_LENGTH),
      type: 'user',
    })
    if (messages.length > MAX_MESSAGES) { messages.shift(); }
    messages.push(messageObj);
    broadcast('message', messageObj);
  };

  const broadcastSystemMessage = msg => {
    const messageObj = {
      id: uuid.v4(),
      text: msg,
      type: 'system',
    };
    this.messages.push(messageObj);
    broadcast('message', messageObj);
  };

  // returns an array of users
  this.getUsers = () => Object.values(this.users);

  this.startGame = (gameInitiatorId) => {
    if (!this.isUserLeader(gameInitiatorId)) { return; }
    this.game = new Game({
      broadcast,
      broadcastSystemMessage,
      emitToUser,
      users: this.users,
    });
    this.game.setup();
  };

  this.playCard = (userId, cardId, effectData) => {
    this.game.playCard(userId, cardId, effectData);
  };

  this.nextRound = userId => {
    console.log('starting next round');
    if (!this.isUserLeader(userId)) {
      console.log(`user ${userId} tried to start next round but is not the leader`);
      return false;
    }
    if (!this.game) { return false; }
    this.game.newRound();
  }

  this.endGame = (gameInitiatorId) => {
    if (!this.isUserLeader(gameInitiatorId)) { return false; }
    if (!this.game) { return false; }
    this.game.endGame();
    return true;
  }

  this.isUserLeader = (userId) => {
    const user = this.getUserById(userId);
    return user.isLeader;
  };

  this.sendInitRoomData = socket => {
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
    emitToUser(socket.id, 'initData', initData);

    if (!this.game) { return; }

    emitToUser(socket.id, 'gameData', this.game.serializeForSpectator());
  }

  this.sendGameState = socketId => {
    if (!this.game) { return; }

    emitToUser(socketId, 'debugInfo', this.game.serialize());
  };
}

module.exports = Room;
