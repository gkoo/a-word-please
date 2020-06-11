const http = require('http');

const MockExpress = require('mock-express');
const socketIO = require('socket.io');

const WerewolfGame = require('./werewolfGame');
const User = require('../user.js');

const mockApp = MockExpress();
const mockServer = http.createServer(mockApp);
const mockIo = socketIO(mockServer);

let game;

beforeEach(() => {
  const users = {
    '1': new User({ id: 'user1', name: 'Gordon' }),
    '2': new User({ id: 'user2', name: 'Fordon' }),
    '3': new User({ id: 'user3', name: 'Bordon' }),
  };
  game = new WerewolfGame(mockIo, users);
  game.setup(users);
});

describe('toggleRole', () => {
  describe('when selected', () => {
    it('sets the role ID as selected', () => {
      game.toggleRole({ roleId: 'werewolf1', selected: true });
      expect(game.roleIds['werewolf1']).toBe(true);
    });
  });

  describe('when not selected', () => {
    beforeEach(() => {
      game.roleIds['werewolf1'] = true;
    });

    it('sets the role ID as selected', () => {
      game.toggleRole({ roleId: 'werewolf1', selected: false });
      expect(game.roleIds['werewolf1']).toBe(false);
    });
  });
});

describe('beginNighttime', () => {
  const subject = () => game.beginNighttime();

  beforeEach(() => {
    game.roleIds = {
      werewolf1: true,
      seer: true,
      troublemaker: true,
      robber: true,
      drunk: true,
      insomniac: true,
    };
  });

  it('assigns roles to players and leaves three unclaimed', () => {
    subject();
    expect(game.unclaimedRoles).toHaveLength(3);
    const playerRoles = Object.values(game.players).map(player => player.originalRole);
    const allRoles = playerRoles.concat(game.unclaimedRoles);
    expect(allRoles.includes(WerewolfGame.ROLE_WEREWOLF)).toBe(true);
    expect(allRoles.includes(WerewolfGame.ROLE_SEER)).toBe(true);
    expect(allRoles.includes(WerewolfGame.ROLE_TROUBLEMAKER)).toBe(true);
    expect(allRoles.includes(WerewolfGame.ROLE_ROBBER)).toBe(true);
    expect(allRoles.includes(WerewolfGame.ROLE_DRUNK)).toBe(true);
    expect(allRoles.includes(WerewolfGame.ROLE_INSOMNIAC)).toBe(true);
  });

  it('sets the game state to NIGHTTIME', () => {
    subject();
    expect(game.state).toBe(WerewolfGame.STATE_NIGHTTIME);
  });

  describe('when the number of selected roles don\'t match', () => {
    beforeEach(() => {
      game.roleIds = {
        werewolf1: true,
        seer: true,
      };
    });

    it('doesn\'t do anything', () => {
      subject();
      expect(game.state).toBe(WerewolfGame.STATE_CHOOSING_ROLES);
    });
  });
});

describe('performWakeUpActions', () => {
  const subject = () => game.performWakeUpActions();

  beforeEach(() => {
    game.players['user1'].originalRole = WerewolfGame.ROLE_SEER;
  });

  describe('when we\'ve traversed through the entire list of wake up roles', () => {
    beforeEach(() => {
      game.currentWakeUpIdx = WerewolfGame.WAKE_UP_ORDER.length;
    });

    it('moves the game to DAYTIME', () => {
      subject();
      expect(game.state).toBe(WerewolfGame.STATE_DAYTIME);
    });
  });

  describe('when there are players with the current wake-up role', () => {
    beforeEach(() => {
      game.currentWakeUpIdx = 1;
    });

    it('sets the wake up role', () => {
      subject();
      expect(game.wakeUpRole).toBe(WerewolfGame.ROLE_SEER);
    });
  });

  describe('when there are no players with the current wake-up role', () => {
    beforeEach(() => {
      game.currentWakeUpIdx = 0;
    });

    it('does not set the game\'s wake up role to that role', () => {
      subject();
      expect(game.wakeUpRole).not.toBe(WerewolfGame.ROLE_DOPPELGANGER);
    });
  });
});

describe('handlePlayerAction', () => {
  beforeEach(() => {
    game.players['user1'].role = WerewolfGame.ROLE_WEREWOLF;
    game.players['user2'].role = WerewolfGame.ROLE_HUNTER;
    game.players['user3'].originalRole = WerewolfGame.ROLE_TROUBLEMAKER;
  });

  describe('for troublemaker', () => {
    it('switches the roles provided', () => {
      game.handlePlayerAction('user3', {
        action: 'troublemakeRoles',
        playerIds: ['user1', 'user2'],
      });
      expect(game.players['user1'].role).toBe(WerewolfGame.ROLE_HUNTER);
      expect(game.players['user2'].role).toBe(WerewolfGame.ROLE_WEREWOLF);
    });
  });
});

describe('robRole', () => {
  beforeEach(() => {
    game.players['user1'].role = WerewolfGame.ROLE_WEREWOLF;
    game.players['user2'].role = WerewolfGame.ROLE_HUNTER;
  });

  const subject = () => game.robRole('user1', 'user2');

  it('exchanges the roles', () => {
    subject();
    expect(game.players['user1'].role).toBe(WerewolfGame.ROLE_HUNTER);
    expect(game.players['user2'].role).toBe(WerewolfGame.ROLE_WEREWOLF);
  });

  it('changes the last known role for the robber', () => {
    subject();
    expect(game.players['user1'].lastKnownRole).toBe(WerewolfGame.ROLE_HUNTER);
  });

  it('does not change the last known role for the victim', () => {
    const victim = game.players['user2'];
    const previousLastKnownRole = victim.lastKnownRole;
    subject();
    expect(game.players['user2'].lastKnownRole).toBe(previousLastKnownRole);
  });
});

describe('switchRoles', () => {
  beforeEach(() => {
    game.players['user1'].role = WerewolfGame.ROLE_WEREWOLF;
    game.players['user2'].role = WerewolfGame.ROLE_HUNTER;
  });

  const subject = () => game.switchRoles('user1', 'user2');

  it('exchanges the roles', () => {
    subject();
    expect(game.players['user1'].role).toBe(WerewolfGame.ROLE_HUNTER);
    expect(game.players['user2'].role).toBe(WerewolfGame.ROLE_WEREWOLF);
  });
});

describe('swapRoleWithUnclaimed', () => {
  beforeEach(() => {
    game.unclaimedRoles = [
      WerewolfGame.ROLE_WEREWOLF,
      WerewolfGame.ROLE_HUNTER,
      WerewolfGame.ROLE_VILLAGER,
    ];
    game.players['user1'].role = WerewolfGame.ROLE_DRUNK;
  });

  it('swaps the player\'s role with a random unclaimed role', () => {
    game.swapRoleWithUnclaimed('user1');
    expect(game.unclaimedRoles).toContain(WerewolfGame.ROLE_DRUNK);
    expect([
      WerewolfGame.ROLE_WEREWOLF,
      WerewolfGame.ROLE_HUNTER,
      WerewolfGame.ROLE_VILLAGER,
    ]).toContain(game.players['user1'].role)
  });
});

describe('nextTurn', () => {
  const subject = () => game.nextTurn();

  beforeEach(() => {
    game.currentWakeUpIdx = 0;
  });

  it('increments the currentWakeUpIdx', () => {
    const oldWakeUpIdx = game.currentWakeUpIdx;
    subject();
    expect(game.currentWakeUpIdx).toBeGreaterThan(oldWakeUpIdx);
  });
});
