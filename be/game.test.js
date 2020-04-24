const _ = require('lodash');

const Card = require('./card');
const Game = require('./game');
const Player = require('./Player');
const { cards } = require('./constants');

let game;
let players;

const mockBroadcast = jest.fn();
const mockBroadcastSystemMessage = jest.fn();
const mockEmitToPlayer = jest.fn();

beforeEach(() => {
  players = {
    '1': new Player('1'),
    '2': new Player('2'),
    '3': new Player('3'),
  };
  game = new Game({
    broadcast: mockBroadcast,
    broadcastSystemMessage: mockBroadcastSystemMessage,
    emitToPlayer: mockEmitToPlayer,
    players: players,
  });
  game.setup();
});

describe('setup', () => {
  it('deals cards', () => {
    expect(game.deck).toHaveLength(15);
    Object.values(game.players).forEach(player => {
      const numCards = (player.id === game.activePlayerId) ? 2 : 1;
      expect(player.hand).toHaveLength(numCards);
      expect(player.hand[0].type).toBeGreaterThanOrEqual(0);
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
      });

      it('prohibits playing the King', () => {
        game.activePlayerId = '1';
        game.players['1'].hand = [
          new Card({ id: 0, type: cards.COUNTESS }),
          new Card({ id: 1, type: cards.KING }),
        ];
        game.playCard(game.activePlayerId, 1);
        const player = game.players[game.activePlayerId];
        expect(player.hand).toHaveLength(2);
        expect(player.hand.find(card => card.type === cards.KING)).toBeTruthy();
        expect(player.hand.find(card => card.type === cards.COUNTESS)).toBeTruthy();
      });
    });

    describe('targeting the handmaid', () => {
      beforeEach(() => {
        game.activePlayerId = '1';
        game.players['1'].hand = [
          new Card({ id: 0, type: cards.GUARD }),
          new Card({ id: 1, type: cards.KING }),
        ];
        game.players['2'].hand = [
          new Card({ id: 2, type: cards.PRINCESS }),
        ];
        game.players['2'].discardPile = [
          new Card({ id: 3, type: cards.HANDMAID }),
        ];
      });

      it('has no effect', () => {
        game.playCard('1', 0, { targetPlayerId: '2' });
        const activePlayerHand = game.players['1'].hand;
        expect(activePlayerHand.find(card => card.type === cards.GUARD)).toBeTruthy();
        expect(activePlayerHand.find(card => card.type === cards.KING)).toBeTruthy();
        expect(game.players['2'].hand[0].type).toEqual(cards.PRINCESS);
      });
    });

    describe('targeting a knocked out player', () => {
      beforeEach(() => {
        game.activePlayerId = '1';
        game.players['1'].hand = [
          new Card({ id: 0, type: cards.GUARD }),
          new Card({ id: 1, type: cards.KING }),
        ];
        game.players['2'].isKnockedOut = true;
      });

      it('has no effect', () => {
        game.playCard('1', 1, { targetPlayerId: '2' });
        expect(game.players['1'].hand[0].type).toEqual(cards.GUARD);
        expect(game.players['1'].hand[1].type).toEqual(cards.KING);
      });
    });
  });
});

describe('serializeForPlayer', () => {
  it('serializes correctly', () => {
    const { players, roundNum, state } = game.serializeForPlayer('1');
    expect(roundNum).toEqual(game.roundNum);
    expect(state).toEqual(game.state);
    expect(players['1'].hand).toBeTruthy();
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
      const card = new Card({ id: 0, type: cards.PRINCE });
      game.players['1'].hand = [card];
      game.players['2'].discardPile = [
        new Card({ id: 1, type: cards.HANDMAID }),
      ];
      game.players['3'].hand = [
        new Card({ id: 2, type: cards.PRINCESS }),
      ];
      game.players['3'].discardPile = [
        new Card({ id: 3, type: cards.HANDMAID }),
      ];
      game.performCardEffect(card, { targetPlayerId: '3' });
      expect(game.players['3'].hand).toHaveLength(1);
      expect(game.players['3'].hand[0].type).toEqual(cards.PRINCESS);
      expect(game.players['1'].hand[0].type).toEqual(cards.PRINCE);
    });
  });

  describe('prince', () => {
    it('moves the hand card to the discard pile', () => {
      game.activePlayerId = '1';
      const targetedCard = new Card({ id: 0, type: cards.BARON });
      game.players['3'].hand = [targetedCard];
      game.performCardEffect(
        new Card({ id: 1, type: cards.PRINCE }),
        { targetPlayerId: 3 },
      )
      expect(game.players['3'].discardPile).toContain(targetedCard);
      expect(game.players['3'].hand).toHaveLength(1);
      expect(game.players['3'].hand).not.toContain(targetedCard);
    });
  });

  describe('king', () => {
    it('switches cards with the target player', () => {
      game.activePlayerId = '1';
      const baronCard = new Card({ id: 0, type: cards.BARON });
      const kingCard = new Card({ id: 1, type: cards.KING });
      const guardCard = new Card({ id: 2, type: cards.GUARD });

      game.players['1'].hand = [baronCard, kingCard];
      game.players['3'].hand = [guardCard];

      game.performCardEffect(kingCard, { targetPlayerId: 3 })
      expect(game.players['1'].hand[0].type).toEqual(cards.GUARD);
      expect(game.players['3'].hand[0].type).toEqual(cards.BARON);
    });
  });
});
