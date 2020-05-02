function Player({ id, name }) {
  this.id = id;
  this.name = name;
  this.hand = [];
  this.discardPile = [];
  this.numTokens = 0;
  this.isKnockedOut = false;
  this.handmaidActive = false;
  this.connected = true;
}

Player.prototype = {
  addCardToHand: function(card) { this.hand.push(card); },

  discardCardById: function(cardId) {
    const cardIdx = this.hand.findIndex(card => card.id === cardId);

    if (cardIdx === -1) {
      throw `Tried to discard card but it isn't in hand`;
    }

    const discardedCards = this.hand.splice(cardIdx, 1);
    this.discardPile = this.discardPile.concat(discardedCards);
  },

  resetCards: function() {
    this.hand = [];
    this.discardPile = [];
    this.isKnockedOut = false;
  },

  // Take the player out of the round
  knockOut: function() {
    this.discardPile = this.discardPile.concat(this.hand);
    this.hand = [];
    this.isKnockedOut = true;
  },

  getCard: function(cardId) { return this.hand.find(card => card.id === cardId); },

  hasCard: function(cardType) { return !!this.hand.find(card => card.type === cardType); },

  setHandmaid: function(enabled) { this.handmaidActive = enabled; },

  serialize: function ({ includeHand }) {
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
  },
}

module.exports = Player;
