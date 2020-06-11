const Game = require('../game');
const WerewolfPlayer = require('./werewolfPlayer');

class WerewolfGame extends Game {
  static GAME_ID = Game.GAME_WEREWOLF;
  static STATE_CHOOSING_ROLES = 3;
  static STATE_NIGHTTIME = 4;
  static STATE_DAYTIME = 5;

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
    ROLE_DOPPELGANGER,
    ROLE_SEER,
    ROLE_ROBBER,
    ROLE_TROUBLEMAKER,
    ROLE_DRUNK,
    ROLE_INSOMNIAC,
  ];

  static ROLE_ID_TO_ENUM = {
    werewolf: ROLE_WEREWOLF,
    minion: ROLE_MINION,
    mason: ROLE_MASON,
    seer: ROLE_SEER,
    robber: ROLE_ROBBER,
    troublemaker: ROLE_TROUBLEMAKER,
    drunk: ROLE_DRUNK,
    insomniac: ROLE_INSOMNIAC,
    hunter: ROLE_HUNTER,
    villager: ROLE_VILLAGER,
    doppelganger: ROLE_DOPPELGANGER,
    tanner: ROLE_TANNER,
  };

  constructor(io, roomCode) {
    super(io, roomCode);
    this.roleIds = {}; // to sync client views
    this.roles = {}; // for actual game logic
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
    switch (data.action) {
      case 'toggleRoleSelection':
        return this.toggleRole(data);
      case 'beginNighttime':
        return this.beginNighttime();
      case 'switchRoles':
        if (this.players[playerId].originalRole === ROLE_TROUBLEMAKER) {
          this.switchRoles(data.playerIds);
        }
        return;
      case 'endTurn':
        return this.nextTurn();
      default:
        throw new Error(`Unexpected action ${data.action}`);
    }
  }

  nextTurn() {
    ++this.currentWakeUpIdx;
    this.performWakeUpActions();
  }

  toggleRole({ roleId, selected }) {
    this.roleIds[roleId] = selected;
    this.broadcastGameDataToPlayers();
  }

  beginNighttime() {
    const selectedRoleIds = Object.keys(this.roleIds).filter(roleId => !!this.roleIds[roleId]);
    const shuffledRoleIds = _.shuffle(selectedRoleIds);
    const shuffledRoles = shuffledRoleIds.map(roleId => WerewolfGame.ROLE_ID_TO_ENUM[roleId]);

    if (shuffledRoles.length !== Object.keys(this.players).length + 3) { return; }

    // assign roles
    Object.values(this.players).forEach((player, idx) => {
      const role = shuffledRoles[idx];
      player.setRole({ role, isOriginalRole: true });
    });

    this.unclaimedRoles = shuffledRoles.slice(shuffledRoles.length - 3);

    // traverse through each role's wakeup actions
    this.currentWakeUpIdx = 0;
    this.performWakeUpActions();
  }

  performWakeUpActions() {
    if (this.currentWakeUpIdx >= WerewolfGame.WAKE_UP_ORDER.length) {
      this.state = STATE_DAYTIME;
      this.broadcastGameDataToPlayers();
      return;
    }

    this.wakeUpRole = WerewolfGame.WAKE_UP_ORDER[this.currentWakeUpIdx];

    const wakeUpPlayers = Object.values(this.players).filter(
      player => player.role === wakeUpRole,
    );

    if (wakeUpPlayers.length === 0) {
      // No players with this role. Move on to the next one in the list.
      return this.nextTurn();
    }

    this.broadcastGameDataToPlayers();
  }

  switchRoles(playerIds) {
    const players = playerIds.map(playerId => this.players[playerId]);
    const tmpRole = players[0].role;
    players[0].role = players[1].role;
    players[1].role = tmpRole;
    this.endTurn();
  }

  endGame() {
  }

  setPending() {
  }

  serialize() {
    return {
      gameId: WerewolfGame.GAME_ID,
      roleIds: Object.keys(this.roleIds).filter(id => !!this.roleIds[id]),
      players: this.players,
      state: this.state,
      unclaimedRoles: this.unclaimedRoles,
      wakeUpRole: this.wakeUpRole,
    }
  }
}

module.exports = WerewolfGame;
