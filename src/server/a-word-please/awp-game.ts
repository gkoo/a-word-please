import _ from 'lodash';
import uuid from 'uuid';

import Deck from '../deck';
import Game from '../game';
import Player from '../player.js';
import wordlist from './wordlist.js';

interface Clue {
  clue: string;
  isDuplicate: boolean;
}

class AWPGame extends Game {
  activePlayerId: string;
  broadcastToRoom: (eventName: string, data: any) => void;
  clues: { [playerId: string]: Clue };
  currWord: string;
  currGuess: string | null;
  deck: Deck;
  numPoints: number;
  players: object;
  playerClass: any;
  playerOrder: Array<string>;
  roundNum: number;
  skippedTurn: boolean;
  state: number;

  static GAME_ID = Game.GAME_A_WORD_PLEASE;
  static STATE_ENTERING_CLUES = 3;
  static STATE_REVIEWING_CLUES = 4;
  static STATE_ENTERING_GUESS = 5;

  static MAX_WORD_LENGTH = 20;
  static MIN_PLAYERS = 2;
  static TOTAL_NUM_ROUNDS = 13;

  constructor(broadcastToRoom) {
    super(broadcastToRoom);
    this.clues = {};
    this.numPoints = 0;
    this.skippedTurn = false;
  }

  setup(users) {
    super.setup(users);
    this.deck = new Deck(wordlist);
    this.determinePlayerOrder();
    this.newGame();
  }

  newGame() {
    this.roundNum = 0;
    this.numPoints = 0;
    this.nextTurn();
  }

  addPlayer({ id, name }) {
    super.addPlayer({ id, name });

    if (this.playerOrder) { this.playerOrder.push(id); }
  }

  getConnectedPlayers() {
    return Object.values(this.players).filter(player => player.connected);
  }

  disconnectPlayer(id) {
    const playerOrderIdx = this.playerOrder.indexOf(id);

    // For some reason, players get disconnected without being in the game
    if (playerOrderIdx >= 0) {
      this.playerOrder.splice(playerOrderIdx, 1);
    }

    // Remove clue from clues
    if (this.clues[id]) { delete this.clues[id]; }

    if (id === this.activePlayerId) {
      this.nextTurn(false);
    }

    if (this.state === AWPGame.STATE_ENTERING_CLUES) {
      // TODO: unmark duplicates
      this.checkIfAllCluesAreIn();
    }

    super.disconnectPlayer(id)
  }

  nextTurn(shouldIncrementRound = true) {
    this.clues = {};
    this.currGuess = null;
    this.skippedTurn = false;

    if (shouldIncrementRound) {
      ++this.roundNum;
    }

    if (this.roundNum > AWPGame.TOTAL_NUM_ROUNDS) {
      this.endGame();
      return;
    }

    // Advance the playerOrderCursor
    // No action needed if we're advancing turn due to a player disconnect
    this.advancePlayerTurn();

    this.currWord = this.deck.drawCard();
    this.state = AWPGame.STATE_ENTERING_CLUES;

    this.broadcastGameDataToPlayers();
  }

  handlePlayerAction(playerId, data) {
    switch (data.action) {
      case 'submitClue':
        return this.receiveClue(playerId, data.clue);
      case 'revealClues':
        return this.revealCluesToGuesser();
      case 'submitGuess':
        return this.receiveGuess(data.guess);
      case 'skipTurn':
        return this.skipTurn();
      default:
        throw new Error(`Unexpected action ${data.action}`);
    }
  }

  receiveClue(playerId, submittedClue) {
    const clue = submittedClue.substring(0, AWPGame.MAX_WORD_LENGTH);
    const formattedClue = clue.toLowerCase().replace(/\s/g, '');
    let isDuplicate = false;
    Object.keys(this.clues).forEach(playerId => {
      if (this.clues[playerId].clue.toLowerCase().replace(/\s/g, '') === formattedClue) {
        this.clues[playerId].isDuplicate = true;
        isDuplicate = true;
      }
    });
    this.clues[playerId] = {
      clue,
      isDuplicate,
    };

    this.broadcastGameDataToPlayers();

    setTimeout(() => this.checkIfAllCluesAreIn(), 500);
  }

  checkIfAllCluesAreIn() {
    if (Object.values(this.clues).length === this.getConnectedPlayers().length - 1) {
      this.revealCluesToClueGivers();
    }
  }

  revealCluesToClueGivers() {
    this.state = AWPGame.STATE_REVIEWING_CLUES;
    this.broadcastGameDataToPlayers();
  }

  revealCluesToGuesser() {
    this.state = AWPGame.STATE_ENTERING_GUESS;
    this.broadcastGameDataToPlayers();
  }

  receiveGuess(submittedGuess) {
    const guess = submittedGuess.substring(0, AWPGame.MAX_WORD_LENGTH);
    const formattedGuess = guess.toLowerCase().replace(/\s/g, '');
    this.currGuess = guess;
    const correctGuess = formattedGuess === this.currWord.toLowerCase().replace(/\s/g, '');

    if (correctGuess) {
      ++this.numPoints;
    } else {
      ++this.roundNum;
    }

    this.state = Game.STATE_TURN_END;
    this.broadcastGameDataToPlayers();
  }

  skipTurn() {
    this.skippedTurn = true;
    this.state = AWPGame.STATE_TURN_END;
    this.broadcastGameDataToPlayers();
  }

  isGameOver() {
    return this.state === Game.STATE_GAME_END;
  }

  serialize() {
    const {
      clues,
      currGuess,
      currWord,
      numPoints,
      players,
      playerOrder,
      roundNum,
      skippedTurn,
      state,
    } = this;

    return {
      activePlayerId: this.activePlayerId,
      clues,
      currGuess,
      currWord,
      gameId: AWPGame.GAME_ID,
      numPoints,
      players,
      playerOrder,
      roundNum,
      skippedTurn,
      state,
      totalNumRounds: AWPGame.TOTAL_NUM_ROUNDS,
    };
  }
}

export default AWPGame;
