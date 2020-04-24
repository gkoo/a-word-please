const _ = require('lodash');
const uuid = require('uuid');

const GamePlayer = require('./gamePlayer');

function Game({
  broadcast,
  broadcastSystemMessage,
  emitToPlayer,
  players,
}) {
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

  const enumsToValues = {
    [CARD_GUARD]: {
      label: 'Guard',
      value: 1,
    },
    [CARD_PRIEST]: {
      label: 'Priest',
      value: 2,
    },
    [CARD_BARON]: {
      label: 'Baron',
      value: 3,
    },
    [CARD_HANDMAID]: {
      label: 'Handmaid',
      value: 4,
    },
    [CARD_PRINCE]: {
      label: 'Prince',
      value: 5,
    },
    [CARD_KING]: {
      label: 'King',
      value: 6,
    },
    [CARD_COUNTESS]: {
      label: 'Countess',
      value: 7,
    },
    [CARD_PRINCESS]: {
      label: 'Princess',
      value: 8,
    },
  };

  const MIN_PLAYERS = 2;
  const MAX_PLAYERS = 4;

  const playerIds = Object.keys(players);
  const numPlayers = playerIds.length;

  this.setup = () => {
    const playerList = Object.values(players);
    this.state = STATE_PENDING;
    this.players = {};
    this.spectators = {};

    const numPlayers = playerList.length;
    if (numPlayers < MIN_PLAYERS) {
      broadcastSystemMessage(`Cannot start the game with less than ${MIN_PLAYERS} players`);
      return;
    }
    if (numPlayers > MAX_PLAYERS) {
      broadcastSystemMessage(`Cannot start the game with over ${MAX_PLAYERS} players`);
      return;
    }
    playerList.forEach(roomPlayer => {
      const gamePlayer = new GamePlayer({ id: roomPlayer.id, name: roomPlayer.name });
      this.players[roomPlayer.id] = gamePlayer;
    });
    this.roundNum = 0;
    determinePlayerOrder();
    determineMaxTokens();
    this.newRound();
    broadcastSystemMessage('Game has started!');
    broadcastGameDataToPlayers();
  };

  this.newRound = () => {
    if (![STATE_PENDING, STATE_ROUND_END].includes(this.state)) { return; }

    this.state = STATE_STARTED;
    ++this.roundNum;
    playerIds.forEach(playerId => this.players[playerId].resetCards());

    // keeps track of how far through the deck we are
    this.deckCursor = 0;

    createDeck();
    dealCards();
    this.nextTurn();
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

    // If one or zero players are left alive, end the round.
    if (this.getAlivePlayers().length < 2) {
      this.endRound();
      return;
    }

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

    broadcastGameDataToPlayers();
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

    player.discard(card);
    this.performCardEffect(card, effectData);

    const endActions = () => {
      // Tell the clients to dismiss their revealed cards
      broadcast('dismissReveal');

      this.nextTurn();
    };

    if ([CARD_PRIEST, CARD_BARON].includes(card)) {
      setTimeout(endActions, 3000);
    } else {
      endActions();
    }
  };

  const isLegalMove = (player, card, effectData = {}) => {
    // Check Countess card effect
    // TODO: alert this error instead of putting in chat
    if ([CARD_KING, CARD_PRINCE].includes(card) && player.hasCardInHand(CARD_COUNTESS)) {
      // If you have the King or Prince in your hand, you must discard the Countess.
      const message = `(Only visible to you) You cannot discard the ` +
        `${labelForCard(CARD_COUNTESS)} when you have the ${labelForCard(card)} in your hand`;
      emitSystemMessage(player.id, message);
      return false;
    }

    const { targetPlayerId } = effectData;
    const targetPlayer = targetPlayerId ? this.players[targetPlayerId] : null;

    if (!targetPlayer) { return true; }

    // Moves involving targeted players

    // Prohibit targeting knocked out players
    if (targetPlayer.isKnockedOut) {
      emitSystemMessage(
        player.id,
        '(Only visible to you) Cannot target knocked out players',
      );
      return false;
    }

    // Check Handmaid card effect
    if (targetPlayer.discardPile[targetPlayer.discardPile.length-1] === CARD_HANDMAID) {
      const message = '(Only visible to you) You can\'t target someone who played ' +
        `${labelForCard(CARD_HANDMAID)} last turn`;
      emitSystemMessage(player.id, message);
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
      broadcastSystemMessage('No one won the round...');
      broadcastGameDataToPlayers();
      return;
    }

    alivePlayers.sort(player => player.hand[0]);
    const finalists = [];
    const highestCard = alivePlayers[alivePlayers.length - 1].hand[0];
    for (let i = alivePlayers.length - 1; i >= 0; --i) {
      const player = alivePlayers[i]
      if (player.hand[0] < highestCard) {
        break;
      }
      finalists.push(player);
    }

    let roundWinners = [];

    if (finalists.length > 1) {
      // Tie-break. Add up the discard piles
      let maxDiscardTotal = 0;

      finalists.forEach(finalist => {
        const discardTotal = _.reduce(
          finalist.discardPile,
          (sum, discardCard) => sum + enumsToValues[discardCard].value,
          0,
        );
        if (discardTotal > maxDiscardTotal) {
          maxDiscardTotal = discardTotal;
          roundWinners = [finalist];
        } else if (discardTotal === maxDiscardTotal) {
          roundWinners.push(finalist);
        }
      });
    } else {
      roundWinners = finalists;
    }

    const roundEndMsg = `${roundWinners.map(winner => winner.name).join(' and ')} won the round!`;
    broadcastSystemMessage(roundEndMsg);

    const isGameOver = false;
    const gameWinners = roundWinners.filter(
      roundWinner => ++roundWinner.numTokens >= this.maxTokens
    );

    if (gameWinners.length > 0) {
      this.endGame(gameWinners);
      return;
    }

    broadcastGameDataToPlayers();
  };

  this.endGame = (winners) => {
    console.log('end game');
    if (winners) {
      broadcast('endGame', { winnerIds: winners.map(winner => winner.id) });
    }

    broadcastSystemMessage('Game is over!');
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

    const cardLabel = labelForCard(card);
    if (allAlivePlayersHaveHandmaids()) {
      broadcastSystemMessage(`${activePlayer.name} discarded ${cardLabel}`);
      return;
    }

    const targetPlayer = this.players[effectData.targetPlayerId];

    const broadcastMessage = [`${activePlayer.name} played ${cardLabel}`];
    const targetPlayerCard = targetPlayer && targetPlayer.hand[0];

    switch (card) {
      case CARD_GUARD:
        const { guardNumberGuess } = effectData;
        const guardGuessCards = Object.keys(enumsToValues).filter(card => {
          return guardNumberGuess === enumsToValues[card].value;
        }).map(card => parseInt(card, 10)); // for some reason it gets turned into a string
        broadcastMessage.push(`and guessed ${targetPlayer.name} has a ${guardNumberGuess} card`);
        if (guardGuessCards.includes(targetPlayer.hand[0])) {
          // Dead!
          broadcastSystemMessage(broadcastMessage.join(' '));
          knockOut(targetPlayer);
          return;
        } else {
          broadcastMessage.push('but was wrong');
        }
        break;
      case CARD_PRIEST:
        emitToPlayer(activePlayer.id, 'priestReveal', targetPlayerCard);
        const priestRevealMessage = `(Only visible to you) ${targetPlayer.name} is holding the ` +
          `${enumsToValues[targetPlayerCard].label}!`;
        emitSystemMessage(activePlayer.id, priestRevealMessage);
        broadcastMessage.push(`and is looking at ${targetPlayer.name}'s card`);
        break;
      case CARD_BARON:
        const baronRevealData = [{
          playerId: activePlayer.id,
          card: activePlayer.hand[0],
        }, {
          playerId: targetPlayer.id,
          card: targetPlayer.hand[0],
        }];
        emitToPlayer(activePlayer.id, 'baronReveal', baronRevealData);
        emitToPlayer(targetPlayer.id, 'baronReveal', baronRevealData);
        broadcastMessage.push(`and compared cards with ${targetPlayer.name}`);

        // Who died?
        broadcastSystemMessage(broadcastMessage.join(' '));
        if (activePlayer.hand[0] === targetPlayer.hand[0]) {
          broadcastSystemMessage('Nothing happened...');
          return;
        }

        const loser = activePlayer.hand[0] < targetPlayer.hand[0] ? activePlayer : targetPlayer;
        knockOut(loser);
        return;
      case CARD_PRINCE:
        targetPlayer.discard(targetPlayerCard);
        broadcastMessage.push(
          `and forced ${targetPlayer.name} to discard their card`,
        );
        if (targetPlayerCard === CARD_PRINCESS) {
          broadcastSystemMessage(broadcastMessage);
          knockOut(targetPlayer);
          return;
        }
        drawCard({ player: targetPlayer, canUseBurnCard: true });
        broadcastMessage.push(
          'and draw a new one',
        );
        break;
      case CARD_KING:
        // Switch the cards!
        targetPlayer.hand[0] = activePlayer.hand[0];
        activePlayer.hand[0] = targetPlayerCard;
        broadcastMessage.push(
          `and switched cards with ${targetPlayer.name}`,
        );
        break;
      case CARD_PRINCESS:
        // effects handled elsewhere
        broadcastMessage.push('... oops!');
        knockOut(activePlayer);
        break;
      case CARD_HANDMAID:
        // effects handled elsewhere
        broadcastMessage.push('and is immune from card effects until their next turn');
        break;
      case CARD_COUNTESS:
        // effects handled elsewhere
        break;
      default:
        throw `unknown card played: ${card}`;
    }

    broadcastSystemMessage(broadcastMessage.join(' '));
  };

  const allAlivePlayersHaveHandmaids = () => {
    const players = Object.values(this.players);
    return !players.find(
      player => {
        if (player.id === this.activePlayerId) { return false; } // skip the active player
        return player.discardPile[player.discardPile.length - 1] !== CARD_HANDMAID;
      }
    );
  };

  const knockOut = player => {
    player.knockOut();
    broadcastSystemMessage(`${player.name} was knocked out of the round!`);
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

  const emitSystemMessage = (playerId, msg) => {
    const messageObj = {
      id: uuid.v4(),
      text: msg,
      type: 'system',
    };
    emitToPlayer(playerId, 'message', messageObj);
  };

  const broadcastGameDataToPlayers = () => {
    Object.keys(this.players).forEach(playerId =>
      emitToPlayer(
        playerId,
        'gameData',
        this.serializeForPlayer(playerId),
      )
    );
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
