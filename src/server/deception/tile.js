class Tile {
  static TYPE_CAUSE_OF_DEATH = 0;
  static TYPE_LOCATION = 1;
  static TYPE_SCENE = 2;

  // Each tile has six options
  constructor({ id, label, options, type }) {
    this.id = id;
    this.label = label;
    this.options = options;
    this.type = type;
  }

  selectOption(option) {
    if (!this.options.includes(option)) {
      raise 'Tried to select non-existent option';
    }

    this.selectedOption = option;
  }
}

module.exports = Tile;
