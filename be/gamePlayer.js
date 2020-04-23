function GamePlayer({ id, name }) {
  this.id = id;
  this.name = name;
  this.hand = [];
  this.discardPile = [];
  this.numTokens = 0;
  this.isKnockedOut = false;

  this.addCardToHand = card => this.hand.push(card);

  this.discard = card => {
    const cardIdx = this.hand.indexOf(card);

    if (!this.hasCardInHand(card)) {
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
    this.discardPile = this.discardPile.concat(this.hand);
    this.hand = [];
    this.isKnockedOut = true;
  };

  this.hasCardInHand = card => this.hand.includes(card);

  this.serialize = ({ includeHand }) => {
    const {
      discardPile,
      hand,
      id,
      isKnockedOut,
      numTokens,
    } = this;

    return {
      discardPile,
      hand: includeHand ? hand : undefined,
      id,
      isKnockedOut,
      numTokens,
    }
  };
}

module.exports = GamePlayer;
