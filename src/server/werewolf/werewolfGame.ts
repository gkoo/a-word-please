import _ from 'lodash';
import Game, { GameEnum } from '../game';
import WerewolfPlayer from './werewolfPlayer';

export enum Role {
  Werewolf,
  Minion,
  Mason,
  Seer,
  Robber,
  Troublemaker,
  Drunk,
  Insomniac,
  Hunter,
  Villager,
  Doppelganger,
  Tanner,
}

export enum GameState {
  Pending,
  TurnEnd,
  GameEnd,
  ChoosingRoles,
  Nighttime,
  Daytime,
  Voting,
  VoteResults,
}

class WerewolfGame extends Game {
  currentWakeUpIdx: number;
  eliminatedPlayers: Array<WerewolfPlayer>;
  ensureWerewolf: boolean;
  numWakeUps: number;
  playersOfCurrentRoleReady: number;
  revealingRoles: boolean;
  roleIds: Array<string>;
  unclaimedRoles: Array<Role>;
  votes: { [voterId: string]: string };
  votingTimeoutId: any;
  wakeUpRole: Role;
  werewolvesReady: number;
  winners: Array<Role>;

  static GAME_ID = GameEnum.Werewolf;

  static MIN_PLAYERS = 3;
  static MAX_PLAYERS = 10;

  static WAKE_UP_ORDER = [
    Role.Doppelganger,
    Role.Werewolf,
    Role.Minion,
    Role.Mason,
    Role.Seer,
    Role.Robber,
    Role.Troublemaker,
    Role.Drunk,
    Role.Insomniac,
  ];

  static ROLE_ID_TO_ENUM = {
    werewolf: Role.Werewolf,
    minion: Role.Minion,
    mason: Role.Mason,
    seer: Role.Seer,
    robber: Role.Robber,
    troublemaker: Role.Troublemaker,
    drunk: Role.Drunk,
    insomniac: Role.Insomniac,
    hunter: Role.Hunter,
    villager: Role.Villager,
    doppelganger: Role.Doppelganger,
    tanner: Role.Tanner,
  };

  constructor(broadcastToRoom) {
    super(broadcastToRoom);
    this.state = GameState.Pending;
    this.ensureWerewolf = false;
    this.roleIds = []; // to sync client views
    this.votes = {};
    this.unclaimedRoles = [];
    this.revealingRoles = false;
    this.playerClass = WerewolfPlayer;
  }

  setup(users) {
    super.setup(users);
    this.newGame();
  }

  newGame() {
    this.eliminatedPlayers = null;
    this.numWakeUps = 0;
    this.votes = {}
    this.unclaimedRoles = [];
    this.revealingRoles = false;
    this.state = GameState.ChoosingRoles;
    this.winners = [];

    this.broadcastGameDataToPlayers();
  }

  addPlayer(user) {
    const { id, name } = user;

    if (!name) { return; }

    if ([GameState.Pending, GameState.ChoosingRoles].includes(this.state)) {
      super.addPlayer(user);
    }
  }

  handlePlayerAction(playerId, data) {
    const currPlayer = this.players[playerId];
    switch (data.action) {
      case 'setRoleSelection':
        return this.setRoleIds(data.roleIds);
      case 'setEnsureWerewolf':
        this.ensureWerewolf = data.ensureWerewolf;
        this.broadcastGameDataToPlayers();
        return;
      case 'beginNighttime':
        return this.beginNighttime();
      case 'troublemakeRoles':
        if (currPlayer.originalRole === Role.Troublemaker) {
          this.switchRoles.apply(this, data.playerIds);
          this.nextTurn();
        }
        return;
      case 'robRole':
        if (currPlayer.originalRole === Role.Robber) {
          this.robRole(playerId, data.playerId);
        }
        return;
      case 'startVoting':
        return this.enableVoting();
      case 'voteToEliminate':
        return this.voteToEliminate(playerId, data.suspectId);
      case 'endTurn':
        return this.nextTurn();
      case 'revealRoles':
        return this.revealRoles();
      default:
        throw new Error(`Unexpected action ${data.action}`);
    }
  }

  endWerewolfTurn() {
    const numPlayersToWaitFor: number = Object.values(this.players).filter(
      player => player.role === Role.Werewolf
    ).length;
    if (++this.werewolvesReady >= numPlayersToWaitFor) {
      this.nextTurn();
    }
  }

  nextTurn() {
    // TODO: check for two insomniacs (due to Doppelganger)
    const numPlayersToWaitFor = Object.values(this.players).filter(
      player => player.role === this.wakeUpRole
    ).length;

    if (++this.playersOfCurrentRoleReady < numPlayersToWaitFor) {
      // We need to wait for everyone to be ready
      return;
    }
    this.playersOfCurrentRoleReady = 0;
    ++this.currentWakeUpIdx;
    this.performWakeUpActions();
  }

