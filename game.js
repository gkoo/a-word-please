const _ = require('lodash');
const uuid = require('uuid');

const { cards, cardLabels, cardNumbers } = require('./constants');
const Card = require('./card');
const Player = require('./player');

function Game({
  broadcastToRoom,
  broadcastSystemMessage,
  broadcastTo,
  users,
}) {
  this.broadcastToRoom = broadcastToRoom;
  this.broadcastSystemMessage = broadcastSystemMessage;
  this.broadcastTo = broadcastTo;
  this.users = users;
}

Game.prototype = {
  STATE_PENDING: 0,
  STATE_STARTED: 1,
  STATE_ROUND_END: 2,
  STATE_GAME_END: 3,

  MIN_PLAYERS: 2,
  MAX_PLAYERS: 4,

  setup: function() {
    const userList = Object.values(this.users);
    this.state = this.STATE_STARTED;
    this.players = {};
    this.spectatorIds = userList.slice(this.MAX_PLAYERS);

    const usersToConvertToPlayers = userList.slice(0, this.MAX_PLAYERS);
    const numPlayers = usersToConvertToPlayers.length;
    if (numPlayers < this.MIN_PLAYERS) {
      this.broadcastSystemMessage(`Cannot start the game with less than ${this.MIN_PLAYERS} players`);
      return;
    }
    usersToConvertToPlayers.forEach(user => {
      const player = new Player({ id: user.id, name: user.name });
      this.players[user.id] = player;
    });
    this.roundNum = 0;
    this.determinePlayerOrder();
    this.determineMaxTokens();
    this.newRound();
    this.broadcastSystemMessage('Game has started!');
    this.broadcastGameDataToPlayers();
  },

  getPlayers: function() {
    return Object.values(this.players);
  },

  addSpectator: function(id) {
    this.spectatorIds.push(id);
  },

  removeUser: function(id) {
    // Remove from `players` and `users`
    if (this.players[id]) { this.players[id].connected = false; }
    const idx = this.spectatorIds.findIndex(spectatorId => spectatorId === id);
    if (idx >= 0) { this.spectatorIds.splice(idx, 1) }
  },

  newRound: function() {
    if (![this.STATE_STARTED, this.STATE_ROUND_END].includes(this.state)) { return; }

    this.state = this.STATE_STARTED;
    ++this.roundNum;
    this.getPlayers().forEach(player => player.resetCards());

    // keeps track of how far through the deck we are
    this.deckCursor = 0;

    this.createDeck();
    this.dealCards();

    this.broadcastSystemMessage('New round starting...');

    this.nextTurn();
  },

  createDeck: function() {
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
  },

  dealCards: function() {
    const players = this.getPlayers();
    const playerIds = players.map(player => player.id);
    for (let i=0; i < players.length; ++i) {
      const playerId = playerIds[i];
      const card = this.deck[this.deckCursor++];
      this.players[playerId].addCardToHand(card);
    }
  },

  determinePlayerOrder: function() {
    const playerIds = this.getPlayers().map(player => player.id);
    this.playerOrder = _.shuffle(playerIds);

    // keeps track of whose turn it is.
    this.playerOrderCursor = 0;
  },

  determineMaxTokens: function() {
    switch (this.getPlayers().length) {
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
  },

  drawCard: function({ player, canUseBurnCard }) {
    let nextCard;

    if (this.deckCursor >= this.deck.length && canUseBurnCard) {
      // For the Prince card effect
      nextCard = this.burnCard;
    } else {
      nextCard = this.deck[this.deckCursor++];
    }

    player.addCardToHand(nextCard);
  },

  nextTurn: function() {
    if (this.state !== this.STATE_STARTED) { return; }

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
      this.playerOrderCursor = (++this.playerOrderCursor) % this.getPlayers().length;
      nextPlayer = this.players[nextPlayerId];

      // Skip players who have been knocked out
      if (!nextPlayer.isKnockedOut) { break; }
    }

    // Add the next card into the hand of the player
    this.drawCard({ player: nextPlayer, canUseBurnCard: false });

    // Id of the player whose turn it is
    this.activePlayerId = nextPlayer.id;

    this.broadcastGameDataToPlayers();
  },

  playCard: function(playerId, cardId, effectData = {}) {
    const player = this.players[playerId];

    if (this.activePlayerId !== playerId) {
      throw 'Player tried to play a card when it wasn\'t their turn! Aborting...';
    }

    const card = player.getCard(cardId);
    if (!card) {
      throw 'Player tried to play a card when it wasn\'t in their hand! Aborting...';
    }

    if (!this.isLegalMove(player, card, effectData)) {
      return;
    }

    const success = this.performCardEffect(card, effectData);

    // Tell FE what card was played and who was targeted, if applicable
    this.broadcastToRoom('lastCardPlayed', {
      playerId: this.activePlayerId,
      card,
      effectData,
      discarded: !success,
    });

    if (!player.isKnockedOut) { player.discardCardById(card.id); }

    const endActions = () => {
      // Tell the clients to dismiss their revealed cards
      this.broadcastToRoom('dismissReveal');

      this.nextTurn();
    };

    setTimeout(endActions, 2000);
  },

  isLegalMove: function(player, card, effectData = {}) {
    // Check Countess card effect
    // TODO: alert this error instead of putting in chat
    if ([cards.KING, cards.PRINCE].includes(card.type) && player.hasCard(cards.COUNTESS)) {
      // If you have the King or Prince in your hand, you must discard the Countess.
      const message = `(Only visible to you) You cannot discard the ` +
        `${cardLabels[cards.COUNTESS]} when you have the ${card.getLabel()} in your hand`;
      this.emitSystemMessage(player.id, message);
      return false;
    }

    const { targetPlayerId } = effectData;
    const targetPlayer = targetPlayerId ? this.players[targetPlayerId] : null;

    if (!targetPlayer) { return true; }

    // Moves involving targeted players

    // Prohibit targeting knocked out players
    if (targetPlayer.isKnockedOut) {
      this.emitSystemMessage(
        player.id,
        '(Only visible to you) Cannot target knocked out players',
      );
      return false;
    }

    // Check Handmaid card effect
    if (targetPlayerId !== this.activePlayerId && targetPlayer.handmaidActive) {
      const message = '(Only visible to you) You can\'t target someone who played ' +
        `${cardLabels[cards.HANDMAID]} last turn`;
      this.emitSystemMessage(player.id, message);
      return false;
    }

    return true;
  },

  endRound: function() {
    this.state = this.STATE_ROUND_END;

    // Determine winner
    const roundWinners = this.determineRoundWinners();

    const roundEndMsg = `${roundWinners.map(winner => winner.name).join(' and ')} won the round!`;
    this.broadcastSystemMessage(roundEndMsg);

    const isGameOver = false;
    const gameWinners = roundWinners.filter(
      roundWinner => ++roundWinner.numTokens >= this.maxTokens
    );

    if (gameWinners.length > 0) {
      this.endGame(gameWinners);
      return;
    }

    this.broadcastGameDataToPlayers();
  },

  determineRoundWinners: function() {
    const playerList = Object.values(this.players);
    const alivePlayers = this.getAlivePlayers();

    if (alivePlayers.length === 0) {
      this.broadcastSystemMessage('No one won the round...');
      this.broadcastGameDataToPlayers();
      return;
    }

    // Sort by card number descending
    alivePlayers.sort(
      (player1, player2) => player1.hand[0].getNumber() - player2.hand[0].getNumber()
    );

    const finalists = [];
    const highestCardNumber = alivePlayers[alivePlayers.length - 1].hand[0].getNumber();
    for (let i = alivePlayers.length - 1; i >= 0; --i) {
      const player = alivePlayers[i]
      if (player.hand[0].getNumber() < highestCardNumber) {
        break;
      }
      console.log(`${player.name} is a finalist with a card number of ${player.hand[0].getNumber()}`);
      finalists.push(player);
    }

    if (finalists.length === 1) {
      return finalists;
    }

    // Tie-break. Add up the discard piles
    let maxDiscardTotal = 0;

    let roundWinners = [];

    finalists.forEach(finalist => {
      const discardTotal = _.reduce(
        finalist.discardPile,
        (sum, discardCard) => sum + discardCard.getNumber(),
        0,
      );
      if (discardTotal > maxDiscardTotal) {
        maxDiscardTotal = discardTotal;
        roundWinners = [finalist];
      } else if (discardTotal === maxDiscardTotal) {
        roundWinners.push(finalist);
      }
    });

    return roundWinners;
  },

  endGame: function(winners) {
    console.log('end game');
    const winnerIds = winners && winners.map(winner => winner.id);
    this.broadcastToRoom('endGame', winnerIds);
    this.broadcastSystemMessage('Game is over!');
    this.state = this.STATE_GAME_END;

    this.broadcastGameDataToPlayers(true);
  },

  // Send all players back to the lobby
  setPending: function() {
    this.state = this.STATE_PENDING;

    // move all players to spectators
    Object.keys(this.players).forEach(playerId => {
      if (!this.spectatorIds.includes(playerId)) {
        this.spectatorIds.push(playerId);
      }
    });
    this.players = {};
    this.broadcastGameDataToPlayers();
  },

  getWinnerIds: function() {
    const winners = Object.values(this.players).filter(
      player => player.numTokens >= this.maxTokens
    );
    return winners.map(winner => winner.id);
  },

  getAlivePlayers: function() {
    return Object.values(this.players).filter(player => !player.isKnockedOut);
  },

  isRoundOver: function() { return this.state !== this.STATE_STARTED; },

  isGameOver: function() { return this.state === this.STATE_GAME_END; },

  // Returns true if card effect was performed successfully, false otherwise.
  performCardEffect: function (card, effectData) {
    const activePlayer = this.players[this.activePlayerId];

    const statusMessage = `${activePlayer.name} played ${card.getLabel()}`;
    console.log(statusMessage);

    const targetPlayer = (
      effectData && effectData.targetPlayerId ?
        this.players[effectData.targetPlayerId] :
        undefined
    );

    const cardsWithTargets = [cards.GUARD, cards.PRIEST, cards.BARON, cards.PRINCE, cards.KING];

    activePlayer.setHandmaid(false);

    // Do all alive players have handmaids?
    if (cardsWithTargets.includes(card.type) && this.allAlivePlayersHaveHandmaids()) {
      // Prince card is allowed to target self
      if (card.type !== cards.PRINCE || targetPlayer.id !== activePlayer.id) {
        console.log('all players have handmaids. discarding...');
        this.broadcastSystemMessage(`${activePlayer.name} discarded ${card.getLabel()}`);
        return false;
      }
    }

    const broadcastMessage = [statusMessage];

    let targetPlayerCard;
    if (targetPlayer) {
      // Prince is allowed to target self. Choose the correct target card
      if (targetPlayer.id === activePlayer.id) {
        targetPlayerCard = activePlayer.hand.find(handCard => handCard.id !== card.id);
      } else {
        targetPlayerCard = targetPlayer.hand[0];
      }
    }
    // the card that the active player did not play
    const activePlayerOtherCardIdx = activePlayer.hand.findIndex(handCard => handCard.id !== card.id)
    const activePlayerOtherCard = activePlayer.hand[activePlayerOtherCardIdx];

    switch (card.type) {
      case cards.GUARD:
        const { guardNumberGuess } = effectData;
        broadcastMessage.push(`and guessed ${targetPlayer.name} has a ${guardNumberGuess} card`);

        const guardGuessCardTypes = Object.keys(cardNumbers).filter(cardType => {
          return guardNumberGuess === cardNumbers[cardType];
        }).map(card => parseInt(card, 10)); // for some reason it gets turned into a string

        if (guardGuessCardTypes.includes(targetPlayer.hand[0].type)) {
          // Dead!
          this.broadcastSystemMessage(broadcastMessage.join(' '));
          this.knockOut(targetPlayer);
          return true;
        } else {
          broadcastMessage.push('but was wrong');
        }
        break;
      case cards.PRIEST:
        console.log('revealing for priest');
        this.broadcastTo(activePlayer.id, 'priestReveal', targetPlayerCard);
        const priestRevealMessage = `(Only visible to you) ${targetPlayer.name} is holding the ` +
          `${targetPlayerCard.getLabel()}!`;
        this.emitSystemMessage(activePlayer.id, priestRevealMessage);
        broadcastMessage.push(`and is looking at ${targetPlayer.name}'s card`);
        break;
      case cards.BARON:
        const baronRevealData = [{
          playerId: activePlayer.id,
          card: activePlayerOtherCard,
        }, {
          playerId: targetPlayer.id,
          card: targetPlayerCard,
        }];
        this.broadcastTo(activePlayer.id, 'baronReveal', baronRevealData);
        this.broadcastTo(targetPlayer.id, 'baronReveal', baronRevealData);
        broadcastMessage.push(`and compared cards with ${targetPlayer.name}`);

        // Who died?
        this.broadcastSystemMessage(broadcastMessage.join(' '));
        if (activePlayerOtherCard.getNumber() === targetPlayerCard.getNumber()) {
          this.broadcastSystemMessage('Nothing happened...');
          return true;
        }

        let loser;
        if (activePlayerOtherCard.getNumber() < targetPlayerCard.getNumber()) {
          loser = activePlayer;
        } else {
          loser = targetPlayer;
        }
        this.knockOut(loser);
        return true;
      case cards.PRINCE:
        targetPlayer.discardCardById(targetPlayerCard.id);
        broadcastMessage.push(
          `and forced ${targetPlayer.name} to discard their card`,
        );
        if (targetPlayerCard.type === cards.PRINCESS) {
          this.broadcastSystemMessage(broadcastMessage);
          this.knockOut(targetPlayer);
          return true;
        }
        this.drawCard({ player: targetPlayer, canUseBurnCard: true });
        broadcastMessage.push(
          'and draw a new one',
        );
        break;
      case cards.KING:
        // Switch the cards!
        targetPlayer.hand[0] = activePlayerOtherCard;
        activePlayer.hand[activePlayerOtherCardIdx] = targetPlayerCard;
        broadcastMessage.push(
          `and switched cards with ${targetPlayer.name}`,
        );
        break;
      case cards.PRINCESS:
        // effects handled elsewhere
        broadcastMessage.push('... oops!');
        this.knockOut(activePlayer);
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

    this.broadcastSystemMessage(broadcastMessage.join(' '));

    return true;
  },

  allAlivePlayersHaveHandmaids: function() {
    const players = Object.values(this.players);
    const playerWithoutHandmaid = players.find(
      player => !player.isKnockedOut && !player.handmaidActive && (player.id !== this.activePlayerId)
    );
    return !playerWithoutHandmaid;
  },

  knockOut: function(player) {
    player.knockOut();
    this.broadcastSystemMessage(`${player.name} was knocked out of the round!`);
  },

  emitSystemMessage: function(playerId, msg) {
    const messageObj = {
      id: uuid.v4(),
      text: msg,
      type: 'system',
    };
    this.broadcastTo(playerId, 'message', messageObj);
  },

  broadcastGameDataToPlayers: function(includeHands = false) {
    Object.keys(this.players).forEach((playerId) => {
      this.broadcastTo(
        playerId,
        'gameData',
        this.serializeForPlayer(playerId, includeHands),
      );
    });
    this.spectatorIds.forEach(id => this.broadcastTo(id, 'gameData', this.serializeForSpectator()));
  },

  serializeForPlayer: function(playerIdToSerializeFor, includeHands) {
    const {
      activePlayerId,
      playerOrder,
      roundNum,
      state,
    } = this;

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
      playerOrder,
      roundNum,
      state,
    };
  },

  serializeForSpectator: function() { return this.serializeForPlayer(null, true); },

  serialize: function() {
    const {
      activePlayerId,
      deck,
      deckCursor,
      players,
      playerOrder,
      playerOrderCursor,
      roundNum,
      spectatorIds,
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
      spectatorIds,
      state,
    };
  },
}

module.exports = Game;
