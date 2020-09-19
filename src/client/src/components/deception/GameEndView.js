import React from 'react';
import { useSelector } from 'react-redux';
import cx from 'classnames';

import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Table from 'react-bootstrap/Table';

import BackToLobbyButton from '../common/BackToLobbyButton';
import GuessWitnessView from './GuessWitnessView';
import PlayerGroupView from './PlayerGroupView';
import {
  Role,
  RoleLabels,
} from '../../constants/deception';
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
              <tr className={cx({ 'table-danger': player.role === Role.Murderer})}>
                <td>
                  {player.name}
                </td>
                <td>
                  {RoleLabels[player.role]}
                </td>
              </tr>
            )
          }
        </tbody>
      </Table>

      <div className='text-center my-5'>
        <ButtonGroup>
          <Button onClick={onNewGame}>
            New Game
          </Button>
          <BackToLobbyButton/>
        </ButtonGroup>
      </div>

      <PlayerGroupView showRoles={true} showAccuseButtons={false} showMethodAndEvidence={true} />
    </>
  );
}

export default GameEndView;
