const Game = require('../game');
const Player = require('../player.js');
const { easyConcepts, advancedConcepts } = require('./concepts.js');

class WavelengthGame extends Game {
  static GAME_ID = Game.GAME_WAVELENGTH;
  static STATE_CLUE_PHASE = 3;
  static STATE_GUESS_PHASE = 4;
  static STATE_REVEAL_PHASE = 5;
  static STATE_GAME_END_PHASE = 6;
  static SPECTRUM_MAX_VALUE = 180;
  static TOTAL_NUM_ROUNDS = 13;

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
    if (this.roundNum >= WavelengthGame.TOTAL_NUM_ROUNDS - 1) {
      return this.endGame();
    }

    ++this.roundNum;
    this.clue = null;
    this.state = WavelengthGame.STATE_CLUE_PHASE;

    if (shouldIncrementRound) {
      this.advancePlayerTurn();
    }

    this.currConcept = this.drawCard();
    this.spectrumValue = Math.floor(Math.random()*WavelengthGame.SPECTRUM_MAX_VALUE) + 1;
    this.spectrumGuess = WavelengthGame.SPECTRUM_MAX_VALUE / 2;

    this.broadcastGameDataToPlayers();
  }

  handlePlayerAction(playerId, data) {
    switch (data.action) {
      case 'submitClue':
        return this.receiveClue(data.clue);
      case 'setSpectrumGuess':
        return this.setSpectrumGuess(playerId, data.spectrumGuess);
      case 'submitGuess':
        return this.submitGuess();
      case 'nextTurn':
        return this.nextTurn();
      default:
        throw new Error(`Unexpected action ${data.action}`);
    }
  }

  receiveClue(clue) {
    this.clue = clue;
    this.state = WavelengthGame.STATE_GUESS_PHASE;
    this.broadcastGameDataToPlayers();
  }

  setSpectrumGuess(playerId, guess) {
    this.spectrumGuess = guess;
    // Don't emit back to the original player because it messes with the UI
    const otherPlayers = this.getConnectedPlayers().filter(player => player.id !== playerId)
    otherPlayers.forEach(player => {
      // Don't broadcast entire game data because this might be called frequently
      this.io.to(player.id).emit('spectrumGuessUpdate', guess);
    });
  }

  submitGuess() {
    const bandWidth = 10;
    const { spectrumGuess, spectrumValue } = this;
    this.state = WavelengthGame.STATE_REVEAL_PHASE;

    if (spectrumGuess < spectrumValue + bandWidth/2 && spectrumGuess > spectrumValue - bandWidth/2) {
      // within first band
      this.numPoints += 4;
    } else if (spectrumGuess < spectrumValue + bandWidth * 3/2 && spectrumGuess > spectrumValue - bandWidth * 3/2) {
      this.numPoints += 3;
    } else if (spectrumGuess < spectrumValue + bandWidth * 5/2 && spectrumGuess > spectrumValue - bandWidth * 5/2) {
      this.numPoints += 2;
    }

    this.broadcastGameDataToPlayers();
  }

  endGame() {
    this.state = WavelengthGame.STATE_GAME_END_PHASE;
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
      players: this.players,
      roundNum: this.roundNum,
      spectrumGuess: this.spectrumGuess,
      spectrumValue: this.spectrumValue,
      state: this.state,
      totalNumRounds: WavelengthGame.TOTAL_NUM_ROUNDS,
    };
  }
}

module.exports = WavelengthGame;
