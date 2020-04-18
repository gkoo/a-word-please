function Game() {
  this.setup = () => {
    this.state = 'STARTED';
    return this.serialize();
  };

  this.end = () => {
    this.state = 'ENDED';
  };

  this.serialize = () => {
    const { state } = this;
    return {
      state,
    }
  };
}

module.exports = Game;
