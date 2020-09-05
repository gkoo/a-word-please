import Clue, { ClueType } from './clue';
import DeceptionPlayer from './deceptionPlayer';
import Deck from '../deck';
import Game from '../game';
import Player from '../player';
import Tile, { TileType } from './tile';
import evidenceList from './evidenceList';
import methodList from './methodList';
import locationTileList from './locationTileList';
import sceneTileList from './sceneTileList';

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

enum GameState {
  Pending,
  TurnEnd,
  GameEnd,
  // (optional) Explain the rules to first time players
  ExplainRules = 3,
  ShowRoles,
  // Murderer chooses means of murder and key evidence. (optional) Accomplice learns murderer
  // identity
  ChooseMeansEvidence,
  // (optional) Witness learns murderer and accomplice identity
  Witnessing, // optional
  // Murderer chooses cause of death
  ScientistCauseOfDeath,
  // Scientist chooses location
  ScientistLocation,
  // Scientist chooses scene markers
  ScientistInitialSceneTiles,
  // Players make their cases
  Deliberation,
  // Scientist replaces a scene tile
  ReplaceScene,
}

interface GameData {
  accusationActive?: boolean;
  accusationResult?: boolean;
  accusedEvidence?: string;
  accusedMethod?: string;
  accuserId?: string;
  accuseLog: { [playerId: string]: boolean };
  causeOfDeathTile: Tile;
  gameId: number;
  includeAccomplice?: boolean;
  includeWitness?: boolean;
  locationTiles?: Array<Tile>;
  keyEvidence: Clue;
  murderMethod: Clue;
  newSceneTile?: Tile;
  oldSceneTile?: Tile;
  roundNum: number;
  sceneTiles: Array<Tile>;
  selectedLocationTile: Tile;
  suspectId?: string;
  totalNumRounds: number;
  players: { [playerId: string]: DeceptionPlayer },
  playersReady?: { [playerId: string]: boolean },
  state: GameState,
  witnessGuessCorrect?: boolean;
  witnessSuspectId?: string;
}

export enum Role {
  Scientist = 1,
  Murderer,
  Investigator,
  Accomplice,
  Witness,
}

class DeceptionGame extends Game {
  accusationActive?: boolean;
  accusationResult: boolean | null;
  accuserId?: string;
  accuseLog: { [playerId: string]: boolean };
  accusedEvidence?: string;
  accusedMethod?: string;
  broadcastToRoom: (eventName: string, data: any) => void;
  causeOfDeathTile: Tile;
  includeAccomplice?: boolean;
  includeWitness?: boolean;
  keyEvidence: Clue;
  locationTiles?: Array<Tile>;
  murderMethod: Clue;
  newSceneTile?: Tile;
  oldSceneTile?: Tile;
  players: { [playerId: string]: DeceptionPlayer };
  playerClass: any;
  playersReady?: { [playerId: string]: boolean };
  roundNum: number;
  sceneTileDeck: Deck;
  sceneTiles: Array<Tile>;
  selectedLocationTile: Tile;
  state: GameState;
  suspectId?: string;
  witnessGuessCorrect?: boolean | undefined;
  witnessSuspectId?: string;

  static GAME_ID = Game.GAME_DECEPTION;

  static MIN_PLAYERS = 4;
  static MAX_PLAYERS = 12;
  static NUM_ROUNDS = 3;

  static NUM_CLUE_CARDS_PER_PLAYER = 4;

