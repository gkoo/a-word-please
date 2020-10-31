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
  pointsForPlayer: object;
  players: object;
  playerClass: any;
  playerOrder: Array<string>;
  roundNum: number;
  spectrumGuesses: object;
  spectrumValue: number;
  state: number;
  totalNumRounds: number;

  static GAME_ID = GameEnum.Wavelength;
  static STATE_CLUE_PHASE = 3;
  static STATE_GUESS_PHASE = 4;
  static STATE_REVEAL_PHASE = 5;
  static STATE_GAME_END_PHASE = 6;

  static SPECTRUM_MAX_VALUE = 200;
  static SPECTRUM_BAND_WIDTH = 12;

  constructor(broadcastToRoom, emitToPlayer) {
    super(broadcastToRoom);
    this.emitToPlayer = emitToPlayer;
    this.concepts = [];
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
    this.pointsForPlayer = {};
    this.spectrumGuesses = {};
    this.determineNumRounds();
    this.determinePlayerOrder();
    this.nextTurn();
  }

  determineNumRounds() {
    const numPlayers = this.getConnectedPlayers().length;
    if (numPlayers < 4) {
      this.totalNumRounds = numPlayers * 4;
    } else if (numPlayers === 4) {
      this.totalNumRounds = numPlayers * 3;
    } else {
      this.totalNumRounds = numPlayers * 2;
    }
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

    if (this.roundNum > this.totalNumRounds) {
      return this.endGame();
    }

    this.currConcept = this.deck.drawCard();
    // having trouble with rendering the edges of the spectrum so let's add a padding of 25 on
    // either end
    const padding = WavelengthGame.SPECTRUM_BAND_WIDTH*5;
    this.spectrumValue = Math.floor(Math.random()*WavelengthGame.SPECTRUM_MAX_VALUE);
    this.spectrumGuesses = {};

    this.broadcastGameDataToPlayers();
  }

  handlePlayerAction(socket: SocketIO.Socket, data) {
    const playerId = socket.id;

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
    this.spectrumGuesses[playerId] = guess;
    const guessData = { playerId, guess };
    // Don't broadcast entire game data because this might be called frequently
    this.emitToPlayer(this.activePlayerId, 'spectrumGuessUpdate', guessData);
    Object.values(this.spectators).filter(spectator => spectator.connected).forEach(spectator => {
      this.emitToPlayer(spectator.id, 'spectrumGuessUpdate', guessData);
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

    if (this.pointsForPlayer[this.activePlayerId] === undefined) {
      this.pointsForPlayer[this.activePlayerId] = 0;
    }

    if (spectrumGuess >= band3LeftBound && spectrumGuess < band4LeftBound) {
      // within first band
      this.pointsForPlayer[this.activePlayerId] += 4;
    } else if (spectrumGuess >= band2LeftBound && spectrumGuess < band5LeftBound) {
      this.pointsForPlayer[this.activePlayerId] += 3;
    } else if (spectrumGuess >= band1LeftBound && spectrumGuess < band5RightBound) {
      this.pointsForPlayer[this.activePlayerId] += 2;
    }

    this.broadcastGameDataToPlayers();
  }

  endGame() {
    this.state = WavelengthGame.STATE_GAME_END_PHASE;
    this.broadcastGameDataToPlayers();
  }

  serialize() {
    const { activePlayerId } = this;

    return {
      activePlayerId,
      clue: this.clue,
      currConcept: this.currConcept,
      gameId: WavelengthGame.GAME_ID,
      players: this.players,
      pointsForPlayer: this.pointsForPlayer,
      roundNum: this.roundNum,
      spectators: this.spectators,
      spectrumGuesses: this.spectrumGuesses,
      spectrumValue: this.spectrumValue,
      state: this.state,
      totalNumRounds: this.totalNumRounds,
    };
  }
}

export default WavelengthGame;
