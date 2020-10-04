import Game, { GameEnum } from '../game';
import Deck from '../deck';
import { resolveVotes } from '../utils';

export enum GameState {
  Pending,
  TurnEnd,
  GameEnd,
  // (optional) Explain the rules to first time players
  ExplainRules,
  EnterSubjectsPhase,
  DisplaySubject,
  DrawingPhase,
  VotingPhase,
  Results,
}

const TURNS_PER_PLAYER = 2;

interface SubjectEntry {
  category: string,
  subject: string,
}

class SfArtistGame extends Game {
  allStrokes: Array<object>;
  entryPlayerId: string; // the player whose subject entry we used
  fakeArtistId: string;
  roomCode: string;
  playerSubmittedEntries: object;
  subjectEntry: SubjectEntry;
  totalTurns: number;
  turnNum: number;
  votes: object;

  constructor(broadcastToRoom, roomCode) {
    super(broadcastToRoom);
    this.roomCode = roomCode;
    this.playerSubmittedEntries = {};
  }

  setup(users) {
    super.setup(users);
    this.newGame();
    this.allStrokes = [];
  }

  newGame() {
    this.turnNum = 0;
    this.playersReady = {};
    this.votes = {};
    this.state = GameState.ExplainRules;
    this.broadcastGameDataToPlayers();
  }

  assignRoles() {
    const players = this.getConnectedPlayers();
    const playerDeck = new Deck(players);
    const fakeArtist = playerDeck.drawCard();
    this.fakeArtistId = fakeArtist.id;
  }

  handlePlayerAction(socket: SocketIO.Socket, data: { [key: string]: any }) {
    const playerId = socket.id;

    switch (data.action) {
      case 'ready':
        return this.playerReady(playerId);
      case 'submitSubject':
        return this.setPlayerEntry(playerId, data.subject, data.category);
      case 'newStroke':
        return this.newStroke(socket, data);
      case 'vote':
        return this.vote(playerId, data);
      default:
        throw new Error(`Unrecognized player action: ${data.action}!`);
    }
  }

  onPlayersReady() {
    switch (this.state) {
      case GameState.ExplainRules:
        this.state = GameState.EnterSubjectsPhase;
        break;
      case GameState.EnterSubjectsPhase:
        this.assignRoles();
        this.chooseSubject();
        this.state = GameState.DisplaySubject;
        break;
      case GameState.DisplaySubject:
        this.enterDrawingPhase();
        break;
      case GameState.VotingPhase:
        this.showResults();
        break;
      default:
        throw 'Unexpected state change!'
    }
    setTimeout(() => this.broadcastGameDataToPlayers(), 500);
  }

  setPlayerEntry(playerId: string, subject: string, category: string) {
    const maxLength = 50;
    this.playerSubmittedEntries[playerId] = {
      subject: subject.substring(0, maxLength),
      category: category.substring(0, maxLength),
    };
    this.playerReady(playerId);
  }

  // Choose what everyone's going to draw, out of the entries submitted by the players
  chooseSubject() {
    const realArtistIds = Object.keys(this.playerSubmittedEntries).filter(
      playerId => playerId !== this.fakeArtistId
    );
    const realArtistIdDeck = new Deck(realArtistIds);

    // The player ID whose submitted entry we used. We'll use this later to ask them to replace
    // their entry with a new one.
    this.entryPlayerId = realArtistIdDeck.drawCard();

    this.subjectEntry = this.playerSubmittedEntries[this.entryPlayerId];
  }

  enterDrawingPhase() {
    this.determinePlayerOrder();
    this.totalTurns = this.getConnectedPlayers().length * TURNS_PER_PLAYER;
    this.state = GameState.DrawingPhase;
  }

  newStroke(socket: SocketIO.Socket, data: any) {
    const playerId = socket.id;

    if (playerId !== this.activePlayerId) {
      throw new Error('Player tried to submit stroke when it wasn\'t their turn!');
    }

    this.allStrokes.push(data.path);

    // Send the new stroke to everyone except the sender
    socket.to(this.roomCode).emit('newStroke', data.path);

    this.nextTurn();
  }

  nextTurn() {
    // Enter voting phase after everyone has had two turns
    if (++this.turnNum >= this.totalTurns) {
      this.enterVotingPhase();
    } else {
      this.advancePlayerTurn();
    }

    this.broadcastGameDataToPlayers();
  }

  enterVotingPhase() {
    this.state = GameState.VotingPhase;
    this.broadcastGameDataToPlayers();
  }

  vote(playerId: string, data) {
    this.votes[playerId] = data.votedPlayerId;
    this.playerReady(playerId);
    this.broadcastGameDataToPlayers();
  }

  showResults() {
    this.state = GameState.Results;
    this.broadcastGameDataToPlayers();
  }

  serialize() {
    return {
      activePlayerId: this.activePlayerId,
      fakeArtistId: this.fakeArtistId,
      gameId: GameEnum.SfArtist,
      players: this.players,
      playersReady: this.playersReady,
      spectators: this.spectators,
      state: this.state,
      subjectEntry: this.subjectEntry,
      turnNum: this.turnNum,
      totalTurns: this.totalTurns,
      votes: this.votes,
    };
  }
}

export default SfArtistGame;