  constructor(broadcastToRoom) {
    super(broadcastToRoom);
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
    this.accuserId = null;
    this.accusedEvidence = null;
    this.accusedMethod = null;
    this.accusationActive = false;
    this.accusationResult = undefined;
    this.suspectId = null;
    this.witnessGuessCorrect = undefined;
    this.witnessSuspectId = null;

    this.dealCards();
    this.createTiles();
    this.state = GameState.ExplainRules;
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
      type: TileType.CauseOfDeath,
    });
  }

  createLocationTiles() {
    this.locationTiles = locationTileList.map((locationTileData, idx) =>
      new Tile({
        id: idx,
        label: locationTileData.label,
        options: locationTileData.options,
        type: TileType.Location,
      })
    );
  }

  createSceneTileDeck() {
    const sceneTiles = sceneTileList.map((sceneTileData, idx) =>
      new Tile({
        id: idx,
        label: sceneTileData.label,
        options: sceneTileData.options,
        type: TileType.Scene,
      })
    );
    this.sceneTileDeck = new Deck(sceneTiles);
    this.sceneTileDeck.shuffle();
  }

  assignRoles() {
    const rolesToUse = [
      Role.Scientist,
      Role.Murderer,
    ];
    if (this.includeAccomplice) {
      rolesToUse.push(Role.Accomplice);
    }
    if (this.includeWitness) {
      rolesToUse.push(Role.Witness);
    }
    const numPlayers = Object.values(this.players).length;
    const numInvestigators = numPlayers - rolesToUse.length;
    let i;
    for (i = 0; i < numInvestigators; ++i) {
      rolesToUse.push(Role.Investigator);
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
      (evidenceLabel, i) => new Clue(evidenceLabel, i, ClueType.KeyEvidence)
    );
    const methodCards = methodList.map(
      (methodLabel, i) => new Clue(methodLabel, i, ClueType.MurderMethod)
    );

    const evidenceDeck = new Deck(evidenceCards);
    const methodDeck = new Deck(methodCards);

    evidenceDeck.shuffle();
    methodDeck.shuffle();

    Object.values(this.players).forEach(player => {
      if (player.role === Role.Scientist) {
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
    this.playersReady[playerId] = true;
    this.broadcastGameDataToPlayers();

    if (Object.keys(this.playersReady).length < Object.keys(this.players).length) {
      return;
    }

    // Everyone is ready!
    this.playersReady = {};
    switch (this.state) {
      case GameState.ExplainRules:
        this.assignRoles();
        this.state = GameState.ShowRoles;
        break;
      case GameState.ShowRoles:
        this.state = GameState.ChooseMeansEvidence;
        break;
      default:
        throw 'Unexpected state change!'
    }
    setTimeout(() => this.broadcastGameDataToPlayers(), 500);
  }

  toggleRole(playerId, { role, shouldInclude }) {
    if (role === Role.Witness) {
      this.includeWitness = shouldInclude;
    }
    if (role === Role.Accomplice) {
      this.includeAccomplice = shouldInclude;
    }
    this.broadcastGameDataToPlayers();
  }

  chooseMeansAndEvidence(playerId, { methodId, evidenceId }) {
    const player = this.players[playerId];

    if (player.role !== Role.Murderer) {
      throw 'Non-murderer tried to choose means and evidence!';
    }

    this.murderMethod = player.methodCards.find(method => method.id === methodId);
    this.keyEvidence = player.evidenceCards.find(evidence => evidence.id === evidenceId);

    this.state = GameState.ScientistCauseOfDeath;
    this.broadcastGameDataToPlayers();
  }

  selectCauseOfDeath(playerId, data) {
    const player = this.players[playerId];

    if (player.role !== Role.Scientist) {
      throw 'Non-scientist tried to select cause of death!';
    }

    this.causeOfDeathTile.selectOption(data.causeOfDeath);

    this.state = GameState.ScientistLocation;
    this.broadcastGameDataToPlayers();
  }

  selectLocation(playerId, data) {
    const player = this.players[playerId];
    const { location, locationTileId } = data;

    if (player.role !== Role.Scientist) {
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
    this.state = GameState.ScientistInitialSceneTiles;
    this.sceneTiles = [];

    const numSceneTiles = 4;
    for (let i = 0; i < numSceneTiles; ++i) {
      this.sceneTiles.push(this.sceneTileDeck.drawCard());
    }
    this.broadcastGameDataToPlayers();
  }

  selectInitialSceneTiles(playerId, { sceneSelections }) {
    const player = this.players[playerId];

    if (player.role !== Role.Scientist) {
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

    this.state = GameState.Deliberation;
    this.broadcastGameDataToPlayers();
  }

  endRound() {
    if (this.roundNum >= DeceptionGame.NUM_ROUNDS) {
      this.state = GameState.GameEnd;
    } else {
      this.state = GameState.ReplaceScene;
      this.newSceneTile = this.sceneTileDeck.drawCard();
    }
    this.broadcastGameDataToPlayers();
  }

  replaceSceneTile(playerId, { tileIdToReplace, newSceneSelection }) {
    const player = this.players[playerId];

    if (player.role !== Role.Scientist) {
      throw 'Non-scientist tried to replace scene tile!';
    }

    this.newSceneTile.selectOption(newSceneSelection);
    const replacedTileIdx = this.sceneTiles.findIndex(tile => tile.id === tileIdToReplace);
    const replacedTiles = this.sceneTiles.splice(replacedTileIdx, 1, this.newSceneTile);
    this.oldSceneTile = replacedTiles[0];

    this.nextTurn();
  }

  nextTurn() {
    ++this.roundNum;
    this.state = GameState.Deliberation;
    this.broadcastGameDataToPlayers();
  }

  accusePlayer(playerId, { suspectId }) {
    const player = this.players[playerId];

    if (player.role === Role.Scientist) {
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
    this.accuseLog[player.id] = true;
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
    const isMurdererGuessCorrect = this.players[this.suspectId].role === Role.Murderer;
    const isMethodGuessCorrect = this.accusedMethod === this.murderMethod.label;
    const isEvidenceGuessCorrect = this.accusedEvidence === this.keyEvidence.label;

    if (isMurdererGuessCorrect && isMethodGuessCorrect && isEvidenceGuessCorrect) {
      // Investigators win!
      this.state = GameState.GameEnd;
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

    if (player.role !== Role.Murderer) {
      throw 'Non-murderer tried to set witness guess';
    }

    this.witnessSuspectId = data.playerId;
    this.broadcastGameDataToPlayers();
  }

  guessWitness(playerId, data) {
    const player = this.players[playerId];

    if (player.role !== Role.Murderer) {
      throw 'Non-murderer tried to guess witness';
    }


    const witnessSuspect = this.players[this.witnessSuspectId];

    this.witnessGuessCorrect = witnessSuspect.role === Role.Witness;
    this.broadcastGameDataToPlayers();
  }

  serialize(): GameData {
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

    let data: GameData = {
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
      case GameState.ExplainRules:
      case GameState.ShowRoles:
        data = {
          ...data,
          includeAccomplice: this.includeAccomplice,
          includeWitness: this.includeWitness,
          playersReady,
        };
        break;

      case GameState.ScientistLocation:
        data = {
          ...data,
          locationTiles,
        }
        break;

      case GameState.ReplaceScene:
        data = {
          ...data,
          newSceneTile,
        }
        break;

      case GameState.Deliberation:
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

      case GameState.GameEnd:
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

export default DeceptionGame;
