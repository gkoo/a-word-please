const Card = require('./card');
const { cards } = require('./constants');

let card;

beforeEach(() => {
  card = new Card({ id: 0, type: cards.PRINCESS });
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
