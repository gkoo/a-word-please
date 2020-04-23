const uuid = require('uuid');

const Game = require('./game');
const Message = require('./message');
const Player = require('./player');

function Room({ broadcast, emitToPlayer }) {
  this.players = {};
  this.messages = [];

  this.getPlayerById = id => this.players[id];

  this.addPlayer = id => {
    const player = new Player(id);
    this.players[id] = player;
    if (this.getPlayers().length === 1) {
      promoteRandomLeader();
    }
  };

  this.removePlayer = id => {
    const player = this.players[id];
    delete this.players[id];
    if (player.isLeader) {
      promoteRandomLeader();
    }
  };

  this.onPlayerDisconnect = id => {
    const { name } = this.players[id];

    this.removePlayer(id);
    broadcast('playerDisconnect', id);
    const leader = this.getLeader();

    if (!name) { return; }
    broadcastSystemMessage(`${name} disconnected`);
  };

  const promoteRandomLeader = () => {
    const players = this.getPlayers();

    if (players.length === 0) { return; }

    const newLeader = players[0];
    newLeader.promoteToLeader();
    for (let i = 1; i < players.length; ++i) {
      players[i].unpromoteFromLeader();
    }
    broadcast('newLeader', newLeader.id);
  };

  this.getLeader = () => Object.values(this.players).find(player => player.isLeader);

  this.setPlayerName = (id, name) => this.players[id].setName(name);

  this.handleMessage = (senderId, msg) => {
    const messageObj = new Message({
      id: uuid.v4(),
      senderName: this.players[senderId].name,
      text: msg,
      type: 'player',
    })
    this.messages.push(messageObj);
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

  // returns an array of players
  this.getPlayers = () => Object.values(this.players);

  this.startGame = (gameInitiatorId) => {
    if (!this.isPlayerLeader(gameInitiatorId)) { return; }
    this.game = new Game({
      broadcast,
      broadcastSystemMessage,
      emitToPlayer,
      players: this.players,
    });
    this.game.setup();
  };

  this.playCard = (playerId, card, effectData) => {
    this.game.playCard(playerId, card, effectData);

    if (this.game.isGameOver()) {
      const winnerNames = this.game.getWinnerIds().map(winnerId => this.players[winnerId].name);
      broadcastSystemMessage(`${winnerNames.join(' and ')} won the game!`);
    }
  };

  this.nextRound = playerId => {
    console.log('starting next round');
    if (!this.isPlayerLeader(playerId)) {
      console.log(`player ${playerId} tried to start next round but is not the leader`);
      return false;
    }
    if (!this.game) { return false; }
    this.game.newRound();
  }

  this.endGame = (gameInitiatorId) => {
    if (!this.isPlayerLeader(gameInitiatorId)) { return false; }
    if (!this.game) { return false; }
    this.game.endGame();
    broadcastSystemMessage('Game ended!');
    return true;
  }

  this.isPlayerLeader = (playerId) => {
    const player = this.getPlayerById(playerId);
    return player.isLeader;
  };

  this.sendInitRoomData = socket => {
    const players = {};
    const { messages } = this;
    const roomPlayers = Object.keys(this.players).map(id => this.players[id]);
    roomPlayers.forEach(player => {
      players[player.id] = player.serialize();
    });
    const initData = {
      players,
      messages,
      currPlayerId: socket.id,
    };
    socket.emit('initData', initData);
  }

  this.sendGameState = socketId => {
    if (this.game) {
      emitToPlayer(socketId, 'debugInfo', this.game.serialize());
    }
  };
}

module.exports = Room;
