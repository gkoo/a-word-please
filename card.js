const { cards, cardLabels, cardNumbers } = require('./constants');

function Card({ id, type }) {
  this.id = id;
  this.type = type;
}

Card.prototype = {
  getLabel: function() {
    return cardLabels[this.type];
  },

  getNumber: function() {
    return cardNumbers[this.type];
  },
};

module.exports = Card;
