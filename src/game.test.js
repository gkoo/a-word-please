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
    '1': new User({ id: '1', name: 'Gordon' }),
    '2': new User({ id: '2', name: 'Fordon' }),
    '3': new User({ id: '3', name: 'Bordon' }),
  };
  game = new Game({
    broadcastToRoom: mockBroadcastToRoom,
    broadcastSystemMessage: mockBroadcastSystemMessage,
    broadcastTo: mockBroadcastTo,
    users,
  });
  game.setup(users);
});

describe('removeUser', () => {
  const playerToRemoveId = '1'
  const subject = () => game.removeUser(playerToRemoveId);

  it('sets the player\'s connected status to false', () => {
    subject();
    expect(game.players[playerToRemoveId].connected).toEqual(false);
  });

  describe('when the player has submitted a clue', () => {
    beforeEach(() => {
      game.clues = {
        [playerToRemoveId]: {
          clue: 'jellyfish',
          isDuplicate: false,
        },
      };
    });

    it('removes any clues the player has submitted', () => {
      subject();
      expect(game.clues[playerToRemoveId]).toBeFalsy();
    });
  });

  describe('when it is the player\'s turn', () => {
    beforeEach(() => {
      game.playerOrder = ['1', '2', '3'];
      game.playerOrderCursor = 1;
      game.guesserId = playerToRemoveId;
    });

    it('advances to the next turn', () => {
      subject();
      expect(game.guesserId).toEqual('2');
    });

    it('doesn\'t change the round number', () => {
      const { roundNum } = game;
      subject();
      expect(game.roundNum).toEqual(roundNum);
    });
  });
});

describe('nextTurn', () => {
  const subject = () => game.nextTurn();

  it('changes the guesser', () => {
    subject();
    const { guesserId } = game;
    subject();
    expect(game.guesserId).not.toEqual(guesserId);
  });

  it('increments the round number', () => {
    subject();
  });
});
