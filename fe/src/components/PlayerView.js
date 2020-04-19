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

  const renderTokens = () => {
    const tokens = [];
    for (let i=0; i < player.numTokens; ++i) {
      tokens.push('❤️');
    }
    return tokens.join('');
  };

  return (
    <div className='player-view'>
      <div className='player-name'>
        <h3>{player.name}{active && '*'}</h3>
        <p>{renderTokens()}</p>
      </div>
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
