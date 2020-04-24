const cards = {
  GUARD: 0,
  PRIEST: 1,
  BARON: 2,
  HANDMAID: 3,
  PRINCE: 4,
  KING: 5,
  COUNTESS: 6,
  PRINCESS: 7,
};

const cardLabels = {
  [cards.GUARD]: 'Guard',
  [cards.PRIEST]: 'Priest',
  [cards.BARON]: 'Baron',
  [cards.HANDMAID]: 'Handmaid',
  [cards.PRINCE]: 'Prince',
  [cards.KING]: 'King',
  [cards.COUNTESS]: 'Countess',
  [cards.PRINCESS]: 'Princess',
};

const cardNumbers = {
  [cards.GUARD]: 1,
  [cards.PRIEST]: 2,
  [cards.BARON]: 3,
  [cards.HANDMAID]: 4,
  [cards.PRINCE]: 5,
  [cards.KING]: 6,
  [cards.COUNTESS]: 7,
  [cards.PRINCESS]: 8,
};

module.exports = { cards, cardLabels, cardNumbers };
