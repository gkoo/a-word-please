const Game = require('./game');

let game;
let playerIds = ['1', '2'];

beforeEach(() => {
  game = new Game({ playerIds });
});

describe('setup', () => {
  it('deals cards', () => {
    game.setup();
    expect(game.deck).toHaveLength(15);
    Object.values(game.players).forEach(player => {
      expect(player.hand).toHaveLength(1);
      expect(player.hand[0]).toBeGreaterThanOrEqual(0);
    });
  });
});

describe('serializeForPlayer', () => {
  beforeEach(() => {
    game.setup();
  });

  test.only('serializes correctly', () => {
    const { players, roundNum, state } = game.serializeForPlayer('1');
    expect(roundNum).toEqual(game.roundNum);
    expect(state).toEqual(game.state);
    expect(players['1'].hand).toHaveLength(1);
    // Shouldn't reveal player 2's hand
    expect(players['2'].hand).toBeUndefined();
  });
});
