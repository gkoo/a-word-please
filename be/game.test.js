const _ = require('lodash');

const Card = require('./card');
const Game = require('./game');
const Player = require('./Player');
const { cards } = require('./constants');

let game;
let players;

const mockBroadcast = jest.fn();
const mockEmitToPlayer = jest.fn();

beforeEach(() => {
  players = {
    '1': new Player('1'),
    '2': new Player('2'),
    '3': new Player('3'),
  };
  game = new Game({
    broadcastSystemMessage: mockBroadcast,
    emitToPlayer: mockEmitToPlayer,
    players: players,
  });
  game.setup();
});

describe('setup', () => {
  it('enforces max players', () => {
    players = {
      '1': new Player('1'),
      '2': new Player('2'),
      '3': new Player('3'),
      '4': new Player('4'),
      '5': new Player('5'),
      '6': new Player('6'),
      '7': new Player('7'),
      '8': new Player('8'),
    };
    game = new Game({
      broadcastSystemMessage: mockBroadcast,
      emitToPlayer: mockEmitToPlayer,
      players: players,
    });
    game.setup();
  });

  it('deals cards', () => {
    expect(game.deck).toHaveLength(15);
    Object.values(game.players).forEach(player => {
      const numCards = (player.id === game.activePlayerId) ? 2 : 1;
      expect(player.hand).toHaveLength(numCards);
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
      expect(game.activePlayerId).toEqual(thirdPlayerId);
    });
  });
});

describe('playCard', () => {
  describe('illegal moves', () => {
    describe('when both Countess and King are in hand', () => {
      beforeEach(() => {
        game.activePlayerId = '1';
        game.players['1'].hand = [cards.COUNTESS, cards.KING];
      });

      it('prohibits playing the King', () => {
        game.playCard(game.activePlayerId, cards.KING);
        const player = game.players[game.activePlayerId];
        expect(player.hand).toHaveLength(2);
        expect(player.hand).toContain(cards.KING);
        expect(player.hand).toContain(cards.COUNTESS);
      });
    });

    describe('targeting the handmaid', () => {
      beforeEach(() => {
        game.activePlayerId = '1';
        game.players['1'].hand = [cards.GUARD, cards.KING];
        game.players['2'].hand = [cards.PRINCESS];
        game.players['2'].discardPile = [cards.HANDMAID];
      });

      it('has no effect', () => {
        game.playCard('1', cards.KING, { targetPlayerId: '2' });
        expect(game.players['1'].hand).toContain(cards.GUARD);
        expect(game.players['2'].hand).toContain(cards.PRINCESS);
      });
    });

    describe('targeting a knocked out player', () => {
      beforeEach(() => {
        game.activePlayerId = '1';
        game.players['1'].hand = [cards.GUARD, cards.KING];
        game.players['2'].isKnockedOut = true;
      });

      it('has no effect', () => {
        game.playCard('1', cards.KING, { targetPlayerId: '2' });
        expect(game.players['1'].hand).toContain(cards.KING);
        expect(game.players['1'].hand).toContain(cards.GUARD);
      });
    });
  });
});

describe('serializeForPlayer', () => {
  it('serializes correctly', () => {
    const { players, roundNum, state } = game.serializeForPlayer('1');
    expect(roundNum).toEqual(game.roundNum);
    expect(state).toEqual(game.state);
    expect(players['1'].hand).toHaveLength(2);
    // Shouldn't reveal other players' hands
    expect(players['2'].hand).toBeUndefined();
    expect(players['3'].hand).toBeUndefined();
  });
});

describe('endRound', () => {
  it('assigns a token to the winner', () => {
    game.players['1'].hand = [0];
    game.players['2'].hand = [9];
    game.players['3'].hand = [0];
    game.endRound();
    expect(game.players['1'].numTokens).toEqual(0);
    expect(game.players['2'].numTokens).toEqual(1);
  });
});

describe('getAlivePlayers', () => {
  const subject = () => game.getAlivePlayers();

  it('gets all alive players', () => {
    expect(subject()).toHaveLength(3);
  });
});

describe('performCardEffect', () => {
  describe('when all other alive players have a handmaid', () => {
    it('has no effect', () => {
      game.activePlayerId = '1';
      const card = cards.PRINCE;
      game.players['1'].hand = [card];
      game.players['2'].discardPile = [cards.HANDMAID];
      game.players['3'].hand = [cards.PRINCESS];
      game.players['3'].discardPile = [cards.HANDMAID];
      game.performCardEffect(card, { targetPlayerId: '3' });
      expect(game.players['3'].hand).toHaveLength(1);
      expect(game.players['3'].hand[0]).toEqual(cards.PRINCESS);
    });
  });

  describe('prince', () => {
    it('moves the hand card to the discard pile', () => {
      game.activePlayerId = '1';
      const fakeCard = -1;
      game.players['3'].hand = [fakeCard];
      game.performCardEffect(cards.PRINCE, { targetPlayerId: 3 })
      expect(game.players['3'].discardPile).toContain(fakeCard);
      expect(game.players['3'].hand).toHaveLength(1);
      expect(game.players['3'].hand).not.toContain(fakeCard);
    });
  });

  describe('king', () => {
    it('switches cards with the target player', () => {
      game.activePlayerId = '1';
      game.players['1'].hand = [cards.BARON, cards.KING];
      game.players['3'].hand = [cards.GUARD];
      game.performCardEffect(cards.KING, { targetPlayerId: 3 })
      expect(game.players['3'].hand).toContain(cards.BARON);
      expect(game.players['1'].hand).toContain(cards.GUARD);
    });
  });
});
