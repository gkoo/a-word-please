import { GAME_WEREWOLF } from '../constants';
import * as constants from '../constants/werewolf';

const roleToTest = constants.ROLE_MINION;

export default {
  eliminatedPlayerIds: ['gordon'],
  wakeUpRole: constants.ROLE_ROBBER,
  gameId: GAME_WEREWOLF,
  players: {
    gordon: {
      id: 'gordon',
      name: 'Gordon',
      isLeader: true,
      color: 'indigo',
      originalRole: roleToTest,
      lastKnownRole: roleToTest,
      role: roleToTest,
    },
    yuriko: {
      id: 'yuriko',
      name: 'Yuriko',
      color: 'indigo',
      originalRole: constants.ROLE_MASON,
      lastKnownRole: constants.ROLE_MASON,
      role: constants.ROLE_MASON,
    },
    aj: {
      id: 'aj',
      name: 'AJ',
      color: 'indigo',
      originalRole: constants.ROLE_SEER,
      lastKnownRole: constants.ROLE_SEER,
      role: constants.ROLE_SEER,
    },
    willy: {
      id: 'willy',
      name: 'Willy',
      color: 'indigo',
      originalRole: constants.ROLE_ROBBER,
      lastKnownRole: constants.ROLE_ROBBER,
      role: constants.ROLE_ROBBER,
    },
    rishi: {
      id: 'rishi',
      name: 'Rishi',
      color: 'indigo',
      originalRole: constants.ROLE_VILLAGER,
      lastKnownRole: constants.ROLE_VILLAGER,
      role: constants.ROLE_VILLAGER,
    },
  },
  revealingRoles: true,
  roleIds: [
    'werewolf1',
    'werewolf2',
    'villager2',
    'villager1',
    'hunter',
    'seer',
    'doppelganger',
    'robber',
    'tanner',
  ],
  state: constants.STATE_WW_CHOOSING_ROLES,
  //state: constants.STATE_WW_NIGHTTIME,
  //state: constants.STATE_WW_DAYTIME,
  //state: constants.STATE_WW_VOTING,
  //state: constants.STATE_WW_VOTE_RESULTS,
  unclaimedRoles: [constants.ROLE_WEREWOLF, constants.ROLE_DRUNK, constants.ROLE_DOPPELGANGER],
  votes: {
    'gordon': 'willy',
    'yuriko': 'yuriko',
    'aj': 'yuriko',
    'willy': 'gordon',
    'rishi': 'willy',
  },
  winners: [constants.ROLE_WEREWOLF],
};
