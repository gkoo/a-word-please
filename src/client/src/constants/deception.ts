export enum GameState {
  Pending,
  TurnEnd,
  GameEnd,
  ExplainRules,
  ShowRoles,
  ChooseMeansEvidence,
  Witnessing,
  ScientistCauseOfDeath,
  ScientistLocation,
  ScientistSceneTiles,
  Deliberation,
  ReplaceScene,
};

export enum Role {
  Scientist = 1,
  Murderer,
  Investigator,
  Accomplice,
  Witness,
}

export const TILE_DECEPTION_CAUSE_OF_DEATH = 0;
export const TILE_DECEPTION_LOCATION = 1;
export const TILE_DECEPTION_SCENE = 2;

export const RoleLabels = {
  [Role.Scientist]: 'Forensic Scientist',
  [Role.Murderer]: 'Murderer',
  [Role.Investigator]: 'Investigator',
  [Role.Witness]: 'Witness',
  [Role.Accomplice]: 'Accomplice',
};
