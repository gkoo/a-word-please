import React from 'react';

function BrushColorLabels({ players }) {
  return (
    <div className='text-center'>
      {
        players.map(player =>
          <p>
            <span className='sf-artist-player-dot' style={{color: player.brushColor}}>● </span>
            {player.name}
          </p>
        )
      }
    </div>
  );
}

export default BrushColorLabels;
