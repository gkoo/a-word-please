import React from 'react';

function Card({ card, isDiscard }) {
  const classNames = ['card'];
  if (isDiscard) {
    classNames.push('discard');
  }

  return (
    <div className={classNames.join(' ')}>
      <h3>{card}</h3>
    </div>
  );
}

export default Card;
