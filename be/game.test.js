const _ = require('lodash');

const Game = require('./game');
const Player = require('./Player');

let game;
let players = {
  '1': new Player('1'),
  '2': new Player('2'),
  '3': new Player('3'),
};

const mockBroadcast = jest.fn();
const mockEmitToPlayer = jest.fn();

beforeEach(() => {
  game = new Game({
    broadcast: mockBroadcast,
    emitToPlayer: mockEmitToPlayer,
    players: players,
  });
  game.setup();
});

describe('setup', () => {
  it('deals cards', () => {
    expect(game.deck).toHaveLength(15);
    Object.values(game.players).forEach(player => {
      expect(player.hand).toHaveLength(1);
      expect(player.hand[0]).toBeGreaterThanOrEqual(0);
    });
  });
});

describe('nextTurn', () => {
  const subject = () => game.nextTurn();

  it('changes the player turn', () => {
    subject();
    const { activePlayerId } = game;
    subject();
    const newActivePlayerId = game.activePlayerId;
    expect(newActivePlayerId).not.toEqual(activePlayerId);
  });

  it('adds a card to the hand of the player', () => {
    const oldPlayers = _.cloneDeep(game.players);
    subject();
    const oldHand = oldPlayers[game.activePlayerId].hand;
    const newHand = game.players[game.activePlayerId].hand;
    expect(newHand.length).toBeGreaterThan(oldHand.length);
  });

  describe('when a player has been knocked out', () => {
    beforeEach(() => {
      const secondPlayerId = game.playerOrder[1];
      game.players[secondPlayerId].isKnockedOut = true;
    });

    it('skips the knocked out player', () => {
      const thirdPlayerId = game.playerOrder[2];
      subject();
      subject();
      expect(game.activePlayerId).toEqual(thirdPlayerId);
    });
  });
});

describe('playCard', () => {
  beforeEach(() => {
    game.nextTurn();
    game.players[game.activePlayerId].hand = [5, 6];
  });

  describe('when both Countess and King are in hand', () => {
    it('prohibits playing the King', () => {
      game.playCard(game.activePlayerId, 5);
      const player = game.players[game.activePlayerId];
      expect(player.hand).toHaveLength(2);
      expect(player.hand).toContain(5);
      expect(player.hand).toContain(6);
    });
  });
});

describe('serializeForPlayer', () => {
  it('serializes correctly', () => {
    const { players, roundNum, state } = game.serializeForPlayer('1');
    expect(roundNum).toEqual(game.roundNum);
    expect(state).toEqual(game.state);
    expect(players['1'].hand).toHaveLength(1);
    // Shouldn't reveal other players' hands
    expect(players['2'].hand).toBeUndefined();
    expect(players['3'].hand).toBeUndefined();
  });
});

describe('endRound', () => {
  it('decides the winner of the round', () => {
    game.players['1'].hand = [0];
    game.players['2'].hand = [9];
    game.endRound();
    expect(game.roundWinner.id).toEqual('2');
  });
});

describe('getAlivePlayers', () => {
  const subject = () => game.getAlivePlayers();

  it('gets all alive players', () => {
    expect(subject()).toHaveLength(3);
  });
});
