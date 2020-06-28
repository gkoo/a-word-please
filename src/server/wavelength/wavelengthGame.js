const Game = require('../game');
const Player = require('../player.js');
const { easyConcepts, advancedConcepts } = require('./concepts.js');

class WavelengthGame extends Game {
  static GAME_ID = Game.GAME_WAVELENGTH;

  constructor(io, roomCode) {
    super(io, roomCode);
    this.concepts = [];
    this.conceptCursor = 0;
    this.numPoints = 0;
  }

  setup(users) {
    super.setup(users);
    console.log(process.env.NODE_ENV);
    const developmentConcepts = [
      ['Bad', 'Good'],
      ['Old', 'New'],
      ['Short', 'Tall'],
    ];
    const allConcepts = easyConcepts.concat(advancedConcepts);
    const concepts = process.env.NODE_ENV === 'development' ? developmentConcepts : allConcepts;
    this.createDeck(concepts);
    this.newGame();
  }

  newGame() {
    this.roundNum = 0;
    this.numPoints = 0;
    this.determinePlayerOrder();
    this.psychicId = this.playerOrder[0];
    this.nextTurn();
  }

  addPlayer(user) {
    const { id, name } = user;

    if (!name) { return; }

    this.players[user.id] = new Player({
      id,
      name,
    });

    if (this.playerOrder) {
      this.playerOrder.push(user.id);
    }
  }

  removePlayer(id) {
    if (this.players[id]) { this.players[id].connected = false; }

    // Remove from player order
    //const playerOrderIdx = this.playerOrder.indexOf(id);

    // For some reason, players get disconnected without being in the game
    //if (playerOrderIdx >= 0) {
      //this.playerOrder.splice(playerOrderIdx, 1);
    //}

    //if (id === this.psychicId) {
      //this.psychicId = this.playerOrder[playerOrderIdx % this.playerOrder.length];
      //this.nextTurn(false);
    //}

    //this.broadcastGameDataToPlayers();

    //if (this.state === AWPGame.STATE_ENTERING_CLUES) {
      //// TODO: unmark duplicates
      //this.checkIfAllCluesAreIn();
    //}
  }

  nextTurn(shouldIncrementRound = true) {
    this.clue = null;

    if (shouldIncrementRound) {
      this.advancePlayerTurn();
    }

    this.currConcept = this.drawCard();
    this.spectrumValue = Math.floor(Math.random()*100) + 1; // From 1 to 100

    this.broadcastGameDataToPlayers();
  }

  handlePlayerAction(playerId, data) {
    switch (data.action) {
      case 'submitClue':
        return this.receiveClue(data.clue);
      default:
        throw new Error(`Unexpected action ${data.action}`);
    }
  }

  receiveClue(clue) {
    this.clue = clue;
    this.broadcastGameDataToPlayers();
  }

  serialize() {
    const connectedPlayers = this.getConnectedPlayers();
    const { activePlayerId } = this;

    return {
      activePlayerId,
      clue: this.clue,
      currConcept: this.currConcept,
      gameId: WavelengthGame.GAME_ID,
      numPoints: this.numPoints,
      spectrumValue: this.spectrumValue;
    };
  }
}

module.exports = WavelengthGame;
