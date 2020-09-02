export const env = process.env.NODE_ENV;
export const routePrefix = '';

export const SITE_TITLE = 'Koo Fitness Club';
export const API_BASE_URL = env === 'production' ? '' : 'http://localhost:5000';

export const GAME_A_WORD_PLEASE = 1;
export const GAME_WEREWOLF = 2;
export const GAME_WAVELENGTH = 3;
export const GAME_DECEPTION = 4;

export const GAME_STATE_PENDING = 0;
export const GAME_STATE_TURN_END = 1;
export const GAME_STATE_GAME_END = 2;

export const ROOM_STATE_LOBBY = 1;
export const ROOM_STATE_GAME = 2;

// A Word, Please?
export const STATE_AWP_ENTERING_CLUES = 3;
export const STATE_AWP_REVIEWING_CLUES = 4;
export const STATE_AWP_ENTERING_GUESS = 5;

// Wavelength
export const STATE_WAVELENGTH_CLUE_PHASE = 3;
export const STATE_WAVELENGTH_GUESS_PHASE = 4;
export const STATE_WAVELENGTH_REVEAL_PHASE = 5;
export const STATE_WAVELENGTH_GAME_END_PHASE = 6;

export const SPECTRUM_MAX_VALUE = 200;
export const SPECTRUM_BAND_WIDTH = 12;

// Deception
export const STATE_DECEPTION_EXPLAIN_RULES = 3;
export const STATE_DECEPTION_SHOW_ROLES = 4;
export const STATE_DECEPTION_CHOOSE_MEANS_EVIDENCE = 5;
export const STATE_DECEPTION_WITNESSING = 6;
export const STATE_DECEPTION_SCIENTIST_CAUSE_OF_DEATH = 7;
export const STATE_DECEPTION_SCIENTIST_LOCATION = 8;
export const STATE_DECEPTION_SCIENTIST_SCENE_TILES = 9;
export const STATE_DECEPTION_DELIBERATION = 10;
export const STATE_DECEPTION_REPLACE_SCENE = 11;

export const ROLE_SCIENTIST = 1;
export const ROLE_MURDERER = 2;
export const ROLE_INVESTIGATOR = 3;
export const ROLE_ACCOMPLICE = 4;
export const ROLE_WITNESS = 5;

export const TILE_DECEPTION_CAUSE_OF_DEATH = 0;
export const TILE_DECEPTION_LOCATION = 1;
export const TILE_DECEPTION_SCENE = 2;

export const DECEPTION_ROLE_LABELS = {
  [ROLE_SCIENTIST]: 'Forensic Scientist',
  [ROLE_MURDERER]: 'Murderer',
  [ROLE_INVESTIGATOR]: 'Investigator',
  [ROLE_WITNESS]: 'Witness',
  [ROLE_ACCOMPLICE]: 'Accomplice',
};

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

export const WEREWOLF_ROLE_LABELS = {
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

export const sessionsPrefix = `${routePrefix}/gkoo`;
