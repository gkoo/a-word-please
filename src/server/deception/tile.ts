export enum TileType {
  CauseOfDeath,
  Location,
  Scene,
  Event,
}

export default class Tile {
  id: number;
  selectedOption: string;
  options: Array<string>;
  label: string;
  type: TileType;

  // Each tile has six options
  constructor({ id, label, options, type, }) {
    this.id = id;
    this.label = label;
    this.options = options;
    this.type = type;
  }

  selectOption(option) {
    if (!this.options.includes(option)) {
      throw 'Tried to select non-existent option';
    }

    this.selectedOption = option;
  }
}
