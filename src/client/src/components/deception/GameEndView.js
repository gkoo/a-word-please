import React from 'react';
import { useSelector } from 'react-redux';
import cx from 'classnames';

import Button from 'react-bootstrap/Button';
import Table from 'react-bootstrap/Table';

import GuessWitnessView from './GuessWitnessView';
import PlayerGroupView from './PlayerGroupView';
import { DECEPTION_ROLE_LABELS, ROLE_MURDERER } from '../../constants';
import {
  gameDataSelector,
  playersSelector,
  socketSelector,
  witnessSelector,
} from '../../store/selectors';

function GameEndView() {
  const gameData = useSelector(gameDataSelector);
  const players = useSelector(playersSelector);
  const socket = useSelector(socketSelector);
  const witness = useSelector(witnessSelector);

  const onNewGame = () => socket.emit('startGame');

  if (witness && gameData.accusationResult) {
    // Time for murderer to guess who the witness is
    return <GuessWitnessView />;
  }

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

      <div className='text-center my-5'>
        <Button onClick={onNewGame}>
          New Game
        </Button>
      </div>

      <PlayerGroupView showRoles={true} showAccuseButtons={false} />
    </>
  );
}

export default GameEndView;
