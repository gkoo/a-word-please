function GamePlayer({ id }) {
  this.id = id;
  this.hand = [];
  this.discardPile = [];
  this.numTokens = 0;
  this.isKnockedOut = false;

  this.addCardToHand = card => this.hand.push(card);

  this.discard = card => {
    const cardIdx = this.hand.indexOf(card);

    if (this.hand.indexOf(card) === -1) {
      throw `Tried to discard card ${card} but it isn't in hand`;
    }

    this.hand.splice(cardIdx, 1);
    this.discardPile.push(card);
  };

  this.resetCards = () => {
    this.hand = [];
    this.discardPile = [];
    this.isKnockedOut = false;
  };

  // Take the player out of the round
  this.knockOut = () => {
    this.isKnockedOut = true;
  };
}

module.exports = GamePlayer;
