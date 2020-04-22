const _ = require('lodash');

const Game = require('./game');
const Player = require('./Player');

const CARD_GUARD = 0;
const CARD_PRIEST = 1;
const CARD_BARON = 2;
const CARD_HANDMAID = 3;
const CARD_PRINCE = 4;
const CARD_KING = 5;
const CARD_COUNTESS = 6;
const CARD_PRINCESS = 7;

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
    broadcastSystemMessage: mockBroadcast,
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
        game.players['1'].hand = [CARD_COUNTESS, CARD_KING];
      });

      it('prohibits playing the King', () => {
        game.playCard(game.activePlayerId, CARD_KING);
        const player = game.players[game.activePlayerId];
        expect(player.hand).toHaveLength(2);
        expect(player.hand).toContain(CARD_KING);
        expect(player.hand).toContain(CARD_COUNTESS);
      });
    });

    describe('targeting the handmaid', () => {
      beforeEach(() => {
        game.activePlayerId = '1';
        game.players['1'].hand = [CARD_GUARD, CARD_KING];
        game.players['2'].hand = [CARD_PRINCESS];
        game.players['2'].discardPile = [CARD_HANDMAID];
      });

      it('has no effect', () => {
        game.playCard('1', CARD_KING, { targetPlayerId: '2' });
        expect(game.players['1'].hand).toContain(CARD_GUARD);
        expect(game.players['2'].hand).toContain(CARD_PRINCESS);
      });
    });

    describe('targeting a knocked out player', () => {
      beforeEach(() => {
        game.activePlayerId = '1';
        game.players['1'].hand = [CARD_GUARD, CARD_KING];
        game.players['2'].isKnockedOut = true;
      });

      it('has no effect', () => {
        game.playCard('1', CARD_KING, { targetPlayerId: '2' });
        expect(game.players['1'].hand).toContain(CARD_KING);
        expect(game.players['1'].hand).toContain(CARD_GUARD);
      });
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
      const card = CARD_PRINCE;
      game.players['1'].hand = [card];
      game.players['2'].discardPile = [CARD_HANDMAID];
      game.players['3'].hand = [CARD_PRINCESS];
      game.players['3'].discardPile = [CARD_HANDMAID];
      game.performCardEffect(card, { targetPlayerId: '3' });
      expect(game.players['3'].hand).toHaveLength(1);
      expect(game.players['3'].hand[0]).toEqual(CARD_PRINCESS);
    });
  });

  describe('prince', () => {
    it('moves the hand card to the discard pile', () => {
      game.activePlayerId = '1';
      const fakeCard = -1;
      game.players['3'].hand = [fakeCard];
      game.performCardEffect(CARD_PRINCE, { targetPlayerId: 3 })
      expect(game.players['3'].discardPile).toContain(fakeCard);
      expect(game.players['3'].hand).toHaveLength(1);
      expect(game.players['3'].hand).not.toContain(fakeCard);
    });
  });

  describe('king', () => {
    it('switches cards with the target player', () => {
      game.activePlayerId = '1';
      game.players['1'].hand = [CARD_BARON, CARD_KING];
      game.players['3'].hand = [CARD_GUARD];
      game.performCardEffect(CARD_KING, { targetPlayerId: 3 })
      expect(game.players['3'].hand).toContain(CARD_BARON);
      expect(game.players['1'].hand).toContain(CARD_GUARD);
    });
  });
});
