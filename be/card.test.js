const Card = require('./card');
const { cards } = require('./constants');

let card;

beforeEach(() => {
  card = new Card({ id: 11, type: cards.PRINCESS });
});

describe('Card', () => {
  it('makes a card', () => {
    expect(card.type).toEqual(cards.PRINCESS);
    expect(card.id).toEqual(11);
  });

  describe('getLabel', () => {
    it('returns the label', () => {
      expect(card.getLabel()).toEqual('Princess');
    });
  });

  describe('getNumber', () => {
    it('returns the number', () => {
      expect(card.getNumber()).toEqual(8);
    });
  });
});
