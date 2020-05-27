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

describe('addPlayer', () => {
  const userToAdd = new User({ id: '4', name: 'Mordon' });
  const subject = () => game.addPlayer(userToAdd);

  it('adds to the players object', () => {
    subject();
    const newPlayer = game.players[userToAdd.id];
    expect(newPlayer.id).toEqual(userToAdd.id);
    expect(newPlayer.name).toEqual(userToAdd.name);
  });

  describe('when there is an existing player order', () => {
    it('appends the player to the end of the player order array', () => {
      const oldPlayerOrderLength = game.playerOrder.length;
      subject();
      const newOrderLength = game.playerOrder.length;
      expect(newOrderLength).toEqual(oldPlayerOrderLength + 1);
      expect(game.playerOrder[newOrderLength - 1]).toEqual(userToAdd.id);
    });
  });
});

describe('getConnectedPlayers', () => {
  beforeEach(() => {
    game.players['1'].connected = false;
  });

  it('returns only connected players', () => {
    const connectedPlayers = game.getConnectedPlayers();
    const connectedPlayerIds = connectedPlayers.map(player => player.id);
    expect(connectedPlayerIds).not.toContain('1');
    expect(connectedPlayerIds).toContain('2');
    expect(connectedPlayerIds).toContain('3');
  });
});

describe('removePlayer', () => {
  const playerToRemoveId = '1'
  const subject = () => game.removePlayer(playerToRemoveId);

  it('sets the player\'s connected status to false', () => {
    subject();
    expect(game.players[playerToRemoveId].connected).toEqual(false);
  });

  it('removes the player from the player order array', () => {
    expect(game.playerOrder.indexOf(playerToRemoveId)).toBeGreaterThanOrEqual(0)
    subject();
    expect(game.playerOrder.indexOf(playerToRemoveId)).toEqual(-1);
  });

  describe('when the player is the last in the player order', () => {
    beforeEach(() => {
      game.playerOrder = ['3', '2', '1'];
      game.playerOrderCursor = 2;
    });

    it('decrements the player order cursor', () => {
      subject();
      expect(game.playerOrderCursor).toEqual(1);
    });
  });

  describe('when the player\'s position in the player order is after the current player order cursor position', () => {
    beforeEach(() => {
      game.playerOrder = ['1', '2', '3'];
      game.playerOrderCursor = 1;
    });

    it('does not decrement the player order cursor', () => {
      subject();
      expect(game.playerOrderCursor).toEqual(1);
    });
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
    const { roundNum } = game;
    subject();
    expect(game.roundNum).toEqual(roundNum + 1);
  });
});