  setRoleIds(roleIds) {
    this.roleIds = roleIds;

    const hasWerewolf = !!this.roleIds.find(roleId => roleId.startsWith('werewolf'));

    if (!hasWerewolf) {
      this.ensureWerewolf = false;
    }
    this.broadcastGameDataToPlayers();
  }

  beginNighttime() {
    // Assign roles
    this.assignRoles();

    this.state = GameState.Nighttime;

    // Let's broadcast now because we don't know if we're going to artificially delay the first
    // turn.
    this.broadcastGameDataToPlayers();

    // traverse through each role's wakeup actions
    this.currentWakeUpIdx = 0;
    this.performWakeUpActions();
  }

  assignRoles() {
    const rolesToUse = this.roleIds.map(roleId => {
      const formattedRoleId = roleId.replace(/[^a-z]/, '');
      return WerewolfGame.ROLE_ID_TO_ENUM[formattedRoleId];
    });

    let shuffledRolesToAssign;
    let shuffledRoles;

    if (this.ensureWerewolf && rolesToUse.includes(Role.Werewolf)) {
      // Need to guarantee at least one player is a werewolf.
      const werewolfIdx = rolesToUse.indexOf(Role.Werewolf);
      const rolesToShuffle = rolesToUse.slice(0, werewolfIdx).concat(
        rolesToUse.slice(werewolfIdx + 1)
      );
      shuffledRoles = _.shuffle(rolesToShuffle);
      shuffledRolesToAssign = _.shuffle(shuffledRoles.slice(3).concat([Role.Werewolf]));
    } else {
      shuffledRoles = _.shuffle(rolesToUse);
      shuffledRolesToAssign = shuffledRoles.slice(3);
    }

    this.unclaimedRoles = shuffledRoles.slice(0, 3);

    if (shuffledRolesToAssign.length !== this.getConnectedPlayers().length) {
      throw new Error('lengths don\'t match!');
    }

    this.getConnectedPlayers().forEach((player, idx) => {
      const role = shuffledRolesToAssign[idx];
      player.setRole({ role, isOriginalRole: true });
    });
  }

  performWakeUpActions() {
    if (this.currentWakeUpIdx >= WerewolfGame.WAKE_UP_ORDER.length) {
      // We are done with nighttime! Let's transition to Daytime!
      if (this.numWakeUps === 0) {
        setTimeout(() => this.beginDaytime(), 10000);
      } else {
        this.beginDaytime();
      }
      return;
    }

    this.wakeUpRole = WerewolfGame.WAKE_UP_ORDER[this.currentWakeUpIdx];

    const wakeUpPlayers = this.getConnectedPlayers().filter(
      player => player.originalRole === this.wakeUpRole,
    );

    if (wakeUpPlayers.length === 0) {
      // No players with this role. Move on to the next one in the list.
      // We'll wait a random number of seconds (between 3 and 7) before moving on so people can't
      // infer what roles are claimed based on if, e.g. the first player to wake up had a
      // Troublemaker role.
      const delay = (Math.random() * 4000) + 3000;
      if (this.unclaimedRoles.includes(this.wakeUpRole)) {
        this.broadcastGameDataToPlayers();
        setTimeout(() => this.nextTurn(), delay);
      } else {
        // The role wasn't even part of our game. We can call nextTurn immediately.
        this.nextTurn();
      }
      return;
    }

    ++this.numWakeUps;

    this.broadcastGameDataToPlayers();

    if (this.wakeUpRole === Role.Drunk) {
      // This role is special in that it doesn't require any action from the player. Let's just
      // perform it for them to speed up the game.
      if (wakeUpPlayers.length !== 1) { throw new Error('Got more than one drunk'); }
      this.swapRoleWithUnclaimed(wakeUpPlayers[0].id);
    }
  }

  robRole(robberId, victimId) {
    const robber = this.players[robberId];
    this.switchRoles(robberId, victimId);
    robber.setLastKnownRole(robber.role);
    this.nextTurn();
  }

  swapRoleWithUnclaimed(playerId) {
    const player = this.players[playerId];
    const tmpRole = player.role;
    const shuffledUnclaimedRoles = _.shuffle(this.unclaimedRoles);
    player.setRole({ role: shuffledUnclaimedRoles[0], isOriginal: false });
    shuffledUnclaimedRoles[0] = tmpRole;
    this.unclaimedRoles = shuffledUnclaimedRoles;
    this.nextTurn();
  }

  switchRoles(player1Id, player2Id) {
    const player1 = this.players[player1Id];
    const player2 = this.players[player2Id];
    const tmpRole = player1.role;
    player1.setRole({ role: player2.role, isOriginal: false });
    player2.setRole({ role: tmpRole, isOriginal: false });
  }

