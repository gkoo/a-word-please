const Deck = require('./deck');

describe('Deck', () => {
  const cards = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  let deck;

  beforeEach(() => {
    deck = new Deck(cards);
  });

  describe('shuffle', () => {
    it('shuffles the order of cards', () => {
      deck.shuffle();
      expect(deck.cards.join('')).not.toEqual('123456789');
    });
  });

  describe('drawCard', () => {
    it('returns a card and advances the cursor', () => {
      const card = deck.drawCard();
      expect(cards.indexOf(card)).toBeGreaterThanOrEqual(0);
      expect(deck.cursor).toEqual(1);
    });
  });
});
