import React from 'react';
import { useSelector } from 'react-redux';
import cx from 'classnames';

import Button from 'react-bootstrap/Button';
import Table from 'react-bootstrap/Table';

import { DECEPTION_ROLE_LABELS, ROLE_MURDERER } from '../../constants';
import {
  gameDataSelector,
  murdererSelector,
  playersSelector,
  socketSelector,
} from '../../store/selectors';

function GameEndView() {
  const gameData = useSelector(gameDataSelector);
  const players = useSelector(playersSelector);
  const socket = useSelector(socketSelector);

  const onNewGame = () => socket.emit('playerAction', { action: 'newGame' });

  return (
    <>
      {
        gameData.accusationResult &&
          <h1>Investigators win!</h1>
      }
      {
        !gameData.accusationResult &&
          <h1>Murderer wins!</h1>
      }
      <Table className='table-borderless'>
        <tbody>
          {
            Object.values(players).map(player =>
              <tr className={cx({ 'table-danger': player.role === ROLE_MURDERER})}>
                <td>
                  {player.name}
                </td>
                <td>
                  {DECEPTION_ROLE_LABELS[player.role]}
                </td>
              </tr>
            )
          }
        </tbody>
      </Table>

      <div className='text-center mt-5'>
        <Button onClick={onNewGame}>
          New Game
        </Button>
      </div>
    </>
  );
}

export default GameEndView;
