// Werewolf
export const STATE_WW_CHOOSING_ROLES = 3;
export const STATE_WW_NIGHTTIME = 4;
export const STATE_WW_DAYTIME = 5;
export const STATE_WW_VOTING = 6;
export const STATE_WW_VOTE_RESULTS = 7;

export const ROLE_WEREWOLF = 0;
export const ROLE_MINION = 1;
export const ROLE_MASON = 2;
export const ROLE_SEER = 3;
export const ROLE_ROBBER = 4;
export const ROLE_TROUBLEMAKER = 5;
export const ROLE_DRUNK = 6;
export const ROLE_INSOMNIAC = 7;
export const ROLE_HUNTER = 8;
export const ROLE_VILLAGER = 9;
export const ROLE_DOPPELGANGER = 10;
export const ROLE_TANNER = 11;

export const WEREWOLF_CARD_IDS = {
  'werewolf1': ROLE_WEREWOLF,
  'werewolf2': ROLE_WEREWOLF,
  'werewolf3': ROLE_WEREWOLF,
  'minion': ROLE_MINION,
  'tanner': ROLE_TANNER,
  'mason1': ROLE_MASON,
  'mason2': ROLE_MASON,
  'seer': ROLE_SEER,
  'robber': ROLE_ROBBER,
  'troublemaker': ROLE_TROUBLEMAKER,
  'drunk': ROLE_DRUNK,
  'insomniac': ROLE_INSOMNIAC,
  'hunter': ROLE_HUNTER,
  'doppelganger': ROLE_DOPPELGANGER,
  'villager1': ROLE_VILLAGER,
  'villager2': ROLE_VILLAGER,
  'villager3': ROLE_VILLAGER,
};

export const WEREWOLF_ROLE_LABELS = {
  [ROLE_WEREWOLF]: 'Werepig',
  [ROLE_MINION]: 'Minion',
  [ROLE_MASON]: 'Mason',
  [ROLE_SEER]: 'Seer',
  [ROLE_ROBBER]: 'Robber',
  [ROLE_TROUBLEMAKER]: 'Troublemaker',
  [ROLE_DRUNK]: 'Drunk',
  [ROLE_INSOMNIAC]: 'Insomniac',
  [ROLE_HUNTER]: 'Hunter',
  [ROLE_VILLAGER]: 'Villager',
  [ROLE_DOPPELGANGER]: 'Doppelganger',
  [ROLE_TANNER]: 'Tanner',
};
