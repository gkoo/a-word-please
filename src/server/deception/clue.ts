export enum ClueType {
  MurderMethod,
  KeyEvidence,
}

export default class Clue {
  id: string;
  label: string;
  type: ClueType;

  constructor(label, id, type) {
    this.id = id;
    this.label = label;
    this.type = type;
  }
}
