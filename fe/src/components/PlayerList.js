import React from 'react';

import { useSelector } from 'react-redux';

function PlayerList({ players }) {
  return (
    <>
      <h3>Players</h3>
      <ul>
        {
          Object.values(players).map(
            playerData => playerData.name && <li>{playerData.name}</li>
          )
        }
      </ul>
    </>
  );
};

export default PlayerList;
