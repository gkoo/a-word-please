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

  const STATE_PENDING = 0;
  const STATE_STARTED = 1;
  const STATE_ROUND_END = 2;
  const STATE_GAME_END = 3;

  if (playerIds.length < 2 || playerIds.length > 4) {
    throw 'Only 2-4 player games are currently supported';
  }

  this.setup = () => {
    this.state = STATE_STARTED;
    this.players = {};
    playerIds.forEach(playerId => {
      const player = new GamePlayer({ id: playerId });
      this.players[playerId] = player;
    });
    this.roundNum = 0;
    determinePlayerOrder();
    newRound();
  };

  const newRound = () => {
    ++this.roundNum;
    this.roundWinnerId = undefined;
    playerIds.forEach(playerId => this.players[playerId].resetCards());

    // keeps track of how far through the deck we are
    this.deckCursor = 0;

    createDeck();
    dealCards();
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

    // keeps track of whose turn it is.
    this.playerOrderCursor = 0;
  };

  this.nextTurn = () => {
    if (this.deckCursor >= this.deck.length) {
      // No more cards in the deck, the round is over.
      this.endRound();
      return;
    }

    const nextCard = this.deck[this.deckCursor++];
    const nextPlayerId = this.playerOrder[this.playerOrderCursor];

    // Advance the playerOrderCursor
    this.playerOrderCursor = (++this.playerOrderCursor) % playerIds.length;

    // Add the next card into the hand of the player
    this.players[nextPlayerId].hand.push(nextCard);

    // Id of the player whose turn it is
    this.activePlayerId = nextPlayerId;
  };

  this.playCard = (playerId, card) => {
    if (this.activePlayerId !== playerId) {
      throw 'Player tried to play a card when it wasn\'t their turn! Aborting...';
    }

    this.players[playerId].discard(card);
  };

  this.endRound = () => {
    this.state = STATE_ROUND_END;

    // Determine winner
    const playerList = Object.values(this.players);
    const alivePlayers = playerList.filter(player => !player.isKnockedOut);
    alivePlayers.sort(player => player.hand[0]);
    this.roundWinner = alivePlayers[alivePlayers.length - 1];
    ++this.roundWinner.numTokens;
  };

  this.end = () => {
    this.state = STATE_GAME_END;
  };

  this.isRoundOver = () => this.state !== STATE_STARTED;

  this.isGameOver = () => this.state === STATE_GAME_END;

  this.serializeForPlayer = playerIdToSerializeFor => {
    const { activePlayerId, roundNum, state } = this;
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
      activePlayerId,
      players: playerData,
      roundNum,
      state,
    };
  };

  this.serialize = () => {
    const {
      activePlayerId,
      deck,
      deckCursor,
      players,
      playerOrder,
      playerOrderCursor,
      roundNum,
      state
    } = this;
    return {
      activePlayerId,
      deck,
      deckCursor,
      players,
      playerOrder,
      playerOrderCursor,
      roundNum,
      state,
    };
  }
}

module.exports = Game;
