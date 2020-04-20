const _ = require('lodash');

const GamePlayer = require('./gamePlayer');

function Game({ broadcast, emitToPlayer, players }) {
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

  const playerIds = Object.keys(players);
  const numPlayers = playerIds.length;

  if (numPlayers < 2 || numPlayers > 4) {
    throw 'Only 2-4 player games are currently supported';
  }

  this.setup = () => {
    this.state = STATE_STARTED;
    this.players = {};
    Object.values(players).forEach(roomPlayer => {
      const gamePlayer = new GamePlayer({ id: roomPlayer.id, name: roomPlayer.name });
      this.players[roomPlayer.id] = gamePlayer;
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

  const drawCard = ({ player, canUseBurnCard }) => {
    let nextCard;

    if (this.deckCursor >= this.deck.length && canUseBurnCard) {
      // For the Prince card effect
      nextCard = this.burnCard;
    } else {
      nextCard = this.deck[this.deckCursor++];
    }

    player.addCardToHand(nextCard);
  };

  this.nextTurn = () => {
    if (this.state !== STATE_STARTED) { return; }

    if (this.deckCursor >= this.deck.length) {
      // No more cards in the deck, the round is over.
      this.endRound();
      return;
    }

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
    drawCard({ player: nextPlayer, canUseBurnCard: false });

    // Id of the player whose turn it is
    this.activePlayerId = nextPlayer.id;
  };

  this.playCard = (playerId, card, effectData = {}) => {
    const player = this.players[playerId];

    if (this.activePlayerId !== playerId) {
      throw 'Player tried to play a card when it wasn\'t their turn! Aborting...';
    }

    if (!player.hasCardInHand(card)) {
      throw 'Player tried to play a card when it wasn\'t in their hand! Aborting...';
    }

    if (!isLegalMove(player, card, effectData)) {
      return;
    }

    this.performCardEffect(card, effectData);
    player.discard(card);

    // If one or zero players are left alive, end the round.
    if (this.getAlivePlayers().length < 2) {
      this.endRound();
    }
  };

  const isLegalMove = (player, card, effectData = {}) => {
    // Check Countess card effect
    if ([CARD_KING, CARD_PRINCE].includes(card) && player.hasCardInHand(CARD_COUNTESS)) {
      // If you have the King or Prince in your hand, you must discard the Countess.
      const message = `(Only visible to you) You cannot discard the ` +
        `${labelForCard(CARD_COUNTESS)} when you have the ${labelForCard(card)} in your hand`;
      emitToPlayer(player.id, 'systemMessage', message);
      return false;
    }

    const { targetPlayerId } = effectData;
    const targetPlayer = targetPlayerId ? this.players[targetPlayerId] : null;

    if (!targetPlayer) { return true; }

    // Moves involving targeted players

    // Prohibit targeting knocked out players
    if (targetPlayer.isKnockedOut) {
      emitToPlayer(
        player.id,
        'systemMessage',
        '(Only visible to you) Cannot target knocked out players',
      );
      return false;
    }

    // Check Handmaid card effect
    if (targetPlayer.discardPile[targetPlayer.discardPile.length-1] === CARD_HANDMAID) {
      const message = '(Only visible to you) You can\'t target someone who played ' +
        `${labelForCard(CARD_HANDMAID)} last turn`;
      emitToPlayer(player.id, 'systemMessage', message);
      return false;
    }

    return true;
  }

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

  this.performCardEffect = (card, effectData) => {
    const activePlayer = this.players[this.activePlayerId];
    const targetPlayer = this.players[effectData.targetPlayerId];

    const broadcastMessage = [`${activePlayer.name} played ${labelForCard(card)}`];
    let targetPlayerCard;

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
        targetPlayerCard = targetPlayer.hand[0];
        targetPlayer.discard(targetPlayerCard);
        drawCard({ player: targetPlayer, canUseBurnCard: true });
        broadcastMessage.push(
          `and forced ${targetPlayer.name} to discard their card and draw a new one`,
        );
        break;
      case CARD_KING:
        targetPlayerCard = targetPlayer.hand[0];
        // Get the non-King card from the active player
        activePlayerCardIdx = (activePlayer.hand[0] === CARD_KING) ? 1 : 0;
        // Switch the cards!
        targetPlayer.hand[0] = activePlayer.hand[activePlayerCardIdx];
        activePlayer.hand[activePlayerCardIdx] = targetPlayerCard;
        broadcastMessage.push(
          `and switched cards with ${targetPlayer.name}`,
        );
        break;
      case CARD_PRINCESS:
        // effects handled elsewhere
        broadcastMessage.push('... oops!');
        activePlayer.knockOut();
        break;
      case CARD_HANDMAID:
        // effects handled elsewhere
        broadcastMessage.push(
          `${activePlayer.name} played ${card} and is immune from card effects ` +
            'until their next turn'
        );
        break;
      case CARD_COUNTESS:
        // effects handled elsewhere
        break;
      default:
        throw `unknown card played: ${card}`;
    }

    broadcast('systemMessage', broadcastMessage.join(' '));
  };

  const labelForCard = card => {
    switch (card) {
      case CARD_GUARD:
        return 'Guard';
        break;
      case CARD_PRIEST:
        return 'Priest';
        break;
      case CARD_BARON:
        return 'Baron';
        break;
      case CARD_HANDMAID:
        return 'Handmaid';
        break;
      case CARD_PRINCE:
        return 'Prince';
        break;
      case CARD_KING:
        return 'King';
        break;
      case CARD_COUNTESS:
        return 'Countess';
        break;
      case CARD_PRINCESS:
        return 'Princess';
        break;
    }
  };

  this.serializeForPlayer = playerIdToSerializeFor => {
    const { activePlayerId, roundNum, state } = this;
    const playerData = {};

    Object.keys(this.players).forEach(playerId => {
      const serialized = this.players[playerId].serialize({
        includeHand: playerIdToSerializeFor === playerId,
      });
      playerData[playerId] = serialized;
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
