import Deck from '../deck';
import Game, { GameEnum } from '../game';
import Player from '../player';
import { easyConcepts, advancedConcepts } from './concepts';

class WavelengthGame extends Game {
  activePlayerId: string;
  broadcastToRoom: (eventName: string, data: any) => void;
  clue: string | null;
  concepts: Array<[string, string]>;
  currConcept: [string, string];
  deck: Deck;
  emitToPlayer: (playerId: string, eventName: string, data: any) => void;
  numPoints: number;
  players: object;
  playerClass: any;
  playerOrder: Array<string>;
  roundNum: number;
  spectrumGuess: number;
  spectrumValue: number;
  state: number;

  static GAME_ID = GameEnum.Wavelength;
  static STATE_CLUE_PHASE = 3;
  static STATE_GUESS_PHASE = 4;
  static STATE_REVEAL_PHASE = 5;
  static STATE_GAME_END_PHASE = 6;

  static SPECTRUM_MAX_VALUE = 200;
  static SPECTRUM_BAND_WIDTH = 12;
  static TOTAL_NUM_ROUNDS = 13;

  constructor(broadcastToRoom, emitToPlayer) {
    super(broadcastToRoom);
    this.emitToPlayer = emitToPlayer;
    this.concepts = [];
    this.numPoints = 0;
  }

  setup(users) {
    super.setup(users);
    const developmentConcepts = [
      ['Bad', 'Good'],
      ['Old', 'New'],
      ['Short', 'Tall'],
    ];
    const allConcepts = easyConcepts.concat(advancedConcepts);
    const concepts = process.env.NODE_ENV === 'development' ? developmentConcepts : allConcepts;
    this.deck = new Deck(concepts);
    this.newGame();
  }

  newGame() {
    this.roundNum = 0;
    this.numPoints = 0;
    this.determinePlayerOrder();
    this.nextTurn();
  }

  addPlayer({ id, name }) {
    super.addPlayer({ id, name });

    if (this.playerOrder) {
      this.playerOrder.push(id);
    }
  }

  disconnectPlayer(id: string) {
    // Remove from player order
    const playerOrderIdx = this.playerOrder.indexOf(id);

    // For some reason, players get disconnected without being in the game
    if (playerOrderIdx >= 0) {
      this.playerOrder.splice(playerOrderIdx, 1);
    }

    if (id === this.activePlayerId) {
      this.nextTurn(false);
    }

    super.disconnectPlayer(id);
  }

  nextTurn(shouldIncrementRound = true) {
    this.clue = null;
    this.state = WavelengthGame.STATE_CLUE_PHASE;

    if (shouldIncrementRound) {
      ++this.roundNum;
    }

    this.advancePlayerTurn();

    if (this.roundNum > WavelengthGame.TOTAL_NUM_ROUNDS) {
      return this.endGame();
    }

    this.currConcept = this.deck.drawCard();
    // having trouble with rendering the edges of the spectrum so let's add a padding of 25 on
    // either end
    const padding = WavelengthGame.SPECTRUM_BAND_WIDTH*5;
    this.spectrumValue = Math.floor(Math.random()*WavelengthGame.SPECTRUM_MAX_VALUE);
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
      case 'newGame':
        return this.newGame();
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
      this.emitToPlayer(player.id, 'spectrumGuessUpdate', guess);
    });
  }

  submitGuess() {
    const { spectrumGuess, spectrumValue } = this;
    this.state = WavelengthGame.STATE_REVEAL_PHASE;

    const band1LeftBound = spectrumValue - WavelengthGame.SPECTRUM_BAND_WIDTH * 5/2;
    const band2LeftBound = spectrumValue - WavelengthGame.SPECTRUM_BAND_WIDTH * 3/2;
    const band3LeftBound = spectrumValue - WavelengthGame.SPECTRUM_BAND_WIDTH/2;
    const band4LeftBound = spectrumValue + WavelengthGame.SPECTRUM_BAND_WIDTH/2;
    const band5LeftBound = spectrumValue + WavelengthGame.SPECTRUM_BAND_WIDTH * 3/2;
    const band5RightBound = spectrumValue + WavelengthGame.SPECTRUM_BAND_WIDTH * 5/2;

    if (spectrumGuess >= band3LeftBound && spectrumGuess < band4LeftBound) {
      // within first band
      this.numPoints += 4;
    } else if (spectrumGuess >= band2LeftBound && spectrumGuess < band5LeftBound) {
      this.numPoints += 3;
    } else if (spectrumGuess >= band1LeftBound && spectrumGuess < band5RightBound) {
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

export default WavelengthGame;
