const _ = require('lodash');
const uuid = require('uuid');

const { cards, cardLabels, cardNumbers } = require('./constants');
const Card = require('./card');
const GamePlayer = require('./gamePlayer');

function Game({
  broadcast,
  broadcastSystemMessage,
  emitToPlayer,
  players,
}) {
  const STATE_PENDING = 0;
  const STATE_STARTED = 1;
  const STATE_ROUND_END = 2;
  const STATE_GAME_END = 3;

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
    let nextId = 0;
    let i;
    const tmpDeck = [
      new Card({ id: nextId++, type: cards.PRINCESS}),
      new Card({ id: nextId++, type: cards.COUNTESS}),
      new Card({ id: nextId++, type: cards.KING})
    ];

    for (i=0; i<2; ++i) {
      tmpDeck.push(new Card({ id: nextId++, type: cards.PRINCE }));
      tmpDeck.push(new Card({ id: nextId++, type: cards.HANDMAID }));
      tmpDeck.push(new Card({ id: nextId++, type: cards.BARON }));
      tmpDeck.push(new Card({ id: nextId++, type: cards.PRIEST }));
    }
    for (i=0; i<5; ++i) {
      tmpDeck.push(new Card({ id: nextId++, type: cards.GUARD }));
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

  this.playCard = (playerId, cardId, effectData = {}) => {
    const player = this.players[playerId];

    if (this.activePlayerId !== playerId) {
      throw 'Player tried to play a card when it wasn\'t their turn! Aborting...';
    }

    const card = player.getCard(cardId);
    if (!card) {
      throw 'Player tried to play a card when it wasn\'t in their hand! Aborting...';
    }

    if (!isLegalMove(player, card, effectData)) {
      return;
    }

    const success = this.performCardEffect(card, effectData);

    if (!player.isKnockedOut) { player.discardCardById(card.id); }

    const endActions = () => {
      // Tell the clients to dismiss their revealed cards
      broadcast('dismissReveal');

      this.nextTurn();
    };

    // Don't delay next turn if card was discarded
    if (success && [cards.PRIEST, cards.BARON].includes(card.type)) {
      setTimeout(endActions, 3000);
    } else {
      endActions();
    }
  };

  const isLegalMove = (player, card, effectData = {}) => {
    // Check Countess card effect
    // TODO: alert this error instead of putting in chat
    if ([cards.KING, cards.PRINCE].includes(card.type) && player.hasCard(cards.COUNTESS)) {
      // If you have the King or Prince in your hand, you must discard the Countess.
      const message = `(Only visible to you) You cannot discard the ` +
        `${cardLabels[cards.COUNTESS]} when you have the ${card.getLabel()} in your hand`;
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
    const numDiscard = targetPlayer.discardPile.length;
    if (numDiscard > 0 && targetPlayer.discardPile[numDiscard-1].type === cards.HANDMAID) {
      const message = '(Only visible to you) You can\'t target someone who played ' +
        `${cardLabels[cards.HANDMAID]} last turn`;
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
    const winnerIds = winners && winners.map(winner => winner.id);
    broadcast('endGame', winnerIds);
    broadcastSystemMessage('Game is over!');
    this.state = STATE_GAME_END;

    broadcastGameDataToPlayers(true);
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

  // Returns true if card effect was performed successfully, false otherwise.
  this.performCardEffect = (card, effectData) => {
    const activePlayer = this.players[this.activePlayerId];

    const targetPlayer = (
      effectData && effectData.targetPlayerId ?
        this.players[effectData.targetPlayerId] :
        undefined
    );

    if (allAlivePlayersHaveHandmaids()) {
      console.log('all players have handmaids. discarding...');
      broadcastSystemMessage(`${activePlayer.name} discarded ${card.getLabel()}`);
      return false;
    }

    const broadcastMessage = [`${activePlayer.name} played ${card.getLabel()}`];
    const targetPlayerCard = targetPlayer && targetPlayer.hand[0];
    // the card that the active player did not play
    const activePlayerOtherCard = activePlayer.hand.find(handCard => handCard.id !== card.id);

    activePlayer.setHandmaid(false);

    switch (card.type) {
      case cards.GUARD:
        const { guardNumberGuess } = effectData;
        broadcastMessage.push(`and guessed ${targetPlayer.name} has a ${guardNumberGuess} card`);

        const guardGuessCardTypes = Object.keys(cardNumbers).filter(cardType => {
          return guardNumberGuess === cardNumbers[cardType];
        }).map(card => parseInt(card, 10)); // for some reason it gets turned into a string

        if (guardGuessCardTypes.includes(targetPlayer.hand[0].type)) {
          // Dead!
          broadcastSystemMessage(broadcastMessage.join(' '));
          knockOut(targetPlayer);
          return true;
        } else {
          broadcastMessage.push('but was wrong');
        }
        break;
      case cards.PRIEST:
        console.log('revealing for priest');
        emitToPlayer(activePlayer.id, 'priestReveal', targetPlayerCard);
        const priestRevealMessage = `(Only visible to you) ${targetPlayer.name} is holding the ` +
          `${targetPlayerCard.getLabel()}!`;
        emitSystemMessage(activePlayer.id, priestRevealMessage);
        broadcastMessage.push(`and is looking at ${targetPlayer.name}'s card`);
        break;
      case cards.BARON:
        const baronRevealData = [{
          playerId: activePlayer.id,
          card: activePlayerOtherCard,
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
          return true;
        }

        let loser;
        if (activePlayer.hand[0].getNumber() < targetPlayer.hand[0].getNumber()) {
          loser = activePlayer;
        } else {
          loser = targetPlayer;
        }
        knockOut(loser);
        return true;
      case cards.PRINCE:
        targetPlayer.discardCardById(targetPlayerCard.id);
        broadcastMessage.push(
          `and forced ${targetPlayer.name} to discard their card`,
        );
        if (targetPlayerCard.type === cards.PRINCESS) {
          broadcastSystemMessage(broadcastMessage);
          knockOut(targetPlayer);
          return true;
        }
        drawCard({ player: targetPlayer, canUseBurnCard: true });
        broadcastMessage.push(
          'and draw a new one',
        );
        break;
      case cards.KING:
        // Switch the cards!
        targetPlayer.hand[0] = activePlayerOtherCard;
        activePlayer.hand[0] = targetPlayerCard;
        broadcastMessage.push(
          `and switched cards with ${targetPlayer.name}`,
        );
        break;
      case cards.PRINCESS:
        // effects handled elsewhere
        broadcastMessage.push('... oops!');
        knockOut(activePlayer);
        break;
      case cards.HANDMAID:
        activePlayer.setHandmaid(true);
        broadcastMessage.push('and is immune from card effects until their next turn');
        break;
      case cards.COUNTESS:
        // effects handled elsewhere
        break;
      default:
        throw `unknown card played: ${card}`;
    }

    broadcastSystemMessage(broadcastMessage.join(' '));
    return true;
  };

  const allAlivePlayersHaveHandmaids = () => {
    const players = Object.values(this.players);
    const playerWithoutHandmaid = players.find(
      player => !player.handmaidActive && (player.id !== this.activePlayerId)
    );
    return !playerWithoutHandmaid;
  };

  const knockOut = player => {
    player.knockOut();
    broadcastSystemMessage(`${player.name} was knocked out of the round!`);
  };

  const emitSystemMessage = (playerId, msg) => {
    const messageObj = {
      id: uuid.v4(),
      text: msg,
      type: 'system',
    };
    emitToPlayer(playerId, 'message', messageObj);
  };

  const broadcastGameDataToPlayers = (includeHands = false) => {
    Object.keys(this.players).forEach(playerId =>
      emitToPlayer(
        playerId,
        'gameData',
        this.serializeForPlayer(playerId, includeHands),
      )
    );
  };

  this.serializeForPlayer = (playerIdToSerializeFor, includeHands) => {
    const { activePlayerId, roundNum, state } = this;
    const playerData = {};

    Object.keys(this.players).forEach(playerId => {
      const serialized = this.players[playerId].serialize({
        includeHand: includeHands || (playerIdToSerializeFor === playerId),
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
