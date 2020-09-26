import Game, { GameEnum } from '../game';

class SfArtistGame extends Game {
  setup(users) {
    super.setup(users);
    this.newGame();
  }

  newGame() {
    this.broadcastGameDataToPlayers();
  }

  handlePlayerAction(playerId: string, data: { [key: string]: any }) {
  }

  nextTurn() {
  }

  serialize() {
    return {
      gameId: GameEnum.SfArtist,
    };
  }
}

export default SfArtistGame;
