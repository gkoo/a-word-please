const _ = require('lodash');

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

describe('nextTurn', () => {
  const subject = () => game.nextTurn();

  beforeEach(() => {
    game.setup();
  });

  it('changes the player turn', () => {
    subject();
    const { activePlayerId } = game;
    subject();
    const newActivePlayerId = game.activePlayerId;
    expect(newActivePlayerId).not.toEqual(activePlayerId);
  });

  it('adds a card to the hand of the player', () => {
    const oldPlayers = _.cloneDeep(game.players);
    subject();
    const oldHand = oldPlayers[game.activePlayerId].hand;
    const newHand = game.players[game.activePlayerId].hand;
    expect(newHand.length).toBeGreaterThan(oldHand.length);
  });
});

describe('serializeForPlayer', () => {
  beforeEach(() => {
    game.setup();
  });

  it('serializes correctly', () => {
    const { players, roundNum, state } = game.serializeForPlayer('1');
    expect(roundNum).toEqual(game.roundNum);
    expect(state).toEqual(game.state);
    expect(players['1'].hand).toHaveLength(1);
    // Shouldn't reveal player 2's hand
    expect(players['2'].hand).toBeUndefined();
  });
});
