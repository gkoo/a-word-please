const _ = require('lodash');

const Game = require('./game');
const User = require('./user');

let game;
let players;

const mockBroadcastToRoom = jest.fn();
const mockBroadcastSystemMessage = jest.fn();
const mockBroadcastTo = jest.fn();

beforeEach(() => {
  users = {
    '1': new User('1'),
    '2': new User('2'),
    '3': new User('3'),
  };
  game = new Game({
    broadcastToRoom: mockBroadcastToRoom,
    broadcastSystemMessage: mockBroadcastSystemMessage,
    broadcastTo: mockBroadcastTo,
    users,
  });
  game.setup(users);
});

describe('newRound', () => {
});

describe('removeUser', () => {
  it('removes the user from player list', () => {
    const id = '123'
    game.players = { [id]: {} };
    game.removeUser(id);
    expect(game.players[id].connected).toEqual(false);
  });
});

describe('nextTurn', () => {
  const subject = () => game.nextTurn();

  it('changes the guesser', () => {
    subject();
    const { guesserId } = game;
    subject();
    const newGuesserId = game.activePlayerId;
    expect(newGuesserId).not.toEqual(guesserId);
  });
});
