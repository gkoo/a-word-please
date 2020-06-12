import React from 'react';

function PlayerLabel({ player }) {
  return (
    <span className={`player-label text-center ml-1 ${player.color}`}>{player.name}</span>
  );
}

export default PlayerLabel;
