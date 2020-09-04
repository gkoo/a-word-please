class Clue {
  static TYPE_MURDER_METHOD = 0;
  static TYPE_KEY_EVIDENCE = 1;

  constructor(label, id, type) {
    this.id = id;
    this.label = label;
    this.type = type;
  }
}

module.exports = Clue;
