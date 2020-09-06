import _ from 'lodash';

class Deck {
  cards: Array<any>;
  cursor: number;

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

export default Deck;
