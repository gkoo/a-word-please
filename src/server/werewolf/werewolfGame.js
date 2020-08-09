const _ = require('lodash');
const Game = require('../game');
const WerewolfPlayer = require('./werewolfPlayer');

class WerewolfGame extends Game {
  static GAME_ID = Game.GAME_WEREWOLF;
  static STATE_CHOOSING_ROLES = 3;
  static STATE_NIGHTTIME = 4;
  static STATE_DAYTIME = 5;
  static STATE_VOTING = 6;
  static STATE_VOTE_RESULTS = 7;

  static ROLE_WEREWOLF = 0;
  static ROLE_MINION = 1;
  static ROLE_MASON = 2;
  static ROLE_SEER = 3;
  static ROLE_ROBBER = 4;
  static ROLE_TROUBLEMAKER = 5;
  static ROLE_DRUNK = 6;
  static ROLE_INSOMNIAC = 7;
  static ROLE_HUNTER = 8;
  static ROLE_VILLAGER = 9;
  static ROLE_DOPPELGANGER = 10;
  static ROLE_TANNER = 11;

  static MIN_PLAYERS = 3;
  static MAX_PLAYERS = 10;

  static WAKE_UP_ORDER = [
    WerewolfGame.ROLE_DOPPELGANGER,
    WerewolfGame.ROLE_WEREWOLF,
    WerewolfGame.ROLE_MINION,
    WerewolfGame.ROLE_MASON,
    WerewolfGame.ROLE_SEER,
    WerewolfGame.ROLE_ROBBER,
    WerewolfGame.ROLE_TROUBLEMAKER,
    WerewolfGame.ROLE_DRUNK,
    WerewolfGame.ROLE_INSOMNIAC,
  ];

  static ROLE_ID_TO_ENUM = {
    werewolf: WerewolfGame.ROLE_WEREWOLF,
    minion: WerewolfGame.ROLE_MINION,
    mason: WerewolfGame.ROLE_MASON,
    seer: WerewolfGame.ROLE_SEER,
    robber: WerewolfGame.ROLE_ROBBER,
    troublemaker: WerewolfGame.ROLE_TROUBLEMAKER,
    drunk: WerewolfGame.ROLE_DRUNK,
    insomniac: WerewolfGame.ROLE_INSOMNIAC,
    hunter: WerewolfGame.ROLE_HUNTER,
    villager: WerewolfGame.ROLE_VILLAGER,
    doppelganger: WerewolfGame.ROLE_DOPPELGANGER,
    tanner: WerewolfGame.ROLE_TANNER,
  };

  constructor(io, roomCode) {
    super(io, roomCode);
    this.ensureWerewolf = false;
    this.roleIds = []; // to sync client views
    this.roles = {}; // for actual game logic
    this.votes = {};
    this.unclaimedRoles = [];
    this.revealingRoles = false;
  }

  setup(users) {
    super.setup(users);
    this.newGame();
  }

  newGame() {
    this.eliminatedPlayerIds = null;
    this.numWakeUps = 0;
    this.roles = {};
    this.votes = {}
    this.unclaimedRoles = [];
    this.revealingRoles = false;
    this.state = WerewolfGame.STATE_CHOOSING_ROLES;
    this.winners = [];
    Object.values(this.players).forEach(player => player.setPlaying());

    this.broadcastGameDataToPlayers();
  }

  addPlayer(user) {
    const { id, name } = user;

    if (!name) { return; }


    const disconnectedPlayer = Object.values(this.players).find(player => !player.connected);

    if (!disconnectedPlayer) {
      const newPlayer = new WerewolfPlayer({
        id,
        name,
      });
      this.players[id] = newPlayer;
      if (this.state === WerewolfGame.STATE_CHOOSING_ROLES) {
        newPlayer.setPlaying();
      }
      return;
    }

    // Reconnect player
    const oldPlayerId = disconnectedPlayer.id;
    disconnectedPlayer.name = name;
    disconnectedPlayer.id = id;
    disconnectedPlayer.connected = true;
    this.players[id] = disconnectedPlayer;
    delete this.players[oldPlayerId];
  }

  // TODO: handle reconnecting players
  removePlayer(id) {
    if (this.players[id]) { this.players[id].connected = false; }

    this.broadcastGameDataToPlayers();
  }

