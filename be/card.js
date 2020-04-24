const { cards } = require('./constants');

function Card({ id, type }) {
  this.id = id;
  this.type = type;

  this.getLabel = () => {
    switch (this.type) {
      case cards.GUARD:
        return 'Guard';
      case cards.PRIEST:
        return 'Priest';
      case cards.BARON:
        return 'Baron';
      case cards.HANDMAID:
        return 'Handmaid';
      case cards.PRINCE:
        return 'Prince';
      case cards.KING:
        return 'King';
      case cards.COUNTESS:
        return 'Countess';
      case cards.PRINCESS:
        return 'Princess';
      default:
        throw 'Unknown card';
    };
  };

  this.getNumber = () => {
    // This is the user-facing number on the card
    switch (this.type) {
      case cards.GUARD:
        return 1;
      case cards.PRIEST:
        return 2;
      case cards.BARON:
        return 3;
      case cards.HANDMAID:
        return 4;
      case cards.PRINCE:
        return 5;
      case cards.KING:
        return 6;
      case cards.COUNTESS:
        return 7;
      case cards.PRINCESS:
        return 8;
      default:
        throw 'Unknown card';
    };
  };
}

module.exports = Card;
