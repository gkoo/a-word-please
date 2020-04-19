const GamePlayer = require('./gamePlayer');

let gamePlayer;

beforeEach(() => {
  gamePlayer = new GamePlayer({ id: '1' });
});

describe('discard', () => {
  beforeEach(() => {
    gamePlayer.hand = [0, 2];
  });

  it.only('moves a card from hand to discardPile', () => {
    const cardToDiscard = 2;
    gamePlayer.discard(cardToDiscard);
    expect(gamePlayer.hand).toHaveLength(1);
    expect(gamePlayer.hand[0]).toEqual(0);
    expect(gamePlayer.discardPile).toHaveLength(1);
    expect(gamePlayer.discardPile[0]).toEqual(cardToDiscard);
  });
});