  getActivePlayers() {
    return Object.values(this.players).filter(player => player.connected && player.playing);
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
        if (currPlayer.originalRole === WerewolfGame.ROLE_TROUBLEMAKER) {
          this.switchRoles.apply(this, data.playerIds);
          this.nextTurn();
        }
        return;
      case 'robRole':
        if (currPlayer.originalRole === WerewolfGame.ROLE_ROBBER) {
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
    const numPlayersToWaitFor = Object.values(this.players).filter(
      player => player.role === WerewolfGame.ROLE_WEREWOLF
    );
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
    console.log('next turn');
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

    this.state = WerewolfGame.STATE_NIGHTTIME;

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

    if (this.ensureWerewolf && rolesToUse.includes(WerewolfGame.ROLE_WEREWOLF)) {
      // Need to guarantee at least one player is a werewolf.
      const werewolfIdx = rolesToUse.indexOf(WerewolfGame.ROLE_WEREWOLF);
      const rolesToShuffle = rolesToUse.slice(0, werewolfIdx).concat(
        rolesToUse.slice(werewolfIdx + 1)
      );
      shuffledRoles = _.shuffle(rolesToShuffle);
      shuffledRolesToAssign = _.shuffle(shuffledRoles.slice(3).concat([WerewolfGame.ROLE_WEREWOLF]));
    } else {
      shuffledRoles = _.shuffle(rolesToUse);
      shuffledRolesToAssign = shuffledRoles.slice(3);
    }

    this.unclaimedRoles = shuffledRoles.slice(0, 3);

    if (shuffledRolesToAssign.length !== this.getActivePlayers().length) {
      throw new Error('lengths don\'t match!');
    }

    this.getActivePlayers().forEach((player, idx) => {
      const role = shuffledRolesToAssign[idx];
      console.log(`assigning role ${role} to player`);
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

    const wakeUpPlayers = this.getActivePlayers().filter(
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

    if (this.wakeUpRole === WerewolfGame.ROLE_DRUNK) {
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
    this.state = WerewolfGame.STATE_DAYTIME;
    // Automatically switch to voting after 5 minutes
    // start voting after 5 minutes
    this.votingTimeoutId = setTimeout(() => this.enableVoting(), 300000);
    this.broadcastGameDataToPlayers();
  }

  enableVoting() {
    if (this.state !== WerewolfGame.STATE_DAYTIME) {
      if (this.votingTimeoutId) {
        clearTimeout(this.votingTimeoutId);
        this.votingTimeoutId = null;
      }
      return;
    }

    this.state = WerewolfGame.STATE_VOTING;
    this.broadcastGameDataToPlayers();
  }

  voteToEliminate(playerId, suspectId) {
    this.votes[playerId] = suspectId;
    this.broadcastGameDataToPlayers();

    if (Object.keys(this.votes).length === this.getActivePlayers().length) {
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
    if (this.state !== WerewolfGame.STATE_VOTING) { return; }

    this.state = WerewolfGame.STATE_VOTE_RESULTS;

    // Tally up the votes!
    const voteList = Object.values(this.votes);
    const voteTallies = {};
    voteList.forEach(votedPlayerId => {
      if (!voteTallies[votedPlayerId]) { voteTallies[votedPlayerId] = 0; }
      ++voteTallies[votedPlayerId];
    });
    let playerIdsWithMostVotes = [];
    let currMaxVoteCount = 0;
    Object.entries(voteTallies).forEach(([votedPlayerId, count]) => {
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
    const playerList = this.getActivePlayers();
    let eliminatedPlayers;
    if (playerIdsWithMostVotes.length === playerList.length) {
      // If no one receives more than one vote, no one dies.
      eliminatedPlayers = []
    } else {
      eliminatedPlayers = playerIdsWithMostVotes.map(playerId => this.players[playerId]);
    }

    const hunterEliminated = !!eliminatedPlayers.find(
      player => player.role === WerewolfGame.ROLE_HUNTER
    );
    if (hunterEliminated) {
      // If the hunter is eliminated, the person he voted for also dies
      const hunter = playerList.find(player => player.role === WerewolfGame.ROLE_HUNTER);
      const hunterVictimPlayer = this.players[this.votes[hunter.id]];
      if (!eliminatedPlayers.includes(hunterVictimPlayer)) {
        eliminatedPlayers.push(hunterVictimPlayer);
      }
    }

    const werewolfEliminated = !!eliminatedPlayers.find(
      player => player.role === WerewolfGame.ROLE_WEREWOLF
    );
    const tannerEliminated = !!eliminatedPlayers.find(
      player => player.role === WerewolfGame.ROLE_TANNER
    );

    // Figure out who's the winner
    const winners = [];
    let firstWinner; // villager or werewolf
    const atLeastOneWerewolf = !!playerList.find(
      player => player.role === WerewolfGame.ROLE_WEREWOLF
    );

    if (eliminatedPlayers.length === 0) {
      if (atLeastOneWerewolf) {
        firstWinner = WerewolfGame.ROLE_WEREWOLF;
      } else {
        firstWinner = WerewolfGame.ROLE_VILLAGER;
      }
    } else {
      // At least one person was eliminated
      if (werewolfEliminated) {
        firstWinner = WerewolfGame.ROLE_VILLAGER;
      } else if (!tannerEliminated) {
        firstWinner = WerewolfGame.ROLE_WEREWOLF;
      }
    }

    if (firstWinner !== undefined) { winners.push(firstWinner); }

    if (tannerEliminated) { winners.push(WerewolfGame.ROLE_TANNER); }

    this.winners = winners;
    this.eliminatedPlayers = eliminatedPlayers;
    this.broadcastGameDataToPlayers();
  }

  revealRoles() {
    if (this.state !== WerewolfGame.STATE_VOTE_RESULTS) { return; }
    this.revealingRoles = true;
    this.broadcastGameDataToPlayers();
  }

  endGame() {
  }

  setPending() {
  }

  serialize() {
    const activePlayers = this.getActivePlayers();
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
      state: this.state,
      unclaimedRoles: this.unclaimedRoles,
      votes: this.votes,
      wakeUpRole: this.wakeUpRole,
      winners: this.winners,
    }
  }
}

module.exports = WerewolfGame;
