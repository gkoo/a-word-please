const Card = require('./card');

let card;

beforeEach(() => {
  card = new Card({ id: 11, type: Card.PRINCESS });
});

describe('Card', () => {
  it('makes a card', () => {
    expect(card.type).toEqual(Card.PRINCESS);
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
