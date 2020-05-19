function Card({ id, type }) {
  this.id = id;
  this.type = type;
}

Card.prototype = {
  getLabel: function() {
    return Card.labels[this.type];
  },

  getNumber: function() {
    return Card.numbers[this.type];
  },
}

// Static properties

Card.GUARD = 0;
Card.PRIEST = 1;
Card.BARON = 2;
Card.HANDMAID = 3;
Card.PRINCE = 4;
Card.KING = 5;
Card.COUNTESS = 6;
Card.PRINCESS = 7;

Card.labels = {
  [Card.GUARD]: 'Guard',
  [Card.PRIEST]: 'Priest',
  [Card.BARON]: 'Baron',
  [Card.HANDMAID]: 'Handmaid',
  [Card.PRINCE]: 'Prince',
  [Card.KING]: 'King',
  [Card.COUNTESS]: 'Countess',
  [Card.PRINCESS]: 'Princess',
};

Card.numbers = {
  [Card.GUARD]: 1,
  [Card.PRIEST]: 2,
  [Card.BARON]: 3,
  [Card.HANDMAID]: 4,
  [Card.PRINCE]: 5,
  [Card.KING]: 6,
  [Card.COUNTESS]: 7,
  [Card.PRINCESS]: 8,
};

module.exports = Card;
