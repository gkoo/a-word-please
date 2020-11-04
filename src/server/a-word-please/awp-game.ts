import _ from 'lodash';
import uuid from 'uuid';

import Deck from '../deck';
import Game, { GameEnum } from '../game';
import Player from '../player';
import wordlist from './wordlist';

interface Clue {
  clue: string;
  isDuplicate: boolean;
}

export enum GameState {
  Pending,
  TurnEnd,
  GameEnd,
  EnteringClues,
  ReviewingClues,
  EnteringGuess,
}

class AWPGame extends Game {
  broadcastToRoom: (eventName: string, data: any) => void;
  clues: { [playerId: string]: Clue };
  currWord: string;
  currGuess: string | null;
  deck: Deck;
  numPoints: number;
  roundNum: number;
  skippedTurn: boolean;
  spectators: { [playerId: string]: Player };

  static GAME_ID = GameEnum.AWordPlease;

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
    this.deck.shuffle();
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

    super.disconnectPlayer(id)

    if (this.state === GameState.EnteringClues) {
      // TODO: unmark duplicates
      this.checkIfAllCluesAreIn();
    }
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
    this.state = GameState.EnteringClues;

    this.broadcastGameDataToPlayers();
  }

  handlePlayerAction(socket: SocketIO.Socket, data) {
    const playerId = socket.id;

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
    this.state = GameState.ReviewingClues;
    this.broadcastGameDataToPlayers();
  }

  revealCluesToGuesser() {
    this.state = GameState.EnteringGuess;
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

    this.state = GameState.TurnEnd;
    this.broadcastGameDataToPlayers();
  }

  skipTurn() {
    this.skippedTurn = true;
    this.state = GameState.TurnEnd;
    this.broadcastGameDataToPlayers();
  }

  isGameOver() {
    return this.state === GameState.GameEnd;
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
      spectators: this.spectators,
      state,
      totalNumRounds: AWPGame.TOTAL_NUM_ROUNDS,
    };
  }
}

export default AWPGame;
