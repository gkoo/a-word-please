import http from 'http';

import _ from 'lodash';
import socketIO from 'socket.io';
import MockExpress from 'mock-express';

import AWPGame, { GameState } from './awp-game';
import User from '../user';

let game;

beforeEach(() => {
  const broadcastToRoom = jest.fn((eventName: string, data: any) => {});
  const users = {
    '1': new User({ id: '1', name: 'Gordon' }),
    '2': new User({ id: '2', name: 'Fordon' }),
    '3': new User({ id: '3', name: 'Bordon' }),
  };
  game = new AWPGame(broadcastToRoom);
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

describe('disconnectPlayer', () => {
  const playerToRemoveId = '1'
  const subject = () => game.disconnectPlayer(playerToRemoveId);

  it('sets the player\'s connected status to false', () => {
    subject();
    expect(game.players[playerToRemoveId].connected).toEqual(false);
  });

  it('removes the player from the player order array', () => {
    expect(game.playerOrder.indexOf(playerToRemoveId)).toBeGreaterThanOrEqual(0)
    subject();
    expect(game.playerOrder.indexOf(playerToRemoveId)).toEqual(-1);
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
      game.activePlayerId = playerToRemoveId;
    });

    it('advances to the next turn', () => {
      subject();
      expect(game.activePlayerId).toEqual('2');
    });

    it('doesn\'t change the round number', () => {
      const { roundNum } = game;
      subject();
      expect(game.roundNum).toEqual(roundNum);
    });
  });

  describe('when the game is in entering guess state', () => {
    beforeEach(() => {
      game.activePlayerId = '2';
      game.playerOrder = ['1', '2', '3'];
      game.playerOrderCursor = 2;
      game.clues = {
        '1': {
          clue: 'butt',
          isDuplicate: false,
        },
        '3': {
          clue: 'poop',
          isDuplicate: false,
        },
      };
      game.state = GameState.EnteringGuess;
    });

    it('doesn\'t change game state', () => {
      const { state } = game;
      subject();
      expect(game.state).toEqual(state);
    });
  });

  describe('when the game state is entering clues', () => {
    beforeEach(() => {
      game.activePlayerId = '2';
      game.playerOrder = ['1', '2', '3'];
      game.playerOrderCursor = 2;
      game.state = GameState.EnteringClues;
    });

    describe('and all clues are in', () => {
      beforeEach(() => {
        game.clues = {
          '3': {
            clue: 'poop',
            isDuplicate: false,
          },
        };
      });

      it.only('changes the game state', () => {
        const { state } = game;
        subject();
        expect(game.state).not.toEqual(state);
        expect(game.state).toEqual(GameState.ReviewingClues);
      });
    });

    describe('and some clues are still pending', () => {
    });
  });
});

describe('nextTurn', () => {
  const subject = () => game.nextTurn();

  it('changes the guesser', () => {
    subject();
    const { activePlayerId } = game;
    subject();
    expect(game.activePlayerId).not.toEqual(activePlayerId);
  });

  it('increments the round number', () => {
    const { roundNum } = game;
    subject();
    expect(game.roundNum).toEqual(roundNum + 1);
  });
});
