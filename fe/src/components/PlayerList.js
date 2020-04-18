import React from 'react';

function PlayerList({ players }) {
  return (
    <>
      <h3>Players</h3>
      <ul>
        {
          Object.values(players).map(playerData => {
            return playerData.name && (
              <li>{playerData.name} {playerData.isLeader && '(L)'}</li>
            )
          })
        }
      </ul>
    </>
  );
};

export default PlayerList;
