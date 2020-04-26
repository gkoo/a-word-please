function Player({ id, name }) {
  this.id = id;
  this.name = name;
  this.hand = [];
  this.discardPile = [];
  this.numTokens = 0;
  this.isKnockedOut = false;
  this.handmaidActive = false;

  this.addCardToHand = card => this.hand.push(card);

  this.discardCardById = cardId => {
    const cardIdx = this.hand.findIndex(card => card.id === cardId);

    if (cardIdx === -1) {
      throw `Tried to discard card but it isn't in hand`;
    }

    const discardedCards = this.hand.splice(cardIdx, 1);
    this.discardPile = this.discardPile.concat(discardedCards);
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

  this.getCard = cardId => this.hand.find(card => card.id === cardId);

  this.hasCard = cardType => !!this.hand.find(card => card.type === cardType);

  this.setHandmaid = (enabled) => this.handmaidActive = enabled;

  this.serialize = ({ includeHand }) => {
    const {
      discardPile,
      hand,
      handmaidActive,
      id,
      isKnockedOut,
      name,
      numTokens,
    } = this;

    return {
      discardPile,
      hand: includeHand ? hand : undefined,
      handmaidActive,
      id,
      isKnockedOut,
      name,
      numTokens,
    }
  };
}

module.exports = Player;
