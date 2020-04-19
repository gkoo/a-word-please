import React from 'react';

import Card from './Card';

function PlayerView({ player, active }) {
  return (
    <div>
      <h3>{player.name}{active && '*'}</h3>
      {
        player.discardPile && player.discardPile.map(
          discardCard => <Card card={discardCard} isDiscard={true}/>
        )
      }
      {
        player.hand && player.hand.map(
          card => <Card card={card}/>
        )
      }
    </div>
  );
}

export default PlayerView;
