const _ = require('lodash');

function Game({ playerIds }) {
  const CARD_GUARD = 0;
  const CARD_PRIEST = 1;
  const CARD_BARON = 2;
  const CARD_HANDMAID = 3;
  const CARD_PRINCE = 4;
  const CARD_KING = 5;
  const CARD_COUNTESS = 6;
  const CARD_PRINCESS = 7;

  this.playerIds = playerIds;

  this.setup = () => {
    this.state = 'STARTED';
    this.hands = {};
    dealCards();
    return this.serialize();
  };

  const dealCards = () => {
    if (playerIds.length < 2 || playerIds.length > 4) {
      console.log('Only 2-4 player games are currently supported');
      return;
    }

    const tmpDeck = [CARD_PRINCESS, CARD_COUNTESS, CARD_KING];
    let i;
    for (i=0; i<2; ++i) {
      tmpDeck.push(CARD_PRINCE);
      tmpDeck.push(CARD_HANDMAID);
      tmpDeck.push(CARD_BARON);
      tmpDeck.push(CARD_PRIEST);
    }
    for (i=0; i<5; ++i) {
      tmpDeck.push(CARD_GUARD);
    }

    this.deck = _.shuffle(tmpDeck);

    // choose burn card
    const burnCardIdx = Math.floor(Math.random()*this.deck.length);
    this.burnCard = this.deck.splice(burnCardIdx, 1)[0];
  };

  this.end = () => {
    this.state = 'ENDED';
  };

  this.serialize = () => {
    const { state } = this;
    return {
      state,
    }
  };
}

module.exports = Game;
