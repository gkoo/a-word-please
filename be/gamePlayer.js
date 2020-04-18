function GamePlayer({ id }) {
  this.id = id;
  this.hand = [];
  this.discardPile = [];
  this.numTokens = 0;

  this.addCardToHand = card => this.hand.push(card);

  this.moveCardFromHandToPile = card => {
    const cardIdx = this.hand.indexOf(card);

    if (this.hand.indexOf(card) === -1) {
      throw `Tried to discard card ${card} but it isn't in hand`;
    }

    this.hand.splice(cardIdx, 1);
    this.discardPile.push(cardIdx);
  }

  this.resetCards = () => {
    this.hand = [];
    this.discardPile = [];
  };
}

module.exports = GamePlayer;
