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
    this.roleIds = {}; // to sync client views
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
    this.state = WerewolfGame.STATE_CHOOSING_ROLES;
    this.broadcastGameDataToPlayers();
  }

  addPlayer(user) {
    const { id, name } = user;

    if (!name) { return; }

    this.players[user.id] = new WerewolfPlayer({
      id,
      name,
    });
  }

  // TODO: handle reconnecting players
  removePlayer(id) {
    if (this.players[id]) { this.players[id].connected = false; }

    this.broadcastGameDataToPlayers();
  }

  handlePlayerAction(playerId, data) {
    const currPlayer = this.players[playerId];
    switch (data.action) {
      case 'toggleRoleSelection':
        return this.toggleRole(data);
      case 'beginNighttime':
        return this.beginNighttime();
      case 'troublemakeRoles':
        if (currPlayer.originalRole === WerewolfGame.ROLE_TROUBLEMAKER) {
          this.switchRoles.apply(this, data.playerIds);
        }
        return;
      case 'robRole':
        if (currPlayer.originalRole === WerewolfGame.ROLE_ROBBER) {
          this.robRole(playerId, data.playerId);
        }
        return;
      case 'swapRoleWithUnclaimed':
        if (currPlayer.originalRole === WerewolfGame.ROLE_DRUNK) {
          this.swapRoleWithUnclaimed(playerId);
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

  nextTurn() {
    // TODO: check for two insomniacs (due to Doppelganger)
    ++this.currentWakeUpIdx;
    this.performWakeUpActions();
  }

  toggleRole({ roleId, selected }) {
    this.roleIds[roleId] = selected;
    this.broadcastGameDataToPlayers();
  }

  beginNighttime() {
    // Assign roles
    const selectedRoleIds = Object.keys(this.roleIds).filter(roleId => !!this.roleIds[roleId]);
    const shuffledRoleIds = _.shuffle(selectedRoleIds);
    const shuffledRoles = shuffledRoleIds.map(roleId => {
      const formattedRoleId = roleId.replace(/[^a-z]/, '');
      return WerewolfGame.ROLE_ID_TO_ENUM[formattedRoleId];
    });

    if (shuffledRoles.length !== Object.keys(this.players).length + 3) { return; }

    Object.values(this.players).forEach((player, idx) => {
      const role = shuffledRoles[idx];
      player.setRole({ role, isOriginalRole: true });
    });

    this.state = WerewolfGame.STATE_NIGHTTIME;

    this.unclaimedRoles = shuffledRoles.slice(shuffledRoles.length - 3);

    // Let's broadcast now because we don't know if we're going to artificially delay the first
    // turn.
    this.broadcastGameDataToPlayers();

    // traverse through each role's wakeup actions
    this.currentWakeUpIdx = 0;
    this.performWakeUpActions();
  }

  performWakeUpActions() {
    if (this.currentWakeUpIdx >= WerewolfGame.WAKE_UP_ORDER.length) {
      this.beginDaytime();
      return;
    }

    this.wakeUpRole = WerewolfGame.WAKE_UP_ORDER[this.currentWakeUpIdx];

    const wakeUpPlayers = Object.values(this.players).filter(
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
    this.nextTurn();
  }

  beginDaytime() {
    this.state = WerewolfGame.STATE_DAYTIME;
    // Automatically switch to voting after 5 minutes
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

    if (Object.keys(this.votes).length === Object.keys(this.players).length) {
      // All votes are in! Time to reveal votes.
      setTimeout(() => this.revealVotes(), 1000);
    }
  }

  revealVotes() {
    this.state = WerewolfGame.STATE_VOTE_RESULTS;
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
    return {
      gameId: WerewolfGame.GAME_ID,
      players: this.players,
      roleIds: Object.keys(this.roleIds).filter(id => !!this.roleIds[id]),
      revealingRoles: this.revealingRoles,
      state: this.state,
      unclaimedRoles: this.unclaimedRoles,
      votes: this.votes,
      wakeUpRole: this.wakeUpRole,
    }
  }
}

module.exports = WerewolfGame;
