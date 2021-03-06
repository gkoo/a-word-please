import fs from 'fs';
import path from 'path';

import Deck from '../deck';
import Game, { GameEnum } from '../game';
import Player from '../player';

export enum GameState {
  Pending,
  TurnEnd,
  GameEnd,
  ExplainRules,
  CluePhase,
  GuessPhase,
  RevealPhase,
}

class WavelengthGame extends Game {
  activePlayerId: string;
  broadcastToRoom: (eventName: string, data: any) => void;
  clue: string | null;
  concepts: Array<[string, string]>;
  currConcept: [string, string];
  // currTurnPoints: for displaying the number of points each player got this round
  currTurnPoints: object;
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

  static SPECTRUM_MAX_VALUE = 200;
  static SPECTRUM_BAND_WIDTH = 12;

  constructor(broadcastToRoom, emitToPlayer) {
    super(broadcastToRoom);
    this.emitToPlayer = emitToPlayer;
    this.concepts = [];
  }

  setup(users) {
    super.setup(users);
    this.playersReady = {};
    this.constructDeck();
    this.state = GameState.ExplainRules;
    this.broadcastGameDataToPlayers();
  }

  constructDeck() {
    const isProduction = process.env.NODE_ENV === 'production';
    let conceptList = [];
    const developmentConcepts = [
      ['Bad', 'Good'],
      ['Old', 'New'],
      ['Short', 'Tall'],
    ];

    if (!isProduction) {
      conceptList = developmentConcepts;
    } else {
      const staticPath = `../../${isProduction ? '' : '../'}static`

      let filepath = path.join(__dirname, staticPath, 'wavelength-concepts-easy.txt');
      let data = fs.readFileSync(filepath, 'utf8');
      conceptList = conceptList.concat(
        data.split('\n').map((conceptPair: string) => conceptPair.split(','))
      );

      filepath = path.join(__dirname, staticPath, 'wavelength-concepts-advanced.txt');
      data = fs.readFileSync(filepath, 'utf8');
      conceptList = conceptList.concat(
        data.split('\n').map((conceptPair: string) => conceptPair.split(','))
      );
    }

    this.deck = new Deck(conceptList);
    this.deck.shuffle();
  }

  newGame() {
    this.roundNum = 0;
    this.currTurnPoints = {};
    this.playersReady = {};
    this.pointsForPlayer = {};
    this.spectrumGuesses = {};
    this.determineNumRounds();
    this.determinePlayerOrder();
    this.nextTurn();
  }

  determineNumRounds() {
    const numPlayers = this.getConnectedPlayers().length;
    if (numPlayers < 3) {
      // 8 rounds, 4 rounds per player
      this.totalNumRounds = numPlayers * 4;
    } else if (numPlayers === 3) {
      // 9 rounds, 3 rounds per player
      this.totalNumRounds = numPlayers * 3;
    } else {
      // 2 rounds per player
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
    if (this.playerOrder) {
      // Remove from player order
      const playerOrderIdx = this.playerOrder.indexOf(id);

      // For some reason, players get disconnected without being in the game
      if (playerOrderIdx >= 0) {
        this.playerOrder.splice(playerOrderIdx, 1);
      }
    }

    if (id === this.activePlayerId) {
      this.nextTurn(false);
    }

    super.disconnectPlayer(id);
  }

  nextTurn(shouldIncrementRound = true) {
    this.playersReady = {};
    this.currTurnPoints = {};
    this.clue = null;
    this.state = GameState.CluePhase;

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
      case 'ready':
        return this.playerReady(playerId);
      case 'submitClue':
        return this.receiveClue(data.clue);
      case 'setSpectrumGuess':
        return this.setSpectrumGuess(playerId, data.spectrumGuess);
      case 'submitGuess':
        return this.submitGuess(playerId);
      case 'nextTurn':
        return this.nextTurn();
      case 'newGame':
        return this.newGame();
      default:
        throw new Error(`Unexpected action ${data.action}`);
    }
  }

  onPlayersReady() {
    // only called for ExplainRules state
    this.newGame();
  }

  receiveClue(clue) {
    this.clue = clue;
    this.state = GameState.GuessPhase;
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

  submitGuess(playerId) {
    if (!this.spectrumGuesses[playerId]) {
      this.spectrumGuesses[playerId] = WavelengthGame.SPECTRUM_MAX_VALUE / 2;
    }

    this.playerReady(playerId);

    // Check if all players are ready (don't count the psychic)
    if (Object.keys(this.playersReady).length < this.getConnectedPlayers().length - 1) {
      return;
    }

    this.state = GameState.RevealPhase;

    this.calculatePoints();

    this.broadcastGameDataToPlayers();
  }

  calculatePoints() {
    const { spectrumValue } = this;

    let allGuessersPoints = 0;
    const guesserPlayers = this.getConnectedPlayers().filter(
      player => player.id !== this.activePlayerId
    );

    const band1LeftBound = spectrumValue - WavelengthGame.SPECTRUM_BAND_WIDTH * 5/2;
    const band2LeftBound = spectrumValue - WavelengthGame.SPECTRUM_BAND_WIDTH * 3/2;
    const band3LeftBound = spectrumValue - WavelengthGame.SPECTRUM_BAND_WIDTH/2;
    const band4LeftBound = spectrumValue + WavelengthGame.SPECTRUM_BAND_WIDTH/2;
    const band5LeftBound = spectrumValue + WavelengthGame.SPECTRUM_BAND_WIDTH * 3/2;
    const band5RightBound = spectrumValue + WavelengthGame.SPECTRUM_BAND_WIDTH * 5/2;

    if (this.pointsForPlayer[this.activePlayerId] === undefined) {
      this.pointsForPlayer[this.activePlayerId] = 0;
    }

    guesserPlayers.forEach(player => {
      const spectrumGuess = this.spectrumGuesses[player.id];
      let points = 0;

      if (this.pointsForPlayer[player.id] === undefined) {
        this.pointsForPlayer[player.id] = 0;
      }

      if (spectrumGuess >= band3LeftBound && spectrumGuess < band4LeftBound) {
        // within first band
        points = 4;
      } else if (spectrumGuess >= band2LeftBound && spectrumGuess < band5LeftBound) {
        points = 3;
      } else if (spectrumGuess >= band1LeftBound && spectrumGuess < band5RightBound) {
        points = 2;
      }

      this.pointsForPlayer[player.id] += points;
      this.currTurnPoints[player.id] = points;
      allGuessersPoints += points;
    });

    this.pointsForPlayer[this.activePlayerId] += allGuessersPoints;
    this.currTurnPoints[this.activePlayerId] = allGuessersPoints;
  }

  endGame() {
    this.state = GameState.GameEnd;
    this.broadcastGameDataToPlayers();
  }

  serialize() {
    const { activePlayerId } = this;

    return {
      activePlayerId,
      clue: this.clue,
      currConcept: this.currConcept,
      currTurnPoints: this.currTurnPoints,
      gameId: WavelengthGame.GAME_ID,
      players: this.players,
      playersReady: this.playersReady,
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
