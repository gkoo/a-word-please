const { cards, cardLabels, cardNumbers } = require('./constants');

function Card({ id, type }) {
  this.id = id;
  this.type = type;

  this.getLabel = () => {
    return cardLabels[this.type];
  };

  this.getNumber = () => {
    return cardNumbers[this.type];
  };
}

module.exports = Card;
