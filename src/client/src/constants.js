export const env = process.env.NODE_ENV;
export const routePrefix = '/a-word-please';

export const GAME_A_WORD_PLEASE = 1;
export const GAME_WEREWOLF = 2;

export const STATE_PENDING = 0;
export const STATE_TURN_END = 1;
export const STATE_GAME_END = 2;

export const STATE_AWP_ENTERING_CLUES = 3;
export const STATE_AWP_REVIEWING_CLUES = 4;
export const STATE_AWP_ENTERING_GUESS = 5;

export const STATE_WW_CHOOSING_ROLES = 3;
export const STATE_WW_NIGHTTIME_ACTIONS = 4;
export const STATE_WW_DAYTIME_ACTIONS = 5;
export const STATE_WW_VOTING = 6;
