import React from 'react';

function BrushColorLabels({ connectedPlayers }) {
  return (
    <div>
      <br/>
      <h3>Here are your brush colors!</h3>
      {
      	connectedPlayers.filter(player => player.connected).map(player =>
	      	<span key={player.id} style={{backgroundColor: 'white'}}>
	        	<span style={{color: player.brushColor}}>●</span>
	        	<span style={{color: 'black'}}>: {player.name} </span>
	      	</span>
	    	)
      }
    </div>
  );
}

export default BrushColorLabels;
