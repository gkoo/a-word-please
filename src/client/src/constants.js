export const env = process.env.NODE_ENV;
export const routePrefix = '/a-word-please';

export const GAME_A_WORD_PLEASE = 1;
export const GAME_WEREWOLF = 2;

export const GAME_STATE_PENDING = 0;
export const GAME_STATE_TURN_END = 1;
export const GAME_STATE_GAME_END = 2;

export const ROOM_STATE_LOBBY = 1;
export const ROOM_STATE_GAME = 2;

export const STATE_AWP_ENTERING_CLUES = 3;
export const STATE_AWP_REVIEWING_CLUES = 4;
export const STATE_AWP_ENTERING_GUESS = 5;

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

export const LABELS = {
  [ROLE_WEREWOLF]: 'Werewolf',
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
