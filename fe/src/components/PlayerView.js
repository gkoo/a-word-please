import React from 'react';
import { useSelector } from 'react-redux';

import Card from './Card';
import {
  activePlayerIdSelector,
  currPlayerIdSelector,
  socketSelector,
} from '../store/selectors';

function PlayerView({ player, active, allPlayers }) {
  const activePlayerId = useSelector(activePlayerIdSelector);
  const currPlayerId = useSelector(currPlayerIdSelector);
  const socket = useSelector(socketSelector);

  const handleClick = ({ card, effectData }) => {
    if (!active) { return; }

    socket.emit('playCard', { card, effectData });
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
          card => (
            <Card
              allPlayers={allPlayers}
              card={card}
              clickable={activePlayerId === currPlayerId}
              clickCallback={handleClick}
              currPlayerId={currPlayerId}
              isDiscard={false}
            />
          )
        )
      }
    </div>
  );
}

export default PlayerView;
