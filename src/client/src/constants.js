export const env = process.env.NODE_ENV;
export const routePrefix = '';

export const SITE_TITLE = 'Koo Fitness Club';
export const API_BASE_URL = env === 'production' ? '' : 'http://localhost:5000';

export const GAME_A_WORD_PLEASE = 1;
export const GAME_WEREWOLF = 2;
export const GAME_WAVELENGTH = 3;
export const GAME_DECEPTION = 4;
export const GAME_SF_ARTIST = 5;

export const GAME_LABELS = {
  [GAME_A_WORD_PLEASE]: 'A Word, Please?',
  [GAME_WEREWOLF]: 'Werepig',
  [GAME_WAVELENGTH]: 'Waveform',
  [GAME_DECEPTION]: 'Deceit: Homicide in Washington, D.C.',
  [GAME_SF_ARTIST]: 'A Fake Artist Goes To San Francisco',
};

export const GAME_SHORT_LABELS = {
  [GAME_A_WORD_PLEASE]: 'A Word, Please?',
  [GAME_WEREWOLF]: 'Werepig',
  [GAME_WAVELENGTH]: 'Waveform',
  [GAME_DECEPTION]: 'Deceit',
  [GAME_SF_ARTIST]: 'A Fake Artist',
};

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
export const STATE_WAVELENGTH_EXPLAIN_RULES = 3;
export const STATE_WAVELENGTH_CLUE_PHASE = 4;
export const STATE_WAVELENGTH_GUESS_PHASE = 5;
export const STATE_WAVELENGTH_REVEAL_PHASE = 6;

export const SPECTRUM_MAX_VALUE = 200;
export const SPECTRUM_BAND_WIDTH = 12;

export const sessionsPrefix = `${routePrefix}/gkoo`;
