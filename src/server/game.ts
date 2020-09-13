import _ from 'lodash';

import User from './user';
import Player from './player';

export enum GameEnum {
  AWordPlease = 1,
  Werewolf,
  Wavelength,
  Deception,
}

abstract class Game {
  broadcastToRoom: (eventName: string, data: any) => void;
  activePlayerId: string;
  players: object;
  playerClass: any;
  playerOrder: Array<string>;
  spectators: { [playerId: string]: Player };
  state: number;

  static STATE_PENDING = 0;
  static STATE_TURN_END = 1;
  static STATE_GAME_END = 2;

  constructor(broadcastToRoom) {
    this.broadcastToRoom = broadcastToRoom;
    this.players = {};
    this.spectators = {};
    this.playerClass = Player;
  }

  broadcastGameDataToPlayers() {
    this.broadcastToRoom('gameData', this.serialize());
  }

  setup(users: object) {
    const connectedUsers = Object.values(users).filter(user => user.connected);
    const playerUsers = connectedUsers.filter((user: User) => !user.isSpectator);
    const spectatorUsers = connectedUsers.filter((user: User) => user.isSpectator);

    playerUsers.forEach(user => this.addPlayer(user));
    spectatorUsers.forEach(user => this.addSpectator(user));
  }

  getConnectedPlayers() {
    return Object.values(this.players).filter(player => player.connected);
  }

  determinePlayerOrder() {
    const playerIds = this.getConnectedPlayers().map(player => player.id);
    this.playerOrder = _.shuffle(playerIds);
    this.activePlayerId = this.playerOrder[0];
  }

  advancePlayerTurn() {
    if (this.activePlayerId && this.playerOrder) {
      const playerOrderIdx = this.playerOrder.indexOf(this.activePlayerId);
      this.activePlayerId = this.playerOrder[(playerOrderIdx + 1) % this.playerOrder.length]
    }
  }

  maybeReconnect(user: User, originalSocketId: string) {
    // Look for the player based on their socketId.
    let player = Object.values(this.players).find(p => p.id === originalSocketId);

    if (!player && user.name) {
      // For some reason, some clients don't reconnect correctly. Let's just place them in the
      // player slot of any disconnected player.
      player = Object.values(this.players).find(p => !p.connected);
    }

    // In case a game started while the player was reconnecting
    if (!player) {
      if (user.name) {
        // Only add user to the game if they have a name
        this.addPlayer(user);
      }
      return;
    }

    // RECONNECTING: There was a player here before. Let's restore her.
    player.id = user.id;
    player.connected = true;

    if (user.name) {
      player.name = user.name;
    }

    this.players[player.id] = player;
    delete this.players[originalSocketId];
    this.broadcastGameDataToPlayers();
  }

  // Players will start off with an id equal to their socket.id. However, this won't necessarily
  // always be the case. If there is a temporary disconnect and the player reconnects, we will
  // attempt to reconnect them to the same ID that they had before, but using their new socket.id
  // value for communication.
  addPlayer({ id, name }): void {
    if (!name) { return; }

    this.players[id] = new this.playerClass({
      id,
      name,
    });
  }

  addSpectator({ id, name }): void {
    if (!name) { return; }

    this.spectators[id] = new Player({
      id,
      name,
      isSpectator: true,
    });
  }

  disconnectPlayer(id): void {
    if (this.players[id]) { this.players[id].connected = false; }
    if (this.spectators[id]) { this.spectators[id].connected = false; }
    this.broadcastGameDataToPlayers();
  }

  abstract newGame(): void;

  abstract nextTurn(): void;

  abstract handlePlayerAction(socketId: string, data: { [key: string]: any }): void;

  endGame() {
    this.state = Game.STATE_GAME_END;
    this.broadcastGameDataToPlayers();
  }

  // Send all players back to the lobby
  setPending() {
    this.state = Game.STATE_PENDING;
    this.players = {};
    this.broadcastGameDataToPlayers();
  }

  serialize() {
    throw new Error('need to define serialize!');
  };
}

export default Game;