  beginDaytime() {
    this.state = GameState.Daytime;
    // Automatically switch to voting after 5 minutes
    // start voting after 5 minutes
    this.votingTimeoutId = setTimeout(() => this.enableVoting(), 300000);
    this.broadcastGameDataToPlayers();
  }

  enableVoting() {
    if (this.state !== GameState.Daytime) {
      if (this.votingTimeoutId) {
        clearTimeout(this.votingTimeoutId);
        this.votingTimeoutId = null;
      }
      return;
    }

    this.state = GameState.Voting;
    this.broadcastGameDataToPlayers();
  }

  voteToEliminate(playerId, suspectId) {
    this.votes[playerId] = suspectId;
    this.broadcastGameDataToPlayers();

    if (Object.keys(this.votes).length === this.getConnectedPlayers().length) {
      // All votes are in! Time to reveal votes.
      setTimeout(() => this.determineWinners(), 1000);
    }
  }

  // votes = {
  //  'gordon': 'willy',
  //  'willy': 'steve',
  //  'yuriko': 'steve',
  //  'steve': 'gordon'
  // }
  determineWinners() {
    if (this.state !== GameState.Voting) { return; }

    this.state = GameState.VoteResults;

    // Tally up the votes!
    const voteList = Object.values(this.votes);
    const voteTallies = {};
    voteList.forEach((votedPlayerId: string) => {
      if (!voteTallies[votedPlayerId]) { voteTallies[votedPlayerId] = 0; }
      ++voteTallies[votedPlayerId];
    });
    let playerIdsWithMostVotes = [];
    let currMaxVoteCount: number = 0;
    Object.entries(voteTallies).forEach(([votedPlayerId, count]: [string, number]) => {
      if (count < currMaxVoteCount) { return; }
      if (count === currMaxVoteCount) {
        playerIdsWithMostVotes.push(votedPlayerId);
        return;
      } else {
        // new highest vote count
        playerIdsWithMostVotes = [votedPlayerId];
        currMaxVoteCount = count;
      }
    });

    // Figure out who's eliminated
    const playerList = this.getConnectedPlayers();
    let eliminatedPlayers;
    if (playerIdsWithMostVotes.length === playerList.length) {
      // If no one receives more than one vote, no one dies.
      eliminatedPlayers = []
    } else {
      eliminatedPlayers = playerIdsWithMostVotes.map(playerId => this.players[playerId]);
    }

    const hunterEliminated = !!eliminatedPlayers.find(
      player => player.role === Role.Hunter
    );
    if (hunterEliminated) {
      // If the hunter is eliminated, the person he voted for also dies
      const hunter = playerList.find(player => player.role === Role.Hunter);
      const hunterVictimPlayer = this.players[this.votes[hunter.id]];
      if (!eliminatedPlayers.includes(hunterVictimPlayer)) {
        eliminatedPlayers.push(hunterVictimPlayer);
      }
    }

    const werewolfEliminated = !!eliminatedPlayers.find(
      player => player.role === Role.Werewolf
    );
    const tannerEliminated = !!eliminatedPlayers.find(
      player => player.role === Role.Tanner
    );

    // Figure out who's the winner
    const winners = [];
    let firstWinner; // villager or werewolf
    const atLeastOneWerewolf = !!playerList.find(
      player => player.role === Role.Werewolf
    );

    if (eliminatedPlayers.length === 0) {
      if (atLeastOneWerewolf) {
        firstWinner = Role.Werewolf;
      } else {
        firstWinner = Role.Villager;
      }
    } else {
      // At least one person was eliminated
      if (werewolfEliminated) {
        firstWinner = Role.Villager;
      } else if (!tannerEliminated) {
        firstWinner = Role.Werewolf;
      }
    }

    if (firstWinner !== undefined) { winners.push(firstWinner); }

    if (tannerEliminated) { winners.push(Role.Tanner); }

    this.winners = winners;
    this.eliminatedPlayers = eliminatedPlayers;
    this.broadcastGameDataToPlayers();
  }

  revealRoles() {
    if (this.state !== GameState.VoteResults) { return; }
    this.revealingRoles = true;
    this.broadcastGameDataToPlayers();
  }

  serialize() {
    const activePlayers = this.getConnectedPlayers();
    const activePlayersToSend = {};
    activePlayers.forEach(player => {
      activePlayersToSend[player.id] = player;
    });

    return {
      eliminatedPlayerIds: this.eliminatedPlayers?.map(player => player.id),
      ensureWerewolf: this.ensureWerewolf,
      gameId: WerewolfGame.GAME_ID,
      players: activePlayersToSend,
      roleIds: this.roleIds,
      revealingRoles: this.revealingRoles,
      spectators: this.spectators,
      state: this.state,
      unclaimedRoles: this.unclaimedRoles,
      votes: this.votes,
      wakeUpRole: this.wakeUpRole,
      winners: this.winners,
    }
  }
}

export default WerewolfGame;
