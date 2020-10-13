import fs from 'fs';
import path from 'path';
import Game, { GameEnum } from '../game';
import SfArtistPlayer from './sfArtistPlayer';
import Deck from '../deck';

export enum GameState {
  Pending,
  TurnEnd,
  GameEnd,
  // (optional) Explain the rules to first time players
  ExplainRules,
  DisplaySubject,
  DrawingPhase,
  VotingPhase,
}

const COLORS = [
  '#0000ff', // blue
  '#b22222', // red
  '#006400', // green
  '#ff8c00', // orange
  '#4b0082', // indigo
  '#a52a2a', // brown
  '#000000', // black
  '#663399', // purple
]

const TURNS_PER_PLAYER = 2;

interface SubjectEntry {
  category: string,
  subject: string,
}

class SfArtistGame extends Game {
  allStrokes: Array<object>;
  colorCursor: number;
  fakeArtistId: string;
  revealFake: boolean;
  roomCode: string;
  subjectEntry: SubjectEntry;
  totalTurns: number;
  turnNum: number;
  votes: object;

  constructor(broadcastToRoom, roomCode) {
    super(broadcastToRoom);
    this.roomCode = roomCode;
    this.playerClass = SfArtistPlayer;
    this.colorCursor = 0;
  }

  setup(users) {
    super.setup(users);
    this.newGame();
    this.allStrokes = [];
  }

  newGame() {
    this.revealFake = false;
    this.turnNum = 0;
    this.playersReady = {};
    this.votes = {};
    this.state = GameState.ExplainRules;
    this.broadcastGameDataToPlayers();

    const isProduction = process.env.NODE_ENV === 'production';

    if (!isProduction) {
      this.subjectEntry = {
        category: 'Game',
        subject: 'A Fake Artist Goes To San Francisco',
      };
    } else {
      const staticPath = `../../${isProduction ? '' : '../'}static`
      const filepath = path.join(__dirname, staticPath, 'sf-artist-subjects.txt');

      fs.readFile(filepath, 'utf8' , (err, data) => {
        if (err) {
          console.error(err);
          return;
        }
        const subjectEntries = data.split('\n').filter(entry => entry !== '');
        const randomIndex = Math.floor(Math.random() * subjectEntries.length);
        const entry = subjectEntries[randomIndex].split(',');
        this.subjectEntry = {
          category: entry[1],
          subject: entry[0],
        };
      });
    }
  }

  addPlayer({ id, name }) {
    super.addPlayer({ id, name });
    this.players[id].setBrushColor(COLORS[this.colorCursor]);
    this.colorCursor = this.colorCursor + 1 % COLORS.length;
  }

  assignRoles() {
    const players = this.getConnectedPlayers();
    const playerDeck = new Deck(players);
    playerDeck.shuffle();
    const fakeArtist = playerDeck.drawCard();
    this.fakeArtistId = fakeArtist.id;
  }

  handlePlayerAction(socket: SocketIO.Socket, data: { [key: string]: any }) {
    const playerId = socket.id;

    switch (data.action) {
      case 'ready':
        return this.playerReady(playerId);
      case 'newStroke':
        return this.newStroke(socket, data);
      case 'vote':
        return this.vote(playerId, data);
      case 'revealFake':
        this.revealFake = true;
        this.broadcastGameDataToPlayers();
        return;
      default:
        throw new Error(`Unrecognized player action: ${data.action}!`);
    }
  }

  onPlayersReady() {
    switch (this.state) {
      case GameState.ExplainRules:
        this.assignRoles();
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
    this.state = GameState.GameEnd;
    this.broadcastGameDataToPlayers();
  }

  serialize() {
    return {
      activePlayerId: this.activePlayerId,
      fakeArtistId: this.fakeArtistId,
      gameId: GameEnum.SfArtist,
      players: this.players,
      playersReady: this.playersReady,
      revealFake: this.revealFake,
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
