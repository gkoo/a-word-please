const Clue = require('./clue');
const DeceptionPlayer = require('./deceptionPlayer');
const Deck = require('../deck');
const Game = require('../game');
const Player = require('../player');
const evidenceList = require('./evidenceList');
const methodList = require('./methodList');
const locationTileList = require('./locationTileList');
const sceneTileList = require('./sceneTileList');

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
  static STATE_WITNESSING = 5; // optional
  // Scientist chooses cause of death
  static STATE_SCIENTIST_CAUSE_OF_DEATH = 6;
  // Scientist chooses location
  static STATE_SCIENTIST_LOCATION = 7;
  // Scientist chooses scene markers
  static STATE_SCIENTIST_INITIAL_SCENE_TILES = 8;
  // Players make their cases
  static STATE_DELIBERATION = 9;
  // Scientist replaces a scene tile
  static STATE_REPLACE_SCENE = 10;

  // reserve 0 to make truthy/falsy logic easier
  static ROLE_SCIENTIST = 1;
  static ROLE_MURDERER = 2;
  static ROLE_INVESTIGATOR = 3;
  static ROLE_ACCOMPLICE = 4;
  static ROLE_WITNESS = 5;

  static MIN_PLAYERS = 4;
  static MAX_PLAYERS = 12;
  static NUM_TURNS = 3;

  static NUM_CLUE_CARDS_PER_PLAYER = 4;

  constructor(io, roomCode) {
    super(io, roomCode);
    this.playerClass = DeceptionPlayer;
    this.playersReady = {}; // keep track of who has read the rules
    this.murderMethod = null;
    this.keyEvidence = null;
  }

  setup(users) {
    super.setup(users);
    this.newGame();
  }

  newGame() {
    this.playersReady = {};
    this.roundNum = 0;
    this.murderMethod = null;
    this.keyEvidence = null;

    this.assignRoles();
    this.dealCards();
    this.createTiles();
    this.state = DeceptionGame.STATE_EXPLAIN_RULES;
    this.broadcastGameDataToPlayers();
  }

  createTiles() {
    this.createCauseOfDeathTile();
    this.createLocationTiles();
    this.createSceneTileDeck();
  }

  createCauseOfDeathTile() {
    this.causeOfDeathTile = new Tile({
      id: 0,
      label: 'Cause of Death',
      options: [
        'Suffocation',
        'Loss of Blood',
        'Illness/Disease',
        'Poisoning',
        'Accident',
      ],
      type: Tile.TYPE_CAUSE_OF_DEATH,
    });
  }

  createLocationTiles() {
    this.locationTiles = locationTileList.map((locationTileData, idx) =>
      new Tile(
        id: idx,
        label: locationTileData.label,
        options: locationTileData.options,
        type: Tile.TYPE_LOCATION,
      );
    );
  }

  createSceneTileDeck() {
    const sceneTiles = sceneTileList.map((sceneTileData, idx) =>
      new Tile(
        id: idx,
        label: sceneTileData.label,
        options: sceneTileData.options,
        type: Tile.TYPE_SCENE,
      );
    );
    this.sceneTileDeck = new Deck(sceneTiles);
    this.sceneTileDeck.shuffle();
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
      case 'chooseMeansAndEvidence':
        return this.chooseMeansAndEvidence(playerId, data);
      case 'selectCauseOfDeath':
        return this.selectCauseOfDeath(playerId, data);
      case 'selectLocation':
        return this.selectLocation(playerId, data);
      case 'selectInitialSceneTiles':
        return this.selectInitialSceneTiles(playerId, data);
      case 'startNextRound':
        return this.nextRound();
      case 'replaceSceneTile':
        return this.replaceSceneTile(playerId, data);
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

  chooseMeansAndEvidence(playerId, data) {
    const player = this.players[playerId];

    if (!player.isMurderer()) {
      throw 'Non-murderer tried to choose means and evidence!';
    }

    this.murderMethod = player.methodCards.find(method => method.id === data.methodId);
    this.keyEvidence = player.evidenceCards.find(evidence => evidence.id === data.evidenceId);

    this.state = DeceptionGame.STATE_SCIENTIST_INITIAL_TILES;
    this.broadcastGameDataToPlayers();
  }

  selectCauseOfDeath(playerId, data) {
    const player = this.players[playerId];

    if (!player.isScientist()) {
      throw 'Non-scientist tried to select cause of death!';
    }

    this.causeOfDeathTile.selectOption(data.causeOfDeath);

    this.state = DeceptionGame.STATE_SCIENTIST_LOCATION;
    this.broadcastGameDataToPlayers();
  }

  selectLocation(playerId, data) {
    const player = this.players[playerId];
    const { location, locationTileId } = data;

    if (!player.isScientist()) {
      throw 'Non-scientist tried to select location!';
    }

    this.selectedLocationTile = this.locationTiles.find(
      locationTile => locationTile.id === locationTileId
    );

    if (!this.selectedLocationTile) {
      throw 'Couldn\'t find the selected location tile!';
    }

    this.selectedLocationTile.selectOption(location);

    // Prepare for choosing scene tiles
    this.state = DeceptionGame.STATE_SCIENTIST_INITIAL_SCENE_TILES;
    this.sceneTiles = [];

    const numSceneTiles = 4;
    for (let i = 0; i < numInitialSceneTiles; ++i) {
      this.sceneTiles.push(this.sceneTileDeck.drawCard());
    }
    this.broadcastGameDataToPlayers();
  }

  selectInitialSceneTiles(playerId, data) {
    const player = this.players[playerId];
    const { sceneSelections } = data;

    if (!player.isScientist()) {
      throw 'Non-scientist tried to select location!';
    }

    Object.entries(sceneSelections).forEach([id, option] => {
      tile = this.sceneTiles.find(tile => tile.id === id);
      tile.selectOption(option);
    });

    this.state = DeceptionGame.STATE_DELIBERATION;
    this.broadcastGameDataToPlayers();
  }

  startNextRound() {
    this.state = DeceptionGame.STATE_REPLACE_SCENE;
    this.newSceneTile = this.sceneTileDeck.drawCard();
    this.broadcastGameDataToPlayers();
  }

  replaceSceneTile(playerId, data) {
    const player = this.players[playerId];

    if (!player.isScientist()) {
      throw 'Non-scientist tried to replace scene tile!';
    }

    const { tileIdToReplace, newSceneSelection } = data;
    this.newSceneTile.selectOption(newSceneSelection);
    const replacedTileIdx = this.sceneTiles.findIndex(tile => tile.id === tileIdToReplace);
    const replacedTiles = this.sceneTiles.splice(replacedTileIdx, 1, this.newSceneTile);
    this.oldSceneTile = replacedTiles[0];

    this.state = DeceptionGame.STATE_DELIBERATION;
    this.broadcastGameDataToPlayers();
  }

  serialize() {
    const {
      locationTiles,
      playersReady,
      state,
    } = this;

    let data = {
      causeOfDeathTile: this.causeOfDeathTile,
      gameId: DeceptionGame.GAME_ID,
      keyEvidence: this.keyEvidence,
      murderMethod: this.murderMethod,
      sceneTiles: this.sceneTiles,
      selectedLocationTile: this.selectedLocationTile,
      players: this.players,
      state,
    };

    if (state === DeceptionGame.STATE_EXPLAIN_RULES) {
      data = {
        ...data,
        playersReady,
      };
    }

    if (state === DeceptionGame.STATE_SCIENTIST_LOCATION) {
      data = {
        ...data,
        locationTiles,
      }
    }

    if (state === DeceptionGame.STATE_REPLACE_SCENE) {
      data = {
        ...data,
        newSceneTile,
      }
    }

    return data;
  }
}

module.exports = DeceptionGame;
