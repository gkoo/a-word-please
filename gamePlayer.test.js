const { cards } = require('./constants');
const Card = require('./card');
const GamePlayer = require('./gamePlayer');

let gamePlayer;

beforeEach(() => {
  gamePlayer = new GamePlayer({ id: '1' });
});

describe('discard', () => {
  beforeEach(() => {
    gamePlayer.hand = [
      new Card({ id: 8, type: cards.GUARD }),
      new Card({ id: 9, type: cards.PRIEST }),
    ];
  });

  it('moves a card from hand to discardPile', () => {
    const cardToDiscardId = 9;
    gamePlayer.discardCardById(cardToDiscardId);
    expect(gamePlayer.hand).toHaveLength(1);
    expect(gamePlayer.hand[0].id).toEqual(8);
    expect(gamePlayer.discardPile).toHaveLength(1);
    expect(gamePlayer.discardPile[0].id).toEqual(cardToDiscardId);
  });
});
