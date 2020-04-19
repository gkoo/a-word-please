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

  const numPlayers = playerIds.length;

  if (numPlayers < 2 || numPlayers > 4) {
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
    determineMaxTokens();
    this.newRound();
  };

  this.newRound = () => {
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
    for (let i=0; i<numPlayers; ++i) {
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

  const determineMaxTokens = () => {
    switch (numPlayers) {
      case 2:
        this.maxTokens = 7;
        break;
      case 3:
        this.maxTokens = 5;
        break;
      case 4:
      default:
        this.maxTokens = 4;
    }
  };

  this.nextTurn = () => {
    if (this.state !== STATE_STARTED) { return; }

    if (this.deckCursor >= this.deck.length) {
      // No more cards in the deck, the round is over.
      this.endRound();
      return;
    }

    const nextCard = this.deck[this.deckCursor++];

    // Advance the playerOrderCursor
    let nextPlayer;
    while (true) {
      const nextPlayerId = this.playerOrder[this.playerOrderCursor];
      this.playerOrderCursor = (++this.playerOrderCursor) % numPlayers;
      nextPlayer = this.players[nextPlayerId];

      // Skip players who have been knocked out
      if (!nextPlayer.isKnockedOut) { break; }
    }

    // Add the next card into the hand of the player
    nextPlayer.hand.push(nextCard);

    // Id of the player whose turn it is
    this.activePlayerId = nextPlayer.id;
  };

  this.playCard = (playerId, card) => {
    if (this.activePlayerId !== playerId) {
      throw 'Player tried to play a card when it wasn\'t their turn! Aborting...';
    }

    const player = this.players[playerId];
    const { hand } = player;
    if ([CARD_KING, CARD_PRINCE].includes(card) && hand.includes(CARD_COUNTESS)) {
      // If you have the King or Prince in your hand, you must discard the Countess.
      return;
    }
    this.players[playerId].discard(card);
    this.performCardEffect(card);

    // If one or zero players are left alive, end the round.
    if (this.getAlivePlayers().length < 2) {
      this.endRound();
    }
  };

  this.endRound = () => {
    this.state = STATE_ROUND_END;

    // Determine winner
    const playerList = Object.values(this.players);
    const alivePlayers = this.getAlivePlayers();

    if (alivePlayers.length === 0) {
      return;
    }

    alivePlayers.sort(player => player.hand[0]);
    this.roundWinner = alivePlayers[alivePlayers.length - 1];

    if (++this.roundWinner.numTokens >= this.maxTokens) {
      this.endGame();
    }
  };

  this.endGame = () => {
    this.state = STATE_GAME_END;
  };

  this.getWinnerIds = () => {
    const winners = Object.values(this.players).filter(
      player => player.numTokens >= this.maxTokens
    );
    return winners.map(winner => winner.id);
  };

  this.getAlivePlayers = () => Object.values(this.players).filter(player => !player.isKnockedOut);

  this.isRoundOver = () => this.state !== STATE_STARTED;

  this.isGameOver = () => this.state === STATE_GAME_END;

  this.performCardEffect = (card) => {
    const activePlayer = this.players[this.activePlayerId];

    switch (card) {
      case CARD_GUARD:
        // TODO
        break;
      case CARD_PRIEST:
        // TODO
        break;
      case CARD_BARON:
        // TODO
        break;
      case CARD_PRINCE:
        // TODO
        break;
      case CARD_KING:
        // TODO
        break;
      case CARD_PRINCESS:
        activePlayer.knockOut();
        break;
      case CARD_HANDMAID:
      case CARD_COUNTESS:
        // effects handled elsewhere
        break;
      default:
        throw `unknown card played: ${card}`;
    }
  };

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
      };
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
