const _ = require('lodash');

class Deck {
  constructor(cards) {
    this.cards = cards;
    this.cursor = 0;
  }

  shuffle() {
    this.cards = _.shuffle(this.cards);
  }

  drawCard() {
    const currCard = this.cards[this.cursor];
    this.cursor = ++this.cursor % this.cards.length;
    return currCard;
  }
}

module.exports = Deck;
