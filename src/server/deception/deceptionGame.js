const Clue = require('./clue');
const DeceptionPlayer = require('./deceptionPlayer');
const Deck = require('../deck');
const Game = require('../game');
const Player = require('../player');
const Tile = require('./tile');
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
  static STATE_SHOW_ROLES = 4;
  // Murderer chooses means of murder and key evidence. (optional) Accomplice learns murderer
  // identity
  static STATE_CHOOSE_MEANS_EVIDENCE = 5;
  // (optional) Witness learns murderer and accomplice identity
  static STATE_WITNESSING = 6; // optional
  // Murderer chooses cause of death
  static STATE_SCIENTIST_CAUSE_OF_DEATH = 7;
  // Scientist chooses location
  static STATE_SCIENTIST_LOCATION = 8;
  // Scientist chooses scene markers
  static STATE_SCIENTIST_INITIAL_SCENE_TILES = 9;
  // Players make their cases
  static STATE_DELIBERATION = 10;
  // Scientist replaces a scene tile
  static STATE_REPLACE_SCENE = 11;

  // reserve 0 to make truthy/falsy logic easier
  static ROLE_SCIENTIST = 1;
  static ROLE_MURDERER = 2;
  static ROLE_INVESTIGATOR = 3;
  static ROLE_ACCOMPLICE = 4;
  static ROLE_WITNESS = 5;

  static MIN_PLAYERS = 4;
  static MAX_PLAYERS = 12;
  static NUM_ROUNDS = 3;

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
    this.roundNum = 1;
    this.murderMethod = null;
    this.keyEvidence = null;
    this.accuseLog = {};
    this.accusationActive = false;
    this.accusationResult = undefined;
    this.witnessGuessCorrect = undefined;
    this.witnessSuspect = null;

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
      new Tile({
        id: idx,
        label: locationTileData.label,
        options: locationTileData.options,
        type: Tile.TYPE_LOCATION,
      })
    );
  }

  createSceneTileDeck() {
    const sceneTiles = sceneTileList.map((sceneTileData, idx) =>
      new Tile({
        id: idx,
        label: sceneTileData.label,
        options: sceneTileData.options,
        type: Tile.TYPE_SCENE,
      })
    );
    this.sceneTileDeck = new Deck(sceneTiles);
    this.sceneTileDeck.shuffle();
  }

  assignRoles() {
    const rolesToUse = [
      DeceptionGame.ROLE_SCIENTIST,
      DeceptionGame.ROLE_MURDERER,
    ];
    if (this.includeAccomplice) {
      rolesToUse.push(DeceptionGame.ROLE_ACCOMPLICE);
    }
    if (this.includeWitness) {
      rolesToUse.push(DeceptionGame.ROLE_WITNESS);
    }
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
      case 'ready':
        return this.playerReady(playerId);
      case 'toggleRole':
        return this.toggleRole(playerId, data);
      case 'acknowledgeRole':
        return this.acknowledgeRole(playerId);
      case 'chooseMeansAndEvidence':
        return this.chooseMeansAndEvidence(playerId, data);
      case 'selectCauseOfDeath':
        return this.selectCauseOfDeath(playerId, data);
      case 'selectLocation':
        return this.selectLocation(playerId, data);
      case 'selectInitialSceneTiles':
        return this.selectInitialSceneTiles(playerId, data);
      case 'endRound':
        return this.endRound();
      case 'replaceSceneTile':
        return this.replaceSceneTile(playerId, data);
      case 'accusePlayer':
        return this.accusePlayer(playerId, data);
      case 'changeAccuseDetails':
        return this.changeAccuseDetails(playerId, data);
      case 'confirmAccusation':
        return this.confirmAccusation(playerId);
      case 'endAccusation':
        return this.endAccusation();
      case 'setWitnessGuess':
        return this.setWitnessGuess(playerId, data);
      case 'guessWitness':
        return this.guessWitness(playerId, data);
    }
  }

  playerReady(playerId) {
    this.playersReady[playerId] = 1;
    this.broadcastGameDataToPlayers();

    //if (Object.keys(this.playersReady).length < Object.keys(this.players).length) {
      //return;
    //}

    // Everyone is ready!
    this.playersReady = {};
    switch (this.state) {
      case DeceptionGame.STATE_EXPLAIN_RULES:
        this.assignRoles();
        this.state = DeceptionGame.STATE_SHOW_ROLES;
        break;
      case DeceptionGame.STATE_SHOW_ROLES:
        this.state = DeceptionGame.STATE_CHOOSE_MEANS_EVIDENCE;
        break;
      default:
        throw 'Unexpected state change!'
    }
    setTimeout(() => this.broadcastGameDataToPlayers(), 500);
  }

  toggleRole(playerId, { role, shouldInclude }) {
    if (role === DeceptionGame.ROLE_WITNESS) {
      this.includeWitness = shouldInclude;
    }
    if (role === DeceptionGame.ROLE_ACCOMPLICE) {
      this.includeAccomplice = shouldInclude;
    }
    this.broadcastGameDataToPlayers();
  }

  acknowledgeRole(playerId) {
    this.acknowledgedRolesMap[playerId] = 1;
    if (Object.keys(this.acknowledgedRolesMap).length >= Object.keys(this.players).length) {
      // Everyone has acknowledged their role and we're ready to start the game!
      this.state = DeceptionGame.STATE_CHOOSE_MEANS_EVIDENCE;
    }
    this.broadcastGameDataToPlayers();
  }

  chooseMeansAndEvidence(playerId, { methodId, evidenceId }) {
    const player = this.players[playerId];

    if (!player.isMurderer()) {
      throw 'Non-murderer tried to choose means and evidence!';
    }

    this.murderMethod = player.methodCards.find(method => method.id === methodId);
    this.keyEvidence = player.evidenceCards.find(evidence => evidence.id === evidenceId);

    this.state = DeceptionGame.STATE_SCIENTIST_CAUSE_OF_DEATH;
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
    for (let i = 0; i < numSceneTiles; ++i) {
      this.sceneTiles.push(this.sceneTileDeck.drawCard());
    }
    this.broadcastGameDataToPlayers();
  }

  selectInitialSceneTiles(playerId, { sceneSelections }) {
    const player = this.players[playerId];

    if (!player.isScientist()) {
      throw 'Non-scientist tried to select location!';
    }

    Object.keys(sceneSelections).forEach((id) => {
      const option = sceneSelections[id];
      for (let i = 0; i < this.sceneTiles.length; ++i) {
        const tile = this.sceneTiles[i];
        // I think the id gets converted to a string when it's the property of an object?
        if (tile.id === parseInt(id, 10)) {
          tile.selectOption(option);
          break;
        }
      }
    });

    this.state = DeceptionGame.STATE_DELIBERATION;
    this.broadcastGameDataToPlayers();
  }

  endRound() {
    if (this.roundNum >= DeceptionGame.NUM_ROUNDS) {
      this.state = DeceptionGame.STATE_GAME_END;
    } else {
      this.state = DeceptionGame.STATE_REPLACE_SCENE;
      this.newSceneTile = this.sceneTileDeck.drawCard();
    }
    this.broadcastGameDataToPlayers();
  }

  replaceSceneTile(playerId, { tileIdToReplace, newSceneSelection }) {
    const player = this.players[playerId];

    if (!player.isScientist()) {
      throw 'Non-scientist tried to replace scene tile!';
    }

    this.newSceneTile.selectOption(newSceneSelection);
    const replacedTileIdx = this.sceneTiles.findIndex(tile => tile.id === tileIdToReplace);
    const replacedTiles = this.sceneTiles.splice(replacedTileIdx, 1, this.newSceneTile);
    this.oldSceneTile = replacedTiles[0];

    ++this.roundNum;
    this.state = DeceptionGame.STATE_DELIBERATION;
    this.broadcastGameDataToPlayers();
  }

  accusePlayer(playerId, { suspectId }) {
    const player = this.players[playerId];

    if (player.isScientist()) {
      throw 'Scientist cannot accuse players';
    }

    if (!!this.accuserId || !!this.suspectId) {
      // Someone is already accusing. This could happen due to a race condition.
      return;
    }

    this.accuserId = player.id;
    this.suspectId = suspectId;
    this.accusedMethod = null;
    this.accusedEvidence = null;
    this.accuseLog[player.id] = 1;
    this.accusationActive = true;
    this.accusationResult = null;

    this.broadcastGameDataToPlayers();
  }

  changeAccuseDetails(playerId, { type, value }) {
    if (playerId !== this.accuserId) {
      throw 'Non-accuser tried to change accuse details!';
    }

    const player = this.players[playerId];
    if (type === 'evidence') {
      this.accusedEvidence = value;
    } else if (type === 'method') {
      this.accusedMethod = value;
    }

    this.broadcastGameDataToPlayers();
  }

  confirmAccusation(playerId) {
    if (playerId !== this.accuserId) {
      throw 'Non-accuser tried to confirm accusation!';
    }

    // All three of these must be correct for investigators to win.
    const isMurdererGuessCorrect = this.players[this.suspectId].role === DeceptionGame.ROLE_MURDERER;
    const isMethodGuessCorrect = this.accusedMethod === this.murderMethod.label;
    const isEvidenceGuessCorrect = this.accusedEvidence === this.keyEvidence.label;

    if (isMurdererGuessCorrect && isMethodGuessCorrect && isEvidenceGuessCorrect) {
      // Investigators win!
      this.state = DeceptionGame.STATE_GAME_END;
      this.accusationResult = true;
    } else {
      this.accusationResult = false;
    }
    this.broadcastGameDataToPlayers();
  }

  endAccusation() {
    this.accuserId = null;
    this.suspectId = null;
    this.accusationActive = false;
    this.broadcastGameDataToPlayers();
  }

  setWitnessGuess(playerId, data) {
    const player = this.players[playerId];

    if (!player.isMurderer()) {
      throw 'Non-murderer tried to set witness guess';
    }

    this.witnessSuspectId = this.players[data.playerId];
    this.broadcastGameDataToPlayers();
  }

  guessWitness(playerId, data) {
    const player = this.players[playerId];

    if (!player.isMurderer()) {
      throw 'Non-murderer tried to guess witness';
    }


    const witnessSuspect = this.players[this.witnessSuspectId];

    this.witnessGuessCorrect = witnessSuspect.role === DeceptionGame.ROLE_WITNESS;
    this.broadcastGameDataToPlayers();
  }

  serialize() {
    const {
      accusationActive,
      accusationResult,
      accusedEvidence,
      accusedMethod,
      locationTiles,
      newSceneTile,
      oldSceneTile,
      playersReady,
      state,
    } = this;

    let data = {
      accuseLog: this.accuseLog,
      causeOfDeathTile: this.causeOfDeathTile,
      gameId: DeceptionGame.GAME_ID,
      keyEvidence: this.keyEvidence,
      murderMethod: this.murderMethod,
      roundNum: this.roundNum,
      sceneTiles: this.sceneTiles,
      selectedLocationTile: this.selectedLocationTile,
      totalNumRounds: DeceptionGame.NUM_ROUNDS,
      players: this.players,
      state,
    };

    switch (state) {
      case DeceptionGame.STATE_EXPLAIN_RULES:
      case DeceptionGame.STATE_SHOW_ROLES:
        data = {
          ...data,
          includeAccomplice: this.includeAccomplice,
          includeWitness: this.includeWitness,
          playersReady,
        };
        break;

      case DeceptionGame.STATE_SCIENTIST_LOCATION:
        data = {
          ...data,
          locationTiles,
        }
        break;

      case DeceptionGame.STATE_REPLACE_SCENE:
        data = {
          ...data,
          newSceneTile,
        }
        break;

      case DeceptionGame.STATE_DELIBERATION:
        data = {
          ...data,
          accuserId: this.accuserId,
          accusationActive,
          accusationResult,
          accusedEvidence,
          accusedMethod,
          newSceneTile,
          oldSceneTile,
          suspectId: this.suspectId,
        };
        break;

      case DeceptionGame.STATE_GAME_END:
        data = {
          ...data,
          accusationResult,
          witnessGuessCorrect: this.witnessGuessCorrect,
          witnessSuspectId: this.witnessSuspectId,
        };
    }

    return data;
  }
}

module.exports = DeceptionGame;
