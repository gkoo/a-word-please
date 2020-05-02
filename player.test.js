const Card = require('./card');
const Player = require('./player');

let player;

beforeEach(() => {
  player = new Player({ id: '1' });
});

describe('discard', () => {
  beforeEach(() => {
    player.hand = [
      new Card({ id: 8, type: Card.GUARD }),
      new Card({ id: 9, type: Card.PRIEST }),
    ];
  });

  it('moves a card from hand to discardPile', () => {
    const cardToDiscardId = 9;
    player.discardCardById(cardToDiscardId);
    expect(player.hand).toHaveLength(1);
    expect(player.hand[0].id).toEqual(8);
    expect(player.discardPile).toHaveLength(1);
    expect(player.discardPile[0].id).toEqual(cardToDiscardId);
  });
});
