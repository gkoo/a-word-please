import React from 'react';

function Card({ card, isDiscard, handleClick }) {
  const classNames = ['card'];
  if (isDiscard) {
    classNames.push('discard');
  }

  return (
    <div className={classNames.join(' ')} onClick={() => handleClick(card)}>
      <h3>{card}</h3>
    </div>
  );
}

export default Card;
