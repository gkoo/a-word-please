import http from 'http';

import socketIO from 'socket.io';
import MockExpress from 'mock-express';

import User from '../user';
import DeceptionGame, { GameState, Role } from './deceptionGame';
import DeceptionPlayer from './deceptionPlayer';

let game;

beforeEach(() => {
  const broadcastToRoom = jest.fn((eventName: string, data: any) => {});
  const users = {
    '1': new User({ id: '1', name: 'Gordon' }),
    '2': new User({ id: '2', name: 'Fordon' }),
    '3': new User({ id: '3', name: 'Bordon' }),
    '4': new User({ id: '4', name: 'Mordon' }),
  };

  game = new DeceptionGame(broadcastToRoom);
  game.setup(users);
});

describe('addPlayer', () => {
  let newUser: User = new User({ id: '5', name: 'Lordon' });

  const subject = () => game.addPlayer(newUser);

  describe('when the game is in ExplainRules state', () => {
    beforeEach(() => {
      game.state = GameState.ExplainRules;
    });

    it('adds the user as a player', () => {
      const originalNumSpectators = Object.keys(game.spectators).length;
      const originalNumPlayers = Object.keys(game.players).length;
      expect(originalNumPlayers).toEqual(4);

      subject();

      const newNumSpectators = Object.keys(game.spectators).length;
      const newNumPlayers = Object.keys(game.players).length;

      expect(newNumSpectators).toEqual(originalNumSpectators);
      expect(newNumPlayers).toEqual(originalNumPlayers + 1);
    });
  });

  describe('when the game is in Deliberation state', () => {
    beforeEach(() => {
      game.state = GameState.Deliberation;
    });

    it('adds the user as a spectator', () => {
      const originalNumSpectators = Object.keys(game.spectators).length;
      const originalNumPlayers = Object.keys(game.players).length;

      subject();

      const newNumSpectators = Object.keys(game.spectators).length;
      const newNumPlayers = Object.keys(game.players).length;

      expect(newNumSpectators).toEqual(originalNumSpectators + 1);
      expect(newNumPlayers).toEqual(originalNumPlayers);
    });
  });
});

describe('assignRoles', () => {
  // called as part of setup()
  it('assigns exactly one scientist and one murderer', () => {
    game.assignRoles();
    const players = Object.values(game.players);
    const scientists = players.filter((player: DeceptionPlayer) => player.role === Role.Scientist);
    const murderers = players.filter((player: DeceptionPlayer) => player.role === Role.Murderer);
    const investigators = players.filter((player: DeceptionPlayer) => player.role === Role.Investigator);
    expect(scientists).toHaveLength(1);
    expect(murderers).toHaveLength(1);
    expect(investigators).toHaveLength(2);
  });
});

describe('dealCards', () => {
  // called as part of setup()
  it('deals cards for each player, except for the scientist', () => {
    game.dealCards();
    Object.values(game.players).forEach((player: DeceptionPlayer) => {
      if (player.role === Role.Scientist) {
        expect(player.evidenceCards).toHaveLength(0);
        expect(player.methodCards).toHaveLength(0);
      } else {
        expect(player.evidenceCards).toHaveLength(DeceptionGame.NUM_CLUE_CARDS_PER_PLAYER);
        expect(player.methodCards).toHaveLength(DeceptionGame.NUM_CLUE_CARDS_PER_PLAYER);
      }
    });
  });
});
