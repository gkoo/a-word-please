import Game, { GameEnum } from '../game';

export enum GameState {
  Pending,
  TurnEnd,
  GameEnd,
  // (optional) Explain the rules to first time players
  ExplainRules,
  EnterPhrasesPhase,
  DrawingPhase,
  VotingPhase,
  Results,
}

class SfArtistGame extends Game {
  allStrokes: Array<object>;
  roomCode: string;
  playerSubmittedEntries: object;

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
    this.playersReady = {};
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
      default:
        throw new Error(`Unrecognized player action: ${data.action}!`);
    }
  }

  onPlayersReady() {
    switch (this.state) {
      case GameState.ExplainRules:
        this.state = GameState.EnterPhrasesPhase;
        break;
      case GameState.EnterPhrasesPhase:
        this.enterDrawingPhase();
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
      category: cateogry.substring(0, maxLength),
    };
    this.playerReady(playerId);
  }

  // Choose what everyone's going to draw, out of the entries submitted by the players
  chooseSubject() {
    const realArtistIds = Object.keys(this.playerSubmittedEntries).filter(
      playerId => playerId !== this.fakeArtist.id
    );
    const artistIdDeck = new Deck(artistDeck);

    // The player ID whose submitted entry we used. We'll use this later to ask them to replace
    // their entry with a new one.
    this.entryPlayerId = artistIdDeck.drawCard();

    this.subjectEntry = this.playerSubmittedEntries[this.entryPlayerId];
  }

  enterDrawingPhase() {
    this.determinePlayerOrder();
    this.assignRoles();
    this.chooseSubject();
    this.state = GameState.DrawingPhase;
    this.broadcastGameDataToPlayers();
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
    this.advancePlayerTurn();
    this.broadcastGameDataToPlayers();
  }

  serialize() {
    return {
      fakeArtistId: this.fakeArtistId,
      gameId: GameEnum.SfArtist,
      players: this.players,
      playersReady: this.playersReady,
      spectators: this.spectators,
      state: this.state,
      subjectEntry: this.subjectEntry,
    };
  }
}

export default SfArtistGame;
