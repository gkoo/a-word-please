const _ = require('lodash');

const GamePlayer = require('./gamePlayer');

function Game({ playerIds }) {
  const CARD_GUARD = 0;
  const CARD_PRIEST = 1;
  const CARD_BARON = 2;
  const CARD_HANDMAID = 3;
  const CARD_PRINCE = 4;
  const CARD_KING = 5;
  const CARD_COUNTESS = 6;
  const CARD_PRINCESS = 7;

  if (playerIds.length < 2 || playerIds.length > 4) {
    throw 'Only 2-4 player games are currently supported';
  }


  this.setup = () => {
    this.state = 'STARTED';
    this.players = {};
    playerIds.forEach(playerId => {
      const player = new GamePlayer({ id: playerId });
      this.players[playerId] = player;
    });
    this.roundNum = 0;
    newRound();
  };

  const newRound = () => {
    ++this.roundNum;
    playerIds.forEach(playerId => this.players[playerId].resetCards());
    this.deckCursor = 0;

    createDeck();
    dealCards();

    // keeps track of how far through the deck we are

    // keeps track of whose turn it is.
    this.playerOrderCursor = -1;
  };

  const createDeck = () => {
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

  const dealCards = () => {
    for (let i=0; i<playerIds.length; ++i) {
      const playerId = playerIds[i];
      const card = this.deck[this.deckCursor++];
      this.players[playerId].addCardToHand(card);
    }
  };

  const determinePlayerOrder = () => {
    this.playerOrder = _.shuffle(playerIds);
  };

  this.end = () => {
    this.state = 'ENDED';
  };

  this.serializeForPlayer = playerIdToSerializeFor => {
    const { roundNum, state } = this;
    const playerData = {};
    Object.keys(this.players).forEach(playerId => {
      const { discardPile, hand, id, numTokens } = this.players[playerId];
      const handToInclude = playerIdToSerializeFor === playerId ? hand : undefined;
      playerData[playerId] = {
        discardPile,
        hand: handToInclude,
        id,
        numTokens,
      }
    });
    return {
      players: playerData,
      roundNum,
      state,
    };
  };
}

module.exports = Game;
