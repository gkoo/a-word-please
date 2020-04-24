const Card = require('./card');

describe('getLabel', () => {
  it('returns the label', () => {
    const card = new Card(0, Card.GUARD);
    expect(card.getLabel()).toEqual('Guard');
  });
});

describe('getNumber', () => {
  it('returns the number', () => {
    const card = new Card(0, Card.GUARD);
    expect(card.getNumber()).toEqual(1);
  });
});
