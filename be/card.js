function Card(id, type) {
  this.id = id;
  this.type = type;
  this.getLabel = () => {
    switch (this.type) {
      case Card.GUARD:
        return 'Guard';
      case Card.PRIEST:
        return 'Priest';
      case Card.BARON:
        return 'Baron';
      case Card.HANDMAID:
        return 'Handmaid';
      case Card.PRINCE:
        return 'Prince';
      case Card.KING:
        return 'King';
      case Card.COUNTESS:
        return 'Countess';
      case Card.PRINCESS:
        return 'Princess';
      default:
        throw 'Unknown card';
    };
  };

  this.getNumber = () => {
    // This is the user-facing number on the card
    switch (this.type) {
      case Card.GUARD:
        return 1;
      case Card.PRIEST:
        return 2;
      case Card.BARON:
        return 3;
      case Card.HANDMAID:
        return 4;
      case Card.PRINCE:
        return 5;
      case Card.KING:
        return 6;
      case Card.COUNTESS:
        return 7;
      case Card.PRINCESS:
        return 8;
      default:
        throw 'Unknown card';
    };
  };
}

Card.prototype.GUARD = 0;
Card.prototype.PRIEST = 1;
Card.prototype.BARON = 2;
Card.prototype.HANDMAID = 3;
Card.prototype.PRINCE = 4;
Card.prototype.KING = 5;
Card.prototype.COUNTESS = 6;
Card.prototype.PRINCESS = 7;

module.exports = Card;
