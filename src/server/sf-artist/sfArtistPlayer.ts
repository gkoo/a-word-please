import Player from '../player';

class SfArtistPlayer extends Player {
  brushColor: string;

  setBrushColor(color: string) {
    this.brushColor = color;
  }

  serialize() {
    return {
      ...super.serialize(),
      brushColor: this.brushColor,
    }
  }
}

export default SfArtistPlayer;
