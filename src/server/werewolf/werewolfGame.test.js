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

describe('setRoleIds', () => {
  const roleIds = ['werewolf1'];
  const subject = () => game.setRoleIds(roleIds);

  it('sets the selected role ids', () => {
    subject();
    expect(game.roleIds).toHaveLength(1);
    expect(game.roleIds[0]).toBe(roleIds[0]);
  });
});

describe('beginNighttime', () => {
  const subject = () => game.beginNighttime();

  beforeEach(() => {
    game.roleIds = [
      'werewolf1',
      'seer',
      'troublemaker',
      'robber',
      'drunk',
      'insomniac',
    ];
  });

  it('sets the game state to NIGHTTIME', () => {
    subject();
    expect(game.state).toBe(WerewolfGame.STATE_NIGHTTIME);
  });
});

describe('assignRoles', () => {
  const subject = () => game.assignRoles();

  beforeEach(() => {
    game.roleIds = [
      'werewolf1',
      'seer',
      'troublemaker',
      'robber',
      'drunk',
      'insomniac',
    ];
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

  describe('when ensuring there is a werewolf', () => {
    beforeEach(() => {
      game.ensureWerewolf = true;
    });

    it('assigns a werewolf to one of the players', () => {
      subject();
      const playerList = Object.values(game.players);
      expect(!!playerList.find(player => player.role === WerewolfGame.ROLE_WEREWOLF)).toBe(true);
    });
  });

  describe('when the number of selected roles don\'t match', () => {
    beforeEach(() => {
      game.roleIds = [
        'werewolf1',
        'seer',
      ];
    });

    it('throws error', () => {
      expect(subject).toThrow();
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
      game.numWakeUps = 2;
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

  describe('when it is the Drunk\'s turn', () => {
    beforeEach(() => {
      game.currentWakeUpIdx = 4;
      game.unclaimedRoles = [
        WerewolfGame.ROLE_WEREWOLF,
        WerewolfGame.ROLE_WEREWOLF,
        WerewolfGame.ROLE_WEREWOLF,
      ];
      game.players['user2'].originalRole = WerewolfGame.ROLE_DRUNK;
      game.players['user2'].role = WerewolfGame.ROLE_DRUNK;
    });

    it('swaps roles with an unclaimed role', () => {
      subject();
      expect(game.players['user2'].role).toBe(WerewolfGame.ROLE_WEREWOLF);
      expect(game.unclaimedRoles).toContain(WerewolfGame.ROLE_DRUNK);
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
      WerewolfGame.ROLE_WEREWOLF,
      WerewolfGame.ROLE_WEREWOLF,
    ];
    game.players['user1'].role = WerewolfGame.ROLE_DRUNK;
  });

  it('swaps the player\'s role with a random unclaimed role', () => {
    game.swapRoleWithUnclaimed('user1');
    expect(game.unclaimedRoles).toContain(WerewolfGame.ROLE_DRUNK);
    expect(game.players['user1'].role).toBe(WerewolfGame.ROLE_WEREWOLF);
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

describe('determineWinners', () => {
  let votes;
  const subject = () => {
    game.votes = votes;
    game.determineWinners();
  };

  beforeEach(() => {
    game.state = WerewolfGame.STATE_VOTING;
    game.players['user1'].role = WerewolfGame.ROLE_WEREWOLF;
    game.players['user2'].role = WerewolfGame.ROLE_TANNER;
    game.players['user3'].role = WerewolfGame.ROLE_VILLAGER;
  });

  describe('when state doesn\'t match', () => {
    beforeEach(() => {
      game.state = WerewolfGame.STATE_NIGHTTIME;
    });

    it('does nothing', () => {
      subject();
      expect(game.winners).toHaveLength(0);
    });
  });

  describe('when the werewolf has the most votes', () => {
    beforeEach(() => {
      votes = {
        'user1': 'user2',
        'user2': 'user1',
        'user3': 'user1',
      };
    });

    it('declares the villagers the winners', () => {
      subject();
      expect(game.winners).toHaveLength(1);
      expect(game.winners[0]).toBe(WerewolfGame.ROLE_VILLAGER);
    });
  });

  describe('when the villager has the most votes', () => {
    beforeEach(() => {
      votes = {
        'user1': 'user3',
        'user2': 'user3',
        'user3': 'user1',
      };
    });

    it('declares the werewolves the winners', () => {
      subject();
      expect(game.winners).toHaveLength(1);
      expect(game.winners[0]).toBe(WerewolfGame.ROLE_WEREWOLF);
    });
  });

  describe('when the tanner has the most votes', () => {
    beforeEach(() => {
      votes = {
        'user1': 'user2',
        'user2': 'user2',
        'user3': 'user2',
      };
    });

    it('declares the tanner the winner', () => {
      subject();
      expect(game.winners).toHaveLength(1);
      expect(game.winners[0]).toBe(WerewolfGame.ROLE_TANNER);
    });
  });

  describe('when all players have one vote', () => {
    beforeEach(() => {
      votes = {
        'user1': 'user2',
        'user2': 'user3',
        'user3': 'user1',
      };
    });

    describe('and there is at least one werewolf', () => {
      it('declares the werewolves the winners', () => {
        subject();
        expect(game.winners).toHaveLength(1);
        expect(game.winners[0]).toBe(WerewolfGame.ROLE_WEREWOLF);
      });
    });

    describe('and there are no werewolves', () => {
      beforeEach(() => {
        game.players['user1'].role = WerewolfGame.ROLE_VILLAGER;
      });

      it('declares the villagers the winners', () => {
        subject();
        expect(game.winners).toHaveLength(1);
        expect(game.winners[0]).toBe(WerewolfGame.ROLE_VILLAGER);
      });
    });
  });

  describe('when the hunter dies', () => {
    beforeEach(() => {
      game.players['user2'].role = WerewolfGame.ROLE_HUNTER;
    });

    describe('and the hunter voted to eliminate a werewolf', () => {
      beforeEach(() => {
        votes = {
          'user1': 'user2',
          'user2': 'user1',
          'user3': 'user2',
        };
      });

      it('declares the villagers the winners', () => {
        subject();
        expect(game.winners).toHaveLength(1);
        expect(game.winners[0]).toBe(WerewolfGame.ROLE_VILLAGER);
      });
    });

    describe('and the hunter voted to eliminate a villager', () => {
      beforeEach(() => {
        votes = {
          'user1': 'user2',
          'user2': 'user3',
          'user3': 'user2',
        };
      });

      it('declares the werewolves the winners', () => {
        subject();
        expect(game.winners).toHaveLength(1);
        expect(game.winners[0]).toBe(WerewolfGame.ROLE_WEREWOLF);
      });
    });
  });
});
