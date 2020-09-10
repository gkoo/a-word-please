import http from 'http';

import MockExpress from 'mock-express';
import socketIO from 'socket.io';

import WerewolfGame, { GameState, Role } from './werewolfGame';
import User from '../user';

let game: WerewolfGame;

beforeEach(() => {
  const broadcastToRoom = jest.fn((eventName: string, data: any) => {});
  const users = {
    '1': new User({ id: 'user1', name: 'Gordon' }),
    '2': new User({ id: 'user2', name: 'Fordon' }),
    '3': new User({ id: 'user3', name: 'Bordon' }),
  };
  game = new WerewolfGame(broadcastToRoom);
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

  it('sets the game state to Nighttime', () => {
    subject();
    expect(game.state).toBe(GameState.Nighttime);
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
    expect(allRoles.includes(Role.Werewolf)).toBe(true);
    expect(allRoles.includes(Role.Seer)).toBe(true);
    expect(allRoles.includes(Role.Troublemaker)).toBe(true);
    expect(allRoles.includes(Role.Robber)).toBe(true);
    expect(allRoles.includes(Role.Drunk)).toBe(true);
    expect(allRoles.includes(Role.Insomniac)).toBe(true);
  });

  describe('when ensuring there is a werewolf', () => {
    beforeEach(() => {
      game.ensureWerewolf = true;
    });

    it('assigns a werewolf to one of the players', () => {
      subject();
      const playerList = Object.values(game.players);
      expect(!!playerList.find(player => player.role === Role.Werewolf)).toBe(true);
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
    game.players['user1'].originalRole = Role.Seer;
  });

  describe('when we\'ve traversed through the entire list of wake up roles', () => {
    beforeEach(() => {
      game.currentWakeUpIdx = WerewolfGame.WAKE_UP_ORDER.length;
      game.numWakeUps = 2;
    });

    it('moves the game to DAYTIME', () => {
      subject();
      expect(game.state).toBe(GameState.Daytime);
    });
  });

  describe('when there are players with the current wake-up role', () => {
    beforeEach(() => {
      game.currentWakeUpIdx = 1;
    });

    it('sets the wake up role', () => {
      subject();
      expect(game.wakeUpRole).toBe(Role.Seer);
    });
  });

  describe('when there are no players with the current wake-up role', () => {
    beforeEach(() => {
      game.currentWakeUpIdx = 0;
    });

    it('does not set the game\'s wake up role to that role', () => {
      subject();
      expect(game.wakeUpRole).not.toBe(Role.Doppelganger);
    });
  });

  describe('when it is the Drunk\'s turn', () => {
    beforeEach(() => {
      game.currentWakeUpIdx = 7;
      game.unclaimedRoles = [
        Role.Werewolf,
        Role.Werewolf,
        Role.Werewolf,
      ];
      game.players['user2'].originalRole = Role.Drunk;
      game.players['user2'].role = Role.Drunk;
    });

    it('swaps roles with an unclaimed role', () => {
      subject();
      expect(game.players['user2'].role).toBe(Role.Werewolf);
      expect(game.unclaimedRoles).toContain(Role.Drunk);
    });
  });
});

describe('handlePlayerAction', () => {
  beforeEach(() => {
    game.players['user1'].role = Role.Werewolf;
    game.players['user2'].role = Role.Hunter;
    game.players['user3'].originalRole = Role.Troublemaker;
  });

  describe('for troublemaker', () => {
    it('switches the roles provided', () => {
      game.handlePlayerAction('user3', {
        action: 'troublemakeRoles',
        playerIds: ['user1', 'user2'],
      });
      expect(game.players['user1'].role).toBe(Role.Hunter);
      expect(game.players['user2'].role).toBe(Role.Werewolf);
    });
  });
});

describe('robRole', () => {
  beforeEach(() => {
    game.players['user1'].role = Role.Werewolf;
    game.players['user2'].role = Role.Hunter;
  });

  const subject = () => game.robRole('user1', 'user2');

  it('exchanges the roles', () => {
    subject();
    expect(game.players['user1'].role).toBe(Role.Hunter);
    expect(game.players['user2'].role).toBe(Role.Werewolf);
  });

  it('changes the last known role for the robber', () => {
    subject();
    expect(game.players['user1'].lastKnownRole).toBe(Role.Hunter);
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
    game.players['user1'].role = Role.Werewolf;
    game.players['user2'].role = Role.Hunter;
  });

  const subject = () => game.switchRoles('user1', 'user2');

  it('exchanges the roles', () => {
    subject();
    expect(game.players['user1'].role).toBe(Role.Hunter);
    expect(game.players['user2'].role).toBe(Role.Werewolf);
  });
});

describe('swapRoleWithUnclaimed', () => {
  beforeEach(() => {
    game.unclaimedRoles = [
      Role.Werewolf,
      Role.Werewolf,
      Role.Werewolf,
    ];
    game.players['user1'].role = Role.Drunk;
  });

  it('swaps the player\'s role with a random unclaimed role', () => {
    game.swapRoleWithUnclaimed('user1');
    expect(game.unclaimedRoles).toContain(Role.Drunk);
    expect(game.players['user1'].role).toBe(Role.Werewolf);
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
    game.state = GameState.Voting;
    game.players['user1'].role = Role.Werewolf;
    game.players['user2'].role = Role.Tanner;
    game.players['user3'].role = Role.Villager;
  });

  describe('when state doesn\'t match', () => {
    beforeEach(() => {
      game.state = GameState.Nighttime;
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
      expect(game.winners[0]).toBe(Role.Villager);
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
      expect(game.winners[0]).toBe(Role.Werewolf);
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
      expect(game.winners[0]).toBe(Role.Tanner);
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
        expect(game.winners[0]).toBe(Role.Werewolf);
      });
    });

    describe('and there are no werewolves', () => {
      beforeEach(() => {
        game.players['user1'].role = Role.Villager;
      });

      it('declares the villagers the winners', () => {
        subject();
        expect(game.winners).toHaveLength(1);
        expect(game.winners[0]).toBe(Role.Villager);
      });
    });
  });

  describe('when the hunter dies', () => {
    beforeEach(() => {
      game.players['user2'].role = Role.Hunter;
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
        expect(game.winners[0]).toBe(Role.Villager);
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
        expect(game.winners[0]).toBe(Role.Werewolf);
      });
    });
  });
});
