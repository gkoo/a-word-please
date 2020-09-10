const http = require('http');

const socketIO = require('socket.io');
const MockExpress = require('mock-express');

const mockApp = MockExpress();
const mockServer = http.createServer(mockApp);
const mockIo = socketIO(mockServer);

const User = require('../user.js');
const DeceptionGame = require('./deceptionGame.js');

let game;

beforeEach(() => {
  const users = {
    '1': new User({ id: '1', name: 'Gordon' }),
    '2': new User({ id: '2', name: 'Fordon' }),
    '3': new User({ id: '3', name: 'Bordon' }),
    '4': new User({ id: '4', name: 'Mordon' }),
  };

  game = new DeceptionGame(mockIo, users);
  game.setup(users);
});

describe('assignRoles', () => {
  // called as part of setup()
  it('assigns exactly one scientist and one murderer', () => {
    const players = Object.values(game.players);
    const scientists = players.filter(player => player.role === DeceptionGame.ROLE_SCIENTIST);
    const murderers = players.filter(player => player.role === DeceptionGame.ROLE_MURDERER);
    const investigators = players.filter(player => player.role === DeceptionGame.ROLE_INVESTIGATOR);
    expect(scientists).toHaveLength(1);
    expect(murderers).toHaveLength(1);
    expect(investigators).toHaveLength(2);
  });
});

describe('dealCards', () => {
  // called as part of setup()
  it('deals cards for each player, except for the scientist', () => {
    Object.values(game.players).forEach(player => {
      if (player.role === DeceptionGame.ROLE_SCIENTIST) {
        expect(player.evidenceCards).toHaveLength(0);
        expect(player.methodCards).toHaveLength(0);
      } else {
        expect(player.evidenceCards).toHaveLength(DeceptionGame.NUM_CLUE_CARDS_PER_PLAYER);
        expect(player.methodCards).toHaveLength(DeceptionGame.NUM_CLUE_CARDS_PER_PLAYER);
      }
    });
  });
});
