const Game = require('./Game');
const Player = require('./Player');

function Room({ broadcast, emitToPlayer }) {
  this.players = {};
  this.messages = ['here are', 'your first', 'messages'];

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

  const promoteRandomLeader = () => {
    const players = this.getPlayers();

    if (players.length === 0) { return; }

    players[0].promoteToLeader();
    console.log(`${players[0].name || players[0].id} is the new leader`);
    for (let i = 1; i < players.length; ++i) {
      players[i].unpromoteFromLeader();
    }
  };

  this.getLeader = () => Object.values(this.players).find(player => player.isLeader);

  this.setPlayerName = (id, name) => this.players[id].setName(name);

  this.handleMessage = msg => {
    this.messages.push(msg);
  };

  // returns an array of players
  this.getPlayers = () => Object.values(this.players);

  this.startGame = (gameInitiatorId) => {
    if (!this.isPlayerLeader(gameInitiatorId)) { return; }
    this.game = new Game({ broadcast, emitToPlayer, players: this.players });
    this.game.setup();
    this.nextTurn();
  };

  this.nextTurn = () => {
    this.game.nextTurn();

    if (!this.game.isRoundOver()) {
      broadcastGameDataToPlayers();
      return;
    }

    // Round is over
    let roundEndMsg;
    if (this.game.roundWinner) {
      const winnerName = this.players[this.game.roundWinner.id].name;
      roundEndMsg = `${winnerName} won the round!`;
    } else {
      roundEndMsg = 'No one won the round...';
    }
    broadcast('systemMessage', roundEndMsg);
    broadcastGameDataToPlayers();
  };

  this.playCard = (playerId, card, effectData) => {
    this.game.playCard(playerId, card, effectData);

    this.nextTurn();

    if (this.game.isGameOver()) {
      const winnerNames = this.game.getWinnerIds().map(winnerId => this.players[winnerId].name);
      broadcast('systemMessage', `${winnerNames.join(' and ')} won the game!`);
    }
  };

  this.nextRound = playerId => {
    if (!this.isPlayerLeader(playerId)) { return false; }
    if (!this.game) { return false; }
    this.game.newRound();
    this.nextTurn();
  }

  this.endGame = (gameInitiatorId) => {
    if (!this.isPlayerLeader(gameInitiatorId)) { return false; }
    if (!this.game) { return false; }
    this.game.endGame();
    broadcast('systemMessage', 'Game ended!');
    return true;
  }

  this.isPlayerLeader = (playerId) => {
    const player = this.getPlayerById(playerId);
    return player.isLeader;
  };

  const broadcastGameDataToPlayers = () => {
    const playerIds = this.getPlayers().map(player => player.id);
    playerIds.forEach(playerId =>
      emitToPlayer(
        playerId,
        'gameData',
        this.game.serializeForPlayer(playerId),
      )
    );
  };

  this.sendGameState = socketId => {
    emitToPlayer(socketId, 'debugInfo', this.game.serialize());
  };
}

module.exports = Room;
