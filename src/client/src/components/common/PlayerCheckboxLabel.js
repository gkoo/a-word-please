import React from 'react';

function PlayerCheckboxLabel({ className, checked, player }) {
  return (
    <div className={`checkbox-label player-label text-center mx-1 ${player.color}`}>
      {checked && <span className='checkbox-label-check'>✅</span>}
      <span>{player.name}</span>
    </div>
  );
}

export default PlayerCheckboxLabel;
