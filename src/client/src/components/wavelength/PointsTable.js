import React from 'react';
import { useSelector } from 'react-redux';

import Table from 'react-bootstrap/Table';

import { gameDataSelector, } from '../../store/selectors';

function PointsTable({ highlightPlayerId }) {
  const gameData = useSelector(gameDataSelector);

  if (!gameData) { return false; }

  const { players, pointsForPlayer } = gameData;

  const playersSortedByPoints = Object.values(players).sort((player1, player2) => {
    const player1Points = pointsForPlayer[player1.id] || 0;
    const player2Points = pointsForPlayer[player2.id] || 0;
    return player2Points - player1Points;
  });

  return (
    <Table size='sm' className='text-center'>
      <tbody>
        {
          playersSortedByPoints.map(player =>
            <tr key={player.id} className={highlightPlayerId === player.id ? 'text-success' : ''}>
              <td>{player.name}</td>
              <td>{pointsForPlayer[player.id] || 0}</td>
            </tr>
          )
        }
      </tbody>
    </Table>
  );
}

export default PointsTable;
