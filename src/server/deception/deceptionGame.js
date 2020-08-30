const Clue = require('./clue');
const DeceptionPlayer = require('./deceptionPlayer');
const Deck = require('../deck');
const Game = require('../game');
const Player = require('../player');
const evidenceList = require('./evidenceList');
const methodList = require('./methodList');

// Each player gets 4 "means of murder" cards and 4 "key evidence" cards
// Before game starts, murderer chooses one means of murder and one key evidence
// Before game starts, witness gets to see who is murderer and accomplice
// At game start, scientist chooses one of the four location tiles and four of the random tiles
// Each person gets 30 seconds to make their case
// If no one solves murder by end of round, scientist can swap out a card that was throwing people off track
// Repeat for two more rounds
// Investigator can put down their badge to "solve the crime" at any time
// - If wrong about either means of murder or key evidence, Scientist says no and nothing else, investigator loses badge
// - If correct, murderer can guess witness

class DeceptionGame extends Game {
  static GAME_ID = Game.GAME_DECEPTION;

  // (optional) Explain the rules to first time players
  static STATE_EXPLAIN_RULES = 3;
  // Murderer chooses means of murder and key evidence. (optional) Accomplice learns murderer
  // identity
  static STATE_CHOOSE_MEANS_EVIDENCE = 4;
  // (optional) Witness learns murderer and accomplice identity
  static STATE_WITNESSING = 4; // optional
  // Scientist chooses cause of death, location, and four misc tile markers
  static STATE_SCIENTIST_INITIAL_TILES = 5;

  // reserve 0 to make truthy/falsy logic easier
  static ROLE_SCIENTIST = 1;
  static ROLE_MURDERER = 2;
  static ROLE_INVESTIGATOR = 3;
  static ROLE_ACCOMPLICE = 4;
  static ROLE_WITNESS = 5;

  static MIN_PLAYERS = 4;
  static MAX_PLAYERS = 12;

  static NUM_CLUE_CARDS_PER_PLAYER = 4;

  constructor(io, roomCode) {
    super(io, roomCode);
    this.playerClass = DeceptionPlayer;
    this.playersReady = {}; // keep track of who has read the rules
  }

  setup(users) {
    super.setup(users);
    this.newGame();
  }

  newGame() {
    this.assignRoles();
    this.dealCards();
    this.playersReady = {};
    this.state = DeceptionGame.STATE_EXPLAIN_RULES;
    this.broadcastGameDataToPlayers();
  }

  assignRoles() {
    const rolesToUse = [
      DeceptionGame.ROLE_SCIENTIST,
      DeceptionGame.ROLE_MURDERER,
    ];
    const numPlayers = Object.values(this.players).length;
    const numInvestigators = numPlayers - rolesToUse.length;
    let i;
    for (i = 0; i < numInvestigators; ++i) {
      rolesToUse.push(DeceptionGame.ROLE_INVESTIGATOR);
    }
    const roleDeck = new Deck(rolesToUse);
    roleDeck.shuffle();

    const playerList = Object.values(this.players).forEach((player) => {
      const role = roleDeck.drawCard();
      player.setRole(role);
    });
  }

  dealCards() {
    const evidenceCards = evidenceList.map(
      (evidenceLabel, i) => new Clue(evidenceLabel, i, Clue.TYPE_KEY_EVIDENCE)
    );
    const methodCards = methodList.map(
      (methodLabel, i) => new Clue(methodLabel, i, Clue.TYPE_MURDER_METHOD)
    );

    const evidenceDeck = new Deck(evidenceCards);
    const methodDeck = new Deck(methodCards);

    evidenceDeck.shuffle();
    methodDeck.shuffle();

    Object.values(this.players).forEach(player => {
      if (player.role === DeceptionGame.ROLE_SCIENTIST) {
        return;
      }

      const evidenceCardsForPlayer = [];
      const methodCardsForPlayer = [];
      for (let i = 0; i < DeceptionGame.NUM_CLUE_CARDS_PER_PLAYER; ++i) {
        evidenceCardsForPlayer.push(evidenceDeck.drawCard());
        methodCardsForPlayer.push(methodDeck.drawCard());
      }

      player.evidenceCards = evidenceCardsForPlayer;
      player.methodCards = methodCardsForPlayer;
    });
  }

  handlePlayerAction(playerId, data) {
    switch (data.action) {
      case 'readRules':
        return this.readRules(playerId);
    }
  }

  readRules(playerId) {
    this.playersReady[playerId] = 1;
    if (Object.keys(this.playersReady) >= Object.keys(this.players)) {
      // Everyone has read the rules and we're ready to start the game!
      this.state = DeceptionGame.STATE_CHOOSE_MEANS_EVIDENCE;
    }
    this.broadcastGameDataToPlayers();
  }

  serialize() {
    return {
      gameId: DeceptionGame.GAME_ID,
      playersReady: this.playersReady,
      players: this.players,
      state: this.state,
    }
  }
}

module.exports = DeceptionGame;
