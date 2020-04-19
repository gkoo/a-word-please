import React from 'react';
import { useSelector } from 'react-redux';

import Card from './Card';
import { socketSelector } from '../store/selectors';

function PlayerView({ player, active }) {
  const socket = useSelector(socketSelector);

  const handleClick = (card) => {
    if (!active) { return; }

    socket.emit('playCard', card);
  };

  return (
    <div className='player-view'>
      <h3>{player.name}{active && '*'}</h3>
      {
        player.discardPile && player.discardPile.map(
          discardCard => <Card card={discardCard} isDiscard={true}/>
        )
      }
      {
        player.hand && player.hand.map(
          card => <Card card={card} handleClick={handleClick}/>
        )
      }
    </div>
  );
}

export default PlayerView;
